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
    <div className="glass-panel card">
      <div className="flex flex-wrap items-center justify-between gap-4 md:gap-5">
        <div className="flex flex-wrap items-center gap-4 md:gap-5">
          <div className="flex items-center gap-2.5">
            <div className="glass-panel--soft card-inner border-subtle p-2">
              <Sliders className="icon-std text-blue-400" />
            </div>
            <span className="text-base font-semibold text-white md:text-lg">Filter</span>
          </div>

          <div className="hidden h-8 w-px bg-white/10 md:block"></div>

          <div className="flex flex-wrap gap-2">
            {availableFilters.tags.map(tag => (
              <button
                key={tag}
                onClick={() => toggleTag(tag)}
                className={`focus-ring tap-target interactive rounded-lg px-3.5 py-2 text-sm font-medium ${
                  activeFilters.tags.includes(tag)
                    ? 'border border-blue-400/75 bg-blue-500 text-white shadow-lg shadow-blue-500/30'
                    : 'glass-panel--soft border-subtle text-gray-200 hover:text-white'
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
            className="focus-ring tap-target interactive inline-flex items-center gap-2 rounded-lg border border-red-500/55 bg-red-500/18 px-4 py-2 text-sm font-medium text-white hover:bg-red-500/30"
          >
            <X className="icon-std icon-std--sm" />
            Zurücksetzen
          </button>
        )}
      </div>
    </div>
  );
}
