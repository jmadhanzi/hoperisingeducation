/* Hope Rising Education — Get Involved Page */
import { useEffect, useRef, useState } from "react";
import { Link } from "wouter";
import { Users, Heart, Megaphone, DollarSign, Globe, BookOpen, CheckCircle, ArrowRight } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { toast } from "sonner";
import { Toaster } from "@/components/ui/sonner";
import { PageSEO } from "@/lib/seo";
import { trpc } from "@/lib/trpc";

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
  const [formData, setFormData] = useState({
    name: "", email: "", phone: "", interest: "",
    location: "", skills: "", hoursPerWeek: "", message: "",
  });
  const [submitted, setSubmitted] = useState(false);
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

  const submitVolunteer = trpc.contact.submitVolunteer.useMutation({
    onSuccess: () => {
      setSubmitted(true);
      setFormData({ name: "", email: "", phone: "", interest: "", location: "", skills: "", hoursPerWeek: "", message: "" });
      toast.success(`Thank you, ${formData.name}! We'll be in touch within 48 hours.`);
    },
    onError: () => {
      toast.error("Something went wrong. Please email us directly at info@hoperisingeducationglobal.org");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    submitVolunteer.mutate(formData);
  };

  return (
    <div className="min-h-screen" ref={revealRef}>
      <PageSEO
        title="Get Involved"
        description="Volunteer, donate monthly, sponsor a child, or become a corporate partner. There are many ways to support Hope Rising Education's mission in Zimbabwe."
        path="/get-involved"
      />
      <Navbar />
      <Toaster />

      {/* Hero */}
      <section id="main-content" className="relative h-72 md:h-96 flex items-center justify-center overflow-hidden">
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
              {submitted ? (
                <div className="text-center py-8" role="alert">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <CheckCircle className="w-8 h-8 text-green-600" aria-hidden="true" />
                  </div>
                  <h3 className="text-xl font-extrabold text-[#0D215C] mb-2" style={{ fontFamily: "Manrope, sans-serif" }}>Application Received!</h3>
                  <p className="text-[#584237] mb-4" style={{ fontFamily: "Hanken Grotesk, sans-serif" }}>
                    We'll review your application and reply within 48 hours. In the meantime, feel free to explore our <Link href="/programs" className="text-[#EE701E] hover:underline">programs</Link>.
                  </p>
                  <button onClick={() => setSubmitted(false)} className="btn-navy text-sm py-2">Submit another application</button>
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <label htmlFor="inv-name" className="block text-sm font-semibold text-[#0D215C] mb-1.5" style={{ fontFamily: "Hanken Grotesk, sans-serif" }}>Full Name *</label>
                      <input id="inv-name" type="text" required autoComplete="name" placeholder="Your full name"
                        value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="w-full px-4 py-3 border-2 border-[#E7E8E9] rounded-lg focus:border-[#EE701E] focus:outline-none bg-white transition-colors"
                        style={{ fontFamily: "Hanken Grotesk, sans-serif" }} />
                    </div>
                    <div>
                      <label htmlFor="inv-email" className="block text-sm font-semibold text-[#0D215C] mb-1.5" style={{ fontFamily: "Hanken Grotesk, sans-serif" }}>Email Address *</label>
                      <input id="inv-email" type="email" required autoComplete="email" placeholder="your@email.com"
                        value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="w-full px-4 py-3 border-2 border-[#E7E8E9] rounded-lg focus:border-[#EE701E] focus:outline-none bg-white transition-colors"
                        style={{ fontFamily: "Hanken Grotesk, sans-serif" }} />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <label htmlFor="inv-phone" className="block text-sm font-semibold text-[#0D215C] mb-1.5" style={{ fontFamily: "Hanken Grotesk, sans-serif" }}>Phone / WhatsApp</label>
                      <input id="inv-phone" type="tel" autoComplete="tel" placeholder="+1 555 000 0000"
                        value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        className="w-full px-4 py-3 border-2 border-[#E7E8E9] rounded-lg focus:border-[#EE701E] focus:outline-none bg-white transition-colors"
                        style={{ fontFamily: "Hanken Grotesk, sans-serif" }} />
                    </div>
                    <div>
                      <label htmlFor="inv-location" className="block text-sm font-semibold text-[#0D215C] mb-1.5" style={{ fontFamily: "Hanken Grotesk, sans-serif" }}>Location / Country</label>
                      <input id="inv-location" type="text" placeholder="e.g. London, UK"
                        value={formData.location} onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                        className="w-full px-4 py-3 border-2 border-[#E7E8E9] rounded-lg focus:border-[#EE701E] focus:outline-none bg-white transition-colors"
                        style={{ fontFamily: "Hanken Grotesk, sans-serif" }} />
                    </div>
                  </div>
                  <div className="mb-4">
                    <label htmlFor="inv-interest" className="block text-sm font-semibold text-[#0D215C] mb-1.5" style={{ fontFamily: "Hanken Grotesk, sans-serif" }}>Area of Interest *</label>
                    <select id="inv-interest" required value={formData.interest}
                      onChange={(e) => setFormData({ ...formData, interest: e.target.value })}
                      className="w-full px-4 py-3 border-2 border-[#E7E8E9] rounded-lg focus:border-[#EE701E] focus:outline-none bg-white transition-colors"
                      style={{ fontFamily: "Hanken Grotesk, sans-serif" }}>
                      <option value="">Select an option</option>
                      <option value="Volunteer">Volunteer</option>
                      <option value="Sponsor a Child">Sponsor a Child</option>
                      <option value="Advocate">Advocate</option>
                      <option value="Monthly Donor">Monthly Donor</option>
                      <option value="Corporate Partnership">Corporate Partnership</option>
                      <option value="In-Kind Donation">In-Kind Donation</option>
                    </select>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <label htmlFor="inv-skills" className="block text-sm font-semibold text-[#0D215C] mb-1.5" style={{ fontFamily: "Hanken Grotesk, sans-serif" }}>Relevant Skills</label>
                      <input id="inv-skills" type="text" placeholder="e.g. Teaching, Design, Finance"
                        value={formData.skills} onChange={(e) => setFormData({ ...formData, skills: e.target.value })}
                        className="w-full px-4 py-3 border-2 border-[#E7E8E9] rounded-lg focus:border-[#EE701E] focus:outline-none bg-white transition-colors"
                        style={{ fontFamily: "Hanken Grotesk, sans-serif" }} />
                    </div>
                    <div>
                      <label htmlFor="inv-hours" className="block text-sm font-semibold text-[#0D215C] mb-1.5" style={{ fontFamily: "Hanken Grotesk, sans-serif" }}>Hours Available / Week</label>
                      <select id="inv-hours" value={formData.hoursPerWeek}
                        onChange={(e) => setFormData({ ...formData, hoursPerWeek: e.target.value })}
                        className="w-full px-4 py-3 border-2 border-[#E7E8E9] rounded-lg focus:border-[#EE701E] focus:outline-none bg-white transition-colors"
                        style={{ fontFamily: "Hanken Grotesk, sans-serif" }}>
                        <option value="">Select</option>
                        <option value="1-3 hrs">1–3 hours</option>
                        <option value="4-8 hrs">4–8 hours</option>
                        <option value="9-20 hrs">9–20 hours</option>
                        <option value="Full time">Full time</option>
                      </select>
                    </div>
                  </div>
                  <div className="mb-6">
                    <label htmlFor="inv-message" className="block text-sm font-semibold text-[#0D215C] mb-1.5" style={{ fontFamily: "Hanken Grotesk, sans-serif" }}>Tell us about yourself</label>
                    <textarea id="inv-message" placeholder="Briefly describe your background and how you'd like to help…"
                      value={formData.message} onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      rows={4} className="w-full px-4 py-3 border-2 border-[#E7E8E9] rounded-lg focus:border-[#EE701E] focus:outline-none bg-white transition-colors resize-none"
                      style={{ fontFamily: "Hanken Grotesk, sans-serif" }} />
                  </div>
                  <button type="submit" disabled={submitVolunteer.isPending}
                    className="btn-primary w-full py-4 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2">
                    {submitVolunteer.isPending ? "Submitting…" : "Submit Application"}
                    {!submitVolunteer.isPending && <ArrowRight className="w-4 h-4" aria-hidden="true" />}
                  </button>
                  <p className="text-center text-xs text-[#584237] mt-3" style={{ fontFamily: "Hanken Grotesk, sans-serif" }}>
                    We'll reply within 48 hours. For urgent queries, WhatsApp us at{" "}
                    <a href="https://wa.me/263776129568" className="text-green-700 font-semibold hover:underline" target="_blank" rel="noopener noreferrer">+263 776 129 568</a>.
                  </p>
                </>
              )}
            </form>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
