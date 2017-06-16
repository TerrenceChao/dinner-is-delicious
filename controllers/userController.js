const mongoose = require('mongoose');
mongoose.Promise = global.Promise;

exports.loginForm = (req, res) => {
    res.render('login', { title: 'Login' });
}

exports.registerForm = (req, res) => {
    res.render('register', { title: 'Register' });
} 

exports.validateRegister = (req, res, next) => {
    /**
     * in 'app.js', we use expressValidator.
     * so we can use 'req.sanitizeBody('xxx')' here.
     * ref https://www.npmjs.com/package/express-validator#validation-result
     * {
     * ex:
     *  // SANITIZATION 
        // as with validation these will only validate the corresponding 
        // request object 
        req.sanitizeBody('postparam').toBoolean();
        req.sanitizeParams('urlparam').toBoolean();
        req.sanitizeQuery('getparam').toBoolean();
     * }
     */ 
    req.sanitizeBody('name');  
    req.checkBody('name', 'You must supply a name!').notEmpty();
    req.checkBody('email', 'The email is not valid').isEmail();
    req.sanitizeBody('email').normalizeEmail({
        remove_dots: false,
        remove_extension: false,
        gmail_remove_subaddress: false
    });
    req.checkBody('password', 'Password cannot be blank!').notEmpty();
    req.checkBody('password-confirm', 'Confirmed Password cannot be blank!').notEmpty();
    req.checkBody('password-confirm', 'Oops! Your password do not match!').equals(req.body.password);
    
    const errors = req.validationErrors();
    if (errors) {
        req.flash('error', errors.map(err => err.msg));
        res.render('register', { title: 'Register', body: req.body, flashes: req.flash() })
        return;
    }
    next();

} 