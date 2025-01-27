const { app, server, io } = require('./server');
const request = require('supertest');
const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');
const bcrypt = require('bcrypt');
const socketClient = require('socket.io-client');
const { User, Message } = require('./server');

// Simuler bcrypt pour éviter des appels réels
jest.mock('bcrypt', () => ({
    hash: jest.fn(),
    compare: jest.fn(),
}));

// Mock de mongoose et de ses méthodes
jest.mock('mongoose', () => ({
    connect: jest.fn(),
    model: jest.fn(),
    connection: {
        close: jest.fn(),
    },
}));

// Simuler un modèle User et Message
const mockUser = {
    save: jest.fn().mockResolvedValue(true),
    findOne: jest.fn(),
};

mongoose.model.mockReturnValue(mockUser);

afterAll(async () => {
    await mongoose.disconnect(); // Fermer MongoDB
    io.close(); // Fermer Socket.IO
    server.close(); // Fermer le serveur HTTP
});

describe('Test du serveur', () => {
    it('Répond avec un code 200 sur la route principale', async () => {
        const response = await request(app).get('/');
        expect(response.status).toBe(200);
    });

    it('Doit servir l’application React sur une route', async () => {
        const response = await request(app).get('/route');
        expect(response.status).toBe(200);
        expect(response.text).toContain('<!doctype html>');
    });

    it('Doit retourner 200 pour une API', async () => {
        const response = await request(app).get('/api');
        expect(response.status).toBe(200);
    });
});

describe('Test des fonctionnalités du serveur', () => {
    beforeAll(() => {
        // Simuler la connexion MongoDB avant les tests
        mongoose.connect.mockResolvedValue(true);
    });

    afterAll(() => {
        jest.restoreAllMocks(); // Restaurer les mocks après tous les tests
    });

    describe('Test des routes HTTP', () => {
        it('devrait inscrire un utilisateur avec succès', async () => {
            const mockUser = {
                email: 'test@example.com',
                pseudo: 'testuser',
                password: 'password123',
            };

            // Simuler bcrypt.hash
            bcrypt.hash.mockResolvedValue('hashedPassword');

            const response = await request(app)
                .post('/register')
                .send(mockUser);

            expect(response.status).toBe(201);
            expect(response.text).toBe('Utilisateur créé avec succès');
        });

        it('devrait renvoyer une erreur si la création de l\'utilisateur échoue', async () => {
            const mockUser = {
                email: 'test@example.com',
                pseudo: 'testuser',
                password: 'password123',
            };

            // Simuler une erreur MongoDB
            mongoose.Model.prototype.save.mockRejectedValue(new Error('Erreur lors de la création de l\'utilisateur'));

            const response = await request(app)
                .post('/register')
                .send(mockUser);

            expect(response.status).toBe(400);
            expect(response.text).toBe("Erreur lors de la création de l'utilisateur");
        });

        it('devrait connecter un utilisateur avec succès', async () => {
            const mockUser = {
                email: 'test@example.com',
                password: 'password123',
            };

            // Simuler bcrypt.compare
            bcrypt.compare.mockResolvedValue(true);

            const response = await request(app)
                .post('/login')
                .send(mockUser);

            expect(response.status).toBe(200);
            expect(response.body.message).toBe('Connexion réussie');
        });

        it('devrait renvoyer une erreur si l\'utilisateur n\'est pas trouvé lors de la connexion', async () => {
            const mockUser = {
                email: 'nonexistent@example.com',
                password: 'password123',
            };

            // Simuler une erreur MongoDB (utilisateur non trouvé)
            mockUser.findOne.mockResolvedValue(null);

            const response = await request(app)
                .post('/login')
                .send(mockUser);

            expect(response.status).toBe(400);
            expect(response.text).toBe('Utilisateur non trouvé');
        });

        it('devrait renvoyer une erreur si le mot de passe est incorrect', async () => {
            const mockUser = {
                email: 'test@example.com',
                password: 'wrongpassword',
            };

            // Simuler bcrypt.compare
            bcrypt.compare.mockResolvedValue(false);

            const response = await request(app)
                .post('/login')
                .send(mockUser);

            expect(response.status).toBe(400);
            expect(response.text).toBe('Mot de passe incorrect');
        });
    });

    describe('Test des événements Socket.IO', () => {
        let socket;
        let clientSocket;

        beforeAll((done) => {
            clientSocket = socketClient('http://localhost:3000');
            clientSocket.on('connect', done);
        });

        afterAll(() => {
            clientSocket.disconnect();
        });

        it('devrait émettre un message de bienvenue lorsque le client se connecte', (done) => {
            clientSocket.on('welcome', (message) => {
                expect(message).toBe('Bienvenue sur le chat!');
                done();
            });
        });

        it('devrait émettre un message lorsque l\'utilisateur change de pseudo', (done) => {
            const oldUsername = 'user1';
            const newUsername = 'user2';

            // Simuler l'événement /nick
            clientSocket.emit('set-username', oldUsername);

            clientSocket.emit('message', `/nick ${newUsername}`);
            clientSocket.on('message', (data) => {
                expect(data.text).toBe(`L'utilisateur ${oldUsername} vient de changer son pseudo pour : ${newUsername}.`);
                done();
            });
        });

        it('devrait émettre un message d\'erreur si l\'utilisateur ne spécifie pas de pseudo après /nick', (done) => {
            clientSocket.emit('message', '/nick');
            clientSocket.on('message', (message) => {
                expect(message).toBe("Erreur : vous devez spécifier un nouveau pseudo après /nick.");
                done();
            });
        });

        it('devrait envoyer un message privé à un autre utilisateur', (done) => {
            const targetUser = 'user2';
            const privateMessage = 'Hello, user2!';

            // Simuler un message privé
            clientSocket.emit('set-username', 'user1');
            clientSocket.emit('message', `/pm ${targetUser} ${privateMessage}`);

            // Simuler un autre client
            const secondClientSocket = socketClient('http://localhost:3000');
            secondClientSocket.emit('set-username', targetUser);

            secondClientSocket.on('private-message', (message) => {
                expect(message.from).toBe('user1');
                expect(message.message).toBe(privateMessage);
                done();
            });
        });
    });
});
