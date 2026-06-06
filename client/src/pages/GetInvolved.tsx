/* Hope Rising Education — Get Involved Page */
import { useEffect, useRef, useState } from "react";
import { Link } from "wouter";
import { Users, Heart, Megaphone, DollarSign, Globe, BookOpen, CheckCircle, ArrowRight } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { toast } from "sonner";
import { Toaster } from "@/components/ui/sonner";

const HERO_IMG = "https://d2xsxph8kpxj0f.cloudfront.net/310519663208076335/8TaPKuh8NEV6zjk5GTYvjo/about-hero-grgup9TxqUp4zyBtBuCgak.webp";

const opportunities = [
  {
    icon: Users,
    title: "Volunteer",
    color: "#EE701E",
    desc: "Give your time and skills to directly support children in our programs. We need tutors, mentors, event organizers, and administrative volunteers.",
    roles: ["Classroom Tutor", "Mentor", "Event Coordinator", "Administrative Support", "Curriculum Developer"],
    cta: "Apply to Volunteer",
  },
  {
    icon: DollarSign,
    title: "Sponsor a Child",
    color: "#0D215C",
    desc: "Sponsor a specific child's education for a year. You'll receive regular updates on their progress and know exactly how your donation is changing their life.",
    roles: ["Annual Sponsorship: $600/year", "Term Sponsorship: $200/term", "Monthly: $50/month", "One-time gift of any amount"],
    cta: "Sponsor a Child",
  },
  {
    icon: Megaphone,
    title: "Advocate",
    color: "#4BAF4F",
    desc: "Use your voice and platform to raise awareness about educational inequality. Share our mission with your network and help us reach more donors and supporters.",
    roles: ["Social Media Advocate", "Community Speaker", "Fundraising Champion", "Grant Writer", "Media Ambassador"],
    cta: "Become an Advocate",
  },
  {
    icon: Heart,
    title: "Monthly Donor",
    color: "#EE701E",
    desc: "Join our community of monthly donors who provide the consistent, reliable funding that allows us to plan long-term programs and reach more children.",
    roles: ["$25/month — School supplies", "$50/month — School fees", "$100/month — Full child support", "$250/month — Classroom support"],
    cta: "Become Monthly Donor",
  },
  {
    icon: Globe,
    title: "Corporate Partnership",
    color: "#0D215C",
    desc: "Partner with Hope Rising Education as a corporate sponsor. We offer co-branding opportunities, employee volunteer programs, and impact reporting.",
    roles: ["Platinum Partner: $10,000+", "Gold Partner: $5,000+", "Silver Partner: $2,500+", "Community Partner: $1,000+"],
    cta: "Partner With Us",
  },
  {
    icon: BookOpen,
    title: "In-Kind Donations",
    color: "#4BAF4F",
    desc: "Donate books, school supplies, computers, or other educational materials. In-kind donations directly equip children with the tools they need to learn.",
    roles: ["Books & Textbooks", "School Supplies", "Computers & Tablets", "Sports Equipment", "Art & Music Supplies"],
    cta: "Donate Supplies",
  },
];

