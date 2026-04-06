"use client";

import { useState, useEffect } from "react";
import { Trash2, Eye, EyeOff } from "lucide-react";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || 'https://achal-backend-trial.tannis.in';

export default function QuotesAdmin() {
  const [quotes, setQuotes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { load(); }, []);

  const load = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/quotes`);
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
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ viewed: !q.viewed }),
      });
      if (res.ok) load();
    } catch (err) { console.error('toggleViewed error', err); }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete quote?')) return;
    try {
      const res = await fetch(`${API_BASE}/api/quotes/${id}`, { method: 'DELETE' });
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
                        <button onClick={() => toggleViewed(q)} className={`px-3 py-1 rounded-lg text-sm ${q.viewed ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>
                          {q.viewed ? <><Eye className="inline w-4 h-4 mr-1" /> Viewed</> : <><EyeOff className="inline w-4 h-4 mr-1" /> Mark viewed</>}
                        </button>
                        <button onClick={() => handleDelete(q.id)} className="px-3 py-1 rounded-lg text-sm bg-red-50 text-red-600">
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
    </div>
  );
}
