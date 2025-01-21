require('dotenv').config();
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const mongoose = require('mongoose');
const path = require('path');
const bcrypt = require('bcrypt');
const { v4: uuidv4 } = require('uuid');

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
        username: { type: String, required: true },
        timestamp: { type: Date, default: Date.now },
    },
    { collection: 'messages' }
);
const Message = mongoose.model('Message', messageSchema);

// Définir le modèle d'utilisateur
const userSchema = new mongoose.Schema({
    id: { type: String, default: uuidv4 },
    email: { type: String, required: true, unique: true },
    pseudo: { type: String, required: true },
    password: { type: String, required: true },
}, { collection: 'user' });
const User = mongoose.model('User', userSchema);

app.use(express.json());

// Route pour l'inscription des utilisateurs
app.post('/register', async (req, res) => {
    const { email, pseudo, password } = req.body;
    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = new User({ id: uuidv4(), email, pseudo, password: hashedPassword });
        await newUser.save();
        res.status(201).send('Utilisateur créé avec succès');
        global.username = pseudo; // Enregistrer le pseudo dans une variable globale
        console.log(`Un utilisateur s'est connecté : ${global.username}`);
        io.emit('user-connected', `${global.username} vient de rejoindre le chat`);

    } catch (err) {
        res.status(400).send('Erreur lors de la création de l\'utilisateur');
    }
});

// Route pour la connexion des utilisateurs
app.post('/login', async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).send('Utilisateur non trouvé');
        }
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(400).send('Mot de passe incorrect');
        }
        global.username = user.pseudo; // Enregistrer le pseudo dans une variable globale
        res.status(200).send('Connexion réussie');
        io.emit('user-connected', `${global.username} vient de rejoindre le chat`);

    } catch (err) {
        res.status(500).send('Erreur lors de la connexion');
    }
});

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
    if (global.username === null) {
        if (name && name.trim() !== '') {
            global.username = name.trim();
            connectedUsers[socket.id] = global.username;

            console.log(`Un utilisateur s'est connecté : ${global.username}`);
            io.emit('user-connected', `${global.username} vient de rejoindre le chat`);
        }
        console.log(`Un utilisateur s'est connecté : ${global.username}`);
        io.emit('user-connected', `${global.username} vient de rejoindre le chat`);
    }
});

    // Écouter les messages envoyés par les utilisateurs
    socket.on('message', async (msg) => {
        if (!global.username) {
            socket.emit('error', 'Vous devez être connecté pour envoyer des messages.');
            return;
        }

        console.log(`Message reçu de ${global.username}: ${msg}`);
        const username = global.username;

        // Enregistrer le message dans MongoDB
        try {
            const message = new Message({ content: msg, username });
            await message.save();
            console.log('Message enregistré dans la base de données');
        } catch (err) {
            console.error('Erreur lors de l\'enregistrement du message :', err);
        }

        // Réémettre le message à tous les clients
        io.emit('message', { user: global.username, text: msg, sent: false, timestamp: new Date().toLocaleTimeString() });
    });

    // Gérer la déconnexion
    socket.on('disconnect', () => {
        if (global.username) {
            console.log(`Un utilisateur s'est déconnecté : ${global.username}`);
            io.emit('user-disconnected', `${global.username} a quitté le chat`);
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