import SuccessStory from '../models/SuccessStory.js';

// GET /api/stories
// Only approved stories are public. Supports domain filtering.
export const list = async (req, res) => {
  try {
    const query = { status: 'approved' };
    if (req.query.domain) query.domain = req.query.domain;

    const stories = await SuccessStory.find(query).sort({ createdAt: -1 });
    res.json(stories);
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};

// GET /api/stories/:id
// Used by StoryDetails.jsx. This route is public, so only approved stories are shown.
export const getOne = async (req, res) => {
  try {
    const story = await SuccessStory.findById(req.params.id);
    if (!story) return res.status(404).json({ message: 'Story not found' });

    if (story.status !== 'approved') {
      return res.status(403).json({ message: 'This story is not published yet' });
    }

    res.json(story);
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};

// GET /api/stories/mine (logged in user's own submitted stories, any status)
export const mine = async (req, res) => {
  try {
    const stories = await SuccessStory.find({ user: req.user.id }).sort({ createdAt: -1 });
    res.json(stories);
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};

// POST /api/stories
// New stories always start as 'pending' until an admin approves them
export const create = async (req, res) => {
  try {
    const story = await SuccessStory.create({ ...req.body, user: req.user.id, status: 'pending' });
    res.status(201).json(story);
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};

// GET /api/stories/pending (admin only)
export const pending = async (req, res) => {
  try {
    const stories = await SuccessStory.find({ status: 'pending' })
      .populate('user', 'name email')
      .sort({ createdAt: -1 });
    res.json(stories);
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};

// PUT /api/stories/:id/status (admin only) — approve or reject a story
export const updateStatus = async (req, res) => {
  try {
    const story = await SuccessStory.findByIdAndUpdate(
      req.params.id,
      { status: req.body.status },
      { new: true }
    );
    if (!story) return res.status(404).json({ message: 'Story not found' });
    res.json(story);
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};