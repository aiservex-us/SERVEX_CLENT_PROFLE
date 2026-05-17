"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { marked } from "marked";
import { 
  Plus, Mic, ChevronDown, Database, Sparkles,
  ArrowRight, Check, BarChart3, 
  Settings, HelpCircle, Shield, Layout, Zap
} from 'lucide-react';

export default function TeamsAgentChat() {
  const [selectedAgent, setSelectedAgent] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  
  // States del diseño de Teams
  const [mode, setMode] = useState('platform');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [context, setContext] = useState('Servex US');

  const messagesEndRef = useRef(null);
  const apiURL = process.env.NEXT_PUBLIC_API_URL || "https://generative-glynne-motor.onrender.com";

  useEffect(() => {
    setSelectedAgent({ agent_name: "SVX Copilot", role: "AI Assistant" });
  }, []);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => { scrollToBottom(); }, [messages, scrollToBottom]);

  const sendMessage = async () => {
    const queryToSend = input.trim();
    if (!queryToSend || isLoading) return;

    const userMsg = { 
      from: "user", 
      text: queryToSend, 
      time: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) 
    };
    setMessages(prev => [...prev, userMsg]);
    setInput("");
    setIsLoading(true);

    try {
      const res = await fetch(`${apiURL}/dynamic/agent/chat/full`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mensaje: queryToSend, agent_config: selectedAgent }),
      });
      const data = await res.json();
      setMessages(prev => [...prev, { 
        from: "bot", 
        text: data?.reply || "No recibí respuesta.",
        time: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) 
      }]);
    } catch (e) {
      setMessages(prev => [...prev, { from: "bot", text: "❌ Error de conexión.", time: "--:--" }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full h-[95vh] flex flex-col bg-white font-sans text-gray-800 relative overflow-hidden">
      
      <main className="flex-1 overflow-y-auto custom-scrollbar">
        {/* Ajustado padding horizontal responsivo de px-6 a px-4 md:px-6 */}
        <div className="max-w-4xl mx-auto px-4 md:px-6 py-6 md:py-8">
          
          {messages.length === 0 ? (
            /* --- VISTA INICIAL (CENTRADA Y ORDENADA) --- */
            <div className="flex flex-col">
              {/* Header */}
              <div className="mb-6 md:mb-8 border-b border-gray-200 pb-6">
                <div className="flex items-center gap-2 text-[#5B5FC7] mb-2">
                  <Sparkles size={18} fill="#5B5FC7" fillOpacity={0.2} />
                  <span className="text-xs font-bold uppercase tracking-wider">Contextual Assistance Center</span>
                </div>
                <h1 className="text-xl md:text-2xl font-bold text-gray-900 mb-1">Welcome to Servex Copilot</h1>
                <p className="text-xs md:text-sm text-gray-500 max-w-2xl">
                  Learn processes, resolve platform questions, or analyze critical data. 2025 Docs Synchronized.
                </p>
              </div>

              {/* Grid de Información - Ajustado de gap-3 a gap-2 en móvil */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-2 md:gap-3 mb-6 md:mb-8">
                <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-all">
                  <Layout size={20} className="text-[#5B5FC7] mb-3" />
                  <h3 className="text-sm font-bold mb-1">Platform Guide</h3>
                  <p className="text-xs text-gray-500">Workflows, roles, and technical configurations.</p>
                </div>
                <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-all">
                  <BarChart3 size={20} className="text-[#5B5FC7] mb-3" />
                  <h3 className="text-sm font-bold mb-1">Data Analytics</h3>
                  <p className="text-xs text-gray-500">Real-time queries on inventory and KPIs.</p>
                </div>
                <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-all">
                  <Shield size={20} className="text-[#5B5FC7] mb-3" />
                  <h3 className="text-sm font-bold mb-1">Secure Support</h3>
                  <p className="text-xs text-gray-500">Restricted access under SVX privacy policies.</p>
                </div>
              </div>

              {/* Selector de Modo */}
              <div className="flex gap-1 bg-gray-100 p-1 rounded-md w-fit mb-4">
                {['platform', 'data'].map((m) => (
                  <button key={m} onClick={() => setMode(m)} className={`px-3 md:px-4 py-1.5 rounded text-[11px] md:text-xs font-semibold transition-all ${mode === m ? 'bg-white text-[#5B5FC7] shadow-sm' : 'text-gray-500'}`}>
                    {m === 'platform' ? 'User Manual' : 'Business Intelligence'}
                  </button>
                ))}
              </div>

              {/* INPUT BOX INTEGRADO - Ajustado comportamiento del Header a flex-wrap en móviles */}
              <div className="bg-white border border-gray-300 rounded-lg shadow-lg overflow-hidden focus-within:border-[#5B5FC7] focus-within:ring-1 focus-within:ring-[#5B5FC7]">
                <div className="flex flex-wrap items-center gap-2 px-3 md:px-4 py-2 bg-gray-50 border-b border-gray-200 relative">
                  <button onClick={() => setIsDropdownOpen(!isDropdownOpen)} className="flex items-center gap-2 text-[11px] font-bold text-gray-600 bg-white border border-gray-300 px-2 py-1 rounded shrink-0">
                    <Database size={12} className="text-[#5B5FC7]" /> CONTEXT: {context} <ChevronDown size={12} />
                  </button>
                  {isDropdownOpen && (
                    <div className="absolute top-9 left-3 md:left-4 w-48 bg-white border border-gray-200 shadow-xl rounded z-50 py-1">
                      {['Servex US', 'Servex LATAM', 'General HQ'].map((ctx) => (
                        <button key={ctx} onClick={() => { setContext(ctx); setIsDropdownOpen(false); }} className="w-full text-left px-3 py-2 text-xs hover:bg-gray-100 flex justify-between items-center">
                          {ctx} {context === ctx && <Check size={12} className="text-[#5B5FC7]" />}
                        </button>
                      ))}
                    </div>
                  )}
                  <div className="hidden sm:block h-4 w-[1px] bg-gray-300 mx-1" />
                  <div className="flex items-center gap-1.5 text-[10px] text-gray-400 font-medium ml-auto sm:ml-0"><Zap size={10} className="text-yellow-500 fill-yellow-500" /> ENGINE v4.10 READY</div>
                </div>
                <div className="p-3 md:p-4">
                  <textarea 
                    className="w-full text-sm text-gray-700 border-none focus:ring-0 resize-none bg-transparent placeholder-gray-400 min-h-[80px] md:min-h-[100px]"
                    placeholder={mode === 'platform' ? "Ex: How do I configure permissions?" : "Ex: Show me the purchase report..."}
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => { if(e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); }}}
                  />
                </div>
                <div className="flex justify-between items-center px-3 md:px-4 py-2 border-t border-gray-100 bg-white">
                  <div className="flex items-center gap-3 text-gray-400">
                    <Plus size={18} className="cursor-pointer hover:text-[#5B5FC7]" /><Mic size={18} className="cursor-pointer hover:text-[#5B5FC7]" /><HelpCircle size={18} className="cursor-pointer hover:text-[#5B5FC7]" />
                  </div>
                  <button onClick={sendMessage} disabled={!input.trim() || isLoading} className={`flex items-center gap-2 px-4 md:px-6 py-2 rounded-md font-bold text-xs transition-all ${input.trim() ? 'bg-[#5B5FC7] text-white hover:bg-[#4E52B1]' : 'bg-gray-100 text-gray-400 border border-gray-200'}`}>
                    <span>Send Query</span> <ArrowRight size={14} />
                  </button>
                </div>
              </div>

              {/* Suggestions - Se previene overflow forzando un wrap correcto y márgenes cómodos */}
              <div className="mt-4 md:mt-6 flex flex-wrap gap-2 md:gap-4 items-center">
                <span className="text-[11px] font-bold text-gray-400 uppercase italic">Suggestions:</span>
                {["Export reports", "Create user", "Monthly KPI"].map((tip, i) => (
                  <button key={i} onClick={() => setInput(tip)} className="text-[11px] text-[#5B5FC7] hover:underline font-medium bg-slate-50 md:bg-transparent px-2 py-1 md:p-0 rounded-full border border-slate-100 md:border-none">{tip}</button>
                ))}
              </div>
            </div>
          ) : (
            /* --- FLUJO DE CHAT (MENSAJES) --- */
            // Ajustado ancho máximo de los globos de texto (`max-w-[85%]` a `max-w-full md:max-w-[85%]`) para aprovechar pantallas pequeñas
            <div className="space-y-6 md:space-y-8">
              {messages.map((msg, idx) => {
                const isUser = msg.from === 'user';
                return (
                  <motion.div key={idx} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className={`flex gap-2 md:gap-4 w-full ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
                    <div className={`w-8 h-8 md:w-9 md:h-9 rounded-xl shrink-0 flex items-center justify-center text-white text-xs font-bold shadow-sm ${isUser ? 'bg-slate-700' : 'bg-[#6264A7]'}`}>
                      {isUser ? 'ME' : 'AI'}
                    </div>
                    <div className={`flex flex-col max-w-[88%] md:max-w-[85%] ${isUser ? 'items-end' : 'items-start'}`}>
                      <div className={`flex items-baseline gap-2 mb-1 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
                        <span className="font-bold text-xs md:text-sm text-slate-700">{isUser ? 'You' : selectedAgent?.agent_name}</span>
                        <span className="text-[9px] md:text-[10px] text-gray-400 font-medium">{msg.time}</span>
                      </div>
                      <div className={`p-3 md:p-4 rounded-2xl text-[13px] md:text-[13.5px] leading-relaxed border shadow-sm ${isUser ? 'bg-white border-gray-200 text-gray-700 rounded-tr-none' : 'bg-[#6264A7]' + ' border-[#6264A7] text-white rounded-tl-none'}`}>
                        {msg.from === "bot" ? (
                          <div className="prose prose-sm prose-invert max-w-none break-words" dangerouslySetInnerHTML={{ __html: marked.parse(msg.text) }} />
                        ) : (
                          <p className="whitespace-pre-wrap break-words">{msg.text}</p>
                        )}
                      </div>
                    </div>
                  </motion.div>
                );
              })}
              {isLoading && (
                <div className="flex gap-4 animate-pulse">
                  <div className="w-8 h-8 md:w-9 md:h-9 rounded-xl bg-slate-200"></div>
                  <div className="h-12 w-24 bg-white border border-slate-200 rounded-2xl rounded-tl-none"></div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>
      </main>

      {/* --- FOOTER DE RESPUESTA (SOLO EN CHAT ACTIVO) --- */}
      {messages.length > 0 && (
        <div className="p-3 md:p-4 bg-white border-t border-gray-100 shrink-0">
          <div className="max-w-4xl mx-auto flex items-center gap-1 md:gap-2 bg-gray-50 rounded-xl p-1.5 md:p-2 border border-gray-200 focus-within:border-[#5B5FC7]">
            <Plus size={20} className="text-gray-400 ml-1 md:ml-2 cursor-pointer hover:text-[#5B5FC7] shrink-0" />
            <input 
              className="flex-1 bg-transparent border-none focus:ring-0 text-sm py-1.5 px-1 min-w-0"
              placeholder="Reply to SVX Copilot..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => { if(e.key === 'Enter') sendMessage(); }}
            />
            <button onClick={sendMessage} className={`p-1.5 md:p-2 rounded-lg transition-colors shrink-0 ${input.trim() ? 'text-[#5B5FC7]' : 'text-gray-300'}`}>
              <ArrowRight size={20} />
            </button>
          </div>
        </div>
      )}

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #cbd5e1; }
      `}</style>
    </div>
  );
}