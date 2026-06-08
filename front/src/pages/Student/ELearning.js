import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import PortalModal from '../../components/PortalModal';
import {
    Brain, BookOpen, Play, CheckCircle, Clock, Award, Target,
    ChevronRight, RotateCcw, Download, X, Eye, MinusCircle,
    Calculator, Atom, Layers, Globe, Palette, Music, Zap,
    TrendingUp, Shield, Star, BarChart3, FileText, ArrowRight,
    CheckSquare, AlertTriangle, Sparkles
} from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchStudentQuizzes, submitQuizAttempt, fetchQuizHistory, fetchStudentResources } from '../../redux/slice/student.slice';
import { toast } from 'react-hot-toast';
import { BASE_URL } from '../../utils/BASE_URL';

/* ─── helpers ─────────────────────────────────────────────────────────────── */
const getSubjectColor = (subject) => {
    const s = (subject || '').toLowerCase();
    if (s.includes('math') || s.includes('calc') || s.includes('alg')) return { pill: 'bg-sky-500/15 text-sky-300 border-sky-500/30', glow: 'rgba(14,165,233,0.12)', accent: '#0ea5e9' };
    if (s.includes('sci') || s.includes('phys') || s.includes('chem') || s.includes('bio')) return { pill: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30', glow: 'rgba(16,185,129,0.12)', accent: '#10b981' };
    if (s.includes('hist') || s.includes('soc')) return { pill: 'bg-violet-500/15 text-violet-300 border-violet-500/30', glow: 'rgba(139,92,246,0.12)', accent: '#8b5cf6' };
    if (s.includes('eng') || s.includes('lang') || s.includes('lit')) return { pill: 'bg-indigo-500/15 text-indigo-300 border-indigo-500/30', glow: 'rgba(99,102,241,0.12)', accent: '#6366f1' };
    if (s.includes('art') || s.includes('mus')) return { pill: 'bg-pink-500/15 text-pink-300 border-pink-500/30', glow: 'rgba(236,72,153,0.12)', accent: '#ec4899' };
    return { pill: 'bg-brand-primary/15 text-brand-primary border-brand-primary/30', glow: 'rgba(88,166,255,0.12)', accent: '#58a6ff' };
};

const getSubjectIcon = (subject) => {
    const s = (subject || '').toLowerCase();
    if (s.includes('math') || s.includes('calc')) return <Calculator size={12} />;
    if (s.includes('sci') || s.includes('phys') || s.includes('chem') || s.includes('bio')) return <Atom size={12} />;
    if (s.includes('hist') || s.includes('soc')) return <Layers size={12} />;
    if (s.includes('geog') || s.includes('env')) return <Globe size={12} />;
    if (s.includes('eng') || s.includes('lit')) return <BookOpen size={12} />;
    if (s.includes('art')) return <Palette size={12} />;
    if (s.includes('mus')) return <Music size={12} />;
    return <Brain size={12} />;
};

/* ─── rank config ──────────────────────────────────────────────────────────── */
const RANKS = [
    { label: 'Beginner',     min: 0,  color: '#64748b', icon: <Star size={14} />,       bg: 'from-slate-500/20 to-slate-600/5' },
    { label: 'Standard',     min: 40, color: '#22d3ee', icon: <Zap size={14} />,        bg: 'from-cyan-500/20 to-cyan-600/5' },
    { label: 'Intermediate', min: 60, color: '#a3e635', icon: <TrendingUp size={14} />, bg: 'from-lime-500/20 to-lime-600/5' },
    { label: 'Advanced',     min: 75, color: '#fb923c', icon: <BarChart3 size={14} />,  bg: 'from-orange-500/20 to-orange-600/5' },
    { label: 'Expert',       min: 85, color: '#c084fc', icon: <Shield size={14} />,     bg: 'from-purple-500/20 to-purple-600/5' },
    { label: 'Elite',        min: 95, color: '#fbbf24', icon: <Sparkles size={14} />,   bg: 'from-yellow-500/20 to-yellow-600/5' },
];
const getRank = (pct) => [...RANKS].reverse().find(r => pct >= r.min) || RANKS[0];

/* ─── option letter labels ─────────────────────────────────────────────────── */
const OPTION_LABELS = ['A', 'B', 'C', 'D', 'E', 'F'];

/* ══════════════════════════════════════════════════════════════════════════════
   MAIN COMPONENT
══════════════════════════════════════════════════════════════════════════════ */
const ELearning = () => {
    const dispatch = useDispatch();
    const { quizzes, quizHistory, resources, loading } = useSelector(s => s.student);

    const [activeView, setActiveView] = useState('portal');
    const [selectedQuiz, setSelectedQuiz] = useState(null);
    const [currentQuestion, setCurrentQuestion] = useState(0);
    const [score, setScore] = useState(0);
    const [quizComplete, setQuizComplete] = useState(false);
    const [userAnswers, setUserAnswers] = useState({});
    const [timeLeft, setTimeLeft] = useState(null);
    const [pdfViewerUrl, setPdfViewerUrl] = useState(null);

    React.useEffect(() => {
        dispatch(fetchStudentQuizzes());
        dispatch(fetchQuizHistory());
        dispatch(fetchStudentResources());
    }, [dispatch]);

    /* ── quiz timer ─────────────────────────────────────────────────────────── */
    const submitQuiz = React.useCallback(() => {
        setQuizComplete(true);
        const answersPayload = Object.keys(userAnswers).map(qIdx => {
            const numIdx = parseInt(qIdx, 10);
            return { questionId: selectedQuiz.questions[numIdx]._id, selectedOption: userAnswers[numIdx] };
        });
        let localScore = 0;
        answersPayload.forEach(ans => {
            const q = selectedQuiz.questions.find(q => q._id === ans.questionId);
            if (q && q.correctAnswer === ans.selectedOption) localScore += (q.points || 10);
        });
        setScore(localScore);
        dispatch(submitQuizAttempt({ quizId: selectedQuiz._id, answers: answersPayload }))
            .then(res => { if (!res.error) { toast.success('Quiz submitted!'); dispatch(fetchQuizHistory()); } });
    }, [dispatch, selectedQuiz, userAnswers]);

    const handleTimeUp = React.useCallback(() => { submitQuiz(); toast.error('Time is up!'); }, [submitQuiz]);

    React.useEffect(() => {
        let timer;
        if (activeView === 'quiz' && !quizComplete && timeLeft > 0) timer = setInterval(() => setTimeLeft(p => p - 1), 1000);
        else if (activeView === 'quiz' && !quizComplete && timeLeft === 0) handleTimeUp();
        return () => clearInterval(timer);
    }, [activeView, quizComplete, timeLeft, handleTimeUp]);

    /* ── stats ──────────────────────────────────────────────────────────────── */
    const stats = React.useMemo(() => {
        if (!quizHistory?.length) return { acc: 0, attempts: 0, passed: 0, avgScore: 0, rank: RANKS[0], progress: 0 };
        const attempts = quizHistory.length;
        const passed = quizHistory.filter(a => a.status === 'Passed').length;
        const totalScore = quizHistory.reduce((s, a) => s + a.score, 0);
        const totalPossible = quizHistory.reduce((s, a) => s + a.totalPoints, 0);
        const acc = totalPossible > 0 ? (totalScore / totalPossible) * 100 : 0;
        return { acc, attempts, passed, avgScore: attempts > 0 ? totalScore / attempts : 0, rank: getRank(acc), progress: acc };
    }, [quizHistory]);

    /* ── quiz actions ───────────────────────────────────────────────────────── */
    const startQuiz = (quiz) => {
        if (!quiz.questions?.length) { toast.error('No questions available.'); return; }
        setSelectedQuiz(quiz); setActiveView('quiz');
        setCurrentQuestion(0); setScore(0);
        setQuizComplete(false); setUserAnswers({});
        setTimeLeft((quiz.duration || 30) * 60);
    };

    const handleAccessStream = (url) => {
        if (!url) return toast.error('File link not found.');
        const origin = BASE_URL.replace(/\/api\/?$/, '');
        const fullUrl = url.startsWith('http') ? url : `${origin}${url.startsWith('/') ? '' : '/'}${url}`;
        if (/\.pdf($|\?)/i.test(fullUrl)) setPdfViewerUrl(fullUrl);
        else window.open(fullUrl, '_blank');
    };

    /* ══════════════════════════════════════════════════════════════════════════
       RENDER
    ══════════════════════════════════════════════════════════════════════════ */
    return (
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
            className="font-outfit text-left w-full pb-20 space-y-8">

            {/* ── HEADER ──────────────────────────────────────────────────────── */}
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-5 pb-6 border-b border-slate-800/60">
                <div>
                    <div className="flex items-center gap-3 mb-2">
                        <div className="w-9 h-9 rounded-xl bg-brand-primary/10 border border-brand-primary/20 flex items-center justify-center">
                            <Brain size={18} className="text-brand-primary" />
                        </div>
                        <h1 className="text-3xl font-black text-white italic uppercase tracking-tighter leading-none flex items-center gap-2">
                            E-Learning Center
                            <span className="inline-block w-2 h-2 rounded-full bg-luxury-emerald animate-pulse mt-0.5" />
                        </h1>
                    </div>
                    <p className="text-slate-500 text-[11px] font-bold uppercase tracking-widest ml-12">
                        Quizzes · Study Materials · Progress Tracking
                    </p>
                </div>

                {/* TAB SWITCHER */}
                <div className="flex items-center bg-[#0a0c12] border border-slate-800/80 rounded-2xl p-1.5 gap-1 shadow-inner">
                    {[
                        { id: 'portal',  label: 'Quiz Portal',      icon: <Brain size={13} /> },
                        { id: 'study',   label: 'Study Materials',  icon: <BookOpen size={13} /> },
                        { id: 'history', label: 'Quiz History',     icon: <BarChart3 size={13} /> },
                    ].map(tab => (
                        <button key={tab.id} onClick={() => setActiveView(tab.id)}
                            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all duration-300 ${
                                activeView === tab.id
                                    ? 'bg-luxury-emerald text-black shadow-lg shadow-luxury-emerald/25'
                                    : 'text-slate-500 hover:text-white hover:bg-slate-800/50'
                            }`}>
                            {tab.icon} {tab.label}
                        </button>
                    ))}
                </div>
            </header>

            {/* ── VIEWS ───────────────────────────────────────────────────────── */}
            <AnimatePresence mode="wait">

                {/* ════════════════ PORTAL ════════════════ */}
                {activeView === 'portal' && (
                    <motion.div key="portal"
                        initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }}
                        className="grid grid-cols-1 lg:grid-cols-3 gap-7">

                        {/* ── SIDEBAR ─────────────────────────────────────────── */}
                        <div className="space-y-5">

                            {/* Rank / Accuracy Card */}
                            <div className={`relative overflow-hidden rounded-2xl border border-slate-800/60 bg-gradient-to-br ${stats.rank.bg} p-6`}>
                                <div className="absolute -right-6 -top-6 w-28 h-28 rounded-full blur-2xl opacity-30"
                                    style={{ background: stats.rank.color }} />
                                <div className="relative z-10">
                                    <div className="flex items-center justify-between mb-4">
                                        <span className="text-[9px] font-black uppercase tracking-[0.3em] text-slate-400">Learning Rank</span>
                                        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[9px] font-black border"
                                            style={{ color: stats.rank.color, borderColor: stats.rank.color + '40', background: stats.rank.color + '15' }}>
                                            {stats.rank.icon} {stats.rank.label}
                                        </div>
                                    </div>

                                    <div className="flex items-end gap-3 mb-5">
                                        <p className="text-5xl font-black text-white italic leading-none">
                                            {stats.attempts === 0 ? '—' : `${stats.acc.toFixed(0)}`}
                                        </p>
                                        {stats.attempts > 0 && <span className="text-xl font-black text-slate-400 mb-1">%</span>}
                                    </div>
                                    <p className="text-[9px] font-bold text-slate-500 uppercase tracking-wider mb-4">
                                        {stats.attempts === 0 ? 'No attempts yet — take your first quiz!' : 'Overall Accuracy Rate'}
                                    </p>

                                    {/* Progress Bar */}
                                    <div className="h-1.5 bg-slate-900 rounded-full overflow-hidden mb-2">
                                        <motion.div className="h-full rounded-full"
                                            style={{ background: `linear-gradient(90deg, ${stats.rank.color}99, ${stats.rank.color})` }}
                                            initial={{ width: 0 }}
                                            animate={{ width: `${Math.min(stats.progress, 100)}%` }}
                                            transition={{ duration: 1.2, ease: 'easeOut' }} />
                                    </div>
                                    <div className="flex justify-between text-[8px] font-bold text-slate-600 uppercase tracking-wider">
                                        <span>0%</span><span>Elite 95%+</span>
                                    </div>
                                </div>
                            </div>

                            {/* Mini Stats Row */}
                            <div className="grid grid-cols-2 gap-4">
                                {[
                                    { label: 'Total Attempts', value: stats.attempts, color: 'text-brand-primary', icon: <Target size={16} className="text-brand-primary" />, bg: 'bg-brand-primary/5 border-brand-primary/15' },
                                    { label: 'Quizzes Passed', value: stats.passed,   color: 'text-luxury-emerald', icon: <CheckCircle size={16} className="text-luxury-emerald" />, bg: 'bg-luxury-emerald/5 border-luxury-emerald/15' },
                                ].map(item => (
                                    <div key={item.label} className={`${item.bg} border rounded-xl p-4 flex flex-col gap-2`}>
                                        <div className="flex items-center justify-between">
                                            {item.icon}
                                            <span className="text-[8px] font-black uppercase tracking-wider text-slate-500">{item.label}</span>
                                        </div>
                                        <p className={`text-3xl font-black italic leading-none ${item.color}`}>{item.value}</p>
                                    </div>
                                ))}
                            </div>

                            {/* Goals Card */}
                            <div className="rounded-2xl border border-indigo-500/20 bg-indigo-500/5 p-5">
                                <div className="flex items-center gap-2 mb-3">
                                    <Sparkles size={14} className="text-indigo-400" />
                                    <span className="text-[9px] font-black uppercase tracking-[0.25em] text-indigo-400">Weekly Goal</span>
                                </div>
                                <p className="text-slate-400 text-[11px] font-medium leading-relaxed">
                                    {quizHistory?.length === 0
                                        ? 'Complete your first quiz to start tracking your progress and earning your rank.'
                                        : `You've attempted ${stats.attempts} quiz${stats.attempts !== 1 ? 'zes' : ''} with `
                                          + `${stats.acc.toFixed(0)}% accuracy. `
                                          + (stats.acc < 95 ? `Push to ${[...RANKS].reverse().find(r => r.min > stats.acc)?.label || 'Elite'} rank!` : 'You have reached Elite rank!')}
                                </p>
                            </div>
                        </div>

                        {/* ── QUIZ GRID ───────────────────────────────────────── */}
                        <div className="lg:col-span-2">
                            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-800/40">
                                <div className="w-1 h-5 rounded-full bg-brand-primary" />
                                <h2 className="text-[11px] font-black uppercase tracking-[0.4em] text-slate-400">Published Quizzes</h2>
                                {quizzes.length > 0 && (
                                    <span className="ml-auto text-[9px] font-black text-slate-600 bg-slate-900 border border-slate-800 px-2.5 py-1 rounded-lg">
                                        {quizzes.length} Available
                                    </span>
                                )}
                            </div>

                            {loading ? (
                                <div className="flex items-center justify-center py-24">
                                    <div className="w-8 h-8 border-2 border-brand-primary border-t-transparent rounded-full animate-spin" />
                                </div>
                            ) : quizzes.length === 0 ? (
                                /* Empty state */
                                <div className="py-20 flex flex-col items-center justify-center gap-4 rounded-2xl border border-dashed border-slate-800/60 bg-slate-900/10">
                                    <div className="w-16 h-16 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center">
                                        <Brain size={28} className="text-slate-700" />
                                    </div>
                                    <div className="text-center">
                                        <p className="text-[11px] font-black uppercase tracking-widest text-slate-500 mb-1">No Quizzes Assigned</p>
                                        <p className="text-[10px] text-slate-600">Your teacher hasn't published any quizzes yet.</p>
                                    </div>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                    {quizzes.map((quiz, idx) => {
                                        const sc = getSubjectColor(quiz.subjectId?.name);
                                        const totalPts = (quiz.questions || []).reduce((t, q) => t + (q.points || 10), 0);
                                        return (
                                            <motion.div key={quiz._id}
                                                initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
                                                transition={{ delay: idx * 0.06 }}
                                                whileHover={{ y: -3 }}
                                                onClick={() => startQuiz(quiz)}
                                                className="group relative overflow-hidden rounded-2xl border border-slate-800/60 bg-[#0b0d14] cursor-pointer
                                                           hover:border-brand-primary/40 hover:shadow-[0_8px_40px_rgba(88,166,255,0.08)] transition-all duration-400 p-6 flex flex-col">

                                                {/* Card glow */}
                                                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none rounded-2xl"
                                                    style={{ background: `radial-gradient(ellipse at top right, ${sc.glow}, transparent 70%)` }} />

                                                {/* Watermark icon */}
                                                <div className="absolute right-4 bottom-4 opacity-[0.04] group-hover:opacity-[0.07] transition-opacity pointer-events-none">
                                                    <Brain size={72} />
                                                </div>

                                                <div className="relative z-10 flex flex-col h-full">
                                                    {/* Top row */}
                                                    <div className="flex items-center justify-between mb-5">
                                                        <span className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-wider border ${sc.pill}`}>
                                                            {getSubjectIcon(quiz.subjectId?.name)}
                                                            {quiz.subjectId?.name || 'General'}
                                                        </span>
                                                        <div className="flex items-center gap-1 text-[9px] font-bold text-slate-500">
                                                            <Clock size={10} /> {quiz.duration}m
                                                        </div>
                                                    </div>

                                                    {/* Title */}
                                                    <h3 className="text-lg font-black text-white italic uppercase tracking-tight leading-snug mb-2
                                                                   group-hover:text-brand-primary transition-colors">
                                                        {quiz.title}
                                                    </h3>

                                                    {/* Meta row */}
                                                    <div className="flex items-center gap-3 mb-6">
                                                        <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider">
                                                            {quiz.questions?.length || 0} Questions
                                                        </span>
                                                        <span className="w-1 h-1 rounded-full bg-slate-700" />
                                                        <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider">
                                                            Pass: {quiz.passingScore}%
                                                        </span>
                                                        <span className="w-1 h-1 rounded-full bg-slate-700" />
                                                        <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider">
                                                            {totalPts} pts
                                                        </span>
                                                    </div>

                                                    {/* CTA */}
                                                    <button className="mt-auto w-full py-3 rounded-xl bg-brand-primary text-black text-[9px] font-black uppercase tracking-[0.2em]
                                                                      hover:bg-blue-300 transition-all flex items-center justify-center gap-2
                                                                      shadow-[0_0_20px_rgba(88,166,255,0.15)] group-hover:shadow-[0_0_25px_rgba(88,166,255,0.3)]">
                                                        <Play size={11} className="fill-current" /> Begin Assessment
                                                    </button>
                                                </div>
                                            </motion.div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    </motion.div>
                )}

                {/* ════════════════ STUDY MATERIALS ════════════════ */}
                {activeView === 'study' && (
                    <motion.div key="study"
                        initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }}
                        className="rounded-2xl border border-slate-800/60 bg-[#0b0d14] overflow-hidden">

                        {/* Header bar */}
                        <div className="flex items-center justify-between px-7 py-5 border-b border-slate-800/50 bg-slate-900/30">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-xl bg-brand-primary/10 border border-brand-primary/20 flex items-center justify-center">
                                    <BookOpen size={15} className="text-brand-primary" />
                                </div>
                                <div>
                                    <h2 className="text-[11px] font-black uppercase tracking-[0.35em] text-white">Study Library</h2>
                                    <p className="text-[9px] text-slate-500 font-bold uppercase tracking-wider">Download · View · Learn</p>
                                </div>
                            </div>
                            <span className="text-[9px] font-black text-slate-500 bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-xl">
                                {resources.length} Resource{resources.length !== 1 ? 's' : ''}
                            </span>
                        </div>

                        <div className="divide-y divide-slate-800/40">
                            {resources.length === 0 ? (
                                <div className="py-20 flex flex-col items-center gap-4">
                                    <div className="w-14 h-14 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center">
                                        <BookOpen size={22} className="text-slate-700" />
                                    </div>
                                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-600">No materials available for your grade.</p>
                                </div>
                            ) : resources.map((item, idx) => {
                                const sc = getSubjectColor(item.subject?.name);
                                return (
                                    <motion.div key={item._id || idx}
                                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: idx * 0.04 }}
                                        className="flex flex-col sm:flex-row sm:items-center gap-5 px-7 py-5 group hover:bg-white/[0.015] transition-all">

                                        {/* Icon */}
                                        <div className="w-12 h-12 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center flex-shrink-0
                                                        group-hover:border-brand-primary/30 group-hover:bg-brand-primary/5 transition-all">
                                            <FileText size={18} className="text-slate-500 group-hover:text-brand-primary transition-colors" />
                                        </div>

                                        {/* Info */}
                                        <div className="flex-1 min-w-0">
                                            <h4 className="text-sm font-black text-white uppercase tracking-wider italic mb-1.5 truncate">{item.title}</h4>
                                            <div className="flex flex-wrap items-center gap-2">
                                                <span className={`flex items-center gap-1 px-2 py-0.5 rounded-lg text-[8px] font-black uppercase tracking-wider border ${sc.pill}`}>
                                                    {getSubjectIcon(item.subject?.name)} {item.subject?.name || 'General'}
                                                </span>
                                                <span className="text-[8px] font-bold text-slate-600 uppercase">{item.resourceType}</span>
                                                <span className="text-[8px] font-bold text-slate-700">•</span>
                                                <span className="text-[8px] font-bold text-slate-600">
                                                    {new Date(item.uploadDate).toLocaleDateString(undefined, { day:'numeric', month:'short', year:'numeric' })}
                                                </span>
                                            </div>
                                            {item.description && (
                                                <p className="text-[10px] text-slate-500 mt-1.5 line-clamp-1 italic">{item.description}</p>
                                            )}
                                        </div>

                                        {/* Action */}
                                        <button onClick={() => handleAccessStream(item.fileUrl)}
                                            className="flex-shrink-0 flex items-center gap-2 px-5 py-2.5 rounded-xl text-[9px] font-black uppercase tracking-widest
                                                      bg-slate-900 border border-slate-800 text-slate-400
                                                      hover:bg-brand-primary hover:border-brand-primary hover:text-black transition-all h-[38px]">
                                            <Eye size={12} /> View
                                        </button>
                                    </motion.div>
                                );
                            })}
                        </div>
                    </motion.div>
                )}

                {/* ════════════════ ACTIVE QUIZ ════════════════ */}
                {activeView === 'quiz' && selectedQuiz && (
                    <motion.div key="quiz"
                        initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
                        className="rounded-2xl border border-slate-800/60 bg-[#0b0d14] overflow-hidden max-w-6xl mx-auto">

                        {/* Progress bar */}
                        <div className="h-1 bg-slate-900 w-full">
                            <motion.div className="h-full bg-brand-primary shadow-[0_0_12px_rgba(88,166,255,0.8)]"
                                animate={{ width: `${((currentQuestion + 1) / selectedQuiz.questions.length) * 100}%` }} />
                        </div>

                        {!quizComplete ? (
                            <div className="flex flex-col lg:flex-row">

                                {/* ── Question Nav Sidebar ── */}
                                <div className="w-full lg:w-60 border-b lg:border-b-0 lg:border-r border-slate-800/50 p-5 bg-slate-900/20 flex-shrink-0">
                                    <p className="text-[9px] font-black uppercase tracking-[0.3em] text-slate-500 mb-4">Navigation</p>

                                    <div className="grid grid-cols-5 lg:grid-cols-4 gap-2 mb-6">
                                        {selectedQuiz.questions.map((_, idx) => {
                                            const answered = userAnswers[idx] !== undefined;
                                            const current = currentQuestion === idx;
                                            return (
                                                <button key={idx} onClick={() => setCurrentQuestion(idx)}
                                                    className={`aspect-square rounded-lg flex items-center justify-center text-[10px] font-black transition-all ${
                                                        current   ? 'bg-brand-primary text-black shadow-[0_0_12px_rgba(88,166,255,0.5)] scale-105'
                                                        : answered ? 'bg-luxury-emerald/15 text-luxury-emerald border border-luxury-emerald/30'
                                                        : 'bg-slate-900 text-slate-500 border border-slate-800 hover:border-slate-600 hover:text-white'
                                                    }`}>
                                                    {idx + 1}
                                                </button>
                                            );
                                        })}
                                    </div>

                                    {/* Legend */}
                                    <div className="space-y-2 mb-6">
                                        {[
                                            { color: 'bg-brand-primary', label: 'Current' },
                                            { color: 'bg-luxury-emerald/40', label: 'Answered' },
                                            { color: 'bg-slate-700', label: 'Unanswered' },
                                        ].map(l => (
                                            <div key={l.label} className="flex items-center gap-2">
                                                <div className={`w-3 h-3 rounded-sm ${l.color}`} />
                                                <span className="text-[8px] font-bold text-slate-500 uppercase tracking-wider">{l.label}</span>
                                            </div>
                                        ))}
                                    </div>

                                    <button onClick={submitQuiz}
                                        className="w-full py-2.5 rounded-xl bg-luxury-emerald text-black text-[9px] font-black uppercase tracking-widest
                                                  hover:bg-emerald-400 transition-all shadow-[0_0_15px_rgba(16,185,129,0.2)]">
                                        Submit Quiz
                                    </button>
                                </div>

                                {/* ── Main Question Area ── */}
                                <div className="flex-1 p-6 md:p-8">
                                    {/* Quiz header */}
                                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 pb-6 border-b border-slate-800/50">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-xl bg-brand-primary/10 border border-brand-primary/20 flex items-center justify-center flex-shrink-0">
                                                <Brain size={18} className="text-brand-primary" />
                                            </div>
                                            <div>
                                                <p className="text-[8px] font-black text-brand-primary uppercase tracking-[0.4em] mb-0.5">Active Assessment</p>
                                                <h2 className="text-base font-black text-white italic uppercase tracking-tighter leading-tight">{selectedQuiz.title}</h2>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-5">
                                            {timeLeft !== null && (
                                                <div className={`text-center px-4 py-2 rounded-xl border ${timeLeft < 60 ? 'bg-rose-500/10 border-rose-500/30' : 'bg-slate-900 border-slate-800'}`}>
                                                    <p className="text-[8px] font-black text-slate-500 uppercase tracking-wider mb-0.5">Time Left</p>
                                                    <p className={`text-sm font-black tracking-widest ${timeLeft < 60 ? 'text-rose-400 animate-pulse' : 'text-white'}`}>
                                                        {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}
                                                    </p>
                                                </div>
                                            )}
                                            <div className="text-center px-4 py-2 rounded-xl bg-slate-900 border border-slate-800">
                                                <p className="text-[8px] font-black text-slate-500 uppercase tracking-wider mb-0.5">Question</p>
                                                <p className="text-sm font-black text-white">{currentQuestion + 1}
                                                    <span className="text-slate-600 text-xs"> / {selectedQuiz.questions.length}</span>
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Question text */}
                                    <div className="max-w-3xl mx-auto">
                                        <p className="text-xl font-bold text-slate-100 leading-relaxed text-center mb-8 px-4">
                                            "{selectedQuiz.questions[currentQuestion].text}"
                                        </p>

                                        {/* Options */}
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-8">
                                            {selectedQuiz.questions[currentQuestion].options.map((opt, i) => {
                                                const selected = userAnswers[currentQuestion] === i;
                                                return (
                                                    <motion.button key={i} whileTap={{ scale: 0.98 }}
                                                        onClick={() => setUserAnswers(p => ({ ...p, [currentQuestion]: i }))}
                                                        className={`p-4 rounded-xl border text-left transition-all group/opt ${
                                                            selected
                                                                ? 'bg-brand-primary/10 border-brand-primary shadow-[0_0_20px_rgba(88,166,255,0.1)]'
                                                                : 'bg-slate-900/50 border-slate-800 hover:border-slate-600 hover:bg-slate-900'
                                                        }`}>
                                                        <div className="flex items-center gap-3">
                                                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-[10px] font-black flex-shrink-0 transition-all ${
                                                                selected ? 'bg-brand-primary text-black' : 'bg-slate-800 text-slate-400 group-hover/opt:bg-slate-700'
                                                            }`}>
                                                                {OPTION_LABELS[i]}
                                                            </div>
                                                            <span className={`text-xs font-bold uppercase tracking-wide italic transition-colors ${
                                                                selected ? 'text-brand-primary' : 'text-slate-300'
                                                            }`}>{opt}</span>
                                                        </div>
                                                    </motion.button>
                                                );
                                            })}
                                        </div>

                                        {/* Nav buttons */}
                                        <div className="flex items-center justify-between pt-4 border-t border-slate-800/50">
                                            <button onClick={() => setCurrentQuestion(p => Math.max(0, p - 1))}
                                                disabled={currentQuestion === 0}
                                                className="px-5 py-2.5 rounded-xl text-[9px] font-black uppercase tracking-widest border
                                                          bg-slate-900 text-slate-400 border-slate-800 hover:text-white hover:border-slate-600
                                                          disabled:opacity-30 disabled:cursor-not-allowed transition-all h-[38px]">
                                                ← Previous
                                            </button>

                                            <span className="text-[9px] font-black text-slate-600 uppercase tracking-wider">
                                                {Object.keys(userAnswers).length} of {selectedQuiz.questions.length} answered
                                            </span>

                                            {currentQuestion < selectedQuiz.questions.length - 1 ? (
                                                <button onClick={() => setCurrentQuestion(p => p + 1)}
                                                    className="px-5 py-2.5 rounded-xl text-[9px] font-black uppercase tracking-widest border
                                                              bg-slate-900 text-white border-slate-700 hover:border-brand-primary/50 transition-all h-[38px]">
                                                    Next →
                                                </button>
                                            ) : (
                                                <button onClick={submitQuiz}
                                                    className="px-6 py-2.5 rounded-xl text-[9px] font-black uppercase tracking-widest border-none
                                                              bg-luxury-emerald text-black hover:bg-emerald-400 transition-all h-[38px]
                                                              shadow-[0_0_15px_rgba(16,185,129,0.3)]">
                                                    Submit ✓
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            /* ════ QUIZ RESULTS ════ */
                            <div className="p-6 md:p-10 space-y-8">
                                {/* Score card */}
                                {(() => {
                                    const totalPts = selectedQuiz.questions.reduce((t, q) => t + (q.points || 10), 0);
                                    const pct = totalPts > 0 ? Math.round((score / totalPts) * 100) : 0;
                                    const passed = pct >= selectedQuiz.passingScore;
                                    return (
                                        <div className={`rounded-2xl border p-8 text-center relative overflow-hidden ${
                                            passed ? 'border-luxury-emerald/25 bg-luxury-emerald/5' : 'border-rose-500/25 bg-rose-500/5'
                                        }`}>
                                            <div className={`absolute inset-0 opacity-20 pointer-events-none ${passed ? 'bg-luxury-emerald/10' : 'bg-rose-500/10'}`} />

                                            <div className={`w-20 h-20 rounded-full mx-auto mb-5 flex items-center justify-center border-2 ${
                                                passed ? 'bg-luxury-emerald/10 border-luxury-emerald text-luxury-emerald' : 'bg-rose-500/10 border-rose-500 text-rose-400'
                                            }`}>
                                                {passed ? <Award size={36} /> : <AlertTriangle size={36} />}
                                            </div>

                                            <h2 className="text-2xl font-black text-white italic uppercase tracking-tighter mb-1">
                                                {passed ? 'Assessment Passed!' : 'Keep Practicing'}
                                            </h2>
                                            <p className="text-slate-500 text-[10px] uppercase tracking-widest font-bold mb-6">
                                                {passed ? 'Excellent work — your result has been recorded.' : 'Review the answers below and try again.'}
                                            </p>

                                            <div className="grid grid-cols-3 gap-4 max-w-md mx-auto">
                                                {[
                                                    { label: 'Score', value: `${score} / ${totalPts}`, color: 'text-white' },
                                                    { label: 'Accuracy', value: `${pct}%`, color: passed ? 'text-luxury-emerald' : 'text-rose-400' },
                                                    { label: 'Status', value: passed ? 'Passed' : 'Failed', color: passed ? 'text-luxury-emerald' : 'text-rose-400' },
                                                ].map(s => (
                                                    <div key={s.label} className="bg-slate-900/60 rounded-xl p-3 border border-slate-800">
                                                        <p className="text-[8px] font-black uppercase tracking-widest text-slate-500 mb-1">{s.label}</p>
                                                        <p className={`text-xl font-black italic ${s.color}`}>{s.value}</p>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    );
                                })()}

                                {/* Review */}
                                <div>
                                    <div className="flex items-center gap-3 mb-5 pb-4 border-b border-slate-800/50">
                                        <div className="w-1 h-5 rounded-full bg-brand-primary" />
                                        <h3 className="text-[11px] font-black uppercase tracking-[0.4em] text-slate-400">Answer Review</h3>
                                    </div>

                                    <div className="space-y-4 max-w-4xl">
                                        {selectedQuiz.questions.map((question, qIdx) => {
                                            const selOpt = userAnswers[qIdx];
                                            const answered = selOpt !== undefined;
                                            const correct = answered && selOpt === question.correctAnswer;
                                            return (
                                                <motion.div key={qIdx}
                                                    initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                                                    transition={{ delay: qIdx * 0.04 }}
                                                    className={`rounded-xl border p-5 ${
                                                        correct ? 'border-luxury-emerald/20 bg-luxury-emerald/5'
                                                        : !answered ? 'border-slate-800 bg-slate-900/20'
                                                        : 'border-rose-500/20 bg-rose-500/5'
                                                    }`}>

                                                    <div className="flex items-start justify-between gap-3 mb-4">
                                                        <div className="flex items-start gap-3 min-w-0">
                                                            <span className={`w-8 h-8 rounded-lg flex items-center justify-center text-[10px] font-black flex-shrink-0 ${
                                                                correct ? 'bg-luxury-emerald/20 text-luxury-emerald border border-luxury-emerald/30'
                                                                : !answered ? 'bg-slate-800 text-slate-500 border border-slate-700'
                                                                : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                                                            }`}>Q{qIdx + 1}</span>
                                                            <p className="text-sm font-bold text-slate-200 leading-snug pt-1">{question.text}</p>
                                                        </div>
                                                        <span className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-[8px] font-black uppercase tracking-widest flex-shrink-0 ${
                                                            correct ? 'bg-luxury-emerald/15 text-luxury-emerald'
                                                            : !answered ? 'bg-slate-800 text-slate-500'
                                                            : 'bg-rose-500/15 text-rose-400'
                                                        }`}>
                                                            {correct ? <CheckCircle size={10} /> : !answered ? <MinusCircle size={10} /> : <X size={10} />}
                                                            {correct ? 'Correct' : !answered ? 'Skipped' : 'Wrong'}
                                                        </span>
                                                    </div>

                                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:ml-11">
                                                        {question.options.map((opt, oIdx) => {
                                                            const isUser = selOpt === oIdx;
                                                            const isCorrect = question.correctAnswer === oIdx;
                                                            return (
                                                                <div key={oIdx} className={`flex items-center gap-2.5 p-3 rounded-lg border text-xs font-bold italic ${
                                                                    isCorrect ? 'bg-luxury-emerald/10 border-luxury-emerald/25 text-emerald-300'
                                                                    : isUser && !correct ? 'bg-rose-500/10 border-rose-500/25 text-rose-400'
                                                                    : 'bg-slate-900/40 border-slate-800/60 text-slate-500'
                                                                }`}>
                                                                    <span className="w-5 h-5 rounded flex items-center justify-center text-[8px] font-black bg-slate-800 text-slate-400 flex-shrink-0">
                                                                        {OPTION_LABELS[oIdx]}
                                                                    </span>
                                                                    <span className="flex-1 truncate">{opt}</span>
                                                                    {isCorrect && <CheckCircle size={11} className="text-luxury-emerald flex-shrink-0" />}
                                                                    {isUser && !correct && <X size={11} className="text-rose-500 flex-shrink-0" />}
                                                                </div>
                                                            );
                                                        })}
                                                    </div>

                                                    {!correct && (
                                                        <div className="mt-3 sm:ml-11 p-3 bg-slate-950 border border-slate-800 rounded-lg text-xs">
                                                            <span className="text-[8px] font-black text-slate-500 uppercase tracking-wider">Correct: </span>
                                                            <span className="font-black text-luxury-emerald">
                                                                {OPTION_LABELS[question.correctAnswer]}. {question.options[question.correctAnswer]}
                                                            </span>
                                                        </div>
                                                    )}
                                                </motion.div>
                                            );
                                        })}
                                    </div>
                                </div>

                                {/* Actions */}
                                <div className="flex flex-col sm:flex-row justify-center gap-4 pt-4 border-t border-slate-800/50">
                                    <button onClick={() => startQuiz(selectedQuiz)}
                                        className="flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl text-[9px] font-black uppercase tracking-widest
                                                  bg-slate-900 text-white border border-slate-800 hover:border-slate-600 transition-all h-[44px]">
                                        <RotateCcw size={14} /> Retake
                                    </button>
                                    <button onClick={() => setActiveView('portal')}
                                        className="flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl text-[9px] font-black uppercase tracking-widest
                                                  bg-brand-primary text-black hover:bg-blue-300 transition-all h-[44px]">
                                        Quiz Portal <ArrowRight size={14} />
                                    </button>
                                </div>
                            </div>
                        )}
                    </motion.div>
                )}

                {/* ════════════════ HISTORY ════════════════ */}
                {activeView === 'history' && (
                    <motion.div key="history"
                        initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }}
                        className="rounded-2xl border border-slate-800/60 bg-[#0b0d14] overflow-hidden">

                        {/* Header */}
                        <div className="flex items-center justify-between px-7 py-5 border-b border-slate-800/50 bg-slate-900/30">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-xl bg-brand-primary/10 border border-brand-primary/20 flex items-center justify-center">
                                    <BarChart3 size={15} className="text-brand-primary" />
                                </div>
                                <div>
                                    <h2 className="text-[11px] font-black uppercase tracking-[0.35em] text-white">Quiz History</h2>
                                    <p className="text-[9px] text-slate-500 font-bold uppercase tracking-wider">Sorted By Latest Attempt</p>
                                </div>
                            </div>
                            {quizHistory?.length > 0 && (
                                <div className="flex items-center gap-4">
                                    <div className="text-right">
                                        <p className="text-[8px] font-black text-slate-500 uppercase tracking-wider">Pass Rate</p>
                                        <p className="text-sm font-black text-luxury-emerald italic">
                                            {quizHistory.length > 0 ? Math.round((stats.passed / stats.attempts) * 100) : 0}%
                                        </p>
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b border-slate-800/40">
                                        {['Assessment', 'Subject', 'Score', 'Accuracy', 'Status', 'Date'].map((h, i) => (
                                            <th key={h} className={`px-6 py-4 text-[8px] font-black uppercase tracking-[0.25em] text-slate-600 ${i >= 2 ? 'text-center' : 'text-left'}`}>
                                                {h}
                                            </th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-800/30">
                                    {quizHistory?.length > 0 ? (
                                        [...quizHistory]
                                            .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
                                            .map((attempt, idx) => {
                                                const pct = attempt.totalPoints > 0 ? Math.round((attempt.score / attempt.totalPoints) * 100) : 0;
                                                const passed = attempt.status === 'Passed';
                                                const sc = getSubjectColor(attempt.quizId?.subjectId?.name);
                                                return (
                                                    <motion.tr key={attempt._id || idx}
                                                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: idx * 0.03 }}
                                                        className="hover:bg-white/[0.01] transition-all group">
                                                        <td className="px-6 py-4">
                                                            <p className="text-[11px] font-black text-white italic uppercase tracking-wide truncate max-w-48">
                                                                {attempt.quizId?.title || '—'}
                                                            </p>
                                                        </td>
                                                        <td className="px-6 py-4">
                                                            <span className={`flex items-center gap-1 px-2 py-0.5 rounded-lg text-[8px] font-black uppercase border w-max ${sc.pill}`}>
                                                                {getSubjectIcon(attempt.quizId?.subjectId?.name)}
                                                                {attempt.quizId?.subjectId?.name || '—'}
                                                            </span>
                                                        </td>
                                                        <td className="px-6 py-4 text-center">
                                                            <span className="text-xs font-black text-white italic">
                                                                {attempt.score}
                                                                <span className="text-slate-600 text-[10px] font-normal"> / {attempt.totalPoints}</span>
                                                            </span>
                                                        </td>
                                                        <td className="px-6 py-4 text-center">
                                                            <div className="flex items-center justify-center gap-2">
                                                                <div className="w-16 h-1 bg-slate-800 rounded-full overflow-hidden">
                                                                    <div className={`h-full rounded-full transition-all ${passed ? 'bg-luxury-emerald' : 'bg-rose-500'}`}
                                                                        style={{ width: `${pct}%` }} />
                                                                </div>
                                                                <span className={`text-[10px] font-black italic ${passed ? 'text-luxury-emerald' : 'text-rose-400'}`}>
                                                                    {pct}%
                                                                </span>
                                                            </div>
                                                        </td>
                                                        <td className="px-6 py-4 text-center">
                                                            <span className={`px-3 py-1 rounded-xl text-[8px] font-black uppercase tracking-widest border ${
                                                                passed ? 'text-luxury-emerald border-luxury-emerald/25 bg-luxury-emerald/8' : 'text-rose-400 border-rose-500/25 bg-rose-500/8'
                                                            }`}>
                                                                {attempt.status}
                                                            </span>
                                                        </td>
                                                        <td className="px-6 py-4 text-center text-[9px] font-bold text-slate-500 uppercase tracking-widest">
                                                            {new Date(attempt.createdAt).toLocaleDateString(undefined, { day:'numeric', month:'short', year:'numeric' })}
                                                        </td>
                                                    </motion.tr>
                                                );
                                            })
                                    ) : (
                                        <tr>
                                            <td colSpan="6" className="py-16 text-center">
                                                <div className="flex flex-col items-center gap-3">
                                                    <div className="w-12 h-12 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center">
                                                        <CheckSquare size={20} className="text-slate-700" />
                                                    </div>
                                                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-600">No quiz attempts recorded yet.</p>
                                                </div>
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* ── PDF VIEWER via PortalModal ───────────────────────────────── */}
            <PortalModal
                isOpen={!!pdfViewerUrl}
                onClose={() => setPdfViewerUrl(null)}
                maxWidth="max-w-6xl"
            >
                <div className="flex flex-col" style={{ height: 'calc(100vh - 80px)' }}>
                    {/* Modal Header */}
                    <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800/60 flex-shrink-0">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-xl bg-brand-primary/10 border border-brand-primary/20 flex items-center justify-center">
                                <BookOpen size={14} className="text-brand-primary" />
                            </div>
                            <div>
                                <p className="text-[10px] font-black text-white uppercase tracking-widest">Document Viewer</p>
                                <p className="text-[8px] font-bold text-slate-500 uppercase tracking-wider">Read · Download · Study</p>
                            </div>
                        </div>
                        <button
                            onClick={() => setPdfViewerUrl(null)}
                            className="flex items-center gap-2 px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest
                                      bg-slate-900 border border-slate-800 text-slate-400
                                      hover:bg-rose-500/10 hover:border-rose-500/30 hover:text-rose-400 transition-all"
                        >
                            <X size={12} /> Close
                        </button>
                    </div>
                    {/* iframe fills the rest */}
                    <div className="flex-1 overflow-hidden rounded-b-xl bg-white">
                        <iframe
                            title="Study Material"
                            src={pdfViewerUrl}
                            className="w-full h-full border-none"
                        />
                    </div>
                </div>
            </PortalModal>
        </motion.div>
    );
};

export default ELearning;
