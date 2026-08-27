# Security policy

## Reporting a vulnerability

Please do not publish exploit details in a public issue before maintainers have
had a reasonable opportunity to investigate. Use the repository's private
security-reporting channel when one is configured.

Until a public hosting location and private reporting address are configured,
do not place secrets, credentials, private source code, or sensitive repository
content in a vulnerability report.

## Security model

AgentDocs is offline-first. Its deterministic core reads and writes repository
files requested by the user and does not require an AI provider or network
connection. `docs inspect` is read-only. Commands that initialize or manage
documentation mutate files inside the selected repository and validate
configured paths to prevent parent-directory traversal.
