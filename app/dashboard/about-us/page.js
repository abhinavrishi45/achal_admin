"use client";

import { useState, useEffect } from "react";
import { Plus, Edit2, Trash2, X, Check, Search, Info, Settings, LayoutTemplate, Users, Briefcase, BarChart, Handshake, Database } from "lucide-react";

export default function AboutUsPage() {
  const [abouts, setAbouts] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("content"); // 'content', 'team', 'work', 'other'

  const defaultForm = {
    title: "",
    intro: "",
    mission: "",
    vision: "",
    team: [],
    work: [],
    partners: [],
    stats: [],
    data: [],
    isPublished: false,
  };

  const [formData, setFormData] = useState(defaultForm);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const response = await fetch("https://achal-backend-trial.tannis.in/api/about");
      if (response.ok) {
        const data = await response.json();
        setAbouts(Array.isArray(data) ? data : data.abouts || data.data || []);
      }
    } catch (error) {
      console.error("Failed to load about us data:", error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  // Helper for dynamic arrays
  const handleArrayChange = (arrayName, index, field, value) => {
    setFormData((prev) => {
      const base = Array.isArray(prev[arrayName]) ? prev[arrayName] : [];
      const newArray = [...base];
      newArray[index] = { ...newArray[index], [field]: value };
      return { ...prev, [arrayName]: newArray };
    });
  };

  const addArrayItem = (arrayName, defaultObj) => {
    setFormData((prev) => ({
      ...prev,
      [arrayName]: [...(Array.isArray(prev[arrayName]) ? prev[arrayName] : []), defaultObj]
    }));
  };

  const removeArrayItem = (arrayName, index) => {
    setFormData((prev) => {
      const base = Array.isArray(prev[arrayName]) ? prev[arrayName] : [];
      const newArray = [...base];
      newArray.splice(index, 1);
      return { ...prev, [arrayName]: newArray };
    });
  };

  const openCreateModal = () => {
    setEditingId(null);
    setFormData(defaultForm);
    setIsModalOpen(true);
    setActiveTab("content");
  };

  const openEditModal = (about) => {
    setEditingId(about.id || about._id);
    const formCopy = { ...about };

    // Parse strings into arrays for the UI and ensure arrays for UI-controlled fields.
    ["team", "work", "partners", "stats", "data"].forEach((field) => {
      if (typeof formCopy[field] === "string") {
        try {
          formCopy[field] = JSON.parse(formCopy[field]);
        } catch {
          formCopy[field] = [];
        }
      }
      if (!formCopy[field]) {
        formCopy[field] = [];
      } else if (typeof formCopy[field] === "object" && !Array.isArray(formCopy[field])) {
        if (field === "data") {
          // convert a plain object into key/value array for 'data'
          formCopy[field] = Object.entries(formCopy[field]).map(([k, v]) => ({ key: k, value: String(v) }));
        } else {
          // unexpected object shape for array fields: coerce to empty array
          formCopy[field] = [];
        }
      }
    });

    setFormData({ ...defaultForm, ...formCopy });
    setIsModalOpen(true);
    setActiveTab("content");
  };

  const handleDelete = async (id) => {
    if (confirm("Are you sure you want to delete this About Us version?")) {
      try {
        await fetch(`https://achal-backend-trial.tannis.in/api/about/${id}`, { method: "DELETE" });
        loadData();
      } catch (error) {
        console.error("Failed to delete:", error);
      }
    }
  };

  const togglePublishStatus = async (about) => {
    try {
      const id = about.id || about._id;
      const res = await fetch(`https://achal-backend-trial.tannis.in/api/about/${id}/publish`, {
        method: "POST",
      });
      if (res.ok) {
        loadData();
      } else {
        alert("Failed to toggle publish status.");
      }
    } catch (error) {
      console.error("Failed to toggle status:", error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title) {
      alert("Title is required.");
      return;
    }

    const payload = { ...formData };

    // Convert arrays back to JSON strings for backend
    ["team", "work", "partners", "stats"].forEach((field) => {
      payload[field] = JSON.stringify(payload[field] || []);
    });

    // For 'data', convert key-value array into an object string, or just a JSON array depending on preference.
    // Given the previous raw generic blocks, an object `{}` is usually preferred
    if (Array.isArray(payload.data)) {
      const dataObj = {};
      payload.data.forEach(item => { if (item.key) dataObj[item.key] = item.value });
      payload.data = JSON.stringify(dataObj);
    } else {
      payload.data = "{}";
    }

    try {
      const url = editingId
        ? `https://achal-backend-trial.tannis.in/api/about/${editingId}`
        : "https://achal-backend-trial.tannis.in/api/about";
      const method = editingId ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        const errorData = await res.json();
        alert(errorData.message || "Failed to save.");
        return;
      }

      loadData();
      setIsModalOpen(false);
    } catch (error) {
      console.error("Error saving:", error);
      alert("An error occurred while saving.");
    }
  };

  const filteredAbouts = abouts.filter((a) =>
    a.title?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto pb-10">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">About Us Manager</h1>
          <p className="text-sm text-gray-500 mt-1">Manage multiple versions of your highly dynamic About Us page.</p>
        </div>
        <button
          onClick={openCreateModal}
          className="flex items-center space-x-2 bg-orange-600 hover:bg-orange-700 text-white px-4 py-2.5 rounded-lg transition-colors shadow-sm font-medium"
        >
          <Plus className="w-5 h-5" />
          <span>Create Version</span>
        </button>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden min-h-[500px]">
        {/* Toolbar */}
        <div className="p-4 border-b border-gray-200 flex items-center justify-between bg-gray-50/50">
          <div className="relative w-72">
            <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search by title..."
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
                <th className="px-6 py-4 font-medium">Page Title / Intro</th>
                <th className="px-6 py-4 font-medium">Publish Status</th>
                <th className="px-6 py-4 font-medium">Last Updated</th>
                <th className="px-6 py-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredAbouts.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-6 py-12 text-center text-gray-500">
                    <div className="flex flex-col items-center">
                      <div className="w-12 h-12 rounded-full bg-orange-50 flex items-center justify-center mb-3">
                        <Info className="w-6 h-6 text-orange-400" />
                      </div>
                      <p>No About Us pages found. Create your first version!</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredAbouts.map((about) => {
                  return (
                    <tr key={about.id || about._id} className="hover:bg-gray-50/50 transition-colors group">
                      <td className="px-6 py-4">
                        <div className="flex flex-col max-w-[300px]">
                          <p className="font-semibold text-gray-900 truncate">{about.title || "Untitled"}</p>
                          <p className="text-xs text-gray-500 truncate mt-1">{about.intro || "No intro provided."}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <button
                          onClick={() => togglePublishStatus(about)}
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold transition-colors hover:opacity-80 ${about.isPublished ? "bg-green-100 text-green-700 border border-green-200" : "bg-gray-100 text-gray-600 border border-gray-200"}`}
                          title="Click to toggle publish status"
                        >
                          {about.isPublished ? "PUBLISHED" : "DRAFT"}
                        </button>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {about.updatedAt ? new Date(about.updatedAt).toLocaleDateString() : (about.creationDate ? new Date(about.creationDate).toLocaleDateString() : "Unknown")}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => openEditModal(about)}
                            className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="Edit Page configuration"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(about.id || about._id)}
                            className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal / Editor */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl w-full max-w-5xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
              <h2 className="text-xl font-semibold text-gray-800 flex items-center space-x-2">
                <Info className="w-5 h-5 text-orange-500" />
                <span>{editingId ? "Edit About Us Page" : "Configure About Us Page"}</span>
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-2 text-gray-400 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex border-b border-gray-200 bg-gray-50 overflow-x-auto">
              <button
                type="button"
                className={`px-6 py-3 text-sm font-medium transition-colors flex items-center space-x-2 whitespace-nowrap ${activeTab === 'content' ? 'border-b-2 border-orange-500 text-orange-600 bg-orange-50/50' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'}`}
                onClick={() => setActiveTab('content')}
              >
                <LayoutTemplate className="w-4 h-4" />
                <span>Core Content</span>
              </button>
              <button
                type="button"
                className={`px-6 py-3 text-sm font-medium transition-colors flex items-center space-x-2 whitespace-nowrap ${activeTab === 'team' ? 'border-b-2 border-orange-500 text-orange-600 bg-orange-50/50' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'}`}
                onClick={() => setActiveTab('team')}
              >
                <Users className="w-4 h-4" />
                <span>Team Directory</span>
              </button>
              <button
                type="button"
                className={`px-6 py-3 text-sm font-medium transition-colors flex items-center space-x-2 whitespace-nowrap ${activeTab === 'work' ? 'border-b-2 border-orange-500 text-orange-600 bg-orange-50/50' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'}`}
                onClick={() => setActiveTab('work')}
              >
                <Briefcase className="w-4 h-4" />
                <span>Work / Projects</span>
              </button>
              <button
                type="button"
                className={`px-6 py-3 text-sm font-medium transition-colors flex items-center space-x-2 whitespace-nowrap ${activeTab === 'other' ? 'border-b-2 border-orange-500 text-orange-600 bg-orange-50/50' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'}`}
                onClick={() => setActiveTab('other')}
              >
                <Settings className="w-4 h-4" />
                <span>Partners & Stats</span>
              </button>
            </div>

            <div className="p-6 overflow-y-auto flex-1 custom-scrollbar bg-gray-50/30">
              <form id="about-form" onSubmit={handleSubmit} className="mx-auto max-w-4xl space-y-6">

                {/* 1. CONTENT TAB */}
                <div className={activeTab === 'content' ? 'block space-y-6' : 'hidden'}>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Page Title *</label>
                    <input
                      type="text"
                      name="title"
                      required
                      value={formData.title}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none transition-all font-semibold text-lg"
                      placeholder="e.g. About Our Amazing Company"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Introduction (Hero text)</label>
                    <textarea
                      name="intro"
                      rows="3"
                      value={formData.intro}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none transition-all resize-none text-gray-700"
                      placeholder="Welcome to our company..."
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Our Mission</label>
                      <textarea
                        name="mission"
                        rows="6"
                        value={formData.mission}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none transition-all"
                        placeholder="Mission statement..."
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Our Vision</label>
                      <textarea
                        name="vision"
                        rows="6"
                        value={formData.vision}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none transition-all"
                        placeholder="Vision statement..."
                      />
                    </div>
                  </div>
                </div>

                {/* 2. TEAM TAB */}
                <div className={activeTab === 'team' ? 'block' : 'hidden'}>
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold text-gray-800">Team Members</h3>
                    <button type="button" onClick={() => addArrayItem('team', { name: '', role: '', bio: '', photo: '' })} className="text-sm bg-orange-100 hover:bg-orange-200 text-orange-700 px-3 py-1.5 rounded-md font-medium flex items-center transition-colors">
                      <Plus className="w-4 h-4 mr-1" /> Add Member
                    </button>
                  </div>

                  {(!Array.isArray(formData.team) || formData.team.length === 0) && <p className="text-gray-500 text-center py-8 bg-white rounded-xl border border-dashed border-gray-300">No team members added yet.</p>}

                  <div className="space-y-4">
                    {(Array.isArray(formData.team) ? formData.team : []).map((member, index) => (
                      <div key={index} className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm relative group">
                        <button type="button" onClick={() => removeArrayItem('team', index)} className="absolute top-3 right-3 text-red-400 hover:text-red-600 p-1 bg-red-50 rounded-md transition-colors">
                          <Trash2 className="w-4 h-4" />
                        </button>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mr-8">
                          <div>
                            <label className="block text-xs font-medium text-gray-500 mb-1">Name</label>
                            <input type="text" value={member.name} onChange={(e) => handleArrayChange('team', index, 'name', e.target.value)} className="w-full px-3 py-1.5 rounded-md border border-gray-300 text-sm focus:border-orange-500 outline-none" />
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-gray-500 mb-1">Role / Position</label>
                            <input type="text" value={member.role} onChange={(e) => handleArrayChange('team', index, 'role', e.target.value)} className="w-full px-3 py-1.5 rounded-md border border-gray-300 text-sm focus:border-orange-500 outline-none" />
                          </div>
                          <div className="md:col-span-2">
                            <label className="block text-xs font-medium text-gray-500 mb-1">Photo URL</label>
                            <input type="text" value={member.photo} onChange={(e) => handleArrayChange('team', index, 'photo', e.target.value)} className="w-full px-3 py-1.5 rounded-md border border-gray-300 text-sm focus:border-orange-500 outline-none" placeholder="https://" />
                          </div>
                          <div className="md:col-span-2">
                            <label className="block text-xs font-medium text-gray-500 mb-1">Bio</label>
                            <textarea rows="2" value={member.bio} onChange={(e) => handleArrayChange('team', index, 'bio', e.target.value)} className="w-full px-3 py-2 rounded-md border border-gray-300 text-sm focus:border-orange-500 outline-none resize-none" />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 3. WORK / PROJECTS TAB */}
                <div className={activeTab === 'work' ? 'block' : 'hidden'}>
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold text-gray-800">Featured Work & Projects</h3>
                    <button type="button" onClick={() => addArrayItem('work', { title: '', description: '', image: '', link: '' })} className="text-sm bg-orange-100 hover:bg-orange-200 text-orange-700 px-3 py-1.5 rounded-md font-medium flex items-center transition-colors">
                      <Plus className="w-4 h-4 mr-1" /> Add Project
                    </button>
                  </div>

                  {(!Array.isArray(formData.work) || formData.work.length === 0) && <p className="text-gray-500 text-center py-8 bg-white rounded-xl border border-dashed border-gray-300">No projects added yet.</p>}

                  <div className="space-y-4">
                    {(Array.isArray(formData.work) ? formData.work : []).map((project, index) => (
                      <div key={index} className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm relative group">
                        <button type="button" onClick={() => removeArrayItem('work', index)} className="absolute top-3 right-3 text-red-400 hover:text-red-600 p-1 bg-red-50 rounded-md transition-colors">
                          <Trash2 className="w-4 h-4" />
                        </button>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mr-8">
                          <div className="md:col-span-2">
                            <label className="block text-xs font-medium text-gray-500 mb-1">Project Title</label>
                            <input type="text" value={project.title} onChange={(e) => handleArrayChange('work', index, 'title', e.target.value)} className="w-full px-3 py-1.5 rounded-md border border-gray-300 text-sm focus:border-orange-500 outline-none" />
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-gray-500 mb-1">Image URL</label>
                            <input type="text" value={project.image} onChange={(e) => handleArrayChange('work', index, 'image', e.target.value)} className="w-full px-3 py-1.5 rounded-md border border-gray-300 text-sm focus:border-orange-500 outline-none" placeholder="https://" />
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-gray-500 mb-1">External Link</label>
                            <input type="text" value={project.link} onChange={(e) => handleArrayChange('work', index, 'link', e.target.value)} className="w-full px-3 py-1.5 rounded-md border border-gray-300 text-sm focus:border-orange-500 outline-none" placeholder="https://" />
                          </div>
                          <div className="md:col-span-2">
                            <label className="block text-xs font-medium text-gray-500 mb-1">Description</label>
                            <textarea rows="2" value={project.description} onChange={(e) => handleArrayChange('work', index, 'description', e.target.value)} className="w-full px-3 py-2 rounded-md border border-gray-300 text-sm focus:border-orange-500 outline-none resize-none" />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 4. OTHER LISTS TAB */}
                <div className={activeTab === 'other' ? 'block' : 'hidden'}>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

                    {/* Partners */}
                    <div>
                      <div className="flex justify-between items-center mb-3">
                        <h3 className="font-semibold text-gray-800 flex items-center"><Handshake className="w-4 h-4 mr-2 text-gray-500" /> Partners</h3>
                        <button type="button" onClick={() => addArrayItem('partners', { name: '', logo: '' })} className="text-xs bg-gray-200 hover:bg-gray-300 text-gray-700 px-2 py-1 rounded transition-colors">+ Add</button>
                      </div>
                      <div className="space-y-3">
                        {(Array.isArray(formData.partners) ? formData.partners : []).map((partner, index) => (
                          <div key={index} className="bg-white p-3 rounded-lg border border-gray-200 flex space-x-2">
                            <div className="flex-1 space-y-2">
                              <input type="text" placeholder="Partner Name" value={partner.name || ''} onChange={(e) => handleArrayChange('partners', index, 'name', e.target.value)} className="w-full px-2 py-1 text-sm border-b border-dashed border-gray-300 outline-none focus:border-orange-500" />
                              <input type="text" placeholder="Logo Image URL" value={partner.logo || ''} onChange={(e) => handleArrayChange('partners', index, 'logo', e.target.value)} className="w-full px-2 py-1 text-xs border-b border-dashed border-gray-300 outline-none focus:border-orange-500" />
                            </div>
                            <button type="button" onClick={() => removeArrayItem('partners', index)} className="text-red-400 hover:text-red-600 px-2"><X className="w-4 h-4" /></button>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Stats */}
                    <div>
                      <div className="flex justify-between items-center mb-3">
                        <h3 className="font-semibold text-gray-800 flex items-center"><BarChart className="w-4 h-4 mr-2 text-gray-500" /> Statistics</h3>
                        <button type="button" onClick={() => addArrayItem('stats', { label: '', value: '' })} className="text-xs bg-gray-200 hover:bg-gray-300 text-gray-700 px-2 py-1 rounded transition-colors">+ Add</button>
                      </div>
                      <div className="space-y-3">
                        {(Array.isArray(formData.stats) ? formData.stats : []).map((stat, index) => (
                          <div key={index} className="bg-white p-3 rounded-lg border border-gray-200 flex space-x-2">
                            <div className="flex-1 flex space-x-2">
                              <input type="text" placeholder="100+" value={stat.value || ''} onChange={(e) => handleArrayChange('stats', index, 'value', e.target.value)} className="w-1/3 px-2 py-1 text-sm font-bold border-b border-dashed border-gray-300 outline-none focus:border-orange-500" />
                              <input type="text" placeholder="Happy Clients" value={stat.label || ''} onChange={(e) => handleArrayChange('stats', index, 'label', e.target.value)} className="w-2/3 px-2 py-1 text-sm border-b border-dashed border-gray-300 outline-none focus:border-orange-500" />
                            </div>
                            <button type="button" onClick={() => removeArrayItem('stats', index)} className="text-red-400 hover:text-red-600 px-1"><X className="w-4 h-4" /></button>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Generic Data Table */}
                    <div className="lg:col-span-2 mt-4 pt-6 border-t border-gray-200">
                      <div className="flex justify-between items-center mb-3">
                        <h3 className="font-semibold text-gray-800 flex items-center"><Database className="w-4 h-4 mr-2 text-gray-500" /> Additional Key-Value Data</h3>
                        <button type="button" onClick={() => addArrayItem('data', { key: '', value: '' })} className="text-xs bg-gray-200 hover:bg-gray-300 text-gray-700 px-2 py-1 rounded transition-colors">+ Add Custom Field</button>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {(Array.isArray(formData.data) ? formData.data : []).map((item, index) => (
                          <div key={index} className="bg-white p-2 rounded-lg border border-gray-200 flex items-center space-x-2">
                            <input type="text" placeholder="e.g. establishedYear" value={item.key || ''} onChange={(e) => handleArrayChange('data', index, 'key', e.target.value)} className="w-1/3 px-2 py-1 text-xs font-mono bg-gray-50 border border-gray-200 rounded outline-none focus:border-orange-500" />
                            <input type="text" placeholder="Value" value={item.value || ''} onChange={(e) => handleArrayChange('data', index, 'value', e.target.value)} className="flex-1 px-2 py-1 text-sm border-b border-dashed border-gray-300 outline-none focus:border-orange-500" />
                            <button type="button" onClick={() => removeArrayItem('data', index)} className="text-red-400 hover:text-red-600 px-1"><X className="w-4 h-4" /></button>
                          </div>
                        ))}
                      </div>
                    </div>

                  </div>
                </div>

              </form>
            </div>

            <div className="px-6 py-4 border-t border-gray-100 flex justify-between items-center bg-gray-50/50">
              <div className="flex items-center space-x-3 text-sm text-gray-500">
                <span className={`w-3 h-3 rounded-full ${formData.isPublished ? 'bg-green-500' : 'bg-gray-300'}`}></span>
                <span>{formData.isPublished ? "Currently Published" : "Currently Draft"}</span>
              </div>
              <div className="flex space-x-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-5 py-2.5 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-100 font-medium transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  form="about-form"
                  className="px-6 py-2.5 rounded-lg bg-orange-600 text-white hover:bg-orange-700 font-medium transition-colors flex items-center space-x-2 shadow-sm"
                >
                  <Check className="w-4 h-4" />
                  <span>{editingId ? "Save Version" : "Create Version"}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
