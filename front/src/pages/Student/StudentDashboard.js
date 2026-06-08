import React, { useEffect, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
    fetchStudentProfile,
    fetchStudentAttendance,
    fetchStudentResults,
    fetchStudentAssignments,
    fetchStudentTimetable,
    fetchStudentNotices,
    fetchStudentAnnouncements,
    fetchMySubmissions,
    fetchStudentFees,
    fetchStudentExams,
} from '../../redux/slice/student.slice';
import { motion } from 'framer-motion';
import {
    ClipboardList, Award, BookOpen, Globe, ArrowRight,
    Calendar, TrendingUp, CheckCircle2, AlertCircle, Clock,
    FileText, CreditCard, GraduationCap, User, Zap,
    ChevronRight, Activity, Bell, Users, BookMarked,
    Layers, Target, BarChart2
} from 'lucide-react';
import {
    ResponsiveContainer, AreaChart, Area, XAxis, YAxis,
    CartesianGrid, Tooltip, BarChart, Bar, Cell, LineChart, Line
} from 'recharts';
import { format } from 'date-fns';
import { Link } from 'react-router-dom';

// ─── Exact school-admin StatCard ───────────────────────────────────────────────
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
            {subtext && <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest text-right max-w-[100px] leading-tight">{subtext}</span>}
        </div>
        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 mb-1 font-outfit">{label}</p>
        <h3 className="text-4xl font-black tracking-tighter font-outfit text-white leading-none">
            {value ?? '—'}
        </h3>
    </motion.div>
);

// ─── Exact school-admin ChartContainer ────────────────────────────────────────
const ChartContainer = ({ title, children, icon: Icon, delay, action }) => (
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
            {action
                ? <Link to={action.to} className="text-[10px] font-black uppercase tracking-widest text-brand-primary flex items-center gap-1 hover:gap-2 transition-all">{action.label} <ChevronRight size={12} /></Link>
                : <button className="p-2 hover:bg-slate-800/50 rounded-md transition-colors"><ChevronRight size={16} className="text-slate-500" /></button>
            }
        </div>
        <div className="flex-1 min-h-[220px]">
            {children}
        </div>
    </motion.div>
);

