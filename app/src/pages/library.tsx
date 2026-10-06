import { useState, useEffect, useCallback, useMemo } from 'react';
import { Plus, BookOpen, Filter, Layers3, CheckSquare, Square, Play, X } from 'lucide-react';
import { Header } from '@/components/layout/header';
import { Button } from '@/components/ui/button';
import { SearchBar } from '@/components/library/search-bar';
import { PaperCard } from '@/components/library/paper-card';
import { BatchProgressModal } from '@/components/library/batch-progress-modal';
import { papersApi } from '@/lib/api/papers';
import { pipelineApi } from '@/lib/api/pipeline';
import { searchApi } from '@/lib/api/search';
import { Paper, PaperListItem } from '@/types';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

const SORT_OPTIONS = ['Newest', 'Oldest', 'Title A-Z', 'Title Z-A'] as const;
type SortOption = (typeof SORT_OPTIONS)[number];

export default function LibraryPage() {
  const [papers, setPapers] = useState<Paper[]>([]);
  const [paperItems, setPaperItems] = useState<PaperListItem[]>([]);
  const [searchResults, setSearchResults] = useState<Paper[] | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSearching, setIsSearching] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeDomain, setActiveDomain] = useState('All Domains');
  const [activeSubdomain, setActiveSubdomain] = useState('All Subdomains');
  const [sortBy, setSortBy] = useState<SortOption>('Newest');

  // Multi-select & Batch execution
  const [selectedPaperIds, setSelectedPaperIds] = useState<Set<string>>(new Set());
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [activeBatchId, setActiveBatchId] = useState<string | null>(null);
  const [isBatchModalOpen, setIsBatchModalOpen] = useState(false);
  const [isStartingBatch, setIsStartingBatch] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    const fetchPapers = async () => {
      try {
        const data = await papersApi.listPapers();
        setPaperItems(data);
        setPapers(data.map((item) => item.paper));
      } catch (error) {
        console.error('Failed to fetch papers:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchPapers();
  }, []);

  const handleSearch = useCallback(async (query: string) => {
    setSearchQuery(query);

    if (query.trim().length <= 2) {
      setSearchResults(null);
      return;
    }

    setIsSearching(true);
    try {
      const results = await searchApi.searchPapers(query, 20);
      setSearchResults(results);
    } catch (err) {
      console.error('Search failed:', err);
      setSearchResults(null);
    } finally {
      setIsSearching(false);
    }
  }, []);

  const allPapers = papers.filter((p) => p.metadata);

  const domainOptions = useMemo(() => {
    const set = new Set<string>();
    for (const p of allPapers) {
      if (p.metadata?.domain?.trim()) set.add(p.metadata.domain.trim());
    }
    return ['All Domains', ...Array.from(set).sort((a, b) => a.localeCompare(b))];
  }, [allPapers]);

  const subdomainOptions = useMemo(() => {
    const set = new Set<string>();
    for (const p of allPapers) {
      const md = p.metadata;
      if (!md?.sub_domain?.trim()) continue;
      if (activeDomain !== 'All Domains' && md.domain !== activeDomain) continue;
      set.add(md.sub_domain.trim());
    }
    return ['All Subdomains', ...Array.from(set).sort((a, b) => a.localeCompare(b))];
  }, [allPapers, activeDomain]);

  useEffect(() => {
    if (!subdomainOptions.includes(activeSubdomain)) {
      setActiveSubdomain('All Subdomains');
    }
  }, [activeSubdomain, subdomainOptions]);

  const baseList = searchResults !== null ? searchResults : papers;

  // Bolt Optimization: Memoize filtering and sorting to avoid redundant array
  // allocations and Date/string comparisons on every component re-render.
  const displayPapers = useMemo(() => {
    return baseList
      .filter((p) => {
        if (!p.metadata) return false;

        if (activeDomain !== 'All Domains' && p.metadata.domain !== activeDomain) {
          return false;
        }

        if (
          activeSubdomain !== 'All Subdomains' &&
          p.metadata.sub_domain !== activeSubdomain
        ) {
          return false;
        }

        if (searchResults === null && searchQuery.trim().length > 2) {
          const q = searchQuery.toLowerCase();
          return (
            p.metadata.title.toLowerCase().includes(q) ||
            p.metadata.authors.some((a) => a.toLowerCase().includes(q))
          );
        }
        return true;
      })
      .sort((a, b) => {
        switch (sortBy) {
          case 'Oldest':
            return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
          case 'Title A-Z':
            return (a.metadata?.title ?? '').localeCompare(b.metadata?.title ?? '');
          case 'Title Z-A':
            return (b.metadata?.title ?? '').localeCompare(a.metadata?.title ?? '');
          case 'Newest':
          default:
            return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        }
      });
  }, [baseList, activeDomain, activeSubdomain, searchResults, searchQuery, sortBy]);

  const isEmpty = !isLoading && displayPapers.length === 0;

  // Bolt Optimization: Memoize latest run lookup map creation to prevent Object.fromEntries
  // and array mapping overhead on every render.
  const latestRunByPaperId = useMemo(
    () => Object.fromEntries(paperItems.map((item) => [item.paper.id, item.latest_run])),
    [paperItems],
  );

  const paperTitlesById = useMemo(
    () =>
      Object.fromEntries(
        papers.map((p) => [p.id, p.metadata?.title || 'Untitled Paper']),
      ),
    [papers],
  );

  const handleSelectToggle = useCallback((paperId: string) => {
    setSelectedPaperIds((prev) => {
      const next = new Set(prev);
      if (next.has(paperId)) {
        next.delete(paperId);
      } else {
        next.add(paperId);
      }
      return next;
    });
  }, []);

  const handleSelectAll = useCallback(() => {
    if (selectedPaperIds.size === displayPapers.length) {
      setSelectedPaperIds(new Set());
    } else {
      setSelectedPaperIds(new Set(displayPapers.map((p) => p.id)));
    }
  }, [displayPapers, selectedPaperIds]);

  const handleTriggerBatch = async () => {
    if (selectedPaperIds.size === 0 || isStartingBatch) return;
    setIsStartingBatch(true);
    try {
      const batch = await pipelineApi.triggerBatch(Array.from(selectedPaperIds));
      setActiveBatchId(batch.id);
      setIsBatchModalOpen(true);
      setSelectedPaperIds(new Set());
      setIsSelectionMode(false);
      toast.success(`Batch processing queued for ${batch.total_papers} papers`);
    } catch (err: any) {
      console.error('Failed to trigger batch processing:', err);
      toast.error(err.message || 'Failed to start batch processing');
    } finally {
      setIsStartingBatch(false);
    }
  };

  const handlePublish = (updated: Paper) => {
    setPapers((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
    setPaperItems((prev) =>
      prev.map((item) => (item.paper.id === updated.id ? { ...item, paper: updated } : item)),
    );
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Header title="Library">
        <Button size="sm" className="bg-primary hover:bg-primary/90" onClick={() => navigate('/ingest')}>
          <Plus className="w-4 h-4 mr-2" />
          Add Paper
        </Button>
      </Header>

      <div className="p-8 max-w-6xl mx-auto w-full space-y-8">
        <SearchBar onSearch={handleSearch} isSearching={isSearching} />

        {/* Selection Bar & Controls */}
        <div className="flex flex-wrap items-center justify-between gap-3 bg-secondary/20 p-3 rounded-lg border border-border">
          <div className="flex items-center gap-2">
            <Button
              variant={isSelectionMode ? 'secondary' : 'outline'}
              size="sm"
              onClick={() => {
                if (isSelectionMode) {
                  setIsSelectionMode(false);
                  setSelectedPaperIds(new Set());
                } else {
                  setIsSelectionMode(true);
                }
              }}
              className="h-8 text-xs font-semibold gap-1.5"
            >
              {isSelectionMode ? <X className="w-3.5 h-3.5" /> : <CheckSquare className="w-3.5 h-3.5" />}
              {isSelectionMode ? 'Cancel Selection' : 'Select Papers'}
            </Button>

            {isSelectionMode && displayPapers.length > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleSelectAll}
                className="h-8 text-xs gap-1.5 text-muted-foreground hover:text-foreground"
              >
                {selectedPaperIds.size === displayPapers.length ? (
                  <Square className="w-3.5 h-3.5" />
                ) : (
                  <CheckSquare className="w-3.5 h-3.5" />
                )}
                {selectedPaperIds.size === displayPapers.length ? 'Deselect All' : 'Select All'}
              </Button>
            )}

            {selectedPaperIds.size > 0 && (
              <span className="text-xs font-bold text-primary pl-2">
                {selectedPaperIds.size} paper{selectedPaperIds.size > 1 ? 's' : ''} selected
              </span>
            )}
          </div>

          {selectedPaperIds.size > 0 && (
            <Button
              size="sm"
              onClick={handleTriggerBatch}
              disabled={isStartingBatch}
              className="h-8 text-xs font-bold bg-primary hover:bg-primary/90 gap-1.5 animate-in fade-in"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              {isStartingBatch
                ? 'Queueing…'
                : `Process Selected (${selectedPaperIds.size})`}
            </Button>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-3">
          <div className="relative lg:col-span-1">
            <Layers3 className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
            <select
              value={activeDomain}
              onChange={(e) => {
                setActiveDomain(e.target.value);
                setActiveSubdomain('All Subdomains');
              }}
              className="h-10 w-full rounded-lg border border-border bg-card pl-9 pr-8 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/70"
              aria-label="Filter by domain"
            >
              {domainOptions.map((option) => (
                <option key={option} value={option}>{option}</option>
              ))}
            </select>
          </div>

          <div className="relative lg:col-span-1">
            <Layers3 className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
            <select
              value={activeSubdomain}
              onChange={(e) => setActiveSubdomain(e.target.value)}
              className="h-10 w-full rounded-lg border border-border bg-card pl-9 pr-8 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/70"
              aria-label="Filter by subdomain"
              disabled={subdomainOptions.length <= 1}
            >
              {subdomainOptions.map((option) => (
                <option key={option} value={option}>{option}</option>
              ))}
            </select>
          </div>

          <div className="relative lg:col-span-1 lg:col-start-4">
            <Filter className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortOption)}
              className="h-10 w-full rounded-lg border border-border bg-card pl-9 pr-8 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/70"
              aria-label="Sort papers"
            >
              {SORT_OPTIONS.map((option) => (
                <option key={option} value={option}>
                  Sort: {option}
                </option>
              ))}
            </select>
          </div>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-48 bg-secondary/30 rounded-xl animate-pulse border border-border" />
            ))}
          </div>
        ) : isSearching ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[1, 2].map((i) => (
              <div key={i} className="h-48 bg-secondary/30 rounded-xl animate-pulse border border-border" />
            ))}
          </div>
        ) : !isEmpty ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {displayPapers.map((paper) => (
              <PaperCard
                key={paper.id}
                paper={paper}
                pipelineRun={latestRunByPaperId[paper.id] ?? null}
                onPublish={handlePublish}
                isSelected={selectedPaperIds.has(paper.id)}
                onSelectToggle={isSelectionMode ? handleSelectToggle : undefined}
                selectionMode={isSelectionMode}
              />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
            <div className="w-16 h-16 bg-secondary rounded-full flex items-center justify-center text-muted-foreground">
              <BookOpen className="w-8 h-8" />
            </div>
            <div className="space-y-1">
              <h3 className="text-lg font-semibold">No papers found</h3>
              <p className="text-sm text-muted-foreground max-w-xs">
                {searchQuery
                  ? `No results for "${searchQuery}". Try a different search term.`
                  : 'Add your first paper to get started with AI-powered intelligence.'}
              </p>
            </div>
            {!searchQuery && (
              <Button className="bg-primary" onClick={() => navigate('/ingest')}>
                Add Paper
              </Button>
            )}
          </div>
        )}
      </div>

      <BatchProgressModal
        batchId={activeBatchId}
        isOpen={isBatchModalOpen}
        onClose={() => setIsBatchModalOpen(false)}
        paperTitlesById={paperTitlesById}
      />
    </div>
  );
}
