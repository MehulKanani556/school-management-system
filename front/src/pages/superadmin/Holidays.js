import React, { useEffect, useState, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchGlobalHolidays, createGlobalHoliday, updateGlobalHoliday, deleteGlobalHoliday, clearStatus } from '../../redux/slice/superAdmin.slice';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, Plus, Edit2, Trash2, X, Save, Clock, Info, Search, Activity, Sparkles, MapPin, AlertCircle, ArrowRight, Hourglass, Shield, ShieldCheck, Bookmark, Compass, Sun, Flame, CloudSnow, Plane, LayoutGrid, Layers, ChevronLeft, ChevronRight } from 'lucide-react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import moment from 'moment';
import toast from 'react-hot-toast';
import PortalModal from '../../components/PortalModal';

const Holidays = () => {
    const dispatch = useDispatch();
    const { holidays, loading, error, success } = useSelector((state) => state.superAdmin);

    const [viewMode, setViewMode] = useState('grid'); // 'grid' (month planner) or 'cards' (list grid)
    const [currentDate, setCurrentDate] = useState(new Date());
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingHoliday, setEditingHoliday] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [activeFilter, setActiveFilter] = useState('All'); // 'All', 'National', 'Festive', 'Academic'

    const [showDayModal, setShowDayModal] = useState(false);
    const [selectedDate, setSelectedDate] = useState(null);
    const [selectedDayHolidays, setSelectedDayHolidays] = useState([]);

    // Live ticking countdown state
    const [countdown, setCountdown] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

    useEffect(() => {
        dispatch(fetchGlobalHolidays());
    }, [dispatch]);

    useEffect(() => {
        if (success) {
            toast.success(success);
            dispatch(clearStatus());
            closeModal();
        }
        if (error) {
            toast.error(error);
            dispatch(clearStatus());
        }
    }, [success, error, dispatch]);

    const getNextHoliday = useMemo(() => {
        if (!Array.isArray(holidays)) return null;
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

    // Calendar logic
    const daysInMonth = (year, month) => new Date(year, month + 1, 0).getDate();
    const firstDayOfMonth = (year, month) => new Date(year, month, 1).getDay();
    const monthNames = ["January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"];

    const calendarGrid = useMemo(() => {
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth();
        const days = daysInMonth(year, month);
        const firstDay = firstDayOfMonth(year, month);
        
        const grid = [];
        // Padding for first week
        for (let i = 0; i < firstDay; i++) {
            grid.push({ day: null, date: null });
        }
        for (let d = 1; d <= days; d++) {
            grid.push({ day: d, date: new Date(year, month, d) });
        }
        return grid;
    }, [currentDate]);

    // Group holidays by date
    const holidaysByDate = useMemo(() => {
        if (!Array.isArray(holidays)) return {};
        const map = {};
        holidays.forEach(h => {
            const start = new Date(h.startDate);
            const end = new Date(h.endDate || h.startDate);
            
            // Normalize dates to midnight for matching
            const s = new Date(start.getFullYear(), start.getMonth(), start.getDate());
            const e = new Date(end.getFullYear(), end.getMonth(), end.getDate());
            
            const curr = new Date(s);
            while (curr <= e) {
                const key = curr.toDateString();
                if (!map[key]) map[key] = [];
                map[key].push(h);
                curr.setDate(curr.getDate() + 1);
            }
        });
        return map;
    }, [holidays]);

    const activeMonthHolidays = useMemo(() => {
        if (!Array.isArray(holidays)) return [];
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth();
        const firstOfMonth = new Date(year, month, 1);
        const lastOfMonth = new Date(year, month + 1, 0);

        return holidays.filter(h => {
            const start = new Date(h.startDate);
            const end = new Date(h.endDate || h.startDate);
            return start <= lastOfMonth && end >= firstOfMonth;
        });
    }, [holidays, currentDate]);

    const changeMonth = (offset) => {
        const nextMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + offset, 1);
        setCurrentDate(nextMonth);
    };

    const openDayModal = (date, dayHolidays) => {
        if (!date || !dayHolidays || dayHolidays.length === 0) return;
        setSelectedDate(date);
        setSelectedDayHolidays(dayHolidays);
        setShowDayModal(true);
    };

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
            const payload = {
                ...values,
                startDate: new Date(values.startDate),
                endDate: new Date(values.endDate || values.startDate)
            };
            if (editingHoliday) {
                dispatch(updateGlobalHoliday({ id: editingHoliday._id, data: payload }));
            } else {
                dispatch(createGlobalHoliday(payload));
            }
        }
    });

    const openModal = (holiday = null) => {
        if (holiday) {
            setEditingHoliday(holiday);
            formik.setValues({
                title: holiday.title,
                startDate: moment(holiday.startDate).format('YYYY-MM-DD'),
                endDate: moment(holiday.endDate).format('YYYY-MM-DD'),
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
            dispatch(deleteGlobalHoliday(id));
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
                bg: 'bg-orange-500/10 border-orange-500/25 text-orange-400',
                bannerBg: 'bg-gradient-to-r from-orange-500/20 to-amber-500/20',
                tag: 'National Holiday',
                glow: 'shadow-orange-500/5'
            };
        }
        if (cat === 'Festive') {
            return {
                icon: <Flame className="text-pink-500" size={16} />,
                bg: 'bg-pink-500/10 border-pink-500/25 text-pink-400',
                bannerBg: 'bg-gradient-to-r from-pink-500/20 to-purple-500/20',
                tag: 'Festive Holiday',
                glow: 'shadow-pink-500/5'
            };
        }
        return {
            icon: <CloudSnow className="text-sky-500" size={16} />,
            bg: 'bg-sky-500/10 border-sky-500/25 text-sky-400',
            bannerBg: 'bg-gradient-to-r from-sky-500/20 to-indigo-500/20',
            tag: 'School Break',
            glow: 'shadow-sky-500/5'
        };
    };

    const filteredHolidays = useMemo(() => {
        if (!Array.isArray(holidays)) return [];
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
            <div className="absolute top-0 left-1/3 w-[600px] h-[600px] bg-gradient-to-tr from-superadmin-primary/10 to-indigo-500/5 rounded-full blur-[140px] pointer-events-none -z-10"></div>

            {/* Title & View mode Switcher */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
                <div>
                    <h1 className="text-3xl font-black text-white uppercase tracking-tighter leading-none mb-2 font-inter">School Holidays</h1>
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] opacity-70">Manage platform-wide holidays and school breaks.</p>
                </div>
                <div className="flex items-center gap-3 bg-slate-950/80 p-1 rounded-md border border-slate-800/60 shadow-inner shrink-0">
                    <button 
                        onClick={() => setViewMode('grid')}
                        className={`flex items-center gap-2 py-2.5 px-5 rounded-md text-[10px] font-black uppercase tracking-widest transition-all italic ${
                            viewMode === 'grid' ? 'bg-superadmin-primary text-black font-black' : 'text-slate-500 hover:text-white'
                        }`}
                    >
                        <Calendar size={13} /> Month Planner
                    </button>
                    <button 
                        onClick={() => setViewMode('cards')}
                        className={`flex items-center gap-2 py-2.5 px-5 rounded-md text-[10px] font-black uppercase tracking-widest transition-all italic ${
                            viewMode === 'cards' ? 'bg-superadmin-primary text-black font-black' : 'text-slate-500 hover:text-white'
                        }`}
                    >
                        <LayoutGrid size={13} /> Cards Registry
                    </button>
                </div>
            </div>

            {/* View Mode Router */}
            {viewMode === 'grid' ? (
                <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
                    {/* Month grid calendar */}
                    <div className="xl:col-span-3 space-y-6">
                        <header className="flex flex-col sm:flex-row sm:items-center justify-between bg-slate-900/30 p-6 rounded-md border border-slate-800/60 shadow-xl backdrop-blur-3xl gap-4">
                            <div className="flex items-center gap-4 bg-slate-950/60 px-4 py-2 rounded-md border border-slate-800/40">
                                <button onClick={() => changeMonth(-1)} className="p-2 hover:bg-slate-850 rounded text-slate-400 hover:text-white transition-all"><ChevronLeft size={16}/></button>
                                
                                <select 
                                    value={currentDate.getMonth()}
                                    onChange={(e) => setCurrentDate(new Date(currentDate.getFullYear(), parseInt(e.target.value), 1))}
                                    className="bg-transparent border-none text-[11px] font-black text-white uppercase tracking-widest font-mono italic outline-none cursor-pointer focus:ring-0"
                                >
                                    {monthNames.map((name, i) => (
                                        <option key={i} value={i} className="bg-slate-950 text-white font-mono">{name.substring(0, 3)}</option>
                                    ))}
                                </select>

                                <select 
                                    value={currentDate.getFullYear()}
                                    onChange={(e) => setCurrentDate(new Date(parseInt(e.target.value), currentDate.getMonth(), 1))}
                                    className="bg-transparent border-none text-[11px] font-black text-white uppercase tracking-widest font-mono italic outline-none cursor-pointer focus:ring-0"
                                >
                                    {[2024, 2025, 2026, 2027, 2028, 2029, 2030].map(y => (
                                        <option key={y} value={y} className="bg-slate-950 text-white font-mono">{y}</option>
                                    ))}
                                </select>

                                <button onClick={() => changeMonth(1)} className="p-2 hover:bg-slate-850 rounded text-slate-400 hover:text-white transition-all"><ChevronRight size={16}/></button>
                            </div>

                            {/* Color Legend Indicators */}
                            <div className="flex items-center gap-6 bg-slate-950/40 px-5 py-2.5 rounded-md border border-slate-800/40">
                                <div className="flex items-center gap-2">
                                    <span className="w-2 h-2 rounded-full bg-orange-500 shadow-lg shadow-orange-500/40"></span>
                                    <span className="text-[8px] font-black uppercase text-slate-400 tracking-wider">National</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="w-2 h-2 rounded-full bg-pink-500 shadow-lg shadow-pink-500/40"></span>
                                    <span className="text-[8px] font-black uppercase text-slate-400 tracking-wider">Festive</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="w-2 h-2 rounded-full bg-sky-500 shadow-lg shadow-sky-500/40"></span>
                                    <span className="text-[8px] font-black uppercase text-slate-400 tracking-wider">Academic</span>
                                </div>
                            </div>
                        </header>

                        {/* Weekday columns header (independent glassmorphic elements) */}
                        <div className="grid grid-cols-7 gap-3">
                            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
                                <div key={d} className="py-3.5 text-center text-[10px] font-black text-slate-500 uppercase tracking-widest italic bg-slate-900/20 border border-slate-800/30 rounded-md backdrop-blur-md">{d}</div>
                            ))}
                        </div>

                        {/* Calendar Cards Grid */}
                        <div className="grid grid-cols-7 gap-3">
                            {calendarGrid.map((cell, idx) => {
                                if (!cell.day) {
                                    return <div key={idx} className="min-h-[120px] rounded-md bg-transparent opacity-0 pointer-events-none"></div>;
                                }

                                const dayHolidays = holidaysByDate[cell.date.toDateString()] || [];
                                const isToday = cell.date?.toDateString() === new Date().toDateString();
                                const hasHolidays = dayHolidays.length > 0;
                                const theme = hasHolidays ? getHolidayTheme(dayHolidays[0].title) : null;

                                return (
                                    <motion.div 
                                        key={idx}
                                        whileHover={{ y: -2, scale: 1.02 }}
                                        onClick={() => openDayModal(cell.date, dayHolidays)}
                                        className={`min-h-[120px] p-4 rounded-md backdrop-blur-3xl transition-all flex flex-col justify-between cursor-pointer border shadow-lg relative group ${
                                            isToday 
                                            ? 'bg-superadmin-primary/10 border-superadmin-primary shadow-superadmin-primary/5' 
                                            : hasHolidays 
                                              ? `${theme.bg} border-opacity-40 hover:border-opacity-80` 
                                              : 'bg-slate-900/40 border-slate-800/60 hover:border-slate-700/80 hover:bg-slate-900/60'
                                        }`}
                                    >
                                        <div className="flex items-center justify-between">
                                            <span className={`text-[10px] font-black italic font-mono ${
                                                isToday ? 'text-superadmin-primary' : 'text-slate-500 group-hover:text-slate-300'
                                            }`}>
                                                {cell.day}
                                            </span>
                                            {hasHolidays && (
                                                <span className="shrink-0 transition-transform group-hover:scale-110">{theme.icon}</span>
                                            )}
                                        </div>
                                        <div className="space-y-1.5 mt-4">
                                            {dayHolidays.slice(0, 2).map((h, i) => (
                                                <div 
                                                    key={i} 
                                                    className="p-1 px-1.5 rounded bg-slate-950/80 border border-white/5 text-[7px] font-black text-slate-100 uppercase tracking-wide truncate shadow-sm"
                                                >
                                                    {h.title}
                                                </div>
                                            ))}
                                            {dayHolidays.length > 2 && (
                                                <div className="text-[6px] font-black text-slate-500 uppercase tracking-widest text-center mt-1">+{dayHolidays.length - 2} More</div>
                                            )}
                                        </div>
                                    </motion.div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Right column details / legends */}
                    <div className="space-y-6">
                        {/* Countdown to next */}
                        {getNextHoliday && (
                            <div className="bg-gradient-to-br from-slate-900/60 to-slate-950/60 border border-slate-800/60 p-6 rounded-md backdrop-blur-3xl shadow-xl relative overflow-hidden group">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-superadmin-primary/10 rounded-full blur-3xl group-hover:bg-superadmin-primary/20 transition-all duration-500"></div>
                                <span className="text-[8px] font-black text-superadmin-primary uppercase tracking-[0.25em] italic block mb-3">Holiday Countdown</span>
                                <h4 className="text-sm font-black text-white uppercase italic tracking-tighter truncate mb-2">{getNextHoliday.title}</h4>
                                <div className="grid grid-cols-4 gap-2 text-center mt-4">
                                    {[
                                        { val: countdown.days, lbl: 'D' },
                                        { val: countdown.hours, lbl: 'H' },
                                        { val: countdown.minutes, lbl: 'M' },
                                        { val: countdown.seconds, lbl: 'S' }
                                    ].map(u => (
                                        <div key={u.lbl} className="bg-slate-950 border border-white/5 p-2 rounded-md">
                                            <p className="text-sm font-black font-mono text-white italic leading-none">{String(u.val).padStart(2, '0')}</p>
                                            <span className="text-[7px] font-black text-slate-600 uppercase tracking-widest block mt-1">{u.lbl}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* List of holidays in current viewed month */}
                        <div className="bg-slate-900/30 border border-slate-800/60 p-6 rounded-md backdrop-blur-3xl shadow-xl flex flex-col justify-between min-h-[300px]">
                            <div>
                                <h3 className="text-[9px] font-black text-white uppercase tracking-[0.3em] mb-4 italic flex items-center gap-2 pb-3 border-b border-white/5">
                                    <Layers size={12} className="text-superadmin-primary" /> Month Schedule
                                </h3>
                                <div className="space-y-3 max-h-[220px] overflow-y-auto custom-scrollbar pr-1">
                                    {activeMonthHolidays.length > 0 ? activeMonthHolidays.map(h => {
                                        const theme = getHolidayTheme(h.title);
                                        return (
                                            <div 
                                                key={h._id}
                                                onClick={() => openModal(h)} 
                                                className="flex items-center justify-between p-2.5 rounded bg-slate-950/40 border border-white/5 hover:border-superadmin-primary/30 cursor-pointer transition-all group"
                                            >
                                                <div className="min-w-0">
                                                    <p className="text-[10px] font-black text-slate-200 group-hover:text-superadmin-primary transition-colors truncate uppercase italic">{h.title}</p>
                                                    <span className="text-[8px] font-bold text-slate-500 uppercase tracking-wider block mt-0.5">{moment(h.startDate).format('MMM DD')} - {moment(h.endDate).format('MMM DD')}</span>
                                                </div>
                                                <span className={`p-1.5 rounded shrink-0 ${theme.bg}`}>{theme.icon}</span>
                                            </div>
                                        );
                                    }) : (
                                        <p className="text-[8px] font-black uppercase text-slate-600 tracking-widest text-center py-12">No break nodes this month.</p>
                                    )}
                                </div>
                            </div>
                            <button
                                onClick={() => openModal()}
                                className="w-full mt-6 flex items-center justify-center gap-3 bg-superadmin-primary hover:bg-superadmin-primary/90 text-black py-3 rounded-md font-black tracking-widest uppercase text-[9px] transition-all shadow-lg active:scale-95 italic"
                            >
                                <Plus size={13} className="text-black" />
                                Add Holiday
                            </button>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="space-y-8">
                    {/* Countdown Banner */}
                    {getNextHoliday && (
                        <motion.div 
                            initial={{ y: -20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            className="relative bg-slate-900/30 border border-slate-800/80 rounded-md p-6 xl:p-8 backdrop-blur-3xl shadow-2xl mb-12 overflow-hidden group border-white/[0.02]"
                        >
                            <div className="absolute top-0 right-0 w-80 h-80 bg-superadmin-primary/10 rounded-full blur-[100px] opacity-30 pointer-events-none"></div>
                            
                            <div className="flex flex-col xl:flex-row items-center justify-between gap-8 relative z-10">
                                <div className="space-y-3 text-center xl:text-left max-w-xl">
                                    <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-md bg-superadmin-primary/10 border border-superadmin-primary/20">
                                        <Sparkles size={11} className="text-superadmin-primary animate-pulse" />
                                        <span className="text-[8px] font-black text-superadmin-primary uppercase tracking-[0.25em] italic">Next Holiday</span>
                                    </div>
                                    <h2 className="text-3xl xl:text-4xl font-black text-white italic uppercase tracking-tighter leading-none">
                                        {getNextHoliday.title}
                                    </h2>
                                    <p className="text-slate-400 text-xs font-semibold leading-relaxed italic">
                                        {getNextHoliday.description || "The school will remain closed for the upcoming holiday break."}
                                    </p>
                                </div>

                                {/* Timer Grid */}
                                <div className="flex items-center gap-3 md:gap-4 shrink-0">
                                    {[
                                        { val: countdown.days, label: 'Days' },
                                        { val: countdown.hours, label: 'Hrs' },
                                        { val: countdown.minutes, label: 'Mins' },
                                        { val: countdown.seconds, label: 'Secs' }
                                    ].map((unit) => (
                                        <div key={unit.label} className="flex flex-col items-center">
                                            <div className="w-16 h-16 md:w-20 md:h-20 rounded-md bg-slate-950 border border-white/5 flex items-center justify-center shadow-lg relative group-hover:border-superadmin-primary/20 transition-all duration-300">
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

                    {/* Filter Navigation Bar */}
                    <div className="bg-slate-900/30 border border-slate-800/60 rounded-md p-4 backdrop-blur-3xl shadow-xl mb-8 flex flex-col lg:flex-row items-center justify-between gap-4 border-white/[0.02]">
                        <div className="flex items-center gap-2 self-stretch overflow-x-auto custom-scrollbar pb-2 lg:pb-0">
                            {['All', 'National', 'Festive', 'Academic'].map(filter => (
                                <button
                                    key={filter}
                                    onClick={() => setActiveFilter(filter)}
                                    className={`py-2 px-5 rounded-md text-[9px] font-black uppercase tracking-widest transition-all italic shrink-0 ${activeFilter === filter ? 'bg-gradient-to-r from-superadmin-primary to-indigo-500 text-black font-black shadow-md shadow-superadmin-primary/10' : 'bg-transparent text-slate-500 border border-transparent hover:text-white hover:bg-slate-800/30'}`}
                                >
                                    {filter} Holidays
                                </button>
                            ))}
                        </div>

                        {/* Search / Register input */}
                        <div className="flex flex-col sm:flex-row items-center gap-3 w-full lg:w-auto self-stretch">
                            <div className="relative group w-full lg:w-64">
                                <Search size={13} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600 group-focus-within:text-superadmin-primary transition-colors" />
                                <input
                                    type="text"
                                    placeholder="Search Holidays..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full bg-slate-950/60 border border-slate-800 h-10 pl-11 pr-4 rounded-md text-[9px] font-black uppercase tracking-widest outline-none focus:border-superadmin-primary/50 focus:bg-slate-950/80 transition-all text-white italic"
                                />
                            </div>
                            <button
                                onClick={() => openModal()}
                                className="w-full sm:w-auto flex items-center justify-center gap-3 bg-superadmin-primary hover:bg-superadmin-primary/90 text-black px-6 h-10 rounded-md font-black tracking-[0.2em] uppercase text-[9px] transition-all shadow-lg active:scale-95 italic group shrink-0"
                            >
                                <Plus size={14} className="group-hover:rotate-90 transition-transform duration-500 text-black" />
                                Add Holiday
                            </button>
                        </div>
                    </div>

                    {/* Card grid board */}
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
                                                <div className="absolute -inset-[1px] bg-gradient-to-r from-superadmin-primary via-indigo-500 to-cyan-400 rounded-md blur-[1.5px] opacity-75 group-hover:opacity-100 transition-opacity"></div>
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
                                                                <span className="text-[8px] font-black text-indigo-400 uppercase leading-none mt-1">{startDate.toLocaleString('default', { month: 'short' })}</span>
                                                                <span className="text-white text-lg font-black leading-none mt-1">{startDate.getDate()}</span>
                                                            </div>
                                                            <div className="h-6 w-[1px] bg-slate-800"></div>
                                                            <div className="space-y-0.5">
                                                                <span className="text-[7px] font-black text-slate-500 uppercase tracking-widest">Start Date</span>
                                                                <p className="text-[9px] font-black text-white uppercase tracking-wider">{startDate.toLocaleDateString(undefined, { weekday: 'long' })}</p>
                                                            </div>
                                                        </div>

                                                        {/* Admin controls */}
                                                        <div className="flex gap-1.5 shrink-0 opacity-20 group-hover:opacity-100 transition-opacity duration-300">
                                                            <button onClick={() => openModal(holiday)} className="w-8 h-8 rounded-md bg-slate-900 border border-slate-800 text-slate-500 hover:text-superadmin-primary hover:border-superadmin-primary/30 transition-all flex items-center justify-center">
                                                                <Edit2 size={11} />
                                                            </button>
                                                            <button onClick={() => handleDelete(holiday._id)} className="w-8 h-8 rounded-md bg-slate-900 border border-slate-800 text-slate-500 hover:text-rose-500 hover:border-rose-500/30 transition-all flex items-center justify-center">
                                                                <Trash2 size={11} />
                                                            </button>
                                                        </div>
                                                    </div>

                                                    {/* Main Info */}
                                                    <div className="space-y-2.5">
                                                        <div className="flex items-center gap-2">
                                                            <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[7px] font-black uppercase tracking-widest ${theme.bg}`}>
                                                                {theme.icon}
                                                                {theme.tag}
                                                            </span>
                                                        </div>
                                                        <h3 className="text-lg font-black text-white italic uppercase tracking-tighter leading-tight group-hover:text-superadmin-primary transition-colors duration-300">
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
                                                            {moment(startDate).format('YYYY.MM.DD')} — {moment(endDate).format('YYYY.MM.DD')}
                                                        </span>
                                                    </div>

                                                    {holiday.schoolId && (
                                                        <div className="flex items-center gap-1.5">
                                                            <span className="w-1.5 h-1.5 rounded-full bg-superadmin-primary shadow-glow animate-pulse"></span>
                                                            <span className="text-[7px] font-black text-slate-500 uppercase tracking-widest">Linked School</span>
                                                        </div>
                                                    )}
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
                                    <h4 className="text-slate-500 font-black uppercase tracking-[0.3em] text-[10px] italic">No Holidays</h4>
                                    <p className="text-slate-600 text-[8px] font-bold uppercase tracking-widest">No holidays scheduled for this category.</p>
                                </div>
                            </div>
                        )}
                    </AnimatePresence>
                </div>
            )}

            {/* Day details modal for Calendar Grid View */}
            <AnimatePresence>
                {showDayModal && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                        <motion.div 
                            initial={{ opacity: 0 }} 
                            animate={{ opacity: 1 }} 
                            exit={{ opacity: 0 }} 
                            onClick={() => setShowDayModal(false)}
                            className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm"
                        ></motion.div>
                        <motion.div 
                            initial={{ scale: 0.9, opacity: 0, y: 20 }} 
                            animate={{ scale: 1, opacity: 1, y: 0 }} 
                            exit={{ scale: 0.9, opacity: 0, y: 20 }} 
                            className="relative w-full max-w-lg bg-slate-900 border border-slate-800 rounded-md shadow-2xl overflow-hidden"
                        >
                            <div className="p-6 border-b border-slate-800 flex items-center justify-between">
                                <div className="space-y-1">
                                    <h3 className="text-xl font-black text-white italic uppercase tracking-tighter leading-none">{selectedDate?.toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</h3>
                                    <p className="text-[10px] font-black text-superadmin-primary uppercase tracking-[0.3em] italic">{selectedDate?.toLocaleDateString('en-IN', { weekday: 'long' })} Holidays</p>
                                </div>
                                <button onClick={() => setShowDayModal(false)} className="w-10 h-10 rounded-md bg-slate-950 border border-slate-800 flex items-center justify-center text-slate-500 hover:text-white transition-all">
                                    <X size={20} />
                                </button>
                            </div>
                            <div className="p-6 space-y-4 max-h-[60vh] overflow-y-auto custom-scrollbar">
                                {selectedDayHolidays?.map((h, i) => {
                                    const theme = getHolidayTheme(h.title);
                                    return (
                                        <motion.div 
                                            initial={{ x: -10, opacity: 0 }}
                                            animate={{ x: 0, opacity: 1 }}
                                            transition={{ delay: i * 0.05 }}
                                            key={i} 
                                            className={`p-4 rounded-md bg-slate-950 border-l-4 ${
                                                h.title.toLowerCase().includes('independence') || h.title.toLowerCase().includes('republic') || h.title.toLowerCase().includes('gandhi') ? 'border-orange-500' :
                                                h.title.toLowerCase().includes('diwali') || h.title.toLowerCase().includes('christmas') || h.title.toLowerCase().includes('eid') || h.title.toLowerCase().includes('vacation') ? 'border-pink-500' : 'border-sky-500'
                                            } shadow-xl flex items-center justify-between group`}
                                        >
                                            <div className="space-y-1 pr-4 min-w-0">
                                                <p className="text-xs font-black text-white uppercase tracking-tight italic truncate">{h.title}</p>
                                                <div className="flex items-center gap-2">
                                                    <Clock size={10} className="text-slate-600" />
                                                    <span className="text-[8px] font-bold text-slate-500 uppercase tracking-widest">{moment(h.startDate).format('YYYY.MM.DD')} - {moment(h.endDate).format('YYYY.MM.DD')}</span>
                                                </div>
                                                {h.description && (
                                                    <p className="text-[9px] font-semibold text-slate-500 uppercase tracking-tight leading-3 mt-1 italic">{h.description}</p>
                                                )}
                                            </div>
                                            <div className="flex gap-2 shrink-0">
                                                <button 
                                                    onClick={() => { openModal(h); setShowDayModal(false); }} 
                                                    className="w-8 h-8 rounded bg-slate-900 border border-slate-800 text-slate-500 hover:text-superadmin-primary flex items-center justify-center transition-all"
                                                >
                                                    <Edit2 size={11} />
                                                </button>
                                                <button 
                                                    onClick={() => { handleDelete(h._id); setShowDayModal(false); }} 
                                                    className="w-8 h-8 rounded bg-slate-900 border border-slate-800 text-slate-500 hover:text-rose-500 flex items-center justify-center transition-all"
                                                >
                                                    <Trash2 size={11} />
                                                </button>
                                            </div>
                                        </motion.div>
                                    );
                                })}
                            </div>
                            <div className="p-6 bg-slate-950/50 border-t border-slate-800">
                                <p className="text-[8px] font-medium text-slate-600 uppercase tracking-[0.2em] italic">Holiday Management Console Active</p>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Redesigned Admin Modal */}
            <PortalModal isOpen={isModalOpen} onClose={closeModal} maxWidth="max-w-xl">
                <form onSubmit={formik.handleSubmit}>
                    <div className="px-8 pt-10 pb-8 space-y-8">
                        <div className="flex items-center justify-between">
                            <div className="space-y-1">
                                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-superadmin-primary/10 border border-superadmin-primary/20">
                                    <AlertCircle size={10} className="text-superadmin-primary" />
                                    <span className="text-[8px] font-black uppercase tracking-widest text-superadmin-primary">Holiday Settings</span>
                                </div>
                                <h2 className="text-2xl font-black text-white italic uppercase tracking-tighter leading-none">
                                    {editingHoliday ? 'Edit' : 'Add'} <span className="text-superadmin-primary">Holiday</span>
                                </h2>
                            </div>
                            <button type="button" onClick={closeModal} className="w-10 h-10 rounded-md bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-500 hover:text-white hover:border-slate-600 transition-all active:scale-95">
                                <X size={20} />
                            </button>
                        </div>

                        <div className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-[9px] font-black text-slate-500 uppercase tracking-[0.4em] ml-2 italic">Holiday Title</label>
                                <input
                                    name="title"
                                    {...formik.getFieldProps('title')}
                                    placeholder="e.g. Winter Break"
                                    className="w-full bg-slate-950 border border-slate-800 h-12 px-5 rounded-md text-slate-100 outline-none focus:border-superadmin-primary transition-all italic font-black text-xs"
                                />
                                {formik.touched.title && formik.errors.title && <p className="text-rose-500 text-[8px] font-black uppercase tracking-widest ml-2 animate-pulse">{formik.errors.title}</p>}
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-[9px] font-black text-slate-500 uppercase tracking-[0.4em] ml-2 italic">Start Date</label>
                                    <input
                                        type="date"
                                        name="startDate"
                                        {...formik.getFieldProps('startDate')}
                                        className="w-full bg-slate-950 border border-slate-800 h-12 px-5 rounded-md text-slate-100 outline-none focus:border-superadmin-primary transition-all italic font-black text-xs"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[9px] font-black text-slate-500 uppercase tracking-[0.4em] ml-2 italic">End Date</label>
                                    <input
                                        type="date"
                                        name="endDate"
                                        {...formik.getFieldProps('endDate')}
                                        className="w-full bg-slate-950 border border-slate-800 h-12 px-5 rounded-md text-slate-100 outline-none focus:border-superadmin-primary transition-all italic font-black text-xs"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[9px] font-black text-slate-500 uppercase tracking-[0.4em] ml-2 italic">Description</label>
                                <textarea
                                    name="description"
                                    {...formik.getFieldProps('description')}
                                    placeholder="Enter details regarding this holiday..."
                                    className="w-full bg-slate-950 border border-slate-800 h-28 p-5 rounded-md text-slate-100 outline-none focus:border-superadmin-primary transition-all italic font-black text-xs resize-none"
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
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex-[2] h-12 rounded-md bg-gradient-to-r from-superadmin-primary to-indigo-500 text-black font-black tracking-[0.2em] uppercase text-[9px] shadow-lg shadow-superadmin-primary/20 hover:shadow-superadmin-primary/40 transition-all active:scale-95 flex items-center justify-center gap-2.5 italic"
                        >
                            {loading ? <Activity size={16} className="animate-spin text-black" /> : <Save size={16} className="text-black" />}
                            {editingHoliday ? 'Save Changes' : 'Add Holiday'}
                        </button>
                    </div>
                </form>
            </PortalModal>
        </motion.div>
    );
};

export default Holidays;
