import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchChildFees, downloadFeeReceipt, payChildFee, verifyFeePayment } from '../../redux/slice/parent.slice';
import { toast } from 'react-hot-toast';
import { motion } from 'framer-motion';
import { CreditCard, CheckCircle, AlertCircle, Clock, Download, FileText, Search, Activity } from 'lucide-react';
import { useSearchParams } from 'react-router-dom';
import { load } from '@cashfreepayments/cashfree-js';

const ChildFees = () => {
    const dispatch = useDispatch();
    const { selectedChild, fees, feesLoading: loading } = useSelector((state) => state.parent);

    const [searchParams] = useSearchParams();
    const orderIdParam = searchParams.get('order_id');

    useEffect(() => {
        if (selectedChild?._id) {
            dispatch(fetchChildFees(selectedChild._id));
        }
    }, [selectedChild?._id, dispatch]);

    useEffect(() => {
        if (orderIdParam) {
            handleVerify(orderIdParam);
        }
    }, [orderIdParam]);

    const handleVerify = async (oid) => {
        const toastId = toast.loading("Verifying financial transaction...");
        try {
            await dispatch(verifyFeePayment(oid)).unwrap();
            toast.success("Institutional credit verified and ledger updated.", { id: toastId });
            // Remove order_id from URL
            window.history.replaceState({}, document.title, window.location.pathname);
            if (selectedChild?._id) dispatch(fetchChildFees(selectedChild._id));
        } catch (err) {
            toast.error(err.message || "Financial verification failed.", { id: toastId });
        }
    };

    if (loading && fees.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center h-full pt-40 opacity-50 space-y-4">
                <div className="w-10 h-10 border-2 border-luxury-rose border-t-transparent rounded-full animate-spin" />
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Synchronizing Financial Node...</span>
            </div>
        );
    }

    const handleDownload = (feeId, category) => {
        dispatch(downloadFeeReceipt({ feeId, category }));
    };

    const handlePay = async (feeId) => {
        if (!window.confirm("Authorize this institutional transaction?")) return;
        try {
            const res = await dispatch(payChildFee(feeId)).unwrap();
            
            if (res.payment_session_id) {
                const cashfree = await load({
                    mode: "sandbox" // Change to "production" for live
                });

                const checkoutOptions = {
                    paymentSessionId: res.payment_session_id,
                    redirectTarget: "_self", // can be _modal or _self
                };

                cashfree.checkout(checkoutOptions);
            } else {
                toast.success(res.message || 'Financial Delta Synchronized');
            }
        } catch (err) {
            toast.error(err.message || 'Transaction Interrupted');
        }
    };

    const statusConfig = {
        'paid': { icon: CheckCircle, color: 'text-emerald-400', bg: 'bg-emerald-400/10', border: 'border-emerald-400/20', label: 'Paid' },
        'pending': { icon: AlertCircle, color: 'text-rose-400', bg: 'bg-rose-400/10', border: 'border-rose-400/20', label: 'Pending' },
        'overdue': { icon: Clock, color: 'text-rose-500', bg: 'bg-rose-500/10', border: 'border-rose-500/20', label: 'Overdue' },
        'partially_paid': { icon: Activity, color: 'text-blue-400', bg: 'bg-blue-400/10', border: 'border-blue-400/20', label: 'Partial' },
    };

    return (
        <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-8"
        >
            <header className="flex flex-col md:flex-row md:items-end justify-between gap-8 bg-brand-surface/40 p-10 rounded-md border border-brand-border/40 shadow-2xl backdrop-blur-xl">
                <div className="space-y-2">
                    <div className="flex items-center gap-3 mb-2">
                        <span className="w-12 h-[2px] bg-luxury-rose rounded-md"></span>
                        <span className="text-[10px] font-black uppercase tracking-[0.4em] text-luxury-rose">Financial Node</span>
                    </div>
                    <h1 className="text-4xl font-black text-white uppercase tracking-tighter leading-none font-outfit">Financial Ledger</h1>
                    <p className="text-slate-500 font-medium text-sm tracking-wide">Transactional reconciliation for <span className="text-white font-bold">{selectedChild?.firstName}</span>'s institutional account.</p>
                </div>

                <div className="flex items-center gap-4 bg-black/40 border border-slate-800 p-4 px-8 rounded-md shadow-inner">
                    <CreditCard className="text-luxury-rose w-10 h-10" />
                    <div>
                        <p className="text-[9px] font-black uppercase tracking-[0.3em] text-slate-500">Account Balance</p>
                        <p className="text-2xl font-black text-white">₹{fees.reduce((acc, f) => String(f.status).toLowerCase() === 'pending' ? acc + (f.totalAmount || 0) : acc, 0).toLocaleString()}</p>
                    </div>
                </div>
            </header>

            <div className="grid grid-cols-1 gap-6">
                <div className="bg-brand-surface/40 border border-brand-border/40 rounded-md overflow-hidden">
                    <div className="p-8 border-b border-brand-border/40 bg-black/20 flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <h3 className="text-xs font-black uppercase tracking-[0.3em] text-slate-400 font-outfit">Historical Registry</h3>
                        <div className="relative group">
                            <Search size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-hover:text-luxury-rose transition-colors" />
                            <input 
                                type="text" 
                                placeholder="Filter Transactions..." 
                                className="bg-slate-900 border border-slate-800 rounded-md py-2 pl-12 pr-4 text-[10px] font-bold text-white placeholder:text-slate-700 focus:outline-none focus:border-luxury-rose/50 transition-all w-64"
                            />
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-slate-900/40">
                                    <th className="px-8 py-6 text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 italic">Financial Domain</th>
                                    <th className="px-8 py-6 text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 italic">Timeline</th>
                                    <th className="px-8 py-6 text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 italic">Quantifiable Delta</th>
                                    <th className="px-8 py-6 text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 italic">State</th>
                                    <th className="px-8 py-6 text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 italic text-right">Ledger</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-brand-border/20">
                                {fees.length > 0 ? (
                                    fees.map((fee, idx) => {
                                         const s = String(fee.status).toLowerCase();
                                         const config = statusConfig[s] || statusConfig['pending'];
                                         const Icon = config.icon;
                                         return (
                                             <tr key={idx} className="hover:bg-white/[0.02] transition-colors group">
                                                 <td className="px-8 py-6">
                                                     <div className="flex items-center gap-4">
                                                         <div className="p-3 bg-slate-900 rounded-md">
                                                             <FileText size={18} className="text-slate-500" />
                                                         </div>
                                                         <div>
                                                             <p className="font-bold text-slate-200 tracking-tight leading-none mb-1">{fee.category || fee.feeType}</p>
                                                             <p className="text-[9px] text-slate-500 uppercase font-black tracking-widest leading-none italic">{fee.academicYear || "Institutional"}</p>
                                                         </div>
                                                     </div>
                                                 </td>
                                                 <td className="px-8 py-6">
                                                     <div className="flex flex-col">
                                                        <span className="text-[11px] font-black text-slate-400 tracking-wider">DUE: {new Date(fee.dueDate).toLocaleDateString()}</span>
                                                        {s === 'paid' && <span className="text-[9px] text-emerald-400 font-bold opacity-60">PAID: {new Date(fee.updatedAt).toLocaleDateString()}</span>}
                                                     </div>
                                                 </td>
                                                 <td className="px-8 py-6">
                                                    <span className="text-xl font-black text-white tracking-tighter italic">₹{(fee.totalAmount || 0).toLocaleString()}</span>
                                                 </td>
                                                 <td className="px-8 py-6">
                                                     <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-md text-[10px] font-black uppercase tracking-widest ${config.bg} ${config.color} border ${config.border}`}>
                                                         <Icon size={14} />
                                                         {config.label}
                                                     </div>
                                                 </td>
                                                 <td className="px-8 py-6 text-right">
                                                     {s === 'paid' ? (
                                                         <button 
                                                             onClick={() => handleDownload(fee._id, fee.category)}
                                                             className="flex items-center gap-2 px-4 py-3 bg-slate-900 hover:bg-luxury-rose hover:text-white border border-slate-800 rounded-md transition-all text-slate-500 shadow-xl"
                                                         >
                                                             <Download size={16} /> <span className="text-[9px] font-black uppercase tracking-widest hidden sm:block">Receipt</span>
                                                         </button>
                                                     ) : (
                                                         <button 
                                                              onClick={() => handlePay(fee._id)} 
                                                              className="px-6 py-2.5 bg-luxury-rose hover:bg-rose-500 text-white rounded-[4px] text-[10px] font-black uppercase tracking-widest shadow-lg shadow-luxury-rose/20 active:scale-95 transition-all"
                                                          >Pay Now</button>
                                                     )}
                                                 </td>
                                             </tr>
                                         );
                                     })
                                ) : (
                                    <tr>
                                        <td colSpan="5" className="px-8 py-20 text-center">
                                            <Activity size={48} className="mx-auto mb-4 text-slate-700 animate-pulse" />
                                            <p className="text-slate-500 font-bold uppercase tracking-widest text-[10px]">No Financial Records Indexed</p>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </motion.div>
    );
};

export default ChildFees;
