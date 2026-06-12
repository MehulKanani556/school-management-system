import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { fetchPlatformUsers, clearStatus, updateUserStatus, deletePlatformUser } from '../../redux/slice/superAdmin.slice';
import { Users, Search, Shield, School, MoreVertical, CheckCircle, XCircle, Trash2, Power, Eye } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { getImageUrl } from '../../utils/imageHelper';

const UserManagement = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { users, usersPagination, loading, error, success } = useSelector((state) => state.superAdmin);

    const [searchTerm, setSearchTerm] = useState('');
    const [filterRole, setFilterRole] = useState('All');
    const [activeMenu, setActiveMenu] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [sortBy, setSortBy] = useState('createdAt_desc');
    const pageSize = 20;

    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm, filterRole, sortBy]);

    useEffect(() => {
        const [sortField, sortDirection] = sortBy.split('_');
        const delayDebounceFn = setTimeout(() => {
            dispatch(fetchPlatformUsers({ 
                role: filterRole, 
                search: searchTerm, 
                page: currentPage, 
                limit: pageSize,
                sortBy: sortField,
                sortOrder: sortDirection
            }));
        }, 300);

        return () => clearTimeout(delayDebounceFn);
    }, [dispatch, searchTerm, filterRole, sortBy, currentPage]);

    useEffect(() => {
        if (success) {
            toast.success(success);
            dispatch(clearStatus());
        }
        if (error) {
            toast.error(error);
            dispatch(clearStatus());
        }
    }, [success, error, dispatch]);

    const handleToggleStatus = (id, currentStatus) => {
        dispatch(updateUserStatus({ id, isActive: !currentStatus }));
        setActiveMenu(null);
    };

    const handleDelete = async (id) => {
        if (await window.confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
            dispatch(deletePlatformUser(id));
            setActiveMenu(null);
        }
    };

    const filteredUsers = users || [];

    return (
        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="space-y-8 pb-10 font-outfit">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                    <h1 className="text-3xl font-black text-white italic uppercase tracking-tighter leading-none mb-2 font-inter">User Directory</h1>
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] italic opacity-70">Manage all user accounts.</p>
                </div>
                <div className="flex items-center gap-4">
                    <div className="relative group">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-hover:text-superadmin-primary transition-colors" size={16} />
                        <input 
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            placeholder="SEARCH USER..." 
                            className="bg-slate-900/50 border border-slate-800 h-12 pl-12 pr-6 rounded-md text-[10px] font-black uppercase tracking-widest text-white outline-none focus:border-superadmin-primary transition-all w-64 placeholder:text-slate-700 italic"
                        />
                    </div>
                    <select 
                        value={filterRole}
                        onChange={(e) => setFilterRole(e.target.value)}
                        className="bg-slate-900/50 border border-slate-800 h-12 px-6 rounded-md text-[10px] font-black uppercase tracking-widest text-white outline-none focus:border-superadmin-primary transition-all italic"
                    >
                        <option value="All">ALL ROLES</option>
                        <option value="Super_Admin">SUPER ADMIN</option>
                        <option value="School_Admin">SCHOOL ADMIN</option>
                        <option value="Teacher">TEACHER</option>
                        <option value="Student">STUDENT</option>
                        <option value="Parent">PARENT</option>
                        <option value="Accountant">ACCOUNTANT</option>
                        <option value="Librarian">LIBRARIAN</option>
                        <option value="Transport_Manager">TRANSPORT MANAGER</option>
                        <option value="Driver">DRIVER</option>
                    </select>
                    <select 
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value)}
                        className="bg-slate-900/50 border border-slate-800 h-12 px-6 rounded-md text-[10px] font-black uppercase tracking-widest text-white outline-none focus:border-superadmin-primary transition-all italic"
                    >
                        <option value="createdAt_desc">NEWEST FIRST</option>
                        <option value="createdAt_asc">OLDEST FIRST</option>
                        <option value="name_asc">NAME (A-Z)</option>
                        <option value="name_desc">NAME (Z-A)</option>
                    </select>
                </div>
            </div>

            <div className="bg-slate-900/30 border border-slate-800/60 rounded-md backdrop-blur-3xl overflow-hidden shadow-2xl min-h-[400px]">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-white/[0.02] border-b border-white/5">
                                <th className="px-8 py-5 text-[9px] font-black text-slate-500 uppercase tracking-widest italic">User</th>
                                <th className="px-8 py-5 text-[9px] font-black text-slate-500 uppercase tracking-widest italic">School</th>
                                <th className="px-8 py-5 text-[9px] font-black text-slate-500 uppercase tracking-widest italic">Role</th>
                                <th className="px-8 py-5 text-[9px] font-black text-slate-500 uppercase tracking-widest italic">Status</th>
                                <th className="px-8 py-5 text-[9px] font-black text-slate-500 uppercase tracking-widest italic text-right">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {filteredUsers.map((user) => (
                                <tr key={user._id} className="group hover:bg-white/[0.01] transition-all">
                                    <td className="px-8 py-5">
                                        <div 
                                            className="flex items-center gap-4 cursor-pointer"
                                            onClick={() => navigate(`/superadmin/profile/${user._id}`)}
                                        >

                                            <div className="w-11 h-11 rounded-md bg-slate-800 border border-white/5 overflow-hidden flex items-center justify-center grayscale group-hover:grayscale-0 transition-all shrink-0">
                                                {getImageUrl(user.photo) ? <img src={getImageUrl(user.photo)} alt="" className="w-full h-full object-cover" /> : <Users size={18} className="text-slate-600" />}
                                            </div>
                                            <div className="min-w-0">
                                                <p className="text-sm font-black text-slate-100 italic uppercase tracking-tighter truncate group-hover:text-superadmin-primary transition-colors">{user.firstName} {user.lastName}</p>
                                                <p className="text-[10px] font-bold text-slate-500 lowercase italic truncate opacity-60">{user.email}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-8 py-5">
                                        <div className="flex items-center gap-2">
                                            <School size={12} className="text-slate-600" />
                                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest italic truncate max-w-[150px]">{user.schoolId?.name || 'CORE PLATFORM'}</span>
                                        </div>
                                    </td>
                                    <td className="px-8 py-5">
                                        <span className={`inline-flex items-center px-3 py-1 rounded-md text-[9px] font-black uppercase tracking-[0.1em] italic border ${
                                            user.role === 'Super_Admin' ? 'bg-superadmin-primary/10 border-superadmin-primary/20 text-superadmin-primary' :
                                            user.role === 'School_Admin' ? 'bg-indigo-500/10 border-indigo-500/20 text-indigo-400' :
                                            'bg-slate-800/50 border-white/5 text-slate-500'
                                        }`}>
                                            {user.role.replace('_', ' ')}
                                        </span>
                                    </td>
                                    <td className="px-8 py-5">
                                        <div className="flex items-center gap-2">
                                            <div className={`w-1.5 h-1.5 rounded-md ${user.isActive ? 'bg-emerald-500 animate-pulse' : 'bg-superadmin-primary'}`}></div>
                                            <span className={`text-[9px] font-black uppercase tracking-widest italic ${user.isActive ? 'text-emerald-500' : 'text-superadmin-primary'}`}>
                                                {user.isActive ? 'Active' : 'Suspended'}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="px-8 py-5 text-right relative">
                                        <button 
                                            onClick={() => setActiveMenu(activeMenu === user._id ? null : user._id)}
                                            className="p-2 rounded-md hover:bg-white/5 text-slate-500 hover:text-white transition-all opacity-0 group-hover:opacity-100"
                                        >
                                            <MoreVertical size={16} />
                                        </button>
                                        
                                        <AnimatePresence>
                                            {activeMenu === user._id && (
                                                <motion.div 
                                                    initial={{ opacity: 0, scale: 0.95, y: -10 }}
                                                    animate={{ opacity: 1, scale: 1, y: 0 }}
                                                    exit={{ opacity: 0, scale: 0.95, y: -10 }}
                                                    className="absolute right-8 top-12 w-48 bg-slate-900 border border-slate-800 rounded-md shadow-3xl z-50 overflow-hidden"
                                                >
                                                    <div className="p-2 space-y-1">
                                                        <button 
                                                            onClick={() => handleToggleStatus(user._id, user.isActive)}
                                                            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-md text-[9px] font-black uppercase tracking-widest italic transition-all ${user.isActive ? 'text-superadmin-primary hover:bg-superadmin-primary/10' : 'text-emerald-500 hover:bg-emerald-500/10'}`}
                                                        >
                                                            <Power size={14} />
                                                            {user.isActive ? 'Suspend Access' : 'Activate User'}
                                                        </button>
                                                        <button 
                                                            onClick={() => handleDelete(user._id)}
                                                            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-md text-[9px] font-black uppercase tracking-widest italic text-slate-400 hover:text-superadmin-primary hover:bg-superadmin-primary/10 transition-all"
                                                        >
                                                            <Trash2 size={14} />
                                                            Delete User
                                                        </button>
                                                    </div>
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                {filteredUsers.length === 0 && (
                    <div className="p-20 text-center flex flex-col items-center justify-center opacity-30 grayscale group hover:grayscale-0 transition-all">
                        <Users size={64} className="mb-6 opacity-20" />
                        <h4 className="text-xl font-black uppercase italic tracking-widest">No Users Found</h4>
                        <p className="text-[10px] font-black uppercase tracking-[0.3em] mt-4 max-w-xs mx-auto italic">The requested user account could not be found.</p>
                    </div>
                )}
                {/* Pagination Controls */}
                {usersPagination && usersPagination.pages > 1 && (
                    <div className="flex flex-col sm:flex-row items-center justify-between px-8 py-5 border-t border-white/5 bg-white/[0.01] gap-4">
                        <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest italic">
                            Showing {(currentPage - 1) * pageSize + 1} - {Math.min(currentPage * pageSize, usersPagination.total)} of {usersPagination.total} users
                        </div>
                        <div className="flex items-center gap-3">
                            <button
                                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                disabled={currentPage === 1}
                                className="px-4 py-2 bg-slate-900/50 border border-slate-800 rounded-md text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-white hover:border-superadmin-primary disabled:opacity-30 disabled:hover:text-slate-400 disabled:hover:border-slate-800 transition-all italic"
                            >
                                PREVIOUS
                            </button>
                            <div className="flex gap-1">
                                {[...Array(usersPagination.pages)].map((_, index) => {
                                    const pageNumber = index + 1;
                                    // Simple page list truncation if page count is very high:
                                    if (usersPagination.pages > 5 && Math.abs(pageNumber - currentPage) > 1 && pageNumber !== 1 && pageNumber !== usersPagination.pages) {
                                        if (pageNumber === 2 || pageNumber === usersPagination.pages - 1) {
                                            return <span key={pageNumber} className="text-slate-600 px-1 font-black flex items-center justify-center">...</span>;
                                        }
                                        return null;
                                    }
                                    return (
                                        <button
                                            key={pageNumber}
                                            onClick={() => setCurrentPage(pageNumber)}
                                            className={`w-8 h-8 rounded-md text-[10px] font-black flex items-center justify-center border transition-all ${currentPage === pageNumber ? 'bg-superadmin-primary text-black border-superadmin-primary shadow-lg shadow-superadmin-primary/10' : 'bg-slate-900/30 border-slate-800 text-slate-400 hover:text-white hover:border-slate-700'}`}
                                        >
                                            {pageNumber}
                                        </button>
                                    );
                                })}
                            </div>
                            <button
                                onClick={() => setCurrentPage(prev => Math.min(prev + 1, usersPagination.pages))}
                                disabled={currentPage === usersPagination.pages}
                                className="px-4 py-2 bg-slate-900/50 border border-slate-800 rounded-md text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-white hover:border-superadmin-primary disabled:opacity-30 disabled:hover:text-slate-400 disabled:hover:border-slate-800 transition-all italic"
                            >
                                NEXT
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </motion.div>
    );
};

export default UserManagement;
