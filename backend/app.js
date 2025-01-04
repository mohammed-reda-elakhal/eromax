const express = require("express");
const connectToDB = require("./config/connectToDb");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

// Import your public routes
const apiIntegrationRoute = require("./routes/apiIntegrationRoute");
const scheduleCronJobs = require('./Middlewares/CronScheduler');
const { findOrCreateGDelLivreur } = require("./Controllers/goodDeliveryController");

// Connection To DB
connectToDB();

// Initialize App
const app = express();

app.use(express.json());

// CORS Configuration
const allowedOrigin = process.env.BASE_URL || 'http://localhost:3000';  // Fallback to localhost:3000 if BASE_URL is undefined

app.use(cors({
  origin: allowedOrigin,  // Allow all origins
  methods: ['*'],
}));


app.use(cookieParser());

// Routes
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
app.use('/api/demande-retrait', require("./routes/demandeRoutes"));
app.use('/api/transaction', require("./routes/transactionRoute"));
app.use('/api/notification-user', require('./routes/notificationUserRoute'));
app.use('/api/facture', require('./routes/factureRoute'));
app.use('/api/Ramasserfacture', require('./routes/ramasserFactureRoute'));
app.use("/api/images", require("./routes/imageRoute"));
app.use("/api/statistic", require("./routes/staticRoute"));
app.use('/api/promotions', require('./routes/promotionRoutes'));
app.use('/api/mission', require('./routes/missionRoutes'));
app.use('/api/external', require('./routes/apiIntegrationRoute'));
app.use('/api/goodDelivery', require('./routes/goodDeliveryRoute'));

// Initialize cron jobs
scheduleCronJobs();

// Optional: Initialize Good Delivery Livreur
/*
findOrCreateGDelLivreur()
     .then(() => console.log("'Good Delivery' Livreur verified and created successfully"))
     .catch((error) => console.error("Error during 'Good Delivery' livreur creation:", error));
*/

// Running server 
const port = process.env.PORT || 8084;
app.listen(port, () => {
  console.log(
    `Server is running in ${process.env.MODE_ENV} mode on port ${port}, with server ${process.env.BASE_URL}`
  );
});
