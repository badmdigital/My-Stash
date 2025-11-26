import React from 'react';
import { Product, Session } from '../types';
import { StrainBadge, Badge } from './Badge';
import { StarRating } from './StarRating';

interface ProductCardProps {
  product: Product;
  sessions: Session[];
  onClick: () => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, sessions, onClick }) => {
  const avgRating = sessions.length > 0
    ? Number((sessions.reduce((acc, s) => acc + s.overall_rating, 0) / sessions.length).toFixed(1))
    : 0;

  const sessionCount = sessions.length;

  // Display Logic: Variant/Flavor takes precedence as the main title if it exists.
  // This handles cases like "MDMA" (Product) -> "Pink Crystal" (Variant) where we want "Pink Crystal" bold.
  const displayTitle = product.flavor_or_variant && product.flavor_or_variant.trim() !== '' 
    ? product.flavor_or_variant 
    : product.product_name;

  const displaySubtitle = product.flavor_or_variant && product.flavor_or_variant.trim() !== ''
    ? `${product.product_name} • ${product.brand_name || 'Unknown Source'}`
    : product.brand_name || 'Unknown Source';

  return (
    <div 
      onClick={onClick}
      className="bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-md hover:border-emerald-300 transition-all cursor-pointer overflow-hidden flex flex-col h-full group"
    >
      <div className="p-5 flex-1">
        <div className="flex justify-between items-start mb-2">
          <StrainBadge type={product.strain_type} />
          <div className="flex items-center text-xs font-medium text-slate-500">
             <span className="bg-slate-50 px-2 py-1 rounded-md border border-slate-100">
               {product.category}
             </span>
          </div>
        </div>
        
        <h3 className="text-lg font-bold text-slate-900 leading-tight mb-1 group-hover:text-emerald-700 transition-colors">
          {displayTitle}
        </h3>
        <p className="text-sm text-slate-500 font-medium mb-4">
          {displaySubtitle}
        </p>
        
        {/* Rating on Card */}
        <div className="mb-4 flex items-center gap-2">
           {avgRating > 0 ? (
             <StarRating rating={avgRating} size="sm" showNumber />
           ) : (
             <span className="text-xs text-slate-400 font-medium bg-slate-50 px-2 py-0.5 rounded">No ratings yet</span>
           )}
        </div>

        <div className="mb-4">
          <div className="text-xs text-slate-400 uppercase tracking-wider font-semibold mb-1">
             {product.category === 'Psychedelic (Other)' ? 'Active Compounds' : 'Top Terpenes'}
          </div>
          <div className="flex flex-wrap gap-1">
            {product.terpenes.slice(0, 3).map((t, idx) => (
              <span key={idx} className="text-xs text-slate-600 bg-slate-100 px-1.5 py-0.5 rounded">
                {t.name}
              </span>
            ))}
            {product.terpenes.length === 0 && <span className="text-xs text-slate-400 italic">No info</span>}
          </div>
        </div>

        <div className="flex flex-wrap gap-1 mt-auto">
          {product.tags.slice(0, 3).map((tag, i) => (
            <Badge key={i} label={tag} variant="outline" className="text-[10px]" />
          ))}
        </div>
      </div>

      <div className="bg-slate-50 px-5 py-3 border-t border-slate-100 flex justify-between items-center text-sm">
        <div className="text-slate-500">
          {sessionCount} {sessionCount === 1 ? 'Session' : 'Sessions'} Logged
        </div>
        <div className="text-emerald-600 text-xs font-bold uppercase tracking-wider opacity-0 group-hover:opacity-100 transition-opacity">
          View Details →
        </div>
      </div>
    </div>
  );
};