const fs = require('fs');
const path = require('path');
const PDFDocument = require('pdfkit');
const stripe = require('stripe')(process.env.STRIPE_KEY);//stripejs
// const stripe = require('stripe')('sk_test_SVY8bMiulUJidRpFbRxL8dFC00eiCAquvP');//stripejs

//Import Model Class
const Product = require('../models/product');
const Order = require('../models/order');

const ITEMS_PER_PAGE = 1;

getProducts = (req, res, next) => {
  
  const page = parseInt(req.query.page) || 1;//query parameter passed in url
  let totalItems = 0;

  Product.find().countDocuments().then(countProducts => {
    totalItems = countProducts;
    return Product.find()
    .skip((page - 1) * ITEMS_PER_PAGE) //pagination skipping previous page records
    .limit(ITEMS_PER_PAGE)
  })
   //items to be displayed on one page
  .then(products => {
    res.render('shop/product-list', {
      prods: products,
      docTitle: 'Shop',
      path: '/products',
      pageTitle: 'Products',
      isAuthenticated: req.session.isLoggedIn,
      currentPage: page,
      hasNextPage: ITEMS_PER_PAGE * page < totalItems,
      hasPreviousPage: page > 1,
      nextPage: page + 1,
      previousPage: page - 1,
      lastPage: Math.ceil(totalItems / ITEMS_PER_PAGE)
    });
  })
    .catch(err => {
      //res.redirect('/500');
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error); //exceptional handling using express
    });
};

//load index view
getIndex = (req, res, next) => {
  const page = parseInt(req.query.page) || 1;//query parameter passed in url
  let totalItems = 0;

  Product.find().countDocuments().then(countProducts => {
    totalItems = countProducts;
    return Product.find()
    .skip((page - 1) * ITEMS_PER_PAGE) //pagination skipping previous page records
    .limit(ITEMS_PER_PAGE)
  })
   //items to be displayed on one page
  .then(products => {
    res.render('shop/index', {
      prods: products,
      docTitle: 'Shop',
      path: '/',
      pageTitle: 'Home',
      isAuthenticated: req.session.isLoggedIn,
      currentPage: page,
      hasNextPage: ITEMS_PER_PAGE * page < totalItems,
      hasPreviousPage: page > 1,
      nextPage: page + 1,
      previousPage: page - 1,
      lastPage: Math.ceil(totalItems / ITEMS_PER_PAGE)
    });
  })
    .catch(err => {
      //res.redirect('/500');
      console.log(err);
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error); //exceptional handling using express
    });
};

//cart view
getCart = (req, res, next) => {
  //Mongoose populate method to bring all data of refid(productId) and store it in items.productId Key
  req.user.populate('cart.items.productId').execPopulate()//exePopulate is used to return result as promise
    .then(user => {
      const products = user.cart.items;
      //console.log(userData);
      res.render('shop/cart', {
        path: '/cart',
        pageTitle: 'Cart',
        products: products,
        isAuthenticated: req.session.isLoggedIn
      });
    })
    .catch(err => {
      //res.redirect('/500');
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error); //exceptional handling using express
    });
};

//Single Product Detail Page
getProduct = (req, res, next) => {
  const prodId = req.params.productId; //Fetching passed id via url
  Product.findById(prodId)
    .then(product => {
      res.render('shop/product-detail', {
        product: product,
        pageTitle: product.title,
        path: '/products',
        isAuthenticated: req.session.isLoggedIn
      });
    })
    .catch(err => {
      //res.redirect('/500');
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error); //exceptional handling using express
    });
};

//postcart
postCart = (req, res, next) => {
  const prodId = req.body.productId.trim();
  //Fetch the product details
  Product.findById(prodId)
    .then(product => {
      //pass the product object to attcart method
      return req.user.addToCart(product);//returns promise
    })
    .then(result => {
      //when above promise is returned
      // console.log(result);
      res.redirect('/cart');
    })
    .catch(err => {
      //res.redirect('/500');
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error); //exceptional handling using express
    });

};

postDeleteCartItem = (req, res, next) => {
  const prodId = req.body.productId;
  //User Model method to remove item from cart
  req.user.removeFromCart(prodId)
    .then(result => {
      console.log("Item Remove from Cart Successfully");
      res.redirect('/cart');
    })
    .catch(err => {
      //res.redirect('/500');
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error); //exceptional handling using express
    });
};


