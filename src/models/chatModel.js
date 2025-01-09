let connectDB = require('../utils/database.js');

let db
connectDB.then((client) => {
    db = client.db('forum')
}).catch((err) => {
    console.log(err)
})

class ChatModel {
    static getChatsByUserId = async (userId) => {
        const result = await db.collection('chats').find({
            users: userId
        }).toArray()
        return result;
    }

    static getChatByChatId = async (chatId) => {
        const result = await db.collection('chats').findOne({
            _id: chatId
        })
        return result;
    }

    static getMessagesByChatId = async (chatId) => {
        const result = await db.collection('chatMessages').find({
            chatId: chatId
        }).toArray()
        return result;
    }

    static getChatByPostIdAndUsers = async (postId, Users) => {
        let result = await db.collection('chats').findOne({
            postId: postId,
            users: { $all: [Users.user1, Users.user2] }
        })
        return result;
    }

    static createChat = async (postId, postTitle, Users) => {
        let result = await db.collection('chats').insertOne({
            postId: postId,
            postTitle: postTitle,
            users: [Users.user1, Users.user2],
            date: new Date(),
        })
        return result;
    }
}

module.exports = ChatModel;