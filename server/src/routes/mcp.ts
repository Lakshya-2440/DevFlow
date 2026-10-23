import { Router, Request, Response } from 'express';
import { wisprMcpService } from '../services/mcpService';
import { hfService } from '../services/hfService';
import { gitService } from '../services/gitService';

export const mcpRouter = Router();

// Test connection and initialize MCP
mcpRouter.post('/connect', async (req: Request, res: Response): Promise<void> => {
  try {
    const { token } = req.body;
    if (token) {
      wisprMcpService.setAuthToken(token);
    }
    const handshake = await wisprMcpService.initialize();
    const tools = await wisprMcpService.listTools();

    res.json({
      success: true,
      endpoint: wisprMcpService.getEndpoint(),
      handshake,
      tools,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// List available MCP tools
mcpRouter.get('/tools', async (_req: Request, res: Response): Promise<void> => {
  try {
    const tools = await wisprMcpService.listTools();
    res.json({ success: true, tools });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Sync Wispr Notes to Code / Terminal commands
mcpRouter.post('/sync-to-code', async (req: Request, res: Response): Promise<void> => {
  try {
    const { noteText, toolName } = req.body;
    const clientHfToken =
      (req.headers['x-hf-token'] as string) || (req.body.hfToken as string);

    // Call tool if toolName specified
    let contextText = noteText;
    if (toolName) {
      const toolResult = await wisprMcpService.callTool(toolName);
      contextText = toolResult?.content?.[0]?.text || noteText;
    }

    if (!contextText) {
      res.status(400).json({ error: 'No note content provided or retrieved from MCP.' });
      return;
    }

    // Get current git status for grounding
    const status = await gitService.getStatus();
    const workspaceContext = `Current Branch: ${status.branch}\nFiles:\n${status.dirtyFiles.join('\n')}`;

    const prompt = `Here are action items retrieved from Wispr Flow MCP:\n"${contextText}"\nConvert these spoken meeting requirements into exact executable terminal git commands and code modifications for this workspace.`;

    const generated = await hfService.generateDevResponse(
      prompt,
      workspaceContext,
      'auto',
      clientHfToken
    );

    res.json({
      success: true,
      data: generated,
      sourceContext: contextText,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});
