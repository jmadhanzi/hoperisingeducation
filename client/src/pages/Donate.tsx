/* Hope Rising Education — Donate Page with Stripe Checkout */
import { useState, useEffect } from "react";
import { Link, useSearch } from "wouter";
import {
  Heart, CheckCircle, XCircle, Loader2, Lock, ArrowRight,
  Star, Users, BookOpen, Utensils, RefreshCw, Shield,
} from "lucide-react";
import { toast } from "sonner";
import Navbar from "@/components/Navbar";
import FundraisingProgress from "@/components/FundraisingProgress";
import Footer from "@/components/Footer";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";

const DONATE_IMG =
  "https://d2xsxph8kpxj0f.cloudfront.net/310519663208076335/8TaPKuh8NEV6zjk5GTYvjo/donate-cta-LxpaJsEwFJpap6SNuPu4Uk.webp";

const IMPACT_ITEMS = [
  { icon: BookOpen, amount: 25, label: "Provides a week of school supplies for one child" },
  { icon: Utensils, amount: 50, label: "Covers a month of nutritious meals for one child" },
  { icon: Users, amount: 100, label: "Funds a full term of tutoring and mentorship" },
  { icon: Star, amount: 250, label: "Sponsors a child's school fees for an entire year" },
];

const PRESET_AMOUNTS = [25, 50, 100, 250, 500, 1000];

const TRUST_SIGNALS = [
  "100% of donations go directly to children's education",
  "Full financial transparency and annual reports",
  "Registered nonprofit organisation",
  "Secure, encrypted payment via Stripe",
  "Immediate tax receipt provided",
  "Monthly impact reports for recurring donors",
];

