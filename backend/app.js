const  express = require("express");
const connectToDB= require("./config/connectToDb");
require('dotenv').config;

// Connection To DB
connectToDB();

// init App
const app = express();

//Middelwares  
app.use(express.json());

// Routes 
app.use("/api/auth", require("./routes/authRoute"));
app.use("/api/colis", require("./routes/colisRoute"));

//Running server 
const port =process.env.PORT || 8084;
app.listen(port,()=>
console.log(
    `Server is running in ${process.env.MODE_ENV} modde on port ${port}}`    
)
)