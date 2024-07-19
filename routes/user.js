const express = require('express')
const router = express.Router()
const mongoose = require('mongoose')
require("../models/User")
const Users = mongoose.model("users")
require("../models/Bikes")
const Bikes = mongoose.model("bikes") // o nome vem do final do arquivo do Model Bikes que é forma como definimos a importação. O nome da var Bikes poderia ser Bike como em admin.js, mas fiz assim por preferência.
require("../models/Cart")
const Cart = mongoose.model("cart")
const bcrypt = require("bcryptjs")
const passport = require("passport")
const {eUser} = require("../helpers/eUser");

router.get("/registro", (req, res) => { // essa primeira é aquela que vai aparecer na barra do site
    res.render("users/register")
})

router.post("/registro", (req, res) => {
    var errors = []

    if(!req.body.name){
        errors.push({text: "Nome inválido"})
    }

    if(!req.body.email){
        errors.push({text: "E-mail inválido!"})
    }

    if(!req.body.password){
        errors.push({text: "Senha inválida!"})
    }

    if(req.body.password.length < 4){
        errors.push({text: "Senha com menos de 4 caracteres!"})
    }

    if(req.body.password != req.body.password2){
        errors.push({text: "As senhas não coincidem!"})
    }

    if(errors.length > 0){
        res.render("users/register", {errors:errors})
        
    }else{
        Users.findOne({email: req.body.email}).then((user) =>{
            if(user){
                req.flash('error_msg', 'Já existe um usuário cadastrado com esse e-mail!')
                res.render("users/register")
            }else{
                const newUser = new Users({
                    name: req.body.name,
                    email: req.body.email,
                    password: req.body.password
                })
                bcrypt.genSalt(10, (erro, salt) => {
                    bcrypt.hash(newUser.password, salt, (error, hash) => {
                        if(error){
                            console.log('Erro hasheamento da senha:' + error)
                            req.flash('error_msg', 'Houve um erro durante o salvamento do usuário!')
                            res.render("/")
                        }
                        newUser.password = hash

                        newUser.save().then(() => {
                            req.login(newUser, function(err) {
                                if(err){
                                    console.log('Erro ao autenticar o novo user no sistema:' + err)
                                    req.flash('error_msg', 'Erro ao fazer login após o registro!')
                                }
                                req.flash('success_msg', `Usuário registrado com sucesso! Bem-vindo, Sr(a) ${newUser.name}!`)
                                res.redirect('/')
                            })
                        }).catch((err) => {
                            console.log('Erro no momento de salvamento do usuário:' + err)
                            req.flash('error_msg', 'Houve erro ao registrar o usuário!')
                        })
                    })
                })
            }
        }).catch((err) => {
            console.log('Erro no sistema ao realizar a checagem do e-mail antes do salvamento: ' + err)
            req.flash('error_msg', 'Houve um erro interno!')
            res.redirect("/")
        })
    }
})

router.get("/edituser", eUser, (req, res) => {
    const id_user_auth = req.user._id // coletar o id do user logado
    Users.findOne({_id: id_user_auth}).lean().then((user) => {
        res.render("users/edituser", {user: user})
    }).catch((err) => {
        console.log('Erro ao tentar encontrar usuário no banco de dados:' + err)
        req.flash('error_msg', 'Usuário não encontrado!')
        res.render("/")
    })
})

