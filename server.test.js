const { updateMessagesWithNewUsername, Message } = require('./server');
const request = require('supertest');
const http = require('http');
const mongoose = require('mongoose');
const path = require('path');
const express = require('express');

let server;

const app = express();

// Middleware pour servir les fichiers statiques du build React
const buildPath = path.join(__dirname, 'website', 'dist');
app.use(express.static(buildPath));

beforeAll(async () => {
    // Assurez-vous que la connexion à MongoDB est effectuée une seule fois
    if (mongoose.connection.readyState === 0) {
        await mongoose.connect('mongodb://localhost:27017/test', {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
    }

    // Créez un serveur pour les tests
    server = http.createServer(app);
    server.listen(4000, () => {
        console.log('Serveur lancé sur http://localhost:3000');
    });
});

afterAll(async () => {
    // Déconnexion MongoDB et fermeture du serveur
    await mongoose.disconnect();
    if (server) {
        server.close();
    }
});

describe('Tests serveur et middleware', () => {

    describe('Routes de base', () => {
        it('Doit répondre avec un code 200 sur la route principale', async () => {
            const response = await request(server).get('/');
            expect(response.status).toBe(200);
        });

        it('Ne doit pas servir l’application React sur une route', async () => {
            const response = await request(server).get('/route');
            expect(response.status).toBe(404);
            expect(response.text).toContain('<!DOCTYPE html>');
        });

        it('Doit retourner un code 404 pour une API non trouver', async () => {
            const response = await request(server).get('/api');
            expect(response.status).toBe(404);
        });
    });

    describe('Middleware pour servir les fichiers statiques React', () => {
        it('Doit répondre avec un fichier statique si le fichier existe', async () => {
            const response = await request(server).get('/index.html');
            expect(response.status).toBe(200);
            expect(response.header['content-type']).toMatch(/html/);
            expect(response.text).toContain('<!doctype html>');
        });

        it('Doit répondre avec un code 404 si le fichier n’existe pas', async () => {
            const response = await request(server).get('/nonexistentfile.js');
            expect(response.status).toBe(404);
        });
    });
});

describe('Test de l\'update des messages selon le nouveau pseudo', () => {
    it('met à jour les messages avec le nouveau pseudo', async () => {
        const oldUsername = 'user1';
        const newUsername = 'user2';

        const mockMessages = [
            { content: 'user1 : Bonjour', save: jest.fn().mockResolvedValue(true) },
            { content: 'user1 : Comment ça va ?', save: jest.fn().mockResolvedValue(true) },
        ];

        jest.spyOn(Message, 'find').mockResolvedValue(mockMessages);

        await updateMessagesWithNewUsername(oldUsername, newUsername);

        expect(mockMessages[0].content).toBe('user2 : Bonjour');
        expect(mockMessages[1].content).toBe('user2 : Comment ça va ?');
        expect(mockMessages[0].save).toHaveBeenCalled();
        expect(mockMessages[1].save).toHaveBeenCalled();
    });

    it('gère une erreur si Message.find échoue', async () => {
        const oldUsername = 'user1';
        const newUsername = 'user2';

        jest.spyOn(Message, 'find').mockRejectedValue(new Error('Erreur de recherche'));

        const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

        await updateMessagesWithNewUsername(oldUsername, newUsername);

        expect(consoleErrorSpy).toHaveBeenCalledWith('Erreur lors de la mise à jour des anciens messages:', expect.any(Error));

        consoleErrorSpy.mockRestore();
    });
});
