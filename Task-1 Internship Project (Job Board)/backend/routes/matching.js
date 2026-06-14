const express = require('express');
const router = express.Router();
const { dbGet, dbAll, dbRun } = require('../database');
const { authenticateToken } = require('../middleware/auth');
const { extractSkills, calculateMatchScore } = require('../services/resumeParser');
const fs = require('fs');
const path = require('path');

router.use(authenticateToken);

router.post('/parse-resume', async (req, res) => {
  try {
    const { text } = req.body;
    if (!text) return res.status(400).json({ error: 'No text provided' });
    const skills = extractSkills(text);
    res.json({ skills, count: skills.length });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/job-fit/:jobId', async (req, res) => {
  try {
    const job = await dbGet('SELECT * FROM jobs WHERE id = $1', [req.params.jobId]);
    if (!job) return res.status(404).json({ error: 'Job not found' });
    const profile = await dbGet('SELECT * FROM profiles WHERE user_id = $1', [req.user.id]);
    const candidateSkills = profile?.skills ? profile.skills.split(',').map(s => s.trim().toLowerCase()) : [];
    if (!candidateSkills.length) return res.json({ score: 0, matched: [], missing: [], error: 'No skills in profile. Add skills to your profile.' });
    const jobSkills = job.skills_required ? job.skills_required.split(',').map(s => s.trim().toLowerCase()) : [];
    const matched = jobSkills.filter(s => candidateSkills.some(cs => cs.includes(s) || s.includes(cs)));
    const missing = jobSkills.filter(s => !candidateSkills.some(cs => cs.includes(s) || s.includes(cs)));
    const score = jobSkills.length ? Math.round((matched.length / jobSkills.length) * 100) : 0;
    res.json({ jobTitle: job.title, score, matched, missing });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/skill-match', async (req, res) => {
  try {
    const { skills: userSkills } = req.query;
    if (!userSkills) return res.status(400).json({ error: 'Provide skills query param (comma-separated)' });
    const inputSkills = userSkills.split(',').map(s => s.trim().toLowerCase());
    const jobs = await dbAll('SELECT * FROM jobs ORDER BY created_at DESC LIMIT 50');
    const scored = jobs.map(job => {
      const jobSkills = job.skills_required ? job.skills_required.split(',').map(s => s.trim().toLowerCase()) : [];
      const matched = jobSkills.filter(s => inputSkills.some(cs => cs.includes(s) || s.includes(cs)));
      const missing = jobSkills.filter(s => !inputSkills.some(cs => cs.includes(s) || s.includes(cs)));
      const score = jobSkills.length ? Math.round((matched.length / jobSkills.length) * 100) : 0;
      return { id: job.id, title: job.title, company: job.company_name, location: job.location, score, matched, missing };
    });
    res.json(scored.sort((a, b) => b.score - a.score).slice(0, 10));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
