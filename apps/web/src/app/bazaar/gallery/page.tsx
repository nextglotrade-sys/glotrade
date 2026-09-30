"use client";

import { useState } from "react";
import BazaarNav from "@/components/bazaar/BazaarNav";
import BazaarFooter from "@/components/bazaar/BazaarFooter";
import Link from "next/link";
import {
  Camera,
  Sparkles,
  Users,
  ShoppingBag,
  Music,
  Award,
  Globe,
  Mic,
  UtensilsCrossed,
  Handshake,
  Star,
  ArrowRight,
  Play,
  Image as ImageIcon,
  Zap,
  TrendingUp,
  X,
  Download,
  Share2,
  CheckCircle2,
  Building2,
  Tv,
  Calendar,
  Layers,
  Maximize2,
} from "lucide-react";
import { translate } from "@/utils/translate";

interface GalleryStory {
  id: string;
  image: string;
  title: string;
  tag: string;
  category: "trade" | "b2b" | "keynote" | "pavilion" | "venue";
  subtitle: string;
  description: string;
  stats: string;
  statLabel: string;
}

const featuredStories: GalleryStory[] = [
  {
    id: "story-hall",
    image: "/images/tradefair/hall.jpg",
    title: "Multi-Hall Exhibition Floor & Brand Pavilions",
    tag: "Exhibition Pavilions",
    category: "trade",
    subtitle: "200+ Exhibitor Stalls across 45,000 m² of Exhibition Floors",
    description: "Vast climate-controlled halls showcasing light manufacturing, tech innovations, FMCG, and intra-African supply chains with international buyers.",
    stats: "200+ Stalls",
    statLabel: "Brand Showcases",
  },
  {
    id: "story-networking",
    image: "/images/tradefair/networking.jpg",
    title: "Executive B2B Matchmaking & Diplomatic Deal Rooms",
    tag: "High-Level Dealmaking",
    category: "b2b",
    subtitle: "Connecting 500+ C-Suite Executives, Investors & Trade Envoys",
    description: "Private executive lounges facilitating high-value bilateral agreements, investment syndications, and sovereign supply agreements.",
    stats: "₦500M+",
    statLabel: "Projected Trade Deals",
  },
  {
    id: "story-keynote",
    image: "/images/tradefair/keynote.jpg",
    title: "Plenary Keynotes & AfCFTA Trade Leadership Arena",
    tag: "Leadership Summit",
    category: "keynote",
    subtitle: "30+ High-Impact Keynote Sessions in a 2,500-Seat Auditorium",
    description: "Trade ministers, economic visionaries, and captains of African industry debating policy, tariff elimination, and export logistics.",
    stats: "30+ Sessions",
    statLabel: "Summit Keynotes",
  },
  {
    id: "story-pavilion",
    image: "/images/tradefair/pavilion.jpg",
    title: "International Country Pavilions & Agro-Allied Exports",
    tag: "Export Showcase",
    category: "pavilion",
    subtitle: "Sovereign Trade Missions from 20+ African & Global Nations",
    description: "Celebrating African craftsmanship, artisanal textiles, processed agro-commodities, and manufactured goods ready for the global market.",
    stats: "20+ Nations",
    statLabel: "Participating Delegations",
  },
  {
    id: "story-venue",
    image: "/images/tradefair/venue.jpg",
    title: "The Iconic Host Convention Complex in Abuja",
    tag: "Host Venue",
    category: "venue",
    subtitle: "World-Class Convention Infrastructure in Nigeria's Capital",
    description: "Featuring presidential protocol reception, advanced broadcast infrastructure, multi-level secure parking, and diplomatic security.",
    stats: "45,000 m²",
    statLabel: "Exhibition Footprint",
  },
];

const eventStats = [
  { icon: Users, value: "10,000+", label: "Trade Visitors & Buyers" },
  { icon: ShoppingBag, value: "200+", label: "Exhibitor Stalls" },
  { icon: Globe, value: "20+", label: "Sovereign Delegations" },
  { icon: TrendingUp, value: "₦500M+", label: "Target Trade Deals" },
  { icon: Mic, value: "30+", label: "Keynote & Panel Sessions" },
  { icon: Award, value: "100+", label: "Accredited Media Outlets" },
];

