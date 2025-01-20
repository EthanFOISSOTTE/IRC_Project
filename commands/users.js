// Logic for handling the /users command
module.exports = (socket, connectedUsers) => {
    // Récupérer la liste des utilisateurs connectés
    const userList = Object.values(connectedUsers);

    // Si des utilisateurs sont connectés, envoyer la liste
    if (userList.length > 0) {
        const userListMessage = `Utilisateurs connectés: ${userList.join(', ')}`;
        socket.emit('message', userListMessage); // Envoyer la liste à l'utilisateur qui a tapé la commande
    } else {
        socket.emit('message', "Aucun utilisateur connecté."); // Si aucun utilisateur n'est connecté
    }
};
