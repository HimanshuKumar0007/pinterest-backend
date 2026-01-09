const express = require('express');
const axios = require('axios');
const cors = require('cors');

const app = express();
app.use(cors());

app.get('/', (req, res) => {
  res.send('Pinterest backend is running');
});

app.get('/download', async (req, res) => {
  const url = req.query.url;

  if (!url) {
    return res.json({ error: 'Pinterest URL required' });
  }

  try {
    const response = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0'
      }
    });

    const html = response.data;
    const match = html.match(/"contentUrl":"(https:\/\/.*?\.mp4.*?)"/);

    if (!match) {
      return res.json({ error: 'No video found' });
    }

    const videoUrl = match[1].replace(/\\u002F/g, '/');
    res.json({ video: videoUrl });

  } catch (err) {
    res.json({ error: 'Failed to fetch video' });
  }
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, '0.0.0.0', () => {
  console.log("Server running on port", PORT);
});
