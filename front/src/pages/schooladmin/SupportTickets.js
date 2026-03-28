import React, { useEffect, useState, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchTickets, fetchTicketDetail, createTicketAction, addTicketReply, updateTicketStatus, clearMessage } from '../../redux/slice/schoolAdmin.slice';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  LifeBuoy, Search, Filter, Plus, ChevronRight, Clock, CheckCircle2, 
  AlertCircle, Send, User, Calendar, Tag, MoreVertical, X, 
  MessageSquare, Hash, Zap, ShieldCheck, ArrowLeft, Loader2
} from 'lucide-react';
import { format } from 'date-fns';
import { useSocket } from '../../context/SocketContext';

const StatusBadge = ({ status }) => {
  const styles = {
    Open: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
    In_Progress: 'bg-amber-500/10 text-amber-500 border-amber-500/20',
    Resolved: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
    Closed: 'bg-slate-500/10 text-slate-500 border-slate-500/20',
  };
  return (
    <span className={`px-2 py-1 rounded-md text-[10px] font-black uppercase tracking-widest border ${styles[status] || styles.Open}`}>
      {status.replace('_', ' ')}
    </span>
  );
};

const PriorityBadge = ({ priority }) => {
  const styles = {
    Low: 'text-slate-500',
    Medium: 'text-blue-400',
    High: 'text-orange-500',
    Urgent: 'text-rose-500 animate-pulse',
  };
  return (
    <span className={`flex items-center gap-1 text-[10px] font-black uppercase tracking-tighter ${styles[priority]}`}>
      <Zap size={10} fill={priority === 'Urgent' ? 'currentColor' : 'none'} /> {priority}
    </span>
  );
};

