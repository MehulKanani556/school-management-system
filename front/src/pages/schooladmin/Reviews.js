import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchReviews, fetchTeachers, createReview, updateReview, deleteReview } from '../../redux/slice/schoolAdmin.slice';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { motion } from 'framer-motion';
import { Plus, Pencil, Trash2, Search, Star, MessageSquareQuote, Rocket, GraduationCap, ChevronRight } from 'lucide-react';
import Modal from '../../components/Modal';
import { format, parseISO } from 'date-fns';

const validationSchema = Yup.object({
  teacherId: Yup.string().required('Teacher is required'),
  rating: Yup.number().min(1).max(5).required('Rating is required'),
  comments: Yup.string().min(10, 'Review should be at least 10 characters').required('Comments are required'),
  date: Yup.date().required('Date is required'),
});

const inputClass = (touched, error) =>
  `mt-1.5 w-full bg-slate-800 border ${touched && error ? 'border-red-500/60' : 'border-slate-700'} focus:border-brand-primary rounded-md py-3 px-4 text-white placeholder-slate-500 outline-none text-sm transition-all`;

const FieldError = ({ touched, error }) =>
  touched && error ? <p className="mt-1 text-[10px] text-red-400 font-bold tracking-wide">{error}</p> : null;

const emptyValues = { 
  teacherId: '', 
  rating: 5, 
  comments: '', 
  date: format(new Date(), 'yyyy-MM-dd') 
};

