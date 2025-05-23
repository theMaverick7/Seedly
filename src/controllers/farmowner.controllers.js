import { asyncHandler } from '../utils/asyncHandler.js';
import { apiError } from '../utils/apiError.js';
import { apiResponse } from '../utils/apiResponse.js';
import { FarmOwner } from '../../models/farmOwner.model.js';
import { uploadOnCloudinary, deleteFile } from '../utils/cloudinary.js';
import { tokenGen } from '../utils/jwtGen.js';
import jwt from 'jsonwebtoken';
import { Farm } from '../../models/farm.model.js';
import { Product } from '../../models/product.model.js';
import mongoose from 'mongoose';

const cookieOptions = {
    httpOnly: true,
    secure: true,
};

// Create Farmowner
const createFarmowner = asyncHandler(async (_, res) => {
    const userData = res.locals.validatedTextValues;
    const avatar = res.locals.validatedFile;

    const existingFarmowner = await FarmOwner.findOne({
        $or: [{ username: userData.username }, { email: userData.email }],
    });

    if (existingFarmowner) throw new apiError(500, 'farmowner already exist');

    let userAvatar, cloudUpload = null;
    if (avatar){
        cloudUpload = await uploadOnCloudinary(avatar.path);
        userAvatar = {
            url: cloudUpload?.url,
            public_id: cloudUpload?.public_id
        }
    }

    const newFarmowner = await FarmOwner.create({
        ...userData,
        avatar: userAvatar
    });

    const theFarmowner = await FarmOwner.findById(newFarmowner._id).select('-refreshToken -password');
    if (!theFarmowner) throw new apiError(500, 'farmowner creation failed');

    console.log('Farmowner created successfully', theFarmowner);
    return res.status(200).json(
        new apiResponse(200, theFarmowner, 'farmowner created successfully')
    );
});

// Login Farmowner
const loginFarmowner = asyncHandler(async (_, res) => {
    const userData = res.locals.validatedTextValues;

    const foundOwner = await FarmOwner.findOne({
        $or: [{ username: userData.identifier }, { email: userData.identifier }],
    });
    if (!foundOwner) throw new apiError(400, 'Farmowner not found');

    const isPswdCorrect = await foundOwner.validatePassword(userData.password);
    if (!isPswdCorrect) throw new apiError(400, 'incorrect password');

    const { accessToken, refreshToken } = await tokenGen(foundOwner);

    const loggedFarmowner = await FarmOwner.findById(foundOwner._id).select('-refreshToken -password');

    return res
        .status(200)
        .cookie('accessToken', accessToken, cookieOptions)
        .cookie('refreshToken', refreshToken, cookieOptions)
        .json(
            new apiResponse(
                200,
                { farmowner: loggedFarmowner, accessToken, refreshToken },
                'Farmowner logged in successfully'
            )
        );
});

// Logout Farmowner
const logoutFarmowner = asyncHandler(async (req, res) => {
    await FarmOwner.findByIdAndUpdate(req.farmowner._id, { $set: { refreshToken: null } }, { new: true });

    return res
        .status(200)
        .clearCookie('accessToken', cookieOptions)
        .clearCookie('refreshToken', cookieOptions)
        .json(new apiResponse(200, {}, 'farmowner logged out'));
});

// Refresh Access Token
const refreshAccessToken = asyncHandler(async (req, res) => {
    const refresh_token = req.cookies?.refreshToken || req.body?.refreshToken;
    if (!refresh_token) throw new apiError(401, 'unauthorized access');

    const decodedToken = jwt.verify(refresh_token, process.env.REFRESH_TOKEN_SECRET);
    if (!decodedToken) throw new apiError(401, 'invalid token');

    const theFarmowner = await FarmOwner.findById(decodedToken?._id);
    if (!theFarmowner) throw new apiError(500, 'farmowner not found');
    if (theFarmowner.refreshToken !== refresh_token) throw new apiError(500, 'refresh token unmatched');

    const { accessToken, newRefreshToken } = await tokenGen(theFarmowner);

    return res
        .status(200)
        .cookie('accessToken', accessToken, cookieOptions)
        .cookie('refreshToken', newRefreshToken, cookieOptions)
        .json(
            new apiResponse(
                200,
                { accessToken, refreshToken: newRefreshToken },
                'new access token generated'
            )
        );
});

// Read Farmowner
const readFarmowner = asyncHandler(async (req, res) => {
    const theFarmowner = req.farmowner;
    console.log(theFarmowner);

    return res.status(200).json(new apiResponse(200, theFarmowner, 'farmowner fetched'));
});

