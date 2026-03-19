import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchLeaves, updateLeaveStatus } from '../../redux/slice/schoolAdmin.slice';
import { motion } from 'framer-motion';
import { CheckCircle2, XCircle, Clock, CalendarDays, Search, User, FileText, ChevronRight } from 'lucide-react';
import { format, parseISO } from 'date-fns';

const StatusBadge = ({ status }) => {
  const configs = {
    pending: { color: 'text-amber-400 bg-amber-400/10', icon: Clock },
    approved: { color: 'text-emerald-400 bg-emerald-400/10', icon: CheckCircle2 },
    rejected: { color: 'text-rose-400 bg-rose-400/10', icon: XCircle }
  };
  const { color, icon: Icon } = configs[status] || configs.pending;
  return (
    <span className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider ${color}`}>
      <Icon size={12} /> {status}
    </span>
  );
};

const Leaves = () => {
  const dispatch = useDispatch();
  const { leaves, loading } = useSelector((s) => s.schoolAdmin);
  const [filter, setFilter] = useState('all'); // all, pending, approved, rejected
  const [search, setSearch] = useState('');

  useEffect(() => { dispatch(fetchLeaves()); }, [dispatch]);

  const filtered = leaves.filter(l => {
    const matchesSearch = `${l.teacherId?.firstName} ${l.teacherId?.lastName}`.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = filter === 'all' || l.status === filter;
    return matchesSearch && matchesStatus;
  });

  const stats = {
    total: leaves.length,
    pending: leaves.filter(l => l.status === 'pending').length,
    approved: leaves.filter(l => l.status === 'approved').length,
    rejected: leaves.filter(l => l.status === 'rejected').length
  };

  return (
    <div className="space-y-8">
      {/* Header & Stats */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black uppercase tracking-tighter font-outfit text-white">Leave Management</h1>
          <p className="text-slate-400 text-sm mt-1">Review and action teacher leave applications</p>
        </div>
        
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {Object.entries(stats).map(([k, v]) => (
            <div key={k} className="px-5 py-3 rounded-2xl bg-brand-surface/40 border border-brand-border/40 backdrop-blur-xl">
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1">{k}</p>
              <p className="text-xl font-black text-white">{v}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
          <input 
            value={search} 
            onChange={e => setSearch(e.target.value)} 
            placeholder="Search teacher name..."
            className="w-full bg-brand-surface/40 border border-brand-border/40 rounded-2xl py-3.5 pl-11 pr-5 text-white placeholder-slate-600 outline-none focus:border-brand-primary transition-all shadow-inner shadow-black/20" 
          />
        </div>
        <div className="flex p-1.5 bg-brand-surface/60 rounded-2xl border border-brand-border/40">
          {['all', 'pending', 'approved', 'rejected'].map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-5 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${filter === f ? 'bg-brand-primary text-white shadow-lg shadow-blue-600/20' : 'text-slate-500 hover:text-white'}`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Leaves List */}
      <div className="space-y-4">
        {loading && leaves.length === 0 ? (
          <div className="py-20 text-center text-slate-500 font-bold uppercase tracking-widest animate-pulse">Synchronizing Data...</div>
        ) : filtered.length === 0 ? (
          <div className="py-20 text-center bg-brand-surface/20 border border-dashed border-brand-border/40 rounded-[2.5rem]">
            <CalendarDays size={48} className="mx-auto text-slate-700 mb-4 opacity-40" />
            <p className="text-slate-500 font-medium">No leave applications matches your filters</p>
          </div>
        ) : (
          filtered.map((l, i) => (
            <motion.div
              key={l._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="bg-brand-surface/40 backdrop-blur-xl border border-brand-border/30 rounded-[2.5rem] p-6 lg:p-8 hover:border-brand-primary/40 transition-all group shadow-xl shadow-black/20"
            >
              <div className="flex flex-col lg:flex-row gap-8">
                {/* Left: Teacher Info & Status */}
                <div className="lg:w-1/4 flex lg:flex-col justify-between border-b lg:border-b-0 lg:border-r border-brand-border/30 pb-6 lg:pb-0 lg:pr-8">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-slate-800 to-slate-950 flex items-center justify-center border border-white/5 shadow-lg group-hover:scale-110 transition-transform">
                      <User size={20} className="text-slate-400" />
                    </div>
                    <div>
                      <h3 className="font-black text-white uppercase tracking-tighter leading-none mb-1">{l.teacherId?.firstName} {l.teacherId?.lastName}</h3>
                      <p className="text-[10px] text-slate-500 font-black tracking-widest uppercase">{l.teacherId?.employeeId}</p>
                    </div>
                  </div>
                  <div className="mt-auto pt-4 flex flex-col gap-2">
                    <StatusBadge status={l.status} />
                    <p className="text-[9px] text-slate-600 font-bold uppercase tracking-widest pl-1">Applied {format(parseISO(l.createdAt), 'dd MMM, yyyy')}</p>
                  </div>
                </div>

                {/* Middle: Leave Details */}
                <div className="flex-1 space-y-4">
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                    <div>
                      <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">Type</p>
                      <p className="text-sm font-bold text-white capitalize">{l.type}</p>
                    </div>
                    <div>
                      <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">Start Date</p>
                      <p className="text-sm font-bold text-slate-200">{format(parseISO(l.startDate), 'dd MMM, yyyy')}</p>
                    </div>
                    <div>
                      <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">End Date</p>
                      <p className="text-sm font-bold text-slate-200">{format(parseISO(l.endDate), 'dd MMM, yyyy')}</p>
                    </div>
                  </div>
                  <div>
                    <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">Reason for Leave</p>
                    <p className="text-sm text-slate-400 italic leading-relaxed bg-brand-background/40 p-4 rounded-2xl border border-white/5">"{l.reason || 'No reason provided'}"</p>
                  </div>
                </div>

                {/* Right: Actions */}
                <div className="flex lg:flex-col justify-center gap-3 lg:w-48">
                  {l.status === 'pending' ? (
                    <>
                      <button 
                        onClick={() => dispatch(updateLeaveStatus({ id: l._id, data: { status: 'approved' } }))}
                        className="flex-1 py-3.5 rounded-2xl bg-emerald-500/10 hover:bg-emerald-500 text-emerald-500 hover:text-white border border-emerald-500/20 font-black text-[10px] uppercase tracking-widest transition-all active:scale-95"
                      >
                        Approve
                      </button>
                      <button 
                        onClick={() => dispatch(updateLeaveStatus({ id: l._id, data: { status: 'rejected' } }))}
                        className="flex-1 py-3.5 rounded-2xl bg-rose-500/10 hover:bg-rose-500 text-rose-500 hover:text-white border border-rose-500/20 font-black text-[10px] uppercase tracking-widest transition-all active:scale-95"
                      >
                        Reject
                      </button>
                    </>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-4 px-6 rounded-2xl bg-slate-900/40 border border-white/5 text-center">
                       <p className="text-[9px] font-black text-slate-600 uppercase tracking-[0.2em] mb-1 italic">Handled by Admin</p>
                       <p className="text-[10px] font-bold text-slate-500">{format(parseISO(l.updatedAt), 'dd MMM, hh:mm a')}</p>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
};

export default Leaves;
