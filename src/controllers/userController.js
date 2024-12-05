const expressAsyncHandler = require("express-async-handler");
const { passport } = require('../utils/passport.js');
const CustomError = require("../utils/customError.js");
const { UserService } = require("../services/userServices.js");

const getLoginUser = expressAsyncHandler((req, res) => {
    res.render('user/login.ejs')
});

const postLoginUser = expressAsyncHandler(async (req, res, next) => {
    try {
        passport.authenticate('local', (err, user, info) => {
            if (err) return res.status(500).json(err)
            if (!user) return res.status(401).json(info.message)
            req.logIn(user, () => {
                if (err) return next(err)
                res.redirect('/')
            })
        })(req, res, next)
    } catch (err) {
        next(err);
    }
});

const getRegisterUser = expressAsyncHandler((req, res) => {
    res.render('user/register.ejs')
});

const postRegisterUser = expressAsyncHandler(async (req, res, next) => {
    try {
        const user = await UserService.registerUser(req.body);
        req.logIn(user, (err) => {
            if (err) return res.status(500).send("Login failed");
            res.redirect('/');
        })
    } catch (err) {
        next(err);
    }
});

const getLogoutUser = expressAsyncHandler((req, res, next) => {
    try {
        req.logout((err) => {
            if (err) {
                throw new CustomError("Logout failed. server error", 500);
            }
            res.redirect('/');
        });
    } catch (err) {
        next(err);
    }
});

module.exports = { getLoginUser, postLoginUser, getRegisterUser, postRegisterUser, getLogoutUser };