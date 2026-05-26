import React, { useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  fetchAcademicYears,
  changeAcademicYear,
  refetchYearSensitiveData,
} from '../redux/slice/academicYear.slice';
import { normalizeYearId } from '../utils/academicYearContext';
import { Calendar, ChevronDown, RefreshCw } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';

const AcademicYearSwitcher = () => {
  const dispatch = useDispatch();
  const { academicYears, activeAcademicYearId, activeAcademicYear, loading, switching } =
    useSelector((state) => state.academicYear);
  const [isOpen, setIsOpen] = React.useState(false);
  const initialLoadDone = useRef(false);

  useEffect(() => {
    dispatch(fetchAcademicYears());
  }, [dispatch]);

  useEffect(() => {
    const onInvalid = () => {
      initialLoadDone.current = false;
      dispatch(fetchAcademicYears());
      toast.error('Session expired. Please select an academic year again.');
    };
    window.addEventListener('academic-year-invalid', onInvalid);
    return () => window.removeEventListener('academic-year-invalid', onInvalid);
  }, [dispatch]);

  const activeId = normalizeYearId(activeAcademicYearId);

  useEffect(() => {
    if (activeId && academicYears.length > 0 && !initialLoadDone.current) {
      initialLoadDone.current = true;
      dispatch(refetchYearSensitiveData());
    }
  }, [activeId, academicYears.length, dispatch]);
  const activeYear =
    activeAcademicYear ||
    academicYears.find((y) => normalizeYearId(y._id) === activeId);

  const handleYearChange = async (id) => {
    const nextId = normalizeYearId(id);
    if (!nextId || nextId === activeId) {
      setIsOpen(false);
      return;
    }
    setIsOpen(false);
    try {
      await dispatch(changeAcademicYear(nextId)).unwrap();
      const label = academicYears.find((y) => normalizeYearId(y._id) === nextId)?.name;
      toast.success(`Session switched to ${label || 'selected year'}`);
    } catch (err) {
      toast.error(err?.message || 'Failed to switch academic session');
    }
  };

  if (academicYears.length === 0 && !loading) return null;

  return (
    <div className="relative group">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        disabled={switching}
        className={`flex items-center gap-3 px-4 py-2.5 rounded-md border transition-all duration-300 ${
          isOpen
            ? 'bg-schooladmin-primary text-black border-schooladmin-primary shadow-lg shadow-schooladmin-primary/20'
            : 'bg-brand-background border-brand-border text-slate-400 hover:text-white hover:border-schooladmin-primary/40 shadow-inner'
        } ${switching ? 'opacity-70' : ''}`}
      >
        {switching ? (
          <RefreshCw size={16} className="animate-spin text-schooladmin-primary" />
        ) : (
          <Calendar size={16} className={isOpen ? 'text-black' : 'text-schooladmin-primary'} />
        )}
        <div className="text-left hidden md:block">
          <p
            className={`text-[9px] font-black uppercase tracking-[0.2em] leading-none mb-1 ${
              isOpen ? 'text-black/60' : 'text-slate-500'
            }`}
          >
            Session
          </p>
          <p className="text-[11px] font-black uppercase tracking-widest leading-none font-outfit truncate max-w-[100px]">
            {activeYear ? activeYear.name : 'Select Year'}
          </p>
        </div>
        <ChevronDown
          size={14}
          className={`transition-transform duration-300 ${isOpen ? 'rotate-180 text-black' : 'opacity-40'}`}
        />
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
                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 italic">
                  Academic session
                </p>
              </div>
              <div className="max-h-64 overflow-y-auto custom-scrollbar">
                {academicYears.map((year) => {
                  const yearId = normalizeYearId(year._id);
                  const selected = yearId === activeId;
                  return (
                    <button
                      key={yearId}
                      type="button"
                      onClick={() => handleYearChange(yearId)}
                      className={`w-full flex items-center justify-between px-4 py-3 rounded-md transition-all text-left mb-1 ${
                        selected
                          ? 'bg-schooladmin-primary/10 text-schooladmin-primary border border-schooladmin-primary/20'
                          : 'text-slate-400 hover:bg-white/5 hover:text-white'
                      }`}
                    >
                      <div className="flex flex-col">
                        <span className="text-[11px] font-black uppercase tracking-widest font-outfit">
                          {year.name}
                        </span>
                        {year.isCurrent && (
                          <span className="text-[8px] font-black text-emerald-500 uppercase tracking-tighter mt-1 italic leading-none">
                            Current session
                          </span>
                        )}
                      </div>
                      {selected && <RefreshCw size={12} className={switching ? 'animate-spin' : ''} />}
                    </button>
                  );
                })}
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
