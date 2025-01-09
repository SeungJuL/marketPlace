let connectDB = require('../utils/database.js');

let db
connectDB.then((client) => {
    db = client.db('forum')
}).catch((err) => {
    console.log(err)
})

class UserModel {
    static getUserByUserId = async (userId) => {
        const result = await db.collection('users').findOne({
            _id: userId
        });
        return result;
    }

    static getUserByUsername = async (userData, db) => {
        const result = await db.collection('users').findOne({
            username: userData
        })
        return result;
    };

    static registerUser = async (userData, db) => {
        const result = await db.collection('users').insertOne({
            username: userData.username,
            password: userData.password,
            likes: [],
            chatRooms: []
        })
        return result;
    } 

    static updatePW = async (userId, pw) => {
        const result = await db.collection('users').updateOne({ _id: userId },
        {
            $set: { password: pw }
            });
        return result;
    }

    static removeLike = async (postId, userId) => {
        let result = await db.collection('users').updateOne({
            _id: userId
        }, {
            $pull: { likes: postId }
        })
        return result;
    }
}

module.exports = { UserModel }