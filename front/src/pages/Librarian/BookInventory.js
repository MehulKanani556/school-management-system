import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchBooksSlice, addBookSlice, deleteBookSlice, updateBookSlice, fetchCategoriesSlice } from '../../redux/slice/librarian.slice';
import { Library, Search, Plus, Trash2, Edit3, User, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const BookInventory = () => {
    const dispatch = useDispatch();
    const { books, categories, loading, success } = useSelector((state) => state.librarian);
    const [isModalOpen, setIsModalOpen] = React.useState(false);
    const [editingBook, setEditingBook] = React.useState(null);
    const [searchTerm, setSearchTerm] = React.useState('');
    const [formData, setFormData] = React.useState({ title: '', author: '', isbn: '', category: '', totalCopies: 1, publisher: '', publicationYear: new Date().getFullYear(), location: '', type: 'Physical', fileUrl: '' });
    const [bookFile, setBookFile] = React.useState(null);

    useEffect(() => {
        dispatch(fetchBooksSlice());
        dispatch(fetchCategoriesSlice());
    }, [dispatch, success]);

    const handleOpenModal = (book = null) => {
        if (book) {
            setEditingBook(book);
            setFormData({ ...book });
        } else {
            setEditingBook(null);
            setFormData({ title: '', author: '', isbn: '', category: '', totalCopies: 1, publisher: '', publicationYear: new Date().getFullYear(), location: '', type: 'Physical', fileUrl: '' });
            setBookFile(null);
        }
        setIsModalOpen(true);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        
        const data = new FormData();
        Object.keys(formData).forEach(key => {
            if (formData[key] !== null && formData[key] !== undefined) {
                data.append(key, formData[key]);
            }
        });
        
        if (bookFile) {
            data.append('bookFile', bookFile);
        }

        if (editingBook) {
            dispatch(updateBookSlice({ id: editingBook._id, data: data }));
        } else {
            // For new books, ensure available copies matches total
            if (formData.type === 'Physical') {
                data.append('availableCopies', formData.totalCopies);
            }
            dispatch(addBookSlice(data));
        }
        setIsModalOpen(false);
        setBookFile(null);
    };

    const filteredBooks = books.filter(b => 
        b.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        b.author?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        b.isbn?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        b.category?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleDelete = (id) => {
        if (window.confirm('Delete this book protocol?')) {
            dispatch(deleteBookSlice(id));
        }
    }

    return (
        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="space-y-8 pb-10">
            <div className="flex justify-between items-end">
                <div>
                    <h1 className="text-3xl font-black text-slate-100 italic uppercase tracking-tighter mb-1 leading-none text-indigo-400">Inventory Node</h1>
                    <p className="text-[11px] font-black text-slate-500 uppercase tracking-widest italic opacity-70 leading-none">Archived physical knowledge repositories.</p>
                </div>
                <button 
                    onClick={() => handleOpenModal()}
                    className="px-6 py-3 bg-indigo-600 text-white text-[11px] font-black italic uppercase tracking-widest rounded-md shadow-lg shadow-indigo-600/20 hover:translate-y-[-2px] transition-all flex items-center gap-2"
                >
                    <Plus size={14} /> add book
                </button>
            </div>

            <div className="bg-neutral-900 border border-slate-800/60 rounded-md shadow-2xl overflow-hidden group">
                <div className="px-6 py-5 border-b border-slate-800/60 bg-neutral-950/40 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <h2 className="text-lg font-black italic uppercase tracking-tight text-slate-100 leading-none">Archive Registry</h2>
                    <div className="relative">
                        <Search className="absolute left-3 top-2.5 text-slate-600" size={14} />
                        <input 
                            type="text" 
                            placeholder="Identify volume..." 
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="bg-neutral-950 border border-slate-800/60 rounded-md py-2 pl-9 pr-4 text-xs font-bold text-slate-200 focus:outline-none focus:border-indigo-600/50 transition-all w-full sm:w-64 italic"
                        />
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-neutral-950/50 border-b border-slate-800/60 font-outfit">
                                <th className="px-6 py-4 text-[9px] font-black text-slate-500 uppercase tracking-widest italic leading-none">Book Identity</th>
                                <th className="px-6 py-4 text-[9px] font-black text-slate-500 uppercase tracking-widest italic leading-none">Metadata & Cluster</th>
                                <th className="px-6 py-4 text-[9px] font-black text-slate-500 uppercase tracking-widest italic leading-none">Archival Locale</th>
                                <th className="px-6 py-4 text-[9px] font-black text-slate-500 uppercase tracking-widest italic leading-none">Availability Matrix</th>
                                <th className="px-6 py-4 text-[9px] font-black text-slate-500 uppercase tracking-widest italic leading-none text-right">Maintenance Protocol</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800/40">
                            {filteredBooks.length > 0 ? filteredBooks.map((book, i) => (
                                <tr key={i} className="group/row hover:bg-neutral-950/60 transition-all">
                                    <td className="px-6 py-6">
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 rounded-md bg-neutral-950 border border-slate-800/60 overflow-hidden flex items-center justify-center text-slate-600 shadow-inner group-hover/row:border-indigo-600/30 transition-all">
                                                <Library size={18} />
                                            </div>
                                            <div className="flex flex-col">
                                                <span className="font-bold text-sm text-slate-200 tracking-tight leading-none mb-1.5 group-hover/row:text-indigo-400 transition-all">{book.title}</span>
                                                <span className="text-[10px] text-slate-500 uppercase italic opacity-60">ISBN: {book.isbn}</span>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-6">
                                        <div className="flex flex-col">
                                            <span className="text-sm font-black text-slate-200 tracking-tighter italic uppercase leading-none mb-1">{book.author}</span>
                                            <div className="flex items-center gap-2">
                                                <span className="text-[10px] font-bold text-slate-600 uppercase italic opacity-60 tracking-widest">{book.category}</span>
                                                <span className="w-1 h-1 rounded-full bg-slate-800"></span>
                                                <span className="text-[10px] font-bold text-slate-600 uppercase italic opacity-60 tracking-widest">{book.publicationYear}</span>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-6">
                                        <div className="flex flex-col">
                                            <span className="text-sm font-black text-slate-200 tracking-tighter italic uppercase leading-none mb-1">{book.publisher}</span>
                                            <span className="text-[10px] font-bold text-slate-600 uppercase italic opacity-60 tracking-widest">{book.location || 'Unassigned Node'}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-6">
                                        <div className="flex items-center gap-4">
                                            <div className="flex flex-col">
                                                <span className="text-sm font-black text-slate-100 tracking-tighter italic uppercase leading-none mb-1">{book.availableCopies} Node(s)</span>
                                                <span className="text-[9px] font-bold text-slate-600 uppercase italic leading-none opacity-60">of {book.totalCopies} registered</span>
                                            </div>
                                            <span className={`inline-flex items-center px-2 py-0.5 border text-[9px] font-black uppercase tracking-widest rounded-md italic ${book.type === 'E-Book' ? 'bg-purple-600/10 border-purple-600/20 text-purple-400' : book.availableCopies > 0 ? 'bg-indigo-600/10 border-indigo-600/20 text-indigo-400' : 'bg-red-600/10 border-red-600/20 text-red-400'}`}>
                                                {book.type === 'E-Book' ? 'Digital' : book.availableCopies > 0 ? 'Accessible' : 'Restricted'}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-6 text-right">
                                        <div className="flex items-center gap-3 justify-end opacity-0 group-hover/row:opacity-100 transition-all">
                                            <button 
                                                onClick={() => handleOpenModal(book)}
                                                className="p-2 text-slate-500 hover:text-indigo-400 transition-all"
                                            >
                                                <Edit3 size={16} />
                                            </button>
                                            <button 
                                                onClick={() => handleDelete(book._id)}
                                                className="p-2 text-slate-500 hover:text-red-400 transition-all"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan="5" className="px-6 py-20 text-center text-slate-500 italic font-black uppercase text-xs tracking-[0.2em] opacity-40">No knowledge volumes archived in current sector.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            <AnimatePresence>
                {isModalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-6 sm:p-0">
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsModalOpen(false)} className="absolute inset-0 bg-neutral-950/90 backdrop-blur-xl"></motion.div>
                        <motion.div initial={{ scale: 0.95, opacity: 0, y: 30 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.95, opacity: 0, y: 30 }} className="bg-neutral-900 w-full max-w-2xl rounded-2xl border border-white/5 shadow-[0_0_50px_-12px_rgba(79,70,229,0.3)] relative z-10 overflow-hidden font-outfit">
                            <form onSubmit={handleSubmit} className="p-0">
                                {/* Header */}
                                <div className="px-10 py-6 border-b border-white/5 bg-white/[0.02] flex items-center justify-between">
                                    <div>
                                        <h3 className="text-xl font-black italic uppercase tracking-tighter text-indigo-400 leading-none">
                                            {editingBook ? 'Update Volume Protocol' : 'New Volume Protocol'}
                                        </h3>
                                        <p className="text-[10px] text-slate-500 uppercase tracking-widest mt-1 font-bold italic opacity-60">Master Archival Entry System</p>
                                    </div>
                                    <div className="flex gap-2">
                                        {['Physical', 'E-Book'].map(t => (
                                            <button 
                                                key={t}
                                                type="button" 
                                                onClick={() => setFormData({...formData, type: t})}
                                                className={`px-3 py-1.5 rounded-md text-[9px] font-black uppercase tracking-widest transition-all border ${
                                                    formData.type === t 
                                                    ? 'bg-indigo-600 border-indigo-500 text-white shadow-lg shadow-indigo-600/20' 
                                                    : 'bg-neutral-950 border-slate-800/60 text-slate-500 hover:text-white'
                                                }`}
                                            >
                                                {t}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div className="px-10 py-8 space-y-8 max-h-[70vh] overflow-y-auto custom-scrollbar">
                                    {/* Section: Core Identity */}
                                    <div className="space-y-5">
                                        <div className="flex items-center gap-2 mb-2">
                                            <span className="w-1.5 h-1.5 rounded-full bg-indigo-500"></span>
                                            <h4 className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400 italic">Core Identity</h4>
                                        </div>
                                        <div className="grid grid-cols-1 gap-5">
                                            <div className="space-y-2">
                                                <label className="text-[9px] font-black uppercase tracking-widest text-slate-600 italic ml-1 flex items-center gap-1.5">
                                                    <Library size={10} /> Volume Title
                                                </label>
                                                <input 
                                                    type="text" 
                                                    required
                                                    placeholder="The Chronicles of Knowledge..."
                                                    value={formData.title}
                                                    onChange={(e) => setFormData({...formData, title: e.target.value})}
                                                    className="w-full bg-neutral-950 border border-white/5 rounded-xl py-4 px-5 text-sm font-bold text-slate-200 focus:outline-none focus:border-indigo-600/50 transition-all italic placeholder:text-slate-800"
                                                />
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                                            <div className="space-y-2">
                                                <label className="text-[9px] font-black uppercase tracking-widest text-slate-600 italic ml-1 flex items-center gap-1.5">
                                                    <Search size={10} /> Archive ID (ISBN)
                                                </label>
                                                <input 
                                                    type="text" 
                                                    required
                                                    placeholder="ISBN-000-00-000"
                                                    value={formData.isbn}
                                                    onChange={(e) => setFormData({...formData, isbn: e.target.value})}
                                                    className="w-full bg-neutral-950 border border-white/5 rounded-xl py-4 px-5 text-sm font-bold text-slate-200 focus:outline-none focus:border-indigo-600/50 transition-all italic placeholder:text-slate-800"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-[9px] font-black uppercase tracking-widest text-slate-600 italic ml-1 flex items-center gap-1.5">
                                                    <User size={10} /> Custodian (Author)
                                                </label>
                                                <input 
                                                    type="text" 
                                                    required
                                                    placeholder="Dr. John Doe..."
                                                    value={formData.author}
                                                    onChange={(e) => setFormData({...formData, author: e.target.value})}
                                                    className="w-full bg-neutral-950 border border-white/5 rounded-xl py-4 px-5 text-sm font-bold text-slate-200 focus:outline-none focus:border-indigo-600/50 transition-all italic placeholder:text-slate-800"
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Section: Volume Archetype Specifics */}
                                    <div className="space-y-5">
                                        <div className="flex items-center gap-2 mb-2">
                                            <span className="w-1.5 h-1.5 rounded-full bg-purple-500"></span>
                                            <h4 className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400 italic">Volume Archetype Specifics</h4>
                                        </div>
                                        
                                        {formData.type === 'Physical' ? (
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                                                <div className="space-y-2">
                                                    <label className="text-[9px] font-black uppercase tracking-widest text-slate-600 italic ml-1">Total Registered Copies</label>
                                                    <input 
                                                        type="number" 
                                                        required
                                                        min="1"
                                                        value={formData.totalCopies}
                                                        onChange={(e) => setFormData({...formData, totalCopies: parseInt(e.target.value)})}
                                                        className="w-full bg-neutral-950 border border-white/5 rounded-xl py-4 px-5 text-sm font-bold text-slate-200 focus:outline-none focus:border-indigo-600/50 transition-all italic"
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <label className="text-[9px] font-black uppercase tracking-widest text-slate-600 italic ml-1">Physical Location (Shelf)</label>
                                                    <input 
                                                        type="text" 
                                                        placeholder="Shelf A-12, Sector 4..."
                                                        value={formData.location}
                                                        onChange={(e) => setFormData({...formData, location: e.target.value})}
                                                        className="w-full bg-neutral-950 border border-white/5 rounded-xl py-4 px-5 text-sm font-bold text-slate-200 focus:outline-none focus:border-indigo-600/50 transition-all italic placeholder:text-slate-800"
                                                    />
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="space-y-5 bg-purple-500/5 border border-purple-500/10 rounded-2xl p-6">
                                                <div className="space-y-2">
                                                    <label className="text-[9px] font-black uppercase tracking-widest text-purple-400 italic ml-1 flex items-center gap-1.5">
                                                        <Edit3 size={10} /> Digital Asset Source (Manual URL)
                                                    </label>
                                                    <input 
                                                        type="url" 
                                                        placeholder="https://external-archive.com/volume.pdf"
                                                        value={formData.fileUrl}
                                                        onChange={(e) => setFormData({...formData, fileUrl: e.target.value})}
                                                        className="w-full bg-neutral-950 border border-purple-500/20 rounded-xl py-4 px-5 text-xs font-bold text-slate-300 focus:outline-none focus:border-purple-500/50 transition-all italic placeholder:text-slate-800"
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <label className="text-[9px] font-black uppercase tracking-widest text-purple-400 italic ml-1">Native Digital Volume Upload</label>
                                                    <div className="relative group/upload h-32">
                                                        <input 
                                                            type="file" 
                                                            accept=".pdf,.epub,.txt"
                                                            onChange={(e) => setBookFile(e.target.files[0])}
                                                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                                                        />
                                                        <div className="w-full h-full bg-black/40 border-2 border-dashed border-purple-500/20 rounded-xl flex flex-col items-center justify-center gap-2 group-hover/upload:border-purple-500/40 group-hover/upload:bg-purple-500/5 transition-all">
                                                            <div className="w-10 h-10 rounded-full bg-purple-500/10 flex items-center justify-center text-purple-400">
                                                                <Plus size={20} />
                                                            </div>
                                                            <span className="text-[10px] font-black uppercase tracking-tighter text-slate-400 italic">
                                                                {bookFile ? bookFile.name : 'Drag or click to commit PDF material'}
                                                            </span>
                                                            <span className="text-[8px] text-slate-600 uppercase tracking-widest font-bold">Max Limit: 5.0 MB Matrix</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    {/* Section: Secondary Metadata */}
                                    <div className="space-y-5">
                                        <div className="flex items-center gap-2 mb-2">
                                            <span className="w-1.5 h-1.5 rounded-full bg-slate-600"></span>
                                            <h4 className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400 italic">Secondary Metadata</h4>
                                        </div>
                                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                                            <div className="space-y-2">
                                                <label className="text-[9px] font-black uppercase tracking-widest text-slate-600 italic ml-1">Cluster (Category)</label>
                                                <input 
                                                    list="categories"
                                                    type="text" 
                                                    placeholder="Scientific..."
                                                    value={formData.category}
                                                    onChange={(e) => setFormData({...formData, category: e.target.value})}
                                                    className="w-full bg-neutral-950 border border-white/5 rounded-xl py-4 px-5 text-sm font-bold text-slate-200 focus:outline-none focus:border-indigo-600/50 transition-all italic placeholder:text-slate-800"
                                                />
                                                <datalist id="categories">
                                                    {categories.map(c => <option key={c} value={c} />)}
                                                </datalist>
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-[9px] font-black uppercase tracking-widest text-slate-600 italic ml-1">Publisher</label>
                                                <input 
                                                    type="text" 
                                                    placeholder="Global Press..."
                                                    value={formData.publisher}
                                                    onChange={(e) => setFormData({...formData, publisher: e.target.value})}
                                                    className="w-full bg-neutral-950 border border-white/5 rounded-xl py-4 px-5 text-sm font-bold text-slate-200 focus:outline-none focus:border-indigo-600/50 transition-all italic placeholder:text-slate-800"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-[9px] font-black uppercase tracking-widest text-slate-600 italic ml-1">Archive Year</label>
                                                <input 
                                                    type="number" 
                                                    value={formData.publicationYear}
                                                    onChange={(e) => setFormData({...formData, publicationYear: parseInt(e.target.value)})}
                                                    className="w-full bg-neutral-950 border border-white/5 rounded-xl py-4 px-5 text-sm font-bold text-slate-200 focus:outline-none focus:border-indigo-600/50 transition-all italic"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Footer Actions */}
                                <div className="p-8 border-t border-white/5 bg-white/[0.01] flex gap-4">
                                    <button 
                                        type="button" 
                                        onClick={() => setIsModalOpen(false)} 
                                        className="flex-1 px-6 py-4 border border-white/5 text-[10px] font-black uppercase tracking-widest italic text-slate-500 hover:bg-white/5 transition-all rounded-xl leading-none"
                                    >
                                        Abort
                                    </button>
                                    <button 
                                        type="submit" 
                                        className="flex-[2] px-6 py-4 bg-indigo-600 text-[11px] font-black uppercase tracking-[0.2em] italic text-white rounded-xl hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-600/20 leading-none flex items-center justify-center gap-2 group"
                                    >
                                        {editingBook ? 'Update Archive Registry' : 'Commit Volume to Matrix'}
                                        <Plus size={14} className="group-hover:rotate-90 transition-transform" />
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </motion.div>
    );
};

export default BookInventory;
