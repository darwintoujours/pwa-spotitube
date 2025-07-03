import React, { useState } from "react";
import { usePlayer } from "../contexts/PlayerContext";
import { searchSpotify } from "../services/spotifyApi";
import { useSpotifyToken } from "../contexts/SpotifyTokenContext";

type Artist = { name: string; id: string; url: string };
type Album = { name: string; id: string; url: string };
type Track = {
  id: string;
  title: string;
  artists: Artist[];
  album: Album;
  albumArt: string;
  source: "spotify" | "youtube";
  sourceid?: string;
};

function removeDuplicates(tracks: Track[]): Track[] {
  const seen = new Set();
  return tracks.filter(track => {
    const key = track.title + track.artists.map(a => a.name).join(",").toLowerCase();
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

export default function SearchPage() {
  const { setQueue } = usePlayer();
  const { accessToken } = useSpotifyToken();
  const [tracks, setTracks] = useState<Track[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setTracks([]);
    try {
      const form = e.currentTarget as HTMLFormElement;
      const input = form.elements.namedItem("search") as HTMLInputElement;
      const query = input.value;
      if (!accessToken) throw new Error("Token Spotify manquant ou expiré.");
      const { tracks } = await searchSpotify(query, accessToken);
      setTracks(removeDuplicates(tracks));
    } catch (err: any) {
      setError(err.message || "Erreur lors de la recherche.");
    }
    setLoading(false);
  };

  const handlePlay = (track: Track) => {
    // Transforme le track pour correspondre au type PlayerContext.Track
    setQueue([{
      ...track,
      artist: track.artists.map(a => a.name).join(", ")
    }]);
  };

  return (
    <div style={{ maxWidth: 800, margin: "40px auto" }}>
      <h2>Recherche musicale</h2>
      <form onSubmit={handleSearch} style={{ display: "flex", gap: 12, marginBottom: 24 }}>
        <input
          name="search"
          type="text"
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
      <ul style={{ listStyle: "none", padding: 0 }}>
        {tracks.map(track => (
          <li
            key={track.id}
            style={{
              background: "#191414", color: "#fff", borderRadius: 8, padding: 16, marginBottom: 10,
              display: "flex", alignItems: "center", gap: 16
            }}
          >
            {track.albumArt && (
              <img src={track.albumArt} alt={track.title} style={{ width: 56, height: 56, borderRadius: 8, objectFit: "cover" }} />
            )}
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 600 }}>{track.title}</div>
              <div style={{ color: "#b3b3b3", fontSize: 14 }}>
                {track.artists.map((artist, idx) => (
                  <span key={artist.id}>
                    <a
                      href={artist.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ color: "#1DB954", textDecoration: "underline", marginRight: 4 }}
                    >
                      {artist.name}
                    </a>
                    {idx < track.artists.length - 1 ? ", " : ""}
                  </span>
                ))}
              </div>
              <div style={{ color: "#b3b3b3", fontSize: 13, marginTop: 4 }}>
                Album : <a href={track.album.url} target="_blank" rel="noopener noreferrer" style={{
                  color: "#1DB954", textDecoration: "underline"
                }}>{track.album.name}</a>
              </div>
            </div>
            <button
              onClick={() => handlePlay(track)}
              style={{
                background: "#FF0000", color: "#fff", border: "none", borderRadius: 16,
                padding: "8px 16px", fontWeight: 600, marginLeft: 8, cursor: "pointer"
              }}
            >
              Lire sur YouTube
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}