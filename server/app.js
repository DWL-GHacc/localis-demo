// server/app.js
require('dotenv').config();
const express = require('express');
const usersRouter = require('./routes/users'); // FIXED PATH
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());              // allow client to call API
app.use(express.json());      // parse JSON

app.get('/', (req, res) => {
  res.json({ status: 'ok', message: 'Localis API running' });
});

// user routes
app.use('/users', usersRouter);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
