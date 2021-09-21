module.exports = {
    isLoggedIn(req,res,next) {
        if (req.isAuthenticated()) {
            return next();
        }
        return res.redirect('/signin');
    },

    isNotLoggedIn(req,res,next) {
        if(!req.isAuthenticated()){
            return next();
        }
        return res.redirect('/profile');
    },

    isAdmin(req,res,next) {
        if(req.user.rol === 'admin'){
            return next();
        }
        return res.redirect('/leads');
    }
};