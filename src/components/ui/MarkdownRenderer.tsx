import React, { useState } from 'react';
import { Copy, Check, CheckSquare, Square, Terminal } from 'lucide-react';

interface MarkdownRendererProps {
  content: string;
  className?: string;
}

/**
 * Safely parse and render inline markdown elements:
 * - Badges / linked images: [![alt](imgSrc)](linkUrl)
 * - Direct images: ![alt](imgSrc)
 * - Hyperlinks: [label](url)
 * - Inline code: `code`
 * - Bold: **text** or __text__
 * - Italic: *text* or _text_
 * - Strikethrough: ~~text~~
 */
export const renderInlineMarkdown = (text: string): React.ReactNode => {
  if (!text) return null;

  // Normalize any \r
  const clean = text.replace(/\r/g, '');

  // Tokenize inline markdown patterns
  const inlineRegex = /(!?\[(?:!\[[^\]]*\]\([^)]+\)|[^\]]*)\]\([^)]+\)|`[^`]+`|\*\*\*[^*]+\*\*\*|\*\*[^*]+\*\*|\*[^*]+\*|__[^_]+__|_[^_]+_|~~[^~]+~~)/g;
  const parts = clean.split(inlineRegex);

  return parts.map((part, index) => {
    if (!part) return null;

    // 1. Linked Image / Badge: [![alt](imgSrc)](linkUrl)
    const linkedImgMatch = part.match(/^\[!\[([^\]]*)\]\(([^)]+)\)\]\(([^)]+)\)$/);
    if (linkedImgMatch) {
      const [, alt, imgSrc, linkUrl] = linkedImgMatch;
      return (
        <a 
          key={index} 
          href={linkUrl} 
          target="_blank" 
          rel="noreferrer noopener"
          className="inline-block align-middle mr-1.5 my-0.5 hover:opacity-80 transition-opacity"
        >
          <img src={imgSrc} alt={alt || 'badge'} className="inline-block h-5 max-w-full rounded" />
        </a>
      );
    }

    // 2. Direct Image / Badge: ![alt](imgSrc)
    const imgMatch = part.match(/^!\[([^\]]*)\]\(([^)]+)\)$/);
    if (imgMatch) {
      const [, alt, imgSrc] = imgMatch;
      return (
        <img 
          key={index} 
          src={imgSrc} 
          alt={alt || 'badge'} 
          className="inline-block h-5 max-w-full rounded align-middle mr-1.5 my-0.5" 
        />
      );
    }

    // 3. Hyperlink: [label](url)
    const linkMatch = part.match(/^\[([^\]]+)\]\(([^)]+)\)$/);
    if (linkMatch) {
      const [, label, url] = linkMatch;
      return (
        <a 
          key={index} 
          href={url} 
          target="_blank" 
          rel="noreferrer noopener" 
          className="text-[var(--accent-primary)] hover:underline font-medium inline-flex items-center gap-0.5"
        >
          {renderInlineMarkdown(label)}
        </a>
      );
    }

    // 4. Inline Code: `code`
    const codeMatch = part.match(/^`([^`]+)`$/);
    if (codeMatch) {
      return (
        <code 
          key={index} 
          className="font-mono text-[11.5px] px-1.5 py-0.5 rounded bg-[var(--code-bg)] text-[var(--accent-primary)] border border-[var(--border-subtle)] mx-0.5 font-medium"
        >
          {codeMatch[1]}
        </code>
      );
    }

    // 5. Bold & Italic: ***text***
    const boldItalicMatch = part.match(/^\*\*\*([^*]+)\*\*\*$/);
    if (boldItalicMatch) {
      return <strong key={index} className="font-bold italic text-[var(--text-pure)]">{boldItalicMatch[1]}</strong>;
    }

    // 6. Bold: **text** or __text__
    const boldMatch = part.match(/^(\*\*|__)([^*_]+)(\*\*|__)$/);
    if (boldMatch) {
      return <strong key={index} className="font-bold text-[var(--text-pure)]">{boldMatch[2]}</strong>;
    }

    // 7. Italic: *text* or _text_
    const italicMatch = part.match(/^(\*|_)([^*_]+)(\*|_)$/);
    if (italicMatch) {
      return <em key={index} className="italic text-[var(--text-secondary)]">{italicMatch[2]}</em>;
    }

    // 8. Strikethrough: ~~text~~
    const strikeMatch = part.match(/^~~([^~]+)~~$/);
    if (strikeMatch) {
      return <del key={index} className="line-through text-[var(--text-tertiary)]">{strikeMatch[1]}</del>;
    }

    // Plain text chunk
    return <span key={index}>{part}</span>;
  });
};

