require('dotenv').config();
const { MongoClient } = require('mongodb');

// Récupération des variables d'environnement
const MONGODB_URI = process.env.MONGODB_URI;
const MONGODB_DB_NAME = 'Lego';

console.log(MONGODB_URI);
if (!MONGODB_URI || !MONGODB_DB_NAME) {
    console.error("ERREUR: Les variables d'environnement MONGODB_URI ou MONGODB_DB_NAME ne sont pas définies.");
    process.exit(1); // Arrête l'exécution du script
}

let client;
let db;

// Fonction pour établir la connexion à MongoDB
async function connectDB() {
    try {
        if (!client) {
            client = await MongoClient.connect(MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true });
            db = client.db(MONGODB_DB_NAME);
            console.log("Connection MongoDB réussie !");
        }
        return db;
    } catch (error) {
        console.error("Erreur de connexion à MongoDB :", error);
        process.exit(1);
    }
}

// Si tu exécutes node database.js, ça va tester la connexion directement
if (require.main === module) {
    connectDB().then(() => {
        console.log("Test de connexion MongoDB terminé.");
        process.exit(0);
    });
}

module.exports = { connectDB };