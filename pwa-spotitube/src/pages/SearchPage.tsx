import React, { useState } from "react";
import { useSpotifyToken } from "../contexts/SpotifyTokenContext";

type Track = {
  id: string;
  name: string;
  artists: { name: string }[];
  album: { images: { url: string }[] };
};

export default function SearchPage() {
  const { accessToken } = useSpotifyToken();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Track[]>([]);
  const [loading, setLoading] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query || !accessToken) return;
    setLoading(true);
    setResults([]);
    try {
      const res = await fetch(
        `https://api.spotify.com/v1/search?q=${encodeURIComponent(query)}&type=track&limit=10`,
        { headers: { Authorization: `Bearer ${accessToken}` } }
      );
      const data = await res.json();
      setResults(data.tracks?.items || []);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 600, margin: "40px auto" }}>
      <h2>Recherche Spotify</h2>
      <form onSubmit={handleSearch} style={{ display: "flex", gap: 12, marginBottom: 24 }}>
        <input
          type="text"
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder="Titre, artiste…"
          style={{ flex: 1, padding: 12, borderRadius: 8, border: "1px solid #ccc" }}
        />
        <button type="submit" style={{
          background: "#1DB954", color: "#fff", border: "none", borderRadius: 8, padding: "0 20px", fontWeight: 600
        }}>
          Chercher
        </button>
      </form>
      {loading && <div>Chargement…</div>}
      <ul style={{ listStyle: "none", padding: 0 }}>
        {results.map(track => (
          <li key={track.id} style={{
            background: "#191414", color: "#fff", borderRadius: 8, padding: 16, marginBottom: 12, display: "flex", alignItems: "center", gap: 16
          }}>
            {track.album.images[0]?.url && (
              <img src={track.album.images[0].url} alt={track.name} style={{ width: 48, height: 48, borderRadius: 8, objectFit: "cover" }} />
            )}
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 600 }}>{track.name}</div>
              <div style={{ color: "#b3b3b3", fontSize: 14 }}>{track.artists.map(a => a.name).join(", ")}</div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}