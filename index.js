const express = require('express');
const axios = require('axios');
const cors = require('cors');

const app = express();
app.use(cors());

app.get('/', (req, res) => {
  res.send('Pinterest Backend is running 🚀');
});

app.get('/download', async (req, res) => {
  try {
    let inputUrl = req.query.url;
    if (!inputUrl) {
      return res.json({ error: 'Pinterest URL required' });
    }

    // 1. Follow pin.it redirect
    const page = await axios.get(inputUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0',
        'Accept-Language': 'en-US,en;q=0.9'
      },
      maxRedirects: 5
    });

    const html = page.data;

    // 2. Extract Pinterest JSON blob
    const jsonMatch = html.match(/window\.__PWS_DATA__\s*=\s*(\{.*?\});/s);
    if (!jsonMatch) {
      return res.json({ error: 'No Pinterest data found' });
    }

    const data = JSON.parse(jsonMatch[1]);

    // 3. Walk object safely
    const pins = JSON.stringify(data);
    
    // Try MP4 first
    const mp4Match = pins.match(/https:\/\/.*?\.mp4/g);
    if (mp4Match) {
      return res.json({ video: mp4Match[0], type: 'mp4' });
    }

    // Fallback to HLS
    const m3u8Match = pins.match(/https:\/\/.*?\.m3u8/g);
    if (m3u8Match) {
      return res.json({ video: m3u8Match[0], type: 'hls' });
    }

    return res.json({ error: 'No downloadable video found' });

  } catch (err) {
    console.error(err.message);
    res.json({ error: 'Pinterest blocked request or format unsupported' });
  }
});
