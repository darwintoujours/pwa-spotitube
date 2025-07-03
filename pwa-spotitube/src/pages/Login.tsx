import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../supabaseClient";
import { useSpotifyToken } from "../contexts/SpotifyTokenContext";

export default function Login() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { accessToken } = useSpotifyToken();

  useEffect(() => {
    let isMounted = true;

    // Log direct après getUser
    supabase.auth.getUser().then(({ data, error }) => {
      console.log("getUser() →", { data, error }); // ajouté ici
      if (isMounted) {
        setUser(data.user);
        setLoading(false);
        if (data.user) navigate("/", { replace: true });
      }
    });

    // Log direct après getSession
    supabase.auth.getSession().then(({ data, error }) => {
      console.log("getSession() →", { data, error }); // ajouté ici
      if (data?.session) {
        console.log("provider_token:", data.session.provider_token); // ajouté ici
        console.log("provider_refresh_token:", data.session.provider_refresh_token); // ajouté ici
      }
    });

    // Log à chaque changement d'état d'auth
    const { data: listener } = supabase.auth.onAuthStateChange((event, session) => {
      console.log("onAuthStateChange →", { event, session }); // ajouté ici
      if (isMounted) {
        setUser(session?.user ?? null);
        if (session?.user) navigate("/", { replace: true });
      }
      if (session) {
        console.log("provider_token:", session.provider_token); // ajouté ici
        console.log("provider_refresh_token:", session.provider_refresh_token); // ajouté ici
      }
    });

    return () => {
      isMounted = false;
      listener.subscription.unsubscribe();
    };
  }, [navigate]);

  const handleLogin = async () => {
    const { data, error } = await supabase.auth.signInWithOAuth({
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
          "user-read-recently-played",
        ].join(" "),
      },
    });

    console.log("signInWithOAuth →", { data, error }); // ajouté ici

    if (error) {
      console.error("Erreur OAuth :", error);
      return;
    }
    window.location.href = data.url;
  };

  if (loading) return <div style={{ marginTop: 100, textAlign: "center" }}>Chargement...</div>;

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", marginTop: 120 }}>
      <h2>Connexion Spotitube</h2>
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
          Se connecter avec Spotify
        </button>
      ) : (
        <div style={{ marginTop: 32, textAlign: "center" }}>
          <div style={{ marginBottom: 16 }}>
            Connecté en tant que <b>{user.email}</b>
          </div>
        </div>
      )}
    </div>
  );
}