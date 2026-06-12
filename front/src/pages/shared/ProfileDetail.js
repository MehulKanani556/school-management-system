import React, { useEffect, useState, useMemo } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import axiosInstance from '../../utils/axiosInstance';
import { useDispatch, useSelector } from 'react-redux';
import { downloadReportCard } from '../../redux/slice/schoolAdmin.slice';
import { 
    Mail, Phone, Calendar, User, Shield, GraduationCap, Building2, 
    MessageCircle, UserCircle, MapPin, Briefcase, Award, ArrowLeft, 
    UserCheck, Activity, Globe, Clock, FileText, CheckCircle2,
    DollarSign, BookOpen, Layers, CheckCircle, XCircle, AlertCircle,
    BarChart3, CalendarDays, ExternalLink, ChevronRight, ChevronLeft, Zap, Users, Truck,
    LayoutGrid
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import moment from 'moment';
import { BASE_URL } from '../../utils/BASE_URL';
import { Wallet } from 'lucide-react';
import PortalModal from '../../components/PortalModal';

const ProfileDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const currentUser = useSelector(state => state.auth.user);
    const [loading, setLoading] = useState(true);
    const [profile, setProfile] = useState(null);
    const [error, setError] = useState(null);
    const [activeTab, setActiveTab] = useState('overview');
    const [currentMonth, setCurrentMonth] = useState(moment());
    const [selectedDate, setSelectedDate] = useState(null);

    // STATUS configuration for attendance cells
    const STATUS = {
        Present:  { icon: CheckCircle, color: 'text-emerald-400',  bg: 'bg-emerald-500/10',  border: 'border-emerald-500/20',  dot: 'bg-emerald-400',  sub: 'Stable Signal' },
        Absent:   { icon: XCircle,      color: 'text-rose-400',     bg: 'bg-rose-500/10',     border: 'border-rose-500/20',     dot: 'bg-rose-400',     sub: 'Signal Lost' },
        Late:     { icon: Clock,        color: 'text-amber-400',    bg: 'bg-amber-500/10',    border: 'border-amber-500/20',    dot: 'bg-amber-400',    sub: 'Sync Delayed' },
        'Half-Day':{ icon: Clock,       color: 'text-blue-400',     bg: 'bg-blue-500/10',     border: 'border-blue-500/20',     dot: 'bg-blue-400',     sub: 'Partial Session' },
        'No Record': { icon: Calendar,  color: 'text-slate-400',    bg: 'bg-slate-500/10',    border: 'border-slate-500/20',    dot: 'bg-slate-400',    sub: 'Awaiting Telemetry' },
    };

    const calendarGrid = useMemo(() => {
        const startOfMonth = currentMonth.clone().startOf('month');
        const endOfMonth = currentMonth.clone().endOf('month');
        const startDay = startOfMonth.day();
        const daysInMonth = currentMonth.daysInMonth();

        const grid = [];
        let day = 1;
        for (let i = 0; i < 6; i++) {
            const week = [];
            for (let j = 0; j < 7; j++) {
                if (i === 0 && j < startDay) {
                    week.push(startOfMonth.clone().subtract(startDay - j, 'days'));
                } else if (day <= daysInMonth) {
                    week.push(startOfMonth.clone().date(day));
                    day++;
                } else {
                    week.push(endOfMonth.clone().add(day - daysInMonth, 'days'));
                    day++;
                }
            }
            grid.push(week);
        }
        return grid;
    }, [currentMonth]);

    const getRecord = (date) =>
        date && profile?.data?.attendance
            ? profile.data.attendance.find(a => moment(a.date).isSame(date, 'day'))
            : null;

    useEffect(() => {
        fetchProfile();
    }, [id]);

    const fetchProfile = async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await axiosInstance.get(`/users/${id}/profile`);
            console.log("Profile Sync Result:", response.data);
            if (response.data.success) {
                setProfile(response.data);
            } else {
                setError(response.data.message || 'Search failed.');
            }
        } catch (err) {
            console.error("Profile loading error:", err);
            setError(err.response?.data?.message || 'Failed to load profile.');
        } finally {
            setLoading(false);
        }
    };

    const hasPermission = (profileRole) => {
        const viewerRole = currentUser?.role;
        
        // Super Admin & School Admin or self see everything
        if (viewerRole === 'School_Admin' || viewerRole === 'Super_Admin' || currentUser?._id === id) return 'full';
        
        // Accountant & Transport Manager get full access to Student & Teacher profiles
        if (viewerRole === 'Accountant' && (profileRole === 'Student' || profileRole === 'Teacher')) return 'full';
        if (viewerRole === 'Transport_Manager' && profileRole === 'Student') return 'full';

        // Role-based limited views
        if (viewerRole === 'Student' && profileRole === 'Teacher') return 'limited';
        if (viewerRole === 'Teacher' && (profileRole === 'Student' || profileRole === 'School_Admin')) return 'limited';
        if (viewerRole === 'Parent' && (profileRole === 'Teacher' || profileRole === 'Student')) return 'limited';
        
        return 'basic';
    };

    const getMessageRoute = (role) => {
        switch (role) {
            case 'School_Admin': return '/school-admin/communication';
            case 'Teacher': return '/teacher/messages';
            case 'Student': return '/student/messages';
            case 'Parent': return '/parent/messages';
            case 'Accountant': return '/accountant/messages';
            case 'Librarian': return '/librarian/messages';
            case 'Transport_Manager': return '/transporter/messages';
            case 'Super_Admin': return '/superadmin/messages';
            default: return '/';
        }
    };

    const handleMessageContact = () => {
        const route = getMessageRoute(currentUser.role);
        // We pass the partner ID in the state so the messages page can pre-select it
        navigate(route, { state: { directChat: id } });
    };

    const DetailSection = ({ icon: Icon, title, children, badge }) => (
        <div className="bg-slate-900/30 border border-slate-800/60 rounded-2xl overflow-hidden shadow-2xl backdrop-blur-3xl relative group">
            {/* Tech corners */}
            <div className="absolute top-0 left-0 w-4 h-4 border-t border-l border-brand-primary/20 group-hover:border-brand-primary/40 transition-colors"></div>
            <div className="absolute top-0 right-0 w-4 h-4 border-t border-r border-brand-primary/20 group-hover:border-brand-primary/40 transition-colors"></div>
            <div className="absolute bottom-0 left-0 w-4 h-4 border-b border-l border-brand-primary/20 group-hover:border-brand-primary/40 transition-colors"></div>
            <div className="absolute bottom-0 right-0 w-4 h-4 border-b border-r border-brand-primary/20 group-hover:border-brand-primary/40 transition-colors"></div>

            <div className="px-8 py-5 border-b border-slate-800/60 flex items-center justify-between bg-slate-950/20">
                <div className="flex items-center gap-4">
                    <div className="p-2.5 rounded-lg bg-brand-primary/10 text-brand-primary border border-brand-primary/20 shadow-inner">
                        <Icon size={18} />
                    </div>
                    <h4 className="text-[11px] font-black uppercase text-white tracking-widest italic">{title}</h4>
                </div>
                {badge && <span className="px-3 py-1 rounded-full bg-slate-950/60 text-[9px] font-black text-slate-400 uppercase tracking-widest border border-slate-800/60">{badge}</span>}
            </div>
            <div className="p-8">
                {children}
            </div>
        </div>
    );

    const ProfileField = ({ icon: Icon, label, value, color = "text-slate-200", isHidden = false }) => {
        if (isHidden) return null;
        return (
            <div className="flex items-start gap-5 group p-2 hover:bg-slate-900/20 hover:border-slate-800/20 border border-transparent rounded-xl transition-all min-w-0 w-full">
                <div className="p-3 rounded-xl bg-slate-950/40 text-brand-primary shadow-xl border border-slate-800/60 group-hover:border-brand-primary/20 group-hover:bg-slate-900/40 transition-all flex-shrink-0">
                    <Icon size={18} />
                </div>
                <div className="min-w-0 flex-1">
                    <p className="text-[9px] font-black text-slate-600 uppercase tracking-[0.2em] mb-1 leading-none text-left">{label}</p>
                    <p className={`text-sm font-bold tracking-tight break-words text-left ${color}`}>{value || '---'}</p>
                </div>
            </div>
        );
    };

    const renderRolesSpecifics = (role, data, access, isFull, isSchoolAdmin) => {
        const isLimited = access === 'limited' || access === 'basic';

        if (role === 'Student') {
            return (
                <div className="space-y-12">
                    {/* Academic Details */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        <ProfileField icon={GraduationCap} label="Grade" value={data.standard ? `Grade ${data.standard.level || ''} ${data.standard.name || ''}`.trim() : 'Not Assigned'} color="text-brand-primary" />
                        <ProfileField icon={Building2} label="Section" value={data.classSection?.sectionLabel || 'Not Assigned'} />
                        <ProfileField icon={Shield} label="Admission No." value={data.admissionNumber || 'Not Generated'} color="text-emerald-400 font-mono" isHidden={isLimited} />
                        <ProfileField icon={UserCircle} label="Guardian Name" value={data.guardianName} isHidden={isLimited} />
                        <ProfileField icon={Phone} label="Guardian Phone" value={data.guardianContact || data.guardianPhone} isHidden={isLimited} />
                        <ProfileField icon={Award} label="Scholarship" value={`${data.scholarshipPercentage ?? 0}% waiver`} isHidden={isLimited} color="text-amber-400" />
                    </div>

                    {isFull && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                            {[
                                { label: 'Attendance', value: `${data.attendance?.length > 0 ? Math.round((data.attendance.filter(a => a.status === 'Present').length / data.attendance.length) * 100) : 0}%`, icon: Clock, color: 'text-emerald-400' },
                                { label: 'Performance', value: `${data.results?.length > 0 ? Math.round(data.results.reduce((acc, r) => acc + (r.marksObtained / (r.examId?.maxMarks || 100)), 0) / data.results.length * 100) : 0}%`, icon: Award, color: 'text-indigo-400' },
                                { label: 'Pending Tasks', value: data.assignments?.filter(a => !a.isSubmitted)?.length ?? 0, icon: AlertCircle, color: 'text-amber-400' },
                                { label: 'Leave Ratio', value: `${data.leaves?.length || 0}`, icon: CalendarDays, color: 'text-brand-primary' },
                            ].map((s, i) => (
                                <div key={i} className="bg-slate-950/40 border border-white/5 p-6 rounded-2xl group hover:border-brand-primary/20 transition-all">
                                    <div className={`w-10 h-10 rounded-xl bg-slate-900 flex items-center justify-center ${s.color} mb-4 group-hover:scale-110 transition-transform`}>
                                        <s.icon size={18} />
                                    </div>
                                    <p className="text-[10px] font-black uppercase text-slate-500 tracking-widest mb-1 italic">{s.label}</p>
                                    <p className="text-2xl font-black text-white font-outfit">{s.value}</p>
                                </div>
                            ))}
                        </div>
                    )}

                    {isFull && (
                        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                            <DetailSection icon={BarChart3} title="Academic Performance" badge="Recent Marks">
                                {data.results?.length > 0 ? (
                                    <div className="space-y-4">
                                        {data.results.map((res, i) => (
                                            <div key={i} className="flex items-center justify-between p-4 rounded-xl bg-slate-950/40 border border-white/5 hover:bg-slate-950/60 transition-all group">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-10 h-10 rounded-lg bg-slate-900 border border-white/5 flex items-center justify-center text-slate-500 group-hover:text-brand-primary transition-colors">
                                                        <FileText size={18} />
                                                    </div>
                                                    <div>
                                                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{res.examId?.name}</p>
                                                        <p className="text-xs font-bold text-white uppercase italic">{res.examId?.subject?.name || 'Subject'}</p>
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <p className="text-lg font-black text-brand-primary leading-none mb-1">{res.marksObtained}/{res.examId?.maxMarks || 100}</p>
                                                    <p className="text-[9px] font-bold text-slate-600 uppercase tracking-widest">{Math.round((res.marksObtained/(res.examId?.maxMarks || 100))*100)}% Score</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="py-10 text-center opacity-40 italic">No marks found.</div>
                                )}
                            </DetailSection>

                            <DetailSection icon={CalendarDays} title="Attendance Records" badge="Daily Records">
                                {data.attendance?.length > 0 ? (
                                    <div className="grid grid-cols-5 gap-3">
                                        {data.attendance.map((att, i) => (
                                            <div key={i} className={`p-3 rounded-lg border flex flex-col items-center gap-1 transition-all ${att.status === 'Present' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-red-500/10 border-red-500/20 text-red-400'}`}>
                                                <p className="text-[9px] font-black uppercase opacity-60 font-mono">{moment(att.date).format('DD MMM')}</p>
                                                {att.status === 'Present' ? <CheckCircle size={12} /> : <XCircle size={12} />}
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="py-10 text-center opacity-40 italic">No attendance records found.</div>
                                )}
                            </DetailSection>

                            <DetailSection icon={AlertCircle} title="Leave Requests" badge="Requests">
                                {data.leaves?.length > 0 ? (
                                    <div className="space-y-4">
                                        {data.leaves.map((leave, i) => (
                                            <div key={i} className="flex items-start justify-between p-4 rounded-xl bg-slate-950/40 border border-white/5">
                                                <div className="space-y-1">
                                                    <p className="text-[9px] font-black text-white uppercase tracking-widest">{leave.leaveType} // {moment(leave.startDate).format('DD MMM')} - {moment(leave.endDate).format('DD MMM')}</p>
                                                    <p className="text-xs text-slate-500 italic max-w-sm">{leave.reason}</p>
                                                </div>
                                                <span className={`text-[8px] font-black uppercase px-2 py-1 rounded border ${leave.status === 'Approved' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-amber-500/10 border-amber-500/20 text-amber-400'}`}>
                                                    {leave.status}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="py-10 text-center opacity-40 italic">No leaves requested.</div>
                                )}
                            </DetailSection>

                            <DetailSection icon={Layers} title="Assigned Work" badge="Active Assignments">
                                {data.assignments?.length > 0 ? (
                                    <div className="space-y-4">
                                        {data.assignments.map((asm, i) => (
                                            <div key={i} className="p-4 rounded-xl bg-slate-950/40 border border-white/5 flex items-center justify-between group cursor-pointer hover:border-brand-primary/30 transition-all">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-10 h-10 rounded-lg bg-slate-900 border border-white/5 flex items-center justify-center text-slate-600 group-hover:text-amber-400">
                                                        <BookOpen size={18} />
                                                    </div>
                                                    <div>
                                                        <p className="text-xs font-bold text-white uppercase tracking-tight">{asm.title}</p>
                                                        <p className="text-[9px] font-black text-slate-600 uppercase tracking-widest italic">Target: {moment(asm.dueDate).format('DD MMM YYYY')}</p>
                                                    </div>
                                                </div>
                                                <ChevronRight size={14} className="text-slate-800 group-hover:text-white transition-colors" />
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="py-10 text-center opacity-40 italic">All assignments completed.</div>
                                )}
                            </DetailSection>
                        </div>
                    )}
                </div>
            );
        }

        if (role === 'Teacher') {
            return (
                <div className="space-y-12">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        <ProfileField icon={Briefcase} label="Employee ID" value={data.employeeId} color="text-blue-400 font-mono" isHidden={isLimited} />
                        <ProfileField icon={GraduationCap} label="Qualifications" value={data.qualification || 'Verified Educator'} />
                        <ProfileField icon={Mail} label="Email Address" value={data.email} />
                        <ProfileField icon={Calendar} label="Joining Date" value={data.joiningDate ? moment(data.joiningDate).format('DD MMM YYYY') : 'N/A'} isHidden={isLimited} />
                        <ProfileField icon={DollarSign} label="Base Salary" value={`₹${(data.baseSalary || 0).toLocaleString()}`} color="text-emerald-400" isHidden={isLimited} />
                        <ProfileField icon={Activity} label="Status" value={data.isActive ? "Active" : "Deactivated"} color={data.isActive ? "text-emerald-400" : "text-red-400"} isHidden={isLimited} />
                    </div>

                    {isFull && (
                        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                            <DetailSection icon={DollarSign} title="Payroll History" badge="Payroll">
                                {data.salary?.length > 0 ? (
                                    <div className="space-y-4">
                                        {data.salary.map((py, i) => (
                                            <div key={i} className="flex items-center justify-between p-4 rounded-xl bg-slate-950/40 border border-white/5 hover:bg-slate-950/60 transition-all">
                                                <div className="flex items-center gap-4">
                                                    <div className="p-3 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                                                        <DollarSign size={16} />
                                                    </div>
                                                    <div>
                                                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{moment(py.paidAt).format('MMMM YYYY')}</p>
                                                        <p className="text-sm font-bold text-white uppercase italic">ID: {py._id.toString().slice(-6)}</p>
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <p className="text-lg font-black text-emerald-400 leading-none mb-1">₹{py.netSalary.toLocaleString()}</p>
                                                    <p className="text-[9px] font-bold text-slate-600 uppercase tracking-widest">{py.status}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="py-10 text-center opacity-40 italic">No payroll records found.</div>
                                )}
                            </DetailSection>

                            <DetailSection icon={Zap} title="Assigned Classes" badge="Assigned Classes">
                                {data.classes?.length > 0 ? (
                                    <div className="grid grid-cols-2 gap-4">
                                        {data.classes.map((cls, i) => (
                                            <div key={i} className="p-5 rounded-xl bg-slate-950/50 border border-brand-primary/20 flex flex-col items-center gap-3 group hover:bg-brand-primary/10 transition-all">
                                                <div className="w-12 h-12 rounded-xl bg-slate-900 border border-white/5 flex items-center justify-center text-brand-primary">
                                                    <Building2 size={24} />
                                                </div>
                                                <div className="text-center">
                                                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Section</p>
                                                    <p className="text-sm font-black text-white uppercase italic">{cls.standardId?.level || ''}-{cls.sectionLabel}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="py-10 text-center opacity-40 italic">No classes assigned.</div>
                                )}
                            </DetailSection>

                            <DetailSection icon={Clock} title="Timetable" badge="Weekly Timetable">
                                {data.timetable?.length > 0 ? (
                                    <div className="space-y-4">
                                        {data.timetable.slice(0, 5).map((tt, i) => (
                                            <div key={i} className="flex items-center justify-between p-4 rounded-xl bg-slate-950/40 border border-white/5">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-10 h-10 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center">
                                                        <Clock size={16} />
                                                    </div>
                                                    <div>
                                                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{tt.day}</p>
                                                        <p className="text-xs font-bold text-white uppercase italic">{tt.courseId?.name} // {tt.classId?.sectionLabel}</p>
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest leading-none mb-1">{tt.startTime} - {tt.endTime}</p>
                                                </div>
                                            </div>
                                        ))}
                                        <button className="w-full py-3 text-[9px] font-black uppercase text-slate-500 hover:text-white transition-all tracking-[0.3em] italic border-t border-white/5 mt-4">View Full Timetable</button>
                                    </div>
                                ) : (
                                    <div className="py-10 text-center opacity-40 italic">No timetable schedules found.</div>
                                )}
                            </DetailSection>
                        </div>
                    )}
                </div>
            );
        }

        if (role === 'Parent') {
            return (
                <div className="mt-8 space-y-8">
                    <h4 className="text-[11px] font-black text-slate-500 uppercase tracking-[0.4em] px-2 italic flex items-center gap-3">
                        <Users size={16} /> Children
                    </h4>
                    {data.children?.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {data.children.map(child => (
                                <div key={child._id} 
                                    onClick={() => navigate(`/profile/${child._id}`)}
                                    className="flex items-center gap-6 p-5 rounded-2xl bg-slate-950/60 border border-emerald-500/10 hover:border-emerald-500/40 transition-all cursor-pointer group shadow-2xl backdrop-blur-3xl"
                                >
                                    <div className="w-16 h-16 rounded-xl overflow-hidden border-2 border-white/5 group-hover:border-emerald-500/30 transition-all shadow-inner">
                                        <img 
                                            src={child.photo ? (child.photo.startsWith('http') ? child.photo : `${BASE_URL.replace('/api', '')}/${child.photo}`) : `https://ui-avatars.com/api/?name=${child.firstName}+${child.lastName}&background=34D399&color=fff&size=100`} 
                                            className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all" 
                                            alt="" 
                                        />
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-base font-black text-white italic group-hover:text-emerald-400 transition-colors uppercase font-outfit leading-none mb-2">{child.firstName} {child.lastName}</p>
                                        <div className="flex items-center gap-3">
                                            <span className="text-[9px] font-black text-slate-600 font-mono tracking-tighter uppercase border border-white/5 px-2 py-0.5 rounded">ID: {child.admissionNumber}</span>
                                            <span className="text-[9px] font-black text-slate-600 font-mono tracking-tighter uppercase border border-white/5 px-2 py-0.5 rounded">ROLL: {child.rollNumber}</span>
                                        </div>
                                    </div>
                                    <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 opacity-40 group-hover:opacity-100 transition-all">
                                        <ChevronRight size={18} />
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="p-16 rounded-2xl bg-slate-900/40 text-center border border-dashed border-slate-800">
                            <p className="text-sm text-slate-600 italic font-medium tracking-wide">No children registered under this account.</p>
                        </div>
                    )}
                </div>
            );
        }

        if (['Accountant', 'Librarian', 'Transport_Manager', 'Transporter'].includes(role)) {
            const getIcon = () => {
                if (role === 'Accountant') return Wallet;
                if (role === 'Librarian') return BookOpen;
                if (role === 'Transporter') return Truck;
                return Shield;
            };
            const SectorIcon = getIcon();

            return (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-6">
                        <ProfileField icon={SectorIcon} label="Department" value={role} color="text-brand-primary" />
                        <ProfileField icon={Mail} label="Email Address" value={data.email} />
                        <ProfileField icon={Calendar} label="Joining Date" value={new Date(data.createdAt).toLocaleDateString()} />
                        <ProfileField icon={Shield} label="Status" value={data.status || 'Active'} color="text-emerald-400" />
                    </div>
                    <div className="space-y-6">
                        <div className="bg-slate-950/40 border border-white/5 p-6 rounded-2xl">
                            <h5 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-4 italic">Department Statistics</h5>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="p-4 bg-slate-900/60 rounded-xl border border-brand-primary/10">
                                    <p className="text-[9px] font-black text-slate-600 uppercase mb-1">Status</p>
                                    <p className="text-sm font-black text-white italic">ACTIVE</p>
                                </div>
                                <div className="p-4 bg-slate-900/60 rounded-xl border border-white/5">
                                    <p className="text-[9px] font-black text-slate-600 uppercase mb-1">Access Level</p>
                                    <p className="text-sm font-black text-white italic">Level 4</p>
                                </div>
                            </div>
                        </div>
                        {isSchoolAdmin && role === 'Accountant' && (
                            <button className="w-full py-4 bg-brand-primary text-black rounded-xl text-[10px] font-black uppercase tracking-widest hover:rotate-1 transition-all flex items-center justify-center gap-3">
                                <Wallet size={16} /> View Financial Records
                            </button>
                        )}
                        {isSchoolAdmin && role === 'Librarian' && (
                            <button className="w-full py-4 bg-indigo-500 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:rotate-1 transition-all flex items-center justify-center gap-3">
                                <BookOpen size={16} /> View Library Books
                            </button>
                        )}
                    </div>
                </div>
            );
        }

        return (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <ProfileField icon={Shield} label="Role" value={role} color="text-amber-400" />
                <ProfileField icon={Mail} label="Email Address" value={data.email} />
                <ProfileField icon={Activity} label="Status" value="Active" color="text-emerald-400" />
                <ProfileField icon={Globe} label="Registered School" value={data.schoolId?.name || 'Central System'} />
            </div>
        );
    };

    if (loading) return (
        <div className="min-h-[80vh] flex flex-col items-center justify-center space-y-8">
            <div className="relative">
                <div className="w-24 h-24 border-[6px] border-brand-primary/10 border-t-brand-primary rounded-full animate-spin" />
                <div className="absolute inset-0 flex items-center justify-center">
                    <Zap size={32} className="text-brand-primary animate-pulse" />
                </div>
            </div>
            <div className="text-center space-y-2">
                <p className="text-[14px] font-black text-white uppercase tracking-[0.5em] animate-pulse font-outfit">Loading Profile</p>
                <p className="text-[10px] text-slate-600 font-mono uppercase tracking-widest italic opacity-50">User ID: {id.slice(-12)}</p>
            </div>
        </div>
    );

    if (error) return (
        <div className="min-h-[70vh] flex flex-col items-center justify-center p-12 text-center max-w-2xl mx-auto">
            <div className="w-24 h-24 rounded-3xl bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-500 mb-10 shadow-3xl animate-bounce">
                <Shield size={48} />
            </div>
            <h2 className="text-3xl font-black uppercase text-white tracking-tighter mb-6 italic font-outfit">Access Restricted</h2>
            <div className="p-6 rounded-xl bg-slate-900/60 border border-red-500/20 mb-10">
                <p className="text-slate-400 text-sm font-medium leading-relaxed italic">"{error}"</p>
            </div>
            <button 
                onClick={() => navigate(-1)}
                className="group flex items-center gap-4 px-10 py-5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl font-black text-[12px] uppercase tracking-[0.3em] transition-all border border-slate-700 shadow-2xl active:scale-95"
            >
                <ArrowLeft size={18} className="group-hover:-translate-x-2 transition-transform" />
                Go Back
            </button>
        </div>
    );

    const access = hasPermission(profile.role);
    const isOwner = currentUser?._id === id;
    const isFull = access === 'full';
    const isSchoolAdmin = currentUser?.role === 'School_Admin';

    const data = profile.data;
    const role = profile.role;
    
    // Determine current role prefix from URL path
    const pathParts = window.location.pathname.split('/');
    const rolePrefix = pathParts[1] || 'superadmin';

    // Derived Stats for the Hero Grid
    const getStats = () => {
        if (role === 'Student') {
            return [
                { label: 'Attendance', value: `${data.attendance?.length > 0 ? Math.round((data.attendance.filter(a => a.status === 'Present').length / data.attendance.length) * 100) : 0}%`, icon: Clock, color: 'text-emerald-400', bg: 'bg-emerald-400/10' },
                { label: 'Average Score', value: `${data.results?.length > 0 ? Math.round(data.results.reduce((acc, r) => acc + (r.marksObtained / (r.examId?.maxMarks || 100)), 0) / data.results.length * 100) : 0}%`, icon: Award, color: 'text-indigo-400', bg: 'bg-indigo-400/10' },
                { label: 'Payment Status', value: data.fees?.every(f => f.status === 'paid') ? 'Cleared' : 'Pending', icon: DollarSign, color: data.fees?.every(f => f.status === 'paid') ? 'text-emerald-400' : 'text-amber-400', bg: 'bg-slate-900/60' },
                { label: 'Attendance Rate', value: `${data.attendance?.filter(a => a.status === 'Present').length || 0} / ${data.attendance?.length || 0}`, icon: BarChart3, color: 'text-purple-400', bg: 'bg-slate-900/60' },
            ];
        }
        if (role === 'Teacher') {
            return [
                { label: 'Base Salary', value: `₹${(data.baseSalary || 0).toLocaleString()}`, icon: DollarSign, color: 'text-emerald-400', bg: 'bg-emerald-400/10' },
                { label: 'Class Load', value: `${data.classes?.length || 0} Classes`, icon: LayoutGrid, color: 'text-indigo-400', bg: 'bg-indigo-400/10' },
                { label: 'Attendance', value: `${data.attendance?.length > 0 ? Math.round((data.attendance.filter(a => a.status === 'Present').length / data.attendance.length) * 100) : 0}%`, icon: Clock, color: 'text-purple-400', bg: 'bg-slate-900/60' },
                { label: 'Account Status', value: data.isActive ? 'Active' : 'Suspended', icon: Zap, color: data.isActive ? 'text-emerald-400' : 'text-red-400', bg: 'bg-slate-900/60' },
            ];
        }
        if (role === 'Parent') {
            return [
                { label: 'Children', value: data.children?.length === 1 ? '1 Child' : `${data.children?.length || 0} Children`, icon: Users, color: 'text-emerald-400', bg: 'bg-emerald-400/10' },
                { label: 'Portal Access', value: 'Parent Portal', icon: Shield, color: 'text-indigo-400', bg: 'bg-indigo-400/10' },
                { label: 'Registered School', value: data.schoolId?.name || 'Central System', icon: Globe, color: 'text-purple-400', bg: 'bg-slate-900/60' },
                { label: 'Status', value: data.isActive ? 'Active' : 'Offline', icon: Activity, color: 'text-amber-400', bg: 'bg-slate-900/60' },
            ];
        }
        if (['Accountant', 'Librarian', 'Transport_Manager', 'Driver'].includes(role)) {
            const extraLabel = role === 'Driver' ? 'Performance Rating' : 'Base Salary';
            const extraVal = role === 'Driver' ? `${data.driverInfo?.performanceRating || 5} Stars` : `₹${(data.baseSalary || 0).toLocaleString()}`;
            return [
                { label: extraLabel, value: extraVal, icon: role === 'Driver' ? Award : DollarSign, color: 'text-emerald-400', bg: 'bg-emerald-400/10' },
                { label: 'Department', value: role?.replace('_', ' '), icon: Shield, color: 'text-indigo-400', bg: 'bg-indigo-400/10' },
                { label: 'Registered School', value: data.schoolId?.name || 'Central System', icon: Globe, color: 'text-purple-400', bg: 'bg-slate-900/60' },
                { label: 'Status', value: data.isActive ? 'Active' : 'Suspended', icon: Activity, color: 'text-amber-400', bg: 'bg-slate-900/60' },
            ];
        }
        return [
            { label: 'Access Level', value: role === 'Super_Admin' ? 'Full Access' : 'School Access', icon: Shield, color: 'text-emerald-400', bg: 'bg-emerald-400/10' },
            { label: 'Account Level', value: role === 'Super_Admin' ? 'Super Admin' : 'School Admin', icon: Zap, color: 'text-indigo-400', bg: 'bg-indigo-400/10' },
            { label: 'Registered School', value: role === 'Super_Admin' ? 'Central System' : (data.schoolId?.name || 'Central System'), icon: Globe, color: 'text-purple-400', bg: 'bg-slate-900/60' },
            { label: 'Status', value: data.isActive ? 'Active' : 'Deactivated', icon: Activity, color: 'text-amber-400', bg: 'bg-slate-900/60' },
        ];
    };

    const stats = getStats();

    const getTabs = () => {
        const base = [{ id: 'overview', label: 'Overview', icon: User }];
        if (role === 'Student') {
            return [
                ...base,
                { id: 'academic', label: 'Grades', icon: Award },
                { id: 'attendance', label: 'Attendance', icon: Clock },
                { id: 'financial', label: 'Fees', icon: DollarSign },
            ];
        }
        if (role === 'Teacher') {
            return [
                ...base,
                { id: 'professional', label: 'Classes', icon: Briefcase },
                { id: 'attendance', label: 'Attendance', icon: Clock },
                { id: 'financial', label: 'Payroll', icon: DollarSign },
            ];
        }
        if (['Accountant', 'Librarian', 'Transport_Manager', 'Driver'].includes(role)) {
            return [
                ...base,
                { id: 'attendance', label: 'Attendance', icon: Clock },
                { id: 'financial', label: 'Payroll', icon: DollarSign },
            ];
        }
        return base;
    };

    const tabs = getTabs();

    const getRoleCodeLabel = () => {
        if (role === 'Student') return `Admission No: ${data.admissionNumber || 'Not Generated'}`;
        if (role === 'Teacher') return `Employee ID: ${data.employeeId || 'Pending'}`;
        if (role === 'Parent') return `Parent ID: ${data._id || 'Pending'}`;
        if (role === 'Driver') return `License: ${data.driverInfo?.licenseNumber || 'Pending'}`;
        return `ID: ${data.employeeId || data._id?.slice(-8).toUpperCase()}`;
    };

    const renderHeroFields = () => {
        if (role === 'Student') {
            return (
                <>
                    <ProfileField icon={GraduationCap} label="Grade & Section" value={data.standard ? `Grade ${data.standard.level || 'N/A'}-${data.classSection?.sectionLabel || 'N/A'}` : 'Not Assigned'} />
                    <ProfileField icon={Calendar} label="Date of Birth" value={data.dateOfBirth ? moment(data.dateOfBirth).format('DD MMM YYYY') : 'N/A'} />
                    <ProfileField icon={Phone} label="Guardian Phone" value={data.guardianContact || data.guardianPhone || 'N/A'} />
                    <div className="md:col-span-2">
                        <ProfileField icon={Mail} label="Email Address" value={data.email || 'No email provided'} />
                    </div>
                    <div className="md:col-span-2">
                        <ProfileField icon={MapPin} label="Address" value={data.address || 'No address registered'} />
                    </div>
                </>
            );
        }
        if (role === 'Teacher') {
            return (
                <>
                    <ProfileField icon={GraduationCap} label="Qualifications" value={data.qualifications?.join(', ') || data.qualification || 'Verified Educator'} />
                    <ProfileField icon={Calendar} label="Joining Date" value={data.joiningDate ? moment(data.joiningDate).format('DD MMM YYYY') : 'N/A'} />
                    <ProfileField icon={Phone} label="Phone Number" value={data.phoneNumber || data.phone || 'N/A'} />
                    <div className="md:col-span-2">
                        <ProfileField icon={Mail} label="Email Address" value={data.email || 'No email provided'} />
                    </div>
                    <div className="md:col-span-2">
                        <ProfileField icon={MapPin} label="Address" value={data.address || 'No address registered'} />
                    </div>
                </>
            );
        }
        if (role === 'Parent') {
            return (
                <>
                    <ProfileField icon={Users} label="Children" value={data.children?.length === 1 ? '1 Child Connected' : `${data.children?.length || 0} Children Connected`} />
                    <ProfileField icon={Calendar} label="Registration Date" value={data.createdAt ? moment(data.createdAt).format('DD MMM YYYY') : 'N/A'} />
                    <ProfileField icon={Phone} label="Phone Number" value={data.phoneNumber || 'N/A'} />
                    <div className="md:col-span-2">
                        <ProfileField icon={Mail} label="Email Address" value={data.email || 'No email provided'} />
                    </div>
                    <div className="md:col-span-2">
                        <ProfileField icon={MapPin} label="Address" value={data.address || 'Address Not Provided'} />
                    </div>
                </>
            );
        }
        if (role === 'Driver') {
            return (
                <>
                    <ProfileField icon={Shield} label="License Number" value={data.driverInfo?.licenseNumber ? `Active Number: ${data.driverInfo.licenseNumber}` : 'N/A'} />
                    <ProfileField icon={Calendar} label="License Expiry" value={data.driverInfo?.licenseExpiry ? moment(data.driverInfo.licenseExpiry).format('DD MMM YYYY') : 'N/A'} />
                    <ProfileField icon={Phone} label="Phone Number" value={data.phoneNumber || data.phone || 'N/A'} />
                    <div className="md:col-span-2">
                        <ProfileField icon={Mail} label="Email Address" value={data.email || 'No email provided'} />
                    </div>
                    <div className="md:col-span-2">
                        <ProfileField icon={MapPin} label="Address" value={data.address || 'No address registered'} />
                    </div>
                </>
            );
        }
        if (['Accountant', 'Librarian', 'Transport_Manager'].includes(role)) {
            return (
                <>
                    <ProfileField icon={Briefcase} label="Department" value={role?.replace('_', ' ')} />
                    <ProfileField icon={Calendar} label="Joining Date" value={data.createdAt ? moment(data.createdAt).format('DD MMM YYYY') : 'N/A'} />
                    <ProfileField icon={Phone} label="Phone Number" value={data.phoneNumber || 'N/A'} />
                    <div className="md:col-span-2">
                        <ProfileField icon={Mail} label="Email Address" value={data.email || 'No email provided'} />
                    </div>
                    <div className="md:col-span-2">
                        <ProfileField icon={MapPin} label="Address" value={data.address || 'No address registered'} />
                    </div>
                </>
            );
        }
        return (
            <>
                <ProfileField icon={Shield} label="Role" value={role?.replace('_', ' ')} />
                <ProfileField icon={Calendar} label="Registration Date" value={data.createdAt ? moment(data.createdAt).format('DD MMM YYYY') : 'N/A'} />
                <ProfileField icon={Phone} label="Phone Number" value={data.phoneNumber || 'N/A'} />
                <div className="md:col-span-2">
                    <ProfileField icon={Mail} label="Email Address" value={data.email || 'No email provided'} />
                </div>
                <div className="md:col-span-2">
                    <ProfileField icon={MapPin} label="Address" value={data.address || 'No address registered'} />
                </div>
            </>
        );
    };

    const renderOverviewDetails = () => {
        if (role === 'Student') {
            return (
                <div className="grid grid-cols-1 gap-8">
                    <ProfileField icon={UserCircle} label="Guardian Name" value={data.guardianName} />
                    <ProfileField icon={Mail} label="Guardian Email" value={data.guardianEmail} />
                    <ProfileField icon={Phone} label="Guardian Phone" value={data.guardianContact || data.guardianPhone} />
                    {/* <ProfileField icon={Award} label="Scholarship" value={`${data.scholarshipPercentage ?? 0}% Waiver Applied`} color="text-amber-400" /> */}
                </div>
            );
        }
        if (role === 'Teacher') {
            return (
                <div className="grid grid-cols-1 gap-8">
                    <ProfileField icon={Briefcase} label="Service Duration" value={data.joiningDate ? moment(data.joiningDate).fromNow(true) : 'N/A'} />
                    <ProfileField icon={Globe} label="Qualifications" value={data.qualifications?.join(', ') || data.qualification || 'Verified Educator'} />
                    <ProfileField icon={Clock} label="Class Load" value={`${data.classes?.length || 0} Classes Assigned`} />
                    <ProfileField icon={DollarSign} label="Base Salary" value={`₹${(data.baseSalary || 0).toLocaleString()}`} color="text-emerald-400" />
                </div>
            );
        }
        if (role === 'Parent') {
            return (
                <div className="grid grid-cols-1 gap-8">
                    <ProfileField icon={Users} label="Children" value={data.children?.length === 1 ? '1 Child' : `${data.children?.length || 0} Children`} color="text-brand-primary" />
                    <ProfileField icon={Mail} label="Email Address" value={data.email} />
                    <ProfileField icon={Phone} label="Contact Number" value={data.phoneNumber || 'N/A'} />
                    <ProfileField icon={Calendar} label="Registration Date" value={data.createdAt ? moment(data.createdAt).format('DD MMM YYYY HH:mm') : 'N/A'} />
                </div>
            );
        }
        if (role === 'Driver') {
            return (
                <div className="grid grid-cols-1 gap-8">
                    <ProfileField icon={Shield} label="License Number" value={data.driverInfo?.licenseNumber || 'N/A'} />
                    <ProfileField icon={Calendar} label="License Expiry" value={data.driverInfo?.licenseExpiry ? moment(data.driverInfo.licenseExpiry).format('DD MMM YYYY') : 'N/A'} />
                    <ProfileField icon={Award} label="Performance Rating" value={`${data.driverInfo?.performanceRating || 5} / 5 Stars`} color="text-amber-400" />
                    <ProfileField icon={DollarSign} label="Base Salary" value={`₹${(data.baseSalary || 0).toLocaleString()}`} color="text-emerald-400" />
                </div>
            );
        }
        if (['Accountant', 'Librarian', 'Transport_Manager'].includes(role)) {
            return (
                <div className="grid grid-cols-1 gap-8">
                    <ProfileField icon={Briefcase} label="Role" value={role?.replace('_', ' ')} color="text-brand-primary" />
                    <ProfileField icon={Calendar} label="Joining Date" value={data.createdAt ? moment(data.createdAt).format('DD MMM YYYY') : 'N/A'} />
                    <ProfileField icon={DollarSign} label="Base Salary" value={`₹${(data.baseSalary || 0).toLocaleString()}`} color="text-emerald-400" />
                    <ProfileField icon={Shield} label="Access Level" value="Level 3" />
                </div>
            );
        }
        return (
            <div className="grid grid-cols-1 gap-8">
                <ProfileField icon={Shield} label="Access Level" value={role === 'Super_Admin' ? 'Full Access' : 'School Access'} color="text-amber-400" />
                <ProfileField icon={Calendar} label="Registration Date" value={data.createdAt ? moment(data.createdAt).format('DD MMM YYYY') : 'N/A'} />
                <ProfileField icon={Activity} label="Status" value={data.isActive ? 'Active' : 'Offline'} color="text-emerald-400" />
                <ProfileField icon={Globe} label="Registered School" value={role === 'Super_Admin' ? 'Central System' : (data.schoolId?.name || 'Central System')} />
            </div>
        );
    };

    return (
        <div className="max-w-7xl mx-auto space-y-8 pb-20 font-inter text-slate-100 antialiased p-4 relative">
            {/* Cyberpunk Radial Backdrop Glows */}
            <div className="absolute top-[-100px] left-[-100px] w-[500px] h-[500px] bg-gradient-to-tr from-brand-primary/10 via-indigo-500/5 to-transparent rounded-full blur-[140px] pointer-events-none -z-10"></div>
            <div className="absolute bottom-[100px] right-[-100px] w-[400px] h-[400px] bg-gradient-to-br from-indigo-500/5 via-purple-500/5 to-transparent rounded-full blur-[120px] pointer-events-none -z-10"></div>

            {/* Header Identity Bar */}
            <div className="flex items-center gap-4 border-b border-white/5 pb-5">
                <button 
                    onClick={() => navigate(-1)}
                    className="p-3 bg-slate-900/60 hover:bg-slate-800 border border-white/5 rounded-xl text-slate-400 hover:text-white transition-all shadow-2xl active:scale-95"
                >
                    <ArrowLeft size={18} />
                </button>
                <div>
                    <h1 className="text-3xl font-black uppercase tracking-tighter font-outfit text-white leading-none">
                        {role?.replace('_', ' ')} <span className="text-brand-primary">Profile</span>
                    </h1>
                    <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 mt-1.5 italic flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                        SYSTEM NODE ID: <span className="font-mono text-slate-400">{id}</span>
                    </p>
                </div>
            </div>

            {/* Hero Hub - Info + Stats Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main Identity Card */}
                <div className="lg:col-span-2 bg-slate-900/30 border border-slate-800/60 p-8 rounded-2xl backdrop-blur-3xl shadow-[0_0_50px_rgba(0,0,0,0.3)] relative overflow-hidden group">
                    {/* Tech corners */}
                    <div className="absolute top-0 left-0 w-6 h-6 border-t-2 border-l-2 border-brand-primary/30"></div>
                    <div className="absolute top-0 right-0 w-6 h-6 border-t-2 border-r-2 border-brand-primary/30"></div>
                    <div className="absolute bottom-0 left-0 w-6 h-6 border-b-2 border-l-2 border-brand-primary/30"></div>
                    <div className="absolute bottom-0 right-0 w-6 h-6 border-b-2 border-r-2 border-brand-primary/30"></div>
                    
                    <div className="absolute top-0 right-0 w-64 h-64 bg-brand-primary/5 rounded-full blur-3xl -mr-32 -mt-32 transition-all group-hover:bg-brand-primary/10" />
                    
                    <div className="relative flex flex-col md:flex-row gap-8 items-start">
                        <div className="relative flex-shrink-0 flex items-center justify-center md:mb-0">
                            {/* Scanning ring */}
                            <div className="w-36 h-36 rounded-full border-2 border-dashed border-brand-primary/40 p-1 bg-slate-900/40 backdrop-blur-3xl shadow-2xl relative overflow-hidden flex items-center justify-center transition-all duration-500 hover:border-brand-primary hover:rotate-6">
                                <div className="w-full h-full rounded-full bg-slate-950 overflow-hidden flex items-center justify-center">
                                    {data.photo && !data.photo.includes('ui-avatars.com') ? (
                                        <img 
                                            src={data.photo.startsWith('http') ? data.photo : `${BASE_URL.replace('/api', '')}/${data.photo}`}
                                            className="w-full h-full object-cover transition-transform duration-700 hover:scale-110"
                                            alt="Profile"
                                        />
                                    ) : (
                                        <div className="w-full h-full rounded-full bg-gradient-to-br from-brand-primary/20 to-brand-primary/5 flex items-center justify-center text-brand-primary font-black font-outfit text-4xl shadow-inner">
                                            {`${data.firstName?.[0] || ''}${data.lastName?.[0] || ''}`.toUpperCase()}
                                        </div>
                                    )}
                                </div>
                                {/* Scanning line animation */}
                                <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-brand-primary to-transparent animate-bounce opacity-40"></div>
                            </div>

                            {/* Node status badge */}
                            <div className="absolute -bottom-2.5 bg-brand-primary text-black px-4 py-1 rounded-lg text-[8px] font-black uppercase tracking-[0.2em] shadow-lg border border-black/10 whitespace-nowrap">
                                {role?.replace('_', ' ')} NODE
                            </div>
                        </div>

                        <div className="flex-1 space-y-6">
                            <div>
                                <h2 className="text-4xl font-black uppercase tracking-tighter text-white mb-1 font-outfit italic">
                                    {data.firstName} <span className="text-brand-primary">{data.lastName}</span>
                                </h2>
                                <p className="text-brand-primary font-black uppercase tracking-[0.2em] text-[10px] bg-brand-primary/10 px-3 py-1 rounded inline-block border border-brand-primary/20">
                                    {getRoleCodeLabel()}
                                </p>
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-y-4 gap-x-8">
                                {renderHeroFields()}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Real-time Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-1 gap-4">
                    {stats.map((stat, i) => {
                        const isPercentage = typeof stat.value === 'string' && stat.value.endsWith('%');
                        const percentNum = isPercentage ? parseFloat(stat.value) : null;
                        const isPaymentStatus = stat.label === 'Payment Status';
                        const isAccountStatus = stat.label === 'Account Status' || stat.label === 'Status';

                        return (
                            <motion.div 
                                key={i}
                                initial={{ opacity: 0, y: 15 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.3, delay: i * 0.05 }}
                                whileHover={{ y: -3, scale: 1.01 }}
                                className="bg-slate-900/30 border border-slate-800/60 backdrop-blur-3xl rounded-2xl p-5 flex flex-col justify-between gap-4 group hover:border-brand-primary/30 transition-all shadow-2xl relative overflow-hidden"
                            >
                                {/* Double-glowing tech corners */}
                                <div className="absolute top-0 left-0 w-3 h-3 border-t border-l border-brand-primary/10 group-hover:border-brand-primary/30 transition-colors"></div>
                                <div className="absolute top-0 right-0 w-3 h-3 border-t border-r border-brand-primary/10 group-hover:border-brand-primary/30 transition-colors"></div>
                                <div className="absolute bottom-0 left-0 w-3 h-3 border-b border-l border-brand-primary/10 group-hover:border-brand-primary/30 transition-colors"></div>
                                <div className="absolute bottom-0 right-0 w-3 h-3 border-b border-r border-brand-primary/10 group-hover:border-brand-primary/30 transition-colors"></div>

                                <div className="flex items-center gap-4 min-w-0">
                                    <div className={`w-11 h-11 rounded-xl bg-slate-950/60 border border-slate-800/60 flex items-center justify-center flex-shrink-0 group-hover:scale-110 group-hover:border-brand-primary/30 transition-all shadow-lg ${stat.color}`}>
                                        <stat.icon size={18} />
                                    </div>
                                    <div className="min-w-0 flex-1 text-left">
                                        <p className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-500 mb-0.5 leading-none">{stat.label}</p>
                                        <p className="text-base font-black text-white font-outfit break-words leading-tight" title={stat.value}>{stat.value}</p>
                                    </div>
                                </div>

                                {/* Custom Visual Progress Elements */}
                                {isPercentage && percentNum !== null && (
                                    <div className="w-full space-y-1">
                                        <div className="flex justify-between items-center text-[8px] font-bold text-slate-600 uppercase tracking-widest leading-none">
                                            <span>Signal Level</span>
                                            <span>{percentNum}%</span>
                                        </div>
                                        <div className="h-1.5 w-full bg-slate-950/60 rounded-full overflow-hidden p-0.5 border border-slate-800/40">
                                            <motion.div 
                                                initial={{ width: 0 }}
                                                animate={{ width: `${percentNum}%` }}
                                                transition={{ duration: 0.6, delay: 0.2 }}
                                                className={`h-full rounded-full shadow-[0_0_10px_rgba(37,99,235,0.2)] bg-gradient-to-r ${
                                                    percentNum >= 75 ? 'from-emerald-500 to-teal-400' :
                                                    percentNum >= 50 ? 'from-indigo-500 to-brand-primary' :
                                                    'from-rose-500 to-amber-500'
                                                }`}
                                            />
                                        </div>
                                    </div>
                                )}

                                {isPaymentStatus && (
                                    <div className="flex items-center gap-2">
                                        <span className={`w-1.5 h-1.5 rounded-full ${stat.value === 'Cleared' ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400 animate-pulse'}`} />
                                        <span className="text-[8px] font-black uppercase tracking-widest text-slate-500">
                                            {stat.value === 'Cleared' ? 'Financial Node Synced' : 'Action Required'}
                                        </span>
                                    </div>
                                )}

                                {isAccountStatus && (
                                    <div className="flex items-center gap-2">
                                        <span className={`w-1.5 h-1.5 rounded-full ${stat.value === 'Active' ? 'bg-emerald-400 animate-pulse' : 'bg-rose-400 animate-pulse'}`} />
                                        <span className="text-[8px] font-black uppercase tracking-widest text-slate-500">
                                            {stat.value === 'Active' ? 'Operational Online' : 'Operational Offline'}
                                        </span>
                                    </div>
                                )}

                                {!isPercentage && !isPaymentStatus && !isAccountStatus && (
                                    <div className="flex items-center gap-2">
                                        <div className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse" />
                                        <span className="text-[8px] font-black uppercase tracking-widest text-slate-500">Telemetry Stable</span>
                                    </div>
                                )}
                            </motion.div>
                        );
                    })}
                </div>
            </div>

            {/* Navigation Tabs */}
            <div className="flex flex-wrap items-center gap-2 bg-slate-900/30 p-2 rounded-2xl border border-slate-800/60 w-fit shadow-2xl backdrop-blur-3xl relative overflow-hidden">
                {/* Ambient glow in navigation bar */}
                <div className="absolute inset-0 bg-gradient-to-r from-brand-primary/5 via-transparent to-indigo-500/5 pointer-events-none" />
                
                {tabs.map((tab) => {
                    const isActive = activeTab === tab.id;
                    return (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`flex items-center gap-3 px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-[0.25em] transition-all relative italic overflow-hidden border
                                ${isActive 
                                    ? 'border-brand-primary/30 text-white bg-slate-950/60 shadow-[inset_0_1px_1px_rgba(255,255,255,0.1),0_0_15px_rgba(14,165,233,0.15)] scale-[1.02]' 
                                    : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-white/5 hover:border-slate-800/40'
                                }`}
                        >
                            <tab.icon size={12} className={isActive ? 'text-brand-primary animate-pulse' : 'text-slate-500'} />
                            <span>{tab.label}</span>
                            
                            {/* Neon active line bar */}
                            {isActive && (
                                <motion.div 
                                    layoutId="tab-neon-line" 
                                    className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-brand-primary to-indigo-500 shadow-[0_0_8px_#14a5e9]" 
                                    transition={{ type: "spring", stiffness: 380, damping: 30 }}
                                />
                            )}
                        </button>
                    );
                })}
            </div>

            {/* Tab Contents */}
            <AnimatePresence mode="wait">
                <motion.div
                    key={activeTab}
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -15 }}
                    transition={{ duration: 0.3 }}
                >
                    {activeTab === 'overview' && (
                        <div className="space-y-8">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                {/* Role-specific Details */}
                                <div className="bg-slate-900/30 border border-slate-800/60 backdrop-blur-3xl rounded-2xl p-8 relative overflow-hidden group shadow-2xl">
                                    {/* Tech corners */}
                                    <div className="absolute top-0 left-0 w-4 h-4 border-t border-l border-brand-primary/20 group-hover:border-brand-primary/40 transition-colors"></div>
                                    <div className="absolute top-0 right-0 w-4 h-4 border-t border-r border-brand-primary/20 group-hover:border-brand-primary/40 transition-colors"></div>
                                    <div className="absolute bottom-0 left-0 w-4 h-4 border-b border-l border-brand-primary/20 group-hover:border-brand-primary/40 transition-colors"></div>
                                    <div className="absolute bottom-0 right-0 w-4 h-4 border-b border-r border-brand-primary/20 group-hover:border-brand-primary/40 transition-colors"></div>

                                    <h3 className="text-sm font-black uppercase tracking-[0.3em] text-slate-400 border-b border-slate-800/60 pb-5 mb-8 flex items-center gap-4">
                                        <User size={18} className="text-brand-primary" /> 
                                        {role === 'Student' ? 'Guardian Details' : 
                                         role === 'Parent' ? 'Family Details' :
                                         role === 'Super_Admin' || role === 'School_Admin' ? 'Admin Details' :
                                         'Staff Details'}
                                    </h3>
                                    <div className="space-y-8">
                                        {renderOverviewDetails()}
                                    </div>
                                </div>

                            {/* Quick Actions */}
                            <div className="bg-slate-900/30 border border-slate-800/60 backdrop-blur-3xl rounded-2xl p-8 relative overflow-hidden group shadow-2xl">
                                {/* Tech corners */}
                                <div className="absolute top-0 left-0 w-4 h-4 border-t border-l border-brand-primary/20 group-hover:border-brand-primary/40 transition-colors"></div>
                                <div className="absolute top-0 right-0 w-4 h-4 border-t border-r border-brand-primary/20 group-hover:border-brand-primary/40 transition-colors"></div>
                                <div className="absolute bottom-0 left-0 w-4 h-4 border-b border-l border-brand-primary/20 group-hover:border-brand-primary/40 transition-colors"></div>
                                <div className="absolute bottom-0 right-0 w-4 h-4 border-b border-r border-brand-primary/20 group-hover:border-brand-primary/40 transition-colors"></div>

                                <h3 className="text-sm font-black uppercase tracking-[0.3em] text-slate-400 border-b border-slate-800/60 pb-5 mb-8 flex items-center gap-4 italic">
                                    <Zap size={18} className="text-brand-primary animate-pulse" /> Quick Actions
                                </h3>
                                <div className="space-y-4">
                                    {role === 'Student' && (
                                        <button 
                                            onClick={() => dispatch(downloadReportCard({ id: data._id, name: `${data.firstName}_${data.lastName}` }))}
                                            className="w-full flex items-center justify-between p-5 bg-slate-950/40 hover:bg-brand-primary/5 border border-white/5 rounded-2xl group transition-all"
                                        >
                                            <div className="flex items-center gap-5">
                                                <div className="w-12 h-12 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-400 group-hover:scale-110 transition-transform shadow-lg">
                                                    <FileText size={20} />
                                                </div>
                                                <div className="text-left">
                                                    <p className="text-xs font-black uppercase tracking-widest text-white italic">Download Report Card</p>
                                                    <p className="text-[10px] text-slate-500 font-medium lowercase">Export student grades as PDF</p>
                                                </div>
                                            </div>
                                            <ChevronRight size={18} className="text-slate-800 group-hover:text-white transition-colors" />
                                        </button>
                                    )}
                                    {!isOwner && (
                                        <button 
                                            onClick={handleMessageContact}
                                            className="w-full flex items-center justify-between p-5 bg-slate-950/40 hover:bg-emerald-500/5 border border-white/5 rounded-2xl group transition-all"
                                        >
                                            <div className="flex items-center gap-5">
                                                <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-400 group-hover:scale-110 transition-transform shadow-lg">
                                                    <MessageCircle size={20} />
                                                </div>
                                                <div className="text-left">
                                                    <p className="text-xs font-black uppercase tracking-widest text-white italic">Send Message</p>
                                                    <p className="text-[10px] text-slate-500 font-medium lowercase">Send message through portal</p>
                                                </div>
                                            </div>
                                            <ChevronRight size={18} className="text-slate-800 group-hover:text-white transition-colors" />
                                        </button>
                                    )}
                                    <div className="p-5 bg-brand-primary/5 border border-brand-primary/10 rounded-2xl">
                                        <p className="text-[10px] text-brand-primary leading-relaxed font-black uppercase tracking-widest italic opacity-60">
                                            Notice: All activities on this profile are recorded.
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Render children/dependents for Parent */}
                            {role === 'Parent' && (
                                <div className="bg-slate-900/30 border border-slate-800/60 rounded-2xl p-8 shadow-2xl backdrop-blur-3xl relative overflow-hidden group md:col-span-2">
                                    {/* Tech corners */}
                                    <div className="absolute top-0 left-0 w-4 h-4 border-t border-l border-brand-primary/20 group-hover:border-brand-primary/40 transition-colors"></div>
                                    <div className="absolute top-0 right-0 w-4 h-4 border-t border-r border-brand-primary/20 group-hover:border-brand-primary/40 transition-colors"></div>
                                    <div className="absolute bottom-0 left-0 w-4 h-4 border-b border-l border-brand-primary/20 group-hover:border-brand-primary/40 transition-colors"></div>
                                    <div className="absolute bottom-0 right-0 w-4 h-4 border-b border-r border-brand-primary/20 group-hover:border-brand-primary/40 transition-colors"></div>

                                    <h4 className="text-[11px] font-black text-slate-500 uppercase tracking-[0.4em] mb-8 italic flex items-center gap-3">
                                        <Users size={16} className="text-brand-primary" /> Children
                                    </h4>
                                    {data.children?.length > 0 ? (
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            {data.children.map(child => {
                                                const childInitials = `${child.firstName?.[0] || ''}${child.lastName?.[0] || ''}`.toUpperCase();
                                                return (
                                                    <div key={child._id} 
                                                        onClick={() => navigate(`/${rolePrefix}/profile/${child._id}`)}
                                                        className="flex items-center gap-6 p-5 rounded-2xl bg-slate-950/60 border border-emerald-500/10 hover:border-emerald-500/40 transition-all cursor-pointer group shadow-2xl backdrop-blur-3xl min-w-0"
                                                    >
                                                        {child.photo && !child.photo.includes('ui-avatars.com') ? (
                                                            <div className="w-16 h-16 rounded-xl overflow-hidden border-2 border-white/5 group-hover:border-brand-primary/30 transition-all shadow-inner flex-shrink-0">
                                                                <img 
                                                                    src={child.photo.startsWith('http') ? child.photo : `${BASE_URL.replace('/api', '')}/${child.photo}`} 
                                                                    className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all" 
                                                                    alt="" 
                                                                />
                                                            </div>
                                                        ) : (
                                                            <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-brand-primary/20 to-brand-primary/5 border-2 border-brand-primary/25 flex items-center justify-center text-brand-primary font-black font-outfit text-xl shadow-inner flex-shrink-0 group-hover:border-brand-primary/50 transition-all">
                                                                {childInitials}
                                                            </div>
                                                        )}
                                                        <div className="flex-1 min-w-0">
                                                            <p className="text-base font-black text-white italic group-hover:text-brand-primary transition-colors uppercase font-outfit leading-none mb-2 truncate">{child.firstName} {child.lastName}</p>
                                                            <div className="flex flex-wrap items-center gap-2">
                                                                <span className="text-[9px] font-black text-slate-500 font-mono tracking-tighter uppercase border border-white/5 px-2.5 py-1 rounded bg-slate-900/60 whitespace-nowrap">ID: {child.admissionNumber}</span>
                                                                <span className="text-[9px] font-black text-slate-500 font-mono tracking-tighter uppercase border border-white/5 px-2.5 py-1 rounded bg-slate-900/60 whitespace-nowrap">ROLL: {child.rollNumber}</span>
                                                            </div>
                                                        </div>
                                                        <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 opacity-40 group-hover:opacity-100 transition-all flex-shrink-0">
                                                            <ChevronRight size={18} />
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    ) : (
                                        <div className="p-16 rounded-2xl bg-slate-900/40 text-center border border-dashed border-slate-800">
                                            <p className="text-sm text-slate-600 italic font-medium tracking-wide">No children registered under this account.</p>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                )}

                    {(activeTab === 'academic' || activeTab === 'professional') && (
                        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                            <DetailSection icon={BarChart3} title={role === 'Student' ? "Academic Performance" : "Teaching Schedule"} badge="Academics">
                                {role === 'Student' ? (
                                    data.results?.length > 0 ? (
                                        <div className="space-y-4">
                                            {data.results.map((res, i) => (
                                                <div key={i} className="flex items-center justify-between p-5 rounded-2xl bg-slate-950/30 border border-slate-800/60 hover:border-brand-primary/20 hover:bg-slate-950/50 transition-all group shadow-md">
                                                    <div className="flex items-center gap-5">
                                                        <div className="w-12 h-12 rounded-xl bg-slate-900 border border-slate-800/60 flex items-center justify-center text-slate-500 group-hover:text-brand-primary transition-colors shadow-lg">
                                                            <Award size={22} />
                                                        </div>
                                                        <div>
                                                            <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest italic">{res.examId?.name}</p>
                                                            <p className="text-sm font-bold text-white uppercase italic tracking-tight">{res.examId?.subject?.name || 'Subject'}</p>
                                                        </div>
                                                    </div>
                                                    <div className="text-right">
                                                        <p className="text-xl font-black text-brand-primary leading-none mb-1 shadow-sm italic">{res.marksObtained}/{res.examId?.maxMarks || 100}</p>
                                                        <p className="text-[9px] font-black text-slate-600 uppercase tracking-widest italic">{Math.round((res.marksObtained/(res.examId?.maxMarks || 100))*100)}% Score</p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="py-20 text-left opacity-30 uppercase tracking-[0.3em] font-black text-xs">No data found.</div>
                                    )
                                ) : (
                                    data.classes?.length > 0 ? (
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                            {data.classes.map((cls, i) => (
                                                <div key={i} className="p-6 rounded-2xl bg-slate-950/30 border border-slate-800/60 flex items-center gap-4 group hover:bg-brand-primary/5 transition-all shadow-xl">
                                                    <div className="w-14 h-14 rounded-2xl bg-slate-900 border border-slate-800/60 flex items-center justify-center text-brand-primary group-hover:scale-110 transition-transform shadow-inner flex-shrink-0">
                                                        <LayoutGrid size={28} />
                                                    </div>
                                                    <div className="text-left">
                                                        <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest mb-1">Section</p>
                                                        <p className="text-base font-black text-white uppercase tracking-tighter">Grade {cls.standardId?.level || ''}-{cls.sectionLabel}</p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="py-20 text-left opacity-30 uppercase tracking-[0.3em] font-black text-xs">No classes assigned.</div>
                                    )
                                )}
                            </DetailSection>

                            <DetailSection icon={Clock} title="Weekly Schedule" badge="Weekly Timetable">
                                {data.timetable?.length > 0 ? (
                                    <div className="space-y-4">
                                        {data.timetable.slice(0, 10).map((tt, i) => (
                                            <div key={i} className="flex items-center justify-between p-5 rounded-2xl bg-slate-950/30 border border-slate-800/60 hover:bg-slate-950/50 hover:border-brand-primary/20 transition-all border-l-4 border-l-indigo-500 shadow-lg">
                                                <div className="flex items-center gap-5">
                                                    <div className="w-12 h-12 rounded-xl bg-indigo-500/10 border border-indigo-400/20 text-indigo-400 flex items-center justify-center shadow-inner">
                                                        <Clock size={20} />
                                                    </div>
                                                    <div>
                                                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest italic">{tt.day}</p>
                                                        <p className="text-sm font-black text-white uppercase italic tracking-tighter">
                                                            {tt.courseId?.name || tt.subjectId?.name} // {tt.classId?.sectionLabel || tt.teacherId?.name || 'SYSTEM'}
                                                        </p>
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <p className="text-xs font-black text-indigo-400 uppercase tracking-[0.2em] leading-none mb-1 italic">{tt.startTime} — {tt.endTime}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="py-20 text-left opacity-30 uppercase tracking-[0.3em] font-black text-[10px]">No schedule found.</div>
                                )}
                            </DetailSection>
                        </div>
                    )}

                    {activeTab === 'attendance' && (
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
                            {/* Calendar Grid Section */}
                            <div className="lg:col-span-2 bg-slate-900/40 backdrop-blur-3xl border border-white/5 rounded-2xl p-6 md:p-8 shadow-2xl relative">
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-xl bg-brand-primary/10 border border-brand-primary/20 flex items-center justify-center text-brand-primary shadow-lg shrink-0">
                                            <CalendarDays size={24} />
                                        </div>
                                        <div>
                                            <h3 className="text-xl font-black text-white tracking-tight uppercase italic leading-none">{currentMonth.format('MMMM YYYY')}</h3>
                                            <p className="text-[8px] font-bold text-slate-500 uppercase tracking-widest mt-1">Attendance Presence Telemetry</p>
                                        </div>
                                    </div>

                                    {/* Traversal Controls */}
                                    <div className="flex items-center gap-1.5 bg-slate-950 p-1.5 rounded-xl border border-white/5 shadow-inner self-start sm:self-center shrink-0">
                                        <button 
                                            type="button"
                                            onClick={() => setCurrentMonth(currentMonth.clone().subtract(1, 'month'))}
                                            className="p-2 hover:bg-white/5 rounded-lg transition-all text-slate-400 hover:text-white"
                                        >
                                            <ChevronLeft size={16} />
                                        </button>
                                        <button 
                                            type="button"
                                            onClick={() => setCurrentMonth(moment())}
                                            className="px-4 py-1.5 bg-white/5 hover:bg-white/10 rounded-lg text-[9px] font-black uppercase text-white transition-all tracking-widest"
                                        >
                                            Today
                                        </button>
                                        <button 
                                            type="button"
                                            onClick={() => setCurrentMonth(currentMonth.clone().add(1, 'month'))}
                                            className="p-2 hover:bg-white/5 rounded-lg transition-all text-slate-400 hover:text-white"
                                        >
                                            <ChevronRight size={16} />
                                        </button>
                                    </div>
                                </div>

                                <div className="grid grid-cols-7 gap-2 md:gap-3 mb-2">
                                    {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
                                        <div key={d} className="text-center text-[9px] font-black uppercase tracking-[0.2em] text-slate-600 pb-2">{d}</div>
                                    ))}
                                </div>

                                <div className="grid grid-cols-7 gap-2 md:gap-3">
                                    {calendarGrid.flat().map((date, i) => {
                                        const isCurrentMonth = date.month() === currentMonth.month();
                                        const isToday = date.isSame(moment(), 'day');
                                        
                                        const record = getRecord(date);
                                        const cfg = record ? STATUS[record.status] : null;

                                        return (
                                            <motion.div 
                                                key={i} 
                                                whileHover={isCurrentMonth ? { scale: 1.03, y: -2 } : {}}
                                                whileTap={isCurrentMonth ? { scale: 0.97 } : {}}
                                                onClick={() => {
                                                    if (isCurrentMonth) {
                                                        if (record) {
                                                            setSelectedDate(record);
                                                        } else {
                                                            setSelectedDate({
                                                                date: date.format('YYYY-MM-DD'),
                                                                status: 'No Record',
                                                                arrivalTime: '—',
                                                                departureTime: '—',
                                                                remarks: 'No attendance telemetry recorded for this session.'
                                                            });
                                                        }
                                                    }
                                                }} 
                                                className={`relative aspect-square rounded-xl p-2 cursor-pointer transition-all duration-300 group border flex flex-col items-center justify-center overflow-hidden 
                                                    ${!isCurrentMonth ? 'opacity-10 pointer-events-none' : ''} 
                                                    ${isToday ? 'bg-brand-primary/10 border-brand-primary/30 shadow-xl' : 'bg-slate-950/40 border-white/5 hover:border-brand-primary/30'} 
                                                    ${cfg ? `${cfg.bg} ${cfg.border}` : ''}`}
                                            >
                                                {/* Date number */}
                                                <span className={`absolute top-1 left-2 text-[10px] font-black italic transition-colors duration-300
                                                    ${isToday ? 'text-brand-primary' : 'text-slate-600 group-hover:text-white'} 
                                                    ${cfg ? cfg.color : ''}`}>
                                                    {date.date()}
                                                </span>

                                                <div className="flex flex-col items-center justify-center mt-2">
                                                    {cfg ? (
                                                        <div className={`w-7 h-7 rounded-lg ${cfg.bg} border ${cfg.border} flex items-center justify-center ${cfg.color} shadow-sm group-hover:scale-110 transition-transform`}>
                                                            <cfg.icon size={14} />
                                                        </div>
                                                    ) : (
                                                        <div className="w-7 h-7 rounded-lg bg-white/5 border border-white/5 flex items-center justify-center text-slate-800 group-hover:text-slate-500 transition-colors duration-300">
                                                            <Calendar size={14} />
                                                        </div>
                                                    )}
                                                </div>

                                                {/* Corner Pulse Indicator for Today */}
                                                {isToday && (
                                                    <div className="absolute top-1.5 right-2">
                                                        <div className="w-1.5 h-1.5 rounded-full bg-brand-primary shadow-[0_0_8px_#2563eb] animate-pulse" />
                                                    </div>
                                                )}
                                            </motion.div>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Summary Column */}
                            <div className="space-y-6">
                                <div className="bg-slate-900/40 backdrop-blur-xl border border-white/5 rounded-2xl p-6 md:p-8 shadow-2xl">
                                    <h4 className="text-[11px] font-black uppercase tracking-[0.4em] text-slate-400 mb-8 italic">Attendance Summary</h4>
                                    <div className="space-y-8">
                                        <div>
                                            <div className="flex justify-between mb-3">
                                                <span className="text-xs font-black text-slate-400 uppercase italic">Presence Rate</span>
                                                <span className="text-xs font-black text-emerald-400 italic">
                                                    {data.attendance?.length > 0 
                                                        ? (data.attendance.filter(a => a.status === 'Present').length / data.attendance.length * 100).toFixed(1) 
                                                        : '0.0'}%
                                                </span>
                                            </div>
                                            <div className="h-3 w-full bg-slate-950 rounded-full overflow-hidden p-0.5 border border-white/5">
                                                <motion.div 
                                                    initial={{ width: 0 }}
                                                    animate={{ width: `${data.attendance?.length > 0 
                                                        ? (data.attendance.filter(a => a.status === 'Present').length / data.attendance.length * 100) 
                                                        : 0}%` }}
                                                    className="h-full bg-emerald-500 rounded-full shadow-[0_0_20px_rgba(16,185,129,0.3)]"
                                                />
                                            </div>
                                        </div>
                                        
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="p-4 rounded-xl bg-slate-950/60 border border-white/5 hover:border-brand-primary/10 transition-colors">
                                                <p className="text-[10px] font-black text-slate-600 uppercase mb-1 italic">Presents</p>
                                                <p className="text-xl font-black text-emerald-500 italic">{data.attendance?.filter(a => a.status === 'Present').length || 0}</p>
                                            </div>
                                            <div className="p-4 rounded-xl bg-slate-950/60 border border-white/5 hover:border-brand-primary/10 transition-colors">
                                                <p className="text-[10px] font-black text-slate-600 uppercase mb-1 italic">Absents</p>
                                                <p className="text-xl font-black text-rose-500 italic">{data.attendance?.filter(a => a.status === 'Absent').length || 0}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Legend panel */}
                                <div className="bg-slate-900/40 backdrop-blur-xl border border-white/5 rounded-2xl p-6 md:p-8 shadow-2xl">
                                    <h4 className="text-[11px] font-black uppercase tracking-[0.4em] text-slate-400 mb-6 italic">Telemetry Legend</h4>
                                    <div className="space-y-3">
                                        {Object.entries(STATUS).map(([key, cfg]) => (
                                            <div key={key} className="flex items-center justify-between bg-slate-950/40 border border-white/5 px-4 py-3 rounded-xl hover:bg-white/5 transition-all">
                                                <div className="flex items-center gap-2">
                                                    <span className={`w-2 h-2 rounded-full ${cfg.dot}`} />
                                                    <span className="text-[9px] font-black text-slate-300 uppercase tracking-widest">{key}</span>
                                                </div>
                                                <span className="text-[8px] font-mono text-slate-500 uppercase font-black">{cfg.sub}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'financial' && (
                        <DetailSection icon={DollarSign} title={role === 'Student' ? "Fees Details" : "Payroll Details"} badge={role === 'Student' ? "Fees" : "Payroll"}>
                            {role === 'Student' ? (
                                data.fees?.length > 0 ? (
                                    <div className="bg-slate-950/30 border border-slate-800/60 rounded-2xl overflow-hidden shadow-2xl backdrop-blur-3xl">
                                        <table className="w-full text-left">
                                            <thead>
                                                <tr className="bg-slate-950/50 border-b border-slate-800/60">
                                                    <th className="px-8 py-5 text-[10px] font-black text-slate-500 uppercase tracking-widest italic">Fee Category</th>
                                                    <th className="px-8 py-5 text-[10px] font-black text-slate-500 uppercase tracking-widest italic">Due Date</th>
                                                    <th className="px-8 py-5 text-[10px] font-black text-slate-500 uppercase tracking-widest italic text-center">Paid Amount</th>
                                                    <th className="px-8 py-5 text-[10px] font-black text-slate-500 uppercase tracking-widest italic text-center">Status</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-slate-800/60">
                                                {data.fees.map((f, i) => (
                                                    <tr key={i} className="hover:bg-white/5 transition-all group">
                                                        <td className="px-8 py-6">
                                                            <p className="text-sm font-black text-white uppercase italic tracking-tighter">{f.category || 'Fee'}</p>
                                                            <p className="text-[9px] font-black text-slate-500 uppercase tracking-[0.2em] mt-1">Transaction ID: {f._id.slice(-8).toUpperCase()}</p>
                                                        </td>
                                                        <td className="px-8 py-6">
                                                            <p className="text-xs font-black text-slate-400 italic mb-1 uppercase tracking-widest">{f.dueDate ? moment(f.dueDate).format('DD MMM YYYY') : 'PENDING'}</p>
                                                            <div className="h-1.5 w-32 bg-slate-950/80 rounded-full overflow-hidden border border-slate-800/60 p-0.5">
                                                                <div className="h-full bg-brand-primary shadow-[0_0_10px_rgba(14,165,233,0.3)] rounded-full" style={{ width: `${Math.min(100, (f.paidAmount/(f.totalAmount || 1))*100)}%` }} />
                                                            </div>
                                                        </td>
                                                        <td className="px-8 py-6 text-center">
                                                            <p className="text-base font-black text-brand-primary italic shadow-sm tracking-tight">₹{f.paidAmount?.toLocaleString()}</p>
                                                            <p className="text-[9px] font-bold text-slate-600 italic"> / ₹{f.totalAmount?.toLocaleString()}</p>
                                                        </td>
                                                        <td className="px-8 py-6 text-center">
                                                            <span className={`px-4 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest italic border transition-all ${f.status === 'paid' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-red-500/10 border-red-500/20 text-red-400'}`}>
                                                                {f.status?.replace('_', ' ')}
                                                            </span>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                ) : (
                                    <div className="py-24 text-left opacity-30 uppercase tracking-[0.3em] font-black text-xs">No fee records found.</div>
                                )
                            ) : (
                                data.salary?.length > 0 ? (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        {data.salary.map((py, i) => (
                                            <div key={i} className="flex items-center justify-between p-6 rounded-2xl bg-slate-950/30 border border-slate-800/60 hover:border-brand-primary/20 hover:bg-slate-955/50 hover:bg-slate-950/50 transition-all group shadow-xl">
                                                <div className="flex items-center gap-6">
                                                    <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 group-hover:scale-110 transition-transform shadow-inner">
                                                        <Wallet size={24} />
                                                    </div>
                                                    <div>
                                                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest italic mb-1">{moment(py.paidAt).format('MMMM YYYY')}</p>
                                                        <p className="text-base font-black text-white italic tracking-tighter uppercase">Paid Salary</p>
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <p className="text-2xl font-black text-emerald-400 italic shadow-sm tracking-tighter">₹{py.netSalary.toLocaleString()}</p>
                                                    <span className="text-[9px] font-black text-slate-700 uppercase tracking-widest italic">Disbursed</span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="py-24 text-left opacity-30 uppercase tracking-[0.3em] font-black text-xs">No payroll records found.</div>
                                )
                            )}
                        </DetailSection>
                    )}
                </motion.div>
            </AnimatePresence>

            {/* System Information */}
            {(isSchoolAdmin || currentUser.role === 'Super_Admin') && (
                <div className="mt-20 pt-16 border-t border-slate-800/60 relative isolate">
                    <div className="flex items-center gap-4 mb-12">
                        <div className="w-10 h-10 rounded-xl bg-slate-900 border border-slate-800/60 flex items-center justify-center text-brand-primary shadow-inner">
                            <Shield size={18} />
                        </div>
                        <div className="text-left">
                            <h4 className="text-sm font-black text-white uppercase tracking-[0.4em] leading-none mb-1">System Info</h4>
                            <p className="text-[9px] font-bold text-slate-600 uppercase tracking-widest">Record details and access info</p>
                        </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                        {[
                            { label: 'User ID', val: data._id, icon: Zap },
                            { label: 'Last Activity', val: moment().format('HH:mm:ss [UTC]'), icon: Activity },
                            { label: 'Access Level', val: access.toUpperCase(), icon: Shield },
                            { label: 'Registration Date', val: moment(data.createdAt).format('DD MMM YYYY'), icon: FileText }
                        ].map((meta, i) => (
                            <div key={i} className="space-y-3 group p-6 rounded-2xl bg-slate-950/20 border border-slate-800/60 hover:border-brand-primary/20 transition-all shadow-xl relative overflow-hidden text-left">
                                {/* Tech corner highlights */}
                                <div className="absolute top-0 left-0 w-2.5 h-2.5 border-t border-l border-brand-primary/10 group-hover:border-brand-primary/30 transition-colors" />
                                <div className="absolute top-0 right-0 w-2.5 h-2.5 border-t border-r border-brand-primary/10 group-hover:border-brand-primary/30 transition-colors" />
                                <div className="absolute bottom-0 left-0 w-2.5 h-2.5 border-b border-l border-brand-primary/10 group-hover:border-brand-primary/30 transition-colors" />
                                <div className="absolute bottom-0 right-0 w-2.5 h-2.5 border-b border-r border-brand-primary/10 group-hover:border-brand-primary/30 transition-colors" />

                                <p className="text-[9px] font-black text-slate-600 uppercase tracking-widest flex items-center gap-3 italic group-hover:text-brand-primary transition-colors">
                                    <meta.icon size={12} /> {meta.label}
                                </p>
                                <p className="text-xs font-mono font-bold text-slate-300 truncate tracking-tight">{meta.val}</p>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Attendance Detail Modal */}
            <PortalModal isOpen={!!selectedDate} onClose={() => setSelectedDate(null)} maxWidth="max-w-sm">
                {selectedDate && (() => {
                    const cfg = STATUS[selectedDate.status] || STATUS['Present'];
                    const Icon = cfg.icon || Calendar;
                    const accentGradient =
                        selectedDate.status === 'Present'   ? 'from-emerald-500 to-teal-500'   :
                        selectedDate.status === 'Absent'    ? 'from-rose-500 to-pink-500'       :
                        selectedDate.status === 'Late'      ? 'from-amber-500 to-orange-500'    :
                        selectedDate.status === 'Half-Day'  ? 'from-blue-500 to-indigo-500'    :
                        'from-slate-500 to-slate-700';

                    const dateRecord = getRecord(moment(selectedDate.date));

                    return (
                        <>
                            {/* Accent strip */}
                            <div className={`h-1 w-full bg-gradient-to-r ${accentGradient}`} />
                            
                            <div className="p-6 border-b border-white/5 bg-slate-950/20 flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className={`p-2.5 rounded-xl ${cfg.bg} border ${cfg.border}`}>
                                        <Icon size={18} className={cfg.color} />
                                    </div>
                                    <div>
                                        <p className="text-[8px] font-black uppercase tracking-[0.3em] text-slate-500 mb-0.5">Attendance Telemetry</p>
                                        <h3 className="text-base font-black text-white tracking-tight">
                                            {moment(selectedDate.date).format('DD MMM YYYY')}
                                        </h3>
                                    </div>
                                </div>
                                <button
                                    onClick={() => setSelectedDate(null)}
                                    className="p-1.5 rounded-lg hover:bg-white/5 text-slate-400 hover:text-white transition-colors"
                                >
                                    <XCircle size={16} />
                                </button>
                            </div>

                            <div className="p-6 space-y-5">
                                {/* Status pill */}
                                <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-black uppercase tracking-widest ${cfg.bg} ${cfg.color} border ${cfg.border}`}>
                                    <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
                                    {selectedDate.status}
                                </div>

                                {/* Arrival/Departure grid */}
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="p-3 bg-slate-950/40 border border-white/5 rounded-lg">
                                        <p className="text-[8px] font-black uppercase tracking-widest text-slate-500 mb-1">Arrival Time</p>
                                        <p className="text-sm font-black text-white font-mono">{dateRecord?.arrivalTime || '—'}</p>
                                    </div>
                                    <div className="p-3 bg-slate-950/40 border border-white/5 rounded-lg">
                                        <p className="text-[8px] font-black uppercase tracking-widest text-slate-500 mb-1">Departure Time</p>
                                        <p className="text-sm font-black text-white font-mono">{dateRecord?.departureTime || '—'}</p>
                                    </div>
                                </div>

                                {/* Remarks */}
                                {dateRecord?.remarks && (
                                    <div className="p-3.5 bg-slate-950/40 border border-white/5 rounded-lg">
                                        <p className="text-[8px] font-black uppercase tracking-widest text-slate-500 mb-1.5">Remarks / Telemetry</p>
                                        <p className="text-xs text-slate-300 leading-relaxed italic">{dateRecord.remarks}</p>
                                    </div>
                                )}

                                <button
                                    onClick={() => setSelectedDate(null)}
                                    className="w-full py-2.5 bg-slate-900 border border-slate-800 hover:bg-slate-800 rounded-lg text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-white transition-all active:scale-95"
                                >
                                    Dismiss Record
                                </button>
                            </div>
                        </>
                    );
                })()}
            </PortalModal>
        </div>
    );
};

export default ProfileDetail;
