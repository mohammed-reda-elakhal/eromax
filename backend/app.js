const  express = require("express");
const connectToDB= require("./config/connectToDb");
const {getColisByIdLivreur}= require("./Controllers/colisController")
require('dotenv').config;

const cors = require("cors");
const cookieParser = require("cookie-parser");
const { findOrCreateLivreur } = require("./Controllers/livreurController");
// Import your public routes
const apiIntegrationRoute = require("./routes/apiIntegrationRoute");
const scheduleCronJobs = require('./Middlewares/CronScheduler'); // Import the cronJobs.js file


// Connection To DB
connectToDB();

// init App
const app = express();




app.use(express.json());

//Cors Policy 

app.use(cors({
    // https://eromax.vercel.app
    // http://localhost:3000
    origin: process.env.BASE_URL, // Removed trailing slash
    credentials: true
}));
app.use(cookieParser());


// Routes 


/**
 

    www.eromax.ma/dashboard/colis/list
    
    www.eromax.ma/api/colis 


 * 
 * 
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
app.use('/api/demande-retrait',require("./routes/demandeRoutes"));
app.use('/api/transaction', require("./routes/transactionRoute"));
app.use('/api/notification-user', require('./routes/notificationUserRoute'));
app.use('/api/facture', require('./routes/factureRoute'));
app.use('/api/Ramasserfacture', require('./routes/ramasserFactureRoute'));
app.use("/api/images", require("./routes/imageRoute"));
app.use("/api/statistic", require("./routes/staticRoute"));
app.use('/api/promotions', require('./routes/promotionRoutes'));
app.use('/api/mission', require('./routes/missionRoutes'));
app.use('/api/integration', require('./routes/apiIntegrationRoute'));

// Initialize cron jobs
scheduleCronJobs();



// Run `findOrCreateLivreur` after database connection to ensure `livreur` user is created if it doesn't exist
findOrCreateLivreur()
  .then(() => console.log("'ameex' livreur verified or created successfully"))
  .catch((error) => console.error("Error during 'ameex' livreur creation:", error));

//Running server 
const port =process.env.PORT || 8084;
app.listen(port,()=>{
console.log(
    `Server is running in ${process.env.MODE_ENV} modde on port ${port} , with server ${process.env.BASE_URL}`    
    
);

})

