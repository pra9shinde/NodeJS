const mongoose = require('mongoose');
const Schema = mongoose.Schema;

//product collection schema
const productSchema = new Schema({
    title : {
        type: String,
        required: true
    },
    price: {
        type : Number,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    imageUrl: {
        type: String,
        required: true
    },
    userId:{
        type: Schema.Types.ObjectId,
        ref: 'User', //Reference of UserId from User Model
        required: true
    }
});

module.exports = mongoose.model('Product',productSchema);//Product will be become products by mongoose as a collection name

// //Plain MongoDB
// class Product{
//     constructor(title,price,description,imageUrl,id,userId){
//         this.title = title;
//         this.price = price;
//         this.description = description;
//         this.imageUrl = imageUrl;
//         this._id = id ? new mongodb.ObjectID(id) : null;
//         this.userId = userId;
//     }

//     save(){
//         const db = mongo.getdb();//returns the database object created in databse.js
//         let dpOp;
//         if(this._id){
//             //update request
//             dpOp = db.collection('products').updateOne({_id: new mongodb.ObjectID(this._id)}, {$set:this});
//         }
//         else{
//             dpOp = db.collection('products').insertOne(this);
//         }
//         return dpOp
//         .then(result => {
//             //console.log(result);
//         })
//         .catch(err => {
//             console.log(err);
//         });
//     }

//     static fetchAll(){
//         const db = mongo.getdb();
//         return db.collection('products').find().toArray()
//         .then(products => {
//             //console.log(products);
//             return products;
//         })
//         .catch(err => console.log(err));
//     }

//     static findById(prodId){
//         const db = mongo.getdb();
//         return db.collection('products').find({_id: new mongodb.ObjectID(prodId) }).next()
//         .then(product => {
//             console.log(product);
//             return product;
//         })
//         .catch(err => console.log(err));
//     }

//     static deleteById(prodId){
//         const db = mongo.getdb();
//         return db.collection('products').deleteOne({_id: new mongodb.ObjectID(prodId)})
//         .then(result => {
//             console.log("Deleted Successfully");
//         })
//         .catch(err => console.log(err));
//     }
// }

// module.exports = Product;

// /* MYSQL
// const Sequelize = require('sequelize');

// const sequelize = require('../util/database');

// const Product = sequelize.define('product', {
//     id:{
//         type: Sequelize.INTEGER,
//         autoIncrement: true,
//         allowNull: false,
//         primaryKey: true
//     },
//     title: Sequelize.STRING,
//     price: {
//         type: Sequelize.DOUBLE,
//         allowNull : false
//     },
//     imageUrl : {
//         type : Sequelize.STRING,
//         allowNull : false
//     },
//     description : {
//         type : Sequelize.STRING,
//         allowNull : false
//     }
// });

// module.exports = Product;
// */