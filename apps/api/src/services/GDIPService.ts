import TPIA from "../models/TPIA";
import GDC from "../models/GDC";
import TradeCycle from "../models/TradeCycle";
import Insurance from "../models/Insurance";
import Commodity from "../models/Commodity";
import Wallet from "../models/Wallet";
import WalletTransaction from "../models/WalletTransaction";
import User from "../models/User";
import CommodityType from "../models/CommodityType";
import { Schema } from "mongoose";
import TradeCycleService from "./TradeCycleService";

type PurchaseBulkOptions = {
    skipWalletDebit?: boolean;
    createdBy?: Schema.Types.ObjectId;
    purchaseSource?: "wallet" | "manual_bank_deposit";
    manualPayment?: {
        amountReceived: number;
        bankReference: string;
        depositedAt: Date;
        recordedBy?: Schema.Types.ObjectId;
        note?: string;
    };
    notes?: string;
};

/**
 * GDIPService - Manages GDIP (Glotrade Distribution/Trusted Insured Partners) Platform
 * Handles TPIA creation, GDC management, and trade cycle orchestration
 */
export class GDIPService {

    /**
     * Get next available GDC number (increments by 10)
     */
    private static async getNextGDCNumber(): Promise<number> {
        const lastGDC = await GDC.findOne().sort({ gdcNumber: -1 }).limit(1);
        return lastGDC ? lastGDC.gdcNumber + 10 : 10;
    }

    /**
     * Get next available cycle number for a GDC
     */
    private static async getNextCycleNumber(gdcId: Schema.Types.ObjectId): Promise<number> {
        const lastCycle = await TradeCycle.findOne({ gdcId }).sort({ cycleNumber: -1 }).limit(1);
        return lastCycle ? lastCycle.cycleNumber + 1 : 1;
    }

    /**
     * Find or create an available GDC for new TPIA assignment
     */
    private static async findOrCreateAvailableGDC(): Promise<any> {
        // Look for ANY GDC that's not full, regardless of commodity type
        // Strict sequential filling: Sort by gdcNumber ASC to fill oldest first
        let gdc = await GDC.findOne({
            isFull: false,
            status: "forming"
        }).sort({ gdcNumber: 1 });

        // If no available GDC, create a new one
        if (!gdc) {
            const gdcNumber = await this.getNextGDCNumber();
            gdc = await GDC.create({
                gdcNumber,
                primaryCommodity: "Mixed", // GDC holds mixed commodities until Cycle determines trade
                capacity: 10,
                currentFill: 0,
                isFull: false,
                status: "forming",
                totalCapital: 0,
                totalProfitGenerated: 0,
                averageROI: 0,
                tpiaIds: [],
                tpiaNumbers: [],
                isActive: true
            });
        }

        return gdc;
    }

    /**
     * Resolve the commodity allocation chosen by the platform.
     * Partners and assisted-purchase managers do not choose this at purchase time.
     */
    private static async getPlatformAssignedCommodityType(): Promise<string> {
        const types = await this.getCommodityTypes();
        const firstActiveType = types[0];
        return firstActiveType?.name || "Mixed";
    }

