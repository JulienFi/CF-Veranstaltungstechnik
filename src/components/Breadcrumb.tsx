import { ChevronRight } from 'lucide-react';

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
}

export default function Breadcrumb({ items }: BreadcrumbProps) {
  return (
    <nav aria-label="Breadcrumb" className="mb-6">
      <ol className="flex flex-wrap items-center gap-2 text-sm text-gray-300">
        {items.map((item, index) => (
          <li key={index} className="flex min-w-0 items-center gap-2">
            {index > 0 && <ChevronRight className="icon-std icon-std--sm flex-shrink-0 text-gray-500" />}
            {item.href ? (
              <a
                href={item.href}
                className="interactive-link focus-ring interactive inline-flex min-h-9 items-center rounded px-1 py-0.5 text-gray-300 hover:text-blue-300"
              >
                {item.label}
              </a>
            ) : (
              <span className="truncate font-medium text-white">{item.label}</span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}
