"use client";

import { useState, useEffect } from "react";
import { Save, Loader2, RefreshCw, Plus, Trash2 } from "lucide-react";

export default function FrontPage() {
  const [formData, setFormData] = useState({
    yoe: "",
    numberOfClients: "",
    numberOfProjects: "",
    teamMembers: "",
    services: [{ name: "", description: "" }],
    vision: "",
    commitment: "",
    mission: "",
    whypartner: [{ title: "", description: "" }],
  });
  const [frontpageId, setFrontpageId] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [toast, setToast] = useState({ show: false, message: "", type: "success" });

  const fetchFrontPageData = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("https://achal-backend-trial.tannis.in/api/frontpage");
      if (response.ok) {
        const data = await response.json();
        const record = Array.isArray(data) ? data[0] : data;

        if (record) {
          setFrontpageId(record.id);

          let parsedServices = [{ name: "", description: "" }];
          if (record.services) {
            try {
              parsedServices = JSON.parse(record.services);
              if (!Array.isArray(parsedServices)) parsedServices = [parsedServices];
            } catch (e) {
              // fallback if it was originally just a string
              parsedServices = [{ name: record.services, description: "" }];
            }
          }
          let parsedWhyPartner = [{ title: "", description: "" }];
          if (record.whyPartner) {
            try {
              parsedWhyPartner = JSON.parse(record.whyPartner);
              if (!Array.isArray(parsedWhyPartner)) parsedWhyPartner = [parsedWhyPartner];
            }
            catch (e) {
              parsedWhyPartner = [{ title: record.whyPartner, description: "" }];
            }
          }

          setFormData({
            yoe: record.yoe || "",
            numberOfClients: record.numberOfClients || "",
            numberOfProjects: record.numberOfProjects || "",
            teamMembers: record.teamMembers || "",
            services: parsedServices.length > 0 ? parsedServices : [{ name: "", description: "" }],
            vision: record.vision || "",
            commitment: record.commitment || "",
            mission: record.mission || "",
            whypartner: parsedWhyPartner.length > 0 ? parsedWhyPartner : [{ title: "", description: "" }],
          });
        }
      }
    } catch (error) {
      console.error("Error fetching frontpage data:", error);
      showToast("Failed to load data. Backend might be unreachable.", "error");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchFrontPageData();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleServiceChange = (index, field, value) => {
    setFormData((prev) => {
      const updatedServices = [...prev.services];
      updatedServices[index] = { ...updatedServices[index], [field]: value };
      return { ...prev, services: updatedServices };
    });
  };

  const addService = () => {
    setFormData((prev) => ({
      ...prev,
      services: [...prev.services, { name: "", description: "" }]
    }));
  };

  const removeService = (index) => {
    setFormData((prev) => {
      const updatedServices = prev.services.filter((_, i) => i !== index);
      return { ...prev, services: updatedServices };
    });
  };

  const handleWhyPartnerChange = (index, field, value) => {
    setFormData((prev) => {
      const updatedWhyPartner = [...prev.whypartner];
      updatedWhyPartner[index] = { ...updatedWhyPartner[index], [field]: value };
      return { ...prev, whypartner: updatedWhyPartner };
    });
  };

  const addWhyPartner = () => {
    setFormData((prev) => ({
      ...prev,
      whypartner: [...prev.whypartner, { title: "", description: "" }]
    }));
  };

  const removeWhyPartner = (index) => {
    setFormData((prev) => {
      const updatedWhyPartner = prev.whypartner.filter((_, i) => i !== index);
      return { ...prev, whypartner: updatedWhyPartner };
    });
  };

  const showToast = (message, type = "success") => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: "", type: "success" }), 3000);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);

    const payload = {
      yoe: formData.yoe ? parseInt(formData.yoe, 10) : null,
      numberOfClients: formData.numberOfClients ? parseInt(formData.numberOfClients, 10) : null,
      numberOfProjects: formData.numberOfProjects ? parseInt(formData.numberOfProjects, 10) : null,
      teamMembers: formData.teamMembers ? parseInt(formData.teamMembers, 10) : null,
      services: JSON.stringify(formData.services),
      vision: formData.vision,
      commitment: formData.commitment,
      mission: formData.mission,
      whyPartner: JSON.stringify(formData.whypartner),
    };

    try {
      const url = frontpageId
        ? `https://achal-backend-trial.tannis.in/api/frontpage/${frontpageId}`
        : `https://achal-backend-trial.tannis.in/api/frontpage`;

      const method = frontpageId ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        const result = await response.json();
        if (!frontpageId && result.id) {
          setFrontpageId(result.id);
        }
        showToast("Front page details saved successfully!");
      } else {
        throw new Error("Failed to save");
      }
    } catch (error) {
      console.error("Error saving frontpage data:", error);
      showToast("Error saving data. Please try again.", "error");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto pb-10">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Your Front Page</h1>
          <p className="text-sm text-gray-500 mt-1">Manage the content displayed on your websites landing page.</p>
        </div>
        <button
          onClick={fetchFrontPageData}
          disabled={isLoading}
          className="flex items-center space-x-2 px-4 py-2 bg-white border border-gray-200 text-gray-600 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium"
        >
          <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`} />
          <span>Refresh</span>
        </button>
      </div>

      {toast.show && (
        <div className={`mb-6 p-4 rounded-lg flex items-center shadow-sm ${toast.type === 'error' ? 'bg-red-50 text-red-800 border border-red-200' : 'bg-green-50 text-green-800 border border-green-200'}`}>
          <div className={`w-2 h-2 rounded-full mr-3 ${toast.type === 'error' ? 'bg-red-500' : 'bg-green-500'}`}></div>
          <span className="font-medium text-sm">{toast.message}</span>
        </div>
      )}

      {isLoading ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 flex flex-col items-center justify-center min-h-[400px]">
          <Loader2 className="w-8 h-8 text-blue-500 animate-spin mb-4" />
          <p className="text-gray-500">Loading front page data...</p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="bg-gray-50 px-6 py-4 border-b border-gray-100">
              <h2 className="text-lg font-semibold text-gray-800">1. About Section Data</h2>
              <p className="text-xs text-gray-500 mt-1">Numerical statistics for the about section counters.</p>
            </div>

            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Years of Experience (Y.O.E)</label>
                <input
                  type="number"
                  name="yoe"
                  value={formData.yoe}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all bg-gray-50 text-gray-800"
                  placeholder="e.g. 10"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Number of Clients Served</label>
                <input
                  type="number"
                  name="numberOfClients"
                  value={formData.numberOfClients}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all bg-gray-50 text-gray-800"
                  placeholder="e.g. 500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Projects Completed</label>
                <input
                  type="number"
                  name="numberOfProjects"
                  value={formData.numberOfProjects}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all bg-gray-50 text-gray-800"
                  placeholder="e.g. 120"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Team Members</label>
                <input
                  type="number"
                  name="teamMembers"
                  value={formData.teamMembers}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all bg-gray-50 text-gray-800"
                  placeholder="e.g. 45"
                />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="bg-gray-50 px-6 py-4 border-b border-gray-100 flex justify-between items-center">
              <div>
                <h2 className="text-lg font-semibold text-gray-800">2. Our Services</h2>
                <p className="text-xs text-gray-500 mt-1">Manage the featured services displayed on the front page.</p>
              </div>
              <button
                type="button"
                onClick={addService}
                className="flex items-center space-x-1 px-3 py-1.5 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors text-sm font-medium"
              >
                <Plus className="w-4 h-4" />
                <span>Add Service</span>
              </button>
            </div>

            <div className="p-6 space-y-4">
              {formData.services.map((service, index) => (
                <div key={index} className="flex gap-4 items-start p-4 bg-gray-50 border border-gray-100 rounded-xl relative">
                  <div className="flex-1 space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Service Name</label>
                      <input
                        type="text"
                        value={service.name}
                        onChange={(e) => handleServiceChange(index, 'name', e.target.value)}
                        className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all bg-white text-gray-800"
                        placeholder="e.g. Civil Engineering"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">One Line Description</label>
                      <input
                        type="text"
                        value={service.description}
                        onChange={(e) => handleServiceChange(index, 'description', e.target.value)}
                        maxLength={150}
                        className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all bg-white text-gray-800"
                        placeholder="Brief description of the service..."
                      />
                    </div>
                  </div>
                  {formData.services.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeService(index)}
                      className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors mt-6"
                      title="Remove Service"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="bg-gray-50 px-6 py-4 border-b border-gray-100">
              <h2 className="text-lg font-semibold text-gray-800">3. Our Content Details</h2>
              <p className="text-xs text-gray-500 mt-1">Descriptions and statements for various sections.</p>
            </div>

            <div className="p-6 space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Our Mission</label>
                <textarea
                  name="mission"
                  value={formData.mission}
                  onChange={handleInputChange}
                  rows={3}
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all bg-gray-50 text-gray-800 resize-none"
                  placeholder="Enter your mission statement here..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Our Vision</label>
                <textarea
                  name="vision"
                  value={formData.vision}
                  onChange={handleInputChange}
                  rows={3}
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all bg-gray-50 text-gray-800 resize-none"
                  placeholder="Enter your vision statement here..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Our Commitment</label>
                <textarea
                  name="commitment"
                  value={formData.commitment}
                  onChange={handleInputChange}
                  rows={3}
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all bg-gray-50 text-gray-800 resize-none"
                  placeholder="Enter your commitment statement here..."
                />
              </div>
              {/* <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Why Partner</label>
                <textarea
                  name="whypartner"
                  value={formData.whypartner}
                  onChange={handleInputChange}
                  rows={3}
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all bg-gray-50 text-gray-800 resize-none"
                  placeholder="Enter your commitment statement here..."
                />
              </div> */}
            </div>


          </div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="bg-gray-50 px-6 py-4 border-b border-gray-100 flex justify-between items-center">
              <div>
                <h2 className="text-lg font-semibold text-gray-800">4. Why Partner </h2>
                <p className="text-xs text-gray-500 mt-1">Manage the featured Why Partner displayed on the front page.</p>
              </div>
              <button
                type="button"
                onClick={addWhyPartner}
                className="flex items-center space-x-1 px-3 py-1.5 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors text-sm font-medium"
              >
                <Plus className="w-4 h-4" />
                <span>Add Why Partner</span>
              </button>
            </div>

            <div className="p-6 space-y-4">
              {formData.whypartner.map((whyPartner, index) => (
                <div key={index} className="flex gap-4 items-start p-4 bg-gray-50 border border-gray-100 rounded-xl relative">
                  <div className="flex-1 space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Why Partner Title</label>
                      <input
                        type="text"
                        value={whyPartner.title}
                        onChange={(e) => handleServiceChange(index, 'name', e.target.value)}
                        className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all bg-white text-gray-800"
                        placeholder="e.g. Trusted Expertise"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">One Line Description</label>
                      <input
                        type="text"
                        value={whyPartner.description}
                        onChange={(e) => handleServiceChange(index, 'description', e.target.value)}
                        maxLength={150}
                        className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all bg-white text-gray-800"
                        placeholder="Brief description of the Why Partner..."
                      />

                    </div>
                  </div>
                  {formData.whypartner.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeWhyPartner(index)}
                      className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors mt-6"
                      title="Remove Why Partner"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-end pt-4">
            <button
              type="submit"
              disabled={isSaving}
              className="flex items-center space-x-2 px-6 py-3 bg-[#1e2336] text-white rounded-lg hover:bg-[#29324c] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#1e2336] transition-all disabled:opacity-70 disabled:cursor-not-allowed shadow-md"
            >
              {isSaving ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Save className="w-5 h-5" />
              )}
              <span className="font-semibold">{isSaving ? 'Saving...' : 'Save Changes'}</span>
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
