import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    Brain, 
    BookOpen, 
    Play, 
    CheckCircle, 
    Clock, 
    Award, 
    Target, 
    ChevronRight, 
    HelpCircle,
    RotateCcw,
    Download,
    History,
    X
} from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchStudentQuizzes, submitQuizAttempt, fetchQuizHistory } from '../../redux/slice/student.slice';
import { toast } from 'react-hot-toast';

const ELearning = () => {
    const dispatch = useDispatch();
    const { quizzes, quizHistory, loading } = useSelector(state => state.student);
    const [activeView, setActiveView] = useState('portal'); // portal, quiz, study
    const [selectedQuiz, setSelectedQuiz] = useState(null);
    const [currentQuestion, setCurrentQuestion] = useState(0);
    const [score, setScore] = useState(0);
    const [quizComplete, setQuizComplete] = useState(false);
    const [userAnswers, setUserAnswers] = useState([]);

    React.useEffect(() => {
        dispatch(fetchStudentQuizzes());
        dispatch(fetchQuizHistory());
    }, [dispatch]);

    // Calculate dynamic stats from quiz history
    const calculateStats = () => {
        if (!quizHistory || quizHistory.length === 0) {
            return {
                globalAccuracy: 0,
                totalAttempts: 0,
                passedCount: 0,
                averageScore: 0,
                rank: 'Novice',
                progress: 0
            };
        }

        const totalAttempts = quizHistory.length;
        const passedCount = quizHistory.filter(a => a.status === 'Passed').length;
        const totalScore = quizHistory.reduce((sum, a) => sum + a.score, 0);
        const totalPossible = quizHistory.reduce((sum, a) => sum + a.totalPoints, 0);
        const globalAccuracy = totalPossible > 0 ? (totalScore / totalPossible) * 100 : 0;
        const averageScore = totalAttempts > 0 ? (totalScore / totalAttempts) : 0;

        // Determine rank based on accuracy
        let rank = 'Novice';
        let progress = globalAccuracy;
        if (globalAccuracy >= 95) rank = 'Elite';
        else if (globalAccuracy >= 85) rank = 'Expert';
        else if (globalAccuracy >= 75) rank = 'Advanced';
        else if (globalAccuracy >= 60) rank = 'Intermediate';
        else if (globalAccuracy >= 40) rank = 'Beginner';

        return { globalAccuracy, totalAttempts, passedCount, averageScore, rank, progress };
    };

    const stats = calculateStats();

    const studyMaterials = [
        { title: 'Vector Calculus Theory', type: 'PDF Archive', size: '4.2MB', date: '2026-02-15' },
        { title: 'Organic Synthesis Logic', type: 'Stream Feed', size: '45m 12s', date: '2026-03-01' }
    ];

    const startQuiz = (quiz) => {
        if (!quiz.questions || quiz.questions.length === 0) {
            toast.error("Quiz content not synchronized");
            return;
        }
        setSelectedQuiz(quiz);
        setActiveView('quiz');
        setCurrentQuestion(0);
        setScore(0);
        setQuizComplete(false);
        setUserAnswers([]);
    };

    const handleAnswer = (index) => {
        const currentQ = selectedQuiz.questions[currentQuestion];
        const isCorrect = index === currentQ.correctAnswer;
        
        const newAnswers = [...userAnswers, { 
            questionId: currentQ._id, 
            selectedOption: index,
            isCorrect: isCorrect
        }];
        setUserAnswers(newAnswers);

        if (isCorrect) {
            setScore(prev => prev + 1);
        }

        if (currentQuestion + 1 < selectedQuiz.questions.length) {
            setCurrentQuestion(currentQuestion + 1);
        } else {
            setQuizComplete(true);
            dispatch(submitQuizAttempt({
                quizId: selectedQuiz._id,
                answers: newAnswers
            })).then((res) => {
                if (!res.error) toast.success("Academic evaluation saved");
            });
        }
    };

    return (
        <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-8 max-w-7xl mx-auto"
        >
            <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                    <h1 className="text-4xl font-black text-white italic uppercase tracking-tighter leading-none mb-4 font-outfit">Neural Academy</h1>
                    <p className="text-slate-500 font-medium text-lg leading-relaxed max-w-xl italic">Interactive E-Learning matrix & cognitive training center.</p>
                </div>
                
                <div className="flex bg-slate-900/40 p-1.5 rounded-md border border-slate-800/60">
                    <button 
                        onClick={() => setActiveView('portal')}
                        className={`px-6 py-2.5 rounded text-[10px] font-black uppercase tracking-widest transition-all ${activeView === 'portal' ? 'bg-student-primary text-black' : 'text-slate-500 hover:text-white'}`}
                    >
                        Intelligence Hub
                    </button>
                    <button 
                        onClick={() => setActiveView('study')}
                        className={`px-6 py-2.5 rounded text-[10px] font-black uppercase tracking-widest transition-all ${activeView === 'study' ? 'bg-student-primary text-black' : 'text-slate-500 hover:text-white'}`}
                    >
                        Archive Access
                    </button>
                    <button 
                        onClick={() => setActiveView('history')}
                        className={`px-6 py-2.5 rounded text-[10px] font-black uppercase tracking-widest transition-all ${activeView === 'history' ? 'bg-student-primary text-black' : 'text-slate-500 hover:text-white'}`}
                    >
                        Cognitive History
                    </button>
                </div>
            </header>

            <AnimatePresence mode="wait">
                {activeView === 'portal' && (
                    <motion.div 
                        key="portal"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        className="grid grid-cols-1 lg:grid-cols-3 gap-8"
                    >
                        {/* Stats Sidebar */}
                        <div className="lg:col-span-1 space-y-6">
                            <div className="bg-[#0f0f12] border border-slate-800/60 p-8 rounded-md shadow-2xl relative overflow-hidden group">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-student-primary/5 rounded-md blur-3xl -mr-10 -mt-10 group-hover:bg-student-primary/10 transition-all"></div>
                                <h3 className="text-sm font-black text-white uppercase tracking-[0.3em] mb-8 flex items-center gap-3 italic">
                                   <div className="w-8 h-px bg-student-primary"></div> Mastery Rating
                                </h3>
                                
                                <div className="space-y-8">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 bg-student-primary/10 rounded-md flex items-center justify-center border border-student-primary/20 flex-shrink-0">
                                            <Brain size={24} className="text-student-primary" />
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1 leading-none">Global Accuracy</p>
                                            <p className="text-2xl font-black text-white italic font-outfit leading-none">
                                                {stats.totalAttempts === 0 ? '—' : `${stats.globalAccuracy.toFixed(1)}%`}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Mini stats row */}
                                    <div className="grid grid-cols-2 gap-3">
                                        <div className="bg-slate-900/60 rounded-md p-3 border border-slate-800/60">
                                            <p className="text-[9px] font-black text-slate-600 uppercase tracking-widest mb-1">Attempts</p>
                                            <p className="text-lg font-black text-white">{stats.totalAttempts}</p>
                                        </div>
                                        <div className="bg-slate-900/60 rounded-md p-3 border border-slate-800/60">
                                            <p className="text-[9px] font-black text-slate-600 uppercase tracking-widest mb-1">Passed</p>
                                            <p className="text-lg font-black text-student-primary">{stats.passedCount}</p>
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <div className="flex justify-between text-[9px] font-black uppercase tracking-widest text-slate-500 mb-2">
                                            <span>Cognitive Progress</span>
                                            <span className="text-student-primary">Rank: {stats.rank}</span>
                                        </div>
                                        <div className="h-1.5 w-full bg-slate-900 rounded-md overflow-hidden">
                                            <motion.div 
                                                className="h-full bg-student-primary shadow-[0_0_10px_rgba(16,185,129,0.5)]"
                                                initial={{ width: 0 }}
                                                animate={{ width: `${Math.min(stats.progress, 100)}%` }}
                                                transition={{ duration: 1, ease: 'easeOut' }}
                                            />
                                        </div>
                                        <p className="text-[9px] text-slate-600 italic text-right">
                                            {stats.totalAttempts === 0 ? 'No attempts yet' : `${stats.passedCount} of ${stats.totalAttempts} quizzes passed`}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-gradient-to-br from-indigo-500/10 to-transparent border border-indigo-500/20 p-8 rounded-md">
                                <p className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.3em] mb-4 flex items-center gap-2 italic">
                                    <Target size={14} /> Weekly Objective
                                </p>
                                {quizHistory.length === 0 ? (
                                    <p className="text-slate-400 text-xs italic font-medium leading-relaxed">
                                        Start your first quiz to begin tracking your weekly progress.
                                    </p>
                                ) : (
                                    <p className="text-slate-400 text-xs italic font-medium leading-relaxed">
                                        You've completed <span className="text-indigo-400 font-black">{stats.totalAttempts}</span> quiz{stats.totalAttempts !== 1 ? 'zes' : ''} with a <span className="text-indigo-400 font-black">{stats.globalAccuracy.toFixed(0)}%</span> accuracy rate. Keep pushing to reach <span className="text-indigo-400 font-black">Elite</span> rank.
                                    </p>
                                )}
                            </div>
                        </div>

                        {/* Main Feed */}
                        <div className="lg:col-span-2 space-y-6">
                            <h3 className="text-xs font-black text-slate-600 uppercase tracking-[0.5em] mb-6 flex items-center gap-4 italic border-b border-slate-800/40 pb-4">
                                Active Simulations
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {loading ? (
                                    <div className="col-span-2 py-20 flex items-center justify-center">
                                        <div className="w-8 h-8 border-2 border-student-primary border-t-transparent rounded-full animate-spin" />
                                    </div>
                                ) : quizzes.length === 0 ? (
                                    <div className="col-span-2 py-20 text-center bg-[#0a0a0c]/40 rounded-md border border-dashed border-slate-800/60">
                                        <Brain size={48} className="text-slate-800 mx-auto mb-4 opacity-20" />
                                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-600">No active simulations deployed for your sector</p>
                                    </div>
                                ) : quizzes.map((quiz, idx) => (
                                    <motion.div 
                                        key={quiz._id}
                                        initial={{ opacity: 0, scale: 0.95 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        transition={{ delay: idx * 0.1 }}
                                        className="bg-[#0f0f12] border border-slate-800/60 p-8 rounded-md group hover:border-student-primary/40 transition-all cursor-pointer relative overflow-hidden"
                                        onClick={() => startQuiz(quiz)}
                                    >
                                        <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-all">
                                            <Brain size={60} />
                                        </div>
                                        
                                        <div className="relative z-10 flex flex-col h-full">
                                            <div className="flex items-center justify-between mb-6">
                                                <span className="text-[9px] font-black text-student-primary uppercase tracking-widest border border-student-primary/30 px-3 py-1 rounded-md">
                                                    {quiz.subjectId?.name || 'General'}
                                                </span>
                                                <span className="flex items-center gap-1.5 text-[9px] font-black text-slate-500 uppercase tracking-widest">
                                                    <Clock size={10} /> {quiz.duration}m
                                                </span>
                                            </div>
                                            
                                            <h4 className="text-xl font-black text-white italic uppercase tracking-tighter mb-2 group-hover:text-student-primary transition-colors">{quiz.title}</h4>
                                            <p className="text-[9px] font-black text-slate-600 uppercase tracking-widest mb-8">
                                                {quiz.questions?.length || 0} Questions • Pass: {quiz.passingScore}%
                                            </p>
                                            
                                            <button className="mt-auto w-full py-3 bg-slate-800 hover:bg-student-primary hover:text-black rounded-md flex items-center justify-center gap-3 text-[9px] font-black uppercase tracking-[0.2em] transition-all border border-slate-700/50">
                                                Initialize Scan <Play size={12} />
                                            </button>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        </div>
                    </motion.div>
                )}

                {activeView === 'study' && (
                    <motion.div 
                        key="study"
                        initial={{ opacity: 0, scale: 0.98 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.98 }}
                        className="bg-[#0f0f12] border border-slate-800/60 rounded-md shadow-2xl overflow-hidden"
                    >
                        <div className="p-8 border-b border-slate-800/60 bg-[#0a0a0c]">
                            <h3 className="text-xs font-black uppercase tracking-[0.4em] text-white flex items-center gap-4 italic font-outfit">
                                <BookOpen size={18} className="text-student-primary" /> Knowledge Repository
                            </h3>
                        </div>
                        <div className="divide-y divide-slate-800/40">
                            {studyMaterials.map((item, idx) => (
                                <div key={idx} className="p-8 flex items-center justify-between group hover:bg-white/[0.02] transition-all">
                                    <div className="flex items-center gap-6">
                                        <div className="w-12 h-12 bg-slate-800 rounded-md flex items-center justify-center text-slate-500 group-hover:text-student-primary transition-colors border border-slate-700/30">
                                            <Download size={20} />
                                        </div>
                                        <div>
                                            <h4 className="text-sm font-black text-white uppercase tracking-wider italic mb-1">{item.title}</h4>
                                            <p className="text-[9px] font-black text-slate-600 uppercase tracking-widest">{item.type} • {item.size} • Uploaded {item.date}</p>
                                        </div>
                                    </div>
                                    <button className="px-6 py-3 bg-slate-800/50 hover:bg-student-primary hover:text-black rounded-md text-[9px] font-black uppercase tracking-widest transition-all border border-slate-700/30 opacity-60 hover:opacity-100 italic">
                                        Access Stream
                                    </button>
                                </div>
                            ))}
                        </div>
                    </motion.div>
                )}

                {activeView === 'quiz' && selectedQuiz && (
                    <motion.div 
                        key="quiz"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-[#0f0f12] border border-slate-800/60 rounded-md p-10 shadow-3xl max-w-4xl mx-auto relative overflow-hidden"
                    >
                        <div className="absolute top-0 left-0 w-full h-1 bg-slate-800">
                            <motion.div 
                                className="h-full bg-student-primary shadow-[0_0_10px_rgba(16,185,129,0.5)]"
                                initial={{ width: 0 }}
                                animate={{ width: `${((currentQuestion + 1) / selectedQuiz.questions.length) * 100}%` }}
                            />
                        </div>

                        {!quizComplete ? (
                            <div className="space-y-12">
                                    <div className="flex items-center justify-between border-b border-slate-800 pb-8">
                                        <div className="flex items-center gap-6">
                                            <div className="w-16 h-16 rounded-md bg-student-primary/10 border border-student-primary/30 flex items-center justify-center text-student-primary shadow-[0_0_30px_rgba(34,197,94,0.1)]">
                                                <Brain size={32} />
                                            </div>
                                            <div>
                                                <p className="text-[10px] font-black text-student-primary uppercase tracking-[0.4em] mb-1">Target Assessment</p>
                                                <h3 className="text-3xl font-black text-white italic uppercase tracking-tighter">{selectedQuiz.title}</h3>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Vector Alignment</p>
                                            <p className="text-xl font-black text-white uppercase">{currentQuestion + 1} <span className="text-slate-600">/ {selectedQuiz.questions.length}</span></p>
                                        </div>
                                    </div>

                                    <div className="max-w-3xl mx-auto space-y-12 py-10">
                                        <p className="text-2xl font-bold text-slate-100 text-center leading-relaxed">
                                            "{selectedQuiz.questions[currentQuestion].text}"
                                        </p>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            {selectedQuiz.questions[currentQuestion].options.map((option, i) => (
                                                <motion.button
                                                    key={i}
                                                    whileHover={{ scale: 1.02, backgroundColor: 'rgba(34, 197, 94, 0.05)', borderColor: 'rgba(34, 197, 94, 0.3)' }}
                                                    whileTap={{ scale: 0.98 }}
                                                    onClick={() => handleAnswer(i)}
                                                    className="p-6 rounded-md bg-slate-900 borders border-slate-800 text-left transition-all hover:shadow-[0_0_30px_rgba(34,197,94,0.05)]"
                                                >
                                                    <div className="flex items-center gap-6">
                                                        <span className="w-10 h-10 rounded-sm bg-slate-800 flex items-center justify-center text-[10px] font-black text-slate-400 uppercase">Option {String.fromCharCode(65 + i)}</span>
                                                        <span className="text-sm font-black text-slate-300 uppercase tracking-widest">{option}</span>
                                                    </div>
                                                </motion.button>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                        ) : (
                            <div className="space-y-10">
                                {/* Summary Header */}
                                <div className="text-center py-10 space-y-6 border-b border-slate-800/60">
                                    <div className="relative inline-block">
                                        <div className="w-24 h-24 rounded-full bg-student-primary/10 border-2 border-student-primary flex items-center justify-center text-student-primary animate-pulse">
                                            <Award size={48} />
                                        </div>
                                        <motion.div 
                                            initial={{ scale: 0 }}
                                            animate={{ scale: 1 }}
                                            className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-student-primary text-black flex items-center justify-center shadow-lg"
                                        >
                                            <CheckCircle size={18} />
                                        </motion.div>
                                    </div>

                                    <div className="space-y-3">
                                        <h3 className="text-3xl font-black text-white italic uppercase tracking-tighter">Evaluation Synchronized</h3>
                                        <p className="text-slate-500 font-bold uppercase tracking-widest text-[10px]">Neural score calculation complete // Node stabilized</p>
                                    </div>

                                    <div className="grid grid-cols-3 gap-4 max-w-xl mx-auto">
                                        <div className="p-4 bg-slate-900/60 rounded-md border border-slate-800">
                                            <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-2">Accuracy</p>
                                            <p className="text-2xl font-black text-student-primary">{Math.round((score / selectedQuiz.questions.length) * 100)}%</p>
                                        </div>
                                        <div className="p-5 bg-slate-900 border border-slate-800 rounded-md shadow-xl">
                                            <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-2">Raw Score</p>
                                            <p className="text-3xl font-black text-white">{score} <span className="text-sm text-slate-600">/ {selectedQuiz.questions.length}</span></p>
                                        </div>
                                        <div className="p-4 bg-slate-900/60 rounded-md border border-slate-800">
                                            <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-2">Status</p>
                                            <p className="text-2xl font-black text-student-primary">
                                                {((score / selectedQuiz.questions.length) * 100) >= selectedQuiz.passingScore ? 'Pass' : 'Fail'}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* Detailed Review */}
                                <div className="space-y-6 max-w-4xl mx-auto">
                                    <h4 className="text-xs font-black uppercase tracking-[0.4em] text-slate-500 flex items-center gap-3 border-b border-slate-800/40 pb-4">
                                        <div className="w-8 h-px bg-student-primary"></div> Answer Review Matrix
                                    </h4>

                                    {selectedQuiz.questions.map((question, qIdx) => {
                                        const userAnswer = userAnswers[qIdx];
                                        const isCorrect = userAnswer?.isCorrect;
                                        
                                        return (
                                            <motion.div
                                                key={qIdx}
                                                initial={{ opacity: 0, y: 10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{ delay: qIdx * 0.05 }}
                                                className={`p-6 rounded-md border ${isCorrect ? 'bg-emerald-500/5 border-emerald-500/20' : 'bg-student-primary/5 border-student-primary/20'}`}
                                            >
                                                {/* Question Header */}
                                                <div className="flex items-start justify-between gap-4 mb-4">
                                                    <div className="flex items-start gap-4 flex-1">
                                                        <div className={`w-10 h-10 rounded-md flex items-center justify-center text-[10px] font-black uppercase flex-shrink-0 ${isCorrect ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-student-primary/20 text-student-primary border border-student-primary/30'}`}>
                                                            Q{qIdx + 1}
                                                        </div>
                                                        <p className="text-sm font-bold text-slate-200 leading-relaxed pt-2">{question.text}</p>
                                                    </div>
                                                    <div className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-[9px] font-black uppercase tracking-widest ${isCorrect ? 'bg-emerald-500/20 text-emerald-400' : 'bg-student-primary/20 text-student-primary'}`}>
                                                        {isCorrect ? <CheckCircle size={12} /> : <X size={12} />}
                                                        {isCorrect ? 'Correct' : 'Wrong'}
                                                    </div>
                                                </div>

                                                {/* Options */}
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 ml-14">
                                                    {question.options.map((option, oIdx) => {
                                                        const isUserAnswer = userAnswer?.selectedOption === oIdx;
                                                        const isCorrectAnswer = question.correctAnswer === oIdx;
                                                        
                                                        let optionClass = "p-4 rounded-md border transition-all ";
                                                        
                                                        if (isCorrectAnswer) {
                                                            optionClass += "bg-emerald-500/10 border-emerald-500/30 text-emerald-300";
                                                        } else if (isUserAnswer && !isCorrect) {
                                                            optionClass += "bg-student-primary/10 border-student-primary/30 text-student-primary";
                                                        } else {
                                                            optionClass += "bg-slate-900/40 border-slate-800/60 text-slate-500";
                                                        }

                                                        return (
                                                            <div key={oIdx} className={optionClass}>
                                                                <div className="flex items-center gap-3">
                                                                    <span className="w-6 h-6 rounded-sm bg-slate-800/50 flex items-center justify-center text-[9px] font-black text-slate-400 flex-shrink-0">
                                                                        {String.fromCharCode(65 + oIdx)}
                                                                    </span>
                                                                    <span className="text-xs font-bold flex-1">{option}</span>
                                                                    {isCorrectAnswer && (
                                                                        <CheckCircle size={14} className="text-emerald-400 flex-shrink-0" />
                                                                    )}
                                                                    {isUserAnswer && !isCorrect && (
                                                                        <X size={14} className="text-student-primary flex-shrink-0" />
                                                                    )}
                                                                </div>
                                                            </div>
                                                        );
                                                    })}
                                                </div>

                                                {/* Explanation */}
                                                {!isCorrect && (
                                                    <div className="mt-4 ml-14 p-3 bg-slate-900/60 border border-slate-800/60 rounded-md">
                                                        <p className="text-[9px] font-black uppercase tracking-widest text-slate-500 mb-1">Correct Answer</p>
                                                        <p className="text-xs text-slate-400">
                                                            <span className="font-black text-emerald-400">Option {String.fromCharCode(65 + question.correctAnswer)}:</span> {question.options[question.correctAnswer]}
                                                        </p>
                                                    </div>
                                                )}
                                            </motion.div>
                                        );
                                    })}
                                </div>

                                {/* Action Buttons */}
                                <div className="flex justify-center gap-4 pt-6 border-t border-slate-800/60">
                                    <button 
                                        onClick={() => startQuiz(selectedQuiz)}
                                        className="flex items-center gap-3 px-8 py-4 bg-slate-800 hover:bg-slate-700 text-white rounded-md text-[10px] font-black uppercase tracking-[0.3em] transition-all"
                                    >
                                        <RotateCcw size={16} /> Re-Calculate
                                    </button>
                                    <button 
                                        onClick={() => setActiveView('portal')}
                                        className="flex items-center gap-3 px-10 py-4 bg-student-primary text-black rounded-md text-[10px] font-black uppercase tracking-[0.3em] transition-all"
                                    >
                                        Intelligence Hub <ChevronRight size={16} />
                                    </button>
                                </div>
                            </div>
                        )}
                    </motion.div>
                )}

                {activeView === 'history' && (
                    <motion.div 
                        key="history"
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-[#0f0f12] border border-slate-800/60 rounded-md overflow-hidden"
                    >
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead className="bg-[#0a0a0c]">
                                    <tr className="border-b border-slate-800/60">
                                        <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-500">Evaluation Phase</th>
                                        <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-500">Subject</th>
                                        <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-500 text-center">Score Matrix</th>
                                        <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-500 text-center">Protocol Status</th>
                                        <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-500 text-right">Synchronization</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-800/40">
                                    {quizHistory.length > 0 ? (
                                        quizHistory.map((attempt, idx) => (
                                            <tr key={attempt._id || idx} className="hover:bg-slate-800/10 transition-colors group">
                                                <td className="px-8 py-6">
                                                    <p className="text-[11px] font-black text-white uppercase tracking-wider italic">{attempt.quizId?.title}</p>
                                                </td>
                                                <td className="px-8 py-6">
                                                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{attempt.quizId?.subjectId?.name}</span>
                                                </td>
                                                <td className="px-8 py-6 text-center">
                                                    <span className="text-sm font-black text-white tracking-widest font-outfit">{attempt.score} <span className="text-xs text-slate-600">/ {attempt.totalPoints}</span></span>
                                                </td>
                                                <td className="px-8 py-6">
                                                    <div className="flex justify-center">
                                                        <span className={`px-4 py-1.5 rounded-md text-[9px] font-black uppercase tracking-[.15em] border ${attempt.status === 'Passed' ? 'text-luxury-emerald border-emerald-500/20 bg-emerald-500/10' : 'text-luxury-rose border-student-primary/20 bg-student-primary/10'}`}>
                                                            {attempt.status}
                                                        </span>
                                                    </div>
                                                </td>
                                                <td className="px-8 py-6 text-right text-[10px] font-black text-slate-500 uppercase tracking-widest italic">
                                                    {new Date(attempt.createdAt).toLocaleDateString()}
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan="5" className="px-8 py-20 text-center text-[10px] font-black uppercase tracking-widest text-slate-600 italic">No historical evaluations found in local nodes</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
};

export default ELearning;
