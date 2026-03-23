import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Outlet, Link, useLocation } from 'react-router-dom';
import {
    LayoutDashboard, DollarSign, CreditCard, PieChart,
    LogOut, ChevronRight, Bell, User, Settings
} from 'lucide-react';
import { logout } from '../../redux/slice/auth.slice';
import { motion } from 'framer-motion';

const AccountantLayout = () => {
    const dispatch = useDispatch();
    const location = useLocation();
    const { user } = useSelector((state) => state.auth);

    const menuItems = [
        { icon: LayoutDashboard, label: 'Dashboard', path: '/accountant' },
        { icon: DollarSign, label: 'Fee Collection', path: '/accountant/fees' },
        { icon: CreditCard, label: 'Payroll', path: '/accountant/payroll' },
        { icon: PieChart, label: 'Reports', path: '/accountant/reports' },
    ];

    const handleLogout = () => {
        dispatch(logout());
    };

    const isActive = (path) => location.pathname === path;

    return (
        <div className="min-h-screen bg-slate-900 text-slate-100 flex font-inter antialiased">
            {/* Sidebar */}
            <aside className="hidden lg:flex flex-col w-72 border-r border-slate-800/60 sticky top-0 h-screen z-20">
                <div className="p-8">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-md bg-gradient-to-br from-luxury-emerald to-brand-primary flex items-center justify-center font-black text-xl italic">AC</div>
                        <span className="text-xl font-black tracking-tight uppercase font-outfit">Fiscal <span className="text-brand-primary">Terminal</span></span>
                    </div>
                </div>

                <nav className="flex-1 px-4 space-y-2 mt-4">
                    {menuItems.map((item) => (
                        <Link
                            key={item.path}
                            to={item.path}
                            className={`flex items-center gap-4 px-6 py-4 rounded-md transition-all duration-300 group ${isActive(item.path) ? 'bg-brand-primary text-white shadow-lg' : 'text-slate-400 hover:bg-slate-800/40 hover:text-slate-100'}`}
                        >
                            <item.icon size={18} className={isActive(item.path) ? 'text-white' : 'group-hover:text-brand-primary transition-colors'} />
                            <span className="text-[11px] font-black uppercase tracking-[0.15em] font-outfit flex-1">{item.label}</span>
                            {isActive(item.path) && <ChevronRight size={14} className="ml-auto" />}
                        </Link>
                    ))}
                </nav>

                <div className="p-6">
                    <button onClick={handleLogout} className="w-full flex items-center gap-4 px-6 py-4 rounded-md text-slate-500 hover:bg-red-500/10 hover:text-red-400 transition-all font-outfit">
                        <LogOut size={20} />
                        <span className="text-[12px] font-black uppercase tracking-[0.15em]">Shutdown</span>
                    </button>
                </div>
            </aside>

            {/* Content */}
            <div className="flex-1 flex flex-col min-w-0">
                <header className="h-20 flex items-center justify-between px-8 bg-slate-900/60 backdrop-blur-xl border-b border-slate-800/40 sticky top-0 z-10">
                    <div className="flex items-center gap-4 text-slate-500">
                        <span className="text-[10px] font-black uppercase tracking-widest bg-slate-800 px-3 py-1 rounded-md border border-slate-700/50">Fiscal Intelligence</span>
                        <ChevronRight size={14} />
                        <span className="text-[10px] font-black uppercase tracking-widest text-brand-primary">Accountant Node</span>
                    </div>

                    <div className="flex items-center gap-6">
                        <button className="p-2.5 rounded-md bg-slate-800/40 border border-slate-700/50 text-slate-400 hover:text-brand-primary transition-all">
                            <Bell size={18} />
                        </button>
                        <div className="h-10 w-px bg-slate-800/60"></div>
                        <div className="flex items-center gap-4">
                            <div className="text-right hidden sm:block">
                                <p className="text-sm font-bold leading-none">{user?.firstName} {user?.lastName}</p>
                                <p className="text-[9px] font-black text-brand-primary uppercase tracking-[0.2em] mt-1.5 opacity-80 italic">Fiscal Officer</p>
                            </div>
                            <div className="w-10 h-10 rounded-md bg-slate-800 border border-slate-700/50 overflow-hidden flex items-center justify-center">
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

export default AccountantLayout;
