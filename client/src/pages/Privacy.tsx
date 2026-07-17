/* Hope Rising Education — Privacy Policy Page */
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { PageSEO } from "@/lib/seo";
import { Shield } from "lucide-react";

export default function Privacy() {
  return (
    <div className="min-h-screen">
      <PageSEO
        title="Privacy Policy"
        description="Hope Rising Education's privacy policy — how we collect, use, and protect your personal data."
        path="/privacy"
      />
      <Navbar />

      {/* Hero */}
      <section className="bg-[#0D215C] pt-28 pb-16">
        <div className="container mx-auto text-center">
          <div className="w-14 h-14 bg-[#EE701E]/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Shield className="w-7 h-7 text-[#EE701E]" aria-hidden="true" />
          </div>
          <h1
            className="text-3xl md:text-4xl font-extrabold text-white"
            style={{ fontFamily: "Manrope, sans-serif" }}
          >
            Privacy Policy
          </h1>
          <p
            className="text-white/70 mt-3 max-w-xl mx-auto"
            style={{ fontFamily: "Hanken Grotesk, sans-serif" }}
          >
            Last updated: January 1, 2026
          </p>
        </div>
      </section>

      {/* Content */}
      <section className="py-20 bg-white">
        <div className="container mx-auto max-w-3xl">
          <div
            className="prose prose-lg max-w-none text-[#584237]"
            style={{ fontFamily: "Hanken Grotesk, sans-serif" }}
          >
            <h2 className="text-[#0D215C] font-bold" style={{ fontFamily: "Manrope, sans-serif" }}>
              1. Who We Are
            </h2>
            <p>
              Hope Rising Education (&ldquo;we&rdquo;, &ldquo;us&rdquo;, &ldquo;our&rdquo;) is a
              nonprofit organisation operating at Chompani Primary School P. 7053, Chiredzi,
              Zimbabwe. We can be reached at{" "}
              <a href="mailto:info@hoperisingeducationglobal.org" className="text-[#EE701E] hover:underline">
                info@hoperisingeducationglobal.org
              </a>.
            </p>

            <h2 className="text-[#0D215C] font-bold" style={{ fontFamily: "Manrope, sans-serif" }}>
              2. What Data We Collect
            </h2>
            <p>When you donate, contact us, or create an account, we may collect:</p>
            <ul>
              <li>
                <strong>Identity data</strong> — your name and email address.
              </li>
              <li>
                <strong>Payment data</strong> — processed by Raisely when you continue to its hosted donation page. Hope Rising does not collect or store your payment card details on this website.
              </li>
              <li>
                <strong>Contact data</strong> — messages you send us via the contact form.
              </li>
              <li>
                <strong>Usage data</strong> — anonymised analytics collected via Umami (cookie-free,
                GDPR-compliant). No personal identifiers are stored.
              </li>
            </ul>

            <h2 className="text-[#0D215C] font-bold" style={{ fontFamily: "Manrope, sans-serif" }}>
              3. How We Use Your Data
            </h2>
            <ul>
              <li>To process your donation and send you a receipt.</li>
              <li>To send impact updates if you opt in.</li>
              <li>To respond to enquiries submitted via the contact form.</li>
              <li>To improve our website using aggregated, anonymous analytics.</li>
            </ul>
            <p>We never sell, rent, or share your personal data with third parties for marketing.</p>

            <h2 className="text-[#0D215C] font-bold" style={{ fontFamily: "Manrope, sans-serif" }}>
              4. Legal Basis (GDPR)
            </h2>
            <p>
              For visitors in the European Economic Area, we process your data on the basis of{" "}
              <em>contract performance</em> (processing your donation) and{" "}
              <em>legitimate interests</em> (improving our services). Where we send optional
              marketing updates, we rely on your <em>consent</em>.
            </p>

            <h2 className="text-[#0D215C] font-bold" style={{ fontFamily: "Manrope, sans-serif" }}>
              5. Data Retention
            </h2>
            <p>
              Donation records are retained for seven years for legal and accounting purposes.
              Contact form submissions are deleted after 24 months. You may request deletion of
              your personal data at any time by emailing us.
            </p>

            <h2 className="text-[#0D215C] font-bold" style={{ fontFamily: "Manrope, sans-serif" }}>
              6. Third-Party Services
            </h2>
            <ul>
              <li>
                <strong>Raisely</strong> — hosted donation and payment processing. Please review the privacy information provided on the active Raisely donation page before completing a gift.
              </li>
              <li>
                <strong>Amazon CloudFront</strong> — image and asset delivery via CDN.
              </li>
              <li>
                <strong>Umami</strong> — privacy-first, cookie-free analytics. No personal data
                is collected.
              </li>
            </ul>

            <h2 className="text-[#0D215C] font-bold" style={{ fontFamily: "Manrope, sans-serif" }}>
              7. Your Rights
            </h2>
            <p>You have the right to:</p>
            <ul>
              <li>Access the personal data we hold about you.</li>
              <li>Request correction of inaccurate data.</li>
              <li>Request deletion of your data (&ldquo;right to be forgotten&rdquo;).</li>
              <li>Object to or restrict our processing of your data.</li>
              <li>Lodge a complaint with your local data protection authority.</li>
            </ul>
            <p>
              To exercise any of these rights, contact us at{" "}
              <a href="mailto:info@hoperisingeducationglobal.org" className="text-[#EE701E] hover:underline">
                info@hoperisingeducationglobal.org
              </a>.
            </p>

            <h2 className="text-[#0D215C] font-bold" style={{ fontFamily: "Manrope, sans-serif" }}>
              8. Cookies
            </h2>
            <p>
              We use a single session cookie strictly necessary for authentication. Our analytics
              (Umami) are cookie-free. We do not use tracking, advertising, or third-party cookies.
            </p>

            <h2 className="text-[#0D215C] font-bold" style={{ fontFamily: "Manrope, sans-serif" }}>
              9. Changes to This Policy
            </h2>
            <p>
              We may update this policy periodically. Material changes will be noted at the top
              of this page with a revised &ldquo;Last updated&rdquo; date.
            </p>

            <h2 className="text-[#0D215C] font-bold" style={{ fontFamily: "Manrope, sans-serif" }}>
              10. Contact
            </h2>
            <p>
              Questions about this policy? Email us at{" "}
              <a href="mailto:info@hoperisingeducationglobal.org" className="text-[#EE701E] hover:underline">
                info@hoperisingeducationglobal.org
              </a>{" "}
              or write to us at Chompani Primary School P. 7053, Chiredzi, Zimbabwe.
            </p>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
