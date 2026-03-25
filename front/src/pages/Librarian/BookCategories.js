import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchCategoriesSlice, fetchBooksSlice } from '../../redux/slice/librarian.slice';
import { LayoutGrid, Search, BookOpen, Layers, BarChart, ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';

const BookCategories = () => {
    const dispatch = useDispatch();
    const { categories, books, loading } = useSelector((state) => state.librarian);
    const [selectedCategory, setSelectedCategory] = React.useState('all');

    useEffect(() => {
        dispatch(fetchCategoriesSlice());
        dispatch(fetchBooksSlice());
    }, [dispatch]);

    const stats = categories.map(cat => ({
        name: cat,
        count: books.filter(b => b.category === cat).length
    }));

    const filteredBooks = selectedCategory === 'all' 
        ? books 
        : books.filter(b => b.category === selectedCategory);

    return (
        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="space-y-8 pb-10 font-outfit">
            <div className="flex justify-between items-end">
                <div>
                    <h1 className="text-3xl font-black text-librarian-primary italic uppercase tracking-tighter mb-1 leading-none">Categorical Matrix</h1>
                    <p className="text-[11px] font-black text-slate-500 uppercase tracking-widest italic opacity-70 leading-none">Cluster management for knowledge volumes.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="md:col-span-1 space-y-4">
                    <div className="bg-neutral-900 border border-slate-800/60 rounded-md p-6 shadow-xl">
                        <h3 className="text-xs font-black uppercase tracking-[0.2em] text-slate-500 italic mb-6 border-b border-slate-800/60 pb-3">Available Clusters</h3>
                        <div className="space-y-2">
                            <button 
                                onClick={() => setSelectedCategory('all')}
                                className={`w-full flex items-center justify-between px-4 py-3 rounded-md transition-all group ${selectedCategory === 'all' ? 'bg-librarian-primary text-white shadow-lg' : 'text-slate-400 hover:bg-white/5 hover:text-slate-200'}`}
                            >
                                <div className="flex items-center gap-3">
                                    <LayoutGrid size={14} className={selectedCategory === 'all' ? 'text-white' : 'text-slate-600'} />
                                    <span className="text-[10px] font-black uppercase italic tracking-widest">Universal</span>
                                </div>
                                <span className={`text-[10px] font-black opacity-40 ${selectedCategory === 'all' ? 'text-white' : ''}`}>{books.length}</span>
                            </button>
                            {stats.map((stat, i) => (
                                <button 
                                    key={i}
                                    onClick={() => setSelectedCategory(stat.name)}
                                    className={`w-full flex items-center justify-between px-4 py-3 rounded-md transition-all group ${selectedCategory === stat.name ? 'bg-librarian-primary text-white shadow-lg' : 'text-slate-400 hover:bg-white/5 hover:text-slate-200'}`}
                                >
                                    <div className="flex items-center gap-3">
                                        <Layers size={14} className={selectedCategory === stat.name ? 'text-white' : 'text-slate-600'} />
                                        <span className="text-[10px] font-black uppercase italic tracking-widest truncate max-w-[120px]">{stat.name}</span>
                                    </div>
                                    <span className={`text-[10px] font-black opacity-40 ${selectedCategory === stat.name ? 'text-white' : ''}`}>{stat.count}</span>
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="md:col-span-3">
                    <div className="bg-neutral-900 border border-slate-800/60 rounded-md shadow-2xl overflow-hidden min-h-[500px]">
                        <div className="px-6 py-5 border-b border-slate-800/60 bg-neutral-950/40 flex items-center justify-between">
                            <h2 className="text-lg font-black italic uppercase tracking-tight text-slate-100 leading-none">Cluster: <span className="text-librarian-primary">{selectedCategory}</span></h2>
                        </div>
                        
                        <div className="p-6 grid grid-cols-1 lg:grid-cols-2 gap-4">
                            {filteredBooks.length > 0 ? filteredBooks.map((book, i) => (
                                <div key={i} className="p-4 bg-neutral-950 border border-slate-800/40 rounded-md hover:border-librarian-primary/40 transition-all flex items-center gap-4 group/item">
                                    <div className="w-10 h-10 rounded-md bg-neutral-900 flex items-center justify-center text-slate-600 group-hover/item:text-librarian-primary transition-colors">
                                        <BookOpen size={18} />
                                    </div>
                                    <div className="flex flex-col flex-1">
                                        <span className="text-xs font-bold text-slate-200 uppercase italic tracking-tight mb-1 group-hover/item:text-librarian-primary transition-all">{book.title}</span>
                                        <span className="text-[9px] text-slate-500 font-black uppercase italic opacity-60 tracking-widest">{book.author}</span>
                                    </div>
                                    <ChevronRight size={14} className="text-slate-700 opacity-0 group-hover/item:opacity-100 transition-all" />
                                </div>
                            )) : (
                                <div className="col-span-full py-20 text-center text-slate-500 italic font-black uppercase text-xs tracking-[0.2em] opacity-40">No knowledge volumes identified in this cluster.</div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </motion.div>
    );
};

export default BookCategories;
