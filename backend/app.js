const  express = require("express");
const connectToDB= require("./config/connectToDb");
const {getColisByIdLivreur}= require("./Controllers/colisController")
require('dotenv').config;

const cors = require("cors");
const cookieParser = require("cookie-parser");


// Connection To DB
connectToDB();

// init App
const app = express();




app.use(express.json());

//Cors Policy 

app.use(cors({
    origin: "http://localhost:3000", // Removed trailing slash
    credentials: true
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
app.use('/api/demande-retrait',require("./routes/demandeRoutes"));
app.use('/api/transaction', require("./routes/transactionRoute"));
app.use('/api/notification-user', require('./routes/notificationUserRoute'));
app.use('/api/facture', require('./routes/factureRoute'));


//Running server 
const port =process.env.PORT || 8084;
app.listen(port,()=>{
console.log(
    `Server is running in ${process.env.MODE_ENV} modde on port ${port}`    
    
);

})

