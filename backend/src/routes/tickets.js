const express = require('express');
const router = express.Router();
const db = require('../database/init_db');

// Get all stations
router.get('/stations', (req, res) => {
  const sql = 'SELECT * FROM stations';
  db.all(sql, [], (err, rows) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json({
      code: 200,
      message: 'Success',
      data: rows
    });
  });
});

// Query tickets
router.get('/query', (req, res) => {
  const { fromStation, toStation, date } = req.query;
  
  // Note: Date filtering is omitted for MVP as we might not have seeded date-specific data
  // or we need to handle date format strictly.
  
  const sql = `
    SELECT 
      t.train_number as trainNumber, 
      s.departure_time as departureTime, 
      s.arrival_time as arrivalTime, 
      s.duration,
      fs.name as fromStation,
      ts.name as toStation
    FROM schedules s
    JOIN trains t ON s.train_id = t.id
    JOIN stations fs ON s.from_station_id = fs.id
    JOIN stations ts ON s.to_station_id = ts.id
    WHERE fs.name LIKE ? AND ts.name LIKE ?
  `;

  const params = [`%${fromStation}%`, `%${toStation}%`];

  db.all(sql, params, (err, rows) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json({
      code: 200,
      message: 'Success',
      data: rows
    });
  });
});

module.exports = router;
