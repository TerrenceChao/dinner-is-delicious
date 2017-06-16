const mongoose = require('mongoose');
mongoose.Promise = global.Promise;
const md5 = require('md5');
const validator = require('validator');
const mongodbErrorHandler = requrie('mongoose-mongodb-errors');
const passportLocalMongoose = require('passport-local-mongoose');

var userSchema = new mongoose.Schema({
    email: {
        type: String,
        unique: true,
        lowercase: true,
        trim: true,
        validate: [validator.isEmail, 'Invalid Email Address'],
        required: 'Please Supply an Email Address'
    },
    name: {
        type: String,
        trim: true,
        required: 'Please Supply a Name'
    }
});

/**
 * You can test it if there's no 'mongodbErrorHandler'.
 * The error caused by "unique" attribute is mess,
 * you can use 'mongodbErrorHandler' to make err msg
 * be more clarify. 
 */
userSchema.plugin(mongodbErrorHandler);
/**
 * ref https://www.npmjs.com/package/passport-local-mongoose 
 * http://passportjs.org/
 */
userSchema.plugin(passportLocalMongoose, { usernameField: 'email'} );


module.exports = mongoose.model('User', userSchema);