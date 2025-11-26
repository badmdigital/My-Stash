import React, { useMemo } from 'react';
import { Product, Session } from '../types';
import { StarRating } from './StarRating';

interface AnalyticsDashboardProps {
  products: Product[];
  sessions: Session[];
}

export const AnalyticsDashboard: React.FC<AnalyticsDashboardProps> = ({ products, sessions }) => {
  
  // 1. Mood Trends Logic
  const moodTrends = useMemo(() => {
    // Map mood to numeric for simple trending
    const moodMap: Record<string, number> = { 'Low': 1, 'Neutral': 2, 'Good': 3, 'Great': 4 };
    const sortedSessions = [...sessions].sort((a, b) => new Date(a.date_time_used).getTime() - new Date(b.date_time_used).getTime());
    
    // Take last 10 sessions
    const recent = sortedSessions.slice(-10);
    return recent.map(s => ({
       date: new Date(s.date_time_used).toLocaleDateString(undefined, {month:'short', day:'numeric'}),
       valBefore: moodMap[s.mood_before] || 2,
       valAfter: moodMap[s.mood_after] || 2,
    }));
  }, [sessions]);

  // 2. Effectiveness by Tag (Use Case) - ENHANCED with Top Product
  const tagStats = useMemo(() => {
    const stats: Record<string, { totalRating: number, count: number, productRatings: Record<string, {total: number, count: number}> }> = {};
    
    sessions.forEach(s => {
       const product = products.find(p => p.id === s.product_id);
       if (product) {
          product.tags.forEach(tag => {
             if (!stats[tag]) stats[tag] = { totalRating: 0, count: 0, productRatings: {} };
             
             // Aggregate for Tag
             stats[tag].totalRating += s.overall_rating;
             stats[tag].count++;

             // Aggregate for specific product within this tag
             if (!stats[tag].productRatings[product.id]) {
                stats[tag].productRatings[product.id] = { total: 0, count: 0 };
             }
             stats[tag].productRatings[product.id].total += s.overall_rating;
             stats[tag].productRatings[product.id].count++;
          });
       }
    });

    return Object.entries(stats)
      .map(([tag, data]) => {
         // Find best product for this tag
         let bestPid = '';
         let bestAvg = 0;
         Object.entries(data.productRatings).forEach(([pid, pData]) => {
            const avg = pData.total / pData.count;
            if (avg > bestAvg) {
               bestAvg = avg;
               bestPid = pid;
            }
         });
         const bestProduct = products.find(p => p.id === bestPid);

         return { 
           tag, 
           avg: data.totalRating / data.count, 
           count: data.count,
           topProduct: bestProduct
         };
      })
      .sort((a, b) => b.avg - a.avg)
      .slice(0, 5); // Top 5
  }, [products, sessions]);

  // 3. Usage Frequency (Last 7 Days)
  const weeklyUsage = useMemo(() => {
    const counts = [0,0,0,0,0,0,0]; // 7 days
    const today = new Date();
    sessions.forEach(s => {
       const d = new Date(s.date_time_used);
       const diffTime = Math.abs(today.getTime() - d.getTime());
       const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
       if (diffDays < 7) {
         counts[6 - diffDays]++;
       }
    });
    const labels = [];
    for(let i=6; i>=0; i--) {
       const d = new Date();
       d.setDate(d.getDate() - i);
       labels.push(d.toLocaleDateString(undefined, {weekday:'narrow'}));
    }
    return { counts, labels };
  }, [sessions]);

  // 4. Terpene Correlation (Simple: Top terpenes in 8+ rated sessions)
  const topTerpenes = useMemo(() => {
     const terpCounts: Record<string, number> = {};
     sessions.filter(s => s.overall_rating >= 8).forEach(s => {
        const p = products.find(prod => prod.id === s.product_id);
        if(p) {
           p.terpenes.forEach(t => {
              terpCounts[t.name] = (terpCounts[t.name] || 0) + 1;
           });
        }
     });
     return Object.entries(terpCounts)
        .sort((a,b) => b[1] - a[1])
        .slice(0, 5);
  }, [products, sessions]);

  // 5. Usage by Category
  const categoryStats = useMemo(() => {
    const counts: Record<string, number> = {};
    let total = 0;
    sessions.forEach(s => {
      const p = products.find(prod => prod.id === s.product_id);
      if (p) {
        counts[p.category] = (counts[p.category] || 0) + 1;
        total++;
      }
    });
    return Object.entries(counts)
      .map(([cat, count]) => ({ cat, count, percentage: (count / total) * 100 }))
      .sort((a, b) => b.count - a.count);
  }, [products, sessions]);

  // 6. Recommendation Engine
  const recommendations = useMemo(() => {
    // Get all unique tags from user's products
    const allTags = Array.from(new Set(products.flatMap(p => p.tags)));
    
    // For each tag, find the highest rated product in the stash
    const recs: { tag: string; product: Product; avgRating: number; sessionCount: number }[] = [];

    allTags.forEach(tag => {
      // Find products with this tag
      const taggedProducts = products.filter(p => p.tags.includes(tag));
      
      let bestProduct: Product | null = null;
      let highestAvg = 0;
      let sCount = 0;

      taggedProducts.forEach(prod => {
        // Calculate avg rating for this product
        const prodSessions = sessions.filter(s => s.product_id === prod.id);
        if (prodSessions.length > 0) {
          const totalR = prodSessions.reduce((acc, s) => acc + s.overall_rating, 0);
          const avg = totalR / prodSessions.length;
          // Prefer products with higher rating, break ties with session count
          if (avg > highestAvg) {
            highestAvg = avg;
            bestProduct = prod;
            sCount = prodSessions.length;
          }
        }
      });

      // Only recommend if it's "Good" (> 7)
      if (bestProduct && highestAvg >= 7) {
        recs.push({ tag, product: bestProduct!, avgRating: highestAvg, sessionCount: sCount });
      }
    });

    // Sort by rating then by popularity, take top 4
    return recs.sort((a, b) => b.avgRating - a.avgRating).slice(0, 4);
  }, [products, sessions]);


  if (sessions.length < 3) {
    return (
      <div className="text-center py-20 bg-white rounded-2xl border border-slate-200 shadow-sm">
         <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 002 2h2a2 2 0 002-2z" /></svg>
         </div>
         <h3 className="text-lg font-bold text-slate-900">Not Enough Data</h3>
         <p className="text-slate-500 max-w-xs mx-auto mt-2">Log at least 3 sessions to unlock your insights dashboard.</p>
      </div>
    );
  }

  // Helper to generate svg path for mood
  const generateMoodPath = (points: number[], height: number, width: number) => {
    if (points.length < 2) return '';
    const stepX = width / (points.length - 1);
    // Scale Y: 1..4 -> height..0
    // y = height - ((val - 1) / 3 * height)
    const getY = (val: number) => height - ((val - 1) / 3 * (height - 10)) - 5; 
    
    return points.map((val, i) => 
       `${i === 0 ? 'M' : 'L'} ${i * stepX} ${getY(val)}`
    ).join(' ');
  };

  return (
    <div className="space-y-6 animate-fade-in-up">
       {/* Top Row Stats */}
       <div className="grid grid-cols-2 gap-4">
          <div className="bg-gradient-to-br from-emerald-500 to-emerald-700 rounded-2xl p-4 text-white shadow-lg">
             <div className="text-emerald-100 text-xs font-bold uppercase tracking-wider mb-1">Total Sessions</div>
             <div className="text-3xl font-extrabold">{sessions.length}</div>
             <div className="text-xs text-emerald-100 mt-2">All time</div>
          </div>
          <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm">
             <div className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-1">Avg Rating</div>
             <div className="text-3xl font-extrabold text-slate-800">
               {(sessions.reduce((a,b)=>a+b.overall_rating, 0) / sessions.length).toFixed(1)}
               <span className="text-sm text-slate-400 font-normal"> / 10</span>
             </div>
          </div>
       </div>

       {/* Recommendations Grid */}
       {recommendations.length > 0 && (
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
           <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
             <svg className="w-5 h-5 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
             Your Stash Picks
           </h3>
           <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
             {recommendations.map((rec, i) => (
                <div key={i} className="flex flex-col bg-slate-50 rounded-xl p-3 border border-slate-100 relative overflow-hidden group hover:border-emerald-200 transition-colors">
                   <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Best For {rec.tag}</div>
                   {/* Display Logic for Picks */}
                   <div className="font-bold text-slate-800 truncate">
                      {rec.product.flavor_or_variant && rec.product.flavor_or_variant.trim() !== '' ? rec.product.flavor_or_variant : rec.product.product_name}
                   </div>
                   <div className="text-xs text-slate-500 mb-2 truncate">
                      {rec.product.flavor_or_variant ? `${rec.product.product_name} • ${rec.product.brand_name}` : rec.product.brand_name}
                   </div>
                   <div className="flex items-center gap-2 mt-auto">
                     <div className="bg-white px-1.5 py-0.5 rounded shadow-sm">
                       <StarRating rating={rec.avgRating} size="sm" showNumber />
                     </div>
                   </div>
                </div>
             ))}
           </div>
        </div>
       )}

       {/* Weekly Usage Chart */}
       <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <h3 className="font-bold text-slate-800 mb-4">Last 7 Days Activity</h3>
          <div className="flex items-end justify-between h-32 gap-2">
             {weeklyUsage.counts.map((count, idx) => (
                <div key={idx} className="flex flex-col items-center flex-1">
                   <div 
                     className="w-full bg-emerald-200 rounded-t-md hover:bg-emerald-300 transition-all relative group" 
                     style={{ height: `${Math.max(count * 15, 4)}%` }} // Scale roughly
                   >
                     {count > 0 && (
                        <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-[10px] px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                           {count}
                        </div>
                     )}
                   </div>
                   <div className="text-[10px] text-slate-400 mt-2 font-medium">{weeklyUsage.labels[idx]}</div>
                </div>
             ))}
          </div>
       </div>

       {/* Usage By Category */}
       <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <h3 className="font-bold text-slate-800 mb-4">Sessions by Category</h3>
          <div className="space-y-3">
             {categoryStats.map((stat, i) => (
                <div key={i}>
                   <div className="flex justify-between text-sm mb-1">
                      <span className="font-medium text-slate-700">{stat.cat}</span>
                      <span className="text-slate-500 text-xs">{stat.count} ({stat.percentage.toFixed(0)}%)</span>
                   </div>
                   <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div className="h-full bg-indigo-400 rounded-full" style={{ width: `${stat.percentage}%` }}></div>
                   </div>
                </div>
             ))}
             {categoryStats.length === 0 && <p className="text-sm text-slate-400 italic">No data yet.</p>}
          </div>
       </div>

       {/* Mood Trend (Line Chart) */}
       <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="flex justify-between items-center mb-4">
             <h3 className="font-bold text-slate-800">Mood Shift</h3>
             <div className="flex gap-3 text-xs">
                <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-slate-300"></div> Before</div>
                <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-emerald-500"></div> After</div>
             </div>
          </div>
          <div className="h-32 relative">
             {moodTrends.length > 1 ? (
               <svg className="w-full h-full overflow-visible" preserveAspectRatio="none">
                 {/* Grid Lines */}
                 <line x1="0" y1="25%" x2="100%" y2="25%" stroke="#f1f5f9" strokeWidth="1" />
                 <line x1="0" y1="50%" x2="100%" y2="50%" stroke="#f1f5f9" strokeWidth="1" />
                 <line x1="0" y1="75%" x2="100%" y2="75%" stroke="#f1f5f9" strokeWidth="1" />
                 
                 {/* Line Before */}
                 <path d={generateMoodPath(moodTrends.map(m => m.valBefore), 128, 300)} fill="none" stroke="#cbd5e1" strokeWidth="2" vectorEffect="non-scaling-stroke" strokeDasharray="4 4" />
                 
                 {/* Line After */}
                 <path d={generateMoodPath(moodTrends.map(m => m.valAfter), 128, 300)} fill="none" stroke="#10b981" strokeWidth="2" vectorEffect="non-scaling-stroke" />

                 {/* Points */}
                 {moodTrends.map((m, i) => {
                    // Simple positioning approximation for the SVG overlay
                    const x = `${(i / (moodTrends.length - 1)) * 100}%`;
                    const y = (val: number) => `${100 - ((val - 1) / 3 * 100)}%`; // 1..4 -> 100%..0%
                    return (
                       <g key={i}>
                         <circle cx={x} cy={y(m.valAfter)} r="3" fill="#10b981" />
                       </g>
                    )
                 })}
               </svg>
             ) : (
                <div className="flex items-center justify-center h-full text-slate-400 text-sm italic">Need more sessions for trend line</div>
             )}
          </div>
          <div className="flex justify-between text-xs text-slate-400 mt-2">
             <span>Low</span>
             <span>Neutral</span>
             <span>Good</span>
             <span>Great</span>
          </div>
       </div>

       <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Top Effects - ENHANCED */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
             <h3 className="font-bold text-slate-800 mb-4">Highest Rated Effects</h3>
             <div className="space-y-4">
                {tagStats.map((stat, i) => (
                   <div key={i} className="group">
                      <div className="flex justify-between text-sm mb-1">
                         <span className="font-medium text-slate-700">{stat.tag}</span>
                         <span className="font-bold text-slate-900">{stat.avg.toFixed(1)}</span>
                      </div>
                      <div className="h-2 bg-slate-100 rounded-full overflow-hidden mb-1">
                         <div className="h-full bg-blue-400 rounded-full" style={{ width: `${stat.avg * 10}%` }}></div>
                      </div>
                      {stat.topProduct && (
                         <div className="text-[10px] text-slate-500 flex items-center gap-1">
                            <span className="text-slate-400">Top performer:</span> 
                            <span className="text-emerald-600 font-medium truncate max-w-[150px]">
                               {stat.topProduct.flavor_or_variant || stat.topProduct.product_name}
                            </span>
                         </div>
                      )}
                   </div>
                ))}
             </div>
          </div>

          {/* Top Terpenes */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
             <h3 className="font-bold text-slate-800 mb-4">Top Compounds</h3>
             <p className="text-xs text-slate-500 mb-3">Most frequent in your highly rated (8+) sessions.</p>
             <div className="flex flex-wrap gap-2">
                {topTerpenes.map(([name, count], i) => (
                   <span key={i} className="bg-fuchsia-50 text-fuchsia-800 border border-fuchsia-100 px-3 py-1 rounded-full text-sm font-medium">
                      {name} <span className="text-fuchsia-400 ml-1 text-xs">x{count}</span>
                   </span>
                ))}
                {topTerpenes.length === 0 && <span className="text-sm text-slate-400 italic">No highly rated sessions with data yet.</span>}
             </div>
          </div>
       </div>
    </div>
  );
};