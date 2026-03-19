import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchExams, fetchClasses, fetchSubjects, fetchStandards, createExam, updateExam, deleteExam } from '../../redux/slice/schoolAdmin.slice';
import { motion } from 'framer-motion';
import { Plus, Pencil, Trash2, Calendar, BookOpen, Clock, AlertCircle } from 'lucide-react';
import Modal from '../../components/Modal';
import { useFormik } from 'formik';
import * as Yup from 'yup';

const typeColor = { unit_test: 'text-blue-400 bg-blue-400/10', midterm: 'text-purple-400 bg-purple-400/10', final: 'text-red-400 bg-red-400/10' };

const validationSchema = Yup.object({
    name: Yup.string().required('Assessment label is required').min(3, 'Label too short'),
    type: Yup.string().required('Assessment type is required'),
    standardId: Yup.string().required('Standard is required'),
    classSection: Yup.string().nullable(),
    subject: Yup.string().required('Subject node is required'),
    maxMarks: Yup.number().required('Precision marks required').positive().min(1),
    date: Yup.date().required('Temporal date is required'),
});

const Exams = () => {
    const dispatch = useDispatch();
    const { exams, classes, subjects, standards, loading } = useSelector((s) => s.schoolAdmin);
    const [modal, setModal] = useState(false);
    const [editing, setEditing] = useState(null);

    useEffect(() => {
        dispatch(fetchExams());
        dispatch(fetchClasses());
        dispatch(fetchSubjects());
        dispatch(fetchStandards());
    }, [dispatch]);

    const formik = useFormik({
        initialValues: { name: '', type: 'unit_test', standardId: '', classSection: '', subject: '', maxMarks: 100, date: '' },
        validationSchema,
        onSubmit: (values) => {
            if (editing) dispatch(updateExam({ id: editing, data: values }));
            else dispatch(createExam(values));
            setModal(false);
            setEditing(null);
            formik.resetForm();
        },
    });

    const openAdd = () => { setEditing(null); formik.resetForm(); setModal(true); };
    const openEdit = (e) => {
        setEditing(e._id);
        formik.setValues({ 
            name: e.name,
            type: e.type,
            standardId: e.standardId?._id || e.standardId || '',
            classSection: e.classSection?._id || e.classSection || '', 
            subject: e.subject?._id || e.subject || '',
            maxMarks: e.maxMarks,
            date: e.date ? e.date.split('T')[0] : '' 
        });
        setModal(true);
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-black uppercase tracking-tighter font-outfit text-white">Exams Node</h1>
                    <p className="text-slate-400 text-sm mt-1">{exams.length} Institutional assessments scheduled</p>
                </div>
                <button onClick={openAdd} className="flex items-center gap-2 px-6 py-3.5 bg-brand-primary hover:bg-blue-500 rounded-2xl font-black text-sm uppercase tracking-wider transition-all font-outfit shadow-[0_0_20px_rgba(37,99,235,0.2)] text-white">
                    <Plus size={18} /> Schedule Exam
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {loading && exams.length === 0 ? (
                    [...Array(6)].map((_, i) => <div key={i} className="h-44 rounded-[2.5rem] bg-slate-800/30 animate-pulse border border-white/5" />)
                ) : exams.length === 0 ? (
                    <div className="col-span-3 py-24 text-center border border-dashed border-slate-800 rounded-[3rem]">
                        <BookOpen size={48} className="text-slate-800 mx-auto mb-4 opacity-20" />
                        <p className="text-slate-500 font-bold uppercase tracking-widest text-[10px]">No Exams Scheduled In This Sector</p>
                    </div>
                ) : exams.map((e, i) => (
                    <motion.div key={e._id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                        className="bg-brand-surface/40 backdrop-blur-xl border border-brand-border/40 rounded-[2.5rem] p-8 hover:border-brand-primary/30 transition-all group relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-8 text-slate-800 opacity-5 group-hover:opacity-20 transition-opacity pointer-events-none">
                            <BookOpen size={48} />
                        </div>
                        
                        <div className="flex items-start justify-between relative z-10">
                            <span className={`px-4 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest ${typeColor[e.type] || 'text-slate-400 bg-slate-400/10'}`}>{e.type.replace('_', ' ')}</span>
                            <div className="flex gap-2">
                                <button onClick={() => openEdit(e)} className="p-2.5 rounded-xl bg-slate-800/50 hover:bg-brand-primary group/edit transition-all">
                                    <Pencil size={14} className="text-slate-400 group-hover/edit:text-white" />
                                </button>
                                <button onClick={() => dispatch(deleteExam(e._id))} className="p-2.5 rounded-xl bg-slate-800/50 hover:bg-red-500 group/del transition-all">
                                    <Trash2 size={14} className="text-slate-400 group-hover/del:text-white" />
                                </button>
                            </div>
                        </div>

                        <div className="mt-6 relative z-10">
                            <h3 className="text-xl font-black font-outfit uppercase tracking-tighter text-white italic">{e.name}</h3>
                            <div className="flex items-center gap-2 mt-1 text-brand-primary">
                                <BookOpen size={12} />
                                <span className="text-[10px] font-black uppercase tracking-widest">{e.subject?.name || 'Institutional Subject'}</span>
                            </div>
                        </div>

                        <div className="flex items-center justify-between mt-8 pt-6 border-t border-brand-border/20 relative z-10">
                            <div className="flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full bg-luxury-emerald"></div>
                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                    {e.standardId ? `Grade ${e.standardId.level}${e.classSection ? `-${e.classSection.sectionLabel}` : ' (Whole Grade)'}` : 'Global Sector'}
                                </span>
                            </div>
                            <div className="flex items-center gap-2 text-slate-500">
                                <Clock size={12} />
                                <span className="text-[11px] font-bold">{e.date ? new Date(e.date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' }) : '—'}</span>
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>

            <Modal open={modal} onClose={() => setModal(false)} title={editing ? 'Update Assessment Pulse' : 'Schedule Assessment Pulse'}>
                <form onSubmit={formik.handleSubmit} className="space-y-5 p-2">
                    <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 ml-1">Assessment Label</label>
                        <input name="name" required value={formik.values.name} onChange={formik.handleChange} onBlur={formik.handleBlur}
                            className={`w-full bg-slate-900/50 border ${formik.touched.name && formik.errors.name ? 'border-red-500' : 'border-brand-border/40'} focus:border-brand-primary rounded-[1.2rem] py-4 px-6 text-white outline-none text-sm transition-all`} />
                        {formik.touched.name && formik.errors.name && <p className="text-[10px] text-red-500 font-bold italic ml-1">{formik.errors.name}</p>}
                    </div>

                    <div className="grid grid-cols-2 gap-5">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 ml-1">Assessment Type</label>
                            <select name="type" value={formik.values.type} onChange={formik.handleChange} onBlur={formik.handleBlur}
                                className="w-full bg-slate-900/50 border border-brand-border/40 focus:border-brand-primary rounded-[1.2rem] py-4 px-6 text-white outline-none text-sm transition-all appearance-none cursor-pointer">
                                <option value="unit_test">Unit Test</option>
                                <option value="midterm">Midterm Cycle</option>
                                <option value="final">Final Directive</option>
                            </select>
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 ml-1">Precision Marks</label>
                            <input name="maxMarks" type="number" value={formik.values.maxMarks} onChange={formik.handleChange} onBlur={formik.handleBlur}
                                className={`w-full bg-slate-900/50 border ${formik.touched.maxMarks && formik.errors.maxMarks ? 'border-red-500' : 'border-brand-border/40'} focus:border-brand-primary rounded-[1.2rem] py-4 px-6 text-white outline-none text-sm transition-all`} />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-5">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 ml-1">Standard (Grade)</label>
                            <select name="standardId" value={formik.values.standardId} 
                                onChange={(e) => {
                                    formik.handleChange(e);
                                    formik.setFieldValue('classSection', '');
                                }} 
                                onBlur={formik.handleBlur}
                                className={`w-full bg-slate-900/50 border ${formik.touched.standardId && formik.errors.standardId ? 'border-red-500' : 'border-brand-border/40'} focus:border-brand-primary rounded-[1.2rem] py-4 px-6 text-white outline-none text-sm transition-all appearance-none cursor-pointer`}>
                                <option value="">Select Grade...</option>
                                {standards.map(s => <option key={s._id} value={s._id} className="bg-slate-900">Grade {s.level}</option>)}
                            </select>
                            {formik.touched.standardId && formik.errors.standardId && <p className="text-[10px] text-red-500 font-bold italic ml-1">{formik.errors.standardId}</p>}
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 ml-1">Class Section (Optional)</label>
                            <select name="classSection" value={formik.values.classSection} onChange={formik.handleChange} onBlur={formik.handleBlur}
                                className={`w-full bg-slate-900/50 border border-brand-border/40 focus:border-brand-primary rounded-[1.2rem] py-4 px-6 text-white outline-none text-sm transition-all appearance-none cursor-pointer ${!formik.values.standardId ? 'opacity-50 cursor-not-allowed' : ''}`}
                                disabled={!formik.values.standardId}>
                                <option value="">Whole Grade...</option>
                                {classes
                                    .filter(c => (c.standardId?._id || c.standardId) === formik.values.standardId)
                                    .map(c => <option key={c._id} value={c._id} className="bg-slate-900">{c.sectionLabel}</option>)}
                            </select>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 ml-1">Subject Node</label>
                        <select name="subject" value={formik.values.subject} onChange={formik.handleChange} onBlur={formik.handleBlur}
                            className={`w-full bg-slate-900/50 border ${formik.touched.subject && formik.errors.subject ? 'border-red-500' : 'border-brand-border/40'} focus:border-brand-primary rounded-[1.2rem] py-4 px-6 text-white outline-none text-sm transition-all appearance-none cursor-pointer ${!formik.values.standardId ? 'opacity-50 cursor-not-allowed' : ''}`}
                            disabled={!formik.values.standardId}>
                            <option value="">Select Subject Reference...</option>
                            {standards
                                .find(st => st._id === formik.values.standardId)
                                ?.subjects?.map(s => (
                                    <option key={s._id} value={s._id} className="bg-slate-900">{s.name} ({s.code})</option>
                                ))
                            }
                        </select>
                        {formik.touched.subject && formik.errors.subject && <p className="text-[10px] text-red-500 font-bold italic ml-1">{formik.errors.subject}</p>}
                    </div>

                    <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 ml-1">Temporal Date</label>
                        <div className="relative">
                            <Calendar size={18} className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-500" />
                            <input name="date" required type="date" value={formik.values.date} onChange={formik.handleChange} onBlur={formik.handleBlur}
                                className={`w-full bg-slate-900/50 border ${formik.touched.date && formik.errors.date ? 'border-red-500' : 'border-brand-border/40'} focus:border-brand-primary rounded-[1.2rem] py-4 pl-14 pr-6 text-white outline-none text-sm transition-all`} />
                        </div>
                        {formik.touched.date && formik.errors.date && <p className="text-[10px] text-red-500 font-bold italic ml-1">{formik.errors.date}</p>}
                    </div>

                    <button type="submit" disabled={loading}
                        className="w-full py-5 bg-brand-primary hover:bg-blue-600 rounded-[1.5rem] font-black text-[13px] uppercase tracking-[0.3em] transition-all font-outfit mt-4 shadow-[0_0_30px_rgba(37,99,235,0.3)] text-white">
                        {loading ? 'Processing...' : editing ? 'Update Assessment' : 'Deploy Assessment'}
                    </button>
                </form>
            </Modal>
        </div>
    );
};

export default Exams;
