import React, { useState, useRef, useEffect } from 'react';
import { Play, Pause, Mic } from 'lucide-react';
import { formatAudioDuration } from '../../lib/audio';

interface AudioMessageBubbleProps {
  audioUrl: string;
  durationSec: number;
  isMe: boolean;
}

export const AudioMessageBubble: React.FC<AudioMessageBubbleProps> = ({
  audioUrl,
  durationSec,
  isMe,
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleTimeUpdate = () => {
      setCurrentTime(audio.currentTime);
    };

    const handleEnded = () => {
      setIsPlaying(false);
      setCurrentTime(0);
    };

    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('ended', handleEnded);

    return () => {
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('ended', handleEnded);
    };
  }, []);

  const togglePlay = () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      audio.pause();
      setIsPlaying(false);
    } else {
      audio.play().then(() => {
        setIsPlaying(true);
      }).catch((err) => {
        console.warn('Playback error:', err);
      });
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const audio = audioRef.current;
    if (!audio) return;
    const seekTo = parseFloat(e.target.value);
    audio.currentTime = seekTo;
    setCurrentTime(seekTo);
  };

  const total = durationSec || (audioRef.current?.duration ? Math.round(audioRef.current.duration) : 0) || 1;
  const progressPercent = Math.min(100, (currentTime / total) * 100);

  return (
    <div
      className={`px-3.5 py-2.5 rounded-2.5xl flex items-center gap-3 w-64 sm:w-72 shadow-xs border ${
        isMe
          ? 'bg-gradient-to-br from-blush-200 via-blush-100 to-blush-200/90 text-blush-950 border-blush-300/60 dark:from-blush-900/80 dark:via-blush-800/70 dark:to-blush-900/80 dark:text-cream-50 dark:border-blush-700/50 rounded-br-sm'
          : 'bg-white dark:bg-cozydark-800 border-cream-200/80 dark:border-cozydark-700 text-cream-900 dark:text-cream-50 rounded-bl-sm'
      }`}
    >
      <audio ref={audioRef} src={audioUrl} preload="metadata" />

      {/* Play/Pause Button */}
      <button
        type="button"
        onClick={togglePlay}
        className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 shadow-xs transition-transform active:scale-90 ${
          isMe
            ? 'bg-blush-500 text-white hover:bg-blush-600'
            : 'bg-blush-500 text-white hover:bg-blush-600'
        }`}
        aria-label={isPlaying ? 'Pause voice note' : 'Play voice note'}
      >
        {isPlaying ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 ml-0.5 fill-current" />}
      </button>

      {/* Audio Waveform / Scrubber & Time */}
      <div className="flex-1 flex flex-col justify-center gap-1">
        {/* Scrubber range input */}
        <div className="relative w-full flex items-center">
          <input
            type="range"
            min={0}
            max={total}
            step={0.1}
            value={currentTime}
            onChange={handleSeek}
            className="w-full h-1.5 rounded-lg appearance-none cursor-pointer bg-cream-300 dark:bg-cozydark-700 accent-blush-500"
          />
        </div>

        <div className="flex items-center justify-between text-[10px] text-cream-600 dark:text-cream-400 font-mono">
          <span>{formatAudioDuration(currentTime)}</span>
          <span className="flex items-center gap-1">
            <Mic className="w-2.5 h-2.5 text-blush-500" />
            <span>{formatAudioDuration(total)}</span>
          </span>
        </div>
      </div>
    </div>
  );
};