interface CodeBlockProps {
  language: string;
  code: string;
}

const CodeBlock: React.FC<CodeBlockProps> = ({ language, code }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="my-4 rounded-xl border border-[var(--border-subtle)] bg-[var(--code-bg)] overflow-hidden shadow-2xs">
      <div className="flex items-center justify-between px-4 py-2 bg-[var(--bg-surface-elevated)] border-b border-[var(--border-subtle)] text-[11px] font-mono">
        <div className="flex items-center gap-2 text-[var(--text-secondary)]">
          <Terminal size={12} className="text-[var(--text-tertiary)]" />
          <span className="font-bold uppercase tracking-wider text-[10.5px]">
            {language || 'bash'}
          </span>
        </div>
        <button
          type="button"
          onClick={handleCopy}
          className="flex items-center gap-1.5 text-[11px] text-[var(--text-secondary)] hover:text-[var(--text-pure)] transition-colors cursor-pointer px-2 py-0.5 rounded hover:bg-[var(--bg-surface)]"
        >
          {copied ? (
            <>
              <Check size={12} className="text-emerald-500" />
              <span className="text-emerald-500 font-medium">Copied!</span>
            </>
          ) : (
            <>
              <Copy size={12} />
              <span>Copy</span>
            </>
          )}
        </button>
      </div>
      <div className="p-4 overflow-x-auto text-[var(--text-primary)] font-mono text-[12.5px] leading-relaxed">
        <pre className="whitespace-pre">{code}</pre>
      </div>
    </div>
  );
};

