import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import { BookOpen, Users, ClipboardList, Activity, ArrowRight, Loader2, Clock, AlertCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { fetchDashboard } from '../../redux/slice/teacher.slice';

const TeacherDashboard = () => {
    const dispatch = useDispatch();
    const { user } = useSelector((state) => state.auth);
    const { dashboard, loading } = useSelector((state) => state.teacher);

    useEffect(() => {
        dispatch(fetchDashboard());
    }, [dispatch]);

    if (loading && !dashboard) {
        return (
            <div className="h-[60vh] flex flex-col items-center justify-center gap-6">
                <Loader2 className="w-12 h-12 text-brand-primary animate-spin opacity-50" />
                <p className="text-slate-500 font-black uppercase tracking-[0.4em] text-xs animate-pulse">Loading Dashboard Data</p>
            </div>
        );
    }

    const stats = dashboard?.stats || { classes: 0, students: 0, attendance: 0, assignments: 0 };
    const quickStats = [
        { label: 'Class Sections', value: stats.classes?.toString().padStart(2, '0') || '00', icon: BookOpen, color: 'text-brand-primary' },
        { label: 'Total Students', value: stats.students?.toString() || '0', icon: Users, color: 'text-brand-secondary' },
        { label: 'Avg Attendance', value: `${stats.attendance || 0}%`, icon: ClipboardList, color: 'text-luxury-emerald' },
        { label: 'Homework Set', value: stats.assignments?.toString() || '0', icon: Activity, color: 'text-brand-accent' },
        { label: 'Pending Tasks', value: stats.upcomingDeadlines?.toString().padStart(2, '0') || '00', icon: Clock, color: 'text-luxury-rose' },
    ];

    return (
        <div className="space-y-12">
            <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                    <h1 className="text-4xl text-left font-black text-white italic uppercase tracking-tighter leading-none mb-4 font-outfit">Namaste, {user?.firstName}</h1>
                    <p className="text-slate-400 font-medium text-lg leading-relaxed max-w-xl">
                        Overview of your Class Responsibilities & Academic Schedule.
                    </p>
                </div>
                <div className="flex gap-4">
                    <div className="bg-brand-surface/60 border border-brand-border/80 p-6 rounded-md min-w-[200px] shadow-2xl">
                        <p className="text-[10px] font-black uppercase tracking-[0.25em] text-slate-500 mb-2">Academic Session</p>
                        <div className="flex items-center gap-3">
                            <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_15px_rgba(16,185,129,0.5)]"></div>
                            <span className="text-xl font-black uppercase text-white font-outfit tracking-wider">Session 2026-27</span>
                        </div>
                    </div>
                </div>
            </header>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                {quickStats.map((stat, idx) => (
                    <motion.div
                        key={stat.label}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.05 }}
                        className="bg-brand-surface/40 border border-brand-border/80 p-8 rounded-md relative group hover:border-brand-primary/40 transition-all shadow-xl backdrop-blur-sm"
                    >
                        <stat.icon size={26} className={`${stat.color} mb-6 opacity-70 group-hover:opacity-100 transition-opacity`} />
                        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 mb-2 font-outfit">{stat.label}</p>
                        <p className="text-3xl font-black text-white font-outfit tracking-tighter">{stat.value}</p>
                        <div className="absolute top-8 right-8 w-2 h-2 rounded-full bg-brand-surface group-hover:bg-brand-primary transition-colors"></div>
                    </motion.div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-8">
                    <div className="flex items-center justify-between px-2">
                        <h3 className="text-xs font-black uppercase tracking-[0.4em] text-slate-500 font-outfit italic">Assigned Class Sections</h3>
                        <Link to="/teacher/classes" className="text-[10px] font-black uppercase tracking-widest text-brand-primary flex items-center gap-2 group italic hover:translate-x-1 transition-all">View All Sections <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" /> </Link>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {dashboard?.classesGrid?.map((item, idx) => (
                            <motion.div
                                key={item.id}
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: idx * 0.1 }}
                                className="bg-gradient-to-br from-brand-surface via-brand-surface to-brand-primary/10 p-8 rounded-md border border-brand-border/80 shadow-2xl relative overflow-hidden group hover:border-brand-primary/30 transition-all"
                            >
                                <div className="absolute -top-10 -right-10 w-32 h-32 bg-brand-primary/20 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
                                <div className="flex items-start justify-between mb-8">
                                    <div className="w-14 h-14 rounded-md bg-brand-surface/80 border border-brand-border/50 flex items-center justify-center font-black text-2xl text-brand-primary font-outfit italic shadow-xl group-hover:scale-110 transition-transform">
                                        {item.section.charAt(0)}
                                    </div>
                                    <span className="text-[10px] bg-brand-primary/10 text-brand-primary px-4 py-1.5 rounded-full font-black uppercase tracking-widest border border-brand-primary/20 italic">
                                        Assigned
                                    </span>
                                </div>
                                <h4 className="text-2xl font-black text-white italic tracking-tighter uppercase font-outfit mb-3">Class {item.standard}</h4>
                                <div className="flex items-center gap-3 mb-10">
                                    <div className="w-1.5 h-1.5 rounded-full bg-slate-600"></div>
                                    <p className="text-slate-400 text-xs font-black uppercase tracking-widest italic">Section {item.section}</p>
                                    <div className="w-1.5 h-1.5 rounded-full bg-slate-600"></div>
                                    <p className="text-slate-500 text-xs font-bold uppercase tracking-widest">{item.students} Students</p>
                                </div>
                                <div className="flex items-center gap-4">
                                    <Link to={`/teacher/attendance`} className="flex-1 py-4 text-center bg-brand-primary hover:bg-teacher-primary rounded-md text-[10px] font-black uppercase text-white tracking-[0.2em] transition-all shadow-xl active:scale-95">Daily Attendance</Link>
                                    <Link to={`/teacher/classes`} className="flex-1 py-4 text-center bg-brand-surface/80 hover:bg-brand-surface rounded-md text-[10px] font-black uppercase tracking-[0.2em] transition-all border border-brand-border/50 active:scale-95 text-slate-300">Exam Marks</Link>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>

                <div className="space-y-8">
                    <h3 className="text-xs font-black uppercase tracking-[0.4em] text-slate-500 font-outfit px-2 italic">Important Notifications</h3>
                    <div className="bg-brand-surface/60 backdrop-blur-xl border border-luxury-rose/20 p-8 rounded-md shadow-2xl space-y-6">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-2 h-2 rounded-full bg-luxury-rose animate-pulse shadow-glow"></div>
                            <span className="text-[11px] font-black uppercase text-luxury-rose tracking-[0.3em] italic font-outfit">Priority Matters</span>
                        </div>
                        {dashboard?.alerts?.length > 0 ? (
                            dashboard.alerts.map((alert) => (
                                <div key={alert.id} className="p-4 bg-luxury-rose/5 border border-luxury-rose/10 rounded-md flex items-center justify-between group hover:bg-luxury-rose/10 transition-all">
                                    <div className="flex items-center gap-3">
                                        <AlertCircle size={14} className="text-luxury-rose" />
                                        <p className="text-[10px] font-black text-white uppercase tracking-tight">{alert.title}</p>
                                    </div>
                                    <span className="text-[8px] font-black text-slate-500 uppercase italic">due {new Date(alert.due).toLocaleTimeString('en-IN', {hour: '2-digit', minute:'2-digit'})}</span>
                                </div>
                            ))
                        ) : (
                            <p className="text-[10px] font-black text-slate-700 uppercase tracking-widest text-center py-6 italic">No pending alerts</p>
                        )}
                    </div>

                    <h3 className="text-xs font-black uppercase tracking-[0.4em] text-slate-500 font-outfit px-2 italic">Homework Tracking</h3>
                    <div className="bg-brand-surface/60 backdrop-blur-xl border border-brand-border/80 p-8 rounded-md shadow-2xl h-full flex flex-col">
                        <div className="flex items-center gap-3 mb-10">
                            <div className="w-2 h-2 rounded-full bg-brand-primary animate-ping"></div>
                            <span className="text-[11px] font-black uppercase text-slate-400 tracking-[0.3em] italic font-outfit">Recent Submissions</span>
                        </div>
                        <div className="space-y-6 flex-1">
                            {dashboard?.recentAssignments?.length > 0 ? (
                                dashboard.recentAssignments.map((a, idx) => (
                                    <div key={a.id} className="p-6 bg-brand-surface/40 rounded-md border border-brand-border/30 hover:border-brand-primary/40 transition-all cursor-pointer group shadow-lg">
                                        <div className="flex items-center justify-between mb-3">
                                            <p className="text-[9px] font-black text-brand-primary uppercase tracking-[0.3em] font-outfit italic">{a.subject}</p>
                                            <span className="text-[9px] font-black text-emerald-500 bg-emerald-500/10 px-3 py-1 rounded-full uppercase tracking-widest">{a.submissions} SUBMITTED</span>
                                        </div>
                                        <p className="text-sm font-black text-slate-100 mb-2 group-hover:text-white transition-colors tracking-tight uppercase leading-tight">{a.title}</p>
                                        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest italic">Due: {new Date(a.dueDate).toLocaleDateString('en-IN')}</p>
                                    </div>
                                ))
                            ) : (
                                <div className="text-center py-20 opacity-30 italic">
                                    <Activity className="w-12 h-12 mx-auto mb-4" />
                                    <p className="text-[10px] font-black uppercase tracking-widest whitespace-nowrap">No Recent Homework</p>
                                </div>
                            )}
                        </div>
                        <Link to="/teacher/assignments" className="w-full mt-10 py-5 bg-brand-surface/80 hover:bg-brand-primary rounded-md text-[10px] font-black hover:text-white transition-all border border-brand-border/50 flex items-center justify-center gap-4 text-slate-400 uppercase tracking-[0.3em] shadow-2xl">
                            All Assignments <ArrowRight size={14} />
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TeacherDashboard;
