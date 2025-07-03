import React, { useState } from "react";
import { useSpotifyToken } from "../contexts/SpotifyTokenContext";
import { searchSpotify } from "../services/spotifyApi";
import { searchYouTube } from "../services/youtubeApi";
import YouTubePlayer from "../components/YouTubePlayer";
import SearchBar from "../components/SearchBar";

type Artist = { name: string; id: string; url: string };
type Album = { name: string; id: string; url: string };
type Track = {
  id: string;
  title: string;
  artists: Artist[];
  album: Album;
  albumArt: string;
  source: "spotify";
  spotifyUrl?: string;
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
  const { accessToken } = useSpotifyToken();
  const [tracks, setTracks] = useState<Track[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedTrack, setSelectedTrack] = useState<Track | null>(null);
  const [youtubeVideoId, setYoutubeVideoId] = useState<string | null>(null);
  const [isLoadingYoutube, setIsLoadingYoutube] = useState(false);

  const handleSearch = async (query: string) => {
    setLoading(true);
    setError(null);
    setTracks([]);
    setSelectedTrack(null);
    setYoutubeVideoId(null);
    try {
      if (!accessToken) throw new Error("Token Spotify manquant ou expiré.");
      const spotifyResults = await searchSpotify(query, accessToken);
      setTracks(removeDuplicates(spotifyResults.tracks));
    } catch (err: any) {
      setError(err.message || "Erreur lors de la recherche.");
    }
    setLoading(false);
  };

  const handlePlay = async (track: Track) => {
    setSelectedTrack(track);
    setIsLoadingYoutube(true);
    setYoutubeVideoId(null);
    // Recherche YouTube pour ce morceau
    const ytResults = await searchYouTube(
      `${track.artists.map(a => a.name).join(" ")} ${track.title} official audio`
    );
    setIsLoadingYoutube(false);
    if (ytResults.length > 0) {
      setYoutubeVideoId(ytResults[0].youtubeId);
    } else {
      setYoutubeVideoId(null);
      alert("Aucune vidéo YouTube trouvée pour ce morceau.");
    }
  };

  return (
    <div style={{ maxWidth: 800, margin: "40px auto" }}>
      <h2>Recherche musicale</h2>
      <SearchBar onSearch={handleSearch} />
      {loading && <div>Chargement…</div>}
      {error && <div style={{ color: "red", marginBottom: 16 }}>{error}</div>}
      <ul style={{ listStyle: "none", padding: 0 }}>
        {tracks.map(track => (
          <li
            key={track.id}
            style={{
              background: "#191414", color: "#fff", borderRadius: 8, padding: 16, marginBottom: 10,
              display: "flex", alignItems: "center", gap: 16, cursor: "pointer"
            }}
            onClick={() => handlePlay(track)}
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
              onClick={e => { e.stopPropagation(); handlePlay(track); }}
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
      {isLoadingYoutube && (
        <div style={{ textAlign: "center", margin: "20px 0", color: "#1DB954" }}>
          Chargement de la vidéo YouTube...
        </div>
      )}
      {youtubeVideoId && !isLoadingYoutube && (
        <div style={{ textAlign: "center", margin: "20px 0" }}>
          <YouTubePlayer videoId={youtubeVideoId} />
        </div>
      )}
    </div>
  );
}