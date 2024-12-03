// basic settings
require('dotenv').config();
const express = require('express');
const app = express();
const methodOverride = require('method-override');
const path = require('path');
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride('_method'));

// websocket settings
const { createServer } = require('http')
const server = createServer(app)
const setupWebSocket = require('./utils/websocket.js')

// db settings
let connectDB = require('./utils/database.js')
let db
connectDB.then((client) => {
    console.log('Success to connect DB')
    db = client.db('forum')
    setupWebSocket(server, db); // start socket server
    server.listen(process.env.PORT, () => {
        console.log("Hosting at: http://localhost:" + process.env.PORT)
    });
}).catch((err) => {
    console.log(err)
})


// session settings
const session = require('express-session')
const passport = require('./utils/passport.js');
const MongoStore = require('connect-mongo');
app.use(passport.initialize())
app.use(session({
    secret: process.env.SECRET_KEY,
    resave: false,
    saveUninitialized: false,
    cookie: { maxAge: 60 * 60 * 1000 },
    store: MongoStore.create({
        mongoUrl: process.env.DB_URL,
        dbName: 'forum'
    })
}))
app.use(passport.session())

// front-side setting
app.use(express.static(path.join(__dirname, '../public')));
app.set('view engine', 'ejs'); 

// Start
app.use((req, res, next) => {
    res.locals.user = req.user ? req.user : null; 
    next();
});

app.get('/', async (req, res) => {
    const result = await db.collection('posts').find().toArray()
    res.render('index.ejs', {posts: result ? result : null});
})

app.use('/api/user', require('./routes/user.js'))
app.use('/api/post', require('./routes/post.js'))
app.use('/api/chat', require('./routes/chat.js'))

// error handling
app.use((err, req, res, next) => {
    console.error(err.stack)
    res.status(500).send('Something broke!')
})

