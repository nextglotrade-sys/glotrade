"use client";

import { useState } from "react";
import BazaarNav from "@/components/bazaar/BazaarNav";
import BazaarFooter from "@/components/bazaar/BazaarFooter";
import Link from "next/link";
import {
  MapPin,
  Navigation,
  Car,
  Shield,
  Wifi,
  Utensils,
  Accessibility,
  Globe,
  Calendar,
  Clock,
  Hotel,
  Plane,
  Train,
  ArrowRight,
  CheckCircle2,
  Info,
  Sparkles,
  Phone,
  Mail,
  Building2,
  Layers,
  Zap,
  Box,
  Cpu,
  Tv,
  BadgeCheck,
  Compass,
  FileText,
  HelpCircle,
  ExternalLink,
  ChevronRight,
} from "lucide-react";
import { translate } from "@/utils/translate";

interface HallDetail {
  id: string;
  name: string;
  badge: string;
  area: string;
  capacity: string;
  focus: string;
  features: string[];
  powerWifi: string;
  idealFor: string;
}

const venueHalls: HallDetail[] = [
  {
    id: "hall-a",
    name: "Hall A: Africa Trade & Manufacturing Pavilion",
    badge: "Main Trade Hall",
    area: "14,500 m²",
    capacity: "4,000+ Concurrent Visitors",
    focus: "Light & heavy manufacturing, agro-commodities, FMCG, industrial packaging, and intra-African supply chain exhibits.",
    features: [
      "Heavy load-bearing floor (30 kN/m²) for industrial machinery",
      "Direct drive-in cargo loading bays (6.5m clearance)",
      "Dedicated cold-chain & agro-commodity display section",
      "Modular 3x3m and 6x6m custom booth infrastructure",
    ],
    powerWifi: "3-Phase 380V Industrial Power · Wi-Fi 6 Ultra-Density",
    idealFor: "Manufacturers, Agro-processors, Exporters, Packaging Companies",
  },
  {
    id: "hall-b",
    name: "Hall B: Global Tech, Fintech & E-Commerce Hub",
    badge: "Innovation Center",
    area: "10,200 m²",
    capacity: "2,500+ Concurrent Visitors",
    focus: "Fintech, digital payment solutions, AI in trade logistics, enterprise SaaS, hardware innovators, and cross-border e-commerce.",
    features: [
      "High-tech modular demo pods with 4K touch display integration",
      "Dedicated startup presentation amphitheatre (300 seats)",
      "High-speed 10Gbps dedicated fibre link with redundant backup",
      "Podcasting & media interview studio booths",
    ],
    powerWifi: "Uninterrupted Online UPS Power · 10Gbps Redundant Fibre",
    idealFor: "Fintechs, Logistics Tech, Telecoms, Software Providers",
  },
  {
    id: "hall-c",
    name: "Hall C: International Country Pavilions & B2B Lounge",
    badge: "Diplomatic & Bilateral",
    area: "9,800 m²",
    capacity: "2,000+ Concurrent Delegates",
    focus: "Sovereign trade missions, national export development boards, bilateral chambers of commerce, and high-level B2B matchmaking.",
    features: [
      "24 private executive deal rooms with soundproofing",
      "Simultaneous interpretation booths (EN, FR, AR, ZH)",
      "Dedicated diplomatic liaison protocol lounge",
      "Curated B2B matchmaking concierge desk",
    ],
    powerWifi: "Diplomatic Encryption-Ready Wi-Fi · High Security Access",
    idealFor: "Embassies, Chambers of Commerce, Trade Ministries, Investors",
  },
  {
    id: "hall-d",
    name: "Hall D: Keynote Auditorium & Plenary Arena",
    badge: "Plenary Stage",
    area: "6,500 m²",
    capacity: "2,500 Seated Delegates",
    focus: "High-level keynote addresses, AfCFTA trade ministerial panels, presidential business addresses, and the GloTrade Excellence Awards Gala.",
    features: [
      "50-meter curved ultra-fine pitch LED video wall backdrop",
      "Broadcast-grade robotic camera tracking system",
      "Tiered ergonomic auditorium seating with charging ports",
      "Acoustic treatment engineered for premier international summits",
    ],
    powerWifi: "Broadcast Power Grid · Dedicated Press Uplink",
    idealFor: "Summit Delegates, Press Corps, Keynote Attendees, VIP Guests",
  },
  {
    id: "outdoor",
    name: "Outdoor Grand Esplanade & Cultural Village",
    badge: "Open-Air Showcase",
    area: "8,000 m²",
    capacity: "3,500+ Visitors",
    focus: "Automotive & electric commercial vehicles, heavy agricultural machinery, solar power installations, African culinary pavilion, and evening live performances.",
    features: [
      "Reinforced heavy asphalt display pads for commercial trucks",
      "All-weather festival marquees and cultural craft gazebos",
      "Continental African food & beverage dining village",
      "Evening festival entertainment stage with pro line-array audio",
    ],
    powerWifi: "Outdoor Substation Distribution · Wide-Area Mesh Wi-Fi",
    idealFor: "Automotive, Renewable Energy, Heavy Machinery, Food Vendors",
  },
];

