import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchFinancialReport } from '../../redux/slice/accountant.slice';
import { DollarSign, UserCheck, TrendingUp, AlertTriangle, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';

const AccountantDashboard = () => {
    const dispatch = useDispatch();
    const { report, loading } = useSelector((state) => state.accountant);

    useEffect(() => {
        dispatch(fetchFinancialReport());
    }, [dispatch]);

    if (loading || !report) {
        return (
            <div className="h-[70vh] flex items-center justify-center">
                <Loader2 className="w-10 h-10 text-brand-primary animate-spin" />
            </div>
        );
    }

    const cards = [
        { label: 'Platform Revenue', value: `$${report.income.toLocaleString()}`, icon: DollarSign, trend: 'Synchronized', color: 'text-luxury-emerald' },
        { label: 'Pending Arrears', value: `$${report.pending.toLocaleString()}`, icon: AlertTriangle, trend: 'Actionable', color: 'text-luxury-rose' },
        { label: 'Capital Outflow', value: `$${report.expenses.toLocaleString()}`, icon: TrendingUp, trend: 'Payroll Logic', color: 'text-brand-primary' },
        { label: 'Institutional Census', value: report.summary.totalStudents, icon: UserCheck, trend: 'Total Nodes', color: 'text-luxury-gold' },
    ];

    return (
        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
            <div>
                <h1 className="text-3xl font-black text-slate-100 italic uppercase tracking-tighter mb-1">Fiscal Matrix</h1>
                <p className="text-[11px] font-black text-slate-500 uppercase tracking-widest italic opacity-70">Real-time platform financial visualization.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {cards.map((card, idx) => (
                    <div key={idx} className="bg-brand-surface p-8 rounded-md border border-brand-border shadow-2xl relative overflow-hidden group hover:border-brand-primary/30 transition-all duration-300">
                        <div className="flex justify-between items-start mb-8">
                            <div className={`p-4 rounded-md bg-slate-800/60 border border-brand-border ${card.color}`}>
                                <card.icon size={24} />
                            </div>
                            <span className="text-[9px] font-black uppercase text-slate-500 tracking-widest italic">{card.trend}</span>
                        </div>
                        <h3 className="text-4xl font-black text-slate-100 tracking-tighter italic uppercase mb-2 font-outfit leading-none">{card.value}</h3>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest italic leading-none">{card.label}</p>
                    </div>
                ))}
            </div>
            
            <div className="p-10 bg-brand-surface border border-brand-border border-dashed rounded-md text-center opacity-60">
                <p className="text-[10px] font-black uppercase tracking-widest italic text-slate-500">Advanced analysis modules initializing in Q3 synchronization...</p>
            </div>
        </motion.div>
    );
};

export default AccountantDashboard;
