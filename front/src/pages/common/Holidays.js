import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchHolidays, createHoliday, updateHoliday, deleteHoliday, clearError } from '../../redux/slice/schoolAdmin.slice';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, Plus, Edit2, Trash2, X, Save, Clock, Info, Search, Activity, Sparkles, MapPin, AlertCircle, ArrowRight } from 'lucide-react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import toast from 'react-hot-toast';

const Holidays = () => {
    const dispatch = useDispatch();
    const { holidays, loading, error } = useSelector((state) => state.schoolAdmin);
    const { activeAcademicYearId } = useSelector((state) => state.academicYear);
    const { user } = useSelector((state) => state.auth);
    const isAdmin = user?.role === 'School_Admin';

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingHoliday, setEditingHoliday] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        dispatch(fetchHolidays());
    }, [dispatch]);

    // Refetch holidays when academic year changes
    useEffect(() => {
        if (activeAcademicYearId) {
            console.log('🎄 Holidays Page - Academic Year Changed:', activeAcademicYearId);
            dispatch(fetchHolidays());
        }
    }, [activeAcademicYearId, dispatch]);

    useEffect(() => {
        if (error) {
            toast.error(error);
            dispatch(clearError());
        }
    }, [error, dispatch]);

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
            endDate: Yup.date().min(Yup.ref('startDate'), "Invalid termination node").required('Required'),
        }),
        onSubmit: (values) => {
            if (editingHoliday) {
                dispatch(updateHoliday({ id: editingHoliday._id, data: values }))
                    .unwrap()
                    .then(() => {
                        toast.success('Temporal node recalibrated');
                        closeModal();
                    });
            } else {
                dispatch(createHoliday(values))
                    .unwrap()
                    .then(() => {
                        toast.success('New break protocol initialized');
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
        if (await window.confirm('Terminate this temporal break node?')) {
            dispatch(deleteHoliday(id))
                .unwrap()
                .then(() => toast.success('Node purged from history'));
        }
    };

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
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="pb-20">
            {/* More Compact Premium Header */}
            <header className="relative mb-8 group">
                <div className="absolute -top-6 -left-6 w-48 h-48 bg-brand-primary/10 rounded-md blur-[80px] opacity-40 group-hover:opacity-70 transition-opacity duration-1000"></div>
                
                <div className="relative z-10 bg-brand-surface/40 backdrop-blur-2xl border border-white/5 rounded-md p-1 shadow-xl overflow-hidden">
                    <div className="bg-brand-background/40 rounded-md px-8 py-10 flex flex-col xl:flex-row xl:items-center justify-between gap-8">
                        
                        <div className="space-y-4 max-w-xl">
                            <div className="flex items-center gap-2">
                                <div className="px-3 py-1 rounded-md bg-slate-900/80 border border-white/10 flex items-center gap-1.5 backdrop-blur-md shadow-md">
                                    <div className="w-1.5 h-1.5 rounded-md bg-brand-accent animate-ping"></div>
                                    <span className="text-[9px] font-black uppercase tracking-[0.2em] text-white/60 font-outfit">Global Calendar</span>
                                </div>
                            </div>

                            <div className="space-y-3">
                                <h1 className="text-3xl md:text-5xl font-extrabold text-white italic uppercase tracking-tight leading-tight font-outfit pr-6">
                                    Institutional <br />
                                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-primary via-brand-secondary to-brand-accent">Temporal Breaks</span>
                                </h1>
                                <p className="text-slate-500 font-medium text-xs md:text-sm max-w-md leading-normal italic tracking-wide">
                                    Unified synchronization layer for tracking academic rest windows and holiday protocols.
                                </p>
                            </div>

                            {nextHoliday && (
                                <div className="flex items-center gap-4 pt-1">
                                    <div className="flex -space-x-2">
                                        {[1,2].map(i => (
                                            <div key={i} className="w-7 h-7 rounded-md border border-brand-surface bg-slate-800 shadow-md"></div>
                                        ))}
                                    </div>
                                    <div className="space-y-0.5">
                                        <p className="text-[10px] font-bold text-white uppercase tracking-wider leading-none">
                                            {nextHoliday.title} <span className="text-brand-primary italic ml-1">in {Math.ceil((new Date(nextHoliday.startDate) - new Date()) / (1000 * 60 * 60 * 24))} Days</span>
                                        </p>
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="flex flex-col sm:flex-row items-center gap-4 self-stretch xl:self-center">
                            <div className="relative group w-full sm:w-64">
                                <Search size={16} className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-brand-accent transition-colors" />
                                <input 
                                    type="text" 
                                    placeholder="Identify specific break..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full bg-slate-950/60 border border-white/10 h-14 pl-12 pr-6 rounded-md text-[12px] font-black uppercase tracking-widest outline-none focus:border-brand-accent/40 focus:bg-slate-950/80 transition-all text-white italic font-outfit"
                                />
                            </div>
                            {isAdmin && (
                                <button 
                                    onClick={() => openModal()}
                                    className="w-full sm:w-auto flex items-center justify-center gap-4 bg-brand-primary hover:bg-brand-primary/90 text-white px-8 h-14 rounded-md font-black tracking-[0.2em] uppercase text-[10px] transition-all shadow-xl shadow-brand-primary/20 active:scale-95 font-outfit italic group overflow-hidden"
                                >
                                    <Plus size={18} className="group-hover:rotate-90 transition-transform duration-500" />
                                    New Protocol
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </header>



            {/* Grid of Holidays */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-10">
                <AnimatePresence mode='popLayout'>
                    {filteredHolidays.map((holiday, idx) => (
                        <motion.div 
                            key={holiday._id}
                            initial={{ opacity: 0, y: 30, filter: 'blur(10px)' }}
                            animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                            exit={{ opacity: 0, scale: 0.9, filter: 'blur(10px)' }}
                            transition={{ delay: idx * 0.08, duration: 0.5, ease: "circOut" }}
                            className="group relative"
                        >
                            {/* Card Glow Background */}
                            <div className="absolute -inset-[1px] bg-gradient-to-br from-white/15 to-white/0 rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                            
                            <div className="relative bg-brand-surface/60 backdrop-blur-2xl border border-white/5 rounded-md p-1 shadow-2xl h-full overflow-hidden transition-all duration-500 group-hover:translate-y-[-8px] group-hover:border-brand-primary/30">
                                {/* Inner Card Content */}
                                <div className="bg-brand-background/40 rounded-md p-5 space-y-4 h-full">
                                    <div className="flex items-start justify-between">
                                        {/* Date Badge Leaf Style */}
                                        <div className="flex flex-col items-center justify-center w-12 h-16 rounded-md bg-slate-900 border border-white/10 shadow-lg group-hover:border-brand-accent/50 transition-all group-hover:scale-105 duration-500 overflow-hidden relative">
                                            <div className="absolute top-0 left-0 w-full h-1.5 bg-brand-accent"></div>
                                            <span className="text-brand-accent text-[8px] font-black uppercase tracking-tighter opacity-80 mt-1">{new Date(holiday.startDate).toLocaleString('default', { month: 'short' })}</span>
                                            <span className="text-white text-xl font-black font-outfit leading-tight">{new Date(holiday.startDate).getDate()}</span>
                                        </div>

                                        {isAdmin && (
                                            <div className="flex gap-2">
                                                <button onClick={() => openModal(holiday)} className="w-9 h-9 rounded-md bg-slate-900/50 border border-white/5 text-slate-400 hover:text-brand-primary hover:border-brand-primary/40 hover:bg-slate-900 transition-all shadow-md flex items-center justify-center">
                                                    <Edit2 size={14} />
                                                </button>
                                                <button onClick={() => handleDelete(holiday._id)} className="w-9 h-9 rounded-md bg-slate-900/50 border border-white/5 text-slate-400 hover:text-luxury-rose hover:border-luxury-rose/40 hover:bg-slate-900 transition-all shadow-md flex items-center justify-center">
                                                    <Trash2 size={14} />
                                                </button>
                                            </div>
                                        )}
                                    </div>

                                    <div className="space-y-3">
                                        <div>
                                            <div className="flex items-center gap-2 mb-1 opacity-60">
                                                <MapPin size={10} className="text-brand-accent" />
                                                <span className="text-[8px] font-bold uppercase tracking-[0.3em] text-slate-400">Institutional</span>
                                            </div>
                                            <h3 className="text-lg font-black text-white italic uppercase tracking-tighter font-outfit group-hover:text-brand-accent transition-colors duration-500 leading-tight">{holiday.title}</h3>
                                        </div>

                                        {holiday.description && (
                                            <div className="p-4 rounded-md bg-slate-950/40 border border-white/5 group-hover:border-white/10 transition-colors">
                                                <p className="text-slate-400 text-[10px] font-medium leading-[1.5] italic font-outfit line-clamp-2 transition-all duration-700">{holiday.description}</p>
                                            </div>
                                        )}
                                    </div>

                                    <div className="pt-1 flex flex-col gap-3">
                                        <div className="flex items-center gap-2 px-4 py-2 rounded-md bg-slate-900 border border-white/5 w-fit">
                                            <Clock size={10} className="text-brand-secondary" />
                                            <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest italic flex items-center gap-2">
                                                {new Date(holiday.startDate).toLocaleDateString()}
                                                <ArrowRight size={10} className="text-slate-600" />
                                                {new Date(holiday.endDate).toLocaleDateString()}
                                            </p>
                                        </div>
                                        
                                        <div className="flex items-center gap-3">
                                            <span className="h-1 w-1 rounded-md bg-luxury-emerald animate-pulse shadow-[0_0_8px_#10b981]"></span>
                                            <span className="text-[8px] font-bold text-slate-500 uppercase tracking-[0.2em]">Active Protocol</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                        </motion.div>
                    ))}
                </AnimatePresence>

                {filteredHolidays.length === 0 && (
                    <div className="col-span-full py-40 rounded-md bg-brand-surface/20 border-2 border-dashed border-white/5 flex flex-col items-center justify-center gap-6 group">
                        <div className="w-24 h-24 rounded-md bg-slate-900 flex items-center justify-center border border-white/5 group-hover:scale-110 transition-transform duration-700">
                            <Activity size={40} className="text-slate-700 opacity-30 animate-pulse" />
                        </div>
                        <div className="text-center space-y-2">
                            <h4 className="text-slate-500 font-black uppercase tracking-[0.6em] text-xs italic font-outfit">Void Vector</h4>
                            <p className="text-slate-600 text-[10px] font-bold uppercase tracking-widest">No temporal break nodes detected in this sector</p>
                        </div>
                    </div>
                )}
            </div>

            {/* Redesigned Admin Modal */}
            <AnimatePresence>
                {isModalOpen && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 backdrop-blur-[20px] bg-black/60">
                        <motion.div 
                            initial={{ opacity: 0, scale: 0.9, y: 40 }} 
                            animate={{ opacity: 1, scale: 1, y: 0 }} 
                            exit={{ opacity: 0, scale: 0.9, y: 40 }}
                            className="w-full max-w-2xl bg-[#020617] border border-white/10 rounded-md shadow-[0_40px_120px_rgba(0,0,0,0.9)] overflow-hidden"
                        >
                            <form onSubmit={formik.handleSubmit}>
                                <div className="px-12 pt-14 pb-12 space-y-10">
                                    <div className="flex items-center justify-between">
                                        <div className="space-y-2">
                                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-brand-secondary/10 border border-brand-secondary/20 font-inter">
                                                <AlertCircle size={12} className="text-brand-secondary" />
                                                <span className="text-[9px] font-black uppercase tracking-widest text-brand-secondary">Nexus Configuration</span>
                                            </div>
                                            <h2 className="text-3xl font-black text-white italic uppercase tracking-tighter font-outfit leading-none">{editingHoliday ? 'Recalibrate' : 'Synchronize'} <span className="text-brand-accent">Node</span></h2>
                                        </div>
                                        <button type="button" onClick={closeModal} className="w-14 h-14 rounded-md bg-slate-900 border border-white/10 flex items-center justify-center text-slate-500 hover:text-white hover:border-white/30 transition-all active:scale-95 shadow-lg">
                                            <X size={24} />
                                        </button>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-6">
                                        <div className="col-span-full space-y-3">
                                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.4em] ml-6 font-outfit italic">Node Title</label>
                                            <div className="relative">
                                                <Info size={18} className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-600 pointer-events-none" />
                                                <input 
                                                    name="title"
                                                    {...formik.getFieldProps('title')}
                                                    placeholder="e.g. Winter Solstice Synchronisation"
                                                    className="w-full bg-slate-900/50 border border-white/10 h-16 px-8 rounded-md text-slate-100 outline-none focus:border-brand-accent focus:bg-slate-900 transition-all italic font-outfit font-black tracking-tight"
                                                />
                                            </div>
                                            {formik.touched.title && formik.errors.title && <p className="text-luxury-rose text-[9px] font-black uppercase tracking-widest ml-6 mt-1 animate-pulse">{formik.errors.title}</p>}
                                        </div>

                                        <div className="space-y-3">
                                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.4em] ml-6 font-outfit italic">Commencement</label>
                                            <input 
                                                type="date"
                                                name="startDate"
                                                {...formik.getFieldProps('startDate')}
                                                className="w-full bg-slate-900/50 border border-white/10 h-16 px-8 rounded-md text-slate-100 outline-none focus:border-brand-accent transition-all italic font-outfit font-black"
                                            />
                                        </div>
                                        <div className="space-y-3">
                                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.4em] ml-6 font-outfit italic">Termination</label>
                                            <input 
                                                type="date"
                                                name="endDate"
                                                {...formik.getFieldProps('endDate')}
                                                className="w-full bg-slate-900/50 border border-white/10 h-16 px-8 rounded-md text-slate-100 outline-none focus:border-brand-accent transition-all italic font-outfit font-black"
                                            />
                                        </div>

                                        <div className="col-span-full space-y-3">
                                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.4em] ml-6 font-outfit italic">Temporal Context</label>
                                            <textarea 
                                                name="description"
                                                {...formik.getFieldProps('description')}
                                                placeholder="Append metadata regarding this temporal break node..."
                                                className="w-full bg-slate-900/50 border border-white/10 h-36 p-8 rounded-md text-slate-100 outline-none focus:border-brand-accent transition-all italic font-outfit font-black resize-none"
                                            ></textarea>
                                        </div>
                                    </div>
                                </div>

                                <div className="p-10 bg-slate-900/40 border-t border-white/5 flex gap-6">
                                    <button 
                                        type="button" 
                                        onClick={closeModal}
                                        className="flex-1 h-16 rounded-md border border-white/10 font-black tracking-[0.3em] uppercase text-[10px] text-slate-500 hover:text-white hover:bg-slate-900 transition-all font-outfit italic active:scale-95"
                                    >
                                        Abort
                                    </button>
                                    <button 
                                        type="submit"
                                        disabled={loading}
                                        className="flex-[2] h-16 rounded-md bg-gradient-to-r from-brand-accent to-brand-primary text-white font-black tracking-[0.3em] uppercase text-[11px] shadow-2xl shadow-brand-accent/20 hover:shadow-brand-accent/40 transition-all active:scale-95 flex items-center justify-center gap-4 font-outfit italic"
                                    >
                                        {loading ? <Activity size={20} className="animate-spin" /> : <Save size={20} />}
                                        Initialize Protocol
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </motion.div>
    );
};

export default Holidays;

