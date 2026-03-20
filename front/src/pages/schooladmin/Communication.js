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
    const [activeTab, setActiveTab] = useState('announcements'); // 'announcements', 'messages', 'notices'
    const [announcements, setAnnouncements] = useState([]);
    const [messages, setMessages] = useState([]);
    const [notices, setNotices] = useState([]);
    const [contacts, setContacts] = useState([]);
    const [loading, setLoading] = useState(false);
    const [selectedChat, setSelectedChat] = useState(null); // userId of the other person
    
    const socket = useSocket();
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
            setMessages(prev => [data, ...prev]);
            toast.success(`Direct Proton Received: ${data.subject}`);
        };

        const handleNotice = (data) => {
            setNotices(prev => [data, ...prev]);
            toast.success(`Public Bulletin Synced: ${data.subject}`);
        };

        socket.on('new_announcement', handleAnnouncement);
        socket.on('new_direct_message', handleDirectMessage);
        socket.on('new_notice', handleNotice);

        return () => {
            if (socket && typeof socket.off === 'function') {
                socket.off('new_announcement', handleAnnouncement);
                socket.off('new_direct_message', handleDirectMessage);
                socket.off('new_notice', handleNotice);
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

    const handleSend = async (e, customTarget = null) => {
        if (e) e.preventDefault();
        try {
            let url = '';
            let payload = { ...formData };
            
            if (activeTab === 'announcements') url = '/school-admin/announcements';
            else if (activeTab === 'messages') {
                url = '/school-admin/messages';
                if (customTarget) payload = { ...payload, recipient: customTarget, subject: 'Direct Response' };
            }
            else if (activeTab === 'notices') url = '/school-admin/notices';

            await axiosInstance.post(url, payload);
            toast.success('Dispatched Successfully');
            setFormData({ targetRole: 'All', subject: '', content: '', recipient: '' });
            fetchData();
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
            const partner = msg.sender?._id === currentUser?._id ? msg.recipient : msg.sender;
            if (!partner) return;
            const pId = partner._id || partner;
            if (!groups[pId]) groups[pId] = { partner, messages: [] };
            groups[pId].messages.push(msg);
        });
        return Object.values(groups).sort((a,b) => new Date(b.messages[0].createdAt) - new Date(a.messages[0].createdAt));
    }, [messages, currentUser]);

    const activeConversation = useMemo(() => {
        return conversations.find(c => (c.partner._id || c.partner) === selectedChat);
    }, [conversations, selectedChat]);

    return (
        <div className="min-h-screen bg-[#020617] text-slate-300 font-outfit p-4 lg:p-8 selection:bg-brand-primary/30 selection:text-white overflow-hidden flex flex-col">
            {/* Header Section */}
            <div className="max-w-[1600px] w-full mx-auto mb-8 shrink-0">
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                    <div className="space-y-3">
                        <div className="flex items-center gap-3">
                            <div className="h-[2px] w-8 bg-brand-primary rounded-full"></div>
                            <span className="text-[9px] font-black text-brand-primary uppercase tracking-[0.4em] italic leading-none">Intelligence Signal Relay</span>
                        </div>
                        <h1 className="text-4xl lg:text-5xl font-black text-white uppercase tracking-tighter italic leading-none">
                            COMMUNICATION <span className="text-brand-primary">HUB</span>
                        </h1>
                        <p className="text-slate-500 font-bold text-[10px] lg:text-xs tracking-wider uppercase">Unified administrative directive and inter-institutional uplink.</p>
                    </div>

                    <div className="flex bg-slate-900/40 p-1 rounded-[1.5rem] border border-slate-800/40 backdrop-blur-3xl shadow-2xl">
                        {[
                            { id: 'announcements', label: 'Announcements', icon: Megaphone, color: 'brand-primary' },
                            { id: 'messages', label: 'Direct Probe', icon: MessageSquare, color: 'indigo-500' },
                            { id: 'notices', label: 'Notice Board', icon: Layout, color: 'emerald-500' }
                        ].map(tab => (
                            <button 
                                key={tab.id}
                                onClick={() => { setActiveTab(tab.id); setSelectedChat(null); }}
                                className={`flex items-center gap-3 px-6 py-3.5 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all relative overflow-hidden group ${activeTab === tab.id ? `bg-${tab.color} text-white shadow-xl shadow-${tab.color}/20 scale-105` : 'text-slate-500 hover:text-slate-300'}`}
                            >
                                <tab.icon size={16} />
                                {tab.label}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            <div className="max-w-[1600px] w-full mx-auto flex-1 grid grid-cols-1 lg:grid-cols-12 gap-8 min-h-0 overflow-hidden">
                {activeTab === 'messages' ? (
                    /* CHAT INTERFACE */
                    <>
                        <div className={`lg:col-span-4 flex flex-col gap-6 min-h-0 ${selectedChat ? 'hidden lg:flex' : 'flex'}`}>
                            {/* Contact List */}
                            <div className="bg-slate-900/30 border border-slate-800/60 rounded-[2.5rem] flex flex-col min-h-0 backdrop-blur-3xl">
                                <div className="p-8 border-b border-slate-800/60">
                                    <div className="relative group">
                                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600 group-hover:text-brand-primary transition-colors" size={18} />
                                        <input 
                                            placeholder="SCAN DATABASE FOR ENTITIY..."
                                            className="w-full bg-slate-950/50 border border-slate-800 h-14 pl-12 pr-6 rounded-2xl text-[10px] font-black uppercase tracking-widest text-white outline-none focus:border-brand-primary placeholder:text-slate-700 italic"
                                        />
                                    </div>
                                </div>
                                <div className="flex-1 overflow-y-auto p-4 space-y-2 custom-scrollbar">
                                    <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest px-4 mb-4 italic">Active Conversations</p>
                                    {conversations.map(conv => {
                                        const p = conv.partner;
                                        const isActive = selectedChat === (p._id || p);
                                        return (
                                            <button 
                                                key={p._id || p}
                                                onClick={() => setSelectedChat(p._id || p)}
                                                className={`w-full flex items-center gap-4 p-4 rounded-3xl transition-all border group ${isActive ? 'bg-brand-primary/10 border-brand-primary/30' : 'bg-transparent border-transparent hover:bg-slate-800/30'}`}
                                            >
                                                <div className="w-14 h-14 rounded-2xl bg-slate-800 border border-white/5 overflow-hidden shadow-lg relative shrink-0">
                                                    {p.photo ? <img src={p.photo} alt="" className="w-full h-full object-cover" /> : <User className="w-full h-full p-3 text-slate-600" />}
                                                    <div className="absolute top-1 right-1 w-3 h-3 bg-emerald-500 rounded-full border-2 border-slate-900 shadow-xl"></div>
                                                </div>
                                                <div className="text-left min-w-0 flex-1">
                                                    <h4 className="text-white font-black text-[13px] uppercase tracking-tighter truncate italic">{p.firstName} {p.lastName}</h4>
                                                    <p className="text-[10px] text-slate-500 font-bold truncate italic leading-none mt-1">{conv.messages[0].content}</p>
                                                </div>
                                                <div className="flex flex-col items-end gap-2">
                                                    <span className="text-[8px] font-bold text-slate-600">2M</span>
                                                    {conv.messages.some(m => !m.isRead) && <div className="w-2 h-2 rounded-full bg-luxury-rose animate-pulse shadow-rose-500/50 shadow-lg"></div>}
                                                </div>
                                            </button>
                                        );
                                    })}
                                    
                                    <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest px-4 mt-8 mb-4 italic">Available Contacts</p>
                                    {contacts.filter(t => !conversations.some(c => (c.partner._id || c.partner) === t._id)).map(t => (
                                        <button 
                                            key={t._id}
                                            onClick={() => setSelectedChat(t._id)}
                                            className="w-full flex items-center gap-4 p-4 rounded-3xl transition-all border border-transparent hover:bg-slate-800/30 group"
                                        >
                                            <div className="w-12 h-12 rounded-2xl bg-slate-800/50 border border-white/5 overflow-hidden flex items-center justify-center grayscale group-hover:grayscale-0 transition-all shrink-0">
                                                {t.photo ? <img src={t.photo} alt="" className="w-full h-full object-cover" /> : <User size={18} className="text-slate-600" />}
                                            </div>
                                            <div className="text-left">
                                                <h4 className="text-slate-500 group-hover:text-white font-black text-[11px] uppercase tracking-tighter italic transition-colors">{t.firstName} {t.lastName}</h4>
                                                <p className="text-[8px] text-slate-600 font-black uppercase tracking-widest">Institutional Role: {t.role}</p>
                                            </div>
                                            <ArrowUpRight size={14} className="ml-auto text-slate-800 group-hover:text-brand-primary" />
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className={`lg:col-span-8 flex flex-col min-h-0 bg-slate-900/40 border border-slate-800/60 rounded-[3rem] backdrop-blur-3xl overflow-hidden shadow-2xl relative ${!selectedChat ? 'hidden lg:flex' : 'flex'}`}>
                            {selectedChat ? (
                                <>
                                    {/* Chat Header */}
                                    <div className="p-8 border-b border-white/5 flex items-center justify-between bg-white/[0.02]">
                                        <div className="flex items-center gap-5">
                                            <button onClick={() => setSelectedChat(null)} className="lg:hidden p-3 rounded-2xl bg-slate-800/60 text-slate-400 mr-2"><ArrowLeft size={20}/></button>
                                            <div className="w-14 h-14 rounded-2xl bg-slate-800 overflow-hidden border border-brand-primary/20 shadow-xl shadow-brand-primary/5">
                                                {activeConversation?.partner.photo ? <img src={activeConversation.partner.photo} alt="" className="w-full h-full object-cover" /> : <User className="w-full h-full p-3 text-slate-600" />}
                                            </div>
                                            <div>
                                                <h3 className="text-xl font-black text-white italic tracking-tighter uppercase leading-none mb-1">
                                                    {activeConversation?.partner.firstName || 'TARGET'} {activeConversation?.partner.lastName || 'LOCKED'}
                                                </h3>
                                                <span className="flex items-center gap-2 text-[10px] font-black text-emerald-500 uppercase tracking-widest italic leading-none">
                                                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
                                                    Encrypted Signal Channel
                                                </span>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <button className="p-4 rounded-2xl border border-slate-800 text-slate-500 hover:text-white hover:bg-slate-800/50 transition-all"><Search size={18} /></button>
                                            <button className="p-4 rounded-2xl border border-slate-800 text-slate-500 hover:text-white hover:bg-slate-800/50 transition-all"><AlertCircle size={18} /></button>
                                        </div>
                                    </div>

                                    {/* Chat Messages */}
                                    <div className="flex-1 overflow-y-auto p-10 space-y-8 custom-scrollbar bg-slate-950/20">
                                        <div className="flex flex-col items-center justify-center mb-10">
                                            <div className="h-px w-20 bg-slate-800"></div>
                                            <span className="text-[10px] font-black text-slate-700 uppercase tracking-[0.3em] my-4 italic">Historical Archive Decrypted</span>
                                        </div>
                                        
                                        {activeConversation?.messages.map((msg, i) => {
                                            const isMe = msg.sender?._id === currentUser?._id;
                                            return (
                                                <motion.div 
                                                    initial={{ opacity: 0, x: isMe ? 20 : -20 }}
                                                    animate={{ opacity: 1, x: 0 }}
                                                    key={msg._id} 
                                                    className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}
                                                >
                                                    <div className={`max-w-[75%] space-y-2 ${isMe ? 'items-end' : 'items-start'} flex flex-col`}>
                                                        <div className={`p-6 rounded-[2rem] text-sm font-bold shadow-2xl relative ${isMe ? 'bg-brand-primary text-white rounded-tr-none' : 'bg-slate-800 text-slate-200 rounded-tl-none border border-white/5'}`}>
                                                            <p className="italic leading-relaxed">{msg.content}</p>
                                                            {i === activeConversation.messages.length - 1 && isMe && (
                                                                <div className="absolute -bottom-6 right-2 flex items-center gap-2">
                                                                    <div className="h-2 w-2 rounded-full bg-brand-primary/40 animate-pulse"></div>
                                                                    <span className="text-[9px] font-black text-brand-primary uppercase tracking-widest opacity-60 italic">Signal Relayed</span>
                                                                </div>
                                                            )}
                                                        </div>
                                                        <span className="text-[8px] font-black text-slate-700 uppercase tracking-widest px-2 italic">{new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                                    </div>
                                                </motion.div>
                                            );
                                        })}
                                        {(!activeConversation || activeConversation.messages.length === 0) && (
                                            <div className="h-full flex flex-col items-center justify-center opacity-30 gap-6">
                                                <div className="w-20 h-20 rounded-full border-2 border-dashed border-slate-700 flex items-center justify-center">
                                                    <Mic size={32} className="text-slate-700" />
                                                </div>
                                                <p className="text-[10px] font-black uppercase tracking-[0.5em] italic">Awaiting Signal Input...</p>
                                            </div>
                                        )}
                                    </div>

                                    {/* Chat Input */}
                                    <div className="p-8 border-t border-white/5 bg-slate-900 shadow-[0_-20px_50px_rgba(0,0,0,0.5)]">
                                        <form onSubmit={(e) => { e.preventDefault(); handleSend(null, selectedChat); }} className="flex items-center gap-4 bg-slate-950/50 border border-slate-800 rounded-2xl p-2.5 focus-within:border-brand-primary transition-all">
                                            <button type="button" className="p-4 rounded-xl text-slate-600 hover:text-white transition-colors"><Paperclip size={20} /></button>
                                            <input 
                                                required
                                                placeholder="COMMAND INPUT..."
                                                value={formData.content}
                                                onChange={(e) => setFormData({...formData, content: e.target.value})}
                                                className="flex-1 bg-transparent h-14 px-4 text-sm font-black text-white outline-none italic placeholder:text-slate-800 uppercase tracking-tighter"
                                            />
                                            <button type="button" className="p-4 rounded-xl text-slate-600 hover:text-white transition-colors"><Smile size={20} /></button>
                                            <button 
                                                type="submit"
                                                className="bg-brand-primary text-white p-4 rounded-xl shadow-lg shadow-brand-primary/20 hover:scale-105 transition-all group active:scale-95"
                                            >
                                                <Send size={20} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                                            </button>
                                        </form>
                                    </div>
                                </>
                            ) : (
                                <div className="h-full flex flex-col items-center justify-center p-20 text-center space-y-10 group">
                                    <div className="relative">
                                        <div className="w-32 h-32 rounded-full border-4 border-slate-800 border-t-brand-primary animate-spin"></div>
                                        <MessageSquare size={48} className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-slate-800 group-hover:text-brand-primary transition-colors duration-500" />
                                    </div>
                                    <div className="space-y-4">
                                        <h3 className="text-2xl font-black text-white uppercase italic tracking-tighter leading-none">INITIALIZE COMMS PROBE</h3>
                                        <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest leading-relaxed max-w-sm">Select a transmission endpoint from the encrypted archive to begin secured institutional relay.</p>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <div className="h-px w-8 bg-slate-800"></div>
                                        <div className="h-1.5 w-1.5 rounded-full bg-slate-800"></div>
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
                            <div className="bg-slate-900/40 border border-slate-800/60 rounded-[2.5rem] p-10 backdrop-blur-3xl relative overflow-hidden group shadow-2xl flex-1 flex flex-col min-h-0">
                                <div className="absolute top-0 right-0 w-80 h-80 bg-brand-primary/5 rounded-full blur-[120px] -mr-40 -mt-40 transition-transform group-hover:scale-110 duration-1000"></div>
                                
                                <div className="relative z-10 space-y-8 flex flex-col h-full">
                                    <div className="flex items-center justify-between">
                                        <h2 className="text-xl font-black text-white uppercase italic tracking-tight flex items-center gap-5">
                                            <Send className={`text-${activeTab === 'announcements' ? 'brand-primary' : 'emerald-500'}`} size={24} />
                                            New {activeTab === 'announcements' ? 'Broad Dispatch' : 'Public Notice'}
                                        </h2>
                                        <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest bg-slate-800/50 px-4 py-1.5 rounded-full border border-slate-700/50 italic">SECURE DISPATCH</div>
                                    </div>

                                    <form onSubmit={handleSend} className="space-y-8 flex-1 flex flex-col min-h-0 pr-2 custom-scrollbar overflow-y-auto">
                                        {activeTab === 'announcements' && (
                                            <div className="space-y-4">
                                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2 italic ml-1">
                                                    <Users size={12} className="text-brand-primary" /> Target Demographic
                                                </label>
                                                <div className="grid grid-cols-2 gap-4">
                                                    {['All', 'Student', 'Teacher', 'Parent'].map(role => (
                                                        <button
                                                            key={role}
                                                            type="button"
                                                            onClick={() => setFormData({...formData, targetRole: role})}
                                                            className={`py-4 rounded-2xl text-[11px] font-black uppercase tracking-widest border transition-all ${formData.targetRole === role ? 'bg-brand-primary/10 border-brand-primary text-brand-primary shadow-lg shadow-brand-primary/5 scale-[1.02]' : 'bg-slate-950/60 border-slate-800 text-slate-600 hover:border-slate-700'}`}
                                                        >
                                                            {role}
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        <div className="space-y-4">
                                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2 italic ml-1">
                                                <Bell size={12} className={`text-${activeTab === 'announcements' ? 'brand-primary' : 'emerald-500'}`} /> Subject Line
                                            </label>
                                            <input 
                                                required
                                                placeholder="ENTER TRANSMISSION HEADER..."
                                                value={formData.subject}
                                                onChange={(e) => setFormData({...formData, subject: e.target.value})}
                                                className={`w-full bg-slate-950/60 border border-slate-800 rounded-2xl p-6 text-white text-sm font-black uppercase tracking-tighter outline-none focus:border-${activeTab === 'announcements' ? 'brand-primary' : 'emerald-500'} transition-all placeholder:text-slate-800 italic`}
                                            />
                                        </div>

                                        <div className="space-y-4 flex-1 flex flex-col">
                                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2 italic ml-1">
                                                <MessageSquare size={12} className={`text-${activeTab === 'announcements' ? 'brand-primary' : 'emerald-500'}`} /> Signal Payload
                                            </label>
                                            <textarea 
                                                required
                                                placeholder="COMPOSE INSTITUTIONAL DIRECTIVE..."
                                                value={formData.content}
                                                onChange={(e) => setFormData({...formData, content: e.target.value})}
                                                className={`flex-1 w-full bg-slate-950/60 border border-slate-800 rounded-[2rem] p-8 text-white text-sm font-bold outline-none focus:border-${activeTab === 'announcements' ? 'brand-primary' : 'emerald-500'} transition-all placeholder:text-slate-800 italic resize-none uppercase tracking-tighter`}
                                            />
                                        </div>

                                        <button 
                                            type="submit"
                                            className={`w-full py-6 rounded-2xl flex items-center justify-center gap-4 text-[14px] font-black uppercase tracking-[0.3em] transition-all shadow-2xl active:scale-95 group ${activeTab === 'announcements' ? 'bg-brand-primary text-white shadow-brand-primary/20 hover:bg-brand-primary/90' : 'bg-emerald-500 text-white shadow-emerald-500/20 hover:bg-emerald-600'}`}
                                        >
                                            <Send size={22} className="group-hover:-translate-y-1 group-hover:translate-x-1 transition-transform" />
                                            INITIALIZE SIGNAL
                                        </button>
                                    </form>
                                </div>
                            </div>
                        </div>

                        {/* Archive Section */}
                        <div className="lg:col-span-7 flex flex-col min-h-0 space-y-8">
                            <div className="flex items-center justify-between shrink-0 px-2">
                                <div className="flex items-center gap-5">
                                    <h3 className="text-sm font-black text-white uppercase tracking-widest flex items-center gap-4 italic leading-none">
                                        <div className={`p-2 rounded-xl bg-${activeTab === 'announcements' ? 'brand-primary' : 'emerald-500'}/10 border border-${activeTab === 'announcements' ? 'brand-primary' : 'emerald-500'}/20`}>
                                            <Filter size={20} className={`text-${activeTab === 'announcements' ? 'brand-primary' : 'emerald-500'}`} />
                                        </div>
                                        ACTIVE TRANSMISSION ARCHIVE
                                    </h3>
                                    <span className="bg-slate-900 border border-slate-800 text-slate-500 text-[9px] font-black px-4 py-1.5 rounded-full tracking-widest italic group-hover:text-white transition-colors cursor-default">
                                        {activeTab === 'announcements' ? announcements.length : notices.length} RECORDS LOGGED
                                    </span>
                                </div>
                                <button onClick={fetchData} className="group flex items-center gap-3 text-[10px] font-black text-slate-600 uppercase tracking-widest hover:text-white transition-all italic">
                                    SYNCHRONIZE FEED <ArrowUpRight size={14} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
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
                                            className={`bg-slate-900/30 border border-slate-800/60 rounded-[2.5rem] p-10 hover:border-white/20 transition-all group relative overflow-hidden backdrop-blur-2xl shadow-xl ${activeTab === 'notices' ? 'border-l-4 border-l-emerald-500/40' : 'border-l-4 border-l-brand-primary/40'}`}
                                        >
                                            <div className="absolute top-0 right-0 w-40 h-40 bg-white/[0.02] rounded-full -mr-20 -mt-20"></div>
                                            
                                            <div className="flex flex-col md:flex-row justify-between items-start gap-6 mb-8 relative z-10">
                                                <div className="flex items-center gap-6">
                                                    <div className={`w-16 h-16 rounded-[1.5rem] flex items-center justify-center border border-white/5 shadow-2xl ${activeTab === 'announcements' ? 'bg-brand-primary/10 text-brand-primary shadow-brand-primary/5' : 'bg-emerald-500/10 text-emerald-500 shadow-emerald-500/5'}`}>
                                                        {activeTab === 'announcements' ? <Megaphone size={30} /> : <Layout size={30} />}
                                                    </div>
                                                    <div>
                                                        <h4 className="text-white font-black text-2xl uppercase tracking-tighter italic leading-none mb-2">{item.subject}</h4>
                                                        <div className="flex items-center gap-4">
                                                            <span className={`text-[10px] font-black uppercase tracking-widest px-4 py-1.5 rounded-xl border italic shadow-inner ${activeTab === 'announcements' ? 'text-brand-primary bg-brand-primary/5 border-brand-primary/10' : 'text-emerald-400 bg-emerald-500/5 border-emerald-500/10'}`}>
                                                                {activeTab === 'announcements' ? `TARGET: ${item.targetRole}` : 'GLOBAL BULLETIN'}
                                                            </span>
                                                            <div className="flex items-center gap-2 text-[10px] font-bold text-slate-600 uppercase tracking-widest italic bg-slate-950/50 px-3 py-1.5 rounded-xl border border-white/5">
                                                                <Calendar size={12} className="text-slate-700" /> {new Date(item.createdAt).toLocaleDateString()}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                                <button onClick={() => handleDelete(item._id)} className="p-4 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-center text-slate-700 hover:text-rose-500 hover:border-rose-500/30 transition-all opacity-0 group-hover:opacity-100 shadow-2xl active:scale-90">
                                                    <Trash2 size={20} />
                                                </button>
                                            </div>
                                            
                                            <p className="text-slate-400 text-sm lg:text-base leading-relaxed font-bold italic border-l-4 border-slate-800/80 pl-8 mb-8 relative z-10 max-w-4xl uppercase tracking-tighter opacity-90">{item.content}</p>
                                            
                                            <div className="flex items-center justify-between text-[11px] font-black uppercase tracking-[0.2em] text-slate-600 italic relative z-10 pt-6 border-t border-white/[0.03]">
                                                <div className="flex items-center gap-3">
                                                    <div className={`w-2 h-2 rounded-full ${activeTab === 'announcements' ? 'bg-brand-primary' : 'bg-emerald-500'} animate-pulse`}></div>
                                                    <span>AUTHORITY: {item.sender?.firstName} {item.sender?.lastName} [ADMIN]</span>
                                                </div>
                                                <span className={activeTab === 'announcements' ? 'text-brand-primary/60' : 'text-emerald-400/60'}>
                                                    {activeTab === 'announcements' ? 'Institutional Broadcast Protcol' : 'Public Domain Bulletin Relay'}
                                                </span>
                                            </div>
                                        </motion.div>
                                    ))}
                                </AnimatePresence>

                                {loading && (
                                    <div className="flex flex-col items-center justify-center py-20 space-y-6">
                                        <div className="relative">
                                            <div className="w-16 h-16 border-4 border-brand-primary/20 rounded-full animate-ping"></div>
                                            <div className="absolute inset-0 w-16 h-16 border-4 border-brand-primary border-t-transparent rounded-full animate-spin"></div>
                                        </div>
                                        <span className="text-[12px] font-black uppercase tracking-[0.5em] text-slate-500 italic animate-pulse">Syncing Signal Archive...</span>
                                    </div>
                                )}

                                {!loading && (activeTab === 'announcements' ? announcements.length === 0 : notices.length === 0) && (
                                    <div className="bg-slate-900/20 border border-dashed border-slate-800 rounded-[3rem] p-32 flex flex-col items-center text-center space-y-8 animate-pulse">
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