router.post("/edituser", eUser, (req, res) => {
    const id_user_auth = req.user._id

    var errors = []

    if(!req.body.name){
        errors.push({text: "Nome inválido!"})
    }

    if(!req.body.email){
        errors.push({text: "E-mai inválido!"})
    }

    if(!req.body.password){
        errors.push({text: "Senha inválida"})
    }

    if(req.body.password.length < 4){
        errors.push({text: "Senha com menos de 4 caracteres!"})
    }

    if(req.body.password != req.body.password2){
        errors.push({text: "Senha não coincidem!"})
    }

    if(errors.length > 0){
        // res.render("usuarios/editaruser", {erros:erros, usuario: req.user} ) - essa estratégia do chatgpt não funcionou para evitar nova busca no banco de dados conforme código abaixo. Para resolver o problema, precisa fazer a passagem de req.user na rota get. COntudo deixarei para descobrir como fazer isso funcionar futuramente.
        Users.findOne({_id: id_user_auth}).lean().then((user) => {
            res.render("users/edituser", {errors: errors, user: user})
        }).catch((err) => {
            console.log('Erro ao tentar encontrar usuário no banco de dados:' + err)
            req.flash('error_msg', 'Usuário não encontrado!')
            res.render("/")
        })
        // res.render("users/edituser", {errors:errors}) - apenas com essa estratégia, não teremos todos os dados do user renderizados na página, mas apenas o id conforme checagem no código fonte
    }else{
        Users.findOne({_id: id_user_auth}).then((user) =>{
            user.name = req.body.name
            user.email = req.body.email
            user.password = req.body.password

            bcrypt.genSalt(10, (erro, salt) => {
                bcrypt.hash(user.password, salt, (erro, hash) => {
                    if(erro){
                        console.log(erro)
                        req.flash('error_msg', 'Houve um erro durante o hashamento e salvamento do usuário!')
                        res.redirect("/")
                    }
                    
                    user.password = hash

                    user.save().then(() => {
                        req.login(user, function(err) { // Para manter a sessão do usuário que alterou a senha
                            if(err){
                                console.error(err)
                                req.flash('error_msg', 'Erro ao manter a sessão do usuário!')
                                res.redirect('/')
                            }
                            req.flash('success_msg', `Atualização feita com sucesso, ${user.name}!`)
                            res.redirect("/")
                        })        
                    }).catch((err) => {
                        console.log(err)
                        req.flash('error_msg', 'Houve um erro ao registrar as alterações feitas!')
                    })
                })    
            })
        }).catch((err) => {
            console.log(err)
            req.flash('error_msg', 'Houve um erro ao tentar encontrar o usuário no banco de dados!')
            res.redirect("/")
        })
    }
})

router.get("/adultbikes", (req, res) => {
    Bikes.find({size: 'Adults'}).lean().sort({date: 'desc'}).then((bikes) => {
        res.render("users/adultbikes", {bikes: bikes})
    }).catch((err) => {
        console.log(err)
        req.flash('error_msg', 'Houve um erro na listagem de bicicletas para adultos!')
        res.redirect("/") // foi definida dessa forma em app.js.
    })    
})

router.get("/teenbikes", (req, res) => {
    Bikes.find({size: 'Teens'}).lean().sort({date: 'desc'}).then((bikes) => {
        res.render("users/teenbikes", {bikes: bikes})
    }).catch((err) => {
        console.log(err)
        req.flash('error_msg', 'Houve um erro na listagem de bicicletas para adultos!')
        res.redirect("/") // foi definida dessa forma em app.js.
    })    
})

router.get("/kidbikes", (req, res) => {
    Bikes.find({size: 'Kids'}).lean().sort({date: 'desc'}).then((bikes) => {
        res.render("users/kidbikes", {bikes: bikes})
    }).catch((err) => {
        console.log(err)
        req.flash('error_msg', 'Houve um erro na listagem de bicicletas para adultos!')
        res.redirect("/") // foi definida dessa forma em app.js.
    })    
})


