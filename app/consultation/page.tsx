"use client";

import { useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";

const projectTypes = [
  "Website",
  "Mobile App",
  "Web Application",
  "E-commerce Website",
  "Marketplace Platform",
  "Custom Software",
  "Other",
];

function ConsultationForm() {
  const searchParams = useSearchParams();
  const presetType = searchParams.get("type") || "";
  const presetService = searchParams.get("service") || "";

  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [ticketNumber, setTicketNumber] = useState("");

  const [fullName, setFullName] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [projectType, setProjectType] = useState(
    projectTypes.includes(presetType) ? presetType : ""
  );
  const [budget, setBudget] = useState("");
  const [timeline, setTimeline] = useState("");
  const [description, setDescription] = useState("");
  const [existingWebsite, setExistingWebsite] = useState("");
  const [additionalInfo, setAdditionalInfo] = useState(
    presetService ? `Regarding: ${presetService}` : ""
  );
  const [website, setWebsite] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("sending");

    try {
      const res = await fetch("/api/consultation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName,
          companyName,
          email,
          phone,
          projectType,
          budget,
          timeline,
          description,
          existingWebsite,
          additionalInfo,
          website,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to send");

      setTicketNumber(data.ticketNumber);
      setStatus("sent");
    } catch {
      setStatus("error");
    }
  }

  if (status === "sent") {
    return (
      <div className="bg-ink-invert/5 border border-ink-invert/15 rounded-2xl p-10 text-center max-w-xl mx-auto">
        <p className="font-display font-bold text-2xl mb-3">Request received</p>
        <p className="text-dim-invert leading-relaxed mb-2">
          Your reference number is <span className="font-mono text-brand">{ticketNumber}</span>.
        </p>
        <p className="text-dim-invert leading-relaxed">
          Yakimel Empire LLC has received your project request and will contact you regarding a consultation within 24-48 business hours. A confirmation has also been sent to your email.
        </p>
      </div>
    );
  }

  const inputStyle = { color: "#0B1220" };
  const inputClass =
    "w-full border border-slate-200 rounded-lg px-4 py-3 text-sm bg-white focus:outline-none focus:border-brand";

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-2xl p-8 md:p-10 space-y-6 max-w-2xl mx-auto">
      <input
        type="text"
        value={website}
        onChange={(e) => setWebsite(e.target.value)}
        tabIndex={-1}
        autoComplete="off"
        style={{ position: "absolute", left: "-9999px", width: "1px", height: "1px" }}
        aria-hidden="true"
      />

      <div>
        <label className="block font-mono text-xs uppercase tracking-widest text-dim mb-1">
          What would you like us to build?
        </label>
        <select
          required
          value={projectType}
          onChange={(e) => setProjectType(e.target.value)}
          style={inputStyle}
          className={inputClass}
        >
          <option value="">Select a project type</option>
          {projectTypes.map((t) => (
            <option key={t} value={t}>{t}</option>
          ))}
        </select>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <label className="block font-mono text-xs uppercase tracking-widest text-dim mb-1">Full Name</label>
          <input required value={fullName} onChange={(e) => setFullName(e.target.value)} style={inputStyle} className={inputClass} />
        </div>
        <div>
          <label className="block font-mono text-xs uppercase tracking-widest text-dim mb-1">Business / Company Name</label>
          <input value={companyName} onChange={(e) => setCompanyName(e.target.value)} style={inputStyle} className={inputClass} />
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <label className="block font-mono text-xs uppercase tracking-widest text-dim mb-1">Email</label>
          <input required type="email" value={email} onChange={(e) => setEmail(e.target.value)} style={inputStyle} className={inputClass} />
        </div>
        <div>
          <label className="block font-mono text-xs uppercase tracking-widest text-dim mb-1">Phone Number</label>
          <input value={phone} onChange={(e) => setPhone(e.target.value)} style={inputStyle} className={inputClass} />
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <label className="block font-mono text-xs uppercase tracking-widest text-dim mb-1">Estimated Budget</label>
          <input value={budget} onChange={(e) => setBudget(e.target.value)} placeholder="e.g. $2,000 - $5,000" style={inputStyle} className={inputClass} />
        </div>
        <div>
          <label className="block font-mono text-xs uppercase tracking-widest text-dim mb-1">Desired Timeline</label>
          <input value={timeline} onChange={(e) => setTimeline(e.target.value)} placeholder="e.g. 4-6 weeks" style={inputStyle} className={inputClass} />
        </div>
      </div>

      <div>
        <label className="block font-mono text-xs uppercase tracking-widest text-dim mb-1">Project Description</label>
        <textarea
          required
          rows={5}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          style={inputStyle}
          className={inputClass + " resize-none"}
        />
      </div>

      <div>
        <label className="block font-mono text-xs uppercase tracking-widest text-dim mb-1">Existing Website (optional)</label>
        <input value={existingWebsite} onChange={(e) => setExistingWebsite(e.target.value)} style={inputStyle} className={inputClass} />
      </div>

      <div>
        <label className="block font-mono text-xs uppercase tracking-widest text-dim mb-1">Additional Information</label>
        <textarea
          rows={3}
          value={additionalInfo}
          onChange={(e) => setAdditionalInfo(e.target.value)}
          style={inputStyle}
          className={inputClass + " resize-none"}
        />
      </div>

      {status === "error" && (
        <p className="text-red-600 text-sm">Something went wrong. Please try again or email us directly at info@yakimelempire.com.</p>
      )}

      <button
        type="submit"
        disabled={status === "sending"}
        className="w-full bg-brand text-white font-medium py-4 rounded-full hover:bg-brand-dark transition-colors disabled:opacity-60"
      >
        {status === "sending" ? "Sending..." : "Submit Project Request"}
      </button>
    </form>
  );
}

export default function ConsultationPage() {
  return (
    <main className="bg-bg-dark text-ink-invert min-h-screen pt-32 pb-24 px-6">
      <div className="mx-auto max-w-6xl">
        <p className="font-mono text-xs uppercase tracking-widest text-brand mb-4 text-center">
          Project Consultation
        </p>
        <h1 className="font-display font-bold text-3xl md:text-5xl mb-4 text-center">
          Tell us about your project
        </h1>
        <p className="text-dim-invert text-lg max-w-xl mx-auto mb-14 text-center leading-relaxed">
          Share a few details and our team will follow up to discuss your website or application.
        </p>

        <Suspense fallback={null}>
          <ConsultationForm />
        </Suspense>
      </div>
    </main>
  );
}