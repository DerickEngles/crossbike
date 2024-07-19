const mongoose = require("mongoose")
const Schema = mongoose.Schema
// Dentro da table crossbike, vamos criar essa collection
const Bike = new Schema({
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
    cost: {
        type: Number,
        required: true,
        default: 0.00
        // min: [0, 'O preço deve ser um valor positivo'] - Seria um validação extra antes de add no banco de dados
    },
    slug: {
        type: String,
        required: true
    },
    image: {
        type: String, // vamos guardar o caminho que levará a imagem e não a imagem em si no Mongoose
        required: true
    },
    date: {
        type: Date,
        default: Date.now()
    }
})

mongoose.model("bikes", Bike) // para conseguir usar em outros módulos.