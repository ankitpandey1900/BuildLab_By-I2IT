import { ProjectReadme } from '../types';

/**
 * Extracts GitHub owner and repository name from various URL formats
 * e.g., https://github.com/college-dev/campus-shuttle-tracker -> { owner: 'college-dev', repo: 'campus-shuttle-tracker' }
 */
export function parseGithubUrl(url: string): { owner: string; repo: string } | null {
  if (!url) return null;
  try {
    const cleaned = url.trim().replace(/\/+$/, '').replace(/\.git$/, '');
    const match = cleaned.match(/github\.com\/([^/]+)\/([^/]+)/i);
    if (match && match[1] && match[2]) {
      return { owner: match[1], repo: match[2] };
    }
    // Also support "owner/repo" shorthand
    const parts = cleaned.split('/');
    if (parts.length === 2 && !parts[0].includes(':') && !parts[1].includes('.')) {
      return { owner: parts[0], repo: parts[1] };
    }
  } catch {
    return null;
  }
  return null;
}

/**
 * Attempts to fetch raw README.md directly from GitHub with CORS-friendly raw URLs
 */
export async function fetchReadmeFromGithub(repoUrl: string): Promise<{
  markdown: string;
  source: 'github_auto';
  fileSize: string;
}> {
  const parsed = parseGithubUrl(repoUrl);
  if (!parsed) {
    throw new Error('Please enter a valid GitHub repository URL (e.g., https://github.com/owner/repo)');
  }

  const { owner, repo } = parsed;

  // Candidates list: HEAD -> main -> master -> GitHub API
  const endpoints = [
    `https://raw.githubusercontent.com/${owner}/${repo}/HEAD/README.md`,
    `https://raw.githubusercontent.com/${owner}/${repo}/main/README.md`,
    `https://raw.githubusercontent.com/${owner}/${repo}/master/README.md`,
    `https://raw.githubusercontent.com/${owner}/${repo}/main/readme.md`,
    `https://raw.githubusercontent.com/${owner}/${repo}/master/readme.md`
  ];

  for (const url of endpoints) {
    try {
      const res = await fetch(url);
      if (res.ok) {
        const text = await res.text();
        if (text && text.trim().length > 10) {
          const sizeKb = (new Blob([text]).size / 1024).toFixed(1);
          return {
            markdown: text,
            source: 'github_auto',
            fileSize: `${sizeKb} KB`
          };
        }
      }
    } catch {
      // Continue to next endpoint candidate
    }
  }

  // Fallback: GitHub REST API
  try {
    const apiRes = await fetch(`https://api.github.com/repos/${owner}/${repo}/readme`, {
      headers: {
        Accept: 'application/vnd.github.v3.raw'
      }
    });
    if (apiRes.ok) {
      const text = await apiRes.text();
      if (text && text.trim().length > 10) {
        const sizeKb = (new Blob([text]).size / 1024).toFixed(1);
        return {
          markdown: text,
          source: 'github_auto',
          fileSize: `${sizeKb} KB`
        };
      }
    }
  } catch {
    // API failed or rate limited
  }

  throw new Error(`Could not locate a public README.md in repository "${owner}/${repo}". The repo might be private or empty.`);
}

/**
 * Reads local uploaded file as text
 */
export function readUploadedFileAsText(file: File): Promise<{
  markdown: string;
  fileName: string;
  fileSize: string;
}> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      if (typeof content === 'string') {
        const sizeKb = (file.size / 1024).toFixed(1);
        resolve({
          markdown: content,
          fileName: file.name,
          fileSize: `${sizeKb} KB`
        });
      } else {
        reject(new Error('Failed to read file as text.'));
      }
    };
    reader.onerror = () => reject(new Error('File reading error.'));
    reader.readAsText(file);
  });
}

/**
 * Parses raw Markdown text into a structured ProjectReadme object
 */
export function parseReadmeMarkdown(
  markdown: string, 
  _projectName?: string,
  source: 'github_auto' | 'file_upload' | 'manual' | 'preset' = 'manual',
  fileName: string = 'README.md',
  fileSize?: string
): ProjectReadme {
  const lines = markdown.split('\n');

  // 1. Extract blockquote / problem callout
  let summary = '';
  for (const line of lines) {
    if (line.trim().startsWith('>')) {
      summary = line.replace(/^>+\s*/, '').trim();
      if (summary) break;
    }
  }

  // 2. Extract feature checklists (- [x] Feature or - [ ] Feature)
  const features: { title: string; status: 'completed' | 'in_progress' | 'planned'; description: string }[] = [];
  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed.startsWith('- [x]') || trimmed.startsWith('* [x]')) {
      const title = trimmed.replace(/^[-*]\s*\[x\]\s*/i, '').replace(/[*_`]/g, '').trim();
      if (title) {
        features.push({ title, status: 'completed', description: 'Implemented in codebase' });
      }
    } else if (trimmed.startsWith('- [ ]') || trimmed.startsWith('* [ ]')) {
      const title = trimmed.replace(/^[-*]\s*\[\s*\]\s*/i, '').replace(/[*_`]/g, '').trim();
      if (title) {
        features.push({ title, status: 'in_progress', description: 'Currently in development / planned' });
      }
    }
  }

  // 3. Extract quickstart code blocks
  const quickstartCommands: { step: string; command: string; explanation?: string }[] = [];
  let inCodeBlock = false;
  let codeBuffer: string[] = [];
  for (const line of lines) {
    if (line.trim().startsWith('```bash') || line.trim().startsWith('```sh') || line.trim().startsWith('```shell')) {
      inCodeBlock = true;
      codeBuffer = [];
      continue;
    }
    if (inCodeBlock) {
      if (line.trim().startsWith('```')) {
        inCodeBlock = false;
        const joined = codeBuffer.join('\n').trim();
        if (joined) {
          quickstartCommands.push({
            step: `Step ${quickstartCommands.length + 1}`,
            command: joined
          });
        }
      } else {
        codeBuffer.push(line);
      }
    }
  }

  const calcSize = fileSize || `${(new Blob([markdown]).size / 1024).toFixed(1)} KB`;

  return {
    rawMarkdown: markdown,
    source,
    lastFetchedAt: 'Just now',
    fileName,
    fileSize: calcSize,
    extractedSummary: summary ? summary.replace(/[*_`]/g, '').trim() : undefined,
    badgeTags: [
      { label: 'Source', value: source === 'github_auto' ? 'GitHub' : source === 'file_upload' ? 'Uploaded' : 'Markdown', color: 'blue' },
      { label: 'Status', value: 'Ready', color: 'emerald' },
      { label: 'Campus', value: 'Verified', color: 'violet' }
    ],
    features: features.length > 0 ? features.slice(0, 8) : undefined,
    quickstartCommands: quickstartCommands.length > 0 ? quickstartCommands : undefined
  };
}

