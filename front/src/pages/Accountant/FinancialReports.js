import React, { useEffect, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchFinancialReport } from '../../redux/slice/accountant.slice';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { motion } from 'framer-motion';
import { Download, ShieldCheck, Activity, TrendingUp, Filter, Calendar } from 'lucide-react';
import moment from 'moment';
import { BASE_URL } from '../../utils/BASE_URL';

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

    if (loading || !report) {
        return (
            <div className="h-96 flex items-center justify-center text-slate-500 italic font-black uppercase tracking-widest text-xs opacity-40">
                Loading financial records...
            </div>
        );
    }

    const pieData = [
        { name: 'Income', value: report.income || 0 },
        { name: 'Pending', value: report.pending || 0 },
        { name: 'Expenses', value: report.expenses || 0 },
    ];

    const PIE_COLORS = ['#38bdf8', '#fbbf24', '#f43f5e'];

    const exportReport = () => {
        const token = localStorage.getItem('token');
        const queryParams = new URLSearchParams({
            token: token
        }).toString();
        
        const link = document.createElement('a');
        link.href = `${BASE_URL}/accountant/reports/download?${queryParams}`;
        document.body.appendChild(link);
        link.click();
        link.remove();
    };

    return (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-8 pb-10">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                    <h1 className="text-3xl font-black text-slate-100 italic uppercase tracking-tighter mb-1">Financial Analysis Dashboard</h1>
                    <p className="text-[11px] font-black text-slate-500 uppercase tracking-widest italic opacity-70">Comprehensive overview of school income, expenses, and collection efficiency.</p>
                </div>
                <div className="flex items-center gap-4">
                   
                    <button onClick={exportReport} className="flex items-center gap-2 px-4 py-2 bg-brand-primary/10 border border-brand-primary/30 rounded-md text-[10px] font-black text-brand-primary uppercase tracking-widest italic hover:bg-brand-primary hover:text-slate-900 transition-all shadow-xl">
                        <Download size={14} />
                        Download PDF Report
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
                            <h3 className="text-[10px] font-black uppercase text-slate-500 tracking-widest italic mb-1">Collection Trends</h3>
                            <p className="text-lg font-black italic uppercase tracking-tight text-slate-100 leading-none">Monthly Growth Metrics</p>
                        </div>
                        <Activity className="text-brand-primary/50 animate-pulse" size={20} />
                    </div>
                    <div className="h-80 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={report.trends || []}>
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
                                    tickFormatter={(v) => `₹${v}`} 
                                    tick={{ fill: '#475569', fontWeight: 'bold' }}
                                />
                                <Tooltip 
                                    contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '8px' }}
                                    itemStyle={{ fontSize: '10px', fontWeight: '900', textTransform: 'uppercase', fontStyle: 'italic' }}
                                />
                                <Area type="monotone" dataKey="income" stroke="#38bdf8" fillOpacity={1} fill="url(#colorIncome)" strokeWidth={3} />
                                <Area type="monotone" dataKey="expenses" stroke="#f43f5e" fillOpacity={1} fill="url(#colorExpenses)" strokeWidth={3} />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Health Metrics and Pie Chart */}
                <div className="space-y-8">
                    <div className="bg-brand-surface p-8 rounded-md border border-brand-border shadow-2xl relative">
                        <div className="absolute top-4 right-4 flex items-center gap-1.5 px-2 py-0.5 bg-brand-primary/10 border border-brand-primary/20 rounded-md">
                            <ShieldCheck size={10} className="text-brand-primary" />
                            <span className="text-[9px] font-black text-brand-primary uppercase italic">Audit Verified</span>
                        </div>
                        <h3 className="text-[10px] font-black uppercase text-slate-500 tracking-[.4em] italic mb-6">Financial Accuracy</h3>
                        
                        <div className="h-48 w-full flex items-center justify-center">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie data={pieData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={10} dataKey="value">
                                        {pieData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} stroke="rgba(0,0,0,0)" />
                                        ))}
                                    </Pie>
                                    <Tooltip 
                                        contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '8px' }}
                                        itemStyle={{ fontSize: '10px', fontWeight: '900', textTransform: 'uppercase', fontStyle: 'italic' }}
                                    />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4 mt-6">
                            <div className="p-4 bg-brand-background border border-brand-border rounded-md text-center">
                                <p className="text-[9px] font-black text-slate-500 uppercase italic mb-1">Collection</p>
                                <p className="text-lg font-black text-brand-primary italic leading-none">{report.health?.liquidity || 0}%</p>
                            </div>
                            <div className="p-4 bg-brand-background border border-brand-border rounded-md text-center">
                                <p className="text-[9px] font-black text-slate-500 uppercase italic mb-1">Status</p>
                                <p className="text-lg font-black text-luxury-emerald italic leading-none uppercase">{report.health?.grade || 'A+'}</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-brand-surface border border-brand-border rounded-md overflow-hidden p-6 relative">
                         <div className="flex flex-col gap-6">
                            <div className="flex items-center justify-between">
                                <span className="text-[10px] font-black uppercase text-slate-500 tracking-widest italic">Total Collection</span>
                                <span className="text-lg font-black text-white italic tracking-tighter">₹{(report.income || 0).toLocaleString()}</span>
                            </div>
                            <div className="h-px bg-brand-border/40"></div>
                            <div className="flex items-center justify-between">
                                <span className="text-[10px] font-black uppercase text-slate-500 tracking-widest italic">Pending Dues</span>
                                <span className="text-lg font-black text-luxury-gold italic tracking-tighter">₹{(report.pending || 0).toLocaleString()}</span>
                            </div>
                            <div className="h-px bg-brand-border/40"></div>
                            <div className="flex items-center justify-between">
                                <span className="text-[10px] font-black uppercase text-slate-500 tracking-widest italic">Staff Expenses</span>
                                <span className="text-lg font-black text-luxury-rose italic tracking-tighter">₹{(report.expenses || 0).toLocaleString()}</span>
                            </div>
                         </div>
                    </div>
                </div>
            </div>
        </motion.div>
    );
};

export default FinancialReports;
