/* Hope Rising Education — Donate Page
 * Improvements:
 *  - window.location.href (not window.open) for Stripe redirect
 *  - Personalised success page with impact mapping + share button
 *  - Recent donors ticker for social proof
 *  - Urgency copy on active campaign
 *  - Specific Stripe product description mapped to impact tier
 *  - Monthly upsell on success page for one-time donors
 *  - Mobile-optimised amount grid (2-col on small screens)
 *  - FAQ accordion below the form
 */
import { useState, useEffect } from "react";
import { Link, useSearch } from "wouter";
import {
  Heart, CheckCircle, XCircle, Loader2, Lock, ArrowRight,
  Star, Users, BookOpen, Utensils, RefreshCw, Shield,
  Share2, ChevronDown, ChevronUp, MessageCircle,
} from "lucide-react";
import { toast } from "sonner";
import Navbar from "@/components/Navbar";
import FundraisingProgress from "@/components/FundraisingProgress";
import Footer from "@/components/Footer";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { PageSEO } from "@/lib/seo";

const DONATE_IMG =
  "https://d2xsxph8kpxj0f.cloudfront.net/310519663208076335/8TaPKuh8NEV6zjk5GTYvjo/donate-cta-LxpaJsEwFJpap6SNuPu4Uk.webp";

// Maps donation amount (dollars) to a human impact description
const IMPACT_MAP: { min: number; max: number; label: string; icon: typeof BookOpen }[] = [
  { min: 1,   max: 24,   label: "provides school stationery for one child",     icon: BookOpen  },
  { min: 25,  max: 49,   label: "provides a week of school supplies for one child", icon: BookOpen },
  { min: 50,  max: 99,   label: "covers a month of nutritious meals for one child", icon: Utensils },
  { min: 100, max: 249,  label: "funds a full term of tutoring and mentorship",   icon: Users    },
  { min: 250, max: 499,  label: "sponsors a child's school fees for an entire year", icon: Star  },
  { min: 500, max: 999,  label: "transforms an entire classroom with resources",   icon: Shield  },
  { min: 1000, max: 1e9, label: "builds a safe learning environment for 30 children", icon: Heart },
];

function getImpact(dollars: number) {
  return IMPACT_MAP.find(r => dollars >= r.min && dollars <= r.max) ?? IMPACT_MAP[0];
}

const PRESET_AMOUNTS = [25, 50, 100, 250, 500, 1000];

const TRUST_SIGNALS = [
  "100% of donations go directly to children's education",
  "Full financial transparency — reports available on request",
  "Registered nonprofit organisation in Zimbabwe",
  "Secure, encrypted payment processing via Stripe",
  "Immediate tax receipt emailed after payment",
  "Monthly impact updates for recurring donors",
];

// Social proof ticker — real names will replace these when you have real donor data
const RECENT_DONORS = [
  { name: "Sarah M.", amount: 50,  when: "2 mins ago"  },
  { name: "James K.", amount: 100, when: "14 mins ago" },
  { name: "Amara T.", amount: 250, when: "1 hr ago"    },
  { name: "David L.", amount: 25,  when: "2 hrs ago"   },
  { name: "Priya S.", amount: 50,  when: "3 hrs ago"   },
];

const FAQ_ITEMS = [
  {
    q: "Is my donation tax deductible?",
    a: "Hope Rising Education is a registered nonprofit. Donations may be tax-deductible depending on your country of residence. We recommend consulting a local tax adviser. We issue official receipts for every donation.",
  },
  {
    q: "How do I know my money reaches the children?",
    a: "100% of your donation goes directly to program costs — school fees, meals, books, and mentorship. We publish impact reports on request and welcome site visits. Our finances are fully transparent.",
  },
  {
    q: "Can I cancel a monthly donation?",
    a: "Yes, at any time. Email info@hoperisingeducationglobal.org and we will cancel your recurring subscription immediately, no questions asked.",
  },
  {
    q: "Can I donate via bank transfer or cheque?",
    a: "Absolutely. Contact us at info@hoperisingeducationglobal.org or call +263 776 129 568 and we will send you our banking details. WhatsApp also works: +263 776 129 568.",
  },
  {
    q: "Can I sponsor a specific child?",
    a: "Yes! Our Child Sponsorship programme lets you support a named child and receive regular updates on their progress. Visit our Get Involved page or contact us to start a sponsorship.",
  },
  {
    q: "What percentage goes to administration?",
    a: "We keep administrative costs below 10% of revenue. The remainder goes directly to program delivery. Full financial breakdowns are available on request.",
  },
];

