/* Hope Rising Education — Home Page
 * Design: "Warm Authority" — hero with dark overlay, impact stats, program cards, CTA sections
 */
import { useEffect, useMemo, useRef } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { Link } from "wouter";
import { ArrowRight, BookOpen, Users, Heart, Utensils, GraduationCap, Shield, TrendingUp, Star, ChevronRight, Megaphone, Play } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { PageSEO } from "@/lib/seo";
import { HOPE_RISING_MEDIA } from "@/lib/media";
import { trpc } from "@/lib/trpc";

const HERO_IMG = HOPE_RISING_MEDIA.aiClassroomMentor;
const DONATE_IMG = HOPE_RISING_MEDIA.studentWithPencils;
const IMPACT_IMG = HOPE_RISING_MEDIA.communityCelebration;

const stats = [
  { value: "500+", label: "Children Supported", icon: Users },
  { value: "12+", label: "Schools Reached", icon: GraduationCap },
  { value: "3", label: "Countries Active", icon: Shield },
  { value: "95%", label: "Attendance Improvement", icon: TrendingUp },
];

const programs = [
  {
    icon: BookOpen,
    title: "My Best Me Curriculum",
    desc: "A multimedia-rich, age-appropriate program focused on hope, resilience, psycho-social development, and emotional intelligence.",
    color: "#EE701E",
  },
  {
    icon: GraduationCap,
    title: "School Fees & Supplies",
    desc: "We cover school fees, uniforms, textbooks, and stationery so financial barriers never stand between a child and their education.",
    color: "#0D215C",
  },
  {
    icon: Users,
    title: "Tutoring & Mentorship",
    desc: "One-on-one and group tutoring sessions paired with dedicated mentors who guide children through academic and personal challenges.",
    color: "#4BAF4F",
  },
  {
    icon: Utensils,
    title: "Nutrition & Meals",
    desc: "Warm, nutritious meals provided daily to ensure children can focus on learning rather than hunger.",
    color: "#EE701E",
  },
  {
    icon: Heart,
    title: "Psycho-Social Support",
    desc: "Safe spaces and trained counselors help children process trauma, build resilience, and develop healthy peer relationships.",
    color: "#0D215C",
  },
  {
    icon: Shield,
    title: "Safe Learning Environments",
    desc: "We build and maintain safe, welcoming classrooms equipped with the tools children need to thrive academically.",
    color: "#4BAF4F",
  },
];

const projects = [
  {
    title: "Books for All",
    date: "Active — 2026",
    desc: "Delivering books and safe learning spaces to children across Chiredzi and Chipinge.",
    goal: 5000,
    raised: 3750,
    img: HOPE_RISING_MEDIA.studentsWithBooks,
  },
  {
    title: "Tools for Success",
    date: "Active — 2026",
    desc: "Providing every pencil, notebook, and eraser needed for a brighter future.",
    goal: 2500,
    raised: 1250,
    img: HOPE_RISING_MEDIA.hopeRisingSupplies,
  },
  {
    title: "Build a School",
    date: "Active — 2026",
    desc: "A bold effort to build a safe, welcoming school that will give local children reliable access to education.",
    goal: 100000,
    raised: 65000,
    img: HOPE_RISING_MEDIA.classroomBooks,
  },
];

function CountUp({ target, suffix = "", label = "" }: { target: number; suffix?: string; label?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          let start = 0;
          const duration = 1500;
          const step = (timestamp: number) => {
            if (!start) start = timestamp;
            const progress = Math.min((timestamp - start) / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3);
            const val = Math.floor(eased * target) + suffix;
            el.textContent = val;
            if (progress < 1) requestAnimationFrame(step);
            else el.setAttribute("aria-label", `${target}${suffix}${label ? " " + label : ""}`);
          };
          requestAnimationFrame(step);
          observer.disconnect();
        }
      },
      { threshold: 0.5 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [target, suffix, label]);
  return <span ref={ref} aria-live="polite" aria-atomic="true">0{suffix}</span>;
}

