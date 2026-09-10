const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

export const esc = (s) =>
  String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);

export function fmtMonth(ym) {
  if (!ym) return "Present";
  const [y, m] = ym.split("-").map(Number);
  return `${MONTHS[m - 1]} ${y}`;
}

export const slug = (s) => String(s).toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

const li = (items) => items.map((i) => `<li>${esc(i)}</li>`).join("");

function head(cv, updated) {
  const { name, title, tagline, site, photo, email, linkedin, github, location } = cv.identity;
  const person = {
    "@context": "https://schema.org",
    "@type": "Person",
    name,
    jobTitle: title,
    email: `mailto:${email}`,
    url: `${site}/`,
    image: `${site}/assets/${photo}`,
    address: { "@type": "PostalAddress", addressLocality: "Chilliwack", addressRegion: "BC", addressCountry: "CA" },
    sameAs: [linkedin, github],
  };
  const desc = `${title} in ${location}. ${tagline}`;
  return `<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(name)} — ${esc(title)}</title>
<meta name="description" content="${esc(desc)}">
<link rel="canonical" href="${site}/">
<meta property="og:type" content="profile">
<meta property="og:title" content="${esc(name)} — ${esc(title)}">
<meta property="og:description" content="${esc(desc)}">
<meta property="og:url" content="${site}/">
<meta property="og:image" content="${site}/assets/og-image.png">
<meta name="twitter:card" content="summary_large_image">
<link rel="stylesheet" href="styles.css">
<script type="application/ld+json">${JSON.stringify(person).replace(/</g, "\\u003c")}</script>`;
}

function header(cv) {
  const { name, title, tagline, location, email, linkedin, github, photo } = cv.identity;
  return `<header class="hero">
  <img class="photo" src="assets/${esc(photo)}" alt="Portrait of ${esc(name)}" width="200" height="267">
  <div class="hero-text">
    <h1>${esc(name)}</h1>
    <p class="title">${esc(title)}</p>
    <p class="tagline">${esc(tagline)}</p>
    <p class="location">${esc(location)}</p>
    <p class="actions">
      <a class="btn" href="mailto:${esc(email)}">Email</a>
      <a class="btn" href="${esc(linkedin)}" rel="me">LinkedIn</a>
      <a class="btn" href="${esc(github)}" rel="me">GitHub</a>
      <a class="btn btn-pdf" href="Andres-Chavez-CV.pdf" download>Download PDF</a>
    </p>
    <p class="print-contact">${esc(email)} · ${esc(linkedin)} · ${esc(github)}</p>
  </div>
</header>`;
}

const nav = () => `<nav class="topnav" aria-label="Sections">
  <a href="#about">About</a><a href="#experience">Experience</a><a href="#projects">Projects</a><a href="#skills">Skills</a><a href="#education">Education</a>
</nav>`;

const about = (cv) => `<section id="about"><h2>About</h2>${cv.profile.map((p) => `<p>${esc(p)}</p>`).join("")}</section>`;

function job(j) {
  const dates = `<p class="dates"><time datetime="${j.start}">${fmtMonth(j.start)}</time> – ${j.end ? `<time datetime="${j.end}">${fmtMonth(j.end)}</time>` : "Present"}</p>`;
  const head = `<div class="job-head"><h3>${esc(j.role)}</h3><p class="org">${esc(j.org)} · ${esc(j.location)}</p>${dates}</div>`;
  if (j.compact) return `<article class="job compact" id="job-${slug(j.org)}">${head}<p class="summary">${esc(j.summary)}</p></article>`;
  const summary = j.summary ? `<p class="summary">${esc(j.summary)}</p>` : "";
  const bullets = j.bullets.length ? `<ul>${li(j.bullets)}</ul>` : "";
  const links = j.links.length
    ? `<p class="links">Case studies: ${j.links.map((l) => `<a href="${esc(l.url)}">${esc(l.label)}</a>`).join(" · ")}</p>`
    : "";
  return `<article class="job" id="job-${slug(j.org)}">${head}${summary}${bullets}${links}</article>`;
}

const experience = (cv) =>
  `<section id="experience"><h2>Experience</h2>${[...cv.experience].sort((a, b) => (a.start < b.start ? 1 : a.start > b.start ? -1 : 0)).map(job).join("")}</section>`;

const projects = (cv) => `<section id="projects"><h2>Selected projects</h2>
<p class="lede">One case study per project, written for another engineer, in the <a href="${esc(cv.identity.portfolio)}">portfolio repository</a>.</p>
<div class="grid">${cv.projects
  .map(
    (p) => `<a class="card" href="${esc(p.url)}"><h3>${esc(p.name)}</h3><p>${esc(p.oneLiner)}</p><ul class="chips">${li(p.stack)}</ul><span class="status">${esc(p.status)}</span></a>`,
  )
  .join("")}</div></section>`;

const skills = (cv) => `<section id="skills"><h2>Skills</h2>
<h3>Technical</h3>
<dl class="hard">${cv.skills.hard.map((g) => `<dt>${esc(g.group)}</dt><dd>${g.items.map(esc).join(" · ")}</dd>`).join("")}</dl>
<h3>How I work</h3>
<dl class="soft">${cv.skills.soft.map((s) => `<dt>${esc(s.name)}</dt><dd>${esc(s.evidence)}</dd>`).join("")}</dl></section>`;

const education = (cv) => `<section id="education"><h2>Education</h2>
<ul class="edu">${cv.education.map((e) => `<li><strong>${esc(e.credential)}</strong> — ${esc(e.institution)}, ${esc(e.country)}, ${esc(e.year)}</li>`).join("")}</ul>
<h3>Certifications</h3>
<ul class="edu">${cv.certifications.map((c) => `<li><strong>${esc(c.credential)}</strong> — ${esc(c.institution)}, ${esc(c.country)}, ${esc(c.completed.length === 4 ? c.completed : fmtMonth(c.completed.slice(0, 7)))}</li>`).join("")}</ul>
<h3>Languages</h3>
<p>${cv.languages.map((l) => `${esc(l.language)} (${esc(l.level)})`).join(" · ")}</p></section>`;

const footer = (cv, updated) => `<footer>
  <p><a href="mailto:${esc(cv.identity.email)}">${esc(cv.identity.email)}</a> · <a href="${esc(cv.identity.linkedin)}">LinkedIn</a> · <a href="${esc(cv.identity.github)}">GitHub</a> · <a href="${esc(cv.identity.portfolio)}">Portfolio</a></p>
  <p class="updated">Last updated ${esc(updated)}</p>
</footer>`;

export function render(cv, { updated }) {
  return `<!doctype html>
<html lang="en">
<head>
${head(cv, updated)}
</head>
<body>
${nav()}
<main>
${header(cv)}
${about(cv)}
${experience(cv)}
${projects(cv)}
${skills(cv)}
${education(cv)}
</main>
${footer(cv, updated)}
</body>
</html>
`;
}
