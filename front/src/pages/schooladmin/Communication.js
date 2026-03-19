import React, { useState, useEffect } from 'react';
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
    AlertCircle
} from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import axiosInstance from '../../utils/axiosInstance';
import { toast } from 'react-hot-toast';

const Communication = () => {
    const [activeTab, setActiveTab] = useState('announcements'); // 'announcements' or 'messages'
    const [announcements, setAnnouncements] = useState([]);
    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(false);
    
    // Form states
    const [formData, setFormData] = useState({
        targetRole: 'All',
        subject: '',
        content: '',
        recipient: '',
    });

    const teachers = useSelector(state => state.schoolAdmin.teachers);

    useEffect(() => {
        fetchData();
    }, [activeTab]);

    const fetchData = async () => {
        setLoading(true);
        try {
            if (activeTab === 'announcements') {
                const res = await axiosInstance.get('/school-admin/announcements');
                setAnnouncements(res.data);
            } else {
                const res = await axiosInstance.get('/school-admin/messages');
                setMessages(res.data);
            }
        } catch (err) {
            toast.error('Failed to load data');
        } finally {
            setLoading(false);
        }
    };

    const handleSend = async (e) => {
        e.preventDefault();
        try {
            const url = activeTab === 'announcements' ? '/school-admin/announcements' : '/school-admin/messages';
            await axiosInstance.post(url, formData);
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
            toast.success('Redacted');
            fetchData();
        } catch (err) {
            toast.error('Failed to delete');
        }
    };

    return (
        <div className="min-h-screen bg-[#020617] text-slate-300 font-outfit p-8 selection:bg-brand-primary/30 selection:text-white">
            {/* Header Section */}
            <div className="max-w-[1600px] mx-auto mb-12">
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
                    <div className="space-y-4">
                        <div className="flex items-center gap-3">
                            <div className="h-[2px] w-12 bg-brand-primary rounded-full"></div>
                            <span className="text-[10px] font-black text-brand-primary uppercase tracking-[0.4em] italic">Information Distribution Engine</span>
                        </div>
                        <h1 className="text-5xl font-black text-white uppercase tracking-tighter italic leading-none">
                            COMMUNICATION <span className="text-brand-primary">HUB</span>
                        </h1>
                        <p className="text-slate-500 font-bold text-sm tracking-wider uppercase">Administrative dispatch and inter-institutional messaging system.</p>
                    </div>

                    <div className="flex bg-slate-900/50 p-1 rounded-2xl border border-slate-800/60 backdrop-blur-xl">
                        <button 
                            onClick={() => setActiveTab('announcements')}
                            className={`flex items-center gap-3 px-8 py-4 rounded-xl text-[12px] font-black uppercase tracking-widest transition-all ${activeTab === 'announcements' ? 'bg-brand-primary text-white shadow-lg shadow-brand-primary/20 scale-105' : 'text-slate-500 hover:text-slate-300'}`}
                        >
                            <Megaphone size={16} />
                            Announcements
                        </button>
                        <button 
                            onClick={() => setActiveTab('messages')}
                            className={`flex items-center gap-3 px-8 py-4 rounded-xl text-[12px] font-black uppercase tracking-widest transition-all ${activeTab === 'messages' ? 'bg-indigo-500 text-white shadow-lg shadow-indigo-500/20 scale-105' : 'text-slate-500 hover:text-slate-300'}`}
                        >
                            <Mail size={16} />
                            Direct Messages
                        </button>
                    </div>
                </div>
            </div>

            <div className="max-w-[1600px] mx-auto grid grid-cols-1 lg:grid-cols-12 gap-10">
                {/* Compose Section */}
                <div className="lg:col-span-5 space-y-8">
                    <div className="bg-slate-900/40 border border-slate-800/60 rounded-[2.5rem] p-10 backdrop-blur-3xl relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-brand-primary/5 rounded-full blur-[100px] -mr-32 -mt-32"></div>
                        
                        <div className="relative z-10 space-y-8">
                            <div className="flex items-center justify-between">
                                <h2 className="text-xl font-black text-white uppercase italic tracking-tight flex items-center gap-4">
                                    <Send className="text-brand-primary" size={20} />
                                    New {activeTab === 'announcements' ? 'Broad Dispatch' : 'Direct Probe'}
                                </h2>
                                <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest bg-slate-800/50 px-3 py-1 rounded-full border border-slate-700/50">Secure Channel</div>
                            </div>

                            <form onSubmit={handleSend} className="space-y-6">
                                {activeTab === 'announcements' ? (
                                    <div className="space-y-4">
                                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2 italic">
                                            <Users size={12} /> Target Demographic
                                        </label>
                                        <div className="grid grid-cols-2 gap-4">
                                            {['All', 'Student', 'Teacher', 'Parent'].map(role => (
                                                <button
                                                    key={role}
                                                    type="button"
                                                    onClick={() => setFormData({...formData, targetRole: role})}
                                                    className={`py-4 rounded-2xl text-[11px] font-black uppercase tracking-widest border transition-all ${formData.targetRole === role ? 'bg-brand-primary/10 border-brand-primary text-brand-primary' : 'bg-slate-900/60 border-slate-800 text-slate-500 hover:border-slate-700'}`}
                                                >
                                                    {role}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2 italic">
                                            <User size={12} /> Target Recipient
                                        </label>
                                        <select
                                            required
                                            value={formData.recipient}
                                            onChange={(e) => setFormData({...formData, recipient: e.target.value})}
                                            className="w-full bg-slate-900/60 border border-slate-800 rounded-2xl p-5 text-white text-sm font-bold outline-none focus:border-indigo-500 transition-all italic"
                                        >
                                            <option value="">Identify Educator</option>
                                            {teachers.map(t => (
                                                <option key={t.userId?._id || t.userId} value={t.userId?._id || t.userId}>{t.firstName} {t.lastName} (Educator)</option>
                                            ))}
                                        </select>
                                    </div>
                                )}

                                <div className="space-y-4">
                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2 italic">
                                        <Bell size={12} /> Subject Line
                                    </label>
                                    <input 
                                        required
                                        placeholder="Enter transmission subject..."
                                        value={formData.subject}
                                        onChange={(e) => setFormData({...formData, subject: e.target.value})}
                                        className="w-full bg-slate-900/60 border border-slate-800 rounded-2xl p-5 text-white text-sm font-bold outline-none focus:border-brand-primary transition-all placeholder:text-slate-700 italic"
                                    />
                                </div>

                                <div className="space-y-4">
                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2 italic">
                                        <MessageSquare size={12} /> Transmission Payload
                                    </label>
                                    <textarea 
                                        required
                                        rows={6}
                                        placeholder="Compose institutional directive..."
                                        value={formData.content}
                                        onChange={(e) => setFormData({...formData, content: e.target.value})}
                                        className="w-full bg-slate-900/60 border border-slate-800 rounded-2xl p-5 text-white text-sm font-bold outline-none focus:border-brand-primary transition-all placeholder:text-slate-700 italic resize-none"
                                    />
                                </div>

                                <button 
                                    type="submit"
                                    className={`w-full py-5 rounded-2xl flex items-center justify-center gap-3 text-[13px] font-black uppercase tracking-[0.2em] transition-all shadow-2xl active:scale-95 ${activeTab === 'announcements' ? 'bg-brand-primary text-white shadow-brand-primary/20 hover:bg-brand-primary/90' : 'bg-indigo-500 text-white shadow-indigo-500/20 hover:bg-indigo-600'}`}
                                >
                                    <Send size={18} />
                                    Initialize Dispatch
                                </button>
                            </form>
                        </div>
                    </div>
                </div>

                {/* Feed Section */}
                <div className="lg:col-span-7 space-y-8">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-4">
                            <h3 className="text-sm font-black text-white uppercase tracking-widest flex items-center gap-3 italic">
                                <Filter size={16} className="text-brand-primary" />
                                Active Archive
                            </h3>
                            <span className="bg-slate-800 text-slate-400 text-[10px] font-black px-3 py-1 rounded-full border border-slate-700/50">
                                {activeTab === 'announcements' ? announcements.length : messages.length} RECORDS
                            </span>
                        </div>
                        <button onClick={fetchData} className="text-[10px] font-black text-slate-500 uppercase tracking-widest hover:text-brand-primary transition-colors flex items-center gap-2 italic">
                            Refresh Feed <ArrowUpRight size={12} />
                        </button>
                    </div>

                    <div className="space-y-6 max-h-[1000px] overflow-y-auto pr-4 custom-scrollbar">
                        {activeTab === 'announcements' ? (
                            announcements.map((item) => (
                                <div key={item._id} className="bg-slate-900/30 border border-slate-800/60 rounded-[2rem] p-8 hover:border-brand-primary/20 transition-all group relative overflow-hidden">
                                    <div className="flex justify-between items-start mb-6">
                                        <div className="flex items-center gap-5">
                                            <div className="w-14 h-14 rounded-2xl bg-brand-primary/10 flex items-center justify-center text-brand-primary border border-brand-primary/20">
                                                <Megaphone size={24} />
                                            </div>
                                            <div>
                                                <h4 className="text-white font-black text-lg uppercase tracking-tight italic leading-tight mb-1">{item.subject}</h4>
                                                <div className="flex items-center gap-4">
                                                    <span className="text-[10px] font-black text-brand-primary uppercase tracking-widest bg-brand-primary/5 px-3 py-1 rounded-lg border border-brand-primary/10">TARGET: {item.targetRole}</span>
                                                    <span className="text-[10px] font-bold text-slate-600 uppercase tracking-widest flex items-center gap-2 italic">
                                                        <Calendar size={10} /> {new Date(item.createdAt).toLocaleDateString()}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                        <button onClick={() => handleDelete(item._id)} className="w-10 h-10 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-600 hover:text-luxury-rose hover:border-luxury-rose/30 transition-all opacity-0 group-hover:opacity-100">
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                    <p className="text-slate-400 text-sm leading-relaxed font-bold italic border-l-2 border-slate-800 pl-6 mb-4">{item.content}</p>
                                    <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest text-slate-600 italic">
                                        <span>Dispatched by: {item.sender?.firstName} {item.sender?.lastName} ({item.sender?.role})</span>
                                        <span className="text-brand-primary/60">Institutional Broadcast</span>
                                    </div>
                                </div>
                            ))
                        ) : (
                            messages.map((item) => {
                                const isSentByMe = item.sender?._id === item.sender?._id; // Placeholder logic
                                return (
                                    <div key={item._id} className={`bg-slate-900/30 border border-slate-800/60 rounded-[2rem] p-8 hover:border-indigo-500/20 transition-all group relative ${item.recipient ? 'border-l-4 border-l-indigo-500/40' : ''}`}>
                                        <div className="flex justify-between items-start mb-6">
                                            <div className="flex items-center gap-5">
                                                <div className="w-14 h-14 rounded-2xl bg-indigo-500/10 flex items-center justify-center text-indigo-500 border border-indigo-500/20 overflow-hidden">
                                                    {item.sender?.photo ? (
                                                        <img src={item.sender.photo} alt="" className="w-full h-full object-cover" />
                                                    ) : (
                                                        <User size={24} />
                                                    )}
                                                </div>
                                                <div>
                                                    <h4 className="text-white font-black text-lg uppercase tracking-tight italic leading-tight mb-1">{item.subject}</h4>
                                                    <div className="flex items-center gap-4">
                                                        <span className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">
                                                            FROM: {item.sender?.firstName} TO: {item.recipient?.firstName || 'ADMIN'}
                                                        </span>
                                                        <span className="text-[10px] font-bold text-slate-600 uppercase tracking-widest flex items-center gap-2 italic">
                                                            <Calendar size={10} /> {new Date(item.createdAt).toLocaleDateString()}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                            <button onClick={() => handleDelete(item._id)} className="w-10 h-10 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-600 hover:text-luxury-rose hover:border-luxury-rose/30 transition-all opacity-0 group-hover:opacity-100">
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                        <p className="text-slate-400 text-sm leading-relaxed font-bold italic border-l-2 border-slate-800 pl-6 mb-4">{item.content}</p>
                                        <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest text-slate-600 italic">
                                            <div className="flex items-center gap-2">
                                                <div className={`h-2 w-2 rounded-full ${item.isRead ? 'bg-slate-700' : 'bg-brand-primary animate-pulse'}`}></div>
                                                {item.isRead ? 'Archived' : 'Active Transmission'}
                                            </div>
                                            <span className="text-indigo-400/60">Encrypted Channel</span>
                                        </div>
                                    </div>
                                );
                            })
                        )}

                        {loading && (
                            <div className="flex flex-col items-center justify-center py-20 space-y-4">
                                <div className="w-12 h-12 border-4 border-brand-primary border-t-transparent rounded-full animate-spin"></div>
                                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-600">Synchronizing Archive...</span>
                            </div>
                        )}

                        {!loading && (activeTab === 'announcements' ? announcements.length === 0 : messages.length === 0) && (
                            <div className="bg-slate-900/20 border border-dashed border-slate-800 rounded-[2rem] p-20 flex flex-col items-center text-center space-y-6">
                                <AlertCircle size={48} className="text-slate-800" />
                                <div>
                                    <h4 className="text-slate-600 font-black text-xl uppercase italic tracking-widest">No Active Records Found</h4>
                                    <p className="text-slate-700 text-[10px] font-bold uppercase tracking-widest mt-2">The archive for this transmission channel is currently empty.</p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Communication;
