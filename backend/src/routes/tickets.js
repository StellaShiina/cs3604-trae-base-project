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
  
  if (!fromStation || !toStation) {
     return res.json({ code: 200, message: 'Success', data: [] });
  }

  // Use train_station_mapping to find trains
  const sql = `
    SELECT 
      t.train_number as trainNumber, 
      tsm1.departure_time as departureTime, 
      tsm2.arrival_time as arrivalTime,
      tsm1.duration as durationStart,
      tsm2.duration as durationEnd,
      fs.name as fromStation,
      ts.name as toStation
    FROM trains t
    JOIN train_station_mapping tsm1 ON t.id = tsm1.train_id
    JOIN train_station_mapping tsm2 ON t.id = tsm2.train_id
    JOIN stations fs ON tsm1.station_id = fs.id
    JOIN stations ts ON tsm2.station_id = ts.id
    WHERE fs.name LIKE ? AND ts.name LIKE ? AND tsm1.stop_order < tsm2.stop_order
  `;

  const params = [`%${fromStation}%`, `%${toStation}%`];

  db.all(sql, params, (err, rows) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }

    // Process rows to add duration string and prices
    const results = rows.map(row => {
        // Simple duration calculation (mock or based on time)
        // For now just returning string
        const duration = '2时30分'; // Mock
        
        // Mock Prices based on train number or random
        const isG = row.trainNumber.startsWith('G');
        const basePrice = isG ? 500 : 200;
        
        return {
            ...row,
            duration,
            price: {
                business: isG ? basePrice * 3 : null,
                first: isG ? basePrice * 1.6 : null,
                second: basePrice,
                softSleeper: !isG ? basePrice * 1.5 : null,
                hardSleeper: !isG ? basePrice * 1.2 : null
            }
        };
    });

    res.json({
      code: 200,
      message: 'Success',
      data: results
    });
  });
});

module.exports = router;