    /**
     * Bulk purchase TPIA blocks
     * @param partnerId - User ID of the partner
     * @param commodityType - Type of commodity. Optional for compatibility; new purchases are assigned by the platform when omitted.
     * @param profitMode - TPM or EPS
     * @param quantity - Number of TPIAs to purchase (1-10)
     */
    static async purchaseBulk(
        partnerId: Schema.Types.ObjectId,
        commodityType?: string,
        profitMode: "TPM" | "EPS" = "TPM",
        quantity: number = 1,
        options: PurchaseBulkOptions = {}
    ): Promise<any[]> {
        if (quantity < 1 || quantity > 10) {
            throw new Error("Quantity must be between 1 and 10");
        }

        const unitPrice = 1000000;
        const totalPrice = unitPrice * quantity;

        // Get partner details
        const partner = await User.findById(partnerId);
        if (!partner) {
            throw new Error("Partner not found");
        }

        // Check 1: Account status
        if (partner.isBlocked) {
            throw new Error("Account is suspended. Please contact support.");
        }

        // Check 2: KYC / Verification status for self-service purchases
        if (!options.skipWalletDebit && !partner.isVerified && partner.kycStatus !== "verified") {
            throw new Error("KYC verification required for GDIP access. Please complete verification before purchasing TPIAs.");
        }

        // Verify partner has sufficient funds for normal app purchases.
        // Assisted bank-deposit purchases are verified by the manager-provided bank reference instead.
        const wallet = options.skipWalletDebit ? null : await Wallet.findOne({ userId: partnerId });
        if (!options.skipWalletDebit && (!wallet || wallet.balance < totalPrice)) {
            throw new Error(`Insufficient wallet balance. Required: ${totalPrice.toLocaleString()}`);
        }

        const purchasedTPIAs = [];
        const purchasedAt = new Date();
        const assignedCommodityType = commodityType || await this.getPlatformAssignedCommodityType();

        try {
            // We process them one by one to ensure they fill GDCs correctly
            // but we deduct the total amount once or keep track of balance
            for (let i = 0; i < quantity; i++) {
                // Re-fetch GDC each time to ensure we fill sequentially
                const gdc = await this.findOrCreateAvailableGDC();

                //TPIA numbers are now derived formulaically from the GDC cluster number and the slot position ((gdcNumber - 10) + slotPosition).
                // Formulaic numbering: (GDC-10 starting at 1, GDC-20 starting at 11, etc.)
                const tpiaNumber = (gdc.gdcNumber - 10) + (gdc.currentFill + 1);
                const positionInGDC = gdc.currentFill + 1;

                const tpia = await TPIA.create({
                    tpiaNumber,
                    partnerId,
                    partnerName: partner.businessInfo?.companyName || `${partner.firstName} ${partner.lastName}`,
                    partnerEmail: partner.email,
                    gdcId: gdc._id,
                    gdcNumber: gdc.gdcNumber,
                    positionInGDC,
                    purchasePrice: unitPrice,
                    currentValue: unitPrice,
                    totalProfitEarned: 0,
                    compoundedValue: 0,
                    cyclesCompleted: 0,
                    profitMode,
                    insuranceCoverageAmount: unitPrice,
                    insuranceStatus: "pending",
                    commodityType: assignedCommodityType,
                    commodityQuantity: 0,
                    commodityUnit: "bags",
                    status: "pending",
                    purchaseSource: options.purchaseSource || "wallet",
                    manualPayment: options.manualPayment ? {
                        amountReceived: unitPrice,
                        bankReference: options.manualPayment.bankReference,
                        depositedAt: options.manualPayment.depositedAt,
                        recordedBy: options.manualPayment.recordedBy,
                        recordedAt: purchasedAt,
                        note: options.manualPayment.note
                    } : undefined,
                    purchasedAt,
                    createdBy: options.createdBy,
                    notes: options.notes,
                    documents: {}
                });

                // Update GDC
                gdc.tpiaIds.push(tpia._id);
                gdc.tpiaNumbers.push(tpiaNumber);
                gdc.currentFill += 1;
                gdc.totalCapital += unitPrice;

                if (gdc.currentFill === 10) {
                    gdc.isFull = true;
                    gdc.status = "ready";
                    gdc.formedAt = new Date();
                    gdc.nextCycleStartDate = new Date(Date.now() + 37 * 24 * 60 * 60 * 1000);
                }

                // Save GDC state first to ensure checking logic in createTradeCycle passes
                await gdc.save();

                if (gdc.currentFill === 10) {
                    // Auto-activate all TPIAs in this GDC
                    await TPIA.updateMany(
                        { gdcId: gdc._id },
                        {
                            $set: {
                                status: "active",
                                activatedAt: new Date(),
                                insuranceStatus: "active"
                            }
                        }
                    );

                    // Auto-activate all Insurance records in this GDC
                    await Insurance.updateMany(
                        { tpiaId: { $in: gdc.tpiaIds } },
                        { $set: { status: "active" } }
                    );

                    // Auto-create the first trade cycle for this GDC
                    // This enables progress visualization immediately
                    await TradeCycleService.createTradeCycle(
                        gdc._id,
                        assignedCommodityType,
                        1000, // Default quantity
                        gdc.totalCapital,
                        new Date() // Start immediately
                    );
                }

                // Create insurance record
                await Insurance.create({
                    certificateNumber: tpia.insuranceCertificateNumber,
                    tpiaId: tpia._id,
                    tpiaNumber,
                    provider: "Default Insurance Provider",
                    policyType: "capital_protection",
                    coverageAmount: unitPrice,
                    deductible: 0,
                    premium: unitPrice * 0.02,
                    issueDate: new Date(),
                    effectiveDate: new Date(),
                    expiryDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
                    status: "pending",
                    partnerId,
                    partnerName: tpia.partnerName
                });

                purchasedTPIAs.push(tpia);
            }

            const bulkRef = `BULK-TPIA-${Date.now()}`;

            if (wallet) {
                // Deduct total from wallet
                wallet.balance -= totalPrice;
                wallet.totalSpent += totalPrice;
                await wallet.save();

                // Create one bulk wallet transaction
                await WalletTransaction.create({
                    walletId: wallet._id,
                    userId: partnerId,
                    type: "payment",
                    category: "order_payment",
                    amount: totalPrice,
                    currency: "NGN",
                    balanceBefore: wallet.balance + totalPrice,
                    balanceAfter: wallet.balance,
                    status: "completed",
                    reference: bulkRef,
                    description: `Bulk purchase of ${quantity} TPIA blocks`,
                    metadata: {
                        quantity,
                        unitPrice,
                        tpiaIds: purchasedTPIAs.map(t => t._id.toString()),
                        idempotencyKey: bulkRef
                    },
                    processedAt: new Date()
                });
            }
        } catch (error: any) {
            // Clean up any partially created TPIAs and Insurance policies from this failed purchase
            if (purchasedTPIAs.length > 0) {
                const purchasedIds = purchasedTPIAs.map(t => t._id);
                try {
                    await TPIA.deleteMany({ _id: { $in: purchasedIds } });
                    await Insurance.deleteMany({ tpiaId: { $in: purchasedIds } });
                    for (const t of purchasedTPIAs) {
                        await GDC.updateOne(
                            { _id: t.gdcId },
                            {
                                $pull: { tpiaIds: t._id, tpiaNumbers: t.tpiaNumber },
                                $inc: { currentFill: -1, totalCapital: -unitPrice },
                                $set: { isFull: false, status: "forming" }
                            }
                        );
                    }
                } catch (cleanupError) {
                    console.error("Error during purchase rollback:", cleanupError);
                }
            }
            throw error;
        }

        return purchasedTPIAs;
    }

