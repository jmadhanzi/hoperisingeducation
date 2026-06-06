/* Hope Rising Education — About Page */
import { useEffect, useRef } from "react";
import { Link } from "wouter";
import { Target, Eye, Heart, Globe, Shield, Users, CheckCircle } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const ABOUT_HERO = "https://d2xsxph8kpxj0f.cloudfront.net/310519663208076335/8TaPKuh8NEV6zjk5GTYvjo/about-hero-grgup9TxqUp4zyBtBuCgak.webp";

const values = [
  { icon: Heart, title: "Compassion", desc: "We lead with empathy, treating every child with dignity and care." },
  { icon: Shield, title: "Integrity", desc: "Full transparency in how we use donations and report our impact." },
  { icon: Globe, title: "Inclusion", desc: "Every child, regardless of background, deserves access to quality education." },
  { icon: Users, title: "Community", desc: "We work alongside families, teachers, and local leaders to create lasting change." },
];

const milestones = [
  { year: "2018", event: "Hope Rising Education founded in Chiredzi, Zimbabwe" },
  { year: "2019", event: "First 50 children enrolled in the My Best Me curriculum" },
  { year: "2020", event: "Expanded to Chipinge district; launched school fees program" },
  { year: "2021", event: "Partnered with local schools to provide meals and hygiene supplies" },
  { year: "2022", event: "Reached 200+ children; launched mentorship program" },
  { year: "2023", event: "International recognition; expanded digital curriculum" },
  { year: "2024", event: "500+ children supported; 12 schools reached; 3 countries active" },
];

