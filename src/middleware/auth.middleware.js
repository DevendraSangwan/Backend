import jwt from 'jsonwebtoken'; //using jwt also in jwt.verify 
import {ApiError} from '../utils/ApiError.js';
import asyncHandler from '../utils/asyncHandler.js';
import {User} from '../models/user.models.js';
export const verifyJWT=asyncHandler(async(req,_,next)=>{
    try{
const token=req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ","")
    if(!token){
        throw new ApiError("Unauthrization request",401)
    }
   const decodedToken=jwt.verify(token,process.env.ACCESS_TOKEN_SECRET)
   const user=await User.findById(decodedToken._id).select("-password -refreshToken")
   if(!user){
    throw new ApiError("User not found",404)
   }
   req.user=user
   next()

    }catch(err){
        throw new ApiError(401,err?.message || "Invalid token");
    }
})