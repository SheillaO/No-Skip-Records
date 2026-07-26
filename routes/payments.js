import express from "express";
import {
  initializePayment,
  verifyPayment,
} from "../controllers/paymentController.js";
import { requireAuth } from "../middleware/requireAuth.js";

export const paymentsRouter = express.Router();

// requireAuth here means only logged-in users can pay — matches your existing pattern
paymentsRouter.post("/initialize", requireAuth, initializePayment);
paymentsRouter.get("/verify/:reference", requireAuth, verifyPayment);
