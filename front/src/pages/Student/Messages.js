import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
    Send, 
    MessageSquare, 
    User, 
    Search, 
    Clock, 
    ArrowLeft,
    ShieldCheck,
    Paperclip,
    Mic,
    Smile,
    MoreVertical
} from 'lucide-react';
import { useSelector } from 'react-redux';
import { useLocation } from 'react-router-dom';
import axiosInstance from '../../utils/axiosInstance';
import { toast } from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { useSocket } from '../../context/SocketContext';

const Messages = () => {
    const [messages, setMessages] = useState([]);
    const [contacts, setContacts] = useState([]);
    const [loading, setLoading] = useState(false);
    const [selectedChat, setSelectedChat] = useState(null);
    const [content, setContent] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    
    const { user: currentUser } = useSelector(state => state.auth);
    const location = useLocation();
    const scrollRef = useRef();

    const { socket } = useSocket();

    useEffect(() => {
        fetchData();
        // Check for direct chat from navigation state
        if (location.state?.directChat) {
            setSelectedChat(location.state.directChat);
        }
    }, [location.state]);

    useEffect(() => {
        if (!socket) return;

        const handleNewMessage = (data) => {
            setMessages(prev => [data, ...prev]);
            if (data.sender?._id !== selectedChat && data.sender !== selectedChat) {
                toast.success(`New message from ${data.sender?.firstName || 'Faculty'}`, {
                    style: {
                        background: '#0f172a',
                        color: '#fff',
                        border: '1px solid #10b981',
                        fontSize: '11px',
                        fontWeight: 900,
                        textTransform: 'uppercase'
                    }
                });
            }
        };

        socket.on('NEW_MESSAGE', handleNewMessage);
        return () => socket.off('NEW_MESSAGE', handleNewMessage);
    }, [socket, selectedChat]);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages, selectedChat]);

    const fetchData = async () => {
        try {
            const [msgRes, conRes] = await Promise.all([
                axiosInstance.get('/my-messages'),
                axiosInstance.get('/contacts')
            ]);
            setMessages(msgRes.data);
            setContacts(conRes.data);
        } catch (err) {
            console.error('Failed to load messages');
        }
    };

    const handleSend = async (e) => {
        if (e) e.preventDefault();
        if (!content.trim() || !selectedChat) return;

        try {
            const res = await axiosInstance.post('/my-messages', {
                recipient: selectedChat,
                content: content,
                subject: 'Direct Response'
            });
            setMessages(prev => [res.data, ...prev]);
            setContent('');
            toast.success('Message sent');
        } catch (err) {
            toast.error('Failed to send message');
        }
    };

    const conversations = useMemo(() => {
        const groups = {};
        messages.filter(m => m.type === 'DirectMessage').forEach(msg => {
            const partner = msg.sender?._id === currentUser?._id ? msg.recipient : msg.sender;
            if (!partner) return;
            const pId = partner._id || partner;
            if (!groups[pId]) groups[pId] = { partner, messages: [] };
            groups[pId].messages.push(msg);
        });
        return Object.values(groups).sort((a,b) => new Date(b.messages[0].createdAt) - new Date(a.messages[0].createdAt));
    }, [messages, currentUser]);

    const activeConversation = useMemo(() => {
        if (!selectedChat) return null;
        const conv = conversations.find(c => (c.partner._id || c.partner) === selectedChat);
        if (conv) return { ...conv, messages: [...conv.messages].sort((a,b) => new Date(a.createdAt) - new Date(b.createdAt)) };
        
        // If first time messaging
        const contact = contacts.find(c => c._id === selectedChat);
        return { partner: contact, messages: [] };
    }, [conversations, selectedChat, contacts]);

    const filteredContacts = contacts.filter(c => 
        `${c.firstName} ${c.lastName}`.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <motion.div 
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className="h-[calc(100vh-160px)] max-w-7xl mx-auto flex flex-col lg:flex-row gap-8 overflow-hidden font-outfit"
        >
            {/* Sidebar: Contacts & History */}
            <div className={`lg:w-96 flex flex-col bg-[#0f0f12] border border-slate-800/60 rounded-md overflow-hidden shadow-2xl ${selectedChat ? 'hidden lg:flex' : 'flex w-full'} font-outfit`}>
                <div className="p-8 border-b border-slate-800/60 bg-[#0a0a0c] font-outfit">
                    <h2 className="text-xl font-black text-white italic uppercase tracking-tighter mb-6 font-outfit">Messages & Chat</h2>
                    <div className="relative group font-outfit">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-700 group-focus-within:text-brand-primary transition-colors" size={16} />
                        <input 
                            placeholder="SEARCH PARTICIPANTS..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full bg-slate-950/50 border border-slate-800 h-12 pl-12 pr-4 rounded-md text-[10px] font-black uppercase tracking-widest text-white outline-none focus:border-brand-primary placeholder:text-slate-800 italic transition-all font-outfit"
                        />
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto p-4 space-y-2 custom-scrollbar font-outfit">
                    <p className="text-[9px] font-black text-slate-600 uppercase tracking-widest px-4 mb-3 italic font-outfit">Recent Chats</p>
                    {conversations.map(conv => {
                        const p = conv.partner;
                        const isActive = selectedChat === (p._id || p);
                        return (
                            <button 
                                key={p._id || p}
                                onClick={() => setSelectedChat(p._id || p)}
                                className={`w-full flex items-center gap-4 p-4 rounded-md transition-all border font-outfit ${isActive ? 'bg-brand-primary/10 border-brand-primary/30' : 'bg-transparent border-transparent hover:bg-slate-800/30'}`}
                            >
                                <div className="w-12 h-12 rounded-md bg-slate-800 border border-white/5 overflow-hidden shadow-lg relative shrink-0">
                                    {p.photo ? <img src={p.photo} alt="" className="w-full h-full object-cover" /> : <User className="w-full h-full p-2.5 text-slate-600" />}
                                    <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-emerald-500 rounded-md border-2 border-[#0f0f12]"></div>
                                </div>
                                <div className="text-left min-w-0 flex-1 font-outfit">
                                    <h4 className="text-white font-black text-[11px] uppercase tracking-tight truncate italic">{p.firstName} {p.lastName}</h4>
                                    <p className="text-[9px] text-slate-500 font-bold truncate italic leading-none mt-1">{conv.messages[conv.messages.length-1].content}</p>
                                </div>
                            </button>
                        );
                    })}

                    <p className="text-[9px] font-black text-slate-600 uppercase tracking-widest px-4 mt-8 mb-3 italic font-outfit">Teachers & Staff</p>
                    {filteredContacts.filter(c => !conversations.some(conv => (conv.partner._id || conv.partner) === c._id)).map(c => (
                        <button 
                            key={c._id}
                            onClick={() => setSelectedChat(c._id)}
                            className="w-full flex items-center gap-4 p-4 rounded-md transition-all border border-transparent hover:bg-slate-800/30 group font-outfit"
                        >
                            <div className="w-10 h-10 rounded-md bg-slate-800/50 border border-white/5 overflow-hidden flex items-center justify-center grayscale group-hover:grayscale-0 transition-all shrink-0">
                                {c.photo ? <img src={c.photo} alt="" className="w-full h-full object-cover" /> : <User size={16} className="text-slate-600" />}
                            </div>
                            <div className="text-left font-outfit">
                                <h4 className="text-slate-500 group-hover:text-white font-black text-[10px] uppercase tracking-tight italic transition-colors">{c.firstName} {c.lastName}</h4>
                                <p className="text-[8px] text-slate-700 font-black uppercase tracking-widest">{c.role}</p>
                            </div>
                        </button>
                    ))}
                </div>
            </div>

            {/* Main Chat Interface */}
            <div className={`flex-1 flex flex-col bg-[#0f0f12] border border-slate-800/60 rounded-md overflow-hidden shadow-2xl relative ${!selectedChat ? 'hidden lg:flex' : 'flex'} font-outfit`}>
                {selectedChat ? (
                    <>
                        <header className="p-8 border-b border-slate-800/60 flex items-center justify-between bg-[#0a0a0c] font-outfit">
                            <div className="flex items-center gap-5 font-outfit">
                                <button onClick={() => setSelectedChat(null)} className="lg:hidden p-3 rounded-md bg-slate-800/60 text-slate-400"><ArrowLeft size={18}/></button>
                                <div className="w-12 h-12 rounded-md bg-slate-800 overflow-hidden border border-brand-primary/20 shadow-xl">
                                    {activeConversation?.partner.photo ? <img src={activeConversation.partner.photo} alt="" className="w-full h-full object-cover" /> : <User className="w-full h-full p-2.5 text-slate-600" />}
                                </div>
                                <div className="font-outfit">
                                    <h3 className="text-lg font-black text-white italic tracking-tighter uppercase leading-none mb-1 font-outfit">
                                        {activeConversation?.partner.firstName} {activeConversation?.partner.lastName}
                                    </h3>
                                    <span className="flex items-center gap-2 text-[9px] font-black text-brand-primary uppercase tracking-widest italic leading-none font-outfit">
                                        <ShieldCheck size={10} /> Official Communication Channel
                                    </span>
                                </div>
                            </div>
                            <button className="p-3 text-slate-600 hover:text-white transition-all font-outfit"><MoreVertical size={18} /></button>
                        </header>

                        <div ref={scrollRef} className="flex-1 overflow-y-auto p-10 space-y-8 custom-scrollbar bg-slate-950/20 font-outfit">
                            {activeConversation.messages.map((msg, i) => {
                                const isMe = msg.sender?._id === currentUser?._id || msg.sender === currentUser?._id;
                                return (
                                    <motion.div 
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        key={msg._id || i} 
                                        className={`flex ${isMe ? 'justify-end' : 'justify-start'} font-outfit`}
                                    >
                                        <div className={`max-w-[70%] space-y-2 ${isMe ? 'items-end' : 'items-start'} flex flex-col font-outfit`}>
                                            <div className={`p-5 rounded-md text-sm font-medium shadow-xl relative font-outfit ${isMe ? 'bg-brand-primary text-black rounded-tr-none' : 'bg-slate-800 text-slate-200 rounded-tl-none border border-slate-700/50'}`}>
                                                <p className="italic leading-relaxed font-outfit">{msg.content}</p>
                                            </div>
                                            <div className="flex items-center gap-2 px-1 font-outfit">
                                                <Clock size={10} className="text-slate-700" />
                                                <span className="text-[8px] font-black text-slate-700 uppercase tracking-widest italic">{new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                            </div>
                                        </div>
                                    </motion.div>
                                );
                            })}
                            {activeConversation.messages.length === 0 && (
                                <div className="h-full flex flex-col items-center justify-center opacity-20 gap-6 font-outfit">
                                    <MessageSquare size={48} className="text-slate-700" />
                                    <p className="text-[10px] font-black uppercase tracking-[0.4em] italic">No previous messages. Start a conversation.</p>
                                </div>
                            )}
                        </div>

                        <div className="p-8 border-t border-slate-800/60 bg-[#0a0a0c] font-outfit">
                            <form onSubmit={handleSend} className="flex items-center gap-4 bg-slate-950/50 border border-slate-800 rounded-md p-2 focus-within:border-brand-primary transition-all font-outfit">
                                <button type="button" className="p-3 rounded-md text-slate-700 hover:text-white transition-colors"><Paperclip size={18} /></button>
                                <input 
                                    required
                                    placeholder="TYPE YOUR MESSAGE..."
                                    value={content}
                                    onChange={(e) => setContent(e.target.value)}
                                    className="flex-1 bg-transparent h-12 px-2 text-[11px] font-black text-white outline-none italic placeholder:text-slate-900 uppercase tracking-widest font-outfit"
                                />
                                <button type="button" className="p-3 rounded-md text-slate-700 hover:text-white transition-colors hidden sm:block font-outfit"><Smile size={18} /></button>
                                <button 
                                    type="submit"
                                    className="bg-brand-primary text-black p-4 rounded-md shadow-lg shadow-brand-primary/20 hover:scale-105 active:scale-95 transition-all font-outfit"
                                >
                                    <Send size={18} />
                                </button>
                            </form>
                        </div>
                    </>
                ) : (
                    <div className="h-full flex flex-col items-center justify-center p-20 text-center space-y-10 font-outfit">
                        <div className="relative font-outfit font-outfit">
                            <div className="w-24 h-24 rounded-md border-2 border-dashed border-slate-800 animate-spin-slow"></div>
                            <MessageSquare size={32} className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-slate-800 font-outfit" />
                        </div>
                        <div className="font-outfit">
                            <h3 className="text-xl font-black text-white uppercase italic tracking-widest leading-none mb-4 font-outfit">Select a conversation</h3>
                            <p className="text-[9px] font-black text-slate-600 uppercase tracking-[.2em] max-w-xs mx-auto leading-relaxed italic font-outfit">Choose a contact from the sidebar to start chatting with teachers or school staff.</p>
                        </div>
                    </div>
                )}
            </div>
        </motion.div>
    );
};

export default Messages;
