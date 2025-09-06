const express = require('express');
const { Pool } = require('pg');
const dotenv = require('dotenv');
const authenticateToken = require('../middleware/authenticateToken');
dotenv.config();
const {modelBtester} = require('../model-B-tester')
const router = express.Router();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

router.post('/', authenticateToken, async (req, res) => {
  const userid = req.user.id;
  const biosecurity_input = req.body.biosecurity_input;
console.log("Parsed biosecurity input:", biosecurity_input);

  const {
    gender,
    age,
    education,
    farm_type,
    years_farming,
    follow_prescription,
    check_expiry,
    increase_dosage,
    improvement_stop,
    misuse_amr,
    training_usage,
    consult_veterinan,
    amr_is_problem,
    regulations,
    withdraw,
    importance_withdraw,
    e_dispose,
    p_dispose,
    manure_mngt,
    store,
    disease_chicken = [],
    disease_pig = [],
    antibiotics_used = []
  } = biosecurity_input;

  const disease_chicken_count = disease_chicken.length;
  const disease_pig_count = disease_pig.length;
  const antibiotics_used_count = antibiotics_used.length;

  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    // Check if compliance record exists for this userid
    const existingQuery = 'SELECT id FROM compliance_and_risk_input WHERE userid = $1';
    const existingResult = await client.query(existingQuery, [userid]);

    let complianceId;

    if (existingResult.rows.length > 0) {
      // Update existing compliance record
      complianceId = existingResult.rows[0].id;

      const updateQuery = `
        UPDATE compliance_and_risk_input
        SET gender=$1, age=$2, education=$3, farm_type=$4, years_farming=$5,
            follow_prescription=$6, check_expiry=$7, increase_dosage=$8, improvement_stop=$9, misuse_amr=$10,
            training_usage=$11, consult_veterinan=$12, amr_is_problem=$13, regulations=$14, withdraw=$15,
            importance_withdraw=$16, e_dispose=$17, p_dispose=$18, manure_mngt=$19, store=$20,
            disease_chicken_count=$21, disease_pig_count=$22, antibiotics_used_count=$23
        WHERE id = $24
      `;

      const updateValues = [
        gender, age, education, farm_type, years_farming,
        follow_prescription, check_expiry, increase_dosage, improvement_stop, misuse_amr,
        training_usage, consult_veterinan, amr_is_problem, regulations, withdraw,
        importance_withdraw, e_dispose, p_dispose, manure_mngt, store,
        disease_chicken_count, disease_pig_count, antibiotics_used_count,
        complianceId
      ];

      await client.query(updateQuery, updateValues);

      // Remove old junction data for update
      await client.query('DELETE FROM compliance_disease_chicken WHERE compliance_id = $1', [complianceId]);
      await client.query('DELETE FROM compliance_disease_pig WHERE compliance_id = $1', [complianceId]);
      await client.query('DELETE FROM compliance_antibiotics_used WHERE compliance_id = $1', [complianceId]);

    } else {
      // Insert new compliance record
      const insertQuery = `
        INSERT INTO compliance_and_risk_input (
          userid,
          gender, age, education, farm_type, years_farming,
          follow_prescription, check_expiry, increase_dosage, improvement_stop, misuse_amr,
          training_usage, consult_veterinan, amr_is_problem, regulations, withdraw, importance_withdraw,
          e_dispose, p_dispose, manure_mngt, store,
          disease_chicken_count, disease_pig_count, antibiotics_used_count
        )
        VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21,$22,$23,$24)
        RETURNING id;
      `;

      const insertValues = [
        userid,
        gender, age, education, farm_type, years_farming,
        follow_prescription, check_expiry, increase_dosage, improvement_stop, misuse_amr,
        training_usage, consult_veterinan, amr_is_problem, regulations, withdraw, importance_withdraw,
        e_dispose, p_dispose, manure_mngt, store,
        disease_chicken_count, disease_pig_count, antibiotics_used_count
      ];

      const insertResult = await client.query(insertQuery, insertValues);
      complianceId = insertResult.rows[0].id;
    }

    // Insert disease_chicken junction records
    for (const diseaseId of disease_chicken) {
      await client.query(
        'INSERT INTO compliance_disease_chicken (compliance_id, diseaseid) VALUES ($1, $2) ON CONFLICT DO NOTHING',
        [complianceId, diseaseId]
      );
    }

    // Insert disease_pig junction records
    for (const diseaseId of disease_pig) {
      await client.query(
        'INSERT INTO compliance_disease_pig (compliance_id, diseaseid) VALUES ($1, $2) ON CONFLICT DO NOTHING',
        [complianceId, diseaseId]
      );
    }

    // Insert antibiotics_used junction records
    for (const antibioticId of antibiotics_used) {
      await client.query(
        'INSERT INTO compliance_antibiotics_used (compliance_id, antibioticid) VALUES ($1, $2) ON CONFLICT DO NOTHING',
        [complianceId, antibioticId]
      );
    }


    const modelInput = {
        gender,
        age,
        education,
        farm_type,
        years_farming,
        follow_prescription,
        check_expiry,
        increase_dosage,
        improvement_stop,
        misuse_amr,
        training_usage,
        consult_veterinan,
        amr_is_problem,
        regulations,
        withdraw,
        importance_withdraw,
        e_dispose,
        p_dispose,
        manure_mngt,
        store,
        disease_chicken_count,
        disease_pig_count,
        antibiotics_used_count,
    };

    const modelOutput = await modelBtester(modelInput);
    const { compliance, risk } = modelOutput;
    if (!modelOutput || typeof modelOutput !== 'object') {
    throw new Error("modelBtester returned invalid output");
    }


    const upsertOutputQuery = `
    INSERT INTO compliance_and_risk_output (dataid, compliance, risk)
    VALUES ($1, $2, $3)
    ON CONFLICT (dataid) DO UPDATE SET
        compliance = EXCLUDED.compliance,
        risk = EXCLUDED.risk
    `;

    await client.query(upsertOutputQuery, [
    complianceId,
    compliance,
    risk,
    ]);


    const updateQuery = `
      INSERT INTO farm_context (id, modelBsetup)
      VALUES ($1, TRUE)
      ON CONFLICT (id)
      DO UPDATE SET modelBsetup = TRUE
    `;

    await pool.query(updateQuery, [userid]);

    await client.query('COMMIT');

    res.status(201).json({ 
        message: 'Compliance and risk data saved', 
        complianceId, 
        model_output: { compliance, risk } 
    });

  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error inserting compliance data:', error);
    res.status(500).json({ error: 'Internal server error' });
  } finally {
    client.release();
  }
});


module.exports = router;
