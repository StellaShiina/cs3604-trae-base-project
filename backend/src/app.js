const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const app = express();

// route modules imports
const authRoutes = require('./routes/auth');
const ticketRoutes = require('./routes/tickets');
const orderRoutes = require('./routes/orders');
const passengerRoutes = require('./routes/passengers');

// middleware imports
app.use(cors());
app.use(bodyParser.json());

// initialize database
require('./database/init_db');

// register routes
app.use('/api/auth', authRoutes);
app.use('/api/tickets', ticketRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/passengers', passengerRoutes);

app.get('/', (req, res) => {
  res.json({ code: 200, message: 'Backend Ready' });
});

module.exports = app;