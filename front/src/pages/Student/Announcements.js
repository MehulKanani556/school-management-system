import React, { useState, useEffect, useMemo } from 'react';
import { useSelector } from 'react-redux';
import {
    Megaphone, Layout, Calendar, Search,
    AlertCircle, CheckCircle, Bell, Shield,
    Clock, Pin, Radio, Zap, BookOpen,
    ArrowUpRight, Volume2, FileText, Users
} from 'lucide-react';
import axiosInstance from '../../utils/axiosInstance';
import { motion, AnimatePresence } from 'framer-motion';
import { useSocket } from '../../context/SocketContext';

/* ─── helpers ──────────────────────────────────────────────────────────────── */
const fmtDate  = d => new Date(d).toLocaleDateString('en-IN', { day:'numeric', month:'short', year:'numeric' });
const fmtTime  = d => new Date(d).toLocaleTimeString('en-IN', { hour:'2-digit', minute:'2-digit' });

const timeAgo = (d) => {
    const m = Math.floor((Date.now() - new Date(d)) / 60000);
    if (m < 1)   return 'Just now';
    if (m < 60)  return `${m}m ago`;
    const h = Math.floor(m / 60);
    if (h < 24)  return `${h}h ago`;
    const day = Math.floor(h / 24);
    if (day < 7) return `${day}d ago`;
    return fmtDate(d);
};

const getInitials = (n = '') =>
    n.split(' ').map(p => p[0]).join('').toUpperCase().slice(0, 2) || '?';

const GRAD = ['from-sky-500 to-indigo-600','from-emerald-500 to-teal-600',
              'from-violet-500 to-purple-600','from-orange-400 to-pink-500',
              'from-rose-500 to-pink-600'];
const grad = (n = '') => GRAD[n.charCodeAt(0) % GRAD.length];

/* group items by calendar date label */
const groupByDate = (items) => {
    const map = {};
    items.forEach(item => {
        const key = new Date(item.createdAt).toDateString();
        if (!map[key]) map[key] = [];
        map[key].push(item);
    });
    return Object.entries(map); // [['Mon Jun 08 2026', [...]], ...]
};

const dateLabel = (ds) => {
    const d = new Date(ds);
    const today   = new Date(); today.setHours(0,0,0,0);
    const yd      = new Date(today); yd.setDate(yd.getDate()-1);
    if (d >= today) return 'Today';
    if (d >= yd)    return 'Yesterday';
    return d.toLocaleDateString('en-IN', { weekday:'long', day:'numeric', month:'long', year:'numeric' });
};

