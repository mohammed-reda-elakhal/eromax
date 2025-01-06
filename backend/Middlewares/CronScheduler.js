// CronScheduler.js
const cron = require('node-cron');
const { generateFacturesRetour } = require('../Controllers/factureRetourController');
const { createFacturesForClientsAndLivreurs } = require('../Controllers/factureController');
const { performAutomaticDemandeRetrait } = require('./ServiceDR');


const scheduleCronJobs = () => {
  // Facture Operations at 23:50 Africa/Casablanca timezone
  cron.schedule(
    '50 23 * * *',
    async () => {
      console.log('Running Facture Operations at 23:50 Africa/Casablanca timezone');
      try {
        await generateFacturesRetour();
        console.log('Facture Operations executed successfully');
      } catch (error) {
        console.error('Error executing Facture Operations:', error.message);
      }
    },
    {
      scheduled: true,
      timezone: 'Africa/Casablanca',
    }
  );

  // Demande Retrait Operations at 00:00 Africa/Casablanca timezone
  cron.schedule(
    '0 0 * * *',
    async () => {
      console.log('Running Demande Retrait Operations at 00:00 Africa/Casablanca timezone');
      try {
        const demandesRetrait = await performAutomaticDemandeRetrait();
        if (demandesRetrait.length > 0) {
          console.log('Demandes de retrait créées:', demandesRetrait);
        } else {
          console.log('Aucune demande de retrait créée.');
        }
        console.log('Demande Retrait Operations executed successfully');
      } catch (error) {
        console.error('Error executing Demande Retrait Operations:', error.message);
      }
    },
    {
      scheduled: true,
      timezone: 'Africa/Casablanca',
    }
  );
};

module.exports = scheduleCronJobs;
