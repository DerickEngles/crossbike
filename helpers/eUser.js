module.exports = {
    eUser: function(req, res, next){
        if(req.isAuthenticated()){
            return next();
        }
        req.flash('error_msg', 'Você precisar se registrar ou estar logado para acessar essa página!')
        res.redirect('/');
    }
}