/* ══════════════════════════════════════════════════════════════════════════════
   CARD COMPONENT  — redesigned
══════════════════════════════════════════════════════════════════════════════ */
const Card = ({ item, isAnn, isRead, onRead }) => {
    const sender = item.sender?.firstName
        ? `${item.sender.firstName} ${item.sender.lastName || ''}`.trim()
        : 'Faculty';
    const title       = item.subject || item.title || 'Untitled';
    const accent      = isAnn ? '#10b981' : '#58a6ff';
    const accentDim   = isAnn ? 'rgba(16,185,129,0.12)' : 'rgba(88,166,255,0.12)';
    const accentRing  = isAnn ? 'rgba(16,185,129,0.22)' : 'rgba(88,166,255,0.22)';

    return (
        <motion.article
            layout
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.97 }}
            whileHover={{ y: -3, transition: { duration: 0.18 } }}
            transition={{ duration: 0.28, ease: 'easeOut' }}
            style={{
                background: isRead
                    ? 'linear-gradient(145deg,#0b0d14 0%,#0e1019 100%)'
                    : `linear-gradient(145deg,#0d101a 0%,#0f1220 100%)`,
                border: `1px solid ${isRead ? 'rgba(255,255,255,0.04)' : accentRing}`,
                boxShadow: isRead
                    ? '0 2px 12px rgba(0,0,0,0.3)'
                    : `0 0 0 1px ${accentRing}, 0 8px 40px rgba(0,0,0,0.45), inset 0 1px 0 rgba(255,255,255,0.03)`,
            }}
            className="relative rounded-2xl overflow-hidden group/card"
        >
            {/* ── Left accent bar (animated pulse when unread) ── */}
            <div
                className="absolute left-0 top-0 bottom-0 w-[3px] rounded-l-2xl"
                style={{
                    background: isRead
                        ? 'rgba(255,255,255,0.05)'
                        : `linear-gradient(180deg, ${accent} 0%, ${accent}60 60%, transparent 100%)`,
                    boxShadow: isRead ? 'none' : `0 0 12px ${accent}60`,
                }}
            />
            {!isRead && (
                <motion.div
                    className="absolute left-0 top-0 bottom-0 w-[3px] rounded-l-2xl"
                    animate={{ opacity: [0.4, 1, 0.4] }}
                    transition={{ repeat: Infinity, duration: 2.5, ease: 'easeInOut' }}
                    style={{ background: `linear-gradient(180deg, ${accent}, transparent)` }}
                />
            )}

            {/* ── Subtle radial glow top-right ── */}
            {!isRead && (
                <div
                    className="absolute -top-10 -right-10 w-52 h-52 rounded-full pointer-events-none"
                    style={{ background: `radial-gradient(circle, ${accentDim} 0%, transparent 70%)` }}
                />
            )}

            <div className="pl-7 pr-6 pt-5 pb-5">

                {/* ── ROW 1: badges · time · sender ── */}
                <div className="flex items-center justify-between gap-4 mb-4 flex-wrap">

                    {/* Left badges + time */}
                    <div className="flex flex-wrap items-center gap-2">

                        {/* Type pill */}
                        <span
                            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full
                                       text-[9px] font-black uppercase tracking-[0.18em] border"
                            style={{
                                background: accentDim,
                                color: accent,
                                borderColor: accentRing,
                            }}
                        >
                            {isAnn ? <Volume2 size={9} /> : <FileText size={9} />}
                            {isAnn ? 'Announcement' : 'Notice'}
                        </span>

                        {/* Read badge */}
                        {isRead && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full
                                            text-[8px] font-black uppercase tracking-wider
                                            bg-slate-900/80 text-slate-600 border border-slate-800/60">
                                <CheckCircle size={8} /> Read
                            </span>
                        )}

                        {/* Pinned badge */}
                        {item.isPinned && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full
                                            text-[8px] font-black uppercase tracking-widest
                                            bg-amber-500/10 text-amber-400 border border-amber-500/20">
                                <Pin size={8} /> Pinned
                            </span>
                        )}

                        {/* Time */}
                        <div className="flex items-center gap-1.5 text-[9px] font-semibold text-slate-600">
                            <Clock size={9} className="opacity-60" />
                            <span>{fmtTime(item.createdAt)}</span>
                            <span className="text-slate-800 mx-0.5">·</span>
                            <span className="text-slate-700">{timeAgo(item.createdAt)}</span>
                        </div>
                    </div>

                    {/* Sender chip */}
                    <div
                        className="flex items-center gap-2 flex-shrink-0 px-3 py-1.5 rounded-xl
                                   border transition-all duration-200
                                   group-hover/card:border-slate-700/60"
                        style={{
                            background: 'rgba(15,18,28,0.85)',
                            borderColor: 'rgba(255,255,255,0.06)',
                            backdropFilter: 'blur(8px)',
                        }}
                    >
                        {item.sender?.photo ? (
                            <img
                                src={item.sender.photo}
                                alt={sender}
                                className="w-7 h-7 rounded-lg object-cover ring-1"
                                style={{ ringColor: accentRing }}
                            />
                        ) : (
                            <div
                                className={`w-7 h-7 rounded-lg bg-gradient-to-br ${grad(sender)}
                                           flex items-center justify-center text-[8px] font-black text-white`}
                                style={{ boxShadow: `0 0 8px ${accentDim}` }}
                            >
                                {getInitials(sender)}
                            </div>
                        )}
                        <span className="text-[9px] font-bold text-slate-300 tracking-wide">{sender}</span>
                    </div>
                </div>

                {/* ── ROW 2: Title ── */}
                <h3
                    className="text-xl font-black tracking-tight leading-snug mb-3 transition-colors duration-200"
                    style={{ color: isRead ? '#4b5563' : '#f0f4ff' }}
                >
                    {title}
                </h3>

                {/* ── ROW 3: Content ── */}
                <div
                    className="pl-4 mb-5 border-l-2 rounded-sm"
                    style={{ borderColor: isRead ? 'rgba(255,255,255,0.05)' : `${accent}50` }}
                >
                    <p
                        className="text-sm leading-relaxed font-medium"
                        style={{ color: isRead ? '#374151' : '#8b95a8' }}
                    >
                        {item.content}
                    </p>
                </div>

                {/* ── ROW 4: Footer ── */}
                <div
                    className="flex items-center justify-between pt-4"
                    style={{ borderTop: '1px solid rgba(255,255,255,0.04)' }}
                >
                    <span className="text-[8px] font-black uppercase tracking-[0.22em] text-slate-800">
                        ID #{(item._id || '').slice(-7).toUpperCase()}
                    </span>

                    {!isRead ? (
                        <motion.button
                            onClick={() => onRead(item._id)}
                            whileHover={{ scale: 1.04 }}
                            whileTap={{ scale: 0.97 }}
                            className="flex items-center gap-2 px-5 py-2 rounded-xl text-[9px] font-black
                                      uppercase tracking-widest transition-colors duration-200 border"
                            style={{
                                background: accentDim,
                                borderColor: accentRing,
                                color: accent,
                            }}
                            onMouseEnter={e => {
                                e.currentTarget.style.background = accent;
                                e.currentTarget.style.color = '#000';
                                e.currentTarget.style.borderColor = accent;
                            }}
                            onMouseLeave={e => {
                                e.currentTarget.style.background = accentDim;
                                e.currentTarget.style.color = accent;
                                e.currentTarget.style.borderColor = accentRing;
                            }}
                        >
                            <CheckCircle size={11} />
                            Mark as Read
                        </motion.button>
                    ) : (
                        <span className="flex items-center gap-1.5 text-[8px] font-bold text-slate-700 uppercase tracking-wider">
                            <CheckCircle size={9} className="text-slate-800" /> Acknowledged
                        </span>
                    )}
                </div>
            </div>
        </motion.article>
    );
};

