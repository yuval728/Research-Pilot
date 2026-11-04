import { describe, it, expect, vi } from 'vitest';
import mermaid from 'mermaid';
import { ensureMermaidInitialized } from '../src/lib/mermaid';

vi.mock('mermaid', () => ({
  default: {
    initialize: vi.fn(),
  },
}));

describe('ensureMermaidInitialized', () => {
  it('initializes mermaid with strict securityLevel to mitigate XSS risks', () => {
    ensureMermaidInitialized();
    expect(mermaid.initialize).toHaveBeenCalledWith(
      expect.objectContaining({
        securityLevel: 'strict',
      }),
    );
  });
});
