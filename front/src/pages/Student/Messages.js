import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
    Send, MessageSquare, User, Search, Clock, ArrowLeft,
    ShieldCheck, Smile, MoreVertical, AlertCircle, Mail,
    ArrowUpRight, Mic
} from 'lucide-react';
import { useSelector } from 'react-redux';
import { useLocation } from 'react-router-dom';
import axiosInstance from '../../utils/axiosInstance';
import { toast } from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { useSocket } from '../../context/SocketContext';
import EmojiPicker from 'emoji-picker-react';

/* ─── helpers ──────────────────────────────────────────────────────────────── */
const getRelativeTime = (date) => {
    if (!date) return '';
    const diff = Math.floor((Date.now() - new Date(date)) / 1000);
    if (diff < 60)     return 'Just now';
    if (diff < 3600)   return `${Math.floor(diff / 60)} min ago`;
    if (diff < 86400)  return `${Math.floor(diff / 3600)} hr ago`;
    if (diff < 172800) return 'Yesterday';
    if (diff < 604800) return `${Math.floor(diff / 86400)} days ago`;
    return new Date(date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
};

/* ══════════════════════════════════════════════════════════════════════════════
   COMPONENT
══════════════════════════════════════════════════════════════════════════════ */
const Messages = () => {
    /* ── state ── */
    const [messages,           setMessages]           = useState([]);
    const [contacts,           setContacts]           = useState([]);
    const [loading,            setLoading]            = useState(false);
    const [selectedChat,       setSelectedChat]       = useState(null);
    const [content,            setContent]            = useState('');
    const [searchQuery,        setSearchQuery]        = useState('');
    const [chatSearchQuery,    setChatSearchQuery]    = useState('');
    const [showChatSearch,     setShowChatSearch]     = useState(false);
    const [showChatInfo,       setShowChatInfo]       = useState(false);
    const [showEmojiPicker,    setShowEmojiPicker]    = useState(false);
    const [isMuted,            setIsMuted]            = useState(false);
    const [showClearChatModal, setShowClearChatModal] = useState(false);

    /* paginated history */
    const [chatMessages,  setChatMessages]  = useState([]);
    const [chatPage,      setChatPage]      = useState(1);
    const [hasMore,       setHasMore]       = useState(true);
    const [fetchingChat,  setFetchingChat]  = useState(false);

    /* refs */
    const chatContainerRef   = useRef(null);
    const lastScrollHeightRef = useRef(0);
    const selectedChatRef    = useRef(null);
    const searchInputRef     = useRef(null);
    const chatSearchInputRef = useRef(null);
    const emojiPickerRef     = useRef(null);

    const { socket }        = useSocket();
    const { user: me }      = useSelector(s => s.auth);
    const location          = useLocation();

    useEffect(() => { selectedChatRef.current = selectedChat; }, [selectedChat]);

    /* close emoji picker on outside click */
    useEffect(() => {
        const fn = (e) => {
            if (emojiPickerRef.current && !emojiPickerRef.current.contains(e.target))
                setShowEmojiPicker(false);
        };
        if (showEmojiPicker) document.addEventListener('mousedown', fn);
        return () => document.removeEventListener('mousedown', fn);
    }, [showEmojiPicker]);

    /* direct-chat from navigation state */
    useEffect(() => {
        fetchData();
        if (location.state?.directChat) setSelectedChat(location.state.directChat);
    }, [location.state]);

    /* socket: incoming messages */
    useEffect(() => {
        if (!socket) return;
        const handleMsg = (data) => {
            const senderId    = (data.sender?._id   || data.sender)?.toString();
            const recipientId = (data.recipient?._id || data.recipient)?.toString();
            const meId        = me?._id?.toString();
            const partnerId   = senderId === meId ? recipientId : senderId;

            if (partnerId === selectedChatRef.current) {
                setChatMessages(prev => [...prev, data]);
                setTimeout(() => {
                    if (chatContainerRef.current)
                        chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
                }, 100);
            } else if (senderId !== meId) {
                const mutedList = JSON.parse(localStorage.getItem(`muted_chats_${meId}`) || '[]');
                if (!mutedList.includes(senderId)) {
                    toast.success(`New message from ${data.sender?.firstName || 'Staff'}`, {
                        style: { background: '#0f172a', color: '#fff', border: '1px solid #10b981', fontSize: '11px', fontWeight: 900, textTransform: 'uppercase' }
                    });
                }
            }

            setMessages(prev => [data, ...prev.filter(m => {
                const mS = (m.sender?._id   || m.sender)?.toString();
                const mR = (m.recipient?._id || m.recipient)?.toString();
                const mP = mS === meId ? mR : mS;
                return mP !== partnerId;
            })]);
        };

        socket.on('NEW_MESSAGE', handleMsg);
        return () => socket.off('NEW_MESSAGE', handleMsg);
    }, [socket, me]);

    /* restore scroll when older messages prepend */
    useEffect(() => {
        if (lastScrollHeightRef.current && chatContainerRef.current) {
            const newH = chatContainerRef.current.scrollHeight;
            chatContainerRef.current.scrollTop = newH - lastScrollHeightRef.current;
            lastScrollHeightRef.current = 0;
        }
    }, [chatMessages]);

    /* fetch full data */
    const fetchData = async () => {
        try {
            const [msgRes, conRes] = await Promise.all([
                axiosInstance.get('/my-messages'),
                axiosInstance.get('/contacts')
            ]);
            setMessages(msgRes.data);
            setContacts(conRes.data);
        } catch { /* silent */ }
    };

    /* fetch paginated chat history */
    const fetchChatHistory = async (partnerId, page = 1, more = false) => {
        if (!partnerId) return;
        setFetchingChat(true);
        try {
            const res = await axiosInstance.get(`/chat-history/${partnerId}?page=${page}`);
            const msgs = res.data.reverse();
            setHasMore(msgs.length >= 50);
            if (more) {
                if (chatContainerRef.current) lastScrollHeightRef.current = chatContainerRef.current.scrollHeight;
                setChatMessages(prev => [...msgs, ...prev]);
            } else {
                setChatMessages(msgs);
                setTimeout(() => {
                    if (chatContainerRef.current) chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
                }, 100);
            }
        } catch { toast.error('Failed to load chat history'); }
        finally { setFetchingChat(false); }
    };

    /* when selected chat changes */
    useEffect(() => {
        if (selectedChat) {
            setChatPage(1);
            setChatMessages([]);
            setHasMore(true);
            fetchChatHistory(selectedChat, 1);
            if (me) {
                localStorage.setItem(`active_chat_${me._id}`, selectedChat);
                const muted = JSON.parse(localStorage.getItem(`muted_chats_${me._id}`) || '[]');
                setIsMuted(muted.includes(selectedChat));
            }
        } else {
            if (me) localStorage.removeItem(`active_chat_${me._id}`);
            setIsMuted(false);
        }
    }, [selectedChat, me]);

    /* infinite scroll: load older */
    const handleScroll = (e) => {
        if (e.target.scrollTop === 0 && !fetchingChat && hasMore) {
            const next = chatPage + 1;
            setChatPage(next);
            fetchChatHistory(selectedChat, next, true);
        }
    };

    /* send */
    const handleSend = (e) => {
        if (e) e.preventDefault();
        if (!content.trim() || !selectedChat) return;
        if (socket) {
            socket.emit('send_direct_message', {
                recipient: selectedChat,
                content,
                subject: 'Direct Response',
                schoolId: me?.schoolId
            });
        } else {
            axiosInstance.post('/my-messages', { recipient: selectedChat, content, subject: 'Direct Response' })
                .then(res => setChatMessages(prev => [...prev, res.data]))
                .catch(() => toast.error('Failed to send'));
        }
        setContent('');
        setShowEmojiPicker(false);
    };

    /* mute toggle */
    const handleMuteToggle = () => {
        if (!selectedChat || !me) return;
        const muted = JSON.parse(localStorage.getItem(`muted_chats_${me._id}`) || '[]');
        const isIn  = muted.includes(selectedChat);
        const next  = isIn ? muted.filter(id => id !== selectedChat) : [...muted, selectedChat];
        localStorage.setItem(`muted_chats_${me._id}`, JSON.stringify(next));
        setIsMuted(!isIn);
        toast.success(isIn ? 'Notifications enabled' : 'Notifications muted');
    };

    /* clear chat */
    const handleClearChat = async () => {
        try {
            await axiosInstance.delete(`/school-admin/chat-history/${selectedChat}`);
            setChatMessages([]);
            setMessages(prev => prev.filter(m => {
                const mS  = (m.sender?._id   || m.sender)?.toString();
                const mR  = (m.recipient?._id || m.recipient)?.toString();
                const meId = me?._id?.toString();
                return (mS === meId ? mR : mS) !== selectedChat;
            }));
            toast.success('Chat history cleared');
            setShowClearChatModal(false);
            setShowChatInfo(false);
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to clear chat');
        }
    };

    /* derived data */
    const conversations = useMemo(() => {
        if (!messages.length) return [];
        const groups = {};
        messages.filter(m => m.type === 'DirectMessage').forEach(msg => {
            const sId  = (msg.sender?._id    || msg.sender)?.toString();
            const rId  = (msg.recipient?._id || msg.recipient)?.toString();
            const meId = me?._id?.toString();
            const partner = sId === meId ? msg.recipient : msg.sender;
            if (!partner) return;
            const pId = (partner._id || partner)?.toString();
            if (!groups[pId]) groups[pId] = { partner, messages: [] };
            groups[pId].messages.push(msg);
        });
        return Object.values(groups).sort((a, b) => {
            const aTime = Math.max(...a.messages.map(m => new Date(m.createdAt).getTime() || 0));
            const bTime = Math.max(...b.messages.map(m => new Date(m.createdAt).getTime() || 0));
            return bTime - aTime;
        });
    }, [messages, me]);

    const activePartner = useMemo(() => {
        const conv = conversations.find(c => (c.partner._id || c.partner) === selectedChat);
        if (conv?.partner) return conv.partner;
        return contacts.find(c => c._id === selectedChat);
    }, [conversations, contacts, selectedChat]);

    const filteredConvs = useMemo(() => {
        if (!searchQuery.trim()) return conversations;
        const q = searchQuery.toLowerCase();
        return conversations.filter(conv => {
            const p = conv.partner;
            return `${p.firstName || ''} ${p.lastName || ''}`.toLowerCase().includes(q) || (p.role || '').toLowerCase().includes(q);
        });
    }, [conversations, searchQuery]);

    const filteredContactList = useMemo(() => {
        const q = searchQuery.toLowerCase();
        return contacts.filter(c => {
            const hasConv = conversations.some(cv => (cv.partner._id || cv.partner) === c._id);
            if (hasConv) return false;
            if (!q) return true;
            return `${c.firstName || ''} ${c.lastName || ''}`.toLowerCase().includes(q) || (c.role || '').toLowerCase().includes(q);
        });
    }, [contacts, conversations, searchQuery]);

    const filteredChatMessages = useMemo(() => {
        if (!chatSearchQuery.trim()) return chatMessages;
        const q = chatSearchQuery.toLowerCase();
        return chatMessages.filter(m => m.content?.toLowerCase().includes(q));
    }, [chatMessages, chatSearchQuery]);

    /* ══════════════════════════════════════════════════════════════════════════
       RENDER
    ══════════════════════════════════════════════════════════════════════════ */
    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className="h-[calc(100vh-160px)] max-w-7xl mx-auto flex flex-col lg:flex-row gap-4 overflow-hidden font-outfit"
        >
            {/* ── SIDEBAR ──────────────────────────────────────────────────── */}
            <div className={`lg:w-96 flex flex-col bg-slate-900/30 border border-slate-800/60 rounded-md overflow-hidden backdrop-blur-3xl shadow-2xl ${selectedChat ? 'hidden lg:flex' : 'flex w-full'}`}>

                {/* Search bar */}
                <div className="p-4 border-b border-slate-800/60">
                    <div className="relative group">
                        <button
                            type="button"
                            onClick={() => searchInputRef.current?.focus()}
                            className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600 hover:text-emerald-400 transition-colors cursor-pointer z-10"
                        >
                            <Search size={16} />
                        </button>
                        <input
                            ref={searchInputRef}
                            type="text"
                            placeholder="SCAN DATABASE..."
                            value={searchQuery}
                            onChange={e => setSearchQuery(e.target.value)}
                            className="w-full bg-slate-950/50 border border-slate-800 h-10 pl-11 pr-10 rounded-md text-[9px] font-black uppercase tracking-widest text-white outline-none focus:border-emerald-500 placeholder:text-slate-700 italic transition-all"
                        />
                        {searchQuery && (
                            <button
                                type="button"
                                onClick={() => setSearchQuery('')}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-600 hover:text-emerald-400 transition-colors"
                            >
                                <span className="text-xs">✕</span>
                            </button>
                        )}
                    </div>
                    {searchQuery && (
                        <div className="mt-2 text-[8px] font-black text-slate-500 uppercase tracking-widest italic">
                            Found: {filteredConvs.length} conversations, {filteredContactList.length} contacts
                        </div>
                    )}
                </div>

                {/* Lists */}
                <div className="flex-1 overflow-y-auto p-3 space-y-1.5 custom-scrollbar">

                    {/* Active Conversations */}
                    {filteredConvs.length > 0 && (
                        <>
                            <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest px-4 mb-4 italic">Active Conversations</p>
                            {filteredConvs.map(conv => {
                                const p        = conv.partner;
                                const isActive = selectedChat === (p._id || p);
                                return (
                                    <button
                                        key={p._id || p}
                                        onClick={() => setSelectedChat(p._id || p)}
                                        className={`w-full flex items-center gap-3 p-3 rounded-md transition-all border group ${isActive ? 'bg-emerald-500/10 border-emerald-500/30' : 'bg-transparent border-transparent hover:bg-slate-800/30'}`}
                                    >
                                        <div className="w-11 h-11 rounded-md bg-slate-800 border border-white/5 overflow-hidden shadow-lg relative shrink-0">
                                            {p.photo ? <img src={p.photo} alt="" className="w-full h-full object-cover" /> : <User className="w-full h-full p-2.5 text-slate-600" />}
                                            <div className="absolute top-1 right-1 w-2.5 h-2.5 bg-emerald-500 rounded-md border-2 border-slate-900 shadow-xl" />
                                        </div>
                                        <div className="text-left min-w-0 flex-1">
                                            <h4 className="text-white font-black text-[11px] uppercase tracking-tighter truncate italic">{p.firstName} {p.lastName}</h4>
                                            {p.role && <p className="text-[7px] text-emerald-400 font-black uppercase tracking-widest leading-none mt-0.5 truncate">{p.role}</p>}
                                            <p className="text-[9px] text-slate-500 font-bold truncate italic leading-none mt-1.5">{conv.messages[0].content}</p>
                                        </div>
                                        <div className="flex flex-col items-end gap-1.5">
                                            <span className="text-[7px] font-bold text-slate-600">{getRelativeTime(conv.messages[0].createdAt)}</span>
                                            {conv.messages.some(m => !m.isRead) && <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />}
                                        </div>
                                    </button>
                                );
                            })}
                        </>
                    )}

                    {/* Available Contacts */}
                    <p className={`text-[10px] font-black text-slate-600 uppercase tracking-widest px-4 mb-4 italic ${filteredConvs.length > 0 ? 'mt-8' : 'mt-2'}`}>Available Contacts</p>
                    {filteredContactList.length > 0 ? filteredContactList.map(c => (
                        <button
                            key={c._id}
                            onClick={() => setSelectedChat(c._id)}
                            className="w-full flex items-center gap-3 p-3 rounded-md transition-all border border-transparent hover:bg-slate-800/30 group"
                        >
                            <div className="w-10 h-10 rounded-md bg-slate-800/50 border border-white/5 overflow-hidden flex items-center justify-center grayscale group-hover:grayscale-0 transition-all shrink-0">
                                {c.photo ? <img src={c.photo} alt="" className="w-full h-full object-cover" /> : <User size={16} className="text-slate-600" />}
                            </div>
                            <div className="text-left flex-1">
                                <h4 className="text-slate-500 group-hover:text-white font-black text-[10px] uppercase tracking-tighter italic transition-colors">{c.firstName} {c.lastName}</h4>
                                <p className="text-[7px] text-slate-600 group-hover:text-slate-400 font-black uppercase tracking-widest leading-none mt-0.5">Role: {c.role}</p>
                            </div>
                            <ArrowUpRight size={12} className="ml-auto text-slate-800 group-hover:text-emerald-400 transition-colors" />
                        </button>
                    )) : (
                        <div className="text-center py-8">
                            <p className="text-[9px] font-black text-slate-700 uppercase tracking-widest italic">No contacts found</p>
                        </div>
                    )}
                </div>
            </div>

            {/* ── MAIN CHAT PANEL ──────────────────────────────────────────── */}
            <div className={`flex-1 flex flex-col min-h-0 bg-slate-900/40 border border-slate-800/60 rounded-md backdrop-blur-3xl overflow-hidden shadow-2xl relative ${!selectedChat ? 'hidden lg:flex' : 'flex'}`}>
                {selectedChat ? (
                    <>
                        {/* Chat Header */}
                        <div className="p-5 border-b border-white/5 flex items-center justify-between bg-white/[0.02] shrink-0">
                            <div className="flex items-center gap-4">
                                <button onClick={() => setSelectedChat(null)} className="lg:hidden p-2 rounded-md bg-slate-800/60 text-slate-400 mr-1">
                                    <ArrowLeft size={18} />
                                </button>
                                <div className="w-11 h-11 rounded-md bg-slate-800 overflow-hidden border border-emerald-500/20 shadow-xl shadow-emerald-500/5">
                                    {activePartner?.photo ? <img src={activePartner.photo} alt="" className="w-full h-full object-cover" /> : <User className="w-full h-full p-2.5 text-slate-600" />}
                                </div>
                                <div>
                                    <h3 className="text-lg font-black text-white italic tracking-tighter uppercase leading-none mb-1 flex items-center gap-2">
                                        {activePartner?.firstName || 'TARGET'} {activePartner?.lastName || 'LOCKED'}
                                        {activePartner?.role && (
                                            <span className="text-[7px] bg-emerald-500/20 text-emerald-400 px-1.5 py-0.5 rounded font-black tracking-widest uppercase">
                                                {activePartner.role}
                                            </span>
                                        )}
                                    </h3>
                                    <span className="flex items-center gap-2 text-[8px] font-black text-emerald-500 uppercase tracking-widest italic leading-none">
                                        <div className="w-1 h-1 rounded-full bg-emerald-500 animate-pulse" />
                                        Secure Channel
                                    </span>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                {/* Chat search toggle */}
                                <button
                                    onClick={() => {
                                        setShowChatSearch(!showChatSearch);
                                        if (!showChatSearch) setTimeout(() => chatSearchInputRef.current?.focus(), 100);
                                        else setChatSearchQuery('');
                                    }}
                                    className={`p-3 rounded-md border transition-all ${showChatSearch ? 'border-emerald-500 text-emerald-400 bg-emerald-500/10' : 'border-slate-800 text-slate-500 hover:text-white hover:bg-slate-800/50'}`}
                                >
                                    <Search size={16} />
                                </button>
                                {/* Chat info toggle */}
                                <button
                                    onClick={() => setShowChatInfo(!showChatInfo)}
                                    className={`p-3 rounded-md border transition-all ${showChatInfo ? 'border-emerald-500 text-emerald-400 bg-emerald-500/10' : 'border-slate-800 text-slate-500 hover:text-white hover:bg-slate-800/50'}`}
                                >
                                    <AlertCircle size={16} />
                                </button>
                            </div>
                        </div>

                        {/* Chat Search Bar */}
                        {showChatSearch && (
                            <div className="p-4 border-b border-white/5 bg-slate-900/50 shrink-0">
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-600" size={14} />
                                    <input
                                        ref={chatSearchInputRef}
                                        type="text"
                                        placeholder="SEARCH IN CONVERSATION..."
                                        value={chatSearchQuery}
                                        onChange={e => setChatSearchQuery(e.target.value)}
                                        className="w-full bg-slate-950/50 border border-slate-800 h-9 pl-10 pr-10 rounded-md text-[10px] font-black uppercase tracking-widest text-white outline-none focus:border-emerald-500 placeholder:text-slate-700 italic"
                                    />
                                    {chatSearchQuery && (
                                        <button type="button" onClick={() => setChatSearchQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-600 hover:text-emerald-400 transition-colors">
                                            <span className="text-xs">✕</span>
                                        </button>
                                    )}
                                </div>
                                {chatSearchQuery && (
                                    <div className="mt-2 text-[8px] font-black text-slate-500 uppercase tracking-widest italic">
                                        Found: {filteredChatMessages.length} messages
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Messages area + info panel */}
                        <div className="flex-1 flex min-h-0 relative overflow-hidden">
                            <div
                                ref={chatContainerRef}
                                onScroll={handleScroll}
                                className={`flex-1 overflow-y-auto p-4 lg:p-6 space-y-4 custom-scrollbar bg-slate-950/20 flex flex-col transition-all ${showChatInfo ? 'lg:mr-80' : ''}`}
                            >
                                {/* Loading older indicator */}
                                {fetchingChat && hasMore && (
                                    <div className="flex justify-center py-2">
                                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                                    </div>
                                )}

                                {/* Messages */}
                                {filteredChatMessages.map((msg, i) => {
                                    const isMe     = msg.sender?._id === me?._id;
                                    const showDate = i === 0 || new Date(filteredChatMessages[i - 1].createdAt).toDateString() !== new Date(msg.createdAt).toDateString();
                                    return (
                                        <React.Fragment key={msg._id || i}>
                                            {showDate && (
                                                <div className="flex flex-col items-center justify-center my-4">
                                                    <span className="text-[7px] font-black text-slate-600 bg-slate-900/50 px-3 py-1 rounded-md uppercase tracking-[0.2em] italic border border-white/5 shadow-inner">
                                                        {new Date(msg.createdAt).toLocaleDateString([], { weekday: 'short', day: '2-digit', month: 'short' })}
                                                    </span>
                                                </div>
                                            )}
                                            <motion.div
                                                initial={{ opacity: 0, scale: 0.95, y: 10 }}
                                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                                className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}
                                            >
                                                <div className={`max-w-[85%] lg:max-w-[75%] relative ${isMe ? 'items-end' : 'items-start'} flex flex-col group`}>
                                                    <div className={`px-4 py-2.5 rounded-md text-[12px] font-bold shadow-xl relative transition-all hover:shadow-2xl ${isMe ? 'bg-emerald-500 text-white rounded-tr-none' : 'bg-slate-800 text-slate-200 rounded-tl-none border border-white/5'}`}>
                                                        <p className="italic leading-relaxed whitespace-pre-wrap">
                                                            {chatSearchQuery ? (
                                                                msg.content.split(new RegExp(`(${chatSearchQuery})`, 'gi')).map((part, idx) =>
                                                                    part.toLowerCase() === chatSearchQuery.toLowerCase()
                                                                        ? <mark key={idx} className="bg-yellow-400/30 text-white">{part}</mark>
                                                                        : part
                                                                )
                                                            ) : msg.content}
                                                        </p>
                                                        {/* WhatsApp-style tail */}
                                                        <div className={`absolute top-0 w-3 h-3 ${isMe ? '-right-1.5 bg-emerald-500 clip-path-right' : '-left-1.5 bg-slate-800 clip-path-left border-t border-l border-white/5'}`} />
                                                    </div>
                                                    <div className="flex items-center gap-1.5 mt-1 opacity-50 group-hover:opacity-100 transition-opacity mx-1">
                                                        <span className="text-[7px] font-black uppercase tracking-widest italic text-slate-500">
                                                            {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                        </span>
                                                        {isMe && <div className="w-1 h-1 rounded-full bg-slate-700" />}
                                                    </div>
                                                </div>
                                            </motion.div>
                                        </React.Fragment>
                                    );
                                })}

                                {/* Empty states */}
                                {chatMessages.length === 0 && !fetchingChat && (
                                    <div className="h-full flex flex-col items-center justify-center opacity-30 gap-6">
                                        <div className="w-16 h-16 rounded-md border-2 border-dashed border-slate-700 flex items-center justify-center rotate-45">
                                            <Mic size={24} className="text-slate-700 -rotate-45" />
                                        </div>
                                        <p className="text-[9px] font-black uppercase tracking-[0.4em] italic">No Previous Messages. Start A Conversation.</p>
                                    </div>
                                )}
                                {chatMessages.length > 0 && filteredChatMessages.length === 0 && chatSearchQuery && (
                                    <div className="h-full flex flex-col items-center justify-center opacity-30 gap-6">
                                        <div className="w-16 h-16 rounded-md border-2 border-dashed border-slate-700 flex items-center justify-center">
                                            <Search size={24} className="text-slate-700" />
                                        </div>
                                        <p className="text-[9px] font-black uppercase tracking-[0.4em] italic">No Messages Found</p>
                                    </div>
                                )}
                            </div>

                            {/* Chat Info Slide-Over */}
                            <AnimatePresence>
                                {showChatInfo && (
                                    <motion.div
                                        initial={{ x: '100%' }}
                                        animate={{ x: 0 }}
                                        exit={{ x: '100%' }}
                                        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                                        className="absolute top-0 right-0 w-80 h-full bg-slate-900/95 backdrop-blur-xl border-l border-slate-800/60 shadow-2xl overflow-y-auto custom-scrollbar z-20"
                                    >
                                        <div className="p-6 space-y-6">
                                            <div className="flex items-center justify-between">
                                                <h3 className="text-sm font-black text-white uppercase tracking-widest italic">Chat Info</h3>
                                                <button onClick={() => setShowChatInfo(false)} className="p-2 rounded-md text-slate-500 hover:text-white hover:bg-slate-800/50 transition-all">
                                                    <span className="text-lg">✕</span>
                                                </button>
                                            </div>

                                            {/* Partner avatar */}
                                            <div className="flex flex-col items-center text-center space-y-4 pb-6 border-b border-slate-800/60">
                                                <div className="w-24 h-24 rounded-md bg-slate-800 overflow-hidden border-2 border-emerald-500/20 shadow-xl">
                                                    {activePartner?.photo ? <img src={activePartner.photo} alt="" className="w-full h-full object-cover" /> : <User className="w-full h-full p-6 text-slate-600" />}
                                                </div>
                                                <div>
                                                    <h4 className="text-lg font-black text-white uppercase tracking-tighter italic">{activePartner?.firstName} {activePartner?.lastName}</h4>
                                                    <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mt-1">{activePartner?.role || 'User'}</p>
                                                </div>
                                            </div>

                                            {/* Stats */}
                                            <div className="space-y-3">
                                                <h4 className="text-[9px] font-black text-slate-600 uppercase tracking-widest italic">Conversation Stats</h4>
                                                <div className="grid grid-cols-2 gap-3">
                                                    <div className="bg-slate-950/50 border border-slate-800 rounded-md p-4 text-center">
                                                        <div className="text-2xl font-black text-emerald-400 italic">{chatMessages.length}</div>
                                                        <div className="text-[8px] font-black text-slate-600 uppercase tracking-widest mt-1">Messages</div>
                                                    </div>
                                                    <div className="bg-slate-950/50 border border-slate-800 rounded-md p-4 text-center">
                                                        <div className="text-2xl font-black text-emerald-500 italic">
                                                            {chatMessages.filter(m => m.sender?._id === me?._id).length}
                                                        </div>
                                                        <div className="text-[8px] font-black text-slate-600 uppercase tracking-widest mt-1">Sent</div>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Email */}
                                            {activePartner?.email && (
                                                <div className="space-y-3">
                                                    <h4 className="text-[9px] font-black text-slate-600 uppercase tracking-widest italic">Contact Details</h4>
                                                    <div className="bg-slate-950/50 border border-slate-800 rounded-md p-4 space-y-2">
                                                        <div className="flex items-center gap-2">
                                                            <Mail size={12} className="text-slate-600" />
                                                            <span className="text-[10px] font-bold text-slate-400 italic">{activePartner.email}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            )}

                                            {/* Actions */}
                                            <div className="space-y-3">
                                                <h4 className="text-[9px] font-black text-slate-600 uppercase tracking-widest italic">Actions</h4>
                                                <div className="space-y-2">
                                                    <button
                                                        onClick={handleMuteToggle}
                                                        className={`w-full p-3 rounded-md border transition-all text-[10px] font-black uppercase tracking-widest italic text-left flex items-center justify-between ${isMuted ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' : 'bg-slate-950/50 border-slate-800 text-slate-400 hover:text-white hover:border-emerald-500/30'}`}
                                                    >
                                                        <span>{isMuted ? 'Unmute' : 'Mute'} Notifications</span>
                                                        {isMuted && <span className="text-xs">🔕</span>}
                                                    </button>
                                                    <button
                                                        onClick={() => setShowClearChatModal(true)}
                                                        className="w-full p-3 rounded-md bg-slate-950/50 border border-slate-800 text-slate-400 hover:text-rose-400 hover:border-rose-500/30 transition-all text-[10px] font-black uppercase tracking-widest italic text-left"
                                                    >
                                                        Clear Chat History
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>

                        {/* Send bar */}
                        <div className="p-5 border-t border-white/5 bg-slate-900 shadow-[0_-20px_50px_rgba(0,0,0,0.5)] relative shrink-0">
                            {/* Emoji Picker */}
                            <AnimatePresence>
                                {showEmojiPicker && (
                                    <motion.div
                                        ref={emojiPickerRef}
                                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                        animate={{ opacity: 1, y: 0, scale: 1 }}
                                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                        className="absolute bottom-full right-5 mb-2 shadow-2xl z-50"
                                    >
                                        <EmojiPicker
                                            onEmojiClick={obj => setContent(prev => prev + obj.emoji)}
                                            theme="dark"
                                            width={350}
                                            height={400}
                                            previewConfig={{ showPreview: false }}
                                        />
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            <form
                                onSubmit={handleSend}
                                className="flex items-center gap-3 bg-slate-950/50 border border-slate-800 rounded-md p-1.5 focus-within:border-emerald-500 transition-all"
                            >
                                <input
                                    required
                                    placeholder="TYPE YOUR MESSAGE..."
                                    value={content}
                                    onChange={e => setContent(e.target.value)}
                                    onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) handleSend(e); }}
                                    className="flex-1 bg-transparent h-11 px-3 text-[13px] font-black text-white outline-none italic placeholder:text-slate-800 uppercase tracking-tighter"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                                    className={`p-3 rounded-md transition-colors ${showEmojiPicker ? 'text-emerald-400' : 'text-slate-600 hover:text-white'}`}
                                >
                                    <Smile size={18} />
                                </button>
                                <button
                                    type="submit"
                                    className="bg-emerald-500 text-white p-3 rounded-md shadow-lg shadow-emerald-500/20 hover:scale-105 transition-all group active:scale-95"
                                >
                                    <Send size={18} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                                </button>
                            </form>
                        </div>

                        {/* Clear chat confirmation modal */}
                        <AnimatePresence>
                            {showClearChatModal && (
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    className="absolute inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-6"
                                >
                                    <motion.div
                                        initial={{ scale: 0.9, y: 20 }}
                                        animate={{ scale: 1, y: 0 }}
                                        exit={{ scale: 0.9, y: 20 }}
                                        className="bg-slate-900 border border-slate-700 rounded-md p-8 max-w-sm w-full space-y-6 shadow-2xl"
                                    >
                                        <h3 className="text-lg font-black text-white uppercase tracking-tight italic">Clear Chat History?</h3>
                                        <p className="text-[11px] font-bold text-slate-400 leading-relaxed">
                                            This will permanently delete all messages in this conversation. This action cannot be undone.
                                        </p>
                                        <div className="flex gap-3">
                                            <button
                                                onClick={() => setShowClearChatModal(false)}
                                                className="flex-1 p-3 rounded-md bg-slate-800 border border-slate-700 text-slate-400 hover:text-white text-[10px] font-black uppercase tracking-widest italic transition-all"
                                            >
                                                Cancel
                                            </button>
                                            <button
                                                onClick={handleClearChat}
                                                className="flex-1 p-3 rounded-md bg-rose-500/20 border border-rose-500/40 text-rose-400 hover:bg-rose-500 hover:text-white text-[10px] font-black uppercase tracking-widest italic transition-all"
                                            >
                                                Clear
                                            </button>
                                        </div>
                                    </motion.div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </>
                ) : (
                    /* No chat selected */
                    <div className="h-full flex flex-col items-center justify-center p-20 text-center space-y-10 group">
                        <div className="relative">
                            <div className="w-32 h-32 rounded-md border-4 border-slate-800 border-t-emerald-500 animate-spin" />
                            <MessageSquare size={48} className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-slate-800 group-hover:text-emerald-500 transition-colors duration-500" />
                        </div>
                        <div className="space-y-4">
                            <h3 className="text-2xl font-black text-white uppercase italic tracking-tighter leading-none">Open Direct Messages</h3>
                            <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest leading-relaxed max-w-sm">
                                Select a conversation or contact from the sidebar to begin messaging teachers or school staff.
                            </p>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="h-px w-8 bg-slate-800" />
                            <div className="h-1.5 w-1.5 rounded-full bg-slate-800" />
                            <div className="h-px w-8 bg-slate-800" />
                        </div>
                    </div>
                )}
            </div>
        </motion.div>
    );
};

export default Messages;
