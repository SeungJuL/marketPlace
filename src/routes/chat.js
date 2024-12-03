const router = require('express').Router()
let connectDB = require('../utils/database.js')
const {ObjectId} = require('mongodb')
const asyncHandler = require('express-async-handler')
const { checkLogin } = require('../middlewares/verifyLogin.js')

let db
connectDB.then((client) => {
    db = client.db('forum')
}).catch((err) => {
    console.log(err)
})

router.use(checkLogin)

router.get('/list', asyncHandler(async (req, res) => {
    const chatResult = await db.collection('chats').find({
        users: req.user._id
    }).toArray()
    res.render('chat/list.ejs', {chats: chatResult})
}))

router.get('/detail/:id', asyncHandler(async (req, res) => {
    const chatResult = await db.collection('chats').findOne({
        _id: new ObjectId(req.params.id)
    })
    const messageResult = await db.collection('chatMessages').find({
        chatId: new ObjectId(chatResult._id)
    }).toArray()
    let users = []
    for(var i = 0; i < chatResult.users.length; i++) {
        user = await db.collection('users').findOne({
            _id: chatResult.users[i]
        })
        users.push(user)
    }
    res.render('chat/detail.ejs', {chat: chatResult, messages: messageResult, currentUser: req.user, users: users})
}))


// id = postId
router.get('/:id', asyncHandler(async (req, res) => {
    // 1. if chat already exist?
    // redirect to existing chat room
    // 2. if not -> create one and redirect 
    // check if the char-room exist
    let chatResult = await db.collection('chats').findOne({
        postId: new ObjectId(req.params.id),
        users: {$all: [new ObjectId(req.query.postUserId), req.user._id]}
    })
    if(chatResult) {
        res.redirect('/chat/detail/' + chatResult._id)
    } else {
        let postTitle = await db.collection('posts').findOne({
            _id: new ObjectId(req.params.id)
        })

        let insertChatResult = await db.collection('chats').insertOne({
            postId: new ObjectId(req.params.id),
            postTitle: postTitle.title,
            users: [new ObjectId(req.query.postUserId), req.user._id],
            date: new Date()
        })
        res.redirect('/chat/detail/' + insertChatResult.insertedId)
    }
}))




module.exports = router;