// ─── Main Dashboard ────────────────────────────────────────────────────────────
const StudentDashboard = () => {
    const dispatch = useDispatch();
    const { user } = useSelector((s) => s.auth);
    const { profile, attendance, results, assignments, submissions, notices, announcements, fees, exams, timetable, loading } = useSelector((s) => s.student);
    const { activeAcademicYear, activeAcademicYearId } = useSelector((s) => s.academicYear);

    useEffect(() => {
        dispatch(fetchStudentProfile());
        dispatch(fetchStudentAttendance());
        dispatch(fetchStudentResults());
        dispatch(fetchStudentAssignments());
        dispatch(fetchStudentTimetable());
        dispatch(fetchStudentNotices());
        dispatch(fetchStudentAnnouncements());
        dispatch(fetchMySubmissions());
        dispatch(fetchStudentFees());
        dispatch(fetchStudentExams());
    }, [dispatch, activeAcademicYearId]);

    // ── Derived Data ──────────────────────────────────────────────────────────
    const attPercent = useMemo(() => {
        if (!attendance?.length) return 0;
        return Math.round((attendance.filter(a => ['Present', 'Late', 'Half-Day'].includes(a.status)).length / attendance.length) * 100);
    }, [attendance]);

    const avgScore = useMemo(() => {
        if (!results?.length) return null;
        const sum = results.reduce((acc, r) => acc + (r.marksObtained / (r.examId?.maxMarks || 100)), 0);
        return ((sum / results.length) * 100).toFixed(1);
    }, [results]);

    const subjectsCount = profile?.subjectCount ?? profile?.classSection?.subjects?.length ?? 0;

    const pendingAssignments = useMemo(() =>
        (assignments || []).filter(a => {
            const submitted = (submissions || []).some(s => (s.assignmentId?._id || s.assignmentId) === a._id);
            return !submitted && new Date(a.dueDate) > new Date();
        }).sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate)),
        [assignments, submissions]
    );

    const upcomingExams = useMemo(() =>
        (exams || []).filter(e => new Date(e.date) >= new Date())
            .sort((a, b) => new Date(a.date) - new Date(b.date)),
        [exams]
    );

    const pendingFees = useMemo(() =>
        (fees || []).filter(f => f.status === 'pending' || f.status === 'overdue'),
        [fees]
    );

    const unifiedFeed = useMemo(() =>
        [...(notices || []), ...(announcements || [])]
            .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
            .slice(0, 6),
        [notices, announcements]
    );

    const todaySchedule = useMemo(() => {
        if (!timetable?.length) return [];
        const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        const today = days[new Date().getDay()];
        const flat = [];
        timetable.forEach(t => (t.slots || []).forEach(slot => { if (slot.day === today) flat.push(slot); }));
        return flat.sort((a, b) => (a.startTime || '').localeCompare(b.startTime || '')).slice(0, 5);
    }, [timetable]);

    // Attendance trend: last 14 days from attendance array
    const attendanceTrend = useMemo(() => {
        return [...(attendance || [])]
            .slice(0, 14)
            .reverse()
            .map(a => ({
                date: a.date ? format(new Date(a.date), 'dd MMM') : '',
                value: ['Present', 'Late', 'Half-Day'].includes(a.status) ? 100 : 0,
            }));
    }, [attendance]);

    // Score trend: per-exam scores
    const scoreTrend = useMemo(() =>
        (results || []).slice(0, 8).map(r => ({
            name: r.examId?.subject?.name?.slice(0, 8) || 'Exam',
            score: Math.round((r.marksObtained / (r.examId?.maxMarks || 100)) * 100),
        })),
        [results]
    );

    // Stats — same pattern as school admin
    const stats = [
        {
            icon: ClipboardList,
            label: 'Attendance Rate',
            value: `${attPercent}%`,
            color: attPercent >= 75 ? 'from-emerald-500 to-teal-600' : 'from-rose-500 to-pink-600',
            delay: 0,
            subtext: `${attendance?.filter(a => ['Present', 'Late', 'Half-Day'].includes(a.status)).length || 0} of ${attendance?.length || 0} days`,
        },
        {
            icon: Award,
            label: 'Avg Score',
            value: avgScore ? `${avgScore}%` : '—',
            color: 'from-brand-primary to-indigo-600',
            delay: 0.05,
            subtext: `Across ${results?.length || 0} exams`,
        },
        {
            icon: BookOpen,
            label: 'Subjects',
            value: subjectsCount || '—',
            color: 'from-violet-500 to-purple-600',
            delay: 0.1,
            subtext: `Class ${profile?.classSection?.standardId?.level || '—'} · Sec ${profile?.classSection?.sectionLabel || '—'}`,
        },
        {
            icon: AlertCircle,
            label: 'Pending Fees',
            value: pendingFees.length || 0,
            color: pendingFees.length > 0 ? 'from-amber-500 to-orange-600' : 'from-emerald-500 to-teal-600',
            delay: 0.15,
            subtext: pendingFees.length > 0 ? `${fees?.filter(f => f.status === 'overdue').length || 0} Overdue` : 'All Clear',
        },
        {
            icon: GraduationCap,
            label: 'Upcoming Exams',
            value: upcomingExams.length,
            color: 'from-rose-500 to-pink-600',
            delay: 0.2,
            subtext: upcomingExams[0] ? `Next: ${format(new Date(upcomingExams[0].date), 'dd MMM')}` : 'None scheduled',
        },
    ];

    const greeting = () => {
        const h = new Date().getHours();
        if (h < 12) return 'Good Morning';
        if (h < 17) return 'Good Afternoon';
        return 'Good Evening';
    };

    return (
        <div className="space-y-8 pb-12">

            {/* ── Hero Header ───────────────────────────────────────────── */}
            <motion.div
                initial={{ opacity: 0, y: -16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.45 }}
                className="relative rounded-xl overflow-hidden border border-brand-border/40 bg-brand-surface/40 backdrop-blur-xl"
            >
                {/* Accent top strip */}
                <div className="h-1 w-full bg-gradient-to-r from-brand-primary via-emerald-400 to-brand-secondary" />

                {/* Background glows */}
                <div className="absolute top-0 right-0 w-96 h-40 bg-brand-primary/8 blur-3xl pointer-events-none rounded-full" />
                <div className="absolute bottom-0 left-0 w-64 h-32 bg-emerald-500/5 blur-3xl pointer-events-none rounded-full" />

                <div className="relative z-10 p-6 lg:p-8">
                    {/* ── Top row: avatar + name + meta ── */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                        {/* Left — Avatar + Name */}
                        <div className="flex items-center gap-5">
                            <div className="relative flex-shrink-0">
                                <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-brand-primary/20 to-brand-secondary/20 border-2 border-brand-primary/30 flex items-center justify-center overflow-hidden shadow-xl shadow-brand-primary/10">
                                    {user?.photo
                                        ? <img src={user.photo} alt="" className="w-full h-full object-cover" />
                                        : <span className="text-2xl font-black text-brand-primary">
                                            {user?.firstName?.[0]}{user?.lastName?.[0]}
                                        </span>
                                    }
                                </div>
                                <span className="absolute -bottom-1 -right-1 w-4 h-4 bg-luxury-emerald rounded-full border-2 border-brand-surface shadow-lg shadow-luxury-emerald/50" />
                            </div>
                            <div>
                                <p className="text-[10px] font-black uppercase tracking-[0.35em] text-slate-500 mb-1">{greeting()}</p>
                                <h1 className="text-3xl lg:text-4xl font-black tracking-tight text-white leading-none font-outfit">
                                    {user?.firstName}&nbsp;
                                    <span className="text-brand-primary">{user?.lastName}</span>
                                </h1>
                                <div className="flex items-center gap-2 mt-2">
                                    <span className="text-[10px] text-slate-500 font-medium">{profile?.admissionNumber || '—'}</span>
                                    <span className="w-1 h-1 rounded-full bg-slate-700" />
                                    <span className="text-[10px] text-slate-500 font-medium truncate max-w-[220px]">{profile?.schoolId?.name || 'School Portal'}</span>
                                    <span className="w-1 h-1 rounded-full bg-slate-700" />
                                    <span className="flex items-center gap-1 text-[10px] font-black text-luxury-emerald uppercase tracking-wider">
                                        <span className="w-1.5 h-1.5 rounded-full bg-luxury-emerald animate-pulse" />
                                        Online
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Right — Active session badge */}
                        <div className='flex gap-3'>
                            <div className="flex-shrink-0 flex items-center gap-3 bg-violet-500/10 border border-violet-500/25 rounded-xl px-5 py-3">
                                <GraduationCap size={20} className="text-violet-500" />
                                <div>
                                    <p className="text-[9px] font-black uppercase tracking-[0.25em] text-slate-500 leading-none mb-1">Class</p>
                                    <p className="text-base font-black text-violet-500 leading-none">
                                        Class {profile?.classSection?.standardId?.level || '—'}
                                    </p>
                                   <p className="text-[9px] text-slate-500 mt-0.5">
                                        Section {profile?.classSection?.sectionLabel || '—'}
                                    </p>
                                </div>
                            </div>
                            {activeAcademicYear && (
                                <div className="flex-shrink-0 flex items-center gap-3 bg-brand-primary/10 border border-brand-primary/25 rounded-xl px-5 py-3">
                                    <Calendar size={20} className="text-brand-primary" />
                                    <div>
                                        <p className="text-[9px] font-black uppercase tracking-[0.25em] text-slate-500 leading-none mb-1">Active Session</p>
                                        <p className="text-base font-black text-brand-primary leading-none">{activeAcademicYear.name}</p>
                                        {activeAcademicYear.isCurrent && (
                                            <p className="text-[9px] font-black text-luxury-emerald mt-0.5 uppercase tracking-wide">Current Year</p>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </motion.div>

            {/* ── Stat Cards ─────────────────────────────────────────────── */}
            <div className="grid grid-cols-2 lg:grid-cols-5 gap-5">
                {loading && !profile ? (
                    [...Array(5)].map((_, i) => (
                        <div key={i} className="h-44 rounded-md bg-slate-800/20 animate-pulse border border-white/5" />
                    ))
                ) : (
                    stats.map(s => <StatCard key={s.label} {...s} />)
                )}
            </div>

            {/* ── Row 1: Attendance Trend + Alerts ──────────────────────── */}
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                <div className="xl:col-span-2">
                    <ChartContainer title="Attendance Trend (Last 14 Days)" icon={TrendingUp} delay={0.25} action={{ to: '/student/attendance', label: 'Full History' }}>
                        {attendanceTrend.length > 0 ? (
                            <ResponsiveContainer width="100%" height={280}>
                                <AreaChart data={attendanceTrend}>
                                    <defs>
                                        <linearGradient id="attGrad" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                                            <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                                    <XAxis dataKey="date" stroke="#475569" fontSize={10} axisLine={false} tickLine={false} />
                                    <YAxis stroke="#475569" fontSize={10} domain={[0, 100]} tickFormatter={v => v === 100 ? 'P' : 'A'} width={24} />
                                    <Tooltip
                                        contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '12px', fontSize: '12px' }}
                                        formatter={(v) => [v === 100 ? 'Present' : 'Absent', 'Status']}
                                    />
                                    <Area type="monotone" dataKey="value" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#attGrad)" animationDuration={1800} />
                                </AreaChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="flex flex-col items-center justify-center h-full opacity-30">
                                <Activity size={48} className="mb-3" />
                                <p className="text-sm">No attendance data</p>
                            </div>
                        )}
                    </ChartContainer>
                </div>

                {/* Priority Alerts — identical card style */}
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
                                {pendingAssignments.length + pendingFees.length + upcomingExams.filter(e => {
                                    const d = Math.ceil((new Date(e.date) - new Date()) / 86400000);
                                    return d <= 3;
                                }).length} New
                            </span>
                        </div>

                        <div className="space-y-4">
                            {pendingAssignments.length > 0 && (
                                <div className="p-4 rounded-md bg-rose-500/10 border border-rose-500/20 flex gap-4">
                                    <div className="p-2 h-fit rounded-md bg-rose-500/20">
                                        <FileText size={18} className="text-rose-400" />
                                    </div>
                                    <div>
                                        <h4 className="text-sm font-bold text-white mb-1">Assignments Due</h4>
                                        <p className="text-xs text-slate-400 leading-relaxed">
                                            You have {pendingAssignments.length} pending assignment{pendingAssignments.length > 1 ? 's' : ''} due soon.
                                        </p>
                                        <Link to="/student/assignments" className="mt-3 inline-block text-[10px] font-black uppercase text-rose-400 hover:underline">View Assignments</Link>
                                    </div>
                                </div>
                            )}

                            {pendingFees.length > 0 && (
                                <div className="p-4 rounded-md bg-amber-500/10 border border-amber-500/20 flex gap-4">
                                    <div className="p-2 h-fit rounded-md bg-amber-500/20">
                                        <AlertCircle size={18} className="text-amber-500" />
                                    </div>
                                    <div>
                                        <h4 className="text-sm font-bold text-white mb-1">Fee Payment Pending</h4>
                                        <p className="text-xs text-slate-400 leading-relaxed">
                                            {pendingFees.length} fee payment{pendingFees.length > 1 ? 's' : ''} pending or overdue.
                                        </p>
                                        <Link to="/student/fees" className="mt-3 inline-block text-[10px] font-black uppercase text-amber-500 hover:underline">Pay Now</Link>
                                    </div>
                                </div>
                            )}

                            {upcomingExams.slice(0, 1).map(exam => {
                                const daysLeft = Math.ceil((new Date(exam.date) - new Date()) / 86400000);
                                if (daysLeft > 7) return null;
                                return (
                                    <div key={exam._id} className="p-4 rounded-md bg-brand-primary/10 border border-brand-primary/20 flex gap-4">
                                        <div className="p-2 h-fit rounded-md bg-brand-primary/20">
                                            <Clock size={18} className="text-brand-primary" />
                                        </div>
                                        <div>
                                            <h4 className="text-sm font-bold text-white mb-1">Exam Coming Up</h4>
                                            <p className="text-xs text-slate-400 leading-relaxed">
                                                {exam.subject?.name || exam.name} in {daysLeft} day{daysLeft !== 1 ? 's' : ''}.
                                            </p>
                                            <Link to="/student/exams" className="mt-3 inline-block text-[10px] font-black uppercase text-brand-primary hover:underline">View Schedule</Link>
                                        </div>
                                    </div>
                                );
                            })}

                            {pendingAssignments.length === 0 && pendingFees.length === 0 && upcomingExams.filter(e => Math.ceil((new Date(e.date) - new Date()) / 86400000) <= 7).length === 0 && (
                                <div className="flex flex-col items-center justify-center py-12 text-center opacity-40">
                                    <CheckCircle2 size={48} className="text-slate-500 mb-4" />
                                    <p className="text-sm font-medium text-slate-400">All caught up! No urgent alerts.</p>
                                </div>
                            )}
                        </div>
                    </motion.div>
                </div>
            </div>

            {/* ── Row 2: Score Chart + Activity Feed + Today's Classes ──── */}
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">

                {/* Score Performance Chart */}
                <ChartContainer title="Exam Score Performance" icon={BarChart2} delay={0.35} action={{ to: '/student/results', label: 'All Results' }}>
                    {scoreTrend.length > 0 ? (
                        <ResponsiveContainer width="100%" height={240}>
                            <BarChart data={scoreTrend}>
                                <XAxis dataKey="name" stroke="#475569" fontSize={10} axisLine={false} tickLine={false} />
                                <YAxis hide domain={[0, 100]} />
                                <Tooltip
                                    cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                                    contentStyle={{ backgroundColor: '#0f172a', border: 'none', borderRadius: '12px', fontSize: '12px' }}
                                    formatter={(v) => [`${v}%`, 'Score']}
                                />
                                <Bar dataKey="score" radius={[6, 6, 0, 0]} barSize={28}>
                                    {scoreTrend.map((entry, i) => (
                                        <Cell key={i} fill={entry.score >= 75 ? '#10b981' : entry.score >= 50 ? '#3b82f6' : '#f43f5e'} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    ) : (
                        <div className="flex flex-col items-center justify-center h-full opacity-30">
                            <Award size={48} className="mb-3" />
                            <p className="text-sm">No exam results yet</p>
                        </div>
                    )}
                </ChartContainer>

                {/* Today's Classes — activity feed style */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="bg-brand-surface/40 backdrop-blur-xl border border-brand-border/30 rounded-md p-8"
                >
                    <div className="flex items-center justify-between mb-8">
                        <div className="flex items-center gap-3">
                            <div className="p-2 rounded-md bg-brand-accent/10 border border-brand-accent/20">
                                <Calendar size={18} className="text-brand-accent" />
                            </div>
                            <h3 className="text-sm font-black uppercase tracking-[0.15em] text-slate-300 font-outfit">Today's Classes</h3>
                        </div>
                        <Link to="/student/timetable" className="text-[10px] font-black uppercase tracking-widest text-brand-accent flex items-center gap-1 hover:gap-2 transition-all">
                            Timetable <ChevronRight size={12} />
                        </Link>
                    </div>

                    <div className="space-y-5">
                        {todaySchedule.length > 0 ? todaySchedule.map((slot, i) => (
                            <div key={i} className="flex gap-4 group cursor-default">
                                <div className="relative">
                                    <div className="w-10 h-10 rounded-md bg-slate-800 border border-white/5 flex items-center justify-center flex-shrink-0 group-hover:border-brand-accent transition-colors">
                                        <BookMarked size={16} className="text-brand-accent" />
                                    </div>
                                    {i !== todaySchedule.length - 1 && (
                                        <div className="absolute top-10 left-1/2 -translate-x-1/2 w-0.5 h-5 bg-slate-800" />
                                    )}
                                </div>
                                <div className="flex-1">
                                    <div className="flex items-center justify-between mb-0.5">
                                        <p className="text-xs font-black text-white group-hover:text-brand-accent transition-colors">
                                            {slot.subject?.name || slot.subjectName || 'Class'}
                                        </p>
                                        <span className="text-[10px] font-medium text-slate-500">{slot.startTime} – {slot.endTime}</span>
                                    </div>
                                    {slot.teacher && (
                                        <p className="text-[11px] text-slate-400">{slot.teacher?.firstName} {slot.teacher?.lastName}</p>
                                    )}
                                </div>
                            </div>
                        )) : (
                            <div className="py-12 text-center opacity-30 flex flex-col items-center">
                                <Calendar size={32} className="mb-2" />
                                <p className="text-xs">No classes scheduled today</p>
                            </div>
                        )}
                    </div>
                </motion.div>

                {/* School Feed — calendar widget style */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.45 }}
                    className="bg-brand-surface/40 backdrop-blur-xl border border-brand-border/30 rounded-md p-8"
                >
                    <div className="flex items-center justify-between mb-8">
                        <div className="flex items-center gap-3">
                            <div className="p-2 rounded-md bg-orange-500/10 border border-orange-500/20">
                                <Bell size={18} className="text-orange-500" />
                            </div>
                            <h3 className="text-sm font-black uppercase tracking-[0.15em] text-slate-300 font-outfit">School Feed</h3>
                        </div>
                        <Link to="/student/announcements" className="text-[10px] font-black uppercase tracking-widest text-orange-400 flex items-center gap-1 hover:gap-2 transition-all">
                            View All <ChevronRight size={12} />
                        </Link>
                    </div>

                    <div className="space-y-4">
                        {unifiedFeed.length > 0 ? unifiedFeed.map((note, i) => (
                            <div key={note._id || i} className="flex gap-4 p-4 rounded-md bg-white/5 border border-white/5 hover:bg-white/[0.08] transition-colors group cursor-pointer">
                                <div className="flex flex-col items-center justify-center h-12 w-12 rounded-md bg-slate-900 border border-white/5 flex-shrink-0 group-hover:border-orange-500/30 transition-colors">
                                    <span className="text-[8px] font-black uppercase text-slate-500">{new Date(note.createdAt).toLocaleString('default', { month: 'short' })}</span>
                                    <span className="text-lg font-black text-white leading-none">{new Date(note.createdAt).getDate()}</span>
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h4 className="text-xs font-bold text-white mb-1 truncate group-hover:text-orange-400 transition-colors">{note.subject}</h4>
                                    <div className="flex items-center gap-2">
                                        <span className={`px-1.5 py-0.5 rounded-md text-[8px] font-black uppercase ${note.type === 'Notice' ? 'bg-brand-primary/20 text-brand-primary' : 'bg-emerald-500/20 text-emerald-400'}`}>
                                            {note.type || 'Notice'}
                                        </span>
                                        <span className="text-[10px] text-slate-500 truncate">{note.content?.slice(0, 40)}...</span>
                                    </div>
                                </div>
                            </div>
                        )) : (
                            <div className="py-12 text-center opacity-30 flex flex-col items-center">
                                <Bell size={32} className="mb-2" />
                                <p className="text-xs">No announcements</p>
                            </div>
                        )}
                    </div>
                </motion.div>
            </div>

            {/* ── Row 3: Score Line Chart + Assignments + Growth Card ─────── */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                    <ChartContainer title="Subject Score Breakdown" icon={TrendingUp} delay={0.5} action={{ to: '/student/results', label: 'All Results' }}>
                        {scoreTrend.length > 0 ? (
                            <ResponsiveContainer width="100%" height={240}>
                                <LineChart data={scoreTrend}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                                    <XAxis dataKey="name" stroke="#475569" fontSize={10} axisLine={false} tickLine={false} />
                                    <YAxis stroke="#475569" fontSize={10} domain={[0, 100]} />
                                    <Tooltip
                                        contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '12px' }}
                                        formatter={(v) => [`${v}%`, 'Score']}
                                    />
                                    <Line
                                        type="monotone"
                                        dataKey="score"
                                        stroke="#58a6ff"
                                        strokeWidth={4}
                                        dot={{ r: 6, fill: '#58a6ff', strokeWidth: 0 }}
                                        activeDot={{ r: 8, strokeWidth: 0 }}
                                        animationDuration={1500}
                                    />
                                </LineChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="flex flex-col items-center justify-center h-full opacity-30">
                                <TrendingUp size={48} className="mb-3" />
                                <p className="text-sm">No score data</p>
                            </div>
                        )}
                    </ChartContainer>
                </div>

                {/* Growth / Insight card — exact school admin style */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.55 }}
                    className="bg-brand-surface/40 backdrop-blur-xl border border-brand-border/30 rounded-md p-8 flex flex-col items-center justify-center text-center overflow-hidden relative group"
                >
                    <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity">
                        <TrendingUp size={120} />
                    </div>
                    <div className="p-4 rounded-md bg-brand-primary/10 border border-brand-primary/20 mb-6">
                        <ArrowRight size={32} className="text-brand-primary" />
                    </div>
                    <h3 className="text-xl font-black text-white mb-2 font-outfit uppercase tracking-tighter">Academic Insights</h3>
                    <p className="text-sm text-slate-400 mb-8 max-w-[200px] leading-relaxed">
                        {avgScore
                            ? `Your current average is ${avgScore}%. ${parseFloat(avgScore) >= 75 ? 'Great work, keep it up!' : 'Focus on weaker subjects to improve.'}`
                            : 'No exam results yet for this session.'}
                    </p>
                    <Link
                        to="/student/results"
                        className="px-8 py-3 rounded-md bg-brand-primary hover:bg-blue-400 text-white text-xs font-black uppercase tracking-widest transition-all shadow-lg shadow-brand-primary/20 active:scale-95 inline-block text-center"
                    >
                        View Report Card
                    </Link>
                </motion.div>
            </div>

            {/* ── Upcoming Exams ────────────────────────────────────────────── */}
            {upcomingExams.length > 0 && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 }}
                    className="bg-brand-surface/40 backdrop-blur-xl border border-brand-border/30 rounded-md p-8"
                >
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-3">
                            <div className="p-2 rounded-md bg-rose-500/10 border border-rose-500/20">
                                <GraduationCap size={18} className="text-rose-400" />
                            </div>
                            <h3 className="text-sm font-black uppercase tracking-[0.15em] text-slate-300 font-outfit">Upcoming Exams</h3>
                        </div>
                        <Link to="/student/exams" className="text-[10px] font-black uppercase tracking-widest text-rose-400 flex items-center gap-1 hover:gap-2 transition-all">
                            All Exams <ChevronRight size={12} />
                        </Link>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                        {upcomingExams.slice(0, 4).map((exam, i) => {
                            const daysLeft = Math.ceil((new Date(exam.date) - new Date()) / 86400000);
                            return (
                                <motion.div
                                    key={exam._id || i}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.05 * i }}
                                    className="flex gap-4 p-4 rounded-md bg-white/5 border border-white/5 hover:bg-white/[0.08] hover:border-rose-500/20 transition-all group"
                                >
                                    <div className="flex flex-col items-center justify-center h-12 w-12 rounded-md bg-slate-900 border border-white/5 flex-shrink-0 group-hover:border-rose-500/30 transition-colors">
                                        <span className="text-[8px] font-black uppercase text-slate-500">{format(new Date(exam.date), 'MMM')}</span>
                                        <span className="text-lg font-black text-white leading-none">{format(new Date(exam.date), 'dd')}</span>
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h4 className="text-xs font-bold text-white mb-1 truncate group-hover:text-rose-400 transition-colors">
                                            {exam.subject?.name || exam.name}
                                        </h4>
                                        <div className="flex items-center gap-2">
                                            <span className={`px-1.5 py-0.5 rounded-md text-[8px] font-black uppercase ${daysLeft <= 3 ? 'bg-rose-500/20 text-rose-400' : 'bg-brand-primary/20 text-brand-primary'}`}>
                                                {daysLeft === 0 ? 'Today' : daysLeft === 1 ? 'Tomorrow' : `${daysLeft}d left`}
                                            </span>
                                            <span className="text-[9px] text-slate-500 uppercase">{exam.type?.replace('_', ' ')}</span>
                                        </div>
                                    </div>
                                </motion.div>
                            );
                        })}
                    </div>
                </motion.div>
            )}

            {/* ── Quick Access — identical to school admin quick actions ── */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.65 }}
                className="bg-brand-surface/40 backdrop-blur-xl border border-brand-border/30 rounded-md p-8"
            >
                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 mb-6 font-outfit text-center">Quick Access</p>
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                    {[
                        { label: 'Attendance', icon: ClipboardList, href: '/student/attendance', color: 'bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500 hover:text-white' },
                        { label: 'Results', icon: Award, href: '/student/results', color: 'bg-brand-primary/10 text-brand-primary hover:bg-brand-primary hover:text-white' },
                        { label: 'Timetable', icon: Calendar, href: '/student/timetable', color: 'bg-violet-500/10 text-violet-500 hover:bg-violet-500 hover:text-white' },
                        { label: 'Assignments', icon: FileText, href: '/student/assignments', color: 'bg-rose-500/10 text-rose-500 hover:bg-rose-500 hover:text-white' },
                        { label: 'Fees', icon: CreditCard, href: '/student/fees', color: 'bg-amber-500/10 text-amber-500 hover:bg-amber-500 hover:text-white' },
                        { label: 'Library', icon: BookOpen, href: '/student/library', color: 'bg-slate-500/10 text-slate-400 hover:bg-slate-500 hover:text-white' },
                    ].map(({ label, href, icon: Icon, color }) => (
                        <Link
                            to={href}
                            key={label}
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

export default StudentDashboard;
