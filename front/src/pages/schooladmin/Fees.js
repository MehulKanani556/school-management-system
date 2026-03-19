import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchFees, fetchStudents, createFee, updateFee } from '../../redux/slice/schoolAdmin.slice';
import { motion } from 'framer-motion';
import { Plus, Pencil } from 'lucide-react';
import Modal from '../../components/Modal';

const empty = { studentId: '', amount: '', category: '', status: 'pending', dueDate: '' };

const statusColor = { paid: 'text-emerald-400 bg-emerald-400/10', pending: 'text-amber-400 bg-amber-400/10', overdue: 'text-red-400 bg-red-400/10' };

const Fees = () => {
  const dispatch = useDispatch();
  const { fees, students, loading } = useSelector((s) => s.schoolAdmin);
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState(empty);
  const [editing, setEditing] = useState(null);
  const [filter, setFilter] = useState('all');

  useEffect(() => { dispatch(fetchFees()); dispatch(fetchStudents()); }, [dispatch]);

  const openAdd = () => { setForm(empty); setEditing(null); setModal(true); };
  const openEdit = (f) => {
    setForm({ ...f, studentId: f.studentId?._id || f.studentId, dueDate: f.dueDate ? f.dueDate.split('T')[0] : '' });
    setEditing(f._id); setModal(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (editing) dispatch(updateFee({ id: editing, data: form }));
    else dispatch(createFee(form));
    setModal(false);
  };

  const filtered = filter === 'all' ? fees : fees.filter(f => f.status === filter);
  const total = fees.reduce((s, f) => s + (f.amount || 0), 0);
  const paid = fees.filter(f => f.status === 'paid').reduce((s, f) => s + (f.amount || 0), 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black uppercase tracking-tighter font-outfit">Fees Management</h1>
          <p className="text-slate-400 text-sm mt-1">{fees.length} fee records</p>
        </div>
        <button onClick={openAdd} className="flex items-center gap-2 px-5 py-3 bg-brand-primary hover:bg-blue-500 rounded-2xl font-black text-sm uppercase tracking-wider transition-all font-outfit">
          <Plus size={18} /> Add Fee
        </button>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Total Billed', value: `$${total.toLocaleString()}`, color: 'border-brand-primary/20' },
          { label: 'Collected', value: `$${paid.toLocaleString()}`, color: 'border-emerald-500/20' },
          { label: 'Outstanding', value: `$${(total - paid).toLocaleString()}`, color: 'border-amber-500/20' },
        ].map(({ label, value, color }) => (
          <div key={label} className={`bg-brand-surface/40 border ${color} rounded-[1.5rem] p-6`}>
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 font-outfit">{label}</p>
            <p className="text-2xl font-black font-outfit mt-2">{value}</p>
          </div>
        ))}
      </div>

      <div className="flex gap-2">
        {['all', 'paid', 'pending', 'overdue'].map(s => (
          <button key={s} onClick={() => setFilter(s)}
            className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all font-outfit ${filter === s ? 'bg-brand-primary text-white' : 'bg-slate-800/40 text-slate-500 hover:text-white'}`}>
            {s}
          </button>
        ))}
      </div>

      <div className="bg-brand-surface/40 backdrop-blur-xl border border-brand-border/40 rounded-[2rem] overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-brand-border/30">
              {['Student', 'Category', 'Amount', 'Status', 'Due Date', 'Actions'].map(h => (
                <th key={h} className="px-6 py-4 text-left text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 font-outfit">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr><td colSpan={6} className="px-6 py-12 text-center text-slate-500 italic">No fee records found</td></tr>
            ) : filtered.map((f, i) => (
              <motion.tr key={f._id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.03 }}
                className="border-b border-brand-border/20 hover:bg-slate-800/20 transition-colors">
                <td className="px-6 py-4 font-semibold text-sm">
                  {f.studentId ? `${f.studentId.firstName} ${f.studentId.lastName}` : '—'}
                </td>
                <td className="px-6 py-4 text-slate-400 text-sm">{f.category}</td>
                <td className="px-6 py-4 font-bold">${f.amount?.toLocaleString()}</td>
                <td className="px-6 py-4">
                  <span className={`px-3 py-1 rounded-xl text-[10px] font-black uppercase tracking-wider ${statusColor[f.status]}`}>{f.status}</span>
                </td>
                <td className="px-6 py-4 text-slate-400 text-sm">{f.dueDate ? new Date(f.dueDate).toLocaleDateString() : '—'}</td>
                <td className="px-6 py-4">
                  <button onClick={() => openEdit(f)} className="p-2 rounded-xl hover:bg-brand-primary/20 text-slate-500 hover:text-brand-primary transition-all"><Pencil size={15} /></button>
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>

      <Modal open={modal} onClose={() => setModal(false)} title={editing ? 'Edit Fee' : 'Add Fee Record'}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 font-outfit">Student</label>
            <select required value={form.studentId} onChange={e => setForm({ ...form, studentId: e.target.value })}
              className="mt-1.5 w-full bg-slate-800/40 border border-brand-border/40 focus:border-brand-primary rounded-xl py-2.5 px-4 text-white outline-none text-sm transition-all">
              <option value="">Select student</option>
              {students.map(s => <option key={s._id} value={s._id}>{s.firstName} {s.lastName} ({s.admissionNumber})</option>)}
            </select>
          </div>
          {[['category', 'Category', 'text', true], ['amount', 'Amount', 'number', true]].map(([k, l, t, req]) => (
            <div key={k}>
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 font-outfit">{l}</label>
              <input required={req} type={t} value={form[k]} onChange={e => setForm({ ...form, [k]: e.target.value })}
                className="mt-1.5 w-full bg-slate-800/40 border border-brand-border/40 focus:border-brand-primary rounded-xl py-2.5 px-4 text-white outline-none text-sm transition-all" />
            </div>
          ))}
          <div>
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 font-outfit">Status</label>
            <select value={form.status} onChange={e => setForm({ ...form, status: e.target.value })}
              className="mt-1.5 w-full bg-slate-800/40 border border-brand-border/40 focus:border-brand-primary rounded-xl py-2.5 px-4 text-white outline-none text-sm transition-all">
              <option value="pending">Pending</option>
              <option value="paid">Paid</option>
              <option value="overdue">Overdue</option>
            </select>
          </div>
          <div>
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 font-outfit">Due Date</label>
            <input type="date" value={form.dueDate} onChange={e => setForm({ ...form, dueDate: e.target.value })}
              className="mt-1.5 w-full bg-slate-800/40 border border-brand-border/40 focus:border-brand-primary rounded-xl py-2.5 px-4 text-white outline-none text-sm transition-all" />
          </div>
          <button type="submit" disabled={loading}
            className="w-full py-3 bg-brand-primary hover:bg-blue-500 rounded-2xl font-black text-sm uppercase tracking-wider transition-all font-outfit mt-2">
            {loading ? 'Saving...' : editing ? 'Update Fee' : 'Add Fee'}
          </button>
        </form>
      </Modal>
    </div>
  );
};

export default Fees;
