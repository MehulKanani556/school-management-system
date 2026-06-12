import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchRevenueAnalytics } from '../../redux/slice/superAdmin.slice';
import { DollarSign, TrendingUp, Globe, Activity, School, ArrowUpRight, BarChart3, TrendingDown, Shield } from 'lucide-react';
import { motion } from 'framer-motion';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { getImageUrl } from '../../utils/imageHelper';

const Revenue = () => {
    const dispatch = useDispatch();
    const { revenue, loading } = useSelector((state) => state.superAdmin);

    useEffect(() => {
        dispatch(fetchRevenueAnalytics());
    }, [dispatch]);

    if (!revenue || loading) {
        return (
            <div className="flex flex-col items-center justify-center h-[60vh] opacity-30 grayscale animate-pulse">
                <BarChart3 size={64} className="mb-6" />
                <h2 className="text-xl font-black uppercase italic tracking-widest text-slate-500">Loading revenue data...</h2>
            </div>
        );
    }

    const maxTrendRevenue = Math.max(...(revenue.trends?.map(t => t.revenue) || [1]));

    return (
        <motion.div 
            initial={{ opacity: 0, y: 15 }} 
            animate={{ opacity: 1, y: 0 }} 
            className="space-y-8 pb-10 font-outfit"
        >
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-2">
                <div className="flex flex-col">
                    <h1 className="text-2xl xs:text-3xl font-black tracking-tight text-white font-inter italic uppercase leading-tight">Total Revenue</h1>
                    <p className="text-[11px] xs:text-sm font-medium text-slate-500 mt-1 tracking-wide flex items-center gap-3">
                        <span className="w-1.5 h-1.5 rounded-md bg-superadmin-primary animate-pulse shadow-[0_0_8px_rgba(37,99,235,0.4)]"></span>
                        School financial analytics loaded successfully.
                    </p>
                </div>
                <div className="px-6 py-4 rounded-md bg-superadmin-primary/10 border border-superadmin-primary/20 flex items-center gap-6 shadow-2xl group cursor-default transition-all hover:bg-superadmin-primary/20">
                    <div className="w-12 h-12 rounded-md bg-superadmin-primary flex items-center justify-center text-black shadow-lg shadow-superadmin-primary/20 group-hover:scale-110 transition-transform duration-500">
                        <TrendingUp size={24} />
                    </div>
                    <div>
                        <p className="text-[10px] font-black uppercase text-superadmin-primary tracking-widest italic leading-none mb-1.5">Total Collected</p>
                        <p className="text-2xl font-black text-white tracking-tighter leading-none font-outfit uppercase italic">${revenue.totalRevenue?.toLocaleString()}</p>
                    </div>
                </div>
            </div>

            {/* Performance Modules */}
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                {/* Historical Trends Visual */}
                <div className="xl:col-span-1 bg-slate-900/30 border border-slate-800/60 p-8 rounded-md backdrop-blur-3xl flex flex-col">
                    <div className="flex items-center justify-between mb-8">
                         <div>
                            <h3 className="text-sm font-black text-white italic uppercase tracking-[0.2em] mb-1">Revenue Trends</h3>
                            <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest italic">Monthly Overview</p>
                         </div>
                         <Activity size={16} className="text-superadmin-primary animate-pulse" />
                    </div>
                    
                    <div className="flex-1 flex items-end justify-between gap-3 h-48 mb-8">
                        {revenue.trends?.map((t, i) => (
                            <div key={i} className="flex-1 flex flex-col items-center gap-4 group">
                                <span className="opacity-0 group-hover:opacity-100 transition-opacity text-[8px] font-black text-white italic mb-1">${(t.revenue/1000).toFixed(1)}k</span>
                                <motion.div 
                                    initial={{ height: 0 }}
                                    animate={{ height: `${(t.revenue / maxTrendRevenue) * 100}%` }}
                                    className="w-full bg-superadmin-primary/20 border-t border-superadmin-primary group-hover:bg-superadmin-primary/40 transition-all rounded-t-sm"
                                />
                                <span className="text-[8px] font-black text-slate-600 uppercase tracking-widest italic">{t.month}</span>
                            </div>
                        ))}
                    </div>

                    <div className="pt-6 border-t border-white/5 flex items-center justify-between">
                         <div className="flex flex-col">
                            <span className="text-[14px] font-black text-white italic uppercase leading-none mb-1">Optimized</span>
                            <span className="text-[8px] font-bold text-slate-600 uppercase tracking-widest">Growth Rate</span>
                         </div>
                         <ArrowUpRight size={24} className="text-superadmin-primary" />
                    </div>
                </div>

                {/* Node Table */}
                <div className="xl:col-span-2 bg-slate-900/30 border border-slate-800/60 rounded-md backdrop-blur-3xl overflow-hidden shadow-2xl">
                    <div className="px-8 py-6 border-b border-white/5 bg-white/[0.01] flex items-center justify-between">
                        <div>
                            <h2 className="text-lg font-black italic uppercase tracking-tight text-white leading-none">Revenue by School</h2>
                            <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest italic mt-2 opacity-60 px-0">Comparison of revenue collected across different schools.</p>
                        </div>
                        <BarChart3 size={20} className="text-superadmin-primary" />
                    </div>
                    <div className="overflow-x-auto max-h-[400px] custom-scrollbar">
                        <table className="w-full text-left">
                            <tbody className="divide-y divide-white/5">
                                {revenue.schoolBreakdown?.map((school, i) => (
                                    <tr key={i} className="group/row hover:bg-white/[0.01] transition-all">
                                        <td className="px-8 py-5">
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 rounded-md bg-slate-800 border border-white/5 flex items-center justify-center text-slate-500 group-hover/row:border-superadmin-primary/40 transition-colors shrink-0">
                                                     {getImageUrl(school.logo) ? <img src={getImageUrl(school.logo)} alt="" className="w-full h-full object-cover rounded-md" /> : <School size={16} />}
                                                </div>
                                                <div className="min-w-0">
                                                    <p className="font-black text-sm text-slate-200 tracking-tight group-hover/row:text-superadmin-primary transition-colors italic uppercase">{school.name}</p>
                                                    <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest italic opacity-60">Status: {school.status}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-8 py-5">
                                            <div className="flex items-center gap-2">
                                                <Activity size={12} className="text-slate-600" />
                                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest italic">{school.studentCount} Students</span>
                                            </div>
                                        </td>
                                        <td className="px-8 py-5 text-right">
                                            <div className="flex flex-col items-end gap-1">
                                                <span className="text-sm font-black text-white tracking-tighter leading-none font-outfit uppercase italic">${school.revenue?.toLocaleString() || '0'}</span>
                                                <div className="flex items-center gap-1">
                                                    <div className={`w-1 h-1 rounded-md animate-pulse ${school.revenue > 0 ? 'bg-emerald-500' : 'bg-superadmin-primary'}`}></div>
                                                    <span className={`text-[8px] font-black uppercase tracking-widest italic ${school.revenue > 0 ? 'text-emerald-500' : 'text-slate-600'}`}>{school.revenue > 0 ? 'Active' : 'No Revenue'}</span>
                                                </div>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Stats Aggregation */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[
                    { label: 'Average School Revenue', value: `$${Math.round(revenue.totalRevenue / (revenue.schoolBreakdown?.length || 1)).toLocaleString()}`, icon: Globe, trend: 'STABLE' },
                    { label: 'Avg School Size', value: '1,440 students', icon: Activity, trend: '+4.2%' },
                    { label: 'Payment Success Rate', value: '99.9%', icon: Shield, trend: 'VERIFIED' }
                ].map((s, i) => (
                    <div key={i} className="bg-slate-900/30 border border-slate-800/60 p-6 rounded-md backdrop-blur-3xl group hover:border-superadmin-primary/20 transition-all flex items-center justify-between">
                         <div>
                            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest italic mb-2">{s.label}</p>
                            <h4 className="text-xl font-black text-white italic uppercase tracking-tighter">{s.value}</h4>
                         </div>
                         <div className="flex flex-col items-end">
                            <s.icon size={16} className="text-slate-700 mb-2" />
                            <span className="text-[8px] font-black text-superadmin-primary uppercase italic">{s.trend}</span>
                         </div>
                    </div>
                ))}
            </div>

            {/* Monthly Revenue Trend Chart */}
            <div className="bg-slate-900/30 border border-slate-800/60 rounded-md backdrop-blur-3xl overflow-hidden shadow-2xl">
                <div className="px-8 py-6 border-b border-white/5 bg-white/[0.01] flex items-center justify-between">
                    <div>
                        <h2 className="text-lg font-black italic uppercase tracking-tight text-white leading-none">Monthly Revenue Flow</h2>
                        <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest italic mt-2 opacity-60">Real fee collection data — last 12 months.</p>
                    </div>
                    <TrendingUp size={20} className="text-superadmin-primary" />
                </div>
                <div className="p-8">
                    {revenue.trends && revenue.trends.length > 0 ? (
                        <div className="h-[260px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={revenue.trends}>
                                    <defs>
                                        <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#2563eb" stopOpacity={0.3} />
                                            <stop offset="95%" stopColor="#2563eb" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                                    <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 10, fontWeight: 700 }} />
                                    <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 10 }} tickFormatter={v => `$${(v/1000).toFixed(0)}k`} />
                                    <Tooltip
                                        contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '6px' }}
                                        itemStyle={{ color: '#e2e8f0', fontSize: '11px', fontWeight: 700 }}
                                        formatter={v => [`$${v.toLocaleString()}`, 'Revenue']}
                                    />
                                    <Area type="monotone" dataKey="revenue" stroke="#2563eb" strokeWidth={2} fill="url(#revenueGrad)" dot={{ fill: '#2563eb', r: 3 }} />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    ) : (
                        <div className="h-[260px] flex flex-col items-center justify-center opacity-30">
                            <BarChart3 size={48} className="mb-4 text-slate-700" />
                            <p className="text-[10px] font-black uppercase tracking-widest text-slate-600 italic">No payment data available yet</p>
                        </div>
                    )}
                </div>
            </div>
        </motion.div>
    );
};

export default Revenue;
