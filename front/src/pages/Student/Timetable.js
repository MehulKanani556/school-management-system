import React from 'react';
import { motion } from 'framer-motion';

const WIP = ({ title }) => (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-10">
        <div className="w-24 h-24 rounded-full bg-slate-800 flex items-center justify-center mb-8 border border-slate-700/50">
           <div className="w-6 h-6 rounded-full bg-luxury-emerald animate-ping"></div>
        </div>
        <h2 className="text-3xl font-black italic uppercase tracking-tighter text-white mb-4 font-outfit">{title}</h2>
        <p className="text-slate-500 font-medium text-lg leading-relaxed max-w-md uppercase tracking-[0.2em] text-[10px]">Institutional student node under active provisioning. Node deployment in progress.</p>
    </div>
);

export default () => <WIP title="Academic Schedule" />;
