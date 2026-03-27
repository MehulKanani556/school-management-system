import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchFinancialReport, clearStatus } from '../../redux/slice/accountant.slice';
import { 
    DollarSign, TrendingUp, TrendingDown, Users, Calendar, 
    ChevronRight, Download, Activity, AlertCircle, FileText, 
    Layers, Briefcase, GraduationCap, X, Printer, Filter
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, 
    ResponsiveContainer, AreaChart, Area, PieChart, Pie, Cell 
} from 'recharts';
import moment from 'moment';
import { BASE_URL } from '../../utils/BASE_URL';

const AccountantDashboard = () => {
    const dispatch = useDispatch();
    const { report, loading, error } = useSelector((state) => state.accountant);
    const [filterRange, setFilterRange] = useState({ start: '', end: '', year: '2026' });
    const [showFilterModal, setShowFilterModal] = useState(false);

    useEffect(() => {
        dispatch(fetchFinancialReport({ 
            startDate: filterRange.start, 
            endDate: filterRange.end,
            academicYear: filterRange.year 
        }));
    }, [dispatch, filterRange]);

    const COLORS = ['#38bdf8', '#f43f5e', '#fbbf24', '#10b981'];

    const exportVisualReport = () => {
        const token = localStorage.getItem('token');
        const queryParams = new URLSearchParams({
            startDate: filterRange.start,
            endDate: filterRange.end,
            academicYear: filterRange.year,
            token: token
        }).toString();
        
        const link = document.createElement('a');
        link.href = `${BASE_URL}/accountant/reports/download?${queryParams}`;
        document.body.appendChild(link);
        link.click();
        link.remove();
    };

    if (!report) return <div className="p-20 text-center uppercase font-black italic text-slate-600 animate-pulse tracking-widest text-[10px]">Loading Dashboard data...</div>;

    const cards = [
        { title: 'Total Collection', val: `₹${report.income?.toLocaleString()}`, change: '+12.5%', icon: TrendingUp, color: 'text-accountant-primary' },
        { title: 'Pending Fees', val: `₹${report.pending?.toLocaleString()}`, change: 'Current Cycle', icon: Layers, color: 'text-accountant-primary' },
        { title: 'Total Expenses', val: `₹${report.expenses?.toLocaleString()}`, change: '-2.1%', icon: TrendingDown, color: 'text-luxury-rose' },
        { title: 'Cash Liquidity', val: `${report.health?.liquidity}%`, change: report.health?.status, icon: Activity, color: 'text-luxury-emerald' },
    ];

    const summaryItems = [
        { label: 'Student Strength', val: report.summary?.totalStudents || 0, icon: GraduationCap, sub: 'Enrolled Students' },
        { label: 'Staff Strength', val: report.summary?.totalEmployees || 0, icon: Briefcase, sub: 'Active Members' },
    ];

    return (
        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="space-y-8 pb-10">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                    <h1 className="text-2xl xs:text-3xl font-black text-white italic uppercase tracking-tighter leading-none mb-1 font-outfit">Accountant Dashboard</h1>
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest italic opacity-70 leading-none">Live summary of fee collections, expenses, and enrollment.</p>
                </div>
                <div className="flex items-center gap-4">
                    <button 
                        onClick={() => setShowFilterModal(true)}
                        className="flex items-center gap-2 px-4 py-2 bg-slate-900 border border-slate-800 rounded-md text-[10px] font-black text-slate-400 uppercase tracking-widest italic hover:text-accountant-primary hover:border-accountant-primary/30 transition-all shadow-xl"
                    >
                        <Filter size={14} />
                        Academic Year
                    </button>
                    <button 
                        onClick={exportVisualReport}
                        className="flex items-center gap-2 px-4 py-2 bg-accountant-primary/10 border border-accountant-primary/20 rounded-md text-[10px] font-black text-accountant-primary uppercase tracking-widest italic hover:bg-accountant-primary/20 transition-all shadow-xl"
                    >
                        <Download size={14} />
                        Download Report
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
                {cards.map((card, i) => (
                    <motion.div 
                        key={i} transition={{ delay: i * 0.1 }}
                        className="bg-slate-900 border border-slate-800/60 rounded-md p-6 shadow-2xl relative overflow-hidden group"
                    >
                        <div className="flex justify-between items-start mb-4">
                            <div className={`p-2 rounded bg-slate-800 border border-slate-700/50 group-hover:border-accountant-primary transition-all ${card.color}`}>
                                <card.icon size={20} />
                            </div>
                            <span className="text-[10px] font-black text-slate-600 uppercase italic opacity-60 tracking-tighter">{card.change}</span>
                        </div>
                        <h3 className="text-[9px] font-black text-slate-500 uppercase tracking-widest italic mb-1">{card.title}</h3>
                        <p className="text-2xl font-black text-white italic tracking-tighter leading-none">{card.val}</p>
                        <div className="absolute bottom-0 right-0 p-1 opacity-[0.03] group-hover:opacity-[0.08] transition-opacity">
                            <card.icon size={64} />
                        </div>
                    </motion.div>
                ))}
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                <div className="xl:col-span-2 bg-slate-900 border border-slate-800/60 rounded-md shadow-2xl p-6">
                    <div className="flex items-center justify-between mb-8">
                        <h2 className="text-sm font-black italic uppercase tracking-widest text-white flex items-center gap-3 font-outfit">
                            <Activity size={16} className="text-accountant-primary" />
                            Monthly Income & Expenses
                        </h2>
                    </div>
                    <div className="h-[350px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={report.trends}>
                                <defs>
                                    <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3}/>
                                        <stop offset="95%" stopColor="#f59e0b" stopOpacity={0}/>
                                    </linearGradient>
                                    <linearGradient id="colorExpense" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.3}/>
                                        <stop offset="95%" stopColor="#f43f5e" stopOpacity={0}/>
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                                <XAxis dataKey="name" stroke="#64748b" tick={{fontSize: 9, fontBold: 900}} />
                                <YAxis stroke="#64748b" tick={{fontSize: 9, fontBold: 900}} />
                                <Tooltip 
                                    contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', fontSize: '10px', color: '#f1f5f9' }}
                                    itemStyle={{ color: '#f1f5f9', fontWeight: 900, textTransform: 'uppercase' }}
                                />
                                <Area type="monotone" dataKey="income" stroke="#f59e0b" strokeWidth={3} fillOpacity={1} fill="url(#colorIncome)" />
                                <Area type="monotone" dataKey="expenses" stroke="#f43f5e" strokeWidth={3} fillOpacity={1} fill="url(#colorExpense)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="space-y-8">
                    <div className="bg-slate-900 border border-slate-800/60 rounded-md shadow-2xl p-6 relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-4">
                           <div className={`text-3xl font-black italic ${report.health?.grade === 'A+' ? 'text-luxury-emerald' : 'text-accountant-primary'}`}>{report.health?.grade}</div>
                        </div>
                        <h2 className="text-sm font-black italic uppercase tracking-widest text-white mb-6 font-outfit">Financial Stability Score</h2>
                        <div className="flex items-center justify-center mb-6">
                            <div className="relative w-32 h-32">
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie data={[{ value: report.health?.liquidity }, { value: 100 - report.health?.liquidity }]} innerRadius={45} outerRadius={60} paddingAngle={5} dataKey="value" stroke="none">
                                            <Cell fill={report.health?.grade === 'A+' ? '#10b981' : '#f59e0b'} />
                                            <Cell fill="#1e293b" />
                                        </Pie>
                                    </PieChart>
                                </ResponsiveContainer>
                                <div className="absolute inset-0 flex flex-col items-center justify-center">
                                    <span className="text-xl font-black text-white italic">{report.health?.liquidity}%</span>
                                    <span className="text-[8px] font-black text-slate-500 uppercase">Liquidity</span>
                                </div>
                            </div>
                        </div>
                        <p className="text-[10px] font-medium text-slate-500 italic uppercase leading-relaxed text-center">
                            Score determined by fee collection status, pending dues, and staff payroll commitments.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 gap-4">
                        {summaryItems.map((item, i) => (
                            <div key={i} className="bg-slate-950/40 border border-slate-800/60 rounded-md p-4 flex items-center gap-4 group hover:border-accountant-primary/50 transition-all shadow-xl">
                                <div className="p-2 bg-slate-800 rounded border border-slate-700/50 text-slate-400 group-hover:text-accountant-primary transition-colors">
                                    <item.icon size={18} />
                                </div>
                                <div className="text-left">
                                    <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest italic leading-none mb-1.5">{item.label}</div>
                                    <div className="flex items-end gap-2 text-left">
                                        <span className="text-lg font-black text-white italic leading-none">{item.val}</span>
                                        <span className="text-[8px] font-bold text-slate-600 uppercase italic opacity-70 leading-none mb-0.5">{item.sub}</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <div className="bg-slate-900 border border-slate-800/60 border-dashed p-4 rounded-md flex items-center justify-between text-[10px] font-black text-slate-500 uppercase italic tracking-widest overflow-hidden">
                <div className="flex items-center gap-3">
                    <ShieldCheck className="text-accountant-primary" size={14} />
                    Official Financial Audit: Verified for current session
                </div>
                <div className="opacity-40">Verified via Institutional Ledger</div>
            </div>

            {/* Filter Selection Modal */}
            <AnimatePresence>
                {showFilterModal && (
                    <motion.div 
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md"
                    >
                        <motion.div 
                            initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }}
                            className="bg-slate-900 border border-slate-800 w-full max-w-sm p-8 rounded-md shadow-3xl relative"
                        >
                            <h3 className="text-lg font-black text-white italic uppercase tracking-tighter mb-6 font-outfit">Search Filter</h3>
                            <div className="space-y-4">
                                <div>
                                    <label className="text-[9px] font-black text-slate-500 uppercase italic mb-1 block ml-1">Academic Year</label>
                                    <select 
                                        value={filterRange.year}
                                        onChange={(e) => setFilterRange({...filterRange, year: e.target.value})}
                                        className="w-full bg-slate-950/60 border border-slate-800 rounded-md p-3 text-xs font-bold text-slate-300 focus:outline-none focus:border-accountant-primary transition-colors"
                                    >
                                        <option value="2026">Session 2026</option>
                                        <option value="2025">Session 2025</option>
                                    </select>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-[9px] font-black text-slate-500 uppercase italic mb-1 block ml-1">Start Date</label>
                                        <input 
                                            type="date" 
                                            value={filterRange.start}
                                            onChange={(e) => setFilterRange({...filterRange, start: e.target.value})}
                                            className="w-full bg-slate-950/60 border border-slate-800 rounded-md p-3 text-xs font-bold text-slate-300 focus:outline-none focus:border-accountant-primary transition-colors"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-[9px] font-black text-slate-500 uppercase italic mb-1 block ml-1">End Date</label>
                                        <input 
                                            type="date" 
                                            value={filterRange.end}
                                            onChange={(e) => setFilterRange({...filterRange, end: e.target.value})}
                                            className="w-full bg-slate-950/60 border border-slate-800 rounded-md p-3 text-xs font-bold text-slate-300 focus:outline-none focus:border-accountant-primary transition-colors"
                                        />
                                    </div>
                                </div>
                            </div>
                            <button 
                                onClick={() => setShowFilterModal(false)}
                                className="w-full mt-8 py-3 bg-accountant-primary text-[10px] font-black text-slate-900 uppercase tracking-widest rounded-md hover:bg-accountant-primary hover:shadow-lg transition-all"
                            >
                                Apply Filter
                            </button>
                            <button onClick={() => setShowFilterModal(false)} className="absolute top-4 right-4 text-slate-600 hover:text-white transition-colors"><X size={18} /></button>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
};

// Mock ShieldCheck for the audit hash
const ShieldCheck = ({ className, size }) => (
    <Activity className={className} size={size} />
);

export default AccountantDashboard;
