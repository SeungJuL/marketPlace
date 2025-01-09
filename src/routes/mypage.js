const router = require('express').Router()
const { checkLogin } = require("../middlewares/verifyLogin");
const { getSecurity, updatePassword, getLikes, removeLike } = require('../controllers/mypageController.js');


router.use(checkLogin)

router.route('/security').get(getSecurity)
    .put(updatePassword);
router.route('/likes').get(getLikes);
router.delete('/likes/:id', removeLike);



module.exports = router;