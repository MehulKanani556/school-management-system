import React, { useEffect, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchPerformanceAnalytics } from '../../redux/slice/teacher.slice';
import { 
    BarChart, 
    Bar, 
    XAxis, 
    YAxis, 
    CartesianGrid, 
    Tooltip, 
    ResponsiveContainer, 
    Cell,
    Radar,
    RadarChart,
    PolarGrid,
    PolarAngleAxis,
    PolarRadiusAxis
} from 'recharts';
import { motion } from 'framer-motion';
import { TrendingUp, Award, Target, Activity, Users, BookOpen } from 'lucide-react';

const PerformanceAnalytics = () => {
    const dispatch = useDispatch();
    const { analytics, loading } = useSelector(state => state.teacher);

    useEffect(() => {
        dispatch(fetchPerformanceAnalytics());
    }, [dispatch]);

    const chartData = useMemo(() => {
        if (!analytics || !analytics.length) return [];
        return analytics.map(a => ({
            name: a.subject,
            avg: Number(a.averageScore.toFixed(1)),
            max: a.maxScore,
            min: a.minScore,
            total: a.studentCount
        }));
    }, [analytics]);

    const stats = useMemo(() => {
        if (!analytics || !analytics.length) return { top: 'N/A', lowest: 'N/A', overallAvg: 0 };
        const sorted = [...analytics].sort((a,b) => b.averageScore - a.averageScore);
        const overall = analytics.reduce((acc, curr) => acc + curr.averageScore, 0) / analytics.length;
        return {
            top: sorted[0].subject,
            lowest: sorted[sorted.length-1].subject,
            overallAvg: overall.toFixed(1)
        };
    }, [analytics]);

    if (loading) return (
        <div className="h-[60vh] flex flex-col items-center justify-center gap-6">
            <Activity className="w-12 h-12 text-brand-primary animate-spin opacity-50" />
            <p className="text-slate-500 font-black uppercase tracking-[0.4em] text-xs animate-pulse">Computing Sector Analytics</p>
        </div>
    );

    return (
        <div className="space-y-10 p-2">
            <header className="space-y-4">
                <div className="flex items-center gap-3">
                    <div className="h-[2px] w-12 bg-brand-primary rounded-md"></div>
                    <span className="text-[10px] font-black text-brand-primary uppercase tracking-[0.5em] italic">Academic Intelligence</span>
                </div>
                <h1 className="text-4xl text-left font-black text-white uppercase italic tracking-tighter leading-none font-outfit">Performance Insights</h1>
                <p className="text-slate-500 font-bold text-xs uppercase tracking-widest italic">Subject-wise scoring diagnostics across assigned sectors.</p>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[
                    { label: 'Top Performance', value: stats.top, icon: Award, color: 'text-luxury-emerald' },
                    { label: 'Overall Average', value: `${stats.overallAvg}%`, icon: TrendingUp, color: 'text-brand-primary' },
                    { label: 'Intervention Required', value: stats.lowest, icon: Target, color: 'text-luxury-rose' }
                ].map((s, idx) => (
                    <motion.div 
                        key={idx}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.1 }}
                        className="bg-slate-900/40 border border-slate-800/60 p-8 rounded-md backdrop-blur-3xl shadow-2xl relative overflow-hidden group"
                    >
                        <s.icon className={`w-8 h-8 ${s.color} mb-6 opacity-50 group-hover:opacity-100 transition-all`} />
                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 italic">{s.label}</p>
                        <p className="text-2xl font-black text-white uppercase italic tracking-tighter">{s.value}</p>
                    </motion.div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="bg-slate-900/40 border border-slate-800/60 p-10 rounded-md shadow-2xl backdrop-blur-3xl">
                    <h3 className="text-sm font-black text-white uppercase tracking-widest mb-10 italic flex items-center gap-3">
                        <Activity size={18} className="text-brand-primary" /> Sector Scoring Variance
                    </h3>
                    <div className="h-[400px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={chartData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                                <XAxis dataKey="name" stroke="#64748b" fontSize={10} fontWeight={900} tickLine={false} axisLine={false} />
                                <YAxis stroke="#64748b" fontSize={10} fontWeight={900} tickLine={false} axisLine={false} />
                                <Tooltip 
                                    contentStyle={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: '8px' }}
                                    itemStyle={{ color: '#fff', fontSize: '10px', fontWeight: '900', textTransform: 'uppercase' }}
                                />
                                <Bar dataKey="avg" radius={[4, 4, 0, 0]} barSize={40}>
                                    {chartData.map((entry, index) => (
                                        <Cell key={index} fill={entry.avg > 75 ? '#10b981' : entry.avg > 40 ? '#3b82f6' : '#f43f5e'} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="bg-slate-900/40 border border-slate-800/60 p-10 rounded-md shadow-2xl backdrop-blur-3xl">
                    <h3 className="text-sm font-black text-white uppercase tracking-widest mb-10 italic flex items-center gap-3">
                        <Users size={18} className="text-brand-primary" /> Cluster Density Analytics
                    </h3>
                    <div className="h-[400px] w-full flex items-center justify-center">
                        <ResponsiveContainer width="100%" height="100%">
                            <RadarChart cx="50%" cy="50%" outerRadius="80%" data={chartData}>
                                <PolarGrid stroke="#1e293b" />
                                <PolarAngleAxis dataKey="name" tick={{ fill: '#64748b', fontSize: 10, fontWeight: 900 }} />
                                <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fill: '#64748b', fontSize: 8 }} />
                                <Radar 
                                    name="Score" 
                                    dataKey="avg" 
                                    stroke="#3b82f6" 
                                    fill="#3b82f6" 
                                    fillOpacity={0.4} 
                                />
                                <Tooltip 
                                    contentStyle={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: '8px' }}
                                />
                            </RadarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            <div className="bg-slate-900/40 border border-slate-800/60 rounded-md shadow-2xl overflow-hidden backdrop-blur-3xl">
                <table className="w-full text-left">
                    <thead>
                        <tr className="bg-slate-950/60 border-b border-white/5">
                            <th className="px-10 py-8 text-[10px] font-black text-slate-500 uppercase tracking-widest italic">Subject Protocol</th>
                            <th className="px-10 py-8 text-[10px] font-black text-slate-500 uppercase tracking-widest italic text-center">Avg Velocity</th>
                            <th className="px-10 py-8 text-[10px] font-black text-slate-500 uppercase tracking-widest italic text-center">Peak Value</th>
                            <th className="px-10 py-8 text-[10px] font-black text-slate-500 uppercase tracking-widest italic text-center">Min Threshold</th>
                            <th className="px-10 py-8 text-[10px] font-black text-slate-500 uppercase tracking-widest italic text-center">Cohort Size</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                        {chartData.map((row, idx) => (
                            <tr key={idx} className="hover:bg-white/[0.02] transition-colors group">
                                <td className="px-10 py-6">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-md bg-slate-800 border border-white/5 flex items-center justify-center text-brand-primary group-hover:scale-110 transition-transform shadow-xl">
                                            <BookOpen size={16} />
                                        </div>
                                        <span className="text-sm font-black text-white uppercase italic tracking-tight">{row.name}</span>
                                    </div>
                                </td>
                                <td className="px-10 py-6 text-center">
                                    <span className={`text-xs font-black uppercase tracking-widest ${row.avg > 75 ? 'text-luxury-emerald' : row.avg > 40 ? 'text-brand-primary' : 'text-luxury-rose'}`}>
                                        {row.avg}%
                                    </span>
                                </td>
                                <td className="px-10 py-6 text-center text-xs font-bold text-slate-400 font-outfit tracking-tighter italic">{row.max}</td>
                                <td className="px-10 py-6 text-center text-xs font-bold text-slate-400 font-outfit tracking-tighter italic">{row.min}</td>
                                <td className="px-10 py-6 text-center text-[10px] font-black text-slate-600 uppercase tracking-widest">{row.total} Nodes</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default PerformanceAnalytics;
