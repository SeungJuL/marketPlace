const expressAsyncHandler = require("express-async-handler");
const PostService = require("../services/postService");
const PostModel = require("../models/postModel");
const { ObjectId } = require('mongodb');

const getCreatePost = async (req, res) => {
    res.render('post/create-post.ejs');
};

const postCreatePost = expressAsyncHandler(async (req, res, next) => {
    try {
        postData = {
            title: req.body.title,
            content: req.body.content,
            image: req.file ? req.file.path : '',
            date: new Date(),
        };
        userData = {
            userId: req.user._id,
            username: req.user.usernamme,
        };
        if (await PostService.createPost(postData, userData)) {
            res.redirect('/api/post/list');
        }
    } catch (err) {
        next(err);
    }
});

const getPostList = expressAsyncHandler(async (req, res, next) => {
    try {
        const { searchKey = '', page = 1 } = req.query
        const { postResult, totalPages } = await PostService.getList(searchKey, page);
        res.render('post/list.ejs', {
            posts: postResult ? postResult : null,
            user: req.user ? req.user : null,
            totalPages: totalPages,
            searchKey: searchKey,
            page: page,
        });
    } catch (err) {
        next(err);
    }
});

const getPostDetail = expressAsyncHandler(async (req, res, next) => {
    try {
        const postId = new ObjectId(req.params.id);
        const userId = req.user._id;
        const { postResult, userResult } = await PostService.getDetail(postId, userId);
        res.render('post/detail.ejs', { post: postResult, user: userResult ? userResult : null })
    } catch (err) {
        next(err);
    }
});

const deletePost = expressAsyncHandler(async (req, res, next) => {
    try {
        const postId = new ObjectId(req.params.id);
        const userId = req.user._id;
        await PostService.deletePost(postId, userId);
        res.redirect('/api/post/list');
    } catch (err) {
        next(err);
    }
});

const getEditPost = expressAsyncHandler(async (req, res, next) => {
    try {
        let postResult = await PostModel.getPostByPostId(new ObjectId(req.params.id));
        res.render('post/edit.ejs', { post: postResult })
    } catch (err) {
        next(err)
    }

});

const updateEditPost = expressAsyncHandler(async (req, res, next) => {
    try {
        const newPostData = {
            postId: new ObjectId(req.params.id),
            title: req.body.title,
            content: req.body.content,
            file: req.file,
        }
        await PostService.updatePost(newPostData, req.user._id);
        res.redirect('/api/post/list');
    } catch (err) {
        next(err);
    }
})

const updateLike = expressAsyncHandler(async (req, res, next) => {
    try {
        const postId = new ObjectId(req.params.id);
        const userId = req.user._id;
        await PostService.updateLike(postId, userId);
        res.status(200).json({message: "liked success"})
    } catch (err) {
        next(err)
    }
})

const deleteLike = expressAsyncHandler(async (req, res, next) => {
    try {
        const postId = new ObjectId(req.params.id);
        const userId = req.user._id;
        await PostService.deleteLike(postId, userId);
        res.status(200).json({ message: "unliked success" });
    } catch (err) {
        next(err);
    }
})

module.exports = {
    getCreatePost,
    postCreatePost,
    getPostList,
    getPostDetail,
    deletePost,
    getEditPost,
    updateEditPost,
    updateLike,
    deleteLike,
};