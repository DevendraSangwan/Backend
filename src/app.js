import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

const app=express();
app.use(cors({
    origin:process.env.CORS_ORIGIN,
    credentials:true,
}));

app.use(express.json({limit:"16kb"}));  // for convert data into json
app.use(express.urlencoded({extended:true,limit:"16kb"})); // get data from url 
app.use(express.static("public")); // able to show data publiclly
app.use(cookieParser()); //taking user cookies and also configure that

export {app};