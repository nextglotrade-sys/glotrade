"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { apiGet } from "@/utils/api";
import {
    ShieldCheck,
    AlertTriangle,
    CheckCircle2,
    Calendar,
    User,
    Hash,
    Award,
    ExternalLink,
    ArrowLeft,
    Clock,
    XCircle
} from "lucide-react";

interface VerificationData {
    certificateNumber: string;
    tpiaId: string;
    partnerName: string;
    status: string;
    coverageAmount: number;
    effectiveDate: string;
    expiryDate: string;
    commodityType: string;
    isAuthentic: boolean;
    verifiedAt: string;
}

export default function PublicVerificationPage() {
    const params = useParams();
    const router = useRouter();
    const certificateNumber = params.id as string;

    const [loading, setLoading] = useState(true);
    const [data, setData] = useState<VerificationData | null>(null);
    const [error, setError] = useState("");

    useEffect(() => {
        if (certificateNumber) {
            verifyCertificate();
        }
    }, [certificateNumber]);

    const verifyCertificate = async () => {
        try {
            setLoading(true);
            // Public endpoint (no auth required)
            const response = await apiGet<{ success: boolean; data: VerificationData; error?: string }>(
                `/api/v1/insurance/verify/${certificateNumber}`
            );

            if (response.success) {
                setData(response.data);
            } else {
                setError(response.error || "Certificate verification failed");
            }
        } catch (err: any) {
            console.error("Verification error:", err);
            setError(err.message || "Invalid certificate number");
        } finally {
            setLoading(false);
        }
    };

    const getStatusConfig = (status: string) => {
        switch (status) {
            case "active":
                return {
                    headerBg: "bg-green-600",
                    Icon: ShieldCheck,
                    heading: "Verified Authentic",
                    subtext: "Official Insurance Document",
                    pillClass: "bg-green-100 text-green-700",
                };
            case "pending":
                return {
                    headerBg: "bg-amber-500",
                    Icon: Clock,
                    heading: "Certificate Pending",
                    subtext: "Insurance activation in progress",
                    pillClass: "bg-amber-100 text-amber-700",
                };
            case "expired":
                return {
                    headerBg: "bg-gray-500",
                    Icon: XCircle,
                    heading: "Certificate Expired",
                    subtext: "This certificate is no longer valid",
                    pillClass: "bg-gray-100 text-gray-600",
                };
            case "cancelled":
                return {
                    headerBg: "bg-red-500",
                    Icon: XCircle,
                    heading: "Certificate Cancelled",
                    subtext: "This certificate has been revoked",
                    pillClass: "bg-red-100 text-red-700",
                };
            case "claimed":
                return {
                    headerBg: "bg-blue-600",
                    Icon: ShieldCheck,
                    heading: "Claim Filed",
                    subtext: "A claim has been made on this certificate",
                    pillClass: "bg-blue-100 text-blue-700",
                };
            default:
                return {
                    headerBg: "bg-gray-400",
                    Icon: AlertTriangle,
                    heading: "Status Unknown",
                    subtext: "Could not determine certificate status",
                    pillClass: "bg-gray-100 text-gray-500",
                };
        }
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat("en-NG", {
            style: "currency",
            currency: "NGN",
        }).format(amount);
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString("en-NG", {
            year: "numeric",
            month: "long",
            day: "numeric",
        });
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-white flex flex-col items-center justify-center p-6 text-center">
                <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-green-600 mb-4"></div>
                <p className="text-gray-500 font-medium">Authenticating Certificate...</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
            <div className="max-w-md w-full">
                {/* Branding Block */}
                <div className="text-center mb-8">
                    <img src="/favicon.png" alt="GloTrade" className="w-12 h-12 mx-auto mb-3" />
                    <h1 className="text-xl font-bold text-gray-900 tracking-tight">GloTrade Security</h1>
                    <p className="text-sm text-gray-500">Document Verification Portal</p>
                </div>

                {error ? (
                    <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-red-100">
                        <div className="bg-red-500 p-8 flex justify-center">
                            <AlertTriangle className="w-16 h-16 text-white" />
                        </div>
                        <div className="p-8 text-center">
                            <h2 className="text-2xl font-bold text-gray-900 mb-2">Verification Failed</h2>
                            <p className="text-gray-600 mb-6">
                                {error}
                            </p>
                            <div className="bg-red-50 p-4 rounded-xl text-red-700 text-sm font-medium mb-8">
                                WARNING: This document may be invalid or forged. Do not proceed with transactions based on this copy.
                            </div>
                            <button
                                onClick={() => router.push("/")}
                                className="w-full bg-gray-900 text-white py-4 rounded-2xl font-bold hover:bg-black transition-all"
                            >
                                Visit GloTrade Official
                            </button>
                        </div>
                    </div>
                ) : data && (() => {
                    const { headerBg, Icon, heading, subtext, pillClass } = getStatusConfig(data.status);
                    return (
                        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden border border-gray-100">
                            {/* Dynamic Status Header */}
                            <div className={`${headerBg} p-8 flex flex-col items-center`}>
                                <div className="bg-white/20 p-4 rounded-full mb-4">
                                    <Icon className="w-16 h-16 text-white" />
                                </div>
                                <h2 className="text-2xl font-bold text-white uppercase tracking-wider">{heading}</h2>
                                <p className="text-white/80 text-sm mt-1">{subtext}</p>
                            </div>

                            {/* Details */}
                            <div className="p-8 space-y-6">
                                <div className="grid grid-cols-1 gap-6">
                                    <div className="flex items-start gap-4">
                                        <div className="p-2 bg-gray-50 rounded-lg">
                                            <Hash className="w-5 h-5 text-gray-400" />
                                        </div>
                                        <div>
                                            <p className="text-xs text-gray-400 uppercase font-bold tracking-widest">Certificate No.</p>
                                            <p className="text-lg font-mono font-bold text-gray-800">{data.certificateNumber}</p>
                                        </div>
                                    </div>

                                    <div className="flex items-start gap-4">
                                        <div className="p-2 bg-gray-50 rounded-lg">
                                            <User className="w-5 h-5 text-gray-400" />
                                        </div>
                                        <div>
                                            <p className="text-xs text-gray-400 uppercase font-bold tracking-widest">Insured Partner</p>
                                            <p className="text-lg font-bold text-gray-900">{data.partnerName}</p>
                                        </div>
                                    </div>

                                    <div className="flex items-start gap-4">
                                        <div className="p-2 bg-gray-50 rounded-lg">
                                            <Award className="w-5 h-5 text-gray-400" />
                                        </div>
                                        <div>
                                            <p className="text-xs text-gray-400 uppercase font-bold tracking-widest">Protected Amount</p>
                                            <p className="text-lg font-bold text-green-700 font-mono">{formatCurrency(data.coverageAmount)}</p>
                                        </div>
                                    </div>

                                    <div className="border-t border-gray-50 pt-6 grid grid-cols-2 gap-4">
                                        <div>
                                            <p className="text-[10px] text-gray-400 uppercase font-bold tracking-widest mb-1">Status</p>
                                            <span className={`${pillClass} px-3 py-1 rounded-full text-xs font-bold uppercase`}>
                                                {data.status}
                                            </span>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-[10px] text-gray-400 uppercase font-bold tracking-widest mb-1">Valid Until</p>
                                            <p className="text-sm font-bold text-gray-800">{formatDate(data.expiryDate)}</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Warning for non-active statuses */}
                                {data.status !== "active" && (
                                    <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-start gap-3">
                                        <AlertTriangle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
                                        <p className="text-sm text-amber-800 font-medium">
                                            This certificate is currently <strong>{data.status}</strong>. Exercise caution before proceeding with transactions based on this document.
                                        </p>
                                    </div>
                                )}

                                {/* Verification Footer */}
                                <div className="mt-8 pt-8 border-t border-gray-100 text-center">
                                    <p className="text-[10px] text-gray-400 leading-relaxed mb-6 px-4">
                                        This verification was processed on {formatDate(data.verifiedAt)}. The information displayed is directly from GloTrade secure records.
                                    </p>
                                    <button
                                        onClick={() => router.push("/")}
                                        className="inline-flex items-center gap-2 text-blue-600 font-bold text-sm hover:text-blue-700 underline underline-offset-4"
                                    >
                                        Visit GloTrade Platform
                                        <ExternalLink className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    );
                })()}

                {/* Secure Notice */}
                <p className="mt-8 text-center text-xs text-gray-400 flex items-center justify-center gap-1">
                    <CheckCircle2 className="w-3 h-3 text-green-500" />
                    Secure Verification Endpoint - TLS Protected
                </p>
            </div>
        </div>
    );
}
