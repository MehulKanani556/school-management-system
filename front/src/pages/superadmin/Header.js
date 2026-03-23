import React from 'react';
import { LogOut, User, Search } from 'lucide-react';
import { Link } from 'react-router-dom';

const Header = ({ user, onLogout }) => {
    return (
        <header className="px-6 lg:px-10 py-4 flex justify-between items-center bg-brand-surface/80 backdrop-blur-md border-b border-brand-border sticky top-0 z-50 w-full shadow-2xl h-[75px]">
            <div className="hidden sm:block flex-1 max-w-sm">
                <div className="relative group">
                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-brand-primary transition-colors" size={18} />
                    <input
                        type="text"
                        placeholder="Locate Infrastructure..."
                        className="w-full h-10 pl-11 pr-4 bg-brand-background/60 border border-brand-border rounded-md text-sm font-medium text-slate-100 placeholder:text-slate-500 outline-none focus:border-brand-primary/60 focus:ring-4 focus:ring-brand-primary/5 transition-all"
                    />
                </div>
            </div>

            <div className="flex items-center gap-5">
                <Link to="/superadmin/profile" className="hidden sm:flex items-center gap-3 pl-5 border-l border-brand-border group/profile">
                    <div className="text-right">
                        <p className="text-sm font-semibold text-slate-100 font-inter leading-none group-hover/profile:text-brand-primary transition-colors">{user?.firstName} {user?.lastName}</p>
                        <p className="text-[11px] font-medium text-slate-400 mt-1 tracking-wide leading-none">{user?.role?.replace('_', ' ')}</p>
                    </div>
                    {user?.photo ? (
                        <img src={user.photo} alt="Avatar" className="w-10 h-10 rounded-md object-cover ring-1 ring-brand-border shadow-sm cursor-pointer group-hover/profile:ring-brand-primary transition-all" />
                    ) : (
                        <div className="w-10 h-10 rounded-md bg-brand-background flex items-center justify-center border border-brand-border cursor-pointer group-hover/profile:border-brand-primary transition-colors group-hover/profile:bg-brand-primary/10">
                            <User size={18} className="text-slate-400 group-hover/profile:text-brand-primary transition-colors" />
                        </div>
                    )}
                </Link>
                <button
                    onClick={onLogout}
                    className="p-2.5 rounded-md text-slate-400 hover:bg-luxury-rose/10 hover:text-luxury-rose transition-colors"
                    title="Sign Out"
                >
                    <LogOut size={20} />
                </button>
            </div>
        </header>
    );
};

export default Header;
