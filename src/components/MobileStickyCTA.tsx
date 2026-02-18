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
      className="fixed inset-x-0 bottom-0 z-[60] border-subtle-top bg-app-bg/95 px-4 pt-3 backdrop-blur md:hidden"
      style={{ paddingBottom: 'max(0.75rem, env(safe-area-inset-bottom))' }}
    >
      <button
        type="button"
        onClick={onClick}
        className="btn-primary focus-ring tap-target interactive w-full px-4 py-3 text-base"
      >
        {label}
      </button>
    </div>
  );
}
