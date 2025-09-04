"use client";

import { useRef, useState, useEffect } from 'react';

type VideoFrameProps = {
  src: string | string[];
  className?: string;
  autoCycle?: boolean;
  cycleInterval?: number;
  showControls?: boolean;
  showNavDots?: boolean;
};

export default function VideoFrame({ 
  src, 
  className = '',
  autoCycle = false,
  cycleInterval = 5000,
  showControls = true,
  showNavDots = false
}: VideoFrameProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0);
  const sources = Array.isArray(src) ? src : [src];
  const currentSource = sources[currentVideoIndex];

  useEffect(() => {
    if (!autoCycle || sources.length <= 1) return;

    const timer = setInterval(() => {
      setCurrentVideoIndex((prevIndex) => 
        prevIndex === sources.length - 1 ? 0 : prevIndex + 1
      );
    }, cycleInterval);

    return () => clearInterval(timer);
  }, [autoCycle, cycleInterval, sources.length]);

  const toggleFullscreen = () => {
    if (!videoRef.current) return;
    
    if (document.fullscreenElement) {
      document.exitFullscreen();
    } else {
      videoRef.current.requestFullscreen().catch(console.error);
    }
  };

  const handleVideoEnd = () => {
    if (autoCycle && sources.length > 1) {
      setCurrentVideoIndex((prevIndex) => 
        prevIndex === sources.length - 1 ? 0 : prevIndex + 1
      );
    }
  };

  return (
    <div className={`relative w-full h-full group ${className}`}>
      <video
        ref={videoRef}
        className="w-full h-full object-cover"
        controls={showControls}
        onEnded={handleVideoEnd}
        onClick={toggleFullscreen}
        autoPlay
        loop={!autoCycle}
        muted
        playsInline
        key={currentSource}
      >
        <source src={currentSource} type="video/mp4" />
        Your browser does not support the video tag.
      </video>
      
      {showNavDots && sources.length > 1 && (
        <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2">
          {sources.map((_, index) => (
            <button
              key={index}
              className={`w-2 h-2 rounded-full transition-colors ${
                index === currentVideoIndex ? 'bg-white' : 'bg-gray-400'
              }`}
              onClick={(e) => {
                e.stopPropagation();
                setCurrentVideoIndex(index);
              }}
              aria-label={`Go to video ${index + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
