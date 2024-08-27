import multer from "multer"; // `multer` module ko import karte hain, jo file uploads handle karne ke liye use hota hai

// Storage configuration define karte hain
const storage = multer.diskStorage({
  // Destination folder define karte hain jahan files store hongi
  destination: function (req, file, cb) {
    cb(null, "./public/temp"); // Files ko `../../public/temp` folder me store karenge
  },
  // Filename define karte hain jo file ko save karte waqt use hoga
  filename: function (req, file, cb) {
    // File ka naam timestamp ke sath combine karte hain taaki unique ho
    cb(null, `${Date.now()}-${file.originalname}`);
    // Alternative: `file.originalname` use kar sakte hain bina timestamp ke
    // cb(null, file.originalname);
  },
});

// `upload` middleware ko create karte hain jo file upload handling ke liye use hoga
export const upload = multer({
  storage, // Storage configuration ko pass karte hain `multer` function ko
});
