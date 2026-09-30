"use client";

import { useState } from "react";
import BazaarNav from "@/components/bazaar/BazaarNav";
import BazaarFooter from "@/components/bazaar/BazaarFooter";
import Link from "next/link";
import {
  Clock,
  Sparkles,
  Music,
  Store,
  Users,
  Trophy,
  Calendar,
  MapPin,
  ChevronRight,
  Download,
  Filter,
  CheckCircle2,
  Mic,
  Handshake,
  Star,
  ArrowRight,
  Building2,
  Tv,
} from "lucide-react";
import { translate } from "@/utils/translate";

interface Session {
  time: string;
  track: "plenary" | "b2b" | "workshop" | "gala";
  trackLabel: string;
  title: string;
  location: string;
  description: string;
  moderatorOrKeynote?: string;
}

interface DayProgramme {
  dayNumber: number;
  dateStr: string;
  dayName: string;
  theme: string;
  summary: string;
  hallHighlight: string;
  sessions: Session[];
}

const programmeDays: DayProgramme[] = [
  {
    dayNumber: 1,
    dateStr: "Tuesday, 1st Dec 2026",
    dayName: "Day 1",
    theme: "Grand Opening Ceremony & Global Trade Summit",
    summary: "Diplomatic protocol arrival, ministerial keynote addresses, official ribbon-cutting of the 45,000 m² exhibition halls, and sovereign pavilion inaugurations.",
    hallHighlight: "Plenary Arena (Hall D) & Pavilion Esplanade",
    sessions: [
      {
        time: "08:00 AM – 09:30 AM",
        track: "plenary",
        trackLabel: "Accreditation",
        title: "Delegate Registration, VIP Reception & Coffee Networking",
        location: "Grand Concourse & VIP Lounge",
        description: "Accreditation badge issuance, security screening, and VIP delegate welcome coffee with international trade envoys.",
      },
      {
        time: "09:30 AM – 11:30 AM",
        track: "plenary",
        trackLabel: "Plenary Summit",
        title: "Official Opening Ceremony & Presidential Keynote Address",
        location: "Plenary Arena (Hall D)",
        description: "Welcome remarks by GloTrade leadership, address by Federal Minister of Industry, Trade and Investment, and AfCFTA Secretary-General.",
        moderatorOrKeynote: "Keynote: AfCFTA Trade Commission & Presidential Envoys",
      },
      {
        time: "11:30 AM – 01:00 PM",
        track: "plenary",
        trackLabel: "Exhibition",
        title: "VIP Ribbon-Cutting & Inaugural Exhibition Hall Tour",
        location: "Main Trade Halls (Hall A & C)",
        description: "Diplomatic walkthrough of sovereign country pavilions and flagship African manufacturing exhibits.",
      },
      {
        time: "01:00 PM – 02:30 PM",
        track: "b2b",
        trackLabel: "VIP Hospitality",
        title: "Executive Delegate Luncheon & B2B Matchmaking Briefing",
        location: "Executive Dining Lounge",
        description: "Curated networking lunch introducing certified international trade buyers to registered local exporters.",
      },
      {
        time: "02:30 PM – 04:30 PM",
        track: "plenary",
        trackLabel: "Policy Forum",
        title: "AfCFTA Policy Dialogue: Eliminating Non-Tariff Barriers Across Africa",
        location: "Plenary Arena (Hall D)",
        description: "High-level panel on customs harmonization, rules of origin, and cross-border commercial dispute resolution.",
      },
      {
        time: "04:30 PM – 06:00 PM",
        track: "gala",
        trackLabel: "Networking",
        title: "Welcome Cocktail Reception & Cultural Drumming Performance",
        location: "Outdoor Esplanade Plaza",
        description: "Relaxed evening networking with live traditional African instrumental performances, beverages, and appetizers.",
      },
    ],
  },
  {
    dayNumber: 2,
    dateStr: "Wednesday, 2nd Dec 2026",
    dayName: "Day 2",
    theme: "AfCFTA Integration & Bilateral B2B Matchmaking",
    summary: "Dedicated to private sector dealmaking, bilateral distributor contracts, agro-allied supply chains, and sovereign procurement sessions.",
    hallHighlight: "B2B Deal Rooms (Hall C) & Agro Pavilion (Hall A)",
    sessions: [
      {
        time: "09:00 AM – 11:00 AM",
        track: "b2b",
        trackLabel: "B2B Matchmaking",
        title: "Agro-Commodities & Processed Foods Buyer-Seller Forum",
        location: "Executive Deal Rooms (Hall C)",
        description: "Curated 1-on-1 procurement meetings between commercial supermarket chains, grain traders, and certified food processors.",
      },
      {
        time: "11:00 AM – 01:00 PM",
        track: "workshop",
        trackLabel: "Export Clinic",
        title: "Export Packaging & Standards Compliance Masterclass",
        location: "Workshop Room 2 (Hall B)",
        description: "Guidance on ISO, NAFDAC, FDA, and EU sanitary standards required for commercial exports from Africa.",
      },
      {
        time: "01:00 PM – 02:30 PM",
        track: "b2b",
        trackLabel: "Networking",
        title: "Bilateral Chambers of Commerce Luncheon",
        location: "Bilateral Lounge",
        description: "Joint networking session between Nigerian-American, Nigerian-British, and Franco-African chambers of commerce.",
      },
      {
        time: "02:30 PM – 04:30 PM",
        track: "plenary",
        trackLabel: "Summit Panel",
        title: "Cross-Border Logistics, Freight Corridors & Port Clearing",
        location: "Plenary Arena (Hall D)",
        description: "Discussions with shipping lines, cargo airlines, and multimodal rail operators on slashing transit times across ECOWAS.",
      },
      {
        time: "04:30 PM – 06:00 PM",
        track: "b2b",
        trackLabel: "Deal Signing",
        title: "Trade MoU Signings & Bilateral Agreement Announcements",
        location: "Press Briefing Suite",
        description: "Formal signing ceremony of cross-border supplier agreements witnessed by trade attaches and accredited media.",
      },
    ],
  },
  {
    dayNumber: 3,
    dateStr: "Thursday, 3rd Dec 2026",
    dayName: "Day 3",
    theme: "Fintech, Youth & Women Entrepreneurship Showcase",
    summary: "Spotlighting female business founders, next-generation tech entrepreneurs, digital payments in trade, and venture pitch showcases.",
    hallHighlight: "Global Tech Hub (Hall B) & Main Auditorium",
    sessions: [
      {
        time: "09:00 AM – 11:00 AM",
        track: "plenary",
        trackLabel: "Keynote",
        title: "Empowering Women in Continental Commerce: Access to Capital & Markets",
        location: "Plenary Arena (Hall D)",
        description: "Keynotes from leading female corporate executives, trade bank leaders, and export promotion directors.",
      },
      {
        time: "11:00 AM – 01:00 PM",
        track: "b2b",
        trackLabel: "Venture Pitch",
        title: "GloTrade Africa Seed & Growth Venture Pitch Arena",
        location: "Startup Amphitheatre (Hall B)",
        description: "20 shortlisted African tech, logistics, and agro startups pitch before leading angel syndicates and venture capitalists.",
      },
      {
        time: "01:00 PM – 02:30 PM",
        track: "workshop",
        trackLabel: "Hands-On",
        title: "Digital Trade Infrastructure & E-Commerce Onboarding Clinic",
        location: "Tech Demo Lab (Hall B)",
        description: "Interactive session training MSMEs on how to onboard onto GloTrade digital storefronts and accept multi-currency cross-border payments.",
      },
      {
        time: "02:30 PM – 04:30 PM",
        track: "plenary",
        trackLabel: "Panel",
        title: "Fintech Settlement Rails & Currency Hedging in Intra-African Trade",
        location: "Plenary Arena (Hall D)",
        description: "Pan-African payment systems (PAPSS), central bank digital currencies, and mitigating FX risks for importers.",
      },
      {
        time: "04:30 PM – 06:00 PM",
        track: "gala",
        trackLabel: "Showcase",
        title: "African Creative Industries Fashion Runway & Artisanal Crafts",
        location: "Grand Esplanade Pavilion",
        description: "High-end runway showcase highlighting indigenous sustainable fashion, leather goods, and fine craftsmanship.",
      },
    ],
  },
  {
    dayNumber: 4,
    dateStr: "Friday, 4th Dec 2026",
    dayName: "Day 4",
    theme: "African Industrialization & Trade Finance Forum",
    summary: "Focused on manufacturing value-addition, renewable energy in industry, commercial trade credit facilities, and export guarantees.",
    hallHighlight: "Manufacturing Pavilion (Hall A) & Plenary (Hall D)",
    sessions: [
      {
        time: "09:00 AM – 11:00 AM",
        track: "plenary",
        trackLabel: "Finance Summit",
        title: "Trade Finance Instruments: Letters of Credit, Guarantees & Factoring",
        location: "Plenary Arena (Hall D)",
        description: "Senior commercial bankers and export-import bank executives discussing accessible credit for SME bulk orders.",
      },
      {
        time: "11:00 AM – 01:00 PM",
        track: "workshop",
        trackLabel: "Green Trade",
        title: "Clean Energy Transition & Carbon Border Tariffs for African Exporters",
        location: "Workshop Room 1 (Hall B)",
        description: "Navigating EU Carbon Border Adjustment Mechanism (CBAM) and solar agro-processing grants.",
      },
      {
        time: "01:00 PM – 02:30 PM",
        track: "b2b",
        trackLabel: "Executive Lunch",
        title: "Industrial Park & Free Trade Zone Operators Round Table",
        location: "Executive Dining Lounge",
        description: "Meeting between special economic zone authorities and international manufacturers evaluating factory setups in West Africa.",
      },
      {
        time: "02:30 PM – 04:30 PM",
        track: "plenary",
        trackLabel: "Industry Panel",
        title: "Automotive, Electric Mobility & Heavy Equipment in Africa",
        location: "Plenary Arena (Hall D)",
        description: "Panel on local component assembly, electric commercial transit, and industrial equipment leasing.",
      },
      {
        time: "04:30 PM – 06:00 PM",
        track: "b2b",
        trackLabel: "Procurement",
        title: "Government & Sovereign Procurement Clinic",
        location: "Executive Deal Rooms (Hall C)",
        description: "Briefings on how local MSMEs can qualify as certified suppliers for public infrastructure and bilateral donor programs.",
      },
    ],
  },
  {
    dayNumber: 5,
    dateStr: "Saturday, 5th Dec 2026",
    dayName: "Day 5",
    theme: "Grand Consumer Expo, Trade Fair Awards & Gala Night",
    summary: "Mass public consumer marketplace, retail discounts, the official GloTrade Excellence Awards Banquet, and live musical celebration.",
    hallHighlight: "Full Complex, Main Arena & Outdoor Stage",
    sessions: [
      {
        time: "09:00 AM – 03:00 PM",
        track: "plenary",
        trackLabel: "Public Expo",
        title: "Mega Consumer Marketplace & Public Trade Exhibition",
        location: "All Exhibition Halls (A, B, C, Outdoor)",
        description: "Open access for public consumers, live product demonstrations, discounted factory-direct retail sales, and culinary experiences.",
      },
      {
        time: "03:00 PM – 05:00 PM",
        track: "plenary",
        trackLabel: "Closing Summit",
        title: "Official Fair Communiqué & Trade Volume Summary Announcement",
        location: "Plenary Arena (Hall D)",
        description: "Presentation of official fair transaction numbers, bilateral MoUs signed, and recommendations submitted to the AfCFTA Secretariat.",
      },
      {
        time: "06:00 PM – 07:30 PM",
        track: "gala",
        trackLabel: "Black Tie Gala",
        title: "GloTrade 2026 Commercial Excellence Awards Dinner",
        location: "Grand Ballroom & Banquet Hall",
        description: "Honoring the Top Exporter of the Year, Most Innovative SME, Outstanding Woman-Led Enterprise, and Best Sovereign Pavilion.",
      },
      {
        time: "07:30 PM – 10:00 PM",
        track: "gala",
        trackLabel: "Celebration",
        title: "Grand Cultural Concert & Headline Musical Performances",
        location: "Outdoor Festival Stage",
        description: "Celebratory closing gala featuring celebrated African musical artists, DJ sets, fireworks, and pan-African unity toast.",
      },
    ],
  },
];

