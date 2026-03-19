import React from 'react';
import { useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import { BookOpen, Users, ClipboardList, Activity, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const TeacherDashboard = () => {
    const { user } = useSelector((state) => state.auth);

    const quickStats = [
        { label: 'Classes', value: '04', icon: BookOpen, color: 'text-brand-primary' },
        { label: 'Students', value: '124', icon: Users, color: 'text-brand-secondary' },
        { label: 'Attendance', value: '98%', icon: ClipboardList, color: 'text-luxury-emerald' },
        { label: 'Submissions', value: '42', icon: Activity, color: 'text-brand-accent' },
    ];

    return (
        <div className="space-y-12">
            <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                    <h1 className="text-4xl font-black text-white italic uppercase tracking-tighter leading-none mb-4 font-outfit">Operation Center, <br/> {user?.firstName}</h1>
                    <p className="text-slate-500 font-medium text-lg leading-relaxed max-w-xl">Unified institutional terminal. Monitoring academic nodes across 04 sectors.</p>
                </div>
                <div className="flex gap-4">
                    <div className="bg-slate-800/40 border border-slate-700/50 p-6 rounded-[2rem] min-w-[160px]">
                        <p className="text-[10px] font-black uppercase tracking-[0.25em] text-slate-500 mb-2">Local Status</p>
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full bg-luxury-emerald animate-pulse"></div>
                          <span className="text-xl font-black uppercase text-white font-outfit">Operational</span>
                        </div>
                    </div>
                </div>
            </header>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                {quickStats.map((stat, idx) => (
                    <motion.div
                        key={stat.label}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.05 }}
                        className="bg-slate-900/40 border border-slate-800 p-8 rounded-[2.5rem] relative group hover:border-brand-primary/40 transition-all shadow-xl"
                    >
                        <stat.icon size={24} className={`${stat.color} mb-6 opacity-70 group-hover:opacity-100 transition-opacity`} />
                        <p className="text-[10px] font-black uppercase tracking-[0.25em] text-slate-500 mb-2 font-outfit">{stat.label}</p>
                        <p className="text-4xl font-black text-white font-outfit tracking-tighter">{stat.value}</p>
                        <div className="absolute top-8 right-8 w-2 h-2 rounded-full bg-slate-800 group-hover:bg-brand-primary transition-colors"></div>
                    </motion.div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-6">
                    <div className="flex items-center justify-between px-2">
                        <h3 className="text-xs font-black uppercase tracking-[0.3em] text-slate-500 font-outfit">Active Operations</h3>
                        <Link to="/teacher/classes" className="text-[10px] font-black uppercase tracking-widest text-brand-primary flex items-center gap-2 group italic">View All <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" /> </Link>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {[1, 2].map(id => (
                            <div key={id} className="bg-gradient-to-br from-slate-900 via-slate-900 to-brand-primary/5 p-8 rounded-[2.5rem] border border-slate-800/80 shadow-2xl relative overflow-hidden group">
                                <div className="absolute -top-10 -right-10 w-32 h-32 bg-brand-primary/10 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
                                <div className="flex items-start justify-between mb-8">
                                    <div className="w-12 h-12 rounded-2xl bg-slate-800 border border-slate-700/50 flex items-center justify-center font-black text-xl text-brand-primary font-outfit italic shadow-lg">0{id}</div>
                                    <span className="text-[10px] bg-slate-800 px-3 py-1 rounded-full font-black text-slate-400 uppercase tracking-widest border border-slate-700/50 italic">Sector Class</span>
                                </div>
                                <h4 className="text-2xl font-black text-white italic tracking-tighter uppercase font-outfit mb-2">Grade 10 - Section B</h4>
                                <p className="text-slate-500 text-sm font-medium mb-10 leading-relaxed">Assigned Subjects: <br/> Advanced Mathematics, Physics</p>
                                <div className="flex items-center gap-4">
                                  <Link to="/teacher/attendance" className="flex-1 py-3 text-center bg-brand-primary hover:bg-blue-600 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all shadow-lg active:scale-95">Attendance</Link>
                                  <Link to="/teacher/marks" className="flex-1 py-3 text-center bg-slate-800/80 hover:bg-slate-700 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border border-slate-700/50 active:scale-95 text-slate-300">Marks</Link>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="space-y-6">
                    <h3 className="text-xs font-black uppercase tracking-[0.3em] text-slate-500 font-outfit px-2">Telecommunication</h3>
                    <div className="bg-slate-900/60 border border-slate-800 p-8 rounded-[2.5rem] h-full shadow-2xl">
                        <div className="flex items-center gap-3 mb-8">
                          <div className="w-2 h-2 rounded-full bg-brand-primary animate-ping"></div>
                          <span className="text-[11px] font-black uppercase text-slate-400 tracking-widest italic">Broadcast Signals</span>
                        </div>
                        <div className="space-y-6">
                            {[1, 2, 3].map(msg => (
                                <div key={msg} className="p-5 bg-slate-800/30 rounded-2xl border border-slate-700/30 hover:border-brand-primary/30 transition-all cursor-pointer group">
                                    <p className="text-[9px] font-black text-brand-primary uppercase tracking-[0.3em] mb-2">Institutional Alert</p>
                                    <p className="text-[12px] font-bold text-slate-100 mb-1 group-hover:text-white transition-colors">Mid-term results updated for Grade 12...</p>
                                    <p className="text-[10px] text-slate-500 font-medium">Global Admin Profile • 2h ago</p>
                                </div>
                            ))}
                        </div>
                        <button className="w-full mt-10 py-4 bg-slate-800 hover:bg-slate-700 rounded-2xl text-[10px] font-black uppercase tracking-[0.4em] transition-all border border-slate-700/50 flex items-center justify-center gap-3">All Channels <ArrowRight size={14} /></button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TeacherDashboard;
