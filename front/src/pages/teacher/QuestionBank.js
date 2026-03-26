import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchAssignedClasses } from '../../redux/slice/teacher.slice';
import axiosInstance from '../../utils/axiosInstance';
import { motion, AnimatePresence } from 'framer-motion';
import { Database, PlusCircle, Wand2, Search, Target, FileText, CheckCircle2, AlertCircle, FileQuestion, BookOpen } from 'lucide-react';
import toast from 'react-hot-toast';

const QuestionBank = () => {
    const dispatch = useDispatch();
    const { classes } = useSelector(state => state.teacher);
    
    // Unique subjects from assigned classes
    const grades = Array.from(new Set(classes.map(c => `Grade ${c.gradeLevel || c.standardId?.level}`)));

    const [activeTab, setActiveTab] = useState('add'); // 'add', 'bank', 'generate'
    const [loading, setLoading] = useState(false);

    // Add Question State
    const [qData, setQData] = useState({
        subject: '',
        classLevel: '',
        content: '',
        type: 'ShortAnswer',
        difficulty: 'Medium',
        marks: 1,
        options: ['', '', '', ''],
        correctAnswer: ''
    });

    // Generate Exam State
    const [examParams, setExamParams] = useState({
        subject: '',
        classLevel: '',
        totalMarks: 20
    });
    const [generatedExam, setGeneratedExam] = useState(null);

    // Bank State
    const [questions, setQuestions] = useState([]);

    useEffect(() => {
        dispatch(fetchAssignedClasses());
        fetchQuestions();
    }, [dispatch]);

    const fetchQuestions = async () => {
        try {
            setLoading(true);
            const res = await axiosInstance.get('/teacher/questions');
            setQuestions(res.data);
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to fetch questions');
        } finally {
            setLoading(false);
        }
    };

    const handleAddQuestion = async (e) => {
        e.preventDefault();
        try {
            setLoading(true);
            const data = { ...qData };
            if (data.type !== 'MCQ') {
                delete data.options;
                delete data.correctAnswer;
            } else {
                data.options = data.options.filter(o => o.trim() !== '');
            }
            
            const res = await axiosInstance.post('/teacher/questions', data);
            toast.success(res.data.message);
            setQData({ ...qData, content: '', options: ['', '', '', ''], correctAnswer: '' });
            fetchQuestions();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to add question');
        } finally {
            setLoading(false);
        }
    };

    const handleGenerateExam = async (e) => {
        e.preventDefault();
        if(!examParams.subject || !examParams.classLevel) {
            return toast.error("Subject and Grade Level are required parameters");
        }
        try {
            setLoading(true);
            const res = await axiosInstance.post('/teacher/generate-exam', {
                ...examParams
            });
            setGeneratedExam(res.data.examPaper);
            toast.success(res.data.message);
        } catch (error) {
            toast.error(error.response?.data?.message || 'Generation failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-8">
            <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 bg-slate-900/40 p-10 rounded-md border border-slate-800/60 shadow-2xl backdrop-blur-xl">
                <div className="space-y-2">
                    <div className="flex items-center gap-3 mb-2">
                        <span className="w-12 h-[2px] bg-brand-primary rounded-md"></span>
                        <span className="text-[10px] font-black uppercase tracking-[0.4em] text-brand-primary font-outfit">Evaluation Synthesis</span>
                    </div>
                    <h1 className="text-4xl font-black text-white italic uppercase tracking-tighter leading-none font-outfit">Question Bank & Exam Generator</h1>
                    <p className="text-slate-500 font-medium text-sm tracking-wide italic">Algorithmic assessment generation and secure evaluation node vault.</p>
                </div>

                <div className="flex bg-slate-950 p-2 rounded-md border border-slate-800 shadow-inner">
                    <button onClick={() => setActiveTab('add')} className={`px-6 py-3 rounded-md text-[10px] font-black uppercase tracking-widest transition-all italic flex items-center gap-2 ${activeTab === 'add' ? 'bg-brand-primary text-white shadow-xl' : 'text-slate-500 hover:text-white'}`}><PlusCircle size={14} /> Add Node</button>
                    <button onClick={() => setActiveTab('bank')} className={`px-6 py-3 rounded-md text-[10px] font-black uppercase tracking-widest transition-all italic flex items-center gap-2 ${activeTab === 'bank' ? 'bg-brand-primary text-white shadow-xl' : 'text-slate-500 hover:text-white'}`}><Database size={14} /> View Vault</button>
                    <button onClick={() => setActiveTab('generate')} className={`px-6 py-3 rounded-md text-[10px] font-black uppercase tracking-widest transition-all italic flex items-center gap-2 ${activeTab === 'generate' ? 'bg-brand-primary text-white shadow-xl' : 'text-slate-500 hover:text-white'}`}><Wand2 size={14} /> Synthesize</button>
                </div>
            </header>

            <AnimatePresence mode="popLayout">
                {activeTab === 'add' && (
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="bg-slate-900/40 p-10 rounded-md border border-slate-800/60 shadow-2xl">
                        <form onSubmit={handleAddQuestion} className="max-w-4xl mx-auto space-y-8">
                            <h2 className="text-2xl font-black text-white italic uppercase tracking-tighter flex items-center gap-3"><FileQuestion className="text-brand-primary" /> Record New Evaluation Node</h2>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest italic ml-2">Target Grade Index</label>
                                    <select required value={qData.classLevel} onChange={e => setQData({...qData, classLevel: e.target.value, subject: ''})} className="w-full bg-slate-950 border border-slate-800 h-14 px-6 rounded-md text-white font-bold outline-none focus:border-brand-primary appearance-none">
                                        <option value="">Select Target Index</option>
                                        {grades?.map(g => <option key={g} value={g}>{g}</option>)}
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest italic ml-2">Academic Parameter (Subject ID/Name)</label>
                                    <select required value={qData.subject} onChange={e => setQData({...qData, subject: e.target.value})} className="w-full bg-slate-950 border border-slate-800 h-14 px-6 rounded-md text-white font-bold outline-none focus:border-brand-primary appearance-none">
                                        <option value="">Select Parameter</option>
                                        {(() => {
                                            const filteredSubjs = Array.from(new Map(
                                                classes
                                                ?.filter(c => `Grade ${c.gradeLevel || c.standardId?.level}` === qData.classLevel)
                                                .flatMap(c => c.subjects || [])
                                                .filter(Boolean)
                                                .map(s => [s._id, s])
                                            ).values());
                                            return filteredSubjs.map(s => <option key={s._id} value={s._id}>{s.name}</option>);
                                        })()}
                                    </select>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest italic ml-2">Evaluation Directive (Question)</label>
                                <textarea required value={qData.content} onChange={e => setQData({...qData, content: e.target.value})} className="w-full bg-slate-950 border border-slate-800 p-6 rounded-md text-white font-bold outline-none focus:border-brand-primary min-h-[120px]" placeholder="Define the assessment criteria..." />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest italic ml-2">Format</label>
                                    <select value={qData.type} onChange={e => setQData({...qData, type: e.target.value})} className="w-full bg-slate-950 border border-slate-800 h-14 px-6 rounded-md text-white font-bold outline-none focus:border-brand-primary uppercase text-xs">
                                        <option value="ShortAnswer">Short Answer</option>
                                        <option value="LongAnswer">Long Answer</option>
                                        <option value="MCQ">Multiple Choice</option>
                                        <option value="TrueFalse">True / False</option>
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest italic ml-2">Complexity</label>
                                    <select value={qData.difficulty} onChange={e => setQData({...qData, difficulty: e.target.value})} className="w-full bg-slate-950 border border-slate-800 h-14 px-6 rounded-md text-white font-bold outline-none focus:border-brand-primary uppercase text-xs">
                                        <option value="Easy">Routine (Easy)</option>
                                        <option value="Medium">Standard (Medium)</option>
                                        <option value="Hard">Complex (Hard)</option>
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest italic ml-2">Weightage</label>
                                    <input type="number" min="1" max="100" value={qData.marks} onChange={e => setQData({...qData, marks: Number(e.target.value)})} className="w-full bg-slate-950 border border-slate-800 h-14 px-6 rounded-md text-white font-bold outline-none focus:border-brand-primary text-xs" />
                                </div>
                            </div>

                            {qData.type === 'MCQ' && (
                                <div className="space-y-4 p-6 bg-slate-950 rounded-md border border-slate-800">
                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest italic">MCQ Parameters</label>
                                    <div className="grid grid-cols-2 gap-4">
                                        {qData.options.map((opt, i) => (
                                            <input key={i} type="text" placeholder={`Option ${i+1}`} value={opt} onChange={e => {
                                                const newOpts = [...qData.options];
                                                newOpts[i] = e.target.value;
                                                setQData({...qData, options: newOpts});
                                            }} className="w-full bg-slate-900 border border-slate-800 h-12 px-4 rounded-md text-white text-xs outline-none focus:border-brand-primary" />
                                        ))}
                                    </div>
                                    <input type="text" placeholder="Correct Answer (Exact Match)" value={qData.correctAnswer} onChange={e => setQData({...qData, correctAnswer: e.target.value})} className="w-full bg-slate-900 border-b-2 border-emerald-500 h-12 px-4 rounded-md text-white text-xs outline-none" />
                                </div>
                            )}

                            <button disabled={loading} type="submit" className="w-full h-16 bg-brand-primary hover:bg-teacher-primary text-white rounded-md font-black text-[11px] uppercase tracking-[0.3em] transition-all flex items-center justify-center gap-3 italic">
                                {loading ? <AlertCircle className="animate-spin" /> : <Save size={18} />} ARCHIVE NODE TO VAULT
                            </button>
                        </form>
                    </motion.div>
                )}

                {activeTab === 'bank' && (
                    <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.98 }} className="space-y-4">
                        {questions.length === 0 ? (
                            <div className="text-center py-40 border-2 border-dashed border-slate-800/50 rounded-md bg-slate-900/20">
                                <Database size={60} className="mx-auto text-slate-600 mb-6 opacity-30" />
                                <h3 className="text-xl font-black text-slate-400 uppercase tracking-widest italic">Vault is Empty</h3>
                            </div>
                        ) : (
                            questions.map((q, i) => (
                                <div key={q._id} className="bg-slate-900/40 p-6 rounded-md border border-slate-800/60 shadow-xl flex flex-col md:flex-row gap-6">
                                    <div className="flex flex-col items-center justify-center bg-slate-950 px-6 py-4 rounded-md border border-slate-800 min-w-[120px]">
                                        <span className="text-2xl font-black text-brand-primary italic">{q.marks}</span>
                                        <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Weight</span>
                                    </div>
                                    <div className="flex-1 space-y-3">
                                        <div className="flex items-center gap-3 text-[10px] font-black uppercase tracking-widest">
                                            <span className="text-slate-400 bg-slate-800/50 px-3 py-1 rounded-md">{q.classLevel}</span>
                                            <span className="text-slate-400 bg-slate-800/50 px-3 py-1 rounded-md">{q.type}</span>
                                            <span className={`${q.difficulty === 'Easy'? 'text-emerald-500' : q.difficulty==='Medium'?'text-amber-500':'text-rose-500'}`}>{q.difficulty}</span>
                                        </div>
                                        <p className="text-white font-bold leading-relaxed">{q.content}</p>
                                        {q.type === 'MCQ' && (
                                            <div className="grid grid-cols-2 max-w-lg gap-2 mt-4 text-xs font-medium text-slate-400">
                                                {q.options.map((o, idx) => <span key={idx} className="bg-slate-950 px-3 py-2 border border-slate-800 rounded-md truncate">• {o}</span>)}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))
                        )}
                    </motion.div>
                )}

                {activeTab === 'generate' && (
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        <div className="bg-slate-900/40 p-10 rounded-md border border-slate-800/60 shadow-2xl space-y-8 col-span-1">
                            <h2 className="text-2xl font-black text-brand-primary italic uppercase tracking-tighter flex items-center gap-3"><Wand2 /> Synthesis Matrix</h2>
                            <form onSubmit={handleGenerateExam} className="space-y-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest italic ml-2">Target Grade Index</label>
                                    <select required value={examParams.classLevel} onChange={e => setExamParams({...examParams, classLevel: e.target.value, subject: ''})} className="w-full bg-slate-950 border border-slate-800 h-14 px-6 rounded-md text-white font-bold outline-none focus:border-brand-primary appearance-none">
                                        <option value="">Select Target Index</option>
                                        {grades?.map(g => <option key={g} value={g}>{g}</option>)}
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest italic ml-2">Academic Parameter</label>
                                    <select required value={examParams.subject} onChange={e => setExamParams({...examParams, subject: e.target.value})} className="w-full bg-slate-950 border border-slate-800 h-14 px-6 rounded-md text-white font-bold outline-none focus:border-brand-primary appearance-none">
                                        <option value="">Select Parameter</option>
                                        {(() => {
                                            const filteredSubjs = Array.from(new Map(
                                                classes
                                                ?.filter(c => `Grade ${c.gradeLevel || c.standardId?.level}` === examParams.classLevel)
                                                .flatMap(c => c.subjects || [])
                                                .filter(Boolean)
                                                .map(s => [s._id, s])
                                            ).values());
                                            return filteredSubjs.map(s => <option key={s._id} value={s._id}>{s.name}</option>);
                                        })()}
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest italic ml-2">Total Weightage target</label>
                                    <input type="number" min="5" value={examParams.totalMarks} onChange={e => setExamParams({...examParams, totalMarks: Number(e.target.value)})} className="w-full bg-slate-950 border border-slate-800 h-14 px-6 rounded-md text-white font-bold outline-none focus:border-brand-primary" />
                                </div>
                                <button disabled={loading} type="submit" className="w-full h-16 bg-brand-primary hover:bg-teacher-primary text-white rounded-md font-black text-[11px] uppercase tracking-[0.3em] transition-all flex items-center justify-center shadow-[0_0_30px_rgba(59,130,246,0.2)] italic group">
                                    <Wand2 className="mr-3 group-hover:rotate-12 transition-transform" /> INITIATE SYNTHESIS
                                </button>
                            </form>
                        </div>
                        <div className="bg-[#020617] p-10 rounded-md border border-slate-800 shadow-[inset_0_0_100px_rgba(0,0,0,0.8)] col-span-2 overflow-y-auto max-h-[800px] custom-scrollbarThin relative">
                            {generatedExam ? (
                                <div className="space-y-12">
                                    <div className="text-center pb-8 border-b border-white/10">
                                        <h1 className="text-3xl font-black text-white italic tracking-tighter uppercase font-outfit">Synthesized Academic Deliverable</h1>
                                        <p className="text-slate-400 font-bold uppercase tracking-widest mt-2">{examParams.classLevel} | {examParams.subject} | Max Weight: {generatedExam.reduce((sum, q) => sum + q.marks, 0)}</p>
                                    </div>
                                    {generatedExam.map((q, i) => (
                                        <div key={q._id} className="space-y-4">
                                            <div className="flex items-start gap-4">
                                                <span className="text-xl font-black text-brand-primary italic">Q{i+1}.</span>
                                                <div className="flex-1">
                                                    <p className="text-white font-medium text-lg leading-relaxed">{q.content}</p>
                                                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mt-2">[{q.marks} marks] • {q.type}</p>
                                                    {q.type === 'MCQ' && (
                                                        <div className="space-y-2 mt-4 ml-4">
                                                            {q.options.map((opt, idx) => (
                                                                <div key={idx} className="flex gap-4 text-sm text-slate-300">
                                                                    <span className="font-bold">{String.fromCharCode(65 + idx)}.</span> {opt}
                                                                </div>
                                                            ))}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                    <div className="pt-10 flex justify-center border-t border-white/10">
                                        <button onClick={() => window.print()} className="px-10 h-14 bg-white hover:bg-slate-200 text-black rounded-md font-black uppercase tracking-[0.2em] italic transition-all flex items-center gap-3">
                                            <FileText /> Extract Output
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <div className="absolute inset-0 flex flex-col items-center justify-center opacity-30">
                                    <Target size={100} className="text-slate-600 mb-6" />
                                    <h3 className="text-2xl font-black text-slate-500 uppercase tracking-[0.5em]">Awaiting Synthesis</h3>
                                </div>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default QuestionBank;

// Mock Save icon since it was not explicitly imported above
const Save = ({ size }) => <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path><polyline points="17 21 17 13 7 13 7 21"></polyline><polyline points="7 3 7 8 15 8"></polyline></svg>;
