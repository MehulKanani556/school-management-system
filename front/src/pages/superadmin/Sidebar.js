import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '../../redux/slice/auth.slice';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, ChevronRight, LayoutDashboard, Globe, Activity, DollarSign, Users, ShieldCheck, MessageSquare, Bell, LifeBuoy, Plane, Database, Settings, LogOut } from 'lucide-react';
import { getImageUrl } from '../../utils/imageHelper';

const Sidebar = () => {
    const dispatch = useDispatch();
    const location = useLocation();
    const { user } = useSelector(s => s.auth);
    const [expanded, setExpanded] = React.useState(null);

    const menuItems = [
        { to: '/superadmin', icon: LayoutDashboard, label: 'Dashboard', end: true },
        {
            label: 'School Management',
            icon: Globe,
            children: [
                { path: '/superadmin/schools', icon: Globe, label: 'Registered Schools' },
                { path: '/superadmin/analytics', icon: Activity, label: 'System Analytics' },
            ]
        },
        {
            label: 'User Management',
            icon: Users,
            children: [
                { path: '/superadmin/users', icon: Users, label: 'User Directory' },
            ]
        },
        {
            label: 'Communications',
            icon: Bell,
            children: [
                { path: '/superadmin/messages', icon: MessageSquare, label: 'Direct Messages' },
                { path: '/superadmin/notifications', icon: Bell, label: 'System Notifications' },
            ]
        },
        {
            label: 'System Settings',
            icon: ShieldCheck,
            children: [
                { path: '/superadmin/security', icon: ShieldCheck, label: 'Security & Auth' },
                { path: '/superadmin/backups', icon: Database, label: 'Database Backups' },
                { path: '/superadmin/settings', icon: Settings, label: 'General Settings' },
            ]
        },
        {
            label: 'Support & Help',
            icon: LifeBuoy,
            children: [
                { path: '/superadmin/support', icon: LifeBuoy, label: 'Support Tickets' },
                { path: '/superadmin/holidays', icon: Plane, label: 'Holiday Calendar' },
            ]
        },
    ];

    React.useEffect(() => {
        const activeParent = menuItems.find(item =>
            item.children?.some(child => location.pathname === child.path)
        );
        if (activeParent) setExpanded(activeParent.label);
    }, [location.pathname]);

    const handleLogout = () => {
        dispatch(logout());
    };

    const toggleSubmenu = (label) => {
        setExpanded(expanded === label ? null : label);
    };

    const isActive = (path) => location.pathname === path;

    return (
        <aside className="hidden lg:flex w-72 flex-col bg-brand-surface border-r border-brand-border/60 sticky top-0 h-screen z-20">
            <div className="p-8 flex-shrink-0">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-md bg-gradient-to-br from-superadmin-primary to-superadmin-secondary flex items-center justify-center font-black text-xl italic shadow-lg shadow-superadmin-primary/20 text-black">SA</div>
                    <div className="min-w-0">
                        <span className="text-xl font-black tracking-tight uppercase font-outfit leading-none text-white block">Edu<span className="text-superadmin-primary">Manage</span></span>
                        <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest mt-1 block truncate italic">Super Admin Portal</span>
                    </div>
                </div>
            </div>

            <nav className="flex-1 px-4 py-2 space-y-1 overflow-y-auto custom-scrollbar">
                <p className="px-4 mb-2 text-[10px] font-black uppercase tracking-[0.4em] text-slate-600 italic">Menu</p>
                {menuItems.map((item) => {
                    const hasChildren = !!item.children;
                    const isExpanded = expanded === item.label;
                    const Icon = item.icon;

                    if (!hasChildren) {
                        return (
                            <Link
                                key={item.to}
                                to={item.to}
                                className={`flex items-center gap-4 px-6 py-4 rounded-md transition-all duration-300 group ${isActive(item.to) ? 'bg-superadmin-primary text-black shadow-lg shadow-superadmin-primary/20' : 'text-slate-400 hover:bg-white/5 hover:text-white'}`}
                            >
                                <Icon size={18} className={isActive(item.to) ? 'text-black' : 'group-hover:text-superadmin-primary transition-colors'} />
                                <span className="text-[11px] font-black uppercase tracking-[0.15em] font-outfit flex-1">{item.label}</span>
                                {isActive(item.to) && <ChevronRight size={14} className="ml-auto" />}
                            </Link>
                        );
                    }

                    return (
                        <div key={item.label} className="space-y-1">
                            <button
                                onClick={() => toggleSubmenu(item.label)}
                                className={`w-full flex items-center gap-4 px-6 py-4 rounded-md transition-all duration-300 group ${isExpanded ? 'bg-white/5 text-slate-100' : 'text-slate-400 hover:bg-white/5 hover:text-slate-100'}`}
                            >
                                <Icon size={18} className={isExpanded ? 'text-superadmin-primary' : 'group-hover:text-superadmin-primary transition-colors'} />
                                <span className="text-[11px] font-black uppercase tracking-[0.15em] font-outfit flex-1 text-left">{item.label}</span>
                                <ChevronDown size={14} className={`transition-transform duration-300 ${isExpanded ? 'rotate-180 text-superadmin-primary' : 'opacity-40'}`} />
                            </button>

                            <AnimatePresence>
                                {isExpanded && (
                                    <motion.div
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: 'auto' }}
                                        exit={{ opacity: 0, height: 0 }}
                                        className="overflow-hidden bg-brand-background/30 rounded-md mx-2 border border-brand-border/40"
                                    >
                                        <div className="py-1 space-y-1">
                                            {item.children.map((child) => {
                                                const ChildIcon = child.icon;
                                                const childActive = isActive(child.path);
                                                return (
                                                    <Link
                                                        key={child.path}
                                                        to={child.path}
                                                        className={`flex items-center gap-4 px-8 py-3 rounded-md transition-all duration-300 group ${childActive ? 'text-superadmin-primary bg-superadmin-primary/10' : 'text-slate-500 hover:text-white hover:bg-white/5'}`}
                                                    >
                                                        <ChildIcon size={16} className={childActive ? 'text-superadmin-primary' : 'opacity-60 group-hover:opacity-100 transition-colors'} />
                                                        <span className="text-[10px] font-black uppercase tracking-[0.1em] font-outfit">{child.label}</span>
                                                    </Link>
                                                );
                                            })}
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    );
                })}
            </nav>

            <div className="p-6 border-t border-brand-border/40 flex-shrink-0">
                <div className="flex items-center gap-4 p-4 rounded-md bg-white/[0.03] border border-white/5 mb-4 group cursor-pointer hover:bg-white/[0.05] transition-all">
                    <div className="w-10 h-10 rounded-md bg-slate-800 overflow-hidden shrink-0 border border-white/10 group-hover:border-superadmin-primary/40 transition-all">
                        {getImageUrl(user?.photo) ? <img src={getImageUrl(user.photo)} alt="" className="w-full h-full object-cover" /> : <Users className="w-full h-full p-2 text-slate-600" />}
                    </div>
                    <div className="min-w-0">
                        <p className="text-[10px] font-black text-white uppercase italic truncate mb-1 leading-none">{user?.firstName} {user?.lastName}</p>
                        <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest truncate leading-none">SUPER ADMIN</p>
                    </div>
                </div>
                <button onClick={handleLogout} className="w-full flex items-center gap-4 px-6 py-4 rounded-md text-slate-500 hover:bg-superadmin-primary/10 hover:text-superadmin-primary transition-all group font-outfit border border-transparent hover:border-superadmin-primary/20 uppercase tracking-widest text-[11px] font-black">
                    <LogOut size={20} />
                    <span className="italic">Log Out</span>
                </button>
            </div>
        </aside>
    );
};

export default Sidebar;
