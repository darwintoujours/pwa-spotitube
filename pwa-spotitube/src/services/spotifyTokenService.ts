// src/services/spotifyTokenService.ts
export async function refreshSpotifyToken(refresh_token: string) {
  const response = await fetch('http://localhost:3001/refresh_token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refresh_token }),
  });
  if (!response.ok) throw new Error('Erreur lors du refresh token Spotify');
  const data = await response.json();
  return data.access_token;
}