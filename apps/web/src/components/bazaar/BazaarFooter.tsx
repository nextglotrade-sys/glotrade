"use client";
import Link from "next/link";
import { MapPin, Calendar, Mail, Phone, ExternalLink, Sparkles } from "lucide-react";
import { translate } from "@/utils/translate";

export default function BazaarFooter() {
  return (
    <footer className="bg-slate-950 border-t border-amber-500/20 text-slate-400 pt-16 pb-12">
      <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Brand Col */}
          <div className="space-y-4">
            <Link href="/trade-fair" className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-xl bg-slate-900 border border-amber-500/40 flex items-center justify-center shadow-md overflow-hidden">
                <img src="/glotrade_trade_fair.jpeg" alt="GloTrade International Trade Fair Logo" className="w-full h-full object-cover" />
              </div>
              <div>
                <span className="text-lg font-bold text-white tracking-tight block">
                  GLOTRADE TRADE FAIR
                </span>
                <span className="text-[10px] uppercase tracking-widest text-amber-400/70 font-medium">
                  International Trade Fair 2026
                </span>
              </div>
            </Link>
            <p className="text-sm text-slate-400 leading-relaxed">
              {translate("bazaar.footerDesc") || "West Africa's premier international trade fair and investment expo. Connecting global buyers, MSMEs, investors, and industry leaders in Abuja."}
            </p>
            <div className="flex items-center gap-2 text-xs text-amber-400 font-semibold pt-2">
              <span>{translate("bazaar.presentedBy") || "Presented by"}</span>
              <a
                href="https://glotrade.online"
                target="_blank"
                rel="noreferrer"
                className="underline hover:text-white flex items-center gap-1"
              >
                {translate("bazaar.mainPlatformLink") || "GloTrade Platform"} <ExternalLink size={11} />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-white font-bold text-base mb-4 border-l-2 border-amber-500 pl-3">
              {translate("bazaar.eventNav") || "Event Navigation"}
            </h3>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link href="/trade-fair/about" className="hover:text-amber-400 transition-colors">
                  {translate("bazaar.navAbout") || "About the Event"}
                </Link>
              </li>
              <li>
                <Link href="/trade-fair/tickets" className="hover:text-amber-400 transition-colors">
                  {translate("bazaar.navTickets") || "Free Passes & Admission"}
                </Link>
              </li>
              <li>
                <Link href="/trade-fair/exhibitors" className="hover:text-amber-400 transition-colors">
                  {translate("bazaar.navExhibitors") || "Exhibitor Stall Booking"}
                </Link>
              </li>
              <li>
                <Link href="/trade-fair/promoter" className="text-amber-400 font-semibold hover:text-amber-300 transition-colors flex items-center gap-1.5">
                  <Sparkles size={14} className="text-amber-400" />
                  <span>Promoter Referral Program</span>
                </Link>
              </li>
              <li>
                <Link href="/trade-fair/sponsorship" className="hover:text-amber-400 transition-colors">
                  {translate("bazaar.navSponsorship") || "Sponsorship Packages"}
                </Link>
              </li>
              <li>
                <Link href="/trade-fair/programme" className="hover:text-amber-400 transition-colors">
                  {translate("bazaar.navProgramme") || "Programme Timeline"}
                </Link>
              </li>
              <li>
                <Link href="/trade-fair/terms" className="text-amber-400/90 hover:text-amber-300 transition-colors font-medium">
                  {translate("bazaar.navTermsPolicy") || "Terms & Refund Policy"}
                </Link>
              </li>
            </ul>
          </div>

          {/* Event Details */}
          <div>
            <h3 className="text-white font-bold text-base mb-4 border-l-2 border-amber-500 pl-3">
              {translate("bazaar.eventInfo") || "Event Information"}
            </h3>
            <ul className="space-y-3 text-sm">
              <li className="flex items-start gap-3">
                <Calendar size={18} className="text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <p className="text-white font-medium">{translate("bazaar.eventDate") || "1st – 5th December 2026"}</p>
                  <p className="text-xs text-slate-500">Daily 9:00 AM - 6:00 PM</p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <MapPin size={18} className="text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <p className="text-white font-medium">Nigerian Army Conference Centre &amp; Suites (NACCAS)</p>
                  <p className="text-xs text-slate-400">Km 10 Expressway, Asokoro, Abuja</p>
                  <p className="text-xs text-slate-500">Federal Capital Territory, Nigeria</p>
                </div>
              </li>
            </ul>
          </div>

          {/* Contact & Enquiries */}
          <div>
            <h3 className="text-white font-bold text-base mb-4 border-l-2 border-amber-500 pl-3">
              {translate("bazaar.enquiriesSupport") || "Enquiries & Support"}
            </h3>
            <ul className="space-y-3 text-sm">
              <li className="flex items-center gap-3">
                <Mail size={16} className="text-amber-400 shrink-0" />
                <a href="mailto:tradefair@glotrade.online" className="hover:text-amber-400">
                  tradefair@glotrade.online
                </a>
              </li>
              <li className="flex items-center gap-3">
                <Phone size={16} className="text-amber-400 shrink-0" />
                <a href="https://wa.me/2347044600924" target="_blank" rel="noreferrer" className="hover:text-amber-400">
                  +234 704 460 0924
                </a>
              </li>
              <li className="flex items-center gap-3">
                <Phone size={16} className="text-amber-400 shrink-0" />
                <a href="tel:+2349029004712" className="hover:text-amber-400">
                  +234 902 900 4712
                </a>
              </li>
            </ul>
            <div className="mt-6 pt-4 border-t border-slate-800">
              <Link
                href="/trade-fair/contact"
                className="inline-block text-xs font-bold text-slate-950 bg-amber-400 hover:bg-amber-300 px-4 py-2 rounded-lg transition-colors"
              >
                {translate("bazaar.sendMessageCta") || "Send Us a Message"}
              </Link>
            </div>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-slate-800 text-center text-xs text-slate-500 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <p>© {new Date().getFullYear()} GloTrade International Trade Fair. All rights reserved.</p>
            <span>•</span>
            <Link href="/trade-fair/terms" className="text-slate-400 hover:text-amber-400 transition-colors underline">
              Terms & Non-Refundable Policy
            </Link>
          </div>
          <p className="text-slate-400">
            Powered by <span className="text-amber-400 font-semibold">NexGen Innovations Technology</span>
          </p>
        </div>
      </div>
    </footer>
  );
}