    static async createManualPurchase(
        partnerId: Schema.Types.ObjectId,
        profitMode: "TPM" | "EPS",
        quantity: number,
        amountReceived: number,
        bankReference: string,
        depositedAt: Date,
        managerId: Schema.Types.ObjectId,
        note?: string
    ): Promise<any[]> {
        const unitPrice = 1000000;
        const totalPrice = unitPrice * quantity;
        const cleanReference = bankReference.trim();

        if (!cleanReference) {
            throw new Error("Bank deposit reference is required");
        }

        if (amountReceived !== totalPrice) {
            throw new Error(`Amount received must match the TPIA total of ${totalPrice.toLocaleString()}`);
        }

        const existingReference = await TPIA.findOne({
            purchaseSource: "manual_bank_deposit",
            "manualPayment.bankReference": cleanReference
        }).select("_id tpiaId");

        if (existingReference) {
            throw new Error("This bank deposit reference has already been used for a manual TPIA purchase");
        }

        return this.purchaseBulk(partnerId, undefined, profitMode, quantity, {
            skipWalletDebit: true,
            createdBy: managerId,
            purchaseSource: "manual_bank_deposit",
            manualPayment: {
                amountReceived,
                bankReference: cleanReference,
                depositedAt,
                recordedBy: managerId,
                note
            },
            notes: note
                ? `Manual bank deposit purchase. Reference: ${cleanReference}. ${note}`
                : `Manual bank deposit purchase. Reference: ${cleanReference}.`
        });
    }

    static async previewNextAssignments(quantity: number = 1): Promise<any[]> {
        if (quantity < 1 || quantity > 10) {
            throw new Error("Quantity must be between 1 and 10");
        }

        const assignments = [];
        const formingGDC = await GDC.findOne({
            isFull: false,
            status: "forming"
        }).sort({ gdcNumber: 1 });
        const lastGDC = formingGDC ? null : await GDC.findOne().sort({ gdcNumber: -1 }).limit(1);

        let gdcNumber = formingGDC ? formingGDC.gdcNumber : lastGDC ? lastGDC.gdcNumber + 10 : 10;
        let currentFill = formingGDC ? formingGDC.currentFill : 0;
        const capacity = formingGDC ? formingGDC.capacity : 10;

        for (let i = 0; i < quantity; i++) {
            if (currentFill >= capacity) {
                gdcNumber += 10;
                currentFill = 0;
            }

            const positionInGDC = currentFill + 1;
            assignments.push({
                gdcNumber,
                positionInGDC,
                tpiaNumber: (gdcNumber - 10) + positionInGDC
            });
            currentFill += 1;
        }

        return assignments;
    }

