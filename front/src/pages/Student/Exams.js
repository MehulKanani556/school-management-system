import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { fetchStudentExams, fetchStudentResults } from '../../redux/slice/student.slice';
import { motion, AnimatePresence } from 'framer-motion';
import {
    BookOpen, Calendar, Clock, MapPin, Award,
    ChevronRight, Zap, Target, TrendingUp, Filter,
    CheckCircle2, AlertCircle, GraduationCap, ArrowRight,
    Star, Trophy, BookMarked, Layers,
} from 'lucide-react';

/* ─── tiny helpers ─────────────────────────────────────────── */
const isUpcoming = (date) => new Date(date) > new Date();

const fmtDate = (d) =>
    new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });

const scoreColor = (pct) => {
    if (pct >= 75) return { text: 'text-emerald-400', bg: 'bg-emerald-400', bar: 'from-emerald-500 to-teal-400' };
    if (pct >= 50) return { text: 'text-amber-400',   bg: 'bg-amber-400',   bar: 'from-amber-500 to-yellow-400' };
    return            { text: 'text-rose-400',         bg: 'bg-rose-400',    bar: 'from-rose-500 to-pink-400' };
};

/* ─── score arc (SVG) ───────────────────────────────────────── */
const ScoreArc = ({ pct }) => {
    const r = 28;
    const circ = 2 * Math.PI * r;
    const dash = (pct / 100) * circ;
    const col = scoreColor(pct);
    return (
        <div className="relative w-20 h-20 flex items-center justify-center">
            <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 72 72">
                <circle cx="36" cy="36" r={r} fill="none" stroke="#1e293b" strokeWidth="5" />
                <circle
                    cx="36" cy="36" r={r}
                    fill="none"
                    stroke="url(#arcGrad)"
                    strokeWidth="5"
                    strokeLinecap="round"
                    strokeDasharray={`${dash} ${circ}`}
                />
                <defs>
                    <linearGradient id="arcGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor={col.bg.replace('bg-', '#').replace('emerald-400','10b981').replace('amber-400','f59e0b').replace('rose-400','f43f5e')} />
                        <stop offset="100%" stopColor={col.bg.replace('bg-', '#').replace('emerald-400','2dd4bf').replace('amber-400','facc15').replace('rose-400','fb7185')} />
                    </linearGradient>
                </defs>
            </svg>
            <span className={`text-[13px] font-black ${col.text}`}>{pct}%</span>
        </div>
    );
};

/* ─── Stat Pill ─────────────────────────────────────────────── */
const StatPill = ({ icon: Icon, label, value, accent }) => (
    <div className={`flex items-center gap-3 px-5 py-3 rounded-xl border ${accent} bg-slate-950/60 backdrop-blur-sm`}>
        <Icon size={16} className="opacity-70 shrink-0" />
        <div>
            <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest leading-none mb-0.5">{label}</p>
            <p className="text-sm font-black text-white leading-none">{value}</p>
        </div>
    </div>
);

