const express = require("express")
const handlebars = require("express-handlebars")
const handlebarsHelpers = require('handlebars-helpers') // me ajuda a executar lógica de if e else nos meus templates
const bodyParser = require("body-parser")
const app = express()
const admin = require("./routes/admin")
const public = require("./routes/public")
const path = require("path")
const mongoose = require('mongoose')
const session = require("express-session")
const flash = require("connect-flash")
require("./models/Bikes")
const Bike = mongoose.model("bikes")
require("./models/User")
const User = mongoose.model("users")
const users = require("./routes/user")
require("./models/Cart")
const Cart = mongoose.model("cart")
const passport = require("passport")
require("./config/auth")(passport)

// Configurações
    // Sessão
    app.use(session({
        secret: "crossbikeproject",
        resave: true,
        saveUninitialized: true
    }))
    app.use(passport.initialize())
    app.use(passport.session())
    app.use(flash())

    // Middleware para mensagens

    app.use((req, res, next) => {
        res.locals.success_msg = req.flash('success_msg')
        res.locals.error_msg = req.flash('error_msg')
        res.locals.error = req.flash('error')
        res.locals.user = req.user || null; // Para salvar os dados do user logado. O "null" será passado quando nenhum dado for incluído.
        next()
    })

    // Body Parser - vai salvar os dados do HTML no banco de dados
    app.use(bodyParser.urlencoded({extended: true}))
    app.use(bodyParser.json())

    // Handlebars
    app.engine('handlebars', handlebars.engine({defaultLayout: 'main', helpers: handlebarsHelpers()}))
    app.set('view engine', 'handlebars')
    // Error: ENOENT: no such file or directory, open 'C:\Users\derick_engles\Desktop\crossbike\views\layouts\main.handlebars' - o erro acontece, pois o express vai procurar dentro de views um arquivo chamado main conforme configurado (defaultLayout: 'main'). Além disso, ele vai procurar no diretório view em um diretório layouts.

    // Mongoose
    mongoose.Promise = global.Promise;
    mongoose.connect("mongodb://127.0.0.1:27017/crossbike").then(() => {
        console.log("Conectado ao mongo")
    }).catch((err) => {
        console.log("Erro ao se conectar: "+err)
    })

    // Path
    app.use(express.static(path.join(__dirname, 'public')))
    
// Rotas
    app.get('/', (req, res) => {
        //res.send('Página inicial da loja em desenvolvimento! Nela haverão as bikes para comprar')
        const images = [
            {
                url: '/image/carousel/new-model.jpg',
                alt: 'Bike 1',
                caption: 'Modelo futurista disponível em breve!',
                link: '/'
            },
            {
                url: '/image/carousel/adults.jpg',
                alt: 'Bike 2',
                caption: 'As melhores bikes para adultos!',
                link: 'usuarios/adultbikes'
            },
            {
                url: '/image/carousel/teens.jpg',
                alt: 'Bike 3',
                caption: 'As melhores bikes para teens!',
                link: 'usuarios/teenbikes'
            },
            {
                url: '/image/carousel/kids.jpg',
                alt: 'Bike 4',
                caption: 'As melhores bikes para kids!',
                link: 'usuarios/kidbikes'
            }
        ]
        Bike.find().lean().sort({data: "desc"}).then((bikes) => {
            res.render("index", {bikes: bikes, images: images}) // {} - o que está dentro das chaves conta apenas como um único template, sendo que o render aceita apenas 1  
        }).catch((err) => {
            console.log(`Erro ao enviar as bikes para a rota index no app.js` + err)
            req.flash('error_msg', 'Erro ao exibir as bikes!')
            res.redirect("/404")
        })
    })

    app.use("/admin", admin)

    app.use(public) // Deixe vazio, pois não quero que o aparece public/"rota de public" na barra do site

    app.use("/usuarios", users) // o primeiro representa o que vai aparecer no endereço do site e o segundo e a var que carrega as rotas do arquivo user.js aqui. Lembre-se que é com esse primeiro nome que sinalizamos 
// Outros
    const PORT = 8081;
    
    try{
        app.listen(PORT, () => { 
            console.log("Servidor rodando!")
        });
    } catch(error) {
        console.error('Erro ao iniciar' +error)
    }
    /*Uma Promise é um objeto em JavaScript que representa a eventual conclusão ou falha de uma operação assíncrona. 
    
    App listen retorna uma promise. Sendo assim, não é possível pegar o erro com uma catch*/
    
