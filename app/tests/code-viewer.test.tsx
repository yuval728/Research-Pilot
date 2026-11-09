import { describe, expect, it, vi } from 'vitest';
import React from 'react';
import { renderToString } from 'react-dom/server';
import { CodeViewer } from '../src/components/viewer/code-viewer';

vi.mock('@/lib/api/papers', () => ({
  papersApi: {
    getCodeSource: vi.fn().mockResolvedValue('print("hello")'),
  },
}));

vi.mock('@uiw/react-codemirror', () => ({
  default: () => <div>CodeMirror Mock</div>,
}));

describe('CodeViewer micro-UX', () => {
  it('renders Copy and Download buttons with proper accessible labels', () => {
    const html = renderToString(
      <CodeViewer
        paperId="test-paper-1"
        pythonPath="outputs/test-paper-1/code.py"
        syntheticData="Test synthetic data"
      />,
    );

    expect(html).toContain('Copy code to clipboard');
    expect(html).toContain('Download Python code file');
    expect(html).toContain('implementation.py');
  });

  it('renders Copy button disabled when pythonPath is null', () => {
    const html = renderToString(
      <CodeViewer
        paperId="test-paper-2"
        pythonPath={null}
        syntheticData="Test synthetic data"
      />,
    );

    expect(html).toContain('disabled');
    expect(html).toContain('Copy code to clipboard');
  });
});
