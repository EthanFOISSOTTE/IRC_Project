require('dotenv').config();
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const mongoose = require('mongoose');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

// Connexion à MongoDB
mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
}).then(() => {
    console.log('Connecté à MongoDB');
}).catch((err) => {
    console.error('Erreur de connexion à MongoDB:', err);
});

// Définir le modèle de message
const messageSchema = new mongoose.Schema({
    content: String,
    timestamp: { type: Date, default: Date.now },
}, { collection: 'messages' });
const Message = mongoose.model('Message', messageSchema);

// Middleware pour servir les fichiers statiques
app.use(express.static('public'));

// Route de base
app.get('/', (req, res) => {
    res.sendFile(__dirname + '/public/index.html');
});

// Stockage temporaire des utilisateurs connectés
const connectedUsers = {};

// Gérer les connexions Socket.IO
io.on('connection', async (socket) => {
    console.log('Un utilisateur est connecté (en attente de nom)');
    let username = null;

    // Récupérer les messages depuis MongoDB et les envoyer au client
    try {
        const messages = await Message.find().sort({ timestamp: 1 });
        socket.emit('previousMessages', messages);
    } catch (err) {
        console.error('Erreur lors de la récupération des messages:', err);
    }

    // Écouter l'événement set-username
    socket.on('set-username', (name) => {
        if (name && name.trim() !== '') {
            username = name.trim();
            connectedUsers[socket.id] = username;

            console.log(`Un utilisateur s'est connecté : ${username}`);
            io.emit('user-connected', `${username} vient de rejoindre le chat`);
        }
    });

    // Gérer le changement de pseudo avec /nick
    socket.on('change-nickname', (newUsername) => {
        if (username && newUsername && newUsername.trim() !== '') {
            const oldUsername = username;
            username = newUsername.trim();
            connectedUsers[socket.id] = username;

            console.log(`${oldUsername} a changé son pseudo en ${username}`);

            // Envoyer un message d'information
            io.emit('nickname-changed', `${oldUsername} a changé son pseudo en ${username}`);
        }
    });

    // Écouter les messages envoyés par les utilisateurs
    socket.on('message', async (msg) => {
        if (username) {
            console.log(`Message reçu de ${username}: ${msg}`);

            // Enregistrer le message dans MongoDB
            try {
                const message = new Message({ content: `${msg}` });
                await message.save();
            } catch (err) {
                console.error('Erreur lors de l\'enregistrement du message:', err);
            }

            // Réémettre le message à tous les clients
            io.emit('message', `${msg}`);
        }
    });

    // Gérer la déconnexion
    socket.on('disconnect', () => {
        if (username) {
            console.log(`Un utilisateur s'est déconnecté : ${username}`);
            io.emit('user-disconnected', `${username} a quitté le chat`);
            delete connectedUsers[socket.id];
        } else {
            console.log('Un utilisateur sans nom s\'est déconnecté');
        }
    });
});

// Lancer le serveur
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Serveur lancé sur http://localhost:${PORT}`);
});
