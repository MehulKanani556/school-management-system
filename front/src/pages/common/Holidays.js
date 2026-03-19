import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchHolidays, createHoliday, updateHoliday, deleteHoliday, clearError } from '../../redux/slice/schoolAdmin.slice';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, Plus, Edit2, Trash2, X, Save, Clock, Info, Search, Activity } from 'lucide-react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import toast from 'react-hot-toast';

const Holidays = () => {
    const dispatch = useDispatch();
    const { holidays, loading, error } = useSelector((state) => state.schoolAdmin);
    const { user } = useSelector((state) => state.auth);
    const isAdmin = user?.role === 'School_Admin';

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingHoliday, setEditingHoliday] = useState(null);
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

    const formik = useFormik({
        initialValues: {
            title: '',
            startDate: '',
            endDate: '',
            description: ''
        },
        validationSchema: Yup.object({
            title: Yup.string().required('Title required'),
            startDate: Yup.date().required('Start date required'),
            endDate: Yup.date().min(Yup.ref('startDate'), "End date cannot be before start date").required('End date required'),
        }),
        onSubmit: (values) => {
            if (editingHoliday) {
                dispatch(updateHoliday({ id: editingHoliday._id, data: values }))
                    .unwrap()
                    .then(() => {
                        toast.success('Calendar entry synchronized');
                        closeModal();
                    });
            } else {
                dispatch(createHoliday(values))
                    .unwrap()
                    .then(() => {
                        toast.success('New holiday protocol initiated');
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

    const handleDelete = (id) => {
        if (window.confirm('Confirm protocol termination for this calendar node?')) {
            dispatch(deleteHoliday(id))
                .unwrap()
                .then(() => toast.success('Calendar node purged'));
        }
    };

    const filteredHolidays = holidays.filter(h => 
        h.title.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} className="space-y-8">
            <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 bg-slate-900/40 p-10 rounded-[3rem] border border-slate-800/60 shadow-2xl backdrop-blur-xl">
                <div className="space-y-2">
                    <div className="flex items-center gap-3 mb-2">
                        <span className="w-12 h-[2px] bg-brand-primary rounded-full"></span>
                        <span className="text-[10px] font-black uppercase tracking-[0.4em] text-brand-primary font-outfit">Institutional Calendar</span>
                    </div>
                    <h1 className="text-4xl font-black text-white italic uppercase tracking-tighter leading-none font-outfit text-shadow-glow">Academic Breaks</h1>
                    <p className="text-slate-500 font-medium text-sm tracking-wide italic">Digital archival of global and institutional holiday protocols.</p>
                </div>

                <div className="flex items-center gap-4">
                    <div className="relative group hidden md:block">
                        <Search size={16} className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-brand-primary transition-colors" />
                        <input 
                            type="text" 
                            placeholder="Identify break node..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="bg-slate-950/50 border border-slate-800 h-12 pl-12 pr-6 rounded-2xl text-[11px] font-bold uppercase tracking-widest outline-none focus:border-brand-primary transition-all text-white w-64 italic font-outfit"
                        />
                    </div>
                    {isAdmin && (
                        <button 
                            onClick={() => openModal()}
                            className="flex items-center gap-3 bg-brand-primary hover:bg-blue-600 text-white px-8 h-12 rounded-2xl font-black tracking-[0.2em] uppercase text-[10px] transition-all shadow-lg active:scale-95 font-outfit italic"
                        >
                            <Plus size={18} />
                            New Protocol
                        </button>
                    )}
                </div>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                <AnimatePresence mode='popLayout'>
                    {filteredHolidays.map((holiday, idx) => (
                        <motion.div 
                            key={holiday._id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            transition={{ delay: idx * 0.05 }}
                            className="group relative bg-slate-900/40 border border-slate-800/60 rounded-[2.5rem] p-8 hover:border-brand-primary/40 transition-all duration-500 overflow-hidden shadow-2xl backdrop-blur-md"
                        >
                            <div className="absolute top-0 right-0 w-32 h-32 bg-brand-primary/5 blur-[50px] group-hover:bg-brand-primary/10 transition-all"></div>
                            
                            <div className="relative z-10 space-y-6">
                                <div className="flex items-start justify-between">
                                    <div className="w-14 h-14 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-center text-brand-primary shadow-inner group-hover:scale-110 transition-transform duration-700">
                                        <Calendar size={24} />
                                    </div>
                                    {isAdmin && (
                                        <div className="flex gap-2">
                                            <button onClick={() => openModal(holiday)} className="p-2.5 rounded-xl border border-slate-800 bg-slate-950 text-slate-500 hover:text-brand-primary hover:border-brand-primary/40 transition-all shadow-lg">
                                                <Edit2 size={14} />
                                            </button>
                                            <button onClick={() => handleDelete(holiday._id)} className="p-2.5 rounded-xl border border-slate-800 bg-slate-950 text-slate-500 hover:text-luxury-rose hover:border-luxury-rose/40 transition-all shadow-lg">
                                                <Trash2 size={14} />
                                            </button>
                                        </div>
                                    )}
                                </div>

                                <div>
                                    <h3 className="text-xl font-black text-white italic uppercase tracking-tighter font-outfit group-hover:text-brand-primary transition-colors">{holiday.title}</h3>
                                    <div className="flex items-center gap-2 mt-2">
                                        <Clock size={12} className="text-slate-600" />
                                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{new Date(holiday.startDate).toLocaleDateString()} — {new Date(holiday.endDate).toLocaleDateString()}</p>
                                    </div>
                                </div>

                                {holiday.description && (
                                    <div className="p-5 rounded-2xl bg-slate-950/50 border border-slate-800/40 border-dashed">
                                        <p className="text-slate-400 text-xs font-medium leading-relaxed italic font-outfit">{holiday.description}</p>
                                    </div>
                                )}

                                <div className="flex items-center gap-3 pt-2">
                                    <span className="px-3 py-1 bg-brand-primary/10 border border-brand-primary/20 rounded-full text-[9px] font-black text-brand-primary uppercase tracking-[0.2em] italic">Active Break</span>
                                    <span className="w-1 h-1 bg-slate-800 rounded-full"></span>
                                    <span className="text-[9px] font-bold text-slate-600 uppercase tracking-widest">Sector: Global</span>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </AnimatePresence>

                {filteredHolidays.length === 0 && (
                    <div className="col-span-full py-48 border-2 border-dashed border-slate-800/40 rounded-[4rem] bg-slate-900/20 flex flex-col items-center justify-center">
                        <Activity size={48} className="text-slate-800 mb-6 opacity-20 animate-pulse" />
                        <p className="text-slate-600 font-black uppercase tracking-[0.5em] text-[11px] italic font-outfit">No calendar nodes found in this sector</p>
                    </div>
                )}
            </div>

            {/* Admin CRUD Modal */}
            <AnimatePresence>
                {isModalOpen && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 backdrop-blur-2xl">
                        <motion.div 
                            initial={{ opacity: 0, scale: 0.9, y: 20 }} 
                            animate={{ opacity: 1, scale: 1, y: 0 }} 
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            className="w-full max-w-xl bg-slate-950 border border-slate-800/60 rounded-[3.5rem] shadow-[0_40px_100px_rgba(0,0,0,0.8)] overflow-hidden"
                        >
                            <form onSubmit={formik.handleSubmit}>
                                <div className="p-10 space-y-8">
                                    <div className="flex items-center justify-between">
                                        <div className="space-y-1">
                                            <h2 className="text-2xl font-black text-white italic uppercase tracking-tighter font-outfit">{editingHoliday ? 'Update' : 'Initialize'} Calendar Node</h2>
                                            <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest italic">Temporal synchronization protocol</p>
                                        </div>
                                        <button type="button" onClick={closeModal} className="w-12 h-12 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-500 hover:text-white transition-all">
                                            <X size={20} />
                                        </button>
                                    </div>

                                    <div className="space-y-6">
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] ml-4 font-outfit italic">Node Title</label>
                                            <input 
                                                name="title"
                                                {...formik.getFieldProps('title')}
                                                placeholder="e.g. Winter Solstice Break"
                                                className="w-full bg-slate-900/50 border border-slate-800 h-16 px-8 rounded-2xl text-slate-100 outline-none focus:border-brand-primary transition-all italic font-outfit font-black tracking-tight"
                                            />
                                            {formik.touched.title && formik.errors.title && <p className="text-luxury-rose text-[9px] font-black uppercase tracking-widest ml-4 mt-2">{formik.errors.title}</p>}
                                        </div>

                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] ml-4 font-outfit italic">Commencement</label>
                                                <input 
                                                    type="date"
                                                    name="startDate"
                                                    {...formik.getFieldProps('startDate')}
                                                    className="w-full bg-slate-900/50 border border-slate-800 h-16 px-8 rounded-2xl text-slate-100 outline-none focus:border-brand-primary transition-all italic font-outfit font-black"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] ml-4 font-outfit italic">Termination</label>
                                                <input 
                                                    type="date"
                                                    name="endDate"
                                                    {...formik.getFieldProps('endDate')}
                                                    className="w-full bg-slate-900/50 border border-slate-800 h-16 px-8 rounded-2xl text-slate-100 outline-none focus:border-brand-primary transition-all italic font-outfit font-black"
                                                />
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] ml-4 font-outfit italic">Nomenclature Metadata</label>
                                            <textarea 
                                                name="description"
                                                {...formik.getFieldProps('description')}
                                                placeholder="Additional details regarding this calendar break..."
                                                className="w-full bg-slate-900/50 border border-slate-800 h-32 p-8 rounded-[2rem] text-slate-100 outline-none focus:border-brand-primary transition-all italic font-outfit font-black resize-none"
                                            ></textarea>
                                        </div>
                                    </div>
                                </div>

                                <div className="p-8 bg-slate-900/30 border-t border-slate-800/60 flex gap-4">
                                    <button 
                                        type="button" 
                                        onClick={closeModal}
                                        className="flex-1 h-16 rounded-2xl border border-slate-800 font-black tracking-[0.2em] uppercase text-[10px] text-slate-500 hover:bg-slate-900 transition-all font-outfit italic"
                                    >
                                        Terminate
                                    </button>
                                    <button 
                                        type="submit"
                                        disabled={loading}
                                        className="flex-[2] h-16 rounded-2xl bg-brand-primary text-white font-black tracking-[0.2em] uppercase text-[10px] shadow-lg hover:bg-blue-600 transition-all active:scale-95 flex items-center justify-center gap-3 font-outfit italic"
                                    >
                                        {loading ? <Activity size={18} className="animate-spin" /> : <Save size={18} />}
                                        Synchronize Node
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
