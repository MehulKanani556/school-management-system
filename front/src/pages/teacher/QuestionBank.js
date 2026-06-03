import React, { useEffect, useState, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchAssignedClasses } from '../../redux/slice/teacher.slice';
import axiosInstance from '../../utils/axiosInstance';
import { motion, AnimatePresence, Reorder } from 'framer-motion';
import { Database, PlusCircle, Wand2, Search, Target, FileText, CheckCircle2, AlertCircle, FileQuestion, BookOpen, Download, Save, Grid, List, GripVertical, Trash2, Check, Plus, Edit2 } from 'lucide-react';
import toast from 'react-hot-toast';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

const QuestionBank = () => {
    const dispatch = useDispatch();
    const { classes } = useSelector(state => state.teacher);
    const pdfRef = useRef();
    const printContainerRef = useRef();

    // Unique subjects from assigned classes
    const grades = Array.from(new Set(classes.map(c => `Grade ${c.gradeLevel || c.standardId?.level}`)));

    const [activeTab, setActiveTab] = useState('add'); // 'add', 'bank', 'generate'
    const [loading, setLoading] = useState(false);
    const [editMode, setEditMode] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [isBulk, setIsBulk] = useState(false);
    const [bulkContent, setBulkContent] = useState('');
    const [viewType, setViewType] = useState('compact'); // 'compact' or 'detailed'

    // Persistent Custom Formats
    const defaultTypes = ['MCQ', 'FillInBlank', 'OneWord', 'TrueFalse', 'ShortAnswer', 'LongAnswer', 'CaseStudy', 'Numerical', 'MatchTheFollowing'];
    const [customTypes, setCustomTypes] = useState([]);
    const [newTypeName, setNewTypeName] = useState('');

    useEffect(() => {
        axiosInstance.get('/teacher/question-types')
            .then((res) => setCustomTypes(Array.isArray(res.data) ? res.data : []))
            .catch(() => {
                const stored = localStorage.getItem('sms_custom_question_types');
                if (stored) setCustomTypes(JSON.parse(stored));
            });
    }, []);

    const addCustomType = async () => {
        if (!newTypeName.trim()) return;
        const updated = [...customTypes, newTypeName.trim()];
        setCustomTypes(updated);
        try {
            await axiosInstance.put('/teacher/question-types', { types: updated });
            localStorage.setItem('sms_custom_question_types', JSON.stringify(updated));
            setNewTypeName('');
            toast.success(`'${newTypeName}' saved to school question types`);
        } catch {
            toast.error('Failed to save question type');
        }
    };

    const allTypes = [...defaultTypes, ...customTypes];

    // Add/Edit Question State
    const [qData, setQData] = useState({
        subject: '',
        classLevel: '',
        content: '',
        type: 'MCQ',
        difficulty: 'Medium',
        marks: 1,
        options: ['', '', '', ''],
        correctAnswer: ''
    });

    // Generate Exam State
    const [examParams, setExamParams] = useState({
        subject: '',
        classLevel: '',
        totalMarks: 20,
        title: 'ACADEMIC ASSESSMENT'
    });
    
    // Structure: [{ type: 'MCQ', questions: [...] }]
    const [paperSections, setPaperSections] = useState([]); 
    const [expandedSections, setExpandedSections] = useState([]);

    const [questions, setQuestions] = useState([]);
    const [file, setFile] = useState(null);
    const [selectedIds, setSelectedIds] = useState([]);

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

            if (editMode && editingId) {
                const res = await axiosInstance.put(`/teacher/questions/${editingId}`, formData, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
                toast.success(res.data.message || 'Node Updated');
            } else {
                const res = await axiosInstance.post('/teacher/questions', formData, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
                toast.success(res.data.message);
            }

            setQData({ ...qData, content: '', options: ['', '', '', ''], correctAnswer: '' });
            setFile(null);
            setEditMode(false);
            setEditingId(null);
            fetchQuestions();
            setActiveTab('bank');
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to add question');
        } finally {
            setLoading(false);
        }
    };

    const handleBulkSubmit = async (e) => {
        e.preventDefault();
        if (!bulkContent.trim()) return;

        try {
            setLoading(true);
            const questionLines = bulkContent.split('\n').filter(line => line.trim() !== '');
            
            const questionsToInsert = questionLines.map(content => ({
                subject: qData.subject,
                classLevel: qData.classLevel,
                content: content.trim(),
                type: qData.type,
                difficulty: qData.difficulty,
                marks: qData.marks,
                options: qData.type === 'MCQ' ? ['', '', '', ''] : [],
                correctAnswer: ''
            }));

            const res = await axiosInstance.post('/teacher/bulk-questions', {
                questions: questionsToInsert
            });

            toast.success(res.data.message);
            setBulkContent('');
            fetchQuestions();
            setActiveTab('bank');
        } catch (error) {
            toast.error(error.response?.data?.message || 'Bulk Archive Failure');
        } finally {
            setLoading(false);
        }
    };

    const handleGenerateExam = async (e, onlySelected = false) => {
        if (e) e.preventDefault();
        
        let targetQuestions = [];
        if (onlySelected) {
            targetQuestions = questions.filter(q => selectedIds.includes(q._id));
        } else {
            if (!examParams.subject || !examParams.classLevel) {
                return toast.error("Selection parameters required from Vault");
            }
            targetQuestions = questions.filter(q => 
                q.classLevel === examParams.classLevel && 
                q.subject?._id === examParams.subject
            );
        }
        
        if (targetQuestions.length === 0) {
            return toast.error("No questions selected or found for this criteria");
        }

        // Logic: Group matching questions into sections initially
        const grouped = targetQuestions.reduce((acc, q) => {
            const existing = acc.find(s => s.type === q.type);
            if (existing) {
                existing.questions.push(q);
            } else {
                acc.push({ type: q.type, questions: [q] });
            }
            return acc;
        }, []);

        setPaperSections(grouped);
        setExpandedSections(grouped.map(s => s.type)); // Expand all initially
        setSelectedIds([]); // Clear selection after use
        setActiveTab('generate');
        toast.success(`Matrix Synced with ${targetQuestions.length} Nodes`, {
            icon: '⚡',
            style: { borderRadius: '0px', background: '#020617', color: '#fff', border: '1px solid #1e293b' }
        });
    };

    const toggleSelection = (id) => {
        setSelectedIds(prev => 
            prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
        );
    };

    const handleSelectAllMatches = () => {
        const matches = questions.filter(q => q.classLevel === examParams.classLevel && q.subject?._id === examParams.subject);
        if (selectedIds.length === matches.length) {
            setSelectedIds([]);
        } else {
            setSelectedIds(matches.map(q => q._id));
        }
    };

    const handleEditClick = (q) => {
        setEditMode(true);
        setEditingId(q._id);
        setQData({
            subject: q.subject?._id || '',
            classLevel: q.classLevel,
            content: q.content,
            type: q.type,
            difficulty: q.difficulty,
            marks: q.marks,
            options: q.options && q.options.length > 0 ? q.options : ['', '', '', ''],
            correctAnswer: q.correctAnswer || ''
        });
        setActiveTab('add');
    };

    const reorderSections = (newSections) => {
        setPaperSections(newSections);
    };

    const reorderQuestions = (sectionIndex, newQuestions) => {
        const updated = [...paperSections];
        updated[sectionIndex].questions = newQuestions;
        setPaperSections(updated);
    };

    const removeQuestionFromPaper = (sectionIndex, qId) => {
        const newSections = [...paperSections];
        newSections[sectionIndex].questions = newSections[sectionIndex].questions.filter(q => q._id !== qId);
        // Remove empty sections
        setPaperSections(newSections.filter(s => s.questions.length > 0));
    };

    const toggleSection = (type) => {
        setExpandedSections(prev => 
            prev.includes(type) ? prev.filter(t => t !== type) : [...prev, type]
        );
    };

    const getFlattenedQuestions = () => {
        return paperSections.flatMap(s => s.questions);
    };

    const handleDownloadPDF = () => {
        try {
            setLoading(true);
            const printContent = printContainerRef.current;
            if (!printContent) throw new Error("Synthesis buffer not initialized");

            const printWindow = window.open('', '_blank', 'width=900,height=1000');
            const styles = Array.from(document.querySelectorAll('style, link[rel="stylesheet"]'))
                .map(s => s.outerHTML)
                .join('\n');

            printWindow.document.write(`
                <html>
                    <head>
                        <title>Academic_Assessment_${examParams.title}</title>
                        <script src="https://cdn.tailwindcss.com"></script>
                        <style>
                            @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;700;900&display=swap');
                            body { font-family: 'Outfit', sans-serif; -webkit-print-color-adjust: exact; background: white; color: black; }
                            @media print {
                                body { padding: 0; margin: 0; }
                                .no-print { display: none; }
                                .page-break { page-break-after: always; }
                            }
                            .print-header { border-bottom: 4px solid #0f172a; padding-bottom: 2rem; margin-bottom: 3rem; text-align: center; }
                            .section-title { font-weight: 900; font-style: italic; text-transform: uppercase; border-bottom: 2px solid #e2e8f0; padding-bottom: 0.5rem; margin-top: 2rem; margin-bottom: 1.5rem; display: flex; align-items: center; gap: 1rem; }
                            .section-title::after { content: ''; flex: 1; height: 1px; background: #e2e8f0; }
                            .question-node { position: relative; margin-bottom: 2rem; }
                            .marks-badge { font-family: monospace; font-weight: 900; color: #94a3b8; font-size: 0.75rem; }
                        </style>
                    </head>
                    <body class="p-12">
                        <div class="max-w-[800px] mx-auto">
                            ${printContent.innerHTML}
                        </div>
                        <script>
                            setTimeout(() => {
                                window.print();
                                window.close();
                            }, 500);
                        </script>
                    </body>
                </html>
            `);
            printWindow.document.close();
        } catch (error) {
            toast.error("Synthesis Engine Failure: " + error.message);
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
                        <span className="text-[10px] font-black uppercase tracking-[0.4em] text-brand-primary font-outfit">Question Management</span>
                    </div>
                    <h1 className="text-4xl font-black text-white italic uppercase tracking-tighter leading-none font-outfit">Question Bank & Paper Generator</h1>
                    <p className="text-slate-500 font-medium text-sm tracking-wide italic">Manage your question repository and generate customized exam papers.</p>
                </div>

                <div className="flex bg-slate-950 p-2 rounded-md border border-slate-800 shadow-inner">
                    <button onClick={() => { setActiveTab('add'); setEditMode(false); setEditingId(null); }} className={`px-5 py-2.5 rounded-md text-[10px] font-black uppercase tracking-widest transition-all italic flex items-center gap-2 ${activeTab === 'add' ? 'bg-brand-primary text-white shadow-xl' : 'text-slate-500 hover:text-white'}`}><PlusCircle size={14} /> {editMode ? 'Edit Question' : 'Add Question'}</button>
                    <button onClick={() => setActiveTab('bank')} className={`px-5 py-2.5 rounded-md text-[10px] font-black uppercase tracking-widest transition-all italic flex items-center gap-2 ${activeTab === 'bank' ? 'bg-brand-primary text-white shadow-xl' : 'text-slate-500 hover:text-white'}`}><Database size={14} /> Question Bank</button>
                    {paperSections.length > 0 && (
                        <button onClick={() => setActiveTab('generate')} className={`px-5 py-2.5 rounded-md text-[10px] font-black uppercase tracking-widest transition-all italic flex items-center gap-2 ${activeTab === 'generate' ? 'bg-brand-primary text-white shadow-xl' : 'text-slate-500 hover:text-white'}`}><Wand2 size={14} /> Current Paper</button>
                    )}
                </div>
            </header>

            <AnimatePresence>
                {/* Hidden Printable Buffer to support All Languages via Canvas-to-PDF */}
                <div style={{ position: 'absolute', left: '-9999px', top: 0, pointerEvents: 'none' }}>
                    <div ref={printContainerRef} className="bg-white text-black p-12" style={{ width: '800px', fontFamily: 'Arial, sans-serif' }}>
                        <div className="text-center border-b-4 border-slate-900 pb-8 mb-12">
                            <h1 className="text-4xl font-black uppercase tracking-tight mb-2">{examParams.title}</h1>
                            <div className="flex justify-center gap-6 text-sm font-bold text-slate-600">
                                <span>GRADE: {examParams.classLevel}</span>
                                <span className="uppercase">SUBJECT: {questions.find(q => q.subject?._id === examParams.subject)?.subject?.name}</span>
                                <span>TOTAL MARKS: {paperSections.reduce((acc, s) => acc + s.questions.reduce((qa, q) => qa + q.marks, 0), 0)}</span>
                            </div>
                        </div>

                        {paperSections.map((section, sIdx) => {
                            const sectionLabels = ['A', 'B', 'C', 'D', 'E', 'F'];
                            return (
                                <div key={sIdx} className="mb-12">
                                    <div className="flex items-center gap-4 mb-6">
                                        <h2 className="text-xl font-black uppercase flex-shrink-0">
                                            SECTION {sectionLabels[sIdx] || 'X'}: {section.type.replace(/([A-Z])/g, ' $1').trim()}
                                        </h2>
                                        <div className="h-0.5 w-full bg-slate-200"></div>
                                    </div>

                                    <div className="space-y-8">
                                        {section.questions.map((q, qIdx) => (
                                            <div key={qIdx} className="relative">
                                                <div className="flex justify-between items-start mb-2">
                                                    <span className="font-bold text-lg">Q{qIdx + 1}.</span>
                                                    <span className="font-black text-slate-400 text-xs">[{q.marks} MARKS]</span>
                                                </div>
                                                <div className="pl-8">
                                                    <p className="text-lg leading-relaxed mb-4" style={{ wordBreak: 'break-word' }}>{q.content}</p>
                                                    {q.type === 'MCQ' && q.options && (
                                                        <div className="grid grid-cols-2 gap-y-3 gap-x-12 mt-4">
                                                            {q.options.map((opt, oIdx) => (
                                                                <div key={oIdx} className="text-md flex gap-3">
                                                                    <span className="font-bold text-slate-400">{String.fromCharCode(65 + oIdx)}.</span>
                                                                    <span>{opt}</span>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            );
                        })}

                        <div className="mt-20 pt-8 border-t border-slate-200 text-center">
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest italic">
                                Original Academic Document synthesized via Advanced Node Synthesis Engine
                            </p>
                        </div>
                    </div>
                </div>

                {activeTab === 'add' && (
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="bg-slate-900/40 p-5 rounded-md border border-slate-800/60 shadow-2xl">
                        <form onSubmit={isBulk ? handleBulkSubmit : handleAddQuestion} className="max-w-4xl mx-auto space-y-4">
                            <div className="flex items-center justify-between border-b border-slate-800/50 pb-3">
                                <h2 className="text-xl font-black text-white italic uppercase tracking-tighter flex items-center gap-2"><FileQuestion className="text-brand-primary" size={20} /> {editMode ? `Update Question` : 'Add New Question'}</h2>
                                {!editMode && (
                                    <button 
                                        type="button" 
                                        onClick={() => setIsBulk(!isBulk)}
                                        className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest transition-all ${isBulk ? 'bg-brand-primary text-white' : 'bg-slate-800 text-slate-500'}`}
                                    >
                                        {isBulk ? 'Bulk Mode: ON' : 'Single Mode'}
                                    </button>
                                )}
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest italic ml-2">Class / Grade</label>
                                    <select required value={qData.classLevel} onChange={e => setQData({ ...qData, classLevel: e.target.value, subject: '' })} className="w-full bg-slate-950 border border-slate-800 h-10 px-4 rounded-md text-white font-bold outline-none focus:border-brand-primary text-xs">
                                        <option value="">Select Class</option>
                                        {grades?.map(g => <option key={g} value={g}>{g}</option>)}
                                    </select>
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest italic ml-2">Subject</label>
                                    <select required value={qData.subject} onChange={e => setQData({ ...qData, subject: e.target.value })} className="w-full bg-slate-950 border border-slate-800 h-10 px-4 rounded-md text-white font-bold outline-none focus:border-brand-primary text-xs">
                                        <option value="">Select Subject</option>
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

                            <div className="space-y-1">
                                <div className="flex justify-between items-end">
                                    <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest italic ml-2">{isBulk ? 'Bulk Questions' : 'Question Text'}</label>
                                    {isBulk && <span className="text-[8px] text-slate-600 font-bold uppercase mb-1">Enter each question on a new line</span>}
                                </div>
                                {isBulk ? (
                                    <textarea required value={bulkContent} onChange={e => setBulkContent(e.target.value)} className="w-full bg-slate-950 border border-slate-800 p-4 rounded-md text-white font-bold outline-none focus:border-brand-primary min-h-[160px] text-sm" placeholder="Question 1...&#10;Question 2...&#10;Question 3..." />
                                ) : (
                                    <textarea required value={qData.content} onChange={e => setQData({ ...qData, content: e.target.value })} className="w-full bg-slate-950 border border-slate-800 p-4 rounded-md text-white font-bold outline-none focus:border-brand-primary min-h-[100px] text-sm" placeholder="Enter the question text here..." />
                                )}
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="space-y-2">
                                    <div className="space-y-1">
                                        <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest italic ml-2">Format</label>
                                        <select value={qData.type} onChange={e => setQData({ ...qData, type: e.target.value })} className="w-full bg-slate-950 border border-slate-800 h-10 px-4 rounded-md text-white font-bold outline-none focus:border-brand-primary uppercase text-[10px]">
                                            {allTypes.map(t => (
                                                <option key={t} value={t}>{t.replace(/([A-Z])/g, ' $1').trim()}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="flex items-center gap-2 p-3 bg-slate-950/40 border border-slate-800 rounded-md">
                                        <input 
                                            placeholder="Add Custom Format..." 
                                            value={newTypeName} 
                                            onChange={e => setNewTypeName(e.target.value)}
                                            className="flex-1 bg-transparent border-b border-slate-800 text-[10px] outline-none text-white focus:border-brand-primary"
                                        />
                                        <button type="button" onClick={addCustomType} className="px-3 py-1 bg-slate-800 hover:bg-brand-primary text-[8px] font-black uppercase rounded transition-all">Add</button>
                                    </div>
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest italic ml-2">Complexity</label>
                                    <select value={qData.difficulty} onChange={e => setQData({ ...qData, difficulty: e.target.value })} className="w-full bg-slate-950 border border-slate-800 h-10 px-4 rounded-md text-white font-bold outline-none focus:border-brand-primary uppercase text-[10px]">
                                        <option value="Easy">Routine</option>
                                        <option value="Medium">Standard</option>
                                        <option value="Hard">Complex</option>
                                    </select>
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest italic ml-2">Marks</label>
                                    <input type="number" min="1" max="100" value={qData.marks} onChange={e => setQData({ ...qData, marks: Number(e.target.value) })} className="w-full bg-slate-950 border border-slate-800 h-10 px-4 rounded-md text-white font-bold outline-none focus:border-brand-primary text-[10px]" />
                                </div>
                            </div>

                            {!isBulk && qData.type === 'MCQ' && (
                                <div className="space-y-3 p-4 bg-slate-950 rounded-md border border-slate-800">
                                    <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest italic">Option Matrix</label>
                                    <div className="grid grid-cols-2 gap-3">
                                        {qData.options.map((opt, i) => (
                                            <input key={i} type="text" placeholder={`Option ${i + 1}`} value={opt} onChange={e => {
                                                const newOpts = [...qData.options];
                                                newOpts[i] = e.target.value;
                                                setQData({ ...qData, options: newOpts });
                                            }} className="w-full bg-slate-900 border border-slate-800 h-10 px-4 rounded-md text-white text-[10px] outline-none focus:border-brand-primary" />
                                        ))}
                                    </div>
                                    <input type="text" placeholder="Specify Correct Answer (Exact Match)" value={qData.correctAnswer} onChange={e => setQData({ ...qData, correctAnswer: e.target.value })} className="w-full bg-slate-900 border-b border-emerald-500 h-10 px-4 rounded-md text-white text-[10px] outline-none" />
                                </div>
                            )}

                            {!isBulk && (
                                <div className="space-y-1">
                                    <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest italic ml-2">Attachments</label>
                                    <div className="relative group">
                                        <input type="file" accept=".pdf,image/*" onChange={e => setFile(e.target.files[0])} className="hidden" id="node-file" />
                                        <label htmlFor="node-file" className="block w-full bg-slate-950/30 border border-dashed border-slate-800 p-4 rounded-md text-center cursor-pointer hover:border-brand-primary transition-all">
                                            <div className="flex items-center justify-center gap-3">
                                                <FileText className={`${file ? 'text-emerald-500' : 'text-slate-600'}`} size={20} />
                                                <span className="text-[10px] font-bold text-slate-500">{file ? file.name : 'Select Supplementary File (.pdf, .png, .jpg)'}</span>
                                            </div>
                                        </label>
                                    </div>
                                </div>
                            )}

                            <button disabled={loading} type="submit" className="w-full h-12 bg-white hover:bg-brand-primary text-black hover:text-white rounded-md font-black text-[10px] uppercase tracking-[0.3em] transition-all flex items-center justify-center gap-3 italic mt-2">
                                {loading ? <AlertCircle className="animate-spin" /> : <Save size={16} />} {editMode ? 'UPDATE QUESTION' : isBulk ? `SAVE ${bulkContent.split('\n').filter(Boolean).length} QUESTIONS TO BANK` : 'SAVE QUESTION TO BANK'}
                            </button>
                        </form>
                    </motion.div>
                )}                {activeTab === 'bank' && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-6">
                        {/* Grade/Subject Segment Cards */}
                        <div className="bg-slate-900/20 p-6 rounded-md border border-slate-800/40 backdrop-blur-sm space-y-6">
                            <div className="space-y-3">
                                <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] italic flex items-center gap-2">
                                    <div className="w-1.5 h-1.5 rounded-full bg-brand-primary"></div> Select Class
                                </h4>
                                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
                                    {Array.from(new Set([
                                        ...classes.map(c => `Grade ${c.gradeLevel || c.standardId?.level}`),
                                        ...questions.map(q => q.classLevel)
                                    ].filter(Boolean))).sort().map(g => (
                                        <button 
                                            key={g} 
                                            onClick={() => setExamParams({ ...examParams, classLevel: g, subject: '' })}
                                            className={`group relative p-4 rounded-md border transition-all overflow-hidden ${examParams.classLevel === g ? 'bg-brand-primary border-brand-primary shadow-xl shadow-brand-primary/20' : 'bg-slate-950/60 border-slate-800/60 hover:border-slate-700'}`}
                                        >
                                            <div className="relative z-10 flex flex-col items-start gap-2">
                                                <div className={`p-2 rounded-md ${examParams.classLevel === g ? 'bg-white/10' : 'bg-brand-primary/10'}`}>
                                                    <BookOpen size={14} className={examParams.classLevel === g ? 'text-white' : 'text-brand-primary'} />
                                                </div>
                                                <span className={`text-[11px] font-black uppercase italic ${examParams.classLevel === g ? 'text-white' : 'text-slate-400'}`}>{g}</span>
                                                <span className={`text-[8px] font-bold opacity-60 ${examParams.classLevel === g ? 'text-white' : 'text-slate-600'}`}>{questions.filter(q => q.classLevel === g).length} Questions</span>
                                            </div>
                                            {/* Background Decoration */}
                                            <div className="absolute -right-2 -bottom-2 opacity-10 group-hover:opacity-20 transition-all">
                                                <BookOpen size={60} />
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {examParams.classLevel && (
                                <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className="space-y-3 pt-4 border-t border-slate-800/30">
                                    <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] italic flex items-center gap-2">
                                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div> Select Subject [{examParams.classLevel}]
                                    </h4>
                                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-3">
                                        {(() => {
                                            const assignedSubjs = Array.from(new Map(
                                                classes
                                                    ?.filter(c => `Grade ${c.gradeLevel || c.standardId?.level}` === examParams.classLevel)
                                                    .flatMap(c => c.subjects || [])
                                                    .filter(Boolean)
                                                    .map(s => [s._id, s])
                                            ).values());

                                            const questionSubjs = Array.from(new Map(
                                                questions
                                                    .filter(q => q.classLevel === examParams.classLevel && q.subject)
                                                    .map(q => [q.subject._id || q.subject, q.subject])
                                            ).values());

                                            const bankSubjects = Array.from(new Map(
                                                [...assignedSubjs, ...questionSubjs].map(s => [s._id || s, s])
                                            ).values());

                                            return bankSubjects.map(s => (
                                                <button 
                                                    key={s._id} 
                                                    onClick={() => setExamParams({ ...examParams, subject: s._id })}
                                                    className={`group relative p-4 rounded-md border transition-all ${examParams.subject === s._id ? 'bg-emerald-600 border-emerald-600 shadow-xl shadow-emerald-600/20' : 'bg-slate-950/60 border-slate-800/60 hover:border-slate-700'}`}
                                                >
                                                    <div className="relative z-10 flex flex-col items-start gap-2">
                                                        <div className={`p-2 rounded-md ${examParams.subject === s._id ? 'bg-white/10' : 'bg-emerald-500/10'}`}>
                                                            <Target size={14} className={examParams.subject === s._id ? 'text-white' : 'text-emerald-500'} />
                                                        </div>
                                                        <span className={`text-[11px] font-black uppercase italic ${examParams.subject === s._id ? 'text-white' : 'text-slate-400'}`}>{s.name}</span>
                                                        <span className={`text-[8px] font-bold opacity-60 ${examParams.subject === s._id ? 'text-white' : 'text-slate-600'}`}>{questions.filter(q => q.classLevel === examParams.classLevel && q.subject?._id === s._id).length} Items</span>
                                                    </div>
                                                </button>
                                            ));
                                        })()}
                                    </div>
                                </motion.div>
                            )}
                        </div>

                        {/* Batch Operations */}
                        {examParams.classLevel && examParams.subject && (
                            <div className="flex flex-col md:flex-row items-center justify-between gap-4 p-4 bg-slate-950/50 rounded-md border border-slate-800/60">
                                <div className="flex items-center gap-4">
                                    <div className="p-2 bg-slate-900 rounded border border-slate-800 flex gap-1">
                                        <button onClick={() => setViewType('detailed')} className={`p-1.5 rounded transition-all ${viewType === 'detailed' ? 'bg-brand-primary text-white' : 'text-slate-500 hover:text-white'}`}><Grid size={14} /></button>
                                        <button onClick={() => setViewType('compact')} className={`p-1.5 rounded transition-all ${viewType === 'compact' ? 'bg-brand-primary text-white' : 'text-slate-500 hover:text-white'}`}><List size={14} /></button>
                                    </div>
                                    <button 
                                        onClick={handleSelectAllMatches}
                                        className="h-9 px-4 bg-slate-900 hover:bg-slate-800 text-[10px] font-black uppercase text-slate-300 rounded border border-slate-800 transition-all"
                                    >
                                        {selectedIds.length === matchingQuestions.length ? 'Deselect All' : 'Select All Matches'}
                                    </button>
                                </div>

                                <div className="flex items-center gap-2">
                                    <button 
                                        onClick={(e) => handleGenerateExam(e, true)}
                                        disabled={selectedIds.length === 0}
                                        className={`h-11 px-6 rounded-md text-[10px] font-black uppercase tracking-[0.2em] transition-all italic flex items-center gap-3 ${selectedIds.length > 0 ? 'bg-white text-black hover:bg-brand-primary hover:text-white shadow-xl' : 'bg-slate-900 text-slate-700 cursor-not-allowed opacity-50'}`}
                                    >
                                        <Wand2 size={16} /> Add to Paper ({selectedIds.length})
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Grouped Question Cards */}
                        {examParams.classLevel && examParams.subject && (
                            matchingQuestions.length > 0 ? (
                                <div className="space-y-10">
                                    {allTypes.filter(type => matchingQuestions.some(q => q.type === type)).map(type => (
                                        <div key={type} className="space-y-4">
                                            <div className="flex items-center gap-4">
                                                <h3 className="text-xs font-black text-white italic uppercase tracking-[0.2em] whitespace-nowrap">{type.replace(/([A-Z])/g, ' $1')}</h3>
                                                <div className="h-[1px] w-full bg-slate-800/50"></div>
                                                <span className="text-[10px] font-black text-slate-600 bg-slate-950 px-2 py-0.5 rounded border border-slate-800">{matchingQuestions.filter(q => q.type === type).length}</span>
                                            </div>

                                            <div className={`grid ${viewType === 'detailed' ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1 md:grid-cols-2'} gap-4`}>
                                                {matchingQuestions.filter(q => q.type === type).map((q) => (
                                                    <div 
                                                        key={q._id}
                                                        onClick={() => toggleSelection(q._id)}
                                                        className={`group relative flex flex-col gap-4 p-5 rounded-md border transition-all cursor-pointer ${selectedIds.includes(q._id) ? 'bg-brand-primary/10 border-brand-primary shadow-lg shadow-brand-primary/10' : 'bg-slate-900/30 border-slate-800/60 hover:border-slate-700'}`}
                                                    >
                                                        <div className="flex justify-between items-start gap-3">
                                                            <p className={`font-bold leading-relaxed text-sm ${selectedIds.includes(q._id) ? 'text-white' : 'text-white/80'} line-clamp-3`}>{q.content}</p>
                                                            <div className={`p-1 rounded-full border ${selectedIds.includes(q._id) ? 'bg-brand-primary border-white/20' : 'bg-slate-950 border-slate-800'}`}>
                                                                {selectedIds.includes(q._id) ? <Check size={12} className="text-white" /> : <Plus size={12} className="text-slate-600" />}
                                                            </div>
                                                        </div>

                                                        <div className="mt-auto pt-4 border-t border-white/5 flex items-center justify-between">
                                                            <div className="flex items-center gap-3">
                                                                <span className={`text-[8px] font-black px-2 py-1 rounded tracking-widest uppercase ${q.difficulty === 'Hard' ? 'bg-rose-500/10 text-rose-500' : q.difficulty === 'Medium' ? 'bg-amber-500/10 text-amber-500' : 'bg-emerald-500/10 text-emerald-500'}`}>
                                                                    {q.difficulty}
                                                                </span>
                                                                <span className="text-[8px] font-black text-slate-600 uppercase italic">ID: {q._id.slice(-6)}</span>
                                                            </div>
                                                            <div className="flex items-center gap-2">
                                                                <span className="text-[10px] font-black text-white italic">[{q.marks} PTS]</span>
                                                                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-all">
                                                                    <button onClick={(e) => { e.stopPropagation(); handleEditClick(q); }} className="p-1 text-slate-500 hover:text-white"><Edit2 size={12} /></button>
                                                                    <button onClick={async (e) => { 
                                                                        e.stopPropagation(); 
                                                                        if(await window.confirm('Delete this question?')) {
                                                                            await axiosInstance.delete(`/teacher/questions/${q._id}`);
                                                                            fetchQuestions();
                                                                        }
                                                                    }} className="p-1 text-rose-500/30 hover:text-rose-500"><Trash2 size={12} /></button>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <motion.div 
                                    initial={{ opacity: 0, y: 10 }} 
                                    animate={{ opacity: 1, y: 0 }} 
                                    className="flex flex-col items-center justify-center text-center p-12 bg-slate-900/10 border border-dashed border-slate-800/80 rounded-md space-y-4"
                                >
                                    <div className="p-4 bg-brand-primary/10 rounded-full text-brand-primary">
                                        <Database size={32} />
                                    </div>
                                    <div className="space-y-2">
                                        <h3 className="text-white font-black text-sm uppercase tracking-wider font-outfit">No Questions in Vault</h3>
                                        <p className="text-slate-500 text-xs font-medium max-w-sm">
                                            You haven't archived any questions for <span className="text-white font-bold">{examParams.classLevel}</span> under <span className="text-white font-bold">{
                                                classes
                                                    .filter(c => `Grade ${c.gradeLevel || c.standardId?.level}` === examParams.classLevel)
                                                    .flatMap(c => c.subjects || [])
                                                    .find(s => s._id === examParams.subject)?.name || 'this subject'
                                            }</span> yet.
                                        </p>
                                    </div>
                                    <button 
                                        onClick={() => {
                                            setQData(prev => ({
                                                ...prev,
                                                classLevel: examParams.classLevel,
                                                subject: examParams.subject
                                            }));
                                            setActiveTab('add');
                                            setEditMode(false);
                                            setEditingId(null);
                                        }}
                                        className="px-6 py-2.5 bg-white hover:bg-brand-primary text-black hover:text-white rounded-md font-black text-[10px] uppercase tracking-widest transition-all italic flex items-center gap-2"
                                    >
                                        <PlusCircle size={14} /> Add Question Now
                                    </button>
                                </motion.div>
                            )
                        )}
                    </motion.div>
                )}
                {activeTab === 'generate' && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-4">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 bg-slate-900/60 rounded-md border border-slate-800 shadow-2xl backdrop-blur-xl">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-brand-primary/10 rounded-lg">
                                    <Wand2 className="text-brand-primary" size={20} />
                                </div>
                                <div>
                                    <h2 className="text-lg font-black text-white italic tracking-tighter uppercase">Exam Paper Builder</h2>
                                    <div className="flex items-center gap-4 text-[9px] font-bold text-slate-500 uppercase tracking-widest">
                                        <span>Questions: {paperSections.reduce((acc, s) => acc + s.questions.length, 0)}</span>
                                        <span className="text-brand-primary">Total Marks: {paperSections.reduce((acc, s) => acc + s.questions.reduce((qAcc, q) => qAcc + q.marks, 0), 0)}</span>
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <button onClick={() => setPaperSections([])} className="h-10 px-4 bg-slate-800 hover:bg-rose-900/20 text-slate-400 hover:text-rose-500 rounded text-[9px] font-black uppercase tracking-widest transition-all border border-slate-700">Clear</button>
                                <button onClick={handleDownloadPDF} className="h-12 px-8 bg-white hover:bg-brand-primary text-black hover:text-white rounded-md font-black text-[10px] uppercase tracking-[0.2em] transition-all flex items-center gap-3 italic shadow-xl">
                                    <Download size={16} /> Finalize & Export PDF
                                </button>
                            </div>
                        </div>

                        {paperSections.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-20 bg-slate-950/30 rounded-md border border-dashed border-slate-800">
                                <FileQuestion size={40} className="text-slate-800 mb-4" />
                                <p className="text-[10px] font-black text-slate-600 uppercase tracking-[0.3em] italic">No questions added to the current paper</p>
                                <button onClick={() => setActiveTab('bank')} className="mt-4 px-6 py-2 bg-slate-900 hover:bg-slate-800 text-[9px] font-black uppercase text-brand-primary rounded-full transition-all tracking-widest">Browse Question Bank</button>
                            </div>
                        ) : (
                            <Reorder.Group axis="y" values={paperSections} onReorder={reorderSections} className="space-y-4">
                                {paperSections.map((section, sIndex) => (
                                    <Reorder.Item 
                                        key={section.type} 
                                        value={section}
                                        className="bg-slate-900/30 border border-slate-800/80 rounded-md overflow-hidden"
                                    >
                                        <div className="group flex items-center justify-between px-3 py-2 bg-slate-950/40 border-b border-slate-800/50">
                                            <div className="flex items-center gap-3">
                                                <div className="cursor-grab active:cursor-grabbing p-1.5 text-slate-600 hover:text-white transition-colors">
                                                    <GripVertical size={14} />
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className="text-[10px] font-black text-white italic uppercase">{section.type.replace(/([A-Z])/g, ' $1')} [SEC {String.fromCharCode(65 + sIndex)}]</span>
                                                    <span className="text-[7px] font-heavy text-slate-600 uppercase tracking-widest">{section.questions.length} Questions • {section.questions.reduce((a, b) => a + b.marks, 0)} Marks</span>
                                                </div>
                                            </div>
                                            <button 
                                                onClick={() => toggleSection(section.type)}
                                                className="px-3 py-1 bg-slate-900 border border-slate-800 rounded text-[8px] font-black text-slate-500 uppercase hover:text-brand-primary transition-all"
                                            >
                                                {expandedSections.includes(section.type) ? 'Minimize' : 'Expand'}
                                            </button>
                                        </div>

                                        <AnimatePresence>
                                            {expandedSections.includes(section.type) && (
                                                <motion.div 
                                                    initial={{ height: 0, opacity: 0 }}
                                                    animate={{ height: 'auto', opacity: 1 }}
                                                    exit={{ height: 0, opacity: 0 }}
                                                    className="overflow-hidden"
                                                >
                                                    <Reorder.Group axis="y" values={section.questions} onReorder={(newQs) => reorderQuestions(sIndex, newQs)} className="p-2 space-y-1">
                                                        {section.questions.map((q, qIndex) => (
                                                            <Reorder.Item 
                                                                key={q._id} 
                                                                value={q}
                                                                className="group/item flex items-center justify-between p-2 hover:bg-white/5 rounded transition-all gap-4"
                                                            >
                                                                <div className="flex items-center gap-3 flex-1 overflow-hidden">
                                                                    <div className="cursor-grab active:cursor-grabbing p-1 text-slate-700 hover:text-slate-500">
                                                                        <GripVertical size={12} />
                                                                    </div>
                                                                    <span className="text-[10px] font-black text-slate-600 shrink-0 italic">{qIndex + 1}.</span>
                                                                    <p className="text-[11px] font-bold text-white/80 line-clamp-1 flex-1">{q.content}</p>
                                                                </div>
                                                                <div className="flex items-center gap-3 shrink-0">
                                                                    <span className="text-[9px] font-black text-emerald-500/50 uppercase">{q.marks} Marks</span>
                                                                    <button 
                                                                        onClick={() => removeQuestionFromPaper(sIndex, q._id)}
                                                                        className="p-1.5 text-rose-500/20 hover:text-rose-500 hover:bg-rose-500/10 rounded transition-all opacity-0 group-hover/item:opacity-100"
                                                                    >
                                                                        <Trash2 size={12} />
                                                                    </button>
                                                                </div>
                                                            </Reorder.Item>
                                                        ))}
                                                    </Reorder.Group>
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </Reorder.Item>
                                ))}
                            </Reorder.Group>
                        )}
                        <div className="flex justify-center py-4 border-t border-slate-800/30">
                            <button 
                                onClick={() => setActiveTab('bank')}
                                className="px-6 py-2 rounded-full border border-slate-800 text-[9px] font-black text-slate-500 hover:text-white uppercase transition-all flex items-center gap-2"
                            >
                                <PlusCircle size={12} /> Add More Questions from Bank
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default QuestionBank;
