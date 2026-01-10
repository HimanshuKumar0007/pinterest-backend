const express = require('express');
const axios = require('axios');
const cors = require('cors');

const app = express();
app.use(cors());

app.get('/', (req, res) => {
  res.send('Pinterest Backend is running 🚀');
});

app.get('/download', async (req, res) => {
  const url = req.query.url;

  if (!url) {
    return res.json({ error: 'Pinterest URL required' });
  }

  try {
    const response = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0',
        'Accept-Language': 'en-US,en;q=0.9'
      }
    });

    const html = response.data;

    // Try multiple patterns:
    // 1. direct v1 pinimg mp4
    const mp4Urls1 = html.match(/https:\/\/v1\.pinimg\.com\/videos\/.*?\.mp4/g);

    // 2. fallback: look for other mp4 links in the JSON structures
    const mp4Urls2 = html.match(/https?:\/\/.*?\.mp4/g);

    // Combine results (avoid duplicates)
    const allMp4s = [
      ...(mp4Urls1 || []),
      ...(mp4Urls2 || [])
    ].filter((v,i,a) => a.indexOf(v) === i);

    if (!allMp4s.length) {
      return res.json({ error: 'No downloadable video found' });
    }

    // Heuristic: prefer v1.pinimg.com links (highest quality)
    const preferred = allMp4s.filter(url => url.includes("v1.pinimg.com"));
    const videoUrl = preferred.length ? preferred[preferred.length - 1] : allMp4s[allMp4s.length - 1];

    res.json({ video: videoUrl });

  } catch (err) {
    console.error(err);
    res.json({ error: 'Failed to fetch video' });
  }
});
