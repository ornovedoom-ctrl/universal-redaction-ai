import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, Eye, EyeOff, Sparkles, Upload, RefreshCw, Command, 
  ArrowRight, Sun, Moon, LayoutTemplate, FileText
} from 'lucide-react';
import { EntityType, DetectedEntity, RedactionMode, ProcessingStats } from './types';
import { detectEntities } from './services/geminiService';
import { mapEntitiesToIndices, applyRedaction, calculateLevenshtein, calculateSimilarity } from './utils/textProcessing';
import { StatsDashboard } from './components/StatsDashboard';
import { EntityTable } from './components/EntityTable';
import { EvaluationView } from './components/EvaluationView';

const SAMPLE_TEXT = `Subject: Security Incident Report - 2023-10-27

From: sarah.connor@cyberdyne.net
To: john.smith@techcorp.com

An unauthorized access attempt was detected from IP address 192.168.1.45 at 14:30 EST. The intruder attempted to access the server located at 4500 Data Dr, Silicon Valley, CA.

Credit Card exposed: 4532-1234-5678-9010.
Please visit https://security-portal.internal/incident-101 for more details.

Contact Officer: John Smith at (555) 019-2834 immediately.`;

type Tab = 'redact' | 'eval';
type Theme = 'dark' | 'light';

