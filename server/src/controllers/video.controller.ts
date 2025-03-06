import type { Request, Response } from 'express';
import mediaService from '../services'; 

class VideoController {
  async mergeVideoAudio(req: Request, res: Response) {
    console.log("test", req.body)
    try {
      const { videoUrl, audioUrl } = req.body;
      const result = await mediaService.mergeVideoAudio(videoUrl, audioUrl);
      
      res.json({
        status: 'completed',
        videoUrl: result
      });
    } catch (error) {
      res.status(500).json({ error: 'Processing failed' });
    }
  }
}

export default new VideoController();