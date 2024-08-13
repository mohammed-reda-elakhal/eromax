const  express = require("express");
const connectToDB= require("./config/connectToDb");
require('dotenv').config;
const cors = require('cors')

// Connection To DB
connectToDB();

// init App
const app = express();

// cors
app.use(cors({
    origin:"http://localhost:3000"
}))


//Middelwares  
app.use(express.json());

// Routes 
app.use("/api/auth", require("./routes/authRoute"));
app.use("/api/colis", require("./routes/colisRoute"));
app.use("/api/store", require("./routes/storeRoute"));
app.use("/api/client", require("./routes/clientRoute"));
app.use("/api/livreur", require("./routes/livreurRoute"));
app.use("/api/produit", require("./routes/produitRoute"));



//Running server 
const port =process.env.PORT || 8084;
app.listen(port,()=>
console.log(
    `Server is running in ${process.env.MODE_ENV} modde on port ${port}}`    
)
)