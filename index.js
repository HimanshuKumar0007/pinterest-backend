const express = require('express');
const axios = require('axios');
const cors = require('cors');

const app = express();
app.use(cors());

app.get('/', (req, res) => {
  res.send('Pinterest Backend is running 🚀');
});

app.get('/download', async (req, res) => {
  const pinUrl = req.query.url;
  if (!pinUrl) return res.status(400).json({ error: 'Pinterest URL required' });

  try {
    const page = await axios.get(pinUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0',
        'Accept-Language': 'en-US,en;q=0.9'
      }
    });

    // Extract ALL pinimg video URLs
    const matches = page.data.match(/https:\/\/v1\.pinimg\.com\/videos\/.*?\.mp4/g);

    if (!matches || matches.length === 0) {
      return res.status(404).json({ error: 'No video found' });
    }

    // Choose highest quality (last one usually)
    const videoUrl = matches[matches.length - 1];

    // 🔥 STREAM the video instead of redirecting
    const videoStream = await axios.get(videoUrl, {
      responseType: 'stream'
    });

    res.setHeader('Content-Type', 'video/mp4');
    res.setHeader('Content-Disposition', 'attachment; filename="pinsaver.mp4"');

    videoStream.data.pipe(res);

  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Failed to download video' });
  }
});
