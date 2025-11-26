import React, { useState, useEffect, useRef } from 'react';
import { Product, ProductCategory, StrainType } from '../types';
import { enrichProductData } from '../services/geminiService';
import { storageService } from '../services/storage';

interface ProductFormProps {
  initialData?: Product;
  onClose: () => void;
  onSuccess: () => void;
}

export const ProductForm: React.FC<ProductFormProps> = ({ initialData, onClose, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [enriching, setEnriching] = useState(false);
  
  // UI States for manual entry
  const [isAddingTerpene, setIsAddingTerpene] = useState(false);
  const [newTerpeneName, setNewTerpeneName] = useState('');
  const [newTerpenePercent, setNewTerpenePercent] = useState('');

  const [isAddingTag, setIsAddingTag] = useState(false);
  const [newTagName, setNewTagName] = useState('');

  // Refs for auto-focus
  const terpeneInputRef = useRef<HTMLInputElement>(null);
  const tagInputRef = useRef<HTMLInputElement>(null);
  
  const [formData, setFormData] = useState<Partial<Product>>({
    brand_name: '',
    product_name: '',
    flavor_or_variant: '',
    category: ProductCategory.FLOWER,
    strain_type: StrainType.UNKNOWN,
    form_factor: 'Flower',
    terpenes: [],
    tags: []
  });

  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
    }
  }, [initialData]);

  useEffect(() => {
    if (isAddingTerpene && terpeneInputRef.current) {
      terpeneInputRef.current.focus();
    }
  }, [isAddingTerpene]);

  useEffect(() => {
    if (isAddingTag && tagInputRef.current) {
      tagInputRef.current.focus();
    }
  }, [isAddingTag]);

  const isPsych = formData.category === ProductCategory.PSYCHEDELIC_OTHER;

  // Reset certain fields if switching to Psychedelic
  useEffect(() => {
    if (formData.category === ProductCategory.PSYCHEDELIC_OTHER) {
      // Set defaults for psych if switching
      if (!initialData) {
         setFormData(prev => ({
             ...prev, 
             form_factor: 'Capsule', 
             strain_type: StrainType.UNKNOWN 
         }));
      }
    }
  }, [formData.category, initialData]);

  const handleEnrich = async () => {
    if (!formData.brand_name && !isPsych) return;
    if (!formData.product_name) return;
    
    setEnriching(true);
    try {
      // For psychs, we might pass "Generic" as brand if empty
      const brandToUse = isPsych ? (formData.brand_name || 'Generic') : formData.brand_name!;

      const enriched = await enrichProductData(
        brandToUse,
        formData.product_name!,
        formData.flavor_or_variant
      );

      if (enriched) {
        setFormData(prev => ({
          ...prev,
          strain_type: enriched.strain_type,
          thc_mg_per_unit: enriched.typical_thc_percentage,
          cbd_mg_per_unit: enriched.typical_cbd_percentage,
          terpenes: enriched.dominant_terpenes,
          tags: enriched.suggested_tags,
          dosage_description: enriched.description_summary
        }));
      }
    } catch (e) {
      console.error(e);
    } finally {
      setEnriching(false);
    }
  };

  const addManualTerpene = () => {
    if (newTerpeneName.trim()) {
      setFormData({
        ...formData,
        terpenes: [...(formData.terpenes || []), { 
          name: newTerpeneName, 
          percentage: newTerpenePercent ? parseFloat(newTerpenePercent) : undefined 
        }]
      });
      setNewTerpeneName('');
      setNewTerpenePercent('');
      setIsAddingTerpene(false);
    }
  };

  const addManualTag = () => {
    if (newTagName.trim()) {
      setFormData({
        ...formData,
        tags: [...(formData.tags || []), newTagName.trim()]
      });
      setNewTagName('');
      setIsAddingTag(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const productToSave: Product = {
      id: initialData?.id || crypto.randomUUID(),
      category: formData.category!,
      brand_name: formData.brand_name || (isPsych ? 'Unknown Source' : ''),
      product_name: formData.product_name!,
      flavor_or_variant: formData.flavor_or_variant,
      form_factor: formData.form_factor || 'Unknown',
      strain_type: formData.strain_type!,
      thc_mg_per_unit: formData.thc_mg_per_unit,
      cbd_mg_per_unit: formData.cbd_mg_per_unit,
      dosage_description: formData.dosage_description,
      tags: formData.tags || [],
      terpenes: formData.terpenes || [],
      created_at: initialData?.created_at || new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    storageService.saveProduct(productToSave);
    setLoading(false);
    onSuccess();
  };

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50 rounded-t-2xl">
          <h2 className="text-xl font-bold text-slate-900">{initialData ? 'Edit Product' : 'Add to Stash'}</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
             <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="space-y-4">
             {/* Category Selection First */}
             <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Category</label>
              <select 
                className="w-full rounded-lg border-slate-300 border p-2 text-sm bg-white"
                value={formData.category}
                onChange={e => setFormData({...formData, category: e.target.value as ProductCategory})}
              >
                {Object.values(ProductCategory).map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                   {isPsych ? 'Source / Vendor (Optional)' : 'Brand'}
                </label>
                <input 
                  className="w-full rounded-lg border-slate-300 border p-2 text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
                  value={formData.brand_name}
                  onChange={e => setFormData({...formData, brand_name: e.target.value})}
                  placeholder={isPsych ? "e.g. Street, Friend, Silk Road" : "e.g. Raw Garden"}
                  required={!isPsych}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  {isPsych ? 'Substance' : 'Product Name'}
                </label>
                <input 
                  className="w-full rounded-lg border-slate-300 border p-2 text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
                  value={formData.product_name}
                  onChange={e => setFormData({...formData, product_name: e.target.value})}
                  placeholder={isPsych ? "e.g. MDMA, LSD, Mushrooms" : "e.g. Skywalker OG"}
                  required
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                {isPsych ? 'Variant / Batch / Strain' : 'Variant / Flavor (Optional)'}
              </label>
              <input 
                className="w-full rounded-lg border-slate-300 border p-2 text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
                value={formData.flavor_or_variant}
                onChange={e => setFormData({...formData, flavor_or_variant: e.target.value})}
                placeholder={isPsych ? "e.g. Golden Teacher, Purple Crystal" : "e.g. Raspberry"}
              />
            </div>
          </div>

          <div className="bg-emerald-50 rounded-lg p-3 border border-emerald-100 flex items-center justify-between">
            <div className="text-xs text-emerald-800">
              <span className="font-bold">AI Auto-Import:</span> Fill fields above and click here to fetch details.
            </div>
            <button 
              type="button"
              onClick={handleEnrich}
              disabled={enriching || (!formData.brand_name && !isPsych) || !formData.product_name}
              className="px-3 py-1.5 bg-emerald-600 text-white text-xs font-bold rounded shadow-sm hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
            >
              {enriching ? (
                 <>Fetching...</>
              ) : (
                <>
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                  Auto-Fill
                </>
              )}
            </button>
          </div>

          <div className="grid grid-cols-2 gap-4">
             <div>
               <label className="block text-sm font-medium text-slate-700 mb-1">Form Factor</label>
               <input 
                  className="w-full rounded-lg border-slate-300 border p-2 text-sm"
                  value={formData.form_factor}
                  onChange={e => setFormData({...formData, form_factor: e.target.value})}
                  placeholder="e.g. Flower, Gummy, Blotter"
               />
             </div>
             {!isPsych && (
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Strain Type</label>
                  <select 
                    className="w-full rounded-lg border-slate-300 border p-2 text-sm bg-white"
                    value={formData.strain_type}
                    onChange={e => setFormData({...formData, strain_type: e.target.value as StrainType})}
                  >
                    {Object.values(StrainType).map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
             )}
          </div>

          {/* Additional Details Section */}
          <div className="border-t border-slate-100 pt-4 mt-2">
            <h3 className="text-sm font-bold text-slate-900 mb-2">Details {enriching && <span className="text-emerald-500 text-xs font-normal animate-pulse">Updating...</span>}</h3>
            
            <div className="grid grid-cols-2 gap-4 mb-3">
               <div>
                  <label className="block text-xs font-medium text-slate-500 mb-1">
                    {isPsych ? 'Dose Strength (mg)' : 'THC % / mg'}
                  </label>
                  <input 
                    type="number"
                    className="w-full rounded-lg border-slate-300 border p-2 text-sm"
                    value={formData.thc_mg_per_unit || ''}
                    onChange={e => setFormData({...formData, thc_mg_per_unit: Number(e.target.value)})}
                  />
               </div>
               {!isPsych && (
                  <div>
                    <label className="block text-xs font-medium text-slate-500 mb-1">CBD % / mg</label>
                    <input 
                      type="number"
                      className="w-full rounded-lg border-slate-300 border p-2 text-sm"
                      value={formData.cbd_mg_per_unit || ''}
                      onChange={e => setFormData({...formData, cbd_mg_per_unit: Number(e.target.value)})}
                    />
                  </div>
               )}
            </div>

            {/* Generalized Terpenes / Compounds Section */}
            <div className="mb-4">
              <label className="block text-xs font-medium text-slate-500 mb-1">
                {isPsych ? 'Active Compounds / Composition' : 'Dominant Terpenes'}
              </label>
              
              <div className="flex flex-wrap gap-2 mb-2">
                {formData.terpenes?.map((t, i) => (
                  <span key={i} className="bg-slate-100 text-slate-600 px-2 py-1 rounded text-xs flex items-center gap-1">
                    {t.name} {t.percentage ? `(${t.percentage}%)` : ''}
                    <button type="button" onClick={() => {
                        const newT = [...(formData.terpenes || [])];
                        newT.splice(i, 1);
                        setFormData({...formData, terpenes: newT});
                    }} className="hover:text-red-500 ml-1 font-bold">×</button>
                  </span>
                ))}
              </div>

              {isAddingTerpene ? (
                <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 animate-fade-in-up">
                   <div className="flex gap-2 mb-2">
                      <input 
                        ref={terpeneInputRef}
                        className="flex-1 rounded border border-slate-300 p-1.5 text-xs outline-none focus:border-emerald-500"
                        placeholder="Name (e.g. Myrcene)"
                        value={newTerpeneName}
                        onChange={e => setNewTerpeneName(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addManualTerpene())}
                      />
                      <input 
                        className="w-20 rounded border border-slate-300 p-1.5 text-xs outline-none focus:border-emerald-500"
                        placeholder="%"
                        type="number"
                        value={newTerpenePercent}
                        onChange={e => setNewTerpenePercent(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addManualTerpene())}
                      />
                   </div>
                   <div className="flex gap-2 justify-end">
                      <button type="button" onClick={() => setIsAddingTerpene(false)} className="text-xs text-slate-500 hover:text-slate-700">Cancel</button>
                      <button type="button" onClick={addManualTerpene} className="bg-emerald-600 text-white px-3 py-1 rounded text-xs">Add</button>
                   </div>
                </div>
              ) : (
                <button 
                  type="button" 
                  className="text-xs text-emerald-600 font-medium hover:underline flex items-center gap-1"
                  onClick={() => setIsAddingTerpene(true)}
                >
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                  Add Manually
                </button>
              )}
            </div>

            <div className="mb-4">
              <label className="block text-xs font-medium text-slate-500 mb-1">Effects & Tags</label>
              <div className="flex flex-wrap gap-2 mb-2">
                {formData.tags?.map((tag, i) => (
                  <span key={i} className="bg-emerald-50 text-emerald-700 px-2 py-1 rounded text-xs flex items-center gap-1">
                    {tag}
                    <button type="button" onClick={() => {
                        const newTags = [...(formData.tags || [])];
                        newTags.splice(i, 1);
                        setFormData({...formData, tags: newTags});
                    }} className="hover:text-emerald-900 ml-1 font-bold">×</button>
                  </span>
                ))}
              </div>

              {isAddingTag ? (
                 <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 animate-fade-in-up">
                    <div className="flex gap-2 mb-2">
                        <input 
                          ref={tagInputRef}
                          className="flex-1 rounded border border-slate-300 p-1.5 text-xs outline-none focus:border-emerald-500"
                          placeholder="Tag (e.g. Sleep, Creative, Visuals)"
                          value={newTagName}
                          onChange={e => setNewTagName(e.target.value)}
                          onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addManualTag())}
                        />
                    </div>
                    <div className="flex gap-2 justify-end">
                        <button type="button" onClick={() => setIsAddingTag(false)} className="text-xs text-slate-500 hover:text-slate-700">Cancel</button>
                        <button type="button" onClick={addManualTag} className="bg-emerald-600 text-white px-3 py-1 rounded text-xs">Add</button>
                    </div>
                 </div>
              ) : (
                 <button 
                    type="button" 
                    className="text-xs text-emerald-600 font-medium hover:underline flex items-center gap-1"
                    onClick={() => setIsAddingTag(true)}
                  >
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                    Add Tag manually
                  </button>
              )}
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1">Summary / Description</label>
              <textarea 
                className="w-full rounded-lg border-slate-300 border p-2 text-sm"
                rows={2}
                value={formData.dosage_description || ''}
                onChange={e => setFormData({...formData, dosage_description: e.target.value})}
              />
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <button 
              type="button" 
              onClick={onClose}
              className="flex-1 py-2.5 bg-white border border-slate-300 text-slate-700 rounded-lg font-medium hover:bg-slate-50"
            >
              Cancel
            </button>
            <button 
              type="submit"
              disabled={loading}
              className="flex-1 py-2.5 bg-emerald-600 text-white rounded-lg font-medium hover:bg-emerald-700 shadow-md shadow-emerald-200 disabled:opacity-70"
            >
              {loading ? 'Saving...' : (initialData ? 'Save Changes' : 'Create Product')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};