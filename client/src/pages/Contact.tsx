/* Hope Rising Education — Contact Page */
import { useEffect, useRef, useState } from "react";
import { MapPin, Mail, Phone, Clock, Send } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { toast } from "sonner";
import { Toaster } from "@/components/ui/sonner";
import { PageSEO } from "@/lib/seo";

const CONTACT_HERO = "https://d2xsxph8kpxj0f.cloudfront.net/310519663208076335/8TaPKuh8NEV6zjk5GTYvjo/programs-curriculum-FzuxWRHqHKijJqsiRDbhP3.webp";

export default function Contact() {
  const [formData, setFormData] = useState({ name: "", email: "", phone: "", subject: "", message: "" });
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
    toast.success("Message sent! We'll get back to you within 24–48 hours.");
    setFormData({ name: "", email: "", phone: "", subject: "", message: "" });
  };

  return (
    <div className="min-h-screen" ref={revealRef}>
      <PageSEO
        title="Contact Us"
        description="Get in touch with Hope Rising Education. We'd love to hear from you about donating, volunteering, or referring a child in need in Zimbabwe."
        path="/contact"
      />
      <Navbar />
      <Toaster />

      {/* Hero */}
      <section id="main-content" className="relative h-72 md:h-96 flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url('${CONTACT_HERO}')` }} />
        <div className="absolute inset-0 bg-gradient-to-b from-[#0D215C]/70 to-[#0D215C]/85" />
        <div className="relative z-10 text-center text-white pt-16">
          <p className="text-xs text-white/60 mb-2" style={{ fontFamily: "Hanken Grotesk, sans-serif" }}>Home &rsaquo; Contact</p>
          <h1 className="text-4xl md:text-5xl font-extrabold" style={{ fontFamily: "Manrope, sans-serif" }}>
            Contact <span className="text-[#EE701E]">With Us</span>
          </h1>
          <p className="text-white/70 mt-3 max-w-xl mx-auto px-4" style={{ fontFamily: "Hanken Grotesk, sans-serif" }}>
            We'd love to hear from you. Reach out to learn more, donate, volunteer, or refer a child in need.
          </p>
        </div>
      </section>

      {/* Contact Info + Form */}
      <section className="py-20 bg-[#F8F9FA]">
        <div className="container mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
            {/* Contact Info */}
            <div className="space-y-5 fade-up">
              <div>
                <p className="section-label">Get in Touch</p>
                <span className="orange-underline" />
                <h2 className="text-2xl font-extrabold text-[#0D215C]" style={{ fontFamily: "Manrope, sans-serif" }}>
                  Contact Us
                </h2>
                <p className="text-[#584237] mt-3 leading-relaxed" style={{ fontFamily: "Hanken Grotesk, sans-serif" }}>
                  Hope Rising Education provides free tutoring, school supplies, and mentorship to help underprivileged children thrive. Call or email us to learn how you can donate, volunteer, or refer a child in need.
                </p>
              </div>

              {[
                {
                  icon: MapPin,
                  label: "Address",
                  value: "Chompani Primary School P. 7053, Chiredzi, Zimbabwe",
                  color: "#EE701E",
                },
                {
                  icon: Mail,
                  label: "Email Address",
                  value: "info@hoperisingeducationglobal.org",
                  color: "#EE701E",
                  href: "mailto:info@hoperisingeducationglobal.org",
                },
                {
                  icon: Phone,
                  label: "Phone",
                  value: "+263 776 129 568\n+1 (940) 301-2943",
                  color: "#EE701E",
                },
                {
                  icon: Clock,
                  label: "Office Hours",
                  value: "Monday – Friday: 8:00 AM – 5:00 PM CAT",
                  color: "#EE701E",
                },
              ].map(({ icon: Icon, label, value, color, href }) => (
                <div key={label} className="bg-white rounded-xl p-4 card-shadow flex items-start gap-4">
                  <div className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0" style={{ backgroundColor: color + "20" }}>
                    <Icon className="w-5 h-5" style={{ color }} />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-[#EE701E] tracking-widest uppercase mb-1" style={{ fontFamily: "Hanken Grotesk, sans-serif" }}>{label}</p>
                    {href ? (
                      <a href={href} className="text-[#0D215C] text-sm hover:text-[#EE701E] transition-colors" style={{ fontFamily: "Hanken Grotesk, sans-serif" }}>{value}</a>
                    ) : (
                      <p className="text-[#0D215C] text-sm whitespace-pre-line" style={{ fontFamily: "Hanken Grotesk, sans-serif" }}>{value}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Contact Form */}
            <div className="lg:col-span-2 fade-up stagger-2">
              <form onSubmit={handleSubmit} className="bg-white rounded-2xl p-8 card-shadow" noValidate>
                <h3 className="text-xl font-extrabold text-[#0D215C] mb-6" style={{ fontFamily: "Manrope, sans-serif" }}>
                  Send Us a Message
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label htmlFor="contact-name" className="block text-sm font-semibold text-[#0D215C] mb-1.5" style={{ fontFamily: "Hanken Grotesk, sans-serif" }}>Full Name *</label>
                    <input
                      id="contact-name"
                      type="text"
                      required
                      autoComplete="name"
                      placeholder="Your full name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-4 py-3 border-2 border-[#E7E8E9] rounded-lg focus:border-[#EE701E] focus:outline-none transition-colors"
                      style={{ fontFamily: "Hanken Grotesk, sans-serif" }}
                    />
                  </div>
                  <div>
                    <label htmlFor="contact-email" className="block text-sm font-semibold text-[#0D215C] mb-1.5" style={{ fontFamily: "Hanken Grotesk, sans-serif" }}>Email Address *</label>
                    <input
                      id="contact-email"
                      type="email"
                      required
                      autoComplete="email"
                      placeholder="your@email.com"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full px-4 py-3 border-2 border-[#E7E8E9] rounded-lg focus:border-[#EE701E] focus:outline-none transition-colors"
                      style={{ fontFamily: "Hanken Grotesk, sans-serif" }}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label htmlFor="contact-phone" className="block text-sm font-semibold text-[#0D215C] mb-1.5" style={{ fontFamily: "Hanken Grotesk, sans-serif" }}>Phone (Optional)</label>
                    <input
                      id="contact-phone"
                      type="tel"
                      autoComplete="tel"
                      placeholder="Your contact number"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full px-4 py-3 border-2 border-[#E7E8E9] rounded-lg focus:border-[#EE701E] focus:outline-none transition-colors"
                      style={{ fontFamily: "Hanken Grotesk, sans-serif" }}
                    />
                  </div>
                  <div>
                    <label htmlFor="contact-subject" className="block text-sm font-semibold text-[#0D215C] mb-1.5" style={{ fontFamily: "Hanken Grotesk, sans-serif" }}>Subject *</label>
                    <input
                      id="contact-subject"
                      type="text"
                      required
                      placeholder="Topic of your message"
                      value={formData.subject}
                      onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                      className="w-full px-4 py-3 border-2 border-[#E7E8E9] rounded-lg focus:border-[#EE701E] focus:outline-none transition-colors"
                      style={{ fontFamily: "Hanken Grotesk, sans-serif" }}
                    />
                  </div>
                </div>
                <div className="mb-6">
                  <label htmlFor="contact-message" className="block text-sm font-semibold text-[#0D215C] mb-1.5" style={{ fontFamily: "Hanken Grotesk, sans-serif" }}>Message *</label>
                  <textarea
                    id="contact-message"
                    required
                    placeholder="How can we help?"
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    rows={5}
                    className="w-full px-4 py-3 border-2 border-[#E7E8E9] rounded-lg focus:border-[#EE701E] focus:outline-none transition-colors resize-none"
                    style={{ fontFamily: "Hanken Grotesk, sans-serif" }}
                  />
                </div>
                <button type="submit" className="btn-primary w-full py-4 flex items-center justify-center gap-2">
                  <Send className="w-4 h-4" aria-hidden="true" /> Send Message
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* Info + Latest Works */}
      <section className="py-16 bg-white">
        <div className="container mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="fade-up">
              <h3 className="font-bold text-[#0D215C] mb-3" style={{ fontFamily: "Manrope, sans-serif" }}>Information</h3>
              <p className="text-[#584237] text-sm leading-relaxed mb-4" style={{ fontFamily: "Hanken Grotesk, sans-serif" }}>
                As a nonprofit organization, we are dedicated to improving access to education and essential support for underserved communities.
              </p>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-[#584237]" style={{ fontFamily: "Hanken Grotesk, sans-serif" }}>
                  <MapPin className="w-4 h-4 text-[#EE701E]" /> 7053, Chiredzi
                </div>
                <div className="flex items-center gap-2 text-sm text-[#584237]" style={{ fontFamily: "Hanken Grotesk, sans-serif" }}>
                  <Mail className="w-4 h-4 text-[#EE701E]" /> info@hoperisingeducationglobal.org
                </div>
              </div>
            </div>
            <div className="fade-up stagger-2">
              <h3 className="font-bold text-[#0D215C] mb-3" style={{ fontFamily: "Manrope, sans-serif" }}>Latest Works</h3>
              <div className="space-y-3">
                {[
                  { title: "Food Is Giving to Them", date: "July 29, 2025 by Patience" },
                  { title: "Buy Some Books for Children", date: "July 29, 2025 by Patience" },
                  { title: "Tools for Success Campaign", date: "April 15, 2025 by Team" },
                ].map(({ title, date }) => (
                  <div key={title} className="border-l-2 border-[#EE701E] pl-3">
                    <p className="font-semibold text-[#0D215C] text-sm" style={{ fontFamily: "Hanken Grotesk, sans-serif" }}>{title}</p>
                    <p className="text-[#EE701E] text-xs" style={{ fontFamily: "Hanken Grotesk, sans-serif" }}>{date}</p>
                  </div>
                ))}
              </div>
            </div>
            <div className="fade-up stagger-3">
              <h3 className="font-bold text-[#0D215C] mb-3" style={{ fontFamily: "Manrope, sans-serif" }}>Donate</h3>
              <p className="text-[#584237] text-sm leading-relaxed mb-4" style={{ fontFamily: "Hanken Grotesk, sans-serif" }}>
                Empower children's futures through our life-skills programs. Donate now and make a lasting difference.
              </p>
              <a href="/donate" className="btn-navy inline-block text-xs py-3">
                Support Our Mission
              </a>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