const technicalSpecs = [
  {
    icon: Layers,
    title: "Exhibition Space",
    spec: "45,000+ m² Total",
    detail: "Spanning 4 climate-controlled indoor halls plus an outdoor commercial esplanade.",
  },
  {
    icon: Zap,
    title: "Power Infrastructure",
    spec: "Dual 33kV + 100% Backup",
    detail: "Dual independent grid feeds backed by synchronized continuous-rated diesel generators.",
  },
  {
    icon: Box,
    title: "Floor Loading & Rigging",
    spec: "30 kN/m² Floor Load",
    detail: "12-meter clear ceiling height with high-capacity roof trusses for hanging banners & lighting.",
  },
  {
    icon: Wifi,
    title: "Digital Connectivity",
    spec: "10 Gbps Fibre Uplink",
    detail: "Enterprise Wi-Fi 6 infrastructure engineered for over 60,000 concurrent connected devices.",
  },
  {
    icon: Shield,
    title: "Security & Accreditation",
    spec: "Biometric & RFID Access",
    detail: "Perimeter security, diplomatic escort coordination, full bag scanning, and 24/7 CCTV surveillance.",
  },
  {
    icon: Car,
    title: "Parking & Logistics",
    spec: "1,200+ Secure Bays",
    detail: "Multi-level covered parking, VIP reserved bays, dedicated taxi ranks, and heavy cargo receiving.",
  },
];

const transportOptions = [
  {
    icon: Plane,
    title: "Nnamdi Azikiwe Int'l Airport (ABV)",
    distance: "35–40 Minutes by Express Highway",
    desc: "Direct dual-carriageway access via Airport Road. Complimentary GloTrade VIP shuttles will run every 30 minutes for accredited delegates and international arrivals.",
    tag: "Airport Express Shuttle",
  },
  {
    icon: Navigation,
    title: "Abuja Central Business District (CBD)",
    distance: "8–10 Minutes Drive",
    desc: "Centrally positioned with rapid arterial access from Shehu Shagari Way and Constitution Avenue. Close to major federal ministries and corporate headquarters.",
    tag: "Prime Central Hub",
  },
  {
    icon: Train,
    title: "Abuja Metro & Rail Link",
    distance: "15–20 Minutes from Metro Terminals",
    desc: "Convenient rail connections from the Airport to Central Metro Station. Dedicated taxi dispatch and ride-hail stands operate right outside station concourses.",
    tag: "City Rail Access",
  },
  {
    icon: Car,
    title: "Ride-Hail & Private Chauffeur",
    distance: "Available 24/7 Across Abuja",
    desc: "Uber and Bolt operate seamlessly throughout the capital. The venue features a dedicated rideshare pick-up/drop-off zone with traffic marshals for zero congestion.",
    tag: "Dedicated Drop-Off Zone",
  },
];

