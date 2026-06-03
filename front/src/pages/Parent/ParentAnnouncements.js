import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { 
    Megaphone, 
    Layout, 
    Calendar, 
    Search, 
    ArrowUpRight,
    AlertCircle,
    User,
    CheckCircle,
    Bell
} from 'lucide-react';
import axiosInstance from '../../utils/axiosInstance';
import { motion, AnimatePresence } from 'framer-motion';

const ParentAnnouncements = () => {
    const [activeTab, setActiveTab] = useState('announcements');
    const [announcements, setAnnouncements] = useState([]);
    const [notices, setNotices] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

    const { activeAcademicYearId } = useSelector(state => state.academicYear || {});

    useEffect(() => {
        fetchData();
    }, [activeTab, activeAcademicYearId]);

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
            <header className="flex flex-col md:flex-row md:items-end justify-between gap-8">
                <div className="space-y-3">
                    <div className="flex items-center gap-3">
                        <span className="w-8 h-[2px] bg-parent-primary rounded-full"></span>
                        <span className="text-[10px] font-black uppercase tracking-[0.4em] text-parent-primary">Guardian Intel</span>
                    </div>
                    <h1 className="text-4xl font-black text-white italic uppercase tracking-tighter leading-none font-outfit">Bulletin Port</h1>
                    <p className="text-slate-500 font-medium text-lg italic">Sector-wide broadcast archive and institutional notices.</p>
                </div>
                
                <div className="flex bg-[#0f0f12] p-1 rounded-md border border-slate-800/60 shadow-2xl backdrop-blur-xl">
                    <button 
                        onClick={() => setActiveTab('announcements')}
                        className={`flex items-center gap-3 px-8 py-3.5 rounded-md text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'announcements' ? 'bg-parent-primary text-white shadow-xl shadow-parent-primary/20' : 'text-slate-500 hover:text-slate-200'}`}
                    >
                        <Megaphone size={16} /> Broadcasts
                    </button>
                    <button 
                        onClick={() => setActiveTab('notices')}
                        className={`flex items-center gap-3 px-8 py-3.5 rounded-md text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'notices' ? 'bg-slate-800 text-white shadow-xl' : 'text-slate-500 hover:text-slate-200'}`}
                    >
                        <Layout size={16} /> Notices
                    </button>
                </div>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start flex-1 min-h-0">
                {/* Information Hub */}
                <div className="lg:col-span-4 space-y-6 lg:sticky lg:top-24">
                    <div className="bg-[#0f0f12] border border-slate-800/60 p-8 rounded-md shadow-2xl space-y-8">
                        <div>
                            <h3 className="text-sm font-black text-white uppercase tracking-widest mb-6 flex items-center gap-3">
                                <span className="w-8 h-px bg-parent-primary"></span> Filter Archive
                            </h3>
                            <div className="relative group">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-700 group-focus-within:text-parent-primary transition-colors" size={18} />
                                <input 
                                    type="text"
                                    placeholder="SCAN KEYWORDS..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full bg-slate-950/50 border border-slate-800 h-14 pl-12 pr-6 rounded-md text-[10px] font-black uppercase tracking-[0.2em] text-white outline-none focus:border-parent-primary placeholder:text-slate-800 italic transition-all shadow-inner"
                                />
                            </div>
                        </div>

                        <div className="pt-8 border-t border-slate-800/50 space-y-4">
                            <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest italic">Signal Status</h4>
                            <div className="flex items-center gap-3 text-parent-primary text-[11px] font-bold italic">
                                <Bell size={14} className="animate-pulse" />
                                <span>Secured Guardian Stream</span>
                            </div>
                        </div>
                    </div>

                    <div className="bg-gradient-to-br from-parent-primary/10 to-transparent border border-parent-primary/20 p-8 rounded-md shadow-2xl">
                        <h4 className="text-xs font-black text-parent-primary uppercase tracking-[.2em] mb-4">Verification Node</h4>
                        <p className="text-slate-400 text-xs font-medium leading-relaxed italic">
                            Institutional broadcasts are authenticated by the school administration board. Notices are specific to your ward's grade sector.
                        </p>
                    </div>
                </div>

                {/* Feed Section */}
                <div className="lg:col-span-8 space-y-6">
                    <AnimatePresence mode="popLayout">
                        {loading ? (
                            <div className="py-40 flex flex-col items-center justify-center space-y-6">
                                <div className="w-12 h-12 border-4 border-parent-primary/20 border-t-rose-500 rounded-md animate-spin shadow-[0_0_20px_rgba(244,63,94,0.2)]"></div>
                                <span className="text-[10px] font-black uppercase tracking-[0.5em] text-slate-500 italic animate-pulse">Synchronizing feed...</span>
                            </div>
                        ) : displayItems.length > 0 ? (
                            displayItems.map((item, idx) => (
                                <motion.div 
                                    key={item._id}
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: idx * 0.05 }}
                                    className={`bg-[#0f0f12] border-l-4 p-10 rounded-md shadow-2xl relative overflow-hidden group hover:bg-slate-800/20 transition-all ${activeTab === 'announcements' ? 'border-l-rose-500 border-slate-800/40' : 'border-l-indigo-500 border-slate-800/40'}`}
                                >
                                    <div className="absolute top-0 right-0 p-8 opacity-[0.03] group-hover:opacity-[0.08] transition-opacity">
                                        {activeTab === 'announcements' ? <Megaphone size={120} /> : <Layout size={120} />}
                                    </div>
                                    
                                    <div className="relative z-10 flex flex-col md:flex-row justify-between items-start gap-6 mb-8">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-4 mb-4">
                                                <span className={`px-4 py-1.5 rounded-md text-[9px] font-black uppercase tracking-widest border ${activeTab === 'announcements' ? 'bg-parent-primary/10 text-parent-primary border-parent-primary/20' : 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20'}`}>
                                                    {activeTab === 'announcements' ? 'Institutional Broadcast' : 'Public Notice'}
                                                </span>
                                                <div className="flex items-center gap-2 text-[10px] font-bold text-slate-500 uppercase tracking-widest italic bg-slate-950/50 px-3 py-1.5 rounded-md border border-slate-800/60">
                                                    <Calendar size={12} /> {new Date(item.createdAt).toLocaleDateString()}
                                                </div>
                                            </div>
                                            <h3 className="text-2xl font-black text-white italic tracking-tighter uppercase font-outfit leading-none">{item.subject}</h3>
                                        </div>
                                        <div className="shrink-0 flex items-center gap-3 bg-slate-950/40 px-4 py-2 rounded-md border border-slate-800/60">
                                            <div className="w-8 h-8 rounded-md bg-slate-800 border border-slate-700/50 overflow-hidden">
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
                                        <button className="flex items-center gap-3 text-[10px] font-black text-slate-400 uppercase tracking-widest hover:text-white transition-all italic group/btn">
                                            Acknowledge Signal <ArrowUpRight size={14} className="group-hover/btn:translate-x-1 group-hover/btn:-translate-y-1 transition-transform" />
                                        </button>
                                    </div>
                                </motion.div>
                            ))
                        ) : (
                            <div className="py-40 text-center bg-[#0f0f12]/40 rounded-md border border-slate-800/50 border-dashed">
                                <AlertCircle size={64} className="text-slate-800 mx-auto mb-8 opacity-20" />
                                <h3 className="text-xl font-black text-slate-600 uppercase tracking-[0.3em] font-outfit mb-2">Signal Depleted</h3>
                                <p className="text-slate-700 text-xs font-bold uppercase tracking-widest">No active transmissions detected for this guardian sector.</p>
                            </div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </motion.div>
    );
};

export default ParentAnnouncements;
