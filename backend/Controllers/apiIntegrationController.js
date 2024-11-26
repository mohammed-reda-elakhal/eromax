const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const {Client} = require('../Models/Client'); // Assurez-vous d'avoir un modèle User pour l'utilisateur

// Fonction de connexion
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // 1. Vérifier si l'utilisateur existe
    const user = await Client.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Utilisateur non trouvé.' });
    }

    // 2. Vérifier le mot de passe
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Mot de passe incorrect.' });
    }

    // 3. Générer le token JWT
    const token = jwt.sign(
      { userId: user._id, email: user.email },
      process.env.JWT_SECRET, // Clé secrète de votre choix
      { expiresIn: '1h' } // Durée de validité du token
    );

    // 4. Retourner le token
    res.json({
      message: 'Connexion réussie.',
      token
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erreur serveur.' });
  }
};
