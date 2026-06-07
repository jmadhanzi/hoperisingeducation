/**
 * AdminBlog — protected route (/admin/blog)
 * Accessible only to users with role === "admin".
 * Allows creating, editing, publishing/unpublishing, and deleting blog posts.
 */
import { useState } from "react";
import { Link } from "wouter";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import {
  ArrowLeft,
  Plus,
  Edit3,
  Trash2,
  Eye,
  EyeOff,
  RefreshCw,
  Save,
  X,
  BookOpen,
  ShieldCheck,
  AlertTriangle,
  CheckCircle,
  Clock,
  ExternalLink,
} from "lucide-react";

// ── Helpers ───────────────────────────────────────────────────────────────────

function slugify(title: string) {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .slice(0, 200);
}

const CATEGORIES = ["Impact Story", "News", "Program Update", "Announcement"];

// ── Post Form ─────────────────────────────────────────────────────────────────

type PostFormData = {
  id?: number;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  coverImageUrl: string;
  category: string;
  author: string;
};

const EMPTY_FORM: PostFormData = {
  title: "",
  slug: "",
  excerpt: "",
  content: "",
  coverImageUrl: "",
  category: "Impact Story",
  author: "Hope Rising Education",
};

function PostForm({
  initial,
  onClose,
  onSaved,
}: {
  initial?: PostFormData;
  onClose: () => void;
  onSaved: () => void;
}) {
  const utils = trpc.useUtils();
  const [form, setForm] = useState<PostFormData>(initial ?? EMPTY_FORM);
  const [autoSlug, setAutoSlug] = useState(!initial?.id);

  function set(key: keyof PostFormData, value: string) {
    setForm((prev) => {
      const next = { ...prev, [key]: value };
      if (key === "title" && autoSlug) next.slug = slugify(value);
      return next;
    });
  }

  const createMutation = trpc.blog.create.useMutation({
    onSuccess: () => {
      toast.success("Post created! It is saved as a draft.");
      utils.blog.adminList.invalidate();
      onSaved();
    },
    onError: (err) => toast.error(`Failed: ${err.message}`),
  });

  const updateMutation = trpc.blog.update.useMutation({
    onSuccess: () => {
      toast.success("Post updated.");
      utils.blog.adminList.invalidate();
      utils.blog.list.invalidate();
      onSaved();
    },
    onError: (err) => toast.error(`Failed: ${err.message}`),
  });

  const isPending = createMutation.isPending || updateMutation.isPending;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.title.trim()) { toast.error("Title is required"); return; }
    if (!form.content.trim()) { toast.error("Content is required"); return; }

    const payload = {
      title: form.title.trim(),
      slug: form.slug.trim() || slugify(form.title),
      excerpt: form.excerpt.trim() || undefined,
      content: form.content.trim(),
      coverImageUrl: form.coverImageUrl.trim() || undefined,
      category: form.category,
      author: form.author.trim() || "Hope Rising Education",
    };

    if (form.id) {
      updateMutation.mutate({ id: form.id, ...payload });
    } else {
      createMutation.mutate(payload);
    }
  }

  const inputCls =
    "w-full px-4 py-2.5 rounded-xl border border-[#E7E8E9] focus:border-[#EE701E] outline-none text-[#0D215C] bg-white text-sm";

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#E7E8E9] sticky top-0 bg-white z-10">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-[#EE701E]/10 rounded-lg flex items-center justify-center">
              <BookOpen className="w-4 h-4 text-[#EE701E]" />
            </div>
            <h2
              className="font-extrabold text-[#0D215C]"
              style={{ fontFamily: "Manrope, sans-serif" }}
            >
              {form.id ? "Edit Post" : "New Post"}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-[#584237] hover:text-[#EE701E] transition-colors p-1 rounded-lg hover:bg-[#EE701E]/10"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Title */}
          <div>
            <label
              className="block text-xs font-semibold text-[#584237] uppercase tracking-wider mb-1.5"
              style={{ fontFamily: "Hanken Grotesk, sans-serif" }}
            >
              Title *
            </label>
            <input
              type="text"
              value={form.title}
              onChange={(e) => set("title", e.target.value)}
              placeholder="e.g. Books for All — 2025 Update"
              className={inputCls}
              style={{ fontFamily: "Hanken Grotesk, sans-serif" }}
              required
            />
          </div>

          {/* Slug */}
          <div>
            <label
              className="block text-xs font-semibold text-[#584237] uppercase tracking-wider mb-1.5"
              style={{ fontFamily: "Hanken Grotesk, sans-serif" }}
            >
              URL Slug *
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={form.slug}
                onChange={(e) => { setAutoSlug(false); set("slug", e.target.value); }}
                placeholder="books-for-all-2025"
                className={`${inputCls} flex-1 font-mono text-xs`}
              />
              <button
                type="button"
                onClick={() => { setAutoSlug(true); set("slug", slugify(form.title)); }}
                className="text-xs font-semibold text-[#EE701E] border border-[#EE701E] px-3 py-2 rounded-xl hover:bg-[#EE701E]/10 transition-colors whitespace-nowrap"
                style={{ fontFamily: "Hanken Grotesk, sans-serif" }}
              >
                Auto
              </button>
            </div>
            <p
              className="text-xs text-[#584237]/60 mt-1"
              style={{ fontFamily: "Hanken Grotesk, sans-serif" }}
            >
              URL: /blog/{form.slug || "your-slug-here"}
            </p>
          </div>

          {/* Category + Author */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label
                className="block text-xs font-semibold text-[#584237] uppercase tracking-wider mb-1.5"
                style={{ fontFamily: "Hanken Grotesk, sans-serif" }}
              >
                Category
              </label>
              <select
                value={form.category}
                onChange={(e) => set("category", e.target.value)}
                className={inputCls}
                style={{ fontFamily: "Hanken Grotesk, sans-serif" }}
              >
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
            <div>
              <label
                className="block text-xs font-semibold text-[#584237] uppercase tracking-wider mb-1.5"
                style={{ fontFamily: "Hanken Grotesk, sans-serif" }}
              >
                Author
              </label>
              <input
                type="text"
                value={form.author}
                onChange={(e) => set("author", e.target.value)}
                placeholder="Hope Rising Education"
                className={inputCls}
                style={{ fontFamily: "Hanken Grotesk, sans-serif" }}
              />
            </div>
          </div>

          {/* Cover image URL */}
          <div>
            <label
              className="block text-xs font-semibold text-[#584237] uppercase tracking-wider mb-1.5"
              style={{ fontFamily: "Hanken Grotesk, sans-serif" }}
            >
              Cover Image URL (optional)
            </label>
            <input
              type="url"
              value={form.coverImageUrl}
              onChange={(e) => set("coverImageUrl", e.target.value)}
              placeholder="https://example.com/image.jpg"
              className={inputCls}
              style={{ fontFamily: "Hanken Grotesk, sans-serif" }}
            />
            {form.coverImageUrl && (
              <img
                src={form.coverImageUrl}
                alt="Cover preview"
                className="mt-2 h-24 w-full object-cover rounded-xl border border-[#E7E8E9]"
                onError={(e) => (e.currentTarget.style.display = "none")}
              />
            )}
          </div>

          {/* Excerpt */}
          <div>
            <label
              className="block text-xs font-semibold text-[#584237] uppercase tracking-wider mb-1.5"
              style={{ fontFamily: "Hanken Grotesk, sans-serif" }}
            >
              Excerpt (short summary shown on listing cards)
            </label>
            <textarea
              value={form.excerpt}
              onChange={(e) => set("excerpt", e.target.value)}
              rows={2}
              maxLength={500}
              placeholder="A brief description of this story…"
              className={`${inputCls} resize-none`}
              style={{ fontFamily: "Hanken Grotesk, sans-serif" }}
            />
            <p
              className="text-xs text-[#584237]/60 mt-1 text-right"
              style={{ fontFamily: "Hanken Grotesk, sans-serif" }}
            >
              {form.excerpt.length}/500
            </p>
          </div>

          {/* Content */}
          <div>
            <label
              className="block text-xs font-semibold text-[#584237] uppercase tracking-wider mb-1.5"
              style={{ fontFamily: "Hanken Grotesk, sans-serif" }}
            >
              Content * (HTML supported)
            </label>
            <textarea
              value={form.content}
              onChange={(e) => set("content", e.target.value)}
              rows={12}
              placeholder="<p>Write your story here...</p>"
              className={`${inputCls} resize-y font-mono text-xs`}
              required
            />
            <p
              className="text-xs text-[#584237]/60 mt-1"
              style={{ fontFamily: "Hanken Grotesk, sans-serif" }}
            >
              You can use HTML tags like &lt;p&gt;, &lt;h2&gt;, &lt;strong&gt;, &lt;ul&gt;, &lt;li&gt;, &lt;img&gt;, &lt;a&gt; for rich formatting.
            </p>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <button
              type="submit"
              disabled={isPending}
              className="flex items-center gap-2 bg-[#EE701E] text-white px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-[#d4601a] transition-colors disabled:opacity-60"
              style={{ fontFamily: "Hanken Grotesk, sans-serif" }}
            >
              {isPending ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              {form.id ? "Save Changes" : "Create Draft"}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex items-center gap-2 border border-[#E7E8E9] text-[#584237] px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-[#F8F9FA] transition-colors"
              style={{ fontFamily: "Hanken Grotesk, sans-serif" }}
            >
              <X className="w-4 h-4" /> Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ── Post Row ──────────────────────────────────────────────────────────────────

type AdminPost = {
  id: number;
  slug: string;
  title: string;
  excerpt: string | null;
  coverImageUrl: string | null;
  category: string;
  author: string;
  published: boolean;
  publishedAt: Date | null;
  createdAt: Date;
  content: string;
};

function PostRow({
  post,
  onEdit,
  onRefresh,
}: {
  post: AdminPost;
  onEdit: (p: AdminPost) => void;
  onRefresh: () => void;
}) {
  const utils = trpc.useUtils();

  const togglePublish = trpc.blog.togglePublish.useMutation({
    onSuccess: (res) => {
      toast.success(res.published ? "Post published!" : "Post unpublished.");
      utils.blog.adminList.invalidate();
      utils.blog.list.invalidate();
      onRefresh();
    },
    onError: (err) => toast.error(`Failed: ${err.message}`),
  });

  const deleteMutation = trpc.blog.delete.useMutation({
    onSuccess: () => {
      toast.success("Post deleted.");
      utils.blog.adminList.invalidate();
      utils.blog.list.invalidate();
      onRefresh();
    },
    onError: (err) => toast.error(`Failed: ${err.message}`),
  });

  function handleDelete() {
    if (!confirm(`Delete "${post.title}"? This cannot be undone.`)) return;
    deleteMutation.mutate({ id: post.id });
  }

  return (
    <tr className="border-b border-[#E7E8E9] hover:bg-[#EE701E]/5 transition-colors">
      {/* Cover thumbnail */}
      <td className="px-4 py-3">
        <div className="w-14 h-10 rounded-lg overflow-hidden bg-[#0D215C]/10 flex items-center justify-center shrink-0">
          {post.coverImageUrl ? (
            <img src={post.coverImageUrl} alt="" className="w-full h-full object-cover" />
          ) : (
            <BookOpen className="w-5 h-5 text-[#0D215C]/30" />
          )}
        </div>
      </td>

      {/* Title + meta */}
      <td className="px-4 py-3">
        <p
          className="font-semibold text-[#0D215C] text-sm leading-snug line-clamp-1"
          style={{ fontFamily: "Manrope, sans-serif" }}
        >
          {post.title}
        </p>
        <p
          className="text-xs text-[#584237]/70 mt-0.5"
          style={{ fontFamily: "Hanken Grotesk, sans-serif" }}
        >
          /blog/{post.slug}
        </p>
      </td>

      {/* Category */}
      <td className="px-4 py-3 hidden sm:table-cell">
        <span
          className="text-xs font-semibold text-[#EE701E] bg-[#EE701E]/10 px-2 py-0.5 rounded-full"
          style={{ fontFamily: "Hanken Grotesk, sans-serif" }}
        >
          {post.category}
        </span>
      </td>

      {/* Status */}
      <td className="px-4 py-3 text-center">
        {post.published ? (
          <span className="inline-flex items-center gap-1 text-xs font-semibold text-green-700 bg-green-100 px-2 py-0.5 rounded-full">
            <CheckCircle className="w-3 h-3" /> Published
          </span>
        ) : (
          <span className="inline-flex items-center gap-1 text-xs font-semibold text-yellow-700 bg-yellow-100 px-2 py-0.5 rounded-full">
            <Clock className="w-3 h-3" /> Draft
          </span>
        )}
      </td>

      {/* Date */}
      <td className="px-4 py-3 hidden md:table-cell text-xs text-[#584237]/70" style={{ fontFamily: "Hanken Grotesk, sans-serif" }}>
        {post.publishedAt
          ? new Date(post.publishedAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
          : new Date(post.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
      </td>

      {/* Actions */}
      <td className="px-4 py-3">
        <div className="flex items-center gap-1.5 justify-end">
          {/* View live (only if published) */}
          {post.published && (
            <a
              href={`/blog/${post.slug}`}
              target="_blank"
              rel="noopener noreferrer"
              className="p-1.5 rounded-lg text-[#584237] hover:text-[#0D215C] hover:bg-[#0D215C]/10 transition-colors"
              title="View live post"
            >
              <ExternalLink className="w-4 h-4" />
            </a>
          )}

          {/* Publish toggle */}
          <button
            onClick={() => togglePublish.mutate({ id: post.id })}
            disabled={togglePublish.isPending}
            className={`p-1.5 rounded-lg transition-colors ${
              post.published
                ? "text-yellow-600 hover:bg-yellow-100"
                : "text-green-600 hover:bg-green-100"
            } disabled:opacity-50`}
            title={post.published ? "Unpublish" : "Publish"}
          >
            {post.published ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>

          {/* Edit */}
          <button
            onClick={() => onEdit(post)}
            className="p-1.5 rounded-lg text-[#EE701E] hover:bg-[#EE701E]/10 transition-colors"
            title="Edit post"
          >
            <Edit3 className="w-4 h-4" />
          </button>

          {/* Delete */}
          <button
            onClick={handleDelete}
            disabled={deleteMutation.isPending}
            className="p-1.5 rounded-lg text-red-500 hover:bg-red-100 transition-colors disabled:opacity-50"
            title="Delete post"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </td>
    </tr>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function AdminBlog() {
  const { user, loading: authLoading } = useAuth();
  const [showForm, setShowForm] = useState(false);
  const [editPost, setEditPost] = useState<AdminPost | null>(null);

  const { data: posts, isLoading, refetch } = trpc.blog.adminList.useQuery(undefined, {
    enabled: user?.role === "admin",
  });

  // ── Auth guards ────────────────────────────────────────────────────────────
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F8F9FA]">
        <RefreshCw className="w-8 h-8 text-[#EE701E] animate-spin" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F8F9FA]">
        <div className="max-w-sm text-center p-8">
          <ShieldCheck className="w-14 h-14 text-[#EE701E] mx-auto mb-4" />
          <h2 className="text-2xl font-extrabold text-[#0D215C] mb-2" style={{ fontFamily: "Manrope, sans-serif" }}>
            Sign In Required
          </h2>
          <Link href="/" className="btn-primary">Back to Home</Link>
        </div>
      </div>
    );
  }

  if (user.role !== "admin") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F8F9FA]">
        <div className="max-w-sm text-center p-8">
          <AlertTriangle className="w-14 h-14 text-[#EE701E] mx-auto mb-4" />
          <h2 className="text-2xl font-extrabold text-[#0D215C] mb-2" style={{ fontFamily: "Manrope, sans-serif" }}>
            Access Denied
          </h2>
          <Link href="/" className="btn-primary">Back to Home</Link>
        </div>
      </div>
    );
  }

  const allPosts = posts ?? [];
  const published = allPosts.filter((p) => p.published).length;
  const drafts = allPosts.filter((p) => !p.published).length;

  function openCreate() { setEditPost(null); setShowForm(true); }
  function openEdit(p: AdminPost) { setEditPost(p); setShowForm(true); }
  function closeForm() { setShowForm(false); setEditPost(null); }
  function onSaved() { closeForm(); refetch(); }

  return (
    <div className="min-h-screen bg-[#F8F9FA]">
      {/* Top bar */}
      <div className="bg-[#0D215C] text-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link
              href="/admin"
              className="flex items-center gap-1.5 text-white/60 hover:text-white transition-colors text-sm"
              style={{ fontFamily: "Hanken Grotesk, sans-serif" }}
            >
              <ArrowLeft className="w-4 h-4" /> Admin Dashboard
            </Link>
            <span className="text-white/30">|</span>
            <div className="flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-[#EE701E]" />
              <span className="font-extrabold text-lg" style={{ fontFamily: "Manrope, sans-serif" }}>
                Blog Manager
              </span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => refetch()}
              disabled={isLoading}
              className="flex items-center gap-1.5 text-sm text-white/70 hover:text-white transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`} />
            </button>
            <button
              onClick={openCreate}
              className="flex items-center gap-1.5 bg-[#EE701E] text-white px-4 py-2 rounded-xl text-sm font-semibold hover:bg-[#d4601a] transition-colors"
              style={{ fontFamily: "Hanken Grotesk, sans-serif" }}
            >
              <Plus className="w-4 h-4" /> New Post
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 space-y-6">
        {/* Stats row */}
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: "Total Posts", value: allPosts.length, color: "#0D215C" },
            { label: "Published", value: published, color: "#4BAF4F" },
            { label: "Drafts", value: drafts, color: "#EE701E" },
          ].map((s) => (
            <div key={s.label} className="bg-white rounded-2xl p-5 border border-[#E7E8E9]">
              <p
                className="text-xs font-semibold text-[#584237] uppercase tracking-wider mb-1"
                style={{ fontFamily: "Hanken Grotesk, sans-serif" }}
              >
                {s.label}
              </p>
              <p
                className="text-3xl font-extrabold"
                style={{ fontFamily: "Manrope, sans-serif", color: s.color }}
              >
                {s.value}
              </p>
            </div>
          ))}
        </div>

        {/* Posts table */}
        <div className="bg-white rounded-2xl border border-[#E7E8E9] overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b border-[#E7E8E9]">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-[#EE701E]/10 rounded-lg flex items-center justify-center">
                <BookOpen className="w-4 h-4 text-[#EE701E]" />
              </div>
              <h3
                className="font-extrabold text-[#0D215C]"
                style={{ fontFamily: "Manrope, sans-serif" }}
              >
                All Posts
              </h3>
            </div>
            <button
              onClick={openCreate}
              className="flex items-center gap-1.5 text-sm font-semibold text-[#EE701E] hover:text-[#d4601a] transition-colors"
              style={{ fontFamily: "Hanken Grotesk, sans-serif" }}
            >
              <Plus className="w-4 h-4" /> New Post
            </button>
          </div>

          {isLoading ? (
            <div className="p-8 space-y-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="h-14 bg-[#E7E8E9] rounded-xl animate-pulse" />
              ))}
            </div>
          ) : allPosts.length === 0 ? (
            <div className="py-20 text-center">
              <BookOpen className="w-12 h-12 text-[#E7E8E9] mx-auto mb-4" />
              <p
                className="text-[#584237] mb-6"
                style={{ fontFamily: "Hanken Grotesk, sans-serif" }}
              >
                No posts yet. Create your first impact story!
              </p>
              <button onClick={openCreate} className="btn-primary inline-flex items-center gap-2">
                <Plus className="w-4 h-4" /> Create First Post
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-[#F8F9FA] border-b border-[#E7E8E9]">
                    <th className="px-4 py-3 w-16" />
                    <th
                      className="text-left px-4 py-3 text-xs font-semibold text-[#584237] uppercase tracking-wider"
                      style={{ fontFamily: "Hanken Grotesk, sans-serif" }}
                    >
                      Title
                    </th>
                    <th
                      className="text-left px-4 py-3 text-xs font-semibold text-[#584237] uppercase tracking-wider hidden sm:table-cell"
                      style={{ fontFamily: "Hanken Grotesk, sans-serif" }}
                    >
                      Category
                    </th>
                    <th
                      className="text-center px-4 py-3 text-xs font-semibold text-[#584237] uppercase tracking-wider"
                      style={{ fontFamily: "Hanken Grotesk, sans-serif" }}
                    >
                      Status
                    </th>
                    <th
                      className="text-left px-4 py-3 text-xs font-semibold text-[#584237] uppercase tracking-wider hidden md:table-cell"
                      style={{ fontFamily: "Hanken Grotesk, sans-serif" }}
                    >
                      Date
                    </th>
                    <th className="px-4 py-3 w-36" />
                  </tr>
                </thead>
                <tbody>
                  {allPosts.map((post) => (
                    <PostRow
                      key={post.id}
                      post={post}
                      onEdit={openEdit}
                      onRefresh={refetch}
                    />
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Help note */}
        <p
          className="text-xs text-[#584237]/60 text-center"
          style={{ fontFamily: "Hanken Grotesk, sans-serif" }}
        >
          New posts are saved as drafts. Click the <Eye className="w-3 h-3 inline" /> icon to publish them to the public blog.
        </p>
      </div>

      {/* Form modal */}
      {showForm && (
        <PostForm
          initial={
            editPost
              ? {
                  id: editPost.id,
                  title: editPost.title,
                  slug: editPost.slug,
                  excerpt: editPost.excerpt ?? "",
                  content: editPost.content,
                  coverImageUrl: editPost.coverImageUrl ?? "",
                  category: editPost.category,
                  author: editPost.author,
                }
              : undefined
          }
          onClose={closeForm}
          onSaved={onSaved}
        />
      )}
    </div>
  );
}
