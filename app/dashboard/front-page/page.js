"use client";

import { useState, useEffect } from "react";
import {
  Save, Loader2, RefreshCw, Plus, Trash2,
  ChevronDown, ChevronUp, Image, BarChart2,
  Layers, BookOpen, Briefcase, Star, MessageSquare,
  Megaphone, HelpCircle, Ticket
} from "lucide-react";

const API_BASE = "https://achal-backend-trial.tannis.in/api/frontpage";
const UPLOAD_API = "https://achal-backend-trial.tannis.in/api/uploads";

// ─── File to Base64 converter ──────────────────────────────────────────────────
const fileToBase64 = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

// ─── Shared style constants ───────────────────────────────────────────────────
const inputCls =
  "w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all bg-gray-50 text-gray-800 text-sm";
const textareaCls =
  "w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all bg-gray-50 text-gray-800 resize-none text-sm";

// ─── Small reusables ──────────────────────────────────────────────────────────
function Field({ label, hint, children }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      {hint && <p className="text-xs text-gray-400 mb-1.5">{hint}</p>}
      {children}
    </div>
  );
}

function ListCard({ children, onRemove, canRemove }) {
  return (
    <div className="flex gap-3 items-start p-4 bg-gray-50 border border-gray-100 rounded-xl">
      <div className="flex-1 space-y-3">{children}</div>
      {canRemove && (
        <button
          type="button"
          onClick={onRemove}
          className="mt-7 p-2 text-red-400 hover:bg-red-50 hover:text-red-600 rounded-lg transition-colors flex-shrink-0"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}

function AddButton({ onClick, label }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors text-sm font-medium"
    >
      <Plus className="w-4 h-4" />
      {label}
    </button>
  );
}

function Toast({ toast }) {
  if (!toast.show) return null;
  const isErr = toast.type === "error";
  return (
    <div className={`mb-6 p-4 rounded-lg flex items-center shadow-sm border ${isErr ? "bg-red-50 text-red-800 border-red-200" : "bg-green-50 text-green-800 border-green-200"}`}>
      <div className={`w-2 h-2 rounded-full mr-3 flex-shrink-0 ${isErr ? "bg-red-500" : "bg-green-500"}`} />
      <span className="font-medium text-sm">{toast.message}</span>
    </div>
  );
}

// ─── Image Upload Handler ─────────────────────────────────────────────────────
function ImageUploadField({ value, onChange, label, hint }) {
  const [uploading, setUploading] = useState(false);

  const handleFileSelect = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const base64 = await fileToBase64(file);
      const res = await fetch(UPLOAD_API, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          filename: file.name,
          mimeType: file.type,
          data: base64,
        }),
      });

      if (!res.ok) throw new Error("Upload failed");
      const result = await res.json();
      onChange(result.url || result.path);
    } catch (err) {
      console.error("Upload error:", err);
      alert(`Upload failed: ${err.message}`);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      {hint && <p className="text-xs text-gray-400 mb-1.5">{hint}</p>}
      <div className="flex gap-2">
        <input
          type="url"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={inputCls}
          placeholder="https://images.unsplash.com/photo-…"
        />
        <label className="relative">
          <input
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            disabled={uploading}
            className="hidden"
          />
          <button
            type="button"
            onClick={(e) => e.currentTarget.parentElement.querySelector('input[type="file"]').click()}
            disabled={uploading}
            className="px-4 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
          >
            {uploading ? "Uploading..." : "Upload"}
          </button>
        </label>
      </div>
    </div>
  );
}

// ─── Collapsible Section ──────────────────────────────────────────────────────
function Section({ icon: Icon, number, title, subtitle, children, defaultOpen = true, badge }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between bg-gray-50 px-6 py-4 border-b border-gray-100 text-left hover:bg-gray-100/70 transition-colors"
      >
        <div className="flex items-center gap-3">
          {Icon && (
            <span className="p-1.5 bg-blue-100 text-blue-600 rounded-lg">
              <Icon className="w-4 h-4" />
            </span>
          )}
          <div>
            <h2 className="text-sm font-semibold text-gray-800 flex items-center gap-2">
              <span className="text-blue-400 font-bold">{number}.</span>
              {title}
              {badge !== undefined && (
                <span className="ml-1 px-2 py-0.5 bg-blue-100 text-blue-600 rounded-full text-xs font-medium">
                  {badge}
                </span>
              )}
            </h2>
            {subtitle && <p className="text-xs text-gray-400 mt-0.5">{subtitle}</p>}
          </div>
        </div>
        {open ? <ChevronUp className="w-4 h-4 text-gray-400 flex-shrink-0" /> : <ChevronDown className="w-4 h-4 text-gray-400 flex-shrink-0" />}
      </button>
      {open && <div className="p-6">{children}</div>}
    </div>
  );
}

