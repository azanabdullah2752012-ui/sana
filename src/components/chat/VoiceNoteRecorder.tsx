import React, { useState, useRef, useEffect } from 'react';
import { Mic, Square, Trash2, Send } from 'lucide-react';
import { formatAudioDuration } from '../../lib/audio';

interface VoiceNoteRecorderProps {
  onSendVoiceNote: (audioDataUrl: string, durationSec: number) => void;
  onCancel: () => void;
}

export const VoiceNoteRecorder: React.FC<VoiceNoteRecorderProps> = ({
  onSendVoiceNote,
  onCancel,
}) => {
  const [seconds, setSeconds] = useState(0);
  const [isRecording, setIsRecording] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    let stream: MediaStream | null = null;

    const startRecording = async () => {
      try {
        stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        const mediaRecorder = new MediaRecorder(stream);
        mediaRecorderRef.current = mediaRecorder;
        audioChunksRef.current = [];

        mediaRecorder.ondataavailable = (event) => {
          if (event.data && event.data.size > 0) {
            audioChunksRef.current.push(event.data);
          }
        };

        mediaRecorder.start(100);
        setIsRecording(true);

        timerRef.current = window.setInterval(() => {
          setSeconds((prev) => prev + 1);
        }, 1000);
      } catch (err) {
        console.warn('Microphone permission or recording error:', err);
        alert('Microphone access was not permitted. Please allow microphone permissions to record voice notes.');
        onCancel();
      }
    };

    startRecording();

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
        mediaRecorderRef.current.stop();
      }
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [onCancel]);

  const handleStopAndSend = () => {
    if (!mediaRecorderRef.current || mediaRecorderRef.current.state === 'inactive') return;

    const recordedDuration = seconds;

    mediaRecorderRef.current.onstop = () => {
      const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm;codecs=opus' });
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64Audio = reader.result as string;
        onSendVoiceNote(base64Audio, recordedDuration);
      };
      reader.readAsDataURL(audioBlob);
    };

    mediaRecorderRef.current.stop();
    if (timerRef.current) clearInterval(timerRef.current);
  };

  const handleDiscard = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }
    if (timerRef.current) clearInterval(timerRef.current);
    onCancel();
  };

  return (
    <div className="flex items-center justify-between w-full px-4 py-2 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 rounded-3xl animate-slide-up shadow-sm">
      {/* Live Recording Pulsing Dot & Timer */}
      <div className="flex items-center gap-2.5">
        <span className="relative flex h-3 w-3">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75" />
          <span className="relative inline-flex rounded-full h-3 w-3 bg-rose-500" />
        </span>
        <span className="text-xs font-mono font-semibold text-rose-700 dark:text-rose-300">
          {formatAudioDuration(seconds)}
        </span>
        <span className="text-[11px] text-cream-500 dark:text-cream-400 hidden sm:inline italic">
          Recording voice note...
        </span>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-1.5">
        <button
          type="button"
          onClick={handleDiscard}
          className="p-2 rounded-full text-cream-500 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-cream-200/60 dark:hover:bg-cozydark-800 transition-colors"
          title="Cancel and discard"
          aria-label="Discard recording"
        >
          <Trash2 className="w-4 h-4" />
        </button>

        <button
          type="button"
          onClick={handleStopAndSend}
          className="px-3.5 py-1.5 rounded-2xl bg-rose-500 hover:bg-rose-600 active:scale-95 text-white font-medium text-xs flex items-center gap-1.5 shadow-sm transition-all"
          title="Send voice note"
        >
          <span>Send</span>
          <Send className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
