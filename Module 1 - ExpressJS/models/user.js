const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const userSchema = new Schema({
    email: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    cart:{
        items: [
            {
                productId: {type: Schema.Types.ObjectId, required: true, ref: 'Product'},//Product is a model which consists productId as ref here 
                quantity: {type: String, required: true} 
            }
        ]
    },
    resetToken: String,//store reset password unique token
    resetTokenExpiration: Date //token expiry date
});

//Add this function to User Model Class
userSchema.methods.addToCart = function(product){
    const cartProductIndex = this.cart.items.findIndex(cp => {
        return cp.productId.toString() === product._id.toString();//Check and return if product already exists in cart
    });
    let newQuantity = 1;
    const updatedCartItems = [...this.cart.items];//Spread the existing items into this variable

    if (cartProductIndex >= 0) {
        //Product aready present inside the cart
        newQuantity = parseInt(this.cart.items[cartProductIndex].quantity) + 1;//Increase the quantity of that item
        updatedCartItems[cartProductIndex].quantity = newQuantity;
    }
    else {
        //Product not present in cart hence push it into item array
        updatedCartItems.push({ productId: product._id, quantity: newQuantity });
    }
    const updatedCart = { items: updatedCartItems };//store the latest array in tems key
    this.cart = updatedCart;//overwrite cart with latest data
    return this.save()//Update in collection
}

//Delete Item From Cart
userSchema.methods.removeFromCart = function(productId){
    const updatedCartItems = this.cart.items.filter(item => {
        return item.productId.toString() !== productId.toString();//Remove the item fromt the array
    });
    this.cart.items = updatedCartItems;
    return this.save();
}

userSchema.methods.clearCart = function(){
    this.cart = {items: []};
    return this.save();
}

module.exports = mongoose.model('User',userSchema);

// const mongodb = require('mongodb');
// const getdb = require('../util/database');
// class User {
//     constructor(username,email,cart,id){
//         this.name = username;
//         this.email = email;
//         this.cart = cart; //{items:[]}
//         this._id = id;
//     }

//     save(){
//         const db = mongo.getdb();
//         return db.collection('users').insertOne(this);
//     }

//     //Function accepts product object
//     addToCart(product){
//         const db = mongo.getdb();
//         const cartProductIndex = this.cart.items.findIndex(cp => {
//             return cp.productId.toString() === product._id.toString();//Check and return if product already exists in cart
//         });
//         let newQuantity = 1;
//         const updatedCartItems = [...this.cart.items];//Spread the existing items into this variable

//         if(cartProductIndex >= 0){
//             //Product aready present inside the cart
//             newQuantity = this.cart.items[cartProductIndex].quantity + 1;//Increase the quantity of that item
//             updatedCartItems[cartProductIndex].quantity = newQuantity;
//         }
//         else{
//             //Product not present in cart hence push it into item array
//             updatedCartItems.push({productId: new mongodb.ObjectID(product._id),quantity: newQuantity});
//         }
//         const updatedCart = {items: updatedCartItems };//store the latest array in tems key
//         return db.collection('users').updateOne(
//                 {_id: new mongodb.ObjectID(this._id )}, 
//                 {$set:{cart: updatedCart}} 
//             );//find the user using userid and update its cart
//     }

//     //Return Cart deatials which requires user object
//     getCart(){
//         const db = mongo.getdb();
//         const productIds = this.cart.items.map(i => {
//             return i.productId;
//         });//Create an array which will select productid from the cart and push this into an array
//         return db.collection('products').find({_id : {$in: productIds} }).toArray()
//         .then(products => {
//             //gets the list of all products here
//             return products.map(p => {
//                     //add the quantity details to this product object of each item
//                     //Loop through each product, using spread op. to fetch details in seprate variable
//                     return {...p, quantity: this.cart.items.find(i => {
//                         //Find the quantity of the each product 
//                             return i.productId.toString() === p._id.toString();
//                         }).quantity //return the quantity of the current product
//                     };
//             });
//         })
//         .catch(err => console.log(err));//Find all the products which matches the _id present inside productIds array
//     }


//     deleteItemFromCart(productId){
//         const updatedCartItems = this.cart.items.filter(item => {
//             return item.productId.toString() !== productId.toString();//Remove the item fromt the array
//         });
//         const db = mongo.getdb();
//         return db.collection('users').updateOne({_id : new mongodb.ObjectID(this._id)}, 
//         {$set: {cart : {items: updatedCartItems} } });//update in db
//     }

//     addOrder(){
//         const db= mongo.getdb();
//         //Get all the cart details
//         return this.getCart().then(products => {
//             const order = {items: products, user: {_id: new mongodb.ObjectID(this._id)}};
//             return db.collection('orders').insertOne(order);
//         })
//         .then(result => {
//             //when above promise returns
//             this.cart = {items: []} //empty the cart items array
//             return db.collection('users').updateOne({_id : new mongodb.ObjectID(this._id)}, 
//                 {$set: {cart : {items: []} } });//empty cart in db
//         })
//         .catch(err => console.log(err));
//     }

//     getOrders(){
//         const db = mongo.getdb();
//         return db.collection('orders').find({'user._id': new mongodb.ObjectID(this._id)}).toArray();
//     }

//     static findById(userId){
//         const db = mongo.getdb();
//         return db.collection('users').findOne({_id: new mongodb.ObjectID(userId)});
//     }
// }

// module.exports = User;

