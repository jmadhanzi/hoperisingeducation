/**
 * Blog / Impact Stories — public listing page (/blog)
 * Shows published posts in a card grid with category filter and search.
 */
import { useState, useMemo } from "react";
import { Link } from "wouter";
import { trpc } from "@/lib/trpc";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import {
  Search,
  Calendar,
  User,
  Tag,
  ArrowRight,
  BookOpen,
  RefreshCw,
  Heart,
} from "lucide-react";

// ── Helpers ───────────────────────────────────────────────────────────────────

function formatDate(d: Date | string | null | undefined) {
  if (!d) return "";
  return new Date(d).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

const CATEGORY_COLORS: Record<string, string> = {
  "Impact Story": "bg-[#EE701E]/15 text-[#EE701E]",
  "News": "bg-[#0D215C]/15 text-[#0D215C]",
  "Program Update": "bg-[#4BAF4F]/15 text-[#4BAF4F]",
  "Announcement": "bg-purple-100 text-purple-700",
};

function categoryColor(cat: string) {
  return CATEGORY_COLORS[cat] ?? "bg-gray-100 text-gray-600";
}

// ── Post Card ─────────────────────────────────────────────────────────────────

type PostSummary = {
  id: number;
  slug: string;
  title: string;
  excerpt: string | null;
  coverImageUrl: string | null;
  category: string;
  author: string;
  publishedAt: Date | null;
};

function PostCard({ post }: { post: PostSummary }) {
  return (
    <Link href={`/blog/${post.slug}`} className="group block">
      <article className="bg-white rounded-2xl overflow-hidden border border-[#E7E8E9] card-shadow hover:shadow-lg transition-shadow duration-300 h-full flex flex-col">
        {/* Cover image */}
        <div className="relative h-48 bg-gradient-to-br from-[#0D215C] to-[#1a3a8a] overflow-hidden">
          {post.coverImageUrl ? (
            <img
              src={post.coverImageUrl}
              alt={post.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <BookOpen className="w-12 h-12 text-white/30" />
            </div>
          )}
          {/* Category badge */}
          <span
            className={`absolute top-3 left-3 px-2.5 py-1 rounded-full text-xs font-semibold ${categoryColor(post.category)}`}
          >
            {post.category}
          </span>
        </div>

        {/* Body */}
        <div className="p-5 flex flex-col flex-1">
          <h3
            className="font-extrabold text-[#0D215C] text-lg leading-snug mb-2 group-hover:text-[#EE701E] transition-colors line-clamp-2"
            style={{ fontFamily: "Manrope, sans-serif" }}
          >
            {post.title}
          </h3>
          {post.excerpt && (
            <p
              className="text-[#584237] text-sm leading-relaxed mb-4 line-clamp-3 flex-1"
              style={{ fontFamily: "Hanken Grotesk, sans-serif" }}
            >
              {post.excerpt}
            </p>
          )}

          {/* Meta */}
          <div className="flex items-center justify-between mt-auto pt-4 border-t border-[#E7E8E9]">
            <div className="flex items-center gap-3 text-xs text-[#584237]/70">
              <span className="flex items-center gap-1">
                <User className="w-3 h-3" />
                {post.author}
              </span>
              {post.publishedAt && (
                <span className="flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  {formatDate(post.publishedAt)}
                </span>
              )}
            </div>
            <span className="text-[#EE701E] text-xs font-semibold flex items-center gap-1 group-hover:gap-2 transition-all">
              Read <ArrowRight className="w-3 h-3" />
            </span>
          </div>
        </div>
      </article>
    </Link>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function Blog() {
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState<string | undefined>(undefined);
  const [offset, setOffset] = useState(0);
  const LIMIT = 9;

  // Debounce search slightly via useMemo
  const debouncedSearch = useMemo(() => search.trim() || undefined, [search]);

  const { data, isLoading, error, refetch, isFetching } = trpc.blog.list.useQuery(
    { category: activeCategory, search: debouncedSearch, limit: LIMIT, offset },
    { placeholderData: (prev) => prev }
  );

  const { data: categories } = trpc.blog.categories.useQuery();

  const posts = data?.posts ?? [];
  const total = data?.total ?? 0;
  const totalPages = Math.ceil(total / LIMIT);
  const currentPage = Math.floor(offset / LIMIT) + 1;

  function handleCategory(cat: string | undefined) {
    setActiveCategory(cat);
    setOffset(0);
  }

  function handleSearch(val: string) {
    setSearch(val);
    setOffset(0);
  }

  return (
    <div className="min-h-screen bg-[#F8F9FA]">
      <Navbar />

      {/* Hero */}
      <section className="bg-[#0D215C] pt-28 pb-16 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 right-20 w-64 h-64 bg-[#EE701E] rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-10 w-48 h-48 bg-white rounded-full blur-3xl" />
        </div>
        <div className="container mx-auto relative z-10 text-center">
          <p
            className="section-label text-[#EE701E] mb-3"
            style={{ fontFamily: "Hanken Grotesk, sans-serif" }}
          >
            Stories of Change
          </p>
          <h1
            className="text-4xl md:text-5xl font-extrabold text-white mb-4"
            style={{ fontFamily: "Manrope, sans-serif" }}
          >
            Blog &amp; Impact Stories
          </h1>
          <p
            className="text-white/70 text-lg max-w-2xl mx-auto"
            style={{ fontFamily: "Hanken Grotesk, sans-serif" }}
          >
            Real stories from the children, families, and communities we serve in Zimbabwe — proof that education changes lives.
          </p>
        </div>
      </section>

      {/* Filters */}
      <section className="bg-white border-b border-[#E7E8E9] sticky top-16 md:top-20 z-30">
        <div className="container mx-auto py-4 flex flex-col sm:flex-row items-center gap-3">
          {/* Search */}
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#584237]/50" />
            <input
              type="text"
              placeholder="Search stories…"
              value={search}
              onChange={(e) => handleSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-sm border border-[#E7E8E9] rounded-xl outline-none focus:border-[#EE701E] bg-[#F8F9FA] text-[#0D215C]"
              style={{ fontFamily: "Hanken Grotesk, sans-serif" }}
            />
          </div>

          {/* Category pills */}
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => handleCategory(undefined)}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-colors ${
                !activeCategory
                  ? "bg-[#EE701E] text-white"
                  : "bg-[#F8F9FA] text-[#584237] hover:bg-[#EE701E]/10 border border-[#E7E8E9]"
              }`}
              style={{ fontFamily: "Hanken Grotesk, sans-serif" }}
            >
              All
            </button>
            {(categories ?? []).map((cat) => (
              <button
                key={cat}
                onClick={() => handleCategory(cat)}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-colors flex items-center gap-1 ${
                  activeCategory === cat
                    ? "bg-[#EE701E] text-white"
                    : "bg-[#F8F9FA] text-[#584237] hover:bg-[#EE701E]/10 border border-[#E7E8E9]"
                }`}
                style={{ fontFamily: "Hanken Grotesk, sans-serif" }}
              >
                <Tag className="w-3 h-3" />
                {cat}
              </button>
            ))}
          </div>

          {/* Refresh */}
          <button
            onClick={() => refetch()}
            disabled={isFetching}
            className="text-[#584237] hover:text-[#EE701E] transition-colors p-2 rounded-lg hover:bg-[#EE701E]/10 disabled:opacity-50"
            aria-label="Refresh"
          >
            <RefreshCw className={`w-4 h-4 ${isFetching ? "animate-spin" : ""}`} />
          </button>
        </div>
      </section>

      {/* Content */}
      <section className="container mx-auto py-12">
        {/* Loading skeleton */}
        {isLoading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="bg-white rounded-2xl overflow-hidden border border-[#E7E8E9] animate-pulse">
                <div className="h-48 bg-[#E7E8E9]" />
                <div className="p-5 space-y-3">
                  <div className="h-4 bg-[#E7E8E9] rounded w-3/4" />
                  <div className="h-3 bg-[#E7E8E9] rounded w-full" />
                  <div className="h-3 bg-[#E7E8E9] rounded w-5/6" />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="text-center py-16">
            <p className="text-red-500 mb-4" style={{ fontFamily: "Hanken Grotesk, sans-serif" }}>
              Could not load posts: {error.message}
            </p>
            <button onClick={() => refetch()} className="btn-primary">
              Try Again
            </button>
          </div>
        )}

        {/* Empty state */}
        {!isLoading && !error && posts.length === 0 && (
          <div className="text-center py-20">
            <div className="w-20 h-20 bg-[#EE701E]/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <BookOpen className="w-10 h-10 text-[#EE701E]" />
            </div>
            <h2
              className="text-2xl font-extrabold text-[#0D215C] mb-3"
              style={{ fontFamily: "Manrope, sans-serif" }}
            >
              No stories yet
            </h2>
            <p
              className="text-[#584237] max-w-md mx-auto"
              style={{ fontFamily: "Hanken Grotesk, sans-serif" }}
            >
              {activeCategory || search
                ? "No posts match your filter. Try clearing the search or selecting a different category."
                : "Impact stories will appear here once they are published. Check back soon!"}
            </p>
            {(activeCategory || search) && (
              <button
                onClick={() => { handleCategory(undefined); setSearch(""); }}
                className="mt-6 btn-primary"
              >
                Clear Filters
              </button>
            )}
          </div>
        )}

        {/* Post grid */}
        {!isLoading && posts.length > 0 && (
          <>
            <div className="flex items-center justify-between mb-6">
              <p
                className="text-sm text-[#584237]"
                style={{ fontFamily: "Hanken Grotesk, sans-serif" }}
              >
                {total} {total === 1 ? "story" : "stories"} found
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {posts.map((post) => (
                <PostCard key={post.id} post={post} />
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-10">
                <button
                  onClick={() => setOffset(Math.max(0, offset - LIMIT))}
                  disabled={currentPage === 1}
                  className="px-4 py-2 text-sm font-semibold border border-[#E7E8E9] rounded-xl text-[#584237] hover:border-[#EE701E] hover:text-[#EE701E] transition-colors disabled:opacity-40"
                  style={{ fontFamily: "Hanken Grotesk, sans-serif" }}
                >
                  Previous
                </button>
                <span
                  className="text-sm text-[#584237] px-2"
                  style={{ fontFamily: "Hanken Grotesk, sans-serif" }}
                >
                  Page {currentPage} of {totalPages}
                </span>
                <button
                  onClick={() => setOffset(offset + LIMIT)}
                  disabled={currentPage === totalPages}
                  className="px-4 py-2 text-sm font-semibold border border-[#E7E8E9] rounded-xl text-[#584237] hover:border-[#EE701E] hover:text-[#EE701E] transition-colors disabled:opacity-40"
                  style={{ fontFamily: "Hanken Grotesk, sans-serif" }}
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </section>

      {/* CTA */}
      <section className="bg-[#0D215C] py-16">
        <div className="container mx-auto text-center">
          <h2
            className="text-2xl md:text-3xl font-extrabold text-white mb-4"
            style={{ fontFamily: "Manrope, sans-serif" }}
          >
            Be Part of the Next Story
          </h2>
          <p
            className="text-white/70 mb-8 max-w-xl mx-auto"
            style={{ fontFamily: "Hanken Grotesk, sans-serif" }}
          >
            Your donation directly funds the programs behind these impact stories. Every dollar sends a child to school.
          </p>
          <Link href="/donate" className="btn-primary inline-flex items-center gap-2">
            <Heart className="w-4 h-4 fill-white" /> Donate Today
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  );
}
