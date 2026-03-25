import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchBorrowersSlice } from '../../redux/slice/librarian.slice';
import { Users, Search, Mail, User, Shield, Phone, MapPin } from 'lucide-react';
import { motion } from 'framer-motion';

const MemberRegistry = () => {
    const dispatch = useDispatch();
    const { borrowers, loading } = useSelector((state) => state.librarian);
    const [searchTerm, setSearchTerm] = React.useState('');

    useEffect(() => {
        dispatch(fetchBorrowersSlice());
    }, [dispatch]);

    const filteredMembers = (borrowers || []).filter(b => 
        ((b.firstName || '') + ' ' + (b.lastName || '')).toLowerCase().includes(searchTerm.toLowerCase()) ||
        b.email?.toLowerCase()?.includes(searchTerm.toLowerCase())
    );

    return (
        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="space-y-8 pb-10 font-outfit">
            <div className="flex justify-between items-end">
                <div>
                    <h1 className="text-3xl font-black text-librarian-primary italic uppercase tracking-tighter mb-1 leading-none">Member Registry</h1>
                    <p className="text-[11px] font-black text-slate-500 uppercase tracking-widest italic opacity-70 leading-none">Catalog of institutional nodes with borrowing privileges.</p>
                </div>
            </div>

            <div className="bg-neutral-900 border border-slate-800/60 rounded-md shadow-2xl overflow-hidden group">
                <div className="px-6 py-5 border-b border-slate-800/60 bg-neutral-950/40 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <h2 className="text-lg font-black italic uppercase tracking-tight text-slate-100 leading-none">Node Directory</h2>
                    <div className="relative">
                        <Search className="absolute left-3 top-2.5 text-slate-600" size={14} />
                        <input 
                            type="text" 
                            placeholder="Identify member..." 
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="bg-neutral-950 border border-slate-800/60 rounded-md py-2 pl-9 pr-4 text-xs font-bold text-slate-200 focus:outline-none focus:border-librarian-primary/50 transition-all w-full sm:w-64 italic"
                        />
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-0 divide-x divide-y divide-slate-800/40">
                    {filteredMembers.length > 0 ? filteredMembers.map((member, i) => (
                        <div key={i} className="p-6 hover:bg-neutral-950/60 transition-all group/card relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover/card:opacity-30 transition-all">
                                <Users size={40} className="text-librarian-primary" />
                            </div>
                            <div className="flex items-start gap-4">
                                <div className="w-14 h-14 rounded-md bg-neutral-950 border border-slate-800/60 overflow-hidden flex items-center justify-center text-slate-600 shadow-inner group-hover/card:border-librarian-primary/40 transition-all">
                                    {member.photo ? <img src={member.photo} alt="" className="w-full h-full object-cover" /> : <User size={24} />}
                                </div>
                                <div className="flex flex-col flex-1">
                                    <span className="font-bold text-base text-slate-100 tracking-tight leading-none mb-2 group-hover/card:text-librarian-primary transition-all uppercase italic">{member.firstName} {member.lastName}</span>
                                    <div className="space-y-1.5">
                                        <div className="flex items-center gap-2 text-slate-500">
                                            <Mail size={12} className="text-librarian-primary/60" />
                                            <span className="text-[10px] font-bold lowercase tracking-wider truncate max-w-[150px]">{member.email}</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Shield size={12} className="text-librarian-primary/60" />
                                            <span className="text-[9px] font-black text-librarian-primary border border-librarian-primary/20 bg-librarian-primary/5 px-2 py-0.5 rounded-md uppercase italic tracking-[0.1em]">{member.role} NODE</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="mt-6 pt-4 border-t border-slate-800/40 flex items-center justify-between">
                                <button className="text-[9px] font-black uppercase text-slate-500 hover:text-librarian-primary italic tracking-widest transition-all">View Analytics</button>
                                <span className="text-[9px] font-black text-slate-700 italic opacity-40 uppercase">ID: {member._id?.toString().slice(-6)}</span>
                            </div>
                        </div>
                    )) : (
                        <div className="col-span-full py-20 text-center text-slate-500 italic font-black uppercase text-xs tracking-[0.2em] opacity-40">No institutional nodes found in registry.</div>
                    )}
                </div>
            </div>
        </motion.div>
    );
};

export default MemberRegistry;
