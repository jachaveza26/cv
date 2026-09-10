# CV site — design

**Date:** 2026-09-10
**Owner:** Andrés Chávez
**Status:** approved in conversation, pending written review

## Goal

A single-page personal CV website at `https://andres.streamlite.ca`, in English only, that presents Andrés Chávez as an AI & Automation Engineer to recruiters and hiring managers in Canada and the US. It shows profile, experience, selected projects, hard and soft skills, education and languages, and offers a PDF download that is generated from the same source as the page.

The site complements, and does not duplicate, the engineering portfolio at `https://github.com/jachaveza26/portfolio`. Case studies stay there; the site links to them.

## Decisions already made

| Topic | Decision |
|---|---|
| URL | `andres.streamlite.ca`, subdomain of the Streamlite domain (DNS at GoDaddy, `domaincontrol.com` nameservers) |
| Language | English only |
| Positioning | "AI & Automation Engineer". Six years of data analytics (Power BI, DAX, SQL) presented as foundation, not identity |
| Display name | "Andrés Chávez" |
| Public contact | `andres@streamlite.ca` and LinkedIn (`linkedin.com/in/jachaveza`). GitHub (`github.com/jachaveza26`). **No phone number.** |
| Photo | `streamlite-website/public/home/assets/andres-chavez.jpg` (900×1200 JPEG), copied into this repo |
| Employment gap | Jan 2025 to present = "Founder & AI/Automation Engineer, Streamlite Technologies, Chilliwack BC". Bullets derived from the portfolio case studies |
| Camosun College | Business Analyst Certificate, completed 18 March 2025 |
| Approach | Static single page, no framework. Content in one JSON file, ~100-line Node build script with no runtime dependencies |
| Hosting | GitHub Pages from a public repo `jachaveza26/cv`, deployed by GitHub Actions |
| PDF | Generated in CI by headless Chromium from the print stylesheet, Letter size |

## Content sources and rules

- **Source of truth for pre-2025 experience and education:** `Resume_JAndresChavez.pdf` (kept in the parent folder `portfolio-jachaveza26/`, never committed).
- **Source of truth for 2025 to present and for projects:** the case studies in `jachaveza26/portfolio` and its README.
- **Nothing is invented.** No employer, date, metric, project or claim that is not in one of those two sources. Overlapping employment dates in 2021 and 2022 are kept as they appear on the CV.
- **Soft skills** are named and each carries one line of evidence drawn from a case study (client discovery and scoping, pricing and proposals, end-to-end delivery without a team, honest status reporting, presenting to different audiences, bilingual delivery, attention to detail, stakeholder engagement).
- The complete `content/cv.json` is shown to Andrés for line-by-line approval before the first deploy. Wording of bullets is his decision.

## Repository layout

```text
cv/
  content/cv.json              all content, single source of truth
  content/cv.schema.json       JSON Schema used by the build and the tests
  src/build.mjs                Node (no dependencies): cv.json → dist/index.html, copies css + assets + CNAME
  src/styles.css               screen styles + @media print
  assets/andres-chavez.jpg     original photo
  assets/andres-chavez-400.webp  resized for the page (generated once, committed)
  assets/og-image.png          1200×630 Open Graph image (generated once, committed)
  scripts/pdf.mjs              Playwright: dist/index.html (print media) → dist/Andres-Chavez-CV.pdf
  test/build.test.mjs          node:test suite (see Quality)
  .github/workflows/deploy.yml build → test → html-validate → lychee → pdf → deploy to Pages
  docs/superpowers/specs/      this document
  package.json                 devDependencies only: playwright, html-validate
  README.md                    what this is, how to build, workflow badge
  .gitignore                   dist/, node_modules/
```

`dist/` is never committed. `CNAME` is written into `dist/` by the build so Pages keeps the custom domain across deploys.

## Content model (`cv.json`)

```json
{
  "identity": { "name", "title", "tagline", "location", "email", "linkedin", "github", "photo" },
  "profile": ["paragraph", "paragraph"],
  "experience": [
    { "role", "org", "location", "start": "YYYY-MM", "end": "YYYY-MM" | null,
      "summary", "bullets": [], "links": [{ "label", "url" }], "compact": false }
  ],
  "projects": [ { "name", "oneLiner", "stack": [], "status", "url" } ],
  "skills": {
    "hard": [ { "group", "items": [] } ],
    "soft": [ { "name", "evidence" } ]
  },
  "education": [ { "credential", "institution", "country", "year" } ],
  "certifications": [ { "credential", "institution", "completed": "YYYY-MM-DD" } ],
  "languages": [ { "language", "level" } ]
}
```

- `end: null` renders as "Present".
- `compact: true` renders the entry as two lines (role, org, dates, one-line summary) with no bullets. Used for LANIX (2009–2013) and Desarrollos y Servicios Computacionales (2013–2020).
- The build validates `cv.json` against `cv.schema.json` and exits non-zero on any missing required field or wrong type.

