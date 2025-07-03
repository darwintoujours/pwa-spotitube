import React, { useEffect, useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { useSpotifyToken } from "../contexts/SpotifyTokenContext";
import { usePlayer } from "../contexts/PlayerContext";

export default function Profile() {
  const { user, signOut } = useAuth();
  const accessToken = useSpotifyToken();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  // Récupère le profil Spotify de l'utilisateur connecté
  useEffect(() => {
    if (!accessToken) {
      setLoading(false);
      setError("Impossible de récupérer le token Spotify. Veuillez vous reconnecter.");
      return;
    }
    fetch("https://api.spotify.com/v1/me", {
      headers: { Authorization: `Bearer ${accessToken}` }
    })
      .then(res => {
        if (!res.ok) throw new Error("Erreur lors de la récupération du profil Spotify.");
        return res.json();
      })
      .then(data => {
        setProfile(data);
        setLoading(false);
      })
      .catch(err => {
        setError(err.message || "Erreur lors de la récupération du profil Spotify.");
        setLoading(false);
      });
  }, [accessToken]);

  const handleLogout = async () => {
    await signOut();
    navigate("/login", { replace: true });
  };

  if (loading) return <div style={{ marginTop: 100, textAlign: "center" }}>Chargement du profil Spotify…</div>;
  if (error) return <div style={{ color: "red", marginTop: 100, textAlign: "center" }}>{error}</div>;

  return (
    <div style={{ maxWidth: 500, margin: "40px auto", textAlign: "center" }}>
      <h2>Mon profil Spotify</h2>
      {profile?.images?.[0]?.url && (
        <img
          src={profile.images[0].url}
          alt="avatar"
          style={{ width: 120, borderRadius: "50%", marginBottom: 24 }}
        />
      )}
      <h3 style={{ margin: "16px 0 8px 0" }}>{profile?.display_name || "Utilisateur"}</h3>
      <p style={{ color: "#b3b3b3" }}>{profile?.email}</p>
      <p>
        <a
          href={profile?.external_urls?.spotify}
          target="_blank"
          rel="noopener noreferrer"
          style={{ color: "#1DB954", textDecoration: "underline" }}
        >
          Voir mon profil Spotify
        </a>
      </p>
      <button
        onClick={handleLogout}
        style={{
          background: "#222",
          color: "#fff",
          border: "none",
          borderRadius: 8,
          padding: "10px 22px",
          fontWeight: 600,
          cursor: "pointer",
          marginTop: 32
        }}
      >
        Se déconnecter
      </button>
    </div>
  );
}