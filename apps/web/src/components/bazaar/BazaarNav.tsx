"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Menu, X, ArrowLeft, Calendar, Phone, Globe, Mail, Check, ChevronDown } from "lucide-react";
import { translate } from "@/utils/translate";
import { apiGet } from "@/utils/api";
import { getStoredLocale, setStoredLocale, Locale, languageNames, locales } from "@/utils/i18n";

interface BazaarNavProps {
  eventTitle?: string;
  eventDateLabel?: string;
  isPortalActive?: boolean;
}

const languageFlags: Record<Locale, string> = {
  en: "🇬🇧",
  fr: "🇫🇷",
  es: "🇪🇸",
  zh: "🇨🇳",
  ar: "🇸🇦",
  ha: "🇳🇬",
};

export default function BazaarNav({
  eventTitle = "GloTrade International Trade Fair 2026",
  eventDateLabel = "1st – 5th Dec 2026",
  isPortalActive: propIsPortalActive,
}: BazaarNavProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [langDropdownOpen, setLangDropdownOpen] = useState(false);
  const [activeStatus, setActiveStatus] = useState<boolean | null>(
    propIsPortalActive !== undefined ? propIsPortalActive : null
  );
  const [currentLocale, setCurrentLocale] = useState<Locale>("en");
  const dropdownRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    setCurrentLocale(getStoredLocale());
    const handleLocaleChange = (e: any) => {
      if (e?.detail?.locale) {
        setCurrentLocale(e.detail.locale);
      }
    };
    window.addEventListener("i18n:locale", handleLocaleChange);
    return () => window.removeEventListener("i18n:locale", handleLocaleChange);
  }, []);

  // Close language dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setLangDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLanguageChange = (newLang: Locale) => {
    setStoredLocale(newLang);
    setCurrentLocale(newLang);
    setLangDropdownOpen(false);
    // Force refresh page to update translations across all components
    if (typeof window !== "undefined") {
      window.location.reload();
    }
  };

  useEffect(() => {
    if (propIsPortalActive !== undefined) {
      setActiveStatus(propIsPortalActive);
      return;
    }

    apiGet("/api/v1/bazaar/config")
      .then((res: any) => {
        const isActive = res?.data?.isPortalActive ?? res?.data?.data?.isPortalActive ?? true;
        setActiveStatus(isActive);
      })
      .catch(() => setActiveStatus(true));
  }, [propIsPortalActive]);

  // If portal is inactive and visitor is on a sub-page, redirect to main bazaar off-season waitlist page
  useEffect(() => {
    if (activeStatus === false && pathname && pathname !== "/bazaar") {
      router.replace("/bazaar");
    }
  }, [activeStatus, pathname, router]);

  const isPortalActive = activeStatus ?? true;

  const navLinks = [
    { href: "/trade-fair", label: translate("bazaar.navHome") || "Home" },
    { href: "/trade-fair/about", label: translate("bazaar.navAbout") || "About" },
    { href: "/trade-fair/tickets", label: translate("bazaar.navTickets") || "Tickets" },
    { href: "/trade-fair/exhibitors", label: translate("bazaar.navExhibitors") || "Exhibitors" },
    { href: "/trade-fair/promoter", label: "Promoters" },
    { href: "/trade-fair/sponsorship", label: translate("bazaar.navSponsorship") || "Sponsorship" },
    { href: "/trade-fair/programme", label: translate("bazaar.navProgramme") || "Programme" },
    { href: "/trade-fair/venue", label: translate("bazaar.navVenue") || "Venue" },
    { href: "/trade-fair/gallery", label: translate("bazaar.navGallery") || "Gallery" },
    { href: "/trade-fair/contact", label: translate("bazaar.navContact") || "Contact" },
  ];

  return (
    <header className="sticky top-0 z-50 bg-slate-950/95 backdrop-blur-md border-b border-amber-500/20 text-white">
      {/* Top micro banner */}
      <div className="bg-gradient-to-r from-amber-600 via-amber-500 to-amber-600 text-slate-950 font-semibold text-xs py-1.5 px-3 sm:px-6 flex items-center justify-between gap-2 shadow-sm">
        {/* Left: Date & Venue */}
        <div className="flex items-center gap-2 sm:gap-3">
          <span className="flex items-center gap-1 font-bold text-[11px] sm:text-xs">
            <Calendar size={13} className="shrink-0 text-slate-950" /> {eventDateLabel} • NACCAS, Asokoro, Abuja
          </span>
          <span className="hidden md:inline text-amber-950/40">|</span>
          <span className="hidden md:inline text-[11px] sm:text-xs">{translate("bazaar.annualFestival") || "International Trade & Investment Expo"}</span>
        </div>

        {/* Right: Phone Number, Language Selector & Main Platform Link */}
        <div className="flex items-center gap-2 sm:gap-3 ml-auto relative">
          {/* Phone Number */}
          <a
            href="https://wa.me/2347044600924"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 font-bold text-slate-950 hover:text-white transition-colors bg-slate-950/10 hover:bg-slate-950 px-2 py-0.5 rounded text-[11px] sm:text-xs"
            title="Chat on WhatsApp"
          >
            <Phone size={12} className="shrink-0" />
            <span>+234 704 460 0924</span>
          </a>

          {/* Interactive Language Selector Dropdown */}
          <div className="relative" ref={dropdownRef}>
            <button
              type="button"
              onClick={() => setLangDropdownOpen(!langDropdownOpen)}
              className="flex items-center gap-1.5 bg-slate-950 text-amber-400 px-2.5 py-1 rounded-lg border border-amber-400/40 text-[11px] sm:text-xs font-bold hover:bg-slate-900 transition-colors shadow-sm"
              aria-label="Select Language"
            >
              <Globe size={13} className="shrink-0 text-amber-400" />
              <span>{languageFlags[currentLocale]} {languageNames[currentLocale]}</span>
              <ChevronDown size={12} className={`transition-transform ${langDropdownOpen ? "rotate-180" : ""}`} />
            </button>

            {/* Floating Language Dropdown Menu */}
            {langDropdownOpen && (
              <div className="absolute right-0 top-full mt-1.5 w-44 bg-slate-900 border border-amber-500/40 rounded-xl shadow-2xl z-50 py-1 overflow-hidden animate-fadeIn">
                <div className="px-3 py-1.5 text-[10px] uppercase font-bold text-amber-400/80 border-b border-slate-800">
                  Select Language / Langue
                </div>
                {locales.map((loc) => {
                  const isSelected = currentLocale === loc;
                  return (
                    <button
                      key={loc}
                      type="button"
                      onClick={() => handleLanguageChange(loc)}
                      className={`w-full px-3 py-2 text-left text-xs font-semibold flex items-center justify-between transition-colors ${
                        isSelected
                          ? "bg-amber-500/20 text-amber-300 font-bold"
                          : "text-slate-200 hover:bg-slate-800 hover:text-white"
                      }`}
                    >
                      <span className="flex items-center gap-2">
                        <span>{languageFlags[loc]}</span>
                        <span>{languageNames[loc]}</span>
                      </span>
                      {isSelected && <Check size={14} className="text-amber-400 shrink-0" />}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Main Platform Link */}
          <Link
            href="/"
            className="hidden sm:flex underline items-center gap-1 font-bold text-slate-950 hover:text-white transition-colors text-[11px] sm:text-xs"
          >
            <ArrowLeft size={12} /> {translate("bazaar.mainPlatformLink") || "Main Platform"}
          </Link>
        </div>
      </div>

      <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Brand Logo */}
          <Link href="/trade-fair" className="flex items-center gap-3 group">
            <div className="w-12 h-12 rounded-xl bg-slate-900 border border-amber-500/40 flex items-center justify-center shadow-lg shadow-amber-500/20 group-hover:scale-105 transition-transform overflow-hidden">
              <img src="/bazaar_logo.jpg" alt="GloTrade International Trade Fair Logo" className="w-full h-full object-cover" />
            </div>
            <div>
              <span className="text-lg sm:text-xl font-extrabold tracking-tight bg-gradient-to-r from-amber-400 via-amber-200 to-amber-400 bg-clip-text text-transparent">
                GLOTRADE TRADE FAIR
              </span>
              <p className="text-[10px] uppercase tracking-widest text-amber-400/80 font-medium">
                International Trade Fair 2026 · Abuja
              </p>
            </div>
          </Link>

          {/* Desktop Links */}
          <nav className="hidden lg:flex items-center gap-1">
            {navLinks.map((link) => {
              const isActive =
                link.href === "/trade-fair"
                  ? pathname === "/trade-fair" || pathname === "/bazaar"
                  : pathname.startsWith(link.href) || pathname.startsWith(link.href.replace("/trade-fair", "/bazaar"));
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                    isActive
                      ? "text-amber-400 bg-amber-500/10 border border-amber-500/30"
                      : "text-slate-300 hover:text-white hover:bg-slate-800/60"
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>

          {/* Ticket CTA Button & Language Pill */}
          <div className="hidden lg:flex items-center gap-3">
            {isPortalActive ? (
              <Link
                href="/trade-fair/tickets"
                className="px-5 py-2.5 rounded-full bg-gradient-to-r from-emerald-500 via-amber-400 to-amber-500 hover:from-emerald-400 hover:to-amber-400 text-slate-950 font-black text-sm shadow-lg shadow-amber-500/20 transition-all hover:scale-105"
              >
                {translate("bazaar.bookTicketsCta") || "Get Fast-Track QR Pass"}
              </Link>
            ) : (
              <span className="px-4 py-2 rounded-full bg-slate-800 text-amber-400/80 text-xs font-semibold border border-amber-500/20">
                {translate("bazaar.portalOffline") || "Off-Season"}
              </span>
            )}
          </div>

          {/* Mobile Menu Toggle Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 focus:outline-none"
            aria-label="Toggle Navigation Menu"
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-slate-900 border-b border-amber-500/20 px-4 pt-4 pb-6 space-y-4 animate-fadeIn">
          {/* Mobile Language Selector Grid */}
          <div className="p-4 bg-slate-950 border border-slate-800 rounded-2xl space-y-3">
            <div className="flex items-center gap-2 text-xs font-bold text-amber-400 uppercase tracking-wider">
              <Globe size={16} />
              <span>Select Language / Chwazi Lang:</span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {locales.map((loc) => {
                const isSelected = currentLocale === loc;
                return (
                  <button
                    key={loc}
                    type="button"
                    onClick={() => handleLanguageChange(loc)}
                    className={`py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-between border transition-all ${
                      isSelected
                        ? "bg-amber-500 text-slate-950 border-amber-400 shadow-md"
                        : "bg-slate-900 text-slate-300 border-slate-800 hover:bg-slate-800 hover:text-white"
                    }`}
                  >
                    <span className="flex items-center gap-1.5">
                      <span>{languageFlags[loc]}</span>
                      <span>{languageNames[loc]}</span>
                    </span>
                    {isSelected && <Check size={14} className="shrink-0" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Mobile Contact Quick Actions */}
          <div className="grid grid-cols-1 gap-2">
            <a
              href="https://wa.me/2347044600924"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-emerald-600/20 text-emerald-400 font-bold border border-emerald-500/30 text-xs"
            >
              <Phone size={16} /> +234 704 460 0924 (WhatsApp)
            </a>
            <a
              href="mailto:tradefair@glotrade.online"
              className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl bg-slate-950 text-slate-300 font-medium border border-slate-800 text-xs"
            >
              <Mail size={14} /> tradefair@glotrade.online
            </a>
          </div>

          {/* Navigation Links */}
          <div className="space-y-1 pt-2">
            {navLinks.map((link) => {
              const isActive =
                link.href === "/trade-fair"
                  ? pathname === "/trade-fair" || pathname === "/bazaar"
                  : pathname.startsWith(link.href) || pathname.startsWith(link.href.replace("/trade-fair", "/bazaar"));
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`block px-4 py-3 rounded-xl text-base font-medium transition-all ${
                    isActive
                      ? "text-amber-400 bg-amber-500/10 border border-amber-500/30 font-bold"
                      : "text-slate-300 hover:text-white hover:bg-slate-800"
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </div>

          {isPortalActive && (
            <div className="pt-2 space-y-2">
              <Link
                href="/trade-fair/tickets"
                onClick={() => setMobileMenuOpen(false)}
                className="block text-center w-full py-3.5 rounded-xl bg-gradient-to-r from-emerald-500 via-amber-400 to-amber-500 hover:from-emerald-400 hover:to-amber-400 text-slate-950 font-black text-base shadow-lg shadow-amber-500/20 transition-all"
              >
                {translate("bazaar.bookTicketsCta") || "Get Fast-Track QR Pass · Free"}
              </Link>

              <Link
                href="/"
                onClick={() => setMobileMenuOpen(false)}
                className="block text-center w-full py-2.5 rounded-xl bg-slate-950 text-slate-300 font-medium text-xs border border-slate-800"
              >
                ← Return to Main GloTrade Platform
              </Link>
            </div>
          )}
        </div>
      )}
    </header>
  );
}
