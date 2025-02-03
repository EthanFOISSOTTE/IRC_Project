require('dotenv').config();
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const mongoose = require('mongoose');
const path = require('path');
const bcrypt = require('bcrypt');
const { v4: uuidv4 } = require('uuid');
const changeNickname = require('./commands/nick'); // Commande /nick
const listUsers = require('./commands/users'); // Commande /users

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

// Définir le modèle de channel
const chanelSchema = new mongoose.Schema(
    {
        id: { type: String, default: uuidv4 },
        chanelName: { type: String, required: true },
        chanelDesc: { type: String, required: true },
    },
    { collection: 'messages' }
);
const Channel = mongoose.model('Chanel', chanelSchema);

// Définir le modèle de user par channel
const userByChanelSchema = new mongoose.Schema(
    {
        idChannel: { type: String, default: uuidv4 },
        idUser: { type: String, default: uuidv4 },
    },
    { collection: 'messages' }
);
const userByChanel = mongoose.model('user_by_channel', userByChanelSchema);

app.use(express.json());

// Route pour l'inscription des utilisateurs
app.post('/register', async (req, res) => {
    const { email, pseudo, password } = req.body;
    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = new User({ id: uuidv4(), email, pseudo, password: hashedPassword });
        await newUser.save();
        res.status(201).send('Utilisateur créé avec succès');
        io.emit('user-connected', `${pseudo} vient de rejoindre le chat`);
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
        res.status(200).send({ message: 'Connexion réussie', pseudo: user.pseudo });
        // Remove this line to prevent double emission
        // io.emit('user-connected', `${user.pseudo} vient de rejoindre le chat`);
    } catch (err) {
        res.status(500).send('Erreur lors de la connexion');
    }
});

// Route pour créer un nouveau channel
app.post('/create', async (req, res) => {
    const { chanelName, chanelDesc } = req.body;
    try {
        const newChannel = new Channel({ id: uuidv4(), chanelName, chanelDesc });
        await newChannel.save();
        res.status(201).send('Channel créé avec succès');
        io.emit('channel-created', `${chanelName} a été créé`);
    } catch (err) {
        res.status(400).send('Erreur lors de la création du channel');
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

    // Envoyer un message de bienvenue au client connecté
    socket.emit('welcome', 'Bienvenue sur le chat!');

    // Envoyer la liste des utilisateurs connectés
    const sendConnectedUsers = () => {
        io.emit('connected-users', Object.values(connectedUsers));
    };

    // Récupérer les messages depuis MongoDB et les envoyer au client
    try {
        const messages = await Message.find().sort({ timestamp: 1 });

        // Formater les messages dans le format attendu
        const formattedMessages = messages.map((msg) => ({
            user: msg.username, // Utiliser le champ username
            text: msg.content, // Utiliser le champ content
            sent: false, // Champ sent (défini comme false pour les anciens messages)
            timestamp: msg.timestamp.toISOString(), // Convertir la date en chaîne ISO
        }));

        // Envoyer les messages formatés au client
        socket.emit('previousMessages', formattedMessages);
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
            sendConnectedUsers();
        }
    });

    // Gérer les messages des utilisateurs
    socket.on('message', async (msg) => {
        if (msg.text.startsWith('/users')) {
            // Commande /users
            listUsers(socket, connectedUsers);
        } else if (msg.text.startsWith('/nick ')) {
            // Commande /nick
            const newUsername = msg.text.split(' ')[1]; // Extraire le nouveau pseudo
            if (newUsername) {
                const oldUsername = username;
                username = changeNickname(socket, newUsername, username, connectedUsers, io);

                if (oldUsername !== username) {
                    // Mettre à jour les anciens messages dans MongoDB
                    await updateMessagesWithNewUsername(oldUsername, username);
                }

                io.emit('message', {
                    text: `L'utilisateur ${oldUsername} vient de changer son pseudo pour : ${newUsername}.`,
                    sent: true,
                    timestamp: new Date().toISOString(),
                });

            } else {
                socket.emit('message', "Erreur : vous devez spécifier un nouveau pseudo après /nick.");
            }
        } else if (msg.text.startsWith('/pm ')) {
            // Commande /pm pour un message privé
            const parts = msg.text.split(' ');
            const targetUsername = parts[1]; // Nom de l'utilisateur cible
            const privateMessage = parts.slice(2).join(' '); // Message privé

            if (targetUsername && privateMessage) {
                const targetSocketId = Object.keys(connectedUsers).find(id => connectedUsers[id] === targetUsername);

                if (targetSocketId) {
                    // L'utilisateur cible est connecté
                    io.to(targetSocketId).emit('private-message', {
                        from: username,
                        message: privateMessage,
                    });

                    // Confirmer à l'expéditeur que le message a été envoyé
                    socket.emit('message', `Message privé envoyé à ${targetUsername}: ${privateMessage}`);
                } else {
                    socket.emit('message', `Erreur : l'utilisateur ${targetUsername} n'est pas connecté.`);
                }
            } else {
                socket.emit('message', "Erreur : vous devez spécifier un utilisateur et un message.");
            }
        } else if (username) {
            console.log('Message reçu:', msg.text);

            // Enregistrer le message dans MongoDB
            try {
                const message = new Message({ content: msg.text, username: username });
                await message.save();
                console.log('Message enregistré dans la base de données');

                // Émettre le message à tous les clients connectés
                io.emit('message', {
                    user: username,
                    text: msg.text,
                    sent: true,
                    timestamp: new Date().toISOString(),
                });
            } catch (err) {
                console.error('Erreur lors de l\'enregistrement du message :', err);
            }
        }
    });

    // Gérer la déconnexion
    socket.on('disconnect', () => {
        if (username) {
            console.log(`Un utilisateur s'est déconnecté : ${username}`);
            io.emit('user-disconnected', `${username} a quitté le chat`);
            delete connectedUsers[socket.id];
            sendConnectedUsers();
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