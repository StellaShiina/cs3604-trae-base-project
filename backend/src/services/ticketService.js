const db = require('../database/init_db');

const searchTickets = (from, to, date) => {
  return new Promise((resolve, reject) => {
    // This query joins:
    // 1. trains (t)
    // 2. train_stations (s1) -> Departure station
    // 3. train_stations (s2) -> Arrival station
    // 4. daily_train_tickets (dtt) -> Seat availability
    
    // We filter by:
    // - s1.station_name = from
    // - s2.station_name = to
    // - s1.sequence_no < s2.sequence_no (ensure direction)
    // - dtt.date = date
    
    const query = `
      SELECT 
        t.train_no,
        t.train_type,
        s1.station_name as from_station,
        s2.station_name as to_station,
        s1.departure_time,
        s2.arrival_time,
        dtt.business_seat,
        dtt.first_class,
        dtt.second_class,
        dtt.hard_sleeper,
        dtt.hard_seat,
        dtt.no_seat
      FROM trains t
      JOIN train_stations s1 ON t.train_no = s1.train_no
      JOIN train_stations s2 ON t.train_no = s2.train_no
      LEFT JOIN daily_train_tickets dtt ON t.train_no = dtt.train_no AND dtt.date = ?
      WHERE s1.station_name = ?
        AND s2.station_name = ?
        AND s1.sequence_no < s2.sequence_no
      ORDER BY s1.departure_time
    `;

    db.all(query, [date, from, to], (err, rows) => {
      if (err) {
        reject(err);
        return;
      }

      // Calculate duration and format results
      const results = rows.map(row => {
        const duration = calculateDuration(row.departure_time, row.arrival_time);
        return {
          ...row,
          duration
        };
      });

      resolve(results);
    });
  });
};

// Helper to calculate duration (HH:MM) given two times strings "HH:MM"
// Assumes same day or next day if arrival < departure (simple logic)
const calculateDuration = (start, end) => {
  if (!start || !end) return '--';
  
  const [h1, m1] = start.split(':').map(Number);
  const [h2, m2] = end.split(':').map(Number);
  
  let minutes = (h2 * 60 + m2) - (h1 * 60 + m1);
  if (minutes < 0) minutes += 24 * 60; // Next day
  
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
};

module.exports = {
  searchTickets
};
