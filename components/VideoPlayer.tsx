"use client";

import { useRef, useEffect, useState } from 'react';

type VideoPlayerProps = {
  src: string;
  thumbnail?: string;
  title?: string;
  className?: string;
  autoPlayOnHover?: boolean;
  preload?: 'auto' | 'metadata' | 'none';
  playsInline?: boolean;
  muted?: boolean;
  loop?: boolean;
};

export default function VideoPlayer({ 
  src, 
  thumbnail,
  title,
  className = '',
  autoPlayOnHover = false,
  preload = 'metadata',
  playsInline = true,
  muted = true,
  loop = true
}: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isHovered, setIsHovered] = useState(false);
  const [hasPlayed, setHasPlayed] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Handle autoplay on hover
  useEffect(() => {
    const video = videoRef.current;
    if (!video || !autoPlayOnHover) return;

    const handleHover = () => {
      if (video.paused) {
        video.play().catch(e => {
          console.error('Error playing video:', e);
          setError('Failed to play video');
        });
      }
    };

    const handleHoverEnd = () => {
      if (!video.paused && !hasPlayed) {
        video.pause();
        video.currentTime = 0;
      }
    };

    video.addEventListener('mouseenter', handleHover);
    video.addEventListener('mouseleave', handleHoverEnd);
    video.addEventListener('play', () => setHasPlayed(true));
    video.addEventListener('loadeddata', () => setIsLoading(false));
    video.addEventListener('error', () => setError('Failed to load video'));

    return () => {
      video.removeEventListener('mouseenter', handleHover);
      video.removeEventListener('mouseleave', handleHoverEnd);
      video.removeEventListener('play', () => setHasPlayed(true));
      video.removeEventListener('loadeddata', () => setIsLoading(false));
      video.removeEventListener('error', () => setError('Failed to load video'));
    };
  }, [autoPlayOnHover, hasPlayed]);

  return (
    <div className={`relative w-full h-full ${className}`}>
      {error && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 text-red-500">
          {error}
        </div>
      )}
      
      {isLoading && !error && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
          <div className="animate-pulse">Loading video...</div>
        </div>
      )}
      
      <video
        ref={videoRef}
        className={`w-full h-full object-cover ${isLoading ? 'opacity-0' : 'opacity-100'}`}
        preload={preload}
        playsInline={playsInline}
        muted={muted}
        loop={loop}
        title={title}
        poster={thumbnail}
      >
        <source src={src} type="video/mp4" />
        Your browser does not support the video tag.
      </video>
      
      {!autoPlayOnHover && !hasPlayed && !isLoading && !error && (
        <button
          onClick={() => {
            videoRef.current?.play().catch(e => {
              console.error('Error playing video:', e);
              setError('Failed to play video');
            });
          }}
          className="absolute inset-0 m-auto w-16 h-16 rounded-full bg-black/50 flex items-center justify-center text-white hover:bg-black/70 transition-all"
          aria-label="Play video"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
            <path d="M8 5v14l11-7z" />
          </svg>
        </button>
      )}
    </div>
  );
}
