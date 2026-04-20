"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft, Save, Eye, EyeOff, ChevronDown, ChevronRight,
  Plus, Trash2, Upload, Link2, Image as ImageIcon, Type,
  DollarSign, Grid, Map, Info, Layout, ToggleLeft, ToggleRight,
  Check, X, Loader2, GripVertical, AlertCircle, Monitor, Smartphone
} from "lucide-react";
const API_BASE = process.env.NEXT_PUBLIC_BACKEND_URL || 'https://achal-backend-trial.tannis.in';

function safeParseJSON(v) {
  if (!v) return null;
  if (Array.isArray(v) || typeof v === "object") return v;
  try { return JSON.parse(v); } catch (_) { return v; }
}

// ─── Inline styles injected once ────────────────────────────
const ADMIN_STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;0,900;1,400;1,700&family=DM+Sans:wght@300;400;500;600&family=JetBrains+Mono:wght@400;500&display=swap');

  :root {
    --navy:   #0a1628;
    --blue:   #1a3a6b;
    --gold:   #c8a96e;
    --gold2:  #b8954a;
    --light:  #f5f3ef;
    --white:  #ffffff;
    --gray:   #6b7280;
    --border: #e5e0d8;
    --slate:  #0f172a;
    --adm-bg: #0d0f14;
    --adm-panel: #13161e;
    --adm-card: #1a1e2a;
    --adm-border: #252836;
    --adm-accent: #c8a96e;
    --adm-accent2: #b8954a;
    --adm-text: #e8e6e1;
    --adm-muted: #7a7d8a;
    --adm-success: #22c55e;
    --adm-danger: #ef4444;
  }

  * { box-sizing: border-box; }

  .adm-root {
    font-family: 'DM Sans', sans-serif;
    background: var(--adm-bg);
    color: var(--adm-text);
    min-height: 100vh;
    display: flex;
    flex-direction: column;
  }

  /* ── Top Bar ── */
  .adm-topbar {
    height: 60px;
    background: var(--adm-panel);
    border-bottom: 1px solid var(--adm-border);
    display: flex;
    align-items: center;
    padding: 0 20px;
    gap: 16px;
    position: sticky;
    top: 0;
    z-index: 100;
    flex-shrink: 0;
  }
  .adm-back-btn {
    width: 36px; height: 36px;
    background: var(--adm-card);
    border: 1px solid var(--adm-border);
    border-radius: 8px;
    display: flex; align-items: center; justify-content: center;
    color: var(--adm-muted);
    cursor: pointer;
    transition: all .2s;
  }
  .adm-back-btn:hover { color: var(--adm-text); border-color: var(--adm-accent); }
  .adm-topbar-title { font-weight: 600; font-size: 15px; color: var(--adm-text); }
  .adm-topbar-sub { font-size: 12px; color: var(--adm-muted); }
  .adm-topbar-right { margin-left: auto; display: flex; align-items: center; gap: 10px; }
  .adm-preview-toggle {
    display: flex; align-items: center; gap: 8px;
    background: var(--adm-card); border: 1px solid var(--adm-border);
    border-radius: 8px; padding: 6px 14px;
    font-size: 12px; font-weight: 600; color: var(--adm-muted);
    cursor: pointer; transition: all .2s; letter-spacing: .04em;
  }
  .adm-preview-toggle:hover { border-color: var(--adm-accent); color: var(--adm-accent); }
  .adm-save-btn {
    display: flex; align-items: center; gap: 8px;
    background: var(--adm-accent); color: var(--navy);
    border: none; border-radius: 8px;
    padding: 8px 20px; font-size: 13px; font-weight: 700;
    cursor: pointer; transition: all .2s; letter-spacing: .04em;
  }
  .adm-save-btn:hover { background: var(--adm-accent2); transform: translateY(-1px); }
  .adm-save-btn:disabled { opacity: .5; cursor: not-allowed; transform: none; }
  .adm-publish-pill {
    display: flex; align-items: center; gap: 6px;
    padding: 6px 12px; border-radius: 20px;
    font-size: 11px; font-weight: 700; letter-spacing: .08em; text-transform: uppercase;
    border: 1px solid;
    cursor: pointer; transition: all .2s;
  }
  .adm-publish-pill.published { background: rgba(34,197,94,.12); border-color: rgba(34,197,94,.35); color: #22c55e; }
  .adm-publish-pill.draft { background: rgba(202,138,4,.1); border-color: rgba(202,138,4,.3); color: #ca8a04; }

  /* ── Body Layout ── */
  .adm-body {
    display: flex;
    flex: 1;
    overflow: hidden;
    height: calc(100vh - 60px);
  }

  /* ── Left: Section Nav ── */
  .adm-sidenav {
    width: 200px;
    background: var(--adm-panel);
    border-right: 1px solid var(--adm-border);
    display: flex;
    flex-direction: column;
    overflow-y: auto;
    flex-shrink: 0;
  }
  .adm-sidenav-header {
    padding: 16px 16px 8px;
    font-size: 10px; font-weight: 700; letter-spacing: .15em;
    text-transform: uppercase; color: var(--adm-muted);
  }
  .adm-nav-item {
    display: flex; align-items: center; gap: 10px;
    padding: 10px 16px;
    cursor: pointer; transition: all .15s;
    border-left: 2px solid transparent;
    font-size: 13px; color: var(--adm-muted);
    position: relative;
  }
  .adm-nav-item:hover { background: rgba(255,255,255,.03); color: var(--adm-text); }
  .adm-nav-item.active { background: rgba(200,169,110,.06); border-left-color: var(--adm-accent); color: var(--adm-accent); }
  .adm-nav-item .nav-icon { width: 16px; height: 16px; flex-shrink: 0; opacity: .7; }
  .adm-nav-item.active .nav-icon { opacity: 1; }
  .adm-nav-vis-dot {
    width: 6px; height: 6px; border-radius: 50%;
    margin-left: auto; flex-shrink: 0;
    background: var(--adm-success); opacity: .8;
  }
  .adm-nav-vis-dot.off { background: var(--adm-muted); opacity: .4; }

  /* ── Center: Edit Panel ── */
  .adm-editor {
    flex: 1;
    overflow-y: auto;
    padding: 28px 32px;
    background: var(--adm-bg);
    min-width: 0;
  }
  .adm-section-header {
    display: flex; align-items: center; justify-content: space-between;
    margin-bottom: 24px; padding-bottom: 16px;
    border-bottom: 1px solid var(--adm-border);
  }
  .adm-section-title {
    font-size: 18px; font-weight: 700; color: var(--adm-text);
    display: flex; align-items: center; gap: 10px;
  }
  .adm-section-title svg { color: var(--adm-accent); }

  /* ── Toggle Switch ── */
  .adm-toggle-wrap {
    display: flex; align-items: center; gap: 10px;
    padding: 10px 14px;
    background: var(--adm-card); border: 1px solid var(--adm-border);
    border-radius: 10px; margin-bottom: 20px;
    font-size: 13px; font-weight: 500;
  }
  .adm-toggle {
    position: relative; width: 40px; height: 22px;
    background: var(--adm-border); border-radius: 11px;
    cursor: pointer; transition: background .2s; flex-shrink: 0;
  }
  .adm-toggle.on { background: var(--adm-accent); }
  .adm-toggle::after {
    content: ''; position: absolute;
    top: 3px; left: 3px;
    width: 16px; height: 16px;
    background: white; border-radius: 50%;
    transition: transform .2s;
  }
  .adm-toggle.on::after { transform: translateX(18px); }

  /* ── Form Fields ── */
  .adm-field { margin-bottom: 18px; }
  .adm-label {
    display: block; margin-bottom: 6px;
    font-size: 11px; font-weight: 700; letter-spacing: .08em;
    text-transform: uppercase; color: var(--adm-muted);
  }
  .adm-input {
    width: 100%; padding: 10px 14px;
    background: var(--adm-card); border: 1px solid var(--adm-border);
    border-radius: 8px; color: var(--adm-text);
    font-family: 'DM Sans', sans-serif; font-size: 14px;
    transition: border-color .2s, box-shadow .2s;
    outline: none;
  }
  .adm-input:focus { border-color: var(--adm-accent); box-shadow: 0 0 0 3px rgba(200,169,110,.12); }
  .adm-input::placeholder { color: var(--adm-muted); }
  textarea.adm-input { resize: vertical; min-height: 90px; line-height: 1.6; }

  /* ── Image Upload Field ── */
  .adm-img-field { display: flex; gap: 12px; align-items: flex-start; }
  .adm-img-preview {
    width: 90px; height: 68px; flex-shrink: 0;
    border-radius: 8px; overflow: hidden;
    background: var(--adm-card); border: 1px solid var(--adm-border);
    display: flex; align-items: center; justify-content: center;
    color: var(--adm-muted);
  }
  .adm-img-preview img { width: 100%; height: 100%; object-fit: cover; }
  .adm-img-controls { flex: 1; display: flex; flex-direction: column; gap: 8px; }
  .adm-upload-btn {
    display: flex; align-items: center; gap: 8px;
    padding: 8px 14px; border-radius: 7px;
    background: rgba(200,169,110,.1); border: 1px solid rgba(200,169,110,.25);
    color: var(--adm-accent); font-size: 12px; font-weight: 600;
    cursor: pointer; transition: all .2s; white-space: nowrap;
  }
  .adm-upload-btn:hover { background: rgba(200,169,110,.18); border-color: var(--adm-accent); }
  .adm-upload-btn input[type=file] { display: none; }

  /* ── Grid helpers ── */
  .adm-grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
  .adm-grid-3 { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 14px; }

  /* ── Card (portfolio/pricing items) ── */
  .adm-item-card {
    background: var(--adm-card); border: 1px solid var(--adm-border);
    border-radius: 12px; padding: 18px; margin-bottom: 14px;
    position: relative; transition: border-color .2s;
  }
  .adm-item-card:hover { border-color: rgba(200,169,110,.25); }
  .adm-item-card-header {
    display: flex; align-items: center; justify-content: space-between;
    margin-bottom: 16px; padding-bottom: 12px;
    border-bottom: 1px solid var(--adm-border);
  }
  .adm-item-card-num {
    font-size: 11px; font-weight: 700; letter-spacing: .12em;
    text-transform: uppercase; color: var(--adm-accent);
    display: flex; align-items: center; gap: 8px;
  }
  .adm-remove-btn {
    display: flex; align-items: center; gap: 5px;
    padding: 5px 10px; border-radius: 6px;
    background: rgba(239,68,68,.08); border: 1px solid rgba(239,68,68,.2);
    color: #ef4444; font-size: 11px; font-weight: 600;
    cursor: pointer; transition: all .2s;
  }
  .adm-remove-btn:hover { background: rgba(239,68,68,.15); }
  .adm-add-btn {
    display: flex; align-items: center; gap: 8px;
    padding: 10px 18px; border-radius: 8px;
    background: rgba(200,169,110,.08); border: 1px dashed rgba(200,169,110,.35);
    color: var(--adm-accent); font-size: 13px; font-weight: 600;
    cursor: pointer; transition: all .2s; width: 100%;
    justify-content: center; margin-top: 8px;
  }
  .adm-add-btn:hover { background: rgba(200,169,110,.15); border-color: var(--adm-accent); }

  /* ── Gallery grid ── */
  .adm-gallery-grid {
    display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px;
    margin-bottom: 14px;
  }
  .adm-gallery-thumb {
    position: relative; border-radius: 8px; overflow: hidden;
    aspect-ratio: 4/3; background: var(--adm-card);
    border: 1px solid var(--adm-border);
    display: flex; align-items: center; justify-content: center;
  }
  .adm-gallery-thumb img { width: 100%; height: 100%; object-fit: cover; }
  .adm-gallery-thumb-remove {
    position: absolute; top: 4px; right: 4px;
    width: 22px; height: 22px; border-radius: 50%;
    background: rgba(0,0,0,.7); border: none;
    color: white; display: flex; align-items: center; justify-content: center;
    cursor: pointer; opacity: 0; transition: opacity .2s;
  }
  .adm-gallery-thumb:hover .adm-gallery-thumb-remove { opacity: 1; }
  .adm-gallery-thumb-title {
    position: absolute; bottom: 0; left: 0; right: 0;
    background: rgba(0,0,0,.6); padding: 4px 8px;
    font-size: 10px; color: white; truncate: true;
    white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
  }

  /* ── Coverage rows ── */
  .adm-coverage-rows { display: flex; flex-direction: column; gap: 12px; }
  .adm-coverage-row-item {
    display: flex; align-items: flex-start; gap: 12px;
    padding: 14px; background: var(--adm-card);
    border: 1px solid var(--adm-border); border-radius: 10px;
  }
  .adm-coverage-icon-wrap {
    width: 32px; height: 32px; flex-shrink: 0;
    display: flex; align-items: center; justify-content: center;
    background: rgba(200,169,110,.1); border-radius: 6px;
    font-size: 16px; margin-top: 2px;
  }

  /* ── Right: Live Preview ── */
  .adm-preview-pane {
    width: 480px; flex-shrink: 0;
    background: var(--white);
    border-left: 1px solid var(--adm-border);
    overflow-y: auto;
    transition: width .3s, opacity .3s;
  }
  .adm-preview-pane.hidden { width: 0; overflow: hidden; opacity: 0; }
  .adm-preview-bar {
    position: sticky; top: 0; z-index: 10;
    background: rgba(255,255,255,.95); backdrop-filter: blur(8px);
    border-bottom: 1px solid var(--border);
    padding: 10px 16px;
    display: flex; align-items: center; justify-content: space-between;
    font-size: 11px; font-weight: 700; letter-spacing: .12em;
    text-transform: uppercase; color: var(--navy);
  }
  .adm-preview-device-btns { display: flex; gap: 6px; }
  .adm-preview-device-btn {
    padding: 4px 8px; border-radius: 5px; border: 1px solid var(--border);
    background: transparent; color: var(--gray); cursor: pointer; font-size: 11px;
    display: flex; align-items: center; gap: 4px; transition: all .15s;
  }
  .adm-preview-device-btn.active { background: var(--navy); color: white; border-color: var(--navy); }

  /* ── Scrollbar ── */
  .adm-editor::-webkit-scrollbar,
  .adm-sidenav::-webkit-scrollbar,
  .adm-preview-pane::-webkit-scrollbar { width: 4px; }
  .adm-editor::-webkit-scrollbar-track,
  .adm-sidenav::-webkit-scrollbar-track { background: transparent; }
  .adm-editor::-webkit-scrollbar-thumb { background: var(--adm-border); border-radius: 4px; }
  .adm-preview-pane::-webkit-scrollbar-thumb { background: var(--border); border-radius: 4px; }

  /* ── Toast ── */
  .adm-toast {
    position: fixed; bottom: 24px; right: 24px; z-index: 9999;
    background: var(--adm-card); border: 1px solid var(--adm-border);
    border-radius: 12px; padding: 14px 20px;
    display: flex; align-items: center; gap: 12px;
    font-size: 14px; font-weight: 500;
    box-shadow: 0 8px 32px rgba(0,0,0,.4);
    animation: toastIn .3s ease;
  }
  .adm-toast.success { border-color: rgba(34,197,94,.4); color: #22c55e; }
  .adm-toast.error { border-color: rgba(239,68,68,.4); color: #ef4444; }
  @keyframes toastIn { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }

  /* ── Loading ── */
  .adm-loading {
    display: flex; align-items: center; justify-content: center;
    min-height: 100vh; background: var(--adm-bg);
    flex-direction: column; gap: 16px;
    color: var(--adm-muted); font-size: 14px;
  }
  .adm-spin { animation: spin 1s linear infinite; color: var(--adm-accent); }
  @keyframes spin { to { transform: rotate(360deg); } }

  /* ── Preview: service page replica ── */
  .prev-page { font-family: 'DM Sans', sans-serif; color: var(--navy); }
  .prev-playfair { font-family: 'Playfair Display', serif; }
  .prev-label {
    display: inline-flex; align-items: center; gap: 8px;
    font-size: 9px; font-weight: 600; letter-spacing: .3em;
    color: var(--gold); text-transform: uppercase; margin-bottom: 10px;
  }
  .prev-label::before { content: ''; display: block; width: 16px; height: 1px; background: var(--gold); }

  /* Hero preview */
  .prev-hero {
    position: relative; min-height: 220px;
    display: flex; align-items: flex-end;
    background: var(--navy); overflow: hidden;
  }
  .prev-hero img { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; filter: saturate(.35); opacity: .5; }
  .prev-hero-overlay { position: absolute; inset: 0; background: linear-gradient(135deg, rgba(10,22,40,.95) 0%, rgba(10,22,40,.5) 100%); }
  .prev-hero-content { position: relative; z-index: 2; padding: 40px 24px 32px; }
  .prev-hero h1 { font-family: 'Playfair Display', serif; font-size: 1.6rem; font-weight: 900; color: #fff; margin: 0 0 8px; line-height: 1.15; }
  .prev-hero p { font-size: .8rem; color: rgba(255,255,255,.65); max-width: 360px; line-height: 1.6; margin: 0 0 16px; }
  .prev-hero-btns { display: flex; gap: 8px; flex-wrap: wrap; }
  .prev-btn-gold { padding: 7px 16px; background: var(--gold); color: var(--navy); font-size: 10px; font-weight: 700; border: none; letter-spacing: .08em; text-transform: uppercase; }
  .prev-btn-ghost { padding: 7px 16px; background: transparent; color: #fff; border: 1px solid rgba(255,255,255,.3); font-size: 10px; font-weight: 600; letter-spacing: .08em; text-transform: uppercase; }
  .prev-hero-badge { position: absolute; right: 16px; bottom: -16px; z-index: 3; background: var(--gold); color: var(--navy); padding: 10px 16px; font-family: 'Playfair Display', serif; font-weight: 900; font-size: 1.1rem; line-height: 1; display: flex; flex-direction: column; align-items: center; }
  .prev-hero-badge span { font-family: 'DM Sans', sans-serif; font-size: 8px; font-weight: 600; letter-spacing: .2em; text-transform: uppercase; opacity: .7; margin-top: 2px; }

  /* Summary preview */
  .prev-summary { background: var(--light); padding: 36px 24px; }
  .prev-summary-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; }
  .prev-summary h2 { font-family: 'Playfair Display', serif; font-size: 1.25rem; font-weight: 900; color: var(--navy); margin: 0 0 8px; line-height: 1.2; }
  .prev-summary p { font-size: .8rem; line-height: 1.7; color: #4b5563; }
  .prev-summary-right { border-left: 1px solid var(--border); padding-left: 20px; }
  .prev-bullets { list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: 6px; }
  .prev-bullets li { display: flex; align-items: flex-start; gap: 10px; font-size: .78rem; color: #374151; line-height: 1.4; }
  .prev-bullets li::before { content: ''; flex-shrink: 0; margin-top: 7px; width: 14px; height: 1px; background: var(--gold); }

  /* Portfolio preview */
  .prev-portfolio { padding: 36px 24px; background: var(--white); }
  .prev-port-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 3px; margin-top: 20px; }
  .prev-port-item { position: relative; height: 140px; overflow: hidden; }
  .prev-port-item img { width: 100%; height: 100%; object-fit: cover; filter: saturate(.4); }
  .prev-port-overlay { position: absolute; inset: 0; background: linear-gradient(to top, rgba(10,22,40,.9) 0%, transparent 60%); }
  .prev-port-content { position: absolute; bottom: 0; left: 0; right: 0; padding: 10px 12px; }
  .prev-port-tag { font-size: 8px; letter-spacing: .18em; text-transform: uppercase; color: var(--gold); font-weight: 600; }
  .prev-port-name { font-family: 'Playfair Display', serif; font-size: .85rem; font-weight: 700; color: #fff; }
  .prev-port-loc { font-size: 9px; color: rgba(255,255,255,.4); margin-top: 2px; }

  /* Pricing preview */
  .prev-pricing { padding: 36px 24px; background: var(--navy); }
  .prev-pricing-title { font-family: 'Playfair Display', serif; font-size: 1.25rem; font-weight: 900; color: #fff; margin: 0 0 20px; }
  .prev-pricing-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 2px; }
  .prev-plan { background: rgba(255,255,255,.04); border-top: 2px solid transparent; padding: 18px; position: relative; }
  .prev-plan.featured { background: rgba(200,169,110,.08); border-top-color: var(--gold); }
  .prev-plan-name { font-size: 9px; font-weight: 600; letter-spacing: .2em; text-transform: uppercase; color: rgba(255,255,255,.4); margin-bottom: 6px; }
  .prev-plan-price { font-family: 'Playfair Display', serif; font-size: 1.4rem; font-weight: 900; color: var(--gold); margin-bottom: 12px; }
  .prev-plan-benefits { list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: 6px; }
  .prev-plan-benefits li { display: flex; align-items: flex-start; gap: 8px; font-size: .72rem; color: rgba(255,255,255,.6); }
  .prev-plan-benefits li::before { content: ''; flex-shrink: 0; margin-top: 6px; width: 10px; height: 1px; background: var(--gold); }

  /* Gallery preview */
  .prev-gallery { padding: 36px 24px; background: var(--light); }
  .prev-gallery-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 3px; margin-top: 20px; }
  .prev-gallery-item { overflow: hidden; }
  .prev-gallery-item img { width: 100%; height: 90px; object-fit: cover; filter: saturate(.4); display: block; }

  /* Details preview */
  .prev-details { padding: 36px 24px; background: var(--white); }
  .prev-details-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 3px; }
  .prev-coverage { background: var(--navy); padding: 20px; }
  .prev-coverage h3 { font-family: 'Playfair Display', serif; font-size: 1rem; font-weight: 700; color: #fff; margin: 0 0 12px; }
  .prev-cov-row { display: flex; gap: 10px; padding: 8px 0; border-bottom: 1px solid rgba(255,255,255,.06); }
  .prev-cov-icon { width: 24px; height: 24px; border: 1px solid rgba(200,169,110,.4); display: flex; align-items: center; justify-content: center; flex-shrink: 0; font-size: 11px; }
  .prev-cov-label { font-size: 8px; font-weight: 600; letter-spacing: .18em; text-transform: uppercase; color: rgba(255,255,255,.35); }
  .prev-cov-value { font-size: .75rem; color: rgba(255,255,255,.7); margin-top: 1px; }
  .prev-full-details { background: var(--light); padding: 20px; }
  .prev-full-details img { width: 100%; height: 100px; object-fit: cover; filter: saturate(.4); margin-bottom: 12px; display: block; }
  .prev-full-details h3 { font-family: 'Playfair Display', serif; font-size: 1rem; font-weight: 700; color: var(--navy); margin: 0 0 8px; }
  .prev-full-details p { font-size: .78rem; color: #4b5563; line-height: 1.6; }

  /* CTA preview */
  .prev-cta { background: var(--slate); padding: 40px 24px; text-align: center; }
  .prev-cta h2 { font-family: 'Playfair Display', serif; font-size: 1.3rem; font-weight: 900; color: #fff; margin: 0 0 8px; }
  .prev-cta h2 em { color: var(--gold); font-style: normal; }
  .prev-cta p { font-size: .8rem; color: rgba(255,255,255,.5); margin: 0 auto 20px; }
  .prev-cta-btns { display: flex; gap: 10px; justify-content: center; }

  /* Section divider in preview */
  .prev-section-label {
    position: sticky; top: 44px; z-index: 5;
    background: rgba(245,243,239,.9); backdrop-filter: blur(6px);
    padding: 4px 12px; font-size: 9px; font-weight: 700;
    letter-spacing: .15em; text-transform: uppercase;
    color: var(--gold); border-bottom: 1px solid var(--border);
    display: flex; align-items: center; gap: 6px;
  }

  /* Section not visible overlay */
  .prev-hidden-section {
    opacity: .35; pointer-events: none;
    position: relative;
  }
  .prev-hidden-section::after {
    content: 'HIDDEN';
    position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%);
    background: rgba(0,0,0,.7); color: #fff;
    padding: 4px 12px; border-radius: 20px;
    font-size: 10px; font-weight: 700; letter-spacing: .2em;
    pointer-events: none;
  }

  @media (max-width: 1100px) {
    .adm-preview-pane { width: 360px; }
  }
  @media (max-width: 900px) {
    .adm-preview-pane { display: none; }
    .adm-sidenav { width: 160px; }
  }
`;

// ─── Upload helper ───────────────────────────────────────────
const fileToBase64 = (file) => new Promise((res, rej) => {
  const r = new FileReader();
  r.onload = () => res(r.result);
  r.onerror = (e) => rej(e);
  r.readAsDataURL(file);
});

async function uploadFile(file) {
  if (!file) return null;
  const dataUrl = await fileToBase64(file);
  if (dataUrl.length > 1_200_000) { alert('Image too large. Please compress it first.'); return null; }
  const res = await fetch(`${API_BASE}/api/upload`, {
    method: 'POST',
    mode: 'cors',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ filename: file.name, mimeType: file.type, data: dataUrl }),
  });
  if (!res.ok) throw new Error('Upload failed');
  const data = await res.json();
  return data.url || data.path || null;
}

// ─── Reusable sub-components ─────────────────────────────────

function Toggle({ on, onChange, label }) {
  return (
    <div className="adm-toggle-wrap">
      <div className={`adm-toggle${on ? ' on' : ''}`} onClick={onChange} />
      <span style={{ fontSize: 13, fontWeight: 500 }}>{label}</span>
      <span style={{ marginLeft: 'auto', fontSize: 11, color: on ? 'var(--adm-success)' : 'var(--adm-muted)', fontWeight: 700, letterSpacing: '.06em', textTransform: 'uppercase' }}>
        {on ? 'Visible' : 'Hidden'}
      </span>
    </div>
  );
}

function Field({ label, children, hint }) {
  return (
    <div className="adm-field">
      {label && <label className="adm-label">{label}</label>}
      {children}
      {hint && <div style={{ fontSize: 11, color: 'var(--adm-muted)', marginTop: 5 }}>{hint}</div>}
    </div>
  );
}

function ImageField({ label, value, onChange, onUpload, uploading }) {
  const fileRef = useRef();
  return (
    <Field label={label}>
      <div className="adm-img-field">
        <div className="adm-img-preview">
          {value ? <img src={value} alt="" /> : <ImageIcon size={20} />}
        </div>
        <div className="adm-img-controls">
          <input
            className="adm-input"
            value={value || ''}
            onChange={e => onChange(e.target.value)}
            placeholder="https://..."
            style={{ fontSize: 12 }}
          />
          <label className="adm-upload-btn">
            {uploading ? <Loader2 size={13} className="adm-spin" /> : <Upload size={13} />}
            {uploading ? 'Uploading…' : 'Upload image'}
            <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }}
              onChange={async (e) => {
                const f = e.target.files[0]; if (!f) return;
                const url = await onUpload(f); if (url) onChange(url);
              }} />
          </label>
        </div>
      </div>
    </Field>
  );
}

// ─── Live Preview ─────────────────────────────────────────────
function LivePreview({ formData, service }) {
  const hero = formData.heroSection || {};
  const second = formData.secondHeroSection || {};
  const portfolio = Array.isArray(formData.portfolioSections) ? formData.portfolioSections : [];
  const pricing = Array.isArray(formData.pricingPlans) ? formData.pricingPlans : [];
  const gallery = (() => {
    if (!formData.galleryLines) return [];
    return formData.galleryLines.split('\n').map(l => {
      const [title, image] = l.split('|').map(s => s.trim());
      return { title: title || '', image: image || '' };
    }).filter(g => g.image);
  })();
  const coverage = formData.coverageSection || {};
  const fullDetails = formData.fullDetailsSection || {};
  const bullets = (() => {
    const v = second.bullets;
    if (!v) return [];
    if (Array.isArray(v)) return v;
    return v.split('\n').map(s => s.trim()).filter(Boolean);
  })();
  const pageName = service?.name || hero.heading || 'Service';

  return (
    <div className="prev-page">
      {/* Hero */}
      <div style={{ position: 'sticky', top: 0, zIndex: 20, background: 'rgba(245,243,239,.95)', backdropFilter: 'blur(6px)', borderBottom: '1px solid var(--border)', padding: '5px 12px', fontSize: 9, fontWeight: 700, letterSpacing: '.15em', textTransform: 'uppercase', color: 'var(--gold)', display: 'flex', alignItems: 'center', gap: 6 }}>
        <Monitor size={11} /> Live Preview
      </div>
      <div className={!formData.showHero ? 'prev-hidden-section' : ''} style={{ position: 'relative' }}>
        <div style={{ position: 'absolute', top: 4, right: 4, zIndex: 10, background: formData.showHero ? 'rgba(34,197,94,.2)' : 'rgba(100,100,100,.2)', borderRadius: 4, padding: '2px 6px', fontSize: 9, fontWeight: 700, color: formData.showHero ? '#22c55e' : '#888', letterSpacing: '.1em' }}>
          {formData.showHero ? 'HERO ●' : 'HERO ○'}
        </div>
        <div className="prev-hero">
          {hero.backgroundImage && <img src={hero.backgroundImage} alt="" />}
          <div className="prev-hero-overlay" />
          <div className="prev-hero-content">
            <div className="prev-label">Our Expertise</div>
            <h1>{hero.heading || pageName}</h1>
            {hero.shortDescription && <p>{hero.shortDescription}</p>}
            <div className="prev-hero-btns">
              <button className="prev-btn-gold">{hero.buttonText || 'Request a Quote'}</button>
              <button className="prev-btn-ghost">Learn More</button>
            </div>
          </div>
          <div className="prev-hero-badge">ACHAL<span>International</span></div>
        </div>
      </div>

      {/* Summary */}
      <div className={!formData.showSecondHero ? 'prev-hidden-section' : ''} style={{ position: 'relative' }}>
        <div style={{ position: 'absolute', top: 4, right: 4, zIndex: 10, background: formData.showSecondHero ? 'rgba(34,197,94,.2)' : 'rgba(100,100,100,.2)', borderRadius: 4, padding: '2px 6px', fontSize: 9, fontWeight: 700, color: formData.showSecondHero ? '#22c55e' : '#888', letterSpacing: '.1em' }}>
          {formData.showSecondHero ? 'SUMMARY ●' : 'SUMMARY ○'}
        </div>
        <div className="prev-summary">
          <div className="prev-summary-grid">
            <div>
              {second.mainTitle && <h2>{second.mainTitle}</h2>}
              {second.singleTitle && <div style={{ fontSize: 10, fontWeight: 600, letterSpacing: '.1em', textTransform: 'uppercase', color: 'var(--gray)', marginBottom: 6 }}>{second.singleTitle}</div>}
              {second.descriptions && <p>{second.descriptions}</p>}
            </div>
            {bullets.length > 0 && (
              <div className="prev-summary-right">
                <div className="prev-label">Key Highlights</div>
                <ul className="prev-bullets">{bullets.map((b, i) => <li key={i}>{b}</li>)}</ul>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Portfolio */}
      {portfolio.length > 0 && (
        <div className={!formData.showPortfolio ? 'prev-hidden-section' : ''} style={{ position: 'relative' }}>
          <div style={{ position: 'absolute', top: 4, right: 4, zIndex: 10, background: formData.showPortfolio ? 'rgba(34,197,94,.2)' : 'rgba(100,100,100,.2)', borderRadius: 4, padding: '2px 6px', fontSize: 9, fontWeight: 700, color: formData.showPortfolio ? '#22c55e' : '#888', letterSpacing: '.1em' }}>
            {formData.showPortfolio ? 'PORTFOLIO ●' : 'PORTFOLIO ○'}
          </div>
          <div className="prev-portfolio">
            <div className="prev-label">Our Work</div>
            <div className="prev-playfair" style={{ fontSize: '1.1rem', fontWeight: 900, color: 'var(--navy)', marginBottom: 16 }}>Signature Projects</div>
            <div className="prev-port-grid">
              {portfolio.map((p, i) => (
                <div key={i} className="prev-port-item">
                  {p.image && <img src={p.image} alt={p.projectName} />}
                  <div className="prev-port-overlay" />
                  <div className="prev-port-content">
                    <div className="prev-port-tag">{p.tag || 'Project'}</div>
                    <div className="prev-port-name">{p.projectName || p.title || `Project ${i + 1}`}</div>
                    {p.location && <div className="prev-port-loc">📍 {p.location}</div>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Pricing */}
      {pricing.length > 0 && (
        <div className={!formData.showPricing ? 'prev-hidden-section' : ''} style={{ position: 'relative' }}>
          <div style={{ position: 'absolute', top: 4, right: 4, zIndex: 10, background: formData.showPricing ? 'rgba(34,197,94,.2)' : 'rgba(100,100,100,.2)', borderRadius: 4, padding: '2px 6px', fontSize: 9, fontWeight: 700, color: formData.showPricing ? '#22c55e' : '#888', letterSpacing: '.1em' }}>
            {formData.showPricing ? 'PRICING ●' : 'PRICING ○'}
          </div>
          <div className="prev-pricing">
            <div className="prev-label" style={{ color: 'var(--gold)' }}>Investment</div>
            <div className="prev-pricing-title">Transparent Pricing</div>
            <div className="prev-pricing-grid">
              {pricing.map((plan, i) => {
                const benefits = (() => {
                  if (!plan.benefits) return [];
                  if (Array.isArray(plan.benefits)) return plan.benefits;
                  return plan.benefits.split('\n').map(s => s.trim()).filter(Boolean);
                })();
                const isFeatured = plan.featured || (pricing.length === 3 && i === 1);
                return (
                  <div key={i} className={`prev-plan${isFeatured ? ' featured' : ''}`}>
                    <div className="prev-plan-name">{plan.title}</div>
                    <div className="prev-plan-price">{plan.price}</div>
                    <ul className="prev-plan-benefits">{benefits.map((b, j) => <li key={j}>{b}</li>)}</ul>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Gallery */}
      {gallery.length > 0 && (
        <div className={!formData.showGallery ? 'prev-hidden-section' : ''} style={{ position: 'relative' }}>
          <div style={{ position: 'absolute', top: 4, right: 4, zIndex: 10, background: formData.showGallery ? 'rgba(34,197,94,.2)' : 'rgba(100,100,100,.2)', borderRadius: 4, padding: '2px 6px', fontSize: 9, fontWeight: 700, color: formData.showGallery ? '#22c55e' : '#888', letterSpacing: '.1em' }}>
            {formData.showGallery ? 'GALLERY ●' : 'GALLERY ○'}
          </div>
          <div className="prev-gallery">
            <div className="prev-label">Visual Showcase</div>
            <div className="prev-playfair" style={{ fontSize: '1.1rem', fontWeight: 900, color: 'var(--navy)', marginBottom: 16 }}>Project Gallery</div>
            <div className="prev-gallery-grid">
              {gallery.map((g, i) => (
                <div key={i} className="prev-gallery-item">
                  <img src={g.image} alt={g.title} />
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Details */}
      {(coverage.title || fullDetails.title) && (
        <div className={(!formData.showCoverage && !formData.showFullDetails) ? 'prev-hidden-section' : ''} style={{ position: 'relative' }}>
          <div className="prev-details">
            <div className="prev-details-grid">
              {coverage.title && (
                <div className={`prev-coverage${!formData.showCoverage ? ' prev-hidden-section' : ''}`}>
                  <div className="prev-label" style={{ color: 'var(--gold)' }}>Service Reach</div>
                  <h3>{coverage.title}</h3>
                  {coverage.countriesCovered && (
                    <div className="prev-cov-row">
                      <div className="prev-cov-icon">🌍</div>
                      <div><div className="prev-cov-label">Countries</div><div className="prev-cov-value">{coverage.countriesCovered}</div></div>
                    </div>
                  )}
                  {coverage.availableServices && (
                    <div className="prev-cov-row">
                      <div className="prev-cov-icon">⚙</div>
                      <div><div className="prev-cov-label">Services</div><div className="prev-cov-value">{coverage.availableServices}</div></div>
                    </div>
                  )}
                  {coverage.turnaround && (
                    <div className="prev-cov-row">
                      <div className="prev-cov-icon">⏱</div>
                      <div><div className="prev-cov-label">Turnaround</div><div className="prev-cov-value">{coverage.turnaround}</div></div>
                    </div>
                  )}
                </div>
              )}
              {fullDetails.title && (
                <div className={`prev-full-details${!formData.showFullDetails ? ' prev-hidden-section' : ''}`}>
                  <div className="prev-label">In Depth</div>
                  {fullDetails.image && <img src={fullDetails.image} alt="" />}
                  <h3>{fullDetails.title}</h3>
                  {fullDetails.description && <p>{fullDetails.description}</p>}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* CTA */}
      <div className="prev-cta">
        <h2>Ready to Work with<br /><em>ACHAL International?</em></h2>
        <p>Experience world-class {pageName.toLowerCase()} service.</p>
        <div className="prev-cta-btns">
          <button className="prev-btn-gold">Get In Touch</button>
          <button className="prev-btn-ghost">View All Services</button>
        </div>
      </div>
    </div>
  );
}

// ─── Section panels ───────────────────────────────────────────

function BasicPanel({ formData, service, onInputChange }) {
  const sections = [
    { key: 'showHero', label: 'Hero Section' },
    { key: 'showSecondHero', label: 'Summary / Second Hero' },
    { key: 'showPortfolio', label: 'Portfolio' },
    { key: 'showPricing', label: 'Pricing Plans' },
    { key: 'showGallery', label: 'Gallery' },
    { key: 'showCoverage', label: 'Coverage' },
    { key: 'showFullDetails', label: 'Full Details' },
  ];
  return (
    <div>
      <div className="adm-section-header">
        <div className="adm-section-title"><Layout size={18} /> Page Settings</div>
      </div>
      <div style={{ background: 'var(--adm-card)', border: '1px solid var(--adm-border)', borderRadius: 10, padding: 16, marginBottom: 24 }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <div>
            <label className="adm-label">Service Name</label>
            <div className="adm-input" style={{ opacity: .6, fontSize: 13 }}>{service?.name || '—'}</div>
          </div>
          <div>
            <label className="adm-label">Slug</label>
            <div className="adm-input" style={{ opacity: .6, fontSize: 13, fontFamily: 'JetBrains Mono, monospace' }}>{service?.slug || '—'}</div>
          </div>
        </div>
      </div>
      <div style={{ marginBottom: 20 }}>
        <label className="adm-label">Published Status</label>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div className="adm-toggle-wrap" style={{ cursor: 'pointer', flex: 1 }}
            onClick={() => onInputChange({ target: { name: 'isPublished', type: 'checkbox', checked: !formData.isPublished } })}>
            <div className={`adm-toggle${formData.isPublished ? ' on' : ''}`} />
            <span style={{ fontSize: 13, fontWeight: 600 }}>{formData.isPublished ? 'Published — page is live' : 'Draft — page is hidden'}</span>
          </div>
        </div>
      </div>
      <label className="adm-label" style={{ marginBottom: 12 }}>Section Visibility</label>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
        {sections.map(sec => (
          <div key={sec.key}
            onClick={() => onInputChange({ target: { name: sec.key, type: 'checkbox', checked: !formData[sec.key] } })}
            style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 14px', background: 'var(--adm-card)', border: `1px solid ${formData[sec.key] ? 'rgba(200,169,110,.35)' : 'var(--adm-border)'}`, borderRadius: 10, cursor: 'pointer', transition: 'all .15s' }}>
            <div className={`adm-toggle${formData[sec.key] ? ' on' : ''}`} style={{ width: 32, height: 18 }} />
            <span style={{ fontSize: 12, fontWeight: 500, color: formData[sec.key] ? 'var(--adm-text)' : 'var(--adm-muted)' }}>{sec.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function HeroPanel({ formData, onInputChange, onNestedChange, onUpload, uploading }) {
  return (
    <div>
      <div className="adm-section-header">
        <div className="adm-section-title"><Layout size={18} /> Hero Section</div>
      </div>
      <Toggle on={formData.showHero} onChange={() => onInputChange({ target: { name: 'showHero', type: 'checkbox', checked: !formData.showHero } })} label="Show Hero Section on frontend" />
      <Field label="Heading">
        <input className="adm-input" value={formData.heroSection?.heading || ''} onChange={e => onNestedChange('heroSection', 'heading', e.target.value)} placeholder="e.g. Civil Engineering" />
      </Field>
      <Field label="Short Description">
        <textarea className="adm-input" value={formData.heroSection?.shortDescription || ''} onChange={e => onNestedChange('heroSection', 'shortDescription', e.target.value)} placeholder="A brief sentence about this service..." rows={3} />
      </Field>
      <Field label="CTA Button Text" hint="The primary gold button in the hero">
        <input className="adm-input" value={formData.heroSection?.buttonText || ''} onChange={e => onNestedChange('heroSection', 'buttonText', e.target.value)} placeholder="Request a Quote" />
      </Field>
      <ImageField
        label="Background Image"
        value={formData.heroSection?.backgroundImage || ''}
        onChange={v => onNestedChange('heroSection', 'backgroundImage', v)}
        onUpload={onUpload}
        uploading={uploading}
      />
    </div>
  );
}

function SummaryPanel({ formData, onInputChange, onNestedChange }) {
  return (
    <div>
      <div className="adm-section-header">
        <div className="adm-section-title"><Type size={18} /> Summary Section</div>
      </div>
      <Toggle on={formData.showSecondHero} onChange={() => onInputChange({ target: { name: 'showSecondHero', type: 'checkbox', checked: !formData.showSecondHero } })} label="Show Summary Section" />
      <Field label="Main Title">
        <input className="adm-input" value={formData.secondHeroSection?.mainTitle || ''} onChange={e => onNestedChange('secondHeroSection', 'mainTitle', e.target.value)} placeholder="e.g. Engineering Excellence Across India" />
      </Field>
      <Field label="Sub-label (small uppercase text)">
        <input className="adm-input" value={formData.secondHeroSection?.singleTitle || ''} onChange={e => onNestedChange('secondHeroSection', 'singleTitle', e.target.value)} placeholder="e.g. What We Offer" />
      </Field>
      <Field label="Description Paragraph">
        <textarea className="adm-input" value={formData.secondHeroSection?.descriptions || ''} onChange={e => onNestedChange('secondHeroSection', 'descriptions', e.target.value)} rows={4} placeholder="Describe the service in detail..." />
      </Field>
      <Field label="Bullet Points" hint="One bullet per line. Appears as a highlighted list on the right side.">
        <textarea className="adm-input" value={formData.secondHeroSection?.bullets || ''} onChange={e => onNestedChange('secondHeroSection', 'bullets', e.target.value)} rows={6} placeholder={"BIM-enabled project planning\nISO 9001-certified quality\nTurnkey delivery"} style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 12 }} />
      </Field>
    </div>
  );
}

function PortfolioPanel({ formData, onInputChange, onPortfolioChange, onPortfolioUpload, addPortfolio, removePortfolio, uploading }) {
  return (
    <div>
      <div className="adm-section-header">
        <div className="adm-section-title"><Grid size={18} /> Portfolio</div>
      </div>
      <Toggle on={formData.showPortfolio} onChange={() => onInputChange({ target: { name: 'showPortfolio', type: 'checkbox', checked: !formData.showPortfolio } })} label="Show Portfolio Section" />
      {(formData.portfolioSections || []).map((item, idx) => (
        <div key={idx} className="adm-item-card">
          <div className="adm-item-card-header">
            <div className="adm-item-card-num"><GripVertical size={14} /> Project #{idx + 1}</div>
            <button type="button" className="adm-remove-btn" onClick={() => removePortfolio(idx)}><Trash2 size={12} /> Remove</button>
          </div>
          <div className="adm-grid-2">
            <Field label="Project Name">
              <input className="adm-input" value={item.projectName || ''} onChange={e => onPortfolioChange(idx, 'projectName', e.target.value)} placeholder="Patna Highway Overpass" />
            </Field>
            <Field label="Tag / Category">
              <input className="adm-input" value={item.tag || ''} onChange={e => onPortfolioChange(idx, 'tag', e.target.value)} placeholder="Infrastructure" />
            </Field>
          </div>
          <Field label="Location">
            <input className="adm-input" value={item.location || ''} onChange={e => onPortfolioChange(idx, 'location', e.target.value)} placeholder="Patna, Bihar" />
          </Field>
          <Field label="Short Description">
            <textarea className="adm-input" value={item.projectDescription || ''} onChange={e => onPortfolioChange(idx, 'projectDescription', e.target.value)} rows={2} />
          </Field>
          <ImageField
            label="Project Image"
            value={item.image || ''}
            onChange={v => onPortfolioChange(idx, 'image', v)}
            onUpload={async (f) => { const url = await onPortfolioUpload(idx, f); return url; }}
            uploading={uploading}
          />
        </div>
      ))}
      <button type="button" className="adm-add-btn" onClick={addPortfolio}><Plus size={15} /> Add Project</button>
    </div>
  );
}

function PricingPanel({ formData, onInputChange, onPricingChange, addPricing, removePricing }) {
  return (
    <div>
      <div className="adm-section-header">
        <div className="adm-section-title"><DollarSign size={18} /> Pricing Plans</div>
      </div>
      <Toggle on={formData.showPricing} onChange={() => onInputChange({ target: { name: 'showPricing', type: 'checkbox', checked: !formData.showPricing } })} label="Show Pricing Section" />
      <div style={{ background: 'rgba(200,169,110,.06)', border: '1px solid rgba(200,169,110,.2)', borderRadius: 8, padding: '10px 14px', marginBottom: 18, fontSize: 12, color: 'var(--adm-muted)', display: 'flex', gap: 8, alignItems: 'flex-start' }}>
        <AlertCircle size={14} style={{ color: 'var(--adm-accent)', flexShrink: 0, marginTop: 1 }} />
        If you have exactly 3 plans, the middle one is automatically marked as "Most Popular".
      </div>
      {(formData.pricingPlans || []).map((plan, idx) => (
        <div key={idx} className="adm-item-card">
          <div className="adm-item-card-header">
            <div className="adm-item-card-num">
              {formData.pricingPlans.length === 3 && idx === 1
                ? <span style={{ color: 'var(--adm-accent)', fontSize: 10, background: 'rgba(200,169,110,.15)', padding: '2px 8px', borderRadius: 4 }}>★ Featured</span>
                : `Plan #${idx + 1}`}
            </div>
            <button type="button" className="adm-remove-btn" onClick={() => removePricing(idx)}><Trash2 size={12} /> Remove</button>
          </div>
          <div className="adm-grid-2">
            <Field label="Plan Name">
              <input className="adm-input" value={plan.title || ''} onChange={e => onPricingChange(idx, 'title', e.target.value)} placeholder="Full Project" />
            </Field>
            <Field label="Price">
              <input className="adm-input" value={plan.price || ''} onChange={e => onPricingChange(idx, 'price', e.target.value)} placeholder="₹25K or Custom" />
            </Field>
          </div>
          <Field label="Benefits" hint="One benefit per line">
            <textarea className="adm-input" value={plan.benefits || ''} onChange={e => onPricingChange(idx, 'benefits', e.target.value)} rows={4} placeholder={"End-to-end project management\nBIM-enabled design\nStructural engineering"} style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 12 }} />
          </Field>
        </div>
      ))}
      <button type="button" className="adm-add-btn" onClick={addPricing}><Plus size={15} /> Add Plan</button>
    </div>
  );
}

