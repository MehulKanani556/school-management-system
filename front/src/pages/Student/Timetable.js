import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchStudentTimetable } from '../../redux/slice/student.slice';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Clock,
    Calendar,
    MapPin,
    Layers,
    Users,
    LayoutGrid,
    List,
    ChevronRight,
    Download,
    Coffee,
    Loader2,
} from 'lucide-react';
import { jsPDF } from 'jspdf';

const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

/* ─── helpers ─────────────────────────────────────────────── */
const isBreak = (slot) => slot?.type && slot.type !== 'Lecture';

const getTimeIntensity = (time = '') => {
    const hour = parseInt(time.split(':')[0]) || 0;
    if (hour < 10) return 'from-cyan-500 to-blue-600';
    if (hour < 13) return 'from-luxury-emerald to-emerald-600';
    if (hour < 16) return 'from-brand-primary to-blue-600';
    return 'from-rose-500 to-purple-600';
};

/* ─── Direct PDF download via jsPDF ─────────────────────── */
const generateAndDownloadPDF = (timetable, activeAcademicYear) => {
    const session = activeAcademicYear?.name || 'N/A';
    const today = new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' });
    const filename = `Timetable_${session.replace(/[^a-zA-Z0-9-]/g, '_')}.pdf`;

    // A4 Landscape: 297 x 210 mm
    const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
    const W = 297; // page width mm
    const margin = 12;
    const contentW = W - margin * 2;

    // ── colour palette
    const C = {
        dark:    [15, 15, 18],
        slate:   [30, 41, 59],
        accent:  [37, 99, 235],
        sky:     [14, 165, 233],
        emerald: [16, 185, 129],
        muted:   [100, 116, 139],
        light:   [241, 245, 249],
        white:   [255, 255, 255],
        border:  [203, 213, 225],
    };

    let y = margin;

    // ── Header bar
    doc.setFillColor(...C.dark);
    doc.rect(margin, y, contentW, 18, 'F');
    doc.setTextColor(...C.white);
    doc.setFontSize(13);
    doc.setFont('helvetica', 'bold');
    doc.text('SCHOOL ACADEMIC TIMETABLE', margin + 5, y + 7);
    doc.setFontSize(7);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...C.muted);
    doc.text(`OFFICIAL SCHOOL RECORD  //  SESSION ${session.toUpperCase()}`, margin + 5, y + 13);
    // date right-aligned
    doc.setTextColor(...C.white);
    doc.setFontSize(7);
    doc.text(today, W - margin - 2, y + 10, { align: 'right' });
    y += 22;

    // ── Build schedule map
    const scheduleMap = {};
    (timetable?.schedule || []).forEach(s => { scheduleMap[s.day] = s.periods || []; });

    // max rows
    const maxRows = days.reduce((m, d) => Math.max(m, (scheduleMap[d] || []).length), 0);
    if (maxRows === 0) {
        doc.setTextColor(...C.muted);
        doc.setFontSize(10);
        doc.text('No timetable data available.', W / 2, 120, { align: 'center' });
        doc.save(filename);
        return;
    }

    // ── Column layout
    const labelColW = 22;
    const dayColW = (contentW - labelColW) / days.length;
    const rowH = 22;
    const headerH = 10;

    // Day header row
    const hx = margin + labelColW;
    doc.setFillColor(...C.slate);
    doc.rect(margin, y, labelColW, headerH, 'F');
    doc.setTextColor(...C.muted);
    doc.setFontSize(6);
    doc.setFont('helvetica', 'bold');
    doc.text('SLOT', margin + labelColW / 2, y + 6.5, { align: 'center' });

    days.forEach((day, di) => {
        const x = hx + di * dayColW;
        doc.setFillColor(...C.dark);
        doc.rect(x, y, dayColW, headerH, 'F');
        // accent left border on current day header
        doc.setFontSize(7);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(...C.white);
        doc.text(day.toUpperCase(), x + dayColW / 2, y + 6.5, { align: 'center' });
    });
    y += headerH;

    // Rows
    for (let ri = 0; ri < maxRows; ri++) {
        // determine if this is a break row (check Monday)
        const refSlot = (scheduleMap['Monday'] || [])[ri];
        const rowIsBrk = refSlot ? isBreak(refSlot) : false;

        // Row label cell
        const bgLabel = rowIsBrk ? [240, 249, 255] : (ri % 2 === 0 ? C.light : C.white);
        doc.setFillColor(...bgLabel);
        doc.rect(margin, y, labelColW, rowH, 'F');
        doc.setDrawColor(...C.border);
        doc.setLineWidth(0.2);
        doc.rect(margin, y, labelColW, rowH);
        doc.setFontSize(6);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(...(rowIsBrk ? C.sky : C.muted));
        doc.text(rowIsBrk ? 'BRK' : `P ${ri + 1 < 10 ? '0' + (ri + 1) : ri + 1}`, margin + labelColW / 2, y + rowH / 2 + 1, { align: 'center' });

        // Day cells
        days.forEach((day, di) => {
            const x = hx + di * dayColW;
            const slot = (scheduleMap[day] || [])[ri];
            const br = slot ? isBreak(slot) : false;

            const bgCell = br ? [224, 242, 254] : (ri % 2 === 0 ? C.light : C.white);
            doc.setFillColor(...bgCell);
            doc.rect(x, y, dayColW, rowH, 'F');
            doc.setDrawColor(...C.border);
            doc.setLineWidth(0.2);
            doc.rect(x, y, dayColW, rowH);

            if (slot) {
                const pad = 2.5;
                // Time
                doc.setFontSize(6);
                doc.setFont('helvetica', 'bold');
                doc.setTextColor(...(br ? C.sky : C.emerald));
                doc.text(`${slot.startTime} – ${slot.endTime}`, x + pad, y + 5);

                // Subject / break type
                const label = br ? slot.type.toUpperCase() : (slot.subject?.name || 'Subject').toUpperCase();
                doc.setFontSize(7);
                doc.setFont('helvetica', 'bold');
                doc.setTextColor(...(br ? C.sky : C.dark));
                // word-wrap if too long
                const wrapped = doc.splitTextToSize(label, dayColW - pad * 2);
                doc.text(wrapped.slice(0, 2), x + pad, y + 10);

                // Teacher / intermission
                doc.setFontSize(5.5);
                doc.setFont('helvetica', 'normal');
                doc.setTextColor(...C.muted);
                if (br) {
                    doc.text('INTERMISSION', x + pad, y + rowH - 4);
                } else {
                    const teacher = `${slot.teacher?.firstName || ''} ${slot.teacher?.lastName || 'Staff'}`.trim();
                    doc.text(teacher.toUpperCase(), x + pad, y + rowH - 7);
                    doc.text(`RM: ${slot.room || 'TBA'}`, x + pad, y + rowH - 3);
                }
            }
        });

        y += rowH;
    }

    // ── Footer
    y += 6;
    doc.setFontSize(6);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...C.muted);
    doc.text('Official Timetable // End of Report', margin, y);
    doc.text('Generated via School Management System', W - margin, y, { align: 'right' });

    doc.save(filename);
};

