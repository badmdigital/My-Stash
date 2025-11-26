import React, { useState } from 'react';
import { Product, Session } from '../types';
import { storageService } from '../services/storage';

interface SessionFormProps {
  product: Product;
  onClose: () => void;
  onSuccess: () => void;
}

export const SessionForm: React.FC<SessionFormProps> = ({ product, onClose, onSuccess }) => {
  const [formData, setFormData] = useState<Partial<Session>>({
    dose_amount: '',
    setting: 'Home',
    method: product.form_factor === 'Flower' ? 'Smoked' : (product.category === 'Edible' ? 'Eaten' : 'Vaped'),
    intensity_rating: 5,
    overall_rating: 5,
    mood_before: 'Neutral',
    mood_after: 'Good',
    notes: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newSession: Session = {
      id: crypto.randomUUID(),
      product_id: product.id,
      date_time_used: new Date().toISOString(),
      dose_amount: formData.dose_amount || 'Standard',
      setting: formData.setting || 'Home',
      method: formData.method || 'Unknown',
      intensity_rating: formData.intensity_rating || 5,
      overall_rating: formData.overall_rating || 5,
      mood_before: formData.mood_before as any,
      mood_after: formData.mood_after as any,
      notes: formData.notes,
      created_at: new Date().toISOString(),
    };

    storageService.saveSession(newSession);
    onSuccess();
  };

  const RatingInput = ({ label, value, onChange }: { label: string, value: number, onChange: (v: number) => void }) => (
    <div className="mb-4">
      <label className="block text-sm font-medium text-slate-700 mb-1">{label}: <span className="text-emerald-600 font-bold">{value}/10</span></label>
      <input 
        type="range" min="1" max="10" value={value} 
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-emerald-500"
      />
      <div className="flex justify-between text-xs text-slate-400 px-1 mt-1">
        <span>Low</span>
        <span>High</span>
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50 rounded-t-2xl">
          <div>
            <h2 className="text-xl font-bold text-slate-900">Log Session</h2>
            <p className="text-sm text-slate-500">for {product.product_name}</p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Dose Amount</label>
              <input 
                type="text" 
                placeholder="e.g. 1 gummy, 2 bowls"
                className="w-full rounded-lg border-slate-300 border p-2 text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
                value={formData.dose_amount}
                onChange={e => setFormData({...formData, dose_amount: e.target.value})}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Method</label>
               <select 
                className="w-full rounded-lg border-slate-300 border p-2 text-sm focus:ring-2 focus:ring-emerald-500 outline-none bg-white"
                value={formData.method}
                onChange={e => setFormData({...formData, method: e.target.value})}
              >
                <option>Smoked</option>
                <option>Vaped</option>
                <option>Eaten</option>
                <option>Sublingual</option>
                <option>Capsule</option>
                <option>Beverage</option>
                <option>Other</option>
              </select>
            </div>
          </div>

          <div>
             <label className="block text-sm font-medium text-slate-700 mb-1">Setting</label>
              <input 
                type="text" 
                placeholder="Where are you? (e.g. Park, Home)"
                className="w-full rounded-lg border-slate-300 border p-2 text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
                value={formData.setting}
                onChange={e => setFormData({...formData, setting: e.target.value})}
              />
          </div>

          <div className="grid grid-cols-2 gap-6 bg-slate-50 p-4 rounded-xl border border-slate-100">
            <RatingInput 
              label="Intensity" 
              value={formData.intensity_rating || 5} 
              onChange={v => setFormData({...formData, intensity_rating: v})} 
            />
            <RatingInput 
              label="Overall Rating" 
              value={formData.overall_rating || 5} 
              onChange={v => setFormData({...formData, overall_rating: v})} 
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Mood Before</label>
              <select 
                className="w-full rounded-lg border-slate-300 border p-2 text-sm"
                value={formData.mood_before}
                onChange={e => setFormData({...formData, mood_before: e.target.value as any})}
              >
                <option>Low</option>
                <option>Neutral</option>
                <option>Good</option>
                <option>Great</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Mood After</label>
              <select 
                className="w-full rounded-lg border-slate-300 border p-2 text-sm"
                value={formData.mood_after}
                onChange={e => setFormData({...formData, mood_after: e.target.value as any})}
              >
                <option>Low</option>
                <option>Neutral</option>
                <option>Good</option>
                <option>Great</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Experience Notes</label>
            <textarea 
              rows={3}
              className="w-full rounded-lg border-slate-300 border p-2 text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
              placeholder="How did it feel? Any specific thoughts?"
              value={formData.notes}
              onChange={e => setFormData({...formData, notes: e.target.value})}
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button 
              type="button" 
              onClick={onClose}
              className="flex-1 py-2.5 bg-white border border-slate-300 text-slate-700 rounded-lg font-medium hover:bg-slate-50"
            >
              Cancel
            </button>
            <button 
              type="submit"
              className="flex-1 py-2.5 bg-emerald-600 text-white rounded-lg font-medium hover:bg-emerald-700 shadow-md shadow-emerald-200"
            >
              Save Session
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};