import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "../supabaseClient";

type Playlist = {
  id: string;
  name: string;
  images: { url: string }[];
};

export default function UserPlaylists() {
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
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
    if (!accessToken) {
      setLoading(false);
      setError("Impossible de récupérer le token Spotify. Veuillez vous reconnecter.");
      return;
    }
    setLoading(true);
    setError(null);

    fetch("https://api.spotify.com/v1/me/playlists?limit=50", {
      headers: { Authorization: `Bearer ${accessToken}` }
    })
      .then(res => {
        if (!res.ok) throw new Error(`HTTP ${res.status} – ${res.statusText}`);
        return res.json();
      })
      .then(data => {
        setPlaylists(data.items || []);
        setLoading(false);
      })
      .catch(err => {
        setError(err.message || "Erreur lors de la récupération des playlists Spotify.");
        setPlaylists([]);
        setLoading(false);
      });
  }, [accessToken]);

  if (loading) return <div>Chargement...</div>;
  if (error) return <div style={{ color: "red" }}>{error}</div>;

  return (
    <div style={{ maxWidth: 600, margin: "40px auto" }}>
      <h2>Mes Playlists Spotify</h2>
      <ul style={{ listStyle: "none", padding: 0 }}>
        {playlists.map(pl => (
          <li
            key={pl.id}
            style={{
              background: "#191414",
              color: "#fff",
              borderRadius: 8,
              padding: 16,
              marginBottom: 14,
              display: "flex",
              alignItems: "center",
              gap: 18,
            }}
          >
            {pl.images?.[0]?.url && (
              <img src={pl.images[0].url} alt={pl.name} style={{ width: 56, height: 56, borderRadius: 8, objectFit: "cover" }} />
            )}
            <Link
              to={`/playlists/${pl.id}`}
              style={{ color: "#fff", textDecoration: "none", fontWeight: 600, flex: 1, fontSize: 18 }}
            >
              {pl.name}
            </Link>
          </li>
        ))}
      </ul>
      {playlists.length === 0 && <div style={{ color: "#b3b3b3" }}>Aucune playlist Spotify trouvée.</div>}
    </div>
  );
}