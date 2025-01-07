const Connection = require('./db.js') // Appel le fichier de connexion à la base de donnée MongoDB en ligne
const express = require('express');
const { createServer } = require('node:http');
const { join } = require('node:path');
const { Server } = require('socket.io');
Connection()
const app = express();
const server = createServer(app);
const io = new Server(server);
const Chat = require('./models/Chat.js');
const { timeStamp } = require('console');

app.get('/', (req, res) => {
    res.sendFile(join(__dirname, 'index.html'));
});

io.on('connection', (socket) => {
    console.log('a user connected');
    socket.on('disconnect', () => {
        console.log('user disconnected');
    });

    socket.on('newMessage', async (msg) => {
        try {
            const newMessage = new Chat(msg)
            await newMessage.save()
            io.emit('message', msg)
        }catch(err) {
            console.log(err)
        }
    })
});

io.on('connection', (socket) => {
    socket.on('chat message', (msg) => {
        io.emit('chat message', msg);
    });
});

server.listen(3000, () => {
    console.log('server running at http://localhost:3000');
});