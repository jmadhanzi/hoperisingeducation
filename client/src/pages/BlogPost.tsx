/**
 * BlogPost — public single-post detail page (/blog/:slug)
 */
import { Link, useParams } from "wouter";
import { trpc } from "@/lib/trpc";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import {
  ArrowLeft,
  Calendar,
  User,
  Tag,
  Heart,
  RefreshCw,
  BookOpen,
  Share2,
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

// ── Page ──────────────────────────────────────────────────────────────────────

export default function BlogPost() {
  const params = useParams<{ slug: string }>();
  const slug = params.slug ?? "";

  const { data: post, isLoading, error } = trpc.blog.getBySlug.useQuery(
    { slug },
    { enabled: !!slug }
  );

  // ── Loading ────────────────────────────────────────────────────────────────
  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#F8F9FA]">
        <Navbar />
        <div className="pt-28 pb-20 flex items-center justify-center">
          <div className="text-center">
            <RefreshCw className="w-10 h-10 text-[#EE701E] animate-spin mx-auto mb-4" />
            <p className="text-[#584237]" style={{ fontFamily: "Hanken Grotesk, sans-serif" }}>
              Loading story…
            </p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  // ── Not found / error ──────────────────────────────────────────────────────
  if (error || !post) {
    return (
      <div className="min-h-screen bg-[#F8F9FA]">
        <Navbar />
        <div className="pt-28 pb-20 container mx-auto max-w-2xl text-center">
          <div className="w-20 h-20 bg-[#EE701E]/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <BookOpen className="w-10 h-10 text-[#EE701E]" />
          </div>
          <h1
            className="text-2xl font-extrabold text-[#0D215C] mb-3"
            style={{ fontFamily: "Manrope, sans-serif" }}
          >
            Story Not Found
          </h1>
          <p className="text-[#584237] mb-8" style={{ fontFamily: "Hanken Grotesk, sans-serif" }}>
            This story may have been moved or is no longer published.
          </p>
          <Link href="/blog" className="btn-primary inline-flex items-center gap-2">
            <ArrowLeft className="w-4 h-4" /> Back to Blog
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  // ── Main ───────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-[#F8F9FA]">
      <Navbar />

      {/* Hero / Cover */}
      <div className="relative bg-[#0D215C] pt-20">
        {post.coverImageUrl && (
          <div className="absolute inset-0 overflow-hidden">
            <img
              src={post.coverImageUrl}
              alt={post.title}
              className="w-full h-full object-cover opacity-25"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-[#0D215C]/60 via-[#0D215C]/80 to-[#0D215C]" />
          </div>
        )}
        <div className="relative z-10 container mx-auto max-w-3xl px-4 py-16">
          {/* Back link */}
          <Link
            href="/blog"
            className="inline-flex items-center gap-1.5 text-sm text-white/60 hover:text-white transition-colors mb-6"
            style={{ fontFamily: "Hanken Grotesk, sans-serif" }}
          >
            <ArrowLeft className="w-4 h-4" /> All Stories
          </Link>

          {/* Category */}
          <span
            className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold mb-4 ${categoryColor(post.category)}`}
          >
            <Tag className="w-3 h-3" />
            {post.category}
          </span>

          {/* Title */}
          <h1
            className="text-3xl md:text-4xl lg:text-5xl font-extrabold text-white leading-tight mb-6"
            style={{ fontFamily: "Manrope, sans-serif" }}
          >
            {post.title}
          </h1>

          {/* Meta row */}
          <div className="flex flex-wrap items-center gap-4 text-sm text-white/60">
            <span className="flex items-center gap-1.5">
              <User className="w-4 h-4" />
              {post.author}
            </span>
            {post.publishedAt && (
              <span className="flex items-center gap-1.5">
                <Calendar className="w-4 h-4" />
                {formatDate(post.publishedAt)}
              </span>
            )}
            <button
              onClick={() => {
                if (navigator.share) {
                  navigator.share({ title: post.title, url: window.location.href });
                } else {
                  navigator.clipboard.writeText(window.location.href);
                }
              }}
              className="flex items-center gap-1.5 hover:text-white transition-colors ml-auto"
              style={{ fontFamily: "Hanken Grotesk, sans-serif" }}
            >
              <Share2 className="w-4 h-4" /> Share
            </button>
          </div>
        </div>
      </div>

      {/* Article body */}
      <article className="container mx-auto max-w-3xl px-4 py-12">
        {/* Excerpt callout */}
        {post.excerpt && (
          <blockquote
            className="border-l-4 border-[#EE701E] pl-5 py-2 mb-8 text-lg text-[#584237] italic leading-relaxed"
            style={{ fontFamily: "Hanken Grotesk, sans-serif" }}
          >
            {post.excerpt}
          </blockquote>
        )}

        {/* Content — rendered as HTML */}
        <div
          className="prose prose-lg max-w-none
            prose-headings:font-extrabold prose-headings:text-[#0D215C]
            prose-p:text-[#584237] prose-p:leading-relaxed
            prose-a:text-[#EE701E] prose-a:no-underline hover:prose-a:underline
            prose-strong:text-[#0D215C]
            prose-ul:text-[#584237] prose-ol:text-[#584237]
            prose-blockquote:border-[#EE701E] prose-blockquote:text-[#584237]
            prose-img:rounded-xl prose-img:shadow-md"
          style={{ fontFamily: "Hanken Grotesk, sans-serif" }}
          dangerouslySetInnerHTML={{ __html: post.content }}
        />

        {/* Footer actions */}
        <div className="mt-12 pt-8 border-t border-[#E7E8E9] flex flex-col sm:flex-row items-center justify-between gap-4">
          <Link
            href="/blog"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#584237] hover:text-[#EE701E] transition-colors"
            style={{ fontFamily: "Hanken Grotesk, sans-serif" }}
          >
            <ArrowLeft className="w-4 h-4" /> Back to All Stories
          </Link>
          <Link href="/donate" className="btn-primary inline-flex items-center gap-2 text-sm">
            <Heart className="w-4 h-4 fill-white" /> Support This Work
          </Link>
        </div>
      </article>

      {/* CTA band */}
      <section className="bg-[#0D215C] py-14">
        <div className="container mx-auto text-center">
          <h2
            className="text-2xl font-extrabold text-white mb-3"
            style={{ fontFamily: "Manrope, sans-serif" }}
          >
            Inspired by this story?
          </h2>
          <p
            className="text-white/70 mb-6 max-w-lg mx-auto"
            style={{ fontFamily: "Hanken Grotesk, sans-serif" }}
          >
            Your donation funds the programs behind every story we share. Help us write the next chapter.
          </p>
          <div className="flex flex-wrap gap-3 justify-center">
            <Link href="/donate" className="btn-primary inline-flex items-center gap-2">
              <Heart className="w-4 h-4 fill-white" /> Donate Now
            </Link>
            <Link
              href="/blog"
              className="inline-flex items-center gap-2 px-5 py-2.5 border border-white/30 text-white rounded-xl text-sm font-semibold hover:bg-white/10 transition-colors"
              style={{ fontFamily: "Hanken Grotesk, sans-serif" }}
            >
              More Stories
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
