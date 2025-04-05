import { apiError } from "../utils/apiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import jwt from 'jsonwebtoken';
import { FarmOwner } from "../../models/farmOwner.model.js";
import { User } from "../../models/user.model.js";
import { apiResponse } from "../utils/apiResponse.js";

export const verifyJWT = asyncHandler(async(req, res, next) => {

    try {
        
        const token = req.cookies?.accessToken ||
        req.header('Authorization')?.
        replace("Bearer ","");
    
        if(!token) throw new apiError(401, 'unauthorized access');
    
        const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

        if(!decodedToken) throw new apiError(401, 'still unauthorized access');

        if(req.baseUrl === '/api/v1/farmowner')
        {
            const farmowner = await FarmOwner.findById(decodedToken._id)
            .select("-refreshToken -password");
    
            if(!farmowner) throw new apiError(401, 'invalid access token');
    
            req.farmowner = farmowner;
        }
        
        if(req.baseUrl === '/api/v1/user')
        {
            const user = await User.findById(decodedToken._id)
            .select("-refreshToken -password");
    
            if(!user) throw new apiError(401, 'invalid access token');
    
            req.user = user;
        }
        
        next();

    } catch (error) {
       return res
       .status(error.statusCode)
       .json(
        new apiResponse(error.statusCode, null, error.message)
       )
    }

});