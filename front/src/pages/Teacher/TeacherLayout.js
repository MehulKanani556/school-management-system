import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { 
    LayoutDashboard, Users, BookOpen, ClipboardList, 
    Upload, MessageSquare, LogOut, ChevronRight,
    Bell, User, Activity
} from 'lucide-react';
import { logout } from '../../redux/slice/auth.slice';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';

const TeacherLayout = () => {
    const dispatch = useDispatch();
    const location = useLocation();
    const { user } = useSelector((state) => state.auth);

    const menuItems = [
        { icon: LayoutDashboard, label: 'Dashboard', path: '/teacher' },
        { icon: BookOpen, label: 'Assigned Classes', path: '/teacher/classes' },
        { icon: ClipboardList, label: 'Mark Attendance', path: '/teacher/attendance' },
        { icon: Activity, label: 'Add Marks', path: '/teacher/marks' },
        { icon: Upload, label: 'Upload Assignments', path: '/teacher/assignments' },
        { icon: MessageSquare, label: 'Communicate', path: '/teacher/messages' },
    ];

    const handleLogout = () => {
        dispatch(logout());
        toast.success('Secure session closed');
    };

    const isActive = (path) => location.pathname === path;

    return (
        <div className="min-h-screen bg-slate-900 text-slate-100 flex font-inter antialiased">
            {/* Sidebar */}
            <aside className="hidden lg:flex w-72 flex-col bg-slate-900 border-r border-slate-800/60 sticky top-0 h-screen z-20">
                <div className="p-8">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-primary to-brand-secondary flex items-center justify-center font-black text-xl italic shadow-lg">SM</div>
                        <span className="text-xl font-black tracking-tight uppercase font-outfit">Teacher <span className="text-brand-primary">Node</span></span>
                    </div>
                </div>

                <nav className="flex-1 px-4 space-y-1.5 overflow-y-auto mt-4">
                    {menuItems.map((item) => (
                        <Link
                            key={item.path}
                            to={item.path}
                            className={`flex items-center gap-4 px-6 py-4 rounded-2xl transition-all duration-300 group ${isActive(item.path) ? 'bg-brand-primary text-white shadow-lg' : 'text-slate-500 hover:bg-slate-800/40 hover:text-slate-100'}`}
                        >
                            <item.icon size={20} className={isActive(item.path) ? 'text-white' : 'group-hover:text-brand-primary transition-colors'} />
                            <span className="text-[12px] font-black uppercase tracking-[0.15em] font-outfit">{item.label}</span>
                            {isActive(item.path) && <ChevronRight size={16} className="ml-auto" />}
                        </Link>
                    ))}
                </nav>

                <div className="p-6">
                    <button onClick={handleLogout} className="w-full flex items-center gap-4 px-6 py-4 rounded-2xl text-slate-500 hover:bg-red-500/10 hover:text-red-400 transition-all group font-outfit">
                        <LogOut size={20} />
                        <span className="text-[12px] font-black uppercase tracking-[0.15em]">Log out</span>
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <div className="flex-1 min-w-0 flex flex-col">
                {/* Header */}
                <header className="h-20 flex items-center justify-between px-8 bg-slate-900/60 backdrop-blur-xl border-b border-slate-800/40 sticky top-0 z-10">
                    <div className="flex items-center gap-4 text-slate-500">
                        <span className="text-[10px] font-black uppercase tracking-widest bg-slate-800 px-3 py-1 rounded-full border border-slate-700/50">Infrastructure Control</span>
                        <ChevronRight size={14} />
                        <span className="text-[10px] font-black uppercase tracking-widest text-brand-primary">Teacher Terminal</span>
                    </div>

                    <div className="flex items-center gap-6">
                        <button className="p-2.5 rounded-xl bg-slate-800/40 border border-slate-700/50 text-slate-400 hover:text-brand-primary transition-all relative">
                            <Bell size={18} />
                            <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-brand-primary rounded-full border-2 border-slate-900"></span>
                        </button>
                        
                        <div className="h-10 w-px bg-slate-800/60"></div>

                        <div className="flex items-center gap-4">
                            <div className="text-right hidden sm:block">
                                <p className="text-sm font-bold leading-none">{user?.firstName} {user?.lastName}</p>
                                <p className="text-[9px] font-black text-brand-primary uppercase tracking-[0.2em] mt-1.5 opacity-80">Faculty ID: 00{user?._id.toString().slice(-3)}</p>
                            </div>
                            <div className="w-10 h-10 rounded-xl bg-slate-800 border border-slate-700/50 overflow-hidden flex items-center justify-center">
                                {user?.photo ? <img src={user.photo} alt="" className="w-full h-full object-cover" /> : <User size={20} className="text-slate-500" />}
                            </div>
                        </div>
                    </div>
                </header>

                <main className="p-8">
                    <Outlet />
                </main>
            </div>
        </div>
    );
};

export default TeacherLayout;
