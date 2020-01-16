exports.pageNotFound = (req,res,next) => {
    res.status(404).render('404', { pageTitle : 'Page Not Found : 404', path : '/404',isAuthenticated: req.session.isLoggedIn});
};

exports.get500 = (req,res,next) => {
    res.status(500).render('500', { 
        pageTitle : 'Error Page : 500',
        path : '/404',
        isAuthenticated: req.session.isLoggedIn
    });
};