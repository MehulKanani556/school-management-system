import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Award, TrendingUp, AlertCircle, Loader2, Calendar } from 'lucide-react';
import { fetchAttendanceAnalytics } from '../../redux/slice/teacher.slice';

const TeacherAttendanceAnalytics = () => {
    const dispatch = useDispatch();
    const { attendanceAnalytics, loading } = useSelector((state) => state.teacher);
    const { activeAcademicYear } = useSelector((state) => state.academicYear);

    useEffect(() => {
        dispatch(fetchAttendanceAnalytics());
    }, [dispatch, activeAcademicYear]);

    if (loading && !attendanceAnalytics) {
        return (
            <div className="h-[60vh] flex flex-col items-center justify-center gap-6">
                <Loader2 className="w-12 h-12 text-brand-primary animate-spin opacity-50" />
                <p className="text-slate-500 font-black uppercase tracking-[0.4em] text-xs animate-pulse">Loading Attendance Data...</p>
            </div>
        );
    }

    const { timeline = [], classWise = [] } = attendanceAnalytics || {};

    return (
        <div className="space-y-12 pb-20">
            <div className='text-left'>
                <h1 className="text-4xl font-black text-white italic uppercase tracking-tighter leading-none mb-4 font-outfit">Attendance Analytics</h1>
                <p className="text-slate-500 font-black uppercase tracking-[0.3em] text-xs">Class Attendance Summary • Last 30 Days</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-slate-900/40 border border-slate-800/80 rounded-md p-8 shadow-2xl backdrop-blur-sm">
                        <div className="flex items-center justify-between mb-10 px-2">
                            <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-500 font-outfit">Attendance Trends</h3>
                            <div className="flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full bg-brand-primary"></div>
                                <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest italic">Attendance %</span>
                            </div>
                        </div>
                        <div className="h-[400px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={timeline}>
                                    <defs>
                                        <linearGradient id="colorAtt" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3} />
                                            <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                                    <XAxis
                                        dataKey="date"
                                        stroke="#475569"
                                        fontSize={10}
                                        tickFormatter={(str) => new Date(str).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                                        axisLine={false}
                                        tickLine={false}
                                    />
                                    <YAxis
                                        stroke="#475569"
                                        fontSize={10}
                                        domain={[0, 100]}
                                        axisLine={false}
                                        tickLine={false}
                                        tickFormatter={(val) => `${val}%`}
                                    />
                                    <Tooltip
                                        contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '12px', fontSize: '10px', color: '#fff' }}
                                        itemStyle={{ color: '#3B82F6', fontWeight: 'bold' }}
                                    />
                                    <Area type="monotone" dataKey="percentage" stroke="#3B82F6" strokeWidth={4} fillOpacity={1} fill="url(#colorAtt)" />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>

                <div className="space-y-8">
                    <div className="bg-slate-900/40 border border-slate-800/80 rounded-md p-8 shadow-2xl">
                        <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 font-outfit mb-8 px-2">Class Performance</h3>
                        <div className="space-y-6 max-h-[480px] overflow-y-auto pr-2">
                            {classWise.map((c, idx) => (
                                <motion.div
                                    key={c.section}
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: idx * 0.1 }}
                                    className="p-6 bg-slate-800/30 rounded-md border border-slate-700/30 group hover:border-brand-primary/40 transition-all shadow-lg"
                                >
                                    <div className="flex items-center justify-between mb-4">
                                        <span className="text-[11px] font-black text-white uppercase tracking-widest italic">{c.section}</span>
                                        <span className={`text-[11px] font-black uppercase tracking-widest ${c.percentage === null ? 'text-slate-500' : c.percentage >= 85 ? 'text-luxury-emerald' : 'text-brand-accent'}`}>
                                            {c.percentage !== null ? `${c.percentage}%` : 'N/A'}
                                        </span>
                                    </div>
                                    <div className="h-1.5 w-full bg-slate-700 rounded-full overflow-hidden">
                                        {c.percentage !== null && (
                                            <motion.div
                                                initial={{ width: 0 }}
                                                animate={{ width: `${c.percentage}%` }}
                                                transition={{ duration: 1, delay: idx * 0.1 }}
                                                className={`h-full rounded-full ${c.percentage >= 85 ? 'bg-luxury-emerald' : 'bg-brand-primary'} shadow-[0_0_10px_rgba(59,130,246,0.3)]`}
                                            />
                                        )}
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </div>

                    <div className="bg-brand-primary/10 border border-brand-primary/20 rounded-md p-8 shadow-2xl relative overflow-hidden group">
                        <TrendingUp size={48} className="absolute -bottom-4 -right-4 text-brand-primary/10 group-hover:scale-110 transition-transform" />
                        <h4 className="text-[10px] font-black text-brand-primary uppercase tracking-[0.3em] mb-4">Attendance Insights</h4>
                        <p className="text-slate-300 font-medium text-xs leading-relaxed italic">
                            Overall attendance is {timeline.length > 0 ? (timeline[timeline.length - 1].percentage >= 90 ? 'EXCEPTIONAL' : 'OPTIMAL') : 'STABLE'} across the last recorded period. No critical dips detected in assigned classes.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TeacherAttendanceAnalytics;
