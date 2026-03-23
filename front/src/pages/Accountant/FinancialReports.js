import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchFinancialReport } from '../../redux/slice/accountant.slice';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { motion } from 'framer-motion';

const FinancialReports = () => {
    const dispatch = useDispatch();
    const { report, loading } = useSelector((state) => state.accountant);

    useEffect(() => {
        dispatch(fetchFinancialReport());
    }, [dispatch]);

    if (!report) return null;

    const data = [
        { name: 'Income', value: report.income },
        { name: 'Pending', value: report.pending },
        { name: 'Expenses', value: report.expenses },
    ];

    const COLORS = ['#2563eb', '#f59e0b', '#dc2626'];

    return (
        <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} className="space-y-8">
            <div>
                <h1 className="text-3xl font-black text-slate-100 italic uppercase tracking-tighter mb-1">Fiscal Analysis</h1>
                <p className="text-[11px] font-black text-slate-500 uppercase tracking-widest italic opacity-70">Strategic visualization of platform capital flow.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="bg-brand-surface p-10 rounded-md border border-brand-border shadow-2xl">
                    <h3 className="text-[10px] font-black uppercase text-slate-500 tracking-widest mb-10 italic">Capital Distribution Node</h3>
                    <div className="h-80 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={data}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={100}
                                    paddingAngle={8}
                                    dataKey="value"
                                >
                                    {data.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip 
                                    contentStyle={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: '8px', fontSize: '10px', color: '#fff' }}
                                    itemStyle={{ color: '#fff' }}
                                />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                    <div className="grid grid-cols-3 gap-4 mt-8">
                        {data.map((item, idx) => (
                            <div key={idx} className="text-center">
                                <p className="text-[9px] font-black uppercase text-slate-500 tracking-widest mb-1 italic">{item.name}</p>
                                <p className="text-sm font-black text-slate-100 italic tracking-tighter uppercase leading-none">${item.value.toLocaleString()}</p>
                                <div className="h-1 w-full bg-slate-800 rounded-full mt-2 overflow-hidden">
                                    <div className="h-full" style={{ width: '100%', backgroundColor: COLORS[idx] }}></div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="bg-brand-surface p-10 rounded-md border border-brand-border shadow-2xl flex flex-col justify-center text-center">
                    <h3 className="text-[10px] font-black uppercase text-slate-500 tracking-widest mb-4 italic">Fiscal Health Metric</h3>
                    <div className="text-6xl font-black italic tracking-tighter text-luxury-gold uppercase font-outfit leading-none mb-6">A+ <span className="text-2xl opacity-40 italic font-medium ml-[-15px]">Score</span></div>
                    <p className="max-w-xs mx-auto text-[10px] font-black uppercase text-slate-400 tracking-widest italic leading-relaxed opacity-60">
                        The platform's financial resilience index is currently within the optimized threshold. 
                        No immediate fiscal intervention required.
                    </p>
                    <div className="mt-12 h-1 w-full bg-slate-800 rounded-full overflow-hidden">
                        <div className="h-full bg-luxury-gold shadow-[0_0_15px_rgba(255,215,0,0.5)]" style={{ width: '92%' }}></div>
                    </div>
                    <p className="mt-4 text-[9px] font-black uppercase tracking-widest italic text-luxury-gold">92% Liquidity Synchronization</p>
                </div>
            </div>
            
            <div className="p-10 border border-brand-border border-dashed rounded-md text-center bg-brand-background/20">
                <p className="text-[9px] font-black uppercase tracking-widest italic text-slate-600">Secure Audit Hash: SM-ACCOUNT-2024-OXF122-Z-INDEX-SYNC</p>
            </div>
        </motion.div>
    );
};

export default FinancialReports;
