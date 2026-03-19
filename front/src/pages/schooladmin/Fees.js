import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchFees, fetchStudents, createFee, updateFee } from '../../redux/slice/schoolAdmin.slice';
import { motion } from 'framer-motion';
import { Plus, Pencil, Wallet, CheckCircle2, AlertCircle, Clock } from 'lucide-react';
import Modal from '../../components/Modal';
import { useFormik } from 'formik';
import * as Yup from 'yup';

const statusColor = { 
    paid: 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20', 
    pending: 'text-amber-400 bg-amber-400/10 border-amber-400/20', 
    overdue: 'text-red-400 bg-red-400/10 border-red-400/20' 
};

const validationSchema = Yup.object({
    studentId: Yup.string().required('Student identity is required'),
    amount: Yup.number().required('Amount is required').positive('Amount must be positive'),
    category: Yup.string().required('Fee category is required'),
    status: Yup.string().required('Status is required'),
    dueDate: Yup.date().required('Due date is required'),
});

const Fees = () => {
    const dispatch = useDispatch();
    const { fees, students, loading } = useSelector((s) => s.schoolAdmin);
    const [modal, setModal] = useState(false);
    const [editing, setEditing] = useState(null);
    const [filter, setFilter] = useState('all');

    useEffect(() => {
        dispatch(fetchFees());
        dispatch(fetchStudents());
    }, [dispatch]);

    const formik = useFormik({
        initialValues: { studentId: '', amount: '', category: '', status: 'pending', dueDate: '' },
        validationSchema,
        onSubmit: (values) => {
            if (editing) dispatch(updateFee({ id: editing, data: values }));
            else dispatch(createFee(values));
            setModal(false);
            setEditing(null);
            formik.resetForm();
        },
    });

    const openAdd = () => { setEditing(null); formik.resetForm(); setModal(true); };
    const openEdit = (f) => {
        setEditing(f._id);
        formik.setValues({
            studentId: f.studentId?._id || f.studentId,
            amount: f.amount,
            category: f.category,
            status: f.status,
            dueDate: f.dueDate ? f.dueDate.split('T')[0] : ''
        });
        setModal(true);
    };

    const filtered = filter === 'all' ? fees : fees.filter(f => f.status === filter);
    const total = fees.reduce((s, f) => s + (f.amount || 0), 0);
    const paidSum = fees.filter(f => f.status === 'paid').reduce((s, f) => s + (f.amount || 0), 0);

    return (
        <div className="space-y-8">
            <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                    <h1 className="text-4xl font-black text-white italic uppercase tracking-tighter leading-none mb-4 font-outfit">Financial Node</h1>
                    <p className="text-slate-500 font-medium text-lg leading-relaxed max-w-xl italic">Institutional fee management & revenue tracking terminal.</p>
                </div>
                <button onClick={openAdd} className="flex items-center gap-3 px-8 py-4 bg-brand-primary hover:bg-blue-500 text-white rounded-2xl font-black text-[13px] uppercase tracking-[0.2em] transition-all shadow-[0_0_30px_rgba(37,99,235,0.3)]">
                    <Plus size={18} /> Generate Fee Invoice
                </button>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[
                    { label: 'Total Billed', value: `$${total.toLocaleString()}`, icon: Wallet, color: 'text-brand-primary' },
                    { label: 'Collected', value: `$${paidSum.toLocaleString()}`, icon: CheckCircle2, color: 'text-emerald-500' },
                    { label: 'Outstanding', value: `$${(total - paidSum).toLocaleString()}`, icon: AlertCircle, color: 'text-amber-500' },
                ].map(({ label, value, icon: Icon, color }) => (
                    <div key={label} className="bg-[#0f0f12] border border-slate-800/60 rounded-[2.5rem] p-8 shadow-xl">
                        <div className="flex items-center gap-3 mb-4">
                            <Icon size={16} className={color} />
                            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 font-outfit">{label}</p>
                        </div>
                        <p className="text-4xl font-black font-outfit text-white leading-none italic">{value}</p>
                    </div>
                ))}
            </div>

            <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-none">
                {['all', 'paid', 'pending', 'overdue'].map(s => (
                    <button key={s} onClick={() => setFilter(s)}
                        className={`px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] transition-all font-outfit border ${filter === s ? 'bg-brand-primary border-brand-primary text-white shadow-lg' : 'bg-slate-900/50 border-slate-800 text-slate-500 hover:border-slate-700'}`}>
                        {s} Cycle
                    </button>
                ))}
            </div>

            <div className="bg-[#0f0f12] border border-slate-800/60 rounded-[3rem] overflow-hidden shadow-2xl relative">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-slate-900/30">
                            {['Student Identity', 'Category Node', 'Financial precision', 'verification status', 'Deadline', 'Actions'].map(h => (
                                <th key={h} className="px-8 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 font-outfit italic">{h}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/40">
                        {filtered.length === 0 ? (
                            <tr><td colSpan={6} className="py-24 text-center text-slate-500 font-bold italic uppercase tracking-widest text-[10px]">No records detected in this cycle</td></tr>
                        ) : filtered.map((f, i) => (
                            <motion.tr key={f._id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.03 }}
                                className="hover:bg-white/[0.02] transition-colors group">
                                <td className="px-8 py-6">
                                    <div className="font-bold text-white italic tracking-tight">{f.studentId ? `${f.studentId.firstName} ${f.studentId.lastName}` : 'Void ID'}</div>
                                    <div className="text-[10px] text-slate-600 font-black uppercase tracking-widest mt-1">#{f.studentId?.admissionNumber || 'N/A'}</div>
                                </td>
                                <td className="px-8 py-6 text-slate-400 text-xs font-bold uppercase tracking-widest italic">{f.category}</td>
                                <td className="px-8 py-6 font-black text-white text-lg font-outfit">${f.amount?.toLocaleString()}</td>
                                <td className="px-8 py-6">
                                    <span className={`px-4 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-[0.2em] border ${statusColor[f.status]}`}>{f.status}</span>
                                </td>
                                <td className="px-8 py-6 text-slate-500 text-[11px] font-bold italic">{f.dueDate ? new Date(f.dueDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'}</td>
                                <td className="px-8 py-6">
                                    <button onClick={() => openEdit(f)} className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-slate-500 hover:text-brand-primary hover:border-brand-primary transition-all">
                                        <Pencil size={14} />
                                    </button>
                                </td>
                            </motion.tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <Modal open={modal} onClose={() => setModal(false)} title={editing ? 'Update Financial Directive' : 'Initialize Fee Invoice'}>
                <form onSubmit={formik.handleSubmit} className="space-y-5 p-2">
                    <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 ml-1">Target Student Node</label>
                        <select name="studentId" required value={formik.values.studentId} onChange={formik.handleChange} onBlur={formik.handleBlur}
                            className={`w-full bg-slate-900/50 border ${formik.touched.studentId && formik.errors.studentId ? 'border-red-500' : 'border-slate-800'} focus:border-brand-primary rounded-[1.2rem] py-4 px-6 text-white outline-none text-sm transition-all appearance-none cursor-pointer font-bold`}>
                            <option value="">Select Student Node...</option>
                            {students.map(s => <option key={s._id} value={s._id}>{s.firstName} {s.lastName} (#{s.admissionNumber})</option>)}
                        </select>
                        {formik.touched.studentId && formik.errors.studentId && <p className="text-[10px] text-red-500 font-bold italic ml-1">{formik.errors.studentId}</p>}
                    </div>

                    <div className="grid grid-cols-2 gap-5">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 ml-1">Invoice Category</label>
                            <input name="category" placeholder="e.g. Tuition Cycle 01" value={formik.values.category} onChange={formik.handleChange} onBlur={formik.handleBlur}
                                className={`w-full bg-slate-900/50 border ${formik.touched.category && formik.errors.category ? 'border-red-500' : 'border-slate-800'} focus:border-brand-primary rounded-[1.2rem] py-4 px-6 text-white outline-none text-sm transition-all placeholder:text-slate-700`} />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 ml-1">Precision Amount</label>
                            <input name="amount" type="number" placeholder="0.00" value={formik.values.amount} onChange={formik.handleChange} onBlur={formik.handleBlur}
                                className={`w-full bg-slate-900/50 border ${formik.touched.amount && formik.errors.amount ? 'border-red-500' : 'border-slate-800'} focus:border-brand-primary rounded-[1.2rem] py-4 px-6 text-white outline-none text-sm transition-all placeholder:text-slate-700`} />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-5">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 ml-1">Directive status</label>
                            <select name="status" value={formik.values.status} onChange={formik.handleChange} onBlur={formik.handleBlur}
                                className="w-full bg-slate-900/50 border border-slate-800 focus:border-brand-primary rounded-[1.2rem] py-4 px-6 text-white outline-none text-sm transition-all appearance-none cursor-pointer font-bold">
                                <option value="pending">Pending</option>
                                <option value="paid">Authorized (Paid)</option>
                                <option value="overdue">Overdue Cycle</option>
                            </select>
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 ml-1">Temporal Deadline</label>
                            <div className="relative">
                                <Clock size={18} className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-500" />
                                <input name="dueDate" required type="date" value={formik.values.dueDate} onChange={formik.handleChange} onBlur={formik.handleBlur}
                                    className={`w-full bg-slate-900/50 border ${formik.touched.dueDate && formik.errors.dueDate ? 'border-red-500' : 'border-slate-800'} focus:border-brand-primary rounded-[1.2rem] py-4 pl-14 pr-6 text-white outline-none text-sm transition-all`} />
                            </div>
                        </div>
                    </div>

                    <button type="submit" disabled={loading}
                        className="w-full py-5 bg-brand-primary hover:bg-blue-600 rounded-[1.5rem] font-black text-[13px] uppercase tracking-[0.3em] transition-all font-outfit mt-4 shadow-[0_0_30px_rgba(37,99,235,0.3)] text-white">
                        {loading ? 'Processing...' : editing ? 'Update Financial Directive' : 'Initialize Invoice'}
                    </button>
                </form>
            </Modal>
        </div>
    );
};

export default Fees;
