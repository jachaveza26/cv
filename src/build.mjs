import { readFileSync, writeFileSync, mkdirSync, cpSync, rmSync, existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";
import { validate } from "./validate.mjs";
import { render } from "./render.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

export function build({ outDir = path.join(root, "dist"), now = new Date() } = {}) {
  const cv = JSON.parse(readFileSync(path.join(root, "content/cv.json"), "utf8"));
  const schema = JSON.parse(readFileSync(path.join(root, "content/cv.schema.json"), "utf8"));
  const errors = validate(cv, schema);
  if (errors.length) throw new Error(`content/cv.json is invalid:\n  ${errors.join("\n  ")}`);

  rmSync(outDir, { recursive: true, force: true });
  mkdirSync(path.join(outDir, "assets"), { recursive: true });
  writeFileSync(path.join(outDir, "index.html"), render(cv, { updated: now.toISOString().slice(0, 10) }));
  cpSync(path.join(root, "src/styles.css"), path.join(outDir, "styles.css"));
  cpSync(path.join(root, "assets/fonts"), path.join(outDir, "assets/fonts"), { recursive: true });
  for (const file of [cv.identity.photo, "og-image.png"]) {
    const src = path.join(root, "assets", file);
    if (!existsSync(src)) throw new Error(`required asset missing: assets/${file}`);
    cpSync(src, path.join(outDir, "assets", file));
  }
  return outDir;
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try {
    console.log(`built ${build()}`);
  } catch (err) {
    console.error(err.message);
    process.exit(1);
  }
}
