import React, { useEffect, useState, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchFees, collectFee, sendFeeReminders, clearStatus } from '../../redux/slice/accountant.slice';
import { DollarSign, Search, ChevronRight, User, Calendar, CreditCard, Loader2, Download, Bell, Calculator, Filter, X, CheckCircle2, ChevronLeft, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import moment from 'moment';

const FeeCollection = () => {
    const dispatch = useDispatch();
    const { fees, pagination, loading, success, error } = useSelector((state) => state.accountant);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [dateRange, setDateRange] = useState({ start: '', end: '' });
    const [currentPage, setCurrentPage] = useState(1);
    
    const [selectedFee, setSelectedFee] = useState(null);
    const [collectionData, setCollectionData] = useState({
        paidAmount: 0,
        paymentMethod: 'cash',
        transactionId: '',
        lateFees: 0,
        note: ''
    });

    useEffect(() => {
        const delaySearch = setTimeout(() => {
            dispatch(fetchFees({ 
                search: searchTerm, 
                status: statusFilter,
                startDate: dateRange.start,
                endDate: dateRange.end,
                page: currentPage
            }));
        }, 500);
        return () => clearTimeout(delaySearch);
    }, [dispatch, searchTerm, statusFilter, dateRange, currentPage, success]);

    const handleOpenModal = (fee) => {
        // Auto-calculate late fees if overdue (e.g., $10 per week late, or flat $50 if overdue)
        // Simplified Logic: Flat $50 if today > dueDate and status is not paid
        let calculatedLateFee = 0;
        if (moment().isAfter(moment(fee.dueDate)) && fee.status !== 'paid') {
            const daysLate = moment().diff(moment(fee.dueDate), 'days');
            calculatedLateFee = daysLate > 0 ? Math.min(daysLate * 5, 200) : 0; // $5/day, max $200
        }

        setSelectedFee(fee);
        setCollectionData({
            paidAmount: (fee.totalAmount || fee.amount) - (fee.paidAmount || 0),
            paymentMethod: 'cash',
            transactionId: '',
            lateFees: calculatedLateFee || fee.lateFees || 0,
            note: calculatedLateFee > 0 ? `Auto-calculated late penalty: $${calculatedLateFee}` : 'Manual collection via Fiscal Terminal'
        });
    };

    const handleCollectSubmit = () => {
        if (loading) return; // Guard
        dispatch(collectFee({ 
            id: selectedFee._id, 
            data: collectionData 
        }));
        setSelectedFee(null);
    };

    const exportCSV = () => {
        const headers = ["Identity", "Admission", "Status", "Due Date", "Total", "Paid", "Pending"];
        const rows = (fees || []).map(f => [
            `${f.studentId?.firstName} ${f.studentId?.lastName}`,
            f.studentId?.admissionNumber,
            f.status,
            moment(f.dueDate).format('YYYY-MM-DD'),
            f.totalAmount,
            f.paidAmount || 0,
            (f.totalAmount || 0) - (f.paidAmount || 0)
        ]);

        const csvContent = "data:text/csv;charset=utf-8," + [headers, ...rows].map(e => e.join(",")).join("\n");
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `Fiscal_Registry_${moment().format('YYYYMMDD')}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="space-y-8 pb-10">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                    <h1 className="text-2xl xs:text-3xl font-black text-slate-100 italic uppercase tracking-tighter leading-none mb-2">Fee Inventory Control</h1>
                    <div className="flex items-center gap-3">
                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest italic opacity-70 leading-none">Mapping citizen financial status nodes.</p>
                        <span className="h-px w-8 bg-brand-primary/30"></span>
                        <p className="text-[10px] font-black text-brand-primary uppercase tracking-widest italic leading-none">{pagination.fees.total} Records Detected</p>
                    </div>
                </div>
                <button 
                    onClick={exportCSV}
                    className="flex items-center gap-2 px-4 py-2 bg-brand-background border border-brand-border rounded-md text-[10px] font-black text-slate-400 uppercase tracking-widest italic hover:text-brand-primary hover:border-brand-primary/30 transition-all shadow-xl"
                >
                    <Download size={14} />
                    Export Fiscal Data
                </button>
            </div>

            {/* Filters Bar */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 bg-brand-surface/50 p-4 rounded-md border border-brand-border">
                <div className="relative">
                    <Search className="absolute left-3 top-3 text-slate-600" size={14} />
                    <input 
                        type="text" 
                        placeholder="Search identities..." 
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full bg-brand-background border border-brand-border rounded-md py-2.5 pl-9 pr-4 text-xs font-bold text-slate-200 focus:outline-none focus:border-brand-primary/50 transition-all"
                    />
                </div>
                <select 
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="bg-brand-background border border-brand-border rounded-md py-2.5 px-4 text-xs font-black text-slate-400 uppercase tracking-widest italic focus:outline-none focus:border-brand-primary/50 appearance-none"
                >
                    <option value="">All Status Nodes</option>
                    <option value="pending">Pending</option>
                    <option value="partially_paid">Partially Paid</option>
                    <option value="overdue">Overdue</option>
                    <option value="paid">Finalized</option>
                </select>
                <input 
                    type="date" 
                    value={dateRange.start}
                    onChange={(e) => setDateRange({...dateRange, start: e.target.value})}
                    className="bg-brand-background border border-brand-border rounded-md py-2.5 px-4 text-xs font-bold text-slate-400 italic focus:outline-none focus:border-brand-primary/50"
                />
                <input 
                    type="date" 
                    value={dateRange.end}
                    onChange={(e) => setDateRange({...dateRange, end: e.target.value})}
                    className="bg-brand-background border border-brand-border rounded-md py-2.5 px-4 text-xs font-bold text-slate-400 italic focus:outline-none focus:border-brand-primary/50"
                />
            </div>

            <div className="bg-brand-surface border border-brand-border rounded-md shadow-2xl overflow-hidden group">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-separate border-spacing-0">
                        <thead>
                            <tr className="bg-brand-background/50">
                                <th className="px-6 py-4 text-[9px] font-black text-slate-500 uppercase tracking-widest italic leading-none border-b border-brand-border">Identity Identifier</th>
                                <th className="px-6 py-4 text-[9px] font-black text-slate-500 uppercase tracking-widest italic leading-none border-b border-brand-border text-center">Fiscal Status</th>
                                <th className="px-6 py-4 text-[9px] font-black text-slate-500 uppercase tracking-widest italic leading-none border-b border-brand-border">Net Balance</th>
                                <th className="px-6 py-4 text-[9px] font-black text-slate-500 uppercase tracking-widest italic leading-none border-b border-brand-border">Timeline</th>
                                <th className="px-6 py-4 text-[9px] font-black text-slate-500 uppercase tracking-widest italic leading-none border-b border-brand-border text-right whitespace-nowrap">Control Nodes</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-brand-border">
                            {fees && fees.length > 0 ? fees.map((fee, i) => (
                                <tr key={i} className="group/row hover:bg-brand-background/40 transition-all">
                                    <td className="px-6 py-5">
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 rounded-md bg-slate-800 border border-brand-border overflow-hidden p-0.5 group-hover/row:border-brand-primary/30 transition-all shadow-sm flex items-center justify-center text-slate-500">
                                                <User size={18} />
                                            </div>
                                            <div className="flex flex-col text-left">
                                                <span className="font-bold text-sm text-slate-200 tracking-tight group-hover/row:text-brand-primary transition-colors leading-none mb-1.5">{fee.studentId?.firstName} {fee.studentId?.lastName}</span>
                                                <span className="text-[10px] font-medium text-slate-500 opacity-60 uppercase italic">{fee.studentId?.admissionNumber}</span>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-5 text-center">
                                        <span className={`inline-flex items-center px-2 py-0.5 border text-[9px] font-black uppercase tracking-widest rounded-md italic ${fee.status === 'paid' ? 'bg-luxury-emerald/10 border-luxury-emerald/20 text-luxury-emerald' : fee.status === 'partially_paid' ? 'bg-luxury-gold/10 border-luxury-gold/20 text-luxury-gold' : 'bg-luxury-rose/10 border-luxury-rose/20 text-luxury-rose'}`}>{fee.status}</span>
                                    </td>
                                    <td className="px-6 py-5">
                                        <div className="flex flex-col">
                                            <span className="text-sm font-black text-slate-100 tracking-tighter italic uppercase leading-none mb-1">${((fee.totalAmount || fee.amount || 0) - (fee.paidAmount || 0)).toLocaleString()}</span>
                                            <span className="text-[9px] font-bold text-slate-600 uppercase italic leading-none opacity-60">of ${(fee.totalAmount || fee.amount || 0).toLocaleString()}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-5">
                                        <div className="flex items-center gap-2">
                                            <Calendar size={12} className={moment(fee.dueDate).isBefore(moment()) && fee.status !== 'paid' ? 'text-luxury-rose animate-pulse' : 'text-slate-600'} />
                                            <span className={`text-[10px] font-bold uppercase italic opacity-80 ${moment(fee.dueDate).isBefore(moment()) && fee.status !== 'paid' ? 'text-luxury-rose' : 'text-slate-400'}`}>{moment(fee.dueDate).format('YYYY-MM-DD')}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-5 text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            {fee.status !== 'paid' ? (
                                                <>
                                                    <button 
                                                        onClick={() => dispatch(sendFeeReminders({ studentId: fee.studentId._id, feeId: fee._id }))}
                                                        title="Broadcast Reminder"
                                                        className="p-2 text-slate-500 hover:text-luxury-emerald transition-all opacity-0 group-hover/row:opacity-100"
                                                    >
                                                        <Bell size={16} />
                                                    </button>
                                                    <button 
                                                        onClick={() => handleOpenModal(fee)}
                                                        className="flex items-center gap-2 px-3 py-1.5 bg-brand-background border border-brand-border rounded-md text-[10px] font-black text-slate-400 uppercase tracking-widest italic group-hover/row:border-brand-primary/50 group-hover/row:text-slate-100 transition-all opacity-0 group-hover/row:opacity-100"
                                                    >
                                                        <span>Sync Node</span>
                                                        <CreditCard size={12} />
                                                    </button>
                                                </>
                                            ) : (
                                                <button 
                                                    onClick={() => {
                                                        if(window.confirm("Reverse this payment? Status will reset to pending.")) {
                                                            dispatch(collectFee({ 
                                                                id: fee._id, 
                                                                data: { paidAmount: 0, status: 'pending', note: 'Manual Reversal Protocol Issued' } 
                                                            }));
                                                        }
                                                    }}
                                                    className="flex items-center gap-2 px-3 py-1.5 bg-brand-background border border-luxury-rose/30 rounded-md text-[9px] font-black text-luxury-rose uppercase tracking-widest italic hover:bg-luxury-rose hover:text-white transition-all opacity-0 group-hover/row:opacity-100"
                                                >
                                                    Reverse Node
                                                </button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan="5" className="px-6 py-20 text-center text-slate-500 italic opacity-60 font-black uppercase text-xs tracking-widest">Initialization pending... no financial signals detected.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination Controls */}
                <div className="px-6 py-4 border-t border-brand-border bg-brand-background/20 flex items-center justify-between">
                    <span className="text-[10px] font-black text-slate-500 uppercase italic">Page {pagination.fees.current} of {pagination.fees.pages}</span>
                    <div className="flex items-center gap-2">
                        <button 
                            disabled={pagination.fees.current === 1}
                            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                            className="p-2 border border-brand-border rounded hover:bg-brand-background text-slate-500 disabled:opacity-30 disabled:hover:bg-transparent transition-all"
                        >
                            <ChevronLeft size={16} />
                        </button>
                        <button 
                            disabled={pagination.fees.current === pagination.fees.pages}
                            onClick={() => setCurrentPage(prev => Math.min(pagination.fees.pages, prev + 1))}
                            className="p-2 border border-brand-border rounded hover:bg-brand-background text-slate-500 disabled:opacity-30 disabled:hover:bg-transparent transition-all"
                        >
                            <ChevronRight size={16} />
                        </button>
                    </div>
                </div>
            </div>

            {/* Collection Modal */}
            <AnimatePresence>
                {selectedFee && (
                    <motion.div 
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
                    >
                        <motion.div 
                            initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }}
                            className="bg-brand-surface border border-brand-border rounded-md p-8 w-full max-w-lg shadow-[0_0_50px_rgba(0,0,0,0.5)] relative overflow-hidden"
                        >
                            <div className="absolute top-0 left-0 w-1 h-full bg-brand-primary"></div>
                            
                            <div className="flex items-start justify-between mb-8">
                                <div>
                                    <h3 className="text-xl font-black text-slate-100 italic uppercase tracking-tighter leading-none mb-1">Fiscal Synchronization</h3>
                                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest italic">Updating node status for {selectedFee.studentId?.firstName}.</p>
                                </div>
                                <button onClick={() => setSelectedFee(null)} className="p-1 hover:text-brand-primary transition-all text-slate-600"><X size={20} /></button>
                            </div>

                            {moment().isAfter(moment(selectedFee.dueDate)) && (
                                <div className="mb-6 p-3 bg-luxury-rose/10 border border-luxury-rose/20 rounded-md flex items-center gap-3">
                                    <AlertCircle className="text-luxury-rose" size={18} />
                                    <p className="text-[10px] font-black text-luxury-rose uppercase italic tracking-wider">Overdue Alert: Automatic penalty logic triggered.</p>
                                </div>
                            )}

                            <div className="grid grid-cols-2 gap-6 mb-8">
                                <div className="space-y-4 text-left">
                                    <div>
                                        <label className="text-[9px] font-black uppercase text-slate-500 tracking-widest mb-1.5 block italic">Payment Amount ($)</label>
                                        <input 
                                            type="number"
                                            value={collectionData.paidAmount}
                                            onChange={(e) => setCollectionData({...collectionData, paidAmount: Number(e.target.value)})}
                                            className="w-full bg-brand-background border border-brand-border rounded-md py-3 px-4 text-sm font-black text-slate-100 focus:outline-none focus:border-brand-primary/50"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-[9px] font-black uppercase text-slate-500 tracking-widest mb-1.5 block italic">Late Penalty ($)</label>
                                        <input 
                                            type="number"
                                            value={collectionData.lateFees}
                                            onChange={(e) => setCollectionData({...collectionData, lateFees: Number(e.target.value)})}
                                            className="w-full bg-brand-background border border-brand-border rounded-md py-3 px-4 text-sm font-black text-slate-100 focus:outline-none focus:border-brand-primary/50"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-4 text-left">
                                    <div>
                                        <label className="text-[9px] font-black uppercase text-slate-500 tracking-widest mb-1.5 block italic">Method Matrix</label>
                                        <select 
                                            value={collectionData.paymentMethod}
                                            onChange={(e) => setCollectionData({...collectionData, paymentMethod: e.target.value})}
                                            className="w-full bg-brand-background border border-brand-border rounded-md py-3 px-4 text-xs font-black text-slate-400 uppercase tracking-widest italic focus:outline-none focus:border-brand-primary/50 appearance-none"
                                        >
                                            <option value="cash">Cash Liquidity</option>
                                            <option value="bank_transfer">Bank Protocol</option>
                                            <option value="online">Digital Gateway</option>
                                            <option value="cheque">Paper Authorization</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="text-[9px] font-black uppercase text-slate-500 tracking-widest mb-1.5 block italic">Transaction Hash</label>
                                        <input 
                                            type="text"
                                            placeholder="REF-HASH-XXX"
                                            value={collectionData.transactionId}
                                            onChange={(e) => setCollectionData({...collectionData, transactionId: e.target.value})}
                                            className="w-full bg-brand-background border border-brand-border rounded-md py-3 px-4 text-[10px] font-black text-slate-100 focus:outline-none focus:border-brand-primary/50 uppercase italic"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="mb-8 text-left">
                                <label className="text-[9px] font-black uppercase text-slate-500 tracking-widest mb-1.5 block italic">Fiscal Remarks</label>
                                <textarea 
                                    rows="2"
                                    value={collectionData.note}
                                    onChange={(e) => setCollectionData({...collectionData, note: e.target.value})}
                                    className="w-full bg-brand-background border border-brand-border rounded-md py-3 px-4 text-xs font-bold text-slate-300 focus:outline-none focus:border-brand-primary/50 resize-none italic"
                                ></textarea>
                            </div>

                            <button 
                                onClick={handleCollectSubmit}
                                disabled={loading}
                                className="w-full py-4 bg-brand-primary hover:bg-brand-primary/90 text-[11px] font-black text-slate-900 uppercase tracking-[0.2em] rounded-md shadow-[0_10px_30px_rgba(56,189,248,0.2)] transition-all italic flex items-center justify-center gap-3 disabled:opacity-50"
                            >
                                {loading ? <Loader2 className="animate-spin" size={16} /> : (
                                    <>
                                        Authorize Synchronization
                                        <ChevronRight size={14} />
                                    </>
                                )}
                            </button>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            <AnimatePresence>
                {(success || error) && (
                    <motion.div 
                        initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}
                        className={`fixed bottom-10 right-10 z-[110] px-6 py-4 rounded-md border shadow-2xl flex items-center gap-4 ${success ? 'bg-luxury-emerald/10 border-luxury-emerald/20 text-luxury-emerald' : 'bg-luxury-rose/10 border-luxury-rose/20 text-luxury-rose'}`}
                    >
                        <div className="flex flex-col text-left">
                            <span className="text-[9px] font-black uppercase tracking-widest italic leading-none mb-1.5">{success ? 'Node Stabilized' : 'Sync Error'}</span>
                            <span className="text-xs font-bold text-slate-100 italic leading-none">{success || error}</span>
                        </div>
                        <button onClick={() => dispatch(clearStatus())} className="p-1 hover:opacity-60"><X size={14} /></button>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
};

export default FeeCollection;
