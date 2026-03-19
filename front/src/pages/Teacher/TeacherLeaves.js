import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchMyLeaves, applyLeave, clearTeacherMessage } from '../../redux/slice/teacher.slice';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { motion } from 'framer-motion';
import { Plus, CalendarDays, Clock, CheckCircle2, XCircle, ChevronRight, Info } from 'lucide-react';
import Modal from '../../components/Modal';
import { format, parseISO } from 'date-fns';
import toast from 'react-hot-toast';

const validationSchema = Yup.object({
    type: Yup.string().oneOf(['sick', 'casual', 'maternity', 'paternity', 'other']).required('Leave type is required'),
    startDate: Yup.date().required('Start date is required').min(new Date(), 'Start date cannot be in the past'),
    endDate: Yup.date().required('End date is required').min(Yup.ref('startDate'), 'End date must be after start date'),
    reason: Yup.string().min(10, 'Reason must be at least 10 characters').required('Reason is required'),
});

const inputClass = "w-full bg-slate-800 border border-slate-700/50 rounded-xl py-3 px-4 text-white placeholder-slate-500 outline-none focus:border-brand-primary transition-all text-sm";

const StatusBadge = ({ status }) => {
    const configs = {
        pending: { color: 'text-amber-400 bg-amber-400/10', icon: Clock },
        approved: { color: 'text-emerald-400 bg-emerald-400/10', icon: CheckCircle2 },
        rejected: { color: 'text-rose-400 bg-rose-400/10', icon: XCircle }
    };
    const { color, icon: Icon } = configs[status] || configs.pending;
    return (
        <span className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest ${color}`}>
            <Icon size={12} /> {status}
        </span>
    );
};

const TeacherLeaves = () => {
    const dispatch = useDispatch();
    const { leaves, loading, message } = useSelector((s) => s.teacher);
    const [modal, setModal] = useState(false);

    useEffect(() => { 
        dispatch(fetchMyLeaves()); 
    }, [dispatch]);

    useEffect(() => {
        if (message) {
            toast.success(message);
            dispatch(clearTeacherMessage());
        }
    }, [message, dispatch]);

    const formik = useFormik({
        initialValues: { type: 'sick', startDate: '', endDate: '', reason: '' },
        validationSchema,
        onSubmit: async (values, { resetForm }) => {
            const res = await dispatch(applyLeave(values));
            if (!res.error) {
                setModal(false);
                resetForm();
            }
        }
    });

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-black uppercase tracking-tighter font-outfit text-white">Leave Portal</h1>
                    <p className="text-slate-500 text-sm mt-1">Manage your time-off applications and track status</p>
                </div>
                <button onClick={() => setModal(true)} className="flex items-center gap-2 px-6 py-4 bg-brand-primary hover:bg-blue-600 rounded-2xl font-black text-xs uppercase tracking-widest transition-all shadow-xl shadow-blue-600/20 active:scale-95">
                    <Plus size={18} /> Apply for Leave
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Statistics */}
                <div className="lg:col-span-1 space-y-4">
                    <div className="bg-slate-800/40 border border-slate-700/50 p-6 rounded-3xl">
                        <div className="flex items-center justify-between mb-4">
                           <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Quota Usage</h3>
                           <Info size={14} className="text-slate-600" />
                        </div>
                        <div className="space-y-4">
                            {[
                                { label: 'Sick Leaves', used: leaves.filter(l => l.type === 'sick' && l.status === 'approved').length, total: 12 },
                                { label: 'Casual Leaves', used: leaves.filter(l => l.type === 'casual' && l.status === 'approved').length, total: 15 },
                            ].map(item => (
                                <div key={item.label}>
                                    <div className="flex justify-between text-[11px] font-bold mb-2">
                                        <span className="text-slate-400">{item.label}</span>
                                        <span className="text-white">{item.used} / {item.total}</span>
                                    </div>
                                    <div className="h-1.5 bg-slate-700/50 rounded-full overflow-hidden">
                                        <div className="h-full bg-brand-primary rounded-full transition-all duration-1000" style={{ width: `${(item.used / item.total) * 100}%` }} />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="bg-brand-primary/10 border border-brand-primary/20 p-6 rounded-3xl">
                        <CalendarDays size={24} className="text-brand-primary mb-3" />
                        <h4 className="text-sm font-bold text-white mb-2">Upcoming Holidays</h4>
                        <p className="text-xs text-slate-400 leading-relaxed">Check the holiday calendar before applying for leave to optimize your time off.</p>
                        <button className="mt-4 text-[10px] font-black uppercase tracking-widest text-brand-primary hover:underline">View Calendar</button>
                    </div>
                </div>

                {/* History */}
                <div className="lg:col-span-2 space-y-4">
                    <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 px-2">Application History</h3>
                    {leaves.length === 0 ? (
                        <div className="bg-slate-800/20 border border-dashed border-slate-700/50 rounded-[2rem] py-20 text-center">
                            <Clock size={40} className="mx-auto text-slate-700 mb-4 opacity-40" />
                            <p className="text-slate-500 font-medium">No leave applications found</p>
                        </div>
                    ) : (
                        leaves.map((l, i) => (
                            <motion.div 
                                key={l._id}
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: i * 0.05 }}
                                className="bg-slate-800/40 border border-slate-700/30 p-6 rounded-2xl hover:border-slate-600 transition-all group"
                            >
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-xl bg-slate-900 border border-white/5 flex items-center justify-center text-brand-primary group-hover:scale-110 transition-transform">
                                            <CalendarDays size={18} />
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <h4 className="font-bold text-white text-sm capitalize">{l.type} Leave</h4>
                                                <div className="w-1 h-1 rounded-full bg-slate-700" />
                                                <p className="text-[10px] font-bold text-slate-500">{format(parseISO(l.startDate), 'dd MMM')} — {format(parseISO(l.endDate), 'dd MMM')}</p>
                                            </div>
                                            <p className="text-[11px] text-slate-500 mt-1 line-clamp-1">{l.reason}</p>
                                        </div>
                                    </div>
                                    <StatusBadge status={l.status} />
                                </div>
                            </motion.div>
                        ))
                    )}
                </div>
            </div>

            <Modal open={modal} onClose={() => setModal(false)} title="Apply for Leave">
                <form onSubmit={formik.handleSubmit} className="space-y-4">
                    <div>
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1.5 block px-1">Leave Type</label>
                        <select {...formik.getFieldProps('type')} className={inputClass}>
                            <option value="sick">Sick Leave</option>
                            <option value="casual">Casual Leave</option>
                            <option value="maternity">Maternity Leave</option>
                            <option value="paternity">Paternity Leave</option>
                            <option value="other">Other</option>
                        </select>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1.5 block px-1">Start Date</label>
                            <input type="date" {...formik.getFieldProps('startDate')} className={inputClass} />
                            {formik.touched.startDate && formik.errors.startDate && <p className="text-[10px] text-red-500 mt-1 pl-1 font-bold italic">{formik.errors.startDate}</p>}
                        </div>
                        <div>
                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1.5 block px-1">End Date</label>
                            <input type="date" {...formik.getFieldProps('endDate')} className={inputClass} />
                            {formik.touched.endDate && formik.errors.endDate && <p className="text-[10px] text-red-500 mt-1 pl-1 font-bold italic">{formik.errors.endDate}</p>}
                        </div>
                    </div>

                    <div>
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1.5 block px-1">Reason for Leave</label>
                        <textarea {...formik.getFieldProps('reason')} rows={4} className={`${inputClass} resize-none`} placeholder="Briefly describe the reason for your application..."></textarea>
                        {formik.touched.reason && formik.errors.reason && <p className="text-[10px] text-red-500 mt-1 pl-1 font-bold italic">{formik.errors.reason}</p>}
                    </div>

                    <button type="submit" disabled={loading} className="w-full mt-4 py-4 bg-brand-primary hover:bg-blue-600 disabled:opacity-50 rounded-2xl font-black text-xs uppercase tracking-widest transition-all flex items-center justify-center gap-2">
                        {loading ? 'Submitting...' : 'Confirm Application'} <ChevronRight size={16} />
                    </button>
                </form>
            </Modal>
        </div>
    );
};

export default TeacherLeaves;
