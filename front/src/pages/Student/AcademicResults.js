import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchStudentResults } from '../../redux/slice/student.slice';
import { motion } from 'framer-motion';
import { Award, Star, BookOpen, TrendingUp, Download, Search } from 'lucide-react';

const AcademicResults = () => {
    const dispatch = useDispatch();
    const { results, loading } = useSelector((state) => state.student);

    useEffect(() => {
        dispatch(fetchStudentResults());
    }, [dispatch]);

    // Calculate aggregate metrics
    const aggregate = results.reduce((acc, curr) => {
        acc.totalObtained += curr.marksObtained || 0;
        acc.totalPossible += curr.totalMarks || 100;
        return acc;
    }, { totalObtained: 0, totalPossible: 0 });

    const overallPercentage = aggregate.totalPossible > 0 
        ? ((aggregate.totalObtained / aggregate.totalPossible) * 100).toFixed(1) 
        : '0.0';

    return (
        <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-8"
        >
            <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                    <h1 className="text-4xl font-black text-white italic uppercase tracking-tighter leading-none mb-4 font-outfit">Performance Node</h1>
                    <p className="text-slate-500 font-medium text-lg leading-relaxed max-w-xl italic">Academic achievement telemetry & result analytics.</p>
                </div>
                <div className="bg-[#0f0f12] border border-slate-800 p-6 rounded-md flex items-center gap-8 shadow-2xl relative overflow-hidden group">
                   <div className="absolute top-0 right-0 w-24 h-24 bg-brand-primary/5 rounded-md blur-2xl -mr-10 -mt-10"></div>
                   <div className="text-center group-hover:scale-110 transition-transform">
                        <p className="text-[9px] font-black uppercase tracking-widest text-slate-500 mb-1">Aggregate Score</p>
                        <p className="text-2xl font-black text-brand-primary italic font-outfit">{overallPercentage}%</p>
                   </div>
                   <div className="w-px h-10 bg-slate-800"></div>
                   <div className="text-center">
                        <p className="text-[9px] font-black uppercase tracking-widest text-slate-500 mb-1">Rank Status</p>
                        <div className="flex items-center gap-1 text-2xl font-black text-white italic font-outfit">
                            <span className="text-brand-accent">A</span>+
                        </div>
                   </div>
                </div>
            </header>

            <div className="grid grid-cols-1 gap-8">
                <div className="bg-[#0f0f12] border border-slate-800/60 rounded-md overflow-hidden shadow-2xl">
                    <div className="p-10 border-b border-slate-800/50 flex flex-col md:flex-row md:items-center justify-between gap-6 bg-black/20">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-brand-primary/10 rounded-md"><Award size={20} className="text-brand-primary" /></div>
                            <h3 className="text-xs font-black uppercase tracking-[0.4em] text-slate-300 font-outfit">Subject Performance Matrix</h3>
                        </div>
                        <div className="flex items-center gap-4">
                            <div className="relative">
                                <Search size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
                                <input type="text" placeholder="Search Subject..." className="bg-slate-900/50 border border-slate-800 rounded-md py-2 pl-12 pr-4 text-[10px] font-bold text-white w-48 focus:outline-none focus:border-brand-primary/40" />
                            </div>
                            <button className="p-3 bg-slate-800 hover:bg-slate-700 rounded-md transition-colors text-slate-300"><Download size={16}/></button>
                        </div>
                    </div>

                    <div className="p-10 grid grid-cols-1 md:grid-cols-2 gap-8">
                        {results.length > 0 ? (
                            results.map((res, idx) => {
                                const per = ((res.marksObtained / res.totalMarks) * 100).toFixed(0);
                                return (
                                    <motion.div 
                                        key={res._id || idx}
                                        initial={{ opacity: 0, scale: 0.95 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        transition={{ delay: idx * 0.1 }}
                                        className="bg-slate-900/40 border border-slate-800/50 p-8 rounded-md hover:border-brand-primary/30 transition-all group relative overflow-hidden"
                                    >
                                        <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-20 transition-opacity">
                                            <BookOpen size={48} />
                                        </div>
                                        <div className="flex items-center justify-between mb-8">
                                            <div>
                                                <p className="text-[10px] font-black text-brand-primary uppercase tracking-[0.3em] mb-1 italic">{(res.examId?.name || 'Standard Exam').toUpperCase()}</p>
                                                <h4 className="text-xl font-black text-white italic tracking-tighter uppercase font-outfit">Subject ID: {res.subjectId || 'Core'}</h4>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-2xl font-black text-white font-outfit leading-none">{res.marksObtained}<span className="text-slate-600 text-sm ml-1">/{res.totalMarks}</span></p>
                                                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">Raw Precision</p>
                                            </div>
                                        </div>

                                        <div className="space-y-3">
                                            <div className="flex justify-between items-end">
                                                <span className="text-[9px] font-black uppercase tracking-widest text-slate-500">Mastery Level</span>
                                                <span className="text-[10px] font-black text-brand-primary">{per}%</span>
                                            </div>
                                            <div className="h-1.5 w-full bg-slate-800 rounded-md overflow-hidden">
                                                <motion.div 
                                                    initial={{ width: 0 }}
                                                    animate={{ width: `${per}%` }}
                                                    transition={{ duration: 1, delay: 0.5 }}
                                                    className="h-full bg-gradient-to-r from-brand-primary to-luxury-emerald rounded-md"
                                                />
                                            </div>
                                        </div>

                                        <div className="mt-8 flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                <div className="w-1.5 h-1.5 rounded-md bg-luxury-emerald"></div>
                                                <span className="text-[10px] font-black uppercase tracking-widest text-slate-300">Grade {res.grade || 'A'}</span>
                                            </div>
                                            <button className="text-[9px] font-black text-slate-500 uppercase tracking-[0.2em] hover:text-white transition-colors italic">Detailed Analytics</button>
                                        </div>
                                    </motion.div>
                                );
                            })
                        ) : (
                            <div className="col-span-2 py-20 text-center">
                                <TrendingUp size={48} className="text-slate-800 mx-auto mb-6" />
                                <p className="text-slate-500 font-bold italic uppercase tracking-widest text-[10px]">No Achievement Telemetry Detected in this Sector</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </motion.div>
    );
};

export default AcademicResults;
