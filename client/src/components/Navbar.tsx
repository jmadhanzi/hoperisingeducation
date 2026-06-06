/* Hope Rising Education — Navbar Component
 * Design: Sticky top nav, transparent-to-solid on scroll
 * Mobile: Hamburger menu with slide-down drawer
 * Auth-aware: shows "My Donations" link for signed-in users
 */
import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { Menu, X, Heart, LayoutList } from "lucide-react";
import { useAuth } from "@/_core/hooks/useAuth";

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/about", label: "About" },
  { href: "/programs", label: "Programs" },
  { href: "/impact", label: "Impact" },
  { href: "/team", label: "Team" },
  { href: "/get-involved", label: "Get Involved" },
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

  useEffect(() => {
    setMenuOpen(false);
  }, [location]);

  const isHome = location === "/";

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled || !isHome || menuOpen
            ? "bg-[#0D215C] shadow-lg"
            : "bg-transparent"
        }`}
      >
        <div className="container mx-auto flex items-center justify-between h-16 md:h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-9 h-9 bg-[#EE701E] rounded-lg flex items-center justify-center group-hover:scale-105 transition-transform">
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

          {/* Desktop Nav */}
          <nav className="hidden lg:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`px-3 py-2 text-sm font-medium rounded-md transition-colors duration-150 ${
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
                className={`flex items-center gap-1.5 px-3 py-2 text-sm font-medium rounded-md transition-colors duration-150 ${
                  location === "/my-donations"
                    ? "text-[#EE701E]"
                    : "text-white/80 hover:text-white hover:bg-white/10"
                }`}
                style={{ fontFamily: "Hanken Grotesk, sans-serif" }}
              >
                <LayoutList className="w-4 h-4" />
                My Donations
              </Link>
            )}
            <Link href="/donate" className="btn-primary text-xs py-2.5">
              Donate Now
            </Link>
          </div>

          {/* Mobile Hamburger */}
          <button
            className="lg:hidden text-white p-2 rounded-md hover:bg-white/10 transition-colors"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Toggle menu"
          >
            {menuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Menu */}
        <div
          className={`lg:hidden overflow-hidden transition-all duration-300 bg-[#0D215C] ${
            menuOpen ? "max-h-screen py-4 border-t border-white/10" : "max-h-0"
          }`}
        >
          <div className="container mx-auto flex flex-col gap-1 pb-4">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
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
                className={`px-4 py-3 text-sm font-medium rounded-lg transition-colors flex items-center gap-2 ${
                  location === "/my-donations"
                    ? "text-[#EE701E] bg-white/5"
                    : "text-white/80 hover:text-white hover:bg-white/10"
                }`}
                style={{ fontFamily: "Hanken Grotesk, sans-serif" }}
              >
                <LayoutList className="w-4 h-4" />
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
