const mongoose =require('mongoose');
var Store = mongoose.model('Store');
var User = mongoose.model('User');

/** 
 * 'multer'. about file upload ( to server's memery), check ref:
 * https://github.com/expressjs/multer/blob/master/doc/README-zh-cn.md
 */ 
const multer = require('multer'); 

/**
 * 'jimp'. abount photo resize, check ref:
 * https://www.npmjs.com/package/jimp
 */
const jimp = require('jimp');
const uuid = require('uuid');


const multerOptions = {
    storage: multer.memoryStorage(),
    fileFilter(req, file, next) {
        const isPhoto = file.mimetype.startsWith('image/');
        if (isPhoto) {
            next(null, true);
        } else {
            next({message: 'This filetype isn\'t allowed!'}, false);
        }
    }
}


exports.homePage = (req,res) => {
    res.render('index');
}

exports.addStore = (req, res) => {
    res.render('editStore', {title: 'Add Store'});
}

//read into server's memory (not disk)
exports.upload = multer(multerOptions).single('photo');

exports.resize = async (req, res, next) => {
    // check if there's no new file to resize
    if (!req.file) {
        next();
        return;
    }
    // console.log(req.file);
    const filetype = req.file.mimetype.split('/')[1];
    req.body.photo = `${uuid.v4()}.${filetype}`;
    // do resize
    const photo = await jimp.read(req.file.buffer);
    await photo.resize(800, jimp.AUTO);
    await photo.write(`./public/uploads/${req.body.photo}`); //How do you know to write where?

    // once we have written the photo to filesystem, keep going!
    next();
}

exports.createStore = async (req, res) => {
    req.body.author = req.user._id;
    // console.log(`author: ${req.body.author}`);
    const store = await (new Store(req.body)).save();
    req.flash('success', `Successfully Created ${store.name}. Care to leave a review?`);
    res.redirect(`/store/${store.slug}`);
} 

exports.getSotres = async (req, res) => {
    // Query the database for a list of all stores
    const stores = await Store.find();
    res.render('stores', {title: 'Stores', stores});
}

const confirmOwner = (store, user) => {
    if (!store.author.equals(user._id)) {
        throw Error(`In order to edit this store, you must be the woner, ${user.name}`);
    }
}

exports.editStore = async (req, res) => {
    // 1. Find the store given the ID
    const store = await Store.findOne({_id: req.params.id});
    // 2. Confirm they are the owner of the store
    confirmOwner(store, req.user);

    // 3. Render out the edit form so the ser can udpate their store
    res.render('editStore', {title: `Edit ${store.name}`, store});
}

exports.updateStore = async (req, res) => {
    // set the location data to be a point.
    req.body.location.type = 'Point';
    
    // find and update the store
    const store = await Store.findOneAndUpdate({_id: req.params.id},
                            req.body,
                            {   new: true,  // return new store instead of the old one
                                runValidators: true // validation (check 'model/Store.js')
                            }).exec();
    req.flash('success', `Successfully Updated ${store.name}.`);
    res.redirect(`/stores/${store._id}/edit`);
}

exports.getStoreBySlug = async (req, res, next) => {
    const store = await Store.findOne({slug: req.params.slug}).populate('author'); //know you know what's 'populate' doing.
    if (!store) {
        return next();
    }
    res.render('store', { store });
}

exports.getStoresByTag = async (req, res) => {
    const tag = req.params.tag;
    const tagQuery = tag || { $exists: true };
    const tagsPromise = Store.getTagsList(req.params.tag);
    const storesPromise = Store.find({ tags: tagQuery });
    const [tags, stores] = await Promise.all([tagsPromise, storesPromise]);
    // res.json(stores);
    res.render('tag', { tag, title: 'Tags', tags, stores });
}

exports.searchStores = async (req, res) => {
    const stores = await Store
    // find stores that match
    .find( { $text: {$search: req.query.q } }, 
        { score: { $meta: 'textScore' } }
    )
    // then sort them
    .sort({ score: { $meta: 'textScore' } });
    res.json(stores);
}

exports.mapStores = async (req, res) => {
    const coordinates = [req.query.lat, req.query.lng].map(parseFloat);
    const query = {
        location: {
            $near: {
                $geometry: {
                    type: 'Point',
                    coordinates
                },
                $maxDistance: 20000000 //2000km
            }
        }
    };
    
    const stores = await Store.find(query).select('slug name description location photo'); //.limit(10);
    res.json(stores);
}

exports.mapPage = (req, res) => {
    res.render('map', {title: 'Map'});
}

exports.heartStore = async (req, res) => {
    const hearts = req.user.hearts.map(heart => heart.toString());
    const operator = hearts.includes(req.params.id) ? '$pull' : '$addToSet';
    const user = await User
        .findByIdAndUpdate(req.user._id,
            { [operator]: { hearts: req.params.id } },
            { new: true }
        );
    res.json(user);
}

exports.getHearts = async (req, res) => {
    const stores = await Store.find({ _id: { $in: req.user.hearts }});
    res.render('stores', { title: 'Heart Stores', stores});
}