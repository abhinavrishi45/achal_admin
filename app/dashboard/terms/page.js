"use client";

import { useState, useEffect } from "react";
import { Plus, Edit2, Trash2, X, Check, Search, FileText, Calendar, ShieldCheck } from "lucide-react";

export default function TermsPage() {
  const [termsList, setTermsList] = useState([]);
  const [services, setServices] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");

  const defaultForm = {
    serviceId: "",
    title: "",
    termsText: "",
    effectiveDate: "",
  };

  const [formData, setFormData] = useState(defaultForm);

  useEffect(() => {
    // Load services from backend; fall back to empty list on error
    const fetchServices = async () => {
      try {
        const res = await fetch("https://achal-backend-trial.tannis.in/api/services");
        if (res.ok) {
          const data = await res.json();
          setServices(Array.isArray(data) ? data : data.services || data.data || []);
        } else {
          setServices([]);
        }
      } catch (err) {
        console.error("Failed to load services:", err);
        setServices([]);
      }
    };
    fetchServices();
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const response = await fetch("https://achal-backend-trial.tannis.in/api/terms");
      if (response.ok) {
        const data = await response.json();
        setTermsList(Array.isArray(data) ? data : data.terms || data.data || []);
      }
    } catch (error) {
      console.error("Failed to load terms:", error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const openCreateModal = () => {
    setEditingId(null);
    setFormData({ ...defaultForm, effectiveDate: new Date().toISOString().substring(0, 10) });
    setIsModalOpen(true);
  };

  const openEditModal = (term) => {
    setEditingId(term.id || term._id);
    let formattedDate = term.effectiveDate;
    if (formattedDate && formattedDate.includes("T")) {
      formattedDate = formattedDate.split("T")[0];
    }
    setFormData({
      ...term,
      serviceId: term.serviceId || "",
      title: term.title || "",
      effectiveDate: formattedDate || ""
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (confirm("Are you sure you want to delete this Terms and Conditions policy?")) {
      try {
        await fetch(`https://achal-backend-trial.tannis.in/api/terms/${id}`, { method: "DELETE" });
        loadData();
      } catch (error) {
        console.error("Failed to delete term:", error);
        alert("An error occurred while deleting.");
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.termsText) {
      alert("Terms Text is required.");
      return;
    }

    const payload = { ...formData };

    // Convert empty string serviceId back to null so the DB understands it correctly
    if (!payload.serviceId) {
      payload.serviceId = null;
    }

    try {
      const url = editingId
        ? `https://achal-backend-trial.tannis.in/api/terms/${editingId}`
        : "https://achal-backend-trial.tannis.in/api/terms";
      const method = editingId ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        const errorData = await res.json();
        alert(errorData.message || "Failed to save terms config.");
        return;
      }

      loadData();
      setIsModalOpen(false);
    } catch (error) {
      console.error("Error saving:", error);
      alert("An error occurred while saving.");
    }
  };

  const getServiceName = (id) => {
    if (!id) return "Global (All Services)";
    const sv = Array.isArray(services) ? services.find((s) => String(s.id) === String(id)) : undefined;
    return sv ? sv.name : `Service Config #${id}`;
  };

  const filteredTerms = termsList.filter((t) =>
    (t.title && t.title.toLowerCase().includes(searchQuery.toLowerCase())) ||
    getServiceName(t.serviceId).toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto pb-10">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Terms and Conditions</h1>
          <p className="text-sm text-gray-500 mt-1">Manage legal disclaimers and policies across services.</p>
        </div>
        <button
          onClick={openCreateModal}
          className="flex items-center space-x-2 bg-orange-600 hover:bg-orange-700 text-white px-4 py-2.5 rounded-lg transition-colors shadow-sm font-medium"
        >
          <Plus className="w-5 h-5" />
          <span>Add New Policy</span>
        </button>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden min-h-[500px]">
        {/* Toolbar */}
        <div className="p-4 border-b border-gray-200 flex items-center justify-between bg-gray-50/50">
          <div className="relative w-72">
            <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search policies by title or service..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none text-sm transition-all"
            />
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 text-gray-500 text-sm border-b border-gray-200">
                <th className="px-6 py-4 font-medium">Policy Title</th>
                <th className="px-6 py-4 font-medium">Applied To</th>
                <th className="px-6 py-4 font-medium">Date Effective</th>
                <th className="px-6 py-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {(!Array.isArray(filteredTerms) || filteredTerms.length === 0) ? (
                <tr>
                  <td colSpan="4" className="px-6 py-12 text-center text-gray-500">
                    <div className="flex flex-col items-center">
                      <div className="w-12 h-12 rounded-full bg-orange-50 flex items-center justify-center mb-3">
                        <ShieldCheck className="w-6 h-6 text-orange-400" />
                      </div>
                      <p>No legal policies configured yet. Lets create your first terms list.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                (Array.isArray(filteredTerms) ? filteredTerms : []).map((term) => (
                  <tr key={term.id || term._id} className="hover:bg-gray-50/50 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <p className="font-semibold text-gray-900">{term.title || "Untitled Terms"}</p>
                        <p className="text-xs text-gray-500 truncate max-w-xs mt-1" title={term.termsText}>
                          {term.termsText.substring(0, 60)}...
                        </p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded text-xs font-semibold ${!term.serviceId ? 'bg-purple-100 text-purple-700 border border-purple-200' : 'bg-blue-100 text-blue-700 border border-blue-200'}`}>
                        {getServiceName(term.serviceId)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      <div className="flex items-center space-x-1">
                        <Calendar className="w-3.5 h-3.5" />
                        <span>{term.effectiveDate ? new Date(term.effectiveDate).toLocaleDateString() : 'Immediate'}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => openEditModal(term)}
                          className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Edit Policy"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(term.id || term._id)}
                          className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Delete Policy"
                        >
                          <Trash2 className="w-4 h-4" />
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

      {/* Modal Editor */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
              <h2 className="text-xl font-semibold text-gray-800 flex items-center space-x-2">
                <ShieldCheck className="w-5 h-5 text-orange-500" />
                <span>{editingId ? "Edit Policy Document" : "Draft New Policy"}</span>
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-2 text-gray-400 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto flex-1 custom-scrollbar">
              <form id="terms-form" onSubmit={handleSubmit} className="space-y-6">

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Policy Title</label>
                    <input
                      type="text"
                      name="title"
                      value={formData.title}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none transition-all font-semibold text-gray-800 text-lg"
                      placeholder="e.g. Service Agreement v2.1"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Effective Date</label>
                    <input
                      type="date"
                      name="effectiveDate"
                      value={formData.effectiveDate}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Applies To (Service Level)</label>
                  <select
                    name="serviceId"
                    value={formData.serviceId}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none transition-all bg-white"
                  >
                    <option value="">Global / Website Default Rules (Null Service)</option>
                    {(Array.isArray(services) ? services : []).map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name}
                      </option>
                    ))}
                  </select>
                  <p className="text-xs text-gray-500 mt-1 italic">Selecting a service binds these terms to that specific offering module only.</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1 flex justify-between">
                    <span>Full Legal Text / Terms Agreement *</span>
                    <span className="text-xs text-gray-400">Supports HTML formatting if needed</span>
                  </label>
                  <textarea
                    name="termsText"
                    required
                    rows="14"
                    value={formData.termsText}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none transition-all font-mono text-sm shadow-inner bg-gray-50/50"
                    placeholder="Provide the complete legal agreement..."
                  />
                </div>

              </form>
            </div>

            <div className="px-6 py-4 border-t border-gray-100 flex justify-end space-x-3 bg-gray-50/50">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="px-5 py-2.5 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-100 font-medium transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                form="terms-form"
                className="px-6 py-2.5 rounded-lg bg-orange-600 text-white hover:bg-orange-700 font-medium transition-colors flex items-center space-x-2 shadow-sm"
              >
                <Check className="w-4 h-4" />
                <span>{editingId ? "Update Policy" : "Save Policy"}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
