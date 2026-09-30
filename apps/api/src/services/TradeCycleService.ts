import { Schema } from "mongoose";
import TradeCycle, { ITradeCycle } from "../models/TradeCycle";
import TPIA from "../models/TPIA";
import GDC from "../models/GDC";
import Wallet from "../models/Wallet";
import WalletTransaction from "../models/WalletTransaction";

/**
 * TradeCycleService - Manages 37-day commodity trading cycles
 * Handles cycle creation, execution, profit calculation, and distribution
 */
export class TradeCycleService {
    /**
     * Create a new trade cycle for a GDC
     */
    static async createTradeCycle(
        gdcId: any,
        commodityType: string,
        commodityQuantity: number,
        purchasePrice: number,
        startDate?: Date
    ): Promise<ITradeCycle> {
        const gdc = await GDC.findById(gdcId);
        if (!gdc) {
            throw new Error("GDC not found");
        }

        if (!gdc.isFull) {
            throw new Error("GDC must be full before starting a trade cycle");
        }

        // Get all TPIAs in this GDC
        const tpias = await TPIA.find({ gdcId }).sort({ positionInGDC: 1 });
        if (tpias.length === 0) {
            throw new Error("No TPIAs found in GDC");
        }

        // Calculate cycle number
        const lastCycle = await TradeCycle.findOne({ gdcId }).sort({ cycleNumber: -1 });
        const cycleNumber = lastCycle ? lastCycle.cycleNumber + 1 : 1;

        // Set start date (default to now)
        const cycleStartDate = startDate || new Date();

        // Calculate end date (37 days from start)
        const cycleEndDate = new Date(cycleStartDate);
        cycleEndDate.setDate(cycleEndDate.getDate() + 37);

        // Calculate total capital
        const totalCapital = tpias.reduce((sum, tpia) => sum + tpia.currentValue, 0);

        // Create trade cycle
        const cycle = await TradeCycle.create({
            cycleId: `GDC${gdc.gdcNumber}-C${cycleNumber}`,
            cycleNumber,
            gdcId,
            gdcNumber: gdc.gdcNumber,
            tpiaIds: tpias.map(t => t._id),
            tpiaCount: tpias.length,
            startDate: cycleStartDate,
            endDate: cycleEndDate,
            duration: 37,
            status: "scheduled",
            totalCapital,
            targetProfitRate: 5, // 5% target
            actualProfitRate: 0,
            totalProfitGenerated: 0,
            commodityType,
            commodityQuantity,
            purchasePrice,
            tradingCosts: 0,
            profitDistributed: false,
            distributionDetails: [],
            roi: 0,
            insuranceClaimed: false,
            riskEvents: [],
            autoExecuted: false
        });

        // Update GDC
        gdc.currentCycleId = cycle._id as any;
        gdc.status = "active";
        gdc.nextCycleStartDate = cycleEndDate; // Next cycle starts when this one ends
        await gdc.save();

        // Update all TPIAs
        await TPIA.updateMany(
            { gdcId },
            {
                $set: {
                    currentCycleId: cycle._id,
                    nextCycleStartDate: cycleEndDate,
                    status: "active"
                }
            }
        );

        return cycle;
    }

    /**
     * Start a trade cycle (mark as active)
     */
    static async startCycle(cycleId: any): Promise<ITradeCycle> {
        const cycle = await TradeCycle.findById(cycleId);
        if (!cycle) {
            throw new Error("Trade cycle not found");
        }

        if (cycle.status !== "scheduled") {
            throw new Error(`Cannot start cycle with status: ${cycle.status}`);
        }

        cycle.status = "active";
        cycle.startDate = new Date();

        // Recalculate end date based on actual start
        const endDate = new Date(cycle.startDate);
        endDate.setDate(endDate.getDate() + cycle.duration);
        cycle.endDate = endDate;

        await cycle.save();

        return cycle;
    }

