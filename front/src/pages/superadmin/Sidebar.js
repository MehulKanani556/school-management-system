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
        <aside className="hidden lg:flex w-72 flex-col bg-slate-900 border-r border-slate-800/60 sticky top-0 h-screen z-20">
            <div className="p-8">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-md bg-gradient-to-br from-brand-primary to-brand-secondary flex items-center justify-center font-black text-xl italic shadow-lg">SA</div>
                    <span className="text-xl font-black tracking-tight uppercase font-outfit leading-none">Super <span className="text-brand-primary">Admin</span></span>
                </div>
            </div>

            <nav className="flex-1 px-4 space-y-1 overflow-y-auto mt-4 custom-scrollbar">
                {menuItems.map((item) => (
                    <Link
                        key={item.path}
                        to={item.path}
                        className={`flex items-center gap-4 px-6 py-4 rounded-md transition-all duration-300 group ${isActive(item.path) ? 'bg-brand-primary text-white shadow-lg' : 'text-slate-400 hover:bg-slate-800/40 hover:text-slate-100'}`}
                    >
                        <item.icon size={18} className={isActive(item.path) ? 'text-white' : 'group-hover:text-brand-primary transition-colors'} />
                        <span className="text-[11px] font-black uppercase tracking-[0.15em] font-outfit flex-1 leading-none">{item.label}</span>
                        {isActive(item.path) && <ChevronRight size={14} className="ml-auto" />}
                    </Link>
                ))}
            </nav>

            <div className="p-6">
                <button onClick={handleLogout} className="w-full flex items-center gap-4 px-6 py-4 rounded-md text-slate-500 hover:bg-red-500/10 hover:text-red-400 transition-all group font-outfit">
                    <LogOut size={20} />
                    <span className="text-[12px] font-black uppercase tracking-[0.15em]">Log out</span>
                </button>
            </div>
        </aside>
    );
};

export default Sidebar;
