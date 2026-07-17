/* Hope Rising Education — Navbar Component
 * Design: Sticky top nav, transparent-to-solid on scroll
 * Mobile: Hamburger menu with slide-down drawer
 * Auth-aware: shows "My Donations" link for signed-in users
 * Accessibility: aria-current, aria-expanded, aria-controls, keyboard-friendly
 */
import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { Menu, X, LayoutList } from "lucide-react";
import { useAuth } from "@/_core/hooks/useAuth";

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/about", label: "About" },
  { href: "/programs", label: "Programs" },
  { href: "/impact", label: "Impact" },
  { href: "/team", label: "Team" },
  { href: "/get-involved", label: "Get Involved" },
  { href: "/blog", label: "Blog" },
  { href: "/contact", label: "Contact" },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [location] = useLocation();
  const { user } = useAuth();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close mobile menu on navigation
  useEffect(() => {
    setMenuOpen(false);
  }, [location]);

  // Trap focus and allow Escape to close menu
  useEffect(() => {
    if (!menuOpen) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMenuOpen(false);
    };
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [menuOpen]);

  const isHome = location === "/";

  return (
    <>
      <header
        role="banner"
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled || !isHome || menuOpen
            ? "bg-[#0D215C] shadow-lg"
            : "bg-transparent"
        }`}
      >
        <div className="container mx-auto flex items-center justify-between h-16 md:h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center group" aria-label="Hope Rising Education — Home">
            <div className="bg-white/95 rounded-xl px-2 py-1 group-hover:scale-105 transition-transform duration-200 shadow-md">
              <img
                src="/manus-storage/hope-rising-logo_ff2ddb1c.png"
                alt="Hope Rising Education"
                className="h-9 md:h-11 w-auto max-w-[200px] object-contain"
              />
            </div>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden lg:flex items-center gap-1" aria-label="Main navigation">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                aria-current={location === link.href ? "page" : undefined}
                className={`px-3 py-2 text-sm font-medium rounded-md transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#EE701E] focus-visible:ring-offset-1 focus-visible:ring-offset-[#0D215C] ${
                  location === link.href
                    ? "text-[#EE701E]"
                    : "text-white/80 hover:text-white hover:bg-white/10"
                }`}
                style={{ fontFamily: "Hanken Grotesk, sans-serif" }}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Desktop CTA */}
          <div className="hidden lg:flex items-center gap-3">
            {user && (
              <Link
                href="/my-donations"
                aria-current={location === "/my-donations" ? "page" : undefined}
                className={`flex items-center gap-1.5 px-3 py-2 text-sm font-medium rounded-md transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#EE701E] focus-visible:ring-offset-1 focus-visible:ring-offset-[#0D215C] ${
                  location === "/my-donations"
                    ? "text-[#EE701E]"
                    : "text-white/80 hover:text-white hover:bg-white/10"
                }`}
                style={{ fontFamily: "Hanken Grotesk, sans-serif" }}
              >
                <LayoutList className="w-4 h-4" aria-hidden="true" />
                My Donations
              </Link>
            )}
            <Link href="/donate" className="btn-primary text-xs py-2.5">
              Donate Now
            </Link>
          </div>

          {/* Mobile Hamburger */}
          <button
            className="lg:hidden text-white p-2 rounded-md hover:bg-white/10 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#EE701E]"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Toggle menu"
            aria-expanded={menuOpen}
            aria-controls="mobile-menu"
          >
            {menuOpen ? <X className="w-6 h-6" aria-hidden="true" /> : <Menu className="w-6 h-6" aria-hidden="true" />}
          </button>
        </div>

        {/* Mobile Menu */}
        <div
          id="mobile-menu"
          className={`lg:hidden overflow-hidden transition-all duration-300 bg-[#0D215C] ${
            menuOpen ? "max-h-screen py-4 border-t border-white/10" : "max-h-0"
          }`}
        >
          <div className="container mx-auto flex flex-col gap-1 pb-4">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                aria-current={location === link.href ? "page" : undefined}
                className={`px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
                  location === link.href
                    ? "text-[#EE701E] bg-white/5"
                    : "text-white/80 hover:text-white hover:bg-white/10"
                }`}
                style={{ fontFamily: "Hanken Grotesk, sans-serif" }}
              >
                {link.label}
              </Link>
            ))}
            {user && (
              <Link
                href="/my-donations"
                aria-current={location === "/my-donations" ? "page" : undefined}
                className={`px-4 py-3 text-sm font-medium rounded-lg transition-colors flex items-center gap-2 ${
                  location === "/my-donations"
                    ? "text-[#EE701E] bg-white/5"
                    : "text-white/80 hover:text-white hover:bg-white/10"
                }`}
                style={{ fontFamily: "Hanken Grotesk, sans-serif" }}
              >
                <LayoutList className="w-4 h-4" aria-hidden="true" />
                My Donations
              </Link>
            )}
            <div className="pt-3 border-t border-white/10 mt-2">
              <Link href="/donate" className="btn-primary block text-center text-xs py-3">
                Donate Now
              </Link>
            </div>
          </div>
        </div>
      </header>
    </>
  );
}
