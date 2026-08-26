import Resource from '../models/Resource.js';

// GET /api/resources
// Supports: search, category, tag
export const list = async (req, res) => {
  try {
    const query = {};

    if (req.query.search) {
      query.$or = [
        { title: new RegExp(req.query.search, 'i') },
        { description: new RegExp(req.query.search, 'i') }
      ];
    }
    if (req.query.category) query.category = req.query.category;
    if (req.query.tag) query.tags = req.query.tag;

    const resources = await Resource.find(query).sort({ createdAt: -1 });
    res.json(resources);
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};

// GET /api/resources/:id
// Also counts as a "download" — increments downloadCount so admin can track popularity
export const getOne = async (req, res) => {
  try {
    const resource = await Resource.findByIdAndUpdate(
      req.params.id,
      { $inc: { downloadCount: 1 } },
      { new: true }
    );
    if (!resource) return res.status(404).json({ message: 'Resource not found' });
    res.json(resource);
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};

// POST /api/resources (admin only)
export const create = async (req, res) => {
  try {
    const resource = await Resource.create({ ...req.body, createdBy: req.user.id });
    res.status(201).json(resource);
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};

// PUT /api/resources/:id (admin only)
export const update = async (req, res) => {
  try {
    const resource = await Resource.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!resource) return res.status(404).json({ message: 'Resource not found' });
    res.json(resource);
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};

// DELETE /api/resources/:id (admin only)
export const remove = async (req, res) => {
  try {
    await Resource.findByIdAndDelete(req.params.id);
    res.json({ message: 'Resource deleted' });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};