const express = require('express');
const router = express.Router();
const db = require('../database/init_db');

// Get Train Details by ID
router.get('/:id', (req, res) => {
  const { id } = req.params;
  const sql = `
    SELECT 
      t.id, t.train_number, t.type
    FROM trains t
    WHERE t.id = ?
  `;
  
  db.get(sql, [id], (err, train) => {
    if (err) {
      return res.status(500).json({ code: 500, message: 'Database error', error: err.message });
    }
    if (!train) {
      return res.status(404).json({ code: 404, message: 'Train not found' });
    }

    // Get Stations (Start/End) - simplified logic for MVP
    // We might want to know from/to station based on the search context, but if we just show train info:
    // We can fetch the schedule for this train.
    const scheduleSql = `
      SELECT 
        s.name as station_name,
        m.arrival_time,
        m.departure_time,
        m.stop_order,
        m.station_id
      FROM train_station_mapping m
      JOIN stations s ON m.station_id = s.id
      WHERE m.train_id = ?
      ORDER BY m.stop_order
    `;

    db.all(scheduleSql, [id], (err, stops) => {
        if (err) {
            return res.status(500).json({ code: 500, message: 'Database error', error: err.message });
        }
        
        // Enhance train object with stops or just start/end
        train.stops = stops;
        // Determine start and end from stops
        if (stops.length > 0) {
            train.start_station = stops[0].station_name;
            train.end_station = stops[stops.length - 1].station_name;
            train.start_time = stops[0].departure_time;
            train.end_time = stops[stops.length - 1].arrival_time;
        }

        res.json({
            code: 200,
            message: 'Success',
            data: train
        });
    });
  });
});

module.exports = router;
