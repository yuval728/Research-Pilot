import { describe, it, expect, vi, beforeEach } from 'vitest';
import mermaid from 'mermaid';

vi.mock('mermaid', () => ({
  default: {
    initialize: vi.fn(),
  },
}));

describe('ensureMermaidInitialized', () => {
  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
  });

  it('configures mermaid with securityLevel strict', async () => {
    const { ensureMermaidInitialized } = await import('../src/lib/mermaid');

    ensureMermaidInitialized();

    expect(mermaid.initialize).toHaveBeenCalledTimes(1);
    expect(mermaid.initialize).toHaveBeenCalledWith(
      expect.objectContaining({
        securityLevel: 'strict',
        startOnLoad: false,
      }),
    );
  });
});
