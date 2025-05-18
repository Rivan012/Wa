const express = require("express");
const path = require("path");
const { spawn } = require("child_process");

const app = express();
const PORT = 3000;

// Serve static frontend (index.html)
app.use(express.static(path.join(__dirname, "public")));

// API endpoint to start bot
app.get("/api/start-bot", (req, res) => {
  const botProcess = spawn("node", ["./bot/index.js"], {
    stdio: "inherit",
  });

  res.send("Bot sedang dijalankan di background.");
});

app.listen(PORT, () => {
  console.log(`✅ Server aktif di http://127.0.0.1:${PORT}`);
});
