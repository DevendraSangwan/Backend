import asyncHandler from '../utils/asyncHandler.js';
import {ApiError} from '../utils/ApiError.js';
import {User} from '../models/user.model.js';
import {uploadOnCloundinary} from '../utils/cloudinary.js';
import {ApiResponse} from '../utils/ApiResponse.js';

const registerUser=asyncHandler(async(req,res,next)=>{
  //get user details from frontend
  const {fullName,email,username,password} = req.body;
  console.log(fullName,email,username,password);

  //validation of user details - not empty
  if(fullName=="" || email=="" || username=="" || password==""){
    throw new ApiError("All fields are required",400);
  }

  //check if user already exists in database:email, username
const existedUser = await User.findOne({
    $or:[{email},{username}]
})

if(existedUser){
    throw new ApiError("User already exists",409);
  }

  //check for images,check for avatar
const avatarLocalPath=req.files?.avatar[0]?.path
const coverImageLocalPath=req.files?.coverImage[0]?.path
if(!avatarLocalPath){
    throw new ApiError("Avatar is required",400);
  }

  //upload then to cloudinary and get the url of image
 const avatar=await uploadOnCloundinary(avatarLocalPath)
 const coverImage=await uploadOnCloundinary(coverImageLocalPath)

  //create user object -create entry in db
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
  //remove password and refresh token feils from response
 const createdUser=await User.findById(user._id).select("-password -refreshToken");


  //check for user creation
if(!createdUser){
    throw new ApiError("User creation failed",500);
  }

  //return response/error
  return res.status(201).json(
    new ApiResponse(200 , createdUser,"User registered successfully")
  )

})

export {registerUser}
