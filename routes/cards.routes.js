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
    return res.json({ response: response })
})


//create cards
cardsRouter.post('/create', (req, res) => {
    let newCard = req.body
    newCard.id = undefined
    const result = createCard(newCard)
    return res.status(result.status).json({ response: result.msg })
})


//edit cards
cardsRouter.put('/:id', (req, res) => {
    const editedCard = req.body
    let result

    cards.forEach((card) => {
        if(card.id === editedCard.id){
            editedCard.cardNumber = editedCard.cardNumber || card.cardNumber
            editedCard.set = editedCard.set || card.set
        }
    })

    let creationResult
    const deletionResult = deleteCard({id: editedCard.id})
    result = deletionResult
    if((deletionResult.status + '')[0] == 2){
        creationResult = createCard(editedCard)
        result = creationResult
        if((creationResult.status + '')[0] == 2){
            result = {status: 200, msg: `Card edited`}
        }
    }

    return res.status(result.status).json({ response: result.msg })
})


//delete cards
cardsRouter.delete('/:id', (req, res) => {
    let deletedCard = req.body
    const result = deleteCard(deletedCard)
    return res.status(result.status).json({ response: result.msg })
})
module.exports = cardsRouter






function createCard(newCard){
    if(newCard.cardNumber < 0){
        return({status: 400, msg: `Card number doesn't line up (card number cannot be negative)`})
    }
    let updatedCardArray = cards
    let newId = newCard.id || -1
    if(newCard.id < 0){
        cards.forEach(card => {
            if(card.id >= newId){
                newId = card.id+1
            }
        })
    }
    let newCardNumber = newCard.cardNumber || -1
    let cardSetIndex = cards.length
    for(i=1; i<cards.length+1; i++){
        if(cards[cards.length-i].set == newCard.set){
            if(newCardNumber < 0){
                newCardNumber = cards[cards.length-i].cardNumber+1
                cardSetIndex = cards.length-i + 1
            } else {
                for(j=i; j<=cards.length; j++){
                    if(cards[cards.length-j].set === newCard.set){
                        if(cards[cards.length-j].cardNumber >= newCardNumber){
                            cards[cards.length-j].cardNumber++
                            cardSetIndex = (cards.length-j)
                        } else {
                            cardSetIndex = (cards.length-j)+1
                            break
                        }
                    }
                }
            }
            break
        }
    }

    newCard.id = newId
    newCard.cardNumber = newCardNumber
    updatedCardArray.splice(cardSetIndex, 0, newCard)


    if(cards[0].cardNumber != 1){
        updatedCardArray.splice(cardSetIndex, 1)
        return({status: 400, msg: `Card number doesn't line up (cardNumber for set does not start with 1)`})
    }
    for(i=0; i<updatedCardArray.length-1; i++){
        console.log(i)
        const card = updatedCardArray[i]
        const nextcard = updatedCardArray[i+1]
        if(nextcard.cardNumber != card.cardNumber+1 && card.set === nextcard.set){
            updatedCardArray.splice(cardSetIndex, 1)
            return({status: 400, msg: `Card number doesn't line up: cardNumber goes from ${card.cardNumber} to ${nextcard.cardNumber}. The card number is only supposed to increase by 1 between the two cards`})
        }
        if(card.set !== nextcard.set){
            if(nextcard.cardNumber != 1){
                updatedCardArray.splice(cardSetIndex, 1)
                return({status: 400, msg: `Card number doesn't line up (cardNumber for set does not start with 1)`})
            }
        }
    }

    const formattedCardArray = {cards: updatedCardArray}
    fs.writeFile('./data/cards.json', JSON.stringify(formattedCardArray, null, 2), (err) => {
        if(err) throw err
    })
    return({status: 200, msg: `Card Created`})
}


function deleteCard(deletedCard){
    let updatedCardArray = cards
    let cardIndex
    let cardSet

    cards.forEach((card, index) => {
        if(card.id === deletedCard.id){
            cardIndex = index
            cardSet = card.set
        }
    })
    if(cardIndex === undefined){
        return({status: 400, msg: `there is no card with an id of ${deletedCard.id}`})
    }
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
    return({status: 200, msg: `Card Deleted`})
}