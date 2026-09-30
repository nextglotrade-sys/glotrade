"use client";

import { useState } from "react";
import BazaarNav from "@/components/bazaar/BazaarNav";
import BazaarFooter from "@/components/bazaar/BazaarFooter";
import Link from "next/link";
import {
  Mail,
  Phone,
  MapPin,
  Send,
  CheckCircle2,
  Loader2,
  Clock,
  Sparkles,
  Building2,
  Globe,
  Shield,
  HelpCircle,
  FileText,
  ChevronDown,
  ArrowRight,
  BadgeCheck,
} from "lucide-react";
import { apiPost } from "@/utils/api";
import { translate } from "@/utils/translate";

interface Department {
  title: string;
  category: string;
  email: string;
  description: string;
  icon: any;
}

const departments: Department[] = [
  {
    title: "Exhibitor & Stall Allocations",
    category: "Booths & Space-Only",
    email: "exhibitors@glotrade.online",
    description: "Inquiries regarding custom stall configurations, shell schemes, power hookups, and freight receiving docks.",
    icon: Building2,
  },
  {
    title: "Corporate Sponsorship & Partnerships",
    category: "Brand Prominence",
    email: "partnerships@glotrade.online",
    description: "Platinum, Gold, and Sector-specific title sponsorship packages, branding, and VIP hospitality suites.",
    icon: Sparkles,
  },
  {
    title: "Diplomatic Protocol & Visa Assistance",
    category: "International Delegations",
    email: "protocol@glotrade.online",
    description: "Official letters of invitation, Nigerian Visa-on-Arrival facilitation, and sovereign trade mission escorts.",
    icon: Globe,
  },
  {
    title: "Press & Media Accreditation",
    category: "Journalists & Broadcast",
    email: "press@glotrade.online",
    description: "Accreditation badges for print, broadcast, and digital journalists, media lounge access, and press release distribution.",
    icon: FileText,
  },
];

const faqs = [
  {
    q: "How can international delegates obtain a Visa Support Letter?",
    a: "Upon purchasing a Delegate Ticket or registering an Exhibitor Stall, our Protocol Team issues an official Letter of Invitation and coordinates with the Nigeria Immigration Service (NIS) for Visa on Arrival (VoA) facilitation.",
  },
  {
    q: "What payment methods are supported for stall bookings and tickets?",
    a: "We accept all major Nigerian debit cards (Mastercard, Visa, Verve), bank transfers, and international credit cards via our secure payment gateway. For corporate invoice settlement, contact our finance team.",
  },
  {
    q: "Can exhibitors set up custom booths (space-only)?",
    a: "Yes. In addition to standard 3x3m and 6x6m modular shell schemes, space-only options are available in Halls A, B, and C with up to 12-meter rigging height. Stand build contractors must be accredited by November 15, 2026.",
  },
  {
    q: "Is transportation provided between partner hotels and the venue?",
    a: "Yes. Official GloTrade executive shuttles depart every 15–30 minutes from partner hotels (including Transcorp Hilton, Sheraton/Continental, and Fraser Suites) directly to the exhibition center.",
  },
];