/* ─── localStorage helpers ────────────────────────────────────────────────── */
const lsKey = () => `ann_read_${localStorage.getItem('userId') || 'guest'}`;
const lsLoad = () => new Set(JSON.parse(localStorage.getItem(lsKey()) || '[]'));
const lsSave = (set) => localStorage.setItem(lsKey(), JSON.stringify([...set]));

/* ══════════════════════════════════════════════════════════════════════════════
   MAIN COMPONENT
══════════════════════════════════════════════════════════════════════════════ */
const Announcements = () => {
    const [activeTab, setActiveTab]         = useState('announcements');
    const [announcements, setAnnouncements] = useState([]);
    const [notices, setNotices]             = useState([]);
    const [loading, setLoading]             = useState(false);
    const [searchTerm, setSearchTerm]       = useState('');
    const [readIds, setReadIds]             = useState(() => lsLoad());
    const [live, setLive]                   = useState(false);

    const { socket }               = useSocket();
    const { activeAcademicYearId } = useSelector(s => s.academicYear || {});

    useEffect(() => { fetchData(); }, [activeTab, activeAcademicYearId]);

    useEffect(() => {
        if (!socket) return;
        const onAnn  = d => { setAnnouncements(p => [d, ...p]); setLive(true); setTimeout(() => setLive(false), 5000); };
        const onNote = d => { setNotices(p => [d, ...p]);        setLive(true); setTimeout(() => setLive(false), 5000); };
        socket.on('NEW_ANNOUNCEMENT', onAnn);
        socket.on('NEW_NOTICE',       onNote);
        return () => { socket.off('NEW_ANNOUNCEMENT', onAnn); socket.off('NEW_NOTICE', onNote); };
    }, [socket]);

    const fetchData = async () => {
        setLoading(true);
        try {
            const url = activeTab === 'announcements' ? '/announcements' : '/notices';
            const res = await axiosInstance.get(url);
            if (activeTab === 'announcements') setAnnouncements(res.data);
            else setNotices(res.data);
        } catch { /* silent */ } finally { setLoading(false); }
    };

    const rawItems = activeTab === 'announcements' ? announcements : notices;
    const filtered = useMemo(() =>
        rawItems.filter(i =>
            (i.subject || i.title || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
            (i.content || '').toLowerCase().includes(searchTerm.toLowerCase())
        ), [rawItems, searchTerm]
    );

    const groups      = useMemo(() => groupByDate(filtered), [filtered]);
    const unread      = filtered.filter(i => !readIds.has(i._id)).length;
    const isAnn       = activeTab === 'announcements';
    const markRead    = id => setReadIds(p => { const next = new Set([...p, id]); lsSave(next); return next; });
    const markAllRead = () => { const next = new Set(filtered.map(i => i._id)); lsSave(next); setReadIds(next); };

    /* ══════════════════════════════════════════════════════════════════════
       RENDER
    ══════════════════════════════════════════════════════════════════════ */
    return (
        <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className="font-outfit w-full max-w-7xl mx-auto pb-24"
        >
            {/* ── HERO HEADER ─────────────────────────────────────────────── */}
            <div className="relative overflow-hidden rounded-3xl mb-8 border border-slate-800/60"
                style={{ background: 'linear-gradient(135deg, #0d1018 0%, #0a0c14 60%, #0d1022 100%)' }}>

                {/* Background decoration */}
                <div className="absolute -top-16 -right-16 w-72 h-72 rounded-full blur-3xl opacity-10"
                    style={{ background: isAnn ? 'radial-gradient(circle, #10b981, transparent)' : 'radial-gradient(circle, #58a6ff, transparent)' }} />
                <div className="absolute -bottom-12 -left-12 w-48 h-48 rounded-full blur-3xl opacity-5"
                    style={{ background: 'radial-gradient(circle, #8b5cf6, transparent)' }} />

                <div className="relative z-10 px-8 py-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
                    {/* Left: icon + title */}
                    <div className="flex items-center gap-5">
                        <div className="relative">
                            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center border ${
                                isAnn
                                    ? 'bg-emerald-500/10 border-emerald-500/20'
                                    : 'bg-blue-500/10 border-blue-500/20'
                            }`}>
                                <Megaphone size={24} className={isAnn ? 'text-emerald-400' : 'text-blue-400'} />
                            </div>
                            {live && (
                                <span className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-rose-500
                                                flex items-center justify-center">
                                    <span className="w-2 h-2 rounded-full bg-rose-300 animate-ping absolute" />
                                    <span className="w-1.5 h-1.5 rounded-full bg-white relative" />
                                </span>
                            )}
                        </div>
                        <div>
                            <div className="flex items-center gap-3 mb-1">
                                <h1 className="text-3xl font-black text-white italic uppercase tracking-tighter leading-none">
                                    Announcements & Notices
                                </h1>
                                {live && (
                                    <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }}
                                        className="px-2.5 py-1 rounded-full bg-rose-500 text-white text-[7px]
                                                  font-black uppercase tracking-widest flex items-center gap-1">
                                        <Radio size={7} /> Live
                                    </motion.span>
                                )}
                            </div>
                            <p className="text-slate-500 text-[10px] font-bold uppercase tracking-[0.35em]">
                                School · Broadcasts · Public Notices
                            </p>
                        </div>
                    </div>

                    {/* Right: stats row + tabs */}
                    <div className="flex flex-col items-end gap-4">
                        {/* Quick stats */}
                        <div className="flex items-center gap-3">
                            {[
                                { label: 'Total',  val: filtered.length, color: 'text-white' },
                                { label: 'Unread', val: unread,           color: isAnn ? 'text-emerald-400' : 'text-blue-400' },
                            ].map(s => (
                                <div key={s.label} className="text-center px-4 py-2 bg-slate-900/60
                                                             border border-slate-800 rounded-xl">
                                    <p className={`text-xl font-black italic leading-none ${s.color}`}>{s.val}</p>
                                    <p className="text-[7px] font-black text-slate-600 uppercase tracking-widest mt-0.5">{s.label}</p>
                                </div>
                            ))}
                        </div>

                        {/* Tab switcher */}
                        <div className="flex items-center bg-slate-900/80 border border-slate-800 rounded-xl p-1 gap-1">
                            {[
                                { id: 'announcements', label: 'Announcements', icon: <Megaphone size={11} />, active: 'bg-emerald-500 text-black' },
                                { id: 'notices',       label: 'Notices',       icon: <Layout size={11} />,    active: 'bg-blue-500 text-black'    },
                            ].map(tab => (
                                <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                                    className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-[9px] font-black
                                               uppercase tracking-widest transition-all ${
                                        activeTab === tab.id
                                            ? `${tab.active} shadow-md`
                                            : 'text-slate-500 hover:text-slate-300'
                                    }`}>
                                    {tab.icon} {tab.label}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Bottom bar: search + actions */}
                <div className="relative z-10 px-8 py-4 border-t border-slate-800/50 bg-slate-950/30
                               flex flex-col sm:flex-row items-center gap-3">
                    {/* Search */}
                    <div className="relative flex-1 group">
                        <Search size={13}
                            className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600
                                      group-focus-within:text-emerald-400 transition-colors" />
                        <input type="text" placeholder="Search by keyword..."
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                            className="w-full h-10 bg-slate-900/50 border border-slate-800 rounded-xl
                                      pl-10 pr-4 text-[10px] font-bold text-white outline-none
                                      focus:border-slate-700 placeholder:text-slate-700 transition-all
                                      uppercase tracking-wider" />
                    </div>

                    {/* Status + mark all */}
                    <div className="flex items-center gap-3 flex-shrink-0">
                        <div className="flex items-center gap-2 px-3 py-2 bg-emerald-500/8
                                       border border-emerald-500/15 rounded-xl">
                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                            <span className="text-[8px] font-black text-emerald-400 uppercase tracking-widest">Connected</span>
                        </div>
                        {unread > 0 && (
                            <button onClick={markAllRead}
                                className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-[8px] font-black
                                          uppercase tracking-widest border border-slate-700 text-slate-400
                                          hover:border-slate-500 hover:text-white transition-all h-10">
                                <CheckCircle size={10} /> Mark All Read
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {/* ── MAIN LAYOUT ─────────────────────────────────────────────── */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-7 items-start">

                {/* ── SIDEBAR ─────────────────────────────────────────────── */}
                <aside className="lg:col-span-3 space-y-5 lg:sticky lg:top-24">

                    {/* Info card */}
                    <div className="rounded-2xl border border-slate-800/60 bg-[#0c0e16] overflow-hidden">
                        <div className="px-5 py-4 border-b border-slate-800/40 bg-slate-900/30">
                            <p className="text-[9px] font-black uppercase tracking-[0.35em] text-slate-500">
                                Feed Summary
                            </p>
                        </div>
                        <div className="p-5 space-y-3">
                            {[
                                { icon: <Bell size={13} className="text-slate-500" />,             label: 'Total Items',    val: filtered.length, color: 'text-white' },
                                { icon: <Zap size={13} className={isAnn ? 'text-emerald-400' : 'text-blue-400'} />, label: 'Unread', val: unread, color: isAnn ? 'text-emerald-400' : 'text-blue-400' },
                                { icon: <CheckCircle size={13} className="text-slate-600" />,      label: 'Read',           val: readIds.size,    color: 'text-slate-500' },
                                { icon: <Calendar size={13} className="text-slate-600" />,         label: 'Date Groups',    val: groups.length,   color: 'text-slate-400' },
                            ].map(s => (
                                <div key={s.label} className="flex items-center justify-between
                                                             py-2.5 border-b border-slate-800/30 last:border-0">
                                    <div className="flex items-center gap-2.5">
                                        {s.icon}
                                        <span className="text-[9px] font-bold uppercase tracking-wider text-slate-600">{s.label}</span>
                                    </div>
                                    <span className={`text-base font-black italic ${s.color}`}>{s.val}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Channels */}
                    <div className="rounded-2xl border border-slate-800/60 bg-[#0c0e16] overflow-hidden">
                        <div className="px-5 py-4 border-b border-slate-800/40 bg-slate-900/30">
                            <p className="text-[9px] font-black uppercase tracking-[0.35em] text-slate-500">
                                Channels
                            </p>
                        </div>
                        <div className="p-4 space-y-2">
                            {[
                                { label: 'Announcements', color: 'bg-emerald-500', desc: 'School-wide broadcasts', active: activeTab === 'announcements' },
                                { label: 'Notices',       color: 'bg-blue-500',    desc: 'Public & admin notices',  active: activeTab === 'notices' },
                            ].map(ch => (
                                <button key={ch.label} onClick={() => setActiveTab(ch.label.toLowerCase())}
                                    className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all text-left ${
                                        ch.active ? 'bg-slate-800/60 border border-slate-700/50' : 'hover:bg-slate-900/40'
                                    }`}>
                                    <div className={`w-2.5 h-2.5 rounded-full ${ch.color} ${ch.active ? '' : 'opacity-40'}`} />
                                    <div>
                                        <p className={`text-[9px] font-black uppercase tracking-wider ${ch.active ? 'text-white' : 'text-slate-500'}`}>
                                            {ch.label}
                                        </p>
                                        <p className="text-[7px] font-bold text-slate-700 uppercase tracking-wider">{ch.desc}</p>
                                    </div>
                                    {ch.active && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Trust badge */}
                    <div className="rounded-2xl border border-blue-500/15 bg-blue-500/5 p-5 space-y-3">
                        <div className="flex items-center gap-2">
                            <Shield size={14} className="text-blue-400" />
                            <p className="text-[9px] font-black uppercase tracking-[0.25em] text-blue-400">
                                Verified Channel
                            </p>
                        </div>
                        <p className="text-[10px] font-medium text-slate-500 leading-relaxed">
                            All broadcasts are authenticated by the school administration and verified before publishing.
                        </p>
                    </div>
                </aside>

                {/* ── FEED ────────────────────────────────────────────────── */}
                <div className="lg:col-span-9">
                    {/* Feed label */}
                    <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-800/40">
                        <div className={`w-1 h-5 rounded-full ${isAnn ? 'bg-emerald-500' : 'bg-blue-500'}`} />
                        <h2 className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-500">
                            {isAnn ? 'Announcement Feed' : 'Notice Board'}
                        </h2>
                        {filtered.length > 0 && (
                            <span className="ml-auto text-[8px] font-black text-slate-700 bg-slate-900
                                            border border-slate-800 px-2.5 py-1 rounded-lg">
                                {filtered.length} item{filtered.length !== 1 ? 's' : ''}
                            </span>
                        )}
                    </div>

                    <AnimatePresence mode="popLayout">
                        {loading ? (
                            <motion.div key="load"
                                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                                className="py-32 flex flex-col items-center gap-5">
                                <div className={`w-10 h-10 border-2 border-t-transparent rounded-full animate-spin ${
                                    isAnn ? 'border-emerald-400' : 'border-blue-400'
                                }`} />
                                <p className="text-[9px] font-black uppercase tracking-[0.4em] text-slate-700 animate-pulse">
                                    Loading...
                                </p>
                            </motion.div>

                        ) : filtered.length === 0 ? (
                            <motion.div key="empty"
                                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                                className="py-24 flex flex-col items-center gap-5 rounded-2xl
                                           border border-dashed border-slate-800/50 bg-slate-900/10">
                                <div className="w-16 h-16 rounded-2xl bg-slate-900 border border-slate-800
                                               flex items-center justify-center">
                                    <AlertCircle size={26} className="text-slate-700" />
                                </div>
                                <div className="text-center">
                                    <p className="text-[11px] font-black uppercase tracking-widest text-slate-600 mb-1">
                                        No {isAnn ? 'Announcements' : 'Notices'} Found
                                    </p>
                                    <p className="text-[9px] text-slate-700 font-bold uppercase tracking-wider">
                                        {searchTerm ? 'Try a different search keyword.' : 'Check back later for updates.'}
                                    </p>
                                </div>
                            </motion.div>

                        ) : (
                            <div className="space-y-8">
                                {groups.map(([dateStr, items], gi) => (
                                    <motion.div key={dateStr}
                                        initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                                        transition={{ delay: gi * 0.05 }}>

                                        {/* Date divider */}
                                        <div className="flex items-center gap-4 mb-5">
                                            <div className="flex items-center gap-2.5 bg-slate-900 border border-slate-800
                                                           rounded-full px-4 py-1.5 flex-shrink-0">
                                                <Calendar size={10} className="text-slate-500" />
                                                <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">
                                                    {dateLabel(dateStr)}
                                                </span>
                                                <span className="w-1 h-1 rounded-full bg-slate-700" />
                                                <span className="text-[8px] font-bold text-slate-600">
                                                    {items.length} item{items.length !== 1 ? 's' : ''}
                                                </span>
                                            </div>
                                            <div className="flex-1 h-px bg-slate-800/50" />
                                        </div>

                                        {/* Cards */}
                                        <div className="space-y-4">
                                            {items.map(item => (
                                                <Card key={item._id}
                                                    item={item}
                                                    isAnn={isAnn}
                                                    isRead={readIds.has(item._id)}
                                                    onRead={markRead} />
                                            ))}
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </motion.div>
    );
};

export default Announcements;
