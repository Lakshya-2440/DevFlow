import { exec } from 'child_process';
import { promisify } from 'util';
import path from 'path';

const execAsync = promisify(exec);

export interface WorkspaceStatus {
  isGitRepo: boolean;
  branch: string;
  dirtyFiles: string[];
  recentCommits: string[];
  cwd: string;
}

export class GitService {
  private workspaceDir: string;

  constructor() {
    this.workspaceDir = process.env.WORKSPACE_DIR || process.cwd();
  }

  setWorkspaceDir(dir: string) {
    this.workspaceDir = dir;
  }

  getWorkspaceDir(): string {
    return this.workspaceDir;
  }

  async getStatus(): Promise<WorkspaceStatus> {
    try {
      const { stdout: branch } = await execAsync('git branch --show-current', {
        cwd: this.workspaceDir,
      });

      const { stdout: status } = await execAsync('git status --porcelain', {
        cwd: this.workspaceDir,
      });

      const { stdout: log } = await execAsync('git log -n 5 --oneline', {
        cwd: this.workspaceDir,
      }).catch(() => ({ stdout: 'No commits yet.' }));

      const dirtyFiles = status
        .split('\n')
        .map((l) => l.trim())
        .filter(Boolean);

      const recentCommits = log
        .split('\n')
        .map((l) => l.trim())
        .filter(Boolean);

      return {
        isGitRepo: true,
        branch: branch.trim() || 'main',
        dirtyFiles,
        recentCommits,
        cwd: path.resolve(this.workspaceDir),
      };
    } catch {
      return {
        isGitRepo: false,
        branch: 'none',
        dirtyFiles: [],
        recentCommits: [],
        cwd: path.resolve(this.workspaceDir),
      };
    }
  }

  async getDiff(): Promise<string> {
    try {
      const { stdout: unstaged } = await execAsync('git diff', {
        cwd: this.workspaceDir,
      });
      const { stdout: staged } = await execAsync('git diff --staged', {
        cwd: this.workspaceDir,
      });

      const combined = [
        unstaged ? `--- UNSTAGED CHANGES ---\n${unstaged}` : '',
        staged ? `--- STAGED CHANGES ---\n${staged}` : '',
      ]
        .filter(Boolean)
        .join('\n\n');

      return combined || 'Clean working tree. No changes detected.';
    } catch (err: any) {
      return `Failed to inspect git diff: ${err.message}`;
    }
  }

  async executeCommand(
    command: string
  ): Promise<{ stdout: string; stderr: string; exitCode: number }> {
    // Safety verification check: prevent catastrophic commands
    const blockedPatterns = [/rm\s+-rf\s+\/($|\s)/, /mkfs/, />\s*\/dev\/sd/, /chmod\s+-R\s+777\s+\//];
    for (const pattern of blockedPatterns) {
      if (pattern.test(command)) {
        throw new Error('Command blocked by safety filter: catastrophic filesystem risk.');
      }
    }

    try {
      const { stdout, stderr } = await execAsync(command, {
        cwd: this.workspaceDir,
        timeout: 30000,
        maxBuffer: 1024 * 1024 * 5, // 5MB buffer
      });

      return {
        stdout: stdout.trim(),
        stderr: stderr.trim(),
        exitCode: 0,
      };
    } catch (err: any) {
      return {
        stdout: err.stdout?.trim() || '',
        stderr: err.stderr?.trim() || err.message,
        exitCode: err.code || 1,
      };
    }
  }
}

export const gitService = new GitService();
