import React, { useEffect, useState } from "react";
import { useSpotifyToken } from "../contexts/SpotifyTokenContext";
import {
  createSpotifyPlaylist,
  renameSpotifyPlaylist,
  unfollowSpotifyPlaylist
} from "../services/spotifyPlaylistService";
import { Link } from "react-router-dom";
import { usePlayer } from "../contexts/PlayerContext";

export default function UserPlaylists() {
  const { accessToken } = useSpotifyToken();
  const [playlists, setPlaylists] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [newName, setNewName] = useState("");
  const [renameId, setRenameId] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Récupère les playlists Spotify de l'utilisateur connecté
  useEffect(() => {
    if (!accessToken) return;
    setLoading(true);
    fetch("https://api.spotify.com/v1/me/playlists?limit=50", {
      headers: { Authorization: `Bearer ${accessToken}` }
    })
      .then(res => res.json())
      .then(data => setPlaylists(data.items || []))
      .catch(() => setError("Erreur lors du chargement des playlists Spotify."))
      .finally(() => setLoading(false));
  }, [accessToken]);

  // Créer une playlist
  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    if (!accessToken || !newName.trim()) return;
    try {
      // Récupère l'id utilisateur Spotify
      const res = await fetch("https://api.spotify.com/v1/me", {
        headers: { Authorization: `Bearer ${accessToken}` }
      });
      const user = await res.json();
      const pl = await createSpotifyPlaylist(user.id, newName.trim(), accessToken);
      setPlaylists([pl, ...playlists]);
      setNewName("");
      setSuccess("Playlist créée !");
    } catch (err: any) {
      setError(err.message || "Erreur lors de la création.");
    }
  };

  // Renommer une playlist
  const handleRename = async (playlistId: string) => {
    setError(null);
    setSuccess(null);
    if (!accessToken) return;
    try {
      await renameSpotifyPlaylist(playlistId, renameValue, accessToken);
      setPlaylists(playlists.map(pl => pl.id === playlistId ? { ...pl, name: renameValue } : pl));
      setRenameId(null);
      setRenameValue("");
      setSuccess("Playlist renommée !");
    } catch (err: any) {
      setError(err.message || "Erreur lors du renommage.");
    }
  };

  // Supprimer (unfollow) une playlist
  const handleDelete = async (playlistId: string) => {
    setError(null);
    setSuccess(null);
    if (!accessToken) return;
    if (!window.confirm("Supprimer cette playlist Spotify ?")) return;
    try {
      await unfollowSpotifyPlaylist(playlistId, accessToken);
      setPlaylists(playlists.filter(pl => pl.id !== playlistId));
      setSuccess("Playlist supprimée !");
    } catch (err: any) {
      setError(err.message || "Erreur lors de la suppression.");
    }
  };

  if (loading) return <div>Chargement…</div>;

  return (
    <div style={{ maxWidth: 600, margin: "40px auto" }}>
      <h2>Mes Playlists Spotify</h2>
      <form onSubmit={handleCreate} style={{ display: "flex", gap: 8, marginBottom: 24 }}>
        <input
          value={newName}
          onChange={e => setNewName(e.target.value)}
          placeholder="Nom de la nouvelle playlist"
          style={{ flex: 1, padding: 10, borderRadius: 8 }}
        />
        <button type="submit" style={{
          background: "#1DB954", color: "#fff", border: "none", borderRadius: 8, padding: "0 20px", fontWeight: 600
        }}>
          Créer
        </button>
      </form>
      {error && <div style={{ color: "red", marginBottom: 12 }}>{error}</div>}
      {success && <div style={{ color: "#1DB954", marginBottom: 12 }}>{success}</div>}
      <ul style={{ listStyle: "none", padding: 0 }}>
        {playlists.map(pl => (
          <li key={pl.id} style={{
            background: "#191414", color: "#fff", borderRadius: 8, padding: 16, marginBottom: 12, display: "flex", alignItems: "center", gap: 16
          }}>
            <Link to={`/playlists/${pl.id}`} style={{ color: "#1DB954", textDecoration: "none", flex: 1 }}>
              {renameId === pl.id ? (
                <input
                  value={renameValue}
                  onChange={e => setRenameValue(e.target.value)}
                  onBlur={() => setRenameId(null)}
                  style={{ padding: 8, borderRadius: 8, width: "90%" }}
                  autoFocus
                />
              ) : (
                pl.name
              )}
            </Link>
            {renameId === pl.id ? (
              <button onClick={() => handleRename(pl.id)} style={{
                background: "#1DB954", color: "#fff", border: "none", borderRadius: 8, padding: "6px 12px", fontWeight: 600
              }}>Valider</button>
            ) : (
              <button onClick={() => { setRenameId(pl.id); setRenameValue(pl.name); }} style={{
                background: "#222", color: "#fff", border: "none", borderRadius: 8, padding: "6px 12px", fontWeight: 600
              }}>Renommer</button>
            )}
            <button onClick={() => handleDelete(pl.id)} style={{
              background: "#FF0000", color: "#fff", border: "none", borderRadius: 8, padding: "6px 12px", fontWeight: 600
            }}>Supprimer</button>
          </li>
        ))}
      </ul>
    </div>
  );
}