import { describe, it, expect, vi, beforeEach } from 'vitest';
import mermaid from 'mermaid';

vi.mock('mermaid', () => ({
  default: {
    initialize: vi.fn(),
  },
}));

describe('ensureMermaidInitialized', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.resetModules();
  });

  it('initializes mermaid with securityLevel: strict', async () => {
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

  it('is idempotent across multiple invocations', async () => {
    const { ensureMermaidInitialized } = await import('../src/lib/mermaid');

    ensureMermaidInitialized();
    ensureMermaidInitialized();

    expect(mermaid.initialize).toHaveBeenCalledTimes(1);
  });
});
