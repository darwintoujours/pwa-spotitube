import React from 'react';
import YouTube from 'react-youtube';

type YouTubePlayerProps = {
  videoId: string;
};

export default function YouTubePlayer({ videoId }: YouTubePlayerProps) {
  const opts = {
    height: '200',
    width: '350',
    playerVars: {
      autoplay: 1,
      controls: 1,
      modestbranding: 1,
      rel: 0,
    },
  };
  return (
    <div style={{ margin: '24px auto', textAlign: 'center' }}>
      <YouTube videoId={videoId} opts={opts} />
    </div>
  );
}
