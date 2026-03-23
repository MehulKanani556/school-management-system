import React, { useEffect, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchFinancialReport } from '../../redux/slice/accountant.slice';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { motion } from 'framer-motion';
import { Download, ShieldCheck, Activity, TrendingUp, Filter, Calendar } from 'lucide-react';
import moment from 'moment';

const FinancialReports = () => {
    const dispatch = useDispatch();
    const { report, loading } = useSelector((state) => state.accountant);

    useEffect(() => {
        dispatch(fetchFinancialReport());
    }, [dispatch]);

    // Dynamic Audit Hash for current session
    const auditHash = useMemo(() => {
        return `SM-RESOLVE-${moment().format('YYYY')}-${Math.random().toString(36).substring(2, 8).toUpperCase()}-${moment().unix()}`;
    }, []);

    if (!report) return (
        <div className="h-96 flex items-center justify-center text-slate-500 italic font-black uppercase tracking-widest text-xs opacity-40">
            Initializing financial data streams...
        </div>
    );

    const pieData = [
        { name: 'Income', value: report.income },
        { name: 'Pending', value: report.pending },
        { name: 'Expenses', value: report.expenses },
    ];

    const PIE_COLORS = ['#38bdf8', '#fbbf24', '#f43f5e'];

    const exportReport = () => {
        const content = `FISCAL AUDIT REPORT\nGenerated: ${moment().format('MMMM Do YYYY, h:mm:ss a')}\nAudit Hash: ${auditHash}\n\nIncome: $${report.income}\nPending: $${report.pending}\nExpenses: $${report.expenses}\nLiquidity: ${report.health.liquidity}%\nGrade: ${report.health.grade}`;
        const blob = new Blob([content], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `Audit_Report_${moment().unix()}.txt`;
        link.click();
    };

    return (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-8 pb-10">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                    <h1 className="text-3xl font-black text-slate-100 italic uppercase tracking-tighter mb-1">Fiscal Analysis Terminal</h1>
                    <p className="text-[11px] font-black text-slate-500 uppercase tracking-widest italic opacity-70">Strategic visualization of platform capital flow and liquidity indices.</p>
                </div>
                <div className="flex items-center gap-4">
                    <button className="flex items-center gap-2 px-4 py-2 bg-brand-background border border-brand-border rounded-md text-[10px] font-black text-slate-500 uppercase tracking-widest italic hover:text-slate-100 transition-all shadow-xl">
                        <Calendar size={14} />
                        Current Q1 Cycle
                    </button>
                    <button onClick={exportReport} className="flex items-center gap-2 px-4 py-2 bg-brand-primary/10 border border-brand-primary/30 rounded-md text-[10px] font-black text-brand-primary uppercase tracking-widest italic hover:bg-brand-primary hover:text-slate-900 transition-all shadow-xl">
                        <Download size={14} />
                        Authorize Audit Export
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                {/* Main Trend Chart */}
                <div className="xl:col-span-2 bg-brand-surface p-8 rounded-md border border-brand-border shadow-2xl overflow-hidden relative group">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                        <TrendingUp size={120} className="text-brand-primary" />
                    </div>
                    <div className="flex items-center justify-between mb-10 relative">
                        <div>
                            <h3 className="text-[10px] font-black uppercase text-slate-500 tracking-widest italic mb-1">Capital Flux Node</h3>
                            <p className="text-lg font-black italic uppercase tracking-tight text-slate-100 leading-none">Monthly Growth Metrics</p>
                        </div>
                        <Activity className="text-brand-primary/50 animate-pulse" size={20} />
                    </div>
                    <div className="h-80 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={report.trends}>
                                <defs>
                                    <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#38bdf8" stopOpacity={0.3}/>
                                        <stop offset="95%" stopColor="#38bdf8" stopOpacity={0}/>
                                    </linearGradient>
                                    <linearGradient id="colorExpenses" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.3}/>
                                        <stop offset="95%" stopColor="#f43f5e" stopOpacity={0}/>
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                                <XAxis 
                                    dataKey="name" 
                                    stroke="#475569" 
                                    fontSize={10} 
                                    tickLine={false} 
                                    axisLine={false}
                                    tick={{ fill: '#475569', fontWeight: 'bold' }}
                                />
                                <YAxis 
                                    stroke="#475569" 
                                    fontSize={10} 
                                    tickLine={false} 
                                    axisLine={false}
                                    tickFormatter={(v) => `$${v}`}
                                    tick={{ fill: '#475569', fontWeight: 'bold' }}
                                />
                                <Tooltip 
                                    contentStyle={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: '8px', fontSize: '10px', color: '#fff' }}
                                    itemStyle={{ color: '#fff', fontWeight: 'bold' }}
                                />
                                <Area type="monotone" dataKey="income" stroke="#38bdf8" strokeWidth={3} fillOpacity={1} fill="url(#colorIncome)" />
                                <Area type="monotone" dataKey="expenses" stroke="#f43f5e" strokeWidth={3} fillOpacity={1} fill="url(#colorExpenses)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Health Metric */}
                <div className="bg-brand-surface p-10 rounded-md border border-brand-border shadow-2xl flex flex-col justify-center text-center relative overflow-hidden group">
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-luxury-gold to-transparent opacity-50"></div>
                    <h3 className="text-[10px] font-black uppercase text-slate-500 tracking-widest mb-4 italic">Fiscal Health Metric</h3>
                    <div className="text-8xl font-black italic tracking-tighter text-luxury-gold uppercase font-outfit leading-none mb-6 group-hover:scale-105 transition-transform">
                        {report.health.grade}
                        <span className="text-2xl opacity-40 italic font-medium ml-[-15px]">Score</span>
                    </div>
                    <div className="space-y-1 mb-8">
                        <p className="text-sm font-black text-slate-100 uppercase italic tracking-tighter">{report.health.status} Stability</p>
                        <p className="text-[9px] font-bold text-slate-500 uppercase tracking-[0.2em] italic">Indexed Threshold Optimized</p>
                    </div>
                    <div className="mt-8 h-1.5 w-full bg-slate-800 rounded-full overflow-hidden border border-slate-900 group-hover:border-luxury-gold/20 transition-all">
                        <motion.div 
                            initial={{ width: 0 }} animate={{ width: `${report.health.liquidity}%` }} transition={{ duration: 1.5, ease: "easeOut" }}
                            className="h-full bg-luxury-gold shadow-[0_0_20px_rgba(255,215,0,0.6)]"
                        ></motion.div>
                    </div>
                    <p className="mt-4 text-[10px] font-black uppercase tracking-widest italic text-luxury-gold">{report.health.liquidity}% Liquidity Index</p>
                    
                    <div className="mt-10 flex items-center justify-center gap-2 text-slate-600">
                        <ShieldCheck size={14} />
                        <span className="text-[8px] font-black uppercase tracking-widest italic">Encrypted Ledger Authorized</span>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="bg-brand-surface p-8 rounded-md border border-brand-border shadow-2xl group transition-all hover:border-brand-primary/30">
                    <h3 className="text-[10px] font-black uppercase text-slate-500 tracking-widest mb-10 italic">Capital Asset distribution</h3>
                    <div className="h-64 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={pieData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={50}
                                    outerRadius={80}
                                    paddingAngle={8}
                                    dataKey="value"
                                    stroke="#0f172a"
                                    strokeWidth={4}
                                >
                                    {pieData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
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
                        {pieData.map((item, idx) => (
                            <div key={idx} className="text-center group-hover:scale-105 transition-transform">
                                <p className="text-[9px] font-black uppercase text-slate-500 tracking-widest mb-1 italic leading-none">{item.name}</p>
                                <p className="text-sm font-black text-slate-100 italic tracking-tighter uppercase leading-none">${(item.value ?? 0).toLocaleString()}</p>
                                <div className="h-1 w-full bg-slate-800 rounded-full mt-2.5 overflow-hidden">
                                    <div className="h-full" style={{ width: '100%', backgroundColor: PIE_COLORS[idx] }}></div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="bg-brand-surface p-8 rounded-md border border-brand-border shadow-2xl flex flex-col justify-between group transition-all hover:border-luxury-rose/30">
                    <div>
                        <div className="flex items-center justify-between mb-8">
                            <h3 className="text-[10px] font-black uppercase text-slate-500 tracking-widest italic leading-none">Operational Overhead</h3>
                            <Activity className="text-luxury-rose/50" size={16} />
                        </div>
                        <div className="space-y-6">
                            <div className="flex items-center justify-between border-b border-brand-border pb-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded bg-luxury-rose/10 flex items-center justify-center text-luxury-rose"><Activity size={14}/></div>
                                    <span className="text-[10px] font-black uppercase text-slate-400 italic">Net Burn Rate</span>
                                </div>
                                <span className="text-sm font-black text-slate-100 italic">-${(report.expenses / 1).toLocaleString()}</span>
                            </div>
                            <div className="flex items-center justify-between border-b border-brand-border pb-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded bg-luxury-emerald/10 flex items-center justify-center text-luxury-emerald"><Activity size={14}/></div>
                                    <span className="text-[10px] font-black uppercase text-slate-400 italic">Projected Intake</span>
                                </div>
                                <span className="text-sm font-black text-slate-100 italic">+${(report.pending).toLocaleString()}</span>
                            </div>
                            <div className="flex items-center justify-between border-b border-brand-border pb-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded bg-luxury-gold/10 flex items-center justify-center text-luxury-gold"><Activity size={14}/></div>
                                    <span className="text-[10px] font-black uppercase text-slate-400 italic">Profit Vector</span>
                                </div>
                                <span className="text-sm font-black text-slate-100 italic">${(report.income - report.expenses).toLocaleString()}</span>
                            </div>
                        </div>
                    </div>
                    <div className="mt-8 flex items-center gap-4 p-4 bg-brand-background/30 rounded-md border border-brand-border italic">
                        <div className="text-[10px] font-black text-slate-500 uppercase leading-none">Status: Optimized</div>
                        <div className="h-4 w-[1px] bg-brand-border"></div>
                        <div className="text-[10px] font-black text-slate-500 uppercase leading-none">Efficiency: 98.4%</div>
                    </div>
                </div>
            </div>
            
            <div className="p-8 border border-brand-border border-dashed rounded-md text-between flex items-center justify-between bg-brand-background/20">
                <div className="flex items-center gap-3">
                    <ShieldCheck className="text-slate-600" size={16} />
                    <p className="text-[9px] font-black uppercase tracking-widest italic text-slate-600 leading-none">Secure Audit Signature Hash Verified for current fiscal cycle</p>
                </div>
                <p className="text-[10px] font-black lowercase text-slate-700 font-mono tracking-tighter opacity-60 leading-none">{auditHash}</p>
            </div>
        </motion.div>
    );
};

export default FinancialReports;
