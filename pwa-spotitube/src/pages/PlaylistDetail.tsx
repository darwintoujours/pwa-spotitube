import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "../supabaseClient";
import { usePlayer } from "../contexts/PlayerContext";

type Track = {
  id: string;
  name: string;
  artists: { name: string; id: string }[];
  album: { name: string; images: { url: string }[] };
};

export default function PlaylistDetail() {
  const { id } = useParams<{ id: string }>();
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const { setQueue } = usePlayer();

  const [playlistName, setPlaylistName] = useState("");
  const [playlistImage, setPlaylistImage] = useState<string | null>(null);
  const [tracks, setTracks] = useState<Track[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const getToken = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        setAccessToken(session?.provider_token || null);
      } catch (error) {
        setAccessToken(null);
      }
    };
    getToken();
  }, []);

  useEffect(() => {
    if (!accessToken || !id) {
      setLoading(false);
      setError("Token Spotify ou ID de playlist manquant.");
      return;
    }
    setLoading(true);
    setError(null);

    fetch(`https://api.spotify.com/v1/playlists/${id}`, {
      headers: { Authorization: `Bearer ${accessToken}` }
    })
      .then(res => {
        if (!res.ok) throw new Error(`Erreur API Spotify : ${res.status} ${res.statusText}`);
        return res.json();
      })
      .then(data => {
        setPlaylistName(data.name);
        setPlaylistImage(data.images?.[0]?.url || null);
        setTracks(data.tracks.items.map((item: any) => item.track));
        setLoading(false);
      })
      .catch(err => {
        setError(err.message || "Erreur lors de la récupération de la playlist.");
        setLoading(false);
      });
  }, [accessToken, id]);

  // Lance la playlist entière dans le player global
  const handlePlayAll = () => {
    const formattedTracks = tracks.map(track => ({
      id: track.id,
      title: track.name,
      artist: track.artists.map(a => a.name).join(", "),
      albumArt: track.album.images?.[0]?.url,
      source: "spotify" as const // <--- TypeScript attend "spotify" | "youtube"
    }));
    setQueue(formattedTracks, 0);
  };

  // Lance un morceau précis dans le player global
  const handlePlayTrack = (track: Track, index: number) => {
    const formattedTracks = tracks.map(t => ({
      id: t.id,
      title: t.name,
      artist: t.artists.map(a => a.name).join(", "),
      albumArt: t.album.images?.[0]?.url,
      source: "spotify" as const
    }));
    setQueue(formattedTracks, index);
  };

  if (loading) return <div>Chargement...</div>;
  if (error) return <div style={{ color: "red" }}>{error}</div>;

  return (
    <div style={{ maxWidth: 700, margin: "40px auto" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 24, marginBottom: 32 }}>
        {playlistImage && (
          <img src={playlistImage} alt={playlistName} style={{ width: 80, height: 80, borderRadius: 12, objectFit: "cover" }} />
        )}
        <h2>{playlistName}</h2>
        <button
          onClick={handlePlayAll}
          style={{
            background: "#1DB954",
            color: "#fff",
            border: "none",
            borderRadius: 16,
            padding: "10px 28px",
            fontWeight: 700,
            fontSize: 18,
            marginLeft: 24,
            cursor: "pointer"
          }}
        >
          ▶️ Tout lire
        </button>
      </div>
      <ul style={{ listStyle: "none", padding: 0 }}>
        {tracks.map((track, idx) => (
          <li
            key={track.id}
            style={{
              background: "#191414",
              color: "#fff",
              borderRadius: 8,
              padding: 16,
              marginBottom: 12,
              display: "flex",
              alignItems: "center",
              gap: 16
            }}
          >
            {track.album.images?.[0]?.url && (
              <img src={track.album.images[0].url} alt={track.name} style={{ width: 48, height: 48, borderRadius: 8, objectFit: "cover" }} />
            )}
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 600 }}>{track.name}</div>
              <div style={{ color: "#b3b3b3", fontSize: 14 }}>
                {track.artists.map((artist, i) => (
                  <span key={artist.id}>
                    <a
                      href={`https://open.spotify.com/artist/${artist.id}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ color: "#1DB954", textDecoration: "underline", marginRight: 4 }}
                    >
                      {artist.name}
                    </a>
                    {i < track.artists.length - 1 ? ", " : ""}
                  </span>
                ))}
              </div>
              <div style={{ color: "#b3b3b3", fontSize: 13 }}>{track.album.name}</div>
            </div>
            <button
              onClick={() => handlePlayTrack(track, idx)}
              style={{
                background: "#FF0000",
                color: "#fff",
                border: "none",
                borderRadius: 16,
                padding: "8px 16px",
                fontWeight: 600,
                marginRight: 8,
                cursor: "pointer"
              }}
            >
              ▶️ Lire
            </button>
          </li>
        ))}
      </ul>
      {tracks.length === 0 && <div style={{ color: "#b3b3b3", marginTop: 24 }}>Aucun morceau dans cette playlist.</div>}
    </div>
  );
}