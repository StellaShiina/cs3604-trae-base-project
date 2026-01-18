const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const app = express();

// route modules imports
const authRoutes = require('./routes/authRoutes');

// middleware imports
app.use(cors());
app.use(bodyParser.json());

// initialize database
require('./database/init_db');

// register routes
app.use('/api/v1/auth', authRoutes);

app.get('/', (req, res) => {
  res.json({ code: 200, message: 'Backend Ready' });
});

module.exports = app;