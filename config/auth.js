const localStrategy = require("passport-local").Strategy
const mongoose = require("mongoose") // Para carregarmos o banco de dados aqui e os dados model User dele
const bcrypt = require("bcryptjs")
require("../models/User") // . para sair da pasta atual (config) e . para entrar em outra (models)
const Users = mongoose.model("users")

module.exports = function(passport){
    passport.use(new localStrategy({usernameField:'email', passwordField:'password'},(email, password, done) =>{ // Esse namefield deve ser o mesmo do name lá no HTML
        Users.findOne({email: email}).then((user) => {
            if(!user){
                return done(null, false, {message: 'Está conta não existe!'})
            }

            bcrypt.compare(password, user.password, (erro, equal) => {
                if(equal){ // password é o valor preenchido em passwordField pelo user. user.password é a senha desse user encontrada no mongo através do email fornecido
                    return done(null, user)
                }else{
                    return done(null, false, {message:'Senha incorreta'})
                }
            })
        })
    }))

    passport.serializeUser((user, done) =>{ // esse user agora representar aquele que passou pelo código acima e agora está logado. Não são o mesmo em termos de variável, são diferentes, onde esse aqui é um através do serializer detectamos estar online. Em outras palavras, ele poderia ter qualquer nome e foi o anterior, mas no momento da autenticação.
        done(null, user.id)
    })

    passport.deserializeUser((id, done) => { // comp
        Users.findById(id).then((user) => {
            done(null, user)
        }).catch((err) => {
            done(null, false, {message:"Erro de autenticação"})
        })
    })
}