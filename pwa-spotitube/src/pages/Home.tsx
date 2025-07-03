import React, { useEffect, useState } from "react";
import { useSpotifyToken } from "../contexts/SpotifyTokenContext";

type SpotifyProfile = {
  display_name: string;
  email: string;
  images: { url: string }[];
};

export default function Home() {
  const { accessToken } = useSpotifyToken();
  const [profile, setProfile] = useState<SpotifyProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!accessToken) return;
    setLoading(true);
    fetch("https://api.spotify.com/v1/me", {
      headers: { Authorization: `Bearer ${accessToken}` }
    })
      .then(res => res.json())
      .then(data => {
        setProfile(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [accessToken]);

  if (loading) return <div>Chargement du profil Spotify…</div>;

  if (!profile) return <div>Impossible de charger le profil Spotify.</div>;

  return (
    <div style={{ maxWidth: 500, margin: "40px auto", textAlign: "center" }}>
      <h2>Bienvenue, {profile.display_name}</h2>
      {profile.images?.[0]?.url && (
        <img src={profile.images[0].url} alt="avatar" style={{ width: 120, borderRadius: "50%" }} />
      )}
      <p style={{ color: "#b3b3b3" }}>{profile.email}</p>
    </div>
  );
}
