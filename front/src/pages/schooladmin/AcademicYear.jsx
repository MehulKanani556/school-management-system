import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { 
    fetchAcademicYears, createAcademicYear, 
    updateAcademicYear, deleteAcademicYear,
    clearError, clearMessage 
} from '../../redux/slice/schoolAdmin.slice';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, Plus, Edit2, Trash2, CheckCircle, Clock, X, Save, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';

const AcademicYear = () => {
    const dispatch = useDispatch();
    const { academicYears, loading, error, message } = useSelector((state) => state.schoolAdmin);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingId, setEditingId] = useState(null);

    useEffect(() => {
        dispatch(fetchAcademicYears());
    }, [dispatch]);

    useEffect(() => {
        if (message) {
            toast.success(message);
            dispatch(clearMessage());
        }
        if (error) {
            toast.error(error);
            dispatch(clearError());
        }
    }, [message, error, dispatch]);

    const formik = useFormik({
        initialValues: {
            name: '',
            startDate: '',
            endDate: '',
            isCurrent: false
        },
        validationSchema: Yup.object({
            name: Yup.string().required('Session identifier required').matches(/^\d{4}-\d{2}$/, 'Format must be YYYY-YY (e.g. 2024-25)'),
            startDate: Yup.date().required('Initiation date required'),
            endDate: Yup.date().required('Conclusion date required')
                .min(Yup.ref('startDate'), 'Conclusion must follow initiation'),
            isCurrent: Yup.boolean()
        }),
        onSubmit: (values) => {
            if (editingId) {
                dispatch(updateAcademicYear({ id: editingId, data: values }));
            } else {
                dispatch(createAcademicYear(values));
            }
            setIsModalOpen(false);
            setEditingId(null);
            formik.resetForm();
        }
    });

    const handleEdit = (year) => {
        setEditingId(year._id);
        formik.setValues({
            name: year.name,
            startDate: year.startDate.split('T')[0],
            endDate: year.endDate.split('T')[0],
            isCurrent: year.isCurrent
        });
        setIsModalOpen(true);
    };

    const handleDelete = (id) => {
        if (window.confirm('Retract this temporal cycle from institutional memory?')) {
            dispatch(deleteAcademicYear(id));
        }
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-700">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-slate-900/40 p-8 rounded-md border border-slate-800/60 backdrop-blur-xl group">
                <div>
                    <div className="flex items-center gap-3 mb-2">
                        <div className="w-12 h-12 rounded-md bg-brand-primary/10 flex items-center justify-center border border-brand-primary/20 group-hover:scale-110 transition-transform">
                            <Calendar className="text-brand-primary" size={24} />
                        </div>
                        <h1 className="text-3xl font-black uppercase tracking-tight font-outfit">Temporal <span className="text-brand-primary">Cycles</span></h1>
                    </div>
                    <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em] ml-1">Archive & Orchestrate Academic Sessions</p>
                </div>
                <button 
                    onClick={() => { setEditingId(null); formik.resetForm(); setIsModalOpen(true); }}
                    className="flex items-center justify-center gap-3 bg-brand-primary hover:bg-brand-primary/90 text-white px-8 py-4 rounded-md font-black uppercase text-[11px] tracking-widest transition-all shadow-lg hover:-translate-y-1"
                >
                    <Plus size={18} />
                    INITIALIZE SESSION
                </button>
            </div>

            {/* Content */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {loading && academicYears.length === 0 ? (
                    <div className="col-span-full h-64 flex flex-col items-center justify-center opacity-50">
                        <Clock className="animate-spin text-brand-primary mb-4" size={32} />
                        <p className="font-black text-[10px] uppercase tracking-widest text-slate-500">Synchronizing Temporal Hub...</p>
                    </div>
                ) : (
                    <AnimatePresence>
                        {academicYears.map((year, i) => (
                            <motion.div 
                                key={year._id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.1 }}
                                className={`bg-slate-900/40 border rounded-md p-8 relative overflow-hidden group transition-all ${year.isCurrent ? 'border-brand-primary/40 RING-1 RING-brand-primary/20 bg-brand-primary/[0.02]' : 'border-slate-800/60'}`}
                            >
                                {year.isCurrent && (
                                    <div className="absolute top-0 right-0 px-6 py-2 bg-brand-primary text-white text-[9px] font-black uppercase tracking-widest rounded-bl-md shadow-lg">
                                        Active Cycle
                                    </div>
                                )}
                                
                                <div className="flex justify-between items-start mb-8">
                                    <div>
                                        <h3 className="text-2xl font-black uppercase font-outfit mb-1">{year.name}</h3>
                                        <div className="flex items-center gap-4 text-slate-500 text-[10px] font-bold uppercase tracking-widest">
                                            <span className="flex items-center gap-2"><Clock size={12}/> {new Date(year.startDate).toLocaleDateString()}</span>
                                            <span className="text-brand-primary">➔</span>
                                            <span className="flex items-center gap-2">{new Date(year.endDate).toLocaleDateString()}</span>
                                        </div>
                                    </div>
                                    <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button 
                                            onClick={() => handleEdit(year)}
                                            className="p-3 bg-slate-800 hover:bg-brand-primary text-slate-400 hover:text-white rounded-md transition-all border border-slate-700"
                                        >
                                            <Edit2 size={16} />
                                        </button>
                                        {!year.isCurrent && (
                                            <button 
                                                onClick={() => handleDelete(year._id)}
                                                className="p-3 bg-slate-800 hover:bg-red-500 text-slate-400 hover:text-white rounded-md transition-all border border-slate-700"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        )}
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="bg-slate-950/40 p-4 rounded-md border border-slate-800/60 font-inter">
                                        <p className="text-[8px] font-black text-slate-600 uppercase tracking-widest mb-1">Status</p>
                                        <p className={`text-[10px] font-black uppercase tracking-widest ${year.isCurrent ? 'text-brand-primary font-luxury-text bg-brand-primary/10 px-2 py-0.5 rounded-sm inline-block' : 'text-slate-500'}`}>
                                            {year.isCurrent ? 'Current Session' : 'Archived Cycle'}
                                        </p>
                                    </div>
                                    <div className="bg-slate-950/40 p-4 rounded-md border border-slate-800/60">
                                        <p className="text-[8px] font-black text-slate-600 uppercase tracking-widest mb-1">Timeline</p>
                                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                                            {Math.ceil((new Date(year.endDate) - new Date(year.startDate)) / (1000 * 60 * 60 * 24 * 30))} Epochs
                                        </p>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                )}
            </div>

            {/* Modal */}
            <AnimatePresence>
                {isModalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-slate-950/80 backdrop-blur-md" onClick={() => setIsModalOpen(false)} />
                        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="bg-slate-900 border border-slate-800 w-full max-w-lg rounded-md overflow-hidden relative shadow-2xl z-10">
                            <div className="p-8 border-b border-slate-800 flex justify-between items-center bg-slate-900/50 backdrop-blur-xl">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-md bg-brand-primary/10 flex items-center justify-center border border-brand-primary/20">
                                        <Plus className="text-brand-primary" size={18} />
                                    </div>
                                    <h2 className="text-lg font-black uppercase font-outfit tracking-wider">{editingId ? 'Edit Temporal Cycle' : 'Initialize Session'}</h2>
                                </div>
                                <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-slate-800 rounded-md transition-colors text-slate-500 hover:text-white"><X size={18}/></button>
                            </div>

                            <form onSubmit={formik.handleSubmit} className="p-8 space-y-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Session Identifier</label>
                                    <input 
                                        name="name"
                                        type="text" 
                                        className={`w-full bg-slate-800 border rounded-md p-4 text-[11px] font-black uppercase tracking-widest outline-none transition-all ${formik.touched.name && formik.errors.name ? 'border-red-500/50 bg-red-500/5' : 'border-slate-700 focus:border-brand-primary'}`}
                                        placeholder="E.G. 2024-25"
                                        {...formik.getFieldProps('name')}
                                    />
                                    {formik.touched.name && formik.errors.name && (
                                        <p className="text-[9px] text-red-500 font-bold uppercase tracking-widest flex items-center gap-1.5 mt-1.5"><AlertCircle size={10}/> {formik.errors.name}</p>
                                    )}
                                </div>

                                <div className="grid grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Initiation Date</label>
                                        <input 
                                            name="startDate"
                                            type="date" 
                                            className={`w-full bg-slate-800 border rounded-md p-4 text-[11px] font-black uppercase tracking-widest outline-none transition-all ${formik.touched.startDate && formik.errors.startDate ? 'border-red-500/50 bg-red-500/5' : 'border-slate-700 focus:border-brand-primary'}`}
                                            {...formik.getFieldProps('startDate')}
                                        />
                                        {formik.touched.startDate && formik.errors.startDate && (
                                            <p className="text-[9px] text-red-500 font-bold uppercase tracking-widest mt-1.5">{formik.errors.startDate}</p>
                                        )}
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Conclusion Date</label>
                                        <input 
                                            name="endDate"
                                            type="date" 
                                            className={`w-full bg-slate-800 border rounded-md p-4 text-[11px] font-black uppercase tracking-widest outline-none transition-all ${formik.touched.endDate && formik.errors.endDate ? 'border-red-500/50 bg-red-500/5' : 'border-slate-700 focus:border-brand-primary'}`}
                                            {...formik.getFieldProps('endDate')}
                                        />
                                        {formik.touched.endDate && formik.errors.endDate && (
                                            <p className="text-[9px] text-red-500 font-bold uppercase tracking-widest mt-1.5">{formik.errors.endDate}</p>
                                        )}
                                    </div>
                                </div>

                                <div className="flex items-center gap-3 p-4 bg-slate-800/50 rounded-md border border-slate-700/50">
                                    <input 
                                        name="isCurrent"
                                        type="checkbox" 
                                        id="isCurrent"
                                        className="w-4 h-4 rounded bg-slate-900 border-slate-700 text-brand-primary focus:ring-brand-primary focus:ring-offset-slate-900"
                                        checked={formik.values.isCurrent}
                                        onChange={formik.handleChange}
                                    />
                                    <label htmlFor="isCurrent" className="text-[10px] font-black uppercase tracking-widest text-slate-300">Set as Active High-Priority Session</label>
                                </div>

                                <button 
                                    type="submit"
                                    disabled={loading}
                                    className="w-full bg-brand-primary hover:bg-brand-primary/90 disabled:opacity-50 text-white py-5 rounded-md font-black uppercase text-[11px] tracking-[0.2em] transition-all shadow-xl hover:-translate-y-1 flex items-center justify-center gap-2"
                                >
                                    {loading && <Clock className="animate-spin" size={14}/>}
                                    {editingId ? 'COMMIT CHANGES' : 'SYNCHRONIZE SESSION'}
                                </button>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default AcademicYear;