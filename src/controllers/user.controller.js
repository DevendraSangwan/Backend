import asyncHandler from '../utils/asyncHandler.js';
import {ApiError} from '../utils/ApiError.js';
import {User} from '../models/user.models.js';
import uploadOnCloundinary from '../utils/cloudinary.js';
import {ApiResponse} from '../utils/ApiResponse.js';
import jwt from "jsonwebtoken"

const generateAccessAndRefreshTokens=async(userId)=>{
try{
    const user=await User.findById(userId)
    const accessToken=user.generateAccessToken()
    const refreshToken=user.generateRefreshToken()

    user.refreshToken=refreshToken
    await user.save({validateBeforeSave:false})

    return {accessToken, refreshToken}
}catch(err){
  console.log("error:",err)
    throw new ApiError(500,"Token generation failed");
  }
}

const registerUser=asyncHandler(async(req,res,next)=>{
  // Step-1 get user details from frontend
  const {fullName,email,username,password} = req.body;
//   console.log(fullName,email,username,password);

  // Step-2 validation of user details - not empty
  if(fullName=="" || email=="" || username=="" || password==""){
    throw new ApiError("All fields are required",400);
  }

  // Step-3 check if user already exists in database:email, username
const existedUser = await User.findOne({
    $or:[{email},{username}]
})

if(existedUser){
    throw new ApiError("User already exists",409);
  }

  // Step-4 check for images,check for avatar
const avatarLocalPath=req.files?.avatar[0]?.path
// const coverImageLocalPath=req.files?.coverImage[0]?.path

let coverImageLocalPath;
if(req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length > 0){
    coverImageLocalPath=req.files.coverImage[0].path
}//we do it because if user don't send cover image then it will be undefined and we will get error while accessing path property of undefined

if(!avatarLocalPath){
    throw new ApiError("Avatar is required",400);
  }

  // Step-5 upload then to cloudinary and get the url of image
 const avatar=await uploadOnCloundinary(avatarLocalPath)
 const coverImage=await uploadOnCloundinary(coverImageLocalPath)

  //Step-6 create user object -create entry in db
if(!avatar){
    throw new ApiError("Avatar upload failed",500);
  }

const user=await User.create({
    fullName,
    avatar:avatar.url,
    coverImage:coverImage?.url || "",
    email,
    username:username.toLowerCase(),
    password

})
  //Step-7 remove password and refresh token feils from response
 const createdUser=await User.findById(user._id).select("-password -refreshToken");


  //Step-8 check for user creation
if(!createdUser){
    throw new ApiError("User creation failed",500);
  }

  //Step-9 return response/error
  return res.status(201).json(
    new ApiResponse(200 , createdUser,"User registered successfully")
  )

})

const loginUser=asyncHandler(async(req,res,next)=>{
     //step-1 req body ->data
const{email,username,password}=req.body

     //step-2 username or email check 
if(!(email || username)){
    throw new ApiError("Email or username is required",400);
  }

     //step-3 find user
const user=await User.findOne({
    $or:[{email},{username}]
})

if(!user){
    throw new ApiError("User not found",404);
  }

     //step-4 check for password
const isPasswordValid=await user.isPasswordCorrect(password)
 
if(!isPasswordValid){
    throw new ApiError("Invalid password",401);
  }

     //step-5 access token and refresh token
const {accessToken, refreshToken}=await generateAccessAndRefreshTokens(user._id)

     //step-6 send cookies 
const loggedInUser=await User.findById(user._id).select("-password -refreshToken")

const options={
  httpOnly:true,
  secure:true
}

     //step-7 send response
     return res
     .status(200)
     .cookie("accessToken",accessToken,options)
     .cookie("refreshToken",refreshToken,options)
     .json(
      new ApiResponse(200,{
        user:loggedInUser,
        accessToken,
        refreshToken
      },"User logged in successfully")
     )


  
})
const logoutUser=asyncHandler(async(req,res)=>{
  //step-1 
  await User.findByIdAndUpdate(req.user._id,
    {
      $set:{
            refreshToken:undefined}
    },{new:true}) 

const options={
  httpOnly:true,
  secure:true
}

return res.status(200).clearCookie("accessToken",options).clearCookie("refreshToken",options).json(
  new ApiResponse(200,{},"User logged in successfully")
)

})

const refreshAccessToken=asyncHandler(async(req,res)=>{
  const incomingRefreshToken=req.cookies.refreshToken || req.body.refreshToken
  if(!incomingRefreshToken){
    throw new ApiError(401,"unauthorized request")
  }
  try{const decodedToken=jwt.verify(
    incomingRefreshToken,
    process.env.REFRESH_TOKEN_SECRET)
  
  const user= await User.findById(decodedToken?._id)
  if(!user){
    throw new ApiError(401,"Invalid user token")
  }

if(incomingRefreshToken !== user?.refreshToken){
  throw new ApiError(401,"Refresh token is expired or used")
}

const options={
  httpOnly:true,
  secure:true
}
 const {accessToken,newRefreshToken}=await generateAccessAndRefreshTokens(user._id)

return res
.status(200)
.cookie("accessToken",accessToken,options)
.cookie("refreshToken",newRefreshToken,options)
.json(
  new ApiResponse(
    200,
    {accessToken,refreshToken:newRefreshToken},
    "Access token refresh "
  )
)}

catch(err){
  throw new ApiError(401,err?.message ||"Invalid refrsh token")
}

})
export {registerUser,loginUser,logoutUser,refreshAccessToken};
