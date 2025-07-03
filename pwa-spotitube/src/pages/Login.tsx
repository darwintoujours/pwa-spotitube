import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';

const SPOTIFY_ICON = (
  <svg width="20" height="20" viewBox="0 0 168 168">
    <circle fill="#1ED760" cx="84" cy="84" r="84"/>
    <path d="M120.1 115.4c-1.6 2.7-5 3.5-7.7 1.9-21-12.7-47.5-15.6-78.6-8.7-3.1.7-6.2-1.2-6.9-4.3-.7-3.1 1.2-6.2 4.3-6.9 33.6-7.4 63.1-4.2 86.2 9.5 2.7 1.6 3.5 5 1.9 7.7zm10.9-21.9c-2 3.2-6.2 4.2-9.4 2.2-24-14.7-60.7-19-89.1-10.6-3.6 1-7.3-1-8.3-4.6-1-3.6 1-7.3 4.6-8.3 31.9-9 72.1-4.3 99.3 12.2 3.2 2 4.2 6.2 2.2 9.4zm11.1-22.5c-28.2-17.1-74.8-18.7-101.1-10.4-4.1 1.2-8.4-1.1-9.6-5.2-1.2-4.1 1.1-8.4 5.2-9.6 29.4-8.6 80.2-6.7 111.5 11.2 4 2.4 5.3 7.6 2.9 11.6-2.4 4-7.6 5.3-11.6 2.9z" fill="#fff"/>
  </svg>
);

export default function Login() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    let isMounted = true;
    // Vérifie la session à l'initialisation
    supabase.auth.getUser().then(({ data }) => {
      if (isMounted) {
        setUser(data.user);
        setLoading(false);
        if (data.user) navigate('/home');
      }
    });

    // Écoute les changements de session
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (isMounted) {
        setUser(session?.user ?? null);
        if (session?.user) navigate('/home');
      }
    });

    return () => {
      isMounted = false;
      listener.subscription.unsubscribe();
    };
  }, [navigate]);

  const handleLogin = async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'spotify',
      options: {
        redirectTo: window.location.origin,
        scopes: [
          'user-read-email',
          'user-read-private',
          'playlist-read-private',
          'playlist-modify-private',
          'playlist-modify-public',
          'user-top-read',
          'user-read-recently-played'
        ].join(' ')
      }
    });
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
  };

  if (loading) return <div style={{ marginTop: 100, textAlign: 'center' }}>Chargement...</div>;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: 100 }}>
      <h2>Connexion à SpotiTube</h2>
      {!user ? (
        <button
          onClick={handleLogin}
          style={{
            background: '#1DB954',
            color: '#fff',
            border: 'none',
            padding: '12px 24px',
            borderRadius: 30,
            fontWeight: 600,
            fontSize: 16,
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            cursor: 'pointer'
          }}
        >
          {SPOTIFY_ICON}
          Se connecter avec Spotify
        </button>
      ) : (
        <div style={{ textAlign: 'center' }}>
          <p>Connecté en tant que : <b>{user.email || user.id}</b></p>
          <button
            onClick={handleLogout}
            style={{
              background: '#222',
              color: '#fff',
              border: 'none',
              padding: '8px 18px',
              borderRadius: 20,
              fontWeight: 500,
              marginTop: 16,
              cursor: 'pointer'
            }}
          >
            Se déconnecter
          </button>
        </div>
      )}
    </div>
  );
}