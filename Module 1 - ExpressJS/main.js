const express = require('express');
const fs = require('fs');
const bodyParser = require('body-parser');
const path = require('path');
const mongoose = require('mongoose');
const session = require('express-session');
const MongoDBStore = require('connect-mongodb-session')(session);//for storing sessions in mongodb
const flash = require('connect-flash');//error message package
const multer = require('multer');//captures file inputs from from
const helmet = require('helmet');//adds security headers to all req and res for better sercurity
const compression  = require('compression');//compress css and js files
const morgan = require('morgan');//create logs

//Routes
const adminRoutes = require('./routes/admin');
const shopRoutes = require('./routes/shop');
const authRoutes = require('./routes/auth');

//Controllers
const error404Controller = require('./controllers/error404');
//Models
const User =  require('./models/user');

const MONGODB_URI = `mongodb+srv://${process.env.MONGO_USER}:${process.env.MONGO_PASSWORD}@cluster0-k1sbw.mongodb.net/${process.env.MONGODB_NAME}?retryWrites=true&w=majority`;
// const MONGODB_URI = 'mongodb+srv://pranav:dLAjKx3ac7t2cgbG@cluster0-k1sbw.mongodb.net/shop?retryWrites=true&w=majority';

const app = express();
const store = new MongoDBStore({
    uri: MONGODB_URI,
    collection: 'sessions'
});//mongo session constructor init
app.use(session({
    secret: 'secret key', //for encryption
    resave: false, 
    saveUninitialized:false,
    store: store //storage location(mongodb)
}));//session init
app.use(flash());//flash error messages uisng session

app.set('view engine', 'ejs');//Templating Engine
app.set('views','views');//location of views folder which contains html

//Parser which is used to collect input data from the req
app.use(bodyParser.urlencoded({extended : false}));

const fileStorage = multer.diskStorage({
    destination: (req,file,cb) => {
        cb(null, 'images');//null to tell multer store the file,store files in images folder
    },
    filename: (req, file, cb) => {
        cb(null, new Date().toISOString() + '-' + file.originalname);
    }
});

const fileFilter = (req, file, cb) => {
    if(file.mimetype === 'image/png' || file.mimetype === 'image/jpg' || file.mimetype === 'image/jpeg'){
        cb(null,true);
    }
    else{
        cb(null,false);
    }
};

const accessLogStream = fs.WriteStream(path.join(__dirname,'access.log'),{flags: 'a'});

app.use(helmet());
app.use(compression());
app.use(morgan('combined',{ stream: accessLogStream }) );
app.use(multer({storage: fileStorage, fileFilter: fileFilter}).single('image'));//image is a post add product image field present in form
app.use(express.static(path.join(__dirname,'public')));//created for linking of css files or frontend files directly into html. base url will not be required in html files since we made public folder as static
app.use('/images',express.static(path.join(__dirname,'images')));

app.use((req,res,next) => {
    if (!req.session.user) {
        return next();
    }
    //Create a req.user object on each and every request and store the user data, create in session after login
    User.findById(req.session.user._id)
    .then(user => {
        req.user = user;//Initialize constructor of User Class and pass the fetched user values
        next();
    })
    .catch(err => {
        next(new Error(err));
    });
});

app.use('/admin',adminRoutes);//all urls starting with admin will be routed to adminRoute and it also adds /admin before all of its routes
app.use(shopRoutes);//Shop page route
app.use(authRoutes);
app.get('/500',error404Controller.get500);
app.use(error404Controller.pageNotFound);//any dummy url sent by user send 404 page

//Exceptions thrown via next function argument will be handled here(eg: next(err))
app.use((error, req, res, next) => {
    res.status(500).render('500', { 
        pageTitle : 'Error Page : 500',
        path : '/404',
        isAuthenticated: req.session.isLoggedIn
    });
});


//connect db
mongoose.connect(MONGODB_URI)
.then(result => {
    app.listen(process.env.PORT || 3000);
})
.catch(err => console.log(err));
 
/*
     MYSQL Sequelize
     const sequelize = require('./util/database');
    const Product = require('./models/product');
    const User = require('./models/user');
    const Cart = require('./models/cart');
    const CartItem = require('./models/cart-item');
    const Order = require('./models/order');
    const OrderItem = require('./models/order-item');

    //Database Relations using Sequelize
    Product.belongsTo(User,{ contraints : true, onDelete : 'CASCADE'});//Product belongs to user, if user is delete delete product as well(onDelete : 'Cascade')
    User.hasMany(Product);
    User.hasOne(Cart);
    Cart.belongsTo(User);
    Cart.belongsToMany(Product, {through: CartItem});
    Product.belongsToMany(Cart, {through: CartItem});
    Order.belongsTo(User);
    User.hasMany(Order);
    Order.belongsToMany(Product, {through: OrderItem});

    sequelize.sync().then(result => {
        return User.findByPk(1);
    }).then(user => {
        if(!user){
            User.create({ name : 'Pranav', email : 'test@test.com'});
        }
        return user;
    }).then(user => {
        //console.log(user);
        user.createCart();
    
    }).then(cart => {
        app.listen(3000);
    }).catch(err => console.log(err));
*/
