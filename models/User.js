const mongoose = require('mongoose');
mongoose.Promise = global.Promise;
const md5 = require('md5');
const validator = require('validator');
const mongodbErrorHandler = require('mongoose-mongodb-errors');
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
    },
    resetPasswordToken: String,
    resetPasswordExpires: Date
});

/**
 * Don't use the personal icon for temporarily. 
 */
// userSchema.virtual('gravatar').get(() => {
//     const hash = md5(this.email);
//     return `https://gravatar.com/avatar/${hash}?s=200`;
// });


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