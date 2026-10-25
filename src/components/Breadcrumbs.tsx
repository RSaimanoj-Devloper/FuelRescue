import React from 'react';
import { ChevronRight, Home } from 'lucide-react';

export interface BreadcrumbItem {
  label: string;
  onClick?: () => void;
  active?: boolean;
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
  onHomeClick?: () => void;
}

export const Breadcrumbs: React.FC<BreadcrumbsProps> = ({ items, onHomeClick }) => {
  return (
    <nav aria-label="Breadcrumb" className="flex items-center space-x-1.5 text-xs text-slate-400 py-2">
      <button
        type="button"
        onClick={onHomeClick}
        className="flex items-center gap-1 hover:text-orange-400 transition-colors font-medium text-slate-400"
      >
        <Home className="w-3.5 h-3.5" />
        <span>Home</span>
      </button>

      {items.map((item, idx) => (
        <React.Fragment key={idx}>
          <ChevronRight className="w-3.5 h-3.5 text-slate-600 shrink-0" />
          {item.active || !item.onClick ? (
            <span className="font-bold text-white truncate max-w-[200px]" aria-current="page">
              {item.label}
            </span>
          ) : (
            <button
              type="button"
              onClick={item.onClick}
              className="hover:text-orange-400 transition-colors font-medium text-slate-400 truncate max-w-[200px]"
            >
              {item.label}
            </button>
          )}
        </React.Fragment>
      ))}
    </nav>
  );
};
