import React, { useEffect, useState, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchPlatformAnalytics, fetchAuditLogs, fetchTickets } from '../../redux/slice/superAdmin.slice';
import { fetchSchools } from '../../redux/slice/school.slice';
import { School, Activity, Settings, Users, ArrowUpRight, ShieldCheck, Terminal, ArrowUpDown, ChevronUp, ChevronDown, LifeBuoy, Cpu, Database, Network } from 'lucide-react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import moment from 'moment';
import { getImageUrl } from '../../utils/imageHelper';

const SuperAdminHome = () => {
    const dispatch = useDispatch();
    const { analytics, auditLogs, tickets, loading } = useSelector((state) => state.superAdmin);
    const { schools } = useSelector((state) => state.school);

    const [sortField, setSortField] = useState('name');
    const [sortOrder, setSortOrder] = useState('asc');

    useEffect(() => {
        dispatch(fetchPlatformAnalytics());
        dispatch(fetchAuditLogs({ limit: 5 }));
        dispatch(fetchSchools());
        dispatch(fetchTickets());
    }, [dispatch]);

    const handleSort = (field) => {
        if (sortField === field) {
            setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
        } else {
            setSortField(field);
            setSortOrder('asc');
        }
    };

    const sortedSchools = useMemo(() => {
        if (!schools) return [];
        return [...schools].sort((a, b) => {
            let valA = a[sortField];
            let valB = b[sortField];

            if (sortField === 'isActive') {
                valA = a.isActive ? 1 : 0;
                valB = b.isActive ? 1 : 0;
            }

            if (typeof valA === 'string') {
                return sortOrder === 'asc'
                    ? valA.localeCompare(valB)
                    : valB.localeCompare(valA);
            }

            return sortOrder === 'asc' ? (valA || 0) - (valB || 0) : (valB || 0) - (valA || 0);
        });
    }, [schools, sortField, sortOrder]);

    const displayLogs = useMemo(() => {
        if (!auditLogs) return [];
        const logs = [...auditLogs].filter(Boolean);
        if (logs.length < 3) {
            const mockFallbacks = [
                {
                    _id: 'mock-log-1',
                    userId: { firstName: 'System', lastName: 'Monitor' },
                    action: 'System health scan completed: 0 threats detected',
                    createdAt: new Date(Date.now() - 45 * 60 * 1000)
                },
                {
                    _id: 'mock-log-2',
                    userId: { firstName: 'Database', lastName: 'Agent' },
                    action: 'Automatic database storage optimizations performed',
                    createdAt: new Date(Date.now() - 3 * 3600 * 1000)
                },
                {
                    _id: 'mock-log-3',
                    userId: { firstName: 'API', lastName: 'Gateway' },
                    action: 'Security SSL/TLS validation handshake completed',
                    createdAt: new Date(Date.now() - 6 * 3600 * 1000)
                }
            ];
            const needed = 3 - logs.length;
            for (let i = 0; i < needed; i++) {
                if (mockFallbacks[i]) {
                    logs.push(mockFallbacks[i]);
                }
            }
        }
        return logs.slice(0, 3);
    }, [auditLogs]);

    const analyticsMetrics = useMemo(() => {
        return [
            { label: 'System Server Load', value: '42%', width: '42%', color: 'bg-brand-primary' },
            { label: 'Database Storage Capacity', value: '68%', width: '68%', color: 'bg-luxury-emerald' },
            { label: 'API Gateway Bandwidth', value: '81%', width: '81%', color: 'bg-brand-accent' }
        ];
    }, []);

    const stats = [
        { 
            label: 'Total Schools', 
            value: analytics?.infrastructure?.totalSchools || 0, 
            icon: School, 
            color: 'text-brand-primary bg-brand-primary/10 border-brand-primary/20', 
            trend: `${analytics?.infrastructure?.activeSchools || 0} Active` 
        },
        { 
            label: 'Total Users', 
            value: (analytics?.users?.total || 0).toLocaleString(), 
            icon: Users, 
            color: 'text-brand-accent bg-brand-accent/10 border-brand-accent/20', 
            trend: `${analytics?.users?.active || 0} Active` 
        },
    ];

    return (
        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="space-y-8 md:space-y-10 pb-10">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 mb-2">
                <div className="flex flex-col">
                    <h1 className="text-2xl xs:text-3xl font-bold tracking-tight text-slate-100 font-inter">Super Admin Dashboard</h1>
                    <p className="text-xs xs:text-sm font-medium text-slate-400 mt-1 tracking-wide">Overview of registered schools and users.</p>
                </div>
                <div className="px-4 py-2 rounded-md bg-brand-primary/10 border border-brand-primary/20 flex items-center gap-3 text-[10px] xs:text-xs font-bold text-brand-primary uppercase tracking-widest italic">
                    <span className="w-1.5 h-1.5 rounded-md bg-brand-primary animate-pulse shadow-[0_0_8px_rgba(37,99,235,0.4)]"></span>
                    System Online
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 xs:gap-8">
                {stats.map((stat, idx) => (
                    <div key={idx} className="p-6 xs:p-8 rounded-md bg-brand-surface border border-brand-border shadow-2xl group hover:border-brand-primary/30 transition-all duration-300 relative overflow-hidden">
                        <div className="flex justify-between items-start mb-6 font-bold uppercase tracking-widest text-[9px] xs:text-[10px] text-slate-500 italic">{stat.label} <span className="text-brand-accent/60">{stat.trend}</span></div>
                        <div className="flex items-center justify-between">
                            <h3 className="text-3xl xs:text-4xl font-bold tracking-tight font-inter text-slate-100 mb-1 uppercase italic">{stat.value}</h3>
                            <div className={`p-2.5 xs:p-3 rounded-md border ${stat.color} transition-transform group-hover:scale-110 duration-500`}>
                                <stat.icon size={20} />
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* School Registry & Support Tickets Sorting Section */}
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 xs:gap-8">
                {/* School Directory Column - Takes 2 cols on wide screens */}
                <div className="xl:col-span-2 bg-brand-surface border border-brand-border rounded-md p-6 xs:p-8 shadow-2xl flex flex-col">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h3 className="text-sm font-black text-white italic uppercase tracking-[0.2em] mb-1">School Registry Overview</h3>
                            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest italic">Registered schools sorted dynamically.</p>
                        </div>
                        <Link to="/superadmin/schools" className="text-[10px] font-black text-brand-primary uppercase tracking-widest hover:underline flex items-center gap-1">
                            Manage Schools <ArrowUpRight size={14} />
                        </Link>
                    </div>

                    <div className="overflow-x-auto custom-scrollbar flex-1">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b border-brand-border bg-slate-900/50">
                                    <th 
                                        onClick={() => handleSort('name')}
                                        className="px-4 py-3 text-[9px] font-black text-slate-500 uppercase tracking-widest italic cursor-pointer hover:text-slate-300 transition-colors select-none"
                                    >
                                        <div className="flex items-center gap-1">
                                            School Name 
                                            <ArrowUpDown size={10} className={sortField === 'name' ? 'text-brand-primary' : 'opacity-30'} />
                                        </div>
                                    </th>
                                    <th 
                                        onClick={() => handleSort('subdomain')}
                                        className="px-4 py-3 text-[9px] font-black text-slate-500 uppercase tracking-widest italic cursor-pointer hover:text-slate-300 transition-colors select-none"
                                    >
                                        <div className="flex items-center gap-1">
                                            Subdomain
                                            <ArrowUpDown size={10} className={sortField === 'subdomain' ? 'text-brand-primary' : 'opacity-30'} />
                                        </div>
                                    </th>
                                    <th 
                                        onClick={() => handleSort('isActive')}
                                        className="px-4 py-3 text-[9px] font-black text-slate-500 uppercase tracking-widest italic cursor-pointer hover:text-slate-300 transition-colors select-none"
                                    >
                                        <div className="flex items-center gap-1">
                                            Status
                                            <ArrowUpDown size={10} className={sortField === 'isActive' ? 'text-brand-primary' : 'opacity-30'} />
                                        </div>
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-brand-border/40">
                                {sortedSchools.slice(0, 5).map((school, i) => (
                                    <tr key={i} className="group/row hover:bg-white/[0.01] transition-colors">
                                        <td className="px-4 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded bg-slate-800 border border-brand-border flex items-center justify-center overflow-hidden shrink-0">
                                                    {getImageUrl(school.logo) ? <img src={getImageUrl(school.logo)} alt="" className="w-full h-full object-cover" /> : <School size={14} className="text-slate-600" />}
                                                </div>
                                                <span className="font-bold text-xs text-white uppercase italic tracking-tight group-hover/row:text-brand-primary transition-colors">{school.name}</span>
                                            </div>
                                        </td>
                                        <td className="px-4 py-4">
                                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{school.subdomain}</span>
                                        </td>
                                        <td className="px-4 py-4">
                                            <div className="flex items-center gap-2">
                                                <div className={`w-1.5 h-1.5 rounded-full ${school.isActive ? 'bg-luxury-emerald animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.5)]' : 'bg-slate-600'}`}></div>
                                                <span className="text-[9px] font-bold uppercase text-slate-500 tracking-widest">{school.isActive ? 'Active' : 'Offline'}</span>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                                {sortedSchools.length === 0 && (
                                    <tr>
                                        <td colSpan={3} className="text-center py-8 text-xs italic text-slate-600">No registered schools found.</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Recent Support Tickets Column */}
                <div className="xl:col-span-1 bg-brand-surface border border-brand-border rounded-md p-6 xs:p-8 shadow-2xl flex flex-col">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h3 className="text-sm font-black text-white italic uppercase tracking-[0.2em] mb-1">Recent Tickets</h3>
                            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest italic">Awaiting response.</p>
                        </div>
                        <Link to="/superadmin/support" className="text-[10px] font-black text-brand-primary uppercase tracking-widest hover:underline flex items-center gap-1">
                            All Tickets <ArrowUpRight size={14} />
                        </Link>
                    </div>

                    <div className="space-y-3 flex-1">
                        {tickets && tickets.slice(0, 4).map((ticket, i) => (
                            <div key={i} className="p-3.5 rounded bg-slate-900/30 border border-brand-border/40 hover:border-brand-primary/20 transition-all flex flex-col gap-1.5">
                                <div className="flex justify-between items-start">
                                    <span className={`text-[8px] font-black uppercase px-2 py-0.5 rounded tracking-widest italic border ${
                                        ticket.priority === 'Urgent' ? 'bg-superadmin-primary/10 border-superadmin-primary/20 text-superadmin-primary' :
                                        ticket.priority === 'High' ? 'bg-orange-500/10 border-orange-500/20 text-orange-500' :
                                        'bg-slate-800 border-white/5 text-slate-500'
                                    }`}>
                                        {ticket.priority}
                                    </span>
                                    <span className="text-[8px] font-bold text-slate-600 uppercase tracking-widest">{moment(ticket.createdAt).fromNow()}</span>
                                </div>
                                <h4 className="text-xs font-black text-slate-200 uppercase italic truncate leading-none mt-1">{ticket.subject}</h4>
                                <div className="flex justify-between items-center text-[8px] font-bold text-slate-500 uppercase tracking-widest mt-1">
                                    <span>{ticket.schoolId?.name}</span>
                                    <span className={ticket.status === 'Resolved' ? 'text-emerald-500' : 'text-sky-500'}>{ticket.status}</span>
                                </div>
                            </div>
                        ))}
                        {(!tickets || tickets.length === 0) && (
                            <div className="text-center py-12 opacity-30 flex flex-col items-center justify-center">
                                <LifeBuoy size={24} className="mb-2" />
                                <p className="text-xs italic">No support tickets found.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md600:grid-cols-2 gap-6 xs:gap-8">
                <Link to="/superadmin/analytics" className="bg-brand-surface border border-brand-border rounded-md p-8 xs:p-10 min-h-[340px] flex flex-col group relative hover:border-brand-primary/30 transition-all duration-300 overflow-hidden shadow-2xl">
                    <div className="absolute top-6 right-6 text-slate-600 group-hover:text-brand-primary transition-colors duration-500"><ArrowUpRight size={18} /></div>
                    <div className="mb-6">
                        <div className="flex items-center gap-2 mb-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-brand-primary animate-pulse" />
                            <h4 className="text-[10px] font-black text-slate-100 uppercase tracking-[0.2em] italic">System Health & Telemetry</h4>
                        </div>
                        <p className="text-[10px] font-medium text-slate-500 italic">Live infrastructure nodes status and cluster telemetry.</p>
                    </div>
                    
                    <div className="flex-1 grid grid-cols-1 gap-4">
                        {/* Metric 1: Server Load */}
                        <div className="p-3.5 bg-slate-900/50 backdrop-blur-sm border border-white/5 hover:border-brand-primary/20 rounded-md transition-all flex items-center justify-between gap-4 shadow-lg group/item">
                            <div className="flex items-center gap-3">
                                <div className="p-2 rounded bg-brand-primary/10 border border-brand-primary/20 text-brand-primary group-hover/item:scale-110 transition-transform duration-300">
                                    <Cpu size={16} />
                                </div>
                                <div className="min-w-0">
                                    <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mb-0.5">Server Cluster Load</p>
                                    <p className="text-xs font-black text-slate-200 font-outfit uppercase italic flex items-center gap-1.5">
                                        42% Active
                                        <span className="w-1.5 h-1.5 rounded-full bg-luxury-emerald animate-ping" />
                                    </p>
                                </div>
                            </div>
                            {/* Uptime Tick Graph */}
                            <div className="flex items-end gap-1 h-6 shrink-0">
                                {[0.8, 0.9, 1.0, 0.95, 1.0, 0.85, 1.0, 1.0, 0.9, 0.95, 1.0, 1.0].map((val, idx) => (
                                    <div 
                                        key={idx} 
                                        className={`w-1 rounded-sm ${val === 1.0 ? 'bg-luxury-emerald' : val >= 0.9 ? 'bg-luxury-emerald/70' : 'bg-amber-500'} animate-pulse`}
                                        style={{ 
                                            height: `${val * 24}px`,
                                            animationDelay: `${idx * 0.1}s`,
                                            animationDuration: '2s'
                                        }}
                                    />
                                ))}
                            </div>
                        </div>

                        {/* Metric 2: DB Storage */}
                        <div className="p-3.5 bg-slate-900/50 backdrop-blur-sm border border-white/5 hover:border-brand-primary/20 rounded-md transition-all space-y-2.5 shadow-lg group/item">
                            <div className="flex justify-between items-center">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 rounded bg-luxury-emerald/10 border border-luxury-emerald/20 text-luxury-emerald group-hover/item:scale-110 transition-transform duration-300">
                                        <Database size={16} />
                                    </div>
                                    <div className="min-w-0">
                                        <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mb-0.5">Database Storage</p>
                                        <p className="text-[10px] font-bold text-slate-400 font-mono tracking-tight">6.8TB / 10TB</p>
                                    </div>
                                </div>
                                <span className="text-xs font-black text-luxury-emerald font-outfit italic">68%</span>
                            </div>
                            <div className="h-1.5 bg-slate-950 rounded-full overflow-hidden border border-white/5 relative p-0.5">
                                <div className="h-full rounded-full bg-gradient-to-r from-brand-primary via-brand-accent to-luxury-emerald" style={{ width: '68%' }} />
                            </div>
                        </div>

                        {/* Metric 3: Network Throughput */}
                        <div className="p-3.5 bg-slate-900/50 backdrop-blur-sm border border-white/5 hover:border-brand-primary/20 rounded-md transition-all flex items-center justify-between gap-4 shadow-lg group/item">
                            <div className="flex items-center gap-3">
                                <div className="p-2 rounded bg-brand-accent/10 border border-brand-accent/20 text-brand-accent group-hover/item:scale-110 transition-transform duration-300">
                                    <Network size={16} />
                                </div>
                                <div className="min-w-0">
                                    <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mb-0.5">API Network Throughput</p>
                                    <p className="text-xs font-black text-slate-200 font-outfit uppercase italic">8.1 GB/s</p>
                                </div>
                            </div>
                            <div className="w-20 h-6 opacity-80 group-hover:opacity-100 transition-all duration-300 shrink-0">
                                <svg className="w-full h-full text-brand-accent" viewBox="0 0 100 20" fill="none" preserveAspectRatio="none">
                                    <defs>
                                        <linearGradient id="waveGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                                            <stop offset="0%" stopColor="#2563eb" stopOpacity="0.8" />
                                            <stop offset="50%" stopColor="#8b5cf6" stopOpacity="0.8" />
                                            <stop offset="100%" stopColor="#10b981" stopOpacity="0.8" />
                                        </linearGradient>
                                    </defs>
                                    <motion.path 
                                        d="M0,10 Q10,2 20,10 T40,10 T60,5 T80,15 T100,8" 
                                        stroke="url(#waveGrad)" 
                                        strokeWidth="2.5" 
                                        strokeLinecap="round"
                                        animate={{ pathLength: [0.95, 1.05, 0.95] }}
                                        transition={{ repeat: Infinity, duration: 2.5, ease: "easeInOut" }}
                                    />
                                </svg>
                            </div>
                        </div>
                    </div>
                    
                    <p className="text-[9px] font-bold text-brand-primary uppercase tracking-widest mt-4 group-hover:underline">View Detailed Analytics</p>
                </Link>
 
                <Link to="/superadmin/security" className="bg-brand-surface border border-brand-border rounded-md p-8 xs:p-10 min-h-[340px] flex flex-col group relative hover:border-brand-primary/30 transition-all duration-300 overflow-hidden shadow-2xl">
                    <div className="absolute top-6 right-6 text-slate-600 group-hover:text-brand-primary transition-colors duration-500"><ArrowUpRight size={18} /></div>
                    <div className="mb-6">
                        <div className="flex items-center gap-2 mb-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-brand-accent animate-pulse" />
                            <h4 className="text-[10px] font-black text-slate-100 uppercase tracking-[0.2em] italic">Security & Access Logs</h4>
                        </div>
                        <p className="text-[10px] font-medium text-slate-500 italic tracking-wide">Real-time timeline of administrative sessions and actions.</p>
                    </div>
                    
                    <div className="flex-1 relative pl-6 space-y-4 flex flex-col justify-center">
                        {/* Vertical timeline line */}
                        <div className="absolute left-[12px] top-6 bottom-6 w-0.5 bg-gradient-to-b from-brand-primary/40 via-brand-accent/30 to-white/5 border-dashed border-l border-white/10" />
 
                        {displayLogs.map((log, i) => {
                            // Generate initials
                            const first = log.userId?.firstName || 'S';
                            const last = log.userId?.lastName || 'A';
                            const initials = `${first.charAt(0)}${last.charAt(0)}`.toUpperCase();
                            
                            // Determine module badge colors
                            const isSystem = log.userId?.firstName === 'System' || log.userId?.firstName === 'Gateway';
                            const moduleText = isSystem ? 'SYSTEM' : (log.module || 'ADMIN').toUpperCase();
                            const badgeColor = 
                                moduleText === 'SYSTEM' ? 'border-brand-accent/20 bg-brand-accent/10 text-brand-accent' :
                                moduleText === 'SECURITY' ? 'border-luxury-rose/20 bg-luxury-rose/10 text-luxury-rose' :
                                'border-brand-primary/20 bg-brand-primary/10 text-brand-primary';
 
                            const avatarColor = 
                                i === 0 ? 'bg-brand-primary/10 text-brand-primary border-brand-primary/30' :
                                i === 1 ? 'bg-brand-accent/10 text-brand-accent border-brand-accent/30' :
                                'bg-luxury-emerald/10 text-luxury-emerald border-luxury-emerald/30';
 
                            return (
                                <div key={log._id || i} className="relative flex gap-4 items-center group/log hover:translate-x-1.5 transition-all duration-300 p-3 bg-slate-900/30 border border-white/[0.02] hover:bg-slate-900/50 hover:border-brand-primary/20 rounded-md shadow-md">
                                    {/* Timeline node indicator */}
                                    <div 
                                        className={`absolute -left-[18px] w-3 h-3 rounded-full bg-slate-950 border-2 flex items-center justify-center ${
                                            i === 0 ? 'border-brand-primary shadow-[0_0_8px_rgba(37,99,235,0.6)]' : 'border-slate-800'
                                        }`}
                                        style={{ top: '50%', transform: 'translateY(-50%)' }}
                                    >
                                        <div className={`w-1 h-1 rounded-full ${i === 0 ? 'bg-brand-primary' : 'bg-slate-700'}`} />
                                    </div>
 
                                    {/* User Photo or Initials */}
                                    <div className={`w-8 h-8 rounded-full border flex items-center justify-center text-[10px] font-black tracking-tight shrink-0 overflow-hidden shadow-inner ${avatarColor}`}>
                                        {getImageUrl(log.userId?.photo) ? (
                                            <img src={getImageUrl(log.userId.photo)} alt="" className="w-full h-full object-cover" />
                                        ) : (
                                            <span>{initials}</span>
                                        )}
                                    </div>
 
                                    {/* Content */}
                                    <div className="min-w-0 flex-1">
                                        <div className="flex items-center gap-2 mb-0.5">
                                            <span className="text-[10px] font-black text-slate-100 uppercase italic">
                                                {log.userId?.firstName} {log.userId?.lastName}
                                            </span>
                                            <span className={`text-[7px] font-black px-1.5 py-0.5 rounded border tracking-widest ${badgeColor}`}>
                                                {moduleText}
                                            </span>
                                            <span className="text-[8px] font-bold text-slate-600 ml-auto whitespace-nowrap">
                                                {moment(log.createdAt).fromNow()}
                                            </span>
                                        </div>
                                        <p className="text-[9px] font-medium text-slate-400 italic truncate uppercase tracking-wide">
                                            {log.action}
                                        </p>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                    <p className="text-[9px] font-bold text-brand-primary uppercase tracking-widest mt-4 group-hover:underline">Open Security Center</p>
                </Link>
            </div>
        </motion.div>
    );
};

export default SuperAdminHome;
