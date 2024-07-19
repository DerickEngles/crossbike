const express = require("express")
const router = express.Router()
const mongoose = require("mongoose") // vou precisar puxar os produtos para cá
require("../models/Bikes")
const Bike = mongoose.model("bikes")

router.get("/contato", (req, res) => {
    res.render("public/contact")
})

router.post("/contato", (req, res) => { // conseguimos coletar as informações daquela página, pois estamos recebendo um post dela
    let erros = []

    if(!req.body.name){
        erros.push({text: "Informe seu nome!"})
    }

    if(!req.body.email){
        erros.push({text: 'E-mail inválido!'})
    }

    if(!req.body.message){
        erros.push({text: "Digite sua mensagem!"})
    }

    if(erros.length > 0){
        res.render("public/contact", {erros: erros})
    }else{
        contact_data = {"Name": req.body.name, "E-mail": req.body.email, "Message:": req.body.message}
        try{
            console.log(`Mensagem recebida:\n${JSON.stringify(contact_data, null, 2)}`)
        // A função stringy converte o objeto em uma string formatada. O segundo argumento (null) é um replacer opcional para a função JSON.stringify, e o terceiro argumento (2) é para definir a indentação na string JSON (neste caso, 2 espaços).
        // Esse replacer é utilizado para dizer como o JSON vai exibir os dados. Ele é opcional, ou seja, não é necessária ser preenchido, nem mesmo por null.
            req.flash('success_msg', 'Mensagem enviada com sucesso! Entraremos em contato o mais breve possível.')
            res.redirect("/")
        } catch(error){
            console.error('Erro no recebimento de mensagem na área de contato:'+ error)
            res.redirect("/public/contact")
        }
    }
})

router.get("/quemsomos", (req, res) => {
    res.render("public/who")
})

module.exports = router