const router = require('express').Router()
let connectDB = require('../utils/database.js')
const asyncHandler = require('express-async-handler')
const { ObjectId } = require('mongodb')

let db
connectDB.then((client) => {
    db = client.db('forum')
}).catch((err) => {
    console.log(err)
})

// AWS S3 settings
const { S3Client, DeleteObjectCommand } = require('@aws-sdk/client-s3')
const multer = require('multer')
const multerS3 = require('multer-s3');
const s3 = new S3Client({
    region: 'ap-northeast-2',
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY,
        secretAccessKey: process.env.AWS_SECRET_KEY
    }
})

const upload = multer({
    storage: multerS3({
        s3: s3,
        bucket: 'ratforum',
        key: function (req, file, cb) {
            cb(null, Date.now().toString())
        }
    })
})

const { checkLogin } = require('../middlewares/verifyLogin.js');

router.route('/create-post').get(checkLogin, (req, res) => {
    res.render('post/create-post.ejs')
}).post(checkLogin, upload.single('image'), asyncHandler(async (req, res) => {
    const { title, content } = req.body
    if (!title) {
        return res.status(400).send("title are required")
    } else if (!content) {
        return res.status(400).send("content are required")
    } else {
        const postResult = await db.collection('posts').insertOne({
            title: req.body.title,
            content: req.body.content,
            userId: req.user._id,
            username: req.user.username,
            image: req.file ? req.file.location : '',
            date: new Date()
        })
        res.redirect('/post/list')
    }

}))


router.get('/list', asyncHandler(async (req, res) => {
    let postResult
    let totalPages
    const {searchKey = '', page = 1} = req.query
    if(searchKey) {
        let filter = [
            {
                $search: {
                    index: 'title_index',
                    text: { query: searchKey, path: 'title' }
                }
            },
            { $sort: {date: -1}},
            { $skip: (page - 1) * 10},
            { $limit: 10}
        ]
        postResult = await db.collection('posts').aggregate(filter).toArray()
        let countFilter = [
            {
                $search: {
                    index: 'title_index',
                    text: { query: searchKey, path: 'title' }
                }
            }
        ]
        let result = await db.collection('posts').aggregate(countFilter).toArray()
        totalPages = Math.ceil(result.length / 10)
        
    } else {
        postResult = await db.collection('posts').find()
        .skip((page-1) * 10)
        .limit(10)
        .toArray()
        let result = await db.collection('posts').countDocuments();
        totalPages = Math.ceil(result / 10)
        
    }
    res.render('post/list.ejs', { posts: postResult ? postResult : null, user: req.user ? req.user : null, totalPages: totalPages, searchKey: searchKey, page: page })
}))

router.get('/detail/:id', asyncHandler(async (req, res) => {
    const postResult = await db.collection('posts').findOne({
        _id: new ObjectId(req.params.id)
    })
    const user = await db.collection('users').findOne({
        _id: req.user._id
    })
    res.render('post/detail.ejs', { post: postResult, user: user ? user : null })
}))


router.delete('/delete/:id', checkLogin, asyncHandler(async (req, res) => {
    const post = await db.collection('posts').findOne({ _id: new ObjectId(req.params.id) })
    if(!post) {
        return res.status(400).send('Post not found')
    }
    if(post.image) {
        const key = post.image.split('/').pop()
        const deleteParams = {
            Bucket: process.env.AWS_BUCKET_NAME, 
            Key: key 
        }
        await s3.send(new DeleteObjectCommand(deleteParams))
    }

    let result = postResult = await db.collection('posts').deleteOne({
        _id: new ObjectId(req.params.id),
        userId: req.user._id
    })
    if (result.deletedCount === 0) {
        return res.status(400).send('Not authorized to delete this post')
    }
    res.redirect('/post/list');
}))

router.route('/edit/:id').get(checkLogin, asyncHandler(async (req, res) => {
    let postResult = await db.collection('posts').findOne({
        _id: new ObjectId(req.params.id)
    })
    res.render('post/edit.ejs', { post: postResult })
})).put(checkLogin, upload.single('image'), asyncHandler(async (req, res) => {
    const post = await db.collection('posts').findOne({ _id: new ObjectId(req.params.id) })
    if(!post) {
        return res.status(400).send('Post not found')
    }
    if(post.image) {
        const key = post.image.split('/').pop()
        const deleteParams = {
            Bucket: process.env.AWS_BUCKET_NAME, 
            Key: key 
        }
        await s3.send(new DeleteObjectCommand(deleteParams))
    }

    await db.collection('posts').updateOne({
        _id: new ObjectId(req.params.id),
        userId: req.user._id
    }, {
        $set: {
            title: req.body.title,
            content: req.body.content,
            image: req.file ? req.file.location : ''
        }
    })
    res.redirect('/post/list')
}))

router.route('/:id/like').post(checkLogin, asyncHandler(async(req, res) => {
    await db.collection('users').updateOne({
        _id: req.user._id
    }, {
        $addToSet: { likes: new ObjectId(req.params.id) }
    })
    res.status(200).json({message: "liked success"})
})).delete(checkLogin, asyncHandler(async (req, res) => {
    await db.collection('users').updateOne({
        _id: req.user._id
    }, {
        $pull: { likes: new ObjectId(req.params.id) }
    })
    res.status(200).json({message: "unliked success"})
}))


module.exports = router;