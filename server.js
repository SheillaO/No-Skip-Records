import express from "express";
import session from "express-session";
import { productsRouter } from "./routes/products.js";
import { authRouter } from "./routes/auth.js";
import { meRouter } from "./routes/me.js";
import { cartRouter } from "./routes/cart.js";

const app = express();
const PORT = 8000;
const secret = process.env.SPIRAL_SESSION_SECRET || "jellyfish-baskingshark";

// 1. Parsing middleware (Allows server to read JSON bodies sent by frontend)
app.use(express.json());

// 2. Session authentication middleware configuration
app.use(
  session({
    secret: secret,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: false, // Set to true if using HTTPS in production
      sameSite: "lax",
    },
  }),
);

// 3. Static asset delivery (Serves your index.html, index.css, and client JS)
app.use(express.static("public"));

// 4. Application Routing Endpoints
app.use("/api/products", productsRouter);
app.use("/api/auth/me", meRouter);
app.use("/api/auth", authRouter);
app.use("/api/cart", cartRouter);

// 5. Server Initialization and Boot Check
app
  .listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
  })
  .on("error", (err) => {
    console.error("Failed to start server:", err);
  });
