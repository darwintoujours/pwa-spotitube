import axios from 'axios';

export async function searchSpotify(query: string, accessToken: string) {
  const res = await axios.get('https://api.spotify.com/v1/search', {
    headers: { Authorization: `Bearer ${accessToken}` },
    params: { q: query, type: 'track', limit: 5 },
  });

  const data = res.data as any;

  const tracks = data.tracks?.items?.map((item: any) => ({
    id: item.id,
    title: item.name,
    artists: item.artists.map((a: any) => ({
      name: a.name,
      id: a.id,
      url: `https://open.spotify.com/artist/${a.id}`,
    })),
    album: {
      name: item.album.name,
      id: item.album.id,
      url: `https://open.spotify.com/album/${item.album.id}`,
    },
    albumArt: item.album.images?.[0]?.url,
    source: 'spotify' as const,
    spotifyUrl: item.external_urls.spotify,
  })) || [];

  return tracks;
}
