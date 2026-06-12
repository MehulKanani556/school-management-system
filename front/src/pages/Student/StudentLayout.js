import React, { useState, useEffect } from 'react';
import { NavLink, Outlet, useNavigate, useLocation, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '../../redux/slice/auth.slice';
import {
  LayoutDashboard, BookOpen, CalendarCheck, ClipboardList, Book,
  MessageSquare, Menu, X, User, ChevronRight, BookMarked,
  Clock, Calendar, Bell, LogOut, ChevronDown, CalendarDays, Brain, Globe, CreditCard,
  Award, Download, Megaphone, GraduationCap, Truck
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { fetchNotifications, receiveNotification } from '../../redux/slice/notification.slice';
import { fetchStudentAttendance } from '../../redux/slice/student.slice';
import { useSocket } from '../../context/SocketContext';
import NotificationPanel from '../../components/NotificationPanel';
import AcademicYearSwitcher from '../../components/AcademicYearSwitcher';
import toast from 'react-hot-toast';

const StudentLayout = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useSelector((state) => state.auth);

  const navItems = [
    { to: '/student', icon: LayoutDashboard, label: 'Dashboard', end: true },
    {
      label: 'Academic Records',
      icon: GraduationCap,
      children: [
        { to: '/student/attendance', icon: ClipboardList, label: 'My Attendance' },
        { to: '/student/results', icon: Award, label: 'Exams & Results' },
        { to: '/student/timetable', icon: Calendar, label: 'Class Timetable' },
        { to: '/student/exams', icon: BookOpen, label: 'Online Exams' },
        { to: '/student/assignments', icon: Download, label: 'Homework/Assignments' },
        { to: '/student/e-learning', icon: Brain, label: 'Study Materials/Quizzes' },
      ]
    },
    {
      label: 'Communication',
      icon: Globe,
      children: [
        { to: '/student/notifications', icon: Bell, label: 'Notifications' },
        { to: '/student/announcements', icon: Megaphone, label: 'School Announcements' },
        { to: '/student/messages', icon: MessageSquare, label: 'Chat & Messages' },
        { to: '/student/holidays', icon: Clock, label: 'Holiday List' },
      ]
    },
    {
      label: 'Fee Management',
      icon: CreditCard,
      children: [
        { to: '/student/fees', icon: CreditCard, label: 'Fee Payment' },
      ]
    },
    {
      label: 'Campus Life',
      icon: Globe,
      children: [
        { to: '/student/library', icon: Book, label: 'School Library' },
        { to: '/student/transport', icon: Truck, label: 'My Bus Tracking' },
      ]
    },
    {
      label: 'Profile Settings',
      icon: User,
      children: [
        { to: '/student/profile', icon: User, label: 'My Profile' },
      ]
    }
  ];

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
    socket.on('NEW_NOTIFICATION', (notif) => {
      dispatch(receiveNotification(notif));
      if (notif.type === 'Message') return;
      toast.success(`New Notification: ${notif.title}`, {
        icon: '🎯',
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

    socket.on('ATTENDANCE_UPDATED', (data) => {
      dispatch(fetchStudentAttendance());
      toast.success('📝 Attendance telemetry updated!', {
        icon: '📝',
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

    return () => {
      socket.off('NEW_NOTIFICATION');
      socket.off('ATTENDANCE_UPDATED');
    };
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
    navigate(`/student/profile`);
    setShowProfileMenu(false);
  };

  const toggleSubmenu = (label) => {
    setExpanded(expanded === label ? null : label);
  };

  const isActive = (path) => location.pathname === path;

  return (
    <div className="h-screen bg-brand-background text-slate-100 flex font-inter antialiased overflow-hidden">
      {/* Sidebar - Terminal Aesthetic with Student Theme */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-72 bg-brand-surface border-r border-brand-border/60 flex flex-col transition-transform duration-300 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 lg:static lg:h-full font-outfit`}>
        <div className="p-8 flex-shrink-0 font-outfit">
          <div className="flex items-center gap-3 font-outfit">
            <div className="w-10 h-10 rounded-md bg-gradient-to-br from-brand-primary to-brand-secondary flex items-center justify-center font-black text-xl italic shadow-lg">SM</div>
            <span className="text-xl font-black tracking-tight uppercase font-outfit text-white">Student <span className="text-brand-primary">Portal</span></span>
          </div>
        </div>

        <nav className="flex-1 px-4 py-4 space-y-1 overflow-y-auto custom-scrollbar font-outfit">
          <p className="px-4 mb-2 text-[10px] font-black uppercase tracking-[0.3em] text-slate-600 italic">Navigation</p>
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
                  className={`flex items-center gap-4 px-6 py-4 rounded-md transition-all duration-300 group ${isActive(item.to) ? 'bg-brand-primary text-black shadow-lg shadow-brand-primary/20' : 'text-slate-400 hover:bg-white/5 hover:text-slate-100 italic'}`}
                >
                  <Icon size={18} className={isActive(item.to) ? 'text-black' : 'group-hover:text-brand-primary transition-colors'} />
                  <span className="text-[11px] font-black uppercase tracking-[0.15em] font-outfit">{item.label}</span>
                  {isActive(item.to) && <ChevronRight size={14} className="ml-auto" />}
                </Link>
              );
            }

            return (
              <div key={item.label} className="space-y-1 font-outfit">
                <button
                  onClick={() => toggleSubmenu(item.label)}
                  className={`w-full flex items-center gap-4 px-6 py-4 rounded-md transition-all duration-300 group italic ${isExpanded ? 'bg-white/5 text-slate-100' : 'text-slate-400 hover:bg-white/5 hover:text-slate-100'}`}
                >
                  <Icon size={18} className={isExpanded ? 'text-brand-primary' : 'group-hover:text-brand-primary transition-colors'} />
                  <span className="text-[11px] font-black uppercase tracking-[0.15em] font-outfit flex-1 text-left">{item.label}</span>
                  <ChevronDown size={14} className={`transition-transform duration-300 ${isExpanded ? 'rotate-180 text-brand-primary' : 'opacity-40'}`} />
                </button>

                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="overflow-hidden pl-4 space-y-1 font-outfit"
                    >
                      {item.children.map((child) => {
                        const ChildIcon = child.icon;
                        const childActive = isActive(child.to);
                        return (
                          <Link
                            key={child.to}
                            to={child.to}
                            onClick={() => setSidebarOpen(false)}
                            className={`flex items-center gap-3 px-6 py-3 rounded-md transition-all duration-300 group italic ${childActive ? 'text-brand-primary bg-brand-primary/10' : 'text-slate-500 hover:text-slate-300 hover:bg-white/5'}`}
                          >
                            <ChildIcon size={16} className={`transition-opacity ${childActive ? 'opacity-100 text-brand-primary' : 'opacity-60 group-hover:opacity-100'}`} />
                            <span className="font-black text-[10px] uppercase tracking-[0.15em] font-outfit">{child.label}</span>
                          </Link>
                        );
                      })}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </nav>

        <div className="p-6 flex-shrink-0 font-outfit">
          <button onClick={handleLogout} className="w-full flex items-center gap-4 px-6 py-4 rounded-md text-slate-500 hover:bg-brand-primary/10 hover:text-brand-primary transition-all group font-outfit uppercase tracking-widest text-[11px] font-black border border-transparent hover:border-brand-primary/20 italic">
            <LogOut size={20} />
            <span>Log out</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden font-outfit">
        {/* Header - Stays at top */}
        <header className="h-20 flex-shrink-0 flex items-center justify-between px-8 bg-brand-surface/80 backdrop-blur-xl border-b border-brand-border/60 z-10 w-full transition-all font-outfit">
          <div className="flex items-center gap-4 text-slate-500 font-outfit">
            <button onClick={() => setSidebarOpen(!sidebarOpen)} className="lg:hidden p-2 rounded-md hover:bg-white/5 transition-colors font-outfit">
              <Menu size={20} />
            </button>
            <span className="text-[10px] font-black uppercase tracking-[0.4em] bg-brand-background px-4 py-2 rounded-md border border-brand-border hidden sm:block leading-none italic shadow-inner">School System</span>
            <ChevronRight size={14} className="hidden sm:block opacity-20" />
            <span className="text-[10px] font-black uppercase tracking-[0.4em] text-brand-primary italic font-outfit">Student Portal</span>
          </div>

          <div className="flex items-center gap-6 font-outfit">
            <AcademicYearSwitcher />

            <div className="relative font-outfit">
              <button
                onClick={() => setIsNotifOpen(!isNotifOpen)}
                className={`p-2.5 rounded-md border transition-all relative ${isNotifOpen ? 'bg-brand-primary text-black border-brand-primary shadow-xl shadow-brand-primary/20 scale-110' : 'bg-brand-background border-brand-border text-slate-400 hover:text-brand-primary hover:border-brand-primary/40'}`}
              >
                <Bell size={18} />
                {notifCount > 0 && <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-brand-primary rounded-md border-2 border-brand-surface animate-pulse font-outfit"></span>}
              </button>
              <NotificationPanel isOpen={isNotifOpen} onClose={() => setIsNotifOpen(false)} role="Student" />
            </div>

            <div className="h-10 w-px bg-brand-border/60"></div>

            <div className="flex items-center gap-4 relative font-outfit">
              <button
                onClick={() => setShowProfileMenu(!showProfileMenu)}
                className="flex items-center gap-4 hover:opacity-80 transition-opacity font-outfit"
              >
                <div className="text-right hidden sm:block font-outfit">
                  <p className="text-sm font-black text-white italic tracking-tighter uppercase font-outfit leading-none mb-1 font-outfit">{user?.firstName} {user?.lastName}</p>
                  <p className="text-[9px] font-black text-brand-primary uppercase tracking-[0.4em] mt-1.5 opacity-80 leading-none italic font-outfit">Admission ID: 00{user?._id.toString().slice(-3)}</p>
                </div>
                <div className="w-10 h-10 rounded-md bg-brand-background border border-brand-border overflow-hidden flex items-center justify-center shadow-xl hover:ring-2 hover:ring-brand-primary transition-all p-0.5 font-outfit">
                  <div className="w-full h-full rounded-md overflow-hidden bg-brand-surface border border-brand-border flex items-center justify-center font-outfit">
                    {user?.photo ? <img src={user.photo} alt="" className="w-full h-full object-cover" /> : <User size={20} className="text-slate-600 font-outfit" />}
                  </div>
                </div>
              </button>

              <AnimatePresence>
                {showProfileMenu && (
                  <>
                    <div
                      className="fixed inset-0 z-10 font-outfit"
                      onClick={() => setShowProfileMenu(false)}
                    />
                    <motion.div
                      initial={{ opacity: 0, y: 15, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 15, scale: 0.95 }}
                      className="absolute right-0 top-[calc(100%+12px)] z-20 w-64 p-3 rounded-md bg-brand-surface border border-brand-border shadow-3xl backdrop-blur-2xl font-outfit"
                    >
                      <div className="px-5 py-4 border-b border-brand-border mb-2 text-center font-outfit">
                        <p className="text-sm font-black uppercase text-white tracking-widest leading-none mb-1 font-outfit italic">
                          {user?.firstName} {user?.lastName}
                        </p>
                        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest italic font-outfit">{user?.email}</p>
                      </div>

                      <div className="space-y-1 font-outfit">
                        <button
                          onClick={handleSettings}
                          className="w-full flex items-center gap-3 px-4 py-3 rounded-md hover:bg-white/5 text-slate-300 hover:text-white transition-all text-[10px] font-black uppercase tracking-widest italic font-outfit">
                          <User size={18} className="text-brand-primary" />
                          View Profile
                        </button>

                        <div className="p-1 mb-1 font-outfit">
                          <div className="h-px bg-brand-border w-full font-outfit" />
                        </div>
                        <button
                          onClick={handleLogout}
                          className="w-full flex items-center gap-3 px-4 py-3 rounded-md hover:bg-brand-primary/10 text-brand-primary transition-all text-[10px] font-black uppercase tracking-widest group italic font-outfit"
                        >
                          <LogOut size={18} className="group-hover:-rotate-6 transition-transform font-outfit" />
                          Log Out
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
        <main className="flex-1 overflow-y-auto p-4 lg:p-8 custom-scrollbar font-outfit">
          <Outlet />
        </main>
      </div>

      {sidebarOpen && (
        <div className="fixed inset-0 z-40 bg-black/80 backdrop-blur-sm lg:hidden transition-all duration-300 font-outfit" onClick={() => setSidebarOpen(false)} />
      )}
    </div>
  );
};

export default StudentLayout;
