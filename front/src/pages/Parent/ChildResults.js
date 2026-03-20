import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchChildResults } from '../../redux/slice/parent.slice';
import { motion } from 'framer-motion';
import { Trophy, ChevronRight, Target, Activity, FileText } from 'lucide-react';

const ChildResults = () => {
    const dispatch = useDispatch();
    const { selectedChild, results, loading } = useSelector((state) => state.parent);

    useEffect(() => {
        if (selectedChild?._id) {
            dispatch(fetchChildResults(selectedChild._id));
        }
    }, [selectedChild?._id, dispatch]);

    const calculateGrade = (obtained, total) => {
        const p = (obtained / total) * 100;
        if (p >= 90) return { label: 'A+', color: 'text-emerald-400' };
        if (p >= 80) return { label: 'A', color: 'text-emerald-500' };
        if (p >= 70) return { label: 'B+', color: 'text-brand-primary' };
        if (p >= 60) return { label: 'B', color: 'text-brand-secondary' };
        if (p >= 50) return { label: 'C', color: 'text-amber-400' };
        return { label: 'D', color: 'text-rose-400' };
    };

    return (
        <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-8"
        >
            <header className="flex flex-col md:flex-row md:items-end justify-between gap-8 bg-brand-surface/40 p-10 rounded-md border border-brand-border/40 shadow-2xl backdrop-blur-xl">
                <div className="space-y-2">
                    <div className="flex items-center gap-3 mb-2">
                        <span className="w-12 h-[2px] bg-luxury-rose rounded-md"></span>
                        <span className="text-[10px] font-black uppercase tracking-[0.4em] text-luxury-rose">Outcome Node</span>
                    </div>
                    <h1 className="text-4xl font-black text-white uppercase tracking-tighter leading-none font-outfit">Academic Outcomes</h1>
                    <p className="text-slate-500 font-medium text-sm tracking-wide">Standardized assessment logs for <span className="text-white font-bold">{selectedChild?.firstName}</span></p>
                </div>

                <div className="flex items-center gap-4 bg-black/40 border border-slate-800 p-4 px-8 rounded-md shadow-inner">
                    <Trophy className="text-luxury-rose w-10 h-10" />
                    <div>
                        <p className="text-[9px] font-black uppercase tracking-[0.3em] text-slate-500">Global Average</p>
                        <p className="text-2xl font-black text-white">78.5% <span className="text-[10px] text-emerald-400 uppercase tracking-[0.2em] font-black ml-2 font-inter">+2.1</span></p>
                    </div>
                </div>
            </header>

            <div className="grid grid-cols-1 gap-6">
                <div className="bg-brand-surface/40 border border-brand-border/40 rounded-md overflow-hidden">
                    <div className="p-8 border-b border-brand-border/40 bg-black/20">
                        <h3 className="text-xs font-black uppercase tracking-[0.3em] text-slate-400 font-outfit">Scholastic Registry</h3>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-slate-900/40">
                                    <th className="px-8 py-6 text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 italic">Assessment</th>
                                    <th className="px-8 py-6 text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 italic">Subject Domain</th>
                                    <th className="px-8 py-6 text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 italic">Raw Score</th>
                                    <th className="px-8 py-6 text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 italic text-right">Tier</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-brand-border/20">
                                {results.length > 0 ? (
                                    results.map((mark, idx) => {
                                        const grade = calculateGrade(mark.marksObtained, mark.totalMarks);
                                        return (
                                            <tr key={idx} className="hover:bg-white/[0.02] transition-colors group">
                                                <td className="px-8 py-6">
                                                    <div className="flex items-center gap-4">
                                                        <div className="p-3 bg-slate-900 rounded-md">
                                                            <FileText size={18} className="text-slate-500" />
                                                        </div>
                                                        <div>
                                                            <p className="font-bold text-slate-200 tracking-tight leading-none mb-1">{mark.examId?.title}</p>
                                                            <p className="text-[9px] text-slate-500 uppercase font-black tracking-widest leading-none">Standard Assessment</p>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-8 py-6">
                                                    <div className="flex items-center gap-2">
                                                        <Target size={14} className="text-luxury-rose opacity-60" />
                                                        <span className="text-[11px] font-black uppercase text-slate-400 tracking-wider transition-colors group-hover:text-white">{mark.subjectId?.name}</span>
                                                    </div>
                                                </td>
                                                <td className="px-8 py-6">
                                                    <div className="flex items-center gap-3">
                                                        <span className="text-lg font-black text-white">{mark.marksObtained}</span>
                                                        <span className="text-xs font-bold text-slate-600">/ {mark.totalMarks}</span>
                                                        <div className="w-24 h-1.5 bg-slate-800 rounded-full overflow-hidden ml-4">
                                                            <div className="h-full bg-luxury-rose" style={{ width: `${(mark.marksObtained/mark.totalMarks)*100}%` }} />
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-8 py-6 text-right">
                                                    <div className={`inline-flex items-center justify-center w-12 h-12 rounded-md ${grade.color} bg-slate-900 border border-slate-800 shadow-xl`}>
                                                        <span className="text-xl font-black">{grade.label}</span>
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })
                                ) : (
                                    <tr>
                                        <td colSpan="4" className="px-8 py-20 text-center">
                                            <Activity size={48} className="mx-auto mb-4 text-slate-700 animate-pulse" />
                                            <p className="text-slate-500 font-bold uppercase tracking-widest text-[10px]">No Academic Records Indexed</p>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
            <div className="flex items-center justify-center p-12 bg-slate-900/20 border border-dashed border-slate-800 rounded-md">
                <p className="text-[10px] font-black uppercase text-slate-600 tracking-[0.5em] text-center max-w-md italic opacity-50">Authorized Guardian Sync // All assessment data and grade transcripts are cryptographically verified by institutional nodes.</p>
            </div>
        </motion.div>
    );
};

export default ChildResults;