    /**
     * Complete a trade cycle with profit/loss results
     */
    static async completeCycle(
        cycleId: any,
        salePrice: number,
        tradingCosts: number = 0
    ): Promise<ITradeCycle> {
        const cycle = await TradeCycle.findById(cycleId);
        if (!cycle) {
            throw new Error("Trade cycle not found");
        }

        if (cycle.status !== "active") {
            throw new Error(`Cannot complete cycle with status: ${cycle.status}`);
        }

        // Calculate profit
        const totalRevenue = salePrice;
        const totalCosts = cycle.purchasePrice + tradingCosts;
        const totalProfit = totalRevenue - totalCosts;

        // Update cycle
        cycle.salePrice = salePrice;
        cycle.tradingCosts = tradingCosts;
        cycle.totalProfitGenerated = totalProfit;
        cycle.actualProfitRate = (totalProfit / cycle.totalCapital) * 100;
        cycle.roi = cycle.actualProfitRate;
        cycle.status = "processing";

        // Calculate actual duration
        const actualDuration = Math.ceil(
            (new Date().getTime() - cycle.startDate.getTime()) / (1000 * 60 * 60 * 24)
        );
        cycle.actualDuration = actualDuration;

        // Determine performance rating
        if (cycle.actualProfitRate >= 5) {
            cycle.performanceRating = "excellent";
        } else if (cycle.actualProfitRate >= 3) {
            cycle.performanceRating = "good";
        } else if (cycle.actualProfitRate >= 1) {
            cycle.performanceRating = "average";
        } else {
            cycle.performanceRating = "poor";
        }

        await cycle.save();

        return cycle;
    }

    /**
     * Distribute profits to TPIA holders
     */
    static async distributeProfits(cycleId: any): Promise<void> {
        const cycle = await TradeCycle.findById(cycleId);
        if (!cycle) {
            throw new Error("Trade cycle not found");
        }

        if (cycle.status !== "processing") {
            throw new Error("Cycle must be in processing status to distribute profits");
        }

        if (cycle.profitDistributed) {
            throw new Error("Profits already distributed for this cycle");
        }

        // Get all TPIAs in this cycle
        const tpias = await TPIA.find({ _id: { $in: cycle.tpiaIds } });

        // Calculate total cycle capital for proportional distribution
        // Enables true compounding for TPM accounts whose currentValue increases over cycles
        const totalCycleCapital = cycle.totalCapital > 0
            ? cycle.totalCapital
            : tpias.reduce((sum, t) => sum + (t.currentValue || t.purchasePrice || 0), 0);

        const distributionDetails = [];

        for (const tpia of tpias) {
            const tpiaCapital = tpia.currentValue || tpia.purchasePrice || 1000000;
            const profitPerTPIA = totalCycleCapital > 0
                ? (tpiaCapital / totalCycleCapital) * cycle.totalProfitGenerated
                : cycle.totalProfitGenerated / tpias.length;

            // Update TPIA based on profit mode
            if (tpia.profitMode === "TPM") {
                // Compounding mode - add profit to TPIA value
                tpia.compoundedValue += profitPerTPIA;
                tpia.currentValue += profitPerTPIA;
            } else {
                // EPS mode - credit to wallet
                const wallet = await Wallet.findOne({ userId: tpia.partnerId });
                if (wallet) {
                    const balanceBefore = wallet.balance;
                    wallet.balance += profitPerTPIA;
                    wallet.totalEarned += profitPerTPIA;
                    await wallet.save();

                    // Create wallet transaction
                    const profitRef = `GDIP-PROFIT-${cycle.cycleId}-${tpia.tpiaId}-${Date.now()}`;
                    await WalletTransaction.create({
                        walletId: wallet._id,
                        userId: tpia.partnerId,
                        type: "earning",
                        category: "bonus",
                        amount: profitPerTPIA,
                        currency: "NGN",
                        balanceBefore,
                        balanceAfter: wallet.balance,
                        status: "completed",
                        reference: profitRef,
                        description: `Profit from ${tpia.tpiaId} - Cycle ${cycle.cycleNumber} (${cycle.actualProfitRate.toFixed(2)}% ROI)`,
                        metadata: {
                            tpiaId: tpia._id.toString(),
                            cycleId: cycle._id.toString(),
                            profitRate: cycle.actualProfitRate,
                            idempotencyKey: profitRef
                        },
                        processedAt: new Date()
                    });
                }
            }

            // Update TPIA stats
            tpia.totalProfitEarned += profitPerTPIA;
            tpia.cyclesCompleted += 1;
            tpia.lastCycleEndDate = new Date();
            tpia.lastCycleProfit = profitPerTPIA;
            tpia.currentCycleId = undefined;
            await tpia.save();

            // Record distribution
            distributionDetails.push({
                tpiaId: tpia._id,
                tpiaNumber: tpia.tpiaNumber,
                profitAmount: profitPerTPIA,
                profitMode: tpia.profitMode,
                distributedAt: new Date()
            });
        }

        // Update cycle
        cycle.distributionDetails = distributionDetails;
        cycle.profitDistributed = true;
        cycle.distributionDate = new Date();
        cycle.status = "completed";
        await cycle.save();

        // Update GDC
        const gdc = await GDC.findById(cycle.gdcId);
        if (gdc) {
            gdc.cyclesCompleted += 1;
            gdc.totalProfitGenerated += cycle.totalProfitGenerated;
            gdc.lastCycleEndDate = new Date();
            gdc.currentCycleId = undefined;

            // Calculate average ROI
            const allCycles = await TradeCycle.find({
                gdcId: gdc._id,
                status: "completed"
            });
            const totalROI = allCycles.reduce((sum, c) => sum + c.roi, 0);
            gdc.averageROI = totalROI / allCycles.length;

            // Set status back to ready for next cycle
            gdc.status = "ready";

            await gdc.save();
        }
    }

