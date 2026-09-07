import ts from 'typescript';

interface SourceObject {
  node: ts.ObjectLiteralExpression;
  sourceFile: ts.SourceFile;
  text: string;
}

interface TextEdit {
  end: number;
  start: number;
  text: string;
}

export interface ConfigMigrationResult {
  added: string[];
  contents: string;
  removed: string[];
  rewrittenAssets: string[];
}

function unwrap(expression: ts.Expression): ts.Expression {
  if (ts.isSatisfiesExpression(expression) || ts.isAsExpression(expression))
    return unwrap(expression.expression);
  if (ts.isParenthesizedExpression(expression)) return unwrap(expression.expression);
  return expression;
}

function parseConfig(text: string, name: string): SourceObject {
  const sourceFile = ts.createSourceFile(
    name,
    text,
    ts.ScriptTarget.Latest,
    true,
    ts.ScriptKind.TS
  );
  const parseDiagnostics = (
    sourceFile as ts.SourceFile & { parseDiagnostics: readonly ts.Diagnostic[] }
  ).parseDiagnostics;
  if (parseDiagnostics.length > 0) {
    throw new Error(`${name} contains invalid TypeScript syntax.`);
  }
  for (const statement of sourceFile.statements) {
    if (!ts.isVariableStatement(statement)) continue;
    for (const declaration of statement.declarationList.declarations) {
      if (
        !ts.isIdentifier(declaration.name) ||
        declaration.name.text !== 'config' ||
        !declaration.initializer
      )
        continue;
      const value = unwrap(declaration.initializer);
      if (ts.isObjectLiteralExpression(value)) return { node: value, sourceFile, text };
    }
  }
  throw new Error(`${name} does not contain a static config object.`);
}

function propertyName(property: ts.ObjectLiteralElementLike): string | undefined {
  if (!ts.isPropertyAssignment(property)) return undefined;
  if (
    ts.isIdentifier(property.name) ||
    ts.isStringLiteral(property.name) ||
    ts.isNumericLiteral(property.name)
  ) {
    return property.name.text;
  }
  return undefined;
}

function properties(node: ts.ObjectLiteralExpression): Map<string, ts.PropertyAssignment> {
  const result = new Map<string, ts.PropertyAssignment>();
  for (const property of node.properties) {
    const name = propertyName(property);
    if (name !== undefined && ts.isPropertyAssignment(property)) result.set(name, property);
  }
  return result;
}

function hasDynamicSyntax(node: ts.ObjectLiteralExpression): boolean {
  return node.properties.some((property) => propertyName(property) === undefined);
}

function objectValue(property: ts.PropertyAssignment): ts.ObjectLiteralExpression | undefined {
  const value = unwrap(property.initializer);
  return ts.isObjectLiteralExpression(value) ? value : undefined;
}

function lineIndent(text: string, position: number): string {
  const start = text.lastIndexOf('\n', Math.max(0, position - 1)) + 1;
  return /^\s*/.exec(text.slice(start, position))?.[0] ?? '';
}

function propertyWithComments(source: SourceObject, property: ts.PropertyAssignment): string {
  const ranges = ts.getLeadingCommentRanges(source.text, property.getFullStart()) ?? [];
  const commentStart = ranges.length > 0 ? ranges[0].pos : property.getStart(source.sourceFile);
  let value = source.text.slice(commentStart, property.end).trim();
  if (!value.endsWith(',')) value += ',';
  return value;
}

function reindent(value: string, indent: string): string {
  const lines = value.split(/\r?\n/);
  const common = Math.min(
    ...lines.filter((line) => line.trim()).map((line) => /^\s*/.exec(line)?.[0].length ?? 0)
  );
  return lines.map((line) => (line.trim() ? indent + line.slice(common) : line)).join('\n');
}

function removalRange(
  object: ts.ObjectLiteralExpression,
  property: ts.PropertyAssignment
): { start: number; end: number } {
  const all = [...object.properties];
  const index = all.indexOf(property);
  const start = property.getFullStart();
  if (index + 1 < all.length) return { start, end: all[index + 1].getFullStart() };
  const prior = index > 0 ? all[index - 1] : undefined;
  if (prior) return { start: prior.end, end: property.end };
  return { start, end: property.end };
}

function applyEdits(text: string, edits: TextEdit[]): string {
  return edits
    .map((edit, index) => ({ ...edit, index }))
    .sort((a, b) => b.start - a.start || b.end - a.end || b.index - a.index)
    .reduce(
      (current, edit) => current.slice(0, edit.start) + edit.text + current.slice(edit.end),
      text
    );
}

