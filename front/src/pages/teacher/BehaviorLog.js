import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchAssignedClasses, fetchClassStudents, logBehavior, fetchBehaviorLogs, updateBehavior, deleteBehavior } from '../../redux/slice/teacher.slice';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, AlertTriangle, CheckCircle2, Search, User, Plus, X, MessageSquare, Calendar, ChevronRight } from 'lucide-react';
import toast from 'react-hot-toast';

const BehaviorLog = () => {
    const dispatch = useDispatch();
    const { classes, students, behaviorLogs, loading } = useSelector((state) => state.teacher);
    const { activeAcademicYearId } = useSelector((state) => state.academicYear || {});
    const [selectedClass, setSelectedClass] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedStudent, setSelectedStudent] = useState(null);
    const [editMode, setEditMode] = useState(false);
    const [editingLogId, setEditingLogId] = useState(null);
    const [formData, setFormData] = useState({
        type: 'Positive',
        category: 'Participation',
        description: '',
        actionTaken: ''
    });

    useEffect(() => {
        dispatch(fetchAssignedClasses());
        dispatch(fetchBehaviorLogs());
        setSelectedClass('');
    }, [dispatch, activeAcademicYearId]);

    useEffect(() => {
        if (selectedClass) {
            dispatch(fetchClassStudents(selectedClass));
        }
    }, [selectedClass, dispatch]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (editMode) {
            const res = await dispatch(updateBehavior({ id: editingLogId, data: formData }));
            if (res.meta.requestStatus === 'fulfilled') {
                closeModal();
                dispatch(fetchBehaviorLogs());
            }
        } else {
            const data = { ...formData, studentId: selectedStudent._id };
            const res = await dispatch(logBehavior(data));
            if (res.meta.requestStatus === 'fulfilled') {
                closeModal();
                dispatch(fetchBehaviorLogs());
            }
        }
    };

    const handleDelete = async (id) => {
        if (await window.confirm('Are you sure you want to delete this behavior record?')) {
            await dispatch(deleteBehavior(id));
        }
    };

    const openEditModal = (log) => {
        setEditMode(true);
        setEditingLogId(log._id);
        setSelectedStudent(log.studentId);
        setFormData({
            type: log.type,
            category: log.category,
            description: log.description,
            actionTaken: log.actionTaken || ''
        });
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setEditMode(false);
        setEditingLogId(null);
        setSelectedStudent(null);
        setFormData({ type: 'Positive', category: 'Participation', description: '', actionTaken: '' });
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-700">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-slate-900/40 p-8 rounded-md border border-slate-800/60 backdrop-blur-xl group">
                <div>
                    <div className="flex items-center gap-3 mb-2">
                        <div className="w-12 h-12 rounded-md bg-brand-primary/10 flex items-center justify-center border border-brand-primary/20 group-hover:scale-110 transition-transform">
                            <Shield className="text-brand-primary" size={24} />
                        </div>
                        <h1 className="text-3xl font-black uppercase tracking-tight font-outfit">Behavior <span className="text-brand-primary">Log</span></h1>
                    </div>
                    <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em] ml-1">Monitor & Document Student Behavior</p>
                </div>
                <div className="flex items-center gap-4">
                    <select 
                        className="bg-slate-800 border border-slate-700 rounded-md px-6 py-4 text-[10px] font-black uppercase tracking-widest outline-none focus:border-brand-primary text-white"
                        value={selectedClass}
                        onChange={(e) => setSelectedClass(e.target.value)}
                    >
                        <option value="">SELECT CLASS</option>
                        {classes?.map(c => (
                            <option key={c._id} value={c._id}>
                                Grade {c.standardId?.level || c.gradeLevel || 'N/A'} - {c.sectionLabel}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Students List */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-slate-900/40 border border-slate-800/60 rounded-md overflow-hidden backdrop-blur-xl">
                        <div className="p-6 border-b border-slate-800/60 flex items-center justify-between">
                            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Student List ({students?.length || 0})</span>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="bg-slate-800/40">
                                        <th className="px-6 py-4 text-left text-[9px] font-black text-slate-500 uppercase tracking-widest">Profile</th>
                                        <th className="px-6 py-4 text-left text-[9px] font-black text-slate-500 uppercase tracking-widest">Student ID</th>
                                        <th className="px-6 py-4 text-right text-[9px] font-black text-slate-500 uppercase tracking-widest">Action</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-800/40">
                                    {!selectedClass ? (
                                        <tr>
                                            <td colSpan="3" className="px-6 py-12 text-center text-[10px] font-black uppercase tracking-widest text-slate-600 italic">Select a class to view students</td>
                                        </tr>
                                    ) : students?.map((s) => (
                                        <tr key={s._id} className="hover:bg-slate-800/20 transition-colors group">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-10 h-10 rounded-md bg-slate-800 border border-slate-700/50 flex items-center justify-center text-brand-primary font-black uppercase">
                                                        {s.photo ? <img src={s.photo} className="w-full h-full object-cover rounded-md" /> : s.firstName[0]}
                                                    </div>
                                                    <div>
                                                        <p className="text-[11px] font-black uppercase tracking-wider">{s.firstName} {s.lastName}</p>
                                                        <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mt-0.5">{s.gender}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 group-hover:text-brand-primary transition-colors">#{s._id.toString().slice(-6)}</span>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <button 
                                                    onClick={() => { setSelectedStudent(s); setEditMode(false); setIsModalOpen(true); }}
                                                    className="px-4 py-2 bg-slate-800 hover:bg-brand-primary text-[9px] font-black uppercase tracking-widest rounded-md border border-slate-700 hover:border-brand-primary transition-all text-slate-400 hover:text-white"
                                                >
                                                    Log Behavior
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                {/* Recent Logs Sidebar */}
                <div className="space-y-6 max-h-[680px] overflow-y-auto pr-2">
                    <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 mb-4 px-1 sticky top-0 bg-[#020617] py-3 z-10 border-b border-slate-900/60">Recent Behavior Logs</h2>
                    {behaviorLogs?.slice(0, 10).map((log, i) => (
                        <motion.div 
                            key={log._id}
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: i * 0.1 }}
                            className="bg-slate-900 border border-slate-800 rounded-md p-6 group hover:border-brand-primary/30 transition-all border-l-4 relative overflow-hidden"
                            style={{ borderLeftColor: log.type === 'Positive' ? '#10b981' : log.type === 'Negative' ? '#ef4444' : '#f59e0b' }}
                        >
                            <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-all">
                                <button onClick={() => openEditModal(log)} className="p-1.5 bg-slate-800 hover:bg-brand-primary text-slate-400 hover:text-white rounded-md transition-all">
                                    <MessageSquare size={12} />
                                </button>
                                <button onClick={() => handleDelete(log._id)} className="p-1.5 bg-slate-800 hover:bg-red-500 text-slate-400 hover:text-white rounded-md transition-all">
                                    <X size={12} />
                                </button>
                            </div>

                            <div className="flex justify-between items-start mb-4 pr-12">
                                <span className="text-[9px] font-black uppercase tracking-widest text-brand-primary">{log.studentId?.firstName} {log.studentId?.lastName}</span>
                                <span className="text-[8px] font-bold text-slate-500 uppercase">{new Date(log.date).toLocaleDateString()}</span>
                            </div>
                            <p className="text-[10px] font-black uppercase tracking-wider mb-2">{log.category}</p>
                            <p className="text-[10px] font-medium text-slate-500 mb-4 line-clamp-3 italic">"{log.description}"</p>
                            {log.actionTaken && (
                                <div className="mt-4 pt-4 border-t border-slate-800 flex items-center justify-between">
                                    <span className="text-[8px] font-black uppercase tracking-widest text-slate-400">Response:</span>
                                    <span className="text-[8px] font-black uppercase tracking-widest text-emerald-400">{log.actionTaken}</span>
                                </div>
                            )}
                        </motion.div>
                    ))}
                    {behaviorLogs?.length === 0 && (
                        <div className="py-12 border-2 border-dashed border-slate-800 rounded-md text-center">
                            <Shield size={24} className="mx-auto text-slate-700 mb-3" />
                            <p className="text-[10px] font-black uppercase tracking-widest text-slate-700">No logs found</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Modal */}
            <AnimatePresence>
                {isModalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-slate-950/90 backdrop-blur-xl" onClick={closeModal} />
                        <motion.div initial={{ scale: 0.9, y: 30 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 30 }} className="bg-slate-900 border border-slate-800 w-full max-w-lg rounded-md overflow-hidden relative shadow-2xl z-10">
                            <div className="p-8 border-b border-slate-800 flex justify-between items-center bg-slate-900/50 backdrop-blur-xl">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-md bg-brand-primary/10 flex items-center justify-center border border-brand-primary/20">
                                        <Shield className="text-brand-primary" size={18} />
                                    </div>
                                    <div>
                                        <h2 className="text-lg font-black uppercase font-outfit tracking-tight">{editMode ? 'Edit Behavior Log' : 'Add Behavior Log'}</h2>
                                        <p className="text-[8px] font-black uppercase tracking-widest text-slate-500">Student: {selectedStudent?.firstName} {selectedStudent?.lastName}</p>
                                    </div>
                                </div>
                                <button onClick={closeModal} className="p-2 hover:bg-slate-800 rounded-md transition-colors text-slate-500 hover:text-white"><X size={18}/></button>
                            </div>

                            <form onSubmit={handleSubmit} className="p-8 space-y-6">
                                <div className="grid grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-[9px] font-black uppercase tracking-widest text-slate-500">Behavior Type</label>
                                        <div className="flex bg-slate-800 p-1 rounded-md border border-slate-700">
                                            {['Positive', 'Negative', 'Warning'].map(t => (
                                                <button 
                                                    key={t}
                                                    type="button"
                                                    onClick={() => setFormData({...formData, type: t})}
                                                    className={`flex-1 py-2 text-[8px] font-black uppercase tracking-widest rounded-md transition-all ${formData.type === t ? 'bg-brand-primary text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}
                                                >
                                                    {t}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[9px] font-black uppercase tracking-widest text-slate-500">Category</label>
                                        <select 
                                            required
                                            className="w-full bg-slate-800 border border-slate-700 rounded-md p-4 text-[10px] font-black uppercase tracking-widest outline-none focus:border-brand-primary text-white"
                                            value={formData.category}
                                            onChange={(e) => setFormData({...formData, category: e.target.value})}
                                        >
                                            <option value="Participation">PARTICIPATION</option>
                                            <option value="Disruption">DISRUPTION</option>
                                            <option value="Uniform">UNIFORM CODE</option>
                                            <option value="Homework">HOMEWORK STATUS</option>
                                            <option value="Leadership">LEADERSHIP</option>
                                            <option value="Tardiness">TARDINESS</option>
                                            <option value="Bullying">BULLYING/HARASSMENT</option>
                                            <option value="Academic Integrity">ACADEMIC INTEGRITY</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[9px] font-black uppercase tracking-widest text-slate-500">Behavior Description</label>
                                    <textarea 
                                        required
                                        rows={4}
                                        className="w-full bg-slate-800 border border-slate-700 rounded-md p-4 text-[10px] font-medium tracking-tight outline-none focus:border-brand-primary text-white placeholder-slate-600 italic"
                                        placeholder="Describe the student's behavior in detail..."
                                        value={formData.description}
                                        onChange={(e) => setFormData({...formData, description: e.target.value})}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[9px] font-black uppercase tracking-widest text-slate-500">Action Taken</label>
                                    <input 
                                        type="text" 
                                        className="w-full bg-slate-800 border border-slate-700 rounded-md p-4 text-[10px] font-black uppercase tracking-widest outline-none focus:border-brand-primary text-white placeholder-slate-600"
                                        placeholder="E.G. VERBAL WARNING, COUNSELING, REWARD..."
                                        value={formData.actionTaken}
                                        onChange={(e) => setFormData({...formData, actionTaken: e.target.value})}
                                    />
                                </div>

                                <button 
                                    type="submit"
                                    className="w-full bg-brand-primary hover:bg-brand-primary/90 text-white py-5 rounded-md font-black uppercase text-[10px] tracking-[0.2em] transition-all shadow-xl hover:-translate-y-1"
                                >
                                    {editMode ? 'UPDATE LOG' : 'SAVE LOG'}
                                </button>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default BehaviorLog;
