"use client";
import Link from "next/link";
import { Globe, HelpCircle, Phone, ShieldCheck, X, Check, ChevronDown } from "lucide-react";
import { useEffect, useState, useRef } from "react";
import { setStoredLocale, translate, getStoredLocale, Locale, languageNames, locales } from "@/utils/i18n";
import { useRouter } from "next/navigation";
import { apiGet } from "@/utils/api";

const languageFlags: Record<Locale, string> = {
  en: "🇬🇧",
  fr: "🇫🇷",
  es: "🇪🇸",
  zh: "🇨🇳",
  ar: "🇸🇦",
  ha: "🇳🇬",
};

export default function UpperHeader() {
  const router = useRouter();
  const [locale, setLocale] = useState<Locale>("en");
  const [showContactMenu, setShowContactMenu] = useState(false);
  const [showLangMenu, setShowLangMenu] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [bazaarActive, setBazaarActive] = useState<boolean | null>(null);
  const langRef = useRef<HTMLDivElement>(null);
  const contactRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
    setLocale(getStoredLocale());

    apiGet("/api/v1/bazaar/config")
      .then((res: any) => {
        const isActive = res?.data?.isPortalActive ?? res?.data?.data?.isPortalActive ?? res?.data?.active;
        if (isActive !== undefined) {
          setBazaarActive(Boolean(isActive));
        }
      })
      .catch(() => setBazaarActive(true));

    const onLocale = (e: Event) => {
      const detail = (e as CustomEvent).detail as { locale: Locale };
      setLocale(detail.locale);
    };
    window.addEventListener("i18n:locale", onLocale as EventListener);

    return () => {
      window.removeEventListener("i18n:locale", onLocale as EventListener);
    };
  }, []);

  // Close menus on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (langRef.current && !langRef.current.contains(event.target as Node)) {
        setShowLangMenu(false);
      }
      if (contactRef.current && !contactRef.current.contains(event.target as Node)) {
        setShowContactMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  if (!mounted) {
    return (
      <div className="sticky top-0 z-[60] w-full bg-[#2EA5FF] h-[34px]" />
    );
  }

  const handleGDIPClick = (e: React.MouseEvent) => {
    const userData = localStorage.getItem("afritrade:user") || localStorage.getItem("user");
    if (!userData) {
      e.preventDefault();
      setShowAuthModal(true);
    }
  };

  const handleLangChange = (newLocale: Locale) => {
    setStoredLocale(newLocale);
    setLocale(newLocale);
    setShowLangMenu(false);
    if (typeof window !== "undefined") {
      window.location.reload();
    }
  };

  return (
    <div className="sticky top-0 z-[60] w-full bg-[#2EA5FF] shadow-sm border-b border-white/10">
      <div className="w-[95%] lg:w-[95%] mx-auto flex justify-between items-center gap-2 sm:gap-4 h-[34px] px-2 sm:px-3 md:px-0">
        {/* Left Side: Desktop Phone Numbers & Mobile Contact Button */}
        <div className="flex items-center gap-2">
          {/* Desktop Phone Numbers */}
          <div className="hidden sm:flex items-center gap-3 text-white text-[10px] md:text-sm font-semibold whitespace-nowrap shrink-0">
            <span>{translate(locale, "header.needHelp")} {translate(locale, "header.callUs")}</span>
            <span>Lagos: (+234)902-900-4712</span>
            <span>Abuja: (+234)704-460-0924</span>
          </div>

          {/* Mobile Phone Quick Contact Button */}
          <div className="relative sm:hidden shrink-0" ref={contactRef}>
            <button
              type="button"
              onClick={() => {
                setShowContactMenu(!showContactMenu);
                setShowLangMenu(false);
              }}
              className="inline-flex items-center gap-1 rounded-full bg-white/20 px-2 py-0.5 text-white font-bold text-xs transition-all hover:bg-white/30"
              aria-label="Show contact numbers"
            >
              <Phone size={12} />
              <span>Call Us</span>
            </button>

            {showContactMenu && (
              <div className="absolute left-0 mt-2 w-64 overflow-hidden rounded-2xl border border-white/20 bg-[#2EA5FF] p-0 text-white shadow-2xl shadow-black/30 z-[100]">
                <div className="border-b border-white/15 px-4 py-3">
                  <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-white/70">
                    Quick Contact
                  </p>
                  <p className="mt-1 text-sm font-semibold">
                    {translate(locale, "header.needHelp")} {translate(locale, "header.callUs")}
                  </p>
                </div>
                <div className="space-y-2 p-3">
                  <a
                    href="tel:+2349029004712"
                    className="flex items-center justify-between rounded-xl border border-white/15 bg-[#2497ee] px-3 py-3 transition-colors hover:bg-[#1f8fe3]"
                  >
                    <span>
                      <span className="block text-[11px] uppercase tracking-[0.18em] text-white/70">Lagos</span>
                      <span className="block text-sm font-semibold">(+234)902-900-4712</span>
                    </span>
                    <Phone size={15} className="shrink-0 text-white/85" />
                  </a>
                  <a
                    href="https://wa.me/2347044600924"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between rounded-xl border border-white/15 bg-[#2497ee] px-3 py-3 transition-colors hover:bg-[#1f8fe3]"
                  >
                    <span>
                      <span className="block text-[11px] uppercase tracking-[0.18em] text-white/70">Abuja (WhatsApp)</span>
                      <span className="block text-sm font-semibold">(+234)704-460-0924</span>
                    </span>
                    <Phone size={15} className="shrink-0 text-white/85" />
                  </a>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Side: Bazaar, Insured Partners, Support & Interactive Language Dropdown */}
        <div className="flex items-center gap-2 sm:gap-4 md:gap-5 text-white text-[10px] sm:text-xs md:text-sm font-semibold whitespace-nowrap">
          {bazaarActive !== false && (
            <Link
              href="/trade-fair"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-amber-500 hover:bg-amber-400 text-slate-950 px-2 py-0.5 sm:px-3 sm:py-1 rounded-full whitespace-nowrap inline-flex items-center gap-1 sm:gap-1.5 transition-all hover:scale-105 font-bold shadow-sm shrink-0"
            >
              <span>🎟️</span>
              <span className="hidden xs:inline sm:inline">Trade Fair</span> 2026
            </Link>
          )}

          <Link
            href="/gdip"
            onClick={handleGDIPClick}
            className="bg-[#F9A407] text-white px-2 py-0.5 sm:px-3 sm:py-1 rounded-full whitespace-nowrap inline-flex items-center gap-1 sm:gap-1.5 transition-all hover:scale-105 font-bold shadow-sm hover:shadow-md shrink-0"
          >
            <ShieldCheck size={14} className="sm:w-[18px] sm:h-[18px]" />
            <span className="hidden xs:inline">{translate(locale, "navInsuredPartners")}</span>
            <span className="xs:hidden">Insured</span>
          </Link>

          <Link
            href="/support"
            className="hidden md:inline-flex hover:underline whitespace-nowrap items-center gap-1 sm:gap-1.5 transition-all hover:scale-105 shrink-0"
          >
            <HelpCircle size={14} className="sm:w-[18px] sm:h-[18px]" />
            <span>{translate(locale, "navSupport")}</span>
          </Link>

          {/* Interactive Language Selector Dropdown Popover */}
          <div className="relative shrink-0" ref={langRef}>
            <button
              type="button"
              onClick={() => {
                setShowLangMenu(!showLangMenu);
                setShowContactMenu(false);
              }}
              className="inline-flex items-center gap-1 sm:gap-1.5 whitespace-nowrap transition-all hover:scale-105 bg-white/20 hover:bg-white/30 px-2.5 py-0.5 sm:py-1 rounded-lg font-bold shadow-sm cursor-pointer"
              aria-label="Select Language"
            >
              <Globe size={14} className="sm:w-[16px] sm:h-[16px] shrink-0" />
              <span>{languageFlags[locale]} {languageNames[locale]}</span>
              <ChevronDown size={12} className={`transition-transform ${showLangMenu ? 'rotate-180' : ''}`} />
            </button>

            {showLangMenu && (
              <div className="absolute right-0 mt-2 w-44 bg-white dark:bg-neutral-900 rounded-xl shadow-2xl border border-neutral-200 dark:border-neutral-800 py-1 z-[100] overflow-hidden text-slate-900 dark:text-white animate-in fade-in zoom-in duration-150 origin-top-right">
                <div className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-100 dark:border-slate-800">
                  Select Language / Langue
                </div>
                {locales.map((loc) => (
                  <button
                    key={loc}
                    type="button"
                    onClick={() => handleLangChange(loc)}
                    className={`w-full text-left px-3.5 py-2 text-xs transition-colors flex items-center justify-between cursor-pointer ${
                      locale === loc
                        ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400 font-bold'
                        : 'text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-800'
                    }`}
                  >
                    <span className="flex items-center gap-2">
                      <span>{languageFlags[loc]}</span>
                      <span>{languageNames[loc]}</span>
                    </span>
                    {locale === loc && (
                      <Check size={14} className="text-blue-600 dark:text-blue-400 shrink-0" />
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Login Prompt Modal */}
      {showAuthModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setShowAuthModal(false)}
          />
          <div className="relative w-full max-w-sm bg-white dark:bg-neutral-900 rounded-2xl shadow-2xl p-6 border border-neutral-200 dark:border-neutral-800 animate-in fade-in zoom-in duration-200">
            <button
              onClick={() => setShowAuthModal(false)}
              className="absolute right-4 top-4 p-1 rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-800"
            >
              <X size={20} className="text-neutral-500" />
            </button>

            <div className="flex flex-col items-center text-center space-y-4">
              <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center text-blue-600">
                <ShieldCheck size={32} />
              </div>

              <div>
                <h3 className="text-xl font-bold text-neutral-900 dark:text-white mb-2">
                  Partner Access Required
                </h3>
                <p className="text-sm text-neutral-600 dark:text-neutral-400">
                  Join our Trusted Insured Trade Partners platform. Please login or create an account to continue.
                </p>
              </div>

              <div className="w-full grid grid-cols-1 gap-3 pt-2">
                <button
                  onClick={() => {
                    setShowAuthModal(false);
                    router.push("/auth/login?next=/gdip");
                  }}
                  className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-all shadow-lg shadow-blue-500/20 active:scale-[0.98]"
                >
                  Login to Account
                </button>
                <button
                  onClick={() => {
                    setShowAuthModal(false);
                    router.push("/auth/register?next=/gdip");
                  }}
                  className="w-full py-3 px-4 bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-800 dark:hover:bg-neutral-700 text-neutral-900 dark:text-white font-bold rounded-xl transition-all active:scale-[0.98]"
                >
                  Create New Account
                </button>
              </div>

              <button
                onClick={() => setShowAuthModal(false)}
                className="text-xs text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300 transition-colors"
              >
                Maybe later
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
