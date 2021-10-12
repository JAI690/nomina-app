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
        return res.redirect('/profile');
    },


    isNomina(req,res,next) {
        if(req.user.rol === 'admin'){
            return next();
        }else{
        if(req.user.rol === 'Nomina'){
            return next();
        }
    }
        return res.redirect('/profile');
    },

    isImss(req,res,next) {
        if(req.user.rol === 'admin'){
            return next();
        }else{
        if(req.user.rol === 'Imss'){
            return next();
        }}
        return res.redirect('/profile');
    },

    isEjecutivo(req,res,next) {
        if(req.user.rol === 'admin'){
            return next();
        }else{
        if(req.user.rol === 'Ejecutivo'){
            return next();
        }
    }
        return res.redirect('/profile');
    },

    isAdministrativo(req,res,next) {
        if(req.user.rol === 'admin'){
            return next();
        }else{
        if(req.user.rol === 'Administrativo'){
            return next();
        }
    }
        return res.redirect('/profile');
    }

};