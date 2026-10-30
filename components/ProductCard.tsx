import Image from "next/image";
import Link from "next/link";
import { isExternal, type Product } from "@/lib/products";

const focus =
  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand";
const btnBase =
  "inline-flex items-center justify-center rounded-lg px-4 py-2.5 text-sm font-medium text-center transition-colors";
const btnSolid = `${btnBase} bg-brand text-white hover:bg-brand-dark ${focus}`;
const btnOutline = `${btnBase} border border-white/25 text-ink-invert hover:border-white/60 hover:bg-white/5 ${focus}`;

type Props = {
  product: Product;
  onNotify: (product: Product) => void;
};

function altFor(p: Product): string {
  return p.type === "website"
    ? `${p.name} ${p.categoryLabel.toLowerCase()} website design preview`
    : `${p.name} ${p.categoryLabel.toLowerCase()} preview`;
}

function DetailsLink({ product }: { product: Product }) {
  if (isExternal(product.detailsUrl)) {
    return (
      <a
        href={product.detailsUrl}
        target="_blank"
        rel="noopener noreferrer"
        className={btnOutline}
      >
        View Details
        <span className="sr-only"> for {product.name} (opens in a new tab)</span>
      </a>
    );
  }
  return (
    <Link href={product.detailsUrl} className={btnOutline}>
      View Details
      <span className="sr-only"> for {product.name}</span>
    </Link>
  );
}

export default function ProductCard({ product, onNotify }: Props) {
  const comingSoon = product.status === "coming-soon";

  return (
    <article className="flex h-full flex-col rounded-2xl border border-white/10 bg-surface/60 p-3 transition-colors duration-300 hover:border-brand/50">
      <div className="relative aspect-[16/10] overflow-hidden rounded-xl bg-bg-dark">
        <Image
          src={product.image}
          alt={altFor(product)}
          fill
          sizes="(min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw"
          className="object-cover object-top"
        />
        {comingSoon && (
          <span className="absolute left-3 top-3 rounded-full border border-white/20 bg-bg-dark/85 px-3 py-1 font-mono text-[10px] uppercase tracking-widest text-ink-invert backdrop-blur-sm">
            Coming soon
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col px-2 pb-2 pt-4">
        <p className="font-mono text-[11px] uppercase tracking-widest text-brand">
          {product.categoryLabel}
        </p>
        <h3 className="mt-1 font-display text-xl font-bold text-ink-invert">{product.name}</h3>
        <p className="mt-2 line-clamp-2 min-h-[2.75rem] text-sm leading-snug text-dim-invert">
          {product.description}
        </p>

        <div className="mt-auto pt-5">
          {comingSoon ? (
            <button
              type="button"
              onClick={() => onNotify(product)}
              className={`${btnSolid} w-full`}
            >
              Notify me
              <span className="sr-only"> when {product.name} launches</span>
            </button>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              {product.primaryCta ? (
                <Link href={product.primaryCta.href} className={btnSolid}>
                  {product.primaryCta.label}
                  <span className="sr-only"> for {product.name}</span>
                </Link>
              ) : (
                <Link
                  href={`/demo/${product.slug}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={btnSolid}
                >
                  View Demo
                  <span className="sr-only"> of {product.name} (opens in a new tab)</span>
                </Link>
              )}
              <DetailsLink product={product} />
            </div>
          )}
        </div>
      </div>
    </article>
  );
}
