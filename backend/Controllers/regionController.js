const { Region } = require('../Models/Region');

// Create Region
exports.createRegion = async (req, res) => {
  try {
    const { nom, key } = req.body;
    const region = new Region({ nom, key });
    await region.save();
    res.status(201).json(region);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get all Regions
exports.getRegions = async (req, res) => {
  try {
    const regions = await Region.find();
    res.status(200).json(regions);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get single Region
exports.getRegion = async (req, res) => {
  try {
    const region = await Region.findById(req.params.id);
    if (!region) return res.status(404).json({ error: 'Region not found' });
    res.status(200).json(region);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update Region
exports.updateRegion = async (req, res) => {
  try {
    const { nom, key } = req.body;
    const region = await Region.findByIdAndUpdate(
      req.params.id,
      { nom, key },
      { new: true }
    );
    if (!region) return res.status(404).json({ error: 'Region not found' });
    res.status(200).json(region);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Delete Region
exports.deleteRegion = async (req, res) => {
  try {
    const region = await Region.findByIdAndDelete(req.params.id);
    if (!region) return res.status(404).json({ error: 'Region not found' });
    res.status(200).json({ message: 'Region deleted' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}; 