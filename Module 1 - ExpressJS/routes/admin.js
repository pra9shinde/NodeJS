const express = require('express');
const router = express.Router();

//controllers
const adminController = require('../controllers/admin');
//Helpers
const isAuth = require('../middleware/is-auth');

//admin/add-product
router.get('/add-product', isAuth, adminController.getAddProduct);
router.post('/add-product',  isAuth, adminController.postAddProduct);//Recieves only Post request when Add product from is submitted

router.get('/products', isAuth,  adminController.getProducts);
router.get('/edit-product/:productId', isAuth, adminController.getEditProduct);//edit product page load router

router.post('/edit-product', isAuth, adminController.postEditProduct);//update data of edit product page request
router.post('/delete-product/:productId', isAuth, adminController.deleteProduct);

module.exports = router;