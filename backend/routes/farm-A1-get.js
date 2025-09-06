const express = require('express');
const { Pool } = require('pg');
const dotenv = require('dotenv');
const authenticateToken = require('../middleware/authenticateToken');
dotenv.config();

const router = express.Router();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

router.get('/data', authenticateToken, async (req, res) => {
  const userid = req.user.id;

  try {
    const query = `
      SELECT dataid, userid, n, p, k, temp, humidity, ph, rainfall
      FROM crop_classifier_input
      WHERE userid = $1
      ORDER BY dataid DESC
    `;
    const result = await pool.query(query, [userid]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'No inputs found for the user' });
    }

    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching inputs:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});


router.get('/output', authenticateToken, async (req, res) => {
  const userid = req.user.id;

  try {
    const query = `
      SELECT cco.label
      FROM crop_classifier_output cco
      JOIN crop_classifier_input cci ON cco.dataid = cci.dataid
      WHERE cci.userid = $1
      ORDER BY cci.dataid DESC
      LIMIT 1
    `;
    const result = await pool.query(query, [userid]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'No classification label found for the user' });
    }

    res.json({ label: result.rows[0].label });
  } catch (error) {
    console.error('Error fetching label:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
