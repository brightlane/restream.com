const fs = require("fs");
const path = require("path");

const BASE_URL = "https://brightlane.github.io/restream.com";
const ROOT_DIR = path.join(__dirname); // change if needed

function walk(dir, fileList = []) {
  const files = fs.readdirSync(dir);

  files.forEach(file => {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);

    if (stat.isDirectory()) {
      walk(fullPath, fileList);
    } else {
      fileList.push(fullPath);
    }
  });

  return fileList;
}

function toUrl(filePath) {
  let rel = path.relative(ROOT_DIR, filePath).replace(/\\/g, "/");

  // ignore system files
  if (rel.includes("node_modules") || rel.startsWith(".")) return null;

  // only web files
  if (!rel.endsWith(".html")) return null;

  if (rel === "index.html") {
    return BASE_URL + "/";
  }

  return BASE_URL + "/" + rel.replace("index.html", "");
}

function generate() {
  const files = walk(ROOT_DIR);

  const urls = files
    .map(toUrl)
    .filter(Boolean);

  const xml =
`<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map(u => `
  <url>
    <loc>${u}</loc>
    <priority>0.8</priority>
  </url>
`).join("")}
</urlset>`;

  fs.writeFileSync("sitemap.xml", xml);
  console.log("sitemap.xml generated with", urls.length, "pages");
}

generate();
