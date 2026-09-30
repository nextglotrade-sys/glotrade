"use client";

import { useEffect, useState } from "react";
import { X, Shield, TrendingUp, Package, FileText } from "lucide-react";
import { apiGet, apiPatch, apiPost } from "@/utils/api";
import { formatCurrency } from "@/utils/format";
import { translate } from "@/utils/translate";

interface TPIADetailsModalProps {
    tpiaId: string;
    onClose: () => void;
    onChanged?: () => void;
}

interface TPIADetails {
    tpia: {
        _id: string;
        tpiaId: string;
        originalTpiaId?: string;
        partnerName: string;
        partnerEmail: string;
        currentValue: number;
        purchasePrice: number;
        profitMode: string;
        status: string;
        positionInGDC?: number;
        voidedAt?: string;
        voidReason?: string;
        purchasedAt: string;
        purchaseSource?: "wallet" | "manual_bank_deposit";
        manualPayment?: {
            amountReceived?: number;
            bankReference?: string;
            depositedAt?: string;
            recordedAt?: string;
            note?: string;
        };
        manualPaymentCorrections?: {
            correctedAt: string;
            reason: string;
            previous?: {
                bankReference?: string;
                depositedAt?: string;
                note?: string;
            };
            next?: {
                bankReference?: string;
                depositedAt?: string;
                note?: string;
            };
        }[];
        notes?: string;
        commodityType: string;
        insuranceCertificateNumber: string;
        totalProfitEarned: number;
        estimatedProfit?: number;
        cyclesCompleted: number;
    };
    gdc: {
        gdcNumber: number;
        status: string;
        primaryCommodity: string;
        currentFill?: number;
        capacity?: number;
    };
    insurance: {
        policyType: string;
        coverageAmount: number;
        status: string;
        expiryDate: string;
    } | null;
    currentCycle: {
        cycleId: string;
        startDate: string;
        endDate: string;
        status: string;
    } | null;
}