    static async updateManualPaymentDetails(
        tpiaId: Schema.Types.ObjectId,
        updates: {
            bankReference: string;
            depositedAt: Date;
            note?: string;
        },
        managerId: Schema.Types.ObjectId,
        reason: string
    ): Promise<any> {
        const cleanReference = updates.bankReference.trim();
        const cleanReason = reason.trim();
        const cleanNote = updates.note?.trim();

        if (!cleanReference) {
            throw new Error("Bank deposit reference is required");
        }

        if (!cleanReason) {
            throw new Error("Correction reason is required");
        }

        if (Number.isNaN(updates.depositedAt.getTime())) {
            throw new Error("Valid deposit date is required");
        }

        const tpia = await TPIA.findById(tpiaId);
        if (!tpia) {
            throw new Error("TPIA not found");
        }

        if (tpia.purchaseSource !== "manual_bank_deposit" || !tpia.manualPayment) {
            throw new Error("Only manual bank deposit TPIAs can be corrected here");
        }

        if (tpia.status !== "pending" || tpia.currentCycleId) {
            throw new Error("Manual payment details can only be corrected before the TPIA cycle starts");
        }

        const gdc = await GDC.findById(tpia.gdcId).select("status");
        if (!gdc || gdc.status !== "forming") {
            throw new Error("Manual payment details can only be corrected while the GDC is still forming");
        }

        const existingReference = await TPIA.findOne({
            _id: { $ne: tpia._id },
            purchaseSource: "manual_bank_deposit",
            "manualPayment.bankReference": cleanReference
        }).select("_id tpiaId");

        if (existingReference) {
            throw new Error("This bank deposit reference has already been used for another manual TPIA purchase");
        }

        const previous = {
            bankReference: tpia.manualPayment.bankReference,
            depositedAt: tpia.manualPayment.depositedAt,
            note: tpia.manualPayment.note
        };
        const next = {
            bankReference: cleanReference,
            depositedAt: updates.depositedAt,
            note: cleanNote
        };

        tpia.manualPayment.bankReference = cleanReference;
        tpia.manualPayment.depositedAt = updates.depositedAt;
        tpia.manualPayment.note = cleanNote;
        tpia.notes = cleanNote
            ? `Manual bank deposit purchase. Reference: ${cleanReference}. ${cleanNote}`
            : `Manual bank deposit purchase. Reference: ${cleanReference}.`;
        tpia.manualPaymentCorrections = [
            ...((tpia.manualPaymentCorrections as any[]) || []),
            {
                correctedBy: managerId,
                correctedAt: new Date(),
                reason: cleanReason,
                previous,
                next
            }
        ] as any;

        await tpia.save();
        return tpia;
    }