export default function GetInvolved() {
  const [formData, setFormData] = useState({ name: "", email: "", phone: "", interest: "", message: "" });
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success(`Thank you, ${formData.name}! We'll be in touch within 48 hours to discuss how you can get involved.`);
    setFormData({ name: "", email: "", phone: "", interest: "", message: "" });
  };

  return (
    <div className="min-h-screen" ref={revealRef}>
      <Navbar />
      <Toaster />

      {/* Hero */}
      <section className="relative h-72 md:h-96 flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url('${HERO_IMG}')` }} />
        <div className="absolute inset-0 bg-gradient-to-b from-[#0D215C]/70 to-[#0D215C]/85" />
        <div className="relative z-10 text-center text-white pt-16">
          <p className="text-xs text-white/60 mb-2" style={{ fontFamily: "Hanken Grotesk, sans-serif" }}>Home &rsaquo; Get Involved</p>
          <h1 className="text-4xl md:text-5xl font-extrabold" style={{ fontFamily: "Manrope, sans-serif" }}>
            Get <span className="text-[#EE701E]">Involved</span>
          </h1>
          <p className="text-white/70 mt-3 max-w-xl mx-auto px-4" style={{ fontFamily: "Hanken Grotesk, sans-serif" }}>
            There are many ways to support our mission. Find the one that's right for you.
          </p>
        </div>
      </section>

      {/* Opportunities Grid */}
      <section className="py-20 bg-[#F8F9FA]">
        <div className="container mx-auto">
          <div className="text-center mb-14 fade-up">
            <p className="section-label">Ways to Help</p>
            <span className="orange-underline mx-auto" />
            <h2 className="text-3xl md:text-4xl font-extrabold text-[#0D215C]" style={{ fontFamily: "Manrope, sans-serif" }}>
              How You Can Make a Difference
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {opportunities.map(({ icon: Icon, title, color, desc, roles, cta }, i) => (
              <div key={title} className={`bg-white rounded-2xl p-6 card-shadow hover:card-shadow-hover transition-all duration-300 hover:-translate-y-1 fade-up stagger-${(i % 3) + 1}`}>
                <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-4" style={{ backgroundColor: color + "20" }}>
                  <Icon className="w-6 h-6" style={{ color }} />
                </div>
                <h3 className="font-bold text-xl text-[#0D215C] mb-2" style={{ fontFamily: "Manrope, sans-serif" }}>{title}</h3>
                <p className="text-[#584237] text-sm leading-relaxed mb-4" style={{ fontFamily: "Hanken Grotesk, sans-serif" }}>{desc}</p>
                <div className="space-y-1.5 mb-5">
                  {roles.map((role) => (
                    <div key={role} className="flex items-center gap-2">
                      <CheckCircle className="w-3.5 h-3.5 shrink-0" style={{ color }} />
                      <span className="text-xs text-[#584237]" style={{ fontFamily: "Hanken Grotesk, sans-serif" }}>{role}</span>
                    </div>
                  ))}
                </div>
                <button
                  onClick={() => document.getElementById("apply-form")?.scrollIntoView({ behavior: "smooth" })}
                  className="text-sm font-semibold flex items-center gap-1 transition-colors"
                  style={{ color, fontFamily: "Hanken Grotesk, sans-serif" }}
                >
                  {cta} <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Application Form */}
      <section id="apply-form" className="py-20 bg-white">
        <div className="container mx-auto">
          <div className="max-w-2xl mx-auto">
            <div className="text-center mb-10 fade-up">
              <p className="section-label">Join Our Mission</p>
              <span className="orange-underline mx-auto" />
              <h2 className="text-3xl font-extrabold text-[#0D215C]" style={{ fontFamily: "Manrope, sans-serif" }}>
                Apply to Get Involved
              </h2>
              <p className="text-[#584237] mt-3" style={{ fontFamily: "Hanken Grotesk, sans-serif" }}>
                Fill out the form below and we'll be in touch within 48 hours.
              </p>
            </div>
            <form onSubmit={handleSubmit} className="bg-[#F8F9FA] rounded-2xl p-8 card-shadow fade-up stagger-2">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-semibold text-[#0D215C] mb-1.5" style={{ fontFamily: "Hanken Grotesk, sans-serif" }}>Full Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="Your full name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-[#E7E8E9] rounded-lg focus:border-[#EE701E] focus:outline-none bg-white transition-colors"
                    style={{ fontFamily: "Hanken Grotesk, sans-serif" }}
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-[#0D215C] mb-1.5" style={{ fontFamily: "Hanken Grotesk, sans-serif" }}>Email Address *</label>
                  <input
                    type="email"
                    required
                    placeholder="your@email.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-[#E7E8E9] rounded-lg focus:border-[#EE701E] focus:outline-none bg-white transition-colors"
                    style={{ fontFamily: "Hanken Grotesk, sans-serif" }}
                  />
                </div>
              </div>
              <div className="mb-4">
                <label className="block text-sm font-semibold text-[#0D215C] mb-1.5" style={{ fontFamily: "Hanken Grotesk, sans-serif" }}>Phone (Optional)</label>
                <input
                  type="tel"
                  placeholder="Your phone number"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-[#E7E8E9] rounded-lg focus:border-[#EE701E] focus:outline-none bg-white transition-colors"
                  style={{ fontFamily: "Hanken Grotesk, sans-serif" }}
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-semibold text-[#0D215C] mb-1.5" style={{ fontFamily: "Hanken Grotesk, sans-serif" }}>Area of Interest *</label>
                <select
                  required
                  value={formData.interest}
                  onChange={(e) => setFormData({ ...formData, interest: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-[#E7E8E9] rounded-lg focus:border-[#EE701E] focus:outline-none bg-white transition-colors"
                  style={{ fontFamily: "Hanken Grotesk, sans-serif" }}
                >
                  <option value="">Select an option</option>
                  <option value="volunteer">Volunteer</option>
                  <option value="sponsor">Sponsor a Child</option>
                  <option value="advocate">Advocate</option>
                  <option value="monthly-donor">Monthly Donor</option>
                  <option value="corporate">Corporate Partnership</option>
                  <option value="in-kind">In-Kind Donation</option>
                </select>
              </div>
              <div className="mb-6">
                <label className="block text-sm font-semibold text-[#0D215C] mb-1.5" style={{ fontFamily: "Hanken Grotesk, sans-serif" }}>Message</label>
                <textarea
                  placeholder="Tell us about yourself and how you'd like to help..."
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  rows={4}
                  className="w-full px-4 py-3 border-2 border-[#E7E8E9] rounded-lg focus:border-[#EE701E] focus:outline-none bg-white transition-colors resize-none"
                  style={{ fontFamily: "Hanken Grotesk, sans-serif" }}
                />
              </div>
              <button type="submit" className="btn-primary w-full py-4">
                Submit Application
              </button>
            </form>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
