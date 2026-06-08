import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchAssignedClasses, fetchMyMessages, sendMessage, retractAnnouncement, updateAnnouncement } from '../../redux/slice/teacher.slice';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Plus,
    Users,
    Send,
    Activity,
    Calendar,
    Pin,
    Trash2,
    Edit2
} from 'lucide-react';
import toast from 'react-hot-toast';
import PortalModal from '../../components/PortalModal';

const ClassNoticeboard = () => {
    const dispatch = useDispatch();
    const { classes, messages, loading } = useSelector(state => state.teacher);
    const { user } = useSelector(state => state.auth);
    const { activeAcademicYear } = useSelector(state => state.academicYear);

    const [selectedClass, setSelectedClass] = useState('');
    const [showPostModal, setShowPostModal] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false);
    const [editingNoticeId, setEditingNoticeId] = useState(null);
    const [targetClass, setTargetClass] = useState('');
    const [noticeInput, setNoticeInput] = useState({ subject: '', content: '' });
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [deletingNoticeId, setDeletingNoticeId] = useState(null);

    useEffect(() => {
        dispatch(fetchAssignedClasses());
        dispatch(fetchMyMessages());
    }, [dispatch, activeAcademicYear]);

    // Keep the targetClass synced or defaulted when opening create notice
    const handleOpenCreateModal = () => {
        setIsEditMode(false);
        setEditingNoticeId(null);
        setNoticeInput({ subject: '', content: '' });
        setTargetClass(selectedClass || 'all');
        setShowPostModal(true);
    };

    const handleOpenEditModal = (notice) => {
        setIsEditMode(true);
        setEditingNoticeId(notice._id);
        setNoticeInput({ subject: notice.subject, content: notice.content });
        setTargetClass(notice.classSection?._id || notice.classSection || 'all');
        setShowPostModal(true);
    };

    const classNotices = messages.filter(m =>
        m.type === 'Announcement' &&
        (!selectedClass || m.classSection === selectedClass || m.classSection?._id === selectedClass)
    );

    const handlePostNotice = async (e) => {
        e.preventDefault();
        if (!targetClass || !noticeInput.subject || !noticeInput.content) {
            toast.error("Please fill in all fields and select a target class");
            return;
        }

        try {
            if (isEditMode) {
                await dispatch(updateAnnouncement({
                    id: editingNoticeId,
                    subject: noticeInput.subject,
                    content: noticeInput.content,
                    classSection: targetClass === 'all' ? null : targetClass
                })).unwrap();
            } else {
                await dispatch(sendMessage({
                    type: 'Announcement',
                    classSection: targetClass === 'all' ? null : targetClass,
                    targetRole: 'Student', // Usually for students in that class
                    ...noticeInput
                })).unwrap();
            }
            setShowPostModal(false);
            setNoticeInput({ subject: '', content: '' });
        } catch (err) {
            toast.error(err || "Failed to save notice");
        }
    };

    const handleDeleteClick = (id) => {
        setDeletingNoticeId(id);
        setShowDeleteModal(true);
    };

    const handleConfirmDelete = async () => {
        if (!deletingNoticeId) return;
        try {
            await dispatch(retractAnnouncement(deletingNoticeId)).unwrap();
            setShowDeleteModal(false);
            setDeletingNoticeId(null);
        } catch (err) {
            toast.error(err || "Failed to retract notice");
        }
    };

    return (
        <div className="space-y-12">
            <header className="flex flex-col md:flex-row md:items-end justify-between gap-8 bg-slate-900/40 p-10 rounded-md border border-slate-800/60 shadow-2xl backdrop-blur-3xl">
                <div className="space-y-4">
                    <div className="flex items-center gap-3">
                        <div className="h-[2px] w-12 bg-teacher-primary rounded-md"></div>
                        <span className="text-[10px] font-black text-teacher-primary uppercase tracking-[0.45em] italic">Notice Board</span>
                    </div>
                    <h1 className="text-4xl text-left font-black text-white italic uppercase tracking-tighter leading-none font-outfit">Class Noticeboard</h1>
                    <p className="text-slate-500 font-bold text-xs uppercase tracking-widest italic leading-relaxed">Class-specific notices and academic announcements.</p>
                </div>

                <div className="flex flex-wrap gap-4">
                    <div className="relative group min-w-[200px]">
                        <Users size={16} className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-500" />
                        <select
                            value={selectedClass}
                            onChange={(e) => setSelectedClass(e.target.value)}
                            className="w-full bg-slate-950 border border-slate-800 h-14 pl-14 pr-8 rounded-md text-[11px] font-black uppercase tracking-widest outline-none appearance-none focus:border-teacher-primary/40 transition-all text-white shadow-xl italic"
                        >
                            <option value="">All Classes</option>
                            {classes.map(c => (
                                <option key={c._id} value={c._id}>Std {c.standardId?.level || c.gradeLevel} - {c.sectionLabel}</option>
                            ))}
                        </select>
                    </div>
                    <button
                        onClick={handleOpenCreateModal}
                        className="h-14 bg-teacher-primary hover:bg-teacher-primary text-white px-8 rounded-md font-black text-[11px] uppercase tracking-[0.2em] transition-all shadow-[0_0_30px_rgba(168,85,247,0.3)] flex items-center gap-3 italic"
                    >
                        <Plus size={18} /> Add New Notice
                    </button>
                </div>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <AnimatePresence mode="popLayout">
                    {classNotices.map((notice, idx) => {
                        const isOwn = user && (user.role === 'Teacher' || (notice.sender && (
                            (notice.sender._id || notice.sender).toString() === (user._id || user.id).toString()
                        )));
                        return (
                            <motion.div
                                key={notice._id}
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: idx * 0.05 }}
                                className="bg-slate-900/40 border border-slate-800/60 p-8 rounded-md backdrop-blur-3xl shadow-2xl relative overflow-hidden group hover:border-teacher-primary/20 transition-all"
                            >
                                <div className="absolute top-0 right-0 w-24 h-24 bg-teacher-primary/5 rounded-full blur-2xl group-hover:bg-teacher-primary/10 transition-all pointer-events-none"></div>
                                <div className="flex items-center justify-between mb-8">
                                    <div className="p-3 bg-teacher-primary/10 text-teacher-primary rounded-md border border-teacher-primary/20 shadow-xl">
                                        <Pin size={18} />
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <span className="text-[9px] font-black text-slate-600 uppercase tracking-widest flex items-center gap-2 italic">
                                            <Calendar size={12} /> {new Date(notice.createdAt).toLocaleDateString('en-IN')}
                                        </span>
                                        {isOwn && (
                                            <div className="flex items-center gap-2">
                                                <button 
                                                    onClick={() => handleOpenEditModal(notice)}
                                                    className="p-2 bg-slate-800 hover:bg-teacher-primary text-slate-400 hover:text-white rounded-md border border-slate-700/60 transition-all hover:scale-105"
                                                    title="Edit Notice"
                                                >
                                                    <Edit2 size={12} />
                                                </button>
                                                <button 
                                                    onClick={() => handleDeleteClick(notice._id)}
                                                    className="p-2 bg-slate-800 hover:bg-luxury-rose text-slate-400 hover:text-white rounded-md border border-slate-700/60 transition-all hover:scale-105"
                                                    title="Delete Notice"
                                                >
                                                    <Trash2 size={12} />
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                                <h3 className="text-xl font-black text-white italic tracking-tighter leading-none mb-4 group-hover:text-teacher-primary transition-colors uppercase">{notice.subject}</h3>
                                <p className="text-slate-400 text-sm font-bold leading-relaxed mb-10 h-[60px] overflow-hidden tracking-tight uppercase">{notice.content}</p>

                                <div className="pt-6 border-t border-white/5 flex items-center justify-between text-[8px] font-black uppercase tracking-widest text-slate-700">
                                    <span>Target: Students</span>
                                    <span className="text-teacher-primary/40 italic">Notice Type: Announcement</span>
                                </div>
                            </motion.div>
                        );
                    })}
                </AnimatePresence>

                {classNotices.length === 0 && (
                    <div className="col-span-full py-40 text-center opacity-30 italic">
                        <Activity className="w-16 h-16 mx-auto mb-8 animate-pulse text-slate-500" />
                        <h3 className="text-xl font-black text-slate-500 uppercase tracking-[0.4em]">No Notices Found</h3>
                    </div>
                )}
            </div>

            <PortalModal isOpen={showPostModal} onClose={() => setShowPostModal(false)} maxWidth="max-w-2xl">
                <div className="p-12">
                    <header className="mb-10">
                        <h2 className="text-2xl font-black text-white italic uppercase tracking-tighter font-outfit mb-2">{isEditMode ? 'Edit Notice' : 'Create New Notice'}</h2>
                        <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest italic">{isEditMode ? 'Modify notice details below...' : 'Provide notice details below...'}</p>
                    </header>
                    <form onSubmit={handlePostNotice} className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest italic ml-2">Target Class Section</label>
                            <div className="relative group">
                                <Users size={16} className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-500" />
                                <select value={targetClass} onChange={(e) => setTargetClass(e.target.value)} className="w-full bg-slate-950 border border-slate-800 h-14 pl-14 pr-8 rounded-md text-[11px] font-black uppercase tracking-widest outline-none appearance-none focus:border-teacher-primary transition-all text-white shadow-xl italic" required>
                                    <option value="all">All Classes</option>
                                    {classes.map(c => (<option key={c._id} value={c._id}>Std {c.standardId?.level || c.gradeLevel} - {c.sectionLabel}</option>))}
                                </select>
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest italic ml-2">Notice Subject</label>
                            <input type="text" placeholder="Enter subject here..." value={noticeInput.subject} onChange={(e) => setNoticeInput({ ...noticeInput, subject: e.target.value })} className="w-full bg-slate-950 border border-slate-800 h-14 px-8 rounded-md text-white text-sm font-bold outline-none focus:border-teacher-primary transition-all italic uppercase" />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest italic ml-2">Notice Message</label>
                            <textarea placeholder="Write your message here..." value={noticeInput.content} onChange={(e) => setNoticeInput({ ...noticeInput, content: e.target.value })} className="w-full bg-slate-950 border border-slate-800 p-8 rounded-md text-white text-sm font-bold outline-none focus:border-teacher-primary transition-all italic resize-none h-[180px] uppercase" />
                        </div>
                        <button type="submit" className="w-full h-16 bg-teacher-primary text-white rounded-md font-black text-[11px] uppercase tracking-[0.4em] transition-all flex items-center justify-center gap-4 shadow-xl italic">
                            <Send size={20} /> {isEditMode ? 'Save Notice' : 'Post Notice'}
                        </button>
                    </form>
                </div>
            </PortalModal>

            <PortalModal isOpen={showDeleteModal} onClose={() => setShowDeleteModal(false)} maxWidth="max-w-md">
                <div className="p-12 text-center">
                    <Trash2 size={40} className="mx-auto text-rose-500 mb-4 animate-bounce" />
                    <h2 className="text-2xl font-black text-white italic uppercase tracking-tighter font-outfit mb-2">Delete Notice?</h2>
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest italic leading-relaxed mb-10">Are you sure you want to retract this announcement? This action cannot be undone.</p>
                    <div className="flex gap-4">
                        <button type="button" onClick={() => setShowDeleteModal(false)} className="flex-1 h-14 bg-slate-850 hover:bg-slate-800 text-white rounded-md font-black text-[11px] uppercase tracking-[0.2em] transition-all italic border border-slate-700/50">Cancel</button>
                        <button type="button" onClick={handleConfirmDelete} className="flex-1 h-14 bg-luxury-rose hover:bg-rose-600 text-white rounded-md font-black text-[11px] uppercase tracking-[0.2em] transition-all shadow-[0_0_30px_rgba(244,63,94,0.3)] italic">Delete</button>
                    </div>
                </div>
            </PortalModal>
        </div>
    );
};

export default ClassNoticeboard;