export default function Donate() {
  const searchString = useSearch();
  const params = new URLSearchParams(searchString);
  const successParam = params.get("success");
  const cancelledParam = params.get("cancelled");

  const { user } = useAuth();

  const [selectedAmount, setSelectedAmount] = useState<number>(50);
  const [customAmount, setCustomAmount] = useState<string>("");
  const [useCustom, setUseCustom] = useState(false);
  const [isRecurring, setIsRecurring] = useState(false);
  const [donorName, setDonorName] = useState("");
  const [donorEmail, setDonorEmail] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (user) {
      setDonorName(user.name ?? "");
      setDonorEmail(user.email ?? "");
    }
  }, [user]);

  const effectiveAmountCents = useCustom
    ? Math.round(parseFloat(customAmount || "0") * 100)
    : selectedAmount * 100;

  const createCheckout = trpc.donations.createCheckoutSession.useMutation({
    onSuccess: (data) => {
      if (data.checkoutUrl) {
        toast.success("Redirecting to secure checkout…", { duration: 3000 });
        window.open(data.checkoutUrl, "_blank");
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

  // ── Success page ──
  if (successParam === "true") {
    return (
      <div className="min-h-screen">
        <Navbar />
        <section className="min-h-[80vh] flex items-center justify-center bg-[#F8F9FA]">
          <div className="max-w-lg mx-auto text-center p-8">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-10 h-10 text-green-600" />
            </div>
            <h1
              className="text-3xl font-extrabold text-[#0D215C] mb-4"
              style={{ fontFamily: "Manrope, sans-serif" }}
            >
              Thank You for Your Generosity!
            </h1>
            <p
              className="text-[#584237] mb-8 leading-relaxed"
              style={{ fontFamily: "Hanken Grotesk, sans-serif" }}
            >
              Your donation has been received and will directly support children's education in Zimbabwe.
              A receipt has been sent to your email. Together, we are making hope rise.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link href="/" className="btn-primary">Back to Home</Link>
              <Link href="/impact" className="btn-navy">See Our Impact</Link>
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
        <Navbar />
        <section className="min-h-[80vh] flex items-center justify-center bg-[#F8F9FA]">
          <div className="max-w-lg mx-auto text-center p-8">
            <div className="w-20 h-20 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <XCircle className="w-10 h-10 text-[#EE701E]" />
            </div>
            <h1
              className="text-3xl font-extrabold text-[#0D215C] mb-4"
              style={{ fontFamily: "Manrope, sans-serif" }}
            >
              Donation Cancelled
            </h1>
            <p
              className="text-[#584237] mb-6"
              style={{ fontFamily: "Hanken Grotesk, sans-serif" }}
            >
              No charges were made. You can try again whenever you're ready — every contribution matters.
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
      <Navbar />

      {/* ── HERO ── */}
      <section className="relative py-28 overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url('${DONATE_IMG}')` }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[#0D215C]/80 to-[#0D215C]/90" />
        <div className="relative z-10 container mx-auto text-center text-white pt-16">
          <p className="section-label text-[#EE701E] mb-3">Make a Difference Today</p>
          <h1
            className="text-4xl md:text-5xl font-extrabold mb-4"
            style={{ fontFamily: "Manrope, sans-serif" }}
          >
            Give <span className="text-[#EE701E]">Hope</span> Today
          </h1>
          <p
            className="text-white/80 max-w-xl mx-auto text-lg"
            style={{ fontFamily: "Hanken Grotesk, sans-serif" }}
          >
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
                <h2
                  className="text-2xl font-extrabold text-[#0D215C] mb-2"
                  style={{ fontFamily: "Manrope, sans-serif" }}
                >
                  Make a Donation
                </h2>
                <p
                  className="text-[#584237] text-sm mb-6"
                  style={{ fontFamily: "Hanken Grotesk, sans-serif" }}
                >
                  Choose a giving level or enter a custom amount. Every contribution makes a real difference.
                </p>

                {/* One-time / Monthly toggle */}
                <div className="flex gap-2 mb-8 bg-[#F8F9FA] rounded-xl p-1">
                  <button
                    onClick={() => setIsRecurring(false)}
                    className={`flex-1 py-3 rounded-lg font-semibold text-sm transition-all duration-200 ${
                      !isRecurring
                        ? "bg-white text-[#0D215C] card-shadow"
                        : "text-[#584237] hover:text-[#0D215C]"
                    }`}
                    style={{ fontFamily: "Hanken Grotesk, sans-serif" }}
                  >
                    One-Time Gift
                  </button>
                  <button
                    onClick={() => setIsRecurring(true)}
                    className={`flex-1 py-3 rounded-lg font-semibold text-sm transition-all duration-200 flex items-center justify-center gap-2 ${
                      isRecurring
                        ? "bg-[#EE701E] text-white card-shadow"
                        : "text-[#584237] hover:text-[#0D215C]"
                    }`}
                    style={{ fontFamily: "Hanken Grotesk, sans-serif" }}
                  >
                    <RefreshCw className="w-4 h-4" /> Monthly Gift
                  </button>
                </div>

                {/* Preset amounts */}
                <div className="grid grid-cols-3 gap-3 mb-4">
                  {PRESET_AMOUNTS.map((amt) => (
                    <button
                      key={amt}
                      onClick={() => { setSelectedAmount(amt); setUseCustom(false); setCustomAmount(""); }}
                      className={`py-3 rounded-xl font-bold text-base border-2 transition-all duration-200 active:scale-[0.97] ${
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

                {/* Custom amount */}
                <div className="mb-8">
                  <label
                    className="block text-sm font-semibold text-[#0D215C] mb-2"
                    style={{ fontFamily: "Hanken Grotesk, sans-serif" }}
                  >
                    Or enter a custom amount
                  </label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#584237] font-bold">$</span>
                    <input
                      type="number"
                      min="1"
                      step="1"
                      placeholder="Enter amount"
                      value={customAmount}
                      onChange={(e) => { setCustomAmount(e.target.value); setUseCustom(true); }}
                      onFocus={() => setUseCustom(true)}
                      className={`w-full pl-8 pr-4 py-3 rounded-xl border-2 outline-none transition-colors ${
                        useCustom
                          ? "border-[#EE701E] bg-[#EE701E]/5"
                          : "border-[#E7E8E9] focus:border-[#EE701E]/50"
                      }`}
                      style={{ fontFamily: "Hanken Grotesk, sans-serif" }}
                    />
                  </div>
                </div>

                {/* Donor info */}
                <div className="border-t border-[#E7E8E9] pt-6 mb-6">
                  <h3
                    className="font-bold text-[#0D215C] mb-4"
                    style={{ fontFamily: "Manrope, sans-serif" }}
                  >
                    Your Information{" "}
                    <span className="text-[#584237] font-normal text-sm">(optional)</span>
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label
                        className="block text-sm font-semibold text-[#0D215C] mb-1"
                        style={{ fontFamily: "Hanken Grotesk, sans-serif" }}
                      >
                        Name
                      </label>
                      <input
                        type="text"
                        placeholder="Your name"
                        value={donorName}
                        onChange={(e) => setDonorName(e.target.value)}
                        className="w-full px-4 py-3 rounded-xl border-2 border-[#E7E8E9] focus:border-[#EE701E]/50 outline-none transition-colors"
                        style={{ fontFamily: "Hanken Grotesk, sans-serif" }}
                      />
                    </div>
                    <div>
                      <label
                        className="block text-sm font-semibold text-[#0D215C] mb-1"
                        style={{ fontFamily: "Hanken Grotesk, sans-serif" }}
                      >
                        Email
                      </label>
                      <input
                        type="email"
                        placeholder="your@email.com"
                        value={donorEmail}
                        onChange={(e) => setDonorEmail(e.target.value)}
                        className="w-full px-4 py-3 rounded-xl border-2 border-[#E7E8E9] focus:border-[#EE701E]/50 outline-none transition-colors"
                        style={{ fontFamily: "Hanken Grotesk, sans-serif" }}
                      />
                    </div>
                  </div>
                  <div className="mt-4">
                    <label
                      className="block text-sm font-semibold text-[#0D215C] mb-1"
                      style={{ fontFamily: "Hanken Grotesk, sans-serif" }}
                    >
                      Message{" "}
                      <span className="text-[#584237] font-normal">(optional)</span>
                    </label>
                    <textarea
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
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Preparing Checkout…
                    </>
                  ) : (
                    <>
                      <Heart className="w-5 h-5" />
                      Donate{" "}
                      {effectiveAmountCents >= 100
                        ? `$${(effectiveAmountCents / 100).toFixed(0)}${isRecurring ? "/month" : ""}`
                        : ""}
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>

                {/* Security note */}
                <div className="flex items-center justify-center gap-2 mt-4 text-[#584237] text-xs">
                  <Lock className="w-3.5 h-3.5" />
                  <span style={{ fontFamily: "Hanken Grotesk, sans-serif" }}>
                    Secured by Stripe. Your payment info is never stored on our servers.
                  </span>
                </div>

                {/* Test card hint (dev only) */}
                <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg text-xs text-blue-700">
                  <strong>Test mode:</strong> Use card <code>4242 4242 4242 4242</code>, any future expiry, and any CVC.
                </div>
              </div>
            </div>

            {/* ── SIDEBAR ── */}
            <div className="space-y-6">
              {/* Live fundraising progress bar */}
              <FundraisingProgress />

              {/* Impact breakdown */}
              <div className="bg-white rounded-2xl p-6 card-shadow">
                <h3
                  className="font-extrabold text-[#0D215C] mb-4"
                  style={{ fontFamily: "Manrope, sans-serif" }}
                >
                  Your Impact
                </h3>
                <div className="space-y-4">
                  {IMPACT_ITEMS.map(({ icon: Icon, amount, label }) => (
                    <div key={amount} className="flex items-start gap-3">
                      <div className="w-9 h-9 bg-[#EE701E]/10 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                        <Icon className="w-4 h-4 text-[#EE701E]" />
                      </div>
                      <div>
                        <span
                          className="font-bold text-[#0D215C] text-sm"
                          style={{ fontFamily: "Manrope, sans-serif" }}
                        >
                          ${amount}
                        </span>{" "}
                        <span
                          className="text-[#584237] text-sm"
                          style={{ fontFamily: "Hanken Grotesk, sans-serif" }}
                        >
                          {label}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Trust signals */}
              <div className="bg-[#0D215C] rounded-2xl p-6 text-white">
                <h3
                  className="font-extrabold mb-4"
                  style={{ fontFamily: "Manrope, sans-serif" }}
                >
                  Why Give to Hope Rising?
                </h3>
                <ul className="space-y-3">
                  {TRUST_SIGNALS.map((item) => (
                    <li key={item} className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-[#EE701E] flex-shrink-0 mt-0.5" />
                      <span
                        className="text-white/80 text-sm"
                        style={{ fontFamily: "Hanken Grotesk, sans-serif" }}
                      >
                        {item}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Monthly giving CTA */}
              <div className="bg-[#EE701E]/10 border border-[#EE701E]/30 rounded-2xl p-6">
                <div className="flex items-center gap-3 mb-3">
                  <Heart className="w-6 h-6 text-[#EE701E]" />
                  <h4
                    className="font-bold text-[#0D215C]"
                    style={{ fontFamily: "Manrope, sans-serif" }}
                  >
                    Monthly Giving
                  </h4>
                </div>
                <p
                  className="text-[#584237] text-sm leading-relaxed mb-4"
                  style={{ fontFamily: "Hanken Grotesk, sans-serif" }}
                >
                  Become a monthly donor and provide consistent, reliable support that allows us to plan long-term programmes and reach more children.
                </p>
                <button
                  onClick={() => { setIsRecurring(true); window.scrollTo({ top: 0, behavior: "smooth" }); }}
                  className="btn-outline-orange w-full text-xs py-2.5"
                >
                  Become a Monthly Donor
                </button>
              </div>

              {/* Other ways to give */}
              <div className="bg-white rounded-2xl p-6 card-shadow">
                <div className="flex items-center gap-2 mb-2">
                  <Shield className="w-5 h-5 text-[#0D215C]" />
                  <h4
                    className="font-bold text-[#0D215C]"
                    style={{ fontFamily: "Manrope, sans-serif" }}
                  >
                    Other Ways to Give
                  </h4>
                </div>
                <p
                  className="text-[#584237] text-sm mb-4"
                  style={{ fontFamily: "Hanken Grotesk, sans-serif" }}
                >
                  Bank transfer, cheque, or in-kind donations are all welcome.
                </p>
                <Link href="/contact" className="btn-navy text-sm py-2.5 px-5 inline-block">
                  Contact Us
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
