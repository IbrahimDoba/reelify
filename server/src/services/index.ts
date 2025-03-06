import mediaProcessingService from './media-processing.service';

// Re-export the main service
export default mediaProcessingService;

// Export other services for direct access if needed
export { default as ffmpegService } from './ffmpeg.service';
export { default as speechToTextService } from './speech-to-text.service';
export { default as subtitleService } from './subtitle.service';
export { default as uploadService } from './upload.service';