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
app.use('/api/auth', authRoutes);
app.use('/api/tickets', ticketRoutes);

app.get('/', (req, res) => {
  res.json({ code: 200, message: 'Backend Ready' });
});

 
if (require.main === module) {
  app.listen(port, () => {
    console.log(`Backend listening at http://localhost:${port}`);
  });
}

module.exports = app;
