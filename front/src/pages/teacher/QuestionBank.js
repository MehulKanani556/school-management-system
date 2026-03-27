import React, { useEffect, useState, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchAssignedClasses } from '../../redux/slice/teacher.slice';
import axiosInstance from '../../utils/axiosInstance';
import { motion, AnimatePresence } from 'framer-motion';
import { Database, PlusCircle, Wand2, Search, Target, FileText, CheckCircle2, AlertCircle, FileQuestion, BookOpen, Download } from 'lucide-react';
import toast from 'react-hot-toast';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

const QuestionBank = () => {
    const dispatch = useDispatch();
    const { classes } = useSelector(state => state.teacher);
    const pdfRef = useRef();

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
    const [file, setFile] = useState(null);

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
            const formData = new FormData();
            formData.append('subject', qData.subject);
            formData.append('classLevel', qData.classLevel);
            formData.append('content', qData.content);
            formData.append('type', qData.type);
            formData.append('difficulty', qData.difficulty);
            formData.append('marks', qData.marks);

            if (qData.type === 'MCQ') {
                qData.options.filter(o => o.trim() !== '').forEach(o => formData.append('options', o));
                formData.append('correctAnswer', qData.correctAnswer);
            }
            
            if (file) formData.append('file', file);

            const res = await axiosInstance.post('/teacher/questions', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            toast.success(res.data.message);
            setQData({ ...qData, content: '', options: ['', '', '', ''], correctAnswer: '' });
            setFile(null);
            fetchQuestions();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to add question');
        } finally {
            setLoading(false);
        }
    };

    const handleGenerateExam = async (e) => {
        e.preventDefault();
        if (!examParams.subject || !examParams.classLevel) {
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
    const handleDownloadPDF = async () => {
        try {
            setLoading(true);
            const doc = new jsPDF();
            let yPos = 30;

            // Brand Header
            doc.setFillColor(2, 6, 23); // Slate 950
            doc.rect(0, 0, 210, 40, 'F');
            
            doc.setTextColor(255, 255, 255);
            doc.setFontSize(24);
            doc.setFont('helvetica', 'bold');
            doc.text('ACADEMIC ASSESSMENT', 105, 20, { align: 'center' });
            
            doc.setFontSize(10);
            const subText = `${examParams.classLevel} | SUBJECT ID: ${examParams.subject} | TOTAL MARKS: ${generatedExam.reduce((sum, q) => sum + q.marks, 0)}`;
            doc.text(subText, 105, 28, { align: 'center' });

            doc.setTextColor(0, 0, 0); // Reset to black for body
            yPos = 50;

            generatedExam.forEach((q, idx) => {
                // Page Break calculation
                if (yPos > 260) {
                    doc.addPage();
                    yPos = 20;
                }

                // Question Index
                doc.setFont('helvetica', 'bold');
                doc.setFontSize(12);
                doc.text(`QUESTION ${idx + 1}`, 15, yPos);
                doc.setFontSize(10);
                doc.setTextColor(100, 116, 139); // Slate 500
                doc.text(`[${q.marks} MARKS] - ${q.type}`, 160, yPos);
                yPos += 8;

                // Question Content
                doc.setTextColor(0, 0, 0);
                doc.setFont('helvetica', 'normal');
                const splitContent = doc.splitTextToSize(q.content, 180);
                doc.text(splitContent, 15, yPos);
                yPos += (splitContent.length * 5) + 5;

                // Options (if MCQ)
                if (q.type === 'MCQ' && q.options) {
                    q.options.forEach((opt, oIdx) => {
                        doc.text(`${String.fromCharCode(65 + oIdx)}. ${opt}`, 25, yPos);
                        yPos += 6;
                    });
                    yPos += 5;
                }

                yPos += 10;
                doc.setDrawColor(241, 245, 249); // Slate 100
                doc.line(15, yPos - 5, 195, yPos - 5);
                yPos += 5;
            });

            // Footer
            const pageCount = doc.internal.getNumberOfPages();
            for (let i = 1; i <= pageCount; i++) {
                doc.setPage(i);
                doc.setFontSize(8);
                doc.setTextColor(148, 163, 184); // Slate 400
                doc.text(`Generated via Assessing Synthesis Engine • Page ${i} of ${pageCount}`, 105, 285, { align: 'center' });
            }

            doc.save(`Assessment_${examParams.subject}_${examParams.classLevel.replace(' ', '_')}.pdf`);
            toast.success("Professional pdf document synthesized successfully.");
        } catch (error) {
            toast.error("Vector synthesis failure");
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    // Derived State for live preview in generator
    const matchingQuestions = questions.filter(q => {
        const matchSub = !examParams.subject || q.subject?._id === examParams.subject;
        const matchGrade = !examParams.classLevel || q.classLevel === examParams.classLevel;
        return matchSub && matchGrade;
    });

    return (
        <div className="space-y-8">
            <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 bg-slate-900/40 p-8 rounded-md border border-slate-800/60 shadow-2xl backdrop-blur-xl">
                <div className="space-y-2">
                    <div className="flex items-center gap-3 mb-2">
                        <span className="w-12 h-[2px] bg-brand-primary rounded-md"></span>
                        <span className="text-[10px] font-black uppercase tracking-[0.4em] text-brand-primary font-outfit">Evaluation Synthesis</span>
                    </div>
                    <h1 className="text-4xl font-black text-white italic uppercase tracking-tighter leading-none font-outfit">Question Bank & Exam Generator</h1>
                    <p className="text-slate-500 font-medium text-sm tracking-wide italic">Algorithmic assessment generation and secure evaluation node vault.</p>
                </div>

                <div className="flex bg-slate-950 p-2 rounded-md border border-slate-800 shadow-inner">
                    <button onClick={() => setActiveTab('add')} className={`px-5 py-2.5 rounded-md text-[10px] font-black uppercase tracking-widest transition-all italic flex items-center gap-2 ${activeTab === 'add' ? 'bg-brand-primary text-white shadow-xl' : 'text-slate-500 hover:text-white'}`}><PlusCircle size={14} /> Add Node</button>
                    <button onClick={() => setActiveTab('bank')} className={`px-5 py-2.5 rounded-md text-[10px] font-black uppercase tracking-widest transition-all italic flex items-center gap-2 ${activeTab === 'bank' ? 'bg-brand-primary text-white shadow-xl' : 'text-slate-500 hover:text-white'}`}><Database size={14} /> View Vault</button>
                </div>
            </header>

            <AnimatePresence mode="popLayout">
                {activeTab === 'add' && (
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="bg-slate-900/40 p-8 rounded-md border border-slate-800/60 shadow-2xl">
                        <form onSubmit={handleAddQuestion} className="max-w-4xl mx-auto space-y-6">
                            <h2 className="text-2xl font-black text-white italic uppercase tracking-tighter flex items-center gap-3"><FileQuestion className="text-brand-primary" /> Record New Evaluation Node</h2>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest italic ml-2">Target Grade Index</label>
                                    <select required value={qData.classLevel} onChange={e => setQData({ ...qData, classLevel: e.target.value, subject: '' })} className="w-full bg-slate-950 border border-slate-800 h-12 px-6 rounded-md text-white font-bold outline-none focus:border-brand-primary appearance-none">
                                        <option value="">Select Target Index</option>
                                        {grades?.map(g => <option key={g} value={g}>{g}</option>)}
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest italic ml-2">Academic Parameter (Subject ID/Name)</label>
                                    <select required value={qData.subject} onChange={e => setQData({ ...qData, subject: e.target.value })} className="w-full bg-slate-950 border border-slate-800 h-12 px-6 rounded-md text-white font-bold outline-none focus:border-brand-primary appearance-none">
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
                                <textarea required value={qData.content} onChange={e => setQData({ ...qData, content: e.target.value })} className="w-full bg-slate-950 border border-slate-800 p-6 rounded-md text-white font-bold outline-none focus:border-brand-primary min-h-[120px]" placeholder="Define the assessment criteria..." />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest italic ml-2">Format</label>
                                    <select value={qData.type} onChange={e => setQData({ ...qData, type: e.target.value })} className="w-full bg-slate-950 border border-slate-800 h-12 px-6 rounded-md text-white font-bold outline-none focus:border-brand-primary uppercase text-xs">
                                        <option value="ShortAnswer">Short Answer</option>
                                        <option value="LongAnswer">Long Answer</option>
                                        <option value="MCQ">Multiple Choice</option>
                                        <option value="TrueFalse">True / False</option>
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest italic ml-2">Complexity</label>
                                    <select value={qData.difficulty} onChange={e => setQData({ ...qData, difficulty: e.target.value })} className="w-full bg-slate-950 border border-slate-800 h-12 px-6 rounded-md text-white font-bold outline-none focus:border-brand-primary uppercase text-xs">
                                        <option value="Easy">Routine (Easy)</option>
                                        <option value="Medium">Standard (Medium)</option>
                                        <option value="Hard">Complex (Hard)</option>
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest italic ml-2">Weightage</label>
                                    <input type="number" min="1" max="100" value={qData.marks} onChange={e => setQData({ ...qData, marks: Number(e.target.value) })} className="w-full bg-slate-950 border border-slate-800 h-12 px-6 rounded-md text-white font-bold outline-none focus:border-brand-primary text-xs" />
                                </div>
                            </div>

                            {qData.type === 'MCQ' && (
                                <div className="space-y-4 p-6 bg-slate-950 rounded-md border border-slate-800">
                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest italic">MCQ Parameters</label>
                                    <div className="grid grid-cols-2 gap-4">
                                        {qData.options.map((opt, i) => (
                                            <input key={i} type="text" placeholder={`Option ${i + 1}`} value={opt} onChange={e => {
                                                const newOpts = [...qData.options];
                                                newOpts[i] = e.target.value;
                                                setQData({ ...qData, options: newOpts });
                                            }} className="w-full bg-slate-900 border border-slate-800 h-12 px-4 rounded-md text-white text-xs outline-none focus:border-brand-primary" />
                                        ))}
                                    </div>
                                    <input type="text" placeholder="Correct Answer (Exact Match)" value={qData.correctAnswer} onChange={e => setQData({ ...qData, correctAnswer: e.target.value })} className="w-full bg-slate-900 border-b-2 border-emerald-500 h-12 px-4 rounded-md text-white text-xs outline-none" />
                                </div>
                            )}

                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest italic ml-2">Supplemental Attachment (PDF/Image)</label>
                                <div className="relative group">
                                    <input type="file" accept=".pdf,image/*" onChange={e => setFile(e.target.files[0])} className="hidden" id="node-file" />
                                    <label htmlFor="node-file" className="block w-full bg-slate-950/50 border-2 border-dashed border-slate-800 p-8 rounded-md text-center cursor-pointer hover:border-brand-primary transition-all">
                                        <div className="flex flex-col items-center gap-2">
                                            <FileText className={`${file ? 'text-emerald-500' : 'text-slate-600'}`} size={32} />
                                            <span className="text-xs font-bold text-slate-500">{file ? file.name : 'Select or drop supplemental resources (.pdf, .png, .jpg)'}</span>
                                        </div>
                                    </label>
                                    {file && <button type="button" onClick={() => setFile(null)} className="absolute top-2 right-2 text-rose-500 hover:bg-rose-500/10 p-1 rounded-md text-[10px] font-black italic">DISCARD</button>}
                                </div>
                            </div>

                            <button disabled={loading} type="submit" className="w-full h-16 bg-brand-primary hover:bg-teacher-primary text-white rounded-md font-black text-[11px] uppercase tracking-[0.3em] transition-all flex items-center justify-center gap-3 italic">
                                {loading ? <AlertCircle className="animate-spin" /> : <Save size={18} />} ARCHIVE NODE TO VAULT
                            </button>
                        </form>
                    </motion.div>
                )}

                {activeTab === 'bank' && (
                    <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.98 }} className="space-y-6">
                        <div className="bg-slate-900/40 p-8 rounded-md border border-slate-800 space-y-8">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="space-y-3">
                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] italic ml-2">1. Select Grade Stratum</label>
                                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                                        {Array.from(new Set(questions.map(q => q.classLevel))).sort().map(g => (
                                            <button 
                                                key={g} 
                                                onClick={() => setExamParams({ ...examParams, classLevel: g, subject: '' })}
                                                className={`h-12 rounded-md text-[10px] font-black uppercase tracking-widest transition-all border ${examParams.classLevel === g ? 'bg-brand-primary border-brand-primary text-white shadow-lg shadow-brand-primary/20' : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-600'}`}
                                            >
                                                {g}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {examParams.classLevel && (
                                    <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className="space-y-3">
                                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] italic ml-2">2. Isolate Subject Vector</label>
                                        <div className="grid grid-cols-2 gap-2">
                                            {Array.from(new Map(
                                                questions
                                                    .filter(q => q.classLevel === examParams.classLevel)
                                                    .map(q => [q.subject?._id, q.subject])
                                            ).values()).map(s => (
                                                <button 
                                                    key={s._id} 
                                                    onClick={() => setExamParams({ ...examParams, subject: s._id })}
                                                    className={`h-12 px-4 rounded-md text-[10px] font-black uppercase tracking-widest transition-all border truncate ${examParams.subject === s._id ? 'bg-emerald-600 border-emerald-600 text-white shadow-lg shadow-emerald-600/20' : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-600'}`}
                                                >
                                                    {s.name}
                                                </button>
                                            ))}
                                        </div>
                                    </motion.div>
                                )}
                            </div>

                            {examParams.classLevel && examParams.subject && (
                                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="pt-6 border-t border-slate-800 flex justify-center">
                                    <button 
                                        onClick={() => setActiveTab('generate')}
                                        className="h-16 px-12 bg-white hover:bg-brand-primary hover:text-white text-black rounded-md text-[11px] font-black uppercase tracking-[0.4em] transition-all italic flex items-center gap-4 shadow-2xl group"
                                    >
                                        <Wand2 className="group-hover:rotate-12 transition-transform" /> 
                                        Initialize Synthesis Engine for this Sector
                                    </button>
                                </motion.div>
                            )}
                        </div>

                        {examParams.classLevel && examParams.subject && (
                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="grid grid-cols-1 gap-4">
                                <div className="flex items-center gap-3 mb-2 px-2">
                                    <Database size={14} className="text-brand-primary" />
                                    <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 italic">Sector Repository Nodes</h3>
                                </div>
                                {questions
                                    .filter(q => q.classLevel === examParams.classLevel && q.subject?._id === examParams.subject)
                                    .map((q) => (
                                    <div key={q._id} className="group relative bg-slate-900/40 border border-slate-800/60 p-6 rounded-md hover:border-brand-primary hover:bg-slate-900/60 transition-all">
                                        <div className="flex flex-col gap-4">
                                            <div className="flex items-center gap-3 text-[10px] font-bold uppercase tracking-widest text-slate-500">
                                                <span className="bg-slate-800 px-2 py-1 rounded-md">{q.type}</span>
                                                <span className={`${q.difficulty === 'Easy' ? 'text-emerald-500' : q.difficulty === 'Medium' ? 'text-amber-500' : 'text-rose-500'}`}>{q.difficulty}</span>
                                            </div>
                                            <p className="text-white font-bold leading-relaxed">{q.content}</p>
                                            {q.type === 'MCQ' && (
                                                <div className="grid grid-cols-2 max-w-lg gap-2 text-xs font-medium text-slate-400">
                                                    {q.options.map((o, idx) => <span key={idx} className="bg-slate-950 px-3 py-2 border border-slate-800 rounded-md truncate">• {o}</span>)}
                                                </div>
                                            )}
                                            {q.fileUrl && (
                                                <a href={q.fileUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 w-fit px-4 py-2 bg-emerald-500/10 border border-emerald-500/30 rounded-md text-emerald-500 text-[10px] font-black italic hover:bg-emerald-500/20 transition-all">
                                                    <FileText size={14} /> DOWNLOAD ATTACHMENT
                                                </a>
                                            )}
                                        </div>
                                        <div className="absolute top-6 right-6 w-12 h-12 rounded-md bg-slate-950 border border-slate-800 flex flex-col items-center justify-center group-hover:border-emerald-500 transition-colors">
                                            <span className="text-xl font-black text-white">{q.marks}</span>
                                            <span className="text-[7px] font-black text-slate-500 uppercase">Weight</span>
                                        </div>
                                    </div>
                                ))}
                            </motion.div>
                        )}
                    </motion.div>
                )}

                {activeTab === 'generate' && (
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        <div className="bg-slate-900/40 p-8 rounded-md border border-slate-800/60 shadow-2xl space-y-6 col-span-1">
                            <h2 className="text-2xl font-black text-brand-primary italic uppercase tracking-tighter flex items-center gap-3"><Wand2 /> Synthesis Matrix</h2>
                            <form onSubmit={handleGenerateExam} className="space-y-5">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest italic ml-2">Target Grade Index</label>
                                    <select required value={examParams.classLevel} onChange={e => setExamParams({ ...examParams, classLevel: e.target.value, subject: '' })} className="w-full bg-slate-950 border border-slate-800 h-12 px-6 rounded-md text-white font-bold outline-none focus:border-brand-primary appearance-none">
                                        <option value="">Select Target Index</option>
                                        {grades?.map(g => <option key={g} value={g}>{g}</option>)}
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest italic ml-2">Academic Parameter</label>
                                    <select required value={examParams.subject} onChange={e => setExamParams({ ...examParams, subject: e.target.value })} className="w-full bg-slate-950 border border-slate-800 h-12 px-6 rounded-md text-white font-bold outline-none focus:border-brand-primary appearance-none">
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
                                    <input type="number" min="5" value={examParams.totalMarks} onChange={e => setExamParams({ ...examParams, totalMarks: Number(e.target.value) })} className="w-full bg-slate-950 border border-slate-800 h-12 px-6 rounded-md text-white font-bold outline-none focus:border-brand-primary" />
                                </div>
                                <button disabled={loading} type="submit" className="w-full h-16 bg-brand-primary hover:bg-teacher-primary text-white rounded-md font-black text-[11px] uppercase tracking-[0.3em] transition-all flex items-center justify-center shadow-[0_0_30px_rgba(59,130,246,0.2)] italic group">
                                    <Wand2 className="mr-3 group-hover:rotate-12 transition-transform" /> INITIATE SYNTHESIS
                                </button>
                            </form>

                            {/* Live Vault Preview */}
                            {(examParams.subject || examParams.classLevel) && (
                                <div className="mt-8 space-y-4">
                                    <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                                        <h4 className="text-[10px] font-black italic uppercase tracking-widest text-slate-500">Live Vault Preview</h4>
                                        <span className="text-[10px] bg-slate-800 px-2 py-0.5 rounded text-white font-bold">{matchingQuestions.length} Matches</span>
                                    </div>
                                    <div className="max-h-[300px] overflow-y-auto custom-scrollbarThin pr-2 space-y-2">
                                        {matchingQuestions.map(q => (
                                            <div key={q._id} className="p-3 bg-slate-950/40 border border-slate-800 rounded-md group hover:border-brand-primary transition-all">
                                                <div className="flex justify-between items-start mb-1">
                                                    <span className="text-[8px] font-black text-slate-500 uppercase">{q.type} | {q.marks}M</span>
                                                </div>
                                                <p className="text-[11px] text-slate-400 line-clamp-2">{q.content}</p>
                                            </div>
                                        ))}
                                        {matchingQuestions.length === 0 && (
                                            <div className="py-10 text-center opacity-40 italic text-xs text-slate-500">No matching evaluation nodes found in vault</div>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                        <div className="bg-[#020617] p-8 rounded-md border border-slate-800 shadow-[inset_0_0_100px_rgba(0,0,0,0.8)] col-span-2 overflow-y-auto max-h-[800px] custom-scrollbarThin relative">
                            {generatedExam ? (
                                <div className="space-y-12">
                                    <div className="text-center pb-8 border-b border-white/10">
                                        <h1 className="text-3xl font-black text-white italic tracking-tighter uppercase font-outfit">Synthesized Academic Deliverable</h1>
                                        <p className="text-slate-400 font-bold uppercase tracking-widest mt-2">{examParams.classLevel} | {examParams.subject} | Max Weight: {generatedExam.reduce((sum, q) => sum + q.marks, 0)}</p>
                                    </div>
                                    {generatedExam.map((q, i) => (
                                        <div key={q._id} className="space-y-4">
                                            <div className="flex items-start gap-4">
                                                <span className="text-xl font-black text-brand-primary italic">Q{i + 1}.</span>
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
                                        <button 
                                            onClick={handleDownloadPDF} 
                                            disabled={loading}
                                            className="px-10 h-14 bg-white hover:bg-teacher-primary hover:text-white text-black rounded-md font-black uppercase tracking-[0.2em] italic transition-all flex items-center gap-3 active:scale-95 disabled:opacity-50"
                                        >
                                            <Download size={18} /> DOWNLOAD OFFICIAL PDF
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