function App() {
  const [inputText, setInputText] = useState<string>(SAMPLE_TEXT);
  const [redactedText, setRedactedText] = useState<string>('');
  const [entities, setEntities] = useState<DetectedEntity[]>([]);
  const [mode, setMode] = useState<RedactionMode>('MASK');
  const [loading, setLoading] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<Tab>('redact');
  const [theme, setTheme] = useState<Theme>('dark');
  const [expectedOutput, setExpectedOutput] = useState<string>('');
  
  const [stats, setStats] = useState<ProcessingStats>({
    totalEntities: 0,
    levenshteinDistance: 0,
    similarityScore: 100,
    breakdown: {} as Record<EntityType, number>
  });

  // Apply theme to document
  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [theme]);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const text = e.target?.result as string;
        if (activeTab === 'redact') {
            setInputText(text);
            setEntities([]);
            setRedactedText('');
        } else {
            setExpectedOutput(text);
        }
      };
      reader.readAsText(file);
    }
  };

  const processText = async () => {
    if (!inputText) return;
    setLoading(true);
    try {
      const rawEntities = await detectEntities(inputText);
      const mappedEntities = mapEntitiesToIndices(inputText, rawEntities);
      setEntities(mappedEntities);
    } catch (err) {
      console.error(err);
      alert("Failed to process text. Check API Key or Console.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (entities.length > 0) {
      const result = applyRedaction(inputText, entities, mode);
      setRedactedText(result);

      const breakdown = entities.reduce((acc, curr) => {
        acc[curr.type] = (acc[curr.type] || 0) + 1;
        return acc;
      }, {} as Record<EntityType, number>);

      setStats({
        totalEntities: entities.length,
        levenshteinDistance: calculateLevenshtein(inputText, result),
        similarityScore: calculateSimilarity(inputText, result),
        breakdown
      });
    } else {
      setRedactedText('');
      setStats({
        totalEntities: 0,
        levenshteinDistance: 0,
        similarityScore: 100,
        breakdown: {} as Record<EntityType, number>
      });
    }
  }, [entities, mode, inputText]);

  return (
    <div className="min-h-screen font-sans selection:bg-universe-primary selection:text-white flex flex-col">
      
      {/* Navbar */}
      <nav className="border-b border-gray-200 dark:border-universe-border bg-white/70 dark:bg-universe-950/50 backdrop-blur-md sticky top-0 z-50 transition-colors">
        <div className="container mx-auto px-6 h-16 flex justify-between items-center">
          <div className="flex items-center gap-8">
            <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-universe-primary to-universe-secondary flex items-center justify-center shadow-lg shadow-universe-primary/20">
                    <ShieldCheck size={18} className="text-white" />
                </div>
                <h1 className="text-lg font-bold tracking-tight text-gray-900 dark:text-white">
                Universal <span className="text-gray-500 dark:text-gray-400 font-normal">Redaction</span>
                </h1>
            </div>

            {/* Navigation Tabs */}
            <div className="hidden md:flex items-center p-1 bg-gray-100 dark:bg-white/5 rounded-lg border border-gray-200 dark:border-white/5">
                <button
                    onClick={() => setActiveTab('redact')}
                    className={`px-4 py-1.5 rounded-md text-xs font-medium transition-all ${
                        activeTab === 'redact' 
                        ? 'bg-white dark:bg-universe-800 text-universe-primary shadow-sm' 
                        : 'text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200'
                    }`}
                >
                    Redaction Tool
                </button>
                <button
                     onClick={() => setActiveTab('eval')}
                     className={`px-4 py-1.5 rounded-md text-xs font-medium transition-all ${
                        activeTab === 'eval' 
                        ? 'bg-white dark:bg-universe-800 text-universe-primary shadow-sm' 
                        : 'text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200'
                    }`}
                >
                    Accuracy Evaluation
                </button>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="hidden md:flex items-center gap-2 text-xs font-medium text-gray-500 bg-gray-100 dark:bg-white/5 px-3 py-1.5 rounded-full border border-gray-200 dark:border-white/5">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
                Team Super Saiyans
            </div>
            
            {/* Theme Toggle */}
            <button 
                onClick={() => setTheme(prev => prev === 'dark' ? 'light' : 'dark')}
                className="p-2 rounded-lg bg-gray-100 dark:bg-white/5 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-white/10 transition-colors"
                title="Toggle Theme"
            >
                {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
            </button>
          </div>
        </div>
      </nav>

      <main className="container mx-auto px-6 py-10 max-w-7xl flex-1">
        
        {activeTab === 'redact' ? (
            <>
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
                <div>
                    <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Secure Document Processing</h2>
                    <p className="text-gray-500 dark:text-gray-400 max-w-xl text-sm leading-relaxed">
                        Advanced PII detection and redaction system powered by pretrain AI model. 
                        Upload documents or paste text to instantly secure sensitive information.
                    </p>
                </div>

                <div className="flex items-center gap-3">
                    <div className="glass-panel p-1 rounded-lg flex items-center">
                        <button
                            onClick={() => setMode('MASK')}
                            className={`flex items-center gap-2 px-4 py-2 rounded-md text-xs font-semibold transition-all duration-300 ${mode === 'MASK' ? 'bg-universe-primary text-white shadow-lg shadow-universe-primary/25' : 'text-gray-500 hover:text-gray-800 dark:hover:text-gray-300'}`}
                        >
                            <EyeOff size={14} /> Mask
                        </button>
                        <button
                            onClick={() => setMode('REDACT')}
                            className={`flex items-center gap-2 px-4 py-2 rounded-md text-xs font-semibold transition-all duration-300 ${mode === 'REDACT' ? 'bg-universe-accent text-white shadow-lg shadow-universe-accent/25' : 'text-gray-500 hover:text-gray-800 dark:hover:text-gray-300'}`}
                        >
                            <Eye size={14} /> Redact
                        </button>
                    </div>
                    
                    <button
                        onClick={processText}
                        disabled={loading}
                        className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-sm tracking-wide transition-all shadow-xl ${
                            loading 
                            ? 'bg-gray-200 dark:bg-universe-800 text-gray-500 cursor-not-allowed border border-gray-300 dark:border-universe-border' 
                            : 'bg-universe-950 dark:bg-white text-white dark:text-universe-950 hover:scale-105 active:scale-95'
                        }`}
                    >
                        {loading ? <RefreshCw className="animate-spin" size={16}/> : <Sparkles size={16} className="text-universe-primary" />}
                        {loading ? 'Processing...' : 'Run Analysis'}
                    </button>
                </div>
            </div>

            {/* Stats */}
            {entities.length > 0 && <StatsDashboard stats={stats} />}

            {/* Editor Area */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 relative">
                
                {/* Divider arrow for large screens */}
                <div className="hidden lg:flex absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-white dark:bg-universe-950 border border-gray-200 dark:border-universe-border items-center justify-center text-gray-400 dark:text-gray-500 shadow-xl">
                    <ArrowRight size={16} />
                </div>

                {/* Input Section */}
                <div className="flex flex-col h-[600px] glass-panel rounded-2xl overflow-hidden border-gray-200 dark:border-universe-border/50 transition-colors hover:border-universe-primary/30 dark:hover:border-universe-border">
                    <div className="p-4 border-b border-gray-200 dark:border-universe-border bg-gray-50/50 dark:bg-white/[0.02] flex justify-between items-center">
                        <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400 text-sm font-medium">
                            <FileText size={16} />
                            <span>Source Document</span>
                        </div>
                        <label className="flex items-center gap-2 cursor-pointer text-xs font-medium text-universe-primary hover:text-universe-accent transition-colors">
                            <Upload size={14} />
                            <span>Upload File</span>
                            <input type="file" onChange={handleFileUpload} className="hidden" accept=".txt,.log,.csv" />
                        </label>
                    </div>
                    <div className="relative flex-1 group">
                        <textarea
                            value={inputText}
                            onChange={(e) => setInputText(e.target.value)}
                            className="w-full h-full bg-transparent p-6 font-mono text-sm text-gray-800 dark:text-gray-300 focus:outline-none resize-none placeholder-gray-400 dark:placeholder-gray-700 leading-relaxed custom-scrollbar"
                            placeholder="Paste your text here to begin analysis..."
                            spellCheck="false"
                        />
                    </div>
                    <div className="p-3 bg-gray-50/50 dark:bg-white/[0.02] border-t border-gray-200 dark:border-universe-border text-xs text-gray-500 dark:text-gray-600 font-mono flex justify-between">
                        <span>Ln {inputText.split('\n').length}, Col {inputText.length}</span>
                        <span>UTF-8</span>
                    </div>
                </div>

                {/* Output Section */}
                <div className="flex flex-col h-[600px] glass-panel rounded-2xl overflow-hidden border-gray-200 dark:border-universe-border/50 relative">
                    {loading && (
                        <div className="absolute inset-0 z-20 bg-white/80 dark:bg-universe-950/80 backdrop-blur-sm flex flex-col items-center justify-center">
                            <div className="w-12 h-12 border-4 border-universe-primary/30 border-t-universe-primary rounded-full animate-spin mb-4"></div>
                            <p className="text-sm font-medium text-universe-950 dark:text-white animate-pulse">Detecting entities...</p>
                        </div>
                    )}

                    <div className="p-4 border-b border-gray-200 dark:border-universe-border bg-universe-primary/5 flex justify-between items-center">
                        <div className="flex items-center gap-2 text-universe-primary text-sm font-medium">
                            <ShieldCheck size={16} />
                            <span>Redacted Output</span>
                        </div>
                        {entities.length > 0 && (
                            <div className="flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                                <span className="text-xs text-emerald-500 font-medium">Secure</span>
                            </div>
                        )}
                    </div>
                    <div className="relative flex-1 bg-gray-50 dark:bg-black/20">
                        <div className="w-full h-full p-6 font-mono text-sm text-gray-800 dark:text-gray-300 overflow-auto whitespace-pre-wrap leading-relaxed custom-scrollbar">
                            {redactedText || (
                                <div className="h-full flex flex-col items-center justify-center text-gray-400 dark:text-gray-600 gap-4">
                                    <Command size={48} className="opacity-20" />
                                    <p className="text-sm">Processed output will appear here</p>
                                </div>
                            )}
                        </div>
                    </div>
                    <div className="p-3 bg-gray-50/50 dark:bg-white/[0.02] border-t border-gray-200 dark:border-universe-border text-xs text-gray-500 dark:text-gray-600 font-mono flex justify-end gap-4">
                        {entities.length > 0 && <span>{entities.length} items modified</span>}
                    </div>
                </div>
            </div>

            {/* Floating Table */}
            <EntityTable entities={entities} />
            </>
        ) : (
            <EvaluationView 
                redactedText={redactedText}
                expectedOutput={expectedOutput}
                setExpectedOutput={setExpectedOutput}
                onUpload={handleFileUpload}
            />
        )}
      </main>

      <Footer />
    </div>
  );
}

const Footer = () => (
    <footer className="border-t border-gray-200 dark:border-universe-border bg-white/50 dark:bg-universe-950/50 backdrop-blur-md py-8 mt-12">
        <div className="container mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="text-sm text-gray-500 dark:text-gray-400">
                &copy; {new Date().getFullYear()} Universal Redaction Tool. All rights reserved. Team Super Saiyans
            </div>
            <div className="flex items-center gap-6">
                <a href="#" className="text-gray-400 hover:text-universe-primary transition-colors text-sm">Privacy Policyyyy</a>
                <a href="#" className="text-gray-400 hover:text-universe-primary transition-colors text-sm">Terms of Service</a>
                <div className="flex items-center gap-2 text-gray-500 text-sm">
                    <LayoutTemplate size={14}/>
                    <span>v2.5.0</span>
                </div>
            </div>
        </div>
    </footer>
);

export default App;