// Change Username
const changeUsername = asyncHandler(async (req, res) => {
    const userData = res.locals.validatedTextValues;

    const updatedFarmowner = await FarmOwner.findByIdAndUpdate(
        req.farmowner._id,
        { $set: { username: userData.username } },
        { new: true }
    );

    if (!updatedFarmowner) throw new apiError(500, 'username update failed');

    return res.status(200).json(new apiResponse(200, updatedFarmowner, 'username changed'));
});

// Change Email
const changeEmail = asyncHandler(async (req, res) => {
    const { currentPassword, newEmail } = res.locals.validatedTextValues;

    const foundFarmowner = await FarmOwner.findById(req.farmowner._id);
    const pswdCheck = await foundFarmowner.validatePassword(currentPassword);
    if (!pswdCheck) throw new apiError(401, 'password not correct');

    foundFarmowner.email = newEmail;
    await foundFarmowner.save({ validateBeforeSave: false });

    return res.status(200).json(new apiResponse(200, {}, 'email changed successfully'));
});

// Change Fullname
const changeFullname = asyncHandler(async (req, res) => {
    const { currentPassword, newFullname } = res.locals.validatedTextValues;

    const foundFarmowner = await FarmOwner.findById(req.farmowner._id);
    const pswdCheck = await foundFarmowner.validatePassword(currentPassword);
    if (!pswdCheck) throw new apiError(401, 'password not correct');

    foundFarmowner.fullname = newFullname;
    await foundFarmowner.save({ validateBeforeSave: false });

    return res.status(200).json(new apiResponse(200, {}, 'fullname changed successfully'));
});

// Change Password
const changePassword = asyncHandler(async (req, res) => {
    const { currentPassword, newPassword } = res.locals.validatedTextValues;

    const foundFarmowner = await FarmOwner.findById(req.farmowner._id);
    const pswdCheck = await foundFarmowner.validatePassword(currentPassword);
    if (!pswdCheck) throw new apiError(401, 'password not correct');

    foundFarmowner.password = newPassword;
    await foundFarmowner.save({ validateBeforeSave: false });

    return res.status(200).json(new apiResponse(200, {}, 'password changed successfully'));
});

// Delete Avatar
const deleteAvatar = asyncHandler(async (req, res) => {
    const cloudId = req.farmowner.avatar?.public_id;

    const updatedFarmowner = await FarmOwner.updateOne(
        { _id: req.farmowner._id },
        { $set: { avatar: null } },
        { new: true }
    );

    await deleteFile(cloudId);

    return res.status(200).json(new apiResponse(200, updatedFarmowner, 'avatar deleted'));
});

// Change Avatar
const changeAvatar = asyncHandler(async (req, res) => {
    const avatar = res.locals.validatedFile;
    const cloudUpload = await uploadOnCloudinary(avatar.path);

    if (!cloudUpload) throw new apiError(500, 'image upload failed');

    const updatedFarmowner = await FarmOwner.findByIdAndUpdate(
        req.farmowner._id,
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

    return res.status(200).json(new apiResponse(200, updatedFarmowner, 'avatar changed'));
});

// Delete Farmowner
const deleteFarmowner = asyncHandler(async (req, res) => {
    let deletedFarms, deletedProducts;
    const session = await mongoose.startSession();

    try {
        await session.withTransaction(async () => {
            const deletedFarmowner = await FarmOwner.findByIdAndDelete(req.farmowner._id, { session });
            if (deletedFarmowner.avatar) await deleteFile(deletedFarmowner.avatar.public_id, { session });

            const farmids = deletedFarmowner.farms;
            deletedFarms = await Farm.deleteMany({ createdBy: deletedFarmowner._id }, { session });
            deletedProducts = await Product.deleteMany({ createdBy: { $in: farmids } }, { session });

            console.log('farmowner deleted successfully');
            console.log(`farms deleted: ${deletedFarms.deletedCount}`);
            console.log(`products deleted: ${deletedProducts.deletedCount}`);
        });
        await session.endSession();

        return res.status(200).json(new apiResponse(200, {}, 'farmowner deleted successfully'));
    } catch (error) {
        await session.endSession();
        throw new apiError(500, `error deleting farmowner: ${error.message}`);
    }
});

export {
    createFarmowner,
    readFarmowner,
    loginFarmowner,
    logoutFarmowner,
    refreshAccessToken,
    changeUsername,
    changeFullname,
    changeEmail,
    changePassword,
    changeAvatar,
    deleteAvatar,
    deleteFarmowner
};
