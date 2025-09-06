const express = require('express');
const { Pool } = require('pg');
const dotenv = require('dotenv');
const authenticateToken = require('../middleware/authenticateToken');
dotenv.config();
const {modelA2tester} = require('../model-A2-tester')
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
  const { yield_prediction_input } = req.body;

  if (!yield_prediction_input) {
    return res.status(400).json({ error: 'Missing input data for yield_prediction' });
  }

  try {
    // Begin transaction
    await pool.query('BEGIN');

    // Check if entry exists for this userid
    const existingQuery = 'SELECT dataid FROM yield_prediction_input WHERE userid = $1';
    const existingResult = await pool.query(existingQuery, [userid]);

    let yieldPredictionDataId;

    if (existingResult.rows.length > 0) {
      // Update existing row
      yieldPredictionDataId = existingResult.rows[0].dataid;

      const updateQuery = `
        UPDATE yield_prediction_input
        SET crop = $1, crop_year = $2, season = $3, state = $4, area = $5, production = $6, annual_rainfall = $7, fertilizer = $8, pesticide = $9
        WHERE dataid = $10
      `;
      const updateValues = [
        yield_prediction_input.crop,
        yield_prediction_input.crop_year,
        yield_prediction_input.season,
        yield_prediction_input.state,
        yield_prediction_input.area,
        yield_prediction_input.production,
        yield_prediction_input.annual_rainfall,
        yield_prediction_input.fertilizer,
        yield_prediction_input.pesticide,
        yieldPredictionDataId,
      ];
      await pool.query(updateQuery, updateValues);
    } else {
      // Insert new row
      const insertQuery = `
        INSERT INTO yield_prediction_input 
        (userid, crop, crop_year, season, state, area, production, annual_rainfall, fertilizer, pesticide)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
        RETURNING dataid;
      `;
      const insertValues = [
        userid,
        yield_prediction_input.crop,
        yield_prediction_input.crop_year,
        yield_prediction_input.season,
        yield_prediction_input.state,
        yield_prediction_input.area,
        yield_prediction_input.production,
        yield_prediction_input.annual_rainfall,
        yield_prediction_input.fertilizer,
        yield_prediction_input.pesticide,
      ];
      const insertResult = await pool.query(insertQuery, insertValues);
      yieldPredictionDataId = insertResult.rows[0].dataid;
    }

    const yield_data = {
      Crop: yield_prediction_input.crop,
      Season: yield_prediction_input.season,
      State: yield_prediction_input.state,
      Area: yield_prediction_input.area,
      Production: yield_prediction_input.production,
      Annual_Rainfall: yield_prediction_input.annual_rainfall,
      Fertilizer: yield_prediction_input.fertilizer,
      Pesticide: yield_prediction_input.pesticide,
    };

    const modelOutput = await modelA2tester(yield_data);
    const predictionValue = modelOutput.Prediction;

    const outputExistsQuery = 'SELECT 1 FROM yield_prediction_output WHERE dataid = $1';
    const outputExistsResult = await pool.query(outputExistsQuery, [yieldPredictionDataId]);

    if (outputExistsResult.rowCount > 0) {
      const updateOutputQuery = `
        UPDATE yield_prediction_output
        SET yield = $1
        WHERE dataid = $2
      `;
      await pool.query(updateOutputQuery, [predictionValue, yieldPredictionDataId]);
    } else {
      const insertOutputQuery = `
        INSERT INTO yield_prediction_output (dataid, yield)
        VALUES ($1, $2)
      `;
      await pool.query(insertOutputQuery, [yieldPredictionDataId, predictionValue]);
    }


    const updateQuery = `
      INSERT INTO farm_context (id, modelA2setup)
      VALUES ($1, TRUE)
      ON CONFLICT (id)
      DO UPDATE SET modelA2setup = TRUE
    `;

    await pool.query(updateQuery, [userid]);


    // Commit transaction
    await pool.query('COMMIT');

    res.status(201).json({
      message: 'Data saved successfully',
      yield_prediction_dataid: yieldPredictionDataId,
      model_output: modelOutput,
    });
  } catch (error) {
    await pool.query('ROLLBACK');
    console.error('Error saving data:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});


module.exports = router;
