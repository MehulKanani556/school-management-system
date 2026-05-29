import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchAssignedClasses, fetchClassStudents, importAttendanceBulk } from '../../redux/slice/teacher.slice';
import { motion } from 'framer-motion';
import { Upload, FileText, Calendar, Users, Activity, Download } from 'lucide-react';
import toast from 'react-hot-toast';

const BulkAttendance = () => {
    const dispatch = useDispatch();
    const { classes, students, loading } = useSelector((state) => state.teacher);
    const { activeAcademicYear } = useSelector((state) => state.academicYear);
    const [csvFile, setCsvFile] = useState(null);
    const [selectedClass, setSelectedClass] = useState('');
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

    useEffect(() => {
        dispatch(fetchAssignedClasses({ onlyClassTeacher: true }));
    }, [dispatch, activeAcademicYear]);

    // Fetch students whenever class changes
    useEffect(() => {
        if (selectedClass) {
            dispatch(fetchClassStudents(selectedClass));
        }
    }, [selectedClass, dispatch]);

    const handleBulkUpload = async (e) => {
        e.preventDefault();
        if (!csvFile || !selectedClass || !selectedDate) return;

        const reader = new FileReader();
        reader.onload = async (e) => {
            const text = e.target.result;
            const lines = text.split('\n').filter(l => l.trim());
            const bulkData = lines.map((line, index) => {
                if (index === 0 && line.toLowerCase().includes('admissionnumber')) return null; // skip header
                const cols = line.split(',').map(s => s.trim());
                const admissionNumber = cols[0];
                // Status is always the last column (handles both 2-col and 4-col template formats)
                const status = cols[cols.length - 1] || 'Present';
                if (!admissionNumber) return null;
                return { admissionNumber, status };
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

    const downloadExampleCsv = () => {
        if (!selectedClass) {
            toast.error('Please select a class first to generate the template');
            return;
        }
        if (!students || students.length === 0) {
            toast.error('No students found for the selected class');
            return;
        }

        // Build CSV rows from real student data
        const rows = [
            'AdmissionNumber,StudentName,RollNo,Status',
            ...students.map((s, idx) =>
                `${s.admissionNumber || ''},${s.firstName} ${s.lastName},${s.rollNumber || idx + 1},Present`
            )
        ];

        const blob = new Blob([rows.join('\n')], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;

        // Name the file after the selected class
        const cls = classes.find(c => c._id === selectedClass);
        const className = cls ? `Std${cls.standardId?.level}_${cls.sectionLabel}` : 'class';
        link.setAttribute('download', `attendance_${className}_${selectedDate}.csv`);

        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);

        toast.success(`Template downloaded with ${students.length} students`);
    };

    return (
        <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} className="space-y-8">
            <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 bg-slate-900/40 p-10 rounded-md border border-slate-800/60 shadow-2xl backdrop-blur-xl">
                <div className="space-y-2">
                    <div className="flex items-center gap-3 mb-2">
                        <span className="w-12 h-[2px] bg-brand-primary rounded-md"></span>
                        <span className="text-[10px] font-black uppercase tracking-[0.4em] text-brand-primary font-outfit">Teacher Panel</span>
                    </div>
                    <h1 className="text-4xl font-black text-white italic uppercase tracking-tighter leading-none font-outfit">Bulk Attendance</h1>
                    <p className="text-slate-500 font-medium text-sm tracking-wide italic">Upload attendance from CSV file.</p>
                </div>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="bg-slate-900/40 p-10 rounded-md border border-slate-800/60 shadow-2xl space-y-8">
                    <div className="space-y-4">
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest italic ml-2">Class/Section</label>
                        <div className="relative group">
                            <Users size={16} className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-500" />
                            <select 
                                value={selectedClass}
                                onChange={(e) => setSelectedClass(e.target.value)}
                                className="w-full bg-slate-950 border border-slate-800 h-14 pl-14 pr-8 rounded-md text-[11px] font-black uppercase tracking-widest outline-none appearance-none focus:border-brand-primary transition-all text-white shadow-xl italic"
                            >
                                <option value="" className="bg-slate-950 text-slate-600">Select Section</option>
                                {classes.map(cls => (
                                    <option key={cls._id} value={cls._id}>Std {cls.gradeLevel || cls.standardId?.level} - {cls.sectionLabel}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest italic ml-2">Attendance Date</label>
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

                    {/* Student count badge */}
                    {selectedClass && students?.length > 0 && (
                        <div className="flex items-center gap-3 p-4 bg-brand-primary/5 border border-brand-primary/20 rounded-md">
                            <Users size={14} className="text-brand-primary" />
                            <span className="text-[10px] font-black uppercase tracking-widest text-brand-primary">
                                {students.length} Students Loaded
                            </span>
                        </div>
                    )}
                </div>

                <div className="bg-slate-900/40 p-10 rounded-md border border-slate-800/60 shadow-2xl flex flex-col justify-center space-y-4">
                    <div className="bg-slate-800/60 border border-slate-700/50 p-6 rounded-md group hover:border-brand-primary/40 transition-all cursor-pointer relative overflow-hidden flex-1 flex flex-col items-center justify-center min-h-[160px]">
                        <input type="file" accept=".csv" onChange={(e) => setCsvFile(e.target.files[0])} className="absolute inset-0 opacity-0 cursor-pointer z-10" />
                        <div className="w-16 h-16 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-600 group-hover:text-brand-primary group-hover:scale-110 transition-all shadow-2xl mb-4">
                            <FileText size={32} />
                        </div>
                        <div className="text-center">
                            <p className="text-sm font-black text-white italic uppercase">{csvFile ? csvFile.name : 'Select Attendance CSV File'}</p>
                            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-2">Format: AdmissionNumber, Status</p>
                        </div>
                    </div>

                    {/* Download Template — filled with real students */}
                    <button
                        type="button"
                        onClick={downloadExampleCsv}
                        className="w-full h-11 bg-slate-800/80 hover:bg-emerald-500/10 border border-slate-700 hover:border-emerald-500/50 text-slate-400 hover:text-emerald-400 rounded-md font-black text-[10px] uppercase tracking-widest transition-all flex items-center justify-center gap-2 italic"
                    >
                        <Download size={14} />
                        {selectedClass && students?.length > 0
                            ? `Download Template (${students.length} students)`
                            : 'Download CSV Template'}
                    </button>

                    <button 
                        onClick={handleBulkUpload} 
                        disabled={loading || !csvFile || !selectedClass || !selectedDate} 
                        className="w-full h-14 bg-brand-primary hover:bg-teacher-primary disabled:opacity-50 text-white rounded-md font-black text-[11px] uppercase tracking-widest transition-all shadow-2xl flex items-center justify-center gap-3 italic"
                    >
                        {loading ? <Activity size={18} className="animate-spin" /> : <Upload size={18} />} Upload Attendance
                    </button>
                    
                    <p className="text-[9px] text-slate-600 font-bold uppercase tracking-tight text-center leading-relaxed italic">
                        Note: Bulk upload will overwrite any existing attendance for the selected class and date.
                    </p>
                </div>
            </div>
        </motion.div>
    );
};

export default BulkAttendance;