    static async voidManualPurchase(
        tpiaId: Schema.Types.ObjectId,
        managerId: Schema.Types.ObjectId,
        reason: string
    ): Promise<any> {
        const cleanReason = reason.trim();

        if (!cleanReason) {
            throw new Error("Void reason is required");
        }

        const tpia = await TPIA.findById(tpiaId);
        if (!tpia) {
            throw new Error("TPIA not found");
        }

        if (tpia.purchaseSource !== "manual_bank_deposit") {
            throw new Error("Only manual bank deposit TPIAs can be voided here");
        }

        if (tpia.status !== "pending" || tpia.currentCycleId) {
            throw new Error("Only pending TPIAs without a cycle can be voided");
        }

        const gdc = await GDC.findById(tpia.gdcId);
        if (!gdc) {
            throw new Error("Assigned GDC not found");
        }

        if (gdc.status !== "forming" || gdc.currentCycleId) {
            throw new Error("TPIAs can only be voided while the GDC is still forming");
        }

        if (tpia.positionInGDC !== gdc.currentFill) {
            throw new Error("Only the latest slot in a forming GDC can be voided safely. Contact a super admin for deeper corrections.");
        }

        gdc.tpiaIds = gdc.tpiaIds.filter((id: any) => id.toString() !== tpia._id.toString()) as any;
        gdc.tpiaNumbers = gdc.tpiaNumbers.filter((number: number) => number !== tpia.tpiaNumber);
        gdc.currentFill = Math.max((gdc.currentFill || 0) - 1, 0);
        gdc.totalCapital = Math.max((gdc.totalCapital || 0) - (tpia.purchasePrice || 0), 0);
        gdc.isFull = false;
        gdc.status = "forming";
        gdc.formedAt = undefined;
        gdc.nextCycleStartDate = undefined;
        await gdc.save();

        const originalTpiaNumber = tpia.tpiaNumber;
        const originalTpiaId = tpia.tpiaId;
        const voidedAt = new Date();
        const voidedUniqueNumber = -((voidedAt.getTime() * 1000) + Math.abs(originalTpiaNumber % 1000));
        tpia.status = "voided";
        tpia.originalTpiaNumber = originalTpiaNumber;
        tpia.originalTpiaId = originalTpiaId;
        tpia.tpiaNumber = voidedUniqueNumber;
        tpia.tpiaId = `VOIDED-${originalTpiaId}-${voidedAt.getTime()}`;
        tpia.voidedAt = voidedAt;
        tpia.voidedBy = managerId;
        tpia.voidReason = cleanReason;
        tpia.notes = `${tpia.notes ? `${tpia.notes}\n` : ""}VOIDED: ${cleanReason}`;
        await tpia.save();

        await Insurance.updateOne(
            { tpiaId: tpia._id },
            {
                $set: {
                    status: "cancelled",
                    notes: `Voided manual TPIA purchase: ${cleanReason}`
                }
            }
        );

        return tpia;
    }

    /**
     * Purchase a new TPIA block (deprecated in favor of bulk, but kept for compatibility)
     */
    static async purchaseTPIA(
        partnerId: Schema.Types.ObjectId,
        commodityType?: string,
        profitMode: "TPM" | "EPS" = "TPM",
        purchasePrice: number = 1000000
    ): Promise<any> {
        const results = await this.purchaseBulk(partnerId, commodityType, profitMode, 1);
        return results[0];
    }

    /**
     * Get partner's TPIAs
     */
    static async getPartnerTPIAs(partnerId: Schema.Types.ObjectId): Promise<any[]> {
        const tpias = await TPIA.find({ partnerId, status: { $ne: "voided" } }).populate("currentCycleId").sort({ tpiaNumber: 1 });
        const gdcIds = [...new Set(tpias.map(tpia => tpia.gdcId?.toString()).filter(Boolean))];
        const gdcs = await GDC.find({ _id: { $in: gdcIds } }).select("_id currentFill capacity status");
        const gdcById = new Map(gdcs.map(gdc => [gdc._id.toString(), gdc]));

        // Calculate estimated accrued profit for each TPIA (same logic as portfolio)
        const tpiasWithEstimates = tpias.map(tpia => {
            let estimatedProfit = 0;
            const gdc = tpia.gdcId ? gdcById.get(tpia.gdcId.toString()) : null;

            if (tpia.currentCycleId && typeof tpia.currentCycleId === 'object') {
                const cycle = tpia.currentCycleId as any;
                if (cycle.status === "active" && cycle.startDate && cycle.endDate && cycle.targetProfitRate) {
                    const start = new Date(cycle.startDate).getTime();
                    const end = new Date(cycle.endDate).getTime();
                    const now = Date.now();

                    if (now > start && now < end) {
                        const progress = (now - start) / (end - start);
                        const totalTarget = (cycle.targetProfitRate / 100) * tpia.purchasePrice;
                        estimatedProfit = totalTarget * progress;
                    } else if (now >= end) {
                        // Cycle ended but not completed yet, show full target
                        estimatedProfit = (cycle.targetProfitRate / 100) * tpia.purchasePrice;
                    }
                }
            }

            return {
                ...tpia.toObject(),
                estimatedProfit,
                gdcFill: gdc ? {
                    currentFill: gdc.currentFill,
                    capacity: gdc.capacity,
                    slotsRemaining: Math.max(gdc.capacity - gdc.currentFill, 0),
                    status: gdc.status
                } : undefined
            };
        });

        return tpiasWithEstimates;
    }

