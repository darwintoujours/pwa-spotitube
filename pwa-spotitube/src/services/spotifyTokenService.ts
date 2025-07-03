// src/services/spotifyTokenService.ts

/**
 * Rafraîchit le token Spotify en appelant ton backend sécurisé (Node.js/ngrok).
 * @param refreshToken Le refresh_token Spotify à utiliser.
 * @returns Un objet avec le nouveau access_token, expires_in, et éventuellement un nouveau refresh_token.
 * @throws Error si le refresh échoue.
 */
export async function refreshSpotifyToken(refreshToken: string): Promise<{
  access_token: string;
  expires_in: number;
  refresh_token?: string;
}> {
  // Remplace l'URL ci-dessous par celle donnée par ngrok ou ton backend déployé
  const BACKEND_URL = "amazing-supposedly-caribou.ngrok-free.app/refresh";

  const response = await fetch(BACKEND_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ refresh_token: refreshToken }),
  });

  if (!response.ok) {
    // Tente de récupérer le message d'erreur du backend
    let errorMsg = "Erreur lors du rafraîchissement du token Spotify";
    try {
      const errorData = await response.json();
      if (errorData.error || errorData.description) {
        errorMsg += `: ${errorData.error} ${errorData.description || ""}`;
      }
    } catch {
      // ignore
    }
    throw new Error(errorMsg);
  }

  const data = await response.json();
  // data = { access_token, expires_in, refresh_token? }
  return data;
}