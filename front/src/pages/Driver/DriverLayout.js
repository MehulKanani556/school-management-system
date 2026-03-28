import React, { useState, useEffect } from 'react';
import { NavLink, Outlet, useNavigate, useLocation, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '../../redux/slice/auth.slice';
import {
  LayoutDashboard, Truck, Users, MapPin, Map,
  MessageSquare, Menu, BookMarked, Clock, Calendar, Bell,
  LogOut, ChevronDown, ChevronRight, User, Globe, Navigation,
  ClipboardList, Wrench, Megaphone,
  Settings, UserPlus, Activity, Play, Square, Locate
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { fetchNotifications, receiveNotification } from '../../redux/slice/notification.slice';
import { useSocket } from '../../context/SocketContext';
import NotificationPanel from '../../components/NotificationPanel';
import toast from 'react-hot-toast';

const DriverLayout = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useSelector((state) => state.auth);
  const { socket } = useSocket();

  const navItems = [
    { to: '/driver', icon: LayoutDashboard, label: 'Main Page', end: true },
    {
        label: 'My Bus Trips',
        icon: Navigation,
        children: [
            { to: '/driver/active-trip', icon: Play, label: 'Start Duty / Trip', desc: 'Click to start your bus trip' },
            { to: '/driver/trip-history', icon: Activity, label: 'Past Trip History', desc: 'Your finished trips' },
            { to: '/driver/route-map', icon: MapPin, label: 'My Route Map', desc: 'See stops and roads' },
        ]
    },
    {
        label: 'Bus & My Health',
        icon: Truck,
        children: [
            { to: '/driver/maintenance', icon: Wrench, label: 'Complain/Fix Bus', desc: 'Report any bus problem' },
            { to: '/driver/attendance', icon: ClipboardList, label: 'My Day Attendance', desc: 'Daily duty check-in' },
        ]
    },
    {
        label: 'Messages/Notices',
        icon: MessageSquare,
        children: [
            { to: '/driver/messages', icon: MessageSquare, label: 'Talk to Office', desc: 'Chat with manager' },
            { to: '/driver/announcements', icon: Bell, label: 'New Notices', desc: 'Important school news' },
        ]
    },
    {
        label: 'My Profile',
        icon: User,
        children: [
            { to: '/driver/profile', icon: User, label: 'My Details', desc: 'Your personal info' },
            { to: '/driver/holidays', icon: Calendar, label: 'Holiday List', desc: 'School off-days' },
        ]
    }
  ];

  const { unreadCount: notifCount } = useSelector((state) => state.notifications);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [expanded, setExpanded] = useState(null);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [isTracking, setIsTracking] = useState(false);
  const [watchId, setWatchId] = useState(null);

  // Derived: check if there is an active trip
  const activeTrip = useSelector(state => state.transport.tripLogs?.find(log => log.status === 'In-Progress'));

  // Auto-start tracking when trip starts, and stop when trip ends
  useEffect(() => {
    if (activeTrip) {
        setIsTracking(true);
    } else {
        setIsTracking(false);
    }
  }, [activeTrip]);

  // GPS Tracking Logic
  useEffect(() => {
    if (isTracking && socket && user) {
        if ("geolocation" in navigator) {
            const id = navigator.geolocation.watchPosition(
                (position) => {
                    const { latitude, longitude, speed, heading } = position.coords;
                    socket.emit('UPDATE_DRIVER_LOCATION', {
                        driverId: user._id,
                        schoolId: user.schoolId,
                        location: { lat: latitude, lng: longitude },
                        speed,
                        heading,
                        timestamp: new Date()
                    });
                },
                (error) => {
                    console.error("GPS Error:", error);
                    toast.error("Unable to get GPS location. Please check browser permissions.");
                    setIsTracking(false);
                },
                { enableHighAccuracy: true, maximumAge: 10000, timeout: 5000 }
            );
            setWatchId(id);
        } else {
            toast.error("GPS is not supported by this phone/browser.");
            setIsTracking(false);
        }
    } else {
        if (watchId !== null) {
            navigator.geolocation.clearWatch(watchId);
            setWatchId(null);
        }
    }

    return () => {
        if (watchId !== null) navigator.geolocation.clearWatch(watchId);
    };
  }, [isTracking, socket, user]);

  useEffect(() => {
    dispatch(fetchNotifications());
  }, [dispatch]);

  useEffect(() => {
    if (!socket) return;
    socket.on('NEW_NOTIFICATION', (notif) => {
      dispatch(receiveNotification(notif));
      toast.success(`Priority: ${notif.title}`, {
        icon: '🚨',
        style: {
          borderRadius: '1.5rem',
          background: '#0f172a',
          color: '#fff',
          border: '1px solid #10b981',
          fontWeight: 900,
          textTransform: 'uppercase',
          letterSpacing: '0.1em',
          fontSize: '11px'
        }
      });
    });
    return () => socket.off('NEW_NOTIFICATION');
  }, [socket, dispatch]);

  useEffect(() => {
    const activeParent = navItems.find(item =>
      item.children?.some(child => location.pathname === child.to)
    );
    if (activeParent) setExpanded(activeParent.label);
  }, [location.pathname]);

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  const handleSettings = () => {
    navigate(`/driver/profile`);
    setShowProfileMenu(false);
  };

  const toggleSubmenu = (label) => {
    setExpanded(expanded === label ? null : label);
  };

  const isActive = (path) => location.pathname === path;

  return (
    <div className="h-screen bg-brand-background text-slate-100 flex font-outfit antialiased overflow-hidden">
      {/* Sidebar - Emerald Theme for Driver */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-72 bg-brand-surface border-r border-brand-border/60 flex flex-col transition-transform duration-300 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 lg:static lg:h-full font-outfit`}>
        <div className="p-8 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-md bg-gradient-to-br from-emerald-500 to-emerald-700 flex items-center justify-center font-black text-xl italic shadow-lg shadow-emerald-500/20 text-black">DR</div>
            <span className="text-xl font-black tracking-tight uppercase text-white">Driver <span className="text-emerald-500">Panel</span></span>
          </div>
        </div>

        <div className="px-6 mb-4">
            <button 
                onClick={() => setIsTracking(!isTracking)}
                className={`w-full py-3 rounded-md flex items-center justify-center gap-3 transition-all font-black text-[10px] uppercase tracking-widest ${isTracking ? 'bg-emerald-500/20 text-emerald-500 border border-emerald-500/40 shadow-lg shadow-emerald-500/10' : 'bg-brand-background border border-brand-border text-slate-500 hover:text-emerald-500 hover:border-emerald-500/40'}`}
            >
                {isTracking ? <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" /> : <Locate size={14} />}
                {isTracking ? 'GPS Running (GPS चालू है)' : 'Start GPS (GPS चालू करें)'}
            </button>
        </div>

        <nav className="flex-1 px-4 py-4 space-y-1 overflow-y-auto custom-scrollbar">
          <p className="px-4 mb-2 text-[10px] font-black uppercase tracking-[0.3em] text-slate-600 italic">Duty Menu (मेरा काम)</p>
          {navItems.map((item) => {
            const hasChildren = !!item.children;
            const isExpanded = expanded === item.label;
            const Icon = item.icon;

            if (!hasChildren) {
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  onClick={() => setSidebarOpen(false)}
                  className={`flex items-center gap-4 px-6 py-4 rounded-md transition-all duration-300 group ${isActive(item.to) ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/20' : 'text-slate-400 hover:bg-white/5 hover:text-white'}`}
                >
                  <Icon size={18} className={isActive(item.to) ? 'text-white' : 'group-hover:text-emerald-500 transition-colors'} />
                  <span className="text-[11px] font-black uppercase tracking-[0.15em]">{item.label}</span>
                  {isActive(item.to) && <ChevronRight size={14} className="ml-auto" />}
                </Link>
              );
            }

            return (
              <div key={item.label} className="space-y-1 font-outfit">
                <button
                  onClick={() => toggleSubmenu(item.label)}
                  className={`w-full flex items-center gap-4 px-6 py-4 rounded-md transition-all duration-300 group ${isExpanded ? 'bg-white/5 text-slate-100' : 'text-slate-400 hover:bg-white/5 hover:text-slate-100'}`}
                >
                  <Icon size={18} className={isExpanded ? 'text-emerald-500' : 'group-hover:text-emerald-500 transition-colors'} />
                  <span className="text-[11px] font-black uppercase tracking-[0.15em] flex-1 text-left">{item.label}</span>
                  <ChevronDown size={14} className={`transition-transform duration-300 ${isExpanded ? 'rotate-180 text-emerald-500' : 'opacity-40'}`} />
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
                          const childActive = isActive(child.to);
                          return (
                            <Link
                              key={child.to}
                              to={child.to}
                              onClick={() => setSidebarOpen(false)}
                              className={`flex items-center gap-3 px-6 py-3 rounded-md transition-all duration-300 group ${childActive ? 'text-emerald-500 bg-emerald-500/10' : 'text-slate-500 hover:text-slate-300 hover:bg-white/5'}`}
                            >
                              <ChildIcon size={16} className={`transition-opacity ${childActive ? 'opacity-100 text-emerald-500' : 'opacity-60 group-hover:opacity-100'}`} />
                              <span className="font-black text-[10px] uppercase tracking-[0.15em]">{child.label}</span>
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

        <div className="p-6 flex-shrink-0">
          <button onClick={handleLogout} className="w-full h-[42px] flex items-center gap-4 px-6 py-4 rounded-md text-slate-500 hover:bg-emerald-500/10 hover:text-emerald-500 transition-all group font-outfit border border-transparent hover:border-emerald-500/20 uppercase tracking-widest text-[11px] font-black">
            <LogOut size={20} />
            <span className="italic">Sign Out (बाहर निकलें)</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden font-outfit">
        {/* Header */}
        <header className="h-20 flex-shrink-0 flex items-center justify-between px-8 bg-brand-surface/80 backdrop-blur-xl border-b border-brand-border/60 z-10 w-full transition-all font-outfit">
          <div className="flex items-center gap-4 text-slate-500">
            <button onClick={() => setSidebarOpen(!sidebarOpen)} className="lg:hidden p-2 rounded-md hover:bg-white/5 transition-colors">
              <Menu size={20} />
            </button>
            <span className="text-[10px] font-black uppercase tracking-[0.4em] bg-brand-background px-4 py-2 rounded-md border border-brand-border hidden sm:block leading-none italic shadow-inner text-emerald-500">Bus Driver Portal (ड्राइवर पैनल)</span>
            <ChevronRight size={14} className="hidden sm:block opacity-20" />
            <span className="text-[10px] font-black uppercase tracking-[0.4em] text-emerald-500 italic">Duty Status: Active</span>
          </div>

          <div className="flex items-center gap-6">
            <div className="relative">
              <button
                onClick={() => setIsNotifOpen(!isNotifOpen)}
                className={`p-2.5 rounded-md border transition-all relative ${isNotifOpen ? 'bg-emerald-600 text-white border-emerald-600 shadow-xl shadow-emerald-600/20 scale-110' : 'bg-brand-background border-brand-border text-slate-400 hover:text-emerald-500 hover:border-emerald-500/40 shadow-inner'}`}
              >
                <Bell size={18} />
                <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-emerald-500 rounded-md border-2 border-brand-surface animate-pulse"></span>
              </button>
              <NotificationPanel isOpen={isNotifOpen} onClose={() => setIsNotifOpen(false)} role="Driver" />
            </div>

            <div className="h-10 w-px bg-brand-border/60"></div>

            <div className="flex items-center gap-4 relative">
              <button
                onClick={() => setShowProfileMenu(!showProfileMenu)}
                className="flex items-center gap-4 hover:opacity-80 transition-opacity"
              >
                <div className="text-right hidden sm:block">
                  <p className="text-sm font-black text-white italic tracking-tighter uppercase font-outfit leading-none mb-1">{user?.firstName} {user?.lastName}</p>
                  <p className="text-[9px] font-black text-emerald-500 uppercase tracking-[0.4em] opacity-80 leading-none italic">Verified Driver (स्कूल ड्राइवर)</p>
                </div>
                <div className="w-10 h-10 rounded-md bg-brand-background border border-brand-border overflow-hidden flex items-center justify-center shadow-xl hover:ring-2 hover:ring-emerald-500 transition-all p-0.5">
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
                          className="w-full flex items-center gap-3 px-4 py-3 rounded-md hover:bg-white/5 text-slate-300 hover:text-white transition-all text-[10px] font-black uppercase tracking-widest italic font-outfit">
                          <User size={18} className="text-emerald-500" />
                          My Profile
                        </button>

                        <div className="p-1 mb-1">
                          <div className="h-px bg-brand-border w-full" />
                        </div>
                        <button
                          onClick={handleLogout}
                          className="w-full flex items-center gap-3 px-4 py-3 rounded-md hover:bg-rose-500/10 text-rose-500 transition-all text-[10px] font-black uppercase tracking-widest group italic font-outfit"
                        >
                          <LogOut size={18} className="group-hover:-rotate-6 transition-transform" />
                          Sign Out
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

export default DriverLayout;
