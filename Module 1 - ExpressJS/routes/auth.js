const express = require('express');

const authController = require('../controllers/auth');

const router = express.Router();

router.get('/login', authController.getLogin);
router.post('/login',authController.postLogin);

router.post('/logout',authController.postLogout);

router.post('/signup', authController.postSignup);
router.get('/signup', authController.getSignup);

router.get('/reset', authController.getReset);
router.post('/reset', authController.postReset);

router.get('/reset/:token', authController.getnewPassword);
router.post('/new-password', authController.postNewPassword);

module.exports = router;