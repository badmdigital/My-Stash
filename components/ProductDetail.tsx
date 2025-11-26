import React from 'react';
import { Product, Session, ProductCategory } from '../types';
import { StrainBadge, Badge } from './Badge';
import { StarRating } from './StarRating';

interface ProductDetailProps {
  product: Product;
  sessions: Session[];
  onBack: () => void;
  onLogSession: () => void;
  onEdit: () => void;
}

export const ProductDetail: React.FC<ProductDetailProps> = ({ product, sessions, onBack, onLogSession, onEdit }) => {
  const avgRating = sessions.length > 0
  ? Number((sessions.reduce((acc, s) => acc + s.overall_rating, 0) / sessions.length).toFixed(1))
  : 0;

  const isPsych = product.category === ProductCategory.PSYCHEDELIC_OTHER;
  const profileLabel = isPsych ? 'Active Compounds / Profile' : 'Terpene Profile';

  // Display Logic: Variant/Flavor takes precedence
  const displayTitle = product.flavor_or_variant && product.flavor_or_variant.trim() !== '' 
    ? product.flavor_or_variant 
    : product.product_name;

  const displaySubtitle = product.flavor_or_variant && product.flavor_or_variant.trim() !== ''
    ? `${product.product_name} • ${product.brand_name || 'Unknown Source'}`
    : product.brand_name || 'Unknown Source';

  return (
    <div className="animate-fade-in-up pb-20">
      <div className="flex justify-between items-center mb-4">
        <button onClick={onBack} className="text-sm text-slate-500 hover:text-emerald-600 flex items-center gap-1 group">
          <svg className="w-4 h-4 group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
          Back to Stash
        </button>
        <button onClick={onEdit} className="text-sm font-medium text-emerald-600 hover:text-emerald-700 flex items-center gap-1">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
          Edit Product
        </button>
      </div>

      {/* Product Header Card */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 mb-6">
          <div className="flex flex-col md:flex-row justify-between items-start mb-4 gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                 <h2 className="text-3xl font-extrabold text-slate-900">{displayTitle}</h2>
                 <StrainBadge type={product.strain_type} />
              </div>
              <div className="flex items-center gap-3">
                 <div className="text-lg text-slate-600 font-medium">{displaySubtitle}</div>
                 {/* Brand/Product Star Rating */}
                 {avgRating > 0 && (
                   <div className="flex items-center gap-1 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-100">
                      <StarRating rating={avgRating} size="sm" />
                      <span className="text-xs font-bold text-amber-700">{avgRating}</span>
                   </div>
                 )}
              </div>
            </div>
            
            <div className="flex flex-col items-end gap-2">
               <div className="flex gap-2">
                  <Badge label={product.category} />
                  {/* Hide Form Factor badge if it's the same as Category to avoid redundancy */}
                  {product.form_factor !== product.category && <Badge label={product.form_factor} variant="outline" />}
               </div>
            </div>
          </div>

          <div className="flex flex-wrap gap-2 mb-6">
            {product.thc_mg_per_unit && <Badge label={`Strength: ${product.thc_mg_per_unit}${product.category.includes('Edible') || product.category.includes('Psychedelic') ? 'mg' : '%'}`} variant="outline" className="border-red-200 text-red-800 bg-red-50" />}
            {product.cbd_mg_per_unit && <Badge label={`CBD: ${product.cbd_mg_per_unit}%`} variant="outline" className="border-blue-200 text-blue-800 bg-blue-50" />}
          </div>
          
          {/* New Recommended Use Cases / Tags Section */}
          <div className="mb-6 bg-slate-50 p-4 rounded-xl border border-slate-100">
             <h4 className="text-xs uppercase tracking-wider text-slate-500 font-bold mb-3 flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" /></svg>
                Recommended For & Effects
             </h4>
             <div className="flex flex-wrap gap-2 mb-3">
                {product.tags.map((tag, i) => (
                   <span key={i} className="bg-white border border-emerald-100 text-emerald-700 px-3 py-1 rounded-full text-sm font-medium shadow-sm">
                      {tag}
                   </span>
                ))}
                {product.tags.length === 0 && <span className="text-sm text-slate-400 italic">No specific tags added.</span>}
             </div>
             {product.dosage_description && (
                <p className="text-sm text-slate-600 italic border-l-4 border-emerald-200 pl-3">
                   "{product.dosage_description}"
                </p>
             )}
          </div>

          <div className="border-t border-slate-100 pt-4">
            <h4 className="text-xs uppercase tracking-wider text-slate-400 font-bold mb-3">{profileLabel}</h4>
            <div className="space-y-3">
              {product.terpenes.map((t, idx) => (
                <div key={idx}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="font-medium text-slate-700">{t.name}</span>
                    {t.percentage && <span className="text-slate-400">{t.percentage}%</span>}
                  </div>
                  <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden relative">
                     <div className="h-full bg-emerald-400 rounded-full" style={{ width: `${(t.percentage || 0) * 20}%`, minWidth: '5px' }}></div>
                  </div>
                  {t.description && <div className="text-xs text-slate-400 mt-1">{t.description}</div>}
                </div>
              ))}
              {product.terpenes.length === 0 && <span className="text-sm text-slate-400 italic">No data available.</span>}
            </div>
          </div>
      </div>

      {/* Action Bar */}
      <div className="flex justify-between items-center mb-6 sticky top-16 z-30 bg-slate-50/90 backdrop-blur-md py-3 border-b border-slate-200">
        <h3 className="text-xl font-bold text-slate-900">Session History</h3>
        <button 
          onClick={onLogSession}
          className="bg-emerald-600 text-white px-4 py-2 rounded-lg shadow-md hover:bg-emerald-700 font-medium flex items-center gap-2 transition-transform active:scale-95"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>
          Log Session
        </button>
      </div>

      {/* Timeline */}
      <div className="relative border-l-2 border-slate-200 ml-3 space-y-8">
        {sessions.map((session, idx) => (
          <div key={session.id} className="relative pl-6">
            {/* Timeline Dot */}
            <div className="absolute -left-[9px] top-1 w-4 h-4 rounded-full bg-white border-2 border-emerald-400 shadow-sm"></div>
            
            <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 hover:border-emerald-200 transition-colors">
              <div className="flex justify-between items-start mb-2">
                <div className="text-sm font-bold text-slate-800">
                  {new Date(session.date_time_used).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'})}
                </div>
                <div className="flex items-center gap-1">
                   <StarRating rating={session.overall_rating} size="sm" />
                </div>
              </div>
              
              <div className="flex flex-wrap gap-2 text-xs mb-3">
                  <span className="bg-slate-100 px-2 py-1 rounded text-slate-600">Dose: {session.dose_amount}</span>
                  <span className="bg-slate-100 px-2 py-1 rounded text-slate-600">Method: {session.method}</span>
                  <span className="bg-slate-100 px-2 py-1 rounded text-slate-600">Setting: {session.setting}</span>
              </div>

              {session.notes && (
                <p className="text-sm text-slate-600 italic border-l-2 border-slate-200 pl-3 py-1 mb-2">
                  "{session.notes}"
                </p>
              )}

              <div className="flex gap-4 text-xs text-slate-500 mt-2 border-t border-slate-50 pt-2">
                  <div>Mood: <span className="font-medium text-slate-700">{session.mood_before} → {session.mood_after}</span></div>
                  <div>Intensity: <span className="font-medium text-slate-700">{session.intensity_rating}/10</span></div>
              </div>
            </div>
          </div>
        ))}
        {sessions.length === 0 && (
          <div className="pl-6 text-slate-400 italic">No sessions logged yet. Try it out!</div>
        )}
      </div>
    </div>
  );
};