import mongoose from "mongoose";
import { User } from "../models/user.models.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asynchandler } from "../utils/asynchandler.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import jwt from "jsonwebtoken";

const generateAccessAndRefreshTokens = async (userId) => {
  try {
    const user = await User.findById(userId);

    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();

    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });

    return { accessToken, refreshToken };
  } catch (error) {
    throw new ApiError(
      500,
      "something went wrong while generating referesh and access token"
    );
  }
};

const getAllUser = asynchandler(async (req, res) => {
  const user = await User.find({});
  // const user = await User.find({}).select("-password -refreshToken");
  if (!user.length) {
    throw new ApiError(404, "no users found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, "all users fatched successfully", user));
});

const registerUser = asynchandler(async (req, res) => {
  //   return res.status(200).json({ message: "ok" });

  // make register steps---------

  // get user details from frontend
  // validation - not empty
  // check if user already exits: usrename, email
  // check for images (coverImage) , check for avatar
  // upload them to cloudinary , avatar
  // create user object - create entry in db
  // remove password and refresh token feild from response
  // check for user creation
  // return res

  // get user details from frontend
  const { username, email, fullName, password } = req.body;
  //   console.log("email", email);

  // validation - not empty
  if (
    [username, email, fullName, password].some((feild) => feild?.trim() === " ")
  ) {
    throw new ApiError(400, "all feilds are required");
  }

  // check if user already exits: usrename, email
  const exitedUser = await User.findOne({
    $or: [{ username }, { email }],
  });

  if (exitedUser) {
    throw new ApiError(409, "User with email and username already exits");
  }

  // check for images (coverImage) , check for avatar
  const avatarLocalPath = req.files?.avatar[0]?.path;
  //   const coverImageLocalPath = req.files?.coverImage[0]?.path;

  let coverImageLocalPath;

  if (
    req.files &&
    Array.isArray(req.files.coverImage) &&
    req.files.coverImage.length > 0
  ) {
    coverImageLocalPath = req.files.coverImage[0].path;
  }

  //   console.log(req.files);

  if (!avatarLocalPath) {
    throw new ApiError(400, "avatar file is required");
  }

  // upload them to cloudinary , avatar
  const avatar = await uploadOnCloudinary(avatarLocalPath);
  const coverImage = await uploadOnCloudinary(coverImageLocalPath);

  if (!avatar) {
    throw new ApiError(400, "Failed to upload avatar to Cloudinary");
  }

  // create user object - create entry in db
  const user = await User.create({
    fullName,
    avatar: avatar.url,
    coverImage: coverImage?.url || "",
    email,
    password,
    username: username.toLowerCase(),
  });

  // remove password and refresh token feild from response
  const createdUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );

  // check for user creation
  if (!createdUser) {
    throw new ApiError(500, "something went wrong while registering the User");
  }

  // return res
  return res
    .status(201)
    .json(new ApiResponse(200, createdUser, "user register successfully"));
});

const loginUser = asynchandler(async (req, res) => {
  // req.body -> data
  // username or email kisi ek se login
  // find the user iska matlab hai ki user db se hai ya nhi usne register kara hai ya nhi
  // password check
  // access and refresh token
  // send cookie
  // return res

  const { username, email, password } = req.body;

  // if (!username || !email) {
  //   throw new ApiError(400, "username or email is required");
  // }

  // jab hame username ya email me se koi ek chaiye tab ye karte hai

  // if (!(username || email)) {
  //   throw new ApiError(400, "username or email is required");
  // }

  // or jab hame dono chahiye tab ye karte hai

  if (!username && !email) {
    throw new ApiError(400, "username and email is required");
  }

  const user = await User.findOne({
    $or: [{ username }, { email }],
  });

  if (!user) {
    throw new ApiError(404, "user does not extis");
  }

  const isPasswordValid = await user.isPasswordCorrect(password);

  if (!isPasswordValid) {
    throw new ApiError(401, "Invalid user crendetials");
  }

  const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(
    user._id
  );

  const loggedInUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );

  const options = {
    httpOnly: true,
    secure: true,
  };

  return res
    .status(200)
    .cookie("accesstoken", accessToken, options)
    .cookie("refreshtoken", refreshToken, options)
    .json(
      new ApiResponse(200, "user logged in successfully", {
        user: loggedInUser,
        accessToken,
        refreshToken,
      })
    );
});

