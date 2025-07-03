// Fonction utilitaire pour convertir la durée ISO 8601 en secondes
function parseDuration(iso: string) {
  const match = iso.match(/PT(?:(\d+)M)?(?:(\d+)S)?/);
  const min = match && match[1] ? parseInt(match[1]) : 0;
  const sec = match && match[2] ? parseInt(match[2]) : 0;
  return min * 60 + sec;
}

export async function searchYouTubeVideoPrecise(
  artist: string,
  track: string,
  album: string,
  durationSec: number
): Promise<string | null> {
  const apiKey = process.env.REACT_APP_YOUTUBE_API_KEY;
  const query = `${artist} "${track}" ${album} official audio`;
  const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&order=viewCount&q=${encodeURIComponent(query)}&type=video&maxResults=5&key=${apiKey}`;
  const response = await fetch(url);
  if (!response.ok) return null;
  const data = await response.json();

  if (!data.items || data.items.length === 0) return null;

  // Récupère les IDs vidéos pour vérifier la durée
  const videoIds = data.items.map((item: any) => item.id.videoId).join(',');
  const detailsUrl = `https://www.googleapis.com/youtube/v3/videos?part=contentDetails,snippet&id=${videoIds}&key=${apiKey}`;
  const detailsResp = await fetch(detailsUrl);
  if (!detailsResp.ok) return null;
  const detailsData = await detailsResp.json();

  let best = null;
  let bestScore = -Infinity;
  for (const video of detailsData.items) {
    const title = video.snippet.title.toLowerCase();
    const channel = video.snippet.channelTitle.toLowerCase();
    const videoDuration = parseDuration(video.contentDetails.duration);
    let score = 0;
    if (title.includes(track.toLowerCase())) score += 3;
    if (title.includes(artist.toLowerCase())) score += 2;
    if (album && title.includes(album.toLowerCase())) score += 1;
    if (channel.includes('vevo') || channel.includes(artist.toLowerCase())) score += 2;
    if (Math.abs(videoDuration - durationSec) <= 5) score += 2;
    if (title.includes('official') || title.includes('audio')) score += 1;
    // Bonus : log pour debug
    console.log(`[YouTube match] "${video.snippet.title}" | Score: ${score} | Durée: ${videoDuration}s`);
    if (score > bestScore) {
      best = video.id;
      bestScore = score;
    }
  }
  return best;
}
