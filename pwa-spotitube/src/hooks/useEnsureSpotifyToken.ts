import { useEffect, useRef } from "react";
import { supabase } from "../supabaseClient";
import { refreshSpotifyToken } from "../services/spotifyTokenService";
import { useSpotifyToken } from "../contexts/SpotifyTokenContext";

// Durée de validité du token Spotify (en secondes). Par défaut, 3600s (1h)
const SPOTIFY_TOKEN_LIFETIME = 3600;

export function useEnsureSpotifyToken() {
  const { setAccessToken } = useSpotifyToken();
  const refreshTimeout = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function checkAndRefresh() {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        setAccessToken(null);
        return;
      }

      let access_token = session.provider_token;
      const refresh_token = session.provider_refresh_token;

      if (!access_token || !refresh_token) {
        setAccessToken(null);
        return;
      }

      setAccessToken(access_token);

      // Planifie le refresh automatique juste avant expiration (dans 59 minutes)
      if (refreshTimeout.current) clearTimeout(refreshTimeout.current);
      refreshTimeout.current = setTimeout(async () => {
        try {
          const newToken = await refreshSpotifyToken(refresh_token);
          setAccessToken(newToken);
          // Planifie le prochain refresh dans 1h
          if (!cancelled && newToken) {
            refreshTimeout.current = setTimeout(checkAndRefresh, SPOTIFY_TOKEN_LIFETIME * 1000 - 60 * 1000);
          }
        } catch (e) {
          setAccessToken(null);
        }
      }, SPOTIFY_TOKEN_LIFETIME * 1000 - 60 * 1000); // 59 minutes

    }

    checkAndRefresh();

    return () => {
      cancelled = true;
      if (refreshTimeout.current) clearTimeout(refreshTimeout.current);
    };
  }, [setAccessToken]);
}