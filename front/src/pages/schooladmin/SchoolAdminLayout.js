import React, { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '../../redux/slice/auth.slice';
import {
  LayoutDashboard, Users, GraduationCap, BookOpen,
  CreditCard, ClipboardList, CalendarCheck, LogOut,
  MessageSquare, Menu, X, User, ChevronRight, BookMarked, Calendar, Clock,
  Banknote, CalendarDays, Rocket, BarChart3, PieChart, TrendingUp, Brain, Settings
} from 'lucide-react';
import MainHeader from '../../components/MainHeader';

const navItems = [
  { to: '/school-admin',          icon: LayoutDashboard, label: 'Dashboard',  end: true },
  { to: '/school-admin/students', icon: Users,           label: 'Students' },
  { to: '/school-admin/teachers', icon: GraduationCap,   label: 'Teachers' },
  { to: '/school-admin/classes',  icon: BookOpen,        label: 'Classes' },
  { to: '/school-admin/subjects', icon: BookMarked,      label: 'Subjects' },
  { to: '/school-admin/fees',     icon: CreditCard,      label: 'Fees' },
  { to: '/school-admin/exams',    icon: ClipboardList,   label: 'Exams' },
  { to: '/school-admin/attendance', icon: CalendarCheck, label: 'Attendance' },
  { to: '/school-admin/attendance-intelligence', icon: Brain, label: 'Attendance Intel' },
  { to: '/school-admin/reports',    icon: BarChart3,     label: 'Reports & Analytics' },
  { to: '/school-admin/timetable',  icon: Clock,         label: 'Timetable' },
  { to: '/school-admin/communication', icon: MessageSquare, label: 'Communication' },
  { to: '/school-admin/payroll',    icon: Banknote,      label: 'Payroll' },
  { to: '/school-admin/leaves',     icon: CalendarDays,  label: 'Leaves' },
  { to: '/school-admin/reviews',    icon: Rocket,        label: 'Reviews' },
  { to: '/school-admin/holidays',   icon: Calendar,      label: 'Holidays' },
  { to: '/school-admin/profile',    icon: Settings,      label: 'Settings' },
];

const SchoolAdminLayout = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  return (
    <div className="h-screen overflow-hidden bg-brand-background text-white flex font-inter">
      {/* Sidebar */}
      <aside className={`no-print fixed inset-y-0 left-0 z-50 w-72 bg-brand-surface/80 backdrop-blur-2xl border-r border-brand-border/40 flex flex-col transition-transform duration-300 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 shadow-2xl shadow-black/40`}>
        {/* Logo */}
        <div className="px-7 py-8 flex items-center justify-between border-b border-brand-border/30">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-brand-primary to-brand-secondary flex items-center justify-center font-black text-lg italic shadow-lg">SM</div>
            <div>
              <p className="font-black text-sm uppercase tracking-widest font-outfit">School Admin</p>
              <p className="text-[10px] text-slate-500 font-bold tracking-wider uppercase">Management Panel</p>
            </div>
          </div>
          <button onClick={() => setSidebarOpen(false)} className="lg:hidden text-slate-500 hover:text-white transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-4 py-5 space-y-1 overflow-y-auto custom-scrollbar">
          {navItems.map(({ to, icon: Icon, label, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              onClick={() => setSidebarOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-4 px-5 py-3.5 rounded-2xl transition-all duration-300 group ${
                  isActive
                    ? 'bg-brand-primary text-white shadow-[0_8px_25px_-10px_rgba(37,99,235,0.6)]'
                    : 'text-slate-500 hover:bg-slate-800/40 hover:text-white'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <div className={`p-2 rounded-xl transition-all duration-300 ${isActive ? 'bg-white/10' : 'bg-transparent group-hover:bg-brand-primary/10'}`}>
                    <Icon size={18} />
                  </div>
                  <span className="font-black text-sm uppercase tracking-wider font-outfit flex-1">{label}</span>
                  <ChevronRight size={14} className={`transition-all duration-300 ${isActive ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-2 group-hover:opacity-60 group-hover:translate-x-0'}`} />
                </>
              )}
            </NavLink>
          ))}
        </nav>

        {/* User Info */}
        <div className="px-4 py-6 border-t border-brand-border/30 bg-brand-surface/20 backdrop-blur-sm">
          <div className="flex items-center gap-3 px-4 py-3 bg-slate-900/60 rounded-[1.5rem] border border-white/5 shadow-inner">
            {user?.photo ? (
              <img src={user.photo} alt="avatar" className="w-10 h-10 rounded-xl object-cover ring-2 ring-brand-primary/20" />
            ) : (
              <div className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center border border-white/10 shadow-lg">
                <User size={18} className="text-slate-400" />
              </div>
            )}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-black text-white truncate font-outfit uppercase tracking-tighter">{user?.firstName} {user?.lastName}</p>
              <p className="text-[9px] text-brand-accent font-black uppercase tracking-[0.2em] opacity-80 leading-tight">Administrator</p>
            </div>
            <button onClick={handleLogout} className="p-2.5 rounded-xl hover:bg-luxury-rose/10 text-slate-500 hover:text-luxury-rose transition-all group active:scale-90">
              <LogOut size={16} className="group-hover:-rotate-12 transition-transform" />
            </button>
          </div>
        </div>
      </aside>

      {/* Overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden transition-all duration-300" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0 lg:pl-72 transition-all duration-300">

        {/* Top bar (mobile) */}
        <header className="no-print lg:hidden px-6 py-4 flex items-center justify-between bg-brand-surface/60 backdrop-blur-xl border-b border-brand-border/40">
          <button onClick={() => setSidebarOpen(true)} className="p-2 rounded-xl bg-slate-800/40 text-slate-400 hover:text-white">
            <Menu size={22} />
          </button>
          <span className="font-black text-sm uppercase tracking-widest font-outfit">School Admin</span>
          <div className="w-9 h-9 rounded-xl bg-slate-800 flex items-center justify-center">
            {user?.photo ? <img src={user.photo} alt="avatar" className="w-full h-full rounded-xl object-cover" /> : <User size={16} className="text-slate-400" />}
          </div>
        </header>

        <main className="flex-1 p-6 lg:p-8 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default SchoolAdminLayout;