const galleryHighlights = [
  {
    title: "AfCFTA Continental Trade Corridor",
    category: "trade",
    tag: "Cross-Border Trade",
    desc: "Exhibits displaying zero-tariff intra-African trade commodities, logistics corridors, and customs documentation tech.",
    badge: "Hall A Showcase",
  },
  {
    title: "Fintech & Cross-Border Payments Showcase",
    category: "b2b",
    tag: "Digital Commerce",
    desc: "Demonstrations of multi-currency settlement rails, digital escrow for African trade, and mobile money merchant tools.",
    badge: "Hall B Tech Hub",
  },
  {
    title: "Agro-Processing & Packaging Technology",
    category: "pavilion",
    tag: "Industrial Agro",
    desc: "Cold storage innovations, solar dry-milling machines, and certified export-grade organic food packaging lines.",
    badge: "Agro Pavilion",
  },
  {
    title: "Presidential & Ministerial Trade Banquet",
    category: "keynote",
    tag: "Diplomatic Gala",
    desc: "Exclusive evening gala dinner hosting sovereign ambassadors, trade ministers, and heads of African export councils.",
    badge: "Grand Ballroom",
  },
  {
    title: "African Fashion & Creative Industries Village",
    category: "pavilion",
    tag: "Culture & Creative",
    desc: "Runway shows featuring premium African handwoven fabrics, leathercraft, jewelry, and luxury lifestyle exports.",
    badge: "Outdoor Esplanade",
  },
  {
    title: "Venture Pitch & Angel Investment Stage",
    category: "b2b",
    tag: "SME Investment",
    desc: "50 selected high-growth African startups pitching before regional venture funds and commercial development banks.",
    badge: "Innovation Stage",
  },
];

const testimonials = [
  {
    quote: "GloTrade provides an unmatched gateway for regional manufacturers to enter the broader African and global export supply chain.",
    author: "Dr. Amina Bello",
    role: "Director of Trade Relations",
    org: "West Africa Export Development Council",
    flag: "🇳🇬",
  },
  {
    quote: "The curated B2B matchmaking sessions alone accelerated our regional retail distribution expansion by over 18 months.",
    author: "Kwame Mensah",
    role: "Managing Director",
    org: "Pan-African Agribusiness Consortium",
    flag: "🇬🇭",
  },
  {
    quote: "A masterclass in modern exhibition logistics and international buyer engagement in the heart of Nigeria's capital.",
    author: "Jean-Luc Moreau",
    role: "Senior Trade Attaché",
    org: "European-African Trade Partnership",
    flag: "🇫🇷",
  },
];

