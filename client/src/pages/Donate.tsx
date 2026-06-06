/* Hope Rising Education — Donate Page */
import { useEffect, useRef, useState } from "react";
import { Link } from "wouter";
import { Heart, Shield, CheckCircle, RefreshCw, DollarSign, Users, BookOpen, Utensils } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Toaster } from "@/components/ui/sonner";
import { toast } from "sonner";

const DONATE_IMG = "https://d2xsxph8kpxj0f.cloudfront.net/310519663208076335/8TaPKuh8NEV6zjk5GTYvjo/donate-cta-LxpaJsEwFJpap6SNuPu4Uk.webp";

const givingLevels = [
  { amount: 25, label: "Supporter", impact: "Provides school supplies for 1 child for a month", icon: BookOpen, color: "#4BAF4F" },
  { amount: 50, label: "Champion", impact: "Covers a child's school fees for one month", icon: DollarSign, color: "#EE701E" },
  { amount: 100, label: "Advocate", impact: "Feeds a child nutritious meals for a full month", icon: Utensils, color: "#0D215C" },
  { amount: 250, label: "Partner", impact: "Sponsors a child's full education for one term", icon: Users, color: "#EE701E" },
  { amount: 500, label: "Benefactor", impact: "Funds an entire classroom's supplies for a semester", icon: BookOpen, color: "#4BAF4F" },
  { amount: 1000, label: "Visionary", impact: "Supports a full year of education for 4 children", icon: Heart, color: "#0D215C" },
];

const trustSignals = [
  "100% of donations go directly to children's education",
  "Full financial transparency and annual reports",
  "Registered nonprofit organization",
  "Secure, encrypted donation processing",
  "Immediate tax receipt provided",
  "Monthly impact reports for recurring donors",
];

