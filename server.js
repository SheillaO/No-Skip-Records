import express from "express";
import session from "express-session";
import cors from "cors";
import { productsRouter } from "./routes/products.js";
import { authRouter } from "./routes/auth.js";
import { meRouter } from "./routes/me.js";
import { cartRouter } from "./routes/cart.js";
import { paymentsRouter } from "./routes/payments.js";
import { createTables } from "./createTable.js";
import { seedProducts, seedDemoUser } from "./seedTable.js";
import "dotenv/config";

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
    secret: secret,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: true,
      sameSite: "none",
    },
  }),
);

app.use(express.static("public"));

app.use("/api/products", productsRouter);
app.use("/api/auth/me", meRouter);
app.use("/api/auth", authRouter);
app.use("/api/cart", cartRouter);
app.use("/api/payments", paymentsRouter);

// Runs your existing createTable.js and seedTable.js logic automatically
// on every boot, so a fresh database.db is always set up correctly —
// you don't have to remember to run them by hand after each restart.
async function startServer() {
  await createTables();
  await seedProducts();
  await seedDemoUser();

  app
    .listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    })
    .on("error", (err) => {
      console.error("Failed to start server:", err);
    });
}

startServer();
