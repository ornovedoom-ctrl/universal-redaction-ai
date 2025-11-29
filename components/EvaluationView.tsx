import React, { useMemo } from 'react';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { PieChart as PieChartIcon, Upload, AlertTriangle, CheckCircle, Split, FileText } from 'lucide-react';
import { calculateSimilarity } from '../utils/textProcessing';
import * as Diff from 'diff';

interface EvaluationViewProps {
  redactedText: string;
  expectedOutput: string;
  setExpectedOutput: (text: string) => void;
  onUpload: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

export const EvaluationView: React.FC<EvaluationViewProps> = ({ 
  redactedText, 
  expectedOutput, 
  setExpectedOutput, 
  onUpload 
}) => {
  const similarity = calculateSimilarity(expectedOutput, redactedText);
  
  const matchData = [
      { name: 'Match', value: similarity },
      { name: 'Mismatch', value: 100 - similarity }
  ];

  // Calculate differences
  const diffResult = useMemo(() => {
    if (!expectedOutput && !redactedText) return [];
    // diffChars gives us { value, added, removed }
    // We treat 'expectedOutput' as the source of truth (oldVal) and 'redactedText' as the system output (newVal).
    return Diff.diffChars(expectedOutput, redactedText);
  }, [expectedOutput, redactedText]);

  // Render Expected Output (Ground Truth)
  // Shows text that matches, and highlights text that was Removed (missing in system output) in Green
  const renderExpected = () => {
    if (!diffResult.length) return null;
    return diffResult.map((part, index) => {
        if (part.added) return null; // Skip text that only exists in System (errors)
        
        if (part.removed) {
            // Text exists in Expected but NOT in System -> Highlight Green
            return (
                <span key={index} className="bg-emerald-500/30 text-emerald-800 dark:text-emerald-300 font-bold px-0.5 rounded-[1px]">
                    {part.value}
                </span>
            );
        }
        // Match
        return <span key={index} className="opacity-70">{part.value}</span>;
    });
  };

  // Render System Output (Actual Result)
  // Shows text that matches, and highlights text that was Added (unexpected in system output) in Red
  const renderSystem = () => {
    if (!diffResult.length) return null;
    return diffResult.map((part, index) => {
        if (part.removed) return null; // Skip text that only exists in Expected
        
        if (part.added) {
            // Text exists in System but NOT in Expected -> Highlight Red
             return (
                <span key={index} className="bg-red-500/30 text-red-800 dark:text-red-300 font-bold px-0.5 rounded-[1px]">
                    {part.value}
                </span>
            );
        }
        // Match
        return <span key={index} className="opacity-70">{part.value}</span>;
    });
  };

  return (
      <div className="animate-in fade-in duration-500">
           <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                      <PieChartIcon className="text-universe-secondary"/> 
                      Accuracy Evaluation
                  </h2>
                  <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
                      Compare the generated redaction against a ground truth dataset.
                  </p>
              </div>
              
              <div className="flex items-center gap-4 text-xs font-medium">
                  <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                      <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                      <span>Expected (Original)</span>
                  </div>
                  <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20">
                      <div className="w-2 h-2 rounded-full bg-red-500"></div>
                      <span>Mismatch (System)</span>
                  </div>
              </div>
           </div>

           <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              {/* Left Column: Chart */}
              <div className="glass-panel p-6 rounded-2xl flex flex-col items-center justify-center min-h-[300px] lg:col-span-1">
                  <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-4 w-full text-left">Accuracy Score</h3>
                  <div className="relative w-full h-[200px]">
                      <ResponsiveContainer>
                          <PieChart>
                              <Pie
                                  data={matchData}
                                  innerRadius={60}
                                  outerRadius={80}
                                  paddingAngle={5}
                                  dataKey="value"
                                  stroke="none"
                              >
                                  <Cell fill="#10b981" /> {/* Match - Emerald */}
                                  <Cell fill="#ef4444" /> {/* Mismatch - Red */}
                              </Pie>
                              <Tooltip 
                                  contentStyle={{ 
                                      backgroundColor: 'rgba(15, 23, 42, 0.9)', 
                                      borderRadius: '8px', 
                                      border: 'none',
                                      color: 'white'
                                  }}
                              />
                              <Legend verticalAlign="bottom" height={36}/>
                          </PieChart>
                      </ResponsiveContainer>
                      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                          <span className="text-3xl font-bold text-gray-800 dark:text-white">{similarity.toFixed(1)}%</span>
                      </div>
                  </div>
                  <p className="text-xs text-gray-500 text-center mt-4">Levenshtein Similarity Index</p>
              </div>

              {/* Right Column: Comparison & Input */}
              <div className="lg:col-span-3 flex flex-col gap-6">
                  
                  {/* Side-by-Side Comparison Container */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 h-[400px]">
                      
                      {/* Expected / Original Pane */}
                      <div className="glass-panel rounded-xl overflow-hidden flex flex-col shadow-lg border-emerald-500/20">
                          <div className="p-3 border-b border-gray-200 dark:border-universe-border bg-emerald-500/5 flex justify-between items-center">
                              <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 text-xs font-bold uppercase tracking-wide">
                                <CheckCircle size={14} />
                                Expected Output (Ref)
                              </div>
                          </div>
                          <div className="flex-1 w-full bg-gray-50/50 dark:bg-black/20 p-4 font-mono text-sm text-gray-700 dark:text-gray-300 overflow-auto whitespace-pre-wrap leading-relaxed custom-scrollbar">
                             {expectedOutput ? renderExpected() : <span className="text-gray-400 italic">No reference text provided.</span>}
                          </div>
                      </div>

                      {/* System / Actual Pane */}
                      <div className="glass-panel rounded-xl overflow-hidden flex flex-col shadow-lg border-red-500/20">
                          <div className="p-3 border-b border-gray-200 dark:border-universe-border bg-red-500/5 flex justify-between items-center">
                              <div className="flex items-center gap-2 text-red-600 dark:text-red-400 text-xs font-bold uppercase tracking-wide">
                                <AlertTriangle size={14} />
                                System Output (Actual)
                              </div>
                          </div>
                          <div className="flex-1 w-full bg-gray-50/50 dark:bg-black/20 p-4 font-mono text-sm text-gray-700 dark:text-gray-300 overflow-auto whitespace-pre-wrap leading-relaxed custom-scrollbar">
                             {redactedText ? renderSystem() : <span className="text-gray-400 italic">No system output available. Run redaction first.</span>}
                          </div>
                      </div>
                  </div>

                  {/* Input for Expected Text */}
                  <div className="glass-panel rounded-xl overflow-hidden flex flex-col">
                      <div className="p-3 border-b border-gray-200 dark:border-universe-border bg-gray-50/50 dark:bg-white/5 flex justify-between items-center">
                          <span className="text-gray-500 dark:text-gray-400 text-xs font-bold uppercase tracking-wide flex items-center gap-2">
                              <FileText size={14}/>
                              Update Expected Output (Ground Truth)
                          </span>
                          <label className="cursor-pointer flex items-center gap-2 text-xs font-medium text-universe-primary hover:text-universe-accent transition-colors">
                              <Upload size={14} />
                              <span>Load File</span>
                              <input type="file" onChange={onUpload} className="hidden" />
                          </label>
                      </div>
                      <textarea 
                          value={expectedOutput}
                          onChange={(e) => setExpectedOutput(e.target.value)}
                          className="w-full bg-transparent p-4 font-mono text-xs text-gray-800 dark:text-gray-300 resize-none focus:outline-none placeholder-gray-400/50 h-24"
                          placeholder="Paste the perfect redaction text here to compare against the system output..."
                      />
                  </div>
              </div>
           </div>
      </div>
  );
};