export const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ content, className = '' }) => {
  if (!content) {
    return (
      <div className="p-8 text-center text-xs text-[var(--text-tertiary)] italic">
        No README documentation provided yet.
      </div>
    );
  }

  // Normalize carriage returns (\r\n -> \n)
  const normalized = content.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
  const rawLines = normalized.split('\n');
  const elements: React.ReactNode[] = [];

  let index = 0;
  let inCodeBlock = false;
  let codeBuffer: string[] = [];
  let codeLanguage = '';

  let inList = false;
  let listItems: React.ReactNode[] = [];
  let isNumberedList = false;

  let inTable = false;
  let tableHeader: string[] = [];
  let tableRows: string[][] = [];

  const flushList = () => {
    if (inList && listItems.length > 0) {
      if (isNumberedList) {
        elements.push(
          <ol key={`ol-${elements.length}`} className="list-decimal list-outside ml-5 my-3 space-y-2 text-[13px] text-[var(--text-secondary)] leading-relaxed">
            {listItems}
          </ol>
        );
      } else {
        elements.push(
          <ul key={`ul-${elements.length}`} className="list-disc list-outside ml-5 my-3 space-y-1.5 text-[13px] text-[var(--text-secondary)] leading-relaxed">
            {listItems}
          </ul>
        );
      }
      listItems = [];
      inList = false;
    }
  };

  const flushTable = () => {
    if (inTable && tableHeader.length > 0) {
      elements.push(
        <div key={`table-${elements.length}`} className="my-5 overflow-x-auto rounded-xl border border-[var(--border-subtle)]">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-[var(--bg-surface-elevated)] border-b border-[var(--border-subtle)] text-[var(--text-pure)]">
                {tableHeader.map((th, hIdx) => (
                  <th key={hIdx} className="px-4 py-2.5 font-bold font-mono text-[11px] tracking-wide">
                    {renderInlineMarkdown(th)}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border-subtle)]">
              {tableRows.map((row, rIdx) => (
                <tr key={rIdx} className="hover:bg-[var(--bg-surface-hover)] transition-colors">
                  {row.map((cell, cIdx) => (
                    <td key={cIdx} className="px-4 py-2.5 text-[var(--text-secondary)] text-[12.5px]">
                      {renderInlineMarkdown(cell)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
      tableHeader = [];
      tableRows = [];
      inTable = false;
    }
  };

  while (index < rawLines.length) {
    const line = rawLines[index];
    const trimmed = line.trim();

    // 1. Fenced Code Blocks (```lang ... ```)
    if (trimmed.startsWith('```')) {
      flushList();
      flushTable();
      if (!inCodeBlock) {
        inCodeBlock = true;
        codeLanguage = trimmed.replace(/^```/, '').trim();
        codeBuffer = [];
      } else {
        inCodeBlock = false;
        elements.push(
          <CodeBlock
            key={`code-${elements.length}`}
            language={codeLanguage}
            code={codeBuffer.join('\n')}
          />
        );
        codeBuffer = [];
        codeLanguage = '';
      }
      index++;
      continue;
    }

    if (inCodeBlock) {
      codeBuffer.push(line);
      index++;
      continue;
    }

    // 2. Tables (| col1 | col2 |)
    if (trimmed.startsWith('|') && trimmed.endsWith('|')) {
      flushList();
      const cells = trimmed
        .slice(1, -1)
        .split('|')
        .map(c => c.trim());

      // Check if it's separator row (e.g. |---|---|)
      const isSeparator = cells.every(c => /^[-:]+$/.test(c));

      if (!inTable) {
        inTable = true;
        tableHeader = cells;
      } else if (!isSeparator) {
        tableRows.push(cells);
      }
      index++;
      continue;
    } else if (inTable) {
      flushTable();
    }

    // 3. Headings (# H1 to ###### H6)
    // Matches # Title, ## Title, ### Title with any spacing
    const headingMatch = trimmed.match(/^(#{1,6})\s+(.*)$/);
    if (headingMatch) {
      flushList();
      flushTable();
      const level = headingMatch[1].length;
      // Strip trailing hashes if user wrote "## Title ##"
      const title = headingMatch[2].replace(/\s+#+\s*$/, '').trim();

      if (level === 1) {
        elements.push(
          <div key={`h1-${elements.length}`} className="pt-2 pb-3 mb-4 border-b border-[var(--border-subtle)] group">
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[var(--text-pure)] flex items-center gap-2">
              <span>{renderInlineMarkdown(title)}</span>
              <span className="opacity-0 group-hover:opacity-40 text-[var(--text-tertiary)] text-base font-mono font-normal transition-opacity">#</span>
            </h1>
          </div>
        );
      } else if (level === 2) {
        elements.push(
          <div key={`h2-${elements.length}`} className="pt-6 pb-2.5 mb-3 border-b border-[var(--border-subtle)] group">
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-[var(--text-pure)] flex items-center gap-2">
              <span>{renderInlineMarkdown(title)}</span>
              <span className="opacity-0 group-hover:opacity-40 text-[var(--text-tertiary)] text-sm font-mono font-normal transition-opacity">#</span>
            </h2>
          </div>
        );
      } else if (level === 3) {
        elements.push(
          <h3 key={`h3-${elements.length}`} className="text-base sm:text-lg font-bold tracking-tight text-[var(--text-pure)] pt-5 pb-1 mb-2">
            {renderInlineMarkdown(title)}
          </h3>
        );
      } else if (level === 4) {
        elements.push(
          <h4 key={`h4-${elements.length}`} className="text-sm font-semibold tracking-tight text-[var(--text-primary)] pt-3 pb-1 mb-1">
            {renderInlineMarkdown(title)}
          </h4>
        );
      } else {
        elements.push(
          <h5 key={`h5-${elements.length}`} className="text-xs font-semibold uppercase tracking-wider text-[var(--text-tertiary)] pt-2 pb-1 font-mono">
            {renderInlineMarkdown(title)}
          </h5>
        );
      }
      index++;
      continue;
    }

    // 4. Horizontal Rules: --- or *** or ___
    if (/^(\*\*\*|---|___)$/.test(trimmed)) {
      flushList();
      flushTable();
      elements.push(
        <hr key={`hr-${elements.length}`} className="my-6 border-[var(--border-subtle)]" />
      );
      index++;
      continue;
    }

    // 5. Blockquotes: > Quote
    if (trimmed.startsWith('>')) {
      flushList();
      flushTable();
      const quoteText = line.replace(/^>+\s*/, '');
      elements.push(
        <blockquote 
          key={`quote-${elements.length}`} 
          className="my-4 pl-4 py-2 border-l-4 border-amber-500/80 dark:border-amber-400/80 bg-amber-500/[0.04] dark:bg-amber-400/[0.05] rounded-r-xl text-[13px] text-[var(--text-secondary)] italic leading-relaxed shadow-2xs"
        >
          {renderInlineMarkdown(quoteText)}
        </blockquote>
      );
      index++;
      continue;
    }

    // 6. Checklists / Tasks: - [x] or - [ ] or * [x] or * [ ]
    const taskMatch = trimmed.match(/^[-*]\s+\[([ xX])\]\s+(.*)$/);
    if (taskMatch) {
      flushList();
      flushTable();
      const isChecked = taskMatch[1].toLowerCase() === 'x';
      const taskText = taskMatch[2];
      elements.push(
        <div 
          key={`task-${elements.length}`} 
          className="flex items-start gap-2.5 my-2 text-[13px] text-[var(--text-secondary)] leading-relaxed"
        >
          {isChecked ? (
            <CheckSquare size={15} className="text-emerald-500 shrink-0 mt-0.5" />
          ) : (
            <Square size={15} className="text-[var(--text-tertiary)] shrink-0 mt-0.5" />
          )}
          <span className={isChecked ? 'text-[var(--text-pure)] font-medium' : ''}>
            {renderInlineMarkdown(taskText)}
          </span>
        </div>
      );
      index++;
      continue;
    }

    // 7. Unordered Lists: - item or * item
    const unorderedMatch = line.match(/^(\s*)[-*]\s+(.*)$/);
    if (unorderedMatch) {
      flushTable();
      if (!inList || isNumberedList) {
        flushList();
        inList = true;
        isNumberedList = false;
      }
      listItems.push(
        <li key={`li-${listItems.length}`} className="leading-relaxed pl-1">
          {renderInlineMarkdown(unorderedMatch[2])}
        </li>
      );
      index++;
      continue;
    }

    // 8. Ordered Lists: 1. item
    const orderedMatch = line.match(/^(\s*)\d+\.\s+(.*)$/);
    if (orderedMatch) {
      flushTable();
      if (!inList || !isNumberedList) {
        flushList();
        inList = true;
        isNumberedList = true;
      }
      listItems.push(
        <li key={`oli-${listItems.length}`} className="leading-relaxed pl-1">
          {renderInlineMarkdown(orderedMatch[2])}
        </li>
      );
      index++;
      continue;
    }

    // 9. Badges / Shields Row: e.g. [![...](...)](...) or ![...](...)
    if (trimmed.startsWith('[![') || (trimmed.startsWith('![') && (trimmed.includes('shields.io') || trimmed.includes('.svg') || trimmed.includes('badge')))) {
      flushList();
      flushTable();
      elements.push(
        <div key={`badges-${elements.length}`} className="my-2.5 flex items-center gap-2 flex-wrap">
          {renderInlineMarkdown(trimmed)}
        </div>
      );
      index++;
      continue;
    }

    // 10. Blank line (spacer)
    if (!trimmed) {
      flushList();
      flushTable();
      index++;
      continue;
    }

    // 11. Normal Paragraph
    flushList();
    flushTable();
    elements.push(
      <p key={`p-${elements.length}`} className="my-3 text-[13.5px] text-[var(--text-secondary)] leading-relaxed font-normal">
        {renderInlineMarkdown(line)}
      </p>
    );
    index++;
  }

  flushList();
  flushTable();

  return (
    <article className={`markdown-document-viewer text-[13.5px] leading-relaxed max-w-none ${className}`}>
      {elements}
    </article>
  );
};