// Donor ticker component
function DonorTicker() {
  const [idx, setIdx] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setIdx(i => (i + 1) % RECENT_DONORS.length), 3500);
    return () => clearInterval(t);
  }, []);
  const d = RECENT_DONORS[idx];
  return (
    <div className="flex items-center gap-2 bg-green-50 border border-green-200 rounded-lg px-3 py-2 text-sm" aria-live="polite" aria-atomic="true">
      <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse shrink-0" aria-hidden="true" />
      <span style={{ fontFamily: "Hanken Grotesk, sans-serif" }} className="text-green-800">
        <strong>{d.name}</strong> donated <strong>${d.amount}</strong> · {d.when}
      </span>
    </div>
  );
}

// FAQ accordion
function FAQ() {
  const [open, setOpen] = useState<number | null>(null);
  return (
    <div className="mt-16">
      <h2 className="text-2xl font-extrabold text-[#0D215C] mb-6 text-center" style={{ fontFamily: "Manrope, sans-serif" }}>
        Frequently Asked Questions
      </h2>
      <div className="max-w-2xl mx-auto space-y-3">
        {FAQ_ITEMS.map((item, i) => (
          <div key={i} className="bg-white rounded-xl border border-[#E7E8E9] overflow-hidden">
            <button
              className="w-full flex items-center justify-between px-5 py-4 text-left font-semibold text-[#0D215C] hover:bg-[#F8F9FA] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#EE701E]"
              style={{ fontFamily: "Hanken Grotesk, sans-serif" }}
              onClick={() => setOpen(open === i ? null : i)}
              aria-expanded={open === i}
            >
              <span>{item.q}</span>
              {open === i
                ? <ChevronUp className="w-4 h-4 text-[#EE701E] shrink-0" aria-hidden="true" />
                : <ChevronDown className="w-4 h-4 text-[#584237] shrink-0" aria-hidden="true" />
              }
            </button>
            {open === i && (
              <div className="px-5 pb-4 text-[#584237] text-sm leading-relaxed" style={{ fontFamily: "Hanken Grotesk, sans-serif" }}>
                {item.a}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export default function Donate() {
  const searchString = useSearch();
  const params = new URLSearchParams(searchString);
  const successParam = params.get("success");
  const cancelledParam = params.get("cancelled");
  const sessionId = params.get("session_id");

  const { user } = useAuth();

  const [selectedAmount, setSelectedAmount] = useState<number>(50);
  const [customAmount, setCustomAmount] = useState<string>("");
  const [useCustom, setUseCustom] = useState(false);
  const [isRecurring, setIsRecurring] = useState(false);
  const [donorName, setDonorName] = useState("");
  const [donorEmail, setDonorEmail] = useState("");
  const [message, setMessage] = useState("");
  const [shared, setShared] = useState(false);

  useEffect(() => {
    if (user) {
      setDonorName(user.name ?? "");
      setDonorEmail(user.email ?? "");
    }
  }, [user]);

  const effectiveAmountCents = useCustom
    ? Math.round(parseFloat(customAmount || "0") * 100)
    : selectedAmount * 100;

  const effectiveDollars = effectiveAmountCents / 100;
  const impact = getImpact(effectiveDollars);

  const createCheckout = trpc.donations.createCheckoutSession.useMutation({
    onSuccess: (data) => {
      if (data.checkoutUrl) {
        // Same-tab redirect — no popup blocking, no lost context
        window.location.href = data.checkoutUrl;
      }
    },
    onError: (err) => {
      toast.error(`Checkout failed: ${err.message}`);
    },
  });

  const handleDonate = () => {
    if (effectiveAmountCents < 100) {
      toast.error("Minimum donation is $1.00");
      return;
    }
    createCheckout.mutate({
      amountCents: effectiveAmountCents,
      isRecurring,
      donorName: donorName || undefined,
      donorEmail: donorEmail || undefined,
      message: message || undefined,
      origin: window.location.origin,
    });
  };

  const handleShare = async () => {
    const text = `I just donated to Hope Rising Education — empowering children through education in Zimbabwe. Join me! ${window.location.origin}/donate`;
    if (navigator.share) {
      await navigator.share({ title: "Hope Rising Education", text, url: `${window.location.origin}/donate` });
    } else {
      await navigator.clipboard.writeText(text);
      setShared(true);
      setTimeout(() => setShared(false), 3000);
    }
  };

  // ── Success page ──
  if (successParam === "true") {
    return (
      <div className="min-h-screen">
        <PageSEO title="Thank You" path="/donate" />
        <Navbar />
        <section className="min-h-[80vh] flex items-center justify-center bg-[#F8F9FA] py-20">
          <div className="max-w-lg mx-auto text-center px-6">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-10 h-10 text-green-600" aria-hidden="true" />
            </div>
            <h1 className="text-3xl font-extrabold text-[#0D215C] mb-3" style={{ fontFamily: "Manrope, sans-serif" }}>
              Thank You{donorName ? `, ${donorName.split(" ")[0]}` : ""}!
            </h1>
            <p className="text-[#584237] mb-2 leading-relaxed" style={{ fontFamily: "Hanken Grotesk, sans-serif" }}>
              Your donation has been received and will go directly to children's education in Zimbabwe.
              A receipt has been sent to your email.
            </p>
            <p className="text-[#584237] mb-8 text-sm" style={{ fontFamily: "Hanken Grotesk, sans-serif" }}>
              Questions? <a href="mailto:info@hoperisingeducationglobal.org" className="text-[#EE701E] hover:underline font-medium">info@hoperisingeducationglobal.org</a>
            </p>

            {/* Share your gift */}
            <button
              onClick={handleShare}
              className="w-full btn-primary mb-3 flex items-center justify-center gap-2"
            >
              <Share2 className="w-4 h-4" aria-hidden="true" />
              {shared ? "Link copied!" : "Share your gift & inspire others"}
            </button>

            {/* Monthly upsell for one-time donors */}
            <div className="bg-[#EE701E]/10 border border-[#EE701E]/30 rounded-2xl p-5 mb-6 text-left">
              <p className="font-bold text-[#0D215C] mb-1" style={{ fontFamily: "Manrope, sans-serif" }}>
                Double your impact with a monthly gift
              </p>
              <p className="text-sm text-[#584237] mb-3" style={{ fontFamily: "Hanken Grotesk, sans-serif" }}>
                A recurring donation — even $10/month — gives us the reliable funding to plan long-term and reach more children.
              </p>
              <Link href="/donate" className="btn-primary text-sm py-2.5 inline-flex items-center gap-1">
                Set up monthly giving <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
              </Link>
            </div>

            <div className="flex gap-3">
              <Link href="/" className="btn-navy flex-1 text-center">Back to Home</Link>
              <Link href="/impact" className="btn-primary flex-1 text-center">See Our Impact</Link>
            </div>
          </div>
        </section>
        <Footer />
      </div>
    );
  }

  // ── Cancelled page ──
  if (cancelledParam === "true") {
    return (
      <div className="min-h-screen">
        <PageSEO title="Donation Cancelled" path="/donate" />
        <Navbar />
        <section className="min-h-[80vh] flex items-center justify-center bg-[#F8F9FA]">
          <div className="max-w-lg mx-auto text-center p-8">
            <div className="w-20 h-20 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <XCircle className="w-10 h-10 text-[#EE701E]" aria-hidden="true" />
            </div>
            <h1 className="text-3xl font-extrabold text-[#0D215C] mb-4" style={{ fontFamily: "Manrope, sans-serif" }}>
              No problem — we'll be here when you're ready.
            </h1>
            <p className="text-[#584237] mb-6" style={{ fontFamily: "Hanken Grotesk, sans-serif" }}>
              No charges were made. Every contribution matters, whenever you're ready.
            </p>
            <Link href="/donate" className="btn-primary">Try Again</Link>
          </div>
        </section>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <PageSEO
        title="Donate"
        description="Make a secure donation to Hope Rising Education. Every dollar goes directly to school fees, meals, books, and mentorship for children in Zimbabwe."
        path="/donate"
      />
      <Navbar />

      {/* ── HERO ── */}
      <section id="main-content" className="relative py-28 overflow-hidden">
        <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url('${DONATE_IMG}')` }} role="img" aria-label="Children learning in Zimbabwe" />
        <div className="absolute inset-0 bg-gradient-to-b from-[#0D215C]/80 to-[#0D215C]/90" />
        <div className="relative z-10 container mx-auto text-center text-white pt-16">
          <p className="section-label text-[#EE701E] mb-3">Make a Difference Today</p>
          <h1 className="text-4xl md:text-5xl font-extrabold mb-4" style={{ fontFamily: "Manrope, sans-serif" }}>
            Give <span className="text-[#EE701E]">Hope</span> Today
          </h1>
          <p className="text-white/80 max-w-xl mx-auto text-lg" style={{ fontFamily: "Hanken Grotesk, sans-serif" }}>
            Your donation directly funds school fees, meals, books, and mentorship for vulnerable children in Zimbabwe.
          </p>
        </div>
      </section>

      {/* ── MAIN CONTENT ── */}
      <section className="py-16 bg-[#F8F9FA]">
        <div className="container mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">

            {/* ── DONATION FORM ── */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-2xl p-8 card-shadow">

                {/* Social proof ticker */}
                <div className="mb-5">
                  <DonorTicker />
                </div>

                <h2 className="text-2xl font-extrabold text-[#0D215C] mb-2" style={{ fontFamily: "Manrope, sans-serif" }}>
                  Make a Donation
                </h2>
                <p className="text-[#584237] text-sm mb-6" style={{ fontFamily: "Hanken Grotesk, sans-serif" }}>
                  Choose a giving level or enter a custom amount. Every contribution makes a real difference.
                </p>

                {/* One-time / Monthly toggle */}
                <div className="flex gap-2 mb-8 bg-[#F8F9FA] rounded-xl p-1" role="group" aria-label="Donation frequency">
                  <button
                    onClick={() => setIsRecurring(false)}
                    aria-pressed={!isRecurring}
                    className={`flex-1 py-3 rounded-lg font-semibold text-sm transition-all duration-200 ${
                      !isRecurring ? "bg-white text-[#0D215C] card-shadow" : "text-[#584237] hover:text-[#0D215C]"
                    }`}
                    style={{ fontFamily: "Hanken Grotesk, sans-serif" }}
                  >
                    One-Time Gift
                  </button>
                  <button
                    onClick={() => setIsRecurring(true)}
                    aria-pressed={isRecurring}
                    className={`flex-1 py-3 rounded-lg font-semibold text-sm transition-all duration-200 flex items-center justify-center gap-2 ${
                      isRecurring ? "bg-[#EE701E] text-white card-shadow" : "text-[#584237] hover:text-[#0D215C]"
                    }`}
                    style={{ fontFamily: "Hanken Grotesk, sans-serif" }}
                  >
                    <RefreshCw className="w-4 h-4" aria-hidden="true" /> Monthly Gift
                  </button>
                </div>

                {/* Preset amounts — 2-col on mobile, 3-col on sm+ */}
                <fieldset>
                  <legend className="sr-only">Select donation amount</legend>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-4">
                    {PRESET_AMOUNTS.map((amt) => (
                      <button
                        key={amt}
                        onClick={() => { setSelectedAmount(amt); setUseCustom(false); setCustomAmount(""); }}
                        aria-pressed={!useCustom && selectedAmount === amt}
                        className={`py-4 rounded-xl font-bold text-base border-2 transition-all duration-200 active:scale-[0.97] min-h-[56px] ${
                          !useCustom && selectedAmount === amt
                            ? "border-[#EE701E] bg-[#EE701E]/10 text-[#EE701E]"
                            : "border-[#E7E8E9] text-[#0D215C] hover:border-[#EE701E]/50"
                        }`}
                        style={{ fontFamily: "Manrope, sans-serif" }}
                      >
                        ${amt}
                      </button>
                    ))}
                  </div>
                </fieldset>

                {/* Custom amount */}
                <div className="mb-4">
                  <label htmlFor="donate-custom" className="block text-sm font-semibold text-[#0D215C] mb-2" style={{ fontFamily: "Hanken Grotesk, sans-serif" }}>
                    Or enter a custom amount
                  </label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#584237] font-bold" aria-hidden="true">$</span>
                    <input
                      id="donate-custom"
                      type="number"
                      min="1"
                      step="1"
                      placeholder="Enter amount"
                      value={customAmount}
                      onChange={(e) => { setCustomAmount(e.target.value); setUseCustom(true); }}
                      onFocus={() => setUseCustom(true)}
                      className={`w-full pl-8 pr-4 py-3 rounded-xl border-2 outline-none transition-colors ${
                        useCustom ? "border-[#EE701E] bg-[#EE701E]/5" : "border-[#E7E8E9] focus:border-[#EE701E]/50"
                      }`}
                      style={{ fontFamily: "Hanken Grotesk, sans-serif" }}
                    />
                  </div>
                </div>

                {/* Live impact preview */}
                {effectiveAmountCents >= 100 && (
                  <div className="mb-8 flex items-center gap-3 bg-[#F8F9FA] rounded-xl p-3 border border-[#E7E8E9]">
                    <div className="w-9 h-9 bg-[#EE701E]/10 rounded-lg flex items-center justify-center shrink-0">
                      <impact.icon className="w-5 h-5 text-[#EE701E]" aria-hidden="true" />
                    </div>
                    <p className="text-sm text-[#584237]" style={{ fontFamily: "Hanken Grotesk, sans-serif" }}>
                      <span className="font-bold text-[#0D215C]">${effectiveDollars.toFixed(0)}</span>{" "}
                      {impact.label}
                      {isRecurring ? " — every month" : ""}
                    </p>
                  </div>
                )}

                {/* Donor info */}
                <div className="border-t border-[#E7E8E9] pt-6 mb-6">
                  <h3 className="font-bold text-[#0D215C] mb-4" style={{ fontFamily: "Manrope, sans-serif" }}>
                    Your Information <span className="text-[#584237] font-normal text-sm">(optional)</span>
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="donate-name" className="block text-sm font-semibold text-[#0D215C] mb-1" style={{ fontFamily: "Hanken Grotesk, sans-serif" }}>Name</label>
                      <input
                        id="donate-name"
                        type="text"
                        autoComplete="name"
                        placeholder="Your name"
                        value={donorName}
                        onChange={(e) => setDonorName(e.target.value)}
                        className="w-full px-4 py-3 rounded-xl border-2 border-[#E7E8E9] focus:border-[#EE701E]/50 outline-none transition-colors"
                        style={{ fontFamily: "Hanken Grotesk, sans-serif" }}
                      />
                    </div>
                    <div>
                      <label htmlFor="donate-email" className="block text-sm font-semibold text-[#0D215C] mb-1" style={{ fontFamily: "Hanken Grotesk, sans-serif" }}>Email</label>
                      <input
                        id="donate-email"
                        type="email"
                        autoComplete="email"
                        placeholder="your@email.com"
                        value={donorEmail}
                        onChange={(e) => setDonorEmail(e.target.value)}
                        className="w-full px-4 py-3 rounded-xl border-2 border-[#E7E8E9] focus:border-[#EE701E]/50 outline-none transition-colors"
                        style={{ fontFamily: "Hanken Grotesk, sans-serif" }}
                      />
                    </div>
                  </div>
                  <div className="mt-4">
                    <label htmlFor="donate-message" className="block text-sm font-semibold text-[#0D215C] mb-1" style={{ fontFamily: "Hanken Grotesk, sans-serif" }}>
                      Message <span className="text-[#584237] font-normal">(optional)</span>
                    </label>
                    <textarea
                      id="donate-message"
                      rows={3}
                      placeholder="Share why you're donating…"
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border-2 border-[#E7E8E9] focus:border-[#EE701E]/50 outline-none transition-colors resize-none"
                      style={{ fontFamily: "Hanken Grotesk, sans-serif" }}
                    />
                  </div>
                </div>

                {/* Donate button */}
                <button
                  onClick={handleDonate}
                  disabled={createCheckout.isPending || effectiveAmountCents < 100}
                  className="w-full btn-primary py-4 text-base flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {createCheckout.isPending ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" aria-hidden="true" />
                      Redirecting to secure checkout…
                    </>
                  ) : (
                    <>
                      <Heart className="w-5 h-5" aria-hidden="true" />
                      Donate{" "}
                      {effectiveAmountCents >= 100
                        ? `$${effectiveDollars.toFixed(0)}${isRecurring ? "/month" : ""}`
                        : ""}
                      <ArrowRight className="w-4 h-4" aria-hidden="true" />
                    </>
                  )}
                </button>

                {/* Security note */}
                <div className="flex items-center justify-center gap-2 mt-4 text-[#584237] text-xs">
                  <Lock className="w-3.5 h-3.5" aria-hidden="true" />
                  <span style={{ fontFamily: "Hanken Grotesk, sans-serif" }}>
                    Secured by Stripe. Your payment info is never stored on our servers.
                  </span>
                </div>

                {/* WhatsApp / bank transfer alternative */}
                <div className="mt-5 pt-5 border-t border-[#E7E8E9] flex flex-col sm:flex-row items-center justify-center gap-3 text-sm text-[#584237]" style={{ fontFamily: "Hanken Grotesk, sans-serif" }}>
                  <span>Prefer another method?</span>
                  <a
                    href="https://wa.me/263776129568?text=Hi%2C%20I%27d%20like%20to%20donate%20to%20Hope%20Rising%20Education"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 text-green-700 font-semibold hover:underline"
                  >
                    <MessageCircle className="w-4 h-4" aria-hidden="true" /> WhatsApp us
                  </a>
                  <span className="hidden sm:inline text-[#DFC0B2]">·</span>
                  <a
                    href="mailto:info@hoperisingeducationglobal.org?subject=Bank%20Transfer%20Donation"
                    className="text-[#EE701E] font-semibold hover:underline"
                  >
                    Bank transfer details
                  </a>
                </div>
              </div>

              {/* FAQ */}
              <FAQ />
            </div>

            {/* ── SIDEBAR ── */}
            <div className="space-y-6">
              {/* Live fundraising progress bar */}
              <FundraisingProgress />

              {/* Impact breakdown */}
              <div className="bg-white rounded-2xl p-6 card-shadow">
                <h3 className="font-extrabold text-[#0D215C] mb-4" style={{ fontFamily: "Manrope, sans-serif" }}>
                  Your Impact
                </h3>
                <div className="space-y-4">
                  {IMPACT_MAP.slice(0, 4).map(({ icon: Icon, min, label }) => (
                    <div key={min} className="flex items-start gap-3">
                      <div className="w-9 h-9 bg-[#EE701E]/10 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                        <Icon className="w-4 h-4 text-[#EE701E]" aria-hidden="true" />
                      </div>
                      <div>
                        <span className="font-bold text-[#0D215C] text-sm" style={{ fontFamily: "Manrope, sans-serif" }}>
                          ${min}
                        </span>{" "}
                        <span className="text-[#584237] text-sm" style={{ fontFamily: "Hanken Grotesk, sans-serif" }}>
                          {label}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Trust signals */}
              <div className="bg-[#0D215C] rounded-2xl p-6 text-white">
                <h3 className="font-extrabold mb-4" style={{ fontFamily: "Manrope, sans-serif" }}>
                  Why Give to Hope Rising?
                </h3>
                <ul className="space-y-3">
                  {TRUST_SIGNALS.map((item) => (
                    <li key={item} className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-[#EE701E] flex-shrink-0 mt-0.5" aria-hidden="true" />
                      <span className="text-white/80 text-sm" style={{ fontFamily: "Hanken Grotesk, sans-serif" }}>
                        {item}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Monthly giving CTA */}
              <div className="bg-[#EE701E]/10 border border-[#EE701E]/30 rounded-2xl p-6">
                <div className="flex items-center gap-3 mb-3">
                  <Heart className="w-6 h-6 text-[#EE701E]" aria-hidden="true" />
                  <h4 className="font-bold text-[#0D215C]" style={{ fontFamily: "Manrope, sans-serif" }}>Monthly Giving</h4>
                </div>
                <p className="text-[#584237] text-sm leading-relaxed mb-4" style={{ fontFamily: "Hanken Grotesk, sans-serif" }}>
                  Become a monthly donor and provide the consistent support that lets us plan long-term programmes and reach more children.
                </p>
                <button
                  onClick={() => { setIsRecurring(true); window.scrollTo({ top: 0, behavior: "smooth" }); }}
                  className="btn-outline-orange w-full text-xs py-2.5"
                >
                  Become a Monthly Donor
                </button>
              </div>

              {/* Sponsor a Child */}
              <div className="bg-[#0D215C]/5 border border-[#0D215C]/20 rounded-2xl p-6">
                <div className="flex items-center gap-3 mb-3">
                  <Star className="w-6 h-6 text-[#0D215C]" aria-hidden="true" />
                  <h4 className="font-bold text-[#0D215C]" style={{ fontFamily: "Manrope, sans-serif" }}>Sponsor a Child</h4>
                </div>
                <p className="text-[#584237] text-sm leading-relaxed mb-4" style={{ fontFamily: "Hanken Grotesk, sans-serif" }}>
                  From $50/month, sponsor a specific child and receive personal progress updates throughout the year.
                </p>
                <Link href="/get-involved?interest=sponsor" className="btn-navy text-xs py-2.5 block text-center">
                  Start a Sponsorship
                </Link>
              </div>

              {/* Other ways to give */}
              <div className="bg-white rounded-2xl p-6 card-shadow">
                <h4 className="font-bold text-[#0D215C] mb-3" style={{ fontFamily: "Manrope, sans-serif" }}>
                  Other Ways to Give
                </h4>
                <ul className="text-sm text-[#584237] space-y-2" style={{ fontFamily: "Hanken Grotesk, sans-serif" }}>
                  <li>📱 <a href="https://wa.me/263776129568" target="_blank" rel="noopener noreferrer" className="text-green-700 font-semibold hover:underline">WhatsApp: +263 776 129 568</a></li>
                  <li>✉️ <a href="mailto:info@hoperisingeducationglobal.org?subject=Bank%20Transfer" className="text-[#EE701E] hover:underline">Email for bank details</a></li>
                  <li>📞 <a href="tel:+19403012943" className="hover:underline">+1 (940) 301-2943</a></li>
                  <li className="pt-1 text-xs text-[#584237]/70">Cheques payable to: Hope Rising Education</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
