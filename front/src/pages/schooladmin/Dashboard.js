import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchDashboard } from '../../redux/slice/schoolAdmin.slice';
import { motion } from 'framer-motion';
import { Users, GraduationCap, BookOpen, CreditCard, ClipboardList } from 'lucide-react';

const StatCard = ({ icon: Icon, label, value, color, delay }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay }}
    className={`p-7 rounded-[2rem] bg-gradient-to-br border ${color} shadow-xl hover:scale-[1.02] transition-transform duration-300`}
  >
    <div className="flex items-start justify-between mb-6">
      <div className="p-3 rounded-2xl bg-white/5">
        <Icon size={22} className="text-white/70" />
      </div>
    </div>
    <p className="text-[10px] font-black uppercase tracking-[0.25em] text-slate-400 mb-2 font-outfit">{label}</p>
    <p className="text-4xl font-black tracking-tighter font-outfit">{value ?? '—'}</p>
  </motion.div>
);

const Dashboard = () => {
  const dispatch = useDispatch();
  const { dashboard, loading } = useSelector((s) => s.schoolAdmin);
  const { user } = useSelector((s) => s.auth);

  useEffect(() => { dispatch(fetchDashboard()); }, [dispatch]);

  const stats = [
    { icon: Users,         label: 'Total Students',  value: dashboard?.students,    color: 'from-brand-primary/20 to-brand-primary/5 border-brand-primary/20',     delay: 0 },
    { icon: GraduationCap, label: 'Total Teachers',  value: dashboard?.teachers,    color: 'from-brand-secondary/20 to-brand-secondary/5 border-brand-secondary/20', delay: 0.05 },
    { icon: BookOpen,      label: 'Classes',         value: dashboard?.classes,     color: 'from-purple-500/20 to-purple-500/5 border-purple-500/20',               delay: 0.1 },
    { icon: CreditCard,    label: 'Pending Fees',    value: dashboard?.pendingFees, color: 'from-amber-500/20 to-amber-500/5 border-amber-500/20',                  delay: 0.15 },
    { icon: ClipboardList, label: 'Total Exams',     value: dashboard?.exams,       color: 'from-emerald-500/20 to-emerald-500/5 border-emerald-500/20',            delay: 0.2 },
  ];

  return (
    <div className="space-y-8">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-3xl font-black uppercase tracking-tighter font-outfit">
          Welcome, {user?.firstName}
        </h1>
        <p className="text-slate-400 mt-1">Here's your school overview for today.</p>
      </motion.div>

      {loading && !dashboard ? (
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-5">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-40 rounded-[2rem] bg-slate-800/30 animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-5">
          {stats.map((s) => <StatCard key={s.label} {...s} />)}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.25 }}
          className="bg-brand-surface/40 backdrop-blur-xl border border-brand-border/40 rounded-[2rem] p-8"
        >
          <p className="text-xs font-black uppercase tracking-[0.25em] text-slate-500 mb-6 font-outfit">Quick Actions</p>
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: 'Add Student', href: '/school-admin/students' },
              { label: 'Add Teacher', href: '/school-admin/teachers' },
              { label: 'Create Exam', href: '/school-admin/exams' },
              { label: 'Mark Attendance', href: '/school-admin/attendance' },
            ].map(({ label, href }) => (
              <a key={label} href={href}
                className="px-4 py-3 rounded-2xl bg-slate-800/40 hover:bg-brand-primary/20 border border-brand-border/30 hover:border-brand-primary/30 text-sm font-black uppercase tracking-wider text-slate-400 hover:text-white transition-all text-center font-outfit"
              >
                {label}
              </a>
            ))}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.3 }}
          className="bg-brand-surface/40 backdrop-blur-xl border border-brand-border/40 rounded-[2rem] p-8 flex items-center justify-center border-dashed"
        >
          <div className="text-center">
            <p className="text-slate-500 font-black uppercase tracking-[0.3em] text-xs font-outfit opacity-60 mb-2">Recent Activity</p>
            <p className="text-slate-600 italic text-sm">Activity feed coming soon</p>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Dashboard;
