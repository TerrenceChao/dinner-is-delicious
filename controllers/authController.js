const passport = require('passport');

exports.login = passport.authenticate('local'/* facebook / twitter, ...*/, {
    failureRedirect: '/login',
    failureFlash: 'Failed Login!',
    successRedirect: '/',
    successFlash: 'You are new logged in!' 
}); 