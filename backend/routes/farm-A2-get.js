const express = require('express');
const { Pool } = require('pg');
const dotenv = require('dotenv');
const authenticateToken = require('../middleware/authenticateToken');
dotenv.config();

const router = express.Router();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// Route to fetch all yield prediction inputs for a user
router.get('/data', authenticateToken, async (req, res) => {
  const userid = req.user.id;

  try {
    const query = `
      SELECT dataid, userid, crop, crop_year, season, state, area, production,
             annual_rainfall, fertilizer, pesticide
      FROM yield_prediction_input
      WHERE userid = $1
      ORDER BY dataid DESC
    `;
    const result = await pool.query(query, [userid]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'No yield prediction inputs found for the user' });
    }

    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching yield prediction inputs:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Route to fetch the latest yield prediction output (yield) for a user
router.get('/output', authenticateToken, async (req, res) => {
  const userid = req.user.id;

  try {
    const query = `
      SELECT ypo.yield
      FROM yield_prediction_output ypo
      JOIN yield_prediction_input ypi ON ypo.dataid = ypi.dataid
      WHERE ypi.userid = $1
      ORDER BY ypi.dataid DESC
      LIMIT 1
    `;
    const result = await pool.query(query, [userid]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'No yield prediction found for the user' });
    }

    res.json({ yield: result.rows[0].yield });
  } catch (error) {
    console.error('Error fetching yield prediction output:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
