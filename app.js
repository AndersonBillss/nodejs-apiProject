const express = require('express')
const jwt = require('jsonwebtoken')
const { expressjwt } = require('express-jwt')

const cardsRouter = require('./routes/cards.routes.js')

const users = require("./data/users.json").users
const port = 3000

const secret = 'A string'

const app = express()
app.use(express.json())

app.post('/getToken', (req, res) => {
    const { username, password } = req.body
    const user = users.find((currUser) => currUser.username === username)
    if(!user || user.password !== password){
        return res.status(401).json({ errorMessage: "Invalid Credentials" })
    }

    const token = jwt.sign({username: user.username}, secret, {
        algorithm: 'HS256',
        expiresIn: '2000s',
    })

    return res.json({ token: token })
})


app.use('/cards', expressjwt({secret: secret, algorithms: ['HS256']}), cardsRouter)




app.listen(port, () => {
    console.log(`Now listening on port ${port}`)
})