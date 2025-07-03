import axios from "axios";

export async function searchSpotify(query: string, accessToken: string) {
  const res = await axios.get<any>(
    "https://api.spotify.com/v1/search",
    {
      headers: { Authorization: `Bearer ${accessToken}` },
      params: {
        q: query,
        type: "track,artist,album",
        limit: 8
      }
    }
  );
  const data = res.data as any;
  // Formate les résultats
  const artists = (data.artists?.items || []).map((item: any) => ({
    id: item.id,
    name: item.name,
    image: item.images?.[0]?.url,
    url: `https://open.spotify.com/artist/${item.id}`,
  }));
  const albums = (data.albums?.items || []).map((item: any) => ({
    id: item.id,
    name: item.name,
    image: item.images?.[0]?.url,
    url: `https://open.spotify.com/album/${item.id}`,
    year: item.release_date?.slice(0, 4),
    artist: item.artists?.[0]?.name,
    artistId: item.artists?.[0]?.id,
  }));
  const tracks = (data.tracks?.items || []).map((item: any) => ({
    id: item.id,
    title: item.name,
    artists: item.artists.map((a: any) => ({
      name: a.name,
      id: a.id,
      url: `https://open.spotify.com/artist/${a.id}`
    })),
    album: {
      name: item.album.name,
      id: item.album.id,
      url: `https://open.spotify.com/album/${item.album.id}`
    },
    albumArt: item.album.images?.[0]?.url,
    spotifyUrl: item.external_urls.spotify
  }));
  return { artists, albums, tracks };
}