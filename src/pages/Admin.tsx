import { useState, useEffect, Suspense, lazy, useMemo } from "react";
import { Helmet } from "react-helmet-async";
import Layout from "@/components/Layout";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import {
    PlusCircle,
    Edit,
    Trash2,
    X,
    Save,
    Copy,
    CheckSquare,
    Eye,
    FileText,
    Download,
    LogOut,
    Award,
    Briefcase,
    CloudOff,
    ExternalLink,
    ShieldCheck,
} from "lucide-react";
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
import PageLoader from "@/components/PageLoader";
import ErrorFallback from "@/components/ErrorFallback";
import AdminCertificateTable from "@/components/AdminCertificateTable";
import AdminJobsSection from "@/components/AdminJobsSection";
import { sanitizeArticleContent } from "@/lib/sanitize";
import { postSchema } from "@/lib/validations/post";

const formatDate = (dateValue?: string | Date) => {
    if (!dateValue) return "—";
    try {
        const d = new Date(dateValue);
        if (isNaN(d.getTime())) return typeof dateValue === "string" ? dateValue.split("T")[0] : "—";
        return d.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
    } catch {
        return typeof dateValue === "string" ? dateValue.split("T")[0] : "—";
    }
};

const getStatusBadge = (status?: string) => {
    const s = status?.toLowerCase() || 'draft';
    if (s === 'published') {
        return (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200/60 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800/40">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 dark:bg-emerald-400" />
                Published
            </span>
        );
    }
    if (s === 'scheduled') {
        return (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200/60 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-800/40">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-600 dark:bg-blue-400" />
                Scheduled
            </span>
        );
    }
    return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200/60 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800/40">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-600 dark:bg-amber-400" />
            Draft
        </span>
    );
};

type AdminTab = "posts" | "jobs" | "certificates";

