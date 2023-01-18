const dotenv = require("dotenv").config();
const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const userRoute = require("./routes/userRoute")
const productRoute = require("./routes/productRoute")
const contactRoute = require("./routes/contactRoute")
const errorHandler = require("./middleWare/errorMiddleware")
const cookieParser= require("cookie-parser")
const path = require("path")


const app = express()

//  Middlewares
app.use(express.json()) // This will handle json data in the application
app.use(cookieParser())
app.use(express.urlencoded({extended: false})) // This will handle data that comes via the url
app.use(bodyParser.json())// This helps to send the information from the frontend to the backend
app.use(cors({
    origin : ["http://localhost:3000", "https://pinvent-app.vercel.app"],
    credentials:true,
}));

app.use("/uploads", express.static(path.join(__dirname, "uploads")))


// Route Middleware
app.use("/api/users", userRoute)
app.use("/api/products", productRoute)
app.use("/api/contactus", contactRoute)


// Routes
app.get("/", (req, res) => {
    res.send("Welcome Fred")
})

// Error Middleware
app.use(errorHandler);

// Connect to db and start server
const PORT = process.env.PORT || 5000
mongoose
    .connect(process.env.MONGO_URI)
    .then(()=>{
        app.listen(PORT, ()=>{
            console.log(`Server runnning on port ${PORT}`);
        });
    })
    .catch((err)=>console.log(err))
