import { useState, useEffect, useRef } from 'react';
import { Search, X, Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

interface SearchBarProps {
  onSearch: (query: string) => void;
  className?: string;
  /** Shows a spinner while semantic search is in flight */
  isSearching?: boolean;
  placeholder?: string;
  helperText?: string;
  /** Debounce delay in ms to avoid thrashing backend search and LLM embedding APIs */
  debounceMs?: number;
}

export function SearchBar({
  onSearch,
  className,
  isSearching = false,
  placeholder = 'Search papers by concept, method, architecture...',
  helperText = 'Use natural language to find relevant papers in your library.',
  debounceMs = 300,
}: SearchBarProps) {
  const [query, setQuery] = useState('');
  const isFirstRender = useRef(true);
  const onSearchRef = useRef(onSearch);

  useEffect(() => {
    onSearchRef.current = onSearch;
  }, [onSearch]);

  // Performance Optimization:
  // Debouncing onSearch avoids triggering an external LLM embedding API call
  // (`aembedding`) and PostgreSQL pgvector distance calculation on every single
  // keystroke as the user types. For a 10-character search, this reduces backend
  // network requests and embedding API overhead by ~90%.
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }

    if (!query.trim()) {
      onSearchRef.current('');
      return;
    }

    const timer = setTimeout(() => {
      onSearchRef.current(query);
    }, debounceMs);

    return () => clearTimeout(timer);
  }, [query, debounceMs]);

  const handleClear = () => {
    setQuery('');
  };

  return (
    <div className={cn('space-y-2', className)}>
      <div className="relative group rounded-xl border border-border bg-card/60 backdrop-blur-sm transition-colors focus-within:border-primary/70">
        {isSearching ? (
          <Loader2 className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-primary animate-spin" />
        ) : (
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
        )}

        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={placeholder}
          className="h-14 border-0 bg-transparent pl-11 pr-12 text-lg text-foreground placeholder:text-muted-foreground/80 focus-visible:ring-0"
        />

        {query && (
          <button
            onClick={handleClear}
            className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 hover:bg-secondary rounded-md text-muted-foreground"
            aria-label="Clear search"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      <p className="text-[10px] text-muted-foreground font-semibold uppercase tracking-[0.14em]">
        {isSearching ? 'Searching...' : helperText}
      </p>
    </div>
  );
}
