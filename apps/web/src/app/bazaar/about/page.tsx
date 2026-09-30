"use client";

import BazaarNav from "@/components/bazaar/BazaarNav";
import BazaarFooter from "@/components/bazaar/BazaarFooter";
import Link from "next/link";
import {
  Sparkles,
  Calendar,
  MapPin,
  Target,
  Users,
  ShieldCheck,
  ArrowRight,
  Award,
  ShoppingBag,
  Globe,
  TrendingUp,
  Building2,
  CheckCircle2,
  Layers,
  Zap,
  Handshake,
  FileText,
  Compass,
  Briefcase,
  Star,
} from "lucide-react";
import { translate } from "@/utils/translate";

const pillars = [
  {
    icon: Users,
    title: "Empower African Entrepreneurs",
    subtitle: "Inclusion & Capacity",
    desc: "Targeted support for women-owned enterprises, youth innovators, and rural agribusiness producers to scale into formal export channels.",
    badge: "Pillar 01",
  },
  {
    icon: Globe,
    title: "AfCFTA Continental Integration",
    subtitle: "Cross-Border Trade",
    desc: "Unlocking tariff-free commerce across 54 African nations, eliminating trade bottlenecks, and establishing unified supply chain corridors.",
    badge: "Pillar 02",
  },
  {
    icon: ShoppingBag,
    title: "Promote African Value-Addition",
    subtitle: "Industrial Processing",
    desc: "Moving beyond raw commodity exports by showcasing refined manufacturing, packaged agro-goods, textiles, and technology solutions.",
    badge: "Pillar 03",
  },
  {
    icon: Handshake,
    title: "Catalyze Global Investment",
    subtitle: "Bilateral Dealmaking",
    desc: "Connecting high-growth African enterprises with sovereign wealth funds, commercial banks, impact investors, and international procurement agencies.",
    badge: "Pillar 04",
  },
];

const roadmapSteps = [
  {
    phase: "Phase 1 · Q1–Q2 2026",
    title: "Exhibitor & Sovereign Mobilization",
    desc: "Allocating 200+ stalls across light manufacturing, fintech, agro-allied, and national export boards.",
  },
  {
    phase: "Phase 2 · Q3 2026",
    title: "Buyer Matchmaking & Accreditation",
    desc: "Screening verified international procurement buyers, retail distributors, and institutional delegates.",
  },
  {
    phase: "Phase 3 · Nov 2026",
    title: "Final Floor Plans & Protocol Setup",
    desc: "Rigging inspection, bilateral deal room allocations, and customs clearance for overseas sample cargo.",
  },
  {
    phase: "Phase 4 · Dec 1–5, 2026",
    title: "The Trade Fair & Summit Execution",
    desc: "5 days of exhibitions, 30+ keynote panels, bilateral trade deals, and the GloTrade Excellence Gala.",
  },
];

