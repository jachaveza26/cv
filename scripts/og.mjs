import { chromium } from "playwright";
import { readFileSync } from "node:fs";
import path from "node:path";

const cv = JSON.parse(readFileSync("content/cv.json", "utf8"));
const photo = readFileSync(path.join("assets", cv.identity.photo)).toString("base64");
const html = `<!doctype html><html><head><meta charset="utf-8"><style>
  body{margin:0;width:1200px;height:630px;display:flex;align-items:center;gap:56px;padding:0 96px;box-sizing:border-box;
       background:#fbfaf7;color:#1c1b19;font-family:ui-sans-serif,system-ui,-apple-system,"Segoe UI",Roboto,Arial,sans-serif}
  img{width:300px;height:400px;object-fit:cover;border-radius:20px}
  h1{font-size:64px;margin:0 0 12px;letter-spacing:-0.02em} p{font-size:30px;margin:0;color:#5f5b54;line-height:1.3}
  .site{margin-top:28px;font-size:24px;color:#0b5fa5}
</style></head><body>
  <img src="data:image/webp;base64,${photo}" alt="">
  <div><h1>${cv.identity.name}</h1><p>${cv.identity.title}</p><p>${cv.identity.location}</p><p class="site">${cv.identity.site.replace("https://", "")}</p></div>
</body></html>`;

const browser = await chromium.launch();
try {
  const page = await browser.newPage({ viewport: { width: 1200, height: 630 }, deviceScaleFactor: 1 });
  await page.setContent(html, { waitUntil: "load" });
  await page.screenshot({ path: "assets/og-image.png", type: "png" });
} finally {
  await browser.close();
}
console.log("wrote assets/og-image.png");
