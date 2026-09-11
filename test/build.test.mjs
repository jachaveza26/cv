import { test, before } from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, readFileSync, existsSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { build } from "../src/build.mjs";
import { fmtMonth, esc, render } from "../src/render.mjs";

let out, html;
before(() => {
  out = build({ outDir: mkdtempSync(path.join(tmpdir(), "cv-")), now: new Date("2026-09-10T00:00:00Z") });
  html = readFileSync(path.join(out, "index.html"), "utf8");
});

test("fmtMonth renders months and Present", () => {
  assert.equal(fmtMonth("2025-01"), "Jan 2025");
  assert.equal(fmtMonth("2013-05"), "May 2013");
  assert.equal(fmtMonth(null), "Present");
});

test("esc escapes html", () => {
  assert.equal(esc(`<a href="x">&'</a>`), "&lt;a href=&quot;x&quot;&gt;&amp;&#39;&lt;/a&gt;");
});

test("build writes index.html, styles.css and the photo", () => {
  assert.ok(existsSync(path.join(out, "index.html")));
  assert.ok(existsSync(path.join(out, "styles.css")));
  assert.ok(existsSync(path.join(out, "assets", "andres-chavez-400.webp")));
});

test("every in-page anchor points to an existing id", () => {
  const ids = new Set([...html.matchAll(/\sid="([^"]+)"/g)].map((m) => m[1]));
  const anchors = [...html.matchAll(/href="#([^"]+)"/g)].map((m) => m[1]);
  assert.ok(anchors.length >= 5, "expected nav anchors");
  for (const a of anchors) assert.ok(ids.has(a), `missing id for #${a}`);
});

test("every project card links to a case study in the portfolio repo", () => {
  const cards = [...html.matchAll(/class="card(?: featured)?"[^>]*href="([^"]+)"/g)].map((m) => m[1]);
  assert.equal(cards.length, 11);
  for (const u of cards) assert.match(u, /^https:\/\/github\.com\/jachaveza26\/portfolio\/blob\/main\/projects\/[a-z0-9-]+\.md$/);
});

test("experience is newest first and the open role says Present", () => {
  const starts = [...html.matchAll(/<p class="dates"><time datetime="(\d{4}-\d{2})"/g)].map((m) => m[1]);
  const sorted = [...starts].sort().reverse();
  assert.deepEqual(starts, sorted);
  assert.match(html, /Jan 2025<\/time> – Present/);
});

test("no phone number anywhere in the output", () => {
  assert.doesNotMatch(html, /\(\d{3}\)\s?\d{3}-\d{4}/);
  assert.doesNotMatch(html, /\b\d{3}[-.\s]\d{3}[-.\s]\d{4}\b/);
});

test("metadata: title, canonical, og image, JSON-LD person, updated date", () => {
  assert.match(html, /<title>Andrés Chávez — AI &amp; Automation Engineer<\/title>/);
  assert.match(html, /<link rel="canonical" href="https:\/\/andres\.streamlite\.ca\/">/);
  assert.match(html, /property="og:image" content="https:\/\/andres\.streamlite\.ca\/assets\/og-image\.png"/);
  assert.match(html, /"@type":"Person"/);
  assert.match(html, /Last updated 2026-09-10/);
});

test("PDF button links to the generated file", () => {
  assert.match(html, /class="btn btn-pdf" href="Andres-Chavez-CV\.pdf" download/);
});

test("render() escapes hostile content everywhere it reaches HTML", () => {
  const cv = JSON.parse(readFileSync(new URL("../content/cv.json", import.meta.url), "utf8"));
  const hostile = `"><script>x</script>`;
  cv.identity.site = `https://example.com${hostile}`;
  cv.identity.name = `Name${hostile}`;
  cv.experience[0].summary = `Summary${hostile}`;
  const out = render(cv, { updated: "2026-09-10" });
  assert.doesNotMatch(out, /<script(?! type="application\/ld\+json")/);
});

test("compact entries render two lines with no bullets and no links", () => {
  const compact = [...html.matchAll(/<article class="job compact"[\s\S]*?<\/article>/g)].map((m) => m[0]);
  assert.equal(compact.length, 1);
  for (const a of compact) {
    assert.doesNotMatch(a, /<ul/);
    assert.doesNotMatch(a, /class="links"/);
  }
});

test("build copies the Open Graph image", () => {
  assert.ok(existsSync(path.join(out, "assets", "og-image.png")));
});

test("exactly five cards carry the featured class", () => {
  assert.equal((html.match(/class="card featured"/g) ?? []).length, 5);
});

test("experience has six entries and no removed employers", () => {
  assert.equal((html.match(/<article class="job/g) ?? []).length, 6);
  assert.doesNotMatch(html, /ZMBDi|PSM Payment Services/);
});

test("soft skills are wrapped for print hiding", () => {
  assert.match(html, /<div class="soft-block"><h3>How I work<\/h3>/);
});

test("only one technical skills list is rendered", () => {
  assert.equal((html.match(/<dl class="hard/g) ?? []).length, 1);
  assert.doesNotMatch(html, /print-only|screen-only/);
});
