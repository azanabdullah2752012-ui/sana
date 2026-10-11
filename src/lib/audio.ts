// Voice note / audio message handling for Sana & Me chat

export interface AudioMessageInfo {
  isAudio: boolean;
  audioUrl?: string;
  durationSec?: number;
}

export function encodeAudioMessage(audioUrl: string, durationSec: number): string {
  const rounded = Math.max(1, Math.round(durationSec));
  return `[voice:${audioUrl.trim()}:${rounded}]`;
}

export function parseAudioMessage(content: string): AudioMessageInfo {
  if (!content) return { isAudio: false };

  const match = content.match(/^\[voice:(data:audio\/[a-zA-Z0-9]+;base64,[A-Za-z0-9+/=]+|https?:\/\/[^:]+):(\d+)\]$/);
  if (match) {
    return {
      isAudio: true,
      audioUrl: match[1],
      durationSec: parseInt(match[2], 10) || 0,
    };
  }

  // Raw audio base64 fallback
  if (content.startsWith('data:audio/')) {
    return {
      isAudio: true,
      audioUrl: content,
      durationSec: 0,
    };
  }

  return { isAudio: false };
}

export function formatAudioDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
}
