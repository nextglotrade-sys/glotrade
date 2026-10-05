"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import AdminLayout from "@/components/admin/AdminLayout";
import { apiGet, apiPost } from "@/utils/api";
import { formatCurrency } from "@/utils/format";
import Modal from "@/components/common/Modal";
import { CheckCircle2, ShieldCheck, AlertCircle, Ban, Plus, Loader2, Sparkles, UserCheck } from "lucide-react";

interface Partner {
    _id: string;
    userId: string;
    name: string;
    email: string;
    phone?: string;
    role?: string;
    businessType: string;
    isVerified: boolean;
    kycVerified: boolean;
    kycStatus: string;
    isBlocked: boolean;
    accountStatus: string;
    totalTPIAs: number;
    totalInvested: number;
    totalProfit: number;
    walletBalance?: number;
    joinedDate: string;
}

interface PartnerSearchResult {
    _id: string;
    username: string;
    name: string;
    email: string;
    phone?: string;
    isBlocked?: boolean;
    kycStatus?: string;
}

interface AssignmentPreview {
    gdcNumber: number;
    positionInGDC: number;
    tpiaNumber: number;
}

interface CreatedTPIA {
    _id: string;
    tpiaId: string;
    gdcNumber: number;
    positionInGDC: number;
}

export default function AdminPartnersPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [partners, setPartners] = useState<Partner[]>([]);
    const [filteredPartners, setFilteredPartners] = useState<Partner[]>([]);
    const [kycFilter, setKycFilter] = useState<string>("all");
    const [searchTerm, setSearchTerm] = useState("");
    const [actionLoading, setActionLoading] = useState<string | null>(null);
    const [actionToast, setActionToast] = useState<{ type: "success" | "error"; message: string } | null>(null);
    const [confirmAction, setConfirmAction] = useState<{ type: "verify" | "block"; partner: Partner } | null>(null);
    const [verifiedSuccessPartner, setVerifiedSuccessPartner] = useState<Partner | null>(null);
    const [showManualPurchaseModal, setShowManualPurchaseModal] = useState(false);
    const [showManualConfirm, setShowManualConfirm] = useState(false);
    const [partnerSearch, setPartnerSearch] = useState("");
    const [partnerSearchResults, setPartnerSearchResults] = useState<PartnerSearchResult[]>([]);
    const [selectedPartner, setSelectedPartner] = useState<PartnerSearchResult | null>(null);
    const [manualProfitMode, setManualProfitMode] = useState<"TPM" | "EPS">("TPM");
    const [manualQuantity, setManualQuantity] = useState(1);
    const [manualAmount, setManualAmount] = useState("1000000");
    const [manualBankReference, setManualBankReference] = useState("");
    const [manualDepositDate, setManualDepositDate] = useState(() => new Date().toISOString().split("T")[0]);
    const [manualNote, setManualNote] = useState("");
    const [assignmentPreview, setAssignmentPreview] = useState<AssignmentPreview[]>([]);
    const [createdTPIAs, setCreatedTPIAs] = useState<CreatedTPIA[]>([]);
    const [manualError, setManualError] = useState("");
    const [manualSubmitting, setManualSubmitting] = useState(false);

    const TPIA_PRICE = 1000000;

    useEffect(() => {
        fetchPartners();
    }, []);

    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        if (params.get("createTPIA") === "1") {
            setShowManualPurchaseModal(true);
        }
    }, []);

    useEffect(() => {
        filterPartners();
    }, [kycFilter, searchTerm, partners]);

    useEffect(() => {
        setManualAmount(String(manualQuantity * TPIA_PRICE));
    }, [manualQuantity]);

    useEffect(() => {
        if (!showManualPurchaseModal) {
            return;
        }

        fetchAssignmentPreview(manualQuantity);
    }, [showManualPurchaseModal, manualQuantity]);

    useEffect(() => {
        if (!showManualPurchaseModal || partnerSearch.trim().length < 2) {
            setPartnerSearchResults([]);
            return;
        }

        const timeout = window.setTimeout(() => {
            searchPartners(partnerSearch);
        }, 300);

        return () => window.clearTimeout(timeout);
    }, [partnerSearch, showManualPurchaseModal]);

    const fetchPartners = async () => {
        try {
            setLoading(true);
            const response = await apiGet<{ success: boolean; data: Partner[] }>("/api/v1/gdip/admin/partners");

            if (response.success && Array.isArray(response.data)) {
                setPartners(response.data);
                setFilteredPartners(response.data);
            }
        } catch (err: any) {
            console.error("Error fetching partners:", err);
        } finally {
            setLoading(false);
        }
    };

    const handleVerifyPartner = async (partner: Partner) => {
        try {
            setActionLoading(partner._id);
            const res = await apiPost<{ success: boolean; message: string; data: any }>(`/api/v1/gdip/admin/partners/${partner._id}/verify`);
            if (res.success) {
                setPartners(prev => prev.map(p => p._id === partner._id ? { ...p, isVerified: true, kycVerified: true, kycStatus: "verified" } : p));
                setVerifiedSuccessPartner(partner);
                setActionToast({ type: "success", message: `${partner.name} verified successfully. Self-service TPIA purchases unlocked!` });
            }
        } catch (err: any) {
            setActionToast({ type: "error", message: err.message || "Failed to verify partner" });
        } finally {
            setActionLoading(null);
            setConfirmAction(null);
            setTimeout(() => setActionToast(null), 4500);
        }
    };

    const handleToggleBlock = async (partner: Partner) => {
        try {
            setActionLoading(partner._id);
            const res = await apiPost<{ success: boolean; message: string; data: any }>(`/api/v1/gdip/admin/partners/${partner._id}/toggle-block`);
            if (res.success) {
                const isBlocked = res.data?.isBlocked ?? !partner.isBlocked;
                setPartners(prev => prev.map(p => p._id === partner._id ? { ...p, isBlocked, accountStatus: isBlocked ? "suspended" : "active" } : p));
                setActionToast({ type: "success", message: isBlocked ? `${partner.name} account suspended.` : `${partner.name} account reactivated.` });
            }
        } catch (err: any) {
            setActionToast({ type: "error", message: err.message || "Failed to update partner standing" });
        } finally {
            setActionLoading(null);
            setConfirmAction(null);
            setTimeout(() => setActionToast(null), 4500);
        }
    };

    const requestConfirm = (type: "verify" | "block", partner: Partner) => {
        setConfirmAction({ type, partner });
    };

    const handleOpenManualForPartner = (partner: Partner) => {
        setSelectedPartner({
            _id: partner._id,
            username: partner.email,
            name: partner.name,
            email: partner.email,
            phone: partner.phone,
            isBlocked: partner.isBlocked,
            kycStatus: partner.kycStatus
        });
        setShowManualPurchaseModal(true);
    };

    const searchPartners = async (query: string) => {
        try {
            const response = await apiGet<{ success: boolean; data: PartnerSearchResult[] }>("/api/v1/gdip/admin/partners/search", {
                query: { query, limit: 8 }
            });
            if (response.success) {
                setPartnerSearchResults(response.data || []);
            }
        } catch (err) {
            console.error("Error searching partners:", err);
        }
    };

    const fetchAssignmentPreview = async (quantity: number) => {
        try {
            const response = await apiGet<{ success: boolean; data: AssignmentPreview[] }>("/api/v1/gdip/admin/tpia/manual-purchase/preview", {
                query: { quantity }
            });
            if (response.success) {
                setAssignmentPreview(response.data || []);
            }
        } catch (err) {
            console.error("Error previewing assignment:", err);
            setAssignmentPreview([]);
        }
    };

    const resetManualPurchaseForm = () => {
        setPartnerSearch("");
        setPartnerSearchResults([]);
        setSelectedPartner(null);
        setManualProfitMode("TPM");
        setManualQuantity(1);
        setManualAmount(String(TPIA_PRICE));
        setManualBankReference("");
        setManualDepositDate(new Date().toISOString().split("T")[0]);
        setManualNote("");
        setAssignmentPreview([]);
        setCreatedTPIAs([]);
        setManualError("");
    };

    const closeManualPurchaseModal = () => {
        if (manualSubmitting) return;
        setShowManualPurchaseModal(false);
        setShowManualConfirm(false);
        resetManualPurchaseForm();
        const params = new URLSearchParams(window.location.search);
        if (params.get("createTPIA") === "1") {
            router.replace("/admin/gdip/partners");
        }
    };

    const handleInitiateManualPurchase = () => {
        const expectedAmount = manualQuantity * TPIA_PRICE;

        if (!selectedPartner) {
            setManualError("Select the partner who made the bank deposit.");
            return;
        }

        if (!manualBankReference.trim()) {
            setManualError("Enter the bank deposit reference.");
            return;
        }

        if (Number(manualAmount) !== expectedAmount) {
            setManualError(`Amount received must be ${formatCurrency(expectedAmount)} for ${manualQuantity} TPIA block${manualQuantity > 1 ? "s" : ""}.`);
            return;
        }

        setManualError("");
        setShowManualConfirm(true);
    };

    const handleManualPurchase = async () => {
        try {
            setManualSubmitting(true);
            setManualError("");
            const response = await apiPost<{ success: boolean; data: CreatedTPIA[] }>("/api/v1/gdip/admin/tpia/manual-purchase", {
                partnerId: selectedPartner!._id,
                profitMode: manualProfitMode,
                quantity: manualQuantity,
                amountReceived: Number(manualAmount),
                bankReference: manualBankReference.trim(),
                depositedAt: manualDepositDate,
                note: manualNote.trim() || undefined
            });

            setShowManualConfirm(false);
            setCreatedTPIAs(Array.isArray(response.data) ? response.data : []);
            fetchPartners();
        } catch (err: any) {
            setShowManualConfirm(false);
            setManualError(err.message || "Failed to create manual TPIA purchase.");
        } finally {
            setManualSubmitting(false);
        }
    };

    const filterPartners = () => {
        let filtered = partners;

        // Filter by KYC status
        if (kycFilter === "verified") {
            filtered = filtered.filter((p) => p.isVerified || p.kycVerified);
        } else if (kycFilter === "unverified") {
            filtered = filtered.filter((p) => !p.isVerified && !p.kycVerified);
        }

        // Filter by search term
        if (searchTerm) {
            const term = searchTerm.toLowerCase();
            filtered = filtered.filter(
                (p) =>
                    p.name.toLowerCase().includes(term) ||
                    p.email.toLowerCase().includes(term) ||
                    (p.phone && p.phone.toLowerCase().includes(term))
            );
        }

        setFilteredPartners(filtered);
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString("en-NG", {
            year: "numeric",
            month: "short",
            day: "numeric",
        });
    };

    if (loading) {
        return (
            <AdminLayout>
                <div className="min-h-screen flex items-center justify-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                </div>
            </AdminLayout>
        );
    }

    return (
        <AdminLayout>
            <div className="space-y-6">
                {/* Action Toast Alert */}
                {actionToast && (
                    <div className={`p-4 rounded-xl border flex items-center justify-between shadow-sm transition-all ${
                        actionToast.type === "success" 
                            ? "bg-emerald-50 border-emerald-200 text-emerald-800" 
                            : "bg-red-50 border-red-200 text-red-800"
                    }`}>
                        <div className="flex items-center gap-3">
                            {actionToast.type === "success" ? (
                                <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
                            ) : (
                                <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
                            )}
                            <p className="text-sm font-semibold">{actionToast.message}</p>
                        </div>
                        <button 
                            onClick={() => setActionToast(null)} 
                            className="text-xs font-bold uppercase tracking-wider px-2 py-1 rounded hover:bg-black/5"
                        >
                            Dismiss
                        </button>
                    </div>
                )}

                {/* Header */}
                <div className="mb-8">
                    <button
                        onClick={() => router.back()}
                        className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                        Back to Dashboard
                    </button>
                    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                        <div>
                            <h1 className="text-2xl md:text-4xl font-bold text-gray-900 mb-2">GDIP Partners</h1>
                            <p className="text-gray-600">Manage, verify, and service Trusted Insured Partners</p>
                        </div>
                        <button
                            onClick={() => setShowManualPurchaseModal(true)}
                            className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-700"
                        >
                            <Plus className="w-4 h-4" /> Create TPIA
                        </button>
                    </div>
                </div>

                {/* Stats */}
                {partners.length > 0 && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-8">
                        <div className="bg-white rounded-2xl shadow-lg p-6">
                            <p className="text-sm text-gray-600 mb-1">Total Partners</p>
                            <p className="text-3xl font-bold text-gray-900">{partners.length}</p>
                        </div>
                        <div className="bg-white rounded-2xl shadow-lg p-6">
                            <p className="text-sm text-gray-600 mb-1">KYC Verified</p>
                            <p className="text-3xl font-bold text-green-600">
                                {partners.filter((p) => p.isVerified || p.kycVerified).length}
                            </p>
                        </div>
                        <div className="bg-white rounded-2xl shadow-lg p-6">
                            <p className="text-sm text-gray-600 mb-1">Total Invested</p>
                            <p className="text-2xl font-bold text-blue-600">
                                {formatCurrency(partners.reduce((sum, p) => sum + p.totalInvested, 0))}
                            </p>
                        </div>
                        <div className="bg-white rounded-2xl shadow-lg p-6">
                            <p className="text-sm text-gray-600 mb-1">Total Profit</p>
                            <p className="text-2xl font-bold text-green-600">
                                {formatCurrency(partners.reduce((sum, p) => sum + p.totalProfit, 0))}
                            </p>
                        </div>
                    </div>
                )}

                {/* Filters */}
                <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
                    <div className="flex flex-col md:flex-row gap-4">
                        <div className="flex-1">
                            <input
                                type="text"
                                placeholder="Search by name, email, or phone..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                        </div>
                        <select
                            value={kycFilter}
                            onChange={(e) => setKycFilter(e.target.value)}
                            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                            <option value="all">All Partners</option>
                            <option value="verified">KYC Verified</option>
                            <option value="unverified">KYC Pending / Unverified</option>
                        </select>
                        <span className="text-sm text-gray-600 flex items-center">
                            Showing {filteredPartners.length} of {partners.length}
                        </span>
                    </div>
                </div>

                {/* Partners Table - Desktop */}
                <div className="bg-white rounded-2xl shadow-lg overflow-hidden hidden md:block">
                    <table className="w-full">
                        <thead className="bg-gray-50 border-b border-gray-200">
                            <tr>
                                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Partner
                                </th>
                                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    KYC / Standing
                                </th>
                                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    TPIAs
                                </th>
                                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Total Invested
                                </th>
                                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Wallet Balance
                                </th>
                                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Joined
                                </th>
                                <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {filteredPartners.map((partner) => {
                                const isVerified = Boolean(partner.isVerified || partner.kycVerified);
                                const isBlocked = Boolean(partner.isBlocked);
                                const isBusy = actionLoading === partner._id;

                                return (
                                    <tr key={partner._id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div>
                                                <p className="font-bold text-gray-900">{partner.name}</p>
                                                <p className="text-xs text-gray-500">{partner.email}</p>
                                                {partner.phone && (
                                                    <p className="text-[11px] text-gray-400 mt-0.5">{partner.phone}</p>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col gap-1 items-start">
                                                <span
                                                    className={`px-2.5 py-1 rounded-full text-xs font-semibold inline-flex items-center gap-1 ${
                                                        isVerified
                                                            ? "bg-green-100 text-green-700"
                                                            : "bg-yellow-100 text-yellow-800"
                                                    }`}
                                                >
                                                    {isVerified ? (
                                                        <><CheckCircle2 className="w-3.5 h-3.5" /> Verified</>
                                                    ) : (
                                                        <><AlertCircle className="w-3.5 h-3.5" /> Pending KYC</>
                                                    )}
                                                </span>
                                                {isBlocked && (
                                                    <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-red-100 text-red-700">
                                                        Suspended
                                                    </span>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="font-bold text-gray-900">{partner.totalTPIAs}</span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="font-bold text-gray-900">{formatCurrency(partner.totalInvested)}</span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="font-semibold text-gray-700">{formatCurrency(partner.walletBalance || 0)}</span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="text-xs text-gray-600">{formatDate(partner.joinedDate)}</span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                {!isVerified && (
                                                    <button
                                                        onClick={() => requestConfirm("verify", partner)}
                                                        disabled={isBusy}
                                                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-700 transition-all shadow-sm disabled:opacity-50"
                                                        title="Approve KYC verification to unlock self-service purchases"
                                                    >
                                                        {isBusy ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <ShieldCheck className="w-3.5 h-3.5" />}
                                                        Verify Partner
                                                    </button>
                                                )}
                                                <button
                                                    onClick={() => handleOpenManualForPartner(partner)}
                                                    className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100 text-xs font-semibold transition-all border border-blue-100"
                                                    title="Record an assisted direct bank deposit purchase"
                                                >
                                                    <Plus className="w-3 h-3" /> TPIA
                                                </button>
                                                <button
                                                    onClick={() => requestConfirm("block", partner)}
                                                    disabled={isBusy}
                                                    className={`inline-flex items-center gap-1 px-2 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                                                        isBlocked
                                                            ? "bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-100"
                                                            : "bg-gray-100 text-gray-600 hover:bg-red-50 hover:text-red-700"
                                                    }`}
                                                    title={isBlocked ? "Reactivate partner account" : "Suspend partner account"}
                                                >
                                                    {isBlocked ? "Unblock" : "Suspend"}
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>

                    {filteredPartners.length === 0 && (
                        <div className="text-center py-12">
                            <p className="text-gray-500">No partners found</p>
                        </div>
                    )}
                </div>

                {/* Partners List - Mobile */}
                <div className="md:hidden space-y-4">
                    {filteredPartners.map((partner) => {
                        const isVerified = Boolean(partner.isVerified || partner.kycVerified);
                        const isBlocked = Boolean(partner.isBlocked);
                        const isBusy = actionLoading === partner._id;

                        return (
                            <div key={partner._id} className="bg-white rounded-xl shadow-lg p-5 border border-gray-100">
                                <div className="flex justify-between items-start mb-4">
                                    <div>
                                        <p className="font-bold text-lg text-gray-900">{partner.name}</p>
                                        <p className="text-xs text-gray-500">{partner.email}</p>
                                    </div>
                                    <div className="flex flex-col items-end gap-1">
                                        <span
                                            className={`px-3 py-1 rounded-full text-xs font-medium ${
                                                isVerified
                                                    ? "bg-green-100 text-green-700"
                                                    : "bg-yellow-100 text-yellow-800"
                                            }`}
                                        >
                                            {isVerified ? "✓ Verified" : "⏳ Pending"}
                                        </span>
                                        {isBlocked && (
                                            <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-red-100 text-red-700">
                                                Suspended
                                            </span>
                                        )}
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4 py-3 border-t border-b border-gray-100 mb-3">
                                    <div>
                                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-0.5">Total Invested</p>
                                        <p className="font-bold text-gray-900">{formatCurrency(partner.totalInvested)}</p>
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-0.5">Wallet Balance</p>
                                        <p className="font-bold text-gray-700">{formatCurrency(partner.walletBalance || 0)}</p>
                                    </div>
                                </div>

                                <div className="flex justify-between items-center text-xs mb-4">
                                    <div>
                                        <span className="text-gray-400 font-bold uppercase tracking-wider mr-2">TPIAs:</span>
                                        <span className="font-black text-gray-900">{partner.totalTPIAs}</span>
                                    </div>
                                    <div className="text-gray-400 text-xs">
                                        Joined {formatDate(partner.joinedDate)}
                                    </div>
                                </div>

                                <div className="flex items-center gap-2 pt-2 border-t border-gray-50">
                                    {!isVerified && (
                                        <button
                                            onClick={() => requestConfirm("verify", partner)}
                                            disabled={isBusy}
                                            className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-700 transition-all shadow-sm disabled:opacity-50"
                                        >
                                            {isBusy ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <ShieldCheck className="w-3.5 h-3.5" />}
                                            Verify Partner
                                        </button>
                                    )}
                                    <button
                                        onClick={() => handleOpenManualForPartner(partner)}
                                        className="inline-flex items-center justify-center gap-1 px-3 py-2 rounded-xl bg-blue-50 text-blue-700 text-xs font-bold hover:bg-blue-100 border border-blue-100"
                                    >
                                        <Plus className="w-3.5 h-3.5" /> TPIA
                                    </button>
                                    <button
                                        onClick={() => requestConfirm("block", partner)}
                                        disabled={isBusy}
                                        className={`px-3 py-2 rounded-xl text-xs font-bold ${
                                            isBlocked
                                                ? "bg-emerald-50 text-emerald-700 border border-emerald-100"
                                                : "bg-gray-100 text-gray-600 hover:text-red-700"
                                        }`}
                                    >
                                        {isBlocked ? "Unblock" : "Suspend"}
                                    </button>
                                </div>
                            </div>
                        );
                    })}

                    {filteredPartners.length === 0 && (
                        <div className="text-center py-12 bg-white rounded-xl shadow-lg">
                            <p className="text-gray-500">No partners found</p>
                        </div>
                    )}
                </div>

                {/* ── Confirm Action Modal ── */}
                {confirmAction && (() => {
                    const { type, partner: cp } = confirmAction;
                    const isVerifyAction = type === "verify";
                    const isCurrentlyBlocked = Boolean(cp.isBlocked);
                    const isBusy = actionLoading === cp._id;

                    return (
                        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-[80] animate-in fade-in duration-200">
                            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden border border-gray-100">
                                {/* Colour bar */}
                                <div className={`h-2 w-full ${isVerifyAction ? "bg-emerald-500" : isCurrentlyBlocked ? "bg-emerald-500" : "bg-red-500"}`} />

                                <div className="p-6 sm:p-7">
                                    {/* Icon */}
                                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4 border ${
                                        isVerifyAction 
                                            ? "bg-emerald-50 border-emerald-100" 
                                            : isCurrentlyBlocked 
                                                ? "bg-emerald-50 border-emerald-100" 
                                                : "bg-red-50 border-red-100"
                                    }`}>
                                        {isVerifyAction
                                            ? <ShieldCheck className="w-7 h-7 text-emerald-600" />
                                            : isCurrentlyBlocked
                                                ? <UserCheck className="w-7 h-7 text-emerald-600" />
                                                : <Ban className="w-7 h-7 text-red-600" />
                                        }
                                    </div>

                                    {/* Title */}
                                    <h3 className="text-xl font-black text-gray-900 text-center mb-1">
                                        {isVerifyAction
                                            ? "Confirm Partner Verification"
                                            : isCurrentlyBlocked
                                                ? "Reactivate Partner Account?"
                                                : "Suspend Partner Account?"
                                        }
                                    </h3>

                                    <p className="text-center text-xs text-gray-500 font-medium mb-5">
                                        {isVerifyAction
                                            ? "Approve KYC verification and unlock TPIA acquisitions for this partner"
                                            : isCurrentlyBlocked
                                                ? "Restore full platform privileges and portfolio access"
                                                : "Restrict partner operations and self-service acquisitions"
                                        }
                                    </p>

                                    {/* Partner Summary Card */}
                                    <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100 mb-5 space-y-2 text-xs">
                                        <div className="flex justify-between items-center pb-2 border-b border-slate-200/60">
                                            <span className="font-bold text-gray-400 uppercase tracking-wider text-[10px]">Partner Name</span>
                                            <span className="font-bold text-gray-900">{cp.name}</span>
                                        </div>
                                        <div className="flex justify-between items-center pb-2 border-b border-slate-200/60">
                                            <span className="font-bold text-gray-400 uppercase tracking-wider text-[10px]">Email Address</span>
                                            <span className="font-semibold text-gray-700">{cp.email}</span>
                                        </div>
                                        {cp.phone && (
                                            <div className="flex justify-between items-center pb-2 border-b border-slate-200/60">
                                                <span className="font-bold text-gray-400 uppercase tracking-wider text-[10px]">Phone</span>
                                                <span className="font-semibold text-gray-700">{cp.phone}</span>
                                            </div>
                                        )}
                                        <div className="flex justify-between items-center">
                                            <span className="font-bold text-gray-400 uppercase tracking-wider text-[10px]">Current Status</span>
                                            <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${
                                                cp.isVerified || cp.kycVerified ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-800"
                                            }`}>
                                                {cp.isVerified || cp.kycVerified ? "Verified" : "Pending KYC"}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Consequence note */}
                                    {isVerifyAction ? (
                                        <div className="rounded-2xl bg-emerald-50/80 border border-emerald-100 p-4 mb-6 space-y-2 text-xs text-emerald-900">
                                            <p className="font-bold text-emerald-950 uppercase tracking-wider text-[10px] mb-1">Impact of Verification:</p>
                                            <div className="flex items-start gap-2 text-[11px] leading-relaxed">
                                                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0 mt-0.5" />
                                                <span>Approves KYC compliance status for the partner</span>
                                            </div>
                                            <div className="flex items-start gap-2 text-[11px] leading-relaxed">
                                                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0 mt-0.5" />
                                                <span>Unlocks self-service wallet TPIA purchases on their GDIP portal</span>
                                            </div>
                                            <div className="flex items-start gap-2 text-[11px] leading-relaxed">
                                                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0 mt-0.5" />
                                                <span>Authorizes participation in active GDC cluster allocations</span>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className={`rounded-2xl p-4 mb-6 text-xs font-medium leading-relaxed border ${
                                            isCurrentlyBlocked 
                                                ? "bg-emerald-50 border-emerald-100 text-emerald-800" 
                                                : "bg-red-50 border-red-100 text-red-800"
                                        }`}>
                                            {isCurrentlyBlocked
                                                ? "This will reactivate the partner's account and restore their access to the platform and portfolio."
                                                : "This will suspend the partner's account. They won't be able to log in or make purchases until reactivated."
                                            }
                                        </div>
                                    )}

                                    {/* Buttons */}
                                    <div className="flex gap-3">
                                        <button
                                            onClick={() => setConfirmAction(null)}
                                            disabled={isBusy}
                                            className="flex-1 px-4 py-3 rounded-xl border border-gray-200 text-xs font-bold text-gray-500 hover:bg-gray-50 transition-all uppercase tracking-wider disabled:opacity-50"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            onClick={() => isVerifyAction ? handleVerifyPartner(cp) : handleToggleBlock(cp)}
                                            disabled={isBusy}
                                            className={`flex-1 px-4 py-3 rounded-xl text-xs font-black text-white transition-all uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg disabled:opacity-50 ${
                                                isVerifyAction || isCurrentlyBlocked
                                                    ? "bg-emerald-600 hover:bg-emerald-700 shadow-emerald-200"
                                                    : "bg-red-600 hover:bg-red-700 shadow-red-200"
                                            }`}
                                        >
                                            {isBusy
                                                ? <Loader2 className="w-4 h-4 animate-spin" />
                                                : isVerifyAction ? "Confirm & Verify" : isCurrentlyBlocked ? "Yes, Reactivate" : "Yes, Suspend"
                                            }
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    );
                })()}

                {/* ── Verification Success Confirmation Modal ── */}
                {verifiedSuccessPartner && (
                    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-[90] animate-in fade-in duration-200">
                        <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full overflow-hidden border border-gray-100">
                            <div className="h-2 w-full bg-emerald-500" />
                            <div className="p-7 text-center">
                                <div className="w-16 h-16 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center mx-auto mb-4">
                                    <ShieldCheck className="w-8 h-8 text-emerald-600" />
                                </div>
                                <h3 className="text-xl font-black text-gray-900 mb-1">
                                    Partner Successfully Verified!
                                </h3>
                                <p className="text-sm font-semibold text-gray-600 mb-4">
                                    {verifiedSuccessPartner.name} ({verifiedSuccessPartner.email})
                                </p>
                                <div className="rounded-2xl bg-emerald-50/80 border border-emerald-100 p-4 text-xs text-emerald-900 text-left space-y-2 mb-6">
                                    <div className="flex items-center gap-2">
                                        <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                                        <span>KYC compliance approved and verified</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                                        <span>Self-service wallet TPIA acquisitions unlocked</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                                        <span>Account active for Trade Cycle participation</span>
                                    </div>
                                </div>
                                <button
                                    onClick={() => setVerifiedSuccessPartner(null)}
                                    className="w-full py-3.5 px-6 rounded-xl bg-gray-900 hover:bg-black text-white text-xs font-black uppercase tracking-wider transition-all"
                                >
                                    Done
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                <Modal
                    open={showManualPurchaseModal}
                    onClose={closeManualPurchaseModal}
                    size="lg"
                    title="Create Manual TPIA Purchase"
                    footer={
                        createdTPIAs.length > 0 ? (
                            <button
                                type="button"
                                onClick={closeManualPurchaseModal}
                                className="w-full rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
                            >
                                Done
                            </button>
                        ) : showManualConfirm ? (
                            <>
                            <button
                                type="button"
                                onClick={() => setShowManualConfirm(false)}
                                disabled={manualSubmitting}
                                className="flex-1 rounded-lg border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-60"
                            >
                                Back to Edit
                            </button>
                            <button
                                type="button"
                                onClick={handleManualPurchase}
                                disabled={manualSubmitting}
                                className="flex-1 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-bold text-white hover:bg-emerald-700 flex items-center justify-center gap-2 disabled:opacity-60"
                            >
                                {manualSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <ShieldCheck className="w-4 h-4" />}
                                {manualSubmitting ? "Allocating..." : "Confirm & Execute Acquisition"}
                            </button>
                            </>
                        ) : (
                            <>
                            <button
                                type="button"
                                onClick={closeManualPurchaseModal}
                                disabled={manualSubmitting}
                                className="flex-1 rounded-lg border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-60"
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                onClick={handleInitiateManualPurchase}
                                disabled={manualSubmitting || Boolean(selectedPartner?.isBlocked)}
                                className="flex-1 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                            >
                                Review & Confirm Purchase
                            </button>
                            </>
                        )
                    }
                >
                    <div className="space-y-5 p-2">
                        {createdTPIAs.length > 0 ? (
                            <div className="rounded-xl border border-emerald-100 bg-emerald-50 p-5">
                                <h3 className="text-base font-bold text-emerald-950">Manual TPIA purchase created</h3>
                                <p className="mt-1 text-sm text-emerald-800">
                                    These TPIA blocks were assigned to their GDC slots. The partner can now see them in their GDIP dashboard.
                                </p>
                                <div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2">
                                    {createdTPIAs.map((tpia) => (
                                        <div key={tpia._id} className="rounded-lg border border-emerald-200 bg-white px-3 py-2 text-sm">
                                            <p className="font-semibold text-emerald-950">{tpia.tpiaId}</p>
                                            <p className="text-xs text-emerald-700">GDC-{tpia.gdcNumber}, slot {tpia.positionInGDC}/10</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ) : showManualConfirm ? (
                            <div className="space-y-4">
                                <div className="rounded-2xl border border-emerald-100 bg-emerald-50/60 p-5">
                                    <div className="flex items-center gap-3 mb-4">
                                        <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center flex-shrink-0">
                                            <ShieldCheck className="w-5 h-5 text-emerald-700" />
                                        </div>
                                        <div>
                                            <h4 className="text-base font-black text-emerald-950">Confirm Assisted TPIA Purchase</h4>
                                            <p className="text-xs text-emerald-800 font-medium">Verify bank deposit details before executing acquisition</p>
                                        </div>
                                    </div>

                                    <div className="bg-white rounded-xl p-4 border border-emerald-200/60 space-y-2.5 text-xs">
                                        <div className="flex justify-between items-center pb-2 border-b border-gray-100">
                                            <span className="font-bold text-gray-500 uppercase tracking-wider text-[10px]">Partner</span>
                                            <span className="font-bold text-gray-900">{selectedPartner?.name}</span>
                                        </div>
                                        <div className="flex justify-between items-center pb-2 border-b border-gray-100">
                                            <span className="font-bold text-gray-500 uppercase tracking-wider text-[10px]">Partner Email</span>
                                            <span className="font-semibold text-gray-700">{selectedPartner?.email}</span>
                                        </div>
                                        <div className="flex justify-between items-center pb-2 border-b border-gray-100">
                                            <span className="font-bold text-gray-500 uppercase tracking-wider text-[10px]">Quantity</span>
                                            <span className="font-black text-gray-900">{manualQuantity} TPIA Block{manualQuantity > 1 ? "s" : ""}</span>
                                        </div>
                                        <div className="flex justify-between items-center pb-2 border-b border-gray-100">
                                            <span className="font-bold text-gray-500 uppercase tracking-wider text-[10px]">Total Amount Received</span>
                                            <span className="font-black text-emerald-700 text-sm">{formatCurrency(Number(manualAmount))}</span>
                                        </div>
                                        <div className="flex justify-between items-center pb-2 border-b border-gray-100">
                                            <span className="font-bold text-gray-500 uppercase tracking-wider text-[10px]">Earnings Mode</span>
                                            <span className="font-bold text-gray-900">{manualProfitMode === "TPM" ? "TPM (Compounding Capital Return)" : "EPS (Wallet Profit Payout)"}</span>
                                        </div>
                                        <div className="flex justify-between items-center pb-2 border-b border-gray-100">
                                            <span className="font-bold text-gray-500 uppercase tracking-wider text-[10px]">Bank Deposit Reference</span>
                                            <span className="font-mono font-bold text-blue-700">{manualBankReference}</span>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <span className="font-bold text-gray-500 uppercase tracking-wider text-[10px]">Deposit Date</span>
                                            <span className="font-semibold text-gray-700">{manualDepositDate}</span>
                                        </div>
                                    </div>

                                    {manualNote && (
                                        <div className="mt-3 p-3 bg-white/80 rounded-xl border border-emerald-100 text-xs">
                                            <span className="font-bold text-gray-500 uppercase tracking-wider text-[10px] block mb-0.5">Note:</span>
                                            <p className="text-gray-700">{manualNote}</p>
                                        </div>
                                    )}

                                    <div className="mt-4 p-3 bg-emerald-100/60 rounded-xl text-[11px] text-emerald-950 font-medium">
                                        ⚡ Clicking confirm will immediately allocate these TPIA units into the active GDC formation and generate insurance certificates.
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <>
                        <div className="rounded-xl border border-blue-100 bg-blue-50 p-4 text-sm text-blue-800">
                            Use this only after Finance has confirmed the partner's bank deposit. The partner's wallet will not be credited; the TPIA will be assigned directly into the next forming GDC.
                        </div>

                        {assignmentPreview.length > 0 && (
                            <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
                                <div className="mb-3 flex items-center justify-between gap-3">
                                    <h3 className="text-sm font-bold text-gray-900">Expected GDC Assignment</h3>
                                    <span className="text-xs font-medium text-gray-500">Final assignment is confirmed on submit</span>
                                </div>
                                <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                                    {assignmentPreview.map((assignment) => (
                                        <div key={`${assignment.gdcNumber}-${assignment.positionInGDC}-${assignment.tpiaNumber}`} className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm">
                                            <p className="font-semibold text-gray-900">TPIA-{assignment.tpiaNumber}</p>
                                            <p className="text-xs text-gray-500">GDC-{assignment.gdcNumber}, slot {assignment.positionInGDC}/10</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {manualError && (
                            <div className="rounded-xl border border-red-100 bg-red-50 p-4 text-sm font-medium text-red-700">
                                {manualError}
                            </div>
                        )}

                        <div>
                            <label className="mb-2 block text-sm font-semibold text-gray-700">Partner</label>
                            <input
                                value={selectedPartner ? `${selectedPartner.name} (${selectedPartner.email})` : partnerSearch}
                                onChange={(event) => {
                                    setSelectedPartner(null);
                                    setPartnerSearch(event.target.value);
                                }}
                                placeholder="Search by name, email, phone, or username"
                                className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
                            />
                            {!selectedPartner && partnerSearchResults.length > 0 && (
                                <div className="mt-2 max-h-48 overflow-y-auto rounded-lg border border-gray-200 bg-white shadow-sm">
                                    {partnerSearchResults.map((partner) => (
                                        <button
                                            key={partner._id}
                                            type="button"
                                            onClick={() => {
                                                setSelectedPartner(partner);
                                                setPartnerSearchResults([]);
                                            }}
                                            className="block w-full border-b border-gray-100 px-4 py-3 text-left text-sm hover:bg-gray-50 last:border-b-0"
                                        >
                                            <span className="block font-semibold text-gray-900">{partner.name}</span>
                                            <span className="block text-xs text-gray-500">{partner.email}{partner.phone ? ` • ${partner.phone}` : ""}</span>
                                            {partner.isBlocked && <span className="mt-1 block text-xs font-semibold text-red-600">Blocked account</span>}
                                        </button>
                                    ))}
                                </div>
                            )}
                            {selectedPartner?.isBlocked && (
                                <p className="mt-2 text-xs font-semibold text-red-600">This partner is blocked. Unblock the account before creating a manual purchase.</p>
                            )}
                        </div>

                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                            <div className="rounded-xl border border-emerald-100 bg-emerald-50 p-4">
                                <p className="text-sm font-semibold text-emerald-950">Trade Deployment</p>
                                <p className="mt-1 text-xs leading-relaxed text-emerald-800">
                                    Assigned automatically by Glotrade based on active deployment needs.
                                </p>
                            </div>

                            <div>
                                <label className="mb-2 block text-sm font-semibold text-gray-700">Profit Mode</label>
                                <select
                                    value={manualProfitMode}
                                    onChange={(event) => setManualProfitMode(event.target.value as "TPM" | "EPS")}
                                    className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
                                >
                                    <option value="TPM">TPM - Compound returns</option>
                                    <option value="EPS">EPS - Wallet profit payout</option>
                                </select>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                            <div>
                                <label className="mb-2 block text-sm font-semibold text-gray-700">Quantity</label>
                                <input
                                    type="number"
                                    min={1}
                                    max={10}
                                    value={manualQuantity}
                                    onChange={(event) => setManualQuantity(Math.min(10, Math.max(1, Number(event.target.value) || 1)))}
                                    className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                            <div className="sm:col-span-2">
                                <label className="mb-2 block text-sm font-semibold text-gray-700">Amount Received</label>
                                <input
                                    type="number"
                                    min={TPIA_PRICE}
                                    step={TPIA_PRICE}
                                    value={manualAmount}
                                    onChange={(event) => setManualAmount(event.target.value)}
                                    className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
                                />
                                <p className="mt-1 text-xs text-gray-500">Expected total: {formatCurrency(manualQuantity * TPIA_PRICE)}</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                            <div>
                                <label className="mb-2 block text-sm font-semibold text-gray-700">Bank Deposit Reference</label>
                                <input
                                    value={manualBankReference}
                                    onChange={(event) => setManualBankReference(event.target.value)}
                                    placeholder="Bank teller, narration, or transfer reference"
                                    className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                            <div>
                                <label className="mb-2 block text-sm font-semibold text-gray-700">Deposit Date</label>
                                <input
                                    type="date"
                                    value={manualDepositDate}
                                    onChange={(event) => setManualDepositDate(event.target.value)}
                                    className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="mb-2 block text-sm font-semibold text-gray-700">Internal Note</label>
                            <textarea
                                value={manualNote}
                                onChange={(event) => setManualNote(event.target.value)}
                                rows={3}
                                placeholder="Optional finance or support note"
                                className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                            </>
                        )}
                    </div>
                </Modal>
            </div>
        </AdminLayout>
    );
}
