import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchMyLeaves, applyForLeave } from '../../redux/slice/staff.slice';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { motion } from 'framer-motion';
import { Plus, CalendarDays, Clock, CheckCircle2, XCircle, ChevronRight, Info } from 'lucide-react';
import Modal from '../../components/Modal';
import { format, parseISO } from 'date-fns';
import { useNavigate } from 'react-router-dom';

const validationSchema = Yup.object({
    type: Yup.string().oneOf(['sick', 'casual', 'maternity', 'paternity', 'other']).required('Leave type is required'),
    startDate: Yup.date().required('Start date is required').min(new Date(), 'Start date cannot be in the past'),
    endDate: Yup.date().required('End date is required').min(Yup.ref('startDate'), 'End date must be after start date'),
    reason: Yup.string().min(10, 'Reason must be at least 10 characters').required('Reason is required'),
});

const inputClass = "w-full bg-slate-800 border border-slate-700/50 rounded-md py-3 px-4 text-white placeholder-slate-500 outline-none focus:border-brand-primary transition-all text-sm";

const StatusBadge = ({ status }) => {
    const configs = {
        pending: { color: 'text-amber-400 bg-amber-400/10', icon: Clock },
        approved: { color: 'text-emerald-400 bg-emerald-400/10', icon: CheckCircle2 },
        rejected: { color: 'text-rose-400 bg-rose-400/10', icon: XCircle }
    };
    const { color, icon: Icon } = configs[status] || configs.pending;
    return (
        <span className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-[10px] font-black uppercase tracking-widest ${color}`}>
            <Icon size={12} /> {status}
        </span>
    );
};

const StaffLeavePortal = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { myLeaves, loading } = useSelector((s) => s.staff);
    const { user } = useSelector((s) => s.auth);
    const [modal, setModal] = useState(false);

    useEffect(() => {
        dispatch(fetchMyLeaves());
    }, [dispatch]);

    const formik = useFormik({
        initialValues: { type: 'sick', startDate: '', endDate: '', reason: '' },
        validationSchema,
        onSubmit: async (values, { resetForm }) => {
            const res = await dispatch(applyForLeave(values));
            if (!res.error) {
                setModal(false);
                resetForm();
            }
        }
    });

    const calculateDays = (start, end) => {
        const s = new Date(start);
        const e = new Date(end);
        const diff = Math.abs(e - s);
        return Math.ceil(diff / (1000 * 60 * 60 * 24)) + 1;
    };

    const roleColor = user?.role === 'Accountant' ? 'bg-amber-500' : (user?.role === 'Transport_Manager' ? 'bg-orange-500' : 'bg-teal-500');
    const roleHover = user?.role === 'Accountant' ? 'hover:bg-amber-600' : (user?.role === 'Transport_Manager' ? 'hover:bg-orange-600' : 'hover:bg-teal-600');

    return (
        <div className="space-y-8 font-outfit">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl text-left font-black uppercase tracking-tighter text-white">Institutional Leaves</h1>
                    <p className="text-slate-500 text-sm mt-1 italic font-bold uppercase tracking-widest opacity-80">Operational Departure Registry & Oversight</p>
                </div>
                <button onClick={() => setModal(true)} className={`flex items-center gap-2 px-6 py-4 ${roleColor} ${roleHover} text-black rounded-md font-black text-xs uppercase tracking-widest transition-all shadow-xl active:scale-95`}>
                    <Plus size={18} /> Apply for Leave
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-1 space-y-4">
                    <div className="bg-slate-800/40 border border-slate-700/50 p-6 rounded-md">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Leave Quota (Annual)</h3>
                            <Info size={14} className="text-slate-600" />
                        </div>
                        <div className="space-y-4">
                            {[
                                { label: 'Sick Leaves', used: myLeaves.filter(l => l.type === 'sick' && l.status === 'approved').reduce((acc, c) => acc + calculateDays(c.startDate, c.endDate), 0), total: 12 },
                                { label: 'Casual Leaves', used: myLeaves.filter(l => l.type === 'casual' && l.status === 'approved').reduce((acc, c) => acc + calculateDays(c.startDate, c.endDate), 0), total: 15 },
                            ].map(item => (
                                <div key={item.label}>
                                    <div className="flex justify-between text-[11px] font-bold mb-2">
                                        <span className="text-slate-400">{item.label}</span>
                                        <span className="text-white">{item.used} / {item.total}</span>
                                    </div>
                                    <div className="h-1.5 bg-slate-700/50 rounded-md overflow-hidden">
                                        <div className={`h-full ${roleColor} rounded-md transition-all shadow-xl`} style={{ width: `${Math.min(100, (item.used / item.total) * 100)}%` }} />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="lg:col-span-2 space-y-4">
                    <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 px-2 italic font-bold">Leave Application History</h3>
                    {myLeaves.length === 0 ? (
                        <div className="bg-slate-800/20 border border-dashed border-slate-700/50 rounded-md py-20 text-center">
                            <Clock size={40} className="mx-auto text-slate-700 mb-4 opacity-40" />
                            <p className="text-slate-500 font-medium whitespace-nowrap uppercase tracking-widest text-xs font-black">No Registry Entries Found</p>
                        </div>
                    ) : (
                        myLeaves.map((l, i) => (
                            <motion.div
                                key={l._id}
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: i * 0.05 }}
                                className="bg-slate-800/40 border border-slate-700/30 p-6 rounded-md hover:border-slate-600 transition-all group relative overflow-hidden"
                            >
                                <div className={`absolute top-0 left-0 w-1 h-full bg-transparent group-hover:${roleColor} transition-all`} />
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <div className={`w-12 h-12 rounded-md bg-slate-900 border border-white/5 flex items-center justify-center ${roleColor.replace('bg', 'text')} group-hover:${roleColor} group-hover:text-black transition-all shadow-xl font-mono italic`}>
                                            <CalendarDays size={20} />
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-3">
                                                <h4 className="font-black text-white text-sm uppercase italic tracking-tighter">{l.type} Leave</h4>
                                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{format(parseISO(l.startDate), 'dd MMM')} — {format(parseISO(l.endDate), 'dd MMM')}</p>
                                                <span className="text-[9px] font-black text-slate-600 uppercase tracking-tighter ml-2">({calculateDays(l.startDate, l.endDate)} Days)</span>
                                            </div>
                                            <p className="text-[11px] text-slate-500 mt-1 line-clamp-1 italic">{l.reason}</p>
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
                <form onSubmit={formik.handleSubmit} className="space-y-6 pt-4 font-outfit">
                    <div>
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2 block px-1 italic">Leave Category</label>
                        <select {...formik.getFieldProps('type')} className={inputClass}>
                            <option value="sick">Sick Leave</option>
                            <option value="casual">Casual Leave</option>
                            <option value="maternity">Maternity Leave</option>
                            <option value="paternity">Paternity Leave</option>
                            <option value="other">Other</option>
                        </select>
                    </div>

                    <div className="grid grid-cols-2 gap-6">
                        <div>
                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2 block px-1 italic">Start Date</label>
                            <input type="date" {...formik.getFieldProps('startDate')} className={inputClass} />
                            {formik.touched.startDate && formik.errors.startDate && <p className="text-[10px] text-red-500 mt-1.5 pl-1 font-bold italic tracking-tight">{formik.errors.startDate}</p>}
                        </div>
                        <div>
                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2 block px-1 italic">End Date</label>
                            <input type="date" {...formik.getFieldProps('endDate')} className={inputClass} />
                            {formik.touched.endDate && formik.errors.endDate && <p className="text-[10px] text-red-500 mt-1.5 pl-1 font-bold italic tracking-tight">{formik.errors.endDate}</p>}
                        </div>
                    </div>

                    <div>
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2 block px-1 italic">Registry Reason</label>
                        <textarea {...formik.getFieldProps('reason')} rows={4} className={`${inputClass} resize-none min-h-[120px]`} placeholder="Specify the reason for operational departure..."></textarea>
                        {formik.touched.reason && formik.errors.reason && <p className="text-[10px] text-red-500 mt-1.5 pl-1 font-bold italic tracking-tight">{formik.errors.reason}</p>}
                    </div>

                    <button type="submit" disabled={loading} className={`w-full mt-6 py-5 ${roleColor} ${roleHover} rounded-md font-black text-[11px] uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-3 shadow-2xl text-black`}>
                        {loading ? 'Submitting Signal...' : 'Submit Application'} <ChevronRight size={16} />
                    </button>
                </form>
            </Modal>
        </div>
    );
};

export default StaffLeavePortal;