export default function ProgrammePage() {
  const [selectedDay, setSelectedDay] = useState<number>(1);
  const [trackFilter, setTrackFilter] = useState<string>("all");

  const currentDay = programmeDays.find((d) => d.dayNumber === selectedDay) || programmeDays[0];

  const filteredSessions =
    trackFilter === "all"
      ? currentDay.sessions
      : currentDay.sessions.filter((s) => s.track === trackFilter);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-amber-500 selection:text-slate-950">
      <BazaarNav />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative overflow-hidden py-20 lg:py-28 bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 border-b border-slate-800">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[400px] bg-amber-500/10 blur-[140px] rounded-full pointer-events-none" />

          <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
            <span className="inline-block text-xs font-bold uppercase tracking-widest text-amber-400 bg-amber-500/10 px-4 py-2 rounded-full border border-amber-500/30 mb-6 shadow-sm">
              {translate("bazaar.eventSchedule") || "Official 5-Day Event Timetable · Dec 1–5, 2026"}
            </span>

            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black text-white tracking-tight leading-tight mb-6">
              Five Days of Catalytic <br />
              <span className="bg-gradient-to-r from-amber-400 via-amber-300 to-amber-500 bg-clip-text text-transparent">
                Commerce & Dealmaking
              </span>
            </h1>

            <p className="text-slate-300 text-lg sm:text-xl max-w-3xl mx-auto leading-relaxed mb-10">
              {translate("bazaar.progTimelineTitle") ||
                "Comprehensive day-by-day timetable across all four exhibition halls, plenary keynote arenas, executive dealmaking lounges, and the grand outdoor festival esplanade."}
            </p>

            <div className="flex flex-wrap items-center justify-center gap-4">
              <Link
                href="/trade-fair/tickets"
                className="px-8 py-4 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-base shadow-xl shadow-amber-500/20 transition-all hover:scale-105 inline-flex items-center gap-2"
              >
                <Star size={18} /> Book Delegate Ticket
              </Link>
              <a
                href="#schedule-grid"
                className="px-8 py-4 rounded-xl bg-slate-900 border border-slate-700 hover:bg-slate-800 text-white font-bold text-base transition-all inline-flex items-center gap-2"
              >
                <Calendar size={18} className="text-amber-400" /> Explore Daily Timetable
              </a>
            </div>
          </div>
        </section>

        {/* Schedule Feature Split (Visual Keynote + Day Selector) */}
        <section id="schedule-grid" className="py-20 lg:py-24 bg-slate-950">
          <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* Day Selection Tabs Bar */}
            <div className="flex items-center justify-start lg:justify-center gap-3 overflow-x-auto pb-4 scrollbar-none mb-12">
              {programmeDays.map((day) => {
                const isActive = day.dayNumber === selectedDay;
                return (
                  <button
                    key={day.dayNumber}
                    onClick={() => setSelectedDay(day.dayNumber)}
                    className={`px-6 py-4 rounded-2xl text-left transition-all border shrink-0 ${
                      isActive
                        ? "bg-amber-500 text-slate-950 border-amber-400 shadow-xl shadow-amber-500/20 scale-105"
                        : "bg-slate-900 text-slate-300 border-slate-800 hover:border-amber-500/40 hover:text-white"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-3 mb-1">
                      <span className={`text-xs font-black uppercase tracking-wider ${isActive ? "text-slate-950" : "text-amber-400"}`}>
                        {day.dayName}
                      </span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${isActive ? "bg-slate-950/20 text-slate-950" : "bg-slate-800 text-slate-400"}`}>
                        {day.sessions.length} Sessions
                      </span>
                    </div>
                    <div className="text-sm font-bold truncate max-w-[180px]">{day.dateStr.split("•")[0]}</div>
                  </button>
                );
              })}
            </div>

            {/* Current Day Header Card */}
            <div className="bg-slate-900 border border-amber-500/30 rounded-3xl p-6 sm:p-10 mb-8 shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/5 blur-3xl rounded-full pointer-events-none" />

              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
                <div>
                  <div className="flex flex-wrap items-center gap-2 mb-3">
                    <span className="px-3.5 py-1 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30 text-xs font-black uppercase tracking-wider">
                      {currentDay.dayName} · {currentDay.dateStr}
                    </span>
                    <span className="text-xs text-slate-400 bg-slate-950 px-3 py-1 rounded-full border border-slate-800 flex items-center gap-1.5 font-semibold">
                      <MapPin size={13} className="text-amber-400" />
                      {currentDay.hallHighlight}
                    </span>
                  </div>
                  <h2 className="text-2xl sm:text-4xl font-black text-white mb-2">{currentDay.theme}</h2>
                  <p className="text-slate-300 text-sm sm:text-base max-w-3xl leading-relaxed">
                    {currentDay.summary}
                  </p>
                </div>

                {/* Track Filters */}
                <div className="flex flex-wrap lg:flex-col gap-2 shrink-0">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Filter by Session Track</span>
                  <div className="flex flex-wrap gap-1.5">
                    {[
                      { id: "all", label: "All Tracks" },
                      { id: "plenary", label: "Plenary" },
                      { id: "b2b", label: "B2B Dealmaking" },
                      { id: "workshop", label: "Workshops" },
                      { id: "gala", label: "Gala & Social" },
                    ].map((track) => (
                      <button
                        key={track.id}
                        onClick={() => setTrackFilter(track.id)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all border ${
                          trackFilter === track.id
                            ? "bg-amber-500 text-slate-950 border-amber-400"
                            : "bg-slate-950 text-slate-400 border-slate-800 hover:text-white"
                        }`}
                      >
                        {track.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Hourly Sessions Timeline */}
            <div className="space-y-4">
              {filteredSessions.map((session, idx) => (
                <div
                  key={idx}
                  className="bg-slate-900 border border-slate-800 hover:border-amber-500/40 rounded-2xl p-6 transition-all group flex flex-col md:flex-row md:items-start justify-between gap-6 hover:-translate-y-0.5 shadow-md"
                >
                  <div className="md:w-56 shrink-0 space-y-2">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 text-amber-400 text-xs font-bold border border-amber-500/20">
                      <Clock size={12} /> {session.time}
                    </span>
                    <div className="text-xs text-slate-400 flex items-center gap-1">
                      <MapPin size={13} className="text-amber-400 shrink-0" />
                      <span className="truncate">{session.location}</span>
                    </div>
                  </div>

                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-2">
                      <span
                        className={`text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${
                          session.track === "plenary"
                            ? "bg-blue-500/10 text-blue-400 border-blue-500/20"
                            : session.track === "b2b"
                            ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                            : session.track === "workshop"
                            ? "bg-purple-500/10 text-purple-400 border-purple-500/20"
                            : "bg-rose-500/10 text-rose-400 border-rose-500/20"
                        }`}
                      >
                        {session.trackLabel}
                      </span>
                    </div>

                    <h3 className="text-lg sm:text-xl font-bold text-white group-hover:text-amber-400 transition-colors">
                      {session.title}
                    </h3>

                    <p className="text-sm text-slate-300 leading-relaxed">{session.description}</p>

                    {session.moderatorOrKeynote && (
                      <div className="pt-2 text-xs font-semibold text-amber-300/90 flex items-center gap-1.5">
                        <Mic size={14} className="text-amber-400" />
                        <span>{session.moderatorOrKeynote}</span>
                      </div>
                    )}
                  </div>

                  <div className="shrink-0 flex items-center">
                    <Link
                      href="/trade-fair/tickets"
                      className="px-4 py-2 rounded-xl bg-slate-950 border border-slate-700 hover:border-amber-400 hover:text-amber-400 text-xs font-bold text-slate-300 transition-all flex items-center gap-1"
                    >
                      Reserve Seat <ChevronRight size={14} />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Visual Thematic Highlights Split */}
        <section className="py-20 bg-slate-900/30 border-t border-slate-800">
          <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              <div className="lg:col-span-7">
                <div className="relative rounded-3xl overflow-hidden border border-amber-500/30 shadow-2xl group bg-slate-900">
                  <div className="aspect-[16/9] w-full overflow-hidden relative">
                    <img
                      src="/images/tradefair/keynote.jpg"
                      alt="GloTrade 2026 Keynote Plenary Stage"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent" />
                  </div>
                  <div className="absolute bottom-6 left-6 right-6 p-4 rounded-2xl bg-slate-950/90 backdrop-blur-md border border-slate-800 flex items-center justify-between">
                    <div>
                      <h4 className="text-white font-bold text-sm">Plenary Hall D · Keynote Arena</h4>
                      <p className="text-slate-400 text-xs">2,500 Delegate Auditorium · 50-Meter Curved LED Video Backdrop</p>
                    </div>
                    <span className="text-xs font-bold text-amber-400 bg-amber-500/10 border border-amber-500/20 px-3 py-1 rounded-full">
                      Broadcast Live
                    </span>
                  </div>
                </div>
              </div>

              <div className="lg:col-span-5 space-y-6">
                <span className="text-xs font-bold uppercase tracking-widest text-amber-400 bg-amber-500/10 px-4 py-1.5 rounded-full border border-amber-500/30">
                  Summit Architecture
                </span>
                <h2 className="text-3xl font-black text-white leading-tight">
                  Engineered for Impactful Commercial Outcomes
                </h2>
                <p className="text-slate-300 text-sm leading-relaxed">
                  Unlike academic conferences, each session at GloTrade Trade Fair 2026 is linked directly to practical
                  cross-border supplier pipelines, trade finance approvals, and sovereign policy commitments.
                </p>

                <div className="space-y-3">
                  {[
                    "30+ Keynotes and high-level ministerial panels",
                    "Over 120 curated B2B matchmaking roundtables",
                    "Simultaneous 4-language interpretation (EN, FR, AR, ZH)",
                    "Dedicated investor-ready pitch sessions for 50 African MSMEs",
                  ].map((item, i) => (
                    <div key={i} className="flex items-center gap-2.5 text-xs text-slate-300">
                      <CheckCircle2 size={16} className="text-amber-400 shrink-0" />
                      <span>{item}</span>
                    </div>
                  ))}
                </div>

                <div className="pt-2 flex gap-3">
                  <Link
                    href="/trade-fair/tickets"
                    className="px-6 py-3.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-sm shadow-xl shadow-amber-500/20 transition-all hover:scale-105 inline-flex items-center gap-2"
                  >
                    Get Delegate Ticket <ArrowRight size={16} />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Final Conversion CTA */}
        <section className="py-20 bg-gradient-to-r from-slate-950 via-amber-950/30 to-slate-950 border-t border-amber-500/20">
          <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative">
            <div className="relative z-10">
              <div className="inline-flex items-center gap-2 mb-6 px-4 py-2 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-bold uppercase tracking-widest">
                <Sparkles size={14} /> Mark Your Calendar
              </div>

              <h2 className="text-3xl sm:text-5xl font-black text-white mb-4">
                Be in Abuja from 1st – 5th December 2026
              </h2>

              <p className="text-slate-300 text-base sm:text-lg max-w-2xl mx-auto mb-10 leading-relaxed">
                Whether you attend for one specific dealmaking summit or immerse yourself in all five days of exhibitions and evening galas — secure your accreditation early.
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link
                  href="/trade-fair/tickets"
                  className="w-full sm:w-auto px-8 py-4 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-base shadow-xl shadow-amber-500/20 transition-all hover:scale-105 inline-flex items-center justify-center gap-2"
                >
                  <Star size={18} /> Book Delegate Ticket
                </Link>
                <Link
                  href="/trade-fair/exhibitors"
                  className="w-full sm:w-auto px-8 py-4 rounded-xl bg-slate-900 border border-slate-700 hover:bg-slate-800 text-white font-bold text-base transition-all inline-flex items-center justify-center gap-2"
                >
                  Reserve Exhibition Stall <ArrowRight size={16} />
                </Link>
                <Link
                  href="/trade-fair/venue"
                  className="w-full sm:w-auto px-8 py-4 rounded-xl bg-slate-900 border border-amber-500/30 text-amber-400 hover:bg-slate-800 font-bold text-base transition-all inline-flex items-center justify-center gap-2"
                >
                  Explore Venue Blueprint
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      <BazaarFooter />
    </div>
  );
}
