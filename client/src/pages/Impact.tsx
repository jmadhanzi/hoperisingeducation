/* Hope Rising Education — Impact Page */
import { useEffect, useRef } from "react";
import { Link } from "wouter";
import { TrendingUp, Users, BookOpen, Heart, Award, BarChart3 } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { PageSEO } from "@/lib/seo";

const IMPACT_IMG = "/manus-storage/hope-rising-pencils-books_1028d791.jpg";

const stats = [
  { value: 500, suffix: "+", label: "Children Supported", icon: Users, color: "#EE701E" },
  { value: 12, suffix: "+", label: "Schools Reached", icon: BookOpen, color: "#0D215C" },
  { value: 95, suffix: "%", label: "Attendance Improvement", icon: TrendingUp, color: "#4BAF4F" },
  { value: 3, suffix: "", label: "Countries Active", icon: Award, color: "#EE701E" },
  { value: 200, suffix: "+", label: "Volunteer Hours/Month", icon: Heart, color: "#0D215C" },
  { value: 87, suffix: "%", label: "Grade Improvement Rate", icon: BarChart3, color: "#4BAF4F" },
];

const stories = [
  {
    name: "Chiedza, Age 12",
    location: "Chiredzi, Zimbabwe",
    initial: "C",
    color: "#EE701E",
    before: "Chiedza was missing school 3 days a week due to inability to pay fees and lack of food. Her grades were failing and she was at risk of dropping out permanently.",
    after: "After joining Hope Rising Education, Chiedza's fees were covered, she receives daily meals, and has a dedicated mentor. She now attends every day and ranked 3rd in her class.",
  },
  {
    name: "Takudzwa, Age 10",
    location: "Chipinge, Zimbabwe",
    initial: "T",
    color: "#0D215C",
    before: "Takudzwa struggled with severe anxiety and had difficulty forming friendships. He was often disruptive in class and his teacher feared he would be expelled.",
    after: "Through the My Best Me curriculum and weekly counseling sessions, Takudzwa developed emotional regulation skills. He is now a class leader and helps other students.",
  },
  {
    name: "Rutendo, Age 14",
    location: "Chiredzi, Zimbabwe",
    initial: "R",
    color: "#4BAF4F",
    before: "Rutendo was the eldest of 6 siblings and was expected to stay home to care for younger children. She had not attended school in 2 years and had lost hope of continuing her education.",
    after: "Hope Rising Education worked with her family to provide childcare support and enrolled Rutendo in an accelerated learning program. She is now preparing for her O-Level examinations.",
  },
];

