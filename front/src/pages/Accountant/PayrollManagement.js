import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchPayroll, processPayroll } from '../../redux/slice/accountant.slice';
import { CreditCard, Search, User, Calendar, CheckCircle, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import moment from 'moment';

const PayrollManagement = () => {
    const dispatch = useDispatch();
    const { payroll, loading, success } = useSelector((state) => state.accountant);

    useEffect(() => {
        dispatch(fetchPayroll());
    }, [dispatch, success]);

    const handleProcess = (id) => {
        dispatch(processPayroll({ id, data: { status: 'paid', paymentMethod: 'Bank Transfer' } }));
    };

    return (
        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="space-y-8 pb-10">
            <div>
                <h1 className="text-2xl xs:text-3xl font-black text-slate-100 italic uppercase tracking-tighter leading-none mb-1 text-luxury-rose">Capital Dispatch</h1>
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest italic opacity-70 leading-none">Distributing institutional credits to faculty nodes.</p>
            </div>

            <div className="bg-brand-surface border border-brand-border rounded-md shadow-2xl overflow-hidden group">
                <div className="px-6 py-5 border-b border-brand-border bg-brand-background/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <h2 className="text-lg font-black italic uppercase tracking-tight text-slate-100 leading-none">Payroll Registry</h2>
                    <div className="relative">
                        <Search className="absolute left-3 top-2.5 text-slate-600" size={14} />
                        <input 
                            type="text" 
                            placeholder="Identify Faculty..." 
                            className="bg-brand-background border border-brand-border rounded-md py-2 pl-9 pr-4 text-xs font-bold text-slate-200 focus:outline-none focus:border-brand-primary/50 transition-all w-full sm:w-64 italic"
                        />
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-brand-background/50 border-b border-brand-border">
                                <th className="px-6 py-4 text-[9px] font-black text-slate-500 uppercase tracking-widest italic leading-none">Faculty Node</th>
                                <th className="px-6 py-4 text-[9px] font-black text-slate-500 uppercase tracking-widest italic leading-none">Cycle Status</th>
                                <th className="px-6 py-4 text-[9px] font-black text-slate-500 uppercase tracking-widest italic leading-none">Net Outflow</th>
                                <th className="px-6 py-4 text-[9px] font-black text-slate-500 uppercase tracking-widest italic leading-none">Cycle Period</th>
                                <th className="px-6 py-4 text-[9px] font-black text-slate-500 uppercase tracking-widest italic leading-none text-right">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-brand-border">
                            {payroll.length > 0 ? payroll.map((item, i) => (
                                <tr key={i} className="group/row hover:bg-brand-background/40 transition-all">
                                    <td className="px-6 py-5">
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 rounded-md bg-slate-800 border border-brand-border overflow-hidden p-0.5 group-hover/row:border-luxury-rose/30 transition-all">
                                                <div className="w-full h-full flex items-center justify-center text-slate-500 italic"><User size={18} /></div>
                                            </div>
                                            <div className="flex flex-col">
                                                <span className="font-bold text-sm text-slate-200 tracking-tight group-hover/row:text-luxury-rose transition-colors leading-none mb-1">{item.teacherId?.firstName} {item.teacherId?.lastName}</span>
                                                <span className="text-[10px] font-bold text-slate-500 uppercase italic opacity-60">ID: {item.teacherId?.employeeId || 'Node Missing'}</span>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-5">
                                        <span className={`inline-flex items-center px-2 py-0.5 border text-[9px] font-black uppercase tracking-widest rounded-md italic ${item.status === 'paid' ? 'bg-luxury-emerald/10 border-luxury-emerald/20 text-luxury-emerald' : 'bg-luxury-rose/10 border-luxury-rose/20 text-luxury-rose'}`}>{item.status}</span>
                                    </td>
                                    <td className="px-6 py-5">
                                        <div className="flex flex-col">
                                            <span className="text-sm font-black text-slate-100 tracking-tighter italic uppercase leading-none mb-1">${item.netSalary.toLocaleString()}</span>
                                            <span className="text-[9px] font-bold text-slate-600 uppercase italic leading-none opacity-60">Base: ${item.basicSalary.toLocaleString()}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-5">
                                        <div className="flex items-center gap-2">
                                            <Calendar size={12} className="text-slate-600" />
                                            <span className="text-[10px] font-bold text-slate-400 uppercase italic opacity-80">{moment().month(item.month - 1).format('MMMM')} {item.year}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-5 text-right">
                                        {item.status !== 'paid' && (
                                            <button 
                                                onClick={() => handleProcess(item._id)}
                                                className="p-2 text-slate-500 hover:text-luxury-rose transition-all opacity-0 group-hover/row:opacity-100 flex items-center gap-2 ml-auto"
                                            >
                                                <span className="text-[10px] font-black uppercase tracking-widest italic">Process Credits</span>
                                                <CreditCard size={16} />
                                            </button>
                                        )}
                                        {item.status === 'paid' && <span className="text-luxury-emerald opacity-60 italic text-[10px] font-black uppercase">Processed</span>}
                                    </td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan="5" className="px-6 py-20 text-center text-slate-500 italic opacity-60 font-black uppercase text-xs tracking-widest">No payroll nodes detected in current cycle.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </motion.div>
    );
};

export default PayrollManagement;