const logoutUser = asynchandler(async (req, res) => {
  await User.findByIdAndUpdate(
    req.user._id,
    {
      // $set: {
      //   refreshToken: undefined,
      // },
      $unset: {
        refreshToken: 1, // this remove the feild from document
      },
    },
    {
      new: true,
    }
  );

  const options = {
    httpOnly: true,
    secure: true,
  };

  return res
    .status(200)
    .clearCookie("accesstoken", options)
    .clearCookie("refreshtoken", options)
    .json(new ApiResponse(200, "user logged out", {}));
});

// const refreshTokenAccess = asynchandler(async (req, res) => {
//   const incomingRefreshToken =
//     req.cookies.refreshToken || req.body.refreshToken;

//   if (!incomingRefreshToken) {
//     throw new ApiError(401, "unauthorized request");
//   }

//   try {
//     const decodedToken = jwt.verify(
//       incomingRefreshToken,
//       process.env.REFRESH_TOKEN_SECRET
//     );

//     const user = await User.findById(decodedToken?._id);

//     if (!user) {
//       throw new ApiError(401, "Invalid refresh token");
//     }

//     if (incomingRefreshToken !== user?.refreshToken) {
//       throw new ApiError(401, "refresh token is expired or used");
//     }

//     const options = {
//       httpOnly: true,
//       secure: true,
//     };

//     const { accessToken, newRrefreshToken } =
//       await generateAccessAndRefreshTokens(user._id);

//     return res
//       .status(200)
//       .cookie("accesstoken", accessToken, options)
//       .cookie("refreshtoken", newRrefreshToken, options)
//       .json(
//         new ApiResponse(
//           200,
//           { accessToken, refreshToken: newRrefreshToken },
//           "access token refreshed"
//         )
//       );
//   } catch (error) {
//     throw new ApiError(401, error?.message || "invalid refresh token");
//   }
// });

const refreshTokenAccess = asynchandler(async (req, res) => {
  const incomingRefreshToken =
    req.cookies.refreshToken || req.body.refreshToken;

  if (!incomingRefreshToken) {
    throw new ApiError(401, "unauthorized request");
  }

  try {
    const decodedToken = jwt.verify(
      incomingRefreshToken,
      process.env.REFRESH_TOKEN_SECRET
    );

    const user = await User.findById(decodedToken?._id);

    if (!user) {
      throw new ApiError(401, "Invalid refresh token");
    }

    if (incomingRefreshToken !== user?.refreshToken) {
      throw new ApiError(401, "refresh token is expired or used");
    }

    const options = {
      httpOnly: true,
      secure: true,
    };

    const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(
      user._id
    );

    return res
      .status(200)
      .cookie("accesstoken", accessToken, options)
      .cookie("refreshtoken", refreshToken, options)
      .json(
        new ApiResponse(
          200,
          { accessToken, refreshToken: refreshToken },
          "access token refreshed"
        )
      );
  } catch (error) {
    throw new ApiError(401, error?.message || "invalid refresh token");
  }
});
const changeCurrentPassword = asynchandler(async (req, res) => {
  const {
    oldPassword,
    newPassword,
    //jab hame confirm password bhi chaiye hai to ham check karenge ki hamara old password or confirm password same hai ya nhi
    // confPassword,
  } = req.body;

  // if (!(oldPassword === confPassword)) {
  //   throw new ApiError(401, "old password and confirm password does not match");
  // }

  const user = await User.findById(req.user?._id);

  const isPasswordCorrect = await user.isPasswordCorrect(oldPassword);

  if (!isPasswordCorrect) {
    throw new ApiError(400, "Invalid old password");
  }

  user.password = newPassword;

  await user.save({ validateBeforeSave: false });

  return res
    .status(200)
    .json(new ApiResponse(200, "password change successfully", {}));
});

const getCurrentUser = asynchandler(async (req, res) => {
  return res
    .status(200)
    .json(new ApiResponse(200, "current user fatched successfully", req.user));
});

const updateAccountDetails = asynchandler(async (req, res) => {
  const { fullName, email } = req.body;

  if (!fullName || !email) {
    throw new ApiError(400, "all feils are required");
  }

  const user = await User.findByIdAndUpdate(
    req.user?._id,
    {
      $set: {
        fullName,
        email,
        // fullName:fullName,
        // email:email
      },
    },
    { new: true }
  ).select("-password");

  return res
    .status(200)
    .json(new ApiResponse(200, "account details updated successfully", user));
});