/* ─── Component ───────────────────────────────────────────── */
const Timetable = () => {
    const dispatch = useDispatch();
    const { timetable, loading } = useSelector((state) => state.student);
    const { activeAcademicYearId, activeAcademicYear } = useSelector((state) => state.academicYear || {});
    const [activeDay, setActiveDay] = useState('Monday');
    const [viewMode, setViewMode] = useState('daily');
    const [hoveredNode, setHoveredNode] = useState(null);
    const [pdfLoading, setPdfLoading] = useState(false);

    useEffect(() => {
        dispatch(fetchStudentTimetable());
        const dayName = new Date().toLocaleDateString('en-US', { weekday: 'long' });
        if (days.includes(dayName)) setActiveDay(dayName);
    }, [dispatch, activeAcademicYearId]);

    const dailySchedule = timetable?.schedule?.find(s => s.day === activeDay)?.periods || [];
    const studyPeriods = dailySchedule.filter(p => !isBreak(p));
    const maxPeriodsCount = timetable?.schedule?.reduce((max, s) => Math.max(max, s.periods?.length || 0), 0) || 7;

    /* Direct PDF download — no print dialog */
    const handleDownloadPDF = () => {
        if (!timetable?.schedule?.length) return;
        setPdfLoading(true);
        // defer one tick so the spinner renders before the heavy PDF work
        setTimeout(() => {
            try {
                generateAndDownloadPDF(timetable, activeAcademicYear);
            } finally {
                setPdfLoading(false);
            }
        }, 50);
    };

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-10 max-w-7xl mx-auto pb-20 font-outfit"
        >
            {/* Header */}
            <header className="relative overflow-hidden bg-[#0f0f12] border border-slate-800/60 p-10 md:p-14 rounded-md shadow-2xl backdrop-blur-3xl group no-print font-outfit">
                <div className="absolute top-0 right-0 w-[40%] h-full bg-gradient-to-l from-luxury-emerald/5 to-transparent skew-x-12 -mr-20" />
                <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-brand-primary/5 rounded-md blur-[100px] opacity-50" />

                <div className="relative z-10 flex flex-col xl:flex-row xl:items-center justify-between gap-12">
                    <div className="space-y-6">
                        <div className="flex items-center gap-4">
                            <span className="px-3 py-1 bg-luxury-emerald/10 text-luxury-emerald text-[9px] font-black uppercase tracking-[0.4em] border border-luxury-emerald/20 rounded-md italic">
                                Session: {activeAcademicYear?.name || 'Loading…'}
                            </span>
                            <span className="w-1.5 h-1.5 rounded-md bg-slate-800" />
                            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest italic">
                                {new Date().toLocaleDateString('en-GB', { year: 'numeric', month: 'long', day: 'numeric' }).toUpperCase()}
                            </span>
                        </div>
                        <h1 className="text-5xl md:text-6xl font-black text-white italic uppercase tracking-tighter leading-none">
                            Class <span className="text-brand-primary">Timetable</span>
                        </h1>
                        <p className="text-slate-500 font-medium text-lg leading-relaxed max-w-2xl italic">
                            Access your daily class schedule, subject periods, breaks, and teacher assignments.
                        </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-4">
                        <div className="flex bg-slate-950/60 p-1.5 rounded-md border border-slate-800 shadow-inner h-16 items-center">
                            <button
                                onClick={() => setViewMode('daily')}
                                className={`px-8 h-full rounded-md flex items-center gap-3 text-[10px] font-black uppercase tracking-[0.2em] transition-all italic ${viewMode === 'daily' ? 'bg-brand-primary text-black shadow-lg translate-y-[-1px]' : 'text-slate-500 hover:text-white'}`}
                            >
                                <List size={16} /> Daily Schedule
                            </button>
                            <button
                                onClick={() => setViewMode('weekly')}
                                className={`px-8 h-full rounded-md flex items-center gap-3 text-[10px] font-black uppercase tracking-[0.2em] transition-all italic ${viewMode === 'weekly' ? 'bg-brand-primary text-black shadow-lg translate-y-[-1px]' : 'text-slate-500 hover:text-white'}`}
                            >
                                <LayoutGrid size={16} /> Weekly View
                            </button>
                        </div>
                    </div>
                </div>
            </header>

            {/* Day Selector */}
            <nav className="no-print flex items-center justify-center">
                <div className="flex bg-[#0f0f12] p-2 rounded-md border border-slate-800/60 shadow-2xl backdrop-blur-xl max-w-full overflow-x-auto no-scrollbar">
                    {days.map((day, idx) => (
                        <button
                            key={day}
                            onClick={() => { setActiveDay(day); setViewMode('daily'); }}
                            className={`relative px-10 py-5 rounded-md text-[11px] font-black uppercase tracking-[0.3em] transition-all duration-500 whitespace-nowrap overflow-hidden group/nav ${activeDay === day && viewMode === 'daily'
                                ? 'text-brand-primary'
                                : 'text-slate-500 hover:text-white'
                                }`}
                        >
                            {activeDay === day && viewMode === 'daily' && (
                                <motion.div
                                    layoutId="nav-glow"
                                    className="absolute inset-x-4 bottom-1 h-0.5 bg-brand-primary shadow-[0_0_15px_rgba(37,99,235,0.8)]"
                                />
                            )}
                            <span className="relative z-10 italic">{day.slice(0, 3)}</span>
                            <span className="absolute -bottom-4 left-1/2 -translate-x-1/2 text-[30px] opacity-0 group-hover/nav:opacity-5 transition-opacity font-black select-none pointer-events-none">{idx + 1}</span>
                        </button>
                    ))}
                </div>
            </nav>

            <AnimatePresence mode="wait">
                {viewMode === 'daily' ? (
                    <motion.div
                        key="daily"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start no-print"
                    >
                        {/* Summary Deck */}
                        <aside className="lg:col-span-4 space-y-8 lg:sticky lg:top-24">
                            <div className="bg-[#0f0f12] border border-slate-800/60 rounded-md p-10 shadow-2xl space-y-12">
                                <div className="space-y-4">
                                    <h3 className="text-sm font-black text-white uppercase tracking-[0.3em] italic flex items-center gap-3">
                                        <div className="w-8 h-px bg-brand-primary" /> Daily Summary
                                    </h3>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="bg-slate-950/60 border border-slate-800 p-6 rounded-md group hover:border-brand-primary/30 transition-all">
                                            <p className="text-[9px] font-black text-slate-600 uppercase tracking-widest mb-2 italic">Total Slots</p>
                                            <p className="text-3xl font-black text-white italic">
                                                {dailySchedule.length < 10 ? `0${dailySchedule.length}` : dailySchedule.length}
                                            </p>
                                        </div>
                                        <div className="bg-slate-950/60 border border-slate-800 p-6 rounded-md">
                                            <p className="text-[9px] font-black text-slate-600 uppercase tracking-widest mb-2 italic">Study Hours</p>
                                            <p className="text-3xl font-black text-white italic">{(studyPeriods.length * 0.75).toFixed(1)}</p>
                                        </div>
                                    </div>
                                    <div className="bg-slate-950/60 border border-slate-800/60 p-4 rounded-md">
                                        <p className="text-[9px] font-black text-slate-600 uppercase tracking-widest mb-2 italic">Breaks</p>
                                        <p className="text-xl font-black text-white italic">
                                            {dailySchedule.filter(isBreak).length < 10
                                                ? `0${dailySchedule.filter(isBreak).length}`
                                                : dailySchedule.filter(isBreak).length}
                                        </p>
                                    </div>
                                </div>

                                <div className="space-y-6">
                                    <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.4em] italic mb-6">Subjects Today</h4>
                                    <div className="space-y-4">
                                        {Array.from(new Set(
                                            dailySchedule
                                                .filter(s => !isBreak(s))
                                                .map(s => s.subject?.name || 'General')
                                        )).map((sub, i) => (
                                            <div key={i} className="flex items-center justify-between text-[11px] font-bold text-slate-400 group cursor-pointer hover:text-white transition-colors">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-1.5 h-1.5 rounded-md bg-brand-primary group-hover:scale-150 transition-transform" />
                                                    <span className="uppercase tracking-widest">{sub}</span>
                                                </div>
                                                <ChevronRight size={14} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className="pt-10 border-t border-slate-800/60">
                                    <div className="p-6 bg-gradient-to-br from-indigo-500/10 to-transparent border border-indigo-500/20 rounded-md flex items-center gap-5 group cursor-help">
                                        <div className="p-3 bg-indigo-500/20 rounded text-indigo-400 group-hover:scale-110 transition-transform"><Layers size={18} /></div>
                                        <p className="text-[10px] font-black text-indigo-300 italic uppercase leading-relaxed tracking-wider">
                                            Timetable is up to date. Use the year switcher in the top bar to view other sessions.
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Download PDF Button */}
                            <div className="p-1 rounded-md shadow-[0_0_50px_rgba(37,99,235,0.1)] bg-brand-primary">
                                <button
                                    id="download-timetable-pdf"
                                    onClick={handleDownloadPDF}
                                    disabled={pdfLoading}
                                    className="w-full py-5 bg-[#0f0f12] hover:bg-slate-900 disabled:opacity-60 disabled:cursor-wait rounded-md text-brand-primary text-[10px] font-black uppercase tracking-[0.4em] transition-all flex items-center justify-center gap-4 italic group"
                                >
                                    {pdfLoading
                                        ? <><Loader2 size={16} className="animate-spin" /> Generating…</>
                                        : <>Download PDF <Download size={16} className="group-hover:translate-y-1 transition-transform" /></>}
                                </button>
                            </div>
                        </aside>

                        {/* Timeline Feed */}
                        <div className="lg:col-span-8 space-y-8">
                            {dailySchedule.length > 0 ? (
                                <div className="relative pl-12 space-y-12 before:absolute before:left-[19px] before:top-2 before:bottom-2 before:w-[2px] before:bg-gradient-to-b before:from-brand-primary before:via-slate-800 before:to-slate-950">
                                    {dailySchedule.map((slot, idx) => (
                                        <motion.div
                                            key={idx}
                                            initial={{ opacity: 0, x: 30 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: idx * 0.07, duration: 0.5 }}
                                            onMouseEnter={() => setHoveredNode(idx)}
                                            onMouseLeave={() => setHoveredNode(null)}
                                            className="group relative"
                                        >
                                            {/* Node Marker */}
                                            <div className={`absolute -left-[53px] top-6 w-10 h-10 rounded-md border-4 border-[#0f0f12] bg-[#0f0f12] flex items-center justify-center z-10 transition-all duration-500 ${hoveredNode === idx ? 'scale-125 border-brand-primary' : ''}`}>
                                                {isBreak(slot)
                                                    ? <Coffee size={16} className="text-brand-primary/60" />
                                                    : <div className={`w-3 h-3 rounded-md bg-gradient-to-tr ${getTimeIntensity(slot.startTime)} transition-all duration-700 ${hoveredNode === idx ? 'scale-150 rounded-sm shadow-[0_0_15px_rgba(37,99,235,0.8)]' : ''}`} />
                                                }
                                            </div>

                                            {/* Period Card */}
                                            <div className={`bg-[#0f0f12] border rounded-md hover:border-brand-primary/30 transition-all duration-700 relative overflow-hidden group/card shadow-[0_20px_50px_rgba(0,0,0,0.3)] ${isBreak(slot) ? 'border-brand-primary/20 p-6' : 'border-slate-800/60 p-10'}`}>
                                                <div className="absolute top-0 right-0 h-full w-[20%] bg-gradient-to-l from-white/5 to-transparent pointer-events-none opacity-0 group-hover/card:opacity-100 transition-opacity" />

                                                {isBreak(slot) ? (
                                                    /* ── Break card ── */
                                                    <div className="flex items-center gap-6">
                                                        <div className="shrink-0 text-center space-y-1 w-24 border-r border-slate-800/60 pr-6">
                                                            <Clock size={14} className="text-brand-primary mx-auto" />
                                                            <span className="text-sm font-black italic text-brand-primary tracking-tight uppercase block">{slot.startTime}</span>
                                                            <p className="text-[8px] font-black text-slate-600 uppercase tracking-widest italic">→ {slot.endTime}</p>
                                                        </div>
                                                        <div className="flex-1">
                                                            <div className="flex items-center gap-3 mb-2">
                                                                <span className="text-[9px] font-black text-brand-primary uppercase tracking-[0.5em] italic">Intermission</span>
                                                                <div className="flex-1 h-px bg-slate-900" />
                                                            </div>
                                                            <div className="py-3 bg-brand-primary/5 rounded-md border border-brand-primary/10 shadow-inner flex items-center justify-center">
                                                                <span className="text-lg font-black uppercase tracking-[0.6em] text-brand-primary/80 italic">{slot.type}</span>
                                                            </div>
                                                            <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mt-2 italic">Recharge &amp; Rest // Free Period</p>
                                                        </div>
                                                    </div>
                                                ) : (
                                                    /* ── Lecture card ── */
                                                    <div className="flex flex-col md:flex-row gap-12 relative z-10">
                                                        {/* Time & Meta */}
                                                        <div className="md:w-48 space-y-6 shrink-0 border-r border-slate-800/60 pr-8">
                                                            <div className="space-y-1">
                                                                <div className="flex items-center gap-2 text-brand-primary mb-2">
                                                                    <Clock size={16} className="animate-pulse" />
                                                                    <span className="text-xl font-black italic tracking-tighter uppercase">{slot.startTime}</span>
                                                                </div>
                                                                <p className="text-[9px] font-black text-slate-600 uppercase tracking-[0.4em] italic leading-tight">Duration Until {slot.endTime}</p>
                                                            </div>
                                                            <div className="flex items-center gap-3 bg-slate-950/60 p-4 rounded-md border border-slate-800/60 group-hover/card:border-brand-primary/20 transition-all shadow-inner">
                                                                <MapPin size={16} className="text-brand-primary" />
                                                                <span className="text-[10px] font-black text-slate-300 uppercase tracking-[0.2em] italic">{slot.room || 'Classroom'}</span>
                                                            </div>
                                                        </div>

                                                        {/* Subject & Faculty */}
                                                        <div className="flex-1 space-y-8">
                                                            <div className="space-y-3">
                                                                <div className="flex items-center gap-3">
                                                                    <span className="text-[9px] font-black text-brand-primary uppercase tracking-[0.5em] italic">Period 0{idx + 1}</span>
                                                                    <div className="flex-1 h-px bg-slate-900" />
                                                                </div>
                                                                <h4 className="text-4xl font-black text-white italic tracking-tighter uppercase leading-none group-hover/card:text-brand-primary transition-all duration-500">
                                                                    {slot.subject?.name || 'Subject Topic'}
                                                                </h4>
                                                            </div>

                                                            <div className="flex flex-wrap items-center gap-10">
                                                                <div className="flex items-center gap-4">
                                                                    <div className="w-12 h-12 rounded-md bg-slate-800 border border-slate-700/50 flex items-center justify-center text-slate-400 group-hover/card:border-brand-primary/30 group-hover:text-brand-primary transition-all shadow-xl">
                                                                        <Users size={20} />
                                                                    </div>
                                                                    <div>
                                                                        <p className="text-[9px] font-black text-slate-600 uppercase tracking-widest mb-1 italic">Subject Teacher</p>
                                                                        <p className="text-[13px] font-black text-white uppercase italic tracking-tight">{slot.teacher?.firstName} {slot.teacher?.lastName || 'Teacher'}</p>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </motion.div>
                                    ))}
                                </div>
                            ) : (
                                <div className="py-48 text-center bg-[#0f0f12] rounded-md border border-dashed border-slate-800/60 shadow-inner group">
                                    <Calendar size={100} className="text-slate-900 mx-auto mb-10 group-hover:scale-110 group-hover:rotate-6 transition-all duration-700 opacity-20" />
                                    <h3 className="text-3xl font-black text-slate-700 uppercase tracking-[0.5em] mb-4 italic">No Classes Today</h3>
                                    <p className="text-slate-800 text-[11px] font-black uppercase tracking-[0.3em] leading-relaxed italic">There are no classes scheduled for {activeDay}.</p>
                                </div>
                            )}
                        </div>
                    </motion.div>
                ) : (
                    /* ── Weekly grid view ── */
                    <motion.div
                        key="weekly"
                        initial={{ opacity: 0, scale: 0.98 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.98 }}
                        className="bg-[#0f0f12] border border-slate-800/60 rounded-md shadow-2xl p-1 no-print"
                    >
                        {/* Download PDF in weekly view */}
                        <div className="flex justify-end p-3">
                            <button
                                id="download-timetable-pdf-weekly"
                                onClick={handleDownloadPDF}
                                disabled={pdfLoading}
                                className="flex items-center gap-2 px-6 py-3 bg-brand-primary/10 border border-brand-primary/30 text-brand-primary text-[10px] font-black uppercase tracking-[0.3em] rounded-md hover:bg-brand-primary/20 disabled:opacity-60 disabled:cursor-wait transition-all italic"
                            >
                                {pdfLoading
                                    ? <><Loader2 size={14} className="animate-spin" /> Generating…</>
                                    : <><Download size={14} /> Download PDF</>}
                            </button>
                        </div>
                        <div className="w-full overflow-x-auto no-scrollbar">
                            <table className="w-full text-left border-separate border-spacing-1 table-fixed min-w-[1000px]">
                                <thead>
                                    <tr>
                                        <th className="p-4 bg-black/40 rounded-md border border-slate-800 text-[9px] font-black uppercase tracking-widest text-slate-500 italic w-24">Slot</th>
                                        {days.map(d => (
                                            <th key={d} className={`p-4 rounded-md border transition-all duration-500 text-center ${activeDay === d ? 'bg-brand-primary/10 border-brand-primary/40 text-brand-primary shadow-[inset_0_0_20px_rgba(37,99,235,0.1)]' : 'bg-black/40 border-slate-800 text-slate-500'}`}>
                                                <p className="text-[10px] font-black uppercase tracking-[0.3em] italic leading-none">{d.slice(0, 3)}</p>
                                            </th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {Array.from({ length: maxPeriodsCount }, (_, i) => i).map(idx => {
                                        // determine label for this row from Monday's schedule
                                        const mondaySlot = timetable?.schedule?.find(s => s.day === 'Monday')?.periods[idx];
                                        const rowIsBreak = mondaySlot ? isBreak(mondaySlot) : false;

                                        return (
                                            <tr key={idx}>
                                                <td className="p-4 bg-slate-950/40 rounded-md border border-slate-800 text-center">
                                                    <span className={`text-[9px] font-black uppercase tracking-widest italic leading-none ${rowIsBreak ? 'text-brand-primary/50' : 'text-slate-600'}`}>
                                                        {rowIsBreak ? 'Break' : `P ${idx + 1 < 10 ? `0${idx + 1}` : idx + 1}`}
                                                    </span>
                                                </td>
                                                {days.map(day => {
                                                    const slot = timetable?.schedule?.find(s => s.day === day)?.periods[idx];
                                                    const br = slot ? isBreak(slot) : false;
                                                    return (
                                                        <td key={day} className={`p-4 rounded-md border relative transition-all duration-300 group/slot h-28 ${slot ? 'bg-slate-900/40 border-slate-800/80 hover:border-brand-primary/30 cursor-pointer shadow-xl' : 'bg-black/20 border-slate-900/40 opacity-40'} ${br ? 'bg-brand-primary/5 border-brand-primary/10' : ''}`}>
                                                            {slot ? (
                                                                <div className="space-y-2">
                                                                    <div className="flex items-center justify-between">
                                                                        <span className={`text-[8px] font-black italic uppercase tracking-widest ${br ? 'text-brand-primary/60' : 'text-brand-primary'}`}>{slot.startTime}</span>
                                                                        {br
                                                                            ? <Coffee size={12} className="text-brand-primary/40" />
                                                                            : <div className="w-1.5 h-1.5 rounded-sm bg-slate-700 group-hover/slot:bg-brand-primary animate-pulse" />
                                                                        }
                                                                    </div>
                                                                    <h5 className={`font-black italic uppercase tracking-tighter text-[11px] line-clamp-1 transition-colors ${br ? 'text-brand-primary/70' : 'text-white group-hover/slot:text-brand-primary'}`}>
                                                                        {br ? slot.type : (slot.subject?.name || 'Subject')}
                                                                    </h5>
                                                                    <div className="flex flex-col gap-1 text-[8px] font-bold text-slate-600 uppercase tracking-widest leading-none">
                                                                        {br ? (
                                                                            <span className="text-brand-primary/50 italic">Intermission</span>
                                                                        ) : (
                                                                            <div>
                                                                                <span className="truncate italic group-hover/slot:text-slate-400 block">{slot.teacher?.lastName || 'Teacher'}</span>
                                                                                <span className="italic flex items-center gap-1"><MapPin size={8} /> RM {slot.room || 'A01'}</span>
                                                                            </div>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                            ) : (
                                                                <div className="h-full bg-slate-950/20 rounded border-dashed border border-slate-900/40" />
                                                            )}
                                                        </td>
                                                    );
                                                })}
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
};

export default Timetable;