const Reviews = () => {
  const dispatch = useDispatch();
  const { reviews, teachers, loading } = useSelector((s) => s.schoolAdmin);
  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [search, setSearch] = useState('');

  useEffect(() => { 
    dispatch(fetchReviews());
    dispatch(fetchTeachers());
  }, [dispatch]);

  const formik = useFormik({
    initialValues: emptyValues,
    validationSchema,
    enableReinitialize: true,
    onSubmit: async (values, { resetForm }) => {
      const action = editing
        ? dispatch(updateReview({ id: editing, data: values }))
        : dispatch(createReview(values));
      const result = await action;
      if (!result.error) {
        setModal(false);
        resetForm();
        setEditing(null);
      }
    },
  });

  const openAdd = () => {
    setEditing(null);
    formik.setValues(emptyValues);
    setModal(true);
  };

  const openEdit = (r) => {
    setEditing(r._id);
    formik.setValues({
      teacherId: r.teacherId?._id || '',
      rating: r.rating,
      comments: r.comments,
      date: r.date ? r.date.split('T')[0] : format(new Date(), 'yyyy-MM-dd'),
    });
    setModal(true);
  };

  const filtered = reviews.filter(r =>
    `${r.teacherId?.firstName} ${r.teacherId?.lastName}`.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black uppercase tracking-tighter font-outfit text-white">Performance Reviews</h1>
          <p className="text-slate-400 text-sm mt-1">Institutional academic audit and teacher review system</p>
        </div>
        <button onClick={openAdd} className="flex items-center gap-2 px-6 py-4 bg-brand-primary hover:bg-schooladmin-primary rounded-md font-black text-xs uppercase tracking-widest transition-all font-outfit border border-schooladmin-primary/20 shadow-xl shadow-schooladmin-primary/20 active:scale-95">
          <Plus size={18} /> Add New Review
        </button>
      </div>

      <div className="relative">
        <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search reviews by teacher..."
          className="w-full bg-brand-surface/40 border border-brand-border/40 rounded-md py-4 pl-12 pr-5 text-white placeholder-slate-600 outline-none focus:border-brand-primary transition-all shadow-inner shadow-black/20" />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {loading && reviews.length === 0 ? (
          <div className="col-span-full py-20 text-center text-slate-500 font-bold uppercase tracking-widest animate-pulse">Accessing Audit Trail...</div>
        ) : filtered.length === 0 ? (
          <div className="col-span-full py-20 text-center bg-brand-surface/20 border border-dashed border-brand-border/40 rounded-md">
            <Rocket size={48} className="mx-auto text-slate-800 mb-4 opacity-30" />
            <p className="text-slate-500 font-medium tracking-tight">No performance reviews recorded yet</p>
          </div>
        ) : (
          filtered.map((r, i) => (
            <motion.div
              key={r._id}
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.05 }}
              className="bg-brand-surface/40 backdrop-blur-xl border border-brand-border/30 rounded-md p-8 hover:bg-brand-surface/60 transition-all group overflow-hidden relative shadow-2xl shadow-black/20"
            >
              <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
                 <Rocket size={140} />
              </div>

              <div className="flex items-start justify-between mb-6">
                <div className="flex gap-4">
                  <div className="w-14 h-14 rounded-md bg-gradient-to-br from-brand-primary/20 to-brand-secondary/20 flex items-center justify-center border border-white/5 shadow-inner">
                    <GraduationCap size={24} className="text-white opacity-80" />
                  </div>
                  <div>
                    <h3 className="text-lg font-black text-white hover:text-brand-primary transition-colors cursor-default uppercase tracking-tighter">{r.teacherId?.firstName} {r.teacherId?.lastName}</h3>
                    <div className="flex items-center gap-2 mt-1">
                       <p className="text-[10px] text-brand-primary font-black uppercase tracking-widest">Employee {r.teacherId?.employeeId}</p>
                       <div className="w-1 h-1 rounded-md bg-slate-700" />
                       <p className="text-[10px] text-slate-500 font-bold">{format(parseISO(r.date), 'dd MMM, yyyy')}</p>
                    </div>
                  </div>
                </div>
                <div className="flex gap-1">
                  {[...Array(5)].map((_, starIdx) => (
                    <Star key={starIdx} size={14} className={starIdx < r.rating ? 'text-luxury-gold fill-luxury-gold' : 'text-slate-700'} />
                  ))}
                </div>
              </div>

              <div className="bg-slate-900/40 border border-white/5 p-6 rounded-md mb-6 relative">
                 <MessageSquareQuote size={32} className="text-brand-primary/10 absolute top-4 right-4" />
                 <p className="text-sm text-slate-300 leading-relaxed italic line-clamp-4">"{r.comments}"</p>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-brand-border/20">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-md bg-slate-800 border border-white/5 flex items-center justify-center">
                    <span className="text-[8px] font-black uppercase text-slate-400">{r.reviewerId?.firstName?.[0]}{r.reviewerId?.lastName?.[0]}</span>
                  </div>
                  <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Reviewer: <span className="text-slate-300">{r.reviewerId?.firstName}</span></p>
                </div>
                <div className="flex gap-3">
                  <button onClick={() => openEdit(r)} className="text-[10px] font-black text-slate-500 hover:text-brand-primary uppercase tracking-widest transition-colors">Modify</button>
                  <button onClick={() => dispatch(deleteReview(r._id))} className="text-[10px] font-black text-slate-500 hover:text-luxury-rose uppercase tracking-widest transition-colors">Purge</button>
                </div>
              </div>
            </motion.div>
          ))
        )}
      </div>

      <Modal open={modal} onClose={() => setModal(false)} title={editing ? 'Update Review Node' : 'Initialize Performance Audit'}>
        <form onSubmit={formik.handleSubmit} className="space-y-5">
          <div>
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 font-outfit">Consultant Selection (Teacher)</label>
            <select 
              {...formik.getFieldProps('teacherId')} 
              className={inputClass(formik.touched.teacherId, formik.errors.teacherId)}
              disabled={!!editing}
            >
              <option value="">Choose a teacher...</option>
              {teachers.map(t => (
                <option key={t._id} value={t._id}>{t.firstName} {t.lastName} ({t.employeeId})</option>
              ))}
            </select>
            <FieldError touched={formik.touched.teacherId} error={formik.errors.teacherId} />
          </div>

          <div className="grid grid-cols-1 gap-5">
            <div>
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 font-outfit">Rating Index (1-5)</label>
              <div className="flex gap-2 mt-2">
                {[1, 2, 3, 4, 5].map(star => (
                   <button 
                     key={star}
                     type="button" 
                     onClick={() => formik.setFieldValue('rating', star)}
                     className={`p-3 rounded-md border transition-all ${formik.values.rating >= star ? 'bg-luxury-gold/10 border-luxury-gold/40 text-luxury-gold shadow-lg shadow-yellow-500/10' : 'bg-slate-800 border-slate-700 text-slate-500'}`}
                   >
                     <Star size={18} fill={formik.values.rating >= star ? 'currentColor' : 'none'} />
                   </button>
                ))}
              </div>
            </div>
            <div>
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 font-outfit">Audit Date</label>
              <input type="date" {...formik.getFieldProps('date')} className={inputClass(formik.touched.date, formik.errors.date)} />
            </div>
          </div>

          <div>
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 font-outfit">Audit Comments / Performance Vector</label>
            <textarea {...formik.getFieldProps('comments')} rows={5} className={`${inputClass(formik.touched.comments, formik.errors.comments)} resize-none`} placeholder="Describe teacher performance, strengths, and areas for tactical improvement..."></textarea>
            <FieldError touched={formik.touched.comments} error={formik.errors.comments} />
          </div>

          <button type="submit" disabled={loading}
            className="w-full py-4 bg-brand-primary hover:bg-schooladmin-primary disabled:opacity-60 rounded-md font-black text-[11px] uppercase tracking-[0.2em] transition-all font-outfit mt-4 flex items-center justify-center gap-3 shadow-xl shadow-schooladmin-primary/20 active:scale-95">
             {loading ? 'Committing to Registry...' : editing ? 'Update Performance Vector' : 'Publish Review Node'} <ChevronRight size={16} />
          </button>
        </form>
      </Modal>
    </div>
  );
};

export default Reviews;
