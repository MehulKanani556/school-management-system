import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchSystemSettings, updateSystemSetting, clearStatus } from '../../redux/slice/superAdmin.slice';
import { motion } from 'framer-motion';
import { 
    RefreshCw, 
    Shield, 
    Globe, 
    MessageSquare,
    CheckCircle2
} from 'lucide-react';
import toast from 'react-hot-toast';

const settingMetadata = {
    MAINTENANCE_MODE: {
        title: 'Maintenance Mode',
        description: 'Restrict platform access to master-level administrators. Normal users will see a maintenance page.'
    },
    GLOBAL_REGISTRATION: {
        title: 'Global Registration',
        description: 'Control whether new schools, teachers, or administrators can register accounts on the platform.'
    },
    SUBDOMAIN_MAPPING: {
        title: 'Subdomain Routing',
        description: 'Map unique subdomains (e.g. school.edumanage.in) dynamically to specific school portals.'
    },
    TWO_FACTOR_AUTH: {
        title: 'Two-Factor Authentication',
        description: 'Require all administrative users to authenticate using secure 2FA verification upon logging in.'
    },
    AUTO_LOCK_ACCOUNTS: {
        title: 'Account Auto-Lock',
        description: 'Temporarily lock user accounts after 5 consecutive failed password verification attempts.'
    },
    AUDIT_LOGGING_LEVEL: {
        title: 'Audit Verbosity Trail',
        description: 'Log granular user telemetry actions and access points to the security database registry.'
    },
    EMAIL_NOTIFICATIONS: {
        title: 'Email Relay Gateway',
        description: 'Enable outbound SMTP mail relay system for notifications, payroll slips, and password recovery.'
    },
    SMS_GATEWAY_ACTIVE: {
        title: 'SMS Service Gateway',
        description: 'Activate global SMS messaging gateway for broadcasting alerts, student attendance, and OTPs.'
    },
    SYSTEM_ANNOUNCEMENTS: {
        title: 'System-Wide Broadcasts',
        description: 'Enable global announcement banner system to publish alerts or maintenance notes to all active panels.'
    }
};

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
        const meta = settingMetadata[key] || {};
        dispatch(updateSystemSetting({ 
            key, 
            value: !currentVal,
            description: meta.description || 'Global switch for this feature.'
        }));
    };

    const sections = [
        {
            title: 'General Settings',
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
            className="space-y-8 pb-10 font-outfit"
        >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                <div>
                    <h1 className="text-3xl font-black text-white uppercase tracking-tighter leading-none mb-2 font-inter">System Configuration</h1>
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] opacity-70">General settings and system configurations.</p>
                </div>
                <div className="flex items-center gap-3">
                    <button 
                        onClick={() => dispatch(fetchSystemSettings())}
                        className="p-2.5 rounded-md bg-slate-900/50 border border-slate-800 text-slate-400 hover:text-superadmin-primary transition-all shadow-sm"
                    >
                        <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {sections.map((section, idx) => (
                    <div key={idx} className="bg-slate-900/30 border border-slate-800/60 rounded-md backdrop-blur-3xl overflow-hidden shadow-2xl">
                        <div className="px-6 py-4 border-b border-slate-800/60 bg-white/[0.01] flex items-center gap-3">
                            <section.icon size={18} className="text-superadmin-primary" />
                            <h2 className="text-xs font-black text-slate-200 uppercase tracking-widest font-inter">{section.title}</h2>
                        </div>
                        <div className="p-6 space-y-6">
                            {section.keys.map(key => {
                                const setting = getSetting(key) || { key, value: false };
                                const meta = settingMetadata[key] || { title: key.replace(/_/g, ' '), description: 'Global switch for this feature.' };
                                const isValueActive = setting.value === true || setting.value === 'true' || setting.value === 'standard';
                                
                                return (
                                    <div key={key} className="flex items-center justify-between gap-6 group">
                                        <div className="min-w-0">
                                            <p className="text-[10px] font-black text-slate-100 uppercase tracking-widest leading-none mb-1.5">{meta.title}</p>
                                            <p className="text-[10px] font-medium text-slate-500 uppercase tracking-wider leading-relaxed">{meta.description}</p>
                                        </div>
                                        <button 
                                            onClick={() => handleToggle(key, isValueActive)}
                                            disabled={loading}
                                            className={`w-12 h-6 rounded-full transition-all duration-300 relative focus:outline-none shrink-0 ${
                                                isValueActive 
                                                    ? 'bg-superadmin-primary border border-superadmin-primary/20 shadow-md shadow-superadmin-primary/20' 
                                                    : 'bg-slate-950 border border-slate-800'
                                            }`}
                                        >
                                            <div
                                                className={`w-4 h-4 rounded-full transition-all duration-300 absolute top-[3px] left-[4px] ${
                                                    isValueActive ? 'translate-x-[24px] bg-slate-900' : 'translate-x-0 bg-slate-500'
                                                }`}
                                            />
                                        </button>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                ))}

                {/* Additional Settings / Summary */}
                <div className="bg-slate-900/30 border border-slate-800/60 rounded-md p-8 flex flex-col items-center justify-center text-center shadow-2xl relative overflow-hidden group">
                    <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-superadmin-primary/20 to-transparent group-hover:via-superadmin-primary/50 transition-all duration-300"></div>
                    <div className="w-16 h-16 rounded-md bg-superadmin-primary/10 border border-superadmin-primary/20 flex items-center justify-center text-superadmin-primary mb-6">
                        <CheckCircle2 size={32} />
                    </div>
                    <h3 className="text-sm font-black text-white uppercase tracking-widest mb-3">Settings Synced</h3>
                    <p className="text-[10px] font-medium text-slate-500 uppercase tracking-wider max-w-xs leading-relaxed">
                        All configuration changes are logged and synchronized across all schools in real-time.
                    </p>
                    <div className="mt-8 pt-8 border-t border-slate-800/60 w-full flex items-center justify-center gap-8">
                        <div>
                            <p className="text-[14px] font-black text-slate-100 uppercase leading-none mb-1">2.4.0</p>
                            <p className="text-[9px] font-bold text-slate-600 uppercase tracking-widest">Core Version</p>
                        </div>
                        <div>
                            <p className="text-[14px] font-black text-slate-100 uppercase leading-none mb-1">OPTIMIZED</p>
                            <p className="text-[9px] font-bold text-slate-600 uppercase tracking-widest">Perf Tier</p>
                        </div>
                    </div>
                </div>
            </div>
        </motion.div>
    );
};

export default SystemSettings;
