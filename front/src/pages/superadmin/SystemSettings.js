import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchSystemSettings, updateSystemSetting, clearStatus } from '../../redux/slice/superAdmin.slice';
import { motion } from 'framer-motion';
import { 
    Settings, 
    Save, 
    ToggleLeft, 
    ToggleRight, 
    RefreshCw, 
    Shield, 
    Globe, 
    Mail, 
    MessageSquare,
    CheckCircle2
} from 'lucide-react';
import toast from 'react-hot-toast';

const SystemSettings = () => {
    const dispatch = useDispatch();
    const { settings, loading, success, error } = useSelector((state) => state.superAdmin);
    
    useEffect(() => {
        dispatch(fetchSystemSettings());
    }, [dispatch]);

    useEffect(() => {
        if (success) {
            toast.success(success);
            dispatch(clearStatus());
        }
        if (error) {
            toast.error(error);
            dispatch(clearStatus());
        }
    }, [success, error, dispatch]);

    const handleToggle = (key, currentVal) => {
        dispatch(updateSystemSetting({ key, value: !currentVal }));
    };

    const sections = [
        {
            title: 'Infrastructure & Global',
            icon: Globe,
            keys: ['MAINTENANCE_MODE', 'GLOBAL_REGISTRATION', 'SUBDOMAIN_MAPPING']
        },
        {
            title: 'Security & Auth',
            icon: Shield,
            keys: ['TWO_FACTOR_AUTH', 'AUTO_LOCK_ACCOUNTS', 'AUDIT_LOGGING_LEVEL']
        },
        {
            title: 'Communications',
            icon: MessageSquare,
            keys: ['EMAIL_NOTIFICATIONS', 'SMS_GATEWAY_ACTIVE', 'SYSTEM_ANNOUNCEMENTS']
        }
    ];


    const getSetting = (key) => (Array.isArray(settings) ? settings.find(s => s.key === key) : null);

    return (
        <motion.div 
            initial={{ opacity: 0, y: 15 }} 
            animate={{ opacity: 1, y: 0 }} 
            className="space-y-8 pb-10"
        >
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-slate-100 italic uppercase">System Configuration</h1>
                    <p className="text-sm font-medium text-slate-400 mt-1 tracking-wide italic">Master toggles and global platform parameters.</p>
                </div>
                <div className="flex items-center gap-3">
                    <button 
                        onClick={() => dispatch(fetchSystemSettings())}
                        className="p-2.5 rounded-md bg-brand-surface border border-brand-border text-slate-400 hover:text-brand-primary transition-all shadow-sm"
                    >
                        <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {sections.map((section, idx) => (
                    <div key={idx} className="bg-brand-surface border border-brand-border rounded-md shadow-2xl overflow-hidden">
                        <div className="px-6 py-4 border-b border-brand-border bg-brand-background/30 flex items-center gap-3">
                            <section.icon size={18} className="text-brand-primary" />
                            <h2 className="text-xs font-bold text-slate-200 uppercase tracking-widest italic">{section.title}</h2>
                        </div>
                        <div className="p-6 space-y-6">
                            {section.keys.map(key => {
                                const setting = getSetting(key) || { key, value: false };
                                return (
                                    <div key={key} className="flex items-center justify-between group">
                                        <div>
                                            <p className="text-[10px] font-black text-slate-100 uppercase tracking-widest italic leading-none mb-1.5">{key.replace(/_/g, ' ')}</p>
                                            <p className="text-[10px] font-medium text-slate-500 italic max-w-xs">{setting.description || 'Global switch for this feature across all nodes.'}</p>
                                        </div>
                                        <button 
                                            onClick={() => handleToggle(key, setting.value)}
                                            className={`transition-all duration-300 ${setting.value ? 'text-brand-primary' : 'text-slate-700'}`}
                                        >
                                            {setting.value ? <ToggleRight size={36} /> : <ToggleLeft size={36} />}
                                        </button>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                ))}

                {/* Additional Settings / Summary */}
                <div className="bg-brand-surface border border-brand-border border-dashed rounded-md p-8 flex flex-col items-center justify-center text-center">
                    <div className="w-16 h-16 rounded-md bg-brand-primary/10 flex items-center justify-center text-brand-primary mb-6">
                        <CheckCircle2 size={32} />
                    </div>
                    <h3 className="text-sm font-bold text-slate-200 uppercase tracking-[0.2em] italic mb-3">Integrity Verified</h3>
                    <p className="text-[10px] font-medium text-slate-500 italic max-w-xs leading-relaxed">
                        All configuration changes are logged and synchronized across the distributed infrastructure nodes in real-time.
                    </p>
                    <div className="mt-8 pt-8 border-t border-brand-border w-full flex items-center justify-center gap-8">
                        <div>
                            <p className="text-[14px] font-black text-slate-100 uppercase italic leading-none mb-1">2.4.0</p>
                            <p className="text-[9px] font-bold text-slate-600 uppercase tracking-widest">Core Version</p>
                        </div>
                        <div>
                            <p className="text-[14px] font-black text-slate-100 uppercase italic leading-none mb-1">OPTIMIZED</p>
                            <p className="text-[9px] font-bold text-slate-600 uppercase tracking-widest">Perf Tier</p>
                        </div>
                    </div>
                </div>
            </div>
        </motion.div>
    );
};

export default SystemSettings;
