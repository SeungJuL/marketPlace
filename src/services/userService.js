const CustomError = require("../utils/customError.js");
let connectDB = require('../utils/database.js');
const bcrypt = require('bcrypt');
const { UserModel } = require("../models/userModel.js");

let db
connectDB.then((client) => {
    db = client.db('forum');
})

class UserService {
    static registerUser = async (userData) => {
        const userFindResult = await UserModel.getUserByUsername(userData, db);
        if (userFindResult) {
            throw new CustomError('username already in use', 400);
        }
        let hash = await bcrypt.hash(userData.password, 10);
        const newUser = {
            username: userData.username,
            password: hash,
        };
        const registerResult = await UserModel.registerUser(newUser, db);
        const user = {
            _id: registerResult.insertedId,
            username: newUser.username,
        };
        return user;
    }
}

module.exports = { UserService };