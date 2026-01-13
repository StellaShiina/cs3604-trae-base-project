const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const app = express();
const port = 3000;

 
app.use(cors());
app.use(bodyParser.json());

 
require('./database/init_db');

 
const authRoutes = require('./routes/auth');
const ticketRoutes = require('./routes/tickets');
const passengerRoutes = require('./routes/passengers');
const orderRoutes = require('./routes/orders');
const usersRoutes = require('./routes/users');
const authMiddleware = require('./middleware/authMiddleware');

// Public Routes
app.use('/api/auth', authRoutes);
app.use('/api/tickets', ticketRoutes);

// Protected Routes
app.use('/api/users', authMiddleware, usersRoutes);
app.use('/api/passengers', authMiddleware, passengerRoutes);
app.use('/api/orders', authMiddleware, orderRoutes);

app.get('/', (req, res) => {
  res.json({ code: 200, message: 'Backend Ready' });
});

 
if (require.main === module) {
  app.listen(port, () => {
    console.log(`Backend listening at http://localhost:${port}`);
  });
}

module.exports = app;
