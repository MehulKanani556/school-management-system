import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchAcademicYears, setActiveYear } from '../redux/slice/academicYear.slice';
import { fetchFees, fetchFeeStructures, fetchStudents, fetchExams, fetchDashboard } from '../redux/slice/schoolAdmin.slice';
import { Calendar, ChevronDown, RefreshCw } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const AcademicYearSwitcher = () => {
  const dispatch = useDispatch();
  const { academicYears, activeAcademicYearId, loading } = useSelector((state) => state.academicYear);
  const [isOpen, setIsOpen] = React.useState(false);

  useEffect(() => {
    dispatch(fetchAcademicYears());
  }, [dispatch]);

  const activeYear = academicYears.find(y => y._id === activeAcademicYearId);

  const handleYearChange = (id) => {
    dispatch(setActiveYear(id));
    setIsOpen(false);
    // Refetch year-sensitive data with the new academicYearId header (set via axiosInstance interceptor)
    dispatch(fetchDashboard());
    dispatch(fetchFees());
    dispatch(fetchFeeStructures());
    dispatch(fetchStudents());
    // Note: fetchAttendance requires specific params (standardId, classSection, date)
    // Individual pages will refetch attendance data via useEffect watching activeAcademicYearId
    dispatch(fetchExams());
  };

  if (academicYears.length === 0 && !loading) return null;

  return (
    <div className="relative group">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center gap-3 px-4 py-2.5 rounded-md border transition-all duration-300 ${
          isOpen 
            ? 'bg-schooladmin-primary text-black border-schooladmin-primary shadow-lg shadow-schooladmin-primary/20' 
            : 'bg-brand-background border-brand-border text-slate-400 hover:text-white hover:border-schooladmin-primary/40 shadow-inner'
        }`}
      >
        <Calendar size={16} className={isOpen ? 'text-black' : 'text-schooladmin-primary'} />
        <div className="text-left hidden md:block">
          <p className={`text-[9px] font-black uppercase tracking-[0.2em] leading-none mb-1 ${isOpen ? 'text-black/60' : 'text-slate-500'}`}>Session</p>
          <p className="text-[11px] font-black uppercase tracking-widest leading-none font-outfit truncate max-w-[80px]">
            {activeYear ? activeYear.name : 'Select Year'}
          </p>
        </div>
        <ChevronDown size={14} className={`transition-transform duration-300 ${isOpen ? 'rotate-180 text-black' : 'opacity-40'}`} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            <div className="fixed inset-0 z-10" onClick={() => setIsOpen(false)} />
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              className="absolute right-0 top-[calc(100%+12px)] z-[999] w-56 p-2 rounded-md bg-brand-surface border border-brand-border shadow-3xl backdrop-blur-xl"
            >
              <div className="px-4 py-3 border-b border-brand-border mb-1">
                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 italic">Temporal Shifting</p>
              </div>
              <div className="max-h-64 overflow-y-auto custom-scrollbar">
                {academicYears.map((year) => (
                  <button
                    key={year._id}
                    onClick={() => handleYearChange(year._id)}
                    className={`w-full flex items-center justify-between px-4 py-3 rounded-md transition-all text-left mb-1 ${
                      activeAcademicYearId === year._id
                        ? 'bg-schooladmin-primary/10 text-schooladmin-primary border border-schooladmin-primary/20'
                        : 'text-slate-400 hover:bg-white/5 hover:text-white'
                    }`}
                  >
                    <div className="flex flex-col">
                      <span className="text-[11px] font-black uppercase tracking-widest font-outfit">{year.name}</span>
                      {year.isCurrent && (
                        <span className="text-[8px] font-black text-emerald-500 uppercase tracking-tighter mt-1 italic leading-none">Global Active Node</span>
                      )}
                    </div>
                    {activeAcademicYearId === year._id && <RefreshCw size={12} className="animate-spin-slow" />}
                  </button>
                ))}
              </div>
              {loading && (
                <div className="flex justify-center p-3">
                  <RefreshCw size={16} className="animate-spin text-schooladmin-primary" />
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AcademicYearSwitcher;
