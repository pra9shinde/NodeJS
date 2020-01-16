const fs = require('fs');
const path = require('path');
const Cart = require('./cart');

const p = path.join(path.dirname(process.mainModule.filename),'data','product.json');//Store products in data/product.json file


//Helper Function : Accepts a function for synchronous execution
//Reads json file returns data or empty array
const getProductsFromFile = (callback) => {
    fs.readFile(p,(err,fileContent) => {
            if(err){
                callback([]);//return empty array and execute callback func
            }
            else{
                callback(JSON.parse(fileContent));//return data array and execute callback func
            }
    });
}

class Product{
    constructor(id,title, imageURL, price, description){
        this.id = id;//Id is passed null while updating and null when creating
        this.title = title;
        this.imageUrl = imageURL;
        this.price = price;
        this.description = description;
    }

    save(){
        getProductsFromFile(products => {
            if(this.id){
                //update existing product
                const existingProductIndex = products.findIndex(prod => prod.id === this.id);//If product found
                const updatedProducts = [...products];//spread to pull out all data
                updatedProducts[existingProductIndex] = this; //update the data in the array
                fs.writeFile(p, JSON.stringify(updatedProducts), err => {
                    console.log(err);
                });//update the data in the json file
            }
            else{
                this.id = Math.random().toString();//create id for new product
                products.push(this);
                fs.writeFile(p, JSON.stringify(products), err => {
                    console.log(err);
                });
            }
        });
    }

    static delete(prodId){
        getProductsFromFile(products => {
            const product = products.find(prod => prod.id === prodId);//Store the product in variable
            const updatedProducts = products.filter(prod => prod.id !== prodId);//Exclude curremt product from the array
            fs.writeFile(p, JSON.stringify(updatedProducts), err => {
                if(!err){
                    //Remove from cart as well
                    Cart.deleteProduct(prodId,product.price);
                }
            });//update the data in the json file 
        });
    }

    //Static method is a utility function which can be called directly without creating instance of the class
    //Accept a function for synchronous execution
    static fetchAll(callback){
        getProductsFromFile(callback);
    }

    //Gets one product from the list, accepts callback executes once recieves the full list
    static findById(id, callback){
        getProductsFromFile(products => {
            const product = products.find(p => p.id === id);
            callback(product);
        });
    }

}

module.exports = Product;
