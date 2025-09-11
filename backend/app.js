// app.js
const express = require("express");
const connectToDB = require("./config/connectToDb");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const dotenv = require("dotenv");
const uploadRoutes = require("./routes/uploadRoutes");
const rateLimit = require("express-rate-limit");

// Load environment variables
dotenv.config();

// Optional (from your code)
const scheduleCronJobs = require("./Middlewares/CronScheduler");
// const { findOrCreateGDelLivreur } = require("./Controllers/goodDeliveryController");

// Connect to DB
connectToDB();

// Initialize App
const app = express();
app.use(express.json());
app.use(cookieParser());

/**
 * 1) OPEN CORS for public endpoints (any origin, no credentials)
 *    These endpoints are intended to be used by any website/app.
 */
const openCors = cors({
  origin: "*",
  credentials: false,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  // REMOVE allowedHeaders entirely so cors reflects Access-Control-Request-Headers
  // allowedHeaders: undefined,
  maxAge: 600,
  optionsSuccessStatus: 204,
});

// Basic rate limit for public APIs (tune as needed)
const publicLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 120,
  standardHeaders: true,
  legacyHeaders: false,
});

// Preflight for public routes
app.options("/api/client-api/*", openCors);
app.options("/api/livreur-api/*", openCors);

// Mount public routes FIRST
app.use("/api/client-api", publicLimiter, openCors, require("./routes/apiClientRoute"));
app.use("/api/livreur-api", publicLimiter, openCors, require("./routes/apiLivreurRoute"));

/**
 * 2) STRICT CORS for everything else (whitelist based on your BASE_URL)
 *    Keep your original approach: allowedOrigins = [process.env.BASE_URL]
 *    Add localhost variants to make local dev work without pain.
 */
const allowedOrigins = [process.env.BASE_URL]; // your preference
const whitelist = new Set(
  [
    ...allowedOrigins.filter(Boolean),
    "http://localhost:5173",
    "http://127.0.0.1:5173",
  ]
);

const strictCors = cors({
  origin: (origin, cb) => {
    // Allow server-to-server / Postman / curl (no Origin header)
    if (!origin) return cb(null, true);
    return whitelist.has(origin) ? cb(null, true) : cb(new Error("Not allowed by CORS"), false);
  },
  credentials: true, // only if you actually use cookies/session
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
  maxAge: 86400,
  optionsSuccessStatus: 204,
});

// Global preflight & strict CORS for the rest
app.options("*", strictCors);
app.use(strictCors);

/**
 * 3) Routes (protected by strict CORS)
 */
app.use("/api/auth", require("./routes/authRoute"));
app.use("/api/colis", require("./routes/colisRoute"));
app.use("/api/client", require("./routes/clientRoute"));
app.use("/api/livreur", require("./routes/livreurRoute"));
app.use("/api/team", require("./routes/teamRoute"));
app.use("/api/admin", require("./routes/adminRoute"));
app.use("/api/store", require("./routes/storeRoute"));
app.use("/api/produit", require("./routes/produitRoute"));
app.use("/api/variante", require("./routes/varianteRoute"));
app.use("/api/reclamation", require("./routes/reclamationRoute"));
app.use("/api/notification", require("./routes/notificationRoute"));
app.use("/api/meth", require("./routes/methRoute"));
app.use("/api/payement", require("./routes/payementRoute"));
app.use("/api/ville", require("./routes/villeRoute"));
app.use("/api/tarif-livreur", require("./routes/tarifLivreurRoute"));
app.use("/api/demande-retrait", require("./routes/demandeRoutes"));
app.use("/api/transaction", require("./routes/transactionRoute"));
app.use("/api/notification-user", require("./routes/notificationUserRoute"));
app.use("/api/facture", require("./routes/factureRoute"));
app.use("/api/Ramasserfacture", require("./routes/ramasserFactureRoute"));
app.use("/api/images", require("./routes/imageRoute"));
app.use("/api/statistic", require("./routes/staticRoute"));
app.use("/api/promotions", require("./routes/promotionRoutes"));
app.use("/api/mission", require("./routes/missionRoutes"));
app.use("/api/external", require("./routes/apiIntegrationRoute"));
app.use("/api/goodDelivery", require("./routes/goodDeliveryRoute"));
app.use("/api/note/colis", require("./routes/noteColisRoute"));
app.use("/api/wallet", require("./routes/walletRoutes"));
app.use("/api/transfer", require("./routes/transferRoutes"));
app.use("/api/withdrawal", require("./routes/withdrawalRoutes"));
app.use("/api/region", require("./routes/regionRoute"));
app.use("/api/profile", require("./routes/ProfileRoute"));
app.use("/api/client", require("./routes/clientRoute"));

// Uploads
app.use("/api/upload", uploadRoutes);

// Cron jobs
scheduleCronJobs();

// Optional: Initialize Good Delivery Livreur
/*
findOrCreateGDelLivreur()
  .then(() => console.log("'Good Delivery' Livreur verified and created successfully"))
  .catch((error) => console.error("Error during 'Good Delivery' livreur creation:", error));
*/

// Health check
app.get("/health", (req, res) => res.json({ ok: true, t: Date.now() }));

// Server
const port = process.env.PORT || 8084;
app.listen(port, () => {
  console.log(`Server is running in ${process.env.MODE_ENV} mode on port ${port}.`);
});
