"use client";

import { useState, useEffect } from "react";
import BazaarNav from "@/components/bazaar/BazaarNav";
import BazaarFooter from "@/components/bazaar/BazaarFooter";
import Link from "next/link";
import {
  TrendingUp,
  Award,
  Users,
  DollarSign,
  Share2,
  Copy,
  Check,
  ExternalLink,
  ShieldCheck,
  Building2,
  Sparkles,
  ArrowRight,
  HelpCircle,
  ChevronDown,
  Loader2,
  CheckCircle2,
  AlertTriangle,
  Lock,
  LogOut,
  Calendar,
  Store,
  RefreshCw,
  Wallet,
  ShieldAlert,
} from "lucide-react";
import { apiGet, apiPost } from "@/utils/api";

interface PromoterData {
  id: string;
  promoterCode: string;
  name: string;
  email: string;
  phone: string;
  bankDetails: {
    bankName: string;
    accountNumber: string;
    accountName: string;
  };
  status: "active" | "suspended";
  stats: {
    totalReferredExhibitors: number;
    paidExhibitors: number;
    totalBookingValue: number;
    totalCommissionEarned: number;
    totalCommissionPaid: number;
    pendingCommission: number;
  };
  payouts?: Array<{
    amount: number;
    reference: string;
    paidAt: string;
    notes?: string;
  }>;
}

interface ReferredBooking {
  reference: string;
  ticketCode: string;
  businessName?: string;
  customerName: string;
  packageName: string;
  amount: number;
  paymentStatus: "pending" | "paid" | "failed";
  promoterCommissionPercent: number;
  promoterCommissionAmount: number;
  promoterCommissionStatus?: "pending" | "approved" | "paid" | "cancelled";
  createdAt: string;
}

