import React, { useState, useEffect } from 'react';
import { NavLink, Outlet, useNavigate, useLocation, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '../../redux/slice/auth.slice';
import {
  LayoutDashboard, Truck, Users, MapPin,
  MessageSquare, Menu, BookMarked, Clock, Calendar, Bell, 
  LogOut, ChevronDown, ChevronRight, User, Globe, Navigation,
  ClipboardList, Wrench, Megaphone,
  Settings
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { fetchNotifications, receiveNotification } from '../../redux/slice/notification.slice';
import { useSocket } from '../../context/SocketContext';
import NotificationPanel from '../../components/NotificationPanel';
import toast from 'react-hot-toast';

const navItems = [
  { to: '/transporter', icon: LayoutDashboard, label: 'Operations Deck', end: true },
  { 
    label: 'Fleet Command', 
    icon: Truck, 
    id: 'fleet',
    children: [
      { to: '/transporter/vehicles', label: 'Fleet Matrix' },
      { to: '/transporter/Maintenancetransport', label: 'Maintenance Logs' },
      { to: '/transporter/tracking', label: 'Fleet Radar' },
    ] 
  },
  {
    label: 'Transit Logistics',
    icon: MapPin,
    id: 'logistics',
    children: [
      { to: '/transporter/routes', label: 'Logistics Map' },
      { to: '/transporter/students', label: 'Transit Registry' },
      { to: '/transporter/logs', label: 'Transit Logs' },
    ]
  },
  {
    label: 'Personnel Hub',
    icon: User,
    id: 'personnel',
    children: [
      { to: '/transporter/drivers', label: 'Driver Registry' },
    ]
  },
  {
    label: 'Intelligence Center',
    icon: Bell,
    id: 'intel',
    children: [
      { to: '/transporter/notifications', label: 'Signal Alerts' },
      { to: '/transporter/announcements', label: 'Bulletins' },
      { to: '/transporter/messages', label: 'Transit Comm' },
    ]
  },
  {
    label: 'Institutional Config',
    icon: Settings,
    id: 'config',
    children: [
      { to: '/transporter/holidays', label: 'Temporal Break' },
      { to: '/transporter/profile', label: 'Core Identity' },
    ]
  }
];

const TransporterLayout = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useSelector((state) => state.auth);
  const { unreadCount: notifCount } = useSelector((state) => state.notifications);
  const { socket } = useSocket();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [expanded, setExpanded] = useState(null);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  useEffect(() => {
    dispatch(fetchNotifications());
  }, [dispatch]);

  useEffect(() => {
    // Auto-expand current active group
    navItems.forEach(item => {
      if (item.children?.some(child => location.pathname === child.to)) {
        setExpanded(item.id);
      }
    });
  }, [location.pathname]);

  useEffect(() => {
    if (!socket) return;
    socket.on('NEW_NOTIFICATION', (notif) => {
      dispatch(receiveNotification(notif));
      toast.success(`Transit Alert: ${notif.title}`, {
        icon: '🚛',
        style: {
          borderRadius: '1.5rem',
          background: '#0f172a',
          color: '#fff',
          border: '1px solid #f97316',
          fontWeight: 900,
          textTransform: 'uppercase',
          letterSpacing: '0.1em',
          fontSize: '11px'
        }
      });
    });
    return () => socket.off('NEW_NOTIFICATION');
  }, [socket, dispatch]);

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  const handleSettings = () => {
    navigate('/transporter/profile');
    setShowProfileMenu(false);
  };

  const isActive = (path) => location.pathname === path;

  return (
    <div className="h-screen bg-brand-background text-slate-100 flex font-inter antialiased overflow-hidden">
      {/* Sidebar - Terminal Aesthetic with Transporter Theme (Orange) */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-72 bg-brand-surface border-r border-brand-border/60 flex flex-col transition-transform duration-300 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 lg:static lg:h-full`}>
        <div className="p-8 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-md bg-gradient-to-br from-transporter-primary to-transporter-secondary flex items-center justify-center font-black text-xl italic shadow-lg shadow-transporter-primary/20 text-black">TK</div>
            <span className="text-xl font-black tracking-tight uppercase font-outfit text-white">Transit <span className="text-transporter-primary">Node</span></span>
          </div>
        </div>

        <nav className="flex-1 px-4 py-4 space-y-1 overflow-y-auto custom-scrollbarThin">
          <p className="px-4 mb-4 text-[10px] font-black uppercase tracking-[0.3em] text-slate-600 italic">Logistics Systems</p>
          <div className="space-y-1">
            {navItems.map((item) => (
              <div key={item.id || item.to} className="space-y-1">
                {item.children ? (
                  <>
                    <button
                      onClick={() => setExpanded(expanded === item.id ? null : item.id)}
                      className={`w-full flex items-center gap-4 px-6 py-4 rounded-md transition-all duration-300 group ${expanded === item.id ? 'bg-white/5 text-white' : 'text-slate-400 hover:bg-white/5 hover:text-white'}`}
                    >
                      <item.icon size={18} className={expanded === item.id ? 'text-transporter-primary' : 'group-hover:text-transporter-primary transition-colors'} />
                      <span className="text-[11px] font-black uppercase tracking-[0.15em] font-outfit text-left flex-1">{item.label}</span>
                      <motion.div animate={{ rotate: expanded === item.id ? 180 : 0 }}>
                        <ChevronDown size={14} className="opacity-40" />
                      </motion.div>
                    </button>
                    <AnimatePresence>
                      {expanded === item.id && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="overflow-hidden bg-black/20 rounded-md mx-2"
                        >
                          <div className="py-2 pl-12 pr-4 space-y-1">
                            {item.children.map((child) => (
                              <Link
                                key={child.to}
                                to={child.to}
                                onClick={() => setSidebarOpen(false)}
                                className={`flex items-center gap-3 py-3 rounded-md transition-all duration-300 group relative ${isActive(child.to) ? 'text-transporter-primary' : 'text-slate-500 hover:text-white'}`}
                              >
                                {isActive(child.to) && (
                                  <motion.div layoutId="activeSub" className="absolute left-[-20px] w-1 h-4 bg-transporter-primary rounded-full shadow-[0_0_10px_rgba(249,115,22,0.5)]" />
                                )}
                                <span className={`text-[10px] font-bold uppercase tracking-widest font-outfit ${isActive(child.to) ? 'italic' : ''}`}>{child.label}</span>
                              </Link>
                            ))}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </>
                ) : (
                  <Link
                    to={item.to}
                    onClick={() => {
                      setSidebarOpen(false);
                      setExpanded(null);
                    }}
                    className={`flex items-center gap-4 px-6 py-4 rounded-md transition-all duration-300 group ${isActive(item.to) ? 'bg-transporter-primary text-black shadow-lg shadow-transporter-primary/20' : 'text-slate-400 hover:bg-white/5 hover:text-white'}`}
                  >
                    <item.icon size={18} className={isActive(item.to) ? 'text-black' : 'group-hover:text-transporter-primary transition-colors'} />
                    <span className="text-[11px] font-black uppercase tracking-[0.15em] font-outfit">{item.label}</span>
                    {isActive(item.to) && <ChevronRight size={14} className="ml-auto" />}
                  </Link>
                )}
              </div>
            ))}
          </div>
        </nav>

        <div className="p-6 flex-shrink-0">
          <button onClick={handleLogout} className="w-full flex items-center gap-4 px-6 py-4 rounded-md text-slate-500 hover:bg-transporter-primary/10 hover:text-transporter-primary transition-all group font-outfit border border-transparent hover:border-transporter-primary/20 uppercase tracking-widest text-[11px] font-black">
            <LogOut size={20} />
            <span className="italic">Shutdown System</span>
          </button>
        </div>
      </aside>


      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
        {/* Header - Stays at top */}
        <header className="h-20 flex-shrink-0 flex items-center justify-between px-8 bg-brand-surface/80 backdrop-blur-xl border-b border-brand-border/60 z-10 w-full transition-all">
          <div className="flex items-center gap-4 text-slate-500">
            <button onClick={() => setSidebarOpen(!sidebarOpen)} className="lg:hidden p-2 rounded-md hover:bg-white/5 transition-colors">
              <Menu size={20} />
            </button>
            <span className="text-[10px] font-black uppercase tracking-[0.4em] bg-brand-background px-4 py-2 rounded-md border border-brand-border hidden sm:block leading-none italic shadow-inner">Transit Operations</span>
            <ChevronRight size={14} className="hidden sm:block opacity-20" />
            <span className="text-[10px] font-black uppercase tracking-[0.4em] text-transporter-primary italic">Transporter Terminal</span>
          </div>

          <div className="flex items-center gap-6">
            <div className="relative">
              <button
                onClick={() => setIsNotifOpen(!isNotifOpen)}
                className={`p-2.5 rounded-md border transition-all relative ${isNotifOpen ? 'bg-transporter-primary text-black border-transporter-primary shadow-xl shadow-transporter-primary/20 scale-110' : 'bg-brand-background border-brand-border text-slate-400 hover:text-transporter-primary hover:border-transporter-primary/40 shadow-inner'}`}
              >
                <Bell size={18} />
                <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-transporter-primary rounded-md border-2 border-brand-surface animate-pulse"></span>
              </button>
              <NotificationPanel isOpen={isNotifOpen} onClose={() => setIsNotifOpen(false)} role="Transporter" />
            </div>

            <div className="h-10 w-px bg-brand-border/60"></div>

            <div className="flex items-center gap-4 relative">
              <button 
                onClick={() => setShowProfileMenu(!showProfileMenu)}
                className="flex items-center gap-4 hover:opacity-80 transition-opacity"
              >
                <div className="text-right hidden sm:block">
                  <p className="text-sm font-black text-white italic tracking-tighter uppercase font-outfit leading-none mb-1">{user?.firstName} {user?.lastName}</p>
                  <p className="text-[9px] font-black text-transporter-primary uppercase tracking-[0.4em] opacity-80 leading-none italic">Institutional Transporter</p>
                </div>
                <div className="w-10 h-10 rounded-md bg-brand-background border border-brand-border overflow-hidden flex items-center justify-center shadow-xl hover:ring-2 hover:ring-transporter-primary transition-all p-0.5">
                  <div className="w-full h-full rounded-md overflow-hidden bg-brand-surface border border-brand-border flex items-center justify-center">
                    {user?.photo ? <img src={user.photo} alt="" className="w-full h-full object-cover" /> : <User size={20} className="text-slate-600" />}
                  </div>
                </div>
              </button>

              <AnimatePresence>
                {showProfileMenu && (
                  <>
                    <div
                      className="fixed inset-0 z-10"
                      onClick={() => setShowProfileMenu(false)}
                    />
                    <motion.div
                      initial={{ opacity: 0, y: 15, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 15, scale: 0.95 }}
                      className="absolute right-0 top-[calc(100%+12px)] z-20 w-64 p-3 rounded-md bg-brand-surface border border-brand-border shadow-3xl backdrop-blur-2xl"
                    >
                      <div className="px-5 py-4 border-b border-brand-border mb-2 text-center">
                        <p className="text-sm font-black uppercase text-white tracking-widest leading-none mb-1 font-outfit italic">
                          {user?.firstName} {user?.lastName}
                        </p>
                        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest italic">{user?.email}</p>
                      </div>

                      <div className="space-y-1">
                        <button
                          onClick={handleSettings}
                          className="w-full flex items-center gap-3 px-4 py-3 rounded-md hover:bg-white/5 text-slate-300 hover:text-white transition-all text-[10px] font-black uppercase tracking-widest italic">
                          <User size={18} className="text-transporter-primary" />
                          View Profile
                        </button>

                        <div className="p-1 mb-1">
                          <div className="h-px bg-brand-border w-full" />
                        </div>
                        <button
                          onClick={handleLogout}
                          className="w-full flex items-center gap-3 px-4 py-3 rounded-md hover:bg-rose-500/10 text-rose-500 transition-all text-[10px] font-black uppercase tracking-widest group italic"
                        >
                          <LogOut size={18} className="group-hover:-rotate-6 transition-transform" />
                          Log Out Matrix
                        </button>
                      </div>
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>
          </div>
        </header>

        {/* This section scrolls */}
        <main className="flex-1 overflow-y-auto p-4 lg:p-8 custom-scrollbar">
          <Outlet />
        </main>
      </div>

      {sidebarOpen && (
        <div className="fixed inset-0 z-40 bg-black/80 backdrop-blur-sm lg:hidden transition-all duration-300" onClick={() => setSidebarOpen(false)} />
      )}
    </div>
  );
};

export default TransporterLayout;
