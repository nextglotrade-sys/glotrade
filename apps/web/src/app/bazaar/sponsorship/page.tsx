"use client";

import { useState } from "react";
import BazaarNav from "@/components/bazaar/BazaarNav";
import BazaarFooter from "@/components/bazaar/BazaarFooter";
import BookingModal, { BookingPackage } from "@/components/bazaar/BookingModal";
import Link from "next/link";
import {
  CheckCircle2,
  Award,
  Crown,
  Sparkles,
  TrendingUp,
  Tv,
  Globe,
  Users,
  ShieldCheck,
  ArrowRight,
  Star,
  Check,
  X,
  HelpCircle,
  ChevronDown,
  Mail,
  Download,
  Building2,
} from "lucide-react";
import { translate } from "@/utils/translate";

export default function SponsorshipPage() {
  const [selectedPkg, setSelectedPkg] = useState<BookingPackage | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const packages: BookingPackage[] = [
    {
      id: "brand",
      name: translate("bazaar.brandPromotion") || "Brand Promotion Partner",
      price: 150000,
      type: "sponsorship",
      summary:
        translate("bazaar.brandPromotionSummary") ||
        "Logo placement on promotional materials, digital screen displays, website & 2 VIP delegate passes.",
    },
    {
      id: "gold",
      name: translate("bazaar.goldSponsorship") || "Gold Summit Sponsor",
      price: 300000,
      type: "sponsorship",
      summary:
        translate("bazaar.goldSponsorshipSummary") ||
        "18m² prime exhibition stand, stage MC mentions, high-visibility banners & 4 VIP delegate passes.",
    },
    {
      id: "headline",
      name: translate("bazaar.headlineSponsorship") || "Headline Presenting Sponsor",
      price: 500000,
      type: "sponsorship",
      summary:
        translate("bazaar.headlineSponsorshipSummary") ||
        "Exclusive presenting partner co-branding, keynote speaking slot, 36m² central pavilion, Table of 4 & 6 VIP passes.",
    },
  ];

  const handleOpenModal = (pkg: BookingPackage) => {
    setSelectedPkg(pkg);
    setModalOpen(true);
  };

  const matrix = [
    { benefit: "Logo on Official Trade Fair Website & Mobile App", brand: true, gold: true, headline: true },
    { benefit: "Brand Logo on On-Site Registration Backdrops", brand: true, gold: true, headline: true },
    { benefit: "Official Social Media Broadcast & Feature", brand: true, gold: true, headline: true },
    { benefit: "VIP Delegate Passes Included", brand: "2 Passes", gold: "4 Passes", headline: "6 Passes + Table of 4" },
    { benefit: "Complimentary Exhibition Booth", brand: "Discounted", gold: "18m² Modular Stand", headline: "36m² Prime Island Stand" },
    { benefit: "Verbal MC Acknowledgement in Main Arena", brand: false, gold: true, headline: true },
    { benefit: "Full-Page Ad in Official Trade Fair Guide", brand: "Half Page", gold: "Full Page", headline: "Double Page Spread" },
    { benefit: "Product Insert into Delegate Satchels (5,000 bags)", brand: false, gold: true, headline: true },
    { benefit: "Keynote Speaking Slot in Plenary Summit Arena", brand: false, gold: false, headline: true },
    { benefit: "Co-Branding on All National Broadcast & Media Releases", brand: false, gold: false, headline: true },
    { benefit: "VIP Black-Tie Awards Gala Dinner Reserved Table", brand: false, gold: false, headline: true },
  ];

  const customPartnerships = [
    { title: "Official Trade Finance & Banking Partner", desc: "Exclusive branding on ATM bank galleries, currency kiosks, and B2B deal rooms." },
    { title: "Official Telecom & Connectivity Partner", desc: "Co-branded Wi-Fi 6 login landing portal and media broadcast centre." },
    { title: "Official Logistics & Supply Chain Partner", desc: "Exclusive branding across cargo bays, transit shuttles, and freight desks." },
    { title: "Official Hospitality & Airline Partner", desc: "Prominence on international delegate travel packages and hotel booking desks." },
  ];

  const faqs = [
    {
      q: "Can sponsorship packages be customized for our corporate objectives?",
      a: "Yes. Our partnerships directorate works closely with corporate clients to tailor bespoke activation hubs, private dining suites, and specialized summit panel hosting.",
    },
    {
      q: "What is the payment schedule for corporate sponsors?",
      a: "Sponsorship agreements typically involve a 50% deposit upon MoU signing to reserve key branding positions, with the balance due by October 30, 2026. Official tax invoices are issued immediately.",
    },
    {
      q: "How many delegates will our brand reach?",
      a: "Over 10,000 physical trade delegates, 200+ exhibiting corporations, 20+ sovereign trade ministries, and an estimated 2.5 million+ multi-channel broadcast and social media viewers.",
    },
    {
      q: "When are corporate branding assets and artwork due?",
      a: "High-resolution vector logos, print advertisements, and video reels must be submitted to our creative production bureau by October 15, 2026.",
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
            <span className="inline-block text-xs font-bold uppercase tracking-widest text-amber-400 bg-amber-500/10 px-4 py-2 rounded-full border border-amber-500/30 mb-6 shadow-sm">
              {translate("bazaar.sponsorshipHeading") || "Corporate Partnership & Brand Leadership · Abuja 2026"}
            </span>

            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black text-white tracking-tight leading-tight mb-6">
              Lead the Dialogue on <br />
              <span className="bg-gradient-to-r from-amber-400 via-amber-300 to-amber-500 bg-clip-text text-transparent">
                African Trade & Investment
              </span>
            </h1>

            <p className="text-slate-300 text-lg sm:text-xl max-w-3xl mx-auto leading-relaxed mb-10">
              Align your institution with continental economic integration under AfCFTA, industrial expansion, and commercial leadership before sovereign ministers, industry titans, and 10,000+ trade delegates.
            </p>

            {/* Exposure Metrics Bar */}
            <div className="inline-flex flex-wrap items-center justify-center gap-6 sm:gap-8 bg-slate-900/90 border border-amber-500/30 rounded-2xl p-4 sm:px-8 sm:py-4 shadow-2xl backdrop-blur-md text-xs sm:text-sm font-semibold">
              <div className="flex items-center gap-2 text-slate-200">
                <Users className="text-amber-400 shrink-0" size={18} />
                <span>10,000+ Physical Delegates</span>
              </div>
              <div className="hidden sm:block w-px h-5 bg-slate-700" />
              <div className="flex items-center gap-2 text-slate-200">
                <Tv className="text-amber-400 shrink-0" size={18} />
                <span>2,500,000+ Broadcast Impressions</span>
              </div>
              <div className="hidden sm:block w-px h-5 bg-slate-700" />
              <div className="flex items-center gap-2 text-slate-200">
                <Globe className="text-amber-400 shrink-0" size={18} />
                <span>20+ Sovereign Nations</span>
              </div>
            </div>
          </div>
        </section>

        {/* Sponsorship Tiers Grid */}
        <section className="py-20 lg:py-24 bg-slate-950">
          <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-2xl mx-auto mb-14">
              <span className="text-xs font-bold uppercase tracking-widest text-amber-400 bg-amber-500/10 px-3 py-1 rounded-full border border-amber-500/30">
                Strategic Packages
              </span>
              <h2 className="text-3xl sm:text-4xl font-black text-white mt-3 mb-2">
                Executive Sponsorship Tiers
              </h2>
              <p className="text-slate-400 text-sm">
                Structured packages engineered to deliver tangible corporate ROI, thought leadership, and high-level networking.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20 items-stretch">
              {/* Brand Promotion Partner */}
              <div className="bg-slate-900 border border-slate-800 hover:border-amber-500/40 rounded-3xl p-8 flex flex-col justify-between transition-all hover:-translate-y-1 shadow-xl">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                      Tier 1 · Brand Partner
                    </span>
                  </div>
                  <h3 className="text-2xl font-black text-white mt-1">
                    {packages[0].name}
                  </h3>
                  <div className="mt-4 mb-6">
                    <span className="text-4xl font-black text-amber-400">₦150,000</span>
                    <span className="text-xs text-slate-400 ml-1">/ event partnership</span>
                  </div>
                  <p className="text-xs sm:text-sm text-slate-300 mb-6 leading-relaxed">{packages[0].summary}</p>
                  <ul className="space-y-3 text-xs sm:text-sm text-slate-300 mb-8 border-t border-slate-800 pt-6">
                    <li className="flex items-center gap-2">
                      <CheckCircle2 size={16} className="text-amber-400 shrink-0" />
                      <span>Logo on main event backdrop & website</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 size={16} className="text-amber-400 shrink-0" />
                      <span>Dedicated social media promotional feature</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 size={16} className="text-amber-400 shrink-0" />
                      <span>2x Full VIP Executive Passes</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 size={16} className="text-amber-400 shrink-0" />
                      <span>Half-page advert in official trade guide</span>
                    </li>
                  </ul>
                </div>
                <button
                  onClick={() => handleOpenModal(packages[0])}
                  className="w-full py-3.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs uppercase tracking-wider transition-all border border-slate-700 hover:border-amber-400 shadow-md"
                >
                  Apply for Brand Promotion
                </button>
              </div>

              {/* Gold Summit Sponsor */}
              <div className="bg-slate-900 border-2 border-amber-500 rounded-3xl p-8 flex flex-col justify-between relative shadow-2xl shadow-amber-500/15 transition-all hover:-translate-y-1">
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-amber-500 text-slate-950 text-[10px] font-black px-4 py-1 rounded-full uppercase tracking-wider shadow-md">
                  Recommended Tier
                </div>
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-amber-400 uppercase tracking-widest">
                      Tier 2 · Gold Sponsor
                    </span>
                  </div>
                  <h3 className="text-2xl font-black text-white mt-1">
                    {packages[1].name}
                  </h3>
                  <div className="mt-4 mb-6">
                    <span className="text-4xl font-black text-amber-400">₦300,000</span>
                    <span className="text-xs text-slate-400 ml-1">/ event partnership</span>
                  </div>
                  <p className="text-xs sm:text-sm text-slate-300 mb-6 leading-relaxed">{packages[1].summary}</p>
                  <ul className="space-y-3 text-xs sm:text-sm text-slate-300 mb-8 border-t border-slate-800 pt-6">
                    <li className="flex items-center gap-2 font-semibold text-white">
                      <CheckCircle2 size={16} className="text-amber-400 shrink-0" />
                      <span>18m² Prime exhibition modular stand</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 size={16} className="text-amber-400 shrink-0" />
                      <span>Stage & MC shoutouts during plenary summits</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 size={16} className="text-amber-400 shrink-0" />
                      <span>Logo on all printed & digital campaign assets</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 size={16} className="text-amber-400 shrink-0" />
                      <span>4x Full VIP Passes + VIP Lounge access</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 size={16} className="text-amber-400 shrink-0" />
                      <span>Corporate brochure insert in 5,000 delegate bags</span>
                    </li>
                  </ul>
                </div>
                <button
                  onClick={() => handleOpenModal(packages[1])}
                  className="w-full py-3.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs uppercase tracking-wider shadow-lg shadow-amber-500/20 transition-all"
                >
                  Apply for Gold Sponsorship
                </button>
              </div>

              {/* Headline Presenting Sponsor */}
              <div className="bg-slate-900 border-2 border-amber-400 rounded-3xl p-8 flex flex-col justify-between relative shadow-2xl shadow-amber-500/20 transition-all hover:-translate-y-1">
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600 text-slate-950 text-[10px] font-black px-4 py-1 rounded-full uppercase tracking-wider shadow-md">
                  Flagship Partner
                </div>
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-amber-400 uppercase tracking-widest">
                      Tier 3 · Presenting Partner
                    </span>
                  </div>
                  <h3 className="text-2xl font-black text-white mt-1">
                    {packages[2].name}
                  </h3>
                  <div className="mt-4 mb-6">
                    <span className="text-4xl font-black text-amber-400">₦500,000</span>
                    <span className="text-xs text-slate-400 ml-1">/ presenting partnership</span>
                  </div>
                  <p className="text-xs sm:text-sm text-slate-300 mb-6 leading-relaxed">{packages[2].summary}</p>
                  <ul className="space-y-3 text-xs sm:text-sm text-slate-300 mb-8 border-t border-slate-800 pt-6">
                    <li className="flex items-center gap-2 font-semibold text-white">
                      <CheckCircle2 size={16} className="text-amber-400 shrink-0" />
                      <span>Exclusive presenting partner co-branding</span>
                    </li>
                    <li className="flex items-center gap-2 font-semibold text-white">
                      <CheckCircle2 size={16} className="text-amber-400 shrink-0" />
                      <span>Keynote speaking address in Plenary Hall D</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 size={16} className="text-amber-400 shrink-0" />
                      <span>36m² Central Pavilion island space</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 size={16} className="text-amber-400 shrink-0" />
                      <span>Reserved Corporate Table of 4 at Awards Gala</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 size={16} className="text-amber-400 shrink-0" />
                      <span>6x Full VIP Passes + Diplomatic escort</span>
                    </li>
                  </ul>
                </div>
                <button
                  onClick={() => handleOpenModal(packages[2])}
                  className="w-full py-3.5 rounded-xl bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600 hover:from-amber-300 hover:to-amber-500 text-slate-950 font-black text-xs uppercase tracking-wider shadow-xl shadow-amber-500/25 transition-all"
                >
                  Apply for Headline Partner
                </button>
              </div>
            </div>

            {/* Split Showcase: Networking Photography + Custom Sector Sponsorships */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center mb-20">
              <div className="lg:col-span-6 relative">
                <div className="relative rounded-3xl overflow-hidden border border-amber-500/30 shadow-2xl group bg-slate-900">
                  <div className="aspect-[4/3] w-full overflow-hidden relative">
                    <img
                      src="/images/tradefair/networking.jpg"
                      alt="Executive B2B Dealmaking and Corporate Networking at GloTrade Trade Fair"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent" />
                  </div>
                  <div className="absolute bottom-6 left-6 right-6 p-5 rounded-2xl bg-slate-950/90 backdrop-blur-md border border-slate-800">
                    <span className="text-xs font-bold uppercase tracking-wider text-amber-400 block mb-1">
                      Direct C-Suite & Government Access
                    </span>
                    <p className="text-white text-sm font-semibold">
                      Engage directly with ministers of trade, sovereign investment authorities, and commercial enterprise heads.
                    </p>
                  </div>
                </div>
              </div>

              <div className="lg:col-span-6 space-y-6">
                <div>
                  <span className="text-xs font-bold uppercase tracking-widest text-amber-400 bg-amber-500/10 px-3.5 py-1.5 rounded-full border border-amber-500/30">
                    Category Exclusivity
                  </span>
                  <h3 className="text-2xl sm:text-3xl font-black text-white mt-4 mb-2">
                    Industry Sector Title Sponsorships
                  </h3>
                  <p className="text-slate-400 text-sm">
                    Command absolute category exclusivity across specific event domains.
                  </p>
                </div>

                <div className="space-y-3.5">
                  {customPartnerships.map((cp, i) => (
                    <div key={i} className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex items-start gap-4">
                      <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center shrink-0">
                        <Award size={18} />
                      </div>
                      <div>
                        <h4 className="font-bold text-white text-sm text-amber-300">{cp.title}</h4>
                        <p className="text-xs text-slate-400 leading-relaxed">{cp.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="pt-2">
                  <a
                    href="mailto:partnerships@glotrade.online?subject=Custom%20Sector%20Sponsorship%20Inquiry%20-%20GloTrade%202026"
                    className="inline-flex items-center gap-2 text-xs font-bold text-amber-400 hover:underline"
                  >
                    <Mail size={14} /> Request Custom Category Partnership Deck <ArrowRight size={13} />
                  </a>
                </div>
              </div>
            </div>

            {/* Sponsorship Comparison Matrix Table */}
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-10 mb-20 shadow-2xl">
              <div className="text-center max-w-xl mx-auto mb-10">
                <span className="text-xs font-bold uppercase tracking-widest text-amber-400 bg-amber-500/10 px-3 py-1 rounded-full border border-amber-500/30">
                  Deliverables Comparison
                </span>
                <h3 className="text-2xl sm:text-3xl font-black text-white mt-3">
                  Sponsorship Matrix
                </h3>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse min-w-[650px]">
                  <thead>
                    <tr className="border-b border-slate-800 text-xs font-black uppercase tracking-wider text-slate-400">
                      <th className="py-4 px-4">Deliverable / Entitlement</th>
                      <th className="py-4 px-4 text-center">Brand Partner<br /><span className="text-amber-400 font-bold">₦150,000</span></th>
                      <th className="py-4 px-4 text-center">Gold Sponsor<br /><span className="text-amber-400 font-bold">₦300,000</span></th>
                      <th className="py-4 px-4 text-center">Headline Partner<br /><span className="text-amber-400 font-bold">₦500,000</span></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800 text-xs sm:text-sm">
                    {matrix.map((row, i) => (
                      <tr key={i} className="hover:bg-slate-950/40 transition-colors">
                        <td className="py-4 px-4 font-semibold text-slate-200">{row.benefit}</td>
                        <td className="py-4 px-4 text-center">
                          {typeof row.brand === "boolean" ? (
                            row.brand ? <Check size={18} className="text-emerald-400 mx-auto" /> : <X size={16} className="text-slate-600 mx-auto" />
                          ) : (
                            <span className="text-xs text-amber-300 font-semibold">{row.brand}</span>
                          )}
                        </td>
                        <td className="py-4 px-4 text-center">
                          {typeof row.gold === "boolean" ? (
                            row.gold ? <Check size={18} className="text-emerald-400 mx-auto" /> : <X size={16} className="text-slate-600 mx-auto" />
                          ) : (
                            <span className="text-xs text-amber-300 font-semibold">{row.gold}</span>
                          )}
                        </td>
                        <td className="py-4 px-4 text-center">
                          {typeof row.headline === "boolean" ? (
                            row.headline ? <Check size={18} className="text-emerald-400 mx-auto" /> : <X size={16} className="text-slate-600 mx-auto" />
                          ) : (
                            <span className="text-xs text-amber-300 font-bold">{row.headline}</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Sponsorship FAQ */}
            <div className="max-w-3xl mx-auto">
              <div className="text-center mb-10">
                <span className="text-xs font-bold uppercase tracking-widest text-amber-400 bg-amber-500/10 px-3 py-1 rounded-full border border-amber-500/30">
                  Partnership FAQs
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
