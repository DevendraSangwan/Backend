import mongoose from "mongoose"
import {Video} from "../models/video.model.js"
import {Subscription} from "../models/subscription.model.js"
import {Like} from "../models/like.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"

const getChannelStats = asyncHandler(async (req, res) => {
    // TODO: Get the channel stats like total video views, total subscribers, total videos, total likes etc.
      const userId = req.user?._id;

    if (!userId) {
        throw new ApiError(401, "User is not authenticated");
    }

    const totalVideos = await Video.countDocuments({
        owner: userId
    });

    const totalViews = await Video.aggregate([
        {
            $match: {
                owner: new mongoose.Types.ObjectId(userId)
            }
        },
        {
            $group: {
                _id: null,
                totalViews: {
                    $sum: "$views"
                }
            }
        }
    ]);

    const totalSubscribers = await Subscription.countDocuments({
        channel: userId
    });

    const videoIds = await Video.find({
        owner: userId
    }).select("_id");

    const totalLikes = await Like.countDocuments({
        video: {
            $in: videoIds.map(video => video._id)
        }
    });

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                {
                    totalVideos,
                    totalViews: totalViews[0]?.totalViews || 0,
                    totalSubscribers,
                    totalLikes
                },
                "Channel stats fetched successfully"
            )
        );
})

const getChannelVideos = asyncHandler(async (req, res) => {
    // TODO: Get all the videos uploaded by the channel
       const userId = req.user?._id;

    if (!userId) {
        throw new ApiError(401, "User is not authenticated");
    }

    const videos = await Video.find({
        owner: userId
    })
        .sort({
            createdAt: -1
        });

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                videos,
                "Channel videos fetched successfully"
            )
        );
})

export {
    getChannelStats, 
    getChannelVideos
    }