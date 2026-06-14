const express = require('express');
const router = express.Router();
const multer = require('multer');
const csv = require('csv-parse/sync');
const fs = require('fs');
const path = require('path');
const { dbRun } = require('../database');
const { authenticateToken, requireRole } = require('../middleware/auth');

const upload = multer({ dest: path.join(__dirname, '..', 'uploads', 'temp') });

router.post('/jobs', authenticateToken, requireRole('employer'), upload.single('file'), async (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'CSV file is required' });
  try {
    const content = fs.readFileSync(req.file.path, 'utf-8');
    const records = csv.parse(content, { columns: true, skip_empty_lines: true, relax_column_count: true });
    let created = 0, errors = [];
    for (let i = 0; i < records.length; i++) {
      const row = records[i];
      if (!row.title || !row.location || !row.type || !row.description || !row.requirements) {
        errors.push(`Row ${i + 1}: Missing required fields (title, location, type, description, requirements)`);
        continue;
      }
      try {
        await dbRun(
          `INSERT INTO jobs (employer_id, title, company_name, location, type, experience_level, salary_range, description, requirements, benefits, skills_required)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)`,
          [req.user.id, row.title, req.user.name || req.body.company_name || 'Company', row.location, row.type,
           row.experience_level || 'Mid-Level', row.salary_range || 'Negotiable', row.description, row.requirements,
           row.benefits || '', row.skills_required || '']
        );
        created++;
      } catch (e) {
        errors.push(`Row ${i + 1}: ${e.message}`);
      }
    }
    fs.unlinkSync(req.file.path);
    res.json({ message: `Created ${created} jobs`, created, total: records.length, errors: errors.length ? errors : undefined });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
