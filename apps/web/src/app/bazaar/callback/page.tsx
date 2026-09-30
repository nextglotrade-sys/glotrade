"use client";
import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import BazaarNav from "@/components/bazaar/BazaarNav";
import BazaarFooter from "@/components/bazaar/BazaarFooter";
import { CheckCircle2, Ticket, Printer, ArrowLeft, Loader2, AlertTriangle, ShieldCheck, QrCode as QrIcon, Mail } from "lucide-react";
import QRCode from "qrcode";
import { apiGet } from "@/utils/api";

function CallbackContent() {
  const searchParams = useSearchParams();
  const reference = searchParams.get("reference") || searchParams.get("trxref");

  const [booking, setBooking] = useState<any>(null);
  const [qrCodeUrl, setQrCodeUrl] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!reference) {
      setError("No transaction reference found in callback.");
      setLoading(false);
      return;
    }

    async function verify() {
      try {
        const res: any = await apiGet(`/api/v1/bazaar/verify-payment?reference=${encodeURIComponent(reference || "")}`);
        if (res?.data?.booking) {
          const b = res.data.booking;
          setBooking(b);

          // Generate QR Code encoding verification link
          const verifyUrl = `${window.location.origin}/trade-fair/verify?code=${b.ticketCode}`;
          try {
            const qr = await QRCode.toDataURL(verifyUrl, {
              width: 220,
              margin: 1,
              color: {
                dark: "#0f172a", // slate-900
                light: "#ffffff",
              },
            });
            setQrCodeUrl(qr);
          } catch (qrErr) {
            console.error("QR generation error:", qrErr);
          }
        } else {
          setError(res?.message || "Could not verify booking reference.");
        }
      } catch (err: any) {
        console.error("Verification error:", err);
        setError(err?.message || "Failed to verify transaction. Please refresh or contact support.");
      } finally {
        setLoading(false);
      }
    }

    verify();
  }, [reference]);

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-center p-8">
        <Loader2 className="animate-spin text-amber-500 mb-4" size={36} />
        <h2 className="text-xl font-bold text-white mb-1">Verifying Your Booking Payment...</h2>
        <p className="text-xs text-slate-400">Please wait while we confirm your reference: {reference}</p>
      </div>
    );
  }

  if (error || !booking) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-center p-8">
        <AlertTriangle className="text-rose-500 mb-4" size={48} />
        <h2 className="text-2xl font-bold text-white mb-2">Payment Verification Issue</h2>
        <p className="text-sm text-slate-400 max-w-md mb-6">{error || "Unable to confirm booking reference."}</p>
        <Link
          href="/trade-fair/tickets"
          className="px-6 py-3 rounded-xl bg-amber-500 text-slate-950 font-bold text-sm hover:bg-amber-400 transition-colors"
        >
          Return to Tickets Page
        </Link>
      </div>
    );
  }

  const isPaid = booking.paymentStatus === "paid";

  return (
    <div className="max-w-2xl mx-auto px-4 py-16">
      <div className="bg-slate-900 border-2 border-amber-500/40 rounded-3xl p-8 shadow-2xl text-center relative overflow-hidden">
        {/* Ticket Header Pill */}
        <div
          className={`inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-bold border mb-6 ${
            isPaid
              ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
              : "bg-amber-500/10 text-amber-400 border-amber-500/30"
          }`}
        >
          {isPaid ? <CheckCircle2 size={16} /> : <Loader2 size={16} className="animate-spin" />}
          {isPaid ? "Official Entry Pass Confirmed" : "Booking Received • Awaiting Verification"}
        </div>

        <h1 className="text-3xl font-black text-white mb-2">
          GloTrade International Trade Fair Pass
        </h1>
        <p className="text-xs text-slate-400 mb-6">
          1st – 5th December 2026 • Abuja, Nigeria
        </p>

        {/* Email Notification Alert Banner */}
        <div className="bg-amber-500/10 border border-amber-500/30 rounded-2xl p-4 mb-8 flex items-center justify-center gap-3 text-left">
          <Mail className="text-amber-400 shrink-0" size={24} />
          <div>
            <p className="text-sm font-bold text-amber-300">
              {isPaid ? "Confirmation Email Sent!" : "Bank Transfer Verification in Progress"}
            </p>
            <p className="text-xs text-slate-300">
              {isPaid ? (
                <>A copy of your official ticket pass and QR Code has been sent to <span className="font-bold text-white">{booking.customerEmail}</span>.</>
              ) : (
                <>Your booking is registered. Once your bank transfer is verified on WhatsApp by the admin team, your pass status will update to Paid and ticket confirmation will be emailed to <span className="font-bold text-white">{booking.customerEmail}</span>.</>
              )}
            </p>
          </div>
        </div>

        {/* Ticket Box Card */}
        <div className="bg-slate-950 border border-slate-800 rounded-2xl p-6 mb-8 text-left relative overflow-hidden">
          <div className="flex flex-col sm:flex-row items-center justify-between border-b border-slate-800 pb-4 mb-4 gap-4">
            <div>
              <span className="text-[10px] uppercase tracking-wider text-slate-500 font-bold">
                Official Ticket Code
              </span>
              <p className="text-3xl font-mono font-black text-amber-400">
                {booking.ticketCode}
              </p>
            </div>
            <div className="text-right">
              <span className="text-[10px] uppercase tracking-wider text-slate-500 font-bold">
                Payment Status
              </span>
              <p className={`text-sm font-bold uppercase ${isPaid ? "text-emerald-400" : "text-amber-400"}`}>
                {booking.paymentStatus}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 items-center">
            <div className="sm:col-span-2 grid grid-cols-2 gap-4 text-xs">
              <div>
                <span className="text-slate-500">Attendee Name</span>
                <p className="font-bold text-white text-sm mt-0.5">{booking.customerName}</p>
              </div>
              <div>
                <span className="text-slate-500">Package Tier</span>
                <p className="font-bold text-white text-sm mt-0.5">{booking.packageName}</p>
              </div>
              <div>
                <span className="text-slate-500">Email</span>
                <p className="text-slate-300 mt-0.5 truncate">{booking.customerEmail}</p>
              </div>
              <div>
                <span className="text-slate-500">Amount Paid</span>
                <p className="font-bold text-amber-400 text-sm mt-0.5">
                  ₦{booking.amount.toLocaleString("en-NG")}
                </p>
              </div>
              {booking.checkInStatus === "checked_in" && (
                <div className="col-span-2 p-2 bg-teal-500/10 border border-teal-500/30 text-teal-400 rounded-lg text-xs font-bold">
                  ✓ Checked-in at Gate
                </div>
              )}
            </div>

            {/* QR CODE CARD */}
            <div className="flex flex-col items-center justify-center p-3 bg-white rounded-xl border border-slate-800">
              {qrCodeUrl ? (
                <img src={qrCodeUrl} alt="Gate Verification QR Code" className="w-36 h-36 object-contain" />
              ) : (
                <div className="w-36 h-36 bg-slate-100 flex items-center justify-center text-slate-400">
                  <QrIcon size={32} />
                </div>
              )}
              <span className="text-[10px] text-slate-600 font-mono mt-1 font-bold">
                SCAN AT GATE
              </span>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-500">
            <span>Ref: {booking.reference}</span>
            <span className="flex items-center gap-1 text-slate-400">
              <ShieldCheck size={13} className="text-amber-400" /> {booking.paystackReference ? "Paystack Secured" : "GloTrade Verified"}
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <button
            onClick={() => window.print()}
            className="w-full sm:w-auto px-6 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-sm flex items-center justify-center gap-2 border border-slate-700 transition-colors"
          >
            <Printer size={16} /> Print / Save Ticket Pass
          </button>
          <Link
            href="/bazaar"
            className="w-full sm:w-auto px-6 py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-sm transition-colors text-center"
          >
            Return to Bazaar Home
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function CallbackPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      <BazaarNav />
      <main className="flex-1">
        <Suspense fallback={
          <div className="min-h-[60vh] flex items-center justify-center">
            <Loader2 className="animate-spin text-amber-500" size={32} />
          </div>
        }>
          <CallbackContent />
        </Suspense>
      </main>
      <BazaarFooter />
    </div>
  );
}
