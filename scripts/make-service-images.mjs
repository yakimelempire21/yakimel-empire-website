#!/usr/bin/env node
/**
 * Builds the photos for the /services page. Writes ONLY inside public/services/.
 *
 *   public/services/<slug>.jpg        800x600 photo per service (lib/services.ts)
 *   public/services/hero.png          1400x900 transparent laptop + phone mockup
 *   public/services/photo-credits.json  photographer credits (merged, never overwritten)
 *
 * Usage (Node 24; keep the key in an untracked env file such as .env.local):
 *   node --env-file=.env.local scripts/make-service-images.mjs
 *   node --env-file=.env.local scripts/make-service-images.mjs --force   # re-download existing files
 *
 * To use your own photo for a service, drop it at public/services/photos/<slug>.jpg
 * (and public/services/photos/hero.jpg for the laptop screen). Those files are
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
const OUT = join(ROOT, "public", "services");
const PHOTOS = join(OUT, "photos");
const CREDITS = join(OUT, "photo-credits.json");
const UTM = "utm_source=yakimel_empire&utm_medium=referral";
const API = "https://api.unsplash.com";

const QUERIES = {
  "business-consultation": "business consultation video call woman laptop",
  "shopify-store-setup": "online store skincare products ecommerce",
  "dropshipping-website": "ecommerce shipping packages parcel",
  "business-website": "business website laptop office desk",
  "website-redesign": "web designer wireframe redesign laptop",
  "app-ai-development": "artificial intelligence smartphone app",
  "website-maintenance": "software developer laptop code screen",
  "private-training": "online tutor training video call laptop",
};
const HERO_QUERY = "natural skincare beauty products";

// ---------------------------------------------------------------- hero mockup

const HERO = { w: 1400, h: 900 };
const LAPTOP = { left: 130, top: 190, w: 900, h: 545 };
const SCREEN = { dx: 64, dy: 24, w: 772, h: 472, r: 14 }; // inside the laptop svg
const PHONE = { left: 950, top: 250, w: 300, h: 610 };

/** Soft blue glow as a raw RGBA buffer: constant colour, smoothly falling alpha (no SVG filters, no banding). */
function glowLayer() {
  const { w, h } = HERO;
  const data = Buffer.alloc(w * h * 4);
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const d = Math.hypot((x - 720) / 600, (y - 480) / 360);
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
  <rect x="40" y="0" width="820" height="520" rx="30" fill="#12182e" stroke="#3a4a7a" stroke-width="4"/>
  <rect x="${SCREEN.dx}" y="${SCREEN.dy}" width="${SCREEN.w}" height="${SCREEN.h}" rx="${SCREEN.r}" fill="#000"/>
  <rect x="0" y="520" width="900" height="24" rx="12" fill="#1b2a55"/>
  <rect x="380" y="520" width="140" height="9" rx="4" fill="#0d1330"/>
</svg>`;

const bars = [40, 55, 48, 70, 62, 88, 80, 112]
  .map((h, i) => `<rect x="${52 + i * 26}" y="${350 - h}" width="18" height="${h}" rx="4" fill="#2f6fea"/>`)
  .join("");

const phoneSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="${PHONE.w}" height="${PHONE.h}" font-family="Arial, Helvetica, sans-serif">
  <rect x="3" y="3" width="294" height="604" rx="52" fill="#0d1330" stroke="#3a4a7a" stroke-width="6"/>
  <rect x="16" y="16" width="268" height="578" rx="38" fill="#0a1330"/>
  <rect x="110" y="28" width="80" height="22" rx="11" fill="#000"/>
  <text x="36" y="92" font-size="20" font-weight="700" fill="#ffffff">Business Overview</text>
  <rect x="32" y="116" width="236" height="256" rx="18" fill="#ffffff"/>
  <text x="52" y="152" font-size="14" fill="#64748b">Total Sales</text>
  <text x="52" y="192" font-size="34" font-weight="700" fill="#0b1220">$12,426</text>
  <text x="52" y="218" font-size="16" font-weight="700" fill="#16a34a">+12%</text>
  ${bars}
  <rect x="32" y="392" width="236" height="44" rx="12" fill="#ffffff" fill-opacity=".08"/>
  <rect x="32" y="448" width="236" height="44" rx="12" fill="#ffffff" fill-opacity=".08"/>
  <rect x="32" y="504" width="236" height="44" rx="12" fill="#ffffff" fill-opacity=".08"/>
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
    throw new Error(`Unsplash API returned ${res.status} ${res.statusText}` +
      (res.status === 403 || res.status === 429 ? " (rate limit reached? demo keys allow 50 requests/hour)" : "") +
      (res.status === 401 ? " (check UNSPLASH_ACCESS_KEY)" : ""));
  }
  return res.json();
}

/** Finds a landscape photo not already used, triggers the required download event, returns the image + credit. */
async function fetchPhoto(query, key, usedIds) {
  const search = await unsplash(
    `/search/photos?query=${encodeURIComponent(query)}&orientation=landscape&content_filter=high&per_page=10`,
    key,
  );
  const photo = search.results.find((p) => !usedIds.has(p.id));
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
      query,
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

async function loadSlugs() {
  const mod = await import(pathToFileURL(join(ROOT, "lib", "services.ts")).href);
  return mod.services.map((s) => s.slug);
}

async function main() {
  const key = process.env.UNSPLASH_ACCESS_KEY;
  if (!key) {
    console.error(
      "UNSPLASH_ACCESS_KEY is not set.\n" +
        "Put it in an untracked env file (e.g. .env.local) and run:\n" +
        "  node --env-file=.env.local scripts/make-service-images.mjs",
    );
    process.exit(1);
  }

  const force = process.argv.includes("--force");
  const slugs = await loadSlugs();
  const missing = slugs.filter((s) => !QUERIES[s]);
  const extra = Object.keys(QUERIES).filter((s) => !slugs.includes(s));
  if (missing.length || extra.length) {
    console.error(
      `lib/services.ts and the query list are out of sync.\n` +
        (missing.length ? `  no query for: ${missing.join(", ")}\n` : "") +
        (extra.length ? `  not in lib/services.ts: ${extra.join(", ")}\n` : ""),
    );
    process.exit(1);
  }

  await mkdir(OUT, { recursive: true });
  const credits = await readCredits();
  const usedIds = new Set(Object.values(credits).map((c) => c?.unsplashId).filter(Boolean));
  const failures = [];

  const jobs = [
    ...slugs.map((slug) => ({ name: slug, query: QUERIES[slug] })),
    { name: "hero", query: HERO_QUERY },
  ];

  for (const { name, query } of jobs) {
    const target = join(OUT, name === "hero" ? "hero.png" : `${name}.jpg`);
    const own = join(PHOTOS, name === "hero" ? "hero.jpg" : `${name}.jpg`);

    try {
      if (existsSync(target) && !force && !existsSync(own)) {
        console.log(`skip   ${name} (already exists; use --force to replace)`);
        continue;
      }

      let buffer;
      if (existsSync(own)) {
        buffer = readFileSync(own);
        console.log(`local  ${name} <- public/services/photos/${name === "hero" ? "hero" : name}.jpg`);
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
          await sharp(buffer).resize(800, 600, { fit: "cover", position: "attention" }).jpeg({ quality: 85 }).toBuffer(),
        );
      }
    } catch (err) {
      failures.push(name);
      console.error(`FAILED ${name}: ${err.message}`);
    }
  }

  await writeFile(CREDITS, JSON.stringify(credits, null, 2) + "\n");

  if (failures.length) {
    console.error(`\n${failures.length} failed: ${failures.join(", ")}. Re-run to retry them.`);
    process.exit(1);
  }
  console.log("\nDone. Credits saved to public/services/photo-credits.json");
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main().catch((err) => {
    console.error(err.message);
    process.exit(1);
  });
}
