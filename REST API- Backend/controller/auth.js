const { validationResult } = require('express-validator/check');
const bcrypt = require('bcryptjs');
const jsonToken = require('jsonwebtoken');

const User = require('../models/usr');


exports.signup = (req, res, next) => {
  const errors = validationResult(req);
  if(!errors.isEmpty()){
    const error = new Error('Validation Failed');
    error.statusCode = 422;
    error.data = errors.array();
    throw error;
  }

  const email = req.body.email;
  const name = req.body.name;
  const password = req.body.password;
  bcrypt.hash(password,12)
    .then(hashedPass => {
      const user = new User({
        email: email,
        password: hashedPass,
        name: name
      });
      return user.save();
    })
    .then(result => {
      res.status(201).json({ message: 'User Created', userId: result._id});
    })
    .catch(err => {
    if(!err.statusCode){
      err.statusCode = 500;
    }
    next(err);
  });
  
};

exports.login = (req, res, next) => {
  const email = req.body.email;
  const password = req.body.password;
  let loadedUser;

  User.findOne({email: email})
    .then(user => {
      if(!user){
        const error = new Error('No User Found');
        error.statusCode = 401;
        throw error;
      }
      loadedUser = user;
      return bcrypt.compare(password, user.password);
    })
    .then(passwordMatch => {
      if(!passwordMatch){
        const error = new Error('Wrong Password');
        error.statusCode = 401;
        throw error;
      }
      const token = jsonToken.sign({
          email: loadedUser.email,
          userId: loadedUser._id.toString()
        }, 'secretkey' , { expiresIn: '1h'}
      ); //pass the data and a unique token excrypted with specified with secretkey
      res.status(200).json({token: token, userId: loadedUser._id.toString()});
    })
    .catch(err => {
      if(!err.statusCode){
        err.statusCode = 500;
      }
      next(err);
    });
};