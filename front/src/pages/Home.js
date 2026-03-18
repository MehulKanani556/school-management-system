import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '../redux/slice/auth.slice';
import { LogOut, User, LayoutDashboard, Settings, UserCircle } from 'lucide-react';
import { motion } from 'framer-motion';

const Home = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);

  const handleLogout = () => {
    dispatch(logout());
  };

  return (
    <div className="min-h-screen bg-brand-background text-white flex flex-col relative overflow-hidden font-inter">
      {/* Background Orbs */}
      <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-brand-primary/10 rounded-full blur-[150px]"></div>
      <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] bg-brand-secondary/10 rounded-full blur-[150px]"></div>

      {/* Header */}
      <header className="px-8 py-6 flex justify-between items-center bg-brand-surface/40 backdrop-blur-xl border-b border-brand-border/40 relative z-10">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-brand-primary to-brand-secondary flex items-center justify-center font-black tracking-tighter text-2xl italic shadow-[0_8px_30px_rgb(37,99,235,0.2)]">SM</div>
          <span className="text-2xl font-black tracking-tight uppercase font-outfit">School Management</span>
        </div>
        
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-4 px-5 py-2.5 bg-slate-800/20 rounded-2xl border border-brand-border/40">
            <div className="text-right">
              <p className="text-sm font-bold text-white leading-none font-outfit">{user?.firstName} {user?.lastName}</p>
              <p className="text-[10px] text-brand-accent font-black uppercase tracking-widest mt-1.5 opacity-80">{user?.role}</p>
            </div>
            {user?.photo ? (
              <img src={user.photo} alt="Avatar" className="w-11 h-11 rounded-xl object-cover ring-2 ring-brand-primary/20 shadow-xl" />
            ) : (
              <div className="w-11 h-11 rounded-xl bg-slate-800 flex items-center justify-center border border-brand-border/40">
                <User size={22} className="text-slate-500" />
              </div>
            )}
          </div>
          
          <button 
            onClick={handleLogout}
            className="p-3.5 rounded-2xl bg-slate-800/30 hover:bg-luxury-rose/10 border border-brand-border/40 hover:border-luxury-rose/30 text-slate-500 hover:text-luxury-rose transition-all active:scale-[0.95] group"
          >
            <LogOut size={22} className="group-hover:translate-x-0.5 transition-transform" />
          </button>
        </div>
      </header>

      {/* Content */}
      <main className="flex-1 p-8 grid grid-cols-1 lg:grid-cols-4 gap-10 relative z-10">
        {/* Sidebar Nav */}
        <div className="hidden lg:block space-y-3">
            {[
                { icon: LayoutDashboard, label: 'Dashboard', active: true },
                { icon: UserCircle, label: 'Profile', active: false },
                { icon: Settings, label: 'Settings', active: false },
            ].map((item, idx) => (
                <button 
                    key={idx}
                    className={`w-full flex items-center gap-4 px-7 py-4 rounded-2xl transition-all duration-300 ${item.active ? 'bg-brand-primary text-white shadow-[0_10px_25px_-5px_rgba(37,99,235,0.4)]' : 'text-slate-500 hover:bg-slate-800/30 hover:text-white'}`}
                >
                    <item.icon size={22} />
                    <span className="font-black tracking-[0.1em] uppercase text-sm font-outfit">{item.label}</span>
                </button>
            ))}
        </div>

        <div className="lg:col-span-3 space-y-10">
          <motion.div 
            initial={{ opacity: 0, y: 25 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-brand-surface/40 backdrop-blur-2xl border border-brand-border/40 rounded-[2.5rem] p-10 shadow-2xl"
          >
            <h1 className="text-4xl font-black text-white italic uppercase tracking-tighter mb-3 font-outfit">Welcome Back, {user?.firstName}!</h1>
            <p className="text-slate-400 font-medium text-lg">Your academic overview is looking great today.</p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12">
              {[
                { label: 'Total Students', value: '1,240', change: '+12%', color: 'from-brand-primary/20 to-brand-primary/5 border-brand-primary/20' },
                { label: 'Active Classes', value: '45', change: '85%', color: 'from-brand-secondary/20 to-brand-secondary/5 border-brand-secondary/20' },
                { label: 'Avg Attendance', value: '94%', change: '+2.4%', color: 'from-luxury-emerald/20 to-luxury-emerald/5 border-luxury-emerald/20' },
              ].map((stat, idx) => (
                <div key={idx} className={`p-8 rounded-[2rem] bg-gradient-to-br border ${stat.color} shadow-xl group hover:scale-[1.02] transition-transform duration-500`}>
                  <p className="text-[10px] font-black uppercase tracking-[0.25em] text-slate-500 mb-5 group-hover:text-slate-300 transition-colors">{stat.label}</p>
                  <div className="flex items-end justify-between">
                    <span className="text-4xl font-black tracking-tighter font-outfit">{stat.value}</span>
                    <span className="text-xs font-black px-3 py-1.5 bg-white/5 rounded-xl text-white/40 tracking-widest">{stat.change}</span>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            <motion.div 
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.1 }}
                className="bg-brand-surface/40 backdrop-blur-2xl border border-brand-border/40 rounded-[2.5rem] p-10 h-[340px] flex items-center justify-center border-dashed group hover:border-brand-primary/30 transition-colors"
            >
                <div className="text-center">
                    <p className="text-slate-500 font-black uppercase tracking-[0.3em] mb-4 text-xs font-outfit opacity-60">Upcoming Events</p>
                    <p className="text-slate-600 italic font-medium">No events scheduled yet</p>
                </div>
            </motion.div>
            <motion.div 
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2 }}
                className="bg-brand-surface/40 backdrop-blur-2xl border border-brand-border/40 rounded-[2.5rem] p-10 h-[340px] flex items-center justify-center border-dashed group hover:border-brand-secondary/30 transition-colors"
            >
                <div className="text-center">
                    <p className="text-slate-500 font-black uppercase tracking-[0.3em] mb-4 text-xs font-outfit opacity-60">Recent Activities</p>
                    <p className="text-slate-600 italic font-medium">Your activity feed is empty</p>
                </div>
            </motion.div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Home;
