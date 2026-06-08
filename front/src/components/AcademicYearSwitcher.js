import React, { useEffect, useRef, useState, useCallback } from 'react';
import ReactDOM from 'react-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  fetchAcademicYears,
  changeAcademicYear,
  refetchYearSensitiveData,
} from '../redux/slice/academicYear.slice';
import { normalizeYearId } from '../utils/academicYearContext';
import { Calendar, ChevronDown, RefreshCw, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';

// Role → Tailwind color token (must be safelisted / used literally so Tailwind includes them)
const ROLE_THEME = {
  School_Admin: {
    btn:        'border-schooladmin-primary text-schooladmin-primary hover:bg-schooladmin-primary/10',
    btnOpen:    'bg-schooladmin-primary border-schooladmin-primary text-black',
    icon:       'text-schooladmin-primary',
    selected:   'bg-schooladmin-primary/10 text-schooladmin-primary border-l-2 border-schooladmin-primary',
    badge:      'text-schooladmin-primary',
    check:      'text-schooladmin-primary',
    spinner:    'text-schooladmin-primary',
  },
  Teacher: {
    btn:        'border-teacher-primary text-teacher-primary hover:bg-teacher-primary/10',
    btnOpen:    'bg-teacher-primary border-teacher-primary text-black',
    icon:       'text-teacher-primary',
    selected:   'bg-teacher-primary/10 text-teacher-primary border-l-2 border-teacher-primary',
    badge:      'text-teacher-primary',
    check:      'text-teacher-primary',
    spinner:    'text-teacher-primary',
  },
  Accountant: {
    btn:        'border-accountant-primary text-accountant-primary hover:bg-accountant-primary/10',
    btnOpen:    'bg-accountant-primary border-accountant-primary text-black',
    icon:       'text-accountant-primary',
    selected:   'bg-accountant-primary/10 text-accountant-primary border-l-2 border-accountant-primary',
    badge:      'text-accountant-primary',
    check:      'text-accountant-primary',
    spinner:    'text-accountant-primary',
  },
  Student: {
    btn:        'border-brand-primary text-brand-primary hover:bg-brand-primary/10',
    btnOpen:    'bg-brand-primary border-brand-primary text-black',
    icon:       'text-brand-primary',
    selected:   'bg-brand-primary/10 text-brand-primary border-l-2 border-brand-primary',
    badge:      'text-brand-primary',
    check:      'text-brand-primary',
    spinner:    'text-brand-primary',
  },
  default: {
    btn:        'border-brand-primary text-brand-primary hover:bg-brand-primary/10',
    btnOpen:    'bg-brand-primary border-brand-primary text-black',
    icon:       'text-brand-primary',
    selected:   'bg-brand-primary/10 text-brand-primary border-l-2 border-brand-primary',
    badge:      'text-brand-primary',
    check:      'text-brand-primary',
    spinner:    'text-brand-primary',
  },
};

const AcademicYearSwitcher = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((s) => s.auth);
  const { academicYears, activeAcademicYearId, activeAcademicYear, loading, switching } =
    useSelector((s) => s.academicYear);

  const [isOpen,  setIsOpen]  = useState(false);
  const [pos,     setPos]     = useState({ top: 0, right: 0 });
  const btnRef             = useRef(null);
  const initialLoadDone    = useRef(false);

  const t        = ROLE_THEME[user?.role] || ROLE_THEME.default;
  const activeId = normalizeYearId(activeAcademicYearId);
  const activeYear =
    activeAcademicYear || academicYears.find((y) => normalizeYearId(y._id) === activeId);

  // ── Side-effects ──────────────────────────────────────────────────────────
  useEffect(() => { dispatch(fetchAcademicYears()); }, [dispatch]);

  useEffect(() => {
    const onInvalid = () => {
      initialLoadDone.current = false;
      dispatch(fetchAcademicYears());
      toast.error('Session expired. Please select an academic year again.');
    };
    window.addEventListener('academic-year-invalid', onInvalid);
    return () => window.removeEventListener('academic-year-invalid', onInvalid);
  }, [dispatch]);

  useEffect(() => {
    if (activeId && academicYears.length > 0 && !initialLoadDone.current) {
      initialLoadDone.current = true;
      dispatch(refetchYearSensitiveData());
    }
  }, [activeId, academicYears.length, dispatch]);

  // ── Positioning ───────────────────────────────────────────────────────────
  const calcPos = useCallback(() => {
    if (!btnRef.current) return;
    const r = btnRef.current.getBoundingClientRect();
    setPos({ top: r.bottom + window.scrollY + 8, right: window.innerWidth - r.right });
  }, []);

  const handleToggle = () => {
    if (isOpen) { setIsOpen(false); return; }
    calcPos();
    setIsOpen(true);
  };

  useEffect(() => {
    if (!isOpen) return;
    window.addEventListener('scroll', calcPos, true);
    window.addEventListener('resize', calcPos);
    return () => {
      window.removeEventListener('scroll', calcPos, true);
      window.removeEventListener('resize', calcPos);
    };
  }, [isOpen, calcPos]);

  // ── Year change ───────────────────────────────────────────────────────────
  const handleYearChange = async (id) => {
    const nextId = normalizeYearId(id);
    if (!nextId || nextId === activeId) { setIsOpen(false); return; }
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

  // ── Portal dropdown ───────────────────────────────────────────────────────
  const dropdown = (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Click-away backdrop */}
          <div
            className="fixed inset-0"
            style={{ zIndex: 9998 }}
            onClick={() => setIsOpen(false)}
          />

          <motion.div
            initial={{ opacity: 0, y: 6, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 6, scale: 0.97 }}
            transition={{ duration: 0.14 }}
            className="absolute w-52 rounded-xl overflow-hidden
                       bg-brand-surface border border-brand-border
                       shadow-[0_24px_48px_rgba(0,0,0,0.7)]"
            style={{ top: pos.top, right: pos.right, zIndex: 9999 }}
          >
            {/* Header */}
            <div className="px-4 py-3 border-b border-brand-border bg-brand-surface">
              <p className="text-[9px] font-black uppercase tracking-[0.3em] text-slate-500">
                Academic Session
              </p>
            </div>

            {/* Year list */}
            <div className="max-h-56 overflow-y-auto bg-brand-surface">
              {academicYears.map((year) => {
                const yearId   = normalizeYearId(year._id);
                const selected = yearId === activeId;
                return (
                  <button
                    key={yearId}
                    type="button"
                    onClick={() => handleYearChange(yearId)}
                    className={`w-full flex items-center justify-between px-4 py-2.5
                                transition-all duration-150 text-left border-l-2
                                ${selected
                                  ? t.selected
                                  : 'border-transparent text-slate-400 hover:bg-white/5 hover:text-white bg-brand-surface'
                                }`}
                  >
                    <span className="flex flex-col">
                      <span className="text-[11px] font-black tracking-wide">
                        {year.name}
                      </span>
                      {year.isCurrent && (
                        <span className="text-[8px] font-black uppercase tracking-wider text-luxury-emerald mt-0.5">
                          Current Session
                        </span>
                      )}
                    </span>

                    {selected && (
                      switching
                        ? <RefreshCw size={11} className={`${t.check} animate-spin`} />
                        : <Check     size={11} className={`${t.check} opacity-70`} />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Loading bar */}
            {loading && (
              <div className="flex justify-center py-3 border-t border-brand-border bg-brand-surface">
                <RefreshCw size={14} className={`${t.spinner} animate-spin`} />
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );

  return (
    <>
      {/* ── Trigger button ─────────────────────────────────────────────── */}
      <button
        ref={btnRef}
        type="button"
        onClick={handleToggle}
        disabled={switching}
        className={`flex items-center gap-2.5 px-3.5 py-2 rounded-lg border
                    transition-all duration-200 whitespace-nowrap
                    ${isOpen ? t.btnOpen : `bg-brand-background ${t.btn}`}
                    ${switching ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'}`}
      >
        {switching
          ? <RefreshCw size={14} className={`animate-spin ${isOpen ? 'text-black' : t.icon}`} />
          : <Calendar   size={14} className={isOpen ? 'text-black' : t.icon} />
        }

        <span className="hidden sm:flex flex-col items-start leading-none gap-0.5">
          <span className={`text-[8px] font-black uppercase tracking-[0.2em]
                            ${isOpen ? 'text-black/60' : 'text-slate-500'}`}>
            Session
          </span>
          <span className={`text-[11px] font-black tracking-wide
                            ${isOpen ? 'text-black' : 'text-white'}`}>
            {activeYear ? activeYear.name : 'Select Year'}
          </span>
        </span>

        <ChevronDown
          size={12}
          className={`transition-transform duration-200
                      ${isOpen ? 'rotate-180 text-black' : 'opacity-50 text-slate-400'}`}
        />
      </button>

      {/* Portal — renders outside every stacking context */}
      {ReactDOM.createPortal(dropdown, document.body)}
    </>
  );
};

export default AcademicYearSwitcher;
