import fsPromises from 'node:fs/promises';
import type { WordTimestamp } from './speech-to-text.service';

// Generate subtitle file in VTT format for word-by-word display
export const generateWordByWordSubtitles = async (wordTimestamps: WordTimestamp[], outputPath: string): Promise<void> => {
  try {
    // Create WebVTT content
    let vttContent = 'WEBVTT\n\n';
    
    // Add each word as a separate cue
    for (const { word, start, end } of wordTimestamps) {
      if (word.trim() === '') continue;
      
      // Format the timestamp for WebVTT (HH:MM:SS.mmm)
      const formatTime = (seconds: number) => {
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        const secs = Math.floor(seconds % 60);
        const milliseconds = Math.floor((seconds % 1) * 1000);
        
        return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}.${String(milliseconds).padStart(3, '0')}`;
      };
      
      // Add the cue with styling for center alignment and bold text
      vttContent += `${formatTime(start)} --> ${formatTime(end)}\n`;
      vttContent += `<c.subtitle><b>${word}</b></c>\n\n`;
    }
    
    // Write to file
    await fsPromises.writeFile(outputPath, vttContent);
    console.log(`Subtitle file generated: ${outputPath}`);
  } catch (error) {
    console.error('Error generating subtitles:', error);
    throw error;
  }
};

// Generate SRT format subtitles for better compatibility with FFmpeg
export const generateSRTSubtitles = async (wordTimestamps: WordTimestamp[], outputPath: string): Promise<void> => {
  try {
    let srtContent = '';
    let cueNumber = 1;
    
    // Add each word as a separate cue
    for (const { word, start, end } of wordTimestamps) {
      if (word.trim() === '') continue;
      
      // Format the timestamp for SRT (HH:MM:SS,mmm)
      const formatTime = (seconds: number) => {
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        const secs = Math.floor(seconds % 60);
        const milliseconds = Math.floor((seconds % 1) * 1000);
        
        return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')},${String(milliseconds).padStart(3, '0')}`;
      };
      
      // Add the cue
      srtContent += `${cueNumber}\n`;
      srtContent += `${formatTime(start)} --> ${formatTime(end)}\n`;
      srtContent += `${word}\n\n`;
      
      cueNumber++;
    }
    
    // Write to file
    await fsPromises.writeFile(outputPath, srtContent);
    console.log(`SRT subtitle file generated: ${outputPath}`);
  } catch (error) {
    console.error('Error generating SRT subtitles:', error);
    throw error;
  }
};

export default {
  generateWordByWordSubtitles,
  generateSRTSubtitles
};