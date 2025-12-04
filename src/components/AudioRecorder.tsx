import React from 'react';
import { Mic, Square, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAudioRecorder, RecordingState } from '@/hooks/useAudioRecorder';

interface AudioRecorderProps {
  onTranscription: (text: string) => void;
  onError: (error: string) => void;
  onAutoSend?: () => void;
  disabled?: boolean;
}

const formatDuration = (seconds: number): string => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
};

const WaveformAnimation: React.FC<{ isRecording: boolean }> = ({ isRecording }) => {
  if (!isRecording) return null;
  
  return (
    <div className="flex items-center space-x-1 ml-2">
      {[0, 1, 2, 3].map((i) => (
        <div
          key={i}
          className={cn(
            "w-1 bg-primary rounded-full",
            i === 0 && "h-2 animate-[bounce_1s_ease-in-out_infinite]",
            i === 1 && "h-3 animate-[bounce_1s_ease-in-out_0.1s_infinite]", 
            i === 2 && "h-4 animate-[bounce_1s_ease-in-out_0.2s_infinite]",
            i === 3 && "h-2 animate-[bounce_1s_ease-in-out_0.3s_infinite]"
          )}
        />
      ))}
    </div>
  );
};

export const AudioRecorder: React.FC<AudioRecorderProps> = ({
  onTranscription,
  onError,
  onAutoSend,
  disabled = false,
}) => {
  const { recordingState, duration, startRecording, stopRecording, error } = useAudioRecorder();

  const handleClick = async () => {
    if (disabled) return;
    
    if (recordingState === 'idle') {
      try {
        await startRecording();
      } catch (err) {
        onError(err instanceof Error ? err.message : 'Failed to start recording');
      }
    } else if (recordingState === 'recording') {
      try {
        const audioBlob = await stopRecording();
        if (audioBlob) {
          // Import transcription service dynamically to avoid circular deps
          const { transcribeAudio } = await import('@/utils/transcription');
          
          try {
            const transcription = await transcribeAudio(audioBlob);
            onTranscription(transcription);
            // Auto-send the message after transcription
            if (onAutoSend && transcription.trim()) {
              setTimeout(() => onAutoSend(), 100); // Small delay to ensure input is updated
            }
          } catch (transcriptionError) {
            onError(transcriptionError instanceof Error ? transcriptionError.message : 'Transcription failed');
          }
        }
      } catch (err) {
        onError(err instanceof Error ? err.message : 'Failed to stop recording');
      }
    }
  };

  // Show error from hook if any
  React.useEffect(() => {
    if (error) {
      onError(error);
    }
  }, [error, onError]);

  const getButtonIcon = () => {
    switch (recordingState) {
      case 'recording':
        return <Square className="h-4 w-4" />;
      case 'processing':
        return <Loader2 className="h-4 w-4 animate-spin" />;
      default:
        return <Mic className="h-4 w-4" />;
    }
  };

  const getButtonClass = () => {
    if (disabled || recordingState === 'processing') {
      return "text-muted-foreground bg-muted cursor-not-allowed";
    }
    
    switch (recordingState) {
      case 'recording':
        return "text-white bg-red-500 hover:bg-red-600 shadow-lg shadow-red-500/25";
      default:
        return "text-primary-foreground bg-primary hover:bg-primary/90";
    }
  };

  return (
    <div className="flex items-center">
      <button
        type="button"
        onClick={handleClick}
        disabled={disabled || recordingState === 'processing'}
        className={cn(
          "rounded-full p-2.5 transition-all duration-200 flex-shrink-0",
          getButtonClass()
        )}
        aria-label={
          recordingState === 'recording' 
            ? 'Stop recording' 
            : recordingState === 'processing'
            ? 'Processing audio...'
            : 'Start recording'
        }
      >
        {getButtonIcon()}
      </button>
      
      {recordingState === 'recording' && (
        <div className="flex items-center ml-2 min-w-0">
          <span className="text-sm font-mono text-red-500 font-medium whitespace-nowrap">
            {formatDuration(duration)}
          </span>
          <WaveformAnimation isRecording={true} />
        </div>
      )}
    </div>
  );
};