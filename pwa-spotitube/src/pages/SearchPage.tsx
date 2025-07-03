import React, { useState } from "react";
import { useSpotifyToken } from "../contexts/SpotifyTokenContext";
import axios from "axios";

const YOUTUBE_API_KEY = process.env.REACT_APP_YOUTUBE_API_KEY;

export default function SearchPage() {
  const { accessToken } = useSpotifyToken();
  const [query, setQuery] = useState("");
  const [spotifyResults, setSpotifyResults] = useState<any[]>([]);
  const [youtubeResults, setYoutubeResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!query) return;
    setLoading(true);

    // Recherche Spotify
    let spotifyTracks: any[] = [];
    if (accessToken) {
      try {
        const res = await fetch(
          `https://api.spotify.com/v1/search?q=${encodeURIComponent(query)}&type=track&limit=8`,
          { headers: { Authorization: `Bearer ${accessToken}` } }
        );
        const data = await res.json();
        if (data.error) throw new Error(data.error.message);
        spotifyTracks = data.tracks?.items || [];
      } catch (err: any) {
        setError("Erreur Spotify : " + (err.message || "Inconnue"));
      }
    } else {
      setError("Token Spotify manquant ou expiré.");
    }

    // Recherche YouTube
    let youtubeTracks: any[] = [];
    if (YOUTUBE_API_KEY) {
      try {
        const res = await axios.get<{ items: any[] }>(
          `https://www.googleapis.com/youtube/v3/search?part=snippet&type=video&maxResults=8&q=${encodeURIComponent(query)}&key=${YOUTUBE_API_KEY}`
        );
        youtubeTracks = res.data.items;
      } catch (err: any) {
        setError("Erreur YouTube : " + (err.message || "Inconnue"));
      }
    } else {
      setError("Clé API YouTube manquante.");
    }

    setSpotifyResults(spotifyTracks);
    setYoutubeResults(youtubeTracks);
    setLoading(false);
  };

  return (
    <div style={{ maxWidth: 900, margin: "40px auto" }}>
      <h2>Recherche musicale</h2>
      <form onSubmit={handleSearch} style={{ display: "flex", gap: 12, marginBottom: 24 }}>
        <input
          type="text"
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder="Titre, artiste, album…"
          style={{ flex: 1, padding: 12, borderRadius: 8, border: "1px solid #ccc" }}
        />
        <button type="submit" style={{
          background: "#1DB954", color: "#fff", border: "none", borderRadius: 8, padding: "0 20px", fontWeight: 600
        }}>
          Chercher
        </button>
      </form>
      {loading && <div>Chargement…</div>}
      {error && <div style={{ color: "red", marginBottom: 16 }}>{error}</div>}
      <div style={{ display: "flex", gap: 32 }}>
        {/* Résultats Spotify */}
        <div style={{ flex: 1 }}>
          <h3>Spotify</h3>
          <ul style={{ listStyle: "none", padding: 0 }}>
            {spotifyResults.map(track => (
              <li key={track.id} style={{
                background: "#191414", color: "#fff", borderRadius: 8, padding: 12, marginBottom: 10, display: "flex", alignItems: "center", gap: 10
              }}>
                {track.album?.images?.[0]?.url && (
                  <img src={track.album.images[0].url} alt={track.name} style={{ width: 40, height: 40, borderRadius: 6 }} />
                )}
                <div>
                  <div style={{ fontWeight: 600 }}>{track.name}</div>
                  <div style={{ color: "#b3b3b3", fontSize: 13 }}>{track.artists.map((a: any) => a.name).join(", ")}</div>
                </div>
                {/* Prépare ici un bouton "Ajouter à playlist" */}
              </li>
            ))}
          </ul>
        </div>
        {/* Résultats YouTube */}
        <div style={{ flex: 1 }}>
          <h3>YouTube</h3>
          <ul style={{ listStyle: "none", padding: 0 }}>
            {youtubeResults.map(video => (
              <li key={video.id.videoId} style={{
                background: "#222", color: "#fff", borderRadius: 8, padding: 12, marginBottom: 10, display: "flex", alignItems: "center", gap: 10
              }}>
                <img src={video.snippet.thumbnails.default.url} alt={video.snippet.title} style={{ width: 40, height: 40, borderRadius: 6 }} />
                <div>
                  <div style={{ fontWeight: 600 }}>{video.snippet.title}</div>
                  <div style={{ color: "#b3b3b3", fontSize: 13 }}>{video.snippet.channelTitle}</div>
                </div>
                {/* Prépare ici un bouton "Ajouter à playlist" */}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
