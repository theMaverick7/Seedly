import jwt from "jsonwebtoken";
import { apiError } from "../utils/apiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { FarmOwner } from "../../models/farmOwner.model.js";
import { User } from "../../models/user.model.js";

export const verifyJWT = asyncHandler(async (req, res, next) => {
    const token =
        req.cookies?.accessToken ||
        req.header("Authorization")?.replace("Bearer ", "");

    if (!token) {
        throw new apiError(401, "Unauthorized access");
    }

    let decodedToken;
    try {
        decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    } catch (err) {
        throw new apiError(401, "Invalid or expired access token");
    }

    if (!decodedToken) {
        throw new apiError(401, "Unauthorized access");
    }

    if (req.baseUrl === "/api/v1/farmowner") {
        const farmowner = await FarmOwner.findById(decodedToken._id).select(
            "-refreshToken -password"
        );
        if (!farmowner) {
            throw new apiError(401, "Invalid access token");
        }
        req.farmowner = farmowner;
    } else if (req.baseUrl === "/api/v1/user") {
        const user = await User.findById(decodedToken._id).select(
            "-refreshToken -password"
        );
        if (!user) {
            throw new apiError(401, "Invalid access token");
        }
        req.user = user;
    }

    next();
});