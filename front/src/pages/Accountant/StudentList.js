import React, { useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { fetchStudents, fetchClasses, fetchStandards, clearError } from '../../redux/slice/schoolAdmin.slice';
import { fetchFees, collectFee, clearStatus } from '../../redux/slice/accountant.slice';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    Search, ChevronRight, LayoutGrid, List, Users, GraduationCap, School as SchoolIcon, 
    ArrowLeft, Eye, Download, UserCheck, CreditCard, DollarSign, X, CheckCircle2, 
    Loader2, AlertCircle, Plus, Wallet2, Settings2, Mail, CheckCircle, Wallet, Settings,
    PieChart, Info
} from 'lucide-react';
import toast from 'react-hot-toast';
import moment from 'moment';

import Pagination from '../../components/Pagination';
import Modal from '../../components/Modal';

const StudentList = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { students, classes, standards, loading: adminLoading, error } = useSelector((s) => s.schoolAdmin);
    const { fees, loading: feeLoading, success: feeSuccess } = useSelector((s) => s.accountant);
    const loading = adminLoading || feeLoading;

    const [search, setSearch] = useState('');
    const [viewMode, setViewMode] = useState('standards'); // 'standards', 'sections', 'students'
    const [selectedStandard, setSelectedStandard] = useState(null);
    const [selectedSection, setSelectedSection] = useState(null);
    const [tabFilter, setTabFilter] = useState('all');
    const [currentPage, setCurrentPage] = useState(1);

    const itemsPerPage = 10;

    // Fee Collection Modal State
    const [selectedStudent, setSelectedStudent] = useState(null);
    const [payingMap, setPayingMap] = useState({}); // { fee_id: amount }
    const [isAddingNew, setIsAddingNew] = useState(false);
    const [collectionData, setCollectionData] = useState({
        paidAmount: 0,
        paymentMethod: 'cash',
        transactionId: '',
        lateFees: 0,
        discount: 0,
        note: 'Fiscal Synchronization via Citizen Registry'
    });

    useEffect(() => {
        if (error) {
            toast.error(error?.message || String(error));
            dispatch(clearError());
        }

    }, [error, dispatch]);

    useEffect(() => {
        if (feeSuccess) {
            toast.success(feeSuccess);
            dispatch(clearStatus());
            dispatch(fetchStudents());
            dispatch(fetchFees());
            setSelectedStudent(null);
            setPayingMap({});
        }
    }, [feeSuccess, dispatch]);

    useEffect(() => {
        dispatch(fetchStudents());
        dispatch(fetchClasses());
        dispatch(fetchStandards());
        dispatch(fetchFees());
    }, [dispatch]);

    const filtered = students.filter(s => {
        const searchString = `${s.firstName} ${s.lastName} ${s.admissionNumber} Grade ${s.standard?.level} ${s.classSection?.sectionLabel}`.toLowerCase();
        const matchesSearch = searchString.includes(search.toLowerCase());

        if (viewMode === 'students' && selectedSection) {
            return matchesSearch && (s.classSection?._id || s.classSection) === selectedSection._id;
        }
        return matchesSearch;
    });

    const totalPages = Math.ceil(filtered.length / itemsPerPage);
    const currentItems = filtered.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

    const getStudentCount = (type, id) => {
        if (type === 'standard') {
            return students.filter(s => (s.standard?._id || s.standard) === id).length;
        }
        if (type === 'section') {
            return students.filter(s => (s.classSection?._id || s.classSection) === id).length;
        }
        return 0;
    };

    const resetSelection = () => {
        setViewMode('standards');
        setSelectedStandard(null);
        setSelectedSection(null);
    };

    const handleStandardClick = (std) => {
        setSelectedStandard(std);
        setViewMode('sections');
    };

    const handleSectionClick = (sec) => {
        setSelectedSection(sec);
        setViewMode('students');
        dispatch(fetchFees({ classSection: sec._id, limit: 1000 }));
    };


    const sectionData = useMemo(() => {
        if (viewMode !== 'students' || !selectedSection) return [];
        
        let residents = students.filter(s => (s.classSection?._id || s.classSection) === selectedSection._id);
        
        if (search) {
            const sc = search.toLowerCase();
            residents = residents.filter(s => 
                s.firstName.toLowerCase().includes(sc) || 
                s.lastName.toLowerCase().includes(sc) || 
                s.admissionNumber.toLowerCase().includes(sc)
            );
        }

        // Map each student to their combined financial status or individual records
        const data = residents.map(s => {
            const sFees = fees.filter(f => (f.studentId?._id || f.studentId) === s._id);
            const total = sFees.reduce((sum, f) => sum + (f.totalAmount || f.amount || 0), 0);
            const paid = sFees.reduce((sum, f) => sum + (f.paidAmount || 0), 0);
            const disc = sFees.reduce((sum, f) => sum + (f.discount || 0), 0);
            const late = sFees.reduce((sum, f) => sum + (f.lateFees || 0), 0);
            
            // For the 'Status' column, choose the most severe status
            let status = s.isPaid ? 'paid' : 'pending';
            if (sFees.some(f => f.status === 'overdue')) status = 'overdue';
            else if (sFees.some(f => f.status === 'partially_paid')) status = 'partially_paid';

            return {
                student: s,
                category: sFees.length > 1 ? 'Multiple' : (sFees[0]?.category || 'Standard'),
                total,
                paid,
                discount: disc,
                lateFees: late,
                status,
                dueDate: sFees[0]?.dueDate, // Show most recent or first
                _raw: sFees
            };
        });

        if (tabFilter !== 'all') {
            return data.filter(d => d.status === tabFilter);
        }
        return data;
    }, [students, fees, selectedSection, viewMode, search, tabFilter]);

    const totalInvoiced = useMemo(() => sectionData.reduce((s, f) => s + f.total, 0), [sectionData]);
    const totalCollected = useMemo(() => sectionData.reduce((s, f) => s + f.paid, 0), [sectionData]);
    const totalPending = totalInvoiced - totalCollected;

    useEffect(() => { setCurrentPage(1); }, [search, tabFilter, selectedSection]);



    const handleOpenFeeModal = (student) => {
        setSelectedStudent(student);
        const unpaidFees = fees.filter(f => (f.studentId?._id || f.studentId) === student._id && f.status !== 'paid');
        
        // Initialize paying map with full remaining amounts
        const initialMap = {};
        unpaidFees.forEach(f => {
            initialMap[f._id] = (f.totalAmount || f.amount) - (f.paidAmount || 0);
        });
        setPayingMap(initialMap);
        setCollectionData(prev => ({ ...prev, note: `Institutional Record Sync for ${student.firstName}` }));
    };

    const handleCollectSubmit = async () => {
        const activeIds = Object.keys(payingMap).filter(id => Number(payingMap[id]) > 0);
        
        if (activeIds.length === 0 && !isAddingNew) {
            toast.error('No fiscal update data detected');
            return;
        }

        try {
            for (const id of activeIds) {
                const raw = fees.find(f => f._id === id);
                if (raw) {
                    await dispatch(collectFee({ 
                        id, 
                        data: { 
                            ...collectionData, 
                            paidAmount: (raw.paidAmount || 0) + Number(payingMap[id]),
                            discount: raw.discount || 0,
                            lateFees: raw.lateFees || 0
                        } 
                    })).unwrap();
                }
            }
            
            // Note: accountant.slice handleSuccess will fetch fees/students again
        } catch (err) {
            toast.error(err?.message || 'Transaction failed');
        }
    };


    return (
        <div className="space-y-6">
            <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 bg-slate-900/40 p-10 rounded-md border border-slate-800/60 shadow-2xl backdrop-blur-3xl">
                <div className="flex items-center gap-4">
                    {(viewMode !== 'standards' || selectedStandard) && (
                        <button
                            onClick={() => {
                                if (viewMode === 'students') setViewMode('sections');
                                else if (viewMode === 'sections') resetSelection();
                            }}
                            className="p-3 bg-slate-800/50 hover:bg-accountant-primary hover:text-black border border-slate-700/50 rounded-md text-slate-400 transition-all font-black uppercase text-[10px]"
                        >
                            <ArrowLeft size={18} />
                        </button>
                    )}
                    <div>
                        <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2">
                            <div className="flex items-center gap-3 mr-4">
                                <div className="h-[2px] w-8 bg-accountant-primary rounded-md"></div>
                                <span className={viewMode === 'standards' ? 'text-accountant-primary' : 'cursor-pointer hover:text-slate-300'} onClick={resetSelection}>Matrix Index</span>
                            </div>
                            {selectedStandard && (
                                <>
                                    <ChevronRight size={10} className="opacity-20" />
                                    <span className={viewMode === 'sections' ? 'text-accountant-primary' : 'cursor-pointer hover:text-slate-300'} onClick={() => setViewMode('sections')}>Grade {selectedStandard.level}</span>
                                </>
                            )}
                            {selectedSection && viewMode === 'students' && (
                                <>
                                    <ChevronRight size={10} className="opacity-20" />
                                    <span className="text-accountant-primary">Section {selectedSection.sectionLabel}</span>
                                </>
                            )}
                        </div>
                        <h1 className="text-4xl text-left font-black text-white italic uppercase tracking-tighter leading-none font-outfit">
                            {viewMode === 'standards' && 'Student Matrix'}
                            {viewMode === 'sections' && `Grade ${selectedStandard?.level} Units`}
                            {viewMode === 'students' && `Identities: ${selectedSection?.sectionLabel}`}
                        </h1>
                    </div>
                </div>
            </header>

            <AnimatePresence mode="wait">
                {viewMode === 'standards' && (
                    <motion.div
                        key="standards"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
                    >
                        {standards.map((std) => (
                            <button
                                style={{ textAlign: 'left' }}
                                key={std._id}
                                onClick={() => handleStandardClick(std)}
                                className="group relative p-8 bg-brand-surface/40 hover:bg-brand-surface/60 border border-brand-border/40 hover:border-accountant-primary/40 rounded-md text-left transition-all duration-300 overflow-hidden shadow-xl"
                            >
                                <div className="absolute -right-4 -bottom-4 opacity-[0.03] group-hover:opacity-[0.08] transition-opacity">
                                    <GraduationCap size={150} className="text-accountant-primary" />
                                </div>
                                <div className="flex justify-between items-start mb-6">
                                    <div className="w-14 h-14 rounded-md bg-accountant-primary/10 border border-accountant-primary/20 flex items-center justify-center text-accountant-primary group-hover:scale-110 transition-transform">
                                        <GraduationCap size={28} />
                                    </div>
                                    <div className="text-[10px] font-black uppercase tracking-widest text-slate-500 bg-slate-900 px-3 py-1.5 rounded-md border border-slate-800">
                                        {getStudentCount('standard', std._id)} Units
                                    </div>
                                </div>
                                <h3 className="text-2xl font-black font-outfit uppercase tracking-tight text-white group-hover:text-accountant-primary transition-colors italic">
                                    Level {std.level}
                                </h3>
                                <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest mt-2 italic flex items-center gap-2">
                                    <UserCheck size={12} className="text-accountant-primary" /> Audit Identities
                                </p>
                            </button>
                        ))}
                    </motion.div>
                )}

                {viewMode === 'sections' && (
                    <motion.div
                        key="sections"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
                    >
                        {classes
                            .filter(c => (c.standardId?._id || c.standardId) === selectedStandard?._id)
                            .map((sec) => (
                                <button
                                    style={{ textAlign: 'left' }}
                                    key={sec._id}
                                    onClick={() => handleSectionClick(sec)}
                                    className="group relative p-8 bg-brand-surface/40 hover:bg-brand-surface/60 border border-brand-border/40 hover:border-accountant-primary/40 rounded-md text-left transition-all duration-300 overflow-hidden shadow-xl"
                                >
                                    <div className="absolute -right-4 -bottom-4 opacity-[0.03] group-hover:opacity-[0.08] transition-opacity text-accountant-primary">
                                        <SchoolIcon size={150} />
                                    </div>
                                    <div className="flex justify-between items-start mb-6">
                                        <div className="w-14 h-14 rounded-md bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-accountant-primary group-hover:scale-110 transition-transform">
                                            <SchoolIcon size={28} />
                                        </div>
                                        <div className="text-[10px] font-black uppercase tracking-widest text-slate-500 bg-slate-900 px-3 py-1.5 rounded-md border border-slate-800 shadow-inner">
                                            {getStudentCount('section', sec._id)} Units
                                        </div>
                                    </div>
                                    <h3 className="text-2xl font-black font-outfit uppercase tracking-tight text-white group-hover:text-accountant-primary transition-colors italic leading-none">
                                        Section {sec.sectionLabel}
                                    </h3>
                                    <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest mt-2 italic flex items-center gap-2">
                                        <Users size={12} className="text-accountant-primary" /> Direct Probe
                                    </p>
                                </button>
                            ))}
                    </motion.div>
                )}

                {viewMode === 'students' && (
                    <motion.div
                        key="students"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="space-y-6"
                    >
                        {/* Section Matrix Stats */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                            {[
                                { label: 'Section Net', val: totalInvoiced, ic: PieChart, col: 'accountant-primary shadow-accountant-primary/10' },
                                { label: 'Collected', val: totalCollected, ic: CheckCircle2, col: 'emerald-500 shadow-emerald-500/10' },
                                { label: 'Internal Debt', val: totalPending, ic: Info, col: 'rose-500 shadow-rose-500/10' }
                            ].map(s => (
                                <div key={s.label} className="bg-brand-surface/40 backdrop-blur-xl border border-brand-border/40 rounded-md p-7 transition-all hover:border-accountant-primary/20 group shadow-lg">
                                    <div className={`w-10 h-10 rounded-md bg-${s.col.split(' ')[0]}/10 flex items-center justify-center text-${s.col.split(' ')[0]} mb-4 group-hover:scale-110 transition-transform`}>
                                        <s.ic size={20} />
                                    </div>
                                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 font-outfit italic">{s.label}</p>
                                    <p className="text-3xl font-black font-outfit mt-2 text-white italic tracking-tighter">${s.val.toLocaleString()}</p>
                                </div>
                            ))}
                        </div>

                        {/* Filters & Navigation */}
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                            <div className="flex flex-wrap gap-2">
                                {['all', 'paid', 'pending', 'overdue'].map(s => (
                                    <button 
                                        key={s} 
                                        onClick={() => setTabFilter(s)}
                                        className={`px-5 py-2.5 rounded-md text-[9px] font-black uppercase tracking-widest border transition-all ${tabFilter === s ? 'bg-accountant-primary text-black border-transparent shadow-lg shadow-accountant-primary/10' : 'bg-slate-900/60 border-slate-800 text-slate-500 hover:text-slate-300 hover:border-slate-700'}`}
                                    >
                                        {s} Status
                                    </button>
                                ))}
                            </div>
                            <div className="relative group min-w-[300px]">
                                <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-accountant-primary transition-colors" />
                                <input
                                    value={search}
                                    onChange={e => setSearch(e.target.value)}
                                    placeholder={`Probing Grade Archive: ${selectedSection?.sectionLabel}...`}
                                    className="w-full bg-slate-950/40 border border-slate-800/60 rounded-md py-3.5 pl-11 pr-5 text-white placeholder-slate-600 outline-none focus:border-accountant-primary transition-all font-outfit text-[11px] font-black italic tracking-wider shadow-inner"
                                />
                            </div>
                        </div>

                        <div className="bg-slate-950/40 backdrop-blur-xl border border-slate-800/60 rounded-md overflow-hidden shadow-3xl">
                            <div className="overflow-x-auto">
                                <table className="w-full border-separate border-spacing-0">
                                    <thead>
                                        <tr className="bg-slate-900/50">
                                            {['Student', 'Category', 'Total', 'Adj (Disc/Late)', 'Paid', 'Status', 'Due Date', 'Actions'].map(h => (
                                                <th key={h} className="px-8 py-6 text-left text-[9px] font-black uppercase tracking-[0.3em] text-slate-500 font-outfit italic border-b border-slate-800/60">{h}</th>
                                            ))}
                                        </tr>
                                    </thead>

                                    <tbody className="divide-y divide-slate-800/40">
                                        {loading && sectionData.length === 0 ? (
                                            <tr><td colSpan={8} className="px-8 py-20 text-center text-slate-500 text-[10px] font-black uppercase tracking-widest italic animate-pulse">Synchronizing Node Data...</td></tr>
                                        ) : sectionData.length === 0 ? (
                                            <tr><td colSpan={8} className="px-8 py-24 text-center text-slate-400 font-black uppercase text-xs italic opacity-40 tracking-[0.5em]">Identity Archive Empty</td></tr>

                                        ) : sectionData.slice((currentPage-1)*itemsPerPage, currentPage*itemsPerPage).map((d, i) => (
                                            <motion.tr key={d.student._id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.03 }}
                                                className="hover:bg-accountant-primary/5 transition-colors group">
                                                <td className="px-8 py-5 border-b border-slate-800/20">
                                                    <div className="flex items-center gap-4">
                                                        <div className="w-11 h-11 rounded-md overflow-hidden border border-slate-800 group-hover:border-accountant-primary/40 transition-colors bg-slate-900 p-0.5 shadow-xl flex items-center justify-center">
                                                            {d.student.photo ? (
                                                                <img src={d.student.photo} className="w-full h-full object-cover rounded-md" alt="" />
                                                            ) : (
                                                                <span className="font-black text-slate-700 italic text-lg">{d.student.firstName?.[0]}</span>
                                                            )}
                                                        </div>
                                                        <div>
                                                            <div className="font-black text-white italic uppercase tracking-tighter text-sm group-hover:text-accountant-primary transition-colors leading-none">{d.student.firstName} {d.student.lastName}</div>
                                                            <div className="text-[8px] font-bold text-slate-500 uppercase tracking-widest mt-1.5 opacity-60">ADM-{d.student.admissionNumber} • GRADE {selectedStandard?.level}</div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-8 py-5 border-b border-slate-800/20">
                                                    <div className="flex flex-col">
                                                        <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest italic">{d.category}</span>
                                                        {d._raw.length > 1 && <span className="text-[8px] font-black text-accountant-primary uppercase mt-1">{d._raw.length} Records Combined</span>}
                                                    </div>
                                                </td>
                                                <td className="px-8 py-5 border-b border-slate-800/20">
                                                    <span className="font-black text-white italic tracking-tighter text-lg font-outfit">
                                                        ${(d.total || 0).toLocaleString()}
                                                    </span>
                                                </td>
                                                <td className="px-8 py-5 border-b border-slate-800/20">
                                                    <div className="flex flex-col gap-0.5">
                                                        {d.discount > 0 && <span className="text-[9px] font-black text-fuchsia-400">-{d.discount.toLocaleString()}</span>}
                                                        {d.lateFees > 0 && <span className="text-[9px] font-black text-rose-400">+{d.lateFees.toLocaleString()}</span>}
                                                        {d.discount === 0 && d.lateFees === 0 && <span className="text-[10px] font-bold text-slate-800">—</span>}
                                                    </div>
                                                </td>
                                                <td className="px-8 py-5 border-b border-slate-800/20">
                                                    <span className="font-black text-emerald-400 italic tracking-tighter text-lg font-outfit">
                                                        ${(d.paid || 0).toLocaleString()}
                                                    </span>
                                                </td>
                                                <td className="px-8 py-5 border-b border-slate-800/20 text-left">
                                                    <span className={`inline-flex items-center px-3 py-1 border text-[9px] font-black uppercase tracking-widest rounded-md italic ${
                                                        d.status === 'paid' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500' : 
                                                        d.status === 'overdue' ? 'bg-rose-500/10 border-rose-500/20 text-rose-500 animate-pulse' :
                                                        'bg-amber-500/10 border-amber-500/20 text-amber-500'
                                                    }`}>
                                                        {d.status.replace('_', ' ')}
                                                    </span>
                                                </td>
                                                <td className="px-8 py-5 border-b border-slate-800/20">
                                                    <span className="text-slate-500 font-bold text-[10px] font-outfit italic">{d.dueDate ? moment(d.dueDate).format('L') : '—'}</span>
                                                </td>
                                                <td className="px-8 py-5 border-b border-slate-800/20">
                                                    <div className="flex items-center gap-1.5">
                                                        <button 
                                                            className="p-2 rounded-md bg-slate-900 border border-slate-800 text-slate-500 hover:text-white hover:border-slate-700 transition-all shadow-xl group/btn opacity-40 hover:opacity-100"
                                                            title="Download Receipt"
                                                        >
                                                            <Download size={12} className="group-hover/btn:scale-110 transition-transform" />
                                                        </button>
                                                        <button 
                                                            className="p-2 rounded-md bg-slate-900 border border-slate-800 text-slate-500 hover:text-accountant-primary hover:border-accountant-primary transition-all shadow-xl group/btn opacity-40 hover:opacity-100"
                                                            title="Dispatch Reminder"
                                                        >
                                                            <Mail size={12} className="group-hover/btn:scale-110 transition-transform" />
                                                        </button>
                                                        <button 
                                                            onClick={() => handleOpenFeeModal(d.student)}
                                                            className="p-2 rounded-md bg-slate-900 border border-slate-800 text-slate-500 hover:text-emerald-500 hover:border-emerald-500 transition-all shadow-xl group/btn opacity-40 hover:opacity-100"
                                                            title="Synchronize Dues"
                                                        >
                                                            <Wallet2 size={12} className="group-hover/btn:scale-110 transition-transform" />
                                                        </button>
                                                        <button 
                                                            className="p-2 rounded-md bg-slate-900 border border-slate-800 text-slate-500 hover:text-blue-500 hover:border-blue-500 transition-all shadow-xl group/btn opacity-40 hover:opacity-100"
                                                            title="Config Records"
                                                        >
                                                            <Settings2 size={12} className="group-hover/btn:scale-110 transition-transform" />
                                                        </button>
                                                    </div>
                                                </td>
                                            </motion.tr>
                                        ))}
                                    </tbody>

                                </table>
                            </div>
                        </div>

                        <Pagination
                            currentPage={currentPage}
                            totalPages={Math.ceil(filtered.length / itemsPerPage)}
                            onPageChange={setCurrentPage}
                            itemsPerPage={itemsPerPage}
                            totalItems={filtered.length}
                            className="bg-slate-950/40 p-4 rounded-md border border-slate-800/60 italic font-black uppercase tracking-widest text-[10px]"
                        />

                    </motion.div>
                )}

            </AnimatePresence>            {/* ─── MODALS ─────────────────────────────────────────────────────────── */}
            <AnimatePresence>
                {selectedStudent && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
                        <motion.div 
                            initial={{ scale: 0.95, opacity: 0, y: 20 }} 
                            animate={{ scale: 1, opacity: 1, y: 0 }} 
                            exit={{ scale: 0.95, opacity: 0, y: 20 }}
                            className="bg-brand-surface border border-brand-border rounded-md p-8 w-full max-w-xl shadow-2xl relative overflow-hidden"
                        >
                            <div className="absolute top-0 left-0 w-1 h-full bg-accountant-primary"></div>
                            
                            <div className="flex items-start justify-between mb-8">
                                <div>
                                    <h3 className="text-xl font-black text-slate-100 italic uppercase tracking-tighter leading-none mb-1">Fiscal Synchronization</h3>
                                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest italic">Updating node status for {selectedStudent.firstName}.</p>
                                </div>
                                <button onClick={() => setSelectedStudent(null)} className="p-1 hover:text-accountant-primary transition-all text-slate-600"><X size={20} /></button>
                            </div>

                            <div className="space-y-6">
                                {/* Identified Student Header */}
                                <div className="flex items-center gap-4 p-4 bg-slate-900/60 rounded-md border border-slate-800/60">
                                    <div className="w-12 h-12 rounded-md bg-accountant-primary/10 flex items-center justify-center font-black text-accountant-primary text-lg italic">
                                        {selectedStudent.firstName[0]}
                                    </div>
                                    <div>
                                        <p className="text-sm font-black text-white italic uppercase tracking-tight">{selectedStudent.firstName} {selectedStudent.lastName}</p>
                                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest leading-none mt-1">{selectedStudent.admissionNumber} • GRADE {selectedStudent.standard?.level}</p>
                                    </div>
                                </div>

                                {(() => {
                                    const unpaidFees = fees.filter(f => (f.studentId?._id || f.studentId) === selectedStudent._id && f.status !== 'paid');
                                    const totalUnpaid = unpaidFees.reduce((sum, f) => sum + (f.totalAmount || f.amount) - (f.paidAmount || 0), 0);
                                    const bulkPayingTotal = Object.values(payingMap).reduce((s, v) => s + (Number(v) || 0), 0);

                                    return (
                                        <div className="space-y-4">
                                            {totalUnpaid > 0 && (
                                                <div className="p-6 bg-slate-950/60 border border-accountant-primary/20 rounded-md relative overflow-hidden group">
                                                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                                                        <Wallet2 size={60} className="rotate-12" />
                                                    </div>
                                                    <div className="relative z-10 flex items-center justify-between">
                                                        <div>
                                                            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 mb-1 italic">Outstanding Node Debt</p>
                                                            <p className="text-4xl font-black font-outfit text-accountant-primary italic tracking-tighter">${totalUnpaid.toLocaleString()}</p>
                                                        </div>
                                                        {bulkPayingTotal > 0 && (
                                                            <div className="text-right">
                                                                <p className="text-[10px] font-black uppercase tracking-widest text-emerald-500 mb-1 italic">Session Payload</p>
                                                                <p className="text-2xl font-black font-outfit text-white italic">-${bulkPayingTotal.toLocaleString()}</p>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            )}

                                            <div className="space-y-3">
                                                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 px-2 italic">Active Debt Clusters</p>
                                                <div className="space-y-2 max-h-[250px] overflow-y-auto pr-1 custom-scrollbar">
                                                    {unpaidFees.map(uf => (
                                                        <div key={uf._id} className="p-4 bg-slate-900/40 rounded-md border border-slate-800/40 hover:border-accountant-primary/20 transition-all group/item shadow-inner">
                                                            <div className="flex items-center justify-between mb-3">
                                                                <div>
                                                                    <h5 className="text-sm font-black text-white italic uppercase tracking-tight group-hover/item:text-accountant-primary transition-colors">{uf.category}</h5>
                                                                    <p className="text-[9px] font-black text-slate-600 uppercase tracking-widest mt-0.5">CYCLE DUE: {moment(uf.dueDate).format('L')}</p>
                                                                </div>
                                                                <div className="text-right">
                                                                    <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest italic leading-none mb-1">Cap Remaining</p>
                                                                    <p className="text-sm font-black text-white italic font-outfit uppercase tracking-tighter">${((uf.totalAmount || uf.amount) - (uf.paidAmount || 0)).toLocaleString()}</p>
                                                                </div>
                                                            </div>
                                                            <div className="relative group/input">
                                                                <span className={`absolute left-4 top-1/2 -translate-y-1/2 font-black text-xs transition-colors ${payingMap[uf._id] > 0 ? 'text-accountant-primary' : 'text-slate-700'}`}>$</span>
                                                                <input 
                                                                    type="number" 
                                                                    placeholder="Inject fiscal capital..."
                                                                    value={payingMap[uf._id] || ''}
                                                                    onChange={(e) => {
                                                                        const max = (uf.totalAmount || uf.amount) - (uf.paidAmount || 0);
                                                                        let val = Number(e.target.value);
                                                                        if (val > max) val = max;
                                                                        setPayingMap(prev => ({ ...prev, [uf._id]: val }));
                                                                    }}
                                                                    className="w-full bg-slate-950/80 border border-slate-800/60 focus:border-accountant-primary rounded-md py-3 pl-8 pr-4 text-white outline-none text-[11px] font-black transition-all italic tracking-wider placeholder-slate-700"
                                                                />
                                                                <button onClick={() => setPayingMap(prev => ({...prev, [uf._id]: (uf.totalAmount || uf.amount) - (uf.paidAmount || 0)}))} 
                                                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[9px] font-black text-slate-600 hover:text-accountant-primary uppercase tracking-widest opacity-0 group-hover/input:opacity-100 transition-all">Full</button>
                                                            </div>
                                                        </div>
                                                    ))}
                                                    {unpaidFees.length === 0 && <p className="p-10 text-center text-slate-600 italic text-[10px] font-black uppercase tracking-[0.2em] opacity-40">No pending fiscal items node</p>}
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-2 gap-4 pt-2">
                                                <div>
                                                    <label className="text-[9px] font-black uppercase tracking-widest text-slate-500 px-1 italic mb-2 block">Method Matrix</label>
                                                    <select 
                                                        value={collectionData.paymentMethod}
                                                        onChange={(e) => setCollectionData(prev => ({ ...prev, paymentMethod: e.target.value }))}
                                                        className="w-full bg-slate-950 border border-slate-800 focus:border-accountant-primary/50 rounded-md py-3.5 px-4 text-slate-400 text-[10px] font-black outline-none tracking-widest uppercase italic appearance-none transition-all"
                                                    >
                                                        <option value="cash">CASH DISPATCH</option>
                                                        <option value="bank_transfer">BANK TRANSFER</option>
                                                        <option value="card">CARD TERMINAL</option>
                                                        <option value="upi">DIGITAL UPi</option>
                                                    </select>
                                                </div>
                                                <div>
                                                    <label className="text-[9px] font-black uppercase tracking-widest text-slate-500 px-1 italic mb-2 block">Reference Hash</label>
                                                    <input 
                                                        value={collectionData.transactionId}
                                                        onChange={(e) => setCollectionData(prev => ({ ...prev, transactionId: e.target.value }))}
                                                        placeholder="TXN-HASH-992..." 
                                                        className="w-full bg-slate-950 border border-slate-800 focus:border-accountant-primary/50  rounded-md py-3.5 px-4 text-white text-[10px] font-black outline-none italic tracking-wider placeholder-slate-800 transition-all" 
                                                    />
                                                </div>
                                            </div>

                                            <div className="pt-6 border-t border-slate-800/60 mt-4 space-y-5">
                                                <div className="flex items-center justify-between p-6 bg-accountant-primary text-slate-900 rounded-md shadow-2xl relative overflow-hidden group shadow-accountant-primary/10">
                                                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                                                    <div className="relative z-10">
                                                        <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-60 italic">Collation Sum</p>
                                                        <p className="text-[10px] font-black opacity-80 mt-1 uppercase italic tracking-widest">Targeting {Object.keys(payingMap).filter(k=>payingMap[k]>0).length} Fiscal Nodes</p>
                                                    </div>
                                                    <p className="text-4xl font-black font-outfit italic tracking-tighter relative z-10">
                                                        ${bulkPayingTotal.toLocaleString()}
                                                    </p>
                                                </div>

                                                <button 
                                                    onClick={handleCollectSubmit}
                                                    disabled={feeLoading || bulkPayingTotal === 0}
                                                    className="w-full py-5 bg-white text-slate-900 hover:bg-accountant-primary hover:text-slate-900 active:bg-amber-600 rounded-md font-black text-sm uppercase tracking-[0.25em] transition-all shadow-xl flex items-center justify-center gap-3 active:scale-[0.98] disabled:opacity-30 disabled:grayscale disabled:cursor-not-allowed italic font-outfit"
                                                >
                                                    {feeLoading ? <Loader2 size={18} className="animate-spin" /> : (
                                                        <>
                                                            Finalize Synchronization
                                                            <ChevronRight size={16} />
                                                        </>
                                                    )}
                                                </button>
                                            </div>
                                        </div>
                                    );
                                })()}
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};


export default StudentList;

