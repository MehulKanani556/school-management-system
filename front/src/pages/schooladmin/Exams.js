import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchExams, fetchClasses, createExam, updateExam, deleteExam } from '../../redux/slice/schoolAdmin.slice';
import { motion } from 'framer-motion';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import Modal from '../../components/Modal';

const empty = { name: '', type: 'unit_test', classSection: '', subject: '', maxMarks: 100, date: '' };
const typeColor = { unit_test: 'text-blue-400 bg-blue-400/10', midterm: 'text-purple-400 bg-purple-400/10', final: 'text-red-400 bg-red-400/10' };

const Exams = () => {
  const dispatch = useDispatch();
  const { exams, classes, loading } = useSelector((s) => s.schoolAdmin);
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState(empty);
  const [editing, setEditing] = useState(null);

  useEffect(() => { dispatch(fetchExams()); dispatch(fetchClasses()); }, [dispatch]);

  const openAdd = () => { setForm(empty); setEditing(null); setModal(true); };
  const openEdit = (e) => {
    setForm({ ...e, classSection: e.classSection?._id || e.classSection || '', date: e.date ? e.date.split('T')[0] : '' });
    setEditing(e._id); setModal(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (editing) dispatch(updateExam({ id: editing, data: form }));
    else dispatch(createExam(form));
    setModal(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black uppercase tracking-tighter font-outfit">Exams</h1>
          <p className="text-slate-400 text-sm mt-1">{exams.length} exams scheduled</p>
        </div>
        <button onClick={openAdd} className="flex items-center gap-2 px-5 py-3 bg-brand-primary hover:bg-blue-500 rounded-2xl font-black text-sm uppercase tracking-wider transition-all font-outfit">
          <Plus size={18} /> Schedule Exam
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {loading && exams.length === 0 ? (
          [...Array(3)].map((_, i) => <div key={i} className="h-44 rounded-[2rem] bg-slate-800/30 animate-pulse" />)
        ) : exams.length === 0 ? (
          <div className="col-span-3 py-16 text-center text-slate-500 italic">No exams scheduled yet</div>
        ) : exams.map((e, i) => (
          <motion.div key={e._id} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
            className="bg-brand-surface/40 backdrop-blur-xl border border-brand-border/40 rounded-[2rem] p-7 hover:border-brand-primary/30 transition-all group">
            <div className="flex items-start justify-between mb-3">
              <span className={`px-3 py-1 rounded-xl text-[10px] font-black uppercase tracking-wider ${typeColor[e.type]}`}>{e.type.replace('_', ' ')}</span>
              <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button onClick={() => openEdit(e)} className="p-1.5 rounded-xl hover:bg-brand-primary/20 text-slate-500 hover:text-brand-primary transition-all"><Pencil size={13} /></button>
                <button onClick={() => dispatch(deleteExam(e._id))} className="p-1.5 rounded-xl hover:bg-red-500/10 text-slate-500 hover:text-red-400 transition-all"><Trash2 size={13} /></button>
              </div>
            </div>
            <h3 className="text-lg font-black font-outfit mt-3">{e.name}</h3>
            <p className="text-sm text-slate-400 mt-1">{e.subject || 'All subjects'}</p>
            <div className="flex items-center justify-between mt-5 pt-4 border-t border-brand-border/20">
              <span className="text-xs text-slate-500">
                {e.classSection ? `Grade ${e.classSection.gradeLevel}-${e.classSection.sectionLabel}` : 'All classes'}
              </span>
              <span className="text-xs font-bold text-slate-400">{e.date ? new Date(e.date).toLocaleDateString() : '—'}</span>
            </div>
          </motion.div>
        ))}
      </div>

      <Modal open={modal} onClose={() => setModal(false)} title={editing ? 'Edit Exam' : 'Schedule Exam'}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 font-outfit">Exam Name</label>
            <input required value={form.name} onChange={e => setForm({ ...form, name: e.target.value })}
              className="mt-1.5 w-full bg-slate-800/40 border border-brand-border/40 focus:border-brand-primary rounded-xl py-2.5 px-4 text-white outline-none text-sm transition-all" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 font-outfit">Type</label>
              <select value={form.type} onChange={e => setForm({ ...form, type: e.target.value })}
                className="mt-1.5 w-full bg-slate-800/40 border border-brand-border/40 focus:border-brand-primary rounded-xl py-2.5 px-4 text-white outline-none text-sm transition-all">
                <option value="unit_test">Unit Test</option>
                <option value="midterm">Midterm</option>
                <option value="final">Final</option>
              </select>
            </div>
            <div>
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 font-outfit">Max Marks</label>
              <input type="number" value={form.maxMarks} onChange={e => setForm({ ...form, maxMarks: e.target.value })}
                className="mt-1.5 w-full bg-slate-800/40 border border-brand-border/40 focus:border-brand-primary rounded-xl py-2.5 px-4 text-white outline-none text-sm transition-all" />
            </div>
          </div>
          <div>
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 font-outfit">Class</label>
            <select value={form.classSection} onChange={e => setForm({ ...form, classSection: e.target.value })}
              className="mt-1.5 w-full bg-slate-800/40 border border-brand-border/40 focus:border-brand-primary rounded-xl py-2.5 px-4 text-white outline-none text-sm transition-all">
              <option value="">All classes</option>
              {classes.map(c => <option key={c._id} value={c._id}>Grade {c.gradeLevel}-{c.sectionLabel}</option>)}
            </select>
          </div>
          <div>
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 font-outfit">Subject</label>
            <input value={form.subject} onChange={e => setForm({ ...form, subject: e.target.value })}
              className="mt-1.5 w-full bg-slate-800/40 border border-brand-border/40 focus:border-brand-primary rounded-xl py-2.5 px-4 text-white outline-none text-sm transition-all" />
          </div>
          <div>
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 font-outfit">Date</label>
            <input required type="date" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })}
              className="mt-1.5 w-full bg-slate-800/40 border border-brand-border/40 focus:border-brand-primary rounded-xl py-2.5 px-4 text-white outline-none text-sm transition-all" />
          </div>
          <button type="submit" disabled={loading}
            className="w-full py-3 bg-brand-primary hover:bg-blue-500 rounded-2xl font-black text-sm uppercase tracking-wider transition-all font-outfit mt-2">
            {loading ? 'Saving...' : editing ? 'Update Exam' : 'Schedule Exam'}
          </button>
        </form>
      </Modal>
    </div>
  );
};

export default Exams;
