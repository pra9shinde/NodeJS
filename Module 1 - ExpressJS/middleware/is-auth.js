//Authentication check helper if not logged in redirect login page
module.exports = (req, res, next) => {
    if(!req.session.isLoggedIn){
        return res.redirect('/login');
    }
    next();
}