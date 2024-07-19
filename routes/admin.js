// Cada rota que criamos 

const express = require("express")
const router = express.Router() // Router é uma função do express para criar rotas fora do arquivo principal 
const mongoose = require("mongoose")
const multer = require("multer")
require("../models/Bikes")
const Bike = mongoose.model("bikes") // the name at the of model Bike.js which is the name that I use when I want to use the model in other files
const {eAdmin} = require("../helpers/eAdmin")

const storageBikes = multer.diskStorage({
    destination: function(req, file, cb){
        cb(null, 'public/image/bikes');
    },
    filename: function(req, file, cb){
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
        cb(null, uniqueSuffix + '-' + file.originalname);
    }
});

const bikesUpload = multer({storage: storageBikes});

router.get("/", eAdmin, (req, res) => {
    // res.send("Página Inicial da Administração")
    res.render("admin/index")
})

router.get("/bikes", eAdmin, (req, res) => {
    Bike.find().lean().sort({date: 'desc'}).then((bikes) => {
        res.render("admin/bikes", {bikes: bikes})
    }).catch((err) => {
        console.log(err)
        req.flash('error_msg', 'Houve um erro na listagem de bicicletas vindas do banco de dados')
        res.redirect("/admin")
    })
})

router.get("/bikes/add", eAdmin, (req, res) => { // vai renderizar a página para add bikes e nela haverá um botão que vai direcionar para a rota post abaixo
    res.render("admin/addbikes")
})

router.post("/bikes/addpost", eAdmin, bikesUpload.single("image"), (req, res) => {
    console.log(`Dados recebidos do front-end: ${JSON.stringify(req.body)}`)/* é um objeto JavaScript que contém os dados da solicitação HTTP recebida no corpo (body) da requisição. Quando você usa JSON.stringify(req.body), você está convertendo esse objeto JavaScript para uma string JSON.
    O motivo para utilizar JSON.stringify na impressão de req.body é que, ao usar template literals (crases) no JavaScript, a interpolação de objetos diretamente dentro de uma string pode causar o erro "Cannot convert object to primitive value". Portanto, usando JSON.stringify, você converte o objeto para uma string JSON antes de inseri-lo na string de log. */
    
    let errors = []

    if(!req.body.model){
        errors.push({text: "Modelo inválido!"})
    }
    if(!req.body.description){
        errors.push({text: "Descrição inválida!"})
    } // Checar caso eu preencha como kids teen adult - SERÁ QUE ELE ACEITA? SE SIM, UMA VALIDAÇÃO MAIS PROFUNDA PRECISA SER FEITA. FEITO - da forma como configurado, ele aceita apenas uma das três palavras digitas da forma como consta na lista.
    if(!req.body.size || !["Kids", "Teens", "Adults"].includes(req.body.size)){ // se req.body.size for nulo ou se não for um dos valores da lista, então um erro será acrescentado a lista.
        errors.push({text: "Tamanho inválido ou não preenchido com um dos valores corretos (Kids, Teen ou Adulto)!"})
    }
    if(!req.body.cost || Number(req.body.cost) < 0){
        errors.push({text: "Valor inválido!"})
    }
    if(!req.body.slug){
        errors.push({text: "Slug inválida!"})
    }
    image_path_default = "/image/bikes/default.png"
    if(req.file){
        const correctedpath = req.file.path.replace(/\\/g, '/');
        const pathWithoutPublic = correctedpath.replace('public/', '/');
        image_path_default = pathWithoutPublic
    }
    if(errors.length > 0){
        res.render("admin/addbikes", {errors: errors})
    }else{
        
        const newProduct = {
            model: req.body.model, // os nomes dos campos agora fazem referência ao que foi definido em model
            description: req.body.description,
            size: req.body.size,
            cost: req.body.cost,
            slug: req.body.slug,
            image: image_path_default
        }

        new Bike(newProduct).save().then(() =>{
            req.flash('success_msg', 'Novo produto adicionado com sucesso!')
            res.redirect('/admin/bikes')
        }).catch((err) => {
            req.flash('error_msg', 'Houve um erro durante o salvamento do produto na base de dados!')
            res.redirect('/admin/bikes')
        })
    }
})

router.get("/bikes/editar/:id", eAdmin, (req, res) => { // esse id está vindo de forma dinâmica, o que significa que ele está sendo passado pela botão no template bikes 
    // e através dele estamos fazendo a consulta
    Bike.findOne({_id: req.params.id}).lean().then((bike) => {
        res.render("admin/editbike", {bike: bike})
    }).catch((err) => {
        console.log('Erro ao clicar para editar a bike: ' + err)
        req.flash('error_msg', 'Este produto não existe!')
        res.redirect("admin/bikes")
    })
})

router.post("/bikes/editpost/", eAdmin, bikesUpload.single("image"), (req, res) => { // image é o nome do campo em bike referente a imagem
    let errors = []

    if(!req.body.model){
        errors.push({text: "Modelo inválido!"})
    }
    if(!req.body.description){
        errors.push({text: "Descrição inválida!"})
    }
    if(!req.body.cost || Number(req.body.cost) < 0){
        errors.push({text: "Valor inválido!"})
    } 
    if(!req.body.size || !["Kids", "Teens", "Adults"].includes(req.body.size)){ // se req.body.size for nulo ou se não for um dos valores da lista, então um erro será acrescentado a lista.
        errors.push({text: "Tamanho inválido ou não preenchido com um dos valores corretos (Kids, Teen ou Adulto)!"})
    }
    if(!req.body.slug){
        errors.push({text: "Slug inválida!"})
    }

    let new_image = "" // não é necessário criar uma let para o valor default, pois estaremos assumindo que uma nova imagem foi enviada (if(req.file)) ou não foi e manteremos a antiga conforme lógica no momento de moficação do produto abaixo.
    if(req.file){
        const correctedpath = req.file.path.replace(/\\/g, '/');
        const pathWithoutPublic = correctedpath.replace('public/', '/');
        new_image = pathWithoutPublic
    }
    if(errors.length > 0){
        res.render("admin/addbikes", { errors: errors, bike: req.body });
    }else{

        Bike.findOne({_id: req.body.id}).then((bike) => { 
            bike.model = req.body.model
            bike.description = req.body.description
            bike.cost = req.body.cost
            bike.size = req.body.size
            bike.slug = req.body.slug

            if(new_image){
                bike.image = new_image
            }else{
                bike.image = bike.image
            }
        
            bike.save().then(() =>{
                req.flash('success_msg', `Produto intitulado ${bike.model} editado com sucesso!`)
                res.redirect("/admin/bikes")
            }).catch((err) => {
                console.log('Erro ao salvar edições feitas no produto na bikeeditpost', err)
                res.redirect("/admin/bikes")
            })
        
        }).catch((err) => {
            console.log('Erro em bikeeditpost ao tentar carregar o produto', err)
            req.flash('error_msg', 'Houve um erro ao tentar encontrar o produto!')
            res.redirect("/admin/bikes")
        })
    }
}) 

router.post("/bikes/deletar", eAdmin, (req, res) => { // é do tipo post, pois ela recebe o id da bike, na qual clicarmos para exclusão
    Bike.deleteOne({_id: req.body.id}).then(() => {
        req.flash('success_msg', 'Produto deletado com sucesso!')
        res.redirect('/admin/bikes')
    }).catch((err) => {
        console.log('Erro ocorrido: ', err);
        req.flash('error_msg', 'Houve um erro ao deletar o produto!')
        res.redirect('/admin/bikes')
    })
}) 
module.exports = router