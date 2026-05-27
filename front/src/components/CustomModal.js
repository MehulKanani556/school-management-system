import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, Info } from 'lucide-react';

const CustomModal = () => {
    const [state, setState] = useState({
        isOpen: false,
        type: 'confirm', // 'confirm' or 'alert'
        title: 'Confirm',
        message: '',
        onConfirm: null,
        onCancel: null
    });

    useEffect(() => {
        window.confirm = (message) => {
            return new Promise((resolve) => {
                setState({
                    isOpen: true,
                    type: 'confirm',
                    title: 'Confirm Action',
                    message: message,
                    onConfirm: () => {
                        setState(s => ({ ...s, isOpen: false }));
                        resolve(true);
                    },
                    onCancel: () => {
                        setState(s => ({ ...s, isOpen: false }));
                        resolve(false);
                    }
                });
            });
        };

        window.alert = (message) => {
            return new Promise((resolve) => {
                setState({
                    isOpen: true,
                    type: 'alert',
                    title: 'System Notification',
                    message: message,
                    onConfirm: () => {
                        setState(s => ({ ...s, isOpen: false }));
                        resolve(true);
                    },
                    onCancel: () => {
                        setState(s => ({ ...s, isOpen: false }));
                        resolve(true);
                    }
                });
            });
        };

        return () => {
            // Keep native overrides active globally
        };
    }, []);

    const handleConfirm = () => {
        setState(s => ({ ...s, isOpen: false }));
        if (state.onConfirm) state.onConfirm();
    };

    const handleCancel = () => {
        setState(s => ({ ...s, isOpen: false }));
        if (state.onCancel) state.onCancel();
    };

    // Style configs for premium customization based on type
    const config = state.type === 'confirm' ? {
        color: 'from-rose-500 to-rose-600',
        glowColor: 'bg-rose-500/20',
        borderColor: 'border-rose-500/30',
        iconBg: 'bg-rose-500/10 text-rose-400',
        iconGlow: 'shadow-[0_0_20px_rgba(244,63,94,0.3)]',
        buttonGradient: 'from-rose-600 via-rose-500 to-pink-600',
        buttonShadow: 'shadow-rose-600/35 hover:shadow-rose-600/50',
    } : {
        color: 'from-cyan-500 to-blue-600',
        glowColor: 'bg-cyan-500/25',
        borderColor: 'border-cyan-500/30',
        iconBg: 'bg-cyan-500/10 text-cyan-400',
        iconGlow: 'shadow-[0_0_20px_rgba(6,182,212,0.3)]',
        buttonGradient: 'from-cyan-600 via-cyan-500 to-blue-600',
        buttonShadow: 'shadow-cyan-600/35 hover:shadow-cyan-600/50',
    };

    return (
        <AnimatePresence>
            {state.isOpen && (
                <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
                    {/* Dark overlay backdrop with softer blur */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={handleCancel}
                        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                    />

                    {/* Glowing background orb for ambient lighting */}
                    <div className={`absolute w-[400px] h-[400px] rounded-full blur-[140px] opacity-40 -z-10 pointer-events-none transition-all duration-700 ${config.glowColor}`} />

                    {/* Glassmorphic modal card container */}
                    <motion.div
                        initial={{ scale: 0.95, opacity: 0, y: 15 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0.95, opacity: 0, y: 15 }}
                        transition={{ type: 'spring', damping: 25, stiffness: 220 }}
                        className="bg-slate-950/70 border border-white/10 w-full max-w-md rounded-2xl shadow-[0_25px_60px_-15px_rgba(0,0,0,0.9)] relative z-10 overflow-hidden font-outfit backdrop-blur-2xl"
                    >
                        {/* Dynamic Top Border Gradient Strip */}
                        <div className={`h-[3px] w-full bg-gradient-to-r ${config.color}`} />

                        <div className="p-8">
                            <div className="flex flex-col items-center text-center space-y-6">
                                {/* Futuristic Dual Pulsing Icon Ring */}
                                <div className="relative">
                                    <span className="absolute -inset-2 rounded-full bg-white/5 animate-ping opacity-75" />
                                    <div className={`w-14 h-14 rounded-full flex items-center justify-center border ${config.borderColor} ${config.iconBg} ${config.iconGlow}`}>
                                        {state.type === 'confirm' ? <AlertTriangle size={24} className="stroke-[2.5]" /> : <Info size={24} className="stroke-[2.5]" />}
                                    </div>
                                </div>

                                {/* Typography Block */}
                                <div className="space-y-3">
                                    <h4 className="text-[11px] font-black uppercase tracking-[0.4em] text-slate-400 italic">
                                        {state.title}
                                    </h4>
                                    <p className="text-base font-bold text-slate-100 italic leading-relaxed px-2">
                                        {state.message}
                                    </p>
                                </div>
                            </div>

                            {/* Luxury Buttons */}
                            <div className="flex gap-4 mt-8">
                                {state.type === 'confirm' && (
                                    <button
                                        onClick={handleCancel}
                                        className="flex-1 px-5 py-3.5 border border-white/10 hover:border-white/20 text-[10px] font-black uppercase tracking-[0.3em] italic text-slate-400 hover:text-white bg-white/[0.02] hover:bg-white/[0.05] transition-all rounded-xl leading-none h-[44px] active:scale-[0.98]"
                                    >
                                        Cancel
                                    </button>
                                )}
                                <button
                                    onClick={handleConfirm}
                                    className={`flex-1 px-5 py-3.5 bg-gradient-to-r ${config.buttonGradient} ${config.buttonShadow} text-[10px] font-black uppercase tracking-[0.3em] italic text-white rounded-xl transition-all leading-none h-[44px] active:scale-[0.98] relative group overflow-hidden`}
                                >
                                    {/* Glossy shine reflection on hover */}
                                    <span className="absolute inset-0 bg-white/10 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
                                    <span className="relative z-10">{state.type === 'confirm' ? 'Confirm' : 'OK'}</span>
                                </button>
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};

export default CustomModal;