const SupportTickets = () => {
  const dispatch = useDispatch();
  const { socket, isConnected } = useSocket();
  const { tickets, selectedTicket, loading, message, error } = useSelector((s) => s.schoolAdmin);
  const { user } = useSelector((s) => s.auth);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [replyMessage, setReplyMessage] = useState('');
  const [newTicket, setNewTicket] = useState({ subject: '', description: '', priority: 'Medium', category: 'Technical' });
  
  const scrollRef = useRef(null);

  useEffect(() => {
    dispatch(fetchTickets());
  }, [dispatch]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [selectedTicket?.replies]);

  const handleCreateTicket = (e) => {
    e.preventDefault();
    dispatch(createTicketAction(newTicket)).then((res) => {
      if (!res.error) {
        setIsModalOpen(false);
        setNewTicket({ subject: '', description: '', priority: 'Medium', category: 'Technical' });
      }
    });
  };

  const handleSendReply = (e) => {
    e.preventDefault();
    if (!replyMessage.trim()) return;
    dispatch(addTicketReply({ id: selectedTicket._id, message: replyMessage }));
    setReplyMessage('');
  };

  const handleStatusUpdate = (status) => {
    dispatch(updateTicketStatus({ id: selectedTicket._id, status }));
  };

  const filteredTickets = tickets.filter(t => 
    t.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="h-[calc(100vh-120px)] flex flex-col gap-6 font-outfit">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-2 h-8 bg-brand-primary rounded-md shadow-[0_0_15px_rgba(37,99,235,0.5)]" />
            <h1 className="text-4xl font-black uppercase tracking-tighter text-white">
              Ticket Support
            </h1>
            <div className={`flex items-center gap-1.5 ml-4 px-2 py-1 rounded border ${isConnected ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500' : 'bg-rose-500/10 border-rose-500/20 text-rose-500'}`}>
              <div className={`w-1.5 h-1.5 rounded-full ${isConnected ? 'bg-emerald-500 shadow-[0_0_5px_#10b981]' : 'bg-rose-500'} animate-pulse`} />
              <span className="text-[8px] font-black uppercase tracking-[0.1em]">{isConnected ? 'Signal Active' : 'Offline'}</span>
            </div>
          </div>
          <p className="text-slate-400 font-medium">Help center and institutional query resolution node.</p>
        </motion.div>

        <div className="flex gap-3">
          <div className="relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-brand-primary transition-colors" size={18} />
            <input 
              type="text" 
              placeholder="Filter nodes..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-12 pr-6 py-3 bg-brand-surface/40 backdrop-blur-xl border border-brand-border/30 rounded-md text-white placeholder-slate-500 focus:outline-none focus:border-brand-primary/50 transition-all w-full lg:w-64"
            />
          </div>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-3 px-6 py-3 bg-brand-primary hover:bg-schooladmin-primary text-white rounded-md transition-all shadow-lg shadow-brand-primary/20 active:scale-95 group font-black uppercase tracking-widest text-[10px]"
          >
            <Plus size={16} className="group-hover:rotate-90 transition-transform" /> Initialize Node
          </button>
        </div>
      </div>

      <div className="flex-1 flex gap-6 overflow-hidden">
        {/* Sidebar: Ticket List */}
        <div className={`w-full lg:w-96 flex flex-col gap-4 overflow-hidden ${selectedTicket ? 'hidden lg:flex' : 'flex'}`}>
           <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar space-y-3">
              {filteredTickets.map((t, i) => (
                <motion.div
                  key={t._id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  onClick={() => dispatch(fetchTicketDetail(t._id))}
                  className={`p-5 rounded-md border cursor-pointer transition-all duration-300 group ${
                    selectedTicket?._id === t._id 
                    ? 'bg-brand-primary/10 border-brand-primary shadow-lg shadow-brand-primary/5' 
                    : 'bg-brand-surface/20 border-brand-border/20 hover:border-brand-border/50'
                  }`}
                >
                  <div className="flex justify-between items-start mb-3">
                    <StatusBadge status={t.status} />
                    <PriorityBadge priority={t.priority} />
                  </div>
                  <h4 className={`text-sm font-black mb-1 transition-colors ${selectedTicket?._id === t._id ? 'text-white' : 'text-slate-300 group-hover:text-white'}`}>
                    {t.subject}
                  </h4>
                  {user?.role === 'School_Admin' && (
                    <p className="text-[10px] text-slate-500 mb-2 font-medium italic">
                      By: {t.openedBy?.firstName} {t.openedBy?.lastName} ({t.openedBy?.role})
                    </p>
                  )}
                  <div className="flex items-center justify-between text-[10px] text-slate-500 uppercase font-bold tracking-widest border-t border-brand-border/10 pt-2 transform group-hover:translate-x-1 transition-transform">
                    <div className="flex items-center gap-2">
                       <Tag size={12} className="text-brand-primary" /> {t.category}
                    </div>
                    <span>{t.updatedAt ? format(new Date(t.updatedAt), 'dd MMM') : 'N/A'}</span>
                  </div>
                </motion.div>
              ))}
              {filteredTickets.length === 0 && (
                <div className="flex flex-col items-center justify-center py-20 text-center opacity-40">
                  <LifeBuoy size={48} className="text-slate-500 mb-4" />
                  <p className="text-sm font-medium text-slate-400">No support nodes detected.</p>
                </div>
              )}
           </div>
        </div>

        {/* Main: Ticket Details & Chat */}
        <div className={`flex-1 bg-brand-surface/20 backdrop-blur-xl border border-brand-border/20 rounded-md overflow-hidden flex flex-col ${!selectedTicket ? 'hidden lg:flex' : 'flex'}`}>
           {selectedTicket ? (
             <>
               {/* Detail Header */}
               <div className="p-6 border-b border-brand-border/20 flex items-center justify-between bg-white/5">
                 <div className="flex items-center gap-4">
                   <button onClick={() => dispatch({ type: 'sa/clearSelectedTicket' })} className="lg:hidden p-2 hover:bg-white/10 rounded-md">
                     <ArrowLeft size={20} className="text-white" />
                   </button>
                   <div>
                      <div className="flex items-center gap-3 mb-1">
                         <h2 className="text-lg font-black text-white tracking-tight">{selectedTicket.subject}</h2>
                         <StatusBadge status={selectedTicket.status} />
                      </div>
                      <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                        Node ID: {selectedTicket._id?.slice(-8).toUpperCase()} • Category: {selectedTicket.category}
                      </p>
                   </div>
                 </div>
                 <div className="flex gap-2">
                    {selectedTicket.status !== 'Resolved' && (
                      <button 
                        onClick={() => handleStatusUpdate('Resolved')}
                        className="p-2 hover:bg-emerald-500/10 text-emerald-500 rounded-md transition-colors border border-transparent hover:border-emerald-500/20"
                        title="Mark as Resolved"
                      >
                        <CheckCircle2 size={20} />
                      </button>
                    )}
                    {selectedTicket.status !== 'Closed' && (
                      <button 
                        onClick={() => handleStatusUpdate('Closed')}
                        className="p-2 hover:bg-rose-500/10 text-rose-500 rounded-md transition-colors border border-transparent hover:border-rose-500/20"
                        title="Close Ticket"
                      >
                        <X size={20} />
                      </button>
                    )}
                 </div>
               </div>

               {/* Thread */}
               <div ref={scrollRef} className="flex-1 overflow-y-auto p-8 space-y-8 custom-scrollbar bg-black/10">
                  {/* Original Content */}
                  <div className="flex gap-4">
                    <div className="w-10 h-10 rounded-md bg-slate-800 border border-brand-border/30 flex items-center justify-center flex-shrink-0">
                      {selectedTicket.openedBy?.photo ? (
                        <img src={selectedTicket.openedBy.photo} alt="" className="w-full h-full object-cover rounded-md" />
                      ) : (
                        <User size={18} className="text-slate-500" />
                      )}
                    </div>
                    <div className="flex-1 max-w-2xl">
                       <div className="flex items-center gap-3 mb-2">
                         <span className="text-xs font-black text-white">{selectedTicket.openedBy?.firstName} {selectedTicket.openedBy?.lastName}</span>
                         <span className="px-1.5 py-0.5 rounded bg-slate-800 text-[8px] font-black uppercase text-slate-500 tracking-widest">{selectedTicket.openedBy?.role}</span>
                         <span className="text-[10px] font-medium text-slate-600">{selectedTicket.createdAt ? format(new Date(selectedTicket.createdAt), 'hh:mm a') : 'N/A'}</span>
                       </div>
                       <div className="p-5 rounded-md rounded-tl-none bg-slate-900 border border-brand-border/20 text-slate-300 text-sm leading-relaxed shadow-xl">
                          {selectedTicket.description}
                       </div>
                    </div>
                  </div>

                  {/* Replies */}
                  {selectedTicket.replies?.map((reply, i) => {
                    const isOwnMessage = (reply.senderId?._id || reply.senderId)?.toString() === user?._id?.toString();
                    return (
                      <motion.div 
                        key={i}
                        initial={{ opacity: 0, scale: 0.98 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className={`flex gap-4 ${isOwnMessage ? 'flex-row-reverse' : ''}`}
                      >
                        <div className={`w-10 h-10 rounded-md border flex items-center justify-center flex-shrink-0 ${
                          isOwnMessage ? 'bg-brand-primary/20 border-brand-primary/30' : 'bg-slate-800 border-brand-border/30'
                        }`}>
                          {reply.senderId?.photo ? (
                            <img src={reply.senderId.photo} alt="" className="w-full h-full object-cover rounded-md" />
                          ) : (
                            <User size={18} className={isOwnMessage ? 'text-brand-primary' : 'text-slate-500'} />
                          )}
                        </div>
                        <div className={`flex flex-col max-w-2xl ${isOwnMessage ? 'items-end' : ''}`}>
                         <div className="flex items-center gap-3 mb-2">
                           <span className="text-xs font-black text-white">{reply.senderId?.firstName} {reply.senderId?.lastName}</span>
                           <span className="text-[10px] font-medium text-slate-600">{reply.createdAt ? format(new Date(reply.createdAt), 'hh:mm a') : 'N/A'}</span>
                         </div>
                         <div className={`p-4 rounded-md text-sm leading-relaxed shadow-lg border ${
                           isOwnMessage 
                           ? 'bg-brand-primary/10 border-brand-primary/20 rounded-tr-none text-slate-200' 
                           : 'bg-slate-900 border-brand-border/20 rounded-tl-none text-slate-300'
                         }`}>
                            {reply.message}
                         </div>
                      </div>
                      </motion.div>
                    );
                  })}
               </div>

               {/* Input Area */}
               {selectedTicket.status !== 'Closed' && selectedTicket.status !== 'Resolved' ? (
                 <form onSubmit={handleSendReply} className="p-6 border-t border-brand-border/20 bg-white/5 flex gap-4">
                    <input 
                      type="text" 
                      placeholder="Dispatch strategic response..."
                      value={replyMessage}
                      onChange={(e) => setReplyMessage(e.target.value)}
                      className="flex-1 bg-slate-900 border border-brand-border/30 rounded-md px-6 py-4 text-white focus:outline-none focus:border-brand-primary/50 transition-all text-sm"
                    />
                    <button 
                      type="submit"
                      disabled={!replyMessage.trim()}
                      className="p-4 bg-brand-primary hover:bg-schooladmin-primary text-white rounded-md transition-all shadow-lg shadow-brand-primary/20 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed group"
                    >
                      <Send size={20} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                    </button>
                 </form>
               ) : (
                 <div className="p-6 border-t border-brand-border/20 bg-black/40 flex items-center justify-center gap-2 text-slate-500 font-black uppercase tracking-[0.2em] text-[10px]">
                   <ShieldCheck size={14} /> Communication cycle terminated - Record Archived
                 </div>
               )}
             </>
           ) : (
             <div className="flex-1 flex flex-col items-center justify-center text-center opacity-40 p-12">
                <div className="relative mb-8">
                   <div className="absolute inset-0 bg-brand-primary/20 blur-3xl rounded-full" />
                   <MessageSquare size={80} className="text-slate-500 relative" />
                </div>
                <h3 className="text-xl font-black text-white mb-2 uppercase tracking-tighter">Command Center</h3>
                <p className="max-w-xs text-sm text-slate-400 font-medium">Select a support node from the registry to interface with the resolution thread.</p>
             </div>
           )}
        </div>
      </div>

      {/* New Ticket Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/80 backdrop-blur-md"
          >
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="w-full max-w-xl bg-brand-surface border border-brand-border/50 rounded-md overflow-hidden shadow-2xl"
            >
              <div className="p-8 border-b border-brand-border/30 flex justify-between items-center bg-white/5">
                <div className="flex items-center gap-3">
                   <div className="p-2 rounded bg-brand-primary/10 border border-brand-primary/20">
                    <LifeBuoy size={20} className="text-brand-primary" />
                  </div>
                  <h3 className="text-xl font-black text-white uppercase tracking-tighter">Initialize Support Node</h3>
                </div>
                <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-white/10 rounded-md transition-colors">
                  <X size={20} className="text-slate-500" />
                </button>
              </div>

              <form onSubmit={handleCreateTicket} className="p-8 space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Subject</label>
                  <input 
                    required
                    type="text" 
                    placeholder="Brief objective title..."
                    className="w-full bg-slate-900 border border-brand-border/30 rounded-md px-4 py-3 text-white focus:outline-none focus:border-brand-primary/50 transition-all font-medium"
                    value={newTicket.subject}
                    onChange={(e) => setNewTicket({...newTicket, subject: e.target.value})}
                  />
                </div>

                <div className="grid grid-cols-2 gap-6">
                   <div className="space-y-2">
                     <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Priority Tier</label>
                     <select 
                       className="w-full bg-slate-900 border border-brand-border/30 rounded-md px-4 py-3 text-white focus:outline-none focus:border-brand-primary/50 transition-all font-bold uppercase text-[10px] tracking-widest"
                       value={newTicket.priority}
                       onChange={(e) => setNewTicket({...newTicket, priority: e.target.value})}
                     >
                       <option>Low</option>
                       <option>Medium</option>
                       <option>High</option>
                       <option>Urgent</option>
                     </select>
                   </div>
                   <div className="space-y-2">
                     <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Node Category</label>
                     <select 
                       className="w-full bg-slate-900 border border-brand-border/30 rounded-md px-4 py-3 text-white focus:outline-none focus:border-brand-primary/50 transition-all font-bold uppercase text-[10px] tracking-widest"
                       value={newTicket.category}
                       onChange={(e) => setNewTicket({...newTicket, category: e.target.value})}
                     >
                       <option>Technical</option>
                       <option>Billing</option>
                       <option>Feature_Request</option>
                       <option>Account</option>
                       <option>Other</option>
                     </select>
                   </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Full Documentation</label>
                  <textarea 
                    required
                    rows={5}
                    placeholder="Comprehensive description of the operational anomaly..."
                    className="w-full bg-slate-900 border border-brand-border/30 rounded-md px-4 py-3 text-white focus:outline-none focus:border-brand-primary/50 transition-all font-medium resize-none text-sm leading-relaxed"
                    value={newTicket.description}
                    onChange={(e) => setNewTicket({...newTicket, description: e.target.value})}
                  />
                </div>

                <button 
                  type="submit"
                  disabled={loading}
                  className="w-full py-4 bg-brand-primary hover:bg-schooladmin-primary text-white rounded-md transition-all shadow-lg shadow-brand-primary/20 font-black uppercase tracking-widest text-xs flex items-center justify-center gap-2 active:scale-[0.98]"
                >
                  {loading ? <Loader2 size={16} className="animate-spin" /> : <ShieldCheck size={16} />} 
                  Dispatch Support Request
                </button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default SupportTickets;
