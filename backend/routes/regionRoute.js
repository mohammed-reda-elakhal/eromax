const express = require('express');
const router = express.Router();
const regionController = require('../Controllers/regionController');

router.post('/', regionController.createRegion);
router.get('/', regionController.getRegions);
router.get('/:id', regionController.getRegion);
router.put('/:id', regionController.updateRegion);
router.delete('/:id', regionController.deleteRegion);

module.exports = router; 