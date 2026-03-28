import React, { useState, useEffect } from 'react';
import { Newspaper, BellRing, Paperclip } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../../utils/axiosInstance';

const LibrarianAnnouncements = () => {
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const fetchAnnouncements = async () => {
    try {
      const { data } = await api.get('/announcements?role=Librarian');
      setAnnouncements(Array.isArray(data) ? data : (data.announcements || []));
    } catch (err) {
      console.error(err);
      setAnnouncements([]);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="p-8 text-center text-slate-400">Decrypting Global Broadcasts...</div>;

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-white uppercase tracking-widest italic flex items-center gap-3">
            <Newspaper className="text-librarian-primary" size={28} />
            Institutional Directives
          </h1>
          <p className="text-sm text-slate-400 mt-1 uppercase tracking-widest text-[10px]">Global Announcements Broadcast</p>
        </div>
      </div>

       <div className="grid gap-4 md:grid-cols-2">
        <AnimatePresence>
           {announcements.map((item, index) => (
             <motion.div 
               key={item._id}
               initial={{opacity: 0, y: 15}}
               animate={{opacity: 1, y: 0}}
               transition={{ delay: index * 0.05 }}
               className="bg-brand-surface border border-brand-border rounded-xl p-5 hover:border-librarian-primary/50 transition-colors group flex flex-col"
              >
                  <div className="flex justify-between items-start mb-3">
                    <h3 className="text-sm font-black text-white uppercase tracking-wider group-hover:text-librarian-primary transition-colors flex-1 pr-4 leading-snug">
                       {item.subject}
                    </h3>
                    <div className="flex-shrink-0 bg-brand-background border border-brand-border rounded px-2 py-1 flex items-center gap-1.5">
                       <BellRing size={10} className="text-librarian-primary" />
                       <span className="text-[9px] font-black uppercase text-librarian-primary tracking-widest">
                         {new Date(item.createdAt).toLocaleDateString()}
                       </span>
                    </div>
                  </div>
                  
                  <p className="text-slate-400 text-xs mb-4 flex-1 leading-relaxed">
                     {item.content}
                  </p>
                  
                  <div className="flex items-center justify-between mt-auto pt-4 border-t border-brand-border/40">
                      <div className="flex items-center gap-2">
                         <div className="w-5 h-5 rounded-full bg-slate-800 flex items-center justify-center font-bold text-[8px] text-slate-300">
                           {item.sender?.firstName?.charAt(0) || 'A'}
                         </div>
                         <span className="text-[10px] text-slate-500 uppercase tracking-widest font-black italic">
                           {item.sender?.firstName} {item.sender?.lastName}
                         </span>
                      </div>
                      
                      {item.fileUrl && (
                        <a href={item.fileUrl} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest bg-librarian-primary/10 text-librarian-primary px-3 py-1.5 rounded hover:bg-librarian-primary hover:text-black transition-colors">
                           <Paperclip size={12} /> Resource Attached
                        </a>
                      )}
                  </div>
             </motion.div>
           ))}
        </AnimatePresence>
        {announcements.length === 0 && (
            <div className="col-span-2 p-12 text-center text-slate-500 border border-dashed border-brand-border/50 rounded-xl">
               <Newspaper size={32} className="mx-auto mb-3 opacity-20" />
               <p className="text-xs uppercase tracking-widest font-black">No Recent Broadcasts Intercepted</p>
            </div>
        )}
       </div>
    </div>
  );
};

export default LibrarianAnnouncements;
