const express = require('express');
const router = express.Router();
const authenticateToken = require('../middleware/authenticateToken');
const { Pool } = require('pg');
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

router.get('/', authenticateToken, async (req, res) => {
  const userid = req.user.id;

  try {
    const query = `
      SELECT modelA1setup, modelA2setup, modelBsetup
      FROM farm_context
      WHERE id = $1
    `;

    const result = await pool.query(query, [userid]);

    if (result.rows.length === 0) {
      // No record found - return default false for all
      return res.json({
        modelA1setup: false,
        modelA2setup: false,
        modelBsetup: false,
      });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching farm setup:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
