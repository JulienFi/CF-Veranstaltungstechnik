import { Sliders, X } from 'lucide-react';

export interface FilterOptions {
  tags: string[];
  categories: string[];
}

export interface ActiveFilters {
  tags: string[];
  category: string;
}

interface ProductFiltersProps {
  availableFilters: FilterOptions;
  activeFilters: ActiveFilters;
  onFilterChange: (filters: ActiveFilters) => void;
}

export default function ProductFilters({ availableFilters, activeFilters, onFilterChange }: ProductFiltersProps) {
  const toggleTag = (tag: string) => {
    const newTags = activeFilters.tags.includes(tag)
      ? activeFilters.tags.filter(t => t !== tag)
      : [...activeFilters.tags, tag];
    onFilterChange({ ...activeFilters, tags: newTags });
  };

  const clearAllFilters = () => {
    onFilterChange({ tags: [], category: '' });
  };

  const hasActiveFilters = activeFilters.tags.length > 0;

  if (availableFilters.tags.length === 0) return null;

  return (
    <div className="glass-panel rounded-2xl p-4 md:p-5">
      <div className="flex flex-wrap items-center justify-between gap-4 md:gap-5">
        <div className="flex flex-wrap items-center gap-4 md:gap-5">
          <div className="flex items-center gap-2.5">
            <div className="rounded-lg bg-blue-500/10 p-2">
              <Sliders className="w-5 h-5 text-blue-400" />
            </div>
            <span className="text-base font-semibold text-white md:text-lg">Filter</span>
          </div>

          <div className="h-7 w-px bg-gray-700/60"></div>

          <div className="flex flex-wrap gap-2">
            {availableFilters.tags.map(tag => (
              <button
                key={tag}
                onClick={() => toggleTag(tag)}
                className={`focus-ring tap-target rounded-lg border px-3.5 py-2 text-sm font-medium transition-all ${
                  activeFilters.tags.includes(tag)
                    ? 'border-blue-400/75 bg-blue-500 text-white shadow-lg shadow-blue-500/30'
                    : 'border-gray-700/70 bg-card-hover/70 text-gray-200 hover:bg-card-hover hover:text-white'
                }`}
              >
                {tag}
              </button>
            ))}
          </div>
        </div>

        {hasActiveFilters && (
          <button
            onClick={clearAllFilters}
            className="focus-ring tap-target inline-flex items-center gap-2 rounded-lg border border-red-500/55 bg-red-500/18 px-4 py-2 text-sm font-medium text-white transition-all hover:bg-red-500/30"
          >
            <X className="w-4 h-4" />
            Zurücksetzen
          </button>
        )}
      </div>
    </div>
  );
}