const Admin = () => {
    const [userEmail, setUserEmail] = useState<string>("Admin");
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingPost, setEditingPost] = useState<Partial<Article> | null>(null);
    const [formData, setFormData] = useState<Partial<Article>>({});
    const [tagsInput, setTagsInput] = useState("");
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState<AdminTab>("posts");

    const { 
        data: posts = [] as Partial<Article>[], 
        isLoading: isPostsLoading, 
        isError: isPostsError,
        refetch: refetchPosts
    } = useAdminPosts(true);
    
    const [isLoadingContent, setIsLoadingContent] = useState(false);

    useEffect(() => {
        supabase.auth.getUser().then(({ data: { user } }) => {
            if (user?.email) {
                setUserEmail(user.email);
            }
        });
    }, []);

    const handleSignOut = async () => {
        await supabase.auth.signOut();
        toast.info("Signed out successfully");
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

    const closeModal = () => {
        setIsModalOpen(false);
        setEditingPost(null);
        setImageFile(null);
        setImagePreview(null);
        setIsLoadingContent(false);
    };

    const saveMutation = useSavePost(editingPost, () => {
        try {
            localStorage.removeItem('uyarcha_admin_draft');
        } catch {
            // ignore
        }
        closeModal();
    });

    const deleteMutation = useDeletePost();

    const handleDelete = async (id: string) => {
        if (!window.confirm("Permanently delete this article?")) return;
        deleteMutation.mutate(id);
        toast.info("Deleting post...");
    };

    const handleSave = async (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        
        const title = formData.title?.trim() || "";
        if (!title) {
            toast.error("Article title is required.");
            return;
        }
        if (title.length < 3) {
            toast.error("Title must be at least 3 characters.");
            return;
        }

        const content = formData.content?.trim() || "";
        const strippedContent = content.replace(/<[^>]*>/g, "").trim();
        if (!content || (!strippedContent && !content.includes("<img"))) {
            toast.error("Article content is required.");
            return;
        }

        const data: Partial<Article> = { ...formData };
        data.title = title;
        data.content = sanitizeArticleContent(content);
        data.category = formData.category || categories[0] || "General";
        data.tags = tagsInput.split(",").map((t: string) => t.trim()).filter(Boolean);
        data.author = userEmail || "Admin";
        data.excerpt = formData.excerpt?.trim() || "";
        data.seo_title = formData.seo_title?.trim() || null;
        data.seo_description = formData.seo_description?.trim() || "";
        data.seo_keywords = formData.seo_keywords?.trim() || null;
        data.featured = Boolean(formData.featured);

        const rawSlug = formData.slug?.trim() || title;
        data.slug = slugify(rawSlug);
        data.readTime = calculateReadTime(data.content);

        const publishDate = formData.date ? new Date(formData.date).toISOString() : new Date().toISOString();
        data.publish_date = publishDate;

        if (!data.status) data.status = 'published';

        const now = new Date();
        const pubDate = new Date(publishDate);
        if (pubDate > now && data.status !== 'draft') {
            data.status = 'scheduled';
        }

        const validation = postSchema.safeParse(data);
        if (!validation.success) {
            const firstError = validation.error.errors[0]?.message || "Validation failed";
            toast.error(firstError);
            return;
        }

        saveMutation.mutate({ data, imageFile });
    };

    const openModal = async (post?: Partial<Article>, duplicate = false) => {
        setIsModalOpen(true);
        if (post) {
            const postDate = (String(post.publish_date || post.date || new Date().toISOString())).split("T")[0];
            const dataBase = duplicate ? { ...post, id: undefined, title: post.title + " (Copy)", slug: "", status: "draft" as const } : post;
            
            setFormData({ ...dataBase, date: postDate });
            setEditingPost(duplicate ? null : post);
            setImagePreview(getImageUrl(post?.image || ""));
            
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
            
            const initialData: Partial<Article> = {
                title: "",
                slug: "",
                excerpt: "",
                content: "",
                author: userEmail || "Admin",
                date: today,
                category: categories[0],
                image: "",
                status: "published" as const,
                featured: false,
                publish_date: new Date().toISOString(),
            };

            setFormData(initialData);
            setImagePreview(null);
            setTagsInput("");
        }
    };

    const stats = useMemo(() => {
        return {
            total: posts.length,
            published: posts.filter(p => p.status === 'published').length,
            drafts: posts.filter(p => p.status === 'draft').length,
            views: posts.reduce((acc, p) => acc + (p.views || 0), 0)
        };
    }, [posts]);

    if (isPostsLoading && activeTab === "posts") return <PageLoader message="Syncing dashboard metrics..." hideNavbar={true} hideFooter={true} />;
    if (isPostsError && activeTab === "posts") return <ErrorFallback message="Failed to connect to database." onRetry={refetchPosts} />;

    return (
        /* Render without public navbar and footer */
        <Layout hideNavbar={true} hideFooter={true}>
            <Helmet>
                <title>Admin Dashboard | Uyarcha</title>
                <meta name="robots" content="noindex,nofollow" />
            </Helmet>
            
            {/* Dedicated Admin Navigation Bar */}
            <header className="border-b border-border bg-card sticky top-0 z-40">
                <div className="w-full max-w-[1360px] mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <Link to="/" className="font-display text-2xl font-bold tracking-tight text-foreground hover:text-accent transition-colors">
                            Uyarcha
                        </Link>
                        <span className="text-border">/</span>
                        <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-accent/10 text-accent font-semibold text-xs">
                            <ShieldCheck size={14} />
                            <span>Admin Portal</span>
                        </div>
                    </div>

                    <div className="flex items-center gap-2 sm:gap-4">
                        <Link
                            to="/"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="hidden sm:inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors"
                        >
                            <span>View Public Site</span>
                            <ExternalLink size={12} />
                        </Link>

                        <button
                            type="button"
                            onClick={handleSignOut}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border text-xs font-semibold text-muted-foreground hover:text-destructive hover:bg-destructive/10 hover:border-destructive/30 transition-colors"
                        >
                            <LogOut size={13} />
                            <span>Sign Out</span>
                        </button>
                    </div>
                </div>
            </header>

            {/* Main Admin Content Container */}
            <div className="w-full max-w-[1360px] mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in">
                {/* Admin Header with Welcome Info */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                    <div className="space-y-1">
                        <h1 className="font-display text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground">
                            Admin Dashboard
                        </h1>
                        <p className="text-sm text-muted-foreground flex items-center flex-wrap gap-1.5">
                            <span>Logged in as</span>
                            <span className="font-semibold text-foreground bg-secondary px-2 py-0.5 rounded text-xs sm:text-sm">
                                {userEmail}
                            </span>
                            <span className="text-muted-foreground/60">•</span>
                            <span>Content Management System</span>
                        </p>
                    </div>

                    {activeTab === "posts" && (
                        <div className="flex items-center flex-wrap gap-2.5 sm:gap-3">
                            <button
                                type="button"
                                onClick={handleExport}
                                className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg border border-border bg-card text-foreground text-sm font-semibold hover:bg-secondary hover:text-accent transition-colors shadow-xs"
                            >
                                <Download className="w-4 h-4 text-muted-foreground" />
                                <span>Export JSON</span>
                            </button>
                            <button
                                type="button"
                                onClick={() => openModal()}
                                className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg bg-accent text-white text-sm font-bold hover:opacity-90 transition-all shadow-md shadow-accent/25"
                            >
                                <PlusCircle className="w-4 h-4" />
                                <span>New Post</span>
                            </button>
                        </div>
                    )}
                </div>

                {/* 3 Main Management Tabs: Posts | Jobs | Certificates */}
                <div className="flex items-center border-b border-border mb-8 overflow-x-auto">
                    <button
                        type="button"
                        onClick={() => setActiveTab("posts")}
                        className={`px-6 py-3 font-bold text-sm border-b-2 transition-all flex items-center gap-2 -mb-px shrink-0 ${
                            activeTab === "posts"
                                ? "border-accent text-accent"
                                : "border-transparent text-muted-foreground hover:text-foreground hover:border-muted-foreground/30"
                        }`}
                    >
                        <FileText size={16} />
                        <span>Posts</span>
                        <span className="ml-1 text-xs px-2 py-0.5 rounded-full bg-secondary font-semibold text-muted-foreground">
                            {posts.length}
                        </span>
                    </button>

                    <button
                        type="button"
                        onClick={() => setActiveTab("jobs")}
                        className={`px-6 py-3 font-bold text-sm border-b-2 transition-all flex items-center gap-2 -mb-px shrink-0 ${
                            activeTab === "jobs"
                                ? "border-accent text-accent"
                                : "border-transparent text-muted-foreground hover:text-foreground hover:border-muted-foreground/30"
                        }`}
                    >
                        <Briefcase size={16} />
                        <span>Jobs</span>
                    </button>

                    <button
                        type="button"
                        onClick={() => setActiveTab("certificates")}
                        className={`px-6 py-3 font-bold text-sm border-b-2 transition-all flex items-center gap-2 -mb-px shrink-0 ${
                            activeTab === "certificates"
                                ? "border-accent text-accent"
                                : "border-transparent text-muted-foreground hover:text-foreground hover:border-muted-foreground/30"
                        }`}
                    >
                        <Award size={16} />
                        <span>Certificates</span>
                    </button>
                </div>

                {/* Supabase Connection Warning */}
                {isSupabaseConfigInvalid && (
                    <div className="mb-8 bg-destructive/10 border border-destructive/20 p-4 rounded-2xl flex items-center justify-between gap-4 animate-in fade-in slide-in-from-top-4">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-destructive/20 text-destructive rounded-full flex items-center justify-center flex-shrink-0">
                                <CloudOff size={20} />
                            </div>
                            <div>
                                <h3 className="font-bold text-destructive">Supabase Not Connected</h3>
                                <p className="text-xs text-muted-foreground">Your .env file has placeholder values. Data syncing will not work until correctly configured.</p>
                            </div>
                        </div>
                        <Link to="/" className="text-xs font-bold px-4 py-2 bg-destructive text-white rounded-lg whitespace-nowrap">Go Back</Link>
                    </div>
                )}

                {/* TAB CONTENT */}

                {/* 1. POSTS SECTION */}
                {activeTab === "posts" && (
                    <>
                        {/* 4 Statistics Cards */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5 lg:gap-6 mb-8">
                            <div className="bg-card border border-border p-6 rounded-xl shadow-xs hover:shadow-md transition-shadow flex flex-col justify-between min-h-[120px]">
                                <div className="flex items-center justify-between mb-3 text-muted-foreground">
                                    <span className="font-bold uppercase text-[11px] tracking-wider text-muted-foreground">
                                        Total Content
                                    </span>
                                    <div className="w-8 h-8 rounded-lg bg-secondary flex items-center justify-center text-muted-foreground">
                                        <FileText size={16} />
                                    </div>
                                </div>
                                <div className="text-3xl sm:text-4xl font-extrabold text-foreground tracking-tight">
                                    {stats.total}
                                </div>
                            </div>

                            <div className="bg-card border border-border p-6 rounded-xl shadow-xs hover:shadow-md transition-shadow flex flex-col justify-between min-h-[120px]">
                                <div className="flex items-center justify-between mb-3 text-muted-foreground">
                                    <span className="font-bold uppercase text-[11px] tracking-wider text-muted-foreground">
                                        Live Articles
                                    </span>
                                    <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-600">
                                        <CheckSquare size={16} />
                                    </div>
                                </div>
                                <div className="text-3xl sm:text-4xl font-extrabold text-foreground tracking-tight">
                                    {stats.published}
                                </div>
                            </div>

                            <div className="bg-card border border-border p-6 rounded-xl shadow-xs hover:shadow-md transition-shadow flex flex-col justify-between min-h-[120px]">
                                <div className="flex items-center justify-between mb-3 text-muted-foreground">
                                    <span className="font-bold uppercase text-[11px] tracking-wider text-muted-foreground">
                                        Drafts
                                    </span>
                                    <div className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center text-amber-600">
                                        <Edit size={16} />
                                    </div>
                                </div>
                                <div className="text-3xl sm:text-4xl font-extrabold text-foreground tracking-tight">
                                    {stats.drafts}
                                </div>
                            </div>

                            <div className="bg-card border border-border p-6 rounded-xl shadow-xs hover:shadow-md transition-shadow flex flex-col justify-between min-h-[120px]">
                                <div className="flex items-center justify-between mb-3 text-muted-foreground">
                                    <span className="font-bold uppercase text-[11px] tracking-wider text-muted-foreground">
                                        Total Engagement
                                    </span>
                                    <div className="w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center text-accent">
                                        <Eye size={16} />
                                    </div>
                                </div>
                                <div className="text-3xl sm:text-4xl font-extrabold text-foreground tracking-tight">
                                    {stats.views.toLocaleString()}
                                </div>
                            </div>
                        </div>

                        {/* Article Table */}
                        <div className="bg-card border border-border rounded-xl shadow-xs overflow-hidden mb-12">
                            <div className="overflow-x-auto w-full">
                                <table className="w-full text-left border-collapse min-w-[700px]">
                                    <thead className="bg-muted/40 border-b border-border">
                                        <tr>
                                            <th className="py-4 px-6 font-bold text-xs uppercase tracking-wider text-muted-foreground w-[45%]">
                                                Article
                                            </th>
                                            <th className="py-4 px-5 font-bold text-xs uppercase tracking-wider text-muted-foreground">
                                                Status
                                            </th>
                                            <th className="py-4 px-5 font-bold text-xs uppercase tracking-wider text-muted-foreground">
                                                Views
                                            </th>
                                            <th className="py-4 px-5 font-bold text-xs uppercase tracking-wider text-muted-foreground">
                                                Date
                                            </th>
                                            <th className="py-4 px-6 font-bold text-xs uppercase tracking-wider text-muted-foreground text-right">
                                                Actions
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-border">
                                        {posts.length === 0 ? (
                                            <tr>
                                                <td colSpan={5} className="py-16 px-6 text-center text-muted-foreground font-medium italic">
                                                    No articles yet. Click "New Post" above to start writing!
                                                </td>
                                            </tr>
                                        ) : (
                                            posts.map((post: Partial<Article>) => (
                                                <tr key={post.id} className="hover:bg-muted/30 transition-colors group">
                                                    <td className="py-4 px-6">
                                                        <div className="flex items-center gap-4">
                                                            <img 
                                                                src={post.image || "/placeholder.svg"} 
                                                                alt={post.title || "Article thumbnail"}
                                                                onError={(e) => { (e.target as HTMLImageElement).src = "/placeholder.svg"; }} 
                                                                className="w-12 h-12 rounded-lg object-cover bg-muted shrink-0 border border-border/60" 
                                                            />
                                                            <div className="min-w-0 flex-1">
                                                                <div 
                                                                    className="font-bold text-sm sm:text-base text-foreground truncate" 
                                                                    title={post.title}
                                                                >
                                                                    {post.title || "Untitled Article"}
                                                                </div>
                                                                <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mt-0.5">
                                                                    {post.category || "General"}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </td>

                                                    <td className="py-4 px-5 whitespace-nowrap">
                                                        {getStatusBadge(post.status)}
                                                    </td>

                                                    <td className="py-4 px-5 font-mono text-sm font-semibold text-foreground whitespace-nowrap">
                                                        {typeof post.views === 'number' ? post.views.toLocaleString() : '0'}
                                                    </td>

                                                    <td className="py-4 px-5 text-sm text-muted-foreground whitespace-nowrap">
                                                        {formatDate(post.publish_date || post.date)}
                                                    </td>

                                                    <td className="py-4 px-6 text-right whitespace-nowrap">
                                                        <div className="flex items-center justify-end gap-1.5">
                                                            <button 
                                                                type="button"
                                                                onClick={() => openModal(post, true)} 
                                                                className="p-2 text-muted-foreground hover:text-foreground hover:bg-secondary rounded-lg transition-colors" 
                                                                title="Duplicate article"
                                                                aria-label={`Duplicate ${post.title}`}
                                                            >
                                                                <Copy size={16} />
                                                            </button>
                                                            <button 
                                                                type="button"
                                                                onClick={() => openModal(post)} 
                                                                className="p-2 text-muted-foreground hover:text-accent hover:bg-secondary rounded-lg transition-colors" 
                                                                title="Edit article"
                                                                aria-label={`Edit ${post.title}`}
                                                            >
                                                                <Edit size={16} />
                                                            </button>
                                                            <button 
                                                                type="button"
                                                                onClick={() => handleDelete(post.id as string)} 
                                                                className="p-2 text-muted-foreground hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 rounded-lg transition-colors" 
                                                                title="Delete article"
                                                                aria-label={`Delete ${post.title}`}
                                                            >
                                                                <Trash2 size={16} />
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

                        {/* Article Create & Edit Modal */}
                        {isModalOpen && (
                            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
                                <div className="bg-background w-full max-w-5xl max-h-[90vh] overflow-hidden rounded-3xl shadow-2xl flex flex-col border border-border">
                                    <div className="p-6 border-b border-border flex justify-between items-center bg-card">
                                        <div>
                                            <h2 className="text-xl font-black text-foreground">{editingPost ? "Edit Article" : "Draft New Content"}</h2>
                                            <p className="text-[10px] text-muted-foreground uppercase font-black mt-0.5">Slug: {formData.slug || 'auto-generated'}</p>
                                        </div>
                                        <button onClick={closeModal} className="p-2 hover:bg-muted rounded-full transition-colors" aria-label="Close modal">
                                            <X size={20} />
                                        </button>
                                    </div>

                                    <form onSubmit={handleSave} className="flex-1 overflow-y-auto p-6 sm:p-8 space-y-8">
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                                            <div className="md:col-span-2 space-y-6">
                                                <div>
                                                    <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground block mb-2">Title</label>
                                                    <input 
                                                        value={formData.title || ""} 
                                                        onChange={(e) => setFormData({ ...formData, title: e.target.value })} 
                                                        className="w-full text-2xl sm:text-3xl font-black bg-transparent border-b border-border pb-2 outline-none placeholder:text-muted-foreground focus:border-accent transition-colors" 
                                                        placeholder="Title of your story..." 
                                                        required 
                                                    />
                                                </div>

                                                <div>
                                                    <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground block mb-2">Excerpt</label>
                                                    <textarea 
                                                        value={formData.excerpt || ""} 
                                                        onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })} 
                                                        rows={2}
                                                        className="w-full bg-muted/20 border border-border rounded-xl p-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-accent" 
                                                        placeholder="Brief summary or excerpt of your article..." 
                                                    />
                                                </div>

                                                <div>
                                                    <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground block mb-2">Content</label>
                                                    <div className="border border-border rounded-2xl overflow-hidden min-h-[400px] relative bg-card">
                                                        {isLoadingContent && (
                                                            <div className="absolute inset-0 z-10 bg-background/50 backdrop-blur-sm flex items-center justify-center font-bold text-muted-foreground">
                                                                <div className="w-5 h-5 border-2 border-accent border-t-transparent rounded-full animate-spin mr-2" /> 
                                                                Loading full content...
                                                            </div>
                                                        )}
                                                        <Suspense fallback={<PageLoader />}>
                                                            <ReactQuill value={formData.content || ""} onChange={(val) => setFormData({ ...formData, content: val })} modules={quillModules} className="border-none ql-custom" />
                                                        </Suspense>
                                                    </div>
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
                                                    <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground block mb-2">Tags (Comma-separated)</label>
                                                    <input 
                                                        value={tagsInput} 
                                                        onChange={(e) => setTagsInput(e.target.value)} 
                                                        placeholder="React, TypeScript, Web..." 
                                                        className="w-full bg-background border border-border rounded-xl p-3 text-xs font-medium" 
                                                    />
                                                </div>
                                                <div>
                                                    <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground block mb-2">Cover Image</label>
                                                    <div className="aspect-video bg-background border border-border rounded-xl mb-3 overflow-hidden">
                                                        {imagePreview ? <img src={imagePreview} className="w-full h-full object-cover" alt="Cover preview" /> : <div className="w-full h-full flex items-center justify-center text-muted-foreground italic text-xs">No image</div>}
                                                    </div>
                                                    <input
                                                        type="file"
                                                        accept="image/*"
                                                        onChange={(e) => {
                                                            if (e.target.files && e.target.files[0]) {
                                                                const file = e.target.files[0];
                                                                setImageFile(file);
                                                                setImagePreview(URL.createObjectURL(file));
                                                            }
                                                        }}
                                                        className="w-full text-xs"
                                                    />
                                                </div>
                                                <div className="flex items-center gap-3 bg-background p-3 rounded-xl border border-border">
                                                    <input type="checkbox" id="featured" checked={formData.featured} onChange={(e) => setFormData({ ...formData, featured: e.target.checked })} />
                                                    <label htmlFor="featured" className="text-xs font-bold cursor-pointer">Featured Story</label>
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
                                            <button onClick={closeModal} className="px-6 py-2 border rounded-xl font-bold text-sm hover:bg-muted transition-colors">Dismiss</button>
                                            <button 
                                                type="button"
                                                onClick={() => handleSave()} 
                                                disabled={saveMutation.isPending} 
                                                className="px-8 py-2.5 bg-accent text-white rounded-xl font-bold text-sm hover:opacity-90 shadow-lg shadow-accent/20 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                                            >
                                                {saveMutation.isPending ? (
                                                    <>
                                                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                                        <span>Saving...</span>
                                                    </>
                                                ) : (
                                                    <>
                                                        <Save size={18} />
                                                        <span>{editingPost ? "Update Story" : formData.status === 'draft' ? "Save Draft" : "Publish Story"}</span>
                                                    </>
                                                )}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </>
                )}

                {/* 2. JOBS SECTION */}
                {activeTab === "jobs" && <AdminJobsSection />}

                {/* 3. CERTIFICATES SECTION */}
                {activeTab === "certificates" && <AdminCertificateTable isLoggedIn={true} />}
            </div>
        </Layout>
    );
};

export default Admin;