const express = require("express");
const axios = require("axios");
const cors = require("cors");

const app = express();
app.use(cors());

// 🔹 Health check (VERY IMPORTANT for Render)
app.get("/", (req, res) => {
  res.status(200).send("Pinterest Backend is running 🚀");
});

app.get("/download", async (req, res) => {
  const pinUrl = req.query.url;

  if (!pinUrl) {
    return res.status(400).json({ error: "Pinterest URL required" });
  }

  try {
    const response = await axios({
      method: "GET",
      url: pinUrl,
      maxRedirects: 5,
      timeout: 15000,
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
        "Accept-Language": "en-US,en;q=0.9",
      },
      validateStatus: () => true // 🔑 prevents crash
    });

    if (!response.data || typeof response.data !== "string") {
      return res.json({ error: "Invalid Pinterest response" });
    }

    const html = response.data;

    const matches = html.match(/https:\/\/v\.pinimg\.com\/[^"]+\.mp4/g);

    if (!matches || matches.length === 0) {
      return res.json({
        error: "No public MP4 found (Pinterest may use protected stream)"
      });
    }

    const unique = [...new Set(matches)];

    const best =
      unique.find(v => v.includes("720p")) ||
      unique.find(v => v.includes("540p")) ||
      unique[0];

    return res.json({
      success: true,
      video: best,
      all: unique
    });

  } catch (err) {
    console.error("DOWNLOAD ERROR:", err.message);
    return res.status(500).json({ error: "Internal server error" });
  }
});

// 🔹 CRITICAL FOR RENDER
const PORT = process.env.PORT;
if (!PORT) {
  console.error("PORT not defined");
}

app.listen(PORT, "0.0.0.0", () => {
  console.log("Server running on port", PORT);
});
