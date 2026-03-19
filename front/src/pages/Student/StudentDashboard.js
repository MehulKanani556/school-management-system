import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { 
    fetchStudentProfile, 
    fetchStudentAttendance, 
    fetchStudentResults, 
    fetchStudentAssignments,
    fetchStudentTimetable
} from '../../redux/slice/student.slice';
import { motion } from 'framer-motion';
import { Award, ClipboardList, Calendar, BookOpen, Clock, ArrowRight, CheckCircle, XCircle, Activity, Globe } from 'lucide-react';
import { Link } from 'react-router-dom';

const StatCard = ({ label, value, icon: Icon, color, delay }) => (
    <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay }}
        className="bg-[#0f0f12] border border-slate-800/60 p-8 rounded-[2.5rem] relative group hover:border-luxury-emerald/40 transition-all shadow-2xl"
    >
        <Icon size={24} className={`${color} mb-6 opacity-70 group-hover:opacity-100 transition-opacity`} />
        <p className="text-[10px] font-black uppercase tracking-[0.25em] text-slate-500 mb-2 font-outfit">{label}</p>
        <p className="text-4xl font-black text-white font-outfit tracking-tighter">{value}</p>
        <div className="absolute top-8 right-8 w-2 h-2 rounded-full bg-slate-800 group-hover:bg-luxury-emerald transition-colors"></div>
    </motion.div>
);

