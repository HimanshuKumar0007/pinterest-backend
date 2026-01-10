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
      maxRedirects: 5,
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
        'Accept-Language': 'en-US,en;q=0.9',
      },
    });

    const html = response.data;

    // ✅ Extract ONLY real MP4 video URLs
    const matches = html.match(
      /https:\/\/v1\.pinimg\.com\/videos\/.*?\.mp4/g
    );

    if (!matches || matches.length === 0) {
      return res.json({
        error: 'No downloadable MP4 found (HLS/protected pin)',
      });
    }

    // ✅ Usually highest quality = last MP4
    const videoUrl = matches[matches.length - 1];

    res.json({ video: videoUrl });
  } catch (err) {
    console.error(err.message);
    res.json({ error: 'Failed to fetch video' });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => {
  console.log('Server running on port', PORT);
});
