import { useEffect, useState } from 'react';
import { Search, X } from 'lucide-react';

interface SearchBarProps {
  onSearch: (query: string) => void;
  placeholder?: string;
  debounceMs?: number;
  initialQuery?: string;
}

export default function SearchBar({
  onSearch,
  placeholder = 'Technik im Mietshop suchen...',
  debounceMs = 250,
  initialQuery = '',
}: SearchBarProps) {
  const [query, setQuery] = useState(initialQuery);

  useEffect(() => {
    setQuery(initialQuery);
  }, [initialQuery]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      onSearch(query.trim());
    }, debounceMs);

    return () => {
      window.clearTimeout(timer);
    };
  }, [query, debounceMs, onSearch]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(query.trim());
  };

  const handleClear = () => {
    setQuery('');
    onSearch('');
  };

  return (
    <form onSubmit={handleSubmit} role="search" className="relative w-full max-w-2xl">
      <div className="glass-panel--soft card-inner border-subtle relative">
        <Search className="icon-std absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={placeholder}
          autoComplete="off"
          enterKeyHint="search"
          className="field-control focus-ring border-0 bg-transparent py-3 pl-12 pr-12"
          aria-label="Produktsuche im Mietshop"
        />
        {query && (
          <button
            type="button"
            onClick={handleClear}
            className="focus-ring tap-target interactive absolute right-2 top-1/2 inline-flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-lg text-gray-400 transition-colors hover:text-white"
            aria-label="Suche leeren"
          >
            <X className="icon-std" />
          </button>
        )}
      </div>
    </form>
  );
}
