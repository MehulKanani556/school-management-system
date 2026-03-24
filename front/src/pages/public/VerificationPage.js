import React, { useEffect } from 'react';
import { useParams, Link, useSearchParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { verifyIdentity, clearVerification } from '../../redux/slice/verification.slice';
import { motion } from 'framer-motion';
import { 
    ShieldCheck, User, 
    Award, Fingerprint, Calendar, 
    AtSign, MapPin, 
    QrCode, Grid,
    CheckCircle2,
    XCircle,
    FileText,
    Download
} from 'lucide-react';
import moment from 'moment';

const VerificationPage = () => {
    const { type, id } = useParams();
    const [searchParams] = useSearchParams();
    const doc = searchParams.get('doc') || 'idCard';
    const dispatch = useDispatch();
    const { record: data, loading, error } = useSelector((state) => state.verification);

    useEffect(() => {
        if (id && type) {
            dispatch(verifyIdentity({ type, id }));
        }
        return () => dispatch(clearVerification());
    }, [id, type, dispatch]);

    if (loading) return (
        <div className="min-h-screen bg-[#050608] flex items-center justify-center font-outfit">
            <div className="text-center space-y-4">
                <div className="w-16 h-16 border-4 border-brand-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
                <p className="text-slate-400 font-black uppercase tracking-[0.3em] text-[10px]">Initializing Verification Node...</p>
            </div>
        </div>
    );

    if (error) return (
        <div className="min-h-screen bg-[#050608] flex items-center justify-center p-6 font-outfit">
            <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="max-w-md w-full bg-slate-900/50 border border-red-500/20 rounded-2xl p-8 text-center space-y-6 shadow-2xl shadow-red-500/5 backdrop-blur-md"
            >
                <div className="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center mx-auto text-red-500">
                    <XCircle size={40} />
                </div>
                <div className="space-y-2">
                    <h1 className="text-2xl font-black uppercase tracking-tighter text-white">Identity Error</h1>
                    <p className="text-slate-400 text-sm leading-relaxed">{error}</p>
                </div>
                <Link to="/" className="inline-block px-8 py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-full text-[10px] font-black uppercase tracking-widest text-slate-300 transition-all">Return to Core</Link>
            </motion.div>
        </div>
    );

    if (!data) return null;

    if (doc === 'bonafide' || doc === 'tc') {
        const isTC = doc === 'tc';
        return (
            <div className={`min-h-screen flex items-center justify-center p-4 md:p-10 font-outfit ${isTC ? 'bg-slate-950' : 'bg-white'}`}>
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`w-full max-w-[210mm] relative shadow-2xl overflow-hidden border-8 ${isTC ? 'bg-white border-indigo-900/10' : 'bg-white border-slate-900 border-double p-5 md:p-10'}`}
                >
                    {isTC ? (
                         <div className="p-10 md:p-20 border-4 border-slate-900 h-full relative">
                            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-[0.03] pointer-events-none"></div>
                            <header className="text-center border-b-4 border-slate-900 pb-10">
                                <h1 className="text-3xl md:text-5xl font-black uppercase tracking-tighter text-slate-900 italic mb-4">Transfer Directive</h1>
                                <p className="text-sm font-bold uppercase tracking-[0.4em] text-slate-500">Global Academic Transit Protocol</p>
                                <p className="text-[10px] font-bold text-indigo-700 font-mono mt-4">SERIAL: TC-{moment().year()}-{data._id.toString().slice(-6).toUpperCase()}</p>
                            </header>

                            <div className="py-16 text-sm md:text-lg leading-[3] text-slate-800 font-serif">
                                1. Name of the Subject: <span className="font-bold border-b border-slate-300 px-4 inline-block min-w-[200px]">{data.firstName} {data.lastName}</span> <br />
                                2. Parental Identifier: <span className="font-bold border-b border-slate-300 px-4 inline-block min-w-[200px]">{data.guardianName || 'Node Registry 9921'}</span> <br />
                                3. Nationality / Sector: <span className="font-bold border-b border-slate-300 px-4 inline-block min-w-[200px]">Institutional Global</span> <br />
                                4. Date of Initial Interface: <span className="font-bold border-b border-slate-300 px-4 inline-block min-w-[200px]">{moment(data.createdAt).format('DD MMMM YYYY')}</span> <br />
                                5. Highest Attained Grade: <span className="font-bold border-b border-slate-300 px-4 inline-block min-w-[200px]">{data.classSection?.sectionLabel || (type === 'teacher' ? 'Faculty' : 'Staff')}</span> <br />
                                6. Behavioral Conduct Evaluation: <span className="font-bold border-b border-slate-300 px-4 inline-block min-w-[200px]">OPTIMAL / EXEMPLARY</span> <br />
                                7. Global Standing: <span className="font-bold border-b border-slate-300 px-4 inline-block min-w-[200px]">CLEARANCE GRANTED</span>
                            </div>

                            <footer className="mt-10 pt-10 border-t-2 border-slate-100 flex justify-between items-end">
                                <div className="text-left">
                                    <p className="text-[10px] font-black uppercase text-slate-500 mb-2">Verified System Hub</p>
                                    <div className="flex items-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-600 rounded-md border border-emerald-100 text-[9px] font-black uppercase tracking-widest">
                                        <ShieldCheck size={14} /> DOCUMENT_AUTHENTICATED
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className="w-48 h-px bg-slate-900 mb-4 ml-auto"></div>
                                    <p className="text-xs font-black uppercase tracking-widest text-slate-900">Institutional Registrar</p>
                                </div>
                            </footer>
                         </div>
                    ) : (
                        <div className="p-5 md:p-10 border-[10px] md:border-[20px] border-slate-900 border-double h-full relative bg-white text-slate-900">
                             <div className="absolute top-10 left-10 opacity-10"><Award size={100} /></div>
                             <header className="text-center mb-10 md:mb-16 space-y-2 border-b-2 border-slate-900 pb-8">
                                <h1 className="text-2xl md:text-4xl font-black uppercase tracking-tighter italic">Institutional Credentials Node</h1>
                                <p className="text-[10px] md:text-xs font-bold uppercase tracking-[0.5em] text-slate-500">Autonomous Scholastic Federation</p>
                                <p className="text-[9px] md:text-[10px] font-bold text-slate-600">Verified_Trace: {data._id} | Node_Verified: {moment().format('YYYY.MM.DD')}</p>
                             </header>

                             <article className="space-y-10 text-center py-10">
                                <h2 className="text-4xl md:text-6xl font-black uppercase tracking-widest text-slate-900 italic underline decoration-slate-900/10">Bonafide Trace</h2>
                                
                                <p className="text-lg md:text-xl leading-loose font-serif italic text-slate-800">
                                    This is to verify the institutional presence of <br />
                                    <span className="text-2xl md:text-3xl font-black uppercase tracking-tight text-black not-italic mx-2">{data.firstName} {data.lastName}</span> <br />
                                    {type === 'student' ? (
                                        <>bearing Identity Trace <span className="font-bold">#{data.admissionNumber}</span>, currently interfaced with sector <span className="font-bold underline italic">{data.classSection?.sectionLabel || 'N/A'}</span>.</>
                                    ) : (
                                        <>registered under Personnel Core with ID <span className="font-bold">#{data.employeeId}</span>.</>
                                    )}
                                </p>
                             </article>

                             <footer className="mt-20 border-t border-slate-200 pt-10 flex flex-col md:flex-row justify-between items-center gap-8">
                                <div className="flex items-center gap-4 bg-emerald-50 text-emerald-600 px-6 py-3 rounded-md border border-emerald-100">
                                    <ShieldCheck size={24} />
                                    <div className="text-left">
                                        <p className="text-[10px] font-black uppercase tracking-widest leading-none mb-1">Authenticity Locked</p>
                                        <p className="text-[8px] font-bold uppercase tracking-widest leading-none">Institutional System Signature #AX22</p>
                                    </div>
                                </div>
                                <div className="text-center md:text-right">
                                    <div className="w-48 h-px bg-slate-900 mb-4 mx-auto md:ml-auto md:mr-0"></div>
                                    <p className="text-xs font-black uppercase tracking-widest text-slate-900 italic">Registrar General</p>
                                </div>
                             </footer>
                        </div>
                    )}
                </motion.div>
                
                <button 
                  onClick={() => window.print()} 
                  className="fixed bottom-8 right-8 bg-brand-primary text-white p-4 rounded-full shadow-2xl hover:scale-110 transition-all no-print-btn"
                  title="Print Document"
                >
                    <Download size={24} />
                </button>
                <style>{`
                    @media print {
                        .no-print-btn { display: none !important; }
                        body { background: white !important; margin: 0; }
                    }
                `}</style>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#050608] text-slate-200 font-outfit p-4 md:p-8 flex flex-col items-center justify-center relative overflow-hidden">
            {/* Background elements */}
            <div className="absolute top-0 left-0 w-full h-full pointer-events-none overflow-hidden opacity-30">
                <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-brand-primary/20 blur-[150px] rounded-full"></div>
                <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] bg-indigo-600/20 blur-[150px] rounded-full"></div>
            </div>

            <motion.div 
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                className="max-w-xl w-full relative z-10"
            >
                {/* School Header */}
                <div className="flex items-center justify-center gap-4 mb-8">
                    {data.schoolId?.logo && <img src={data.schoolId.logo} alt="" className="w-12 h-12 object-contain" />}
                    <div className="text-left">
                        <h2 className="text-xl font-black uppercase tracking-tighter text-white leading-tight">{data.schoolId?.name || 'Pro-Academy Global'}</h2>
                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest italic flex items-center gap-2">
                           <ShieldCheck size={12} className="text-brand-primary" /> Verified Institutional Node
                        </p>
                    </div>
                </div>

                {/* Main Identity Card */}
                <div className="bg-slate-900/40 backdrop-blur-3xl border border-white/10 rounded-3xl overflow-hidden shadow-2xl shadow-black/50">
                    {/* Status Header */}
                    <div className="bg-brand-primary/10 border-b border-brand-primary/20 px-8 py-4 flex items-center justify-between">
                        <span className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-brand-primary">
                            <QrCode size={14} /> Identity Record
                        </span>
                        <span className="flex items-center gap-1.5 px-3 py-1 bg-emerald-500/10 text-emerald-500 rounded-full text-[9px] font-black uppercase tracking-[0.2em] italic">
                            Active Node
                        </span>
                    </div>

                    <div className="p-8 space-y-8">
                        {/* Profile Header */}
                        <div className="flex flex-col md:flex-row items-center gap-8">
                            <div className="relative group">
                                <div className="absolute inset-0 bg-brand-primary/50 blur-2xl group-hover:blur-3xl transition-all opacity-20"></div>
                                <div className="w-40 h-40 rounded-3xl overflow-hidden border-4 border-slate-800 shadow-2xl relative">
                                    {data.photo ? (
                                        <img src={data.photo} className="w-full h-full object-cover" alt="" />
                                    ) : (
                                        <div className="w-full h-full bg-slate-800 flex items-center justify-center text-slate-600">
                                            <User size={60} />
                                        </div>
                                    )}
                                </div>
                            </div>
                            
                            <div className="text-center md:text-left space-y-3">
                                <h1 className="text-4xl md:text-5xl font-black uppercase tracking-tighter italic text-white">{data.firstName} {data.lastName}</h1>
                                <div className="flex flex-wrap justify-center md:justify-start gap-4">
                                    <div className="flex items-center gap-2">
                                        <Fingerprint size={16} className="text-indigo-400" />
                                        <span className="text-xs font-black uppercase text-slate-400 tracking-widest">{type === 'student' ? 'Admission' : 'Employee'}: <span className="text-white ml-1">{data.admissionNumber || data.employeeId}</span></span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Grid size={16} className="text-emerald-400" />
                                        <span className="text-xs font-black uppercase text-slate-400 tracking-widest">Sector: <span className="text-white ml-1">{data.classSection?.sectionLabel || (type === 'teacher' ? 'Management' : 'General')}</span></span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Details Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {[
                                { icon: Calendar, label: type === 'student' ? 'DOB' : 'Joined', value: moment(data.dateOfBirth || data.joiningDate).format('DD MMMM YYYY') },
                                { icon: Award, label: 'Level', value: data.standard?.name || (type === 'teacher' ? 'Faculty' : 'Staff') },
                                { icon: AtSign, label: 'Interface', value: data.email || 'N/A' },
                                { icon: MapPin, label: 'Origin', value: data.schoolId?.address || 'Global Campus' },
                            ].map((item, i) => (
                                <div key={i} className="p-4 bg-white/3 border border-white/5 rounded-2xl flex items-center gap-4 transition-all hover:bg-white/5">
                                    <div className="w-10 h-10 rounded-xl bg-slate-800/50 flex items-center justify-center text-slate-400 shrink-0">
                                        <item.icon size={20} />
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">{item.label}</p>
                                        <p className="text-[13px] font-bold text-white leading-tight uppercase">{item.value}</p>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Security Footer */}
                        <div className="pt-8 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-4 text-center md:text-left">
                            <div className="space-y-1">
                                <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Security Trace</p>
                                <p className="text-[9px] font-mono text-slate-600 truncate max-w-[300px]">{data._id}</p>
                            </div>
                            <div className="flex items-center gap-2 px-6 py-3 bg-brand-primary text-white rounded-full font-black text-[10px] uppercase tracking-widest shadow-xl shadow-brand-primary/20">
                                <CheckCircle2 size={16} /> Authenticated
                            </div>
                        </div>
                    </div>
                </div>

                <div className="mt-8 text-center text-slate-600 text-[10px] font-black uppercase tracking-[0.4em]">
                    Powered by Antigravity OS Node 253.1
                </div>
            </motion.div>
        </div>
    );
};

export default VerificationPage;
