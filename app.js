const express = require("express");
const mongoose = require("mongoose");
const app =express();
const dotenv =require("dotenv");
const cors = require("cors")
const cookieParser = require("cookie-parser");
dotenv.config();
const userRouter = require("./router/user");
const PostRouter = require("./router/Post");
const {verifyToken} = require("./router/verifytoken")

mongoose.connect(process.env.MONGODB)
.then(()=>{ console.log("BD Connection successfully..")})
.catch(()=>{ console.log("BD Connection failed..")});

app.use(cors());
app.use(express.json());
app.use(cookieParser());
app.use("/api/user",userRouter);
app.use("/api/post", verifyToken ,PostRouter);


// app.use(function(req, res, next) {
//     if (!req.headers.authorization) {
//     return res.status(403).json({ error: 'No credentials sent!' });
//     }
//     next();
// });
const port = process.env.port || 8080
app.listen(port, ()=>{
    console.log("Server is runnig...")
})
