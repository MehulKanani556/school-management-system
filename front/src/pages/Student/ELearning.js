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
    X,
    Eye,
    MinusCircle
} from 'lucide-react';

import { useDispatch, useSelector } from 'react-redux';
import { fetchStudentQuizzes, submitQuizAttempt, fetchQuizHistory, fetchStudentResources } from '../../redux/slice/student.slice';

import { toast } from 'react-hot-toast';
import { BASE_URL } from '../../utils/BASE_URL';

const ELearning = () => {
    const dispatch = useDispatch();
    const { quizzes, quizHistory, resources, loading } = useSelector(state => state.student);
    const [activeView, setActiveView] = useState('portal'); // portal, quiz, study

    const [selectedQuiz, setSelectedQuiz] = useState(null);
    const [currentQuestion, setCurrentQuestion] = useState(0);
    const [score, setScore] = useState(0);
    const [quizComplete, setQuizComplete] = useState(false);
    const [userAnswers, setUserAnswers] = useState({});
    const [timeLeft, setTimeLeft] = useState(null);

    React.useEffect(() => {
        dispatch(fetchStudentQuizzes());
        dispatch(fetchQuizHistory());
        dispatch(fetchStudentResources());
    }, [dispatch]);

    const submitQuiz = React.useCallback(() => {
        setQuizComplete(true);
        const answersPayload = Object.keys(userAnswers).map(qIdx => {
            const numIdx = parseInt(qIdx, 10);
            return {
                questionId: selectedQuiz.questions[numIdx]._id,
                selectedOption: userAnswers[numIdx]
            };
        });

        let localScore = 0;
        answersPayload.forEach(ans => {
            const q = selectedQuiz.questions.find(q => q._id === ans.questionId);
            if (q && q.correctAnswer === ans.selectedOption) {
                 localScore += (q.points || 10);
            }
        });
        setScore(localScore);

        dispatch(submitQuizAttempt({
            quizId: selectedQuiz._id,
            answers: answersPayload
        })).then((res) => {
            if (!res.error) toast.success("Quiz result saved successfully");
        });
    }, [dispatch, selectedQuiz, userAnswers]);

    const handleTimeUp = React.useCallback(() => {
        submitQuiz();
        toast.error("Time is up! Your quiz has been submitted.");
    }, [submitQuiz]);

    React.useEffect(() => {
        let timer;
        if (activeView === 'quiz' && !quizComplete && timeLeft > 0) {
            timer = setInterval(() => setTimeLeft(prev => prev - 1), 1000);
        } else if (activeView === 'quiz' && !quizComplete && timeLeft === 0) {
            handleTimeUp();
        }
        return () => clearInterval(timer);
    }, [activeView, quizComplete, timeLeft, handleTimeUp]);


    // Calculate dynamic stats from quiz history
    const calculateStats = () => {
        if (!quizHistory || quizHistory.length === 0) {
            return {
                globalAccuracy: 0,
                totalAttempts: 0,
                passedCount: 0,
                averageScore: 0,
                rank: 'Beginner',
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
        let rank = 'Beginner';
        let progress = globalAccuracy;
        if (globalAccuracy >= 95) rank = 'Elite';
        else if (globalAccuracy >= 85) rank = 'Expert';
        else if (globalAccuracy >= 75) rank = 'Advanced';
        else if (globalAccuracy >= 60) rank = 'Intermediate';
        else if (globalAccuracy >= 40) rank = 'Standard';

        return { globalAccuracy, totalAttempts, passedCount, averageScore, rank, progress };
    };

    const stats = calculateStats();

    const startQuiz = (quiz) => {
        if (!quiz.questions || quiz.questions.length === 0) {
            toast.error("Quiz content is not available.");
            return;
        }
        setSelectedQuiz(quiz);
        setActiveView('quiz');
        setCurrentQuestion(0);
        setScore(0);
        setQuizComplete(false);
        setUserAnswers({});
        setTimeLeft((quiz.duration || 30) * 60);
    };

    const handleAccessStream = (url) => {
        if (!url) return toast.error("File link not found.");
        const fullUrl = url.startsWith('http') ? url : `${BASE_URL.replace('/api', '')}/${url}`;
        window.open(fullUrl, '_blank');
    };

    const handleAnswerSelect = (index) => {
        setUserAnswers(prev => ({
            ...prev,
            [currentQuestion]: index
        }));
    };

    const goToNext = () => {
        if (currentQuestion < selectedQuiz.questions.length - 1) {
            setCurrentQuestion(prev => prev + 1);
        }
    };

    const goToPrev = () => {
        if (currentQuestion > 0) {
            setCurrentQuestion(prev => prev - 1);
        }
    };

    return (
        <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-8 max-w-7xl mx-auto font-outfit"
        >
            <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 font-outfit">
                <div className="font-outfit">
                    <h1 className="text-4xl font-black text-white italic uppercase tracking-tighter leading-none mb-4">E-Learning Center</h1>
                    <p className="text-slate-500 font-medium text-lg leading-relaxed max-w-xl italic">Access your quizzes, study materials, and learning resources.</p>
                </div>
                
                <div className="flex bg-slate-900/40 p-1.5 rounded-md border border-slate-800/60 font-outfit">
                    <button 
                        onClick={() => setActiveView('portal')}
                        className={`px-6 py-2.5 rounded text-[10px] font-black uppercase tracking-widest transition-all ${activeView === 'portal' ? 'bg-brand-primary text-white shadow-lg shadow-brand-primary/20' : 'text-slate-500 hover:text-white'}`}
                    >
                        Quiz Portal
                    </button>
                    <button 
                        onClick={() => setActiveView('study')}
                        className={`px-6 py-2.5 rounded text-[10px] font-black uppercase tracking-widest transition-all ${activeView === 'study' ? 'bg-brand-primary text-white shadow-lg shadow-brand-primary/20' : 'text-slate-500 hover:text-white'}`}
                    >
                        Study Materials
                    </button>
                    <button 
                        onClick={() => setActiveView('history')}
                        className={`px-6 py-2.5 rounded text-[10px] font-black uppercase tracking-widest transition-all ${activeView === 'history' ? 'bg-brand-primary text-white shadow-lg shadow-brand-primary/20' : 'text-slate-500 hover:text-white'}`}
                    >
                        Quiz History
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
                        className="grid grid-cols-1 lg:grid-cols-3 gap-8 font-outfit"
                    >
                        {/* Stats Sidebar */}
                        <div className="lg:col-span-1 space-y-6 font-outfit">
                            <div className="bg-[#0f0f12] border border-slate-800/60 p-8 rounded-md shadow-2xl relative overflow-hidden group font-outfit">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-brand-primary/5 rounded-md blur-3xl -mr-10 -mt-10 group-hover:bg-brand-primary/10 transition-all font-outfit"></div>
                                <h3 className="text-sm font-black text-white uppercase tracking-[0.3em] mb-8 flex items-center gap-3 italic font-outfit">
                                   <div className="w-8 h-px bg-brand-primary font-outfit"></div> Learning Progress
                                </h3>
                                
                                <div className="space-y-8 font-outfit">
                                    <div className="flex items-center gap-4 font-outfit">
                                        <div className="w-12 h-12 bg-brand-primary/10 rounded-md flex items-center justify-center border border-brand-primary/20 flex-shrink-0 font-outfit">
                                            <Brain size={24} className="text-brand-primary shadow-[0_0_10px_rgba(37,99,235,0.3)]" />
                                        </div>
                                        <div className="font-outfit">
                                            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1 leading-none italic">Average Score</p>
                                            <p className="text-2xl font-black text-white italic font-outfit leading-none">
                                                {stats.totalAttempts === 0 ? '—' : `${stats.globalAccuracy.toFixed(1)}%`}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Mini stats row */}
                                    <div className="grid grid-cols-2 gap-3 font-outfit">
                                        <div className="bg-slate-900/60 rounded-md p-3 border border-slate-800/60 font-outfit">
                                            <p className="text-[9px] font-black text-slate-600 uppercase tracking-widest mb-1 italic">Attempts</p>
                                            <p className="text-lg font-black text-white">{stats.totalAttempts}</p>
                                        </div>
                                        <div className="bg-slate-900/60 rounded-md p-3 border border-slate-800/60 font-outfit">
                                            <p className="text-[9px] font-black text-slate-600 uppercase tracking-widest mb-1 italic">Passed</p>
                                            <p className="text-lg font-black text-brand-primary">{stats.passedCount}</p>
                                        </div>
                                    </div>

                                    <div className="space-y-2 font-outfit">
                                        <div className="flex justify-between text-[9px] font-black uppercase tracking-widest text-slate-500 mb-2 font-outfit">
                                            <span>Overall Level</span>
                                            <span className="text-brand-primary">Rank: {stats.rank}</span>
                                        </div>
                                        <div className="h-1.5 w-full bg-slate-900 rounded-md overflow-hidden font-outfit">
                                            <motion.div 
                                                className="h-full bg-brand-primary shadow-[0_0_10px_rgba(37,99,235,0.5)]"
                                                initial={{ width: 0 }}
                                                animate={{ width: `${Math.min(stats.progress, 100)}%` }}
                                                transition={{ duration: 1, ease: 'easeOut' }}
                                            />
                                        </div>
                                        <p className="text-[9px] text-slate-600 italic text-right font-outfit">
                                            {stats.totalAttempts === 0 ? 'No attempts yet' : `${stats.passedCount} of ${stats.totalAttempts} quizzes passed`}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-gradient-to-br from-indigo-500/10 to-transparent border border-indigo-500/20 p-8 rounded-md font-outfit">
                                <p className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.3em] mb-4 flex items-center gap-2 italic font-outfit font-outfit">
                                    <Target size={14} /> Learning Goals
                                </p>
                                {quizHistory.length === 0 ? (
                                    <p className="text-slate-400 text-xs italic font-medium leading-relaxed font-outfit uppercase tracking-tighter">
                                        Start your first quiz to begin tracking your weekly progress.
                                    </p>
                                ) : (
                                    <p className="text-slate-400 text-xs italic font-medium leading-relaxed font-outfit uppercase tracking-tighter">
                                        You've completed <span className="text-indigo-400 font-black">{stats.totalAttempts}</span> quiz{stats.totalAttempts !== 1 ? 'zes' : ''} with a <span className="text-indigo-400 font-black">{stats.globalAccuracy.toFixed(0)}%</span> accuracy rate. Keep pushing to reach <span className="text-indigo-400 font-black">Elite</span> rank.
                                    </p>
                                )}
                            </div>
                        </div>

                        {/* Main Feed */}
                        <div className="lg:col-span-2 space-y-6 font-outfit">
                            <h3 className="text-xs font-black text-slate-600 uppercase tracking-[0.5em] mb-6 flex items-center gap-4 italic border-b border-slate-800/40 pb-4 font-outfit">
                                Published Quizzes
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 font-outfit">
                                {loading ? (
                                    <div className="col-span-2 py-20 flex items-center justify-center font-outfit">
                                        <div className="w-8 h-8 border-2 border-brand-primary border-t-transparent rounded-full animate-spin" />
                                    </div>
                                ) : quizzes.length === 0 ? (
                                    <div className="col-span-2 py-20 text-center bg-[#0a0a0c]/40 rounded-md border border-dashed border-slate-800/60 font-outfit">
                                        <Brain size={48} className="text-slate-800 mx-auto mb-4 opacity-20" />
                                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-600">No active quizzes assigned to you at the moment.</p>
                                    </div>
                                ) : quizzes.map((quiz, idx) => (
                                    <motion.div 
                                        key={quiz._id}
                                        initial={{ opacity: 0, scale: 0.95 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        transition={{ delay: idx * 0.1 }}
                                        className="bg-[#0f0f12] border border-slate-800/60 p-8 rounded-md group hover:border-brand-primary/40 transition-all cursor-pointer relative overflow-hidden font-outfit"
                                        onClick={() => startQuiz(quiz)}
                                    >
                                        <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-all font-outfit">
                                            <Brain size={60} />
                                        </div>
                                        
                                        <div className="relative z-10 flex flex-col h-full font-outfit">
                                            <div className="flex items-center justify-between mb-6 font-outfit">
                                                <span className="text-[9px] font-black text-brand-primary uppercase tracking-widest border border-brand-primary/30 px-3 py-1 rounded-md italic">
                                                    {quiz.subjectId?.name || 'General'}
                                                </span>
                                                <span className="flex items-center gap-1.5 text-[9px] font-black text-slate-500 uppercase tracking-widest italic">
                                                    <Clock size={10} /> {quiz.duration}m
                                                </span>
                                            </div>
                                            
                                            <h4 className="text-xl font-black text-white italic uppercase tracking-tighter mb-2 group-hover:text-brand-primary transition-colors font-outfit">{quiz.title}</h4>
                                            <p className="text-[9px] font-black text-slate-600 uppercase tracking-widest mb-8 italic">
                                                {quiz.questions?.length || 0} Questions • Pass: {quiz.passingScore}%
                                            </p>
                                            
                                            <button className="mt-auto w-full py-3 bg-slate-800 hover:bg-brand-primary hover:text-white rounded-md flex items-center justify-center gap-3 text-[9px] font-black uppercase tracking-[0.2em] transition-all border border-slate-700/50 h-[36px] font-outfit italic">
                                                Start Quiz <Play size={12} />
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
                        className="bg-[#0f0f12] border border-slate-800/60 rounded-md shadow-2xl overflow-hidden font-outfit"
                    >
                        <div className="p-8 border-b border-slate-800/60 bg-[#0a0a0c] font-outfit">
                            <h3 className="text-xs font-black uppercase tracking-[0.4em] text-white flex items-center gap-4 italic font-outfit">
                                <BookOpen size={18} className="text-brand-primary" /> Study Materials Library
                            </h3>
                        </div>
                        <div className="divide-y divide-slate-800/40 font-outfit">
                            {resources.length === 0 ? (
                                <div className="p-20 text-center font-outfit">
                                    <BookOpen size={48} className="text-slate-800 mx-auto mb-4 opacity-20" />
                                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-600 italic">No study materials found for your grade.</p>
                                </div>
                            ) : resources.map((item, idx) => (
                                <div key={item._id || idx} className="p-8 flex items-center justify-between group hover:bg-white/[0.02] transition-all font-outfit">
                                    <div className="flex items-center gap-6 font-outfit font-outfit">
                                        <div className="w-12 h-12 bg-slate-800 rounded-md flex items-center justify-center text-slate-500 group-hover:text-brand-primary transition-colors border border-slate-700/30">
                                            <Download size={20} />
                                        </div>
                                        <div className="font-outfit">
                                            <h4 className="text-sm font-black text-white uppercase tracking-wider italic mb-1 font-outfit">{item.title}</h4>
                                            <p className="text-[9px] font-black text-slate-600 uppercase tracking-widest italic font-outfit">
                                                {item.resourceType} • {item.subject?.name || 'General Academic'} • Uploaded {new Date(item.uploadDate).toLocaleDateString()}
                                            </p>
                                            {item.description && (
                                                <p className="text-[8px] text-slate-500 mt-1 max-w-md line-clamp-1 italic font-medium font-outfit">{item.description}</p>
                                            )}
                                        </div>
                                    </div>
                                    <button 
                                        onClick={() => handleAccessStream(item.fileUrl)}
                                        className="px-6 py-3 bg-slate-800/50 hover:bg-brand-primary hover:text-white rounded-md text-[9px] font-black uppercase tracking-widest transition-all border border-slate-700/30 opacity-60 hover:opacity-100 italic flex items-center gap-2 h-[36px] font-outfit"
                                    >
                                        View Resource <Eye size={12} />
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
                        className="bg-[#0f0f12] border border-slate-800/60 rounded-md p-10 shadow-3xl max-w-6xl mx-auto relative overflow-hidden font-outfit"
                    >
                        <div className="absolute top-0 left-0 w-full h-1 bg-slate-800 font-outfit">
                            <motion.div 
                                className="h-full bg-brand-primary shadow-[0_0_10px_rgba(37,99,235,0.5)]"
                                initial={{ width: 0 }}
                                animate={{ width: `${((currentQuestion + 1) / selectedQuiz.questions.length) * 100}%` }}
                            />
                        </div>

                        {!quizComplete ? (
                            <div className="flex flex-col md:flex-row gap-8 items-start font-outfit">
                                {/* Sidebar for Question Navigation */}
                                <div className="w-full md:w-1/4 bg-[#0a0a0c] p-6 rounded-md border border-slate-800/60 sticky top-4 font-outfit">
                                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-4 italic leading-none">Question List</p>
                                    <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-4 gap-2 font-outfit">
                                        {selectedQuiz.questions.map((_, idx) => {
                                            const isAnswered = userAnswers[idx] !== undefined;
                                            const isCurrent = currentQuestion === idx;
                                            return (
                                                <button
                                                    key={idx}
                                                    onClick={() => setCurrentQuestion(idx)}
                                                    className={`w-10 h-10 flex flex-col items-center justify-center rounded-md text-[10px] font-black transition-all ${isCurrent ? 'bg-brand-primary text-white scale-110 shadow-[0_0_15px_rgba(37,99,235,0.4)]' : isAnswered ? 'bg-brand-primary/20 text-brand-primary border border-brand-primary/30' : 'bg-slate-900 text-slate-500 hover:bg-slate-800 border border-slate-800'}`}
                                                >
                                                    {idx + 1}
                                                </button>
                                            );
                                        })}
                                    </div>
                                    <div className="mt-8 pt-6 border-t border-slate-800/60 font-outfit">
                                        <button onClick={submitQuiz} className="w-full py-3 bg-brand-primary hover:bg-brand-primary/80 text-white rounded-md text-[9px] font-black uppercase tracking-[0.2em] transition-all border border-brand-primary h-[36px] italic">
                                            Submit Quiz
                                        </button>
                                    </div>
                                </div>

                                {/* Main Question Area */}
                                <div className="w-full md:w-3/4 space-y-10 bg-[#0f0f12] rounded-md border border-slate-800/60 p-8 shadow-2xl relative overflow-hidden font-outfit">
                                     <div className="flex items-center justify-between border-b border-slate-800 pb-8 font-outfit">
                                         <div className="flex items-center gap-6 font-outfit">
                                             <div className="w-16 h-16 rounded-md bg-brand-primary/10 border border-brand-primary/30 flex items-center justify-center text-brand-primary shadow-[0_0_30px_rgba(37,99,235,0.1)]">
                                                 <Brain size={32} />
                                             </div>
                                             <div className="font-outfit">
                                                 <p className="text-[10px] font-black text-brand-primary uppercase tracking-[0.4em] mb-1 italic">Active Quiz</p>
                                                 <h3 className="text-3xl font-black text-white italic uppercase tracking-tighter font-outfit">{selectedQuiz.title}</h3>
                                             </div>
                                         </div>
                                         <div className="flex items-center justify-end gap-8 font-outfit font-outfit">
                                             {timeLeft !== null && (
                                                 <div className="text-right border-r border-slate-800 pr-8 font-outfit">
                                                     <p className="text-[10px] font-black text-brand-primary uppercase tracking-widest mb-1 italic">Time Remaining</p>
                                                     <p className={`text-xl font-black uppercase tracking-widest ${timeLeft < 60 ? 'text-rose-500 animate-pulse' : 'text-white font-outfit'}`}>
                                                         {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}
                                                     </p>
                                                 </div>
                                             )}
                                             <div className="text-right font-outfit">
                                                 <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1 italic">Question Number</p>
                                                 <p className="text-xl font-black text-white uppercase font-outfit">{currentQuestion + 1} <span className="text-slate-600 font-outfit">/ {selectedQuiz.questions.length}</span></p>
                                             </div>
                                         </div>
                                     </div>

                                     <div className="max-w-3xl mx-auto space-y-12 py-6 font-outfit">
                                         <p className="text-2xl font-bold text-slate-100 text-center leading-relaxed font-outfit">
                                             "{selectedQuiz.questions[currentQuestion].text}"
                                         </p>

                                         <div className="grid grid-cols-1 md:grid-cols-2 gap-6 font-outfit">
                                             {selectedQuiz.questions[currentQuestion].options.map((option, i) => {
                                                 const isSelected = userAnswers[currentQuestion] === i;
                                                 return (
                                                     <motion.button
                                                         key={i}
                                                         whileHover={{ scale: 1.02, backgroundColor: isSelected ? '' : 'rgba(255, 255, 255, 0.02)', borderColor: isSelected ? '' : 'rgba(255, 255, 255, 0.1)' }}
                                                         whileTap={{ scale: 0.98 }}
                                                         onClick={() => handleAnswerSelect(i)}
                                                         className={`p-6 rounded-md text-left transition-all border font-outfit ${isSelected ? 'bg-brand-primary/10 border-brand-primary shadow-[0_0_20px_rgba(37,99,235,0.15)]' : 'bg-slate-900 border-slate-800 hover:border-slate-700'}`}
                                                     >
                                                         <div className="flex items-center gap-6 font-outfit font-outfit">
                                                             <span className={`w-10 h-10 rounded-sm flex items-center justify-center text-[10px] font-black uppercase ${isSelected ? 'bg-brand-primary text-white' : 'bg-slate-800 text-slate-400'}`}>
                                                                 Option {String.fromCharCode(65 + i)}
                                                             </span>
                                                             <span className={`text-sm font-black tracking-widest uppercase italic ${isSelected ? 'text-brand-primary' : 'text-slate-300'}`}>{option}</span>
                                                         </div>
                                                     </motion.button>
                                                 );
                                             })}
                                         </div>
                                         
                                         <div className="flex items-center justify-between pt-8 border-t border-slate-800/60 mt-8 font-outfit">
                                             <button 
                                                 onClick={goToPrev} 
                                                 disabled={currentQuestion === 0}
                                                 className={`px-6 py-3 rounded-md text-[9px] font-black uppercase tracking-[0.2em] transition-all border flex-shrink-0 h-[36px] font-outfit italic ${currentQuestion === 0 ? 'bg-slate-900/10 text-slate-600 border-slate-800/50 cursor-not-allowed hidden' : 'bg-slate-900 text-slate-400 hover:bg-slate-800 hover:text-white border-slate-700'}`}
                                             >
                                                 Previous Question
                                             </button>
                                             <div className="flex-1 text-center font-outfit">
                                                 <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest italic flex items-center justify-center gap-2 relative h-[36px]"><Brain size={12}/> Quiz in Progress</p>
                                             </div>
                                             {currentQuestion < selectedQuiz.questions.length - 1 ? (
                                                 <button 
                                                     onClick={goToNext} 
                                                     className="px-8 py-3 bg-slate-800 text-white hover:bg-slate-700 hover:border-slate-500 rounded-md text-[9px] font-black uppercase tracking-[0.2em] transition-all border border-slate-600 flex-shrink-0 h-[36px] font-outfit italic"
                                                 >
                                                     Skip / Next Question
                                                 </button>
                                             ) : (
                                                 <button 
                                                     onClick={submitQuiz} 
                                                     className="px-8 py-3 bg-brand-primary hover:bg-brand-primary/80 text-white rounded-md text-[9px] font-black uppercase tracking-[0.2em] transition-all border border-brand-primary shadow-[0_0_15px_rgba(37,99,235,0.4)] flex-shrink-0 h-[36px] font-outfit italic"
                                                 >
                                                     Submit Quiz
                                                 </button>
                                             )}
                                         </div>
                                     </div>
                                 </div>
                             </div>
                        ) : (
                            <div className="space-y-10 font-outfit font-outfit">
                                {/* Summary Header */}
                                <div className="text-center py-10 space-y-6 border-b border-slate-800/60 font-outfit">
                                    <div className="relative inline-block font-outfit">
                                        <div className="w-24 h-24 rounded-full bg-brand-primary/10 border-2 border-brand-primary flex items-center justify-center text-brand-primary animate-pulse">
                                            <Award size={48} />
                                        </div>
                                        <motion.div 
                                            initial={{ scale: 0 }}
                                            animate={{ scale: 1 }}
                                            className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-brand-primary text-white flex items-center justify-center shadow-lg"
                                        >
                                            <CheckCircle size={18} />
                                        </motion.div>
                                    </div>

                                    <div className="space-y-3 font-outfit">
                                        <h3 className="text-3xl font-black text-white italic uppercase tracking-tighter">Quiz Submitted</h3>
                                        <p className="text-slate-500 font-bold uppercase tracking-widest text-[10px] italic">Your score has been calculated.</p>
                                    </div>

                                    <div className="grid grid-cols-3 gap-4 max-w-xl mx-auto font-outfit">
                                        <div className="p-4 bg-slate-900/60 rounded-md border border-slate-800 font-outfit">
                                            <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-2 italic">Average Score</p>
                                            <p className="text-2xl font-black text-brand-primary font-outfit">{(() => { const total = selectedQuiz.questions.reduce((t, q) => t + (q.points || 10), 0); return total > 0 ? Math.round((score / total) * 100) : 0; })()}%</p>
                                        </div>
                                        <div className="p-5 bg-slate-900 border border-slate-800 rounded-md shadow-xl font-outfit">
                                            <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-2 italic font-outfit">Total Score</p>
                                            <p className="text-3xl font-black text-white font-outfit">{score} <span className="text-sm text-slate-600 font-outfit">/ {selectedQuiz.questions.reduce((t, q) => t + (q.points || 10), 0)}</span></p>
                                        </div>
                                        <div className="p-4 bg-slate-900/60 rounded-md border border-slate-800 font-outfit">
                                            <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-2 italic font-outfit">Status</p>
                                            <p className="text-2xl font-black text-brand-primary font-outfit">
                                                {(() => { const total = selectedQuiz.questions.reduce((t, q) => t + (q.points || 10), 0); return total > 0 && ((score / total) * 100) >= selectedQuiz.passingScore ? 'Pass' : 'Fail'; })()}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* Detailed Review */}
                                <div className="space-y-6 max-w-4xl mx-auto font-outfit">
                                    <h4 className="text-xs font-black uppercase tracking-[0.4em] text-slate-500 flex items-center gap-3 border-b border-slate-800/40 pb-4 font-outfit">
                                        <div className="w-8 h-px bg-brand-primary font-outfit"></div> Answer Review
                                    </h4>

                                    {selectedQuiz.questions.map((question, qIdx) => {
                                        const selectedOption = userAnswers[qIdx];
                                        const isAnswered = selectedOption !== undefined;
                                        const isCorrect = isAnswered && selectedOption === question.correctAnswer;
                                        
                                        return (
                                            <motion.div
                                                key={qIdx}
                                                initial={{ opacity: 0, y: 10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{ delay: qIdx * 0.05 }}
                                                className={`p-6 rounded-md border font-outfit ${isCorrect ? 'bg-emerald-500/5 border-emerald-500/20' : !isAnswered ? 'bg-slate-800/10 border-slate-700/30' : 'bg-rose-500/5 border-rose-500/20'}`}
                                            >
                                                {/* Question Header */}
                                                <div className="flex items-start justify-between gap-4 mb-4 font-outfit">
                                                    <div className="flex items-start gap-4 flex-1 font-outfit font-outfit">
                                                        <div className={`w-10 h-10 rounded-md flex items-center justify-center text-[10px] font-black uppercase flex-shrink-0 ${isCorrect ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : !isAnswered ? 'bg-slate-800/50 text-slate-400 border border-slate-700/50' : 'bg-rose-500/20 text-rose-500 border border-rose-500/30'}`}>
                                                            Q{qIdx + 1}
                                                        </div>
                                                        <p className="text-sm font-bold text-slate-200 leading-relaxed pt-2 font-outfit">{question.text}</p>
                                                    </div>
                                                    <div className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-[9px] font-black uppercase tracking-widest italic ${isCorrect ? 'bg-emerald-500/20 text-emerald-400' : !isAnswered ? 'bg-slate-800/50 text-slate-400' : 'bg-rose-500/20 text-rose-500'}`}>
                                                        {isCorrect ? <CheckCircle size={12} /> : !isAnswered ? <MinusCircle size={12} /> : <X size={12} />}
                                                        {isCorrect ? 'Correct' : !isAnswered ? 'Not Attempted' : 'Wrong'}
                                                    </div>
                                                </div>

                                                {/* Options */}
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 ml-14 font-outfit">
                                                    {question.options.map((option, oIdx) => {
                                                        const isUserAnswer = selectedOption === oIdx;
                                                        const isCorrectAnswer = question.correctAnswer === oIdx;
                                                        
                                                        let optionClass = "p-4 rounded-md border transition-all font-outfit ";
                                                        
                                                        if (isCorrectAnswer) {
                                                            optionClass += "bg-emerald-500/10 border-emerald-500/30 text-emerald-300";
                                                        } else if (isUserAnswer && !isCorrect) {
                                                            optionClass += "bg-rose-500/10 border-rose-500/30 text-rose-500";
                                                        } else {
                                                            optionClass += "bg-slate-900/40 border-slate-800/60 text-slate-500";
                                                        }

                                                        return (
                                                            <div key={oIdx} className={optionClass}>
                                                                <div className="flex items-center gap-3 font-outfit font-outfit">
                                                                    <span className="w-6 h-6 rounded-sm bg-slate-800/50 flex items-center justify-center text-[9px] font-black text-slate-400 flex-shrink-0">
                                                                        {String.fromCharCode(65 + oIdx)}
                                                                    </span>
                                                                    <span className="text-xs font-bold flex-1 italic">{option}</span>
                                                                    {isCorrectAnswer && (
                                                                        <CheckCircle size={14} className="text-emerald-400 flex-shrink-0" />
                                                                    )}
                                                                    {isUserAnswer && !isCorrect && (
                                                                        <X size={14} className="text-rose-500 flex-shrink-0" />
                                                                    )}
                                                                </div>
                                                            </div>
                                                        );
                                                    })}
                                                </div>

                                                {/* Explanation */}
                                                {!isCorrect && (
                                                    <div className="mt-4 ml-14 p-3 bg-slate-900/60 border border-slate-800/60 rounded-md font-outfit">
                                                        <p className="text-[9px] font-black uppercase tracking-widest text-slate-500 mb-1 italic">Correct Answer</p>
                                                        <p className="text-xs text-slate-400 font-outfit">
                                                            <span className="font-black text-emerald-400 font-outfit">Option {String.fromCharCode(65 + question.correctAnswer)}:</span> {question.options[question.correctAnswer]}
                                                        </p>
                                                    </div>
                                                )}
                                            </motion.div>
                                        );
                                    })}
                                </div>

                                {/* Action Buttons */}
                                <div className="flex justify-center gap-4 pt-6 border-t border-slate-800/60 font-outfit">
                                    <button 
                                        onClick={() => startQuiz(selectedQuiz)}
                                        className="flex items-center gap-3 px-8 py-4 bg-slate-800 hover:bg-slate-700 text-white rounded-md text-[10px] font-black uppercase tracking-[0.3em] transition-all h-[48px] font-outfit italic"
                                    >
                                        <RotateCcw size={16} /> Retake Quiz
                                    </button>
                                    <button 
                                        onClick={() => setActiveView('portal')}
                                        className="flex items-center gap-3 px-10 py-4 bg-brand-primary text-white rounded-md text-[10px] font-black uppercase tracking-[0.3em] transition-all h-[48px] font-outfit italic"
                                    >
                                        Quiz Portal <ChevronRight size={16} />
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
                        className="bg-[#0f0f12] border border-slate-800/60 rounded-md overflow-hidden font-outfit shadow-2xl"
                    >
                        <div className="overflow-x-auto font-outfit">
                            <table className="w-full text-left font-outfit">
                                <thead className="bg-[#0a0a0c] font-outfit">
                                    <tr className="border-b border-slate-800/60 font-outfit">
                                        <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-500 italic">Quiz Title</th>
                                        <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-500 italic">Subject</th>
                                        <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-500 text-center italic">Score</th>
                                        <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-500 text-center italic">Status</th>
                                        <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-500 text-right italic">Date Submitted</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-800/40 font-outfit">
                                    {quizHistory.length > 0 ? (
                                        quizHistory.map((attempt, idx) => (
                                            <tr key={attempt._id || idx} className="hover:bg-slate-800/10 transition-colors group font-outfit">
                                                <td className="px-8 py-6 font-outfit">
                                                    <p className="text-[11px] font-black text-white uppercase tracking-wider italic font-outfit">{attempt.quizId?.title}</p>
                                                </td>
                                                <td className="px-8 py-6 font-outfit">
                                                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest italic font-outfit">{attempt.quizId?.subjectId?.name}</span>
                                                </td>
                                                <td className="px-8 py-6 text-center font-outfit">
                                                    <span className="text-sm font-black text-white tracking-widest font-outfit italic">{attempt.score} <span className="text-xs text-slate-600 font-outfit font-outfit">/ {attempt.totalPoints}</span></span>
                                                </td>
                                                <td className="px-8 py-6 font-outfit font-outfit">
                                                    <div className="flex justify-center font-outfit">
                                                        <span className={`px-4 py-1.5 rounded-md text-[9px] font-black uppercase tracking-[.15em] border italic ${attempt.status === 'Passed' ? 'text-luxury-emerald border-emerald-500/30 bg-emerald-500/10' : 'text-rose-500 border-rose-500/30 bg-rose-500/10'}`}>
                                                            {attempt.status}
                                                        </span>
                                                    </div>
                                                </td>
                                                <td className="px-8 py-6 text-right text-[10px] font-black text-slate-500 uppercase tracking-widest italic font-outfit font-outfit">
                                                    {new Date(attempt.createdAt).toLocaleDateString()}
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan="5" className="px-8 py-20 text-center text-[10px] font-black uppercase tracking-widest text-slate-600 italic font-outfit">No quiz attempts found.</td>
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
