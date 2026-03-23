import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Outlet, Link, useLocation } from 'react-router-dom';
import {
    LayoutDashboard, Bus, Navigation, Users, MapPin,
    LogOut, ChevronRight, Bell, User, Truck
} from 'lucide-react';
import { logout } from '../../redux/slice/auth.slice';
import { motion } from 'framer-motion';

const TransporterLayout = () => {
    const dispatch = useDispatch();
    const location = useLocation();
    const { user } = useSelector((state) => state.auth);

    const menuItems = [
        { icon: LayoutDashboard, label: 'Dashboard', path: '/transporter' },
        { icon: Bus, label: 'Vehicle Fleet', path: '/transporter/vehicles' },
        { icon: Navigation, label: 'Route Matrix', path: '/transporter/routes' },
        { icon: Users, label: 'Fleet Assignments', path: '/transporter/students' },
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
                        <div className="w-10 h-10 rounded-md bg-gradient-to-br from-orange-600 to-orange-400 flex items-center justify-center font-black text-xl italic drop-shadow-[0_0_10px_rgba(249,115,22,0.3)]">TM</div>
                        <span className="text-xl font-black tracking-tighter uppercase font-outfit leading-none">Logistics <span className="text-orange-400">Node</span></span>
                    </div>
                </div>

                <nav className="flex-1 px-4 space-y-2 mt-4">
                    {menuItems.map((item) => (
                        <Link
                            key={item.path}
                            to={item.path}
                            className={`flex items-center gap-4 px-6 py-4 rounded-md transition-all duration-300 group ${isActive(item.path) ? 'bg-orange-600 text-white shadow-[0_4px_15px_rgba(249,115,22,0.4)]' : 'text-slate-500 hover:bg-slate-800/40 hover:text-orange-400'}`}
                        >
                            <item.icon size={18} className={isActive(item.path) ? 'text-white' : 'group-hover:text-orange-400 transition-colors'} />
                            <span className="text-[11px] font-black uppercase tracking-[0.15em] font-outfit flex-1 leading-none">{item.label}</span>
                            {isActive(item.path) && <ChevronRight size={14} className="ml-auto" />}
                        </Link>
                    ))}
                </nav>

                <div className="p-6">
                    <button onClick={handleLogout} className="w-full flex items-center gap-4 px-6 py-4 rounded-md text-slate-500 hover:bg-neutral-900 hover:text-red-400 transition-all font-outfit">
                        <LogOut size={20} />
                        <span className="text-[12px] font-black uppercase tracking-[0.15em]">Shutdown Node</span>
                    </button>
                </div>
            </aside>

            <div className="flex-1 flex flex-col min-w-0">
                <header className="h-20 flex items-center justify-between px-8 bg-neutral-950/40 backdrop-blur-xl border-b border-slate-800/40 sticky top-0 z-10">
                    <div className="flex items-center gap-4 text-slate-500">
                        <span className="text-[10px] font-black uppercase tracking-widest bg-slate-900 px-3 py-1 rounded-md border border-slate-800/60 leading-none">Fleet Operations</span>
                        <ChevronRight size={14} />
                        <span className="text-[10px] font-black uppercase tracking-widest text-orange-400 italic">Transport Terminal</span>
                    </div>

                    <div className="flex items-center gap-6">
                        <button className="p-2.5 rounded-md bg-slate-900 border border-slate-800/60 text-slate-500 hover:text-orange-400 transition-all">
                            <Bell size={18} />
                        </button>
                        <div className="h-10 w-px bg-slate-800/40"></div>
                        <div className="flex items-center gap-4">
                            <div className="text-right hidden sm:block">
                                <p className="text-sm font-bold leading-none">{user?.firstName} {user?.lastName}</p>
                                <p className="text-[9px] font-black text-orange-400 uppercase tracking-[0.2em] mt-1.5 opacity-80 italic">Fleet Director</p>
                            </div>
                            <div className="w-10 h-10 rounded-md bg-slate-900 border border-slate-800/60 overflow-hidden flex items-center justify-center shadow-lg">
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

export default TransporterLayout;
