const express = require('express')
const { expressjwt } = require('express-jwt')
const cardsRouter = express.Router()

const secret = 'A string'
cardsRouter.get('/', (req, res) => {
    return res.json({ response: "cards"})
})
cardsRouter.post('/create', (req, res) => {
    return res.json({ response: "create card" })
})
cardsRouter.put('/:id', (req, res) => {
    return res.json({ response: "update card" })
})
cardsRouter.delete('/:id', (req, res) => {
    return res.json({ response: "delete card" })
})
module.exports = cardsRouter