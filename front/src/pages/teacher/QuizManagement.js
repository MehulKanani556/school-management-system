import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Brain, Plus, Trash2, Eye, EyeOff, Users, ChevronDown, ChevronUp, X, Save, CheckCircle, AlertCircle } from 'lucide-react';
import axiosInstance from '../../utils/axiosInstance';
import { toast } from 'react-hot-toast';

const EMPTY_QUESTION = { text: '', options: ['', '', '', ''], correctAnswer: 0, points: 10 };

const QuizManagement = () => {
    const [quizzes, setQuizzes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [subjects, setSubjects] = useState([]);
    const [standards, setStandards] = useState([]);
    const [showForm, setShowForm] = useState(false);
    const [expandedQuiz, setExpandedQuiz] = useState(null);
    const [attempts, setAttempts] = useState({});
    const [form, setForm] = useState({
        title: '', description: '', subjectId: '', standardId: '',
        duration: 30, passingScore: 40, questions: [{ ...EMPTY_QUESTION }]
    });

    useEffect(() => {
        fetchAll();
    }, []);

    const fetchAll = async () => {
        setLoading(true);
        try {
            const [qRes, ctxRes] = await Promise.all([
                axiosInstance.get('/teacher/quizzes'),
                axiosInstance.get('/teacher/context'),
            ]);
            setQuizzes(qRes.data);
            setSubjects(ctxRes.data.subjects || []);
            setStandards(ctxRes.data.standards || []);
        } catch (err) {
            toast.error('Failed to load quizzes');
        } finally {
            setLoading(false);
        }
    };

    const fetchAttempts = async (quizId) => {
        try {
            const res = await axiosInstance.get(`/teacher/quizzes/${quizId}/attempts`);
            setAttempts(prev => ({ ...prev, [quizId]: res.data }));
        } catch (err) {
            toast.error('Failed to load attempts');
        }
    };

    const handleToggleExpand = (quizId) => {
        if (expandedQuiz === quizId) {
            setExpandedQuiz(null);
        } else {
            setExpandedQuiz(quizId);
            if (!attempts[quizId]) fetchAttempts(quizId);
        }
    };

    const handleTogglePublish = async (quizId) => {
        try {
            const res = await axiosInstance.patch(`/teacher/quizzes/${quizId}/toggle-publish`);
            setQuizzes(prev => prev.map(q => q._id === quizId ? { ...q, isPublished: res.data.isPublished } : q));
            toast.success(res.data.message);
        } catch (err) {
            toast.error('Failed to update publish status');
        }
    };

    const handleDelete = async (quizId) => {
        if (!window.confirm('Delete this quiz and all its attempts?')) return;
        try {
            await axiosInstance.delete(`/teacher/quizzes/${quizId}`);
            setQuizzes(prev => prev.filter(q => q._id !== quizId));
            toast.success('Quiz deleted');
        } catch (err) {
            toast.error('Failed to delete quiz');
        }
    };

    const handleQuestionChange = (idx, field, value) => {
        const updated = [...form.questions];
        updated[idx] = { ...updated[idx], [field]: value };
        setForm({ ...form, questions: updated });
    };

    const handleOptionChange = (qIdx, oIdx, value) => {
        const updated = [...form.questions];
        const opts = [...updated[qIdx].options];
        opts[oIdx] = value;
        updated[qIdx] = { ...updated[qIdx], options: opts };
        setForm({ ...form, questions: updated });
    };

    const addQuestion = () => setForm({ ...form, questions: [...form.questions, { ...EMPTY_QUESTION, options: ['', '', '', ''] }] });
    const removeQuestion = (idx) => setForm({ ...form, questions: form.questions.filter((_, i) => i !== idx) });

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (form.questions.some(q => !q.text || q.options.some(o => !o))) {
            return toast.error('Fill all question texts and options');
        }
        try {
            const res = await axiosInstance.post('/teacher/quizzes', form);
            setQuizzes(prev => [res.data.quiz, ...prev]);
            setShowForm(false);
            setForm({ title: '', description: '', subjectId: '', standardId: '', duration: 30, passingScore: 40, questions: [{ ...EMPTY_QUESTION }] });
            toast.success('Quiz created');
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to create quiz');
        }
    };

    const ic = "w-full bg-slate-900/60 border border-slate-800 rounded-md px-4 py-3 text-sm text-white outline-none focus:border-teacher-primary transition-all";

    return (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-8 max-w-7xl mx-auto">
            <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                    <h1 className="text-4xl font-black text-white italic uppercase tracking-tighter leading-none mb-2 font-outfit">Quiz Matrix</h1>
                    <p className="text-slate-500 text-sm italic">Create and manage interactive assessments for your students.</p>
                </div>
                <button
                    onClick={() => setShowForm(!showForm)}
                    className="flex items-center gap-3 px-8 py-4 bg-teacher-primary hover:bg-purple-500 text-white rounded-md text-[10px] font-black uppercase tracking-widest transition-all shadow-lg"
                >
                    <Plus size={16} /> New Quiz
                </button>
            </header>

            {/* Create Form */}
            <AnimatePresence>
                {showForm && (
                    <motion.form
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        onSubmit={handleSubmit}
                        className="bg-[#0f0f12] border border-slate-800/60 rounded-md overflow-hidden"
                    >
                        <div className="p-8 border-b border-slate-800/60 flex items-center justify-between">
                            <h3 className="text-sm font-black text-white uppercase tracking-widest flex items-center gap-3">
                                <Brain size={18} className="text-teacher-primary" /> Configure Quiz Node
                            </h3>
                            <button type="button" onClick={() => setShowForm(false)} className="text-slate-500 hover:text-white transition-colors">
                                <X size={20} />
                            </button>
                        </div>

                        <div className="p-8 space-y-8">
                            {/* Quiz Meta */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="md:col-span-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 block mb-2">Quiz Title</label>
                                    <input required value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} placeholder="e.g. Chapter 5 Assessment" className={ic} />
                                </div>
                                <div>
                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 block mb-2">Subject</label>
                                    <select required value={form.subjectId} onChange={e => setForm({ ...form, subjectId: e.target.value })} className={ic}>
                                        <option value="">Select Subject</option>
                                        {subjects.map(s => <option key={s._id} value={s._id}>{s.name}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 block mb-2">Standard / Grade</label>
                                    <select required value={form.standardId} onChange={e => setForm({ ...form, standardId: e.target.value })} className={ic}>
                                        <option value="">Select Standard</option>
                                        {standards.map(s => <option key={s._id} value={s._id}>Grade {s.level}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 block mb-2">Duration (minutes)</label>
                                    <input type="number" min="5" max="180" value={form.duration} onChange={e => setForm({ ...form, duration: +e.target.value })} className={ic} />
                                </div>
                                <div>
                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 block mb-2">Passing Score (%)</label>
                                    <input type="number" min="1" max="100" value={form.passingScore} onChange={e => setForm({ ...form, passingScore: +e.target.value })} className={ic} />
                                </div>
                            </div>

                            {/* Questions */}
                            <div className="space-y-6">
                                <div className="flex items-center justify-between">
                                    <h4 className="text-xs font-black uppercase tracking-widest text-slate-400">Questions ({form.questions.length})</h4>
                                    <button type="button" onClick={addQuestion} className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-md text-[10px] font-black uppercase tracking-widest transition-all">
                                        <Plus size={12} /> Add Question
                                    </button>
                                </div>

                                {form.questions.map((q, qIdx) => (
                                    <div key={qIdx} className="bg-slate-900/40 border border-slate-800/60 rounded-md p-6 space-y-4">
                                        <div className="flex items-center justify-between">
                                            <span className="text-[10px] font-black text-teacher-primary uppercase tracking-widest">Q{qIdx + 1}</span>
                                            {form.questions.length > 1 && (
                                                <button type="button" onClick={() => removeQuestion(qIdx)} className="text-slate-600 hover:text-teacher-primary transition-colors">
                                                    <Trash2 size={14} />
                                                </button>
                                            )}
                                        </div>
                                        <input
                                            required
                                            placeholder="Question text..."
                                            value={q.text}
                                            onChange={e => handleQuestionChange(qIdx, 'text', e.target.value)}
                                            className={ic}
                                        />
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                            {q.options.map((opt, oIdx) => (
                                                <div key={oIdx} className="flex items-center gap-3">
                                                    <input
                                                        type="radio"
                                                        name={`correct-${qIdx}`}
                                                        checked={q.correctAnswer === oIdx}
                                                        onChange={() => handleQuestionChange(qIdx, 'correctAnswer', oIdx)}
                                                        className="accent-teacher-primary w-4 h-4 flex-shrink-0"
                                                    />
                                                    <input
                                                        required
                                                        placeholder={`Option ${String.fromCharCode(65 + oIdx)}`}
                                                        value={opt}
                                                        onChange={e => handleOptionChange(qIdx, oIdx, e.target.value)}
                                                        className={`${ic} flex-1`}
                                                    />
                                                </div>
                                            ))}
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Points:</label>
                                            <input type="number" min="1" value={q.points} onChange={e => handleQuestionChange(qIdx, 'points', +e.target.value)} className="w-20 bg-slate-900 border border-slate-800 rounded px-3 py-2 text-sm text-white outline-none focus:border-teacher-primary" />
                                            <span className="text-[9px] text-slate-600 italic">Select the radio button next to the correct answer</span>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="flex justify-end pt-4 border-t border-slate-800/60">
                                <button type="submit" className="flex items-center gap-3 px-10 py-4 bg-teacher-primary hover:bg-purple-500 text-white rounded-md text-[10px] font-black uppercase tracking-widest transition-all shadow-lg">
                                    <Save size={14} /> Save Quiz
                                </button>
                            </div>
                        </div>
                    </motion.form>
                )}
            </AnimatePresence>

            {/* Quiz List */}
            {loading ? (
                <div className="flex items-center justify-center py-20">
                    <div className="w-10 h-10 border-2 border-teacher-primary border-t-transparent rounded-full animate-spin" />
                </div>
            ) : quizzes.length === 0 ? (
                <div className="py-32 text-center bg-[#0f0f12]/40 rounded-md border border-dashed border-slate-800/60">
                    <Brain size={48} className="text-slate-800 mx-auto mb-4 opacity-20" />
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-600">No quizzes created yet. Click "New Quiz" to get started.</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {quizzes.map((quiz) => (
                        <div key={quiz._id} className="bg-[#0f0f12] border border-slate-800/60 rounded-md overflow-hidden">
                            <div className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-teacher-primary/10 border border-teacher-primary/20 rounded-md flex items-center justify-center">
                                        <Brain size={20} className="text-teacher-primary" />
                                    </div>
                                    <div>
                                        <h3 className="font-black text-white uppercase tracking-tight">{quiz.title}</h3>
                                        <p className="text-[10px] text-slate-500 uppercase tracking-widest mt-1 flex items-center gap-2">
                                            <span>{quiz.subjectId?.name}</span> • 
                                            <span>Grade {quiz.standardId?.level}</span> • 
                                            <span>{quiz.questions?.length} Qs</span> • 
                                            <span>{quiz.duration}m</span> • 
                                            <span>Pass: {quiz.passingScore}%</span>
                                            {quiz.stats && (
                                                <>
                                                    <span className="text-slate-700">|</span>
                                                    <span className="text-teacher-primary font-black">Success: {quiz.stats.passRate}%</span>
                                                    <span className="text-slate-700">|</span>
                                                    <span className="text-indigo-400 font-black">Avg: {quiz.stats.avgScore}%</span>
                                                </>
                                            )}
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-3 flex-shrink-0">
                                    <span className={`px-3 py-1.5 rounded-md text-[9px] font-black uppercase tracking-widest border ${quiz.isPublished ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' : 'text-slate-500 bg-slate-800/50 border-slate-700/50'}`}>
                                        {quiz.isPublished ? 'Published' : 'Draft'}
                                    </span>
                                    <button onClick={() => handleTogglePublish(quiz._id)} title={quiz.isPublished ? 'Unpublish' : 'Publish'} className="p-2 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-all">
                                        {quiz.isPublished ? <EyeOff size={16} /> : <Eye size={16} />}
                                    </button>
                                    <button onClick={() => handleToggleExpand(quiz._id)} className="p-2 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-all flex items-center gap-1 text-[9px] font-black uppercase tracking-widest">
                                        <Users size={14} /> Attempts {expandedQuiz === quiz._id ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                                    </button>
                                    <button onClick={() => handleDelete(quiz._id)} className="p-2 rounded-md bg-teacher-primary/10 hover:bg-teacher-primary text-teacher-primary hover:text-white transition-all">
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            </div>

                            {/* Attempts Panel */}
                            <AnimatePresence>
                                {expandedQuiz === quiz._id && (
                                    <motion.div
                                        initial={{ height: 0, opacity: 0 }}
                                        animate={{ height: 'auto', opacity: 1 }}
                                        exit={{ height: 0, opacity: 0 }}
                                        className="overflow-hidden border-t border-slate-800/60"
                                    >
                                        <div className="p-6">
                                            <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-4">Student Attempts</h4>
                                            {!attempts[quiz._id] ? (
                                                <div className="flex items-center justify-center py-8">
                                                    <div className="w-6 h-6 border-2 border-teacher-primary border-t-transparent rounded-full animate-spin" />
                                                </div>
                                            ) : attempts[quiz._id].length === 0 ? (
                                                <p className="text-[10px] text-slate-600 uppercase tracking-widest italic text-center py-6">No attempts yet</p>
                                            ) : (
                                                <div className="overflow-x-auto">
                                                    <table className="w-full text-left">
                                                        <thead>
                                                            <tr className="border-b border-slate-800/60">
                                                                <th className="pb-3 text-[9px] font-black uppercase tracking-widest text-slate-600">Student</th>
                                                                <th className="pb-3 text-[9px] font-black uppercase tracking-widest text-slate-600">Score</th>
                                                                <th className="pb-3 text-[9px] font-black uppercase tracking-widest text-slate-600">Status</th>
                                                                <th className="pb-3 text-[9px] font-black uppercase tracking-widest text-slate-600">Date</th>
                                                            </tr>
                                                        </thead>
                                                        <tbody className="divide-y divide-slate-800/40">
                                                            {attempts[quiz._id].map((a) => (
                                                                <tr key={a._id} className="hover:bg-white/[0.02] transition-colors">
                                                                    <td className="py-3 text-sm font-bold text-white">{a.studentId?.firstName} {a.studentId?.lastName}</td>
                                                                    <td className="py-3 text-sm font-black text-white">
                                                                        {a.score} <span className="text-slate-600 text-xs">/ {a.totalPoints}</span>
                                                                        <span className="ml-2 text-indigo-400 text-xs">({Math.round((a.score / a.totalPoints) * 100)}%)</span>
                                                                    </td>
                                                                    <td className="py-3">
                                                                        <span className={`flex items-center gap-1.5 text-[9px] font-black uppercase tracking-widest w-fit ${a.status === 'Passed' ? 'text-emerald-400' : 'text-teacher-primary'}`}>
                                                                            {a.status === 'Passed' ? <CheckCircle size={12} /> : <AlertCircle size={12} />} {a.status}
                                                                        </span>
                                                                    </td>
                                                                    <td className="py-3 text-[10px] text-slate-500">{new Date(a.createdAt).toLocaleDateString()}</td>
                                                                </tr>
                                                            ))}
                                                        </tbody>
                                                    </table>
                                                </div>
                                            )}
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    ))}
                </div>
            )}
        </motion.div>
    );
};

export default QuizManagement;
