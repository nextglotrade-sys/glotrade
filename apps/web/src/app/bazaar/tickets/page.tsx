"use client";

import { useState } from "react";
import BazaarNav from "@/components/bazaar/BazaarNav";
import BazaarFooter from "@/components/bazaar/BazaarFooter";
import BookingModal, { BookingPackage } from "@/components/bazaar/BookingModal";
import Link from "next/link";
import {
  CheckCircle2,
  Ticket,
  ShieldCheck,
  ArrowRight,
  Star,
  Users,
  Sparkles,
  QrCode,
  Calendar,
  Clock,
  HelpCircle,
  ChevronDown,
  Building2,
  Award,
  Globe,
  Check,
  X,
  CreditCard,
  Info,
} from "lucide-react";
import { translate } from "@/utils/translate";

export default function TicketsPage() {
  const [selectedPkg, setSelectedPkg] = useState<BookingPackage | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const packages: (BookingPackage & {
    badge: string;
    tag?: string;
    subline: string;
    borderClass: string;
    badgeClass: string;
    btnClass: string;
    features: string[];
  })[] = [
    {
      id: "free-general",
      name: "Free Public Day Pass",
      price: 0,
      type: "ticket",
      badge: "Single Day Entry",
      subline: "General Admission",
      summary:
        "100% Free Entry. Access to all trade exhibition pavilions, SME marketplace, agro-allied exhibits, and open cultural stages for any single day.",
      borderClass: "border-slate-800 hover:border-emerald-500/50",
      badgeClass: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
      btnClass: "bg-slate-800 hover:bg-slate-700 text-white border border-slate-700 hover:border-emerald-400",
      features: [
        "100% Free General Gate Admission",
        "Instant digital QR Code Gate Pass",
        "Access to all general exhibition halls",
        "Public consumer & cultural stages",
        "Fast-track digital gate scanner check-in",
      ],
    },
    {
      id: "free-all-access",
      name: "Free 5-Day Visitor Pass",
      price: 0,
      type: "ticket",
      tag: "Most Popular",
      badge: "Full 5 Days · Dec 1–5",
      subline: "All 5 Days Included",
      summary:
        "Full 5-day unrestricted complimentary entrance (Dec 1–5, 2026). Fast-track gate QR scan and access to all general exhibition halls.",
      borderClass: "border-2 border-emerald-500 shadow-2xl shadow-emerald-500/15",
      badgeClass: "bg-emerald-500 text-slate-950 font-black",
      btnClass: "bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black shadow-lg shadow-emerald-500/20",
      features: [
        "All 5 Days Included (Dec 1–5, 2026)",
        "Instant digital QR Code Pass to mobile/email",
        "Full access to Halls A, B & C pavilions",
        "Open networking with 200+ brands & vendors",
        "Digital fair guide & daily event schedule",
      ],
    },
    {
      id: "free-trade-buyer",
      name: "Trade Buyer & B2B Pass",
      price: 0,
      type: "ticket",
      tag: "Commercial / B2B",
      badge: "B2B Accreditation",
      subline: "Trade Professionals",
      summary:
        "Complimentary professional pass for commercial buyers, importers, retailers, and distributors with digital directory & vendor networking.",
      borderClass: "border-blue-500/40 hover:border-blue-400",
      badgeClass: "bg-blue-500/10 text-blue-400 border-blue-500/20",
      btnClass: "bg-blue-600 hover:bg-blue-500 text-white font-bold",
      features: [
        "Free Verified Trade Buyer Badge",
        "Commercial supplier matchmaking zone",
        "B2B deal-making directories & contacts",
        "Fast-track priority gate lanes",
        "Official Certificate of Trade Attendance",
      ],
    },
    {
      id: "free-vip",
      name: "VIP Executive Accreditation",
      price: 0,
      type: "ticket",
      tag: "VIP / Diplomatic",
      badge: "Complimentary VIP",
      subline: "Executives & Delegations",
      summary:
        "Complimentary executive accreditation for corporate leaders, investors, and diplomatic mission delegates. Priority fast-track entrance & plenary access.",
      borderClass: "border-purple-500/50 hover:border-purple-400 shadow-xl shadow-purple-500/15",
      badgeClass: "bg-purple-500/15 text-purple-300 border-purple-500/30",
      btnClass: "bg-gradient-to-r from-purple-500 to-amber-400 hover:from-purple-400 hover:to-amber-300 text-slate-950 font-black",
      features: [
        "Executive VIP Accreditation Pass",
        "Priority VIP registration lounge entrance",
        "Reserved seating at plenary keynote sessions",
        "Official Trade Fair satchel & delegate pack",
        "Visa Support & Protocol facilitation",
      ],
    },
  ];

  const handleOpenModal = (pkg: BookingPackage) => {
    setSelectedPkg(pkg);
    setModalOpen(true);
  };

  const comparisonFeatures = [
    { name: "Exhibition Pavilions Access (Halls A, B, C)", standard: true, vip: true, vvip: true, table: true },
    { name: "Public Consumer & Cultural Stage", standard: true, vip: true, vvip: true, table: true },
    { name: "Instant Digital QR Gate Scanner Pass", standard: true, vip: true, vvip: true, table: true },
    { name: "All 5 Days Access (Dec 1–5, 2026)", standard: false, vip: true, vvip: true, table: true },
    { name: "Digital Event Schedule & Fair Directory", standard: true, vip: true, vvip: true, table: true },
    { name: "B2B Deal-Making & Matchmaking Zone", standard: false, vip: false, vvip: true, table: true },
    { name: "Verified Commercial Trade Buyer Badge", standard: false, vip: false, vvip: true, table: false },
    { name: "VIP Executive Business Lounge Access", standard: false, vip: false, vvip: false, table: true },
    { name: "Reserved Keynote & Plenary Summit Seating", standard: false, vip: false, vvip: false, table: true },
    { name: "Visa Support & Protocol Facilitation Letter", standard: false, vip: false, vvip: true, table: true },
  ];

  const faqs = [
    {
      q: "Do I need to register before attending? Can I just walk in?",
      a: "Yes, you can absolutely walk in on any day without any prior registration. Gate admission is 100% free for all visitors and members of the public. However, if you register online (it takes just 30 seconds and is completely free), you'll receive a personal digital QR Code that gets you through our dedicated fast-track scanner lane — no waiting in the regular check-in queue!",
    },
    {
      q: "What is the benefit of registering online if entry is free?",
      a: "Online registration gives you: (1) A personal digital QR Code for the fast-track dedicated scanner gate — ideal to skip queue especially on busy days. (2) An instant confirmation email with the full event programme, daily schedule, and exhibitor directory. (3) Access to special B2B matchmaking tools and pre-event networking directories if you register as a Trade Buyer.",
    },
    {
      q: "Can I enter on multiple days? Do I need to re-register each day?",
      a: "Walk-in visitors can enter on any day freely. If you've registered for the Free 5-Day Visitor Pass, your single QR Code grants multi-day fast-track gate access from 1st to 5th December 2026 — no need to re-register each morning.",
    },
    {
      q: "What is the difference between the pass types if entry is free for all?",
      a: "All gate passes are free. The pass types differ by the benefits beyond entry: The General Day Pass is for any single-day visit. The 5-Day Pass covers the full week. The Trade Buyer & B2B Pass includes access to commercial deal-making zones and verified supplier matchmaking. The VIP Executive Accreditation includes priority executive lounge access and reserved keynote seating.",
    },
    {
      q: "Can international attendees receive an official invitation letter for visa processing?",
      a: "Yes. Registered Trade Buyer and VIP Executive accreditation holders can request an official Letter of Invitation from the GloTrade Secretariat to support visa-on-arrival or embassy visa processing by contacting protocol@glotrade.online or tradefair@glotrade.online.",
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
              {translate("bazaar.navTickets") || "Official Delegate Registration · Abuja, Nigeria"}
            </span>

            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black text-white tracking-tight leading-tight mb-6">
              Walk-In Free or
              <br />
              <span className="bg-gradient-to-r from-emerald-400 via-amber-300 to-amber-500 bg-clip-text text-transparent">
                Pre-Register for Fast-Track Entry
              </span>
            </h1>

            <p className="text-slate-300 text-lg sm:text-xl max-w-3xl mx-auto leading-relaxed mb-10">
              {translate("bazaar.ticketsSubtitle") ||
                "Gate admission is 100% free for everyone — no registration required to walk in. Registering online is completely optional but gives you a personal digital QR Code for the dedicated fast-track scanner lane, plus a confirmation email with your event schedule."}
            </p>

            {/* Quick Benefits Bar */}
            <div className="inline-flex flex-wrap items-center justify-center gap-6 bg-slate-900/90 border border-emerald-500/30 rounded-2xl p-4 sm:px-8 sm:py-4 shadow-2xl backdrop-blur-md text-xs sm:text-sm font-semibold">
              <div className="flex items-center gap-2 text-slate-200">
                <Check className="text-emerald-400 shrink-0" size={18} />
                <span>Walk-In Always Welcome · No Registration Needed</span>
              </div>
              <div className="hidden sm:block w-px h-5 bg-slate-700" />
              <div className="flex items-center gap-2 text-slate-200">
                <QrCode className="text-emerald-400 shrink-0" size={18} />
                <span>Register Online for Fast-Track QR Scanner Lane</span>
              </div>
              <div className="hidden sm:block w-px h-5 bg-slate-700" />
              <div className="flex items-center gap-2 text-slate-200">
                <ShieldCheck className="text-amber-400 shrink-0" size={18} />
                <span>Visa Support Letters Available for Foreign Guests</span>
              </div>
            </div>

            {/* Free Admission Announcement Banner */}
            <div className="mt-8 max-w-3xl mx-auto bg-gradient-to-r from-emerald-950/80 via-slate-900 to-emerald-950/80 border-2 border-emerald-500/50 rounded-2xl p-5 sm:px-8 flex items-start sm:items-center gap-4 text-left shadow-2xl backdrop-blur-md">
              <div className="w-12 h-12 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center shrink-0 text-emerald-400">
                <Sparkles size={24} />
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[10px] font-black uppercase tracking-wider bg-emerald-500 text-slate-950 px-2.5 py-0.5 rounded-full">
                    Official Announcement
                  </span>
                  <span className="text-xs font-bold text-emerald-400">100% Free Entry · Walk-In Allowed</span>
                </div>
                <h3 className="text-base sm:text-lg font-black text-white">
                  Gate Entrance is Free for Everyone — Registration is Optional!
                </h3>
                <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                  You are welcome to walk in on any day without prior registration. However, registering online (free &amp; takes 30 seconds) gives you a personal QR Code for our dedicated <strong className="text-emerald-400">fast-track scanner lane</strong>, skipping the regular check-in queue, plus a confirmation email with the full event schedule.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Pricing Cards Grid */}
        <section className="py-20 lg:py-24 bg-slate-950">
          <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-2xl mx-auto mb-14">
              <span className="text-xs font-bold uppercase tracking-widest text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/30">
                Optional Pre-Registration · Always Free
              </span>
              <h2 className="text-3xl sm:text-5xl font-black text-white mt-3 mb-2">
                Register for Your Fast-Track QR Pass
              </h2>
              <p className="text-slate-400 text-sm sm:text-base">
                Walk-in is always welcome with no booking required. Pre-register below (free · 30 seconds) to get a digital QR Code that fast-tracks you through the dedicated gate scanner lane — no queue!
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-20 items-stretch">
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
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                        {pkg.subline}
                      </span>
                      <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${pkg.badgeClass}`}>
                        {pkg.badge}
                      </span>
                    </div>

                    <h2 className="text-xl sm:text-2xl font-black text-white mt-1">
                      {pkg.name}
                    </h2>

                    <div className="mt-4 mb-2">
                      <div className="flex items-baseline gap-1.5">
                        <span className="text-3xl sm:text-4xl font-black text-emerald-400">
                          FREE
                        </span>
                        <span className="text-xs font-bold text-slate-400">/ ₦0 Entry</span>
                      </div>
                      <span className="text-[11px] font-semibold text-emerald-400/90 block mt-1">
                        Complimentary Gate Admission
                      </span>
                    </div>

                    <p className="text-xs text-slate-300 mt-3 mb-6 leading-relaxed">
                      {pkg.summary}
                    </p>

                    <ul className="space-y-2.5 text-xs text-slate-300 mb-8 border-t border-slate-800 pt-5">
                      {pkg.features.map((feat, idx) => (
                        <li key={idx} className="flex items-start gap-2.5">
                          <CheckCircle2 size={15} className="text-emerald-400 shrink-0 mt-0.5" />
                          <span>{feat}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <button
                    onClick={() => handleOpenModal(pkg)}
                    className={`w-full py-3.5 rounded-xl ${pkg.btnClass} text-xs font-black uppercase tracking-wider shadow-lg transition-all hover:scale-[1.02] flex items-center justify-center gap-1.5`}
                  >
                    <Ticket size={15} /> Claim Free Pass
                  </button>
                </div>
              ))}
            </div>

            {/* Feature Comparison Matrix Table */}
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-10 mb-20 shadow-2xl">
              <div className="text-center max-w-xl mx-auto mb-10">
                <span className="text-xs font-bold uppercase tracking-widest text-amber-400 bg-amber-500/10 px-3 py-1 rounded-full border border-amber-500/30">
                  Feature Comparison
                </span>
                <h3 className="text-2xl sm:text-3xl font-black text-white mt-3">
                  Detailed Tier Benefits
                </h3>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse min-w-[650px]">
                  <thead>
                    <tr className="border-b border-slate-800 text-xs font-black uppercase tracking-wider text-slate-400">
                      <th className="py-4 px-4">Inclusion / Benefit</th>
                      <th className="py-4 px-4 text-center">Day Pass<br /><span className="text-emerald-400 font-bold">FREE (₦0)</span></th>
                      <th className="py-4 px-4 text-center">5-Day Pass<br /><span className="text-emerald-400 font-bold">FREE (₦0)</span></th>
                      <th className="py-4 px-4 text-center">Trade Buyer<br /><span className="text-blue-400 font-bold">FREE (₦0)</span></th>
                      <th className="py-4 px-4 text-center">VIP Exec<br /><span className="text-amber-400 font-bold">FREE (₦0)</span></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800 text-xs sm:text-sm">
                    {comparisonFeatures.map((feat, i) => (
                      <tr key={i} className="hover:bg-slate-950/40 transition-colors">
                        <td className="py-4 px-4 font-semibold text-slate-200">{feat.name}</td>
                        <td className="py-4 px-4 text-center">
                          {feat.standard ? (
                            <Check size={18} className="text-emerald-400 mx-auto" />
                          ) : (
                            <X size={16} className="text-slate-600 mx-auto" />
                          )}
                        </td>
                        <td className="py-4 px-4 text-center">
                          {feat.vip ? (
                            <Check size={18} className="text-emerald-400 mx-auto" />
                          ) : (
                            <X size={16} className="text-slate-600 mx-auto" />
                          )}
                        </td>
                        <td className="py-4 px-4 text-center">
                          {feat.vvip ? (
                            <Check size={18} className="text-emerald-400 mx-auto" />
                          ) : (
                            <X size={16} className="text-slate-600 mx-auto" />
                          )}
                        </td>
                        <td className="py-4 px-4 text-center">
                          {feat.table ? (
                            <Check size={18} className="text-emerald-400 mx-auto" />
                          ) : (
                            <X size={16} className="text-slate-600 mx-auto" />
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Accreditation & Entry Instructions */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-20">
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
                <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center mb-4">
                  <QrCode size={20} />
                </div>
                <h4 className="font-bold text-white text-base mb-1.5">1. Digital QR Generation</h4>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Upon booking, receive your secure QR code immediately. Store it on your smartphone or print it out.
                </p>
              </div>

              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
                <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center mb-4">
                  <ShieldCheck size={20} />
                </div>
                <h4 className="font-bold text-white text-base mb-1.5">2. Venue Security Scan</h4>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Present your QR code at the fast-track accreditation gate for instant badge printing and security screening.
                </p>
              </div>

              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
                <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center mb-4">
                  <Award size={20} />
                </div>
                <h4 className="font-bold text-white text-base mb-1.5">3. Full Complex Access</h4>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Wear your official pass lanyard to move seamlessly across all exhibition halls, B2B deal rooms, and summit auditoriums.
                </p>
              </div>
            </div>

            {/* Ticket FAQs */}
            <div className="max-w-3xl mx-auto">
              <div className="text-center mb-10">
                <span className="text-xs font-bold uppercase tracking-widest text-amber-400 bg-amber-500/10 px-3 py-1 rounded-full border border-amber-500/30">
                  Ticketing Assistance
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
