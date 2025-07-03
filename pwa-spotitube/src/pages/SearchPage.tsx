import React, { useEffect, useState } from "react";
import SearchBar from "../components/SearchBar";
import { searchSpotify } from "../services/spotifyApi";
import { searchYouTube } from "../services/youtubeApi";
import { getUserPlaylists } from "../services/playlistService";
import { addTrackToPlaylist } from "../services/playlistTracksService";
import { supabase } from "../supabaseClient";
import YouTubePlayer from "../components/YouTubePlayer";

// Types
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
type Playlist = { id: string; name: string };

function removeDuplicates(tracks: Track[]): Track[] {
  const seen = new Set();
  return tracks.filter((track) => {
    const key = track.title + track.artists.map((a) => a.name).join(",").toLowerCase();
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

export default function SearchPage() {
  const [results, setResults] = useState<Track[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedTrack, setSelectedTrack] = useState<Track | null>(null);
  const [youtubeVideoId, setYoutubeVideoId] = useState<string | null>(null);
  const [isLoadingYoutube, setIsLoadingYoutube] = useState(false);
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [showPlaylistSelect, setShowPlaylistSelect] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Récupère les playlists utilisateur
  useEffect(() => {
    const fetchPlaylists = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const pls = await getUserPlaylists(user.id);
        setPlaylists(pls);
      }
    };
    fetchPlaylists();
  }, []);

  // Recherche Spotify uniquement, sans doublons
  const handleSearch = async (query: string) => {
    setLoading(true);
    setError(null);
    setResults([]);
    setSelectedTrack(null);
    setYoutubeVideoId(null);
    setShowPlaylistSelect(null);
    try {
      // Récupère le token Spotify de l'utilisateur connecté
      const { data: { session } } = await supabase.auth.getSession();
      const accessToken =
        session?.provider_token ||
        session?.user?.identities?.[0]?.identity_data?.access_token;
      let spotifyResults: Track[] = [];
      if (accessToken) {
        spotifyResults = await searchSpotify(query, accessToken);
        spotifyResults = removeDuplicates(spotifyResults);
      }
      setResults(spotifyResults);
    } catch (err: any) {
      setError("Erreur lors de la recherche.");
      console.error(err);
    }
    setLoading(false);
  };

  // Quand on clique sur un morceau, cherche la meilleure vidéo YouTube et affiche le player
  const handlePlay = async (track: Track) => {
    setSelectedTrack(track);
    setIsLoadingYoutube(true);
    setYoutubeVideoId(null);
    const ytResults = await searchYouTube(
      `${track.artists.map((a) => a.name).join(" ")} ${track.title} official audio`
    );
    setIsLoadingYoutube(false);
    if (ytResults.length > 0) {
      setYoutubeVideoId(ytResults[0].youtubeId);
    } else {
      setYoutubeVideoId(null);
      alert("Aucune vidéo YouTube trouvée pour ce morceau.");
    }
  };

  // Ajout à une playlist (correction ici !)
  const handleAddToPlaylist = async (track: Track, playlistId: string) => {
    try {
      await addTrackToPlaylist({
        playlist_id: playlistId, // <-- nom exact attendu par le service
        title: track.title,
        artist: track.artists.map((a) => a.name).join(", "),
        source: "spotify",
        source_id: track.id,     // <-- nom exact attendu par le service
        album: track.album.name,
        album_art: track.albumArt,
      });
      setSuccessMsg("Morceau ajouté à la playlist !");
    } catch (err: any) {
      alert("Erreur lors de l'ajout : " + err.message);
    }
    setShowPlaylistSelect(null);
    setTimeout(() => setSuccessMsg(null), 2000);
  };

  return (
    <div style={{ maxWidth: 700, margin: "60px auto", padding: 20 }}>
      <h1>Recherche musicale</h1>
      <SearchBar onSearch={handleSearch} />
      {loading && <p>Chargement…</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}
      <div style={{ display: "grid", gap: 24 }}>
        {results.map((result) => (
          <div
            key={result.id}
            style={{
              display: "flex",
              alignItems: "center",
              background: "#191414",
              borderRadius: 12,
              padding: 16,
              gap: 16,
              position: "relative",
            }}
          >
            {result.albumArt && (
              <img
                src={result.albumArt}
                alt={result.title}
                style={{ width: 64, height: 64, borderRadius: 8, objectFit: "cover" }}
              />
            )}
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 600, color: "#fff" }}>{result.title}</div>
              <div style={{ color: "#b3b3b3", fontSize: 14 }}>
                {result.artists.map((artist, idx) => (
                  <span key={artist.id}>
                    <a
                      href={artist.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ color: "#1DB954", textDecoration: "underline", marginRight: 4 }}
                    >
                      {artist.name}
                    </a>
                    {idx < result.artists.length - 1 ? ", " : ""}
                  </span>
                ))}
              </div>
              <div style={{ color: "#b3b3b3", fontSize: 13, marginTop: 4 }}>
                Album{" "}
                <a
                  href={result.album.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ color: "#1DB954", textDecoration: "underline" }}
                >
                  {result.album.name}
                </a>
              </div>
            </div>
            <button
              onClick={() => handlePlay(result)}
              style={{
                background: "#FF0000",
                color: "#fff",
                border: "none",
                borderRadius: 16,
                padding: "8px 16px",
                fontWeight: 600,
                marginRight: 8,
                cursor: "pointer",
              }}
            >
              Lire sur YouTube
            </button>
            <button
              onClick={() => setShowPlaylistSelect(result.id)}
              style={{
                background: "#1DB954",
                color: "#fff",
                border: "none",
                borderRadius: 16,
                padding: "8px 16px",
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              Ajouter à une playlist
            </button>
            {showPlaylistSelect === result.id && (
              <div style={{
                position: "absolute",
                top: "100%",
                left: 0,
                background: "#222",
                padding: 12,
                borderRadius: 8,
                marginTop: 8,
                zIndex: 2,
              }}>
                <select
                  defaultValue=""
                  onChange={e => {
                    if (e.target.value) handleAddToPlaylist(result, e.target.value);
                  }}
                  style={{ padding: 8, borderRadius: 8 }}
                >
                  <option value="" disabled>Choisir une playlist</option>
                  {playlists.map(pl => (
                    <option key={pl.id} value={pl.id}>{pl.name}</option>
                  ))}
                </select>
              </div>
            )}
          </div>
        ))}
      </div>
      {successMsg && (
        <div style={{
          background: "#1DB954",
          color: "#fff",
          textAlign: "center",
          margin: "20px 0",
          borderRadius: 8,
          padding: 12,
        }}>
          {successMsg}
        </div>
      )}
      {isLoadingYoutube && (
        <div style={{ textAlign: "center", margin: "20px 0", color: "#1DB954" }}>
          Chargement de la vidéo YouTube…
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