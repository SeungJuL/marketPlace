const router = require('express').Router()
const {
    getLoginUser,
    postLoginUser,
    getRegisterUser,
    postRegisterUser,
    getLogoutUser
    } = require('../controllers/userController.js');
router.route('/login').get(getLoginUser)
    .post(postLoginUser);
router.route('/register').get(getRegisterUser)
    .post(postRegisterUser);
router.get('/logout', getLogoutUser);
router.use('/mypage', require('./mypage.js'))

module.exports = router;