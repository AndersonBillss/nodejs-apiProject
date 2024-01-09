const express = require('express')
const cardsRouter = express.Router()
const fs = require('node:fs')

const cards = require("../data/cards.json").cards


//card search
cardsRouter.get('/', (req, res) => {
    const query = req.query;

    const response = cards.filter(card => {
        return Object.keys(query).every(param => query[param] == undefined || query[param] == card[param]);
    });
    return res.json({ response: response})
})


//create cards
cardsRouter.post('/create', (req, res) => {
    let updatedCardArray = cards
    let newCard = req.body
    let newId = cards.length+1
    let newCardNumber = 1
    let cardSetIndex = cards.length
    for(i=1; i<cards.length+1; i++){
        if(cards[cards.length-i].set == newCard.set){
            newCardNumber = cards[cards.length-i].cardNumber + 1
            cardSetIndex = cards.length-i + 1
            break
        }
    }
    newCard.id = newId
    newCard.cardNumber = newCardNumber
    updatedCardArray.splice(cardSetIndex, 0, newCard)
    const formattedCardArray = {cards: updatedCardArray}
    fs.writeFile('./data/cards.json', JSON.stringify(formattedCardArray, null, 2), (err) => {
        if(err) throw err
    })
    return res.json({ response: 'new card created' })
})


//edit cards
cardsRouter.put('/:id', (req, res) => {
    let updatedCardArray = cards
    let updatedCard = req.body
    let cardIndex

    if(updatedCard.id == undefined){
        return res.status(404).json({ response: 'No card id specified' })
    }
    cards.forEach((card, index) => {
        if(card.id === updatedCard.id){
            cardIndex = index
        }
    })
    if(cardIndex == undefined){
        return res.status(404).json({ response: 'No card with specified id exists' })
    }
    if(updatedCard.set != undefined && cards[cardIndex].set != updatedCard.set){
        return res.status(400).json({ response: 'Cannot change the card set' })
    }
    if(updatedCard.cardNumber != undefined && cards[cardIndex].cardNumber != updatedCard.cardNumber){
        return res.status(400).json({ response: 'Cannot change the card number' })
    }

    updatedCardArray.splice(cardIndex, 1, updatedCard)
    const formattedCardArray = {cards: updatedCardArray}
    fs.writeFile('./data/cards.json', JSON.stringify(formattedCardArray, null, 2), (err) => {
        if(err) throw err
    })

    return res.json({ response: 'Card Edited' })
})


//delete cards
cardsRouter.delete('/:id', (req, res) => {
    let updatedCardArray = cards
    let deletedCard = req.body
    let cardIndex
    let cardSet

    cards.forEach((card, index) => {
        if(card.id === deletedCard.id){
            cardIndex = index
            cardSet = card.set
        }
    })
    for(i=cardIndex; i<cards.length; i++){
        if(cardSet === cards[i].set){
            updatedCardArray[i].cardNumber--
        }
    }

    updatedCardArray.splice(cardIndex, 1)
    const formattedCardArray = {cards: updatedCardArray}
    fs.writeFile('./data/cards.json', JSON.stringify(formattedCardArray, null, 2), (err) => {
        if(err) throw err
    })
    return res.json({ response: "Card deleted" })
})
module.exports = cardsRouter

/* function createCard(newCard){
    let updatedCardArray = cards
    let newCard = req.body
    let newId = cards.length+1
    let newCardNumber = 1
    let cardSetIndex = cards.length
    for(i=1; i<cards.length+1; i++){
        if(cards[cards.length-i].set == newCard.set){
            newCardNumber = cards[cards.length-i].cardNumber + 1
            cardSetIndex = cards.length-i + 1
            break
        }
    }
    newCard.id = newId
    newCard.cardNumber = newCardNumber
    updatedCardArray.splice(cardSetIndex, 0, newCard)
    const formattedCardArray = {cards: updatedCardArray}
    fs.writeFile('./data/cards.json', JSON.stringify(formattedCardArray, null, 2), (err) => {
        if(err) throw err
    })
} */