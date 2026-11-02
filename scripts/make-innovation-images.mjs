#!/usr/bin/env node
/**
 * Builds the photos for the /innovation page. Writes ONLY inside public/innovation/.
 *
 *   public/innovation/<slug>.jpg           1200x750 photo per concept project (lib/innovation.ts)
 *   public/innovation/hero.png             1600x1000 transparent laptop + phone mockup
 *   public/innovation/photo-credits.json   photographer credits (merged, never overwritten)
 *
 * Usage (Node 24+; keep the key in an untracked env file such as .env.local):
 *   node --env-file=.env.local scripts/make-innovation-images.mjs
 *   node --env-file=.env.local scripts/make-innovation-images.mjs --force   # re-download existing files
 *   node --env-file=.env.local scripts/make-innovation-images.mjs --force --only slug1,slug2   # just these (use "hero" for the hero)
 *
 * To use your own photo, drop it at public/innovation/photos/<slug>.jpg
 * (and public/innovation/photos/hero.jpg for the laptop screen). Those files are
 * used instead of downloading.
 *
 * Requires UNSPLASH_ACCESS_KEY in the environment. The key is only sent in the
 * Authorization header and is never printed or written anywhere.
 */
import { existsSync, readFileSync } from "node:fs";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import sharp from "sharp";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const OUT = join(ROOT, "public", "innovation");
const PHOTOS = join(OUT, "photos");
const CREDITS = join(OUT, "photo-credits.json");
const UTM = "utm_source=yakimel_empire&utm_medium=referral";
const API = "https://api.unsplash.com";

const QUERIES = {
  "brandforge-ai": "colorful paint swatches design studio desk",
  advertwize: "marketing team brainstorming whiteboard sticky notes",
  "service-business-platform": "salon hairstylist appointment client",
  "pickup-marketplace": "fresh bread bakery paper bag counter",
};
const HERO_QUERY = "modern glass skyscrapers night city blue";

// ---------------------------------------------------------------- hero mockup

const HERO = { w: 1600, h: 1000 };
const LAPTOP = { left: 90, top: 190, w: 1000, h: 606 };
const SCREEN = { dx: 71, dy: 27, w: 858, h: 524, r: 16 }; // inside the laptop svg
const PHONE = { left: 1120, top: 250, w: 340, h: 690 };

/** Soft blue glow as a raw RGBA buffer: constant colour, smoothly falling alpha (no SVG filters, no banding). */
function glowLayer() {
  const { w, h } = HERO;
  const data = Buffer.alloc(w * h * 4);
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const d = Math.hypot((x - 800) / 680, (y - 510) / 400);
      const t = Math.min(1, Math.max(0, 1 - d));
      const alpha = 0.8 * t * t * (3 - 2 * t); // smoothstep
      const i = (y * w + x) * 4;
      data[i] = 47;
      data[i + 1] = 111;
      data[i + 2] = 234;
      data[i + 3] = Math.round(alpha * 255);
    }
  }
  return { data, info: { width: w, height: h, channels: 4 } };
}

const laptopSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="${LAPTOP.w}" height="${LAPTOP.h}">
  <rect x="44" y="0" width="912" height="578" rx="33" fill="#12182e" stroke="#3a4a7a" stroke-width="4"/>
  <rect x="${SCREEN.dx}" y="${SCREEN.dy}" width="${SCREEN.w}" height="${SCREEN.h}" rx="${SCREEN.r}" fill="#000"/>
  <rect x="0" y="578" width="1000" height="28" rx="14" fill="#1b2a55"/>
  <rect x="420" y="578" width="160" height="10" rx="5" fill="#0d1330"/>
