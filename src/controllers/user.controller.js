import asyncHandler from '../utils/asyncHandler.js';
import {ApiError} from '../utils/ApiError.js';
import {User} from '../models/user.models.js';
import uploadOnCloundinary from '../utils/cloudinary.js';
import {ApiResponse} from '../utils/ApiResponse.js';

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

export {registerUser}