const partnerHotels = [
  {
    name: "Transcorp Hilton Abuja",
    stars: 5,
    distance: "5 min drive",
    location: "Maitama Diplomatic Zone",
    perk: "Official VIP Partner Hotel",
    shuttle: "Direct 15-min scheduled executive shuttle",
    code: "GLOTRADE2026",
  },
  {
    name: "Sheraton Abuja Hotel / Abuja Continental",
    stars: 5,
    distance: "8 min drive",
    location: "Wuse Zone 4",
    perk: "Corporate Delegate Room Block",
    shuttle: "Frequent morning & evening fair shuttles",
    code: "GLOCONNECT26",
  },
  {
    name: "Fraser Suites Abuja",
    stars: 5,
    distance: "7 min drive",
    location: "Central Business District",
    perk: "Luxury Serviced Suites for Delegations",
    shuttle: "On-demand luxury chauffeur service",
    code: "FAIRFRASER26",
  },
  {
    name: "Wells Carlton Hotel & Luxury Apartments",
    stars: 5,
    distance: "12 min drive",
    location: "Asokoro High-End Enclave",
    perk: "Quiet Executive Retreat & Dining",
    shuttle: "Private limousine transfer available",
    code: "WELLSGLO2026",
  },
  {
    name: "Ibis Abuja Hotel",
    stars: 3,
    distance: "12 min drive",
    location: "Muritala Mohammed Way",
    perk: "Smart Budget-Friendly Business Hub",
    shuttle: "Convenient daily delegate bus stop",
    code: "IBISGLO26",
  },
];

const venueServices = [
  {
    icon: Shield,
    title: "Diplomatic Protection & Medical Center",
    desc: "Full on-site paramedic station with rapid-response ambulances, certified trauma staff, and protocol escorts.",
  },
  {
    icon: Globe,
    title: "Multilingual Diplomatic Protocol Desk",
    desc: "Dedicated officers assisting foreign delegations in English, French, Arabic, Chinese, and Hausa.",
  },
  {
    icon: Utensils,
    title: "Executive VIP Lounges & Banqueting",
    desc: "5-star continental catering, private meeting rooms with barista bars, and delegate lunch service.",
  },
  {
    icon: Building2,
    title: "Customs & Bonded Freight Clearing",
    desc: "On-site customs agents facilitating temporary import clearances for international exhibits and sample goods.",
  },
  {
    icon: Accessibility,
    title: "Universal Accessibility & Mobility Ramps",
    desc: "100% step-free hall navigation, dedicated wheelchair access elevators, and accessible restroom facilities.",
  },
  {
    icon: Zap,
    title: "ATM Banking Gallery & Currency Bureau",
    desc: "Multi-currency ATMs and verified bureau de change counters offering on-the-spot exchange services.",
  },
];

