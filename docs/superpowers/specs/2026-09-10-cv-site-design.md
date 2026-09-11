# CV site — design

**Date:** 2026-09-10
**Owner:** Andrés Chávez
**Status:** implemented on branch `feat/cv-site`; pending content approval and publish

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
| Pre-2025 history (Andrés's decisions, 2026-09-10) | ZMBDi omitted. "PSM Payment Services" shown as Prosepago, part-time, Sep 2020 – Apr 2021, noting the 2025 re-engagement. Conduent kept as Apr 2021 – Aug 2021. Agile Thought Aug 2021 – Sep 2022 (5-month overlap with Fernando Torres Immigration kept as is). LANIX and DSC merged into one compact "Earlier career" entry. "Business tools" skills group dropped |
| Camosun College | Business Analyst Certificate, completed 18 March 2025 |
| Approach | Static single page, no framework. Content in one JSON file, ~100-line Node build script with no runtime dependencies |
| Hosting | Railway, static files served by Caddy from a multi-stage Dockerfile, in the same Railway account as `streamlite.ca`. Repo `jachaveza26/cv` on GitHub (public, for consistency with the portfolio; Railway does not require it). GitHub Actions is the quality gate; Railway deploys from `main` through its GitHub integration |
| PDF | Generated in CI by headless Chromium from the print stylesheet, Letter size, 9.5pt body, 0.5in/0.6in margins, two pages, cap of three. Print variant: featured projects only (one line each), `skills.pdf` groups, soft-skill names only |

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
  src/build.mjs                Node (no dependencies): cv.json → dist/index.html, copies css + assets
  src/styles.css               screen styles + @media print
  assets/andres-chavez.jpg     original photo
  assets/andres-chavez-400.webp  resized for the page (generated once, committed)
  assets/og-image.png          1200×630 Open Graph image (generated once, committed)
  assets/fonts/*.woff2         Fraunces (normal, italic) and Inter Tight latin subsets, self-hosted
  scripts/pdf.mjs              Playwright: dist/index.html (print media) → dist/Andres-Chavez-CV.pdf
  test/build.test.mjs          node:test suite (see Quality)
  .github/workflows/checks.yml build → test → html-validate → lychee → pdf (quality gate, no deploy)
  Dockerfile                   stage 1: Playwright image builds dist/ + PDF; stage 2: caddy:2-alpine serves dist/
  Caddyfile                    static file server, compression, cache headers, /Andres-Chavez-CV.pdf as attachment
  railway.json                 builder: DOCKERFILE, healthcheck path /
  docs/superpowers/specs/      this document
  package.json                 devDependencies only: playwright, html-validate
  README.md                    what this is, how to build, workflow badge
  .gitignore                   dist/, node_modules/
```

`dist/` is never committed. The Docker image is the deploy artifact: Railway builds it from the repo on every push to `main`.

## Content model (`cv.json`)

```json
{
  "identity": { "name", "title", "tagline", "location", "email", "linkedin", "github", "photo" },
  "profile": ["paragraph", "paragraph"],
  "experience": [
    { "role", "org", "location", "start": "YYYY-MM", "end": "YYYY-MM" | null,
      "summary", "bullets": [], "links": [{ "label", "url" }], "compact": false }
  ],
  "projects": [ { "name", "oneLiner", "stack": [], "status", "featured", "url" } ],
  "skills": {
    "hard": [ { "group", "items": [] } ],
    "pdf":  [ { "group", "items": [] } ],
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

Editorial style with presence, coherent with the Streamlite brand (same serif and blue, own paper tone). Two self-hosted typefaces committed as latin woff2 subsets in `assets/fonts/` (no external font requests): Fraunces for the name, section headings, the opening line and featured project names; Inter Tight for everything else. Self-hosting also makes the PDF identical on macOS and in the Linux build container. Full-width header (name, title and location, opening line in italic, actions, portrait), then a sticky section rail beside the content on desktop; experience as a dated timeline with dates in a left gutter; projects as featured rows plus a compact "Also built" list; one page-load reveal, no other motion. The only script on the page is a 15-line inline scroll-spy that marks the current section in the rail with `aria-current`; everything renders without it. Generous whitespace, clear hierarchy, no decorative animation. Light and dark palettes via `prefers-color-scheme`, defined as CSS custom properties. Mobile-first layout; the projects grid collapses to one column under 640px. Color contrast meets WCAG AA. Semantic HTML: `header`, `nav`, `main`, `section` with headings, `article` per experience entry, `img` with meaningful `alt`.

## Print / PDF

`@media print` hides the navigation and footer, shrinks the photo, forces light palette, keeps link URLs visible for the key links (email, LinkedIn, GitHub, portfolio), and sets page breaks so the result is two Letter pages at a 9.5pt body size: long roles may split across pages with their heading kept together; only `featured` projects print, one line each; the technical skills print from `skills.pdf` (five groups, ~22 items) while the web shows all `skills.hard` groups; soft skills print as names only; the projects lede and case-study link line are hidden in print because the portfolio URL is in the contact line. `scripts/pdf.mjs` launches Chromium through Playwright, opens `dist/index.html` with `media: print`, and writes `dist/Andres-Chavez-CV.pdf`. The header's Download PDF button links to that file. CI fails if the PDF is not produced or exceeds three pages.

## SEO and metadata

`<title>`, meta description, canonical `https://andres.streamlite.ca/`, Open Graph and Twitter card tags with `og-image.png`, and a JSON-LD `Person` block with name, job title, location, `sameAs` LinkedIn and GitHub. `robots` allowed. Google Analytics 4 (property 'andres.streamlite.ca', measurement id in `identity.analytics`, added 2026-09-11 at Andrés's request) counts visits; the tag is emitted only when the id is present and the footer states that visits are counted. No consent banner: the audience is Canada/US recruiters and the footer notice is the disclosure.

## Build and deploy

Two independent paths run on every push to `main`. Railway deploys regardless of the Actions result, so the Actions job is a signal, not a gate; the Dockerfile itself fails the Railway build if the site or the PDF cannot be produced.

**GitHub Actions `checks.yml`** (push to `main`, pull requests, manual):

1. Checkout, setup Node 22.
2. `npm ci`.
3. `node src/build.mjs` → `dist/`.
4. `node --test` (tests below).
5. `npx html-validate dist/index.html`.
6. `lychee --accept 200,206,403,429,999 dist/index.html` (same list as the portfolio workflow; LinkedIn answers 999 to bots).
7. `npx playwright install --with-deps chromium` and `node scripts/pdf.mjs`; fail if the PDF is missing or over three pages.

**Railway** (GitHub integration, branch `main`, `railway.json` with `builder: DOCKERFILE`):

- `Dockerfile` stage 1, `mcr.microsoft.com/playwright:<pinned>-jammy`: `npm ci`, `node src/build.mjs`, `node scripts/pdf.mjs`. Any failure stops the image build and the previous deploy stays live.
- `Dockerfile` stage 2, `caddy:2-alpine`: copies `dist/` and `Caddyfile`; serves on `$PORT` with gzip/zstd, long cache on hashed assets, `Content-Disposition: attachment` on the PDF.
- Healthcheck on `/`. Custom domain `andres.streamlite.ca` added in the Railway service; Railway issues the TLS certificate.

Local development: `npm run build && npx serve dist` or open `dist/index.html` directly. `npm run pdf` regenerates the PDF locally. `docker build . && docker run -p 8080:8080` reproduces production.

## Quality

`test/build.test.mjs` with `node:test`:

- `cv.json` validates against the schema.
- The build produces `dist/index.html`, `dist/styles.css`, and the photo.
- Every `href` in the generated HTML that starts with `#` matches an element `id`.
- Every project card links to `https://github.com/jachaveza26/portfolio/blob/main/projects/<file>.md`.
- Experience entries render newest first and `end: null` renders as "Present".
- No phone number pattern appears anywhere in `dist/`.

Plus html-validate and lychee in CI. Workflow badge in `README.md`. A container smoke test in the suite is out of scope; the Railway healthcheck covers it.

## Error handling

- Missing or malformed content: build exits non-zero with the schema error; nothing deploys.
- Dead link: lychee fails the job; the previous deploy stays live.
- PDF generation failure: job fails; the previous deploy stays live.
- DNS misconfiguration: the site still serves at the Railway-generated `*.up.railway.app` URL until the CNAME resolves.

## DNS and Railway setup (manual, Andrés)

1. Create the public repo `jachaveza26/cv` (empty, as with the other two).
2. In Railway: new service from the GitHub repo `jachaveza26/cv`, branch `main`. Railway detects `railway.json` and builds the Dockerfile. Confirm the service answers on its `*.up.railway.app` URL.
3. In the Railway service, Settings → Networking → Custom Domain: `andres.streamlite.ca`. Railway shows the CNAME target.
4. In GoDaddy DNS for `streamlite.ca`: add `CNAME andres → <target shown by Railway>`. Wait for Railway to report the certificate as issued.

## Git rules for this repo

Same as the other two: no force push, no history rewriting, no `Co-Authored-By` trailer, nothing pushed without explicit approval, and `Resume_JAndresChavez.pdf` and `COMO-PUBLICAR.md` never enter a commit.

## Out of scope

Case studies rendered inside the site, contact form, Spanish version, blog, analytics, multi-page routing, CMS.
