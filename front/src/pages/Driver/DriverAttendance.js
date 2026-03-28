import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { ClipboardList, CheckCircle2, XCircle, Clock, Calendar, ShieldAlert } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';

import { fetchDriverAttendanceSlice } from '../../redux/slice/transport.slice';

const DriverAttendance = () => {
    const dispatch = useDispatch();
    const { driverAttendance, loading } = useSelector((state) => state.transport);
    const { user } = useSelector((state) => state.auth);
    const [currentTime, setCurrentTime] = useState(new Date());

    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 1000);
        dispatch(fetchDriverAttendanceSlice());
        return () => clearInterval(timer);
    }, [dispatch]);

    const todayRecord = driverAttendance?.find(log => 
        new Date(log.date).toDateString() === new Date().toDateString()
    );

    const markAttendance = (status) => {
        if (todayRecord) {
            toast.error('Attendance already registered for today. (आज की हाजिरी पहले से दर्ज है)');
            return;
        }

        if (status === 'Leave Request') {
            const today = new Date();
            const advanceLimit = new Date();
            advanceLimit.setDate(today.getDate() + 2);
            
            // This is just UI validation, backend should also check
            toast.error('Notice Period Required: Leaves must be applied 2 days in advance. (छुट्टी के लिए 2 दिन पहले आवेदन करें)');
            return;
        }

        toast.success(`Check-in Successful! Status: ${status} (उपस्थिति दर्ज की गई)`);
        // Note: Real check-in usually involves QR or Bio-metric in this system
    }

    return (
        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="space-y-8 pb-10 font-outfit">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-6 px-2 italic">
                <div>
                    <h1 className="text-3xl font-black italic uppercase tracking-tighter mb-1 leading-none text-emerald-500 font-outfit">My Attendance</h1>
                    <p className="text-[11px] font-black text-slate-500 uppercase tracking-widest italic opacity-70 leading-none">Register your daily duty check-in here. (मेरी दैनिक उपस्थिति)</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-neutral-900 border border-slate-800/60 rounded-md p-10 shadow-2xl relative overflow-hidden group hover:border-emerald-600/30 transition-all font-outfit text-center">
                    <div className="absolute top-0 right-0 p-4">
                        <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-lg shadow-emerald-500/20" />
                    </div>
                    
                    <h2 className="text-5xl font-black text-white italic tracking-tighter mb-4 leading-none">{currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</h2>
                    <p className="text-[11px] font-black text-slate-500 uppercase tracking-[0.3em] mb-10 italic">{currentTime.toLocaleDateString([], { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>

                    <div className="grid grid-cols-2 gap-4">
                        <button 
                            onClick={() => markAttendance('Present')}
                            disabled={todayRecord?.status === 'Present'}
                            className={`py-6 rounded-md transition-all group flex flex-col items-center gap-3 italic border ${todayRecord?.status === 'Present' ? 'bg-emerald-600/20 border-emerald-500/50 text-emerald-500 opacity-50 cursor-not-allowed' : 'bg-emerald-600/10 border-emerald-500/30 hover:bg-emerald-600 hover:text-white'}`}
                        >
                            <CheckCircle2 size={32} className={`${todayRecord?.status === 'Present' ? 'text-emerald-500' : 'text-emerald-500 group-hover:text-white'}`} />
                            <div className="text-center">
                                <p className="text-sm font-black uppercase tracking-widest leading-none">{todayRecord?.status === 'Present' ? 'Already Present' : 'Mark Present'}</p>
                                <p className="text-[8px] font-bold opacity-60 uppercase mt-2">उपस्थित / ड्यूटी पर हैं</p>
                            </div>
                        </button>
                        <button 
                            onClick={() => markAttendance('Leave Request')}
                            className="bg-rose-600/10 border border-rose-500/30 py-6 rounded-md hover:bg-rose-600 hover:text-white transition-all group flex flex-col items-center gap-3 italic text-rose-500"
                        >
                            <XCircle size={32} className="text-rose-500 group-hover:text-white" />
                            <div className="text-center">
                                <p className="text-sm font-black uppercase tracking-widest leading-none">Apply Leave</p>
                                <p className="text-[8px] font-bold opacity-60 uppercase mt-2">छुट्टी के लिए आवेदन</p>
                            </div>
                        </button>
                    </div>
                </div>

                <div className="bg-neutral-900 border border-slate-800/60 rounded-md p-10 shadow-2xl relative overflow-hidden group hover:border-emerald-600/30 transition-all font-outfit">
                    <h3 className="text-sm font-black text-slate-100 uppercase italic tracking-[0.2em] mb-8 flex items-center gap-3 text-emerald-500">
                        <Clock size={16} /> Recent Records (पिछला रिकॉर्ड)
                    </h3>
                    <div className="space-y-4">
                        {driverAttendance?.length > 0 ? driverAttendance.slice(0, 5).map((log, i) => (
                            <div key={i} className={`flex items-center justify-between p-4 bg-neutral-950 border rounded italic ${log.status === 'Absent' || log.status === 'On Leave' ? 'border-rose-500/20' : 'border-slate-800/40 hover:border-emerald-500/20'} transition-all`}>
                                <div className="flex items-center gap-4">
                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${log.status === 'Absent' || log.status === 'On Leave' ? 'bg-rose-500/10 text-rose-500' : 'bg-emerald-500/10 text-emerald-500'}`}>
                                        <Calendar size={14} />
                                    </div>
                                    <div>
                                        <p className="text-xs font-black text-slate-200 uppercase tracking-tighter">{new Date(log.date).toLocaleDateString([], { day: '2-digit', month: 'short', year: 'numeric' })}</p>
                                        <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">{log.checkIn ? new Date(log.checkIn).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '--:--'}</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className={`text-xs font-black uppercase tracking-tighter ${log.status === 'Absent' || log.status === 'On Leave' ? 'text-rose-500' : 'text-emerald-500'}`}>{log.status}</p>
                                    <p className="text-[9px] font-bold text-slate-600 uppercase tracking-widest italic">{log.remarks || 'Standard'}</p>
                                </div>
                            </div>
                        )) : (
                            <div className="py-10 text-center opacity-40">
                                <ClipboardList size={24} className="mx-auto mb-2 text-slate-600" />
                                <p className="text-[10px] uppercase font-black tracking-widest">No Recent Logs Found</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <div className="bg-orange-500/5 border border-orange-500/20 p-8 rounded-md italic flex items-start gap-6 font-outfit">
                <div className="p-3 bg-orange-500 text-black rounded shadow-lg shadow-orange-500/20">
                    <ShieldAlert size={20} />
                </div>
                <div>
                    <h4 className="text-sm font-black uppercase tracking-widest text-orange-500 mb-1">Attendance Policy (नियम)</h4>
                    <p className="text-[10px] text-slate-500 font-bold uppercase italic leading-relaxed">
                        Attendance must be marked before 7:30 AM for the morning shift. Late logs will be flagged for review. Ensure you are within the school campus while checking in. (दैनिक उपस्थिति सुबह 7:30 बजे से पहले लगानी अनिवार्य है।)
                    </p>
                </div>
            </div>
        </motion.div>
    );
};

export default DriverAttendance;
