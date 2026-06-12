import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchPlatformAnalytics } from '../../redux/slice/superAdmin.slice';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
    Users, 
    School as SchoolIcon, 
    DollarSign, 
    TrendingUp, 
    Layers, 
    Database,
    ArrowUpRight,
    Loader2
} from 'lucide-react';
import { 
    BarChart, 
    Bar, 
    XAxis, 
    YAxis, 
    CartesianGrid, 
    Tooltip, 
    ResponsiveContainer, 
    PieChart, 
    Pie, 
    Cell,
    AreaChart,
    Area
} from 'recharts';

const Analytics = () => {
    const dispatch = useDispatch();
    const { analytics, loading } = useSelector((state) => state.superAdmin);

    useEffect(() => {
        dispatch(fetchPlatformAnalytics());
    }, [dispatch]);

    if (loading || !analytics) {
        return (
            <div className="h-[70vh] flex items-center justify-center">
                <Loader2 className="w-10 h-10 text-brand-primary animate-spin" />
            </div>
        );
    }

    const { revenue, infrastructure, users, growth } = analytics;

    const COLORS = ['#2563eb', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'];

    const userDistData = users.distribution.map(d => ({
        name: d._id.replace('_', ' '),
        value: d.count
    }));

    const infraData = [
        { name: 'Schools', value: infrastructure.totalSchools },
        { name: 'Teachers', value: infrastructure.totalTeachers },
        { name: 'Students', value: infrastructure.totalStudents }
    ];

    return (
        <motion.div 
            initial={{ opacity: 0, y: 15 }} 
            animate={{ opacity: 1, y: 0 }} 
            className="space-y-8 pb-10"
        >
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-slate-100 italic uppercase">System Analytics</h1>
                    <p className="text-sm font-medium text-slate-400 mt-1 tracking-wide italic">Real-time schools and user engagement statistics.</p>
                </div>
                <div className="flex items-center gap-3 px-4 py-2 bg-brand-surface border border-brand-border rounded-md">
                    <div className="w-2 h-2 rounded-full bg-luxury-emerald animate-pulse"></div>
                    <span className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">System Synchronized</span>
                </div>
            </div>

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                    { label: 'Platform Revenue', value: `$${revenue.total.toLocaleString()}`, icon: DollarSign, trend: '+12.5%', color: 'text-luxury-emerald' },
                    { label: 'Active Schools', value: infrastructure.activeSchools, icon: SchoolIcon, trend: infrastructure.totalSchools, color: 'text-brand-primary' },
                    { label: 'Total Users', value: users.total.toLocaleString(), icon: Users, trend: `${users.active} Active`, color: 'text-brand-accent' },
                    { label: 'Expansion Rate', value: growth.newSchools30d, icon: TrendingUp, trend: 'Last 30 Days', color: 'text-luxury-gold' },
                ].map((stat, idx) => (
                    <div key={idx} className="p-6 rounded-md bg-brand-surface border border-brand-border hover:border-brand-primary/30 transition-all group">
                        <div className="flex justify-between items-start mb-4">
                            <div className={`p-2 rounded-md bg-slate-800/50 border border-brand-border group-hover:bg-brand-primary/10 transition-colors ${stat.color}`}>
                                <stat.icon size={20} />
                            </div>
                            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest italic">{stat.trend}</span>
                        </div>
                        <h3 className="text-2xl font-bold text-slate-100 tracking-tight italic uppercase">{stat.value}</h3>
                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">{stat.label}</p>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* User Distribution Pie */}
                <div className="lg:col-span-1 p-6 rounded-md bg-brand-surface border border-brand-border flex flex-col items-center">
                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-8 self-start flex items-center gap-3 italic">
                        <Users size={14} /> User Distribution
                    </h3>
                    <div className="w-full h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={userDistData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={100}
                                    paddingAngle={5}
                                    dataKey="value"
                                >
                                    {userDistData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} stroke="rgba(15, 23, 42, 0.8)" strokeWidth={2} />
                                    ))}
                                </Pie>
                                <Tooltip 
                                    contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '4px' }}
                                    itemStyle={{ color: '#e2e8f0', fontSize: '12px', textTransform: 'uppercase' }}
                                />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                    <div className="grid grid-cols-2 gap-4 mt-6 w-full">
                        {userDistData.map((entry, index) => (
                            <div key={index} className="flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }}></div>
                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter truncate">{entry.name}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Infrastructure Bar Chart */}
                <div className="lg:col-span-2 p-6 rounded-md bg-brand-surface border border-brand-border">
                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-8 flex items-center gap-3 italic">
                        <Layers size={14} /> School Capacity
                    </h3>
                    <div className="w-full h-[350px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={infraData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                                <XAxis 
                                    dataKey="name" 
                                    axisLine={false} 
                                    tickLine={false} 
                                    tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 700 }}
                                />
                                <YAxis 
                                    axisLine={false} 
                                    tickLine={false} 
                                    tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 700 }}
                                />
                                <Tooltip 
                                    cursor={{ fill: 'rgba(37, 99, 235, 0.05)' }}
                                    contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '4px' }}
                                    itemStyle={{ color: '#e2e8f0', fontSize: '12px' }}
                                />
                                <Bar dataKey="value" radius={[4, 4, 0, 0]} barSize={40}>
                                    {infraData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} opacity={0.8} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            {/* Bottom Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <Link 
                    to="/superadmin/backups"
                    className="p-8 rounded-md bg-brand-surface border border-brand-border border-dashed flex items-center justify-between group hover:bg-brand-primary/5 hover:border-brand-primary/30 transition-all cursor-pointer"
                >
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <Database size={18} className="text-slate-500 group-hover:text-brand-primary transition-colors" />
                            <h4 className="text-[11px] font-bold text-slate-200 uppercase tracking-[0.2em] font-outfit">Storage & Persistence</h4>
                        </div>
                        <p className="text-[10px] font-medium text-slate-500 italic max-w-xs">Total storage and database operations are working efficiently.</p>
                    </div>
                    <div className="text-slate-700 group-hover:text-brand-primary transition-colors"><ArrowUpRight size={24} /></div>
                </Link>

                <Link 
                    to="/superadmin/revenue"
                    className="p-8 rounded-md bg-brand-surface border border-brand-border border-dashed flex items-center justify-between group hover:bg-luxury-emerald/5 hover:border-luxury-emerald/30 transition-all cursor-pointer"
                >
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <TrendingUp size={18} className="text-slate-500 group-hover:text-luxury-emerald transition-colors" />
                            <h4 className="text-[11px] font-bold text-slate-200 uppercase tracking-[0.2em] font-outfit">Projected Growth</h4>
                        </div>
                        <p className="text-[10px] font-medium text-slate-500 italic max-w-xs">Analyzing current onboarding velocity suggests +24% expansion in Q3.</p>
                    </div>
                    <div className="text-slate-700 group-hover:text-luxury-emerald transition-colors"><ArrowUpRight size={24} /></div>
                </Link>
            </div>
        </motion.div>
    );
};

export default Analytics;
