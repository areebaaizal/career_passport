import Career from '../models/Career.js';

// GET /api/careers
// Supports: search, domain, skill, demand, minSalary, maxSalary
export const list = async (req, res) => {
  try {
    const query = {};

    // Search by title or description
    if (req.query.search) {
      query.$or = [
        { title: new RegExp(req.query.search, 'i') },
        { description: new RegExp(req.query.search, 'i') }
      ];
    }

    // Domain filter (e.g. Technology, Design, Data)
    if (req.query.domain) {
      query.domain = req.query.domain;
    }

    // Job demand filter (Low / Medium / High)
    if (req.query.demand) {
      query.demand = req.query.demand;
    }

    // Skill filter — matches if the career's skills array contains this skill
    if (req.query.skill) {
      query.skills = new RegExp(req.query.skill, 'i');
    }

    // Salary range filter
    if (req.query.minSalary || req.query.maxSalary) {
      query.salary = {};
      if (req.query.minSalary) query.salary.$gte = Number(req.query.minSalary);
      if (req.query.maxSalary) query.salary.$lte = Number(req.query.maxSalary);
    }

    const careers = await Career.find(query).sort({ createdAt: -1 });
    res.json(careers);
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};

// GET /api/careers/:id
export const getOne = async (req, res) => {
  try {
    const career = await Career.findById(req.params.id);
    if (!career) return res.status(404).json({ message: 'Career not found' });
    res.json(career);
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};

// POST /api/careers (admin only)
export const create = async (req, res) => {
  try {
    const career = await Career.create(req.body);
    res.status(201).json(career);
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};

// PUT /api/careers/:id (admin only)
export const update = async (req, res) => {
  try {
    const career = await Career.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!career) return res.status(404).json({ message: 'Career not found' });
    res.json(career);
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};

// DELETE /api/careers/:id (admin only)
export const remove = async (req, res) => {
  try {
    await Career.findByIdAndDelete(req.params.id);
    res.json({ message: 'Career deleted' });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};