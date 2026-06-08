import React, { useState, useEffect, useMemo } from 'react';
import { Book, BookmarkPlus, Library as LibIcon, FileText, Search, Bookmark, Clock, Check, X, BookOpen, Layers, ShieldAlert, Award, Star, ShieldCheck } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-hot-toast';
import api from '../../utils/axiosInstance';
import PortalModal from '../../components/PortalModal';

const LibraryStudent = () => {
  const [books, setBooks] = useState([]);
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('catalog'); // catalog, ebooks, reservations
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  
  // Interactive simulated reservation states
  const [selectedBookForReservation, setSelectedBookForReservation] = useState(null);
  const [reserving, setReserving] = useState(false);
  const [reservationSuccess, setReservationSuccess] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [booksRes, resRes] = await Promise.all([
        api.get('/student/library/books'),
        api.get('/student/library/reservations')
      ]);
      setBooks(booksRes.data);
      setReservations(resRes.data);
    } catch (err) {
      toast.error('Failed to connect to the Library server');
    } finally {
      setLoading(false);
    }
  };

  const handleReserveSubmit = async (e) => {
    e.preventDefault();
    if (!selectedBookForReservation) return;
    
    setReserving(true);
    try {
      const { data } = await api.post('/student/library/reserve', { bookId: selectedBookForReservation._id });
      setTimeout(async () => {
        setReserving(false);
        setReservationSuccess(true);
        toast.success(data.message || 'Book reserved successfully');
        // Refresh reservations
        const resRes = await api.get('/student/library/reservations');
        setReservations(resRes.data);
      }, 2000);
    } catch (err) {
      setReserving(false);
      toast.error(err.response?.data?.message || 'Failed to place reservation');
      setSelectedBookForReservation(null);
    }
  };

  const isReserved = (bookId) => {
    return reservations.some(r => (r.bookId?._id || r.bookId) === bookId && r.status === 'pending');
  };

  // Extract unique categories from books
  const categories = useMemo(() => {
    const cats = new Set();
    books.forEach(b => {
      if (b.category) cats.add(b.category);
    });
    return ['ALL', ...Array.from(cats)];
  }, [books]);

  // Filter Catalog & E-Books
  const filteredCatalog = useMemo(() => {
    return books.filter(b => {
      const matchesType = (b.type || 'Physical') === 'Physical';
      const matchesCategory = selectedCategory === 'ALL' || b.category === selectedCategory;
      const matchesSearch = searchQuery.trim() === '' || 
        b.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        b.author?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        b.isbn?.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesType && matchesCategory && matchesSearch;
    });
  }, [books, selectedCategory, searchQuery]);

  const filteredEbooks = useMemo(() => {
    return books.filter(b => {
      const matchesType = b.type === 'E-Book';
      const matchesCategory = selectedCategory === 'ALL' || b.category === selectedCategory;
      const matchesSearch = searchQuery.trim() === '' || 
        b.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        b.author?.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesType && matchesCategory && matchesSearch;
    });
  }, [books, selectedCategory, searchQuery]);

  const getCategoryDetails = (category) => {
    const cat = (category || '').toLowerCase();
    if (cat.includes('computer') || cat.includes('tech') || cat.includes('code')) {
      return { 
        colors: 'text-sky-400 bg-sky-500/10 border-sky-500/25', 
        spine: 'bg-sky-500 shadow-[2px_0_15px_rgba(56,189,248,0.4)]', 
        glow: 'rgba(56, 189, 248, 0.08)' 
      };
    }
    if (cat.includes('science') || cat.includes('physics') || cat.includes('chemistry')) {
      return { 
        colors: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/25', 
        spine: 'bg-emerald-500 shadow-[2px_0_15px_rgba(52,211,153,0.4)]', 
        glow: 'rgba(52, 211, 153, 0.08)' 
      };
    }
    if (cat.includes('math')) {
      return { 
        colors: 'text-indigo-400 bg-indigo-500/10 border-indigo-500/25', 
        spine: 'bg-indigo-500 shadow-[2px_0_15px_rgba(99,102,241,0.4)]', 
        glow: 'rgba(99, 102, 241, 0.08)' 
      };
    }
    if (cat.includes('english') || cat.includes('grammar') || cat.includes('literature') || cat.includes('hindi')) {
      return { 
        colors: 'text-violet-400 bg-violet-500/10 border-violet-500/25', 
        spine: 'bg-violet-500 shadow-[2px_0_15px_rgba(139,92,246,0.4)]', 
        glow: 'rgba(139, 92, 246, 0.08)' 
      };
    }
    return { 
      colors: 'text-brand-primary bg-brand-primary/10 border-brand-primary/25', 
      spine: 'bg-brand-primary shadow-[2px_0_15px_rgba(88,166,255,0.4)]', 
      glow: 'rgba(88, 166, 255, 0.08)' 
    };
  };

  const getReservationStatusDetails = (status) => {
    if (!status) return { style: 'bg-slate-500/10 text-slate-505 border-slate-500/20', dot: 'bg-slate-500' };
    switch (status.toLowerCase()) {
      case 'pending': return { style: 'bg-amber-500/10 text-amber-500 border-amber-500/20 shadow-sm', dot: 'bg-amber-500 animate-pulse' };
      case 'fulfilled': return { style: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20 shadow-sm', dot: 'bg-emerald-500' };
      default: return { style: 'bg-rose-500/10 text-rose-500 border-rose-500/20 shadow-sm', dot: 'bg-rose-500' };
    }
  };

  if (loading) return <div className="p-8 text-center text-slate-400 font-outfit uppercase tracking-widest text-xs italic">Loading Library Records...</div>;

  return (
    <div className="space-y-8 pb-12 w-full text-left font-outfit relative overflow-x-hidden">
      
      {/* Glow Backdrops */}
      <div className="absolute top-[-5%] left-[-5%] w-[40rem] h-[40rem] bg-brand-primary/5 blur-[150px] rounded-full pointer-events-none" />

      {/* ── Hero Header ───────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45 }}
        className="relative rounded-xl overflow-hidden border border-brand-border/40 bg-brand-surface/40 backdrop-blur-xl"
      >
        <div className="h-1 w-full bg-gradient-to-r from-brand-primary via-emerald-455 to-brand-secondary" />
        <div className="absolute top-0 right-0 w-96 h-40 bg-brand-primary/8 blur-3xl pointer-events-none rounded-full" />
        
        <div className="relative z-10 p-6 lg:p-8 font-outfit">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 font-outfit">
            <div className="flex items-center gap-5 font-outfit">
              <div className="relative flex-shrink-0 font-outfit">
                <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-brand-primary/20 to-brand-secondary/20 border border-brand-primary/30 flex items-center justify-center overflow-hidden shadow-xl">
                  <LibIcon className="text-brand-primary" size={24} />
                </div>
                <span className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-luxury-emerald rounded-full border-2 border-[#070709]" />
              </div>
              <div className="font-outfit">
                <p className="text-[10px] font-black uppercase tracking-[0.35em] text-slate-500 mb-1 font-outfit leading-none">Catalog Console</p>
                <h1 className="text-3xl font-black tracking-tight text-white leading-none font-outfit">
                  School <span className="text-brand-primary">Library</span>
                </h1>
                <p className="text-xs text-slate-400 mt-2 italic max-w-xl uppercase tracking-wider leading-relaxed">
                  Browse physical catalogs, reserve books, and read assigned e-books online.
                </p>
              </div>
            </div>

            {/* Tabs */}
            <div className="flex bg-slate-900/60 p-1 rounded-md border border-slate-800/80 shadow-inner flex-shrink-0 font-outfit">
              {[
                { id: 'catalog', label: 'Book Catalog', icon: Book },
                { id: 'ebooks', label: 'Digital Resources', icon: FileText },
                { id: 'reservations', label: 'My Reservations', icon: BookmarkPlus }
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-4 py-2.5 rounded-md text-[9px] font-black uppercase tracking-widest transition-all duration-300 flex items-center gap-2 ${
                    activeTab === tab.id 
                    ? 'bg-brand-primary text-white shadow-lg shadow-brand-primary/20' 
                    : 'text-slate-500 hover:text-white'
                  }`}
                >
                  <tab.icon size={12} />
                  {tab.label}
                  {tab.id === 'reservations' && reservations.length > 0 && (
                    <span className="ml-1 bg-white/20 px-1.5 py-0.5 rounded text-[8px]">{reservations.length}</span>
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>
      </motion.div>

      {/* ── Search & Filter Controls ─────────────────────────────── */}
      {activeTab !== 'reservations' && (
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-brand-surface/40 backdrop-blur-xl border border-brand-border/30 p-4 rounded-md shadow-xl w-full">
          <div className="relative w-full md:w-80">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" size={14} />
            <input 
              type="text" 
              placeholder="SEARCH BY TITLE, AUTHOR, OR ISBN..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-950/80 border border-slate-800/80 rounded-md pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-655 focus:border-brand-primary/60 outline-none transition-all"
            />
          </div>

          {/* Category Dropdown */}
          <div className="relative w-full md:w-64">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full bg-slate-950/80 border border-slate-800/80 rounded-md pl-4 pr-10 py-2.5 text-[10px] font-black uppercase tracking-wider text-slate-350 focus:border-brand-primary/60 outline-none transition-all cursor-pointer appearance-none"
            >
              {categories.map(cat => (
                <option key={cat} value={cat} className="bg-slate-950 text-slate-300">
                  {cat === 'ALL' ? 'ALL CATEGORIES' : cat}
                </option>
              ))}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-slate-500">
              <svg className="fill-current h-3.5 w-3.5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
              </svg>
            </div>
          </div>
        </div>
      )}

      {/* ── Tab Content ───────────────────────────────────────────── */}
      <AnimatePresence mode="wait">
        {activeTab === 'catalog' && (
          <motion.div
            key="catalog"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full"
          >
            {filteredCatalog.map(book => {
              const catDetails = getCategoryDetails(book.category);
              const reserved = isReserved(book._id);
              const isAvailable = book.availableCopies > 0;
              
              return (
                <motion.div 
                  key={book._id} 
                  whileHover={{ scale: 1.01 }}
                  className="bg-[#0f0f12]/90 border border-brand-border/30 hover:border-brand-primary/45 p-6 rounded-md flex flex-col justify-between gap-5 transition-all duration-350 group relative overflow-hidden pl-8 shadow-xl"
                  style={{
                    boxShadow: `inset 4px 0 0 ${catDetails.glow}`
                  }}
                >
                  {/* Spine Accent Color Bar */}
                  <div className={`absolute left-0 top-0 bottom-0 w-[4px] ${catDetails.spine}`} />

                  <div className="space-y-3">
                    <div className="flex justify-between items-start gap-4">
                      <span className={`px-2.5 py-1 rounded-md text-[8px] font-black uppercase tracking-widest border italic ${catDetails.colors}`}>
                        {book.category || 'General'}
                      </span>
                      <span className={`px-2 py-1 rounded text-[8px] font-black uppercase tracking-widest border italic flex items-center gap-1.5 ${
                        isAvailable 
                        ? 'text-luxury-emerald bg-emerald-500/10 border-emerald-500/20' 
                        : 'text-luxury-rose bg-rose-500/10 border-rose-500/20'
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${isAvailable ? 'bg-luxury-emerald shadow-[0_0_8px_rgba(16,185,129,0.5)]' : 'bg-luxury-rose animate-pulse'}`} />
                        {isAvailable ? 'In Stock' : 'Out of Stock'}
                      </span>
                    </div>

                    <div className="text-left space-y-1">
                      <h3 className="text-base font-black text-white uppercase tracking-tight group-hover:text-brand-primary transition-colors leading-snug">
                        {book.title}
                      </h3>
                      <p className="text-[10px] text-slate-405 uppercase tracking-widest">By: {book.author}</p>
                    </div>
                  </div>

                  <div className="space-y-2 py-3 border-y border-brand-border/10 text-left">
                    <div className="flex justify-between text-[9px] text-slate-500 uppercase tracking-wider font-bold">
                      <span>ISBN Code</span>
                      <span className="text-slate-355 tracking-wide">{book.isbn}</span>
                    </div>
                    <div className="flex justify-between text-[9px] text-slate-500 uppercase tracking-wider font-bold">
                      <span>Inventory</span>
                      <span className={isAvailable ? 'text-emerald-455 font-bold' : 'text-rose-455 font-bold'}>
                        {book.availableCopies} Copies Left
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => setSelectedBookForReservation(book)}
                    disabled={!isAvailable || reserved}
                    className={`w-full py-2.5 rounded-md text-xs font-black uppercase tracking-widest transition-all duration-300 italic h-[40px] flex items-center justify-center gap-2 ${
                      reserved
                        ? 'bg-slate-900 border border-slate-800 text-slate-500 cursor-not-allowed shadow-inner'
                        : !isAvailable
                          ? 'bg-slate-900 border border-slate-800 text-rose-505/60 cursor-not-allowed opacity-50'
                          : 'bg-brand-primary/10 border border-brand-primary/50 text-brand-primary hover:bg-brand-primary hover:text-white shadow-sm hover:shadow-[0_0_20px_rgba(88,166,255,0.15)]'
                    }`}
                  >
                    {reserved ? (
                      <>
                        <Clock size={12} className="animate-spin" /> Processing...
                      </>
                    ) : !isAvailable ? (
                      <>
                        <X size={12} /> Out of Stock
                      </>
                    ) : (
                      <>
                        <Bookmark size={12} /> Reserve Book
                      </>
                    )}
                  </button>
                </motion.div>
              );
            })}
            {filteredCatalog.length === 0 && (
              <div className="col-span-full p-24 text-center bg-brand-surface/20 rounded-md border border-brand-border/40 border-dashed">
                <LibIcon className="mx-auto mb-4 opacity-20 text-slate-500 animate-pulse" size={48} />
                <p className="uppercase tracking-widest text-xs font-medium text-slate-550">No physical books matches found.</p>
              </div>
            )}
          </motion.div>
        )}

        {activeTab === 'ebooks' && (
          <motion.div
            key="ebooks"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full"
          >
            {filteredEbooks.map(book => {
              const catDetails = getCategoryDetails(book.category);
              
              return (
                <motion.div 
                  key={book._id} 
                  whileHover={{ scale: 1.01 }}
                  className="bg-[#0f0f12]/90 border border-brand-border/30 hover:border-brand-primary/45 p-6 rounded-md flex flex-col justify-between gap-5 transition-all duration-355 group relative overflow-hidden pl-8 shadow-xl"
                  style={{
                    boxShadow: `inset 4px 0 0 ${catDetails.glow}`
                  }}
                >
                  <div className={`absolute left-0 top-0 bottom-0 w-[4px] bg-gradient-to-b from-emerald-500 to-teal-600 shadow-[2px_0_15px_rgba(16,185,129,0.3)]`} />

                  <div className="space-y-3">
                    <div className="flex justify-between items-start gap-4">
                      <span className={`px-2.5 py-1 rounded-md text-[8px] font-black uppercase tracking-widest border italic ${catDetails.colors}`}>
                        {book.category || 'General'}
                      </span>
                      <span className="px-2 py-1 rounded text-[8px] font-black uppercase tracking-widest border border-emerald-500/20 text-emerald-455 bg-emerald-500/10 italic">
                        Digital E-Book
                      </span>
                    </div>

                    <div className="text-left space-y-1">
                      <h3 className="text-base font-black text-white uppercase tracking-tight group-hover:text-brand-primary transition-colors leading-snug">
                        {book.title}
                      </h3>
                      <p className="text-[10px] text-slate-405 uppercase tracking-widest">By: {book.author}</p>
                    </div>
                  </div>

                  <div className="space-y-2 py-3 border-y border-brand-border/10 text-left">
                    <div className="flex justify-between text-[9px] text-slate-500 uppercase tracking-wider font-bold">
                      <span>Format</span>
                      <span className="text-slate-350">PDF Reader</span>
                    </div>
                    <div className="flex justify-between text-[9px] text-slate-500 uppercase tracking-wider font-bold">
                      <span>Online Access</span>
                      <span className="text-emerald-455">Unlimited</span>
                    </div>
                  </div>

                  <a
                    href={book.fileUrl || '#'}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full py-2.5 rounded-md text-xs font-black uppercase tracking-widest transition-all bg-emerald-500/10 border border-emerald-500/50 text-emerald-400 hover:bg-emerald-500 hover:text-white text-center h-[40px] flex items-center justify-center gap-2 italic shadow-sm hover:shadow-[0_0_20px_rgba(16,185,129,0.15)]"
                  >
                    <BookOpen size={12} /> Read E-Book
                  </a>
                </motion.div>
              );
            })}
            {filteredEbooks.length === 0 && (
              <div className="col-span-full p-24 text-center bg-brand-surface/20 rounded-md border border-brand-border/40 border-dashed">
                <FileText className="mx-auto mb-4 opacity-20 text-slate-500 animate-pulse" size={48} />
                <p className="uppercase tracking-widest text-xs font-medium text-slate-500">No e-books are assigned to your grade catalog.</p>
              </div>
            )}
          </motion.div>
        )}

        {activeTab === 'reservations' && (
          <motion.div
            key="reservations"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="bg-brand-surface/40 backdrop-blur-xl border border-brand-border/30 rounded-md p-6 md:p-8 flex flex-col h-full overflow-hidden shadow-2xl"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 rounded-md bg-slate-800/50 border border-slate-700/30">
                <Layers size={18} className="text-brand-primary" />
              </div>
              <h3 className="text-sm font-black uppercase tracking-[0.15em] text-slate-300 font-outfit">Reservations registry</h3>
            </div>

            <div className="overflow-x-auto w-full">
              <table className="w-full text-left font-outfit border-collapse">
                <thead>
                  <tr className="border-b border-brand-border/30">
                    <th className="px-6 py-4 text-[9px] font-black uppercase tracking-widest text-slate-505 italic">Book Title</th>
                    <th className="px-6 py-4 text-[9px] font-black uppercase tracking-widest text-slate-505 italic">Category</th>
                    <th className="px-6 py-4 text-[9px] font-black uppercase tracking-widest text-slate-505 italic">Reservation Date</th>
                    <th className="px-6 py-4 text-[9px] font-black uppercase tracking-widest text-slate-505 text-center italic font-outfit">Status Badge</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-brand-border/10">
                  <AnimatePresence mode="popLayout">
                    {reservations.map(res => {
                      const statusDetails = getReservationStatusDetails(res.status);
                      
                      return (
                        <motion.tr 
                          key={res._id} 
                          initial={{ opacity: 0 }} 
                          animate={{ opacity: 1 }} 
                          className="hover:bg-slate-800/10 border-b border-brand-border/10 transition-colors group"
                        >
                          <td className="px-6 py-5">
                            <p className="text-sm font-black text-white uppercase tracking-tight group-hover:text-brand-primary transition-colors">{res.bookId?.title}</p>
                            <p className="text-[10px] text-slate-505 uppercase tracking-widest mt-0.5">By {res.bookId?.author}</p>
                          </td>
                          <td className="px-6 py-5 text-xs font-bold text-slate-400 uppercase tracking-widest italic">
                            {res.bookId?.category}
                          </td>
                          <td className="px-6 py-5 text-xs font-bold text-slate-400 uppercase tracking-widest italic font-outfit">
                            {new Date(res.requestDate).toLocaleDateString()}
                          </td>
                          <td className="px-6 py-5">
                            <div className="flex justify-center font-outfit">
                              <span className={`px-3 py-1.5 rounded-md text-[8px] font-black uppercase tracking-widest border italic flex items-center gap-2 ${statusDetails.style}`}>
                                <span className={`w-1.5 h-1.5 rounded-full ${statusDetails.dot}`} />
                                {res.status}
                              </span>
                            </div>
                          </td>
                        </motion.tr>
                      );
                    })}
                    {reservations.length === 0 && (
                      <tr>
                        <td colSpan="4" className="py-24 text-center opacity-40">
                          <ShieldAlert size={48} className="text-slate-550 mx-auto mb-4" />
                          <p className="text-sm font-medium text-slate-400">You have no active book reservations.</p>
                        </td>
                      </tr>
                    )}
                  </AnimatePresence>
                </tbody>
              </table>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Simulated Reservation Portal Modal */}
      <PortalModal isOpen={!!selectedBookForReservation} onClose={() => setSelectedBookForReservation(null)} maxWidth="max-w-md">
        {selectedBookForReservation && (
          <div className="p-8 space-y-6 text-left font-outfit">
            <header className="space-y-2 border-b border-slate-900/60 pb-4 text-left relative">
              <h2 className="text-2xl font-black text-white uppercase italic tracking-tighter leading-none">Book Registry</h2>
              <p className="text-slate-505 text-[9px] font-black uppercase tracking-widest">
                Simulated Library Protocol
              </p>
            </header>

            {!reservationSuccess ? (
              <form onSubmit={handleReserveSubmit} className="space-y-6 text-left">
                <div className="p-4 bg-slate-950/60 border border-slate-850 rounded-xl space-y-3">
                  <div className="flex justify-between items-start">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Book Title</span>
                    <span className="text-xs font-black text-white uppercase max-w-[200px] text-right">{selectedBookForReservation.title}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Author</span>
                    <span className="text-xs font-black text-slate-400 uppercase">{selectedBookForReservation.author}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Category</span>
                    <span className="text-xs font-black text-brand-primary uppercase">{selectedBookForReservation.category}</span>
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={reserving}
                    className="w-full py-4 bg-brand-primary hover:bg-blue-400 text-black disabled:opacity-50 rounded-xl flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] transition-all shadow-[0_0_20px_rgba(88,166,255,0.15)] h-[48px]"
                  >
                    {reserving ? 'AUTHORIZING reservation...' : 'CONFIRM RESERVATION'}
                  </button>
                </div>
              </form>
            ) : (
              <div className="py-8 text-center space-y-6">
                <div className="w-16 h-16 rounded-full bg-luxury-emerald/10 border border-luxury-emerald/30 flex items-center justify-center mx-auto text-luxury-emerald shadow-[0_0_30px_rgba(16,185,129,0.1)]">
                  <ShieldCheck size={36} className="animate-bounce" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-lg font-black text-white uppercase italic tracking-tighter">Reservation Placed</h3>
                  <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest">
                    Your book reservation was authorized!
                  </p>
                </div>
                <div className="p-4 bg-slate-950/60 border border-slate-850 rounded-xl text-left max-w-xs mx-auto text-[10px] font-bold text-slate-400 space-y-1.5">
                  <p className="uppercase font-black text-slate-500 text-[8px] tracking-widest mb-1.5 border-b border-slate-900 pb-1">Receipt Details</p>
                  <p>BOOK: {selectedBookForReservation.title.toUpperCase()}</p>
                  <p>REQUEST STATUS: PENDING APPROVAL</p>
                </div>
                <button
                  onClick={() => {
                    setSelectedBookForReservation(null);
                    setReservationSuccess(false);
                  }}
                  className="px-6 py-3 bg-slate-900 hover:bg-slate-850 border border-slate-800 rounded-xl text-[9px] font-black uppercase tracking-widest text-slate-400 hover:text-white transition-all mx-auto block"
                >
                  Dismiss Portal
                </button>
              </div>
            )}
          </div>
        )}
      </PortalModal>
      
    </div>
  );
};

export default LibraryStudent;
