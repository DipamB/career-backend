const express = require('express');
const router = express.Router();
const Career = require('../models/Career');
const auth = require('../middleware/auth');

// GET all careers
router.get('/', async (req, res) => {
  try {
    const careers = await Career.find();
    res.json(careers);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// GET single career by ID
router.get('/:id', async (req, res) => {
  try {
    const career = await Career.findById(req.params.id);
    if (!career) return res.status(404).json({ message: 'Career not found' });
    res.json(career);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// POST add new career
router.post('/add', auth, async (req, res) => {
  try {
    const { title, description, requiredSkills, recommendedCourses, averageSalary, jobDemand } = req.body;
    const career = new Career({
      title, description, requiredSkills,
      recommendedCourses, averageSalary, jobDemand
    });
    await career.save();
    res.status(201).json({ message: 'Career added successfully', career });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// DELETE career
router.delete('/:id', async (req, res) => {
  try {
    await Career.findByIdAndDelete(req.params.id);
    res.json({ message: 'Career deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Connect to Drishtanta's AI engine
router.post('/recommend', auth, async (req, res) => {
  try {
    const response = await fetch('https://person2-ai-engine.onrender.com/recommend', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(req.body)
    });
    const data = await response.json();
    res.json(data);
  } catch (err) {
    res.status(500).json({ message: 'AI engine error', error: err.message });
  }
});

module.exports = router;