import React, { useState, useEffect } from 'react';
import { BookOpen, User, CheckCircle2, XCircle, Clock } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-hot-toast';
import api from '../../utils/axiosInstance';

const LibrarianReservations = () => {
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('pending');

  useEffect(() => {
    fetchReservations();
  }, []);

  const fetchReservations = async () => {
    try {
      const { data } = await api.get('/librarian/reservations');
      setReservations(data);
    } catch (err) {
      toast.error('Failed to sync reservation matrix');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (id, status) => {
    try {
      const { data } = await api.put(`/librarian/reservations/${id}/status`, { status });
      toast.success(data.message);
      setReservations(reservations.map(r => r._id === id ? data.data : r));
    } catch (err) {
      toast.error(err.response?.data?.message || 'Update failed');
    }
  };

  const filteredReservations = reservations.filter(r => filter === 'all' || r.status === filter);

  if (loading) return <div className="p-8 text-center text-slate-400">Loading waitlist nodes...</div>;

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
           <h1 className="text-2xl font-black text-white uppercase tracking-widest italic flex items-center gap-3">
             <BookOpen className="text-librarian-primary" size={28} />
             Volume Waitlist 
           </h1>
           <p className="text-sm text-slate-400 mt-1 uppercase tracking-widest text-[10px]">Manage Member Book Requests</p>
        </div>

        <div className="flex bg-brand-surface border border-brand-border rounded-lg p-1 gap-1">
          {['pending', 'fulfilled', 'cancelled', 'all'].map(f => (
             <button
               key={f}
               onClick={() => setFilter(f)}
               className={`px-4 py-2 rounded-md text-[10px] font-black uppercase tracking-widest transition-all ${
                 filter === f ? 'bg-librarian-primary text-black' : 'text-slate-400 hover:text-white'
               }`}
             >
               {f}
             </button>
          ))}
        </div>
      </div>

      <div className="bg-brand-surface border border-brand-border rounded-xl overflow-hidden relative min-h-[500px]">
         <div className="absolute top-0 right-0 w-32 h-32 bg-librarian-primary/5 rounded-full blur-3xl -mr-10 -mt-10" />

         <div className="p-1">
            <table className="w-full text-left border-collapse relative z-10">
              <thead>
                <tr className="border-b border-brand-border/60 bg-brand-surface">
                   <th className="p-4 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Volume Title</th>
                   <th className="p-4 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Member Node</th>
                   <th className="p-4 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Request Vector</th>
                   <th className="p-4 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                <AnimatePresence>
                  {filteredReservations.map((res) => (
                    <motion.tr key={res._id} initial={{opacity:0}} animate={{opacity:1}} className="border-b border-brand-border/40 hover:bg-white/[0.02] transition-colors">
                       <td className="p-4">
                           <p className="text-sm font-black text-white uppercase tracking-wider">{res.bookId?.title}</p>
                           <p className="text-[10px] text-slate-400 uppercase tracking-widest mt-1">ISBN: {res.bookId?.isbn}</p>
                           <p className="text-[10px] text-librarian-primary uppercase tracking-widest mt-1">Stock Vol: {res.bookId?.availableCopies}</p>
                       </td>
                       <td className="p-4">
                           <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center border border-slate-700">
                                <User size={14} className="text-slate-400" />
                              </div>
                              <div>
                                 <p className="text-sm font-bold text-slate-200">{res.studentId?.firstName} {res.studentId?.lastName}</p>
                                 <p className="text-[10px] text-slate-500 uppercase tracking-widest">{res.studentId?.role}</p>
                              </div>
                           </div>
                       </td>
                       <td className="p-4">
                           <div className="flex items-center gap-2">
                              <Clock size={14} className="text-slate-500" />
                              <span className="text-xs text-slate-300">{new Date(res.requestDate).toLocaleDateString()}</span>
                           </div>
                           <span className={`inline-block mt-2 px-2 py-0.5 rounded text-[9px] uppercase tracking-widest font-black border ${
                              res.status === 'pending' ? 'bg-amber-500/10 text-amber-500 border-amber-500/20' : 
                              res.status === 'fulfilled' ? 'bg-librarian-primary/10 text-librarian-primary border-librarian-primary/20' :
                              'bg-librarian-primary/10 text-librarian-primary border-librarian-primary/20'
                           }`}>
                             {res.status}
                           </span>
                       </td>
                       <td className="p-4 text-right">
                           {res.status === 'pending' && (
                              <div className="flex items-center justify-end gap-2">
                                <button
                                  onClick={() => handleUpdateStatus(res._id, 'fulfilled')}
                                  className="p-1.5 rounded-md hover:bg-librarian-primary/20 text-librarian-primary transition-colors border border-transparent hover:border-librarian-primary/30"
                                  title="Fulfill Request"
                                >
                                  <CheckCircle2 size={16} />
                                </button>
                                <button
                                  onClick={() => handleUpdateStatus(res._id, 'cancelled')}
                                  className="p-1.5 rounded-md hover:bg-librarian-primary/20 text-librarian-primary transition-colors border border-transparent hover:border-librarian-primary/30"
                                  title="Cancel Request"
                                >
                                  <XCircle size={16} />
                                </button>
                              </div>
                           )}
                       </td>
                    </motion.tr>
                  ))}
                </AnimatePresence>
                {filteredReservations.length === 0 && (
                  <tr>
                    <td colSpan="4" className="p-10 text-center text-slate-500 font-outfit uppercase tracking-widest text-xs border-b-0">
                      No active waitlist matrices detected.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
         </div>
      </div>
    </div>
  );
};

export default LibrarianReservations;
