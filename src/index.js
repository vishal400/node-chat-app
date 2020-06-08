const path = require('path')
//const http = require('http')
const socketio = require('socket.io')
const express = require('express')
const Filter = require('bad-words')
const {generateMessage} = require('./utils/message')
const {addUser, removeUser, getUser, getUsersInRoom} = require('./utils/users')

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

    
    
    socket.on("join", ({username, room}, callback) => {

        const {error, user} = addUser({id: socket.id, username, room})

        if(error){
            return callback(error)
        }

        socket.join(user.room)

        socket.emit("message", generateMessage("Welcome!"), 'Admin')
        socket.broadcast.to(user.room).emit("message", generateMessage(`${user.username} has joined!`))
        io.to(user.room).emit("roomData", {
            users: getUsersInRoom(user.room),
            room: user.room
        })

        callback()
        
    })

    socket.on('sendMessage', (message, callback) => {

        const user = getUser(socket.id)
        const filter = new Filter()

        if(filter.isProfane(message)){
            return callback('Profanity is not allowed')
        }

        io.to(user.room).emit('message', generateMessage(message), user.username)
        callback()

    })

    socket.on('sendLocation', ({latitude, longitude}, callback) => {

        const user = getUser(socket.id)

        io.to(user.room).emit('locationMessage',generateMessage('https://google.com/maps?q='+latitude+','+longitude), user.username)
        callback()
    })

    socket.on('disconnect', () => {
        const user = removeUser(socket.id)

        if(user){
            io.to(user.room).emit('message', generateMessage(`${user.username} has left!`), 'Admin')
            io.to(user.room).emit("roomData", {
                users: getUsersInRoom(user.room),
                room: user.room
            })
        }
    })
})

// app.listen(port, () => {
//     console.log('serve is up on port: ' + port)
// })