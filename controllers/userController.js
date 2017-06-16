const mongoose = require('mongoose');
const User = mongoose.model('User');
const promisify = require('es6-promisify');

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

exports.register = async (req, res, next) => {
    const user = new User({ email: req.body.email, name: req.body.name });
    /**
     * User Schema doesn't define 'password' field directly, 
     * we use 3rd libary "passport-local-mongoose" to 
     * instead of tranditional way.
     * 
     * to demonstrate the register principal,
     * check video "#24 06:50" 
     * and https://www.npmjs.com/package/passport 
     */
    // User.register(user, req.body.password, function(err, user) {...})
    const register = promisify(User.register, User);
    await register(user, req.body.password);
    // res.send('It works');
    next();
};

exports.account = (req, res) => {
    res.render('account', {title: 'Edit Your Account'});
}

exports.updateAccount = async (req, res) => {
    const updates = {
        name: req.body.name,
        email: req.body.email
    }

    const user = await User.findOneAndUpdate(
        {_id: req.user._id}, // check 'app.js' line 58: res.locals.user = req.user || null;
        { $set: updates },
        { new: true, runValidators: true, context: 'query'  } //  What is "context: 'query'" ????
    );
    // res.json(user);
    res.redirect('back');
}
