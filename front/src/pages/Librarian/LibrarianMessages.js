import React from 'react';
import { motion } from 'framer-motion';
import { MessageSquare, Search, User, Send, Bell, Shield, ChevronRight } from 'lucide-react';

const LibrarianMessages = () => {
    return (
        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="h-[calc(100vh-140px)] flex flex-col font-outfit pb-10">
            <div className="flex justify-between items-end mb-8 flex-shrink-0">
                <div>
                    <h1 className="text-3xl font-black text-amber-500 italic uppercase tracking-tighter mb-1 leading-none">Institutional Messaging</h1>
                    <p className="text-[11px] font-black text-slate-500 uppercase tracking-widest italic opacity-70 leading-none">Internal communication channel for institutional nodes.</p>
                </div>
            </div>

            <div className="flex-1 bg-neutral-900 border border-slate-800/60 rounded-md shadow-2xl overflow-hidden flex divide-x divide-slate-800/40">
                <div className="w-80 flex flex-col">
                    <div className="p-6 border-b border-slate-800/60 bg-neutral-950/40 flex-shrink-0">
                        <div className="relative">
                            <Search className="absolute left-3 top-2.5 text-slate-600" size={12} />
                            <input 
                                type="text" 
                                placeholder="Identify node..." 
                                className="bg-neutral-950 border border-slate-800/60 rounded-md py-2 pl-9 pr-4 text-[10px] font-bold text-slate-200 focus:outline-none focus:border-amber-600/50 transition-all w-full italic uppercase tracking-widest"
                            />
                        </div>
                    </div>
                    
                    <div className="flex-1 overflow-y-auto custom-scrollbarThin p-1 bg-neutral-950/20">
                        {[1, 2, 3].map((_, i) => (
                            <button 
                                key={i}
                                className={`w-full p-4 flex items-center gap-4 hover:bg-white/5 transition-all text-left group border-b border-slate-800/20 last:border-0 rounded-md mb-1 ${i === 0 ? 'bg-amber-600/5 border-amber-600/20' : ''}`}
                            >
                                <div className="w-10 h-10 rounded-md bg-neutral-900 border border-slate-800 flex flex-shrink-0 items-center justify-center text-slate-600 group-hover:border-amber-500/40 transition-all">
                                    <User size={18} />
                                </div>
                                <div className="flex-1 overflow-hidden">
                                    <div className="flex justify-between items-center mb-1">
                                        <span className="text-[10px] font-bold text-slate-200 uppercase italic tracking-tight">{i === 0 ? 'Admin Office' : i === 1 ? 'Principal' : 'Faculty Sub-node'}</span>
                                        <span className="text-[8px] font-black text-slate-600 tracking-tighter">04:15 PM</span>
                                    </div>
                                    <p className="text-[9px] font-bold text-slate-500 italic truncate opacity-60">Pending archive verification for session 2026...</p>
                                </div>
                            </button>
                        ))}
                    </div>
                </div>

                <div className="flex-1 flex flex-col bg-neutral-950/10">
                    <div className="p-6 border-b border-slate-800/60 bg-neutral-950/40 flex items-center justify-between flex-shrink-0">
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-md bg-neutral-900 border border-amber-600/20 flex items-center justify-center text-amber-500">
                                <Shield size={18} />
                            </div>
                            <div>
                                <h3 className="text-xs font-black uppercase text-slate-100 italic tracking-tighter">Admin Office Node</h3>
                                <p className="text-[8px] font-bold text-slate-600 uppercase tracking-widest italic leading-none mt-1 shadow-inner px-2 py-0.5 border border-slate-800 rounded bg-neutral-950">Active Transmission Status: Encrypted</p>
                            </div>
                        </div>
                    </div>

                    <div className="flex-1 p-8 overflow-y-auto flex flex-col gap-6 custom-scrollbarThin">
                        <div className="max-w-[80%] p-4 bg-neutral-900 border border-slate-800/60 rounded-md relative shadow-xl">
                            <p className="text-xs font-bold text-slate-300 italic">Please verify the status of overdue volumes for the Science department. Some records appear inconsistent.</p>
                            <span className="text-[8px] font-black text-slate-600 mt-3 block italic tracking-tighter">02:30 PM / EXTERNAL NODE</span>
                        </div>
                        
                        <div className="max-w-[80%] self-end p-4 bg-amber-600/10 border border-amber-600/20 rounded-md relative shadow-xl">
                            <p className="text-xs font-bold text-slate-200 italic">Scanning records now. The discrepancy might be due to the recent system upgrade. Will report once protocol is complete.</p>
                            <span className="text-[8px] font-black text-amber-600/40 mt-3 block italic tracking-tighter">03:45 PM / ARCHIVE NODE</span>
                        </div>
                    </div>

                    <div className="p-6 border-t border-slate-800/60 flex gap-4 flex-shrink-0">
                        <input 
                            type="text" 
                            placeholder="Type institutional transmission..." 
                            className="flex-1 bg-neutral-950 border border-slate-800/60 rounded-md px-6 py-4 text-[10px] font-bold text-slate-100 focus:outline-none focus:border-amber-600/50 transition-all italic tracking-[0.1em] placeholder:text-slate-700"
                        />
                        <button className="w-14 h-14 bg-amber-600 text-white rounded-md flex items-center justify-center shadow-lg shadow-amber-600/20 hover:translate-y-[-2px] hover:bg-amber-700 transition-all">
                            <Send size={18} />
                        </button>
                    </div>
                </div>
            </div>
        </motion.div>
    );
};

export default LibrarianMessages;
