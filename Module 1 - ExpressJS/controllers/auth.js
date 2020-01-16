const bcrypt = require('bcryptjs');//data encryption
const nodemailer = require('nodemailer');//mail
const nodemailerSendGrid = require('nodemailer-sendgrid-transport');//thirdparty mailing service
const crypto = require('crypto');

const User = require('../models/user');

const transporter = nodemailer.createTransport(nodemailerSendGrid({
  auth: {
    user: 'pra9shinde',
    password: 'Pra9@shinde',
    api_key: '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'
  }
}));//mail config - api key from sendgrid

exports.getLogin = (req, res, next) => {
  let message = req.flash('error');
  if (message.length > 0) {
    message = message[0];
  }
  else {
    message = null;
  }

  res.render('auth/login', {
    path: '/login',
    pageTitle: 'Login',
    isAuthenticated: false,
    errorMessage: message //get error key if set in authentication
  });
};

exports.postLogin = (req, res, next) => {
  const email = req.body.email;
  const password = req.body.password;

  User.findOne({ email: email })
    .then(user => {
      if (!user) {
        req.flash('error', 'Invalid Email or Password');
        return res.redirect('/login');
      }
      bcrypt.compare(password, user.password)
        .then(passMatch => {
          if (passMatch) {
            req.session.isLoggedIn = true;
            req.session.user = user;
            return req.session.save(err => {
              console.log(err);
              return res.redirect('/');//Coreect Password
            });//save the session details and redirect
          }
          req.flash('error', 'Invalid Email or Password');
          res.redirect('/login');//wrong password 
        })
        .catch(err => {
          //res.redirect('/500');
          const error = new Error(err);
          error.httpStatusCode = 500;
          return next(error); //exceptional handling using express
        });
    })
    .catch(err => {
      //res.redirect('/500');
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error); //exceptional handling using express
    });
};

exports.postLogout = (req, res, next) => {
  req.session.destroy((err) => {
    console.log(err);
    res.redirect('/');
  });
};

exports.getSignup = (req, res, next) => {
  let message = req.flash('error');
  if (message.length > 0) {
    message = message[0];
  }
  else {
    message = null;
  }

  res.render('auth/signup', {
    path: '/signup',
    pageTitle: 'Signup',
    isAuthenticated: false,
    errorMessage: message //get error key if set in authentication
  });
};

exports.postSignup = (req, res, next) => {
  const email = req.body.email;
  const password = req.body.password;
  const confirmPass = req.body.confirmPassword;

  User.findOne({ email: email })
    .then(userDoc => {
      if (userDoc) {
        //exists
        req.flash('error', 'Email Address Already used');
        return res.redirect('/signup');
      }
      return bcrypt.hash(password, 12)//encrypt - returns promise 
        .then(hashedPassword => {
          const user = new User({
            email: email,
            password: hashedPassword,
            cart: { items: [] }
          });
          return user.save();
        })
        .then(result => {
          res.redirect('/login');
          return transporter.sendMail({
            to: email,
            from: 'pranavshnd006@gmail.com',
            subject: 'Signup Succeeded',
            html: '<h1>Thanks Mate</h1>'
          });//returns promise
        })
        .catch(err => {
          //res.redirect('/500');
          const error = new Error(err);
          error.httpStatusCode = 500;
          return next(error); //exceptional handling using express
        });
    })
    .catch(err => {
      //res.redirect('/500');
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error); //exceptional handling using express
    });
};

exports.getReset = (req, res, next) => {
  let message = req.flash('error');
  if (message.length > 0) {
    message = message[0];
  }
  else {
    message = null;
  }

  res.render('auth/reset', {
    path: '/reset',
    pageTitle: 'Reset',
    isAuthenticated: false,
    errorMessage: message //get error key if set in authentication
  });
};

exports.postReset = (req, res, next) => {
  //Create a unqiue random token for authentication
  crypto.randomBytes(32, (err, buffer) => {
    if (err) {
      console.log(err);
      return res.redirect('/reset');
    }
    const token = buffer.toString('hex');//convert token to string and store in user collection
    User.findOne({ email: req.body.email })
      .then(user => {
        if (!user) {
          req.flash('error', 'Not such email account');
          return res.redirect('/reset');
        }
        user.resetToken = token; //update the token in user collection
        user.resetTokenExpiration = Date.now() + 7800000;
        return user.save();
      })
      .then(result => {
        //send reset password link with unqiue token key for authentication
        res.redirect('/');
        transporter.sendMail({
          to: req.body.email,
          from: 'pranavshnd006@gmail.com',
          subject: 'Reset Password Link',
          html: `
          <p>You requested password reset </p>
          <p>Click this <a href="http://localhost:3000/reset/${token}">link</a> to set a new password </p>
        `
        });//returns promise
      })
      .catch(err => {
        //res.redirect('/500');
        const error = new Error(err);
        error.httpStatusCode = 500;
        return next(error); //exceptional handling using express
      });
  });
};

exports.getnewPassword = (req, res, next) => {
  const token = req.params.token;
  //validate th token and token expiration data(date should be greater than current date)
  User.findOne({ resetToken: token, resetTokenExpiration: { $gt: Date.now() } })
    .then(user => {
      let message = req.flash('error');
      if (message.length > 0) {
        message = message[0];
      }
      else {
        message = null;
      }

      res.render('auth/new-password', {
        path: '/new-password',
        pageTitle: 'New Password',
        isAuthenticated: false,
        errorMessage: message, //get error key if set in authentication
        userId: user._id.toString(),
        passwordToken: token
      });
    })
    .catch(err => {
      //res.redirect('/500');
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error); //exceptional handling using express
    });
};

//Updates the new Password
exports.postNewPassword = (req, res, next) => {
  const newPassword = req.body.password;
  const userId = req.body.userId;
  const token = req.body.passwordToken;
  let resetUser;

  //validate the token 
  User.findOne({
    resetToken: token,//assign to another variable for accessing in below promise return
    resetTokenExpiration: { $gt: Date.now() },
    _id: userId
  })
    .then(user => {
      resetUser = user;
      return bcrypt.hash(newPassword, 12);//encrypt passowrd
    })
    .then(hashedPassword => {
      //update password
      resetUser.password = hashedPassword;
      resetUser.resetToken = undefined;
      resetUser.resetTokenExpiration = undefined;
      return resetUser.save();
    })
    .then(result => {
      res.redirect('/login');
    })
    .catch(err => {
      //res.redirect('/500');
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error); //exceptional handling using express
    });
}