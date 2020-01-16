//Import Model Class
const Product = require('../models/product');
const fileHelper = require('../util/file-helper');

getAddProduct = (req, res, next) => {
    if (!req.session.isLoggedIn) {
        return res.redirect('/login');
    }
    res.render('admin/edit-product', {
        pageTitle: "Add Product",
        path: "/admin/add-product",
        editing: false,
        isAuthenticated: req.session.isLoggedIn
    });
};

postAddProduct = (req, res, next) => {
    //Form Data
    const title = req.body.title;//req.body.title will give the textfield data
    const image = req.file;
    const price = req.body.price;
    const description = req.body.description;
    if(!image){
        return res.redirect('/');
    }
    const imageUrl = image.path;

    const product = new Product({
        title: title,
        price: price,
        description: description,
        imageUrl: imageUrl,
        userId: req.user._id
    });
    //insert using mongoose save method
    product.save()
        .then(result => {
            res.redirect('/admin/products');
        })
        .catch(err => {
            //res.redirect('/500');
            const error = new Error(err);
            error.httpStatusCode = 500;
            return next(error); //exceptional handling using express
        });
};

//Load Edit Product Page with prepopulated data
getEditProduct = (req, res, next) => {
    const editMode = req.query.edit; //fetches the query string from url and sets the value of edit if found. edit is the key name passed in url
    if (!editMode) {
        return res.redirect('/');
    }
    const prodId = req.params.productId;//fetch prod id from url
    Product.findById(prodId)
        .then(product => {
            if (!product) {
                return res.redirect('/');
            }
            res.render('admin/edit-product', {
                pageTitle: "Edit Product",
                path: "/admin/edit-product",
                editing: editMode,
                product: product,
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

//update the edited data of edit product request
postEditProduct = (req, res, next) => {
    const prodId = req.body.productId;
    const updatedTitle = req.body.title;
    const updatedPrice = req.body.price;
    const image = req.file;
    const updateDesc = req.body.description;

    //Fetch the product which needs to be updated
    Product.findById(prodId).then(product => {
        if (product.userId.toString() !== req.user._id.toString()) {
            return res.redirect('/'); //Other users should not delete this product
        }
        product.title = updatedTitle;
        product.price = updatedPrice;
        product.description = updateDesc;
        if(image){
            //new image uploaded by user
            fileHelper.deleteFile(product.imageUrl);
            product.imageUrl = image.path;
        }
        return product.save().then(result => {
            //above promise also returns a promise he fetch that above promise here
            console.log("Product Updated");
            res.redirect('/admin/products');;//mongoose save method
        })

    })
        .catch(err => {
            //res.redirect('/500');
            const error = new Error(err);
            error.httpStatusCode = 500;
            return next(error); //exceptional handling using express
        });
};

getProducts = (req, res, next) => {
    Product.find({ userId: req.user._id })
        //.populate('userId')//fetch the all the details of the the ref id and store it userId key(all user data will be fetched in this case instead of manually)
        .then(products => {
            res.render('admin/products', {
                prods: products,
                docTitle: 'Admin Products',
                path: '/admin/products',
                pageTitle: 'Admin Products',
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

deleteProduct = (req, res, next) => {
    const prodId = req.params.productId.trim();
    Product.findById(prodId)
        .then(product => {
            if(!product){
                return next(new Error('Product Not Found!!'));
            }
            fileHelper.deleteFile(product.imageUrl);
            return Product.deleteOne({ _id: prodId, userId: req.user._id });
        })
        .then(product => {
            console.log('Product Deleted');
            res.status(200).json({message: 'Product Deleted Successfully'});
        })
        .catch(err => {
            res.status(500).json({message: 'Failed Deleting Product'});
        });
};

exports.getAddProduct = getAddProduct;
exports.postAddProduct = postAddProduct;
exports.getProducts = getProducts;
exports.getEditProduct = getEditProduct;
exports.postEditProduct = postEditProduct;
exports.deleteProduct = deleteProduct;