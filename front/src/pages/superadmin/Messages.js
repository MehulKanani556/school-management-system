import React, { useState, useEffect, useContext, useRef } from 'react';
import { useSocket } from '../../context/SocketContext';
import { useSelector } from 'react-redux';
import { MessageSquare, Send, Search, User, CheckCheck, Shield, Globe, MoreVertical, Paperclip } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import moment from 'moment';
import axiosInstance from '../../utils/axiosInstance';
import toast from 'react-hot-toast';

const Messages = () => {
    const { socket } = useSocket();
    const { user: currentUser } = useSelector(s => s.auth);
    const [contacts, setContacts] = useState([]);
    const [selectedContact, setSelectedContact] = useState(null);
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [loadingContacts, setLoadingContacts] = useState(true);
    const [loadingMessages, setLoadingMessages] = useState(false);
    const [sending, setSending] = useState(false);
    const [search, setSearch] = useState('');
    const bottomRef = useRef(null);

    // Fetch all platform users as contacts
    useEffect(() => {
        const fetchContacts = async () => {
            try {
                const res = await axiosInstance.get('/superadmin/users', { params: { limit: 100 } });
                setContacts(res.data.users.filter(u => u._id !== currentUser._id));
            } catch {
                toast.error('Failed to load contacts');
            } finally {
                setLoadingContacts(false);
            }
        };
        fetchContacts();
    }, [currentUser._id]);

    // Fetch message history when contact selected
    useEffect(() => {
        if (!selectedContact) return;
        const fetchHistory = async () => {
            setLoadingMessages(true);
            try {
                const res = await axiosInstance.get(`/superadmin/messages/${selectedContact._id}`);
                setMessages(res.data.messages || []);
            } catch {
                toast.error('Failed to load messages');
            } finally {
                setLoadingMessages(false);
            }
        };
        fetchHistory();
    }, [selectedContact]);

    // Scroll to bottom on new messages
    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    // Listen for incoming real-time messages
    useEffect(() => {
        if (!socket) return;
        const handler = (msg) => {
            const isRelevant =
                (msg.sender?._id === selectedContact?._id || msg.sender === selectedContact?._id) ||
                (msg.recipient?._id === selectedContact?._id || msg.recipient === selectedContact?._id);
            if (isRelevant) {
                setMessages(prev => [...prev, msg]);
            }
        };
        socket.on('new_direct_message', handler);
        return () => socket.off('new_direct_message', handler);
    }, [socket, selectedContact]);

    const handleSend = async (e) => {
        e.preventDefault();
        if (!newMessage.trim() || !selectedContact || sending) return;
        setSending(true);
        try {
            if (socket) {
                socket.emit('send_direct_message', {
                    recipient: selectedContact._id,
                    subject: 'Direct Message',
                    content: newMessage,
                    schoolId: selectedContact.schoolId?._id || selectedContact.schoolId || null
                });
                // Optimistic update
                setMessages(prev => [...prev, {
                    _id: Date.now(),
                    sender: { _id: currentUser._id, firstName: currentUser.firstName, lastName: currentUser.lastName },
                    recipient: { _id: selectedContact._id },
                    content: newMessage,
                    createdAt: new Date()
                }]);
            } else {
                // Fallback to REST
                const res = await axiosInstance.post('/my-messages', {
                    recipient: selectedContact._id,
                    subject: 'Direct Message',
                    content: newMessage
                });
                setMessages(prev => [...prev, res.data]);
            }
            setNewMessage('');
        } catch {
            toast.error('Failed to send message');
        } finally {
            setSending(false);
        }
    };

    const filteredContacts = contacts.filter(c =>
        (c.firstName + ' ' + c.lastName + ' ' + c.email).toLowerCase().includes(search.toLowerCase())
    );

    const getSenderId = (msg) => msg.sender?._id || msg.sender;

    return (
        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="h-[calc(100vh-160px)] flex gap-8 font-outfit">
            {/* Contacts Sidebar */}
            <div className="w-1/3 bg-slate-900/20 border border-slate-800/60 rounded-md backdrop-blur-3xl flex flex-col overflow-hidden">
                <div className="p-6 border-b border-white/5 space-y-4 bg-white/[0.01]">
                    <h2 className="text-xl font-black italic uppercase tracking-tighter text-white leading-none">Secure Comms Registry</h2>
                    <div className="relative group">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-hover:text-superadmin-primary transition-colors" size={14} />
                        <input
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            placeholder="SCAN IDENTITY..."
                            className="w-full bg-slate-950/40 border border-white/5 h-12 pl-12 pr-6 rounded-md text-[10px] font-black uppercase tracking-widest text-white outline-none focus:border-superadmin-primary transition-all italic placeholder:text-slate-700"
                        />
                    </div>
                </div>
                <div className="flex-1 overflow-y-auto divide-y divide-white/5 custom-scrollbar">
                    {loadingContacts ? (
                        <div className="p-8 text-center opacity-30 animate-pulse">
                            <p className="text-[10px] font-black uppercase italic text-slate-600">Loading registry...</p>
                        </div>
                    ) : filteredContacts.map((c) => (
                        <div
                            key={c._id}
                            onClick={() => setSelectedContact(c)}
                            className={`p-6 cursor-pointer transition-all hover:bg-white/[0.02] flex items-center gap-4 ${selectedContact?._id === c._id ? 'bg-superadmin-primary/10 border-l-2 border-superadmin-primary' : ''}`}
                        >
                            <div className="relative shrink-0">
                                <div className="w-12 h-12 rounded-md bg-slate-800 border border-white/5 overflow-hidden p-0.5">
                                    {c.photo ? <img src={c.photo} alt="" className="w-full h-full object-cover" /> : <User size={20} className="w-full h-full p-2 text-slate-600" />}
                                </div>
                                <div className={`absolute -top-1 -right-1 w-3 h-3 rounded-md border-2 border-slate-900 ${c.isActive ? 'bg-emerald-500' : 'bg-rose-500'}`}></div>
                            </div>
                            <div className="flex-1 min-w-0">
                                <h4 className="text-[11px] font-black italic uppercase tracking-tighter text-white truncate">{c.firstName} {c.lastName}</h4>
                                <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest italic truncate">{c.role?.replace('_', ' ')}</p>
                                {c.schoolId?.name && <p className="text-[8px] text-slate-600 italic truncate">{c.schoolId.name}</p>}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Chat Area */}
            <div className="flex-1 bg-slate-900/20 border border-slate-800/60 rounded-md backdrop-blur-3xl flex flex-col overflow-hidden">
                <AnimatePresence mode="wait">
                    {selectedContact ? (
                        <motion.div key={selectedContact._id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col h-full">
                            <div className="p-6 border-b border-white/5 bg-white/[0.01] flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className="w-11 h-11 rounded-md bg-slate-800 border border-white/5 overflow-hidden shrink-0">
                                        {selectedContact.photo ? <img src={selectedContact.photo} alt="" className="w-full h-full object-cover" /> : <User size={18} className="w-full h-full p-2 text-slate-600" />}
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-black text-white italic uppercase tracking-tighter leading-none mb-1">{selectedContact.firstName} {selectedContact.lastName}</h3>
                                        <div className="flex items-center gap-2">
                                            <Shield size={10} className="text-superadmin-primary" />
                                            <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest italic opacity-70">Secured Node — {selectedContact.role?.replace('_', ' ')}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="flex-1 overflow-y-auto p-8 space-y-6 custom-scrollbar bg-slate-950/10">
                                {loadingMessages ? (
                                    <div className="flex items-center justify-center h-full opacity-30 animate-pulse">
                                        <p className="text-[10px] font-black uppercase italic text-slate-600">Decrypting channel...</p>
                                    </div>
                                ) : messages.length === 0 ? (
                                    <div className="flex flex-col items-center justify-center h-full opacity-20">
                                        <MessageSquare size={48} className="mb-4 text-slate-700" />
                                        <p className="text-[10px] font-black uppercase italic text-slate-600">No messages yet. Initiate transmission.</p>
                                    </div>
                                ) : messages.map((m, i) => {
                                    const isOwn = getSenderId(m) === currentUser._id || getSenderId(m)?._id === currentUser._id;
                                    return (
                                        <div key={m._id || i} className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}>
                                            <div className={`max-w-[70%] flex flex-col ${isOwn ? 'items-end' : 'items-start'}`}>
                                                <div className={`p-4 rounded-md border text-[11px] font-medium leading-relaxed italic ${
                                                    isOwn
                                                        ? 'bg-superadmin-primary/10 border-superadmin-primary/20 text-superadmin-primary shadow-xl shadow-superadmin-primary/5 rounded-br-none'
                                                        : 'bg-white/5 border-white/10 text-slate-100 rounded-bl-none'
                                                }`}>
                                                    {m.content || m.text}
                                                </div>
                                                <div className="mt-2 flex items-center gap-2 px-1">
                                                    <span className="text-[8px] font-black text-slate-700 uppercase tracking-widest italic">{moment(m.createdAt).format('HH:mm')}</span>
                                                    {isOwn && <CheckCheck size={10} className="text-superadmin-primary opacity-40" />}
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                                <div ref={bottomRef} />
                            </div>

                            <div className="p-8 border-t border-white/5 bg-slate-950/20">
                                <form onSubmit={handleSend} className="flex gap-4 items-center">
                                    <div className="flex-1 relative">
                                        <input
                                            value={newMessage}
                                            onChange={(e) => setNewMessage(e.target.value)}
                                            placeholder="ENCRYPT MESSAGE FOR TRANSMISSION..."
                                            className="w-full bg-slate-900 border border-white/5 h-14 px-6 rounded-md text-[10px] font-black uppercase tracking-widest text-white outline-none focus:border-superadmin-primary transition-all italic placeholder:text-slate-700 shadow-inner"
                                        />
                                    </div>
                                    <button
                                        disabled={!newMessage.trim() || sending}
                                        type="submit"
                                        className="h-14 px-8 bg-superadmin-primary text-black rounded-md flex items-center justify-center gap-3 shadow-xl shadow-superadmin-primary/20 hover:scale-105 active:scale-95 transition-all disabled:opacity-50 disabled:scale-100"
                                    >
                                        <Send size={18} />
                                        <span className="text-[10px] font-black uppercase italic tracking-widest whitespace-nowrap">Transmit</span>
                                    </button>
                                </form>
                            </div>
                        </motion.div>
                    ) : (
                        <div className="flex-1 flex flex-col items-center justify-center p-32 text-center opacity-30 grayscale hover:grayscale-0 transition-all duration-1000 group">
                            <div className="relative mb-8">
                                <MessageSquare size={82} className="text-slate-800 opacity-20 -rotate-12 group-hover:rotate-0 transition-transform duration-1000" />
                                <Globe size={32} className="absolute -top-2 -right-2 text-superadmin-primary animate-pulse" />
                            </div>
                            <h4 className="text-2xl font-black uppercase italic tracking-widest text-slate-700">Comms Terminal Standby</h4>
                            <p className="text-[10px] font-black uppercase tracking-[0.4em] mt-6 max-w-xs mx-auto italic text-slate-700 leading-relaxed">Select a node identity to initialize secure point-to-point transmission protocol.</p>
                        </div>
                    )}
                </AnimatePresence>
            </div>
        </motion.div>
    );
};

export default Messages;