</svg>`;

// Generic placeholder app screen: no text, no data, no numbers.
const phoneRows = [0, 1, 2, 3]
  .map((i) => {
    const y = 330 + i * 74;
    return `<rect x="36" y="${y}" width="268" height="58" rx="14" fill="#ffffff" fill-opacity=".08"/>
  <circle cx="68" cy="${y + 29}" r="14" fill="${i === 0 ? "#2f6fea" : "#ffffff"}" fill-opacity="${i === 0 ? 0.9 : 0.2}"/>
  <rect x="96" y="${y + 18}" width="${150 - i * 14}" height="9" rx="4.5" fill="#ffffff" fill-opacity=".35"/>
  <rect x="96" y="${y + 34}" width="${100 - i * 8}" height="7" rx="3.5" fill="#ffffff" fill-opacity=".18"/>`;
  })
  .join("\n  ");

const phoneSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="${PHONE.w}" height="${PHONE.h}">
  <defs>
    <linearGradient id="card" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#2f6fea"/>
      <stop offset="1" stop-color="#1b2a55"/>
    </linearGradient>
  </defs>
  <rect x="3" y="3" width="334" height="684" rx="58" fill="#0d1330" stroke="#3a4a7a" stroke-width="6"/>
  <rect x="18" y="18" width="304" height="654" rx="44" fill="#0a1330"/>
  <rect x="125" y="32" width="90" height="24" rx="12" fill="#000"/>
  <circle cx="52" cy="98" r="16" fill="#ffffff" fill-opacity=".2"/>
  <rect x="78" y="90" width="110" height="10" rx="5" fill="#ffffff" fill-opacity=".45"/>
  <rect x="78" y="106" width="70" height="7" rx="3.5" fill="#ffffff" fill-opacity=".2"/>
  <rect x="36" y="140" width="268" height="150" rx="22" fill="url(#card)"/>
  <rect x="58" y="166" width="120" height="12" rx="6" fill="#ffffff" fill-opacity=".7"/>
  <rect x="58" y="190" width="170" height="8" rx="4" fill="#ffffff" fill-opacity=".35"/>
  <rect x="58" y="244" width="96" height="30" rx="15" fill="#c9a45c"/>
  ${phoneRows}
  <rect x="36" y="630" width="268" height="6" rx="3" fill="#ffffff" fill-opacity=".18"/>
</svg>`;

const roundedMask = `<svg xmlns="http://www.w3.org/2000/svg" width="${SCREEN.w}" height="${SCREEN.h}">
  <rect width="${SCREEN.w}" height="${SCREEN.h}" rx="${SCREEN.r}" fill="#fff"/></svg>`;

/** Composes the transparent hero PNG around a photo for the laptop screen. */
export async function composeHero(photoBuffer) {
  const screenPhoto = await sharp(photoBuffer)
    .resize(SCREEN.w, SCREEN.h, { fit: "cover", position: "attention" })
    .composite([{ input: Buffer.from(roundedMask), blend: "dest-in" }])
    .png()
    .toBuffer();

  const glow = glowLayer();
  return sharp(glow.data, { raw: glow.info })
    .composite([
      { input: Buffer.from(laptopSvg), left: LAPTOP.left, top: LAPTOP.top },
      { input: screenPhoto, left: LAPTOP.left + SCREEN.dx, top: LAPTOP.top + SCREEN.dy },
      { input: Buffer.from(phoneSvg), left: PHONE.left, top: PHONE.top },
    ])
    .png()
    .toBuffer();
}

// ------------------------------------------------------------------ Unsplash

async function unsplash(path, key) {
  const res = await fetch(path.startsWith("http") ? path : `${API}${path}`, {
    headers: { Authorization: `Client-ID ${key}`, "Accept-Version": "v1" },
  });
  if (!res.ok) {
    throw new Error(
      `Unsplash API returned ${res.status} ${res.statusText}` +
        (res.status === 403 || res.status === 429 ? " (rate limit reached? demo keys allow 50 requests/hour)" : "") +
        (res.status === 401 ? " (check UNSPLASH_ACCESS_KEY)" : ""),
    );
  }
  return res.json();
}

/** Finds a landscape photo not already used, triggers the required download event, returns the image + credit. */
async function fetchPhoto(query, key, usedIds) {
  // Long queries can return nothing; retry with fewer trailing words (down to two).
  const words = query.split(/\s+/);
  let photo;
  let used = query;
  for (let n = words.length; n >= Math.min(2, words.length) && !photo; n--) {
    used = words.slice(0, n).join(" ");
    const search = await unsplash(
      `/search/photos?query=${encodeURIComponent(used)}&orientation=landscape&content_filter=high&per_page=10`,
      key,
    );
    photo = search.results.find((p) => !usedIds.has(p.id));
  }
  if (!photo) throw new Error(`No unused photo found for "${query}"`);
  usedIds.add(photo.id);

  // Required by the Unsplash API guidelines whenever a photo is used.
  await unsplash(photo.links.download_location, key);

  const img = await fetch(photo.urls.regular);
  if (!img.ok) throw new Error(`Image download failed: ${img.status} ${img.statusText}`);

  return {
    buffer: Buffer.from(await img.arrayBuffer()),
    credit: {
      photographer: photo.user.name,
      photographerUrl: `${photo.user.links.html}?${UTM}`,
      photoUrl: `${photo.links.html}?${UTM}`,
      unsplashId: photo.id,
      query: used,
    },
  };
}

