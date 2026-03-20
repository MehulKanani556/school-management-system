import React, { useState, useEffect, useMemo } from 'react';
import { 
    Send, 
    Bell, 
    MessageSquare, 
    Users, 
    User, 
    Search, 
    Filter,
    Calendar,
    ArrowUpRight,
    Megaphone,
    Mail,
    AlertCircle,
    Mic,
    Paperclip,
    Smile,
    ArrowLeft,
    Clock,
    Activity,
    Shield,
    ChevronDown,
    Layout,
    XCircle
} from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { retractAnnouncement } from '../../redux/slice/teacher.slice';
import axiosInstance from '../../utils/axiosInstance';
import { toast } from 'react-hot-toast';
import { useSocket } from '../../context/SocketContext';
import { motion, AnimatePresence } from 'framer-motion';

const Communication = () => {
    const dispatch = useDispatch();
    const [activeTab, setActiveTab] = useState('feed'); // 'feed', 'chat', 'notices'
    const [sentMessages, setSentMessages] = useState([]);
    const [notices, setNotices] = useState([]);
    const [contacts, setContacts] = useState([]);
    const [fetching, setFetching] = useState(false);
    const [selectedChat, setSelectedChat] = useState(null);
    const [messageInput, setMessageInput] = useState('');
    const [announcementInput, setAnnouncementInput] = useState({
        subject: '',
        content: '',
        targetRole: 'Student'
    });

    const { socket } = useSocket();
    const { user: currentUser } = useSelector(state => state.auth);
    
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

    useEffect(() => {
        fetchData();
    }, [activeTab]);

    useEffect(() => {
        if (!socket || typeof socket.on !== 'function') return;
        
        const handleNewMessage = (data) => {
            if (data.type === 'Announcement') {
                setSentMessages(prev => [data, ...prev]);
                toast.success(`Broadcasting Alert: ${data.subject}`);
            } else if (data.type === 'DirectMessage') {
                const partnerId = data.sender?._id === currentUser?._id ? data.recipient?._id || data.recipient : data.sender?._id;
                
                // If active chat, append using ref
                if (partnerId === selectedChatRef.current) {
                    setChatMessages(prev => [...prev, data]);
                    setTimeout(() => {
                        if (chatContainerRef.current) chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
                    }, 100);
                }

                // Update contact preview
                setSentMessages(prev => [data, ...prev.filter(m => {
                    const mPartnerId = m.sender?._id === currentUser?._id ? m.recipient?._id || m.recipient : m.sender?._id;
                    return m.type !== 'DirectMessage' || mPartnerId !== partnerId;
                })]);
                
                toast.success(`Direct Signal: ${data.sender?.firstName || 'User'}`);
            } else if (data.type === 'Notice') {
                setNotices(prev => [data, ...prev]);
                toast.success(`Notice Updated: ${data.subject}`);
            }
        };

        socket.on('new_announcement', handleNewMessage);
        socket.on('new_direct_message', handleNewMessage);
        socket.on('new_notice', handleNewMessage);

        return () => { 
            if (socket && typeof socket.off === 'function') {
                socket.off('new_announcement', handleNewMessage);
                socket.off('new_direct_message', handleNewMessage);
                socket.off('new_notice', handleNewMessage);
            }
        };
    }, [socket]);

    const fetchData = async () => {
        setFetching(true);
        try {
            const [msgRes, conRes, notRes] = await Promise.all([
                axiosInstance.get('/my-messages'),
                axiosInstance.get('/contacts'),
                axiosInstance.get('/notices')
            ]);
            setSentMessages(msgRes.data);
            setContacts(conRes.data);
            setNotices(notRes.data);
        } catch (err) {
            toast.error('Signal Archive sync failed');
        } finally {
            setFetching(false);
        }
    };

    const fetchChatHistory = async (partnerId, page = 1, isLoadingMore = false) => {
        if (!partnerId) return;
        setFetchingChat(true);
        try {
            const res = await axiosInstance.get(`/chat-history/${partnerId}?page=${page}`);
            const newMsgs = res.data.reverse();
            
            if (newMsgs.length < 50) setHasMore(false);
            else setHasMore(true);

            if (isLoadingMore) {
                if (chatContainerRef.current) lastScrollHeightRef.current = chatContainerRef.current.scrollHeight;
                setChatMessages(prev => [...newMsgs, ...prev]);
            } else {
                setChatMessages(newMsgs);
                setTimeout(() => {
                    if (chatContainerRef.current) chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
                }, 100);
            }
        } catch (err) {
            toast.error('Uplink history sync failed');
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

    const handleSendAnnouncement = async (e) => {
        e.preventDefault();
        try {
            await axiosInstance.post('/teacher/send-message', {
                ...announcementInput,
                type: 'Announcement'
            });
            toast.success('Broadcast Dispatched');
            setAnnouncementInput({ subject: '', content: '', targetRole: 'Student' });
            fetchData();
        } catch (err) {
            toast.error('Broadcast failed');
        }
    };

    const handleDeleteAnnouncement = async (id) => {
        if (!window.confirm('PROTOCOL ALERT: Retract institutional directive from archival memory?')) return;
        try {
            await dispatch(retractAnnouncement(id)).unwrap();
            toast.success('Directive Decommissioned');
            fetchData();
        } catch (err) {
            toast.error('Retraction failed');
        }
    };

    const handleSendPrivate = async (recipientId) => {
        if (!messageInput.trim()) return;
        try {
            const payload = {
                recipient: recipientId,
                content: messageInput,
                subject: 'Direct Response',
                schoolId: currentUser?.schoolId // Required for socket save logic
            };

            if (socket) {
                socket.emit('send_direct_message', payload);
            } else {
                // Fallback
                await axiosInstance.post('/teacher/send-message', {
                    ...payload,
                    type: 'DirectMessage'
                });
            }
            
            setMessageInput('');
            // No fetchData() needed for direct messages as socket update handles it
        } catch (err) {
            toast.error('Uplink failed');
        }
    };

    // Chat Logic
    const conversations = useMemo(() => {
        const groups = {};
        sentMessages.filter(m => m.type === 'DirectMessage').forEach(msg => {
            const partner = msg.sender?._id === currentUser?._id ? msg.recipient : msg.sender;
            if (!partner) return;
            const pId = partner._id || partner;
            if (!groups[pId]) groups[pId] = { partner, messages: [] };
            groups[pId].messages.push(msg);
        });
        return Object.values(groups).sort((a,b) => new Date(b.messages[0].createdAt) - new Date(a.messages[0].createdAt));
    }, [sentMessages, currentUser]);

    const activeConversation = useMemo(() => {
        return conversations.find(c => (c.partner._id || c.partner) === selectedChat);
    }, [conversations, selectedChat]);

    return (
        <div className="min-h-screen bg-[#020617] text-slate-300 font-outfit p-4 lg:p-10 overflow-hidden flex flex-col">
            {/* Header */}
            <div className="max-w-[1500px] w-full mx-auto shrink-0 mb-10">
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
                    <div className="space-y-4">
                        <div className="flex items-center gap-3">
                            <div className="h-[2px] w-8 bg-brand-primary rounded-md"></div>
                            <span className="text-[9px]  font-black text-brand-primary uppercase tracking-[0.45em] italic leading-none">Transmission Hub</span>
                        </div>
                        <h1 className="text-4xl text-left lg:text-5xl font-black text-white uppercase tracking-tighter italic leading-none">
                            SIGNAL <span className="text-brand-primary">RELAY</span>
                        </h1>
                        <p className="text-slate-500 font-bold text-[10px] lg:text-xs tracking-wider uppercase max-w-xl">Broadcasting authorized institutional directives across academic clusters.</p>
                    </div>

                    <div className="flex bg-slate-900 p-1.5 rounded-md border border-slate-800/60 backdrop-blur-3xl shadow-2xl overflow-x-auto custom-scrollbar no-scrollbar">
                        {[
                            { id: 'feed', label: 'Broadcasts', icon: Activity, color: 'brand-primary' },
                            { id: 'chat', label: 'Direct Probe', icon: Shield, color: 'indigo-500' },
                            { id: 'notices', label: 'Notice Board', icon: Layout, color: 'emerald-500' }
                        ].map(t => (
                            <button 
                                key={t.id}
                                onClick={() => { setActiveTab(t.id); setSelectedChat(null); }}
                                className={`flex items-center gap-3 px-8 py-4 rounded-md text-[10px] font-black uppercase tracking-widest transition-all shrink-0 ${activeTab === t.id ? `bg-${t.color} text-white shadow-xl shadow-${t.color}/20 scale-105` : 'text-slate-500 hover:text-slate-200'}`}
                            >
                                <t.icon size={16} />
                                {t.label}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            <div className="max-w-[1500px] w-full mx-auto flex-1 grid grid-cols-1 lg:grid-cols-12 gap-10 min-h-0">
                {activeTab === 'chat' ? (
                    <>
                        <div className={`lg:col-span-4 flex flex-col min-h-0 bg-slate-900/40 border border-slate-800/60 rounded-md backdrop-blur-3xl overflow-hidden shadow-2xl ${selectedChat ? 'hidden lg:flex' : 'flex'}`}>
                             <div className="p-8 border-b border-white/5 space-y-6 shrink-0 bg-slate-900/60">
                                <div className="flex items-center justify-between">
                                    <h2 className="text-sm font-black text-white uppercase tracking-widest italic flex items-center gap-3 leading-none">
                                        <Activity size={18} className="text-brand-primary" />
                                        Comms Channels
                                    </h2>
                                    <div className="w-8 h-8 rounded-md bg-slate-800 border border-slate-700/50 flex items-center justify-center animate-pulse">
                                        <div className="w-2 h-2 rounded-md bg-brand-primary shadow-lg shadow-brand-primary/50"></div>
                                    </div>
                                </div>
                                <div className="relative group">
                                    <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-700 group-focus-within:text-brand-primary transition-colors" />
                                    <input 
                                        placeholder="SCAN COMMS LOG..."
                                        className="w-full h-14 bg-slate-950/50 border border-slate-800 rounded-md pl-12 pr-6 text-[10px] font-black text-white italic tracking-widest outline-none focus:border-brand-primary transition-all placeholder:text-slate-800 uppercase"
                                    />
                                </div>
                            </div>
                            <div className="flex-1 overflow-y-auto p-4 space-y-2 custom-scrollbar">
                                <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest px-4 mb-4 italic">Active Sessions</p>
                                {conversations.map(conv => (
                                    <button 
                                        key={conv.partner._id}
                                        onClick={() => setSelectedChat(conv.partner._id)}
                                        className={`w-full flex items-center gap-4 p-5 rounded-md transition-all border ${selectedChat === conv.partner._id ? 'bg-brand-primary/10 border-brand-primary/30' : 'bg-transparent border-transparent hover:bg-slate-800/30'}`}
                                    >
                                        <div className="w-14 h-14 rounded-md bg-slate-800 border border-white/5 overflow-hidden flex items-center justify-center shadow-2xl shrink-0">
                                            {conv.partner.photo ? <img src={conv.partner.photo} alt="" className="w-full h-full object-cover" /> : <User size={24} className="text-slate-700" />}
                                        </div>
                                        <div className="text-left min-w-0 flex-1">
                                            <h4 className="text-white font-black text-[13px] uppercase tracking-tighter truncate italic">{conv.partner.firstName} {conv.partner.lastName}</h4>
                                            <p className="text-[9px] text-slate-600 font-bold truncate mt-1 italic uppercase tracking-tighter">{conv.messages[0].content}</p>
                                        </div>
                                        <div className="text-[9px] font-black text-slate-700 italic shrink-0">LOCKED</div>
                                    </button>
                                ))}
                                {conversations.length === 0 && (
                                    <div className="text-center py-20 opacity-20">
                                        <Bell size={40} className="mx-auto mb-4" />
                                        <p className="text-[10px] font-black uppercase tracking-widest italic">No Open Channels</p>
                                    </div>
                                )}

                                <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest px-4 mt-8 mb-4 italic">Available Contacts</p>
                                {contacts.filter(t => !conversations.some(c => (c.partner._id || c.partner) === t._id)).map(t => (
                                    <button 
                                        key={t._id}
                                        onClick={() => setSelectedChat(t._id)}
                                        className="w-full flex items-center gap-4 p-4 rounded-md transition-all border border-transparent hover:bg-slate-800/30 group"
                                    >
                                        <div className="w-12 h-12 rounded-md bg-slate-800/50 border border-white/5 overflow-hidden flex items-center justify-center grayscale group-hover:grayscale-0 transition-all shrink-0">
                                            {t.photo ? <img src={t.photo} alt="" className="w-full h-full object-cover" /> : <User size={18} className="text-slate-600" />}
                                        </div>
                                        <div className="text-left flex-1 min-w-0">
                                            <h4 className="text-slate-500 group-hover:text-white font-black text-[11px] uppercase tracking-tighter italic transition-colors truncate">{t.firstName} {t.lastName}</h4>
                                            <p className="text-[8px] text-slate-600 font-black uppercase tracking-widest truncate">Institutional Role: {t.role}</p>
                                        </div>
                                        <ArrowUpRight size={14} className="ml-auto text-slate-800 group-hover:text-brand-primary shrink-0" />
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className={`lg:col-span-8 flex flex-col min-h-0 bg-slate-900/40 border border-slate-800/60 rounded-md backdrop-blur-3xl overflow-hidden shadow-2xl relative ${!selectedChat ? 'hidden lg:flex' : 'flex'}`}>
                            {selectedChat ? (
                                <>
                                    <div className="p-8 border-b border-white/5 flex items-center justify-between bg-slate-900/60 shadow-xl shrink-0">
                                        <div className="flex items-center gap-6">
                                            <button onClick={() => setSelectedChat(null)} className="lg:hidden p-3 rounded-md bg-slate-800 text-slate-400">
                                                <ArrowLeft size={20} />
                                            </button>
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-12 rounded-md bg-slate-800 border border-white/5 flex items-center justify-center shadow-lg relative shrink-0">
                                                    {activeConversation?.partner.photo ? <img src={activeConversation.partner.photo} alt="" className="w-full h-full object-cover rounded-md" /> : <User size={20} className="text-slate-600" />}
                                                    <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-md bg-green-500 border-2 border-[#020617] shadow-lg"></div>
                                                </div>
                                                <div className="min-w-0">
                                                    <h3 className="text-white font-black text-[14px] uppercase tracking-tight italic leading-none mb-1.5 truncate">
                                                        {activeConversation?.partner.firstName || contacts.find(c => c._id === selectedChat)?.firstName} {activeConversation?.partner.lastName || contacts.find(c => c._id === selectedChat)?.lastName}
                                                    </h3>
                                                    <div className="flex items-center gap-3">
                                                        <div className="h-1.5 w-1.5 rounded-md bg-green-500 animate-pulse"></div>
                                                        <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest italic">Encrypted Secure Link</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <button className="p-4 rounded-md bg-slate-800/50 text-slate-400 hover:text-brand-primary border border-transparent hover:border-brand-primary/20 transition-all"><Paperclip size={18}/></button>
                                            <button className="p-4 rounded-md bg-brand-primary text-white shadow-lg shadow-brand-primary/20"><Mic size={18}/></button>
                                        </div>
                                    </div>

                                    <div 
                                        ref={chatContainerRef}
                                        onScroll={handleScroll}
                                        className="flex-1 overflow-y-auto p-8 lg:p-12 space-y-8 custom-scrollbar bg-slate-950/20 flex flex-col"
                                    >
                                        {fetchingChat && hasMore && (
                                            <div className="flex justify-center py-2">
                                                <div className="w-1.5 h-1.5 rounded-md bg-brand-primary animate-pulse"></div>
                                            </div>
                                        )}
                                        
                                        <div className="flex flex-col gap-6">
                                            {chatMessages.map((m, i) => {
                                                const isMe = m.sender === currentUser?._id || m.sender?._id === currentUser?._id;
                                                const showDate = i === 0 || new Date(chatMessages[i-1].createdAt).toDateString() !== new Date(m.createdAt).toDateString();

                                                return (
                                                    <React.Fragment key={m._id}>
                                                        {showDate && (
                                                            <div className="flex flex-col items-center justify-center my-6">
                                                                <div className="h-[1px] w-8 bg-slate-800/50"></div>
                                                                <span className="text-[8px] font-black text-slate-600 bg-slate-900/50 px-4 py-1.5 rounded-md uppercase tracking-[0.2em] my-2 italic border border-white/5 shadow-inner">
                                                                    {new Date(m.createdAt).toLocaleDateString([], { weekday: 'short', day: '2-digit', month: 'short' })}
                                                                </span>
                                                            </div>
                                                        )}
                                                        
                                                        <div className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                                                            <div className={`max-w-[85%] lg:max-w-[75%] relative flex flex-col group ${isMe ? 'items-end' : 'items-start'}`}>
                                                                <div className={`px-6 py-3.5 rounded-xl text-[14px] font-bold shadow-2xl transition-all relative ${isMe ? 'bg-brand-primary text-white rounded-tr-none' : 'bg-slate-800 text-slate-200 rounded-tl-none border border-white/5'}`}>
                                                                    <p className="italic leading-relaxed whitespace-pre-wrap uppercase tracking-tight">{m.content}</p>
                                                                    <div className="flex items-center gap-1.5 justify-end mt-2 opacity-30 group-hover:opacity-100 transition-opacity">
                                                                        <span className="text-[8px] font-black uppercase tracking-widest italic">{new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                                                        {isMe && <div className="w-1 h-1 rounded-md bg-white/40"></div>}
                                                                    </div>
                                                                    <div className={`absolute top-0 w-3 h-3 ${isMe ? '-right-1.5 bg-brand-primary clip-path-right' : '-left-1.5 bg-slate-800 clip-path-left border-t border-l border-white/5'}`}></div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </React.Fragment>
                                                );
                                            })}
                                        </div>
                                    </div>

                                    <div className="p-8 bg-slate-900 shadow-2xl border-t border-white/5 shrink-0">
                                        <form 
                                            onSubmit={(e) => { e.preventDefault(); handleSendPrivate(selectedChat); }}
                                            className="flex items-center gap-4 bg-slate-950 p-2 rounded-md border border-slate-800/80 focus-within:border-brand-primary/30 transition-all shadow-inner"
                                        >
                                            <button type="button" className="p-5 rounded-md text-slate-600 hover:text-brand-primary transition-colors"><Smile size={24}/></button>
                                            <input 
                                                value={messageInput}
                                                onChange={(e) => setMessageInput(e.target.value)}
                                                placeholder="ENTER ENCRYPTED PAYLOAD..."
                                                className="flex-1 bg-transparent border-none text-white text-sm font-black italic tracking-widest outline-none placeholder:text-slate-800 uppercase"
                                            />
                                            <button 
                                                type="submit"
                                                className="bg-brand-primary text-white p-5 rounded-md shadow-lg shadow-brand-primary/40 hover:scale-105 active:scale-95 transition-all"
                                            >
                                                <Send size={24} />
                                            </button>
                                        </form>
                                    </div>
                                </>
                            ) : (
                                <div className="flex-1 flex flex-col items-center justify-center p-20 text-center space-y-10 opacity-40 grayscale pointer-events-none bg-slate-950/20">
                                    <div className="relative">
                                        <div className="w-40 h-40 rounded-md border-8 border-slate-800 border-t-brand-primary animate-spin opacity-20"></div>
                                        <div className="absolute inset-0 flex items-center justify-center">
                                            <Shield size={64} className="text-slate-800" />
                                        </div>
                                    </div>
                                    <h3 className="text-3xl font-black text-white uppercase italic tracking-tighter">SECURE UPLINK STANDBY</h3>
                                    <p className="text-[11px] font-black text-slate-600 uppercase tracking-widest leading-relaxed max-w-sm mx-auto italic">Synchronize with an approved administrative terminal to initiate secure data relay.</p>
                                </div>
                            )}
                        </div>
                    </>
                ) : activeTab === 'feed' ? (
                    <>
                        <div className="lg:col-span-5 flex flex-col gap-10 min-h-0">
                            <div className="bg-slate-900 border border-brand-primary/20 rounded-md p-12 relative overflow-hidden shadow-2xl shrink-0">
                                <div className="relative z-10 space-y-10">
                                    <h2 className="text-2xl font-black text-white uppercase italic tracking-tight flex items-center gap-6 leading-none">
                                        <Megaphone className="text-brand-primary" size={32} />
                                        Authorized Dispatch
                                    </h2>
                                    <form onSubmit={handleSendAnnouncement} className="space-y-8">
                                        <div className="grid grid-cols-2 gap-4">
                                            {['Student', 'Parent'].map(role => (
                                                <button
                                                    key={role}
                                                    type="button"
                                                    onClick={() => setAnnouncementInput({...announcementInput, targetRole: role})}
                                                    className={`py-5 rounded-md text-[11px] font-black uppercase tracking-widest border transition-all ${announcementInput.targetRole === role ? 'bg-brand-primary/10 border-brand-primary text-brand-primary' : 'bg-slate-950 border-slate-800 text-slate-600'}`}
                                                >
                                                    {role} CLUSTER
                                                </button>
                                            ))}
                                        </div>
                                        <div className="space-y-4">
                                            <input 
                                                required
                                                placeholder="ENTER SIGNAL SUBJECT..."
                                                value={announcementInput.subject}
                                                onChange={(e) => setAnnouncementInput({...announcementInput, subject: e.target.value})}
                                                className="w-full h-16 bg-slate-950 border border-slate-800 rounded-md px-6 text-white text-sm font-black uppercase outline-none focus:border-brand-primary transition-all italic"
                                            />
                                            <textarea 
                                                required
                                                rows={5}
                                                placeholder="COMPOSE INSTITUTIONAL DIRECTIVE..."
                                                value={announcementInput.content}
                                                onChange={(e) => setAnnouncementInput({...announcementInput, content: e.target.value})}
                                                className="w-full bg-slate-950 border border-slate-800 rounded-md p-8 text-white text-sm font-bold outline-none focus:border-brand-primary transition-all italic resize-none uppercase"
                                            />
                                        </div>
                                        <button type="submit" className="w-full py-6 rounded-md bg-brand-primary text-white flex items-center justify-center gap-4 text-[15px] font-black uppercase tracking-[0.4em] transition-all shadow-xl">
                                            <Send size={24} />
                                            INITIATE SIGNAL
                                        </button>
                                    </form>
                                </div>
                            </div>
                        </div>

                        <div className="lg:col-span-7 flex flex-col gap-8 min-h-0">
                            <div className="flex items-center justify-between px-2 shrink-0">
                                <h3 className="text-sm font-black text-white uppercase tracking-widest flex items-center gap-4 italic leading-none">
                                    <Filter size={20} className="text-brand-primary" />
                                    ARCHIVED TRANSMISSIONS
                                </h3>
                                <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest italic">{sentMessages.filter(m => m.type === 'Announcement').length} RECORDS FOUND</span>
                            </div>

                            <div className="flex-1 overflow-y-auto pr-4 space-y-6 custom-scrollbar">
                                <AnimatePresence mode="popLayout">
                                    {sentMessages.filter(m => m.type === 'Announcement').map((msg, idx) => (
                                        <motion.div 
                                            key={msg._id} 
                                            initial={{ opacity: 0, x: 20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            className="bg-slate-900/40 border border-slate-800/60 rounded-md p-10 hover:border-brand-primary/20 backdrop-blur-2xl shadow-xl border-l-[6px] border-l-brand-primary/40 group relative"
                                        >
                                            <div className="absolute top-5 right-5 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button 
                                                    onClick={() => handleDeleteAnnouncement(msg._id)}
                                                    className="p-3 bg-red-500/10 text-red-500 rounded-md border border-red-500/20 hover:bg-red-500 hover:text-white transition-all shadow-xl"
                                                >
                                                    <XCircle size={16} />
                                                </button>
                                            </div>
                                            <div className="flex items-center gap-6 mb-8">
                                                <div className="w-16 h-16 rounded-md bg-brand-primary/10 text-brand-primary flex items-center justify-center border border-white/5">
                                                    <Megaphone size={28} />
                                                </div>
                                                <div>
                                                    <h4 className="text-white font-black text-2xl uppercase tracking-tighter italic leading-none mb-3">{msg.subject}</h4>
                                                    <div className="flex items-center gap-4">
                                                        <span className="text-[9px] font-black uppercase tracking-[0.2em] px-4 py-2 rounded-md bg-slate-950 border border-slate-800 text-slate-400">TARGET: {msg.targetRole || 'SPECIFIC'}</span>
                                                        <span className="text-[9px] font-black text-slate-600 uppercase tracking-widest italic flex items-center gap-2"><Calendar size={12}/>{new Date(msg.createdAt).toLocaleDateString()}</span>
                                                    </div>
                                                </div>
                                            </div>
                                            <p className="text-slate-400 text-lg leading-relaxed font-bold italic border-l-2 border-slate-800 pl-8 mb-8 uppercase tracking-tighter">{msg.content}</p>
                                        </motion.div>
                                    ))}
                                </AnimatePresence>
                                {fetching && <div className="text-center py-20 opacity-30 uppercase text-[10px] font-black tracking-widest italic">Decoding...</div>}
                            </div>
                        </div>
                    </>
                ) : ( // activeTab === 'notices'
                    <div className="lg:col-span-12 flex flex-col gap-8 min-h-0">
                         <div className="flex items-center justify-between px-2 shrink-0">
                            <h3 className="text-sm font-black text-white uppercase tracking-widest flex items-center gap-4 italic leading-none">
                                <Layout size={20} className="text-emerald-500" />
                                INSTITUTIONAL BULLETIN
                            </h3>
                            <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest italic">{notices.length} RECORDS FOUND</span>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 overflow-y-auto custom-scrollbar p-2">
                             <AnimatePresence mode="popLayout">
                                {notices.map((not, idx) => (
                                    <motion.div 
                                        key={not._id}
                                        initial={{ opacity: 0, scale: 0.9 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        transition={{ delay: idx * 0.05 }}
                                        className="bg-slate-900/40 border border-slate-800/60 rounded-md p-10 backdrop-blur-3xl hover:border-emerald-500/30 transition-all border-t-4 border-t-emerald-500/40 group relative overflow-hidden h-[350px] flex flex-col"
                                    >
                                        <div className="flex items-center gap-5 mb-8">
                                            <div className="w-14 h-14 rounded-md bg-emerald-500/10 flex items-center justify-center text-emerald-500 border border-emerald-500/20">
                                                <AlertCircle size={24} />
                                            </div>
                                            <div className="min-w-0">
                                                <h4 className="text-xl font-black text-white uppercase italic tracking-tighter truncate leading-none mb-2">{not.subject}</h4>
                                                <span className="text-[9px] font-bold text-slate-600 uppercase tracking-widest">{new Date(not.createdAt).toLocaleDateString()}</span>
                                            </div>
                                        </div>
                                        <p className="text-slate-400 text-sm font-bold italic leading-relaxed uppercase tracking-tighter flex-1 overflow-hidden">{not.content}</p>
                                        <div className="mt-8 pt-6 border-t border-white/5 flex items-center justify-between text-[8px] font-black uppercase tracking-widest text-slate-700">
                                            <span>VERIFIED BULLETIN</span>
                                            <span className="text-emerald-500/50">SYSTEM LEVEL RELAY</span>
                                        </div>
                                    </motion.div>
                                ))}
                             </AnimatePresence>

                             {notices.length === 0 && !fetching && (
                                 <div className="col-span-full py-40 text-center opacity-20 italic font-black uppercase tracking-widest">
                                     Notice board empty. Uplink stabilized.
                                 </div>
                             )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Communication;
