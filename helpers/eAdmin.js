module.exports = {
    eAdmin: function(req, res, next){
        if(req.isAuthenticated() && req.user.eAdmin == 1){
            return next();
        }
        req.flash('error_msg', 'Você necessita ser um Usuário Admin para acessar essa página!')
        res.redirect('/')
    }
}