//Checkout
getCheckout = (req, res, next) => {
  //Mongoose populate method to bring all data of refid(productId) and store it in items.productId Key
  req.user.populate('cart.items.productId').execPopulate()//exePopulate is used to return result as promise
    .then(user => {
      const products = user.cart.items;
      //console.log(userData);
      let total = 0;
      products.forEach(item => {
        total += item.quantity * item.productId.price;
      });

      res.render('shop/checkout', {
        path: '/checkout',
        pageTitle: 'Checkout',
        products: products,
        isAuthenticated: req.session.isLoggedIn,
        totalSum: total
      });
    })
    .catch(err => {
      //res.redirect('/500');
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error); //exceptional handling using express
    });
};


postOrder = (req, res, next) => {
  
  //Stripe Token is created using checkout or elements
  //get the payment token ID submitted by the form
  const token = req.body.stripeToken;//using express
  let total = 0;

  //add product detials in user document(stored in productId Key)
  req.user.populate('cart.items.productId').execPopulate()
    .then(user => {
      user.cart.items.forEach(p => {
        total += p.quantity * p.productId.price;
      });
         
      //arrange the data according to order schema
      const products = user.cart.items.map(i => {
        return { quantity: i.quantity, product: { ...i.productId._doc } };
      });
      //Create a new order
      const order = new Order({
        user: {
          username: req.user.email,
          userId: req.user._id
        },
        products: products
      });
      return order.save();
    })
    .then(result => {
      const charge = stripe.charges.create({
        amount: total * 100,
        currency: 'inr',
        description: 'Demo Order',
        source:token,
        metadata: { order_id: result._id.toString() } //store the payment id in stripe server
      }); 
      console.log("Order Created Successfully");
      //clear Cart
      return req.user.clearCart();
    })
    .then(() => {
      res.redirect('/orders');
    })
    .catch(err => {
      //res.redirect('/500');
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error); //exceptional handling using express
    });
};

//orders view
getOrders = (req, res, next) => {
  Order.find({ 'user.userId': req.user._id })
    .then(orders => {
      res.render('shop/orders', {
        path: '/orders',
        pageTitle: 'Orders',
        orders: orders,
        isAuthenticated: req.session.isLoggedIn
      });
    })
    .catch(err => {
      //res.redirect('/500');
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error); //exceptional handling using express
    });

};


getInvoice = (req, res, next) => {
  const orderId = req.params.orderId;

  Order.findById(orderId)
    .then(order => {
      if(!order){
        return next(new Error('No Order Found'));
      }
      if(order.user.userId.toString() !== req.user._id.toString()){
        //Show invoice only to that specific user not all users
        return next(new Error('Unauthorized Access for Invoice'));
      }

      const invoiceName = 'invoice-' + orderId + '.pdf';
      const invoicePath = path.join('data','invoices',invoiceName);

      const pdfDoc = new PDFDocument();
      res.setHeader('Content-Type','application/pdf');//Tell Browser file format
      res.setHeader('Content-Disposition','inline; filename="' + invoiceName + '"');//Tell browser to open pdf doc in browser itself
      pdfDoc.pipe(fs.createWriteStream(invoicePath));//write new pdf in specified path
      pdfDoc.pipe(res);//send pdf file to user

      pdfDoc.fontSize(26).text('Invoice',{
        underline: true
      });
      pdfDoc.text("--------------------------");//write in odf
      let totalPrice = 0;
      order.products.forEach(prod => {
        totalPrice += prod.quantity * prod.product.price;
        pdfDoc.fontSize(18).text(prod.product.title + ' - ' + prod.quantity + ' x ' + '$' + prod.product.price);
      });
      pdfDoc.text("--------------------------");
      pdfDoc.fontSize(22).text('Total Price: $'+ totalPrice);

      pdfDoc.end();

      /* //Not good for big files since node read full file, stores in memory then returns the file
        fs.readFile(invoicePath, (err, data) => {
          if(err){
            return next(err);
          }
          res.setHeader('Content-Type','application/pdf');//Tell Browser file format
          res.setHeader('Content-Disposition','inline; filename="' + invoiceName + '"');//Tell browser to open pdf doc in browser itself
          res.send(data);//send the pdf file resonse so user can download it via clicking link
        });
       */
      // const file = fs.createReadStream(invoicePath);//read file in chunks and send without storing in memory
      // file.pipe(res); //send res in stream, browser will download the data in chunks
    })
    .catch(err => next(err));
};


exports.getProducts = getProducts;
exports.getIndex = getIndex;
exports.getCart = getCart;
exports.getOrders = getOrders;
exports.getProduct = getProduct;
exports.postCart = postCart;
exports.postDeleteCartItem = postDeleteCartItem;
exports.postOrder = postOrder;
exports.getInvoice = getInvoice;
exports.getCheckout = getCheckout;