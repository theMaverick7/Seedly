import { asyncHandler } from "../utils/asyncHandler.js";
import { apiError } from "../utils/apiError.js";
import { apiResponse } from "../utils/apiResponse.js";
import { User } from "../../models/user.model.js";
import { uploadOnCloudinary, deleteFile } from "../utils/cloudinary.js";
import { tokenGen } from "../utils/jwtGen.js";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";

const cookieOptions = {
    httpOnly: true,
    secure: true,
};

const createUser = asyncHandler(async (_, res) => {
    const userData = res.locals.validatedTextValues;
    const avatar = res.locals.validatedFile;

    const existingUser = await User.findOne({
        $or: [{ username: userData.username }, { email: userData.email }],
    });
    if (existingUser) throw new apiError(500, "user already exist");

    let cloudUpload = null;
    if (avatar) cloudUpload = await uploadOnCloudinary(avatar.path);
    if (avatar && !cloudUpload) throw new apiError(500, "cloud upload failed");

    const newUser = await User.create({
        ...userData,
        avatar: avatar
            ? {
                    url: cloudUpload?.url || "",
                    public_id: cloudUpload?.public_id || "",
                }
            : undefined,
    });

    const theUser = await User.findById(newUser._id).select("-refreshToken -password");
    if (!theUser) throw new apiError(500, "user registration failed");

    return res.status(200).json(
        new apiResponse(200, theUser, "user registered successfully")
    );
});

const loginUser = asyncHandler(async (_, res) => {
    const userData = res.locals.validatedTextValues;

    const foundUser = await User.findOne({
        $or: [{ username: userData.username }, { email: userData.email }],
    });
    if (!foundUser) throw new apiError(500, "user not found");

    const isPswdCorrect = await foundUser.validatePassword(userData.password);
    if (!isPswdCorrect) throw new apiError(400, "password incorrect");

    const { accessToken, refreshToken } = await tokenGen(foundUser);

    const loggedUser = await User.findById(foundUser._id).select("-refreshToken -password");

    return res
        .status(200)
        .cookie("accessToken", accessToken, cookieOptions)
        .cookie("refreshToken", refreshToken, cookieOptions)
        .json(
            new apiResponse(
                200,
                { user: loggedUser, accessToken, refreshToken },
                "User logged in successfully"
            )
        );
});

const logoutUser = asyncHandler(async (req, res) => {
    await User.findByIdAndUpdate(req.user._id, { $set: { refreshToken: null } });

    return res
        .status(200)
        .clearCookie("accessToken", cookieOptions)
        .clearCookie("refreshToken", cookieOptions)
        .json(new apiResponse(200, {}, "user logged out successfully"));
});

const refreshAccessToken = asyncHandler(async (req, res) => {
    const refresh_token = req.cookies?.refreshToken || req.body?.refreshToken;
    if (!refresh_token) throw new apiError(401, "unauthorized access");

    let decodedToken;
    try {
        decodedToken = jwt.verify(refresh_token, process.env.REFRESH_TOKEN_SECRET);
    } catch {
        throw new apiError(401, "invalid token");
    }

    const theUser = await User.findById(decodedToken?._id);
    if (!theUser) throw new apiError(500, "user not found");

    if (refresh_token !== theUser.refreshToken)
        throw new apiError(401, "tokens unmatched");

    const { accessToken, newRefreshToken } = await tokenGen(theUser);

    return res
        .status(200)
        .cookie("accessToken", accessToken, cookieOptions)
        .cookie("refreshToken", newRefreshToken, cookieOptions)
        .json(
            new apiResponse(
                200,
                { accessToken, refreshToken: newRefreshToken },
                "new access token generated"
            )
        );
});

const readUser = asyncHandler(async (req, res) => {
    return res.status(200).json(new apiResponse(200, req.user, "user fetched"));
});

const changeUsername = asyncHandler(async (req, res) => {
    const { username } = res.locals.validatedTextValues;

    const updatedUser = await User.findByIdAndUpdate(
        req.user._id,
        { $set: { username } },
        { new: true }
    );
    if (!updatedUser) throw new apiError(500, "username update failed");

    return res.status(200).json(new apiResponse(200, updatedUser, "username changed"));
});

const changeFullname = asyncHandler(async (req, res) => {
    const { fullname } = res.locals.validatedTextValues;

    const updatedUser = await User.findByIdAndUpdate(
        req.user._id,
        { $set: { fullname } },
        { new: true }
    );
    if (!updatedUser) throw new apiError(500, "fullname update failed");

    return res.status(200).json(new apiResponse(200, updatedUser, "fullname changed"));
});

const changeEmail = asyncHandler(async (req, res) => {
    const { email } = res.locals.validatedTextValues;

    const existingUser = await User.findOne({ email });
    if (existingUser) throw new apiError(400, "email already in use");

    const updatedUser = await User.findByIdAndUpdate(
        req.user._id,
        { $set: { email } },
        { new: true }
    );
    if (!updatedUser) throw new apiError(500, "email update failed");

    return res.status(200).json(new apiResponse(200, {}, "email changed successfully"));
});

const changePassword = asyncHandler(async (req, res) => {
    const { currentPassword, newPassword } = res.locals.validatedTextValues;

    const foundUser = await User.findById(req.user._id);
    const pswdCheck = await foundUser.validatePassword(currentPassword);
    if (!pswdCheck) throw new apiError(401, "password not correct");

    foundUser.password = newPassword;
    await foundUser.save({ validateBeforeSave: false });

    return res.status(200).json(new apiResponse(200, {}, "password changed successfully"));
});

const changeAvatar = asyncHandler(async (req, res) => {
    const avatar = res.locals.validatedFile;
    const cloudUpload = await uploadOnCloudinary(avatar.path);

    if (!cloudUpload) throw new apiError(500, "image upload failed");

    const updatedUser = await User.findByIdAndUpdate(
        req.user._id,
        {
            $set: {
                avatar: {
                    url: cloudUpload.url,
                    public_id: cloudUpload.public_id,
                },
            },
        },
        { new: true }
    );

    return res.status(200).json(new apiResponse(200, updatedUser, "avatar changed"));
});

const deleteAvatar = asyncHandler(async (req, res) => {
    const cloudId = req.user.avatar?.public_id;

    const updatedUser = await User.findByIdAndUpdate(
        req.user._id,
        { $set: { avatar: null } },
        { new: true }
    );

    if (cloudId) await deleteFile(cloudId);

    return res.status(200).json(new apiResponse(200, updatedUser, "avatar deleted"));
});

const deleteUser = asyncHandler(async (req, res) => {
    const session = await mongoose.startSession();
    try {
        let deletedUser;
        await session.withTransaction(async () => {
            deletedUser = await User.findByIdAndDelete(req.user._id, { session });
            if (deletedUser?.avatar?.public_id) {
                await deleteFile(deletedUser.avatar.public_id);
            }
        });
        await session.endSession();

        return res.status(200).json(new apiResponse(200, {}, "user deleted successfully"));
    } catch (error) {
        await session.endSession();
        throw new apiError(500, `error deleting user: ${error.message}`);
    }
});

export {
    createUser,
    loginUser,
    logoutUser,
    refreshAccessToken,
    readUser,
    changeUsername,
    changeFullname,
    changeEmail,
    changePassword,
    changeAvatar,
    deleteAvatar,
    deleteUser,
};