function GalleryPanel({ formData, onInputChange, setFormData, onUpload, uploading }) {
  const [newTitle, setNewTitle] = useState('');
  const [newUrl, setNewUrl] = useState('');
  const [newFile, setNewFile] = useState(null);
  const fileRef = useRef();
  const galleryItems = formData.galleryLines ? formData.galleryLines.split('\n').map(l => {
    const [title, image] = l.split('|').map(s => s.trim());
    return { title: title || '', image: image || '' };
  }).filter(g => g.image || g.title) : [];

  const addItem = async () => {
    let url = newUrl;
    if (newFile) {
      const uploaded = await onUpload(newFile);
      if (!uploaded) { alert('Upload failed'); return; }
      url = uploaded;
    }
    if (!url) { alert('Please provide an image URL or upload a file'); return; }
    const line = `${newTitle}|${url}`;
    setFormData(prev => ({ ...prev, galleryLines: prev.galleryLines ? prev.galleryLines + '\n' + line : line }));
    setNewTitle(''); setNewUrl(''); setNewFile(null);
    if (fileRef.current) fileRef.current.value = '';
  };

  const removeItem = (idx) => {
    const lines = formData.galleryLines ? formData.galleryLines.split('\n') : [];
    lines.splice(idx, 1);
    setFormData(prev => ({ ...prev, galleryLines: lines.join('\n') }));
  };

  return (
    <div>
      <div className="adm-section-header">
        <div className="adm-section-title"><ImageIcon size={18} /> Gallery</div>
      </div>
      <Toggle on={formData.showGallery} onChange={() => onInputChange({ target: { name: 'showGallery', type: 'checkbox', checked: !formData.showGallery } })} label="Show Gallery Section" />
      {galleryItems.length > 0 && (
        <div className="adm-gallery-grid">
          {galleryItems.map((g, i) => (
            <div key={i} className="adm-gallery-thumb">
              {g.image ? <img src={g.image} alt={g.title} /> : <ImageIcon size={18} color="var(--adm-muted)" />}
              {g.title && <div className="adm-gallery-thumb-title">{g.title}</div>}
              <button type="button" className="adm-gallery-thumb-remove" onClick={() => removeItem(i)}><X size={10} /></button>
            </div>
          ))}
        </div>
      )}
      <div style={{ background: 'var(--adm-card)', border: '1px solid var(--adm-border)', borderRadius: 10, padding: 16, marginBottom: 16 }}>
        <label className="adm-label" style={{ marginBottom: 12 }}>Add Gallery Item</label>
        <Field label="Title (optional)">
          <input className="adm-input" value={newTitle} onChange={e => setNewTitle(e.target.value)} placeholder="Bridge Construction" />
        </Field>
        <div className="adm-grid-2">
          <Field label="Image URL">
            <input className="adm-input" value={newUrl} onChange={e => setNewUrl(e.target.value)} placeholder="https://..." />
          </Field>
          <Field label="Or Upload">
            <label className="adm-upload-btn" style={{ width: '100%', justifyContent: 'center' }}>
              {uploading ? <Loader2 size={13} className="adm-spin" /> : <Upload size={13} />}
              {newFile ? newFile.name.slice(0, 20) + '…' : 'Choose image'}
              <input ref={fileRef} type="file" accept="image/*" onChange={e => setNewFile(e.target.files[0])} />
            </label>
          </Field>
        </div>
        <button type="button" className="adm-add-btn" onClick={addItem} disabled={uploading}>
          {uploading ? <Loader2 size={14} className="adm-spin" /> : <Plus size={14} />}
          {uploading ? 'Uploading…' : 'Add to Gallery'}
        </button>
      </div>
      <Field label="Raw Gallery Data" hint="Format: Title|ImageURL — one per line. You can edit directly here.">
        <textarea className="adm-input" name="galleryLines" value={formData.galleryLines || ''} onChange={onInputChange} rows={6} style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 11 }} />
      </Field>
    </div>
  );
}

