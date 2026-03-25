import React, { useState, useEffect } from 'react';
import {
    Megaphone,
    Layout,
    Calendar,
    Search,
    ArrowUpRight,
    AlertCircle,
    User,
    CheckCircle
} from 'lucide-react';
import axiosInstance from '../../utils/axiosInstance';
import { motion, AnimatePresence } from 'framer-motion';

const Announcements = () => {
    const [activeTab, setActiveTab] = useState('announcements');
    const [announcements, setAnnouncements] = useState([]);
    const [notices, setNotices] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        fetchData();
    }, [activeTab]);

    const fetchData = async () => {
        setLoading(true);
        try {
            const url = activeTab === 'announcements' ? '/announcements' : '/notices';
            const res = await axiosInstance.get(url);
            if (activeTab === 'announcements') setAnnouncements(res.data);
            else setNotices(res.data);
        } catch (err) {
            console.error('Signal sync failed');
        } finally {
            setLoading(false);
        }
    };

    const displayItems = (activeTab === 'announcements' ? announcements : notices).filter(item =>
        item.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.content.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-8 max-w-7xl mx-auto flex flex-col min-h-[calc(100vh-160px)]"
        >
            <header className="flex flex-col md:flex-row md:items-end justify-between gap-8 px-2">
                <div className="space-y-3">
                    <h1 className="text-4xl font-black text-white italic uppercase tracking-tighter leading-none font-outfit">Transit Bulletins</h1>
                    <p className="text-slate-500 font-medium text-lg italic mt-1 leading-none">Sector-wide broadcast archive and logistics directives.</p>
                </div>

                <div className="flex bg-neutral-900/50 p-1 rounded-md border border-slate-800/60 shadow-2xl">
                    <button
                        onClick={() => setActiveTab('announcements')}
                        className={`flex items-center gap-3 px-8 py-3.5 rounded-md text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'announcements' ? 'bg-transporter-primary text-white shadow-xl' : 'text-slate-500 hover:text-slate-300'}`}
                    >
                        <Megaphone size={16} /> Broadcasts
                    </button>
                    <button
                        onClick={() => setActiveTab('notices')}
                        className={`flex items-center gap-3 px-8 py-3.5 rounded-md text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'notices' ? 'bg-transporter-primary text-white shadow-xl' : 'text-slate-500 hover:text-slate-300'}`}
                    >
                        <Layout size={16} /> Notices
                    </button>
                </div>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start flex-1 min-h-0">
                {/* Information Hub */}
                <div className="lg:col-span-4 space-y-6 lg:sticky lg:top-24">
                    <div className="bg-neutral-900 border border-slate-800/60 p-8 rounded-md shadow-2xl space-y-8">
                        <div>
                            <h3 className="text-sm font-black text-white uppercase tracking-widest mb-6 flex items-center gap-3">
                                <span className="w-8 h-px bg-orange-600"></span> Search Logic
                            </h3>
                            <div className="relative group">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-700 group-focus-within:text-orange-500 transition-colors" size={18} />
                                <input
                                    type="text"
                                    placeholder="SCAN BROADCASTS..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full bg-neutral-950/50 border border-slate-800 h-14 pl-12 pr-6 rounded-md text-[10px] font-black uppercase tracking-[0.2em] text-white outline-none focus:border-orange-500 placeholder:text-slate-800 italic transition-all shadow-inner"
                                />
                            </div>
                        </div>

                        <div className="pt-8 border-t border-slate-800/50 space-y-4">
                            <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest italic leading-none">Terminal Status</h4>
                            <div className="flex items-center gap-3 text-transporter-primary text-[11px] font-bold italic leading-none">
                                <CheckCircle size={14} />
                                <span>Direct Link Active</span>
                            </div>
                        </div>
                    </div>

                    <div className="bg-gradient-to-br from-orange-500/10 to-transparent border border-orange-500/20 p-8 rounded-md shadow-2xl">
                        <h4 className="text-xs font-black text-transporter-primary uppercase tracking-[.2em] mb-4">Authority Protocol</h4>
                        <p className="text-slate-400 text-xs font-medium leading-relaxed italic opacity-80 font-outfit">
                            All broadcasts are cryptographically signed by institutional authority nodes. Notices are for global consumption within the transit sector.
                        </p>
                    </div>
                </div>

                {/* Feed Section */}
                <div className="lg:col-span-8 space-y-6">
                    <AnimatePresence mode="popLayout">
                        {loading ? (
                            <div className="py-40 flex flex-col items-center justify-center space-y-6">
                                <div className="w-12 h-12 border-4 border-orange-500/20 border-t-orange-500 rounded-md animate-spin shadow-[0_0_20px_rgba(249,115,22,0.2)]"></div>
                                <span className="text-[10px] font-black uppercase tracking-[0.5em] text-slate-500 italic animate-pulse font-outfit">Synchronizing feed...</span>
                            </div>
                        ) : displayItems.length > 0 ? (
                            displayItems.map((item, idx) => (
                                <motion.div
                                    key={item._id}
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: idx * 0.05 }}
                                    className={`bg-neutral-900 border-l-4 p-10 rounded-md shadow-2xl relative overflow-hidden group hover:bg-neutral-800 transition-all font-outfit ${activeTab === 'announcements' ? 'border-l-orange-500 border-slate-800/40' : 'border-l-transporter-primary border-slate-800/40'}`}
                                >
                                    <div className="absolute top-0 right-0 p-8 opacity-[0.03] group-hover:opacity-[0.08] transition-opacity">
                                        {activeTab === 'announcements' ? <Megaphone size={120} /> : <Layout size={120} />}
                                    </div>

                                    <div className="relative z-10 flex flex-col md:flex-row justify-between items-start gap-6 mb-8">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-4 mb-4">
                                                <span className={`px-4 py-1.5 rounded-md text-[9px] font-black uppercase tracking-widest border ${activeTab === 'announcements' ? 'bg-orange-500/10 text-orange-500 border-orange-500/20' : 'bg-transporter-primary/10 text-transporter-primary border-transporter-primary/20'}`}>
                                                    {activeTab === 'announcements' ? 'Institutional Broadcast' : 'Sector Notice'}
                                                </span>
                                                <div className="flex items-center gap-2 text-[10px] font-bold text-slate-500 uppercase tracking-widest italic bg-neutral-950 px-3 py-1.5 rounded-md border border-slate-800/60">
                                                    <Calendar size={12} /> {new Date(item.createdAt).toLocaleDateString()}
                                                </div>
                                            </div>
                                            <h3 className="text-2xl font-black text-white italic tracking-tighter uppercase leading-none">{item.subject}</h3>
                                        </div>
                                        <div className="shrink-0 flex items-center gap-3 bg-neutral-950/40 px-4 py-2 rounded-md border border-slate-800/60">
                                            <div className="w-8 h-8 rounded-md bg-neutral-950 border border-slate-800 overflow-hidden">
                                                {item.sender?.photo ? <img src={item.sender.photo} alt="" className="w-full h-full object-cover" /> : <User className="w-full h-full p-2 text-slate-600" />}
                                            </div>
                                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest italic">{item.sender?.firstName || 'Faculty'}</span>
                                        </div>
                                    </div>

                                    <div className="relative z-10 border-l-2 border-slate-800/80 pl-8 mb-8">
                                        <p className="text-slate-400 text-lg leading-relaxed font-medium italic uppercase tracking-tighter opacity-90">{item.content}</p>
                                    </div>

                                    <div className="relative z-10 flex items-center justify-between pt-6 border-t border-slate-800/50">
                                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-600 italic">Directive Log Entry #{item._id.slice(-6).toUpperCase()}</span>
                                        <button className="flex items-center gap-3 text-[10px] font-black text-slate-400 uppercase tracking-widest hover:text-white transition-all italic group/btn leading-none">
                                            Acknowledge Protocol <ArrowUpRight size={14} className="group-hover/btn:translate-x-1 group-hover/btn:-translate-y-1 transition-transform" />
                                        </button>
                                    </div>
                                </motion.div>
                            ))
                        ) : (
                            <div className="py-40 text-center bg-neutral-900/40 rounded-md border border-slate-800/50 border-dashed">
                                <AlertCircle size={64} className="text-slate-800 mx-auto mb-8 opacity-20" />
                                <h3 className="text-xl font-black text-slate-600 uppercase tracking-[0.3em] font-outfit mb-2 grayscale opacity-40">Sector Depleted</h3>
                                <p className="text-slate-700 text-[10px] font-bold uppercase tracking-widest opacity-40">No active transmissions detected in this archive.</p>
                            </div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </motion.div>
    );
};

export default Announcements;
