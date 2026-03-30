import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { fetchStaffForAttendance, saveStaffAttendance, fetchStaffAttendance, fetchStaffMonthlySummary } from '../../redux/slice/schoolAdmin.slice';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    Calendar as CalendarIcon, Users, CheckCircle, XCircle, Clock, Save, 
    Search, Filter, ChevronLeft, ChevronRight, AlertCircle,
    UserCheck, FileText, Send, UserCircle, ArrowLeft, MoreHorizontal
} from 'lucide-react';
import moment from 'moment';
import toast from 'react-hot-toast';

const StaffAttendance = () => {
    const dispatch = useDispatch();
    const { staffList, loading, staffAttendance, staffMonthlySummary } = useSelector((state) => state.schoolAdmin);
    const [view, setView] = useState('calendar'); // 'calendar' or 'records'
    const [selectedDate, setSelectedDate] = useState(moment().format('YYYY-MM-DD'));
    const [currentMonth, setCurrentMonth] = useState(moment());
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedRole, setSelectedRole] = useState('All');
    const [localRecords, setLocalRecords] = useState([]);
    const [isEditing, setIsEditing] = useState(false);

    useEffect(() => {
        dispatch(fetchStaffForAttendance());
    }, [dispatch]);

    useEffect(() => {
        const startOfMonth = currentMonth.clone().startOf('month').format('YYYY-MM-DD');
        const endOfMonth = currentMonth.clone().endOf('month').format('YYYY-MM-DD');
        dispatch(fetchStaffMonthlySummary({ startDate: startOfMonth, endDate: endOfMonth }));
    }, [dispatch, currentMonth]);

    useEffect(() => {
        if (view === 'records') {
            dispatch(fetchStaffAttendance({ date: selectedDate }));
        }
    }, [dispatch, selectedDate, view]);

    useEffect(() => {
        // Build unified list from staffList and staffAttendance
        const teachers = (staffList.teachers || []).map(t => ({ ...t, role: 'Teacher', type: 'teacher' }));
        const others = (staffList.otherStaff || []).map(s => ({ ...s, type: 'user' }));
        const drivers = (staffList.drivers || []).map(d => ({ ...d, firstName: d.name, lastName: '', role: 'Driver', type: 'driver', employeeId: d.licenseNumber }));
        const allStaff = [...teachers, ...others, ...drivers];

        const records = allStaff.map(staff => {
            const existing = staffAttendance.find(a => 
                (a.teacherId?._id || a.teacherId) === staff._id || 
                (a.userId?._id || a.userId) === staff._id ||
                (a.driverId?._id || a.driverId) === staff._id
            );
            return {
                _id: staff._id,
                firstName: staff.firstName,
                lastName: staff.lastName,
                role: staff.role,
                employeeId: staff.employeeId || 'STF-' + staff._id.slice(-4),
                status: existing?.status || 'Present',
                arrivalTime: existing?.arrivalTime || '09:00',
                departureTime: existing?.departureTime || '17:00',
                remarks: existing?.remarks || '',
                type: staff.type
            };
        });
        setLocalRecords(records);
        if (!loading) {
            if (staffAttendance.length > 0) setIsEditing(false);
            else setIsEditing(true); 
        }
    }, [staffList, staffAttendance, loading]);

    const handleDateClick = (date) => {
        const formattedDate = date.format('YYYY-MM-DD');
        setSelectedDate(formattedDate);
        // Check monthly summary to decide initial edit mode
        const isAlreadyMarked = staffMonthlySummary.some(s => moment(s.date).format('YYYY-MM-DD') === formattedDate);
        setIsEditing(!isAlreadyMarked);
        setView('records');
    };


    const handleStatusChange = (id, status) => {
        setLocalRecords(prev => prev.map(r => r._id === id ? { ...r, status } : r));
    };

    const handleTimeChange = (id, field, value) => {
        setLocalRecords(prev => prev.map(r => r._id === id ? { ...r, [field]: value } : r));
    };

    const handleSave = async () => {
        const records = localRecords.map(r => ({
            ...(r.type === 'teacher' ? { teacherId: r._id } : r.type === 'driver' ? { driverId: r._id } : { userId: r._id }),
            status: r.status,
            arrivalTime: r.arrivalTime,
            departureTime: r.departureTime,
            remarks: r.remarks
        }));

        const res = await dispatch(saveStaffAttendance({ records, date: selectedDate }));
        if (saveStaffAttendance.fulfilled.match(res)) {
            toast.success('Workforce Registry Synchronized');
            setIsEditing(false);
            // Refresh monthly summary
            const startOfMonth = currentMonth.clone().startOf('month').format('YYYY-MM-DD');
            const endOfMonth = currentMonth.clone().endOf('month').format('YYYY-MM-DD');
            dispatch(fetchStaffMonthlySummary({ startDate: startOfMonth, endDate: endOfMonth }));
        }
    };

    const renderCalendar = () => {
        const startDay = currentMonth.clone().startOf('month').startOf('week');
        const endDay = currentMonth.clone().endOf('month').endOf('week');
        const day = startDay.clone().subtract(1, 'day');
        const calendar = [];

        while (day.isBefore(endDay, 'day')) {
            calendar.push(
                Array(7).fill(0).map(() => day.add(1, 'day').clone())
            );
        }

        return (
            <div className="bg-slate-900/40 backdrop-blur-3xl border border-white/5 rounded-[2rem] overflow-hidden p-8 shadow-2xl">
                <div className="flex items-center justify-between mb-12">
                    <div className="flex items-center gap-6">
                        <div className="w-16 h-16 rounded-2xl bg-schooladmin-primary/10 border border-schooladmin-primary/20 flex items-center justify-center text-schooladmin-primary shadow-lg shadow-schooladmin-primary/5">
                            <CalendarIcon size={32} />
                        </div>
                        <div>
                            <h2 className="text-4xl font-black text-white tracking-tighter uppercase italic">{currentMonth.format('MMMM YYYY')}</h2>
                            <p className="text-xs font-bold text-slate-500 uppercase tracking-[0.3em] font-mono mt-1">Operational Presence Interface</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2 bg-slate-950 p-2 rounded-2xl border border-white/5 shadow-inner">
                        <button 
                            onClick={() => setCurrentMonth(currentMonth.clone().subtract(1, 'month'))}
                            className="p-3 hover:bg-white/5 rounded-xl transition-all text-slate-400 hover:text-white"
                        >
                            <ChevronLeft size={24} />
                        </button>
                        <button 
                            onClick={() => setCurrentMonth(moment())}
                            className="px-8 py-3 bg-white/5 hover:bg-white/10 rounded-xl text-xs font-black uppercase text-white transition-all tracking-widest"
                        >
                            Reset
                        </button>
                        <button 
                            onClick={() => setCurrentMonth(currentMonth.clone().add(1, 'month'))}
                            className="p-3 hover:bg-white/5 rounded-xl transition-all text-slate-400 hover:text-white"
                        >
                            <ChevronRight size={24} />
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-7 gap-6 mb-4">
                    {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
                        <div key={d} className="text-center text-xs font-black uppercase tracking-[0.4em] text-slate-600 pb-4">{d}</div>
                    ))}
                </div>

                <div className="grid grid-cols-7 gap-6">
                    {calendar.flat().map((date, i) => {
                        const isCurrentMonth = date.month() === currentMonth.month();
                        const isToday = date.isSame(moment(), 'day');
                        const isSelected = date.isSame(moment(selectedDate), 'day');
                        
                        // Check if attendance is marked for this day
                        const markedData = staffMonthlySummary.find(s => moment(s.date).format('YYYY-MM-DD') === date.format('YYYY-MM-DD'));

                        const isMarked = markedData?.marked;

                        return (
                                <motion.div 
                                    key={i} 
                                    whileHover={isCurrentMonth ? { scale: 1.02, y: -4 } : {}}
                                    whileTap={isCurrentMonth ? { scale: 0.98 } : {}}
                                    onClick={() => isCurrentMonth && handleDateClick(date)} 
                                    className={`relative aspect-square rounded-[2rem] p-6 cursor-pointer transition-all duration-500 group border flex flex-col items-center justify-center overflow-hidden 
                                        ${!isCurrentMonth ? 'opacity-10 pointer-events-none' : ''} 
                                        ${isToday ? 'bg-schooladmin-primary/10 border-schooladmin-primary/30 shadow-2xl shadow-schooladmin-primary/10' : 'bg-slate-950/40 border-white/5 hover:border-schooladmin-primary/40'} 
                                        ${isMarked ? 'bg-emerald-500/[0.03] border-emerald-500/20' : ''}`}
                                >
                                    {/* Small Date Indicator at Top */}
                                    <span className={`absolute top-6 left-8 text-sm font-black italic tracking-tighter transition-colors duration-500
                                        ${isToday ? 'text-schooladmin-primary' : 'text-slate-600 group-hover:text-white'} 
                                        ${isMarked ? 'text-emerald-500/40' : ''}`}>
                                        {date.date()}
                                    </span>

                                    <div className="relative z-10 flex flex-col items-center gap-3">
                                        {isMarked ? (
                                            <>
                                                <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 shadow-lg shadow-emerald-500/10 mb-1">
                                                    <CheckCircle size={24} />
                                                </div>
                                                <div className="flex flex-col items-center">
                                                    <div className="text-[10px] font-black text-emerald-400 tracking-[0.2em] uppercase">Done</div>
                                                    <div className="text-[8px] font-bold text-emerald-500/40 uppercase tracking-[0.1em] mt-0.5">Registry Stable</div>
                                                </div>
                                            </>
                                        ) : (
                                            <>
                                                <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/5 flex items-center justify-center text-slate-700 group-hover:text-slate-400 transition-colors duration-500 mb-1">
                                                    <Users size={24} />
                                                </div>
                                                <div className="text-[10px] font-black text-slate-700 group-hover:text-slate-500 transition-colors duration-500 tracking-[0.2em] uppercase">Pending</div>
                                            </>
                                        )}
                                    </div>

                                    {/* Pulse Indicator for Today */}
                                    {isToday && (
                                        <div className="absolute top-6 right-8">
                                            <div className="w-2 h-2 rounded-full bg-schooladmin-primary shadow-[0_0_15px_#2563eb] animate-pulse" />
                                        </div>
                                    )}
                                </motion.div>
                        );
                    })}
                </div>
            </div>
        );
    };

    const stats = {
        total: localRecords.length,
        present: localRecords.filter(r => r.status === 'Present').length,
        absent: localRecords.filter(r => r.status === 'Absent').length,
        late: localRecords.filter(r => r.status === 'Late').length
    };

    const filteredRecords = localRecords.filter(r => {
        const matchesSearch = `${r.firstName} ${r.lastName}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
                             r.employeeId?.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesRole = selectedRole === 'All' || r.role === selectedRole;
        return matchesSearch && matchesRole;
    });

    return (
        <div className="space-y-8 font-outfit">
            <AnimatePresence mode="wait">
                {view === 'calendar' ? (
                    <motion.div 
                        key="calendar"
                        initial={{ opacity: 0, scale: 0.98 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 1.02 }}
                        transition={{ duration: 0.4 }}
                    >
                        <div className="flex items-center justify-between mb-8">
                            <div>
                                <h1 className="text-4xl font-black uppercase tracking-tighter text-white">Workforce Presence</h1>
                                <p className="text-slate-500 text-sm font-bold uppercase tracking-widest mt-1 italic">Monthly Attendance Oversight & Signal Mapping</p>
                            </div>
                            <div className="flex items-center gap-4">
                                <Link to="/school-admin/payroll" className="px-6 py-3 bg-white/5 hover:bg-white/10 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] text-white border border-white/5 transition-all">
                                    Financial Sync
                                </Link>
                            </div>
                        </div>
                        {renderCalendar()}
                    </motion.div>
                ) : (
                    <motion.div 
                        key="records"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className="space-y-8"
                    >
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                            <div className="flex items-center gap-6">
                                <button 
                                    onClick={() => setView('calendar')}
                                    className="p-4 bg-slate-900 hover:bg-slate-800 rounded-2xl text-schooladmin-primary border border-white/5 transition-all active:scale-95 shadow-lg shadow-black/20"
                                >
                                    <ArrowLeft size={24} />
                                </button>
                                <div>
                                    <h1 className="text-3xl font-black uppercase tracking-tighter text-white">Registry: {moment(selectedDate).format('DD MMM YYYY')}</h1>
                                    <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.3em] mt-1 italic">Active Signal Processing Mode</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                {isEditing ? (
                                    <button 
                                        onClick={handleSave} 
                                        disabled={loading}
                                        className="flex items-center gap-3 px-8 py-4 bg-schooladmin-primary text-slate-950 hover:bg-schooladmin-primary/90 disabled:opacity-50 rounded-2xl font-black text-xs uppercase tracking-[0.2em] transition-all shadow-xl shadow-schooladmin-primary/10 active:scale-95"
                                    >
                                        {loading ? <Clock className="animate-spin" size={16} /> : <Save size={16} />}
                                        Commit Changes
                                    </button>
                                ) : (
                                    <button 
                                        onClick={() => setIsEditing(true)}
                                        className="flex items-center gap-3 px-8 py-4 bg-slate-800 hover:bg-slate-700 text-white rounded-2xl font-black text-xs uppercase tracking-[0.2em] transition-all border border-white/10 active:scale-95"
                                    >
                                        <FileText size={16} className="text-schooladmin-primary" />
                                        Edit Attendance
                                    </button>

                                )}
                            </div>
                        </div>
                        <select 
                            value={selectedRole}
                            onChange={(e) => setSelectedRole(e.target.value)}
                            className="bg-slate-950/50 border border-white/5 px-4 rounded-xl text-xs font-black uppercase tracking-widest text-slate-400 outline-none focus:border-schooladmin-primary h-[48px]"
                        >
                            <option value="All">All Sectors</option>
                            <option value="Teacher">Academic</option>
                            <option value="Accountant">Financial</option>
                            <option value="Librarian">Archive</option>
                            <option value="Transport_Manager">Logistics Manager</option>
                            <option value="Driver">Drivers</option>
                        </select>
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                            {[
                                { label: 'Total Personnel', val: stats.total, icon: Users, color: 'text-schooladmin-primary', bg: 'bg-schooladmin-primary/5' },
                                { label: 'Signal Stable', val: stats.present, icon: CheckCircle, color: 'text-emerald-400', bg: 'bg-emerald-400/5' },
                                { label: 'Signal Lost', val: stats.absent, icon: XCircle, color: 'text-rose-400', bg: 'bg-rose-400/5' },
                                { label: 'Sync Delayed', val: stats.late, icon: Clock, color: 'text-amber-400', bg: 'bg-amber-400/5' },
                            ].map((s, i) => (
                                <div key={i} className="bg-slate-900/30 backdrop-blur-xl border border-white/5 rounded-[2rem] p-8 relative overflow-hidden group">
                                    <div className={`absolute top-0 right-0 w-32 h-32 ${s.bg} rounded-full blur-[60px] -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-1000 opacity-50`}></div>
                                    <div className="flex items-center gap-6 relative z-10">
                                        <div className={`w-16 h-16 rounded-2xl ${s.bg} flex items-center justify-center ${s.color} border border-white/10 shadow-lg shadow-black/20`}>
                                            <s.icon size={28} />
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 italic">{s.label}</p>
                                            <p className="text-3xl font-black text-white mt-1 font-mono tracking-tighter">{s.val}</p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="bg-slate-900/30 backdrop-blur-3xl border border-white/5 rounded-[2.5rem] overflow-hidden shadow-2xl">
                            <div className="p-8 border-b border-white/5 flex flex-col lg:flex-row lg:items-center justify-between gap-6 bg-slate-900/40">
                                <div className="flex flex-wrap items-center gap-6 flex-1">
                                    <div className="relative flex-1 max-w-lg">
                                        <Search size={18} className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-600" />
                                        <input 
                                            type="text" 
                                            placeholder="Search personnel directory..." 
                                            value={searchQuery}
                                            onChange={(e) => setSearchQuery(e.target.value)}
                                            className="w-full bg-slate-950/50 border border-white/5 py-4 pl-14 pr-8 rounded-2xl outline-none text-sm text-white focus:border-schooladmin-primary placeholder:text-slate-700 font-bold transition-all shadow-inner"
                                        />
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Filter size={14} className="text-slate-500" />
                                        <select 
                                            value={selectedRole}
                                            onChange={(e) => setSelectedRole(e.target.value)}
                                            className="bg-slate-950/50 border border-white/5 px-6 rounded-2xl text-[10px] font-black uppercase tracking-widest text-slate-400 outline-none focus:border-schooladmin-primary h-[56px] transition-all cursor-pointer hover:text-white"
                                        >
                                            <option value="All">All Sectors</option>
                                            <option value="Teacher">Academic</option>
                                            <option value="Accountant">Financial</option>
                                            <option value="Librarian">Archive</option>
                                            <option value="Transport_Manager">Logistics</option>
                                        </select>
                                    </div>
                                </div>
                            </div>

                            <div className="overflow-x-auto">
                                <table className="w-full text-left">
                                    <thead>
                                        <tr className="bg-slate-950/40">
                                            <th className="px-8 py-6 text-[10px] font-black uppercase tracking-[0.4em] text-slate-600 border-b border-white/5">Personnel Signature</th>
                                            <th className="px-8 py-6 text-[10px] font-black uppercase tracking-[0.4em] text-slate-600 border-b border-white/5">Sector Unit</th>
                                            <th className="px-8 py-6 text-[10px] font-black uppercase tracking-[0.4em] text-slate-600 border-b border-white/5 text-center">Persistence Mode</th>
                                            <th className="px-8 py-6 text-[10px] font-black uppercase tracking-[0.4em] text-slate-600 border-b border-white/5">Sync Time</th>
                                            <th className="px-8 py-6 text-[10px] font-black uppercase tracking-[0.4em] text-slate-600 border-b border-white/5 text-right">Annotations</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-white/5">
                                        {filteredRecords.map((r, i) => (
                                            <tr key={r._id} className="hover:bg-schooladmin-primary/[0.03] transition-all duration-300 group">
                                                <td className="px-8 py-6">
                                                    <div className="flex items-center gap-5">
                                                        <div className="w-12 h-12 rounded-2xl bg-slate-800 flex items-center justify-center font-black text-schooladmin-primary border border-white/10 group-hover:border-schooladmin-primary/40 transition-all shadow-xl group-hover:scale-110">
                                                            {r.firstName[0]}
                                                        </div>
                                                        <div>
                                                            <Link to={`/school-admin/profile/${r._id}`} className="text-base font-black text-white uppercase tracking-tighter italic group-hover:text-schooladmin-primary transition-colors cursor-pointer block">
                                                                {r.firstName} {r.lastName}
                                                            </Link>
                                                            <p className="text-[10px] font-bold text-slate-600 font-mono mt-0.5 uppercase tracking-widest">UID: {r.employeeId}</p>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-8 py-6">
                                                    <span className="text-[10px] font-black uppercase tracking-[0.2em] px-4 py-2 rounded-xl bg-slate-950 border border-white/5 text-slate-500 group-hover:text-white transition-all group-hover:border-white/10 italic">
                                                        {r.role}
                                                    </span>
                                                </td>
                                                <td className="px-8 py-6 text-center">
                                                    <div className="flex items-center justify-center gap-2 bg-slate-950/80 p-1.5 rounded-2xl border border-white/5 w-fit mx-auto shadow-2xl">
                                                        {[
                                                            { id: 'Present', color: 'bg-emerald-500', label: 'P' },
                                                            { id: 'Absent', color: 'bg-rose-500', label: 'A' },
                                                            { id: 'Late', color: 'bg-amber-500', label: 'L' },
                                                            { id: 'Half-Day', color: 'bg-schooladmin-primary', label: 'H' }
                                                        ].map(s => (
                                                            <button 
                                                                key={s.id}
                                                                type="button"
                                                                disabled={!isEditing}
                                                                onClick={() => handleStatusChange(r._id, s.id)}
                                                                className={`w-11 h-11 rounded-xl text-[10px] font-black transition-all duration-300 ${
                                                                    r.status === s.id 
                                                                        ? `${s.color} text-slate-950 shadow-lg shadow-${s.color.split('-')[1]}/20 scale-110 z-10` 
                                                                        : 'text-slate-700 hover:text-slate-400 hover:bg-white/5'
                                                                } ${!isEditing ? 'opacity-30 cursor-not-allowed' : ''}`}
                                                            >
                                                                {s.label}
                                                            </button>
                                                        ))}
                                                    </div>
                                                </td>
                                                <td className="px-8 py-6">
                                                    <div className="flex items-center gap-3">
                                                        <Clock size={14} className="text-slate-600" />
                                                        <input 
                                                            type="time" 
                                                            value={r.arrivalTime}
                                                            disabled={!isEditing}
                                                            onChange={(e) => handleTimeChange(r._id, 'arrivalTime', e.target.value)}
                                                            className={`bg-slate-950 border border-white/10 rounded-xl py-2.5 px-4 text-xs font-black text-schooladmin-primary outline-none focus:border-schooladmin-primary shadow-inner transition-all ${!isEditing ? 'opacity-30 cursor-not-allowed' : 'hover:border-schooladmin-primary/50'}`}
                                                        />
                                                    </div>
                                                </td>
                                                <td className="px-8 py-6 text-right">
                                                    <div className="flex items-center justify-end gap-3">
                                                        <input 
                                                            type="text" 
                                                            placeholder="Observations..." 
                                                            value={r.remarks}
                                                            disabled={!isEditing}
                                                            onChange={(e) => handleTimeChange(r._id, 'remarks', e.target.value)}
                                                            className={`bg-transparent border-b border-white/5 text-right text-[10px] font-bold text-slate-500 px-2 py-2 outline-none focus:border-schooladmin-primary w-40 transition-all ${!isEditing ? 'cursor-default border-transparent' : 'hover:border-white/20'}`}
                                                        />
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            {filteredRecords.length === 0 && (
                                <div className="py-40 text-center bg-slate-950/20">
                                    <div className="w-24 h-24 rounded-full bg-slate-900 flex items-center justify-center mx-auto mb-8 border border-white/5">
                                        <UserCircle size={48} className="text-slate-700 opacity-20" />
                                    </div>
                                    <p className="text-slate-500 font-black uppercase tracking-[0.4em] text-xs italic">No personnel detected in specified sectors</p>
                                </div>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default StaffAttendance;
