import mermaid from 'mermaid';

let isInitialized = false;

/**
 * Performance Optimization:
 * Ensures `mermaid.initialize` is called exactly once per browser session.
 * Prevents redundant global re-initializations and configuration object re-parsing
 * when multiple diagram components mount or switch tabs.
 */
export function ensureMermaidInitialized() {
  if (isInitialized) return;
  mermaid.initialize({
    startOnLoad: false,
    theme: 'base',
    securityLevel: 'loose',
    fontFamily: 'Inter',
    themeVariables: {
      darkMode: false,
      background: '#fcfcfb',
      primaryColor: '#f7f5f2',
      primaryTextColor: '#1f1f1f',
      primaryBorderColor: '#ddd8d2',
      lineColor: '#8a867f',
      secondaryColor: '#f1efec',
      tertiaryColor: '#f6f4f1',
    },
  });
  isInitialized = true;
}
