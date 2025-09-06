const dotenv = require('dotenv');
dotenv.config();

const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

(async () => {
  try {
    // Create crops table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS crops (
        crop VARCHAR(50) PRIMARY KEY
      );
    `);

    // Create disease_chicken_list table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS disease_chicken_list (
        diseaseid SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL
      );
    `);

    // Create disease_pig_list table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS disease_pig_list (
        diseaseid SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL
      );
    `);

    // Create antibiotics_list table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS antibiotics_list (
        antibioticid SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL
      );
    `);

    console.log('Constant tables created successfully.');

    // Insert sample data into crops (replace with your actual crops)
    const crops = ['Arecanut', 'Arhar/Tur', 'Bajra', 'Banana', 'Barley', 'Black pepper', 'Cardamom', 'Cashewnut', 'Castor seed', 'Coconut ', 'Coriander', 'Cotton(lint)', 'Cowpea(Lobia)', 'Dry chillies', 'Garlic', 'Ginger', 'Gram', 'Groundnut', 'Guar seed', 'Horse-gram', 'Jowar', 'Jute', 'Khesari', 'Linseed', 'Maize', 'Masoor', 'Mesta', 'Moong(Green Gram)', 'Moth', 'Niger seed', 'Oilseeds total', 'Onion', 'Other  Rabi pulses', 'Other Cereals', 'Other Kharif pulses', 'other oilseeds', 'Other Summer Pulses', 'Peas & beans (Pulses)', 'Potato', 'Ragi', 'Rapeseed &Mustard', 'Rice', 'Safflower', 'Sannhamp', 'Sesamum', 'Small millets', 'Soyabean', 'Sugarcane', 'Sunflower', 'Sweet potato', 'Tapioca', 'Tobacco', 'Turmeric', 'Urad', 'Wheat'];
    for (const crop of crops) {
      await pool.query(`
        INSERT INTO crops (crop)
        VALUES ($1)
        ON CONFLICT (crop) DO NOTHING;
      `, [crop]);
    }

    // Insert sample chicken diseases
    const chickenDiseases = ['Newcastle', 'Infectious Bursal', 'Coccidiosis', 'Coryza', 'Cholera', 'Fowl Pox', 'Worms', 'Parasites'];
    for (const disease of chickenDiseases) {
      await pool.query(`
        INSERT INTO disease_chicken_list (name)
        VALUES ($1)
        ON CONFLICT DO NOTHING;
      `, [disease]);
    }

    // Insert sample pig diseases
    const pigDiseases = ['Diarrhea', 'Mange', 'African Swine', 'Swine Erysipelas', 'Pneumonia', 'Swine Dysentery', 'Malnutrition', 'Brucellosis', 'Anthrax', 'Scouring', 'Foot Mouth'];
    for (const disease of pigDiseases) {
      await pool.query(`
        INSERT INTO disease_pig_list (name)
        VALUES ($1)
        ON CONFLICT DO NOTHING;
      `, [disease]);
    }

    // Insert sample antibiotics
    const antibiotics = ['Penicillin', 'Oxytetracycline', 'Trimethoprim Sulfamethoxazole', 'Sulfadiazine', 'Enrofloxacin', 'Gentamicin', 'Amoxicillin', 'Doxycycline', 'Tylosin', 'Colistin', 'Penicillin1', 'Penicillin2', 'Oxytetracycline', 'Oxytetracycline1', 'Oxytetracycline2', 'Oxytetracycline3', 'Sulfamethoxazole1', 'Sulfamethoxazole2', 'Enrofloxacin', 'Doxycycline1', 'Doxycycline2', 'Oxytetracycline'];
    for (const antibiotic of antibiotics) {
      await pool.query(`
        INSERT INTO antibiotics_list (name)
        VALUES ($1)
        ON CONFLICT DO NOTHING;
      `, [antibiotic]);
    }

    console.log('Sample data inserted successfully.');
  } catch (error) {
    console.error('Error setting up constant tables:', error);
  } finally {
    await pool.end();
  }
})();
