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
      className={`btn-secondary focus-ring tap-target interactive inline-flex items-center gap-2 group ${className}`}
    >
      <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
      <span>{label}</span>
    </a>
  );
}
