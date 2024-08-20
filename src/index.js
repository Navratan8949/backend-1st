// require('dotenv').config({path:'./env'})
import dotenv from "dotenv";
import connectdb from "./db/index.js";
import { app } from "./app.js";

dotenv.config({ path: "" });
connectdb()
  .then(() => {
    app.on("error", (err) => {
      console.log("ERROR", err);
      throw err;
    });
    app.listen(process.env.PORT || 3000, () => {
      console.log(`server in running at port ${process.env.PORT}`);
    });
  })
  .catch((err) => {
    console.log("mongodb connection failed", err);
  });

// import express from "express";
// const app = express()(async () => {
//   try {
//     // mongoose.connect(`${}`)
//     await mongoose.connect(`mongodb://localhost:27017/${DB_NAME}`);
//     app.on("error", (err) => {
//       console.log("err", err);
//       throw err;
//     });
//     app.listen(process.env.PORT, () => {
//       console.log(`server in running on port :${process.env.PORT}`);
//     });
//   } catch (error) {
//     console.log("ERROR", error);
//     throw err;
//   }
// })();
// app.listen(process.env.PORT, () => {
//     console.log(`Server is running on port: ${process.env.PORT}`);
//   });