export default function Donate() {
  const [selectedAmount, setSelectedAmount] = useState(50);
  const [customAmount, setCustomAmount] = useState("");
  const [isRecurring, setIsRecurring] = useState(false);
  const [donorName, setDonorName] = useState("");
  const [donorEmail, setDonorEmail] = useState("");
  const [donorMessage, setDonorMessage] = useState("");

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

  const finalAmount = customAmount ? parseFloat(customAmount) : selectedAmount;

  const handleDonate = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success(`Thank you, ${donorName || "friend"}! Your $${finalAmount}${isRecurring ? "/month" : ""} donation is being processed. We'll send a receipt to ${donorEmail || "your email"}.`);
  };

  return (
    <div className="min-h-screen" ref={revealRef}>
      <Navbar />
      <Toaster />

      {/* Hero */}
      <section className="relative h-72 md:h-96 flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url('${DONATE_IMG}')` }} />
        <div className="absolute inset-0 bg-gradient-to-b from-[#0D215C]/70 to-[#0D215C]/85" />
        <div className="relative z-10 text-center text-white pt-16">
          <p className="text-xs text-white/60 mb-2" style={{ fontFamily: "Hanken Grotesk, sans-serif" }}>Home &rsaquo; Donate</p>
          <h1 className="text-4xl md:text-5xl font-extrabold" style={{ fontFamily: "Manrope, sans-serif" }}>
            Give <span className="text-[#EE701E]">Hope</span> Today
          </h1>
          <p className="text-white/70 mt-3 max-w-xl mx-auto px-4" style={{ fontFamily: "Hanken Grotesk, sans-serif" }}>
            Every dollar you give directly funds a child's education, meals, and future.
          </p>
        </div>
      </section>

      {/* Donation Form + Trust */}
      <section className="py-20 bg-[#F8F9FA]">
        <div className="container mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
            {/* Donation Form */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-2xl p-8 card-shadow fade-up">
                <h2 className="text-2xl font-extrabold text-[#0D215C] mb-2" style={{ fontFamily: "Manrope, sans-serif" }}>
                  Make a Donation
                </h2>
                <p className="text-[#584237] text-sm mb-6" style={{ fontFamily: "Hanken Grotesk, sans-serif" }}>
                  Choose a giving level or enter a custom amount. Every contribution makes a real difference.
                </p>

                {/* Recurring Toggle */}
                <div className="flex gap-3 mb-6">
                  <button
                    onClick={() => setIsRecurring(false)}
                    className={`flex-1 py-2.5 rounded-lg text-sm font-semibold transition-all ${!isRecurring ? "bg-[#0D215C] text-white" : "bg-[#F8F9FA] text-[#584237] border border-[#DFC0B2]"}`}
                    style={{ fontFamily: "Hanken Grotesk, sans-serif" }}
                  >
                    One-Time Gift
                  </button>
                  <button
                    onClick={() => setIsRecurring(true)}
                    className={`flex-1 py-2.5 rounded-lg text-sm font-semibold transition-all flex items-center justify-center gap-2 ${isRecurring ? "bg-[#EE701E] text-white" : "bg-[#F8F9FA] text-[#584237] border border-[#DFC0B2]"}`}
                    style={{ fontFamily: "Hanken Grotesk, sans-serif" }}
                  >
                    <RefreshCw className="w-4 h-4" /> Monthly Gift
                  </button>
                </div>

                {/* Giving Levels */}
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-6">
                  {givingLevels.map(({ amount, label, impact, icon: Icon, color }) => (
                    <button
                      key={amount}
                      onClick={() => { setSelectedAmount(amount); setCustomAmount(""); }}
                      className={`rounded-xl p-4 text-left transition-all border-2 ${selectedAmount === amount && !customAmount ? "border-[#EE701E] bg-[#EE701E]/5" : "border-[#E7E8E9] hover:border-[#EE701E]/50"}`}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <Icon className="w-4 h-4" style={{ color }} />
                        <span className="text-xs font-semibold text-[#584237]" style={{ fontFamily: "Hanken Grotesk, sans-serif" }}>{label}</span>
                      </div>
                      <p className="text-xl font-extrabold text-[#0D215C]" style={{ fontFamily: "Manrope, sans-serif" }}>${amount}</p>
                      <p className="text-xs text-[#584237] mt-1 leading-tight" style={{ fontFamily: "Hanken Grotesk, sans-serif" }}>{impact}</p>
                    </button>
                  ))}
                </div>

                {/* Custom Amount */}
                <div className="mb-6">
                  <label className="block text-sm font-semibold text-[#0D215C] mb-2" style={{ fontFamily: "Hanken Grotesk, sans-serif" }}>
                    Or enter a custom amount
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#584237] font-bold">$</span>
                    <input
                      type="number"
                      placeholder="Enter amount"
                      value={customAmount}
                      onChange={(e) => setCustomAmount(e.target.value)}
                      className="w-full pl-8 pr-4 py-3 border-2 border-[#E7E8E9] rounded-lg focus:border-[#EE701E] focus:outline-none transition-colors"
                      style={{ fontFamily: "Hanken Grotesk, sans-serif" }}
                      min="1"
                    />
                  </div>
                </div>

                <form onSubmit={handleDonate}>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className="block text-sm font-semibold text-[#0D215C] mb-1.5" style={{ fontFamily: "Hanken Grotesk, sans-serif" }}>Full Name</label>
                      <input
                        type="text"
                        placeholder="Your full name"
                        value={donorName}
                        onChange={(e) => setDonorName(e.target.value)}
                        className="w-full px-4 py-3 border-2 border-[#E7E8E9] rounded-lg focus:border-[#EE701E] focus:outline-none transition-colors"
                        style={{ fontFamily: "Hanken Grotesk, sans-serif" }}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-[#0D215C] mb-1.5" style={{ fontFamily: "Hanken Grotesk, sans-serif" }}>Email Address</label>
                      <input
                        type="email"
                        placeholder="your@email.com"
                        value={donorEmail}
                        onChange={(e) => setDonorEmail(e.target.value)}
                        className="w-full px-4 py-3 border-2 border-[#E7E8E9] rounded-lg focus:border-[#EE701E] focus:outline-none transition-colors"
                        style={{ fontFamily: "Hanken Grotesk, sans-serif" }}
                      />
                    </div>
                  </div>
                  <div className="mb-6">
                    <label className="block text-sm font-semibold text-[#0D215C] mb-1.5" style={{ fontFamily: "Hanken Grotesk, sans-serif" }}>Message (Optional)</label>
                    <textarea
                      placeholder="Share why you're donating..."
                      value={donorMessage}
                      onChange={(e) => setDonorMessage(e.target.value)}
                      rows={3}
                      className="w-full px-4 py-3 border-2 border-[#E7E8E9] rounded-lg focus:border-[#EE701E] focus:outline-none transition-colors resize-none"
                      style={{ fontFamily: "Hanken Grotesk, sans-serif" }}
                    />
                  </div>
                  <button type="submit" className="btn-primary w-full py-4 text-base">
                    Donate ${finalAmount || 0}{isRecurring ? "/month" : ""} Now
                  </button>
                </form>

                <div className="flex items-center gap-2 mt-4 text-[#584237] text-xs" style={{ fontFamily: "Hanken Grotesk, sans-serif" }}>
                  <Shield className="w-4 h-4 text-[#4BAF4F]" />
                  Secure, encrypted donation processing. Your information is protected.
                </div>
              </div>
            </div>

            {/* Trust Sidebar */}
            <div className="space-y-5 fade-up stagger-2">
              <div className="bg-[#0D215C] rounded-2xl p-6 text-white">
                <h3 className="font-bold text-lg mb-4" style={{ fontFamily: "Manrope, sans-serif" }}>Why Give to Hope Rising?</h3>
                <div className="space-y-3">
                  {trustSignals.map((signal) => (
                    <div key={signal} className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-[#4BAF4F] mt-0.5 shrink-0" />
                      <span className="text-white/80 text-sm" style={{ fontFamily: "Hanken Grotesk, sans-serif" }}>{signal}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-[#EE701E]/10 border border-[#EE701E]/30 rounded-2xl p-6">
                <h4 className="font-bold text-[#0D215C] mb-3" style={{ fontFamily: "Manrope, sans-serif" }}>Your Impact</h4>
                <div className="space-y-3">
                  {givingLevels.slice(0, 4).map(({ amount, impact }) => (
                    <div key={amount} className="flex items-start gap-2">
                      <span className="text-[#EE701E] font-bold text-sm w-12 shrink-0" style={{ fontFamily: "Manrope, sans-serif" }}>${amount}</span>
                      <span className="text-[#584237] text-sm" style={{ fontFamily: "Hanken Grotesk, sans-serif" }}>{impact}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white rounded-2xl p-6 card-shadow">
                <div className="flex items-center gap-3 mb-3">
                  <Heart className="w-6 h-6 text-[#EE701E]" />
                  <h4 className="font-bold text-[#0D215C]" style={{ fontFamily: "Manrope, sans-serif" }}>Monthly Giving</h4>
                </div>
                <p className="text-[#584237] text-sm leading-relaxed mb-4" style={{ fontFamily: "Hanken Grotesk, sans-serif" }}>
                  Become a monthly donor and provide consistent, reliable support that allows us to plan long-term programs and reach more children.
                </p>
                <button onClick={() => setIsRecurring(true)} className="btn-outline-orange w-full text-xs py-2.5">
                  Become a Monthly Donor
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
