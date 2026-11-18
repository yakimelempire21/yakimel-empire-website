/**
 * Live demos shown at /demo — sample businesses visitors can click through
 * before buying. Everything here is sample content; nothing is booked or sold.
 *
 * PHOTOS: drop real photos into public/demos/<slug>/ using the file names below
 * (hero.jpg, 1.jpg, 2.jpg …; store products use <product id>.jpg). Until a file
 * exists, the demo shows a styled placeholder in its place.
 */

export type ChatQA = { q: string; a: string; keywords?: string[] };
export type ChatConfig = { greeting: string; qa: ChatQA[] };

export type Theme = {
  bg: string;
  surface: string;
  ink: string;
  muted: string;
  accent: string;
  accentInk: string;
  soft: string;
  font: "serif" | "sans";
};

export type Photo = { src: string; alt: string };

type Base = {
  slug: string;
  name: string;
  businessType: string;
  /** Pricing package this demo sells (used for the "Get this" button). */
  pkg: "Business Website Package" | "Clinic Package" | "Shopify Store Rebuild";
  pkgLabel: string;
  tagline: string;
  intro: string;
  theme: Theme;
  hero: Photo;
  gallery: Photo[];
  location: string;
  phone: string;
  hours: [string, string][];
  reviews: { name: string; text: string }[];
  /** Shown on the /demo hub card. */
  features: string[];
};

export type ServiceItem = { name: string; duration: string; price: number; desc?: string; /** File name in public/demos/<slug>/ */ photo?: string };
export type BookingSite = Base & {
  kind: "booking";
  bookLabel: string;
  services: { category: string; items: ServiceItem[] }[];
  times: string[];
  policy: string;
};

export type MenuItem = { name: string; price: number; desc?: string; tag?: string; /** File name in public/demos/<slug>/ */ photo?: string };
export type CafeSite = Base & { kind: "menu"; menu: { category: string; items: MenuItem[] }[] };

export type Product = { id: string; name: string; price: number; category: string; desc: string; tone: string };
export type StoreSite = Base & { kind: "store"; categories: string[]; products: Product[]; freeShipping: number };

export type DemoSite = BookingSite | CafeSite | StoreSite;

const photo = (slug: string, file: string, alt: string): Photo => ({ src: `/demos/${slug}/${file}`, alt });
const gallery = (slug: string, alts: string[]) => alts.map((alt, i) => photo(slug, `${i + 1}.jpg`, alt));


