import { describe, it, expect } from 'vitest';
import { DiagramViewer } from '../src/components/viewer/diagram-viewer';

describe('DiagramViewer component export', () => {
  it('exports DiagramViewer function', () => {
    expect(typeof DiagramViewer).toBe('function');
  });
});
