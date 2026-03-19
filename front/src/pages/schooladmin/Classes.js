import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchClasses, fetchTeachers, fetchSubjects, createClass, updateClass, deleteClass } from '../../redux/slice/schoolAdmin.slice';
import { motion } from 'framer-motion';
import { Plus, Pencil, Trash2, CheckCircle2 } from 'lucide-react';
import Modal from '../../components/Modal';
import { useFormik } from 'formik';
import * as Yup from 'yup';

const validationSchema = Yup.object({
  gradeLevel: Yup.number()
    .required('Grade level is required')
    .min(1, 'Grade must be at least 1')
    .max(12, 'Grade cannot exceed 12'),
  sectionLabel: Yup.string()
    .required('Section label is required')
    .max(10, 'Section label too long'),
  subjects: Yup.array(),
  classTeacher: Yup.string(),
});

const Classes = () => {
  const dispatch = useDispatch();
  const { classes, teachers, subjects, loading } = useSelector((s) => s.schoolAdmin);
  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState(null);

  useEffect(() => {
    dispatch(fetchClasses());
    dispatch(fetchTeachers());
    dispatch(fetchSubjects());
  }, [dispatch]);

  const formik = useFormik({
    initialValues: {
      gradeLevel: '',
      sectionLabel: '',
      subjects: [],
      classTeacher: '',
    },
    validationSchema,
    onSubmit: (values) => {
      const data = {
        ...values,
        gradeLevel: Number(values.gradeLevel),
        classTeacher: values.classTeacher || null,
      };
      
      if (editing) {
        dispatch(updateClass({ id: editing, data }));
      } else {
        dispatch(createClass(data));
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

  const openEdit = (c) => {
    setEditing(c._id);
    formik.setValues({
      gradeLevel: c.gradeLevel,
      sectionLabel: c.sectionLabel,
      subjects: c.subjects?.map(s => s._id) || [],
      classTeacher: c.classTeacher?._id || c.classTeacher || '',
    });
    setModal(true);
  };

  const toggleSubject = (subId) => {
    const current = [...formik.values.subjects];
    const index = current.indexOf(subId);
    if (index > -1) current.splice(index, 1);
    else current.push(subId);
    formik.setFieldValue('subjects', current);
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
                <p className="text-2xl font-black font-outfit text-white uppercase tracking-tight">Grade {c.gradeLevel}<span className="text-brand-primary">-{c.sectionLabel}</span></p>
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
                  <span key={s._id} className="px-3 py-1 bg-slate-800/60 rounded-xl text-[10px] font-black uppercase tracking-wider text-slate-400">{s.name}</span>
                ))}
              </div>
            )}
          </motion.div>
        ))}
      </div>

      <Modal open={modal} onClose={() => setModal(false)} title={editing ? 'Edit Class' : 'Add Class'}>
        <form onSubmit={formik.handleSubmit} className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 font-outfit">Grade Level (1-12)</label>
              <input 
                name="gradeLevel"
                type="number" 
                min={1} 
                max={12} 
                value={formik.values.gradeLevel} 
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                className={`mt-1.5 w-full bg-slate-800/40 border ${formik.touched.gradeLevel && formik.errors.gradeLevel ? 'border-red-500' : 'border-brand-border/40'} focus:border-brand-primary rounded-xl py-2.5 px-4 text-white outline-none text-sm transition-all`} 
              />
              {formik.touched.gradeLevel && formik.errors.gradeLevel && (
                <p className="text-[10px] text-red-500 mt-1 font-bold italic">{formik.errors.gradeLevel}</p>
              )}
            </div>
            <div>
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 font-outfit">Section Label</label>
              <input 
                name="sectionLabel"
                value={formik.values.sectionLabel} 
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                placeholder="A, B, C..."
                className={`mt-1.5 w-full bg-slate-800/40 border ${formik.touched.sectionLabel && formik.errors.sectionLabel ? 'border-red-500' : 'border-brand-border/40'} focus:border-brand-primary rounded-xl py-2.5 px-4 text-white outline-none text-sm transition-all`} 
              />
              {formik.touched.sectionLabel && formik.errors.sectionLabel && (
                <p className="text-[10px] text-red-500 mt-1 font-bold italic">{formik.errors.sectionLabel}</p>
              )}
            </div>
          </div>

          <div>
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 font-outfit">Class Teacher (Optional)</label>
            <select
              name="classTeacher"
              value={formik.values.classTeacher}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              className="mt-1.5 w-full bg-slate-800/40 border border-brand-border/40 focus:border-brand-primary rounded-xl py-2.5 px-4 text-white outline-none text-sm transition-all"
            >
              <option value="" className="bg-slate-900">Select Class Teacher</option>
              {teachers.map(t => (
                <option key={t._id} value={t._id} className="bg-slate-900">
                  {t.firstName} {t.lastName} ({t.employeeId})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 font-outfit mb-2 block">Assign Subjects</label>
            <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto p-3 bg-slate-800/20 rounded-xl border border-brand-border/40">
              {subjects.map(sub => (
                <button
                  key={sub._id}
                  type="button"
                  onClick={() => toggleSubject(sub._id)}
                  className={`flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold transition-all border ${
                    formik.values.subjects.includes(sub._id)
                      ? 'bg-brand-primary/20 border-brand-primary text-white'
                      : 'bg-slate-800/40 border-brand-border/20 text-slate-400 hover:border-slate-600'
                  }`}
                >
                  <span className="truncate">{sub.name}</span>
                  {formik.values.subjects.includes(sub._id) && <CheckCircle2 size={14} className="text-brand-primary" />}
                </button>
              ))}
              {subjects.length === 0 && (
                <p className="col-span-2 text-center text-slate-500 text-xs py-2">No subjects found. Create subjects first.</p>
              )}
            </div>
          </div>

          <button type="submit" disabled={loading}
            className="w-full py-3 bg-brand-primary hover:bg-blue-500 rounded-2xl font-black text-sm uppercase tracking-wider transition-all font-outfit mt-2 text-white">
            {loading ? 'Saving...' : editing ? 'Update Class' : 'Add Class'}
          </button>
        </form>
      </Modal>
    </div>
  );
};

export default Classes;


