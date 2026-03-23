import React from 'react';
import { NavLink, Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Globe, DollarSign, ShieldCheck, ArrowUpRight, Activity, Menu, Settings, LogOut, ChevronRight } from 'lucide-react';
import { useDispatch } from 'react-redux';
import { logout } from '../../redux/slice/auth.slice';

const Sidebar = () => {
    const dispatch = useDispatch();
    const location = useLocation();

    const menuItems = [
        { icon: LayoutDashboard, label: 'Control Center', path: '/superadmin/dashboard' },
        { icon: Globe, label: 'Institution Nodes', path: '/superadmin/schools' },
        { icon: Activity, label: 'Global Analytics', path: '/superadmin/analytics' },
        { icon: DollarSign, label: 'Gross Revenue', path: '/superadmin/revenue' },
        { icon: ShieldCheck, label: 'Security & Audit', path: '/superadmin/security' },
        { icon: Settings, label: 'System Config', path: '/superadmin/settings' },
    ];

    const handleLogout = () => {
        dispatch(logout());
    };

    const isActive = (path) => location.pathname === path;

    return (
        <aside className="hidden lg:flex w-72 flex-col bg-brand-surface border-r border-brand-border/60 sticky top-0 h-screen z-20">
            <div className="p-8">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-md bg-gradient-to-br from-superadmin-primary to-superadmin-secondary flex items-center justify-center font-black text-xl italic shadow-lg shadow-superadmin-primary/20 text-black">SA</div>
                    <span className="text-xl font-black tracking-tight uppercase font-outfit leading-none text-white">Super <span className="text-superadmin-primary">Admin</span></span>
                </div>
            </div>

            <nav className="flex-1 px-4 space-y-1 overflow-y-auto mt-4 custom-scrollbar">
                <p className="px-4 mb-3 text-[10px] font-black uppercase tracking-[0.4em] text-slate-600 italic">Root Authority</p>
                {menuItems.map((item) => (
                    <Link
                        key={item.path}
                        to={item.path}
                        className={`flex items-center gap-4 px-6 py-4 rounded-md transition-all duration-300 group ${isActive(item.path) ? 'bg-superadmin-primary text-black shadow-lg shadow-superadmin-primary/20' : 'text-slate-400 hover:bg-white/5 hover:text-white'}`}
                    >
                        <item.icon size={18} className={isActive(item.path) ? 'text-black' : 'group-hover:text-superadmin-primary transition-colors'} />
                        <span className="text-[11px] font-black uppercase tracking-[0.15em] font-outfit flex-1 leading-none">{item.label}</span>
                        {isActive(item.path) && <ChevronRight size={14} className="ml-auto" />}
                    </Link>
                ))}
            </nav>

            <div className="p-6">
                <button onClick={handleLogout} className="w-full flex items-center gap-4 px-6 py-4 rounded-md text-slate-500 hover:bg-superadmin-primary/10 hover:text-superadmin-primary transition-all group font-outfit border border-transparent hover:border-superadmin-primary/20 uppercase tracking-widest text-[11px] font-black">
                    <LogOut size={20} />
                    <span className="italic">Shutdown</span>
                </button>
            </div>
        </aside>
    );
};

export default Sidebar;
