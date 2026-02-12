export type PriceMode = 'net' | 'gross';

const DEFAULT_VAT_RATE = 19;

const EUR_FORMATTER = new Intl.NumberFormat('de-DE', {
  style: 'currency',
  currency: 'EUR',
});

export function formatPrice(
  priceNet: number,
  vatRate: number | null | undefined,
  mode: PriceMode
): string {
  const effectiveVatRate =
    typeof vatRate === 'number' && Number.isFinite(vatRate) ? vatRate : DEFAULT_VAT_RATE;

  const grossPrice = priceNet * (1 + effectiveVatRate / 100);
  const amount = mode === 'gross' ? grossPrice : priceNet;

  // Prevent floating-point artifacts before formatting.
  const roundedAmount = Math.round(amount * 100) / 100;

  return EUR_FORMATTER.format(roundedAmount);
}
