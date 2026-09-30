"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Download, Landmark, Plus } from "lucide-react";
import AdminLayout from "@/components/admin/AdminLayout";
import { apiGet } from "@/utils/api";
import { formatCurrency } from "@/utils/format";
import TPIADetailsModal from "@/components/admin/gdip/TPIADetailsModal";

interface TPIA {
    _id: string;
    tpiaId: string;
    originalTpiaId?: string;
    partnerName: string;
    partnerEmail: string;
    purchasePrice: number;
    currentValue: number;
    status: string;
    gdcNumber: number;
    purchasedAt: string;
    profitMode: string;
    estimatedProfit?: number;
    totalProfitEarned?: number;
    cyclesCompleted?: number;
    purchaseSource?: "wallet" | "manual_bank_deposit";
    manualPayment?: {
        amountReceived?: number;
        bankReference?: string;
        depositedAt?: string;
        recordedAt?: string;
        note?: string;
    };
}

export default function AdminTPIAManagementPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [tpias, setTPIAs] = useState<TPIA[]>([]);
    const [filteredTPIAs, setFilteredTPIAs] = useState<TPIA[]>([]);
    const [statusFilter, setStatusFilter] = useState<string>("all");
    const [sourceFilter, setSourceFilter] = useState<string>("all");
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedTPIAId, setSelectedTPIAId] = useState<string | null>(null);

    useEffect(() => {
        fetchTPIAs();
    }, []);

    useEffect(() => {
        filterTPIAs();
    }, [statusFilter, sourceFilter, searchTerm, tpias]);

    const fetchTPIAs = async () => {
        try {
            setLoading(true);
            const response = await apiGet<{ success: boolean; data: any[] }>("/api/v1/gdip/admin/tpias");

            if (response.success) {
                // Sort by newest
                const sorted = response.data.sort((a, b) =>
                    new Date(b.purchasedAt).getTime() - new Date(a.purchasedAt).getTime()
                );
                setTPIAs(sorted);
                setFilteredTPIAs(sorted);
            }
        } catch (err: any) {
            console.error("Error fetching TPIAs:", err);
        } finally {
            setLoading(false);
        }
    };

    const filterTPIAs = () => {
        let filtered = tpias;

        if (statusFilter !== "all") {
            filtered = filtered.filter((t) => t.status === statusFilter);
        }

        if (sourceFilter !== "all") {
            filtered = filtered.filter((t) => (t.purchaseSource || "wallet") === sourceFilter);
        }

        if (searchTerm) {
            const lowerTerm = searchTerm.toLowerCase();
            filtered = filtered.filter(
                (t) =>
                    getDisplayTPIAId(t).toLowerCase().includes(lowerTerm) ||
                    t.partnerName.toLowerCase().includes(lowerTerm) ||
                    t.partnerEmail.toLowerCase().includes(lowerTerm) ||
                    (t.manualPayment?.bankReference || "").toLowerCase().includes(lowerTerm)
            );
        }

        setFilteredTPIAs(filtered);
    };


    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString("en-NG", {
            year: "numeric",
            month: "short",
            day: "numeric",
        });
    };

    const escapeCsvValue = (value: string | number | undefined) => {
        const stringValue = String(value ?? "");
        if (/[",\n]/.test(stringValue)) {
            return `"${stringValue.replace(/"/g, '""')}"`;
        }

        return stringValue;
    };

    const manualTPIAs = tpias.filter((tpia) => tpia.purchaseSource === "manual_bank_deposit");
    const getDisplayTPIAId = (tpia: TPIA) => tpia.originalTpiaId || tpia.tpiaId;

    const exportManualPurchases = () => {
        const headers = [
            "TPIA ID",
            "Partner Name",
            "Partner Email",
            "GDC",
            "Status",
            "Purchase Price",
            "Amount Applied",
            "Bank Reference",
            "Deposit Date",
            "Recorded At",
            "Purchase Date",
            "Profit Mode",
            "Note"
        ];

        const rows = manualTPIAs.map((tpia) => [
            getDisplayTPIAId(tpia),
            tpia.partnerName,
            tpia.partnerEmail,
            `GDC-${tpia.gdcNumber}`,
            tpia.status,
            tpia.purchasePrice,
            tpia.manualPayment?.amountReceived || tpia.purchasePrice,
            tpia.manualPayment?.bankReference,
            tpia.manualPayment?.depositedAt ? new Date(tpia.manualPayment.depositedAt).toISOString() : "",
            tpia.manualPayment?.recordedAt ? new Date(tpia.manualPayment.recordedAt).toISOString() : "",
            tpia.purchasedAt ? new Date(tpia.purchasedAt).toISOString() : "",
            tpia.profitMode,
            tpia.manualPayment?.note
        ]);

        const csvRows = [
            headers.join(","),
            ...rows.map((row) => row.map(escapeCsvValue).join(","))
        ];
        const blob = new Blob([csvRows.join("\n")], { type: "text/csv;charset=utf-8;" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `manual-tpia-purchases-${new Date().toISOString().split("T")[0]}.csv`;
        link.click();
        URL.revokeObjectURL(url);
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
                            <h1 className="text-2xl md:text-4xl font-bold text-gray-900 mb-2">TPIA Management</h1>
                            <p className="text-gray-600">Overview of all Insured Partner Investment Blocks</p>
                        </div>
                        <div className="flex flex-col gap-2 sm:flex-row">
                            <button
                                onClick={() => router.push("/admin/gdip/partners?createTPIA=1")}
                                className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-700"
                                title="Create a manual bank-deposit TPIA purchase"
                            >
                                <Plus className="h-4 w-4" />
                                Create TPIA
                            </button>
                            <button
                                onClick={exportManualPurchases}
                                disabled={manualTPIAs.length === 0}
                                className="inline-flex items-center justify-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-2.5 text-sm font-semibold text-emerald-700 hover:bg-emerald-100 disabled:cursor-not-allowed disabled:opacity-50"
                                title="Export manual bank deposit purchases"
                            >
                                <Download className="h-4 w-4" />
                                Export Manual Purchases
                            </button>
                        </div>
                    </div>
                </div>

                {/* Filters */}
                <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
                    <div className="flex flex-col md:flex-row gap-4">
                        <div className="flex-1">
                            <input
                                type="text"
                                placeholder="Search ID, partner name or email..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                        </div>
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                            <option value="all">All Status</option>
                            <option value="active">Active</option>
                            <option value="pending">Pending</option>
                            <option value="matured">Matured</option>
                            <option value="voided">Voided</option>
                        </select>
                        <select
                            value={sourceFilter}
                            onChange={(e) => setSourceFilter(e.target.value)}
                            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                            <option value="all">All Sources</option>
                            <option value="wallet">Wallet Purchases</option>
                            <option value="manual_bank_deposit">Manual Bank Deposits</option>
                        </select>
                        <span className="text-sm text-gray-600 flex items-center">
                            Showing {filteredTPIAs.length} of {tpias.length}
                        </span>
                    </div>
                </div>

                {/* TPIA Table - Desktop */}
                <div className="bg-white rounded-2xl shadow-lg overflow-hidden hidden md:block">
                    <table className="w-full">
                        <thead className="bg-gray-50 border-b border-gray-200">
                            <tr>
                                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">TPIA ID</th>
                                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Partner</th>
                                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Source</th>
                                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Invested</th>
                                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Profit</th>
                                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">GDC</th>
                                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                                <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {filteredTPIAs.map((tpia) => (
                                <tr key={tpia._id} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-6 py-4 font-medium text-gray-900">{getDisplayTPIAId(tpia)}</td>
                                    <td className="px-6 py-4">
                                        <div>
                                            <p className="font-medium text-gray-900">{tpia.partnerName}</p>
                                            <p className="text-xs text-gray-500">{tpia.partnerEmail}</p>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        {tpia.purchaseSource === "manual_bank_deposit" ? (
                                            <div className="space-y-1">
                                                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700">
                                                    <Landmark className="h-3.5 w-3.5" />
                                                    Manual
                                                </span>
                                                {tpia.manualPayment?.bankReference && (
                                                    <p className="max-w-[140px] truncate text-xs text-gray-500" title={tpia.manualPayment.bankReference}>
                                                        {tpia.manualPayment.bankReference}
                                                    </p>
                                                )}
                                            </div>
                                        ) : (
                                            <span className="rounded-full bg-gray-100 px-2.5 py-1 text-xs font-semibold text-gray-600">Wallet</span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 font-medium text-gray-900">{formatCurrency(tpia.purchasePrice)}</td>
                                    <td className="px-6 py-4 font-medium">
                                        {tpia.status === "matured" || (tpia.cyclesCompleted ?? 0) > 0 && !tpia.estimatedProfit ? (
                                            <span className="text-indigo-600" title={`Across ${tpia.cyclesCompleted ?? 0} cycle(s)`}>
                                                +{formatCurrency(tpia.totalProfitEarned || 0)}
                                                <span className="ml-1 text-xs font-normal text-indigo-400">total</span>
                                            </span>
                                        ) : (
                                            <span className="text-green-600">
                                                +{formatCurrency(tpia.estimatedProfit || 0)}
                                                {(tpia.estimatedProfit ?? 0) > 0 && <span className="ml-1 text-xs font-normal text-green-400">est.</span>}
                                            </span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 text-gray-600">GDC-{tpia.gdcNumber}</td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${tpia.status === "active" ? "bg-green-100 text-green-700" :
                                            tpia.status === "pending" ? "bg-yellow-100 text-yellow-700" :
                                                tpia.status === "voided" ? "bg-red-100 text-red-700" :
                                                tpia.status === "matured" ? "bg-indigo-100 text-indigo-700" :
                                                "bg-gray-100 text-gray-700"
                                            }`}>
                                            {tpia.status.toUpperCase()}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-gray-500">{formatDate(tpia.purchasedAt)}</td>
                                    <td className="px-6 py-4 text-right">
                                        <button
                                            onClick={() => setSelectedTPIAId(tpia._id)}
                                            className="text-blue-600 hover:text-blue-800 font-medium text-sm"
                                        >
                                            View Details
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    {filteredTPIAs.length === 0 && (
                        <div className="text-center py-12 text-gray-500">No TPIAs found matching your filters.</div>
                    )}
                </div>

                {/* TPIA List - Mobile */}
                <div className="md:hidden space-y-4">
                    {filteredTPIAs.map((tpia) => (
                        <div key={tpia._id} className="bg-white rounded-xl shadow-lg p-5 border border-gray-100">
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <p className="font-bold text-lg text-gray-900">{getDisplayTPIAId(tpia)}</p>
                                    <p className="text-sm text-gray-500">{tpia.partnerName}</p>
                                    {tpia.purchaseSource === "manual_bank_deposit" && (
                                        <span className="mt-2 inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700">
                                            <Landmark className="h-3.5 w-3.5" />
                                            Manual bank deposit
                                        </span>
                                    )}
                                </div>
                                <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${tpia.status === "active" ? "bg-green-100 text-green-700" :
                                    tpia.status === "pending" ? "bg-yellow-100 text-yellow-700" :
                                        tpia.status === "voided" ? "bg-red-100 text-red-700" :
                                        tpia.status === "matured" ? "bg-indigo-100 text-indigo-700" :
                                        "bg-gray-100 text-gray-700"
                                    }`}>
                                    {tpia.status.toUpperCase()}
                                </span>
                            </div>

                            <div className="grid grid-cols-2 gap-4 py-4 border-t border-b border-gray-100 mb-4">
                                <div>
                                    <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Invested</p>
                                    <p className="font-bold text-gray-900">{formatCurrency(tpia.purchasePrice)}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">
                                        {tpia.status === "matured" || ((tpia.cyclesCompleted ?? 0) > 0 && !tpia.estimatedProfit) ? "Total Profit" : "Est. Profit"}
                                    </p>
                                    {tpia.status === "matured" || ((tpia.cyclesCompleted ?? 0) > 0 && !tpia.estimatedProfit) ? (
                                        <p className="font-bold text-indigo-600" title={`Across ${tpia.cyclesCompleted ?? 0} cycle(s)`}>
                                            +{formatCurrency(tpia.totalProfitEarned || 0)}
                                        </p>
                                    ) : (
                                        <p className="font-bold text-green-600">+{formatCurrency(tpia.estimatedProfit || 0)}</p>
                                    )}
                                </div>
                            </div>

                            <div className="flex justify-between items-center">
                                <div className="text-sm text-gray-600">
                                    <span className="font-medium">GDC-{tpia.gdcNumber}</span> • {formatDate(tpia.purchasedAt)}
                                </div>
                                <button
                                    onClick={() => setSelectedTPIAId(tpia._id)}
                                    className="text-blue-600 font-bold text-sm"
                                >
                                    Details
                                </button>
                            </div>
                        </div>
                    ))}

                    {filteredTPIAs.length === 0 && (
                        <div className="text-center py-12 bg-white rounded-xl shadow-lg">
                            <p className="text-gray-500">No TPIAs found matching your filters.</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Modal */}
            {selectedTPIAId && (
                <TPIADetailsModal
                    tpiaId={selectedTPIAId}
                    onClose={() => setSelectedTPIAId(null)}
                    onChanged={fetchTPIAs}
                />
            )}
        </AdminLayout>
    );
}
