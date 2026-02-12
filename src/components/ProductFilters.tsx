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
    <div className="bg-gradient-to-br from-gray-900/80 to-card-bg/50 border border-gray-800/50 rounded-2xl p-6 backdrop-blur-sm shadow-xl">
      <div className="flex items-center justify-between gap-6 flex-wrap">
        <div className="flex items-center gap-6 flex-wrap">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-500/10 rounded-lg">
              <Sliders className="w-5 h-5 text-blue-400" />
            </div>
            <span className="text-lg font-semibold text-white">Filter</span>
          </div>

          <div className="h-8 w-px bg-gray-700/50"></div>

          <div className="flex flex-wrap gap-2.5">
            {availableFilters.tags.map(tag => (
              <button
                key={tag}
                onClick={() => toggleTag(tag)}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-all transform hover:scale-105 ${
                  activeFilters.tags.includes(tag)
                    ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg shadow-blue-500/30'
                    : 'bg-card-hover/70 text-gray-300 hover:bg-card-hover border border-gray-700/50'
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
            className="px-4 py-2 text-sm text-white bg-red-500/20 hover:bg-red-500/30 border border-red-500/50 rounded-lg transition-all flex items-center gap-2 font-medium hover:scale-105 transform"
          >
            <X className="w-4 h-4" />
            ZurÃ¼cksetzen
          </button>
        )}
      </div>
    </div>
  );
}
