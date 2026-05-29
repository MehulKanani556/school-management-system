import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchExams, fetchClasses, fetchSubjects, fetchStandards, createExam, updateExam, deleteExam, fetchExamAnalytics, toggleExamPublishStatus } from '../../redux/slice/schoolAdmin.slice';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Pencil, Trash2, Calendar, BookOpen, Clock, AlertCircle, BarChart3, TrendingUp, Users, Award, ChevronRight, Send, EyeOff, CheckCircle, XCircle } from 'lucide-react';
import Modal from '../../components/Modal';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, Cell, PieChart, Pie } from 'recharts';

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
    const { exams, classes, subjects, standards, loading, examAnalytics } = useSelector((s) => s.schoolAdmin);
    const { activeAcademicYearId } = useSelector((s) => s.academicYear);
    const [modal, setModal] = useState(false);
    const [editing, setEditing] = useState(null);
    const [analyticsModal, setAnalyticsModal] = useState(false);
    const [activeTab, setActiveTab] = useState('insights');

    const sortedExams = React.useMemo(() => {
        return [...exams].sort((a, b) => {
            const dateA = a.date ? new Date(a.date) : new Date(0);
            const dateB = b.date ? new Date(b.date) : new Date(0);
            return dateB - dateA;
        });
    }, [exams]);

    useEffect(() => {
        if (!activeAcademicYearId) return;
        dispatch(fetchExams());
        dispatch(fetchClasses());
        dispatch(fetchSubjects());
        dispatch(fetchStandards());
    }, [dispatch, activeAcademicYearId]);

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
                <button onClick={openAdd} className="flex items-center gap-2 px-6 py-3.5 bg-brand-primary hover:bg-blue-500 rounded-md font-black text-sm uppercase tracking-wider transition-all font-outfit shadow-[0_0_20px_rgba(37,99,235,0.2)] text-white">
                    <Plus size={18} /> Schedule Exam
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {loading && exams.length === 0 ? (
                    [...Array(6)].map((_, i) => <div key={i} className="h-44 rounded-md bg-slate-800/30 animate-pulse border border-white/5" />)
                ) : exams.length === 0 ? (
                    <div className="col-span-3 py-24 text-center border border-dashed border-slate-800 rounded-md">
                        <BookOpen size={48} className="text-slate-800 mx-auto mb-4 opacity-20" />
                        <p className="text-slate-500 font-bold uppercase tracking-widest text-[10px]">No Exams Scheduled In This Sector</p>
                    </div>
                ) : sortedExams.map((e, i) => (
                    <motion.div key={e._id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                        className="bg-brand-surface/40 backdrop-blur-xl border border-brand-border/40 rounded-md p-8 hover:border-brand-primary/30 transition-all group relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-8 text-slate-800 opacity-5 group-hover:opacity-20 transition-opacity pointer-events-none">
                            <BookOpen size={48} />
                        </div>
                        
                        <div className="flex items-start justify-between relative z-10">
                            <div className="flex flex-col gap-2">
                                <span className={`w-fit px-4 py-1.5 rounded-md text-[9px] font-black uppercase tracking-widest ${typeColor[e.type] || 'text-slate-400 bg-slate-400/10'}`}>{e.type.replace('_', ' ')}</span>
                                <div className={`flex items-center gap-1.5 px-3 py-1 rounded-md w-fit border ${e.isPublished ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-schooladmin-primary/10 border-schooladmin-primary/20 text-schooladmin-primary'}`}>
                                    <div className={`w-1 h-1 rounded-md ${e.isPublished ? 'bg-emerald-400 animate-pulse' : 'bg-schooladmin-primary'}`}></div>
                                    <span className="text-[8px] font-black uppercase tracking-widest">{e.isPublished ? 'Published' : 'Draft Status'}</span>
                                </div>
                            </div>
                            <div className="flex gap-2 relative z-10">
                                <button onClick={() => {
                                    dispatch(fetchExamAnalytics(e._id));
                                    setActiveTab('insights');
                                    setAnalyticsModal(true);
                                }} className="p-2.5 rounded-md bg-indigo-500/10 hover:bg-indigo-500 text-indigo-400 hover:text-white transition-all border border-indigo-500/20" title="Analytics">
                                    <BarChart3 size={14} />
                                </button>
                                <button onClick={() => dispatch(toggleExamPublishStatus(e._id))} 
                                    className={`p-2.5 rounded-md transition-all border ${e.isPublished ? 'bg-schooladmin-primary/10 border-schooladmin-primary/20 text-schooladmin-primary hover:bg-schooladmin-primary hover:text-white' : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500 hover:bg-emerald-500 hover:text-white'}`} 
                                    title={e.isPublished ? 'Revert to Draft' : 'Publish Results'}>
                                    {e.isPublished ? <EyeOff size={14} /> : <Send size={14} />}
                                </button>
                                <button onClick={() => openEdit(e)} className="p-2.5 rounded-md bg-slate-800/50 hover:bg-brand-primary group/edit transition-all" title="Edit">
                                    <Pencil size={14} className="text-slate-400 group-hover/edit:text-white" />
                                </button>
                                <button onClick={() => dispatch(deleteExam(e._id))} className="p-2.5 rounded-md bg-slate-800/50 hover:bg-red-500 group/del transition-all" title="Delete">
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
                                <div className="w-2 h-2 rounded-md bg-luxury-emerald"></div>
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
                            className={`w-full bg-slate-900/50 border ${formik.touched.name && formik.errors.name ? 'border-red-500' : 'border-brand-border/40'} focus:border-brand-primary rounded-md py-4 px-6 text-white outline-none text-sm transition-all`} />
                        {formik.touched.name && formik.errors.name && <p className="text-[10px] text-red-500 font-bold italic ml-1">{formik.errors.name}</p>}
                    </div>

                    <div className="grid grid-cols-2 gap-5">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 ml-1">Assessment Type</label>
                            <select name="type" value={formik.values.type} onChange={formik.handleChange} onBlur={formik.handleBlur}
                                className="w-full bg-slate-900/50 border border-brand-border/40 focus:border-brand-primary rounded-md py-4 px-6 text-white outline-none text-sm transition-all appearance-none cursor-pointer">
                                <option value="unit_test">Unit Test</option>
                                <option value="midterm">Midterm Cycle</option>
                                <option value="final">Final Directive</option>
                            </select>
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 ml-1">Precision Marks</label>
                            <input name="maxMarks" type="number" value={formik.values.maxMarks} onChange={formik.handleChange} onBlur={formik.handleBlur}
                                className={`w-full bg-slate-900/50 border ${formik.touched.maxMarks && formik.errors.maxMarks ? 'border-red-500' : 'border-brand-border/40'} focus:border-brand-primary rounded-md py-4 px-6 text-white outline-none text-sm transition-all`} />
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
                                className={`w-full bg-slate-900/50 border ${formik.touched.standardId && formik.errors.standardId ? 'border-red-500' : 'border-brand-border/40'} focus:border-brand-primary rounded-md py-4 px-6 text-white outline-none text-sm transition-all appearance-none cursor-pointer`}>
                                <option value="">Select Grade...</option>
                                {standards.map(s => <option key={s._id} value={s._id} className="bg-slate-900">Grade {s.level}</option>)}
                            </select>
                            {formik.touched.standardId && formik.errors.standardId && <p className="text-[10px] text-red-500 font-bold italic ml-1">{formik.errors.standardId}</p>}
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 ml-1">Class Section (Optional)</label>
                            <select name="classSection" value={formik.values.classSection} onChange={formik.handleChange} onBlur={formik.handleBlur}
                                className={`w-full bg-slate-900/50 border border-brand-border/40 focus:border-brand-primary rounded-md py-4 px-6 text-white outline-none text-sm transition-all appearance-none cursor-pointer ${!formik.values.standardId ? 'opacity-50 cursor-not-allowed' : ''}`}
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
                            className={`w-full bg-slate-900/50 border ${formik.touched.subject && formik.errors.subject ? 'border-red-500' : 'border-brand-border/40'} focus:border-brand-primary rounded-md py-4 px-6 text-white outline-none text-sm transition-all appearance-none cursor-pointer ${!formik.values.standardId ? 'opacity-50 cursor-not-allowed' : ''}`}
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
                                className={`w-full bg-slate-900/50 border ${formik.touched.date && formik.errors.date ? 'border-red-500' : 'border-brand-border/40'} focus:border-brand-primary rounded-md py-4 pl-14 pr-6 text-white outline-none text-sm transition-all`} />
                        </div>
                        {formik.touched.date && formik.errors.date && <p className="text-[10px] text-red-500 font-bold italic ml-1">{formik.errors.date}</p>}
                    </div>

                    <button type="submit" disabled={loading}
                        className="w-full py-5 bg-brand-primary hover:bg-blue-600 rounded-md font-black text-[13px] uppercase tracking-[0.3em] transition-all font-outfit mt-4 shadow-[0_0_30px_rgba(37,99,235,0.3)] text-white">
                        {loading ? 'Processing...' : editing ? 'Update Assessment' : 'Deploy Assessment'}
                    </button>
                </form>
            </Modal>

            {/* Analytics Modal */}
            <Modal open={analyticsModal} onClose={() => setAnalyticsModal(false)} title="Assessment Insights" maxWidth="max-w-6xl">
                <div className="flex gap-1 mb-6 bg-slate-900/50 p-1 rounded-md w-fit">
                    <button onClick={() => setActiveTab('insights')} className={`px-6 py-2 rounded text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'insights' ? 'bg-brand-primary text-white' : 'text-slate-500 hover:text-slate-300'}`}>Insights Spectrum</button>
                    <button onClick={() => setActiveTab('ledger')} className={`px-6 py-2 rounded text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'ledger' ? 'bg-brand-primary text-white' : 'text-slate-500 hover:text-slate-300'}`}>Full Marks Ledger</button>
                </div>

                {loading && !examAnalytics ? (
                    <div className="py-24 text-center">
                        <TrendingUp size={48} className="text-indigo-500 animate-pulse mx-auto mb-4" />
                        <p className="text-slate-400 font-black uppercase tracking-[0.2em] text-[10px]">Processing Statistical Data...</p>
                    </div>
                ) : examAnalytics ? (
                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
                        {activeTab === 'insights' ? (
                            <div className="space-y-8">
                                {/* Summary Header */}
                                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                    {[
                                        { label: 'Participated Students', val: examAnalytics.totalStudents, icon: Users, color: 'text-blue-400', bg: 'bg-blue-400/10' },
                                        { label: 'Average Score', val: `${examAnalytics.averageMarks}%`, icon: TrendingUp, color: 'text-emerald-400', bg: 'bg-emerald-400/10' },
                                        { label: 'Highest Pulse', val: examAnalytics.highest, icon: Award, color: 'text-schooladmin-primary', bg: 'bg-schooladmin-primary/10' },
                                        { label: 'Lowest Directive', val: examAnalytics.lowest || 0, icon: AlertCircle, color: 'text-rose-400', bg: 'bg-rose-400/10' },
                                    ].map((s, i) => (
                                        <div key={i} className="bg-slate-900/50 border border-white/5 rounded-md p-6">
                                            <div className="flex items-center gap-4">
                                                <div className={`w-12 h-12 rounded-md ${s.bg} flex items-center justify-center ${s.color}`}>
                                                    <s.icon size={20} />
                                                </div>
                                                <div>
                                                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">{s.label}</p>
                                                    <p className="text-xl font-black font-outfit mt-1 text-white">{s.val}</p>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                {/* Distribution and Top Performers */}
                                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                                    <div className="lg:col-span-2 bg-slate-900/40 border border-white/5 rounded-md p-8">
                                        <div className="flex items-center justify-between mb-8">
                                            <h3 className="text-xs font-black uppercase tracking-widest text-indigo-400 flex items-center gap-2">
                                                <BarChart3 size={14} /> Grade Distribution Spectrum
                                            </h3>
                                        </div>
                                        <div className="h-[300px] w-full">
                                            <ResponsiveContainer width="100%" height="100%">
                                                <BarChart data={examAnalytics.distribution} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
                                                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                                                    <XAxis dataKey="name" stroke="#64748b" fontSize={10} fontWeight="bold" axisLine={false} tickLine={false} />
                                                    <YAxis stroke="#64748b" fontSize={10} fontWeight="bold" axisLine={false} tickLine={false} />
                                                    <Tooltip cursor={{ fill: '#ffffff05' }} contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '1rem', color: '#fff' }} />
                                                    <Bar dataKey="value" radius={[8, 8, 0, 0]} barSize={40}>
                                                        {examAnalytics.distribution.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
                                                    </Bar>
                                                </BarChart>
                                            </ResponsiveContainer>
                                        </div>
                                    </div>
                                    <div className="bg-slate-900/40 border border-white/5 rounded-md p-8">
                                        <h3 className="text-xs font-black uppercase tracking-widest text-schooladmin-primary flex items-center gap-2 mb-6"><Award size={14} /> Top Achievers</h3>
                                        <div className="space-y-4">
                                            {examAnalytics.topPerformers.map((p, i) => (
                                                <div key={i} className="flex items-center justify-between group">
                                                    <div className="flex items-center gap-3">
                                                        <div className={`w-8 h-8 rounded-md flex items-center justify-center font-black text-xs ${i === 0 ? 'bg-schooladmin-primary/10 text-schooladmin-primary' : i === 1 ? 'bg-slate-300/10 text-slate-300' : i === 2 ? 'bg-orange-400/10 text-orange-400' : 'bg-slate-800 text-slate-500'}`}>{i + 1}</div>
                                                        <div>
                                                            <p className="text-xs font-bold text-slate-200 group-hover:text-white transition-colors capitalize">{p.name.toLowerCase()}</p>
                                                            <p className="text-[9px] font-medium text-slate-500">{p.admissionNumber}</p>
                                                        </div>
                                                    </div>
                                                    <div className="text-right">
                                                        <p className="text-xs font-black text-white">{p.marks}</p>
                                                        <p className="text-[9px] font-bold text-emerald-400">{p.percentage}%</p>
                                                    </div>
                                                </div>
                                            ))}
                                            {examAnalytics.topPerformers.length === 0 && <div className="py-12 text-center text-slate-600 text-[10px] font-black uppercase tracking-widest">Calculated Data Pending</div>}
                                        </div>
                                    </div>
                                </div>
                                <div className="bg-slate-900/40 border border-white/5 rounded-md p-8 flex flex-col items-center gap-6">
                                    <div className="w-full flex items-center justify-between">
                                        <h3 className="text-xs font-black uppercase tracking-widest text-indigo-400 flex items-center gap-2"><TrendingUp size={14} /> Subject Accuracy Matrix (Pass/Fail)</h3>
                                        <div className="text-[10px] font-black uppercase text-slate-600 italic tracking-[2px]">Minimum Efficiency Threshold: 40.0%</div>
                                    </div>
                                    <div className="w-full h-px bg-white/5"></div>
                                    <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
                                        <div className="space-y-4">
                                            <div className="flex items-center justify-between">
                                                <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Global Qualified Percentage</p>
                                                <p className="text-2xl font-black text-emerald-400 font-outfit">{examAnalytics.passRate}%</p>
                                            </div>
                                            <div className="h-4 w-full bg-slate-800 rounded-md overflow-hidden border border-white/5 shadow-inner">
                                                <motion.div initial={{ width: 0 }} animate={{ width: `${examAnalytics.passRate}%` }} transition={{ duration: 1.5, ease: 'easeOut' }} className="h-full bg-gradient-to-r from-emerald-600 to-teal-400 shadow-[0_0_20px_rgba(16,185,129,0.3)]" />
                                            </div>
                                            <div className="flex items-center gap-4 py-2">
                                                <div className="flex-1 bg-emerald-500/5 border border-emerald-500/10 rounded-md p-4 flex items-center gap-3">
                                                    <div className="w-8 h-8 rounded-md bg-emerald-500/10 flex items-center justify-center text-emerald-500"><CheckCircle size={16} /></div>
                                                    <div>
                                                        <p className="text-[9px] font-black uppercase text-slate-500 mb-1">Qualified Nodes</p>
                                                        <p className="text-lg font-black text-white">{examAnalytics.passCount}</p>
                                                    </div>
                                                </div>
                                                <div className="flex-1 bg-rose-500/5 border border-rose-500/10 rounded-md p-4 flex items-center gap-3">
                                                    <div className="w-8 h-8 rounded-md bg-rose-500/10 flex items-center justify-center text-rose-500"><XCircle size={16} /></div>
                                                    <div>
                                                        <p className="text-[9px] font-black uppercase text-slate-500 mb-1">Retained Nodes</p>
                                                        <p className="text-lg font-black text-white">{examAnalytics.failCount}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="bg-brand-primary/5 rounded-md p-6 border border-brand-primary/10">
                                            <p className="text-[10px] font-black uppercase tracking-widest text-indigo-400 mb-4 italic">Analytical Deduction</p>
                                            <p className="text-xs text-slate-400 leading-relaxed">The assessment achieved an overall performance accuracy of {examAnalytics.passRate}%. {examAnalytics.passCount} students qualified, while {examAnalytics.failCount} are recommended for remedial sessions.</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="bg-slate-900/40 border border-white/5 rounded-md overflow-hidden">
                                <table className="w-full">
                                    <thead>
                                        <tr className="border-b border-white/5 bg-slate-900/80">
                                            <th className="px-6 py-4 text-left text-[10px] font-black uppercase tracking-widest text-slate-500">Student Identity</th>
                                            <th className="px-6 py-4 text-left text-[10px] font-black uppercase tracking-widest text-slate-500">Admission No.</th>
                                            <th className="px-6 py-4 text-center text-[10px] font-black uppercase tracking-widest text-slate-500">Marks Secured</th>
                                            <th className="px-6 py-4 text-center text-[10px] font-black uppercase tracking-widest text-slate-500">Percentage</th>
                                            <th className="px-6 py-4 text-center text-[10px] font-black uppercase tracking-widest text-slate-500">Result Status</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {examAnalytics.studentPerformance?.map((p, i) => (
                                            <tr key={i} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                                                <td className="px-6 py-4 text-sm font-bold text-slate-200 capitalize">{p.name.toLowerCase()}</td>
                                                <td className="px-6 py-4 text-xs text-slate-500 font-mono">{p.admissionNumber}</td>
                                                <td className="px-6 py-4 text-center font-black text-white">{p.marks}</td>
                                                <td className="px-6 py-4 text-center text-indigo-400 font-bold">{p.percentage}%</td>
                                                <td className="px-6 py-4 text-center">
                                                    <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${p.result === 'Pass' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'}`}>
                                                        {p.result}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="py-24 text-center">
                         <AlertCircle size={48} className="text-slate-800 mx-auto mb-4 opacity-20" />
                         <p className="text-slate-500 font-black uppercase tracking-widest text-[10px]">No Marks Data Detected For This Node</p>
                    </div>
                )}
            </Modal>
        </div>
    );
};

export default Exams;
