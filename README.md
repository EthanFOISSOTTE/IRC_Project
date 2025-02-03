# Projet IRC en Node.js avec Express, TypeScript et Socket.IO

Ce projet est une application de chat en temps réel (type IRC) développée avec **Node.js**, **Express**, **TypeScript**, et **Socket.IO**.

## Prérequis

Avant de commencer, assurez-vous d'avoir installé les éléments suivants :

- **Node.js** (version 14 ou supérieure) : [Télécharger Node.js](https://nodejs.org/)
- **npm** : installé avec Node.js
- **MongoDB** : une base de données MongoDB peut être hébergée gratuitement en ligne via [MongoDB Atlas](https://www.mongodb.com/atlas/database).

## Installation

### 1. Cloner le projet

Clonez le projet sur votre machine locale :


git clone https://github.com/votre-utilisateur/irc-nodejs-project.git
cd irc-nodejs-project
2. Installer les dépendances
Exécutez la commande suivante pour installer toutes les dépendances nécessaires :



Copier
Modifier
npm install
3. Configurer les variables d'environnement
Créez un fichier .env à la racine du projet et ajoutez les informations suivantes :
````
.env
````
````
DB_URI=mongodb+srv://<username>:<password>@cluster0.mongodb.net/irc_db?retryWrites=true&w=majority
PORT=3000
DB_URI : remplacez <username> et <password> par vos identifiants MongoDB Atlas. Vous pouvez créer une base de données gratuite en ligne via MongoDB Atlas.
PORT : port sur lequel le serveur écoute (par défaut 3000).
````

4. Lancer le serveur en mode développement
Pour démarrer le serveur avec TypeScript compilé à la volée, exécutez :


````
npm insatall 
cd .\website\
npm install
npm run dev
````

5. Lancer le serveur en mode production
Pour compiler le projet TypeScript et exécuter le serveur en production :

````
npm run build
npm start
````
6. Accéder à l'application
Utilisation
Configurez MongoDB : Créez une base de données MongoDB via MongoDB Atlas (hébergement gratuit disponible).

    Démarrez votre serveur : Suivez les étapes ci-dessus pour lancer l'application.

    Accédez à l'application : Une fois le serveur démarré, rendez-vous sur http://localhost:3000 (ou l'URL configurée).

    Créez des salles de chat et commencez à discuter en temps réel !
7.  Fonctionnalités principales

    Chat en temps réel : utilisateurs connectés via WebSocket.

    Création de salles : les utilisateurs peuvent créer et rejoindre des salles.

   Persistance des messages : les messages sont sauvegardés dans une base de données MongoDB.
   
Structure du projet


````
├── src/
│   ├── controllers/      # Gestion des routes et logique métier
│   ├── models/           # Modèles de données (ex : MongoDB)
│   ├── routes/           # Définition des routes Express
│   ├── socket/           # Gestion des événements Socket.IO
│   └── server.ts         # Point d'entrée principal
├── .env                  # Fichier de configuration des variables d'environnement
├── package.json          # Dépendances et scripts
├── tsconfig.json         # Configuration TypeScript
└── README.md             # Documentation
````

8. Hébergement de la base de données avec MongoDB Atlas
MongoDB Atlas permet d'héberger gratuitement votre base de données en ligne. Pour l'utiliser :

    Créez un compte sur MongoDB Atlas.

    Créez un cluster gratuit et une base de données.

    Obtenez l'URI de connexion (par exemple : mongodb+srv://<username>:<password>@cluster0.mongodb.net/irc_db).

   Remplacez <username> et <password> dans l'URI et ajoutez cette valeur à votre fichier .env sous la clé DB_URI.

    Contribuer
   Forkez le projet.
    Créez une nouvelle branche pour votre fonctionnalité (git checkout -b feature-ma-fonctionnalite).
    Commitez vos modifications 
````
git commit -m 'Ajout d'une nouvelle fonctionnalité'
````
    
Poussez votre branche 
````
git push origin feature-ma-fonctionnalite
````

Ouvrez une Pull Request.

### License
   Ce projet est sous licence MIT. Consultez le fichier LICENSE pour plus d'informations.