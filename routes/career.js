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
const axios = require('axios');
const AI_ENGINE_URL = 'https://person2-ai-engine.onrender.com/recommend';

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

router.post('/recommend', auth, async (req, res) => {
  const maxAttempts = 3;
  const perAttemptTimeoutMs = 100000; // 100s — covers slow cold starts/LLM calls
  const delayBetweenAttemptsMs = 5000;

  let lastError = null;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      const response = await axios.post(AI_ENGINE_URL, req.body, {
        timeout: perAttemptTimeoutMs,
        headers: { 'Content-Type': 'application/json' }
      });

      return res.json(response.data);

    } catch (err) {
      lastError = err.response
        ? `AI engine returned ${err.response.status}`
        : err.message;

      if (attempt < maxAttempts) {
        await sleep(delayBetweenAttemptsMs);
        continue;
      }

      return res.status(502).json({
        message: 'AI engine is unavailable right now (it may be waking up or slow). Please try again in a minute.',
        error: lastError
      });
    }
  }
});
module.exports = router;
