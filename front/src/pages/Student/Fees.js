import React, { useEffect, useState, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchStudentFees } from '../../redux/slice/student.slice';
import axiosInstance from '../../utils/axiosInstance';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    CreditCard, Download, Clock, CheckCircle, AlertCircle, 
    TrendingUp, ShieldAlert, Award, Calendar, ChevronRight,
    Percent, History, ArrowUpRight, Cpu, ShieldCheck, Landmark, QrCode
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import PortalModal from '../../components/PortalModal';

const Fees = () => {
    const dispatch = useDispatch();
    const { fees, loading } = useSelector((state) => state.student);
    const { user } = useSelector((s) => s.auth);
    const [activeTab, setActiveTab] = useState('ALL');
    const [selectedPayment, setSelectedPayment] = useState(null);
    const [paymentMethod, setPaymentMethod] = useState('CARD');
    const [simulating, setSimulating] = useState(false);
    const [paymentSuccess, setPaymentSuccess] = useState(false);

    useEffect(() => {
        dispatch(fetchStudentFees());
    }, [dispatch]);

    const getEffectiveStatus = (fee) => {
        const total = fee.totalAmount || fee.amount || 0;
        const paid = fee.paidAmount || 0;
        if (paid === 0) return 'pending';
        if (paid >= total) return 'paid';
        return 'partially_paid';
    };

    const getStatusDetails = (status) => {
        if (!status) return { text: 'Unknown', style: 'text-slate-400 bg-slate-500/5 border-slate-500/15', dot: 'bg-slate-500' };
        switch (status.toLowerCase()) {
            case 'paid': 
                return { 
                    text: 'Settled', 
                    style: 'text-luxury-emerald bg-emerald-500/10 border-emerald-500/20 shadow-[0_0_15px_rgba(16,185,129,0.05)]', 
                    dot: 'bg-luxury-emerald shadow-[0_0_8px_rgba(16,185,129,0.8)]' 
                };
            case 'pending': 
                return { 
                    text: 'Pending', 
                    style: 'text-luxury-rose bg-rose-500/10 border-rose-500/20 shadow-[0_0_15px_rgba(244,63,94,0.05)]', 
                    dot: 'bg-luxury-rose shadow-[0_0_8px_rgba(244,63,94,0.8)] animate-pulse' 
                };
            case 'partially_paid': 
                return { 
                    text: 'Partial', 
                    style: 'text-brand-primary bg-brand-primary/10 border-brand-primary/20 shadow-[0_0_15px_rgba(59,130,246,0.05)]', 
                    dot: 'bg-brand-primary shadow-[0_0_8px_rgba(59,130,246,0.8)] animate-pulse' 
                };
            default: 
                return { 
                    text: status, 
                    style: 'text-slate-400 bg-slate-500/5 border-slate-500/15', 
                    dot: 'bg-slate-500' 
                };
        }
    };

    const getCategoryColors = (category) => {
        const cat = (category || '').toLowerCase();
        if (cat.includes('tuition')) return 'from-sky-500 to-indigo-600';
        if (cat.includes('development')) return 'from-emerald-500 to-teal-600';
        if (cat.includes('transport')) return 'from-amber-500 to-orange-600';
        return 'from-brand-primary to-indigo-600';
    };

    const paidAmount = useMemo(() => fees.reduce((acc, f) => acc + (f.paidAmount || 0), 0), [fees]);
    const totalDue = useMemo(() => fees.reduce((acc, f) => acc + ((f.totalAmount || f.amount || 0) - (f.paidAmount || 0)), 0), [fees]);
    const totalBilled = useMemo(() => fees.reduce((acc, f) => acc + (f.totalAmount || f.amount || 0), 0), [fees]);

    const paidPercentage = useMemo(() => totalBilled > 0 ? Math.round((paidAmount / totalBilled) * 100) : 0, [paidAmount, totalBilled]);
    const paidCount = useMemo(() => fees.filter(f => getEffectiveStatus(f) === 'paid').length, [fees]);
    const pendingCount = useMemo(() => fees.filter(f => getEffectiveStatus(f) === 'pending' || getEffectiveStatus(f) === 'partially_paid').length, [fees]);

    const filteredFees = useMemo(() => {
        return fees.filter(f => {
            const status = getEffectiveStatus(f);
            if (activeTab === 'ALL') return true;
            if (activeTab === 'PENDING') return status === 'pending' || status === 'partially_paid';
            if (activeTab === 'PAID') return status === 'paid';
            return true;
        });
    }, [fees, activeTab]);

    const handleDownloadReceipt = async (fee) => {
        try {
            const response = await axiosInstance.get(`/student/fees/${fee._id}/receipt`, {
                responseType: 'blob'
            });
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            const studentName = fee.studentId?.firstName ? `${fee.studentId.firstName}_${fee.studentId.lastName}` : 'Student';
            link.setAttribute('download', `Receipt_${studentName}_${fee.academicYear}.pdf`);
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);
        } catch (err) {
            console.error('Download Protocol Failed:', err);
            toast.error('Could not download financial record');
        }
    };

    const triggerSimulatedPayment = (fee) => {
        setSelectedPayment(fee);
        setPaymentSuccess(false);
        setSimulating(false);
    };

    const handlePaymentSubmit = (e) => {
        e.preventDefault();
        setSimulating(true);
        setTimeout(() => {
            setSimulating(false);
            setPaymentSuccess(true);
            toast.success('Simulated Payment completed successfully');
            dispatch(fetchStudentFees());
        }, 2200);
    };

    return (
        <div className="space-y-8 pb-12 w-full text-left font-outfit">
            
            {/* ── Hero Header ───────────────────────────────────────────── */}
            <motion.div
                initial={{ opacity: 0, y: -16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.45 }}
                className="relative rounded-xl overflow-hidden border border-brand-border/40 bg-brand-surface/40 backdrop-blur-xl"
            >
                {/* Accent top strip */}
                <div className="h-1 w-full bg-gradient-to-r from-brand-primary via-emerald-450 to-brand-secondary" />

                {/* Background glows */}
                <div className="absolute top-0 right-0 w-96 h-40 bg-brand-primary/8 blur-3xl pointer-events-none rounded-full" />
                <div className="absolute bottom-0 left-0 w-64 h-32 bg-emerald-500/5 blur-3xl pointer-events-none rounded-full" />

                <div className="relative z-10 p-6 lg:p-8">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                        <div className="flex items-center gap-5">
                            <div className="relative flex-shrink-0">
                                <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-brand-primary/20 to-brand-secondary/20 border-2 border-brand-primary/30 flex items-center justify-center overflow-hidden shadow-xl shadow-brand-primary/10">
                                    {user?.photo ? (
                                        <img src={user.photo} alt="" className="w-full h-full object-cover" />
                                    ) : (
                                        <span className="text-2xl font-black text-brand-primary">
                                            {user?.firstName?.[0]}{user?.lastName?.[0]}
                                        </span>
                                    )}
                                </div>
                                <span className="absolute -bottom-1 -right-1 w-4 h-4 bg-luxury-emerald rounded-full border-2 border-[#070709] shadow-lg shadow-luxury-emerald/50" />
                            </div>
                            <div>
                                <p className="text-[10px] font-black uppercase tracking-[0.35em] text-slate-500 mb-1">Financial Console</p>
                                <h1 className="text-3xl lg:text-4xl font-black tracking-tight text-white leading-none font-outfit">
                                    Fees & <span className="text-brand-primary">Payments</span>
                                </h1>
                                <div className="flex items-center gap-2 mt-2">
                                    <span className="text-[10px] text-slate-500 font-medium">Admission ID: {user?.admissionNumber || '—'}</span>
                                    <span className="w-1 h-1 rounded-full bg-slate-700" />
                                    <span className="flex items-center gap-1 text-[10px] font-black text-luxury-emerald uppercase tracking-wider">
                                        <span className="w-1.5 h-1.5 rounded-full bg-luxury-emerald animate-pulse" />
                                        Secure Portal
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Right — Active session badge */}
                        <div className='flex gap-3'>
                            <div className="flex-shrink-0 flex items-center gap-3 bg-brand-primary/10 border border-brand-primary/25 rounded-xl px-5 py-3">
                                <Calendar size={20} className="text-brand-primary" />
                                <div>
                                    <p className="text-[9px] font-black uppercase tracking-[0.25em] text-slate-500 leading-none mb-1">Active Session</p>
                                    <p className="text-base font-black text-brand-primary leading-none">
                                        {fees[0]?.academicYear || '2026-2027'}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </motion.div>

            {/* ── Stat Cards ─────────────────────────────────────────────── */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                
                {/* Total Billed */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0 }}
                    className="p-6 rounded-md bg-brand-surface/40 backdrop-blur-xl border border-brand-border/40 hover:scale-[1.02] transition-all duration-300 group"
                >
                    <div className="flex items-start justify-between mb-4">
                        <div className="p-4 rounded-md bg-gradient-to-br from-brand-primary to-indigo-650 shadow-lg shadow-black/20 group-hover:scale-110 transition-transform">
                            <CreditCard size={24} className="text-white" />
                        </div>
                        <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest text-right max-w-[100px] leading-tight font-outfit">Total Invoiced</span>
                    </div>
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 mb-1 font-outfit">Total Billed</p>
                    <h3 className="text-4xl font-black tracking-tighter font-outfit text-white leading-none">
                        ₹{totalBilled.toLocaleString()}
                    </h3>
                </motion.div>

                {/* Total Settled */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.05 }}
                    className="p-6 rounded-md bg-brand-surface/40 backdrop-blur-xl border border-brand-border/40 hover:scale-[1.02] transition-all duration-300 group"
                >
                    <div className="flex items-start justify-between mb-4">
                        <div className="p-4 rounded-md bg-gradient-to-br from-emerald-500 to-teal-600 shadow-lg shadow-black/20 group-hover:scale-110 transition-transform">
                            <CheckCircle size={24} className="text-white" />
                        </div>
                        <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest text-right max-w-[100px] leading-tight font-outfit">{paidCount} Paid items</span>
                    </div>
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 mb-1 font-outfit">Total Settled</p>
                    <h3 className="text-4xl font-black tracking-tighter font-outfit text-white leading-none">
                        ₹{paidAmount.toLocaleString()}
                    </h3>
                </motion.div>

                {/* Net Balance */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="p-6 rounded-md bg-brand-surface/40 backdrop-blur-xl border border-brand-border/40 hover:scale-[1.02] transition-all duration-300 group"
                >
                    <div className="flex items-start justify-between mb-4">
                        <div className={`p-4 rounded-md bg-gradient-to-br ${totalDue > 0 ? 'from-rose-500 to-pink-600' : 'from-emerald-500 to-teal-600'} shadow-lg shadow-black/20 group-hover:scale-110 transition-transform`}>
                            <Clock size={24} className="text-white" />
                        </div>
                        <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest text-right max-w-[100px] leading-tight font-outfit">Net Outstanding</span>
                    </div>
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 mb-1 font-outfit">Net Due Balance</p>
                    <h3 className="text-4xl font-black tracking-tighter font-outfit text-white leading-none">
                        ₹{totalDue.toLocaleString()}
                    </h3>
                </motion.div>

            </div>

            {/* ── Ledger Registry Section (Table format) ────────────────── */}
            <div className="grid grid-cols-1 gap-6">
                
                <motion.div
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="bg-brand-surface/40 backdrop-blur-xl border border-brand-border/30 rounded-md p-6 md:p-8 flex flex-col h-full overflow-hidden shadow-2xl"
                >
                    {/* Header */}
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-8">
                        <div className="flex items-center gap-3">
                            <div className="p-2 rounded-md bg-slate-800/50 border border-slate-700/30">
                                <History size={18} className="text-brand-primary" />
                            </div>
                            <h3 className="text-sm font-black uppercase tracking-[0.15em] text-slate-300 font-outfit">Invoices Registry</h3>
                        </div>

                        {/* Tabs */}
                        <div className="flex bg-slate-900/60 p-1 rounded-md border border-slate-800/80 shadow-inner flex-shrink-0">
                            {[
                                { id: 'ALL', label: 'All Invoices' },
                                { id: 'PENDING', label: 'Outstanding' },
                                { id: 'PAID', label: 'Settled Ledger' }
                            ].map(tab => (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`px-4 py-2 rounded-md text-[9px] font-black uppercase tracking-widest transition-all duration-300 ${
                                        activeTab === tab.id 
                                        ? 'bg-brand-primary text-white shadow-lg shadow-brand-primary/20' 
                                        : 'text-slate-500 hover:text-white'
                                    }`}
                                >
                                    {tab.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Statement Table */}
                    <div className="overflow-x-auto w-full">
                        <table className="w-full text-left font-outfit border-collapse">
                            <thead>
                                <tr className="border-b border-brand-border/30">
                                    <th className="px-6 py-4 text-[9px] font-black uppercase tracking-widest text-slate-500 italic">Fee Category</th>
                                    <th className="px-6 py-4 text-[9px] font-black uppercase tracking-widest text-slate-500 italic">Month / Session</th>
                                    <th className="px-6 py-4 text-[9px] font-black uppercase tracking-widest text-slate-500 text-right italic font-outfit">Billed Amount</th>
                                    <th className="px-6 py-4 text-[9px] font-black uppercase tracking-widest text-slate-500 text-right italic font-outfit">Settled Amount</th>
                                    <th className="px-6 py-4 text-[9px] font-black uppercase tracking-widest text-slate-500 text-right italic font-outfit">Outstanding Due</th>
                                    <th className="px-6 py-4 text-[9px] font-black uppercase tracking-widest text-slate-500 text-center italic font-outfit">Status Badge</th>
                                    <th className="px-6 py-4 text-[9px] font-black uppercase tracking-widest text-slate-500 text-right italic font-outfit">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-brand-border/10">
                                <AnimatePresence mode="popLayout">
                                    {filteredFees.length > 0 ? (
                                        filteredFees.map((fee, idx) => {
                                            const remains = (fee.totalAmount || fee.amount || 0) - (fee.paidAmount || 0);
                                            const categoryColors = getCategoryColors(fee.category);
                                            const effectiveStatus = getEffectiveStatus(fee);
                                            const statusInfo = getStatusDetails(effectiveStatus);
                                            
                                            return (
                                                <motion.tr
                                                    key={fee._id || idx}
                                                    initial={{ opacity: 0, y: 10 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    exit={{ opacity: 0 }}
                                                    transition={{ delay: idx * 0.04 }}
                                                    className="hover:bg-slate-800/10 border-b border-brand-border/10 transition-colors group"
                                                >
                                                    <td className="px-6 py-5">
                                                        <div className="flex items-center gap-3">
                                                            <div className={`p-2.5 rounded-md bg-gradient-to-br ${categoryColors} shadow-md group-hover:scale-105 transition-transform`}>
                                                                <CreditCard size={14} className="text-white" />
                                                            </div>
                                                            <span className="text-sm font-black text-white uppercase tracking-tight group-hover:text-brand-primary transition-colors">{fee.category || 'Tuition Fee'}</span>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-5">
                                                        <p className="text-xs font-bold text-slate-350 uppercase tracking-wide">{fee.month || 'Current Year'}</p>
                                                        <span className="text-[9px] text-slate-500 uppercase tracking-widest">Session {fee.academicYear}</span>
                                                    </td>
                                                    <td className="px-6 py-5 text-right font-black text-white tracking-wide">
                                                        ₹{(fee.totalAmount || fee.amount)?.toLocaleString()}
                                                    </td>
                                                    <td className="px-6 py-5 text-right font-black text-emerald-450 tracking-wide">
                                                        ₹{(fee.paidAmount || 0)?.toLocaleString()}
                                                    </td>
                                                    <td className={`px-6 py-5 text-right font-black tracking-wide ${remains > 0 ? 'text-rose-400' : 'text-slate-500'}`}>
                                                        ₹{remains.toLocaleString()}
                                                    </td>
                                                    <td className="px-6 py-5">
                                                        <div className="flex justify-center">
                                                            <span className={`px-3 py-1.5 rounded-md text-[8px] font-black uppercase tracking-widest border italic flex items-center gap-2 ${statusInfo.style}`}>
                                                                <span className={`w-1.5 h-1.5 rounded-full ${statusInfo.dot}`} />
                                                                {statusInfo.text}
                                                            </span>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-5 text-right">
                                                        {effectiveStatus === 'paid' ? (
                                                            <button
                                                                onClick={() => handleDownloadReceipt(fee)}
                                                                className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-slate-900 hover:bg-slate-850 hover:text-white border border-slate-800 rounded-md text-[9px] font-black uppercase tracking-widest text-slate-400 transition-all duration-300 h-[34px] italic shadow-inner hover:scale-105"
                                                            >
                                                                <Download size={11} /> RECEIPT
                                                            </button>
                                                        ) : (
                                                            <button
                                                                onClick={() => triggerSimulatedPayment(fee)}
                                                                className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-slate-900 hover:bg-slate-850 hover:text-white border border-slate-800 rounded-md text-[9px] font-black uppercase tracking-widest text-slate-400 transition-all duration-300 h-[34px] italic shadow-inner hover:scale-105"
                                                            >
                                                                VIEW
                                                            </button>
                                                        )}
                                                    </td>
                                                </motion.tr>
                                            );
                                        })
                                    ) : (
                                        <tr>
                                            <td colSpan="7" className="py-24 text-center opacity-40">
                                                <ShieldAlert size={48} className="text-slate-550 mx-auto mb-4" />
                                                <p className="text-sm font-medium text-slate-400">No statements registered in this category.</p>
                                            </td>
                                        </tr>
                                    )}
                                </AnimatePresence>
                            </tbody>
                        </table>
                    </div>
                </motion.div>

            </div>

            {/* Invoice Details Modal */}
            <PortalModal isOpen={!!selectedPayment} onClose={() => setSelectedPayment(null)} maxWidth="max-w-md">
                {selectedPayment && (
                    <div className="p-8 space-y-6 text-left font-outfit">
                        <header className="space-y-2 border-b border-slate-900/60 pb-4 text-left relative">
                            <h2 className="text-2xl font-black text-white uppercase italic tracking-tighter leading-none">Invoice Details</h2>
                            <p className="text-slate-500 text-[9px] font-black uppercase tracking-widest">
                                Detailed ledger statement
                            </p>
                        </header>

                        <div className="space-y-4">
                            <div className="p-5 bg-slate-950/60 border border-slate-850 rounded-xl space-y-4">
                                <div className="flex justify-between items-center">
                                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Fee Category</span>
                                    <span className="text-xs font-black text-white uppercase">{selectedPayment.category || 'Tuition Fee'}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Statement Period</span>
                                    <span className="text-xs font-black text-slate-450 uppercase">{selectedPayment.month || 'Current Session'}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Academic Year</span>
                                    <span className="text-xs font-black text-slate-450 uppercase">{selectedPayment.academicYear}</span>
                                </div>
                                
                                <div className="h-px bg-slate-900/80 my-2" />

                                <div className="flex justify-between items-center">
                                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Billed Amount</span>
                                    <span className="text-sm font-black text-white">
                                        ₹{(selectedPayment.totalAmount || selectedPayment.amount || 0).toLocaleString()}
                                    </span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Settled Amount</span>
                                    <span className="text-sm font-black text-emerald-450">
                                        ₹{(selectedPayment.paidAmount || 0).toLocaleString()}
                                    </span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider font-bold">Outstanding Due</span>
                                    <span className={`text-base font-black ${
                                        (selectedPayment.totalAmount || selectedPayment.amount || 0) - (selectedPayment.paidAmount || 0) > 0 
                                        ? 'text-rose-400' 
                                        : 'text-slate-400'
                                    }`}>
                                        ₹{((selectedPayment.totalAmount || selectedPayment.amount || 0) - (selectedPayment.paidAmount || 0)).toLocaleString()}
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div className="pt-2">
                            <button
                                onClick={() => setSelectedPayment(null)}
                                className="w-full py-4 bg-slate-900 hover:bg-slate-850 hover:text-white border border-slate-800 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] transition-all h-[48px]"
                            >
                                Dismiss Details
                            </button>
                        </div>
                    </div>
                )}
            </PortalModal>
            
        </div>
    );
};

export default Fees;