export default function About() {
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
      <Navbar />

      {/* Hero */}
      <section className="relative h-72 md:h-96 flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url('${ABOUT_HERO}')` }} />
        <div className="absolute inset-0 bg-gradient-to-b from-[#0D215C]/70 to-[#0D215C]/80" />
        <div className="relative z-10 text-center text-white pt-16">
          <p className="text-xs text-white/60 mb-2" style={{ fontFamily: "Hanken Grotesk, sans-serif" }}>
            Home &rsaquo; About Us
          </p>
          <h1 className="text-4xl md:text-5xl font-extrabold" style={{ fontFamily: "Manrope, sans-serif" }}>
            Save <span className="text-[#EE701E]">Children's</span> Life
          </h1>
        </div>
      </section>

      {/* Who We Are */}
      <section className="py-20 bg-white">
        <div className="container mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="fade-up">
              <p className="section-label">Who We Are</p>
              <span className="orange-underline" />
              <h2 className="text-3xl md:text-4xl font-extrabold text-[#0D215C] mb-5" style={{ fontFamily: "Manrope, sans-serif" }}>
                Help Children: Build a School for Education
              </h2>
              <p className="text-[#584237] leading-relaxed mb-4" style={{ fontFamily: "Hanken Grotesk, sans-serif" }}>
                Hope Rising Education is a community-focused nonprofit dedicated to improving educational outcomes for underserved children and families. We provide tutoring, mentorship, and resource support alongside teacher training.
              </p>
              <p className="text-[#584237] leading-relaxed mb-6" style={{ fontFamily: "Hanken Grotesk, sans-serif" }}>
                Founded in Zimbabwe, our programs address the root causes of educational inequality — poverty, lack of resources, and inadequate psycho-social support — with holistic, evidence-based interventions.
              </p>
              <div className="space-y-3">
                {["Accredited nonprofit organization", "100% transparent financial reporting", "Locally-led, globally-supported programs"].map((item) => (
                  <div key={item} className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-[#4BAF4F] shrink-0" />
                    <span className="text-[#0D215C] text-sm font-medium" style={{ fontFamily: "Hanken Grotesk, sans-serif" }}>{item}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4 fade-up stagger-2">
              {[
                { icon: Heart, title: "Give Donation", desc: "Your gift transforms lives; invest in a child's future today.", color: "#EE701E" },
                { icon: Users, title: "Become Volunteer", desc: "Lend your time and skills; empower a child to thrive.", color: "#0D215C" },
                { icon: Target, title: "Fund Raising", desc: "Rally support, raise resources, and fuel lasting change.", color: "#4BAF4F" },
                { icon: Globe, title: "Global Reach", desc: "Operating in Zimbabwe and expanding to underserved communities worldwide.", color: "#EE701E" },
              ].map(({ icon: Icon, title, desc, color }) => (
                <div key={title} className="bg-[#F8F9FA] rounded-2xl p-5 card-shadow">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-3" style={{ backgroundColor: color + "20" }}>
                    <Icon className="w-5 h-5" style={{ color }} />
                  </div>
                  <h4 className="font-bold text-[#0D215C] text-sm mb-1" style={{ fontFamily: "Manrope, sans-serif" }}>{title}</h4>
                  <p className="text-[#584237] text-xs leading-relaxed" style={{ fontFamily: "Hanken Grotesk, sans-serif" }}>{desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Mission, Vision, Values */}
      <section className="py-20 bg-[#F8F9FA]">
        <div className="container mx-auto">
          <div className="text-center mb-14 fade-up">
            <p className="section-label">Our Foundation</p>
            <span className="orange-underline mx-auto" />
            <h2 className="text-3xl md:text-4xl font-extrabold text-[#0D215C]" style={{ fontFamily: "Manrope, sans-serif" }}>
              Mission, Vision &amp; Values
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
            {[
              { icon: Target, title: "Our Mission", color: "#EE701E", desc: "To break the cycle of poverty by equipping children with academic tools, life skills, and emotional support — creating pathways to a brighter, self-sufficient future." },
              { icon: Eye, title: "Our Vision", color: "#0D215C", desc: "A world where every child, regardless of economic background, has access to quality education, loving mentorship, and the resources needed to reach their full potential." },
              { icon: Heart, title: "Our Values", color: "#4BAF4F", desc: "Compassion, integrity, inclusion, and community partnership guide every decision we make and every program we deliver." },
            ].map(({ icon: Icon, title, color, desc }, i) => (
              <div key={title} className={`bg-white rounded-2xl p-8 card-shadow text-center fade-up stagger-${i + 1}`}>
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4" style={{ backgroundColor: color + "20" }}>
                  <Icon className="w-7 h-7" style={{ color }} />
                </div>
                <h3 className="font-bold text-xl text-[#0D215C] mb-3" style={{ fontFamily: "Manrope, sans-serif" }}>{title}</h3>
                <p className="text-[#584237] leading-relaxed" style={{ fontFamily: "Hanken Grotesk, sans-serif" }}>{desc}</p>
              </div>
            ))}
          </div>

          {/* Values Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {values.map(({ icon: Icon, title, desc }, i) => (
              <div key={title} className={`bg-white rounded-xl p-5 card-shadow fade-up stagger-${i + 1}`}>
                <div className="w-10 h-10 bg-[#EE701E]/10 rounded-lg flex items-center justify-center mb-3">
                  <Icon className="w-5 h-5 text-[#EE701E]" />
                </div>
                <h4 className="font-bold text-[#0D215C] mb-1" style={{ fontFamily: "Manrope, sans-serif" }}>{title}</h4>
                <p className="text-[#584237] text-sm leading-relaxed" style={{ fontFamily: "Hanken Grotesk, sans-serif" }}>{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Volunteer CTA */}
      <section className="py-20 bg-[#0D215C] relative overflow-hidden">
        <div className="absolute -right-20 -top-20 w-80 h-80 bg-[#EE701E]/10 rounded-full blur-3xl" />
        <div className="container mx-auto text-center relative z-10">
          <p className="section-label text-[#EE701E] fade-up">We Help Children</p>
          <h2 className="text-3xl md:text-4xl font-extrabold text-white mt-3 mb-4 fade-up stagger-2" style={{ fontFamily: "Manrope, sans-serif" }}>
            Want to Become a <span className="text-[#EE701E]">Volunteer?</span>
          </h2>
          <p className="text-white/70 max-w-xl mx-auto mb-8 fade-up stagger-3" style={{ fontFamily: "Hanken Grotesk, sans-serif" }}>
            We empower children to rise above barriers, unlock their potential, and build brighter futures. Join us as a volunteer and change a life today.
          </p>
          <Link href="/get-involved" className="btn-primary fade-up stagger-4">
            Apply Now
          </Link>
        </div>
      </section>

      {/* Timeline */}
      <section className="py-20 bg-white">
        <div className="container mx-auto">
          <div className="text-center mb-14 fade-up">
            <p className="section-label">Our Journey</p>
            <span className="orange-underline mx-auto" />
            <h2 className="text-3xl md:text-4xl font-extrabold text-[#0D215C]" style={{ fontFamily: "Manrope, sans-serif" }}>
              Our Background &amp; Milestones
            </h2>
          </div>
          <div className="max-w-3xl mx-auto">
            <div className="relative border-l-2 border-[#EE701E]/30 pl-8 space-y-8">
              {milestones.map(({ year, event }, i) => (
                <div key={year} className={`relative fade-up stagger-${(i % 4) + 1}`}>
                  <div className="absolute -left-[41px] w-5 h-5 rounded-full bg-[#EE701E] border-4 border-white shadow" />
                  <span className="text-[#EE701E] font-bold text-sm" style={{ fontFamily: "Hanken Grotesk, sans-serif" }}>{year}</span>
                  <p className="text-[#0D215C] font-medium mt-0.5" style={{ fontFamily: "Hanken Grotesk, sans-serif" }}>{event}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Impact & Vision Cards */}
      <section className="py-16 bg-[#0D215C]">
        <div className="container mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white/10 rounded-2xl p-8 fade-up">
              <h4 className="text-[#EE701E] font-bold text-sm tracking-widest uppercase mb-3" style={{ fontFamily: "Hanken Grotesk, sans-serif" }}>Impact</h4>
              <p className="text-white/80 leading-relaxed" style={{ fontFamily: "Hanken Grotesk, sans-serif" }}>
                Transforming lives in Chipinge and Chiredzi with school fees, materials, and holistic support for over 500 children and their families.
              </p>
            </div>
            <div className="bg-white/10 rounded-2xl p-8 fade-up stagger-2">
              <h4 className="text-[#EE701E] font-bold text-sm tracking-widest uppercase mb-3" style={{ fontFamily: "Hanken Grotesk, sans-serif" }}>Vision</h4>
              <p className="text-white/80 leading-relaxed" style={{ fontFamily: "Hanken Grotesk, sans-serif" }}>
                A strategic investment in national development through child welfare — building the next generation of Zimbabwe's leaders, innovators, and changemakers.
              </p>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