export default function PromoterPage() {
  const [activeTab, setActiveTab] = useState<"register" | "dashboard">("register");
  const [token, setToken] = useState<string | null>(null);
  const [promoter, setPromoter] = useState<PromoterData | null>(null);
  const [bookings, setBookings] = useState<ReferredBooking[]>([]);
  const [commissionRate, setCommissionRate] = useState<number>(5);
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [isSuspended, setIsSuspended] = useState(false);
  const [suspendedMsg, setSuspendedMsg] = useState<string | null>(null);

  // Registration Form State
  const [regName, setRegName] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regPhone, setRegPhone] = useState("");
  const [regBankName, setRegBankName] = useState("");
  const [regAccountNumber, setRegAccountNumber] = useState("");
  const [regAccountName, setRegAccountName] = useState("");
  const [regPin, setRegPin] = useState("");
  const [regLoading, setRegLoading] = useState(false);
  const [regError, setRegError] = useState<string | null>(null);

  // Login Form State
  const [loginId, setLoginId] = useState("");
  const [loginPin, setLoginPin] = useState("");
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);

  // Dashboard Refresh State
  const [refreshing, setRefreshing] = useState(false);

  // Calculator State
  const [calcTier, setCalcTier] = useState<number>(750000); // Default Gold
  const [calcQty, setCalcQty] = useState<number>(2);

  // Read saved session
  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedToken = localStorage.getItem("bazaar_promoter_token");
      if (savedToken) {
        setToken(savedToken);
        setActiveTab("dashboard");
        fetchDashboard(savedToken);
      } else {
        // Fetch public config to get commission %
        apiGet("/api/v1/bazaar/config")
          .then((res: any) => {
            if (res?.data?.promoterCommissionPercent) {
              setCommissionRate(res.data.promoterCommissionPercent);
            }
          })
          .catch(() => {});
      }
    }
  }, []);

  const fetchDashboard = async (authToken: string) => {
    setRefreshing(true);
    try {
      const res: any = await apiGet("/api/v1/bazaar/promoters/me", {
        headers: { Authorization: `Bearer ${authToken}` },
      });
      if (res?.status === "success" && res?.data) {
        setPromoter(res.data.promoter);
        setBookings(res.data.bookings || []);
        setIsSuspended(false);
        setSuspendedMsg(null);
        if (res.data.commissionPercent) {
          setCommissionRate(res.data.commissionPercent);
        }
      } else if (res?.suspended) {
        // Account is suspended — show warning, do NOT log out (preserve token for reference)
        setIsSuspended(true);
        setSuspendedMsg(res?.message || "Your account has been suspended.");
        setActiveTab("dashboard");
      } else {
        // Token truly expired / invalid
        handleLogout();
      }
    } catch (err: any) {
      if (err?.suspended || err?.status === 403) {
        setIsSuspended(true);
        setSuspendedMsg(err?.message || "Your promoter account has been suspended.");
        setActiveTab("dashboard");
      } else {
        handleLogout();
      }
    } finally {
      setRefreshing(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setRegError(null);

    if (regPin.length < 4 || regPin.length > 8) {
      setRegError("Security PIN must be between 4 and 8 digits.");
      return;
    }

    setRegLoading(true);
    try {
      const res: any = await apiPost("/api/v1/bazaar/promoters/register", {
        name: regName,
        email: regEmail,
        phone: regPhone,
        bankName: regBankName,
        accountNumber: regAccountNumber,
        accountName: regAccountName,
        pin: regPin,
      });

      if (res?.status === "success" && res?.data) {
        const receivedToken = res.data.token;
        setToken(receivedToken);
        setPromoter(res.data.promoter);
        if (typeof window !== "undefined") {
          localStorage.setItem("bazaar_promoter_token", receivedToken);
        }
        setActiveTab("dashboard");
        fetchDashboard(receivedToken);
      } else {
        setRegError(res?.message || "Registration failed. Please check your information.");
      }
    } catch (err: any) {
      setRegError(err?.message || "Registration failed. Please verify your details.");
    } finally {
      setRegLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);
    setLoginLoading(true);

    try {
      const res: any = await apiPost("/api/v1/bazaar/promoters/login", {
        identifier: loginId,
        pin: loginPin,
      });

      if (res?.status === "success" && res?.data) {
        const receivedToken = res.data.token;
        setToken(receivedToken);
        setPromoter(res.data.promoter);
        if (typeof window !== "undefined") {
          localStorage.setItem("bazaar_promoter_token", receivedToken);
        }
        setActiveTab("dashboard");
        fetchDashboard(receivedToken);
      } else {
        setLoginError(res?.message || "Login failed. Please check your credentials.");
      }
    } catch (err: any) {
      setLoginError(err?.message || "Invalid credentials. Please verify your code/email and PIN.");
    } finally {
      setLoginLoading(false);
    }
  };

  const handleLogout = () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("bazaar_promoter_token");
    }
    setToken(null);
    setPromoter(null);
    setBookings([]);
    setActiveTab("register");
  };

  const promoterCode = promoter?.promoterCode || "PROMO-CODE";
  const baseUrl = typeof window !== "undefined" ? window.location.origin : "https://glotrade.online";
  const referralLink = `${baseUrl}/trade-fair/exhibitors?ref=${promoterCode}`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(referralLink);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(promoterCode);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const whatsappMessage = `Hello! Register for an Exhibition Stall at the GloTrade International Trade Fair 2026 (Abuja, Dec 1-5) using my official partner referral link to showcase your products to 10,000+ trade buyers:\n\n${referralLink}\n\nOr use my Partner Code at checkout: ${promoterCode}`;
  const whatsappShareUrl = `https://wa.me/?text=${encodeURIComponent(whatsappMessage)}`;

  const faqs = [
    {
      q: "How does the Trade Fair Promoter Program work?",
      a: `When you register as an official GloTrade Trade Fair Promoter, you receive a unique referral link and code. Share this link with manufacturers, wholesalers, SMEs, and commercial brands. When they book an exhibition stall using your link or code, you earn ${commissionRate}% commission on their booking total.`,
    },
    {
      q: "When and how are commissions paid out?",
      a: "Commissions are credited to your pending balance as soon as the exhibitor completes their payment (online via Paystack or approved bank transfer). The secretariat processes commission payouts directly to the Nigerian bank account you provide during registration.",
    },
    {
      q: "Which exhibitor tiers qualify for promoter commission?",
      a: "All commercial exhibition tiers qualify! From Micro Enterprise (₦150k) up to Executive Gold (₦750k), Diamond (₦1.5m), and Country Pavilions (₦2.5m). You earn a percentage on every stall booked.",
    },
    {
      q: "How do I ensure an exhibitor is credited to my code?",
      a: "When an exhibitor clicks your unique link, your referral code is automatically saved in their session and pre-filled in their stall booking form. They can also manually type your Partner Code into the 'Promoter / Referral Code' field during booking.",
    },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-amber-500 selection:text-slate-950">
      <BazaarNav />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative overflow-hidden py-16 lg:py-24 bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 border-b border-slate-800">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[350px] bg-amber-500/10 blur-[130px] rounded-full pointer-events-none" />

          <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
            <span className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-amber-400 bg-amber-500/10 px-4 py-2 rounded-full border border-amber-500/30 mb-6 shadow-sm">
              <Sparkles size={14} /> Official GloTrade Partner &amp; Promoter Program
            </span>

            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black text-white tracking-tight leading-tight mb-6">
              Empower Exhibitors. <br />
              <span className="bg-gradient-to-r from-amber-400 via-amber-300 to-amber-500 bg-clip-text text-transparent">
                Earn Substantial Commissions.
              </span>
            </h1>

            <p className="text-slate-300 text-lg sm:text-xl max-w-3xl mx-auto leading-relaxed mb-8">
              Partner with the <strong>GloTrade International Trade Fair 2026</strong>. Refer manufacturers, artisans, and commercial enterprises to book exhibition stalls and earn <strong className="text-amber-400">{commissionRate}% commission</strong> on every verified booth booking.
            </p>

            {/* Program Key Metrics Pill Bar */}
            <div className="inline-flex flex-wrap items-center justify-center gap-6 sm:gap-8 bg-slate-900/90 border border-amber-500/30 rounded-2xl p-4 sm:px-8 sm:py-4 shadow-2xl backdrop-blur-md text-xs sm:text-sm font-semibold">
              <div className="flex items-center gap-2 text-slate-200">
                <DollarSign className="text-emerald-400 shrink-0" size={18} />
                <span>{commissionRate}% Fixed Stall Commission</span>
              </div>
              <div className="hidden sm:block w-px h-5 bg-slate-700" />
              <div className="flex items-center gap-2 text-slate-200">
                <Store className="text-amber-400 shrink-0" size={18} />
                <span>₦7,500 – ₦125,000 Earned Per Stall</span>
              </div>
              <div className="hidden sm:block w-px h-5 bg-slate-700" />
              <div className="flex items-center gap-2 text-slate-200">
                <Wallet className="text-blue-400 shrink-0" size={18} />
                <span>Direct Bank Payouts</span>
              </div>
            </div>
          </div>
        </section>

        {/* Live Commission Potential Calculator */}
        <section className="py-12 bg-slate-900/60 border-b border-slate-800">
          <div className="max-w-4xl mx-auto px-4 sm:px-6">
            <div className="bg-gradient-to-br from-slate-900 to-slate-950 border border-amber-500/30 rounded-3xl p-6 sm:p-8 shadow-xl">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-slate-800 pb-6 mb-6">
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-amber-400 block mb-1">
                    Earnings Estimator
                  </span>
                  <h3 className="text-xl sm:text-2xl font-black text-white">
                    Calculate Your Commission Potential
                  </h3>
                </div>
                <div className="text-right">
                  <span className="text-xs text-slate-400 block">Estimated Earnings</span>
                  <span className="text-2xl sm:text-3xl font-black text-emerald-400 font-mono">
                    ₦{Math.round(((calcTier * calcQty * commissionRate) / 100)).toLocaleString("en-NG")}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-2">
                    Select Stall Tier
                  </label>
                  <select
                    value={calcTier}
                    onChange={(e) => setCalcTier(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500 rounded-xl px-4 py-3 text-sm text-white focus:outline-none"
                  >
                    <option value={150000}>Micro Enterprise (7.5 sqm) — ₦150,000</option>
                    <option value={250000}>Small Scale Enterprise (15 sqm) — ₦250,000</option>
                    <option value={375000}>Bronze Membership (22.5 sqm) — ₦375,000</option>
                    <option value={500000}>Silver Membership (30 sqm) — ₦500,000</option>
                    <option value={750000}>Gold Membership (60 sqm) — ₦750,000</option>
                    <option value={1500000}>Diamond Pavilion (100 sqm) — ₦1,500,000</option>
                    <option value={2500000}>Platinum Sovereign Pavilion — ₦2,500,000</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-2">
                    Number of Stalls Referred: <span className="text-amber-400 font-bold">{calcQty}</span>
                  </label>
                  <input
                    type="range"
                    min={1}
                    max={20}
                    value={calcQty}
                    onChange={(e) => setCalcQty(Number(e.target.value))}
                    className="w-full accent-amber-500 cursor-pointer mt-3"
                  />
                  <div className="flex justify-between text-[11px] text-slate-500 mt-1">
                    <span>1 Stall</span>
                    <span>10 Stalls</span>
                    <span>20 Stalls</span>
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
                <span>
                  Rate: <strong>{commissionRate}%</strong> · Example: Refer {calcQty} stall(s) at ₦{calcTier.toLocaleString("en-NG")} = <strong>₦{Math.round(((calcTier * calcQty * commissionRate) / 100)).toLocaleString("en-NG")}</strong> cash payout.
                </span>
                <span className="text-emerald-400 font-bold">Paid to Your Bank</span>
              </div>
            </div>
          </div>
        </section>

        {/* Portal Interactive Section: Register vs Dashboard */}
        <section className="py-16">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* Nav Tabs */}
            <div className="flex justify-center mb-10">
              <div className="inline-flex p-1.5 bg-slate-900 border border-slate-800 rounded-2xl">
                {!token ? (
                  <>
                    <button
                      type="button"
                      onClick={() => setActiveTab("register")}
                      className={`px-6 py-3 rounded-xl text-sm font-bold transition-all ${
                        activeTab === "register"
                          ? "bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 shadow-lg"
                          : "text-slate-400 hover:text-white"
                      }`}
                    >
                      Join as Promoter
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveTab("dashboard")}
                      className={`px-6 py-3 rounded-xl text-sm font-bold transition-all ${
                        activeTab === "dashboard"
                          ? "bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 shadow-lg"
                          : "text-slate-400 hover:text-white"
                      }`}
                    >
                      Promoter Login
                    </button>
                  </>
                ) : (
                  <div className="flex items-center gap-3 px-4 py-2">
                    <span className="text-xs font-bold text-amber-400 flex items-center gap-1.5">
                      <ShieldCheck size={16} /> Authenticated: {promoter?.name} ({promoter?.promoterCode})
                    </span>
                    <button
                      type="button"
                      onClick={handleLogout}
                      className="text-xs text-slate-400 hover:text-red-400 flex items-center gap-1 ml-4 border-l border-slate-700 pl-4 py-1"
                    >
                      <LogOut size={13} /> Exit
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* TAB 1: REGISTRATION */}
            {activeTab === "register" && !token && (
              <div className="bg-slate-900 border border-amber-500/30 rounded-3xl p-6 sm:p-10 shadow-2xl relative overflow-hidden animate-fadeIn">
                <div className="max-w-2xl mx-auto">
                  <div className="text-center mb-8">
                    <span className="text-xs uppercase font-bold text-amber-400 tracking-wider block mb-2">
                      Instant Onboarding
                    </span>
                    <h2 className="text-2xl sm:text-3xl font-black text-white">
                      Register as a Trade Fair Promoter
                    </h2>
                    <p className="text-slate-400 text-sm mt-2">
                      Get your unique referral link immediately. Provide your payout bank details so commissions are credited directly.
                    </p>
                  </div>

                  {regError && (
                    <div className="p-4 mb-6 bg-red-500/15 border border-red-500/40 text-red-300 rounded-2xl flex items-start gap-3 animate-fadeIn text-sm">
                      <AlertTriangle size={18} className="text-red-400 shrink-0 mt-0.5" />
                      <div>{regError}</div>
                    </div>
                  )}

                  <form onSubmit={handleRegister} className="space-y-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">
                        Full Name / Personal Name *
                      </label>
                      <input
                        type="text"
                        required
                        value={regName}
                        onChange={(e) => setRegName(e.target.value)}
                        placeholder="e.g. Adebayo Ibrahim"
                        className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500 rounded-xl px-4 py-3 text-sm text-white focus:outline-none"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-slate-300 mb-1">
                          Email Address *
                        </label>
                        <input
                          type="email"
                          required
                          value={regEmail}
                          onChange={(e) => setRegEmail(e.target.value)}
                          placeholder="adebayo@example.com"
                          className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500 rounded-xl px-4 py-3 text-sm text-white focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-300 mb-1">
                          Phone Number (WhatsApp) *
                        </label>
                        <input
                          type="tel"
                          required
                          value={regPhone}
                          onChange={(e) => setRegPhone(e.target.value)}
                          placeholder="+234 803 123 4567"
                          className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500 rounded-xl px-4 py-3 text-sm text-white focus:outline-none"
                        />
                      </div>
                    </div>

                    {/* Bank Details Card */}
                    <div className="p-4 bg-slate-950 border border-slate-800 rounded-2xl space-y-4">
                      <div className="flex items-center gap-2 text-xs font-bold text-amber-400 uppercase tracking-wider">
                        <Building2 size={16} /> Commission Payout Bank Details (Nigeria)
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div>
                          <label className="block text-xs font-semibold text-slate-400 mb-1">
                            Bank Name *
                          </label>
                          <input
                            type="text"
                            required
                            value={regBankName}
                            onChange={(e) => setRegBankName(e.target.value)}
                            placeholder="e.g. Access Bank"
                            className="w-full bg-slate-900 border border-slate-800 focus:border-amber-500 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-slate-400 mb-1">
                            Account Number *
                          </label>
                          <input
                            type="text"
                            required
                            maxLength={10}
                            value={regAccountNumber}
                            onChange={(e) => setRegAccountNumber(e.target.value.replace(/[^0-9]/g, ""))}
                            placeholder="0123456789"
                            className="w-full bg-slate-900 border border-slate-800 focus:border-amber-500 rounded-xl px-3 py-2.5 text-xs font-mono text-white focus:outline-none"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-slate-400 mb-1">
                            Account Name *
                          </label>
                          <input
                            type="text"
                            required
                            value={regAccountName}
                            onChange={(e) => setRegAccountName(e.target.value)}
                            placeholder="e.g. Adebayo Ibrahim"
                            className="w-full bg-slate-900 border border-slate-800 focus:border-amber-500 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none"
                          />
                        </div>
                      </div>
                    </div>

                    {/* PIN */}
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="block text-xs font-semibold text-slate-300">
                          Create 6-Digit Security PIN *
                        </label>
                        <span className="text-[11px] text-slate-500">
                          Used to log in &amp; track earnings
                        </span>
                      </div>
                      <input
                        type="password"
                        required
                        maxLength={8}
                        value={regPin}
                        onChange={(e) => setRegPin(e.target.value)}
                        placeholder="••••••"
                        className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500 rounded-xl px-4 py-3 text-sm font-mono tracking-widest text-white focus:outline-none"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={regLoading}
                      className="w-full py-4 rounded-xl bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600 hover:from-amber-300 hover:to-amber-500 text-slate-950 font-black text-sm uppercase tracking-wider shadow-lg shadow-amber-500/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50 mt-4 cursor-pointer"
                    >
                      {regLoading ? (
                        <>
                          <Loader2 size={18} className="animate-spin" />
                          <span>Generating Partner Code...</span>
                        </>
                      ) : (
                        <>
                          <span>Register &amp; Get My Referral Link</span>
                          <ArrowRight size={18} />
                        </>
                      )}
                    </button>
                  </form>

                  <div className="text-center mt-6 text-xs text-slate-500">
                    Already registered?{" "}
                    <button
                      type="button"
                      onClick={() => setActiveTab("dashboard")}
                      className="text-amber-400 font-bold hover:underline"
                    >
                      Log in to your dashboard here
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 2: LOGIN FORM (If not authenticated) */}
            {activeTab === "dashboard" && !token && (
              <div className="bg-slate-900 border border-amber-500/30 rounded-3xl p-6 sm:p-10 shadow-2xl relative overflow-hidden animate-fadeIn max-w-md mx-auto">
                <div className="text-center mb-8">
                  <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center mx-auto mb-4">
                    <Lock size={22} />
                  </div>
                  <h2 className="text-2xl font-black text-white">Promoter Login</h2>
                  <p className="text-slate-400 text-xs mt-1">
                    Enter your Registered Email or Partner Code and 6-digit PIN
                  </p>
                </div>

                {loginError && (
                  <div className="p-3.5 mb-6 bg-red-500/15 border border-red-500/40 text-red-300 rounded-xl flex items-start gap-2.5 animate-fadeIn text-xs">
                    <AlertTriangle size={16} className="text-red-400 shrink-0 mt-0.5" />
                    <div>{loginError}</div>
                  </div>
                )}

                <form onSubmit={handleLogin} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Email or Partner Code *
                    </label>
                    <input
                      type="text"
                      required
                      value={loginId}
                      onChange={(e) => setLoginId(e.target.value)}
                      placeholder="e.g. TF-PROMO-A92B or email"
                      className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500 rounded-xl px-4 py-3 text-sm text-white focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Security PIN *
                    </label>
                    <input
                      type="password"
                      required
                      value={loginPin}
                      onChange={(e) => setLoginPin(e.target.value)}
                      placeholder="••••••"
                      className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500 rounded-xl px-4 py-3 text-sm font-mono tracking-widest text-white focus:outline-none"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={loginLoading}
                    className="w-full py-3.5 rounded-xl bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600 hover:from-amber-300 hover:to-amber-500 text-slate-950 font-black text-sm uppercase tracking-wider shadow-lg shadow-amber-500/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50 mt-4 cursor-pointer"
                  >
                    {loginLoading ? (
                      <>
                        <Loader2 size={16} className="animate-spin" />
                        <span>Verifying...</span>
                      </>
                    ) : (
                      <>
                        <span>Open My Dashboard</span>
                        <ArrowRight size={16} />
                      </>
                    )}
                  </button>
                </form>

                <div className="text-center mt-6 text-xs text-slate-500">
                  New promoter?{" "}
                  <button
                    type="button"
                    onClick={() => setActiveTab("register")}
                    className="text-amber-400 font-bold hover:underline"
                  >
                    Register here in 1 minute
                  </button>
                </div>
              </div>
            )}

            {/* TAB 3a: SUSPENDED ACCOUNT BANNER */}
            {token && isSuspended && (
              <div className="space-y-8 animate-fadeIn">
                <div className="bg-red-950/80 border-2 border-red-500/60 rounded-3xl p-8 text-center shadow-2xl">
                  <div className="w-16 h-16 rounded-2xl bg-red-500/20 border border-red-500/40 flex items-center justify-center mx-auto mb-5">
                    <ShieldAlert size={30} className="text-red-400" />
                  </div>
                  <h2 className="text-2xl font-black text-white mb-2">Account Suspended</h2>
                  <p className="text-red-300 text-sm max-w-md mx-auto leading-relaxed mb-6">
                    {suspendedMsg || "Your promoter account has been suspended by the Trade Fair administration. You cannot access your dashboard or earn new commissions at this time."}
                  </p>
                  <p className="text-xs text-slate-400 mb-6">
                    Please contact the Trade Fair Secretariat to resolve this:
                    <a href="mailto:tradefair@glotrade.online" className="text-amber-400 hover:underline ml-1">tradefair@glotrade.online</a>
                  </p>
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="px-6 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-sm flex items-center gap-2 mx-auto transition-all"
                  >
                    <LogOut size={15} /> Sign Out
                  </button>
                </div>
              </div>
            )}

            {/* TAB 3b: AUTHENTICATED PROMOTER DASHBOARD */}
            {token && promoter && !isSuspended && (
              <div className="space-y-8 animate-fadeIn">
                {/* Promoter Welcome & Quick Share Bar */}
                <div className="bg-gradient-to-br from-slate-900 to-slate-950 border border-amber-500/30 rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-slate-800 pb-6 mb-6">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs uppercase font-bold text-amber-400 tracking-wider">
                          Official Trade Fair Partner
                        </span>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                          promoter.status === "suspended"
                            ? "bg-red-500/20 text-red-400 border-red-500/30"
                            : "bg-emerald-500/20 text-emerald-400 border-emerald-500/30"
                        }`}>
                          {promoter.status === "suspended" ? "Suspended" : "Active"}
                        </span>
                      </div>
                      <h2 className="text-2xl sm:text-3xl font-black text-white">
                        {promoter.name}
                      </h2>
                      <p className="text-xs text-slate-400 mt-1">
                        Account Email: {promoter.email} · Phone: {promoter.phone}
                      </p>
                    </div>

                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={() => fetchDashboard(token)}
                        disabled={refreshing}
                        className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 flex items-center gap-1.5 transition-all"
                      >
                        <RefreshCw size={14} className={refreshing ? "animate-spin text-amber-400" : ""} />
                        <span>Refresh</span>
                      </button>
                      <button
                        type="button"
                        onClick={handleLogout}
                        className="px-3.5 py-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-xs font-semibold text-red-400 border border-red-500/30 flex items-center gap-1.5 transition-all"
                      >
                        <LogOut size={14} />
                        <span>Log Out</span>
                      </button>
                    </div>
                  </div>

                  {/* Share Link Center Box */}
                  <div className="bg-slate-950 border border-amber-500/40 rounded-2xl p-5 space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                        <Share2 size={14} /> Your Unique Exhibitor Referral Link
                      </span>
                      <span className="text-xs font-mono font-bold text-slate-300">
                        Code: <strong className="text-amber-400">{promoter.promoterCode}</strong>
                      </span>
                    </div>

                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                      <div className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 font-mono text-xs text-amber-300 truncate select-all">
                        {referralLink}
                      </div>

                      <button
                        type="button"
                        onClick={handleCopyLink}
                        className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow-md shrink-0 cursor-pointer"
                      >
                        {copiedLink ? <Check size={14} /> : <Copy size={14} />}
                        <span>{copiedLink ? "Link Copied!" : "Copy Link"}</span>
                      </button>

                      <button
                        type="button"
                        onClick={handleCopyCode}
                        className="px-3.5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs flex items-center justify-center gap-1.5 transition-all shrink-0 cursor-pointer"
                      >
                        {copiedCode ? <Check size={14} /> : <Copy size={14} />}
                        <span>{copiedCode ? "Code Copied!" : "Copy Code"}</span>
                      </button>

                      <a
                        href={whatsappShareUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow-md shrink-0"
                      >
                        <Share2 size={14} />
                        <span>WhatsApp</span>
                      </a>
                    </div>

                    <p className="text-[11px] text-slate-400">
                      Share this link directly with businesses or have them enter your code <strong className="text-white font-mono">{promoter.promoterCode}</strong> in the booking form.
                    </p>
                  </div>
                </div>

                {/* Live KPI Metric Cards */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
                    <div className="flex items-center justify-between text-slate-400 mb-2">
                      <span className="text-xs font-semibold">Total Stalls Referred</span>
                      <Users size={16} className="text-amber-400" />
                    </div>
                    <div className="text-2xl font-black text-white">
                      {promoter.stats.totalReferredExhibitors || 0}
                    </div>
                    <span className="text-[10px] text-slate-500 mt-1 block">
                      Paid: {promoter.stats.paidExhibitors || 0} stalls
                    </span>
                  </div>

                  <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
                    <div className="flex items-center justify-between text-slate-400 mb-2">
                      <span className="text-xs font-semibold">Total Commission</span>
                      <DollarSign size={16} className="text-emerald-400" />
                    </div>
                    <div className="text-2xl font-black text-emerald-400 font-mono">
                      ₦{(promoter.stats.totalCommissionEarned || 0).toLocaleString("en-NG")}
                    </div>
                    <span className="text-[10px] text-slate-500 mt-1 block">
                      At {commissionRate}% commission rate
                    </span>
                  </div>

                  <div className="bg-slate-900 border border-amber-500/30 rounded-2xl p-5">
                    <div className="flex items-center justify-between text-slate-400 mb-2">
                      <span className="text-xs font-semibold text-amber-300">Pending Payout</span>
                      <Wallet size={16} className="text-amber-400" />
                    </div>
                    <div className="text-2xl font-black text-amber-400 font-mono">
                      ₦{(promoter.stats.pendingCommission || 0).toLocaleString("en-NG")}
                    </div>
                    <span className="text-[10px] text-amber-400/70 mt-1 block">
                      Awaiting transfer to your bank
                    </span>
                  </div>

                  <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
                    <div className="flex items-center justify-between text-slate-400 mb-2">
                      <span className="text-xs font-semibold">Total Paid Out</span>
                      <CheckCircle2 size={16} className="text-blue-400" />
                    </div>
                    <div className="text-2xl font-black text-blue-400 font-mono">
                      ₦{(promoter.stats.totalCommissionPaid || 0).toLocaleString("en-NG")}
                    </div>
                    <span className="text-[10px] text-slate-500 mt-1 block">
                      Transferred to your bank account
                    </span>
                  </div>
                </div>

                {/* Bank Account On Record Box */}
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center shrink-0">
                        <Building2 size={20} />
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-bold">
                          Commission Payout Bank Account
                        </span>
                        <div className="text-sm font-bold text-white">
                          {promoter.bankDetails.bankName} · {promoter.bankDetails.accountNumber}
                        </div>
                        <span className="text-xs text-slate-400">
                          {promoter.bankDetails.accountName}
                        </span>
                      </div>
                    </div>
                    <span className="text-[11px] font-semibold text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/30">
                      Verified for Payout
                    </span>
                  </div>
                </div>

                {/* Referred Exhibitors Table */}
                <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 overflow-hidden">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-4">
                    <div>
                      <h3 className="text-lg font-black text-white">
                        Referred Exhibitors &amp; Stall Bookings
                      </h3>
                      <p className="text-xs text-slate-400 mt-0.5">
                        Track every stall booked with your partner code
                      </p>
                    </div>
                    <span className="text-xs text-slate-400 font-semibold">
                      {bookings.length} record(s)
                    </span>
                  </div>

                  {bookings.length === 0 ? (
                    <div className="py-12 text-center text-slate-500 text-sm">
                      <Store size={32} className="mx-auto mb-3 text-slate-600" />
                      <p className="font-semibold text-slate-400">No exhibitor bookings yet.</p>
                      <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                        Share your partner referral link above with potential exhibitors to start earning commissions!
                      </p>
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs">
                        <thead className="bg-slate-950/80 text-slate-400 border-b border-slate-800 uppercase font-semibold text-[10px] tracking-wider">
                          <tr>
                            <th className="py-3 px-4">Exhibitor / Business</th>
                            <th className="py-3 px-4">Package</th>
                            <th className="py-3 px-4">Stall Fee</th>
                            <th className="py-3 px-4">Commission</th>
                            <th className="py-3 px-4">Payment</th>
                            <th className="py-3 px-4">Commission Status</th>
                            <th className="py-3 px-4">Date</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800 text-slate-300">
                          {bookings.map((b, idx) => (
                            <tr key={idx} className="hover:bg-slate-800/40 transition-colors">
                              <td className="py-3 px-4">
                                <strong className="text-white block font-semibold">
                                  {b.businessName || b.customerName}
                                </strong>
                                <span className="text-[10px] text-slate-500 font-mono">
                                  {b.ticketCode}
                                </span>
                              </td>
                              <td className="py-3 px-4 text-slate-300">{b.packageName}</td>
                              <td className="py-3 px-4 font-mono font-bold text-white">
                                ₦{b.amount.toLocaleString("en-NG")}
                              </td>
                              <td className="py-3 px-4 font-mono font-bold text-emerald-400">
                                ₦{b.promoterCommissionAmount.toLocaleString("en-NG")}
                              </td>
                              <td className="py-3 px-4">
                                <span
                                  className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                                    b.paymentStatus === "paid"
                                      ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30"
                                      : b.paymentStatus === "failed"
                                      ? "bg-red-500/15 text-red-400 border border-red-500/30"
                                      : "bg-amber-500/15 text-amber-400 border border-amber-500/30"
                                  }`}
                                >
                                  {b.paymentStatus}
                                </span>
                              </td>
                              <td className="py-3 px-4">
                                <span
                                  className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                                    b.promoterCommissionStatus === "paid"
                                      ? "bg-blue-500/15 text-blue-400 border border-blue-500/30"
                                      : b.promoterCommissionStatus === "approved"
                                      ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30"
                                      : "bg-amber-500/15 text-amber-400 border border-amber-500/30"
                                  }`}
                                >
                                  {b.promoterCommissionStatus || "pending"}
                                </span>
                              </td>
                              <td className="py-3 px-4 text-slate-400 text-[11px]">
                                {new Date(b.createdAt).toLocaleDateString("en-NG", {
                                  day: "numeric",
                                  month: "short",
                                  year: "numeric",
                                })}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>

                {/* Payout History Table */}
                {promoter.payouts && promoter.payouts.length > 0 && (
                  <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 overflow-hidden">
                    <h3 className="text-lg font-black text-white mb-4">
                      Bank Transfer Payout Receipts
                    </h3>
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs">
                        <thead className="bg-slate-950/80 text-slate-400 border-b border-slate-800 uppercase font-semibold text-[10px]">
                          <tr>
                            <th className="py-3 px-4">Amount</th>
                            <th className="py-3 px-4">Transfer Reference</th>
                            <th className="py-3 px-4">Notes</th>
                            <th className="py-3 px-4">Date Paid</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800 text-slate-300">
                          {promoter.payouts.map((p, pIdx) => (
                            <tr key={pIdx} className="hover:bg-slate-800/40">
                              <td className="py-3 px-4 font-mono font-bold text-emerald-400">
                                ₦{p.amount.toLocaleString("en-NG")}
                              </td>
                              <td className="py-3 px-4 font-mono text-slate-300">{p.reference}</td>
                              <td className="py-3 px-4 text-slate-400">{p.notes || "Bank Transfer"}</td>
                              <td className="py-3 px-4 text-slate-400 text-[11px]">
                                {new Date(p.paidAt).toLocaleDateString("en-NG", {
                                  day: "numeric",
                                  month: "short",
                                  year: "numeric",
                                })}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </section>

        {/* How It Works Section */}
        <section className="py-16 bg-slate-900/40 border-t border-slate-800">
          <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-2xl mx-auto mb-12">
              <span className="text-xs font-bold uppercase tracking-wider text-amber-400 block mb-2">
                Simple 3-Step Process
              </span>
              <h2 className="text-3xl font-black text-white">How You Earn as a Promoter</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 text-center relative">
                <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center font-black text-lg mx-auto mb-4">
                  1
                </div>
                <h4 className="text-base font-bold text-white mb-2">Get Your Partner Link</h4>
                <p className="text-slate-400 text-xs leading-relaxed">
                  Sign up in 1 minute with your payout bank details. You receive a custom referral link and code immediately.
                </p>
              </div>

              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 text-center relative">
                <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center font-black text-lg mx-auto mb-4">
                  2
                </div>
                <h4 className="text-base font-bold text-white mb-2">Share with Businesses</h4>
                <p className="text-slate-400 text-xs leading-relaxed">
                  Invite manufacturers, vendors, agro-processors, FMCG brands, and fashion houses looking for trade visibility in Abuja.
                </p>
              </div>

              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 text-center relative">
                <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center font-black text-lg mx-auto mb-4">
                  3
                </div>
                <h4 className="text-base font-bold text-white mb-2">Receive Direct Payouts</h4>
                <p className="text-slate-400 text-xs leading-relaxed">
                  When the exhibitor completes payment, your commission is locked in. The secretariat transfers payments directly to your bank.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="py-16 border-t border-slate-800">
          <div className="max-w-3xl mx-auto px-4 sm:px-6">
            <div className="text-center mb-10">
              <span className="text-xs font-bold uppercase tracking-wider text-amber-400 block mb-1">
                Got Questions?
              </span>
              <h2 className="text-2xl sm:text-3xl font-black text-white">
                Frequently Asked Questions
              </h2>
            </div>

            <div className="space-y-3">
              {faqs.map((faq, index) => {
                const isOpen = openFaq === index;
                return (
                  <div
                    key={index}
                    className="border border-slate-800 bg-slate-900/60 rounded-2xl overflow-hidden transition-colors"
                  >
                    <button
                      type="button"
                      onClick={() => setOpenFaq(isOpen ? null : index)}
                      className="w-full text-left px-5 py-4 flex items-center justify-between text-sm font-bold text-white hover:text-amber-400 transition-colors"
                    >
                      <span>{faq.q}</span>
                      <ChevronDown
                        size={16}
                        className={`text-amber-400 transition-transform duration-200 shrink-0 ml-4 ${
                          isOpen ? "rotate-180" : ""
                        }`}
                      />
                    </button>
                    {isOpen && (
                      <div className="px-5 pb-5 pt-1 text-xs text-slate-300 leading-relaxed border-t border-slate-800/60">
                        {faq.a}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      </main>

      <BazaarFooter />
    </div>
  );
}
