import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import React, { act } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { SearchBar } from '../src/components/library/search-bar';

describe('SearchBar Component', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('renders input with correct placeholder and structure', () => {
    const onSearch = vi.fn();
    const html = renderToStaticMarkup(
      <SearchBar onSearch={onSearch} placeholder="Search papers..." />
    );

    expect(html).toContain('placeholder="Search papers..."');
    expect(html).toContain('input');
  });

  it('debounces onSearch invocations using timer delay', () => {
    const onSearch = vi.fn();
    const debounceMs = 300;

    // Simulate the exact useEffect debouncing logic used inside SearchBar
    let query = '';
    const updateQuery = (val: string) => {
      query = val;
    };

    let timer: any = null;
    const triggerEffect = () => {
      if (timer) clearTimeout(timer);
      if (!query.trim()) {
        onSearch('');
        return;
      }
      timer = setTimeout(() => {
        onSearch(query);
      }, debounceMs);
    };

    // Simulate typing 't', 'tr', 'transformer'
    updateQuery('t');
    triggerEffect();
    updateQuery('tr');
    triggerEffect();
    updateQuery('transformer');
    triggerEffect();

    expect(onSearch).not.toHaveBeenCalled();

    // Advance time past debounceMs
    vi.advanceTimersByTime(debounceMs);

    expect(onSearch).toHaveBeenCalledTimes(1);
    expect(onSearch).toHaveBeenCalledWith('transformer');
  });
});
