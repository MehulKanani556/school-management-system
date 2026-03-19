import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '../../redux/slice/auth.slice';
import { LogOut, User, LayoutDashboard, Settings, UserCircle, Activity, ShieldCheck } from 'lucide-react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';

const Dashboard = () => {
    const dispatch = useDispatch();
    const { user } = useSelector((state) => state.auth);

    const handleLogout = () => {
        dispatch(logout());
        toast.success('Session terminated successfully');
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
                <aside className="hidden lg:block space-y-3">
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
                </aside>

                <div className="lg:col-span-3 space-y-10">
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.98 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-brand-surface/40 backdrop-blur-3xl border border-brand-border/40 rounded-[3.5rem] p-12 shadow-2xl overflow-hidden relative"
                    >
                        <h1 className="text-5xl font-black text-white italic uppercase tracking-tighter mb-4 font-outfit leading-tight">Welcome to Your Portal, <br/> {user?.firstName}!</h1>
                        <p className="text-slate-400 font-medium text-xl max-w-xl">Your institutional dashboard is ready. Follow the sidebar navigation to manage your academic profile.</p>
                        <div className="mt-16 p-10 bg-gradient-to-br from-brand-primary/10 to-transparent border border-brand-primary/20 rounded-[2.5rem] inline-block">
                            <p className="text-brand-primary font-black uppercase tracking-[0.3em] mb-4 text-xs font-outfit">Assigned Role</p>
                            <div className="flex items-center gap-4">
                                <ShieldCheck size={32} className="text-white opacity-40" />
                                <span className="text-4xl font-black tracking-tighter font-outfit uppercase italic">{user?.role}</span>
                            </div>
                        </div>
                    </motion.div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                        <div className="bg-brand-surface/40 backdrop-blur-2xl border border-brand-border/40 rounded-[2.5rem] p-10 h-[340px] flex items-center justify-center border-dashed">
                            <div className="text-center">
                                <p className="text-slate-500 font-black uppercase tracking-[0.3em] mb-4 text-xs font-outfit opacity-60">Upcoming Events</p>
                                <p className="text-slate-600 italic font-medium">No events scheduled yet</p>
                            </div>
                        </div>
                        <div className="bg-brand-surface/40 backdrop-blur-2xl border border-brand-border/40 rounded-[2.5rem] p-10 h-[340px] flex items-center justify-center border-dashed">
                            <div className="text-center">
                                <p className="text-slate-500 font-black uppercase tracking-[0.3em] mb-4 text-xs font-outfit opacity-60">Recent Activities</p>
                                <p className="text-slate-600 italic font-medium">Your activity feed is empty</p>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default Dashboard;
