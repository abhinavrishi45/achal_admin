"use client";

import { useState, useEffect } from "react";
import { Download, Trash2, Eye, X, Badge, Calendar, Mail, Phone, Briefcase, Users, TrendingUp } from "lucide-react";
const API_BASE = process.env.NEXT_PUBLIC_BACKEND_URL || 'https://achal-backend-trial.tannis.in';

export default function ApplicantsPage() {
  const [applicants, setApplicants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedApplicant, setSelectedApplicant] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterJob, setFilterJob] = useState("all");
  const [jobs, setJobs] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");

  const statusColors = {
    pending: "bg-yellow-100 text-yellow-800 border border-yellow-300",
    reviewed: "bg-blue-100 text-blue-800 border border-blue-300",
    shortlisted: "bg-green-100 text-green-800 border border-green-300",
    rejected: "bg-red-100 text-red-800 border border-red-300",
  };

  useEffect(() => {
    loadApplicants();
    loadJobs();
  }, []);

  const loadJobs = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/jobs`, { method: 'GET', mode: 'cors', credentials: 'include' });
      if (res.ok) {
        const data = await res.json();
        setJobs(Array.isArray(data) ? data : data.jobs || data.data || []);
      }
    } catch (error) {
      console.error("Failed to load jobs:", error);
    }
  };

  const loadApplicants = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE}/api/jobs/applications`, { method: 'GET', mode: 'cors', credentials: 'include' });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || `Server error: ${res.status}`);
      }

      const data = await res.json();
      console.log("Applicants response:", data);

      // Handle both array and object responses
      let applicantsArray = [];
      if (Array.isArray(data)) {
        applicantsArray = data;
      } else if (data.rows && Array.isArray(data.rows)) {
        applicantsArray = data.rows;
      } else if (data.data && Array.isArray(data.data)) {
        applicantsArray = data.data;
      }

      console.log("Applicants loaded:", applicantsArray.length);
      setApplicants(applicantsArray);
    } catch (err) {
      console.error("Failed to load applicants:", err);
      setError(err.message || "Failed to load applicants. Please check backend connection.");
    } finally {
      setLoading(false);
    }
  };

  const getJobName = (jobId) => {
    const job = jobs.find(j => j.id === jobId);
    return job ? job.role : `Job #${jobId}`;
  };

  const handleStatusChange = async (applicantId, newStatus) => {
    try {
      const res = await fetch(`${API_BASE}/api/jobs/applications/${applicantId}/status`, {
        method: "PUT",
        mode: 'cors',
        credentials: 'include',
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        loadApplicants();
        setSelectedApplicant(null);
      } else {
        alert("Failed to update status");
      }
    } catch (error) {
      console.error("Failed to update status:", error);
      alert("Error updating status");
    }
  };

  const handleDownloadResume = async (applicantId, fileName) => {
    try {
      const res = await fetch(`${API_BASE}/api/jobs/applications/${applicantId}/resume/download`, { method: 'GET', mode: 'cors', credentials: 'include' });
      if (!res.ok) throw new Error("Failed to download resume");

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = fileName || "resume.pdf";
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error("Failed to download resume:", error);
      alert("Error downloading resume");
    }
  };

  const handleDelete = async (applicantId) => {
    if (!window.confirm("Are you sure you want to delete this application?")) return;
    try {
      const res = await fetch(`${API_BASE}/api/jobs/applications/${applicantId}`, {
        method: "DELETE",
        mode: 'cors',
        credentials: 'include',
      });
      if (res.ok) {
        loadApplicants();
        setShowDetailModal(false);
      } else {
        alert("Failed to delete application");
      }
    } catch (error) {
      console.error("Failed to delete:", error);
      alert("Error deleting application");
    }
  };

  const filtered = applicants
    .filter(app => filterStatus === "all" || app.status === filterStatus)
    .filter(app => filterJob === "all" || app.jobId === parseInt(filterJob))
    .filter(app =>
      app.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.email.toLowerCase().includes(searchQuery.toLowerCase())
    );

  const statusCounts = {
    pending: applicants.filter(a => a.status === "pending").length,
    reviewed: applicants.filter(a => a.status === "reviewed").length,
    shortlisted: applicants.filter(a => a.status === "shortlisted").length,
    rejected: applicants.filter(a => a.status === "rejected").length,
  };

  if (loading) {
    return (
      <div className="p-8 max-w-7xl mx-auto">
        <div className="flex items-center justify-center h-96">
          <div className="text-gray-600">Loading applicants...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">Job Applicants</h1>
        <p className="text-gray-600">Manage and review job applications</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-4 gap-4 mb-8">
        <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-lg p-6 border border-yellow-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-yellow-600 text-sm font-semibold">Pending</p>
              <p className="text-3xl font-bold text-yellow-900">{statusCounts.pending}</p>
            </div>
            <Badge className="w-12 h-12 bg-yellow-500 text-white rounded-full flex items-center justify-center" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-6 border border-blue-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-600 text-sm font-semibold">Reviewed</p>
              <p className="text-3xl font-bold text-blue-900">{statusCounts.reviewed}</p>
            </div>
            <Eye className="w-12 h-12 text-blue-500" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-6 border border-green-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-600 text-sm font-semibold">Shortlisted</p>
              <p className="text-3xl font-bold text-green-900">{statusCounts.shortlisted}</p>
            </div>
            <TrendingUp className="w-12 h-12 text-green-500" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-lg p-6 border border-red-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-red-600 text-sm font-semibold">Rejected</p>
              <p className="text-3xl font-bold text-red-900">{statusCounts.rejected}</p>
            </div>
            <Users className="w-12 h-12 text-red-500" />
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg p-6 mb-6 border border-gray-200 shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <input
            type="text"
            placeholder="Search by name or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <select
            value={filterJob}
            onChange={(e) => setFilterJob(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Positions</option>
            {jobs.map(job => (
              <option key={job.id} value={job.id}>{job.role}</option>
            ))}
          </select>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="reviewed">Reviewed</option>
            <option value="shortlisted">Shortlisted</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>
      </div>

      {/* Applicants Table */}
      {error ? (
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <p className="text-red-700 font-semibold mb-2">Error: {error}</p>
          <p className="text-red-600 text-sm mb-4">Make sure the backend server is running at https://achal-backend-trial.tannis.in</p>
          <button
            onClick={loadApplicants}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-12 text-center">
          <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600 text-lg">No applicants found</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Name</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Email</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Position</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Phone</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Applied</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Status</th>
                <th className="px-6 py-4 text-center text-sm font-semibold text-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((app) => (
                <tr key={app.id} className="border-b border-gray-200 hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">{app.fullName}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{app.email}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{getJobName(app.jobId)}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{app.phoneNumber}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {new Date(app.applicationDate).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 text-sm">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold inline-block ${statusColors[app.status]}`}>
                      {app.status.charAt(0).toUpperCase() + app.status.slice(1)}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <div className="flex justify-center gap-3">
                      <button
                        onClick={() => {
                          setSelectedApplicant(app);
                          setShowDetailModal(true);
                        }}
                        className="p-2 hover:bg-blue-100 rounded-lg transition-colors text-blue-600"
                        title="View details"
                      >
                        <Eye className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => handleDownloadResume(app.id, app.resumeFileName)}
                        className="p-2 hover:bg-green-100 rounded-lg transition-colors text-green-600"
                        title="Download resume"
                      >
                        <Download className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => {
                          if (window.confirm("Delete this application?")) {
                            handleDelete(app.id);
                          }
                        }}
                        className="p-2 hover:bg-red-100 rounded-lg transition-colors text-red-600"
                        title="Delete"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Detail Modal */}
      {showDetailModal && selectedApplicant && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center p-6 border-b border-gray-200 sticky top-0 bg-white">
              <h2 className="text-2xl font-bold text-gray-900">{selectedApplicant.fullName}</h2>
              <button
                onClick={() => setShowDetailModal(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Basic Info */}
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <p className="text-sm text-gray-600 mb-1 flex items-center gap-2">
                    <Mail className="w-4 h-4" /> Email
                  </p>
                  <p className="text-lg font-medium text-gray-900">{selectedApplicant.email}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1 flex items-center gap-2">
                    <Phone className="w-4 h-4" /> Phone
                  </p>
                  <p className="text-lg font-medium text-gray-900">{selectedApplicant.phoneNumber}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1 flex items-center gap-2">
                    <Briefcase className="w-4 h-4" /> Position Applied
                  </p>
                  <p className="text-lg font-medium text-gray-900">{getJobName(selectedApplicant.jobId)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1 flex items-center gap-2">
                    <Calendar className="w-4 h-4" /> Applied On
                  </p>
                  <p className="text-lg font-medium text-gray-900">
                    {new Date(selectedApplicant.applicationDate).toLocaleDateString()}
                  </p>
                </div>
              </div>

              {/* Experience & Company */}
              {(selectedApplicant.yearsOfExperience || selectedApplicant.currentPosition || selectedApplicant.currentCompany) && (
                <div className="border-t pt-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Experience</h3>
                  <div className="grid grid-cols-3 gap-6">
                    {selectedApplicant.yearsOfExperience && (
                      <div>
                        <p className="text-sm text-gray-600 mb-1">Years of Experience</p>
                        <p className="text-base font-medium text-gray-900">{selectedApplicant.yearsOfExperience}</p>
                      </div>
                    )}
                    {selectedApplicant.currentPosition && (
                      <div>
                        <p className="text-sm text-gray-600 mb-1">Current Position</p>
                        <p className="text-base font-medium text-gray-900">{selectedApplicant.currentPosition}</p>
                      </div>
                    )}
                    {selectedApplicant.currentCompany && (
                      <div>
                        <p className="text-sm text-gray-600 mb-1">Current Company</p>
                        <p className="text-base font-medium text-gray-900">{selectedApplicant.currentCompany}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Cover Letter */}
              {selectedApplicant.coverLetter && (
                <div className="border-t pt-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Cover Letter</h3>
                  <p className="text-gray-700 whitespace-pre-wrap">{selectedApplicant.coverLetter}</p>
                </div>
              )}

              {/* Links */}
              {(selectedApplicant.portfolio || selectedApplicant.linkedinProfile) && (
                <div className="border-t pt-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Links</h3>
                  <div className="space-y-3">
                    {selectedApplicant.portfolio && (
                      <a
                        href={selectedApplicant.portfolio}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 text-blue-600 hover:text-blue-800 font-medium"
                      >
                        Portfolio: {selectedApplicant.portfolio}
                      </a>
                    )}
                    {selectedApplicant.linkedinProfile && (
                      <a
                        href={selectedApplicant.linkedinProfile}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 text-blue-600 hover:text-blue-800 font-medium"
                      >
                        LinkedIn: {selectedApplicant.linkedinProfile}
                      </a>
                    )}
                  </div>
                </div>
              )}

              {/* Status Update */}
              <div className="border-t pt-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Update Status</h3>
                <div className="flex gap-3">
                  <button
                    onClick={() => handleStatusChange(selectedApplicant.id, "pending")}
                    className={`px-4 py-2 rounded-lg font-medium transition-colors ${selectedApplicant.status === "pending"
                      ? "bg-yellow-500 text-white"
                      : "bg-yellow-100 text-yellow-700 hover:bg-yellow-200"
                      }`}
                  >
                    Pending
                  </button>
                  <button
                    onClick={() => handleStatusChange(selectedApplicant.id, "reviewed")}
                    className={`px-4 py-2 rounded-lg font-medium transition-colors ${selectedApplicant.status === "reviewed"
                      ? "bg-blue-500 text-white"
                      : "bg-blue-100 text-blue-700 hover:bg-blue-200"
                      }`}
                  >
                    Reviewed
                  </button>
                  <button
                    onClick={() => handleStatusChange(selectedApplicant.id, "shortlisted")}
                    className={`px-4 py-2 rounded-lg font-medium transition-colors ${selectedApplicant.status === "shortlisted"
                      ? "bg-green-500 text-white"
                      : "bg-green-100 text-green-700 hover:bg-green-200"
                      }`}
                  >
                    Shortlisted
                  </button>
                  <button
                    onClick={() => handleStatusChange(selectedApplicant.id, "rejected")}
                    className={`px-4 py-2 rounded-lg font-medium transition-colors ${selectedApplicant.status === "rejected"
                      ? "bg-red-500 text-white"
                      : "bg-red-100 text-red-700 hover:bg-red-200"
                      }`}
                  >
                    Rejected
                  </button>
                </div>
              </div>

              {/* Resume Download */}
              <div className="border-t pt-6">
                <button
                  onClick={() => handleDownloadResume(selectedApplicant.id, selectedApplicant.resumeFileName)}
                  className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                >
                  <Download className="w-5 h-5" />
                  Download Resume ({selectedApplicant.resumeFileName})
                </button>
              </div>

              {/* Delete Button */}
              <div className="border-t pt-6">
                <button
                  onClick={() => {
                    if (window.confirm("Are you sure you want to delete this application?")) {
                      handleDelete(selectedApplicant.id);
                    }
                  }}
                  className="flex items-center gap-2 px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
                >
                  <Trash2 className="w-5 h-5" />
                  Delete Application
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