function CoveragePanel({ formData, onInputChange, onNestedChange }) {
  return (
    <div>
      <div className="adm-section-header">
        <div className="adm-section-title"><Map size={18} /> Coverage Section</div>
      </div>
      <Toggle on={formData.showCoverage} onChange={() => onInputChange({ target: { name: 'showCoverage', type: 'checkbox', checked: !formData.showCoverage } })} label="Show Coverage Section" />
      <Field label="Section Title">
        <input className="adm-input" value={formData.coverageSection?.title || ''} onChange={e => onNestedChange('coverageSection', 'title', e.target.value)} placeholder="Our Service Coverage" />
      </Field>
      <div className="adm-coverage-rows">
        <div className="adm-coverage-row-item">
          <div className="adm-coverage-icon-wrap">🌍</div>
          <div style={{ flex: 1 }}>
            <label className="adm-label">Countries Covered</label>
            <input className="adm-input" value={formData.coverageSection?.countriesCovered || ''} onChange={e => onNestedChange('coverageSection', 'countriesCovered', e.target.value)} placeholder="India, Bangladesh, Nepal" />
          </div>
        </div>
        <div className="adm-coverage-row-item">
          <div className="adm-coverage-icon-wrap">⚙</div>
          <div style={{ flex: 1 }}>
            <label className="adm-label">Available Services</label>
            <input className="adm-input" value={formData.coverageSection?.availableServices || ''} onChange={e => onNestedChange('coverageSection', 'availableServices', e.target.value)} placeholder="Civil Design, Structural Engineering..." />
          </div>
        </div>
        <div className="adm-coverage-row-item">
          <div className="adm-coverage-icon-wrap">⏱</div>
          <div style={{ flex: 1 }}>
            <label className="adm-label">Turnaround Time</label>
            <input className="adm-input" value={formData.coverageSection?.turnaround || ''} onChange={e => onNestedChange('coverageSection', 'turnaround', e.target.value)} placeholder="Project kick-off within 7 working days" />
          </div>
        </div>
      </div>
    </div>
  );
}