const impactGoals = [
  { value: "₦500M+", label: "Target Trade Volume", detail: "In verified B2B distribution and supply contracts" },
  { value: "10,000+", label: "Trade Delegates", detail: "Importers, exporters, policy leaders, and investors" },
  { value: "20+", label: "Sovereign Nations", detail: "Represented via national pavilions & trade delegations" },
  { value: "200+", label: "Exhibitor Brands", detail: "Across manufacturing, agro, energy, and digital tech" },
];

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-amber-500 selection:text-slate-950">
      <BazaarNav />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative overflow-hidden py-20 lg:py-28 bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 border-b border-slate-800">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[400px] bg-amber-500/10 blur-[140px] rounded-full pointer-events-none" />

          <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-black uppercase tracking-widest mb-6 shadow-sm">
              <Award size={14} className="text-amber-400" /> AL ABAMA GROUP & GLOTRADE PRESENT
            </div>

            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black text-white tracking-tight leading-tight mb-6">
              GLOTRADE INTERNATIONAL <br />
              <span className="bg-gradient-to-r from-amber-400 via-amber-300 to-amber-500 bg-clip-text text-transparent">
                TRADE FAIR 2026
              </span>
            </h1>

            <p className="text-amber-300 font-extrabold text-lg sm:text-2xl max-w-4xl mx-auto uppercase tracking-wide mb-8">
              &ldquo;Connecting African MSMEs to Global Markets, Investment & Innovation&rdquo;
            </p>

            <p className="text-slate-300 text-base sm:text-lg max-w-3xl mx-auto leading-relaxed mb-10">
              West Africa&apos;s premier multi-sector trade exposition driving intra-African economic integration under the
              African Continental Free Trade Area (AfCFTA), industrial innovation, and cross-border commercial partnerships.
            </p>

            {/* Quick Details Bar */}
            <div className="inline-flex flex-wrap items-center justify-center gap-6 sm:gap-8 bg-slate-900/90 border border-amber-500/30 rounded-2xl p-4 sm:px-8 sm:py-5 shadow-2xl backdrop-blur-md">
              <div className="flex items-center gap-2.5 text-slate-200 text-sm">
                <Calendar className="text-amber-400 shrink-0" size={18} />
                <span className="font-semibold">1st – 5th December 2026</span>
              </div>
              <div className="hidden sm:block w-px h-6 bg-slate-700" />
              <div className="flex items-center gap-2.5 text-slate-200 text-sm">
                <MapPin className="text-amber-400 shrink-0" size={18} />
                <span className="font-semibold">Abuja, Federal Capital Territory, Nigeria</span>
              </div>
              <div className="hidden sm:block w-px h-6 bg-slate-700" />
              <div className="flex items-center gap-2.5 text-amber-400 text-sm font-bold">
                <Users size={18} className="shrink-0" />
                <span>10,000+ Expected Delegates</span>
              </div>
            </div>
          </div>
        </section>

        {/* Executive Summary & Mission Feature (Side-by-side with Photography) */}
        <section className="py-20 lg:py-28 bg-slate-950">
          <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
              {/* Photo Showcase */}
              <div className="lg:col-span-6 relative">
                <div className="relative rounded-3xl overflow-hidden border border-amber-500/30 shadow-2xl group bg-slate-900">
                  <div className="aspect-[4/3] w-full overflow-hidden relative">
                    <img
                      src="/images/tradefair/hall.jpg"
                      alt="GloTrade International Trade Fair 2026 - Exhibition Floor"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent" />
                  </div>
                  <div className="absolute bottom-6 left-6 right-6 p-5 rounded-2xl bg-slate-950/90 backdrop-blur-md border border-slate-800">
                    <span className="text-xs font-bold uppercase tracking-wider text-amber-400 block mb-1">
                      Pan-African Commercial Gateway
                    </span>
                    <p className="text-white text-sm font-semibold">
                      Bridging the market access gap for 44 million African MSMEs and producers.
                    </p>
                  </div>
                </div>
              </div>

              {/* Text Story */}
              <div className="lg:col-span-6 space-y-6">
                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-bold uppercase tracking-wider">
                  <ShieldCheck size={14} /> Institutional Mandate
                </div>

                <h2 className="text-3xl sm:text-4xl font-black text-white leading-tight">
                  Bridging the Global Market Gap for African Producers
                </h2>

                <div className="space-y-4 text-slate-300 text-base leading-relaxed">
                  <p>
                    <strong className="text-amber-400 font-bold">GLOTRADE Platform Limited</strong> is an African-focused
                    trade acceleration and market development institution dedicated to connecting indigenous manufacturers,
                    artisans, agro-processors, and innovators directly with verified regional and international buyers.
                  </p>
                  <p>
                    While Africa accounts for nearly 18% of global population, intra-African trade historically represents
                    less than 16% of total continental exports. With the operationalization of the{" "}
                    <strong className="text-white">African Continental Free Trade Area (AfCFTA)</strong>, GloTrade Trade Fair
                    2026 acts as a practical commercial engine to turn policy into signed distribution agreements.
                  </p>
                  <p>
                    Backed by <strong className="text-white">Al Abama Group</strong>, this 5-day event brings together
                    multilateral trade ministries, commercial banking syndicates, venture capitalists, and thousands of
                    commercial buyers under a unified exhibition and dealmaking environment.
                  </p>
                </div>

                <div className="pt-4 flex flex-wrap gap-4">
                  <Link
                    href="/trade-fair/exhibitors"
                    className="px-6 py-3.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-sm shadow-xl shadow-amber-500/20 transition-all hover:scale-105 inline-flex items-center gap-2"
                  >
                    Exhibitor Registration <ArrowRight size={16} />
                  </Link>
                  <Link
                    href="/trade-fair/programme"
                    className="px-6 py-3.5 rounded-xl bg-slate-900 border border-slate-700 hover:bg-slate-800 text-white font-bold text-sm transition-all inline-flex items-center gap-2"
                  >
                    View 5-Day Schedule
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Core Pillars Grid */}
        <section className="py-20 bg-slate-900/40 border-t border-slate-800">
          <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <span className="text-xs font-bold uppercase tracking-widest text-amber-400 bg-amber-500/10 px-4 py-1.5 rounded-full border border-amber-500/30">
                Strategic Foundation
              </span>
              <h2 className="text-3xl sm:text-4xl font-black text-white mt-4 mb-3">
                The Four Pillars of GloTrade 2026
              </h2>
              <p className="text-slate-400 max-w-2xl mx-auto text-base">
                Every exhibition pavilion, summit session, and networking reception is anchored on four strategic pillars.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {pillars.map((item, i) => (
                <div
                  key={i}
                  className="bg-slate-950 border border-slate-800 hover:border-amber-500/40 rounded-3xl p-7 flex flex-col justify-between transition-all group hover:-translate-y-1 shadow-lg"
                >
                  <div>
                    <div className="flex items-center justify-between mb-6">
                      <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 group-hover:scale-110 transition-transform">
                        <item.icon size={22} />
                      </div>
                      <span className="text-[10px] font-black uppercase tracking-widest text-amber-400 bg-amber-500/10 px-2.5 py-1 rounded-full border border-amber-500/20">
                        {item.badge}
                      </span>
                    </div>

                    <span className="text-xs font-bold text-amber-400/90 block mb-1">{item.subtitle}</span>
                    <h3 className="text-xl font-bold text-white mb-3 group-hover:text-amber-400 transition-colors">
                      {item.title}
                    </h3>
                    <p className="text-xs text-slate-400 leading-relaxed">{item.desc}</p>
                  </div>

                  <div className="pt-6 mt-6 border-t border-slate-900 flex items-center gap-2 text-xs text-slate-500">
                    <CheckCircle2 size={14} className="text-amber-400" />
                    <span>GloTrade 2026 Deliverable</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Quantitative Macroeconomic Targets */}
        <section className="py-20 bg-slate-950 border-t border-slate-800">
          <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="bg-gradient-to-r from-slate-900 via-amber-950/20 to-slate-900 border border-amber-500/30 rounded-3xl p-8 sm:p-12 relative overflow-hidden">
              <div className="text-center max-w-2xl mx-auto mb-12">
                <span className="text-xs font-bold uppercase tracking-widest text-amber-400 bg-amber-500/10 px-4 py-1.5 rounded-full border border-amber-500/30">
                  Targeted Outcomes
                </span>
                <h3 className="text-3xl font-black text-white mt-4 mb-2">
                  Expected Impact & Measurable Value
                </h3>
                <p className="text-slate-400 text-sm">
                  Concrete performance metrics targeted across the five exhibition days in Abuja.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {impactGoals.map((goal, i) => (
                  <div key={i} className="bg-slate-950/80 border border-slate-800 rounded-2xl p-6 text-center space-y-2">
                    <div className="text-3xl sm:text-4xl font-black text-amber-400">{goal.value}</div>
                    <div className="text-sm font-bold text-white">{goal.label}</div>
                    <div className="text-xs text-slate-400">{goal.detail}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Roadmap from Launch to December 2026 */}
        <section className="py-20 bg-slate-900/30 border-t border-slate-800">
          <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <span className="text-xs font-bold uppercase tracking-widest text-amber-400 bg-amber-500/10 px-4 py-1.5 rounded-full border border-amber-500/30">
                Implementation Roadmap
              </span>
              <h2 className="text-3xl sm:text-4xl font-black text-white mt-4 mb-3">
                Milestones Leading to Abuja 2026
              </h2>
              <p className="text-slate-400 max-w-xl mx-auto text-base">
                Structured execution phases ensuring seamless delegate accreditation and exhibitor success.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {roadmapSteps.map((step, i) => (
                <div key={i} className="bg-slate-950 border border-slate-800 rounded-2xl p-6 relative">
                  <div className="text-xs font-bold text-amber-400 uppercase tracking-wider mb-2">{step.phase}</div>
                  <h4 className="text-base font-bold text-white mb-2">{step.title}</h4>
                  <p className="text-xs text-slate-400 leading-relaxed">{step.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Final Conversion CTA */}
        <section className="py-20 bg-gradient-to-r from-slate-950 via-amber-950/30 to-slate-950 border-t border-amber-500/20">
          <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative">
            <div className="relative z-10">
              <div className="inline-flex items-center gap-2 mb-6 px-4 py-2 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-bold uppercase tracking-widest">
                <Sparkles size={14} /> Be Part of the Movement
              </div>

              <h2 className="text-3xl sm:text-5xl font-black text-white mb-4">
                Partner with GloTrade 2026
              </h2>

              <p className="text-slate-300 text-base sm:text-lg max-w-2xl mx-auto mb-10 leading-relaxed">
                Whether you are an SME looking for export buyers, a multinational brand seeking sponsorship prominence, or a trade envoy representing your sovereign nation — your platform is in Abuja.
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
                  Reserve Stalls <ArrowRight size={16} />
                </Link>
                <Link
                  href="/trade-fair/contact"
                  className="w-full sm:w-auto px-8 py-4 rounded-xl bg-slate-900 border border-amber-500/30 text-amber-400 hover:bg-slate-800 font-bold text-base transition-all inline-flex items-center justify-center gap-2"
                >
                  Contact Secretariat
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
