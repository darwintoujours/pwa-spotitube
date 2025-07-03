import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getTracksForPlaylist, deleteTrackFromPlaylist } from "../services/playlistTracksService";
import { getUserPlaylists } from "../services/playlistService";
import { supabase } from "../supabaseClient";
import YouTubePlayer from "../components/YouTubePlayer";
import { usePlayer } from "../contexts/PlayerContext";

type Track = {
  id: string;
  title: string;
  artist: string;
  album?: string;
  albumart?: string;
  sourceid: string;
  source: string; // "spotify" ou "youtube"
};

export default function PlaylistUserDetail() {
  const { id } = useParams<{ id: string }>();
  const [tracks, setTracks] = useState<Track[]>([]);
  const [playlistName, setPlaylistName] = useState("");
  const [loading, setLoading] = useState(true);
  const [youtubeVideoId, setYoutubeVideoId] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    setLoading(true);

    // Récupère l'utilisateur connecté puis ses playlists
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (!user) {
        setPlaylistName("Playlist");
        setLoading(false);
        return;
      }
      const playlists = await getUserPlaylists(user.id);
      const pl = playlists.find((p: any) => p.id === id);
      setPlaylistName(pl?.name || "Playlist");
      setLoading(false);
    });

    // Récupère les morceaux de la playlist
    getTracksForPlaylist(id).then(data => {
      setTracks(data || []);
    });
  }, [id]);

  const handlePlay = (track: Track) => {
    // Si source YouTube, lecture directe, sinon recherche YouTube à implémenter si besoin
    if (track.source === "youtube") {
      setYoutubeVideoId(track.sourceid);
    } else {
      // Recherche YouTube pour ce titre/artiste (optionnel)
    }
  };

  const handleDelete = async (trackId: string) => {
    await deleteTrackFromPlaylist(trackId);
    setTracks(tracks => tracks.filter(t => t.id !== trackId));
  };

  if (loading) return <div>Chargement…</div>;

  return (
    <div style={{ maxWidth: 700, margin: "40px auto" }}>
      <h2>{playlistName}</h2>
      <ul style={{ listStyle: "none", padding: 0 }}>
        {tracks.map(track => (
          <li key={track.id} style={{
            background: "#191414", color: "#fff", borderRadius: 8, padding: 16, marginBottom: 12, display: "flex", alignItems: "center", gap: 16
          }}>
            {track.albumart && (
              <img src={track.albumart} alt={track.title} style={{ width: 48, height: 48, borderRadius: 8, objectFit: "cover" }} />
            )}
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 600 }}>{track.title}</div>
              <div style={{ color: "#b3b3b3", fontSize: 14 }}>{track.artist}</div>
              {track.album && <div style={{ color: "#b3b3b3", fontSize: 13 }}>{track.album}</div>}
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
            <button
              onClick={() => handleDelete(track.id)}
              style={{
                background: "#222", color: "#fff", border: "none", borderRadius: 16,
                padding: "8px 16px", fontWeight: 600, cursor: "pointer"
              }}
            >
              Supprimer
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