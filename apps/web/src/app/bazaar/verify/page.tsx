"use client";
import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import BazaarNav from "@/components/bazaar/BazaarNav";
import BazaarFooter from "@/components/bazaar/BazaarFooter";
import { CheckCircle2, XCircle, ShieldCheck, Ticket, Calendar, MapPin, Loader2, UserCheck, AlertTriangle } from "lucide-react";
import { apiGet, apiPost } from "@/utils/api";

function VerifyContent() {
  const searchParams = useSearchParams();
  let rawCode = searchParams.get("code") || searchParams.get("ticketCode") || searchParams.get("ref") || searchParams.get("reference") || "";

  if (rawCode.includes("code=")) {
    try {
      const urlObj = new URL(rawCode);
      rawCode = urlObj.searchParams.get("code") || rawCode;
    } catch {
      const match = rawCode.match(/code=([^&]+)/);
      if (match) rawCode = match[1];
    }
  }

  const code = rawCode.trim();

  const [booking, setBooking] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Check in action states
  const [checkInLoading, setCheckInLoading] = useState(false);
  const [checkInMsg, setCheckInMsg] = useState<string | null>(null);

  const fetchTicketInfo = async () => {
    if (!code) {
      setError("No Ticket Code or Reference provided.");
      setLoading(false);
      return;
    }

    try {
      const res: any = await apiGet(`/api/v1/bazaar/verify-payment?reference=${encodeURIComponent(code)}`);
      if (res?.data?.booking) {
        setBooking(res.data.booking);
      } else {
        setError(res?.message || "Invalid or unverified ticket code.");
      }
    } catch (err: any) {
      console.error(err);
      setError(err?.message || "Failed to load ticket verification data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTicketInfo();
  }, [code]);

  const handleAdminCheckIn = async () => {
    if (!booking) return;
    setCheckInLoading(true);
    setCheckInMsg(null);
    try {
      const res: any = await apiPost("/api/v1/bazaar/admin/check-in", {
        code: booking.ticketCode,
      });
      if (res?.status === "success") {
        setCheckInMsg(`✓ ${booking.customerName} successfully checked in!`);
        fetchTicketInfo();
      } else {
        setCheckInMsg(res?.message || "Check-in failed.");
      }
    } catch (err: any) {
      setCheckInMsg(err?.message || "Check-in failed. Please login as Admin.");
    } finally {
      setCheckInLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-center p-8">
        <Loader2 className="animate-spin text-amber-500 mb-4" size={36} />
        <h2 className="text-xl font-bold text-white mb-1">Verifying Ticket Code...</h2>
        <p className="text-xs text-slate-400">Checking code: {code}</p>
      </div>
    );
  }

  if (error || !booking) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-center p-8 max-w-md mx-auto">
        <XCircle className="text-rose-500 mb-4 animate-pulse" size={56} />
        <h2 className="text-2xl font-bold text-white mb-2">Invalid or Unpaid Ticket</h2>
        <p className="text-sm text-slate-400 mb-6">{error || "This ticket code could not be verified."}</p>
        <Link
          href="/bazaar"
          className="px-6 py-3 rounded-xl bg-amber-500 text-slate-950 font-bold text-sm hover:bg-amber-400 transition-colors"
        >
          Return to Bazaar Home
        </Link>
      </div>
    );
  }

  const isValidPaid = booking.paymentStatus === "paid";
  const isCheckedIn = booking.checkInStatus === "checked_in";

  return (
    <div className="max-w-xl mx-auto px-4 py-16">
      <div className="bg-slate-900 border-2 border-amber-500/40 rounded-3xl p-8 shadow-2xl text-center relative overflow-hidden">
        {/* Header Status Badge */}
        {isCheckedIn ? (
          <div className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-rose-500/20 text-rose-300 text-xs font-extrabold border border-rose-500/40 mb-6 shadow-lg">
            <XCircle size={16} className="text-rose-400" /> ⛔ ALREADY USED / ENTRY DENIED
          </div>
        ) : isValidPaid ? (
          <div className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-emerald-500/10 text-emerald-400 text-xs font-bold border border-emerald-500/30 mb-6">
            <CheckCircle2 size={16} /> VALID & UNUSED TICKET PASS
          </div>
        ) : (
          <div className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-red-500/10 text-red-400 text-xs font-bold border border-red-500/30 mb-6">
            <AlertTriangle size={16} /> UNPAID / PENDING TICKET
          </div>
        )}

        <h1 className="text-2xl sm:text-3xl font-black text-white mb-1">
          GloTrade International Trade Fair Entrance Verification
        </h1>
        <p className="text-xs text-slate-400 mb-6">
          1st – 5th December 2026 • Abuja, Nigeria
        </p>

        {checkInMsg && (
          <div className="mb-6 p-4 rounded-xl text-sm font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 animate-fadeIn">
            {checkInMsg}
          </div>
        )}

        {/* Details Card */}
        <div className="bg-slate-950 border border-slate-800 rounded-2xl p-6 mb-6 text-left space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div>
              <span className="text-[10px] text-slate-500 font-bold uppercase">Ticket Code</span>
              <p className="text-2xl font-mono font-black text-amber-400">{booking.ticketCode}</p>
            </div>
            <div className="text-right">
              <span className="text-[10px] text-slate-500 font-bold uppercase">Gate Status</span>
              <p className={`text-xs font-extrabold uppercase ${isCheckedIn ? "text-rose-400" : "text-emerald-400"}`}>
                {isCheckedIn ? "USED / CHECKED-IN" : "Unused / Ready for Entry"}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 text-xs">
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
              <p className="text-slate-300 mt-0.5">{booking.customerEmail}</p>
            </div>
            <div>
              <span className="text-slate-500">Amount Paid</span>
              <p className="font-bold text-amber-400 text-sm mt-0.5">
                ₦{booking.amount.toLocaleString("en-NG")}
              </p>
            </div>
          </div>
        </div>

        {/* Gate Admin Action Button */}
        {isValidPaid && !isCheckedIn && (
          <button
            onClick={handleAdminCheckIn}
            disabled={checkInLoading}
            className="w-full py-4 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-slate-950 font-black text-base shadow-xl flex items-center justify-center gap-2 transition-all"
          >
            {checkInLoading ? <Loader2 className="animate-spin" size={20} /> : <UserCheck size={20} />} Confirm Gate Check-In Now
          </button>
        )}

        {isCheckedIn && (
          <div className="p-5 bg-rose-500/10 border-2 border-rose-500/40 text-rose-300 rounded-2xl font-bold text-sm flex flex-col items-center justify-center gap-1 shadow-lg">
            <div className="flex items-center gap-2 text-rose-400 text-base font-black">
              <XCircle size={24} /> ENTRY DENIED — TICKET ALREADY USED
            </div>
            <p className="text-xs text-slate-300 font-normal mt-1 leading-relaxed max-w-md">
              This ticket pass was checked in at <strong className="text-white">{booking.checkInTime ? new Date(booking.checkInTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "earlier"}</strong>. Each ticket can only be scanned and used ONCE for venue entry.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default function VerifyPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      <BazaarNav />
      <main className="flex-1">
        <Suspense fallback={
          <div className="min-h-[60vh] flex items-center justify-center">
            <Loader2 className="animate-spin text-amber-500" size={32} />
          </div>
        }>
          <VerifyContent />
        </Suspense>
      </main>
      <BazaarFooter />
    </div>
  );
}
