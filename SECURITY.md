# Security Policy

Thank you for helping keep **StarryBio** and its users secure. We appreciate responsible vulnerability reports and will work with security researchers to investigate and address valid issues.

## Supported Versions

Security updates are provided for the current **StarryBio v3** release series.

| Version         | Supported |
| :-------------- | :-------: |
| 3.x             |    ✅     |
| 2.x and earlier |    ❌     |

Security fixes are released in the latest stable v3 release and may not be backported to older v3 releases. Users should therefore update to the latest available version of StarryBio v3.

## Reporting a Vulnerability

**Please do not report security vulnerabilities through public GitHub issues, discussions, pull requests, or other public channels.**

### GitHub Private Vulnerability Reporting

The preferred reporting method is **GitHub Private Vulnerability Reporting**:

1. Open the repository's **Security** tab.
2. Select **Report a vulnerability**.
3. Provide the vulnerability details and submit the report.

This allows the vulnerability to be discussed and resolved privately through GitHub.

### Email

If you cannot use GitHub Private Vulnerability Reporting, email:

**[security@a9x.pro](mailto:security@a9x.pro)**

Please include `StarryBio` and `vulnerability` in the subject line.

For example:

`StarryBio vulnerability: Stored XSS in custom links`

## What to Include

Please provide enough information for us to understand and reproduce the issue. When possible, include:

- A description of the vulnerability and its potential impact.
- The affected StarryBio version, commit, or branch.
- Steps to reproduce the vulnerability.
- A minimal proof of concept, if applicable.
- Any configuration required to reproduce the issue.
- Suggested mitigations or fixes, if known.

If you are unsure whether an issue has security implications, report it privately and we will evaluate it.

## Scope

This policy covers security vulnerabilities caused by code or configuration provided by **StarryBio**, including its build and deployment-related functionality.

Vulnerabilities that exist solely within third-party platforms, services, dependencies, or hosting providers should generally be reported to the affected third party instead.

Dependency vulnerabilities that create an exploitable security issue specifically in StarryBio are still appropriate to report.

## What to Expect

We aim to acknowledge security reports within **48 hours or 2 business days**.

After acknowledgment, we will investigate the report and may contact you for additional information. If the vulnerability is confirmed, we will work toward a fix and determine the affected versions and appropriate disclosure process.

Resolution time depends on the severity and complexity of the issue, so we cannot guarantee a specific remediation timeframe.

If you report a vulnerability by email and have not received an acknowledgment within **7 days**, please follow up at **[security@a9x.pro](mailto:security@a9x.pro)**.

## Coordinated Disclosure

Please keep vulnerability details confidential while we investigate and address the issue.

Once a fix is available, we may publish a **GitHub Security Advisory**, release notes, or another security notice describing the vulnerability and affected versions.

We will coordinate public disclosure with the reporter when appropriate and are happy to provide credit unless the reporter prefers to remain anonymous.

## Responsible Research and Safe Harbor

We consider good-faith security research conducted in accordance with this policy to be authorized.

When conducting security research:

- Make a good-faith effort to avoid harming users, data, or services.
- Access only the minimum data necessary to demonstrate a vulnerability.
- Do not intentionally access, modify, retain, or disclose data belonging to others.
- Do not perform denial-of-service, social-engineering, phishing, or other disruptive attacks.
- Stop testing and contact us if you unexpectedly encounter sensitive data or cause unintended impact.

For research conducted in good faith and consistent with this policy, we will not initiate legal action against you for the research.

This authorization applies only to systems and software for which we have the authority to grant permission. It does not authorize testing of third-party services or infrastructure.
