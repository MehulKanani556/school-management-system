import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchFees, collectFee } from '../../redux/slice/accountant.slice';
import { DollarSign, Search, ChevronRight, User, Calendar, CreditCard, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import moment from 'moment';

const FeeCollection = () => {
    const dispatch = useDispatch();
    const { fees, loading, success } = useSelector((state) => state.accountant);

    useEffect(() => {
        dispatch(fetchFees());
    }, [dispatch, success]);

    const handleCollect = (id, amount) => {
        dispatch(collectFee({ id, data: { paidAmount: amount, paymentMethod: 'Cash', note: 'Manual collection via Fiscal Terminal' } }));
    };

    return (
        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="space-y-8 pb-10">
            <div>
                <h1 className="text-2xl xs:text-3xl font-black text-slate-100 italic uppercase tracking-tighter leading-none mb-1">Fee Inventory Control</h1>
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest italic opacity-70 leading-none">Mapping citizen financial status nodes.</p>
            </div>

            <div className="bg-brand-surface border border-brand-border rounded-md shadow-2xl overflow-hidden group">
                <div className="px-6 py-5 border-b border-brand-border bg-brand-background/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <h2 className="text-lg font-black italic uppercase tracking-tight text-slate-100 leading-none">Collection Registry</h2>
                    <div className="relative">
                        <Search className="absolute left-3 top-2.5 text-slate-600" size={14} />
                        <input 
                            type="text" 
                            placeholder="Search identities..." 
                            className="bg-brand-background border border-brand-border rounded-md py-2 pl-9 pr-4 text-xs font-bold text-slate-200 focus:outline-none focus:border-brand-primary/50 transition-all w-full sm:w-64"
                        />
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-brand-background/50 border-b border-brand-border">
                                <th className="px-6 py-4 text-[9px] font-black text-slate-500 uppercase tracking-widest italic leading-none">Identity Identifier</th>
                                <th className="px-6 py-4 text-[9px] font-black text-slate-500 uppercase tracking-widest italic leading-none">Fiscal Status</th>
                                <th className="px-6 py-4 text-[9px] font-black text-slate-500 uppercase tracking-widest italic leading-none">Net Overdue</th>
                                <th className="px-6 py-4 text-[9px] font-black text-slate-500 uppercase tracking-widest italic leading-none">Due Date</th>
                                <th className="px-6 py-4 text-[9px] font-black text-slate-500 uppercase tracking-widest italic leading-none text-right">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-brand-border">
                            {fees.length > 0 ? fees.map((fee, i) => (
                                <tr key={i} className="group/row hover:bg-brand-background/40 transition-all">
                                    <td className="px-6 py-5">
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 rounded-md bg-slate-800 border border-brand-border overflow-hidden p-0.5 group-hover/row:border-brand-primary/30 transition-all shadow-sm">
                                                <div className="w-full h-full flex items-center justify-center text-slate-500"><User size={18} /></div>
                                            </div>
                                            <div className="flex flex-col">
                                                <span className="font-bold text-sm text-slate-200 tracking-tight group-hover/row:text-brand-primary transition-colors leading-none mb-1.5">{fee.studentId?.firstName} {fee.studentId?.lastName}</span>
                                                <span className="text-[10px] font-medium text-slate-500 opacity-60 uppercase italic">{fee.studentId?.admissionNumber}</span>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-5">
                                        <span className={`inline-flex items-center px-2 py-0.5 border text-[9px] font-black uppercase tracking-widest rounded-md italic ${fee.status === 'paid' ? 'bg-luxury-emerald/10 border-luxury-emerald/20 text-luxury-emerald' : 'bg-luxury-rose/10 border-luxury-rose/20 text-luxury-rose'}`}>{fee.status}</span>
                                    </td>
                                    <td className="px-6 py-5">
                                        <div className="flex flex-col">
                                            <span className="text-sm font-black text-slate-100 tracking-tighter italic uppercase leading-none mb-1">${(fee.amount + (fee.lateFees || 0)) - (fee.paidAmount || 0)}</span>
                                            <span className="text-[9px] font-bold text-slate-600 uppercase italic leading-none opacity-60">of ${fee.amount + (fee.lateFees || 0)} total</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-5">
                                        <div className="flex items-center gap-2">
                                            <Calendar size={12} className="text-slate-600" />
                                            <span className="text-[10px] font-bold text-slate-400 uppercase italic opacity-80">{moment(fee.dueDate).format('YYYY-MM-DD')}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-5 text-right">
                                        {fee.status !== 'paid' && (
                                            <button 
                                                onClick={() => handleCollect(fee._id, fee.amount + (fee.lateFees || 0))}
                                                className="p-2 text-slate-500 hover:text-brand-primary transition-all opacity-0 group-hover/row:opacity-100 flex items-center gap-2 ml-auto"
                                            >
                                                <span className="text-[10px] font-black uppercase tracking-widest italic">Sync Payment</span>
                                                <CreditCard size={16} />
                                            </button>
                                        )}
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
            </div>
        </motion.div>
    );
};

export default FeeCollection;
