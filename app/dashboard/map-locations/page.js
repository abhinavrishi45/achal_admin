"use client";

import { useEffect, useState } from "react";
import { Plus, Trash2, Edit2, Save, Loader2, MapPin } from "lucide-react";
const GM_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '';
const API_BASE = process.env.NEXT_PUBLIC_BACKEND_URL || 'https://achal-backend-trial.tannis.in';

const inputCls = "w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all bg-gray-50 text-gray-800 text-sm";

export default function MapLocations() {
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

  const blank = { name: '', lat: '', lng: '', address: '', description: '', isPublished: true };
  const [form, setForm] = useState(blank);
  const [editingId, setEditingId] = useState(null);

  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: '', type: 'success' }), 3000);
  };

  const fetchLocations = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/locations`, { method: 'GET', mode: 'cors', credentials: 'include' });
      if (!res.ok) throw new Error('Failed to load');
      const data = await res.json();
      setLocations(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
      showToast('Failed to load locations', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchLocations(); }, []);

  const handleEdit = (loc) => {
    setEditingId(loc.id);
    setForm({ name: loc.name || '', lat: String(loc.lat || ''), lng: String(loc.lng || ''), address: loc.address || '', description: loc.description || '', isPublished: !!loc.isPublished });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this location?')) return;
    try {
      const res = await fetch(`${API_BASE}/api/locations/${id}`, { method: 'DELETE', mode: 'cors', credentials: 'include' });
      if (!res.ok) throw new Error('Delete failed');
      showToast('Deleted');
      fetchLocations();
    } catch (err) {
      console.error(err);
      showToast('Delete failed', 'error');
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      // Normalize coordinates and geocode if needed
      let latv = form.lat != null && form.lat !== '' ? parseFloat(form.lat) : NaN;
      let lngv = form.lng != null && form.lng !== '' ? parseFloat(form.lng) : NaN;

      const needsGeocode = !isFinite(latv) || !isFinite(lngv);
      if (needsGeocode) {
        const query = (form.address || form.name || '').trim();
        if (query && GM_API_KEY) {
          try {
            const geoRes = await fetch(`https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(query)}&key=${GM_API_KEY}`);
            if (geoRes.ok) {
              const geoJson = await geoRes.json();
              if (geoJson.status === 'OK' && Array.isArray(geoJson.results) && geoJson.results.length > 0) {
                const loc = geoJson.results[0].geometry.location;
                latv = parseFloat(loc.lat);
                lngv = parseFloat(loc.lng);
                setForm(f => ({ ...f, lat: String(latv), lng: String(lngv) }));
                showToast('Location resolved via Geocoding');
              } else {
                showToast('Geocoding: no results found for query', 'error');
                setSaving(false);
                return;
              }
            } else {
              showToast('Geocoding request failed', 'error');
              setSaving(false);
              return;
            }
          } catch (gerr) {
            console.error('Geocode error', gerr);
            showToast('Geocoding error', 'error');
            setSaving(false);
            return;
          }
        } else {
          showToast('Provide latitude/longitude or a place/address to geocode', 'error');
          setSaving(false);
          return;
        }
      }

      const payload = {
        name: form.name,
        lat: latv,
        lng: lngv,
        address: form.address,
        description: form.description,
        isPublished: !!form.isPublished,
      };

      let res;
      if (editingId) {
        res = await fetch(`${API_BASE}/api/locations/${editingId}`, { method: 'PUT', mode: 'cors', credentials: 'include', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
      } else {
        res = await fetch(`${API_BASE}/api/locations`, { method: 'POST', mode: 'cors', credentials: 'include', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
      }

      if (!res.ok) throw new Error('Save failed');
      showToast('Saved');
      setForm(blank);
      setEditingId(null);
      fetchLocations();
    } catch (err) {
      console.error(err);
      showToast('Save failed', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleLocate = async () => {
    const query = (form.address || form.name || '').trim();
    if (!query) { showToast('Enter a place name or address to locate', 'error'); return; }
    if (!GM_API_KEY) { showToast('Google Maps API key not set', 'error'); return; }
    try {
      const geoRes = await fetch(`https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(query)}&key=${GM_API_KEY}`);
      if (!geoRes.ok) { showToast('Geocoding request failed', 'error'); return; }
      const geoJson = await geoRes.json();
      if (geoJson.status === 'OK' && Array.isArray(geoJson.results) && geoJson.results.length > 0) {
        const loc = geoJson.results[0].geometry.location;
        setForm(f => ({ ...f, lat: String(loc.lat), lng: String(loc.lng) }));
        showToast('Coordinates filled from Geocoding');
      } else {
        showToast('No results found', 'error');
      }
    } catch (err) {
      console.error('Locate error', err);
      showToast('Geocoding failed', 'error');
    }
  };

  const handleAddNew = () => { setForm(blank); setEditingId(null); window.scrollTo({ top: 0, behavior: 'smooth' }); };

  return (
    <div className="max-w-6xl mx-auto pb-12">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Map Locations</h1>
          <p className="text-sm text-gray-500 mt-0.5">Add, edit or remove service locations (pins shown on frontend map).</p>
        </div>
        <button onClick={handleAddNew} className="flex items-center gap-2 px-3 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors text-sm font-medium">
          <Plus className="w-4 h-4" /> Add New
        </button>
      </div>

      {toast.show && (
        <div className={`mb-4 p-3 rounded-lg ${toast.type === 'error' ? 'bg-red-50 text-red-700 border border-red-100' : 'bg-green-50 text-green-700 border border-green-100'}`}>
          {toast.message}
        </div>
      )}

      <form onSubmit={handleSave} className="bg-white rounded-xl border border-gray-100 p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
            <input className={inputCls} value={form.name} onChange={(e) => setForm(f => ({ ...f, name: e.target.value }))} required />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Latitude</label>
            <input className={inputCls} value={form.lat} onChange={(e) => setForm(f => ({ ...f, lat: e.target.value }))} required />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Longitude</label>
            <input className={inputCls} value={form.lng} onChange={(e) => setForm(f => ({ ...f, lng: e.target.value }))} required />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Address (optional)</label>
            <input className={inputCls} value={form.address} onChange={(e) => setForm(f => ({ ...f, address: e.target.value }))} />
            <p className="text-xs text-gray-400 mt-1">You can enter an airport or place name (for example: "Chhatrapati Shivaji Intl Airport") and click <strong>Locate</strong> to fill coordinates.</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Published</label>
            <div className="mt-1">
              <label className="inline-flex items-center gap-2">
                <input type="checkbox" checked={!!form.isPublished} onChange={(e) => setForm(f => ({ ...f, isPublished: e.target.checked }))} />
                <span className="text-sm text-gray-600">Show on frontend map</span>
              </label>
            </div>
          </div>
        </div>

        <div className="mt-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">Description (optional)</label>
          <textarea rows={3} className="w-full px-4 py-2 border border-gray-200 rounded-lg bg-gray-50 text-sm" value={form.description} onChange={(e) => setForm(f => ({ ...f, description: e.target.value }))} />
        </div>

        <div className="mt-4 flex items-center gap-3">
          <button type="submit" disabled={saving} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2">
            {saving ? <><Loader2 className="w-4 h-4 animate-spin" /> Saving...</> : <><Save className="w-4 h-4" /> Save</>}
          </button>
          <button type="button" onClick={handleLocate} disabled={saving} className="px-3 py-2 bg-amber-50 text-amber-700 rounded-lg hover:bg-amber-100 transition-colors flex items-center gap-2 text-sm">
            <MapPin className="w-4 h-4" /> Locate
          </button>
          {editingId && (
            <button type="button" onClick={() => { setForm(blank); setEditingId(null); }} className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm">Cancel</button>
          )}
        </div>
      </form>

      <div className="space-y-3">
        {loading ? (
          <div className="bg-white rounded-xl border border-gray-100 p-12 flex items-center justify-center">
            <Loader2 className="w-6 h-6 text-blue-500 animate-spin mr-2" />
            <span className="text-gray-400">Loading locations...</span>
          </div>
        ) : (
          <div className="grid gap-3">
            {locations.map(loc => (
              <div key={loc.id} className="bg-white border border-gray-100 rounded-xl p-4 flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-3">
                    <h3 className="font-semibold text-gray-800">{loc.name}</h3>
                    <div className="text-xs text-gray-500">{loc.lat}, {loc.lng}</div>
                  </div>
                  {loc.address && <div className="text-sm text-gray-500 mt-1">{loc.address}</div>}
                  {loc.description && <div className="text-sm text-gray-500 mt-1">{loc.description}</div>}
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={() => handleEdit(loc)} className="px-3 py-2 bg-yellow-50 text-yellow-700 rounded-lg text-sm flex items-center gap-2"><Edit2 className="w-4 h-4" />Edit</button>
                  <button onClick={() => handleDelete(loc.id)} className="px-3 py-2 bg-red-50 text-red-700 rounded-lg text-sm flex items-center gap-2"><Trash2 className="w-4 h-4" />Delete</button>
                </div>
              </div>
            ))}
            {locations.length === 0 && (
              <div className="bg-white rounded-xl border border-gray-100 p-8 text-center text-gray-500">No locations yet.</div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
