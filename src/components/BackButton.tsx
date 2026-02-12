import { ArrowLeft } from 'lucide-react';

interface BackButtonProps {
  href: string;
  label?: string;
  className?: string;
}

export default function BackButton({ href, label = 'ZurÃ¼ck', className = '' }: BackButtonProps) {
  return (
    <a
      href={href}
      className={`inline-flex items-center gap-2 px-4 py-2 bg-card-hover/80 hover:bg-card-hover border border-gray-700/50 rounded-lg transition-all text-gray-300 hover:text-white font-medium group ${className}`}
    >
      <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
      <span>{label}</span>
    </a>
  );
}
