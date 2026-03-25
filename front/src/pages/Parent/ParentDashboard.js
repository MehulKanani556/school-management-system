import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import { 
    Activity, 
    CreditCard, 
    Trophy, 
    Bell, 
    ChevronRight, 
    Clock, 
    Calendar,
    Target,
    AlertCircle,
    CheckCircle2,
    Megaphone
} from 'lucide-react';
import { 
    fetchChildOverview, 
    fetchAnnouncements, 
    fetchChildTimetable,
    addAnnouncement 
} from '../../redux/slice/parent.slice';
import { fetchNotifications, receiveNotification } from '../../redux/slice/notification.slice';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useSocket } from '../../context/SocketContext';
import axiosInstance from '../../utils/axiosInstance';
import moment from 'moment';
import { toast } from 'react-hot-toast';

const ParentDashboard = () => {
    const dispatch = useDispatch();
    const { socket } = useSocket();
    const { 
        selectedChild, 
        overview, 
        overviewLoading: loading,
        announcements,
        timetable 
    } = useSelector(state => state.parent);
    const { items: notifications } = useSelector(state => state.notifications);

    const fetchData = React.useCallback(async () => {
        if (!selectedChild?._id) return;
        
        // Dispatch all tactical data fetches
        dispatch(fetchNotifications());
        dispatch(fetchAnnouncements());
        dispatch(fetchChildTimetable(selectedChild._id));
    }, [selectedChild?._id, dispatch]);

    useEffect(() => {
        if (selectedChild?._id) {
            dispatch(fetchChildOverview(selectedChild._id));
            fetchData();
        }
    }, [selectedChild?._id, dispatch, fetchData]);

    useEffect(() => {
        if (!socket) return;
        
        socket.on('new_announcement', (data) => {
            dispatch(addAnnouncement(data));
        });

        socket.on('new_notification', (data) => {
            dispatch(receiveNotification(data));
        });

        return () => {
            socket.off('new_announcement');
            socket.off('new_notification');
        };
    }, [socket, dispatch]);

    const StatCard = ({ icon: Icon, label, value, subtext, color, trend }) => (
        <motion.div
            whileHover={{ y: -5 }}
            className="bg-brand-surface/40 backdrop-blur-3xl border border-brand-border/40 rounded-md p-6 relative overflow-hidden group"
        >
            <div className={`absolute top-0 right-0 w-24 h-24 ${color} opacity-[0.05] rounded-bl-[100px] group-hover:opacity-[0.1] transition-opacity`} />
            <div className="flex items-start justify-between mb-4">
                <div className={`p-3 rounded-md bg-slate-800/50 border border-slate-700/50 text-[${color}]`}>
                    <Icon size={24} className={`text-${color.replace('bg-', '')}`} />
                </div>
                {trend && (
                    <span className={`text-[10px] font-black uppercase px-2 py-1 rounded-full ${trend > 0 ? 'bg-emerald-500/10 text-emerald-400' : 'bg-parent-primary/10 text-parent-primary'}`}>
                        {trend > 0 ? '+' : ''}{trend}%
                    </span>
                )}
            </div>
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] mb-1">{label}</p>
            <h3 className="text-3xl font-black uppercase tracking-tighter mb-2">{value}</h3>
            <p className="text-[11px] font-medium text-slate-400 opacity-80">{subtext}</p>
        </motion.div>
    );

    if (loading && !overview) {
        return (
            <div className="flex items-center justify-center h-full pt-40">
                <div className="w-12 h-12 border-4 border-luxury-rose border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <div className="space-y-8 pb-12">
            {/* Header Greeting */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-4xl font-black uppercase tracking-tighter mb-2">
                        Dashboard <span className="text-luxury-rose">//</span> Summary
                    </h1>
                    <p className="text-slate-400 font-medium tracking-wide">
                        Connected to <span className="text-white font-bold">{selectedChild?.firstName}'s</span> academic terminal
                    </p>
                </div>
                <div className="flex items-center gap-3 bg-slate-900/40 border border-slate-800 p-2 rounded-md px-4">
                    <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Security Sync: Active</span>
                </div>
            </div>

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard 
                    icon={Activity} 
                    label="Attendance" 
                    value={`${overview?.attendancePercentage || 0}%`}
                    subtext="Presence across all subjects"
                    color="text-emerald-400"
                    trend={2.4}
                />
                <StatCard 
                    icon={Trophy} 
                    label="Index Score" 
                    value={overview?.recentMarks?.length > 0 
                        ? (overview.recentMarks.reduce((acc, m) => acc + (m.marksObtained / m.totalMarks), 0) / overview.recentMarks.length * 100).toFixed(1) + '%'
                        : 'N/A'
                    }
                    subtext="Aggregate institutional performance"
                    color="text-brand-primary"
                />
                <StatCard 
                    icon={CreditCard} 
                    label="Account Bal" 
                    value={`₹${overview?.pendingFees?.reduce((acc, f) => acc + (f.totalAmount || 0), 0).toLocaleString() || '0'}`}
                    subtext="Upcoming tuition fees due"
                    color="text-luxury-rose"
                />
                <StatCard 
                    icon={Bell} 
                    label="Notifications" 
                    value={Array.isArray(notifications) ? notifications.filter(n => !n.isRead).length.toString().padStart(2, '0') : '00'}
                    subtext="Unread institutional alerts"
                    color="text-amber-400"
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-8">
                {/* Academic Progress Chart */}
                <div className="lg:col-span-2 bg-brand-surface/40 backdrop-blur-3xl border border-brand-border/40 rounded-md p-8">
                    <div className="flex items-center justify-between mb-10">
                        <div>
                            <h4 className="text-[11px] font-black text-slate-500 uppercase tracking-[0.4em] mb-1">Performance Ledger</h4>
                            <p className="text-lg font-black uppercase tracking-tight">Academic trajectory</p>
                        </div>
                        <div className="flex items-center gap-6">
                            <div className="flex items-center gap-2">
                                <div className="w-2.5 h-2.5 rounded-full bg-luxury-rose shadow-[0_0_10px_rgba(244,63,94,0.5)]" />
                                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Current Year</span>
                            </div>
                        </div>
                    </div>
                    
                    <div className="h-[350px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={(overview?.recentMarks || []).map(m => ({
                                name: m.examId?.title || m.subjectId?.name || 'N/A',
                                score: m.totalMarks > 0 ? (m.marksObtained / m.totalMarks) * 100 : 0
                            })).reverse()}>
                                <defs>
                                    <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.3}/>
                                        <stop offset="95%" stopColor="#f43f5e" stopOpacity={0}/>
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#1e293b" />
                                <XAxis 
                                    dataKey="name" 
                                    stroke="#475569" 
                                    fontSize={10} 
                                    fontWeight="bold" 
                                    tickLine={false} 
                                    axisLine={false} 
                                    dy={10} 
                                />
                                <YAxis 
                                    stroke="#475569" 
                                    fontSize={10} 
                                    fontWeight="bold" 
                                    tickLine={false} 
                                    axisLine={false} 
                                />
                                <Tooltip 
                                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', borderRadius: '4px', fontSize: '10px' }}
                                    itemStyle={{ fontWeight: 'bold' }}
                                />
                                <Area 
                                    type="monotone" 
                                    dataKey="score" 
                                    stroke="#f43f5e" 
                                    strokeWidth={4} 
                                    fillOpacity={1} 
                                    fill="url(#colorScore)" 
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Recent Performance Records */}
                <div className="bg-brand-surface/40 backdrop-blur-3xl border border-brand-border/40 rounded-md p-8">
                    <h4 className="text-[11px] font-black text-slate-500 uppercase tracking-[0.4em] mb-8">Recent Results</h4>
                    <div className="space-y-6">
                        {overview?.recentMarks?.length > 0 ? (
                            overview.recentMarks.map((mark, i) => (
                                <div key={i} className="group flex items-center justify-between p-4 bg-slate-900/30 rounded-md border border-slate-800/50 hover:border-luxury-rose/30 transition-all">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-md bg-slate-800 flex items-center justify-center text-luxury-rose">
                                            <Target size={20} />
                                        </div>
                                        <div>
                                            <p className="font-black text-[11px] uppercase tracking-wide">{mark.subjectId?.name}</p>
                                            <p className="text-[9px] text-slate-500 uppercase font-bold tracking-widest">{new Date(mark.createdAt).toLocaleDateString()}</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-lg font-black text-white">{mark.marksObtained}/{mark.totalMarks}</p>
                                        <p className="text-[9px] font-black text-emerald-400 uppercase tracking-widest leading-none">Passed</p>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="text-center py-10 opacity-30">
                                <Trophy size={48} className="mx-auto mb-4" />
                                <p className="text-[10px] font-black uppercase tracking-[0.2em]">No recent records indexed</p>
                            </div>
                        )}
                    </div>
                    <button className="w-full mt-8 py-4 bg-slate-800/50 hover:bg-slate-800 rounded-md text-[10px] font-black uppercase tracking-[0.4em] transition-all border border-slate-700/50 flex items-center justify-center gap-3">
                        View Assessment Log <ChevronRight size={14} />
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-8">
                {/* Institutional Announcements Broadcast */}
                <div className="md:col-span-2 bg-brand-surface/40 backdrop-blur-3xl border border-brand-border/40 rounded-md p-8 overflow-hidden relative">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-luxury-rose/5 blur-[100px] -mr-32 -mt-32" />
                    <div className="flex items-center justify-between mb-8 relative">
                        <div>
                            <h4 className="text-[11px] font-black text-slate-500 uppercase tracking-[0.4em] mb-1">Broadcasting Node</h4>
                            <p className="text-lg font-black uppercase tracking-tight">Institutional Announcements</p>
                        </div>
                        <Megaphone className="text-luxury-rose animate-pulse" size={24} />
                    </div>
                    <div className="flex flex-col gap-4 relative">
                        {announcements.length > 0 ? (
                            announcements.slice(0, 3).map((ann, i) => (
                                <motion.div 
                                    key={i} 
                                    initial={{ x: -20, opacity: 0 }}
                                    animate={{ x: 0, opacity: 1 }}
                                    transition={{ delay: i * 0.1 }}
                                    className="p-6 bg-slate-900/40 border-l-4 border-luxury-rose rounded-md group hover:bg-slate-900/60 transition-all"
                                >
                                    <div className="flex items-center justify-between mb-2">
                                        <h5 className="text-[11px] font-black text-white uppercase tracking-wider">{ann.subject || "Security Protocol Update"}</h5>
                                        <span className="text-[9px] font-bold text-slate-600 uppercase tracking-widest">{new Date(ann.createdAt).toLocaleDateString()}</span>
                                    </div>
                                    <p className="text-sm font-medium text-slate-400 line-clamp-2 italic leading-relaxed group-hover:text-slate-300 transition-colors">
                                        "{ann.content}"
                                    </p>
                                </motion.div>
                            ))
                        ) : (
                            <div className="text-center py-10 opacity-30">
                                <Megaphone size={48} className="mx-auto mb-4" />
                                <p className="text-[10px] font-black uppercase tracking-[0.2em]">Silence across all channels</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Financial Ledger (Pending Fees) */}
                <div className="bg-brand-surface/40 backdrop-blur-3xl border border-brand-border/40 rounded-md p-8">
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h4 className="text-[11px] font-black text-slate-500 uppercase tracking-[0.4em] mb-1">Financial Reconciliation</h4>
                            <p className="text-lg font-black uppercase tracking-tight">Pending dues</p>
                        </div>
                        <CreditCard className="text-luxury-rose" size={24} />
                    </div>
                    <div className="space-y-4">
                        {overview?.pendingFees?.length > 0 ? (
                            overview.pendingFees.map((fee, i) => {
                                const isOverdue = moment().isAfter(moment(fee.dueDate));
                                return (
                                    <div key={i} className={`flex items-center justify-between p-4 border rounded-md transition-all ${isOverdue ? 'bg-luxury-rose/10 border-luxury-rose/40 shadow-[0_0_20px_rgba(244,63,94,0.1)]' : 'bg-slate-900/30 border-slate-800'}`}>
                                        <div className="flex items-center gap-4">
                                            <div className={`p-2 rounded transition-colors ${isOverdue ? 'bg-luxury-rose/20 animate-pulse' : 'bg-slate-800'}`}>
                                                <AlertCircle size={18} className={isOverdue ? 'text-luxury-rose' : 'text-slate-500'} />
                                            </div>
                                            <div>
                                                <div className="flex items-center gap-2">
                                                    <p className="font-black text-[11px] uppercase tracking-[0.1em]">{fee.category}</p>
                                                    {isOverdue && <span className="text-[8px] font-black bg-luxury-rose text-white px-1.5 py-0.5 rounded-sm uppercase tracking-widest leading-none">Overdue</span>}
                                                </div>
                                                <p className="text-[9px] text-slate-500 uppercase font-black tracking-widest">Due: {new Date(fee.dueDate).toLocaleDateString()}</p>
                                            </div>
                                        </div>
                                        <p className={`text-xl font-black ${isOverdue ? 'text-luxury-rose' : 'text-white'}`}>₹{fee.totalAmount}</p>
                                    </div>
                                );
                            })
                        ) : (
                            <div className="flex flex-col items-center justify-center py-8 bg-emerald-500/5 border border-emerald-500/20 rounded-md">
                                <CheckCircle2 size={32} className="text-emerald-500 mb-2" />
                                <p className="text-[10px] font-black uppercase tracking-widest text-emerald-400">Account Synchronized // No Dues</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Upcoming Schedule / Timetable Quick View */}
                <div className="bg-brand-surface/40 backdrop-blur-3xl border border-brand-border/40 rounded-md p-8">
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h4 className="text-[11px] font-black text-slate-500 uppercase tracking-[0.4em] mb-1">Daily Sequence</h4>
                            <p className="text-lg font-black uppercase tracking-tight">Live timetable</p>
                        </div>
                        <Clock className="text-brand-primary" size={24} />
                    </div>
                    <div className="space-y-4">
                        {(() => {
                            const today = new Date().toLocaleDateString('en-US', { weekday: 'long' });
                            const todaySlots = timetable?.days?.find(d => d.day === today)?.slots || [];
                            
                            if (todaySlots.length === 0) {
                                return (
                                    <div className="text-center py-8 opacity-30">
                                        <Clock size={32} className="mx-auto mb-2" />
                                        <p className="text-[10px] font-black uppercase tracking-[0.2em]">No operations scheduled today</p>
                                    </div>
                                );
                            }

                            return todaySlots.slice(0, 3).map((slot, i) => (
                                <div key={i} className="p-4 bg-slate-900/40 rounded-md border border-slate-800 flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <div className="p-2 bg-brand-primary/10 rounded flex flex-col items-center min-w-[50px]">
                                            <span className="text-[9px] font-black text-brand-primary uppercase">{slot.startTime}</span>
                                        </div>
                                        <div>
                                            <p className="font-black text-[10px] uppercase tracking-widest">{slot.subject?.name}</p>
                                            <p className="text-[9px] text-slate-500 uppercase font-bold tracking-widest">{slot.teacher?.firstName} {slot.teacher?.lastName}</p>
                                        </div>
                                    </div>
                                    <span className="px-2 py-1 bg-brand-primary/10 text-brand-primary text-[8px] font-black uppercase tracking-widest rounded">Scheduled</span>
                                </div>
                            ));
                        })()}
                    </div>
                    <button className="w-full mt-6 py-4 bg-slate-800/50 hover:bg-slate-800 rounded-md text-[10px] font-black uppercase tracking-[0.4em] transition-all border border-slate-700/50">
                        View Full Schedule
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ParentDashboard;
