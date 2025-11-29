import React from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { ProcessingStats } from '../types';
import { ShieldCheck, Zap, Layers } from 'lucide-react';

interface StatsDashboardProps {
  stats: ProcessingStats;
}

const COLORS = ['#8b5cf6', '#a855f7', '#d946ef', '#ec4899', '#f43f5e', '#06b6d4', '#3b82f6', '#6366f1'];

export const StatsDashboard: React.FC<StatsDashboardProps> = ({ stats }) => {
  const data = Object.entries(stats.breakdown).map(([name, value]) => ({
    name,
    value: value as number,
  })).filter(item => item.value > 0);

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      {/* Total Entities Card */}
      <div className="glass-panel p-6 rounded-2xl flex flex-col justify-between relative overflow-hidden group">
        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <Layers size={80} className="text-gray-900 dark:text-white" />
        </div>
        <div>
            <div className="flex items-center gap-2 mb-2">
                <span className="p-1.5 rounded-lg bg-universe-primary/10 text-universe-primary">
                    <ShieldCheck size={16} />
                </span>
                <h3 className="text-gray-500 dark:text-gray-400 text-sm font-medium tracking-wide">Entities Detected</h3>
            </div>
            <p className="text-4xl font-bold text-gray-800 dark:text-white mt-2 font-sans tracking-tight">{stats.totalEntities}</p>
        </div>
        <div className="w-full h-1 bg-gray-200 dark:bg-white/5 mt-4 rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-universe-primary to-universe-accent w-full" style={{ width: '100%' }}></div>
        </div>
      </div>

      {/* Similarity Score Card */}
      <div className="glass-panel p-6 rounded-2xl flex flex-col justify-between relative overflow-hidden group">
         <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <Zap size={80} className="text-gray-900 dark:text-white" />
        </div>
        <div>
             <div className="flex items-center gap-2 mb-2">
                <span className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400">
                    <Zap size={16} />
                </span>
                <h3 className="text-gray-500 dark:text-gray-400 text-sm font-medium tracking-wide">Context Preservation</h3>
            </div>
            <p className="text-4xl font-bold text-gray-800 dark:text-white mt-2 font-sans tracking-tight">{stats.similarityScore.toFixed(1)}%</p>
        </div>
        <div className="flex justify-between items-center mt-4 text-xs text-gray-500 font-mono">
            <span>Levenshtein Distance</span>
            <span className="text-gray-700 dark:text-gray-300">{stats.levenshteinDistance}</span>
        </div>
      </div>

      {/* Breakdown Chart */}
      <div className="glass-panel p-6 rounded-2xl md:row-span-2 flex flex-col">
        <h3 className="text-gray-500 dark:text-gray-400 text-sm font-medium mb-6 flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-universe-secondary"></div>
            Entity Distribution
        </h3>
        <div className="flex-1 min-h-[150px]">
            {data.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data} layout="vertical" margin={{ left: 0, right: 0 }}>
                    <XAxis type="number" hide />
                    <YAxis 
                        dataKey="name" 
                        type="category" 
                        width={110} 
                        tick={{fill: '#94a3b8', fontSize: 11, fontFamily: 'Plus Jakarta Sans'}} 
                        interval={0} 
                        axisLine={false}
                        tickLine={false}
                    />
                    <Tooltip 
                        contentStyle={{ 
                            backgroundColor: 'rgba(15, 23, 42, 0.9)', 
                            borderColor: 'rgba(255,255,255,0.1)', 
                            color: '#fff',
                            borderRadius: '8px',
                            backdropFilter: 'blur(4px)'
                        }}
                        itemStyle={{ color: '#fff' }}
                        cursor={{fill: 'rgba(139, 92, 246, 0.1)'}}
                    />
                    <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={20}>
                        {data.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                    </Bar>
                </BarChart>
                </ResponsiveContainer>
            ) : (
                <div className="flex flex-col items-center justify-center h-full text-gray-400 dark:text-gray-600 text-sm">
                    <div className="w-12 h-12 rounded-full bg-black/5 dark:bg-white/5 mb-3 flex items-center justify-center">
                        <Layers size={20} className="opacity-50"/>
                    </div>
                    Waiting for data...
                </div>
            )}
        </div>
      </div>
    </div>
  );
};