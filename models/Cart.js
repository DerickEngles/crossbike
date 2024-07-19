const mongoose = require("mongoose")
const Schema = mongoose.Schema
// Dentro da table crossbike, vamos criar essa collection
const Cart = new Schema({
    userId: {
        type: Schema.Types.ObjectId,
        ref: 'users',
        required: true
    },
    items: [
        {
            bikeId: {
                type: Schema.Types.ObjectId,
                ref: 'bikes', // o que esse ref significa?? É o nome do model ao qual estamos fazendo referência, no caso o model é o Bikes.js. No caso, conforme configuramos no rodapé do model, ele tem o nome "bikes" em outros módulos.
                required: true
            },
            quantity: {
                type: Number,
                required: true,
                default: 0 // Estava 1 no código do chat, mas ele já está colocando 1 quando add o produto pela primeira vez na rota.
            }
        }
    ],
    date: {
        type: Date,
        default: Date.now()
    }
});

mongoose.model("cart", Cart) // para conseguir usar em outros módulos.

// A maneira como o modelo Cart foi arquitetado é para criar um carrinho de compras para cada usuário. Cada usuário terá um único documento de carrinho no banco de dados, e esse documento armazenará todos os itens que o usuário adicionou ao carrinho.

        /*  
        FAREMOS UMA MODIFICAÇÃO, PARA SÓ SALVAR O ID DO PRODUTO VINDO DE INDEX. COM ELE, CONSEGUIREMOS FAZER ACESSO AS INFORMAÇÕES DO PROTUDO ATRAVÉS DO MODEL BIKE  
            image: {
                type: String, // vamos guardar o caminho que levará a imagem e não a imagem em si no Mongoose
                required: true
            },
            model: { // nome da bike
            type: String,
            required: true
            },
            description: {
                type: String,
                required: true
            },
            size: { 
                type: String,
                required: true
            },
            quantity:{
                type: Number,
                required: true,
                default: 1
            },
            cost: {
                type: Number,
                required: true,
                default: 0.00
                // min: [0, 'O preço deve ser um valor positivo'] - Seria um validação extra antes de add no banco de dados
            }*/