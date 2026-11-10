"use client";

import { useState, useMemo } from "react";
import { faqs, faqCategories } from "@/lib/faqs";
import ContactWidget from "@/components/ContactWidget";
import ChatbotWidget from "@/components/ChatbotWidget";

export default function FAQPage() {
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [openCategory, setOpenCategory] = useState<string | null>(null);

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    return faqs.filter((f) => {
      const matchesTerm = term
        ? f.q.toLowerCase().includes(term) || f.a.toLowerCase().includes(term)
        : true;
      const matchesCategory = activeCategory ? f.category === activeCategory : true;
      return matchesTerm && matchesCategory;
    });
  }, [search, activeCategory]);

  const grouped = useMemo(() => {
    const map = new Map<string, typeof faqs>();
    for (const cat of faqCategories) {
      map.set(cat, faqs.filter((f) => f.category === cat));
    }
    return map;
  }, []);

  const isBrowsing = search.trim().length > 0 || activeCategory !== null;

  return (
    <main className="bg-bg-dark text-ink-invert min-h-screen pt-32 pb-24 px-6">
      <div className="mx-auto max-w-6xl">
        <p className="font-mono text-xs uppercase tracking-widest text-brand mb-4">
          FAQ
        </p>
        <h1 className="font-display font-bold text-4xl md:text-6xl mb-4">
          How Can We <span className="text-brand">Help?</span>
        </h1>
        <p className="text-dim-invert text-lg max-w-2xl mb-10">
          Find answers to the most common questions about Yakimel Empire LLC, our applications, technology, partnerships, and more.
        </p>

        <input
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setActiveCategory(null);
          }}
          placeholder="Search questions, apps, technology, support..."
          className="w-full bg-ink-invert/5 border border-ink-invert/20 rounded-full px-6 py-4 text-ink-invert placeholder:text-dim-invert focus:outline-none focus:border-brand mb-6"
        />

        <div className="flex flex-wrap gap-2 mb-12">
          <button
            onClick={() => {
              setActiveCategory(null);
              setSearch("");
            }}
            className={
              activeCategory === null && !search
                ? "font-mono text-xs uppercase tracking-widest px-4 py-2 rounded-full border bg-brand border-brand text-white"
                : "font-mono text-xs uppercase tracking-widest px-4 py-2 rounded-full border border-ink-invert/20 text-dim-invert hover:border-ink-invert/15"
            }
          >
            All
          </button>
          {faqCategories.map((cat) => (
            <button
              key={cat}
              onClick={() => {
                setActiveCategory(cat);
                setSearch("");
              }}
              className={
                activeCategory === cat
                  ? "font-mono text-xs uppercase tracking-widest px-4 py-2 rounded-full border bg-brand border-brand text-white"
                  : "font-mono text-xs uppercase tracking-widest px-4 py-2 rounded-full border border-ink-invert/20 text-dim-invert hover:border-ink-invert/15"
              }
            >
              {cat}
            </button>
          ))}
        </div>

        {isBrowsing ? (
          <div className="space-y-6 mb-16">
            <p className="font-mono text-xs uppercase tracking-widest text-dim-invert">
              {filtered.length} questions found
            </p>
            {filtered.map((f) => (
              <div key={f.q} className="border-b border-ink-invert/15 pb-6">
                <p className="font-display font-bold text-lg mb-2">{f.q}</p>
                <p className="text-dim-invert leading-relaxed">{f.a}</p>
              </div>
            ))}
            {filtered.length === 0 && (
              <p className="text-dim-invert">No questions match your search.</p>
            )}
          </div>
        ) : (
          <div className="grid md:grid-cols-3 gap-6 mb-16">
            {faqCategories.map((cat) => {
              const items = grouped.get(cat) ?? [];
              const isOpen = openCategory === cat;
              const visibleItems = isOpen ? items : items.slice(0, 3);
              return (
                <div key={cat} className="bg-ink-invert/5 border border-ink-invert/15 rounded-2xl p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-display font-bold text-lg">{cat}</h3>
                    <span className="font-mono text-xs text-dim-invert bg-ink-invert/10 rounded-full px-2 py-1">
                      {items.length}
                    </span>
                  </div>

                  <div className="space-y-2 mb-4">
                    {visibleItems.map((f) => (
                      <p key={f.q} className="text-dim-invert text-sm leading-relaxed">
                        {f.q}
                      </p>
                    ))}
                  </div>

                  <button
                    onClick={() => setOpenCategory(isOpen ? null : cat)}
                    className="font-mono text-xs uppercase tracking-widest text-brand hover:opacity-80 transition-opacity"
                  >
                    {isOpen ? "Show less" : "View all questions"}
                  </button>

                  {isOpen && (
                    <div className="mt-6 space-y-5 border-t border-ink-invert/15 pt-5">
                      {items.map((f) => (
                        <div key={f.q}>
                          <p className="font-medium mb-1">{f.q}</p>
                          <p className="text-dim-invert text-sm leading-relaxed">{f.a}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        <div className="bg-slate-900 border border-ink-invert/15 rounded-2xl p-10 text-center">
          <h2 className="font-display font-bold text-2xl md:text-3xl mb-3">
            Can&apos;t Find What You&apos;re Looking For?
          </h2>
          <p className="text-dim-invert max-w-xl mx-auto mb-8">
            Whether you need assistance with one of our applications, have a technology or partnership inquiry, or simply want to learn more about Yakimel Empire, our team is here to help.
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <ContactWidget />
            <ChatbotWidget />
          </div>
        </div>
      </div>
    </main>
  );
}