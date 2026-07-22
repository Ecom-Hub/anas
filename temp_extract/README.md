# Anas Qureshi — Personal Site

React + Vite site with a portfolio section and a "Free Tools" section (28 browser-based
file/image/PDF/dev utilities — no server, everything runs on the visitor's device).

## Local development
```
npm install
npm run dev
```

## Add your photo
Drop a photo named `profile.jpg` into the `public/` folder before deploying — it fills the
hero photo slot automatically. Without it, a placeholder monogram shows instead.

## Deploy to GitHub Pages
This repo includes a GitHub Actions workflow (`.github/workflows/deploy.yml`) that builds and
deploys automatically on every push to `main`. One-time setup:

1. Push this project to your `ecom-hub/anas` repo (replacing everything currently there).
2. In the repo, go to **Settings → Pages → Source** and select **GitHub Actions**.
3. Push to `main` — the workflow builds the site and publishes it to
   `https://ecom-hub.github.io/anas/` automatically.

No manual `npm run build` or committing a `dist` folder needed — the Action handles it.
