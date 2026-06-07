/* Hope Rising Education — Team Page */
import { useEffect, useRef } from "react";
import { Link } from "wouter";
import { Users, Heart, ArrowRight } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { PageSEO } from "@/lib/seo";

const TEAM_HERO = "https://d2xsxph8kpxj0f.cloudfront.net/310519663208076335/8TaPKuh8NEV6zjk5GTYvjo/hero-children-E3Zp4N9BdqMr2BPpEu4Yxq.webp";

const teamMembers = [
  {
    name: "Patience Konono",
    role: "Co-Founder & Executive Director",
    bio: "Patience leads Hope Rising Education's strategic vision and operations. With a background in social work and community development, she has dedicated her career to improving educational outcomes for vulnerable children in Zimbabwe.",
    img: "https://images.unsplash.com/photo-1531123897727-8f129e1688ce?w=400&q=80",
    type: "Leadership",
  },
  {
    name: "Bishop Gladmore Konono",
    role: "Co-Founder & Programs Director",
    bio: "Bishop Gladmore recently graduated in International Business Management in Poland. He emphasizes that spiritual guidance and mentorship are critical in steering young people away from destructive lifestyles.",
    img: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&q=80",
    type: "Leadership",
  },
  {
    name: "Patricia Pundo",
    role: "Volunteer Coordinator",
    bio: "Patricia manages our network of dedicated volunteers, ensuring every volunteer has a meaningful, impactful experience while supporting children in our programs.",
    img: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&q=80",
    type: "Volunteer",
  },
  {
    name: "Lidia Mugomba",
    role: "Curriculum Specialist",
    bio: "Lidia develops and refines the My Best Me curriculum, ensuring it remains age-appropriate, culturally relevant, and evidence-based for children across our programs.",
    img: "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=400&q=80",
    type: "Volunteer",
  },
  {
    name: "Desiree Mugomba",
    role: "Community Outreach",
    bio: "Desiree builds and maintains relationships with local schools, community leaders, and families, ensuring our programs are deeply embedded in the communities we serve.",
    img: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&q=80",
    type: "Volunteer",
  },
  {
    name: "Hazel Mutova",
    role: "Fundraising Coordinator",
    bio: "Hazel leads our fundraising initiatives, building relationships with donors and partners to secure the resources needed to expand our reach and impact.",
    img: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&q=80",
    type: "Volunteer",
  },
];

const typeColors: Record<string, string> = {
  Leadership: "#EE701E",
  Volunteer: "#0D215C",
};

