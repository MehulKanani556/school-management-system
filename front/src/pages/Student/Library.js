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
      toast.error('Failed to connect to the Library server');
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

  if (loading) return <div className="p-8 text-center text-slate-400 font-outfit uppercase tracking-widest text-xs italic">Loading Library Records...</div>;

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-20 font-outfit">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 font-outfit">
        <div className="font-outfit">
          <h1 className="text-2xl font-black text-white uppercase tracking-widest italic flex items-center gap-3 font-outfit">
            <LibIcon className="text-brand-primary" size={28} />
            School Library
          </h1>
          <p className="text-sm text-slate-400 mt-1 uppercase tracking-widest text-[10px] italic">Browse books, read e-books, and manage your reservations.</p>
        </div>

        <div className="flex bg-brand-surface border border-brand-border rounded-lg p-1 font-outfit">
          <button
            onClick={() => setActiveTab('catalog')}
            className={`px-4 py-2 rounded-md font-black uppercase tracking-widest text-[10px] transition-all flex items-center gap-2 italic ${
              activeTab === 'catalog' ? 'bg-brand-primary text-white shadow-lg shadow-brand-primary/20' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Book size={14} /> Book Catalog
          </button>
          <button
            onClick={() => setActiveTab('ebooks')}
            className={`px-4 py-2 rounded-md font-black uppercase tracking-widest text-[10px] transition-all flex items-center gap-2 italic ${
              activeTab === 'ebooks' ? 'bg-brand-primary text-white shadow-lg shadow-brand-primary/20' : 'text-slate-400 hover:text-white'
            }`}
          >
            <FileText size={14} /> Digital Resources
          </button>
          <button
            onClick={() => setActiveTab('reservations')}
            className={`px-4 py-2 rounded-md font-black uppercase tracking-widest text-[10px] transition-all flex items-center gap-2 italic ${
              activeTab === 'reservations' ? 'bg-brand-primary text-white shadow-lg shadow-brand-primary/20' : 'text-slate-400 hover:text-white'
            }`}
          >
            <BookmarkPlus size={14} /> My Reservations
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
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 font-outfit"
          >
             {catalogBooks.map(book => (
                <div key={book._id} className="bg-brand-surface border border-brand-border rounded-xl p-5 hover:border-brand-primary/30 transition-colors group relative overflow-hidden flex flex-col font-outfit">
                  {book.availableCopies === 0 && (
                    <div className="absolute top-3 right-3 flex h-3 w-3 font-outfit">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-3 w-3 bg-rose-500"></span>
                    </div>
                  )}
                  
                  <div className="mb-4 font-outfit">
                    <span className="text-[9px] font-black uppercase tracking-widest text-brand-primary bg-brand-primary/10 px-2 py-1 rounded inline-block mb-2 italic">
                       {book.category}
                    </span>
                    <h3 className="text-lg font-bold text-white leading-tight font-outfit italic">{book.title}</h3>
                    <p className="text-xs text-slate-400 uppercase tracking-widest mt-1 italic">By: {book.author}</p>
                  </div>

                  <div className="space-y-2 mb-6 flex-1 font-outfit">
                     <p className="text-[10px] text-slate-500 flex justify-between border-b mx-0 border-brand-border/40 pb-1 italic font-outfit">
                       <span className="font-bold uppercase tracking-widest">ISBN</span>
                       <span className="font-bold">{book.isbn}</span>
                     </p>
                     <p className="text-[10px] text-slate-500 flex justify-between border-b mx-0 border-brand-border/40 pb-1 italic font-outfit">
                       <span className="font-bold uppercase tracking-widest">Availability</span>
                       <span className={`font-bold ${book.availableCopies > 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                         {book.availableCopies} in stock
                       </span>
                     </p>
                  </div>

                  <button
                    onClick={() => handleReserve(book._id)}
                    disabled={book.availableCopies > 0 || reservations.some(r => r.bookId._id === book._id && r.status === 'pending')}
                    className={`w-full py-2.5 rounded-lg text-xs font-black uppercase tracking-widest transition-all italic h-[40px] ${
                       book.availableCopies > 0 
                       ? 'bg-brand-background border border-brand-border text-slate-500 opacity-50 cursor-not-allowed' 
                       : reservations.some(r => r.bookId._id === book._id && r.status === 'pending')
                         ? 'bg-brand-background border border-brand-primary/50 text-brand-primary/50 cursor-not-allowed'
                         : 'bg-brand-primary/10 border border-brand-primary/50 text-brand-primary hover:bg-brand-primary hover:text-white'
                    }`}
                  >
                     {book.availableCopies > 0 
                       ? 'Book Available'
                       : reservations.some(r => r.bookId._id === book._id && r.status === 'pending')
                         ? 'Reservation Processing'
                         : 'Reserve Book'}
                  </button>
                </div>
             ))}
             {catalogBooks.length === 0 && (
                <div className="col-span-full p-12 text-center text-slate-500 bg-brand-surface rounded-xl border border-dashed border-brand-border font-outfit">
                  <LibIcon className="mx-auto mb-3 opacity-20 font-outfit" size={32} />
                  <p className="font-outfit uppercase tracking-widest text-xs italic">No books found in the catalog.</p>
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
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 font-outfit"
          >
             {ebookBooks.map(book => (
                <div key={book._id} className="bg-brand-surface border border-brand-border rounded-xl p-5 hover:border-brand-primary/30 transition-colors group relative overflow-hidden flex flex-col font-outfit">
                  <div className="mb-4 font-outfit">
                    <span className="text-[9px] font-black uppercase tracking-widest text-brand-primary bg-brand-primary/10 px-2 py-1 rounded inline-block mb-2 italic">
                       E-Book
                    </span>
                    <h3 className="text-lg font-bold text-white leading-tight font-outfit italic">{book.title}</h3>
                    <p className="text-xs text-slate-400 uppercase tracking-widest mt-1 italic">By: {book.author}</p>
                  </div>

                  <div className="space-y-2 mb-6 flex-1 font-outfit">
                     <p className="text-[10px] text-slate-500 flex justify-between border-b mx-0 border-brand-border/40 pb-1 italic font-outfit">
                       <span className="font-bold uppercase tracking-widest">Category</span>
                       <span className="font-bold">{book.category}</span>
                     </p>
                     <p className="text-[10px] text-slate-500 flex justify-between border-b mx-0 border-brand-border/40 pb-1 italic font-outfit">
                       <span className="font-bold uppercase tracking-widest">Type</span>
                       <span className="text-emerald-400 font-bold">PDF / E-Pub</span>
                     </p>
                  </div>

                  <a
                    href={book.fileUrl || '#'}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full py-2.5 rounded-lg text-xs font-black uppercase tracking-widest transition-all bg-emerald-500/10 border border-emerald-500/50 text-emerald-400 hover:bg-emerald-500 hover:text-white text-center h-[40px] flex items-center justify-center italic font-outfit"
                  >
                     {book.fileUrl ? 'Read E-Book' : 'File Not Available'}
                  </a>
                </div>
             ))}
             {ebookBooks.length === 0 && (
                <div className="col-span-full p-12 text-center text-slate-500 bg-brand-surface rounded-xl border border-dashed border-brand-border font-outfit">
                  <FileText className="mx-auto mb-3 opacity-20 font-outfit" size={32} />
                  <p className="font-outfit uppercase tracking-widest text-xs italic">No e-books are assigned to your grade.</p>
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
              className="bg-brand-surface border border-brand-border rounded-xl p-1 overflow-hidden font-outfit shadow-2xl"
            >
              <table className="w-full text-left border-collapse font-outfit">
                <thead className="font-outfit">
                  <tr className="border-b border-brand-border/60 font-outfit">
                    <th className="p-4 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 italic">Book Title</th>
                    <th className="p-4 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 italic">Category</th>
                    <th className="p-4 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 italic">Reservation Date</th>
                    <th className="p-4 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 italic">Status</th>
                  </tr>
                </thead>
                <tbody className="font-outfit">
                   <AnimatePresence>
                      {reservations.map(res => (
                         <motion.tr key={res._id} initial={{opacity:0}} animate={{opacity:1}} className="border-b border-brand-border/40 hover:bg-white/[0.02] font-outfit">
                            <td className="p-4 font-outfit">
                               <p className="text-sm font-bold text-slate-200 italic font-outfit">{res.bookId?.title}</p>
                               <p className="text-xs text-slate-500 italic font-outfit">By {res.bookId?.author}</p>
                            </td>
                            <td className="p-4 text-xs font-bold text-slate-400 uppercase tracking-widest italic font-outfit">
                               {res.bookId?.category}
                            </td>
                            <td className="p-4 text-xs font-bold text-slate-400 uppercase tracking-widest italic font-outfit">
                               {new Date(res.requestDate).toLocaleDateString()}
                            </td>
                            <td className="p-4 font-outfit">
                               <span className={`px-2 py-1 rounded text-[9px] uppercase tracking-widest font-black border italic ${
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
                      <tr className="font-outfit">
                        <td colSpan="4" className="p-10 text-center text-slate-500 font-outfit uppercase tracking-widest text-xs border-b-0 italic font-outfit">
                          You have no active book reservations.
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
