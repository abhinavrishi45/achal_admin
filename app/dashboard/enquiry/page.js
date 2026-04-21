"use client";

import { useState, useEffect } from "react";
import { Trash2, Eye, X } from "lucide-react";
const API_BASE = process.env.NEXT_PUBLIC_BACKEND_URL || 'https://achal-backend-trial.tannis.in';

export default function EnquiryAdmin() {
  const [enquiries, setEnquiries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);

  useEffect(() => { load(); }, []);

  const load = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/inquiries`, { method: 'GET', mode: 'cors', credentials: 'include' });
      if (res.ok) {
        const data = await res.json();
        setEnquiries(Array.isArray(data) ? data : []);
      }
    } catch (err) { console.error('Failed to load enquiries', err); }
    setLoading(false);
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete enquiry?')) return;
    try {
      const res = await fetch(`${API_BASE}/api/inquiries/${id}`, { method: 'DELETE', mode: 'cors', credentials: 'include' });
      if (res.ok) load();
    } catch (err) { console.error('delete error', err); }
  };

  return (
    <div className="max-w-7xl mx-auto pb-10">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Enquiries</h1>
          <p className="text-sm text-gray-500">Messages submitted via the Contact form.</p>
        </div>
      </div>

      <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-50 text-gray-500 text-sm border-b">
                <th className="px-6 py-3 font-medium">Name / Email</th>
                <th className="px-6 py-3 font-medium">Phone / Department</th>
                <th className="px-6 py-3 font-medium">Subject</th>
                <th className="px-6 py-3 font-medium">Submitted</th>
                <th className="px-6 py-3 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr><td colSpan={5} className="p-6 text-center">Loading...</td></tr>
              ) : enquiries.length === 0 ? (
                <tr><td colSpan={5} className="p-6 text-center text-gray-500">No enquiries yet.</td></tr>
              ) : (
                enquiries.map(e => (
                  <tr key={e.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-semibold">{e.name}</div>
                      <div className="text-xs text-gray-500">{e.email}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm">{e.phone || e.number || '—'}</div>
                      <div className="text-xs text-gray-500 mt-1">{e.department || e.service || '—'}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium">{e.subject || '—'}</div>
                      <div className="mt-2 text-sm text-gray-700">{(e.message || '').slice(0, 200)}</div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">{e.createdAt ? new Date(e.createdAt).toLocaleString() : ''}</td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end space-x-2">
                        <button onClick={() => setSelected(e)} className="px-3 py-1 rounded-lg text-sm bg-blue-100 text-blue-700 hover:bg-blue-200 transition-colors">
                          <Eye className="inline w-4 h-4 mr-1" /> View
                        </button>
                        <button onClick={() => handleDelete(e.id)} className="px-3 py-1 rounded-lg text-sm bg-red-50 text-red-600 hover:bg-red-100 transition-colors">
                          <Trash2 className="inline w-4 h-4 mr-1" /> Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* View Modal */}
      {selected && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-gradient-to-r from-slate-900 to-slate-800 text-white p-6 flex items-center justify-between border-b">
              <h2 className="text-xl font-bold">Enquiry Details</h2>
              <button onClick={() => setSelected(null)} className="p-1 hover:bg-white/20 rounded-lg transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Name</label>
                  <p className="text-base font-medium text-slate-900 mt-1">{selected.name}</p>
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Email</label>
                  <p className="text-base text-slate-900 mt-1 truncate">{selected.email}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Phone</label>
                  <p className="text-base text-slate-900 mt-1">{selected.phone || selected.number || '—'}</p>
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Department</label>
                  <p className="text-base font-medium text-slate-900 mt-1">{selected.department || selected.service || '—'}</p>
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Subject</label>
                <p className="text-base text-slate-900 mt-1">{selected.subject || '—'}</p>
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Message</label>
                <div className="mt-2 p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <p className="text-sm leading-relaxed text-slate-900 whitespace-pre-wrap">{selected.message || '—'}</p>
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Submitted</label>
                <p className="text-sm text-slate-900 mt-1">{selected.createdAt ? new Date(selected.createdAt).toLocaleString() : '—'}</p>
              </div>
            </div>

            <div className="sticky bottom-0 bg-gray-50 border-t p-4 flex items-center justify-between">
              <button onClick={() => setSelected(null)} className="px-4 py-2 rounded-lg bg-gray-200 text-gray-800 hover:bg-gray-300 transition-colors font-medium">Close</button>
              <div className="flex gap-2">
                <button onClick={() => { handleDelete(selected.id); setSelected(null); }} className="px-4 py-2 rounded-lg bg-red-100 text-red-700 hover:bg-red-200 transition-colors font-medium">Delete</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
