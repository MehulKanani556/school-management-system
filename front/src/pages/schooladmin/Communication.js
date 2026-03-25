import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams, useLocation } from 'react-router-dom';
import {
    Send,
    Bell,
    MessageSquare,
    Users,
    User,
    Trash2,
    Search,
    Filter,
    Calendar,
    ArrowUpRight,
    Megaphone,
    Mail,
    AlertCircle,
    Layout,
    ChevronRight,
    SearchCheck,
    Mic,
    Paperclip,
    Smile,
    ArrowLeft
} from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import axiosInstance from '../../utils/axiosInstance';
import { toast } from 'react-hot-toast';
import { useSocket } from '../../context/SocketContext';
import { motion, AnimatePresence } from 'framer-motion';

const Communication = () => {
    const [searchParams, setSearchParams] = useSearchParams();
    const location = useLocation();
    const [activeTab, setActiveTab] = useState(searchParams.get('tab') || 'announcements'); // 'announcements', 'messages', 'notices'
    const [announcements, setAnnouncements] = useState([]);
    const [messages, setMessages] = useState([]);
    const [notices, setNotices] = useState([]);
    const [contacts, setContacts] = useState([]);
    const [loading, setLoading] = useState(false);
    const [selectedChat, setSelectedChat] = useState(null); // userId of the other person

    // Paginated Chat History
    const [chatMessages, setChatMessages] = useState([]);
    const [chatPage, setChatPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const [fetchingChat, setFetchingChat] = useState(false);
    const chatContainerRef = React.useRef(null);
    const lastScrollHeightRef = React.useRef(0);
    const selectedChatRef = React.useRef(null);

    useEffect(() => {
        selectedChatRef.current = selectedChat;
    }, [selectedChat]);

    // Sync activeTab with URL params
    useEffect(() => {
        const tab = searchParams.get('tab');
        if (tab && ['announcements', 'messages', 'notices'].includes(tab)) {
            setActiveTab(tab);
        }

        // Handle direct chat from profile
        if (location.state?.directChat) {
            setActiveTab('messages');
            setSelectedChat(location.state.directChat);
        }
    }, [searchParams, location.state]);

    const handleTabChange = (tabId) => {
        setActiveTab(tabId);
        setSearchParams({ tab: tabId });
        setSelectedChat(null);
    };

    const { socket } = useSocket();
    const { user: currentUser } = useSelector(state => state.auth);

    // Form states
    const [formData, setFormData] = useState({
        targetRole: 'All',
        subject: '',
        content: '',
        recipient: '',
    });

    useEffect(() => {
        fetchData();
    }, [activeTab]);

    useEffect(() => {
        if (!socket || typeof socket.on !== 'function') return;

        const handleAnnouncement = (data) => {
            setAnnouncements(prev => [data, ...prev]);
            toast.success(`Broadcasting Archive Updated: ${data.subject}`);
        };

        const handleDirectMessage = (data) => {
            const senderId = (data.sender?._id || data.sender)?.toString();
            const recipientId = (data.recipient?._id || data.recipient)?.toString();
            const meId = currentUser?._id?.toString();
            const partnerId = senderId === meId ? recipientId : senderId;

            // If it's the active chat, add it to chatMessages
            if (partnerId === selectedChatRef.current) {
                setChatMessages(prev => [...prev, data]);
                // Scroll to bottom after state update
                setTimeout(() => {
                    if (chatContainerRef.current) {
                        chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
                    }
                }, 100);
            }

            // Update the conversations list preview
            setMessages(prev => [data, ...prev.filter(m => {
                const mPartnerId = m.sender?._id === currentUser?._id ? m.recipient?._id || m.recipient : m.sender?._id;
                return mPartnerId !== partnerId;
            })]);

            // toast.success(`Direct Proton Received: ${data.subject}`);
        };

        const handleNotice = (data) => {
            setNotices(prev => [data, ...prev]);
            toast.success(`Public Bulletin Synced: ${data.subject}`);
        };

        socket.on('NEW_ANNOUNCEMENT', handleAnnouncement);
        socket.on('NEW_MESSAGE', handleDirectMessage);
        socket.on('NEW_NOTICE', handleNotice);

        return () => {
            if (socket && typeof socket.off === 'function') {
                socket.off('NEW_ANNOUNCEMENT', handleAnnouncement);
                socket.off('NEW_MESSAGE', handleDirectMessage);
                socket.off('NEW_NOTICE', handleNotice);
            }
        };
    }, [socket]);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [annRes, msgRes, notRes, conRes] = await Promise.all([
                axiosInstance.get('/school-admin/announcements'),
                axiosInstance.get('/school-admin/messages'),
                axiosInstance.get('/school-admin/notices'),
                axiosInstance.get('/contacts')
            ]);
            setAnnouncements(annRes.data);
            setMessages(msgRes.data);
            setNotices(notRes.data);
            setContacts(conRes.data);
        } catch (err) {
            toast.error('Data synchronization failed');
        } finally {
            setLoading(false);
        }
    };

    const fetchChatHistory = async (partnerId, page = 1, isLoadingMore = false) => {
        if (!partnerId) return;
        setFetchingChat(true);
        try {
            const res = await axiosInstance.get(`/chat-history/${partnerId}?page=${page}`);
            const newMsgs = res.data.reverse(); // backend returns newest first, we want oldest first for state

            if (newMsgs.length < 50) setHasMore(false);
            else setHasMore(true);

            if (isLoadingMore) {
                // Save current scroll height to restore position
                if (chatContainerRef.current) {
                    lastScrollHeightRef.current = chatContainerRef.current.scrollHeight;
                }
                setChatMessages(prev => [...newMsgs, ...prev]);
            } else {
                setChatMessages(newMsgs);
                // Scroll to bottom
                setTimeout(() => {
                    if (chatContainerRef.current) {
                        chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
                    }
                }, 100);
            }
        } catch (err) {
            toast.error('Failed to load chat history');
        } finally {
            setFetchingChat(false);
        }
    };

    useEffect(() => {
        if (selectedChat) {
            setChatPage(1);
            setChatMessages([]);
            setHasMore(true);
            fetchChatHistory(selectedChat, 1);
        }
    }, [selectedChat]);

    // Restore scroll position when loading older messages
    useEffect(() => {
        if (lastScrollHeightRef.current && chatContainerRef.current) {
            const newScrollHeight = chatContainerRef.current.scrollHeight;
            chatContainerRef.current.scrollTop = newScrollHeight - lastScrollHeightRef.current;
            lastScrollHeightRef.current = 0;
        }
    }, [chatMessages]);

    const handleScroll = (e) => {
        if (e.target.scrollTop === 0 && !fetchingChat && hasMore) {
            const nextPage = chatPage + 1;
            setChatPage(nextPage);
            fetchChatHistory(selectedChat, nextPage, true);
        }
    };

    const handleSend = async (e, customTarget = null) => {
        if (e) e.preventDefault();
        try {
            let url = '';
            let payload = { ...formData };

            if (activeTab === 'announcements') {
                url = '/school-admin/announcements';
                await axiosInstance.post(url, payload);
            }
            else if (activeTab === 'messages') {
                if (customTarget) payload = { ...payload, recipient: customTarget, subject: 'Direct Response' };

                // Real-time sending via socket as requested (not API call)
                if (socket) {
                    socket.emit('send_direct_message', {
                        ...payload,
                        schoolId: currentUser.schoolId // Required for the socket save logic
                    });
                } else {
                    // Fallback to API if socket not ready
                    await axiosInstance.post('/school-admin/messages', payload);
                }
            }
            else if (activeTab === 'notices') {
                url = '/school-admin/notices';
                await axiosInstance.post(url, payload);
            }

            toast.success('Dispatched Successfully');
            setFormData({ targetRole: 'All', subject: '', content: '', recipient: '' });
            // For messages, we don't need to fetchData() because socket will update state
            if (activeTab !== 'messages') fetchData();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Dispatch failed');
        }
    };

    const handleDelete = async (id) => {
        try {
            await axiosInstance.delete(`/school-admin/messages/${id}`);
            toast.success('Record Cleared');
            fetchData();
        } catch (err) {
            toast.error('Failed to purge record');
        }
    };

    // Chat Logic: group messages by conversation partner
    const conversations = useMemo(() => {
        if (!messages.length) return [];
        const groups = {};
        messages.forEach(msg => {
            const senderId = (msg.sender?._id || msg.sender)?.toString();
            const recipientId = (msg.recipient?._id || msg.recipient)?.toString();
            const meId = currentUser?._id?.toString();
            const partner = senderId === meId ? msg.recipient : msg.sender;
            if (!partner) return;
            const pId = (partner._id || partner)?.toString();
            if (!groups[pId]) groups[pId] = { partner, messages: [] };
            groups[pId].messages.push(msg);
        });
        return Object.values(groups).sort((a, b) => new Date(b.messages[0].createdAt) - new Date(a.messages[0].createdAt));
    }, [messages, currentUser]);

    const activeConversation = useMemo(() => {
        return conversations.find(c => (c.partner._id || c.partner) === selectedChat);
    }, [conversations, selectedChat]);

    return (
        <div className="h-[calc(100vh-130px)] lg:h-[calc(100vh-130px)] text-slate-300 font-outfit p-2 lg:p-4 selection:bg-brand-primary/30 selection:text-white overflow-hidden flex flex-col">
            {/* Header Section */}
            <div className="max-w-[1600px] w-full mx-auto mb-4 shrink-0">
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                    <div className="space-y-2">
                        <div className="flex items-center gap-2">
                            <div className="h-[1.5px] w-6 bg-brand-primary rounded-md"></div>
                            <span className="text-[8px] font-black text-brand-primary uppercase tracking-[0.4em] italic leading-none">Intelligence Signal Relay</span>
                        </div>
                        <h1 className="text-3xl lg:text-4xl font-black text-white uppercase tracking-tighter italic leading-none">
                            {activeTab === 'announcements' ? (
                                <>ANNOUNCEMENT <span className="text-brand-primary">HUB</span></>
                            ) : activeTab === 'messages' ? (
                                <>DIRECT <span className="text-brand-primary">PROBE</span></>
                            ) : (
                                <>NOTICE <span className="text-brand-primary">BOARD</span></>
                            )}
                        </h1>
                        <p className="text-slate-500 font-bold text-[9px] lg:text-[10px] tracking-wider uppercase">
                            {activeTab === 'announcements' ? 'Unified administrative broadcast and relay.' :
                                activeTab === 'messages' ? 'Secured point-to-point institutional messaging.' :
                                    'Public domain bulletin and regional advisory.'}
                        </p>
                    </div>

                    {/* Removed internal tabs as they are now in the sidebar */}
                </div>
            </div>

            <div className="max-w-[1600px] w-full mx-auto flex-1 grid grid-cols-1 lg:grid-cols-12 gap-4 min-h-0 overflow-hidden">
                {activeTab === 'messages' ? (
                    /* CHAT INTERFACE */
                    <>
                        <div className={`lg:col-span-4 flex flex-col gap-6 min-h-0 ${selectedChat ? 'hidden lg:flex' : 'flex'}`}>
                            {/* Contact List */}
                            <div className="bg-slate-900/30 border border-slate-800/60 rounded-md flex flex-col min-h-0 backdrop-blur-3xl">
                                <div className="p-4 border-b border-slate-800/60">
                                    <div className="relative group">
                                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600 group-hover:text-brand-primary transition-colors" size={16} />
                                        <input
                                            placeholder="SCAN DATABASE..."
                                            className="w-full bg-slate-950/50 border border-slate-800 h-10 pl-11 pr-4 rounded-md text-[9px] font-black uppercase tracking-widest text-white outline-none focus:border-brand-primary placeholder:text-slate-700 italic"
                                        />
                                    </div>
                                </div>
                                <div className="flex-1 overflow-y-auto p-3 space-y-1.5 custom-scrollbar">
                                    <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest px-4 mb-4 italic">Active Conversations</p>
                                    {conversations.map(conv => {
                                        const p = conv.partner;
                                        const isActive = selectedChat === (p._id || p);
                                        return (
                                            <button
                                                key={p._id || p}
                                                onClick={() => setSelectedChat(p._id || p)}
                                                className={`w-full flex items-center gap-3 p-3 rounded-md transition-all border group ${isActive ? 'bg-brand-primary/10 border-brand-primary/30' : 'bg-transparent border-transparent hover:bg-slate-800/30'}`}
                                            >
                                                <div className="w-11 h-11 rounded-md bg-slate-800 border border-white/5 overflow-hidden shadow-lg relative shrink-0">
                                                    {p.photo ? <img src={p.photo} alt="" className="w-full h-full object-cover" /> : <User className="w-full h-full p-2.5 text-slate-600" />}
                                                    <div className="absolute top-1 right-1 w-2.5 h-2.5 bg-emerald-500 rounded-md border-2 border-slate-900 shadow-xl"></div>
                                                </div>
                                                <div className="text-left min-w-0 flex-1">
                                                    <h4 className="text-white font-black text-[11px] uppercase tracking-tighter truncate italic">{p.firstName} {p.lastName}</h4>
                                                    <p className="text-[9px] text-slate-500 font-bold truncate italic leading-none mt-1">{conv.messages[0].content}</p>
                                                </div>
                                                <div className="flex flex-col items-end gap-1.5">
                                                    <span className="text-[7px] font-bold text-slate-600">2M</span>
                                                    {conv.messages.some(m => !m.isRead) && <div className="w-1.5 h-1.5 rounded-md bg-luxury-rose animate-pulse shadow-schooladmin-primary/50 shadow-lg"></div>}
                                                </div>
                                            </button>
                                        );
                                    })}

                                    <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest px-4 mt-8 mb-4 italic">Available Contacts</p>
                                    {contacts.filter(t => !conversations.some(c => (c.partner._id || c.partner) === t._id)).map(t => (
                                        <button
                                            key={t._id}
                                            onClick={() => setSelectedChat(t._id)}
                                            className="w-full flex items-center gap-3 p-3 rounded-md transition-all border border-transparent hover:bg-slate-800/30 group"
                                        >
                                            <div className="w-10 h-10 rounded-md bg-slate-800/50 border border-white/5 overflow-hidden flex items-center justify-center grayscale group-hover:grayscale-0 transition-all shrink-0">
                                                {t.photo ? <img src={t.photo} alt="" className="w-full h-full object-cover" /> : <User size={16} className="text-slate-600" />}
                                            </div>
                                            <div className="text-left">
                                                <h4 className="text-slate-500 group-hover:text-white font-black text-[10px] uppercase tracking-tighter italic transition-colors">{t.firstName} {t.lastName}</h4>
                                                <p className="text-[7px] text-slate-600 font-black uppercase tracking-widest">Role: {t.role}</p>
                                            </div>
                                            <ArrowUpRight size={12} className="ml-auto text-slate-800 group-hover:text-brand-primary" />
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className={`lg:col-span-8 flex flex-col min-h-0 bg-slate-900/40 border border-slate-800/60 rounded-md backdrop-blur-3xl overflow-hidden shadow-2xl relative ${!selectedChat ? 'hidden lg:flex' : 'flex'}`}>
                            {selectedChat ? (
                                <>
                                    {/* Chat Header */}
                                    <div className="p-5 border-b border-white/5 flex items-center justify-between bg-white/[0.02]">
                                        <div className="flex items-center gap-4">
                                            <button onClick={() => setSelectedChat(null)} className="lg:hidden p-2 rounded-md bg-slate-800/60 text-slate-400 mr-1"><ArrowLeft size={18} /></button>
                                            <div className="w-11 h-11 rounded-md bg-slate-800 overflow-hidden border border-brand-primary/20 shadow-xl shadow-brand-primary/5">
                                                {activeConversation?.partner.photo ? <img src={activeConversation.partner.photo} alt="" className="w-full h-full object-cover" /> : <User className="w-full h-full p-2.5 text-slate-600" />}
                                            </div>
                                            <div>
                                                <h3 className="text-lg font-black text-white italic tracking-tighter uppercase leading-none mb-1">
                                                    {activeConversation?.partner.firstName || 'TARGET'} {activeConversation?.partner.lastName || 'LOCKED'}
                                                </h3>
                                                <span className="flex items-center gap-2 text-[8px] font-black text-emerald-500 uppercase tracking-widest italic leading-none">
                                                    <div className="w-1 h-1 rounded-md bg-emerald-500 animate-pulse"></div>
                                                    Encrypted Channel
                                                </span>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <button className="p-3 rounded-md border border-slate-800 text-slate-500 hover:text-white hover:bg-slate-800/50 transition-all"><Search size={16} /></button>
                                            <button className="p-3 rounded-md border border-slate-800 text-slate-500 hover:text-white hover:bg-slate-800/50 transition-all"><AlertCircle size={16} /></button>
                                        </div>
                                    </div>

                                    {/* Chat Messages */}
                                    <div
                                        ref={chatContainerRef}
                                        onScroll={handleScroll}
                                        className="flex-1 overflow-y-auto p-4 lg:p-6 space-y-4 custom-scrollbar bg-slate-950/20 flex flex-col"
                                    >
                                        {fetchingChat && hasMore && (
                                            <div className="flex justify-center py-2">
                                                <div className="w-1.5 h-1.5 rounded-md bg-brand-primary animate-pulse"></div>
                                            </div>
                                        )}

                                        {chatMessages.map((msg, i) => {
                                            const isMe = msg.sender?._id === currentUser?._id;
                                            const showDate = i === 0 || new Date(chatMessages[i - 1].createdAt).toDateString() !== new Date(msg.createdAt).toDateString();

                                            return (
                                                <React.Fragment key={msg._id}>
                                                    {showDate && (
                                                        <div className="flex flex-col items-center justify-center my-4">
                                                            <div className="h-[1px] w-8 bg-slate-800/50"></div>
                                                            <span className="text-[7px] font-black text-slate-600 bg-slate-900/50 px-3 py-1 rounded-md uppercase tracking-[0.2em] my-2 italic border border-white/5 shadow-inner">
                                                                {new Date(msg.createdAt).toLocaleDateString([], { weekday: 'short', day: '2-digit', month: 'short' })}
                                                            </span>
                                                        </div>
                                                    )}

                                                    <motion.div rounded-md
                                                        initial={{ opacity: 0, scale: 0.95, y: 10 }}
                                                        animate={{ opacity: 1, scale: 1, y: 0 }}
                                                        className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}
                                                    >
                                                        <div className={`max-w-[85%] lg:max-w-[75%] relative ${isMe ? 'items-end' : 'items-start'} flex flex-col group`}>
                                                            <div className={`px-4 py-2.5 rounded-md text-[12px] font-bold shadow-xl relative transition-all hover:shadow-2xl ${isMe ? 'bg-brand-primary text-white rounded-tr-none' : 'bg-slate-800 text-slate-200 rounded-tl-none border border-white/5'}`}>
                                                                <p className="italic leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                                                                {/* Triangle/Tail (WhatsApp Style) */}
                                                                <div className={`absolute top-0 w-3 h-3 ${isMe ? '-right-1.5 bg-brand-primary clip-path-right' : '-left-1.5 bg-slate-800 clip-path-left border-t border-l border-white/5'}`}></div>
                                                            </div>

                                                            {/* Time Outside of Div */}
                                                            <div className={`flex items-center gap-1.5 mt-1 opacity-50 group-hover:opacity-100 transition-opacity mx-1`}>
                                                                <span className="text-[7px] font-black uppercase tracking-widest italic text-slate-500">{new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                                                {isMe && <div className="w-1 h-1 rounded-md bg-slate-700"></div>}
                                                            </div>
                                                        </div>
                                                    </motion.div>
                                                </React.Fragment>
                                            );
                                        })}

                                        {chatMessages.length === 0 && !fetchingChat && (
                                            <div className="h-full flex flex-col items-center justify-center opacity-30 gap-6">
                                                <div className="w-16 h-16 rounded-md border-2 border-dashed border-slate-700 flex items-center justify-center rotate-45 group-hover:rotate-0 transition-transform duration-700">
                                                    <Mic size={24} className="text-slate-700 -rotate-45 group-hover:rotate-0 transition-transform" />
                                                </div>
                                                <p className="text-[9px] font-black uppercase tracking-[0.4em] italic leading-none">Establishing Secure Link...</p>
                                            </div>
                                        )}
                                    </div>

                                    {/* Chat Input */}
                                    <div className="p-5 border-t border-white/5 bg-slate-900 shadow-[0_-20px_50px_rgba(0,0,0,0.5)]">
                                        <form onSubmit={(e) => { e.preventDefault(); handleSend(null, selectedChat); }} className="flex items-center gap-3 bg-slate-950/50 border border-slate-800 rounded-md p-1.5 focus-within:border-brand-primary transition-all">
                                            <button type="button" className="p-3 rounded-md text-slate-600 hover:text-white transition-colors"><Paperclip size={18} /></button>
                                            <input
                                                required
                                                placeholder="COMMAND INPUT..."
                                                value={formData.content}
                                                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                                                className="flex-1 bg-transparent h-11 px-3 text-[13px] font-black text-white outline-none italic placeholder:text-slate-800 uppercase tracking-tighter"
                                            />
                                            <button type="button" className="p-3 rounded-md text-slate-600 hover:text-white transition-colors"><Smile size={18} /></button>
                                            <button
                                                type="submit"
                                                className="bg-brand-primary text-white p-3 rounded-md shadow-lg shadow-brand-primary/20 hover:scale-105 transition-all group active:scale-95"
                                            >
                                                <Send size={18} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                                            </button>
                                        </form>
                                    </div>
                                </>
                            ) : (
                                <div className="h-full flex flex-col items-center justify-center p-20 text-center space-y-10 group">
                                    <div className="relative">
                                        <div className="w-32 h-32 rounded-md border-4 border-slate-800 border-t-brand-primary animate-spin"></div>
                                        <MessageSquare size={48} className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-slate-800 group-hover:text-brand-primary transition-colors duration-500" />
                                    </div>
                                    <div className="space-y-4">
                                        <h3 className="text-2xl font-black text-white uppercase italic tracking-tighter leading-none">INITIALIZE COMMS PROBE</h3>
                                        <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest leading-relaxed max-w-sm">Select a transmission endpoint from the encrypted archive to begin secured institutional relay.</p>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <div className="h-px w-8 bg-slate-800"></div>
                                        <div className="h-1.5 w-1.5 rounded-md bg-slate-800"></div>
                                        <div className="h-px w-8 bg-slate-800"></div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </>
                ) : (
                    /* FEED INTERFACE (Announcements & Notices) */
                    <>
                        {/* Compose Section */}
                        <div className="lg:col-span-5 flex flex-col min-h-0 min-w-0">
                            <div className="bg-slate-900/40 border border-slate-800/60 rounded-md p-6 lg:p-8 backdrop-blur-3xl relative overflow-hidden group shadow-2xl flex-1 flex flex-col min-h-0">
                                <div className="absolute top-0 right-0 w-64 h-64 bg-brand-primary/5 rounded-md blur-[100px] -mr-32 -mt-32 transition-transform group-hover:scale-110 duration-1000"></div>

                                <div className="relative z-10 space-y-6 flex flex-col h-full">
                                    <div className="flex items-center justify-between">
                                        <h2 className="text-lg font-black text-white uppercase italic tracking-tight flex items-center gap-4">
                                            <Send className={`text-${activeTab === 'announcements' ? 'brand-primary' : 'emerald-500'}`} size={20} />
                                            New {activeTab === 'announcements' ? 'Broad Dispatch' : 'Public Notice'}
                                        </h2>
                                        <div className="text-[8px] font-black text-slate-500 uppercase tracking-widest bg-slate-800/50 px-3 py-1.5 rounded-md border border-slate-700/50 italic">SECURE DISPATCH</div>
                                    </div>

                                    <form onSubmit={handleSend} className="space-y-6 flex-1 flex flex-col min-h-0 pr-1 custom-scrollbar overflow-y-auto">
                                        {activeTab === 'announcements' && (
                                            <div className="space-y-3">
                                                <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2 italic ml-1">
                                                    <Users size={11} className="text-brand-primary" /> Target Demographic
                                                </label>
                                                <div className="grid grid-cols-2 gap-3 p-1">
                                                    {['All', 'Student', 'Teacher', 'Parent'].map(role => (
                                                        <button
                                                            key={role}
                                                            type="button"
                                                            onClick={() => setFormData({ ...formData, targetRole: role })}
                                                            className={`py-3 rounded-md text-[10px] font-black uppercase tracking-widest border transition-all ${formData.targetRole === role ? 'bg-brand-primary/10 border-brand-primary text-brand-primary shadow-lg shadow-brand-primary/5 scale-[1.02]' : 'bg-slate-950/60 border-slate-800 text-slate-600 hover:border-slate-700'}`}
                                                        >
                                                            {role}
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        <div className="space-y-3">
                                            <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2 italic ml-1">
                                                <Bell size={11} className={`text-${activeTab === 'announcements' ? 'brand-primary' : 'emerald-500'}`} /> Subject Line
                                            </label>
                                            <input
                                                required
                                                placeholder="ENTER HEADER..."
                                                value={formData.subject}
                                                onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                                                className={`w-full bg-slate-950/60 border border-slate-800 rounded-md p-4 text-white text-[13px] font-black uppercase tracking-tighter outline-none focus:border-${activeTab === 'announcements' ? 'brand-primary' : 'emerald-500'} transition-all placeholder:text-slate-800 italic`}
                                            />
                                        </div>

                                        <div className="space-y-3 flex-1 flex flex-col">
                                            <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2 italic ml-1">
                                                <MessageSquare size={11} className={`text-${activeTab === 'announcements' ? 'brand-primary' : 'emerald-500'}`} /> Signal Payload
                                            </label>
                                            <textarea
                                                required
                                                placeholder="COMPOSE DIRECTIVE..."
                                                value={formData.content}
                                                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                                                className={`flex-1 w-full bg-slate-950/60 border border-slate-800 rounded-md p-5 text-white text-[13px] font-bold outline-none focus:border-${activeTab === 'announcements' ? 'brand-primary' : 'emerald-500'} transition-all placeholder:text-slate-800 italic resize-none uppercase tracking-tighter`}
                                            />
                                        </div>

                                        <button
                                            type="submit"
                                            className={`w-full py-4 rounded-md flex items-center justify-center gap-3 text-[12px] font-black uppercase tracking-[0.3em] transition-all shadow-2xl active:scale-95 group ${activeTab === 'announcements' ? 'bg-brand-primary text-white shadow-brand-primary/20 hover:bg-brand-primary/90' : 'bg-emerald-500 text-white shadow-emerald-500/20 hover:bg-emerald-600'}`}
                                        >
                                            <Send size={18} className="group-hover:-translate-y-1 group-hover:translate-x-1 transition-transform" />
                                            INITIALIZE SIGNAL
                                        </button>
                                    </form>
                                </div>
                            </div>
                        </div>

                        {/* Archive Section */}
                        <div className="lg:col-span-7 flex flex-col min-h-0 space-y-8">
                            <div className="flex items-center justify-between shrink-0 px-2">
                                <div className="flex items-center gap-3">
                                    <h3 className="text-[11px] font-black text-white uppercase tracking-widest flex items-center gap-3 italic leading-none">
                                        <div className={`p-1.5 rounded-md bg-${activeTab === 'announcements' ? 'brand-primary' : 'emerald-500'}/10 border border-${activeTab === 'announcements' ? 'brand-primary' : 'emerald-500'}/20`}>
                                            <Filter size={16} className={`text-${activeTab === 'announcements' ? 'brand-primary' : 'emerald-500'}`} />
                                        </div>
                                        ACTIVE ARCHIVE
                                    </h3>
                                    <span className="bg-slate-900 border border-slate-800 text-slate-500 text-[8px] font-black px-3 py-1 rounded-md tracking-widest italic cursor-default">
                                        {activeTab === 'announcements' ? announcements.length : notices.length} RECORDS
                                    </span>
                                </div>
                                <button onClick={fetchData} className="group flex items-center gap-2 text-[9px] font-black text-slate-600 uppercase tracking-widest hover:text-white transition-all italic">
                                    SYNC <ArrowUpRight size={12} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                                </button>
                            </div>

                            <div className="flex-1 space-y-6 overflow-y-auto pr-4 custom-scrollbar">
                                <AnimatePresence mode="popLayout">
                                    {(activeTab === 'announcements' ? announcements : notices).map((item, idx) => (
                                        <motion.div
                                            initial={{ opacity: 0, y: 30 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, scale: 0.95 }}
                                            transition={{ delay: idx * 0.05 }}
                                            key={item._id}
                                            className={`bg-slate-900/30 border border-slate-800/60 rounded-md p-6 lg:p-8 hover:border-white/20 transition-all group relative overflow-hidden backdrop-blur-2xl shadow-xl ${activeTab === 'notices' ? 'border-l-4 border-l-emerald-500/40' : 'border-l-4 border-l-brand-primary/40'}`}
                                        >
                                            <div className="absolute top-0 right-0 w-32 h-32 bg-white/[0.02] rounded-md -mr-16 -mt-16"></div>

                                            <div className="flex flex-col md:flex-row justify-between items-start gap-4 mb-5 relative z-10">
                                                <div className="flex items-center gap-4">
                                                    <div className={`w-12 h-12 rounded-md flex items-center justify-center border border-white/5 shadow-2xl ${activeTab === 'announcements' ? 'bg-brand-primary/10 text-brand-primary shadow-brand-primary/5' : 'bg-emerald-500/10 text-emerald-500 shadow-emerald-500/5'}`}>
                                                        {activeTab === 'announcements' ? <Megaphone size={22} /> : <Layout size={22} />}
                                                    </div>
                                                    <div>
                                                        <h4 className="text-white font-black text-xl uppercase tracking-tighter italic leading-none mb-1.5">{item.subject}</h4>
                                                        <div className="flex items-center gap-3">
                                                            <span className={`text-[8px] font-black uppercase tracking-widest px-3 py-1 rounded-md border italic shadow-inner ${activeTab === 'announcements' ? 'text-brand-primary bg-brand-primary/5 border-brand-primary/10' : 'text-emerald-400 bg-emerald-500/5 border-emerald-500/10'}`}>
                                                                {activeTab === 'announcements' ? `TARGET: ${item.targetRole}` : 'GLOBAL BULLETIN'}
                                                            </span>
                                                            <div className="flex items-center gap-2 text-[8px] font-bold text-slate-600 uppercase tracking-widest italic bg-slate-950/50 px-2.5 py-1 rounded-md border border-white/5">
                                                                <Calendar size={10} className="text-slate-700" /> {new Date(item.createdAt).toLocaleDateString()}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                                <button onClick={() => handleDelete(item._id)} className="p-3 rounded-md bg-slate-950 border border-slate-800 flex items-center justify-center text-slate-700 hover:text-schooladmin-primary hover:border-schooladmin-primary/30 transition-all opacity-0 group-hover:opacity-100 shadow-2xl active:scale-90">
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>

                                            <p className="text-slate-400 text-xs lg:text-sm leading-relaxed font-bold italic border-l-2 border-slate-800/80 pl-6 mb-6 relative z-10 max-w-4xl uppercase tracking-tighter opacity-90">{item.content}</p>

                                            <div className="flex items-center justify-between text-[9px] font-black uppercase tracking-[0.2em] text-slate-600 italic relative z-10 pt-4 border-t border-white/[0.03]">
                                                <div className="flex items-center gap-2">
                                                    <div className={`w-1.5 h-1.5 rounded-md ${activeTab === 'announcements' ? 'bg-brand-primary' : 'bg-emerald-500'} animate-pulse`}></div>
                                                    <span>AUTHORITY: {item.sender?.firstName} {item.sender?.lastName} [ADMIN]</span>
                                                </div>
                                                <span className={activeTab === 'announcements' ? 'text-brand-primary/60' : 'text-emerald-400/60'}>
                                                    {activeTab === 'announcements' ? 'Broadcast Protcol' : 'Bulletin Relay'}
                                                </span>
                                            </div>
                                        </motion.div>
                                    ))}
                                </AnimatePresence>

                                {loading && (
                                    <div className="flex flex-col items-center justify-center py-20 space-y-6">
                                        <div className="relative">
                                            <div className="w-16 h-16 border-4 border-brand-primary/20 rounded-md animate-ping"></div>
                                            <div className="absolute inset-0 w-16 h-16 border-4 border-brand-primary border-t-transparent rounded-md animate-spin"></div>
                                        </div>
                                        <span className="text-[12px] font-black uppercase tracking-[0.5em] text-slate-500 italic animate-pulse">Syncing Signal Archive...</span>
                                    </div>
                                )}

                                {!loading && (activeTab === 'announcements' ? announcements.length === 0 : notices.length === 0) && (
                                    <div className="bg-slate-900/20 border border-dashed border-slate-800 rounded-md p-32 flex flex-col items-center text-center space-y-8 animate-pulse">
                                        <AlertCircle size={64} className="text-slate-800 opacity-50" />
                                        <div>
                                            <h4 className="text-slate-600 font-black text-2xl uppercase italic tracking-widest">Archive Void Detected</h4>
                                            <p className="text-slate-700 text-[11px] font-black uppercase tracking-[0.3em] mt-4 max-w-xs leading-relaxed">The historical database for this transmission sector is currently depleted.</p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default Communication;