export const DEMO_SITES: DemoSite[] = [
  {
    kind: "booking",
    slug: "clinic",
    name: "Bonsante Family Clinic",
    businessType: "Medical clinic",
    pkg: "Clinic Package",
    pkgLabel: "Clinic · $3,000 + $399/mo",
    tagline: "Care for the whole family, close to home.",
    intro:
      "Primary care, pediatrics and women's health in Brooklyn. Book online in under a minute.",
    theme: { bg: "#F5FAFB", surface: "#FFFFFF", ink: "#0B2E3C", muted: "#4C6A75", accent: "#0E7C86", accentInk: "#FFFFFF", soft: "#DDF1F2", font: "sans" },
    hero: photo("clinic", "hero.jpg", "Doctor talking with a patient in a bright exam room"),
    gallery: gallery("clinic", ["Reception area", "Exam room", "Pediatric corner", "Our care team"]),
    location: "1240 Flatbush Ave, Brooklyn, NY",
    phone: "(718) 555-0142",
    hours: [
      ["Mon – Fri", "8:00 AM – 6:00 PM"],
      ["Saturday", "9:00 AM – 2:00 PM"],
      ["Sunday", "Closed"],
    ],
    reviews: [
      { name: "Guerline P.", text: "Booked at 11 PM from my phone. The doctor was patient and kind." },
      { name: "Marcus T.", text: "Short wait, clean office, and they explained everything. My kids actually like coming here." },
      { name: "Rose-Anne J.", text: "They speak Kreyòl and French, which made my mother feel at home." },
    ],
    bookLabel: "Book an appointment",
    services: [
      {
        category: "Visits",
        items: [
          { name: "Primary care visit", duration: "30 min", price: 0, desc: "Check-ups, follow-ups, prescriptions. Most insurance accepted." },
          { name: "New patient visit", duration: "45 min", price: 0, desc: "Full history, exam and care plan." },
          { name: "Telehealth video visit", duration: "20 min", price: 0, desc: "See a provider from home." },
        ],
      },
      {
        category: "Specialties",
        items: [
          { name: "Pediatrics", duration: "30 min", price: 0, desc: "Well-child visits, vaccines, school forms." },
          { name: "Women's health", duration: "30 min", price: 0, desc: "Annual exams, prenatal visits, family planning." },
          { name: "Lab work", duration: "15 min", price: 0, desc: "Blood work on site. Results in your patient portal." },
        ],
      },
    ],
    times: ["8:30 AM", "9:15 AM", "10:00 AM", "11:30 AM", "1:00 PM", "2:15 PM", "3:30 PM", "4:45 PM"],
    policy: "Please bring your ID and insurance card. Arrive 10 minutes early for your first visit.",
    features: ["Online booking", "Patient intake"],
  },
  {
    kind: "menu",
    slug: "cafe",
    name: "Lakay Coffee",
    businessType: "Coffee & drinks",
    pkg: "Business Website Package",
    pkgLabel: "Business Website · $1,500 + $199/mo",
    tagline: "Haitian coffee, fresh juice and warm pastries.",
    intro: "Small-batch coffee from the mountains of Haiti, cold drinks made to order and pastries baked every morning. Order ahead and skip the line.",
    theme: { bg: "#FBF6EF", surface: "#FFFFFF", ink: "#2B1A10", muted: "#6E5646", accent: "#B4532A", accentInk: "#FFFFFF", soft: "#F3E3D3", font: "serif" },
    hero: photo("cafe", "hero.jpg", "Latte with leaf foam art"),
    gallery: [
      photo("cafe", "cappuccino.jpg", "Cappuccino with cinnamon"),
      photo("cafe", "iced-caramel-latte.jpg", "Iced caramel latte"),
      photo("cafe", "pen-patat.jpg", "Pen patat, Haitian sweet potato pudding"),
      photo("cafe", "mango-smoothie.jpg", "Mango smoothie"),
    ],
    location: "88 Church Ave, Brooklyn, NY",
    phone: "(347) 555-0118",
    hours: [
      ["Mon – Fri", "6:30 AM – 7:00 PM"],
      ["Sat – Sun", "7:30 AM – 8:00 PM"],
    ],
    reviews: [
      { name: "Nadège L.", text: "The Haitian espresso tastes like home. Ordering ahead on my way to work is a game changer." },
      { name: "Chris W.", text: "Best iced latte in the neighborhood, and the passion fruit juice is incredible." },
      { name: "Fabiola D.", text: "Friendly staff, cozy place, and the pâté is always fresh." },
    ],
    menu: [
      {
        category: "Coffee",
        items: [
          { name: "Haitian espresso", price: 3.5, desc: "Single origin, dark chocolate notes", tag: "House favorite", photo: "espresso.jpg" },
          { name: "Kafe nwa", price: 3.0, desc: "Haitian drip coffee, strong and smooth", photo: "drip-coffee.jpg" },
          { name: "Café au lait", price: 4.75, desc: "Espresso and steamed milk, served in a bowl", photo: "cafe-au-lait.jpg" },
          { name: "Vanilla latte", price: 5.5, desc: "Espresso, milk, house vanilla", photo: "hero.jpg" },
          { name: "Cappuccino", price: 5.0, desc: "Thick foam, a touch of cinnamon", photo: "cappuccino.jpg" },
          { name: "Chokola", price: 5.25, desc: "Haitian hot chocolate, cinnamon and nutmeg", photo: "hot-chocolate.jpg" },
        ],
      },
      {
        category: "Cold drinks",
        items: [
          { name: "Passion fruit juice", price: 6.0, desc: "Fresh grenadia, a touch of lime", tag: "New", photo: "passion-fruit-juice.jpg" },
          { name: "Iced caramel latte", price: 6.25, desc: "Espresso, milk, caramel, ice", photo: "iced-caramel-latte.jpg" },
          { name: "Cold brew", price: 5.0, desc: "Steeped 18 hours", photo: "cold-brew.jpg" },
          { name: "Mango smoothie", price: 7.0, desc: "Mango, banana, coconut milk", photo: "mango-smoothie.jpg" },
          { name: "Lime lemonade", price: 4.5, desc: "Fresh lime, cane sugar, mint", photo: "lemonade.jpg" },
        ],
      },
      {
        category: "Pastries",
        items: [
          { name: "Pâté kòde (chicken)", price: 4.0, desc: "Crispy pastry, spiced chicken", tag: "Lakay classic", photo: "pate-kode.jpg" },
          { name: "Pen patat", price: 4.5, desc: "Haitian sweet potato pudding", photo: "pen-patat.jpg" },
          { name: "Butter croissant", price: 3.75, desc: "Baked every morning", photo: "croissant.jpg" },
          { name: "Banana bread", price: 3.95, desc: "Ripe bananas, brown sugar", photo: "banana-bread.jpg" },
        ],
      },
    ],
    features: ["Menu with prices", "Order ahead for pickup", "Catering requests"],
  },
  {
    kind: "booking",
    slug: "waxing",
    name: "Silk Wax Bar",
    businessType: "Waxing studio",
    pkg: "Business Website Package",
    pkgLabel: "Business Website · $1,500 + $199/mo",
    tagline: "Smooth skin. Quick, clean, comfortable.",
    intro: "Professional waxing for women and men, with gentle hard wax for sensitive skin. Book online in seconds.",
    theme: { bg: "#FFF8F4", surface: "#FFFFFF", ink: "#3A1F1A", muted: "#7A5A52", accent: "#C0705A", accentInk: "#FFFFFF", soft: "#F8E2D8", font: "serif" },
    hero: photo("waxing", "hero.jpg", "Calm, softly lit waxing room"),
    gallery: gallery("waxing", ["Treatment room", "Our products", "Front desk", "Aftercare kit"]),
    location: "410 Nostrand Ave, Brooklyn, NY",
    phone: "(929) 555-0176",
    hours: [
      ["Tue – Fri", "10:00 AM – 8:00 PM"],
      ["Saturday", "9:00 AM – 6:00 PM"],
      ["Sun – Mon", "Closed"],
    ],
    reviews: [
      { name: "Tamara B.", text: "Fastest Brazilian I've ever had and barely any pain. Super clean studio." },
      { name: "Kervens A.", text: "First time getting my back waxed. Very professional and made me comfortable." },
      { name: "Lisa M.", text: "Booking online is so easy, I do it in a minute." },
    ],
    bookLabel: "Book now",
    services: [
      {
        category: "Face",
        items: [
          { name: "Eyebrow shaping", duration: "15 min", price: 20 },
          { name: "Upper lip", duration: "10 min", price: 12 },
          { name: "Full face", duration: "30 min", price: 45 },
        ],
      },
      {
        category: "Body",
        items: [
          { name: "Brazilian", duration: "30 min", price: 60, desc: "Hard wax, sensitive-skin friendly" },
          { name: "Bikini line", duration: "20 min", price: 40 },
          { name: "Full legs", duration: "45 min", price: 70 },
          { name: "Underarms", duration: "15 min", price: 22 },
          { name: "Back (men)", duration: "30 min", price: 55 },
        ],
      },
    ],
    times: ["10:00 AM", "10:45 AM", "11:30 AM", "1:00 PM", "2:30 PM", "4:00 PM", "5:15 PM", "6:30 PM"],
    policy: "Hair should be at least ¼ inch long. Please give 24 hours notice to cancel.",
    features: ["Service menu with prices", "Online booking"],
  },
  {
    kind: "booking",
    slug: "lashes",
    name: "Velvet Lash Studio",
    businessType: "Eyelash studio",
    pkg: "Business Website Package",
    pkgLabel: "Business Website · $1,500 + $199/mo",
    tagline: "Lashes that wake up with you.",
    intro: "Classic, hybrid and volume lash extensions, plus lifts and tints, by certified lash artists. Pick your set, choose a time, done.",
    theme: { bg: "#FBF7FA", surface: "#FFFFFF", ink: "#24141F", muted: "#6B5465", accent: "#8E3B6E", accentInk: "#FFFFFF", soft: "#F1E1EB", font: "serif" },
    hero: photo("lashes", "hero.jpg", "Close-up of volume lash extensions"),
    gallery: gallery("lashes", ["Classic set", "Hybrid set", "Volume set", "Lash lift"]),
    location: "215 Utica Ave, Brooklyn, NY",
    phone: "(646) 555-0193",
    hours: [
      ["Mon – Sat", "9:00 AM – 7:00 PM"],
      ["Sunday", "By appointment"],
    ],
    reviews: [
      { name: "Shanice R.", text: "My hybrid set lasted almost 4 weeks. Everyone asks where I get my lashes done." },
      { name: "Widline C.", text: "So relaxing I fell asleep. Beautiful, natural-looking work." },
      { name: "Ana G.", text: "Love that I can book my fill from Instagram in two clicks." },
    ],
    bookLabel: "Book your set",
    services: [
      {
        category: "Full sets",
        items: [
          { name: "Classic full set", duration: "2 hr", price: 120, desc: "One extension per natural lash, natural look" },
          { name: "Hybrid full set", duration: "2 hr 15 min", price: 150, desc: "Mix of classic and volume" },
          { name: "Volume full set", duration: "2 hr 30 min", price: 180, desc: "Full, fluffy and dramatic" },
        ],
      },
      {
        category: "Fills & more",
        items: [
          { name: "2-week fill", duration: "1 hr", price: 65 },
          { name: "3-week fill", duration: "1 hr 15 min", price: 80 },
          { name: "Lash lift & tint", duration: "1 hr", price: 85 },
          { name: "Removal", duration: "20 min", price: 25 },
        ],
      },
    ],
    times: ["9:00 AM", "11:30 AM", "12:00 PM", "2:00 PM", "3:30 PM", "4:30 PM"],
    policy: "A $30 deposit holds your spot and goes toward your service. Fills need at least 40% of lashes remaining.",
    features: ["Lash menu with prices", "Online booking + deposit"],
  },
  {
    kind: "booking",
    slug: "nails",
    name: "Gloss & Co. Nail Bar",
    businessType: "Nail tech",
    pkg: "Business Website Package",
    pkgLabel: "Business Website · $1,500 + $199/mo",
    tagline: "Nails done right, every time.",
    intro: "Gel manicures, acrylic and Gel-X sets, custom nail art and spa pedicures. See our work, pick a style and book your chair.",
    theme: { bg: "#FFF7F8", surface: "#FFFFFF", ink: "#2A1418", muted: "#735259", accent: "#D14B6A", accentInk: "#FFFFFF", soft: "#FBE1E7", font: "sans" },
    hero: photo("nails", "hero.jpg", "Almond nails with brown polka dots and cream stripes"),
    gallery: [
      photo("nails", "tortoise-almond.jpg", "Tortoiseshell almond set with gold studs"),
      photo("nails", "pink-hearts.jpg", "Pink French tips with hearts"),
      photo("nails", "tropical-3d.jpg", "Tropical 3D flowers and shells"),
      photo("nails", "gel-toes.jpg", "Lilac French toes with butterflies"),
      photo("nails", "brown-swirl.jpg", "Brown and white swirl almond nails"),
      photo("nails", "winter-bows.jpg", "Winter set with bows and snowflakes"),
      photo("nails", "white-3d-flower.jpg", "White 3D flowers with gold beads"),
      photo("nails", "toes-teal-star.jpg", "Teal cat-eye toes with gold stars"),
      photo("nails", "fall-floral.jpg", "Fall florals with leopard tips"),
      photo("nails", "tortoise-gold-cross.jpg", "Tortoise and gold chrome accents"),
      photo("nails", "toes-butterfly-glitter.jpg", "Glitter toes with gold butterflies"),
      photo("nails", "toes-white-gems.jpg", "Milky white toes with crystals"),
    ],
    location: "1502 Rogers Ave, Brooklyn, NY",
    phone: "(718) 555-0167",
    hours: [
      ["Mon – Sat", "10:00 AM – 8:00 PM"],
      ["Sunday", "11:00 AM – 5:00 PM"],
    ],
    reviews: [
      { name: "Jessica E.", text: "My Gel-X set looked exactly like the inspo picture. Lasted 3 weeks with no lifting." },
      { name: "Mirlande S.", text: "Clean tools, cute space and the nail art is next level." },
      { name: "Kim H.", text: "I book every two weeks from the website. Never had to wait." },
    ],
    bookLabel: "Book a chair",
    services: [
      {
        category: "Hands",
        items: [
          { name: "Gel manicure", duration: "45 min", price: 40, desc: "Clean, glossy and natural", photo: "gel-manicure.jpg" },
          { name: "Gel-X full set", duration: "1 hr 30 min", price: 70, desc: "Soft gel extensions, any shape", photo: "gelx-hearts.jpg" },
          { name: "Acrylic full set", duration: "1 hr 30 min", price: 65, desc: "Strong, long-lasting length", photo: "white-3d-flower.jpg" },
          { name: "Nail art (per set)", duration: "+30 min", price: 20, desc: "Chrome, French, 3D, hand-painted", photo: "tropical-3d.jpg" },
        ],
      },
      {
        category: "Feet",
        items: [
          { name: "Classic pedicure", duration: "45 min", price: 40, desc: "Soak, shape, cuticles and polish", photo: "classic-pedicure.jpg" },
          { name: "Spa pedicure", duration: "1 hr", price: 55, desc: "Scrub, mask and hot towel", photo: "spa-pedicure.jpg" },
          { name: "Gel toes", duration: "40 min", price: 35, desc: "Gel color that lasts 3+ weeks", photo: "gel-toes.jpg" },
        ],
      },
    ],
    times: ["10:00 AM", "11:00 AM", "12:30 PM", "2:00 PM", "3:30 PM", "5:00 PM", "6:30 PM"],
    policy: "Please arrive on time; we hold your chair for 10 minutes. Soak-off of another salon's work is $10.",
    features: ["Gallery of your work", "Online booking"],
  },
  {
    kind: "store",
    slug: "store",
    name: "Velora Beauty",
    businessType: "Online store (Shopify)",
    pkg: "Shopify Store Rebuild",
    pkgLabel: "Shopify Store Rebuild · $2,500 + $149/mo",
    tagline: "Clean skincare for melanin-rich skin.",
    intro: "Serums, oils and body butters made with shea, moringa and coconut. Free shipping on orders over $50.",
    theme: { bg: "#F7F3EE", surface: "#FFFFFF", ink: "#1F1A16", muted: "#6B6158", accent: "#1F1A16", accentInk: "#FFFFFF", soft: "#EDE4D9", font: "serif" },
    hero: photo("store", "hero.jpg", "Skincare bottles on a stone surface"),
    gallery: [],
    location: "Ships across the US and Canada",
    phone: "(845) 555-0110",
    hours: [["Customer care", "Mon – Fri, 9 AM – 6 PM"]],
    reviews: [
      { name: "Danielle K.", text: "The glow serum faded my dark spots in a month. Shipping was fast too." },
      { name: "Stéphanie M.", text: "The body butter smells amazing and lasts all day." },
      { name: "Aisha O.", text: "Checkout was quick on my phone and I got tracking right away." },
    ],
    categories: ["All", "Face", "Body", "Hair"],
    products: [
      { id: "glow-serum", name: "Glow Vitamin C Serum", price: 34, category: "Face", desc: "Brightens dark spots and evens skin tone.", tone: "#E8B86B" },
      { id: "moringa-oil", name: "Moringa Face Oil", price: 28, category: "Face", desc: "Lightweight daily moisture, no grease.", tone: "#B9C27A" },
      { id: "gentle-cleanser", name: "Gentle Foam Cleanser", price: 22, category: "Face", desc: "Cleans without stripping.", tone: "#D9CFC4" },
      { id: "shea-butter", name: "Whipped Shea Body Butter", price: 26, category: "Body", desc: "Deep moisture for dry skin.", tone: "#EAD9BE" },
      { id: "coffee-scrub", name: "Coffee Body Scrub", price: 24, category: "Body", desc: "Smooths and wakes up your skin.", tone: "#8A5A3C" },
      { id: "growth-oil", name: "Castor Growth Hair Oil", price: 19, category: "Hair", desc: "Jamaican black castor and rosemary.", tone: "#5C3B24" },
      { id: "leave-in", name: "Curl Leave-In Cream", price: 21, category: "Hair", desc: "Defines curls, fights frizz.", tone: "#C9A9C6" },
      { id: "lip-balm", name: "Mango Lip Balm Duo", price: 12, category: "Face", desc: "Soft, glossy, never sticky.", tone: "#F0A07A" },
    ],
    freeShipping: 50,
    features: ["Product pages", "Cart & checkout", "Free-shipping bar"],
  },
];

/** The restaurant demo (Aurum) has its own hand-built page; this is its hub card. */
export const RESTAURANT_DEMO = {
  slug: "aurum",
  name: "Aurum",
  businessType: "Restaurant",
  pkgLabel: "Business Website · $1,500 + $199/mo",
  tagline: "Fine dining with online reservations.",
  image: "/products/templates/aurum-hero.jpg",
  features: ["Menu by course", "Table reservations", "Private dining"],
};

/** Old product slugs that now open one of these demos. */
export const DEMO_ALIASES: Record<string, string> = { velora: "store", savory: "cafe", bloom: "nails" };

export function getDemoSite(slug: string): DemoSite | undefined {
  return DEMO_SITES.find((d) => d.slug === slug);
}
