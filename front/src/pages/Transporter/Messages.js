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
    AlertCircle,
    Paperclip,
    ArrowLeft,
    Activity,
    Shield,
    Layout,
    XCircle,
    Plus
} from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { 
    fetchMyMessages, 
    fetchNotices, 
    fetchContacts, 
    sendMessageSlice,
    fetchChatHistory,
    addCommunicationMessage
} from '../../redux/slice/communication.slice';
import { fetchRoutesSlice } from '../../redux/slice/transport.slice';
import axiosInstance from '../../utils/axiosInstance';
import { toast } from 'react-hot-toast';
import { useSocket } from '../../context/SocketContext';
import { motion, AnimatePresence } from 'framer-motion';
import { useSearchParams, useLocation } from 'react-router-dom';

const Messages = () => {
    const dispatch = useDispatch();
    const [searchParams] = useSearchParams();
    const tabParam = searchParams.get('tab');
    const location = useLocation();
    
    const [activeTab, setActiveTab] = useState('feed'); // 'feed', 'chat', 'notices'
    const [chatSubTab, setChatSubTab] = useState('Staff'); // 'Staff', 'Drivers', 'Parents'
    const [unreadCounts, setUnreadCounts] = useState({});
    const [selectedChat, setSelectedChat] = useState(null);
    const [messageInput, setMessageInput] = useState('');
    const [announcementInput, setAnnouncementInput] = useState({
        subject: '',
        content: '',
        targetRole: 'Parent'
    });
    const [noticeInput, setNoticeInput] = useState({ subject: '', content: '', classSection: '' });

    const { socket } = useSocket();
    const { user: currentUser } = useSelector(state => state.auth);
    const { 
        contacts, 
        messages: sentMessages,
        notices,
        loading 
    } = useSelector(state => state.communication);
    const { routes } = useSelector(state => state.transport);

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
        dispatch(fetchRoutesSlice());
        fetchData();
    }, [dispatch]);

    useEffect(() => {
        if (tabParam && ['feed', 'chat', 'notices'].includes(tabParam)) {
            setActiveTab(tabParam);
        }
        if (location.state?.directChat) {
            setActiveTab('chat');
            // Try to find contact
            const contact = contacts.find(c => c._id === location.state.directChat);
            if (contact) setSelectedChat(contact._id);
            else setSelectedChat(location.state.directChat);
        }
    }, [tabParam, location.state, contacts]);

    useEffect(() => {
        if (!socket || typeof socket.on !== 'function') return;

        const handleNewMessage = (data) => {
            if (data.type === 'Announcement' || data.type === 'Notice') {
                dispatch(addCommunicationMessage(data));
                toast.success(`${data.type}: ${data.subject}`, { icon: '📢' });
            } else if (data.type === 'DirectMessage') {
                const senderId = (data.sender?._id || data.sender)?.toString();
                const recipientId = (data.recipient?._id || data.recipient)?.toString();
                const meId = currentUser?._id?.toString();
                const partnerId = senderId === meId ? recipientId : senderId;

                if (partnerId === selectedChatRef.current) {
                    setChatMessages(prev => [...prev, data]);
                    setTimeout(() => {
                        if (chatContainerRef.current) chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
                    }, 100);
                } else {
                    setUnreadCounts(prev => ({
                        ...prev,
                        [partnerId]: (prev[partnerId] || 0) + 1
                    }));
                }
                dispatch(addCommunicationMessage(data));
                toast.success(`New Message from ${data.sender?.firstName || 'User'}`, { icon: '💬' });
            }
        };

        socket.on('NEW_ANNOUNCEMENT', handleNewMessage);
        socket.on('NEW_MESSAGE', handleNewMessage);
        socket.on('NEW_NOTICE', handleNewMessage);

        return () => {
            if (socket && typeof socket.off === 'function') {
                socket.off('NEW_ANNOUNCEMENT', handleNewMessage);
                socket.off('NEW_MESSAGE', handleNewMessage);
                socket.off('NEW_NOTICE', handleNewMessage);
            }
        };
    }, [socket, currentUser]);

    const fetchData = () => {
        dispatch(fetchMyMessages());
        dispatch(fetchContacts());
        dispatch(fetchNotices());
    };

    const fetchChatHistoryLocal = async (partnerId, page = 1, isLoadingMore = false) => {
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
            toast.error('Sync failure in transmission history');
        } finally {
            setFetchingChat(false);
        }
    };

    useEffect(() => {
        if (selectedChat) {
            setChatPage(1);
            setChatMessages([]);
            setHasMore(true);
            setUnreadCounts(prev => ({ ...prev, [selectedChat]: 0 }));
            fetchChatHistoryLocal(selectedChat, 1);
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
            fetchChatHistoryLocal(selectedChat, nextPage, true);
        }
    };

    const handleSendAnnouncement = async (e) => {
        e.preventDefault();
        try {
            await axiosInstance.post('/school-admin/announcements', {
                ...announcementInput,
                type: 'Announcement'
            });
            toast.success('Logistics Directive Broadcasted');
            setAnnouncementInput({ subject: '', content: '', targetRole: 'Parent' });
            fetchData();
        } catch (err) {
            toast.error('Broadcast failed');
        }
    };

    const handleSendNotice = async (e) => {
        e.preventDefault();
        if (!noticeInput.subject || !noticeInput.content) return toast.error('Required trajectory data missing');
        try {
            await axiosInstance.post('/school-admin/notices', {
                ...noticeInput,
                type: 'Notice'
            });
            toast.success('Route Advisory Posted');
            setNoticeInput({ subject: '', content: '', classSection: '' });
            fetchData();
        } catch (err) {
            toast.error('Posting failed');
        }
    };

    const handleDeleteMessage = async (id) => {
        if (!window.confirm('Retract this transmission?')) return;
        try {
            await axiosInstance.delete(`/school-admin/messages/${id}`);
            toast.success('Transmission Decommissioned');
            fetchData();
        } catch (err) {
            toast.error('Deletion failure');
        }
    };

    const handleSendPrivate = async (recipientId) => {
        if (!messageInput.trim()) return;
        try {
            const payload = {
                recipient: recipientId,
                content: messageInput,
                subject: 'Logistics Update',
                schoolId: currentUser?.schoolId
            };

            if (socket) {
                socket.emit('send_direct_message', payload);
            } else {
                await axiosInstance.post('/school-admin/messages', {
                    ...payload,
                    type: 'DirectMessage'
                });
            }
            setMessageInput('');
        } catch (err) {
            toast.error('Direct transmission failed');
        }
    };

    const conversations = useMemo(() => {
        const groups = {};
        sentMessages.filter(m => m.type === 'DirectMessage').forEach(msg => {
            const senderId = (msg.sender?._id || msg.sender)?.toString();
            const recipientId = (msg.recipient?._id || msg.recipient)?.toString();
            const meId = currentUser?._id?.toString();
            const partner = senderId === meId ? msg.recipient : msg.sender;
            if (!partner) return;
            const pId = partner._id || partner;
            if (!groups[pId]) groups[pId] = { partner, messages: [] };
            groups[pId].messages.push(msg);
        });
        return Object.values(groups).sort((a, b) => new Date(b.messages[0].createdAt) - new Date(a.messages[0].createdAt));
    }, [sentMessages, currentUser]);

    const activeConversation = useMemo(() => {
        return conversations.find(c => (c.partner._id || c.partner) === selectedChat);
    }, [conversations, selectedChat]);

    const filteredConversations = useMemo(() => {
        return conversations.filter(c => {
            const role = c.partner.role;
            if (chatSubTab === 'Staff') return ['Teacher', 'Accountant', 'Librarian', 'School_Admin'].includes(role);
            if (chatSubTab === 'Drivers') return role === 'Driver';
            if (chatSubTab === 'Parents') return role === 'Parent' || role === 'Student';
            return true;
        });
    }, [conversations, chatSubTab]);

    const filteredContacts = useMemo(() => {
        return contacts.filter(t => {
            if (conversations.some(c => (c.partner._id || c.partner) === t._id)) return false;
            const role = t.role;
            if (chatSubTab === 'Staff') return ['Teacher', 'Accountant', 'Librarian', 'School_Admin'].includes(role);
            if (chatSubTab === 'Drivers') return role === 'Driver';
            if (chatSubTab === 'Parents') return role === 'Parent' || role === 'Student';
            return true;
        });
    }, [contacts, conversations, chatSubTab]);

    const getTabUnreadCount = (tabName) => {
        return conversations.reduce((acc, conv) => {
            const role = conv.partner.role;
            let isMatch = false;
            if (tabName === 'Staff') isMatch = ['Teacher', 'Accountant', 'Librarian', 'School_Admin'].includes(role);
            else if (tabName === 'Drivers') isMatch = role === 'Driver';
            else if (tabName === 'Parents') isMatch = (role === 'Parent' || role === 'Student');
            
            if (isMatch) return acc + (unreadCounts[conv.partner._id] || 0);
            return acc;
        }, 0);
    };

    return (
        <div className="h-[calc(100vh-140px)] text-slate-300 font-outfit overflow-hidden flex flex-col p-4 lg:p-5">
            {/* Header */}
            <div className="max-w-[1600px] w-full mx-auto shrink-0 mb-4">
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                    <div className="space-y-1">
                        <div className="flex items-center gap-2">
                            <div className="h-[2px] w-6 bg-transporter-primary rounded-md"></div>
                            <span className="text-[8px] font-black text-transporter-primary uppercase tracking-[0.4em] italic leading-none">Logistics Comms Node</span>
                        </div>
                        <h1 className="text-2xl lg:text-3xl font-black text-white uppercase tracking-tighter italic leading-none">
                            {activeTab === 'feed' ? (
                                <>FLEET <span className="text-transporter-primary">ANNOUNCEMENTS</span></>
                            ) : activeTab === 'chat' ? (
                                <>DIRECT <span className="text-transporter-primary">MESSAGES</span></>
                            ) : (
                                <>ROUTE <span className="text-transporter-primary">ADVISORIES</span></>
                            )}
                        </h1>
                        <p className="text-slate-500 font-bold text-[8px] tracking-wider uppercase">
                            {activeTab === 'feed' ? 'Broadcast transport updates to parents and drivers.' :
                                activeTab === 'chat' ? 'Private coordination with drivers, staff, and parents.' :
                                    'Specific notices for transport routes and schedules.'}
                        </p>
                    </div>
                    {/* Tab Navigation */}
                    <div className="flex items-center gap-2 bg-slate-900/50 p-1.5 rounded-md border border-white/5 shrink-0">
                        {[
                            { id: 'feed', icon: Megaphone, label: 'Announcements' },
                            { id: 'chat', icon: MessageSquare, label: 'Messages' },
                            { id: 'notices', icon: Layout, label: 'Route Notices' },
                        ].map(t => (
                            <button
                                key={t.id}
                                onClick={() => setActiveTab(t.id)}
                                className={`flex items-center gap-2 px-4 py-2 rounded-md transition-all text-[9px] font-black uppercase tracking-widest italic ${activeTab === t.id ? 'bg-transporter-primary text-white shadow-lg' : 'text-slate-500 hover:text-white hover:bg-white/5'}`}
                            >
                                <t.icon size={13} />
                                <span className="hidden sm:inline">{t.label}</span>
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            <div className="max-w-[1600px] w-full mx-auto flex-1 grid grid-cols-1 lg:grid-cols-12 gap-3 min-h-0">
                {activeTab === 'chat' ? (
                    <>
                        <div className={`lg:col-span-4 flex flex-col min-h-0 bg-slate-900 border border-slate-800/60 rounded-md backdrop-blur-3xl overflow-hidden shadow-2xl ${selectedChat ? 'hidden lg:flex' : 'flex'}`}>
                            <div className="p-4 border-b border-white/5 space-y-3 shrink-0 bg-slate-900/60">
                                <div className="flex items-center justify-between">
                                    <h2 className="text-[10px] font-black text-white uppercase tracking-widest italic flex items-center gap-2 leading-none">
                                        <Activity size={14} className="text-transporter-primary" />
                                        Active Nodes
                                    </h2>
                                    <div className="w-6 h-6 rounded-md bg-slate-800 border border-slate-700/50 flex items-center justify-center">
                                        <div className="w-1.5 h-1.5 rounded-md bg-transporter-primary shadow-glow animate-pulse"></div>
                                    </div>
                                </div>
                                <div className="relative group">
                                    <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-700 group-focus-within:text-transporter-primary transition-colors" />
                                    <input
                                        placeholder="SYNC SEARCH..."
                                        className="w-full h-10 bg-slate-950/50 border border-slate-800 rounded-md pl-10 pr-4 text-[9px] font-black text-white italic tracking-widest outline-none focus:border-transporter-primary transition-all placeholder:text-slate-800 uppercase"
                                    />
                                </div>
                                <div className="grid grid-cols-3 gap-2 mt-2">
                                    {['Staff', 'Drivers', 'Parents'].map(tab => (
                                        <button
                                            key={tab}
                                            onClick={() => setChatSubTab(tab)}
                                            className={`relative py-2.5 rounded-md text-[9px] font-black uppercase tracking-widest transition-all italic ${chatSubTab === tab ? 'bg-transporter-primary text-white shadow-lg' : 'bg-slate-950/20 text-slate-500 border border-white/5 hover:text-white'}`}
                                        >
                                            {tab}
                                            {getTabUnreadCount(tab) > 0 && (
                                                <div className="absolute -top-1 -right-1 w-4 h-4 rounded-md bg-transporter-primary flex items-center justify-center text-[8px] font-black text-white shadow-glow animate-pulse">
                                                    {getTabUnreadCount(tab)}
                                                </div>
                                            )}
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <div className="flex-1 overflow-y-auto p-2 space-y-1 custom-scrollbar">
                                <p className="text-[9px] font-black text-slate-600 uppercase tracking-widest px-3 mb-2 italic">Established Links</p>
                                {filteredConversations.map(conv => (
                                    <button
                                        key={conv.partner._id}
                                        onClick={() => setSelectedChat(conv.partner._id)}
                                        className={`w-full flex items-center gap-3 p-3 rounded-md transition-all border ${selectedChat === conv.partner._id ? 'bg-transporter-primary/10 border-transporter-primary/30' : 'bg-transparent border-transparent hover:bg-slate-800/30'}`}
                                    >
                                        <div className="w-10 h-10 rounded-md bg-slate-800 border border-white/5 overflow-hidden flex items-center justify-center shadow-lg shrink-0 relative">
                                            {conv.partner.photo ? <img src={conv.partner.photo} alt="" className="w-full h-full object-cover" /> : <User size={18} className="text-slate-700" />}
                                            {unreadCounts[conv.partner._id] > 0 && (
                                                <div className="absolute top-0 right-0 w-3 h-3 bg-transporter-primary rounded-bl-sm flex items-center justify-center text-[7px] font-black text-white shadow-glow">{unreadCounts[conv.partner._id]}</div>
                                            )}
                                        </div>
                                        <div className="text-left min-w-0 flex-1">
                                            <h4 className="text-white font-black text-[11px] uppercase tracking-tighter truncate italic">{conv.partner.firstName} {conv.partner.lastName}</h4>
                                            <p className={`text-[8px] font-bold truncate mt-0.5 italic uppercase tracking-tighter ${unreadCounts[conv.partner._id] > 0 ? 'text-transporter-primary brightness-125' : 'text-slate-600'}`}>
                                                {conv.messages[0].content}
                                            </p>
                                        </div>
                                        <div className="text-[8px] font-black text-slate-800 italic shrink-0 uppercase">{conv.partner.role?.split('_')[0]}</div>
                                    </button>
                                ))}
                                {filteredConversations.length === 0 && (
                                    <div className="text-center py-10 opacity-20">
                                        <Bell size={24} className="mx-auto mb-2" />
                                        <p className="text-[8px] font-black uppercase tracking-widest italic">Signal Void</p>
                                    </div>
                                )}

                                <p className="text-[9px] font-black text-slate-600 uppercase tracking-widest px-3 mt-4 mb-2 italic">Available Nodes</p>
                                {filteredContacts.map(t => (
                                    <button
                                        key={t._id}
                                        onClick={() => setSelectedChat(t._id)}
                                        className="w-full flex items-center gap-3 p-2.5 rounded-md transition-all border border-transparent hover:bg-slate-800/30 group"
                                    >
                                        <div className="w-8 h-8 rounded-md bg-slate-800/50 border border-white/5 overflow-hidden flex items-center justify-center grayscale group-hover:grayscale-0 transition-all shrink-0">
                                            {t.photo ? <img src={t.photo} alt="" className="w-full h-full object-cover" /> : <User size={14} className="text-slate-600" />}
                                        </div>
                                        <div className="text-left flex-1 min-w-0">
                                            <h4 className="text-slate-500 group-hover:text-white font-black text-[10px] uppercase tracking-tighter italic transition-colors truncate">{t.firstName} {t.lastName || t.name}</h4>
                                            <p className="text-[7px] text-slate-600 font-black uppercase tracking-widest truncate">{t.role}</p>
                                        </div>
                                        <ArrowUpRight size={12} className="ml-auto text-slate-800 group-hover:text-transporter-primary shrink-0" />
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className={`lg:col-span-8 flex flex-col min-h-0 bg-slate-900 border border-slate-800/60 rounded-md backdrop-blur-3xl overflow-hidden shadow-2xl relative ${!selectedChat ? 'hidden lg:flex' : 'flex'}`}>
                            {selectedChat ? (
                                <>
                                    <div className="p-3 border-b border-white/5 flex items-center justify-between bg-slate-900/60 shadow-xl shrink-0">
                                        <div className="flex items-center gap-3">
                                            <button onClick={() => setSelectedChat(null)} className="lg:hidden p-2 rounded-md bg-slate-800 text-slate-400">
                                                <ArrowLeft size={16} />
                                            </button>
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-md bg-slate-800 border border-white/5 flex items-center justify-center shadow-lg relative shrink-0">
                                                    {(activeConversation?.partner.photo) ? <img src={activeConversation.partner.photo} alt="" className="w-full h-full object-cover rounded-md" /> : <User size={16} className="text-slate-600" />}
                                                    <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-md bg-green-500 border-2 border-slate-900 shadow-lg shadow-green-500/20"></div>
                                                </div>
                                                <div className="min-w-0">
                                                    <h3 className="text-white font-black text-[12px] uppercase tracking-tight italic leading-none mb-1 truncate">
                                                        {activeConversation?.partner.firstName || contacts.find(c => c._id === selectedChat)?.firstName || contacts.find(c => c._id === selectedChat)?.name} {activeConversation?.partner.lastName || contacts.find(c => c._id === selectedChat)?.lastName || ''}
                                                    </h3>
                                                    <div className="flex items-center gap-2">
                                                        <div className="h-1 w-1 rounded-md bg-green-500 animate-pulse"></div>
                                                        <span className="text-[7px] font-black text-slate-500 uppercase tracking-widest italic">Secure Link Active</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div
                                        ref={chatContainerRef}
                                        onScroll={handleScroll}
                                        className="flex-1 overflow-y-auto p-4 lg:p-5 space-y-4 custom-scrollbar bg-slate-950/20 flex flex-col"
                                    >
                                        {fetchingChat && hasMore && (
                                            <div className="flex justify-center py-2">
                                                <div className="w-1.5 h-1.5 rounded-md bg-transporter-primary animate-pulse shadow-glow"></div>
                                            </div>
                                        )}

                                        <div className="flex flex-col gap-3">
                                            {chatMessages.map((m, i) => {
                                                const senderId = (m.sender?._id || m.sender)?.toString();
                                                const isMe = senderId === currentUser?._id?.toString();
                                                const showDate = i === 0 || new Date(chatMessages[i - 1].createdAt).toDateString() !== new Date(m.createdAt).toDateString();

                                                return (
                                                    <React.Fragment key={m._id}>
                                                        {showDate && (
                                                            <div className="flex flex-col items-center justify-center my-2">
                                                                <div className="h-[1px] w-6 bg-slate-800/50"></div>
                                                                <span className="text-[7px] font-black text-slate-600 bg-slate-900/50 px-3 py-1 rounded-md uppercase tracking-[0.2em] my-1 italic border border-white/5">
                                                                    {new Date(m.createdAt).toLocaleDateString([], { weekday: 'short', day: '2-digit', month: 'short' })}
                                                                </span>
                                                            </div>
                                                        )}

                                                        <div className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                                                            <div className={`max-w-[85%] lg:max-w-[75%] relative flex flex-col group ${isMe ? 'items-end' : 'items-start'}`}>
                                                                <div className={`px-3 py-2 rounded-md text-[12px] font-bold shadow-xl transition-all relative ${isMe ? 'bg-transporter-primary text-white rounded-tr-none' : 'bg-slate-800 text-slate-200 rounded-tl-none border border-white/5'}`}>
                                                                    <p className="italic leading-relaxed whitespace-pre-wrap uppercase tracking-tight">{m.content}</p>
                                                                    <div className={`absolute top-0 w-2.5 h-2.5 ${isMe ? '-right-1 bg-transporter-primary clip-path-right' : '-left-1 bg-slate-800 clip-path-left border-t border-l border-white/5'}`}></div>
                                                                </div>

                                                                <div className={`flex items-center gap-1.5 mt-1 opacity-50 group-hover:opacity-100 transition-opacity mx-1`}>
                                                                    <span className="text-[7px] font-black uppercase tracking-widest italic text-slate-600">{new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </React.Fragment>
                                                );
                                            })}
                                        </div>
                                    </div>

                                    <div className="p-2 bg-slate-900 shadow-2xl border-t border-white/5 shrink-0">
                                        <form
                                            onSubmit={(e) => { e.preventDefault(); handleSendPrivate(selectedChat); }}
                                            className="flex items-center gap-2 bg-slate-950 p-1 rounded-md border border-slate-800/80 focus-within:border-transporter-primary/30 transition-all shadow-inner pl-4"
                                        >
                                            <input
                                                value={messageInput}
                                                onChange={(e) => setMessageInput(e.target.value)}
                                                placeholder="ENTER TRANS MISSION..."
                                                className="flex-1 bg-transparent border-none text-white text-[11px] font-black italic tracking-widest outline-none placeholder:text-slate-800 uppercase h-10"
                                            />
                                            <button
                                                type="submit"
                                                className="bg-transporter-primary text-white p-2.5 rounded-md shadow-lg shadow-transporter-primary/20 hover:scale-105 active:scale-95 transition-all"
                                            >
                                                <Send size={16} />
                                            </button>
                                        </form>
                                    </div>
                                </>
                            ) : (
                                <div className="flex-1 flex flex-col items-center justify-center p-10 text-center space-y-6 opacity-30 bg-slate-950/20">
                                    <div className="relative">
                                        <div className="w-24 h-24 rounded-md border-4 border-slate-800 border-t-transporter-primary animate-spin"></div>
                                        <div className="absolute inset-0 flex items-center justify-center">
                                            <Shield size={32} className="text-slate-800" />
                                        </div>
                                    </div>
                                    <h3 className="text-lg font-black text-white uppercase italic tracking-tighter">SELECT FREQUENCY</h3>
                                    <p className="text-[9px] font-black text-slate-700 uppercase tracking-widest leading-relaxed max-w-[200px] mx-auto italic">Select a node from the left to establish connection.</p>
                                </div>
                            )}
                        </div>
                    </>
                ) : activeTab === 'feed' ? (
                    <>
                        <div className="lg:col-span-5 flex flex-col gap-4 min-h-0">
                            <div className="bg-slate-900 border border-slate-800 rounded-md p-6 relative overflow-hidden shadow-2xl shrink-0">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-transporter-primary/5 blur-[50px] -mr-16 -mt-16"></div>
                                <div className="relative z-10 space-y-6">
                                    <h2 className="text-base font-black text-white uppercase italic tracking-tight flex items-center gap-3 leading-none">
                                        <Megaphone className="text-transporter-primary" size={20} />
                                        New Fleet Directive
                                    </h2>
                                    <form onSubmit={handleSendAnnouncement} className="space-y-4">
                                        <div className="grid grid-cols-2 gap-2">
                                            {['Parent', 'Driver'].map(role => (
                                                <button
                                                    key={role}
                                                    type="button"
                                                    onClick={() => setAnnouncementInput({ ...announcementInput, targetRole: role })}
                                                    className={`py-3 rounded-md text-[9px] font-black uppercase tracking-widest border transition-all ${announcementInput.targetRole === role ? 'bg-transporter-primary/10 border-transporter-primary text-transporter-primary' : 'bg-slate-950 border-slate-800 text-slate-700'}`}
                                                >
                                                    {role}s
                                                </button>
                                            ))}
                                        </div>
                                        <input
                                            required
                                            placeholder="SUBJECT..."
                                            value={announcementInput.subject}
                                            onChange={(e) => setAnnouncementInput({ ...announcementInput, subject: e.target.value })}
                                            className="w-full h-11 bg-slate-950 border border-slate-800 rounded-md px-4 text-white text-[11px] font-black uppercase outline-none focus:border-transporter-primary transition-all italic"
                                        />
                                        <textarea
                                            required
                                            rows={4}
                                            placeholder="DIRECTIVE CONTENT..."
                                            value={announcementInput.content}
                                            onChange={(e) => setAnnouncementInput({ ...announcementInput, content: e.target.value })}
                                            className="w-full bg-slate-950 border border-slate-800 rounded-md p-4 text-white text-[11px] font-bold outline-none focus:border-transporter-primary transition-all italic resize-none uppercase"
                                        />
                                        <button type="submit" className="w-full py-4 rounded-md bg-transporter-primary text-white flex items-center justify-center gap-2 text-[11px] font-black uppercase tracking-[0.3em] transition-all shadow-xl active:scale-95">
                                            <Send size={16} />
                                            BROADCAST TO FLEET
                                        </button>
                                    </form>
                                </div>
                            </div>
                        </div>

                        <div className="lg:col-span-7 flex flex-col gap-4 min-h-0">
                            <div className="flex items-center justify-between px-2 shrink-0">
                                <h3 className="text-[10px] font-black text-white uppercase tracking-widest flex items-center gap-2 italic leading-none">
                                    <Filter size={14} className="text-transporter-primary" />
                                    RECENT TRANSMISSIONS
                                </h3>
                                <span className="text-[8px] font-black text-slate-700 uppercase tracking-widest italic">{sentMessages.filter(m => m.type === 'Announcement').length} LOGGED</span>
                            </div>

                            <div className="flex-1 overflow-y-auto pr-2 space-y-3 custom-scrollbar">
                                <AnimatePresence mode="popLayout">
                                    {sentMessages.filter(m => m.type === 'Announcement').map((msg, idx) => (
                                        <motion.div
                                            key={msg._id}
                                            initial={{ opacity: 0, x: 20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            className="bg-slate-900 border border-slate-800 rounded-md p-5 hover:border-transporter-primary/20 backdrop-blur-2xl shadow-xl border-l-[3px] border-l-transporter-primary/40 group relative"
                                        >
                                            <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button
                                                    onClick={() => handleDeleteMessage(msg._id)}
                                                    className="p-1.5 bg-red-500/10 text-red-500 rounded-md border border-red-500/20 hover:bg-red-500 hover:text-white transition-all"
                                                >
                                                    <XCircle size={14} />
                                                </button>
                                            </div>
                                            <div className="flex items-center gap-4 mb-4">
                                                <div className="w-10 h-10 rounded-md bg-transporter-primary/10 text-transporter-primary flex items-center justify-center border border-white/5">
                                                    <Megaphone size={18} />
                                                </div>
                                                <div className="min-w-0 flex-1">
                                                    <h4 className="text-white font-black text-sm uppercase tracking-tighter italic leading-none truncate mb-2">{msg.subject}</h4>
                                                    <div className="flex items-center gap-3">
                                                        <span className="text-[7px] font-black uppercase tracking-widest px-2 py-1 rounded bg-slate-950 border border-slate-800 text-slate-500">{msg.targetRole || 'FLEET'}</span>
                                                        <span className="text-[7px] font-black text-slate-700 uppercase tracking-widest italic flex items-center gap-1"><Calendar size={10} />{new Date(msg.createdAt).toLocaleDateString()}</span>
                                                    </div>
                                                </div>
                                            </div>
                                            <p className="text-slate-400 text-[11px] leading-relaxed font-bold italic border-l border-slate-800 pl-4 uppercase tracking-tighter line-clamp-2">{msg.content}</p>
                                        </motion.div>
                                    ))}
                                </AnimatePresence>
                                {loading && <div className="text-center py-10 opacity-30 uppercase text-[8px] font-black tracking-widest italic animate-pulse">Syncing...</div>}
                            </div>
                        </div>
                    </>
                ) : (
                    <>
                        <div className="lg:col-span-4 flex flex-col gap-4 min-h-0">
                            <div className="bg-slate-900 border border-slate-800/60 rounded-md p-6 backdrop-blur-3xl shadow-2xl space-y-6">
                                <div className="space-y-1">
                                    <div className="flex items-center gap-2">
                                        <Shield size={14} className="text-transporter-primary" />
                                        <h3 className="text-[10px] font-black text-white uppercase tracking-[0.3em] italic">Issue Route Advisory</h3>
                                    </div>
                                    <p className="text-[8px] text-slate-500 font-bold uppercase tracking-widest italic">Targeted notices for specific transport routes.</p>
                                </div>

                                <form onSubmit={handleSendNotice} className="space-y-4">
                                    <div className="space-y-2">
                                        <label className="text-[8px] font-black text-slate-600 uppercase tracking-widest ml-1">Affected Route Node</label>
                                        <select 
                                            value={noticeInput.classSection} 
                                            onChange={(e) => setNoticeInput({...noticeInput, classSection: e.target.value})}
                                            className="w-full bg-slate-950 border border-slate-800 rounded-md p-3 text-white text-[10px] uppercase font-black tracking-widest outline-none focus:border-transporter-primary/50 transition-all italic h-12 appearance-none"
                                        >
                                            <option value="" className="text-slate-800">ALL ROUTES (PUBLIC)</option>
                                            {routes.map(r => (
                                                <option key={r._id} value={r._id}>{r.name} Route</option>
                                            ))}
                                        </select>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-[8px] font-black text-slate-600 uppercase tracking-widest ml-1">Advisory Subject</label>
                                        <input 
                                            placeholder="ENTER SUBJECT..."
                                            value={noticeInput.subject}
                                            onChange={(e) => setNoticeInput({...noticeInput, subject: e.target.value})}
                                            className="w-full bg-slate-950 border border-slate-800 rounded-md p-3 text-white text-[11px] font-bold outline-none focus:border-transporter-primary/50 transition-all italic h-12 uppercase tracking-tight"
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-[8px] font-black text-slate-600 uppercase tracking-widest ml-1">Advisory Content</label>
                                        <textarea 
                                            rows={5}
                                            placeholder="ENTER DETAILS..."
                                            value={noticeInput.content}
                                            onChange={(e) => setNoticeInput({...noticeInput, content: e.target.value})}
                                            className="w-full bg-slate-950 border border-slate-800 rounded-md p-4 text-white text-[11px] font-bold outline-none focus:border-transporter-primary/50 transition-all italic resize-none uppercase tracking-tight"
                                        />
                                    </div>

                                    <button type="submit" className="w-full py-4 rounded-md bg-transporter-primary text-white flex items-center justify-center gap-3 text-[11px] font-black uppercase tracking-[0.3em] transition-all shadow-xl active:scale-95">
                                        <Plus size={16} />
                                        POST ADVISORY
                                    </button>
                                </form>
                            </div>
                        </div>

                        <div className="lg:col-span-8 flex flex-col gap-4 min-h-0">
                            <div className="flex items-center justify-between px-2 shrink-0">
                                <h3 className="text-[10px] font-black text-white uppercase tracking-widest flex items-center gap-2 italic leading-none">
                                    <Layout size={16} className="text-transporter-primary" />
                                    ROUTE ADVISORY BOARD
                                </h3>
                                <div className="flex items-center gap-3">
                                    <span className="text-[8px] font-black text-slate-700 uppercase tracking-widest italic">{notices.length} ACTIVE ADVISORIES</span>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 overflow-y-auto custom-scrollbar p-1">
                                <AnimatePresence mode="popLayout">
                                    {notices.map((not, idx) => (
                                        <motion.div
                                            key={not._id}
                                            initial={{ opacity: 0, scale: 0.95 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            transition={{ delay: idx * 0.05 }}
                                            className="bg-slate-900 border border-slate-800 rounded-md p-6 backdrop-blur-3xl hover:border-transporter-primary/30 transition-all border-t-[3px] border-t-transporter-primary/40 group relative overflow-hidden flex flex-col justify-between"
                                        >
                                            <div className="space-y-4">
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-10 h-10 rounded-md bg-transporter-primary/10 flex items-center justify-center text-transporter-primary border border-transporter-primary/20 shadow-lg group-hover:scale-110 transition-transform">
                                                            <AlertCircle size={18} />
                                                        </div>
                                                        <div className="min-w-0">
                                                            <h4 className="text-sm font-black text-white uppercase italic tracking-tighter truncate leading-none mb-1">{not.subject}</h4>
                                                            <span className="text-[8px] font-bold text-slate-700 uppercase tracking-widest">{new Date(not.createdAt).toLocaleDateString()}</span>
                                                        </div>
                                                    </div>
                                                    {not.sender?._id === currentUser?._id && (
                                                        <button 
                                                            onClick={() => handleDeleteMessage(not._id)}
                                                            className="p-1.5 bg-red-500/10 text-red-500 rounded-md border border-red-500/20 hover:bg-red-500 hover:text-white transition-all opacity-0 group-hover:opacity-100"
                                                        >
                                                            <XCircle size={14} />
                                                        </button>
                                                    )}
                                                </div>
                                                <p className="text-slate-500 text-[10px] font-bold italic leading-relaxed uppercase tracking-tighter line-clamp-4">{not.content}</p>
                                            </div>
                                            <div className="pt-4 border-t border-white/5 flex items-center justify-between text-[7px] font-black uppercase tracking-widest text-slate-800 mt-6">
                                                <span>{not.classSection ? `ROUTE ID: ${not.classSection.slice(-6).toUpperCase()}` : 'ALL ROUTES'}</span>
                                                <span className="text-transporter-primary/30 font-black italic">FLEET CMD</span>
                                            </div>
                                        </motion.div>
                                    ))}
                                </AnimatePresence>

                                {notices.length === 0 && !loading && (
                                    <div className="col-span-full py-40 text-center opacity-10 italic font-black uppercase tracking-widest text-lg">
                                        Archive Void
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

export default Messages;
