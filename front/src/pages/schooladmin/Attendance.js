import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchClasses, fetchStudents, fetchAttendance, saveAttendance } from '../../redux/slice/schoolAdmin.slice';
import { motion } from 'framer-motion';
import { Save, CheckCircle, XCircle, Clock, AlertCircle } from 'lucide-react';

const statusOptions = ['Present', 'Absent', 'Late', 'Excused'];
const statusIcon = { Present: CheckCircle, Absent: XCircle, Late: Clock, Excused: AlertCircle };
const statusColor = {
  Present: 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20',
  Absent: 'text-red-400 bg-red-400/10 border-red-400/20',
  Late: 'text-amber-400 bg-amber-400/10 border-amber-400/20',
  Excused: 'text-blue-400 bg-blue-400/10 border-blue-400/20',
};

const Attendance = () => {
  const dispatch = useDispatch();
  const { classes, students, loading } = useSelector((s) => s.schoolAdmin);
  const [selectedClass, setSelectedClass] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [records, setRecords] = useState({});
  const [saved, setSaved] = useState(false);

  useEffect(() => { dispatch(fetchClasses()); }, [dispatch]);

  useEffect(() => {
    if (selectedClass) {
      dispatch(fetchStudents()).then((res) => {
        const classStudents = (res.payload || []).filter(s => s.classSection?._id === selectedClass || s.classSection === selectedClass);
        const init = {};
        classStudents.forEach(s => { init[s._id] = 'Present'; });
        setRecords(init);
      });
    }
  }, [selectedClass, dispatch]);

  const classStudents = students.filter(s => s.classSection?._id === selectedClass || s.classSection === selectedClass);

  const handleSave = async () => {
    const recordsArr = Object.entries(records).map(([studentId, status]) => ({ studentId, status }));
    await dispatch(saveAttendance({ classSection: selectedClass, date, records: recordsArr }));
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const summary = statusOptions.map(s => ({ status: s, count: Object.values(records).filter(r => r === s).length }));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black uppercase tracking-tighter font-outfit">Attendance</h1>
          <p className="text-slate-400 text-sm mt-1">Mark and track student attendance</p>
        </div>
        {selectedClass && classStudents.length > 0 && (
          <button onClick={handleSave} disabled={loading}
            className="flex items-center gap-2 px-5 py-3 bg-emerald-600 hover:bg-emerald-500 rounded-2xl font-black text-sm uppercase tracking-wider transition-all font-outfit">
            <Save size={18} /> {saved ? 'Saved!' : 'Save Attendance'}
          </button>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 font-outfit block mb-2">Select Class</label>
          <select value={selectedClass} onChange={e => setSelectedClass(e.target.value)}
            className="w-full bg-brand-surface/40 border border-brand-border/40 focus:border-brand-primary rounded-2xl py-3 px-5 text-white outline-none transition-all">
            <option value="">Choose a class...</option>
            {classes.map(c => <option key={c._id} value={c._id}>Grade {c.gradeLevel}-{c.sectionLabel}</option>)}
          </select>
        </div>
        <div>
          <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 font-outfit block mb-2">Date</label>
          <input type="date" value={date} onChange={e => setDate(e.target.value)}
            className="w-full bg-brand-surface/40 border border-brand-border/40 focus:border-brand-primary rounded-2xl py-3 px-5 text-white outline-none transition-all" />
        </div>
      </div>

      {selectedClass && (
        <>
          <div className="grid grid-cols-4 gap-3">
            {summary.map(({ status, count }) => {
              const Icon = statusIcon[status];
              return (
                <div key={status} className={`flex items-center gap-3 px-5 py-4 rounded-2xl border ${statusColor[status]}`}>
                  <Icon size={18} />
                  <div>
                    <p className="text-xs font-black uppercase tracking-wider font-outfit">{status}</p>
                    <p className="text-xl font-black font-outfit">{count}</p>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="bg-brand-surface/40 backdrop-blur-xl border border-brand-border/40 rounded-[2rem] overflow-hidden">
            {classStudents.length === 0 ? (
              <div className="py-16 text-center text-slate-500 italic">No students in this class</div>
            ) : (
              <table className="w-full">
                <thead>
                  <tr className="border-b border-brand-border/30">
                    {['Student', 'Admission No.', 'Status'].map(h => (
                      <th key={h} className="px-6 py-4 text-left text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 font-outfit">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {classStudents.map((s, i) => (
                    <motion.tr key={s._id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.02 }}
                      className="border-b border-brand-border/20 hover:bg-slate-800/20 transition-colors">
                      <td className="px-6 py-4 font-semibold">{s.firstName} {s.lastName}</td>
                      <td className="px-6 py-4 text-slate-400 text-sm">{s.admissionNumber}</td>
                      <td className="px-6 py-4">
                        <div className="flex gap-2 flex-wrap">
                          {statusOptions.map(status => (
                            <button key={status} onClick={() => setRecords(r => ({ ...r, [s._id]: status }))}
                              className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider border transition-all font-outfit ${records[s._id] === status ? statusColor[status] : 'text-slate-600 bg-transparent border-slate-700 hover:border-slate-500'}`}>
                              {status}
                            </button>
                          ))}
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </>
      )}

      {!selectedClass && (
        <div className="py-20 text-center text-slate-500 italic">Select a class to mark attendance</div>
      )}
    </div>
  );
};

export default Attendance;