function FullDetailsPanel({ formData, onInputChange, onNestedChange, onUpload, uploading }) {
  return (
    <div>
      <div className="adm-section-header">
        <div className="adm-section-title"><Info size={18} /> Full Details Section</div>
      </div>
      <Toggle on={formData.showFullDetails} onChange={() => onInputChange({ target: { name: 'showFullDetails', type: 'checkbox', checked: !formData.showFullDetails } })} label="Show Full Details Section" />
      <Field label="Title">
        <input className="adm-input" value={formData.fullDetailsSection?.title || ''} onChange={e => onNestedChange('fullDetailsSection', 'title', e.target.value)} placeholder="Why Our Service Stands Apart" />
      </Field>
      <Field label="Description">
        <textarea className="adm-input" value={formData.fullDetailsSection?.description || ''} onChange={e => onNestedChange('fullDetailsSection', 'description', e.target.value)} rows={5} placeholder="Detailed description of this service's unique value proposition..." />
      </Field>
      <ImageField
        label="Section Image"
        value={formData.fullDetailsSection?.image || ''}
        onChange={v => onNestedChange('fullDetailsSection', 'image', v)}
        onUpload={onUpload}
        uploading={uploading}
      />
    </div>
  );
}

// ─── Navigation config ────────────────────────────────────────
const NAV_ITEMS = [
  { key: 'basic', label: 'Page Settings', icon: Layout, showKey: null },
  { key: 'hero', label: 'Hero', icon: ImageIcon, showKey: 'showHero' },
  { key: 'secondHero', label: 'Summary', icon: Type, showKey: 'showSecondHero' },
  { key: 'portfolio', label: 'Portfolio', icon: Grid, showKey: 'showPortfolio' },
  { key: 'pricing', label: 'Pricing', icon: DollarSign, showKey: 'showPricing' },
  { key: 'gallery', label: 'Gallery', icon: ImageIcon, showKey: 'showGallery' },
  { key: 'coverage', label: 'Coverage', icon: Map, showKey: 'showCoverage' },
  { key: 'fullDetails', label: 'Full Details', icon: Info, showKey: 'showFullDetails' },
];

