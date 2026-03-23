import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Outlet, Link, useLocation } from 'react-router-dom';
import {
    LayoutDashboard, Book, BookOpen, Clock, Activity,
    LogOut, ChevronRight, Bell, User, Library
} from 'lucide-react';
import { logout } from '../../redux/slice/auth.slice';
import { motion } from 'framer-motion';

const LibrarianLayout = () => {
    const dispatch = useDispatch();
    const location = useLocation();
    const { user } = useSelector((state) => state.auth);

    const menuItems = [
        { icon: LayoutDashboard, label: 'Dashboard', path: '/librarian' },
        { icon: Library, label: 'Book Inventory', path: '/librarian/inventory' },
        { icon: BookOpen, label: 'Issue Book', path: '/librarian/issue' },
        { icon: Clock, label: 'Return Book', path: '/librarian/return' },
        { icon: Activity, label: 'Records', path: '/librarian/records' },
    ];

    const handleLogout = () => {
        dispatch(logout());
    };

    const isActive = (path) => location.pathname === path;

    return (
        <div className="min-h-screen bg-neutral-950 text-slate-100 flex font-inter antialiased">
            <aside className="hidden lg:flex flex-col w-72 border-r border-slate-800/40 sticky top-0 h-screen z-20">
                <div className="p-8">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-md bg-gradient-to-br from-indigo-600 to-indigo-400 flex items-center justify-center font-black text-xl italic drop-shadow-[0_0_10px_rgba(79,70,229,0.3)]">LIB</div>
                        <span className="text-xl font-black tracking-tighter uppercase font-outfit">Archive <span className="text-indigo-400">Node</span></span>
                    </div>
                </div>

                <nav className="flex-1 px-4 space-y-2 mt-4">
                    {menuItems.map((item) => (
                        <Link
                            key={item.path}
                            to={item.path}
                            className={`flex items-center gap-4 px-6 py-4 rounded-md transition-all duration-300 group ${isActive(item.path) ? 'bg-indigo-600 text-white shadow-[0_4px_15px_rgba(79,70,229,0.4)]' : 'text-slate-500 hover:bg-slate-800/40 hover:text-indigo-400'}`}
                        >
                            <item.icon size={18} className={isActive(item.path) ? 'text-white' : 'group-hover:text-indigo-400 transition-colors'} />
                            <span className="text-[11px] font-black uppercase tracking-[0.15em] font-outfit flex-1">{item.label}</span>
                            {isActive(item.path) && <ChevronRight size={14} className="ml-auto" />}
                        </Link>
                    ))}
                </nav>

                <div className="p-6">
                    <button onClick={handleLogout} className="w-full flex items-center gap-4 px-6 py-4 rounded-md text-slate-500 hover:bg-neutral-900 hover:text-red-400 transition-all font-outfit">
                        <LogOut size={20} />
                        <span className="text-[12px] font-black uppercase tracking-[0.15em]">Deactivate</span>
                    </button>
                </div>
            </aside>

            <div className="flex-1 flex flex-col min-w-0">
                <header className="h-20 flex items-center justify-between px-8 bg-neutral-950/40 backdrop-blur-xl border-b border-slate-800/40 sticky top-0 z-10">
                    <div className="flex items-center gap-4 text-slate-500">
                        <span className="text-[10px] font-black uppercase tracking-widest bg-slate-900 px-3 py-1 rounded-md border border-slate-800/60 leading-none">Knowledge Core</span>
                        <ChevronRight size={14} />
                        <span className="text-[10px] font-black uppercase tracking-widest text-indigo-400 italic">Librarian Terminal</span>
                    </div>

                    <div className="flex items-center gap-6">
                        <button className="p-2.5 rounded-md bg-slate-900 border border-slate-800/60 text-slate-500 hover:text-indigo-400 transition-all">
                            <Bell size={18} />
                        </button>
                        <div className="h-10 w-px bg-slate-800/40"></div>
                        <div className="flex items-center gap-4">
                            <div className="text-right hidden sm:block">
                                <p className="text-sm font-bold leading-none">{user?.firstName} {user?.lastName}</p>
                                <p className="text-[9px] font-black text-indigo-400 uppercase tracking-[0.2em] mt-1.5 opacity-80 italic">Archive Custodian</p>
                            </div>
                            <div className="w-10 h-10 rounded-md bg-slate-900 border border-slate-800/60 overflow-hidden flex items-center justify-center">
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

export default LibrarianLayout;
