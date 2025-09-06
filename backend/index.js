// npm install express cors dotenv jsonwebtoken bcrypt pg zod axios
const express = require('express');
const app = express();
const cors = require('cors');
const authjs = require('./routes/auth.js')
const refreshtokenjs = require('./routes/refresh-token.js')
const farmA1inputsjs = require('./routes/farm-A1-inputs.js')
const farmA2inputsjs = require('./routes/farm-A2-inputs.js')
const farmBinputsjs = require('./routes/farm-B-inputs.js')
const farmsetupjs = require('./routes/farm-setup.js')
const farmA1getjs = require('./routes/farm-A1-get.js')
const farmA2getjs = require('./routes/farm-A2-get.js')
const farmBgetjs = require('./routes/farm-B-get.js')

const dotenv = require('dotenv')
dotenv.config()

const PORT = process.env.PORT

// allowing reqs from frontend origin
app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true, // if using cookies or auth headers
  allowedHeaders: ['Authorization', 'Content-Type'],
}));
// allowing all origins during development
// app.use(cors());

// Middleware to parse JSON and URL-encoded form data
app.use(express.json());
app.use(express.urlencoded({ extended: true }));


// POST /api/auth -> auth.js (user auth login)
app.use('/api/auth', authjs)
// POST /api/refresh-token -> refresh-token.js
app.use('/api/refresh-token', refreshtokenjs)

// POST /api/farm/A1/inputs -> farm-A1-inputs.js
app.use('/api/farm/A1/inputs', farmA1inputsjs)
// POST /api/farm/A2/inputs -> farm-A2-inputs.js
app.use('/api/farm/A2/inputs', farmA2inputsjs)
// POST /api/farm/B/inputs -> farm-B-inputs.js
app.use('/api/farm/B/inputs', farmBinputsjs)
// GET /api/farm/setup -> farm-setup.js
app.use('/api/farm/setup', farmsetupjs)

// GET /api/farm/A1/get/data -> farm-A1-get.js
// GET /api/farm/A1/get/output -> farm-A1-get.js
app.use('/api/farm/A1/get', farmA1getjs)
// GET /api/farm/A2/get -> farm-A2-get.js
app.use('/api/farm/A2/get', farmA2getjs)
// GET /api/farm/B/get -> farm-B-get.js
app.use('/api/farm/B/get', farmBgetjs)




app.listen(PORT, ()=>{console.log(`backend server running at http://localhost:${PORT}`)})