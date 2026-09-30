"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import {
  X,
  CheckCircle2,
  CreditCard,
  ShieldCheck,
  Loader2,
  Building2,
  MessageSquare,
  Copy,
  Check,
  AlertTriangle,
  FileText,
  ExternalLink,
  ShieldAlert,
  Ticket,
} from "lucide-react";
import { apiPost, apiGet } from "@/utils/api";
import { translate } from "@/utils/translate";

export interface BookingPackage {
  id: string;
  name: string;
  price: number;
  type: "ticket" | "exhibitor" | "sponsorship";
  summary?: string;
}

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  pkg: BookingPackage | null;
  config?: any;
}

export default function BookingModal({ isOpen, onClose, pkg, config }: BookingModalProps) {
  const [internalConfig, setInternalConfig] = useState<any>(config || null);
  const [paymentMode, setPaymentMode] = useState<"paystack" | "bank_transfer">("bank_transfer");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [businessName, setBusinessName] = useState("");
  const [notes, setNotes] = useState("");
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [termsError, setTermsError] = useState(false);
  const [showTermsModal, setShowTermsModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [transferSubmitted, setTransferSubmitted] = useState<any>(null);
  const [promoterCode, setPromoterCode] = useState("");
  const [promoterStatus, setPromoterStatus] = useState<{
    checking: boolean;
    valid: boolean | null;
    promoterName?: string;
  }>({ checking: false, valid: null });

  const validatePromoter = async (codeToTest: string) => {
    const clean = codeToTest.trim().toUpperCase();
    if (!clean) {
      setPromoterStatus({ checking: false, valid: null });
      return;
    }
    setPromoterStatus({ checking: true, valid: null });
    try {
      const res: any = await apiGet(`/api/v1/bazaar/promoters/validate/${encodeURIComponent(clean)}`);
      if (res?.valid && res?.data) {
        setPromoterStatus({
          checking: false,
          valid: true,
          promoterName: res.data.promoterName,
        });
        if (typeof window !== "undefined") {
          sessionStorage.setItem("bazaar_promoter_ref", clean);
        }
      } else {
        setPromoterStatus({ checking: false, valid: false });
      }
    } catch {
      setPromoterStatus({ checking: false, valid: false });
    }
  };

  useEffect(() => {
    if (config) {
      setInternalConfig(config);
    } else if (isOpen) {
      apiGet("/api/v1/bazaar/config")
        .then((res: any) => {
          if (res?.data) setInternalConfig(res.data);
        })
        .catch(() => {});
    }

    if (isOpen && pkg?.type === "exhibitor") {
      const savedRef =
        typeof window !== "undefined"
          ? sessionStorage.getItem("bazaar_promoter_ref") ||
            new URLSearchParams(window.location.search).get("ref") ||
            ""
          : "";
      if (savedRef && !promoterCode) {
        const cleanRef = savedRef.trim().toUpperCase();
        setPromoterCode(cleanRef);
        validatePromoter(cleanRef);
      }
    }
  }, [config, isOpen, pkg]);

  if (!isOpen || !pkg) return null;

  const activeConfig = config || internalConfig;
  const bankName = activeConfig?.bankName || "Wema Bank";
  const bankAccountName = activeConfig?.bankAccountName || "GloTrade Platform Limited";
  const bankAccountNumber = activeConfig?.bankAccountNumber || "0127131496";
  const rawWhatsapp = (activeConfig?.whatsappNumber || "").replace(/[^0-9]/g, "");
  const whatsappNumber =
    rawWhatsapp && rawWhatsapp !== "2348000000000" && !rawWhatsapp.includes("8000000000")
      ? rawWhatsapp
      : "2347044600924";

  const handleCopyAccount = () => {
    navigator.clipboard.writeText(bankAccountNumber);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleModalClose = () => {
    setName("");
    setEmail("");
    setPhone("");
    setBusinessName("");
    setNotes("");
    setError(null);
    setAcceptedTerms(false);
    setTermsError(false);
    setShowTermsModal(false);
    setTransferSubmitted(null);
    setPaymentMode("bank_transfer");
    onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !phone) {
      setError("Please fill in your name, email, and phone number.");
      return;
    }

    if (!acceptedTerms) {
      setError("Please check the box to agree to the Terms & Conditions and acknowledge the Non-Refundable Policy before proceeding to payment.");
      setTermsError(true);
      return;
    }

    setLoading(true);
    setError(null);
    setTermsError(false);

    try {
      if (pkg.price === 0) {
        const res: any = await apiPost("/api/v1/bazaar/initialize-booking", {
          type: pkg.type,
          packageId: pkg.id,
          packageName: pkg.name,
          amount: 0,
          customerName: name,
          customerEmail: email,
          customerPhone: phone,
          businessName,
          notes,
          returnUrl: `${window.location.origin}/bazaar/callback`,
        });

        const ref = res?.data?.booking?.reference || res?.data?.reference;
        if (ref) {
          window.location.href = `/bazaar/callback?reference=${encodeURIComponent(ref)}`;
          return;
        } else {
          setError(res?.message || "Failed to generate free admission pass. Please try again.");
          setLoading(false);
          return;
        }
      }

      const cleanPromoterCode =
        pkg.type === "exhibitor" && promoterCode.trim() ? promoterCode.trim().toUpperCase() : undefined;

      if (paymentMode === "paystack") {
        const res: any = await apiPost("/api/v1/bazaar/initialize-booking", {
          type: pkg.type,
          packageId: pkg.id,
          packageName: pkg.name,
          amount: pkg.price,
          customerName: name,
          customerEmail: email,
          customerPhone: phone,
          businessName,
          notes,
          promoterCode: cleanPromoterCode,
          returnUrl: `${window.location.origin}/bazaar/callback`,
        });

        if (res?.data?.authorizationUrl) {
          window.location.href = res.data.authorizationUrl;
        } else if (res?.data?.free || pkg.price === 0) {
          window.location.href = `/bazaar/callback?reference=${res.data.reference}`;
        } else {
          setError(res?.message || "Failed to initialize Paystack payment. Please try again.");
          setLoading(false);
        }
      } else {
        // Manual Bank Transfer / WhatsApp
        const transferNotes = `[Manual Bank Transfer Enquiry] ${notes}`.trim();
        const res: any = await apiPost("/api/v1/bazaar/initialize-booking", {
          type: pkg.type,
          packageId: pkg.id,
          packageName: pkg.name,
          amount: pkg.price,
          customerName: name,
          customerEmail: email,
          customerPhone: phone,
          businessName,
          notes: transferNotes,
          paymentMethod: "bank_transfer",
          isManualBankTransfer: true,
          promoterCode: cleanPromoterCode,
        });

        const bookingRef = res?.data?.booking?.reference || res?.data?.reference || "GTB-REF";
        const ticketCode = res?.data?.booking?.ticketCode || res?.data?.ticketCode || "";

        // Build WhatsApp pre-filled text
        const notesLine = notes?.trim() ? `\n- Special Requests / Notes: ${notes.trim()}` : "";
        const promoterLine = cleanPromoterCode ? `\n- Promoter Referral Code: ${cleanPromoterCode}` : "";
        const waMsg = `Hi GloTrade Trade Fair Team, I have made a bank transfer of NGN ${pkg.price.toLocaleString("en-NG")} for my booking:
- Package: ${pkg.name}
- Name: ${name}
- Email: ${email}
- Phone: ${phone}
${businessName ? `- Business: ${businessName}\n` : ""}- Ref: ${bookingRef}${ticketCode ? `\n- Ticket Code: ${ticketCode}` : ""}${promoterLine}${notesLine}

Please verify my payment and send my ticket confirmation email.`;

        const waUrl = `https://wa.me/${whatsappNumber.replace(/[^0-9]/g, "")}?text=${encodeURIComponent(waMsg)}`;

        setTransferSubmitted({
          bookingRef,
          ticketCode,
          waUrl,
        });
        setLoading(false);

        // Open WhatsApp in new tab
        window.open(waUrl, "_blank");
      }
    } catch (err: any) {
      console.error("Booking error:", err);
      setError(err?.message || "Booking submission failed. Please check network.");
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
      <div className="bg-slate-900 border border-amber-500/30 rounded-2xl max-w-lg w-full p-6 text-white shadow-2xl relative overflow-hidden max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-4">
          <div>
            <span className="text-xs uppercase font-bold text-amber-400 tracking-wider">
              {pkg.type === "ticket"
                ? translate("bazaar.modalTicketCheckout") || "Ticket Checkout"
                : pkg.type === "exhibitor"
                  ? translate("bazaar.modalExhibitorApp") || "Exhibitor Stall Application"
                  : translate("bazaar.modalSponsorshipReg") || "Sponsorship Registration"}
            </span>
            <h2 className="text-xl font-bold text-white mt-1">{pkg.name}</h2>
          </div>
          <button
            onClick={handleModalClose}
            className="p-1.5 rounded-full text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {transferSubmitted ? (
          /* Success Screen for Manual Bank Transfer */
          <div className="text-center py-6 space-y-4">
            <div className="w-16 h-16 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle2 size={36} />
            </div>

            <h3 className="text-xl font-bold text-white">Transfer Details Registered!</h3>

            <p className="text-sm text-slate-300 max-w-sm mx-auto leading-relaxed">
              We have logged your booking under reference <span className="text-amber-400 font-mono font-bold">{transferSubmitted.bookingRef}</span>.
            </p>

            <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-4 text-left space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-400">Package:</span>
                <span className="font-bold text-white">{pkg.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Total Payable:</span>
                <span className="font-bold text-amber-400">₦{pkg.price.toLocaleString("en-NG")}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Status:</span>
                <span className="font-bold text-amber-400 uppercase">Pending Bank Verification</span>
              </div>
              {notes?.trim() && (
                <div className="flex justify-between gap-3 pt-1 border-t border-slate-800/80">
                  <span className="text-slate-400 shrink-0">Special Requests:</span>
                  <span className="text-slate-200 text-right break-words">{notes.trim()}</span>
                </div>
              )}
            </div>

            <p className="text-xs text-slate-400">
              Once our team confirms your bank transfer on WhatsApp, your official ticket code and ticket pass will be emailed to <strong className="text-slate-200">{email}</strong>.
            </p>

            <div className="pt-2 flex flex-col sm:flex-row gap-3">
              <a
                href={transferSubmitted.waUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm rounded-xl flex items-center justify-center gap-2 shadow-lg"
              >
                <MessageSquare size={16} /> Open WhatsApp Chat (+234 704 460 0924)
              </a>
              <button
                onClick={handleModalClose}
                className="py-3 px-6 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-sm rounded-xl"
              >
                Close
              </button>
            </div>
          </div>
        ) : (
          <>
            {pkg.price === 0 ? (
              /* Free Admission Summary Box */
              <div className="bg-gradient-to-r from-emerald-950/70 via-slate-900 to-emerald-950/70 border border-emerald-500/40 rounded-2xl p-5 mb-5 flex items-center justify-between shadow-lg shadow-emerald-500/10">
                <div>
                  <span className="text-[10px] uppercase font-bold text-emerald-400 tracking-wider block">
                    Admission Tariff
                  </span>
                  <p className="text-2xl font-black text-emerald-400 mt-0.5">
                    100% FREE ENTRY
                  </p>
                  <p className="text-xs text-slate-300 mt-1">
                    Free Gate Pass · Dec 1–5, 2026 at NACCAS Asokoro, Abuja
                  </p>
                </div>
                <div className="text-right">
                  <span className="inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                    <CheckCircle2 size={14} /> Instant QR Pass
                  </span>
                </div>
              </div>
            ) : (
              <>
                {/* Payment Method Selector Tabs */}
                <div className="grid grid-cols-2 gap-2 mb-4 p-1 bg-slate-950/80 border border-slate-800 rounded-xl">
                  <button
                    type="button"
                    onClick={() => setPaymentMode("bank_transfer")}
                    className={`py-2.5 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2 ${paymentMode === "bank_transfer"
                      ? "bg-amber-500 text-slate-950 shadow-md"
                      : "text-slate-400 hover:text-white"
                      }`}
                  >
                    <Building2 size={15} /> Bank Transfer / WhatsApp
                  </button>
                  <button
                    type="button"
                    disabled
                    className="py-2.5 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 opacity-60 cursor-not-allowed text-slate-400 border border-slate-800/40 select-none"
                    title="Instant Card / Paystack is coming soon"
                  >
                    <CreditCard size={15} />
                    <span>Instant Card</span>
                    <span className="text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                      Coming Soon
                    </span>
                  </button>
                </div>

                {/* Package summary card */}
                <div className="bg-slate-950/60 border border-amber-500/20 rounded-xl p-4 mb-4 flex items-center justify-between">
                  <div>
                    <p className="text-xs text-slate-400">{translate("bazaar.totalPayable") || "Total Payable Amount"}</p>
                    <p className="text-2xl font-black text-amber-400">
                      ₦{pkg.price.toLocaleString("en-NG")}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/30">
                      {paymentMode === "paystack" ? (
                        <>
                          <ShieldCheck size={13} /> {translate("bazaar.securedPaystack") || "Secured by Paystack"}
                        </>
                      ) : (
                        <>
                          <Building2 size={13} /> Direct Bank Transfer
                        </>
                      )}
                    </span>
                  </div>
                </div>

                {paymentMode === "bank_transfer" && (
                  /* Bank Transfer Details Box */
                  <div className="bg-slate-950 border border-amber-500/40 rounded-xl p-4 mb-4 space-y-2 text-xs">
                    <div className="flex items-center justify-between border-b border-slate-800 pb-2 mb-2">
                      <span className="font-bold text-amber-400 flex items-center gap-1.5">
                        <Building2 size={14} /> Official GloTrade Bank Account
                      </span>
                      <span className="text-[10px] text-slate-400">Nigeria</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Bank Name:</span>
                      <span className="font-bold text-white">{bankName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Account Name:</span>
                      <span className="font-bold text-white">{bankAccountName}</span>
                    </div>
                    <div className="flex justify-between items-center bg-slate-900 p-2 rounded-lg border border-slate-800">
                      <div>
                        <span className="text-[10px] text-slate-400 block">Account Number:</span>
                        <span className="font-mono text-base font-black text-amber-400">{bankAccountNumber}</span>
                      </div>
                      <button
                        type="button"
                        onClick={handleCopyAccount}
                        className="px-2.5 py-1 rounded bg-amber-500/20 hover:bg-amber-500/30 text-amber-400 font-bold text-[11px] flex items-center gap-1"
                      >
                        {copied ? <Check size={12} /> : <Copy size={12} />} {copied ? "Copied" : "Copy"}
                      </button>
                    </div>
                    <p className="text-[11px] text-slate-400 italic pt-1">
                      Make your transfer for ₦{pkg.price.toLocaleString("en-NG")}, fill in your info below and submit to notify our admin team via WhatsApp for instant ticket issuance.
                    </p>
                  </div>
                )}
              </>
            )}

            {error && (
              <div className="p-3 mb-4 text-xs bg-red-500/15 border border-red-500/40 text-red-300 rounded-xl flex items-start gap-2 animate-fadeIn">
                <AlertTriangle size={16} className="text-red-400 shrink-0 mt-0.5" />
                <div className="flex-1">{error}</div>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  {translate("bazaar.yourNameLabel") || "Full Name *"}
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Samuel Okon"
                  className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    {translate("bazaar.emailAddressLabel") || "Email Address *"}
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@domain.com"
                    className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    {translate("bazaar.phoneNumberLabel") || "Phone Number *"}
                  </label>
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+234 803 123 4567"
                    className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none"
                  />
                </div>
              </div>

              {(pkg.type === "exhibitor" || pkg.type === "sponsorship") && (
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    {translate("bazaar.companyBusinessName") || "Company / Business Name"}
                  </label>
                  <input
                    type="text"
                    value={businessName}
                    onChange={(e) => setBusinessName(e.target.value)}
                    placeholder="e.g. AfriCrafts Ltd"
                    className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none"
                  />
                </div>
              )}

              {pkg.type === "exhibitor" && (
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-medium text-slate-300">
                      Promoter / Referral Code <span className="text-slate-500 font-normal">(Optional)</span>
                    </label>
                    {promoterStatus.valid === true && (
                      <span className="text-[11px] font-semibold text-emerald-400 flex items-center gap-1">
                        <CheckCircle2 size={12} /> Partner: {promoterStatus.promoterName}
                      </span>
                    )}
                    {promoterStatus.valid === false && promoterCode.trim().length > 0 && (
                      <span className="text-[11px] font-semibold text-amber-400">
                        Invalid promoter code
                      </span>
                    )}
                  </div>
                  <div className="relative">
                    <input
                      type="text"
                      value={promoterCode}
                      onChange={(e) => {
                        const val = e.target.value.toUpperCase();
                        setPromoterCode(val);
                        validatePromoter(val);
                      }}
                      placeholder="e.g. TF-PROMO-A92B"
                      className={`w-full bg-slate-950 border ${
                        promoterStatus.valid === true
                          ? "border-emerald-500/80 ring-1 ring-emerald-500/30"
                          : promoterStatus.valid === false && promoterCode.trim().length > 0
                          ? "border-amber-500/60"
                          : "border-slate-800 focus:border-amber-500"
                      } rounded-xl px-4 py-2.5 text-sm font-mono text-white focus:outline-none uppercase`}
                    />
                    {promoterStatus.checking && (
                      <div className="absolute right-3 top-3">
                        <Loader2 size={16} className="animate-spin text-amber-400" />
                      </div>
                    )}
                  </div>
                  <p className="text-[10px] text-slate-400 mt-1">
                    If you were referred to book a stall by an official trade fair promoter or brand ambassador, enter their code.
                  </p>
                </div>
              )}

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  {translate("bazaar.specialRequestsNotes") || "Special Requests / Notes"}
                </label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Any special notes or requirements..."
                  className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500 rounded-xl px-4 py-2 text-sm text-white focus:outline-none"
                />
              </div>

              {/* Non-Refundable Policy & Terms Acceptance Box */}
              <div
                className={`p-3.5 rounded-xl border transition-all text-xs ${
                  termsError
                    ? "bg-red-950/30 border-red-500/80 ring-2 ring-red-500/30"
                    : acceptedTerms
                    ? "bg-amber-500/5 border-amber-500/40"
                    : "bg-slate-950 border-slate-800 hover:border-slate-700"
                }`}
              >
                <div className="flex items-start gap-3">
                  <input
                    type="checkbox"
                    id="bazaar-terms-agreement"
                    checked={acceptedTerms}
                    onChange={(e) => {
                      setAcceptedTerms(e.target.checked);
                      if (e.target.checked) {
                        setTermsError(false);
                        if (error?.includes("Terms")) {
                          setError(null);
                        }
                      }
                    }}
                    className="mt-1 h-4 w-4 rounded border-slate-700 bg-slate-900 text-amber-500 focus:ring-amber-400 focus:ring-offset-slate-950 cursor-pointer accent-amber-500 shrink-0"
                  />
                  <label htmlFor="bazaar-terms-agreement" className="text-slate-300 select-none cursor-pointer leading-relaxed">
                    <span>
                      I agree to the{" "}
                      <button
                        type="button"
                        onClick={() => setShowTermsModal(true)}
                        className="text-amber-400 font-bold underline hover:text-amber-300 inline-flex items-center gap-0.5"
                      >
                        Terms &amp; Event Guidelines
                      </button>{" "}
                      {pkg.price === 0 ? (
                        <span>and agree to abide by the event venue safety and admission protocols.</span>
                      ) : (
                        <span>
                          and acknowledge that all ticket, booth, and sponsorship payments are{" "}
                          <strong className="text-amber-400 font-bold underline">strictly non-refundable</strong> after payment.
                        </span>
                      )}
                    </span>
                  </label>
                </div>

                {termsError && (
                  <p className="text-[11px] text-red-400 font-semibold mt-2 pl-7 flex items-center gap-1">
                    <AlertTriangle size={12} className="shrink-0" />
                    Please check the box above to accept the event terms before proceeding.
                  </p>
                )}
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className={`w-full py-4 px-6 rounded-xl font-bold text-base shadow-lg flex items-center justify-center gap-2 transition-all hover:scale-[1.02] disabled:opacity-50 ${
                    pkg.price === 0
                      ? "bg-gradient-to-r from-emerald-500 via-emerald-400 to-amber-400 hover:from-emerald-400 hover:to-amber-300 text-slate-950 shadow-emerald-500/20"
                      : "bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-slate-950 shadow-amber-500/20"
                  }`}
                >
                  {loading ? (
                    <>
                      <Loader2 className="animate-spin" size={18} />
                      {pkg.price === 0 ? "Generating Free Pass..." : "Processing..."}
                    </>
                  ) : pkg.price === 0 ? (
                    <>
                      <Ticket size={18} /> Claim Free Entry Pass
                    </>
                  ) : paymentMode === "paystack" ? (
                    <>
                      <CreditCard size={18} /> {translate("bazaar.payViaPaystack", { amount: pkg.price.toLocaleString("en-NG") }) || `Pay ₦${pkg.price.toLocaleString("en-NG")} via Paystack`}
                    </>
                  ) : (
                    <>
                      <MessageSquare size={18} /> Submit &amp; Verify Payment on WhatsApp
                    </>
                  )}
                </button>
              </div>
            </form>

            <p className="text-[11px] text-slate-500 text-center mt-3">
              {pkg.price === 0
                ? "Your free digital ticket pass with unique QR Code will be issued immediately upon registration."
                : paymentMode === "paystack"
                ? translate("bazaar.paystackRedirectDisclaimer") || "By clicking pay, you will be securely redirected to Paystack to complete your payment."
                : "Your registration will be submitted to the admin team and verified via WhatsApp for email ticket issuance."}
            </p>
          </>
        )}

        {/* In-Modal Terms & Conditions Summary Drawer */}
        {showTermsModal && (
          <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-md animate-fadeIn">
            <div className="bg-slate-900 border border-amber-500/40 rounded-2xl max-w-lg w-full p-6 text-white shadow-2xl relative max-h-[85vh] overflow-y-auto space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <ShieldAlert className="text-amber-400" size={20} />
                  <h3 className="text-lg font-bold text-white">Event Policy & Terms</h3>
                </div>
                <button
                  type="button"
                  onClick={() => setShowTermsModal(false)}
                  className="p-1 rounded-full text-slate-400 hover:text-white hover:bg-slate-800"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Policy Highlights */}
              <div className="p-3.5 rounded-xl bg-red-950/40 border border-amber-500/50 text-xs text-slate-200 space-y-1.5">
                <span className="font-black text-amber-400 uppercase tracking-wider block">
                  ⚠️ Non-Refundable Policy
                </span>
                <p>
                  All payments made for GloTrade International Trade Fair passes, exhibitor booths, and sponsorship packages are <strong>final and strictly non-refundable</strong> once confirmed. No refunds or partial refunds will be given under any circumstance.
                </p>
              </div>

              <div className="space-y-3 text-xs text-slate-300 leading-relaxed">
                <div>
                  <h4 className="font-bold text-white mb-1">1. Ticket & Admittance Rules</h4>
                  <p>Each pass code is valid for the designated admission tier (or delegation table). Attendees must present the valid digital QR code or email pass at the event gate.</p>
                </div>
                <div>
                  <h4 className="font-bold text-white mb-1">2. Ticket Transferability</h4>
                  <p>Tickets are transferable to another guest by providing the original ticket code/email pass, but cannot be returned for monetary refund.</p>
                </div>
                <div>
                  <h4 className="font-bold text-white mb-1">3. Exhibitor & Sponsor Commitments</h4>
                  <p>Vendor stall spaces and sponsorship deliverables are locked and allocated immediately upon payment confirmation.</p>
                </div>
                <div>
                  <h4 className="font-bold text-white mb-1">4. Rescheduling / Force Majeure</h4>
                  <p>If the event is rescheduled due to unforeseen conditions, passes and stall reservations will automatically remain valid for the new date.</p>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-800 flex items-center justify-between gap-3">
                <Link
                  href="/bazaar/terms"
                  target="_blank"
                  className="text-xs text-amber-400 hover:text-amber-300 font-semibold underline flex items-center gap-1"
                >
                  <FileText size={13} /> View Full Terms Page <ExternalLink size={11} />
                </Link>
                <button
                  type="button"
                  onClick={() => {
                    setAcceptedTerms(true);
                    setTermsError(false);
                    setError(null);
                    setShowTermsModal(false);
                  }}
                  className="py-2 px-4 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 shadow-md"
                >
                  <Check size={14} /> I Understand & Accept
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

