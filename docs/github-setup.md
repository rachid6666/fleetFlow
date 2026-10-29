# GitHub setup

The prepared source is ready to publish as a new repository named `fleetflow` (or another available name you choose).

## GitHub CLI

```bash
gh auth login
gh repo create fleetflow --private --source . --remote origin --push
```

Use `--public` only if the repository is intended to be public. Before publishing, verify that `.env` and customer data are ignored.

## Manual fallback

1. Create an empty repository in the intended GitHub account.
2. Add it as `origin`.
3. Commit the files in this folder and push the default branch.

The GitHub account and repository visibility are intentionally not hard-coded into the project so the same starter can be reused across accounts.
