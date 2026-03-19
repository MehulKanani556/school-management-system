import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchStudentProfile } from '../../redux/slice/student.slice';
import { motion } from 'framer-motion';
import { Award, ClipboardList, Calendar, BookOpen, Clock, ArrowUpRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const StudentDashboard = () => {
    const dispatch = useDispatch();
    const { user } = useSelector((state) => state.auth);
    const { profile, loading } = useSelector((state) => state.student);

    useEffect(() => {
        dispatch(fetchStudentProfile());
    }, [dispatch]);

    const stats = [
        { label: 'Attendance', value: '94%', icon: ClipboardList, color: 'text-luxury-emerald' },
        { label: 'GPA Node', value: '3.8', icon: Award, color: 'text-brand-primary' },
        { label: 'Assigned', value: '08', icon: BookOpen, color: 'text-brand-secondary' },
        { label: 'Schedule', value: '09:00', icon: Clock, color: 'text-brand-accent' },
    ];

    return (
        <div className="space-y-12">
            <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                    <h1 className="text-4xl font-black text-white italic uppercase tracking-tighter leading-none mb-4 font-outfit">Student Terminal, <br/> {user?.firstName}</h1>
                    <p className="text-slate-500 font-medium text-lg leading-relaxed max-w-xl">Unified academic node access. Monitoring performance and schedules.</p>
                </div>
                <div className="bg-slate-800/20 border border-slate-800/50 p-6 rounded-[2rem] min-w-[200px] backdrop-blur-xl">
                    <p className="text-[10px] font-black uppercase tracking-[0.25em] text-slate-500 mb-2">Institutional Node</p>
                    <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-luxury-emerald"></div>
                        <span className="text-xl font-black uppercase text-white font-outfit truncate">{profile?.schoolId?.name || 'Sector-01'}</span>
                    </div>
                </div>
            </header>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                {stats.map((stat, idx) => (
                    <motion.div
                        key={stat.label}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.05 }}
                        className="bg-[#0f0f12] border border-slate-800/60 p-8 rounded-[2.5rem] relative group hover:border-luxury-emerald/40 transition-all shadow-2xl"
                    >
                        <stat.icon size={24} className={`${stat.color} mb-6 opacity-70 group-hover:opacity-100 transition-opacity`} />
                        <p className="text-[10px] font-black uppercase tracking-[0.25em] text-slate-500 mb-2 font-outfit">{stat.label}</p>
                        <p className="text-4xl font-black text-white font-outfit tracking-tighter">{stat.value}</p>
                        <div className="absolute top-8 right-8 w-2 h-2 rounded-full bg-slate-800 group-hover:bg-luxury-emerald transition-colors"></div>
                    </motion.div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-8">
                    <div className="flex items-center justify-between px-2">
                        <h3 className="text-xs font-black uppercase tracking-[0.3em] text-slate-500 font-outfit italic">Academic Cluster</h3>
                        <Link to="/student/results" className="text-[10px] font-black uppercase tracking-widest text-luxury-emerald flex items-center gap-2 group italic">Full Performance <ArrowUpRight size={14} className="group-hover:translate-x-1 transition-transform" /> </Link>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="bg-gradient-to-br from-[#0f0f12] to-luxury-emerald/5 p-8 rounded-[2.5rem] border border-slate-800/80 shadow-2xl group">
                            <h4 className="text-2xl font-black text-white italic tracking-tighter uppercase font-outfit mb-2">Class Assignment</h4>
                            <p className="text-slate-500 text-sm font-medium leading-relaxed mb-6 italic">Grade {profile?.classSection?.gradeLevel || '0'} - Section {profile?.classSection?.sectionLabel || 'A'}</p>
                            <div className="w-full h-px bg-slate-800/50 mb-6"></div>
                            <Link to="/student/timetable" className="w-full py-4 bg-slate-800 hover:bg-slate-700 rounded-2xl flex items-center justify-center gap-3 text-[10px] font-black uppercase tracking-widest transition-all text-slate-300">View Timetable <Calendar size={14}/></Link>
                        </div>

                        <div className="bg-[#0f0f12] p-8 rounded-[2.5rem] border border-slate-800/80 shadow-2xl relative overflow-hidden group">
                           <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-brand-primary/10 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
                           <h4 className="text-2xl font-black text-white italic tracking-tighter uppercase font-outfit mb-2">Next Submission</h4>
                           <p className="text-luxury-rose text-[10px] font-black uppercase tracking-widest mb-6 italic">Due in 24 Hours</p>
                           <p className="text-slate-100 text-sm font-bold mb-1 group-hover:text-brand-primary transition-colors">Advanced Physics: Lab-04</p>
                           <p className="text-slate-500 text-[10px] font-medium mb-8 uppercase tracking-widest">Digital Repository Node</p>
                           <Link to="/student/assignments" className="text-[10px] font-black uppercase tracking-widest text-brand-primary flex items-center gap-2 italic">Access Assignments <ArrowUpRight size={14} /> </Link>
                        </div>
                    </div>
                </div>

                <div className="space-y-6">
                    <h3 className="text-xs font-black uppercase tracking-[0.3em] text-slate-500 font-outfit px-2">Signals Node</h3>
                    <div className="bg-[#0f0f12]/60 border border-slate-800 p-8 rounded-[2.5rem] shadow-2xl">
                        <div className="space-y-6">
                            {[1, 2, 3].map(msg => (
                                <div key={msg} className="p-5 bg-slate-800/20 rounded-2xl border border-slate-800/40 hover:border-luxury-emerald/30 transition-all group">
                                    <p className="text-[9px] font-black text-luxury-emerald uppercase tracking-[0.3em] mb-2 font-outfit italic">Institutional Alert</p>
                                    <p className="text-[12px] font-bold text-slate-100 mb-1 group-hover:text-white transition-colors">Semester final schedules published...</p>
                                    <p className="text-[10px] text-slate-500 font-medium">Administration Node • 4h ago</p>
                                </div>
                            ))}
                        </div>
                        <button className="w-full mt-10 py-4 border border-slate-800 hover:bg-slate-800 rounded-2xl text-[10px] font-black uppercase tracking-[0.4em] transition-all text-slate-500 hover:text-white">Full History</button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default StudentDashboard;
