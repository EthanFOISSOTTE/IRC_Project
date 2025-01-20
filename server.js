require('dotenv').config();
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const mongoose = require('mongoose');
const changeNickname = require('./commands/nick'); // Commande /nick
const listUsers = require('./commands/users'); // Commande /users

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

let connectedUsers = {}; // Object pour garder une trace des utilisateurs connectés

// Fonction pour mettre à jour les messages avec un nouveau pseudo
const updateMessagesWithNewUsername = async (oldUsername, newUsername) => {
    try {
        // Trouver tous les messages envoyés par l'utilisateur dont le pseudo a changé
        const messagesToUpdate = await Message.find({ content: { $regex: `^${oldUsername} :` } });

        // Mettre à jour uniquement les messages de l'utilisateur
        for (const message of messagesToUpdate) {
            message.content = message.content.replace(`${oldUsername} :`, `${newUsername} :`);
            await message.save(); // Sauvegarder dans MongoDB
        }

        console.log(`Mise à jour de ${messagesToUpdate.length} messages avec le nouveau pseudo.`);
    } catch (err) {
        console.error('Erreur lors de la mise à jour des anciens messages:', err);
    }
};

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

    // Gérer l'événement set-username
    socket.on('set-username', (name) => {
        if (name && name.trim() !== '') {
            username = name.trim();
            connectedUsers[socket.id] = username; // Ajouter l'utilisateur à la liste
            console.log(`Un utilisateur s'est connecté : ${username}`);
            io.emit('user-connected', `${username} vient de rejoindre le chat`);
        }
    });

    // Gérer les messages des utilisateurs
    socket.on('message', async (msg) => {
        if (msg.startsWith('/users')) {
            // Commande /users
            listUsers(socket, connectedUsers);
        } else if (msg.startsWith('/nick ')) {
            // Commande /nick
            const newUsername = msg.split(' ')[1]; // Extraire le nouveau pseudo
            if (newUsername) {
                const oldUsername = username;
                username = changeNickname(socket, newUsername, username, connectedUsers, io);

                if (oldUsername !== username) {
                    // Mettre à jour les anciens messages dans MongoDB
                    await updateMessagesWithNewUsername(oldUsername, username);
                }
            } else {
                socket.emit('message', "Erreur : vous devez spécifier un nouveau pseudo après /nick.");
            }
        } else if (username) {
            // Messages normaux
            const fullMessage = `${username} : ${msg}`;
            console.log('Message reçu:', fullMessage);

            // Enregistrer le message dans MongoDB
            try {
                const message = new Message({ content: fullMessage });
                await message.save();

                // Réémettre le message à tous les clients
                io.emit('message', fullMessage);
            } catch (err) {
                console.error('Erreur lors de l\'enregistrement du message:', err);
            }
        } else {
            socket.emit('message', "Erreur : vous devez définir un nom d'utilisateur avant d'envoyer des messages.");
        }
    });

    // Gérer la déconnexion
    socket.on('disconnect', () => {
        if (username) {
            delete connectedUsers[socket.id]; // Supprimer l'utilisateur de la liste des connectés
            console.log(`Un utilisateur s'est déconnecté : ${username}`);
            io.emit('user-disconnected', `${username} a quitté le chat`);
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
