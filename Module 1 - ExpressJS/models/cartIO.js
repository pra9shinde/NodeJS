const fs = require('fs');
const path = require('path');

//Create a or concat path for json data files
const p = path.join(path.dirname(process.mainModule.filename),'data','cart.json');


module.exports = class Cart {
  static addProduct(id,productPrice){
    //Fetch the previous cart data
    fs.readFile(p,(err, fileContent) => {
      let cart = { products : [], totalPrice : 0};
      if(fileContent.length > 0){
        //Data Present hence use that 
        cart = JSON.parse(fileContent);
      }
      //Check whether current prod is already in cart or not
      const existingProductIndex = cart.products.findIndex(prod => prod.id === id);//get the index of the existing product
      const existingProduct = cart.products[existingProductIndex];
      let updatedProduct;
      if(existingProduct){
        //Product already present in cart
        updatedProduct = {...existingProduct}; //Destructuring objects into this variable
        updatedProduct.qty = updatedProduct.qty + 1;//add the quatity of the Product
        cart.products = [...cart.products];//copying old array
        cart.products[existingProductIndex] = updatedProduct;//Replace the old data new quantity added data
      }
      else{//New Product
        updatedProduct = { id : id, qty : 1};
        cart.products = [...cart.products, updatedProduct];//Copy already existing object and add updated product i.e current product
      }
      cart.totalPrice = cart.totalPrice + +productPrice;//Extra + converts string to int and then add
      fs.writeFile(p, JSON.stringify(cart), err => {
        console.log(err);
      });
    });
  }

  static deleteProduct(id, productPrice){
    fs.readFile(p,(err, fileContent) => {
      if(err){
        return;//No such product present hence exit
      }
      const updatedCart = {...JSON.parse(fileContent)};//get latest cart details
      const product = updatedCart.products.find(prod => prod.id === id);//fetch the details of the product
      if(!product){
        return;
      }
      const productQty = product.qty;//get its quantity for reducing the cart price
      updatedCart.products = updatedCart.products.filter(prod => prod.id !== id);//get all products instead of this current product
      updatedCart.totalPrice = updatedCart.totalPrice - productPrice * productQty;//reduce the total amount
      fs.writeFile(p, JSON.stringify(updatedCart), err => {
        console.log(err);
      });
    });
  }

  static getCart(callback){
    fs.readFile(p,(err, fileContent) => {
      const cart = JSON.parse(fileContent);
      if(err){
        callback(null);
      }
      else{
        callback(cart);
      }
    });
  }
}
