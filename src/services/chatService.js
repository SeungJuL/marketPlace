const ChatModel = require('../models/chatModel');
const { UserModel } = require('../models/userModel');
const PostModel = require('../models/postModel');
const CustomError = require('../utils/customError');

class ChatService {
    static getChatDetail = async (chatId) => {
        const chatResult = await ChatModel.getChatByChatId(chatId);
        const messageResult = await ChatModel.getMessagesByChatId(chatId);
        
        let users = [];
        for (var i = 0; i < chatResult.users.length; i++) {
            const user = await UserModel.getUserByUserId(chatResult.users[i]);
            users.push(user);
        }
        return { chatResult, messageResult, users };
    }

    static findOrCreateChat = async (postId, Users) => {
        const chatResult = await ChatModel.getChatByPostIdAndUsers(postId, Users);
        if (chatResult) {
            return chatResult._id;
        } else {
            const postResult = await PostModel.getPostByPostId(postId);
            if (!postResult) {
                throw new CustomError("Post not found", 400);
            }
            const createChatResult = await ChatModel.createChat(postId, postResult.title, Users);
            return createChatResult.insertedId;
        }
    }
}

module.exports = ChatService;