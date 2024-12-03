const router = require('express').Router()
const { checkLogin } = require("../middlewares/verifyLogin");
let connectDB = require('../utils/database.js')
const { ObjectId } = require('mongodb')
const asyncHandler = require('express-async-handler')

let db
connectDB.then((client) => {
    db = client.db('forum')
})

router.use(checkLogin)

router.route('/security')
    .get((req, res) => {
        res.render('user/mypage/security.ejs', { message: null });
    })
    .put(asyncHandler(async (req, res) => {
        const user = await db.collection('users').findOne({ _id: req.user._id });
        
        if (req.body.changePW1 === req.body.changePW2) {
            if (await bcrypt.compare(req.body.currentPW, user.password)) {
                const hash = await bcrypt.hash(req.body.changePW1, 10);

                await db.collection('users').updateOne({ _id: req.user._id }, {
                    $set: { password: hash }
                });

                req.logout((err) => {
                    if (err) {
                        return next(err);
                    }
                    res.render('user/mypage/security.ejs', { message: "Password changed successfully. Please log in with your new password." });
                });
            } else {
                res.render('user/mypage/security.ejs', { message: "Current password does not match." });
            }
        } else {
            res.render('user/mypage/security.ejs', { message: "New passwords do not match." });
        }
    }));

    router.route('/likes-list').get(asyncHandler(async (req, res) => {
        const userResult = await db.collection('users').findOne({
            _id: req.user._id
        })
        let likes = userResult.likes
        let likedPosts = []
        for (let like of likes) {
            const post = await db.collection('posts').findOne({
                _id: new ObjectId(like)
            })
            if (post) {
                likedPosts.push(post)
            }
        }

        res.render('user/mypage/likes-list.ejs', {likes: likedPosts}) // likes = array
    }))

    router.delete('/likes/:id', asyncHandler(async (req, res) => {
        let result = await db.collection('users').updateOne({
            _id: req.user._id
        }, {
            $pull: {likes: new ObjectId(req.params.id)}
        })
        if (result.modifiedCount > 0) {
            res.status(200).json({ message: "Removed successfully." });
        } else {
            res.status(400).json({ message: "Failed to remove." });
        }
    }))



module.exports = router;