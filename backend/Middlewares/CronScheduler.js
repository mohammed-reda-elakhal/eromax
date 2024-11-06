// CronScheduler.js
const cron = require('node-cron');
const { generateFacturesRetour } = require('../Controllers/factureRetourController'); // Adjust the path as needed
const { createFacturesForClientsAndLivreurs } = require('../Controllers/factureController');

// Schedule a job to create FactureRetour every day at 00:02 AM
cron.schedule('27 16 * * *', async () => {
    console.log('Running daily FactureRetour generation at 00:02 AM');
    try {
        await generateFacturesRetour();
        await createFacturesForClientsAndLivreurs()
        console.log('Factures generation completed successfully.');
    } catch (error) {
        console.error('Error generating FactureRetour:', error);
    }
});
