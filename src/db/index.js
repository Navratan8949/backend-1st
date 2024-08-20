import mongoose from "mongoose";
import { DB_NAME } from "../constants.js";

const connectdb = async () => {
  try {
    const connectionInstance = await mongoose.connect(
      `${process.env.DB_URL}${DB_NAME}`,
      {
        // useNewUrlParser: true,
        // useUnifiedTopology: true,
      }
    );
    console.log(
      `MongoDB Database connected !! DB HOST : ${connectionInstance.connection.host}`
    );
  } catch (error) {
    console.error(`mongodb connection failed: ${error.message}`);
    process.exit(1);
  }
};

export default connectdb;

// import mongoose from "mongoose";

// const connectdb = async () => {
//   // Ensure MONGODB_URL is set
//   if (!process.env.MONGODB_URL) {
//     console.error("MONGODB_URL environment variable is not set.");
//     process.exit(1);
//   }

//   try {
//     const connectionInstance = await mongoose.connect(process.env.MONGODB_URL, {
//       useNewUrlParser: true,
//       useUnifiedTopology: true,
//     });
//     console.log(
//       `MongoDB connected! DB Host: ${connectionInstance.connection.host}`
//     );
//   } catch (error) {
//     console.error("MongoDB connection failed:", error.message);
//     process.exit(1);
//   }
// };

// export default connectdb;