    /**
     * Get TPIA details with related data
     */
    static async getTPIADetails(tpiaId: Schema.Types.ObjectId) {
        const tpia = await TPIA.findById(tpiaId);
        if (!tpia) {
            throw new Error("TPIA not found");
        }

        const [gdc, insurance, currentCycle] = await Promise.all([
            GDC.findById(tpia.gdcId),
            Insurance.findOne({ tpiaId }),
            tpia.currentCycleId ? TradeCycle.findById(tpia.currentCycleId) : null
        ]);

        // Calculate estimated profit
        let estimatedProfit = 0;
        if (currentCycle && currentCycle.status === "active" && currentCycle.startDate && currentCycle.endDate && currentCycle.targetProfitRate) {
            const start = new Date(currentCycle.startDate).getTime();
            const end = new Date(currentCycle.endDate).getTime();
            const now = Date.now();

            if (now > start && now < end) {
                const progress = (now - start) / (end - start);
                const totalTarget = (currentCycle.targetProfitRate / 100) * tpia.purchasePrice;
                estimatedProfit = totalTarget * progress;
            } else if (now >= end) {
                estimatedProfit = (currentCycle.targetProfitRate / 100) * tpia.purchasePrice;
            }
        }

        const tpiaObj = tpia.toObject();
        (tpiaObj as any).estimatedProfit = estimatedProfit;

        return {
            tpia: tpiaObj,
            gdc,
            insurance,
            currentCycle
        };
    }

    /**
     * Get GDC details with all TPIAs
     */
    static async getGDCDetails(gdcId: Schema.Types.ObjectId) {
        const gdc = await GDC.findById(gdcId);
        if (!gdc) {
            throw new Error("GDC not found");
        }

        const [tpias, cycles] = await Promise.all([
            TPIA.find({ gdcId, status: { $ne: "voided" } }).sort({ positionInGDC: 1 }),
            TradeCycle.find({ gdcId }).sort({ cycleNumber: -1 }).limit(10)
        ]);

        // Calculate estimated profit only from an active cycle. Scheduled cycles are not accruing yet.
        const activeCycle = cycles.find((c: any) => c.status === "active");
        let estimatedProfit = 0;

        if (activeCycle && activeCycle.startDate && activeCycle.endDate && activeCycle.targetProfitRate) {
            const start = new Date(activeCycle.startDate).getTime();
            const end = new Date(activeCycle.endDate).getTime();
            const now = Date.now();

            if (now > start && now < end) {
                const progress = (now - start) / (end - start);
                const totalTarget = (activeCycle.targetProfitRate / 100) * gdc.totalCapital;
                estimatedProfit = totalTarget * progress;
            } else if (now >= end) {
                estimatedProfit = (activeCycle.targetProfitRate / 100) * gdc.totalCapital;
            }
        }

        const gdcObj = gdc.toObject();
        gdcObj.totalProfitGenerated = (gdc.totalProfitGenerated || 0) + estimatedProfit;

        return {
            gdc: gdcObj,
            tpias,
            recentCycles: cycles
        };
    }

    /**
     * Switch TPIA profit mode (TPM <-> EPS)
     */
    static async switchProfitMode(
        tpiaId: Schema.Types.ObjectId,
        newMode: "TPM" | "EPS"
    ): Promise<any> {
        const tpia = await TPIA.findById(tpiaId);
        if (!tpia) {
            throw new Error("TPIA not found");
        }

        tpia.profitMode = newMode;
        await tpia.save();

        return tpia;
    }

