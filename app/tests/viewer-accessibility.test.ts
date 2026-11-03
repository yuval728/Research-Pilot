import { describe, it, expect } from 'vitest';
import { readFileSync } from 'fs';
import { resolve } from 'path';

describe('Accessibility attributes on icon buttons', () => {
  it('DiagramViewer provides aria-label and title attributes for zoom control icon buttons', () => {
    const fileContent = readFileSync(
      resolve(__dirname, '../src/components/viewer/diagram-viewer.tsx'),
      'utf-8',
    );

    expect(fileContent).toContain('aria-label="Zoom in"');
    expect(fileContent).toContain('title="Zoom in"');
    expect(fileContent).toContain('aria-label="Zoom out"');
    expect(fileContent).toContain('title="Zoom out"');
    expect(fileContent).toContain('aria-label="Reset zoom"');
    expect(fileContent).toContain('title="Reset zoom"');
  });

  it('PaperCard provides aria-label attributes for icon-only action buttons', () => {
    const fileContent = readFileSync(
      resolve(__dirname, '../src/components/library/paper-card.tsx'),
      'utf-8',
    );

    expect(fileContent).toContain('aria-label="View diagrams"');
    expect(fileContent).toContain('aria-label="View code"');
    expect(fileContent).toContain('aria-label="View report"');
  });
});
