const fs = require("fs");

const PAGES = [
  ["app/analytics/page.tsx", "/analytics"],
  ["app/analytics/executive/page.tsx", "/analytics/executive"],
  ["app/analytics/institutional-risk/page.tsx", "/analytics/institutional-risk"],
  ["app/analytics/lender-readiness/page.tsx", "/analytics/lender-readiness"],
  ["app/analytics/value-growth/page.tsx", "/analytics/value-growth"],
  ["app/analytics/missed-calls/page.tsx", "/analytics/missed-calls"],
  ["app/analytics/acquisition/page.tsx", "/analytics/acquisition"],
  ["app/analytics/engines/page.tsx", "/analytics/engines"],
];

const COMPONENT_IMPORT = `import InstitutionalNav from "@/components/layouts/InstitutionalNav";`;

function dropdownLine(routePath) {
  return `<InstitutionalNav currentHref="${routePath}" linkClassName="text-sm font-medium text-surface-300 hover:text-white transition-colors" />`;
}

// Remove hardcoded single-line institutional <Link>s that sit AFTER the map.
const TAIL_LINK_RE = /^(\s*)<Link href="\/analytics\/(institutional-risk|lender-readiness|value-growth|missed-calls)"[^>]*>[^<]*<\/Link>\s*\n/gm;

// Find the line index where the `{NAV_LINKS.map(...)}` block fully closes,
// using a brace-depth scan so it works for single- and multi-line maps.
function findMapClose(src, mapIdx) {
  let depth = 0;
  for (let i = mapIdx; i < src.length; i++) {
    const c = src[i];
    if (c === "{") {
      if (src.startsWith("{NAV_LINKS.map(", i)) {
        depth = 1;
        i += "{NAV_LINKS.map(".length - 1;
        continue;
      }
      depth++;
    } else if (c === "(") {
      depth++;
    } else if (c === "}") {
      depth--;
      if (depth === 0) {
        const nl = src.indexOf("\n", i);
        return nl === -1 ? src.length : nl + 1;
      }
    } else if (c === ")") {
      depth--;
    }
  }
  return -1;
}

for (const [file, routePath] of PAGES) {
  let src = fs.readFileSync(file, "utf8");
  const original = src;
  const changes = [];

  if (src.includes("components/layouts/InstitutionalNav")) {
    console.log(`SKIP (already transformed): ${file}`);
    continue;
  }

  // Tolerant import detection: any import line referencing NAV_LINKS.
  const importLineMatch = src.match(/^import\s*\{[^}]*NAV_LINKS[^}]*\}\s*from\s*["'][^"']+["'];\s*\n/m);
  if (!importLineMatch) {
    const hasNavRef = src.includes("NAV_LINKS");
    console.log(`NO NAV_LINKS import in ${file} (nav ref present: ${hasNavRef})`);
    if (!hasNavRef) continue;
    // Still try to inject the dropdown after any nav map we can find.
    const anyMap = src.indexOf("NAV_LINKS.map(");
    if (anyMap === -1) {
      console.log(`  -> also no NAV_LINKS.map; skipping`);
      continue;
    }
    const closeAt = findMapClose(src, src.lastIndexOf("{", anyMap));
    if (closeAt === -1) {
      console.log(`  -> could not locate map close; skipping`);
      continue;
    }
    src = src.slice(0, closeAt) + dropdownLine(routePath) + "\n" + src.slice(closeAt);
    fs.writeFileSync(file, src);
    console.log(`UPDATED (dropdown only) ${file}`);
    continue;
  }

  src = src.replace(importLineMatch[0], importLineMatch[0].trimEnd() + "\n" + COMPONENT_IMPORT + "\n");
  changes.push("import");

  const afterImport = src;
  src = src.replace(TAIL_LINK_RE, "");
  if (src !== afterImport) changes.push("tail-removed");

  const mapIdx = src.indexOf("{NAV_LINKS.map(");
  if (mapIdx === -1) {
    console.error(`NO NAV_LINKS.map in ${file}`);
    continue;
  }
  const closeAt = findMapClose(src, mapIdx);
  if (closeAt === -1) {
    console.error(`NO map close found in ${file}`);
    continue;
  }
  src = src.slice(0, closeAt) + dropdownLine(routePath) + "\n" + src.slice(closeAt);
  changes.push("dropdown");

  fs.writeFileSync(file, src);
  console.log(`UPDATED ${file} [${changes.join(", ")}]`);
}
