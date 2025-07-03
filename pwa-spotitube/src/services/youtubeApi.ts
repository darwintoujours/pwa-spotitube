import axios from "axios";
const APIKEY = process.env.REACT_APP_YOUTUBE_API_KEY;

export async function searchYouTube(query: string) {
  const res = await axios.get<{ items: any[] }>(
    "https://www.googleapis.com/youtube/v3/search",
    {
      params: {
        part: "snippet",
        q: query,
        type: "video",
        maxResults: 3,
        key: APIKEY
      }
    }
  );
  return res.data.items.map(item => ({
    youtubeId: item.id.videoId,
    title: item.snippet.title,
    channel: item.snippet.channelTitle,
    thumbnail: item.snippet.thumbnails.default.url
  }));
}