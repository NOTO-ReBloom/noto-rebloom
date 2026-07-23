# GitHub update instructions — public 2.0 to 2.18

## Recommended method

1. Download the public update ZIP.
2. Extract it locally.
3. Open the extracted folder `UPLOAD_TO_REPOSITORY_ROOT`.
4. Copy the **contents** of that folder into the root of the `fourth-bedroom` repository.
5. Replace the existing `site/`, `.github/workflows/deploy-pages.yml`, and validation scripts.
6. Commit all changes to `main`.
7. Open GitHub → Actions → `Deploy GitHub Pages` and confirm a green check.
8. Open `https://noto-rebloom.github.io/fourth-bedroom/version.json`.
9. Confirm that it reports version `2.18.0`.
10. Open the game and force reload once.

Do not upload the ZIP itself. Do not place `UPLOAD_TO_REPOSITORY_ROOT` as another nested folder in the repository.

## Expected repository structure

```text
fourth-bedroom/
├─ .github/
│  └─ workflows/
│     └─ deploy-pages.yml
├─ scripts/
│  ├─ validate-site.mjs
│  └─ validate-site-v218.mjs
└─ site/
   ├─ index.html
   ├─ styles.css
   ├─ game.js
   ├─ service-worker.js
   ├─ version.json
   ├─ data/
   └─ assets/
```

## Validation command

```bash
node scripts/validate-site-v218.mjs
```
