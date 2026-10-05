"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { apiGet } from "@/utils/api";
import QRCode from "qrcode";
import { ArrowLeft, Printer, ShieldCheck, Award, Calendar, MapPin, Package, Download, Globe, ScanLine } from "lucide-react";
import { translate } from "@/utils/translate";

interface CertificateData {
    tpia: {
        tpiaId: string;
        tpiaNumber: number;
        partnerName: string;
        partnerEmail: string;
        purchasePrice: number;
        commodityType: string;
        commodityQuantity: number;
        commodityUnit: string;
        purchasedAt: string;
    };
    insurance: {
        certificateNumber: string;
        provider: string;
        coverageAmount: number;
        status: string;
        effectiveDate: string;
        expiryDate: string;
        warehouseLocation: string;
    };
}

export default function InsuranceCertificatePage() {
    const router = useRouter();
    const params = useParams();
    const tpiaId = params.id as string;

    const [loading, setLoading] = useState(true);
    const [data, setData] = useState<CertificateData | null>(null);
    const [qrCodeUrl, setQrCodeUrl] = useState<string>("");
    const [error, setError] = useState("");

    useEffect(() => {
        if (tpiaId) {
            fetchCertificateData();
        }
    }, [tpiaId]);

    const fetchCertificateData = async () => {
        try {
            setLoading(true);
            const response = await apiGet<{ success: boolean; data: any }>(
                `/api/v1/gdip/tpia/${tpiaId}`
            );

            if (response.success) {
                setData({
                    tpia: response.data.tpia,
                    insurance: response.data.insurance
                });

                // Generate QR Code
                const verificationUrl = `${window.location.origin}/verify/${response.data.insurance.certificateNumber}`;
                try {
                    const qr = await QRCode.toDataURL(verificationUrl, {
                        width: 200,
                        margin: 1,
                        color: {
                            dark: "#064e3b", // green-900
                            light: "#ffffff",
                        },
                    });
                    setQrCodeUrl(qr);
                } catch (err) {
                    console.error("QR generation error:", err);
                }
            }
        } catch (err: any) {
            console.error("Error fetching certificate data:", err);
            setError(err.message || translate("gdip.certificate.error.loadFailed"));
        } finally {
            setLoading(false);
        }
    };

    const handlePrint = () => {
        window.print();
    };

    const formatCurrency = (amount: number, minimumFractionDigits = 0) => {
        return new Intl.NumberFormat("en-NG", {
            style: "currency",
            currency: "NGN",
            minimumFractionDigits,
            maximumFractionDigits: minimumFractionDigits,
        }).format(amount);
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString("en-NG", {
            year: "numeric",
            month: "short",
            day: "numeric",
        }).toUpperCase();
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
            </div>
        );
    }

    if (error || !data) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center">
                    <h2 className="text-2xl font-bold text-red-600 mb-4">{translate("gdip.certificate.error.title")}</h2>
                    <p className="text-gray-600 mb-4">{error || translate("gdip.certificate.error.notFound")}</p>
                    <button
                        onClick={() => router.back()}
                        className="bg-blue-600 text-white px-6 py-2 rounded-lg"
                    >
                        {translate("gdip.certificate.error.goBack")}
                    </button>
                </div>
            </div>
        );
    }

    const { tpia, insurance } = data;
    const assetBackingText = tpia.commodityQuantity > 0
        ? translate("gdip.certificate.content.backingValue")
        : translate("gdip.certificate.content.pendingBackingValue");

    const insuranceStatus = insurance.status;
    const isInsuranceActive = insuranceStatus === "active";

    return (
        <div className="min-h-screen bg-white">
            {/* Action Bar - Hidden during print */}
            <div className="max-w-4xl mx-auto px-4 pt-8 pb-4 flex flex-col sm:flex-row justify-between items-center gap-6 print:hidden">
                <button
                    onClick={() => router.back()}
                    className="flex items-center gap-2 text-gray-500 hover:text-gray-900 font-bold text-xs uppercase tracking-widest transition-colors group"
                >
                    <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                    {translate("gdip.certificate.backToPortfolio")}
                </button>
                <button
                    onClick={handlePrint}
                    className="w-full sm:w-auto flex items-center justify-center gap-2 bg-gray-900 text-white px-8 py-3 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-gray-800 transition-all shadow-xl shadow-gray-200 active:scale-95"
                >
                    <Printer className="w-4 h-4" />
                    {translate("gdip.certificate.printButton")}
                </button>
            </div>

            {/* Insurance Status Banner - shown when not active */}
            {!isInsuranceActive && (
                <div className={`max-w-4xl mx-auto px-4 mb-4 print:hidden`}>
                    <div className={`rounded-2xl p-4 flex items-start gap-3 border ${
                        insuranceStatus === "pending"
                            ? "bg-amber-50 border-amber-200"
                            : insuranceStatus === "expired"
                            ? "bg-gray-100 border-gray-300"
                            : "bg-red-50 border-red-200"
                    }`}>
                        <ShieldCheck className={`w-5 h-5 flex-shrink-0 mt-0.5 ${
                            insuranceStatus === "pending" ? "text-amber-500"
                            : insuranceStatus === "expired" ? "text-gray-500"
                            : "text-red-500"
                        }`} />
                        <div>
                            <p className={`text-sm font-black uppercase tracking-wide ${
                                insuranceStatus === "pending" ? "text-amber-800"
                                : insuranceStatus === "expired" ? "text-gray-700"
                                : "text-red-800"
                            }`}>
                                Insurance Status: {insuranceStatus}
                            </p>
                            <p className={`text-xs font-medium mt-0.5 ${
                                insuranceStatus === "pending" ? "text-amber-700"
                                : insuranceStatus === "expired" ? "text-gray-600"
                                : "text-red-700"
                            }`}>
                                {insuranceStatus === "pending"
                                    ? "Your insurance is being processed. This certificate will be fully active once confirmed by the underwriter."
                                    : insuranceStatus === "expired"
                                    ? "This insurance coverage has expired. Contact support for renewal."
                                    : "This insurance certificate has been cancelled or a claim has been filed. Contact support for assistance."}
                            </p>
                        </div>
                    </div>
                </div>
            )}

            {/* Certificate Container */}
            <div className="max-w-4xl mx-auto bg-white shadow-2xl overflow-hidden relative print:shadow-none print:max-w-none mb-12 border border-gray-100 sm:rounded-3xl">
                {/* Formal Document Frame Design */}
                <div className="absolute inset-0 pointer-events-none border-[12px] border-gray-50 m-2 sm:m-4 rounded-2xl"></div>
                <div className="absolute inset-0 pointer-events-none border border-gray-200 m-8 sm:m-12 rounded-xl"></div>

                {/* Corner Decorative Elements */}
                <div className="absolute top-6 left-6 w-12 h-12 border-t-4 border-l-4 border-blue-600/20 sm:block hidden"></div>
                <div className="absolute top-6 right-6 w-12 h-12 border-t-4 border-r-4 border-blue-600/20 sm:block hidden"></div>
                <div className="absolute bottom-6 left-6 w-12 h-12 border-b-4 border-l-4 border-blue-600/20 sm:block hidden"></div>
                <div className="absolute bottom-6 right-6 w-12 h-12 border-b-4 border-r-4 border-blue-600/20 sm:block hidden"></div>

                <div className="p-8 sm:p-24 space-y-12 relative z-10">
                    {/* Header */}
                    <div className="text-center space-y-6">
                        <div className="flex justify-center relative">
                            <div className="p-1 bg-white relative z-10">
                                {/* <div className="w-20 h-20 bg-blue-600 rounded-2xl flex items-center justify-center text-white shadow-2xl shadow-blue-200 transform rotate-45 group hover:rotate-90 transition-transform duration-700"> */}
                                <div className="w-20 h-20 bg-blue-600 rounded-2xl flex items-center justify-center text-white shadow-2xl shadow-blue-200 transform rotate-0 group hover:rotate-90 transition-transform duration-700">
                                    {/* <Globe size={40} className="-rotate-45" /> */}
                                    <img
                                        src="/favicon.png"
                                        alt="GloTrade Logo"
                                        className="w-16 h-16 object-contain"
                                        onError={(e) => {
                                            // Fallback if image fails
                                            (e.target as any).style.display = 'none';
                                            (e.target as any).nextSibling.style.display = 'block';
                                        }}
                                    />
                                    {/* <ShieldCheck className="w-16 h-16 text-green-700 hidden" /> */}
                                </div>
                            </div>
                            {/* Large Background Seal Decor */}
                            <div className="absolute top-1/2 left-1/2 -track-x-1/2 -track-y-1/2 opacity-[0.03] pointer-events-none">
                                <Award className="w-96 h-96 text-gray-900" />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <p className="text-[10px] font-black text-blue-600 tracking-[0.4em] uppercase">{translate("gdip.certificate.header.archiveLabel")}</p>
                            <h1 className="text-4xl sm:text-6xl font-black text-gray-900 tracking-tighter uppercase leading-none">
                                {translate("gdip.certificate.header.title")}
                            </h1>
                            <div className="flex items-center justify-center gap-4 py-4">
                                <div className="h-px w-12 bg-gray-200"></div>
                                <p className="text-xs font-black text-gray-400 tracking-[0.2em] uppercase">{translate("gdip.certificate.header.protocol")}</p>
                                <div className="h-px w-12 bg-gray-200"></div>
                            </div>
                        </div>
                    </div>

                    {/* Certificate Identification Sequence */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 py-8 border-y border-gray-100">
                        <div>
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] mb-2 leading-none">{translate("gdip.certificate.info.seqLabel")}</p>
                            <p className="text-2xl font-black text-gray-900 tracking-tighter leading-none select-all">{insurance.certificateNumber}</p>
                        </div>
                        <div className="sm:text-right">
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] mb-2 leading-none">{translate("gdip.certificate.info.dateLabel")}</p>
                            <p className="text-2xl font-black text-gray-900 tracking-tighter leading-none">{formatDate(tpia.purchasedAt)}</p>
                        </div>
                    </div>

                    {/* Partner Credential Area */}
                    <div className="space-y-10">
                        <div className="text-center">
                            <p className="text-[10px] font-black text-blue-600 tracking-[0.4em] mb-4 uppercase leading-none">{translate("gdip.certificate.partner.entityLabel")}</p>
                            <h2 className="text-4xl sm:text-5xl font-black text-gray-900 tracking-tighter uppercase leading-none mb-4">
                                {tpia.partnerName}
                            </h2>
                            <p className="text-xs font-bold text-gray-400 uppercase tracking-[0.2em]">{tpia.partnerEmail}</p>
                        </div>

                        <div className="bg-gray-50/50 p-6 sm:p-10 rounded-3xl border border-gray-100 space-y-8 relative overflow-hidden group">
                            <div className="absolute top-0 right-0 p-8 opacity-[0.02] group-hover:scale-110 group-hover:rotate-12 transition-transform pointer-events-none">
                                <ShieldCheck className="w-48 h-48 text-gray-900" />
                            </div>

                            <p className="text-gray-500 text-center font-bold uppercase tracking-tight text-sm max-w-2xl mx-auto leading-relaxed relative z-10">
                                {translate("gdip.certificate.content.confirmation", { id: tpia.tpiaId })}
                                {translate("gdip.certificate.content.backing")}
                            </p>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-4 relative z-10">
                                <div className="p-6 bg-white rounded-2xl border border-gray-100 shadow-sm space-y-4">
                                    <div className="flex items-start gap-3">
                                        <Award className="w-5 h-5 text-blue-600 mt-1" />
                                        <div>
                                            <p className="text-[9px] font-black text-gray-400 uppercase tracking-[0.2em] mb-1 leading-none">{translate("gdip.certificate.content.coverageLabel")}</p>
                                            <p className="text-xl font-black text-gray-900 tracking-tight leading-none">{formatCurrency(insurance.coverageAmount)}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-3 pt-2">
                                        <Package className="w-5 h-5 text-blue-600 mt-1" />
                                        <div>
                                            <p className="text-[9px] font-black text-gray-400 uppercase tracking-[0.2em] mb-1 leading-none">{translate("gdip.certificate.content.backingLabel")}</p>
                                            <p className="text-sm font-black text-gray-900 uppercase tracking-tight">{assetBackingText}</p>
                                        </div>
                                    </div>
                                </div>
                                <div className="p-6 bg-white rounded-2xl border border-gray-100 shadow-sm space-y-4">
                                    <div className="flex items-start gap-3">
                                        <Calendar className="w-5 h-5 text-blue-600 mt-1" />
                                        <div>
                                            <p className="text-[9px] font-black text-gray-400 uppercase tracking-[0.2em] mb-1 leading-none">{translate("gdip.certificate.content.windowLabel")}</p>
                                            <p className="text-sm font-black text-gray-900 uppercase tracking-tight">
                                                {formatDate(insurance.effectiveDate)} <span className="text-gray-300 mx-1">—</span> {formatDate(insurance.expiryDate)}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-3 pt-2">
                                        <MapPin className="w-5 h-5 text-blue-600 mt-1" />
                                        <div>
                                            <p className="text-[9px] font-black text-gray-400 uppercase tracking-[0.2em] mb-1 leading-none">{translate("gdip.certificate.content.logisticsLabel")}</p>
                                            <p className="text-sm font-black text-gray-900 uppercase tracking-tight">{insurance.warehouseLocation || translate("gdip.certificate.content.defaultHub")}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Official Endorsements */}
                    <div className="grid grid-cols-2 gap-12 pt-16">
                        <div className="text-center">
                            <div className="border-t-2 border-gray-900 pt-4 mx-auto w-full max-w-[200px]">
                                <p className="text-xs font-black text-gray-900 uppercase tracking-widest leading-none mb-2">{translate("gdip.certificate.footer.adminSignatory")}</p>
                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em]">{translate("gdip.certificate.footer.authorizedSignatory")}</p>
                            </div>
                        </div>
                        <div className="text-center">
                            <div className="border-t-2 border-gray-900 pt-4 mx-auto w-full max-w-[200px]">
                                <p className="text-xs font-black text-gray-900 uppercase tracking-widest leading-none mb-2 truncate">{(translate("gdip.details.insurance.providers." + insurance.provider) || insurance.provider).toUpperCase()}</p>
                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em]">{translate("gdip.certificate.footer.leadUnderwriter")}</p>
                            </div>
                        </div>
                    </div>

                    {/* Footer Archive Notice */}
                    <div className="flex flex-col md:flex-row items-center justify-between gap-10 pt-10 border-t border-gray-100">
                        <div className="flex-1 space-y-3 text-center md:text-left">
                            <p className="text-blue-600 text-[9px] font-black uppercase tracking-[0.3em] leading-none">{translate("gdip.certificate.footer.noticeTitle")}</p>
                            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest leading-relaxed max-w-md">
                                {translate("gdip.certificate.footer.noticeText")}
                                {translate("gdip.certificate.footer.protectionText", { amount: formatCurrency(1000000) })}
                            </p>
                            <div className="flex justify-center md:justify-start pt-2 opacity-10">
                                <div className="w-20 h-20 border-4 border-gray-900 rounded-full flex items-center justify-center font-black text-gray-900 text-2xl transform -rotate-12">
                                    GDIP
                                </div>
                            </div>
                        </div>

                        {qrCodeUrl && (
                            <div className="flex flex-col items-center gap-3 p-4 bg-gray-50 border border-gray-100 rounded-2xl group hover:bg-white transition-all shadow-sm">
                                <img src={qrCodeUrl} alt="Verification QR Code" className="w-24 h-24 grayscale group-hover:grayscale-0 transition-all" />
                                <div className="flex items-center gap-2 text-[9px] font-black text-gray-900 uppercase tracking-[0.2em]">
                                    <ScanLine className="w-3 h-3 text-blue-600" />
                                    {translate("gdip.certificate.footer.verificationLabel")}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Print Intelligence Notice - Hidden during print */}
            <div className="max-w-4xl mx-auto mt-4 mb-16 text-center print:hidden">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.4em] leading-none mb-4">
                    {translate("gdip.certificate.footer.endOfDocument")}
                </p>
                <div className="flex items-center justify-center gap-2 text-blue-600 font-black text-[9px] uppercase tracking-widest">
                    <ShieldCheck size={12} /> {translate("gdip.certificate.footer.encrypted")}
                </div>
            </div>
        </div>
    );
}