const outcomes = [
  { label: "Reduced Absenteeism", before: 35, after: 5, unit: "% absent" },
  { label: "Grade Improvement", before: 42, after: 87, unit: "% improving" },
  { label: "Emotional Wellbeing", before: 28, after: 79, unit: "% positive score" },
  { label: "Peer Relationships", before: 31, after: 82, unit: "% healthy relationships" },
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

export default function Impact() {
  const revealRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = revealRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      (entries) => entries.forEach((e) => { if (e.isIntersecting) e.target.classList.add("visible"); }),
      { threshold: 0.1, rootMargin: "0px 0px -40px 0px" }
    );
    el.querySelectorAll(".fade-up").forEach((e) => observer.observe(e));
    return () => observer.disconnect();
  }, []);

  return (
    <div className="min-h-screen" ref={revealRef}>
      <PageSEO
        title="Our Impact"
        description="Measurable results: 500+ children supported, 95% attendance improvement, 87% grade improvement rate. See how Hope Rising Education transforms lives in Zimbabwe."
        path="/impact"
      />
      <Navbar />

      {/* Hero */}
      <section id="main-content" className="relative h-72 md:h-96 flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url('${IMPACT_IMG}')` }} />
        <div className="absolute inset-0 bg-gradient-to-b from-[#0D215C]/70 to-[#0D215C]/85" />
        <div className="relative z-10 text-center text-white pt-16">
          <p className="text-xs text-white/60 mb-2" style={{ fontFamily: "Hanken Grotesk, sans-serif" }}>Home &rsaquo; Impact</p>
          <h1 className="text-4xl md:text-5xl font-extrabold" style={{ fontFamily: "Manrope, sans-serif" }}>
            Our <span className="text-[#EE701E]">Impact</span>
          </h1>
          <p className="text-white/70 mt-3 max-w-xl mx-auto px-4" style={{ fontFamily: "Hanken Grotesk, sans-serif" }}>
            Measurable results that prove education changes lives — and communities.
          </p>
        </div>
      </section>

      {/* Stats Grid */}
      <section className="py-20 bg-[#F8F9FA]">
        <div className="container mx-auto">
          <div className="text-center mb-14 fade-up">
            <p className="section-label">By the Numbers</p>
            <span className="orange-underline mx-auto" />
            <h2 className="text-3xl md:text-4xl font-extrabold text-[#0D215C]" style={{ fontFamily: "Manrope, sans-serif" }}>
              Measurable Results
            </h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
            {stats.map(({ value, suffix, label, icon: Icon, color }, i) => (
              <div key={label} className={`bg-white rounded-2xl p-6 card-shadow text-center fade-up stagger-${(i % 3) + 1}`}>
                <div className="w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-3" style={{ backgroundColor: color + "20" }}>
                  <Icon className="w-6 h-6" style={{ color }} />
                </div>
                <div className="text-3xl md:text-4xl font-extrabold text-[#0D215C] mb-1" style={{ fontFamily: "Manrope, sans-serif" }}>
                  <CountUp target={value} suffix={suffix} label={label} />
                </div>
                <p className="text-[#584237] text-sm" style={{ fontFamily: "Hanken Grotesk, sans-serif" }}>{label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Before/After Outcomes */}
      <section className="py-20 bg-white">
        <div className="container mx-auto">
          <div className="text-center mb-14 fade-up">
            <p className="section-label">Data Visualization</p>
            <span className="orange-underline mx-auto" />
            <h2 className="text-3xl md:text-4xl font-extrabold text-[#0D215C]" style={{ fontFamily: "Manrope, sans-serif" }}>
              Before &amp; After: Program Outcomes
            </h2>
            <p className="text-[#584237] mt-4 max-w-xl mx-auto" style={{ fontFamily: "Hanken Grotesk, sans-serif" }}>
              Measured outcomes from children enrolled in Hope Rising Education programs for 12+ months.
            </p>
          </div>
          <div className="space-y-8 max-w-3xl mx-auto">
            {outcomes.map(({ label, before, after, unit }, i) => (
              <div key={label} className={`fade-up stagger-${i + 1}`}>
                <div className="flex justify-between items-center mb-2">
                  <span className="font-bold text-[#0D215C]" style={{ fontFamily: "Manrope, sans-serif" }}>{label}</span>
                  <span className="text-xs text-[#584237]" style={{ fontFamily: "Hanken Grotesk, sans-serif" }}>{unit}</span>
                </div>
                <div className="space-y-2">
                  <div>
                    <div className="flex justify-between text-xs text-[#584237] mb-1" style={{ fontFamily: "Hanken Grotesk, sans-serif" }}>
                      <span>Before</span><span>{before}%</span>
                    </div>
                    <div className="h-3 bg-[#E7E8E9] rounded-full overflow-hidden">
                      <div className="h-full bg-[#DFC0B2] rounded-full" style={{ width: `${before}%` }} />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-xs text-[#584237] mb-1" style={{ fontFamily: "Hanken Grotesk, sans-serif" }}>
                      <span>After</span><span>{after}%</span>
                    </div>
                    <div className="h-3 bg-[#E7E8E9] rounded-full overflow-hidden">
                      <div className="h-full bg-[#EE701E] rounded-full transition-all duration-1000" style={{ width: `${after}%` }} />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Student Stories */}
      <section className="py-20 bg-[#F8F9FA]">
        <div className="container mx-auto">
          <div className="text-center mb-14 fade-up">
            <p className="section-label">Real Lives Changed</p>
            <span className="orange-underline mx-auto" />
            <h2 className="text-3xl md:text-4xl font-extrabold text-[#0D215C]" style={{ fontFamily: "Manrope, sans-serif" }}>
              Student Stories
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {stories.map(({ name, location, initial, color, before, after }, i) => (
              <div key={name} className={`bg-white rounded-2xl overflow-hidden card-shadow fade-up stagger-${i + 1}`}>
                {/* Colored banner with initial — no stock photos of children */}
                <div
                  className="h-32 flex items-center justify-center"
                  style={{ backgroundColor: color }}
                  aria-hidden="true"
                >
                  <span
                    className="text-white font-extrabold"
                    style={{ fontSize: "4rem", fontFamily: "Manrope, sans-serif", opacity: 0.4 }}
                  >
                    {initial}
                  </span>
                </div>
                <div className="p-6">
                  <h3 className="font-bold text-lg text-[#0D215C] mb-0.5" style={{ fontFamily: "Manrope, sans-serif" }}>{name}</h3>
                  <p className="text-[#EE701E] text-xs font-semibold mb-4" style={{ fontFamily: "Hanken Grotesk, sans-serif" }}>{location}</p>
                  <div className="space-y-3">
                    <div className="bg-[#ffdad6]/30 rounded-lg p-3">
                      <p className="text-xs font-bold text-[#93000a] mb-1" style={{ fontFamily: "Hanken Grotesk, sans-serif" }}>BEFORE</p>
                      <p className="text-[#584237] text-sm leading-relaxed" style={{ fontFamily: "Hanken Grotesk, sans-serif" }}>{before}</p>
                    </div>
                    <div className="bg-[#4BAF4F]/10 rounded-lg p-3">
                      <p className="text-xs font-bold text-[#006e1c] mb-1" style={{ fontFamily: "Hanken Grotesk, sans-serif" }}>AFTER</p>
                      <p className="text-[#584237] text-sm leading-relaxed" style={{ fontFamily: "Hanken Grotesk, sans-serif" }}>{after}</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Community Transformation */}
      <section className="py-20 bg-[#0D215C] relative overflow-hidden">
        <div className="absolute -right-20 -top-20 w-80 h-80 bg-[#EE701E]/10 rounded-full blur-3xl" />
        <div className="container mx-auto">
          <div className="text-center mb-12 fade-up">
            <p className="section-label text-[#EE701E]">Community Transformation</p>
            <span className="orange-underline mx-auto" />
            <h2 className="text-3xl md:text-4xl font-extrabold text-white" style={{ fontFamily: "Manrope, sans-serif" }}>
              Beyond the Classroom
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[
              { title: "Family Empowerment", desc: "When children succeed in school, entire families benefit. Parents report increased confidence in their children's futures and greater community cohesion." },
              { title: "Economic Impact", desc: "Educated children become economically productive adults. Our programs are an investment in Zimbabwe's future workforce and national development." },
              { title: "Gender Equity", desc: "We prioritize girls' education, addressing cultural barriers and providing the support girls need to stay in school and reach their potential." },
              { title: "Teacher Development", desc: "We train and support local teachers, improving the quality of education for all children in our partner schools — not just those in our programs." },
            ].map(({ title, desc }, i) => (
              <div key={title} className={`bg-white/10 rounded-2xl p-6 fade-up stagger-${i + 1}`}>
                <h4 className="font-bold text-[#EE701E] mb-2" style={{ fontFamily: "Manrope, sans-serif" }}>{title}</h4>
                <p className="text-white/70 leading-relaxed" style={{ fontFamily: "Hanken Grotesk, sans-serif" }}>{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-[#EE701E]">
        <div className="container mx-auto text-center">
          <h2 className="text-2xl md:text-3xl font-extrabold text-white mb-4 fade-up" style={{ fontFamily: "Manrope, sans-serif" }}>
            Be Part of the Impact
          </h2>
          <p className="text-white/80 mb-6 fade-up stagger-2" style={{ fontFamily: "Hanken Grotesk, sans-serif" }}>
            Your donation creates measurable, lasting change in children's lives.
          </p>
          <Link href="/donate" className="inline-block bg-white text-[#EE701E] font-bold px-8 py-3 rounded-lg hover:bg-[#0D215C] hover:text-white transition-all duration-200 active:scale-[0.97] fade-up stagger-3" style={{ fontFamily: "Hanken Grotesk, sans-serif" }}>
            Donate Now
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  );
}
