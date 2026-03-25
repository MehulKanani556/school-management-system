import React, { useState, useEffect } from 'react';
import { NavLink, Outlet, useNavigate, useLocation, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '../../redux/slice/auth.slice';
import {
  LayoutDashboard, Book, Users, BookOpen,
  MessageSquare, Menu, BookMarked, Clock, Calendar, Bell, 
  LogOut, ChevronDown, ChevronRight, User, Globe, Library
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { fetchNotifications, receiveNotification } from '../../redux/slice/notification.slice';
import { useSocket } from '../../context/SocketContext';
import NotificationPanel from '../../components/NotificationPanel';
import toast from 'react-hot-toast';

const navItems = [
  { to: '/librarian', icon: LayoutDashboard, label: 'Archive Deck', end: true },
  { to: '/librarian/inventory', icon: Book, label: 'Asset Ledger' },
  { to: '/librarian/records', icon: Clock, label: 'Active Threads' },
  { to: '/librarian/categories', icon: Library, label: 'Categorical Matrix' },
  { to: '/librarian/reservations', icon: BookOpen, label: 'Volume Waitlist' },
  { to: '/librarian/history', icon: BookMarked, label: 'Circulation Archive' },
  { to: '/librarian/students', icon: Users, label: 'Member Registry' },
  { to: '/librarian/messages', icon: MessageSquare, label: 'Archive Comm' },
  { to: '/librarian/announcements', icon: Bell, label: 'Directives' },
  { to: '/librarian/holidays', icon: Calendar, label: 'Term Pauses' },
];

const LibrarianLayout = () => {
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
    if (!socket) return;
    socket.on('new_notification', (notif) => {
      dispatch(receiveNotification(notif));
      toast.success(`Archive Alert: ${notif.title}`, {
        icon: '📚',
        style: {
          borderRadius: '1.5rem',
          background: '#0f172a',
          color: '#fff',
          border: '1px solid #14b8a6',
          fontWeight: 900,
          textTransform: 'uppercase',
          letterSpacing: '0.1em',
          fontSize: '11px'
        }
      });
    });
    return () => socket.off('new_notification');
  }, [socket, dispatch]);

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  const handleSettings = () => {
    navigate('/librarian/profile');
    setShowProfileMenu(false);
  };

  const isActive = (path) => location.pathname === path;

  return (
    <div className="h-screen bg-brand-background text-slate-100 flex font-inter antialiased overflow-hidden">
      {/* Sidebar - Terminal Aesthetic with Librarian Theme (Teal) */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-72 bg-brand-surface border-r border-brand-border/60 flex flex-col transition-transform duration-300 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 lg:static lg:h-full`}>
        <div className="p-8 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-md bg-gradient-to-br from-librarian-primary to-librarian-secondary flex items-center justify-center font-black text-xl italic shadow-lg shadow-librarian-primary/20 text-black">AK</div>
            <span className="text-xl font-black tracking-tight uppercase font-outfit text-white">Archive <span className="text-librarian-primary">Node</span></span>
          </div>
        </div>

        <nav className="flex-1 px-4 py-4 space-y-1 overflow-y-auto custom-scrollbarThin">
          <p className="px-4 mb-2 text-[10px] font-black uppercase tracking-[0.3em] text-slate-600 italic">Knowledge Custodian</p>
          {navItems.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              onClick={() => setSidebarOpen(false)}
              className={`flex items-center gap-4 px-6 py-4 rounded-md transition-all duration-300 group ${isActive(item.to) ? 'bg-librarian-primary text-black shadow-lg shadow-librarian-primary/20' : 'text-slate-400 hover:bg-white/5 hover:text-white'}`}
            >
              <item.icon size={18} className={isActive(item.to) ? 'text-black' : 'group-hover:text-librarian-primary transition-colors'} />
              <span className="text-[11px] font-black uppercase tracking-[0.15em] font-outfit">{item.label}</span>
              {isActive(item.to) && <ChevronRight size={14} className="ml-auto" />}
            </Link>
          ))}
        </nav>

        <div className="p-6 flex-shrink-0">
          <button onClick={handleLogout} className="w-full flex items-center gap-4 px-6 py-4 rounded-md text-slate-500 hover:bg-librarian-primary/10 hover:text-librarian-primary transition-all group font-outfit border border-transparent hover:border-librarian-primary/20 uppercase tracking-widest text-[11px] font-black">
            <LogOut size={20} />
            <span className="italic">Shutdown</span>
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
            <span className="text-[10px] font-black uppercase tracking-[0.4em] bg-brand-background px-4 py-2 rounded-md border border-brand-border hidden sm:block leading-none italic shadow-inner">Archive Oversight</span>
            <ChevronRight size={14} className="hidden sm:block opacity-20" />
            <span className="text-[10px] font-black uppercase tracking-[0.4em] text-librarian-primary italic">Librarian Terminal</span>
          </div>

          <div className="flex items-center gap-6">
            <div className="relative">
              <button
                onClick={() => setIsNotifOpen(!isNotifOpen)}
                className={`p-2.5 rounded-md border transition-all relative ${isNotifOpen ? 'bg-librarian-primary text-black border-librarian-primary shadow-xl shadow-librarian-primary/20 scale-110' : 'bg-brand-background border-brand-border text-slate-400 hover:text-librarian-primary hover:border-librarian-primary/40 shadow-inner'}`}
              >
                <Bell size={18} />
                <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-librarian-primary rounded-md border-2 border-brand-surface animate-pulse"></span>
              </button>
              <NotificationPanel isOpen={isNotifOpen} onClose={() => setIsNotifOpen(false)} role="Librarian" />
            </div>

            <div className="h-10 w-px bg-brand-border/60"></div>

            <div className="flex items-center gap-4 relative">
              <button 
                onClick={() => setShowProfileMenu(!showProfileMenu)}
                className="flex items-center gap-4 hover:opacity-80 transition-opacity"
              >
                <div className="text-right hidden sm:block">
                  <p className="text-sm font-black text-white italic tracking-tighter uppercase font-outfit leading-none mb-1">{user?.firstName} {user?.lastName}</p>
                  <p className="text-[9px] font-black text-librarian-primary uppercase tracking-[0.4em] opacity-80 leading-none italic">Asset Guardian</p>
                </div>
                <div className="w-10 h-10 rounded-md bg-brand-background border border-brand-border overflow-hidden flex items-center justify-center shadow-xl hover:ring-2 hover:ring-librarian-primary transition-all p-0.5">
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
                          <User size={18} className="text-librarian-primary" />
                          View Profile
                        </button>

                        <div className="p-1 mb-1">
                          <div className="h-px bg-brand-border w-full" />
                        </div>
                        <button
                          onClick={handleLogout}
                          className="w-full flex items-center gap-3 px-4 py-3 rounded-md hover:bg-librarian-primary/10 text-librarian-primary transition-all text-[10px] font-black uppercase tracking-widest group italic"
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

export default LibrarianLayout;
