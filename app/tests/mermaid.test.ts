import { describe, it, expect, vi } from 'vitest';

vi.mock('mermaid', () => ({
  default: {
    initialize: vi.fn(),
  },
}));

import mermaid from 'mermaid';
import { ensureMermaidInitialized } from '../src/lib/mermaid';

describe('ensureMermaidInitialized', () => {
  it('initializes mermaid with strict securityLevel to prevent XSS', () => {
    ensureMermaidInitialized();

    expect(mermaid.initialize).toHaveBeenCalledTimes(1);
    expect(mermaid.initialize).toHaveBeenCalledWith(
      expect.objectContaining({
        securityLevel: 'strict',
      }),
    );
  });
});
