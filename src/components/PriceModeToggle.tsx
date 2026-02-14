import { usePriceMode } from '../hooks/usePriceMode';

interface PriceModeToggleProps {
  className?: string;
}

export default function PriceModeToggle({ className }: PriceModeToggleProps) {
  const { priceMode, setPriceMode } = usePriceMode();

  return (
    <div className={className}>
      <div className="inline-flex flex-wrap items-center justify-center rounded-lg border border-gray-700 bg-card-bg/80 p-1 gap-1">
        <button
          type="button"
          onClick={() => setPriceMode('gross')}
          className={`px-3 py-2 text-sm rounded-md transition-colors ${
            priceMode === 'gross' ? 'bg-primary-500 text-white' : 'text-gray-300 hover:bg-card-hover'
          }`}
        >
          Privat (Brutto)
        </button>
        <button
          type="button"
          onClick={() => setPriceMode('net')}
          className={`px-3 py-2 text-sm rounded-md transition-colors ${
            priceMode === 'net' ? 'bg-primary-500 text-white' : 'text-gray-300 hover:bg-card-hover'
          }`}
        >
          Business (Netto)
        </button>
      </div>
    </div>
  );
}
