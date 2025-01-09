const expressAsyncHandler = require("express-async-handler");
const MypageService = require("../services/mypageService");
const { ObjectId } = require('mongodb');

const getSecurity = (req, res) => {
    res.render('user/mypage/security.ejs', { message: ""});
};

const updatePassword = expressAsyncHandler(async (req, res, next) => {
    try {
        const newPW = {
            password1: req.body.changePW1,
            password2: req.body.changePW2,
        };
        const currentPW = req.body.currentPW;
        await MypageService.updatePW(newPW, currentPW, req.user._id);
        req.logout((err) => {
            if (err) {
                return next(err);
            }
            res.render('user/mypage/security.ejs', { message: "Password changed successfully. Please log in with your new password." });
        });
    } catch (err) {
        next(err);
    }
});

const getLikes = expressAsyncHandler(async (req, res, next) => {
    try {
        const likedPosts = await MypageService.getLikes(req.user._id);
        res.render('user/mypage/likes.ejs', { likes: likedPosts }) // likes = array
    } catch (err) {
        next(err);
    }
});



const removeLike = expressAsyncHandler(async (req, res, next) => {
    const postId = newObjectId(req.params.id);
    const userId = req.user._id;
    try {
        await MypageService.removeLike(postId, userId); 
        res.status(200).json({ message: "Removed successfully." });
    } catch (err) {
        next(err);
    }
})

module.exports = { getSecurity, updatePassword, getLikes, removeLike}