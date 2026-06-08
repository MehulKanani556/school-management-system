import React, { useEffect, useState, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchHolidays, createHoliday, updateHoliday, deleteHoliday, clearError } from '../../redux/slice/schoolAdmin.slice';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, Plus, Edit2, Trash2, X, Save, Clock, Info, Search, Activity, Sparkles, MapPin, AlertCircle, ArrowRight, Hourglass, Shield, ShieldCheck, Bookmark, Compass, Sun, Flame, CloudSnow } from 'lucide-react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import toast from 'react-hot-toast';
import PortalModal from '../../components/PortalModal';

const Holidays = () => {
    const dispatch = useDispatch();
    const { holidays, loading, error } = useSelector((state) => state.schoolAdmin);
    const { activeAcademicYearId } = useSelector((state) => state.academicYear);
    const { user } = useSelector((state) => state.auth);
    const isAdmin = user?.role === 'School_Admin';

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingHoliday, setEditingHoliday] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [activeFilter, setActiveFilter] = useState('All'); // 'All', 'National', 'Festive', 'Academic'

    // Live ticking countdown state
    const [countdown, setCountdown] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

    useEffect(() => {
        dispatch(fetchHolidays());
    }, [dispatch]);

    useEffect(() => {
        if (activeAcademicYearId) {
            dispatch(fetchHolidays());
        }
    }, [activeAcademicYearId, dispatch]);

    useEffect(() => {
        if (error) {
            toast.error(error);
            dispatch(clearError());
        }
    }, [error, dispatch]);

    const getNextHoliday = useMemo(() => {
        const future = holidays
            .filter(h => new Date(h.startDate) > new Date())
            .sort((a, b) => new Date(a.startDate) - new Date(b.startDate))[0];
        return future;
    }, [holidays]);

    // Live countdown timer
    useEffect(() => {
        if (!getNextHoliday) return;
        
        const updateTimer = () => {
            const diff = new Date(getNextHoliday.startDate) - new Date();
            if (diff <= 0) {
                setCountdown({ days: 0, hours: 0, minutes: 0, seconds: 0 });
            } else {
                setCountdown({
                    days: Math.floor(diff / (1000 * 60 * 60 * 24)),
                    hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
                    minutes: Math.floor((diff / 1000 / 60) % 60),
                    seconds: Math.floor((diff / 1000) % 60)
                });
            }
        };

        updateTimer();
        const interval = setInterval(updateTimer, 1000);
        return () => clearInterval(interval);
    }, [getNextHoliday]);

    const formik = useFormik({
        initialValues: {
            title: '',
            startDate: '',
            endDate: '',
            description: ''
        },
        validationSchema: Yup.object({
            title: Yup.string().required('Required'),
            startDate: Yup.date().required('Required'),
            endDate: Yup.date().min(Yup.ref('startDate'), "End date must be on or after start date").required('Required'),
        }),
        onSubmit: (values) => {
            if (editingHoliday) {
                dispatch(updateHoliday({ id: editingHoliday._id, data: values }))
                    .unwrap()
                    .then(() => {
                        closeModal();
                    });
            } else {
                dispatch(createHoliday(values))
                    .unwrap()
                    .then(() => {
                        closeModal();
                    });
            }
        }
    });

    const openModal = (holiday = null) => {
        if (holiday) {
            setEditingHoliday(holiday);
            formik.setValues({
                title: holiday.title,
                startDate: new Date(holiday.startDate).toISOString().split('T')[0],
                endDate: new Date(holiday.endDate).toISOString().split('T')[0],
                description: holiday.description || ''
            });
        } else {
            setEditingHoliday(null);
            formik.resetForm();
        }
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setEditingHoliday(null);
        formik.resetForm();
    };

    const handleDelete = async (id) => {
        if (await window.confirm('Are you sure you want to delete this holiday?')) {
            dispatch(deleteHoliday(id)).unwrap();
        }
    };

    // Category mapping based on titles
    const getHolidayCategory = (title) => {
        const t = title.toLowerCase();
        if (t.includes('independence') || t.includes('republic') || t.includes('gandhi') || t.includes('national')) {
            return 'National';
        }
        if (t.includes('diwali') || t.includes('christmas') || t.includes('eid') || t.includes('holi') || t.includes('festival') || t.includes('vacation')) {
            return 'Festive';
        }
        return 'Academic';
    };

    const getHolidayTheme = (title) => {
        const cat = getHolidayCategory(title);
        if (cat === 'National') {
            return {
                icon: <Sun className="text-orange-500 animate-spin-slow" size={16} />,
                bg: 'bg-orange-500/10 border-orange-500/20 text-orange-400',
                bannerBg: 'bg-gradient-to-r from-orange-500/20 to-amber-500/20',
                tag: 'National Protocol',
                glow: 'shadow-orange-500/5'
            };
        }
        if (cat === 'Festive') {
            return {
                icon: <Flame className="text-pink-500" size={16} />,
                bg: 'bg-pink-500/10 border-pink-500/20 text-pink-400',
                bannerBg: 'bg-gradient-to-r from-pink-500/20 to-purple-500/20',
                tag: 'Festive Break',
                glow: 'shadow-pink-500/5'
            };
        }
        return {
            icon: <CloudSnow className="text-sky-500" size={16} />,
            bg: 'bg-sky-500/10 border-sky-500/20 text-sky-400',
            bannerBg: 'bg-gradient-to-r from-sky-500/20 to-indigo-500/20',
            tag: 'Academic Pause',
            glow: 'shadow-sky-500/5'
        };
    };

    const filteredHolidays = useMemo(() => {
        return holidays.filter(h => {
            const matchesSearch = h.title.toLowerCase().includes(searchTerm.toLowerCase());
            const category = getHolidayCategory(h.title);
            const matchesFilter = activeFilter === 'All' || category === activeFilter;
            return matchesSearch && matchesFilter;
        });
    }, [holidays, searchTerm, activeFilter]);

    return (
        <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            className="pb-24 max-w-[1600px] mx-auto font-outfit relative overflow-hidden"
        >
            {/* Visual background lights */}
            <div className="absolute top-0 left-1/3 w-[600px] h-[600px] bg-gradient-to-tr from-brand-primary/10 to-brand-secondary/5 rounded-full blur-[140px] pointer-events-none -z-10"></div>

            {/* 1. HERO TICKING COUNTDOWN BANNER */}
            {getNextHoliday && (
                <motion.div 
                    initial={{ y: -20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    className="relative bg-slate-900/30 border border-slate-800/80 rounded-md p-6 xl:p-8 backdrop-blur-3xl shadow-2xl mb-12 overflow-hidden group border-white/[0.02]"
                >
                    <div className="absolute top-0 right-0 w-80 h-80 bg-brand-primary/10 rounded-full blur-[100px] opacity-30 pointer-events-none"></div>
                    
                    <div className="flex flex-col xl:flex-row items-center justify-between gap-8 relative z-10">
                        <div className="space-y-3 text-center xl:text-left max-w-xl">
                            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-md bg-brand-primary/10 border border-brand-primary/20">
                                <Sparkles size={11} className="text-brand-primary animate-pulse" />
                                <span className="text-[8px] font-black text-brand-primary uppercase tracking-[0.25em] italic">Immediate Break Node Pending</span>
                            </div>
                            <h2 className="text-3xl xl:text-4xl font-black text-white italic uppercase tracking-tighter leading-none">
                                {getNextHoliday.title}
                            </h2>
                            <p className="text-slate-400 text-xs font-semibold leading-relaxed italic">
                                {getNextHoliday.description || "Unified synchronization protocol is active for the upcoming break."}
                            </p>
                        </div>

                        {/* Holographic Digital Timer Grid */}
                        <div className="flex items-center gap-3 md:gap-4 shrink-0">
                            {[
                                { val: countdown.days, label: 'Days' },
                                { val: countdown.hours, label: 'Hrs' },
                                { val: countdown.minutes, label: 'Mins' },
                                { val: countdown.seconds, label: 'Secs' }
                            ].map((unit, uIdx) => (
                                <div key={unit.label} className="flex flex-col items-center">
                                    <div className="w-16 h-16 md:w-20 md:h-20 rounded-md bg-slate-950 border border-white/5 flex items-center justify-center shadow-lg relative group-hover:border-brand-primary/20 transition-all duration-300">
                                        <div className="absolute inset-0 bg-gradient-to-b from-white/[0.02] to-transparent pointer-events-none"></div>
                                        <span className="text-2xl md:text-3xl font-black text-white font-mono tracking-tighter leading-none italic">
                                            {String(unit.val).padStart(2, '0')}
                                        </span>
                                    </div>
                                    <span className="text-[7px] font-black text-slate-500 uppercase tracking-widest mt-2">{unit.label}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </motion.div>
            )}

            {/* 2. NAVIGATION BAR & FILTER CONTROLS */}
            <div className="bg-slate-900/30 border border-slate-800/60 rounded-md p-4 backdrop-blur-3xl shadow-xl mb-8 flex flex-col lg:flex-row items-center justify-between gap-4 border-white/[0.02]">
                {/* Horizontal Filter Slide */}
                <div className="flex items-center gap-2 self-stretch overflow-x-auto custom-scrollbar pb-2 lg:pb-0">
                    {['All', 'National', 'Festive', 'Academic'].map(filter => (
                        <button
                            key={filter}
                            onClick={() => setActiveFilter(filter)}
                            className={`py-2 px-5 rounded-md text-[9px] font-black uppercase tracking-widest transition-all italic shrink-0 ${activeFilter === filter ? 'bg-gradient-to-r from-brand-primary to-brand-secondary text-white shadow-md shadow-brand-primary/10' : 'bg-transparent text-slate-500 border border-transparent hover:text-white hover:bg-slate-800/30'}`}
                        >
                            {filter} Protocols
                        </button>
                    ))}
                </div>

                {/* Search / Register Bar */}
                <div className="flex flex-col sm:flex-row items-center gap-3 w-full lg:w-auto self-stretch">
                    <div className="relative group w-full lg:w-64">
                        <Search size={13} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600 group-focus-within:text-brand-primary transition-colors" />
                        <input
                            type="text"
                            placeholder="SCAN REGISTRY KEYWORDS..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full bg-slate-950/60 border border-slate-800 h-10 pl-11 pr-4 rounded-md text-[9px] font-black uppercase tracking-widest outline-none focus:border-brand-primary/50 focus:bg-slate-950/80 transition-all text-white italic"
                        />
                    </div>
                    {isAdmin && (
                        <button
                            onClick={() => openModal()}
                            className="w-full sm:w-auto flex items-center justify-center gap-3 bg-brand-primary hover:bg-brand-primary/90 text-white px-6 h-10 rounded-md font-black tracking-[0.2em] uppercase text-[9px] transition-all shadow-lg active:scale-95 italic group shrink-0"
                        >
                            <Plus size={14} className="group-hover:rotate-90 transition-transform duration-500" />
                            Register Node
                        </button>
                    )}
                </div>
            </div>

            {/* 3. CARD BOARD LAYOUT */}
            <AnimatePresence mode="popLayout">
                {filteredHolidays.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                        {filteredHolidays.map((holiday, idx) => {
                            const isNext = getNextHoliday?._id === holiday._id;
                            const theme = getHolidayTheme(holiday.title);
                            const startDate = new Date(holiday.startDate);
                            const endDate = new Date(holiday.endDate);
                            
                            return (
                                <motion.div
                                    key={holiday._id}
                                    initial={{ opacity: 0, scale: 0.96 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.9 }}
                                    transition={{ delay: idx * 0.03, ease: "circOut" }}
                                    className="group relative"
                                >
                                    {/* Neon border wrapper for selected next holiday */}
                                    {isNext && (
                                        <div className="absolute -inset-[1px] bg-gradient-to-r from-brand-primary via-brand-secondary to-cyan-400 rounded-md blur-[1.5px] opacity-75 group-hover:opacity-100 transition-opacity"></div>
                                    )}

                                    {/* Capsule container */}
                                    <div className="relative bg-slate-900/40 border border-white/5 rounded-md backdrop-blur-3xl overflow-hidden hover:border-white/10 hover:bg-slate-900/60 transition-all duration-500 flex flex-col justify-between h-full shadow-2xl">
                                        
                                        {/* Colored header band matching category theme */}
                                        <div className={`h-1.5 w-full ${theme.bannerBg}`}></div>

                                        <div className="p-6 space-y-5 flex-1">
                                            {/* Date Banner Grid */}
                                            <div className="flex justify-between items-start">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-12 h-12 rounded-md bg-slate-950 border border-white/5 flex flex-col items-center justify-center shadow-lg group-hover:scale-105 transition-transform duration-300">
                                                        <span className="text-[8px] font-black text-brand-secondary uppercase leading-none mt-1">{startDate.toLocaleString('default', { month: 'short' })}</span>
                                                        <span className="text-white text-lg font-black leading-none mt-1">{startDate.getDate()}</span>
                                                    </div>
                                                    <div className="h-6 w-[1px] bg-slate-800"></div>
                                                    <div className="space-y-0.5">
                                                        <span className="text-[7px] font-black text-slate-500 uppercase tracking-widest">Commencement</span>
                                                        <p className="text-[9px] font-black text-white uppercase tracking-wider">{startDate.toLocaleDateString(undefined, { weekday: 'long' })}</p>
                                                    </div>
                                                </div>

                                                {/* Admin controls */}
                                                {isAdmin && (
                                                    <div className="flex gap-1.5 shrink-0 opacity-20 group-hover:opacity-100 transition-opacity duration-300">
                                                        <button onClick={() => openModal(holiday)} className="w-8 h-8 rounded-md bg-slate-900 border border-slate-800 text-slate-500 hover:text-brand-primary hover:border-brand-primary/30 transition-all flex items-center justify-center">
                                                            <Edit2 size={11} />
                                                        </button>
                                                        <button onClick={() => handleDelete(holiday._id)} className="w-8 h-8 rounded-md bg-slate-900 border border-slate-800 text-slate-500 hover:text-luxury-rose hover:border-luxury-rose/30 transition-all flex items-center justify-center">
                                                            <Trash2 size={11} />
                                                        </button>
                                                    </div>
                                                )}
                                            </div>

                                            {/* Main Info */}
                                            <div className="space-y-2.5">
                                                <div className="flex items-center gap-2">
                                                    <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[7px] font-black uppercase tracking-widest ${theme.bg}`}>
                                                        {theme.icon}
                                                        {theme.tag}
                                                    </span>
                                                </div>
                                                <h3 className="text-lg font-black text-white italic uppercase tracking-tighter leading-tight group-hover:text-brand-secondary transition-colors duration-300">
                                                    {holiday.title}
                                                </h3>
                                                {holiday.description && (
                                                    <p className="text-slate-400 text-[10px] font-medium leading-relaxed italic line-clamp-3">
                                                        {holiday.description}
                                                    </p>
                                                )}
                                            </div>
                                        </div>

                                        {/* Bottom Range details */}
                                        <div className="p-5 border-t border-white/5 bg-slate-950/20 flex items-center justify-between gap-4">
                                            <div className="flex items-center gap-2 text-slate-500">
                                                <Clock size={11} />
                                                <span className="text-[8px] font-black uppercase tracking-widest">
                                                    {startDate.toLocaleDateString()} — {endDate.toLocaleDateString()}
                                                </span>
                                            </div>

                                            <div className="flex items-center gap-1.5">
                                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-glow animate-pulse"></span>
                                                <span className="text-[7px] font-black text-slate-500 uppercase tracking-widest">Active Node</span>
                                            </div>
                                        </div>

                                    </div>
                                </motion.div>
                            );
                        })}
                    </div>
                ) : (
                    <div className="py-40 rounded-md bg-slate-900/10 border border-dashed border-slate-800 flex flex-col items-center justify-center gap-4">
                        <Activity size={28} className="text-slate-700 opacity-40 animate-pulse" />
                        <div className="text-center space-y-1">
                            <h4 className="text-slate-500 font-black uppercase tracking-[0.3em] text-[10px] italic">Void Vector</h4>
                            <p className="text-slate-600 text-[8px] font-bold uppercase tracking-widest">No matching temporal break nodes detected</p>
                        </div>
                    </div>
                )}
            </AnimatePresence>

            {/* Redesigned Admin Modal */}
            <PortalModal isOpen={isModalOpen} onClose={closeModal} maxWidth="max-w-xl">
                <form onSubmit={formik.handleSubmit}>
                    <div className="px-8 pt-10 pb-8 space-y-8">
                        <div className="flex items-center justify-between">
                            <div className="space-y-1">
                                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-brand-primary/10 border border-brand-primary/20">
                                    <AlertCircle size={10} className="text-brand-primary" />
                                    <span className="text-[8px] font-black uppercase tracking-widest text-brand-primary">Break Node Calibration</span>
                                </div>
                                <h2 className="text-2xl font-black text-white italic uppercase tracking-tighter leading-none">
                                    {editingHoliday ? 'Recalibrate' : 'Synchronize'} <span className="text-brand-secondary">Node</span>
                                </h2>
                            </div>
                            <button type="button" onClick={closeModal} className="w-10 h-10 rounded-md bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-500 hover:text-white hover:border-slate-600 transition-all active:scale-95">
                                <X size={20} />
                            </button>
                        </div>

                        <div className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-[9px] font-black text-slate-500 uppercase tracking-[0.4em] ml-2 italic">Node Title</label>
                                <input
                                    name="title"
                                    {...formik.getFieldProps('title')}
                                    placeholder="e.g. Winter Solstice Break"
                                    className="w-full bg-slate-900/50 border border-slate-800 h-12 px-5 rounded-md text-slate-100 outline-none focus:border-brand-primary transition-all italic font-black text-xs"
                                />
                                {formik.touched.title && formik.errors.title && <p className="text-luxury-rose text-[8px] font-black uppercase tracking-widest ml-2 animate-pulse">{formik.errors.title}</p>}
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-[9px] font-black text-slate-500 uppercase tracking-[0.4em] ml-2 italic">Commencement</label>
                                    <input
                                        type="date"
                                        name="startDate"
                                        {...formik.getFieldProps('startDate')}
                                        className="w-full bg-slate-900/50 border border-slate-800 h-12 px-5 rounded-md text-slate-100 outline-none focus:border-brand-primary transition-all italic font-black text-xs"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[9px] font-black text-slate-500 uppercase tracking-[0.4em] ml-2 italic">Termination</label>
                                    <input
                                        type="date"
                                        name="endDate"
                                        {...formik.getFieldProps('endDate')}
                                        className="w-full bg-slate-900/50 border border-slate-800 h-12 px-5 rounded-md text-slate-100 outline-none focus:border-brand-primary transition-all italic font-black text-xs"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[9px] font-black text-slate-500 uppercase tracking-[0.4em] ml-2 italic">Temporal Context</label>
                                <textarea
                                    name="description"
                                    {...formik.getFieldProps('description')}
                                    placeholder="Append metadata regarding this temporal break node..."
                                    className="w-full bg-slate-900/50 border border-slate-800 h-28 p-5 rounded-md text-slate-100 outline-none focus:border-brand-primary transition-all italic font-black text-xs resize-none"
                                ></textarea>
                            </div>
                        </div>
                    </div>

                    <div className="p-6 bg-slate-900/40 border-t border-slate-800/60 flex gap-4">
                        <button
                            type="button"
                            onClick={closeModal}
                            className="flex-1 h-12 rounded-md border border-slate-800 font-black tracking-[0.2em] uppercase text-[9px] text-slate-500 hover:text-white hover:bg-slate-900 transition-all italic active:scale-95"
                        >
                            Abort
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex-[2] h-12 rounded-md bg-gradient-to-r from-brand-primary to-brand-secondary text-white font-black tracking-[0.2em] uppercase text-[9px] shadow-lg shadow-brand-primary/20 hover:shadow-brand-primary/40 transition-all active:scale-95 flex items-center justify-center gap-2.5 italic"
                        >
                            {loading ? <Activity size={16} className="animate-spin" /> : <Save size={16} />}
                            Initialize Protocol
                        </button>
                    </div>
                </form>
            </PortalModal>
        </motion.div>
    );
};

export default Holidays;
