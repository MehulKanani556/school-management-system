import React, { useState, useEffect } from 'react';
import { Book, BookmarkPlus, Library as LibIcon, FileText } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-hot-toast';
import api from '../../utils/axiosInstance';

const LibraryStudent = () => {
  const [books, setBooks] = useState([]);
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('catalog'); // catalog, reservations, ebooks

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
      toast.error('Failed to connect to the Library Server');
    } finally {
      setLoading(false);
    }
  };

  const handleReserve = async (bookId) => {
    try {
      const { data } = await api.post('/student/library/reserve', { bookId });
      toast.success(data.message);
      // Refresh reservations
      const resRes = await api.get('/student/library/reservations');
      setReservations(resRes.data);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to place reservation');
    }
  };

  const catalogBooks = books.filter(b => (b.type || 'Physical') === 'Physical');
  const ebookBooks = books.filter(b => b.type === 'E-Book');

  if (loading) return <div className="p-8 text-center text-slate-400 font-outfit uppercase tracking-widest text-xs">Syncing with Central Library...</div>;

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white uppercase tracking-widest italic flex items-center gap-3">
            <LibIcon className="text-blue-500" size={28} />
            Digital Library Access
          </h1>
          <p className="text-sm text-slate-400 mt-1 uppercase tracking-widest text-[10px]">Browse Volumes & Manage Waitlists</p>
        </div>

        <div className="flex bg-brand-surface border border-brand-border rounded-lg p-1">
          <button
            onClick={() => setActiveTab('catalog')}
            className={`px-4 py-2 rounded-md font-black uppercase tracking-widest text-[10px] transition-all flex items-center gap-2 ${
              activeTab === 'catalog' ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/20' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Book size={14} /> Catalog
          </button>
          <button
            onClick={() => setActiveTab('ebooks')}
            className={`px-4 py-2 rounded-md font-black uppercase tracking-widest text-[10px] transition-all flex items-center gap-2 ${
              activeTab === 'ebooks' ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/20' : 'text-slate-400 hover:text-white'
            }`}
          >
            <FileText size={14} /> E-Books
          </button>
          <button
            onClick={() => setActiveTab('reservations')}
            className={`px-4 py-2 rounded-md font-black uppercase tracking-widest text-[10px] transition-all flex items-center gap-2 ${
              activeTab === 'reservations' ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/20' : 'text-slate-400 hover:text-white'
            }`}
          >
            <BookmarkPlus size={14} /> My Waitlists
            {reservations.length > 0 && (
              <span className="ml-1 bg-white/20 px-1.5 py-0.5 rounded text-[8px]">{reservations.length}</span>
            )}
          </button>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {activeTab === 'catalog' && (
          <motion.div
            key="catalog"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
             {catalogBooks.map(book => (
                <div key={book._id} className="bg-brand-surface border border-brand-border rounded-xl p-5 hover:border-blue-500/30 transition-colors group relative overflow-hidden flex flex-col">
                  {book.availableCopies === 0 && (
                    <div className="absolute top-3 right-3 flex h-3 w-3">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-3 w-3 bg-rose-500"></span>
                    </div>
                  )}
                  
                  <div className="mb-4">
                    <span className="text-[9px] font-black uppercase tracking-widest text-blue-500 bg-blue-500/10 px-2 py-1 rounded inline-block mb-2">
                       {book.category}
                    </span>
                    <h3 className="text-lg font-bold text-white leading-tight">{book.title}</h3>
                    <p className="text-xs text-slate-400 uppercase tracking-widest mt-1">Author: {book.author}</p>
                  </div>

                  <div className="space-y-2 mb-6 flex-1">
                     <p className="text-[10px] text-slate-500 flex justify-between border-b mx-0 border-brand-border/40 pb-1">
                       <span className="font-bold uppercase tracking-widest">ISBN</span>
                       <span>{book.isbn}</span>
                     </p>
                     <p className="text-[10px] text-slate-500 flex justify-between border-b mx-0 border-brand-border/40 pb-1">
                       <span className="font-bold uppercase tracking-widest">Stock Level</span>
                       <span className={book.availableCopies > 0 ? 'text-emerald-500' : 'text-rose-500'}>
                         {book.availableCopies} available
                       </span>
                     </p>
                  </div>

                  <button
                    onClick={() => handleReserve(book._id)}
                    disabled={book.availableCopies > 0 || reservations.some(r => r.bookId._id === book._id && r.status === 'pending')}
                    className={`w-full py-2.5 rounded-lg text-xs font-black uppercase tracking-widest transition-all ${
                       book.availableCopies > 0 
                       ? 'bg-brand-background border border-brand-border text-slate-500 opacity-50 cursor-not-allowed' 
                       : reservations.some(r => r.bookId._id === book._id && r.status === 'pending')
                         ? 'bg-brand-background border border-blue-500/50 text-blue-500/50 cursor-not-allowed'
                         : 'bg-blue-500/10 border border-blue-500/50 text-blue-400 hover:bg-blue-500 hover:text-white'
                    }`}
                  >
                     {book.availableCopies > 0 
                       ? 'Available to Borrow'
                       : reservations.some(r => r.bookId._id === book._id && r.status === 'pending')
                         ? 'Waitlist Pending'
                         : 'Request Waitlist'}
                  </button>
                </div>
             ))}
             {catalogBooks.length === 0 && (
                <div className="col-span-full p-12 text-center text-slate-500 bg-brand-surface rounded-xl border border-dashed border-brand-border">
                  <LibIcon className="mx-auto mb-3 opacity-20" size={32} />
                  <p className="font-outfit uppercase tracking-widest text-xs">No volumes cataloged in database.</p>
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
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
             {ebookBooks.map(book => (
                <div key={book._id} className="bg-brand-surface border border-brand-border rounded-xl p-5 hover:border-blue-500/30 transition-colors group relative overflow-hidden flex flex-col">
                  <div className="mb-4">
                    <span className="text-[9px] font-black uppercase tracking-widest text-purple-500 bg-purple-500/10 px-2 py-1 rounded inline-block mb-2">
                       Digital Resource
                    </span>
                    <h3 className="text-lg font-bold text-white leading-tight">{book.title}</h3>
                    <p className="text-xs text-slate-400 uppercase tracking-widest mt-1">Author: {book.author}</p>
                  </div>

                  <div className="space-y-2 mb-6 flex-1">
                     <p className="text-[10px] text-slate-500 flex justify-between border-b mx-0 border-brand-border/40 pb-1">
                       <span className="font-bold uppercase tracking-widest">Category</span>
                       <span>{book.category}</span>
                     </p>
                     <p className="text-[10px] text-slate-500 flex justify-between border-b mx-0 border-brand-border/40 pb-1">
                       <span className="font-bold uppercase tracking-widest">Type</span>
                       <span className="text-purple-400">PDF / E-Pub</span>
                     </p>
                  </div>

                  <a
                    href={book.fileUrl || '#'}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full py-2.5 rounded-lg text-xs font-black uppercase tracking-widest transition-all bg-purple-500/10 border border-purple-500/50 text-purple-400 hover:bg-purple-500 hover:text-white text-center"
                  >
                     {book.fileUrl ? 'View Digital Volume' : 'Resource Pending'}
                  </a>
                </div>
             ))}
             {ebookBooks.length === 0 && (
                <div className="col-span-full p-12 text-center text-slate-500 bg-brand-surface rounded-xl border border-dashed border-brand-border">
                  <FileText className="mx-auto mb-3 opacity-20" size={32} />
                  <p className="font-outfit uppercase tracking-widest text-xs">No digital volumes assigned to your matrix.</p>
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
              className="bg-brand-surface border border-brand-border rounded-xl p-1 overflow-hidden"
            >
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-brand-border/60">
                    <th className="p-4 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Volume Title</th>
                    <th className="p-4 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Category</th>
                    <th className="p-4 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Date Requested</th>
                    <th className="p-4 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Status</th>
                  </tr>
                </thead>
                <tbody>
                   <AnimatePresence>
                      {reservations.map(res => (
                         <motion.tr key={res._id} initial={{opacity:0}} animate={{opacity:1}} className="border-b border-brand-border/40 hover:bg-white/[0.02]">
                            <td className="p-4">
                               <p className="text-sm font-bold text-slate-200">{res.bookId?.title}</p>
                               <p className="text-xs text-slate-500">{res.bookId?.author}</p>
                            </td>
                            <td className="p-4 text-xs font-bold text-slate-400 uppercase tracking-widest">
                               {res.bookId?.category}
                            </td>
                            <td className="p-4 text-xs font-bold text-slate-400 uppercase tracking-widest">
                               {new Date(res.requestDate).toLocaleDateString()}
                            </td>
                            <td className="p-4">
                               <span className={`px-2 py-1 rounded text-[9px] uppercase tracking-widest font-black border ${
                                  res.status === 'pending' ? 'bg-amber-500/10 text-amber-500 border-amber-500/20' : 
                                  res.status === 'fulfilled' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' :
                                  'bg-rose-500/10 text-rose-500 border-rose-500/20'
                               }`}>
                                 {res.status}
                               </span>
                            </td>
                         </motion.tr>
                      ))}
                   </AnimatePresence>
                   {reservations.length === 0 && (
                      <tr>
                        <td colSpan="4" className="p-10 text-center text-slate-500 font-outfit uppercase tracking-widest text-xs border-b-0">
                          You have no active waitlist requests.
                        </td>
                      </tr>
                   )}
                </tbody>
              </table>
           </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default LibraryStudent;
