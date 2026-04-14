import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchAssignedClasses } from '../../redux/slice/teacher.slice';
import { motion } from 'framer-motion';
import { BookOpen, Users, ArrowRight, ClipboardList, Activity } from 'lucide-react';
import { Link } from 'react-router-dom';

const AssignedClasses = () => {
    const dispatch = useDispatch();
    const { classes, loading } = useSelector((state) => state.teacher);
    const { activeAcademicYearId } = useSelector((state) => state.academicYear);

    useEffect(() => {
        if (activeAcademicYearId) {
            console.log('📚 Assigned Classes - Academic Year Changed:', activeAcademicYearId);
            dispatch(fetchAssignedClasses());
        }
    }, [dispatch, activeAcademicYearId]);

    return (
        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
            <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                    <h1 className="text-3xl text-left font-black text-white italic uppercase tracking-tighter leading-none mb-3 font-outfit">Class Registry</h1>
                    <p className="text-slate-500 font-medium text-sm tracking-wide">Managing 0{classes.length} active academic sectors assigned to your faculty profile.</p>
                </div>
                <div className="px-5 py-2.5 bg-brand-primary/10 border border-brand-primary/20 rounded-md text-[10px] font-black text-brand-primary uppercase tracking-[0.2em]">Node-Level Access Only</div>
            </header>

            <div className="bg-slate-900/60 border border-slate-800 rounded-md shadow-2xl overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-800/40 border-b border-slate-800/60">
                                <th className="px-8 py-6 text-[10px] font-black text-slate-500 uppercase tracking-widest font-outfit">Sect. ID</th>
                                <th className="px-8 py-6 text-[10px] font-black text-slate-500 uppercase tracking-widest font-outfit">Class Identity</th>
                                <th className="px-8 py-6 text-[10px] font-black text-slate-500 uppercase tracking-widest font-outfit">Subject Matrix</th>
                                <th className="px-8 py-6 text-[10px] font-black text-slate-500 uppercase tracking-widest font-outfit text-right">Rapid Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800/50">
                            {loading && classes.length === 0 ? (
                                [...Array(3)].map((_, i) => (
                                    <tr key={i} className="animate-pulse">
                                        <td colSpan="4" className="px-8 py-8 bg-slate-800/10 h-20"></td>
                                    </tr>
                                ))
                            ) : (
                                classes.map((cls, idx) => (
                                    <tr key={cls._id} className="group hover:bg-white/[0.02] transition-colors">
                                        <td className="px-8 py-7">
                                            <div className="w-10 h-10 rounded-md bg-slate-800 border border-slate-700/50 flex items-center justify-center font-black text-slate-400 font-outfit italic">0{idx + 1}</div>
                                        </td>
                                        <td className="px-8 py-7">
                                            <div>
                                                <p className="text-lg font-black text-white italic tracking-tight uppercase font-outfit leading-none mb-1 group-hover:text-brand-primary transition-colors">Grade {cls.gradeLevel} - {cls.sectionLabel}</p>
                                                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Active Academic Sector</p>
                                            </div>
                                        </td>
                                        <td className="px-8 py-7">
                                            <div className="flex flex-wrap gap-2">
                                                {cls.subjects.map(sub => (
                                                    <span key={sub._id} className="px-3 py-1 bg-slate-800/60 border border-slate-700/50 rounded-md text-[9px] font-black text-slate-400 uppercase tracking-wider italic">{sub.name}</span>
                                                ))}
                                            </div>
                                        </td>
                                        <td className="px-8 py-7">
                                            <div className="flex items-center justify-end gap-3">
                                                <Link to={`/teacher/students/${cls._id}`} className="p-2.5 rounded-md border border-slate-700/50 bg-slate-800/40 text-slate-400 hover:text-brand-secondary hover:border-brand-secondary/40 transition-all shadow-lg backdrop-blur-md" title="View Students">
                                                    <Users size={18} />
                                                </Link>
                                                <Link to={`/teacher/attendance?classId=${cls._id}`} className="p-2.5 rounded-md border border-slate-700/50 bg-slate-800/40 text-slate-400 hover:text-luxury-emerald hover:border-luxury-emerald/40 transition-all shadow-lg backdrop-blur-md" title="Attendance">
                                                    <ClipboardList size={18} />
                                                </Link>
                                                <Link to={`/teacher/marks?classId=${cls._id}`} className="p-2.5 rounded-md border border-slate-700/50 bg-slate-800/40 text-slate-400 hover:text-brand-primary hover:border-brand-primary/40 transition-all shadow-lg backdrop-blur-md" title="Add Marks">
                                                    <Activity size={18} />
                                                </Link>
                                                <Link to={`/teacher/assignments?classId=${cls._id}`} className="p-2.5 rounded-md border border-slate-700/50 bg-slate-800/40 text-slate-400 hover:text-brand-accent hover:border-brand-accent/40 transition-all shadow-lg backdrop-blur-md" title="Publish Assignment">
                                                    <ArrowRight size={18} />
                                                </Link>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                            {!loading && classes.length === 0 && (
                                <tr>
                                    <td colSpan="4" className="px-8 py-20 text-center">
                                        <div className="flex flex-col items-center">
                                            <div className="p-4 rounded-md bg-slate-800/40 border border-slate-700/30 mb-4">
                                                <BookOpen size={30} className="text-slate-600" />
                                            </div>
                                            <p className="text-slate-500 font-bold uppercase tracking-widest text-[11px]">No classes assigned to this faculty ID</p>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </motion.div>
    );
};

export default AssignedClasses;
