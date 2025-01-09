const PostModel = require("../models/postModel");
const { UserModel } = require("../models/userModel");
const CustomError = require("../utils/customError");
const { ObjectId } = require('mongodb');

class MypageService {
    static updatePW = async (newPW, currentPW, userId) => {
        const user = await UserModel.getUserByUserId(userId);
        if (newPW.password1 !== newPW.password2) {
            throw new CustomError('New passwords do not match', 400);
        }
        if (!await bcrypt.compare(currentPW, user.password)) {
            throw new CustomError('Current password does not match.', 400);
        }
        const hash = await bcrypt.hash(req.body.changePW1, 10);
        const updateResult = await UserModel.updatePW(userId, hash);
        if (updateResult.modifiedCount === 0) {
            throw new CustomError('Not authorized to update password', 400);
        }
    }

    static getLikes = async (userId) => {
        const userResult = await UserModel.getUserByUserId(userId);
        let likes = userResult.likes
        let likedPosts = []
        for (let like of likes) {
            const post = await PostModel.getPostByPostId(new ObjectId(like));
            if (post) {
                likedPosts.push(post);
            }
        }
        return likedPosts;
    }

    static removeLike = async (postId, userId) => {
        removeResult = await UserModel.removeLike(postId, userId);
        if (removeResult.modifiedCount > 0) {
            return;
        } else {
            throw new CustomError('Failed to remove.', 400);
        }
    }
}

module.exports = MypageService;