import React, { useState } from 'react';
import { Copy, Check } from 'lucide-react';

interface MarkdownViewProps {
  content: string;
}

export const MarkdownView: React.FC<MarkdownViewProps> = ({ content }) => {
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const copyToClipboard = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  // Split into paragraphs / code blocks / headers
  const renderFormatted = (text: string) => {
    const lines = text.split('\n');
    const elements: React.ReactNode[] = [];
    let inCodeBlock = false;
    let codeLanguage = '';
    let codeBuffer: string[] = [];
    let tableBuffer: string[] = [];
    let inTable = false;

    const flushTable = (keyIndex: number) => {
      if (tableBuffer.length === 0) return null;
      const rows = tableBuffer.map(row => 
        row.split('|').filter((_, i, arr) => i > 0 && i < arr.length - 1).map(c => c.trim())
      ).filter(r => r.length > 0 && !r[0].startsWith('---') && !r[0].startsWith(':---'));

      if (rows.length === 0) {
        tableBuffer = [];
        return null;
      }

      const headers = rows[0];
      const bodyRows = rows.slice(1);

      tableBuffer = [];
      return (
        <div key={`table-${keyIndex}`} className="overflow-x-auto my-3 rounded-lg border border-slate-700/60 shadow-sm">
          <table className="min-w-full text-xs text-left border-collapse">
            <thead className="bg-slate-800/90 text-sky-300 font-semibold border-b border-slate-700">
              <tr>
                {headers.map((h, i) => (
                  <th key={i} className="px-3 py-2">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 text-slate-300">
              {bodyRows.map((row, rIdx) => (
                <tr key={rIdx} className="hover:bg-slate-800/40">
                  {row.map((cell, cIdx) => (
                    <td key={cIdx} className="px-3 py-2">{formatInline(cell)}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    };

    const formatInline = (str: string): React.ReactNode => {
      // Bold
      const parts = str.split(/(\*\*.*?\*\*|`.*?`|\*.*?\*)/g);
      return parts.map((part, idx) => {
        if (part.startsWith('**') && part.endsWith('**')) {
          return <strong key={idx} className="font-bold text-white">{part.slice(2, -2)}</strong>;
        }
        if (part.startsWith('`') && part.endsWith('`')) {
          return (
            <code key={idx} className="px-1.5 py-0.5 rounded bg-slate-800 text-sky-300 font-mono text-[11px] border border-slate-700/70">
              {part.slice(1, -1)}
            </code>
          );
        }
        if (part.startsWith('*') && part.endsWith('*')) {
          return <em key={idx} className="italic text-slate-300">{part.slice(1, -1)}</em>;
        }
        return part;
      });
    };

    lines.forEach((line, idx) => {
      // Code block start/end
      if (line.trim().startsWith('```')) {
        if (!inCodeBlock) {
          inCodeBlock = true;
          codeLanguage = line.trim().replace('```', '') || 'text';
          codeBuffer = [];
        } else {
          inCodeBlock = false;
          const codeText = codeBuffer.join('\n');
          const currentCodeIdx = idx;
          elements.push(
            <div key={`code-${idx}`} className="my-3 rounded-xl overflow-hidden border border-slate-700/70 bg-slate-900 shadow-md">
              <div className="flex items-center justify-between px-3 py-1.5 bg-slate-800/90 border-b border-slate-700 text-[11px] text-slate-400 font-mono">
                <span>{codeLanguage}</span>
                <button
                  onClick={() => copyToClipboard(codeText, currentCodeIdx)}
                  className="flex items-center gap-1 hover:text-white transition-colors text-slate-400"
                >
                  {copiedIndex === currentCodeIdx ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span className="text-emerald-400 font-semibold">Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy</span>
                    </>
                  )}
                </button>
              </div>
              <pre className="p-3 text-xs font-mono text-emerald-300 overflow-x-auto leading-relaxed">
                <code>{codeText}</code>
              </pre>
            </div>
          );
          codeBuffer = [];
        }
        return;
      }

      if (inCodeBlock) {
        codeBuffer.push(line);
        return;
      }

      // Tables
      if (line.trim().startsWith('|') && line.trim().endsWith('|')) {
        inTable = true;
        tableBuffer.push(line);
        return;
      } else if (inTable) {
        inTable = false;
        const renderedTable = flushTable(idx);
        if (renderedTable) elements.push(renderedTable);
      }

      // Headers
      if (line.startsWith('### ')) {
        elements.push(
          <h3 key={`h3-${idx}`} className="text-sm font-bold text-sky-400 mt-3 mb-1.5 flex items-center gap-1.5">
            {formatInline(line.replace('### ', ''))}
          </h3>
        );
      } else if (line.startsWith('#### ')) {
        elements.push(
          <h4 key={`h4-${idx}`} className="text-xs font-bold text-indigo-300 mt-2.5 mb-1">
            {formatInline(line.replace('#### ', ''))}
          </h4>
        );
      } else if (line.startsWith('## ')) {
        elements.push(
          <h2 key={`h2-${idx}`} className="text-base font-extrabold text-white mt-4 mb-2">
            {formatInline(line.replace('## ', ''))}
          </h2>
        );
      } else if (line.startsWith('- ') || line.startsWith('* ')) {
        elements.push(
          <li key={`li-${idx}`} className="text-xs text-slate-200 ml-4 list-disc mb-1 leading-relaxed">
            {formatInline(line.substring(2))}
          </li>
        );
      } else if (/^\d+\.\s/.test(line)) {
        const text = line.replace(/^\d+\.\s/, '');
        elements.push(
          <li key={`ol-${idx}`} className="text-xs text-slate-200 ml-4 list-decimal mb-1 leading-relaxed">
            {formatInline(text)}
          </li>
        );
      } else if (line.trim() === '---') {
        elements.push(<hr key={`hr-${idx}`} className="my-3 border-slate-700/60" />);
      } else if (line.trim() === '') {
        elements.push(<div key={`sp-${idx}`} className="h-1.5" />);
      } else {
        elements.push(
          <p key={`p-${idx}`} className="text-xs text-slate-200 leading-relaxed mb-1.5">
            {formatInline(line)}
          </p>
        );
      }
    });

    if (inTable && tableBuffer.length > 0) {
      const tbl = flushTable(lines.length);
      if (tbl) elements.push(tbl);
    }

    return elements;
  };

  return <div className="space-y-1">{renderFormatted(content)}</div>;
};
