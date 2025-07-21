import React from 'react';
import { useTranscriptSocket } from '@/hooks/useTranscriptSocket';
import { logger } from '@shared/utils/logger';
// Transcript styles are now imported in the main CSS file

interface TranscriptDisplayProps {
  socketUrl: string;
}

const TranscriptDisplay: React.FC<TranscriptDisplayProps> = ({ socketUrl }) => {
  const { transcript, isAssistantSpeaking } = useTranscriptSocket({
    socketUrl,
  });

  return (
    <div className="transcriptContainer">
      <div className="transcriptStatus">
        {isAssistantSpeaking
          ? 'Assistant is speaking...'
          : 'User is speaking...'}
      </div>
      <div className="transcriptText">{transcript}</div>
    </div>
  );
};

export default TranscriptDisplay;
