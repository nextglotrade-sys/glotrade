"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import AdminLayout from "@/components/admin/AdminLayout";
import { apiGet, apiPost } from "@/utils/api";
import { formatCurrency } from "@/utils/format";
import { translate } from "@/utils/translate";
import { Play, X, AlertCircle, CheckCircle2, Loader2, DollarSign, TrendingUp, Coins, Calculator, CheckCircle } from "lucide-react";

interface TradeCycle {
    _id: string;
    cycleId: string;
    cycleNumber: number;
    gdcId: string;
    gdcNumber: number;
    tpiaCount: number;
    startDate: string;
    endDate: string;
    status: string;
    totalCapital: number;
    targetProfitRate: number;
    actualProfitRate: number;
    totalProfitGenerated: number;
    profitDistributed: boolean;
    performanceRating?: string;
    currentProfit?: number;
}

export default function AdminCyclesPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [cycles, setCycles] = useState<TradeCycle[]>([]);
    const [filteredCycles, setFilteredCycles] = useState<TradeCycle[]>([]);
    const [statusFilter, setStatusFilter] = useState<string>("all");
    const [processingCycle, setProcessingCycle] = useState<string | null>(null);

    // Modal states
    const [cycleToStart, setCycleToStart] = useState<TradeCycle | null>(null);
    const [modalError, setModalError] = useState<string | null>(null);

    const [cycleToComplete, setCycleToComplete] = useState<TradeCycle | null>(null);
    const [completeSalePrice, setCompleteSalePrice] = useState<string>("");
    const [completeTradingCosts, setCompleteTradingCosts] = useState<string>("0");
    const [completeModalError, setCompleteModalError] = useState<string | null>(null);

    const [cycleToDistribute, setCycleToDistribute] = useState<TradeCycle | null>(null);
    const [distributeModalError, setDistributeModalError] = useState<string | null>(null);

    const [actionToast, setActionToast] = useState<{ type: "success" | "error"; message: string } | null>(null);

    useEffect(() => {
        fetchCycles();
    }, []);

    useEffect(() => {
        filterCycles();
    }, [statusFilter, cycles]);

    const fetchCycles = async () => {
        try {
            setLoading(true);
            const response = await apiGet<{ success: boolean; data: TradeCycle[] }>("/api/v1/gdip/admin/cycles");

            if (response.success) {
                setCycles(response.data);
                setFilteredCycles(response.data);
            }
        } catch (err: any) {
            console.error("Error fetching cycles:", err);
        } finally {
            setLoading(false);
        }
    };

    const filterCycles = () => {
        if (statusFilter === "all") {
            setFilteredCycles(cycles);
        } else {
            setFilteredCycles(cycles.filter((cycle) => cycle.status === statusFilter));
        }
    };

    const handleOpenCompleteModal = (cycle: TradeCycle) => {
        setCycleToComplete(cycle);
        // Pre-fill target 5% sale price (capital * 1.05)
        const targetProfit = cycle.totalCapital * ((cycle.targetProfitRate || 5) / 100);
        const suggestedSale = cycle.totalCapital + targetProfit;
        setCompleteSalePrice(suggestedSale.toString());
        setCompleteTradingCosts("0");
        setCompleteModalError(null);
    };

    const executeCompleteCycle = async () => {
        if (!cycleToComplete) return;

        const sale = parseFloat(completeSalePrice);
        const costs = parseFloat(completeTradingCosts || "0");

        if (isNaN(sale) || sale <= 0) {
            setCompleteModalError("Please enter a valid sale price greater than ₦0");
            return;
        }

        if (isNaN(costs) || costs < 0) {
            setCompleteModalError("Trading costs cannot be negative");
            return;
        }

        try {
            setProcessingCycle(cycleToComplete._id);
            setCompleteModalError(null);
            await apiPost(
                `/api/v1/gdip/admin/cycle/${cycleToComplete._id}/complete`,
                {
                    salePrice: sale,
                    tradingCosts: costs,
                }
            );

            const completedId = cycleToComplete.cycleId;
            setCycleToComplete(null);
            setActionToast({
                type: "success",
                message: `Trade Cycle ${completedId} has been successfully completed! You can now distribute profits.`
            });
            fetchCycles();
            setTimeout(() => setActionToast(null), 5000);
        } catch (err: any) {
            console.error("Error completing cycle:", err);
            setCompleteModalError(err.message || "Failed to complete trade cycle");
        } finally {
            setProcessingCycle(null);
        }
    };

    const executeStartCycle = async () => {
        if (!cycleToStart) return;

        try {
            setProcessingCycle(cycleToStart._id);
            setModalError(null);
            await apiPost(
                `/api/v1/gdip/admin/cycle/${cycleToStart._id}/start`,
                {}
            );

            const startedName = cycleToStart.cycleId;
            setCycleToStart(null);
            setActionToast({
                type: "success",
                message: `Trade Cycle ${startedName} has been successfully started and is now active!`
            });
            fetchCycles();
            setTimeout(() => setActionToast(null), 5000);
        } catch (err: any) {
            console.error("Error starting cycle:", err);
            setModalError(err.message || "Failed to start trade cycle");
        } finally {
            setProcessingCycle(null);
        }
    };

    const handleOpenDistributeModal = (cycle: TradeCycle) => {
        setCycleToDistribute(cycle);
        setDistributeModalError(null);
    };

    const executeDistributeProfits = async () => {
        if (!cycleToDistribute) return;

        try {
            setProcessingCycle(cycleToDistribute._id);
            setDistributeModalError(null);
            await apiPost(
                `/api/v1/gdip/admin/cycle/${cycleToDistribute._id}/distribute`,
                {}
            );

            const distributedId = cycleToDistribute.cycleId;
            setCycleToDistribute(null);
            setActionToast({
                type: "success",
                message: `Profits for Trade Cycle ${distributedId} have been distributed successfully!`
            });
            fetchCycles();
            setTimeout(() => setActionToast(null), 5000);
        } catch (err: any) {
            console.error("Error distributing profits:", err);
            setDistributeModalError(err.message || "Failed to distribute profits");
        } finally {
            setProcessingCycle(null);
        }
    };

    const getCompleteCalculations = () => {
        if (!cycleToComplete) return { netProfit: 0, actualROI: 0, profitPerTPIA: 0, rating: "poor" as const };
        const sale = parseFloat(completeSalePrice) || 0;
        const costs = parseFloat(completeTradingCosts) || 0;
        const capital = cycleToComplete.totalCapital || 10000000;
        const netProfit = sale - (capital + costs);
        const actualROI = capital > 0 ? (netProfit / capital) * 100 : 0;
        const profitPerTPIA = cycleToComplete.tpiaCount > 0 ? netProfit / cycleToComplete.tpiaCount : 0;

        let rating: "excellent" | "good" | "average" | "poor" = "poor";
        if (actualROI >= 5) rating = "excellent";
        else if (actualROI >= 3) rating = "good";
        else if (actualROI >= 1) rating = "average";

        return { netProfit, actualROI, profitPerTPIA, rating };
    };


    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString("en-NG", {
            year: "numeric",
            month: "short",
            day: "numeric",
        });
    };

    const getCycleProgress = (cycle: TradeCycle) => {
        if (cycle.status === "completed") return 100;
        if (cycle.status !== "active") return 0;

        const start = new Date(cycle.startDate).getTime();
        const end = new Date(cycle.endDate).getTime();
        const now = Date.now();

        if (isNaN(start) || isNaN(end) || end <= start) return 0;
        return Math.min(100, Math.max(0, ((now - start) / (end - start)) * 100));
    };

    const getCycleStateText = (cycle: TradeCycle) => {
        if (cycle.status === "active") return translate("gdip.cycles.card.active", { percent: getCycleProgress(cycle).toFixed(1) });
        if (cycle.status === "scheduled") return translate("gdip.common.scheduledNotAccruing");
        if (cycle.status === "processing") return translate("gdip.common.processingResults");
        if (cycle.status === "completed") return translate("gdip.common.completed");
        return translate("gdip.common.notStarted");
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case "active":
                return "bg-green-100 text-green-700";
            case "completed":
                return "bg-blue-100 text-blue-700";
            case "scheduled":
                return "bg-yellow-100 text-yellow-700";
            case "processing":
                return "bg-purple-100 text-purple-700";
            default:
                return "bg-gray-100 text-gray-700";
        }
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
                        className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 transition-colors group"
                    >
                        <svg className="w-5 h-5 transition-transform group-hover:-translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                        Back to Dashboard
                    </button>
                    <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6">
                        <div className="space-y-1">
                            <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 tracking-tight">Trade Cycle Management</h1>
                            <p className="text-gray-500 font-medium">Monitor and control all 37-day trade cycles</p>
                        </div>
                        <button
                            onClick={() => router.push("/admin/gdip/cycles/create")}
                            className="bg-blue-600 text-white px-6 py-3 rounded-2xl font-bold hover:bg-blue-700 transition-all shadow-md shadow-blue-200 text-sm sm:text-base whitespace-nowrap flex items-center justify-center gap-2 active:scale-95"
                        >
                            <span className="text-xl">+</span>
                            <span>Create New Cycle</span>
                        </button>
                    </div>
                </div>

                {/* Feedback Toast Notification */}
                {actionToast && (
                    <div
                        className={`mb-6 p-4 rounded-2xl border flex items-center justify-between gap-3 shadow-sm transition-all ${
                            actionToast.type === "success"
                                ? "bg-emerald-50/90 border-emerald-200 text-emerald-800"
                                : "bg-red-50/90 border-red-200 text-red-800"
                        }`}
                    >
                        <div className="flex items-center gap-3">
                            {actionToast.type === "success" ? (
                                <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
                            ) : (
                                <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
                            )}
                            <p className="text-xs sm:text-sm font-bold">{actionToast.message}</p>
                        </div>
                        <button
                            onClick={() => setActionToast(null)}
                            className="p-1 rounded-lg hover:bg-black/5 text-gray-500 hover:text-gray-700 transition-colors"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    </div>
                )}

                {/* Stats */}
                {cycles.length > 0 && (
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-3 sm:gap-4 mb-10">
                        <div className="bg-white rounded-2xl border border-gray-100 p-4 sm:p-5 shadow-sm">
                            <p className="text-[10px] sm:text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Total</p>
                            <p className="text-2xl sm:text-3xl font-black text-gray-900">{cycles.length}</p>
                        </div>
                        <div className="bg-white rounded-2xl border border-gray-100 p-4 sm:p-5 shadow-sm">
                            <p className="text-[10px] sm:text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Scheduled</p>
                            <p className="text-2xl sm:text-3xl font-black text-amber-500">
                                {cycles.filter((c) => c.status === "scheduled").length}
                            </p>
                        </div>
                        <div className="bg-white rounded-2xl border border-gray-100 p-4 sm:p-5 shadow-sm">
                            <p className="text-[10px] sm:text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Active</p>
                            <p className="text-2xl sm:text-3xl font-black text-green-500">
                                {cycles.filter((c) => c.status === "active").length}
                            </p>
                        </div>
                        <div className="bg-white rounded-2xl border border-gray-100 p-4 sm:p-5 shadow-sm">
                            <p className="text-[10px] sm:text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Processing</p>
                            <p className="text-2xl sm:text-3xl font-black text-indigo-500">
                                {cycles.filter((c) => c.status === "processing").length}
                            </p>
                        </div>
                        <div className="bg-white rounded-2xl border border-gray-100 p-4 sm:p-5 shadow-sm col-span-2 md:col-span-1">
                            <p className="text-[10px] sm:text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Completed</p>
                            <p className="text-2xl sm:text-3xl font-black text-blue-500">
                                {cycles.filter((c) => c.status === "completed").length}
                            </p>
                        </div>
                    </div>
                )}

                {/* Filters */}
                <div className="bg-white rounded-3xl border border-gray-100 p-5 mb-8 shadow-sm">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                            <label className="text-xs font-bold text-gray-400 uppercase tracking-tight whitespace-nowrap">Filter Status:</label>
                            <select
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                                className="px-4 py-2 bg-gray-50 border-none rounded-xl font-bold text-gray-700 focus:ring-2 focus:ring-blue-500 cursor-pointer outline-none transition-all"
                            >
                                <option value="all">All Cycles</option>
                                <option value="scheduled">Scheduled</option>
                                <option value="active">Active</option>
                                <option value="processing">Processing</option>
                                <option value="completed">Completed</option>
                            </select>
                        </div>
                        <span className="text-[10px] sm:text-xs font-bold text-gray-400 uppercase tracking-widest bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-100">
                            Showing {filteredCycles.length} of {cycles.length} cycles
                        </span>
                    </div>
                </div>

                {/* Cycles List */}
                <div className="space-y-6">
                    {filteredCycles.map((cycle) => (
                        <div key={cycle._id} className="bg-white rounded-3xl border border-gray-100 shadow-sm hover:shadow-md transition-all overflow-hidden">
                            <div className="p-5 sm:p-6 border-b border-gray-50 bg-white/50">
                                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                                    <div className="space-y-2">
                                        <div className="flex flex-wrap items-center gap-3">
                                            <h3 className="text-xl sm:text-2xl font-black text-gray-900 tracking-tight">{cycle.cycleId}</h3>
                                            <span className={`px-3 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider ${getStatusColor(cycle.status)}`}>
                                                {cycle.status}
                                            </span>
                                            {cycle.performanceRating && (
                                                <span className="px-3 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider bg-gray-100 text-gray-500 border border-gray-200">
                                                    {cycle.performanceRating}
                                                </span>
                                            )}
                                        </div>
                                        <div className="flex items-center gap-4 text-sm font-bold text-gray-400 uppercase tracking-tight">
                                            <span className="flex items-center gap-1.5"><span className="text-lg opacity-50">#</span> GDC-{cycle.gdcNumber}</span>
                                            <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
                                            <span>{cycle.tpiaCount} TPIAs Joined</span>
                                        </div>
                                    </div>

                                    <div className="flex flex-row gap-3">
                                        {cycle.status === "scheduled" && (
                                            <button
                                                onClick={() => {
                                                    setModalError(null);
                                                    setCycleToStart(cycle);
                                                }}
                                                disabled={processingCycle === cycle._id}
                                                className="flex-1 sm:flex-none px-6 py-2.5 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition-all shadow-md shadow-emerald-100 disabled:opacity-50 text-xs font-black uppercase tracking-widest active:scale-95 whitespace-nowrap flex items-center justify-center gap-1.5"
                                            >
                                                <Play className="w-3.5 h-3.5 fill-current" />
                                                <span>Start Cycle</span>
                                            </button>
                                        )}
                                        {cycle.status === "active" && (
                                            <button
                                                onClick={() => handleOpenCompleteModal(cycle)}
                                                disabled={processingCycle === cycle._id}
                                                className="flex-1 sm:flex-none px-6 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all shadow-md shadow-blue-100 disabled:opacity-50 text-xs font-black uppercase tracking-widest active:scale-95 whitespace-nowrap flex items-center justify-center gap-1.5"
                                            >
                                                <CheckCircle className="w-3.5 h-3.5" />
                                                <span>Complete Cycle</span>
                                            </button>
                                        )}
                                        {cycle.status === "processing" && !cycle.profitDistributed && (
                                            <button
                                                onClick={() => handleOpenDistributeModal(cycle)}
                                                disabled={processingCycle === cycle._id}
                                                className="flex-1 sm:flex-none px-6 py-2.5 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-all shadow-md shadow-green-100 disabled:opacity-50 text-xs font-black uppercase tracking-widest active:scale-95 whitespace-nowrap flex items-center justify-center gap-1.5"
                                            >
                                                <Coins className="w-3.5 h-3.5" />
                                                <span>Distribute Profits</span>
                                            </button>
                                        )}
                                        <button
                                            onClick={() => router.push(`/admin/gdip/gdc/${cycle.gdcId}`)}
                                            className="p-2.5 bg-gray-50 text-gray-400 rounded-xl hover:bg-gray-100 transition-colors border border-gray-100"
                                            title="View Cluster Details"
                                        >
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                            </svg>
                                        </button>
                                    </div>
                                </div>
                            </div>

                            <div className="p-5 sm:p-6 bg-gray-50/30">
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8">
                                    <div className="space-y-1.5">
                                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-1.5">
                                            <span className="text-sm">📅</span> Cycle Period
                                        </p>
                                        <p className="text-xs sm:text-sm font-bold text-gray-700 leading-snug">
                                            {formatDate(cycle.startDate)}<br className="md:hidden" />
                                            <span className="mx-1 text-gray-300 hidden md:inline">→</span>
                                            <span className="md:hidden block text-[10px] text-gray-300">to</span>
                                            {formatDate(cycle.endDate)}
                                        </p>
                                    </div>
                                    <div className="space-y-1.5">
                                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-1.5">
                                            <span className="text-sm">💰</span> Total Capital
                                        </p>
                                        <p className="text-sm sm:text-base font-black text-gray-900">{formatCurrency(cycle.totalCapital)}</p>
                                    </div>
                                    <div className="space-y-1.5">
                                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-1.5">
                                            <span className="text-sm">🎯</span> Target ROI
                                        </p>
                                        <div className="flex items-center gap-2">
                                            <span className="text-sm sm:text-base font-black text-gray-900">{cycle.targetProfitRate}%</span>
                                            <span className="px-1.5 py-0.5 bg-gray-100 text-[10px] text-gray-500 rounded font-bold">EST</span>
                                        </div>
                                    </div>

                                    {cycle.status === "completed" ? (
                                        <div className="space-y-1.5">
                                            <p className="text-[10px] font-bold text-green-600/60 uppercase tracking-widest flex items-center gap-1.5">
                                                <span className="text-sm">📈</span> Actual ROI
                                            </p>
                                            <div className="flex items-center gap-2">
                                                <p className="text-sm sm:text-base font-black text-green-600">{cycle.actualProfitRate.toFixed(2)}%</p>
                                                <span className="px-1.5 py-0.5 bg-green-50 text-[10px] text-green-600 rounded font-bold animate-pulse">FIXED</span>
                                            </div>
                                        </div>
                                    ) : cycle.status === "active" ? (
                                        <div className="space-y-1.5 bg-green-50/50 p-2 rounded-xl border border-green-50">
                                            <p className="text-[10px] font-bold text-green-500 uppercase tracking-widest">{translate("gdip.common.accruedProfit")}</p>
                                            <p className="text-xs font-black text-green-700">+{formatCurrency(cycle.currentProfit || 0)}</p>
                                        </div>
                                    ) : (
                                        <div className="space-y-1.5 bg-amber-50/50 p-2 rounded-xl border border-amber-50">
                                            <p className="text-[10px] font-bold text-amber-500 uppercase tracking-widest">{translate("gdip.common.activationStatus")}</p>
                                            <p className="text-xs font-bold text-amber-700">
                                                {cycle.status === "scheduled" ? translate("gdip.common.notAccruingYet") : translate("gdip.common.pendingClose")}
                                            </p>
                                        </div>
                                    )}
                                </div>

                                <div className="mt-6 pt-6 border-t border-gray-100">
                                    <div className="flex items-center justify-between gap-4 mb-2">
                                        <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{translate("gdip.common.cycleProgress")}</span>
                                        <span className={`text-[10px] font-black uppercase tracking-widest ${cycle.status === "active" ? "text-green-600" : cycle.status === "scheduled" ? "text-amber-600" : "text-gray-500"}`}>
                                            {getCycleStateText(cycle)}
                                        </span>
                                    </div>
                                    <div className="h-2.5 bg-white rounded-full overflow-hidden p-0.5 border border-gray-100">
                                        <div
                                            className={`h-full rounded-full transition-all duration-1000 ${cycle.status === "completed" ? "bg-blue-500" : cycle.status === "active" ? "bg-green-500" : "bg-amber-400"}`}
                                            style={{ width: `${getCycleProgress(cycle)}%` }}
                                        />
                                    </div>
                                </div>

                                {cycle.status === "completed" && (
                                    <div className="mt-6 pt-6 border-t border-gray-100 grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div className="flex items-center justify-between p-3 bg-green-50/50 rounded-2xl border border-green-50">
                                            <span className="text-xs font-bold text-green-700/70 uppercase">Total Profit Generated</span>
                                            <span className="text-lg font-black text-green-600">{formatCurrency(cycle.totalProfitGenerated)}</span>
                                        </div>
                                        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-2xl border border-gray-100">
                                            <span className="text-xs font-bold text-gray-400 uppercase">Profit Status</span>
                                            <span className={`text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-lg ${cycle.profitDistributed ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700 animate-pulse"}`}>
                                                {cycle.profitDistributed ? "✓ Distributed" : "⏳ Pending"}
                                            </span>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Custom Start Cycle Confirmation Modal */}
            {cycleToStart && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm transition-opacity">
                    <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden transform transition-all">
                        {/* Modal Header */}
                        <div className="flex items-center justify-between p-6 border-b border-gray-100 bg-gradient-to-r from-emerald-50/70 via-white to-white">
                            <div className="flex items-center gap-3">
                                <div className="w-11 h-11 rounded-2xl bg-emerald-600 flex items-center justify-center text-white shadow-lg shadow-emerald-200">
                                    <Play className="w-5 h-5 fill-current ml-0.5" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-black text-gray-900 tracking-tight">Start Trade Cycle</h3>
                                    <p className="text-xs text-gray-500 font-semibold">{cycleToStart.cycleId} • GDC-{cycleToStart.gdcNumber}</p>
                                </div>
                            </div>
                            <button
                                onClick={() => {
                                    if (!processingCycle) {
                                        setCycleToStart(null);
                                        setModalError(null);
                                    }
                                }}
                                disabled={!!processingCycle}
                                className="p-2 text-gray-400 hover:text-gray-600 rounded-xl hover:bg-gray-100 transition-colors disabled:opacity-50"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Modal Body */}
                        <div className="p-6 space-y-5">
                            <div>
                                <h4 className="text-base font-bold text-gray-900 leading-snug">
                                    Are you sure you want to start this trade cycle now?
                                </h4>
                                <p className="text-xs text-gray-500 mt-1.5 leading-relaxed">
                                    Activating this cycle will lock the commodity allocation, transition the status from <span className="font-bold text-amber-600">Scheduled</span> to <span className="font-bold text-emerald-600">Active</span>, and begin the 37-day countdown for partner ROI accrual.
                                </p>
                            </div>

                            {/* Cycle Details Card */}
                            <div className="bg-gray-50/80 rounded-2xl p-4 border border-gray-100 grid grid-cols-2 gap-4 text-xs">
                                <div>
                                    <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Cluster Batch</span>
                                    <p className="font-black text-gray-900 text-sm mt-0.5">GDC-{cycleToStart.gdcNumber}</p>
                                </div>
                                <div>
                                    <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Participating TPIAs</span>
                                    <p className="font-black text-gray-900 text-sm mt-0.5">{cycleToStart.tpiaCount} Blocks (Full)</p>
                                </div>
                                <div>
                                    <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Total Capital Pool</span>
                                    <p className="font-black text-gray-900 text-sm mt-0.5">{formatCurrency(cycleToStart.totalCapital)}</p>
                                </div>
                                <div>
                                    <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Target Return</span>
                                    <p className="font-black text-emerald-600 text-sm mt-0.5">{cycleToStart.targetProfitRate}% (37 Days)</p>
                                </div>
                            </div>

                            {modalError && (
                                <div className="p-3.5 bg-red-50 border border-red-100 rounded-2xl flex items-start gap-2.5 text-xs text-red-700 font-medium">
                                    <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
                                    <span>{modalError}</span>
                                </div>
                            )}
                        </div>

                        {/* Modal Footer / Actions */}
                        <div className="p-6 bg-gray-50/50 border-t border-gray-100 flex items-center justify-end gap-3">
                            <button
                                type="button"
                                onClick={() => {
                                    setCycleToStart(null);
                                    setModalError(null);
                                }}
                                disabled={!!processingCycle}
                                className="px-5 py-2.5 text-xs font-bold text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-xl transition-all disabled:opacity-50"
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                onClick={executeStartCycle}
                                disabled={!!processingCycle}
                                className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black uppercase tracking-wider rounded-xl shadow-lg shadow-emerald-200 transition-all flex items-center gap-2 active:scale-95 disabled:opacity-50"
                            >
                                {processingCycle ? (
                                    <>
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                        <span>Starting...</span>
                                    </>
                                ) : (
                                    <>
                                        <Play className="w-3.5 h-3.5 fill-current" />
                                        <span>Yes, Start Cycle</span>
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Custom Complete Cycle Modal */}
            {cycleToComplete && (() => {
                const calcs = getCompleteCalculations();
                const targetProfit = cycleToComplete.totalCapital * ((cycleToComplete.targetProfitRate || 5) / 100);
                const defaultTargetSale = cycleToComplete.totalCapital + targetProfit;

                return (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm transition-opacity">
                        <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden transform transition-all">
                            {/* Modal Header */}
                            <div className="flex items-center justify-between p-6 border-b border-gray-100 bg-gradient-to-r from-blue-50/70 via-white to-white">
                                <div className="flex items-center gap-3">
                                    <div className="w-11 h-11 rounded-2xl bg-blue-600 flex items-center justify-center text-white shadow-lg shadow-blue-200">
                                        <CheckCircle className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-black text-gray-900 tracking-tight">Complete Trade Cycle</h3>
                                        <p className="text-xs text-gray-500 font-semibold">{cycleToComplete.cycleId} • GDC-{cycleToComplete.gdcNumber}</p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => {
                                        if (!processingCycle) {
                                            setCycleToComplete(null);
                                            setCompleteModalError(null);
                                        }
                                    }}
                                    disabled={!!processingCycle}
                                    className="p-2 text-gray-400 hover:text-gray-600 rounded-xl hover:bg-gray-100 transition-colors disabled:opacity-50"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            {/* Modal Body */}
                            <div className="p-6 space-y-5">
                                <p className="text-xs text-gray-500 leading-relaxed">
                                    Enter final commodity sales proceeds and any logistics or handling costs to settle the trade cycle and calculate final profits.
                                </p>

                                {/* Quick Helper Button */}
                                <div className="flex items-center justify-between bg-blue-50/60 p-3.5 rounded-2xl border border-blue-100">
                                    <div>
                                        <span className="text-[10px] font-bold text-blue-600 uppercase tracking-wider block">Target 5% Baseline</span>
                                        <p className="text-xs font-black text-blue-900">{formatCurrency(defaultTargetSale)}</p>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setCompleteSalePrice(defaultTargetSale.toString());
                                            setCompleteTradingCosts("0");
                                        }}
                                        className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all shadow-sm active:scale-95"
                                    >
                                        Auto-Fill 5%
                                    </button>
                                </div>

                                {/* Inputs */}
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-xs font-bold text-gray-700 uppercase tracking-tight mb-1.5">
                                            Gross Sale Proceeds (₦) <span className="text-red-500">*</span>
                                        </label>
                                        <div className="relative">
                                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold text-sm">₦</span>
                                            <input
                                                type="number"
                                                min="0"
                                                step="1000"
                                                value={completeSalePrice}
                                                onChange={(e) => setCompleteSalePrice(e.target.value)}
                                                placeholder="e.g. 10500000"
                                                className="w-full pl-9 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl text-sm font-bold text-gray-900 focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none transition-all"
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-xs font-bold text-gray-700 uppercase tracking-tight mb-1.5">
                                            Trading / Logistics Costs (₦, optional)
                                        </label>
                                        <div className="relative">
                                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold text-sm">₦</span>
                                            <input
                                                type="number"
                                                min="0"
                                                step="1000"
                                                value={completeTradingCosts}
                                                onChange={(e) => setCompleteTradingCosts(e.target.value)}
                                                placeholder="0"
                                                className="w-full pl-9 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl text-sm font-bold text-gray-900 focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none transition-all"
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Live Profit Calculation Preview */}
                                <div className="bg-gray-50/90 rounded-2xl p-4 border border-gray-100 space-y-2.5">
                                    <div className="flex items-center justify-between text-xs">
                                        <span className="text-gray-400 font-bold uppercase tracking-wider text-[10px]">Net Cycle Profit</span>
                                        <span className={`font-black text-sm ${calcs.netProfit >= 0 ? "text-emerald-600" : "text-red-600"}`}>
                                            {calcs.netProfit >= 0 ? "+" : ""}{formatCurrency(calcs.netProfit)}
                                        </span>
                                    </div>
                                    <div className="flex items-center justify-between text-xs">
                                        <span className="text-gray-400 font-bold uppercase tracking-wider text-[10px]">Actual ROI</span>
                                        <div className="flex items-center gap-2">
                                            <span className={`font-black text-sm ${calcs.actualROI >= 0 ? "text-emerald-600" : "text-red-600"}`}>
                                                {calcs.actualROI.toFixed(2)}%
                                            </span>
                                            <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider ${
                                                calcs.rating === "excellent"
                                                    ? "bg-emerald-100 text-emerald-800"
                                                    : calcs.rating === "good"
                                                    ? "bg-blue-100 text-blue-800"
                                                    : calcs.rating === "average"
                                                    ? "bg-amber-100 text-amber-800"
                                                    : "bg-red-100 text-red-800"
                                            }`}>
                                                {calcs.rating}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="flex items-center justify-between text-xs pt-1.5 border-t border-gray-200/60">
                                        <span className="text-gray-400 font-bold uppercase tracking-wider text-[10px]">Estimated Profit per TPIA</span>
                                        <span className="font-bold text-gray-700">
                                            {formatCurrency(calcs.profitPerTPIA)}
                                        </span>
                                    </div>
                                </div>

                                {completeModalError && (
                                    <div className="p-3.5 bg-red-50 border border-red-100 rounded-2xl flex items-start gap-2.5 text-xs text-red-700 font-medium">
                                        <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
                                        <span>{completeModalError}</span>
                                    </div>
                                )}
                            </div>

                            {/* Modal Footer / Actions */}
                            <div className="p-6 bg-gray-50/50 border-t border-gray-100 flex items-center justify-end gap-3">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setCycleToComplete(null);
                                        setCompleteModalError(null);
                                    }}
                                    disabled={!!processingCycle}
                                    className="px-5 py-2.5 text-xs font-bold text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-xl transition-all disabled:opacity-50"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="button"
                                    onClick={executeCompleteCycle}
                                    disabled={!!processingCycle}
                                    className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-black uppercase tracking-wider rounded-xl shadow-lg shadow-blue-200 transition-all flex items-center gap-2 active:scale-95 disabled:opacity-50"
                                >
                                    {processingCycle ? (
                                        <>
                                            <Loader2 className="w-4 h-4 animate-spin" />
                                            <span>Completing...</span>
                                        </>
                                    ) : (
                                        <>
                                            <CheckCircle className="w-3.5 h-3.5" />
                                            <span>Complete Cycle</span>
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                );
            })()}

            {/* Custom Distribute Profits Modal */}
            {cycleToDistribute && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm transition-opacity">
                    <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden transform transition-all">
                        {/* Modal Header */}
                        <div className="flex items-center justify-between p-6 border-b border-gray-100 bg-gradient-to-r from-emerald-50/70 via-white to-white">
                            <div className="flex items-center gap-3">
                                <div className="w-11 h-11 rounded-2xl bg-emerald-600 flex items-center justify-center text-white shadow-lg shadow-emerald-200">
                                    <Coins className="w-5 h-5" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-black text-gray-900 tracking-tight">Distribute Profits</h3>
                                    <p className="text-xs text-gray-500 font-semibold">{cycleToDistribute.cycleId} • GDC-{cycleToDistribute.gdcNumber}</p>
                                </div>
                            </div>
                            <button
                                onClick={() => {
                                    if (!processingCycle) {
                                        setCycleToDistribute(null);
                                        setDistributeModalError(null);
                                    }
                                }}
                                disabled={!!processingCycle}
                                className="p-2 text-gray-400 hover:text-gray-600 rounded-xl hover:bg-gray-100 transition-colors disabled:opacity-50"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Modal Body */}
                        <div className="p-6 space-y-5">
                            <div>
                                <h4 className="text-base font-bold text-gray-900 leading-snug">
                                    Are you ready to distribute profits for this cycle?
                                </h4>
                                <p className="text-xs text-gray-500 mt-1.5 leading-relaxed">
                                    Profits will be automatically credited to partner wallets for <span className="font-bold text-blue-600">EPS</span> accounts and compounded into the TPIA valuation for <span className="font-bold text-emerald-600">TPM</span> accounts.
                                </p>
                            </div>

                            {/* Profit Details Card */}
                            <div className="bg-gray-50/80 rounded-2xl p-4 border border-gray-100 grid grid-cols-2 gap-4 text-xs">
                                <div>
                                    <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Total Profit Pool</span>
                                    <p className="font-black text-emerald-600 text-sm mt-0.5">{formatCurrency(cycleToDistribute.totalProfitGenerated)}</p>
                                </div>
                                <div>
                                    <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Actual ROI Achieved</span>
                                    <p className="font-black text-gray-900 text-sm mt-0.5">{(cycleToDistribute.actualProfitRate || 0).toFixed(2)}%</p>
                                </div>
                                <div>
                                    <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">TPIAs Receiving Payout</span>
                                    <p className="font-black text-gray-900 text-sm mt-0.5">{cycleToDistribute.tpiaCount} Blocks</p>
                                </div>
                                <div>
                                    <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Est. Return Per Block</span>
                                    <p className="font-black text-gray-900 text-sm mt-0.5">
                                        {formatCurrency(cycleToDistribute.tpiaCount > 0 ? cycleToDistribute.totalProfitGenerated / cycleToDistribute.tpiaCount : 0)}
                                    </p>
                                </div>
                            </div>

                            {distributeModalError && (
                                <div className="p-3.5 bg-red-50 border border-red-100 rounded-2xl flex items-start gap-2.5 text-xs text-red-700 font-medium">
                                    <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
                                    <span>{distributeModalError}</span>
                                </div>
                            )}
                        </div>

                        {/* Modal Footer / Actions */}
                        <div className="p-6 bg-gray-50/50 border-t border-gray-100 flex items-center justify-end gap-3">
                            <button
                                type="button"
                                onClick={() => {
                                    setCycleToDistribute(null);
                                    setDistributeModalError(null);
                                }}
                                disabled={!!processingCycle}
                                className="px-5 py-2.5 text-xs font-bold text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-xl transition-all disabled:opacity-50"
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                onClick={executeDistributeProfits}
                                disabled={!!processingCycle}
                                className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black uppercase tracking-wider rounded-xl shadow-lg shadow-emerald-200 transition-all flex items-center gap-2 active:scale-95 disabled:opacity-50"
                            >
                                {processingCycle ? (
                                    <>
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                        <span>Distributing...</span>
                                    </>
                                ) : (
                                    <>
                                        <Coins className="w-3.5 h-3.5" />
                                        <span>Confirm & Distribute</span>
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </AdminLayout>
    );
}
