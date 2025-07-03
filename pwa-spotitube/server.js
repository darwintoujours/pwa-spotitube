// server.js
const express = require('express');
const axios = require('axios');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(express.json());
app.use(cors()); // autorise les requêtes depuis ton frontend local

app.post('/refresh_token', async (req, res) => {
  const { refresh_token } = req.body;
  const client_id = process.env.SPOTIFY_CLIENT_ID;
  const client_secret = process.env.SPOTIFY_CLIENT_SECRET;

  if (!refresh_token) {
    return res.status(400).json({ error: 'Missing refresh_token' });
  }

  const params = new URLSearchParams();
  params.append('grant_type', 'refresh_token');
  params.append('refresh_token', refresh_token);

  try {
    const response = await axios.post('https://accounts.spotify.com/api/token', params.toString(), {
      headers: {
        'Authorization': 'Basic ' + Buffer.from(client_id + ':' + client_secret).toString('base64'),
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    });
    res.json({ access_token: response.data.access_token });
  } catch (error) {
    res.status(400).json({ error: 'Failed to refresh token', details: error.response?.data });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log('Server running on port', PORT));