"use client";

import { useState, useEffect } from "react";
import { Plus, Edit2, Trash2, X, Check, Search, Briefcase, MapPin, Calendar } from "lucide-react";

export default function CareersPage() {
  const [jobs, setJobs] = useState([]);
  const [services, setServices] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");

  const defaultForm = {
    serviceId: "",
    role: "",
    location: "",
    employmentType: "full-time",
    shortDescription: "",
    details: "",
    jobRef: "", // unique
    postedAt: "",
    isOpen: true,
  };

  const [formData, setFormData] = useState(defaultForm);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const response = await fetch("https://achal-backend-trial.tannis.in/api/jobs");
      if (response.ok) {
        const data = await response.json();
        setJobs(Array.isArray(data) ? data : data.jobs || data.data || []);
      }
    } catch (error) {
      console.error("Failed to load jobs:", error);
    }
    // Load services from backend; fall back to empty list on error
    try {
      const res = await fetch("https://achal-backend-trial.tannis.in/api/services");
      if (res.ok) {
        const sdata = await res.json();
        setServices(Array.isArray(sdata) ? sdata : sdata.services || sdata.data || []);
      } else {
        setServices([]);
      }
    } catch (err) {
      console.error("Failed to load services:", err);
      setServices([]);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const generateJobRef = () => {
    // Generate a quick unique reference if they haven't provided one
    const randomHex = Math.floor(Math.random() * 16777215).toString(16).toUpperCase();
    return `JOB-${randomHex}`;
  };

  const openCreateModal = () => {
    setEditingId(null);
    setFormData({ ...defaultForm, jobRef: generateJobRef(), postedAt: new Date().toISOString().substring(0, 10) });
    setIsModalOpen(true);
  };

  const openEditModal = (job) => {
    setEditingId(job.id || job._id);
    let formattedDate = job.postedAt;
    if (formattedDate && formattedDate.includes("T")) {
      formattedDate = formattedDate.split("T")[0];
    }
    setFormData({ ...job, postedAt: formattedDate });
    setIsModalOpen(true);
  };

  const toggleStatus = async (job) => {
    try {
      const id = job.id || job._id;
      const res = await fetch(`https://achal-backend-trial.tannis.in/api/jobs/${id}/open`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isOpen: !job.isOpen }) // send boolean state if required by ctrl
      });
      if (res.ok) {
        loadData();
      } else {
        alert("Failed to change status.");
      }
    } catch (error) {
      console.error("Failed to toggle status:", error);
    }
  };

  const handleDelete = async (id) => {
    if (confirm("Are you sure you want to delete this job posting?")) {
      try {
        await fetch(`https://achal-backend-trial.tannis.in/api/jobs/${id}`, { method: "DELETE" });
        loadData();
      } catch (error) {
        console.error("Failed to delete job:", error);
        alert("An error occurred while deleting the job.");
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.role || !formData.jobRef) {
      alert("Role and Job Reference are required.");
      return;
    }

    // Check if jobRef is unique (unless editing self)
    const existingJobWithRef = jobs.find(j => j.jobRef === formData.jobRef && j.id !== editingId);
    if (existingJobWithRef) {
      alert(`Job Reference ${formData.jobRef} is already in use by another posting.`);
      return;
    }

    const jobToSave = { ...formData };
    if (editingId) jobToSave.id = editingId;

    // Ensure date is valid back to ISO or keeps its format
    if (!jobToSave.postedAt) jobToSave.postedAt = new Date().toISOString();

    try {
      const url = editingId
        ? `https://achal-backend-trial.tannis.in/api/jobs/${editingId}`
        : "https://achal-backend-trial.tannis.in/api/jobs";
      const method = editingId ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(jobToSave)
      });

      if (!res.ok) {
        const errorData = await res.json();
        alert(errorData.message || "Failed to save job posting.");
        return;
      }

      loadData();
      setIsModalOpen(false);
    } catch (error) {
      console.error("Error saving job:", error);
      alert("An error occurred while saving the job.");
    }
  };

  const filteredJobs = (Array.isArray(jobs) ? jobs : []).filter((j) =>
    (j.role || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
    (j.jobRef || "").toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto pb-10">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Careers & Jobs</h1>
          <p className="text-sm text-gray-500 mt-1">Manage open positions across your services.</p>
        </div>
        <button
          onClick={openCreateModal}
          className="flex items-center space-x-2 bg-orange-600 hover:bg-orange-700 text-white px-4 py-2.5 rounded-lg transition-colors shadow-sm font-medium"
        >
          <Plus className="w-5 h-5" />
          <span>Post New Job</span>
        </button>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden min-h-[500px]">
        {/* Toolbar */}
        <div className="p-4 border-b border-gray-200 flex items-center justify-between bg-gray-50/50">
          <div className="relative w-72">
            <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search roles or REF..."
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
                <th className="px-6 py-4 font-medium">Role Details</th>
                <th className="px-6 py-4 font-medium">Linked Service</th>
                <th className="px-6 py-4 font-medium">Job Type / Location</th>
                <th className="px-6 py-4 font-medium">Status / REF</th>
                <th className="px-6 py-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredJobs.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-6 py-12 text-center text-gray-500">
                    <div className="flex flex-col items-center">
                      <div className="w-12 h-12 rounded-full bg-orange-50 flex items-center justify-center mb-3">
                        <Briefcase className="w-6 h-6 text-orange-400" />
                      </div>
                      <p>No jobs found. Create your first job posting to get started.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                (Array.isArray(filteredJobs) ? filteredJobs : []).map((job) => {
                  const linkedService = Array.isArray(services) ? services.find(s => String(s.id) === String(job.serviceId)) : undefined;
                  return (
                    <tr key={job.id} className="hover:bg-gray-50/50 transition-colors group">
                      <td className="px-6 py-4">
                        <div className="flex flex-col">
                          <p className="font-semibold text-gray-900">{job.role}</p>
                          <p className="text-xs text-gray-500 truncate max-w-[200px] mt-1">{job.shortDescription || "No description provided."}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {linkedService ? (
                          <span className="inline-flex items-center px-2 py-1 bg-blue-50 text-blue-700 rounded-md text-xs font-medium">
                            {linkedService.name}
                          </span>
                        ) : (
                          <span className="text-gray-400 italic text-xs">Unlinked (General)</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        <div className="flex flex-col space-y-1">
                          <div className="flex items-center space-x-1">
                            <Briefcase className="w-3.5 h-3.5 text-gray-400" />
                            <span className="capitalize">{job.employmentType.replace('-', ' ')}</span>
                          </div>
                          <div className="flex items-center space-x-1 text-gray-500">
                            <MapPin className="w-3.5 h-3.5" />
                            <span>{job.location || "Remote"}</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col space-y-1.5 items-start">
                          <button
                            onClick={() => toggleStatus(job)}
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold transition-colors hover:opacity-80 ${job.isOpen ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}
                            title="Click to toggle status"
                          >
                            {job.isOpen ? "Open" : "Closed"}
                          </button>
                          <span className="text-xs font-mono bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded border border-gray-200">
                            {job.jobRef}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => openEditModal(job)}
                            className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="Edit Job"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(job.id)}
                            className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Delete Job"
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

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
              <h2 className="text-xl font-semibold text-gray-800">
                {editingId ? "Edit Job Posting" : "Create New Job Posting"}
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-2 text-gray-400 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto flex-1 custom-scrollbar">
              <form id="job-form" onSubmit={handleSubmit} className="space-y-6">

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Role Title *</label>
                    <input
                      type="text"
                      name="role"
                      required
                      value={formData.role}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none transition-all font-semibold"
                      placeholder="e.g. Senior Civil Engineer"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Job Reference ID *</label>
                    <input
                      type="text"
                      name="jobRef"
                      required
                      value={formData.jobRef}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none transition-all font-mono text-sm bg-gray-50"
                      placeholder="Unique REF"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Linked Service (Optional)</label>
                    <select
                      name="serviceId"
                      value={formData.serviceId}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none transition-all bg-white"
                    >
                      <option value="">-- General Posting --</option>
                      {(Array.isArray(services) ? services : []).map(s => (
                        <option key={s.id} value={s.id}>{s.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Employment Type *</label>
                    <select
                      name="employmentType"
                      required
                      value={formData.employmentType}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none transition-all bg-white"
                    >
                      <option value="full-time">Full-Time</option>
                      <option value="part-time">Part-Time</option>
                      <option value="internship">Internship</option>
                      <option value="contract">Contract</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                    <input
                      type="text"
                      name="location"
                      value={formData.location}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none transition-all"
                      placeholder="Patna, NY or Remote"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Short Description</label>
                  <textarea
                    name="shortDescription"
                    rows="2"
                    value={formData.shortDescription}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none transition-all resize-none"
                    placeholder="Brief overview of the role..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Full Detailed Specifications</label>
                  <textarea
                    name="details"
                    rows="6"
                    value={formData.details}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none transition-all font-mono text-sm"
                    placeholder="Responsibilities, requirements, HTML content..."
                  />
                </div>

                <div className="grid grid-cols-2 gap-6 bg-gray-50 p-4 rounded-xl border border-gray-100">
                  <div className="flex items-center space-x-3">
                    <label className="relative flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        name="isOpen"
                        checked={formData.isOpen}
                        onChange={handleInputChange}
                        className="peer sr-only"
                      />
                      <div className="w-11 h-6 bg-red-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-500"></div>
                      <span className="ml-3 text-sm font-bold text-gray-700">
                        {formData.isOpen ? "Status: OPEN" : "Status: CLOSED"}
                      </span>
                    </label>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Posted Date</label>
                    <input
                      type="date"
                      name="postedAt"
                      value={formData.postedAt}
                      onChange={handleInputChange}
                      className="w-full px-4 py-1.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none transition-all text-sm"
                    />
                  </div>
                </div>

              </form>
            </div>

            <div className="px-6 py-4 border-t border-gray-100 flex justify-end space-x-3 bg-gray-50/50">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="px-5 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-100 font-medium transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                form="job-form"
                className="px-5 py-2 rounded-lg bg-orange-600 text-white hover:bg-orange-700 font-medium transition-colors flex items-center space-x-2 shadow-sm"
              >
                <Check className="w-4 h-4" />
                <span>{editingId ? "Update Job" : "Publish Job"}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
