import { Router } from "express";
import { BazaarController } from "../controllers/bazaar.controller";
import { requireAuth, requireBazaarManager, requireSuperAdmin } from "../middleware/auth";

const router = Router();

// Public routes
router.get("/config", BazaarController.getPublicConfig);
router.post("/initialize-booking", BazaarController.initializeBooking);
router.get("/verify-payment", BazaarController.verifyPayment);
router.get("/verify-payment/:reference", BazaarController.verifyPayment);
router.post("/contact", BazaarController.submitContact);

// Trade Fair Promoter Public routes
router.post("/promoters/register", BazaarController.registerPromoter);
router.post("/promoters/login", BazaarController.loginPromoter);
router.get("/promoters/me", BazaarController.getPromoterDashboard);
router.get("/promoters/validate/:code", BazaarController.validatePromoterCode);

// Admin / Manager protected routes
router.put("/admin/config", requireAuth, requireBazaarManager, BazaarController.updateAdminConfig);
router.get("/admin/stats", requireAuth, requireBazaarManager, BazaarController.getAdminStats);
router.get("/admin/bookings", requireAuth, requireBazaarManager, BazaarController.getAdminBookings);
router.post("/admin/bookings/manual", requireAuth, requireBazaarManager, BazaarController.createManualBooking);
router.patch("/admin/bookings/:id", requireAuth, requireBazaarManager, BazaarController.updateBookingStatus);
router.post("/admin/bookings/:id/resend-email", requireAuth, requireBazaarManager, BazaarController.resendConfirmationEmail);
router.post("/admin/check-in", requireAuth, requireBazaarManager, BazaarController.checkInTicket);

// Admin / Manager Promoter Management routes
router.get("/admin/promoters", requireAuth, requireBazaarManager, BazaarController.adminGetPromoters);
router.patch("/admin/promoters/:id/status", requireAuth, requireBazaarManager, BazaarController.adminUpdatePromoterStatus);
router.post("/admin/promoters/:id/payout", requireAuth, requireBazaarManager, BazaarController.adminRecordPromoterPayout);

// Super Admin delete routes
router.post("/admin/bookings/bulk-delete", requireAuth, requireSuperAdmin, BazaarController.bulkDeleteBookings);
router.delete("/admin/bookings/:id", requireAuth, requireSuperAdmin, BazaarController.deleteBooking);

export default router;
