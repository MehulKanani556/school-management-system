import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchStudentResults } from '../../redux/slice/student.slice';
import { motion } from 'framer-motion';
import { Award, Star, BookOpen, TrendingUp, Download, Search, FileText, ChevronRight } from 'lucide-react';
import axiosInstance from '../../utils/axiosInstance';
import { toast } from 'react-hot-toast';

const AcademicResults = () => {
    const dispatch = useDispatch();
    const { results, profile, loading } = useSelector((state) => state.student);
    const { user } = useSelector(state => state.auth);

    useEffect(() => {
        dispatch(fetchStudentResults());
    }, [dispatch]);

    const handleDownloadReport = async () => {
        try {
            const res = await axiosInstance.get('/student/report-card', { responseType: 'blob' });
            const url = window.URL.createObjectURL(new Blob([res.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `ReportCard_${user?.firstName || 'Student'}.pdf`);
            document.body.appendChild(link);
            link.click();
            link.remove();
            toast.success('Report Card Transmission Synchronized.');
        } catch (err) {
            toast.error('Transmission Loss: Failed to download report.');
        }
    };

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
            className="space-y-8 max-w-7xl mx-auto"
        >
            <header className="flex flex-col md:flex-row md:items-end justify-between gap-8">
                <div className="space-y-3">
                    <h1 className="text-4xl font-black text-white italic uppercase tracking-tighter leading-none font-outfit">Performance Node</h1>
                    <p className="text-slate-500 font-medium text-lg italic leading-relaxed max-w-xl">Academic achievement telemetry & digital credential archive.</p>
                </div>
                
                <div className="flex bg-[#0f0f12] border border-slate-800/60 p-6 rounded-md items-center gap-10 shadow-2xl relative overflow-hidden group">
                   <div className="absolute top-0 right-0 w-24 h-24 bg-luxury-emerald/5 rounded-md blur-2xl -mr-10 -mt-10 group-hover:bg-luxury-emerald/10 transition-all"></div>
                   
                   <div className="text-center">
                        <p className="text-[9px] font-black uppercase tracking-widest text-slate-500 mb-2 italic">Aggregate Score</p>
                        <p className="text-3xl font-black text-luxury-emerald italic font-outfit tracking-tighter">{overallPercentage}%</p>
                   </div>
                   
                   <div className="w-px h-12 bg-slate-800/60"></div>
                   
                   <div className="text-center">
                        <p className="text-[9px] font-black uppercase tracking-widest text-slate-500 mb-2 italic">Rank Status</p>
                        <div className="flex items-center gap-1 text-3xl font-black text-white italic font-outfit tracking-tighter">
                            <span className="text-brand-accent">A</span>+
                        </div>
                   </div>
                </div>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                {/* Statistics Sidebar */}
                <div className="lg:col-span-4 space-y-6 lg:sticky lg:top-24">
                    <div className="bg-[#0f0f12] border border-slate-800/60 p-8 rounded-md shadow-2xl space-y-10">
                        <div className="space-y-6">
                            <h3 className="text-sm font-black text-white uppercase tracking-widest mb-6 flex items-center gap-3 italic">
                                <span className="w-8 h-px bg-luxury-emerald"></span> Command Center
                            </h3>
                            <button 
                                onClick={handleDownloadReport}
                                className="w-full py-5 bg-luxury-emerald hover:bg-emerald-500 text-black rounded-md flex items-center justify-center gap-4 text-[11px] font-black uppercase tracking-[0.3em] transition-all shadow-[0_0_30px_rgba(16,185,129,0.25)] border border-white/10 group"
                            >
                                Download Report Card <Download size={16} className="group-hover:translate-y-1 transition-transform" />
                            </button>
                            <button className="w-full py-5 bg-slate-800/40 hover:bg-slate-800 text-slate-400 hover:text-white rounded-md flex items-center justify-center gap-4 text-[10px] font-black uppercase tracking-[0.2em] transition-all border border-slate-700/40 italic">
                                External Authentication <TrendingUp size={16} />
                            </button>
                        </div>

                        <div className="pt-10 border-t border-slate-800/40 space-y-6">
                            <h4 className="text-[10px] font-black text-slate-600 uppercase italic tracking-[0.25em]">Progress Tracking</h4>
                            <div className="space-y-5">
                                {[
                                    { label: 'Completed Credits', value: results.length, total: 10 },
                                    { label: 'Attendance Sync', value: 94, total: 100 }
                                ].map((stat, i) => (
                                    <div key={i} className="space-y-3">
                                        <div className="flex justify-between text-[9px] font-black uppercase tracking-widest text-slate-500">
                                            <span>{stat.label}</span>
                                            <span className="text-white">{stat.value}/{stat.total}</span>
                                        </div>
                                        <div className="h-1 bg-slate-900 rounded-md overflow-hidden">
                                            <div className="h-full bg-luxury-emerald/60" style={{ width: `${(stat.value/stat.total)*100}%` }}></div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="bg-gradient-to-br from-indigo-500/10 to-transparent border border-indigo-500/20 p-8 rounded-md">
                        <h4 className="text-xs font-black text-indigo-400 uppercase tracking-[.25em] mb-4 flex items-center gap-2 italic">
                            <Star size={14} /> Evaluation Disclaimer
                        </h4>
                        <p className="text-slate-500 text-xs font-medium leading-relaxed italic uppercase tracking-tighter">
                            All performance metrics are subject to final auditing by the institutional board of governors. Result discrepancies should be reported within 48 solar hours.
                        </p>
                    </div>
                </div>

                {/* Main Results Feed */}
                <div className="lg:col-span-8 bg-[#0f0f12] border border-slate-800/60 rounded-md shadow-2xl overflow-hidden">
                    <div className="p-10 border-b border-slate-800/60 bg-[#0a0a0c] flex items-center justify-between">
                         <div className="flex items-center gap-4">
                            <div className="p-3 bg-luxury-emerald/10 rounded-md border border-luxury-emerald/20"><Award size={20} className="text-luxury-emerald shadow-[0_0_10px_rgba(16,185,129,0.3)]" /></div>
                            <h3 className="text-sm font-black uppercase tracking-[0.4em] text-white font-outfit italic">Academic Matrix List</h3>
                        </div>
                        <div className="relative group hidden sm:block">
                            <Search size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600 transition-colors group-focus-within:text-luxury-emerald" />
                            <input 
                                type="text" 
                                placeholder="FILTER BY SUBJECT..." 
                                className="bg-slate-950/60 border border-slate-800 rounded-md py-3 pl-12 pr-6 text-[10px] font-black text-white italic w-56 outline-none focus:border-luxury-emerald placeholder:text-slate-900 uppercase tracking-widest transition-all" 
                            />
                        </div>
                    </div>

                    <div className="p-10 grid grid-cols-1 gap-8">
                        {results.length > 0 ? (
                            results.map((res, idx) => {
                                const per = ((res.marksObtained / res.totalMarks) * 100).toFixed(0);
                                return (
                                    <motion.div 
                                        key={res._id || idx}
                                        initial={{ opacity: 0, x: 20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: idx * 0.05 }}
                                        className="bg-slate-900/40 border border-slate-800/50 p-10 rounded-md hover:border-luxury-emerald/30 transition-all group relative overflow-hidden"
                                    >
                                        <div className="absolute top-0 right-0 p-10 opacity-5 group-hover:opacity-10 transition-opacity">
                                            <FileText size={80} />
                                        </div>
                                        
                                        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-8 mb-10">
                                            <div>
                                                <div className="flex items-center gap-3 mb-3">
                                                    <span className="px-3 py-1 bg-luxury-emerald/10 text-luxury-emerald border border-luxury-emerald/20 rounded-md text-[9px] font-black uppercase tracking-[0.3em] italic">{(res.examId?.name || 'Standard Eval').toUpperCase()}</span>
                                                    <span className="w-1.5 h-1.5 rounded-md bg-slate-800"></span>
                                                    <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest italic">Node-ID: {res._id.slice(-6).toUpperCase()}</span>
                                                </div>
                                                <h4 className="text-3xl font-black text-white italic tracking-tighter uppercase font-outfit group-hover:text-luxury-emerald transition-all">{res.subjectId?.name || 'Subject Terminal'}</h4>
                                            </div>
                                            <div className="text-left md:text-right bg-slate-950/40 px-6 py-4 rounded-md border border-slate-800/60">
                                                <p className="text-4xl font-black text-white font-outfit leading-none tracking-tighter italic">{res.marksObtained}<span className="text-slate-600 text-lg ml-2">/ {res.totalMarks}</span></p>
                                                <p className="text-[10px] font-black text-slate-600 uppercase tracking-[0.3em] mt-3 italic">Precision Rating</p>
                                            </div>
                                        </div>

                                        <div className="relative z-10 space-y-4 mb-10">
                                            <div className="flex justify-between items-end px-1">
                                                <span className="text-[10px] font-black uppercase tracking-[0.35em] text-slate-500 italic">Mastery Completion</span>
                                                <span className="text-lg font-black text-luxury-emerald italic font-outfit">{per}%</span>
                                            </div>
                                            <div className="h-2 w-full bg-slate-800/60 rounded-md overflow-hidden p-0.5 border border-slate-700/30">
                                                <motion.div 
                                                    initial={{ width: 0 }}
                                                    animate={{ width: `${per}%` }}
                                                    transition={{ duration: 1.5, ease: "circOut", delay: 0.3 }}
                                                    className="h-full bg-luxury-emerald rounded-sm shadow-[0_0_15px_rgba(16,185,129,0.35)]"
                                                />
                                            </div>
                                        </div>

                                        <div className="relative z-10 flex items-center justify-between pt-8 border-t border-slate-800/60">
                                            <div className="flex items-center gap-4">
                                                <div className="flex items-center gap-2 bg-slate-950/60 px-4 py-2 rounded-md border border-slate-800/40">
                                                    <div className="w-2 h-2 rounded-md bg-luxury-emerald animate-pulse"></div>
                                                    <span className="text-[11px] font-black uppercase tracking-widest text-slate-300 italic">Grade Index: {res.grade || 'A'}</span>
                                                </div>
                                                <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest hidden sm:block italic">Verified Node Audit</span>
                                            </div>
                                            <button className="flex items-center gap-3 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] hover:text-white transition-all italic group/btn">
                                                Full Analytics <ChevronRight size={14} className="group-hover/btn:translate-x-1 transition-transform" />
                                            </button>
                                        </div>
                                    </motion.div>
                                );
                            })
                        ) : (
                            <div className="py-40 text-center bg-[#0a0a0c]/40 rounded-md border border-dashed border-slate-800/60">
                                <TrendingUp size={64} className="text-slate-800/40 mx-auto mb-8 animate-pulse" />
                                <h3 className="text-xl font-black text-slate-700 uppercase tracking-[0.4em] font-outfit mb-3 italic">Telemetry Depleted</h3>
                                <p className="text-slate-800 text-[10px] font-black uppercase tracking-widest leading-none">No active achievement signals detected in this sector.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </motion.div>
    );
};

export default AcademicResults;
