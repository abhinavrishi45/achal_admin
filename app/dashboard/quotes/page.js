"use client";

import { useState, useEffect } from "react";
import { Trash2, Eye, EyeOff, X } from "lucide-react";
const API_BASE = process.env.NEXT_PUBLIC_BACKEND_URL || 'https://achal-backend-trial.tannis.in';

export default function QuotesAdmin() {
  const [quotes, setQuotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedQuote, setSelectedQuote] = useState(null);

  useEffect(() => { load(); }, []);

  const load = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/quotes`, { method: 'GET', mode: 'cors', credentials: 'include' });
      if (res.ok) {
        const data = await res.json();
        setQuotes(Array.isArray(data) ? data : []);
      }
    } catch (err) { console.error('Failed to load quotes', err); }
    setLoading(false);
  };

  const toggleViewed = async (q) => {
    try {
      const res = await fetch(`${API_BASE}/api/quotes/${q.id}/view`, {
        method: 'POST',
        mode: 'cors',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ viewed: !q.viewed }),
      });
      if (res.ok) load();
    } catch (err) { console.error('toggleViewed error', err); }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete quote?')) return;
    try {
      const res = await fetch(`${API_BASE}/api/quotes/${id}`, { method: 'DELETE', mode: 'cors', credentials: 'include' });
      if (res.ok) load();
    } catch (err) { console.error('delete error', err); }
  };

  return (
    <div className="max-w-7xl mx-auto pb-10">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Quote Requests</h1>
          <p className="text-sm text-gray-500">Requests submitted by users via the Get a Quote form.</p>
        </div>
      </div>

      <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-50 text-gray-500 text-sm border-b">
                <th className="px-6 py-3 font-medium">Name / Email</th>
                <th className="px-6 py-3 font-medium">Service / Subject</th>
                <th className="px-6 py-3 font-medium">Submitted</th>
                <th className="px-6 py-3 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr><td colSpan={4} className="p-6 text-center">Loading...</td></tr>
              ) : quotes.length === 0 ? (
                <tr><td colSpan={4} className="p-6 text-center text-gray-500">No quotes yet.</td></tr>
              ) : (
                quotes.map(q => (
                  <tr key={q.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-semibold">{q.name}</div>
                      <div className="text-xs text-gray-500">{q.email} {q.contactNumber ? `· ${q.contactNumber}` : ''}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium">{q.service || '—'}</div>
                      <div className="text-xs text-gray-500 mt-1">{q.subject || '—'}</div>
                      <div className="mt-2 text-sm text-gray-700">{q.description ? q.description.slice(0, 200) : ''}</div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">{q.createdAt ? new Date(q.createdAt).toLocaleString() : ''}</td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end space-x-2">
                        <button onClick={() => setSelectedQuote(q)} className="px-3 py-1 rounded-lg text-sm bg-blue-100 text-blue-700 hover:bg-blue-200 transition-colors">
                          <Eye className="inline w-4 h-4 mr-1" /> View
                        </button>
                        <button onClick={() => toggleViewed(q)} className={`px-3 py-1 rounded-lg text-sm ${q.viewed ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>
                          {q.viewed ? <><Eye className="inline w-4 h-4 mr-1" /> Viewed</> : <><EyeOff className="inline w-4 h-4 mr-1" /> Mark viewed</>}
                        </button>
                        <button onClick={() => handleDelete(q.id)} className="px-3 py-1 rounded-lg text-sm bg-red-50 text-red-600 hover:bg-red-100 transition-colors">
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
      {selectedQuote && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-gradient-to-r from-slate-900 to-slate-800 text-white p-6 flex items-center justify-between border-b">
              <h2 className="text-xl font-bold">Quote Details</h2>
              <button onClick={() => setSelectedQuote(null)} className="p-1 hover:bg-white/20 rounded-lg transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-5">
              {/* Name & Email */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Name</label>
                  <p className="text-base font-medium text-slate-900 mt-1">{selectedQuote.name}</p>
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Email</label>
                  <p className="text-base text-slate-900 mt-1 truncate">{selectedQuote.email}</p>
                </div>
              </div>

              {/* Contact & Service */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Contact Number</label>
                  <p className="text-base text-slate-900 mt-1">{selectedQuote.contactNumber || '—'}</p>
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Service</label>
                  <p className="text-base font-medium text-slate-900 mt-1">{selectedQuote.service || '—'}</p>
                </div>
              </div>

              {/* Subject */}
              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Subject</label>
                <p className="text-base text-slate-900 mt-1">{selectedQuote.subject || '—'}</p>
              </div>

              {/* Full Message */}
              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Message</label>
                <div className="mt-2 p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <p className="text-sm leading-relaxed text-slate-900 whitespace-pre-wrap">{selectedQuote.description || '—'}</p>
                </div>
              </div>

              {/* Submission Date */}
              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Submitted</label>
                <p className="text-sm text-slate-900 mt-1">{selectedQuote.createdAt ? new Date(selectedQuote.createdAt).toLocaleString() : '—'}</p>
              </div>

              {/* Status */}
              <div className="pt-3 border-t">
                <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${selectedQuote.viewed ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                  {selectedQuote.viewed ? '✓ Viewed' : '○ Unviewed'}
                </span>
              </div>
            </div>

            {/* Footer Actions */}
            <div className="sticky bottom-0 bg-gray-50 border-t p-4 flex items-center justify-between">
              <button onClick={() => setSelectedQuote(null)} className="px-4 py-2 rounded-lg bg-gray-200 text-gray-800 hover:bg-gray-300 transition-colors font-medium">
                Close
              </button>
              <div className="flex gap-2">
                <button onClick={() => { toggleViewed(selectedQuote); setSelectedQuote(null); }} className={`px-4 py-2 rounded-lg text-sm font-medium ${selectedQuote.viewed ? 'bg-gray-100 text-gray-700 hover:bg-gray-200' : 'bg-blue-100 text-blue-700 hover:bg-blue-200'} transition-colors`}>
                  {selectedQuote.viewed ? 'Mark Unviewed' : 'Mark Viewed'}
                </button>
                <button onClick={() => { handleDelete(selectedQuote.id); setSelectedQuote(null); }} className="px-4 py-2 rounded-lg bg-red-100 text-red-700 hover:bg-red-200 transition-colors font-medium">
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