const updateUserAvatar = asynchandler(async (req, res) => {
  const avatarLocalPath = req.file?.path;
  if (!avatarLocalPath) {
    throw new ApiError(400, "Avatar file is missing");
  }

  // me chahta hu ki avatar to update ho jayega or wo cloudinary per upload ho jayega but me chahta hu ki pahle wala avatar cloudinary se delete ho jaye

  const avatar = await uploadOnCloudinary(avatarLocalPath);

  if (!avatar.url) {
    throw new ApiError(400, "Error while uploading on avatar");
  }

  const user = await User.findByIdAndUpdate(
    req.user._id,
    {
      $set: {
        avatar: avatar.url,
      },
    },
    { new: true }
  ).select("-password");

  return res
    .status(200)
    .json(
      new ApiResponse(200, "User avatar image is updated successfully", user)
    );
});

const updateUsercoverImage = asynchandler(async (req, res) => {
  const coverImageLocalPath = req.file?.path;

  if (!coverImageLocalPath) {
    throw new ApiError(400, "Cover Image is required");
  }

  const coverImage = await uploadOnCloudinary(coverImageLocalPath);

  if (!coverImage.url) {
    throw new ApiError(400, "Error while uploading on Cover Image");
  }

  const user = await User.findByIdAndUpdate(
    req.user._id,
    {
      $set: {
        coverImage: coverImage.url,
      },
    },
    { new: true }
  ).select("-password");

  return res
    .status(200)
    .json(
      new ApiResponse(200, "user cover image is updated successfully ", user)
    );
});

const getUserchannelProfile = asynchandler(async (req, res) => {
  const { username } = req.params;

  if (!username?.trim()) {
    throw new ApiError(400, "username is missing");
  }
  // User.find({username})

  const channel = await User.aggregate([
    {
      $match: {
        username: username?.toLowerCase(),
      },
    },
    {
      $lookup: {
        from: "subscriptions",
        localField: "_id",
        foreignField: "channel",
        as: "subscribers", // how many subscribers this user has
      },
    },
    {
      $lookup: {
        from: "subscriptions",
        localField: "_id",
        foreignField: "subscriber",
        as: "subscribedTo", // how many channels this user has subscribed to
      },
    },
    {
      $addFields: {
        subSubscriberCount: {
          $size: "$subscribers",
        },
        channelSubscribedToCount: {
          $size: "$subscribedTo",
        },
        isSubscribed: {
          $cond: {
            if: { $in: [req.user?._id, "$subscribers.subscriber"] },
            then: true,
            else: false,
          },
        },
      },
    },
    {
      $project: {
        fullName: 1,
        username: 1,
        subSubscriberCount: 1,
        channelSubscribedToCount: 1,
        isSubscribed: 1,
        avatar: 1,
        coverImage: 1,
        email: 1,
      },
    },
  ]);

  if (!channel?.length) {
    throw new ApiError(404, "channel does not exists");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, "user channel fated successfully", channel[0]));
});

const getWatchHistory = asynchandler(async (req, res) => {
  const user = await User.aggregate([
    {
      $match: {
        // _id: req.user._id,
        _id: new mongoose.Types.ObjectId(req.user._id),
      },
    },
    {
      $lookup: {
        from: "videos",
        localField: "watchHistory",
        foreignField: "_id",
        as: "watchHistory",
        pipeline: [
          {
            $lookup: {
              from: "users",
              localField: "owner",
              foreignField: "_id",
              as: "owner",
              pipeline: [
                {
                  $project: {
                    fullName: 1,
                    username: 1,
                    avatar: 1,
                  },
                },
              ],
            },
          },
          {
            $addFields: {
              owner: {
                $first: "$owner",
              },
            },
          },
        ],
      },
    },
  ]);

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        "watch History fetched Successfullly ",
        user[0].watchHistory
      )
    );
});

export {
  getAllUser,
  registerUser,
  loginUser,
  logoutUser,
  refreshTokenAccess,
  changeCurrentPassword,
  getCurrentUser,
  updateAccountDetails,
  updateUserAvatar,
  updateUsercoverImage,
  getUserchannelProfile,
  getWatchHistory,
};
