import React, { useState, useEffect } from 'react';
import { UserProfile } from '../types';
import { storageService } from '../services/storage';

interface UserProfileProps {
  onSave: () => void;
}

export const UserProfileView: React.FC<UserProfileProps> = ({ onSave }) => {
  const [profile, setProfile] = useState<UserProfile>(storageService.getUserProfile());
  const [isSaved, setIsSaved] = useState(false);

  const handleSave = () => {
    storageService.saveUserProfile(profile);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2000);
    onSave();
  };

  return (
    <div className="animate-fade-in-up max-w-lg mx-auto bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
      <div className="p-6 border-b border-slate-100 bg-emerald-900 text-white">
        <h2 className="text-2xl font-bold">Your Profile</h2>
        <p className="text-emerald-100 text-sm">Manage your personal preferences</p>
      </div>

      <div className="p-6 space-y-6">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Display Name</label>
          <input 
            type="text" 
            value={profile.name}
            onChange={e => setProfile({...profile, name: e.target.value})}
            className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Email (Optional)</label>
          <input 
            type="email" 
            value={profile.email}
            onChange={e => setProfile({...profile, email: e.target.value})}
            className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
          />
        </div>

        <div className="pt-4 border-t border-slate-100">
          <h3 className="text-lg font-bold text-slate-900 mb-4">Preferences</h3>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-slate-700">Dosage Unit</span>
              <div className="flex bg-slate-100 p-1 rounded-lg">
                {(['mg', 'g'] as const).map(unit => (
                  <button
                    key={unit}
                    onClick={() => setProfile({...profile, preferences: {...profile.preferences, dosageUnit: unit}})}
                    className={`px-3 py-1 text-xs font-bold rounded-md transition-all ${profile.preferences.dosageUnit === unit ? 'bg-white shadow text-emerald-600' : 'text-slate-400 hover:text-slate-600'}`}
                  >
                    {unit}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-slate-700">Date Format</span>
              <select 
                 value={profile.preferences.dateFormat}
                 onChange={e => setProfile({...profile, preferences: {...profile.preferences, dateFormat: e.target.value as any}})}
                 className="p-1 border border-slate-300 rounded text-sm text-slate-600 outline-none"
              >
                <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                <option value="DD/MM/YYYY">DD/MM/YYYY</option>
              </select>
            </div>

            <div className="flex items-center justify-between">
               <span className="text-sm font-medium text-slate-700">Private Profile</span>
               <button 
                 onClick={() => setProfile({...profile, preferences: {...profile.preferences, privateProfile: !profile.preferences.privateProfile}})}
                 className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${profile.preferences.privateProfile ? 'bg-emerald-600' : 'bg-slate-200'}`}
               >
                 <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition transition-transform ${profile.preferences.privateProfile ? 'translate-x-6' : 'translate-x-1'}`} />
               </button>
            </div>
            <p className="text-xs text-slate-400">If enabled, your data is stored locally and functionality related to social sharing (future) will be disabled.</p>
          </div>
        </div>
      </div>
      
      <div className="p-6 bg-slate-50 border-t border-slate-100 flex justify-end">
        <button 
          onClick={handleSave}
          className="bg-emerald-600 text-white px-6 py-2 rounded-lg font-medium shadow hover:bg-emerald-700 transition-all flex items-center gap-2"
        >
          {isSaved && <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>}
          {isSaved ? 'Saved!' : 'Save Profile'}
        </button>
      </div>
    </div>
  );
};
