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
    const [formData, setFormData] = React.useState({ title: '', author: '', isbn: '', category: '', totalCopies: 1, publisher: '', publicationYear: new Date().getFullYear(), location: '' });

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
            setFormData({ title: '', author: '', isbn: '', category: '', totalCopies: 1, publisher: '', publicationYear: new Date().getFullYear(), location: '' });
        }
        setIsModalOpen(true);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (editingBook) {
            dispatch(updateBookSlice({ id: editingBook._id, data: formData }));
        } else {
            dispatch(addBookSlice({ ...formData, availableCopies: formData.totalCopies }));
        }
        setIsModalOpen(false);
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
                                            <span className={`inline-flex items-center px-2 py-0.5 border text-[9px] font-black uppercase tracking-widest rounded-md italic ${book.availableCopies > 0 ? 'bg-indigo-600/10 border-indigo-600/20 text-indigo-400' : 'bg-red-600/10 border-red-600/20 text-red-400'}`}>
                                                {book.availableCopies > 0 ? 'Accessible' : 'Restricted'}
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
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsModalOpen(false)} className="absolute inset-0 bg-neutral-950/80 backdrop-blur-md"></motion.div>
                        <motion.div initial={{ scale: 0.9, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.9, opacity: 0, y: 20 }} className="bg-neutral-900 w-full max-w-lg rounded-md border border-slate-800 shadow-2xl relative z-10 overflow-hidden">
                            <form onSubmit={handleSubmit} className="space-y-6 p-10">
                                <h3 className="text-xl font-black italic uppercase tracking-tighter text-indigo-400 mb-8 pb-4 border-b border-slate-800/60 leading-none">
                                    {editingBook ? 'Update volume protocol' : 'New volume protocol'}
                                </h3>
                                
                                <div className="space-y-4">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 italic ml-1">Volume Title</label>
                                        <input 
                                            type="text" 
                                            required
                                            value={formData.title}
                                            onChange={(e) => setFormData({...formData, title: e.target.value})}
                                            className="w-full bg-neutral-950 border border-slate-800/60 rounded-md py-3 px-4 text-xs font-bold text-slate-200 focus:outline-none focus:border-indigo-600/50 transition-all italic"
                                        />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 italic ml-1">Archive ID (ISBN)</label>
                                            <input 
                                                type="text" 
                                                required
                                                value={formData.isbn}
                                                onChange={(e) => setFormData({...formData, isbn: e.target.value})}
                                                className="w-full bg-neutral-950 border border-slate-800/60 rounded-md py-3 px-4 text-xs font-bold text-slate-200 focus:outline-none focus:border-indigo-600/50 transition-all italic"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 italic ml-1">Total Copies</label>
                                            <input 
                                                type="number" 
                                                required
                                                min="1"
                                                value={formData.totalCopies}
                                                onChange={(e) => setFormData({...formData, totalCopies: parseInt(e.target.value)})}
                                                className="w-full bg-neutral-950 border border-slate-800/60 rounded-md py-3 px-4 text-xs font-bold text-slate-200 focus:outline-none focus:border-indigo-600/50 transition-all italic"
                                            />
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 italic ml-1">Custodian (Author)</label>
                                            <input 
                                                type="text" 
                                                required
                                                value={formData.author}
                                                onChange={(e) => setFormData({...formData, author: e.target.value})}
                                                className="w-full bg-neutral-950 border border-slate-800/60 rounded-md py-3 px-4 text-xs font-bold text-slate-200 focus:outline-none focus:border-indigo-600/50 transition-all italic"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 italic ml-1">Cluster (Category)</label>
                                            <input 
                                                list="categories"
                                                type="text" 
                                                placeholder="Scientific, History..."
                                                value={formData.category}
                                                onChange={(e) => setFormData({...formData, category: e.target.value})}
                                                className="w-full bg-neutral-950 border border-slate-800/60 rounded-md py-3 px-4 text-xs font-bold text-slate-200 focus:outline-none focus:border-indigo-600/50 transition-all italic"
                                            />
                                            <datalist id="categories">
                                                {categories.map(c => <option key={c} value={c} />)}
                                            </datalist>
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 italic ml-1">Publisher</label>
                                            <input 
                                                type="text" 
                                                value={formData.publisher}
                                                onChange={(e) => setFormData({...formData, publisher: e.target.value})}
                                                className="w-full bg-neutral-950 border border-slate-800/60 rounded-md py-3 px-4 text-xs font-bold text-slate-200 focus:outline-none focus:border-indigo-600/50 transition-all italic"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 italic ml-1">Year</label>
                                            <input 
                                                type="number" 
                                                value={formData.publicationYear}
                                                onChange={(e) => setFormData({...formData, publicationYear: parseInt(e.target.value)})}
                                                className="w-full bg-neutral-950 border border-slate-800/60 rounded-md py-3 px-4 text-xs font-bold text-slate-200 focus:outline-none focus:border-indigo-600/50 transition-all italic"
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 italic ml-1">Physical Location (Shelf/Node)</label>
                                        <input 
                                            type="text" 
                                            placeholder="Shelf A-12, Sector 4..."
                                            value={formData.location}
                                            onChange={(e) => setFormData({...formData, location: e.target.value})}
                                            className="w-full bg-neutral-950 border border-slate-800/60 rounded-md py-3 px-4 text-xs font-bold text-slate-200 focus:outline-none focus:border-indigo-600/50 transition-all italic"
                                        />
                                    </div>
                                </div>

                                <div className="flex gap-4 pt-6">
                                    <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 px-6 py-4 border border-slate-800 text-[10px] font-black uppercase tracking-widest italic text-slate-500 hover:bg-slate-800/30 transition-all rounded-md leading-none">abort</button>
                                    <button type="submit" className="flex-1 px-6 py-4 bg-indigo-600 text-[10px] font-black uppercase tracking-widest italic text-white rounded-md hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-600/20 leading-none">
                                        {editingBook ? 'update archive' : 'commit record'}
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
