// Express ko import karte hain taaki server create kar sakein
import express from "express";

// Cookie parsing ke liye cookie-parser middleware ko import karte hain
import cookieParser from "cookie-parser";

// CORS ke liye cors middleware ko import karte hain
import cors from "cors";

// Express app banate hain
const app = express();

// CORS middleware ka use karte hain, taaki specific origin se aane wali requests ko allow kar sakein
// origin: process.env.CORS_ORIGIN - Yeh specify karta hai ki kaunsa origin allowed hoga (e.g., 'http://localhost:3000')
// credentials: true - Iska matlab hai ki requests ke saath cookies ya authentication headers bhi bheje ja sakte hain
app.use(
  cors({
    origin: process.env.CORS_ORIGIN, // Origin specify karta hai ki kis domain se requests ko allow karna hai
    credentials: true, // Yeh ensure karta hai ki cookies aur credentials cross-origin requests ke saath exchange ho sakein
  })
);

// JSON data ko parse karne ke liye middleware use karte hain, limit set karte hain ki 16kb tak ka JSON data hi accept hoga
app.use(express.json({ limit: "16kb" }));

// URL-encoded data ko parse karte hain, extended true hone ka matlab hai ki nested objects ko bhi parse karenge, limit yahan bhi 16kb hai
app.use(express.urlencoded({ extended: true, limit: "16kb" }));

// Static files serve karne ke liye middleware use karte hain, "public" folder se static files serve hongi
app.use(express.static("public"));

// Cookies ko parse karne ke liye cookie-parser middleware use karte hain
app.use(cookieParser());

// routes import
import userRouter from "./routes/user.routes.js";

// routes declaration
app.use("/api/v1/users", userRouter);

//http://localhost:8000/api/v1/users/register

// App ko export kar rahe hain taaki ise kisi aur module me use kiya ja sake
export { app };
