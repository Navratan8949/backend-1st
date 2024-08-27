import { Router } from "express";
import {
  changeCurrentPassword,
  getAllUser,
  getCurrentUser,
  getUserchannelProfile,
  getWatchHistory,
  loginUser,
  logoutUser,
  refreshTokenAccess,
  registerUser,
  updateAccountDetails,
  updateUserAvatar,
  updateUsercoverImage,
} from "../controllers/user.controller.js";
import { upload } from "../middlewares/multer.middleware.js";
import { verifyJwt } from "../middlewares/auth.middleware.js";

const router = Router();

router.get("/allusers", getAllUser);

// router.route("/register").post(registerUser);
router.post(
  "/register",
  upload.fields([
    {
      name: "avatar",
      maxCount: 1,
    },
    {
      name: "coverImage",
      maxCount: 1,
    },
  ]),
  registerUser
);

router.post("/login", loginUser);

//secure route

// router.route('/logout').post(logoutUser)
// ye verifyJwt middleware verified karega ki user hai ya nhi hai
router.post("/logout", verifyJwt, logoutUser);
router.post("/refresh-token", refreshTokenAccess);
router.post("/change-password", verifyJwt, changeCurrentPassword);
router.get("/current-user", verifyJwt, getCurrentUser);
router.patch("/update-account", verifyJwt, updateAccountDetails);
router.patch("/avatar", verifyJwt, upload.single("avatar"), updateUserAvatar);
router.patch(
  "/coverImage",
  verifyJwt,
  upload.single("coverImage"),
  updateUsercoverImage
);
router.get("/c/:username", verifyJwt, getUserchannelProfile);

router.get("/history", verifyJwt, getWatchHistory);

export default router;