    /**
     * Get partner's portfolio summary
     */
    static async getPartnerPortfolio(partnerId: Schema.Types.ObjectId) {
        const tpias = await TPIA.find({ partnerId, status: { $ne: "voided" } }).populate("currentCycleId");
        const gdcIds = [...new Set(tpias.map(t => t.gdcId?.toString()).filter(Boolean))];
        const gdcs = await GDC.find({ _id: { $in: gdcIds } })
            .select('_id currentFill capacity status gdcNumber')
            .lean();
        const gdcById = new Map(gdcs.map(gdc => [gdc._id.toString(), gdc]));

        // Calculate estimated accrued profit for each TPIA
        let totalEstimatedProfit = 0;
        const tpiasWithEstimates = tpias.map(tpia => {
            let estimatedProfit = 0;
            const gdc = gdcById.get(tpia.gdcId?.toString());

            if (tpia.currentCycleId && typeof tpia.currentCycleId === 'object') {
                const cycle = tpia.currentCycleId as any;
                if (cycle.status === 'active' && cycle.startDate && cycle.endDate && cycle.targetProfitRate) {
                    const start = new Date(cycle.startDate).getTime();
                    const end = new Date(cycle.endDate).getTime();
                    const now = Date.now();

                    if (now > start && now < end) {
                        const progress = (now - start) / (end - start);
                        const totalTarget = (cycle.targetProfitRate / 100) * tpia.purchasePrice;
                        estimatedProfit = totalTarget * progress;
                    } else if (now >= end) {
                        // Cycle ended but not completed yet, show full target
                        estimatedProfit = (cycle.targetProfitRate / 100) * tpia.purchasePrice;
                    }
                }
            }

            totalEstimatedProfit += estimatedProfit;
            return {
                ...tpia.toObject(),
                estimatedProfit,
                gdcFill: gdc ? {
                    currentFill: gdc.currentFill,
                    capacity: gdc.capacity,
                    slotsRemaining: Math.max(0, gdc.capacity - gdc.currentFill),
                    status: gdc.status,
                } : undefined,
            };
        });

        const summary = {
            totalTPIAs: tpias.length,
            totalInvested: tpias.reduce((sum, t) => sum + t.purchasePrice, 0),
            currentValue: tpias.reduce((sum, t) => sum + t.currentValue, 0) + totalEstimatedProfit,
            totalProfitEarned: tpias.reduce((sum, t) => sum + t.totalProfitEarned, 0) + totalEstimatedProfit,
            estimatedAccruedProfit: totalEstimatedProfit,
            activeCycles: tpias.filter(t => {
                const cycle = t.currentCycleId as any;
                return cycle && typeof cycle === 'object' && cycle.status === 'active';
            }).length,
            tpiasByStatus: {
                pending: tpias.filter(t => t.status === "pending").length,
                active: tpias.filter(t => t.status === "active").length,
                matured: tpias.filter(t => t.status === "matured").length,
                suspended: tpias.filter(t => t.status === "suspended").length
            },
            tpiasByMode: {
                TPM: tpias.filter(t => t.profitMode === "TPM").length,
                EPS: tpias.filter(t => t.profitMode === "EPS").length
            },
            gdcs: [...new Set(tpias.map(t => t.gdcNumber))].length
        };

        return {
            summary,
            tpias: tpiasWithEstimates
        };
    }

    /**
     * Get the current GDC in formation (for status visualization)
     */
    static async getFormingGDC(): Promise<any> {
        const GDC = require("../models/GDC").default;
        return await GDC.findOne({
            status: "forming",
            isFull: false
        }).sort({ gdcNumber: 1 });
    }

    /**
     * Get all active commodity types
     */
    static async getCommodityTypes(): Promise<any[]> {
        let types = await CommodityType.find({ isActive: true }).sort({ createdAt: 1, name: 1 });

        // Auto-seed if empty
        if (types.length === 0) {
            await this.seedCommodityTypes();
            types = await CommodityType.find({ isActive: true }).sort({ createdAt: 1, name: 1 });
        }

        return types;
    }

    /**
     * Seed initial commodity types
     */
    private static async seedCommodityTypes(): Promise<void> {
        const initialTypes = [
            { name: "Rice", label: "Rice", icon: "🌾" },
            { name: "Sugar", label: "Sugar", icon: "🍬" },
            { name: "Wheat", label: "Wheat", icon: "🌾" },
            { name: "Corn", label: "Corn", icon: "🌽" },
            { name: "Soybeans", label: "Soybeans", icon: "🫘" },
        ];

        for (const type of initialTypes) {
            await CommodityType.findOneAndUpdate(
                { name: type.name },
                { $set: type },
                { upsert: true, new: true }
            );
        }
    }

    /**
     * Create a new commodity type
     */
    static async createCommodityType(data: any): Promise<any> {
        return await CommodityType.create(data);
    }

    /**
     * Update an existing commodity type
     */
    static async updateCommodityType(id: string, data: any): Promise<any> {
        return await CommodityType.findByIdAndUpdate(
            id,
            { $set: data },
            { new: true, runValidators: true }
        );
    }

    /**
     * Delete a commodity type (or deactivate it)
     */
    static async deleteCommodityType(id: string): Promise<any> {
        return await CommodityType.findByIdAndDelete(id);
    }
}

export default GDIPService;
