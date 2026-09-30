"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import AdminLayout from "@/components/admin/AdminLayout";
import {
  Ticket,
  DollarSign,
  Users,
  Store,
  Award,
  Search,
  CheckCircle2,
  XCircle,
  QrCode,
  Save,
  Loader2,
  RefreshCw,
  Power,
  Clock,
  Filter,
  MessageSquare,
  Camera,
  PlusCircle,
  Mail,
  Building2,
  X,
  Send,
  Eye,
  Phone,
  Copy,
  ExternalLink,
  Calendar,
  Check,
  Layers,
  Trash2,
  ShieldCheck,
  History,
  UserCheck,
  Lock,
  ShieldAlert,
  Wallet,
} from "lucide-react";
import { apiGet, apiPut, apiPost, apiPatch, apiDelete } from "@/utils/api";
import QRCodeScanner from "@/components/wallet/QRCodeScanner";

export default function AdminTradeFairPage() {
  const eventId = "tradefair_2026";

  // Stats
  const [stats, setStats] = useState<any>(null);
  const [statsLoading, setStatsLoading] = useState(true);

  // Seasonal Controls Config
  const [config, setConfig] = useState<any>({
    isPortalActive: true,
    ticketSalesActive: true,
    exhibitorApplicationsActive: true,
    sponsorshipActive: true,
    inactiveMessage: "",
    eventTitle: "GloTrade International Trade Fair 2026",
    eventDateLabel: "1st – 5th December 2026",
    eventVenue: "Venue to be announced (TBA), Abuja",
    bankName: "Wema Bank",
    bankAccountName: "GloTrade Platform Limited",
    bankAccountNumber: "0127131496",
    whatsappNumber: "2347044600924",
    email: "glotradebazaar@glotrade.online",
  });
  const [configLoading, setConfigLoading] = useState(true);
  const [configSaving, setConfigSaving] = useState(false);
  const [configMsg, setConfigMsg] = useState<string | null>(null);

  // Check-In Tool State
  const [ticketInput, setTicketInput] = useState("");
  const [checkInLoading, setCheckInLoading] = useState(false);
  const [checkInResult, setCheckInResult] = useState<{
    success: boolean;
    message: string;
    data?: any;
  } | null>(null);
  const [showCameraScanner, setShowCameraScanner] = useState(false);

  // Manual Registration Modal State
  const [showManualModal, setShowManualModal] = useState(false);
  const [manualType, setManualType] = useState<"ticket" | "exhibitor" | "sponsorship">("ticket");
  const [manualPkgId, setManualPkgId] = useState("standard");
  const [manualPkgName, setManualPkgName] = useState("Free Public Day Pass");
  const [manualAmount, setManualAmount] = useState<number>(0);
  const [manualName, setManualName] = useState("");
  const [manualEmail, setManualEmail] = useState("");
  const [manualPhone, setManualPhone] = useState("");
  const [manualBusiness, setManualBusiness] = useState("");
  const [manualPaymentStatus, setManualPaymentStatus] = useState<"paid" | "pending">("paid");
  const [manualNotes, setManualNotes] = useState("Bank transfer verified on WhatsApp");
  const [manualSubmitting, setManualSubmitting] = useState(false);
  const [manualMsg, setManualMsg] = useState<{ text: string; success: boolean } | null>(null);

  // Inspection Modal State
  const [selectedBooking, setSelectedBooking] = useState<any | null>(null);
  const [showInspectModal, setShowInspectModal] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  // Bookings & Promoters List
  const [activeTab, setActiveTab] = useState<"all" | "ticket" | "exhibitor" | "sponsorship" | "contact" | "promoters">("all");
  const [bookings, setBookings] = useState<any[]>([]);
  const [bookingsLoading, setBookingsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [actionMsg, setActionMsg] = useState<string | null>(null);

  // Promoter Management State
  const [promoters, setPromoters] = useState<any[]>([]);
  const [promoterTotals, setPromoterTotals] = useState<any>(null);
  const [promotersLoading, setPromotersLoading] = useState(false);
  const [payoutModalOpen, setPayoutModalOpen] = useState(false);
  const [selectedPromoter, setSelectedPromoter] = useState<any>(null);
  const [payoutAmount, setPayoutAmount] = useState<number>(0);
  const [payoutRef, setPayoutRef] = useState("");
  const [payoutNotes, setPayoutNotes] = useState("");
  const [payoutLoading, setPayoutLoading] = useState(false);
  const [payoutError, setPayoutError] = useState<string | null>(null);

  const handleCopyText = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(label);
    setTimeout(() => setCopiedField(null), 2000);
  };

  // Super Admin & Delete State
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [selectedBookingIds, setSelectedBookingIds] = useState<string[]>([]);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<{ type: "single" | "bulk"; item?: any; ids?: string[] } | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem("afritrade:user");
      if (stored) {
        setCurrentUser(JSON.parse(stored));
      }
    } catch (e) {
      console.error("Failed to load user from localStorage:", e);
    }
  }, []);

  const isSuperAdmin = Boolean(currentUser?.isSuperAdmin);

  const isAllSelected = bookings.length > 0 && bookings.every((b) => selectedBookingIds.includes(b._id));

  const toggleSelectAll = () => {
    if (isAllSelected) {
      setSelectedBookingIds([]);
    } else {
      setSelectedBookingIds(bookings.map((b) => b._id));
    }
  };

  const toggleSelectBooking = (id: string) => {
    if (selectedBookingIds.includes(id)) {
      setSelectedBookingIds(selectedBookingIds.filter((item) => item !== id));
    } else {
      setSelectedBookingIds([...selectedBookingIds, id]);
    }
  };

  const promptDeleteSingle = (item: any) => {
    setDeleteTarget({ type: "single", item, ids: [item._id] });
    setShowDeleteModal(true);
  };

  const promptDeleteBulk = () => {
    if (selectedBookingIds.length === 0) return;
    setDeleteTarget({ type: "bulk", ids: selectedBookingIds });
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!deleteTarget || !deleteTarget.ids || deleteTarget.ids.length === 0) return;
    setDeleting(true);
    setActionMsg(null);

    try {
      const query = { ids: deleteTarget.ids.join(",") };
      const res: any = await apiDelete("/api/v1/bazaar/admin/bookings", { query });

      if (res?.status === "success") {
        setActionMsg(`Successfully deleted ${deleteTarget.ids.length} registration record(s).`);
        setSelectedBookingIds([]);
        setShowDeleteModal(false);
        setDeleteTarget(null);
        if (showInspectModal) setShowInspectModal(false);
        loadStatsAndConfig();
        loadBookings();
      } else {
        setActionMsg(res?.message || "Failed to delete record(s).");
      }
    } catch (err: any) {
      setActionMsg(err?.message || "An error occurred while deleting.");
    } finally {
      setDeleting(false);
      setTimeout(() => setActionMsg(null), 5000);
    }
  };

  // Handle Preset Package Changes in Manual Booking Modal
  const handlePackageSelect = (pkgId: string) => {
    setManualPkgId(pkgId);
    if (pkgId === "standard" || pkgId === "free-general") {
      setManualPkgName("Free Public Day Pass");
      setManualAmount(0);
      setManualType("ticket");
    } else if (pkgId === "vip" || pkgId === "free-all-access") {
      setManualPkgName("Free 5-Day Visitor Pass");
      setManualAmount(0);
      setManualType("ticket");
    } else if (pkgId === "vvip" || pkgId === "free-trade-buyer") {
      setManualPkgName("Trade Buyer & B2B Pass");
      setManualAmount(0);
      setManualType("ticket");
    } else if (pkgId === "table" || pkgId === "free-vip") {
      setManualPkgName("VIP Executive Accreditation");
      setManualAmount(0);
      setManualType("ticket");
    } else if (pkgId === "tier-micro") {
      setManualPkgName("Micro Enterprise Booth");
      setManualAmount(150000);
      setManualType("exhibitor");
    } else if (pkgId === "tier-small") {
      setManualPkgName("Small Scale Enterprise Booth");
      setManualAmount(250000);
      setManualType("exhibitor");
    } else if (pkgId === "tier-bronze") {
      setManualPkgName("Bronze Membership Stall");
      setManualAmount(375000);
      setManualType("exhibitor");
    } else if (pkgId === "tier-silver") {
      setManualPkgName("Silver Membership Stall");
      setManualAmount(500000);
      setManualType("exhibitor");
    } else if (pkgId === "tier-gold") {
      setManualPkgName("Gold Membership Stall");
      setManualAmount(750000);
      setManualType("exhibitor");
    } else if (pkgId === "tier-platinum") {
      setManualPkgName("Platinum Membership Stall");
      setManualAmount(1000000);
      setManualType("exhibitor");
    } else if (pkgId === "sponsor-gold") {
      setManualPkgName("Gold Sponsorship");
      setManualAmount(500000);
      setManualType("sponsorship");
    } else if (pkgId === "sponsor-headline") {
      setManualPkgName("Headline Sponsorship");
      setManualAmount(1500000);
      setManualType("sponsorship");
    }
  };

  const handleScanQRData = (data: any) => {
    setShowCameraScanner(false);
    let extractedCode = "";
    if (typeof data === "string") {
      extractedCode = data;
    } else if (data?.code || data?.ticketCode || data?.text) {
      extractedCode = data.code || data.ticketCode || data.text;
    }

    if (extractedCode.includes("code=")) {
      try {
        const urlObj = new URL(extractedCode);
        extractedCode = urlObj.searchParams.get("code") || extractedCode;
      } catch {
        const match = extractedCode.match(/code=([^&]+)/);
        if (match) extractedCode = match[1];
      }
    }

    if (extractedCode) {
      setTicketInput(extractedCode.trim());
      executeCheckIn(extractedCode.trim());
    }
  };

  // Fetch Stats & Config for Trade Fair 2026
  const loadStatsAndConfig = async () => {
    try {
      const [statsRes, configRes]: any[] = await Promise.all([
        apiGet("/api/v1/bazaar/admin/stats", { query: { eventId } }),
        apiGet("/api/v1/bazaar/config"),
      ]);
      if (statsRes?.data) setStats(statsRes.data);
      if (configRes?.data) {
        const cfg = configRes.data;
        const rawWa = (cfg.whatsappNumber || "").replace(/[^0-9]/g, "");
        if (!rawWa || rawWa === "2348000000000" || rawWa.includes("8000000000")) {
          cfg.whatsappNumber = "2347044600924";
        }
        setConfig(cfg);
      }
    } catch (err) {
      console.error("Failed to load Trade Fair admin data:", err);
    } finally {
      setStatsLoading(false);
      setConfigLoading(false);
    }
  };

  // Fetch Bookings for Trade Fair 2026
  const loadBookings = async () => {
    setBookingsLoading(true);
    try {
      const query: any = {
        eventId,
        type: activeTab,
        page,
        limit: 15,
      };
      if (searchTerm) query.search = searchTerm;
      if (statusFilter !== "all") query.paymentStatus = statusFilter;

      const res: any = await apiGet("/api/v1/bazaar/admin/bookings", { query });
      if (res?.data) {
        setBookings(res.data.bookings || []);
        setTotalPages(res.data.totalPages || 1);
      }
    } catch (err) {
      console.error("Failed to load Trade Fair bookings:", err);
    } finally {
      setBookingsLoading(false);
    }
  };

  const loadPromoters = async () => {
    setPromotersLoading(true);
    try {
      const res: any = await apiGet("/api/v1/bazaar/admin/promoters", {
        query: { page, limit: 20, search: searchTerm },
      });
      if (res?.data) {
        setPromoters(res.data.promoters || []);
        setPromoterTotals(res.data.totals || null);
        setTotalPages(res.data.pagination?.pages || 1);
      }
    } catch (e) {
      console.error("Failed to load promoters:", e);
    } finally {
      setPromotersLoading(false);
    }
  };

  const handleTogglePromoterStatus = async (promoterId: string, currentStatus: string) => {
    const nextStatus = currentStatus === "active" ? "suspended" : "active";
    try {
      const res: any = await apiPatch(`/api/v1/bazaar/admin/promoters/${promoterId}/status`, {
        status: nextStatus,
      });
      if (res?.status === "success") {
        setActionMsg(`Promoter marked as ${nextStatus.toUpperCase()}`);
        loadPromoters();
        setTimeout(() => setActionMsg(null), 3000);
      }
    } catch (err: any) {
      alert(err?.message || "Failed to update promoter status.");
    }
  };

  const handleRecordPayout = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPromoter) return;
    setPayoutLoading(true);
    setPayoutError(null);
    try {
      const res: any = await apiPost(`/api/v1/bazaar/admin/promoters/${selectedPromoter._id}/payout`, {
        amount: payoutAmount,
        reference: payoutRef,
        notes: payoutNotes,
      });
      if (res?.status === "success") {
        setActionMsg(`Payout of ₦${payoutAmount.toLocaleString("en-NG")} recorded successfully for ${selectedPromoter.name}`);
        setPayoutModalOpen(false);
        setSelectedPromoter(null);
        setPayoutAmount(0);
        setPayoutRef("");
        setPayoutNotes("");
        loadPromoters();
        loadStatsAndConfig();
        setTimeout(() => setActionMsg(null), 3000);
      } else {
        setPayoutError(res?.message || "Failed to record payout.");
      }
    } catch (err: any) {
      setPayoutError(err?.message || "Failed to record payout.");
    } finally {
      setPayoutLoading(false);
    }
  };

  useEffect(() => {
    loadStatsAndConfig();
    if (activeTab === "promoters") {
      loadPromoters();
    } else {
      loadBookings();
    }
  }, [activeTab, page, statusFilter]);

  // Save Seasonal Controls & Bank Config
  const handleSaveConfig = async () => {
    setConfigSaving(true);
    setConfigMsg(null);
    try {
      const res: any = await apiPut("/api/v1/bazaar/admin/config", config);
      if (res?.data) {
        setConfig(res.data);
        setConfigMsg("Trade Fair portal controls & bank settings updated successfully.");
      }
    } catch (err: any) {
      setConfigMsg(err?.message || "Failed to update settings.");
    } finally {
      setConfigSaving(false);
    }
  };

  // Gate Check-in Scoped to Trade Fair 2026
  const executeCheckIn = async (codeToVerify: string) => {
    setCheckInLoading(true);
    setCheckInResult(null);

    try {
      const res: any = await apiPost("/api/v1/bazaar/admin/check-in", {
        code: codeToVerify.trim(),
        eventId,
      });
      setCheckInResult({
        success: res?.status === "success",
        message: res?.message || "Check-in response received",
        data: res?.data,
      });
      if (res?.status === "success") {
        setTicketInput("");
        loadStatsAndConfig();
        loadBookings();
      }
    } catch (err: any) {
      setCheckInResult({
        success: false,
        message: err?.message || "Check-in failed.",
      });
    } finally {
      setCheckInLoading(false);
    }
  };

  const handleCheckIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ticketInput.trim()) return;
    executeCheckIn(ticketInput);
  };

  // Create Manual Registration Scoped to Trade Fair 2026
  const handleCreateManualBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    setManualSubmitting(true);
    setManualMsg(null);

    try {
      const res: any = await apiPost("/api/v1/bazaar/admin/bookings/manual", {
        eventId,
        type: manualType,
        packageId: manualPkgId,
        packageName: manualPkgName,
        amount: manualAmount,
        customerName: manualName,
        customerEmail: manualEmail,
        customerPhone: manualPhone,
        businessName: manualBusiness,
        paymentStatus: manualPaymentStatus,
        notes: manualNotes,
      });

      if (res?.status === "success") {
        setManualMsg({
          text: res.message || "Manual booking created & ticket email dispatched!",
          success: true,
        });
        setManualName("");
        setManualEmail("");
        setManualPhone("");
        setManualBusiness("");
        loadStatsAndConfig();
        loadBookings();
        setTimeout(() => setShowManualModal(false), 2000);
      }
    } catch (err: any) {
      setManualMsg({
        text: err?.message || "Failed to create manual registration.",
        success: false,
      });
    } finally {
      setManualSubmitting(false);
    }
  };

  // Resend Ticket Email
  const handleResendEmail = async (id: string, email: string) => {
    setActionMsg(null);
    try {
      await apiPost(`/api/v1/bazaar/admin/bookings/${id}/resend-email`, {});
      setActionMsg(`Trade Fair ticket confirmation email resent to ${email}`);
      setTimeout(() => setActionMsg(null), 4000);
    } catch (err: any) {
      setActionMsg(err?.message || "Failed to resend ticket email.");
    }
  };

  // Toggle booking payment or checkin status
  const handleUpdateBooking = async (id: string, payload: any) => {
    setActionMsg(null);
    try {
      const res: any = await apiPatch(`/api/v1/bazaar/admin/bookings/${id}`, payload);
      if (payload.paymentStatus === "paid") {
        setActionMsg("Booking marked as PAID. Official ticket email dispatched to attendee.");
        setTimeout(() => setActionMsg(null), 4000);
      }
      if (selectedBooking && selectedBooking._id === id && res?.data) {
        setSelectedBooking(res.data);
      }
      loadBookings();
      loadPromoters();
      loadStatsAndConfig();
    } catch (err) {
      console.error(err);
    }
  };

  const handleInspectBooking = (item: any) => {
    setSelectedBooking(item);
    setShowInspectModal(true);
  };

  const totalAllRegistrations =
    (stats?.totalTickets || 0) +
    (stats?.totalExhibitors || 0) +
    (stats?.totalSponsorships || 0) +
    (stats?.totalContacts || 0);

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Action Alert Banner */}
        {actionMsg && (
          <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 text-emerald-700 rounded-xl text-sm font-semibold flex items-center justify-between animate-fadeIn">
            <span>{actionMsg}</span>
            <button onClick={() => setActionMsg(null)} className="text-emerald-700 hover:text-emerald-900">
              <X size={16} />
            </button>
          </div>
        )}

        {/* Live Workspace Notice & Archive Link */}
        <div className="p-3.5 bg-blue-50 border border-blue-200 text-blue-900 rounded-xl text-xs sm:text-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-sm">
          <div className="flex items-center gap-2">
            <span className="font-bold uppercase tracking-wider text-[11px] px-2.5 py-0.5 bg-blue-600 text-white rounded-md">Live Event Workspace</span>
            <span>Managing live registrations for <strong>GloTrade International Trade Fair (Dec 1–5, 2026)</strong>.</span>
          </div>
          <Link
            href="/admin/bazaar"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-gray-300 hover:bg-gray-100 text-gray-700 text-xs font-semibold rounded-lg shadow-sm w-fit transition-colors"
          >
            <History size={13} className="text-amber-600" /> View Past Abuja Bazaar Archive &rarr;
          </Link>
        </div>

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-200 pb-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <Ticket className="text-blue-600" size={28} /> GloTrade International Trade Fair Management
            </h1>
            <p className="text-sm text-gray-500">
              Active 2026 Edition (1st – 5th December 2026 • Abuja, Nigeria) — Master controls, ticket sales, bookings, check-in, and attendee management.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => setShowManualModal(true)}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg text-sm shadow-sm transition-all"
            >
              <PlusCircle size={18} /> Register Manual Booking
            </button>
            <button
              onClick={() => {
                loadStatsAndConfig();
                loadBookings();
              }}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 shadow-sm"
            >
              <RefreshCw size={16} /> Refresh Live
            </button>
          </div>
        </div>

        {/* SECTION 1: Seasonal Controls & Bank Config Panel */}
        <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
          <div className="flex items-center justify-between border-b border-gray-100 pb-4 mb-4">
            <h2 className="text-base font-bold text-gray-900 flex items-center gap-2">
              <Power className="text-blue-600" size={20} /> Portal Controls & Payment Settlement Configuration
            </h2>
            <span
              className={`px-3 py-1 rounded-full text-xs font-bold ${
                config.isPortalActive
                  ? "bg-green-100 text-green-700 border border-green-200"
                  : "bg-red-100 text-red-700 border border-red-200"
              }`}
            >
              Portal Status: {config.isPortalActive ? "ONLINE / ACTIVE" : "OFF-SEASON / INACTIVE"}
            </span>
          </div>

          {configMsg && (
            <div className="mb-4 p-3 rounded-lg text-xs bg-blue-50 text-blue-700 border border-blue-200">
              {configMsg}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {/* Master Portal Switch */}
            <div className="p-4 bg-gray-50 rounded-xl border border-gray-200">
              <label className="flex items-center justify-between cursor-pointer">
                <span className="text-xs font-bold text-gray-900">Trade Fair Portal Active</span>
                <input
                  type="checkbox"
                  checked={config.isPortalActive}
                  onChange={(e) => setConfig({ ...config, isPortalActive: e.target.checked })}
                  className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
                />
              </label>
              <p className="text-[11px] text-gray-500 mt-1">Master switch for `/trade-fair` & `/bazaar` accessibility.</p>
            </div>

            {/* Ticket Sales Switch */}
            <div className="p-4 bg-gray-50 rounded-xl border border-gray-200">
              <label className="flex items-center justify-between cursor-pointer">
                <span className="text-xs font-bold text-gray-900">Delegate & Visitor Tickets</span>
                <input
                  type="checkbox"
                  checked={config.ticketSalesActive}
                  onChange={(e) => setConfig({ ...config, ticketSalesActive: e.target.checked })}
                  className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
                />
              </label>
              <p className="text-[11px] text-gray-500 mt-1">Enable or pause delegate ticket purchases.</p>
            </div>

            {/* Exhibitors Switch */}
            <div className="p-4 bg-gray-50 rounded-xl border border-gray-200">
              <label className="flex items-center justify-between cursor-pointer">
                <span className="text-xs font-bold text-gray-900">Exhibitor Booth Applications</span>
                <input
                  type="checkbox"
                  checked={config.exhibitorApplicationsActive}
                  onChange={(e) =>
                    setConfig({ ...config, exhibitorApplicationsActive: e.target.checked })
                  }
                  className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
                />
              </label>
              <p className="text-[11px] text-gray-500 mt-1">Enable or pause booth & stall bookings.</p>
            </div>

            {/* Sponsorship Switch */}
            <div className="p-4 bg-gray-50 rounded-xl border border-gray-200">
              <label className="flex items-center justify-between cursor-pointer">
                <span className="text-xs font-bold text-gray-900">Corporate Sponsorships</span>
                <input
                  type="checkbox"
                  checked={config.sponsorshipActive}
                  onChange={(e) => setConfig({ ...config, sponsorshipActive: e.target.checked })}
                  className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
                />
              </label>
              <p className="text-[11px] text-gray-500 mt-1">Enable corporate sponsorship applications.</p>
            </div>

            {/* Promoter Referral Program Switch */}
            <div className="p-4 bg-amber-50/50 rounded-xl border border-amber-200">
              <label className="flex items-center justify-between cursor-pointer">
                <span className="text-xs font-bold text-gray-900">Promoter Referral Program</span>
                <input
                  type="checkbox"
                  checked={config.promoterProgramActive ?? true}
                  onChange={(e) =>
                    setConfig({ ...config, promoterProgramActive: e.target.checked })
                  }
                  className="w-5 h-5 text-amber-600 rounded focus:ring-amber-500"
                />
              </label>
              <p className="text-[11px] text-gray-500 mt-1">Enable Trade Fair promoter sign-ups & links.</p>
            </div>

            {/* Promoter Commission Rate (%) */}
            <div className="p-4 bg-amber-50/50 rounded-xl border border-amber-200">
              <label className="block text-xs font-bold text-gray-900 mb-1">
                Promoter Commission Rate (%)
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={config.promoterCommissionPercent ?? 5}
                  onChange={(e) =>
                    setConfig({ ...config, promoterCommissionPercent: Number(e.target.value) })
                  }
                  className="w-20 px-3 py-1.5 border border-amber-300 rounded-lg text-xs font-bold text-gray-900 focus:outline-none focus:ring-2 focus:ring-amber-500 bg-white"
                />
                <span className="text-xs text-gray-600 font-semibold">% per confirmed stall</span>
              </div>
              <p className="text-[11px] text-gray-500 mt-1">
                Default: 5% (e.g. ₦37,500 on ₦750,000 Gold booth).
              </p>
            </div>
          </div>

          {/* Event Identity & Details */}
          <div className="border-t border-gray-100 pt-4 mt-4 space-y-4">
            <h3 className="text-xs font-bold text-gray-800 uppercase tracking-wider flex items-center gap-1.5">
              <Calendar size={16} className="text-blue-600" /> Event Identity & Schedule Information
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Event Title</label>
                <input
                  type="text"
                  value={config.eventTitle || ""}
                  onChange={(e) => setConfig({ ...config, eventTitle: e.target.value })}
                  placeholder="e.g. GloTrade International Trade Fair 2026"
                  className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 text-xs text-gray-900 focus:ring-2 focus:ring-blue-500 font-medium"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Event Dates / Duration</label>
                <input
                  type="text"
                  value={config.eventDateLabel || ""}
                  onChange={(e) => setConfig({ ...config, eventDateLabel: e.target.value })}
                  placeholder="e.g. 1st – 5th December 2026"
                  className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 text-xs text-gray-900 focus:ring-2 focus:ring-blue-500 font-medium"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Event Venue / Location</label>
                <input
                  type="text"
                  value={config.eventVenue || ""}
                  onChange={(e) => setConfig({ ...config, eventVenue: e.target.value })}
                  placeholder="e.g. Venue to be announced (TBA), Abuja"
                  className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 text-xs text-gray-900 focus:ring-2 focus:ring-blue-500 font-medium"
                />
              </div>
            </div>
          </div>

          {/* Bank Account Details Form */}
          <div className="border-t border-gray-100 pt-4 mt-4 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <h3 className="text-xs font-bold text-gray-800 uppercase tracking-wider flex items-center gap-1.5">
                <Building2 size={16} className="text-amber-600" /> Manual Bank Transfer Checkout Account Details
              </h3>
              {isSuperAdmin ? (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-green-50 text-green-700 border border-green-200 w-fit">
                  <ShieldCheck size={11} /> Super Admin Editable
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200 w-fit">
                  <Lock size={11} /> Read Only (Super Admin Restricted)
                </span>
              )}
            </div>

            {!isSuperAdmin && (
              <div className="flex items-start gap-2 p-3 bg-amber-50/80 border border-amber-200 rounded-xl text-xs text-amber-900">
                <ShieldAlert size={16} className="text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold">Restricted Bank Settlement Details</p>
                  <p className="text-[11px] text-amber-800/90 mt-0.5">
                    Manual bank transfer checkout credentials are read-only for Event Managers. Only <strong>Super Administrators</strong> can modify official payment account information.
                  </p>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1 flex items-center gap-1">
                  Bank Name {!isSuperAdmin && <Lock size={11} className="text-gray-400" />}
                </label>
                <input
                  type="text"
                  disabled={!isSuperAdmin}
                  readOnly={!isSuperAdmin}
                  value={config.bankName || ""}
                  onChange={(e) => isSuperAdmin && setConfig({ ...config, bankName: e.target.value })}
                  placeholder="e.g. Wema Bank"
                  className={`w-full rounded-lg px-3 py-2 text-xs transition-all ${
                    !isSuperAdmin
                      ? "bg-gray-100 text-gray-500 border border-gray-200 cursor-not-allowed select-none font-medium"
                      : "bg-white text-gray-900 border border-gray-300 focus:ring-2 focus:ring-blue-500"
                  }`}
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1 flex items-center gap-1">
                  Account Name {!isSuperAdmin && <Lock size={11} className="text-gray-400" />}
                </label>
                <input
                  type="text"
                  disabled={!isSuperAdmin}
                  readOnly={!isSuperAdmin}
                  value={config.bankAccountName || ""}
                  onChange={(e) => isSuperAdmin && setConfig({ ...config, bankAccountName: e.target.value })}
                  placeholder="e.g. GloTrade Platform Limited"
                  className={`w-full rounded-lg px-3 py-2 text-xs transition-all ${
                    !isSuperAdmin
                      ? "bg-gray-100 text-gray-500 border border-gray-200 cursor-not-allowed select-none font-medium"
                      : "bg-white text-gray-900 border border-gray-300 focus:ring-2 focus:ring-blue-500"
                  }`}
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1 flex items-center gap-1">
                  Account Number {!isSuperAdmin && <Lock size={11} className="text-gray-400" />}
                </label>
                <input
                  type="text"
                  disabled={!isSuperAdmin}
                  readOnly={!isSuperAdmin}
                  value={config.bankAccountNumber || ""}
                  onChange={(e) => isSuperAdmin && setConfig({ ...config, bankAccountNumber: e.target.value })}
                  placeholder="e.g. 0127131496"
                  className={`w-full rounded-lg px-3 py-2 text-xs font-mono transition-all ${
                    !isSuperAdmin
                      ? "bg-gray-100 text-gray-500 border border-gray-200 cursor-not-allowed select-none font-medium"
                      : "bg-white text-gray-900 border border-gray-300 focus:ring-2 focus:ring-blue-500"
                  }`}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Official WhatsApp Number (Ticket & Transfer Verification)
                </label>
                <input
                  type="text"
                  value={config.whatsappNumber || ""}
                  onChange={(e) => setConfig({ ...config, whatsappNumber: e.target.value })}
                  placeholder="e.g. 2347044600924"
                  className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 text-xs text-gray-900 focus:ring-2 focus:ring-blue-500 font-mono"
                />
                <p className="text-[11px] text-gray-500 mt-1">Country code format without + (e.g. 2347044600924).</p>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Official Enquiries Email</label>
                <input
                  type="email"
                  value={config.email || ""}
                  onChange={(e) => setConfig({ ...config, email: e.target.value })}
                  placeholder="e.g. glotradebazaar@glotrade.online"
                  className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 text-xs text-gray-900 focus:ring-2 focus:ring-blue-500"
                />
                <p className="text-[11px] text-gray-500 mt-1">Contact address displayed to buyers and attendees.</p>
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-xs font-medium text-gray-700">
                Off-Season Announcement Message (Displayed when Portal is Inactive)
              </label>
              <input
                type="text"
                value={config.inactiveMessage || ""}
                onChange={(e) => setConfig({ ...config, inactiveMessage: e.target.value })}
                placeholder="e.g. GloTrade International Trade Fair 2026 portal is currently offline..."
                className="w-full bg-white border border-gray-300 rounded-lg px-4 py-2 text-sm text-gray-900 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="mt-4 text-right">
            <button
              onClick={handleSaveConfig}
              disabled={configSaving}
              className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm rounded-lg shadow-sm inline-flex items-center gap-2"
            >
              {configSaving ? <Loader2 className="animate-spin" size={16} /> : <Save size={16} />}{" "}
              {isSuperAdmin ? "Save Controls & Bank Settings" : "Save Portal Controls"}
            </button>
          </div>
        </div>

        {/* SECTION 2: Metric Stat Cards (Trade Fair 2026 Scoped) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4">
          <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-gray-500 uppercase">Total Revenue</span>
              <DollarSign className="text-emerald-500" size={20} />
            </div>
            <p className="text-2xl font-bold text-gray-900 mt-2">
              ₦{(stats?.totalRevenue || 0).toLocaleString("en-NG")}
            </p>
          </div>

          <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-gray-500 uppercase">Delegate Tickets</span>
              <Ticket className="text-blue-500" size={20} />
            </div>
            <p className="text-2xl font-bold text-gray-900 mt-2">{stats?.totalTickets || 0}</p>
          </div>

          <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-gray-500 uppercase">Exhibitor Booths</span>
              <Store className="text-purple-500" size={20} />
            </div>
            <p className="text-2xl font-bold text-gray-900 mt-2">{stats?.totalExhibitors || 0}</p>
          </div>

          <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-gray-500 uppercase">Sponsorships</span>
              <Award className="text-amber-500" size={20} />
            </div>
            <p className="text-2xl font-bold text-gray-900 mt-2">{stats?.totalSponsorships || 0}</p>
          </div>

          <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-amber-600 uppercase">Pending Bank</span>
              <Clock className="text-amber-500" size={20} />
            </div>
            <p className="text-2xl font-bold text-amber-600 mt-2">{stats?.totalPending || 0}</p>
          </div>

          <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-gray-500 uppercase">Checked-in</span>
              <Users className="text-teal-500" size={20} />
            </div>
            <p className="text-2xl font-bold text-gray-900 mt-2">{stats?.totalCheckedIn || 0}</p>
          </div>
        </div>

        {/* SECTION 3: Gate Ticket Check-in Scanner Tool */}
        <div className="bg-slate-900 text-white rounded-xl p-6 shadow-md border border-slate-800">
          <div className="flex items-center gap-2 mb-3">
            <QrCode className="text-amber-400" size={22} />
            <h2 className="text-base font-bold text-white">Trade Fair Gate Ticket Verification & Check-in</h2>
          </div>
          <p className="text-xs text-slate-400 mb-4">
            Scan QR Code or enter the 8-character Ticket Code (e.g. `GTB-XXXXXX`) to verify admission for Trade Fair 2026.
          </p>

          <form onSubmit={handleCheckIn} className="flex flex-col sm:flex-row gap-3">
            <input
              type="text"
              value={ticketInput}
              onChange={(e) => setTicketInput(e.target.value)}
              placeholder="e.g. GTB-A1B2C3"
              className="flex-1 bg-slate-950 border border-slate-800 focus:border-amber-500 rounded-lg px-4 py-2.5 text-sm text-white font-mono uppercase focus:outline-none"
            />
            <button
              type="button"
              onClick={() => setShowCameraScanner(true)}
              className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-amber-400 font-bold text-sm rounded-lg transition-colors flex items-center justify-center gap-2 border border-slate-700"
            >
              <Camera size={18} /> Scan QR Code
            </button>
            <button
              type="submit"
              disabled={checkInLoading}
              className="px-6 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-sm rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              {checkInLoading ? <Loader2 className="animate-spin" size={16} /> : <CheckCircle2 size={16} />} Verify & Check In Guest
            </button>
          </form>

          {showCameraScanner && (
            <QRCodeScanner
              onScan={handleScanQRData}
              onClose={() => setShowCameraScanner(false)}
            />
          )}

          {checkInResult && (
            <div
              className={`mt-4 p-4 rounded-lg text-sm border flex items-start gap-3 ${
                checkInResult.success
                  ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
                  : "bg-red-500/10 border-red-500/30 text-red-400"
              }`}
            >
              {checkInResult.success ? <CheckCircle2 size={20} /> : <XCircle size={20} />}
              <div>
                <p className="font-bold">{checkInResult.message}</p>
                {checkInResult.data && (
                  <p className="text-xs text-slate-300 mt-1">
                    Guest: <span className="font-bold text-white">{checkInResult.data.customerName}</span> | Package: {checkInResult.data.packageName}
                  </p>
                )}
              </div>
            </div>
          )}
        </div>

        {/* SECTION 4: Bookings Management Data Table */}
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
          {/* Tabs */}
          <div className="flex border-b border-gray-200 overflow-x-auto bg-gray-50">
            <button
              onClick={() => {
                setActiveTab("all");
                setPage(1);
              }}
              className={`px-6 py-3 text-sm font-semibold border-b-2 whitespace-nowrap flex items-center gap-2 ${
                activeTab === "all"
                  ? "border-blue-600 text-blue-600 bg-white"
                  : "border-transparent text-gray-600 hover:text-gray-900"
              }`}
            >
              <Layers size={16} /> All Registrations ({totalAllRegistrations})
            </button>
            <button
              onClick={() => {
                setActiveTab("ticket");
                setPage(1);
              }}
              className={`px-6 py-3 text-sm font-semibold border-b-2 whitespace-nowrap flex items-center gap-2 ${
                activeTab === "ticket"
                  ? "border-blue-600 text-blue-600 bg-white"
                  : "border-transparent text-gray-600 hover:text-gray-900"
              }`}
            >
              <Ticket size={16} /> Tickets ({stats?.totalTickets || 0})
            </button>
            <button
              onClick={() => {
                setActiveTab("exhibitor");
                setPage(1);
              }}
              className={`px-6 py-3 text-sm font-semibold border-b-2 whitespace-nowrap flex items-center gap-2 ${
                activeTab === "exhibitor"
                  ? "border-blue-600 text-blue-600 bg-white"
                  : "border-transparent text-gray-600 hover:text-gray-900"
              }`}
            >
              <Store size={16} /> Exhibitor Booths ({stats?.totalExhibitors || 0})
            </button>
            <button
              onClick={() => {
                setActiveTab("sponsorship");
                setPage(1);
              }}
              className={`px-6 py-3 text-sm font-semibold border-b-2 whitespace-nowrap flex items-center gap-2 ${
                activeTab === "sponsorship"
                  ? "border-blue-600 text-blue-600 bg-white"
                  : "border-transparent text-gray-600 hover:text-gray-900"
              }`}
            >
              <Award size={16} /> Sponsorships ({stats?.totalSponsorships || 0})
            </button>
            <button
              onClick={() => {
                setActiveTab("contact");
                setPage(1);
              }}
              className={`px-6 py-3 text-sm font-semibold border-b-2 whitespace-nowrap flex items-center gap-2 ${
                activeTab === "contact"
                  ? "border-blue-600 text-blue-600 bg-white"
                  : "border-transparent text-gray-600 hover:text-gray-900"
              }`}
            >
              <MessageSquare size={16} /> Contact Messages ({stats?.totalContacts || 0})
            </button>
            <button
              onClick={() => {
                setActiveTab("promoters");
                setPage(1);
              }}
              className={`px-6 py-3 text-sm font-semibold border-b-2 whitespace-nowrap flex items-center gap-2 ${
                activeTab === "promoters"
                  ? "border-amber-600 text-amber-600 bg-white"
                  : "border-transparent text-gray-600 hover:text-gray-900"
              }`}
            >
              <Users size={16} /> Promoters &amp; Commissions ({promoterTotals?.totalPromoters || promoters.length || 0})
            </button>
          </div>

          {/* Search & Filters – only for booking-type tabs */}
          {activeTab !== "promoters" && (
          <div className="p-4 border-b border-gray-200 flex flex-col sm:flex-row gap-3 items-center justify-between">
            <div className="relative w-full sm:w-80">
              <input
                type="text"
                placeholder="Search name, email, ref, or ticket code..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    setPage(1);
                    loadBookings();
                  }
                }}
                className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 focus:ring-2 focus:ring-blue-500"
              />
              <Search className="absolute left-3 top-2.5 text-gray-400" size={16} />
            </div>

            <div className="flex items-center gap-3 w-full sm:w-auto">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Filter size={16} />
                <select
                  value={statusFilter}
                  onChange={(e) => {
                    setStatusFilter(e.target.value);
                    setPage(1);
                  }}
                  className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm bg-white text-gray-800"
                >
                  <option value="all">All Payment Statuses</option>
                  <option value="paid">Paid</option>
                  <option value="pending">Pending</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>

              {/* Super Admin Bulk Delete Trigger */}
              {isSuperAdmin && selectedBookingIds.length > 0 && (
                <button
                  onClick={promptDeleteBulk}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 rounded-lg text-xs font-bold transition-colors"
                >
                  <Trash2 size={14} /> Delete Selected ({selectedBookingIds.length})
                </button>
              )}
            </div>
          </div>
          )}

          {/* Bookings Table – hidden on promoters tab */}
          {activeTab !== "promoters" && (
          <>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-gray-600">
              <thead className="bg-gray-50 text-xs font-bold text-gray-500 uppercase border-b border-gray-200">
                <tr>
                  {isSuperAdmin && (
                    <th className="py-3 px-4 w-10">
                      <input
                        type="checkbox"
                        checked={isAllSelected}
                        onChange={toggleSelectAll}
                        className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                      />
                    </th>
                  )}
                  <th className="py-3 px-4">Customer / Guest</th>
                  <th className="py-3 px-4">Package Tier</th>
                  <th className="py-3 px-4">Amount</th>
                  <th className="py-3 px-4">Payment</th>
                  <th className="py-3 px-4">Gate Status</th>
                  <th className="py-3 px-4">Ticket / Ref Code</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {bookingsLoading ? (
                  <tr>
                    <td colSpan={isSuperAdmin ? 8 : 7} className="text-center py-10">
                      <Loader2 className="animate-spin inline-block text-blue-600" size={24} />
                      <p className="text-xs text-gray-500 mt-2">Loading Trade Fair registrations...</p>
                    </td>
                  </tr>
                ) : bookings.length === 0 ? (
                  <tr>
                    <td colSpan={isSuperAdmin ? 8 : 7} className="text-center py-10 text-gray-500">
                      No registrations found for this filter in Trade Fair 2026.
                    </td>
                  </tr>
                ) : (
                  bookings.map((item) => (
                    <tr key={item._id} className="hover:bg-gray-50 transition-colors">
                      {isSuperAdmin && (
                        <td className="py-3 px-4">
                          <input
                            type="checkbox"
                            checked={selectedBookingIds.includes(item._id)}
                            onChange={() => toggleSelectBooking(item._id)}
                            className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                          />
                        </td>
                      )}
                      <td className="py-3 px-4">
                        <div className="font-semibold text-gray-900">{item.customerName || item.name}</div>
                        <div className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                          <Mail size={12} /> {item.customerEmail || item.email}
                        </div>
                        {(item.customerPhone || item.phone) && (
                          <div className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                            <Phone size={12} /> {item.customerPhone || item.phone}
                          </div>
                        )}
                        {item.businessName && (
                          <div className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                            <Building2 size={12} /> {item.businessName}
                          </div>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        <span className="font-medium text-gray-900">{item.packageName || item.type}</span>
                        {item.type && (
                          <span className="block text-[11px] text-gray-400 uppercase tracking-wider">
                            {item.type}
                          </span>
                        )}
                        {item.promoterCode && (
                          <span className="inline-flex items-center gap-1 mt-1 px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-300">
                            Partner: {item.promoterCode}
                            {item.promoterCommissionAmount > 0 && ` (₦${item.promoterCommissionAmount.toLocaleString()})`}
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4 font-semibold text-gray-900">
                        {item.amount > 0 ? `₦${item.amount.toLocaleString("en-NG")}` : "Free"}
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold ${
                            item.paymentStatus === "paid"
                              ? "bg-green-100 text-green-700 border border-green-200"
                              : item.paymentStatus === "pending"
                              ? "bg-amber-100 text-amber-700 border border-amber-200"
                              : "bg-red-100 text-red-700 border border-red-200"
                          }`}
                        >
                          {item.paymentStatus === "paid" && <CheckCircle2 size={12} />}
                          {item.paymentStatus === "pending" && <Clock size={12} />}
                          {item.paymentStatus?.toUpperCase() || "N/A"}
                        </span>
                        {item.paymentMethod && (
                          <span className="block text-[10px] text-gray-400 mt-1 uppercase">
                            {item.paymentMethod}
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        {item.checkInStatus === "checked_in" ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold bg-teal-100 text-teal-800">
                            <UserCheck size={12} /> Checked In
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold bg-gray-100 text-gray-600">
                            Unverified
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4 font-mono text-xs">
                        {item.ticketCode ? (
                          <span className="font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded">
                            {item.ticketCode}
                          </span>
                        ) : (
                          <span className="text-gray-400">{item.paymentReference || "—"}</span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => handleInspectBooking(item)}
                            title="Inspect Details"
                            className="p-1.5 text-gray-600 hover:text-blue-600 hover:bg-gray-100 rounded-lg transition-colors"
                          >
                            <Eye size={16} />
                          </button>

                          {item.paymentStatus === "pending" && (
                            <button
                              onClick={() => handleUpdateBooking(item._id, { paymentStatus: "paid" })}
                              title="Mark as Paid"
                              className="px-2.5 py-1 bg-green-50 hover:bg-green-100 text-green-700 font-bold text-xs rounded-lg border border-green-200 inline-flex items-center gap-1 transition-colors"
                            >
                              <Check size={13} /> Mark Paid
                            </button>
                          )}

                          {item.paymentStatus === "paid" && (
                            <button
                              onClick={() => handleResendEmail(item._id, item.customerEmail || item.email)}
                              title="Resend Ticket Email"
                              className="p-1.5 text-gray-600 hover:text-amber-600 hover:bg-gray-100 rounded-lg transition-colors"
                            >
                              <Send size={16} />
                            </button>
                          )}

                          {isSuperAdmin && (
                            <button
                              onClick={() => promptDeleteSingle(item)}
                              title="Delete Record"
                              className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            >
                              <Trash2 size={16} />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination (bookings only) */}
          <div className="p-4 border-t border-gray-200 flex items-center justify-between text-xs text-gray-500">
            <span>
              Page {page} of {totalPages}
            </span>
            <div className="flex gap-2">
              <button
                disabled={page <= 1}
                onClick={() => setPage(page - 1)}
                className="px-3 py-1.5 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
              >
                Previous
              </button>
              <button
                disabled={page >= totalPages}
                onClick={() => setPage(page + 1)}
                className="px-3 py-1.5 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
              >
                Next
              </button>
            </div>
          </div>
          </>
          )}

          {/* Promoters Table */}
          {activeTab === "promoters" && (
            <div>
              {/* Promoters Stats Bar */}
              {promoterTotals && (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 border-b border-gray-200 bg-amber-50">
                  <div className="text-center">
                    <div className="text-xl font-black text-gray-900">{promoterTotals.totalPromoters || 0}</div>
                    <div className="text-[11px] text-gray-500 font-semibold">Total Promoters</div>
                  </div>
                  <div className="text-center">
                    <div className="text-xl font-black text-amber-600">{promoterTotals.totalPendingCommission !== undefined ? `₦${Number(promoterTotals.totalPendingCommission).toLocaleString("en-NG")}` : "—"}</div>
                    <div className="text-[11px] text-gray-500 font-semibold">Pending Commissions</div>
                  </div>
                  <div className="text-center">
                    <div className="text-xl font-black text-green-600">{promoterTotals.totalCommissionPaid !== undefined ? `₦${Number(promoterTotals.totalCommissionPaid).toLocaleString("en-NG")}` : "—"}</div>
                    <div className="text-[11px] text-gray-500 font-semibold">Total Paid Out</div>
                  </div>
                  <div className="text-center">
                    <div className="text-xl font-black text-blue-600">{promoterTotals.totalReferredExhibitors || 0}</div>
                    <div className="text-[11px] text-gray-500 font-semibold">Referred Exhibitors</div>
                  </div>
                </div>
              )}

              {promotersLoading ? (
                <div className="py-14 text-center">
                  <Loader2 className="animate-spin inline-block text-amber-500" size={28} />
                  <p className="text-xs text-gray-500 mt-2">Loading promoters...</p>
                </div>
              ) : promoters.length === 0 ? (
                <div className="py-14 text-center text-gray-400">
                  <Users size={36} className="mx-auto mb-3 text-gray-300" />
                  <p className="text-sm font-semibold">No promoters registered yet.</p>
                  <p className="text-xs mt-1">Promoters register at <code>/bazaar/promoter</code></p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm text-gray-600">
                    <thead className="bg-amber-50 text-xs font-bold text-gray-500 uppercase border-b border-gray-200">
                      <tr>
                        <th className="py-3 px-4">Promoter</th>
                        <th className="py-3 px-4">Code</th>
                        <th className="py-3 px-4">Referred</th>
                        <th className="py-3 px-4">Pending (₦)</th>
                        <th className="py-3 px-4">Paid Out (₦)</th>
                        <th className="py-3 px-4">Bank Details</th>
                        <th className="py-3 px-4">Status</th>
                        <th className="py-3 px-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {promoters.map((p) => (
                        <tr key={p._id} className="hover:bg-gray-50 transition-colors">
                          <td className="py-3 px-4">
                            <div className="font-semibold text-gray-900 text-xs">{p.name}</div>
                            <div className="text-[11px] text-gray-500">{p.email}</div>
                            <div className="text-[11px] text-gray-500">{p.phone}</div>
                          </td>
                          <td className="py-3 px-4">
                            <span className="font-mono font-bold text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-lg text-xs">
                              {p.promoterCode}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-center">
                            <div className="text-sm font-bold text-gray-900">{p.stats?.totalReferredExhibitors || 0}</div>
                            <div className="text-[10px] text-gray-400">({p.stats?.paidExhibitors || 0} paid)</div>
                          </td>
                          <td className="py-3 px-4">
                            <span className={`font-bold text-xs ${ (p.stats?.pendingCommission || 0) > 0 ? "text-amber-600" : "text-gray-400"}` }>
                              ₦{(p.stats?.pendingCommission || 0).toLocaleString("en-NG")}
                            </span>
                          </td>
                          <td className="py-3 px-4">
                            <span className="font-bold text-xs text-green-600">
                              ₦{(p.stats?.totalCommissionPaid || 0).toLocaleString("en-NG")}
                            </span>
                          </td>
                          <td className="py-3 px-4">
                            <div className="text-[11px] text-gray-700 font-semibold">{p.bankDetails?.bankName}</div>
                            <div className="font-mono text-[11px] text-gray-500">{p.bankDetails?.accountNumber}</div>
                            <div className="text-[11px] text-gray-500">{p.bankDetails?.accountName}</div>
                          </td>
                          <td className="py-3 px-4">
                            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                              p.status === "active"
                                ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                                : "bg-red-50 text-red-700 border-red-200"
                            }`}>
                              {p.status === "active" ? "Active" : "Suspended"}
                            </span>
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex items-center justify-end gap-1.5">
                              {(p.stats?.pendingCommission || 0) > 0 ? (
                                <button
                                  onClick={() => {
                                    setSelectedPromoter(p);
                                    setPayoutAmount(p.stats?.pendingCommission || 0);
                                    setPayoutRef("");
                                    setPayoutNotes("");
                                    setPayoutError(null);
                                    setPayoutModalOpen(true);
                                  }}
                                  title="Record Commission Payout"
                                  className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-lg shadow-sm inline-flex items-center gap-1 transition-colors"
                                >
                                  <Wallet size={12} /> Pay Out
                                </button>
                              ) : (
                                <button
                                  onClick={() => {
                                    setSelectedPromoter(p);
                                    setPayoutAmount(0);
                                    setPayoutRef("");
                                    setPayoutNotes("");
                                    setPayoutError(null);
                                    setPayoutModalOpen(true);
                                  }}
                                  title="View Bank Account & Payout Receipts"
                                  className="px-2.5 py-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold text-xs rounded-lg border border-gray-200 inline-flex items-center gap-1 transition-colors"
                                >
                                  <Wallet size={12} /> Payouts
                                </button>
                              )}
                              <button
                                onClick={() => handleTogglePromoterStatus(p._id, p.status)}
                                title={p.status === "active" ? "Suspend Promoter" : "Reactivate Promoter"}
                                className={`px-2.5 py-1 font-bold text-xs rounded-lg border inline-flex items-center gap-1 transition-colors ${
                                  p.status === "active"
                                    ? "bg-red-50 hover:bg-red-100 text-red-700 border-red-200"
                                    : "bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border-emerald-200"
                                }`}
                              >
                                {p.status === "active" ? <><Lock size={12} /> Suspend</> : <><UserCheck size={12} /> Activate</>}
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Booking Inspection Modal */}
      {showInspectModal && selectedBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white border border-gray-200 rounded-2xl max-w-xl w-full p-6 text-gray-900 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-gray-200 pb-3 mb-4">
              <div>
                <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                  <Ticket className="text-blue-600" size={20} /> Trade Fair Registration Details
                </h3>
                <p className="text-xs text-gray-500 font-mono">ID: {selectedBooking._id}</p>
              </div>
              <button
                onClick={() => setShowInspectModal(false)}
                className="p-1 rounded-full text-gray-400 hover:text-gray-700 hover:bg-gray-100"
              >
                <X size={20} />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3 bg-gray-50 p-4 rounded-xl border border-gray-200">
                <div>
                  <span className="text-gray-500 block">Customer Name</span>
                  <span className="font-bold text-gray-900 text-sm">{selectedBooking.customerName || selectedBooking.name}</span>
                </div>
                <div>
                  <span className="text-gray-500 block">Package Tier</span>
                  <span className="font-bold text-blue-600 text-sm">{selectedBooking.packageName || selectedBooking.type}</span>
                </div>
                <div>
                  <span className="text-gray-500 block">Email Address</span>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span className="font-medium text-gray-900 truncate">{selectedBooking.customerEmail || selectedBooking.email}</span>
                    <button
                      onClick={() => handleCopyText(selectedBooking.customerEmail || selectedBooking.email, "email")}
                      className="text-gray-400 hover:text-gray-700"
                    >
                      <Copy size={12} />
                    </button>
                    {copiedField === "email" && <span className="text-[10px] text-green-600">Copied!</span>}
                  </div>
                </div>
                <div>
                  <span className="text-gray-500 block">Phone Number</span>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span className="font-medium text-gray-900">{selectedBooking.customerPhone || selectedBooking.phone || "N/A"}</span>
                    {(selectedBooking.customerPhone || selectedBooking.phone) && (
                      <button
                        onClick={() => handleCopyText(selectedBooking.customerPhone || selectedBooking.phone, "phone")}
                        className="text-gray-400 hover:text-gray-700"
                      >
                        <Copy size={12} />
                      </button>
                    )}
                    {copiedField === "phone" && <span className="text-[10px] text-green-600">Copied!</span>}
                  </div>
                </div>
              </div>

              {selectedBooking.businessName && (
                <div className="p-3 bg-gray-50 rounded-xl border border-gray-200">
                  <span className="text-gray-500 block">Company / Business Name</span>
                  <span className="font-bold text-gray-900">{selectedBooking.businessName}</span>
                </div>
              )}

              {selectedBooking.ticketCode && (
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl flex items-center justify-between">
                  <div>
                    <span className="text-[11px] text-blue-700 uppercase tracking-wider font-bold block">Trade Fair 2026 Ticket Code</span>
                    <span className="text-xl font-mono font-bold text-blue-900">{selectedBooking.ticketCode}</span>
                  </div>
                  <button
                    onClick={() => handleCopyText(selectedBooking.ticketCode, "code")}
                    className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold inline-flex items-center gap-1"
                  >
                    <Copy size={13} /> {copiedField === "code" ? "Copied!" : "Copy Code"}
                  </button>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-gray-50 rounded-xl border border-gray-200">
                  <span className="text-gray-500 block">Amount</span>
                  <span className="font-bold text-gray-900">
                    {selectedBooking.amount > 0 ? `₦${selectedBooking.amount.toLocaleString("en-NG")}` : "Free"}
                  </span>
                </div>
                <div className="p-3 bg-gray-50 rounded-xl border border-gray-200">
                  <span className="text-gray-500 block">Payment Method</span>
                  <span className="font-bold uppercase text-gray-900">
                    {selectedBooking.paystackReference
                      ? "Online / Paystack"
                      : (selectedBooking.notes || "").toLowerCase().includes("manual") ||
                        (selectedBooking.notes || "").toLowerCase().includes("bank transfer")
                      ? "Bank Transfer (Manual)"
                      : selectedBooking.registeredBy?.adminId
                      ? "Manual (Admin)"
                      : "Online / Paystack"}
                  </span>
                </div>
                <div className="p-3 bg-gray-50 rounded-xl border border-gray-200">
                  <span className="text-gray-500 block">Payment Status</span>
                  <span
                    className={`font-bold capitalize ${
                      selectedBooking.paymentStatus === "paid"
                        ? "text-green-600"
                        : selectedBooking.paymentStatus === "pending"
                        ? "text-amber-600"
                        : "text-red-600"
                    }`}
                  >
                    {selectedBooking.paymentStatus}
                  </span>
                </div>
                <div className="p-3 bg-gray-50 rounded-xl border border-gray-200">
                  <span className="text-gray-500 block">Gate Check-in</span>
                  <span className={`font-bold ${selectedBooking.checkInStatus === "checked_in" ? "text-teal-600" : "text-gray-600"}`}>
                    {selectedBooking.checkInStatus === "checked_in" ? "Checked In" : "Unchecked"}
                  </span>
                </div>
              </div>

              {selectedBooking.message && (
                <div className="p-3 bg-gray-50 rounded-xl border border-gray-200">
                  <span className="text-gray-500 block mb-1">Attendee / Message Notes</span>
                  <p className="text-gray-800 italic">{selectedBooking.message}</p>
                </div>
              )}

              {selectedBooking.notes && (
                <div className="p-3 bg-amber-50 rounded-xl border border-amber-200">
                  <span className="text-amber-800 font-bold block mb-1">Admin Notes</span>
                  <p className="text-amber-900">{selectedBooking.notes}</p>
                </div>
              )}

              {/* ── Manager Audit & Action Trail ── */}
              {(selectedBooking.registeredBy?.adminId ||
                selectedBooking.paymentApprovedBy?.adminId ||
                selectedBooking.checkedInBy?.adminId ||
                selectedBooking.lastModifiedBy?.adminId ||
                (selectedBooking.auditLogs && selectedBooking.auditLogs.length > 0)) && (
                <div className="rounded-xl border border-slate-200 overflow-hidden">
                  <div className="flex items-center gap-2 bg-slate-800 text-slate-100 px-4 py-2.5">
                    <History size={14} className="text-amber-400" />
                    <span className="text-xs font-bold uppercase tracking-wider">Manager Audit & Action Trail</span>
                    <span className="ml-auto text-[10px] text-slate-400 font-mono">Blame Log</span>
                  </div>

                  {/* Quick summary actor fields */}
                  <div className="bg-slate-50 border-b border-slate-200 px-4 py-3 grid grid-cols-1 gap-2 text-[11px]">
                    {selectedBooking.registeredBy?.adminId && (
                      <div className="flex items-start gap-2">
                        <span className="px-1.5 py-0.5 rounded bg-blue-100 text-blue-700 font-bold text-[10px] shrink-0 mt-0.5">CREATED</span>
                        <span className="text-slate-600">
                          <strong className="text-slate-900">{selectedBooking.registeredBy.name || selectedBooking.registeredBy.email || selectedBooking.registeredBy.adminId}</strong>
                          {selectedBooking.registeredBy.role && <span className="text-slate-400"> [{selectedBooking.registeredBy.role}]</span>}
                          {selectedBooking.registeredBy.at && (
                            <span className="text-slate-400"> · {new Date(selectedBooking.registeredBy.at).toLocaleString("en-NG", { dateStyle: "medium", timeStyle: "short" })}</span>
                          )}
                        </span>
                      </div>
                    )}
                    {selectedBooking.paymentApprovedBy?.adminId && (
                      <div className="flex items-start gap-2">
                        <span className="px-1.5 py-0.5 rounded bg-green-100 text-green-700 font-bold text-[10px] shrink-0 mt-0.5">PAID</span>
                        <span className="text-slate-600">
                          <strong className="text-slate-900">{selectedBooking.paymentApprovedBy.name || selectedBooking.paymentApprovedBy.email || selectedBooking.paymentApprovedBy.adminId}</strong>
                          {selectedBooking.paymentApprovedBy.role && <span className="text-slate-400"> [{selectedBooking.paymentApprovedBy.role}]</span>}
                          {selectedBooking.paymentApprovedBy.at && (
                            <span className="text-slate-400"> · {new Date(selectedBooking.paymentApprovedBy.at).toLocaleString("en-NG", { dateStyle: "medium", timeStyle: "short" })}</span>
                          )}
                        </span>
                      </div>
                    )}
                    {selectedBooking.checkedInBy?.adminId && (
                      <div className="flex items-start gap-2">
                        <span className="px-1.5 py-0.5 rounded bg-teal-100 text-teal-700 font-bold text-[10px] shrink-0 mt-0.5">GATE</span>
                        <span className="text-slate-600">
                          <strong className="text-slate-900">{selectedBooking.checkedInBy.name || selectedBooking.checkedInBy.email || selectedBooking.checkedInBy.adminId}</strong>
                          {selectedBooking.checkedInBy.role && <span className="text-slate-400"> [{selectedBooking.checkedInBy.role}]</span>}
                          {selectedBooking.checkedInBy.at && (
                            <span className="text-slate-400"> · {new Date(selectedBooking.checkedInBy.at).toLocaleString("en-NG", { dateStyle: "medium", timeStyle: "short" })}</span>
                          )}
                        </span>
                      </div>
                    )}
                    {selectedBooking.lastModifiedBy?.adminId && (
                      <div className="flex items-start gap-2">
                        <span className="px-1.5 py-0.5 rounded bg-purple-100 text-purple-700 font-bold text-[10px] shrink-0 mt-0.5">EDIT</span>
                        <span className="text-slate-600">
                          <strong className="text-slate-900">{selectedBooking.lastModifiedBy.name || selectedBooking.lastModifiedBy.email || selectedBooking.lastModifiedBy.adminId}</strong>
                          {selectedBooking.lastModifiedBy.role && <span className="text-slate-400"> [{selectedBooking.lastModifiedBy.role}]</span>}
                          {selectedBooking.lastModifiedBy.at && (
                            <span className="text-slate-400"> · {new Date(selectedBooking.lastModifiedBy.at).toLocaleString("en-NG", { dateStyle: "medium", timeStyle: "short" })}</span>
                          )}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Full event-by-event timeline */}
                  {selectedBooking.auditLogs && selectedBooking.auditLogs.length > 0 && (
                    <div className="divide-y divide-slate-100 max-h-48 overflow-y-auto">
                      {[...selectedBooking.auditLogs].reverse().map((log: any, idx: number) => {
                        const actionColor: Record<string, string> = {
                          MANUAL_REGISTRATION: "bg-blue-500",
                          PAYMENT_MARKED_PAID: "bg-green-500",
                          PAYMENT_STATUS_CHANGE: "bg-amber-500",
                          GATE_CHECK_IN: "bg-teal-500",
                          CHECK_IN_STATUS_CHANGE: "bg-cyan-500",
                          NOTES_UPDATED: "bg-purple-500",
                        };
                        const dot = actionColor[log.action] || "bg-slate-400";
                        return (
                          <div key={idx} className="flex items-start gap-3 px-4 py-2.5 hover:bg-slate-50 transition-colors">
                            <div className={`w-2 h-2 rounded-full mt-1 shrink-0 ${dot}`} />
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between gap-2 flex-wrap">
                                <span className="font-mono text-[10px] font-bold text-slate-600 uppercase tracking-wide">{log.action?.replace(/_/g, " ")}</span>
                                <span className="text-[10px] text-slate-400 shrink-0">
                                  {log.timestamp ? new Date(log.timestamp).toLocaleString("en-NG", { dateStyle: "short", timeStyle: "short" }) : "—"}
                                </span>
                              </div>
                              {log.details && <p className="text-[11px] text-slate-500 mt-0.5 leading-relaxed">{log.details}</p>}
                              {log.performedBy && (
                                <p className="text-[10px] text-slate-400 mt-0.5">
                                  by <strong className="text-slate-600">{log.performedBy.name || log.performedBy.email || log.performedBy.adminId || "System"}</strong>
                                  {log.performedBy.role && <span> [{log.performedBy.role}]</span>}
                                </p>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="mt-6 pt-4 border-t border-gray-200 flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                {selectedBooking.paymentStatus === "pending" && (
                  <button
                    onClick={() => handleUpdateBooking(selectedBooking._id, { paymentStatus: "paid" })}
                    className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-xl text-xs font-bold inline-flex items-center gap-1.5"
                  >
                    <Check size={14} /> Approve & Issue Ticket
                  </button>
                )}
                {selectedBooking.checkInStatus !== "checked_in" && selectedBooking.paymentStatus === "paid" && (
                  <button
                    onClick={() => handleUpdateBooking(selectedBooking._id, { checkInStatus: "checked_in" })}
                    className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-amber-400 rounded-xl text-xs font-bold inline-flex items-center gap-1.5"
                  >
                    <CheckCircle2 size={14} /> Verify Gate Check-In
                  </button>
                )}
                {isSuperAdmin && (
                  <button
                    onClick={() => promptDeleteSingle(selectedBooking)}
                    className="px-4 py-2 bg-red-50 hover:bg-red-100 text-red-700 rounded-xl text-xs font-bold border border-red-200 inline-flex items-center gap-1.5 transition-colors"
                  >
                    <Trash2 size={14} /> Delete Registration
                  </button>
                )}
              </div>

              <button
                type="button"
                onClick={() => setShowInspectModal(false)}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-xs font-bold"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Manual Registration Modal */}
      {showManualModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white border border-gray-200 rounded-2xl max-w-lg w-full p-6 text-gray-900 shadow-2xl relative">
            <div className="flex items-center justify-between border-b border-gray-200 pb-3 mb-4">
              <div>
                <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                  <PlusCircle className="text-blue-600" size={20} /> Register Manual Booking (Trade Fair 2026)
                </h3>
                <p className="text-xs text-gray-500">
                  Register attendees, delegates, or exhibitors who paid via direct bank transfer.
                </p>
              </div>
              <button
                onClick={() => setShowManualModal(false)}
                className="p-1 rounded-full text-gray-400 hover:text-gray-700 hover:bg-gray-100"
              >
                <X size={20} />
              </button>
            </div>

            {manualMsg && (
              <div
                className={`p-3 mb-4 rounded-lg text-xs font-semibold ${
                  manualMsg.success
                    ? "bg-green-50 border border-green-200 text-green-700"
                    : "bg-red-50 border border-red-200 text-red-700"
                }`}
              >
                {manualMsg.text}
              </div>
            )}

            <form onSubmit={handleCreateManualBooking} className="space-y-4">
              {/* Preset Package Selector */}
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Select Package Tier *</label>
                <select
                  value={manualPkgId}
                  onChange={(e) => handlePackageSelect(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-300 rounded-xl px-3 py-2 text-sm text-gray-900 focus:ring-2 focus:ring-blue-500"
                >
                  <optgroup label="Free Admission Passes (₦0)">
                    <option value="standard">🎟️ Free Public Day Pass (₦0 - Free Entry)</option>
                    <option value="vip">🎟️ Free 5-Day Visitor Pass (₦0 - Most Popular)</option>
                    <option value="vvip">💼 Trade Buyer & B2B Pass (₦0 - Commercial)</option>
                    <option value="table">👑 VIP Executive Accreditation (₦0 - VIP)</option>
                  </optgroup>
                  <optgroup label="Official Exhibitor Booths (Dec 1–5)">
                    <option value="tier-micro">🎪 Micro Enterprise (₦150,000 / ₦30,000 daily)</option>
                    <option value="tier-small">🎪 Small Scale Enterprise (₦250,000 / ₦50,000 daily)</option>
                    <option value="tier-bronze">🥉 Bronze Membership (₦375,000 / ₦75,000 daily)</option>
                    <option value="tier-silver">🥈 Silver Membership (₦500,000 / ₦100,000 daily)</option>
                    <option value="tier-gold">🥇 Gold Membership (₦750,000 / ₦150,000 daily)</option>
                    <option value="tier-platinum">💎 Platinum Membership (₦1,000,000 / ₦200,000 daily)</option>
                  </optgroup>
                  <optgroup label="Sponsorship Packages">
                    <option value="sponsor-gold">🏆 Gold Sponsorship (₦500,000)</option>
                    <option value="sponsor-headline">👑 Headline Sponsorship (₦1,500,000)</option>
                  </optgroup>
                </select>
              </div>

              {/* Package Name & Amount */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Package Name</label>
                  <input
                    type="text"
                    required
                    value={manualPkgName}
                    onChange={(e) => setManualPkgName(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-300 rounded-xl px-3 py-2 text-xs text-gray-900"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Amount Paid (₦)</label>
                  <input
                    type="number"
                    required
                    value={manualAmount}
                    onChange={(e) => setManualAmount(Number(e.target.value))}
                    className="w-full bg-gray-50 border border-gray-300 rounded-xl px-3 py-2 text-xs font-bold text-emerald-700"
                  />
                </div>
              </div>

              {/* Customer Full Name */}
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Customer / Delegate Full Name *</label>
                <input
                  type="text"
                  required
                  value={manualName}
                  onChange={(e) => setManualName(e.target.value)}
                  placeholder="e.g. Samuel Okon"
                  className="w-full bg-white border border-gray-300 rounded-xl px-3.5 py-2 text-sm text-gray-900 focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Email & Phone */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Email (Ticket Recipient) *</label>
                  <input
                    type="email"
                    required
                    value={manualEmail}
                    onChange={(e) => setManualEmail(e.target.value)}
                    placeholder="e.g. samuel@example.com"
                    className="w-full bg-white border border-gray-300 rounded-xl px-3 py-2 text-xs text-gray-900 focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Phone Number</label>
                  <input
                    type="text"
                    value={manualPhone}
                    onChange={(e) => setManualPhone(e.target.value)}
                    placeholder="e.g. 08012345678"
                    className="w-full bg-white border border-gray-300 rounded-xl px-3 py-2 text-xs text-gray-900 focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Business Name (Optional) */}
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Company / Organization Name (Optional)</label>
                <input
                  type="text"
                  value={manualBusiness}
                  onChange={(e) => setManualBusiness(e.target.value)}
                  placeholder="e.g. Acme Global Logistics Ltd"
                  className="w-full bg-white border border-gray-300 rounded-xl px-3 py-2 text-xs text-gray-900"
                />
              </div>

              {/* Payment Status & Notes */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Payment Status</label>
                  <select
                    value={manualPaymentStatus}
                    onChange={(e: any) => setManualPaymentStatus(e.target.value)}
                    className="w-full bg-white border border-gray-300 rounded-xl px-3 py-2 text-xs text-gray-900"
                  >
                    <option value="paid">Paid (Dispatches Ticket Email)</option>
                    <option value="pending">Pending (Awaiting Verification)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Audit / Admin Notes</label>
                  <input
                    type="text"
                    value={manualNotes}
                    onChange={(e) => setManualNotes(e.target.value)}
                    placeholder="e.g. Verified transfer receipt on WhatsApp"
                    className="w-full bg-white border border-gray-300 rounded-xl px-3 py-2 text-xs text-gray-900"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-gray-200 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowManualModal(false)}
                  className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-xs font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={manualSubmitting}
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm"
                >
                  {manualSubmitting ? <Loader2 className="animate-spin" size={14} /> : <Check size={14} />} Confirm Registration
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Super Admin Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white border border-red-200 rounded-2xl max-w-md w-full p-6 text-gray-900 shadow-2xl relative">
            <div className="flex items-center gap-3 text-red-600 mb-3">
              <div className="p-3 bg-red-100 rounded-xl">
                <Trash2 size={24} />
              </div>
              <div>
                <h3 className="text-base font-bold text-gray-900">Delete Trade Fair Registration(s)</h3>
                <p className="text-xs text-gray-500">Super Administrator Action</p>
              </div>
            </div>

            <p className="text-xs text-gray-600 leading-relaxed mb-4">
              Are you sure you want to permanently delete{" "}
              <strong>
                {deleteTarget?.type === "bulk"
                  ? `${deleteTarget.ids?.length} selected registration record(s)`
                  : deleteTarget?.item?.customerName || "this registration"}
              </strong>
              ? This action cannot be reversed and ticket codes will be invalidated.
            </p>

            <div className="flex justify-end gap-2">
              <button
                type="button"
                disabled={deleting}
                onClick={() => {
                  setShowDeleteModal(false);
                  setDeleteTarget(null);
                }}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-xs font-bold"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={deleting}
                onClick={confirmDelete}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm"
              >
                {deleting ? <Loader2 className="animate-spin" size={14} /> : <Trash2 size={14} />} Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Promoter Payout Modal */}
      {payoutModalOpen && selectedPromoter && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white border border-gray-200 rounded-2xl max-w-xl w-full p-6 text-gray-900 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-gray-200 pb-3 mb-4">
              <div>
                <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                  <Wallet className="text-emerald-600" size={20} /> Record Commission Payout
                </h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  Promoter: <span className="font-semibold text-gray-900">{selectedPromoter.name}</span>
                  <span className="ml-2 font-mono font-bold bg-amber-50 text-amber-800 border border-amber-200 px-1.5 py-0.5 rounded text-[11px]">
                    {selectedPromoter.promoterCode}
                  </span>
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setPayoutModalOpen(false);
                  setPayoutError(null);
                }}
                className="p-1 rounded-full text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* Beneficiary Bank Account */}
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 mb-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                  <Building2 size={14} className="text-blue-600" /> Beneficiary Bank Account (Nigeria)
                </span>
                <span className="text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full font-semibold">
                  Verified Destination
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs">
                <div className="bg-white p-2.5 rounded-lg border border-slate-200">
                  <div className="text-[10px] text-gray-400 uppercase font-semibold">Bank Name</div>
                  <div className="font-bold text-gray-800 truncate mt-0.5">
                    {selectedPromoter.bankDetails?.bankName || "Not Set"}
                  </div>
                </div>

                <div className="bg-white p-2.5 rounded-lg border border-slate-200">
                  <div className="text-[10px] text-gray-400 uppercase font-semibold flex items-center justify-between">
                    <span>Account Number</span>
                    {selectedPromoter.bankDetails?.accountNumber && (
                      <button
                        type="button"
                        onClick={() => handleCopyText(selectedPromoter.bankDetails.accountNumber, "payoutAcct")}
                        className="text-blue-600 hover:text-blue-800 text-[10px] font-bold flex items-center gap-0.5"
                      >
                        <Copy size={10} /> {copiedField === "payoutAcct" ? "Copied!" : "Copy"}
                      </button>
                    )}
                  </div>
                  <div className="font-mono font-bold text-gray-900 text-sm mt-0.5">
                    {selectedPromoter.bankDetails?.accountNumber || "Not Set"}
                  </div>
                </div>

                <div className="bg-white p-2.5 rounded-lg border border-slate-200">
                  <div className="text-[10px] text-gray-400 uppercase font-semibold">Account Name</div>
                  <div className="font-bold text-gray-800 truncate mt-0.5">
                    {selectedPromoter.bankDetails?.accountName || "Not Set"}
                  </div>
                </div>
              </div>
            </div>

            {/* Financial Overview Cards */}
            <div className="grid grid-cols-3 gap-2.5 mb-4">
              <div className="bg-amber-50/70 border border-amber-200 rounded-xl p-3 text-center">
                <div className="text-[10px] font-semibold text-amber-700 uppercase">Pending Payout</div>
                <div className="text-base font-extrabold text-amber-700 font-mono mt-0.5">
                  ₦{(selectedPromoter.stats?.pendingCommission || 0).toLocaleString("en-NG")}
                </div>
              </div>
              <div className="bg-emerald-50/70 border border-emerald-200 rounded-xl p-3 text-center">
                <div className="text-[10px] font-semibold text-emerald-700 uppercase">Already Paid</div>
                <div className="text-base font-extrabold text-emerald-700 font-mono mt-0.5">
                  ₦{(selectedPromoter.stats?.totalCommissionPaid || 0).toLocaleString("en-NG")}
                </div>
              </div>
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 text-center">
                <div className="text-[10px] font-semibold text-slate-600 uppercase">Total Earned</div>
                <div className="text-base font-extrabold text-slate-800 font-mono mt-0.5">
                  ₦{(selectedPromoter.stats?.totalCommissionEarned || 0).toLocaleString("en-NG")}
                </div>
              </div>
            </div>

            {/* Payout Form */}
            <form onSubmit={handleRecordPayout} className="space-y-3.5">
              {payoutError && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex items-center gap-2">
                  <ShieldAlert size={16} className="shrink-0 text-red-600" />
                  <span>{payoutError}</span>
                </div>
              )}

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-bold text-gray-700">Payout Amount (₦) *</label>
                  {(selectedPromoter.stats?.pendingCommission || 0) > 0 && (
                    <button
                      type="button"
                      onClick={() => setPayoutAmount(selectedPromoter.stats?.pendingCommission || 0)}
                      className="text-[11px] text-emerald-600 hover:text-emerald-700 font-semibold underline"
                    >
                      Pay Full Pending Balance (₦{(selectedPromoter.stats?.pendingCommission || 0).toLocaleString("en-NG")})
                    </button>
                  )}
                </div>
                <input
                  type="number"
                  required
                  min={1}
                  value={payoutAmount || ""}
                  onChange={(e) => setPayoutAmount(Number(e.target.value))}
                  placeholder="Enter amount paid"
                  className="w-full bg-white border border-gray-300 rounded-xl px-3.5 py-2 text-sm font-mono font-bold text-gray-900 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Transfer Reference / Receipt Number *
                </label>
                <input
                  type="text"
                  required
                  value={payoutRef}
                  onChange={(e) => setPayoutRef(e.target.value)}
                  placeholder="e.g. NIBSS Session ID, Bank TRX Ref, or transaction reference"
                  className="w-full bg-white border border-gray-300 rounded-xl px-3.5 py-2 text-xs font-mono text-gray-900 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                />
                <p className="text-[10px] text-gray-500 mt-1">
                  Record the bank transfer confirmation code or transaction receipt number for audit trail.
                </p>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Admin Notes (Optional)</label>
                <input
                  type="text"
                  value={payoutNotes}
                  onChange={(e) => setPayoutNotes(e.target.value)}
                  placeholder="e.g. Disbursed via GTBank Corporate Internet Banking"
                  className="w-full bg-white border border-gray-300 rounded-xl px-3.5 py-2 text-xs text-gray-900 focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="pt-3 border-t border-gray-200 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setPayoutModalOpen(false);
                    setPayoutError(null);
                  }}
                  className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-xs font-bold transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={payoutLoading || payoutAmount <= 0 || !payoutRef.trim()}
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm transition-colors"
                >
                  {payoutLoading ? <Loader2 className="animate-spin" size={14} /> : <Check size={14} />} Confirm Payout
                </button>
              </div>
            </form>

            {/* Payout History Receipts */}
            {selectedPromoter.payouts && selectedPromoter.payouts.length > 0 && (
              <div className="mt-5 pt-4 border-t border-gray-200">
                <h4 className="text-xs font-bold text-gray-800 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <History size={13} className="text-gray-500" /> Past Payout History ({selectedPromoter.payouts.length})
                </h4>
                <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
                  {selectedPromoter.payouts.map((po: any, poIdx: number) => (
                    <div key={poIdx} className="bg-gray-50 border border-gray-200 rounded-xl p-2.5 text-xs flex items-center justify-between">
                      <div>
                        <div className="font-bold text-emerald-700 font-mono">
                          ₦{Number(po.amount).toLocaleString("en-NG")}
                        </div>
                        <div className="text-[10px] text-gray-500 font-mono truncate max-w-[200px]">
                          Ref: {po.reference}
                        </div>
                        {po.notes && (
                          <div className="text-[10px] text-gray-600 italic mt-0.5">{po.notes}</div>
                        )}
                      </div>
                      <div className="text-right">
                        <div className="text-[10px] text-gray-600 font-medium">
                          {po.paidAt ? new Date(po.paidAt).toLocaleDateString("en-NG", { day: "numeric", month: "short", year: "numeric" }) : "N/A"}
                        </div>
                        <div className="text-[9px] text-gray-400">
                          By: {po.paidBy?.name || "Admin"}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
