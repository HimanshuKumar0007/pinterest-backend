const express = require("express");
const axios = require("axios");
const cors = require("cors");

const app = express();
app.use(cors());

app.get("/", (req, res) => {
  res.send("Pinterest Backend is running 🚀");
});

app.get("/download", async (req, res) => {
  const pinUrl = req.query.url;

  if (!pinUrl) {
    return res.status(400).json({ error: "Pinterest URL required" });
  }

  try {
    const response = await axios.get(pinUrl, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
      },
    });

    const html = response.data;

    // 🔍 Extract ALL MP4 URLs
    const matches = [...html.matchAll(/https:\/\/v\.pinimg\.com\/[^"]+\.mp4/g)];

    if (!matches.length) {
      return res.json({ error: "No MP4 video found" });
    }

    // ✅ Remove duplicates
    const videos = [...new Set(matches.map(m => m[0]))];

    // 🎯 Prefer highest quality (usually 720p or 1080p)
    const preferred =
      videos.find(v => v.includes("720p")) ||
      videos.find(v => v.includes("540p")) ||
      videos[0];

    return res.json({
      success: true,
      video: preferred,
      available: videos,
    });

  } catch (err) {
    console.error(err.message);
    return res.status(500).json({ error: "Failed to fetch Pinterest video" });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, "0.0.0.0", () => {
  console.log("Server running on port", PORT);
});
