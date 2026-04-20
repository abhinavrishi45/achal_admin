"use client";

import { useState, useEffect } from "react";
import {
  Save, Loader2, RefreshCw, Plus, Trash2,
  Users, Briefcase, Handshake, ChevronDown, ChevronUp,
  Upload, CheckCircle, XCircle, Image as ImageIcon,
  FileText, Target, BarChart2, X
} from "lucide-react";

const API_BASE = process.env.NEXT_PUBLIC_BACKEND_URL || "https://achal-backend-trial.tannis.in";

// ─── Upload helper ────────────────────────────────────────────────────────────
const fileToBase64 = (file) =>
  new Promise((res, rej) => {
    const r = new FileReader();
    r.onload = () => res(r.result);
    r.onerror = (e) => rej(e);
    r.readAsDataURL(file);
  });

async function uploadFile(file) {
  if (!file) return null;
  const dataUrl = await fileToBase64(file);
  if (dataUrl.length > 1_200_000) {
    alert("Image too large. Please compress it or use a smaller image.");
    return null;
  }
  const res = await fetch(`${API_BASE}/api/upload`, {
    method: "POST",
    mode: "cors",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ filename: file.name, mimeType: file.type, data: dataUrl }),
  });
  if (!res.ok) {
    let msg = `Upload failed (${res.status})`;
    try { const j = await res.json(); msg = j.message || msg; } catch (_) {}
    throw new Error(msg);
  }
  const data = await res.json();
  return data.url || data.path || null;
}

// ─── Parse helpers ────────────────────────────────────────────────────────────
const safeParse = (raw, fallback) => {
  if (raw == null) return fallback;
  if (Array.isArray(raw)) return raw.length > 0 ? raw : fallback;
  if (typeof raw === "string") {
    if (raw.trim() === "") return fallback;
    try {
      const p = JSON.parse(raw);
      return Array.isArray(p) ? p : fallback;
    } catch { return fallback; }
  }
  return fallback;
};

// ─── Shared classes ───────────────────────────────────────────────────────────
const inputCls =
  "w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all bg-gray-50 text-gray-800 text-sm";
const textareaCls =
  "w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all bg-gray-50 text-gray-800 resize-none text-sm";

// ─── Save button ──────────────────────────────────────────────────────────────
function SaveBtn({ onClick, saving, label }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={saving}
      className="flex items-center gap-2 px-6 py-2.5 bg-[#1e2336] text-white rounded-lg hover:bg-[#29324c] transition-all disabled:opacity-60 disabled:cursor-not-allowed text-sm font-semibold shadow-sm"
    >
      {saving
        ? <><Loader2 className="w-4 h-4 animate-spin" /> Saving...</>
        : <><Save className="w-4 h-4" /> {label}</>
      }
    </button>
  );
}

// ─── Toast ────────────────────────────────────────────────────────────────────
function Toast({ toast }) {
  if (!toast?.show) return null;
  const isErr = toast.type === "error";
  return (
    <div className={`flex items-center gap-3 px-4 py-3 rounded-lg border text-sm font-medium shadow-sm mb-4 ${
      isErr ? "bg-red-50 text-red-800 border-red-200" : "bg-green-50 text-green-800 border-green-200"
    }`}>
      {isErr
        ? <XCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
        : <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
      }
      {toast.message}
    </div>
  );
}

// ─── Image Upload Field ───────────────────────────────────────────────────────
function ImageUploadField({ label, hint, value, onChange }) {
  const [uploading, setUploading] = useState(false);
  const [err, setErr] = useState("");
  const handleFile = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setErr(""); e.target.value = ""; setUploading(true);
    try { const url = await uploadFile(file); if (url) onChange(url); }
    catch (ex) { setErr(ex.message || "Upload failed"); }
    finally { setUploading(false); }
  };
  return (
    <div>
      {label && <label className="block text-xs font-medium text-gray-600 mb-1">{label}</label>}
      {hint && <p className="text-xs text-gray-400 mb-1.5">{hint}</p>}
      <div className="flex gap-2">
        <input type="url" value={value}
          onChange={(e) => { onChange(e.target.value); setErr(""); }}
          className={inputCls} placeholder="https://..." />
        <label className="relative flex-shrink-0">
          <input type="file" accept="image/*" onChange={handleFile} disabled={uploading} className="hidden" />
          <button type="button"
            onClick={(e) => e.currentTarget.parentElement.querySelector('input[type="file"]').click()}
            disabled={uploading}
            className="px-4 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5 whitespace-nowrap"
          >
            {uploading
              ? <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Uploading...</>
              : <><Upload className="w-3.5 h-3.5" /> Upload</>
            }
          </button>
        </label>
      </div>
      {err && <p className="mt-1.5 text-xs text-red-600">{err}</p>}
    </div>
  );
}

