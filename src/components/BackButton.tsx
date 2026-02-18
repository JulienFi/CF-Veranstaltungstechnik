import { ArrowLeft } from 'lucide-react';

interface BackButtonProps {
  href: string;
  label?: string;
  className?: string;
}

export default function BackButton({ href, label = 'Zurück', className = '' }: BackButtonProps) {
  return (
    <a
      href={href}
      className={`btn-secondary focus-ring tap-target inline-flex items-center gap-2 border-gray-700/70 px-4 py-2 text-sm font-medium text-gray-200 transition-all hover:text-white group ${className}`}
    >
      <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
      <span>{label}</span>
    </a>
  );
}
