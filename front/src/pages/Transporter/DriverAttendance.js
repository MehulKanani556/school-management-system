import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchStaffForAttendance, saveStaffAttendance, fetchStaffAttendance, fetchStaffMonthlySummary } from '../../redux/slice/schoolAdmin.slice';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    Calendar as CalendarIcon, Users, CheckCircle, XCircle, Clock, Save, 
    Search, Filter, ChevronLeft, ChevronRight, AlertCircle,
    UserCheck, FileText, Send, UserCircle, ArrowLeft, MoreHorizontal
} from 'lucide-react';
import moment from 'moment';
import toast from 'react-hot-toast';

const DriverAttendance = () => {
    const dispatch = useDispatch();
    const { staffList, loading, staffAttendance, staffMonthlySummary } = useSelector((state) => state.schoolAdmin);
    const [view, setView] = useState('calendar'); // 'calendar' or 'records'
    const [selectedDate, setSelectedDate] = useState(moment().format('YYYY-MM-DD'));
    const [currentMonth, setCurrentMonth] = useState(moment());
    const [searchQuery, setSearchQuery] = useState('');
    const [localRecords, setLocalRecords] = useState([]);
    const [isEditing, setIsEditing] = useState(false);

    useEffect(() => {
        dispatch(fetchStaffForAttendance({ role: 'Driver' }));
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
        // Build list for drivers only
        const drivers = (staffList.drivers || []).map(d => ({ ...d, role: 'Driver', type: 'driver' }));
        
        const records = drivers.map(driver => {
            const existing = (staffAttendance || []).find(a => (a.driverId?._id || a.driverId) === driver._id);
            return {
                _id: driver._id,
                name: driver.name,
                role: 'Driver',
                employeeId: driver.licenseNumber || 'DRV-' + driver._id.slice(-4),
                status: existing?.status || 'Present',
                arrivalTime: existing?.arrivalTime || '08:00',
                departureTime: existing?.departureTime || '16:00',
                remarks: existing?.remarks || '',
                type: 'driver'
            };
        });
        setLocalRecords(records);
        
        // Auto-lock if attendance exists for ANY driver on this date
        if (!loading && staffAttendance && staffAttendance.length > 0) {
            const hasDriverLogs = staffAttendance.some(a => a.driverId);
            if (hasDriverLogs) setIsEditing(false);
            else setIsEditing(true);
        } else if (!loading) {
            setIsEditing(true);
        }
    }, [staffList, staffAttendance, loading]);

    const handleDateClick = (date) => {
        const formattedDate = date.format('YYYY-MM-DD');
        setSelectedDate(formattedDate);
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
            driverId: r._id,
            status: r.status,
            arrivalTime: r.arrivalTime,
            departureTime: r.departureTime,
            remarks: r.remarks
        }));

        const res = await dispatch(saveStaffAttendance({ records, date: selectedDate }));
        if (saveStaffAttendance.fulfilled.match(res)) {
            toast.success('Logistics Registry Synchronized');
            setIsEditing(false);
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
            calendar.push(Array(7).fill(0).map(() => day.add(1, 'day').clone()));
        }

        return (
            <div className="bg-slate-900/40 backdrop-blur-3xl border border-white/5 rounded-[2.5rem] overflow-hidden p-10 shadow-2xl">
                <div className="flex items-center justify-between mb-12">
                    <div className="flex items-center gap-6">
                        <div className="w-16 h-16 rounded-2xl bg-transporter-primary/10 border border-transporter-primary/20 flex items-center justify-center text-transporter-primary shadow-lg">
                            <CalendarIcon size={32} />
                        </div>
                        <div>
                            <h2 className="text-4xl font-black text-white tracking-tighter uppercase italic">{currentMonth.format('MMMM YYYY')}</h2>
                            <p className="text-xs font-bold text-slate-500 uppercase tracking-[0.3em] font-mono mt-1">Institutional Signal Oversight</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2 bg-slate-950 p-2 rounded-2xl border border-white/5 shadow-inner">
                        <button onClick={() => setCurrentMonth(currentMonth.clone().subtract(1, 'month'))} className="p-3 hover:bg-white/5 rounded-xl transition-all text-slate-400 hover:text-white"><ChevronLeft size={24} /></button>
                        <button onClick={() => setCurrentMonth(moment())} className="px-8 py-3 bg-white/5 hover:bg-white/10 rounded-xl text-xs font-black uppercase text-white transition-all tracking-widest">Sync</button>
                        <button onClick={() => setCurrentMonth(currentMonth.clone().add(1, 'month'))} className="p-3 hover:bg-white/5 rounded-xl transition-all text-slate-400 hover:text-white"><ChevronRight size={24} /></button>
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
                                    ${isToday ? 'bg-transporter-primary/10 border-transporter-primary/30' : 'bg-slate-950/40 border-white/5 hover:border-transporter-primary/40'} 
                                    ${isMarked ? 'bg-emerald-500/[0.03] border-emerald-500/20' : ''}`}
                            >
                                <span className={`absolute top-6 left-8 text-sm font-black italic tracking-tighter transition-colors duration-500
                                    ${isToday ? 'text-transporter-primary' : 'text-slate-600 group-hover:text-white'} 
                                    ${isMarked ? 'text-emerald-500/40' : ''}`}>{date.date()}</span>

                                <div className="relative z-10 flex flex-col items-center gap-3">
                                    {isMarked ? (
                                        <>
                                            <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 shadow-lg shadow-emerald-500/10 mb-1">
                                                <CheckCircle size={24} />
                                            </div>
                                            <div className="text-[10px] font-black text-emerald-400 tracking-[0.2em] uppercase">Logged</div>
                                        </>
                                    ) : (
                                        <>
                                            <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/5 flex items-center justify-center text-slate-700 group-hover:text-slate-400 transition-colors duration-500 mb-1">
                                                <Users size={24} />
                                            </div>
                                            <div className="text-[10px] font-black text-slate-700 group-hover:text-slate-500 transition-colors duration-500 tracking-[0.2em] uppercase italic">Void</div>
                                        </>
                                    )}
                                </div>
                                {isToday && <div className="absolute top-6 right-8 w-2 h-2 rounded-full bg-transporter-primary shadow-[0_0_15px_#f97316] animate-pulse" />}
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
        return r.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
               r.employeeId.toLowerCase().includes(searchQuery.toLowerCase());
    });

    return (
        <div className="space-y-8 font-outfit">
            <AnimatePresence mode="wait">
                {view === 'calendar' ? (
                    <motion.div key="calendar" initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 1.02 }} transition={{ duration: 0.4 }}>
                        <div className="flex items-center justify-between mb-8">
                            <div>
                                <h1 className="text-4xl font-black uppercase tracking-tighter text-white">Logistics Presence</h1>
                                <p className="text-slate-500 text-sm font-bold uppercase tracking-widest mt-1 italic">Fleet Workforce Metrics & Signal Tracking</p>
                            </div>
                        </div>
                        {renderCalendar()}
                    </motion.div>
                ) : (
                    <motion.div key="records" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-8">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                            <div className="flex items-center gap-6">
                                <button onClick={() => setView('calendar')} className="p-4 bg-slate-900 hover:bg-slate-800 rounded-2xl text-transporter-primary border border-white/5 transition-all shadow-lg active:scale-95"><ArrowLeft size={24} /></button>
                                <div>
                                    <h1 className="text-3xl font-black uppercase tracking-tighter text-white">Registry: {moment(selectedDate).format('DD MMM YYYY')}</h1>
                                    <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.3em] mt-1 italic">Active Signal Processing Mode</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                {isEditing ? (
                                    <button onClick={handleSave} disabled={loading} className="flex items-center gap-3 px-8 py-4 bg-transporter-primary text-black hover:bg-transporter-primary/90 disabled:opacity-50 rounded-2xl font-black text-xs uppercase tracking-[0.2em] transition-all shadow-xl active:scale-95">
                                        {loading ? <Clock className="animate-spin" size={16} /> : <Save size={16} />} Commit Logs
                                    </button>
                                ) : (
                                    <button onClick={() => setIsEditing(true)} className="flex items-center gap-3 px-8 py-4 bg-slate-800 hover:bg-slate-700 text-white rounded-2xl font-black text-xs uppercase tracking-[0.2em] transition-all border border-white/10 active:scale-95">
                                        <FileText size={16} className="text-transporter-primary" /> Edit Registry
                                    </button>
                                )}
                            </div>
                        </div>

                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                            {[
                                { label: 'Personnel Count', val: stats.total, icon: Users, color: 'text-transporter-primary', bg: 'bg-transporter-primary/5' },
                                { label: 'Linked Signals', val: stats.present, icon: CheckCircle, color: 'text-emerald-400', bg: 'bg-emerald-400/5' },
                                { label: 'Signal Loss', val: stats.absent, icon: XCircle, color: 'text-rose-400', bg: 'bg-rose-400/5' },
                                { label: 'Sync Delayed', val: stats.late, icon: Clock, color: 'text-amber-400', bg: 'bg-amber-400/5' },
                            ].map((s, i) => (
                                <div key={i} className="bg-slate-900/30 backdrop-blur-xl border border-white/5 rounded-[2rem] p-8 relative overflow-hidden group">
                                    <div className={`absolute top-0 right-0 w-32 h-32 ${s.bg} rounded-full blur-[60px] -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-1000 opacity-50`}></div>
                                    <div className="flex items-center gap-6 relative z-10">
                                        <div className={`w-14 h-14 rounded-2xl ${s.bg} flex items-center justify-center ${s.color} border border-white/10 shadow-lg shadow-black/20`}>
                                            <s.icon size={26} />
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
                            <div className="p-8 border-b border-white/5 flex items-center bg-slate-900/40">
                                <div className="relative flex-1 max-w-lg">
                                    <Search size={18} className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-600" />
                                    <input type="text" placeholder="Search by name or license..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full bg-slate-950/50 border border-white/5 py-4 pl-14 pr-8 rounded-2xl outline-none text-sm text-white focus:border-transporter-primary placeholder:text-slate-700 font-bold transition-all shadow-inner" />
                                </div>
                            </div>

                            <div className="overflow-x-auto">
                                <table className="w-full text-left">
                                    <thead>
                                        <tr className="bg-slate-950/40">
                                            <th className="px-8 py-6 text-[10px] font-black uppercase tracking-[0.4em] text-slate-600 border-b border-white/5">Personnel</th>
                                            <th className="px-8 py-6 text-[10px] font-black uppercase tracking-[0.4em] text-slate-600 border-b border-white/5">Signal Status</th>
                                            <th className="px-8 py-6 text-[10px] font-black uppercase tracking-[0.4em] text-slate-600 border-b border-white/5">Temporal Sync</th>
                                            <th className="px-8 py-6 text-[10px] font-black uppercase tracking-[0.4em] text-slate-600 border-b border-white/5 text-right">Annotations</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-white/5">
                                        {filteredRecords.map((r) => (
                                            <tr key={r._id} className="hover:bg-transporter-primary/[0.03] transition-all duration-300 group">
                                                <td className="px-8 py-6">
                                                    <div className="flex items-center gap-5">
                                                        <div className="w-12 h-12 rounded-xl bg-slate-800 flex items-center justify-center font-black text-transporter-primary border border-white/10 group-hover:border-transporter-primary/40 transition-all shadow-xl">{r.name[0]}</div>
                                                        <div>
                                                            <span className="text-base font-black text-white uppercase tracking-tighter italic group-hover:text-transporter-primary transition-colors block leading-tight">{r.name}</span>
                                                            <p className="text-[10px] font-bold text-slate-600 font-mono mt-0.5 uppercase tracking-widest">ID: {r.employeeId}</p>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-8 py-6">
                                                    <div className="flex items-center gap-2 bg-slate-950/80 p-1.5 rounded-2xl border border-white/5 w-fit shadow-2xl">
                                                        {[
                                                            { id: 'Present', color: 'bg-emerald-500', label: 'P' },
                                                            { id: 'Absent', color: 'bg-rose-500', label: 'A' },
                                                            { id: 'Late', color: 'bg-amber-500', label: 'L' },
                                                            { id: 'Half-Day', color: 'bg-transporter-primary', label: 'H' },
                                                            { id: 'Leave', color: 'bg-blue-500', label: 'LV' }
                                                        ].map(s => (
                                                            <button key={s.id} disabled={!isEditing} onClick={() => handleStatusChange(r._id, s.id)} className={`w-11 h-11 rounded-xl text-[10px] font-black transition-all duration-300 ${r.status === s.id ? `${s.color} text-black shadow-lg scale-110 z-10` : 'text-slate-700 hover:text-slate-400'} ${!isEditing ? 'opacity-30 cursor-not-allowed' : ''}`}>{s.label}</button>
                                                        ))}
                                                    </div>
                                                </td>
                                                <td className="px-8 py-6">
                                                    <input type="time" value={r.arrivalTime} disabled={!isEditing} onChange={(e) => handleTimeChange(r._id, 'arrivalTime', e.target.value)} className={`bg-slate-950 border border-white/10 rounded-xl py-2.5 px-4 text-xs font-black text-transporter-primary outline-none focus:border-transporter-primary shadow-inner transition-all ${!isEditing ? 'opacity-30 cursor-not-allowed' : 'hover:border-transporter-primary/50'}`} />
                                                </td>
                                                <td className="px-8 py-6 text-right">
                                                    <input type="text" placeholder="..." value={r.remarks} disabled={!isEditing} onChange={(e) => handleTimeChange(r._id, 'remarks', e.target.value)} className={`bg-transparent border-b border-white/5 text-right text-[10px] font-bold text-slate-500 px-2 py-2 outline-none focus:border-transporter-primary w-40 transition-all ${!isEditing ? 'cursor-default border-transparent' : 'hover:border-white/20'}`} />
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                            {filteredRecords.length === 0 && (
                                <div className="py-40 text-center bg-slate-950/20">
                                    <div className="w-24 h-24 rounded-full bg-slate-900 flex items-center justify-center mx-auto mb-8 border border-white/5"><UserCircle size={48} className="text-slate-700 opacity-20" /></div>
                                    <p className="text-slate-500 font-black uppercase tracking-[0.4em] text-xs italic">No personnel detected in logistics sector</p>
                                </div>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default DriverAttendance;
