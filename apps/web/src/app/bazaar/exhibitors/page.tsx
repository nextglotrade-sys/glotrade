"use client";

import { useState, useEffect } from "react";
import BazaarNav from "@/components/bazaar/BazaarNav";
import BazaarFooter from "@/components/bazaar/BazaarFooter";
import BookingModal, { BookingPackage } from "@/components/bazaar/BookingModal";
import Link from "next/link";
import {
  CheckCircle2,
  Store,
  Sparkles,
  Building2,
  Layers,
  Zap,
  Globe,
  Truck,
  ShieldCheck,
  ArrowRight,
  Star,
  Users,
  Box,
  HelpCircle,
  ChevronDown,
  Check,
  Phone,
  Mail,
  Calendar,
  ZoomIn,
  X,
  Eye,
  ShoppingBag,
} from "lucide-react";
import { translate } from "@/utils/translate";

export default function ExhibitorsPage() {
  const [selectedPkg, setSelectedPkg] = useState<BookingPackage | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [promoterRef, setPromoterRef] = useState<string | null>(null);
  const [previewFlyer, setPreviewFlyer] = useState<any | null>(null);
  const [activeCategory, setActiveCategory] = useState<"all" | "msme" | "corporate" | "sponsor">("all");
  const [slideIndex, setSlideIndex] = useState(0);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const ref = params.get("ref");
      if (ref) {
        const cleanRef = ref.trim().toUpperCase();
        sessionStorage.setItem("bazaar_promoter_ref", cleanRef);
        setPromoterRef(cleanRef);
      } else {
        const stored = sessionStorage.getItem("bazaar_promoter_ref");
        if (stored) setPromoterRef(stored);
      }
    }
  }, []);

  // Auto-cycle slideshow through all packages
  useEffect(() => {
    const interval = setInterval(() => {
      setSlideIndex((prev) => (prev + 1) % packages.length);
    }, 3000);
    return () => clearInterval(interval);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const packages: (BookingPackage & {
    code: string;
    category: "msme" | "corporate" | "sponsor";
    dailyRate: number;
    dailyRateDisplay: string;
    badge: string;
    size: string;
    tag?: string;
    image: string;
    imagePng: string;
    borderClass: string;
    badgeClass: string;
    btnClass: string;
    features: string[];
  })[] = [
    {
      id: "stall-me",
      code: "ME",
      name: "Micro Enterprise (ME)",
      category: "msme",
      price: 150000,
      dailyRate: 30000,
      dailyRateDisplay: "₦30,000",
      type: "exhibitor",
      badge: "10 sqm Pavilion Booth",
      size: "10 sqm",
      image: "/trade-fair/IMG_3361.webp",
      imagePng: "/trade-fair/IMG_3361.PNG",
      summary: "Ideal entry tier for micro-enterprises, startups, and creative artisans.",
      borderClass: "border-emerald-500/50 hover:border-emerald-400 shadow-emerald-500/10",
      badgeClass: "bg-emerald-500/10 text-emerald-400 border-emerald-500/30",
      btnClass: "bg-emerald-500 hover:bg-emerald-400 text-slate-950",
      features: [
        "1 table / 1 chair included",
        "10 sqm Pavilion booth space",
        "Pavilion Lighting & Electrical Outlet",
        "30 seconds documentary coverage",
        "Certificate of Participation",
        "Official Trade Directory Listing",
      ],
    },
    {
      id: "stall-sse",
      code: "SSE",
      name: "Small Scale Enterprise (SSE)",
      category: "msme",
      price: 250000,
      dailyRate: 50000,
      dailyRateDisplay: "₦50,000",
      type: "exhibitor",
      badge: "15 sqm Pavilion Booth",
      size: "15 sqm",
      image: "/trade-fair/IMG_3358.webp",
      imagePng: "/trade-fair/IMG_3358.PNG",
      summary: "Designed for small commercial businesses and packaged goods producers.",
      borderClass: "border-blue-500/50 hover:border-blue-400 shadow-blue-500/10",
      badgeClass: "bg-blue-500/10 text-blue-400 border-blue-500/30",
      btnClass: "bg-blue-500 hover:bg-blue-400 text-slate-950",
      features: [
        "1 table / 2 chairs included",
        "15 sqm Pavilion booth space",
        "Pavilion Lighting & Standard Electrics",
        "1 minute documentary coverage",
        "Exhibitor B2B matchmaking pass",
        "Certificate of Participation",
      ],
    },
    {
      id: "stall-bm",
      code: "BM",
      name: "Bronze Membership (BM)",
      category: "msme",
      price: 375000,
      dailyRate: 75000,
      dailyRateDisplay: "₦75,000",
      type: "exhibitor",
      badge: "20 sqm Pavilion Booth",
      size: "20 sqm",
      image: "/trade-fair/IMG_3362.webp",
      imagePng: "/trade-fair/IMG_3362.PNG",
      summary: "Expanded floor area with dedicated business pitch and brand promotion slots.",
      borderClass: "border-amber-700/60 hover:border-amber-600 shadow-amber-700/10",
      badgeClass: "bg-amber-700/20 text-amber-300 border-amber-700/40",
      btnClass: "bg-amber-600 hover:bg-amber-500 text-white",
      features: [
        "2 tables / 2 chairs included",
        "20 sqm Pavilion booth space",
        "Pavilion Lighting & Power Outlet",
        "2 minutes documentary coverage",
        "1-Day business pitch presentation",
        "Brand/Logo visibility on materials & site",
        "Certificate of Participation",
      ],
    },
    {
      id: "stall-sm",
      code: "SM",
      name: "Silver Membership (SM)",
      category: "corporate",
      price: 500000,
      dailyRate: 100000,
      dailyRateDisplay: "₦100,000",
      type: "exhibitor",
      badge: "30 sqm Pavilion Booth",
      size: "30 sqm",
      tag: "Popular Choice",
      image: "/trade-fair/IMG_3356.webp",
      imagePng: "/trade-fair/IMG_3356.PNG",
      summary: "Prime mid-size footprint with media magazine feature and 2-day business pitch.",
      borderClass: "border-slate-300/60 hover:border-slate-200 shadow-slate-300/10",
      badgeClass: "bg-slate-300/15 text-slate-200 border-slate-300/40",
      btnClass: "bg-slate-200 hover:bg-white text-slate-950",
      features: [
        "2 tables / 4 chairs included",
        "30 sqm Pavilion booth space",
        "Pavilion Lighting & Extended Power",
        "3 minutes documentary coverage",
        "Brand/Logo visibility on materials & site",
        "Quarter-page official magazine feature",
        "2-Day business pitch presentations",
        "Certificate of Participation",
      ],
    },
    {
      id: "stall-gm",
      code: "GM",
      name: "Gold Membership (GM)",
      category: "corporate",
      price: 750000,
      dailyRate: 150000,
      dailyRateDisplay: "₦150,000",
      type: "exhibitor",
      badge: "50 sqm Pavilion Booth",
      size: "50 sqm",
      tag: "Executive Tier",
      image: "/trade-fair/IMG_3359.webp",
      imagePng: "/trade-fair/IMG_3359.PNG",
      summary: "High-impact 50 sqm presence with half-page feature and product presentation slot.",
      borderClass: "border-amber-400 hover:border-amber-300 shadow-xl shadow-amber-500/15",
      badgeClass: "bg-amber-400/20 text-amber-300 border-amber-400/40",
      btnClass: "bg-amber-400 hover:bg-amber-300 text-slate-950",
      features: [
        "2 tables / 4 chairs included",
        "50 sqm Pavilion booth space",
        "Pavilion Lighting & Prime Power Distribution",
        "5 minutes documentary coverage",
        "3-Day business pitch presentation slot",
        "Half-page magazine feature",
        "Brand/Logo visibility on materials & site",
        "Product/business presentation opportunity",
        "Certificate of Participation",
      ],
    },
    {
      id: "stall-pm",
      code: "PM",
      name: "Platinum Membership (PM)",
      category: "corporate",
      price: 1000000,
      dailyRate: 200000,
      dailyRateDisplay: "₦200,000",
      type: "exhibitor",
      badge: "60 sqm Pavilion Booth (VIP)",
      size: "60 sqm VIP",
      tag: "Flagship Corporate",
      image: "/trade-fair/IMG_3357.webp",
      imagePng: "/trade-fair/IMG_3357.PNG",
      summary: "Supreme executive visibility with full-page magazine feature and 5-day pitch access.",
      borderClass: "border-purple-400/80 hover:border-purple-300 shadow-2xl shadow-purple-500/20",
      badgeClass: "bg-purple-500/20 text-purple-300 border-purple-400/40",
      btnClass: "bg-gradient-to-r from-purple-500 to-amber-400 hover:from-purple-400 hover:to-amber-300 text-slate-950 font-black",
      features: [
        "3 tables / 4 chairs included",
        "60 sqm VIP Pavilion booth space",
        "Pavilion Lighting & Dedicated Power",
        "Full-page official magazine feature",
        "Premium Brand/Logo visibility & ad slots",
        "Product/business promotion",
        "7-minute documentary coverage",
        "Full 5-Day business pitch access",
        "Certificate of Participation",
      ],
    },
    {
      id: "stall-dm",
      code: "DM",
      name: "Diamond Membership (DM)",
      category: "sponsor",
      price: 2000000,
      dailyRate: 0,
      dailyRateDisplay: "Headline Sponsor",
      type: "exhibitor",
      badge: "Central Island Pavilion",
      size: "Island Pavilion",
      tag: "Supreme Headline Sponsor",
      image: "/trade-fair/IMG_3355.webp",
      imagePng: "/trade-fair/IMG_3355.PNG",
      summary: "Supreme headline presenting sponsorship with live brand modelling, AV display, and national media blitz.",
      borderClass: "border-cyan-400/80 hover:border-cyan-300 shadow-2xl shadow-cyan-500/20",
      badgeClass: "bg-gradient-to-r from-cyan-500/20 to-amber-500/20 text-cyan-300 border-cyan-400/50",
      btnClass: "bg-gradient-to-r from-cyan-400 via-amber-400 to-amber-500 hover:from-cyan-300 hover:to-amber-400 text-slate-950 font-black",
      features: [
        "Live Brand Modelling activation on stage",
        "Live Documentary & Audio-Visual Display",
        "Professional Audio-Visual coverage & videography",
        "Exclusive documentary feature & media blitz",
        "Full-page premium magazine feature",
        "Dedicated brand & product presentation opportunity",
        "Headline logo placement across all stages & website",
        "Executive VIP Lounge setup & hosting",
      ],
    },
  ];

  const filteredPackages = packages.filter((pkg) => {
    if (activeCategory === "all") return true;
    return pkg.category === activeCategory;
  });

  const handleOpenModal = (pkg: BookingPackage) => {
    setSelectedPkg(pkg);
    setModalOpen(true);
  };

  const verticals = [
    { title: "Agro-Allied & Food Processing", desc: "Packaged foods, spices, grains, cold storage, cash crop commodities." },
    { title: "Light Manufacturing & Packaging", desc: "Plastics, paper, metal fabrication, chemicals, and industrial consumables." },
    { title: "Fintech, E-Commerce & Tech", desc: "Payment rails, cross-border remittance, logistics software, enterprise SaaS." },
    { title: "Consumer Goods, FMCG & Retail", desc: "Beverages, cosmetics, personal care, household essentials, appliances." },
    { title: "Renewable Energy & Automotive", desc: "Solar equipment, batteries, e-mobility, agricultural machinery, spare parts." },
    { title: "Textiles, Fashion & Creative", desc: "Artisanal fabrics, leathercraft, footwear, jewelry, and African lifestyle brands." },
  ];

  const faqs = [
    {
      q: "When can exhibitors move in to build their booths?",
      a: "Stand builders for Space-Only (Raw Space) booths have move-in access starting November 28, 2026. Standard modular shell scheme exhibitors can decorate and load in merchandise on November 30 from 8:00 AM.",
    },
    {
      q: "Can overseas exhibitors ship sample goods directly to the venue?",
      a: "Yes. Our official logistics and customs clearing partners provide temporary bonded import clearance for foreign exhibits. Cargo must arrive in Lagos or Abuja port by November 15, 2026.",
    },
    {
      q: "What electricity and Wi-Fi hookups are provided?",
      a: "Every standard modular booth includes a 13-amp power outlet and high-speed Wi-Fi 6 access. High-voltage 3-phase 380V industrial power hookups are available upon advance booking for machinery demonstrations.",
    },
    {
      q: "How many staff exhibitor passes are included with my booth?",
      a: "Standard booths include 2 passes, Double stands include 4 passes, Island stands include 6 passes, and Country Pavilions include 10 passes. Additional badges can be purchased if needed.",
    },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-amber-500 selection:text-slate-950">
      <BazaarNav />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative overflow-hidden py-20 lg:py-28 bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 border-b border-slate-800">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[400px] bg-amber-500/10 blur-[140px] rounded-full pointer-events-none" />

          <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
            {promoterRef && (
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-bold mb-4 shadow-sm animate-fadeIn">
                <CheckCircle2 size={14} className="text-emerald-400" />
                <span>Partner Invitation Active: Code <strong className="font-mono text-white tracking-wider">{promoterRef}</strong> applied</span>
              </div>
            )}
            <br className={promoterRef ? "" : "hidden"} />
            <span className="inline-block text-xs font-bold uppercase tracking-widest text-amber-400 bg-amber-500/10 px-4 py-2 rounded-full border border-amber-500/30 mb-6 shadow-sm">
              {translate("bazaar.exhibitorHeading") || "Exhibition Stall Allocations · Abuja 2026"}
            </span>

            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black text-white tracking-tight leading-tight mb-6">
              Showcase Your Enterprise to <br />
              <span className="bg-gradient-to-r from-amber-400 via-amber-300 to-amber-500 bg-clip-text text-transparent">
                10,000+ Trade Buyers
              </span>
            </h1>

            <p className="text-slate-300 text-lg sm:text-xl max-w-3xl mx-auto leading-relaxed mb-10">
              Position your business in front of verified regional distributors, commercial supermarket chains, institutional procurement directors, and foreign trade delegations across 5 high-impact days in Abuja.
            </p>

            {/* Quick Metrics Bar */}
            <div className="inline-flex flex-wrap items-center justify-center gap-6 sm:gap-8 bg-slate-900/90 border border-amber-500/30 rounded-2xl p-4 sm:px-8 sm:py-4 shadow-2xl backdrop-blur-md text-xs sm:text-sm font-semibold">
              <div className="flex items-center gap-2 text-slate-200">
                <Calendar className="text-amber-400 shrink-0" size={18} />
                <span>1st – 5th Dec 2026 · Starting 09:00 AM (Open 24/7 Non-stop)</span>
              </div>
              <div className="hidden sm:block w-px h-5 bg-slate-700" />
              <div className="flex items-center gap-2 text-slate-200">
                <Store className="text-amber-400 shrink-0" size={18} />
                <span>200+ Exhibition Stalls</span>
              </div>
              <div className="hidden sm:block w-px h-5 bg-slate-700" />
              <div className="flex items-center gap-2 text-slate-200">
                <Globe className="text-amber-400 shrink-0" size={18} />
                <span>20+ Sovereign Country Pavilions</span>
              </div>
              <div className="hidden sm:block w-px h-5 bg-slate-700" />
              <div className="flex items-center gap-2 text-slate-200">
                <Users className="text-amber-400 shrink-0" size={18} />
                <span>10,000+ Trade Buyers</span>
              </div>
            </div>
          </div>
        </section>

        {/* Pricing & Stall Packages Grid */}
        <section className="py-20 lg:py-24 bg-slate-950">
          <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto mb-10">
              <span className="text-xs font-bold uppercase tracking-widest text-amber-400 bg-amber-500/10 px-3 py-1 rounded-full border border-amber-500/30">
                Official Booth & Membership Packages
              </span>
              <h2 className="text-3xl sm:text-5xl font-black text-white mt-3 mb-2">
                Choose Your Exhibition Presence
              </h2>
              <p className="text-slate-400 text-sm sm:text-base">
                Spaces are assigned on a rolling first-come-first-served basis at Nigerian Army Conference Centre &amp; Suites (NACCAS), Abuja.
              </p>

              {/* Category Filter Tabs */}
              <div className="flex flex-wrap items-center justify-center gap-2 mt-8">
                {[
                  { id: "all", label: "All 7 Packages" },
                  { id: "msme", label: "MSME Stalls (ME · SSE · BM)" },
                  { id: "corporate", label: "Corporate Tiers (SM · GM · PM)" },
                  { id: "sponsor", label: "Headline Sponsor (Diamond)" },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setActiveCategory(tab.id as any)}
                    className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                      activeCategory === tab.id
                        ? "bg-amber-500 text-slate-950 shadow-lg shadow-amber-500/20 scale-105"
                        : "bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:border-slate-700"
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-16 items-stretch">
              {filteredPackages.map((pkg) => (
                <div
                  key={pkg.id}
                  className={`bg-slate-900 border-2 ${pkg.borderClass} ${
                    pkg.code === "DM"
                      ? "bg-gradient-to-b from-slate-900 via-cyan-950/20 to-slate-900 shadow-2xl shadow-cyan-500/20"
                      : ""
                  } rounded-3xl p-6 flex flex-col justify-between relative shadow-xl transition-all hover:-translate-y-1.5 group`}
                >
                  {pkg.tag && (
                    <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-amber-500 text-slate-950 text-[10px] font-black px-3.5 py-1 rounded-full uppercase tracking-wider shadow-md z-10 whitespace-nowrap">
                      {pkg.tag}
                    </div>
                  )}

                  <div>
                    {/* Flyer Artwork Thumbnail with Zoom Button */}
                    <div className="relative mb-5 rounded-2xl overflow-hidden bg-slate-950 border border-slate-800 aspect-square group/img">
                      <picture>
                        <source srcSet={pkg.image} type="image/webp" />
                        <img
                          src={pkg.image}
                          alt={`${pkg.name} Official Flyer`}
                          className="w-full h-full object-cover transition-transform duration-500 group-hover/img:scale-105"
                          loading="lazy"
                        />
                      </picture>
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/30 to-transparent opacity-0 group-hover/img:opacity-100 transition-opacity flex items-end justify-between p-3">
                        <button
                          type="button"
                          onClick={() => setPreviewFlyer(pkg)}
                          className="w-full py-2.5 px-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs flex items-center justify-center gap-1.5 shadow-lg transition-transform"
                        >
                          <ZoomIn size={14} /> Enlarge Official Flyer
                        </button>
                      </div>
                    </div>

                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[10px] font-bold text-amber-400 uppercase tracking-widest bg-amber-500/10 px-2.5 py-0.5 rounded-full border border-amber-500/20">
                        Tier: {pkg.code}
                      </span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${pkg.badgeClass}`}>
                        {pkg.badge}
                      </span>
                    </div>

                    <h3 className="text-xl font-black text-white mt-1 group-hover:text-amber-400 transition-colors">
                      {pkg.name}
                    </h3>

                    <div className="my-3 p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800">
                      <div className="flex items-baseline justify-between">
                        <div>
                          <span className="text-2xl sm:text-3xl font-black text-amber-400">
                            ₦{pkg.price.toLocaleString()}
                          </span>
                          <span className="text-[10px] text-slate-400 block -mt-1 font-semibold">Total (5-Days)</span>
                        </div>
                        <div className="text-right">
                          <span className="text-xs font-bold text-slate-200">
                            {pkg.dailyRateDisplay}
                          </span>
                          <span className="text-[10px] text-slate-400 block -mt-1 font-semibold">
                            {pkg.dailyRate > 0 ? "/ Day Rate" : "Sponsorship"}
                          </span>
                        </div>
                      </div>
                    </div>

                    <p className="text-xs text-slate-300 mt-2 mb-4 leading-relaxed">
                      {pkg.summary}
                    </p>

                    <div className="flex flex-wrap gap-1.5 mb-4 text-[11px] font-medium text-slate-300">
                      <span className="px-2.5 py-1 rounded-lg bg-slate-950 border border-slate-800 flex items-center gap-1">
                        <Store size={12} className="text-amber-400" /> {pkg.size}
                      </span>
                    </div>

                    <ul className="space-y-2 text-xs text-slate-300 mb-6 border-t border-slate-800 pt-4">
                      {pkg.features.map((feat, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <CheckCircle2 size={14} className="text-amber-400 shrink-0 mt-0.5" />
                          <span>{feat}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="space-y-2 pt-3 border-t border-slate-800">
                    <button
                      type="button"
                      onClick={() => handleOpenModal(pkg)}
                      className={`w-full py-3.5 rounded-xl ${pkg.btnClass} font-black text-xs uppercase tracking-wider shadow-lg transition-all hover:scale-[1.02] flex items-center justify-center gap-1.5`}
                    >
                      <ShoppingBag size={14} /> Book {pkg.name.split("(")[0]}
                    </button>
                    <button
                      type="button"
                      onClick={() => setPreviewFlyer(pkg)}
                      className="w-full py-2 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white font-bold text-xs transition-colors flex items-center justify-center gap-1"
                    >
                      <Eye size={13} /> View Flyer Artwork
                    </button>
                  </div>
                </div>
              ))}

                {/* Auto-Slideshow Card — fills the empty 4th grid slot */}
                <div className="bg-slate-950 border-2 border-amber-500/40 rounded-3xl overflow-hidden flex flex-col justify-between relative shadow-xl group">
                  {/* Cycling image */}
                  <div className="relative flex-1 min-h-[260px] overflow-hidden">
                    {packages.map((pkg, idx) => (
                      <div
                        key={pkg.id}
                        className={`absolute inset-0 transition-opacity duration-700 ${
                          idx === slideIndex ? "opacity-100" : "opacity-0"
                        }`}
                      >
                        <picture>
                          <source srcSet={pkg.image} type="image/webp" />
                          <img
                            src={pkg.image}
                            alt={pkg.name}
                            className="w-full h-full object-cover"
                            loading="lazy"
                          />
                        </picture>
                        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/60 to-transparent" />
                      </div>
                    ))}

                    {/* Slide indicator dots */}
                    <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5 z-10">
                      {packages.map((_, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => setSlideIndex(idx)}
                          className={`rounded-full transition-all ${
                            idx === slideIndex
                              ? "w-5 h-1.5 bg-amber-400"
                              : "w-1.5 h-1.5 bg-slate-500 hover:bg-slate-300"
                          }`}
                          aria-label={`View slide ${idx + 1}`}
                        />
                      ))}
                    </div>

                    {/* Current tier label */}
                    <div className="absolute top-3 left-3 right-3 z-10">
                      <span className="text-[10px] font-black uppercase tracking-widest bg-amber-500 text-slate-950 px-2.5 py-1 rounded-full shadow-md">
                        {packages[slideIndex]?.code} · ₦{packages[slideIndex]?.price.toLocaleString()}
                      </span>
                    </div>
                  </div>

                  {/* Bottom CTA */}
                  <div className="p-5 bg-slate-950 border-t border-amber-500/20">
                    <p className="text-xs font-bold text-amber-400 uppercase tracking-wider mb-1">
                      All 7 Membership Tiers
                    </p>
                    <p className="text-white text-sm font-black leading-snug mb-4">
                      {packages[slideIndex]?.name}
                    </p>
                    <div className="space-y-2">
                      <button
                        type="button"
                        onClick={() => handleOpenModal(packages[slideIndex])}
                        className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-slate-950 font-black text-xs uppercase tracking-wider shadow-lg shadow-amber-500/20 transition-all flex items-center justify-center gap-1.5"
                      >
                        <ShoppingBag size={13} /> Book Now · ₦{packages[slideIndex]?.price.toLocaleString()}
                      </button>
                      <button
                        type="button"
                        onClick={() => setPreviewFlyer(packages[slideIndex] ?? null)}
                        className="w-full py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white font-bold text-xs transition-colors flex items-center justify-center gap-1"
                      >
                        <Eye size={13} /> View Flyer Artwork
                      </button>
                    </div>
                  </div>
                </div>
              </div>

            {/* Official Flyer & Pricing Sheet Showcase */}
            <div className="bg-gradient-to-r from-slate-900 via-amber-950/30 to-slate-900 border border-amber-500/30 rounded-3xl p-6 sm:p-8 mb-20 flex flex-col lg:flex-row items-center justify-between gap-6 shadow-2xl">
              <div className="flex items-center gap-5">
                <div className="w-16 h-24 sm:w-20 sm:h-28 rounded-xl overflow-hidden border border-amber-500/40 shadow-lg shrink-0 bg-slate-950">
                  <img
                    src="/GLOTRADE INTERNATIONAL TRADE FAIR 2026.JPG"
                    alt="GIT2026 Official Booth Packages Flyer"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-amber-400 bg-amber-500/10 px-3 py-1 rounded-full border border-amber-500/30 inline-block mb-1.5">
                    Official Rate Card · GIT2026
                  </span>
                  <h3 className="text-xl sm:text-2xl font-black text-white">
                    Official Trade Fair Rate Card &amp; Brochure
                  </h3>
                  <p className="text-slate-300 text-xs sm:text-sm mt-1 max-w-xl">
                    Confirmed rates for Micro Enterprise, Small Scale, Bronze, Silver, Gold, and Platinum memberships with full documentary and pavilion visibility packages.
                  </p>
                </div>
              </div>
              <div className="shrink-0 w-full lg:w-auto">
                <a
                  href="/GLOTRADE INTERNATIONAL TRADE FAIR 2026.JPG"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block w-full lg:w-auto px-6 py-3.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs uppercase tracking-wider text-center transition-all shadow-md shadow-amber-500/20"
                >
                  View Official Flyer
                </a>
              </div>
            </div>

            {/* Split Visual: Pavilion Showcase + Sector Verticals */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center mb-20">
              <div className="lg:col-span-6 relative">
                <div className="relative rounded-3xl overflow-hidden border border-amber-500/30 shadow-2xl group bg-slate-900">
                  <div className="aspect-[4/3] w-full overflow-hidden relative">
                    <img
                      src="/images/tradefair/pavilion.jpg"
                      alt="Exhibition Pavilion and Brand Showcase at GloTrade Trade Fair"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent" />
                  </div>
                  <div className="absolute bottom-6 left-6 right-6 p-5 rounded-2xl bg-slate-950/90 backdrop-blur-md border border-slate-800">
                    <span className="text-xs font-bold uppercase tracking-wider text-amber-400 block mb-1">
                      Direct High-Volume Buyer Traffic
                    </span>
                    <p className="text-white text-sm font-semibold">
                      Over 10,000 verified commercial purchasers, importers, retail buyers, and consumers.
                    </p>
                  </div>
                </div>
              </div>

              <div className="lg:col-span-6 space-y-6">
                <div>
                  <span className="text-xs font-bold uppercase tracking-widest text-amber-400 bg-amber-500/10 px-3.5 py-1.5 rounded-full border border-amber-500/30">
                    Target Sectors
                  </span>
                  <h3 className="text-2xl sm:text-3xl font-black text-white mt-4 mb-2">
                    Key Exhibitor Product Verticals
                  </h3>
                  <p className="text-slate-400 text-sm">
                    Exhibition floors are strategically zoned to maximize buyer navigation and sector-specific footfall.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {verticals.map((vert, i) => (
                    <div key={i} className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-1">
                      <h4 className="font-bold text-white text-sm text-amber-300">{vert.title}</h4>
                      <p className="text-xs text-slate-400 leading-relaxed">{vert.desc}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Exhibitor Inclusions & Tech Support */}
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 sm:p-12 mb-20 shadow-2xl">
              <div className="text-center max-w-xl mx-auto mb-10">
                <span className="text-xs font-bold uppercase tracking-widest text-amber-400 bg-amber-500/10 px-3 py-1 rounded-full border border-amber-500/30">
                  Comprehensive Inclusions
                </span>
                <h3 className="text-2xl sm:text-3xl font-black text-white mt-3">
                  Every Stall Reservation Includes
                </h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {[
                  { icon: Zap, title: "Uninterrupted Power", desc: "Dual grid feeds + synchronized diesel generators on 24/7 standby." },
                  { icon: Globe, title: "High-Speed Wi-Fi 6", desc: "Enterprise venue connectivity designed for card POS terminals." },
                  { icon: Truck, title: "Direct Drive-In Loading", desc: "Heavy cargo receiving bays with 6.5m overhead clearance." },
                  { icon: ShieldCheck, title: "24/7 Security Patrols", desc: "Perimeter access control, overnight hall lock-up, and CCTV monitoring." },
                  { icon: Users, title: "B2B Matchmaking Desk", desc: "Concierge introducing you directly to verified buyers in your vertical." },
                  { icon: Building2, title: "Bonded Customs Support", desc: "Assistance clearing temporary exhibition cargo through Nigerian customs." },
                ].map((item, i) => (
                  <div key={i} className="flex items-start gap-4 p-4 rounded-2xl bg-slate-950/60 border border-slate-800">
                    <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center shrink-0">
                      <item.icon size={18} />
                    </div>
                    <div>
                      <h4 className="font-bold text-white text-sm mb-1">{item.title}</h4>
                      <p className="text-xs text-slate-400 leading-relaxed">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Exhibitor FAQ */}
            <div className="max-w-3xl mx-auto">
              <div className="text-center mb-10">
                <span className="text-xs font-bold uppercase tracking-widest text-amber-400 bg-amber-500/10 px-3 py-1 rounded-full border border-amber-500/30">
                  Exhibitor Logistics
                </span>
                <h3 className="text-2xl sm:text-3xl font-black text-white mt-3">
                  Frequently Asked Questions
                </h3>
              </div>

              <div className="space-y-4">
                {faqs.map((faq, i) => {
                  const isOpen = openFaq === i;
                  return (
                    <div key={i} className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden transition-all">
                      <button
                        onClick={() => setOpenFaq(isOpen ? null : i)}
                        className="w-full p-5 text-left flex items-center justify-between gap-4 font-bold text-sm text-white hover:text-amber-400 transition-colors"
                      >
                        <span className="flex items-center gap-3">
                          <HelpCircle size={18} className="text-amber-400 shrink-0" />
                          {faq.q}
                        </span>
                        <ChevronDown
                          size={16}
                          className={`text-slate-400 shrink-0 transition-transform ${isOpen ? "rotate-180 text-amber-400" : ""}`}
                        />
                      </button>
                      {isOpen && (
                        <div className="px-5 pb-5 pt-1 text-xs sm:text-sm text-slate-300 leading-relaxed border-t border-slate-950 pl-12">
                          {faq.a}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              <div className="mt-10 p-6 rounded-2xl bg-gradient-to-r from-slate-900 via-amber-950/20 to-slate-900 border border-amber-500/30 text-center">
                <p className="text-xs text-slate-300 mb-2">Need a custom 72m²+ stand design or tailored machinery hookups?</p>
                <a
                  href="mailto:exhibitors@glotrade.online"
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-400 hover:underline"
                >
                  <Mail size={13} /> Email our Technical Stand Coordinator: exhibitors@glotrade.online
                </a>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Lightbox / High-Res Flyer Preview Modal */}
      {previewFlyer && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-md p-4 sm:p-6 flex items-center justify-center animate-fadeIn"
          onClick={() => setPreviewFlyer(null)}
        >
          <div
            className="relative bg-slate-900 border border-amber-500/40 rounded-3xl max-w-4xl w-full max-h-[92vh] overflow-y-auto shadow-2xl p-6 sm:p-8 flex flex-col lg:flex-row gap-6"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              onClick={() => setPreviewFlyer(null)}
              className="absolute top-4 right-4 z-10 w-9 h-9 rounded-full bg-slate-950/80 hover:bg-amber-500 text-white hover:text-slate-950 border border-slate-700 flex items-center justify-center transition-colors"
              aria-label="Close flyer preview"
            >
              <X size={18} />
            </button>

            {/* Flyer Image */}
            <div className="lg:w-1/2 flex items-center justify-center bg-slate-950 rounded-2xl overflow-hidden border border-slate-800 p-2">
              <picture>
                <source srcSet={previewFlyer.image} type="image/webp" />
                <img
                  src={previewFlyer.imagePng || previewFlyer.image}
                  alt={`${previewFlyer.name} Full Artwork`}
                  className="max-h-[75vh] w-auto object-contain rounded-xl shadow-lg"
                />
              </picture>
            </div>

            {/* Flyer Details & Instant Booking */}
            <div className="lg:w-1/2 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xs font-bold text-amber-400 uppercase tracking-widest bg-amber-500/10 px-2.5 py-1 rounded-full border border-amber-500/30">
                    Tier: {previewFlyer.code}
                  </span>
                  <span className="text-xs font-bold px-2.5 py-1 rounded-full border bg-slate-800/80 border-slate-700 text-slate-200">
                    {previewFlyer.badge}
                  </span>
                </div>

                <h3 className="text-2xl sm:text-3xl font-black text-white mt-1 mb-2">
                  {previewFlyer.name}
                </h3>

                <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 my-4">
                  <div className="flex items-baseline justify-between">
                    <div>
                      <span className="text-3xl font-black text-amber-400">
                        ₦{previewFlyer.price.toLocaleString()}
                      </span>
                      <span className="text-xs text-slate-400 block font-semibold">Total for 5 Days</span>
                    </div>
                    <div className="text-right">
                      <span className="text-sm font-bold text-white">
                        {previewFlyer.dailyRateDisplay}
                      </span>
                      <span className="text-xs text-slate-400 block font-semibold">
                        {previewFlyer.dailyRate > 0 ? "Daily Rate" : "Headline Tier"}
                      </span>
                    </div>
                  </div>
                </div>

                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed mb-4">
                  {previewFlyer.summary}
                </p>

                <h4 className="text-xs font-bold text-amber-400 uppercase tracking-wider mb-2">
                  Package Entitlements:
                </h4>
                <ul className="space-y-2 text-xs text-slate-300 max-h-48 overflow-y-auto pr-2">
                  {previewFlyer.features.map((feat: string, i: number) => (
                    <li key={i} className="flex items-start gap-2">
                      <CheckCircle2 size={14} className="text-amber-400 shrink-0 mt-0.5" />
                      <span>{feat}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-800 space-y-2">
                <button
                  type="button"
                  onClick={() => {
                    const pkgToBook = previewFlyer;
                    setPreviewFlyer(null);
                    handleOpenModal(pkgToBook);
                  }}
                  className="w-full py-3.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-slate-950 font-black text-xs uppercase tracking-wider shadow-lg shadow-amber-500/20 transition-all flex items-center justify-center gap-2"
                >
                  <ShoppingBag size={15} /> Book This Stall (₦{previewFlyer.price.toLocaleString()})
                </button>
                <a
                  href={previewFlyer.imagePng || previewFlyer.image}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-2.5 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white font-bold text-xs transition-colors flex items-center justify-center gap-1.5"
                >
                  <ZoomIn size={13} /> Open Original Artwork in New Tab
                </a>
              </div>
            </div>
          </div>
        </div>
      )}

      <BookingModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        pkg={selectedPkg}
      />

      <BazaarFooter />
    </div>
  );
}
