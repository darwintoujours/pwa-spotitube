import axios from 'axios';

const API_KEY = process.env.REACT_APP_YOUTUBE_API_KEY;

export async function searchYouTube(query: string) {
  const res = await axios.get('https://www.googleapis.com/youtube/v3/search', {
    params: {
      part: 'snippet',
      q: query,
      type: 'video',
      maxResults: 5,
      key: API_KEY,
    },
  });

  const data = res.data as any; // <-- Ajoute ceci

  return data.items.map((item: any) => ({
    id: item.id.videoId,
    title: item.snippet.title,
    artist: item.snippet.channelTitle,
    albumArt: item.snippet.thumbnails.high.url,
    source: 'youtube' as const,
    youtubeId: item.id.videoId,
  }));
}