const StudentDashboard = () => {
    const dispatch = useDispatch();
    const { user } = useSelector((state) => state.auth);
    const { profile, attendance, results, loading } = useSelector((state) => state.student);

    useEffect(() => {
        dispatch(fetchStudentProfile());
        dispatch(fetchStudentAttendance());
        dispatch(fetchStudentResults());
        dispatch(fetchStudentAssignments());
        dispatch(fetchStudentTimetable());
    }, [dispatch]);

    // Derived Stats
    const attPercent = attendance.length > 0 
        ? ((attendance.filter(a => a.status === 'Present').length / attendance.length) * 100).toFixed(0) 
        : '0';

    const gpa = results.length > 0
        ? ((results.reduce((s, r) => s + (r.marksObtained / r.totalMarks), 0) / results.length) * 4.0).toFixed(1)
        : '0.0';

    const stats = [
        { label: 'Attendance', value: `${attPercent}%`, icon: ClipboardList, color: 'text-luxury-emerald', delay: 0 },
        { label: 'GPA Node', value: gpa, icon: Award, color: 'text-brand-primary', delay: 0.05 },
        { label: 'Academic Sectors', value: `0${results.length || 0}`, icon: BookOpen, color: 'text-brand-secondary', delay: 0.1 },
        { label: 'Current Signal', value: 'Active', icon: Globe, color: 'text-brand-accent', delay: 0.15 },
    ];

    return (
        <div className="space-y-12">
            <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                    <h1 className="text-4xl font-black text-white italic uppercase tracking-tighter leading-none mb-4 font-outfit text-shadow-glow">Student Terminal, <br/> {user?.firstName}</h1>
                    <p className="text-slate-500 font-medium text-lg leading-relaxed max-w-xl italic">Unified academic node access. Monitoring performance and schedules.</p>
                </div>
                <div className="bg-slate-800/20 border border-slate-800/50 p-6 rounded-[2rem] min-w-[220px] backdrop-blur-xl group hover:border-luxury-emerald/30 transition-all duration-700">
                    <p className="text-[10px] font-black uppercase tracking-[0.25em] text-slate-500 mb-2">Institutional Node</p>
                    <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-luxury-emerald animate-pulse"></div>
                        <span className="text-xl font-black uppercase text-white font-outfit truncate italic">{profile?.schoolId?.name || 'Sector-01 Admin'}</span>
                    </div>
                </div>
            </header>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                {stats.map((stat) => <StatCard key={stat.label} {...stat} />)}
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                <div className="xl:col-span-2 space-y-6">
                    <div className="flex items-center justify-between px-2">
                        <h3 className="text-xs font-black uppercase tracking-[0.3em] text-slate-500 font-outfit italic">Presence Archives (Recent)</h3>
                        <Link to="/student/attendance" className="text-[10px] font-black uppercase tracking-widest text-luxury-emerald flex items-center gap-2 group italic transition-all hover:tracking-[0.4em]">Full Discovery <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" /> </Link>
                    </div>

                    <div className="bg-[#0f0f12] border border-slate-800/60 rounded-[3.5rem] overflow-hidden shadow-2xl backdrop-blur-3xl group hover:border-luxury-emerald/20 transition-all duration-700">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-slate-900/40">
                                    {['Temporal Date', 'Verification Result', 'System Node'].map(h => (
                                        <th key={h} className="px-10 py-7 text-[10px] font-black uppercase tracking-[0.4em] text-slate-500 font-outfit italic">{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-800/30">
                                {attendance?.slice(0, 5).map((log) => (
                                    <tr key={log._id} className="hover:bg-white/[0.02] transition-colors group">
                                        <td className="px-10 py-6 text-sm font-black text-slate-300 italic font-outfit">
                                            {new Date(log.date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                                        </td>
                                        <td className="px-10 py-6">
                                            <span className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border font-outfit italic shadow-lg ${
                                                log.status === 'Present' 
                                                ? 'bg-luxury-emerald/10 text-luxury-emerald border-luxury-emerald/20' 
                                                : 'bg-luxury-rose/10 text-luxury-rose border-luxury-rose/20'
                                            }`}>
                                                {log.status === 'Present' ? 'Verified Node' : 'Absent Node'}
                                            </span>
                                        </td>
                                        <td className="px-10 py-6 text-[10px] font-black text-slate-500 tracking-[0.2em] uppercase italic">
                                            Pedagogical Archive
                                        </td>
                                    </tr>
                                ))}
                                {(!attendance || attendance.length === 0) && !loading && (
                                    <tr>
                                        <td colSpan="3" className="px-10 py-24 text-center">
                                            <Activity size={48} className="text-slate-800 mx-auto mb-6 opacity-20 animate-pulse" />
                                            <p className="text-slate-600 font-black uppercase tracking-[0.5em] text-[10px] italic font-outfit">No Presence Signals Detected</p>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                <div className="space-y-6">
                    <h3 className="text-xs font-black uppercase tracking-[0.3em] text-slate-500 font-outfit px-2 italic">Institutional Broadcasts</h3>
                    <div className="bg-[#0f0f12] border border-slate-800/60 p-8 rounded-[3.5rem] shadow-2xl h-full relative group hover:border-brand-primary/20 transition-all duration-700 overflow-hidden">
                        <div className="absolute top-0 right-0 w-48 h-48 bg-brand-primary/5 rounded-full blur-[80px] opacity-0 group-hover:opacity-100 transition-opacity duration-1000"></div>
                        <div className="space-y-6 relative z-10">
                            {[1, 2, 3].map(alert => (
                                <div key={alert} className="p-6 bg-slate-900/30 rounded-[2rem] border border-slate-800/40 hover:border-brand-primary/30 transition-all group/msg cursor-pointer backdrop-blur-3xl overflow-hidden relative">
                                    <div className="absolute top-0 left-0 w-1 h-full bg-brand-primary opacity-30"></div>
                                    <p className="text-[9px] font-black text-brand-primary uppercase tracking-[0.4em] mb-3 font-outfit italic">Institutional Alert</p>
                                    <p className="text-[12px] font-bold text-slate-100 mb-2 font-outfit leading-tight">Advanced academic parameters updated for Semester 02.</p>
                                    <div className="flex items-center justify-between mt-4">
                                        <p className="text-[9px] text-slate-500 font-black uppercase tracking-widest italic font-outfit">Admin Cluster</p>
                                        <Clock size={12} className="text-slate-600" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="bg-gradient-to-br from-[#0f0f12] to-luxury-emerald/5 p-10 rounded-[3.5rem] border border-slate-800/80 shadow-2xl relative group overflow-hidden">
                    <div className="absolute -top-10 -right-10 w-48 h-48 bg-luxury-emerald/10 rounded-full blur-[80px] opacity-0 group-hover:opacity-100 transition-opacity duration-1000"></div>
                    <h4 className="text-2xl font-black text-white italic tracking-tighter uppercase font-outfit mb-3">Academic Sector</h4>
                    <p className="text-slate-500 text-sm font-medium leading-relaxed mb-10 italic">Verifying node coordinates for <br/> Grade {profile?.classSection?.gradeLevel || '0'} - Section {profile?.classSection?.sectionLabel || 'A'}</p>
                    <Link to="/student/timetable" className="inline-flex items-center gap-4 py-4 px-10 bg-slate-800 hover:bg-slate-700 rounded-2xl text-[10px] font-black uppercase tracking-[0.3em] transition-all text-slate-300 shadow-xl active:scale-95 italic">Synchronize Schedule <Calendar size={16}/></Link>
                </div>

                <div className="bg-[#0f0f12] p-10 rounded-[3.5rem] border border-slate-800/80 shadow-2xl relative overflow-hidden group">
                    <div className="absolute -bottom-10 -right-10 w-48 h-48 bg-brand-primary/10 rounded-full blur-[80px] opacity-0 group-hover:opacity-100 transition-opacity duration-1000"></div>
                    <h4 className="text-2xl font-black text-white italic tracking-tighter uppercase font-outfit mb-3 text-shadow-glow">Next Submission</h4>
                    <p className="text-luxury-rose text-[10px] font-black uppercase tracking-[0.4em] mb-8 italic">Pedagogical Deadline Imminent</p>
                    <div className="p-6 bg-slate-900/40 rounded-2xl border border-slate-800/40 mb-10 backdrop-blur-xl">
                        <p className="text-slate-100 text-sm font-bold mb-1 font-outfit group-hover:text-brand-primary transition-colors italic">Advanced Physics: Lab-04 Analysis</p>
                        <p className="text-slate-500 text-[9px] font-black uppercase tracking-[0.3em] italic">Digital Repository Node</p>
                    </div>
                    <Link to="/student/assignments" className="text-[10px] font-black uppercase tracking-widest text-brand-primary flex items-center gap-3 italic hover:tracking-[0.3em] transition-all">Pedagogical Repository <ArrowRight size={16} /> </Link>
                </div>
            </div>
        </div>
    );
};

export default StudentDashboard;
