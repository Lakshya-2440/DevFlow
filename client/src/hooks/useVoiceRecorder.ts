import { useState, useRef, useEffect, useCallback } from 'react';
import { api } from '../services/api';

interface UseVoiceRecorderOptions {
  onTranscribed: (text: string) => void;
  onError: (err: string) => void;
}

export const useVoiceRecorder = ({ onTranscribed, onError }: UseVoiceRecorderOptions) => {
  const [isRecording, setIsRecording] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [liveTranscript, setLiveTranscript] = useState('');
  const [mediaStream, setMediaStream] = useState<MediaStream | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const recognitionRef = useRef<any>(null);
  const isHoldingKeyRef = useRef(false);

  // Initialize browser speech recognition for instant live preview
  useEffect(() => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onresult = (event: any) => {
        let interim = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          interim += event.results[i][0].transcript;
        }
        setLiveTranscript(interim);
      };

      recognition.onerror = () => {
        // Silent fallback to HF audio
      };

      recognitionRef.current = recognition;
    }
  }, []);

  const startRecording = useCallback(async () => {
    if (isRecording || isTranscribing) return;
    try {
      chunksRef.current = [];
      setLiveTranscript('');

      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          channelCount: 1,
          sampleRate: 16000,
          echoCancellation: true,
          noiseSuppression: true,
        },
      });

      setMediaStream(stream);

      // Support webm or wav
      const mimeType = MediaRecorder.isTypeSupported('audio/webm;codecs=opus')
        ? 'audio/webm;codecs=opus'
        : 'audio/webm';

      const recorder = new MediaRecorder(stream, { mimeType });

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunksRef.current.push(e.data);
        }
      };

      recorder.onstop = async () => {
        const audioBlob = new Blob(chunksRef.current, { type: mimeType });

        // Clean up mic stream
        stream.getTracks().forEach((track) => track.stop());
        setMediaStream(null);

        setIsTranscribing(true);

        try {
          let text = '';
          try {
            // Priority 1: Whisper via HF
            text = await api.transcribeAudio(audioBlob);
          } catch (hfErr: any) {
            console.warn('HF Whisper error, using browser speech fallback:', hfErr.message);
            // Priority 2: Browser recognition result fallback
            text = liveTranscript;
            if (!text) throw hfErr;
          }

          if (text.trim()) {
            // Track words for Wispr Flow challenge leaderboard
            const words = text.trim().split(/\s+/).length;
            const currentTotal = parseInt(localStorage.getItem('devflow_wispr_words') || '0', 10);
            localStorage.setItem('devflow_wispr_words', (currentTotal + words).toString());

            onTranscribed(text.trim());
          } else {
            onError('No clear voice detected. Try speaking closer to mic.');
          }
        } catch (err: any) {
          onError(err.message || 'Transcription failed.');
        } finally {
          setIsTranscribing(false);
          setLiveTranscript('');
        }
      };

      mediaRecorderRef.current = recorder;
      recorder.start(100);
      setIsRecording(true);

      // Start live speech preview if supported
      try {
        recognitionRef.current?.start();
      } catch {
        // ignore already started
      }
    } catch (err: any) {
      onError('Microphone permission denied or not available.');
    }
  }, [isRecording, isTranscribing, liveTranscript, onTranscribed, onError]);

  const stopRecording = useCallback(() => {
    if (!isRecording) return;
    setIsRecording(false);

    try {
      recognitionRef.current?.stop();
    } catch {
      // ignore
    }

    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }
  }, [isRecording]);

  // Global Push-To-Talk via Spacebar (holding)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if user is typing in an input or textarea or modal
      const activeTag = (document.activeElement?.tagName || '').toLowerCase();
      if (activeTag === 'input' || activeTag === 'textarea') return;

      if (e.code === 'Space' && !e.repeat && !isHoldingKeyRef.current) {
        e.preventDefault();
        isHoldingKeyRef.current = true;
        startRecording();
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.code === 'Space' && isHoldingKeyRef.current) {
        e.preventDefault();
        isHoldingKeyRef.current = false;
        stopRecording();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [startRecording, stopRecording]);

  return {
    isRecording,
    isTranscribing,
    liveTranscript,
    mediaStream,
    startRecording,
    stopRecording,
  };
};
