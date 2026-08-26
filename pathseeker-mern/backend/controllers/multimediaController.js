import Multimedia from '../models/Multimedia.js';

// GET /api/multimedia
// Supports: search, category, type (video/podcast), tag
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
    if (req.query.type) query.type = req.query.type;
    if (req.query.tag) query.tags = req.query.tag;

    const items = await Multimedia.find(query).sort({ createdAt: -1 });
    res.json(items);
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};

// GET /api/multimedia/:id
export const getOne = async (req, res) => {
  try {
    const item = await Multimedia.findById(req.params.id);
    if (!item) return res.status(404).json({ message: 'Video/podcast not found' });
    res.json(item);
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};

// POST /api/multimedia/:id/rating
// Body: { rating: 1-5 }
// Recalculates the average rating using the classic running-average formula:
// newAvg = (oldAvg * oldCount + newRating) / (oldCount + 1)
export const rate = async (req, res) => {
  try {
    const { rating } = req.body;
    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ message: 'Rating must be between 1 and 5' });
    }

    const item = await Multimedia.findById(req.params.id);
    if (!item) return res.status(404).json({ message: 'Video/podcast not found' });

    const newCount = item.ratingCount + 1;
    const newAvg = ((item.ratingAvg * item.ratingCount) + Number(rating)) / newCount;

    item.ratingAvg = Math.round(newAvg * 10) / 10; // round to 1 decimal place
    item.ratingCount = newCount;
    await item.save();

    res.json(item);
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};

// POST /api/multimedia (admin only)
export const create = async (req, res) => {
  try {
    const item = await Multimedia.create({ ...req.body, createdBy: req.user.id });
    res.status(201).json(item);
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};

// PUT /api/multimedia/:id (admin only)
export const update = async (req, res) => {
  try {
    const item = await Multimedia.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!item) return res.status(404).json({ message: 'Video/podcast not found' });
    res.json(item);
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};

// DELETE /api/multimedia/:id (admin only)
export const remove = async (req, res) => {
  try {
    await Multimedia.findByIdAndDelete(req.params.id);
    res.json({ message: 'Deleted' });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};