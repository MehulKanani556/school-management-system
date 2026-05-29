import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchDashboard } from '../../redux/slice/schoolAdmin.slice';
import { motion } from 'framer-motion';
import {
  Users, GraduationCap, CreditCard, ClipboardList,
  TrendingUp, Calendar as CalendarIcon, Bell, Activity,
  ChevronRight, ArrowUpRight, AlertCircle, Clock, CheckCircle2, ShieldCheck
} from 'lucide-react';
import {
  ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  BarChart, Bar, Cell, AreaChart, Area
} from 'recharts';
import { format, parseISO } from 'date-fns';
import { Link } from 'react-router-dom';

const StatCard = ({ icon: Icon, label, value, color, delay, subtext }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay }}
    className="p-6 rounded-md bg-brand-surface/40 backdrop-blur-xl border border-brand-border/40 hover:scale-[1.02] transition-all duration-300 group"
  >
    <div className="flex items-start justify-between mb-4">
      <div className={`p-4 rounded-md bg-gradient-to-br ${color} shadow-lg shadow-black/20 group-hover:scale-110 transition-transform`}>
        <Icon size={24} className="text-white" />
      </div>
      {subtext && <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{subtext}</span>}
    </div>
    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 mb-1 font-outfit">{label}</p>
    <h3 className="text-4xl font-black tracking-tighter font-outfit text-white leading-none">
      {value ?? '—'}
    </h3>
  </motion.div>
);

const ChartContainer = ({ title, children, icon: Icon, delay }) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.98 }}
    animate={{ opacity: 1, scale: 1 }}
    transition={{ delay }}
    className="bg-brand-surface/40 backdrop-blur-xl border border-brand-border/30 rounded-md p-8 flex flex-col h-full"
  >
    <div className="flex items-center justify-between mb-8">
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-md bg-slate-800/50 border border-slate-700/30">
          <Icon size={18} className="text-brand-primary" />
        </div>
        <h3 className="text-sm font-black uppercase tracking-[0.15em] text-slate-300 font-outfit">{title}</h3>
      </div>
      <button className="p-2 hover:bg-slate-800/50 rounded-md transition-colors">
        <ChevronRight size={16} className="text-slate-500" />
      </button>
    </div>
    <div className="flex-1 min-h-[240px]">
      {children}
    </div>
  </motion.div>
);

