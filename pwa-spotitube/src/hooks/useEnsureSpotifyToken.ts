import { useEffect, useRef } from "react";
import { supabase } from "../supabaseClient";
import { refreshSpotifyToken } from "../services/spotifyTokenService";
import { useSpotifyToken } from "../contexts/SpotifyTokenContext";

/**
 * Hook centralisé pour toujours disposer d’un access_token Spotify valide.
 * - Récupère provider_token et provider_refresh_token depuis Supabase.
 * - Rafraîchit automatiquement l’access_token via le backend sécurisé si nécessaire.
 * - Met à jour le contexte global via setAccessToken().
 */
export function useEnsureSpotifyTokens() {
  const { setAccessToken } = useSpotifyToken();
  const refreshTimeout = useRef<NodeJS.Timeout>();

  useEffect(() => {
    let mounted = true;

    async function initializeAndScheduleRefresh() {
      // 1. Récupère la session Supabase
      const { data: { session } } = await supabase.auth.getSession();
      const providerToken = session?.provider_token;
      const refreshToken  = session?.provider_refresh_token;

      if (!providerToken || !refreshToken) {
        setAccessToken(null);
        return;
      }

      // 2. Met à jour immédiatement le contexte avec le token actuel
      setAccessToken(providerToken);

      // 3. Programme un rafraîchissement automatique 55 minutes plus tard
      const timeout = setTimeout(async () => {
        try {
          const data = await refreshSpotifyToken(refreshToken);
          if (mounted) {
            setAccessToken(data.access_token);
            // Re-planifier le prochain refresh avant expiration
            const nextDelay = (data.expires_in - 60) * 1000;
            refreshTimeout.current = setTimeout(initializeAndScheduleRefresh, nextDelay);
          }
        } catch (err) {
          console.error("Erreur de rafraîchissement Spotify :", err);
          if (mounted) setAccessToken(null);
        }
      }, 55 * 60 * 1000);

      refreshTimeout.current = timeout;
    }

    initializeAndScheduleRefresh();

    return () => {
      mounted = false;
      if (refreshTimeout.current) clearTimeout(refreshTimeout.current);
    };
  }, [setAccessToken]);
}