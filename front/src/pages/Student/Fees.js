import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchStudentFees } from '../../redux/slice/student.slice';
import axiosInstance from '../../utils/axiosInstance';
import { motion } from 'framer-motion';
import { CreditCard, Download, Clock, CheckCircle, AlertCircle, TrendingUp } from 'lucide-react';
import { toast } from 'react-hot-toast';

const Fees = () => {
    const dispatch = useDispatch();
    const { fees, loading } = useSelector((state) => state.student);

    useEffect(() => {
        dispatch(fetchStudentFees());
    }, [dispatch]);

    const getStatusColor = (status) => {
        if (!status) return 'text-slate-400 bg-slate-500/10 border-slate-500/20';
        switch (status.toLowerCase()) {
            case 'paid': return 'text-luxury-emerald bg-emerald-500/10 border-emerald-500/20';
            case 'pending': return 'text-luxury-rose bg-rose-500/10 border-rose-500/20';
            case 'partially_paid': return 'text-brand-primary bg-brand-primary/10 border-brand-primary/20';
            default: return 'text-slate-400 bg-slate-500/10 border-slate-500/20';
        }
    };

    const totalDue = fees.reduce((acc, f) => acc + (f.status !== 'Paid' ? (f.amount || 0) : 0), 0);
    const paidAmount = fees.reduce((acc, f) => acc + (f.status === 'Paid' ? (f.amount || 0) : 0), 0);

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

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-8 max-w-7xl mx-auto font-outfit"
        >
            <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 font-outfit">
                <div className="space-y-2 font-outfit">
                    <h1 className="text-4xl font-black text-white italic uppercase tracking-tighter leading-none font-outfit">Fees & Payments</h1>
                    <p className="text-slate-500 font-medium text-lg italic">Manage your school fees, payment history, and download receipts.</p>
                </div>

                <div className="flex gap-4 font-outfit">
                    <div className="bg-[#0f0f12] border border-slate-800/60 p-6 rounded-md shadow-2xl flex items-center gap-6 min-w-[240px] font-outfit">
                        <div className="p-4 bg-luxury-rose/10 rounded-md text-luxury-rose border border-luxury-rose/20">
                            <Clock size={24} />
                        </div>
                        <div>
                            <p className="text-[10px] font-black uppercase tracking-[.2em] text-slate-500 mb-1 italic">Total Due Amount</p>
                            <p className="text-2xl font-black text-white font-outfit">₹{totalDue.toLocaleString()}</p>
                        </div>
                    </div>
                </div>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 font-outfit">
                {/* Stats & Tools */}
                <div className="lg:col-span-1 space-y-6 font-outfit">
                    <div className="bg-[#0f0f12] border border-slate-800/60 p-8 rounded-md shadow-2xl relative overflow-hidden font-outfit">
                        <div className="absolute top-0 right-0 p-8 opacity-5 font-outfit">
                            <TrendingUp size={120} />
                        </div>
                        <h3 className="text-sm font-black text-white uppercase tracking-widest mb-8 flex items-center gap-3 italic font-outfit">
                            <span className="w-8 h-px bg-luxury-emerald"></span> Payment Status
                        </h3>

                        <div className="space-y-6 font-outfit">
                            <div className="space-y-2 font-outfit">
                                <div className="flex justify-between text-[11px] font-black uppercase tracking-widest text-slate-400 font-outfit italic">
                                    <span>Paid Amount</span>
                                    <span className="text-luxury-emerald">₹{paidAmount.toLocaleString()}</span>
                                </div>
                                <div className="h-2 w-full bg-slate-800/60 rounded-md overflow-hidden font-outfit">
                                    <motion.div
                                        initial={{ width: 0 }}
                                        animate={{ width: `${(paidAmount / (paidAmount + totalDue || 1)) * 100}%` }}
                                        className="h-full bg-luxury-emerald shadow-[0_0_10px_rgba(16,185,129,0.3)]"
                                    />
                                </div>
                            </div>

                            <div className="py-6 border-t border-slate-800/50 mt-8 font-outfit">
                                <button className="w-full py-4 bg-luxury-emerald hover:bg-emerald-500 text-black rounded-md flex items-center justify-center gap-3 text-[10px] font-black uppercase tracking-[0.2em] transition-all shadow-[0_0_30px_rgba(16,185,129,0.2)] h-[52px] italic">
                                    Pay Online <CreditCard size={14} />
                                </button>
                                <p className="text-[9px] text-center text-slate-600 mt-4 uppercase font-bold tracking-widest italic leading-loose font-outfit">
                                    Secure online payments are enabled via our integrated payment gateway.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Main Ledger Table */}
                <div className="lg:col-span-2 space-y-4 font-outfit">
                    <div className="bg-[#0f0f12] border border-slate-800/60 rounded-md shadow-2xl overflow-hidden font-outfit">
                        <div className="p-8 border-b border-slate-800/60 flex items-center justify-between font-outfit">
                            <h3 className="text-sm font-black text-white uppercase tracking-widest italic font-outfit">Fee History</h3>
                        </div>

                        <div className="overflow-x-auto font-outfit">
                            <table className="w-full text-left font-outfit font-outfit">
                                <thead className="bg-[#0a0a0c] font-outfit">
                                    <tr className="border-b border-slate-800/60 font-outfit">
                                        <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-500 italic">Fee Month/Year</th>
                                        <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-500 italic">Fee Category</th>
                                        <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-500 text-right italic font-outfit">Amount</th>
                                        <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-500 text-center italic">Status</th>
                                        <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-500 text-right italic font-outfit">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-800/40 font-outfit">
                                    {fees.length > 0 ? (
                                        fees.map((fee, idx) => (
                                            <tr key={fee._id || idx} className="hover:bg-slate-800/10 transition-colors group font-outfit">
                                                <td className="px-8 py-6 font-outfit">
                                                    <p className="text-[11px] font-black text-white uppercase tracking-wider italic font-outfit">{fee.month || fee.category}</p>
                                                    <p className="text-[9px] text-slate-500 font-bold uppercase tracking-widest mt-1 italic font-outfit">Session {fee.academicYear || '25-26'}</p>
                                                </td>
                                                <td className="px-8 py-6 font-outfit">
                                                    <div className="flex items-center gap-3 font-outfit">
                                                        <div className="p-2 bg-slate-800/60 rounded text-slate-400 group-hover:text-luxury-emerald transition-colors">
                                                            <CreditCard size={14} />
                                                        </div>
                                                        <span className="text-[10px] font-bold text-slate-300 uppercase tracking-widest italic">{fee.category || fee.feeType || 'Tuition Fee'}</span>
                                                    </div>
                                                </td>
                                                <td className="px-8 py-6 text-right font-outfit font-outfit">
                                                    <span className="text-sm font-black text-white tracking-wider font-outfit">₹{(fee.totalAmount || fee.amount)?.toLocaleString()}</span>
                                                </td>
                                                <td className="px-8 py-6 font-outfit">
                                                    <div className="flex justify-center font-outfit">
                                                        <span className={`px-4 py-1.5 rounded-md text-[9px] font-black uppercase tracking-[.15em] border italic ${getStatusColor(fee.status)}`}>
                                                            {fee.status}
                                                        </span>
                                                    </div>
                                                </td>
                                                <td className="px-8 py-6 text-right font-outfit">
                                                    {fee.status?.toLowerCase() === 'paid' ? (
                                                        <button
                                                            onClick={() => handleDownloadReceipt(fee)}
                                                            className="flex items-center gap-2 px-4 py-2 bg-slate-800/80 text-slate-400 hover:text-white hover:bg-slate-800 transition-all rounded-md text-[9px] font-black uppercase tracking-widest border border-slate-700/40 h-[32px] italic"
                                                        >
                                                            <Download size={14} /> RECEIPT
                                                        </button>
                                                    ) : (
                                                        <button className="px-4 py-2 bg-luxury-rose/20 text-luxury-rose border border-luxury-rose/30 rounded-md text-[10px] font-black uppercase tracking-widest hover:bg-luxury-rose hover:text-white transition-all h-[32px] italic">
                                                            Pay Now
                                                        </button>
                                                    )}
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr className="font-outfit">
                                            <td colSpan="5" className="px-8 py-32 text-center text-slate-600 italic font-outfit">
                                                <AlertCircle size={40} className="mx-auto mb-4 opacity-20 font-outfit" />
                                                <p className="text-[11px] font-black uppercase tracking-[.3em] font-outfit">No fee records found.</p>
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </motion.div>
    );
};

export default Fees;
