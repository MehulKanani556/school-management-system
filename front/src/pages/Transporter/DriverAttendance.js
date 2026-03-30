import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchStaffForAttendance, saveStaffAttendance, fetchStaffAttendance } from '../../redux/slice/schoolAdmin.slice';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    Calendar, Users, CheckCircle, XCircle, Clock, Save, 
    Search, Filter, ChevronLeft, ChevronRight, AlertCircle,
    UserCheck, FileText, Send, UserCircle
} from 'lucide-react';
import moment from 'moment';
import toast from 'react-hot-toast';

const DriverAttendance = () => {
    const dispatch = useDispatch();
    const { staffList, loading, staffAttendance } = useSelector((state) => state.schoolAdmin);
    const [selectedDate, setSelectedDate] = useState(moment().format('YYYY-MM-DD'));
    const [searchQuery, setSearchQuery] = useState('');
    const [localRecords, setLocalRecords] = useState([]);
    const [isEditing, setIsEditing] = useState(false);

    useEffect(() => {
        dispatch(fetchStaffForAttendance({ role: 'Driver' }));
        dispatch(fetchStaffAttendance({ date: selectedDate }));
    }, [dispatch, selectedDate]);

    useEffect(() => {
        // Build unified list from staffList.drivers and staffAttendance
        const drivers = (staffList.drivers || []).map(d => ({ ...d, role: 'Driver', type: 'driver' }));
        
        const records = drivers.map(driver => {
            const existing = staffAttendance.find(a => (a.driverId?._id || a.driverId) === driver._id);
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
        
        if (!loading) {
            if (staffAttendance.filter(a => a.driverId).length > 0) setIsEditing(false);
            else setIsEditing(true); 
        }
    }, [staffList, staffAttendance, loading]);

    const handleStatusChange = (id, status) => {
        setLocalRecords(prev => prev.map(r => r._id === id ? { ...r, status } : r));
    };

    const handleTimeChange = (id, field, value) => {
        setLocalRecords(prev => prev.map(r => r._id === id ? { ...r, [field]: value } : r));
    };

    const handleSave = async () => {
        const records = localRecords.map(r => ({
            driverId: r._id,
            type: 'Driver',
            status: r.status,
            arrivalTime: r.arrivalTime,
            departureTime: r.departureTime,
            remarks: r.remarks
        }));

        const res = await dispatch(saveStaffAttendance({ records, date: selectedDate }));
        if (saveStaffAttendance.fulfilled.match(res)) {
            toast.success('Driver Attendance Synchronized', {
                icon: '🚛',
                style: {
                    borderRadius: '1.5rem',
                    background: '#0f172a',
                    color: '#fff',
                    border: '1px solid #f97316',
                    fontWeight: 900,
                    textTransform: 'uppercase',
                    letterSpacing: '0.1em',
                    fontSize: '11px'
                }
            });
            setIsEditing(false);
        }
    };

    const filteredRecords = localRecords.filter(r => {
        return r.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
               r.employeeId.toLowerCase().includes(searchQuery.toLowerCase());
    });

    const stats = {
        total: localRecords.length,
        present: localRecords.filter(r => r.status === 'Present').length,
        absent: localRecords.filter(r => r.status === 'Absent').length,
        late: localRecords.filter(r => r.status === 'Late').length
    };

    return (
        <div className="space-y-6 font-outfit">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-black uppercase tracking-tighter text-white">Driver Attendance Node</h1>
                    <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mt-1 italic">Atmospheric Monitoring of Logistics Personnel</p>
                </div>
                <div className="flex items-center gap-3">
                    <div className="relative">
                        <Calendar size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-transporter-primary" />
                        <input 
                            type="date" 
                            value={selectedDate} 
                            onChange={(e) => setSelectedDate(e.target.value)}
                            className="bg-slate-900 border border-white/5 rounded-xl py-3 pl-12 pr-6 text-white text-sm outline-none focus:border-transporter-primary transition-all font-bold shadow-inner"
                        />
                    </div>
                    {isEditing ? (
                        <button 
                            onClick={handleSave} 
                            disabled={loading}
                            className="flex items-center gap-2 px-6 py-3 bg-transporter-primary text-black hover:bg-transporter-primary/90 disabled:opacity-50 rounded-xl font-black text-[10px] uppercase tracking-[0.2em] transition-all shadow-xl active:scale-95"
                        >
                            {loading ? <Clock className="animate-spin" size={14} /> : <Save size={14} />}
                            Sync Data
                        </button>
                    ) : (
                        <button 
                            onClick={() => setIsEditing(true)}
                            className="flex items-center gap-2 px-6 py-3 bg-white/5 border border-white/10 text-white hover:bg-white/10 rounded-xl font-black text-[10px] uppercase tracking-[0.2em] transition-all active:scale-95"
                        >
                            <FileText size={14} className="text-transporter-primary" />
                            Edit Registry
                        </button>
                    )}
                </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                    { label: 'Total Drivers', val: stats.total, icon: Users, color: 'text-transporter-primary', bg: 'bg-transporter-primary/5' },
                    { label: 'Active Signals', val: stats.present, icon: CheckCircle, color: 'text-emerald-400', bg: 'bg-emerald-400/5' },
                    { label: 'Signal Loss', val: stats.absent, icon: XCircle, color: 'text-rose-400', bg: 'bg-rose-400/5' },
                    { label: 'Delayed Sync', val: stats.late, icon: Clock, color: 'text-amber-400', bg: 'bg-amber-400/5' },
                ].map((s, i) => (
                    <div key={i} className="bg-slate-900/50 backdrop-blur-xl border border-white/5 rounded-2xl p-6 relative overflow-hidden group">
                        <div className={`absolute top-0 right-0 w-24 h-24 ${s.bg} rounded-full blur-3xl -mr-10 -mt-10 group-hover:scale-150 transition-transform duration-700`}></div>
                        <div className="flex items-center gap-4 relative z-10">
                            <div className={`w-12 h-12 rounded-xl ${s.bg} flex items-center justify-center ${s.color} border border-white/10`}>
                                <s.icon size={22} />
                            </div>
                            <div>
                                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">{s.label}</p>
                                <p className="text-2xl font-black text-white mt-1 font-mono tracking-tighter">{s.val}</p>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <div className="bg-slate-900/50 backdrop-blur-3xl border border-white/5 rounded-3xl overflow-hidden shadow-2xl">
                <div className="p-6 border-b border-white/5 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900/40">
                    <div className="flex flex-wrap items-center gap-4 flex-1">
                        <div className="relative flex-1 max-w-md">
                            <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600" />
                            <input 
                                type="text" 
                                placeholder="Search by name or license..." 
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full bg-slate-950/50 border border-white/5 py-3.5 pl-12 pr-6 rounded-2xl outline-none text-sm text-white focus:border-transporter-primary placeholder:text-slate-700 font-bold transition-all font-outfit"
                            />
                        </div>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left font-outfit">
                        <thead>
                            <tr className="bg-slate-950/40">
                                <th className="px-6 py-5 text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 border-b border-white/5">Driver Identity</th>
                                <th className="px-6 py-5 text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 border-b border-white/5">License / ID</th>
                                <th className="px-6 py-5 text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 border-b border-white/5 text-center">Status Matrix</th>
                                <th className="px-6 py-5 text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 border-b border-white/5">Arrival</th>
                                <th className="px-6 py-5 text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 border-b border-white/5 text-right">Remarks</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {filteredRecords.map((r, i) => (
                                <tr key={r._id} className="hover:bg-transporter-primary/[0.02] transition-colors group">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center font-black text-transporter-primary border border-white/10 group-hover:border-transporter-primary/30 transition-all shadow-inner">
                                                {r.name[0]}
                                            </div>
                                            <div>
                                                <span className="text-sm font-black text-white uppercase tracking-tight italic group-hover:text-transporter-primary transition-colors block">
                                                    {r.name}
                                                </span>
                                                <p className="text-[10px] font-black text-slate-600 font-mono">SECTOR: LOGISTICS</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-lg bg-slate-950 border border-white/5 text-slate-400 group-hover:text-white transition-colors">{r.employeeId}</span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center justify-center gap-1.5 bg-slate-950 p-1 rounded-xl border border-white/5 w-fit mx-auto shadow-inner">
                                            {[
                                                { id: 'Present', color: 'bg-emerald-500', label: 'P' },
                                                { id: 'Absent', color: 'bg-rose-500', label: 'A' },
                                                { id: 'Late', color: 'bg-amber-500', label: 'L' },
                                                { id: 'Half-Day', color: 'bg-transporter-primary', label: 'H' },
                                                { id: 'Leave', color: 'bg-blue-500', label: 'LV' }
                                            ].map(s => (
                                                <button 
                                                    key={s.id}
                                                    type="button"
                                                    disabled={!isEditing}
                                                    onClick={() => handleStatusChange(r._id, s.id)}
                                                    className={`w-9 py-2 rounded-lg text-[10px] font-black transition-all ${
                                                        r.status === s.id 
                                                            ? `${s.color} text-black shadow-lg scale-110 z-10` 
                                                            : 'text-slate-700 hover:text-slate-400'
                                                    } ${!isEditing ? 'opacity-50 cursor-not-allowed' : ''}`}
                                                >
                                                    {s.label}
                                                </button>
                                            ))}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2">
                                            <input 
                                                type="time" 
                                                value={r.arrivalTime}
                                                disabled={!isEditing}
                                                onChange={(e) => handleTimeChange(r._id, 'arrivalTime', e.target.value)}
                                                className={`bg-slate-950 border border-white/5 rounded-lg py-2 px-3 text-[10px] font-black text-transporter-primary outline-none focus:border-transporter-primary shadow-inner ${!isEditing ? 'opacity-40' : ''}`}
                                            />
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <input 
                                            type="text" 
                                            placeholder="..." 
                                            value={r.remarks}
                                            disabled={!isEditing}
                                            onChange={(e) => handleTimeChange(r._id, 'remarks', e.target.value)}
                                            className={`bg-transparent border-b border-transparent text-right text-[10px] font-bold text-slate-500 px-1 py-1 outline-none focus:border-transporter-primary/30 max-w-[150px] ${!isEditing ? 'cursor-default' : ''}`}
                                        />
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {filteredRecords.length === 0 && (
                    <div className="py-32 text-center border-t border-white/5 bg-slate-950/20">
                        <UserCircle size={48} className="text-slate-800 mx-auto mb-6 opacity-30 animate-pulse" />
                        <p className="text-slate-600 font-black uppercase tracking-[0.3em] text-[10px]">No drivers matches established parameters</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default DriverAttendance;
