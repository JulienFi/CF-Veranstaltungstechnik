import { usePriceMode } from '../hooks/usePriceMode';

interface PriceModeToggleProps {
  className?: string;
}

export default function PriceModeToggle({ className }: PriceModeToggleProps) {
  const { priceMode, setPriceMode } = usePriceMode();

  return (
    <div className={className}>
      <div className="glass-panel--soft card-inner border-subtle inline-flex flex-wrap items-center justify-center gap-1 p-1">
        <button
          type="button"
          onClick={() => setPriceMode('gross')}
          aria-pressed={priceMode === 'gross'}
          className={`focus-ring tap-target interactive rounded-md px-3 py-2 text-sm font-medium ${
            priceMode === 'gross'
              ? 'bg-primary-500 text-white shadow-md shadow-blue-900/30'
              : 'text-gray-300 hover:bg-card-hover/90 hover:text-white'
          }`}
        >
          Privat (Brutto)
        </button>
        <button
          type="button"
          onClick={() => setPriceMode('net')}
          aria-pressed={priceMode === 'net'}
          className={`focus-ring tap-target interactive rounded-md px-3 py-2 text-sm font-medium ${
            priceMode === 'net'
              ? 'bg-primary-500 text-white shadow-md shadow-blue-900/30'
              : 'text-gray-300 hover:bg-card-hover/90 hover:text-white'
          }`}
        >
          Business (Netto)
        </button>
      </div>
    </div>
  );
}
