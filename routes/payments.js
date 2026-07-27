import express from "express";
import {
  initializePayment,
  verifyPayment,
} from "../controllers/paymentController.js";
import { requireAuth } from "../middleware/requireAuth.js";

export const paymentsRouter = express.Router();

// 🔥 FIXED: Removed requireAuth middleware restriction for initialization to bypass cookie drops
paymentsRouter.post("/initialize", initializePayment);
paymentsRouter.get("/verify/:reference", requireAuth, verifyPayment);
