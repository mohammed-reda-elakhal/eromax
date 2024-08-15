const  express = require("express");
const connectToDB= require("./config/connectToDb");
require('dotenv').config;
<<<<<<<<< Temporary merge branch 1
const cors = require("cors")

=========
const cors = require('cors')
>>>>>>>>> Temporary merge branch 2

// Connection To DB
connectToDB();

// init App
const app = express();

<<<<<<<<< Temporary merge branch 1
//Middelwares 
=========
// cors
app.use(cors({
    origin:"http://localhost:3000"
}))


//Middelwares  
>>>>>>>>> Temporary merge branch 2
app.use(express.json());

//Cors Policy 

app.use(cors({
    origin: "http://localhost:3000", // Removed trailing slash
    credentials: true
}));

// Routes 
app.use("/api/auth", require("./routes/authRoute"));
app.use("/api/colis", require("./routes/colisRoute"));
app.use("/api/client", require("./routes/clientRoute"));
app.use("/api/livreur", require("./routes/livreurRoute"));
app.use("/api/produit", require("./routes/produitRoute"));

//Running server 
const port =process.env.PORT || 8084;
app.listen(port,()=>{
console.log(
    `Server is running in ${process.env.MODE_ENV} modde on port ${port}`    
    
);

})

