import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('mermaid', () => ({
  default: {
    initialize: vi.fn(),
  },
}));

import mermaid from 'mermaid';
import { ensureMermaidInitialized } from '../src/lib/mermaid';

describe('ensureMermaidInitialized', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('configures mermaid with strict securityLevel to prevent XSS vulnerabilities', () => {
    ensureMermaidInitialized();

    expect(mermaid.initialize).toHaveBeenCalledTimes(1);
    expect(mermaid.initialize).toHaveBeenCalledWith(
      expect.objectContaining({
        securityLevel: 'strict',
      }),
    );

    // Call again to verify idempotent initialization
    ensureMermaidInitialized();
    expect(mermaid.initialize).toHaveBeenCalledTimes(1);
  });
});