/* ─── Exam Card ─────────────────────────────────────────────── */
const ExamCard = ({ exam, result, idx, navigate }) => {
    const upcoming = isUpcoming(exam.date);
    const hasResult = !!result;
    const pct = hasResult ? Math.round((result.marksObtained / (exam.maxMarks || 100)) * 100) : null;
    const sc = pct !== null ? scoreColor(pct) : null;

    // status config
    const status = hasResult
        ? { label: 'Result Declared', dot: 'bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.7)]', text: 'text-emerald-400', border: 'border-emerald-500/20', glow: 'hover:shadow-[0_8px_40px_rgba(16,185,129,0.12)]' }
        : upcoming
            ? { label: 'Upcoming', dot: 'bg-sky-400 shadow-[0_0_8px_rgba(56,189,248,0.7)]',    text: 'text-sky-400',     border: 'border-sky-500/20',     glow: 'hover:shadow-[0_8px_40px_rgba(14,165,233,0.12)]' }
            : { label: 'Past Exam', dot: 'bg-slate-500',                                         text: 'text-slate-400',   border: 'border-slate-700/40',   glow: 'hover:shadow-[0_8px_40px_rgba(100,116,139,0.08)]' };

    return (
        <motion.article
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.07, duration: 0.45, ease: 'easeOut' }}
            className={`group relative bg-[#0c0c0f] border ${status.border} rounded-2xl overflow-hidden transition-all duration-500 ${status.glow} hover:-translate-y-0.5`}
        >
            {/* top accent line */}
            <div className={`h-[2px] w-full bg-gradient-to-r ${hasResult ? 'from-emerald-500 via-teal-400 to-transparent' : upcoming ? 'from-sky-500 via-blue-400 to-transparent' : 'from-slate-600 via-slate-700 to-transparent'}`} />

            {/* subtle bg glow */}
            <div className={`absolute top-0 right-0 w-72 h-72 rounded-full blur-[120px] pointer-events-none transition-opacity duration-700 opacity-0 group-hover:opacity-100 ${hasResult ? 'bg-emerald-500/8' : upcoming ? 'bg-sky-500/8' : 'bg-slate-500/5'}`} />

            <div className="relative z-10 p-6">
                {/* ── Row 1: status + type badge ── */}
                <div className="flex items-center justify-between mb-5">
                    <div className="flex items-center gap-2">
                        <span className={`w-2 h-2 rounded-full ${status.dot} shrink-0`} />
                        <span className={`text-[10px] font-bold uppercase tracking-[0.2em] ${status.text}`}>{status.label}</span>
                    </div>
                    <span className="px-3 py-1 text-[9px] font-black uppercase tracking-widest bg-slate-900 border border-slate-800 text-slate-400 rounded-full">
                        {exam.type?.replace(/_/g, ' ') || 'Exam'}
                    </span>
                </div>

                {/* ── Row 2: title + arc (if result) ── */}
                <div className="flex items-start justify-between gap-4 mb-5">
                    <div className="flex-1 min-w-0">
                        <h3 className="text-2xl font-black text-white leading-tight tracking-tight mb-1.5 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-white group-hover:to-slate-400 transition-all duration-500">
                            {exam.name}
                        </h3>
                        <div className="flex items-center gap-2 text-slate-400">
                            <BookMarked size={13} className={hasResult ? 'text-emerald-500' : upcoming ? 'text-sky-500' : 'text-slate-600'} />
                            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">{exam.subject?.name || 'General Subject'}</span>
                        </div>
                    </div>
                    {hasResult && pct !== null && <ScoreArc pct={pct} />}
                </div>

                {/* ── Row 3: 4-metric strip ── */}
                <div className="grid grid-cols-4 gap-2 mb-5">
                    {[
                        { icon: Calendar, label: 'Date',      val: fmtDate(exam.date) },
                        { icon: Clock,    label: 'Time',      val: exam.startTime || '09:00 AM' },
                        { icon: MapPin,   label: 'Room',      val: exam.roomNo || 'Exam Hall' },
                        { icon: Target,   label: 'Max Marks', val: `${exam.maxMarks || 100}` },
                    ].map(({ icon: I, label, val }) => (
                        <div key={label} className="bg-slate-950/60 border border-slate-800/60 rounded-xl p-3 text-center group/m hover:border-slate-700 transition-colors">
                            <I size={13} className="mx-auto mb-1.5 text-slate-600 group-hover/m:text-slate-400 transition-colors" />
                            <p className="text-[8px] font-bold text-slate-600 uppercase tracking-widest mb-0.5">{label}</p>
                            <p className="text-[10px] font-black text-slate-300 leading-tight">{val}</p>
                        </div>
                    ))}
                </div>

                {/* ── Row 4: score bar OR CTA ── */}
                {hasResult ? (
                    <div className="bg-slate-950/40 border border-slate-800/50 rounded-xl p-4">
                        <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                                <Trophy size={14} className="text-amber-400" />
                                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Score</span>
                            </div>
                            <span className={`text-lg font-black ${sc?.text}`}>
                                {result.marksObtained}
                                <span className="text-slate-600 text-xs font-bold ml-1">/ {exam.maxMarks || 100}</span>
                            </span>
                        </div>
                        {/* progress bar */}
                        <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
                            <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${pct}%` }}
                                transition={{ delay: 0.3 + idx * 0.07, duration: 0.8, ease: 'easeOut' }}
                                className={`h-full rounded-full bg-gradient-to-r ${sc?.bar}`}
                            />
                        </div>
                        <p className={`text-[9px] font-bold uppercase tracking-widest mt-1.5 ${sc?.text}`}>
                            {pct >= 75 ? 'Excellent Performance' : pct >= 50 ? 'Good — Keep It Up' : 'Needs Improvement'}
                        </p>
                    </div>
                ) : (
                    <button
                        onClick={() => navigate('/student/e-learning')}
                        className={`w-full flex items-center justify-between px-5 py-3.5 rounded-xl border transition-all duration-400 group/btn ${
                            upcoming
                                ? 'bg-sky-500/8 border-sky-500/20 hover:bg-sky-500/15 hover:border-sky-400/40'
                                : 'bg-slate-900/60 border-slate-800 hover:bg-slate-900 hover:border-slate-700'
                        }`}
                    >
                        <div className="flex items-center gap-2.5">
                            <div className={`p-1.5 rounded-lg ${upcoming ? 'bg-sky-500/15 text-sky-400' : 'bg-slate-800 text-slate-500'}`}>
                                <GraduationCap size={14} />
                            </div>
                            <span className={`text-[10px] font-black uppercase tracking-widest ${upcoming ? 'text-sky-400' : 'text-slate-500'}`}>
                                {upcoming ? 'Start Preparation' : 'Study Materials'}
                            </span>
                        </div>
                        <ArrowRight size={14} className={`transition-transform group-hover/btn:translate-x-1 ${upcoming ? 'text-sky-400' : 'text-slate-600'}`} />
                    </button>
                )}
            </div>
        </motion.article>
    );
};

/* ─── Main Page ─────────────────────────────────────────────── */
const TABS = ['All', 'Upcoming', 'Past', 'Results'];

const Exams = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { exams, results, loading } = useSelector((state) => state.student);
    const [activeTab, setActiveTab] = useState('All');

    useEffect(() => {
        dispatch(fetchStudentExams());
        dispatch(fetchStudentResults());
    }, [dispatch]);

    // derived stats
    const upcomingCount = exams.filter(e => isUpcoming(e.date)).length;
    const resultCount   = results?.length || 0;
    const avgScore      = resultCount > 0
        ? Math.round(results.reduce((s, r) => {
            const ex = exams.find(e => e._id === r.examId?._id);
            return s + (r.marksObtained / (ex?.maxMarks || 100)) * 100;
          }, 0) / resultCount)
        : null;

    // filter
    const filtered = exams.filter(e => {
        const res = results?.find(r => r.examId?._id === e._id);
        if (activeTab === 'Upcoming') return isUpcoming(e.date) && !res;
        if (activeTab === 'Past')     return !isUpcoming(e.date) && !res;
        if (activeTab === 'Results')  return !!res;
        return true;
    });

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="max-w-7xl mx-auto space-y-8 pb-20"
        >
            {/* ── Hero Header ── */}
            <div className="relative overflow-hidden bg-[#0c0c0f] border border-slate-800/60 rounded-2xl p-8 md:p-10">
                {/* bg decoration */}
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                    <div className="absolute -top-24 -right-24 w-72 h-72 bg-emerald-500/6 rounded-full blur-[100px]" />
                    <div className="absolute -bottom-16 -left-16 w-56 h-56 bg-sky-500/5 rounded-full blur-[80px]" />
                    {/* grid lines */}
                    <div className="absolute inset-0" style={{
                        backgroundImage: 'linear-gradient(rgba(255,255,255,0.02) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.02) 1px,transparent 1px)',
                        backgroundSize: '48px 48px',
                    }} />
                </div>

                <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-8">
                    <div className="space-y-4">
                        {/* eyebrow */}
                        <div className="flex items-center gap-3">
                            <div className="flex items-center gap-1.5 px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-full">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                                <span className="text-[10px] font-black text-emerald-400 uppercase tracking-[0.3em]">Academic Calendar</span>
                            </div>
                        </div>

                        <h1 className="text-4xl md:text-5xl font-black text-white leading-tight tracking-tight">
                            Exams <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-300">&amp; Assessments</span>
                        </h1>
                        <p className="text-slate-400 text-base max-w-xl leading-relaxed">
                            Track your upcoming exams, review schedules, and monitor your academic performance across all assessments.
                        </p>
                    </div>

                    {/* stat pills */}
                    <div className="flex flex-wrap gap-3">
                        <StatPill icon={Zap}        label="Upcoming"  value={upcomingCount}     accent="border-sky-800/50 text-sky-400" />
                        <StatPill icon={CheckCircle2} label="Results"  value={resultCount}       accent="border-emerald-800/50 text-emerald-400" />
                        {avgScore !== null && (
                            <StatPill icon={TrendingUp} label="Avg Score" value={`${avgScore}%`} accent="border-amber-800/50 text-amber-400" />
                        )}
                        <StatPill icon={Layers}      label="Total"     value={exams.length}      accent="border-slate-700 text-slate-400" />
                    </div>
                </div>
            </div>

            {/* ── Filter Tabs ── */}
            <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
                <div className="flex items-center gap-1 p-1 bg-[#0c0c0f] border border-slate-800/60 rounded-xl">
                    {TABS.map(tab => {
                        const count = tab === 'All'      ? exams.length
                                    : tab === 'Upcoming' ? exams.filter(e => isUpcoming(e.date) && !results?.find(r => r.examId?._id === e._id)).length
                                    : tab === 'Past'     ? exams.filter(e => !isUpcoming(e.date) && !results?.find(r => r.examId?._id === e._id)).length
                                    :                      resultCount;
                        const active = activeTab === tab;
                        return (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                className={`relative flex items-center gap-2 px-5 py-2.5 rounded-lg text-[11px] font-black uppercase tracking-widest transition-all duration-300 whitespace-nowrap ${
                                    active
                                        ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/25'
                                        : 'text-slate-500 hover:text-slate-300 border border-transparent'
                                }`}
                            >
                                {tab}
                                <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-black ${active ? 'bg-emerald-500/20 text-emerald-300' : 'bg-slate-800 text-slate-500'}`}>
                                    {count}
                                </span>
                            </button>
                        );
                    })}
                </div>

                <div className="ml-auto flex items-center gap-2 shrink-0">
                    <Filter size={14} className="text-slate-600" />
                    <span className="text-[10px] text-slate-600 font-bold uppercase tracking-widest">{filtered.length} shown</span>
                </div>
            </div>

            {/* ── Cards Grid ── */}
            <AnimatePresence mode="wait">
                {loading ? (
                    /* skeleton */
                    <motion.div key="skeleton" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                        {[1,2,3].map(i => (
                            <div key={i} className="bg-[#0c0c0f] border border-slate-800/60 rounded-2xl p-6 space-y-4 animate-pulse">
                                <div className="flex justify-between">
                                    <div className="h-3 w-24 bg-slate-800 rounded-full" />
                                    <div className="h-3 w-16 bg-slate-800 rounded-full" />
                                </div>
                                <div className="h-7 w-3/4 bg-slate-800 rounded-lg" />
                                <div className="h-3 w-1/2 bg-slate-800 rounded-full" />
                                <div className="grid grid-cols-4 gap-2">
                                    {[1,2,3,4].map(j => <div key={j} className="h-14 bg-slate-800 rounded-xl" />)}
                                </div>
                                <div className="h-12 bg-slate-800 rounded-xl" />
                            </div>
                        ))}
                    </motion.div>
                ) : filtered.length > 0 ? (
                    <motion.div key="grid" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                        {filtered.map((exam, idx) => (
                            <ExamCard
                                key={exam._id}
                                exam={exam}
                                result={results?.find(r => r.examId?._id === exam._id)}
                                idx={idx}
                                navigate={navigate}
                            />
                        ))}
                    </motion.div>
                ) : (
                    <motion.div key="empty" initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
                        className="flex flex-col items-center justify-center py-32 bg-[#0c0c0f] border border-dashed border-slate-800/60 rounded-2xl text-center">
                        <div className="p-5 bg-slate-900/60 border border-slate-800 rounded-2xl mb-5 opacity-40">
                            <BookOpen size={40} className="text-slate-600" />
                        </div>
                        <h3 className="text-xl font-black text-slate-500 uppercase tracking-widest mb-2">No Exams Found</h3>
                        <p className="text-slate-700 text-xs font-semibold uppercase tracking-widest max-w-xs">
                            {activeTab === 'All' ? 'No exams have been scheduled yet. Check back later.' : `No ${activeTab.toLowerCase()} exams at the moment.`}
                        </p>
                        {activeTab !== 'All' && (
                            <button onClick={() => setActiveTab('All')}
                                className="mt-6 px-5 py-2.5 text-[10px] font-black uppercase tracking-widest text-emerald-400 border border-emerald-500/25 bg-emerald-500/10 rounded-xl hover:bg-emerald-500/15 transition-all">
                                View All Exams
                            </button>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
};

export default Exams;
