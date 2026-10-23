import { Router, Request, Response } from 'express';
import { gitService } from '../services/gitService';

export const workspaceRouter = Router();

workspaceRouter.get('/status', async (_req: Request, res: Response) => {
  try {
    const status = await gitService.getStatus();
    res.json({ success: true, data: status });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

workspaceRouter.get('/diff', async (_req: Request, res: Response) => {
  try {
    const diff = await gitService.getDiff();
    res.json({ success: true, data: { diff } });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

workspaceRouter.post('/execute', async (req: Request, res: Response): Promise<void> => {
  try {
    const { command } = req.body;
    if (!command || typeof command !== 'string') {
      res.status(400).json({ error: 'Command string is required.' });
      return;
    }

    const result = await gitService.executeCommand(command);
    res.json({
      success: true,
      data: result,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

workspaceRouter.post('/set-dir', (req: Request, res: Response): void => {
  const { path: newPath } = req.body;
  if (newPath && typeof newPath === 'string') {
    gitService.setWorkspaceDir(newPath);
    res.json({ success: true, cwd: gitService.getWorkspaceDir() });
  } else {
    res.status(400).json({ error: 'Directory path is required.' });
  }
});
