module.exports = (socket, newUsername, username, connectedUsers, io) => {
    if (username && newUsername && newUsername.trim() !== '') {
        const oldUsername = username;
        username = newUsername.trim();
        connectedUsers[socket.id] = username;

        console.log(`${oldUsername} a changé son pseudo en ${username}`);

        io.emit('nickname-changed', `${oldUsername} a changé son pseudo en ${username}`);
    } else {
        socket.emit('message', "Erreur : nom d'utilisateur invalide.");
    }
    return username;
};