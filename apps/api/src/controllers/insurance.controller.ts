import { Request, Response } from "express";
import { AuthRequest } from "../middleware/auth";
import { TPIA, Insurance, Commodity } from "../models";
import { Schema } from "mongoose";

/**
 * Insurance Controller
 * Handles insurance certificate generation and claims processing
 */

/**
 * Get insurance certificate details
 */
export const getInsuranceCertificate = async (req: AuthRequest, res: Response) => {
    try {
        const { tpiaId } = req.params;
        const userId = req.user?._id;

        const tpia = await TPIA.findById(tpiaId);

        if (!tpia) {
            return res.status(404).json({ error: "TPIA not found" });
        }

        // Check ownership
        if (tpia.partnerId.toString() !== userId?.toString() && req.user?.role !== "admin") {
            return res.status(403).json({ error: "Access denied" });
        }

        const insurance = await Insurance.findOne({ tpiaId: tpia._id });

        if (!insurance) {
            return res.status(404).json({ error: "Insurance certificate not found" });
        }

        // Return nested shape matching the certificate UI
        const certificateData = {
            tpia: {
                tpiaId: tpia.tpiaId,
                tpiaNumber: tpia.tpiaNumber,
                partnerName: tpia.partnerName,
                partnerEmail: tpia.partnerEmail,
                purchasePrice: tpia.purchasePrice,
                commodityType: tpia.commodityType,
                commodityQuantity: tpia.commodityQuantity,
                commodityUnit: (tpia as any).commodityUnit,
                purchasedAt: tpia.createdAt,
            },
            insurance: {
                certificateNumber: insurance.certificateNumber,
                provider: insurance.provider,
                coverageAmount: insurance.coverageAmount,
                status: insurance.status,
                effectiveDate: insurance.effectiveDate,
                expiryDate: insurance.expiryDate,
                warehouseLocation: insurance.warehouseLocation,
            },
        };

        res.json({
            success: true,
            data: certificateData,
        });
    } catch (error) {
        console.error("Error fetching insurance certificate:", error);
        res.status(500).json({ error: "Failed to fetch insurance certificate" });
    }
};

/**
 * File insurance claim (Admin)
 */
export const fileInsuranceClaim = async (req: AuthRequest, res: Response) => {
    try {
        const { tpiaId } = req.params;
        const { claimType, claimAmount, description, documents } = req.body;

        if (!claimType || !claimAmount || !description) {
            return res.status(400).json({ error: "Missing required fields" });
        }

        const tpia = await TPIA.findById(tpiaId);

        if (!tpia) {
            return res.status(404).json({ error: "TPIA not found" });
        }

        const insurance = await Insurance.findOne({ tpiaId: tpia._id });

        if (!insurance) {
            return res.status(404).json({ error: "Insurance not found" });
        }

        // Add claim to insurance record
        // NOTE: schema requires `claimReason` (not `description`)
        const claim = {
            claimNumber: `CLM-${Date.now()}`,
            claimType,
            claimAmount,
            claimDate: new Date(),
            claimReason: description,   // maps request `description` → schema `claimReason`
            claimStatus: "pending",
            documents: documents || [],
            filedBy: req.user?._id,
        };

        insurance.claims = insurance.claims || [];
        insurance.claims.push(claim as any);
        insurance.claimsPending = (insurance.claimsPending || 0) + 1;

        await insurance.save();

        res.json({
            success: true,
            message: "Insurance claim filed successfully",
            data: claim,
        });
    } catch (error) {
        console.error("Error filing insurance claim:", error);
        res.status(500).json({ error: "Failed to file insurance claim" });
    }
};

/**
 * Process insurance claim (Admin)
 */
export const processInsuranceClaim = async (req: AuthRequest, res: Response) => {
    try {
        const { insuranceId, claimNumber } = req.params;
        const { status, approvedAmount, notes } = req.body;

        if (!status || !["approved", "rejected", "processing"].includes(status)) {
            return res.status(400).json({ error: "Invalid claim status" });
        }

        const insurance = await Insurance.findById(insuranceId);

        if (!insurance) {
            return res.status(404).json({ error: "Insurance not found" });
        }

        const claim = insurance.claims?.find((c: any) => c.claimNumber === claimNumber);

        if (!claim) {
            return res.status(404).json({ error: "Claim not found" });
        }

        // Update claim
        (claim as any).status = status;
        (claim as any).processedDate = new Date();
        (claim as any).processedBy = req.user?._id;
        (claim as any).notes = notes;

        if (status === "approved") {
            (claim as any).approvedAmount = approvedAmount || (claim as any).claimAmount;
            insurance.claimsApproved = (insurance.claimsApproved || 0) + 1;
            insurance.totalClaimsPaid = (insurance.totalClaimsPaid || 0) + (claim as any).approvedAmount;
        } else if (status === "rejected") {
            insurance.claimsRejected = (insurance.claimsRejected || 0) + 1;
        }

        insurance.claimsPending = Math.max(0, (insurance.claimsPending || 1) - 1);

        await insurance.save();

        res.json({
            success: true,
            message: `Claim ${status} successfully`,
            data: claim,
        });
    } catch (error) {
        console.error("Error processing insurance claim:", error);
        res.status(500).json({ error: "Failed to process insurance claim" });
    }
};

/**
 * Get all insurance claims (Admin)
 */
export const getAllClaims = async (req: Request, res: Response) => {
    try {
        const { status } = req.query;

        const insurances = await Insurance.find({
            claims: { $exists: true, $ne: [] },
        }).populate("tpiaId");

        let allClaims: any[] = [];

        insurances.forEach((insurance) => {
            if (insurance.claims) {
                insurance.claims.forEach((claim: any) => {
                    allClaims.push({
                        ...claim.toObject(),
                        insuranceId: insurance._id,
                        certificateNumber: insurance.certificateNumber,
                        tpiaId: (insurance as any).tpiaId?.tpiaId,
                    });
                });
            }
        });

        res.json({
            success: true,
            count: allClaims.length,
            data: allClaims,
        });
    } catch (error) {
        console.error("Error fetching claims:", error);
        res.status(500).json({ error: "Failed to fetch claims" });
    }
};

/**
 * Verify insurance certificate authenticity (Public)
 */
export const verifyCertificate = async (req: Request, res: Response) => {
    try {
        const { certificateNumber } = req.params;

        const insurance = await Insurance.findOne({ certificateNumber }).populate("tpiaId");

        if (!insurance) {
            return res.status(404).json({
                success: false,
                error: "Invalid certificate number. This document could not be verified."
            });
        }

        const tpia = insurance.tpiaId as any;

        const verificationData = {
            certificateNumber: insurance.certificateNumber,
            tpiaId: tpia?.tpiaId,
            partnerName: tpia?.partnerName,
            status: insurance.status,
            coverageAmount: insurance.coverageAmount,
            effectiveDate: insurance.effectiveDate,
            expiryDate: insurance.expiryDate,
            commodityType: tpia?.commodityType,
            isAuthentic: true,
            verifiedAt: new Date(),
        };

        res.json({
            success: true,
            data: verificationData,
        });
    } catch (error) {
        console.error("Error verifying certificate:", error);
        res.status(500).json({ error: "Failed to verify certificate" });
    }
};

export default {
    getInsuranceCertificate,
    fileInsuranceClaim,
    processInsuranceClaim,
    getAllClaims,
    verifyCertificate,
};
