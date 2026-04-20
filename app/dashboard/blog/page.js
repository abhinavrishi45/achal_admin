"use client";

import { useState, useEffect } from "react";
import { Plus, Edit2, Trash2, X, Check, Search, FileText, Calendar, User, Eye, EyeOff } from "lucide-react";
const API_BASE = process.env.NEXT_PUBLIC_BACKEND_URL || 'https://achal-backend-trial.tannis.in';

export default function BlogAdminPage() {
  const [blogs, setBlogs] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("content"); // 'content', 'advanced'

  const defaultForm = {
    headline: "",
    slug: "",
    image: "",
    excerpt: "",
    paragraphs: "", // To store stringified JSON or text
    content: "",
    author: "",
    isPublished: false,
    publishedAt: "",
  };

  const [formData, setFormData] = useState(defaultForm);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const response = await fetch(`${API_BASE}/api/blogs`, { method: 'GET', mode: 'cors', credentials: 'include' });
      if (response.ok) {
        const data = await response.json();
        setBlogs(data);
      }
    } catch (error) {
      console.error("Error loading blogs:", error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleHeadlineChange = (e) => {
    const headline = e.target.value;
    setFormData((prev) => ({
      ...prev,
      headline,
      slug: !editingId ? headline.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)+/g, "") : prev.slug,
    }));
  };

  const openCreateModal = () => {
    setEditingId(null);
    setFormData({ ...defaultForm, publishedAt: new Date().toISOString().substring(0, 10) });
    setIsModalOpen(true);
    setActiveTab("content");
  };

  const openEditModal = (blog) => {
    setEditingId(blog.id);
    let formattedDate = blog.publishedAt;
    if (formattedDate && formattedDate.includes("T")) {
      formattedDate = formattedDate.split("T")[0];
    }
    setFormData({ ...blog, publishedAt: formattedDate });
    setIsModalOpen(true);
    setActiveTab("content");
  };

  const handleDelete = (id) => {
    if (confirm("Are you sure you want to delete this blog post?")) {
      deleteFromAPI(id);
    }
  };

  const deleteFromAPI = async (id) => {
    try {
      const response = await fetch(`${API_BASE}/api/blogs/${id}`, {
        method: "DELETE",
      });
      if (response.ok) {
        setBlogs(blogs.filter(b => b.id !== id));
      } else {
        alert("Failed to delete blog");
      }
    } catch (error) {
      console.error("Error deleting blog:", error);
      alert("Error deleting blog");
    }
  };

  const toggleStatus = (blog) => {
    const updated = { ...blog, isPublished: !blog.isPublished };
    updateBlogAPI(updated);
  };

  const updateBlogAPI = async (blogData) => {
    try {
      const response = await fetch(`${API_BASE}/api/blogs/${blogData.id}`, {
        method: "PUT",
        mode: 'cors',
        credentials: 'include',
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(blogData),
      });
      if (response.ok) {
        setBlogs(blogs.map(b => b.id === blogData.id ? blogData : b));
      } else {
        alert("Failed to update blog");
      }
    } catch (error) {
      console.error("Error updating blog:", error);
      alert("Error updating blog");
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.headline || !formData.slug) {
      alert("Headline and Slug are required.");
      return;
    }

    const blogToSave = { ...formData };

    if (!blogToSave.publishedAt && blogToSave.isPublished) {
      blogToSave.publishedAt = new Date().toISOString();
    }

    if (editingId) {
      // Update existing blog
      blogToSave.id = editingId;
      saveBlogToAPI(blogToSave, true);
    } else {
      // Create new blog
      saveBlogToAPI(blogToSave, false);
    }
  };

  const saveBlogToAPI = async (blogData, isUpdate) => {
    try {
      const url = isUpdate
        ? `${API_BASE}/api/blogs/${blogData.id}`
        : `${API_BASE}/api/blogs`;

      const response = await fetch(url, {
        method: isUpdate ? "PUT" : "POST",
        mode: 'cors',
        credentials: 'include',
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(blogData),
      });

      if (response.ok) {
        const savedBlog = await response.json();
        if (isUpdate) {
          setBlogs(blogs.map(b => b.id === savedBlog.id ? savedBlog : b));
        } else {
          setBlogs([...blogs, savedBlog]);
        }
        setIsModalOpen(false);
      } else {
        alert("Failed to save blog");
      }
    } catch (error) {
      console.error("Error saving blog:", error);
      alert("Error saving blog");
    }
  };

  const filteredBlogs = blogs.filter((b) =>
    b.headline.toLowerCase().includes(searchQuery.toLowerCase()) ||
    b.author?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto pb-10">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Blog Manager</h1>
          <p className="text-sm text-gray-500 mt-1">Write, edit, and publish your company articles.</p>
        </div>
        <button
          onClick={openCreateModal}
          className="flex items-center space-x-2 bg-orange-600 hover:bg-orange-700 text-white px-4 py-2.5 rounded-lg transition-colors shadow-sm font-medium"
        >
          <Plus className="w-5 h-5" />
          <span>Write New Article</span>
        </button>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden min-h-[500px]">
        {/* Toolbar */}
        <div className="p-4 border-b border-gray-200 flex items-center justify-between bg-gray-50/50">
          <div className="relative w-72">
            <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search by headline or author..."
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
                <th className="px-6 py-4 font-medium">Article</th>
                <th className="px-6 py-4 font-medium">Author</th>
                <th className="px-6 py-4 font-medium">Status</th>
                <th className="px-6 py-4 font-medium">Date</th>
                <th className="px-6 py-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredBlogs.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-6 py-12 text-center text-gray-500">
                    <div className="flex flex-col items-center">
                      <div className="w-12 h-12 rounded-full bg-orange-50 flex items-center justify-center mb-3">
                        <FileText className="w-6 h-6 text-orange-400" />
                      </div>
                      <p>No blog posts found. Share your first article!</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredBlogs.map((blog) => (
                  <tr key={blog.id} className="hover:bg-gray-50/50 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex flex-col max-w-[300px]">
                        <p className="font-semibold text-gray-900 truncate" title={blog.headline}>{blog.headline}</p>
                        <p className="text-xs text-gray-500 truncate mt-1">{blog.excerpt || "No excerpt."}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600 truncate max-w-[150px]">
                      <div className="flex items-center space-x-2">
                        <User className="w-4 h-4 text-gray-400" />
                        <span>{blog.author || "Anonymous"}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => toggleStatus(blog)}
                        className={`inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-xs font-bold transition-colors hover:opacity-80 ${blog.isPublished ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-700"}`}
                        title="Click to toggle publish visibility"
                      >
                        {blog.isPublished ? <><Eye className="w-3.5 h-3.5 mr-1" /> Published</> : <><EyeOff className="w-3.5 h-3.5 mr-1" /> Hidden</>}
                      </button>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      <div className="flex items-center space-x-1">
                        <Calendar className="w-3.5 h-3.5" />
                        <span>{blog.publishedAt ? new Date(blog.publishedAt).toLocaleDateString() : 'Draft Mode'}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => openEditModal(blog)}
                          className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Edit Article"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(blog.id)}
                          className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Delete Article"
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
                <FileText className="w-5 h-5 text-orange-500" />
                <span>{editingId ? "Edit Blog Article" : "Compose Article"}</span>
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-2 text-gray-400 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex border-b border-gray-200">
              <button
                className={`flex-1 py-3 text-sm font-medium transition-colors ${activeTab === 'content' ? 'border-b-2 border-orange-500 text-orange-600 bg-orange-50/30' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'}`}
                onClick={() => setActiveTab('content')}
              >
                Article Content
              </button>
              <button
                className={`flex-1 py-3 text-sm font-medium transition-colors ${activeTab === 'advanced' ? 'border-b-2 border-orange-500 text-orange-600 bg-orange-50/30' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'}`}
                onClick={() => setActiveTab('advanced')}
              >
                Advanced & SEO
              </button>
            </div>

            <div className="p-6 overflow-y-auto flex-1 custom-scrollbar">
              <form id="blog-form" onSubmit={handleSubmit} className="space-y-6">

                {/* CONTENT TAB */}
                <div className={activeTab === 'content' ? 'block space-y-5' : 'hidden'}>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="md:col-span-3">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Headline *</label>
                      <input
                        type="text"
                        name="headline"
                        required
                        value={formData.headline}
                        onChange={handleHeadlineChange}
                        className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none transition-all font-semibold text-gray-800 text-lg"
                        placeholder="An amazing article title..."
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Author</label>
                      <input
                        type="text"
                        name="author"
                        value={formData.author}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none transition-all"
                        placeholder="John Doe"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Article Excerpt</label>
                    <textarea
                      name="excerpt"
                      rows="2"
                      value={formData.excerpt}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none transition-all resize-none text-sm text-gray-600"
                      placeholder="Brief summary appearing on blog lists..."
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1 flex justify-between">
                      <span>Main Content (HTML/Markdown)</span>
                      <span className="text-xs text-gray-400">Supports rich text</span>
                    </label>
                    <textarea
                      name="content"
                      rows="10"
                      value={formData.content}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none transition-all font-mono text-sm shadow-inner bg-gray-50/50"
                      placeholder="Write your beautiful article content here..."
                    />
                  </div>
                </div>

                {/* ADVANCED TAB */}
                <div className={activeTab === 'advanced' ? 'block space-y-6' : 'hidden'}>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">URL Slug *</label>
                      <input
                        type="text"
                        name="slug"
                        required
                        value={formData.slug}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none transition-all font-mono text-sm bg-gray-50"
                        placeholder="an-amazing-article-title"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Featured Image URL</label>
                      <input
                        type="text"
                        name="image"
                        value={formData.image}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none transition-all"
                        placeholder="https://images.unsplash.com/..."
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Paragraphs (JSON Block format)</label>
                    <textarea
                      name="paragraphs"
                      rows="4"
                      value={formData.paragraphs}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 bg-gray-900 text-green-400 rounded-lg border border-gray-800 focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none transition-all font-mono text-xs"
                      placeholder={'[{"heading": "Intro", "body": "..."}]'}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-6 bg-gray-50 p-5 rounded-xl border border-gray-100">
                    <div className="flex items-center">
                      <label className="relative flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          name="isPublished"
                          checked={formData.isPublished}
                          onChange={handleInputChange}
                          className="peer sr-only"
                        />
                        <div className="w-14 h-7 bg-gray-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-green-500"></div>
                        <span className="ml-4 text-sm font-bold text-gray-800">
                          {formData.isPublished ? "Article is LIVE" : "Draft Mode"}
                        </span>
                      </label>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Publish Date Override</label>
                      <input
                        type="date"
                        name="publishedAt"
                        value={formData.publishedAt}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none transition-all text-sm"
                      />
                    </div>
                  </div>
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
                form="blog-form"
                className="px-6 py-2.5 rounded-lg bg-orange-600 text-white hover:bg-orange-700 font-medium transition-colors flex items-center space-x-2 shadow-sm"
              >
                <Check className="w-4 h-4" />
                <span>{editingId ? "Save Changes" : "Create Article"}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
