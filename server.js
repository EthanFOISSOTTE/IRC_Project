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
    useUnifiedTopology: true
}).then(() => {
    console.log('Connecté à MongoDB');
}).catch((err) => {
    console.error('Erreur de connexion à MongoDB:', err);
});

// Définir le modèle de message
const messageSchema = new mongoose.Schema({
    content: String,
    timestamp: { type: Date, default: Date.now }
});
const Message = mongoose.model('Message', messageSchema);

// Middleware pour servir les fichiers statiques
app.use(express.static('public'));

// Route de base
app.get('/', (req, res) => {
    res.sendFile(__dirname + '/public/index.html');
});

// Gérer les connexions Socket.IO
io.on('connection', (socket) => {
    console.log('Un utilisateur est connecté');

    // Exemple d'émission d'un message au client
    socket.emit('welcome', 'Bienvenue dans le chat Socket.IO !');

    // Écouter un événement personnalisé
    socket.on('message', async (msg) => {
        console.log('Message reçu:', msg);

        // Enregistrer le message dans MongoDB

        try {
            const message = new Message({ content: msg });
            await message.save();
        } catch (err) {
            console.error('Erreur lors de l\'enregistrement du message:', err);
        }


        // Réémettre le message à tous les clients
        io.emit('message', msg);
    });

    // Gérer la déconnexion
    socket.on('disconnect', () => {
        console.log('Un utilisateur s\'est déconnecté');
    });
});

// Lancer le serveur
const PORT = process.env.PORT || 4000;
server.listen(PORT, () => {
    console.log(`Serveur lancé sur http://localhost:${PORT}`);
});