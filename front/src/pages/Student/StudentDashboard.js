import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { 
    fetchStudentProfile, 
    fetchStudentAttendance, 
    fetchStudentResults, 
    fetchStudentAssignments,
    fetchStudentTimetable,
    fetchStudentNotices,
    fetchStudentAnnouncements,
    fetchMySubmissions
} from '../../redux/slice/student.slice';
import { motion } from 'framer-motion';
import { Award, ClipboardList, Calendar, BookOpen, Clock, ArrowRight, Activity, Globe } from 'lucide-react';
import { Link } from 'react-router-dom';

const StatCard = ({ label, value, icon: Icon, color, delay }) => (
    <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay }}
        className="bg-[#0f0f12] border border-slate-800/60 p-8 rounded-md relative group hover:border-luxury-emerald/40 transition-all shadow-2xl"
    >
        <Icon size={24} className={`${color} mb-6 opacity-70 group-hover:opacity-100 transition-opacity`} />
        <p className="text-[10px] font-black uppercase tracking-[0.25em] text-slate-500 mb-2 font-outfit">{label}</p>
        <p className="text-4xl font-black text-white font-outfit tracking-tighter">{value}</p>
        <div className="absolute top-8 right-8 w-2 h-2 rounded-md bg-slate-800 group-hover:bg-luxury-emerald transition-colors"></div>
    </motion.div>
);

