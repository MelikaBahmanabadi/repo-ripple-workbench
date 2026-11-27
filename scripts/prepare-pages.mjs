import { cpSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";

const root = process.cwd();
const out = join(root, "pages");
const read = (p) => readFileSync(join(root, p), "utf8");
const write = (p, value) => {
  const target = join(out, p);
  mkdirSync(dirname(target), { recursive: true });
  writeFileSync(target, value);
};

const html = read("src/site/body.html");
let js = read("public/js/main.js");
// The source stylesheet references font files that are not part of the exported asset bundle.
// Load the same families from Google Fonts and remove broken local @font-face declarations.
const css = read("public/css/style.css").replace(/@font-face\\s*\\{[^}]*\\}/g, "");

// Use the checked-in, optimized local image library instead of private Lovable asset URLs.
const imageMap = {
  "hero-poster.jpg": "hero/still-espresso-pour.jpg",
  "main-hall.jpg": "gallery/cafe-interior.jpg",
  "espresso-bar.jpg": "gallery/cafe-counter.jpg",
  "reserved-birthday.jpg": "gallery/coffee-cups.jpg",
  "reserved-romantic.jpg": "gallery/warm-corner.jpg",
  "lounge.jpg": "gallery/warm-corner.jpg",
  "terrace.jpg": "gallery/cafe-interior.jpg",
};
let pageHtml = html.replace(/\/__l5e\/assets-v1\/[^/"']+\/([^/"']+)/g, (match, filename) => {
  const mapped = imageMap[filename] || (filename === "hero-coffee-loop.mp4" ? "" : `products/${filename}`);
  return mapped ? `./assets/images/${mapped}` : "";
});
pageHtml = pageHtml.replace(/<source src="" type="video\/mp4">/g, "");
pageHtml = pageHtml.replace(/<video([^>]*)>/g, (tag) => tag.replace(/preload="metadata"/, 'preload="none"'));

// Rewrite generated menu product paths to the checked-in product images.
js = js.replace(/\/__l5e\/assets-v1\/[^/"'`]+\/([^/"'`]+)/g, "./assets/images/products/$1");

// A static host cannot run the reservation/newsletter server endpoints. Keep the forms honest:
// explain the limitation and direct visitors to the published contact email instead of faking success.
js = js.replace(
  "const r = await fetch('/api/public/newsletter', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email: input.value }) });\n        const j = await r.json();\n        if (!r.ok) throw new Error(j.error);\n        $('#newsNote').hidden = false; newsForm.reset(); toast('Thanks — you are on the list.');",
  "toast('Newsletter sign-up is unavailable on this static demo. Please email reservations@emberandoak.co.');"
);
js = js.replace(
  "try {\n      const r = await fetch('/api/public/reservations', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) });\n      const j = await r.json();\n      if (!r.ok) throw new Error(j.error || 'Something went wrong.');\n      document.getElementById('rsvDoneText').textContent = `Thank you, ${data.full_name.split(' ')[0]}! ${document.getElementById('rsvSummary').textContent}. We'll call you at ${data.phone} to confirm.`;\n      go(3);\n    } catch (x) { err.textContent = x.message || 'Could not send. Please try again.'; }\n    finally { btn.disabled = false; btn.textContent = 'Confirm reservation'; }",
  "err.textContent = 'Online reservations are unavailable on this static demo. Please email reservations@emberandoak.co to request a table.';\n    btn.disabled = false; btn.textContent = 'Confirm reservation';"
);

const document = `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="theme-color" content="#1A0E08">
  <meta name="description" content="Ember & Oak is a specialty coffee house. Cinematically crafted espresso, slow mornings and a warm place to stay a while.">
  <title>Ember & Oak — Specialty Coffee House</title>
  <link rel="icon" type="image/svg+xml" href="./assets/icons/favicon.svg">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;500;600&family=Jost:wght@300;400;500&family=Playfair+Display:ital,wght@0,400;0,700;0,900;1,400&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="./css/style.css">
</head>
<body>
${pageHtml}
<script src="./js/main.js" defer></script>
</body>
</html>`;

write("index.html", document);
write("404.html", document);
mkdirSync(join(out, "css"), { recursive: true });
mkdirSync(join(out, "js"), { recursive: true });
write("css/style.css", css);
cpSync(join(root, "public/assets"), join(out, "assets"), { recursive: true });
write("js/main.js", js);
write(".nojekyll", "");
console.log("Prepared static GitHub Pages site in ./pages");
