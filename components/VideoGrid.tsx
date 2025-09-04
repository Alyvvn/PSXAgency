"use client";

import { useState } from 'react';
import VideoPlayer from './VideoPlayer';

type VideoItem = {
  id: string;
  src: string;
  thumbnail: string;
  title?: string;
};

type VideoGridProps = {
  videos: VideoItem[];
  className?: string;
};

export default function VideoGrid({ videos, className = '' }: VideoGridProps) {
  const [activeVideo, setActiveVideo] = useState<string | null>(null);

  return (
    <div className={`grid grid-cols-3 gap-3 p-6 w-full ${className}`}>
      {videos.map((video) => (
        <div key={video.id} className="h-24 rounded-xl">
          <VideoPlayer
            src={video.src}
            thumbnail={video.thumbnail}
            title={video.title}
            className="h-full w-full"
            autoPlayOnHover
          />
        </div>
      ))}
    </div>
  );
}
