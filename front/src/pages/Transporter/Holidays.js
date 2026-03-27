import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchHolidays, clearError } from '../../redux/slice/schoolAdmin.slice';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, Clock, MapPin, Search, Activity, ArrowRight } from 'lucide-react';
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
            toast.error(error);
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
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="pb-20 max-w-7xl mx-auto space-y-8">
            <header className="relative mb-8 group px-2 font-outfit">
                <div className="absolute -top-6 -left-6 w-48 h-48 bg-transporter-primary/10 rounded-md blur-[80px] opacity-40 group-hover:opacity-70 transition-opacity duration-1000"></div>
                
                <div className="relative z-10 bg-neutral-900/40 backdrop-blur-2xl border border-white/5 rounded-md p-1 shadow-xl overflow-hidden">
                    <div className="bg-neutral-950/40 rounded-md px-8 py-10 flex flex-col xl:flex-row xl:items-center justify-between gap-8">
                        <div className="space-y-4 max-w-xl">
                            <div className="flex items-center gap-2">
                                <div className="px-3 py-1 rounded-md bg-neutral-900/80 border border-white/10 flex items-center gap-1.5 backdrop-blur-md shadow-md">
                                    <div className="w-1.5 h-1.5 rounded-md bg-transporter-primary animate-ping"></div>
                                    <span className="text-[9px] font-black uppercase tracking-[0.2em] text-white/60 font-outfit">Holiday Schedule</span>
                                </div>
                            </div>

                            <div className="space-y-3">
                                <h1 className="text-3xl md:text-5xl font-extrabold text-white italic uppercase tracking-tighter leading-tight font-outfit pr-6">
                                    School <br />
                                    <span className="text-transporter-primary">Holidays</span>
                                </h1>
                                <p className="text-slate-500 font-medium text-xs md:text-sm max-w-md leading-normal italic tracking-wide opacity-80">
                                    Official list of school holidays. Use this to plan transport operations and vehicle maintenance.
                                </p>
                            </div>

                            {nextHoliday && (
                                <div className="flex items-center gap-4 pt-1">
                                    <div className="flex -space-x-2">
                                        {[1,2].map(i => (
                                            <div key={i} className="w-7 h-7 rounded-md border border-neutral-800 bg-neutral-900 shadow-md"></div>
                                        ))}
                                    </div>
                                    <div className="space-y-0.5">
                                        <p className="text-[10px] font-bold text-white uppercase tracking-wider leading-none">
                                            {nextHoliday.title} <span className="text-transporter-primary italic ml-1">in {Math.ceil((new Date(nextHoliday.startDate) - new Date()) / (1000 * 60 * 60 * 24))} Days</span>
                                        </p>
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="flex flex-col sm:flex-row items-center gap-4 self-stretch xl:self-center font-outfit">
                            <div className="relative group w-full sm:w-80">
                                <Search size={16} className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-transporter-primary transition-colors" />
                                <input 
                                    type="text" 
                                    placeholder="Search for holiday..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full bg-neutral-950/60 border border-white/10 h-14 pl-12 pr-6 rounded-md text-[12px] font-black uppercase tracking-widest outline-none focus:border-transporter-primary/40 focus:bg-neutral-950/80 transition-all text-white italic"
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-10 font-outfit">
                <AnimatePresence mode='popLayout'>
                    {filteredHolidays.map((holiday, idx) => (
                        <motion.div 
                            key={holiday._id}
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            transition={{ delay: idx * 0.08, duration: 0.5 }}
                            className="group relative"
                        >
                            <div className="relative bg-neutral-900/60 backdrop-blur-2xl border border-white/5 rounded-md p-1 shadow-2xl h-full overflow-hidden transition-all duration-500 group-hover:translate-y-[-8px] group-hover:border-transporter-primary/30">
                                <div className="bg-neutral-950/40 rounded-md p-6 space-y-4 h-full">
                                    <div className="flex items-start justify-between">
                                        <div className="flex flex-col items-center justify-center w-12 h-16 rounded-md bg-neutral-950 border border-white/10 shadow-lg group-hover:border-transporter-primary/50 transition-all duration-500 overflow-hidden relative">
                                            <div className="absolute top-0 left-0 w-full h-1.5 bg-transporter-primary"></div>
                                            <span className="text-transporter-primary text-[8px] font-black uppercase tracking-tighter opacity-80 mt-1">{new Date(holiday.startDate).toLocaleString('default', { month: 'short' })}</span>
                                            <span className="text-white text-xl font-black leading-tight">{new Date(holiday.startDate).getDate()}</span>
                                        </div>
                                    </div>

                                    <div className="space-y-3">
                                        <div>
                                            <div className="flex items-center gap-2 mb-1 opacity-60">
                                                <MapPin size={10} className="text-transporter-primary" />
                                                <span className="text-[8px] font-bold uppercase tracking-[0.3em] text-slate-400">School Event</span>
                                            </div>
                                            <h3 className="text-lg font-black text-white italic uppercase tracking-tighter group-hover:text-transporter-primary transition-colors duration-500 leading-tight">{holiday.title}</h3>
                                        </div>

                                        {holiday.description && (
                                            <div className="p-4 rounded-md bg-neutral-950 border border-white/5 group-hover:border-white/10 transition-colors">
                                                <p className="text-slate-400 text-[10px] font-medium leading-[1.5] italic opacity-80 line-clamp-3">{holiday.description}</p>
                                            </div>
                                        )}
                                    </div>

                                    <div className="pt-2 flex flex-col gap-3 mt-auto">
                                        <div className="flex items-center gap-2 px-4 py-2 rounded-md bg-neutral-950 border border-white/5 w-fit">
                                            <Clock size={10} className="text-transporter-primary" />
                                            <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest italic flex items-center gap-2">
                                                {new Date(holiday.startDate).toLocaleDateString()}
                                                <ArrowRight size={10} className="text-slate-600" />
                                                {new Date(holiday.endDate).toLocaleDateString()}
                                            </p>
                                        </div>
                                        
                                        <div className="flex items-center gap-3">
                                            <span className="h-1 w-1 rounded-md bg-emerald-500 animate-pulse shadow-[0_0_8px_#10b981]"></span>
                                            <span className="text-[8px] font-bold text-slate-500 uppercase tracking-[0.2em]">Official Holiday</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </AnimatePresence>

                {filteredHolidays.length === 0 && (
                    <div className="col-span-full py-40 rounded-md bg-neutral-900/20 border-2 border-dashed border-white/5 flex flex-col items-center justify-center gap-6">
                        <Activity size={40} className="text-slate-700 opacity-30 animate-pulse" />
                        <div className="text-center space-y-2">
                            <h4 className="text-slate-500 font-black uppercase tracking-[0.6em] text-xs italic">No Holidays Found</h4>
                            <p className="text-slate-600 text-[10px] font-bold uppercase tracking-widest opacity-40">No holidays found for the current period.</p>
                        </div>
                    </div>
                )}
            </div>
        </motion.div>
    );
};

export default Holidays;
