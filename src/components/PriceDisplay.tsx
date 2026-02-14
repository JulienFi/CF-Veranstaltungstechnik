import type { PriceMode } from '../utils/price';
import { formatCentsEUR, netToGrossCents, normalizeVatRate } from '../utils/price';

interface PriceDisplayProps {
  priceNet: number | null | undefined;
  showPrice: boolean | null | undefined;
  vatRate: number | null | undefined;
  mode: PriceMode;
  prefix?: string;
}

export default function PriceDisplay({
  priceNet,
  showPrice,
  vatRate,
  mode,
  prefix,
}: PriceDisplayProps) {
  if (!showPrice || priceNet === null || priceNet === undefined) {
    return (
      <div>
        <div className="font-semibold text-gray-100">Preis auf Anfrage</div>
      </div>
    );
  }

  const vatFactor = normalizeVatRate(vatRate);
  const value = mode === 'gross' ? netToGrossCents(priceNet, vatFactor) : priceNet;
  const displayValue = `${prefix ? `${prefix} ` : ''}${formatCentsEUR(value)}`;

  return (
    <div>
      <div className="font-semibold text-primary-300">{displayValue}</div>
      <p className="text-xs text-gray-400">{mode === 'gross' ? 'inkl. MwSt.' : 'zzgl. MwSt.'}</p>
    </div>
  );
}
