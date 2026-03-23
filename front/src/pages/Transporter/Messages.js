import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useDispatch, useSelector } from 'react-redux';
import { fetchContacts, fetchChatHistory, sendMessageSlice } from '../../redux/slice/communication.slice';
import { fetchRoutesSlice } from '../../redux/slice/transport.slice';
import { Search, Send, User, MessageSquare, Phone, MapPin, Bus, Filter, Plus, X, Navigation } from 'lucide-react';

const Messages = () => {
    const dispatch = useDispatch();
    const { contacts, messages, loading } = useSelector((state) => state.communication);
    const { routes } = useSelector((state) => state.transport);
    
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedChat, setSelectedChat] = useState(null);
    const [messageInput, setMessageInput] = useState('');
    const [isBroadcastOpen, setIsBroadcastOpen] = useState(false);
    const [broadcastData, setBroadcastData] = useState({
        subject: '',
        content: '',
        targetRoles: ['Parent']
    });

    useEffect(() => {
        dispatch(fetchContacts());
        dispatch(fetchRoutesSlice());
    }, [dispatch]);

    useEffect(() => {
        if (selectedChat) {
            dispatch(fetchChatHistory(selectedChat._id));
        }
    }, [selectedChat, dispatch]);

    const handleSend = (e) => {
        e.preventDefault();
        if (!messageInput.trim() || !selectedChat) return;
        
        dispatch(sendMessageSlice({
            recipient: selectedChat._id,
            subject: 'Direct Message',
            content: messageInput
        }));
        setMessageInput('');
    }

    const filteredContacts = contacts.filter(c => 
        (c.firstName + ' ' + c.lastName).toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="h-[calc(100vh-180px)] font-outfit">
            <div className="flex justify-between items-end px-2 mb-8">
                <div>
                    <h1 className="text-3xl font-black italic uppercase tracking-tighter mb-1 leading-none text-sky-500">Comms Matrix</h1>
                    <p className="text-[11px] font-black text-slate-500 uppercase tracking-widest italic opacity-70 leading-none">Establishing direct linkage between transport operators and parent nodes.</p>
                </div>
                <button 
                    onClick={() => setIsBroadcastOpen(true)}
                    className="px-6 py-4 bg-sky-600 text-white text-[11px] font-black italic uppercase tracking-widest rounded-md shadow-lg shadow-sky-600/20 hover:shadow-sky-600/40 hover:translate-y-[-2px] transition-all flex items-center gap-2 group leading-none whitespace-nowrap"
                >
                    <Plus size={14} /> broadcast pulse
                </button>
            </div>

            <div className="flex gap-6 h-full">
                {/* Chat Sidebar */}
                <div className="w-80 bg-neutral-900 border border-slate-800/60 rounded-md overflow-hidden flex flex-col shadow-2xl">
                    <div className="p-5 border-b border-slate-800/60">
                        <div className="relative">
                            <Search className="absolute left-3 top-2.5 text-slate-600" size={14} />
                            <input 
                                type="text" 
                                placeholder="Locate Parent Node..." 
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="bg-neutral-950 border border-slate-800/60 rounded-md py-2.5 pl-9 pr-4 text-[10px] font-black uppercase text-slate-200 focus:outline-none focus:border-sky-600/50 transition-all w-full italic"
                            />
                        </div>
                    </div>
                    
                    <div className="flex-1 overflow-y-auto custom-scrollbar">
                        {filteredContacts.map((chat) => (
                            <button 
                                key={chat._id}
                                onClick={() => setSelectedChat(chat)}
                                className={`w-full p-4 border-b border-slate-800/40 flex items-start gap-4 transition-all hover:bg-neutral-950/60 text-left relative ${selectedChat?._id === chat._id ? 'bg-neutral-950/80 border-l-4 border-l-sky-500' : ''}`}
                            >
                                <div className="relative flex-shrink-0">
                                    <div className="w-10 h-10 rounded-md bg-neutral-950 border border-slate-800 flex items-center justify-center text-slate-600 overflow-hidden">
                                        {chat.photo ? <img src={chat.photo} alt="" className="w-full h-full object-cover" /> : <User size={18} />}
                                    </div>
                                    <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-neutral-900 bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]"></div>
                                </div>
                                <div className="flex-1 overflow-hidden">
                                    <div className="flex justify-between items-center mb-1">
                                        <h4 className="text-[11px] font-black text-slate-200 uppercase italic tracking-tighter truncate">{chat.firstName} {chat.lastName}</h4>
                                    </div>
                                    <p className="text-[9px] font-black text-sky-500 uppercase italic tracking-widest leading-none mb-1.5 opacity-80">{chat.role?.replace('_', ' ')}</p>
                                    <p className="text-[10px] text-slate-500 italic truncate leading-tight">Click to establish connection...</p>
                                </div>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Chat Window */}
                <div className="flex-1 bg-neutral-900 border border-slate-800/60 rounded-md overflow-hidden flex flex-col shadow-2xl relative">
                    {selectedChat ? (
                        <>
                            <div className="px-8 py-5 border-b border-slate-800/60 bg-neutral-950/40 flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-md bg-neutral-950 border border-slate-800 flex items-center justify-center text-sky-500 overflow-hidden">
                                        {selectedChat.photo ? <img src={selectedChat.photo} alt="" className="w-full h-full object-cover" /> : <MessageSquare size={18} />}
                                    </div>
                                    <div>
                                        <h3 className="text-md font-black text-slate-100 uppercase italic tracking-tighter">{selectedChat.firstName} {selectedChat.lastName}</h3>
                                        <p className="text-[9px] font-black text-slate-500 uppercase italic tracking-widest">{selectedChat.role?.replace('_', ' ')}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <button className="p-2.5 text-slate-600 hover:text-sky-400 bg-neutral-950 border border-slate-800 rounded-md transition-all"><Phone size={14} /></button>
                                    <button className="p-2.5 text-slate-600 hover:text-sky-400 bg-neutral-950 border border-slate-800 rounded-md transition-all"><MapPin size={14} /></button>
                                </div>
                            </div>
                            
                            <div className="flex-1 p-8 overflow-y-auto custom-scrollbar flex flex-col gap-6">
                                {messages.map((msg) => {
                                    const isMe = msg.sender?._id === localStorage.getItem('userId') || msg.sender === localStorage.getItem('userId');
                                    return (
                                        <div key={msg._id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                                            <div className={`max-w-[70%] p-4 rounded-md border ${isMe ? 'bg-sky-600/10 border-sky-600/30 rounded-tr-none' : 'bg-neutral-950 border-slate-800 rounded-tl-none'}`}>
                                                <p className={`text-[11px] leading-relaxed ${isMe ? 'text-slate-200' : 'text-slate-300'}`}>{msg.content}</p>
                                                <div className={`flex items-center gap-2 mt-2 opacity-40 ${isMe ? 'justify-end' : 'justify-start'}`}>
                                                    <span className="text-[8px] font-bold text-slate-500 uppercase italic">{new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                            
                            <div className="p-6 border-t border-slate-800/60 bg-neutral-950/20">
                                <form 
                                    onSubmit={handleSend}
                                    className="flex items-center gap-4 bg-neutral-950 border border-slate-800 rounded-md p-1.5 focus-within:border-sky-600/50 transition-all"
                                >
                                    <input 
                                        type="text" 
                                        value={messageInput}
                                        onChange={(e) => setMessageInput(e.target.value)}
                                        placeholder="Type signal here..." 
                                        className="flex-1 bg-transparent border-none text-[11px] font-black text-slate-200 focus:ring-0 px-4 italic"
                                    />
                                    <button type="submit" className="bg-sky-600 text-white p-2.5 rounded-md hover:bg-sky-700 transition-all shadow-lg shadow-sky-600/20">
                                        <Send size={14} className="rotate-45" />
                                    </button>
                                </form>
                            </div>
                        </>
                    ) : (
                        <div className="flex-1 flex flex-col items-center justify-center p-20 text-center opacity-40">
                            <div className="w-20 h-20 rounded-md bg-neutral-950 border border-slate-800 flex items-center justify-center text-slate-700 mb-6 scale-150 opacity-20"><MessageSquare size={32} /></div>
                            <h3 className="text-sm font-black text-slate-600 uppercase italic tracking-[0.2em] mb-2 leading-none">Awaiting Link Initialization</h3>
                            <p className="text-[10px] font-bold text-slate-700 uppercase italic tracking-widest max-w-xs">Select a parent node from the interface directory to establish a bidirectional communication logic.</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Broadcast Modal Overlay */}
            <AnimatePresence>
                {isBroadcastOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-6 sm:p-0">
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsBroadcastOpen(false)} className="absolute inset-0 bg-neutral-950/80 backdrop-blur-md"></motion.div>
                        <motion.div initial={{ scale: 0.9, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.9, opacity: 0, y: 20 }} className="bg-neutral-900 w-full max-w-xl rounded-md border border-slate-800 shadow-2xl relative z-10 overflow-hidden">
                            <div className="p-10 space-y-8">
                                <div className="flex items-center justify-between pb-4 border-b border-slate-800/60">
                                    <h3 className="text-xl font-black italic uppercase tracking-tighter text-slate-100 leading-none">Broadcast Pulse</h3>
                                    <button onClick={() => setIsBroadcastOpen(false)} className="text-slate-600 hover:text-white transition-all"><X size={18} /></button>
                                </div>
                                
                                <div className="space-y-6">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 italic ml-1">Target Sector Vectors (Routes)</label>
                                        <div className="grid grid-cols-2 gap-3">
                                            {routes.map(r => (
                                                <div key={r._id} className="flex items-center gap-3 p-3 bg-neutral-950 border border-slate-800 rounded-md">
                                                    <input type="checkbox" className="rounded border-slate-800 bg-neutral-900 text-sky-600 focus:ring-sky-600 focus:ring-offset-neutral-900" />
                                                    <span className="text-[10px] font-black uppercase italic text-slate-400">{r.name} Matrix</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                    
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 italic ml-1">Signal Payload</label>
                                        <textarea 
                                            rows="4" 
                                            className="w-full bg-neutral-950 border border-slate-800/60 rounded-md p-4 text-[11px] font-black text-slate-200 focus:outline-none focus:border-sky-600/50 transition-all italic resize-none"
                                            placeholder="Enter logic signal for mass distribution..."
                                        ></textarea>
                                    </div>
                                </div>

                                <div className="flex gap-4">
                                    <button type="button" onClick={() => setIsBroadcastOpen(false)} className="flex-1 px-6 py-4 border border-slate-800 text-[10px] font-black uppercase tracking-widest italic text-slate-500 hover:bg-slate-800/30 transition-all rounded-md leading-none">Abort Pulse</button>
                                    <button type="button" className="flex-1 px-6 py-4 bg-sky-600 text-[10px] font-black uppercase tracking-widest italic text-white rounded-md hover:bg-sky-700 transition-all shadow-xl shadow-sky-600/20 leading-none hover:translate-y-[-2px]">Initiate Mass Signal</button>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </motion.div>
    );
};

export default Messages;
