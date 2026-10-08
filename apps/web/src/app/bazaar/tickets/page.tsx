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
      id: "free-all-access",
      name: "Free All-Access Visitor Pass",
      price: 0,
      type: "ticket",
      tag: "All-In-One Gate Pass",
      badge: "Full 5 Days · 1st–5th Dec 2026",
      subline: "24/7 Non-Stop Access",
      summary:
        "100% Free All-Access Pass for the entire 5 days (starting 09:00 AM Dec 1st straight through to Dec 5th, with zero closing hours). Dedicated fast-track QR scan lane, full exhibition pavilions, and open trade forums.",
      borderClass: "border-2 border-emerald-500 shadow-2xl shadow-emerald-500/20",
      badgeClass: "bg-emerald-500 text-slate-950 font-black",
      btnClass: "bg-gradient-to-r from-emerald-400 via-teal-400 to-amber-400 hover:from-emerald-300 hover:to-amber-300 text-slate-950 font-black shadow-lg shadow-emerald-500/25",
      features: [
        "100% Free Gate Admission (₦0 Fee)",
        "Full 5 Days Included (1st – 5th Dec 2026)",
        "24 Hours Non-Stop Access (No Closing Time)",
        "Instant digital QR Code Pass to mobile/email",
        "Dedicated Fast-Track Scanner Gate Lane",
        "Full access to all Exhibition Pavilions & Halls",
        "Open networking with 200+ brands & vendors",
        "Digital fair guide & daily event schedule",
        "Open B2B Matchmaking & Cultural Stages",
      ],
    },
  ];

  const handleOpenModal = (pkg: BookingPackage) => {
    setSelectedPkg(pkg);
    setModalOpen(true);
  };

  const faqs = [
    {
      q: "Do I need to register before attending? Can I just walk in?",
      a: "Yes, you can absolutely walk in on any day without any prior registration. Gate admission is 100% free for all visitors and members of the public. However, if you register online (it takes just 30 seconds and is completely free), you'll receive a personal digital QR Code that gets you through our dedicated fast-track scanner lane — no waiting in the regular check-in queue!",
    },
    {
      q: "What does the Free All-Access Visitor Pass cover?",
      a: "The Free All-Access Visitor Pass covers unrestricted admission across the entire 5 days of the trade fair (from 09:00 AM Dec 1st through Dec 5th with 24-hour non-stop opening). It gives you fast-track QR scanner entry, access to all exhibition halls, cultural stages, and networking directories.",
    },
    {
      q: "Can I enter at any time and on multiple days?",
      a: "Yes! There is no closing time until the end of the trade fair on December 5th. Your single digital QR Code remains active and valid for non-stop entry day and night — no need to re-register each morning.",
    },
    {
      q: "Can international attendees receive an official invitation letter for visa processing?",
      a: "Yes. Registered attendees and international delegates can request an official Letter of Invitation from the GloTrade Secretariat to support visa-on-arrival or embassy visa processing by contacting protocol@glotrade.online or tradefair@glotrade.online.",
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

            <div className="max-w-2xl mx-auto mb-20">
              {packages.map((pkg) => (
                <div
                  key={pkg.id}
                  className={`bg-slate-900 border-2 ${pkg.borderClass} rounded-3xl p-8 sm:p-10 flex flex-col justify-between relative shadow-2xl transition-all hover:-translate-y-1.5`}
                >
                  {pkg.tag && (
                    <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-gradient-to-r from-emerald-500 via-teal-400 to-amber-400 text-slate-950 text-xs font-black px-5 py-1 rounded-full uppercase tracking-wider shadow-md">
                      {pkg.tag}
                    </div>
                  )}

                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                        {pkg.subline}
                      </span>
                      <span className={`text-xs font-bold px-3 py-1 rounded-full border ${pkg.badgeClass}`}>
                        {pkg.badge}
                      </span>
                    </div>

                    <h2 className="text-2xl sm:text-3xl font-black text-white mt-1">
                      {pkg.name}
                    </h2>

                    <div className="mt-4 mb-3">
                      <div className="flex items-baseline gap-2">
                        <span className="text-4xl sm:text-5xl font-black text-emerald-400">
                          FREE
                        </span>
                        <span className="text-sm font-bold text-slate-400">/ ₦0 Gate Fee</span>
                      </div>
                      <span className="text-xs font-semibold text-emerald-400/90 block mt-1">
                        Complimentary Gate Admission · 24/7 Access (No Closing Time)
                      </span>
                    </div>

                    <p className="text-sm text-slate-300 mt-3 mb-6 leading-relaxed">
                      {pkg.summary}
                    </p>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs sm:text-sm text-slate-300 mb-8 border-t border-slate-800 pt-6">
                      {pkg.features.map((feat, idx) => (
                        <div key={idx} className="flex items-start gap-2.5">
                          <CheckCircle2 size={16} className="text-emerald-400 shrink-0 mt-0.5" />
                          <span>{feat}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <button
                    onClick={() => handleOpenModal(pkg)}
                    className={`w-full py-4 rounded-xl ${pkg.btnClass} text-sm font-black uppercase tracking-wider shadow-xl transition-all hover:scale-[1.02] flex items-center justify-center gap-2`}
                  >
                    <Ticket size={18} /> Claim Free All-Access Pass (Instant QR Code)
                  </button>
                </div>
              ))}
            </div>

            {/* All-Inclusive Pass Privileges */}
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-10 mb-20 shadow-2xl max-w-4xl mx-auto">
              <div className="text-center max-w-xl mx-auto mb-8">
                <span className="text-xs font-bold uppercase tracking-widest text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/30">
                  Included With Every Pass
                </span>
                <h3 className="text-2xl sm:text-3xl font-black text-white mt-3">
                  All-Inclusive Gate Privileges
                </h3>
                <p className="text-slate-400 text-xs sm:text-sm mt-2">
                  Every attendee receives full unrestricted access across all trade fair pavilions without tier restrictions.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[
                  "Exhibition Pavilions Access (Halls A, B & C)",
                  "Public Consumer & Cultural Stages",
                  "Instant Digital QR Gate Scanner Pass",
                  "All 5 Days 24/7 Access (Dec 1–5, 2026)",
                  "Digital Event Schedule & Fair Directory",
                  "B2B Deal-Making & Matchmaking Zones",
                  "Verified Commercial Trade Directory Access",
                  "Plenary Summit & Keynote Sessions",
                  "Dedicated Fast-Track Scanner Lanes",
                  "Visa Support & Protocol Facilitation Letter",
                ].map((item, idx) => (
                  <div key={idx} className="flex items-center gap-3 bg-slate-950/60 border border-slate-800/80 rounded-xl p-3.5">
                    <CheckCircle2 size={18} className="text-emerald-400 shrink-0" />
                    <span className="text-xs sm:text-sm font-semibold text-slate-200">{item}</span>
                  </div>
                ))}
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
