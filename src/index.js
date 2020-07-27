const path = require('path')
const express = require('express')
const http = require('http')
const socketio = require('socket.io')
const Filter = require('bad-words')
const {generateMessage, generateLocationMessage} = require('./utils/messages')
const { addUser,
    removedUser,
    getUser,
    getUserInRoom} = require('./utils/users')

const app = express()
const server = http.createServer(app)
const io = socketio(server)

const port = process.env.PORT || 3000
const publicDirPath = path.join(__dirname, '../public')

app.use(express.static(publicDirPath))

let count = 0

io.on('connection', (socket) => {
    console.log('New Websocket Connection')

    // message deliver to all users may be or not included to room
    // socket.emit('message', generateMessage('Welcome!'))

    // message deliver to all users except self may be or not included to room
    // socket.broadcast.emit('message', generateMessage('A new user has joined!'))

    socket.on('join', (options, callback) =>{
        const {error, user} = addUser({id: socket.id, ...options})
        if (error) {
            return callback(error)
        }
        socket.join(user.room)
        socket.emit('message', generateMessage('Admin', ' Welcome!'))
        socket.broadcast.to(user.room).emit('message', generateMessage('Admin', ` has joined!`))
        io.to(user.room).emit('roomData', {
            room: user.room,
            users: getUserInRoom(user.room)
        })
        callback()
    })

    socket.on('sendMessage', (message, callback) =>{
        const user = getUser(socket.id)
        const filter = new Filter()
        if (filter.isProfane(message)){
            return callback(generateMessage(user.username, 'Profenity is not allowed!'))
        }
        io.to(user.room).emit('message', generateMessage(user.username, message))
        callback()
    })

    socket.on('disconnect', () =>{
        const user = removedUser(socket.id)
        if(user) {
            io.to(user.room).emit('message', generateMessage('Admin', 'has left!'))
            io.to(user.room).emit('roomData', {
                room: user.room,
                users: getUserInRoom(user.room)
            })
        }
    })

    socket.on('sendLocation', (coords, callback) =>{
        const user = getUser(socket.id)
        io.to(user.room).emit('sendLocationMessage', generateLocationMessage(user.username, `https://google.com/maps?q=${coords.latitude},${coords.longitude}`))
        callback()
    })

    // socket.emit('countUpdated', count)

    // socket.on('increment', ()=>{
    //     count++
    //     // socket.emit('countUpdated', count)
    //     io.emit('countUpdated', count)

    // })
})

server.listen(port, () => {
    console.log(`The sevrver is up on ${port} port`)
})