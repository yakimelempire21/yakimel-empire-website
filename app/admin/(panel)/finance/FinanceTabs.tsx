import Link from "next/link";

const TABS = [
  { id: "overview", label: "Overview", href: "/admin/finance" },
  { id: "invoices", label: "Invoices", href: "/admin/invoices" },
  { id: "expenses", label: "Expenses", href: "/admin/finance/expenses" },
  { id: "subscriptions", label: "Subscriptions", href: "/admin/finance/subscriptions" },
] as const;

export default function FinanceTabs({ active }: { active: (typeof TABS)[number]["id"] }) {
  return (
    <nav aria-label="Finance" className="mb-6 flex gap-1 overflow-x-auto border-b border-white/[0.08]">
      {TABS.map((tab) => (
        <Link
          key={tab.id}
          href={tab.href}
          aria-current={tab.id === active ? "page" : undefined}
          className={`-mb-px whitespace-nowrap border-b-2 px-4 py-2.5 text-sm transition-colors ${
            tab.id === active ? "border-[#4d8dff] text-white" : "border-transparent text-[#a2adc4] hover:text-white"
          }`}
        >
          {tab.label}
        </Link>
      ))}
    </nav>
  );
}