export default function TPIADetailsModal({ tpiaId, onClose, onChanged }: TPIADetailsModalProps) {
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState<TPIADetails | null>(null);
    const [editingManualPayment, setEditingManualPayment] = useState(false);
    const [manualBankReference, setManualBankReference] = useState("");
    const [manualDepositDate, setManualDepositDate] = useState("");
    const [manualNote, setManualNote] = useState("");
    const [correctionReason, setCorrectionReason] = useState("");
    const [manualPaymentError, setManualPaymentError] = useState("");
    const [manualPaymentSaving, setManualPaymentSaving] = useState(false);
    const [showVoidForm, setShowVoidForm] = useState(false);
    const [voidReason, setVoidReason] = useState("");
    const [voidError, setVoidError] = useState("");
    const [voidSaving, setVoidSaving] = useState(false);
    const [showVoidConfirmation, setShowVoidConfirmation] = useState(false);

    useEffect(() => {
        if (tpiaId) {
            fetchDetails();
        }
    }, [tpiaId]);

    const fetchDetails = async () => {
        try {
            setLoading(true);
            const response = await apiGet<{ success: boolean; data: TPIADetails }>(
                `/api/v1/gdip/tpia/${tpiaId}`
            );
            if (response.success) {
                setData(response.data);
                syncManualPaymentForm(response.data);
            }
        } catch (err) {
            console.error("Error fetching TPIA details:", err);
        } finally {
            setLoading(false);
        }
    };


    const formatDate = (dateString?: string) => {
        if (!dateString) return "N/A";
        return new Date(dateString).toLocaleDateString("en-NG", {
            year: "numeric",
            month: "short",
            day: "numeric",
        });
    };

    const formatDateInputValue = (dateString?: string) => {
        if (!dateString) return "";
        const date = new Date(dateString);
        if (Number.isNaN(date.getTime())) return "";
        return date.toISOString().split("T")[0];
    };

    const syncManualPaymentForm = (details: TPIADetails) => {
        setManualBankReference(details.tpia.manualPayment?.bankReference || "");
        setManualDepositDate(formatDateInputValue(details.tpia.manualPayment?.depositedAt));
        setManualNote(details.tpia.manualPayment?.note || "");
        setCorrectionReason("");
        setManualPaymentError("");
        setEditingManualPayment(false);
        setShowVoidForm(false);
        setVoidReason("");
        setVoidError("");
        setShowVoidConfirmation(false);
    };

    const handleManualPaymentSave = async () => {
        if (!data) return;

        if (!manualBankReference.trim()) {
            setManualPaymentError("Bank deposit reference is required.");
            return;
        }

        if (!manualDepositDate) {
            setManualPaymentError("Deposit date is required.");
            return;
        }

        if (!correctionReason.trim()) {
            setManualPaymentError("Correction reason is required.");
            return;
        }

        try {
            setManualPaymentSaving(true);
            setManualPaymentError("");
            await apiPatch(`/api/v1/gdip/admin/tpia/${data.tpia._id}/manual-payment`, {
                bankReference: manualBankReference.trim(),
                depositedAt: manualDepositDate,
                note: manualNote.trim() || undefined,
                reason: correctionReason.trim()
            });
            await fetchDetails();
            onChanged?.();
        } catch (err: any) {
            setManualPaymentError(err.message || "Failed to update manual payment details.");
        } finally {
            setManualPaymentSaving(false);
        }
    };

    const isCycleActive = data?.currentCycle?.status === "active";
    const displayTPIAId = data?.tpia.originalTpiaId || data?.tpia.tpiaId;
    const canEditManualPayment = Boolean(
        data?.tpia.purchaseSource === "manual_bank_deposit" &&
        data?.tpia.status === "pending" &&
        !data?.currentCycle &&
        data?.gdc.status === "forming"
    );
    const canVoidManualPurchase = Boolean(
        canEditManualPayment &&
        data?.tpia.positionInGDC &&
        data?.gdc.currentFill &&
        data.tpia.positionInGDC === data.gdc.currentFill
    );

    const handleVoidManualPurchase = async () => {
        if (!data) return;

        if (!voidReason.trim()) {
            setVoidError("Void reason is required.");
            return;
        }

        try {
            setVoidSaving(true);
            setVoidError("");
            await apiPost(`/api/v1/gdip/admin/tpia/${data.tpia._id}/void`, {
                reason: voidReason.trim()
            });
            await fetchDetails();
            onChanged?.();
        } catch (err: any) {
            setVoidError(err.message || "Failed to void manual TPIA purchase.");
        } finally {
            setVoidSaving(false);
        }
    };

    if (!tpiaId) return null;

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
                <div className="p-4 sm:p-6 border-b border-gray-200 flex items-center justify-between sticky top-0 bg-white z-20">
                    <h2 className="text-lg sm:text-xl font-bold text-gray-900 flex flex-wrap items-center gap-1.5 sm:gap-2 pr-2">
                        <span>GDC Investment Block</span>
                        {data && <span className="text-gray-500 font-normal text-sm sm:text-base">#{displayTPIAId}</span>}
                    </h2>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-gray-100 rounded-xl transition-all active:scale-95"
                    >
                        <X className="w-5 h-5 text-gray-500" />
                    </button>
                </div>

                {loading ? (
                    <div className="p-12 flex justify-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                    </div>
                ) : data ? (
                    <div className="p-6 space-y-8">
                        <div className={`p-4 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${data.tpia.status === "active" ? "bg-green-50 border border-green-100" :
                            data.tpia.status === "pending" ? "bg-yellow-50 border border-yellow-100" :
                                data.tpia.status === "voided" ? "bg-red-50 border border-red-100" :
                                data.tpia.status === "matured" ? "bg-indigo-50 border border-indigo-100" :
                                "bg-gray-50 border border-gray-100"
                            }`}>
                            <div className="flex items-center gap-3">
                                <div className={`p-2.5 rounded-xl ${data.tpia.status === "active" ? "bg-green-100" : data.tpia.status === "voided" ? "bg-red-100" : data.tpia.status === "matured" ? "bg-indigo-100" : "bg-yellow-100"
                                    }`}>
                                    <Shield className={`w-5 h-5 ${data.tpia.status === "active" ? "text-green-600" : data.tpia.status === "voided" ? "text-red-600" : data.tpia.status === "matured" ? "text-indigo-600" : "text-yellow-600"
                                        }`} />
                                </div>
                                <div className="space-y-0.5">
                                    <p className="font-bold text-gray-900 capitalize leading-none text-sm sm:text-base">{data.tpia.status} Status</p>
                                    <p className="text-xs sm:text-sm text-gray-600">
                                        {data.tpia.status === "voided"
                                            ? "Manual purchase voided"
                                            : data.tpia.status === "matured"
                                            ? "All cycles completed — capital matured"
                                            : isCycleActive
                                            ? translate("gdip.admin.tpiaDetails.cycleActive")
                                            : data.currentCycle
                                                ? translate("gdip.admin.tpiaDetails.cycleAssigned")
                                                : translate("gdip.admin.tpiaDetails.waitingFormation")}
                                    </p>
                                </div>
                            </div>
                            <div className="sm:text-right flex sm:flex-col justify-between items-end sm:items-end border-t sm:border-t-0 border-gray-200/50 pt-3 sm:pt-0">
                                <p className="text-[10px] sm:text-xs text-gray-500 uppercase font-bold tracking-wider">Current Value</p>
                                <p className="text-lg sm:text-xl font-extrabold text-gray-900">{formatCurrency(data.tpia.currentValue)}</p>
                                {data.tpia.status === "voided" && data.tpia.voidReason && (
                                    <p className="mt-1 text-xs font-semibold text-red-600">Void reason: {data.tpia.voidReason}</p>
                                )}
                            </div>
                        </div>

                        {/* Grid Layout */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Investment Details */}
                            <div className="space-y-4">
                                <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider flex items-center gap-2">
                                    <Package className="w-4 h-4" /> Investment Details
                                </h3>
                                <div className="bg-gray-50 rounded-xl p-4 space-y-3">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-500">Commodity</span>
                                        <span className="font-medium text-gray-900">{data.tpia.commodityType}</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-500">Initial Capital</span>
                                        <span className="font-medium text-gray-900">{formatCurrency(data.tpia.purchasePrice)}</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-500">Purchase Date</span>
                                        <span className="font-medium text-gray-900">{formatDate(data.tpia.purchasedAt)}</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-500">Purchase Source</span>
                                        <span className={`font-medium px-2 py-0.5 rounded ${data.tpia.purchaseSource === "manual_bank_deposit" ? "bg-emerald-50 text-emerald-700" : "bg-gray-100 text-gray-700"}`}>
                                            {data.tpia.purchaseSource === "manual_bank_deposit" ? "Manual bank deposit" : "Wallet purchase"}
                                        </span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-500">Profit Mode</span>
                                        <span className="font-medium text-blue-600 bg-blue-50 px-2 py-0.5 rounded">
                                            {data.tpia.profitMode === "TPM" ? "Compounding (TPM)" : "Payout (EPS)"}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Performance */}
                            <div className="space-y-4">
                                <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider flex items-center gap-2">
                                    <TrendingUp className="w-4 h-4" /> Performance
                                </h3>
                                <div className="bg-gray-50 rounded-xl p-4 space-y-3">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-500">
                                            {data.tpia.status === "matured" || (data.tpia.cyclesCompleted > 0 && !data.tpia.estimatedProfit)
                                                ? translate("gdip.common.accruedProfit").replace("Accrued", "Total")
                                                : translate("gdip.common.accruedProfit")}
                                        </span>
                                        {data.tpia.status === "matured" || (data.tpia.cyclesCompleted > 0 && !data.tpia.estimatedProfit) ? (
                                            <span className="font-bold text-indigo-600" title={`Across ${data.tpia.cyclesCompleted} cycle(s)`}>
                                                +{formatCurrency(data.tpia.totalProfitEarned || 0)}
                                            </span>
                                        ) : (
                                            <span className="font-bold text-green-600">+{formatCurrency(data.tpia.estimatedProfit || 0)}</span>
                                        )}
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-500">Cycles Completed</span>
                                        <span className="font-medium text-gray-900">{data.tpia.cyclesCompleted}</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-500">Active Cycle</span>
                                        <span className="font-medium text-gray-900">
                                            {isCycleActive ? `#${data.currentCycle?.cycleId}` : "None"}
                                        </span>
                                    </div>
                                    {!isCycleActive && (
                                        <div className="flex justify-between text-sm">
                                            <span className="text-gray-500">Cycle Status</span>
                                            <span className={`font-medium ${
                                                data.currentCycle
                                                    ? "text-amber-700"
                                                    : data.tpia.status === "active" && (data.gdc.status === "ready" || data.gdc.status === "active")
                                                    ? "text-blue-600"
                                                    : "text-amber-700"
                                            }`}>
                                                {data.currentCycle
                                                    ? translate("gdip.admin.tpiaDetails.cycleStatusNotAccruing", { status: data.currentCycle.status })
                                                    : data.tpia.status === "active" && (data.gdc.status === "ready" || data.gdc.status === "active")
                                                    ? `Awaiting next cycle (${data.tpia.cyclesCompleted} completed)`
                                                    : translate("gdip.common.waitingForGDC")}
                                            </span>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Insurance Info */}
                            <div className="space-y-4">
                                <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider flex items-center gap-2">
                                    <FileText className="w-4 h-4" /> Insurance & GDC
                                </h3>
                                <div className="bg-blue-50 rounded-xl p-4 space-y-3">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-blue-700">Certificate No.</span>
                                        <span className="font-medium text-blue-900 text-xs">
                                            {data.tpia.insuranceCertificateNumber}
                                        </span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-blue-700">GDC Cluster</span>
                                        <span className="font-medium text-blue-900">GDC-{data.gdc.gdcNumber}</span>
                                    </div>
                                    {data.gdc.currentFill !== undefined && data.gdc.capacity !== undefined && (
                                        <div className="flex justify-between text-sm">
                                            <span className="text-blue-700">{translate("gdip.admin.tpiaDetails.gdcFill")}</span>
                                            <span className="font-medium text-blue-900">{translate("gdip.admin.tpiaDetails.gdcFillValue", { current: data.gdc.currentFill, total: data.gdc.capacity })}</span>
                                        </div>
                                    )}
                                    <div className="flex justify-between text-sm">
                                        <span className="text-blue-700">Coverage</span>
                                        <span className="font-medium text-blue-900">
                                            {data.insurance ? formatCurrency(data.insurance.coverageAmount) : "N/A"}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Partner Info */}
                            <div className="space-y-4">
                                <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider flex items-center gap-2">
                                    <FileText className="w-4 h-4" /> Partner Info
                                </h3>
                                <div className="bg-gray-50 rounded-xl p-4 space-y-3">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-500">Name</span>
                                        <span className="font-medium text-gray-900">{data.tpia.partnerName}</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-500">Email</span>
                                        <span className="font-medium text-gray-900 truncate max-w-[150px]" title={data.tpia.partnerEmail}>
                                            {data.tpia.partnerEmail}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {data.tpia.purchaseSource === "manual_bank_deposit" && data.tpia.manualPayment && (
                            <div className="rounded-xl border border-emerald-100 bg-emerald-50 p-4">
                                <div className="mb-3 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                                    <div>
                                        <h3 className="text-sm font-bold text-emerald-900 uppercase tracking-wider flex items-center gap-2">
                                            <FileText className="w-4 h-4" /> Manual Bank Deposit Audit
                                        </h3>
                                        <p className="mt-1 text-xs text-emerald-700">
                                            Corrections are only allowed before this TPIA enters an active GDC cycle.
                                        </p>
                                    </div>
                                    {canEditManualPayment && !editingManualPayment && (
                                        <div className="flex flex-col gap-2 sm:flex-row">
                                            <button
                                                type="button"
                                                onClick={() => setEditingManualPayment(true)}
                                                className="rounded-lg border border-emerald-200 bg-white px-3 py-2 text-xs font-bold text-emerald-700 hover:bg-emerald-100"
                                            >
                                                Edit Payment Details
                                            </button>
                                            {canVoidManualPurchase && (
                                                <button
                                                    type="button"
                                                    onClick={() => setShowVoidForm(true)}
                                                    className="rounded-lg border border-red-200 bg-white px-3 py-2 text-xs font-bold text-red-700 hover:bg-red-50"
                                                >
                                                    Void Purchase
                                                </button>
                                            )}
                                        </div>
                                    )}
                                </div>

                                {showVoidForm && !editingManualPayment && (
                                    <div className="mb-4 rounded-xl border border-red-200 bg-white p-4">
                                        <h4 className="text-sm font-bold text-red-800">Void Manual TPIA Purchase</h4>
                                        <p className="mt-1 text-xs text-red-700">
                                            Only the latest slot in a forming GDC can be voided safely. This keeps GDC numbering and future slot assignment consistent.
                                        </p>
                                        {voidError && (
                                            <div className="mt-3 rounded-lg border border-red-100 bg-red-50 px-3 py-2 text-sm font-medium text-red-700">
                                                {voidError}
                                            </div>
                                        )}
                                        <label className="mt-3 mb-1 block text-xs font-bold uppercase tracking-wide text-gray-500">Void Reason</label>
                                        <textarea
                                            value={voidReason}
                                            onChange={(event) => setVoidReason(event.target.value)}
                                            rows={2}
                                            placeholder="Required. Example: wrong partner selected during manual creation."
                                            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-red-500 focus:ring-2 focus:ring-red-500"
                                        />
                                        <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:justify-end">
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setShowVoidForm(false);
                                                    setVoidReason("");
                                                    setVoidError("");
                                                    setShowVoidConfirmation(false);
                                                }}
                                                disabled={voidSaving}
                                                className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-60"
                                            >
                                                Cancel
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    if (!voidReason.trim()) {
                                                        setVoidError("Void reason is required.");
                                                        return;
                                                    }
                                                    setVoidError("");
                                                    setShowVoidConfirmation(true);
                                                }}
                                                disabled={voidSaving}
                                                className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-60"
                                            >
                                                Continue
                                            </button>
                                        </div>
                                    </div>
                                )}

                                {editingManualPayment ? (
                                    <div className="space-y-4 rounded-xl border border-emerald-200 bg-white p-4">
                                        {manualPaymentError && (
                                            <div className="rounded-lg border border-red-100 bg-red-50 px-3 py-2 text-sm font-medium text-red-700">
                                                {manualPaymentError}
                                            </div>
                                        )}
                                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                            <div>
                                                <label className="mb-1 block text-xs font-bold uppercase tracking-wide text-gray-500">Bank Reference</label>
                                                <input
                                                    value={manualBankReference}
                                                    onChange={(event) => setManualBankReference(event.target.value)}
                                                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500"
                                                />
                                            </div>
                                            <div>
                                                <label className="mb-1 block text-xs font-bold uppercase tracking-wide text-gray-500">Deposit Date</label>
                                                <input
                                                    type="date"
                                                    value={manualDepositDate}
                                                    onChange={(event) => setManualDepositDate(event.target.value)}
                                                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500"
                                                />
                                            </div>
                                        </div>
                                        <div>
                                            <label className="mb-1 block text-xs font-bold uppercase tracking-wide text-gray-500">Internal Note</label>
                                            <textarea
                                                value={manualNote}
                                                onChange={(event) => setManualNote(event.target.value)}
                                                rows={2}
                                                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500"
                                            />
                                        </div>
                                        <div>
                                            <label className="mb-1 block text-xs font-bold uppercase tracking-wide text-gray-500">Correction Reason</label>
                                            <textarea
                                                value={correctionReason}
                                                onChange={(event) => setCorrectionReason(event.target.value)}
                                                rows={2}
                                                placeholder="Required. Example: corrected teller reference after finance review."
                                                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500"
                                            />
                                        </div>
                                        <div className="flex flex-col gap-2 sm:flex-row sm:justify-end">
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    syncManualPaymentForm(data);
                                                }}
                                                disabled={manualPaymentSaving}
                                                className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-60"
                                            >
                                                Cancel
                                            </button>
                                            <button
                                                type="button"
                                                onClick={handleManualPaymentSave}
                                                disabled={manualPaymentSaving}
                                                className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700 disabled:opacity-60"
                                            >
                                                {manualPaymentSaving ? "Saving..." : "Save Correction"}
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
                                        <div>
                                            <p className="text-xs font-semibold uppercase tracking-wide text-emerald-700">Reference</p>
                                            <p className="text-sm font-bold text-emerald-950 break-all">{data.tpia.manualPayment.bankReference || "N/A"}</p>
                                        </div>
                                        <div>
                                            <p className="text-xs font-semibold uppercase tracking-wide text-emerald-700">Amount Applied</p>
                                            <p className="text-sm font-bold text-emerald-950">{formatCurrency(data.tpia.manualPayment.amountReceived || data.tpia.purchasePrice)}</p>
                                        </div>
                                        <div>
                                            <p className="text-xs font-semibold uppercase tracking-wide text-emerald-700">Deposit Date</p>
                                            <p className="text-sm font-bold text-emerald-950">{formatDate(data.tpia.manualPayment.depositedAt)}</p>
                                        </div>
                                    </div>
                                )}

                                {(data.tpia.manualPayment.note || data.tpia.notes) && (
                                    <p className="mt-3 text-sm text-emerald-900">{data.tpia.manualPayment.note || data.tpia.notes}</p>
                                )}
                                {data.tpia.manualPaymentCorrections && data.tpia.manualPaymentCorrections.length > 0 && (
                                    <div className="mt-4 rounded-xl border border-emerald-200 bg-white/80 p-3">
                                        <p className="mb-2 text-xs font-bold uppercase tracking-wide text-emerald-700">Correction History</p>
                                        <div className="space-y-2">
                                            {data.tpia.manualPaymentCorrections.slice().reverse().map((correction, index) => (
                                                <div key={`${correction.correctedAt}-${index}`} className="rounded-lg border border-emerald-100 bg-white px-3 py-2 text-xs text-emerald-900">
                                                    <p className="font-semibold">{formatDate(correction.correctedAt)} - {correction.reason}</p>
                                                    <p className="mt-1 text-emerald-700">
                                                        Ref: {correction.previous?.bankReference || "N/A"} → {correction.next?.bankReference || "N/A"}
                                                    </p>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="p-12 text-center text-gray-500">
                        Failed to load details
                    </div>
                )}
            </div>
            {showVoidConfirmation && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 p-4">
                    <div className="w-full max-w-md rounded-2xl border border-red-100 bg-white p-5 shadow-2xl">
                        <h3 className="text-lg font-bold text-red-800">Void this manual TPIA purchase?</h3>
                        <p className="mt-2 text-sm leading-6 text-gray-700">
                            This will remove its slot from the forming GDC and cancel its insurance record. This cannot be undone from this screen.
                        </p>
                        {voidError && (
                            <div className="mt-4 rounded-lg border border-red-100 bg-red-50 px-3 py-2 text-sm font-medium text-red-700">
                                {voidError}
                            </div>
                        )}
                        <div className="mt-5 flex flex-col gap-2 sm:flex-row sm:justify-end">
                            <button
                                type="button"
                                onClick={() => setShowVoidConfirmation(false)}
                                disabled={voidSaving}
                                className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-60"
                            >
                                Keep Purchase
                            </button>
                            <button
                                type="button"
                                onClick={handleVoidManualPurchase}
                                disabled={voidSaving}
                                className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-60"
                            >
                                {voidSaving ? "Voiding..." : "Yes, Void Purchase"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
