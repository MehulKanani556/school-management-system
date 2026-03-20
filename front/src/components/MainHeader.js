import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { logout } from '../redux/slice/auth.slice';
import { useNavigate } from 'react-router-dom';
import {
  User,
  Settings,
  LogOut,
  Bell,
  Search,
  ChevronDown,
  Menu
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const MainHeader = ({ onMenuClick }) => {
  const { user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [showProfileMenu, setShowProfileMenu] = React.useState(false);

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  const handleSettings = () => {
    setShowProfileMenu(false);
    if (user?.role === 'School_Admin') {
      navigate('/school-admin/profile');
    } else if (user?.role === 'Super_Admin') {
      navigate('/superadmin/dashboard');
    } else if (user?.role === 'Student') {
      navigate('/student/profile');
    }
  };


  return (
    <header className="sticky top-0 z-40 w-full px-6 lg:px-10 py-4 bg-brand-background/60 backdrop-blur-3xl border-b border-brand-border/40 flex items-center justify-between gap-4">
      {/* Mobile Menu Trigger */}
      <button
        onClick={onMenuClick}
        className="lg:hidden p-2.5 rounded-md bg-slate-800/40 text-slate-400 hover:text-white transition-colors"
      >
        <Menu size={22} />
      </button>

      {/* Search / Left Side */}
      <div className="flex-1 max-w-md hidden sm:block">
        <div className="relative group">
          <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
            <Search size={18} className="text-slate-500 group-hover:text-brand-primary transition-colors" />
          </div>
          <input
            type="text"
            placeholder="Search for something..."
            className="w-full bg-brand-surface/30 border border-brand-border/30 rounded-md py-2.5 pl-12 pr-4 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary/40 transition-all placeholder:text-slate-600"
          />
        </div>
      </div>

      {/* Profile Actions / Right Side */}
      <div className="flex items-center gap-6">
        {/* User Profile */}
        <div className="relative">
          <button
            onClick={() => setShowProfileMenu(!showProfileMenu)}
            className="flex items-center gap-4 py-1.5 transition-all active:scale-[0.98] border-l border-white/10 pl-6 group"
          >
            <div className="hidden sm:block text-right">
              <p className="text-md font-bold text-white leading-tight font-outfit">
                {user?.firstName} {user?.lastName}
              </p>
              {/* <p className="text-[11px] font-bold uppercase tracking-[0.05em] text-brand-primary mt-0.5">
                FACULTY ID: {user?.facultyId || user?._id?.slice(-5).toUpperCase() || '003AC'}
              </p> */}
            </div>
            <div className="relative">
              {user?.photo ? (
                <img
                  src={user.photo}
                  alt="Avatar"
                  className="w-12 h-12 rounded-xl object-cover border border-white/10 shadow-lg"
                />
              ) : (
                <div className="w-12 h-12 rounded-xl bg-brand-primary flex items-center justify-center border border-white/10 shadow-lg shadow-brand-primary/30">
                  <span className="text-white font-bold text-lg">
                    {user?.firstName?.charAt(0)}{user?.lastName?.charAt(0)}
                  </span>
                </div>
              )}
            </div>
          </button>

          {/* Profile Dropdown */}
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
                  className="absolute right-0 top-[calc(100%+12px)] z-20 w-64 p-3 rounded-md bg-brand-surface border border-brand-border/40 shadow-2xl backdrop-blur-2xl"
                >
                  <div className="px-5 py-4 border-b border-white/5 mb-2 text-center">
                    <p className="text-sm font-black uppercase text-white tracking-widest leading-none mb-1 font-outfit">
                      {user?.firstName} {user?.lastName}
                    </p>
                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">{user?.email}</p>
                  </div>

                  <div className="space-y-1">
                    <button
                      onClick={handleSettings}
                      className="w-full flex items-center gap-3 px-4 py-3 rounded-md hover:bg-white/5 text-slate-300 hover:text-white transition-all text-xs font-black uppercase tracking-widest">
                      <User size={18} className="text-brand-primary" />
                      View Profile
                    </button>

                    <div className="p-1 mb-1">
                      <div className="h-px bg-white/5 w-full" />
                    </div>
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-3 px-4 py-3 rounded-md hover:bg-rose-500/10 text-rose-500 transition-all text-xs font-black uppercase tracking-widest group"
                    >
                      <LogOut size={18} className="group-hover:-rotate-6 transition-transform" />
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
  );
};

export default MainHeader;
