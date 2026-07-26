import express from "express";
import session from "express-session";
import cors from "cors";
import { productsRouter } from "./routes/products.js";
import { authRouter } from "./routes/auth.js";
import { meRouter } from "./routes/me.js";
import { cartRouter } from "./routes/cart.js";

const app = express();

const PORT = process.env.PORT || 8000;
const secret = process.env.SPIRAL_SESSION_SECRET || "jellyfish-baskingshark";

// Enable CORS to securely accept credentials/cookies from your Netlify domain
app.use(
  cors({
    // FIXED: Removed the trailing slash from the link to prevent CORS connection rejections
    origin: "https://noskiprecords.netlify.app",
    credentials: true,
  }),
);

// Parsing middleware (Allows server to read JSON bodies sent by frontend)
app.use(express.json());

// =========================================================================
// 🔒 COOKIE HANDSHAKE OPTIMIZATION MODULE (RENDER REVERSE PROXY RULES)
// =========================================================================
// Trust Render's reverse proxy setup for cross-domain cookie handshakes
app.set("trust proxy", 1);

// 4. Session middleware configuration optimized for multi-platform hosting
app.use(
  session({
    secret: secret,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: true, // MUST be true on Render (Render handles HTTPS encryption natively)
      sameSite: "none", // MUST be "none" so cookies pass smoothly between Render and Netlify
    },
  }),
);
// =========================================================================

// Static asset delivery (Acts as local backup when working on your machine)
app.use(express.static("public"));

// Application Routing Endpoints
app.use("/api/products", productsRouter);
app.use("/api/auth/me", meRouter);
app.use("/api/auth", authRouter);
app.use("/api/cart", cartRouter);

// Server Initialization and Boot Check
app
  .listen(PORT, () => {
    console.log(`Server running dynamically on port ${PORT}`);
  })
  .on("error", (err) => {
    console.error("Failed to start server:", err);
  });
