import React, { useEffect, useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { 
    LayoutDashboard, 
    Calendar, 
    ClipboardList, 
    CreditCard, 
    Clock, 
    Bell, 
    MessageSquare, 
    User, 
    LogOut, 
    Menu, 
    X,
    Shield,
    ChevronDown,
    Users,
    ChevronRight,
    Trophy,
    BookOpen,
    FileText,
    Megaphone,
    Sun,
    Trophy as TrophyIcon
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { fetchMyChildren, setSelectedChild } from '../../redux/slice/parent.slice';
import { logout } from '../../redux/slice/auth.slice';

const SidebarLink = ({ item, location }) => {
    const isActive = location.pathname === item.path;
    return (
        <Link
            to={item.path}
            className={`flex items-center gap-3 px-4 py-3.5 rounded-md transition-all duration-300 group relative ${
                isActive 
                ? 'bg-luxury-rose text-white shadow-lg shadow-luxury-rose/20' 
                : 'text-slate-400 hover:bg-slate-800/50 hover:text-white'
            }`}
        >
            <item.icon size={20} className={isActive ? 'text-white' : 'group-hover:text-luxury-rose transition-colors'} />
            <span className="font-bold text-[11px] uppercase tracking-[0.2em]">{item.label}</span>
            {isActive && (
                <motion.div layoutId="activeNav" className="absolute right-2 w-1.5 h-1.5 rounded-full bg-white" />
            )}
        </Link>
    );
};

const ParentLayout = () => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isChildSwitcherOpen, setIsChildSwitcherOpen] = useState(false);
    
    const location = useLocation();
    const navigate = useNavigate();
    const dispatch = useDispatch();
    
    const { user } = useSelector(state => state.auth);
    const { children, selectedChild, loading } = useSelector(state => state.parent);

    useEffect(() => {
        if (children.length === 0) {
            dispatch(fetchMyChildren());
        }
    }, [dispatch, children.length]);

    const handleLogout = () => {
        dispatch(logout());
        navigate('/login');
    };

    const navItems = [
        { icon: LayoutDashboard, label: 'Dashboard', path: '/parent' },
        { icon: Clock, label: 'Attendance', path: '/parent/attendance' },
        { icon: Trophy, label: 'Academics', path: '/parent/results' },
        { icon: FileText, label: 'Assignments', path: '/parent/assignments' },
        { icon: Clock, label: 'Timetable', path: '/parent/timetable' },
        { icon: CreditCard, label: 'Financial Ledger', path: '/parent/fees' },
        { icon: Shield, label: 'Conduct Registry', path: '/parent/behavior' },
        { icon: Calendar, label: 'PTM Protocols', path: '/parent/meetings' },
        { icon: Bell, label: 'Notifications', path: '/parent/notifications' },
        { icon: Calendar, label: 'Exams', path: '/parent/exams' },
        { icon: Megaphone, label: 'Announcements', path: '/parent/announcements' },
        { icon: MessageSquare, label: 'Messages', path: '/parent/messages' },
        { icon: Sun, label: 'Holidays', path: '/parent/holidays' },
        { icon: User, label: 'Profile', path: '/parent/profile' },
    ];

    return (
        <div className="min-h-screen bg-brand-background text-white font-inter flex">
            {/* Sidebar */}
            <aside className={`fixed inset-y-0 left-0 z-50 bg-brand-surface/40 backdrop-blur-3xl border-r border-brand-border/40 transition-all duration-500 ${isSidebarOpen ? 'w-80' : 'w-24'} hidden lg:block`}>
                <div className="flex flex-col h-full p-6">
                    {/* Header/Logo */}
                    <div className="flex items-center gap-4 mb-12 px-2">
                        <div className="w-12 h-12 rounded-md bg-gradient-to-br from-luxury-rose to-rose-400 flex items-center justify-center shadow-2xl">
                            <Users className="text-white w-6 h-6" />
                        </div>
                        {isSidebarOpen && (
                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col">
                                <span className="font-black text-xl tracking-tighter uppercase font-outfit leading-none">Parent</span>
                                <span className="text-[9px] font-black text-luxury-rose uppercase tracking-[0.3em]">Guardian Portal</span>
                            </motion.div>
                        )}
                    </div>

                    {/* Child Switcher */}
                    {isSidebarOpen && children.length > 0 && (
                        <div className="mb-10 px-2 relative">
                            <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] mb-3 ml-1">Observing Student</p>
                            <button 
                                onClick={() => setIsChildSwitcherOpen(!isChildSwitcherOpen)}
                                className="w-full bg-slate-900/50 border border-slate-800 rounded-md p-3 flex items-center justify-between group hover:border-luxury-rose/50 transition-all"
                            >
                                <div className="flex items-center gap-3 text-left">
                                    <div className="w-10 h-10 rounded-md bg-slate-800 flex items-center justify-center border border-slate-700">
                                        {selectedChild?.photo ? (
                                            <img src={selectedChild.photo} alt="" className="w-full h-full object-cover rounded-md" />
                                        ) : <User className="text-slate-500 w-5 h-5" />}
                                    </div>
                                    <div>
                                        <p className="font-black text-[11px] uppercase leading-tight">{selectedChild?.firstName} {selectedChild?.lastName}</p>
                                        <p className="text-[10px] text-slate-500 uppercase font-bold tracking-widest">{selectedChild?.admissionNumber}</p>
                                    </div>
                                </div>
                                <ChevronDown size={14} className={`text-slate-500 transition-transform ${isChildSwitcherOpen ? 'rotate-180' : ''}`} />
                            </button>

                            <AnimatePresence>
                                {isChildSwitcherOpen && (
                                    <motion.div 
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: 10 }}
                                        className="absolute top-full left-2 right-2 mt-2 bg-slate-900 border border-slate-800 rounded-md shadow-2xl z-[60] overflow-hidden"
                                    >
                                        {children.map(child => (
                                            <button
                                                key={child._id}
                                                onClick={() => {
                                                    dispatch(setSelectedChild(child));
                                                    setIsChildSwitcherOpen(false);
                                                }}
                                                className={`w-full p-4 flex items-center gap-4 hover:bg-slate-800 transition-colors border-b border-slate-800 last:border-0 ${selectedChild?._id === child._id ? 'bg-luxury-rose/10' : ''}`}
                                            >
                                                <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center overflow-hidden border border-slate-700">
                                                    {child.photo ? (
                                                       <img src={child.photo} alt="" className="w-full h-full object-cover" /> 
                                                    ) : <User size={14} className="text-slate-500" />}
                                                </div>
                                                <div className="text-left">
                                                    <p className={`font-black text-[10px] uppercase ${selectedChild?._id === child._id ? 'text-luxury-rose' : ''}`}>{child.firstName} {child.lastName}</p>
                                                    <p className="text-[9px] text-slate-500 uppercase tracking-widest">{child.standard?.name}</p>
                                                </div>
                                            </button>
                                        ))}
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    )}

                    {/* Navigation */}
                    <nav className="flex-1 space-y-2">
                        {navItems.map((item, idx) => (
                            <SidebarLink key={idx} item={item} location={location} />
                        ))}
                    </nav>

                    {/* Footer */}
                    <div className="border-t border-brand-border/40 pt-6 mt-6">
                        <button
                            onClick={handleLogout}
                            className="w-full flex items-center gap-3 px-4 py-4 rounded-md text-slate-400 hover:bg-luxury-rose/10 hover:text-luxury-rose transition-all group"
                        >
                            <LogOut size={20} className="group-hover:rotate-12 transition-transform" />
                            <span className="font-black text-[11px] uppercase tracking-[0.3em]">Sign Out</span>
                        </button>
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <main className={`flex-1 transition-all duration-500 ${isSidebarOpen ? 'lg:ml-80' : 'lg:ml-24'}`}>
                {/* Topbar */}
                <header className="sticky top-0 z-40 bg-brand-background/80 backdrop-blur-xl border-b border-brand-border/40 px-6 py-4">
                    <div className="flex items-center justify-between max-w-7xl mx-auto">
                        <div className="flex items-center gap-6">
                            <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-2 hover:bg-slate-800 rounded-md transition-colors hidden lg:block">
                                <Menu size={20} />
                            </button>
                            <h2 className="text-xl font-black uppercase tracking-tighter">
                                {navItems.find(i => location.pathname === i.path)?.label || 'Guardian Terminal'}
                            </h2>
                        </div>
                        
                        <div className="flex items-center gap-4">
                            <div className="hidden md:flex flex-col items-end mr-4">
                                <span className="font-black text-[11px] uppercase tracking-wider">{user?.firstName} {user?.lastName}</span>
                                <span className="text-[9px] font-black text-luxury-rose uppercase tracking-[0.3em] opacity-80">Connected Principal</span>
                            </div>
                            <div className="w-10 h-10 rounded-md bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700 flex items-center justify-center overflow-hidden">
                                {user?.photo ? (
                                    <img src={user.photo} alt="Parent Profile" className="w-full h-full object-cover" />
                                ) : <User className="text-slate-500" />}
                            </div>
                        </div>
                    </div>
                </header>

                <div className="p-6 lg:p-10 max-w-7xl mx-auto min-h-[calc(100vh-80px)]">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={location.pathname}
                            initial={{ opacity: 0, y: 15 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -15 }}
                            transition={{ duration: 0.3 }}
                        >
                            {children.length > 0 && selectedChild ? <Outlet /> : (
                                <div className="flex flex-col items-center justify-center h-full pt-40 opacity-50">
                                    <Users size={64} className="text-slate-600 mb-6" />
                                    <p className="font-black text-xl uppercase tracking-tighter">Initializing Guardian Sync...</p>
                                    <p className="text-sm font-medium text-slate-500 mt-2">Connecting to student records</p>
                                </div>
                            )}
                        </motion.div>
                    </AnimatePresence>
                </div>
            </main>
        </div>
    );
};

export default ParentLayout;
