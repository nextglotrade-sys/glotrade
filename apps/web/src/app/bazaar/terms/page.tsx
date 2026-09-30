"use client";
import BazaarNav from "@/components/bazaar/BazaarNav";
import BazaarFooter from "@/components/bazaar/BazaarFooter";
import Link from "next/link";
import {
  ShieldAlert,
  FileText,
  AlertTriangle,
  CreditCard,
  Ticket,
  Store,
  Crown,
  Scale,
  Camera,
  HelpCircle,
  ArrowLeft,
  CheckCircle2,
  Phone,
  Mail
} from "lucide-react";
import { translate } from "@/utils/translate";

export default function BazaarTermsPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      <BazaarNav />

      <main className="flex-1 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-extrabold uppercase tracking-widest mb-4">
            <FileText size={14} className="text-amber-400" /> OFFICIAL EVENT POLICY
          </div>
          <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
            Terms & Conditions
          </h1>
          <p className="text-slate-400 mt-4 text-base sm:text-lg">
            GloTrade International Trade Fair 2026 — General Booking, Admission, Exhibitor & Non-Refundable Policies.
          </p>
          <p className="text-xs text-slate-500 mt-2">
            Last Updated: August 2026 • Governed by the Laws of the Federal Republic of Nigeria
          </p>
        </div>

        {/* Highlighted Non-Refundable Notice Banner */}
        <div className="bg-gradient-to-r from-red-950/80 via-amber-950/60 to-red-950/80 border-2 border-amber-500/80 rounded-3xl p-6 sm:p-8 mb-12 shadow-2xl relative overflow-hidden">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-500/40 text-amber-400 flex items-center justify-center shrink-0 shadow-lg">
              <AlertTriangle size={26} />
            </div>
            <div className="space-y-2">
              <span className="text-xs font-black uppercase tracking-widest text-amber-400 bg-amber-500/20 px-3 py-1 rounded-full border border-amber-500/40 inline-block">
                CRITICAL NOTICE • NON-REFUNDABLE POLICY
              </span>
              <h2 className="text-xl sm:text-2xl font-bold text-white">
                All Payments Are Strictly Final & Non-Refundable
              </h2>
              <p className="text-sm sm:text-base text-slate-200 leading-relaxed">
                By purchasing an event ticket (Standard, VIP, VVIP, Reserved Table), booking an exhibitor booth, or registering as an event sponsor for <strong>GloTrade International Trade Fair 2026</strong>, you explicitly acknowledge and agree that <strong>all transactions and payments are strictly non-refundable</strong> under any circumstances once payment is confirmed.
              </p>
            </div>
          </div>
        </div>

        {/* Policy Content Sections */}
        <div className="space-y-8">
          {/* Section 1: Non-Refundable Policy & Transfers */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8">
            <div className="flex items-center gap-3 border-b border-slate-800 pb-4 mb-4">
              <ShieldAlert className="text-amber-400 shrink-0" size={24} />
              <h2 className="text-xl font-bold text-white">1. Non-Refundable & Payment Terms</h2>
            </div>
            <div className="space-y-3 text-sm sm:text-base text-slate-300 leading-relaxed">
              <p>
                <strong>1.1 Final Sales:</strong> All ticket bookings, exhibitor stall registrations, and sponsorship commitments made on this portal or via authorized GloTrade payment channels are final. No refunds, partial refunds, or credit notes will be issued for cancellations, no-shows, change of mind, personal schedule conflicts, or failure to attend.
              </p>
              <p>
                <strong>1.2 Ticket Transferability:</strong> While tickets are non-refundable, an attendee may transfer their ticket pass to another person before the event by forwarding the official ticket pass email and unique reference code. Each ticket code admits exactly one person (or 4 persons in the case of a Reserved Table of 4) and can only be scanned once at the entrance gate.
              </p>
              <p>
                <strong>1.3 Exhibitor & Sponsor Non-Refundability:</strong> Booth spaces and sponsorship tiers are allocated and promotional materials are generated immediately upon receipt of funds. Stall and sponsorship fees cannot be refunded, exchanged, or downgraded once booked.
              </p>
            </div>
          </div>

          {/* Section 2: Booking Verification & Payment Channels */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8">
            <div className="flex items-center gap-3 border-b border-slate-800 pb-4 mb-4">
              <CreditCard className="text-amber-400 shrink-0" size={24} />
              <h2 className="text-xl font-bold text-white">2. Booking & Payment Verification</h2>
            </div>
            <div className="space-y-3 text-sm sm:text-base text-slate-300 leading-relaxed">
              <p>
                <strong>2.1 Instant Card Payments (Paystack):</strong> Payments completed through our integrated Paystack gateway are processed instantly in Nigerian Naira (NGN). An automated electronic ticket confirmation and receipt will be dispatched to the provided email address upon successful charge.
              </p>
              <p>
                <strong>2.2 Bank Transfer Bookings:</strong> For payments made via direct bank transfer to the official GloTrade bank account, users must provide proof of payment via WhatsApp (+234 704 460 0924) alongside their booking reference. Tickets and exhibitor stalls will only be issued upon verified credit to our official bank account.
              </p>
              <p>
                <strong>2.3 Accuracy of Information:</strong> You are responsible for ensuring that all information provided during checkout (full name, phone number, valid email address) is accurate and up to date.
              </p>
            </div>
          </div>

          {/* Section 3: Event Admission & Gate Rules */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8">
            <div className="flex items-center gap-3 border-b border-slate-800 pb-4 mb-4">
              <Ticket className="text-amber-400 shrink-0" size={24} />
              <h2 className="text-xl font-bold text-white">3. Admission & Venue Guidelines</h2>
            </div>
            <div className="space-y-3 text-sm sm:text-base text-slate-300 leading-relaxed">
              <p>
                <strong>3.1 Verification at Gates:</strong> Entry to the designated event exhibition venue in Abuja is strictly granted upon scanning a valid GloTrade electronic ticket pass or presenting an official physical badge.
              </p>
              <p>
                <strong>3.2 Right of Admission Reserved:</strong> Event organizers and security personnel reserve the right to deny admission or escort any person from the premises who engages in disorderly conduct, harassment, unauthorized commercial hawking, or violation of venue regulations.
              </p>
              <p>
                <strong>3.3 Prohibited Items:</strong> Weapons, illegal substances, fireworks, glassware, and unauthorized heavy equipment are strictly prohibited within the festival grounds. Security body and bag checks will be conducted at all entry gates.
              </p>
            </div>
          </div>

          {/* Section 4: Exhibitor & Vendor Code */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8">
            <div className="flex items-center gap-3 border-b border-slate-800 pb-4 mb-4">
              <Store className="text-amber-400 shrink-0" size={24} />
              <h2 className="text-xl font-bold text-white">4. Exhibitor & Vendor Obligations</h2>
            </div>
            <div className="space-y-3 text-sm sm:text-base text-slate-300 leading-relaxed">
              <p>
                <strong>4.1 Setup & Dismantling Schedule:</strong> Exhibitors must adhere to the designated booth setup and load-in schedule prior to gate opening. Early dismantling is strictly discouraged to maintain festival aesthetics.
              </p>
              <p>
                <strong>4.2 Merchandise Authenticity & Legality:</strong> Exhibitors warrant that all goods, food items, crafts, or services displayed comply with Nigerian health, safety, and trade standards (e.g. NAFDAC regulations where applicable). No counterfeit or pirated goods may be exhibited.
              </p>
              <p>
                <strong>4.3 Booth Allocation:</strong> Stall placement is determined exclusively by the GloTrade operations committee. Sub-leasing or sharing assigned stall space with third parties without written authorization is prohibited.
              </p>
            </div>
          </div>

          {/* Section 5: Sponsorship & Media Rights */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8">
            <div className="flex items-center gap-3 border-b border-slate-800 pb-4 mb-4">
              <Crown className="text-amber-400 shrink-0" size={24} />
              <h2 className="text-xl font-bold text-white">5. Sponsorship Deliverables & Media Release</h2>
            </div>
            <div className="space-y-3 text-sm sm:text-base text-slate-300 leading-relaxed">
              <p>
                <strong>5.1 Sponsor Assets:</strong> Sponsors must supply approved logos, promotional artwork, and video assets within the deadlines communicated by the sponsorship secretariat to ensure inclusion in digital, print, and stage backdrops.
              </p>
              <p>
                <strong>5.2 Photography & Filming Consent:</strong> By attending or exhibiting at GloTrade International Trade Fair 2026, you acknowledge that photography, audio, and video recording will take place across the venue. You grant GloTrade Platform Limited and its media partners the irrevocable right to use your likeness in event retrospectives, social media, and future promotional broadcasts.
              </p>
            </div>
          </div>

          {/* Section 6: Force Majeure & Rescheduling */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8">
            <div className="flex items-center gap-3 border-b border-slate-800 pb-4 mb-4">
              <Scale className="text-amber-400 shrink-0" size={24} />
              <h2 className="text-xl font-bold text-white">6. Postponement, Venue Changes & Force Majeure</h2>
            </div>
            <div className="space-y-3 text-sm sm:text-base text-slate-300 leading-relaxed">
              <p>
                <strong>6.1 Event Rescheduling:</strong> In the unforeseen event of extreme weather conditions, public health advisories, security orders, civil unrest, or other force majeure events beyond our reasonable control, the organizers reserve the right to reschedule the date or relocate the venue.
              </p>
              <p>
                <strong>6.2 Ticket & Booth Validity:</strong> In case of postponement, all purchased tickets, exhibitor booths, and sponsorships will automatically remain 100% valid for the rescheduled date. Cash refunds will not be issued under force majeure circumstances.
              </p>
            </div>
          </div>

          {/* Section 7: Enquiries & Legal Contact */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8">
            <div className="flex items-center gap-3 border-b border-slate-800 pb-4 mb-4">
              <HelpCircle className="text-amber-400 shrink-0" size={24} />
              <h2 className="text-xl font-bold text-white">7. Questions & Support Contact</h2>
            </div>
            <p className="text-sm sm:text-base text-slate-300 leading-relaxed mb-6">
              If you have any questions or require clarification regarding these terms, your booking reference, or exhibitor requirements, please reach out to our event management desk:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 flex items-center gap-3">
                <Mail className="text-amber-400 shrink-0" size={20} />
                <div>
                  <span className="text-xs text-slate-400 block">Email Support</span>
                  <a href="mailto:glotradebazaar@glotrade.online" className="text-white font-bold hover:text-amber-400">
                    glotradebazaar@glotrade.online
                  </a>
                </div>
              </div>
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 flex items-center gap-3">
                <Phone className="text-amber-400 shrink-0" size={20} />
                <div>
                  <span className="text-xs text-slate-400 block">WhatsApp Desk</span>
                  <a href="https://wa.me/2347044600924" target="_blank" rel="noopener noreferrer" className="text-white font-bold hover:text-amber-400">
                    +234 704 460 0924
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom CTA */}
        <div className="mt-12 text-center space-y-4">
          <Link
            href="/trade-fair/tickets"
            className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-base shadow-lg transition-all"
          >
            <Ticket size={18} /> Proceed to Tickets & Registration
          </Link>
          <div>
            <Link
              href="/bazaar"
              className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-colors"
            >
              <ArrowLeft size={14} /> Back to Trade Fair Home
            </Link>
          </div>
        </div>
      </main>

      <BazaarFooter />
    </div>
  );
}
