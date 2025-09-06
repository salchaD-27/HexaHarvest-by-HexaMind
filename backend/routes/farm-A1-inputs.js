const express = require('express');
const { Pool } = require('pg');
const dotenv = require('dotenv');
const authenticateToken = require('../middleware/authenticateToken');
dotenv.config();
const {modelA1tester} = require('../model-A1-tester')
const router = express.Router();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});


seasonsMap={
  'Autumn':'Autumn     ', 
  'Kharif': 'Kharif     ',
  'Rabi': 'Rabi       ',
  'Summer': 'Summer     ',
  'Winter': 'Winter     ',
  'Whole Year':'Whole Year '
}

router.post('/', authenticateToken, async (req, res) => {
  const userid = req.user.id;
  const { crop_classifier_input } = req.body;

  if (!crop_classifier_input) {
    return res.status(400).json({ error: 'Missing input data for crop_classifier' });
  }

  try {
    // Begin transaction
    await pool.query('BEGIN');

    // Check if an entry already exists for this user
    const existingQuery = 'SELECT dataid FROM crop_classifier_input WHERE userid = $1';
    const existingResult = await pool.query(existingQuery, [userid]);

    let cropClassifierDataId;

    if (existingResult.rows.length > 0) {
      // Update existing row
      cropClassifierDataId = existingResult.rows[0].dataid;

      const updateQuery = `
        UPDATE crop_classifier_input
        SET n = $1, p = $2, k = $3, temp = $4, humidity = $5, ph = $6, rainfall = $7
        WHERE dataid = $8
      `;
      const updateValues = [
        crop_classifier_input.n,
        crop_classifier_input.p,
        crop_classifier_input.k,
        crop_classifier_input.temp,
        crop_classifier_input.humidity,
        crop_classifier_input.ph,
        crop_classifier_input.rainfall,
        cropClassifierDataId,
      ];
      await pool.query(updateQuery, updateValues);
    } else {
      // Insert new row
      const insertQuery = `
        INSERT INTO crop_classifier_input (userid, n, p, k, temp, humidity, ph, rainfall)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        RETURNING dataid
      `;
      const insertValues = [
        userid,
        crop_classifier_input.n,
        crop_classifier_input.p,
        crop_classifier_input.k,
        crop_classifier_input.temp,
        crop_classifier_input.humidity,
        crop_classifier_input.ph,
        crop_classifier_input.rainfall,
      ];
      const insertResult = await pool.query(insertQuery, insertValues);
      cropClassifierDataId = insertResult.rows[0].dataid;
    }

    const soil_data = {
      Nitrogen: crop_classifier_input.n,
      Phosphorus: crop_classifier_input.p,
      Potassium: crop_classifier_input.k,
      temprature: crop_classifier_input.temp,
      humidity: crop_classifier_input.humidity,
      ph: crop_classifier_input.ph,
      rainfall: crop_classifier_input.rainfall,
    };

    const modelOutput = await modelA1tester(soil_data);
    const predictedLabel = modelOutput.Prediction;

    const outputExistsQuery = 'SELECT 1 FROM crop_classifier_output WHERE dataid = $1';
    const outputExistsResult = await pool.query(outputExistsQuery, [cropClassifierDataId]);

    if (outputExistsResult.rowCount > 0) {
      const updateOutputQuery = `
        UPDATE crop_classifier_output
        SET label = $1
        WHERE dataid = $2
      `;
      await pool.query(updateOutputQuery, [predictedLabel, cropClassifierDataId]);
    } else {
      const insertOutputQuery = `
        INSERT INTO crop_classifier_output (dataid, label)
        VALUES ($1, $2)
      `;
      await pool.query(insertOutputQuery, [cropClassifierDataId, predictedLabel]);
    }



    const updateQuery = `
      INSERT INTO farm_context (id, modelA1setup)
      VALUES ($1, TRUE)
      ON CONFLICT (id)
      DO UPDATE SET modelA1setup = TRUE
    `;

    await pool.query(updateQuery, [userid]);


    // Commit transaction
    await pool.query('COMMIT');

    res.status(201).json({
      message: 'Data saved successfully',
      crop_classifier_dataid: cropClassifierDataId,
      model_output: modelOutput,
    });
  } catch (error) {
    await pool.query('ROLLBACK');
    console.error('Error saving data:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
