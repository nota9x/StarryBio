export const UPDATE_MANIFEST_SCHEMA = 1;
export const UPDATE_STATE_SCHEMA = 1;
export const PROJECT_ID = 'starrybio';

export const TRUST_POLICY = {
  owner: 'nota9x',
  repository: 'StarryBio',
  repositoryFullName: 'nota9x/StarryBio',
  repositoryId: 1_040_423_699,
  oidcIssuer: 'https://token.actions.githubusercontent.com',
  signerIdentities: [
    '^https://github\\.com/nota9x/StarryBio/\\.github/workflows/release-please\\.yml@refs/heads/main$',
  ],
  provenancePredicate: 'https://slsa.dev/provenance/v1',
  releasePredicate: 'https://in-toto.io/attestation/release/v0.2',
} as const;

export interface GitHubAsset {
  browser_download_url: string;
  digest: string | null;
  id: number;
  name: string;
  size: number;
  state: string;
}

export interface GitHubRelease {
  assets: GitHubAsset[];
  draft: boolean;
  id: number;
  immutable: boolean;
  prerelease: boolean;
  published_at: string | null;
  tag_name: string;
}

export interface ManifestFile {
  mode: number;
  path: string;
  sha256: string;
  size: number;
}

export interface ManifestRename {
  from: string;
  to: string;
}

export interface UpdateManifest {
  commit: string;
  files: ManifestFile[];
  generatedAt: string;
  project: typeof PROJECT_ID;
  renames: ManifestRename[];
  schemaVersion: typeof UPDATE_MANIFEST_SCHEMA;
  tag: string;
  version: string;
}

export interface UpdaterState {
  assetDigest: string;
  assetName: string;
  commit: string;
  installedVersion: string;
  releaseId: number;
  repositoryId: number;
  provenanceBundleDigest: string;
  releaseBundleDigest: string;
  schemaVersion: typeof UPDATE_STATE_SCHEMA;
  signerIdentity: string;
  tag: string;
  verifiedAt: string;
}

export interface VerificationEvidence {
  provenanceBundleDigest: string;
  releaseBundleDigest: string;
  signerIdentity: string;
}

export interface PreparedRelease {
  archivePath: string;
  asset: GitHubAsset;
  commit: string;
  manifest: UpdateManifest;
  payloadDirectory: string;
  release: GitHubRelease;
  version: string;
  verification: VerificationEvidence;
}

export interface ConflictRecord {
  path: string;
  reason: string;
  base?: Buffer;
  incoming?: Buffer;
  local?: Buffer;
}

export interface UpdateStats {
  added: string[];
  configAdded: string[];
  configRemoved: string[];
  configRewrittenAssets: string[];
  merged: string[];
  removed: string[];
  renamed: Array<{ from: string; to: string }>;
  updated: string[];
}
