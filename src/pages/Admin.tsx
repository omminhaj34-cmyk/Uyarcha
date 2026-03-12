import { useState, useEffect, Suspense, lazy } from "react";
import Layout from "@/components/Layout";
import { Link } from "react-router-dom";
import { PlusCircle, Edit, Trash2, X, Save, Copy, CheckSquare } from "lucide-react";
import { categories } from "@/data/articles";
import { createPost, updatePost, deletePost, uploadImage, getImageUrl, loginAdmin } from "@/lib/api";

import "react-quill/dist/quill.snow.css";

const ReactQuill = lazy(() => import("react-quill"));

const quillModules = {
    toolbar: [
        [{ header: [1, 2, 3, 4, 5, false] }],
        ["bold", "italic", "underline"],
        [{ list: "ordered" }, { list: "bullet" }],
        ["link", "image"],
        ["clean"]
    ]
};

const Admin = () => {
    const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem('admin_token'));
    const [loginData, setLoginData] = useState({ password: '' });
    const [posts, setPosts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingPost, setEditingPost] = useState<any>(null);
    const [formData, setFormData] = useState<any>({});
    const [tagsInput, setTagsInput] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);

    useEffect(() => {
        if (!isLoggedIn) return;
        async function load() {
            try {
                const data = await createApiFetch("/api/posts");
                setPosts(Array.isArray(data) ? data : []);
            } catch {
                setError(true);
                setPosts([]);
            }
            setLoading(false);
        }
        load();
    }, [isLoggedIn]);

    // Step 4: Draft Autosave
    useEffect(() => {
        if (!isModalOpen || editingPost) return;
        const savedDraft = localStorage.getItem('draft_post');
        if (savedDraft) {
            try {
                const draft = JSON.parse(savedDraft);
                setFormData(prev => ({ ...prev, ...draft }));
            } catch (e) {
                console.error("Failed to parse draft", e);
            }
        }
    }, [isModalOpen, editingPost]);

    useEffect(() => {
        if (isModalOpen && !editingPost && Object.keys(formData).length > 0) {
            localStorage.setItem('draft_post', JSON.stringify(formData));
        }
    }, [formData, isModalOpen, editingPost]);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const token = await loginAdmin(loginData.password);
            localStorage.setItem('admin_token', token);
            setIsLoggedIn(true);
        } catch (err) {
            alert("Invalid credentials");
        }
    };

    const openModal = (post?: any, duplicate = false) => {
        if (post) {
            const data = duplicate ? {
                ...post,
                id: Date.now().toString(),
                title: post.title + " Copy",
                slug: "",
                status: "draft"
            } : post;
            setEditingPost(duplicate ? null : post);
            setFormData(data);
            setTagsInput(post?.tags?.join(", ") || "");
            setImagePreview(getImageUrl(post?.image || ""));
        } else {
            setEditingPost(null);
            setFormData({
                title: "",
                slug: "",
                excerpt: "",
                content: "",
                author: "Admin",
                date: new Date().toISOString().split("T")[0],
                category: categories[0] || 'Technology',
                image: "",
                readTime: "5 min read",
                status: "published",
                publishDate: new Date().toISOString().slice(0, 16),
                tags: []
            });
            setTagsInput("");
            setImagePreview(null);
        }
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setEditingPost(null);
        setImageFile(null);
        setImagePreview(null);
    };

    const handleDelete = async (id: string) => {
        if (!window.confirm("Delete post?")) return;
        try {
            await deletePost(id);
            // Step 5: Remove page reloads
            setPosts(posts.filter(p => (p.id !== id && p._id !== id)));
        } catch (e) {
            alert("Delete failed");
        }
    };

    const handleSave = async (e: any) => {
        e.preventDefault();

        // Step 6: Post Validation
        if (!formData.title?.trim() || !formData.content?.trim() || !formData.category?.trim()) {
            alert("Title, Content, and Category are required.");
            return;
        }

        setIsLoading(true);
        const data = { ...formData };
        data.tags = tagsInput.split(",").map((t: string) => t.trim()).filter(Boolean);

        // Step 2: Auto slug generation
        if (!data.slug) {
            data.slug = data.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
        }

        try {
            if (imageFile) {
                const url = await uploadImage(imageFile);
                data.image = url;
            }

            if (editingPost) {
                const updated = await updatePost(editingPost.id || editingPost._id, data);
                // Step 5: Remove page reloads
                setPosts(posts.map(p => (p.id === (editingPost.id || editingPost._id) || p._id === (editingPost.id || editingPost._id)) ? updated : p));
            } else {
                const created = await createPost(data);
                // Step 5: Remove page reloads
                setPosts([created, ...posts]);
            }

            // Step 4: Clear draft after successful save
            localStorage.removeItem('draft_post');
            closeModal();
        } catch (err: any) {
            alert(err.message || "Save failed");
        } finally {
            setIsLoading(false);
        }
    };

    async function createApiFetch(url: string) {
        const token = localStorage.getItem('admin_token');
        const res = await fetch(url, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        if (!res.ok) throw new Error();
        return res.json();
    }

    if (!isLoggedIn) {
        return (
            <Layout>
                <div className="container py-12 flex justify-center">
                    <div className="w-full max-w-md bg-card p-8 rounded-xl border border-border shadow-soft">
                        <h1 className="text-2xl font-bold mb-6 text-center">Admin Login</h1>
                        <form onSubmit={handleLogin} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium mb-1">Admin Password</label>
                                <input
                                    type="password"
                                    value={loginData.password}
                                    onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                                    className="w-full border rounded p-3 bg-muted/30 focus:bg-background outline-none transition-all focus:ring-2 focus:ring-accent/20"
                                    placeholder="Enter password..."
                                    required
                                />
                            </div>
                            <button className="w-full bg-accent text-white py-3 rounded-lg font-bold hover:opacity-90 transition-all shadow-lg shadow-accent/20">
                                Access Dashboard
                            </button>
                        </form>
                    </div>
                </div>
            </Layout>
        );
    }

    if (loading && posts.length === 0) {
        return (
            <Layout>
                <div className="container py-20 text-center">
                    <div className="animate-pulse text-muted-foreground">Loading dashboard...</div>
                </div>
            </Layout>
        );
    }

    return (
        <Layout>
            <section className="container py-12">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                    <div>
                        <h1 className="text-3xl font-bold font-display">Uyarcha CMS</h1>
                        <p className="text-muted-foreground">Manage your articles and brand visibility</p>
                    </div>
                    <div className="flex gap-3">
                        <button
                            onClick={() => {
                                localStorage.removeItem('admin_token');
                                setIsLoggedIn(false);
                            }}
                            className="px-4 py-2 border rounded-lg text-sm font-medium hover:bg-muted transition-colors"
                        >
                            Logout
                        </button>
                        <button
                            onClick={() => openModal()}
                            className="flex items-center gap-2 px-6 py-2 bg-accent text-white rounded-lg font-semibold hover:opacity-90 transition-all shadow-md shadow-accent/20"
                        >
                            <PlusCircle size={20} />
                            Create New Post
                        </button>
                    </div>
                </div>

                <div className="bg-card border border-border rounded-xl overflow-hidden shadow-sm">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-muted/50 border-b border-border">
                                <tr>
                                    <th className="p-4 font-semibold text-sm">Post</th>
                                    <th className="p-4 font-semibold text-sm">Status</th>
                                    <th className="p-4 font-semibold text-sm">Category</th>
                                    <th className="p-4 font-semibold text-sm">Date</th>
                                    <th className="p-4 font-semibold text-sm text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border">
                                {posts.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} className="p-12 text-center text-muted-foreground">
                                            No posts found. Create your first post!
                                        </td>
                                    </tr>
                                ) : (
                                    posts.map((post: any) => (
                                        <tr key={post.id || post._id} className="hover:bg-muted/30 transition-colors">
                                            <td className="p-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-12 h-12 rounded bg-muted overflow-hidden flex-shrink-0">
                                                        <img
                                                            src={getImageUrl(post.image) || '/placeholder.svg'}
                                                            onError={(e) => { e.currentTarget.src = '/placeholder.svg'; }}
                                                            className="w-full h-full object-cover"
                                                        />
                                                    </div>
                                                    <div>
                                                        <div className="font-semibold line-clamp-1">{post.title}</div>
                                                        <div className="text-xs text-muted-foreground">/{post.slug}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="p-4">
                                                <span className={`px-2 py-1 rounded-full text-[10px] uppercase font-bold ${post.status === 'published' ? 'bg-green-100 text-green-700' : post.status === 'scheduled' ? 'bg-blue-100 text-blue-700' : 'bg-yellow-100 text-yellow-700'
                                                    }`}>
                                                    {post.status}
                                                </span>
                                            </td>
                                            <td className="p-4 text-sm">{post.category}</td>
                                            <td className="p-4 text-sm text-muted-foreground">{post.date}</td>
                                            <td className="p-4 text-right">
                                                <div className="flex justify-end gap-2">
                                                    <button onClick={() => openModal(post, true)} className="p-2 hover:text-accent transition-colors" title="Duplicate">
                                                        <Copy size={18} />
                                                    </button>
                                                    <button onClick={() => openModal(post)} className="p-2 hover:text-blue-500 transition-colors" title="Edit">
                                                        <Edit size={18} />
                                                    </button>
                                                    <button onClick={() => handleDelete(post.id || post._id)} className="p-2 hover:text-red-500 transition-colors" title="Delete">
                                                        <Trash2 size={18} />
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

                {isModalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                        <div className="bg-background w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-2xl shadow-2xl animate-in fade-in zoom-in duration-200">
                            <div className="p-6 border-b border-border flex justify-between items-center sticky top-0 bg-background z-10">
                                <h2 className="text-xl font-bold font-display">{editingPost ? "Edit Content" : "Create New Content"}</h2>
                                <button onClick={closeModal} className="p-2 hover:bg-muted rounded-full transition-colors">
                                    <X size={20} />
                                </button>
                            </div>

                            <form onSubmit={handleSave} className="p-6 space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-4">
                                        <div>
                                            <label className="block text-sm font-semibold mb-1">Title *</label>
                                            <input
                                                value={formData.title || ""}
                                                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                                className="w-full border border-border rounded-lg p-3 bg-muted/30 focus:bg-background transition-all outline-none focus:ring-2 focus:ring-accent/20"
                                                placeholder="Enter title..."
                                                required
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-semibold mb-1">Slug (auto-generated if empty)</label>
                                            <input
                                                value={formData.slug || ""}
                                                onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                                                className="w-full border border-border rounded-lg p-3 bg-muted/30 outline-none focus:ring-2 focus:ring-accent/20"
                                                placeholder="ai-tools-guide"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-semibold mb-1">Category *</label>
                                            <select
                                                value={formData.category}
                                                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                                className="w-full border border-border rounded-lg p-3 bg-muted/30 outline-none focus:ring-2 focus:ring-accent/20"
                                            >
                                                {categories.map(c => <option key={c} value={c}>{c}</option>)}
                                            </select>
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        <div>
                                            <label className="block text-sm font-semibold mb-1">Featured Image</label>
                                            <div className="flex gap-4">
                                                <div className="w-24 h-24 border-2 border-dashed border-border rounded-lg overflow-hidden bg-muted flex-shrink-0">
                                                    {imagePreview ? (
                                                        <img src={imagePreview} className="w-full h-full object-cover" />
                                                    ) : (
                                                        <div className="w-full h-full flex items-center justify-center text-muted-foreground"><PlusCircle size={20} /></div>
                                                    )}
                                                </div>
                                                <div className="flex-1 space-y-2">
                                                    <input
                                                        type="file"
                                                        accept="image/*"
                                                        onChange={(e) => {
                                                            const file = e.target.files?.[0];
                                                            if (file) {
                                                                setImageFile(file);
                                                                setImagePreview(URL.createObjectURL(file));
                                                            }
                                                        }}
                                                        className="w-full text-xs"
                                                    />
                                                    <input
                                                        value={formData.image || ""}
                                                        onChange={(e) => {
                                                            setFormData({ ...formData, image: e.target.value });
                                                            setImagePreview(e.target.value);
                                                        }}
                                                        placeholder="Or paste URL..."
                                                        className="w-full border border-border rounded-lg p-2 text-sm bg-muted/30 outline-none"
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-sm font-semibold mb-1">Status</label>
                                                <select
                                                    value={formData.status}
                                                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                                                    className="w-full border border-border rounded-lg p-2 text-sm bg-muted/30"
                                                >
                                                    <option value="published">Published</option>
                                                    <option value="draft">Draft</option>
                                                    <option value="scheduled">Scheduled</option>
                                                </select>
                                            </div>
                                            <div>
                                                <label className="block text-sm font-semibold mb-1">Publish Date</label>
                                                <input
                                                    type="datetime-local"
                                                    value={formData.publishDate || ""}
                                                    onChange={(e) => setFormData({ ...formData, publishDate: e.target.value })}
                                                    className="w-full border border-border rounded-lg p-2 text-sm bg-muted/30"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold mb-2">Content *</label>
                                    <div className="border border-border rounded-xl overflow-hidden min-h-[300px]">
                                        <Suspense fallback={<div className="p-8 text-center text-muted-foreground animate-pulse">Loading editor...</div>}>
                                            <ReactQuill
                                                value={formData.content || ""}
                                                onChange={(val) => setFormData({ ...formData, content: val })}
                                                modules={quillModules}
                                                className="border-none"
                                            />
                                        </Suspense>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold mb-1">Tags (comma separated)</label>
                                    <input
                                        value={tagsInput}
                                        onChange={(e) => setTagsInput(e.target.value)}
                                        className="w-full border border-border rounded-lg p-3 bg-muted/30 outline-none"
                                        placeholder="AI, Tech, Future"
                                    />
                                </div>

                                <div className="flex justify-end gap-3 pt-4 border-t border-border sticky bottom-0 bg-background py-4">
                                    <button
                                        type="button"
                                        onClick={closeModal}
                                        className="px-6 py-2 border border-border rounded-lg font-medium hover:bg-muted transition-colors"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        disabled={isLoading}
                                        className="flex items-center gap-2 px-8 py-2 bg-accent text-white rounded-lg font-bold hover:opacity-90 disabled:opacity-50 transition-all shadow-lg shadow-accent/20"
                                    >
                                        {isLoading ? (
                                            <>
                                                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                                Saving...
                                            </>
                                        ) : (
                                            <>
                                                <Save size={18} />
                                                Save Content
                                            </>
                                        )}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </section>
        </Layout>
    );
};

export default Admin;