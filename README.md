# Salesforce Interview Prep

Independent, source-grounded interview handbook for Salesforce platform concepts.

**Not produced, sponsored, or endorsed by Salesforce.** Product names appear as ordinary educational references. This site does not use official Salesforce logos or Trailhead assets.

148 modules: terminology, lessons with Mermaid decision diagrams, flashcards, MCQs, interview answers, and cheat sheets. Progress is stored in your browser only.

## Local

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Production build (GitHub Pages)

```bash
npm run build
```

Static files land in `out/`.

GitHub Pages uses `.github/workflows/pages.yml`. After you create the GitHub repository named `Salesforce-Interview-Prep`:

1. Push `main`.
2. Repo Settings → Pages → Source: **GitHub Actions**.

The workflow sets `NEXT_PUBLIC_BASE_PATH=/Salesforce-Interview-Prep`. If your repo name differs, change that env var to match.

## What’s in this repo

| Path | Purpose |
| --- | --- |
| `content/` | Curriculum + topic JSON (the lessons) |
| `src/` | Next.js App Router UI |
| `.github/workflows/pages.yml` | Pages deploy |

No Python factory, Hermes, or generated `dist/` HTML.