async function readCredits() {
  if (!existsSync(CREDITS)) return {};
  try {
    return JSON.parse(await readFile(CREDITS, "utf8"));
  } catch {
    throw new Error(`${CREDITS} exists but is not valid JSON. Fix or remove it, then re-run.`);
  }
}

// ---------------------------------------------------------------------- main

/** lib/innovation.ts imports via the "@/" alias, so read the slugs as text instead of importing it. */
async function overviewSlugs() {
  const src = await readFile(join(ROOT, "lib", "innovation.ts"), "utf8");
  return [...src.matchAll(/detailsHref:\s*"\/innovation\/([^"]+)"/g)].map((m) => m[1]);
}

async function main() {
  const key = process.env.UNSPLASH_ACCESS_KEY;
  if (!key) {
    console.error(
      "UNSPLASH_ACCESS_KEY is not set.\n" +
        "Put it in an untracked env file (e.g. .env.local) and run:\n" +
        "  node --env-file=.env.local scripts/make-innovation-images.mjs",
    );
    process.exit(1);
  }

  const force = process.argv.includes("--force");
  const slugs = await overviewSlugs();
  const missing = slugs.filter((s) => !QUERIES[s]);
  const extra = Object.keys(QUERIES).filter((s) => !slugs.includes(s));
  if (missing.length || extra.length) {
    console.error(
      `lib/innovation.ts and the query list are out of sync.\n` +
        (missing.length ? `  no query for: ${missing.join(", ")}\n` : "") +
        (extra.length ? `  not in lib/innovation.ts: ${extra.join(", ")}\n` : ""),
    );
    process.exit(1);
  }

  await mkdir(OUT, { recursive: true });
  const credits = await readCredits();
  const usedIds = new Set(Object.values(credits).map((c) => c?.unsplashId).filter(Boolean));
  const failures = [];

  let jobs = [
    ...Object.entries(QUERIES).map(([name, query]) => ({ name, query })),
    { name: "hero", query: HERO_QUERY },
  ];

  const onlyArg = process.argv.indexOf("--only");
  if (onlyArg !== -1) {
    const only = (process.argv[onlyArg + 1] ?? "").split(",").map((s) => s.trim()).filter(Boolean);
    const unknown = only.filter((n) => !jobs.some((j) => j.name === n));
    if (!only.length || unknown.length) {
      console.error(
        `--only needs a comma-separated list of: ${jobs.map((j) => j.name).join(", ")}` +
          (unknown.length ? `
  unknown: ${unknown.join(", ")}` : ""),
      );
      process.exit(1);
    }
    jobs = jobs.filter((j) => only.includes(j.name));
  }

  for (const { name, query } of jobs) {
    const target = join(OUT, name === "hero" ? "hero.png" : `${name}.jpg`);
    const own = join(PHOTOS, `${name}.jpg`);

    try {
      if (existsSync(target) && !force && !existsSync(own)) {
        console.log(`skip     ${name} (already exists; use --force to replace)`);
        continue;
      }

      let buffer;
      if (existsSync(own)) {
        buffer = readFileSync(own);
        console.log(`local    ${name} <- public/innovation/photos/${name}.jpg`);
      } else {
        const found = await fetchPhoto(query, key, usedIds);
        buffer = found.buffer;
        credits[name] = found.credit;
        console.log(`unsplash ${name} (${found.credit.photographer})`);
      }

      if (name === "hero") {
        await writeFile(target, await composeHero(buffer));
      } else {
        await writeFile(
          target,
          await sharp(buffer).resize(1200, 750, { fit: "cover", position: "attention" }).jpeg({ quality: 85 }).toBuffer(),
        );
      }
    } catch (err) {
      failures.push(name);
      console.error(`FAILED   ${name}: ${err.message}`);
    }
  }

  await writeFile(CREDITS, JSON.stringify(credits, null, 2) + "\n");

  if (failures.length) {
    console.error(`\n${failures.length} failed: ${failures.join(", ")}. Re-run to retry them.`);
    process.exit(1);
  }
  console.log("\nDone. Credits saved to public/innovation/photo-credits.json");
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main().catch((err) => {
    console.error(err.message);
    process.exit(1);
  });
}