// ─── Default form ─────────────────────────────────────────────
const defaultForm = {
  id: null, name: '', description: '', serviceId: '', isPublished: false,
  showHero: true, showSecondHero: true, showPortfolio: true,
  showPricing: true, showGallery: true, showCoverage: true, showFullDetails: true,
  heroSection: { heading: '', backgroundImage: '', shortDescription: '', buttonText: '' },
  secondHeroSection: { mainTitle: '', singleTitle: '', descriptions: '', bullets: '' },
  portfolioSections: [],
  pricingPlans: [],
  galleryLines: '',
  coverageSection: { title: '', countriesCovered: '', availableServices: '', turnaround: '' },
  fullDetailsSection: { title: '', description: '', image: '' },
};

// ─── Main Component ───────────────────────────────────────────
export default function ServicePageAdmin() {
  const { slug } = useParams();
  const router = useRouter();

  const [service, setService] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [activeTab, setActiveTab] = useState('basic');
  const [showPreview, setShowPreview] = useState(true);
  const [toast, setToast] = useState(null);
  const [formData, setFormData] = useState(defaultForm);

  const showToast = useCallback((msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  }, []);

  // ── Load ──
  useEffect(() => {
    async function load() {
      if (!slug) return;
      try {
        const svcRes = await fetch(`${API_BASE}/api/services`, { method: 'GET', mode: 'cors', credentials: 'include' });
        if (!svcRes.ok) { setLoading(false); return; }
        const list = await svcRes.json();
        const svc = Array.isArray(list) ? list.find(s => String(s.slug) === String(slug)) : null;
        if (!svc) { setLoading(false); return; }
        setService(svc);

        const pageRes = await fetch(`${API_BASE}/api/service-pages/service/${svc.id}`, { method: 'GET', mode: 'cors', credentials: 'include' });
        if (pageRes.ok) {
          const page = await pageRes.json();
          hydratePage(page);
        } else {
          setFormData(prev => ({ ...prev, serviceId: svc.id, name: svc.name }));
        }
      } catch (err) {
        console.error('Load failed', err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [slug]);

  function hydratePage(page) {
    const p = { ...defaultForm, ...page };
    p.heroSection = { ...defaultForm.heroSection, ...(page.heroSection || {}) };
    p.secondHeroSection = { ...defaultForm.secondHeroSection, ...(page.secondHeroSection || {}) };
    p.portfolioSections = page.portfolioSections || [];
    p.pricingPlans = (page.pricingPlans || []).map(plan => ({
      title: plan.title || '',
      price: plan.price || '',
      benefits: Array.isArray(plan.benefits) ? plan.benefits.join('\n') : (plan.benefits ? String(plan.benefits) : ''),
      featured: plan.featured || false,
    }));
    p.galleryLines = (page.galleryItems || []).map(g => `${g.title || ''}|${g.image || ''}`).join('\n');
    p.coverageSection = { ...defaultForm.coverageSection, ...(page.coverageSection || {}) };
    p.fullDetailsSection = { ...defaultForm.fullDetailsSection, ...(page.fullDetailsSection || {}) };
    setFormData(p);
  }

  // ── Handlers ──
  const handleInputChange = useCallback((e) => {
    const { name, value, type, checked } = e.target;
    if (name?.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData(prev => ({ ...prev, [parent]: { ...(prev[parent] || {}), [child]: type === 'checkbox' ? checked : value } }));
      return;
    }
    setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  }, []);

  const handleNestedChange = useCallback((parent, child, value) => {
    setFormData(prev => ({ ...prev, [parent]: { ...(prev[parent] || {}), [child]: value } }));
  }, []);

  const handlePortfolioChange = useCallback((idx, field, value) => {
    setFormData(prev => {
      const s = [...(prev.portfolioSections || [])];
      s[idx] = { ...(s[idx] || {}), [field]: value };
      return { ...prev, portfolioSections: s };
    });
  }, []);

  const handlePortfolioUpload = useCallback(async (idx, file) => {
    setUploading(true);
    try {
      const url = await uploadFile(file);
      if (url) handlePortfolioChange(idx, 'image', url);
      return url;
    } catch (e) { alert('Upload failed'); return null; }
    finally { setUploading(false); }
  }, [handlePortfolioChange]);

  const handlePricingChange = useCallback((idx, field, value) => {
    setFormData(prev => {
      const arr = [...(prev.pricingPlans || [])];
      arr[idx] = { ...(arr[idx] || {}), [field]: value };
      return { ...prev, pricingPlans: arr };
    });
  }, []);

  const handleUpload = useCallback(async (file) => {
    setUploading(true);
    try { return await uploadFile(file); }
    catch (e) { alert('Upload failed'); return null; }
    finally { setUploading(false); }
  }, []);

  // ── Submit ──
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!service?.id) { showToast('Linked service is required', 'error'); return; }
    setIsSaving(true);
    try {
      const payload = {
        id: formData.id,
        name: service.name,
        description: formData.description,
        serviceId: service.id,
        isPublished: !!formData.isPublished,
        showHero: !!formData.showHero,
        showSecondHero: !!formData.showSecondHero,
        showPortfolio: !!formData.showPortfolio,
        showPricing: !!formData.showPricing,
        showGallery: !!formData.showGallery,
        showCoverage: !!formData.showCoverage,
        showFullDetails: !!formData.showFullDetails,
        heroSection: formData.heroSection || null,
        secondHeroSection: formData.secondHeroSection || null,
        portfolioSections: (formData.portfolioSections || []).map(p => ({
          image: p.image || '', projectName: p.projectName || '',
          projectDescription: p.projectDescription || '',
          location: p.location || '', title: p.title || '', tag: p.tag || '',
        })),
        pricingPlans: (formData.pricingPlans || []).map(p => ({
          title: p.title || '', price: p.price || '',
          benefits: p.benefits ? p.benefits.split('\n').map(s => s.trim()).filter(Boolean) : [],
          featured: p.featured || false,
        })),
        galleryItems: formData.galleryLines
          ? formData.galleryLines.split('\n').map(l => {
            const [title, image] = l.split('|').map(s => s.trim());
            return { title: title || '', image: image || '' };
          }).filter(g => g.image)
          : [],
        coverageSection: formData.coverageSection || null,
        fullDetailsSection: formData.fullDetailsSection || null,
      };

      let saved;
      if (payload.id) {
        const res = await fetch(`${API_BASE}/api/service-pages/${payload.id}`, { method: 'PUT', mode: 'cors', credentials: 'include', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
        if (!res.ok) throw await res.json();
        saved = await res.json();
      } else {
        const res = await fetch(`${API_BASE}/api/service-pages`, { method: 'POST', mode: 'cors', credentials: 'include', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
        if (!res.ok) throw await res.json();
        saved = await res.json();
      }

      // re-fetch latest
      try {
        const id = saved?.id;
        const ref = await fetch(`${API_BASE}/api/service-pages/${id || `service/${service.id}`}`, { method: 'GET', mode: 'cors', credentials: 'include', headers: { 'Cache-Control': 'no-cache' } });
        if (ref.ok) hydratePage(await ref.json());
      } catch (_) { }

      showToast('Page saved successfully!', 'success');
    } catch (err) {
      console.error('Save failed', err);
      showToast(err?.message || 'Save failed', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) return (
    <>
      <style>{ADMIN_STYLES}</style>
      <div className="adm-loading">
        <Loader2 size={32} className="adm-spin" />
        <span>Loading service page…</span>
      </div>
    </>
  );

  if (!service) return (
    <>
      <style>{ADMIN_STYLES}</style>
      <div className="adm-loading">
        <AlertCircle size={32} style={{ color: 'var(--adm-danger)' }} />
        <span>Service not found for slug: <code>{slug}</code></span>
      </div>
    </>
  );

  const sharedProps = { formData, onInputChange: handleInputChange, onNestedChange: handleNestedChange, onUpload: handleUpload, uploading };

  return (
    <>
      <style>{ADMIN_STYLES}</style>
      <div className="adm-root">
        {/* Top Bar */}
        <header className="adm-topbar">
          <button className="adm-back-btn" onClick={() => router.back()}><ArrowLeft size={16} /></button>
          <div>
            <div className="adm-topbar-title">Service Page Editor</div>
            <div className="adm-topbar-sub">{service.name}</div>
          </div>
          <div className="adm-topbar-right">
            <div
              className={`adm-publish-pill ${formData.isPublished ? 'published' : 'draft'}`}
              onClick={() => handleInputChange({ target: { name: 'isPublished', type: 'checkbox', checked: !formData.isPublished } })}
            >
              <div style={{ width: 6, height: 6, borderRadius: '50%', background: 'currentColor' }} />
              {formData.isPublished ? 'Published' : 'Draft'}
            </div>
            <button className="adm-preview-toggle" onClick={() => setShowPreview(v => !v)}>
              {showPreview ? <EyeOff size={13} /> : <Eye size={13} />}
              {showPreview ? 'Hide Preview' : 'Live Preview'}
            </button>
            <button className="adm-save-btn" onClick={handleSubmit} disabled={isSaving}>
              {isSaving ? <Loader2 size={15} className="adm-spin" /> : <Save size={15} />}
              {isSaving ? 'Saving…' : 'Save Changes'}
            </button>
          </div>
        </header>

        {/* Body */}
        <div className="adm-body">
          {/* Side Nav */}
          <nav className="adm-sidenav">
            <div className="adm-sidenav-header">Sections</div>
            {NAV_ITEMS.map(item => {
              const Icon = item.icon;
              const isVisible = item.showKey ? formData[item.showKey] : true;
              return (
                <div key={item.key} className={`adm-nav-item${activeTab === item.key ? ' active' : ''}`} onClick={() => setActiveTab(item.key)}>
                  <Icon size={15} className="nav-icon" />
                  {item.label}
                  {item.showKey && <div className={`adm-nav-vis-dot${isVisible ? '' : ' off'}`} />}
                </div>
              );
            })}
          </nav>

          {/* Editor */}
          <main className="adm-editor">
            <form onSubmit={handleSubmit}>
              {activeTab === 'basic' && <BasicPanel formData={formData} service={service} onInputChange={handleInputChange} />}
              {activeTab === 'hero' && <HeroPanel {...sharedProps} />}
              {activeTab === 'secondHero' && <SummaryPanel {...sharedProps} />}
              {activeTab === 'portfolio' && (
                <PortfolioPanel {...sharedProps}
                  onPortfolioChange={handlePortfolioChange}
                  onPortfolioUpload={handlePortfolioUpload}
                  addPortfolio={() => setFormData(prev => ({ ...prev, portfolioSections: [...(prev.portfolioSections || []), { image: '', projectName: '', projectDescription: '', location: '', title: '', tag: '' }] }))}
                  removePortfolio={idx => setFormData(prev => ({ ...prev, portfolioSections: (prev.portfolioSections || []).filter((_, i) => i !== idx) }))}
                />
              )}
              {activeTab === 'pricing' && (
                <PricingPanel {...sharedProps}
                  onPricingChange={handlePricingChange}
                  addPricing={() => setFormData(prev => ({ ...prev, pricingPlans: [...(prev.pricingPlans || []), { title: '', price: '', benefits: '' }] }))}
                  removePricing={idx => setFormData(prev => ({ ...prev, pricingPlans: (prev.pricingPlans || []).filter((_, i) => i !== idx) }))}
                />
              )}
              {activeTab === 'gallery' && <GalleryPanel {...sharedProps} setFormData={setFormData} />}
              {activeTab === 'coverage' && <CoveragePanel {...sharedProps} />}
              {activeTab === 'fullDetails' && <FullDetailsPanel {...sharedProps} />}
            </form>
          </main>

          {/* Live Preview */}
          <aside className={`adm-preview-pane${showPreview ? '' : ' hidden'}`}>
            <div className="adm-preview-bar">
              <span>Preview</span>
              <div className="adm-preview-device-btns">
                <button className="adm-preview-device-btn active"><Monitor size={11} /> Desktop</button>
              </div>
            </div>
            <LivePreview formData={formData} service={service} />
          </aside>
        </div>

        {/* Toast */}
        {toast && (
          <div className={`adm-toast ${toast.type}`}>
            {toast.type === 'success' ? <Check size={16} /> : <AlertCircle size={16} />}
            {toast.msg}
          </div>
        )}
      </div>
    </>
  );
}