export default function VenuePage() {
  const [selectedHallId, setSelectedHallId] = useState<string>("hall-a");

  const selectedHall = venueHalls.find((h) => h.id === selectedHallId) || venueHalls[0];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-amber-500 selection:text-slate-950">
      <BazaarNav />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative overflow-hidden py-20 lg:py-28 bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 border-b border-slate-800">
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[400px] bg-amber-500/10 blur-[140px] rounded-full" />
          </div>

          <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
            <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-amber-400 bg-amber-500/10 px-4 py-2 rounded-full border border-amber-500/30 mb-6 shadow-sm">
              <Sparkles size={14} className="text-amber-400" />
              {translate("bazaar.eventLocation") || "Nigerian Army Conference Centre & Suites (NACCAS) · Asokoro, Abuja"}
            </div>

            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black text-white tracking-tight leading-tight mb-6">
              The Stage for Africa&apos;s <br />
              <span className="bg-gradient-to-r from-amber-400 via-amber-300 to-amber-500 bg-clip-text text-transparent">
                Global Commerce
              </span>
            </h1>

            <p className="text-slate-300 text-lg sm:text-xl max-w-3xl mx-auto leading-relaxed mb-10">
              Hosted at the prestigious <strong className="text-white font-bold">Nigerian Army Conference Centre &amp; Suites (NACCAS)</strong>, Km 10 Expressway, Asokoro, Abuja. Featuring over{" "}
              <strong className="text-white font-bold">45,000 square meters</strong> of state-of-the-art exhibition
              halls, VIP bilateral meeting suites, keynote auditoriums, and open-air pavilion esplanades.
            </p>

            {/* Quick Details Bar */}
            <div className="inline-flex flex-wrap items-center justify-center gap-4 sm:gap-8 bg-slate-900/90 border border-amber-500/30 rounded-2xl p-4 sm:px-8 sm:py-5 shadow-2xl backdrop-blur-md">
              <div className="flex items-center gap-2.5 text-slate-200 text-sm">
                <Calendar className="text-amber-400 shrink-0" size={18} />
                <span className="font-semibold">1st – 5th December 2026</span>
              </div>
              <div className="hidden sm:block w-px h-6 bg-slate-700" />
              <div className="flex items-center gap-2.5 text-slate-200 text-sm">
                <Clock className="text-amber-400 shrink-0" size={18} />
                <span className="font-semibold">Starting from 09:00 AM till 5th Dec · Open 24/7 (No closing time)</span>
              </div>
              <div className="hidden sm:block w-px h-6 bg-slate-700" />
              <div className="flex items-center gap-2.5 text-slate-200 text-sm">
                <MapPin className="text-amber-400 shrink-0" size={18} />
                <span className="font-semibold">NACCAS, Km 10 Expressway, Asokoro, Abuja</span>
              </div>
              <div className="hidden sm:block w-px h-6 bg-slate-700" />
              <div className="flex items-center gap-2.5 text-amber-400 text-sm font-bold">
                <BadgeCheck size={18} className="text-amber-400 shrink-0" />
                <span>ICC Standard Venue</span>
              </div>
            </div>
          </div>
        </section>

        {/* Venue Showcase Feature: Real Architectural Visual + Venue Profile */}
        <section className="py-16 lg:py-24 bg-slate-950">
          <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              {/* Photo Showcase Card */}
              <div className="lg:col-span-7">
                <div className="relative rounded-3xl overflow-hidden border border-amber-500/30 shadow-2xl group bg-slate-900">
                  <div className="aspect-[16/10] w-full overflow-hidden relative">
                    <img
                      src="/images/tradefair/venue.jpg"
                      alt="Nigerian Army Conference Centre & Suites (NACCAS) - Host Venue for GloTrade Trade Fair 2026"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent" />
                  </div>

                  {/* Overlay Badges */}
                  <div className="absolute top-5 left-5 flex flex-wrap gap-2">
                    <span className="bg-slate-950/85 backdrop-blur-md text-amber-400 border border-amber-500/40 text-xs font-bold px-3 py-1.5 rounded-full flex items-center gap-1.5 shadow-lg">
                      <Building2 size={13} /> Official Host Facility
                    </span>
                    <span className="bg-slate-950/85 backdrop-blur-md text-emerald-400 border border-emerald-500/40 text-xs font-bold px-3 py-1.5 rounded-full flex items-center gap-1.5 shadow-lg">
                      <Shield size={13} /> High Diplomatic Security Zone
                    </span>
                  </div>

                  <div className="absolute bottom-5 left-5 right-5 p-4 rounded-2xl bg-slate-950/90 backdrop-blur-md border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                    <div>
                      <h4 className="text-white font-bold text-base">Nigerian Army Conference Centre &amp; Suites (NACCAS)</h4>
                      <p className="text-slate-400 text-xs">Km 10 Expressway, Asokoro · Federal Capital Territory, Nigeria</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] font-bold text-amber-400 bg-amber-500/10 border border-amber-500/20 px-3 py-1 rounded-full">
                        45,000 m² Complex
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Venue Summary & Highlights */}
              <div className="lg:col-span-5 space-y-6">
                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-bold uppercase tracking-wider">
                  <Info size={14} /> Premier Host Complex
                </div>

                <h2 className="text-3xl sm:text-4xl font-black text-white leading-tight">
                  Designed for World-Scale Trade Exhibitions
                </h2>

                <p className="text-slate-300 text-base leading-relaxed">
                  Carefully selected to meet international UFI and ICC exhibition venue benchmarks, our host facility
                  in Abuja brings together comprehensive exhibition logistics, ultra-modern conference audio-visual
                  engineering, and elite hospitality under one roof.
                </p>

                <div className="space-y-3.5">
                  {[
                    { label: "Total Exhibition Footprint", val: "45,000+ sq. meters across 4 halls" },
                    { label: "Expected Daily Footfall", val: "10,000+ trade buyers and delegates" },
                    { label: "Simultaneous Interpretation", val: "4-Channel audio (EN, FR, AR, ZH)" },
                    { label: "Loading & Freight Docks", val: "3 Direct drive-in industrial bays" },
                    { label: "Diplomatic Perimeter", val: "Full credential accreditation screening" },
                  ].map((item, i) => (
                    <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-slate-900 border border-slate-800 text-sm">
                      <span className="text-slate-400 flex items-center gap-2">
                        <CheckCircle2 size={16} className="text-amber-400 shrink-0" />
                        {item.label}
                      </span>
                      <span className="font-bold text-white text-right">{item.val}</span>
                    </div>
                  ))}
                </div>

                <div className="pt-2 flex flex-wrap gap-3">
                  <Link
                    href="/trade-fair/exhibitors"
                    className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-sm shadow-xl shadow-amber-500/20 transition-all hover:scale-105"
                  >
                    Exhibitor Floor Registration <ArrowRight size={16} />
                  </Link>
                  <a
                    href="https://wa.me/2347044600924?text=Hello%20GloTrade,%20I%20would%20like%20information%20about%20the%20Trade%20Fair%20Venue"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-5 py-3.5 rounded-xl bg-emerald-600/20 border border-emerald-500/30 text-emerald-400 hover:bg-emerald-600/30 font-bold text-sm transition-all"
                  >
                    <Phone size={15} /> Venue Enquiries
                  </a>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Interactive Complex Blueprint & Hall Explorer */}
        <section className="py-20 bg-slate-900/40 border-t border-slate-800">
          <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <span className="text-xs font-bold uppercase tracking-widest text-amber-400 bg-amber-500/10 px-4 py-1.5 rounded-full border border-amber-500/30">
                Interactive Exhibition Blueprint
              </span>
              <h2 className="text-3xl sm:text-4xl font-black text-white mt-4 mb-3">
                Explore the Exhibition Halls & Pavilions
              </h2>
              <p className="text-slate-400 max-w-2xl mx-auto text-base">
                Click across the complex sectors below to view capacity, technical specifications, and sector zoning.
              </p>
            </div>

            {/* Hall Tabs */}
            <div className="flex items-center justify-start lg:justify-center gap-2 overflow-x-auto pb-4 scrollbar-none mb-8">
              {venueHalls.map((hall) => {
                const isActive = hall.id === selectedHallId;
                return (
                  <button
                    key={hall.id}
                    onClick={() => setSelectedHallId(hall.id)}
                    className={`px-5 py-3 rounded-2xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all flex items-center gap-2 border ${
                      isActive
                        ? "bg-amber-500 text-slate-950 border-amber-400 shadow-lg shadow-amber-500/20 scale-105"
                        : "bg-slate-900 text-slate-300 border-slate-800 hover:border-amber-500/40 hover:text-white"
                    }`}
                  >
                    <Layers size={15} className={isActive ? "text-slate-950" : "text-amber-400"} />
                    <span>{hall.name.split(":")[0]}</span>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full ${isActive ? "bg-slate-950/20 text-slate-950" : "bg-slate-800 text-slate-400"}`}>
                      {hall.area}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Selected Hall Detail Card */}
            <div className="bg-slate-950 border border-amber-500/30 rounded-3xl p-6 sm:p-10 shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/5 blur-3xl rounded-full pointer-events-none" />

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start relative z-10">
                <div className="lg:col-span-7 space-y-6">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-bold uppercase tracking-wider">
                      {selectedHall.badge}
                    </span>
                    <span className="text-xs text-slate-400 bg-slate-900 px-3 py-1 rounded-full border border-slate-800 font-semibold">
                      Floor Area: {selectedHall.area}
                    </span>
                    <span className="text-xs text-slate-400 bg-slate-900 px-3 py-1 rounded-full border border-slate-800 font-semibold">
                      Capacity: {selectedHall.capacity}
                    </span>
                  </div>

                  <h3 className="text-2xl sm:text-3xl font-black text-white">{selectedHall.name}</h3>

                  <p className="text-slate-300 text-base leading-relaxed">{selectedHall.focus}</p>

                  <div className="space-y-3">
                    <h4 className="text-xs uppercase tracking-widest font-bold text-amber-400">Technical Highlights & Rigging:</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {selectedHall.features.map((feat, i) => (
                        <div key={i} className="flex items-start gap-2.5 p-3 rounded-xl bg-slate-900/80 border border-slate-800/80 text-xs text-slate-200">
                          <CheckCircle2 size={15} className="text-amber-400 shrink-0 mt-0.5" />
                          <span>{feat}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="lg:col-span-5 bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-5">
                  <div className="flex items-center gap-3 pb-4 border-b border-slate-800">
                    <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
                      <Zap size={20} />
                    </div>
                    <div>
                      <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Power & Telecom Spec</span>
                      <span className="text-xs font-bold text-white">{selectedHall.powerWifi}</span>
                    </div>
                  </div>

                  <div>
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-2">Target Exhibitor Verticals</span>
                    <p className="text-xs font-semibold text-amber-300 bg-amber-500/10 border border-amber-500/20 rounded-xl p-3">
                      {selectedHall.idealFor}
                    </p>
                  </div>

                  <div className="pt-2 flex flex-col gap-2.5">
                    <Link
                      href="/trade-fair/exhibitors"
                      className="w-full py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs uppercase tracking-wider text-center transition-all shadow-md shadow-amber-500/10"
                    >
                      Reserve Stalls in this Hall
                    </Link>
                    <Link
                      href="/trade-fair/programme"
                      className="w-full py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs uppercase tracking-wider text-center transition-all border border-slate-700"
                    >
                      View Hall Programme & Events
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Technical Venue Specifications Grid */}
        <section className="py-20 bg-slate-950 border-t border-slate-800">
          <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-14">
              <span className="text-xs font-bold uppercase tracking-widest text-amber-400 bg-amber-500/10 px-4 py-1.5 rounded-full border border-amber-500/30">
                Facility Specifications
              </span>
              <h2 className="text-3xl sm:text-4xl font-black text-white mt-4 mb-3">
                Built to International Standards
              </h2>
              <p className="text-slate-400 max-w-2xl mx-auto text-base">
                Comprehensive technical parameters for exhibitors, stand builders, logistics contractors, and VIP delegations.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {technicalSpecs.map((item, i) => (
                <div
                  key={i}
                  className="bg-slate-900 border border-slate-800 hover:border-amber-500/40 rounded-2xl p-7 flex items-start gap-5 transition-all group hover:-translate-y-1"
                >
                  <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform text-amber-400">
                    <item.icon size={22} />
                  </div>
                  <div>
                    <h3 className="font-bold text-white text-base mb-1">{item.title}</h3>
                    <div className="text-xs font-bold text-amber-400 mb-1.5">{item.spec}</div>
                    <p className="text-xs text-slate-400 leading-relaxed">{item.detail}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Getting There: Airport, City Transit & Access Routes */}
        <section className="py-20 bg-slate-900/30 border-t border-slate-800">
          <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-14">
              <span className="text-xs font-bold uppercase tracking-widest text-amber-400 bg-amber-500/10 px-4 py-1.5 rounded-full border border-amber-500/30">
                Transport & Transit
              </span>
              <h2 className="text-3xl sm:text-4xl font-black text-white mt-4 mb-3">
                Seamless Transit to the Fairgrounds
              </h2>
              <p className="text-slate-400 max-w-2xl mx-auto text-base">
                Whether arriving from international flights at Nnamdi Azikiwe Airport or driving from Abuja CBD, access is swift and fully coordinated.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {transportOptions.map((opt, i) => (
                <div key={i} className="bg-slate-950 border border-slate-800 rounded-3xl p-7 flex flex-col justify-between hover:border-amber-500/30 transition-all">
                  <div className="flex items-start gap-4 mb-4">
                    <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center shrink-0 text-amber-400">
                      <opt.icon size={22} />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-[10px] font-bold text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2.5 py-0.5 rounded-full">
                          {opt.tag}
                        </span>
                        <span className="text-[11px] text-slate-400 font-semibold">{opt.distance}</span>
                      </div>
                      <h3 className="font-bold text-white text-base">{opt.title}</h3>
                    </div>
                  </div>
                  <p className="text-slate-300 text-xs sm:text-sm leading-relaxed pl-16">{opt.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Official Delegate Hotels & Accommodation Program */}
        <section className="py-20 bg-slate-950 border-t border-slate-800">
          <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
              <div>
                <span className="text-xs font-bold uppercase tracking-widest text-amber-400 bg-amber-500/10 px-4 py-1.5 rounded-full border border-amber-500/30">
                  Delegate Accommodation Program
                </span>
                <h2 className="text-3xl sm:text-4xl font-black text-white mt-4 mb-2">
                  Official Partner Hotels in Abuja
                </h2>
                <p className="text-slate-400 max-w-xl text-sm">
                  Exclusive negotiated rates and direct shuttle connections for registered exhibitors, speakers, and VIP delegates.
                </p>
              </div>

              <div className="bg-slate-900 border border-amber-500/20 rounded-2xl p-4 flex items-center gap-3">
                <Hotel size={24} className="text-amber-400" />
                <div>
                  <span className="text-[11px] uppercase font-bold text-slate-400 block">Delegate Booking Assistance</span>
                  <span className="text-xs font-bold text-white">hospitality@glotrade.online</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {partnerHotels.map((hotel, i) => (
                <div
                  key={i}
                  className="bg-slate-900 border border-slate-800 hover:border-amber-500/40 rounded-3xl p-6 flex flex-col justify-between transition-all group hover:-translate-y-1"
                >
                  <div className="space-y-4">
                    <div className="flex items-start justify-between gap-2">
                      <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 shrink-0">
                        <Hotel size={18} />
                      </div>
                      <span className="text-[10px] font-bold text-amber-400 bg-amber-500/10 border border-amber-500/30 px-2.5 py-1 rounded-full">
                        {hotel.perk}
                      </span>
                    </div>

                    <div>
                      <h3 className="font-bold text-white text-base group-hover:text-amber-400 transition-colors">{hotel.name}</h3>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-amber-400 text-xs font-bold">{"★".repeat(hotel.stars)}</span>
                        <span className="text-slate-500 text-xs">·</span>
                        <span className="text-slate-400 text-xs">{hotel.location}</span>
                        <span className="text-slate-500 text-xs">·</span>
                        <span className="text-slate-400 text-xs font-medium">{hotel.distance}</span>
                      </div>
                    </div>

                    <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 text-xs text-slate-300 flex items-center gap-2">
                      <Car size={14} className="text-amber-400 shrink-0" />
                      <span>{hotel.shuttle}</span>
                    </div>
                  </div>

                  <div className="pt-5 mt-5 border-t border-slate-800 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-slate-500 block">Promo Code</span>
                      <code className="text-xs font-black text-amber-400">{hotel.code}</code>
                    </div>
                    <Link
                      href="/trade-fair/contact"
                      className="text-xs font-bold text-white hover:text-amber-400 flex items-center gap-1 transition-colors"
                    >
                      Book Assistance <ChevronRight size={14} />
                    </Link>
                  </div>
                </div>
              ))}
            </div>

            <p className="text-center text-slate-500 text-xs mt-8">
              * Hotel discount promo codes become valid once delegate ticket registration is confirmed. Early booking is strongly recommended due to high seasonal demand in Abuja.
            </p>
          </div>
        </section>

        {/* On-Site Delegate Services & Amenities */}
        <section className="py-20 bg-slate-900/40 border-t border-slate-800">
          <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-14">
              <span className="text-xs font-bold uppercase tracking-widest text-amber-400 bg-amber-500/10 px-4 py-1.5 rounded-full border border-amber-500/30">
                Delegate Experience
              </span>
              <h2 className="text-3xl sm:text-4xl font-black text-white mt-4 mb-3">
                Complete On-Site Hospitality & Services
              </h2>
              <p className="text-slate-400 max-w-2xl mx-auto text-base">
                Everything delegates, international missions, and exhibitors require for an effortless 5-day event experience.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {venueServices.map((service, i) => (
                <div
                  key={i}
                  className="bg-slate-950 border border-slate-800 rounded-2xl p-7 hover:border-amber-500/30 transition-all flex items-start gap-4"
                >
                  <div className="w-11 h-11 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 shrink-0">
                    <service.icon size={20} />
                  </div>
                  <div>
                    <h3 className="font-bold text-white text-sm mb-1.5">{service.title}</h3>
                    <p className="text-xs text-slate-400 leading-relaxed">{service.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Final Conversion CTA */}
        <section className="py-20 bg-gradient-to-r from-slate-950 via-amber-950/30 to-slate-950 border-t border-amber-500/20">
          <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-48 bg-amber-500/10 blur-3xl rounded-full pointer-events-none" />

            <div className="relative z-10">
              <div className="inline-flex items-center gap-2 mb-6 px-4 py-2 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-bold uppercase tracking-widest">
                <Sparkles size={14} /> Join West Africa&apos;s Flagship Fair
              </div>

              <h2 className="text-3xl sm:text-5xl font-black text-white mb-4">
                Plan Your Visit to Abuja Today
              </h2>

              <p className="text-slate-300 text-base sm:text-lg max-w-2xl mx-auto mb-10 leading-relaxed">
                Whether you are exhibiting products, pitching to international venture funds, or exploring new import/export corridors — we look forward to welcoming you to Abuja.
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link
                  href="/trade-fair/tickets"
                  className="w-full sm:w-auto px-8 py-4 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-base shadow-xl shadow-amber-500/20 transition-all hover:scale-105 inline-flex items-center justify-center gap-2"
                >
                  <Sparkles size={18} /> Book Delegate Ticket
                </Link>
                <Link
                  href="/trade-fair/exhibitors"
                  className="w-full sm:w-auto px-8 py-4 rounded-xl bg-slate-900 border border-slate-700 hover:bg-slate-800 text-white font-bold text-base transition-all inline-flex items-center justify-center gap-2"
                >
                  Reserve Exhibition Stall <ArrowRight size={16} />
                </Link>
                <Link
                  href="/trade-fair/contact"
                  className="w-full sm:w-auto px-8 py-4 rounded-xl bg-slate-900 border border-amber-500/30 text-amber-400 hover:bg-slate-800 font-bold text-base transition-all inline-flex items-center justify-center gap-2"
                >
                  <Mail size={16} /> Contact Venue Protocol
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
