import axios from "axios";

// Crée une instance axios pour l'API Spotify
const getSpotifyApi = (accessToken: string) =>
  axios.create({
    baseURL: "https://api.spotify.com/v1",
    headers: { Authorization: `Bearer ${accessToken}` }
  });

// Créer une playlist Spotify
export async function createSpotifyPlaylist(userId: string, name: string, accessToken: string) {
  const api = getSpotifyApi(accessToken);
  const res = await api.post(`/users/${userId}/playlists`, {
    name,
    public: false,
    collaborative: false,
    description: "Créée via Spotitube"
  });
  return res.data as any;
}

// Renommer une playlist Spotify
export async function renameSpotifyPlaylist(playlistId: string, newName: string, accessToken: string) {
  const api = getSpotifyApi(accessToken);
  await api.put(`/playlists/${playlistId}`, { name: newName });
}

// Supprimer (unfollow) une playlist Spotify
export async function unfollowSpotifyPlaylist(playlistId: string, accessToken: string) {
  const api = getSpotifyApi(accessToken);
  await api.delete(`/playlists/${playlistId}/followers`);
}

// Ajouter un morceau à une playlist Spotify
export async function addTrackToSpotifyPlaylist(playlistId: string, trackUri: string, accessToken: string) {
  const api = getSpotifyApi(accessToken);
  await api.post(`/playlists/${playlistId}/tracks`, { uris: [trackUri] });
}

// Supprimer un morceau d'une playlist Spotify
export async function removeTrackFromSpotifyPlaylist(playlistId: string, trackUri: string, accessToken: string) {
  const api = getSpotifyApi(accessToken);
  await api.request({
    url: `/playlists/${playlistId}/tracks`,
    method: "DELETE",
    data: { tracks: [{ uri: trackUri }] }
  });
}

// (Optionnel) Récupérer les playlists Spotify de l'utilisateur
export async function getSpotifyPlaylists(accessToken: string) {
  const api = getSpotifyApi(accessToken);
  const res = await api.get("/me/playlists?limit=50");
  return (res.data as any).items;
}

// (Optionnel) Récupérer les titres d'une playlist Spotify
export async function getSpotifyPlaylistTracks(playlistId: string, accessToken: string) {
  const api = getSpotifyApi(accessToken);
  const res = await api.get(`/playlists/${playlistId}/tracks`);
  return (res.data as any).items.map((item: any) => item.track);
}