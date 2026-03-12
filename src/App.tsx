/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Ghost, Skull, Video, Link as LinkIcon, AlertTriangle, Loader2, Sparkles, Share2, Copy, Check } from 'lucide-react';
interface ScriptVersion {
  title: string;
  script: string;
}

interface ScriptResult {
  versions: ScriptVersion[];
}

export default function App() {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ScriptResult | null>(null);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [loadingMessage, setLoadingMessage] = useState('Summoning the darkness...');
  const [copied, setCopied] = useState(false);

  const loadingMessages = [
    "Peering into the digital abyss...",
    "Extracting the hidden horrors...",
    "The shadows are watching the video...",
    "Translating the screams...",
    "Binding the nightmare to text...",
    "The void is analyzing your link..."
  ];

  const analyzeVideo = async () => {
    if (!url) {
      setError("The void requires a link to feed upon.");
      return;
    }

    try {
      new URL(url);
    } catch {
      setError("That does not look like a valid URL. Paste the full video link.");
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);
    setSelectedIndex(0);

    // Rotate loading messages
    const messageInterval = setInterval(() => {
      setLoadingMessage(loadingMessages[Math.floor(Math.random() * loadingMessages.length)]);
    }, 2500);

    try {
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url }),
      });

      const payload = await response.json();
      if (!response.ok) {
        const errorMessage = typeof payload?.error === 'string' ? payload.error : 'Request failed.';
        throw new Error(errorMessage);
      }

      setResult(payload as ScriptResult);
    } catch (err: unknown) {
      console.error(err);
      const message = err instanceof Error ? err.message : 'Unknown error';
      if (message.toLowerCase().includes('api key')) {
        setError('Gemini rejected the API key. Please verify the key permissions in Google AI Studio.');
      } else if (message.toLowerCase().includes('quota')) {
        setError('Gemini quota exceeded. Please try again later.');
      } else {
        setError(message || 'The connection to the abyss was severed. Try another link.');
      }
    } finally {
      clearInterval(messageInterval);
      setLoading(false);
    }
  };

  const copyToClipboard = () => {
    if (result && result.versions[selectedIndex]) {
      const current = result.versions[selectedIndex];
      navigator.clipboard.writeText(`${current.title}\n\n${current.script}`);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 relative">
      <div className="atmosphere-bg" />
      
      {/* Header */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-12"
      >
        <div className="flex items-center justify-center gap-3 mb-2">
          <Skull className="w-10 h-10 text-red-600" />
          <h1 className="text-5xl font-black tracking-tighter glitch-text uppercase">VoidScript</h1>
        </div>
        <p className="text-red-500/60 font-mono text-xs tracking-[0.3em] uppercase">Eerie Video Analysis Engine</p>
      </motion.div>

      {/* Input Section */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-2xl bg-white/5 backdrop-blur-xl border border-white/10 p-8 rounded-3xl shadow-2xl"
      >
        <div className="relative group">
          <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
            <LinkIcon className="w-5 h-5 text-white/30 group-focus-within:text-red-500 transition-colors" />
          </div>
          <input 
            type="text"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="Paste the cursed URL here..."
            className="w-full bg-black/40 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-white placeholder:text-white/20 focus:outline-none focus:border-red-600/50 focus:ring-1 focus:ring-red-600/20 transition-all"
          />
        </div>

        <button
          onClick={analyzeVideo}
          disabled={loading}
          className="w-full mt-6 bg-red-700 hover:bg-red-600 disabled:bg-red-900/50 disabled:cursor-not-allowed text-white font-bold py-4 rounded-2xl transition-all flex items-center justify-center gap-2 group relative overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
          {loading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>{loadingMessage}</span>
            </>
          ) : (
            <>
              <Sparkles className="w-5 h-5" />
              <span>ANALYZE & SCRIPT</span>
            </>
          )}
        </button>

        {error && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-4 flex items-center gap-2 text-red-400 text-sm bg-red-950/30 p-3 rounded-xl border border-red-900/50"
          >
            <AlertTriangle className="w-4 h-4" />
            {error}
          </motion.div>
        )}
      </motion.div>

      {/* Result Section */}
      <AnimatePresence mode="wait">
        {result && (
          <motion.div
            key="results"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="w-full max-w-3xl mt-12 space-y-6"
          >
            {/* Version Selector */}
            <div className="flex justify-center gap-4 mb-4">
              {result.versions.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedIndex(idx)}
                  className={`px-6 py-2 rounded-full font-mono text-xs tracking-widest transition-all border ${
                    selectedIndex === idx 
                      ? 'bg-red-600 border-red-600 text-white shadow-[0_0_15px_rgba(220,38,38,0.5)]' 
                      : 'bg-white/5 border-white/10 text-white/40 hover:text-white hover:border-white/20'
                  }`}
                >
                  VERSION 0{idx + 1}
                </button>
              ))}
            </div>

            <motion.div 
              key={selectedIndex}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3 }}
              className="bg-white/5 backdrop-blur-2xl border border-white/10 rounded-3xl p-10 relative overflow-hidden group/card"
            >
              <div className="absolute top-0 left-0 w-1 h-full bg-red-600 group-hover/card:w-2 transition-all duration-500" />
              
              {/* Scanline effect */}
              <div className="absolute inset-0 pointer-events-none opacity-5 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_2px,3px_100%]" />

              <div className="flex justify-between items-start mb-6 relative z-10">
                <div className="space-y-1">
                  <span className="text-[10px] font-mono text-red-500 uppercase tracking-widest flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-red-600 animate-pulse" />
                    The Prophecy (v0{selectedIndex + 1})
                  </span>
                  <h2 className="text-3xl font-bold text-white italic serif tracking-tight">
                    {result.versions[selectedIndex].title}
                  </h2>
                </div>
                <div className="flex gap-2">
                  <button 
                    onClick={copyToClipboard}
                    className="p-2.5 hover:bg-white/10 rounded-xl transition-all border border-white/5 flex items-center gap-2 text-xs text-white/40 hover:text-white"
                  >
                    {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                    <span className="hidden sm:inline">{copied ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>
              </div>

              <div className="relative z-10">
                <Ghost className="absolute -right-8 -bottom-8 w-32 h-32 text-white/[0.03] pointer-events-none rotate-12" />
                <p className="text-xl leading-relaxed text-white/90 font-serif italic first-letter:text-6xl first-letter:font-bold first-letter:mr-4 first-letter:float-left first-letter:text-red-600 first-letter:leading-none">
                  {result.versions[selectedIndex].script}
                </p>
              </div>

              <div className="mt-8 pt-6 border-t border-white/5 flex items-center justify-between text-[10px] font-mono text-white/30 uppercase tracking-widest">
                <span>Generated by VoidScript v1.0</span>
                <span>Source: {(() => {
                  try {
                    return new URL(url).hostname;
                  } catch {
                    return 'Unknown Source';
                  }
                })()}</span>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Footer */}
      <div className="mt-auto pt-12 text-white/20 text-[10px] font-mono uppercase tracking-[0.5em]">
        Do not look behind you
      </div>
    </div>
  );
}
