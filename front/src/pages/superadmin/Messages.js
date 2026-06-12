import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useSearchParams, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
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
    ArrowLeft,
    ChevronDown,
    CheckCheck,
    Shield,
    Globe
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import EmojiPicker from 'emoji-picker-react';
import axiosInstance from '../../utils/axiosInstance';
import { toast } from 'react-hot-toast';
import { useSocket } from '../../context/SocketContext';
import { getImageUrl } from '../../utils/imageHelper';

// Helper function to get relative time
const getRelativeTime = (date) => {
    if (!date) return '';
    const now = new Date();
    const messageDate = new Date(date);
    const diffInSeconds = Math.floor((now - messageDate) / 1000);
    
    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) {
        const mins = Math.floor(diffInSeconds / 60);
        return `${mins} min ago`;
    }
    if (diffInSeconds < 86400) {
        const hrs = Math.floor(diffInSeconds / 3600);
        return `${hrs} hr ago`;
    }
    if (diffInSeconds < 172800) return 'Yesterday';
    if (diffInSeconds < 604800) {
        const days = Math.floor(diffInSeconds / 86400);
        return `${days} days ago`;
    }
    return messageDate.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
};

const Messages = () => {
    const { socket } = useSocket();
    const { user: currentUser } = useSelector(state => state.auth);
    const location = useLocation();
    const [searchParams, setSearchParams] = useSearchParams();

    const [contacts, setContacts] = useState([]);
    const [selectedChat, setSelectedChat] = useState(null); // userId of the other person
    const [messages, setMessages] = useState([]); // all messages for active conversation preview
    const [newMessage, setNewMessage] = useState('');
    const [loadingContacts, setLoadingContacts] = useState(true);
    const [sending, setSending] = useState(false);

    // Search and View Controls
    const [searchQuery, setSearchQuery] = useState(''); // contacts search
    const [chatSearchQuery, setChatSearchQuery] = useState(''); // search query for messages inside chat
    const [showChatSearch, setShowChatSearch] = useState(false);
    const [showChatInfo, setShowChatInfo] = useState(false);
    const [isMuted, setIsMuted] = useState(false);
    const [showClearChatModal, setShowClearChatModal] = useState(false);
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);

    // Paginated Chat History
    const [chatMessages, setChatMessages] = useState([]);
    const [chatPage, setChatPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const [fetchingChat, setFetchingChat] = useState(false);

    const chatContainerRef = useRef(null);
    const lastScrollHeightRef = useRef(0);
    const selectedChatRef = useRef(null);
    const searchInputRef = useRef(null);
    const chatSearchInputRef = useRef(null);
    const emojiPickerRef = useRef(null);
    const currentUserRef = useRef(currentUser);

    useEffect(() => {
        selectedChatRef.current = selectedChat;
    }, [selectedChat]);

    useEffect(() => {
        currentUserRef.current = currentUser;
    }, [currentUser]);

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

    // Handle direct chat redirect from user profile
    useEffect(() => {
        if (location.state?.directChat) {
            setSelectedChat(location.state.directChat);
        }
    }, [location.state]);

    // Sync from location state if contacts loaded later
    useEffect(() => {
        if (location.state?.directChat && contacts.length > 0) {
            const contact = contacts.find(c => c._id === location.state.directChat);
            if (contact) {
                setSelectedChat(contact._id);
            }
        }
    }, [location.state, contacts]);

    // Fetch conversations (messages list) and contacts on load
    const fetchData = async () => {
        setLoadingContacts(true);
        try {
            const [msgRes, conRes] = await Promise.all([
                axiosInstance.get('/my-messages'),
                axiosInstance.get('/superadmin/users', { params: { limit: 5000 } })
            ]);
            setMessages(msgRes.data || []);
            setContacts((conRes.data.users || []).filter(u => u._id !== currentUser?._id));
        } catch (err) {
            toast.error('Data synchronization failed');
        } finally {
            setLoadingContacts(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [currentUser?._id]);

    // Socket.io Real-time DM events
    useEffect(() => {
        if (!socket || typeof socket.on !== 'function') return;

        const handleDirectMessage = (data) => {
            const senderId = (data.sender?._id || data.sender)?.toString();
            const recipientId = (data.recipient?._id || data.recipient)?.toString();
            const meId = currentUserRef.current?._id?.toString();
            const partnerId = senderId === meId ? recipientId : senderId;

            // If it's the active chat, append it
            if (partnerId === selectedChatRef.current) {
                setChatMessages(prev => [...prev, data]);
                setTimeout(() => {
                    if (chatContainerRef.current) {
                        chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
                    }
                }, 100);
            }

            // Update conversations list preview
            setMessages(prev => [data, ...prev.filter(m => {
                const mSenderId = (m.sender?._id || m.sender)?.toString();
                const mRecipientId = (m.recipient?._id || m.recipient)?.toString();
                const mPartnerId = mSenderId === meId ? mRecipientId : mSenderId;
                return mPartnerId !== partnerId;
            })]);
        };

        socket.on('NEW_MESSAGE', handleDirectMessage);
        return () => {
            if (socket && typeof socket.off === 'function') {
                socket.off('NEW_MESSAGE', handleDirectMessage);
            }
        };
    }, [socket]);

    // Fetch Chat History helper
    const fetchChatHistory = async (partnerId, page = 1, isLoadingMore = false) => {
        if (!partnerId) return;
        setFetchingChat(true);
        try {
            const res = await axiosInstance.get(`/chat-history/${partnerId}?page=${page}`);
            const newMsgs = res.data.reverse();

            if (newMsgs.length < 50) setHasMore(false);
            else setHasMore(true);

            if (isLoadingMore) {
                if (chatContainerRef.current) {
                    lastScrollHeightRef.current = chatContainerRef.current.scrollHeight;
                }
                setChatMessages(prev => [...newMsgs, ...prev]);
            } else {
                setChatMessages(newMsgs);
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

    // Selected Chat change effect
    useEffect(() => {
        if (selectedChat) {
            setChatPage(1);
            setChatMessages([]);
            setHasMore(true);
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

    // Scroll offset restoration
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

    const handleSend = async (e) => {
        if (e) e.preventDefault();
        if (!newMessage.trim() || !selectedChat || sending) return;
        setSending(true);

        const payload = {
            recipient: selectedChat,
            subject: 'Direct Message',
            content: newMessage,
            schoolId: null
        };

        try {
            if (socket) {
                socket.emit('send_direct_message', payload);
            } else {
                // REST API fallback
                const res = await axiosInstance.post('/my-messages', payload);
                setChatMessages(prev => [...prev, res.data]);
                setMessages(prev => [res.data, ...prev.filter(m => {
                    const mSenderId = (m.sender?._id || m.sender)?.toString();
                    const mRecipientId = (m.recipient?._id || m.recipient)?.toString();
                    const meId = currentUser?._id?.toString();
                    const partnerId = mSenderId === meId ? mRecipientId : mSenderId;
                    return partnerId !== selectedChat;
                })]);
                setTimeout(() => {
                    if (chatContainerRef.current) {
                        chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
                    }
                }, 100);
            }
            setNewMessage('');
        } catch {
            toast.error('Failed to send message');
        } finally {
            setSending(false);
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
            await axiosInstance.delete(`/chat-history/${selectedChat}`);
            setChatMessages([]);
            setMessages(prev => prev.filter(m => {
                const senderId = (m.sender?._id || m.sender)?.toString();
                const recipientId = (m.recipient?._id || m.recipient)?.toString();
                const meId = currentUser?._id?.toString();
                const partnerId = senderId === meId ? recipientId : senderId;
                return partnerId !== selectedChat;
            }));
            toast.success('Chat history cleared successfully');
            setShowChatInfo(false);
            setShowClearChatModal(false);
        } catch (err) {
            toast.error('Failed to clear chat history');
        }
    };

    const handleEmojiClick = (emojiObject) => {
        setNewMessage(prev => prev + emojiObject.emoji);
    };

    // Chat groupings & active info memo blocks
    const conversations = useMemo(() => {
        if (!messages.length) return [];
        const groups = {};
        const directMsgs = messages.filter(m => m.type === 'DirectMessage');
        directMsgs.forEach(msg => {
            const senderId = (msg.sender?._id || msg.sender)?.toString();
            const recipientId = (msg.recipient?._id || msg.recipient)?.toString();
            const meId = currentUser?._id?.toString();
            const partner = senderId === meId ? msg.recipient : msg.sender;
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
    }, [messages, currentUser]);

    const activeConversation = useMemo(() => {
        return conversations.find(c => (c.partner._id || c.partner) === selectedChat);
    }, [conversations, selectedChat]);

    const activeConversationPartner = useMemo(() => {
        if (activeConversation?.partner) return activeConversation.partner;
        return contacts.find(c => c._id === selectedChat);
    }, [activeConversation, contacts, selectedChat]);

    // Search filters
    const filteredConversations = useMemo(() => {
        if (!searchQuery.trim()) return conversations;
        const query = searchQuery.toLowerCase();
        return conversations.filter(conv => {
            const partner = conv.partner;
            const fullName = `${partner.firstName || ''} ${partner.lastName || ''}`.toLowerCase();
            const role = (partner.role || '').toLowerCase();
            return fullName.includes(query) || role.includes(query);
        });
    }, [conversations, searchQuery]);

    const filteredContacts = useMemo(() => {
        if (!searchQuery.trim()) {
            return contacts.filter(t => !conversations.some(c => (c.partner._id || c.partner) === t._id));
        }
        const query = searchQuery.toLowerCase();
        return contacts.filter(t => {
            const fullName = `${t.firstName || ''} ${t.lastName || ''}`.toLowerCase();
            const role = (t.role || '').toLowerCase();
            const hasConversation = conversations.some(c => (c.partner._id || c.partner) === t._id);
            return !hasConversation && (fullName.includes(query) || role.includes(query));
        });
    }, [contacts, conversations, searchQuery]);

    const filteredChatMessages = useMemo(() => {
        if (!chatSearchQuery.trim()) return chatMessages;
        const query = chatSearchQuery.toLowerCase();
        return chatMessages.filter(msg => 
            msg.content?.toLowerCase().includes(query)
        );
    }, [chatMessages, chatSearchQuery]);

    return (
        <motion.div 
            initial={{ opacity: 0, y: 15 }} 
            animate={{ opacity: 1, y: 0 }} 
            className="h-[calc(100vh-160px)] flex gap-8 font-outfit text-slate-300 overflow-hidden"
        >
            {/* Contacts Sidebar */}
            <div className={`w-1/3 bg-slate-900/20 border border-slate-800/60 rounded-md backdrop-blur-3xl flex flex-col overflow-hidden min-h-0 ${selectedChat ? 'hidden lg:flex' : 'flex'}`}>
                <div className="p-6 border-b border-white/5 space-y-4 bg-white/[0.01] shrink-0">
                    <h2 className="text-xl font-black italic uppercase tracking-tighter text-white leading-none">Secure Comms Registry</h2>
                    <div className="relative group">
                        <button
                            type="button"
                            onClick={() => searchInputRef.current?.focus()}
                            className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-hover:text-superadmin-primary transition-colors cursor-pointer z-10"
                        >
                            <Search size={14} />
                        </button>
                        <input
                            ref={searchInputRef}
                            value={searchQuery}
                            onChange={e => setSearchQuery(e.target.value)}
                            placeholder="SCAN IDENTITY..."
                            className="w-full bg-slate-950/40 border border-white/5 h-12 pl-12 pr-6 rounded-md text-[10px] font-black uppercase tracking-widest text-white outline-none focus:border-superadmin-primary transition-all italic placeholder:text-slate-700"
                        />
                        {searchQuery && (
                            <button
                                type="button"
                                onClick={() => setSearchQuery('')}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-superadmin-primary transition-colors"
                            >
                                <span className="text-xs">✕</span>
                            </button>
                        )}
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto p-4 space-y-1.5 custom-scrollbar min-h-0">
                    {loadingContacts ? (
                        <div className="p-8 text-center opacity-30 animate-pulse">
                            <p className="text-[10px] font-black uppercase italic text-slate-600">Loading registry...</p>
                        </div>
                    ) : (
                        <>
                            {/* Active Conversations */}
                            {filteredConversations.length > 0 && (
                                <div className="space-y-1.5">
                                    <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest px-4 mb-3 italic">Active Conversations</p>
                                    {filteredConversations.map(conv => {
                                        const p = conv.partner;
                                        const isActive = selectedChat === p._id;
                                        return (
                                            <button
                                                key={p._id}
                                                onClick={() => setSelectedChat(p._id)}
                                                className={`w-full flex items-center gap-3 p-4 rounded-md transition-all border text-left group ${isActive ? 'bg-superadmin-primary/10 border-superadmin-primary/30' : 'bg-transparent border-transparent hover:bg-slate-800/30'}`}
                                            >
                                                <div className="w-11 h-11 rounded-md bg-slate-800 border border-white/5 overflow-hidden shadow-lg relative shrink-0">
                                                    {getImageUrl(p.photo) ? <img src={getImageUrl(p.photo)} alt="" className="w-full h-full object-cover" /> : <User className="w-full h-full p-2 text-slate-600" />}
                                                    <div className={`absolute top-0.5 right-0.5 w-2 h-2 rounded-md border border-slate-900 ${p.isActive ? 'bg-emerald-500' : 'bg-superadmin-primary'}`}></div>
                                                </div>
                                                <div className="min-w-0 flex-1">
                                                    <h4 className="text-white font-black text-[11px] uppercase tracking-tighter truncate italic">{p.firstName} {p.lastName}</h4>
                                                    <p className="text-[7px] text-superadmin-primary font-black uppercase tracking-widest leading-none mt-0.5 truncate">{p.role?.replace('_', ' ')}</p>
                                                    {p.schoolId?.name && <p className="text-[7px] text-slate-500 italic truncate leading-none mt-0.5">{p.schoolId.name}</p>}
                                                    <p className="text-[9px] text-slate-500 font-bold truncate italic leading-none mt-1.5">{conv.messages[0]?.content}</p>
                                                </div>
                                                <div className="flex flex-col items-end gap-1.5 shrink-0">
                                                    <span className="text-[7px] font-bold text-slate-600">{getRelativeTime(conv.messages[0]?.createdAt)}</span>
                                                    {conv.messages.some(m => m.sender?._id !== currentUser?._id && !m.isRead) && <div className="w-1.5 h-1.5 rounded-md bg-superadmin-primary animate-pulse shadow-superadmin-primary/50 shadow-lg"></div>}
                                                </div>
                                            </button>
                                        );
                                    })}
                                </div>
                            )}

                            {/* Available Contacts */}
                            <div className={`${filteredConversations.length > 0 ? 'mt-8' : 'mt-2'} space-y-1.5`}>
                                <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest px-4 mb-3 italic">Available Contacts</p>
                                {filteredContacts.length > 0 ? (
                                    filteredContacts.map(t => (
                                        <button
                                            key={t._id}
                                            onClick={() => setSelectedChat(t._id)}
                                            className="w-full flex items-center gap-3 p-4 rounded-md transition-all border border-transparent hover:bg-slate-800/30 group text-left"
                                        >
                                            <div className="w-10 h-10 rounded-md bg-slate-800/50 border border-white/5 overflow-hidden flex items-center justify-center grayscale group-hover:grayscale-0 transition-all shrink-0">
                                                {getImageUrl(t.photo) ? <img src={getImageUrl(t.photo)} alt="" className="w-full h-full object-cover" /> : <User size={16} className="text-slate-600" />}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <h4 className="text-slate-500 group-hover:text-white font-black text-[10px] uppercase tracking-tighter italic transition-colors truncate">{t.firstName} {t.lastName}</h4>
                                                <p className="text-[7px] text-slate-600 group-hover:text-superadmin-primary font-black uppercase tracking-widest leading-none mt-0.5 truncate">{t.role?.replace('_', ' ')}</p>
                                                {t.schoolId?.name && <p className="text-[7px] text-slate-600 italic truncate leading-none mt-0.5">{t.schoolId.name}</p>}
                                            </div>
                                            <ArrowUpRight size={12} className="ml-auto text-slate-800 group-hover:text-superadmin-primary shrink-0" />
                                        </button>
                                    ))
                                ) : (
                                    <div className="text-center py-8">
                                        <p className="text-[9px] font-black text-slate-700 uppercase tracking-widest italic">No contacts found</p>
                                    </div>
                                )}
                            </div>
                        </>
                    )}
                </div>
            </div>

            {/* Chat Area */}
            <div className={`flex-1 bg-slate-900/20 border border-slate-800/60 rounded-md backdrop-blur-3xl flex flex-col overflow-hidden shadow-2xl relative ${!selectedChat ? 'hidden lg:flex' : 'flex'}`}>
                {selectedChat ? (
                    <div className="flex flex-col h-full overflow-hidden">
                        {/* Chat Header */}
                        <div className="p-5 border-b border-white/5 flex items-center justify-between bg-white/[0.02] shrink-0">
                            <div className="flex items-center gap-4">
                                <button onClick={() => setSelectedChat(null)} className="lg:hidden p-2 rounded-md bg-slate-800/60 text-slate-400 mr-1"><ArrowLeft size={18} /></button>
                                <div className="w-11 h-11 rounded-md bg-slate-800 overflow-hidden border border-superadmin-primary/20 shadow-xl shadow-superadmin-primary/5">
                                    {getImageUrl(activeConversationPartner?.photo) ? <img src={getImageUrl(activeConversationPartner.photo)} alt="" className="w-full h-full object-cover" /> : <User className="w-full h-full p-2 text-slate-600" />}
                                </div>
                                <div>
                                    <h3 className="text-lg font-black text-white italic tracking-tighter uppercase leading-none mb-1 flex items-center gap-2">
                                        {activeConversationPartner?.firstName || 'TARGET'} {activeConversationPartner?.lastName || 'LOCKED'}
                                        {activeConversationPartner?.role && (
                                            <span className="text-[7px] bg-superadmin-primary/20 text-superadmin-primary px-1.5 py-0.5 rounded font-black tracking-widest uppercase">
                                                {activeConversationPartner.role.replace('_', ' ')}
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
                                    className={`p-3 rounded-md border transition-all ${showChatSearch ? 'border-superadmin-primary text-superadmin-primary bg-superadmin-primary/10' : 'border-slate-800 text-slate-500 hover:text-white hover:bg-slate-800/50'}`}
                                >
                                    <Search size={16} />
                                </button>
                                <button 
                                    onClick={() => setShowChatInfo(!showChatInfo)}
                                    className={`p-3 rounded-md border transition-all ${showChatInfo ? 'border-superadmin-primary text-superadmin-primary bg-superadmin-primary/10' : 'border-slate-800 text-slate-500 hover:text-white hover:bg-slate-800/50'}`}
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
                                        className="w-full bg-slate-950/50 border border-slate-800 h-9 pl-10 pr-10 rounded-md text-[10px] font-black uppercase tracking-widest text-white outline-none focus:border-superadmin-primary placeholder:text-slate-700 italic"
                                    />
                                    {chatSearchQuery && (
                                        <button
                                            type="button"
                                            onClick={() => setChatSearchQuery('')}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-600 hover:text-superadmin-primary transition-colors"
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

                        <div className="flex-1 flex min-h-0 relative overflow-hidden">
                            {/* Chat Messages */}
                            <div
                                ref={chatContainerRef}
                                onScroll={handleScroll}
                                className={`flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar bg-slate-950/20 flex flex-col transition-all ${showChatInfo ? 'lg:mr-80' : ''}`}
                            >
                                {fetchingChat && hasMore && (
                                    <div className="flex justify-center py-2 shrink-0">
                                        <div className="w-1.5 h-1.5 rounded-md bg-superadmin-primary animate-pulse"></div>
                                    </div>
                                )}

                                {filteredChatMessages.map((msg, i) => {
                                    const isMe = msg.sender?._id === currentUser?._id;
                                    const showDate = i === 0 || new Date(filteredChatMessages[i - 1].createdAt).toDateString() !== new Date(msg.createdAt).toDateString();

                                    return (
                                        <React.Fragment key={msg._id || i}>
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
                                                    <div className={`px-4 py-2.5 rounded-md text-[12px] font-bold shadow-xl relative transition-all hover:shadow-2xl ${isMe ? 'bg-superadmin-primary text-black rounded-tr-none' : 'bg-slate-800 text-slate-200 rounded-tl-none border border-white/5'}`}>
                                                        <p className="italic leading-relaxed whitespace-pre-wrap">
                                                            {chatSearchQuery ? (
                                                                msg.content?.split(new RegExp(`(${chatSearchQuery})`, 'gi')).map((part, idx) => 
                                                                    part.toLowerCase() === chatSearchQuery.toLowerCase() ? 
                                                                        <mark key={idx} className="bg-yellow-400/30 text-white">{part}</mark> : 
                                                                        part
                                                                )
                                                            ) : (
                                                                msg.content
                                                            )}
                                                        </p>
                                                        {/* Triangle tail */}
                                                        <div className={`absolute top-0 w-3 h-3 ${isMe ? '-right-1.5 bg-superadmin-primary clip-path-right' : '-left-1.5 bg-slate-800 clip-path-left border-t border-l border-white/5'}`}></div>
                                                    </div>

                                                    <div className="flex items-center gap-1.5 mt-1 opacity-50 group-hover:opacity-100 transition-opacity mx-1">
                                                        <span className="text-[7px] font-black uppercase tracking-widest italic text-slate-500">{new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                                        {isMe && <CheckCheck size={10} className="text-superadmin-primary opacity-60" />}
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

                                {chatMessages.length > 0 && filteredChatMessages.length === 0 && chatSearchQuery && (
                                    <div className="h-full flex flex-col items-center justify-center opacity-30 gap-6">
                                        <div className="w-16 h-16 rounded-md border-2 border-dashed border-slate-700 flex items-center justify-center">
                                            <Search size={24} className="text-slate-700" />
                                        </div>
                                        <p className="text-[9px] font-black uppercase tracking-[0.4em] italic leading-none">No Messages Found</p>
                                    </div>
                                )}
                            </div>

                            {/* Chat Info Panel */}
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
                                                <button
                                                    onClick={() => setShowChatInfo(false)}
                                                    className="p-2 rounded-md text-slate-500 hover:text-white hover:bg-slate-800/50 transition-all"
                                                >
                                                    <span className="text-lg">✕</span>
                                                </button>
                                            </div>

                                            <div className="flex flex-col items-center text-center space-y-4 pb-6 border-b border-slate-800/60">
                                                <div className="w-24 h-24 rounded-md bg-slate-800 overflow-hidden border-2 border-superadmin-primary/20 shadow-xl">
                                                    {getImageUrl(activeConversationPartner?.photo) ? (
                                                        <img src={getImageUrl(activeConversationPartner.photo)} alt="" className="w-full h-full object-cover" />
                                                    ) : (
                                                        <User className="w-full h-full p-6 text-slate-600" />
                                                    )}
                                                </div>
                                                <div>
                                                    <h4 className="text-lg font-black text-white uppercase tracking-tighter italic">
                                                        {activeConversationPartner?.firstName} {activeConversationPartner?.lastName}
                                                    </h4>
                                                    <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mt-1">
                                                        {activeConversationPartner?.role?.replace('_', ' ') || 'User'}
                                                    </p>
                                                    {activeConversationPartner?.schoolId?.name && (
                                                        <p className="text-[8px] text-slate-600 italic mt-0.5">{activeConversationPartner.schoolId.name}</p>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Stats */}
                                            <div className="space-y-3">
                                                <h4 className="text-[9px] font-black text-slate-600 uppercase tracking-widest italic">Conversation Stats</h4>
                                                <div className="grid grid-cols-2 gap-3">
                                                    <div className="bg-slate-950/50 border border-slate-800 rounded-md p-4 text-center">
                                                        <div className="text-2xl font-black text-superadmin-primary italic">{chatMessages.length}</div>
                                                        <div className="text-[8px] font-black text-slate-600 uppercase tracking-widest mt-1">Messages</div>
                                                    </div>
                                                    <div className="bg-slate-950/50 border border-slate-800 rounded-md p-4 text-center">
                                                        <div className="text-2xl font-black text-emerald-500 italic">
                                                            {chatMessages.filter(m => m.sender?._id === currentUser?._id).length}
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
                                                            <span className="text-[10px] font-bold text-slate-400 italic">{activeConversationPartner.email}</span>
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
                                                                ? 'bg-superadmin-primary/10 border-superadmin-primary/30 text-superadmin-primary' 
                                                                : 'bg-slate-950/50 border-slate-800 text-slate-400 hover:text-white hover:border-superadmin-primary/30'
                                                        }`}
                                                    >
                                                        <span>{isMuted ? 'Unmute' : 'Mute'} Notifications</span>
                                                        {isMuted && <span className="text-xs">🔕</span>}
                                                    </button>
                                                    <button 
                                                        onClick={() => setShowClearChatModal(true)}
                                                        className="w-full p-3 rounded-md bg-slate-950/50 border border-slate-800 text-slate-400 hover:text-superadmin-primary hover:border-superadmin-primary/30 transition-all text-[10px] font-black uppercase tracking-widest italic text-left"
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

                            <form onSubmit={handleSend} className="flex items-center gap-3 bg-slate-950/50 border border-slate-800 rounded-md p-1.5 focus-within:border-superadmin-primary transition-all">
                                <input
                                    required
                                    placeholder="COMMAND INPUT..."
                                    value={newMessage}
                                    onChange={(e) => setNewMessage(e.target.value)}
                                    className="flex-1 bg-transparent h-11 px-3 text-[13px] font-black text-white outline-none italic placeholder:text-slate-800 uppercase tracking-tighter"
                                />
                                <button 
                                    type="button" 
                                    onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                                    className={`p-3 rounded-md transition-colors ${showEmojiPicker ? 'text-superadmin-primary' : 'text-slate-600 hover:text-white'}`}
                                >
                                    <Smile size={18} />
                                </button>
                                <button
                                    type="submit"
                                    disabled={!newMessage.trim() || sending}
                                    className="bg-superadmin-primary text-black p-3 rounded-md shadow-lg shadow-superadmin-primary/20 hover:scale-105 transition-all group active:scale-95 disabled:opacity-50"
                                >
                                    <Send size={18} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                                </button>
                            </form>
                        </div>
                    </div>
                ) : (
                    <div className="h-full flex flex-col items-center justify-center p-20 text-center space-y-10 group">
                        <div className="relative">
                            <div className="w-32 h-32 rounded-md border-4 border-slate-800 border-t-superadmin-primary animate-spin"></div>
                            <MessageSquare size={48} className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-slate-800 group-hover:text-superadmin-primary transition-colors duration-500" />
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

            {/* Clear Chat History Modal */}
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
                            <div className="flex justify-center mb-6">
                                <div className="w-16 h-16 rounded-full bg-superadmin-primary/10 border-2 border-superadmin-primary/30 flex items-center justify-center">
                                    <AlertCircle size={32} className="text-superadmin-primary" />
                                </div>
                            </div>

                            <h3 className="text-2xl font-black text-white uppercase tracking-tighter italic text-center mb-3">
                                Clear Chat History?
                            </h3>

                            <p className="text-slate-400 text-sm text-center mb-8 leading-relaxed">
                                Are you sure you want to clear all messages in this conversation? This action cannot be undone and all chat history will be permanently deleted.
                            </p>

                            <div className="flex gap-3">
                                <button
                                    onClick={() => setShowClearChatModal(false)}
                                    className="flex-1 py-3 px-4 rounded-md bg-slate-800 border border-slate-700 text-white font-black text-sm uppercase tracking-widest hover:bg-slate-700 transition-all"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleClearChatHistory}
                                    className="flex-1 py-3 px-4 rounded-md bg-superadmin-primary text-black font-black text-sm uppercase tracking-widest hover:bg-superadmin-primary/90 transition-all shadow-lg shadow-superadmin-primary/20"
                                >
                                    Clear
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
};

export default Messages;
