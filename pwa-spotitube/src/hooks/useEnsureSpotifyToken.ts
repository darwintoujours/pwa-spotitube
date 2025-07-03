// src/hooks/useEnsureSpotifyToken.ts

import { useEffect } from "react";
import { supabase } from "../supabaseClient";
import { refreshSpotifyToken } from "../services/spotifyTokenService";
import { useSpotifyToken } from "../contexts/SpotifyTokenContext";

/**
 * Hook global pour garantir un access_token Spotify valide.
 * - Utilise provider_token et provider_refresh_token de la session Supabase.
 * - Stocke le token dans le context global.
 * - Loggue toutes les infos utiles pour le debug.
 * - Ne gère pas le refresh automatique ici, voir si tu veux l’ajouter plus tard.
 */
export function useEnsureSpotifyToken() {
  const { setAccessToken } = useSpotifyToken();

  useEffect(() => {
    async function checkAndRefresh() {
      // 1. Récupère la session Supabase
      const { data: { session } } = await supabase.auth.getSession();
      console.log("useEnsureSpotifyToken session récupérée :", session);

      if (!session) {
        setAccessToken(null);
        console.log("useEnsureSpotifyToken Pas de session Supabase");
        return;
      }

      // 2. Récupère les vrais tokens Spotify
      let accessToken = session.provider_token;
      const refreshToken = session.provider_refresh_token;
      console.log("useEnsureSpotifyToken accessToken provider_token :", accessToken);
      console.log("useEnsureSpotifyToken refreshToken provider_refresh_token :", refreshToken);

      if (!accessToken || !refreshToken) {
        setAccessToken(null);
        console.log("useEnsureSpotifyToken Pas de token Spotify dans la session");
        return;
      }

      // 3. (Optionnel) Ajoute ici la logique d'expiration si tu as expires_at
      //    Par défaut, on suppose que le token est valide à la connexion
      //    Tu peux ajouter un refresh auto ici plus tard si tu veux

      setAccessToken(accessToken);
      console.log("useEnsureSpotifyToken Token Spotify mis à jour dans le context :", accessToken);
    }

    checkAndRefresh();
  }, [setAccessToken]);
}
