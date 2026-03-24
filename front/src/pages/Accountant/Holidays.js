import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchHolidays, clearError } from '../../redux/slice/schoolAdmin.slice';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, Search, Activity, Clock, MapPin, ArrowRight, ShieldCheck, Timer } from 'lucide-react';
import toast from 'react-hot-toast';

const Holidays = () => {
    const dispatch = useDispatch();
    const { holidays, loading, error } = useSelector((state) => state.schoolAdmin);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        dispatch(fetchHolidays());
    }, [dispatch]);

    useEffect(() => {
        if (error) {
            toast.error(error?.message || String(error));
            dispatch(clearError());
        }

    }, [error, dispatch]);

    const filteredHolidays = holidays.filter(h => 
        h.title.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const getNextHoliday = () => {
        const future = holidays
            .filter(h => new Date(h.startDate) > new Date())
            .sort((a, b) => new Date(a.startDate) - new Date(b.startDate))[0];
        return future;
    };

    const nextHoliday = getNextHoliday();

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-12 pb-20">
            {/* Ultra Premium Header */}
            <header className="relative group">
                <div className="absolute -top-12 -left-12 w-64 h-64 bg-accountant-primary/10 rounded-full blur-[100px] opacity-40 group-hover:opacity-60 transition-opacity duration-1000"></div>
                
                <div className="relative z-10 bg-slate-900/40 backdrop-blur-3xl border border-white/5 rounded-md p-1 shadow-2xl overflow-hidden shadow-accountant-primary/5">
                    <div className="bg-slate-950/40 rounded-md px-10 py-12 flex flex-col xl:flex-row xl:items-center justify-between gap-10">
                        
                        <div className="space-y-6 max-w-2xl">
                            <div className="flex items-center gap-3">
                                <div className="h-[2px] w-12 bg-accountant-primary rounded-md"></div>
                                <span className="text-[10px] font-black text-accountant-primary uppercase tracking-[0.45em] italic leading-none">Institutional Operations</span>
                            </div>

                            <div className="space-y-4">
                                <h1 className="text-5xl md:text-6xl font-black text-white italic uppercase tracking-tighter leading-none font-outfit">
                                    Temporal <span className="text-accountant-primary">Audit</span> <br />
                                    Break Matrix
                                </h1>
                                <p className="text-slate-500 font-bold text-xs md:text-sm max-w-md leading-relaxed italic tracking-[0.05em] opacity-80 uppercase">
                                    System-wide synchronization of fiscal downtime and academic holiday protocols.
                                </p>
                            </div>

                            {nextHoliday && (
                                <div className="flex items-center gap-6 pt-2">
                                    <div className="flex items-center justify-center w-14 h-14 bg-accountant-primary/10 border border-accountant-primary/20 rounded-md animate-pulse">
                                         <Timer size={24} className="text-accountant-primary" />
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest italic">Upcoming Fiscal Suspension</p>
                                        <p className="text-lg font-black text-white font-outfit uppercase tracking-tight italic">
                                            {nextHoliday.title} <span className="text-accountant-primary ml-2">— IN {Math.ceil((new Date(nextHoliday.startDate) - new Date()) / (1000 * 60 * 60 * 24))} DAYS</span>
                                        </p>
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="flex flex-col sm:flex-row items-center gap-4 self-stretch xl:self-center">
                            <div className="relative group w-full sm:w-80">
                                <Search size={20} className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-600 group-focus-within:text-accountant-primary transition-colors" />
                                <input 
                                    type="text" 
                                    placeholder="Search Institutional Breaks..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full bg-slate-900 border border-slate-800/60 h-16 pl-14 pr-6 rounded-md text-[12px] font-black uppercase tracking-widest outline-none focus:border-accountant-primary/40 focus:bg-slate-950 transition-all text-white italic font-outfit shadow-inner"
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </header>

            {/* Matrix of Holidays */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
                <AnimatePresence mode='popLayout'>
                    {filteredHolidays.map((holiday, idx) => (
                        <motion.div 
                            key={holiday._id}
                            initial={{ opacity: 0, scale: 0.95, filter: 'blur(10px)' }}
                            animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
                            exit={{ opacity: 0, scale: 0.9, filter: 'blur(10px)' }}
                            transition={{ delay: idx * 0.05, duration: 0.4 }}
                            className="group relative"
                        >
                            <div className="absolute -inset-[2px] bg-gradient-to-br from-accountant-primary/20 to-transparent rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                            
                            <div className="relative bg-slate-900/40 backdrop-blur-2xl border border-slate-800/60 rounded-md p-1 shadow-2xl h-full overflow-hidden transition-all duration-500 group-hover:-translate-y-2 group-hover:border-accountant-primary/30">
                                <div className="bg-slate-950/40 rounded-md p-6 space-y-6 h-full flex flex-col justify-between">
                                    <div className="space-y-6">
                                        <div className="flex items-start justify-between">
                                            <div className="flex items-center gap-4">
                                                <div className="w-14 h-16 rounded-md bg-slate-900 border border-slate-800 shadow-xl flex flex-col items-center justify-center group-hover:border-accountant-primary transition-colors">
                                                    <span className="text-[10px] font-black text-accountant-primary uppercase italic">{new Date(holiday.startDate).toLocaleString('default', { month: 'short' })}</span>
                                                    <span className="text-2xl font-black text-white leading-none font-outfit italic">{new Date(holiday.startDate).getDate()}</span>
                                                </div>
                                                <div className="space-y-1">
                                                    <div className="flex items-center gap-2 opacity-50">
                                                        <ShieldCheck size={10} className="text-accountant-primary" />
                                                        <span className="text-[9px] font-black uppercase tracking-[0.3em] text-slate-500">Verified Protocol</span>
                                                    </div>
                                                    <h3 className="text-xl font-black text-white italic uppercase tracking-tighter font-outfit group-hover:text-accountant-primary transition-colors leading-tight line-clamp-1">{holiday.title}</h3>
                                                </div>
                                            </div>
                                        </div>

                                        {holiday.description && (
                                            <div className="p-4 rounded-md bg-slate-900/40 border border-slate-800/40 shadow-inner group-hover:bg-slate-900/60 transition-colors">
                                                <p className="text-slate-500 text-[11px] font-bold leading-relaxed italic line-clamp-2 uppercase tracking-tight">{holiday.description}</p>
                                            </div>
                                        )}
                                    </div>

                                    <div className="space-y-4 pt-2">
                                        <div className="flex items-center gap-3 px-4 py-2.5 rounded-md bg-slate-900 border border-slate-800/80 w-full group-hover:border-accountant-primary/20 transition-colors shadow-inner">
                                            <Clock size={12} className="text-accountant-primary" />
                                            <div className="flex items-center gap-3 text-[10px] font-black text-slate-400 uppercase tracking-widest italic leading-none">
                                                {new Date(holiday.startDate).toLocaleDateString()}
                                                <ArrowRight size={10} className="text-slate-700" />
                                                {new Date(holiday.endDate).toLocaleDateString()}
                                            </div>
                                        </div>
                                        
                                        <div className="flex items-center gap-3 ml-1">
                                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.5)]"></div>
                                            <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest italic leading-none">Status: Operational Break</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </AnimatePresence>

                {filteredHolidays.length === 0 && (
                    <div className="col-span-full py-40 rounded-md bg-slate-900/20 border-2 border-dashed border-slate-800/40 flex flex-col items-center justify-center gap-8 group">
                        <div className="w-24 h-24 rounded-md bg-slate-900 flex items-center justify-center border border-slate-800/50 group-hover:scale-110 transition-transform duration-700 shadow-3xl">
                            <Activity size={40} className="text-slate-700 opacity-20 animate-pulse" />
                        </div>
                        <div className="text-center space-y-3">
                            <h4 className="text-slate-400 font-black uppercase tracking-[0.6em] text-sm italic font-outfit">Identity Void</h4>
                            <p className="text-slate-600 text-[10px] font-bold uppercase tracking-widest italic">Zero temporal break protocols detected in sector active range</p>
                        </div>
                    </div>
                )}
            </div>
        </motion.div>
    );
};

export default Holidays;
