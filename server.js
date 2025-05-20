require('dotenv').config(); // Charger les variables d'environnement

const express = require('express');
const odbc = require('odbc');
const cors = require('cors');

const app = express();
const port = 3000;

// Activer CORS et parsing JSON
app.use(cors());
app.use(express.json());

// Récupérer le chemin de la base Access depuis le fichier .env
const dbPath = process.env.ACCESS_DB_PATH;

// ✅ Chaîne de connexion corrigée (pas d’accolade en trop)
const connectionString = `Driver={Microsoft Access Driver (*.mdb, *.accdb)};DBQ=${dbPath};`;

let connection = null;

// Fonction pour se connecter à la base Access
async function connectToAccess() {
    try {
        connection = await odbc.connect(connectionString);
        console.log("✅ Connecté à la base Access");
    } catch (err) {
        console.error("❌ Erreur de connexion à Access :", err);
    }
}

// Route d'accueil
app.get('/', (req, res) => {
    res.send('Bienvenue sur mon serveur Node.js avec Access 🚀');
});

// Obtenir toutes les commandes
app.get('/commandes', async(req, res) => {
    try {
        const result = await connection.query('SELECT * FROM commandes');
        res.json(result);
    } catch (err) {
        console.error("❌ Erreur SELECT :", err);
        res.status(500).json({ message: 'Erreur serveur', error: err });
    }
});

// Ajouter une commande
app.post('/commandes', async(req, res) => {
    const { nom, prenom, email, contact, produit, quantite, total } = req.body;

    if (!nom || !prenom || !email || !contact || !produit || !quantite || !total) {
        return res.status(400).json({ message: "❌ Tous les champs sont requis" });
    }

    const safe = (str) => str.replace(/'/g, "''");

    const sql = `
        INSERT INTO commandes (nom, prenom, email, contact, produit, quantite, total)
        VALUES (
            '${safe(nom)}',
            '${safe(prenom)}',
            '${safe(email)}',
            '${safe(contact)}',
            '${safe(produit)}',
            ${parseInt(quantite)},
            ${parseFloat(total)}
        )
    `;

    try {
        await connection.query(sql);
        res.status(201).json({ message: "✅ Commande ajoutée avec succès" });
    } catch (err) {
        console.error("❌ Erreur INSERT :", err);
        res.status(500).json({ message: "Erreur serveur", error: err });
    }
});

// Supprimer une commande
app.delete('/commandes/:id', async(req, res) => {
    const id = parseInt(req.params.id);

    try {
        const sql = `DELETE FROM commandes WHERE id = ${id}`;
        await connection.query(sql);
        res.json({ message: "✅ Commande supprimée (si elle existait)" });
    } catch (err) {
        console.error("❌ Erreur DELETE :", err);
        res.status(500).json({ message: "Erreur serveur", error: err });
    }
});

// Lancer le serveur après connexion à Access
connectToAccess().then(() => {
    app.listen(port, () => {
        console.log(`🚀 Serveur lancé sur http://localhost:${port}`);
    });
});