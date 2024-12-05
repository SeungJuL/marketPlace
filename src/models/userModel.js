

class UserModel {

    static findUserByUsername = async (userData, db) => {
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
}

module.exports = { UserModel }