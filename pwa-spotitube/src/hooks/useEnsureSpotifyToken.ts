import { useEffect, useRef } from "react";
import { supabase } from "../supabaseClient";
import { useSpotifyToken } from "../contexts/SpotifyTokenContext";
import { refreshSpotifyToken } from "../services/spotifyTokenService";

/**
 * Hook global pour garantir un access_token Spotify valide.
 * - Rafraîchit automatiquement le token via le backend si besoin.
 * - Met à jour le context global.
 */
export function useEnsureSpotifyToken() {
  const { setAccessToken } = useSpotifyToken();
  const refreshTimeout = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function checkAndRefresh() {
      // 1. Récupère la session Supabase
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        setAccessToken(null);
        return;
      }

      let accessToken = session.provider_token;
      const refreshToken = session.provider_refresh_token;
      const expiresAt = session.expires_at || null; // Unix timestamp (en secondes) si dispo

      if (!accessToken || !refreshToken) {
        setAccessToken(null);
        return;
      }

      // 2. Vérifie l'expiration (si expiresAt est dispo)
      let needRefresh = false;
      if (expiresAt) {
        const now = Math.floor(Date.now() / 1000);
        // On rafraîchit si le token expire dans moins d'1 minute
        if (expiresAt - now < 60) {
          needRefresh = true;
        }
      }

      if (needRefresh) {
        try {
          const data = await refreshSpotifyToken(refreshToken);
          accessToken = data.access_token;
          setAccessToken(accessToken);

          // Programme un prochain refresh automatique avant expiration
          if (data.expires_in) {
            if (refreshTimeout.current) clearTimeout(refreshTimeout.current);
            refreshTimeout.current = setTimeout(
              checkAndRefresh,
              (data.expires_in - 60) * 1000 // 1 min avant expiration
            );
          }
        } catch (e) {
          setAccessToken(null);
          return;
        }
      } else {
        setAccessToken(accessToken);

        // Programme un refresh automatique si expiresAt est connu
        if (expiresAt) {
          const now = Math.floor(Date.now() / 1000);
          const delay = (expiresAt - now - 60) * 1000; // 1 min avant expiration
          if (delay > 0) {
            if (refreshTimeout.current) clearTimeout(refreshTimeout.current);
            refreshTimeout.current = setTimeout(checkAndRefresh, delay);
          }
        }
      }
    }

    checkAndRefresh();

    return () => {
      if (refreshTimeout.current) clearTimeout(refreshTimeout.current);
      cancelled = true;
    };
  }, [setAccessToken]);
}