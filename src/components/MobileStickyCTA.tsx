interface MobileStickyCTAProps {
  label: string;
  onClick: () => void;
  isVisible?: boolean;
}

export default function MobileStickyCTA({ label, onClick, isVisible = true }: MobileStickyCTAProps) {
  if (!isVisible) {
    return null;
  }

  return (
    <div
      className="fixed inset-x-0 bottom-0 z-[60] md:hidden border-t border-gray-700 bg-app-bg/95 backdrop-blur px-4 pt-3"
      style={{ paddingBottom: 'max(0.75rem, env(safe-area-inset-bottom))' }}
    >
      <button
        type="button"
        onClick={onClick}
        className="w-full min-h-12 rounded-lg bg-blue-500 px-4 py-3 text-base font-semibold text-white hover:bg-blue-600 transition-colors"
      >
        {label}
      </button>
    </div>
  );
}