const StudentDashboard = () => {
    const dispatch = useDispatch();
    const { user } = useSelector((state) => state.auth);
    const { profile, attendance, results, assignments, submissions, notices, announcements, loading } = useSelector((state) => state.student);

    useEffect(() => {
        dispatch(fetchStudentProfile());
        dispatch(fetchStudentAttendance());
        dispatch(fetchStudentResults());
        dispatch(fetchStudentAssignments());
        dispatch(fetchStudentTimetable());
        dispatch(fetchStudentNotices());
        dispatch(fetchStudentAnnouncements());
        dispatch(fetchMySubmissions());
    }, [dispatch]);

    // Derived Stats
    const attPercent = attendance.length > 0 
        ? ((attendance.filter(a => a.status === 'Present').length / attendance.length) * 100).toFixed(0) 
        : '0';

    const gpa = results.length > 0
        ? ((results.reduce((s, r) => s + (r.marksObtained / (r.examId?.maxMarks || 100)), 0) / results.length) * 4.0).toFixed(1)
        : '0.0';

    const subjectsCount = profile?.classSection?.subjectAssignments?.length || 0;
    
    // Logic: Find the next pending assignment. If all done, show the most recent submitted one.
    const pendingAssignments = assignments?.filter(a => {
        const isSubmitted = submissions?.some(s => (s.assignmentId?._id || s.assignmentId) === a._id);
        return !isSubmitted && new Date(a.dueDate) > new Date();
    })?.sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));

    const nextAssignment = pendingAssignments?.length > 0 
        ? pendingAssignments[0] 
        : assignments?.sort((a, b) => new Date(b.dueDate) - new Date(a.dueDate))[0];

    const isSubmitted = submissions?.some(s => (s.assignmentId?._id || s.assignmentId) === nextAssignment?._id);

    const unifiedNotices = [...(notices || []), ...(announcements || [])]
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    const stats = [
        { label: 'Attendance', value: `${attPercent}%`, icon: ClipboardList, color: 'text-luxury-emerald', delay: 0 },
        { label: 'GPA', value: gpa, icon: Award, color: 'text-brand-primary', delay: 0.05 },
        { label: 'Subjects', value: subjectsCount < 10 ? `0${subjectsCount}` : subjectsCount, icon: BookOpen, color: 'text-brand-secondary', delay: 0.1 },
        { label: 'Enrollment Status', value: 'Active', icon: Globe, color: 'text-brand-accent', delay: 0.15 },
    ];

    return (
        <div className="space-y-12">
            <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div className="font-outfit">
                    <h1 className="text-4xl font-black text-white italic uppercase tracking-tighter leading-none mb-4 text-shadow-glow">Student Dashboard, <br/> {user?.firstName}</h1>
                    <p className="text-slate-500 font-medium text-lg leading-relaxed max-w-xl italic">Access your academic records, subject performance, and daily schedules.</p>
                </div>
                <div className="bg-slate-800/20 border border-slate-800/50 p-6 rounded-md min-w-[220px] backdrop-blur-xl group hover:border-luxury-emerald/30 transition-all duration-700">
                    <p className="text-[10px] font-black uppercase tracking-[0.25em] text-slate-500 mb-2">Institution</p>
                    <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-md bg-luxury-emerald animate-pulse"></div>
                        <span className="text-xl font-black uppercase text-white font-outfit truncate italic">{profile?.schoolId?.name || 'School Campus'}</span>
                    </div>
                </div>
            </header>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                {stats.map((stat) => <StatCard key={stat.label} {...stat} />)}
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                <div className="xl:col-span-2 space-y-6">
                    <div className="flex items-center justify-between px-2">
                        <h3 className="text-xs font-black uppercase tracking-[0.3em] text-slate-500 font-outfit italic">Recent Attendance</h3>
                        <Link to="/student/attendance" className="text-[10px] font-black uppercase tracking-widest text-luxury-emerald flex items-center gap-2 group italic transition-all hover:tracking-[0.4em]">View Full History <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" /> </Link>
                    </div>

                    <div className="bg-[#0f0f12] border border-slate-800/60 rounded-md overflow-hidden shadow-2xl backdrop-blur-3xl group hover:border-luxury-emerald/20 transition-all duration-700 font-outfit">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-slate-900/40">
                                    {['Date', 'Attendance Status', 'Source'].map(h => (
                                        <th key={h} className="px-10 py-7 text-[10px] font-black uppercase tracking-[0.4em] text-slate-500 font-outfit italic">{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-800/30">
                                {attendance?.slice(0, 5).map((log, idx) => (
                                    <tr key={idx} className="hover:bg-white/[0.02] transition-colors group">
                                        <td className="px-10 py-6 text-sm font-black text-slate-300 italic">
                                            {new Date(log.date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                                        </td>
                                        <td className="px-10 py-6">
                                            <span className={`px-4 py-2 rounded-md text-[10px] font-black uppercase tracking-widest border italic shadow-lg ${
                                                log.status === 'Present' 
                                                ? 'bg-luxury-emerald/10 text-luxury-emerald border-luxury-emerald/20' 
                                                : 'bg-luxury-rose/10 text-luxury-rose border-luxury-rose/20'
                                            }`}>
                                                {log.status === 'Present' ? 'Present' : 'Absent'}
                                            </span>
                                        </td>
                                        <td className="px-10 py-6 text-[10px] font-black text-slate-500 tracking-[0.2em] uppercase italic">
                                            School Attendance Registry
                                        </td>
                                    </tr>
                                ))}
                                {(!attendance || attendance.length === 0) && !loading && (
                                    <tr>
                                        <td colSpan="3" className="px-10 py-24 text-center">
                                            <Activity size={48} className="text-slate-800 mx-auto mb-6 opacity-20 animate-pulse" />
                                            <p className="text-slate-600 font-black uppercase tracking-[0.5em] text-[10px] italic">No Attendance Records Found</p>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                <div className="space-y-4">
                    <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 font-outfit px-2 italic">Institutional Feed</h3>
                    <div className="bg-[#0f0f12]/40 border border-slate-800/40 p-4 rounded-md shadow-2xl h-full relative group hover:border-brand-primary/20 transition-all duration-700 overflow-hidden font-outfit backdrop-blur-xl">
                        <div className="space-y-3 relative z-10">
                            {unifiedNotices?.slice(0, 4).map((note, idx) => (
                                <div key={idx} className="p-4 bg-slate-900/20 rounded-md border border-slate-800/20 hover:border-brand-primary/20 transition-all group/msg cursor-pointer overflow-hidden relative flex flex-col gap-2">
                                    <div className="absolute top-0 left-0 w-0.5 h-full bg-brand-primary opacity-0 group-hover:opacity-100 transition-all"></div>
                                    <div className="flex items-center justify-between">
                                        <span className={`px-2 py-0.5 rounded-md text-[8px] font-black uppercase tracking-widest border italic ${
                                            note.type === 'Notice' 
                                            ? 'bg-brand-primary/10 text-brand-primary border-brand-primary/20' 
                                            : 'bg-luxury-emerald/10 text-luxury-emerald border-luxury-emerald/20'
                                        }`}>
                                            {note.type || 'Notice'}
                                        </span>
                                        <div className="flex items-center gap-1.5 opacity-40 group-hover:opacity-100 transition-opacity">
                                            <Clock size={10} className="text-slate-500" />
                                            <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest">{new Date(note.createdAt).toLocaleDateString()}</span>
                                        </div>
                                    </div>
                                    <div>
                                        <p className="text-[11px] font-black text-slate-100 mb-0.5 uppercase tracking-wide group-hover:text-brand-primary transition-colors">{note.subject}</p>
                                        <p className="text-[10px] text-slate-500 line-clamp-1 italic font-medium leading-tight">{note.content}</p>
                                    </div>
                                    <div className="pt-2 border-t border-slate-800/30 flex items-center gap-2">
                                        <div className="w-1.5 h-1.5 rounded-md bg-slate-700"></div>
                                        <p className="text-[8px] text-slate-600 font-black uppercase tracking-[0.2em] italic truncate">
                                            {note.sender?.firstName} {note.sender?.lastName} • {note.sender?.role?.replace('_', ' ')}
                                        </p>
                                    </div>
                                </div>
                            ))}
                            {(!unifiedNotices || unifiedNotices.length === 0) && (
                                <div className="py-12 text-center">
                                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-700 italic">No Feed Data</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 font-outfit">
                <div className="bg-gradient-to-br from-[#0f0f12] to-luxury-emerald/5 p-10 rounded-md border border-slate-800/80 shadow-2xl relative group overflow-hidden">
                    <div className="absolute -top-10 -right-10 w-48 h-48 bg-luxury-emerald/10 rounded-md blur-[80px] opacity-0 group-hover:opacity-100 transition-opacity duration-1000"></div>
                    <h4 className="text-2xl font-black text-white italic tracking-tighter uppercase mb-3">Class Details</h4>
                    <p className="text-slate-500 text-sm font-medium leading-relaxed mb-10 italic">Official registration for <br/> Class {profile?.classSection?.standardId?.level || 'N/A'} - Section {profile?.classSection?.sectionLabel || 'A'}</p>
                    <Link to="/student/timetable" className="inline-flex items-center gap-4 py-4 px-10 bg-slate-800 hover:bg-slate-700 rounded-md text-[10px] font-black uppercase tracking-[0.3em] transition-all text-slate-300 shadow-xl active:scale-95 italic">View Timetable <Calendar size={16}/></Link>
                </div>

                <div className="bg-[#0f0f12] p-10 rounded-md border border-slate-800/80 shadow-2xl relative overflow-hidden group font-outfit">
                    <div className="absolute -bottom-10 -right-10 w-48 h-48 bg-brand-primary/10 rounded-md blur-[80px] opacity-0 group-hover:opacity-100 transition-opacity duration-1000"></div>
                    <h4 className="text-2xl font-black text-white italic tracking-tighter uppercase mb-3 text-shadow-glow">Next Submission</h4>
                    {nextAssignment ? (
                        <>
                            <p className={`${isSubmitted ? 'text-luxury-emerald' : 'text-luxury-rose'} text-[10px] font-black uppercase tracking-[0.4em] mb-8 italic`}>
                                {isSubmitted ? 'Assignment Finalized' : 'Submission Deadline Imminent'}
                            </p>
                            <div className="p-6 bg-slate-900/40 rounded-md border border-slate-800/40 mb-10 backdrop-blur-xl font-outfit">
                                <p className="text-slate-100 text-sm font-bold mb-1 group-hover:text-brand-primary transition-colors italic">{nextAssignment.title}</p>
                                <div className="flex items-center justify-between">
                                    <p className="text-slate-500 text-[9px] font-black uppercase tracking-[0.3em] italic">Due: {new Date(nextAssignment.dueDate).toLocaleDateString()}</p>
                                    {isSubmitted && (
                                        <span className="px-2 py-1 bg-luxury-emerald/10 text-luxury-emerald border border-luxury-emerald/20 rounded-sm text-[8px] font-black uppercase tracking-widest italic">Submitted</span>
                                    )}
                                </div>
                            </div>
                        </>
                    ) : (
                        <div className="mb-10 text-slate-500 text-[10px] font-black uppercase tracking-widest italic py-8 border border-dashed border-slate-800/50 rounded-md text-center">
                            No Pending Academic <br/> Submissions Detected
                        </div>
                    )}
                    <Link to="/student/assignments" className="text-[10px] font-black uppercase tracking-widest text-brand-primary flex items-center gap-3 italic hover:tracking-[0.3em] transition-all">Go to Assignments <ArrowRight size={16} /> </Link>
                </div>
            </div>
        </div>
    );
};

export default StudentDashboard;
