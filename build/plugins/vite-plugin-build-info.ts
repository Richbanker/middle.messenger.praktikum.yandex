import type { Plugin } from 'vite';
import { readFileSync } from 'fs';
import { execSync } from 'child_process';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import { writeFileSync } from 'fs';

const __dirname = dirname(fileURLToPath(import.meta.url));

interface BuildInfo {
  version: string;
  buildTime: string;
  buildMode: 'development' | 'production';
  gitCommit?: string;
  gitBranch?: string;
}

interface PluginOptions {
  outputFile?: string;
  includeGitInfo?: boolean;
}

function getGitCommit(): string | undefined {
  try {
    return execSync('git rev-parse HEAD', { encoding: 'utf-8', stdio: 'pipe' }).trim();
  } catch {
    return undefined;
  }
}

function getGitBranch(): string | undefined {
  try {
    return execSync('git rev-parse --abbrev-ref HEAD', { encoding: 'utf-8', stdio: 'pipe' }).trim();
  } catch {
    return undefined;
  }
}

function getPackageVersion(): string {
  try {
    const packagePath = resolve(__dirname, '../../package.json');
    const packageJson = JSON.parse(readFileSync(packagePath, 'utf-8'));
    return packageJson.version || '0.0.0';
  } catch (error) {
    throw new Error(`Failed to read package.json: ${error instanceof Error ? error.message : String(error)}`);
  }
}

export function vitePluginBuildInfo(options: PluginOptions = {}): Plugin {
  const {
    outputFile = 'build-info.json',
    includeGitInfo = true,
  } = options;

  let buildMode: 'development' | 'production' = 'production';
  let outDir: string;

  return {
    name: 'vite-plugin-build-info',
    configResolved(config) {
      buildMode = config.mode === 'development' ? 'development' : 'production';
      outDir = config.build.outDir || 'dist';
    },
    buildStart() {
      const buildInfo: BuildInfo = {
        version: getPackageVersion(),
        buildTime: new Date().toISOString(),
        buildMode,
      };

      if (includeGitInfo) {
        const gitCommit = getGitCommit();
        const gitBranch = getGitBranch();
        
        if (gitCommit) {
          buildInfo.gitCommit = gitCommit;
        }
        if (gitBranch) {
          buildInfo.gitBranch = gitBranch;
        }
      }

      const outputPath = resolve(process.cwd(), outDir, outputFile);
      const buildInfoJson = JSON.stringify(buildInfo, null, 2);

      try {
        writeFileSync(outputPath, buildInfoJson, 'utf-8');
        console.log(`✓ Build info written to ${outputPath}`);
      } catch (error) {
        throw new Error(
          `Failed to write build-info.json: ${error instanceof Error ? error.message : String(error)}`
        );
      }
    },
  };
}