export default function GalleryPage() {
  const [activeCategory, setActiveCategory] = useState<string>("all");
  const [activeModalStory, setActiveModalStory] = useState<GalleryStory | null>(null);

  const filteredStories =
    activeCategory === "all"
      ? featuredStories
      : featuredStories.filter((s) => s.category === activeCategory);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-amber-500 selection:text-slate-950">
      <BazaarNav />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative overflow-hidden py-20 lg:py-28 bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 border-b border-slate-800">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[350px] bg-amber-500/10 blur-[130px] rounded-full pointer-events-none" />

          <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
            <span className="inline-block text-xs font-bold uppercase tracking-widest text-amber-400 bg-amber-500/10 px-4 py-2 rounded-full border border-amber-500/30 mb-6 shadow-sm">
              {translate("bazaar.galleryBadge") || "Official Event Media & Visual Highlights"}
            </span>

            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black text-white tracking-tight leading-tight mb-6">
              Experience the Grandeur of <br />
              <span className="bg-gradient-to-r from-amber-400 via-amber-300 to-amber-500 bg-clip-text text-transparent">
                GloTrade 2026
              </span>
            </h1>

            <p className="text-slate-300 text-lg sm:text-xl max-w-3xl mx-auto leading-relaxed mb-10">
              {translate("bazaar.gallerySubtitle") ||
                "From high-level diplomatic dealmaking and AfCFTA policy debates to vibrant multi-hall exhibitions and cultural showcases — preview the scale and atmosphere of West Africa's flagship commerce gathering."}
            </p>

            {/* Quick Media Action Row */}
            <div className="flex flex-wrap items-center justify-center gap-4">
              <a
                href="#stories"
                className="px-7 py-3.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-sm shadow-xl shadow-amber-500/20 transition-all hover:scale-105 inline-flex items-center gap-2"
              >
                <ImageIcon size={16} /> Explore Visual Stories
              </a>
              <Link
                href="/trade-fair/tickets"
                className="px-7 py-3.5 rounded-xl bg-slate-900 border border-slate-700 hover:bg-slate-800 text-white font-bold text-sm transition-all inline-flex items-center gap-2"
              >
                <Star size={16} className="text-amber-400" /> Book Delegate Pass
              </Link>
            </div>
          </div>
        </section>

        {/* Event Stats Bar */}
        <section className="bg-gradient-to-r from-amber-600 via-amber-500 to-amber-600 py-6 border-y border-amber-400/30 shadow-md">
          <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-6 text-center">
              {eventStats.map((stat, i) => (
                <div key={i} className="flex flex-col items-center gap-1">
                  <stat.icon size={20} className="text-slate-950/70 mb-1" />
                  <span className="text-2xl sm:text-3xl font-black text-slate-950">{stat.value}</span>
                  <span className="text-[11px] font-bold text-slate-950/70 uppercase tracking-wide">{stat.label}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Featured Visual Stories (Curated High-Res Photographic Gallery) */}
        <section id="stories" className="py-20 lg:py-28 bg-slate-950">
          <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
              <div>
                <span className="text-xs font-bold uppercase tracking-widest text-amber-400 bg-amber-500/10 px-4 py-1.5 rounded-full border border-amber-500/30">
                  Curated Highlights
                </span>
                <h2 className="text-3xl sm:text-4xl font-black text-white mt-4 mb-2">
                  Featured Exhibition & Summit Stories
                </h2>
                <p className="text-slate-400 max-w-xl text-base">
                  High-resolution photographic glimpses into the five pillar experiences of GloTrade Trade Fair 2026.
                </p>
              </div>

              {/* Category Filter Pills */}
              <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
                {[
                  { id: "all", label: "All Experiences" },
                  { id: "trade", label: "Exhibition Halls" },
                  { id: "b2b", label: "B2B Deal Rooms" },
                  { id: "keynote", label: "Keynotes" },
                  { id: "pavilion", label: "Country Pavilions" },
                  { id: "venue", label: "Host Complex" },
                ].map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => setActiveCategory(cat.id)}
                    className={`px-4 py-2 rounded-full text-xs font-bold transition-all whitespace-nowrap border ${
                      activeCategory === cat.id
                        ? "bg-amber-500 text-slate-950 border-amber-400 shadow-md shadow-amber-500/20"
                        : "bg-slate-900 text-slate-400 border-slate-800 hover:text-white hover:border-slate-700"
                    }`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Grid of Visual Stories */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredStories.map((story, i) => (
                <div
                  key={story.id}
                  onClick={() => setActiveModalStory(story)}
                  className={`group bg-slate-900 border border-slate-800 hover:border-amber-500/40 rounded-3xl overflow-hidden cursor-pointer transition-all duration-300 hover:-translate-y-1.5 shadow-xl flex flex-col justify-between ${
                    i === 0 ? "md:col-span-2 lg:col-span-2" : ""
                  }`}
                >
                  <div>
                    {/* Image Container with Zoom effect */}
                    <div className="relative aspect-[16/10] overflow-hidden bg-slate-950">
                      <img
                        src={story.image}
                        alt={story.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent" />

                      {/* Top Badges */}
                      <div className="absolute top-4 left-4 right-4 flex items-center justify-between">
                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-950 bg-amber-400 px-3 py-1 rounded-full shadow-md">
                          {story.tag}
                        </span>
                        <div className="w-8 h-8 rounded-full bg-slate-950/70 backdrop-blur-md border border-slate-700 flex items-center justify-center text-slate-300 group-hover:text-amber-400 group-hover:scale-110 transition-all">
                          <Maximize2 size={14} />
                        </div>
                      </div>

                      {/* Bottom Image Overlay Stat */}
                      <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between text-xs">
                        <span className="text-white font-bold bg-slate-950/80 backdrop-blur-md px-3 py-1 rounded-full border border-slate-800">
                          {story.stats}
                        </span>
                        <span className="text-amber-300 font-semibold bg-slate-950/80 backdrop-blur-md px-3 py-1 rounded-full border border-slate-800">
                          {story.statLabel}
                        </span>
                      </div>
                    </div>

                    {/* Card Content */}
                    <div className="p-6">
                      <h3 className="text-xl sm:text-2xl font-black text-white group-hover:text-amber-400 transition-colors mb-2">
                        {story.title}
                      </h3>
                      <p className="text-xs font-semibold text-amber-400/90 mb-3">{story.subtitle}</p>
                      <p className="text-slate-400 text-xs sm:text-sm leading-relaxed">{story.description}</p>
                    </div>
                  </div>

                  <div className="p-6 pt-0 border-t border-slate-800/80 mt-4 flex items-center justify-between">
                    <span className="text-xs font-bold text-amber-400 flex items-center gap-1 group-hover:underline">
                      Click to expand showcase <ArrowRight size={13} />
                    </span>
                    <span className="text-[11px] text-slate-500 font-semibold">Dec 1–5, 2026</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Modal Lightbox for Fullscreen Image Exploration */}
        {activeModalStory && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-950/90 backdrop-blur-xl animate-fadeIn">
            <div className="bg-slate-900 border border-amber-500/30 rounded-3xl max-w-4xl w-full overflow-hidden shadow-2xl relative">
              <button
                onClick={() => setActiveModalStory(null)}
                className="absolute top-4 right-4 z-20 w-10 h-10 rounded-full bg-slate-950/80 border border-slate-700 text-slate-300 hover:text-white hover:bg-slate-800 flex items-center justify-center transition-all"
              >
                <X size={20} />
              </button>

              <div className="relative aspect-[16/9] w-full bg-slate-950">
                <img
                  src={activeModalStory.image}
                  alt={activeModalStory.title}
                  className="w-full h-full object-cover"
                />
              </div>

              <div className="p-6 sm:p-8 space-y-4">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="px-3 py-1 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30 text-xs font-bold uppercase tracking-wider">
                    {activeModalStory.tag}
                  </span>
                  <span className="text-xs font-bold text-slate-300 bg-slate-800 px-3 py-1 rounded-full">
                    {activeModalStory.stats} · {activeModalStory.statLabel}
                  </span>
                </div>

                <h3 className="text-2xl sm:text-3xl font-black text-white">{activeModalStory.title}</h3>
                <p className="text-sm font-semibold text-amber-300">{activeModalStory.subtitle}</p>
                <p className="text-slate-300 text-sm leading-relaxed">{activeModalStory.description}</p>

                <div className="pt-4 flex flex-wrap items-center justify-between gap-4 border-t border-slate-800">
                  <span className="text-xs text-slate-500">Official Photography © GloTrade Trade Fair 2026</span>
                  <div className="flex gap-2">
                    <Link
                      href="/trade-fair/tickets"
                      className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs uppercase tracking-wider"
                    >
                      Book Ticket
                    </Link>
                    <button
                      onClick={() => setActiveModalStory(null)}
                      className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs uppercase tracking-wider"
                    >
                      Close Preview
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Thematic Exhibition Zones Grid */}
        <section className="py-20 bg-slate-900/40 border-t border-slate-800">
          <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-14">
              <span className="text-xs font-bold uppercase tracking-widest text-amber-400 bg-amber-500/10 px-4 py-1.5 rounded-full border border-amber-500/30">
                Pillar Zones
              </span>
              <h2 className="text-3xl sm:text-4xl font-black text-white mt-4 mb-3">
                Key Highlights Across the Fairgrounds
              </h2>
              <p className="text-slate-400 max-w-2xl mx-auto text-base">
                Each zone is meticulously engineered to drive buyer interest, investor connection, and bilateral trade flows.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {galleryHighlights.map((item, i) => (
                <div
                  key={i}
                  className="bg-slate-950 border border-slate-800 hover:border-amber-500/40 rounded-2xl p-7 flex flex-col justify-between transition-all group hover:-translate-y-1"
                >
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-[10px] font-bold text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2.5 py-1 rounded-full uppercase tracking-wider">
                        {item.tag}
                      </span>
                      <span className="text-[11px] text-slate-500 font-semibold">{item.badge}</span>
                    </div>
                    <h3 className="text-lg font-bold text-white mb-2 group-hover:text-amber-400 transition-colors">
                      {item.title}
                    </h3>
                    <p className="text-xs text-slate-400 leading-relaxed">{item.desc}</p>
                  </div>

                  <div className="pt-5 mt-5 border-t border-slate-900 flex items-center justify-between text-xs text-slate-500">
                    <span className="flex items-center gap-1 text-amber-400 font-semibold">
                      <CheckCircle2 size={13} /> December 1–5
                    </span>
                    <span>Abuja, Nigeria</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Voices of Industry Leaders (Testimonials) */}
        <section className="py-20 bg-slate-950 border-t border-slate-800">
          <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-14">
              <span className="text-xs font-bold uppercase tracking-widest text-amber-400 bg-amber-500/10 px-4 py-1.5 rounded-full border border-amber-500/30">
                Industry Endorsements
              </span>
              <h2 className="text-3xl sm:text-4xl font-black text-white mt-4 mb-3">
                Endorsed by Trade Leaders Across Africa
              </h2>
              <p className="text-slate-400 max-w-xl mx-auto text-base">
                Discover what export development councils and agribusiness leaders say about the GloTrade experience.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {testimonials.map((t, i) => (
                <div
                  key={i}
                  className="bg-slate-900 border border-slate-800 rounded-3xl p-8 flex flex-col justify-between relative shadow-lg"
                >
                  <div className="text-amber-400 text-3xl font-serif mb-4 leading-none">&ldquo;</div>
                  <p className="text-slate-200 text-sm leading-relaxed mb-6 italic">{t.quote}</p>
                  <div className="pt-4 border-t border-slate-800 flex items-center gap-3">
                    <div className="text-2xl">{t.flag}</div>
                    <div>
                      <h4 className="text-white font-bold text-sm">{t.author}</h4>
                      <p className="text-amber-400 text-[11px] font-semibold">{t.role}</p>
                      <p className="text-slate-500 text-[10px]">{t.org}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Media & Press Accreditation Hub */}
        <section className="py-20 bg-slate-900/40 border-t border-slate-800">
          <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="bg-gradient-to-r from-slate-900 via-amber-950/20 to-slate-900 border border-amber-500/30 rounded-3xl p-8 sm:p-12 relative overflow-hidden">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
                <div className="lg:col-span-8 space-y-4">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-bold uppercase tracking-wider">
                    <Camera size={14} /> Press & Media Relations
                  </div>
                  <h3 className="text-2xl sm:text-3xl font-black text-white">
                    Accreditation Open for African & Global Journalists
                  </h3>
                  <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
                    Accredited broadcast journalists, photojournalists, and trade bloggers receive access to the dedicated Media Centre with high-speed uplink, press briefing auditorium, and VIP interview booths.
                  </p>
                  <div className="flex flex-wrap gap-4 pt-2 text-xs text-slate-300">
                    <span className="flex items-center gap-1.5 font-semibold">
                      <CheckCircle2 size={15} className="text-amber-400" /> Dedicated 1Gbps Media Fibre
                    </span>
                    <span className="flex items-center gap-1.5 font-semibold">
                      <CheckCircle2 size={15} className="text-amber-400" /> Soundproof Broadcast Booths
                    </span>
                    <span className="flex items-center gap-1.5 font-semibold">
                      <CheckCircle2 size={15} className="text-amber-400" /> Daily Official Press Releases
                    </span>
                  </div>
                </div>

                <div className="lg:col-span-4 flex flex-col gap-3">
                  <Link
                    href="/trade-fair/contact"
                    className="w-full py-4 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs uppercase tracking-wider text-center transition-all shadow-lg shadow-amber-500/20"
                  >
                    Apply for Media Pass
                  </Link>
                  <a
                    href="mailto:press@glotrade.online"
                    className="w-full py-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs uppercase tracking-wider text-center transition-all border border-slate-700"
                  >
                    Email Press Bureau
                  </a>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Social Media Hashtags & Final CTA */}
        <section className="py-20 bg-slate-950 border-t border-slate-800">
          <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-bold uppercase tracking-widest mb-6">
              <Zap size={14} /> Follow Live Coverage
            </div>

            <h2 className="text-3xl sm:text-5xl font-black text-white mb-4">
              Be Part of Africa&apos;s Trade Story
            </h2>

            <p className="text-slate-400 text-base max-w-xl mx-auto mb-10 leading-relaxed">
              Tag your pre-event preparations and trade delegation journeys on LinkedIn, X, and Instagram.
            </p>

            <div className="flex flex-wrap items-center justify-center gap-3 mb-10">
              <span className="px-5 py-2.5 rounded-full bg-slate-900 border border-amber-500/30 text-amber-400 font-bold text-xs sm:text-sm">
                #GloTradeFair2026
              </span>
              <span className="px-5 py-2.5 rounded-full bg-slate-900 border border-amber-500/30 text-amber-400 font-bold text-xs sm:text-sm">
                #AbujaTradeExpo
              </span>
              <span className="px-5 py-2.5 rounded-full bg-slate-900 border border-amber-500/30 text-amber-400 font-bold text-xs sm:text-sm">
                #AfCFTAInAction
              </span>
              <span className="px-5 py-2.5 rounded-full bg-slate-900 border border-amber-500/30 text-amber-400 font-bold text-xs sm:text-sm">
                #InvestInAfrica
              </span>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/trade-fair/tickets"
                className="w-full sm:w-auto px-8 py-4 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-base shadow-xl shadow-amber-500/20 transition-all hover:scale-105 inline-flex items-center justify-center gap-2"
              >
                <Star size={18} /> Secure Your Ticket Now
              </Link>
              <Link
                href="/trade-fair/exhibitors"
                className="w-full sm:w-auto px-8 py-4 rounded-xl bg-slate-900 border border-slate-700 hover:bg-slate-800 text-white font-bold text-base transition-all inline-flex items-center justify-center gap-2"
              >
                Book an Exhibitor Stall <ArrowRight size={16} />
              </Link>
            </div>
          </div>
        </section>
      </main>

      <BazaarFooter />
    </div>
  );
}
