import React from 'react';
import { motion } from 'framer-motion';
import { Settings, ShieldAlert, Cpu, RefreshCw } from 'lucide-react';

const Maintenance = () => {
    return (
        <div className="min-h-screen bg-brand-background flex items-center justify-center p-6 relative overflow-hidden">
            {/* Background Decorative Elements */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none opacity-20">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-brand-primary/20 blur-[120px]"></div>
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-luxury-rose/20 blur-[120px]"></div>
            </div>

            <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="max-w-2xl w-full bg-brand-surface border border-brand-border rounded-md p-10 xs:p-16 text-center shadow-2xl relative z-10"
            >
                <div className="flex justify-center mb-10">
                    <div className="relative">
                        <div className="w-24 h-24 rounded-md bg-brand-primary/10 flex items-center justify-center text-brand-primary border border-brand-primary/20">
                            <Settings size={48} className="animate-[spin_10s_linear_infinite]" />
                        </div>
                        <div className="absolute -bottom-2 -right-2 w-10 h-10 rounded-md bg-luxury-rose flex items-center justify-center text-white shadow-lg border-2 border-brand-surface">
                            <ShieldAlert size={20} />
                        </div>
                    </div>
                </div>

                <h1 className="text-3xl xs:text-4xl font-black text-slate-100 italic uppercase tracking-tighter mb-6 leading-tight">
                    Core Infrastructure <br /> under maintenance
                </h1>
                
                <p className="text-sm font-medium text-slate-400 italic mb-10 max-w-md mx-auto leading-relaxed">
                    The platform is currently undergoing a critical synchronization cycle. 
                    Access for institutional nodes is temporarily restricted to ensure data integrity during maintenance.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-12">
                    {[
                        { label: 'Sync Status', value: 'Active', icon: RefreshCw },
                        { label: 'Security', value: 'Hardened', icon: ShieldAlert },
                        { label: 'Compute', value: 'Optimizing', icon: Cpu },
                    ].map((item, idx) => (
                        <div key={idx} className="p-4 rounded-md bg-brand-background/50 border border-brand-border">
                            <div className="text-brand-primary mb-2 flex justify-center">
                                <item.icon size={18} />
                            </div>
                            <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1 italic">{item.label}</p>
                            <p className="text-[11px] font-bold text-slate-200 uppercase italic">{item.value}</p>
                        </div>
                    ))}
                </div>

                <div className="pt-8 border-t border-brand-border flex flex-col items-center">
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em] mb-4">Estimated completion: Q3 Cluster Cycle</p>
                    <button 
                        onClick={() => window.location.href = '/'}
                        className="px-8 py-3 bg-brand-primary text-white text-[11px] font-black uppercase tracking-widest italic rounded-md shadow-lg hover:shadow-brand-primary/20 transition-all hover:translate-y-[-2px]"
                    >
                        Check Connectivity
                    </button>
                </div>
            </motion.div>
        </div>
    );
};

export default Maintenance;
