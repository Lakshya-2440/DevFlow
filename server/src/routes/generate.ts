import { Router, Request, Response } from 'express';
import { hfService } from '../services/hfService';
import { gitService } from '../services/gitService';

export const generateRouter = Router();

generateRouter.post('/', async (req: Request, res: Response): Promise<void> => {
  try {
    const { prompt, mode, model, includeContext } = req.body;

    if (!prompt || typeof prompt !== 'string') {
      res.status(400).json({ error: 'Valid prompt string is required.' });
      return;
    }

    const clientToken =
      (req.headers['x-hf-token'] as string) || (req.body.token as string);

    let workspaceContext = req.body.workspaceContext || '';

    // If requested and not explicitly passed, auto-fetch git status & diff
    if (includeContext && !workspaceContext) {
      const status = await gitService.getStatus();
      const diff = await gitService.getDiff();
      workspaceContext = `Branch: ${status.branch}\nModified files:\n${status.dirtyFiles.join(
        '\n'
      )}\n\nRecent diff:\n${diff.slice(0, 3000)}`;
    }

    const response = await hfService.generateDevResponse(
      prompt,
      workspaceContext,
      mode || 'auto',
      clientToken,
      model
    );

    res.json({
      success: true,
      data: response,
    });
  } catch (error: any) {
    console.error('Generate route error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Generation failed',
    });
  }
});
