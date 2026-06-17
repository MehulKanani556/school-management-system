import React, { useEffect, useState, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchTickets, updateTicketStatus, replyToTicket, clearStatus } from '../../redux/slice/superAdmin.slice';
import { LifeBuoy, Search, Filter, MessageSquare, Clock, CheckCircle, AlertCircle, ChevronRight, CornerDownRight, Send, User, School } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import moment from 'moment';
import toast from 'react-hot-toast';

const Support = () => {
    const dispatch = useDispatch();
    const { tickets, loading, error, success } = useSelector((state) => state.superAdmin);
    const [selectedTicket, setSelectedTicket] = useState(null);
    const [reply, setReply] = useState('');
    const [filterStatus, setFilterStatus] = useState('All');
    const scrollRef = useRef(null);

    useEffect(() => {
        dispatch(fetchTickets());
    }, [dispatch]);

    useEffect(() => {
        if (success) {
            toast.success(success);
            dispatch(clearStatus());
            setReply('');
        }
    }, [success, dispatch]);

    // Auto scroll to bottom
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [selectedTicket?.replies, selectedTicket?._id]);

    // Synchronize selected ticket with real-time updates from Redux
    useEffect(() => {
        if (selectedTicket) {
            const updatedSelection = tickets.find(t => t._id === selectedTicket._id);
            if (updatedSelection) {
                setSelectedTicket(updatedSelection);
            }
        }
    }, [tickets]);

    const handleReply = (e) => {
        e.preventDefault();
        if (!reply.trim()) return;
        dispatch(replyToTicket({ id: selectedTicket._id, message: reply }));
    };

    const handleStatusChange = (id, status) => {
        dispatch(updateTicketStatus({ id, status }));
    };

    const filteredTickets = tickets.filter(t => filterStatus === 'All' || t.status === filterStatus);

    return (
        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="h-[calc(100vh-160px)] flex flex-col gap-8 font-outfit text-left">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                    <h1 className="text-3xl font-black text-white italic uppercase tracking-tighter leading-none mb-2">Support Center</h1>
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] italic opacity-70">Manage support tickets and inquiries from registered schools.</p>
                </div>
                <div className="flex items-center gap-4">
                    <select 
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value)}
                        className="bg-slate-900/50 border border-slate-800 h-12 px-6 rounded-md text-[10px] font-black uppercase tracking-widest text-white outline-none focus:border-superadmin-primary transition-all italic"
                    >
                        <option value="All">ALL STATUS</option>
                        <option value="Open">OPEN</option>
                        <option value="In_Progress">IN PROGRESS</option>
                        <option value="Resolved">RESOLVED</option>
                        <option value="Closed">CLOSED</option>
                    </select>
                </div>
            </div>

            <div className="flex-1 flex gap-8 overflow-hidden">
                {/* Tickets List */}
                <div className="w-1/3 bg-slate-900/20 border border-slate-800/60 rounded-md backdrop-blur-3xl flex flex-col overflow-hidden">
                    <div className="overflow-y-auto flex-1 divide-y divide-white/5 custom-scrollbar">
                        {filteredTickets.map((ticket) => (
                            <div 
                                key={ticket._id}
                                onClick={() => setSelectedTicket(ticket)}
                                className={`p-6 cursor-pointer transition-all hover:bg-white/[0.02] ${selectedTicket?._id === ticket._id ? 'bg-superadmin-primary/10 border-l-2 border-superadmin-primary' : ''}`}
                            >
                                <div className="flex justify-between items-start mb-2">
                                    <span className={`text-[8px] font-black uppercase px-2 py-0.5 rounded-md tracking-widest italic border ${
                                        ticket.priority === 'Urgent' ? 'bg-superadmin-primary/10 border-superadmin-primary/20 text-superadmin-primary' :
                                        ticket.priority === 'High' ? 'bg-orange-500/10 border-orange-500/20 text-orange-500' :
                                        'bg-slate-800 border-white/5 text-slate-500'
                                    }`}>
                                        {ticket.priority} PRIORITY
                                    </span>
                                    <span className="text-[8px] font-black text-slate-600 uppercase tracking-widest italic">{moment(ticket.createdAt).fromNow()}</span>
                                </div>
                                <h3 className="text-sm font-black text-white uppercase italic tracking-tight mb-2 truncate group-hover:text-superadmin-primary transition-colors">{ticket.subject}</h3>
                                <div className="flex items-center gap-2 opacity-60">
                                    <School size={10} className="text-slate-500" />
                                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest italic truncate">{ticket.schoolId?.name}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Detail View */}
                <div className="flex-1 bg-slate-900/20 border border-slate-800/60 rounded-md backdrop-blur-3xl flex flex-col overflow-hidden">
                    <AnimatePresence mode="wait">
                        {selectedTicket ? (
                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col h-full">
                                <div className="p-8 border-b border-white/5 bg-white/[0.01]">
                                    <div className="flex justify-between items-start mb-6">
                                        <div>
                                            <h2 className="text-2xl font-black text-white italic uppercase tracking-tighter mb-2">{selectedTicket.subject}</h2>
                                            <div className="flex items-center gap-4">
                                                <div className="flex items-center gap-2">
                                                    <User size={12} className="text-slate-500" />
                                                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest italic">{selectedTicket.openedBy?.firstName} {selectedTicket.openedBy?.lastName}</span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <School size={12} className="text-slate-500" />
                                                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest italic">{selectedTicket.schoolId?.name}</span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex flex-col items-end gap-3">
                                            <select 
                                                value={selectedTicket.status}
                                                onChange={(e) => handleStatusChange(selectedTicket._id, e.target.value)}
                                                className={`bg-slate-900 border h-10 px-4 rounded-md text-[9px] font-black uppercase tracking-widest text-white outline-none italic transition-all ${
                                                    selectedTicket.status === 'Resolved' ? 'border-emerald-500/40 text-emerald-500' : 
                                                    selectedTicket.status === 'Open' ? 'border-sky-500/40 text-sky-500' :
                                                    'border-slate-800 text-slate-400'
                                                }`}
                                            >
                                                <option value="Open">OPEN</option>
                                                <option value="In_Progress">IN PROGRESS</option>
                                                <option value="Resolved">RESOLVED</option>
                                                <option value="Closed">CLOSED</option>
                                            </select>
                                        </div>
                                    </div>
                                    <p className="bg-slate-950/40 border border-white/5 p-6 rounded-md text-xs font-medium text-slate-300 italic tracking-wide leading-relaxed">
                                        {selectedTicket.description}
                                    </p>
                                </div>

                                <div ref={scrollRef} className="flex-1 overflow-y-auto p-8 space-y-8 custom-scrollbar">
                                    {selectedTicket.replies?.map((r, i) => {
                                        const isOwner = (r.senderId?._id || r.senderId)?.toString() === (selectedTicket.openedBy?._id || selectedTicket.openedBy)?.toString();
                                        return (
                                            <div key={i} className={`flex gap-4 ${isOwner ? '' : 'flex-row-reverse'}`}>
                                                <div className="w-8 h-8 rounded-md bg-slate-800 border border-white/5 flex items-center justify-center shrink-0">
                                                    {isOwner ? <User size={14} className="text-slate-600" /> : <LifeBuoy size={14} className="text-superadmin-primary" />}
                                                </div>
                                                <div className="flex flex-col gap-2 max-w-[70%]">
                                                    <div className={`p-4 rounded-md border text-[11px] font-medium leading-relaxed italic ${
                                                        isOwner ? 'bg-white/5 border-white/10 text-slate-200' : 'bg-superadmin-primary/10 border-superadmin-primary/20 text-superadmin-primary shadow-xl shadow-superadmin-primary/5'
                                                    }`}>
                                                        {r.message}
                                                    </div>
                                                    <span className={`text-[8px] font-black uppercase tracking-widest text-slate-600 italic ${isOwner ? '' : 'text-right'}`}>
                                                        {moment(r.createdAt).calendar()}
                                                    </span>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>

                                <div className="p-8 border-t border-white/5 bg-slate-950/20">
                                    <form onSubmit={handleReply} className="flex gap-4">
                                        <div className="flex-1 relative">
                                            <CornerDownRight className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
                                            <input 
                                                value={reply}
                                                onChange={(e) => setReply(e.target.value)}
                                                placeholder="Type your reply here..." 
                                                className="w-full bg-slate-900 border border-white/5 h-14 pl-12 pr-6 rounded-md text-[10px] font-black uppercase tracking-widest text-white outline-none focus:border-superadmin-primary transition-all italic placeholder:text-slate-700"
                                            />
                                        </div>
                                        <button 
                                            disabled={loading || !reply.trim()}
                                            className="h-14 px-8 bg-superadmin-primary text-black rounded-md flex items-center justify-center gap-3 shadow-xl shadow-superadmin-primary/20 hover:scale-105 active:scale-95 transition-all disabled:opacity-50 disabled:scale-100"
                                        >
                                            <Send size={16} />
                                            <span className="text-[10px] font-black uppercase italic tracking-widest">Send</span>
                                        </button>
                                    </form>
                                </div>
                            </motion.div>
                        ) : (
                            <div className="flex-1 flex flex-col items-center justify-center opacity-30 grayscale group hover:grayscale-0 transition-all p-20 text-center">
                                <LifeBuoy size={64} className="mb-6 opacity-20" />
                                <h4 className="text-xl font-black uppercase italic tracking-widest text-slate-500">No Ticket Selected</h4>
                                <p className="text-[10px] font-black uppercase tracking-[0.3em] mt-4 max-w-xs mx-auto italic leading-relaxed">Select a support ticket from the list to view and reply.</p>
                            </div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </motion.div>
    );
};

export default Support;