const Dashboard = () => {
  const dispatch = useDispatch();
  const { dashboard, loading } = useSelector((s) => s.schoolAdmin);
  const { user } = useSelector((s) => s.auth);
  const { activeAcademicYear } = useSelector((s) => s.academicYear);

  const { activeAcademicYearId } = useSelector((s) => s.academicYear);

  useEffect(() => {
    if (activeAcademicYearId) dispatch(fetchDashboard());
  }, [dispatch, activeAcademicYearId]);

  const stats = [
    { icon: Users, label: 'Total Students', value: dashboard?.students, color: 'from-schooladmin-primary to-indigo-600', delay: 0, subtext: `${dashboard?.metrics?.studentGrowth >= 0 ? '+' : ''}${dashboard?.metrics?.studentGrowth || 0}% this month` },
    { icon: GraduationCap, label: 'Total Teachers', value: dashboard?.teachers, color: 'from-emerald-500 to-teal-600', delay: 0.05, subtext: `${dashboard?.metrics?.newTeachers || 0} Added this month` },
    { icon: ShieldCheck, label: 'Operational Staff', value: (dashboard?.accountants || 0) + (dashboard?.librarians || 0) + (dashboard?.transporters || 0), color: 'from-indigo-500 to-schooladmin-primary', delay: 0.1, subtext: 'Fiscal & Logistics' },
    { icon: CreditCard, label: 'Pending Fees', value: dashboard?.pendingFees, color: 'from-amber-500 to-orange-600', delay: 0.15, subtext: `${dashboard?.alerts?.overdueFees || 0} Overdue` },
    { icon: ClipboardList, label: 'Total Exams', value: dashboard?.exams, color: 'from-rose-500 to-pink-600', delay: 0.2, subtext: `${dashboard?.alerts?.examsToday || 0} Scheduled today` },
  ];

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-2 h-8 bg-brand-primary rounded-md shadow-[0_0_15px_rgba(37,99,235,0.5)]" />
            <h1 className="text-4xl font-black uppercase tracking-tighter font-outfit text-white">
              Dashboard
            </h1>
          </div>
          <p className="text-slate-400 font-medium">
            Welcome back, <span className="text-white font-bold">{user?.firstName}</span>. Here's what's happening today.
          </p>
        </motion.div>

        <div className="flex gap-3">
          {activeAcademicYear && (
            <div className="bg-schooladmin-primary/10 border border-schooladmin-primary/30 rounded-md px-5 py-3 flex items-center gap-3">
              <CalendarIcon size={18} className="text-schooladmin-primary" />
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Active Session</p>
                <p className="text-sm font-bold text-schooladmin-primary">{activeAcademicYear.name}</p>
              </div>
            </div>
          )}
          <div className="bg-brand-surface/40 backdrop-blur-xl border border-brand-border/30 rounded-md px-5 py-3 flex items-center gap-4">
            <div className="text-right">
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Current Time</p>
              <p className="text-sm font-bold text-white">{format(new Date(), 'hh:mm a')}</p>
            </div>
            <div className="w-px h-8 bg-brand-border/30" />
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Current Date</p>
              <p className="text-sm font-bold text-white">{format(new Date(), 'dd MMM, yyyy')}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-5">
        {loading && !dashboard ? (
          [...Array(5)].map((_, i) => (
            <div key={i} className="h-44 rounded-md bg-slate-800/20 animate-pulse border border-white/5" />
          ))
        ) : (
          stats.map((s) => <StatCard key={s.label} {...s} />)
        )}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Attendance Trend Chart */}
        <div className="xl:col-span-2">
          <ChartContainer title="Attendance Trend" icon={TrendingUp} delay={0.25}>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={dashboard?.attendanceTrends || []}>
                <defs>
                  <linearGradient id="colorPercentage" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2563eb" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#2563eb" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                <XAxis
                  dataKey="date"
                  stroke="#475569"
                  fontSize={10}
                  tickFormatter={(val) => format(parseISO(val), 'dd MMM')}
                />
                <YAxis stroke="#475569" fontSize={10} unit="%" />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '12px', fontSize: '12px' }}
                  itemStyle={{ color: '#60a5fa' }}
                />
                <Area
                  type="monotone"
                  dataKey="percentage"
                  stroke="#2563eb"
                  strokeWidth={3}
                  fillOpacity={1}
                  fill="url(#colorPercentage)"
                  animationDuration={2000}
                />
              </AreaChart>
            </ResponsiveContainer>
          </ChartContainer>
        </div>

        {/* Alerts & Notifications */}
        <div className="xl:col-span-1">
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-brand-surface/40 backdrop-blur-xl border border-brand-border/30 rounded-md p-8 h-full"
          >
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-md bg-orange-500/10 border border-orange-500/20">
                  <Bell size={18} className="text-orange-500" />
                </div>
                <h3 className="text-sm font-black uppercase tracking-[0.15em] text-slate-300 font-outfit">Priority Alerts</h3>
              </div>
              <span className="px-2 py-1 rounded-md bg-orange-500/10 text-orange-500 text-[10px] font-bold">
                {(dashboard?.alerts?.overdueFees || 0) + (dashboard?.alerts?.examsToday || 0)} New
              </span>
            </div>

            <div className="space-y-4">
              {dashboard?.alerts?.overdueFees > 0 && (
                <div className="p-4 rounded-md bg-amber-500/10 border border-amber-500/20 flex gap-4">
                  <div className="p-2 h-fit rounded-md bg-amber-500/20">
                    <AlertCircle size={18} className="text-amber-500" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white mb-1">Fee Payment Overdue</h4>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      There are {dashboard.alerts.overdueFees} students with overdue fee payments.
                    </p>
                    <Link to="/school-admin/fees" className="mt-3 inline-block text-[10px] font-black uppercase text-amber-500 hover:underline">Take Action</Link>
                  </div>
                </div>
              )}

              {dashboard?.alerts?.examsToday > 0 && (
                <div className="p-4 rounded-md bg-schooladmin-primary/10 border border-schooladmin-primary/20 flex gap-4">
                  <div className="p-2 h-fit rounded-md bg-schooladmin-primary/20">
                    <Clock size={18} className="text-schooladmin-primary" />
                  </div>
                  <div className='text-start'>
                    <h4 className="text-sm font-bold text-white mb-1">Exams Scheduled Today</h4>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      {dashboard.alerts.examsToday} exams are scheduled for today. Check rosters.
                    </p>
                    <Link to="/school-admin/exams" className="mt-3 inline-block text-[10px] font-black uppercase text-schooladmin-primary hover:underline">View Schedule</Link>
                  </div>
                </div>
              )}

              {(!dashboard?.alerts?.overdueFees && !dashboard?.alerts?.examsToday) && (
                <div className="flex flex-col items-center justify-center py-12 text-center opacity-40">
                  <CheckCircle2 size={48} className="text-slate-500 mb-4" />
                  <p className="text-sm font-medium text-slate-400">All caught up! No urgent alerts.</p>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {/* Fee Collection Chart */}
        <ChartContainer title="Fee Collection (Monthly)" icon={CreditCard} delay={0.35}>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={dashboard?.feeTrends || []}>
              <XAxis dataKey="month" stroke="#475569" fontSize={10} axisLine={false} tickLine={false} />
              <YAxis hide />
              <Tooltip
                cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                contentStyle={{ backgroundColor: '#0f172a', border: 'none', borderRadius: '12px', fontSize: '12px' }}
              />
              <Bar dataKey="amount" fill="#3b82f6" radius={[6, 6, 0, 0]} barSize={24}>
                {(dashboard?.feeTrends || []).map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={index === (dashboard?.feeTrends?.length - 1) ? '#60a5fa' : '#1e3a8a'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartContainer>

        {/* Activity Feed */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-brand-surface/40 backdrop-blur-xl border border-brand-border/30 rounded-md p-8"
        >
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-md bg-purple-500/10 border border-purple-500/20">
                <Activity size={18} className="text-purple-500" />
              </div>
              <h3 className="text-sm font-black uppercase tracking-[0.15em] text-slate-300 font-outfit">Activity Feed</h3>
            </div>
          </div>

          <div className="space-y-6">
            {dashboard?.activity?.length > 0 ? (
              dashboard.activity.map((item, i) => (
                <div key={i} className="flex gap-4 group cursor-default">
                  <div className="relative">
                    <div className="w-10 h-10 rounded-md bg-slate-800 border border-white/5 flex items-center justify-center flex-shrink-0 group-hover:border-brand-primary transition-colors">
                      {item.type === 'student' ? <Users size={16} className="text-schooladmin-primary" /> :
                        item.type === 'teacher' ? <GraduationCap size={16} className="text-emerald-400" /> :
                          <ClipboardList size={16} className="text-purple-400" />}
                    </div>
                    {i !== (dashboard.activity.length - 1) && (
                      <div className="absolute top-10 left-1/2 -translate-x-1/2 w-0.5 h-6 bg-slate-800" />
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-0.5">
                      <p className="text-xs font-black text-white group-hover:text-brand-primary transition-colors">{item.name}</p>
                      <span className="text-[10px] font-medium text-slate-500">{format(parseISO(item.date), 'hh:mm a')}</span>
                    </div>
                    <p className="text-[11px] text-slate-400">{item.action}</p>
                  </div>
                </div>
              ))
            ) : (
              <div className="py-12 text-center opacity-30 flex flex-col items-center">
                <Activity size={32} className="mb-2" />
                <p className="text-xs">No recent activity</p>
              </div>
            )}
          </div>
        </motion.div>

        {/* Calendar Widget */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.45 }}
          className="bg-brand-surface/40 backdrop-blur-xl border border-brand-border/30 rounded-md p-8"
        >
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-md bg-orange-500/10 border border-orange-500/20">
                <CalendarIcon size={18} className="text-orange-500" />
              </div>
              <h3 className="text-sm font-black uppercase tracking-[0.15em] text-slate-300 font-outfit">Calendar</h3>
            </div>
          </div>

          <div className="space-y-4">
            {dashboard?.calendar?.length > 0 ? (
              dashboard.calendar.map((event, i) => (
                <div key={i} className="flex gap-4 p-4 rounded-md bg-white/5 border border-white/5 hover:bg-white/[0.08] transition-colors group">
                  <div className="flex flex-col items-center justify-center h-12 w-12 rounded-md bg-slate-900 border border-white/5 flex-shrink-0 group-hover:border-orange-500/30 transition-colors">
                    <span className="text-[10px] font-black uppercase text-slate-500">{format(parseISO(event.date), 'MMM')}</span>
                    <span className="text-lg font-black text-white leading-none">{format(parseISO(event.date), 'dd')}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-xs font-bold text-white mb-1 truncate group-hover:text-orange-400 transition-colors">{event.title}</h4>
                    <div className="flex items-center gap-2">
                      <span className={`px-1.5 py-0.5 rounded-md text-[8px] font-black uppercase ${event.type === 'holiday' ? 'bg-rose-500/20 text-rose-500' : 'bg-schooladmin-primary/20 text-schooladmin-primary'}`}>
                        {event.type}
                      </span>
                      {event.endDate && (
                        <span className="text-[10px] text-slate-500">Until {format(parseISO(event.endDate), 'dd MMM')}</span>
                      )}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="py-12 text-center opacity-30 flex flex-col items-center">
                <CalendarIcon size={32} className="mb-2" />
                <p className="text-xs">No upcoming events</p>
              </div>
            )}
          </div>
        </motion.div>
      </div>

      {/* Exam Performance Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <ChartContainer title="Avg. Exam Performance" icon={TrendingUp} delay={0.5}>
            <ResponsiveContainer width="100%" height={240}>
              <LineChart data={dashboard?.examPerformance || []}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                <XAxis dataKey="title" stroke="#475569" fontSize={10} axisLine={false} tickLine={false} />
                <YAxis stroke="#475569" fontSize={10} domain={[0, 100]} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '12px' }}
                />
                <Line
                  type="stepAfter"
                  dataKey="avg"
                  stroke="#10b981"
                  strokeWidth={4}
                  dot={{ r: 6, fill: '#10b981', strokeWidth: 0 }}
                  activeDot={{ r: 8, strokeWidth: 0, shadow: '0 0 10px rgba(16,185,129,0.5)' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </ChartContainer>
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.55 }}
          className="bg-brand-surface/40 backdrop-blur-xl border border-brand-border/30 rounded-md p-8 flex flex-col items-center justify-center text-center overflow-hidden relative group"
        >
          <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity">
            <TrendingUp size={120} />
          </div>

          <div className="p-4 rounded-md bg-schooladmin-primary/10 border border-schooladmin-primary/20 mb-6">
            <ArrowUpRight size={32} className="text-schooladmin-primary" />
          </div>
          <h3 className="text-xl font-black text-white mb-2 font-outfit uppercase tracking-tighter">Growth Insights</h3>
          <p className="text-sm text-slate-400 mb-8 max-w-[200px] leading-relaxed">
            {dashboard?.metrics?.growthInsight || 'All performance metrics are stable for the current month.'}
          </p>
          <Link to="/school-admin/reports" className="px-8 py-3 rounded-md bg-brand-primary hover:bg-schooladmin-primary text-white text-xs font-black uppercase tracking-widest transition-all shadow-lg shadow-schooladmin-primary/20 active:scale-95 inline-block text-center">
            View Analytics
          </Link>
        </motion.div>
      </div>

      {/* Quick Actions Re-Styled */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="bg-brand-surface/40 backdrop-blur-xl border border-brand-border/30 rounded-md p-8"
      >
        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 mb-6 font-outfit text-center">Quick Administration Access</p>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {[
            { label: 'Admission', icon: Users, href: '/school-admin/students', color: 'bg-schooladmin-primary/10 text-schooladmin-primary hover:bg-schooladmin-primary hover:text-white' },
            { label: 'Staffing', icon: GraduationCap, href: '/school-admin/teachers', color: 'bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500 hover:text-white' },
            { label: 'Exam Portal', icon: ClipboardList, href: '/school-admin/exams', color: 'bg-purple-500/10 text-purple-500 hover:bg-purple-500 hover:text-white' },
            { label: 'Finance', icon: CreditCard, href: '/school-admin/fees', color: 'bg-amber-500/10 text-amber-500 hover:bg-amber-500 hover:text-white' },
            { label: 'Attendance', icon: Activity, href: '/school-admin/attendance', color: 'bg-rose-500/10 text-rose-500 hover:bg-rose-500 hover:text-white' },
            { label: 'Settings', icon: CalendarIcon, href: '/school-admin/standards', color: 'bg-slate-500/10 text-slate-400 hover:bg-slate-500 hover:text-white' },
          ].map(({ label, href, icon: Icon, color }) => (
            <Link to={href} key={label}
              className={`flex flex-col items-center gap-3 p-6 rounded-md border border-brand-border/20 transition-all duration-300 font-outfit group ${color}`}
            >
              <Icon size={24} className="group-hover:scale-110 transition-transform" />
              <span className="text-[10px] font-black uppercase tracking-widest text-center leading-tight">{label}</span>
            </Link>
          ))}
        </div>
      </motion.div>
    </div>
  );
};

export default Dashboard;
