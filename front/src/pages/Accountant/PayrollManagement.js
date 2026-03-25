import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchPayroll, processPayroll, generatePayroll, createSinglePayroll, updatePayroll, deletePayroll, clearStatus } from '../../redux/slice/accountant.slice';
import axiosInstance from '../../utils/axiosInstance';
import { DollarSign, Search, ChevronRight, User, Calendar, CreditCard, Loader2, Download, Plus, Calculator, Filter, X, CheckCircle2, ChevronLeft, Hash, Printer, FileText, TrendingUp, TrendingDown, ShieldCheck, Zap, Pencil, Trash2, Banknote, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import moment from 'moment';

const PayrollManagement = () => {
    const dispatch = useDispatch();
    const { payroll, pagination, loading, success, error, totals } = useSelector((state) => state.accountant);
    const [searchTerm, setSearchTerm] = useState('');
    const [monthFilter, setMonthFilter] = useState((new Date().getMonth() + 1).toString());
    const [yearFilter, setYearFilter] = useState(new Date().getFullYear().toString());
    const [currentPage, setCurrentPage] = useState(1);
    
    // Controlled Modals
    const [selectedPayroll, setSelectedPayroll] = useState(null);
    const [isGenerateModalOpen, setIsGenerateModalOpen] = useState(false);
    const [isSingleModalOpen, setIsSingleModalOpen] = useState(false);
    const [editingPayroll, setEditingPayroll] = useState(null);
    
    // Component State
    const [teachers, setTeachers] = useState([]);
    const [processData, setProcessData] = useState({ paymentMethod: 'Bank Transfer', transactionId: '', remarks: '' });
    const [formData, setFormData] = useState({ 
        teacherId: '', 
        month: new Date().getMonth() + 1, 
        year: new Date().getFullYear(), 
        basicSalary: '', 
        bonus: 0, 
        deductions: 0, 
        status: 'paid',
        paymentMethod: 'Bank Transfer',
        remarks: '' 
    });

    const [confirmModal, setConfirmModal] = useState({
        show: false,
        title: '',
        message: '',
        onConfirm: null,
        confirmText: 'Execute Protocol'
    });

    useEffect(() => {
        dispatch(fetchPayroll({ 
            search: searchTerm, 
            month: monthFilter,
            year: yearFilter,
            page: currentPage
        }));
    }, [dispatch, searchTerm, monthFilter, yearFilter, currentPage, success]);

    useEffect(() => {
        if (isSingleModalOpen || editingPayroll) {
            axiosInstance.get('/accountant/teachers')
                .then(res => setTeachers(res.data))
                .catch(err => console.error(err));
        }
    }, [isSingleModalOpen, editingPayroll]);

    const handleOpenProcess = (item) => {
        setSelectedPayroll(item);
        setProcessData({
            paymentMethod: item.paymentMethod || 'Bank Transfer',
            transactionId: item.transactionId || '',
            remarks: item.remarks || 'Authorized payroll disbursement protocol.'
        });
    };

    const handleProcessSubmit = () => {
        dispatch(processPayroll({ 
            id: selectedPayroll._id, 
            data: { ...processData, status: 'paid' } 
        }));
        setSelectedPayroll(null);
    };

    const handleGenerateCycle = () => {
        dispatch(generatePayroll({ month: monthFilter, year: yearFilter }));
        setIsGenerateModalOpen(false);
    };

    const handleSingleSubmit = (e) => {
        e.preventDefault();
        if (editingPayroll) {
          dispatch(updatePayroll({ id: editingPayroll._id, data: formData }));
          setEditingPayroll(null);
        } else {
          dispatch(createSinglePayroll(formData));
        }
        setIsSingleModalOpen(false);
        setFormData({ 
            teacherId: '', 
            month: new Date().getMonth() + 1, 
            year: new Date().getFullYear(), 
            basicSalary: '', 
            bonus: 0, 
            deductions: 0, 
            status: 'paid',
            paymentMethod: 'Bank Transfer',
            remarks: '' 
        });
    };

    const handleEdit = (item) => {
      setEditingPayroll(item);
      setFormData({
        teacherId: item.teacherId?._id || '',
        month: item.month,
        year: item.year,
        basicSalary: item.basicSalary,
        bonus: item.bonus || 0,
        deductions: item.deductions || 0,
        status: item.status,
        paymentMethod: item.paymentMethod || 'Bank Transfer',
        remarks: item.remarks || ''
      });
      setIsSingleModalOpen(true);
    };

    const handleDelete = (id) => {
      setConfirmModal({
        show: true,
        title: 'Registry Erasure',
        message: 'Are you certain you wish to permanently erase this payroll record? This action will remove the entry from the fiscal ledger and cannot be recovered.',
        confirmText: 'Erase Record',
        onConfirm: () => {
          dispatch(deletePayroll(id));
          setConfirmModal({ ...confirmModal, show: false });
        }
      });
    };

    const exportCSV = () => {
        const headers = ["Identity", "Employee ID", "Month/Year", "Net Salary", "Status"];
        const rows = (payroll || []).map(p => [
            `${p.teacherId?.firstName} ${p.teacherId?.lastName}`,
            p.teacherId?.employeeId,
            `${p.month}/${p.year}`,
            p.netSalary,
            p.status
        ]);
        const csvContent = "data:text/csv;charset=utf-8," + [headers, ...rows].map(e => e.join(",")).join("\n");
        const link = document.createElement("a");
        link.setAttribute("href", encodeURI(csvContent));
        link.setAttribute("download", `Payroll_Registry_${yearFilter}_${monthFilter}.csv`);
        link.click();
    };

    const generatePayslip = async (item) => {
        try {
            const response = await axiosInstance.get(`/accountant/payroll/${item._id}/payslip`, {
                responseType: 'blob'
            });
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `Payslip_${item.teacherId?.firstName}_${item.month}_${item.year}.pdf`);
            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch (error) {
            console.error('Download failed', error);
        }
    };

    const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    const inputClass = "mt-1.5 w-full bg-[#111827] border border-[#1f2937] rounded-lg py-3 px-4 text-slate-100 placeholder-slate-500 outline-none text-xs font-bold focus:border-[#3b82f6]/50 transition-all";

    return (
        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="space-y-8 pb-10 font-outfit">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                    <h1 className="text-2xl xs:text-3xl font-black text-slate-100 italic uppercase tracking-tighter mb-2">Capital Dispatch Control</h1>
                    <div className="flex items-center gap-3">
                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest italic opacity-70">Mapping employee compensation cycles.</p>
                        <span className="h-px w-8 bg-brand-primary/30"></span>
                        <p className="text-[10px] font-black text-brand-primary uppercase tracking-widest italic">{pagination.payroll.total} Payroll Nodes Detected</p>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <button onClick={() => setIsGenerateModalOpen(true)} className="flex items-center gap-2 px-5 py-3 bg-brand-primary text-white rounded-md text-[11px] font-black uppercase tracking-wider italic hover:bg-brand-primary/80 transition-all shadow-[0_4px_20px_rgba(37,99,235,0.3)]"><Zap size={16} /> Generate Cycle</button>
                    <button onClick={() => { setEditingPayroll(null); setIsSingleModalOpen(true); }} className="flex items-center gap-2 px-5 py-3 bg-brand-background border border-brand-border text-slate-300 rounded-md text-[11px] font-black uppercase tracking-wider italic hover:bg-brand-surface transition-all"><Plus size={16} /> Add Record</button>
                    <button onClick={exportCSV} className="p-3 bg-brand-background border border-brand-border rounded-md text-slate-500 hover:text-brand-primary transition-all"><Download size={18} /></button>
                </div>
            </div>

            {/* Premium Stats Summary */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-brand-surface/40 border border-brand-border/40 p-6 rounded-xl backdrop-blur-md shadow-2xl relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform"><TrendingUp size={48} className="text-luxury-emerald" /></div>
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest italic mb-2">Total Paid Capital</p>
                    <h2 className="text-3xl font-black text-white italic tracking-tighter">₹{(totals.paid || 0).toLocaleString()}</h2>
                    <div className="mt-4 flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-luxury-emerald animate-pulse"></span><span className="text-[9px] font-black text-luxury-emerald uppercase italic tracking-widest">Disbursement Complete</span></div>
                </div>
                <div className="bg-brand-surface/40 border border-brand-border/40 p-6 rounded-xl backdrop-blur-md shadow-2xl relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform"><TrendingDown size={48} className="text-red-500" /></div>
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest italic mb-2">Pending Disbursement</p>
                    <h2 className="text-3xl font-black text-white italic tracking-tighter">₹{(totals.pending || 0).toLocaleString()}</h2>
                    <div className="mt-4 flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span><span className="text-[9px] font-black text-red-500 uppercase italic tracking-widest">Awaiting Authorization</span></div>
                </div>
                <div className="bg-brand-surface/40 border border-brand-border/40 p-6 rounded-xl backdrop-blur-md shadow-2xl relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform"><ShieldCheck size={48} className="text-brand-primary" /></div>
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest italic mb-2">Cycle Integrity</p>
                    <h2 className="text-3xl font-black text-white italic tracking-tighter">100%</h2>
                    <div className="mt-4 flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-brand-primary"></span><span className="text-[9px] font-black text-brand-primary uppercase italic tracking-widest">Protocol Verified</span></div>
                </div>
            </div>

            {/* Matrix Filter System */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 bg-brand-surface/40 p-4 rounded-md border border-brand-border/40 backdrop-blur-sm shadow-xl">
                <div className="relative">
                    <Search className="absolute left-3.5 top-3.5 text-slate-600" size={14} />
                    <input type="text" placeholder="Search identities..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full bg-brand-background border border-brand-border rounded-lg py-3 pl-10 pr-4 text-[11px] font-black text-slate-200 outline-none focus:border-brand-primary transition-all uppercase tracking-tighter" />
                </div>
                <select value={monthFilter} onChange={(e) => setMonthFilter(e.target.value)} className="bg-brand-background border border-brand-border rounded-lg py-3 px-4 text-[10px] font-black text-slate-400 uppercase tracking-widest italic outline-none focus:border-brand-primary appearance-none">
                    <option value="">Full Archive</option>
                    {months.map((m, i) => <option key={i+1} value={i+1}>{m} Cycle</option>)}
                </select>
                <select value={yearFilter} onChange={(e) => setYearFilter(e.target.value)} className="bg-brand-background border border-brand-border rounded-lg py-3 px-4 text-[10px] font-black text-slate-400 uppercase tracking-widest italic outline-none focus:border-brand-primary appearance-none">
                    <option value="2025">Fiscal 2025</option>
                    <option value="2026">Fiscal 2026</option>
                    <option value="2024">Fiscal 2024</option>
                </select>
                <div className="flex items-center justify-center py-3 bg-brand-background border border-brand-border rounded-lg text-[9px] font-black text-slate-500 uppercase tracking-[0.25em] italic">Node Connection Established</div>
            </div>

            {/* Capital Registry Matrix - UPDATED FORMAT */}
            <div className="bg-brand-surface/40 border border-brand-border/40 rounded-md overflow-hidden shadow-2xl">
                <div className="overflow-x-auto custom-scrollbar">
                    <table className="w-full text-left">
                    <thead>
                        <tr className="border-b border-brand-border/30 bg-white/5">
                            {['Teacher', 'Month/Year', 'Base Salary', 'Bonus/Ded', 'Total', 'Status', 'Actions'].map(h => (
                                <th key={h} className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">{h}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-brand-border/10">
                        {payroll?.length > 0 ? payroll.map((item, i) => (
                            <tr key={i} className="group/row hover:bg-slate-800/40 transition-all font-outfit">
                                <td className="px-8 py-6">
                                    <div className="flex flex-col">
                                        <span className="font-bold text-slate-100 group-hover:text-brand-primary transition-colors text-[13px] uppercase tracking-tight">{item.teacherId?.firstName} {item.teacherId?.lastName}</span>
                                        <span className="text-[10px] text-slate-600 font-mono tracking-tighter">{item.teacherId?.employeeId}</span>
                                    </div>
                                </td>
                                <td className="px-8 py-6">
                                    <span className="text-sm font-medium text-slate-400 italic uppercase tracking-tighter">{months[item.month - 1]} {item.year}</span>
                                </td>
                                <td className="px-8 py-6 text-sm font-mono text-slate-400">
                                    ₹{(item.basicSalary || 0).toLocaleString()}
                                </td>
                                <td className="px-8 py-6">
                                    <div className="flex items-center gap-1.5 text-[10px] font-black tracking-tighter">
                                        <span className="text-luxury-emerald">+{item.bonus || 0}</span>
                                        <span className="text-slate-800 text-[12px]">/</span>
                                        <span className="text-red-500">-{item.deductions || 0}</span>
                                    </div>
                                </td>
                                <td className="px-8 py-6 font-black text-[15px] text-brand-primary italic tracking-tighter">
                                    ₹{(item.netSalary || 0).toLocaleString()}
                                </td>
                                <td className="px-8 py-6">
                                    <span className={`px-3 py-1 rounded text-[9px] font-black uppercase tracking-widest italic border ${item.status === 'paid' ? 'text-luxury-emerald border-luxury-emerald/20 bg-luxury-emerald/5' : 'text-accountant-primary border-accountant-primary/20 bg-accountant-primary/5'}`}>
                                        {item.status}
                                    </span>
                                </td>
                                <td className="px-8 py-6">
                                    <div className="flex gap-4">
                                        {item.status !== 'paid' && (
                                          <button onClick={() => handleOpenProcess(item)} title="Authorize" className="text-slate-500 hover:text-luxury-emerald transition-all"><CreditCard size={17} /></button>
                                        )}
                                        {item.status === 'paid' && (
                                          <button onClick={() => generatePayslip(item)} title="Download Payslip" className="text-slate-500 hover:text-brand-primary transition-all"><Printer size={17} /></button>
                                        )}
                                        <button onClick={() => handleEdit(item)} className="text-slate-500 hover:text-luxury-gold transition-all"><Pencil size={17} /></button>
                                        <button onClick={() => handleDelete(item._id)} className="text-slate-500 hover:text-red-500 transition-all"><Trash2 size={17} /></button>
                                    </div>
                                </td>
                            </tr>
                        )) : (
                            <tr><td colSpan={7} className="px-8 py-24 text-center text-slate-600 italic uppercase text-xs tracking-widest">No payroll nodes detected.</td></tr>
                        )}
                    </tbody>
                </table>
                </div>
            </div>

            {/* Pagination */}
            <div className="px-8 py-5 border-t border-brand-border/40 bg-brand-background/20 rounded-md flex items-center justify-between">
                <p className="text-[10px] font-black text-slate-500 uppercase italic tracking-widest">Sequence: <span className="text-brand-primary">{pagination.payroll.current} / {pagination.payroll.pages}</span></p>
                <div className="flex gap-2">
                    <button disabled={pagination.payroll.current === 1} onClick={() => setCurrentPage(p => p-1)} className="p-2 border border-brand-border rounded hover:bg-brand-background disabled:opacity-20 transition-all text-slate-500"><ChevronLeft size={16} /></button>
                    <button disabled={pagination.payroll.current === pagination.payroll.pages} onClick={() => setCurrentPage(p => p+1)} className="p-2 border border-brand-border rounded hover:bg-brand-background disabled:opacity-20 transition-all text-slate-500"><ChevronRight size={16} /></button>
                </div>
            </div>

            {/* Cycle Modal */}
            <AnimatePresence>
                {isGenerateModalOpen && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md">
                        <motion.div initial={{ scale: 0.95, y: 30 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 30 }} className="bg-[#0b0e14] border border-[#1e293b] rounded-xl p-8 w-full max-w-md shadow-2xl relative overflow-hidden">
                            <div className="flex items-center justify-between mb-8"><h3 className="text-lg font-black text-white italic uppercase tracking-tighter">Initialize Capital Cycle</h3><button onClick={() => setIsGenerateModalOpen(false)} className="text-slate-500 hover:text-white transition-all"><X size={20} /></button></div>
                            <div className="bg-brand-primary/10 border border-brand-primary/30 rounded-lg p-6 mb-8 text-center"><p className="text-[11px] font-bold text-slate-300 uppercase leading-relaxed">Triggering will generate records for <span className="text-brand-primary font-black">ALL ACTIVE STAFF</span> for {months[parseInt(monthFilter)-1]} {yearFilter}.</p></div>
                            <button onClick={handleGenerateCycle} className="w-full py-4 bg-brand-primary hover:bg-brand-primary/90 text-xs font-black text-white uppercase tracking-widest rounded-lg shadow-xl shadow-blue-600/20">Execute Cycle Protocol</button>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Manual/Edit Modal */}
            <AnimatePresence>
                {isSingleModalOpen && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md">
                        <motion.div initial={{ scale: 0.95, y: 30 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 30 }} className="bg-[#0b0e14] border border-[#1e293b] rounded-xl p-0 w-full max-w-lg shadow-2xl relative overflow-hidden font-black">
                            <div className="flex items-center justify-between px-8 py-6 border-b border-[#1e293b]/50">
                                <h3 className="text-[16px] font-black text-white italic uppercase tracking-tighter">{editingPayroll ? 'Edit Capital Entry' : 'Manual Capital Entry'}</h3>
                                <button onClick={() => setIsSingleModalOpen(false)} className="text-slate-500 hover:text-white transition-all"><X size={20} /></button>
                            </div>
                            <form onSubmit={handleSingleSubmit} className="p-8 space-y-6 text-left">
                                <div><label className="text-[10px] uppercase tracking-widest text-[#64748b]">Selected Teacher Identity</label>
                                    <select required value={formData.teacherId} onChange={(e) => { const tId = e.target.value; const teacher = teachers.find(t => t._id === tId); setFormData({ ...formData, teacherId: tId, basicSalary: teacher ? (teacher.baseSalary || 0) : '' }); }} className={inputClass + " appearance-none"} disabled={!!editingPayroll}><option value="">Scan Staff Inventory...</option>{teachers.map(t => <option key={t._id} value={t._id}>{t.firstName} {t.lastName} ({t.employeeId})</option>)}</select></div>
                                <div className="grid grid-cols-2 gap-5">
                                    <div><label className="text-[10px] uppercase tracking-widest text-[#64748b]">Fiscal Cycle Month</label><select value={formData.month} onChange={(e) => setFormData({...formData, month: e.target.value})} className={inputClass}>{months.map((m, i) => <option key={m} value={i+1}>{m}</option>)}</select></div>
                                    <div><label className="text-[10px] uppercase tracking-widest text-[#64748b]">Fiscal Cycle Year</label><input type="number" value={formData.year} onChange={(e) => setFormData({...formData, year: e.target.value})} className={inputClass} /></div>
                                </div>
                                <div className="grid grid-cols-3 gap-5">
                                    <div><label className="text-[10px] uppercase tracking-widest text-[#64748b]">Base Capital</label><input type="number" required value={formData.basicSalary} onChange={(e) => setFormData({...formData, basicSalary: e.target.value})} className={inputClass} placeholder="0.00" /></div>
                                    <div><label className="text-[10px] uppercase tracking-widest text-luxury-emerald">Bonus (+)</label><input type="number" value={formData.bonus} onChange={(e) => setFormData({...formData, bonus: e.target.value})} className={inputClass + " text-luxury-emerald"} /></div>
                                    <div><label className="text-[10px] uppercase tracking-widest text-red-500">Ded (-)</label><input type="number" value={formData.deductions} onChange={(e) => setFormData({...formData, deductions: e.target.value})} className={inputClass + " text-red-500"} /></div>
                                </div>
                                <div className="grid grid-cols-2 gap-5">
                                    <div><label className="text-[10px] uppercase tracking-widest text-[#64748b]">Entry Status</label><select value={formData.status} onChange={(e) => setFormData({...formData, status: e.target.value})} className={inputClass}><option value="paid">PAID (CONFIRMED)</option><option value="unpaid">UNPAID (PENDING)</option></select></div>
                                    <div><label className="text-[10px] uppercase tracking-widest text-[#64748b]">Matrix</label><select value={formData.paymentMethod} onChange={(e) => setFormData({...formData, paymentMethod: e.target.value})} className={inputClass}><option value="Bank Transfer">Bank Transfer</option><option value="Cash">Cash Liquidity</option><option value="Online">Online / Digital</option></select></div>
                                </div>
                                <button type="submit" className="w-full py-4 bg-white text-black text-xs uppercase tracking-widest rounded-lg shadow-xl shadow-white/5 flex items-center justify-center gap-2 transition-all active:scale-[0.98]"><Banknote size={16} /> Commit Entry to Registry</button>
                            </form>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Authorization Modal */}
            <AnimatePresence>
                {selectedPayroll && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md">
                        <motion.div initial={{ scale: 0.95, y: 30 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 30 }} className="bg-[#0b0e14] border border-[#1e293b] rounded-xl p-0 w-full max-w-lg shadow-2xl relative overflow-hidden">
                            <div className="absolute top-0 left-0 w-1 h-full bg-red-500"></div>
                            <div className="flex items-center justify-between px-8 py-6 border-b border-[#1e293b]/50">
                                <div><h3 className="text-lg font-black text-white italic uppercase tracking-tighter mb-1">Authorization Protocol</h3><p className="text-[9px] font-black text-slate-500 uppercase tracking-widest italic leading-none">Finalizing capital release for {selectedPayroll.teacherId?.firstName}.</p></div>
                                <button onClick={() => setSelectedPayroll(null)} className="text-slate-500 hover:text-white transition-all"><X size={20} /></button>
                            </div>
                            <div className="p-8">
                                <div className="bg-[#111827] border border-[#1e293b] rounded-xl p-6 mb-8 space-y-4">
                                    <div className="flex justify-between text-[11px] font-black text-slate-500 italic uppercase"><span>Base Capital</span><span className="text-white">₹{selectedPayroll.basicSalary?.toLocaleString()}</span></div>
                                    <div className="pt-4 border-t border-[#1e293b]/50 flex justify-between items-center"><span className="text-[11px] font-black text-red-500 uppercase italic tracking-widest">Net Disposal</span><span className="text-2xl font-black text-white italic tracking-tighter">₹{selectedPayroll.netSalary?.toLocaleString()}</span></div>
                                </div>
                                <button onClick={handleProcessSubmit} className="w-full py-4 bg-red-600 hover:bg-red-700 text-xs font-black text-white uppercase tracking-widest rounded-lg italic shadow-xl shadow-red-600/20 transition-all active:scale-[0.98]">Authorize Disbursement</button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Confirmation Modal */}
            <AnimatePresence>
                {confirmModal.show && (
                    <motion.div 
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md"
                    >
                        <motion.div 
                            initial={{ scale: 0.95, y: 10 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 10 }}
                            className="bg-brand-surface border border-brand-border rounded-md p-8 w-full max-w-md shadow-[0_0_100px_rgba(0,0,0,0.8)] relative"
                        >
                            <div className="flex items-center gap-4 mb-6 text-left">
                                <div className="w-12 h-12 rounded bg-luxury-rose/10 flex items-center justify-center text-luxury-rose border border-luxury-rose/20">
                                    <AlertCircle size={24} />
                                </div>
                                <div>
                                    <h3 className="text-lg font-black text-slate-100 italic uppercase tracking-tighter leading-none mb-1">{confirmModal.title}</h3>
                                    <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest opacity-60">High-Level Authorization Protocol</span>
                                </div>
                            </div>
                            
                            <p className="text-xs font-bold text-slate-400 italic leading-relaxed mb-8 text-left uppercase tracking-tight opacity-70 font-outfit">
                                {confirmModal.message}
                            </p>

                            <div className="flex gap-3 font-outfit">
                                <button 
                                    onClick={() => setConfirmModal({ ...confirmModal, show: false })}
                                    className="flex-1 py-3 bg-brand-background border border-brand-border rounded text-[10px] font-black text-slate-500 uppercase tracking-widest italic hover:text-slate-100 transition-all font-outfit"
                                >
                                    Abort Operation
                                </button>
                                <button 
                                    onClick={confirmModal.onConfirm}
                                    className="flex-1 py-3 bg-red-600 text-white rounded text-[10px] font-black uppercase tracking-[0.1em] italic shadow-xl shadow-red-600/20 hover:bg-red-700 transition-all font-outfit"
                                >
                                    {confirmModal.confirmText}
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            <AnimatePresence>
                {(success || error) && (
                <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className={`fixed bottom-10 right-10 z-[110] px-7 py-5 rounded-lg border shadow-3xl flex items-center gap-5 backdrop-blur-xl ${success ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-500' : 'bg-red-500/10 border-red-500/30 text-red-500'}`}>
                  <div className="flex flex-col text-left font-outfit uppercase"><span className="text-[10px] font-black tracking-widest italic leading-none mb-1.5">{success ? 'Registry Confirmed' : 'Protocol Failure'}</span><span className="text-xs font-bold text-slate-100 italic leading-none">{String(success || error?.message || error || '')}</span></div>

                  <button onClick={() => dispatch(clearStatus())} className="p-1.5 hover:opacity-60 transition-all bg-white/5 rounded-md"><X size={16} /></button>
                </motion.div>
              )}
            </AnimatePresence>
        </motion.div>
    );
};

export default PayrollManagement;
