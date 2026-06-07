/* Hope Rising Education — Terms of Service */
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { PageSEO } from "@/lib/seo";
import { FileText } from "lucide-react";

export default function Terms() {
  return (
    <div className="min-h-screen">
      <PageSEO
        title="Terms of Service"
        description="Hope Rising Education's terms of service — the rules governing use of our website and donation platform."
        path="/terms"
      />
      <Navbar />

      {/* Hero */}
      <section className="bg-[#0D215C] pt-28 pb-16">
        <div className="container mx-auto text-center">
          <div className="w-14 h-14 bg-[#EE701E]/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <FileText className="w-7 h-7 text-[#EE701E]" aria-hidden="true" />
          </div>
          <h1
            className="text-3xl md:text-4xl font-extrabold text-white"
            style={{ fontFamily: "Manrope, sans-serif" }}
          >
            Terms of Service
          </h1>
          <p className="text-white/70 mt-3" style={{ fontFamily: "Hanken Grotesk, sans-serif" }}>
            Last updated: January 1, 2026
          </p>
        </div>
      </section>

      <section className="py-20 bg-white">
        <div className="container mx-auto max-w-3xl">
          <div
            className="prose prose-lg max-w-none text-[#584237]"
            style={{ fontFamily: "Hanken Grotesk, sans-serif" }}
          >
            <h2 className="text-[#0D215C] font-bold" style={{ fontFamily: "Manrope, sans-serif" }}>
              1. Acceptance of Terms
            </h2>
            <p>
              By accessing or using the Hope Rising Education website, you agree to be bound by
              these Terms of Service. If you do not agree, please do not use our website.
            </p>

            <h2 className="text-[#0D215C] font-bold" style={{ fontFamily: "Manrope, sans-serif" }}>
              2. Donations
            </h2>
            <p>
              All donations are processed securely via Stripe. Donations are voluntary and
              non-refundable except in cases of processing error. Hope Rising Education is a
              registered nonprofit; donations may be tax-deductible in your jurisdiction —
              consult a tax adviser for guidance.
            </p>

            <h2 className="text-[#0D215C] font-bold" style={{ fontFamily: "Manrope, sans-serif" }}>
              3. Use of the Website
            </h2>
            <p>You agree not to:</p>
            <ul>
              <li>Use the site for any unlawful purpose.</li>
              <li>Attempt to gain unauthorized access to any system or account.</li>
              <li>Submit false or misleading information through any form.</li>
              <li>Interfere with the security or integrity of the website.</li>
            </ul>

            <h2 className="text-[#0D215C] font-bold" style={{ fontFamily: "Manrope, sans-serif" }}>
              4. Intellectual Property
            </h2>
            <p>
              All content on this website — including text, images, logos, and curriculum
              materials — is the property of Hope Rising Education and may not be reproduced
              without prior written permission.
            </p>

            <h2 className="text-[#0D215C] font-bold" style={{ fontFamily: "Manrope, sans-serif" }}>
              5. Limitation of Liability
            </h2>
            <p>
              Hope Rising Education provides this website &ldquo;as is&rdquo; and makes no
              warranties regarding uptime or accuracy of content. We are not liable for any
              indirect damages arising from use of the site.
            </p>

            <h2 className="text-[#0D215C] font-bold" style={{ fontFamily: "Manrope, sans-serif" }}>
              6. Changes
            </h2>
            <p>
              We may update these terms at any time. Continued use of the website after changes
              constitutes acceptance.
            </p>

            <h2 className="text-[#0D215C] font-bold" style={{ fontFamily: "Manrope, sans-serif" }}>
              7. Contact
            </h2>
            <p>
              Questions?{" "}
              <a href="mailto:info@hoperisingeducationglobal.org" className="text-[#EE701E] hover:underline">
                info@hoperisingeducationglobal.org
              </a>
            </p>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
