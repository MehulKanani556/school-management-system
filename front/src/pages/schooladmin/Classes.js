import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchClasses, createClass, updateClass, deleteClass } from '../../redux/slice/schoolAdmin.slice';
import { motion } from 'framer-motion';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import Modal from '../../components/Modal';

const empty = { gradeLevel: '', sectionLabel: '', subjects: '' };

const Classes = () => {
  const dispatch = useDispatch();
  const { classes, loading } = useSelector((s) => s.schoolAdmin);
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState(empty);
  const [editing, setEditing] = useState(null);

  useEffect(() => { dispatch(fetchClasses()); }, [dispatch]);

  const openAdd = () => { setForm(empty); setEditing(null); setModal(true); };
  const openEdit = (c) => { setForm({ ...c, subjects: c.subjects?.join(', ') || '' }); setEditing(c._id); setModal(true); };

  const handleSubmit = (e) => {
    e.preventDefault();
    const data = { ...form, gradeLevel: Number(form.gradeLevel), subjects: form.subjects.split(',').map(s => s.trim()).filter(Boolean) };
    if (editing) dispatch(updateClass({ id: editing, data }));
    else dispatch(createClass(data));
    setModal(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black uppercase tracking-tighter font-outfit">Classes & Subjects</h1>
          <p className="text-slate-400 text-sm mt-1">{classes.length} classes configured</p>
        </div>
        <button onClick={openAdd} className="flex items-center gap-2 px-5 py-3 bg-brand-primary hover:bg-blue-500 rounded-2xl font-black text-sm uppercase tracking-wider transition-all font-outfit">
          <Plus size={18} /> Add Class
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {loading && classes.length === 0 ? (
          [...Array(6)].map((_, i) => <div key={i} className="h-40 rounded-[2rem] bg-slate-800/30 animate-pulse" />)
        ) : classes.length === 0 ? (
          <div className="col-span-3 py-16 text-center text-slate-500 italic">No classes yet. Add your first class.</div>
        ) : classes.map((c, i) => (
          <motion.div key={c._id} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
            className="bg-brand-surface/40 backdrop-blur-xl border border-brand-border/40 rounded-[2rem] p-7 hover:border-brand-primary/30 transition-all group">
            <div className="flex items-start justify-between mb-4">
              <div>
                <p className="text-2xl font-black font-outfit">Grade {c.gradeLevel}<span className="text-brand-primary">-{c.sectionLabel}</span></p>
                <p className="text-xs text-slate-500 font-bold uppercase tracking-widest mt-1">
                  {c.classTeacher ? `${c.classTeacher.firstName} ${c.classTeacher.lastName}` : 'No class teacher'}
                </p>
              </div>
              <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button onClick={() => openEdit(c)} className="p-2 rounded-xl hover:bg-brand-primary/20 text-slate-500 hover:text-brand-primary transition-all"><Pencil size={14} /></button>
                <button onClick={() => dispatch(deleteClass(c._id))} className="p-2 rounded-xl hover:bg-red-500/10 text-slate-500 hover:text-red-400 transition-all"><Trash2 size={14} /></button>
              </div>
            </div>
            {c.subjects?.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-4">
                {c.subjects.map(s => (
                  <span key={s} className="px-3 py-1 bg-slate-800/60 rounded-xl text-[10px] font-black uppercase tracking-wider text-slate-400">{s}</span>
                ))}
              </div>
            )}
          </motion.div>
        ))}
      </div>

      <Modal open={modal} onClose={() => setModal(false)} title={editing ? 'Edit Class' : 'Add Class'}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 font-outfit">Grade Level (1-12)</label>
              <input required type="number" min={1} max={12} value={form.gradeLevel} onChange={e => setForm({ ...form, gradeLevel: e.target.value })}
                className="mt-1.5 w-full bg-slate-800/40 border border-brand-border/40 focus:border-brand-primary rounded-xl py-2.5 px-4 text-white outline-none text-sm transition-all" />
            </div>
            <div>
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 font-outfit">Section Label</label>
              <input required value={form.sectionLabel} onChange={e => setForm({ ...form, sectionLabel: e.target.value })} placeholder="A, B, C..."
                className="mt-1.5 w-full bg-slate-800/40 border border-brand-border/40 focus:border-brand-primary rounded-xl py-2.5 px-4 text-white outline-none text-sm transition-all" />
            </div>
          </div>
          <div>
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 font-outfit">Subjects (comma separated)</label>
            <input value={form.subjects} onChange={e => setForm({ ...form, subjects: e.target.value })} placeholder="Math, Science, English..."
              className="mt-1.5 w-full bg-slate-800/40 border border-brand-border/40 focus:border-brand-primary rounded-xl py-2.5 px-4 text-white outline-none text-sm transition-all" />
          </div>
          <button type="submit" disabled={loading}
            className="w-full py-3 bg-brand-primary hover:bg-blue-500 rounded-2xl font-black text-sm uppercase tracking-wider transition-all font-outfit mt-2">
            {loading ? 'Saving...' : editing ? 'Update Class' : 'Add Class'}
          </button>
        </form>
      </Modal>
    </div>
  );
};

export default Classes;
