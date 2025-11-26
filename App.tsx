import React, { useState, useEffect, useMemo } from 'react';
import { Product, Session, ProductCategory } from './types';
import { storageService } from './services/storage';
import { ProductCard } from './components/ProductCard';
import { ProductForm } from './components/AddProductForm'; // Imported as ProductForm
import { SessionForm } from './components/SessionForm';
import { ProductDetail } from './components/ProductDetail';
import { UserProfileView } from './components/UserProfile';
import { AnalyticsDashboard } from './components/AnalyticsDashboard';

// Router state
type View = 'DASHBOARD' | 'PRODUCT_DETAIL' | 'PROFILE' | 'ANALYTICS';

function App() {
  const [view, setView] = useState<View>('DASHBOARD');
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [sessions, setSessions] = useState<Session[]>([]);
  
  // Modals
  const [isProductFormOpen, setIsProductFormOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | undefined>(undefined);
  const [isLogSessionOpen, setIsLogSessionOpen] = useState(false);

  // Filters
  const [filterCategory, setFilterCategory] = useState<string>('All');
  const [filterExperience, setFilterExperience] = useState<string>('Any');
  const [searchTerm, setSearchTerm] = useState('');

  const loadData = () => {
    const p = storageService.getProducts();
    const s = storageService.getSessions();
    setProducts(p);
    setSessions(s);
  };

  useEffect(() => {
    loadData();
  }, []);

  const getSessionsForProduct = (pid: string) => sessions.filter(s => s.product_id === pid);

  const handleProductClick = (pid: string) => {
    setSelectedProductId(pid);
    setView('PRODUCT_DETAIL');
    window.scrollTo(0,0);
  };

  const handleBack = () => {
    setSelectedProductId(null);
    setView('DASHBOARD');
  };

  const handleEditProduct = () => {
    if (activeProduct) {
      setEditingProduct(activeProduct);
      setIsProductFormOpen(true);
    }
  };

  // Get all unique tags for the Experience dropdown
  const allExperiences = useMemo(() => {
    const tags = new Set<string>();
    products.forEach(p => p.tags.forEach(t => tags.add(t)));
    return Array.from(tags).sort();
  }, [products]);

  const filteredProducts = products.filter(p => {
    const matchesCategory = filterCategory === 'All' || p.category === filterCategory;
    const matchesSearch = p.product_name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          p.brand_name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesExperience = filterExperience === 'Any' || p.tags.includes(filterExperience);

    return matchesCategory && matchesSearch && matchesExperience;
  });

  // Selected Product Data for Detail View
  const activeProduct = products.find(p => p.id === selectedProductId);
  const activeSessions = activeProduct ? getSessionsForProduct(activeProduct.id).sort((a,b) => new Date(b.date_time_used).getTime() - new Date(a.date_time_used).getTime()) : [];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans pb-24">
      {/* Header */}
      <header className="bg-emerald-900 text-white sticky top-0 z-40 shadow-lg">
        <div className="max-w-3xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => setView('DASHBOARD')}>
            <div className="w-8 h-8 bg-emerald-500 rounded-full flex items-center justify-center font-bold text-white shadow-inner">
               <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" /></svg>
            </div>
            <h1 className="text-xl font-bold tracking-tight">My Stash</h1>
          </div>
          <div className="flex gap-4">
             {/* Add Button - Only on dashboard */}
             {view === 'DASHBOARD' && (
                <button 
                  onClick={() => {
                    setEditingProduct(undefined);
                    setIsProductFormOpen(true);
                  }}
                  className="bg-emerald-500 hover:bg-emerald-400 text-white p-2 rounded-full shadow-lg transition-transform active:scale-95"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                </button>
             )}
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 pt-6">
        
        {view === 'DASHBOARD' && (
          <>
            {/* Search and Experience Filter */}
            <div className="mb-4 grid grid-cols-1 md:grid-cols-2 gap-3">
              <input 
                type="text" 
                placeholder="Search your stash..." 
                className="w-full p-3 rounded-xl border border-slate-200 shadow-sm focus:ring-2 focus:ring-emerald-500 outline-none"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
              />
              <select
                className="w-full p-3 rounded-xl border border-slate-200 shadow-sm focus:ring-2 focus:ring-emerald-500 outline-none bg-white text-slate-600"
                value={filterExperience}
                onChange={e => setFilterExperience(e.target.value)}
              >
                <option value="Any">Desired Experience / Effect...</option>
                {allExperiences.map(tag => (
                  <option key={tag} value={tag}>{tag}</option>
                ))}
              </select>
            </div>

            {/* Category Pills */}
            <div className="mb-6 overflow-x-auto pb-2 scrollbar-hide">
               <div className="flex gap-2">
                {['All', ...Object.values(ProductCategory)].map(cat => (
                  <button
                    key={cat}
                    onClick={() => setFilterCategory(cat)}
                    className={`whitespace-nowrap px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
                      filterCategory === cat 
                        ? 'bg-emerald-800 text-white shadow-md' 
                        : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Product Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredProducts.map(p => (
                <ProductCard 
                  key={p.id} 
                  product={p} 
                  sessions={getSessionsForProduct(p.id)}
                  onClick={() => handleProductClick(p.id)} 
                />
              ))}
              {filteredProducts.length === 0 && (
                <div className="col-span-full text-center py-20 text-slate-400">
                  <p>No products found.</p>
                  {products.length === 0 && (
                    <button 
                      onClick={() => {
                        setEditingProduct(undefined);
                        setIsProductFormOpen(true);
                      }} 
                      className="mt-4 text-emerald-600 font-medium hover:underline"
                    >
                      Add your first product
                    </button>
                  )}
                </div>
              )}
            </div>
          </>
        )}

        {view === 'PRODUCT_DETAIL' && activeProduct && (
          <ProductDetail 
            product={activeProduct}
            sessions={activeSessions}
            onBack={handleBack}
            onLogSession={() => setIsLogSessionOpen(true)}
            onEdit={handleEditProduct}
          />
        )}

        {view === 'PROFILE' && (
           <UserProfileView onSave={() => {}} />
        )}

        {view === 'ANALYTICS' && (
           <AnalyticsDashboard products={products} sessions={sessions} />
        )}

      </main>

      {/* Bottom Nav Bar */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 h-16 pb-safe z-50">
         <div className="max-w-3xl mx-auto h-full flex items-center justify-around text-xs font-medium text-slate-500">
            <button 
              onClick={() => { setView('DASHBOARD'); setSelectedProductId(null); }}
              className={`flex flex-col items-center gap-1 ${view === 'DASHBOARD' || view === 'PRODUCT_DETAIL' ? 'text-emerald-600' : ''}`}
            >
               <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
               Stash
            </button>
            <button 
              onClick={() => setView('ANALYTICS')}
              className={`flex flex-col items-center gap-1 ${view === 'ANALYTICS' ? 'text-emerald-600' : ''}`}
            >
               <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 002 2h2a2 2 0 002-2z" /></svg>
               Insights
            </button>
            <button 
              onClick={() => setView('PROFILE')}
              className={`flex flex-col items-center gap-1 ${view === 'PROFILE' ? 'text-emerald-600' : ''}`}
            >
               <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
               Profile
            </button>
         </div>
      </nav>

      {/* Modals */}
      {isProductFormOpen && (
        <ProductForm 
          initialData={editingProduct}
          onClose={() => setIsProductFormOpen(false)} 
          onSuccess={() => {
            loadData();
            setIsProductFormOpen(false);
          }} 
        />
      )}

      {isLogSessionOpen && activeProduct && (
        <SessionForm 
          product={activeProduct}
          onClose={() => setIsLogSessionOpen(false)}
          onSuccess={() => {
            loadData();
            setIsLogSessionOpen(false);
          }}
        />
      )}
    </div>
  );
}

export default App;