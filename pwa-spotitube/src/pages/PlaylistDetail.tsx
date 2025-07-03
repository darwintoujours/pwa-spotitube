import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useSpotifyToken } from "../contexts/SpotifyTokenContext";

type Track = {
  id: string;
  name: string;
  artists: { name: string }[];
  album: { images: { url: string }[] };
};

export default function PlaylistDetail() {
  const { id } = useParams<{ id: string }>();
  const { accessToken } = useSpotifyToken();
  const [tracks, setTracks] = useState<Track[]>([]);
  const [playlistName, setPlaylistName] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!accessToken || !id) return;
    setLoading(true);
    fetch(`https://api.spotify.com/v1/playlists/${id}`, {
      headers: { Authorization: `Bearer ${accessToken}` }
    })
      .then(res => res.json())
      .then(data => {
        setPlaylistName(data.name);
        setTracks(data.tracks.items.map((item: any) => item.track));
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [accessToken, id]);

  return (
    <div style={{ maxWidth: 700, margin: "40px auto" }}>
      <h2>{playlistName}</h2>
      {loading && <div>Chargement…</div>}
      <ul style={{ listStyle: "none", padding: 0 }}>
        {tracks.map(track => (
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