import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchStaffAttendance, saveStaffAttendance } from '../../redux/slice/schoolAdmin.slice';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    Calendar, Users, CheckCircle, XCircle, Clock, Save, 
    Search, Filter, ChevronLeft, ChevronRight, AlertCircle,
    UserCheck, FileText, Send
} from 'lucide-react';
import moment from 'moment';
import toast from 'react-hot-toast';

const StaffAttendance = () => {
    const dispatch = useDispatch();
    const { staffAttendance, loading } = useSelector((state) => state.schoolAdmin);
    const [selectedDate, setSelectedDate] = useState(moment().format('YYYY-MM-DD'));
    const [searchQuery, setSearchQuery] = useState('');
    const [localRecords, setLocalRecords] = useState([]);

    useEffect(() => {
        dispatch(fetchStaffAttendance(selectedDate));
    }, [dispatch, selectedDate]);

    useEffect(() => {
        setLocalRecords(staffAttendance);
    }, [staffAttendance]);

    const handleStatusChange = (teacherId, status) => {
        setLocalRecords(prev => prev.map(r => 
            r._id === teacherId ? { ...r, status } : r
        ));
    };

    const handleTimeChange = (teacherId, field, value) => {
        setLocalRecords(prev => prev.map(r => 
            r._id === teacherId ? { ...r, [field]: value } : r
        ));
    };

    const handleSave = async () => {
        const records = localRecords.map(r => ({
            teacherId: r._id,
            status: r.status,
            arrivalTime: r.arrivalTime,
            departureTime: r.departureTime,
            remarks: r.remarks
        }));

        const res = await dispatch(saveStaffAttendance({ records, date: selectedDate }));
        if (saveStaffAttendance.fulfilled.match(res)) {
            toast.success('Attendance Registry Synchronized');
        }
    };

    const filteredRecords = localRecords.filter(r => 
        `${r.firstName} ${r.lastName}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.employeeId?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const stats = {
        total: localRecords.length,
        present: localRecords.filter(r => r.status === 'Present').length,
        absent: localRecords.filter(r => r.status === 'Absent').length,
        late: localRecords.filter(r => r.status === 'Late').length
    };

    return (
        <div className="space-y-6">
            {/* Header section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-black uppercase tracking-tighter font-outfit text-white">Staff Attendance Node</h1>
                    <p className="text-slate-400 text-sm mt-1">Manage institutional workforce presence and delta timing</p>
                </div>
                <div className="flex items-center gap-3">
                    <div className="relative">
                        <Calendar size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-primary" />
                        <input 
                            type="date" 
                            value={selectedDate} 
                            onChange={(e) => setSelectedDate(e.target.value)}
                            className="bg-slate-900 border border-brand-border/40 rounded-md py-3 pl-12 pr-6 text-white text-sm outline-none focus:border-brand-primary transition-all font-bold"
                        />
                    </div>
                    <button 
                        onClick={handleSave} 
                        disabled={loading}
                        className="flex items-center gap-2 px-6 py-3 bg-brand-primary hover:bg-blue-600 disabled:opacity-50 rounded-md font-black text-xs uppercase tracking-widest transition-all shadow-[0_0_20px_rgba(37,99,235,0.2)] text-white"
                    >
                        {loading ? <Clock className="animate-spin" size={14} /> : <Save size={14} />}
                        Sync Registry
                    </button>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                    { label: 'Total Personnel', val: stats.total, icon: Users, color: 'text-blue-400', bg: 'bg-blue-400/10' },
                    { label: 'Present Today', val: stats.present, icon: CheckCircle, color: 'text-emerald-400', bg: 'bg-emerald-400/10' },
                    { label: 'Absent Nodes', val: stats.absent, icon: XCircle, color: 'text-rose-400', bg: 'bg-rose-400/10' },
                    { label: 'Late Arrival', val: stats.late, icon: Clock, color: 'text-amber-400', bg: 'bg-amber-400/10' },
                ].map((s, i) => (
                    <div key={i} className="bg-brand-surface border border-brand-border/40 rounded-md p-6">
                        <div className="flex items-center gap-4">
                            <div className={`w-10 h-10 rounded-md ${s.bg} flex items-center justify-center ${s.color}`}>
                                <s.icon size={18} />
                            </div>
                            <div>
                                <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">{s.label}</p>
                                <p className="text-xl font-black font-outfit mt-1 text-white">{s.val}</p>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* List Table */}
            <div className="bg-brand-surface border border-brand-border/40 rounded-md overflow-hidden">
                <div className="p-6 border-b border-brand-border/40 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900/40">
                    <div className="relative flex-1 max-w-md">
                        <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
                        <input 
                            type="text" 
                            placeholder="Search by name or ID..." 
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full bg-slate-900/50 border border-brand-border/40 py-3 pl-12 pr-6 rounded-md outline-none text-sm text-white focus:border-brand-primary placeholder:text-slate-600 font-bold"
                        />
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-slate-900/60">
                                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-500">Personnel Identity</th>
                                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-500">Employee ID</th>
                                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-500 text-center">Presence Status</th>
                                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-500">Log Times (In/Out)</th>
                                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-500">Operational Remarks</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-brand-border/20">
                            {filteredRecords.map((r, i) => (
                                <tr key={r._id} className="hover:bg-white/5 transition-colors group">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-9 h-9 rounded-md bg-slate-800 flex items-center justify-center font-black text-indigo-400 border border-white/5">
                                                {r.firstName[0]}{r.lastName[0]}
                                            </div>
                                            <div>
                                                <p className="text-sm font-black text-white uppercase tracking-tight italic">{r.firstName} {r.lastName}</p>
                                                <p className="text-[10px] font-bold text-slate-500">TEACHER NODE</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="bg-slate-800 text-slate-400 px-3 py-1.5 rounded-md text-[10px] font-black border border-white/5 font-mono">#{r.employeeId || 'NA'}</span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center justify-center gap-1 bg-slate-900/50 p-1.5 rounded-md border border-white/5 w-fit mx-auto">
                                            {[
                                                { id: 'Present', color: 'bg-emerald-500', label: 'P' },
                                                { id: 'Absent', color: 'bg-rose-500', label: 'A' },
                                                { id: 'Late', color: 'bg-amber-500', label: 'L' },
                                                { id: 'Half-Day', color: 'bg-blue-500', label: 'H' }
                                            ].map(s => (
                                                <button 
                                                    key={s.id}
                                                    onClick={() => handleStatusChange(r._id, s.id)}
                                                    className={`w-10 py-2 rounded text-[10px] font-black transition-all ${
                                                        r.status === s.id 
                                                            ? `${s.color} text-white shadow-lg scale-110 z-10` 
                                                            : 'text-slate-600 hover:text-slate-400'
                                                    }`}
                                                    title={s.id}
                                                >
                                                    {s.label}
                                                </button>
                                            ))}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2">
                                            <div className="relative">
                                                <input 
                                                    type="time" 
                                                    value={r.arrivalTime}
                                                    onChange={(e) => handleTimeChange(r._id, 'arrivalTime', e.target.value)}
                                                    className="bg-slate-900/50 border border-brand-border/40 rounded-md py-1.5 px-3 text-[10px] font-black text-indigo-400 outline-none focus:border-brand-primary"
                                                />
                                            </div>
                                            <span className="text-slate-700">-</span>
                                            <div className="relative">
                                                <input 
                                                    type="time" 
                                                    value={r.departureTime}
                                                    onChange={(e) => handleTimeChange(r._id, 'departureTime', e.target.value)}
                                                    className="bg-slate-900/50 border border-brand-border/40 rounded-md py-1.5 px-3 text-[10px] font-black text-emerald-400 outline-none focus:border-brand-primary"
                                                />
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <input 
                                            type="text" 
                                            placeholder="..." 
                                            value={r.remarks}
                                            onChange={(e) => handleTimeChange(r._id, 'remarks', e.target.value)}
                                            className="w-full bg-transparent border-b border-transparent hover:border-slate-800 transition-all text-xs text-slate-400 px-1 py-1 outline-none focus:border-brand-primary"
                                        />
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {filteredRecords.length === 0 && (
                    <div className="py-24 text-center border-t border-brand-border/20 bg-slate-900/20">
                        <UserCheck size={48} className="text-slate-800 mx-auto mb-4 opacity-20" />
                        <p className="text-slate-500 font-black uppercase tracking-widest text-[10px]">No workforce nodes identified</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default StaffAttendance;
