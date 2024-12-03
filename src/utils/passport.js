const passport = require('passport');
const LocalStrategy = require('passport-local');
const bcrypt = require('bcrypt');
const { ObjectId } = require('mongodb');

passport.use(new LocalStrategy(async (inputId, inputPW, cb) => {
    let result = await db.collection('users').findOne({ username: inputId })
    if (!result) {
        return cb(null, false, { message: 'No such Id in db' })
    }
    // compare hased password
    if (await bcrypt.compare(inputPW, result.password)) {
        return cb(null, result)
    } else {
        return cb(null, false, { message: 'password not matched' });
    }
}))

passport.serializeUser((user, done) => {
    process.nextTick(() => {
        done(null, { _id: user._id, username: user.username })
    })
})

passport.deserializeUser(async (user, done) => {
    let result = await db.collection('users').findOne({ _id: new ObjectId(user._id) })
    delete result.password
    process.nextTick(() => {
        return done(null, result)
    })
})

module.exports = passport;