## Page structure

Single page, sticky anchor navigation: **About · Experience · Projects · Skills · Education**.

1. **Header.** Photo, name, title, one-line tagline, location, four actions: Email, LinkedIn, GitHub, Download PDF.
2. **About.** Two or three short paragraphs from `profile`.
3. **Experience.** Vertical timeline, newest first. Streamlite entry on top with bullets grouped by project and links to the case studies. Fernando Torres Immigration and the five Mexico roles (Agile Thought, Conduent, PSM Payment Services, ZMBDi) with their CV bullets. LANIX and DSC as compact entries.
4. **Projects.** Grid of eleven cards: name, one-liner, stack chips, status, link to the case study on GitHub. Content taken from the portfolio README table.
5. **Skills.** Hard skills in the same groups as the portfolio README's Stack block (Languages, AI/LLM, Backend, Frontend, Data/BI, Infra, Quality, Security). Soft skills as a list, each with its one line of evidence.
6. **Education.** Degrees, certifications with dates, languages.
7. **Footer.** Email, LinkedIn, GitHub, link to the portfolio repo, "Last updated" date taken from the build.

## Visual direction

Restrained editorial style. One typeface: the system font stack (no external font requests, nothing to load before the text renders). Generous whitespace, clear hierarchy, no decorative animation. Light and dark palettes via `prefers-color-scheme`, defined as CSS custom properties. Mobile-first layout; the projects grid collapses to one column under 640px. Color contrast meets WCAG AA. Semantic HTML: `header`, `nav`, `main`, `section` with headings, `article` per experience entry, `img` with meaningful `alt`.

## Print / PDF

`@media print` hides the navigation and footer, shrinks the photo, forces light palette, keeps link URLs visible for the key links (email, LinkedIn, GitHub, portfolio), and sets page breaks so the result is two Letter pages. `scripts/pdf.mjs` launches Chromium through Playwright, opens `dist/index.html` with `media: print`, and writes `dist/Andres-Chavez-CV.pdf`. The header's Download PDF button links to that file. CI fails if the PDF is not produced or exceeds three pages.

## SEO and metadata

`<title>`, meta description, canonical `https://andres.streamlite.ca/`, Open Graph and Twitter card tags with `og-image.png`, and a JSON-LD `Person` block with name, job title, location, `sameAs` LinkedIn and GitHub. `robots` allowed. No analytics, no cookies, therefore no consent banner.

## Build and deploy

`deploy.yml`, triggered on push to `main` and manually:

1. Checkout, setup Node 22.
2. `npm ci`.
3. `node src/build.mjs` → `dist/`.
4. `node --test` (tests below).
5. `npx html-validate dist/index.html`.
6. `lychee --accept 200,206,403,429,999 dist/index.html` (same list as the portfolio workflow; LinkedIn answers 999 to bots).
7. `npx playwright install --with-deps chromium` and `node scripts/pdf.mjs`.
8. Upload `dist/` and deploy with `actions/deploy-pages`.

Local development: `npm run build && npx serve dist` or open `dist/index.html` directly. `npm run pdf` regenerates the PDF locally.

## Quality

`test/build.test.mjs` with `node:test`:

- `cv.json` validates against the schema.
- The build produces `dist/index.html`, `dist/styles.css`, `dist/CNAME`, and the photo.
- Every `href` in the generated HTML that starts with `#` matches an element `id`.
- Every project card links to `https://github.com/jachaveza26/portfolio/blob/main/projects/<file>.md`.
- Experience entries render newest first and `end: null` renders as "Present".
- No phone number pattern appears anywhere in `dist/`.

Plus html-validate and lychee in CI. Workflow badge in `README.md`.

## Error handling

- Missing or malformed content: build exits non-zero with the schema error; nothing deploys.
- Dead link: lychee fails the job; the previous deploy stays live.
- PDF generation failure: job fails; the previous deploy stays live.
- Pages/DNS misconfiguration: the site still serves at `jachaveza26.github.io/cv` until the CNAME resolves.

## DNS and Pages setup (manual, Andrés)

1. Create the public repo `jachaveza26/cv` (empty, as with the other two).
2. In GoDaddy DNS for `streamlite.ca`: add `CNAME andres → jachaveza26.github.io`.
3. In the repo Settings → Pages: source "GitHub Actions". Custom domain `andres.streamlite.ca`, enforce HTTPS once the certificate is issued.

## Git rules for this repo

Same as the other two: no force push, no history rewriting, no `Co-Authored-By` trailer, nothing pushed without explicit approval, and `Resume_JAndresChavez.pdf` and `COMO-PUBLICAR.md` never enter a commit.

## Out of scope

Case studies rendered inside the site, contact form, Spanish version, blog, analytics, multi-page routing, CMS.
