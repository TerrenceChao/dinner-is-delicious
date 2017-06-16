const passport = require('passport');

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