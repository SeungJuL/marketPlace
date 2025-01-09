const expressAsyncHandler = require("express-async-handler");
const ChatModel = require("../models/chatModel");
const ChatService = require("../services/chatService");
const { ObjectId } = require('mongodb');

const getChatList = expressAsyncHandler(async (req, res, next) => {
    try {
        const chatResult = await ChatModel.getChatsByUserId(req.user._id);
        res.render('chat/list.ejs', { chats: chatResult });
    } catch (err) {
        next(err);
    }
})

const getChatDetail = expressAsyncHandler(async (req, res, next) => {
    try {
        const chatId = new ObjectId(req.params.id);
        const { chatResult, messageResult, users } = await ChatService.getChatDetail(chatId);
        res.render('chat/detail.ejs', { chat: chatResult, messages: messageResult, currentUser: req.user, users: users });
    } catch (err) {
        next(err);
    }

})

const getChat = expressAsyncHandler(async (req, res, next) => {
    try {
        const postId = req.params.id;
        const Users = {
            user1: new ObjectId(req.query.postUserId),
            user2: req.user._id,
        };
        let chatResult = await ChatService.findOrCreateChat(postId, Users);
        return res.redirect('/chat/detail/' + chatResult);
    } catch (err) {
        next(err);
    }
})

module.exports = { getChatList, getChatDetail, getChat }