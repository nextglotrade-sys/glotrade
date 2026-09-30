"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import BazaarNav from "@/components/bazaar/BazaarNav";
import BazaarFooter from "@/components/bazaar/BazaarFooter";
import BookingModal, { BookingPackage } from "@/components/bazaar/BookingModal";
import {
  Ticket,
  Calendar,
  MapPin,
  Clock,
  Sparkles,
  ShoppingBag,
  Award,
  Users,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Mail,
  Send,
  Loader2,
} from "lucide-react";
import { apiGet, apiPost } from "@/utils/api";
import { translate } from "@/utils/translate";

export default function BazaarHome() {
  const [config, setConfig] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedPkg, setSelectedPkg] = useState<BookingPackage | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  // Inactive portal waitlist form states
  const [waitlistName, setWaitlistName] = useState("");
  const [waitlistEmail, setWaitlistEmail] = useState("");
  const [waitlistMsg, setWaitlistMsg] = useState("");
  const [waitlistSuccess, setWaitlistSuccess] = useState(false);
  const [waitlistLoading, setWaitlistLoading] = useState(false);

  useEffect(() => {
    async function loadConfig() {
      try {
        const res: any = await apiGet("/api/v1/bazaar/config");
        if (res?.data) {
          setConfig(res.data);
        }
      } catch (err) {
        console.error("Error loading bazaar config:", err);
      } finally {
        setLoading(false);
      }
    }
    loadConfig();
  }, []);

  const handleOpenBooking = (pkg: BookingPackage) => {
    setSelectedPkg(pkg);
    setModalOpen(true);
  };

  const handleWaitlistSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setWaitlistLoading(true);
    try {
      await apiPost("/api/v1/bazaar/contact", {
        name: waitlistName,
        email: waitlistEmail,
        subject: "Off-Season Waitlist Enquiry",
        message: waitlistMsg || "Enquiring about GloTrade International Trade Fair 2026.",
      });
      setWaitlistSuccess(true);
    } catch (err) {
      console.error(err);
    } finally {
      setWaitlistLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-white">
        <div className="text-center">
          <Loader2 className="animate-spin text-amber-500 mx-auto mb-3" size={32} />
          <p className="text-sm text-slate-400">Loading Trade Fair Portal...</p>
        </div>
      </div>
    );
  }

  const isPortalActive = config?.isPortalActive ?? true;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-amber-500 selection:text-slate-950">
      <BazaarNav
        eventTitle={config?.eventTitle}
        eventDateLabel={config?.eventDateLabel}
        isPortalActive={isPortalActive}
      />

      {/* Check Seasonal Portal Status */}
      {!isPortalActive ? (
        /* INACTIVE / SEASONAL OFF-SEASON PAGE */
        <main className="flex-1 max-w-4xl mx-auto px-4 py-20 text-center">
          <div className="bg-slate-900 border border-amber-500/30 rounded-3xl p-8 sm:p-12 shadow-2xl relative overflow-hidden">
            <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center mx-auto mb-6">
              <Calendar size={32} />
            </div>

            <span className="inline-block px-3 py-1 rounded-full bg-amber-500/20 text-amber-400 text-xs font-bold uppercase tracking-wider mb-4 border border-amber-500/30">
              {translate("bazaar.portalOffline") || "Season Status: Off-Season"}
            </span>

            <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight mb-4">
              {config?.eventTitle || translate("bazaar.title") || "GloTrade International Trade Fair 2026"}
            </h1>

            <p className="text-slate-300 text-base sm:text-lg max-w-2xl mx-auto leading-relaxed mb-8">
              {config?.inactiveMessage ||
                translate("bazaar.portalOfflineDesc") || "The GloTrade International Trade Fair 2026 portal is currently offline. Stay tuned for our upcoming announcements!"}
            </p>

            <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-6 max-w-lg mx-auto mb-8 text-left">
              <h3 className="text-amber-400 font-bold text-sm mb-3 flex items-center gap-2">
                <Mail size={16} /> {translate("bazaar.getNotified") || "Get Notified for the Next Edition"}
              </h3>

              {waitlistSuccess ? (
                <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 rounded-xl text-sm text-center">
                  <CheckCircle2 size={24} className="mx-auto mb-1 text-emerald-400" />
                  {translate("bazaar.messageSentSuccess") || "Thank you! We have logged your enquiry. We will reach out when the next season opens."}
                </div>
              ) : (
                <form onSubmit={handleWaitlistSubmit} className="space-y-3">
                  <input
                    type="text"
                    required
                    placeholder={translate("auth.fullName") || "Your Full Name"}
                    value={waitlistName}
                    onChange={(e) => setWaitlistName(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-amber-500"
                  />
                  <input
                    type="email"
                    required
                    placeholder={translate("auth.email") || "Your Email Address"}
                    value={waitlistEmail}
                    onChange={(e) => setWaitlistEmail(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-amber-500"
                  />
                  <textarea
                    rows={2}
                    placeholder="Optional message / enquiry..."
                    value={waitlistMsg}
                    onChange={(e) => setWaitlistMsg(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-amber-500"
                  />
                  <button
                    type="submit"
                    disabled={waitlistLoading}
                    className="w-full py-3 rounded-xl bg-amber-500 text-slate-950 font-bold text-sm hover:bg-amber-400 transition-colors flex items-center justify-center gap-2"
                  >
                    {waitlistLoading ? (
                      <Loader2 className="animate-spin" size={16} />
                    ) : (
                      <>
                        <Send size={16} /> {translate("bazaar.submitEnquiry") || "Submit Enquiry / Join Notification List"}
                      </>
                    )}
                  </button>
                </form>
              )}
            </div>

            <div className="pt-4 border-t border-slate-800">
              <Link
                href="/"
                className="inline-flex items-center gap-2 text-slate-400 hover:text-white text-sm font-semibold transition-colors"
              >
                {translate("bazaar.returnToMarketplace") || "Return to GloTrade E-Commerce Marketplace"} <ArrowRight size={16} />
              </Link>
            </div>
          </div>
        </main>
      ) : (
        /* ACTIVE PORTAL CONTENT */
        <main className="flex-1">
          {/* Hero Section */}
          <section className="relative overflow-hidden pt-12 pb-24 lg:pt-20 lg:pb-32 bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-amber-500/10 blur-[120px] rounded-full pointer-events-none" />

            <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
              {/* Presenter Banner */}
              <div className="mb-6 space-y-2">
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-extrabold uppercase tracking-widest shadow-lg shadow-amber-500/5">
                  <Award size={14} className="text-amber-400" /> AL ABAMA GROUP & GLOTRADE PRESENT
                </div>
                <h2 className="text-sm sm:text-base font-extrabold text-amber-300 tracking-wide max-w-3xl mx-auto uppercase">
                  GLOTRADE INTERNATIONAL TRADE FAIR 2026: Connecting African MSMEs to Global Markets, Investment & Innovation
                </h2>
              </div>

              <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight text-white max-w-4xl mx-auto leading-tight mb-6">
                {translate("bazaar.heroTitle") || "Connect. Trade. Discover. Celebrate."}
              </h1>

              <p className="text-slate-300 text-lg sm:text-xl max-w-2xl mx-auto mb-10 leading-relaxed">
                {translate("bazaar.heroDesc") || "Join thousands of business leaders, international buyers, exhibitors, and delegates in Abuja, Nigeria for 5 transformative days of cross-border trade, deal-making, and exhibitions."}
              </p>

              {/* Event Badge Pill */}
              <div className="inline-flex flex-wrap items-center justify-center gap-4 bg-slate-900/90 border border-amber-500/30 rounded-2xl p-4 sm:px-8 mb-10 shadow-2xl">
                <div className="flex items-center gap-2 text-sm text-slate-200">
                  <Calendar className="text-amber-400" size={18} />
                  <span>{config?.eventDateLabel || translate("bazaar.eventDate") || "1st – 5th December 2026"}</span>
                </div>
                <div className="hidden sm:block w-px h-6 bg-slate-800" />
                <div className="flex items-center gap-2 text-sm text-slate-200">
                  <Clock className="text-amber-400" size={18} />
                  <span>Daily 9:00 AM - 6:00 PM</span>
                </div>
                <div className="hidden sm:block w-px h-6 bg-slate-800" />
                <div className="flex items-center gap-2 text-sm text-slate-200">
                  <MapPin className="text-amber-400" size={18} />
                  <span>{config?.eventVenue || translate("bazaar.eventVenue") || "Nigerian Army Conference Centre & Suites (NACCAS), Km 10 Expressway, Asokoro, Abuja"}</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link
                  href="/trade-fair/tickets"
                  className="w-full sm:w-auto px-8 py-4 rounded-xl bg-gradient-to-r from-emerald-400 via-amber-400 to-amber-500 hover:from-emerald-300 hover:to-amber-400 text-slate-950 font-black text-base shadow-xl shadow-amber-500/20 transition-all hover:scale-105 flex items-center justify-center gap-2"
                >
                  <Ticket size={20} className="text-slate-950" />
                  {translate("bazaar.buyTickets") || "Register for Fast-Track Entry"}
                </Link>
                <Link
                  href="/trade-fair/exhibitors"
                  className="w-full sm:w-auto px-8 py-4 rounded-xl bg-slate-900 border border-amber-500/40 hover:bg-slate-800 text-white font-bold text-base transition-all hover:scale-105"
                >
                  {translate("bazaar.bookStall") || "Apply for Exhibition Stall"}
                </Link>
              </div>
            </div>
          </section>

          {/* About GLOTRADE & Our Vision Section */}
          <section className="py-20 bg-slate-950 relative border-t border-slate-800">
            <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-stretch">
                {/* About GLOTRADE */}
                <div className="lg:col-span-7 bg-slate-900/90 border border-slate-800 rounded-3xl p-8 sm:p-10 shadow-2xl flex flex-col justify-between">
                  <div>
                    <span className="text-xs font-extrabold uppercase tracking-widest text-amber-400 bg-amber-500/10 px-3 py-1 rounded-full border border-amber-500/30">
                      About GLOTRADE
                    </span>
                    <h2 className="text-3xl sm:text-4xl font-black text-white mt-4 mb-6 leading-tight">
                      Bridging Global Market Gap for African MSMEs
                    </h2>
                    <div className="space-y-4 text-slate-300 text-sm sm:text-base leading-relaxed">
                      <p>
                        <strong className="text-amber-400 font-bold">GLOTRADE Platform Limited</strong> is an African-focused trade and market development platform committed to bridging the gap between African producers, entrepreneurs, MSMEs, suppliers, buyers, and international markets.
                      </p>
                      <p>
                        Under the vision of <span className="text-amber-300 font-semibold">“Bridging Global Market Gap for African MSMEs,”</span> Glotrade provides opportunities for businesses to showcase their products, establish commercial relationships, access new markets, and participate in local and international trade opportunities.
                      </p>
                      <p>
                        <strong className="text-white font-bold">GLOTRADE INTERNATIONAL TRADE FAIR 2026</strong> is designed as the flagship multi-sector platform for promoting entrepreneurship, AfCFTA trade integration, industrial innovation, investment, and economic inclusion across Africa.
                      </p>
                    </div>
                  </div>
                  <div className="mt-8 pt-6 border-t border-slate-800 flex items-center justify-between text-xs text-amber-400 font-bold">
                    <span>GLOTRADE Platform Limited</span>
                    <span>Abuja • 1st – 5th December 2026</span>
                  </div>
                </div>

                {/* Our Vision Card */}
                <div className="lg:col-span-5 bg-gradient-to-br from-slate-900 via-amber-950/30 to-slate-950 border-2 border-amber-500/40 rounded-3xl p-8 sm:p-10 shadow-2xl flex flex-col justify-between relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />
                  <div>
                    <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-500/40 text-amber-400 flex items-center justify-center mb-6 shadow-lg shadow-amber-500/10">
                      <Sparkles size={26} />
                    </div>
                    <span className="text-xs font-extrabold uppercase tracking-widest text-amber-400 bg-amber-500/10 px-3 py-1 rounded-full border border-amber-500/30">
                      Our Vision
                    </span>
                    <h3 className="text-2xl sm:text-3xl font-black text-white mt-4 mb-4">
                      Inclusive African Marketplace
                    </h3>
                    <p className="text-slate-200 text-base sm:text-lg leading-relaxed font-medium">
                      To build an inclusive African marketplace where women, youth, MSMEs, producers, and entrepreneurs can connect with opportunities beyond their immediate markets and participate meaningfully in regional and global trade.
                    </p>
                  </div>

                  <div className="mt-8 p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-bold flex items-center gap-3">
                    <ShieldCheck size={20} className="shrink-0 text-amber-400" />
                    <span>Connecting African MSMEs to Global Markets, Investment & Innovation</span>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Our Message & 4 Core Pillars Grid */}
          <section className="py-20 bg-slate-900/40 border-t border-slate-800">
            <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
              <span className="text-xs font-extrabold uppercase tracking-widest text-amber-400 bg-amber-500/10 px-4 py-1.5 rounded-full border border-amber-500/30">
                Our Message
              </span>
              <h2 className="text-3xl sm:text-5xl font-black text-white mt-4 mb-4">
                Core Pillars of GloTrade Trade Fair
              </h2>
              <p className="text-slate-400 text-base max-w-2xl mx-auto mb-16">
                GLOTRADE INTERNATIONAL TRADE FAIR 2026: “Connecting African MSMEs to Global Markets, Investment & Innovation.”
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 text-left">
                {/* Pillar 1 */}
                <div className="bg-slate-950 border border-slate-800 hover:border-amber-500/50 rounded-2xl p-8 transition-all hover:-translate-y-1 group">
                  <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                    <Users size={24} />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2">Empower the Entrepreneur</h3>
                  <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                    Fostering economic inclusion, capacity building, and business support for women-owned and youth-led enterprises across Africa.
                  </p>
                </div>

                {/* Pillar 2 */}
                <div className="bg-slate-950 border border-slate-800 hover:border-amber-500/50 rounded-2xl p-8 transition-all hover:-translate-y-1 group">
                  <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                    <ShoppingBag size={24} />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2">Connect the Market</h3>
                  <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                    Bridging African MSMEs, suppliers, buyers, and corporate partners to build high-value commercial relationships.
                  </p>
                </div>

                {/* Pillar 3 */}
                <div className="bg-slate-950 border border-slate-800 hover:border-amber-500/50 rounded-2xl p-8 transition-all hover:-translate-y-1 group">
                  <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                    <Award size={24} />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2">Promote African Products</h3>
                  <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                    Showcasing high-quality, authentic African commodities, innovation, and manufactured goods to a diverse audience.
                  </p>
                </div>

                {/* Pillar 4 */}
                <div className="bg-slate-950 border border-slate-800 hover:border-amber-500/50 rounded-2xl p-8 transition-all hover:-translate-y-1 group">
                  <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                    <Sparkles size={24} />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2">Create Global Opportunities</h3>
                  <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                    Unlocking cross-border trade, regional investment, and international market access for African producers.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Quick Package Highlights - 100% Free Entry */}
          <section className="py-20 bg-slate-900/60 border-y border-amber-500/10">
            <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="text-center mb-16">
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-black uppercase tracking-wider mb-4 shadow-lg shadow-emerald-500/5">
                  <Sparkles size={14} className="text-emerald-400" /> 100% FREE ENTRY · WALK-IN WELCOME · REGISTRATION OPTIONAL
                </div>
                <h2 className="text-3xl sm:text-4xl font-extrabold text-white">
                  {translate("bazaar.ticketsHeading") || "Walk-In Free · Or Get Your Fast-Track QR Pass"}
                </h2>
                <p className="text-slate-400 mt-2 max-w-2xl mx-auto text-sm sm:text-base">
                  {translate("bazaar.ticketsSubtitle") || "Gate admission is 100% free for all visitors — no booking required. Register online in 30 seconds to receive a personal digital QR Code for the dedicated fast-track gate scanner lane and your event programme by email."}
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {/* Free Public Day Pass */}
                <div className="bg-slate-950 border border-slate-800 hover:border-emerald-500/40 rounded-2xl p-8 flex flex-col justify-between transition-all hover:-translate-y-1">
                  <div>
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                      {translate("bazaar.singleGuest") || "General Entry"}
                    </span>
                    <h3 className="text-2xl font-bold text-white mt-1">{translate("bazaar.standardTicket") || "Free Public Day Pass"}</h3>
                    <div className="mt-4 mb-6">
                      <span className="text-4xl font-black text-emerald-400">FREE</span>
                      <span className="text-xs text-slate-400 ml-2">/ ₦0 gate fee</span>
                    </div>
                    <ul className="space-y-3 text-sm text-slate-300 mb-8">
                      <li className="flex items-center gap-2">
                        <CheckCircle2 size={16} className="text-emerald-400 shrink-0" />
                        100% Free General Gate Admission
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle2 size={16} className="text-emerald-400 shrink-0" />
                        Access to all main exhibition pavilions
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle2 size={16} className="text-emerald-400 shrink-0" />
                        Live music, cultural & stage events
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle2 size={16} className="text-emerald-400 shrink-0" />
                        Instant QR code sent to email
                      </li>
                    </ul>
                  </div>
                  <button
                    onClick={() =>
                      handleOpenBooking({
                        id: "free-general",
                        name: translate("bazaar.standardTicket") || "Free Public Day Pass",
                        price: 0,
                        type: "ticket",
                      })
                    }
                    className="w-full py-3 rounded-xl bg-slate-900 border border-slate-700 hover:border-emerald-400 hover:bg-emerald-500 hover:text-slate-950 text-white font-bold text-sm transition-all"
                  >
                    {translate("bazaar.bookStandardCta") || "Get Fast-Track Day Pass"}
                  </button>
                </div>

                {/* Free 5-Day Visitor Pass */}
                <div className="bg-slate-950 border-2 border-emerald-500 hover:border-emerald-400 rounded-2xl p-8 flex flex-col justify-between relative shadow-xl shadow-emerald-500/15 transition-all hover:-translate-y-1">
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-gradient-to-r from-emerald-500 to-teal-400 text-slate-950 text-xs font-black px-4 py-1 rounded-full uppercase tracking-wider">
                    {translate("bazaar.popularChoice") || "Most Popular"}
                  </div>
                  <div>
                    <span className="text-xs font-bold text-emerald-400 uppercase tracking-widest">
                      Full 5 Days · Dec 1–5
                    </span>
                    <h3 className="text-2xl font-bold text-white mt-1">{translate("bazaar.vipPass") || "Free 5-Day Visitor Pass"}</h3>
                    <div className="mt-4 mb-6">
                      <span className="text-4xl font-black text-emerald-400">FREE</span>
                      <span className="text-xs text-slate-400 ml-2">/ ₦0 all 5 days</span>
                    </div>
                    <ul className="space-y-3 text-sm text-slate-300 mb-8">
                      <li className="flex items-center gap-2">
                        <CheckCircle2 size={16} className="text-emerald-400 shrink-0" />
                        Full 5 days unrestricted entry
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle2 size={16} className="text-emerald-400 shrink-0" />
                        Instant digital QR Code Pass
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle2 size={16} className="text-emerald-400 shrink-0" />
                        Access to Halls A, B & C pavilions
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle2 size={16} className="text-emerald-400 shrink-0" />
                        Digital event schedule & expo guide
                      </li>
                    </ul>
                  </div>
                  <button
                    onClick={() =>
                      handleOpenBooking({
                        id: "free-all-access",
                        name: translate("bazaar.vipPass") || "Free 5-Day Visitor Pass",
                        price: 0,
                        type: "ticket",
                      })
                    }
                    className="w-full py-3.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-sm shadow-lg shadow-emerald-500/25 transition-all"
                  >
                    {translate("bazaar.bookVipCta") || "Get Free 5-Day Pass"}
                  </button>
                </div>

                {/* Trade Buyer & B2B Pass */}
                <div className="bg-slate-950 border border-blue-500/40 hover:border-blue-400 rounded-2xl p-8 flex flex-col justify-between transition-all hover:-translate-y-1">
                  <div>
                    <span className="text-xs font-bold text-blue-400 uppercase tracking-widest">
                      Commercial / B2B
                    </span>
                    <h3 className="text-2xl font-bold text-white mt-1">{translate("bazaar.vvipPass") || "Trade Buyer & B2B Pass"}</h3>
                    <div className="mt-4 mb-6">
                      <span className="text-4xl font-black text-blue-400">FREE</span>
                      <span className="text-xs text-slate-400 ml-2">/ complimentary B2B</span>
                    </div>
                    <ul className="space-y-3 text-sm text-slate-300 mb-8">
                      <li className="flex items-center gap-2">
                        <CheckCircle2 size={16} className="text-blue-400 shrink-0" />
                        Free Verified Trade Buyer Badge
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle2 size={16} className="text-blue-400 shrink-0" />
                        Commercial supplier matchmaking zone
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle2 size={16} className="text-blue-400 shrink-0" />
                        B2B deal-making directories & contacts
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle2 size={16} className="text-blue-400 shrink-0" />
                        Fast-track priority gate scan
                      </li>
                    </ul>
                  </div>
                  <button
                    onClick={() =>
                      handleOpenBooking({
                        id: "free-trade-buyer",
                        name: translate("bazaar.vvipPass") || "Trade Buyer & B2B Pass",
                        price: 0,
                        type: "ticket",
                      })
                    }
                    className="w-full py-3.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm shadow-lg shadow-blue-500/20 transition-all"
                  >
                    {translate("bazaar.bookVvipCta") || "Get Trade Buyer Pass"}
                  </button>
                </div>

                {/* VIP Executive Accreditation */}
                <div className="bg-slate-950 border border-amber-500/40 hover:border-amber-400 rounded-2xl p-8 flex flex-col justify-between transition-all hover:-translate-y-1">
                  <div>
                    <span className="text-xs font-bold text-amber-400 uppercase tracking-widest">
                      VIP / Corporate
                    </span>
                    <h3 className="text-2xl font-bold text-white mt-1">{translate("bazaar.tableOf4") || "VIP Executive Accreditation"}</h3>
                    <div className="mt-4 mb-6">
                      <span className="text-4xl font-black text-amber-400">FREE</span>
                      <span className="text-xs text-slate-400 ml-2">/ complimentary VIP</span>
                    </div>
                    <ul className="space-y-3 text-sm text-slate-300 mb-8">
                      <li className="flex items-center gap-2">
                        <CheckCircle2 size={16} className="text-amber-400 shrink-0" />
                        VIP Executive digital accreditation
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle2 size={16} className="text-amber-400 shrink-0" />
                        Access to VIP business lounge
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle2 size={16} className="text-amber-400 shrink-0" />
                        Reserved keynote forum seating
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle2 size={16} className="text-amber-400 shrink-0" />
                        Fast-track VIP protocol entry
                      </li>
                    </ul>
                  </div>
                  <button
                    onClick={() =>
                      handleOpenBooking({
                        id: "free-vip",
                        name: translate("bazaar.tableOf4") || "VIP Executive Accreditation",
                        price: 0,
                        type: "ticket",
                      })
                    }
                    className="w-full py-3 rounded-xl bg-slate-900 border border-amber-500/30 hover:bg-amber-500 hover:text-slate-950 text-white font-bold text-sm transition-all"
                  >
                    {translate("bazaar.bookTableCta") || "Get VIP Accreditation"}
                  </button>
                </div>
              </div>

              <div className="mt-12 text-center">
                <Link
                  href="/trade-fair/tickets"
                  className="inline-flex items-center gap-2 text-amber-400 hover:text-amber-300 font-bold text-sm underline"
                >
                  View All Free Passes & Gate Check-in Details <ArrowRight size={16} />
                </Link>
              </div>
            </div>
          </section>

          {/* Exhibitor Banner */}
          <section className="py-20 max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="bg-gradient-to-r from-slate-900 via-amber-950/40 to-slate-900 border border-amber-500/30 rounded-3xl p-8 sm:p-12 flex flex-col lg:flex-row items-center justify-between gap-8 shadow-2xl">
              <div className="space-y-4 max-w-2xl text-center lg:text-left">
                <span className="text-xs font-bold uppercase tracking-wider text-amber-400 bg-amber-500/10 px-3 py-1 rounded-full border border-amber-500/30">
                  {translate("bazaar.navExhibitors") || "Exhibitors & Vendors"}
                </span>
                <h2 className="text-3xl sm:text-4xl font-extrabold text-white">
                  {translate("bazaar.exhibitorHeading") || "Showcase Your Brand at GloTrade International Trade Fair 2026"}
                </h2>
                <p className="text-slate-300 text-base leading-relaxed">
                  {translate("bazaar.exhibitorSubtitle") || "Book an exhibition booth or corporate membership tier (from Micro Enterprise at ₦30,000/day up to Platinum Membership) to showcase your enterprise directly to 10,000+ verified trade buyers and delegates."}
                </p>
              </div>
              <div className="shrink-0 flex flex-col sm:flex-row gap-4 w-full lg:w-auto">
                <Link
                  href="/trade-fair/exhibitors"
                  className="px-8 py-4 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-base text-center shadow-lg shadow-amber-500/20 transition-all hover:scale-105"
                >
                  {translate("bazaar.bookStallCta") || "View Stall Packages"}
                </Link>
              </div>
            </div>
          </section>
        </main>
      )}

      {/* Booking Checkout Modal */}
      <BookingModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        pkg={selectedPkg}
        config={config}
      />

      <BazaarFooter />
    </div>
  );
}
