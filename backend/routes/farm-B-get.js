const express = require('express');
const { Pool } = require('pg');
const dotenv = require('dotenv');
const authenticateToken = require('../middleware/authenticateToken');
dotenv.config();

const router = express.Router();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// Fetch the latest compliance input data with junction lists
router.get('/data', authenticateToken, async (req, res) => {
  const userid = req.user.id;

  try {
    // Step 1: Get the latest compliance input record
    const inputQuery = `
    SELECT *
    FROM compliance_and_risk_input
    WHERE userid = $1
    ORDER BY id DESC
    LIMIT 1
  `;
    const inputResult = await pool.query(inputQuery, [userid]);

    if (inputResult.rows.length === 0) {
      return res.status(404).json({ error: 'No compliance input data found for the user' });
    }

    const input = inputResult.rows[0];
    const complianceId = input.id;

    // Step 2: Fetch many-to-many related IDs
    const [chickenDiseases, pigDiseases, antibioticsUsed] = await Promise.all([
      pool.query(
        `SELECT diseaseid FROM compliance_disease_chicken WHERE compliance_id = $1`,
        [complianceId]
      ),
      pool.query(
        `SELECT diseaseid FROM compliance_disease_pig WHERE compliance_id = $1`,
        [complianceId]
      ),
      pool.query(
        `SELECT antibioticid FROM compliance_antibiotics_used WHERE compliance_id = $1`,
        [complianceId]
      ),
    ]);

    // Step 3: Build the result in ModelB structure
    const result = {
      gender: input.gender,
      age: input.age,
      education: input.education,
      farm_type: input.farm_type,
      years_farming: input.years_farming,
      follow_prescription: input.follow_prescription,
      check_expiry: input.check_expiry,
      increase_dosage: input.increase_dosage,
      improvement_stop: input.improvement_stop,
      misuse_amr: input.misuse_amr,
      training_usage: input.training_usage,
      consult_veterinan: input.consult_veterinan,
      amr_is_problem: input.amr_is_problem,
      regulations: input.regulations,
      withdraw: input.withdraw,
      importance_withdraw: input.importance_withdraw,
      e_dispose: input.e_dispose,
      p_dispose: input.p_dispose,
      manure_mngt: input.manure_mngt,
      store: input.store,
      disease_chicken: chickenDiseases.rows.map(row => row.diseaseid),
      disease_chicken_count: chickenDiseases.rowCount,
      disease_pig: pigDiseases.rows.map(row => row.diseaseid),
      disease_pig_count: pigDiseases.rowCount,
      antibiotics_used: antibioticsUsed.rows.map(row => row.antibioticid),
      antibiotics_used_count: antibioticsUsed.rowCount,
    };

    res.json(result);
  } catch (error) {
    console.error('Error fetching compliance input:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Fetch the latest compliance and risk output for the user
router.get('/output', authenticateToken, async (req, res) => {
  const userid = req.user.id;

  try {
    // Get latest compliance input ID
    const inputQuery = `
      SELECT id
      FROM compliance_and_risk_input
      WHERE userid = $1
      ORDER BY id DESC
      LIMIT 1
    `;

    const inputResult = await pool.query(inputQuery, [userid]);

    if (inputResult.rows.length === 0) {
      return res.status(404).json({ error: 'No compliance input data found for the user' });
    }

    const complianceId = inputResult.rows[0].id;

    // Get output
    const outputQuery = `
      SELECT compliance, risk
      FROM compliance_and_risk_output
      WHERE dataid = $1
    `;
    const outputResult = await pool.query(outputQuery, [complianceId]);

    if (outputResult.rows.length === 0) {
      return res.status(404).json({ error: 'No compliance output found for the user' });
    }

    res.json(outputResult.rows[0]);
  } catch (error) {
    console.error('Error fetching compliance output:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
