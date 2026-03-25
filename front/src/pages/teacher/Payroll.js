import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchPayroll } from '../../redux/slice/teacher.slice';
import { motion, AnimatePresence } from 'framer-motion';
import { DollarSign, Calendar, TrendingUp, TrendingDown, CheckCircle, Clock, FileText, Download, Activity, X, Printer } from 'lucide-react';
import Modal from '../../components/Modal';

const Payroll = () => {
    const dispatch = useDispatch();
    const { payroll, loading } = useSelector((state) => state.teacher);
    const [selectedPayroll, setSelectedPayroll] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    useEffect(() => {
        dispatch(fetchPayroll());
    }, [dispatch]);

    const getMonthName = (month) => {
        return new Date(2000, month - 1).toLocaleString('default', { month: 'long' });
    };

    const handleViewReceipt = (item) => {
        setSelectedPayroll(item);
        setIsModalOpen(true);
    };

    const handlePrint = () => {
        window.print();
    };

    return (
        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="space-y-10 container">
            <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-2 border-b border-white/5">
                <div>
                    <h1 className="text-4xl text-left font-black text-white italic uppercase tracking-tighter leading-none mb-3 font-outfit text-shadow-glow">Financial Terminal</h1>
                    <p className="text-slate-500 font-medium text-sm tracking-wide flex items-center gap-2">
                        <Activity size={14} className="text-brand-primary" />
                        Compensation disbursements & compensation taxonomy registry.
                    </p>
                </div>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-slate-900 border border-slate-800 p-8 rounded-md relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-brand-primary/5 rounded-bl-[4rem] blur-2xl group-hover:bg-brand-primary/10 transition-colors" />
                    <DollarSign className="text-brand-primary mb-6" size={32} />
                    <h3 className="text-slate-500 text-[10px] font-black uppercase tracking-[0.2em] mb-2">Total Retribution</h3>
                    <p className="text-3xl font-black text-white font-outfit leading-none">₹{payroll.filter(p => p.status === 'paid').reduce((acc, current) => acc + (current.totalAmount || 0), 0).toLocaleString()}</p>
                    <div className="mt-4 flex items-center gap-2 text-[10px] font-bold text-emerald-500 uppercase tracking-widest">
                        <TrendingUp size={12} /> Institutional Loyalty Accrual
                    </div>
                </div>

                <div className="bg-slate-900 border border-slate-800 p-8 rounded-md relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-brand-secondary/5 rounded-bl-[4rem] blur-2xl group-hover:bg-brand-secondary/10 transition-colors" />
                    <Calendar className="text-brand-secondary mb-6" size={32} />
                    <h3 className="text-slate-500 text-[10px] font-black uppercase tracking-[0.2em] mb-2">Registry Lifecycle</h3>
                    <p className="text-3xl font-black text-white font-outfit leading-none">{payroll.length} Cycles</p>
                    <div className="mt-4 flex items-center gap-2 text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                        <Clock size={12} /> Temporal Duration Localized
                    </div>
                </div>

                <div className="bg-slate-900 border border-slate-800 p-8 rounded-md relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-luxury-rose/5 rounded-bl-[4rem] blur-2xl group-hover:bg-luxury-rose/10 transition-colors" />
                    <TrendingDown className="text-luxury-rose mb-6" size={32} />
                    <h3 className="text-slate-500 text-[10px] font-black uppercase tracking-[0.2em] mb-2">Pending Synchronization</h3>
                    <p className="text-3xl font-black text-white font-outfit leading-none">₹{payroll.filter(p => p.status === 'unpaid').reduce((acc, current) => acc + (current.totalAmount || 0), 0).toLocaleString()}</p>
                    <div className="mt-4 flex items-center gap-2 text-[10px] font-bold text-luxury-rose uppercase tracking-widest">
                        <Activity size={12} /> Awaiting Fiscal Clearance
                    </div>
                </div>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-md overflow-hidden relative">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-brand-primary to-brand-secondary" />
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-slate-800/30">
                            <th className="p-6 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] border-b border-slate-800">Temporal Cycle</th>
                            <th className="p-6 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] border-b border-slate-800">Base Retribution</th>
                            <th className="p-6 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] border-b border-slate-800">Bonus Allocation</th>
                            <th className="p-6 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] border-b border-slate-800">Fiscal Reductions</th>
                            <th className="p-6 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] border-b border-slate-800">Net Disbursement</th>
                            <th className="p-6 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] border-b border-slate-800">Validation</th>
                            <th className="p-6 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] border-b border-slate-800">Registry Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/50">
                        {loading ? (
                            <tr>
                                <td colSpan="7" className="p-12 text-center text-[10px] font-black text-slate-500 uppercase tracking-widest">Synchronizing Financial Intelligence...</td>
                            </tr>
                        ) : payroll.length > 0 ? payroll.map((item, idx) => (
                            <motion.tr 
                                initial={{ opacity: 0, x: -10 }} 
                                animate={{ opacity: 1, x: 0 }} 
                                transition={{ delay: idx * 0.05 }}
                                key={item._id} 
                                className="group hover:bg-slate-800/20 transition-all border-l-2 border-l-transparent hover:border-l-brand-primary"
                            >
                                <td className="p-6">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-md bg-slate-800 flex items-center justify-center text-brand-primary shadow-lg border border-slate-700/50 group-hover:bg-brand-primary group-hover:text-white transition-all">
                                            <Calendar size={16} />
                                        </div>
                                        <div>
                                            <p className="text-xs font-black text-white uppercase tracking-tight italic">{getMonthName(item.month)} {item.year}</p>
                                            <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Financial Index: {idx + 101}</p>
                                        </div>
                                    </div>
                                </td>
                                <td className="p-6 text-xs font-bold text-slate-300">₹{item.baseSalary.toLocaleString()}</td>
                                <td className="p-6 text-xs font-bold text-emerald-500">+{item.bonus.toLocaleString()}</td>
                                <td className="p-6 text-xs font-bold text-luxury-rose">-{item.deductions.toLocaleString()}</td>
                                <td className="p-6">
                                    <span className="text-sm font-black text-white italic uppercase tracking-tighter">₹{item.totalAmount.toLocaleString()}</span>
                                </td>
                                <td className="p-6">
                                    <div className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-md text-[9px] font-black uppercase tracking-widest ${item.status === 'paid' ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' : 'bg-slate-800 text-slate-500 border border-slate-700'}`}>
                                        {item.status === 'paid' ? <CheckCircle size={12} /> : <Clock size={12} />}
                                        {item.status}
                                    </div>
                                </td>
                                <td className="p-6">
                                    <div className="flex items-center gap-3">
                                        <button 
                                            onClick={() => handleViewReceipt(item)}
                                            className="p-2.5 rounded-md bg-slate-800 text-slate-400 hover:text-brand-primary hover:bg-brand-primary/10 transition-all border border-slate-700 shadow-xl group/btn"
                                            title="View Logic Voucher"
                                        >
                                            <FileText size={16} />
                                        </button>
                                        <button 
                                            onClick={() => handleViewReceipt(item)}
                                            className="p-2.5 rounded-md bg-slate-800 text-slate-400 hover:text-emerald-500 hover:bg-emerald-500/10 transition-all border border-slate-700 shadow-xl group/btn"
                                            title="Download Disbursement Data"
                                        >
                                            <Download size={16} />
                                        </button>
                                    </div>
                                </td>
                            </motion.tr>
                        )) : (
                            <tr>
                                <td colSpan="7" className="p-20 text-center flex flex-col items-center justify-center opacity-30 gap-4 w-full">
                                    <DollarSign size={48} className="text-slate-600" />
                                    <p className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-500">Financial Registry Trace Invalid</p>
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Payslip/Receipt Modal */}
            <Modal open={isModalOpen} onClose={() => setIsModalOpen(false)} title="Document Matrix Preview">
                {selectedPayroll && (
                    <div className="space-y-8">
                        <div id="payroll-printable" className="bg-white text-slate-900 p-10 rounded-md shadow-2xl relative overflow-hidden font-outfit border border-slate-200">
                            {selectedPayroll.status === 'paid' && (
                                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rotate-[-35deg] text-[120px] font-black text-slate-100 select-none pointer-events-none tracking-tighter uppercase opacity-30">
                                    SYNCED
                                </div>
                            )}
                            <div className="relative z-10">
                                <div className="flex justify-between items-start border-b-2 border-dashed border-slate-200 pb-6 mb-8">
                                    <div>
                                        <div className="bg-brand-primary w-12 h-12 rounded-md flex items-center justify-center text-white font-black text-xl mb-3 shadow-[0_0_20px_rgba(37,99,235,0.3)]">P</div>
                                        <h2 className="text-xl font-black text-slate-900 uppercase tracking-widest ">Compensation Voucher</h2>
                                        <p className="text-[10px] font-bold text-slate-400 mt-1 uppercase tracking-widest">Disbursement ID: {selectedPayroll._id?.slice(-12).toUpperCase()}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-xs font-black text-slate-900">{new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' })}</p>
                                        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1">Institutional Audit Record</p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-10 mb-10">
                                    <div>
                                        <label className="text-[9px] font-black uppercase text-slate-400 tracking-widest block mb-2">Faculty Associate</label>
                                        <span className="text-sm font-black text-slate-900 block uppercase italic tracking-tight underline decoration-slate-200 underline-offset-4 decoration-2">Self</span>
                                        <span className="text-[10px] font-bold text-slate-500 block mt-2">Professional Node: Active</span>
                                    </div>
                                    <div className="text-right">
                                        <label className="text-[9px] font-black uppercase text-slate-400 tracking-widest block mb-2">Cycle Period</label>
                                        <span className="text-sm font-black text-slate-900 block uppercase italic tracking-tight">{getMonthName(selectedPayroll.month)} {selectedPayroll.year}</span>
                                        <span className={`text-[10px] font-black py-1 px-3 rounded-md uppercase inline-block mt-2 ${selectedPayroll.status === 'paid' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-teacher-primary'}`}>
                                            {selectedPayroll.status}
                                        </span>
                                    </div>
                                </div>

                                <div className="rounded-md border border-slate-100 overflow-hidden mb-8">
                                    <table className="w-full text-left">
                                        <thead>
                                            <tr className="bg-slate-50 border-b border-slate-100">
                                                <th className="px-6 py-4 text-[9px] font-black uppercase tracking-widest text-slate-400">Description</th>
                                                <th className="px-6 py-4 text-right text-[9px] font-black uppercase tracking-widest text-slate-400">Allocation Type</th>
                                                <th className="px-6 py-4 text-right text-[9px] font-black uppercase tracking-widest text-slate-400">Temporal Value</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-50">
                                            <tr>
                                                <td className="px-6 py-4 text-xs font-bold text-slate-700">Base Professional Retribution</td>
                                                <td className="px-6 py-4 text-right text-[10px] font-black text-slate-400 uppercase">Primary</td>
                                                <td className="px-6 py-4 text-right text-xs font-black text-slate-900">₹{selectedPayroll.baseSalary.toLocaleString()}</td>
                                            </tr>
                                            <tr>
                                                <td className="px-6 py-4 text-xs font-bold text-slate-700">Performance Loyalty Bonus</td>
                                                <td className="px-6 py-4 text-right text-[10px] font-black text-emerald-500 uppercase italic">Incentive</td>
                                                <td className="px-6 py-4 text-right text-xs font-black text-emerald-600">+₹{selectedPayroll.bonus.toLocaleString()}</td>
                                            </tr>
                                            <tr>
                                                <td className="px-6 py-4 text-xs font-bold text-slate-700">Institutional Deductions</td>
                                                <td className="px-6 py-4 text-right text-[10px] font-black text-luxury-rose uppercase italic">Reduction</td>
                                                <td className="px-6 py-4 text-right text-xs font-black text-luxury-rose">-₹{selectedPayroll.deductions.toLocaleString()}</td>
                                            </tr>
                                        </tbody>
                                        <tfoot>
                                            <tr className="bg-slate-900 text-white">
                                                <td colSpan="2" className="px-6 py-4 text-[10px] font-black uppercase tracking-widest">Net Institutional Disbursement</td>
                                                <td className="px-6 py-4 text-right text-lg font-black italic tracking-tighter">₹{selectedPayroll.totalAmount.toLocaleString()}</td>
                                            </tr>
                                        </tfoot>
                                    </table>
                                </div>

                                <div className="p-6 bg-slate-50 rounded-md border border-slate-100 flex items-center justify-between">
                                    <div className="flex flex-col">
                                        <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Authorization Node</span>
                                        <span className="text-[10px] font-bold text-slate-600">Institutional Finance Controller</span>
                                    </div>
                                    <div className="w-32 h-10 border-b-2 border-slate-200 border-dotted" />
                                </div>

                                <div className="mt-12 text-center pt-6 border-t border-slate-100">
                                    <p className="text-[9px] font-bold text-slate-300 uppercase tracking-[0.3em]">Financial Intelligence Matrix — Node Alpha-101</p>
                                </div>
                            </div>
                        </div>

                        <button 
                            onClick={handlePrint}
                            className="no-print w-full py-5 bg-slate-900 text-white hover:bg-brand-primary rounded-md font-black text-sm uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-3 shadow-2xl hover:scale-[1.02] active:scale-[0.98]"
                        >
                            <Printer size={18} /> Print Voucher Payload
                        </button>
                    </div>
                )}
            </Modal>
        </motion.div>
    );
};

export default Payroll;
