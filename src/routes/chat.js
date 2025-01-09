const router = require('express').Router()
const { checkLogin } = require('../middlewares/verifyLogin.js')
const { getChatList, getChatDetail, getChat } = require('../controllers/chatController.js')

router.use(checkLogin)

router.get('/list', getChatList);
router.get('/detail/:id', getChatDetail);
router.get('/:id', getChat)




module.exports = router;