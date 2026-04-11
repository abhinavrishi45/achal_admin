"use client";

import { useState, useEffect } from "react";
import { Plus, Edit2, Trash2, X, Check, Search, Upload, Image as ImageIcon } from "lucide-react";

const API_BASE = "https://achal-backend-trial.tannis.in";

export default function AboutUsAdmin() {
  const [abouts, setAbouts] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState(null); // 'success', 'error', null
  const [saveMessage, setSaveMessage] = useState("");

  const defaultForm = {
    title: "",
    intro: "",
    mission: "",
    vision: "",
    team: [],
    work: [],
    partners: [],
    stats: [],
  };

  const [formData, setFormData] = useState(defaultForm);

  useEffect(() => {
    loadAbouts();
  }, []);

  const loadAbouts = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/about`);
      if (res.ok) {
        const data = await res.json();
        setAbouts(Array.isArray(data) ? data : []);
      }
    } catch (error) {
      console.error("Failed to load:", error);
    }
  };

  // Simple image to base64 conversion
  const convertToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = (error) => reject(error);
    });
  };

  const handleImageUpload = async (e, arrayName, index, field) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file');
      return;
    }

    // Validate file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      alert('Image size should be less than 2MB');
      return;
    }

    try {
      const base64 = await convertToBase64(file);
      handleArrayChange(arrayName, index, field, base64);
    } catch (error) {
      console.error('Error converting image:', error);
      alert('Failed to upload image');
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleArrayChange = (arrayName, index, field, value) => {
    setFormData((prev) => {
      const newArray = [...(prev[arrayName] || [])];
      newArray[index] = { ...newArray[index], [field]: value };
      return { ...prev, [arrayName]: newArray };
    });
  };

  const addArrayItem = (arrayName, defaultObj) => {
    setFormData((prev) => ({
      ...prev,
      [arrayName]: [...(prev[arrayName] || []), defaultObj]
    }));
  };

  const removeArrayItem = (arrayName, index) => {
    setFormData((prev) => ({
      ...prev,
      [arrayName]: prev[arrayName].filter((_, i) => i !== index)
    }));
  };

  const openCreateModal = () => {
    setEditingId(null);
    setFormData(defaultForm);
    setIsModalOpen(true);
  };

  const openEditModal = (about) => {
    setEditingId(about.id);
    const formCopy = { ...about };

    // Parse JSON strings
    ["team", "work", "partners", "stats"].forEach((field) => {
      if (typeof formCopy[field] === "string") {
        try {
          const parsed = JSON.parse(formCopy[field]);
          formCopy[field] = Array.isArray(parsed) ? parsed : [];
        } catch (e) {
          console.warn(`Failed to parse ${field}:`, formCopy[field], e);
          formCopy[field] = [];
        }
      }
      formCopy[field] = Array.isArray(formCopy[field]) ? formCopy[field] : [];
    });

    console.log("Loaded form data:", formCopy);
    setFormData(formCopy);
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete this version?")) return;

    try {
      await fetch(`${API_BASE}/api/about/${id}`, { method: "DELETE" });
      loadAbouts();
    } catch (error) {
      console.error("Delete failed:", error);
    }
  };

  const togglePublish = async (about) => {
    try {
      await fetch(`${API_BASE}/api/about/${about.id}/publish`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ publish: !about.isPublished })
      });
      loadAbouts();
    } catch (error) {
      console.error("Toggle failed:", error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.title.trim()) {
      setSaveStatus('error');
      setSaveMessage("Title is required");
      setTimeout(() => setSaveStatus(null), 3000);
      return;
    }

    setIsSaving(true);
    setSaveStatus(null);

    const payload = { ...formData };

    // Convert arrays to JSON strings and filter out empty items
    ["team", "work", "partners", "stats"].forEach((field) => {
      let arrayData = payload[field] || [];
      
      // For partners and stats, filter out empty items
      if (field === "partners") {
        arrayData = arrayData.filter(item => item.name && item.name.trim());
        console.log("Filtered partners:", arrayData);
      }
      if (field === "stats") {
        arrayData = arrayData.filter(item => item.value && item.value.trim());
      }
      if (field === "team") {
        arrayData = arrayData.filter(item => item.name && item.name.trim());
      }
      if (field === "work") {
        arrayData = arrayData.filter(item => item.title && item.title.trim());
      }
      
      payload[field] = JSON.stringify(arrayData);
    });

    console.log("Final payload:", payload);

    try {
      const url = editingId
        ? `${API_BASE}/api/about/${editingId}`
        : `${API_BASE}/api/about`;
      const method = editingId ? "PUT" : "POST";

      console.log("Saving to:", url, "Method:", method);

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(`Save failed: ${res.status} - ${errorText}`);
      }

      setSaveStatus('success');
      setSaveMessage(editingId ? "Updated successfully!" : "Created successfully!");

      await loadAbouts();

      setTimeout(() => {
        setIsModalOpen(false);
        setSaveStatus(null);
      }, 1500);

    } catch (error) {
      console.error("Save error:", error);
      setSaveStatus('error');
      setSaveMessage(error.message || "Failed to save. Please try again.");
      setTimeout(() => setSaveStatus(null), 4000);
    } finally {
      setIsSaving(false);
    }
  };

  const filteredAbouts = abouts.filter((a) =>
    a.title?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">About Us Manager</h1>
          <p className="text-sm text-gray-500 mt-1">Manage your About Us page content</p>
        </div>
        <button
          onClick={openCreateModal}
          className="flex items-center gap-2 bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-lg transition-colors"
        >
          <Plus className="w-5 h-5" />
          <span>Create New</span>
        </button>
      </div>

      {/* Search */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-gray-200 bg-gray-50">
          <div className="relative max-w-md">
            <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search by title..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none"
            />
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">Title</th>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">Status</th>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">Updated</th>
                <th className="px-6 py-3 text-right text-sm font-medium text-gray-500">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredAbouts.length === 0 ? (
                <tr>
                  <td colSpan="4" className="px-6 py-12 text-center text-gray-500">
                    No content found. Create your first version!
                  </td>
                </tr>
              ) : (
                filteredAbouts.map((about) => (
                  <tr key={about.id} className="hover:bg-gray-50 group">
                    <td className="px-6 py-4">
                      <div className="max-w-xs">
                        <p className="font-semibold text-gray-900 truncate">{about.title || "Untitled"}</p>
                        <p className="text-xs text-gray-500 truncate mt-1">{about.intro || "No intro"}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => togglePublish(about)}
                        className={`px-3 py-1 rounded-full text-xs font-bold transition-colors ${about.isPublished
                            ? "bg-green-100 text-green-700"
                            : "bg-gray-100 text-gray-600"
                          }`}
                      >
                        {about.isPublished ? "PUBLISHED" : "DRAFT"}
                      </button>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {about.updatedAt
                        ? new Date(about.updatedAt).toLocaleDateString()
                        : new Date(about.creationDate).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => openEditModal(about)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(about.id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
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

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-800">
                {editingId ? "Edit About Us" : "Create About Us"}
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-2 text-gray-400 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Status Message */}
            {saveStatus && (
              <div className={`px-6 py-3 border-b text-sm font-medium transition-all ${saveStatus === 'success'
                  ? 'bg-green-50 border-green-200 text-green-700'
                  : 'bg-red-50 border-red-200 text-red-700'
                }`}>
                {saveMessage}
              </div>
            )}

            {/* Modal Content */}
            <div className="p-6 overflow-y-auto flex-1">
              <form id="about-form" onSubmit={handleSubmit} className="space-y-6">

                {/* Basic Info */}
                <div className="space-y-4">
                  <h3 className="font-semibold text-gray-800 border-b pb-2">Basic Information</h3>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Title *
                    </label>
                    <input
                      type="text"
                      name="title"
                      required
                      value={formData.title}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none"
                      placeholder="About Our Company"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Introduction
                    </label>
                    <textarea
                      name="intro"
                      rows="2"
                      value={formData.intro}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none resize-none"
                      placeholder="Welcome message..."
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Mission
                      </label>
                      <textarea
                        name="mission"
                        rows="4"
                        value={formData.mission}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none resize-none"
                        placeholder="Our mission..."
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Vision
                      </label>
                      <textarea
                        name="vision"
                        rows="4"
                        value={formData.vision}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none resize-none"
                        placeholder="Our vision..."
                      />
                    </div>
                  </div>
                </div>

                {/* Team Section */}
                <div className="space-y-4">
                  <div className="flex justify-between items-center border-b pb-2">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-gray-800">Team Members</h3>
                      {formData.team?.length > 0 && (
                        <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full font-medium">
                          {formData.team.length}
                        </span>
                      )}
                    </div>
                    <div className="flex gap-2 items-center">
                      <button
                        type="button"
                        onClick={() => addArrayItem('team', { name: '', role: '', bio: '', photo: '' })}
                        className="text-sm bg-orange-100 hover:bg-orange-200 text-orange-700 px-3 py-1 rounded-lg flex items-center gap-1"
                      >
                        <Plus className="w-4 h-4" /> Add Member
                      </button>
                      <button
                        type="submit"
                        form="about-form"
                        disabled={isSaving}
                        title="Save current progress"
                        className="text-xs bg-green-100 hover:bg-green-200 text-green-700 px-2 py-1 rounded flex items-center gap-1 disabled:opacity-50"
                      >
                        <Check className="w-3 h-3" /> Save
                      </button>
                    </div>
                  </div>

                  {formData.team?.map((member, index) => (
                    <div key={index} className="bg-gray-50 p-4 rounded-lg border border-gray-200 relative">
                      <button
                        type="button"
                        onClick={() => removeArrayItem('team', index)}
                        className="absolute top-2 right-2 text-red-500 hover:bg-red-50 p-1 rounded"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                        <input
                          type="text"
                          placeholder="Name"
                          value={member.name}
                          onChange={(e) => handleArrayChange('team', index, 'name', e.target.value)}
                          className="px-3 py-2 rounded border border-gray-300 focus:border-orange-500 outline-none"
                        />
                        <input
                          type="text"
                          placeholder="Role"
                          value={member.role}
                          onChange={(e) => handleArrayChange('team', index, 'role', e.target.value)}
                          className="px-3 py-2 rounded border border-gray-300 focus:border-orange-500 outline-none"
                        />
                      </div>

                      <textarea
                        placeholder="Bio"
                        rows="2"
                        value={member.bio}
                        onChange={(e) => handleArrayChange('team', index, 'bio', e.target.value)}
                        className="w-full px-3 py-2 rounded border border-gray-300 focus:border-orange-500 outline-none resize-none mb-3"
                      />

                      {/* Image Upload */}
                      <div className="flex items-center gap-3">
                        <label className="flex-1 cursor-pointer">
                          <div className="flex items-center gap-2 px-3 py-2 bg-white border border-gray-300 rounded hover:bg-gray-50 transition-colors">
                            <Upload className="w-4 h-4 text-gray-500" />
                            <span className="text-sm text-gray-600">Upload Photo</span>
                          </div>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => handleImageUpload(e, 'team', index, 'photo')}
                            className="hidden"
                          />
                        </label>
                        {member.photo && (
                          <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-orange-500">
                            <img src={member.photo} alt="Preview" className="w-full h-full object-cover" />
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Work/Projects Section */}
                <div className="space-y-4">
                  <div className="flex justify-between items-center border-b pb-2">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-gray-800">Projects</h3>
                      {formData.work?.length > 0 && (
                        <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full font-medium">
                          {formData.work.length}
                        </span>
                      )}
                    </div>
                    <div className="flex gap-2 items-center">
                      <button
                        type="button"
                        onClick={() => addArrayItem('work', { title: '', description: '', image: '', link: '' })}
                        className="text-sm bg-orange-100 hover:bg-orange-200 text-orange-700 px-3 py-1 rounded-lg flex items-center gap-1"
                      >
                        <Plus className="w-4 h-4" /> Add Project
                      </button>
                      <button
                        type="submit"
                        form="about-form"
                        disabled={isSaving}
                        title="Save current progress"
                        className="text-xs bg-green-100 hover:bg-green-200 text-green-700 px-2 py-1 rounded flex items-center gap-1 disabled:opacity-50"
                      >
                        <Check className="w-3 h-3" /> Save
                      </button>
                    </div>
                  </div>

                  {formData.work?.map((project, index) => (
                    <div key={index} className="bg-gray-50 p-4 rounded-lg border border-gray-200 relative">
                      <button
                        type="button"
                        onClick={() => removeArrayItem('work', index)}
                        className="absolute top-2 right-2 text-red-500 hover:bg-red-50 p-1 rounded"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>

                      <input
                        type="text"
                        placeholder="Project Title"
                        value={project.title}
                        onChange={(e) => handleArrayChange('work', index, 'title', e.target.value)}
                        className="w-full px-3 py-2 rounded border border-gray-300 focus:border-orange-500 outline-none mb-3"
                      />

                      <textarea
                        placeholder="Description"
                        rows="2"
                        value={project.description}
                        onChange={(e) => handleArrayChange('work', index, 'description', e.target.value)}
                        className="w-full px-3 py-2 rounded border border-gray-300 focus:border-orange-500 outline-none resize-none mb-3"
                      />

                      <input
                        type="url"
                        placeholder="Project Link (https://...)"
                        value={project.link}
                        onChange={(e) => handleArrayChange('work', index, 'link', e.target.value)}
                        className="w-full px-3 py-2 rounded border border-gray-300 focus:border-orange-500 outline-none mb-3"
                      />

                      {/* Image Upload */}
                      <div className="flex items-center gap-3">
                        <label className="flex-1 cursor-pointer">
                          <div className="flex items-center gap-2 px-3 py-2 bg-white border border-gray-300 rounded hover:bg-gray-50 transition-colors">
                            <Upload className="w-4 h-4 text-gray-500" />
                            <span className="text-sm text-gray-600">Upload Image</span>
                          </div>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => handleImageUpload(e, 'work', index, 'image')}
                            className="hidden"
                          />
                        </label>
                        {project.image && (
                          <div className="w-16 h-16 rounded overflow-hidden border-2 border-orange-500">
                            <img src={project.image} alt="Preview" className="w-full h-full object-cover" />
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Stats & Partners */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                  {/* Stats */}
                  <div className="space-y-3">
                    <div className="flex justify-between items-center border-b pb-2">
                      <h3 className="font-semibold text-gray-800">Statistics</h3>
                      <div className="flex gap-1 items-center">
                        <button
                          type="button"
                          onClick={() => addArrayItem('stats', { label: '', value: '' })}
                          className="text-xs bg-gray-200 hover:bg-gray-300 text-gray-700 px-2 py-1 rounded"
                        >
                          + Add
                        </button>
                        <button
                          type="submit"
                          form="about-form"
                          disabled={isSaving}
                          title="Save current progress"
                          className="text-xs bg-green-100 hover:bg-green-200 text-green-700 px-2 py-0.5 rounded flex items-center gap-1 disabled:opacity-50"
                        >
                          <Check className="w-3 h-3" /> Save
                        </button>
                      </div>
                    </div>
                    {formData.stats?.map((stat, index) => (
                      <div key={index} className="flex gap-2">
                        <input
                          type="text"
                          placeholder="100+"
                          value={stat.value}
                          onChange={(e) => handleArrayChange('stats', index, 'value', e.target.value)}
                          className="w-24 px-2 py-1 rounded border border-gray-300 focus:border-orange-500 outline-none text-sm font-bold"
                        />
                        <input
                          type="text"
                          placeholder="Label"
                          value={stat.label}
                          onChange={(e) => handleArrayChange('stats', index, 'label', e.target.value)}
                          className="flex-1 px-2 py-1 rounded border border-gray-300 focus:border-orange-500 outline-none text-sm"
                        />
                        <button
                          type="button"
                          onClick={() => removeArrayItem('stats', index)}
                          className="text-red-500 hover:bg-red-50 p-1 rounded"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>

                  {/* Partners */}
                  <div className="space-y-3">
                    <div className="flex justify-between items-center border-b pb-2">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-gray-800">Partners</h3>
                        {formData.partners?.length > 0 && (
                          <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full font-medium">
                            {formData.partners.length}
                          </span>
                        )}
                      </div>
                      <div className="flex gap-1 items-center">
                        <button
                          type="button"
                          onClick={() => addArrayItem('partners', { name: '', logo: '' })}
                          className="text-xs bg-gray-200 hover:bg-gray-300 text-gray-700 px-2 py-1 rounded"
                        >
                          + Add
                        </button>
                        <button
                          type="submit"
                          form="about-form"
                          disabled={isSaving}
                          title="Save current progress"
                          className="text-xs bg-green-100 hover:bg-green-200 text-green-700 px-2 py-0.5 rounded flex items-center gap-1 disabled:opacity-50"
                        >
                          <Check className="w-3 h-3" /> Save
                        </button>
                      </div>
                    </div>
                    
                    {formData.partners && formData.partners.length === 0 && (
                      <div className="text-xs text-gray-500 italic py-2">No partners added yet.</div>
                    )}
                    
                    {formData.partners?.map((partner, index) => (
                      <div key={index} className="space-y-2 p-2 bg-white rounded border border-gray-200">
                        <div className="flex gap-2">
                          <input
                            type="text"
                            placeholder="Partner Name *"
                            value={partner.name || ''}
                            onChange={(e) => handleArrayChange('partners', index, 'name', e.target.value)}
                            className={`flex-1 px-2 py-1 rounded border ${!partner.name ? 'border-red-300 bg-red-50' : 'border-gray-300'} focus:border-orange-500 outline-none text-sm`}
                          />
                          <button
                            type="button"
                            onClick={() => removeArrayItem('partners', index)}
                            className="text-red-500 hover:bg-red-50 p-1 rounded"
                            title="Delete this partner"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                        <div className="flex items-center gap-2">
                          <label className="flex-1 cursor-pointer">
                            <div className="flex items-center gap-2 px-2 py-1 bg-gray-50 border border-gray-300 rounded hover:bg-gray-100 transition-colors">
                              <ImageIcon className="w-3 h-3 text-gray-500" />
                              <span className="text-xs text-gray-600">Logo</span>
                            </div>
                            <input
                              type="file"
                              accept="image/*"
                              onChange={(e) => handleImageUpload(e, 'partners', index, 'logo')}
                              className="hidden"
                            />
                          </label>
                          {partner.logo && (
                            <div className="w-8 h-8 rounded overflow-hidden border border-gray-300">
                              <img src={partner.logo} alt="Logo" className="w-full h-full object-contain" />
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

              </form>
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 border-t border-gray-200 flex justify-between items-center bg-gray-50">
              <div className="text-sm text-gray-500">
                {formData.isPublished ? "Published" : "Draft"}
              </div>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  disabled={isSaving}
                  className="px-5 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  form="about-form"
                  disabled={isSaving}
                  className="px-6 py-2 rounded-lg bg-orange-600 text-white hover:bg-orange-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {isSaving ? (
                    <>
                      <span className="inline-block animate-spin">⟳</span>
                      <span>Saving...</span>
                    </>
                  ) : (
                    <>
                      <Check className="w-4 h-4" />
                      <span>{editingId ? "Update" : "Create"}</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}