router.post('/add-to-cart/:bikeId', eUser, (req, res) => {
    const userId = req.user._id;
    const bikeId = req.params.bikeId;

    // os res.json significa resposta json que é enviada pelo o HTML é convertida naquele script para um objeto json, pois esse response é uma informação cheia de informações extras misturadas com a informação que, realmente, necessitamos. Realizamos a conversação para um objeto json para que possamos usá-la no HTML 

    Cart.findOne({ userId: userId }).then(cart => {
        if (!cart) {
            const newCart = new Cart({
                userId: userId,
                items: [{ bikeId: bikeId, quantity: 1 }]
            });

            newCart.save().then(() => {
                res.json({ success: true, message: 'Produto adicionado ao carrinho com sucesso!' });
            }).catch((err) => {
                console.error('Erro ao criar um novo carrinho: ' + err);
                res.json({ success: false, message: 'Erro ao criar um novo carrinho.' });
            });
        } else {
            const itemIndex = cart.items.findIndex(item => item.bikeId.toString() === bikeId);

            if (itemIndex > -1) {
                cart.items[itemIndex].quantity += 1;
                console.log(`Quantidade atualizada para ${cart.items[itemIndex].quantity} em add-to-cart post`);
            } else {
                cart.items.push({ bikeId: bikeId, quantity: 1 });
                console.log('Novo item adicionado ao carrinho em add-to-cart.');
            }

            cart.save().then(() => {
                console.log('Carrinho atualizado com sucesso.');
                res.json({ success: true, message: 'Produto adicionado ao carrinho com sucesso!' });
            }).catch((err) => {
                console.error('Erro ao atualizar o carrinho: ' + err);
                res.json({ success: false, message: 'Erro ao atualizar o carrinho.' });
            });
        }
    }).catch(err => { // Mensagem de erro que será mostrada caso adentremos a rota e não tenha consigo acesso ao banco de dados.
        console.error('Erro ao acessar a rota add-to-cart: ' + err);
        res.json({ success: false, message: 'Erro ao adicionar o produto ao carrinho.' });
    });
});

router.post("/buy/:bikeId", eUser, (req, res) => { // a ideia é aquela abra, diretamente, a página do carrinho de compras. Precisaremos averiguar se o user está logado. Caso sim, o carrinho abrirá e, caso contrário, será exigido login ou registro desse user.
    // Com user logado, vamos buscar informações dele no banco de dados. Quando o user "finalizar a compra", ele será remitido para a tela inicial e uma mensagem de sucesso será disparada de compra efetuada com sucesso.
    // Os itens dele no carrinho devem ser excluídos.
    const userId = req.user._id // coletaremos o id do user logado
    const bikeId = req.params.bikeId; // virá via rota - por isso o final na url :bikeId

    Cart.findOne({ userId: userId }).then(cart => { // Para verificar se o user tem um documento dentro do carrinho de compras já específico para ele. Caso não, será criado. 
        if (!cart) {
            // Criar um novo carrinho se não existir
            const newCart = new Cart({
                userId: userId,
                items: [{ bikeId: bikeId, quantity: 1}]
            });

            newCart.save().then(() => {
                res.json({ success: true }); // O Fetch sempre necessita de uma resposta, seja de success ou error. Nesse sentido, nunca podemos deixar de fornecer essa resposta, pois, caso contrário, ele não receberá uma e cairá no catch do then como estava acontecendo.
            }).catch(err => {
                console.error('Erro ao criar um novo carrinho:' + err);
                res.json({ success: false, message: 'Erro ao criar um novo carrinho.' });
                res.redirect('/')
                /*
                req.flash('error_msg', 'Erro ao criar um novo carrinho.')
                res.redirect('/')*/
            });
        } else {
            // Caso o user já tenha um espaço no carrinho de compras, vamos verificar se já há produto no carrinho.
            const itemIndex = cart.items.findIndex(item => item.bikeId.toString() === bikeId); /* 
            O operador === é usado para comparar valores e tipos de dados, garantindo que ambos sejam iguais. No seu código, 
            item.bikeId.toString() === bikeId está comparando a versão em string do ID da bike armazenado no carrinho com o ID da bike que 
            está sendo adicionada. Ou seja, ele só não compara valores como é quando usamos == */

            if (itemIndex > -1) { // o que significa esse - 1? O -1 é para detectar se há já um produto com index. O -1 é para o caso não de não existir nenhum.
                // Se houver o item, aumenta +1
                cart.items[itemIndex].quantity += 1; // Se houver, ele procura esse item e adiciona
                console.log(`Quantidade atualizada para ${cart.items[itemIndex].quantity} em buy post.`);
            } else {
                cart.items.push({ bikeId: bikeId, quantity: 1}) // se não, ele insere no items do cliente que clicou no botão compra
                console.log('Novo item adicionado ao carrinho em buy.');
            }

            cart.save().then(() => { // Não adicionamos nenhum uma mensagem para o alert aqui, pois estaremos entrando no carrinho diretamente.
                res.json({ success: true });
            }).catch((err) => {
                console.error('Erro ao atualizar o carrinho na buy post!' + err);
                req.flash('error_msg', 'Erro ao atualizar o carrinho na buy post.')
                res.redirect('/')
            });
        }
    }).catch(err => {
        console.error('Erro ao adicionar produto ao carrinho na buy post no momento de procura do carrinho do user!' + err);
        res.json({ success: false, message: 'Erro ao adicionar o produto ao carrinho.' });
        res.redirect('/');
    })
})

