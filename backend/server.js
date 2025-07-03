// backend/server.js

require("dotenv").config();
const express = require("express");
const cors = require("cors");
const SpotifyWebApi = require("spotify-web-api-node");

const app = express();
app.use(cors());
app.use(express.json());

// Endpoint pour rafraîchir le token Spotify
app.post("/refresh", async (req, res) => {
  const { refresh_token } = req.body;

  if (!refresh_token) {
    return res.status(400).json({ error: "Missing refresh_token" });
  }

  const spotifyApi = new SpotifyWebApi({
    clientId: process.env.SPOTIFY_CLIENT_ID,
    clientSecret: process.env.SPOTIFY_CLIENT_SECRET,
    redirectUri: process.env.BACKEND_PUBLIC_URL, // optionnel, pas utilisé ici mais bon à garder
  });

  spotifyApi.setRefreshToken(refresh_token);

  try {
    const data = await spotifyApi.refreshAccessToken();
    res.json({
      access_token: data.body.access_token,
      expires_in: data.body.expires_in,
      refresh_token: data.body.refresh_token || refresh_token, // parfois non renvoyé
    });
  } catch (error) {
    console.error("Erreur lors du refresh Spotify :", error.body || error);
    res.status(500).json({ error: "Failed to refresh token", details: error.body || error });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Serveur refresh Spotify démarré sur le port ${PORT}`);
});