// controllers/notification_user.controller.js
const Colis = require('../Models/Colis');
const Client = require('../Models/Client');
const Notification_User = require('../Models/Notification_User');
const Demande_Retrait = require('../Models/Demande_Retrait');
exports.createNotification = async (req, res) => {
  try {
    const notification = new NotificationUser(req.body);
    await notification.save();
    res.status(201).json(notification);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getAllNotifications = async (req, res) => {
  try {
    const notifications = await NotificationUser.find().populate('id_store');
    res.status(200).json(notifications);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.markAsRead = async (req, res) => {
  try {
    const { id } = req.params;
    const notification = await NotificationUser.findByIdAndUpdate(id, { is_read: true }, { new: true });
    if (!notification) return res.status(404).json({ message: 'Notification not found' });
    res.status(200).json(notification);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


// Notification de livraison de colis
exports.envoyerNotifLivraisonColis = async (req, res) => {
  try {
    const { clientId, colisId, storeId } = req.body;

    // Vérification si le colis et le client existent
    const colis = await Colis.findById(colisId);
    const client = await Client.findById(clientId);

    if (!colis || !client) {
      return res.status(404).json({ message: 'Colis ou client non trouvé' });
    }

    // Créer la notification de livraison de colis
    const notification = new Notification_User({
      id_store: storeId,
      clientId: clientId,
      colisId: colisId,
      title: 'Colis livré',
      description: `Votre colis avec le code de suivi ${colis.code_suivi} a été livré.`
    });

    await notification.save();
    
    return res.status(200).json({ message: 'Notification de livraison envoyée avec succès', notification });
  } catch (error) {
    return res.status(500).json({ message: 'Erreur lors de l\'envoi de la notification', error });
  }
};

exports.envoyerNotifVersementRetrait = async (req, res) => {
  try {
    const { clientId, storeId} = req.body;

    // Vérification si le client existe
    const client = await Client.findById(clientId);

    if (!client) {
      return res.status(404).json({ message: 'Client non trouvé' });
    }

    // Créer la notification de versement de retrait
    const notification = new Notification_User({
      id_store: storeId,
      clientId: clientId,
      title: 'Demande de retrait approuvée',
      description: `Votre demande de retrait de ${montant} a été approuvée et le versement a été effectué.`
    });

    await notification.save();
    
    return res.status(200).json({ message: 'Notification de versement envoyée avec succès', notification });
  } catch (error) {
    return res.status(500).json({ message: 'Erreur lors de l\'envoi de la notification', error });
  }
};
exports.envoyerNotifVersementRetrait = async (req, res) => {
  try {
    const { clientId, storeId, demandeRetraitId } = req.body;

    // Vérifier si le client existe
    const client = await Client.findById(clientId);
    if (!client) {
      return res.status(404).json({ message: 'Client non trouvé' });
    }

    // Récupérer la demande de retrait pour obtenir le montant et vérifier si le versement est effectué
    const demandeRetrait = await Demande_Retrait.findById(demandeRetraitId);
    if (!demandeRetrait) {
      return res.status(404).json({ message: 'Demande de retrait non trouvée' });
    }

    if (!demandeRetrait.verser) {
      return res.status(400).json({ message: 'Le versement n\'a pas encore été effectué pour cette demande de retrait.' });
    }

    // Créer la notification de versement de retrait avec le montant automatique
    const notification = new Notification_User({
      id_store: storeId,
      clientId: clientId,
      title: 'Demande de retrait approuvée',
      description: `Votre demande de retrait de ${demandeRetrait.montant} a été approuvée et le versement a été effectué.`
    });

    await notification.save();
    
    return res.status(200).json({ message: 'Notification de versement envoyée avec succès', notification });
  } catch (error) {
    return res.status(500).json({ message: 'Erreur lors de l\'envoi de la notification', error });
  }
};
