import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchDriverLeavesSlice, applyDriverLeaveSlice, clearTransportMessage } from '../../redux/slice/transport.slice';
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

const inputClass = "w-full bg-slate-800 border border-slate-700/50 rounded-md py-3 px-4 text-white placeholder-slate-500 outline-none focus:border-emerald-500 transition-all text-sm";

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

const DriverLeaves = () => {
    const dispatch = useDispatch();
    const { driverLeaves, loading, message } = useSelector((s) => s.transport);
    const [modal, setModal] = useState(false);

    useEffect(() => {
        dispatch(fetchDriverLeavesSlice());
    }, [dispatch]);

    useEffect(() => {
        if (message) {
            toast.success(message);
            dispatch(clearTransportMessage());
        }
    }, [message, dispatch]);

    const formik = useFormik({
        initialValues: { type: 'sick', startDate: '', endDate: '', reason: '' },
        validationSchema,
        onSubmit: async (values, { resetForm }) => {
            const res = await dispatch(applyDriverLeaveSlice(values));
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

    return (
        <div className="space-y-8 font-outfit">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl text-left font-black uppercase tracking-tighter text-white italic">Leave Portal (छुट्टी आवेदन)</h1>
                    <p className="text-slate-500 text-sm mt-1">Manage your leave applications and track status</p>
                </div>
                <button onClick={() => setModal(true)} className="flex items-center gap-2 px-6 py-4 bg-emerald-600 hover:bg-emerald-500 text-white rounded-md font-black text-xs uppercase tracking-widest transition-all shadow-xl shadow-emerald-600/20 active:scale-95 italic">
                    <Plus size={18} /> Apply for Leave
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 font-outfit">
                {/* Statistics / Info */}
                <div className="lg:col-span-1 space-y-4">
                    <div className="bg-slate-800/40 border border-slate-700/50 p-6 rounded-md italic">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Leave Guidelines</h3>
                            <Info size={14} className="text-slate-600" />
                        </div>
                        <ul className="space-y-3 text-[11px] font-bold text-slate-400 uppercase tracking-tight list-disc pl-4">
                            <li>Apply at least 2 days in advance for casual leaves.</li>
                            <li>Medical certificate required for sick leave over 2 days.</li>
                            <li>Ensure your route is covered by a substitute driver.</li>
                        </ul>
                    </div>
                </div>

                {/* History */}
                <div className="lg:col-span-2 space-y-4">
                    <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 px-2 italic">Leave Application History (पुराना रिकॉर्ड)</h3>
                    {(!driverLeaves || driverLeaves.length === 0) ? (
                        <div className="bg-slate-800/20 border border-dashed border-slate-700/50 rounded-md py-20 text-center">
                            <Clock size={40} className="mx-auto text-slate-700 mb-4 opacity-40" />
                            <p className="text-slate-500 font-medium whitespace-nowrap">No leave applications found.</p>
                        </div>
                    ) : (
                        driverLeaves.map((l, i) => (
                            <motion.div
                                key={l._id}
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: i * 0.05 }}
                                className="bg-slate-800/40 border border-slate-700/30 p-6 rounded-md hover:border-slate-600 transition-all group relative overflow-hidden"
                            >
                                <div className="absolute top-0 left-0 w-1 h-full bg-transparent group-hover:bg-emerald-500 transition-all" />
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-md bg-slate-900 border border-white/5 flex items-center justify-center text-emerald-500 group-hover:bg-emerald-500 group-hover:text-white transition-all shadow-xl font-mono italic">
                                            <CalendarDays size={20} />
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-3">
                                                <h4 className="font-black text-white text-sm uppercase italic tracking-tighter">{l.type} Leave</h4>
                                                <div className="w-1 h-1 rounded-full bg-slate-700" />
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
                    <div className="bg-emerald-500/5 border border-emerald-500/10 p-4 rounded-md mb-2">
                        <p className="text-[10px] font-bold text-slate-400 leading-relaxed uppercase tracking-wider text-center">
                            Please ensure your leave dates are correct. (कृपया अपनी छुट्टी की तिथियां सही भरें।)
                        </p>
                    </div>
                    <div>
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2 block px-1">Leave Category</label>
                        <select {...formik.getFieldProps('type')} className={inputClass}>
                            <option value="sick">Sick Leave (बीमारी)</option>
                            <option value="casual">Casual Leave (आकस्मिक)</option>
                            <option value="maternity">Maternity Leave</option>
                            <option value="paternity">Paternity Leave</option>
                            <option value="other">Other (अन्य)</option>
                        </select>
                    </div>

                    <div className="grid grid-cols-2 gap-6">
                        <div>
                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2 block px-1">Start Date</label>
                            <input type="date" {...formik.getFieldProps('startDate')} className={inputClass} />
                            {formik.touched.startDate && formik.errors.startDate && <p className="text-[10px] text-red-500 mt-1.5 pl-1 font-bold italic tracking-tight">{formik.errors.startDate}</p>}
                        </div>
                        <div>
                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2 block px-1">End Date</label>
                            <input type="date" {...formik.getFieldProps('endDate')} className={inputClass} />
                            {formik.touched.endDate && formik.errors.endDate && <p className="text-[10px] text-red-500 mt-1.5 pl-1 font-bold italic tracking-tight">{formik.errors.endDate}</p>}
                        </div>
                    </div>

                    <div>
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2 block px-1">Reason for Leave</label>
                        <textarea {...formik.getFieldProps('reason')} rows={4} className={`${inputClass} resize-none min-h-[120px]`} placeholder="Please provide a reason..."></textarea>
                        {formik.touched.reason && formik.errors.reason && <p className="text-[10px] text-red-500 mt-1.5 pl-1 font-bold italic tracking-tight">{formik.errors.reason}</p>}
                    </div>

                    <button type="submit" disabled={loading} className="w-full mt-6 py-5 bg-gradient-to-r from-emerald-600 to-emerald-400 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 rounded-md font-black text-[11px] uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-3 shadow-2xl shadow-emerald-500/20 text-white italic">
                        {loading ? 'Submitting...' : 'Submit Leave Application'} <ChevronRight size={16} />
                    </button>
                </form>
            </Modal>
        </div>
    );
};

export default DriverLeaves;
