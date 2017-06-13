const mongoose =require('mongoose');
var Store = mongoose.model('Store');


exports.homePage = (req,res) => {
    res.render('index');
}

exports.addStore = (req, res) => {
    res.render('editStore', {title: 'Add Store'});
}

exports.createStore = async (req, res) => {
    const store = await (new Store(req.body)).save();
    req.flash('success', `Successfully Created ${store.name}. Care to leave a review?`);
    res.redirect(`/store/${store.slug}`);
} 

exports.getSotres = async (req, res) => {
    // Query the database for a list of all stores
    const stores = await Store.find();
    res.render('stores', {title: 'Stores', stores});
}

exports.editStore = async (req, res) => {
    // 1. Find the store given the ID
    const store = await Store.findOne({_id: req.params.id});
    // 2. Confirm they are the owner of the store
    //TODO

    // 3. Render out the edit form so the ser can udpate their store
    res.render('editStore', {title: `Edit ${store.name}`, store});
}

exports.updateStore = async (req, res) => {
    // set the location data to be a point.
    req.body.location.type = 'point';
    
    // find and update the store
    const store = await Store.findOneAndUpdate({_id: req.params.id},
                            req.body,
                            {   new: true,  // return new store instead of the old one
                                runValidators: true // validation (check 'model/Store.js')
                            }).exec();
    req.flash('success', `Successfully Updated ${store.name}.`);
    res.redirect(`/stores/${store._id}/edit`);
}

// module.exports = {
//     homePage: (req, res) => {
//         res.render('index');
//     },

//     addStore: (req, res) => {
//         res.render('editStore', {title: 'Add Store'});
//     },
    
//     // createStore: (req, res) => {
//     //     const store = new Store(req.body);
//     //     store.save()
//     //         .then(sotre => res.json(sotre))
//     //         .catch(err => {
//     //             throw Error(err);  /*res.send(err)*/
//     //         });
//     // },

//     // createStore: async (req, res) => {
//     //     try {
//     //         const store = new Store(req.body);
//     //         await store.save();
//     //         console.log("Store saved !");
//     //     } catch(err) {
//     //         throw Error(err);   /*res.send(err)*/
//     //     }
//     // }

//     createStore: async (req, res) => {
//         //But you can do better, using 'errorHandlers.js'
//         const store = new Store(req.body);
//         await store.save();
//         req.flash('success', `Successfully Created ${store.name}. Care to leave a review?`);
//         // console.log("Store saved !");
//         res.redirect(`/store/${store.slug}`);
//     }
// }