/* Buy que funciona com form no button lá no HTML
router.post("/buy/:bikeId", eUser, (req, res) => { // a ideia é aquela abra, diretamente, a página do carrinho de compras. Precisaremos averiguar se o user está logado. Caso sim, o carrinho abrirá e, caso contrário, será exigido login ou registro desse user.
    // Com user logado, vamos buscar informações dele no banco de dados. Quando o user "finalizar a compra", ele será remitido para a tela inicial e uma mensagem de sucesso será disparada de compra efetuada com sucesso.
    // Os itens dele no carrinho devem ser excluídos.
    const userId = req.user._id // coletaremos o id do user logado
    const bikeId = req.params.bikeId; // virá via rota - por isso o final na url :bikeId

    Cart.findOne({ userId: userId }).then(cart => { // Para verificar se o user tem um documento dentro do carrinho de compras já específico para ele. Caso não, será criado. 
        if (!cart) {
            // Criar um novo carrinho se não existir
            const newCart = new Cart({
                userId: userId,
                items: [{ bikeId: bikeId, quantity: 1}]
            });

            newCart.save().then(() => {
                res.redirect('/usuarios/cart')
            }).catch(err => {
                console.error(err);
                req.flash('error_msg', 'Erro ao criar um novo carrinho.')
                res.redirect('/')
            });
        } else {
            // Caso o user já tenha um espaço no carrinho de compras, vamos verificar se já há produto no carrinho.
            const itemIndex = cart.items.findIndex(item => item.bikeId.toString() === bikeId); /* 
            O operador === é usado para comparar valores e tipos de dados, garantindo que ambos sejam iguais. No seu código, 
            item.bikeId.toString() === bikeId está comparando a versão em string do ID da bike armazenado no carrinho com o ID da bike que 
            está sendo adicionada. Ou seja, ele só não compara valores como é quando usamos == 

            if (itemIndex > -1) { // o que significa esse - 1? O -1 é para detectar se há já um produto com index. O -1 é para o caso não de não existir nenhum.
                // Se houver o item, aumenta +1
                cart.items[itemIndex].quantity += 1; // Se houver, ele procura esse item e adiciona
            } else {
                cart.items.push({ bikeId: bikeId, quantity: 1}) // se não, ele insere no items do cliente que clicou no botão compra
            }

            cart.save().then(() => {
                res.redirect('/usuarios/cart')
            }).catch((err) => {
                console.error(err);
                req.flash('error_msg', 'Erro ao atualizar o carrinho.')
                res.redirect('/')
            });
        }
    }).catch(err => {
        console.error(err);
        req.flash('error_msg', 'Erro ao adicionar o produto ao carrinho.');
        res.redirect('/');
    })
})
*/

router.get('/cart', eUser, (req, res) => {
    const userId = req.user._id;

    Cart.findOne({ userId: userId}).populate('items.bikeId').lean().then(cart => {
        if(!cart){
            res.render('users/cart', {item: []})
        } else {
            res.render('users/cart', {items: cart.items})
        }
    }).catch(err => {
        console.error(err)
        req.flash('error_msg', 'Erro ao carregar o carrinho de compras.')
        res.redirect('/')
    })
})

