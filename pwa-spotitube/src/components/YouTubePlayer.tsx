import React from "react";

export default function YouTubePlayer({ videoId }: { videoId: string }) {
  if (!videoId) return null;
  return (
    <iframe
      width="360"
      height="202"
      src={`https://www.youtube.com/embed/${videoId}?autoplay=1`}
      title="YouTube player"
      frameBorder="0"
      allow="autoplay; encrypted-media"
      allowFullScreen
      style={{ borderRadius: 12 }}
    />
  );
}