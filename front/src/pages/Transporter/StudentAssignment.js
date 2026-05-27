import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { fetchRoutesSlice, assignStudentSlice, unassignStudentSlice, bulkAssignStudentSlice, clearTransportMessage, fetchTransportApplicantsSlice, rejectApplicantSlice } from '../../redux/slice/transport.slice';
import { fetchStudents } from '../../redux/slice/schoolAdmin.slice';
import { Users, Navigation, MapPin, Search, Plus, User, Loader2, X, AlertCircle, Inbox, CheckCircle, XCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';

const StudentAssignment = () => {
    const dispatch = useDispatch();
    const { routes, applicants, loading, message, error } = useSelector((state) => state.transport);
    const { students } = useSelector((state) => state.schoolAdmin);
    const [activeTab, setActiveTab] = React.useState('manifest'); // manifest, inquiries
    const [isAddOpen, setIsAddOpen] = React.useState(false);
    const [isBulkOpen, setIsBulkOpen] = React.useState(false);
    const [searchQuery, setSearchQuery] = React.useState('');
    const [selectedStudents, setSelectedStudents] = React.useState([]);
    const [formData, setFormData] = React.useState({ routeId: '', studentId: '', pickupStop: '', dropoffStop: '', seatNumber: '' });
    const [bulkData, setBulkData] = React.useState({ routeId: '', pickupStop: '', dropoffStop: '', seatNumber: '' });
    const [studentSearch, setStudentSearch] = React.useState('');

    useEffect(() => {
        dispatch(fetchRoutesSlice());
        dispatch(fetchStudents());
        dispatch(fetchTransportApplicantsSlice());
    }, [dispatch]);

    useEffect(() => {
        if (message) {
            toast.success(message);
            dispatch(clearTransportMessage());
            dispatch(fetchTransportApplicantsSlice());
            setIsAddOpen(false);
            setIsBulkOpen(false);
            setSelectedStudents([]);
            setFormData({ routeId: '', studentId: '', pickupStop: '', dropoffStop: '', seatNumber: '' });
            setBulkData({ routeId: '', pickupStop: '', dropoffStop: '', seatNumber: '' });
        }
        if (error) {
            toast.error(error);
            dispatch(clearTransportMessage());
        }
    }, [message, error, dispatch]);

    const handleAssign = (e) => {
        e.preventDefault();
        dispatch(assignStudentSlice({ routeId: formData.routeId, data: formData }));
    }

    const handleBulkAssign = (e) => {
        e.preventDefault();
        if (selectedStudents.length === 0) return toast.error('No students selected for bulk assignment.');
        dispatch(bulkAssignStudentSlice({
            routeId: bulkData.routeId,
            studentIds: selectedStudents,
            pickupStop: bulkData.pickupStop,
            dropoffStop: bulkData.dropoffStop
        }));
    }

    const toggleStudentSelection = (id) => {
        setSelectedStudents(prev =>
            prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]
        );
    }

    const filteredStudents = students.filter(s =>
    (
        `${s.firstName} ${s.lastName}`.toLowerCase().includes(studentSearch.toLowerCase()) ||
        s.admissionNumber?.toLowerCase().includes(studentSearch.toLowerCase())
    )
    );

    const handleUnassign = async (routeId, studentId) => {
        if (await window.confirm('Remove student from route? This will remove the student from the route assignment.')) {
            dispatch(unassignStudentSlice({ routeId, studentId }));
        }
    }

    const runLogicEngine = () => {
        const unassignedStudents = studentList.filter(s =>
            !routes.some(r => r.assignedStudents?.some(as => as.studentId?._id === s._id))
        );

        if (unassignedStudents.length === 0) {
            return toast.success('All students already assigned to routes.');
        }

        let suggestionsCount = 0;
        unassignedStudents.forEach(student => {
            const match = routes.find(r =>
                r.stops.some(stop => student.address?.toLowerCase().includes(stop.name.toLowerCase()))
            );

            if (match) {
                const stop = match.stops.find(s => student.address?.toLowerCase().includes(s.name.toLowerCase()));
                setFormData({
                    studentId: student._id,
                    routeId: match._id,
                    pickupStop: stop.name,
                    dropoffStop: stop.name,
                    seatNumber: ''
                });
                setIsAddOpen(true);
                suggestionsCount++;
                toast.success(`Route match found: ${student.firstName} -> ${match.name}`);
                return;
            }
        });

        if (suggestionsCount === 0) {
            toast.error('No matching routes found for student addresses.');
        }
    }

    const filteredRoutes = routes.map(route => ({
        ...route,
        assignedStudents: route.assignedStudents?.filter(as =>
            as.studentId?.firstName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            as.studentId?.lastName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            as.pickupStop?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            route.name?.toLowerCase().includes(searchQuery.toLowerCase())
        )
    })).filter(route => route.assignedStudents?.length > 0 || route.name?.toLowerCase().includes(searchQuery.toLowerCase()));

    const studentList = students.filter(s => s.role === 'Student');

    return (
        <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} className="space-y-8 pb-10">
            <div className="flex flex-col xl:flex-row justify-between items-start xl:items-end gap-6 px-2 font-outfit">
                <div>
                    <h1 className="text-3xl font-black italic uppercase tracking-tighter mb-1 leading-none text-transporter-primary">Assign Seats</h1>
                    <p className="text-[11px] font-black text-slate-500 uppercase tracking-widest italic opacity-70 leading-none">Assign seats to students and manage requests.</p>
                </div>

                <div className="flex flex-col sm:flex-row items-center gap-4 w-full xl:w-auto">
                    {/* Tab Navigation */}
                    <div className="flex p-1 bg-neutral-900 border border-slate-800 rounded-md h-[42px] mr-4">
                        <button 
                            onClick={() => setActiveTab('manifest')}
                            className={`px-6 h-full text-[10px] font-black uppercase italic tracking-widest rounded transition-all flex items-center gap-2 ${activeTab === 'manifest' ? 'bg-transporter-primary text-white shadow-lg shadow-transporter-primary/20' : 'text-slate-500 hover:text-slate-300'}`}
                        >
                            <Users size={12} /> Assigned Students
                        </button>
                        <button 
                            onClick={() => setActiveTab('inquiries')}
                            className={`px-6 h-full text-[10px] font-black uppercase italic tracking-widest rounded transition-all flex items-center gap-2 relative ${activeTab === 'inquiries' ? 'bg-transporter-primary text-white shadow-lg shadow-transporter-primary/20' : 'text-slate-500 hover:text-slate-300'}`}
                        >
                            <Inbox size={12} /> New Requests
                            {applicants.length > 0 && <span className="absolute -top-1 -right-1 w-4 h-4 bg-rose-500 text-[8px] flex items-center justify-center rounded-full border border-black animate-bounce">{applicants.length}</span>}
                        </button>
                    </div>

                    <div className="relative flex-1 sm:w-64">
                        <Search className="absolute left-3 top-2.5 text-slate-600" size={14} />
                        <input
                            type="text"
                            placeholder="Search Students..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="bg-neutral-900 border border-slate-800/60 rounded-md py-2.5 pl-9 pr-4 text-xs font-bold text-slate-200 focus:outline-none focus:border-transporter-primary/50 transition-all w-full italic h-[42px]"
                        />
                    </div>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => setIsAddOpen(true)}
                            className="px-6 py-4 bg-transporter-primary text-white text-[11px] font-black italic uppercase tracking-widest rounded-md shadow-lg shadow-transporter-primary/20 hover:shadow-transporter-primary/40 hover:translate-y-[-2px] transition-all flex items-center gap-2 group leading-none font-outfit whitespace-nowrap h-[42px]"
                        >
                            <Plus size={14} /> Add Student
                        </button>
                        <button
                            onClick={() => setIsBulkOpen(true)}
                            className="px-6 py-4 bg-neutral-900 border border-slate-800 text-slate-300 text-[11px] font-black italic uppercase tracking-widest rounded-md hover:bg-slate-800 transition-all flex items-center gap-2 leading-none font-outfit h-[42px]"
                        >
                            <Users size={14} /> Bulk Add
                        </button>
                        <button
                            onClick={runLogicEngine}
                            className="px-6 py-4 bg-transporter-primary/10 border border-transporter-primary text-transporter-primary text-[11px] font-black italic uppercase tracking-widest rounded-md hover:bg-transporter-primary hover:text-white transition-all flex items-center gap-2 leading-none font-outfit h-[42px] group"
                        >
                            <Navigation size={14} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" /> auto match
                        </button>
                        <label className="px-6 py-4 bg-transporter-primary/10 border border-transporter-primary text-transporter-primary text-[11px] font-black italic uppercase tracking-widest rounded-md hover:bg-transporter-primary hover:text-white transition-all flex items-center gap-2 cursor-pointer leading-none font-outfit h-[42px]">
                            <Plus size={14} /> Add from File
                            <input
                                type="file"
                                accept=".csv"
                                className="hidden"
                                onChange={(e) => {
                                    const file = e.target.files[0];
                                    if (file) {
                                        const reader = new FileReader();
                                        reader.onload = (evt) => {
                                            const text = evt.target.result;
                                            const lines = text.split('\n');
                                            const studentIds = lines.slice(1).map(l => l.split(',')[0].trim()).filter(id => id);
                                            if (studentIds.length > 0) {
                                                setBulkData({ ...bulkData });
                                                setSelectedStudents(studentIds);
                                                setIsBulkOpen(true);
                                                toast.success(`${studentIds.length} students extracted from CSV file.`);
                                            }
                                        };
                                        reader.readAsText(file);
                                    }
                                }}
                            />
                        </label>
                    </div>
                </div>
            </div>

            {activeTab === 'manifest' ? (
                <div className="grid grid-cols-1 gap-6 font-outfit">
                    {filteredRoutes.map((route) => (
                        <div key={route._id} className="bg-neutral-900 border border-slate-800/60 rounded-md shadow-2xl overflow-hidden group hover:border-transporter-primary/20 transition-all">
                            <div className="px-8 py-6 border-b border-slate-800/60 bg-neutral-950/40 flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <Navigation size={18} className="text-transporter-primary" />
                                    <h3 className="text-md font-black text-slate-100 uppercase italic tracking-tighter">{route.name} Route</h3>
                                    <div className="flex items-center gap-3">
                                        <span className="text-[9px] font-black uppercase text-slate-500 italic bg-slate-900 px-3 py-1 rounded-md border border-slate-800/60">{route.assignedStudents?.length || 0} Students</span>
                                        <span className="text-[9px] font-black uppercase text-slate-500 italic bg-slate-900 px-3 py-1 rounded-md border border-slate-800/60">Bus: {route.vehicleId?.registrationNumber || 'NA'}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="p-8">
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {route.assignedStudents?.map((as, idx) => (
                                        <div key={idx} className="bg-neutral-950/40 border border-slate-800/60 rounded-md p-5 flex items-center gap-4 group/card hover:bg-neutral-900 transition-all relative">
                                            <div className="w-10 h-10 rounded-md bg-neutral-950 border border-slate-800 flex items-center justify-center text-slate-600 group-hover/card:border-transporter-primary/40 transition-all">
                                                <User size={18} />
                                            </div>
                                            <div className="flex-1 overflow-hidden">
                                                <Link to={`/school-admin/profile/${as.studentId?._id}`} className="block">
                                                    <p className="text-xs font-black text-slate-100 uppercase italic tracking-tighter truncate hover:text-transporter-primary transition-colors cursor-pointer">
                                                        {as.studentId?.firstName} {as.studentId?.lastName}
                                                    </p>
                                                </Link>
                                                <div className="flex items-center gap-2 mt-2">
                                                    <MapPin size={10} className="text-transporter-primary opacity-60 flex-shrink-0" />
                                                    <p className="text-[9px] font-black text-slate-500 uppercase italic truncate">{as.pickupStop}</p>
                                                    {as.seatNumber && <span className="ml-auto text-[8px] font-black bg-neutral-900 border border-transporter-primary/20 px-2 py-0.5 rounded text-transporter-primary">SEAT {as.seatNumber}</span>}
                                                </div>
                                            </div>
                                            <button 
                                                onClick={() => handleUnassign(route._id, as.studentId._id)}
                                                className="absolute top-2 right-2 p-1.5 text-slate-700 hover:text-red-500 opacity-0 group-hover/card:opacity-100 transition-all bg-neutral-950 border border-slate-800 rounded-md"
                                            >
                                                <X size={12} />
                                            </button>
                                        </div>
                                    ))}
                                    {(!route.assignedStudents || route.assignedStudents.length === 0) && (
                                        <div className="lg:col-span-3 py-10 text-center opacity-40 italic font-black uppercase text-[10px] tracking-widest text-slate-600">No students assigned to this route.</div>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 font-outfit">
                    <AnimatePresence mode="popLayout">
                        {applicants.map((a) => (
                            <motion.div 
                                layout
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
                                key={a._id} 
                                className="bg-neutral-900 border border-slate-800/60 rounded-md p-6 relative group shadow-2xl overflow-hidden"
                            >
                                <div className="absolute top-0 left-0 w-1 h-full bg-transporter-primary"></div>
                                <div className="flex items-start justify-between mb-6">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 rounded bg-neutral-950 border border-slate-800 flex items-center justify-center text-transporter-primary">
                                            <User size={24} />
                                        </div>
                                        <div>
                                            <Link to={`/school-admin/profile/${a._id}`} className="block">
                                                <h4 className="text-sm font-black text-slate-100 uppercase italic tracking-tighter leading-none hover:text-transporter-primary transition-colors cursor-pointer">{a.firstName} {a.lastName}</h4>
                                            </Link>
                                            <p className="text-[10px] font-black text-slate-500 uppercase italic tracking-widest mt-2 bg-slate-950 px-2 py-0.5 rounded border border-slate-800/60 inline-block">{a.standard?.name || 'GEN-X'} // {a.classSection?.name || 'ALPHA'}</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-[9px] font-black text-transporter-primary uppercase italic tracking-tighter bg-transporter-primary/10 px-3 py-1 rounded border border-transporter-primary/20">Pending Approval</p>
                                        <p className="text-[8px] font-bold text-slate-600 uppercase italic mt-1.5">{new Date(a.updatedAt).toLocaleDateString()}</p>
                                    </div>
                                </div>

                                <div className="p-4 bg-neutral-950/40 border border-slate-800/40 rounded italic mb-6">
                                     <p className="text-[10px] font-medium text-slate-400 leading-relaxed uppercase tracking-tight">Student has requested transport services. Review for approval.</p>
                                </div>

                                <div className="grid grid-cols-2 gap-3">
                                    <button 
                                        onClick={() => {
                                            setFormData({...formData, studentId: a._id});
                                            setIsAddOpen(true);
                                        }}
                                        className="py-3 bg-emerald-600/10 border border-emerald-600/30 text-emerald-500 text-[10px] font-black uppercase italic tracking-widest rounded hover:bg-emerald-600 hover:text-white transition-all flex items-center justify-center gap-2"
                                    >
                                        <CheckCircle size={14} /> Approve & Assign
                                    </button>
                                    <button 
                                        onClick={async () => {
                                            if(await window.confirm('Reject this inquiry? This will decline the request.')) {
                                                dispatch(rejectApplicantSlice(a._id));
                                            }
                                        }}
                                        className="py-3 bg-rose-600/10 border border-rose-600/30 text-rose-500 text-[10px] font-black uppercase italic tracking-widest rounded hover:bg-rose-600 hover:text-white transition-all flex items-center justify-center gap-2"
                                    >
                                        <XCircle size={14} /> Reject Request
                                    </button>
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                    {applicants.length === 0 && (
                        <div className="col-span-full py-20 bg-neutral-900 border border-slate-800 border-dashed rounded-md text-center opacity-40">
                             <Inbox size={48} className="mx-auto mb-4 text-slate-500 opacity-20" />
                             <p className="text-[11px] font-black italic uppercase tracking-[0.3em] text-slate-400">No pending requests found.</p>
                        </div>
                    )}
                </div>
            )}

            <AnimatePresence>
                {isAddOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-6 sm:p-0">
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsAddOpen(false)} className="absolute inset-0 bg-neutral-950/80 backdrop-blur-md"></motion.div>
                        <motion.div initial={{ scale: 0.9, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.9, opacity: 0, y: 20 }} className="bg-neutral-900 w-full max-w-lg rounded-md border border-slate-800 shadow-2xl relative z-10 overflow-hidden font-outfit">
                            <form onSubmit={handleAssign} className="space-y-6 p-10">
                                <h3 className="text-xl font-black italic uppercase tracking-tighter text-slate-100 mb-8 pb-4 border-b border-slate-800/60 leading-none">Assign to Route</h3>

                                <div className="space-y-5">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 italic ml-1 leading-none">Select Student</label>
                                        <div className="relative group/search">
                                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-700 group-focus-within/search:text-transporter-primary transition-colors" size={14} />
                                            <input
                                                type="text"
                                                placeholder="Search Student..."
                                                value={studentSearch}
                                                onChange={(e) => setStudentSearch(e.target.value)}
                                                className="w-full bg-neutral-950/50 border border-slate-800 h-10 pl-11 pr-6 rounded-md text-[9px] font-black uppercase tracking-widest text-white outline-none focus:border-transporter-primary/50 placeholder:text-slate-800 italic transition-all mb-2"
                                            />
                                        </div>
                                        <select
                                            required
                                            value={formData.studentId}
                                            onChange={(e) => setFormData({ ...formData, studentId: e.target.value })}
                                            className="w-full bg-neutral-950 border border-slate-800/60 rounded-md py-3 px-4 text-[11px] font-black uppercase italic text-slate-300 focus:outline-none focus:border-transporter-primary/50 appearance-none h-12"
                                        >
                                            <option value="">Select Student...</option>
                                            {filteredStudents.map(s => <option key={s._id} value={s._id}>{s.firstName} {s.lastName} ({s.admissionNumber || 'UNREGISTERED'})</option>)}
                                        </select>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 italic ml-1">Transport Route</label>
                                        <select
                                            required
                                            value={formData.routeId}
                                            onChange={(e) => {
                                                setFormData({ ...formData, routeId: e.target.value, pickupStop: '', dropoffStop: '' });
                                            }}
                                            className="w-full bg-neutral-950 border border-slate-800/60 rounded-md py-3 px-4 text-[11px] font-black uppercase italic text-slate-300 focus:outline-none focus:border-transporter-primary/50 appearance-none"
                                        >
                                            <option value="">Select Route...</option>
                                            {routes.map(r => <option key={r._id} value={r._id}>{r.name}</option>)}
                                        </select>
                                    </div>

                                    {formData.routeId && (
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 italic ml-1">Pickup Stop</label>
                                                <select
                                                    required
                                                    value={formData.pickupStop}
                                                    onChange={(e) => setFormData({ ...formData, pickupStop: e.target.value })}
                                                    className="w-full bg-neutral-950 border border-slate-800/60 rounded-md py-3 px-4 text-[11px] font-black uppercase italic text-slate-300 focus:outline-none appearance-none"
                                                >
                                                    <option value="">Select Stop...</option>
                                                    {routes.find(r => r._id === formData.routeId)?.stops.map(s => <option key={s.name} value={s.name}>{s.name}</option>)}
                                                </select>
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 italic ml-1">Drop Stop</label>
                                                <select
                                                    required
                                                    value={formData.dropoffStop}
                                                    onChange={(e) => setFormData({ ...formData, dropoffStop: e.target.value })}
                                                    className="w-full bg-neutral-950 border border-slate-800/60 rounded-md py-3 px-4 text-[11px] font-black uppercase italic text-slate-300 focus:outline-none appearance-none"
                                                >
                                                    <option value="">Select Stop...</option>
                                                    {routes.find(r => r._id === formData.routeId)?.stops.map(s => <option key={s.name} value={s.name}>{s.name}</option>)}
                                                </select>
                                            </div>
                                            <div className="space-y-2 col-span-2">
                                                <label className="text-[10px] font-black uppercase tracking-widest text-transporter-primary italic ml-1">Seat Number</label>
                                                <input
                                                    type="number"
                                                    value={formData.seatNumber}
                                                    onChange={(e) => setFormData({ ...formData, seatNumber: e.target.value })}
                                                    placeholder="Enter Seat Number (Optional)"
                                                    className="w-full bg-neutral-950 border border-transporter-primary/20 rounded-md py-3 px-4 text-[11px] font-black uppercase italic text-slate-300 focus:outline-none focus:border-transporter-primary"
                                                />
                                                {formData.routeId && routes.find(r => r._id === formData.routeId)?.assignedStudents?.length > 0 && (
                                                    <div className="flex flex-wrap gap-1 mt-2 px-1">
                                                        <span className="text-[8px] font-black text-slate-600 uppercase italic mr-1">Taken:</span>
                                                        {routes.find(r => r._id === formData.routeId).assignedStudents
                                                            .filter(s => s.seatNumber)
                                                            .map((s, idx) => (
                                                                <span key={idx} className="text-[8px] font-black bg-rose-500/10 text-rose-500 border border-rose-500/20 px-1.5 py-0.5 rounded">#{s.seatNumber}</span>
                                                            ))}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </div>

                                <div className="flex gap-4 pt-4">
                                    <button type="button" onClick={() => setIsAddOpen(false)} className="flex-1 px-6 py-4 border border-slate-800 text-[10px] font-black uppercase tracking-widest italic text-slate-500 hover:bg-slate-800 transition-all rounded-md leading-none h-[42px]">Cancel</button>
                                    <button type="submit" className="flex-1 px-6 py-4 bg-transporter-primary text-[10px] font-black uppercase tracking-widest italic text-white rounded-md hover:bg-transporter-primary/80 transition-all leading-none disabled:opacity-50 h-[42px]">
                                        {loading ? 'Processing...' : 'Assign'}
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}

                {isBulkOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-6 sm:p-0">
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsBulkOpen(false)} className="absolute inset-0 bg-neutral-950/80 backdrop-blur-md"></motion.div>
                        <motion.div initial={{ scale: 0.9, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.9, opacity: 0, y: 20 }} className="bg-neutral-900 w-full max-w-4xl rounded-md border border-slate-800 shadow-2xl relative z-10 overflow-hidden font-outfit max-h-[90vh] flex flex-col">
                            <div className="p-10 border-b border-slate-800/60 bg-neutral-950/40">
                                <h3 className="text-xl font-black italic uppercase tracking-tighter text-slate-100 leading-none">Assign Many Students</h3>
                            </div>

                            <div className="overflow-y-auto p-10 flex-1 custom-scrollbar">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                                    <div className="space-y-6">
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 italic ml-1">Select Route</label>
                                            <select
                                                required
                                                value={bulkData.routeId}
                                                onChange={(e) => setBulkData({ ...bulkData, routeId: e.target.value, pickupStop: '', dropoffStop: '' })}
                                                className="w-full bg-neutral-950 border border-slate-800/60 rounded-md py-3 px-4 text-[11px] font-black uppercase italic text-slate-300 focus:outline-none appearance-none"
                                            >
                                                <option value="">Select Route...</option>
                                                {routes.map(r => <option key={r._id} value={r._id}>{r.name}</option>)}
                                            </select>
                                        </div>

                                        {bulkData.routeId && (
                                            <div className="grid grid-cols-2 gap-4">
                                                <div className="space-y-2">
                                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 italic ml-1">Pickup Stop</label>
                                                    <select
                                                        required
                                                        value={bulkData.pickupStop}
                                                        onChange={(e) => setBulkData({ ...bulkData, pickupStop: e.target.value })}
                                                        className="w-full bg-neutral-950 border border-slate-800/60 rounded-md py-3 px-4 text-[11px] font-black uppercase italic text-slate-300 focus:outline-none appearance-none"
                                                    >
                                                        <option value="">Select Stop...</option>
                                                        {routes.find(r => r._id === bulkData.routeId)?.stops.map(s => <option key={s.name} value={s.name}>{s.name}</option>)}
                                                    </select>
                                                </div>
                                                <div className="space-y-2">
                                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 italic ml-1">Drop Stop</label>
                                                    <select
                                                        required
                                                        value={bulkData.dropoffStop}
                                                        onChange={(e) => setBulkData({ ...bulkData, dropoffStop: e.target.value })}
                                                        className="w-full bg-neutral-950 border border-slate-800/60 rounded-md py-3 px-4 text-[11px] font-black uppercase italic text-slate-300 focus:outline-none appearance-none"
                                                    >
                                                        <option value="">Select Stop...</option>
                                                        {routes.find(r => r._id === bulkData.routeId)?.stops.map(s => <option key={s.name} value={s.name}>{s.name}</option>)}
                                                    </select>
                                                </div>
                                            </div>
                                        )}

                                        <div className="pt-6 border-t border-slate-800/40">
                                            <p className="text-[9px] font-black text-slate-600 uppercase italic mb-4">Selected Students: {selectedStudents.length}</p>
                                            <div className="flex flex-wrap gap-2">
                                                {selectedStudents.map(id => {
                                                    const s = studentList.find(std => std._id === id);
                                                    return (
                                                        <div key={id} onClick={() => toggleStudentSelection(id)} className="px-3 py-1.5 bg-transporter-primary/10 border border-transporter-primary/30 rounded text-[9px] font-black text-transporter-primary uppercase italic cursor-pointer hover:bg-transporter-primary/20">
                                                            {s?.firstName} {s?.lastName}
                                                        </div>
                                                    )
                                                })}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 italic ml-1">Select Students</label>
                                        <div className="bg-neutral-950 border border-slate-800 rounded-md divide-y divide-slate-800/40 max-h-[300px] overflow-y-auto custom-scrollbar">
                                            {studentList.map(s => (
                                                <div key={s._id} onClick={() => toggleStudentSelection(s._id)} className={`p-3 flex items-center justify-between cursor-pointer transition-all hover:bg-neutral-900 ${selectedStudents.includes(s._id) ? 'bg-transporter-primary/10' : ''}`}>
                                                    <span className={`text-[10px] font-black uppercase italic tracking-tighter ${selectedStudents.includes(s._id) ? 'text-transporter-primary' : 'text-slate-400'}`}>{s.firstName} {s.lastName}</span>
                                                    {selectedStudents.includes(s._id) && <Plus size={10} className="text-transporter-primary bg-transporter-primary/10 rounded-full rotate-45" />}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="p-10 border-t border-slate-800/60 bg-neutral-950/40 flex gap-4">
                                <button type="button" onClick={() => setIsBulkOpen(false)} className="flex-1 px-6 py-4 border border-slate-800 text-[10px] font-black uppercase tracking-widest italic text-slate-500 hover:bg-slate-800 transition-all rounded-md leading-none h-[42px]">Cancel</button>
                                <button
                                    onClick={handleBulkAssign}
                                    disabled={loading || !bulkData.routeId || !bulkData.pickupStop || selectedStudents.length === 0}
                                    className="flex-1 px-6 py-4 bg-transporter-primary text-[10px] font-black uppercase tracking-widest italic text-white rounded-md hover:bg-transporter-primary/90 transition-all shadow-xl shadow-transporter-primary/20 leading-none disabled:opacity-50 h-[42px]"
                                >
                                    {loading ? 'Processing...' : 'Assign Students'}
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </motion.div>
    );
};

export default StudentAssignment;