    /**
     * Get cycles for a GDC
     */
    static async getGDCCycles(gdcId: any, limit: number = 10): Promise<ITradeCycle[]> {
        return await TradeCycle.find({ gdcId })
            .sort({ cycleNumber: -1 })
            .limit(limit);
    }

    /**
     * Get cycles for a TPIA
     */
    static async getTPIACycles(tpiaId: any, limit: number = 10): Promise<ITradeCycle[]> {
        return await TradeCycle.find({ tpiaIds: tpiaId })
            .sort({ cycleNumber: -1 })
            .limit(limit);
    }

    /**
     * Get active cycles (for cron job processing)
     */
    static async getActiveCycles(): Promise<ITradeCycle[]> {
        return await TradeCycle.find({
            status: "active",
            endDate: { $lte: new Date() } // Cycles that have reached end date
        });
    }

    /**
     * Get scheduled cycles ready to start
     */
    static async getScheduledCycles(): Promise<ITradeCycle[]> {
        return await TradeCycle.find({
            status: "scheduled",
            startDate: { $lte: new Date() }
        });
    }

    /**
     * Auto-complete cycle (for cron job)
     * Uses target profit rate if actual sale data not available
     */
    static async autoCompleteCycle(cycleId: any): Promise<ITradeCycle> {
        const cycle = await TradeCycle.findById(cycleId);
        if (!cycle) {
            throw new Error("Trade cycle not found");
        }

        // Calculate estimated sale price based on target profit rate
        const targetProfit = cycle.totalCapital * (cycle.targetProfitRate / 100);
        const estimatedSalePrice = cycle.purchasePrice + targetProfit;

        cycle.autoExecuted = true;
        cycle.executionLog = `Auto-completed on ${new Date().toISOString()} with ${cycle.targetProfitRate}% target profit`;

        // Complete and distribute
        await this.completeCycle(cycleId, estimatedSalePrice, 0);
        await this.distributeProfits(cycleId);

        return cycle;
    }
}

export default TradeCycleService;
