const express = require("express");
const cors = require("cors");
const app = express();
require('dotenv').config();
const PORT = process.env.BACKEND_PORT || 8080;
const database = require("./database");
const path = require("path");
const grpc = require("@grpc/grpc-js");
const protoLoader = require("@grpc/proto-loader");

app.use(cors());
app.use(express.json());

let count = 0;

// Load gRPC plugin proto file
const PROTO_PATH = path.resolve(__dirname, "./plugins/plugin.proto");
const packageDefinition = protoLoader.loadSync(PROTO_PATH, {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true,
});
const pluginProto = grpc.loadPackageDefinition(packageDefinition).plugin;

// Create a gRPC client for the PluginService
const client = new pluginProto.PluginService(
  "plugin:50001",
  grpc.credentials.createInsecure()
);

//load the count
database.get("SELECT count FROM clicks ORDER BY id DESC LIMIT 1", (err, row) => {
  if (err) {
    console.error("[Database Error] Could not retrieve count:", err);
    count = 0; // Default to 0 if there's an error
  } else {
    count = row ? row.count : 0; // Use the retrieved count or default to 0
    console.log(`Loaded count from database: ${count}`);
  }
});

// Endpoint to get the current count
app.get("/api/count", (req, res) => {
  database.get("SELECT count FROM clicks ORDER BY id DESC LIMIT 1", (err, row) => {
    if (err) {
      console.error("[Database Error] Could not retrieve count:", err);
      return res.status(500).json({ message: "Error retrieving count" });
    }

    res.json({ count: row ? row.count : 0 });
  });
});

// Standard increase endpoint (increments by 1)
app.post("/api/increase", (req, res) => {
  count += 1;
  const timestamp = new Date().toISOString();

  database.run(
    "INSERT INTO clicks (count, timestamp) VALUES (?, ?)",
    [count, timestamp],
    (error) => {
      if (error) {
        console.error("[Database Error] Error saving click:", error);
        return res.status(500).json({ message: "Error saving click to database" });
      }

      res.json({ count, timestamp });
    }
  );
});

// gRPC Plugin increase endpoint
app.post("/api/increase-plugin", (req, res) => {
  const request = {
    count: count,
    multiplier: 5, // Multiplier used by the plugin
  };

  // Call the gRPC MultiplyClick method
  client.MultiplyClick(request, (error, response) => {
    if (error) {
      console.error("[gRPC Error]", error);
      return res.status(500).json({ message: "gRPC call failed" });
    }

    count = response.newCount;
    const timestamp = new Date().toISOString();

    // Save the click to the database
    database.run(
      `INSERT INTO clicks (timestamp) VALUES (?)`,
      [timestamp],
      (dbError) => {
        if (dbError) {
          console.error("[Database Error]", dbError);
          return res
            .status(500)
            .json({ message: "Error saving click to database" });
        }

        res.json({ count, timestamp });
      }
    );
  });
});

// Decrease the count
app.post("/api/decrease", (req, res) => {
  count = Math.max(0, count - 1);
  const timestamp = new Date().toISOString();

  database.run(
    "INSERT INTO clicks (count, timestamp) VALUES (?, ?)",
    [count, timestamp],
    (error) => {
      if (error) {
        console.error("[Database Error] Error saving click:", error);
        return res.status(500).json({ message: "Error saving click to database" });
      }

      res.json({ count, timestamp });
    }
  );
});

// Dashboard endpoint to display click history
app.get("/dashboard", (req, res) => {
  database.all("SELECT * FROM clicks ORDER BY id DESC", (err, rows) => {
    if (err) {
      return res.status(500).send("<h1>Error fetching click history</h1>");
    }

    let htmlContent = `
      <html>
        <head>
          <title>Click History</title>
          <style>
            body { font-family: Arial, sans-serif; }
            table { width: 100%; border-collapse: collapse; }
            th, td { padding: 8px; text-align: left; border-bottom: 1px solid #ddd; }
          </style>
        </head>
        <body>
          <h1>Click History</h1>
          <table>
            <tr>
              <th>ID</th>
              <th>Count</th>
              <th>Timestamp</th>
            </tr>
    `;

    if (rows.length === 0) {
      htmlContent += `
        <tr>
          <td colspan="3" style="text-align: center;">No click history available.</td>
        </tr>
      `;
    } else {
      rows.forEach((row) => {
        htmlContent += `
          <tr>
            <td>${row.id}</td>
            <td>${row.count}</td>
            <td>${new Date(row.timestamp).toLocaleString()}</td>
          </tr>
        `;
      });
    }

    htmlContent += `
          </table>
        </body>
      </html>
    `;

    res.send(htmlContent);
  });
});
app.listen(PORT, () => {
  console.log(`Backend server is running on http://localhost:${PORT}`);
});