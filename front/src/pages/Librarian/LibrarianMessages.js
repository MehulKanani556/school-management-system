import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Send, MessageSquare, User, Search, Clock, ArrowLeft, Shield, Paperclip } from 'lucide-react';
import { useSelector } from 'react-redux';
import { useLocation } from 'react-router-dom';
import axiosInstance from '../../utils/axiosInstance';
import { toast } from 'react-hot-toast';
import { motion } from 'framer-motion';

const LibrarianMessages = () => {
    const [messages, setMessages] = useState([]);
    const [contacts, setContacts] = useState([]);
    const [selectedChat, setSelectedChat] = useState(null);
    const [content, setContent] = useState('');
    const [searchTerm, setSearchTerm] = useState('');

    const { user: currentUser } = useSelector((state) => state.auth);
    const location = useLocation();
    const scrollRef = useRef();

    useEffect(() => {
        fetchData();
        const interval = setInterval(fetchData, 10000);
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        if (location.state?.directChat) {
            setSelectedChat(location.state.directChat);
        }
    }, [location.state]);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages, selectedChat]);

    const fetchData = async () => {
        try {
            const [msgRes, conRes] = await Promise.all([
                axiosInstance.get('/my-messages'),
                axiosInstance.get('/contacts'),
            ]);
            setMessages(msgRes.data);
            setContacts(conRes.data);
        } catch {
            toast.error('Failed to load messages');
        }
    };

    const handleSend = async (e) => {
        if (e) e.preventDefault();
        if (!content.trim() || !selectedChat) return;

        try {
            const res = await axiosInstance.post('/my-messages', {
                recipient: selectedChat,
                content: content.trim(),
                subject: 'Library Communication',
            });
            setMessages((prev) => [res.data, ...prev]);
            setContent('');
            toast.success('Message sent');
        } catch {
            toast.error('Failed to send message');
        }
    };

    const conversations = useMemo(() => {
        const groups = {};
        messages
            .filter((m) => m.type === 'DirectMessage')
            .forEach((msg) => {
                const partner = msg.sender?._id === currentUser?._id ? msg.recipient : msg.sender;
                if (!partner) return;
                const pId = partner._id || partner;
                if (!groups[pId]) groups[pId] = { partner, messages: [] };
                groups[pId].messages.push(msg);
            });
        return Object.values(groups).sort(
            (a, b) => new Date(b.messages[0].createdAt) - new Date(a.messages[0].createdAt)
        );
    }, [messages, currentUser]);

    const activeConversation = useMemo(() => {
        if (!selectedChat) return null;
        const conv = conversations.find((c) => (c.partner._id || c.partner) === selectedChat);
        if (conv) {
            return {
                ...conv,
                messages: [...conv.messages].sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt)),
            };
        }
        const contact = contacts.find((c) => c._id === selectedChat);
        return { partner: contact, messages: [] };
    }, [conversations, selectedChat, contacts]);

    const filteredContacts = contacts.filter((c) =>
        `${c.firstName} ${c.lastName}`.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="h-[calc(100vh-140px)] flex flex-col font-outfit pb-10"
        >
            <div className="flex justify-between items-end mb-6 flex-shrink-0">
                <div>
                    <h1 className="text-3xl font-black text-librarian-primary italic uppercase tracking-tighter mb-1 leading-none">
                        Institutional Messaging
                    </h1>
                    <p className="text-[11px] font-black text-slate-500 uppercase tracking-widest italic opacity-70 leading-none">
                        Internal communication with school staff.
                    </p>
                </div>
            </div>

            <div className="flex-1 flex gap-6 min-h-0">
                <div
                    className={`w-full lg:w-80 flex flex-col bg-neutral-900 border border-slate-800/60 rounded-md overflow-hidden shadow-2xl ${
                        selectedChat ? 'hidden lg:flex' : 'flex'
                    }`}
                >
                    <div className="p-4 border-b border-slate-800/60 bg-neutral-950/40">
                        <div className="relative">
                            <Search className="absolute left-3 top-2.5 text-slate-600" size={12} />
                            <input
                                type="text"
                                placeholder="Search contacts..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="bg-neutral-950 border border-slate-800/60 rounded-md py-2 pl-9 pr-4 text-[10px] font-bold text-slate-200 focus:outline-none focus:border-librarian-primary/50 w-full italic uppercase tracking-widest"
                            />
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto p-2 custom-scrollbarThin">
                        {conversations.map((conv) => {
                            const p = conv.partner;
                            const pId = p._id || p;
                            const isActive = selectedChat === pId;
                            const last = conv.messages[conv.messages.length - 1];
                            return (
                                <button
                                    key={pId}
                                    type="button"
                                    onClick={() => setSelectedChat(pId)}
                                    className={`w-full p-3 flex items-center gap-3 rounded-md mb-1 text-left transition-all ${
                                        isActive ? 'bg-librarian-primary/10 border border-librarian-primary/20' : 'hover:bg-white/5 border border-transparent'
                                    }`}
                                >
                                    <div className="w-10 h-10 rounded-md bg-neutral-900 border border-slate-800 flex items-center justify-center shrink-0 overflow-hidden">
                                        {p.photo ? (
                                            <img src={p.photo} alt="" className="w-full h-full object-cover" />
                                        ) : (
                                            <User size={18} className="text-slate-600" />
                                        )}
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <span className="text-[10px] font-bold text-slate-200 uppercase block truncate">
                                            {p.firstName} {p.lastName}
                                        </span>
                                        <p className="text-[9px] text-slate-500 truncate italic">{last?.content}</p>
                                    </div>
                                </button>
                            );
                        })}

                        {filteredContacts
                            .filter((c) => !conversations.some((conv) => (conv.partner._id || conv.partner) === c._id))
                            .map((c) => (
                                <button
                                    key={c._id}
                                    type="button"
                                    onClick={() => setSelectedChat(c._id)}
                                    className="w-full p-3 flex items-center gap-3 rounded-md mb-1 text-left hover:bg-white/5 opacity-70 hover:opacity-100"
                                >
                                    <User size={18} className="text-slate-600 shrink-0" />
                                    <div className="min-w-0">
                                        <span className="text-[10px] font-bold text-slate-400 uppercase block truncate">
                                            {c.firstName} {c.lastName}
                                        </span>
                                        <span className="text-[8px] text-slate-600 uppercase">{c.role}</span>
                                    </div>
                                </button>
                            ))}
                    </div>
                </div>

                <div
                    className={`flex-1 flex flex-col bg-neutral-900 border border-slate-800/60 rounded-md overflow-hidden min-h-0 ${
                        !selectedChat ? 'hidden lg:flex' : 'flex'
                    }`}
                >
                    {selectedChat && activeConversation?.partner ? (
                        <>
                            <div className="p-4 border-b border-slate-800/60 flex items-center gap-4 bg-neutral-950/40">
                                <button
                                    type="button"
                                    onClick={() => setSelectedChat(null)}
                                    className="lg:hidden p-2 text-slate-400"
                                >
                                    <ArrowLeft size={18} />
                                </button>
                                <div className="w-10 h-10 rounded-md bg-neutral-900 border border-librarian-primary/20 flex items-center justify-center text-librarian-primary overflow-hidden">
                                    {activeConversation.partner.photo ? (
                                        <img src={activeConversation.partner.photo} alt="" className="w-full h-full object-cover" />
                                    ) : (
                                        <Shield size={18} />
                                    )}
                                </div>
                                <div>
                                    <h3 className="text-xs font-black uppercase text-slate-100 italic">
                                        {activeConversation.partner.firstName} {activeConversation.partner.lastName}
                                    </h3>
                                    <p className="text-[8px] font-bold text-slate-600 uppercase">{activeConversation.partner.role}</p>
                                </div>
                            </div>

                            <div ref={scrollRef} className="flex-1 p-6 overflow-y-auto flex flex-col gap-4 custom-scrollbarThin">
                                {activeConversation.messages.map((msg, i) => {
                                    const isMe =
                                        msg.sender?._id === currentUser?._id || msg.sender === currentUser?._id;
                                    return (
                                        <div key={msg._id || i} className={`max-w-[80%] ${isMe ? 'self-end' : ''}`}>
                                            <div
                                                className={`p-4 rounded-md text-xs font-medium italic ${
                                                    isMe
                                                        ? 'bg-librarian-primary/20 border border-librarian-primary/30 text-slate-100'
                                                        : 'bg-neutral-950 border border-slate-800/60 text-slate-300'
                                                }`}
                                            >
                                                {msg.content}
                                            </div>
                                            <span className="text-[8px] font-black text-slate-600 mt-1 block italic">
                                                {new Date(msg.createdAt).toLocaleTimeString([], {
                                                    hour: '2-digit',
                                                    minute: '2-digit',
                                                })}
                                            </span>
                                        </div>
                                    );
                                })}
                                {activeConversation.messages.length === 0 && (
                                    <p className="text-center text-slate-600 text-[10px] font-bold uppercase italic py-12">
                                        No messages yet. Start the conversation.
                                    </p>
                                )}
                            </div>

                            <form onSubmit={handleSend} className="p-4 border-t border-slate-800/60 flex gap-3">
                                <input
                                    type="text"
                                    value={content}
                                    onChange={(e) => setContent(e.target.value)}
                                    placeholder="Type a message..."
                                    className="flex-1 bg-neutral-950 border border-slate-800/60 rounded-md px-4 py-3 text-[10px] font-bold text-slate-100 focus:outline-none focus:border-librarian-primary/50 italic"
                                />
                                <button
                                    type="submit"
                                    className="w-12 h-12 bg-librarian-primary text-white rounded-md flex items-center justify-center hover:opacity-90"
                                >
                                    <Send size={18} />
                                </button>
                            </form>
                        </>
                    ) : (
                        <div className="flex-1 flex flex-col items-center justify-center p-12 text-center opacity-40">
                            <MessageSquare size={48} className="mb-4 text-slate-600" />
                            <p className="text-[10px] font-black uppercase tracking-widest italic">Select a contact to message</p>
                        </div>
                    )}
                </div>
            </div>
        </motion.div>
    );
};

export default LibrarianMessages;
