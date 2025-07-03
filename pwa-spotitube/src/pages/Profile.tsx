import React, { useEffect, useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useSpotifyToken } from "../contexts/SpotifyTokenContext"; // ajouté ici

type SpotifyProfile = {
  display_name: string;
  email: string;
  images?: { url: string }[];
  external_urls?: { spotify: string };
};

export default function Profile() {
  const { user, signOut } = useAuth();
  const { accessToken } = useSpotifyToken(); // ajouté ici
  const [profile, setProfile] = useState<SpotifyProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!accessToken) {
      setLoading(false);
      setError("Impossible de récupérer le token Spotify. Veuillez vous reconnecter.");
      return;
    }
    setLoading(true);
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

  // Le bouton déconnexion est TOUJOURS affiché (même en cas d’erreur)
  return (
    <div style={{ maxWidth: 500, margin: "40px auto", textAlign: "center" }}>
      <h2>Mon profil Spotify</h2>
      {/* Affichage debug du token, optionnel */}
      <div style={{ fontSize: 12, color: "#b3b3b3", marginBottom: 12 }}>
        Token Spotify : {accessToken ? "✅ Présent" : "❌ Absent"}
      </div>
      {loading && <div style={{ marginTop: 100 }}>Chargement du profil Spotify…</div>}
      {error && <div style={{ color: "red", marginTop: 100 }}>{error}</div>}
      {profile && !loading && !error && (
        <>
          {profile.images?.[0]?.url && (
            <img
              src={profile.images[0].url}
              alt="avatar"
              style={{ width: 120, borderRadius: "50%", marginBottom: 24 }}
            />
          )}
          <h3 style={{ margin: "16px 0 8px 0" }}>{profile.display_name || "Utilisateur"}</h3>
          <p style={{ color: "#b3b3b3" }}>{profile.email}</p>
          <p>
            <a
              href={profile.external_urls?.spotify}
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: "#1DB954", textDecoration: "underline" }}
            >
              Voir mon profil Spotify
            </a>
          </p>
        </>
      )}
      <button
        onClick={signOut}
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