// src/services/spotifyTokenService.ts

/**
 * Rafraîchit le token Spotify en appelant ton backend sécurisé (Node.js/ngrok).
 * @param refreshToken Le refresh_token Spotify à utiliser.
 * @returns Un objet avec le nouveau access_token, expires_in, et éventuellement un nouveau refresh_token.
 * @throws Error si le refresh échoue.
 */
export async function refreshSpotifyToken(refreshToken: string): Promise<{ access_token: string; expires_in: number; refresh_token?: string; }> {
  const BACKEND_URL = "https://amazing-supposedly-caribou.ngrok-free.app/refresh";

  const response = await fetch(BACKEND_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ refresh_token: refreshToken }),
  });
  if (!response.ok) throw new Error("Erreur lors du rafraîchissement du token Spotify");
  return response.json();
}

//catch {
      // ignore
//    }
//    throw new Error(errorMsg);
//  }

//  const data = await response.json();
  // data = { access_token, expires_in, refresh_token? }
//  return data;
// }