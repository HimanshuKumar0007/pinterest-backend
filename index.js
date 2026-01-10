const express = require("express");
const axios = require("axios");
const cors = require("cors");

const app = express();
app.use(cors());

app.get("/", (req, res) => {
  res.send("Pinterest Backend is running 🚀");
});

app.get("/download", async (req, res) => {
  let pinUrl = req.query.url;

  if (!pinUrl) {
    return res.status(400).json({ error: "Pinterest URL required" });
  }

  try {
    // 1️⃣ Follow redirects (pin.it → pinterest.com)
    const pageResponse = await axios.get(pinUrl, {
      maxRedirects: 5,
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
        "Accept-Language": "en-US,en;q=0.9",
      },
    });

    const html = pageResponse.data;

    // 2️⃣ Extract ALL mp4 links
    const matches = html.match(/https:\/\/v\.pinimg\.com\/[^"]+\.mp4/g);

    if (!matches || matches.length === 0) {
      return res.json({
        error: "No MP4 video found (Pinterest may use protected format)",
      });
    }

    // 3️⃣ Remove duplicates
    const uniqueVideos = [...new Set(matches)];

    // 4️⃣ Pick best quality
    const best =
      uniqueVideos.find(v => v.includes("720p")) ||
      uniqueVideos.find(v => v.includes("540p")) ||
      uniqueVideos[0];

    return res.json({
      success: true,
      video: best,
      all: uniqueVideos,
    });

  } catch (err) {
    console.error(err.message);
    return res.status(500).json({ error: "Failed to fetch Pinterest page" });
  }
});