// ─── Default form state ───────────────────────────────────────────────────────
const BLANK = {
  heroSlides: [{ img: "", label: "" }],
  tickerItems: [{ label: "", value: "" }],
  yoe: "",
  numberOfClients: "",
  numberOfProjects: "",
  teamMembers: "",
  services: [{ name: "", description: "" }],
  aboutHeading: "",
  aboutBody: "",
  aboutQuote: "",
  aboutBody2: "",
  aboutValues: [{ title: "", desc: "" }],
  portfolioItems: [{ img: "", tag: "", name: "" }],
  whypartner: [{ title: "", description: "" }],
  testimonials: [{ quote: "", name: "", role: "", rating: "", image: "" }],
  ctaHeadline: "",
  ctaSubtext: "",
  mission: "",
  vision: "",
  commitment: "",
};

// ─── JSON parse helper ────────────────────────────────────────────────────────
const safeParse = (raw, fallback) => {
  if (!raw) return fallback;
  try {
    const p = JSON.parse(raw);
    return Array.isArray(p) && p.length ? p : fallback;
  } catch {
    return fallback;
  }
};

// ─── Main Component ───────────────────────────────────────────────────────────
export default function FrontPage() {
  const [form, setForm] = useState(BLANK);
  const [recordId, setRecordId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState({ show: false, message: "", type: "success" });

  const showToast = (msg, type = "success") => {
    setToast({ show: true, message: msg, type });
    setTimeout(() => setToast({ show: false, message: "", type: "success" }), 3500);
  };

  // ── Fetch ──────────────────────────────────────────────────────────────────
  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await fetch(API_BASE);
      if (!res.ok) throw new Error();
      const data = await res.json();
      const rec = Array.isArray(data) ? data[0] : data;
      if (rec) {
        setRecordId(rec.id ?? null);
        setForm({
          heroSlides: safeParse(rec.heroSlides, [{ img: "", label: "" }]),
          tickerItems: safeParse(rec.tickerItems, [{ label: "", value: "" }]),
          yoe: rec.yoe ?? "",
          numberOfClients: rec.numberOfClients ?? "",
          numberOfProjects: rec.numberOfProjects ?? "",
          teamMembers: rec.teamMembers ?? "",
          services: safeParse(rec.services, [{ name: "", description: "" }]),
          aboutHeading: rec.aboutHeading ?? "",
          aboutBody: rec.aboutBody ?? "",
          aboutQuote: rec.aboutQuote ?? "",
          aboutBody2: rec.aboutBody2 ?? "",
          aboutValues: safeParse(rec.aboutValues, [{ title: "", desc: "" }]),
          portfolioItems: safeParse(rec.portfolioItems, [{ img: "", tag: "", name: "" }]),
          whypartner: safeParse(rec.whyPartner, [{ title: "", description: "" }]),
          testimonials: safeParse(rec.testimonials, [{ quote: "", name: "", role: "", rating: "", image: "" }]),
          ctaHeadline: rec.ctaHeadline ?? "",
          ctaSubtext: rec.ctaSubtext ?? "",
          mission: rec.mission ?? "",
          vision: rec.vision ?? "",
          commitment: rec.commitment ?? "",
        });
      }
    } catch {
      showToast("Failed to load data. Backend may be unreachable.", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  // ── State helpers ──────────────────────────────────────────────────────────
  const set = (key, val) => setForm((f) => ({ ...f, [key]: val }));

  const setItem = (key, idx, field, val) =>
    setForm((f) => {
      const arr = [...f[key]];
      arr[idx] = { ...arr[idx], [field]: val };
      return { ...f, [key]: arr };
    });

  const addItem = (key, blank) => setForm((f) => ({ ...f, [key]: [...f[key], { ...blank }] }));
  const removeItem = (key, idx) => setForm((f) => ({ ...f, [key]: f[key].filter((_, i) => i !== idx) }));

  // ── Submit ─────────────────────────────────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    const payload = {
      heroSlides: JSON.stringify(form.heroSlides),
      tickerItems: JSON.stringify(form.tickerItems),
      yoe: form.yoe ? parseInt(form.yoe, 10) : null,
      numberOfClients: form.numberOfClients ? parseInt(form.numberOfClients, 10) : null,
      numberOfProjects: form.numberOfProjects ? parseInt(form.numberOfProjects, 10) : null,
      teamMembers: form.teamMembers ? parseInt(form.teamMembers, 10) : null,
      services: JSON.stringify(form.services),
      aboutHeading: form.aboutHeading,
      aboutBody: form.aboutBody,
      aboutQuote: form.aboutQuote,
      aboutBody2: form.aboutBody2,
      aboutValues: JSON.stringify(form.aboutValues),
      portfolioItems: JSON.stringify(form.portfolioItems),
      whyPartner: JSON.stringify(form.whypartner),
      testimonials: JSON.stringify(form.testimonials),
      ctaHeadline: form.ctaHeadline,
      ctaSubtext: form.ctaSubtext,
      mission: form.mission,
      vision: form.vision,
      commitment: form.commitment,
    };
    try {
      const url = recordId ? `${API_BASE}/${recordId}` : API_BASE;
      const method = recordId ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error();
      const result = await res.json();
      if (!recordId && result.id) setRecordId(result.id);
      showToast("Front page saved successfully!");
    } catch {
      showToast("Error saving data. Please try again.", "error");
    } finally {
      setSaving(false);
    }
  };

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="max-w-5xl mx-auto pb-12">

      {/* Page header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Front Page</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Manage all content visible on the public-facing homepage.
          </p>
        </div>
        <button
          onClick={fetchData}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 text-gray-600 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          Refresh
        </button>
      </div>

      <Toast toast={toast} />

      {loading ? (
        <div className="bg-white rounded-xl border border-gray-100 p-12 flex flex-col items-center justify-center min-h-[400px]">
          <Loader2 className="w-8 h-8 text-blue-500 animate-spin mb-4" />
          <p className="text-gray-400 text-sm">Loading front page data…</p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-5">

          {/* 1. Hero Slides */}
          <Section number="1" icon={Image} title="Hero Slides"
            subtitle="Rotating background images and labels in the hero section."
            badge={form.heroSlides.length}>
            <div className="space-y-3 mb-3">
              {form.heroSlides.map((s, i) => (
                <ListCard key={i} onRemove={() => removeItem("heroSlides", i)} canRemove={form.heroSlides.length > 1}>
                  <ImageUploadField
                    label="Image URL"
                    hint="High-res recommended (1400px+). Upload or paste URL."
                    value={s.img}
                    onChange={(url) => setItem("heroSlides", i, "img", url)}
                  />
                  {s.img && (
                    <div className="rounded-lg overflow-hidden h-24 bg-gray-200">
                      <img src={s.img} alt="preview" className="w-full h-full object-cover opacity-80" />
                    </div>
                  )}
                  <Field label="Slide Label" hint="Short label shown bottom-right on desktop">
                    <input type="text" value={s.label}
                      onChange={(e) => setItem("heroSlides", i, "label", e.target.value)}
                      className={inputCls} placeholder="e.g. Civil Engineering" />
                  </Field>
                </ListCard>
              ))}
            </div>
            <AddButton onClick={() => addItem("heroSlides", { img: "", label: "" })} label="Add Slide" />
          </Section>

          {/* 2. Ticker */}
          <Section number="2" icon={Ticket} title="Ticker Bar"
            subtitle="Scrolling marquee items beneath the hero section."
            badge={form.tickerItems.length} defaultOpen={false}>
            <div className="space-y-3 mb-3">
              {form.tickerItems.map((t, i) => (
                <ListCard key={i} onRemove={() => removeItem("tickerItems", i)} canRemove={form.tickerItems.length > 1}>
                  <div className="grid grid-cols-2 gap-3">
                    <Field label="Value" hint="Bold gold text — leave empty if none">
                      <input type="text" value={t.value}
                        onChange={(e) => setItem("tickerItems", i, "value", e.target.value)}
                        className={inputCls} placeholder="e.g. 500+" />
                    </Field>
                    <Field label="Label">
                      <input type="text" value={t.label}
                        onChange={(e) => setItem("tickerItems", i, "label", e.target.value)}
                        className={inputCls} placeholder="e.g. Projects Delivered" />
                    </Field>
                  </div>
                </ListCard>
              ))}
            </div>
            <AddButton onClick={() => addItem("tickerItems", { label: "", value: "" })} label="Add Ticker Item" />
          </Section>

          {/* 3. Stats */}
          <Section number="3" icon={BarChart2} title="Statistics Strip"
            subtitle="Animated counters shown in the dark stats band.">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {[
                { label: "Years of Excellence", key: "yoe", ph: "e.g. 12" },
                { label: "Global Clients", key: "numberOfClients", ph: "e.g. 4000" },
                { label: "Projects Delivered", key: "numberOfProjects", ph: "e.g. 500" },
                { label: "Specialists On Board", key: "teamMembers", ph: "e.g. 200" },
              ].map(({ label, key, ph }) => (
                <Field key={key} label={label}>
                  <input type="number" min="0" value={form[key]}
                    onChange={(e) => set(key, e.target.value)}
                    className={inputCls} placeholder={ph} />
                </Field>
              ))}
            </div>
          </Section>

          {/* 4. Services */}
          <Section number="4" icon={Layers} title="Services"
            subtitle="Cards in the 'Five Pillars of Industrial Excellence' section."
            badge={form.services.length}>
            <div className="space-y-3 mb-3">
              {form.services.map((svc, i) => (
                <ListCard key={i} onRemove={() => removeItem("services", i)} canRemove={form.services.length > 1}>
                  <Field label="Service Name">
                    <input type="text" value={svc.name}
                      onChange={(e) => setItem("services", i, "name", e.target.value)}
                      className={inputCls} placeholder="e.g. Civil Engineering" />
                  </Field>
                  <Field label="Short Description" hint="Max 150 characters">
                    <input type="text" value={svc.description}
                      onChange={(e) => setItem("services", i, "description", e.target.value)}
                      maxLength={150} className={inputCls}
                      placeholder="Precision structural development & large-scale infrastructure…" />
                  </Field>
                </ListCard>
              ))}
            </div>
            <AddButton onClick={() => addItem("services", { name: "", description: "" })} label="Add Service" />
          </Section>

          {/* 5. About */}
          <Section number="5" icon={BookOpen} title="About Section"
            subtitle="Text, blockquote, and core value cards in the amber about section."
            defaultOpen={false}>
            <div className="space-y-5">
              <Field label="Section Heading">
                <input type="text" value={form.aboutHeading}
                  onChange={(e) => set("aboutHeading", e.target.value)}
                  className={inputCls} placeholder="The Name ACHAL Means Unwavering" />
              </Field>
              <Field label="Body Paragraph 1">
                <textarea rows={3} value={form.aboutBody}
                  onChange={(e) => set("aboutBody", e.target.value)} className={textareaCls}
                  placeholder="ACHAL INTERNATIONAL PRIVATE LIMITED was incorporated in 2014…" />
              </Field>
              <Field label="Pull Quote" hint="Displayed as a styled blockquote">
                <input type="text" value={form.aboutQuote}
                  onChange={(e) => set("aboutQuote", e.target.value)}
                  className={inputCls} placeholder="Unyielding quality in a world that demands constant change." />
              </Field>
              <Field label="Body Paragraph 2">
                <textarea rows={3} value={form.aboutBody2}
                  onChange={(e) => set("aboutBody2", e.target.value)} className={textareaCls}
                  placeholder="Registered in Bihar, we have grown into a multi-disciplinary powerhouse…" />
              </Field>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-medium text-gray-700">Core Values (2×2 grid)</label>
                  <AddButton onClick={() => addItem("aboutValues", { title: "", desc: "" })} label="Add Value" />
                </div>
                <div className="space-y-3">
                  {form.aboutValues.map((v, i) => (
                    <ListCard key={i} onRemove={() => removeItem("aboutValues", i)} canRemove={form.aboutValues.length > 1}>
                      <div className="grid grid-cols-2 gap-3">
                        <Field label="Title">
                          <input type="text" value={v.title}
                            onChange={(e) => setItem("aboutValues", i, "title", e.target.value)}
                            className={inputCls} placeholder="e.g. Excellence" />
                        </Field>
                        <Field label="Description">
                          <input type="text" value={v.desc}
                            onChange={(e) => setItem("aboutValues", i, "desc", e.target.value)}
                            className={inputCls} placeholder="Setting the gold standard in every project." />
                        </Field>
                      </div>
                    </ListCard>
                  ))}
                </div>
              </div>

              <div className="pt-3 border-t border-gray-100 space-y-4">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-widest">Mission / Vision / Commitment</p>
                <Field label="Mission">
                  <textarea rows={2} value={form.mission} onChange={(e) => set("mission", e.target.value)} className={textareaCls}
                    placeholder="To provide professional, dedicated, one-point service excellence…" />
                </Field>
                <Field label="Vision">
                  <textarea rows={2} value={form.vision} onChange={(e) => set("vision", e.target.value)} className={textareaCls}
                    placeholder="A future where sustainable infrastructure powers every community." />
                </Field>
                <Field label="Commitment">
                  <textarea rows={2} value={form.commitment} onChange={(e) => set("commitment", e.target.value)} className={textareaCls}
                    placeholder="Unyielding quality in a world that demands constant change." />
                </Field>
              </div>
            </div>
          </Section>

          {/* 6. Portfolio */}
          <Section number="6" icon={Briefcase} title="Portfolio / Signature Projects"
            subtitle="Project images in the 'Our Work' grid. First item spans full width."
            badge={form.portfolioItems.length} defaultOpen={false}>
            <div className="space-y-3 mb-3">
              {form.portfolioItems.map((p, i) => (
                <ListCard key={i} onRemove={() => removeItem("portfolioItems", i)} canRemove={form.portfolioItems.length > 1}>
                  {i === 0 && (
                    <p className="text-xs font-semibold text-blue-500 uppercase tracking-wider">★ Featured — full-width banner</p>
                  )}
                  <ImageUploadField
                    label="Image URL"
                    hint="Upload or paste URL. Portrait images recommended."
                    value={p.img}
                    onChange={(url) => setItem("portfolioItems", i, "img", url)}
                  />
                  {p.img && (
                    <div className="rounded-lg overflow-hidden h-20 bg-gray-200">
                      <img src={p.img} alt="preview" className="w-full h-full object-cover opacity-80" />
                    </div>
                  )}
                  <div className="grid grid-cols-2 gap-3">
                    <Field label="Category Tag">
                      <input type="text" value={p.tag}
                        onChange={(e) => setItem("portfolioItems", i, "tag", e.target.value)}
                        className={inputCls} placeholder="e.g. Civil Engineering" />
                    </Field>
                    <Field label="Project Name">
                      <input type="text" value={p.name}
                        onChange={(e) => setItem("portfolioItems", i, "name", e.target.value)}
                        className={inputCls} placeholder="e.g. Large-Scale Infrastructure Development" />
                    </Field>
                  </div>
                </ListCard>
              ))}
            </div>
            <AddButton onClick={() => addItem("portfolioItems", { img: "", tag: "", name: "" })} label="Add Project" />
          </Section>

          {/* 7. Why Partner */}
          <Section number="7" icon={HelpCircle} title="Why Partner With Us"
            subtitle="Cards in the 'ACHAL Advantage' section."
            badge={form.whypartner.length}>
            <div className="space-y-3 mb-3">
              {form.whypartner.map((wp, i) => (
                <ListCard key={i} onRemove={() => removeItem("whypartner", i)} canRemove={form.whypartner.length > 1}>
                  <Field label="Title">
                    <input type="text" value={wp.title}
                      onChange={(e) => setItem("whypartner", i, "title", e.target.value)}
                      className={inputCls} placeholder="e.g. Innovation First" />
                  </Field>
                  <Field label="Description" hint="Max 200 characters">
                    <input type="text" value={wp.description}
                      onChange={(e) => setItem("whypartner", i, "description", e.target.value)}
                      maxLength={200} className={inputCls}
                      placeholder="Cutting-edge technology and engineering solutions…" />
                  </Field>
                </ListCard>
              ))}
            </div>
            <AddButton onClick={() => addItem("whypartner", { title: "", description: "" })} label="Add Reason" />
          </Section>

          {/* 8. Testimonials */}
          <Section number="8" icon={MessageSquare} title="Testimonials"
            subtitle="Client quotes in the 'What Our Partners Say' section."
            badge={form.testimonials.length} defaultOpen={false}>
            <div className="space-y-3 mb-3">
              {form.testimonials.map((t, i) => (
                <ListCard key={i} onRemove={() => removeItem("testimonials", i)} canRemove={form.testimonials.length > 1}>
                  <ImageUploadField
                    label="Client Image"
                    hint="Upload or paste URL. Square images recommended (200x200px)."
                    value={t.image}
                    onChange={(url) => setItem("testimonials", i, "image", url)}
                  />
                  {t.image && (
                    <div className="rounded-lg overflow-hidden w-24 h-24 bg-gray-200">
                      <img src={t.image} alt="client" className="w-full h-full object-cover" />
                    </div>
                  )}
                  <Field label="Quote">
                    <textarea rows={2} value={t.quote}
                      onChange={(e) => setItem("testimonials", i, "quote", e.target.value)}
                      className={textareaCls}
                      placeholder="Exceptional engineering expertise. ACHAL delivered on time and within budget…" />
                  </Field>
                  <div className="grid grid-cols-2 gap-3">
                    <Field label="Client Name">
                      <input type="text" value={t.name}
                        onChange={(e) => setItem("testimonials", i, "name", e.target.value)}
                        className={inputCls} placeholder="e.g. Rajesh Kumar" />
                    </Field>
                    <Field label="Role / Title">
                      <input type="text" value={t.role}
                        onChange={(e) => setItem("testimonials", i, "role", e.target.value)}
                        className={inputCls} placeholder="e.g. Construction Manager" />
                    </Field>
                  </div>
                  <Field label="Rating" hint="Star rating from 1-5">
                    <select value={t.rating}
                      onChange={(e) => setItem("testimonials", i, "rating", e.target.value)}
                      className={inputCls}>
                      <option value="">Select rating…</option>
                      <option value="1">⭐ 1 - Poor</option>
                      <option value="2">⭐⭐ 2 - Fair</option>
                      <option value="3">⭐⭐⭐ 3 - Good</option>
                      <option value="4">⭐⭐⭐⭐ 4 - Very Good</option>
                      <option value="5">⭐⭐⭐⭐⭐ 5 - Excellent</option>
                    </select>
                  </Field>
                </ListCard>
              ))}
            </div>
            <AddButton onClick={() => addItem("testimonials", { quote: "", name: "", role: "", rating: "", image: "" })} label="Add Testimonial" />
          </Section>

          {/* 9. CTA */}
          <Section number="9" icon={Megaphone} title="Call-to-Action Section"
            subtitle="Headline and subtext for the bottom CTA banner."
            defaultOpen={false}>
            <div className="space-y-5">
              <Field label="Headline">
                <input type="text" value={form.ctaHeadline}
                  onChange={(e) => set("ctaHeadline", e.target.value)}
                  className={inputCls} placeholder="Ready to Build Something Great?" />
              </Field>
              <Field label="Subtext">
                <textarea rows={2} value={form.ctaSubtext}
                  onChange={(e) => set("ctaSubtext", e.target.value)} className={textareaCls}
                  placeholder="Experience the standard of ACHAL INTERNATIONAL. Professionalism that stands the test of time." />
              </Field>
            </div>
          </Section>

          {/* Save */}
          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={saving}
              className="flex items-center gap-2 px-7 py-3 bg-[#1e2336] text-white rounded-lg hover:bg-[#29324c] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#1e2336] transition-all disabled:opacity-70 disabled:cursor-not-allowed shadow-md font-semibold text-sm"
            >
              {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
              {saving ? "Saving…" : "Save Changes"}
            </button>
          </div>

        </form>
      )}
    </div>
  );
}