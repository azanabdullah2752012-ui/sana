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

  // Parse [voice:url:durationSec] safely with lastIndexOf
  if (content.startsWith('[voice:') && content.endsWith(']')) {
    const inner = content.slice(7, -1);
    const lastColon = inner.lastIndexOf(':');
    if (lastColon !== -1) {
      const audioUrl = inner.slice(0, lastColon);
      const durationSec = parseInt(inner.slice(lastColon + 1), 10) || 0;
      if (
        audioUrl.startsWith('data:audio/') ||
        audioUrl.startsWith('http://') ||
        audioUrl.startsWith('https://')
      ) {
        return { isAudio: true, audioUrl, durationSec };
      }
    }
  }

  // Raw audio data URL fallback
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