export default function ContactPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [organization, setOrganization] = useState("");
  const [category, setCategory] = useState("Exhibitor Stall Reservation");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !message) {
      setError("Please provide your name, email, and message.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const fullSubject = `[${category}] ${subject || "General Inquiry"}`;
      const fullMessage = organization
        ? `Organization / Country: ${organization}\n\n${message}`
        : message;

      await apiPost("/api/v1/bazaar/contact", {
        name,
        email,
        phone,
        subject: fullSubject,
        message: fullMessage,
      });

      setName("");
      setEmail("");
      setPhone("");
      setOrganization("");
      setSubject("");
      setMessage("");
      setSuccess(true);
    } catch (err: any) {
      setError(err?.message || "Failed to submit enquiry. Please try again or email us directly.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-amber-500 selection:text-slate-950">
      <BazaarNav />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative overflow-hidden py-20 lg:py-28 bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 border-b border-slate-800">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[400px] bg-amber-500/10 blur-[140px] rounded-full pointer-events-none" />

          <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
            <span className="inline-block text-xs font-bold uppercase tracking-widest text-amber-400 bg-amber-500/10 px-4 py-2 rounded-full border border-amber-500/30 mb-6 shadow-sm">
              {translate("bazaar.navContact") || "Event Secretariat & Concierge · Abuja, Nigeria"}
            </span>

            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black text-white tracking-tight leading-tight mb-6">
              Connect with the <br />
              <span className="bg-gradient-to-r from-amber-400 via-amber-300 to-amber-500 bg-clip-text text-transparent">
                Trade Fair Secretariat
              </span>
            </h1>

            <p className="text-slate-300 text-lg sm:text-xl max-w-3xl mx-auto leading-relaxed mb-10">
              {translate("bazaar.contactSubtitle") ||
                "Our dedicated secretariat teams in Abuja are on hand to assist with stall allocations, corporate sponsorship packages, international diplomatic protocol, media passes, and delegate accreditation."}
            </p>

            <div className="inline-flex flex-wrap items-center justify-center gap-6 bg-slate-900/90 border border-amber-500/30 rounded-2xl p-4 sm:px-8 sm:py-5 shadow-2xl backdrop-blur-md text-sm">
              <div className="flex items-center gap-2 text-slate-200">
                <Clock className="text-amber-400 shrink-0" size={17} />
                <span>Monday – Friday: 8:30 AM – 5:30 PM WAT</span>
              </div>
              <div className="hidden sm:block w-px h-6 bg-slate-700" />
              <div className="flex items-center gap-2 text-slate-200">
                <Phone className="text-amber-400 shrink-0" size={17} />
                <a href="https://wa.me/2347044600924" target="_blank" rel="noreferrer" className="hover:text-amber-400 font-bold">
                  +234 704 460 0924
                </a>
                <span className="text-slate-600">|</span>
                <a href="tel:+2349029004712" className="hover:text-amber-400 font-bold">
                  +234 902 900 4712
                </a>
              </div>
              <div className="hidden sm:block w-px h-6 bg-slate-700" />
              <div className="flex items-center gap-2 text-slate-200">
                <Mail className="text-amber-400 shrink-0" size={17} />
                <a href="mailto:tradefair@glotrade.online" className="hover:text-amber-400 font-bold">
                  tradefair@glotrade.online
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* Main Content: Department Directory + Interactive Smart Form */}
        <section className="py-20 lg:py-24 bg-slate-950">
          <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
              {/* Left Column: Department Directory & Quick Cards */}
              <div className="lg:col-span-5 space-y-6">
                <div>
                  <span className="text-xs font-bold uppercase tracking-widest text-amber-400 bg-amber-500/10 px-3.5 py-1.5 rounded-full border border-amber-500/30">
                    Direct Liaison Directory
                  </span>
                  <h2 className="text-2xl sm:text-3xl font-black text-white mt-4 mb-2">
                    Specialized Department Contacts
                  </h2>
                  <p className="text-slate-400 text-sm">
                    Reach the exact team managing your specific exhibition or diplomatic requirement.
                  </p>
                </div>

                <div className="space-y-4">
                  {departments.map((dept, i) => (
                    <div
                      key={i}
                      className="bg-slate-900 border border-slate-800 hover:border-amber-500/40 rounded-2xl p-5 transition-all group"
                    >
                      <div className="flex items-start gap-4">
                        <div className="w-11 h-11 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 shrink-0 group-hover:scale-105 transition-transform">
                          <dept.icon size={20} />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between gap-2 mb-1">
                            <h3 className="font-bold text-white text-sm group-hover:text-amber-400 transition-colors">
                              {dept.title}
                            </h3>
                            <span className="text-[10px] font-bold text-amber-400/90 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded-full">
                              {dept.category}
                            </span>
                          </div>
                          <p className="text-xs text-slate-400 leading-relaxed mb-2">{dept.description}</p>
                          <a
                            href={`mailto:${dept.email}`}
                            className="text-xs font-bold text-amber-400 hover:underline flex items-center gap-1"
                          >
                            <Mail size={12} /> {dept.email}
                          </a>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Visa & Diplomatic Assistance Notice Card */}
                <div className="bg-gradient-to-br from-slate-900 to-amber-950/30 border border-amber-500/30 rounded-2xl p-6 space-y-3">
                  <div className="flex items-center gap-2 text-amber-400 text-xs font-bold uppercase tracking-wider">
                    <Shield size={16} /> International Visa Facilitation
                  </div>
                  <h4 className="text-white font-bold text-base">Traveling to Abuja from Abroad?</h4>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    Our Diplomatic Protocol Desk issues official Letters of Invitation for visa applications and facilitates
                    Visa on Arrival (VoA) clearance with the Nigeria Immigration Service for certified delegates and exhibitors.
                  </p>
                  <a
                    href="mailto:protocol@glotrade.online?subject=Visa%20Assistance%20Request%20-%20GloTrade%202026"
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-400 hover:underline pt-1"
                  >
                    Request Visa Invitation Letter <ArrowRight size={13} />
                  </a>
                </div>
              </div>

              {/* Right Column: Smart Contact & Enquiry Form */}
              <div className="lg:col-span-7 bg-slate-900 border border-amber-500/30 rounded-3xl p-6 sm:p-10 shadow-2xl relative">
                <div className="mb-8">
                  <span className="text-xs font-bold uppercase tracking-widest text-amber-400 bg-amber-500/10 px-3.5 py-1.5 rounded-full border border-amber-500/30">
                    Online Secretariat Desk
                  </span>
                  <h2 className="text-2xl sm:text-3xl font-black text-white mt-4 mb-2">
                    {translate("bazaar.sendMessageCta") || "Submit Your Official Enquiry"}
                  </h2>
                  <p className="text-slate-400 text-sm">
                    Fill out the form below. Inquiries are routed directly to the concerned directorate and responded to within 24 hours.
                  </p>
                </div>

                {success ? (
                  <div className="p-8 sm:p-12 bg-emerald-500/10 border border-emerald-500/30 rounded-3xl text-center space-y-4">
                    <div className="w-16 h-16 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center mx-auto">
                      <CheckCircle2 size={36} />
                    </div>
                    <h3 className="text-2xl font-bold text-white">{translate("bazaar.messageSentTitle") || "Enquiry Transmitted Successfully!"}</h3>
                    <p className="text-slate-300 text-sm max-w-md mx-auto leading-relaxed">
                      Thank you for contacting the GloTrade 2026 Secretariat. A dedicated liaison officer has received your message and will respond shortly via email.
                    </p>
                    <div className="pt-4">
                      <button
                        onClick={() => setSuccess(false)}
                        className="px-6 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs uppercase tracking-wider transition-all"
                      >
                        Send Another Message
                      </button>
                    </div>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-5">
                    {error && (
                      <div className="p-4 text-xs bg-rose-500/10 border border-rose-500/30 text-rose-400 rounded-xl">
                        {error}
                      </div>
                    )}

                    {/* Category Selector */}
                    <div>
                      <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                        Inquiry Directorate / Category *
                      </label>
                      <select
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-amber-500"
                      >
                        <option value="Exhibitor Stall Reservation">Exhibitor Stall & Booth Reservation</option>
                        <option value="Corporate Sponsorship">Corporate Sponsorship & Branding Packages</option>
                        <option value="Diplomatic Mission / Visa Support">Diplomatic Mission / Visa Support Letter</option>
                        <option value="Speaking & Panel Opportunities">Keynote Speaker & Panel Opportunities</option>
                        <option value="Press Accreditation">Journalist & Media Accreditation</option>
                        <option value="Visitor Tickets & General Inquiry">Visitor Tickets & General Inquiry</option>
                      </select>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-medium text-slate-300 mb-1">
                          {translate("bazaar.yourNameLabel") || "Full Name *"}
                        </label>
                        <input
                          type="text"
                          required
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          placeholder="Dr. Samuel Okon"
                          className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-amber-500"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-slate-300 mb-1">
                          {translate("bazaar.emailAddressLabel") || "Work / Official Email *"}
                        </label>
                        <input
                          type="email"
                          required
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="s.okon@enterprise.com"
                          className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-amber-500"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-medium text-slate-300 mb-1">
                          {translate("bazaar.phoneNumberLabel") || "Phone / WhatsApp Number"}
                        </label>
                        <input
                          type="tel"
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          placeholder="+234 803 123 4567"
                          className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-amber-500"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-slate-300 mb-1">Organization / Country</label>
                        <input
                          type="text"
                          value={organization}
                          onChange={(e) => setOrganization(e.target.value)}
                          placeholder="e.g. West Africa Export Corp · Ghana"
                          className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-amber-500"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-slate-300 mb-1">
                        {translate("bazaar.subjectLabel") || "Subject Summary"}
                      </label>
                      <input
                        type="text"
                        value={subject}
                        onChange={(e) => setSubject(e.target.value)}
                        placeholder="e.g. Inquiring about 36m² Island Stall in Hall A"
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-amber-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-slate-300 mb-1">
                        {translate("bazaar.messageLabel") || "Message & Technical Requirements *"}
                      </label>
                      <textarea
                        rows={5}
                        required
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        placeholder="Please detail your stall requirements, product vertical, delegation size, or specific assistance required..."
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-amber-500 leading-relaxed"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full py-4 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-sm uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-xl shadow-amber-500/20 hover:scale-[1.01]"
                    >
                      {loading ? (
                        <>
                          <Loader2 className="animate-spin" size={18} /> Transmitting Enquiry...
                        </>
                      ) : (
                        <>
                          <Send size={18} /> {translate("bazaar.submitMessage") || "Submit Official Enquiry"}
                        </>
                      )}
                    </button>
                  </form>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* Frequently Asked Questions Accordion */}
        <section className="py-20 bg-slate-900/40 border-t border-slate-800">
          <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-14">
              <span className="text-xs font-bold uppercase tracking-widest text-amber-400 bg-amber-500/10 px-4 py-1.5 rounded-full border border-amber-500/30">
                Frequently Answered
              </span>
              <h2 className="text-3xl sm:text-4xl font-black text-white mt-4 mb-3">
                Common Questions & Secretariat Answers
              </h2>
              <p className="text-slate-400 max-w-xl mx-auto text-base">
                Quick answers regarding stall allocations, international travel protocols, and tickets.
              </p>
            </div>

            <div className="max-w-3xl mx-auto space-y-4">
              {faqs.map((faq, i) => {
                const isOpen = openFaq === i;
                return (
                  <div
                    key={i}
                    className="bg-slate-950 border border-slate-800 rounded-2xl overflow-hidden transition-all"
                  >
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
                      <div className="px-5 pb-5 pt-1 text-xs sm:text-sm text-slate-300 leading-relaxed border-t border-slate-900 pl-12">
                        {faq.a}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Final CTA Bar */}
        <section className="py-20 bg-gradient-to-r from-slate-950 via-amber-950/30 to-slate-950 border-t border-amber-500/20">
          <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl sm:text-4xl font-black text-white mb-4">
              Ready to Secure Your Stalls or Tickets?
            </h2>
            <p className="text-slate-300 text-sm sm:text-base max-w-xl mx-auto mb-8">
              Spaces in Halls A, B, and C are allocated on a rolling first-come-first-served basis. Reserve your presence today.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/trade-fair/tickets"
                className="w-full sm:w-auto px-8 py-4 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-sm uppercase tracking-wider shadow-lg shadow-amber-500/20 transition-all"
              >
                Book Tickets Now
              </Link>
              <Link
                href="/trade-fair/exhibitors"
                className="w-full sm:w-auto px-8 py-4 rounded-xl bg-slate-900 border border-slate-700 hover:bg-slate-800 text-white font-bold text-sm uppercase tracking-wider transition-all"
              >
                Exhibitor Registration
              </Link>
            </div>
          </div>
        </section>
      </main>

      <BazaarFooter />
    </div>
  );
}
