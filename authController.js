// authController.js
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

// On réutilise la même connexion à la BDD que dans ton server.js
const mysql = require("mysql2");
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'Attita@mama08fils',
    database: 'attitadb'
});

// Fonction d'inscription
exports.register = (req, res) => {
    const { username, email, password } = req.body;
    const hashedPassword = bcrypt.hashSync(password, 10);
    const sql = "INSERT INTO users (username, email, password) VALUES (?, ?, ?)";

    db.query(sql, [username, email, hashedPassword], (err) => {
        if (err) {
            console.error("Erreur à l'inscription :", err);
            return res.status(500).json({ message: "Erreur serveur", error: err });
        }
        res.status(201).json({ message: "✅ Utilisateur inscrit avec succès" });
    });
};

// Fonction de connexion
exports.login = (req, res) => {
    const { email, password } = req.body;
    const sql = "SELECT * FROM users WHERE email = ?";

    db.query(sql, [email], (err, results) => {
        if (err || results.length === 0) {
            return res.status(401).json({ message: "❌ Email incorrect ou utilisateur non trouvé" });
        }

        const user = results[0];
        const passwordValid = bcrypt.compareSync(password, user.password);
        if (!passwordValid) {
            return res.status(401).json({ message: "❌ Mot de passe incorrect" });
        }

        const token = jwt.sign({ id: user.id, username: user.username }, "SECRET_JWT", { expiresIn: "24h" });

        res.json({
            message: "✅ Connexion réussie",
            token,
            user: {
                id: user.id,
                username: user.username,
                email: user.email
            }
        });
    });
};