/* Hope Rising Education — Footer Component
 * Design: Dark navy background, orange accents, organized columns
 * Social: Facebook, Instagram, Twitter/X, TikTok, YouTube
 */
import { Link } from "wouter";
import { Heart, MapPin, Mail, Phone, Facebook, Instagram, Twitter, Youtube, Globe } from "lucide-react";

// TikTok SVG icon (not in lucide-react)
function TikTokIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
      aria-hidden="true"
    >
      <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.33-6.34V8.69a8.18 8.18 0 0 0 4.78 1.52V6.75a4.85 4.85 0 0 1-1.01-.06z" />
    </svg>
  );
}

const socialLinks = [
  {
    href: "https://www.facebook.com/hoperisingeducation",
    label: "Facebook",
    icon: <Facebook className="w-4 h-4" />,
    hoverColor: "hover:bg-[#1877F2]",
  },
  {
    href: "https://www.instagram.com/hoperisingeducation",
    label: "Instagram",
    icon: <Instagram className="w-4 h-4" />,
    hoverColor: "hover:bg-[#E1306C]",
  },
  {
    href: "https://twitter.com/hoperisingedu",
    label: "Twitter / X",
    icon: <Twitter className="w-4 h-4" />,
    hoverColor: "hover:bg-[#1DA1F2]",
  },
  {
    href: "https://www.tiktok.com/@hoperisingeducation",
    label: "TikTok",
    icon: <TikTokIcon className="w-4 h-4" />,
    hoverColor: "hover:bg-[#010101]",
  },
  {
    href: "https://www.youtube.com/@hoperisingeducation",
    label: "YouTube",
    icon: <Youtube className="w-4 h-4" />,
    hoverColor: "hover:bg-[#FF0000]",
  },
];

export default function Footer() {
  return (
    <footer className="bg-[#0D215C] text-white">
      {/* Main Footer */}
      <div className="container mx-auto py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Brand Column */}
          <div className="lg:col-span-1">
            <Link href="/" className="flex items-center gap-2 mb-4 group w-fit">
              <div className="w-9 h-9 bg-[#EE701E] rounded-lg flex items-center justify-center">
                <Heart className="w-5 h-5 text-white fill-white" />
              </div>
              <div>
                <span
                  className="font-extrabold text-lg leading-none text-white"
                  style={{ fontFamily: "Manrope, sans-serif" }}
                >
                  Hope Rising
                </span>
                <span
                  className="block text-[10px] text-[#EE701E] tracking-widest uppercase leading-none"
                  style={{ fontFamily: "Hanken Grotesk, sans-serif" }}
                >
                  Education
                </span>
              </div>
            </Link>
            <p
              className="text-white/70 text-sm leading-relaxed mb-5"
              style={{ fontFamily: "Hanken Grotesk, sans-serif" }}
            >
              Dedicated to improving educational outcomes for underserved children and families in Zimbabwe and beyond.
            </p>

            {/* Social Media Buttons */}
            <div className="flex flex-wrap gap-2">
              {socialLinks.map((s) => (
                <a
                  key={s.label}
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={s.label}
                  className={`w-9 h-9 bg-white/10 ${s.hoverColor} rounded-lg flex items-center justify-center transition-colors duration-200`}
                >
                  {s.icon}
                </a>
              ))}
              <a
                href="https://hoperisingeducationglobal.org"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Website"
                className="w-9 h-9 bg-white/10 hover:bg-[#EE701E] rounded-lg flex items-center justify-center transition-colors duration-200"
              >
                <Globe className="w-4 h-4" />
              </a>
            </div>

            {/* Social label */}
            <p
              className="text-white/40 text-xs mt-3"
              style={{ fontFamily: "Hanken Grotesk, sans-serif" }}
            >
              Follow us for updates &amp; impact stories
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4
              className="font-bold text-sm tracking-widest uppercase text-[#EE701E] mb-4"
              style={{ fontFamily: "Hanken Grotesk, sans-serif" }}
            >
              Quick Links
            </h4>
            <ul className="space-y-2.5">
              {[
                { href: "/", label: "Home" },
                { href: "/about", label: "About Us" },
                { href: "/programs", label: "Programs" },
                { href: "/impact", label: "Our Impact" },
                { href: "/team", label: "Our Team" },
                { href: "/get-involved", label: "Get Involved" },
              ].map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-white/70 hover:text-[#EE701E] text-sm transition-colors duration-150"
                    style={{ fontFamily: "Hanken Grotesk, sans-serif" }}
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Programs */}
          <div>
            <h4
              className="font-bold text-sm tracking-widest uppercase text-[#EE701E] mb-4"
              style={{ fontFamily: "Hanken Grotesk, sans-serif" }}
            >
              Programs
            </h4>
            <ul className="space-y-2.5">
              {[
                "My Best Me Curriculum",
                "School Fees Support",
                "Tutoring & Mentorship",
                "Nutrition & Meals",
                "Hygiene & Supplies",
                "Safe Learning Spaces",
              ].map((item) => (
                <li key={item}>
                  <Link
                    href="/programs"
                    className="text-white/70 hover:text-[#EE701E] text-sm transition-colors duration-150"
                    style={{ fontFamily: "Hanken Grotesk, sans-serif" }}
                  >
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4
              className="font-bold text-sm tracking-widest uppercase text-[#EE701E] mb-4"
              style={{ fontFamily: "Hanken Grotesk, sans-serif" }}
            >
              Contact Us
            </h4>
            <ul className="space-y-3">
              <li className="flex items-start gap-3">
                <MapPin className="w-4 h-4 text-[#EE701E] mt-0.5 shrink-0" />
                <span
                  className="text-white/70 text-sm"
                  style={{ fontFamily: "Hanken Grotesk, sans-serif" }}
                >
                  Chompani Primary School P. 7053, Chiredzi, Zimbabwe
                </span>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="w-4 h-4 text-[#EE701E] shrink-0" />
                <a
                  href="mailto:info@hoperisingeducationglobal.org"
                  className="text-white/70 hover:text-[#EE701E] text-sm transition-colors"
                  style={{ fontFamily: "Hanken Grotesk, sans-serif" }}
                >
                  info@hoperisingeducationglobal.org
                </a>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="w-4 h-4 text-[#EE701E] shrink-0" />
                <span
                  className="text-white/70 text-sm"
                  style={{ fontFamily: "Hanken Grotesk, sans-serif" }}
                >
                  +263 776 129 568
                </span>
              </li>
            </ul>
            <div className="mt-5">
              <Link href="/donate" className="btn-primary text-xs py-2.5 inline-block">
                Donate Now
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-white/10">
        <div className="container mx-auto py-5 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p
            className="text-white/50 text-xs"
            style={{ fontFamily: "Hanken Grotesk, sans-serif" }}
          >
            © {new Date().getFullYear()} Hope Rising Education. All rights reserved.
          </p>
          <div className="flex gap-5">
            <Link
              href="/privacy"
              className="text-white/50 hover:text-white/80 text-xs transition-colors"
              style={{ fontFamily: "Hanken Grotesk, sans-serif" }}
            >
              Privacy Policy
            </Link>
            <Link
              href="/terms"
              className="text-white/50 hover:text-white/80 text-xs transition-colors"
              style={{ fontFamily: "Hanken Grotesk, sans-serif" }}
            >
              Terms of Service
            </Link>
            <Link
              href="/contact"
              className="text-white/50 hover:text-white/80 text-xs transition-colors"
              style={{ fontFamily: "Hanken Grotesk, sans-serif" }}
            >
              FAQ
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
