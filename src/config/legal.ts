export type OptionalLegalText = string | null;

export interface LegalInfoConfig {
  ownerName: OptionalLegalText;
  legalForm: OptionalLegalText;
  vatId: OptionalLegalText;
  registerCourt: OptionalLegalText;
  registerNumber: OptionalLegalText;
  responsibleEditor: OptionalLegalText;
  hostingProvider: OptionalLegalText;
}

export const LEGAL_INFO: LegalInfoConfig = {
  ownerName: null,
  legalForm: null,
  vatId: null,
  registerCourt: null,
  registerNumber: null,
  responsibleEditor: null,
  hostingProvider: 'Cloudflare Pages',
};

export function hasLegalValue(value: OptionalLegalText): value is string {
  return typeof value === 'string' && value.trim().length > 0;
}
