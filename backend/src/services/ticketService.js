const db = require('../database/init_db');

const ticketService = {
  search: async (from, to, date) => {
    return new Promise((resolve, reject) => {
      // Use LIKE for fuzzy matching (e.g. '北京' matches '北京南')
      const sql = `
        SELECT 
          t.code, 
          t.type,
          r_from.departure_time,
          r_to.arrival_time,
          r_from.station_name as from_station,
          r_to.station_name as to_station
        FROM trains t
        JOIN routes r_from ON t.id = r_from.train_id
        JOIN routes r_to ON t.id = r_to.train_id
        WHERE r_from.station_name LIKE ? 
          AND r_to.station_name LIKE ?
          AND r_from.stop_order < r_to.stop_order
      `;

      const fromPattern = `%${from}%`;
      const toPattern = `%${to}%`;

      console.log(`[TicketService] Searching from ${from} (${fromPattern}) to ${to} (${toPattern})`);

      db.all(sql, [fromPattern, toPattern], (err, rows) => {
        if (err) {
          console.error('[TicketService] Error:', err);
          reject(err);
        } else {
          console.log(`[TicketService] Found ${rows.length} tickets`);
          // Calculate duration (simplified)
          const results = rows.map(row => {
            // Simple duration calc assuming same day for now or just return string
            // For now, just pass data.
            return {
              ...row,
              duration: calculateDuration(row.departure_time, row.arrival_time)
            };
          });
          resolve({ code: 200, data: results });
        }
      });
    });
  }
};

function calculateDuration(start, end) {
  if (!start || !end) return '--';
  const [h1, m1] = start.split(':').map(Number);
  const [h2, m2] = end.split(':').map(Number);
  let minutes = (h2 * 60 + m2) - (h1 * 60 + m1);
  if (minutes < 0) minutes += 24 * 60; // Next day assumption
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
}

module.exports = ticketService;
