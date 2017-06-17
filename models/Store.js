const mongoose = require('mongoose'); 
mongoose.Promise = global.Promise;
const slug = require('slugs');

const storeSchema = new mongoose.Schema({
    name: {
        type: String,
        trim: true,
        required: 'Please enter a store name',
        // unique: true
    },
    slug: String,
    description: {
        type: String,
        trim: true
    },
    tags: [String],
    created: {
        type: Date,
        default: Date.now
    },
    location:{
        type: {
            type: String,
            default: 'Point'
        },
        coordinates: [{
            type: Number,
            required: 'You must supply coordinates!'
        }],
        address:{
            type: String,
            required: 'You must supply an address!'
        }
    },
    photo: String,
    author: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: 'You must supply an author'
    }
});

// Define our indexes
storeSchema.index({
    name: 'text',
    description: 'text'
})

// https://developers.redhat.com/blog/2016/11/09/node-7-and-promise-rejections-please-handle-them/
storeSchema.pre('save', async function(next) {
    if (!this.isModified('name')) {
        return next(); 
    }
    
    this.slug = slug(this.name);
    // find other stores that have a slug of wes, wes-1, wes-2, ...
    const slugReqEx = new RegExp(`^(${this.slug})((-[0-9]*$)?)$`, 'i');
    const storesWithSlug = await this.constructor.find({ slug: slugReqEx });
    if (storesWithSlug.length) {
        this.slug = `${this.slug}-${storesWithSlug.length + 1}`;
    }
    next();
    //TODO make more resilient so slugs are unique 
});

storeSchema.statics.getTagsList = function(tag) {
    return this.aggregate([
        { $unwind: '$tags' },
        { $group: { _id: '$tags', count: { $sum: 1 } }},
        { $sort: { count: 1 } } 
    ]);
}

module.exports = mongoose.model('Store', storeSchema); 