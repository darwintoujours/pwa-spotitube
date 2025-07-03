import { useEffect, useRef } from "react";
import { supabase } from "../supabaseClient";
import { refreshSpotifyToken } from "../services/spotifyTokenService";
import { useSpotifyToken } from "../contexts/SpotifyTokenContext";

const SPOTIFY_TOKEN_LIFETIME = 3600; // 1h en secondes

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
      let accessToken = session.provider_token;
      const refreshToken = session.provider_refresh_token;

      if (!accessToken || !refreshToken) {
        setAccessToken(null);
        return;
      }

      setAccessToken(accessToken);

      // Planifie le refresh 1 min avant expiration
      if (refreshTimeout.current) clearTimeout(refreshTimeout.current);
      refreshTimeout.current = setTimeout(async () => {
        try {
          const data = await refreshSpotifyToken(refreshToken);
          if (!cancelled) {
            setAccessToken(data.access_token);
            // Replanifie le prochain refresh
            refreshTimeout.current = setTimeout(checkAndRefresh, (data.expires_in - 60) * 1000);
          }
        } catch (e) {
          setAccessToken(null);
        }
      }, (SPOTIFY_TOKEN_LIFETIME - 60) * 1000); // 59 min
    }

    checkAndRefresh();

    return () => {
      cancelled = true;
      if (refreshTimeout.current) clearTimeout(refreshTimeout.current);
    };
  }, [setAccessToken]);
}