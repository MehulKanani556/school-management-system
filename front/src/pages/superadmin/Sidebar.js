import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Globe, DollarSign, ShieldCheck, ArrowUpRight, Activity, Menu } from 'lucide-react';

const Sidebar = () => {
    const menuItems = [
        { icon: LayoutDashboard, label: 'Control Center', path: '/superadmin/dashboard' },
        { icon: Globe, label: 'Institution Nodes', path: '/superadmin/schools' },
        { icon: DollarSign, label: 'Gross Revenue', path: '/superadmin/revenue' },
        { icon: ShieldCheck, label: 'Security & Access', path: '/superadmin/security' },
    ];

    return (
        <aside className="bg-brand-surface h-full flex flex-col pt-0 p-4 border-r border-brand-border shadow-2xl">
            <div className="flex items-center gap-4 h-[75px]">
                <button className="lg:hidden p-2 text-slate-400 hover:bg-brand-background rounded-lg transition-colors">
                    <Menu size={20} />
                </button>
                <div className="flex items-center gap-3 px-2">
                    <div className="w-9 h-9 rounded-lg bg-brand-primary flex items-center justify-center font-bold tracking-tight text-white shadow-lg">SM</div>
                    <div className="flex flex-col">
                        <span className="text-sm font-bold text-slate-100 tracking-tight font-inter leading-none">School Management</span>
                        <span className="text-[11px] font-medium text-slate-400 mt-1 leading-none tracking-wide">Administrator Portal</span>
                    </div>
                </div>
            </div>

            <nav className="flex-1 space-y-1 mt-4">
                {menuItems.map((item, idx) => (
                    <NavLink
                        key={idx}
                        to={item.path}
                        className={({ isActive }) => `
                            flex items-center justify-between group px-3 py-2.5 rounded-lg text-sm font-semibold transition-all
                            ${isActive
                                ? 'bg-brand-primary/15 text-brand-primary border border-brand-primary/20 shadow-sm shadow-brand-primary/5'
                                : 'text-slate-400 hover:bg-brand-background hover:text-slate-100 border border-transparent'}
                        `}
                    >
                        <div className="flex items-center gap-3 font-outfit uppercase tracking-wider text-[11px]">
                            <item.icon size={18} className="flex-shrink-0" />
                            <span>{item.label}</span>
                        </div>
                        <ArrowUpRight size={14} className="opacity-0 group-hover:opacity-40 transition-opacity" />
                    </NavLink>
                ))}
            </nav>

            <div className="mt-auto pt-6 border-t border-brand-border">
                <div className="bg-brand-background/40 border border-brand-border rounded-lg p-4 relative overflow-hidden group">
                    <div className="flex items-center gap-3 relative z-10">
                        <div className="w-1.5 h-1.5 rounded-full bg-brand-accent animate-pulse shadow-[0_0_8px_rgba(6,182,212,0.5)]"></div>
                        <span className="text-[10px] font-bold text-slate-200 uppercase tracking-widest font-outfit">Core Active</span>
                    </div>
                    <p className="text-[10px] font-medium text-slate-400 mt-2 italic leading-relaxed">System monitoring enabled and synchronized with global nodes.</p>
                </div>
            </div>
        </aside>
    );
};

export default Sidebar;
