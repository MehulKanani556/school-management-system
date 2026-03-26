import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import axiosInstance from '../../utils/axiosInstance';
import { useDispatch, useSelector } from 'react-redux';
import { downloadReportCard } from '../../redux/slice/schoolAdmin.slice';
import { 
    Mail, Phone, Calendar, User, Shield, GraduationCap, Building2, 
    MessageCircle, UserCircle, MapPin, Briefcase, Award, ArrowLeft, 
    UserCheck, Activity, Globe, Clock, FileText, CheckCircle2,
    DollarSign, BookOpen, Layers, CheckCircle, XCircle, AlertCircle,
    BarChart3, CalendarDays, ExternalLink, ChevronRight, Zap, Users, Truck,
    LayoutGrid
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import moment from 'moment';
import { BASE_URL } from '../../utils/BASE_URL';
import { Wallet } from 'lucide-react';

const ProfileDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const currentUser = useSelector(state => state.auth.user);
    const [loading, setLoading] = useState(true);
    const [profile, setProfile] = useState(null);
    const [error, setError] = useState(null);
    const [activeTab, setActiveTab] = useState('overview');

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
                setError(response.data.message || 'Institutional search failed.');
            }
        } catch (err) {
            console.error("Profile Synchronization Fault:", err);
            setError(err.response?.data?.message || 'Platform synchronization error.');
        } finally {
            setLoading(false);
        }
    };

    const hasPermission = (profileRole) => {
        const viewerRole = currentUser?.role;
        
        // Super Admin & School Admin or self see everything
        if (viewerRole === 'School_Admin' || viewerRole === 'Super_Admin' || currentUser?._id === id) return 'full';
        
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
        <div className="bg-slate-900/40 border border-white/5 rounded-2xl overflow-hidden shadow-2xl backdrop-blur-xl">
            <div className="px-8 py-5 border-b border-white/5 flex items-center justify-between bg-slate-950/20">
                <div className="flex items-center gap-4">
                    <div className="p-2.5 rounded-lg bg-brand-primary/10 text-brand-primary">
                        <Icon size={18} />
                    </div>
                    <h4 className="text-[11px] font-black uppercase text-white tracking-widest italic">{title}</h4>
                </div>
                {badge && <span className="px-3 py-1 rounded-full bg-slate-800 text-[9px] font-black text-slate-400 uppercase tracking-widest border border-white/5">{badge}</span>}
            </div>
            <div className="p-8">
                {children}
            </div>
        </div>
    );

    const ProfileField = ({ icon: Icon, label, value, color = "text-slate-200", isHidden = false }) => {
        if (isHidden) return null;
        return (
            <div className="flex items-start gap-5 group p-2 hover:bg-white/5 rounded-xl transition-all">
                <div className="p-3 rounded-xl bg-slate-950/60 text-brand-primary shadow-xl border border-white/5 group-hover:border-brand-primary/20 transition-all">
                    <Icon size={18} />
                </div>
                <div>
                    <p className="text-[9px] font-black text-slate-600 uppercase tracking-[0.2em] mb-1 italic leading-none">{label}</p>
                    <p className={`text-sm font-bold tracking-tight ${color}`}>{value || '---'}</p>
                </div>
            </div>
        );
    };

    const renderRolesSpecifics = (role, data, access, isFull, isSchoolAdmin) => {
        const isLimited = access === 'limited' || access === 'basic';

        if (role === 'Student') {
            return (
                <div className="space-y-12">
                    {/* Core Academic Matrix */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        <ProfileField icon={GraduationCap} label="Academic Standard" value={`${data.standard?.level || ''} ${data.standard?.name || ''}`} color="text-brand-primary" />
                        <ProfileField icon={Building2} label="Institutional Section" value={data.classSection?.sectionLabel} />
                        <ProfileField icon={Shield} label="Admission Identity" value={data.admissionNumber} color="text-emerald-400 font-mono" isHidden={isLimited} />
                        <ProfileField icon={UserCircle} label="Primary Guardian" value={data.guardianName} isHidden={isLimited} />
                        <ProfileField icon={Phone} label="Emergency Uplink" value={data.guardianPhone} isHidden={isLimited} />
                        <ProfileField icon={Award} label="Scholarship Tier" value={`${data.scholarshipPercentage}% waiver`} isHidden={isLimited} color="text-amber-400" />
                    </div>

                    {isFull && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                            {[
                                { label: 'Attendance', value: `${data.attendance?.length > 0 ? Math.round((data.attendance.filter(a => a.status === 'Present').length / data.attendance.length) * 100) : 0}%`, icon: Clock, color: 'text-emerald-400' },
                                { label: 'Performance', value: `${data.results?.length > 0 ? Math.round(data.results.reduce((acc, r) => acc + (r.marksObtained / r.maxMarks), 0) / data.results.length * 100) : 0}%`, icon: Award, color: 'text-indigo-400' },
                                { label: 'Pending Tasks', value: data.assignments?.filter(a => !a.isSubmitted)?.length || 0, icon: AlertCircle, color: 'text-amber-400' },
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
                            <DetailSection icon={BarChart3} title="Academic Performance Analytics" badge="Recent Marks">
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
                                                        <p className="text-xs font-bold text-white uppercase italic">{res.examId?.subject?.name || 'Institutional Subject'}</p>
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <p className="text-lg font-black text-brand-primary leading-none mb-1">{res.marksObtained}/{res.examId?.maxMarks || 100}</p>
                                                    <p className="text-[9px] font-bold text-slate-600 uppercase tracking-widest">{Math.round((res.marksObtained/(res.examId?.maxMarks || 100))*100)}% Proficiency</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="py-10 text-center opacity-40 italic">No academic marks localized in this registry.</div>
                                )}
                            </DetailSection>

                            <DetailSection icon={CalendarDays} title="Attendance Surveillance" badge="Daily Sync">
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
                                    <div className="py-10 text-center opacity-40 italic">No attendance telemetry detected.</div>
                                )}
                            </DetailSection>

                            <DetailSection icon={AlertCircle} title="Leave Authorizations" badge="Requests">
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
                                    <div className="py-10 text-center opacity-40 italic">Stable presence-no unauthorized departures.</div>
                                )}
                            </DetailSection>

                            <DetailSection icon={Layers} title="Assigned Matrices" badge="Active Tasks">
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
                                    <div className="py-10 text-center opacity-40 italic">All pedagogical tasks reconciled.</div>
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
                        <ProfileField icon={Briefcase} label="Institutional Identity" value={data.employeeId} color="text-blue-400 font-mono" isHidden={isLimited} />
                        <ProfileField icon={Globe} label="Expertise Domain" value={data.qualification || 'Verified Educator'} />
                        <ProfileField icon={Mail} label="Professional Terminal" value={data.email} />
                        <ProfileField icon={Calendar} label="Service Initiation" value={data.joiningDate ? moment(data.joiningDate).format('DD MMM YYYY') : 'N/A'} isHidden={isLimited} />
                        <ProfileField icon={DollarSign} label="Registry Base Salary" value={`₹${(data.baseSalary || 0).toLocaleString()}`} color="text-emerald-400" isHidden={isLimited} />
                        <ProfileField icon={Activity} label="Registry Status" value={data.isActive ? "Active Node" : "Deactivated"} color={data.isActive ? "text-emerald-400" : "text-red-400"} isHidden={isLimited} />
                    </div>

                    {isFull && (
                        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                            <DetailSection icon={DollarSign} title="Payroll History" badge="Financial Sync">
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
                                                        <p className="text-sm font-bold text-white uppercase italic">Audit ID: {py._id.toString().slice(-6)}</p>
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
                                    <div className="py-10 text-center opacity-40 italic">No payroll transmissions archived.</div>
                                )}
                            </DetailSection>

                            <DetailSection icon={Zap} title="Institutional Matrix" badge="Assigned Classes">
                                {data.classes?.length > 0 ? (
                                    <div className="grid grid-cols-2 gap-4">
                                        {data.classes.map((cls, i) => (
                                            <div key={i} className="p-5 rounded-xl bg-slate-950/50 border border-brand-primary/20 flex flex-col items-center gap-3 group hover:bg-brand-primary/10 transition-all">
                                                <div className="w-12 h-12 rounded-xl bg-slate-900 border border-white/5 flex items-center justify-center text-brand-primary">
                                                    <Building2 size={24} />
                                                </div>
                                                <div className="text-center">
                                                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Section Node</p>
                                                    <p className="text-sm font-black text-white uppercase italic">{cls.standardId?.level || ''}-{cls.sectionLabel}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="py-10 text-center opacity-40 italic">No sector oversight assigned.</div>
                                )}
                            </DetailSection>

                            <DetailSection icon={Clock} title="Time Allocations" badge="Weekly Timetable">
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
                                        <button className="w-full py-3 text-[9px] font-black uppercase text-slate-500 hover:text-white transition-all tracking-[0.3em] italic border-t border-white/5 mt-4">View Complete Matrix Index</button>
                                    </div>
                                ) : (
                                    <div className="py-10 text-center opacity-40 italic">No instructional schedules synchronized.</div>
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
                        <Users size={16} /> Institutional Dependents
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
                            <p className="text-sm text-slate-600 italic font-medium tracking-wide">No dependent nodes localized in this registry sector.</p>
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
                        <ProfileField icon={SectorIcon} label="Assigned Sector" value={role} color="text-brand-primary" />
                        <ProfileField icon={Mail} label="Institutional Mail" value={data.email} />
                        <ProfileField icon={Calendar} label="Engagement Since" value={new Date(data.createdAt).toLocaleDateString()} />
                        <ProfileField icon={Shield} label="Access Status" value={data.status || 'Active HUB'} color="text-emerald-400" />
                    </div>
                    <div className="space-y-6">
                        <div className="bg-slate-950/40 border border-white/5 p-6 rounded-2xl">
                            <h5 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-4 italic">Sector Stats Matrix</h5>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="p-4 bg-slate-900/60 rounded-xl border border-brand-primary/10">
                                    <p className="text-[9px] font-black text-slate-600 uppercase mb-1">Status</p>
                                    <p className="text-sm font-black text-brand-primary italic">OPERATIONAL</p>
                                </div>
                                <div className="p-4 bg-slate-900/60 rounded-xl border border-white/5">
                                    <p className="text-[9px] font-black text-slate-600 uppercase mb-1">Clearance</p>
                                    <p className="text-sm font-black text-white italic">LV-4 SYNC</p>
                                </div>
                            </div>
                        </div>
                        {isSchoolAdmin && role === 'Accountant' && (
                            <button className="w-full py-4 bg-brand-primary text-black rounded-xl text-[10px] font-black uppercase tracking-widest hover:rotate-1 transition-all flex items-center justify-center gap-3">
                                <Wallet size={16} /> Audit Fiscal Ledger
                            </button>
                        )}
                        {isSchoolAdmin && role === 'Librarian' && (
                            <button className="w-full py-4 bg-indigo-500 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:rotate-1 transition-all flex items-center justify-center gap-3">
                                <BookOpen size={16} /> Inspect Archive Index
                            </button>
                        )}
                    </div>
                </div>
            );
        }

        return (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <ProfileField icon={Shield} label="Protocol-Defined Role" value={role} color="text-amber-400" />
                <ProfileField icon={Mail} label="Authenticated Terminal" value={data.email} />
                <ProfileField icon={Activity} label="Registry Status" value="Active Hub" color="text-emerald-400" />
                <ProfileField icon={Globe} label="Access Sector" value={data.schoolId?.name || 'Central Matrix'} />
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
                <p className="text-[14px] font-black text-white uppercase tracking-[0.5em] animate-pulse font-outfit">Synchronizing Node</p>
                <p className="text-[10px] text-slate-600 font-mono uppercase tracking-widest italic opacity-50">Identity Lookup: {id.slice(-12)}</p>
            </div>
        </div>
    );

    if (error) return (
        <div className="min-h-[70vh] flex flex-col items-center justify-center p-12 text-center max-w-2xl mx-auto">
            <div className="w-24 h-24 rounded-3xl bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-500 mb-10 shadow-3xl animate-bounce">
                <Shield size={48} />
            </div>
            <h2 className="text-3xl font-black uppercase text-white tracking-tighter mb-6 italic font-outfit">Security Protocol Restriction</h2>
            <div className="p-6 rounded-xl bg-slate-900/60 border border-red-500/20 mb-10">
                <p className="text-slate-400 text-sm font-medium leading-relaxed italic">"{error}"</p>
            </div>
            <button 
                onClick={() => navigate(-1)}
                className="group flex items-center gap-4 px-10 py-5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl font-black text-[12px] uppercase tracking-[0.3em] transition-all border border-slate-700 shadow-2xl active:scale-95"
            >
                <ArrowLeft size={18} className="group-hover:-translate-x-2 transition-transform" />
                Return to previous sector
            </button>
        </div>
    );

    const access = hasPermission(profile.role);
    const isOwner = currentUser?._id === id;
    const isFull = access === 'full';
    const isSchoolAdmin = currentUser?.role === 'School_Admin';

    const data = profile.data;
    const role = profile.role;

    // Derived Stats for the Hero Grid
    const getStats = () => {
        if (role === 'Student') {
            return [
                { label: 'Attendance', value: `${data.attendance?.length > 0 ? Math.round((data.attendance.filter(a => a.status === 'Present').length / data.attendance.length) * 100) : 0}%`, icon: Clock, color: 'text-emerald-400', bg: 'bg-emerald-400/10' },
                { label: 'Avg Grade', value: `${data.results?.length > 0 ? Math.round(data.results.reduce((acc, r) => acc + (r.marksObtained / (r.examId?.maxMarks || 100)), 0) / data.results.length * 100) : 0}%`, icon: Award, color: 'text-indigo-400', bg: 'bg-indigo-400/10' },
                { label: 'Fee Status', value: data.fees?.every(f => f.status === 'paid') ? 'Cleared' : 'Pending', icon: DollarSign, color: data.fees?.every(f => f.status === 'paid') ? 'text-emerald-400' : 'text-amber-400', bg: 'bg-slate-900/60' },
                { label: 'Avg Attendance', value: `${data.attendance?.filter(a => a.status === 'Present').length || 0} / ${data.attendance?.length || 0}`, icon: BarChart3, color: 'text-purple-400', bg: 'bg-slate-900/60' },
            ];
        }
        if (role === 'Teacher') {
            return [
                { label: 'Base Salary', value: `₹${(data.baseSalary || 0).toLocaleString()}`, icon: DollarSign, color: 'text-emerald-400', bg: 'bg-emerald-400/10' },
                { label: 'Assigned Classes', value: data.classes?.length || 0, icon: LayoutGrid, color: 'text-indigo-400', bg: 'bg-indigo-400/10' },
                { label: 'Attendance', value: `${data.attendance?.length > 0 ? Math.round((data.attendance.filter(a => a.status === 'Present').length / data.attendance.length) * 100) : 0}%`, icon: Clock, color: 'text-purple-400', bg: 'bg-slate-900/60' },
                { label: 'Status', value: data.isActive ? 'Active Node' : 'Suspended', icon: Zap, color: data.isActive ? 'text-emerald-400' : 'text-red-400', bg: 'bg-slate-900/60' },
            ];
        }
        return [
            { label: 'Registry Status', value: 'Active Hub', icon: Activity, color: 'text-emerald-400', bg: 'bg-emerald-400/10' },
            { label: 'Clearance', value: 'LV-4 SYNC', icon: Shield, color: 'text-indigo-400', bg: 'bg-indigo-400/10' },
            { label: 'Origin', value: data.schoolId?.name?.split(' ')[0] || 'CENTRAL', icon: Globe, color: 'text-purple-400', bg: 'bg-slate-900/60' },
            { label: 'Signal', value: 'Optimal', icon: Zap, color: 'text-amber-400', bg: 'bg-slate-900/60' },
        ];
    };

    const stats = getStats();

    const getTabs = () => {
        const base = [{ id: 'overview', label: 'Identity Overview', icon: User }];
        if (role === 'Student') {
            return [
                ...base,
                { id: 'academic', label: 'Academic Performance', icon: Award },
                { id: 'attendance', label: 'Attendance Logs', icon: Clock },
                { id: 'financial', label: 'Financial Ledger', icon: DollarSign },
            ];
        }
        if (role === 'Teacher') {
            return [
                ...base,
                { id: 'professional', label: 'Instructional Matrix', icon: Briefcase },
                { id: 'attendance', label: 'Attendance Logs', icon: Clock },
                { id: 'financial', label: 'Payroll Ledger', icon: DollarSign },
            ];
        }
        return base;
    };

    const tabs = getTabs();

    return (
        <div className="max-w-7xl mx-auto space-y-8 pb-20 font-inter text-slate-100 antialiased p-4">
            {/* Header Identity Bar */}
            <div className="flex items-center gap-4">
                <button 
                    onClick={() => navigate(-1)}
                    className="p-3 bg-slate-900/60 hover:bg-slate-800 border border-white/5 rounded-xl text-slate-400 hover:text-white transition-all shadow-2xl active:scale-95"
                >
                    <ArrowLeft size={18} />
                </button>
                <div>
                    <h1 className="text-3xl font-black uppercase tracking-tighter font-outfit text-white leading-none">
                        {role} <span className="text-brand-primary">Intelligence Registry</span>
                    </h1>
                    <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 mt-1 italic">
                        UID: <span className="font-mono text-slate-600">{id}</span>
                    </p>
                </div>
            </div>

            {/* Hero Hub - Info + Stats Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main Identity Card */}
                <div className="lg:col-span-2 bg-slate-900/40 backdrop-blur-3xl border border-white/5 rounded-2xl p-8 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-brand-primary/5 rounded-full blur-3xl -mr-32 -mt-32 transition-all group-hover:bg-brand-primary/10" />
                    <div className="relative flex flex-col md:flex-row gap-8 items-start">
                        <div className="relative isolate">
                            <img 
                                src={data.photo ? (data.photo.startsWith('http') ? data.photo : `${BASE_URL.replace('/api', '')}/${data.photo}`) : `https://ui-avatars.com/api/?name=${data.firstName}+${data.lastName}&background=0f172a&color=0ea5e9&size=400`}
                                className="w-32 h-32 md:w-40 md:h-40 rounded-2xl object-cover border-2 border-white/10 shadow-2xl group-hover:scale-105 transition-transform duration-700"
                                alt="Profile"
                            />
                            <div className="absolute -bottom-2 -left-2 right-2 bg-brand-primary px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest text-center shadow-lg border border-white/10">
                                Active {role}
                            </div>
                        </div>
                        <div className="flex-1 space-y-6">
                            <div>
                                <h2 className="text-4xl font-black uppercase tracking-tighter text-white mb-1 font-outfit italic">
                                    {data.firstName} <span className="text-brand-primary">{data.lastName}</span>
                                </h2>
                                <p className="text-brand-primary font-black uppercase tracking-[0.2em] text-[10px] bg-brand-primary/10 px-3 py-1 rounded inline-block border border-brand-primary/20">
                                    {role === 'Student' ? `Admission No: ${data.admissionNumber}` : `Employee ID: ${data.employeeId}`}
                                </p>
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-y-4 gap-x-8">
                                <ProfileField icon={GraduationCap} label={role === 'Student' ? "Academic Standard" : "Expertise Domain"} value={role === 'Student' ? `Grade ${data.standard?.level || 'N/A'}-${data.classSection?.sectionLabel || 'N/A'}` : (data.qualification || 'Certified Instructor')} />
                                <ProfileField icon={Calendar} label={role === 'Student' ? "Date of Birth" : "Engagement Date"} value={role === 'Student' ? moment(data.dateOfBirth).format('DD MMM YYYY') : moment(data.joiningDate).format('DD MMM YYYY')} />
                                <ProfileField icon={Mail} label="Institutional Mail" value={data?.parentId?.email || 'No email synced'} />
                                <ProfileField icon={Phone} label="Emergency Uplink" value={role === 'Student' ? data.guardianPhone : data.phone} />
                                <div className="md:col-span-2">
                                    <ProfileField icon={MapPin} label="Localized Coordinates" value={data.address || 'Address encryption active'} />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Real-time Telemetry Stats Grid */}
                <div className="grid grid-cols-2 gap-4">
                    {stats.map((stat, i) => (
                        <div key={i} className="bg-slate-900/40 backdrop-blur-xl border border-white/5 rounded-2xl p-6 flex flex-col justify-between group hover:border-brand-primary/40 transition-all shadow-xl">
                            <div className={`w-10 h-10 rounded-xl ${stat.bg} ${stat.color} flex items-center justify-center group-hover:scale-110 transition-transform shadow-lg border border-white/5`}>
                                <stat.icon size={18} />
                            </div>
                            <div>
                                <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1 italic">{stat.label}</p>
                                <p className="text-2xl font-black text-white font-outfit truncate">{stat.value}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Navigation Tabs Matrix */}
            <div className="flex items-center gap-2 bg-slate-950/40 p-1.5 rounded-2xl border border-white/5 w-fit shadow-2xl overflow-hidden backdrop-blur-2xl">
                {tabs.map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`flex items-center gap-3 px-8 py-3 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] transition-all relative italic
                            ${activeTab === tab.id ? 'bg-brand-primary text-black shadow-lg shadow-brand-primary/20 scale-[1.02]' : 'text-slate-500 hover:text-slate-300 hover:bg-white/5'}`}
                    >
                        <tab.icon size={14} />
                        {tab.label}
                        {activeTab === tab.id && <motion.div layoutId="tab-underline" className="absolute inset-0 bg-white/10 rounded-xl" />}
                    </button>
                ))}
            </div>

            {/* Tab Contents - Intelligence Sectors */}
            <AnimatePresence mode="wait">
                <motion.div
                    key={activeTab}
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -15 }}
                    transition={{ duration: 0.3 }}
                >
                    {activeTab === 'overview' && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            {/* Role-specific Detail Matrix */}
                            <div className="bg-slate-900/40 backdrop-blur-xl border border-white/5 rounded-2xl p-8">
                                <h3 className="text-sm font-black uppercase tracking-[0.3em] text-slate-400 border-b border-white/5 pb-5 mb-8 flex items-center gap-4 italic">
                                    <User size={18} className="text-brand-primary" /> 
                                    {role === 'Student' ? 'Guardian Metadata' : 'Professional Dossier'}
                                </h3>
                                <div className="space-y-8">
                                    {role === 'Student' ? (
                                        <div className="grid grid-cols-1 gap-8">
                                            <ProfileField icon={UserCircle} label="Primary Guardian" value={data.guardianName} />
                                            <ProfileField icon={Mail} label="Guardian Mail Origin" value={data.guardianEmail} />
                                            <ProfileField icon={Phone} label="Emergency Uplink" value={data.guardianPhone} />
                                            <ProfileField icon={Award} label="Scholarship Tier" value={`${data.scholarshipPercentage}% Waiver Applied`} color="text-amber-400" />
                                        </div>
                                    ) : (
                                        <div className="grid grid-cols-1 gap-8">
                                            <ProfileField icon={Briefcase} label="Institutional Seniority" value={moment(data.joiningDate).fromNow(true)} />
                                            <ProfileField icon={Globe} label="Neural Expertise" value={data.qualification} />
                                            <ProfileField icon={Clock} label="Load Factor" value={`${data.classes?.length || 0} Sectors Assigned`} />
                                            <ProfileField icon={DollarSign} label="Registry Base Salary" value={`₹${(data.baseSalary || 0).toLocaleString()}`} color="text-emerald-400" />
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Directives & Controls */}
                            <div className="bg-slate-900/40 backdrop-blur-xl border border-white/5 rounded-2xl p-8">
                                <h3 className="text-sm font-black uppercase tracking-[0.3em] text-slate-400 border-b border-white/5 pb-5 mb-8 flex items-center gap-4 italic">
                                    <Zap size={18} className="text-brand-primary animate-pulse" /> System Directives
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
                                                    <p className="text-xs font-black uppercase tracking-widest text-white italic">Generate Academic Summary</p>
                                                    <p className="text-[10px] text-slate-500 font-medium lowercase">Export PDF Report Ledger</p>
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
                                                    <p className="text-xs font-black uppercase tracking-widest text-white italic">Initialize Direct Uplink</p>
                                                    <p className="text-[10px] text-slate-500 font-medium lowercase">Encrypted Communication Node</p>
                                                </div>
                                            </div>
                                            <ChevronRight size={18} className="text-slate-800 group-hover:text-white transition-colors" />
                                        </button>
                                    )}
                                    <div className="p-5 bg-brand-primary/5 border border-brand-primary/10 rounded-2xl">
                                        <p className="text-[10px] text-brand-primary leading-relaxed font-black uppercase tracking-widest italic opacity-60">
                                            Institutional directive: Access to this identity node is logged via central matrix security protocols.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {(activeTab === 'academic' || activeTab === 'professional') && (
                        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                            <DetailSection icon={BarChart3} title={role === 'Student' ? "Performance Analytics" : "Instructional Matrix"} badge="Registry Records">
                                {role === 'Student' ? (
                                    data.results?.length > 0 ? (
                                        <div className="space-y-4">
                                            {data.results.map((res, i) => (
                                                <div key={i} className="flex items-center justify-between p-5 rounded-2xl bg-slate-950/40 border border-white/5 hover:bg-slate-950/60 transition-all group">
                                                    <div className="flex items-center gap-5">
                                                        <div className="w-12 h-12 rounded-xl bg-slate-900 border border-white/5 flex items-center justify-center text-slate-500 group-hover:text-brand-primary transition-colors shadow-lg">
                                                            <Award size={22} />
                                                        </div>
                                                        <div>
                                                            <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest italic">{res.examId?.name}</p>
                                                            <p className="text-sm font-bold text-white uppercase italic tracking-tight">{res.examId?.subject?.name || 'Institutional Subject'}</p>
                                                        </div>
                                                    </div>
                                                    <div className="text-right">
                                                        <p className="text-xl font-black text-brand-primary leading-none mb-1 shadow-sm italic">{res.marksObtained}/{res.examId?.maxMarks || 100}</p>
                                                        <p className="text-[9px] font-black text-slate-600 uppercase tracking-widest italic">{Math.round((res.marksObtained/(res.examId?.maxMarks || 100))*100)}% PROFICIENCY</p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="py-20 text-center opacity-30 italic uppercase tracking-[0.3em] font-black text-xs">No data localized.</div>
                                    )
                                ) : (
                                    data.classes?.length > 0 ? (
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                            {data.classes.map((cls, i) => (
                                                <div key={i} className="p-6 rounded-2xl bg-slate-950/60 border border-brand-primary/10 flex flex-col items-center gap-4 group hover:bg-brand-primary/5 transition-all shadow-xl">
                                                    <div className="w-14 h-14 rounded-2xl bg-slate-900 border border-white/5 flex items-center justify-center text-brand-primary group-hover:scale-110 transition-transform shadow-inner">
                                                        <LayoutGrid size={28} />
                                                    </div>
                                                    <div className="text-center">
                                                        <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest mb-1 italic">Sector Node</p>
                                                        <p className="text-base font-black text-white uppercase italic tracking-tighter">Grade {cls.standardId?.level || ''}-{cls.sectionLabel}</p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="py-20 text-center opacity-30 italic uppercase tracking-[0.3em] font-black text-xs">No sectors assigned.</div>
                                    )
                                )}
                            </DetailSection>

                            <DetailSection icon={Clock} title="Time Allocations" badge="Weekly Timetable">
                                {data.timetable?.length > 0 ? (
                                    <div className="space-y-4">
                                        {data.timetable.slice(0, 10).map((tt, i) => (
                                            <div key={i} className="flex items-center justify-between p-5 rounded-2xl bg-slate-950/40 border border-white/5 hover:bg-slate-950/60 transition-all border-l-4 border-l-indigo-500 shadow-lg">
                                                <div className="flex items-center gap-5">
                                                    <div className="w-12 h-12 rounded-xl bg-indigo-500/10 border border-indigo-400/20 text-indigo-400 flex items-center justify-center shadow-inner">
                                                        <Clock size={20} />
                                                    </div>
                                                    <div>
                                                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest italic">{tt.day}</p>
                                                        <p className="text-sm font-black text-white uppercase italic tracking-tighter">
                                                            {tt.courseId?.name || tt.subjectId?.name} // {tt.classId?.sectionLabel || tt.teacherId?.name || 'MASTER NODE'}
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
                                    <div className="py-20 text-center opacity-30 italic uppercase tracking-[0.3em] font-black text-[10px]">No schedules synchronized in registry.</div>
                                )}
                            </DetailSection>
                        </div>
                    )}

                    {activeTab === 'attendance' && (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            <div className="md:col-span-2">
                                <DetailSection icon={CalendarDays} title="Presence Registry Logs" badge="90-Day Analysis">
                                    {data.attendance?.length > 0 ? (
                                        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                                            {data.attendance.map((att, i) => (
                                                <div key={i} className={`p-4 rounded-2xl border flex flex-col items-center gap-2 transition-all shadow-xl backdrop-blur-3xl ${att.status === 'Present' ? 'bg-emerald-500/5 border-emerald-500/20 text-emerald-400' : 'bg-red-500/5 border-red-500/20 text-red-400'}`}>
                                                    <p className="text-[10px] font-black uppercase opacity-60 font-mono tracking-tighter italic">{moment(att.date).format('DD MMMM')}</p>
                                                    <div className="flex items-center gap-2">
                                                        {att.status === 'Present' ? <CheckCircle size={14} /> : <XCircle size={14} />}
                                                        <span className="text-[10px] font-black uppercase tracking-widest">{att.status}</span>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="py-24 text-center opacity-30 italic uppercase tracking-[0.3em] font-black text-xs">No telemetry detected.</div>
                                    )}
                                </DetailSection>
                            </div>
                            <div className="space-y-6">
                                <div className="bg-slate-900/40 backdrop-blur-xl border border-white/5 rounded-2xl p-8 shadow-2xl">
                                    <h4 className="text-[11px] font-black uppercase tracking-[0.4em] text-slate-500 mb-8 italic">Telemetry Balance</h4>
                                    <div className="space-y-8">
                                        <div>
                                            <div className="flex justify-between mb-3">
                                                <span className="text-xs font-black text-slate-400 uppercase italic">Signal Strength (Present)</span>
                                                <span className="text-xs font-black text-emerald-400 italic">{(data.attendance?.filter(a => a.status === 'Present').length / (data.attendance?.length || 1) * 100).toFixed(1)}%</span>
                                            </div>
                                            <div className="h-3 w-full bg-slate-950 rounded-full overflow-hidden p-0.5 border border-white/5">
                                                <motion.div 
                                                    initial={{ width: 0 }}
                                                    animate={{ width: `${(data.attendance?.filter(a => a.status === 'Present').length / (data.attendance?.length || 1) * 100)}%` }}
                                                    className="h-full bg-emerald-500 rounded-full shadow-[0_0_20px_rgba(16,185,129,0.3)]"
                                                />
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="p-4 rounded-xl bg-slate-950/60 border border-white/5">
                                                <p className="text-[10px] font-black text-slate-600 uppercase mb-1 italic">Absents</p>
                                                <p className="text-xl font-black text-red-500 italic">{data.attendance?.filter(a => a.status === 'Absent').length}</p>
                                            </div>
                                            <div className="p-4 rounded-xl bg-slate-950/60 border border-white/5">
                                                <p className="text-[10px] font-black text-slate-600 uppercase mb-1 italic">Presents</p>
                                                <p className="text-xl font-black text-emerald-500 italic">{data.attendance?.filter(a => a.status === 'Present').length}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'financial' && (
                        <DetailSection icon={DollarSign} title={role === 'Student' ? "Financial Ledger Matrix" : "Professional Payroll Archive"} badge="Ledger Index">
                            {role === 'Student' ? (
                                data.fees?.length > 0 ? (
                                    <div className="bg-slate-950/40 border border-white/5 rounded-2xl overflow-hidden shadow-2xl backdrop-blur-3xl">
                                        <table className="w-full text-left">
                                            <thead>
                                                <tr className="bg-white/5 border-b border-white/5">
                                                    <th className="px-8 py-5 text-[10px] font-black text-slate-500 uppercase tracking-widest italic">Component Node</th>
                                                    <th className="px-8 py-5 text-[10px] font-black text-slate-500 uppercase tracking-widest italic">Allocation</th>
                                                    <th className="px-8 py-5 text-[10px] font-black text-slate-500 uppercase tracking-widest italic text-center">Ledger Balance</th>
                                                    <th className="px-8 py-5 text-[10px] font-black text-slate-500 uppercase tracking-widest italic text-center">Status Index</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-white/5">
                                                {data.fees.map((f, i) => (
                                                    <tr key={i} className="hover:bg-white/5 transition-all group">
                                                        <td className="px-8 py-6">
                                                            <p className="text-sm font-black text-white uppercase italic tracking-tighter">{f.category || 'Institutional Fee'}</p>
                                                            <p className="text-[9px] font-black text-slate-500 uppercase tracking-[0.2em] mt-1">Audit Code: {f._id.slice(-8).toUpperCase()}</p>
                                                        </td>
                                                        <td className="px-8 py-6">
                                                            <p className="text-xs font-black text-slate-400 italic mb-1 uppercase tracking-widest">{f.dueDate ? moment(f.dueDate).format('DD MMM YYYY') : 'SYNC PENDING'}</p>
                                                            <div className="h-1.5 w-32 bg-slate-800 rounded-full overflow-hidden border border-white/5">
                                                                <div className="h-full bg-brand-primary shadow-[0_0_10px_rgba(14,165,233,0.3)]" style={{ width: `${Math.min(100, (f.paidAmount/(f.totalAmount || 1))*100)}%` }} />
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
                                    <div className="py-24 text-center opacity-30 italic uppercase tracking-[0.3em] font-black text-xs">No financial records detected.</div>
                                )
                            ) : (
                                data.salary?.length > 0 ? (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        {data.salary.map((py, i) => (
                                            <div key={i} className="flex items-center justify-between p-6 rounded-2xl bg-slate-950/60 border border-white/5 hover:bg-emerald-500/5 transition-all group shadow-xl">
                                                <div className="flex items-center gap-6">
                                                    <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 group-hover:scale-110 transition-transform shadow-inner">
                                                        <Wallet size={24} />
                                                    </div>
                                                    <div>
                                                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest italic mb-1">{moment(py.paidAt).format('MMMM YYYY')}</p>
                                                        <p className="text-base font-black text-white italic tracking-tighter uppercase">Disbursement Sync</p>
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <p className="text-2xl font-black text-emerald-400 italic shadow-sm tracking-tighter">₹{py.netSalary.toLocaleString()}</p>
                                                    <span className="text-[9px] font-black text-slate-700 uppercase tracking-widest italic">Confirmed Cycle</span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="py-24 text-center opacity-30 italic uppercase tracking-[0.3em] font-black text-xs">No payroll disbursements localized.</div>
                                )
                            )}
                        </DetailSection>
                    )}
                </motion.div>
            </AnimatePresence>

            {/* Forensic Metadata Sector */}
            {(isSchoolAdmin || currentUser.role === 'Super_Admin') && (
                <div className="mt-20 pt-16 border-t border-white/10 relative isolate">
                    <div className="flex items-center gap-4 mb-12">
                        <div className="w-10 h-10 rounded-xl bg-slate-900 border border-white/10 flex items-center justify-center text-brand-primary">
                            <Shield size={18} />
                        </div>
                        <div>
                            <h4 className="text-sm font-black text-white uppercase tracking-[0.4em] italic leading-none mb-1">Institutional Audit Metadata</h4>
                            <p className="text-[9px] font-bold text-slate-600 uppercase tracking-widest italic">Encrypted Registry Forensic Logs</p>
                        </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                        {[
                            { label: 'Platform Logic ID', val: data._id, icon: Zap },
                            { label: 'Last Signal Pulse', val: moment().format('HH:mm:ss [UTC]'), icon: Activity },
                            { label: 'Access Encryption', val: access.toUpperCase() + ' // HUB-SYNC', icon: Shield },
                            { label: 'Registry Date', val: moment(data.createdAt).format('DD MMM YYYY'), icon: FileText }
                        ].map((meta, i) => (
                            <div key={i} className="space-y-3 group p-6 rounded-2xl bg-slate-950/40 border border-white/5 hover:border-brand-primary/20 transition-all shadow-xl">
                                <p className="text-[9px] font-black text-slate-600 uppercase tracking-widest flex items-center gap-3 italic group-hover:text-brand-primary transition-colors">
                                    <meta.icon size={12} /> {meta.label}
                                </p>
                                <p className="text-xs font-mono font-bold text-slate-300 truncate tracking-tight">{meta.val}</p>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default ProfileDetail;
