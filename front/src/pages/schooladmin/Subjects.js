import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchSubjects, createSubject, updateSubject, deleteSubject } from '../../redux/slice/schoolAdmin.slice';
import { motion } from 'framer-motion';
import { Plus, Pencil, Trash2, BookOpen } from 'lucide-react';
import Modal from '../../components/Modal';
import { useFormik } from 'formik';
import * as Yup from 'yup';

const validationSchema = Yup.object({
  name: Yup.string()
    .required('Subject name is required')
    .min(2, 'Name too short'),
  code: Yup.string()
    .max(10, 'Code too long'),
  description: Yup.string(),
});

const Subjects = () => {
  const dispatch = useDispatch();
  const { subjects, loading } = useSelector((s) => s.schoolAdmin);
  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState(null);

  useEffect(() => {
    dispatch(fetchSubjects());
  }, [dispatch]);

  const formik = useFormik({
    initialValues: {
      name: '',
      code: '',
      description: '',
    },
    validationSchema,
    onSubmit: (values) => {
      if (editing) {
        dispatch(updateSubject({ id: editing, data: values }));
      } else {
        dispatch(createSubject(values));
      }
      setModal(false);
      formik.resetForm();
    },
  });

  const openAdd = () => {
    setEditing(null);
    formik.resetForm();
    setModal(true);
  };

  const openEdit = (sub) => {
    setEditing(sub._id);
    formik.setValues({
      name: sub.name,
      code: sub.code || '',
      description: sub.description || '',
    });
    setModal(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black uppercase tracking-tighter font-outfit text-white">Subjects Management</h1>
          <p className="text-slate-400 text-sm mt-1">{subjects.length} subjects available</p>
        </div>
        <button onClick={openAdd} className="flex items-center gap-2 px-5 py-3 bg-brand-primary hover:bg-schooladmin-primary rounded-md font-black text-sm uppercase tracking-wider transition-all font-outfit text-white">
          <Plus size={18} /> Add Subject
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {loading && subjects.length === 0 ? (
          [...Array(6)].map((_, i) => <div key={i} className="h-32 rounded-md bg-slate-800/30 animate-pulse" />)
        ) : subjects.length === 0 ? (
          <div className="col-span-3 py-16 text-center text-slate-500 italic font-outfit">No subjects found. Create your first subject.</div>
        ) : subjects.map((sub, i) => (
          <motion.div key={sub._id} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
            className="bg-brand-surface/40 backdrop-blur-xl border border-brand-border/40 rounded-md p-7 hover:border-brand-primary/30 transition-all group overflow-hidden relative">

            <div className="absolute -right-4 -bottom-4 text-slate-800/20 group-hover:text-brand-primary/10 transition-colors">
              <BookOpen size={100} />
            </div>

            <div className="flex items-start justify-between relative z-10">
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h3 className="text-xl font-black font-outfit text-white uppercase tracking-tight">{sub.name}</h3>
                  {sub.code && (
                    <span className="px-2 py-0.5 bg-brand-primary/10 text-brand-primary text-[10px] font-black rounded-md uppercase">
                      {sub.code}
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-400 mt-2 line-clamp-2 font-medium leading-relaxed">
                  {sub.description || 'No description provided.'}
                </p>
              </div>
              <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button onClick={() => openEdit(sub)} className="p-2 rounded-md hover:bg-brand-primary/20 text-slate-500 hover:text-brand-primary transition-all">
                  <Pencil size={14} />
                </button>
                <button onClick={() => dispatch(deleteSubject(sub._id))} className="p-2 rounded-md hover:bg-red-500/10 text-slate-500 hover:text-red-400 transition-all">
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <Modal open={modal} onClose={() => setModal(false)} title={editing ? 'Edit Subject' : 'Add Subject'}>
        <form onSubmit={formik.handleSubmit} className="space-y-4">
          <div>
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 font-outfit">Subject Name</label>
            <input
              name="name"
              value={formik.values.name}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              placeholder="e.g. Mathematics"
              className={`mt-1.5 w-full bg-slate-800/40 border ${formik.touched.name && formik.errors.name ? 'border-red-500' : 'border-brand-border/40'} focus:border-brand-primary rounded-md py-2.5 px-4 text-white outline-none text-sm transition-all`}
            />
            {formik.touched.name && formik.errors.name && (
              <p className="text-[10px] text-red-500 mt-1 font-bold italic">{formik.errors.name}</p>
            )}
          </div>

          <div>
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 font-outfit">Subject Code (Optional)</label>
            <input
              name="code"
              value={formik.values.code}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              placeholder="e.g. MATH101"
              className="mt-1.5 w-full bg-slate-800/40 border border-brand-border/40 focus:border-brand-primary rounded-md py-2.5 px-4 text-white outline-none text-sm transition-all"
            />
          </div>

          <div>
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 font-outfit">Description</label>
            <textarea
              name="description"
              rows={3}
              value={formik.values.description}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              placeholder="Brief overview of the subject..."
              className="mt-1.5 w-full bg-slate-800/40 border border-brand-border/40 focus:border-brand-primary rounded-md py-2.5 px-4 text-white outline-none text-sm transition-all resize-none"
            />
          </div>

          <button type="submit" disabled={loading}
            className="w-full py-3 bg-brand-primary hover:bg-schooladmin-primary rounded-md font-black text-sm uppercase tracking-wider transition-all font-outfit mt-2 text-white">
            {loading ? 'Saving...' : editing ? 'Update Subject' : 'Add Subject'}
          </button>
        </form>
      </Modal>
    </div>
  );
};

export default Subjects;
