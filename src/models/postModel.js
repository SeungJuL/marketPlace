let connectDB = require('../utils/database.js');

let db
connectDB.then((client) => {
    db = client.db('forum')
}).catch((err) => {
    console.log(err)
})

class PostModel {
    static createPost = async (postData, userData) => {
        const result = await db.collection('posts').insertOne({
            title: postData.title,
            content: postData.content,
            userId: userData.userId,
            username: userData.username,
            image: postData.image,
            date: new Date()
        })
        return result;
    }

    static getList = async (page) => {
        const result = await db.collection('posts').find()
            .skip((page - 1) * 5)
            .limit(5)
            .toArray();
        return result;
    }
    
    static getListCount = async () => {
        const count = await db.collection('posts').countDocuments();
        return count;
    }

    static getListBySearch = async (filter) => {
        const result = await db.collection('posts').aggregate(filter).toArray();
        return result;
    }

    static getListBySearchCount = async (filter) => {
        const result = await db.collection('posts').aggregate(filter).toArray();
        const count = result.length;
        return count;
    }

    static getPostByPostId = async (postId) => {
        const result = await db.collection('posts').findOne({
            _id: postId
        });
        return result;
    }

    static deletePostByPostId = async (postId) => {
        const result = await db.collection('posts').deleteOne({
            _id: postId,
        });
        return result;
    }

    static updatePost = async (postData) => {
        const result = await db.collection('posts').updateOne({
            _id: postData.postId,
        }, {
            $set: {
                title: postData.title,
                content: postData.content,
                image: postData.file ? postData.file.path : ''
            }
        })
        return result;
    }
    
    static updateLike = async (postId, userId) => {
        const result = await db.collection('users').updateOne({
            _id: userId
        }, {
            $addToSet: { likes: postId }
        })
        return result;
    }

    static deleteLike = async (postId, userId) => {
        const result = await db.collection('users').updateOne({
            _id: userId
        }, {
            $pull: { likes: postId }
        });
        return result;
    }
    
}

module.exports = PostModel;