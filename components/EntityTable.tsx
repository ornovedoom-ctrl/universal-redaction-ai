import React from 'react';
import { DetectedEntity, EntityType } from '../types';
import { Hash, Type, AlignLeft } from 'lucide-react';

interface EntityTableProps {
  entities: DetectedEntity[];
}

const getBadgeStyle = (type: EntityType) => {
  switch (type) {
    case EntityType.PERSON: return 'bg-blue-500/10 text-blue-600 dark:text-blue-400 ring-1 ring-blue-500/20';
    case EntityType.LOCATION: return 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 ring-1 ring-emerald-500/20';
    case EntityType.EMAIL_ADDRESS: return 'bg-orange-500/10 text-orange-600 dark:text-orange-400 ring-1 ring-orange-500/20';
    case EntityType.CREDIT_CARD: return 'bg-rose-500/10 text-rose-600 dark:text-rose-400 ring-1 ring-rose-500/20';
    case EntityType.IP_ADDRESS: return 'bg-violet-500/10 text-violet-600 dark:text-violet-400 ring-1 ring-violet-500/20';
    case EntityType.URL: return 'bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 ring-1 ring-cyan-500/20';
    default: return 'bg-slate-500/10 text-slate-600 dark:text-slate-400 ring-1 ring-slate-500/20';
  }
};

export const EntityTable: React.FC<EntityTableProps> = ({ entities }) => {
  if (entities.length === 0) return null;

  return (
    <div className="glass-panel rounded-2xl overflow-hidden flex flex-col h-[500px] mt-8">
      <div className="p-5 border-b border-gray-200 dark:border-universe-border flex justify-between items-center bg-gray-50/50 dark:bg-white/5">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white flex items-center gap-2">
            <span className="w-1.5 h-1.5 bg-universe-accent rounded-full shadow-[0_0_8px_rgba(236,72,153,0.6)]"></span>
            Detection Log
        </h3>
        <span className="text-xs text-gray-500 font-mono px-2 py-1 rounded bg-black/5 dark:bg-black/20">
            {entities.length} records
        </span>
      </div>
      <div className="overflow-auto flex-1 p-0 custom-scrollbar">
        <table className="w-full text-left border-collapse">
          <thead className="bg-gray-50/80 dark:bg-universe-950/50 sticky top-0 z-10 backdrop-blur-sm">
            <tr>
              <th className="p-4 text-xs font-semibold text-gray-500 uppercase tracking-wider border-b border-gray-200 dark:border-universe-border w-40">
                  <div className="flex items-center gap-2"><Hash size={12}/> Type</div>
              </th>
              <th className="p-4 text-xs font-semibold text-gray-500 uppercase tracking-wider border-b border-gray-200 dark:border-universe-border">
                   <div className="flex items-center gap-2"><Type size={12}/> Content</div>
              </th>
              <th className="p-4 text-xs font-semibold text-gray-500 uppercase tracking-wider border-b border-gray-200 dark:border-universe-border w-24 text-right">
                   <div className="flex items-center justify-end gap-2"><AlignLeft size={12}/> Pos</div>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-universe-border">
            {entities.map((entity, idx) => (
              <tr key={idx} className="hover:bg-black/[0.02] dark:hover:bg-white/[0.02] transition-colors group">
                <td className="p-4 align-top">
                  <span className={`px-2.5 py-1 rounded-md text-[10px] font-medium uppercase tracking-wide ${getBadgeStyle(entity.type)}`}>
                    {entity.type.replace('_', ' ')}
                  </span>
                </td>
                <td className="p-4 align-top">
                    <span className="text-gray-700 dark:text-gray-300 font-mono text-xs">{entity.text}</span>
                </td>
                <td className="p-4 align-top text-right">
                    <span className="text-gray-500 dark:text-gray-600 font-mono text-[10px]">
                        {entity.startIndex}:{entity.endIndex}
                    </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};