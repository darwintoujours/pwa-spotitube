import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../supabaseClient";
import { useSpotifyToken } from "../contexts/SpotifyTokenContext"; // ajouté ici

const SPOTIFY_ICON = (
  <svg width={20} height={20} viewBox="0 0 168 168">
    <circle fill="#1ED760" cx="84" cy="84" r="84" />
    <path
      d="M120.1 115.4c-1.6 2.7-5 3.5-7.7 1.9-21-12.7-47.5-15.6-78.6-8.7-3.1.7-6.2-1.2-6.9-4.2-.7-3.1 1.2-6.2 4.2-6.9 33.7-7.4 62.5-4.2 85.2 9.5 2.8 1.6 3.7 5 2.1 7.7zm10.3-21.6c-2 3.3-6.3 4.4-9.6 2.4-24-14.7-60.7-19-89-10.6-3.7 1-7.5-1.1-8.5-4.8-1-3.7 1.1-7.5 4.8-8.5 31.9-8.8 71-4.2 98.1 11.2 3.3 2 4.4 6.3 2.2 9.7zm11-23.2c-28.2-16.5-75.1-18-102.1-10.1-4.3 1.2-8.7-1.2-9.9-5.5-1.2-4.3 1.2-8.7 5.5-9.9 30.6-8.5 81.1-6.8 112.7 11.3 4 2.3 5.4 7.4 3.1 11.3-2.3 3.9-7.4 5.3-11.3 3.1z"
      fill="#fff"
    />
  </svg>
);

export default function Login() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Pour afficher l'état du token Spotify si besoin (debug)
  const { accessToken } = useSpotifyToken(); // ajouté ici

  useEffect(() => {
    let isMounted = true;
    supabase.auth.getUser().then(({ data }) => {
      if (isMounted) {
        setUser(data.user);
        setLoading(false);
        if (data.user) navigate("/", { replace: true });
      }
    });
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (isMounted) {
        setUser(session?.user ?? null);
        if (session?.user) navigate("/", { replace: true });
      }
    });
    return () => {
      isMounted = false;
      listener.subscription.unsubscribe();
    };
  }, [navigate]);

  const handleLogin = async () => {
    await supabase.auth.signInWithOAuth({
      provider: "spotify",
      options: {
        redirectTo: window.location.origin,
        scopes: [
          "user-read-email",
          "user-read-private",
          "playlist-read-private",
          "playlist-modify-private",
          "playlist-modify-public",
          "user-top-read",
          "user-read-recently-played"
        ].join(" "),
      },
    });
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    // ajouté ici : on peut forcer un reload pour nettoyer le contexte si besoin
    window.location.reload(); // ajouté ici
  };

  if (loading) return <div style={{ marginTop: 100, textAlign: "center" }}>Chargement...</div>;

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", marginTop: 120 }}>
      <h2>Connexion Spotitube</h2>
      {/* ajouté ici : affichage debug du token Spotify */}
      <div style={{ fontSize: 12, color: "#b3b3b3", marginBottom: 12 }}>
        Token Spotify : {accessToken ? "✅ Présent" : "❌ Absent"}
      </div>
      {!user ? (
        <button
          onClick={handleLogin}
          style={{
            background: "#1DB954",
            color: "#fff",
            border: "none",
            padding: "12px 24px",
            borderRadius: 30,
            fontWeight: 600,
            fontSize: 16,
            display: "flex",
            alignItems: "center",
            gap: 10,
            cursor: "pointer",
            marginTop: 24
          }}
        >
          {SPOTIFY_ICON}
          Se connecter avec Spotify
        </button>
      ) : (
        <div style={{ marginTop: 32, textAlign: "center" }}>
          <div style={{ marginBottom: 16 }}>
            Connecté en tant que <b>{user.email}</b>
          </div>
          <button
            onClick={handleLogout}
            style={{
              background: "#222",
              color: "#fff",
              border: "none",
              borderRadius: 8,
              padding: "10px 22px",
              fontWeight: 600,
              cursor: "pointer"
            }}
          >
            Se déconnecter
          </button>
        </div>
      )}
    </div>
  );
}