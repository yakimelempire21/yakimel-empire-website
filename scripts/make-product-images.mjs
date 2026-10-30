#!/usr/bin/env node
/**
 * Builds the website-template card images for /products (maison, bloom, savory,
 * forma, atelier, nexora). aurum, velora and ironstone already have real images.
 *
 * Each image is an Unsplash photo (1280x800) with an SVG overlay imitating a
 * website hero: nav, eyebrow, headline, subtitle, button and a feature bar.
 *
 * Writes ONLY:
 *   public/products/templates/<slug>.jpg
 *   public/products/photo-credits.json   (merged, never overwritten)
 * Reads (never creates) public/products/photos/<slug>.jpg as your own photo.
 *
 * Usage (Node 24; keep the key in an untracked env file such as .env.local):
 *   node --env-file=.env.local scripts/make-product-images.mjs
 *   node --env-file=.env.local scripts/make-product-images.mjs --force   # rebuild existing files
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
const OUT = join(ROOT, "public", "products", "templates");
const PHOTOS = join(ROOT, "public", "products", "photos");
const CREDITS = join(ROOT, "public", "products", "photo-credits.json");
const UTM = "utm_source=yakimel_empire&utm_medium=referral";
const API = "https://api.unsplash.com";

const SERIF = "Georgia, 'Times New Roman', serif";
const SANS = "Helvetica, Arial, sans-serif";

const TEMPLATES = {
  maison: {
    query: "luxury modern house pool architecture",
    font: SERIF,
    bg: "#0f1b2d", text: "#f3efe6", accent: "#c9a26b", buttonText: "#0f1b2d",
    brand: "MAISON",
    nav: ["Buy", "Rent", "Properties", "Contact"],
    cta: "List Property",
    eyebrow: "REAL ESTATE",
    headline: ["Extraordinary", "Homes for", "Extraordinary Lives"],
    subtitle: ["Discover a higher standard of living with", "advanced property search."],
    button: "Browse Properties",
    bar: ["Virtual Tours", "Expert Agents", "Property Search"],
  },
  bloom: {
    query: "spa salon relaxation woman towel",
    font: SERIF,
    bg: "#f7e4df", text: "#4a2e2a", accent: "#d98a7a", buttonText: "#ffffff",
    brand: "BLOOM",
    nav: ["Services", "Team", "Gallery", "Book"],
    cta: "Book Now",
    eyebrow: "SALON & SPA",
    headline: ["Look Good", "Feel Amazing"],
    subtitle: ["Premium salon and spa services", "with easy online booking."],
    button: "Book Appointment",
    bar: ["Hair", "Nails", "Facials", "Massage"],
  },
  savory: {
    query: "bakery croissants coffee",
    font: SERIF,
    bg: "#3b2417", text: "#fbeedb", accent: "#e0a458", buttonText: "#3b2417",
    brand: "SAVORY",
    nav: ["Menu", "Our Story", "Catering", "Contact"],
    cta: "Order Online",
    eyebrow: "BAKERY & CAFE",
    headline: ["Good Food", "Brighter Days"],
    subtitle: ["Fresh baked goods, artisan coffee", "and a warm welcome every morning."],
    button: "Explore Our Menu",
    bar: ["Baked Daily", "Fresh Coffee", "Catering"],
  },
  forma: {
    query: "gym woman workout strength training",
    font: SANS,
    bg: "#0b0b0b", text: "#ffffff", accent: "#b6ff3c", buttonText: "#0b0b0b",
    brand: "FORMA",
    nav: ["Classes", "Trainers", "Pricing", "About"],
    cta: "Join Now",
    eyebrow: "FITNESS • COMMUNITY",
    headline: ["A Stronger", "You Everyday"],
    uppercase: true,
    subtitle: ["Class schedules, expert trainers", "and flexible membership options."],
    button: "Join Now",
    bar: ["Strength", "Discipline", "Progress", "Community"],
  },
  atelier: {
    query: "minimalist creative studio designer portrait",
    font: SERIF,
    bg: "#f4f1ea", text: "#111111", accent: "#111111", buttonText: "#ffffff",
    brand: "ATELIER",
    nav: ["Work", "About", "Services", "Contact"],
    cta: "Let's Talk",
    eyebrow: "PORTFOLIO",
    headline: ["Creative", "Design", "for Modern", "Brands."],
    subtitle: ["A minimalist portfolio for", "creative professionals and designers."],
    button: "View Work",
    bar: ["Ideas", "Brands", "Experiences"],
  },
  nexora: {
    query: "business team office meeting modern",
    font: SANS,
    bg: "#f4f8fc", text: "#0c2340", accent: "#1a6bff", buttonText: "#ffffff",
    brand: "NEXORA",
    nav: ["Services", "Industries", "About", "Contact"],
    cta: "Get Started",
    eyebrow: "STRATEGY • TECHNOLOGY • PEOPLE",
    headline: ["Smarter Solutions", "for a Stronger", "Tomorrow"],
    subtitle: ["A professional business website", "built for growth."],
    button: "Get Started",
    bar: ["Consulting", "Technology", "Growth", "Support"],
  },
};

// ------------------------------------------------------------------- overlay

const W = 1280;
const H = 800;
const NAV_H = 88;
const BAR_H = 110;
const PAD = 70;

const esc = (s) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

function overlaySvg(t) {
  const lines = t.uppercase ? t.headline.map((l) => l.toUpperCase()) : t.headline;
  // Approximate average glyph width as a fraction of font size, to keep the
  // headline inside the gradient-covered left half of the image.
  const charW = (t.font === SERIF ? 0.5 : 0.56) * (t.uppercase ? 1.18 : 1);
  const longest = Math.max(...lines.map((l) => l.length));
  const hSize = Math.floor(Math.min(88, 580 / (longest * charW), 330 / (lines.length * 1.08)));
  const hLead = hSize * 1.08;
  const headH = lines.length * hLead;

  const subLead = 30;
  const btnW = Math.round(t.button.length * 10.5 + 56);
  const btnH = 54;
  const total = 15 + 26 + headH + 26 + subLead * 2 + 22 + btnH;
  const top = NAV_H + (H - BAR_H - NAV_H - total) / 2;

  const eyebrowY = top + 15;
  const headTop = eyebrowY + 26;
  const headEnd = headTop + headH;
  const subY = headEnd + 26 + 20;
  const btnTop = headEnd + 26 + subLead * 2 + 22;

  const navY = NAV_H / 2 + 5;
  const ctaW = Math.round(t.cta.length * 9.2 + 44);
  const ctaX = W - PAD - ctaW;
  const linkXs = [470, 580, 690, 800];

  const colW = (W - PAD * 2) / t.bar.length;

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" font-family="${esc(t.font)}">
  <defs>
    <linearGradient id="fade" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0" stop-color="${t.bg}" stop-opacity="1"/>
      <stop offset="0.45" stop-color="${t.bg}" stop-opacity="0.92"/>
      <stop offset="0.62" stop-color="${t.bg}" stop-opacity="0.45"/>
      <stop offset="0.88" stop-color="${t.bg}" stop-opacity="0"/>
    </linearGradient>
  </defs>
  <rect width="${W}" height="${H}" fill="url(#fade)"/>

  <rect width="${W}" height="${NAV_H}" fill="${t.bg}" fill-opacity="0.88"/>
  <rect y="${NAV_H}" width="${W}" height="1" fill="${t.text}" fill-opacity="0.15"/>
  <text x="${PAD}" y="${NAV_H / 2 + 10}" font-size="28" font-weight="700" letter-spacing="5" fill="${t.text}">${esc(t.brand)}</text>
  ${t.nav
    .map(
      (l, i) =>
        `<text x="${linkXs[i]}" y="${navY}" font-family="${esc(SANS)}" font-size="15" letter-spacing="0.5" fill="${t.text}" fill-opacity="0.85">${esc(l)}</text>`,
    )
    .join("\n  ")}
  <rect x="${ctaX}" y="${NAV_H / 2 - 21}" width="${ctaW}" height="42" rx="6" fill="${t.accent}"/>
  <text x="${ctaX + ctaW / 2}" y="${NAV_H / 2 + 5}" text-anchor="middle" font-family="${esc(SANS)}" font-size="14" font-weight="700" letter-spacing="1" fill="${t.buttonText}">${esc(t.cta)}</text>

  <text x="${PAD}" y="${eyebrowY}" font-family="${esc(SANS)}" font-size="15" font-weight="700" letter-spacing="4" fill="${t.accent}">${esc(t.eyebrow)}</text>
  ${lines
    .map(
      (l, i) =>
        `<text x="${PAD}" y="${headTop + hSize * 0.9 + i * hLead}" font-size="${hSize}" font-weight="${t.font === SERIF ? 400 : 700}" fill="${t.text}">${esc(l)}</text>`,
    )
    .join("\n  ")}
  ${t.subtitle
    .map(
      (l, i) =>
        `<text x="${PAD}" y="${subY + i * subLead}" font-family="${esc(SANS)}" font-size="21" fill="${t.text}" fill-opacity="0.9">${esc(l)}</text>`,
    )
    .join("\n  ")}
  <rect x="${PAD}" y="${btnTop}" width="${btnW}" height="${btnH}" rx="6" fill="${t.accent}"/>
  <text x="${PAD + btnW / 2}" y="${btnTop + 33}" text-anchor="middle" font-family="${esc(SANS)}" font-size="16" font-weight="700" letter-spacing="1" fill="${t.buttonText}">${esc(t.button)}</text>

  <rect y="${H - BAR_H}" width="${W}" height="${BAR_H}" fill="#000000" fill-opacity="0.58"/>
  ${t.bar
    .map((l, i) => {
      const x = PAD + i * colW;
      const y = H - BAR_H / 2;
      return `<circle cx="${x + 7}" cy="${y}" r="6" fill="${t.accent}"/>
  <text x="${x + 24}" y="${y + 6}" font-family="${esc(SANS)}" font-size="17" font-weight="700" letter-spacing="1.2" fill="#ffffff">${esc(l)}</text>`;
    })
    .join("\n  ")}
</svg>`;
}

/** Photo -> 1280x800 hero-style card image (JPEG buffer). */
export async function composeTemplate(photoBuffer, slug) {
  return sharp(photoBuffer)
    .resize(W, H, { fit: "cover", position: "attention" })
    .composite([{ input: Buffer.from(overlaySvg(TEMPLATES[slug])) }])
    .jpeg({ quality: 88 })
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

async function main() {
  const key = process.env.UNSPLASH_ACCESS_KEY;
  if (!key) {
    console.error(
      "UNSPLASH_ACCESS_KEY is not set.\n" +
        "Put it in an untracked env file (e.g. .env.local) and run:\n" +
        "  node --env-file=.env.local scripts/make-product-images.mjs",
    );
    process.exit(1);
  }

  const force = process.argv.includes("--force");

  // Every template this script builds must exist as a website product.
  const mod = await import(pathToFileURL(join(ROOT, "lib", "products.ts")).href);
  const known = new Set(mod.products.filter((p) => p.type === "website").map((p) => p.slug));
  const unknown = Object.keys(TEMPLATES).filter((s) => !known.has(s));
  if (unknown.length) {
    console.error(`Not website products in lib/products.ts: ${unknown.join(", ")}`);
    process.exit(1);
  }

  await mkdir(OUT, { recursive: true });
  const credits = await readCredits();
  const usedIds = new Set(Object.values(credits).map((c) => c?.unsplashId).filter(Boolean));
  const failures = [];

  for (const [slug, t] of Object.entries(TEMPLATES)) {
    const target = join(OUT, `${slug}.jpg`);
    const own = join(PHOTOS, `${slug}.jpg`);

    try {
      if (existsSync(target) && !force && !existsSync(own)) {
        console.log(`skip     ${slug} (already exists; use --force to rebuild)`);
        continue;
      }

      let buffer;
      if (existsSync(own)) {
        buffer = readFileSync(own);
        console.log(`local    ${slug} <- public/products/photos/${slug}.jpg`);
      } else {
        const found = await fetchPhoto(t.query, key, usedIds);
        buffer = found.buffer;
        credits[slug] = found.credit;
        console.log(`unsplash ${slug} (${found.credit.photographer})`);
      }

      await writeFile(target, await composeTemplate(buffer, slug));
    } catch (err) {
      failures.push(slug);
      console.error(`FAILED   ${slug}: ${err.message}`);
    }
  }

  await mkdir(dirname(CREDITS), { recursive: true });
  await writeFile(CREDITS, JSON.stringify(credits, null, 2) + "\n");

  if (failures.length) {
    console.error(`\n${failures.length} failed: ${failures.join(", ")}. Re-run to retry them.`);
    process.exit(1);
  }
  console.log("\nDone. Credits saved to public/products/photo-credits.json");
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main().catch((err) => {
    console.error(err.message);
    process.exit(1);
  });
}
