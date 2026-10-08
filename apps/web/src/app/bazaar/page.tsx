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
  Store,
  ZoomIn,
  X,
  Phone,
  Eye,
  Building2,
} from "lucide-react";
import { apiGet, apiPost } from "@/utils/api";
import { translate } from "@/utils/translate";

interface ExhibitionTier {
  id: string;
  code: string;
  name: string;
  category: "msme" | "corporate" | "sponsor";
  dailyRate: string;
  totalPrice: number;
  totalPriceDisplay: string;
  badge: string;
  badgeColor: string;
  image: string;
  imagePng: string;
  boothSize: string;
  furniture: string;
  media: string;
  features: string[];
}

const exhibitionTiers: ExhibitionTier[] = [
  {
    id: "stall-me",
    code: "ME",
    name: "Micro Enterprise (ME)",
    category: "msme",
    dailyRate: "₦30,000",
    totalPrice: 150000,
    totalPriceDisplay: "₦150,000",
    badge: "Startup & Micro Tier",
    badgeColor: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
    image: "/trade-fair/IMG_3361.webp",
    imagePng: "/trade-fair/IMG_3361.PNG",
    boothSize: "10 sqm Pavilion Booth",
    furniture: "1 Table / 1 Chair",
    media: "30-Sec Video Feature",
    features: [
      "1 Table / 1 Chair included",
      "10 sqm Pavilion Booth Space",
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
    dailyRate: "₦50,000",
    totalPrice: 250000,
    totalPriceDisplay: "₦250,000",
    badge: "Commercial Growth",
    badgeColor: "bg-blue-500/15 text-blue-400 border-blue-500/30",
    image: "/trade-fair/IMG_3358.webp",
    imagePng: "/trade-fair/IMG_3358.PNG",
    boothSize: "15 sqm Pavilion Booth",
    furniture: "1 Table / 2 Chairs",
    media: "1-Min Documentary Feature",
    features: [
      "1 Table / 2 Chairs included",
      "15 sqm Pavilion Booth Space",
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
    dailyRate: "₦75,000",
    totalPrice: 375000,
    totalPriceDisplay: "₦375,000",
    badge: "Expanded Presence",
    badgeColor: "bg-amber-600/15 text-amber-300 border-amber-600/30",
    image: "/trade-fair/IMG_3362.webp",
    imagePng: "/trade-fair/IMG_3362.PNG",
    boothSize: "20 sqm Pavilion Booth",
    furniture: "2 Tables / 2 Chairs",
    media: "2-Min Documentary Coverage",
    features: [
      "2 Tables / 2 Chairs included",
      "20 sqm Pavilion Booth Space",
      "Pavilion Lighting & Power Outlet",
      "2 minutes documentary coverage",
      "1-Day business pitch presentation",
      "Brand/Logo visibility on materials & site",
    ],
  },
  {
    id: "stall-sm",
    code: "SM",
    name: "Silver Membership (SM)",
    category: "corporate",
    dailyRate: "₦100,000",
    totalPrice: 500000,
    totalPriceDisplay: "₦500,000",
    badge: "Popular Commercial Tier",
    badgeColor: "bg-slate-300/15 text-slate-200 border-slate-300/40",
    image: "/trade-fair/IMG_3356.webp",
    imagePng: "/trade-fair/IMG_3356.PNG",
    boothSize: "30 sqm Pavilion Booth",
    furniture: "2 Tables / 4 Chairs",
    media: "3-Min Documentary Coverage",
    features: [
      "2 Tables / 4 Chairs included",
      "30 sqm Pavilion Booth Space",
      "Pavilion Lighting & Extended Power",
      "3 minutes documentary coverage",
      "Quarter-page official magazine feature",
      "2-Day business pitch presentations",
      "Brand/Logo visibility on materials & site",
    ],
  },
  {
    id: "stall-gm",
    code: "GM",
    name: "Gold Membership (GM)",
    category: "corporate",
    dailyRate: "₦150,000",
    totalPrice: 750000,
    totalPriceDisplay: "₦750,000",
    badge: "Executive Corporate",
    badgeColor: "bg-amber-400/20 text-amber-300 border-amber-400/40",
    image: "/trade-fair/IMG_3359.webp",
    imagePng: "/trade-fair/IMG_3359.PNG",
    boothSize: "50 sqm Pavilion Booth",
    furniture: "2 Tables / 4 Chairs",
    media: "5-Min Documentary Coverage",
    features: [
      "2 Tables / 4 Chairs included",
      "50 sqm Pavilion Booth Space",
      "Pavilion Lighting & Prime Power",
      "5 minutes documentary coverage",
      "Half-page official magazine feature",
      "3-Day business pitch presentation slot",
      "Product & business presentation opportunity",
    ],
  },
  {
    id: "stall-pm",
    code: "PM",
    name: "Platinum Membership (PM)",
    category: "corporate",
    dailyRate: "₦200,000",
    totalPrice: 1000000,
    totalPriceDisplay: "₦1,000,000",
    badge: "VIP Flagship Tier",
    badgeColor: "bg-purple-500/20 text-purple-300 border-purple-400/40",
    image: "/trade-fair/IMG_3357.webp",
    imagePng: "/trade-fair/IMG_3357.PNG",
    boothSize: "60 sqm VIP Pavilion Booth",
    furniture: "3 Tables / 4 Chairs",
    media: "VIP Plenary Summit Feature",
    features: [
      "3 Tables / 4 Chairs included",
      "60 sqm VIP Pavilion Booth Space",
      "Full-page official magazine feature",
      "Full 5-Day business pitch and presentation",
      "Premium Brand/Logo ad slots on all materials",
      "Exclusive product & business promotion",
    ],
  },
  {
    id: "stall-dm",
    code: "DM",
    name: "Diamond Membership (DM)",
    category: "sponsor",
    dailyRate: "Headline Sponsor",
    totalPrice: 2000000,
    totalPriceDisplay: "₦2,000,000",
    badge: "Supreme Headline Sponsor",
    badgeColor: "bg-gradient-to-r from-cyan-500/20 to-amber-500/20 text-cyan-300 border-cyan-400/50",
    image: "/trade-fair/IMG_3355.webp",
    imagePng: "/trade-fair/IMG_3355.PNG",
    boothSize: "Central Island Pavilion",
    furniture: "Executive Lounge Setup",
    media: "Live Brand Modelling & AV Display",
    features: [
      "Live Brand Modelling activation on stage",
      "Live Documentary & Audio-Visual Display",
      "Professional Audio-Visual coverage & videography",
      "Exclusive documentary feature & media blitz",
      "Full-page premium magazine feature",
      "Dedicated brand & product presentation opportunity",
      "Headline logo placement across all stages & website",
    ],
  },
];

export default function BazaarHome() {
  const [config, setConfig] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedPkg, setSelectedPkg] = useState<BookingPackage | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [previewFlyer, setPreviewFlyer] = useState<ExhibitionTier | null>(null);
  const [activeCategory, setActiveCategory] = useState<"all" | "msme" | "corporate" | "sponsor">("all");
  const [slideIndex, setSlideIndex] = useState(0);

  const filteredTiers = exhibitionTiers.filter((tier) => {
    if (activeCategory === "all") return true;
    return tier.category === activeCategory;
  });

  // Auto-cycle through all 7 tier images for the slideshow card
  useEffect(() => {
    const interval = setInterval(() => {
      setSlideIndex((prev) => (prev + 1) % exhibitionTiers.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

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
                  <Award size={14} className="text-amber-400" /> GLOTRADE PRESENT
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
                  <span>Starting from 09:00 AM till 5th Dec · Open 24/7 (No closing time)</span>
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

          {/* Official Commercial Exhibition & Membership Packages - Revenue Generation */}
          <section id="exhibitor-packages" className="py-20 bg-slate-900/60 border-t border-amber-500/20 relative">
            <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="text-center max-w-3xl mx-auto mb-12">
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gradient-to-r from-amber-500/20 via-amber-400/10 to-amber-500/20 border border-amber-500/30 text-amber-400 text-xs font-black uppercase tracking-wider mb-4 shadow-lg shadow-amber-500/10">
                  <Store size={14} className="text-amber-400" /> COMMERCIAL EXHIBITION &amp; MEMBERSHIP TIERS
                </div>
                <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight leading-tight">
                  Exhibit Your Brand &amp; Products at GloTrade 2026
                </h2>
                <p className="text-slate-300 mt-4 text-sm sm:text-base leading-relaxed">
                  Showcase your products directly to 10,000+ buyers, delegates, and international investors in Abuja. Choose from 7 official commercial tiers — from Micro Enterprise booths to Headline Diamond Sponsorship.
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
                          : "bg-slate-950 border border-slate-800 text-slate-300 hover:text-white hover:border-slate-700"
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Grid of 7 Packages */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 items-stretch">
                {filteredTiers.map((tier) => (
                  <div
                    key={tier.id}
                    className={`bg-slate-950 border-2 ${
                      tier.code === "DM"
                        ? "border-amber-400/80 shadow-2xl shadow-amber-500/20 bg-gradient-to-b from-slate-950 via-amber-950/20 to-slate-950"
                        : tier.code === "PM"
                        ? "border-purple-500/50 shadow-xl shadow-purple-500/10"
                        : "border-slate-800 hover:border-amber-500/40"
                    } rounded-3xl p-5 sm:p-6 flex flex-col justify-between transition-all hover:-translate-y-1 group relative overflow-hidden`}
                  >
                    <div>
                      {/* Flyer Thumbnail with Zoom Button */}
                      <div className="relative mb-5 rounded-2xl overflow-hidden bg-slate-900 border border-slate-800 aspect-square group/img">
                        <picture>
                          <source srcSet={tier.image} type="image/webp" />
                          <img
                            src={tier.image}
                            alt={`${tier.name} Official Flyer`}
                            className="w-full h-full object-cover transition-transform duration-500 group-hover/img:scale-105"
                            loading="lazy"
                          />
                        </picture>
                        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/30 to-transparent opacity-0 group-hover/img:opacity-100 transition-opacity flex items-end justify-between p-3">
                          <button
                            type="button"
                            onClick={() => setPreviewFlyer(tier)}
                            className="w-full py-2.5 px-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs flex items-center justify-center gap-1.5 shadow-lg transition-transform"
                          >
                            <ZoomIn size={14} /> Enlarge Official Flyer
                          </button>
                        </div>
                      </div>

                      {/* Header & Badges */}
                      <div className="flex items-center justify-between gap-2 mb-2">
                        <span className={`text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full border ${tier.badgeColor}`}>
                          {tier.badge}
                        </span>
                        <span className="text-[10px] font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-md border border-amber-500/20">
                          {tier.code}
                        </span>
                      </div>

                      <h3 className="text-xl font-black text-white group-hover:text-amber-400 transition-colors">
                        {tier.name}
                      </h3>

                      {/* Pricing Box */}
                      <div className="my-3 p-3 rounded-2xl bg-slate-900/90 border border-slate-800">
                        <div className="flex items-baseline justify-between">
                          <div>
                            <span className="text-2xl font-black text-amber-400">{tier.totalPriceDisplay}</span>
                            <span className="text-[10px] text-slate-400 block -mt-1 font-semibold">Total (5-Days)</span>
                          </div>
                          <div className="text-right">
                            <span className="text-xs font-bold text-slate-200">{tier.dailyRate}</span>
                            <span className="text-[10px] text-slate-400 block -mt-1">/ Day Rate</span>
                          </div>
                        </div>
                      </div>

                      {/* Specs pills */}
                      <div className="flex flex-wrap gap-1.5 mb-4 text-[11px] font-medium text-slate-300">
                        <span className="px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 flex items-center gap-1">
                          <Store size={12} className="text-amber-400" /> {tier.boothSize}
                        </span>
                        <span className="px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800">
                          {tier.furniture}
                        </span>
                      </div>

                      {/* Feature Checklist */}
                      <ul className="space-y-2 text-xs text-slate-300 mb-6 border-t border-slate-800/80 pt-3">
                        {tier.features.slice(0, 4).map((feat, idx) => (
                          <li key={idx} className="flex items-start gap-2">
                            <CheckCircle2 size={14} className="text-amber-400 shrink-0 mt-0.5" />
                            <span className="line-clamp-1">{feat}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Action Buttons */}
                    <div className="space-y-2 pt-2 border-t border-slate-800">
                      <button
                        type="button"
                        onClick={() =>
                          handleOpenBooking({
                            id: tier.id,
                            name: tier.name,
                            price: tier.totalPrice,
                            type: "exhibitor",
                          })
                        }
                        className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-slate-950 font-black text-xs uppercase tracking-wider shadow-lg shadow-amber-500/20 transition-all flex items-center justify-center gap-1.5"
                      >
                        <ShoppingBag size={14} /> Book Stall · {tier.totalPriceDisplay}
                      </button>
                      <button
                        type="button"
                        onClick={() => setPreviewFlyer(tier)}
                        className="w-full py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white font-bold text-xs transition-colors flex items-center justify-center gap-1"
                      >
                        <Eye size={13} /> View Flyer Artwork
                      </button>
                    </div>
                  </div>
                ))}

                {/* Auto-Slideshow Card — fills the empty 4th slot */}
                <div className="bg-slate-950 border-2 border-amber-500/40 rounded-3xl overflow-hidden flex flex-col justify-between relative shadow-xl group">
                  {/* Cycling image */}
                  <div className="relative flex-1 min-h-[260px] overflow-hidden">
                    {exhibitionTiers.map((tier, idx) => (
                      <div
                        key={tier.id}
                        className={`absolute inset-0 transition-opacity duration-700 ${
                          idx === slideIndex ? "opacity-100" : "opacity-0"
                        }`}
                      >
                        <picture>
                          <source srcSet={tier.image} type="image/webp" />
                          <img
                            src={tier.image}
                            alt={tier.name}
                            className="w-full h-full object-cover"
                            loading="lazy"
                          />
                        </picture>
                        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/60 to-transparent" />
                      </div>
                    ))}

                    {/* Slide indicator dots */}
                    <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5 z-10">
                      {exhibitionTiers.map((_, idx) => (
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
                        {exhibitionTiers[slideIndex]?.code} · {exhibitionTiers[slideIndex]?.totalPriceDisplay}
                      </span>
                    </div>
                  </div>

                  {/* Bottom CTA */}
                  <div className="p-5 bg-slate-950 border-t border-amber-500/20">
                    <p className="text-xs font-bold text-amber-400 uppercase tracking-wider mb-1">
                      All 7 Membership Tiers
                    </p>
                    <p className="text-white text-sm font-black leading-snug mb-4">
                      {exhibitionTiers[slideIndex]?.name}
                    </p>
                    <div className="space-y-2">
                      <button
                        type="button"
                        onClick={() =>
                          handleOpenBooking({
                            id: exhibitionTiers[slideIndex]?.id,
                            name: exhibitionTiers[slideIndex]?.name,
                            price: exhibitionTiers[slideIndex]?.totalPrice,
                            type: "exhibitor",
                          })
                        }
                        className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-slate-950 font-black text-xs uppercase tracking-wider shadow-lg shadow-amber-500/20 transition-all flex items-center justify-center gap-1.5"
                      >
                        <ShoppingBag size={13} /> Book Now · {exhibitionTiers[slideIndex]?.totalPriceDisplay}
                      </button>
                      <button
                        type="button"
                        onClick={() => setPreviewFlyer(exhibitionTiers[slideIndex] ?? null)}
                        className="w-full py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white font-bold text-xs transition-colors flex items-center justify-center gap-1"
                      >
                        <Eye size={13} /> View Flyer
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Bottom Support Callout */}
              <div className="mt-12 p-6 rounded-3xl bg-slate-950 border border-amber-500/30 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center shrink-0">
                    <Phone size={22} />
                  </div>
                  <div>
                    <h4 className="text-base font-extrabold text-white">Need a Custom Exhibition or Island Pavilion?</h4>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Talk directly with our commercial booth coordinator on WhatsApp or call for customized dimensions and corporate MoUs.
                    </p>
                  </div>
                </div>
                <a
                  href="https://wa.me/2347044600924?text=Hello%20GloTrade,%20I%20am%20interested%20in%20an%20exhibition%20stall%20package."
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-6 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs uppercase tracking-wider shrink-0 transition-all shadow-lg shadow-emerald-500/20 flex items-center gap-2"
                >
                  <Phone size={14} /> Chat on WhatsApp (+234 704 460 0924)
                </a>
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

              <div className="max-w-2xl mx-auto">
                {/* Single Free All-Access Visitor Pass Card */}
                <div className="bg-slate-950 border-2 border-emerald-500 hover:border-emerald-400 rounded-3xl p-8 sm:p-10 flex flex-col justify-between relative shadow-2xl shadow-emerald-500/20 transition-all hover:-translate-y-1">
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-gradient-to-r from-emerald-500 via-teal-400 to-amber-400 text-slate-950 text-xs font-black px-6 py-1.5 rounded-full uppercase tracking-wider shadow-lg">
                    Official Trade Fair Gate Pass
                  </div>
                  <div>
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-slate-800 pb-6 mb-6">
                      <div>
                        <span className="text-xs font-bold text-emerald-400 uppercase tracking-widest block mb-1">
                          Full 5 Days · 1st – 5th Dec 2026 · 24/7 Non-Stop Access
                        </span>
                        <h3 className="text-2xl sm:text-3xl font-extrabold text-white">Free All-Access Visitor Pass</h3>
                      </div>
                      <div className="mt-2 sm:mt-0">
                        <span className="text-4xl sm:text-5xl font-black text-emerald-400">FREE</span>
                        <span className="text-xs text-slate-400 ml-2 block sm:inline">/ ₦0 Gate Fee</span>
                      </div>
                    </div>
                    <p className="text-slate-300 text-sm sm:text-base leading-relaxed mb-6">
                      Enjoy unrestricted complimentary entry throughout the entire 5 days of the trade fair (starting 09:00 AM Dec 1st straight through to Dec 5th, with zero closing hours).
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 mb-8 text-sm text-slate-200">
                      <div className="flex items-center gap-2.5">
                        <CheckCircle2 size={18} className="text-emerald-400 shrink-0" />
                        <span>100% Free Gate Admission</span>
                      </div>
                      <div className="flex items-center gap-2.5">
                        <CheckCircle2 size={18} className="text-emerald-400 shrink-0" />
                        <span>Full 5 Days Non-Stop 24/7 Entry</span>
                      </div>
                      <div className="flex items-center gap-2.5">
                        <CheckCircle2 size={18} className="text-emerald-400 shrink-0" />
                        <span>Instant digital QR Code Pass to email</span>
                      </div>
                      <div className="flex items-center gap-2.5">
                        <CheckCircle2 size={18} className="text-emerald-400 shrink-0" />
                        <span>Access to all Exhibition Pavilions & Halls</span>
                      </div>
                      <div className="flex items-center gap-2.5">
                        <CheckCircle2 size={18} className="text-emerald-400 shrink-0" />
                        <span>Dedicated Fast-Track Scanner Lanes</span>
                      </div>
                      <div className="flex items-center gap-2.5">
                        <CheckCircle2 size={18} className="text-emerald-400 shrink-0" />
                        <span>Open B2B Matchmaking & Cultural Stages</span>
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() =>
                      handleOpenBooking({
                        id: "free-all-access",
                        name: "Free All-Access Visitor Pass",
                        price: 0,
                        type: "ticket",
                      })
                    }
                    className="w-full py-4 rounded-xl bg-gradient-to-r from-emerald-400 via-teal-400 to-amber-400 hover:from-emerald-300 hover:to-amber-300 text-slate-950 font-black text-base shadow-xl shadow-emerald-500/25 transition-all flex items-center justify-center gap-2"
                  >
                    <Ticket size={20} className="text-slate-950" />
                    Get Free All-Access Pass (Instant QR Code)
                  </button>
                </div>
              </div>

              <div className="mt-12 text-center">
                <Link
                  href="/trade-fair/tickets"
                  className="inline-flex items-center gap-2 text-amber-400 hover:text-amber-300 font-bold text-sm underline"
                >
                  View Gate Check-in Details & FAQs <ArrowRight size={16} />
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

      {/* Flyer Preview Lightbox Modal */}
      {previewFlyer && (
        <div className="fixed inset-0 z-50 bg-slate-950/95 backdrop-blur-md flex items-center justify-center p-4 sm:p-6 animate-fadeIn">
          <div className="relative bg-slate-900 border border-amber-500/40 rounded-3xl max-w-2xl w-full p-4 sm:p-6 shadow-2xl flex flex-col max-h-[95vh] overflow-hidden">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2 pr-2 min-w-0">
                <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full border ${previewFlyer.badgeColor}`}>
                  {previewFlyer.code}
                </span>
                <h3 className="text-base sm:text-lg font-black text-white truncate">
                  {previewFlyer.name} · Official Flyer
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setPreviewFlyer(null)}
                className="w-9 h-9 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white flex items-center justify-center transition-colors shrink-0"
              >
                <X size={18} />
              </button>
            </div>

            <div className="my-4 flex-1 overflow-auto flex items-center justify-center rounded-2xl bg-slate-950 p-2 border border-slate-800">
              <picture>
                <source srcSet={previewFlyer.image} type="image/webp" />
                <img
                  src={previewFlyer.image}
                  alt={previewFlyer.name}
                  className="max-h-[65vh] w-auto object-contain rounded-xl shadow-2xl"
                />
              </picture>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2 border-t border-slate-800">
              <div className="text-left w-full sm:w-auto">
                <span className="text-xs font-bold text-amber-400 block">{previewFlyer.totalPriceDisplay} (5 Days)</span>
                <span className="text-[11px] text-slate-400 block">{previewFlyer.dailyRate} / Day Rate</span>
              </div>
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <a
                  href={previewFlyer.image}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 sm:flex-initial px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold text-center transition-colors"
                >
                  Full Size
                </a>
                <button
                  type="button"
                  onClick={() => {
                    const p = previewFlyer;
                    setPreviewFlyer(null);
                    handleOpenBooking({
                      id: p.id,
                      name: p.name,
                      price: p.totalPrice,
                      type: "exhibitor",
                    });
                  }}
                  className="flex-1 sm:flex-initial px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-black uppercase tracking-wider text-center shadow-lg shadow-amber-500/20 transition-all"
                >
                  Book Stall ({previewFlyer.totalPriceDisplay})
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <BazaarFooter />
    </div>
  );
}
