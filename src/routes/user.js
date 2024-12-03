const router = require('express').Router()
const bcrypt = require('bcrypt')
let connectDB = require('../utils/database.js')
const passport = require('../utils/passport.js');
const asyncHandler = require('express-async-handler')

let db
connectDB.then((client) => {
    db = client.db('forum')
})

router.route('/login').get((req, res) => {
    res.render('user/login.ejs')
}).post((req, res, next) => {
    passport.authenticate('local', (err, user, info) => {
        if (err) return res.status(500).json(err)
        if (!user) return res.status(401).json(info.message)
        req.logIn(user, () => {
            if (err) return next(err)
            res.redirect('/')
        })
    })(req, res, next)
})

router.route('/register').get((req, res) => {
    res.render('user/register.ejs')
}).post(asyncHandler(async (req, res) => {
    const userFindResult = await db.collection('users').findOne({
        username: req.body.username
    })
    if (userFindResult) {
        res.status(404).send('username already in use')
    } else {
        let hash = await bcrypt.hash(req.body.password, 10)
        const registerResult = await db.collection('users').insertOne({
            username: req.body.username,
            password: hash,
            likes: [],
            chatRooms: []
        })
        const user = { _id: registerResult.insertedId, username: req.body.username }
        req.logIn(user, (err) => {
            if (err) return res.status(500).send("Login failed")
            res.redirect('/')
        })
    }
}))

router.get('/logout', (req, res) => {
    req.logout((err) => {
        if (err) {
            return next(err);
        }
        res.redirect('/');
    });
});

router.use('/mypage', require('./mypage.js'))

module.exports = router;