export default function Home() {
  // The userAuth hooks provides authentication state
  // To implement login/logout functionality, simply call logout() or redirect to getLoginUrl()
  const { user } = useAuth();
  const { data: homeContent } = trpc.content.pageContent.useQuery({ page: "home" });
  const { data: announcements } = trpc.content.activeAnnouncements.useQuery();
  const { data: featuredVideo } = trpc.content.featuredVideo.useQuery();

  const pageCopy = useMemo(() => {
    const published = new Map((homeContent ?? []).map(block => [block.contentKey, block.value]));
    return {
      heroEyebrow: published.get("hero-eyebrow") || "500+ children in Zimbabwe are in school because of donors like you",
      heroTitle: published.get("hero-title") || "Empowering Children Through Education",
      heroBody: published.get("hero-body") || "Join us in providing access to quality education for vulnerable children in Zimbabwe. Together, we can break the cycle of poverty and build a future full of hope.",
      impactTitle: published.get("impact-title") || "Helping Education for Hope Rising",
    };
  }, [homeContent]);

  const revealRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = revealRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) entry.target.classList.add("visible");
        });
      },
      { threshold: 0.1, rootMargin: "0px 0px -40px 0px" }
    );
    el.querySelectorAll(".fade-up").forEach((e) => observer.observe(e));
    return () => observer.disconnect();
  }, []);

  return (
    <div className="min-h-screen" ref={revealRef}>
      <PageSEO path="/" />
      <Navbar />

      {/* ── HERO ── */}
      <section id="main-content" className="relative min-h-screen flex items-center justify-center overflow-hidden" aria-label="Hero — Empowering Children Through Education">
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: `url('${HERO_IMG}')` }}
          role="img"
          aria-label="Teacher supporting a Black African student in a Zimbabwean classroom"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[#0D215C]/70 via-[#0D215C]/60 to-[#0D215C]/85" />
        <div className="relative z-10 container mx-auto text-center text-white pt-20 pb-32">
          <p className="section-label text-[#EE701E] mb-4 fade-up stagger-1">
            {pageCopy.heroEyebrow}
          </p>
          <h1
            className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold leading-tight mb-6 fade-up stagger-2"
            style={{ fontFamily: "Manrope, sans-serif", letterSpacing: "-0.02em" }}
          >
            {pageCopy.heroTitle}
          </h1>
          <p
            className="text-lg md:text-xl text-white/80 max-w-2xl mx-auto mb-10 fade-up stagger-3"
            style={{ fontFamily: "Hanken Grotesk, sans-serif" }}
          >
            {pageCopy.heroBody}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center fade-up stagger-4">
            <Link href="/donate" className="btn-primary text-sm py-4 px-8">
              Donate Now
            </Link>
            <Link href="/programs" className="btn-outline-orange text-sm py-4 px-8 border-white text-white hover:bg-white hover:text-[#0D215C]">
              Our Programs
            </Link>
          </div>
        </div>
        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-white/50 animate-bounce" aria-hidden="true">
          <div className="w-0.5 h-8 bg-white/30 rounded-full" />
        </div>
      </section>

      {announcements && announcements.length > 0 && (
        <section className="border-y border-[#DFC0B2]/50 bg-[#FFF8F2] py-5" aria-label="Latest announcements">
          <div className="container mx-auto space-y-3">
            {announcements.map((announcement) => (
              <article key={announcement.id} className="flex flex-col gap-3 rounded-xl bg-white px-4 py-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">
                <div className="flex min-w-0 items-start gap-3">
                  <span className="mt-0.5 rounded-lg bg-[#EE701E]/10 p-2 text-[#EE701E]" aria-hidden="true"><Megaphone className="h-4 w-4" /></span>
                  <div>
                    <h2 className="font-bold text-[#0D215C]" style={{ fontFamily: "Manrope, sans-serif" }}>{announcement.title}</h2>
                    <p className="mt-1 text-sm text-[#584237]" style={{ fontFamily: "Hanken Grotesk, sans-serif" }}>{announcement.body}</p>
                  </div>
                </div>
                {announcement.ctaLabel && announcement.ctaUrl ? (
                  <a href={announcement.ctaUrl} target={announcement.ctaUrl.startsWith("http") ? "_blank" : undefined} rel={announcement.ctaUrl.startsWith("http") ? "noreferrer" : undefined} className="inline-flex shrink-0 items-center gap-2 text-sm font-bold text-[#0D215C] hover:text-[#EE701E]">
                    {announcement.ctaLabel} <ArrowRight className="h-4 w-4" />
                  </a>
                ) : null}
              </article>
            ))}
          </div>
        </section>
      )}

      {/* ── IMPACT STATS ── */}
      <section className="bg-[#0D215C] py-16 relative overflow-hidden">
        <div className="absolute -right-20 -top-20 w-80 h-80 bg-[#EE701E]/10 rounded-full blur-3xl" />
        <div className="container mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map(({ value, label, icon: Icon }, i) => {
              const num = parseInt(value.replace(/\D/g, ""));
              const suffix = value.replace(/\d/g, "");
              return (
                <div key={label} className={`text-center fade-up stagger-${i + 1}`}>
                  <div className="w-12 h-12 bg-[#EE701E]/20 rounded-xl flex items-center justify-center mx-auto mb-3">
                    <Icon className="w-6 h-6 text-[#EE701E]" aria-hidden="true" />
                  </div>
                  <div
                    className="text-3xl md:text-4xl font-extrabold text-white mb-1"
                    style={{ fontFamily: "Manrope, sans-serif" }}
                  >
                    <CountUp target={num} suffix={suffix} label={label} />
                  </div>
                  <p
                    className="text-white/60 text-sm"
                    style={{ fontFamily: "Hanken Grotesk, sans-serif" }}
                  >
                    {label}
                  </p>
                </div>
              );
            })}
          </div>
          <p className="text-center text-white/30 text-xs mt-8" style={{ fontFamily: "Hanken Grotesk, sans-serif" }}>
            Based on 12-month program data, 2023–2024. Updated annually.
          </p>
        </div>
      </section>

      {/* ── PROGRAMS ── */}
      <section className="py-20 bg-[#F8F9FA]">
        <div className="container mx-auto">
          <div className="text-center mb-14 fade-up">
            <p className="section-label">What We Do</p>
            <span className="orange-underline mx-auto" />
            <h2
              className="text-3xl md:text-4xl font-extrabold text-[#0D215C]"
              style={{ fontFamily: "Manrope, sans-serif" }}
            >
              Our Programs &amp; Services
            </h2>
            <p
              className="text-[#584237] mt-4 max-w-2xl mx-auto"
              style={{ fontFamily: "Hanken Grotesk, sans-serif" }}
            >
              Holistic support that addresses every barrier standing between a child and a quality education.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {programs.map(({ icon: Icon, title, desc, color }, i) => (
              <div
                key={title}
                className={`bg-white rounded-2xl p-6 card-shadow hover:card-shadow-hover transition-all duration-300 hover:-translate-y-1 fade-up stagger-${(i % 3) + 1}`}
              >
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center mb-4"
                  style={{ backgroundColor: color + "20" }}
                >
                  <Icon className="w-6 h-6" style={{ color }} />
                </div>
                <h3
                  className="font-bold text-lg text-[#0D215C] mb-2"
                  style={{ fontFamily: "Manrope, sans-serif" }}
                >
                  {title}
                </h3>
                <p
                  className="text-[#584237] text-sm leading-relaxed"
                  style={{ fontFamily: "Hanken Grotesk, sans-serif" }}
                >
                  {desc}
                </p>
              </div>
            ))}
          </div>
          <div className="text-center mt-10 fade-up">
            <Link href="/programs" className="btn-navy inline-flex items-center gap-2">
              View All Programs <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* ── RECENT PROJECTS ── */}
      <section className="py-20 bg-white">
        <div className="container mx-auto">
          <div className="text-center mb-14 fade-up">
            <p className="section-label">Help the Children</p>
            <span className="orange-underline mx-auto" />
            <h2
              className="text-3xl md:text-4xl font-extrabold text-[#0D215C]"
              style={{ fontFamily: "Manrope, sans-serif" }}
            >
              Recent Projects
            </h2>
            <p
              className="text-[#584237] mt-4 max-w-xl mx-auto"
              style={{ fontFamily: "Hanken Grotesk, sans-serif" }}
            >
              Transforming lives through focused educational initiatives across local communities.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {projects.map(({ title, date, desc, goal, raised, img }, i) => {
              const pct = Math.round((raised / goal) * 100);
              return (
                <div
                  key={title}
                  className={`bg-white rounded-2xl overflow-hidden card-shadow hover:card-shadow-hover transition-all duration-300 hover:-translate-y-1 group fade-up stagger-${i + 1}`}
                >
                  <div className="h-48 overflow-hidden">
                    <img
                      src={img}
                      alt={`${title} — Hope Rising Education project`}
                      loading="lazy"
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                  </div>
                  <div className="p-5">
                    <span
                      className="text-[#EE701E] text-xs font-semibold tracking-wider uppercase"
                      style={{ fontFamily: "Hanken Grotesk, sans-serif" }}
                    >
                      {date}
                    </span>
                    <h4
                      className="font-bold text-lg text-[#0D215C] mt-1 mb-2"
                      style={{ fontFamily: "Manrope, sans-serif" }}
                    >
                      {title}
                    </h4>
                    <p
                      className="text-[#584237] text-sm mb-4 leading-relaxed"
                      style={{ fontFamily: "Hanken Grotesk, sans-serif" }}
                    >
                      {desc}
                    </p>
                    <div className="h-2 w-full bg-[#E7E8E9] rounded-full overflow-hidden mb-2">
                      <div
                        className="h-full bg-[#EE701E] rounded-full transition-all duration-1000"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <div className="flex justify-between items-center">
                      <span
                        className="text-xs text-[#584237]"
                        style={{ fontFamily: "Hanken Grotesk, sans-serif" }}
                      >
                        ${raised.toLocaleString()} raised of ${goal.toLocaleString()}
                      </span>
                      <Link href="/donate" className="btn-primary text-xs py-1.5 px-4">
                        Donate
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {featuredVideo && (
        <section id="media" className="bg-[#F8F9FA] py-20" aria-labelledby="media-heading">
          <div className="container mx-auto">
            <div className="mx-auto mb-10 max-w-2xl text-center">
              <p className="section-label">In Our Community</p>
              <span className="orange-underline mx-auto" />
              <h2 id="media-heading" className="text-3xl font-extrabold text-[#0D215C] md:text-4xl" style={{ fontFamily: "Manrope, sans-serif" }}>Stories of Hope Rising</h2>
              <p className="mt-4 text-[#584237]" style={{ fontFamily: "Hanken Grotesk, sans-serif" }}>Watch the latest message from the Hope Rising Education community.</p>
            </div>
            <div className="mx-auto max-w-4xl overflow-hidden rounded-2xl bg-[#0D215C] shadow-xl">
              <video controls playsInline preload="metadata" poster={featuredVideo.thumbnailUrl || undefined} className="aspect-video w-full bg-black" aria-label={featuredVideo.title}>
                <source src={featuredVideo.videoUrl} />
                Your browser does not support embedded video. <a className="text-white underline" href={featuredVideo.videoUrl}>Open the video</a>.
              </video>
              <div className="p-5 text-white sm:p-7">
                <div className="flex items-start gap-3"><span className="rounded-lg bg-[#EE701E] p-2" aria-hidden="true"><Play className="h-5 w-5 fill-current" /></span><div><h3 className="text-xl font-extrabold" style={{ fontFamily: "Manrope, sans-serif" }}>{featuredVideo.title}</h3>{featuredVideo.description ? <p className="mt-2 text-sm leading-relaxed text-white/75" style={{ fontFamily: "Hanken Grotesk, sans-serif" }}>{featuredVideo.description}</p> : null}</div></div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ── IMPACT SECTION ── */}
      <section className="py-20 bg-[#0D215C] relative overflow-hidden">
        <div className="absolute -left-20 -bottom-20 w-80 h-80 bg-[#EE701E]/10 rounded-full blur-3xl" />
        <div className="container mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="fade-up">
              <p className="section-label text-[#EE701E]">Our Impact</p>
              <span className="orange-underline" />
              <h2
                className="text-3xl md:text-4xl font-extrabold text-white mb-5"
                style={{ fontFamily: "Manrope, sans-serif" }}
              >
                {pageCopy.impactTitle}
              </h2>
              <p
                className="text-white/70 leading-relaxed mb-6"
                style={{ fontFamily: "Hanken Grotesk, sans-serif" }}
              >
                Your support can change lives. Join us in giving hope and opportunity to vulnerable children through donating and volunteering. Every contribution — large or small — directly funds a child's education.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link href="/donate" className="btn-primary">
                  Donate Now
                </Link>
                <Link href="/impact" className="btn-outline-orange border-white text-white hover:bg-white hover:text-[#0D215C]">
                  See Our Impact
                </Link>
              </div>
            </div>
            <div className="relative fade-up stagger-2">
              <img
                src={IMPACT_IMG}
                alt="Hope Rising Education children celebrating with gift bags in Zimbabwe"
                loading="lazy"
                className="w-full rounded-2xl object-cover h-72 md:h-96"
              />
              <div className="absolute -bottom-4 -left-4 bg-[#EE701E] text-white rounded-xl p-4 card-shadow">
                <div className="flex items-center gap-2">
                  <Star className="w-5 h-5 fill-white" />
                  <div>
                    <p className="font-bold text-sm" style={{ fontFamily: "Manrope, sans-serif" }}>Any amount helps</p>
                    <p className="text-xs text-white/80" style={{ fontFamily: "Hanken Grotesk, sans-serif" }}>100% goes to children</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── DONATE CTA ── */}
      <section className="py-20 bg-[#F8F9FA]">
        <div className="container mx-auto">
          <div className="bg-[#0D215C] rounded-3xl overflow-hidden relative">
            <div className="absolute inset-0">
              <img src={DONATE_IMG} alt="A Zimbabwean student holding pencils in front of a classroom chalkboard" className="w-full h-full object-cover opacity-20" />
            </div>
            <div className="relative z-10 p-10 md:p-16 text-center">
              <p className="section-label text-[#EE701E] fade-up">Make a Difference Today</p>
              <h2
                className="text-3xl md:text-5xl font-extrabold text-white mt-3 mb-5 fade-up stagger-2"
                style={{ fontFamily: "Manrope, sans-serif" }}
              >
                Every Child Deserves<br />a Chance to Learn
              </h2>
              <p
                className="text-white/70 max-w-xl mx-auto mb-8 fade-up stagger-3"
                style={{ fontFamily: "Hanken Grotesk, sans-serif" }}
              >
                Your donation directly funds school fees, meals, books, and mentorship for vulnerable children in Zimbabwe. Join hundreds of donors who are changing lives.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center fade-up stagger-4">
                <Link href="/donate" className="btn-primary text-sm py-4 px-10">
                  Donate Now
                </Link>
                <Link href="/get-involved" className="btn-outline-orange border-white text-white hover:bg-white hover:text-[#0D215C] text-sm py-4 px-10">
                  Become a Volunteer
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── TESTIMONIAL ── */}
      <section className="py-20 bg-white">
        <div className="container mx-auto">
          <div className="text-center mb-14 fade-up">
            <p className="section-label">Our Background</p>
            <span className="orange-underline mx-auto" />
            <h2
              className="text-3xl md:text-4xl font-extrabold text-[#0D215C]"
              style={{ fontFamily: "Manrope, sans-serif" }}
            >
              Words from Our Founders
            </h2>
          </div>
          <div className="max-w-3xl mx-auto bg-[#F8F9FA] rounded-2xl p-8 md:p-12 border border-[#DFC0B2]/50 fade-up">
            <div className="text-[#EE701E] text-5xl font-serif leading-none mb-4">"</div>
            <p
              className="text-[#0D215C] text-lg md:text-xl italic leading-relaxed mb-6"
              style={{ fontFamily: "Hanken Grotesk, sans-serif" }}
            >
              Education is not just about academics — it is about building character, hope, and a future. We believe that with the right support, every child in Zimbabwe can rise above their circumstances and become the best version of themselves.
            </p>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-[#EE701E] flex items-center justify-center font-extrabold text-white text-lg" style={{ fontFamily: "Manrope, sans-serif" }}>
                GK
              </div>
              <div>
                <p className="font-bold text-[#0D215C]" style={{ fontFamily: "Manrope, sans-serif" }}>
                  Bishop Gladmore Konono
                </p>
                <p className="text-[#EE701E] text-sm" style={{ fontFamily: "Hanken Grotesk, sans-serif" }}>
                  Co-Founder, Hope Rising Education
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── GET INVOLVED TEASER ── */}
      <section className="py-16 bg-[#EE701E]">
        <div className="container mx-auto text-center">
          <h2
            className="text-2xl md:text-3xl font-extrabold text-white mb-4 fade-up"
            style={{ fontFamily: "Manrope, sans-serif" }}
          >
            Ready to Change a Life?
          </h2>
          <p
            className="text-white/80 mb-6 fade-up stagger-2"
            style={{ fontFamily: "Hanken Grotesk, sans-serif" }}
          >
            Volunteer, sponsor a child, or advocate for education access in your community.
          </p>
          <Link
            href="/get-involved"
            className="inline-flex items-center gap-2 bg-white text-[#EE701E] font-bold px-8 py-3 rounded-lg hover:bg-[#0D215C] hover:text-white transition-all duration-200 active:scale-[0.97] fade-up stagger-3"
            style={{ fontFamily: "Hanken Grotesk, sans-serif" }}
          >
            Get Involved <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  );
}
