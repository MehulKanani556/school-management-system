import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchAssignedClasses } from '../../redux/slice/teacher.slice';
import axiosInstance from '../../utils/axiosInstance';
import { motion, AnimatePresence } from 'framer-motion';
import { HardDrive, Upload, Search, FileText, Video, Image as ImageIcon, File, Trash2, Download, Plus, X } from 'lucide-react';
import toast from 'react-hot-toast';
import Modal from '../../components/Modal';

const ResourceLocker = () => {
    const dispatch = useDispatch();
    const { classes } = useSelector(state => state.teacher);
    
    const [resources, setResources] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [showUploadModal, setShowUploadModal] = useState(false);
    
    const [uploadData, setUploadData] = useState({
        title: '',
        description: '',
        classSection: '',
        resourceType: 'Document'
    });
    const [uploadFile, setUploadFile] = useState(null);

    useEffect(() => {
        dispatch(fetchAssignedClasses());
        fetchResources();
    }, [dispatch]);

    const fetchResources = async () => {
        try {
            setLoading(true);
            const res = await axiosInstance.get('/teacher/resources');
            setResources(res.data);
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to fetch resources');
        } finally {
            setLoading(false);
        }
    };

    const handleUpload = async (e) => {
        e.preventDefault();
        if (!uploadData.title || !uploadFile) {
            return toast.error('Title and file are required');
        }

        const formData = new FormData();
        formData.append('file', uploadFile);
        formData.append('title', uploadData.title);
        formData.append('description', uploadData.description);
        formData.append('resourceType', uploadData.resourceType);
        if (uploadData.classSection) {
            formData.append('classSection', uploadData.classSection);
        }

        try {
            const res = await axiosInstance.post('/teacher/resources', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            toast.success(res.data.message);
            setShowUploadModal(false);
            setUploadData({ title: '', description: '', classSection: '', resourceType: 'Document' });
            setUploadFile(null);
            fetchResources();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Upload failed');
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Delete this resource permanently?')) return;
        try {
            const res = await axiosInstance.delete(`/teacher/resources/${id}`);
            toast.success(res.data.message);
            setResources(resources.filter(r => r._id !== id));
        } catch (error) {
            toast.error(error.response?.data?.message || 'Delete failed');
        }
    };

    const getIcon = (type) => {
        switch (type) {
            case 'PDF': return <FileText size={24} className="text-red-500" />;
            case 'Video': return <Video size={24} className="text-teacher-primary" />;
            case 'Image': return <ImageIcon size={24} className="text-purple-500" />;
            case 'Document': return <File size={24} className="text-emerald-500" />;
            default: return <HardDrive size={24} className="text-slate-400" />;
        }
    };

    const filteredResources = resources.filter(r =>
        r.title.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-8">
            <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 bg-slate-900/40 p-10 rounded-md border border-slate-800/60 shadow-2xl backdrop-blur-xl">
                <div className="space-y-2">
                    <div className="flex items-center gap-3 mb-2">
                        <span className="w-12 h-[2px] bg-brand-primary rounded-md"></span>
                        <span className="text-[10px] font-black uppercase tracking-[0.4em] text-brand-primary font-outfit">Digital Asset Matrix</span>
                    </div>
                    <h1 className="text-4xl font-black text-white italic uppercase tracking-tighter leading-none font-outfit">Resource Locker</h1>
                    <p className="text-slate-500 font-medium text-sm tracking-wide italic">Secure spatial cloud node for academic distributions.</p>
                </div>

                <div className="flex gap-4">
                    <div className="relative group min-w-[300px]">
                        <Search size={16} className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-500" />
                        <input 
                            type="text" 
                            placeholder="Query data nodes..." 
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full bg-slate-950 border border-slate-800 h-14 pl-14 pr-6 rounded-md text-[11px] font-black uppercase tracking-widest outline-none focus:border-brand-primary transition-all text-white shadow-xl italic"
                        />
                    </div>
                    <button 
                        onClick={() => setShowUploadModal(true)}
                        className="h-14 bg-brand-primary hover:bg-teacher-primary text-white px-8 rounded-md font-black text-[11px] uppercase tracking-widest transition-all flex items-center gap-3 shadow-[0_0_30px_rgba(59,130,246,0.2)] italic"
                    >
                        <Upload size={18} /> Upload Data
                    </button>
                </div>
            </header>

            {loading ? (
                <div className="text-center py-20 animate-pulse text-slate-500 font-black italic tracking-[0.3em] uppercase">Synchronizing Nodes...</div>
            ) : filteredResources.length === 0 ? (
                <div className="text-center py-40 border-2 border-dashed border-slate-800/50 rounded-md bg-slate-900/20">
                    <HardDrive size={60} className="mx-auto text-slate-600 mb-6 opacity-30" />
                    <h3 className="text-xl font-black text-slate-400 uppercase tracking-widest italic drop-shadow-lg">Vault is Empty</h3>
                    <p className="text-slate-500 text-sm mt-2 italic font-medium">Initiate uplink to inject resources into the local node.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    <AnimatePresence>
                        {filteredResources.map((res, idx) => (
                            <motion.div 
                                key={res._id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.9 }}
                                transition={{ delay: idx * 0.05 }}
                                className="bg-slate-900/60 border border-slate-800/80 p-6 rounded-md hover:border-brand-primary/40 transition-all group shadow-2xl relative overflow-hidden flex flex-col items-center justify-center min-h-[220px]"
                            >
                                <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-all">
                                    <a href={res.fileUrl} target="_blank" rel="noopener noreferrer" className="p-2 bg-slate-800/80 hover:bg-brand-primary text-slate-400 hover:text-white rounded-md transition-all">
                                        <Download size={14} />
                                    </a>
                                    <button onClick={() => handleDelete(res._id)} className="p-2 bg-slate-800/80 hover:bg-red-500 text-slate-400 hover:text-white rounded-md transition-all">
                                        <Trash2 size={14} />
                                    </button>
                                </div>
                                <div className="w-16 h-16 rounded-full bg-slate-950 border border-slate-800 flex items-center justify-center mb-6 shadow-xl group-hover:scale-110 transition-transform">
                                    {getIcon(res.resourceType)}
                                </div>
                                <h4 className="text-sm font-black text-white italic uppercase tracking-wider truncate w-full text-center">{res.title}</h4>
                                <p className="text-[10px] font-bold text-slate-500 mt-2 uppercase tracking-widest truncate w-full text-center">
                                    {res.classSection ? `Grade ${res.classSection.standardId?.level || res.classSection.gradeLevel || 'N/A'} - ${res.classSection.sectionLabel}` : 'Global Protocol'}
                                </p>
                                <p className="text-[9px] text-slate-600 mt-3">{new Date(res.uploadDate).toLocaleDateString()}</p>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>
            )}

            <Modal open={showUploadModal} onClose={() => setShowUploadModal(false)} title="Data Uplink Protocol">
                <form onSubmit={handleUpload} className="space-y-6 pt-4">
                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest italic ml-2">Data Title</label>
                        <input 
                            type="text" 
                            required
                            value={uploadData.title}
                            onChange={(e) => setUploadData({...uploadData, title: e.target.value})}
                            className="w-full bg-slate-950 border border-slate-800 h-12 px-6 rounded-md text-white font-bold text-sm outline-none focus:border-brand-primary transition-all italic tracking-wide"
                        />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest italic ml-2">File Format</label>
                            <select 
                                value={uploadData.resourceType}
                                onChange={(e) => setUploadData({...uploadData, resourceType: e.target.value})}
                                className="w-full bg-slate-950 border border-slate-800 h-12 px-6 rounded-md text-slate-300 font-black text-[11px] uppercase tracking-widest outline-none focus:border-brand-primary transition-all italic"
                            >
                                <option value="Document">Document</option>
                                <option value="PDF">PDF</option>
                                <option value="Video">Video</option>
                                <option value="Image">Image</option>
                                <option value="Other">Other</option>
                            </select>
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest italic ml-2">Target Cluster</label>
                            <select 
                                value={uploadData.classSection}
                                onChange={(e) => setUploadData({...uploadData, classSection: e.target.value})}
                                className="w-full bg-slate-950 border border-slate-800 h-12 px-6 rounded-md text-slate-300 font-black text-[11px] uppercase tracking-widest outline-none focus:border-brand-primary transition-all italic"
                            >
                                <option value="">Global Extranet</option>
                                {classes.map(c => (
                                    <option key={c._id} value={c._id}>Grade {c.standardId?.level || c.gradeLevel} - {c.sectionLabel}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest italic ml-2">Archival Binary</label>
                        <div className="relative overflow-hidden w-full bg-slate-950 border-2 border-dashed border-slate-800 rounded-md h-32 flex flex-col items-center justify-center group hover:border-brand-primary/50 transition-colors">
                            <input 
                                type="file" 
                                required
                                onChange={(e) => setUploadFile(e.target.files[0])}
                                className="absolute inset-0 opacity-0 cursor-pointer z-10"
                            />
                            {uploadFile ? (
                                <div className="text-center">
                                    <FileText size={24} className="mx-auto text-brand-primary mb-2" />
                                    <p className="text-xs font-black text-white italic truncate max-w-[200px]">{uploadFile.name}</p>
                                </div>
                            ) : (
                                <div className="text-center text-slate-500 group-hover:text-brand-primary transition-colors">
                                    <Upload size={24} className="mx-auto mb-2" />
                                    <p className="text-[10px] font-black uppercase tracking-widest italic">Select File Payload</p>
                                </div>
                            )}
                        </div>
                    </div>

                    <button type="submit" className="w-full h-14 bg-brand-primary hover:bg-teacher-primary text-white rounded-md font-black text-[11px] uppercase tracking-widest transition-all shadow-[0_0_20px_rgba(59,130,246,0.3)] mt-6 flex items-center justify-center gap-3 italic">
                        <HardDrive size={18} /> INITIATE UPLINK
                    </button>
                </form>
            </Modal>
        </div>
    );
};

export default ResourceLocker;
