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
    .required('Grade / Standard is required')
    .min(1, 'Grade must be at least 1')
    .max(12, 'Grade cannot exceed 12'),
  sectionLabel: Yup.string()
    .required('Section / Room label is required')
    .matches(/^[A-Z][A-Z0-9]*$/, 'Must start with a letter and contain only letters/numbers')
    .max(20, 'Label too long'),
  subjects: Yup.array(),
  classTeacher: Yup.string().required('A Class Teacher must be assigned'),
});

const Classes = () => {
  const dispatch = useDispatch();
  const { classes, teachers, subjects, loading } = useSelector((s) => s.schoolAdmin);
  const { user } = useSelector((s) => s.auth);
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
        schoolId: user.schoolId
      };

      console.log(data);
      
      if (editing) {
        dispatch(updateClass({ id: editing, data }));
      } else {
        dispatch(createClass(data));
      }
      setModal(false);
      formik.resetForm();
    },
  });

  const handleSectionChange = (e) => {
    let value = e.target.value.toUpperCase();
    // Only allow Alphabets and Numbers
    value = value.replace(/[^A-Z0-9]/g, '');
    
    // Enforce first character as Alphabet
    if (value.length > 0 && !/^[A-Z]/.test(value)) {
      value = value.replace(/^[0-9]+/, '');
    }
    
    formik.setFieldValue('sectionLabel', value);
  };

  const openAdd = (gradeLevel = '') => {
    setEditing(null);
    formik.resetForm();
    if (gradeLevel) {
      formik.setFieldValue('gradeLevel', gradeLevel);
    }
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

  const groupedClasses = classes.reduce((acc, curr) => {
    if (!acc[curr.gradeLevel]) acc[curr.gradeLevel] = [];
    acc[curr.gradeLevel].push(curr);
    return acc;
  }, {});

  const sortedGrades = Object.keys(groupedClasses).sort((a, b) => Number(a) - Number(b));

  return (
    <div className="space-y-12 font-outfit pb-20">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black uppercase tracking-tighter text-white">Classrooms & Sections</h1>
          <p className="text-slate-400 text-sm mt-1">Manage classrooms across active standards</p>
        </div>
        <button onClick={() => openAdd()} className="flex items-center gap-2 px-6 py-3.5 bg-brand-primary hover:bg-blue-500 rounded-2xl font-black text-sm uppercase tracking-wider transition-all shadow-lg shadow-brand-primary/20">
          <Plus size={18} /> Add New
        </button>
      </div>

      {loading && classes.length === 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-10">
          {[...Array(4)].map((_, i) => <div key={i} className="h-48 rounded-[2.5rem] bg-slate-800/20 animate-pulse" />)}
        </div>
      ) : sortedGrades.length === 0 ? (
        <div className="py-20 text-center bg-brand-surface/20 border border-brand-border/20 rounded-[3.5rem]">
          <p className="text-slate-500 italic font-medium">No classrooms configured yet. Start by adding your first classroom.</p>
        </div>
      ) : (
        <div className="space-y-16">
          {sortedGrades.map((grade) => {
            const sections = groupedClasses[grade].sort((a,b) => a.sectionLabel.localeCompare(b.sectionLabel));
            return (
              <div key={grade} className="space-y-8">
                <div className="flex items-center gap-6">
                  <div className="h-px flex-1 bg-gradient-to-r from-transparent to-slate-800" />
                  <div className="flex items-center gap-4">
                    <h2 className="text-xl font-black text-white/50 uppercase tracking-[0.3em]">Grade {grade}</h2>
                    <button 
                      onClick={() => openAdd(grade)}
                      className="w-8 h-8 rounded-full bg-brand-primary/10 text-brand-primary flex items-center justify-center hover:bg-brand-primary hover:text-white transition-all transform hover:scale-110"
                    >
                      <Plus size={14} />
                    </button>
                  </div>
                  <div className="h-px flex-1 bg-gradient-to-l from-transparent to-slate-800" />
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 px-4">
                  {sections.map((c, i) => (
                    <motion.div 
                      key={c._id} 
                      initial={{ opacity: 0, scale: 0.95 }} 
                      animate={{ opacity: 1, scale: 1 }} 
                      transition={{ delay: i * 0.05 }}
                      className="bg-brand-surface/40 backdrop-blur-xl border border-brand-border/30 rounded-[1rem] p-6 hover:border-brand-primary/40 transition-all group relative overflow-hidden"
                    >
                      <div className="absolute top-0 right-0 w-24 h-24 bg-brand-primary/5 blur-[40px] rounded-full -mr-8 -mt-8" />
                      
                      <div className="flex items-start justify-between relative z-10">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-brand-primary/10 flex items-center justify-center text-brand-primary text-lg font-black italic">
                            {c.sectionLabel}
                          </div>
                          <div>
                            <p className="text-sm font-black text-white uppercase tracking-wider">Section {c.sectionLabel}</p>
                            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-0.5">Grade {grade}</p>
                          </div>
                        </div>
                        <div className="flex gap-1 opacity-100 lg:opacity-0 group-hover:opacity-100 transition-opacity">
                          <button onClick={() => openEdit(c)} className="p-2 text-slate-500 hover:text-brand-primary"><Pencil size={12} /></button>
                          <button onClick={() => dispatch(deleteClass(c._id))} className="p-2 text-slate-500 hover:text-red-400"><Trash2 size={12} /></button>
                        </div>
                      </div>

                      <div className="mt-6 pt-5 border-t border-slate-800/40 relative z-10">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-[10px] font-black text-brand-primary border border-slate-700/50">
                            {c.classTeacher ? c.classTeacher.firstName[0] : '?'}
                          </div>
                          <div className="min-w-0">
                            <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest mb-0.5">Class Teacher</p>
                            <p className="text-xs font-bold text-slate-200 truncate">
                              {c.classTeacher ? `${c.classTeacher.firstName} ${c.classTeacher.lastName}` : 'Unassigned'}
                            </p>
                          </div>
                        </div>
                      </div>

                      {c.subjects?.length > 0 && (
                        <div className="mt-5 flex flex-wrap gap-1.5 relative z-10">
                          {c.subjects.slice(0, 3).map(s => (
                            <span key={s._id} className="px-2 py-0.5 bg-slate-900 border border-slate-800 rounded-lg text-[8px] font-bold text-slate-500 uppercase">{s.name}</span>
                          ))}
                          {c.subjects.length > 3 && <span className="text-[8px] text-slate-600 font-black">+{c.subjects.length - 3} MORE</span>}
                        </div>
                      )}
                    </motion.div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      <Modal open={modal} onClose={() => setModal(false)} title={editing ? 'Edit Classroom' : 'Add New Classroom'}>
        <form onSubmit={formik.handleSubmit} className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 font-outfit">Grade / Standard (1-12)</label>
              <input 
                name="gradeLevel"
                type="number" 
                min={1} 
                max={12} 
                value={formik.values.gradeLevel} 
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                placeholder="e.g. 10"
                className={`mt-1.5 w-full bg-slate-800/40 border ${formik.touched.gradeLevel && formik.errors.gradeLevel ? 'border-red-500' : 'border-brand-border/40'} focus:border-brand-primary rounded-xl py-2.5 px-4 text-white outline-none text-sm transition-all`} 
              />
              {formik.touched.gradeLevel && formik.errors.gradeLevel && (
                <p className="text-[10px] text-red-500 mt-1 font-bold italic">{formik.errors.gradeLevel}</p>
              )}
            </div>
            <div>
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 font-outfit">Section / Room Label</label>
              <div className="flex flex-col gap-2">
                <input 
                  name="sectionLabel"
                  value={formik.values.sectionLabel} 
                  onChange={handleSectionChange}
                  onBlur={formik.handleBlur}
                  placeholder="e.g. A or A1"
                  className={`mt-1.5 w-full bg-slate-800/40 border ${formik.touched.sectionLabel && formik.errors.sectionLabel ? 'border-red-500' : 'border-brand-border/40'} focus:border-brand-primary rounded-xl py-2.5 px-4 text-white outline-none text-sm transition-all`} 
                />
                <div className="flex gap-2">
                  {['A', 'B', 'C', 'D','E'].map(label => (
                    <button 
                      key={label}
                      type="button" 
                      onClick={() => formik.setFieldValue('sectionLabel', label)}
                      className={`px-3 py-1 rounded-lg text-[10px] font-black transition-all border ${formik.values.sectionLabel === label ? 'bg-brand-primary border-brand-primary text-white' : 'bg-slate-800 border-slate-700 text-slate-400 hover:border-slate-500'}`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>
              {formik.touched.sectionLabel && formik.errors.sectionLabel && (
                <p className="text-[10px] text-red-500 mt-1 font-bold italic">{formik.errors.sectionLabel}</p>
              )}
            </div>
          </div>

          <div>
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 font-outfit">Assigned Class Teacher</label>
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
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 font-outfit mb-2 block">Assign Subjects for this Section</label>
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
            className="w-full py-3 bg-brand-primary hover:bg-blue-500 rounded-2xl font-black text-sm uppercase tracking-wider transition-all font-outfit mt-2 text-white shadow-xl shadow-brand-primary/20">
            {loading ? 'Processing...' : editing ? 'Update Classroom' : 'Create Classroom'}
          </button>
        </form>
      </Modal>
    </div>
  );
};

export default Classes;


