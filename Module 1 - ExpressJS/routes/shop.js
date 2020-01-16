const express = require('express');
//Helpers
const isAuth = require('../middleware/is-auth');
//Controllers
const shopController = require('../controllers/shop');

const router = express.Router();

router.get('/',shopController.getIndex);
router.get('/products',shopController.getProducts);
router.get('/products/:productId', shopController.getProduct);//When user clicks product details - ID is passed and captured in productId

router.get('/cart', isAuth, shopController.getCart);
router.post('/cart', isAuth, shopController.postCart);//Post req
router.post('/cart-delete-item', isAuth, shopController.postDeleteCartItem);//post request for deleting item from cart

router.get('/orders', isAuth, shopController.getOrders);
router.post('/create-order', isAuth,  shopController.postOrder);

//Invoice
router.get('/orders/:orderId', isAuth, shopController.getInvoice);

//Checkout
router.get('/checkout', isAuth, shopController.getCheckout);
module.exports = router;
