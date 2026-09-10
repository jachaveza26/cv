[![checks](https://github.com/jachaveza26/cv/actions/workflows/checks.yml/badge.svg)](https://github.com/jachaveza26/cv/actions/workflows/checks.yml)

# andres.streamlite.ca

Personal CV site for Andrés Chávez. One JSON file in, one static page and one PDF out.

- Content: `content/cv.json`, validated against `content/cv.schema.json`.
- Build: `node src/build.mjs` → `dist/` (no dependencies beyond Node 22).
- PDF: `node scripts/pdf.mjs` prints the page with headless Chromium (Playwright).
- Deploy: Railway builds the `Dockerfile` (Playwright stage builds, Caddy serves).
- Case studies live in [jachaveza26/portfolio](https://github.com/jachaveza26/portfolio); this site links to them.

## Develop

```bash
npm install
npm run build && npm run serve
npm test
npx playwright install chromium && npm run pdf
docker build -t andres-cv . && docker run --rm -p 8080:8080 andres-cv
```
