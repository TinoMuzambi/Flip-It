# Security policy

## Supported version

The latest release on the `main` branch is supported.

## Reporting a vulnerability

Please use GitHub's private vulnerability reporting for this repository. Do not include sensitive data in a public issue.

## Data and trust boundaries

Flip-It has no server-side user accounts or data store. Decks stay in the browser's local storage unless a user explicitly exports a JSON file. Imported files are size-limited and structurally validated before use; imported strings are rendered as text by React, not as HTML.
