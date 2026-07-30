import express from "express";
import session from "express-session";
import cors from "cors";
import { createRequire } from "module";
import { productsRouter } from "./routes/products.js";
import { authRouter } from "./routes/auth.js";
import { meRouter } from "./routes/me.js";
import { cartRouter } from "./routes/cart.js";
import { paymentsRouter } from "./routes/payments.js";
import "dotenv/config";


const require = createRequire(import.meta.url);
const FileStore = require("session-file-store")(session);

const app = express();
const PORT = process.env.PORT || 8000;
const secret = process.env.SPIRAL_SESSION_SECRET || "jellyfish-baskingshark";

app.use(
  cors({
    origin: "https://noskiprecords.netlify.app",
    credentials: true,
  }),
);

app.use(express.json());
app.set("trust proxy", 1);

app.use(
  session({
    
    store: new FileStore({
      path: "./sessions",
      ttl: 7 * 24 * 60 * 60, 
      retries: 1,
      logFn: () => {}, 
    }),
    secret: secret,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: true,
      sameSite: "none",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days in milliseconds
    },
  }),
);

app.use(express.static("public"));

app.use("/api/products", productsRouter);
app.use("/api/auth/me", meRouter);
app.use("/api/auth", authRouter);
app.use("/api/cart", cartRouter);
app.use("/api/payments", paymentsRouter);

app
  .listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  })
  .on("error", (err) => {
    console.error("Failed to start server:", err);
  });
