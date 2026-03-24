import React, { useState, useEffect } from 'react';
import { Calendar, Filter, CalendarCheck } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../../utils/axiosInstance';

const LibrarianHolidays = () => {
  const [holidays, setHolidays] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('upcoming'); // upcoming, past, all
  const [currentDate] = useState(new Date());

  useEffect(() => {
    fetchHolidays();
  }, []);

  const fetchHolidays = async () => {
    try {
      const { data } = await api.get('/holidays');
      setHolidays(data.holidays || data || []);
    } catch (err) {
      console.error(err);
      setHolidays([]);
    } finally {
      setLoading(false);
    }
  };

  const getFilteredHolidays = () => {
    return (Array.isArray(holidays) ? holidays : []).filter(holiday => {
      const holidayDate = new Date(holiday.startDate);
      if (filter === 'upcoming') return holidayDate >= currentDate;
      if (filter === 'past') return holidayDate < currentDate;
      return true;
    }).sort((a, b) => new Date(a.startDate) - new Date(b.startDate));
  };

  if (loading) return <div className="p-8 text-center text-slate-400">Mapping Calendar Nodes...</div>;

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-white uppercase tracking-widest italic flex items-center gap-3">
            <Calendar className="text-librarian-primary" size={28} />
            Institutional Calendar
          </h1>
          <p className="text-sm text-slate-400 mt-1 uppercase tracking-widest text-[10px]">Academic Term Pauses</p>
        </div>

        <div className="flex items-center gap-2 bg-brand-surface border border-brand-border p-1 rounded-md">
          {['upcoming', 'past', 'all'].map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-1.5 rounded-md text-[10px] font-black uppercase tracking-widest transition-all ${filter === f ? 'bg-librarian-primary text-black' : 'text-slate-400 hover:text-white'}`}
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
                   <th className="p-4 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Date Vector</th>
                   <th className="p-4 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Directive / Title</th>
                   <th className="p-4 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Type Category</th>
                </tr>
              </thead>
              <tbody>
                <AnimatePresence>
                  {getFilteredHolidays().map((holiday) => (
                    <motion.tr key={holiday._id} initial={{opacity:0}} animate={{opacity:1}} className="border-b border-brand-border/40 hover:bg-white/[0.02] transition-colors group">
                        <td className="p-4">
                           <div className="flex flex-col">
                             <span className="text-white font-black uppercase text-sm font-outfit tracking-wider">
                                {new Date(holiday.startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                             </span>
                             <span className="text-librarian-primary text-[10px] uppercase font-bold tracking-widest mt-0.5 group-hover:opacity-100 opacity-60 transition-opacity">
                                {new Date(holiday.startDate).toLocaleDateString('en-US', { weekday: 'long' })}
                             </span>
                           </div>
                        </td>
                        <td className="p-4">
                           <div className="flex items-center gap-2">
                             <span className="w-1.5 h-1.5 rounded-full bg-librarian-primary"></span>
                             <span className="text-sm font-bold text-slate-200">{holiday.title}</span>
                           </div>
                           {holiday.description && <p className="text-xs text-slate-500 mt-1 pl-3.5 italic">{holiday.description}</p>}
                        </td>
                        <td className="p-4">
                           <span className="px-2 py-1 rounded bg-slate-800 text-slate-300 border border-slate-700 text-[10px] uppercase tracking-widest font-black">
                             {new Date(holiday.endDate).toLocaleDateString()}
                           </span>
                        </td>
                    </motion.tr>
                  ))}
                </AnimatePresence>
                {getFilteredHolidays().length === 0 && (
                  <tr>
                    <td colSpan="3" className="p-10 text-center text-slate-500 font-outfit uppercase tracking-widest text-xs">
                      No matching dates found in the schedule.
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

export default LibrarianHolidays;