export default function Team() {
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
        title="Our Team"
        description="Meet the dedicated founders, leaders, and volunteers behind Hope Rising Education who are changing lives in Zimbabwe through education."
        path="/team"
      />
      <Navbar />

      {/* Hero */}
      <section id="main-content" className="relative h-72 md:h-96 flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url('${TEAM_HERO}')` }} role="img" aria-label="Children smiling at a Hope Rising Education school" />
        <div className="absolute inset-0 bg-gradient-to-b from-[#0D215C]/70 to-[#0D215C]/85" />
        <div className="relative z-10 text-center text-white pt-16">
          <p className="text-xs text-white/60 mb-2" style={{ fontFamily: "Hanken Grotesk, sans-serif" }}>Home &rsaquo; Team</p>
          <h1 className="text-4xl md:text-5xl font-extrabold" style={{ fontFamily: "Manrope, sans-serif" }}>
            Our <span className="text-[#EE701E]">Dedicated</span> Team
          </h1>
          <p className="text-white/70 mt-3 max-w-xl mx-auto px-4" style={{ fontFamily: "Hanken Grotesk, sans-serif" }}>
            Passionate individuals united by a shared mission to transform children's lives through education.
          </p>
        </div>
      </section>

      {/* Team Grid */}
      <section className="py-20 bg-[#F8F9FA]">
        <div className="container mx-auto">
          <div className="text-center mb-14 fade-up">
            <p className="section-label">The People Behind the Mission</p>
            <span className="orange-underline mx-auto" />
            <h2 className="text-3xl md:text-4xl font-extrabold text-[#0D215C]" style={{ fontFamily: "Manrope, sans-serif" }}>
              Meet Our Team
            </h2>
          </div>

          {/* Leadership */}
          <div className="mb-12">
            <h3 className="text-lg font-bold text-[#0D215C] mb-6 flex items-center gap-2" style={{ fontFamily: "Manrope, sans-serif" }}>
              <span className="w-6 h-1 bg-[#EE701E] rounded-full inline-block" />
              Leadership
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {teamMembers.filter(m => m.type === "Leadership").map(({ name, role, bio, img }, i) => (
                <div key={name} className={`bg-white rounded-2xl overflow-hidden card-shadow hover:card-shadow-hover transition-all duration-300 hover:-translate-y-1 fade-up stagger-${i + 1}`}>
                  <div className="flex gap-5 p-6">
                    <img src={img} alt={`${name}, ${role}`} loading="lazy" className="w-20 h-20 rounded-xl object-cover shrink-0 border-2 border-[#EE701E]/30" />
                    <div>
                      <span className="text-[#EE701E] text-xs font-bold tracking-widest uppercase" style={{ fontFamily: "Hanken Grotesk, sans-serif" }}>Leadership</span>
                      <h4 className="font-bold text-lg text-[#0D215C] mt-0.5" style={{ fontFamily: "Manrope, sans-serif" }}>{name}</h4>
                      <p className="text-[#EE701E] text-sm font-medium mb-2" style={{ fontFamily: "Hanken Grotesk, sans-serif" }}>{role}</p>
                      <p className="text-[#584237] text-sm leading-relaxed" style={{ fontFamily: "Hanken Grotesk, sans-serif" }}>{bio}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Volunteers */}
          <div>
            <h3 className="text-lg font-bold text-[#0D215C] mb-6 flex items-center gap-2" style={{ fontFamily: "Manrope, sans-serif" }}>
              <span className="w-6 h-1 bg-[#0D215C] rounded-full inline-block" />
              Volunteers
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {teamMembers.filter(m => m.type === "Volunteer").map(({ name, role, img }, i) => (
                <div key={name} className={`bg-white rounded-2xl overflow-hidden card-shadow hover:card-shadow-hover transition-all duration-300 hover:-translate-y-1 text-center fade-up stagger-${(i % 4) + 1}`}>
                  <div className="h-48 overflow-hidden">
                    <img src={img} alt={name} className="w-full h-full object-cover transition-transform duration-500 hover:scale-110" />
                  </div>
                  <div className="p-4">
                    <span className="text-[#0D215C] text-xs font-bold tracking-widest uppercase" style={{ fontFamily: "Hanken Grotesk, sans-serif" }}>Volunteer</span>
                    <h4 className="font-bold text-[#0D215C] mt-0.5" style={{ fontFamily: "Manrope, sans-serif" }}>{name}</h4>
                    <p className="text-[#EE701E] text-sm" style={{ fontFamily: "Hanken Grotesk, sans-serif" }}>{role}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Join Mission CTA */}
      <section className="py-20 bg-[#0D215C] relative overflow-hidden">
        <div className="absolute -right-20 -top-20 w-80 h-80 bg-[#EE701E]/10 rounded-full blur-3xl" />
        <div className="container mx-auto text-center relative z-10">
          <div className="w-16 h-16 bg-[#EE701E]/20 rounded-2xl flex items-center justify-center mx-auto mb-5 fade-up">
            <Heart className="w-8 h-8 text-[#EE701E]" />
          </div>
          <h2 className="text-3xl md:text-4xl font-extrabold text-white mb-4 fade-up stagger-2" style={{ fontFamily: "Manrope, sans-serif" }}>
            Join Our Mission
          </h2>
          <p className="text-white/70 max-w-xl mx-auto mb-8 fade-up stagger-3" style={{ fontFamily: "Hanken Grotesk, sans-serif" }}>
            We are always looking for passionate individuals to help us change lives through education. Whether you have hours, skills, or resources to share — there's a place for you on our team.
          </p>
          <Link href="/get-involved" className="btn-primary inline-flex items-center gap-2 fade-up stagger-4">
            Become a Volunteer <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  );
}
