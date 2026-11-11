import { beforeEach, describe, expect, it, vi } from 'vitest';

const initializeMock = vi.fn();

vi.mock('mermaid', () => ({
  default: {
    initialize: initializeMock,
  },
}));

describe('mermaid initialization security', () => {
  beforeEach(() => {
    vi.resetModules();
    initializeMock.mockClear();
  });

  it('configures securityLevel: "strict" to protect against XSS', async () => {
    const { ensureMermaidInitialized } = await import('../src/lib/mermaid');

    ensureMermaidInitialized();

    expect(initializeMock).toHaveBeenCalledTimes(1);
    const config = initializeMock.mock.calls[0][0];
    expect(config.securityLevel).toBe('strict');
  });

  it('initializes only once per session', async () => {
    const { ensureMermaidInitialized } = await import('../src/lib/mermaid');

    ensureMermaidInitialized();
    ensureMermaidInitialized();

    expect(initializeMock).toHaveBeenCalledTimes(1);
  });
});
