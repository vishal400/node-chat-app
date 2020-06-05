const path = require('path')
//const http = require('http')
const socketio = require('socket.io')
const express = require('express')
const Filter = require('bad-words')
const {generateMessage} = require('./utils/message')

const app = express()


const port = process.env.PORT || 3000
const publicDirectoryPath = path.join(__dirname, "../public")


app.use(express.static(publicDirectoryPath))

const server = app.listen(port, () => {
    console.log('Server is up on port: ' + port)
})
const io = socketio(server)

io.on('connection', (socket) => {
    console.log('New websocket connection')

    socket.emit("message", generateMessage("Welcome!"))
    
    socket.on('sendMessage', (message, callback) => {

        const filter = new Filter()

        if(filter.isProfane(message)){
            return callback('Profanity is not allowed')
        }

        io.emit('message', generateMessage(message))
        callback()

    })

    socket.on('sendLocation', ({latitude, longitude}, callback) => {
        io.emit('locationMessage',generateMessage('https://google.com/maps?q='+latitude+','+longitude))
        callback()
    })
})

// app.listen(port, () => {
//     console.log('serve is up on port: ' + port)
// })