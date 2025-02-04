const router = require('express').Router()
let connectDB = require('../utils/database.js')

const { checkLogin } = require('../middlewares/verifyLogin.js');
const { getCreatePost,
    postCreatePost,
    getPostList,
    deletePost,
    getPostDetail,
    getEditPost,
    updateEditPost,
    updateLike,
    deleteLike
    } = require('../controllers/postController.js');


let db
connectDB.then((client) => {
    db = client.db('forum')
}).catch((err) => {
    console.log(err)
})
// const multer = require('multer')
// const path = require('path');

// // multer settings
// const storage = multer.diskStorage({
//     destination: (req, file, cb) => {
//         cb(null, path.join(__dirname, '../uploads'));
//     },
//     filename: (req, file, cb) => {
//         const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
//         cb(null, uniqueSuffix + path.extname(file.originalname));
//     }
// })

// const upload = multer({ storage: storage })

//aws s3 settings
const { S3Client } = require('@aws-sdk/client-s3')
const multer = require('multer')
const multerS3 = require('multer-s3')
const s3 = new S3Client({
    region : 'us-east-1',
    credentials : {
        accessKeyId : process.env.AWS_ACCESS_KEY,
        secretAccessKey : process.env.AWS_SECRET_KEY
    }
})
  
const upload = multer({
    storage: multerS3({
        s3: s3,
        bucket: 'marketplaceforum',
        key: function (req, file, cb) {
            cb(null, Date.now().toString())
        }
    })
})

router.route('/create-post').get(checkLogin, getCreatePost)
    .post(checkLogin, upload.single('image'), postCreatePost);

router.get('/list', getPostList);

router.get('/detail/:id', getPostDetail);

router.delete('/delete/:id', checkLogin, deletePost);

router.route('/edit/:id').get(checkLogin, getEditPost)
    .put(checkLogin, upload.single('image'), updateEditPost);

router.route('/:id/like').put(checkLogin, updateLike)
    .delete(checkLogin, deleteLike);


module.exports = router;