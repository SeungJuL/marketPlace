const CustomError = require('../utils/customError.js');
const PostModel = require('../models/postModel.js');
const fs = require('fs');
const { UserModel } = require('../models/userModel.js');

class PostService {
    static createPost = async (postData, userData) => {
        if (!postData.title) {
            return CustomError("title are required", 400);
        } else if (!postData.content) {
            return CustomError("content are required", 400);
        } else {
            const postResult = await PostModel.createPost(postData, userData);
            return postResult.acknowledged;
        }
    }

    static getList = async (searchKey, page) => {
        let postResult
        let totalPages
        if (searchKey) {
            let filter = [
                {
                    $search: {
                        index: 'title_index',
                        text: { query: searchKey, path: 'title' }
                    }
                },
                { $sort: { date: -1 } },
                { $skip: (page - 1) * 5 },
                { $limit: 5 }
            ]
            postResult = await PostModel.getListBySearch(filter);
            let countFilter = [
                {
                    $search: {
                        index: 'title_index',
                        text: { query: searchKey, path: 'title' }
                    }
                }
            ]
            const count = await PostModel.getListBySearchCount(countFilter);
            totalPages = Math.ceil(count / 5);

        } else {
            postResult = await PostModel.getList(page);
            const count = await PostModel.getListCount();
            totalPages = Math.ceil(count / 5);
        }
        return { postResult, totalPages };
    }
    static getDetail = async (postId, userId) => {
        const postResult = await PostModel.getPostByPostId(postId);
        const userResult = await UserModel.getUserByUserId(userId);
        return { postResult, userResult };
    }

    static deletePost = async (postId, userId) => {
        const post = await PostModel.getPostByPostId(postId);
        if (!post) {
            throw new CustomError('Post not found', 400);
        }
        if (post.image) {
            const imagePath = post.image;
            fs.unlink(imagePath, (err) => {
                if (err) {
                    throw new CustomError('Failed to delete the post. Server Error', 500);
                }
            });
        }
        if (post.userId.toString() !== userId.toString()) {
            throw new CustomError('Deleting post only can be done by author', 400);
        }

        let deleteResult = PostModel.deletePostByPostId(postId);
        if (deleteResult.deletedCount === 0) {
            throw new CustomError('Not authorized to delete this post');
        }
    }

    static updatePost = async (newPostData, userId) => {
        const post = await PostModel.getPostByPostId(newPostData.postId);
        if (!post) {
            throw new CustomError('Post not found', 400);
        }
        if (post.image) {
            const imagePath = post.image;
            fs.unlink(imagePath, (err) => {
                if (err) {
                    throw new CustomError('Failed to edit the post. Server Error', 500);
                }
            });
        }

        if (post.userId.toString() !== userId.toString()) {
            throw new CustomError('Editing post only can be done by author', 400);
        }

        const updateResult = await PostModel.updatePost(newPostData);
        if (updateResult.modifiedCount === 0) {
            throw new CustomError('Not authorized to update this post', 400);
        }
    }

    static updateLike = async (postId, userId) => {
        const updateResult = await PostModel.updateLike(postId, userId);
        if (updateResult.modifiedCount === 0) {
            throw new CustomError('Update Like failed', 400);
        }
    }
    static deleteLike = async (postId, userId) => {
        const deleteResult = await PostModel.deleteLike(postId, userId);
        if (deleteResult.modifiedCount === 0) {
            throw new CustomError('Delete Like failed', 400);
        }
    }

}

module.exports = PostService