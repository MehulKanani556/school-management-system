import React, { useState, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchStudents, fetchTeachers } from '../../redux/slice/schoolAdmin.slice';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Award, Smartphone, User, FileText,
    Download, ShieldCheck, Mail, Search, Grid,
    CreditCard, Fingerprint, QrCode,
    ScanLine,
    Calendar,
} from 'lucide-react';
import moment from 'moment';
import { QRCodeSVG } from 'qrcode.react';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

const CertificateHub = () => {
    const dispatch = useDispatch();
    const { students, teachers, loading } = useSelector((state) => state.schoolAdmin);
    const [tab, setTab] = useState('students');
    const [search, setSearch] = useState('');
    const [selectedEntity, setSelectedEntity] = useState(null);
    const [docType, setDocType] = useState('idCard');
    const docRef = useRef(null); // idCard, bonafide, tc

    useEffect(() => {
        dispatch(fetchStudents());
        dispatch(fetchTeachers());
    }, [dispatch]);

    const activeList = tab === 'students' ? students : teachers;
    const filtered = activeList.filter(e =>
        `${e.firstName} ${e.lastName}`.toLowerCase().includes(search.toLowerCase()) ||
        (e.admissionNumber || e.employeeId || '').toLowerCase().includes(search.toLowerCase())
    );

    const handleDownload = async () => {
        if (!selectedEntity || !docRef.current) return;

        const canvas = await html2canvas(docRef.current, {
            scale: 3,
            useCORS: true,
            logging: false,
            backgroundColor: '#ffffff'
        });

        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF({
            orientation: docType === 'idCard' ? 'l' : 'p',
            unit: 'mm',
            format: docType === 'idCard' ? [140, 90] : 'a4'
        });

        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

        pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
        pdf.save(`${docType}_${selectedEntity.firstName}_${selectedEntity._id.toString().slice(-4)}.pdf`);
    };

    const verifyUrl = selectedEntity ? `${window.location.protocol}//${window.location.host}/verify/${tab === 'students' ? 'student' : 'teacher'}/${selectedEntity._id}?doc=${docType}` : '';

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 no-print">
                <div>
                    <h1 className="text-2xl font-black uppercase tracking-tighter font-outfit text-white">Identity & Credentials Hub</h1>
                    <p className="text-slate-400 text-sm mt-1">Institutional authentication and certification issuance node</p>
                </div>
                {/* <div className="flex items-center gap-3">
                    <button
                        onClick={handleDownload}
                        disabled={!selectedEntity}
                        className={`flex items-center gap-2 px-6 py-3 rounded-md font-black text-xs uppercase tracking-widest transition-all shadow-lg text-white ${!selectedEntity ? 'bg-slate-800 text-slate-500 cursor-not-allowed' : 'bg-brand-primary hover:bg-blue-600 shadow-blue-600/20'}`}
                    >
                        <Download size={16} /> Download Document
                    </button>
                </div> */}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 h-[calc(100vh-250px)]">
                {/* Left Panel: Entity List */}
                <div className="lg:col-span-4 flex flex-col gap-4 no-print overflow-hidden h-full">
                    <div className="flex bg-slate-900/50 p-1 rounded-md border border-brand-border/40">
                        <button onClick={() => setTab('students')} className={`flex-1 py-2 text-[10px] font-black uppercase tracking-widest rounded transition-all ${tab === 'students' ? 'bg-brand-primary text-white' : 'text-slate-500 hover:text-slate-300'}`}>Students</button>
                        <button onClick={() => setTab('teachers')} className={`flex-1 py-2 text-[10px] font-black uppercase tracking-widest rounded transition-all ${tab === 'teachers' ? 'bg-brand-primary text-white' : 'text-slate-500 hover:text-slate-300'}`}>Staff Core</button>
                    </div>

                    <div className="relative">
                        <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600" />
                        <input
                            type="text"
                            placeholder="Find identity node..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full bg-slate-900 border border-brand-border/40 py-3 pl-12 pr-6 rounded-md text-white text-xs font-bold outline-none focus:border-brand-primary transition-all"
                        />
                    </div>

                    <div className="flex-1 overflow-y-auto space-y-2 pr-2 custom-scrollbar">
                        {loading && activeList.length === 0 ? (
                            [...Array(6)].map((_, i) => <div key={i} className="h-16 bg-slate-800/20 rounded-md border border-white/5 animate-pulse" />)
                        ) : filtered.map(e => (
                            <button
                                key={e._id}
                                onClick={() => setSelectedEntity(e)}
                                className={`w-full flex items-center gap-3 p-3 rounded-md border transition-all text-left group ${selectedEntity?._id === e._id ? 'bg-brand-primary border-brand-primary' : 'bg-brand-surface border-brand-border/40 hover:border-brand-primary/40'}`}
                            >
                                <div className={`w-10 h-10 rounded-md overflow-hidden flex-shrink-0 border ${selectedEntity?._id === e._id ? 'border-white/20' : 'border-white/5'}`}>
                                    {e.photo ? <img src={e.photo} alt="" className="w-full h-full object-cover" /> : <User size={20} className="mx-auto mt-2 text-slate-700" />}
                                </div>
                                <div>
                                    <p className={`text-[11px] font-black uppercase tracking-tight italic leading-tight ${selectedEntity?._id === e._id ? 'text-white' : 'text-slate-200 group-hover:text-brand-primary'}`}>{e.firstName} {e.lastName}</p>
                                    <p className={`text-[9px] font-bold ${selectedEntity?._id === e._id ? 'text-white/60' : 'text-slate-500'}`}>{e.admissionNumber || e.employeeId}</p>
                                </div>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Right Panel: Template Selection & Preview */}
                <div className="lg:col-span-8 flex flex-col gap-6 h-full">
                    {/* Template Selection */}
                    <div className="flex gap-3 no-print">
                        {[
                            { id: 'idCard', icon: CreditCard, label: 'Identity Pulse' },
                            { id: 'bonafide', icon: ShieldCheck, label: 'Bonafide Trace' },
                            { id: 'tc', icon: Award, label: 'Transfer Node' },
                        ].map(t => (
                            <button
                                key={t.id}
                                onClick={() => setDocType(t.id)}
                                className={`flex items-center gap-2 px-5 py-3 rounded-md text-[10px] font-black uppercase tracking-widest border transition-all ${docType === t.id ? 'bg-indigo-500/10 border-indigo-500 text-indigo-400' : 'bg-slate-900 border-brand-border/40 text-slate-500 hover:text-slate-300'}`}
                            >
                                <t.icon size={14} /> {t.label}
                            </button>
                        ))}
                    </div>

                    {/* Preview Area */}
                    <div className="flex-1 bg-slate-900/40 border border-brand-border/40 rounded-md overflow-y-auto p-12 flex items-center justify-center custom-scrollbar bg-[radial-gradient(circle_at_center,_#ffffff02_1px,_transparent_1px)] bg-[size:24px_24px]">
                        {!selectedEntity ? (
                            <div className="text-center space-y-4 no-print">
                                <ScanLine size={48} className="text-slate-800 mx-auto opacity-20" />
                                <p className="text-slate-600 font-black uppercase tracking-[0.3em] text-[10px] italic">Awaiting Identity Selection Pipeline...</p>
                            </div>
                        ) : (
                            <div className="print-area animate-in zoom-in-95 duration-500">
                                {docType === 'idCard' && (
                                    <div ref={docRef} className="id-card-preview relative w-full h-full bg-brand-surface rounded-xl border border-brand-border p-5 text-white shadow-2xl overflow-hidden font-outfit">
                                        {/* Background Elements */}
                                        <div className="absolute -top-10 -right-10 w-40 h-40 bg-brand-primary opacity-5 blur-[50px] rounded-md"></div>
                                        <div className="absolute top-0 right-0 w-24 h-full bg-slate-900/50 skew-x-[-15deg] translate-x-12 border-l border-brand-border/40"></div>

                                        <div className="relative z-10 flex gap-5 h-full">
                                            <div className="flex flex-col items-center gap-3">
                                                <div className="w-24 h-28 rounded-md bg-slate-800 border-2 border-brand-primary/30 overflow-hidden shadow-lg">
                                                    {selectedEntity.photo ? <img src={selectedEntity.photo} alt="" className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center bg-slate-900"><User size={40} className="text-slate-800" /></div>}
                                                </div>
                                                <div className="w-20 h-20 bg-white p-1 rounded-md shadow-xl flex items-center justify-center">
                                                    <QRCodeSVG
                                                        value={verifyUrl}
                                                        size={120}
                                                        level="L"
                                                        marginSize={2}
                                                    />
                                                </div>
                                            </div>

                                            <div className="flex-1 flex flex-col justify-between py-1">
                                                <div>
                                                    <p className="text-[10px] font-black uppercase tracking-[0.3em] text-brand-primary mb-1">PRO-ACADEMY GLOBAL</p>
                                                    <h2 className="text-lg font-black uppercase tracking-tight italic">{selectedEntity.firstName} {selectedEntity.lastName}</h2>
                                                    <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">{tab === 'students' ? 'Student Node' : 'Personnel Core'}</p>
                                                </div>

                                                <div className="space-y-2">
                                                    <div className="flex items-center gap-1.5 overflow-hidden whitespace-nowrap">
                                                        <Fingerprint size={10} className="text-indigo-400 shrink-0" />
                                                        <span className="text-[9px] font-black uppercase text-slate-500 tracking-tighter">Identity Trace:</span>
                                                        <span className="text-[9px] font-black text-white font-mono">{selectedEntity.admissionNumber || selectedEntity.employeeId}</span>
                                                    </div>
                                                    {tab === 'students' && (
                                                        <div className="flex items-center gap-1.5">
                                                            <Grid size={10} className="text-emerald-400 shrink-0" />
                                                            <span className="text-[9px] font-black uppercase text-slate-500 tracking-tighter">Sector:</span>
                                                            <span className="text-[9px] font-black text-white">{selectedEntity.classSection?.sectionLabel || 'NULL'}</span>
                                                        </div>
                                                    )}
                                                    <div className="flex items-center gap-1.5">
                                                        <Calendar size={10} className="text-amber-400 shrink-0" />
                                                        <span className="text-[9px] font-black uppercase text-slate-500 tracking-tighter">Relates Since:</span>
                                                        <span className="text-[9px] font-black text-white">{moment(selectedEntity.joiningDate || selectedEntity.createdAt).format('MM.YYYY')}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="absolute bottom-4 right-4 opacity-10 blur-[1px]">
                                            <p className="text-[8px] font-black uppercase tracking-widest -rotate-6">DDeepmind_Encrypted</p>
                                        </div>
                                    </div>
                                )}

                                {docType === 'bonafide' && (
                                    <div ref={docRef} className="bonafide-preview w-[210mm] h-[297mm] bg-white text-slate-900 p-20 shadow-2xl relative border-[20px] border-slate-900 border-double m-auto flex flex-col justify-between">
                                        <div className="absolute top-10 left-10 opacity-10"><Award size={100} /></div>
                                        <header className="text-center mb-8 space-y-2 border-b-2 border-slate-900 pb-8 relative z-10">
                                            <h1 className="text-4xl font-black uppercase tracking-tighter italic">Institutional Credentials Node</h1>
                                            <p className="text-xs font-bold uppercase tracking-[0.5em] text-slate-500">Autonomous Scholastic Federation</p>
                                            <p className="text-[10px] font-bold text-slate-600">Trace: {selectedEntity._id} | Node_Verified: {moment().format('YYYY.MM.DD')}</p>
                                        </header>

                                        <article className="space-y-12 text-center flex-1 relative z-10">
                                            <h2 className="text-7xl font-black uppercase tracking-widest text-slate-900 italic underline decoration-slate-900/10 mb-10">Bonafide Trace</h2>
                                            
                                            <div className="space-y-10">
                                                <p className="text-2xl leading-loose font-serif italic text-slate-800">
                                                    This is to verify the institutional presence of <br />
                                                    <span className="text-4xl font-black uppercase tracking-tight text-black not-italic px-4 border-b-2 border-slate-900 mx-2">{selectedEntity.firstName} {selectedEntity.lastName}</span> <br />
                                                    {tab === 'students' ? (
                                                        <>bearing Identity Trace <span className="font-bold">#{selectedEntity.admissionNumber}</span>, currently interfaced with sector <span className="font-bold underline italic">{selectedEntity.classSection?.sectionLabel || 'N/A'}</span>.</>
                                                    ) : (
                                                        <>registered under Personnel Core with ID <span className="font-bold">#{selectedEntity.employeeId}</span>.</>
                                                    )}
                                                </p>
                                                
                                                <p className="text-xl text-slate-600 leading-relaxed max-w-2xl mx-auto italic">
                                                    As per the neural registry archives, the subject remains in active standing and demonstrates consistent behavioral alignment within the institutional framework of <span className="font-bold text-slate-900">Pro-Academy Global</span>.
                                                </p>
                                            </div>
                                        </article>

                                        <footer className="w-full flex justify-between items-end border-t border-slate-200 mt-8 pt-8 relative z-10">
                                            <div className="text-left space-y-4">
                                                <div className="w-32 h-32 border-2 border-slate-100 p-2 flex items-center justify-center bg-white">
                                                    <QRCodeSVG
                                                        value={verifyUrl}
                                                        size={120}
                                                        level="M"
                                                        marginSize={2}
                                                    />
                                                </div>
                                                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Scan to Verify Authenticity</p>
                                            </div>
                                            <div className="text-right space-y-6">
                                                <div className="h-20 w-64 border-b-2 border-slate-900 flex items-center justify-center italic font-black text-slate-400 opacity-20 text-xl tracking-tighter">SIG_VERIFIED_AX25</div>
                                                <div className="space-y-1">
                                                    <p className="text-sm font-black uppercase tracking-widest text-slate-900 italic">Institutional Registrar</p>
                                                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Global Node Controller</p>
                                                </div>
                                            </div>
                                        </footer>
                                    </div>
                                )}

                                {docType === 'tc' && (
                                    <div ref={docRef} className="tc-preview w-[210mm] h-[297mm] bg-white text-slate-900 p-10 shadow-2xl relative border-8 border-indigo-900/10 m-auto">
                                        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-[0.03] pointer-events-none"></div>
                                        <div className="border-4 border-slate-900 p-10 h-full flex flex-col justify-between relative z-10">
                                            <header className="text-center border-b-4 border-slate-900 pb-10">
                                                <h1 className="text-6xl font-black uppercase tracking-tighter text-slate-900 italic mb-4">Transfer Directive</h1>
                                                <p className="text-sm font-bold uppercase tracking-[0.4em] text-slate-500">Global Academic Transit Protocol</p>
                                                <p className="text-[12px] font-bold text-indigo-700 font-mono mt-4">SERIAL_ID: TC-{moment().year()}-{selectedEntity._id.toString().slice(-6).toUpperCase()}</p>
                                            </header>

                                            <div className="flex-1 py-12 space-y-6 text-lg text-slate-800 font-serif text-left">
                                                {[
                                                    { label: '1. Name of the Subject', value: `${selectedEntity.firstName} ${selectedEntity.lastName}` },
                                                    { label: '2. Parental Identifier', value: selectedEntity.guardianName || (selectedEntity.parentId ? `${selectedEntity.parentId.firstName} ${selectedEntity.parentId.lastName}` : 'Institutional Hub #9921'), isUppercase: true },
                                                    { label: '3. Standard / Sector', value: `${selectedEntity.standard?.name || 'N/A'} / ${selectedEntity.classSection?.sectionLabel || 'General'}` },
                                                    { label: '4. Date of Initial Interface', value: moment(selectedEntity.createdAt).format('DD MMMM YYYY') },
                                                    { label: '5. Highest Attained Grade', value: selectedEntity.classSection?.sectionLabel || (tab === 'students' ? 'N/A' : 'Faculty') },
                                                    { label: '6. Behavioral Conduct Evaluation', value: 'OPTIMAL / EXEMPLARY' },
                                                    { label: '7. Global Standing', value: 'CLEARANCE GRANTED' },
                                                ].map((item, idx) => (
                                                    <div key={idx} className="flex items-end gap-4 text-left">
                                                        <span className="min-w-[300px] text-slate-500 font-bold uppercase tracking-tight text-sm shrink-0 text-left">{item.label}:</span>
                                                        <span className={`flex-1 border-b-2 border-slate-200 pb-1 px-4 font-black ${item.isUppercase ? 'uppercase' : ''} text-slate-900 text-left`}>
                                                            {item.value}
                                                        </span>
                                                    </div>
                                                ))}
                                            </div>

                                            <div className="mt-auto flex justify-between items-end pt-10 border-t border-slate-100">
                                                <div className="text-left space-y-4">
                                                    <p className="text-xs font-black uppercase text-slate-500">Issued on: {moment().format('MMMM Do, YYYY')}</p>
                                                    <div className="w-32 h-32 border border-slate-200 p-2 flex items-center justify-center bg-white">
                                                        <QRCodeSVG
                                                            value={verifyUrl}
                                                            size={120}
                                                            level="M"
                                                            marginSize={2}
                                                        />
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <div className="w-64 h-px bg-slate-900 mb-4"></div>
                                                    <p className="text-xs font-black uppercase tracking-[0.2em] text-slate-900 italic">Authorized System Admin</p>
                                                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Global Node Controller</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <style>{`
                @media print {
                    .no-print { display: none !important; }
                    .print-area { transform: none !important; margin: 0 !important; border: none !important; padding: 0 !important; box-shadow: none !important; }
                    body { background: white !important; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
                    .id-card-preview { transform: scale(1.5) !important; margin: 2in auto !important; }
                    .tc-preview, .bonafide-preview { margin: 0 !important; width: 100% !important; height: auto !important; }
                }
            `}</style>
        </div>
    );
};

export default CertificateHub;
