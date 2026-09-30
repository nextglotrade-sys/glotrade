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
} from "lucide-react";
import { apiGet, apiPut, apiPost, apiPatch, apiDelete } from "@/utils/api";
import QRCodeScanner from "@/components/wallet/QRCodeScanner";

export default function AdminBazaarPage() {
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
    eventVenue: "Nigerian Army Conference Centre & Suites (NACCAS), Km 10 Expressway, Asokoro, Abuja, FCT – Nigeria",
    bankName: "Wema Bank",
    bankAccountName: "GloTrade Platform Limited",
    bankAccountNumber: "0127131496",
    whatsappNumber: "2347044600924",
    email: "tradefair@glotrade.online",
  });
  const [configLoading, setConfigLoading] = useState(true);
  const [configSaving, setConfigSaving] = useState(false);
  const [configMsg, setConfigMsg] = useState<string | null>(null);

  // Gate Check-In Tool State
  const [ticketInput, setTicketInput] = useState("");
  const [checkInLoading, setCheckInLoading] = useState(false);
  const [checkInResult, setCheckInResult] = useState<any>(null);
  const [showCameraScanner, setShowCameraScanner] = useState(false);

  // Manual Booking Modal State
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

  // Bookings List (Defaults to "all" so every registration across all types shows up immediately)
  const [activeTab, setActiveTab] = useState<"all" | "ticket" | "exhibitor" | "sponsorship" | "contact">("all");
  const [bookings, setBookings] = useState<any[]>([]);
  const [bookingsLoading, setBookingsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [actionMsg, setActionMsg] = useState<string | null>(null);

  const handleCopyText = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(label);
    setTimeout(() => setCopiedField(null), 2000);
  };

  // Super Admin & Delete State
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [selectedBookingIds, setSelectedBookingIds] = useState<string[]>([]);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<{ type: 'single' | 'bulk'; item?: any; ids?: string[] } | null>(null);
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
    setDeleteTarget({ type: 'single', item, ids: [item._id] });
    setShowDeleteModal(true);
  };

  const promptDeleteBulk = () => {
    if (selectedBookingIds.length === 0) return;
    setDeleteTarget({ type: 'bulk', ids: selectedBookingIds });
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    setActionMsg(null);
    try {
      if (deleteTarget.type === 'single' && deleteTarget.item) {
        await apiDelete(`/api/v1/bazaar/admin/bookings/${deleteTarget.item._id}`);
        setActionMsg(`Deleted registration for ${deleteTarget.item.customerName} (${deleteTarget.item.ticketCode || deleteTarget.item.reference})`);
      } else if (deleteTarget.type === 'bulk' && deleteTarget.ids) {
        const res: any = await apiPost('/api/v1/bazaar/admin/bookings/bulk-delete', { ids: deleteTarget.ids });
        setActionMsg(res?.message || `Successfully deleted ${deleteTarget.ids.length} registration(s).`);
      }

      setSelectedBookingIds([]);
      setShowDeleteModal(false);
      setShowInspectModal(false);
      setDeleteTarget(null);
      loadStatsAndConfig();
      loadBookings();
    } catch (err: any) {
      alert(err?.message || "Failed to delete registration(s)");
    } finally {
      setDeleting(false);
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

  const eventId = "bazaar_abuja_2026";

  // Fetch Stats & Config
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
      console.error("Failed to load bazaar admin data:", err);
    } finally {
      setStatsLoading(false);
      setConfigLoading(false);
    }
  };

  // Fetch Bookings
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
      console.error("Failed to load bookings:", err);
    } finally {
      setBookingsLoading(false);
    }
  };

  useEffect(() => {
    loadStatsAndConfig();
    loadBookings();
  }, [activeTab, page, statusFilter]);

  // Save Seasonal Controls & Bank Config
  const handleSaveConfig = async () => {
    setConfigSaving(true);
    setConfigMsg(null);
    try {
      const res: any = await apiPut("/api/v1/bazaar/admin/config", config);
      if (res?.data) {
        setConfig(res.data);
        setConfigMsg("Portal controls & bank details updated successfully.");
      }
    } catch (err: any) {
      setConfigMsg(err?.message || "Failed to update settings.");
    } finally {
      setConfigSaving(false);
    }
  };

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

  // Create Manual Registration
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
          text: res.message || "Manual booking created & email dispatched!",
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
      const res: any = await apiPost(`/api/v1/bazaar/admin/bookings/${id}/resend-email`, {});
      setActionMsg(`Ticket confirmation email resent to ${email}`);
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
        setActionMsg("Booking marked as PAID. Ticket email dispatched to customer.");
        setTimeout(() => setActionMsg(null), 4000);
      }
      if (selectedBooking && selectedBooking._id === id && res?.data) {
        setSelectedBooking(res.data);
      }
      loadBookings();
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

        {/* Archive Notice Banner */}
        <div className="p-4 bg-amber-500/10 border border-amber-500/30 text-amber-900 rounded-xl text-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="font-bold uppercase tracking-wider text-xs px-2.5 py-1 bg-amber-200 text-amber-900 rounded-md">Historical Archive</span>
            <span>You are viewing archived records for <strong>GloTrade Abuja Bazaar (Past Event)</strong>.</span>
          </div>
          <Link
            href="/admin/trade-fair"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg shadow-sm w-fit transition-colors"
          >
            Switch to Active Trade Fair 2026 Management &rarr;
          </Link>
        </div>

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-200 pb-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <Ticket className="text-amber-600" size={28} /> GloTrade Abuja Bazaar (Historical Archive)
            </h1>
            <p className="text-sm text-gray-500">
              Archived historical data, ticket logs, attendee checks, and transaction records for the completed Abuja Bazaar.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => setShowManualModal(true)}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-lg text-sm shadow-sm transition-all"
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
              <Power className="text-amber-500" size={20} /> Seasonal Portal Controls & Bank Account Config
            </h2>
            <span
              className={`px-3 py-1 rounded-full text-xs font-bold ${config.isPortalActive
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
                <span className="text-xs font-bold text-gray-900">Event Portal Active</span>
                <input
                  type="checkbox"
                  checked={config.isPortalActive}
                  onChange={(e) => setConfig({ ...config, isPortalActive: e.target.checked })}
                  className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
                />
              </label>
              <p className="text-[11px] text-gray-500 mt-1">Master switch for `/bazaar` accessibility.</p>
            </div>

            {/* Ticket Sales Switch */}
            <div className="p-4 bg-gray-50 rounded-xl border border-gray-200">
              <label className="flex items-center justify-between cursor-pointer">
                <span className="text-xs font-bold text-gray-900">Ticket Sales</span>
                <input
                  type="checkbox"
                  checked={config.ticketSalesActive}
                  onChange={(e) => setConfig({ ...config, ticketSalesActive: e.target.checked })}
                  className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
                />
              </label>
              <p className="text-[11px] text-gray-500 mt-1">Enable or pause ticket purchases.</p>
            </div>

            {/* Exhibitors Switch */}
            <div className="p-4 bg-gray-50 rounded-xl border border-gray-200">
              <label className="flex items-center justify-between cursor-pointer">
                <span className="text-xs font-bold text-gray-900">Exhibitor Applications</span>
                <input
                  type="checkbox"
                  checked={config.exhibitorApplicationsActive}
                  onChange={(e) =>
                    setConfig({ ...config, exhibitorApplicationsActive: e.target.checked })
                  }
                  className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
                />
              </label>
              <p className="text-[11px] text-gray-500 mt-1">Enable or pause booth bookings.</p>
            </div>

            {/* Sponsorship Switch */}
            <div className="p-4 bg-gray-50 rounded-xl border border-gray-200">
              <label className="flex items-center justify-between cursor-pointer">
                <span className="text-xs font-bold text-gray-900">Sponsorship Enquiries</span>
                <input
                  type="checkbox"
                  checked={config.sponsorshipActive}
                  onChange={(e) => setConfig({ ...config, sponsorshipActive: e.target.checked })}
                  className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
                />
              </label>
              <p className="text-[11px] text-gray-500 mt-1">Enable sponsorship applications.</p>
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
                    Manual bank transfer checkout credentials are read-only for Event Bazaar Managers. Only <strong>Super Administrators</strong> can modify official payment account information.
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
                <p className="text-[11px] text-gray-500 mt-1">Country code format without + (e.g. 2347044600924 for (+234) 704-460-0924).</p>
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

        {/* SECTION 2: Metric Stat Cards */}
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
              <span className="text-xs font-medium text-gray-500 uppercase">Tickets</span>
              <Ticket className="text-blue-500" size={20} />
            </div>
            <p className="text-2xl font-bold text-gray-900 mt-2">{stats?.totalTickets || 0}</p>
          </div>

          <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-gray-500 uppercase">Exhibitors</span>
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
            <h2 className="text-base font-bold text-white">Event Gate Ticket Verification & Check-in</h2>
          </div>
          <p className="text-xs text-slate-400 mb-4">
            Enter the 8-character Ticket Code (e.g. `GTB-XXXXXX`) or transaction reference to verify guest entry.
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
              className={`mt-4 p-4 rounded-lg text-sm border flex items-start gap-3 ${checkInResult.success
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
              className={`px-6 py-3 text-sm font-semibold border-b-2 whitespace-nowrap flex items-center gap-2 ${activeTab === "all"
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
              className={`px-6 py-3 text-sm font-semibold border-b-2 whitespace-nowrap flex items-center gap-2 ${activeTab === "ticket"
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
              className={`px-6 py-3 text-sm font-semibold border-b-2 whitespace-nowrap flex items-center gap-2 ${activeTab === "exhibitor"
                ? "border-blue-600 text-blue-600 bg-white"
                : "border-transparent text-gray-600 hover:text-gray-900"
                }`}
            >
              <Store size={16} /> Exhibitor Stalls ({stats?.totalExhibitors || 0})
            </button>
            <button
              onClick={() => {
                setActiveTab("sponsorship");
                setPage(1);
              }}
              className={`px-6 py-3 text-sm font-semibold border-b-2 whitespace-nowrap flex items-center gap-2 ${activeTab === "sponsorship"
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
              className={`px-6 py-3 text-sm font-semibold border-b-2 whitespace-nowrap flex items-center gap-2 ${activeTab === "contact"
                ? "border-blue-600 text-blue-600 bg-white"
                : "border-transparent text-gray-600 hover:text-gray-900"
                }`}
            >
              <MessageSquare size={16} /> Contact Messages ({stats?.totalContacts || 0})
            </button>
          </div>

          {/* Search & Filters */}
          <div className="p-4 border-b border-gray-200 flex flex-col sm:flex-row gap-3 items-center justify-between">
            <div className="relative w-full sm:w-80">
              <input
                type="text"
                placeholder="Search name, email, ref, or ticket code..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && loadBookings()}
                className="w-full bg-gray-50 border border-gray-300 rounded-lg pl-9 pr-4 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <Search className="absolute left-3 top-2.5 text-gray-400" size={16} />
            </div>

            <div className="flex items-center gap-3 w-full sm:w-auto">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="bg-gray-50 border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-700 focus:outline-none"
              >
                <option value="all">All Payment Statuses</option>
                <option value="paid">Paid</option>
                <option value="pending">Pending</option>
                <option value="failed">Failed</option>
              </select>
            </div>
          </div>

          {/* Super Admin Bulk Action Toolbar */}
          {isSuperAdmin && selectedBookingIds.length > 0 && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-3 sm:p-4 mb-4 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-sm">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-red-600 animate-ping"></span>
                <span className="text-xs sm:text-sm font-bold text-red-900">
                  {selectedBookingIds.length} registration(s) selected for deletion
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedBookingIds([])}
                  className="px-3 py-1.5 text-xs font-semibold text-gray-700 hover:text-gray-900 bg-white border border-gray-300 rounded-lg shadow-sm"
                >
                  Deselect All
                </button>
                <button
                  type="button"
                  onClick={promptDeleteBulk}
                  className="px-4 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-bold shadow-sm inline-flex items-center gap-1.5 transition-colors"
                >
                  <Trash2 size={14} /> Delete Selected ({selectedBookingIds.length})
                </button>
              </div>
            </div>
          )}

          {/* Data Table */}
          <div className="overflow-x-auto">
            {bookingsLoading ? (
              <div className="py-12 text-center text-gray-500 text-sm">
                <Loader2 className="animate-spin mx-auto mb-2 text-blue-500" size={24} />
                Loading records...
              </div>
            ) : bookings.length === 0 ? (
              <div className="py-12 text-center text-gray-500 text-sm">
                No records found.
              </div>
            ) : (
              <table className="w-full text-left text-sm text-gray-700">
                <thead className="bg-gray-50 text-xs font-semibold uppercase text-gray-500 border-b border-gray-200">
                  <tr>
                    {isSuperAdmin && (
                      <th className="px-3 py-3 w-10 text-center">
                        <input
                          type="checkbox"
                          checked={isAllSelected}
                          onChange={toggleSelectAll}
                          className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500 cursor-pointer"
                          title="Select all registrations on this page"
                        />
                      </th>
                    )}
                    <th className="px-4 py-3">Code / Ref</th>
                    <th className="px-4 py-3">Customer Info</th>
                    <th className="px-4 py-3">Package & Amount</th>
                    <th className="px-4 py-3">Payment</th>
                    <th className="px-4 py-3">Gate Check-In</th>
                    <th className="px-4 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {bookings.map((item) => (
                    <tr
                      key={item._id}
                      className={`hover:bg-blue-50/50 cursor-pointer transition-colors ${selectedBookingIds.includes(item._id) ? "bg-red-50/40" : ""
                        }`}
                      onClick={() => handleInspectBooking(item)}
                    >
                      {isSuperAdmin && (
                        <td className="px-3 py-3 text-center" onClick={(e) => e.stopPropagation()}>
                          <input
                            type="checkbox"
                            checked={selectedBookingIds.includes(item._id)}
                            onChange={() => toggleSelectBooking(item._id)}
                            className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500 cursor-pointer"
                          />
                        </td>
                      )}
                      <td className="px-4 py-3 font-mono text-xs">
                        <span className="font-bold text-blue-600 block">{item.ticketCode}</span>
                        <span className="text-gray-400 text-[10px]">{item.reference}</span>
                      </td>
                      <td className="px-4 py-3">
                        <p className="font-semibold text-gray-900">{item.customerName}</p>
                        <p className="text-xs text-gray-500">{item.customerEmail} • {item.customerPhone}</p>
                        {item.businessName && (
                          <p className="text-xs text-purple-600 font-medium">Biz: {item.businessName}</p>
                        )}
                        {item.notes && (
                          <p className="text-[11px] text-gray-400 italic truncate max-w-xs">{item.notes}</p>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-[10px] font-bold text-slate-500 uppercase px-1.5 py-0.5 rounded bg-slate-100 border border-slate-200 mr-1.5">
                          {item.type}
                        </span>
                        <span className="font-medium text-gray-900">{item.packageName}</span>
                        <p className="text-xs font-bold text-emerald-600 mt-0.5">
                          ₦{item.amount.toLocaleString("en-NG")}
                        </p>
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-block px-2.5 py-1 rounded-full text-xs font-bold uppercase ${item.paymentStatus === "paid"
                            ? "bg-green-100 text-green-700"
                            : item.paymentStatus === "failed"
                              ? "bg-red-100 text-red-700"
                              : "bg-amber-100 text-amber-700"
                            }`}
                        >
                          {item.paymentStatus}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-block px-2.5 py-1 rounded-full text-xs font-bold ${item.checkInStatus === "checked_in"
                            ? "bg-teal-100 text-teal-800"
                            : "bg-gray-100 text-gray-600"
                            }`}
                        >
                          {item.checkInStatus === "checked_in" ? "Checked-In" : "Pending Gate"}
                        </span>
                      </td>
                      <td
                        className="px-4 py-3 text-right space-x-2 whitespace-nowrap"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <button
                          onClick={() => handleInspectBooking(item)}
                          className="px-2.5 py-1 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded text-xs font-semibold inline-flex items-center gap-1 border border-gray-200"
                          title="Inspect full details"
                        >
                          <Eye size={12} /> Inspect
                        </button>
                        {item.paymentStatus !== "paid" && (
                          <button
                            onClick={() => handleUpdateBooking(item._id, { paymentStatus: "paid" })}
                            className="px-2.5 py-1 bg-green-600 hover:bg-green-700 text-white rounded text-xs font-bold shadow-sm inline-flex items-center gap-1"
                            title="Mark as Paid & Send Ticket Confirmation Email"
                          >
                            <Send size={12} /> Mark Paid & Email
                          </button>
                        )}
                        {item.paymentStatus === "paid" && (
                          <button
                            onClick={() => handleResendEmail(item._id, item.customerEmail)}
                            className="px-2.5 py-1 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded text-xs font-medium border border-blue-200 inline-flex items-center gap-1"
                            title="Resend Ticket Email to Customer"
                          >
                            <Mail size={12} /> Resend Email
                          </button>
                        )}
                        {item.checkInStatus !== "checked_in" && item.paymentStatus === "paid" && (
                          <button
                            onClick={() => handleUpdateBooking(item._id, { checkInStatus: "checked_in" })}
                            className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-amber-400 rounded text-xs font-medium border border-slate-700"
                          >
                            Check In
                          </button>
                        )}
                        {isSuperAdmin && (
                          <button
                            onClick={() => promptDeleteSingle(item)}
                            className="px-2.5 py-1 bg-red-50 hover:bg-red-100 text-red-700 rounded text-xs font-bold border border-red-200 inline-flex items-center gap-1 transition-colors"
                            title="Delete registration (Super Admin only)"
                          >
                            <Trash2 size={12} /> Delete
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="p-4 border-t border-gray-200 flex items-center justify-between text-xs text-gray-500">
              <span>Page {page} of {totalPages}</span>
              <div className="flex gap-2">
                <button
                  disabled={page <= 1}
                  onClick={() => setPage(page - 1)}
                  className="px-3 py-1.5 bg-white border border-gray-300 rounded text-gray-700 disabled:opacity-50"
                >
                  Previous
                </button>
                <button
                  disabled={page >= totalPages}
                  onClick={() => setPage(page + 1)}
                  className="px-3 py-1.5 bg-white border border-gray-300 rounded text-gray-700 disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Booking Inspection Detail Modal */}
      {showInspectModal && selectedBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white border border-gray-200 rounded-2xl max-w-2xl w-full p-6 text-gray-900 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-gray-200 pb-4 mb-4">
              <div>
                <span className="text-xs uppercase font-bold text-blue-600 tracking-wider flex items-center gap-1.5">
                  <Ticket size={14} /> Booking Details Inspection
                </span>
                <div className="flex items-center gap-2 mt-1">
                  <h3 className="text-xl font-mono font-bold text-gray-900">{selectedBooking.ticketCode}</h3>
                  <button
                    onClick={() => handleCopyText(selectedBooking.ticketCode, "ticketCode")}
                    className="p-1 rounded text-gray-400 hover:text-gray-600 hover:bg-gray-100"
                    title="Copy Ticket Code"
                  >
                    {copiedField === "ticketCode" ? <Check size={14} className="text-green-600" /> : <Copy size={14} />}
                  </button>
                </div>
                <p className="text-xs text-gray-500 font-mono">Ref: {selectedBooking.reference}</p>
              </div>
              <button
                onClick={() => setShowInspectModal(false)}
                className="p-1.5 rounded-full text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* Status Badges */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-6">
              <div className="p-3 bg-gray-50 rounded-xl border border-gray-200">
                <span className="text-[10px] uppercase font-bold text-gray-400 block">Payment Status</span>
                <span
                  className={`inline-block px-2.5 py-1 rounded-full text-xs font-bold uppercase mt-1 ${selectedBooking.paymentStatus === "paid"
                    ? "bg-green-100 text-green-700 border border-green-200"
                    : selectedBooking.paymentStatus === "failed"
                      ? "bg-red-100 text-red-700 border border-red-200"
                      : "bg-amber-100 text-amber-700 border border-amber-200"
                    }`}
                >
                  {selectedBooking.paymentStatus}
                </span>
              </div>

              <div className="p-3 bg-gray-50 rounded-xl border border-gray-200">
                <span className="text-[10px] uppercase font-bold text-gray-400 block">Gate Check-In</span>
                <span
                  className={`inline-block px-2.5 py-1 rounded-full text-xs font-bold mt-1 ${selectedBooking.checkInStatus === "checked_in"
                    ? "bg-teal-100 text-teal-800 border border-teal-200"
                    : "bg-gray-100 text-gray-600 border border-gray-200"
                    }`}
                >
                  {selectedBooking.checkInStatus === "checked_in" ? "Checked-In" : "Pending Gate"}
                </span>
              </div>

              <div className="p-3 bg-gray-50 rounded-xl border border-gray-200 sm:col-span-1 col-span-2">
                <span className="text-[10px] uppercase font-bold text-gray-400 block">Registration Date</span>
                <span className="text-xs font-semibold text-gray-800 mt-1 block">
                  {selectedBooking.createdAt ? new Date(selectedBooking.createdAt).toLocaleString() : "N/A"}
                </span>
              </div>
            </div>

            {/* Customer Details Card */}
            <div className="bg-slate-50 border border-gray-200 rounded-xl p-4 mb-5 space-y-3">
              <h4 className="text-xs font-bold text-gray-700 uppercase tracking-wider flex items-center gap-1.5">
                <Users size={14} className="text-blue-600" /> Customer Information
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div>
                  <span className="text-gray-500 block">Full Name:</span>
                  <span className="font-bold text-gray-900 text-sm">{selectedBooking.customerName}</span>
                </div>

                <div>
                  <span className="text-gray-500 block">Email Address:</span>
                  <a
                    href={`mailto:${selectedBooking.customerEmail}`}
                    className="font-medium text-blue-600 hover:underline"
                  >
                    {selectedBooking.customerEmail}
                  </a>
                </div>

                <div>
                  <span className="text-gray-500 block">Phone Number:</span>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="font-bold text-gray-900">{selectedBooking.customerPhone}</span>
                    <a
                      href={`https://wa.me/${selectedBooking.customerPhone.replace(/[^0-9]/g, "")}?text=${encodeURIComponent(
                        `Hi ${selectedBooking.customerName}, regarding your GloTrade International Trade Fair ${selectedBooking.packageName} booking (${selectedBooking.ticketCode})...`
                      )}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-2 py-0.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-[10px] font-bold inline-flex items-center gap-1"
                    >
                      <MessageSquare size={10} /> Chat on WhatsApp
                    </a>
                  </div>
                </div>

                {selectedBooking.businessName && (
                  <div>
                    <span className="text-gray-500 block">Company / Business Name:</span>
                    <span className="font-bold text-purple-700">{selectedBooking.businessName}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Package & Payment Info */}
            <div className="bg-white border border-gray-200 rounded-xl p-4 mb-5 space-y-3">
              <h4 className="text-xs font-bold text-gray-700 uppercase tracking-wider flex items-center gap-1.5">
                <Ticket size={14} className="text-amber-600" /> Package & Financial Details
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div>
                  <span className="text-gray-500 block">Category / Type:</span>
                  <span className="font-bold text-gray-900 uppercase">{selectedBooking.type}</span>
                </div>

                <div>
                  <span className="text-gray-500 block">Package Tier:</span>
                  <span className="font-bold text-gray-900">{selectedBooking.packageName}</span>
                </div>

                <div>
                  <span className="text-gray-500 block">Total Amount:</span>
                  <span className="font-black text-emerald-600 text-base">
                    ₦{selectedBooking.amount.toLocaleString("en-NG")}
                  </span>
                </div>

                <div>
                  <span className="text-gray-500 block">Transaction Reference:</span>
                  <span className="font-mono text-gray-700">{selectedBooking.reference}</span>
                </div>
              </div>

              {selectedBooking.notes && (
                <div className="pt-2 border-t border-gray-100">
                  <span className="text-gray-500 text-xs block mb-1">Customer / Registration Notes:</span>
                  <div className="p-3 bg-amber-50/60 border border-amber-200 rounded-lg text-xs text-amber-900">
                    {selectedBooking.notes}
                  </div>
                </div>
              )}
            </div>

            {/* Manager Action Audit & Blame Trail */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 mb-5 text-white space-y-3 shadow-inner">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <h4 className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                  <ShieldCheck size={14} className="text-amber-400" /> Manager Audit & Action Trail (Blame Log)
                </h4>
                <span className="text-[10px] text-slate-400 font-mono">Traceability</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                {/* Registered By */}
                <div className="p-3 bg-slate-950/80 rounded-lg border border-slate-800 space-y-1">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Registration Origin</span>
                  {selectedBooking.registeredBy ? (
                    <div>
                      <div className="font-bold text-amber-300">{selectedBooking.registeredBy.name}</div>
                      <span className="text-[10px] text-slate-400 block truncate" title={selectedBooking.registeredBy.email}>
                        {selectedBooking.registeredBy.email}
                      </span>
                      <div className="mt-1 flex items-center gap-1">
                        <span className="px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-400 text-[9px] font-bold uppercase border border-amber-500/30">
                          {selectedBooking.registeredBy.role || "Manager"}
                        </span>
                      </div>
                      {selectedBooking.registeredBy.at && (
                        <span className="text-[9px] text-slate-500 block mt-1">
                          {new Date(selectedBooking.registeredBy.at).toLocaleString()}
                        </span>
                      )}
                    </div>
                  ) : (
                    <div>
                      <span className="font-semibold text-slate-300">Public Portal</span>
                      <span className="text-[10px] text-slate-500 block">Customer self-checkout</span>
                      <span className="text-[9px] text-slate-500 block mt-1">
                        {selectedBooking.createdAt ? new Date(selectedBooking.createdAt).toLocaleString() : ""}
                      </span>
                    </div>
                  )}
                </div>

                {/* Payment Approved By */}
                <div className="p-3 bg-slate-950/80 rounded-lg border border-slate-800 space-y-1">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Payment Verification</span>
                  {selectedBooking.paymentApprovedBy ? (
                    <div>
                      <div className="font-bold text-green-400">{selectedBooking.paymentApprovedBy.name}</div>
                      <span className="text-[10px] text-slate-400 block truncate" title={selectedBooking.paymentApprovedBy.email}>
                        {selectedBooking.paymentApprovedBy.email}
                      </span>
                      <div className="mt-1 flex items-center gap-1">
                        <span className="px-1.5 py-0.5 rounded bg-green-500/20 text-green-400 text-[9px] font-bold uppercase border border-green-500/30">
                          {selectedBooking.paymentApprovedBy.role || "Admin"}
                        </span>
                      </div>
                      {selectedBooking.paymentApprovedBy.at && (
                        <span className="text-[9px] text-slate-500 block mt-1">
                          {new Date(selectedBooking.paymentApprovedBy.at).toLocaleString()}
                        </span>
                      )}
                    </div>
                  ) : selectedBooking.paymentStatus === "paid" ? (
                    <div>
                      <span className="font-semibold text-emerald-400">Paystack Gateway</span>
                      <span className="text-[10px] text-slate-500 block">Automated online verification</span>
                      {selectedBooking.paystackReference && (
                        <span className="text-[9px] font-mono text-slate-500 block truncate mt-1">
                          {selectedBooking.paystackReference}
                        </span>
                      )}
                    </div>
                  ) : (
                    <div>
                      <span className="font-semibold text-amber-400">Pending Review</span>
                      <span className="text-[10px] text-slate-500 block">Awaiting bank credit confirmation</span>
                    </div>
                  )}
                </div>

                {/* Gate Checked In By */}
                <div className="p-3 bg-slate-950/80 rounded-lg border border-slate-800 space-y-1">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Gate Admittance</span>
                  {selectedBooking.checkedInBy ? (
                    <div>
                      <div className="font-bold text-teal-400">{selectedBooking.checkedInBy.name}</div>
                      <span className="text-[10px] text-slate-400 block truncate" title={selectedBooking.checkedInBy.email}>
                        {selectedBooking.checkedInBy.email}
                      </span>
                      <div className="mt-1 flex items-center gap-1">
                        <span className="px-1.5 py-0.5 rounded bg-teal-500/20 text-teal-400 text-[9px] font-bold uppercase border border-teal-500/30">
                          {selectedBooking.checkedInBy.role || "Scanner"}
                        </span>
                      </div>
                      {selectedBooking.checkInTime && (
                        <span className="text-[9px] text-slate-500 block mt-1">
                          {new Date(selectedBooking.checkInTime).toLocaleString()}
                        </span>
                      )}
                    </div>
                  ) : selectedBooking.checkInStatus === "checked_in" ? (
                    <div>
                      <span className="font-semibold text-teal-400">Admitted & Checked In</span>
                      <span className="text-[10px] text-slate-500 block">
                        {selectedBooking.checkInTime ? new Date(selectedBooking.checkInTime).toLocaleString() : "Verified"}
                      </span>
                    </div>
                  ) : (
                    <div>
                      <span className="font-semibold text-slate-400">Pending Gate</span>
                      <span className="text-[10px] text-slate-500 block">Awaiting physical barcode scan</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Action History Log */}
              {selectedBooking.auditLogs && selectedBooking.auditLogs.length > 0 && (
                <div className="pt-2 border-t border-slate-800">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1.5 flex items-center gap-1">
                    <History size={12} className="text-amber-400" /> Action Chronology ({selectedBooking.auditLogs.length}):
                  </span>
                  <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
                    {selectedBooking.auditLogs.map((log: any, idx: number) => (
                      <div
                        key={idx}
                        className="p-2 bg-slate-950/90 rounded-lg border border-slate-800 flex items-start justify-between text-[11px] gap-2"
                      >
                        <div className="space-y-0.5 min-w-0">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="font-bold text-amber-300">{log.performedBy?.name || "Manager"}</span>
                            <span className="text-[9px] px-1.5 py-0.2 bg-slate-800 text-slate-300 rounded font-mono">
                              {log.performedBy?.role || "admin"}
                            </span>
                            <span className="text-[10px] font-mono text-amber-400/80 bg-amber-500/10 px-1 rounded">
                              {log.action}
                            </span>
                          </div>
                          {log.details && (
                            <p className="text-slate-300 text-[10px] leading-relaxed break-words">{log.details}</p>
                          )}
                        </div>
                        <span className="text-[9px] text-slate-500 shrink-0 font-mono">
                          {log.timestamp ? new Date(log.timestamp).toLocaleString() : ""}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Actions Bar */}
            <div className="pt-3 border-t border-gray-200 flex flex-wrap items-center justify-between gap-3">
              <div className="flex gap-2">
                {selectedBooking.paymentStatus !== "paid" && (
                  <button
                    onClick={() => handleUpdateBooking(selectedBooking._id, { paymentStatus: "paid" })}
                    className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-xl text-xs font-bold shadow-sm inline-flex items-center gap-1.5"
                  >
                    <Send size={14} /> Mark Paid & Send Ticket Email
                  </button>
                )}
                {selectedBooking.paymentStatus === "paid" && (
                  <button
                    onClick={() => handleResendEmail(selectedBooking._id, selectedBooking.customerEmail)}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-sm inline-flex items-center gap-1.5"
                  >
                    <Mail size={14} /> Resend Ticket Confirmation Email
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
                  <PlusCircle className="text-amber-500" size={20} /> Register Manual Booking
                </h3>
                <p className="text-xs text-gray-500">
                  Register attendees or exhibitors who paid via manual bank transfer on WhatsApp.
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
                className={`p-3 mb-4 rounded-lg text-xs font-semibold ${manualMsg.success
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
                <label className="block text-xs font-bold text-gray-700 mb-1">Customer Full Name *</label>
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
                  <label className="block text-xs font-bold text-gray-700 mb-1">Customer Email *</label>
                  <input
                    type="email"
                    required
                    value={manualEmail}
                    onChange={(e) => setManualEmail(e.target.value)}
                    placeholder="guest@domain.com"
                    className="w-full bg-white border border-gray-300 rounded-xl px-3 py-2 text-xs text-gray-900 focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Phone Number *</label>
                  <input
                    type="tel"
                    required
                    value={manualPhone}
                    onChange={(e) => setManualPhone(e.target.value)}
                    placeholder="+234 803 123 4567"
                    className="w-full bg-white border border-gray-300 rounded-xl px-3 py-2 text-xs text-gray-900 focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Business Name (Optional) */}
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Company / Business Name (Optional)</label>
                <input
                  type="text"
                  value={manualBusiness}
                  onChange={(e) => setManualBusiness(e.target.value)}
                  placeholder="e.g. AfriCrafts Ltd"
                  className="w-full bg-white border border-gray-300 rounded-xl px-3 py-2 text-xs text-gray-900"
                />
              </div>

              {/* Payment Status & Notes */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Payment Status</label>
                  <select
                    value={manualPaymentStatus}
                    onChange={(e) => setManualPaymentStatus(e.target.value as any)}
                    className="w-full bg-gray-50 border border-gray-300 rounded-xl px-3 py-2 text-xs font-bold text-gray-900"
                  >
                    <option value="paid">Paid (Dispatches Ticket Email)</option>
                    <option value="pending">Pending Verification</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Notes / Bank Ref</label>
                  <input
                    type="text"
                    value={manualNotes}
                    onChange={(e) => setManualNotes(e.target.value)}
                    placeholder="e.g. Bank transfer on WhatsApp"
                    className="w-full bg-white border border-gray-300 rounded-xl px-3 py-2 text-xs text-gray-900"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-gray-200 flex justify-end gap-3">
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
                  className="px-5 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-xs shadow-md inline-flex items-center gap-2"
                >
                  {manualSubmitting ? <Loader2 className="animate-spin" size={14} /> : <Send size={14} />} Register & Issue Ticket Email
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* Super Admin Delete Confirmation Modal */}
      {showDeleteModal && deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white border border-red-200 rounded-2xl max-w-md w-full p-6 text-gray-900 shadow-2xl relative">
            <div className="flex items-center justify-between border-b border-gray-200 pb-3 mb-4">
              <h3 className="text-base font-bold text-red-600 flex items-center gap-2">
                <Trash2 size={20} /> Confirm Permanent Deletion
              </h3>
              <button
                type="button"
                onClick={() => !deleting && setShowDeleteModal(false)}
                className="p-1 rounded-full text-gray-400 hover:text-gray-700 hover:bg-gray-100"
              >
                <X size={18} />
              </button>
            </div>

            <div className="space-y-3 mb-6">
              <div className="p-4 bg-red-50 border border-red-200 rounded-xl">
                {deleteTarget.type === "single" && deleteTarget.item ? (
                  <>
                    <p className="text-sm font-bold text-red-900">
                      Delete registration for <span className="underline">{deleteTarget.item.customerName}</span>?
                    </p>
                    <p className="text-xs text-red-700 mt-1">
                      Ticket Code: <strong>{deleteTarget.item.ticketCode || "N/A"}</strong> • Ref: <strong>{deleteTarget.item.reference}</strong>
                    </p>
                    <p className="text-xs text-red-700 mt-1">
                      Package: <strong>{deleteTarget.item.packageName}</strong> (₦{deleteTarget.item.amount?.toLocaleString("en-NG")})
                    </p>
                  </>
                ) : (
                  <>
                    <p className="text-sm font-bold text-red-900">
                      Delete {deleteTarget.ids?.length} selected registration(s)?
                    </p>
                    <p className="text-xs text-red-700 mt-1">
                      All selected test/obsolete tickets and registration records will be permanently deleted from the database.
                    </p>
                  </>
                )}
              </div>
              <p className="text-xs text-gray-500 italic">
                ⚠️ Warning: This action cannot be undone.
              </p>
            </div>

            <div className="flex justify-end gap-3 pt-3 border-t border-gray-200">
              <button
                type="button"
                onClick={() => setShowDeleteModal(false)}
                disabled={deleting}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-xs font-bold disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmDelete}
                disabled={deleting}
                className="px-5 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold shadow-md inline-flex items-center gap-2 disabled:opacity-50"
              >
                {deleting ? <Loader2 className="animate-spin" size={14} /> : <Trash2 size={14} />} Confirm & Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
