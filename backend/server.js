require('dotenv').config();
const express = require('express');
const cors = require('cors');
const SpotifyWebApi = require('spotify-web-api-node');

const app = express();
app.use(cors());
app.use(express.json());

const spotifyApi = new SpotifyWebApi({
  clientId: process.env.SPOTIFY_CLIENT_ID,
  clientSecret: process.env.SPOTIFY_CLIENT_SECRET,
});

// Endpoint pour rafraîchir le token
app.post('/refresh', async (req, res) => {
  const { refresh_token } = req.body;
  if (!refresh_token) {
    return res.status(400).json({ error: 'refresh_token is required' });
  }

  spotifyApi.setRefreshToken(refresh_token);

  try {
    const data = await spotifyApi.refreshAccessToken();
    console.log('Le token d’accès a été rafraîchi:', data.body);

    res.json({
      access_token: data.body.access_token,
      expires_in: data.body.expires_in,
      refresh_token: data.body.refresh_token || refresh_token, // parfois non renvoyé
    });
  } catch (error) {
    console.error('Erreur lors du rafraîchissement du token:', error);
    res.status(500).json({ error: 'Failed to refresh token' });
  }
});

// Démarrer le serveur
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Serveur de refresh token Spotify démarré sur le port ${PORT}`);
});