import { apiError } from "../utils/apiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import jwt from 'jsonwebtoken';
import { FarmOwner } from "../../models/farmOwner.model.js";

export const verifyJWT = asyncHandler(async(req, _, next) => {

    try {
        
        const token = req.cookies?.accessToken ||
        req.header('Authorization')?.
        replace("Bearer ","");
    
        if(!token) throw new apiError(401, 'unauthorized access');
    
        const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    
        const farmowner = await FarmOwner.findById(decodedToken._id)
        .select("-refreshToken -password");
    
        if(!farmowner) throw new apiError(401, 'invalid access token');
    
        req.farmowner = farmowner;
        next();

    } catch (error) {
        console.log(error);
    }

});