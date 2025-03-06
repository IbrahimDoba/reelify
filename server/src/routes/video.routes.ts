import { Router } from 'express';
import VideoController from '../controllers/video.controller';

const router = Router();
router.post('/merge', VideoController.mergeVideoAudio);
export default router;