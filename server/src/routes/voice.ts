import { Router, Request, Response } from 'express';
import multer from 'multer';
import { hfService } from '../services/hfService';

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 25 * 1024 * 1024 }, // 25MB max
});

export const voiceRouter = Router();

voiceRouter.post(
  '/transcribe',
  upload.single('audio'),
  async (req: Request, res: Response): Promise<void> => {
    try {
      if (!req.file) {
        res.status(400).json({ error: 'No audio file uploaded.' });
        return;
      }

      const clientToken =
        (req.headers['x-hf-token'] as string) || (req.body.token as string);

      const transcription = await hfService.transcribeAudio(
        req.file.buffer,
        clientToken
      );

      res.json({
        success: true,
        transcription,
      });
    } catch (error: any) {
      console.error('Transcription route error:', error);
      res.status(500).json({
        success: false,
        error: error.message || 'Audio transcription failed',
      });
    }
  }
);
