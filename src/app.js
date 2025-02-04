// basic settings
require('dotenv').config();
const express = require('express');
const app = express();
const methodOverride = require('method-override');
const path = require('path');
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride('_method'));
const errorHandler = require('./middlewares/errorHandler.js');

// websocket settings
const { createServer } = require('http')
const server = createServer(app)
const setupWebSocket = require('./utils/websocket.js')


// session settings
const session = require('express-session');
const MongoStore = require('connect-mongo');
const { init, passport } = require('./utils/passport.js');
app.use(session({
    secret: process.env.SECRET_KEY,
    resave: false,
    saveUninitialized: false,
    cookie: { maxAge: 60 * 60 * 1000 },
    store: MongoStore.create({
        mongoUrl: process.env.DB_URL,
        dbName: 'forum'
    })
}));
app.use(passport.initialize());
app.use(passport.session());

// front-end setting
app.use(express.static(path.join(__dirname, '../public')));
app.use('/uploads', express.static(path.join(__dirname, './uploads')));
app.set('view engine', 'ejs');

// db settings
let connectDB = require('./utils/database.js');
let db
connectDB.then((client) => {
    console.log('Success to connect DB')
    db = client.db('forum')
    setupWebSocket(server, db); // start socket server
    init(db); // session
    server.listen(process.env.PORT, () => {
        console.log("Hosting at: http://localhost:" + process.env.PORT)
    });
}).catch((err) => {
    console.log(err)
})

// Start
app.use((req, res, next) => {
    res.locals.user = req.user ? req.user : null;
    next();
});

app.get('/', async (req, res) => {
    const result = await db.collection('posts').find().toArray()
    res.render('index.ejs', { posts: result ? result : null });
})

app.use('/api/user', require('./routes/user.js'))
app.use('/api/post', require('./routes/post.js'))
app.use('/api/chat', require('./routes/chat.js'))

// error handling
app.use(errorHandler);

