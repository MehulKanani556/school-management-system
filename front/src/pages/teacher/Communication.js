import React, { useState, useEffect, useMemo } from 'react';
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
    Mic,
    Paperclip,
    Smile,
    ArrowLeft,
    Clock,
    Activity,
    Shield,
    ChevronDown,
    ChevronRight,
    Layout,
    XCircle
} from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { 
    retractAnnouncement, 
    fetchAssignedClasses, 
    fetchMyMessages, 
    fetchNotices, 
    fetchContacts, 
    sendMessage,
    updateTeacherMessages
} from '../../redux/slice/teacher.slice';
import axiosInstance from '../../utils/axiosInstance';
import { toast } from 'react-hot-toast';
import { useSocket } from '../../context/SocketContext';
import { motion, AnimatePresence } from 'framer-motion';
import { useSearchParams, useLocation } from 'react-router-dom';
import EmojiPicker from 'emoji-picker-react';

const Communication = () => {
    const dispatch = useDispatch();
    const [searchParams] = useSearchParams();
    const tabParam = searchParams.get('tab');
    const location = useLocation();
    const [activeTab, setActiveTab] = useState('feed'); // 'feed', 'chat', 'notices'
    const [chatSubTab, setChatSubTab] = useState('Teachers'); // 'Teachers', 'Parents'
    const [unreadCounts, setUnreadCounts] = useState({}); // { partnerId: count }
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
    const { activeAcademicYearId } = useSelector(state => state.academicYear || {});
    const { 
        classes: assignedClasses, 
        messages: sentMessages,
        notices,
        contacts,
        loading: teacherLoading 
    } = useSelector(state => state.teacher);
    const [noticeInput, setNoticeInput] = useState({ subject: '', content: '', classSection: '' });

    // Paginated Chat History
    const [chatMessages, setChatMessages] = useState([]);
    const [chatPage, setChatPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const [fetchingChat, setFetchingChat] = useState(false);
    const chatContainerRef = React.useRef(null);
    const lastScrollHeightRef = React.useRef(0);

    const selectedChatRef = React.useRef(null);
    const currentUserRef = React.useRef(null);

    const [searchQuery, setSearchQuery] = useState(''); // Search query for contacts
    const [chatSearchQuery, setChatSearchQuery] = useState(''); // Search query for chat messages
    const [showChatSearch, setShowChatSearch] = useState(false); // Toggle chat search bar
    const [showChatInfo, setShowChatInfo] = useState(false); // Toggle chat info panel
    const [isMuted, setIsMuted] = useState(false); // Mute notifications for this chat
    const [showClearChatModal, setShowClearChatModal] = useState(false); // Show clear chat confirmation modal
    const [showEmojiPicker, setShowEmojiPicker] = useState(false); // Show emoji picker

    const searchInputRef = React.useRef(null);
    const chatSearchInputRef = React.useRef(null);
    const emojiPickerRef = React.useRef(null);

    // Close emoji picker when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (emojiPickerRef.current && !emojiPickerRef.current.contains(event.target)) {
                setShowEmojiPicker(false);
            }
        };

        if (showEmojiPicker) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [showEmojiPicker]);

    useEffect(() => {
        selectedChatRef.current = selectedChat;
    }, [selectedChat]);

    useEffect(() => {
        currentUserRef.current = currentUser;
    }, [currentUser]);

    useEffect(() => {
        dispatch(fetchAssignedClasses());
    }, [dispatch, activeAcademicYearId]);

    useEffect(() => {
        if (tabParam && ['feed', 'chat', 'notices'].includes(tabParam)) {
            setActiveTab(tabParam);
        }
        // Handle direct chat from profile
        if (location.state?.directChat) {
            setActiveTab('chat');
            setSelectedChat(location.state.directChat);
        }
    }, [tabParam, location.state]);

    useEffect(() => {
        fetchData();
    }, [activeTab, activeAcademicYearId]);

    useEffect(() => {
        if (!socket || typeof socket.on !== 'function') return;

        const handleNewMessage = (data) => {
            if (data.type === 'Announcement' || data.type === 'Notice') {
                dispatch(updateTeacherMessages(data));
                toast.success(`${data.type}: ${data.subject}`);
            } else if (data.type === 'DirectMessage') {
                const senderId = (data.sender?._id || data.sender)?.toString();
                const recipientId = (data.recipient?._id || data.recipient)?.toString();
                const meId = currentUserRef.current?._id?.toString();
                const partnerId = senderId === meId ? recipientId : senderId;

                // If active chat, append to local messages
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

                    // Only show visual toast if the sender is not muted
                    const mutedList = JSON.parse(localStorage.getItem(`muted_chats_${meId}`) || '[]');
                    if (senderId !== meId && !mutedList.includes(senderId)) {
                        toast.success(`💬 New Message from ${data.senderName || data.sender?.firstName || 'Faculty'}`);
                    }
                }

                // Update Redux state as well for feedback lists
                dispatch(updateTeacherMessages(data));
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
    }, [socket]);

    const fetchData = () => {
        dispatch(fetchMyMessages());
        dispatch(fetchContacts());
        dispatch(fetchNotices());
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
            setUnreadCounts(prev => ({ ...prev, [selectedChat]: 0 }));
            fetchChatHistory(selectedChat, 1);
            
            if (currentUser) {
                localStorage.setItem(`active_chat_${currentUser._id}`, selectedChat);
                const mutedList = JSON.parse(localStorage.getItem(`muted_chats_${currentUser._id}`) || '[]');
                setIsMuted(mutedList.includes(selectedChat));
            }
        } else {
            if (currentUser) {
                localStorage.removeItem(`active_chat_${currentUser._id}`);
            }
            setIsMuted(false);
        }
    }, [selectedChat, currentUser]);

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
                type: 'Announcement',
                academicYearId: activeAcademicYearId
            });
            toast.success('Announcement Sent');
            setAnnouncementInput({ subject: '', content: '', targetRole: 'Student' });
            fetchData();
        } catch (err) {
            toast.error('Broadcast failed');
        }
    };

    const handleSendNotice = async (e) => {
        e.preventDefault();
        if (!noticeInput.subject || !noticeInput.content) return toast.error('Required fields are missing');
        try {
            await axiosInstance.post('/teacher/send-message', {
                ...noticeInput,
                type: 'Notice',
                academicYearId: activeAcademicYearId
            });
            toast.success('Notice Posted');
            setNoticeInput({ subject: '', content: '', classSection: '' });
            fetchData();
        } catch (err) {
            toast.error('Bulletin failed');
        }
    };

    const handleDeleteAnnouncement = async (id) => {
        if (!await window.confirm('Delete this announcement?')) return;
        try {
            await dispatch(retractAnnouncement(id)).unwrap();
            toast.success('Announcement Deleted');
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
            toast.error('Failed to send message');
        }
    };

    const handleMuteToggle = () => {
        if (!selectedChat || !currentUser) return;
        const mutedList = JSON.parse(localStorage.getItem(`muted_chats_${currentUser._id}`) || '[]');
        let newMutedList;
        if (mutedList.includes(selectedChat)) {
            newMutedList = mutedList.filter(id => id !== selectedChat);
            setIsMuted(false);
            toast.success('Notifications enabled for this conversation');
        } else {
            newMutedList = [...mutedList, selectedChat];
            setIsMuted(true);
            toast.success('Notifications muted for this conversation');
        }
        localStorage.setItem(`muted_chats_${currentUser._id}`, JSON.stringify(newMutedList));
    };

    const handleClearChatHistory = async () => {
        try {
            // Call backend API to delete chat history
            await axiosInstance.delete(`/chat-history/${selectedChat}`);
            
            // Clear local state for immediate UI update
            setChatMessages([]);
            
            toast.success('Chat history cleared successfully');
            setShowChatInfo(false);
            setShowClearChatModal(false);
            fetchData();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to clear chat history');
        }
    };

    const handleEmojiClick = (emojiObject) => {
        setMessageInput(prev => prev + emojiObject.emoji);
    };

    // Chat Logic
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

    const activeConversationPartner = useMemo(() => {
        if (activeConversation?.partner) return activeConversation.partner;
        return contacts.find(c => c._id === selectedChat);
    }, [activeConversation, contacts, selectedChat]);

    const filteredConversations = useMemo(() => {
        const query = searchQuery.trim().toLowerCase();
        return conversations.filter(c => {
            const role = c.partner.role;
            const isTabMatch = chatSubTab === 'Teachers' 
                ? (role === 'Teacher' || role === 'School_Admin')
                : (role === 'Parent' || role === 'Student');
            if (!isTabMatch) return false;
            
            if (!query) return true;
            const fullName = `${c.partner.firstName || ''} ${c.partner.lastName || ''}`.toLowerCase();
            const partnerRole = (c.partner.role || '').toLowerCase();
            return fullName.includes(query) || partnerRole.includes(query);
        });
    }, [conversations, chatSubTab, searchQuery]);

    const filteredContacts = useMemo(() => {
        const query = searchQuery.trim().toLowerCase();
        return contacts.filter(t => {
            if (conversations.some(c => (c.partner._id || c.partner) === t._id)) return false;
            const role = t.role;
            const isTabMatch = chatSubTab === 'Teachers' 
                ? (role === 'Teacher' || role === 'School_Admin')
                : (role === 'Parent' || role === 'Student');
            if (!isTabMatch) return false;
            
            if (!query) return true;
            const fullName = `${t.firstName || ''} ${t.lastName || ''}`.toLowerCase();
            const partnerRole = (t.role || '').toLowerCase();
            return fullName.includes(query) || partnerRole.includes(query);
        });
    }, [contacts, conversations, chatSubTab, searchQuery]);

    const filteredChatMessages = useMemo(() => {
        if (!chatSearchQuery.trim()) return chatMessages;
        const query = chatSearchQuery.toLowerCase();
        return chatMessages.filter(msg => 
            msg.content?.toLowerCase().includes(query)
        );
    }, [chatMessages, chatSearchQuery]);

    const getTabUnreadCount = (tabName) => {
        return conversations.reduce((acc, conv) => {
            const role = conv.partner.role;
            const isMatch = tabName === 'Teachers' 
                ? (role === 'Teacher' || role === 'School_Admin')
                : (role === 'Parent' || role === 'Student');
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
                            <div className="h-[2px] w-6 bg-brand-primary rounded-md"></div>
                            <span className="text-[8px] font-black text-brand-primary uppercase tracking-[0.4em] italic leading-none">Communication Center</span>
                        </div>
                        <h1 className="text-2xl lg:text-3xl font-black text-white uppercase tracking-tighter italic leading-none">
                            {activeTab === 'feed' ? (
                                <>SCHOOL <span className="text-brand-primary">ANNOUNCEMENTS</span></>
                            ) : activeTab === 'chat' ? (
                                <>DIRECT <span className="text-brand-primary">MESSAGES</span></>
                            ) : (
                                <>CLASS <span className="text-brand-primary">NOTICEBOARD</span></>
                            )}
                        </h1>
                        <p className="text-slate-500 font-bold text-[8px] tracking-wider uppercase">
                            {activeTab === 'feed' ? 'Post and manage announcements for students and parents.' :
                                activeTab === 'chat' ? 'Private messaging with teachers, staff, and parents.' :
                                    'Display important notices for specific class sections.'}
                        </p>
                    </div>
                </div>
            </div>

            <div className="max-w-[1600px] w-full mx-auto flex-1 grid grid-cols-1 lg:grid-cols-12 gap-3 min-h-0">
                {activeTab === 'chat' ? (
                    /* CHAT INTERFACE */
                    <>
                        <div className={`lg:col-span-4 flex flex-col gap-6 min-h-0 ${selectedChat ? 'hidden lg:flex' : 'flex'}`}>
                            {/* Contact List */}
                            <div className="bg-slate-900/30 border border-slate-800/60 rounded-md flex flex-col min-h-0 backdrop-blur-3xl">
                                <div className="p-4 border-b border-slate-800/60 space-y-3 shrink-0 bg-slate-900/60">
                                    <div className="flex items-center justify-between">
                                        <h2 className="text-[10px] font-black text-white uppercase tracking-widest italic flex items-center gap-2 leading-none">
                                            <Activity size={14} className="text-brand-primary" />
                                            Conversations
                                        </h2>
                                        <div className="w-6 h-6 rounded-md bg-slate-800 border border-slate-700/50 flex items-center justify-center">
                                            <div className="w-1.5 h-1.5 rounded-md bg-brand-primary shadow-glow animate-pulse"></div>
                                        </div>
                                    </div>
                                    <div className="relative group">
                                        <button
                                            type="button"
                                            onClick={() => searchInputRef.current?.focus()}
                                            className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600 hover:text-brand-primary transition-colors cursor-pointer z-10"
                                        >
                                            <Search size={14} />
                                        </button>
                                        <input
                                            ref={searchInputRef}
                                            type="text"
                                            placeholder="SCAN DATABASE..."
                                            value={searchQuery}
                                            onChange={(e) => setSearchQuery(e.target.value)}
                                            className="w-full bg-slate-950/50 border border-slate-800 h-10 pl-11 pr-10 rounded-md text-[9px] font-black uppercase tracking-widest text-white outline-none focus:border-brand-primary placeholder:text-slate-700 italic"
                                        />
                                        {searchQuery && (
                                            <button
                                                type="button"
                                                onClick={() => setSearchQuery('')}
                                                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-600 hover:text-brand-primary transition-colors"
                                            >
                                                <span className="text-xs">✕</span>
                                            </button>
                                        )}
                                    </div>
                                    <div className="grid grid-cols-2 gap-2 mt-2">
                                        {['Teachers', 'Parents'].map(tab => (
                                            <button
                                                key={tab}
                                                onClick={() => setChatSubTab(tab)}
                                                className={`relative py-2.5 rounded-md text-[9px] font-black uppercase tracking-widest transition-all italic ${chatSubTab === tab ? 'bg-brand-primary text-white shadow-lg' : 'bg-slate-950/20 text-slate-500 border border-white/5 hover:text-white'}`}
                                            >
                                                {tab}
                                                {getTabUnreadCount(tab) > 0 && (
                                                    <div className="absolute -top-1 -right-1 w-4 h-4 rounded-md bg-brand-primary flex items-center justify-center text-[8px] font-black text-white shadow-glow animate-pulse">
                                                        {getTabUnreadCount(tab)}
                                                    </div>
                                                )}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                                <div className="flex-1 overflow-y-auto p-3 space-y-1.5 custom-scrollbar">
                                    <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest px-4 mb-4 italic">Active Conversations</p>
                                    {filteredConversations.length > 0 ? (
                                        filteredConversations.map(conv => {
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
                                                        {unreadCounts[p._id] > 0 && (
                                                            <div className="absolute top-0 right-0 w-3 h-3 bg-brand-primary rounded-bl-sm flex items-center justify-center text-[7px] font-black text-white shadow-glow">{unreadCounts[p._id]}</div>
                                                        )}
                                                    </div>
                                                    <div className="text-left min-w-0 flex-1">
                                                        <h4 className="text-white font-black text-[11px] uppercase tracking-tighter truncate italic">{p.firstName} {p.lastName}</h4>
                                                        {p.role === 'Parent' ? (
                                                            <p className="text-[7px] text-brand-primary font-black uppercase tracking-widest leading-none mt-0.5 truncate">
                                                                {p.parentInfo || 'Parent'}
                                                            </p>
                                                        ) : p.role === 'Student' ? (
                                                            <p className="text-[7px] text-brand-primary font-black uppercase tracking-widest leading-none mt-0.5 truncate">
                                                                Student {p.studentInfo ? `(${p.studentInfo})` : ''}
                                                            </p>
                                                        ) : (
                                                            p.role && <p className="text-[7px] text-brand-primary font-black uppercase tracking-widest leading-none mt-0.5 truncate">{p.role}</p>
                                                        )}
                                                        <p className="text-[9px] text-slate-500 font-bold truncate italic leading-none mt-1.5">{conv.messages[0].content}</p>
                                                    </div>
                                                    <div className="flex flex-col items-end gap-1.5">
                                                        <span className="text-[7px] font-bold text-slate-600">{new Date(conv.messages[0].createdAt).toLocaleDateString([], { day: '2-digit', month: 'short' })}</span>
                                                        {conv.messages.some(m => !m.isRead) && <div className="w-1.5 h-1.5 rounded-md bg-brand-primary animate-pulse shadow-glow shadow-lg"></div>}
                                                    </div>
                                                </button>
                                            );
                                        })
                                    ) : (
                                        <div className="text-center py-8">
                                            <p className="text-[9px] font-black text-slate-700 uppercase tracking-widest italic">No conversations found</p>
                                        </div>
                                    )}

                                    <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest px-4 mt-8 mb-4 italic">Available Contacts</p>
                                    {filteredContacts.length > 0 ? (
                                        filteredContacts.map(t => (
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
                                                    {t.role === 'Parent' ? (
                                                        <p className="text-[7px] text-slate-600 group-hover:text-brand-primary font-black uppercase tracking-widest leading-none mt-0.5 truncate">
                                                            {t.parentInfo || 'Parent'}
                                                        </p>
                                                    ) : t.role === 'Student' ? (
                                                        <p className="text-[7px] text-slate-600 group-hover:text-brand-primary font-black uppercase tracking-widest leading-none mt-0.5 truncate">
                                                            Student {t.studentInfo ? `(${t.studentInfo})` : ''}
                                                        </p>
                                                    ) : (
                                                        <p className="text-[7px] text-slate-600 group-hover:text-slate-400 font-black uppercase tracking-widest leading-none mt-0.5 truncate">
                                                            Role: {t.role}
                                                        </p>
                                                    )}
                                                </div>
                                                <ArrowUpRight size={12} className="ml-auto text-slate-800 group-hover:text-brand-primary" />
                                            </button>
                                        ))
                                    ) : (
                                        <div className="text-center py-8">
                                            <p className="text-[9px] font-black text-slate-700 uppercase tracking-widest italic">No contacts found</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className={`lg:col-span-8 flex flex-col min-h-0 bg-slate-900/40 border border-slate-800/60 rounded-md backdrop-blur-3xl overflow-hidden shadow-2xl relative ${!selectedChat ? 'hidden lg:flex' : 'flex'}`}>
                            {selectedChat ? (
                                <>
                                    {/* Chat Header */}
                                    <div className="p-5 border-b border-white/5 flex items-center justify-between bg-white/[0.02] shrink-0">
                                        <div className="flex items-center gap-4">
                                            <button onClick={() => setSelectedChat(null)} className="lg:hidden p-2 rounded-md bg-slate-800/60 text-slate-400 mr-1"><ArrowLeft size={18} /></button>
                                            <div className="w-11 h-11 rounded-md bg-slate-800 overflow-hidden border border-brand-primary/20 shadow-xl shadow-brand-primary/5">
                                                {activeConversationPartner?.photo ? <img src={activeConversationPartner.photo} alt="" className="w-full h-full object-cover" /> : <User className="w-full h-full p-2.5 text-slate-600" />}
                                            </div>
                                            <div>
                                                <h3 className="text-lg font-black text-white italic tracking-tighter uppercase leading-none mb-1 flex items-center gap-2">
                                                    {activeConversationPartner?.firstName || 'TARGET'} {activeConversationPartner?.lastName || 'LOCKED'}
                                                    {activeConversationPartner?.role && (
                                                        <span className="text-[7px] bg-brand-primary/20 text-brand-primary px-1.5 py-0.5 rounded font-black tracking-widest uppercase">
                                                            {activeConversationPartner.role === 'Parent' && activeConversationPartner.parentInfo 
                                                                ? activeConversationPartner.parentInfo 
                                                                : activeConversationPartner.role === 'Student' && activeConversationPartner.studentInfo 
                                                                    ? `Student (${activeConversationPartner.studentInfo})` 
                                                                    : activeConversationPartner.role
                                                            }
                                                        </span>
                                                    )}
                                                </h3>
                                                <span className="flex items-center gap-2 text-[8px] font-black text-emerald-500 uppercase tracking-widest italic leading-none">
                                                    <div className="w-1 h-1 rounded-md bg-emerald-500 animate-pulse"></div>
                                                    Encrypted Channel
                                                </span>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <button 
                                                onClick={() => {
                                                    setShowChatSearch(!showChatSearch);
                                                    if (!showChatSearch) {
                                                        setTimeout(() => chatSearchInputRef.current?.focus(), 100);
                                                    } else {
                                                        setChatSearchQuery('');
                                                    }
                                                }}
                                                className={`p-3 rounded-md border transition-all ${showChatSearch ? 'border-brand-primary text-brand-primary bg-brand-primary/10' : 'border-slate-800 text-slate-500 hover:text-white hover:bg-slate-800/50'}`}
                                            >
                                                <Search size={16} />
                                            </button>
                                            <button 
                                                onClick={() => setShowChatInfo(!showChatInfo)}
                                                className={`p-3 rounded-md border transition-all ${showChatInfo ? 'border-brand-primary text-brand-primary bg-brand-primary/10' : 'border-slate-800 text-slate-500 hover:text-white hover:bg-slate-800/50'}`}
                                                title="Chat Info"
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
                                                    onChange={(e) => setChatSearchQuery(e.target.value)}
                                                    className="w-full bg-slate-950/50 border border-slate-800 h-9 pl-10 pr-10 rounded-md text-[10px] font-black uppercase tracking-widest text-white outline-none focus:border-brand-primary placeholder:text-slate-700 italic"
                                                />
                                                {chatSearchQuery && (
                                                    <button
                                                        type="button"
                                                        onClick={() => setChatSearchQuery('')}
                                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-600 hover:text-brand-primary transition-colors"
                                                    >
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

                                    <div className="flex-1 flex min-h-0 relative">
                                        {/* Chat Messages */}
                                        <div
                                            ref={chatContainerRef}
                                            onScroll={handleScroll}
                                            className={`flex-1 overflow-y-auto p-4 lg:p-6 space-y-4 custom-scrollbar bg-slate-950/20 flex flex-col transition-all ${showChatInfo ? 'lg:mr-80' : ''}`}
                                        >
                                            {fetchingChat && hasMore && (
                                                <div className="flex justify-center py-2">
                                                    <div className="w-1.5 h-1.5 rounded-md bg-brand-primary animate-pulse"></div>
                                                </div>
                                            )}

                                            {filteredChatMessages.map((msg, i) => {
                                                const senderId = (msg.sender?._id || msg.sender)?.toString();
                                                const isMe = senderId === currentUser?._id?.toString();
                                                const showDate = i === 0 || new Date(filteredChatMessages[i - 1].createdAt).toDateString() !== new Date(msg.createdAt).toDateString();

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

                                                        <motion.div
                                                            initial={{ opacity: 0, scale: 0.95, y: 10 }}
                                                            animate={{ opacity: 1, scale: 1, y: 0 }}
                                                            className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}
                                                        >
                                                            <div className={`max-w-[85%] lg:max-w-[75%] relative ${isMe ? 'items-end' : 'items-start'} flex flex-col group`}>
                                                                <div className={`px-4 py-2.5 rounded-md text-[12px] font-bold shadow-xl relative transition-all hover:shadow-2xl ${isMe ? 'bg-brand-primary text-white rounded-tr-none' : 'bg-slate-800 text-slate-200 rounded-tl-none border border-white/5'}`}>
                                                                    <p className="italic leading-relaxed whitespace-pre-wrap">
                                                                        {chatSearchQuery.trim() ? (
                                                                            msg.content?.split(new RegExp(`(${chatSearchQuery.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&')})`, 'gi')).map((part, idx) => 
                                                                                part.toLowerCase() === chatSearchQuery.toLowerCase() ? 
                                                                                    <mark key={idx} className="bg-yellow-400/30 text-white">{part}</mark> : 
                                                                                    part
                                                                            )
                                                                        ) : (
                                                                            msg.content
                                                                        )}
                                                                    </p>
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
                                        </div>

                                        {/* Sliding Chat Info Sidebar */}
                                        <AnimatePresence>
                                            {showChatInfo && (
                                                <motion.div
                                                    initial={{ opacity: 0, x: 50 }}
                                                    animate={{ opacity: 1, x: 0 }}
                                                    exit={{ opacity: 0, x: 50 }}
                                                    className="absolute top-0 right-0 bottom-0 w-80 bg-slate-900 border-l border-white/5 shadow-2xl z-20 flex flex-col p-6 overflow-y-auto custom-scrollbar"
                                                >
                                                    <div className="space-y-6">
                                                        {/* User profile card */}
                                                        <div className="text-center space-y-4">
                                                            <div className="w-24 h-24 rounded-md bg-slate-800 border-2 border-brand-primary/20 overflow-hidden mx-auto shadow-2xl relative">
                                                                {activeConversationPartner?.photo ? <img src={activeConversationPartner.photo} alt="" className="w-full h-full object-cover" /> : <User className="w-full h-full p-6 text-slate-600" />}
                                                            </div>
                                                            <div>
                                                                <h4 className="text-lg font-black text-white uppercase tracking-tighter italic">
                                                                    {activeConversationPartner?.firstName} {activeConversationPartner?.lastName}
                                                                </h4>
                                                                <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mt-1">
                                                                    {activeConversationPartner?.role || 'User'}
                                                                </p>
                                                            </div>
                                                        </div>

                                                        {/* Stats */}
                                                        <div className="space-y-3">
                                                            <h4 className="text-[9px] font-black text-slate-600 uppercase tracking-widest italic">Conversation Stats</h4>
                                                            <div className="grid grid-cols-2 gap-3">
                                                                <div className="bg-slate-950/50 border border-slate-800 rounded-md p-4 text-center">
                                                                    <div className="text-2xl font-black text-brand-primary italic">{chatMessages.length}</div>
                                                                    <div className="text-[8px] font-black text-slate-600 uppercase tracking-widest mt-1">Messages</div>
                                                                </div>
                                                                <div className="bg-slate-950/50 border border-slate-800 rounded-md p-4 text-center">
                                                                    <div className="text-2xl font-black text-emerald-500 italic">
                                                                        {chatMessages.filter(m => {
                                                                            const senderId = (m.sender?._id || m.sender)?.toString();
                                                                            return senderId === currentUser?._id?.toString();
                                                                        }).length}
                                                                    </div>
                                                                    <div className="text-[8px] font-black text-slate-600 uppercase tracking-widest mt-1">Sent</div>
                                                                </div>
                                                            </div>
                                                        </div>

                                                        {/* Contact Info */}
                                                        {activeConversationPartner?.email && (
                                                            <div className="space-y-3">
                                                                <h4 className="text-[9px] font-black text-slate-600 uppercase tracking-widest italic">Contact Details</h4>
                                                                <div className="bg-slate-950/50 border border-slate-800 rounded-md p-4 space-y-2">
                                                                    <div className="flex items-center gap-2">
                                                                        <Mail size={12} className="text-slate-600" />
                                                                        <span className="text-[10px] font-bold text-slate-400 italic truncate">{activeConversationPartner.email}</span>
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
                                                                    className={`w-full p-3 rounded-md border transition-all text-[10px] font-black uppercase tracking-widest italic text-left flex items-center justify-between ${
                                                                        isMuted 
                                                                            ? 'bg-brand-primary/10 border-brand-primary/30 text-brand-primary' 
                                                                            : 'bg-slate-950/50 border-slate-800 text-slate-400 hover:text-white hover:border-brand-primary/30'
                                                                    }`}
                                                                >
                                                                    <span>{isMuted ? 'Unmute' : 'Mute'} Notifications</span>
                                                                    {isMuted && <span className="text-xs">🔕</span>}
                                                                </button>
                                                                <button 
                                                                    onClick={() => setShowClearChatModal(true)}
                                                                    className="w-full p-3 rounded-md bg-slate-950/50 border border-slate-800 text-slate-400 hover:text-brand-primary hover:border-brand-primary/30 transition-all text-[10px] font-black uppercase tracking-widest italic text-left"
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

                                    {/* Chat Input */}
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
                                                        onEmojiClick={handleEmojiClick}
                                                        theme="dark"
                                                        width={350}
                                                        height={400}
                                                        searchPlaceHolder="Search emoji..."
                                                        previewConfig={{
                                                            showPreview: false
                                                        }}
                                                    />
                                                </motion.div>
                                            )}
                                        </AnimatePresence>

                                        <form onSubmit={(e) => { e.preventDefault(); handleSendPrivate(selectedChat); }} className="flex items-center gap-3 bg-slate-950/50 border border-slate-800 rounded-md p-1.5 focus-within:border-brand-primary transition-all">
                                            <input
                                                required
                                                placeholder="COMMAND INPUT..."
                                                value={messageInput}
                                                onChange={(e) => setMessageInput(e.target.value)}
                                                className="flex-1 bg-transparent h-11 px-3 text-[13px] font-black text-white outline-none italic placeholder:text-slate-800 uppercase tracking-tighter"
                                            />
                                            <button 
                                                type="button" 
                                                onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                                                className={`p-3 rounded-md transition-colors ${showEmojiPicker ? 'text-brand-primary' : 'text-slate-600 hover:text-white'}`}
                                            >
                                                <Smile size={18} />
                                            </button>
                                            <button
                                                type="submit"
                                                className="bg-brand-primary text-white p-3 rounded-md shadow-lg shadow-brand-primary/20 hover:scale-105 transition-all group active:scale-95 animate-pulse"
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
                                        <h3 className="text-2xl font-black text-white uppercase italic tracking-tighter leading-none">Open Direct Messages</h3>
                                        <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest leading-relaxed max-w-sm">Select a conversation or contact from the sidebar to begin messaging.</p>
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
                ) : activeTab === 'feed' ? (
                    <>
                        <div className="lg:col-span-5 flex flex-col gap-4 min-h-0">
                            <div className="bg-slate-900 border border-slate-800 rounded-md p-6 relative overflow-hidden shadow-2xl shrink-0">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-brand-primary/5 blur-[50px] -mr-16 -mt-16"></div>
                                <div className="relative z-10 space-y-6">
                                    <h2 className="text-base font-black text-white uppercase italic tracking-tight flex items-center gap-3 leading-none">
                                        <Megaphone className="text-brand-primary" size={20} />
                                        New Announcement
                                    </h2>
                                    <form onSubmit={handleSendAnnouncement} className="space-y-4">
                                        <div className="grid grid-cols-2 gap-2">
                                            {['Student', 'Parent'].map(role => (
                                                <button
                                                    key={role}
                                                    type="button"
                                                    onClick={() => setAnnouncementInput({ ...announcementInput, targetRole: role })}
                                                    className={`py-3 rounded-md text-[9px] font-black uppercase tracking-widest border transition-all ${announcementInput.targetRole === role ? 'bg-brand-primary/10 border-brand-primary text-brand-primary' : 'bg-slate-950 border-slate-800 text-slate-700'}`}
                                                >
                                                    {role}
                                                </button>
                                            ))}
                                        </div>
                                        <input
                                            required
                                            placeholder="SUBJECT..."
                                            value={announcementInput.subject}
                                            onChange={(e) => setAnnouncementInput({ ...announcementInput, subject: e.target.value })}
                                            className="w-full h-11 bg-slate-950 border border-slate-800 rounded-md px-4 text-white text-[11px] font-black uppercase outline-none focus:border-brand-primary transition-all italic"
                                        />
                                        <textarea
                                            required
                                            rows={4}
                                            placeholder="MESSAGE CONTENT..."
                                            value={announcementInput.content}
                                            onChange={(e) => setAnnouncementInput({ ...announcementInput, content: e.target.value })}
                                            className="w-full bg-slate-950 border border-slate-800 rounded-md p-4 text-white text-[11px] font-bold outline-none focus:border-brand-primary transition-all italic resize-none uppercase"
                                        />
                                        <button type="submit" className="w-full py-4 rounded-md bg-brand-primary text-white flex items-center justify-center gap-2 text-[11px] font-black uppercase tracking-[0.3em] transition-all shadow-xl active:scale-95">
                                            <Send size={16} />
                                            POST ANNOUNCEMENT
                                        </button>
                                    </form>
                                </div>
                            </div>
                        </div>

                        <div className="lg:col-span-7 flex flex-col gap-4 min-h-0">
                            <div className="flex items-center justify-between px-2 shrink-0">
                                <h3 className="text-[10px] font-black text-white uppercase tracking-widest flex items-center gap-2 italic leading-none">
                                    <Filter size={14} className="text-brand-primary" />
                                    ANNOUNCEMENTS
                                </h3>
                                <span className="text-[8px] font-black text-slate-700 uppercase tracking-widest italic">{sentMessages.filter(m => m.type === 'Announcement').length} SENT</span>
                            </div>

                            <div className="flex-1 overflow-y-auto pr-2 space-y-3 custom-scrollbar">
                                <AnimatePresence mode="popLayout">
                                    {sentMessages.filter(m => m.type === 'Announcement').map((msg, idx) => (
                                        <motion.div
                                            key={msg._id}
                                            initial={{ opacity: 0, x: 20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            className="bg-slate-900 border border-slate-800 rounded-md p-5 hover:border-brand-primary/20 backdrop-blur-2xl shadow-xl border-l-[3px] border-l-brand-primary/40 group relative"
                                        >
                                            <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button
                                                    onClick={() => handleDeleteAnnouncement(msg._id)}
                                                    className="p-1.5 bg-red-500/10 text-red-500 rounded-md border border-red-500/20 hover:bg-red-500 hover:text-white transition-all"
                                                >
                                                    <XCircle size={14} />
                                                </button>
                                            </div>
                                            <div className="flex items-center gap-4 mb-4">
                                                <div className="w-10 h-10 rounded-md bg-brand-primary/10 text-brand-primary flex items-center justify-center border border-white/5">
                                                    <Megaphone size={18} />
                                                </div>
                                                <div className="min-w-0 flex-1">
                                                    <h4 className="text-white font-black text-sm uppercase tracking-tighter italic leading-none truncate mb-2">{msg.subject}</h4>
                                                    <div className="flex items-center gap-3">
                                                        <span className="text-[7px] font-black uppercase tracking-widest px-2 py-1 rounded bg-slate-950 border border-slate-800 text-slate-500">{msg.targetRole || 'ALL'}</span>
                                                        <span className="text-[7px] font-black text-slate-700 uppercase tracking-widest italic flex items-center gap-1"><Calendar size={10} />{new Date(msg.createdAt).toLocaleDateString()}</span>
                                                    </div>
                                                </div>
                                            </div>
                                            <p className="text-slate-400 text-[11px] leading-relaxed font-bold italic border-l border-slate-800 pl-4 uppercase tracking-tighter line-clamp-2">{msg.content}</p>
                                        </motion.div>
                                    ))}
                                </AnimatePresence>
                                {fetching && <div className="text-center py-10 opacity-30 uppercase text-[8px] font-black tracking-widest italic animate-pulse">Loading...</div>}
                            </div>
                        </div>
                    </>
                ) : (
                    <>
                        <div className="lg:col-span-4 flex flex-col gap-4 min-h-0">
                            <div className="bg-slate-900 border border-slate-800/60 rounded-md p-6 backdrop-blur-3xl shadow-2xl space-y-6">
                                <div className="space-y-1">
                                    <div className="flex items-center gap-2">
                                        <Shield size={14} className="text-teacher-primary" />
                                        <h3 className="text-[10px] font-black text-white uppercase tracking-[0.3em] italic">Issue New Notice</h3>
                                    </div>
                                    <p className="text-[8px] text-slate-500 font-bold uppercase tracking-widest italic">A specific notice for your assigned class sections.</p>
                                </div>

                                <form onSubmit={handleSendNotice} className="space-y-4">
                                    <div className="space-y-2">
                                        <label className="text-[8px] font-black text-slate-600 uppercase tracking-widest ml-1">Target Class / Section</label>
                                        <select 
                                            value={noticeInput.classSection} 
                                            onChange={(e) => setNoticeInput({...noticeInput, classSection: e.target.value})}
                                            className="w-full bg-slate-950 border border-slate-800 rounded-md p-3 text-white text-[10px] uppercase font-black tracking-widest outline-none focus:border-teacher-primary/50 transition-all italic h-12 appearance-none"
                                        >
                                            <option value="" className="text-slate-800">ALL SECTIONS (PUBLIC)</option>
                                            {assignedClasses.map(c => (
                                                <option key={c._id} value={c._id}>Grade {c.standardId?.level} ({c?.sectionLabel})</option>
                                            ))}
                                        </select>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-[8px] font-black text-slate-600 uppercase tracking-widest ml-1">Notice Subject</label>
                                        <input 
                                            placeholder="ENTER SUBJECT..."
                                            value={noticeInput.subject}
                                            onChange={(e) => setNoticeInput({...noticeInput, subject: e.target.value})}
                                            className="w-full bg-slate-950 border border-slate-800 rounded-md p-3 text-white text-[11px] font-bold outline-none focus:border-teacher-primary/50 transition-all italic h-12 uppercase tracking-tight"
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-[8px] font-black text-slate-600 uppercase tracking-widest ml-1">Notice Content</label>
                                        <textarea 
                                            rows={5}
                                            placeholder="ENTER CONTENT..."
                                            value={noticeInput.content}
                                            onChange={(e) => setNoticeInput({...noticeInput, content: e.target.value})}
                                            className="w-full bg-slate-950 border border-slate-800 rounded-md p-4 text-white text-[11px] font-bold outline-none focus:border-teacher-primary/50 transition-all italic resize-none uppercase tracking-tight"
                                        />
                                    </div>

                                    <button type="submit" className="w-full py-4 rounded-md bg-teacher-primary text-slate-950 flex items-center justify-center gap-3 text-[11px] font-black uppercase tracking-[0.3em] transition-all shadow-xl active:scale-95 hover:bg-teacher-primary">
                                        <Layout size={16} />
                                        POST NOTICE
                                    </button>
                                </form>
                            </div>
                        </div>

                        <div className="lg:col-span-8 flex flex-col gap-4 min-h-0">
                            <div className="flex items-center justify-between px-2 shrink-0">
                                <h3 className="text-[10px] font-black text-white uppercase tracking-widest flex items-center gap-2 italic leading-none">
                                    <Layout size={16} className="text-teacher-primary" />
                                    CLASS NOTICEBOARD
                                </h3>
                                <div className="flex items-center gap-3">
                                    <span className="text-[8px] font-black text-slate-700 uppercase tracking-widest italic">{notices.length} RECORDS RECEIVED</span>
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
                                            className="bg-slate-900 border border-slate-800 rounded-md p-6 backdrop-blur-3xl hover:border-teacher-primary/30 transition-all border-t-[3px] border-t-emerald-500/40 group relative overflow-hidden flex flex-col justify-between"
                                        >
                                            <div className="space-y-4">
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-10 h-10 rounded-md bg-teacher-primary/10 flex items-center justify-center text-teacher-primary border border-teacher-primary/20 shadow-lg group-hover:scale-110 transition-transform">
                                                            <AlertCircle size={18} />
                                                        </div>
                                                        <div className="min-w-0">
                                                            <h4 className="text-sm font-black text-white uppercase italic tracking-tighter truncate leading-none mb-1">{not.subject}</h4>
                                                            <span className="text-[8px] font-bold text-slate-700 uppercase tracking-widest">{new Date(not.createdAt).toLocaleDateString()}</span>
                                                        </div>
                                                    </div>
                                                    {(not.sender?._id === currentUser?._id || currentUser?.role === 'Teacher') && (
                                                        <button 
                                                            onClick={() => handleDeleteAnnouncement(not._id)}
                                                            className="p-1.5 bg-red-500/10 text-red-500 rounded-md border border-red-500/20 hover:bg-red-500 hover:text-white transition-all opacity-0 group-hover:opacity-100"
                                                        >
                                                            <XCircle size={14} />
                                                        </button>
                                                    )}
                                                </div>
                                                <p className="text-slate-500 text-[10px] font-bold italic leading-relaxed uppercase tracking-tighter line-clamp-4">{not.content}</p>
                                            </div>
                                            <div className="pt-4 border-t border-white/5 flex items-center justify-between text-[7px] font-black uppercase tracking-widest text-slate-800 mt-6">
                                                <span>{not.classSection ? `SEC: ${not.classSection.gradeLevel}-${not.classSection.sectionLabel}` : 'ALL CLASSES'}</span>
                                                <span className="text-teacher-primary/30 font-black">SENT VIA PORTAL</span>
                                            </div>
                                        </motion.div>
                                    ))}
                                </AnimatePresence>

                                {notices.length === 0 && !fetching && (
                                    <div className="col-span-full py-40 text-center opacity-10 italic font-black uppercase tracking-widest text-lg">
                                        Void Archive
                                    </div>
                                )}
                            </div>
                        </div>
                    </>
                )}
            </div>

            {/* Clear Chat History Confirmation Modal */}
            <AnimatePresence>
                {showClearChatModal && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4"
                        onClick={() => setShowClearChatModal(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                            onClick={(e) => e.stopPropagation()}
                            className="bg-slate-900 border border-slate-800 rounded-lg p-8 max-w-md w-full shadow-2xl"
                        >
                            {/* Icon */}
                            <div className="flex justify-center mb-6">
                                <div className="w-16 h-16 rounded-full bg-brand-primary/10 border-2 border-brand-primary/30 flex items-center justify-center">
                                    <AlertCircle size={32} className="text-brand-primary" />
                                </div>
                            </div>

                            {/* Title */}
                            <h3 className="text-2xl font-black text-white uppercase tracking-tighter italic text-center mb-3">
                                Clear Chat History?
                            </h3>

                            {/* Description */}
                            <p className="text-slate-400 text-sm text-center mb-8 leading-relaxed">
                                Are you sure you want to clear all messages in this conversation? This action cannot be undone and all chat history will be permanently deleted.
                            </p>

                            {/* Buttons */}
                            <div className="flex gap-3">
                                <button
                                    onClick={() => setShowClearChatModal(false)}
                                    className="flex-1 py-3 px-4 rounded-md bg-slate-800 border border-slate-700 text-white font-black text-sm uppercase tracking-widest hover:bg-slate-700 transition-all"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleClearChatHistory}
                                    className="flex-1 py-3 px-4 rounded-md bg-brand-primary text-white font-black text-sm uppercase tracking-widest hover:bg-brand-primary/90 transition-all shadow-lg shadow-brand-primary/20"
                                >
                                    Clear
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default Communication;
