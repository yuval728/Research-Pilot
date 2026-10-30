import { describe, it, expect, vi, beforeEach } from 'vitest';
import mermaid from 'mermaid';
import { ensureMermaidInitialized } from '../src/lib/mermaid';

vi.mock('mermaid', () => ({
  default: {
    initialize: vi.fn(),
  },
}));

describe('mermaid configuration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('initializes mermaid with securityLevel: strict', () => {
    ensureMermaidInitialized();
    expect(mermaid.initialize).toHaveBeenCalledWith(
      expect.objectContaining({
        securityLevel: 'strict',
      }),
    );
  });
});
