"use client";

import { useState, useEffect } from "react";
import { Trash2, Edit2, Plus, ChevronUp, ChevronDown, X } from "lucide-react";
const API_BASE = process.env.NEXT_PUBLIC_BACKEND_URL || 'https://achal-backend-trial.tannis.in';

export default function FAQAdmin() {
  const [faqs, setFaqs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    category: 'General',
    question: '',
    answer: '',
    isActive: true,
  });

  // Load FAQs
  useEffect(() => {
    loadFAQs();
  }, []);

  const loadFAQs = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/faqs`, { method: 'GET', mode: 'cors', credentials: 'include' });
      if (res.ok) {
        const data = await res.json();
        setFaqs(Array.isArray(data) ? data : []);
      }
    } catch (err) {
      console.error('Failed to load FAQs', err);
    }
    setLoading(false);
  };

  // Handle form input
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  // Add or update FAQ
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.question.trim() || !formData.answer.trim()) {
      alert('Question and answer are required');
      return;
    }

    try {
      const method = editingId ? 'PUT' : 'POST';
      const url = editingId ? `${API_BASE}/api/faqs/${editingId}` : `${API_BASE}/api/faqs`;

      const res = await fetch(url, { 
        method, 
        mode: 'cors', 
        credentials: 'include', 
        headers: { 'Content-Type': 'application/json' }, 
        body: JSON.stringify(formData), 
      });

      if (res.ok) {
        loadFAQs();
        setShowForm(false);
        setEditingId(null);
        setFormData({
          category: 'General',
          question: '',
          answer: '',
          isActive: true,
        });
      }
    } catch (err) {
      console.error('Error saving FAQ', err);
      alert('Failed to save FAQ');
    }
  };

  // Edit FAQ
  const handleEdit = (faq) => {
    setFormData({
      category: faq.category || 'General',
      question: faq.question,
      answer: faq.answer,
      isActive: faq.isActive,
    });
    setEditingId(faq.id);
    setShowForm(true);
  };

  // Delete FAQ
  const handleDelete = async (id) => {
    if (!confirm('Delete this FAQ?')) return;

    try {
      const res = await fetch(`${API_BASE}/api/faqs/${id}`, { method: 'DELETE', mode: 'cors', credentials: 'include' });
      if (res.ok) {
        loadFAQs();
      }
    } catch (err) {
      console.error('Error deleting FAQ', err);
      alert('Failed to delete FAQ');
    }
  };

  // Move FAQ up
  const moveUp = async (index) => {
    if (index === 0) return;
    const newFaqs = [...faqs];
    [newFaqs[index], newFaqs[index - 1]] = [newFaqs[index - 1], newFaqs[index]];

    try {
      await fetch(`${API_BASE}/api/faqs/reorder`, { 
        method: 'POST', 
        mode: 'cors', 
        credentials: 'include', 
        headers: { 'Content-Type': 'application/json' }, 
        body: JSON.stringify({ faqs: newFaqs.map(f => f.id) }), 
      });
      setFaqs(newFaqs);
    } catch (err) {
      console.error('Error reordering FAQs', err);
    }
  };

  // Move FAQ down
  const moveDown = async (index) => {
    if (index === faqs.length - 1) return;
    const newFaqs = [...faqs];
    [newFaqs[index], newFaqs[index + 1]] = [newFaqs[index + 1], newFaqs[index]];

    try {
      await fetch(`${API_BASE}/api/faqs/reorder`, { 
        method: 'POST', 
        mode: 'cors', 
        credentials: 'include', 
        headers: { 'Content-Type': 'application/json' }, 
        body: JSON.stringify({ faqs: newFaqs.map(f => f.id) }), 
      });
      setFaqs(newFaqs);
    } catch (err) {
      console.error('Error reordering FAQs', err);
    }
  };

  // Close form
  const closeForm = () => {
    setShowForm(false);
    setEditingId(null);
    setFormData({
      category: 'General',
      question: '',
      answer: '',
      isActive: true,
    });
  };

  const categories = [...new Set(faqs.map(f => f.category).filter(Boolean))];

  return (
    <div className="max-w-6xl mx-auto pb-10">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Frequently Asked Questions</h1>
          <p className="text-sm text-gray-500">Manage FAQ entries displayed on the website.</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center gap-2"
        >
          <Plus className="w-4 h-4" /> Add FAQ
        </button>
      </div>

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-gradient-to-r from-slate-900 to-slate-800 text-white p-6 flex items-center justify-between border-b">
              <h2 className="text-xl font-bold">{editingId ? 'Edit FAQ' : 'Add FAQ'}</h2>
              <button onClick={closeForm} className="p-1 hover:bg-white/20 rounded-lg transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {/* Category */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Category</label>
                <input
                  type="text"
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  placeholder="e.g., Services, Billing, General"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Question */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Question *</label>
                <input
                  type="text"
                  name="question"
                  value={formData.question}
                  onChange={handleChange}
                  placeholder="Enter the question"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              {/* Answer */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Answer *</label>
                <textarea
                  name="answer"
                  value={formData.answer}
                  onChange={handleChange}
                  placeholder="Enter the answer"
                  rows="6"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                  required
                />
              </div>

              {/* Active Status */}
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  name="isActive"
                  checked={formData.isActive}
                  onChange={handleChange}
                  id="isActive"
                  className="w-4 h-4 rounded border-gray-300"
                />
                <label htmlFor="isActive" className="text-sm font-medium text-gray-700">
                  Active (visible on website)
                </label>
              </div>

              {/* Actions */}
              <div className="flex gap-3 justify-end pt-4 border-t">
                <button
                  type="button"
                  onClick={closeForm}
                  className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                >
                  {editingId ? 'Update' : 'Add'} FAQ
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* FAQ List */}
      <div className="space-y-3">
        {loading ? (
          <div className="p-6 text-center text-gray-500">Loading FAQs...</div>
        ) : faqs.length === 0 ? (
          <div className="p-6 text-center text-gray-500">
            No FAQs yet. Click "Add FAQ" to create one.
          </div>
        ) : (
          faqs.map((faq, index) => (
            <div key={faq.id} className="bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
              <div className="p-5">
                {/* Header */}
                <div className="flex items-start justify-between gap-4 mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-semibold text-blue-600 bg-blue-50 px-2 py-1 rounded">
                        {faq.category}
                      </span>
                      {!faq.isActive && (
                        <span className="text-xs font-semibold text-red-600 bg-red-50 px-2 py-1 rounded">
                          INACTIVE
                        </span>
                      )}
                    </div>
                    <h3 className="text-base font-semibold text-slate-900">{faq.question}</h3>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => moveUp(index)}
                      disabled={index === 0}
                      className="p-1 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      title="Move up"
                    >
                      <ChevronUp className="w-4 h-4 text-gray-600" />
                    </button>
                    <button
                      onClick={() => moveDown(index)}
                      disabled={index === faqs.length - 1}
                      className="p-1 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      title="Move down"
                    >
                      <ChevronDown className="w-4 h-4 text-gray-600" />
                    </button>
                  </div>
                </div>

                {/* Answer Preview */}
                <p className="text-sm text-gray-600 line-clamp-2 mb-3">{faq.answer}</p>

                {/* Actions */}
                <div className="flex items-center gap-2 pt-3 border-t">
                  <button
                    onClick={() => handleEdit(faq)}
                    className="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors font-medium flex items-center gap-1"
                  >
                    <Edit2 className="w-3 h-3" /> Edit
                  </button>
                  <button
                    onClick={() => handleDelete(faq.id)}
                    className="px-3 py-1 text-sm bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors font-medium flex items-center gap-1"
                  >
                    <Trash2 className="w-3 h-3" /> Delete
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Stats */}
      {faqs.length > 0 && (
        <div className="mt-8 p-4 bg-gray-50 rounded-lg border border-gray-200">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <div className="text-2xl font-bold text-slate-900">{faqs.length}</div>
              <div className="text-sm text-gray-600">Total FAQs</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-green-600">{faqs.filter(f => f.isActive).length}</div>
              <div className="text-sm text-gray-600">Active</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-red-600">{faqs.filter(f => !f.isActive).length}</div>
              <div className="text-sm text-gray-600">Inactive</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-blue-600">{categories.length}</div>
              <div className="text-sm text-gray-600">Categories</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
