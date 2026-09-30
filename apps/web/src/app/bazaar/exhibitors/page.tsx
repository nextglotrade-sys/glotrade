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
} from "lucide-react";
import { translate } from "@/utils/translate";

export default function ExhibitorsPage() {
  const [selectedPkg, setSelectedPkg] = useState<BookingPackage | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [promoterRef, setPromoterRef] = useState<string | null>(null);

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

  const packages: (BookingPackage & {
    code: string;
    dailyRate: number;
    badge: string;
    size: string;
    tag?: string;
    borderClass: string;
    badgeClass: string;
    btnClass: string;
    features: string[];
  })[] = [
      {
        id: "stall-me",
        code: "ME",
        name: "Micro Enterprise (ME)",
        price: 150000,
        dailyRate: 30000,
        type: "exhibitor",
        badge: "7.5 sqm Pavilion Booth",
        size: "7.5 sqm",
        summary: "Ideal entry tier for micro-enterprises, startups, and creative artisans.",
        borderClass: "border-emerald-500/50 hover:border-emerald-400 shadow-emerald-500/10",
        badgeClass: "bg-emerald-500/10 text-emerald-400 border-emerald-500/30",
        btnClass: "bg-emerald-500 hover:bg-emerald-400 text-slate-950",
        features: [
          "1 table / 1 chair",
          "Basic lighting",
          "7.5 sqm Pavilion booth",
          "30 seconds Documentary coverage",
          "Certificate of Participation",
        ],
      },
      {
        id: "stall-sse",
        code: "SSE",
        name: "Small Scale Enterprise (SSE)",
        price: 250000,
        dailyRate: 50000,
        type: "exhibitor",
        badge: "15 sqm Pavilion Booth",
        size: "15 sqm",
        summary: "Designed for small commercial businesses and packaged goods producers.",
        borderClass: "border-blue-500/50 hover:border-blue-400 shadow-blue-500/10",
        badgeClass: "bg-blue-500/10 text-blue-400 border-blue-500/30",
        btnClass: "bg-blue-500 hover:bg-blue-400 text-slate-950",
        features: [
          "1 table / 2 chairs",
          "15 sqm Pavilion booth",
          "Pavilion Lighting",
          "Exhibitor participation",
          "1 minute Documentary coverage",
          "Certificate of Participation",
        ],
      },
      {
        id: "stall-bm",
        code: "BM",
        name: "Bronze Membership (BM)",
        price: 375000,
        dailyRate: 75000,
        type: "exhibitor",
        badge: "22.5 sqm (15sqm + 7.5sqm)",
        size: "22.5 sqm",
        summary: "Expanded floor area with dedicated business pitch and brand promotion slots.",
        borderClass: "border-amber-700/60 hover:border-amber-600 shadow-amber-700/10",
        badgeClass: "bg-amber-700/20 text-amber-300 border-amber-700/40",
        btnClass: "bg-amber-700 hover:bg-amber-600 text-white",
        features: [
          "2 tables / 2 chairs",
          "15sqm + 7.5 sqm Pavilion booth",
          "Pavilion Lighting",
          "Brand/Logo visibility & Ad slots on all materials and website",
          "2-minute Documentary coverage",
          "1 Day business pitch",
          "Certificate of Participation",
        ],
      },
      {
        id: "stall-sm",
        code: "SM",
        name: "Silver Membership (SM)",
        price: 500000,
        dailyRate: 100000,
        type: "exhibitor",
        badge: "30 sqm Pavilion Booth",
        size: "30 sqm",
        tag: "Popular Choice",
        summary: "Prime mid-size footprint with media magazine feature and 2-day business pitch.",
        borderClass: "border-slate-300/60 hover:border-slate-200 shadow-slate-300/10",
        badgeClass: "bg-slate-300/15 text-slate-200 border-slate-300/40",
        btnClass: "bg-slate-200 hover:bg-white text-slate-950",
        features: [
          "2 tables / 4 chairs",
          "30 sqm Pavilion booth",
          "Pavilion Lighting",
          "3-minute Documentary coverage",
          "Brand/Logo visibility & Ad slots on all materials and website",
          "Quarter Magazine feature",
          "2 Days business pitch",
          "Certificate of Participation",
        ],
      },
      {
        id: "stall-gm",
        code: "GM",
        name: "Gold Membership (GM)",
        price: 750000,
        dailyRate: 150000,
        type: "exhibitor",
        badge: "60 sqm Pavilion Booth",
        size: "60 sqm",
        tag: "Executive Tier",
        summary: "High-impact 60 sqm presence with half-page feature and product presentation slot.",
        borderClass: "border-amber-400 hover:border-amber-300 shadow-xl shadow-amber-500/15",
        badgeClass: "bg-amber-400/20 text-amber-300 border-amber-400/40",
        btnClass: "bg-amber-400 hover:bg-amber-300 text-slate-950",
        features: [
          "2 tables / 4 chairs",
          "60 sqm Pavilion booth",
          "Pavilion Lighting",
          "5-minute Documentary coverage",
          "3 Days business pitch",
          "Half-page magazine feature",
          "Brand/Logo visibility & Ad slots on all materials and website",
          "Product/business presentation opportunity",
          "Certificate of Participation",
        ],
      },
      {
        id: "stall-pm",
        code: "PM",
        name: "Platinum Membership (PM)",
        price: 1000000,
        dailyRate: 200000,
        type: "exhibitor",
        badge: "60 sqm Pavilion Booth (VIP)",
        size: "60 sqm VIP",
        tag: "Flagship Corporate",
        summary: "Supreme executive visibility with full-page magazine feature and 5-day pitch access.",
        borderClass: "border-purple-400/80 hover:border-purple-300 shadow-2xl shadow-purple-500/20",
        badgeClass: "bg-purple-500/20 text-purple-300 border-purple-400/40",
        btnClass: "bg-gradient-to-r from-purple-500 to-amber-400 hover:from-purple-400 hover:to-amber-300 text-slate-950",
        features: [
          "3 tables / 4 chairs",
          "60 sqm Pavilion booth",
          "Pavilion Lighting",
          "Full-page magazine feature",
          "Premium Brand/Logo visibility & Ad slots on all materials and website",
          "Product/business promotion",
          "7-minute Documentary coverage",
          "5 Day business pitch",
          "Enhanced event visibility",
          "Certificate of Participation",
        ],
      },
    ];

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
                <Truck className="text-amber-400 shrink-0" size={18} />
                <span>Direct Drive-In Cargo Docks</span>
              </div>
            </div>
          </div>
        </section>

        {/* Pricing & Stall Packages Grid */}
        <section className="py-20 lg:py-24 bg-slate-950">
          <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto mb-14">
              <span className="text-xs font-bold uppercase tracking-widest text-amber-400 bg-amber-500/10 px-3 py-1 rounded-full border border-amber-500/30">
                Official Booth & Membership Packages
              </span>
              <h2 className="text-3xl sm:text-5xl font-black text-white mt-3 mb-2">
                Choose Your Exhibition Presence
              </h2>
              <p className="text-slate-400 text-sm sm:text-base">
                Spaces are assigned on a rolling first-come-first-served basis at Nigerian Army Conference Centre &amp; Suites (NACCAS), Abuja.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16 items-stretch">
              {packages.map((pkg) => (
                <div
                  key={pkg.id}
                  className={`bg-slate-900 border-2 ${pkg.borderClass} rounded-3xl p-7 flex flex-col justify-between relative shadow-xl transition-all hover:-translate-y-1.5`}
                >
                  {pkg.tag && (
                    <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-amber-500 text-slate-950 text-[10px] font-black px-3.5 py-1 rounded-full uppercase tracking-wider shadow-md">
                      {pkg.tag}
                    </div>
                  )}

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[10px] font-bold text-amber-400 uppercase tracking-widest">
                        Tier: {pkg.code}
                      </span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${pkg.badgeClass}`}>
                        {pkg.badge}
                      </span>
                    </div>

                    <h3 className="text-xl sm:text-2xl font-black text-white mt-1">
                      {pkg.name}
                    </h3>

                    <div className="mt-4 mb-2">
                      <div className="flex items-baseline gap-1">
                        <span className="text-3xl sm:text-4xl font-black text-amber-400">
                          ₦{pkg.price.toLocaleString()}
                        </span>
                        <span className="text-xs text-slate-400">/ 5-day package</span>
                      </div>
                      <div className="text-xs font-semibold text-slate-400 mt-1 flex items-center gap-1.5">
                        <span className="text-emerald-400 font-bold">Daily Rate:</span>
                        <span className="text-white font-bold">₦{pkg.dailyRate.toLocaleString()}</span>
                        <span>/ day</span>
                      </div>
                    </div>

                    <p className="text-xs text-slate-300 mt-3 mb-6 leading-relaxed">
                      {pkg.summary}
                    </p>

                    <ul className="space-y-2.5 text-xs text-slate-300 mb-8 border-t border-slate-800 pt-5">
                      {pkg.features.map((feat, idx) => (
                        <li key={idx} className="flex items-start gap-2.5">
                          <CheckCircle2 size={15} className="text-amber-400 shrink-0 mt-0.5" />
                          <span>{feat}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <button
                    onClick={() => handleOpenModal(pkg)}
                    className={`w-full py-3.5 rounded-xl ${pkg.btnClass} font-black text-xs uppercase tracking-wider shadow-lg transition-all hover:scale-[1.02]`}
                  >
                    Book {pkg.name.split("(")[0]}
                  </button>
                </div>
              ))}
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

      <BookingModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        pkg={selectedPkg}
      />

      <BazaarFooter />
    </div>
  );
}
