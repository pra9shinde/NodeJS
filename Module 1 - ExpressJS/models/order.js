const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const orderSchema = new Schema({
    products:[{
        product: {type: Object, required:true},
        quantity: {type: Number, required:true}
    }],
    user: {
        userId: {type: Schema.Types.ObjectId, required:true},
        username: {type: String, required: true,ref:'User'}
    }
});

module.exports = mongoose.model('Order',orderSchema);