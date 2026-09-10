import { chromium } from "playwright";
import { readFileSync, statSync, existsSync } from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";

const dist = path.resolve("dist");
const index = path.join(dist, "index.html");
const out = path.join(dist, "Andres-Chavez-CV.pdf");
if (!existsSync(index)) {
  console.error("dist/index.html not found — run `npm run build` first");
  process.exit(1);
}

const browser = await chromium.launch();
const page = await browser.newPage();
await page.goto(pathToFileURL(index).href, { waitUntil: "load" });
await page.emulateMedia({ media: "print" });
await page.pdf({
  path: out,
  format: "Letter",
  printBackground: true,
  preferCSSPageSize: true,
  margin: { top: "0.6in", bottom: "0.6in", left: "0.7in", right: "0.7in" },
});
await browser.close();

// Chromium writes page objects uncompressed, so counting "/Type /Page" (not "/Pages") is reliable enough for a guard.
const pages = (readFileSync(out, "latin1").match(/\/Type\s*\/Page(?!s)/g) ?? []).length;
console.log(`wrote ${out} (${statSync(out).size} bytes, ${pages} pages)`);
if (pages === 0 || pages > 3) {
  console.error(`PDF page count out of range (expected 1–3, got ${pages})`);
  process.exit(1);
}