router.post('/update-cart/:bikeId', eUser, (req, res) => { // Para aumentar a quantidade do produto no carrinho
    const userId = req.user._id
    const bikeId = req.params.bikeId
    const action = req.body.action

    Cart.findOne({ userId: userId }).then(cart => { // vai encontrar o cart do user
        if (cart) { // caso encontrado
            const item = cart.items.find(item => item.bikeId.toString() === bikeId) // vamos procurar o item dentro do cart
            if (item) { // Encontrado o item, vamos realizar um processamento de acordo com o action, se foi de increase or decrease. Ele está vindo no body da mensagem lá no html
                if (action === 'increase') {
                    item.quantity += 1
                } else if (action === 'decrease') {
                    item.quantity -= 1
                    if (item.quantity <= 0) {
                        cart.items = cart.items.filter(item => item.bikeId.toString() !== bikeId)
                    }
                }
                cart.save().then(() => res.json({ success: true })).catch((err) => {
                    console.log('Erro ao realizar o salvamento de aumento e/ou diminuinação na rota update_cart: ' + err)
                    res.json({ success: false, message:'Erro ao salvar no carrinho'})
                })
            } else {
                res.json({ success:false, message: 'Item não encontrado no carrinho.'})
            }
        } else {
            res.json({ success: false, message: 'Carrinho não encontrado.'})
        }
    }).catch((err) => {
        console.log('Erro ao tentar encontrar o carrinho na rota update_cart ' + err)
        res.json({success: false, message: 'Erro ao atualizar o carrinho.'})
    })
})

router.post('/remove-from-cart/:bikeId', eUser, (req, res) => {
    const userId = req.user._id;
    const bikeId = req.params.bikeId

    Cart.findOne({ userId: userId}).then(cart => {
        if (cart) {
            cart.items = cart.items.filter(item => item.bikeId.toString() !== bikeId) // !== faz com que um novo array seja criado, mas sem os item cujos IDs correspondem ao id na const bikeId
            cart.save().then(() => res.json({ success: true}))
                        .catch(err => res.json({ success: false, message: 'Erro ao no carrinho.'}))
        } else {
            res.json({ success: false, message: 'Carrinho não encontrado.'})
        }
    }).catch(err => res.json({ success: false, message:' Erro ao remover o item do carrinho.'}))
})

router.post('/checkout', eUser, (req, res) => {
    const userId = req.user._id;
    
    // Primeiro, encontrar o carrinho do usuário
    Cart.findOne({ userId: userId }).then((cart) => {
        if (!cart || cart.items.length === 0) {
            // Se não houver carrinho ou o carrinho estiver vazio, retornar mensagem de erro
            console.log('Carrinho vazio!')
            res.json({ success: false, message: 'O carrinho está vazio. Você necessita selecionar os itens que deseja comprar antes!' });
        } else {
            // Se houver itens no carrinho, excluir o carrinho
            Cart.deleteOne({ userId: userId }).then(() => {
                // Responder com sucesso após a exclusão
                res.json({ success: true, message: 'Compra realizada com sucesso!' });
            }).catch((err) => {
                console.log('Erro ao remover item no carrinho na rota checkout: ' + err);
                res.json({ success: false, message: 'Erro ao finalizar a compra.' });
            });
        }
    }).catch((err) => {
        console.log('Erro ao encontrar item no carrinho para verificar na rota checkout: ' + err);
        res.json({ success: false, message: 'Erro ao finalizar a compra.' });
    });
});


router.get("/login", (req, res) => {
    res.render("users/login")
})

router.post("/login", (req, res, next) => {
    console.log(req.body) // É para ver se os dados estão chegando da página e, sim, estão. O problema deve ser com o passport - O problema estava no name do formulário, que estava como senha. Lembrando que esse nome, deve corresponder aquele colocado no passport
    passport.authenticate("local", {
        successRedirect: "/",
        failureRedirect: "/usuarios/login",
        failureFlash: true
    })(req, res, next)
})

router.get("/logout", (req, res) => {
    req.logOut((err) =>{
        if(err){
            req.flash('error_msg', 'Erro ao deslogar!')
            return next(err)
        }
    req.flash('success_msg', 'Deslogado com sucesso!')
    res.redirect("/")
    })
})

module.exports = router