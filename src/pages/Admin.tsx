import { useState, useEffect, Suspense, lazy, useMemo } from "react";
import Layout from "@/components/Layout";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { PlusCircle, Edit, Trash2, X, Save, Copy, CheckSquare, Eye, FileText, LayoutDashboard, Share2, AlertTriangle, CloudOff } from "lucide-react";
import { getImageUrl, supabase, isInvalid as isSupabaseConfigInvalid } from "@/lib/supabase";
import { categories } from "@/lib/constants";
import type { Article } from "@/types/post";

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

import { calculateReadTime, slugify } from "@/lib/db";
import { useAdminPosts, useDeletePost, useSavePost } from "@/hooks/useAdminPosts";
import { getPostContentForAdmin } from "@/queries/adminPosts";
import { isOnline } from "@/lib/config";
import PageLoader from "@/components/PageLoader";
import ErrorFallback from "@/components/ErrorFallback";
import AdminCertificateTable from "@/components/AdminCertificateTable";

const Admin = () => {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [userProfile, setUserProfile] = useState<any>(null);
    const [loginData, setLoginData] = useState({ password: '' });
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingPost, setEditingPost] = useState<Partial<Article> | null>(null);
    const [formData, setFormData] = useState<Partial<Article>>({});
    const [tagsInput, setTagsInput] = useState("");
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState<'posts' | 'certificates'>('posts');

    const { 
        data: posts = [] as Partial<Article>[], 
        isLoading: isPostsLoading, 
        isError: isPostsError,
        refetch: refetchPosts
    } = useAdminPosts(isLoggedIn);
    
    // We fetch full content only when editing
    const [isLoadingContent, setIsLoadingContent] = useState(false);

    useEffect(() => {
        const adminAccess = localStorage.getItem('admin_access');
        if (adminAccess === 'true') {
            setIsLoggedIn(true);
            setUserProfile({ id: 'admin', role: 'admin', email: 'uyarchatech@gmail.com' });
        }

        // Keep Supabase session sync as fallback
        supabase.auth.getSession().then(({ data: { session } }) => {
            if (session) {
                setIsLoggedIn(true);
                fetchProfile(session.user.id);
            }
        });

        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            if (session) {
                setIsLoggedIn(true);
                fetchProfile(session.user.id);
            } else if (localStorage.getItem('admin_access') !== 'true') {
                setIsLoggedIn(false);
                setUserProfile(null);
            }
        });

        return () => subscription.unsubscribe();
    }, []);

    const fetchProfile = async (userId: string) => {
        try {
            const { data } = await supabase.from("users").select("id, role, email").eq("id", userId).single();
            setUserProfile(data || { id: userId, role: 'admin', email: 'uyarchatech@gmail.com' });
        } catch (err) {
            setUserProfile({ id: userId, role: 'admin', email: 'uyarchatech@gmail.com' });
        }
    };

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        // Password for admin area
        if (loginData.password === 'wt-1203') {
            localStorage.setItem('admin_access', 'true');
            setIsLoggedIn(true);
            setUserProfile({ id: 'admin', role: 'admin', email: 'uyarchatech@gmail.com' });
        } else {
            alert("Invalid access password");
        }
    };

    const handleSignOut = async () => {
        localStorage.removeItem('admin_access');
        await supabase.auth.signOut();
        setIsLoggedIn(false);
        setUserProfile(null);
    };

    const handleExport = () => {
        const dataStr = JSON.stringify(posts, null, 2);
        const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
        const exportFileDefaultName = `uyarcha_backup_${new Date().toISOString().split('T')[0]}.json`;
        const linkElement = document.createElement('a');
        linkElement.setAttribute('href', dataUri);
        linkElement.setAttribute('download', exportFileDefaultName);
        linkElement.click();
        toast.success("Backup exported as JSON");
    };

    // Draft Autosave
    const [lastSaved, setLastSaved] = useState<string | null>(null);
    useEffect(() => {
        if (!isModalOpen || !formData.title || !formData.content || editingPost) return;

        const interval = setInterval(() => {
            console.log("ADMIN: Autosaving draft...");
            const draftData = { 
                ...formData, 
                status: 'draft' as const,
                publish_date: new Date().toISOString() 
            };
            saveMutation.mutate({ data: draftData, imageFile: null });
            setLastSaved(new Date().toLocaleTimeString());
        }, 30000); // 30 sec for stability

        return () => clearInterval(interval);
    }, [isModalOpen, formData, editingPost]);

    const deleteMutation = useDeletePost();

    const handleDelete = async (id: string) => {
        if (!window.confirm("Permanently delete this article?")) return;
        deleteMutation.mutate(id);
        toast.info("Deleting post...");
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setEditingPost(null);
        setImageFile(null);
        setImagePreview(null);
        setIsLoadingContent(false);
    };

    const saveMutation = useSavePost(editingPost, closeModal);

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!formData.title?.trim()) return toast.error("Title is mandatory.");
        if (!formData.content?.trim()) return toast.error("Content is mandatory.");
        
        console.log("Saving formData:", formData);
        console.log("Selected imageFile:", imageFile);

        const data = { ...formData };
        data.tags = tagsInput.split(",").map((t: string) => t.trim()).filter(Boolean);
        data.readTime = calculateReadTime(data.content || "");
        
        if (!data.slug) data.slug = slugify(data.title || "");

        const publishDate = data.date ? new Date(data.date).toISOString() : new Date().toISOString();
        data.publish_date = publishDate;

        if (!data.status) data.status = 'draft';

        const now = new Date();
        const pubDate = new Date(publishDate);
        if (pubDate > now && data.status !== 'draft') {
            data.status = 'scheduled';
        }

        saveMutation.mutate({ data, imageFile });
    };

    const openModal = async (post?: Partial<Article>, duplicate = false) => {
        setIsModalOpen(true);
        if (post) {
            // Optimistic fast UI update with list metadata
            const postDate = (String(post.publish_date || post.date || new Date().toISOString())).split("T")[0];
            const dataBase = duplicate ? { ...post, id: undefined, title: post.title + " (Copy)", slug: "", status: "draft" as const } : post;
            
            setFormData({ ...dataBase, date: postDate });
            setEditingPost(duplicate ? null : post);
            setImagePreview(getImageUrl(post?.image || ""));
            
            // Background fetch heavy content/seo tags
            setIsLoadingContent(true);
            const fullPost = await getPostContentForAdmin(post.id);
            setIsLoadingContent(false);
            
            if (fullPost) {
                 setFormData(prev => ({ ...prev, content: fullPost.content, excerpt: fullPost.excerpt, seo_title: fullPost.seo_title, seo_description: fullPost.seo_description, seo_keywords: fullPost.seo_keywords }));
                 setTagsInput(fullPost.tags?.join(", ") || "");
            }

        } else {
            setEditingPost(null);
            const today = new Date().toISOString().split("T")[0];
            setFormData({ title: "", slug: "", excerpt: "", content: "", author: userProfile?.email || "Admin", date: today, category: categories[0], image: "", status: "published" as const, featured: false, publish_date: new Date().toISOString() });
            setTagsInput("");
            setImagePreview(null);
        }
    };

    // closeModal was hoisted

    const stats = useMemo(() => {
        return {
            total: posts.length,
            published: posts.filter(p => p.status === 'published').length,
            drafts: posts.filter(p => p.status === 'draft').length,
            views: posts.reduce((acc, p) => acc + (p.views || 0), 0)
        };
    }, [posts]);

    // PHASE 6: VIRTUALIZATION STRATEGY
    // If stats.total exceeds 100 posts, consider replacing this table with @tanstack/react-virtual
    // to render solely the ~15 items currently visible within the viewport scroll-boundary.

    if (!isLoggedIn) {
        return (
            <Layout>
                <div className="container py-20 flex justify-center">
                    <div className="w-full max-w-md bg-card p-8 rounded-2xl border border-border shadow-2xl">
                        <div className="text-center mb-8">
                            <div className="inline-flex items-center justify-center w-12 h-12 bg-accent/10 text-accent rounded-xl mb-4">
                               <LayoutDashboard size={24} />
                            </div>
                            <h1 className="text-2xl font-bold">Admin Portal</h1>
                            <p className="text-muted-foreground text-sm">Enter password to manage Uyarcha</p>
                        </div>
                        <form onSubmit={handleLogin} className="space-y-4">
                            <input type="password" value={loginData.password} onChange={(e) => setLoginData({ ...loginData, password: e.target.value })} className="w-full border rounded-xl p-3 bg-muted/30 focus:bg-background outline-none transition-all focus:ring-2 focus:ring-accent/20" placeholder="Admin Password" required />
                            <button className="w-full bg-accent text-white py-3 rounded-xl font-bold hover:opacity-90 transition-all shadow-lg shadow-accent/20">Access Dashboard</button>
                        </form>
                    </div>
                </div>
            </Layout>
        );
    }

    if (isPostsLoading) return <PageLoader message="Syncing dashboard metrics..." />;
    if (isPostsError) return <ErrorFallback message="Failed to connect to database." onRetry={refetchPosts} />;

    return (
        <Layout>
            <div className="container py-8 max-w-7xl">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
                    <div>
                        <h1 className="text-3xl font-black tracking-tight">Dashboard</h1>
                        <p className="text-muted-foreground">Monitor performance and global content state.</p>
                    </div>
                    <div className="flex gap-3">
                        <button onClick={handleExport} className="px-4 py-2 border rounded-xl text-sm font-bold hover:bg-muted transition-colors flex items-center gap-2">
                            <Share2 size={16} /> Export JSON
                        </button>
                        <button onClick={handleSignOut} className="px-4 py-2 border rounded-xl text-sm font-bold hover:bg-muted transition-colors">Sign Out</button>
                        {activeTab === 'posts' && (
                            <button onClick={() => openModal()} className="flex items-center gap-2 px-6 py-2 bg-accent text-white rounded-xl font-bold hover:opacity-90 transition-all shadow-lg shadow-accent/20">
                                <PlusCircle size={20} /> New Post
                            </button>
                        )}
                    </div>
                </div>

                <div className="flex border-b border-border mb-8">
                    <button onClick={() => setActiveTab('posts')} className={`px-6 py-3 font-bold border-b-2 transition-colors ${activeTab === 'posts' ? 'border-accent text-accent' : 'border-transparent text-muted-foreground hover:text-foreground'}`}>Posts</button>
                    <button onClick={() => setActiveTab('certificates')} className={`px-6 py-3 font-bold border-b-2 transition-colors ${activeTab === 'certificates' ? 'border-accent text-accent' : 'border-transparent text-muted-foreground hover:text-foreground'}`}>Certificates</button>
                </div>

                {isSupabaseConfigInvalid && (
                    <div className="mb-8 bg-destructive/10 border border-destructive/20 p-4 rounded-2xl flex items-center justify-between gap-4 animate-in fade-in slide-in-from-top-4">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-destructive/20 text-destructive rounded-full flex items-center justify-center flex-shrink-0">
                                <CloudOff size={20} />
                            </div>
                            <div>
                                <h3 className="font-bold text-destructive">Supabase Not Connected</h3>
                                <p className="text-xs text-muted-foreground">Your .env file has placeholder values. Publishing and data fetching will not work until correctly configured.</p>
                            </div>
                        </div>
                        <Link to="/" className="text-xs font-bold px-4 py-2 bg-destructive text-white rounded-lg whitespace-nowrap">Go Back</Link>
                    </div>
                )}

                {activeTab === 'posts' ? (
                <>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
                    <div className="bg-card border border-border p-6 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
                        <div className="flex items-center gap-3 text-muted-foreground mb-4 font-bold uppercase text-[10px] tracking-widest">
                            <FileText size={16} /> Total Content
                        </div>
                        <div className="text-4xl font-black">{stats.total}</div>
                    </div>
                    <div className="bg-card border border-border p-6 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
                        <div className="flex items-center gap-3 text-green-500 mb-4 font-bold uppercase text-[10px] tracking-widest">
                            <CheckSquare size={16} /> Live Articles
                        </div>
                        <div className="text-4xl font-black">{stats.published}</div>
                    </div>
                    <div className="bg-card border border-border p-6 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
                        <div className="flex items-center gap-3 text-amber-500 mb-4 font-bold uppercase text-[10px] tracking-widest">
                            <Edit size={16} /> Drafts
                        </div>
                        <div className="text-4xl font-black">{stats.drafts}</div>
                    </div>
                    <div className="bg-card border border-border p-6 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
                        <div className="flex items-center gap-3 text-accent mb-4 font-bold uppercase text-[10px] tracking-widest">
                            <Eye size={16} /> Total Engagement
                        </div>
                        <div className="text-4xl font-black">{stats.views.toLocaleString()}</div>
                    </div>
                </div>

                <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm">
                    <table className="w-full text-left">
                        <thead className="bg-muted/50 border-b border-border">
                            <tr>
                                <th className="p-4 font-bold text-xs uppercase tracking-wider">Article</th>
                                <th className="p-4 font-bold text-xs uppercase tracking-wider">Status</th>
                                <th className="p-4 font-bold text-xs uppercase tracking-wider">Views</th>
                                <th className="p-4 font-bold text-xs uppercase tracking-wider">Date</th>
                                <th className="p-4 font-bold text-xs uppercase tracking-wider text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                            {posts.length === 0 ? (
                                <tr><td colSpan={5} className="p-20 text-center text-muted-foreground font-medium italic">No articles yet. Start writing!</td></tr>
                            ) : (
                                posts.map((post: Partial<Article>) => (
                                    <tr key={post.id} className="hover:bg-muted/30 transition-colors group">
                                        <td className="p-4">
                                            <div className="flex items-center gap-4">
                                                <img 
                                                    src={post.image || "/placeholder.svg"} 
                                                    onError={(e)=>{(e.target as HTMLImageElement).src="/placeholder.svg"}} 
                                                    className="w-10 h-10 rounded-lg object-cover bg-muted" 
                                                />
                                                <div>
                                                    <div className="font-bold text-sm line-clamp-1">{post.title}</div>
                                                    <div className="text-[10px] font-black uppercase text-muted-foreground/60">{post.category}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="p-4">
                                            <span className={`px-2 py-1 rounded-full text-[10px] uppercase font-black ${post.status === 'published' ? 'bg-green-100 text-green-700' : post.status === 'scheduled' ? 'bg-blue-100 text-blue-700' : 'bg-amber-100 text-amber-700'}`}>
                                                {post.status}
                                            </span>
                                        </td>
                                         <td className="p-4 font-mono text-xs">{post.views || 0}</td>
                                        <td className="p-4 text-xs text-muted-foreground">{String(post.publish_date || post.date || "").split('T')[0]}</td>
                                        <td className="p-4 text-right">
                                            <div className="flex justify-end gap-1 opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button onClick={() => openModal(post, true)} className="p-2 hover:bg-muted rounded-lg" title="Duplicate"><Copy size={16} /></button>
                                                <button onClick={() => openModal(post)} className="p-2 hover:bg-muted text-accent rounded-lg" title="Edit"><Edit size={16} /></button>
                                                <button onClick={() => handleDelete(post.id as string)} className="p-2 hover:bg-red-50 text-red-600 rounded-lg" title="Delete"><Trash2 size={16} /></button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {isModalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
                        <div className="bg-background w-full max-w-5xl max-h-[90vh] overflow-hidden rounded-3xl shadow-2xl flex flex-col">
                            <div className="p-6 border-b border-border flex justify-between items-center bg-card">
                                <div>
                                    <h2 className="text-xl font-black">{editingPost ? "Edit Article" : "Draft New Content"}</h2>
                                    <div className="flex items-center gap-2">
                                        <p className="text-[10px] text-muted-foreground uppercase font-black">Slug: {formData.slug || 'auto-generated'}</p>
                                        {lastSaved && <span className="text-[10px] text-accent font-black uppercase tracking-tighter">• Autosaved {lastSaved}</span>}
                                    </div>
                                </div>
                                <button onClick={closeModal} className="p-2 hover:bg-muted rounded-full transition-colors"><X size={20} /></button>
                            </div>

                            <form onSubmit={handleSave} className="flex-1 overflow-y-auto p-8 space-y-8">
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                                    <div className="md:col-span-2 space-y-6">
                                        <input value={formData.title || ""} onChange={(e) => setFormData({ ...formData, title: e.target.value })} className="w-full text-4xl font-black bg-transparent border-none outline-none placeholder:text-muted-foreground focus:ring-0" placeholder="Title of your story..." required />
                                        <div className="border border-border rounded-2xl overflow-hidden min-h-[400px] relative">
                                            {isLoadingContent && <div className="absolute inset-0 z-10 bg-background/50 backdrop-blur-sm flex items-center justify-center font-bold text-muted-foreground"><div className="w-5 h-5 border-2 border-accent border-t-transparent rounded-full animate-spin mr-2" /> Loading full content...</div>}
                                            <Suspense fallback={<PageLoader />}>
                                                <ReactQuill value={formData.content || ""} onChange={(val) => setFormData({ ...formData, content: val })} modules={quillModules} className="border-none ql-custom" />
                                            </Suspense>
                                        </div>
                                    </div>

                                    <div className="space-y-6 bg-muted/30 p-6 rounded-2xl border border-border h-fit">
                                        <div>
                                            <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground block mb-2">Publishing settings</label>
                                            <select value={formData.status} onChange={(e) => setFormData({ ...formData, status: e.target.value as any })} className="w-full bg-background border border-border rounded-xl p-3 text-sm font-bold appearance-none">
                                                <option value="published">Published</option>
                                                <option value="draft">Draft Only</option>
                                                <option value="scheduled">Scheduled</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground block mb-2">Category</label>
                                            <select value={formData.category} onChange={(e) => setFormData({ ...formData, category: e.target.value })} className="w-full bg-background border border-border rounded-xl p-3 text-sm font-bold">
                                                {categories.map(c => <option key={c} value={c}>{c}</option>)}
                                            </select>
                                        </div>
                                        <div>
                                            <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground block mb-2">Cover Image</label>
                                            <div className="aspect-video bg-background border border-border rounded-xl mb-3 overflow-hidden">
                                                {imagePreview ? <img src={imagePreview} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-muted-foreground italic text-xs">No image</div>}
                                            </div>
                                             <input
                                                type="file"
                                                accept="image/*"
                                                onChange={(e) => {
                                                    if (e.target.files && e.target.files[0]) {
                                                        const file = e.target.files[0];
                                                        console.log("IMAGE SELECTED:", file);
                                                        setImageFile(file);
                                                        setImagePreview(URL.createObjectURL(file));
                                                    }
                                                }}
                                                className="w-full text-xs"
                                            />
                                        </div>
                                        <div className="flex items-center gap-3 bg-background p-3 rounded-xl border border-border">
                                            <input type="checkbox" id="featured" checked={formData.featured} onChange={(e) => setFormData({ ...formData, featured: e.target.checked })} />
                                            <label htmlFor="featured" className="text-xs font-bold">Featured Story</label>
                                        </div>
                                        <div className="pt-4 border-t border-border mt-4 space-y-4">
                                            <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground block">SEO Advanced</label>
                                            <input value={formData.seo_title || ""} onChange={(e) => setFormData({ ...formData, seo_title: e.target.value })} className="w-full bg-background border border-border rounded-xl p-3 text-xs" placeholder="SEO Title override..." />
                                            <textarea value={formData.seo_description || ""} onChange={(e) => setFormData({ ...formData, seo_description: e.target.value })} className="w-full bg-background border border-border rounded-xl p-3 text-xs min-h-[60px]" placeholder="Brief meta description..." />
                                            <input value={formData.seo_keywords || ""} onChange={(e) => setFormData({ ...formData, seo_keywords: e.target.value })} className="w-full bg-background border border-border rounded-xl p-3 text-xs" placeholder="Keywords (comma separated)..." />
                                        </div>
                                    </div>
                                </div>
                            </form>

                            <div className="p-6 border-t border-border bg-card flex justify-between items-center">
                                <span className="text-xs text-muted-foreground font-medium italic">Save often to prevent loss.</span>
                                <div className="flex gap-3">
                                    <button onClick={closeModal} className="px-6 py-2 border rounded-xl font-bold text-sm">Dismiss</button>
                                    <button onClick={handleSave} disabled={saveMutation.isPending} className="px-10 py-2 bg-accent text-white rounded-xl font-black text-sm hover:opacity-90 shadow-lg shadow-accent/20 flex items-center gap-2">
                                        {saveMutation.isPending ? <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Saving</> : <><Save size={18} /> Publish Story</>}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
                </>
                ) : (
                    <AdminCertificateTable isLoggedIn={isLoggedIn} />
                )}
            </div>
        </Layout>
    );
};

export default Admin;