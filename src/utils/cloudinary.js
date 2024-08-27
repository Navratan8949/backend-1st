import { v2 as cloudinary } from "cloudinary"; // `cloudinary` module ko import karte hain, jo Cloudinary API ke sath interact karne ke liye use hota hai
import fs from "fs"; // `fs` (file system) module ko import karte hain, jo files ko handle karne ke liye use hota hai

// Cloudinary configuration set karte hain environment variables se
cloudinary.config({
  //   cloud_name: process.env.CLOUDINARY_CLOUD_NAME, // Cloudinary account ka cloud name
  //   api_key: process.env.CLOUDINARY_API_KEY, // Cloudinary API key
  //   api_secret: process.env.CLOUDINARY_API_SECRET, // Cloudinary API secret
  cloud_name: "dvswaqjhg",
  api_key: "873493425176119",
  api_secret: "RH7MVS9ILYC-tgCtCcx_i662glY",
  secure: true,
});

// Function define karte hain jo local file ko Cloudinary pe upload karega
const uploadOnCloudinary = async (localfilepath) => {
  try {
    if (!localfilepath) return null; // Agar file path nahi hai to function se `null` return karte hain

    // File ko Cloudinary pe upload karte hain
    const response = await cloudinary.uploader.upload(localfilepath, {
      resource_type: "auto", // Resource type automatically detect karenge (e.g., image, video)
    });

    // Agar file successfully upload ho gayi to response me URL print karte hain
    // console.log("file is uploaded on cloudinary ", response.url);
    fs.unlinkSync(localfilepath);
    return response; // Upload ke response ko return karte hain
  } catch (error) {
    // Agar upload me error aata hai, to local file ko delete karte hain
    fs.unlinkSync(localfilepath); // Local temporary file ko remove karte hain
    return null; // Error case me `null` return karte hain
  }
};

export { uploadOnCloudinary }; // `uploadOnCloudinary` function ko export karte hain taaki dusre modules use kar sakein
