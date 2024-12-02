// CronScheduler.js
const cron = require('node-cron');
const { generateFacturesRetour } = require('../Controllers/factureRetourController'); // Adjust the path as needed
const { createFacturesForClientsAndLivreurs } = require('../Controllers/factureController');
const { createAutomaticDemandeRetrait } = require('../Controllers/demandeRetraitController');

// Schedule a job to create FactureRetour every day at 00:02 AM
cron.schedule('50 23 * * *', async () => {
    console.log('Running daily FactureRetour generation at 00:02 AM');
    try {
        await generateFacturesRetour();
        await createFacturesForClientsAndLivreurs()
        // Création des demandes de retrait automatiques
        await createAutomaticDemandeRetrait();
        console.log('Factures generation completed successfully.');
    } catch (error) {
        console.error('Error generating FactureRetour:', error);
    }
});
