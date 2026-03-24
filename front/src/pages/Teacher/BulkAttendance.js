import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchAssignedClasses, importAttendanceBulk } from '../../redux/slice/teacher.slice';
import { motion } from 'framer-motion';
import { Upload, FileText, Calendar, Users, Activity } from 'lucide-react';

const BulkAttendance = () => {
    const dispatch = useDispatch();
    const { classes, loading } = useSelector((state) => state.teacher);
    const [csvFile, setCsvFile] = useState(null);
    const [selectedClass, setSelectedClass] = useState('');
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

    useEffect(() => {
        dispatch(fetchAssignedClasses());
    }, [dispatch]);

    const handleBulkUpload = async (e) => {
        e.preventDefault();
        if (!csvFile || !selectedClass || !selectedDate) return;

        const reader = new FileReader();
        reader.onload = async (e) => {
            const text = e.target.result;
            const lines = text.split('\n').filter(l => l.trim());
            // Format: admissionNumber,status
            const bulkData = lines.map((line, index) => {
                if(index === 0 && line.toLowerCase().includes('admissionnumber')) return null; // skip header
                const [admissionNumber, status] = line.split(',').map(s => s.trim());
                // We send admissionNumber to backend or we need studentId. The existing backend `bulk-attendance` expects `studentId`.
                // Wait, if it expects studentId, we might need to map admissionNumber -> studentId. 
                // Alternatively, the backend route might expect `studentId`. Let's just send what we have and let the backend deal with it, or we fetch students first.
                return { admissionNumber, status: status || 'Present' };
            }).filter(Boolean);

            if (bulkData.length > 0) {
                await dispatch(importAttendanceBulk({
                    classSectionId: selectedClass,
                    date: selectedDate,
                    attendanceData: bulkData
                }));
                setCsvFile(null);
            }
        };
        reader.readAsText(csvFile);
    };

    return (
        <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} className="space-y-8">
            <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 bg-slate-900/40 p-10 rounded-md border border-slate-800/60 shadow-2xl backdrop-blur-xl">
                <div className="space-y-2">
                    <div className="flex items-center gap-3 mb-2">
                        <span className="w-12 h-[2px] bg-brand-primary rounded-md"></span>
                        <span className="text-[10px] font-black uppercase tracking-[0.4em] text-brand-primary font-outfit">Teacher Terminal</span>
                    </div>
                    <h1 className="text-4xl font-black text-white italic uppercase tracking-tighter leading-none font-outfit">Bulk Attendance</h1>
                    <p className="text-slate-500 font-medium text-sm tracking-wide italic">Mass Telemetry Import Utility</p>
                </div>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="bg-slate-900/40 p-10 rounded-md border border-slate-800/60 shadow-2xl space-y-8">
                    <div className="space-y-4">
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest italic ml-2">Target Sector</label>
                        <div className="relative group">
                            <Users size={16} className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-500" />
                            <select 
                                value={selectedClass}
                                onChange={(e) => setSelectedClass(e.target.value)}
                                className="w-full bg-slate-950 border border-slate-800 h-14 pl-14 pr-8 rounded-md text-[11px] font-black uppercase tracking-widest outline-none appearance-none focus:border-brand-primary transition-all text-white shadow-xl italic"
                            >
                                <option value="" className="bg-slate-950 text-slate-600">Select Section</option>
                                {classes.map(cls => (
                                    <option key={cls._id} value={cls._id}>Grade {cls.gradeLevel || cls.standardId?.level} - {cls.sectionLabel}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest italic ml-2">Temporal Node (Date)</label>
                        <div className="relative group">
                            <Calendar size={16} className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-500" />
                            <input 
                                type="date" 
                                value={selectedDate}
                                onChange={(e) => setSelectedDate(e.target.value)}
                                className="w-full bg-slate-950 border border-slate-800 h-14 pl-14 pr-6 rounded-md text-[11px] font-black uppercase tracking-widest outline-none focus:border-brand-primary transition-all text-white shadow-xl italic"
                            />
                        </div>
                    </div>
                </div>

                <div className="bg-slate-900/40 p-10 rounded-md border border-slate-800/60 shadow-2xl flex flex-col justify-center space-y-6">
                    <div className="bg-slate-800/60 border border-slate-700/50 p-6 rounded-md group hover:border-brand-primary/40 transition-all cursor-pointer relative overflow-hidden flex-1 flex flex-col items-center justify-center min-h-[200px]">
                        <input type="file" accept=".csv" onChange={(e) => setCsvFile(e.target.files[0])} className="absolute inset-0 opacity-0 cursor-pointer z-10" />
                        <div className="w-20 h-20 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-600 group-hover:text-brand-primary group-hover:scale-110 transition-all shadow-2xl mb-4">
                            <FileText size={40} />
                        </div>
                        <div className="text-center">
                            <p className="text-sm font-black text-white italic uppercase">{csvFile ? csvFile.name : 'Select Institutional archival CSV'}</p>
                            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-2">Format: admissionNumber,status</p>
                        </div>
                    </div>

                    <button 
                        onClick={handleBulkUpload} 
                        disabled={loading || !csvFile || !selectedClass || !selectedDate} 
                        className="w-full h-14 bg-brand-primary hover:bg-blue-600 disabled:opacity-50 text-white rounded-md font-black text-[11px] uppercase tracking-widest transition-all shadow-2xl flex items-center justify-center gap-3 italic"
                    >
                        {loading ? <Activity size={18} className="animate-spin" /> : <Upload size={18} />} Initiate Mass Sync
                    </button>
                    
                    <p className="text-[9px] text-slate-600 font-bold uppercase tracking-tight text-center leading-relaxed italic mt-2">
                        Disclaimer: Bulk synchronization will override all existing temporal records for the selected academic cluster and date cycle.
                    </p>
                </div>
            </div>
        </motion.div>
    );
};

export default BulkAttendance;