export function migrateConfig(
  baseText: string,
  localText: string,
  incomingText: string,
  assetRewrites: ReadonlyMap<string, string> = new Map()
): ConfigMigrationResult {
  const base = parseConfig(baseText, 'installed release config');
  const local = parseConfig(localText, 'local config');
  const incoming = parseConfig(incomingText, 'incoming release config');
  const edits: TextEdit[] = [];
  const added: string[] = [];
  const removed: string[] = [];
  const rewrittenAssets: string[] = [];

  const visit = (
    baseObject: ts.ObjectLiteralExpression,
    localObject: ts.ObjectLiteralExpression,
    incomingObject: ts.ObjectLiteralExpression,
    keyPath: string
  ) => {
    const baseProperties = properties(baseObject);
    const localProperties = properties(localObject);
    const incomingProperties = properties(incomingObject);
    const changes =
      [...baseProperties.keys()].some((key) => !incomingProperties.has(key)) ||
      [...incomingProperties.keys()].some((key) => !baseProperties.has(key));
    if (changes && hasDynamicSyntax(localObject)) {
      throw new Error(
        `Config object ${keyPath || '<root>'} uses dynamic syntax and cannot be migrated safely.`
      );
    }

    for (const [key, baseProperty] of baseProperties) {
      const incomingProperty = incomingProperties.get(key);
      const localProperty = localProperties.get(key);
      const fullKey = keyPath ? `${keyPath}.${key}` : key;
      if (!incomingProperty) {
        if (localProperty) {
          const range = removalRange(localObject, localProperty);
          edits.push({ ...range, text: '' });
          removed.push(fullKey);
        }
        continue;
      }
      if (!localProperty) {
        const baseChild = objectValue(baseProperty);
        const incomingChild = objectValue(incomingProperty);
        if (
          baseChild &&
          incomingChild &&
          JSON.stringify([...properties(baseChild).keys()]) !==
            JSON.stringify([...properties(incomingChild).keys()])
        ) {
          throw new Error(
            `Config property ${fullKey} was removed locally and cannot receive new options.`
          );
        }
        continue;
      }
      const baseChild = objectValue(baseProperty);
      const localChild = objectValue(localProperty);
      const incomingChild = objectValue(incomingProperty);
      if (baseChild && incomingChild) {
        if (!localChild) {
          const nestedChanged =
            JSON.stringify([...properties(baseChild).keys()]) !==
            JSON.stringify([...properties(incomingChild).keys()]);
          if (nestedChanged) throw new Error(`Config property ${fullKey} is not a static object.`);
        } else {
          visit(baseChild, localChild, incomingChild, fullKey);
        }
      }
    }

    const incomingOrder = [...incomingObject.properties]
      .map(propertyName)
      .filter((key): key is string => key !== undefined);
    for (const key of incomingOrder) {
      if (baseProperties.has(key) || localProperties.has(key)) continue;
      const incomingProperty = incomingProperties.get(key)!;
      const fullKey = keyPath ? `${keyPath}.${key}` : key;
      const index = incomingOrder.indexOf(key);
      const following = incomingOrder
        .slice(index + 1)
        .map((candidate) => localProperties.get(candidate))
        .find(Boolean);
      const childIndent = following
        ? lineIndent(local.text, following.getStart(local.sourceFile))
        : `${lineIndent(local.text, localObject.getStart(local.sourceFile))}  `;
      const rendered = reindent(propertyWithComments(incoming, incomingProperty), childIndent);
      if (following) {
        edits.push({
          end: following.getFullStart(),
          start: following.getFullStart(),
          text: `${rendered}\n`,
        });
      } else {
        const insertion = localObject.properties.end;
        const prefix = localObject.properties.length > 0 ? '\n' : '\n';
        const parentIndent = lineIndent(local.text, localObject.getStart(local.sourceFile));
        edits.push({
          end: insertion,
          start: insertion,
          text: `${prefix}${rendered}\n${parentIndent}`,
        });
      }
      added.push(fullKey);
    }
  };

  visit(base.node, local.node, incoming.node, '');

  const assetVisit = (node: ts.Node) => {
    if (ts.isStringLiteralLike(node)) {
      const replacement = assetRewrites.get(node.text);
      if (replacement) {
        const start = node.getStart(local.sourceFile);
        if (
          edits.some(
            (edit) => edit.start !== edit.end && edit.start <= start && edit.end >= node.end
          )
        ) {
          return;
        }
        const quote = local.text[node.getStart(local.sourceFile)];
        edits.push({
          start,
          end: node.end,
          text: `${quote}${replacement}${quote}`,
        });
        rewrittenAssets.push(node.text);
      }
    }
    ts.forEachChild(node, assetVisit);
  };
  assetVisit(local.node);

  const contents = applyEdits(localText, edits);
  parseConfig(contents, 'migrated config');
  return {
    contents,
    added,
    removed,
    rewrittenAssets,
  };
}
