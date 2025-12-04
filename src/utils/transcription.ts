import { getValidToken } from './salesforce';
import { apiClientFormData } from './apiClient';

interface TranscriptionResponse {
  transcription: string[];
}

export const transcribeAudio = async (audioBlob: Blob): Promise<string> => {
  try {
    // Get valid Salesforce token (handles refresh if needed)
    const token = await getValidToken();
    
    // Create FormData for the edge function call
    const formData = new FormData();
    
    // Determine file extension based on blob type
    const mimeType = audioBlob.type;
    let filename = 'audio.webm'; // default
    if (mimeType.includes('mp4')) {
      filename = 'audio.mp4';
    } else if (mimeType.includes('wav')) {
      filename = 'audio.wav';
    } else if (mimeType.includes('ogg')) {
      filename = 'audio.ogg';
    }
    
    // Add required form fields for the edge function
    formData.append('audio', audioBlob, filename);
    formData.append('accessToken', token);
    formData.append('language', 'english');
    
    console.log('Sending audio transcription request to local backend...');
    console.log('Audio blob size:', audioBlob.size, 'bytes');
    console.log('Audio blob type:', audioBlob.type);

    // Call the local backend API
    const data = await apiClientFormData('/api/salesforce/transcription', formData);

    console.log('Transcription response:', data);
    
    if (!data.transcription || !Array.isArray(data.transcription) || data.transcription.length === 0) {
      throw new Error('No transcription received. Please try speaking more clearly.');
    }
    
    // Join all transcription segments
    const transcribedText = data.transcription.join(' ').trim();
    
    if (!transcribedText) {
      throw new Error('Empty transcription received. Please try recording again.');
    }
    
    console.log('Transcribed text:', transcribedText);
    return transcribedText;
    
  } catch (error) {
    console.error('Audio transcription error:', error);
    
    if (error instanceof Error) {
      throw error;
    } else {
      throw new Error('An unexpected error occurred during transcription.');
    }
  }
};