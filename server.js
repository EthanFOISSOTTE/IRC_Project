require('dotenv').config();
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const mongoose = require('mongoose');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: '*', // Autoriser toutes les origines
        methods: ['GET', 'POST'], // Méthodes HTTP autorisées
        allowedHeaders: ['Content-Type'], // En-têtes autorisés
        credentials: true // Autoriser les cookies
    },
});

// Connexion à MongoDB
mongoose
    .connect(process.env.MONGO_URI)
    .then(() => console.log('Connecté à MongoDB'))
    .catch((err) => {
        console.error('Erreur de connexion à MongoDB :', err);
        process.exit(1); // Arrête l'application si MongoDB ne se connecte pas
    });

// Définir le modèle de message
const messageSchema = new mongoose.Schema(
    {
        content: { type: String, required: true },
        timestamp: { type: Date, default: Date.now },
    },
    { collection: 'messages' }
);
const Message = mongoose.model('Message', messageSchema);

// Middleware pour servir les fichiers statiques du build React
const buildPath = path.join(__dirname, 'website', 'dist'); // Assurez-vous que le chemin est correct
app.use(express.static(buildPath));

// Route pour servir l'application React
app.get('*', (req, res) => {
    res.sendFile(path.join(buildPath, 'index.html'));
});

// Stockage temporaire des utilisateurs connectés
const connectedUsers = {};

// Gérer les connexions Socket.IO
io.on('connection', async (socket) => {
    console.log('Un utilisateur est connecté (en attente de nom)');
    let username = null;

    // Envoyer un message de bienvenue au client connecté
    socket.emit('welcome', 'Bienvenue sur le chat!');

    // Récupérer les messages depuis MongoDB et les envoyer au client
    try {
        const messages = await Message.find().sort({ timestamp: 1 });
        socket.emit('previousMessages', messages);
    } catch (err) {
        console.error('Erreur lors de la récupération des messages :', err);
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

    // Écouter les messages envoyés par les utilisateurs
    socket.on('message', async (msg) => {
        if (username) {
            console.log(`Message reçu de ${username}: ${msg}`);

            // Enregistrer le message dans MongoDB
            try {
                const message = new Message({ content: msg });
                await message.save();
                console.log('Message enregistré dans la base de données');
            } catch (err) {
                console.error('Erreur lors de l\'enregistrement du message :', err);
            }

            // Réémettre le message à tous les clients
            io.emit('message', { text: msg, sent: false, timestamp: new Date().toLocaleTimeString() });
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

const PORT = process.env.PORT || 3000; // Définir le port avec une valeur par défaut
server.listen(PORT, () => {
    console.log(`Serveur lancé sur http://localhost:${PORT}`);
});