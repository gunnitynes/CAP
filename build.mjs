// Builds the Pages site into _site/: links.json is inlined into every page, and each
// link gets its own <Name>/index.html so the Gamma frame starts loading straight away
// (and link previews show the deck's name).
import { readFileSync, writeFileSync, mkdirSync, cpSync, rmSync } from "node:fs";

const OUT = "_site";
const links = JSON.parse(readFileSync("links.json", "utf8"));
const template = readFileSync("index.html", "utf8")
  .replace("/*@links*/null", JSON.stringify(links).replace(/</g, "\\u003c"));
const esc = s => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/"/g, "&quot;");
const titled = t => template
  .replace("<title>CAP</title>", `<title>${esc(t)}</title>`)
  .replace('<meta property="og:title" content="CAP">', `<meta property="og:title" content="${esc(t)}">`);

rmSync(OUT, { recursive: true, force: true });
mkdirSync(OUT);
writeFileSync(`${OUT}/index.html`, template);
writeFileSync(`${OUT}/404.html`, template);       // other spellings and old id links
writeFileSync(`${OUT}/.nojekyll`, "");
cpSync("links.json", `${OUT}/links.json`);
cpSync("admin", `${OUT}/admin`, { recursive: true });
for (const name of Object.keys(links)) {
  mkdirSync(`${OUT}/${name}`);
  writeFileSync(`${OUT}/${name}/index.html`, titled(name.replace(/-/g, " ")));
}
console.log(`built ${Object.keys(links).length} links`);