// ─── Section Shell ────────────────────────────────────────────────────────────
function SectionShell({ icon: Icon, number, title, subtitle, badge, children, defaultOpen = true }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      <button type="button" onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between bg-gray-50 px-6 py-4 border-b border-gray-100 text-left hover:bg-gray-100/70 transition-colors"
      >
        <div className="flex items-center gap-3">
          {Icon && <span className="p-1.5 bg-blue-100 text-blue-600 rounded-lg"><Icon className="w-4 h-4" /></span>}
          <div>
            <h2 className="text-sm font-semibold text-gray-800 flex items-center gap-2">
              <span className="text-blue-400 font-bold">{number}.</span>
              {title}
              {badge !== undefined && (
                <span className="px-2 py-0.5 bg-blue-100 text-blue-600 rounded-full text-xs font-medium">{badge}</span>
              )}
            </h2>
            {subtitle && <p className="text-xs text-gray-400 mt-0.5">{subtitle}</p>}
          </div>
        </div>
        {open
          ? <ChevronUp className="w-4 h-4 text-gray-400 flex-shrink-0" />
          : <ChevronDown className="w-4 h-4 text-gray-400 flex-shrink-0" />
        }
      </button>
      {open && <div className="p-6">{children}</div>}
    </div>
  );
}

// ─── Card Row ─────────────────────────────────────────────────────────────────
function CardRow({ children, onRemove, canRemove }) {
  return (
    <div className="flex gap-3 items-start p-4 bg-gray-50 border border-gray-100 rounded-xl">
      <div className="flex-1 space-y-3">{children}</div>
      {canRemove && (
        <button type="button" onClick={onRemove}
          className="mt-7 p-2 text-red-400 hover:bg-red-50 hover:text-red-600 rounded-lg transition-colors flex-shrink-0"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}

// ─── Saved divider ────────────────────────────────────────────────────────────
function SavedDivider({ label }) {
  return (
    <div className="mt-6 pt-5 border-t border-gray-100">
      <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-3">{label}</p>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// ─── Saved Data Display Components ───────────────────────────────────────────
// ══════════════════════════════════════════════════════════════════════════════

function BasicInfoDisplay({ title, intro }) {
  if (!title && !intro) return null;
  return (
    <>
      <SavedDivider label="Saved Basic Info" />
      <div className="space-y-3">
        {title && (
          <div className="p-4 bg-blue-50 border border-blue-100 rounded-xl">
            <p className="text-xs font-semibold text-blue-400 uppercase tracking-wider mb-1">Title</p>
            <p className="text-base font-bold text-gray-800">{title}</p>
          </div>
        )}
        {intro && (
          <div className="p-4 bg-gray-50 border border-gray-100 rounded-xl">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Introduction</p>
            <p className="text-sm text-gray-700 leading-relaxed">{intro}</p>
          </div>
        )}
      </div>
    </>
  );
}

function MissionVisionDisplay({ mission, vision }) {
  if (!mission && !vision) return null;
  return (
    <>
      <SavedDivider label="Saved Mission & Vision" />
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {mission && (
          <div className="p-4 bg-amber-50 border border-amber-100 rounded-xl">
            <p className="text-xs font-semibold text-amber-500 uppercase tracking-wider mb-2">Mission</p>
            <p className="text-sm text-gray-700 leading-relaxed">{mission}</p>
          </div>
        )}
        {vision && (
          <div className="p-4 bg-purple-50 border border-purple-100 rounded-xl">
            <p className="text-xs font-semibold text-purple-500 uppercase tracking-wider mb-2">Vision</p>
            <p className="text-sm text-gray-700 leading-relaxed">{vision}</p>
          </div>
        )}
      </div>
    </>
  );
}

function StatsDisplay({ stats }) {
  if (!stats || stats.length === 0) return null;
  return (
    <>
      <SavedDivider label="Saved Statistics" />
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
        {stats.map((s, i) => (
          <div key={i} className="p-4 bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-100 rounded-xl text-center">
            <p className="text-xl font-bold text-blue-700">{s.value || "—"}</p>
            <p className="text-xs text-gray-500 mt-1">{s.label || "—"}</p>
          </div>
        ))}
      </div>
    </>
  );
}

function TeamDisplay({ members }) {
  if (!members || members.length === 0) return null;
  return (
    <>
      <SavedDivider label="Saved Team Members" />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {members.map((m, i) => (
          <div key={i} className="flex items-start gap-3 p-3 bg-blue-50 rounded-xl border border-blue-100">
            {m.photo ? (
              <img src={m.photo} alt={m.name}
                className="w-12 h-12 rounded-full object-cover flex-shrink-0 border-2 border-white shadow-sm" />
            ) : (
              <div className="w-12 h-12 rounded-full bg-blue-200 flex items-center justify-center flex-shrink-0">
                <Users className="w-5 h-5 text-blue-500" />
              </div>
            )}
            <div className="min-w-0">
              <p className="text-sm font-semibold text-gray-800 truncate">{m.name || "—"}</p>
              <p className="text-xs text-blue-600 truncate">{m.role || "No role"}</p>
              {m.bio && <p className="text-xs text-gray-500 mt-1 line-clamp-2">{m.bio}</p>}
            </div>
          </div>
        ))}
      </div>
    </>
  );
}

function ProjectsDisplay({ projects }) {
  if (!projects || projects.length === 0) return null;
  return (
    <>
      <SavedDivider label="Saved Projects" />
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {projects.map((p, i) => (
          <div key={i} className="rounded-xl border border-gray-100 overflow-hidden bg-gray-50">
            {p.image ? (
              <img src={p.image} alt={p.title} className="w-full h-36 object-cover" />
            ) : (
              <div className="w-full h-36 bg-gray-200 flex items-center justify-center">
                <ImageIcon className="w-8 h-8 text-gray-400" />
              </div>
            )}
            <div className="p-3">
              <p className="text-sm font-semibold text-gray-800">{p.title || "Untitled"}</p>
              {p.description && <p className="text-xs text-gray-500 mt-1 line-clamp-2">{p.description}</p>}
              {p.link && (
                <a href={p.link} target="_blank" rel="noreferrer"
                  className="text-xs text-blue-500 hover:underline mt-1 inline-block truncate max-w-full"
                >{p.link}</a>
              )}
            </div>
          </div>
        ))}
      </div>
    </>
  );
}

function PartnersDisplay({ partners }) {
  if (!partners || partners.length === 0) return null;
  return (
    <>
      <SavedDivider label="Saved Partners" />
      <div className="flex flex-wrap gap-3">
        {partners.map((p, i) => (
          <div key={i} className="flex items-center gap-2 px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl">
            {p.logo ? (
              <img src={p.logo} alt={p.name} className="w-8 h-8 object-contain rounded" />
            ) : (
              <Handshake className="w-5 h-5 text-gray-400" />
            )}
            <span className="text-sm font-medium text-gray-700">{p.name || "—"}</span>
          </div>
        ))}
      </div>
    </>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// ─── Main Component ───────────────────────────────────────════════════════════
// ══════════════════════════════════════════════════════════════════════════════
export default function AboutPage() {
  const [recordId, setRecordId] = useState(null);
  const [loading, setLoading] = useState(true);

  // Per-section toasts
  const SECTIONS = ["basicInfo", "missionVision", "stats", "team", "projects", "partners"];
  const emptyToast = { show: false, message: "", type: "success" };
  const [toasts, setToasts] = useState(Object.fromEntries(SECTIONS.map((s) => [s, emptyToast])));
  const showToast = (section, msg, type = "success") => {
    setToasts((t) => ({ ...t, [section]: { show: true, message: msg, type } }));
    setTimeout(() => setToasts((t) => ({ ...t, [section]: emptyToast })), 3500);
  };

  // Per-section saving flags
  const [saving, setSaving] = useState(Object.fromEntries(SECTIONS.map((s) => [s, false])));
  const setSavingFor = (section, val) => setSaving((s) => ({ ...s, [section]: val }));

  // ── Section form states ─────────────────────────────────────────────────────
  const [title, setTitle] = useState("");
  const [intro, setIntro] = useState("");
  const [savedBasicInfo, setSavedBasicInfo] = useState({ title: "", intro: "" });

  const [mission, setMission] = useState("");
  const [vision, setVision] = useState("");
  const [savedMissionVision, setSavedMissionVision] = useState({ mission: "", vision: "" });

  const [stats, setStats] = useState([{ label: "", value: "" }]);
  const [savedStats, setSavedStats] = useState([]);

  const [team, setTeam] = useState([{ name: "", role: "", bio: "", photo: "" }]);
  const [savedTeam, setSavedTeam] = useState([]);

  const [projects, setProjects] = useState([{ title: "", description: "", image: "", link: "" }]);
  const [savedProjects, setSavedProjects] = useState([]);

  const [partners, setPartners] = useState([{ name: "", logo: "" }]);
  const [savedPartners, setSavedPartners] = useState([]);

  // ── Fetch ───────────────────────────────────────────────────────────────────
  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/about`, { method: 'GET', mode: 'cors', credentials: 'include' });
      if (!res.ok) throw new Error();
      const data = await res.json();
      const list = Array.isArray(data) ? data : [data];
      const rec = list.find((r) => r.isPublished) || list[0] || null;
      if (rec) {
        setRecordId(rec.id ?? null);

        // Basic Info
        setTitle(rec.title ?? "");
        setIntro(rec.intro ?? "");
        setSavedBasicInfo({ title: rec.title ?? "", intro: rec.intro ?? "" });

        // Mission & Vision
        setMission(rec.mission ?? "");
        setVision(rec.vision ?? "");
        setSavedMissionVision({ mission: rec.mission ?? "", vision: rec.vision ?? "" });

        // Stats
        const parsedStats = safeParse(rec.stats, []);
        const normStats = parsedStats.map((s) =>
          typeof s === "object" ? s : { label: String(s || ""), value: "" }
        );
        setStats(normStats.length > 0 ? normStats : [{ label: "", value: "" }]);
        setSavedStats(normStats);

        // Team
        const parsedTeam = safeParse(rec.team, []);
        const normTeam = parsedTeam.map((t) =>
          typeof t === "object" ? t : { name: String(t || ""), role: "", bio: "", photo: "" }
        );
        setTeam(normTeam.length > 0 ? normTeam : [{ name: "", role: "", bio: "", photo: "" }]);
        setSavedTeam(normTeam);

        // Projects
        const parsedWork = safeParse(rec.work, []);
        const normWork = parsedWork.map((w) =>
          typeof w === "object" ? w : { title: String(w || ""), description: "", image: "", link: "" }
        );
        setProjects(normWork.length > 0 ? normWork : [{ title: "", description: "", image: "", link: "" }]);
        setSavedProjects(normWork);

        // Partners
        const parsedPartners = safeParse(rec.partners, []);
        const normPartners = parsedPartners.map((p) =>
          typeof p === "object" ? p : { name: String(p || ""), logo: "" }
        );
        setPartners(normPartners.length > 0 ? normPartners : [{ name: "", logo: "" }]);
        setSavedPartners(normPartners);
      }
    } catch {
      // silent — sections render empty
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  // ── Array helpers ────────────────────────────────────────────────────────────
  const updateItem = (setter, idx, field, val) =>
    setter((arr) => { const next = [...arr]; next[idx] = { ...next[idx], [field]: val }; return next; });
  const addItem = (setter, blank) => setter((arr) => [...arr, { ...blank }]);
  const removeItem = (setter, idx) => setter((arr) => arr.filter((_, i) => i !== idx));

  // ── Section save ─────────────────────────────────────────────────────────────
  const saveSection = async (section) => {
    setSavingFor(section, true);
    try {
      const payload = {};

      switch (section) {
        case "basicInfo":
          if (!title.trim()) {
            showToast("basicInfo", "Title is required.", "error");
            setSavingFor("basicInfo", false);
            return;
          }
          payload.title = title;
          payload.intro = intro;
          break;
        case "missionVision":
          payload.mission = mission;
          payload.vision = vision;
          break;
        case "stats": {
          const clean = stats.filter(
            (s) => String(s.value ?? "").trim() || String(s.label ?? "").trim()
          );
          payload.stats = JSON.stringify(clean);
          break;
        }
        case "team": {
          const clean = team.filter((m) => m.name?.trim());
          payload.team = JSON.stringify(clean);
          break;
        }
        case "projects": {
          const clean = projects.filter((p) => p.title?.trim());
          payload.work = JSON.stringify(clean);
          break;
        }
        case "partners": {
          const clean = partners.filter((p) => p.name?.trim());
          payload.partners = JSON.stringify(clean);
          break;
        }
        default:
          break;
      }

      // POST always needs at least a title
      if (!recordId && !payload.title) payload.title = title || "About Us";

      const url = recordId
        ? `${API_BASE}/api/about/${recordId}`
        : `${API_BASE}/api/about`;
      const method = recordId ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        mode: 'cors',
        credentials: 'include',
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const text = await res.text();
        throw new Error(`Save failed (${res.status}): ${text}`);
      }
      const result = await res.json();
      if (!recordId && result.id) setRecordId(result.id);

      // Sync saved display
      if (section === "basicInfo")     setSavedBasicInfo({ title, intro });
      if (section === "missionVision") setSavedMissionVision({ mission, vision });
      if (section === "stats")         setSavedStats(stats.filter((s) => String(s.value ?? "").trim() || String(s.label ?? "").trim()));
      if (section === "team")          setSavedTeam(team.filter((m) => m.name?.trim()));
      if (section === "projects")      setSavedProjects(projects.filter((p) => p.title?.trim()));
      if (section === "partners")      setSavedPartners(partners.filter((p) => p.name?.trim()));

      const labels = {
        basicInfo: "Basic Info", missionVision: "Mission & Vision",
        stats: "Statistics", team: "Team", projects: "Projects", partners: "Partners",
      };
      showToast(section, `${labels[section]} saved successfully!`);
    } catch (ex) {
      showToast(section, ex.message || "Error saving. Please try again.", "error");
    } finally {
      setSavingFor(section, false);
    }
  };

  // ─── Render ──────────────────────────────────────────────────────────────────
  return (
    <div className="max-w-5xl mx-auto pb-12">

      {/* Page Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">About Page</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Manage all content shown on the public About page. Each section saves independently.
          </p>
        </div>
        <button onClick={fetchData} disabled={loading}
          className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 text-gray-600 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          Refresh
        </button>
      </div>

      {loading ? (
        <div className="bg-white rounded-xl border border-gray-100 p-12 flex flex-col items-center justify-center min-h-96">
          <Loader2 className="w-8 h-8 text-blue-500 animate-spin mb-4" />
          <p className="text-gray-400 text-sm">Loading about page data...</p>
        </div>
      ) : (
        <div className="space-y-5">

          {/* ── 1. Basic Info ─────────────────────────────────────────────────── */}
          <SectionShell number="1" icon={FileText} title="Basic Information"
            subtitle="Page title and introductory paragraph shown at the top of the About page.">
            <Toast toast={toasts.basicInfo} />
            <div className="space-y-4 mb-5">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  Page Title <span className="text-red-400">*</span>
                </label>
                <input type="text" value={title} onChange={(e) => setTitle(e.target.value)}
                  className={inputCls} placeholder="e.g. About Our Company" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Introduction</label>
                <textarea rows={4} value={intro} onChange={(e) => setIntro(e.target.value)}
                  className={textareaCls}
                  placeholder="Write a welcoming introduction paragraph about your company..." />
              </div>
            </div>
            <div className="flex justify-end">
              <SaveBtn onClick={() => saveSection("basicInfo")} saving={saving.basicInfo} label="Save Basic Info" />
            </div>
            <BasicInfoDisplay title={savedBasicInfo.title} intro={savedBasicInfo.intro} />
          </SectionShell>

          {/* ── 2. Mission & Vision ───────────────────────────────────────────── */}
          <SectionShell number="2" icon={Target} title="Mission & Vision"
            subtitle="Company mission and vision statements." defaultOpen={false}>
            <Toast toast={toasts.missionVision} />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-5">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Mission</label>
                <textarea rows={5} value={mission} onChange={(e) => setMission(e.target.value)}
                  className={textareaCls}
                  placeholder="To provide professional, dedicated, one-point service excellence..." />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Vision</label>
                <textarea rows={5} value={vision} onChange={(e) => setVision(e.target.value)}
                  className={textareaCls}
                  placeholder="A future where sustainable infrastructure powers every community..." />
              </div>
            </div>
            <div className="flex justify-end">
              <SaveBtn onClick={() => saveSection("missionVision")} saving={saving.missionVision} label="Save Mission & Vision" />
            </div>
            <MissionVisionDisplay mission={savedMissionVision.mission} vision={savedMissionVision.vision} />
          </SectionShell>

          {/* ── 3. Statistics ─────────────────────────────────────────────────── */}
          <SectionShell number="3" icon={BarChart2} title="Statistics"
            subtitle="Key numbers and metrics shown on the About page."
            badge={stats.length} defaultOpen={false}>
            <Toast toast={toasts.stats} />
            <div className="space-y-2 mb-4">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-medium text-gray-500 w-28 flex-shrink-0">Value</span>
                <span className="text-xs font-medium text-gray-500 flex-1">Label</span>
              </div>
              {stats.map((stat, i) => (
                <div key={i} className="flex items-center gap-2">
                  <input type="text" value={stat.value}
                    onChange={(e) => updateItem(setStats, i, "value", e.target.value)}
                    className={`${inputCls} w-28 flex-shrink-0`}
                    placeholder="500+" />
                  <input type="text" value={stat.label}
                    onChange={(e) => updateItem(setStats, i, "label", e.target.value)}
                    className={inputCls}
                    placeholder="Projects Delivered" />
                  {stats.length > 1 && (
                    <button type="button" onClick={() => removeItem(setStats, i)}
                      className="p-2 text-red-400 hover:bg-red-50 hover:text-red-600 rounded-lg transition-colors flex-shrink-0"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>
            <div className="flex items-center justify-between">
              <button type="button" onClick={() => addItem(setStats, { label: "", value: "" })}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors text-sm font-medium"
              >
                <Plus className="w-4 h-4" /> Add Stat
              </button>
              <SaveBtn onClick={() => saveSection("stats")} saving={saving.stats} label="Save Statistics" />
            </div>
            <StatsDisplay stats={savedStats} />
          </SectionShell>

          {/* ── 4. Team ───────────────────────────────────────────────────────── */}
          <SectionShell number="4" icon={Users} title="Team Members"
            subtitle="People displayed in the team section of the About page."
            badge={team.length} defaultOpen={false}>
            <Toast toast={toasts.team} />
            <div className="space-y-3 mb-4">
              {team.map((member, i) => (
                <CardRow key={i} onRemove={() => removeItem(setTeam, i)} canRemove={team.length > 1}>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">Name</label>
                      <input type="text" value={member.name}
                        onChange={(e) => updateItem(setTeam, i, "name", e.target.value)}
                        className={inputCls} placeholder="e.g. Rahul Sharma" />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">Role</label>
                      <input type="text" value={member.role}
                        onChange={(e) => updateItem(setTeam, i, "role", e.target.value)}
                        className={inputCls} placeholder="e.g. Lead Engineer" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Bio</label>
                    <textarea rows={2} value={member.bio}
                      onChange={(e) => updateItem(setTeam, i, "bio", e.target.value)}
                      className={textareaCls} placeholder="Short biography..." />
                  </div>
                  <ImageUploadField label="Photo" hint="Square image recommended (200×200 px)"
                    value={member.photo} onChange={(url) => updateItem(setTeam, i, "photo", url)} />
                  {member.photo && (
                    <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-blue-200">
                      <img src={member.photo} alt="preview" className="w-full h-full object-cover" />
                    </div>
                  )}
                </CardRow>
              ))}
            </div>
            <div className="flex items-center justify-between">
              <button type="button" onClick={() => addItem(setTeam, { name: "", role: "", bio: "", photo: "" })}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors text-sm font-medium"
              >
                <Plus className="w-4 h-4" /> Add Member
              </button>
              <SaveBtn onClick={() => saveSection("team")} saving={saving.team} label="Save Team" />
            </div>
            <TeamDisplay members={savedTeam} />
          </SectionShell>

          {/* ── 5. Projects ───────────────────────────────────────────────────── */}
          <SectionShell number="5" icon={Briefcase} title="Projects"
            subtitle="Work showcased on the About page."
            badge={projects.length} defaultOpen={false}>
            <Toast toast={toasts.projects} />
            <div className="space-y-3 mb-4">
              {projects.map((proj, i) => (
                <CardRow key={i} onRemove={() => removeItem(setProjects, i)} canRemove={projects.length > 1}>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Project Title</label>
                    <input type="text" value={proj.title}
                      onChange={(e) => updateItem(setProjects, i, "title", e.target.value)}
                      className={inputCls} placeholder="e.g. Highway Bridge Construction" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Description</label>
                    <textarea rows={2} value={proj.description}
                      onChange={(e) => updateItem(setProjects, i, "description", e.target.value)}
                      className={textareaCls} placeholder="Brief project description..." />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Project Link</label>
                    <input type="url" value={proj.link}
                      onChange={(e) => updateItem(setProjects, i, "link", e.target.value)}
                      className={inputCls} placeholder="https://..." />
                  </div>
                  <ImageUploadField label="Project Image" hint="Upload or paste URL."
                    value={proj.image} onChange={(url) => updateItem(setProjects, i, "image", url)} />
                  {proj.image && (
                    <div className="rounded-lg overflow-hidden h-24 bg-gray-200">
                      <img src={proj.image} alt="preview" className="w-full h-full object-cover opacity-90" />
                    </div>
                  )}
                </CardRow>
              ))}
            </div>
            <div className="flex items-center justify-between">
              <button type="button"
                onClick={() => addItem(setProjects, { title: "", description: "", image: "", link: "" })}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors text-sm font-medium"
              >
                <Plus className="w-4 h-4" /> Add Project
              </button>
              <SaveBtn onClick={() => saveSection("projects")} saving={saving.projects} label="Save Projects" />
            </div>
            <ProjectsDisplay projects={savedProjects} />
          </SectionShell>

          {/* ── 6. Partners ───────────────────────────────────────────────────── */}
          <SectionShell number="6" icon={Handshake} title="Partners"
            subtitle="Partner logos and names displayed on the About page."
            badge={partners.length} defaultOpen={false}>
            <Toast toast={toasts.partners} />
            <div className="space-y-3 mb-4">
              {partners.map((partner, i) => (
                <CardRow key={i} onRemove={() => removeItem(setPartners, i)} canRemove={partners.length > 1}>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">
                      Partner Name <span className="text-red-400">*</span>
                    </label>
                    <input type="text" value={partner.name}
                      onChange={(e) => updateItem(setPartners, i, "name", e.target.value)}
                      className={`${inputCls} ${!partner.name ? "border-red-200 bg-red-50" : ""}`}
                      placeholder="e.g. Acme Corp" />
                  </div>
                  <ImageUploadField label="Logo"
                    hint="Upload or paste URL. PNG with transparent background preferred."
                    value={partner.logo}
                    onChange={(url) => updateItem(setPartners, i, "logo", url)} />
                  {partner.logo && (
                    <div className="w-20 h-12 rounded overflow-hidden border border-gray-200 bg-white flex items-center justify-center p-1">
                      <img src={partner.logo} alt="logo" className="max-w-full max-h-full object-contain" />
                    </div>
                  )}
                </CardRow>
              ))}
            </div>
            <div className="flex items-center justify-between">
              <button type="button" onClick={() => addItem(setPartners, { name: "", logo: "" })}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors text-sm font-medium"
              >
                <Plus className="w-4 h-4" /> Add Partner
              </button>
              <SaveBtn onClick={() => saveSection("partners")} saving={saving.partners} label="Save Partners" />
            </div>
            <PartnersDisplay partners={savedPartners} />
          </SectionShell>

        </div>
      )}
    </div>
  );
}