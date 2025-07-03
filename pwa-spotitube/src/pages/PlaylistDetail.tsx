import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useSpotifyToken } from "../contexts/SpotifyTokenContext";
import { searchYouTube } from "../services/youtubeApi";
import YouTubePlayer from "../components/YouTubePlayer";
import { usePlayer } from "../contexts/PlayerContext";

type Track = {
  id: string;
  name: string;
  artists: { name: string; id: string }[];
  album: { name: string; images: { url: string }[] };
};

export default function PlaylistDetail() {
  const { id } = useParams<{ id: string }>();
  const accessToken = useSpotifyToken();
  const [playlistName, setPlaylistName] = useState("");
  const [playlistImage, setPlaylistImage] = useState<string | null>(null);
  const [tracks, setTracks] = useState<Track[]>([]);
  const [loading, setLoading] = useState(true);
  const [youtubeVideoId, setYoutubeVideoId] = useState<string | null>(null);

  useEffect(() => {
    if (!accessToken || !id) return;
    setLoading(true);
    fetch(`https://api.spotify.com/v1/playlists/${id}`, {
      headers: { Authorization: `Bearer ${accessToken}` }
    })
      .then(res => res.json())
      .then(data => {
        setPlaylistName(data.name);
        setPlaylistImage(data.images?.[0]?.url || null);
        setTracks(data.tracks.items.map((item: any) => item.track));
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [accessToken, id]);

  const handlePlay = async (track: Track) => {
    setYoutubeVideoId(null);
    const ytResults = await searchYouTube(
      `${track.artists.map(a => a.name).join(" ")} ${track.name} official audio`
    );
    if (ytResults.length > 0) {
      setYoutubeVideoId(ytResults[0].youtubeId);
    } else {
      setYoutubeVideoId(null);
      alert("Aucune vidéo YouTube trouvée pour ce morceau.");
    }
  };

  if (loading) return <div>Chargement…</div>;

  return (
    <div style={{ maxWidth: 700, margin: "40px auto" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 24, marginBottom: 32 }}>
        {playlistImage && (
          <img src={playlistImage} alt={playlistName} style={{ width: 80, height: 80, borderRadius: 12, objectFit: "cover" }} />
        )}
        <h2>{playlistName}</h2>
      </div>
      <ul style={{ listStyle: "none", padding: 0 }}>
        {tracks.map(track => (
          <li key={track.id} style={{
            background: "#191414", color: "#fff", borderRadius: 8, padding: 16, marginBottom: 12, display: "flex", alignItems: "center", gap: 16
          }}>
            {track.album.images?.[0]?.url && (
              <img src={track.album.images[0].url} alt={track.name} style={{ width: 48, height: 48, borderRadius: 8, objectFit: "cover" }} />
            )}
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 600 }}>{track.name}</div>
              <div style={{ color: "#b3b3b3", fontSize: 14 }}>
                {track.artists.map((artist, idx) => (
                  <span key={artist.id}>
                    {artist.name}
                    {idx < track.artists.length - 1 ? ", " : ""}
                  </span>
                ))}
              </div>
              <div style={{ color: "#b3b3b3", fontSize: 13 }}>{track.album.name}</div>
            </div>
            <button
              onClick={() => handlePlay(track)}
              style={{
                background: "#FF0000", color: "#fff", border: "none", borderRadius: 16,
                padding: "8px 16px", fontWeight: 600, marginRight: 8, cursor: "pointer"
              }}
            >
              Lire sur YouTube
            </button>
          </li>
        ))}
      </ul>
      {youtubeVideoId && (
        <div style={{ textAlign: "center", margin: "20px 0" }}>
          <YouTubePlayer videoId={youtubeVideoId} />
        </div>
      )}
    </div>
  );
}
