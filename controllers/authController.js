const passport = require('passport');
const mongoose = require('mongoose');
const User = mongoose.model('User');
const crypto = require('crypto');
const promisify = require('es6-promisify');
const mail = require('../handlers/mail');


exports.login = passport.authenticate('local'/* facebook / twitter, ...*/, {
    failureRedirect: '/login',
    failureFlash: 'Failed Login!',
    successRedirect: '/',
    successFlash: 'You are new logged in!' 
}); 

exports.logout = (req, res) => {
    req.logout();   // req.logout is 'passport' middleware
    req.flash('success', 'You are now logged out! bye');
    /**
     * check 'layout.pug': 
     *  if user 
     *      li.nav__item...
     *  else
     *      ...
     */ 
    res.redirect('/');
} 

exports.isLoggedIn = (req, res, next) => {
    // 1. check if the user is authenticated
    if (req.isAuthenticated()) { // req.isAuthenticated is 'passport' middleware
        return next();
    }

    req.flash('error', 'Oops! You must be logged in to do that!');
    res.redirect('/login');
}

exports.forgot = async (req, res) => {
    // 1. Find user by email
    const user = await User.findOne({email: req.body.email});
    if (!user) {
        req.flash('error', 'No account with that email exists.');
        return res.redirect('/login');
    }

    // 2. set new token and expire on user's account in DB. 
    //      ref https://nodejs.org/dist/latest-v7.x/docs/api/crypto.html
    user.resetPasswordToken = crypto.randomBytes(20).toString('hex');
    user.resetPasswordExpires = Date.now() + 3600000 // valid in a hour.
    await user.save();

    // 3. Send them email with token
    const resetURL = `http://${req.headers.host}/account/reset/${user.resetPasswordToken}`;
    await mail.send({
        user,
        subject: 'Password Reset',
        resetURL,
        filename: 'password-reset'
    });
    req.flash('success', `You have been emailed a password reset link.`);
    
    // 4. Redirect to login page
    res.redirect('/login');

}

exports.reset = async (req, res) => {
    // 1. find user by field:'resetPasswordToken' and 'resetPasswordExpires' > now.
    const user = await User.findOne({
        resetPasswordToken: req.params.token,
        resetPasswordExpires: { $gt: Date.now() }
    });

    if (!user) {
        req.flash('error', 'The link may be exipred or error.');
        return res.redirect('/login');
    }

    // 2. show reset password form if there is a user.
    res.render('reset', {title: 'Reset Your Password'});
}

exports.confirmPassword = (req, res, next) => {
    if (req.body['password'] === req.body['password-confirm']) {
        return next();
    }

    req.flash('error', 'Your new password doesn\'t match!');
    res.redirect('back');
}

exports.update = async (req, res) => {
    // 1. find the user by token
    const user = await User.findOne({
        resetPasswordToken: req.params.token,
        resetPasswordExpires: { $gt: Date.now() }
    }); 

    if (!user) {
        req.flash('error', 'The link may be exipred or error.');
        return res.redirect('/login');
    }

    // 2.1. save new password. 
    const setPassword = promisify(user.setPassword, user); //what happened here?
    await setPassword(req.body.password);
    
    // 2.2. reset resetPassword's token and expired to undefined.
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    const updateUser = await user.save();

    // 3. Login again
    await req.login(updateUser); // abount "req.login" check 'passport' middleware in npm
    req.flash('success', 'Fine. Your password has been reset! You are now logged in.');
    res.redirect('/');

}