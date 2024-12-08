const sqlite3 = require("sqlite3").verbose();
const path = require("path");

const database = new sqlite3.Database(path.join(__dirname, "clicks.db"));

database.serialize(() => {
  // Create `clicks` table to store both count and timestamps
  database.run(`
    CREATE TABLE IF NOT EXISTS clicks (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      count INTEGER NOT NULL,
      timestamp TEXT NOT NULL
    )`
  );

  // Initialize the table with the first row if empty
  database.get("SELECT COUNT(*) AS count FROM clicks", (err, row) => {
    if (err) {
      console.error("[Database Error] Could not initialize clicks table:", err);
    } else if (row.count === 0) {
      console.log("Clicks table is empty. Initializing with default values...");
      const initialTimestamp = new Date().toISOString();
      database.run(
        "INSERT INTO clicks (count, timestamp) VALUES (?, ?)",
        [0, initialTimestamp],
        (error) => {
          if (error) {
            console.error("[Database Error] Error inserting initial row:", error);
          } else {
            console.log("Clicks table initialized successfully.");
          }
        }
      );
    } else {
      console.log("Clicks table already initialized.");
    }
  });
});

module.exports = database;