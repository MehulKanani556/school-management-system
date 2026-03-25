import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchClasses, fetchTeachers, fetchSubjects, fetchStandards, createClass, updateClass, deleteClass, createStandard, updateStandard, deleteStandard } from '../../redux/slice/schoolAdmin.slice';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Pencil, Trash2, CheckCircle2, Layout, BookOpen } from 'lucide-react';
import Modal from '../../components/Modal';
import { useFormik } from 'formik';
import * as Yup from 'yup';

const validationSchema = Yup.object({
  standardId: Yup.string().required('Standard is required'),
  sectionLabel: Yup.string()
    .required('Section / Room label is required')
    .matches(/^[A-Z][A-Z0-9]*$/, 'Must start with a letter and contain only letters/numbers')
    .max(20, 'Label too long'),
  classTeacher: Yup.string().required('A Class Teacher must be assigned'),
});

const standardSchema = Yup.object({
  level: Yup.number().required('Grade level is required').min(1).max(12),
  name: Yup.string(),
  subjects: Yup.array().min(1, 'Select at least one subject'),
});

const Classes = () => {
  const dispatch = useDispatch();
  const { classes, teachers, subjects, standards, loading } = useSelector((s) => s.schoolAdmin);
  const { user } = useSelector((s) => s.auth);
  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [stdModal, setStdModal] = useState(false);
  const [editingStd, setEditingStd] = useState(null);

  useEffect(() => {
    dispatch(fetchClasses());
    dispatch(fetchTeachers());
    dispatch(fetchSubjects());
    dispatch(fetchStandards());
  }, [dispatch]);

  const formik = useFormik({
    initialValues: {
      standardId: '',
      sectionLabel: '',
      classTeacher: '',
      subjectAssignments: [],
    },
    validationSchema,
    onSubmit: (values) => {
      const validAssignments = values.subjectAssignments.filter(a => a.subject);
      const data = {
        ...values,
        schoolId: user.schoolId,
        subjectAssignments: validAssignments,
        subjects: validAssignments.map(a => a.subject)
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

  const stdFormik = useFormik({
    initialValues: { level: '', name: '', subjects: [] },
    validationSchema: standardSchema,
    onSubmit: (values) => {
      const data = { ...values, schoolId: user.schoolId };
      if (editingStd) dispatch(updateStandard({ id: editingStd, data }));
      else dispatch(createStandard(data));
      setStdModal(false);
      stdFormik.resetForm();
    }
  });

  const addAssignmentRow = () => {
    const current = [...formik.values.subjectAssignments];
    current.push({ subject: '', teachers: [] });
    formik.setFieldValue('subjectAssignments', current);
  };

  const removeAssignmentRow = (index) => {
    const current = [...formik.values.subjectAssignments];
    current.splice(index, 1);
    formik.setFieldValue('subjectAssignments', current);
  };

  const updateAssignmentRow = (index, field, value) => {
    const current = [...formik.values.subjectAssignments];
    current[index] = { ...current[index], [field]: value };
    formik.setFieldValue('subjectAssignments', current);
  };

  const toggleTeacherInRow = (rowIndex, teacherId) => {
    const current = [...formik.values.subjectAssignments];
    const teachers = [...current[rowIndex].teachers];
    const tIndex = teachers.indexOf(teacherId);
    if (tIndex > -1) teachers.splice(tIndex, 1);
    else teachers.push(teacherId);
    
    current[rowIndex] = { ...current[rowIndex], teachers };
    formik.setFieldValue('subjectAssignments', current);
  };

  useEffect(() => {
    if (formik.values.standardId) {
      const selectedStd = standards.find(s => s._id === formik.values.standardId);
      if (selectedStd) {
        const stdSubjectIds = selectedStd.subjects?.map(sub => (sub._id || sub).toString()) || [];
        const currentAssignments = formik.values.subjectAssignments || [];
        
        // 1. Maintain existing assignments only for subjects still in the standard
        const reconciled = stdSubjectIds.map(sId => {
          const existing = currentAssignments.find(a => (a.subject?._id || a.subject)?.toString() === sId);
          if (existing) {
            return {
              subject: sId,
              teachers: existing.teachers.map(t => t._id || t)
            };
          }
          return { subject: sId, teachers: [] };
        });

        // 2. Check if reconciliation actually changed anything to avoid infinite loop
        const currentSimple = JSON.stringify(currentAssignments.map(a => ({
          subject: (a.subject?._id || a.subject)?.toString(),
          teachers: a.teachers.map(t => (t._id || t)?.toString()).sort()
        })));
        const reconciledSimple = JSON.stringify(reconciled.map(a => ({
          subject: a.subject,
          teachers: a.teachers.map(t => t.toString()).sort()
        })));

        if (currentSimple !== reconciledSimple) {
          formik.setFieldValue('subjectAssignments', reconciled);
        }
      }
    }
  }, [formik.values.standardId, standards, formik.setFieldValue]);


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

  const openAdd = (standardId = '') => {
    setEditing(null);
    formik.resetForm();
    if (standardId) formik.setFieldValue('standardId', standardId);
    setModal(true);
  };

  const openStdAdd = () => {
    setEditingStd(null);
    stdFormik.resetForm();
    setStdModal(true);
  };

  const openStdEdit = (s) => {
    setEditingStd(s._id);
    stdFormik.setValues({
      level: s.level,
      name: s.name || '',
      subjects: s.subjects?.map(sub => sub._id) || [],
    });
    setStdModal(true);
  };

  const openEdit = (c) => {
    setEditing(c._id);
    formik.setValues({
      standardId: c.standardId?._id || c.standardId || '',
      sectionLabel: c.sectionLabel,
      classTeacher: c.classTeacher?._id || c.classTeacher || '',
      subjectAssignments: c.subjectAssignments?.map(a => ({
        subject: a.subject?._id || a.subject,
        teachers: a.teachers?.map(t => t._id || t) || []
      })) || [],
    });
    setModal(true);
  };


  const sectionsByStandard = classes.reduce((acc, curr) => {
    const stdId = curr.standardId?._id || curr.standardId;
    if (!acc[stdId]) acc[stdId] = [];
    acc[stdId].push(curr);
    return acc;
  }, {});


  return (
    <div className="space-y-12 font-outfit pb-20">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black uppercase tracking-tighter text-white">Standards & Classrooms</h1>
          <p className="text-slate-400 text-sm mt-1">Manage grade levels and their associated sections</p>
        </div>
        <div className="flex gap-4">
          <button onClick={openStdAdd} className="flex items-center gap-2 px-6 py-3.5 bg-brand-surface/40 hover:bg-slate-800 border border-brand-border/40 rounded-md font-black text-xs uppercase tracking-wider transition-all text-slate-300">
            <Layout size={16} /> Manage Standards
          </button>
          <button onClick={() => openAdd()} className="flex items-center gap-2 px-6 py-3.5 bg-brand-primary hover:bg-schooladmin-primary rounded-md font-black text-sm uppercase tracking-wider transition-all shadow-lg shadow-brand-primary/20 text-white">
            <Plus size={18} /> Add Classroom
          </button>
        </div>
      </div>

      {loading && classes.length === 0 && standards.length === 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-10">
          {[...Array(4)].map((_, i) => <div key={i} className="h-48 rounded-md bg-slate-800/20 animate-pulse" />)}
        </div>
      ) : standards.length === 0 ? (
        <div className="py-20 text-center bg-brand-surface/20 border border-brand-border/20 rounded-md flex flex-col items-center gap-4">
          <div className="w-16 h-16 rounded-md bg-slate-800/40 flex items-center justify-center text-slate-500">
            <Layout size={32} />
          </div>
          <p className="text-slate-500 italic font-medium">No standards or classrooms configured yet.</p>
          <button onClick={openStdAdd} className="text-brand-primary text-xs font-black uppercase tracking-widest hover:underline">Create your first Standard</button>
        </div>
      ) : (
        <div className="space-y-16">
          {[...standards].sort((a,b) => a.level - b.level).map((std) => {
            const sections = [...(sectionsByStandard[std._id] || [])].sort((a,b) => a.sectionLabel.localeCompare(b.sectionLabel));

            return (
              <div key={std._id} className="space-y-8">
                <div className="flex items-center gap-6">
                  <div className="h-px flex-1 bg-gradient-to-r from-transparent to-slate-800" />
                  <div className="flex items-center gap-4">
                    <div className="flex flex-col items-end">
                      <h2 className="text-xl font-black text-white uppercase tracking-[0.3em]">Grade {std.level}</h2>
                      {std.name && <p className="text-[10px] text-brand-primary font-black uppercase tracking-widest">{std.name}</p>}
                    </div>
                    <div className="flex gap-2">
                       <button onClick={() => openStdEdit(std)} className="w-8 h-8 rounded-md bg-slate-800/40 text-slate-500 flex items-center justify-center hover:text-white transition-all">
                         <Pencil size={12} />
                       </button>
                       <button 
                        onClick={() => openAdd(std._id)}
                        className="w-8 h-8 rounded-md bg-brand-primary/10 text-brand-primary flex items-center justify-center hover:bg-brand-primary hover:text-white transition-all transform hover:scale-110"
                      >
                        <Plus size={14} />
                      </button>
                    </div>
                  </div>
                  <div className="h-px flex-1 bg-gradient-to-l from-transparent to-slate-800" />
                </div>
                
                {sections.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 px-4">
                    {sections.map((c, i) => (
                      <motion.div 
                        key={c._id} 
                        initial={{ opacity: 0, scale: 0.95 }} 
                        animate={{ opacity: 1, scale: 1 }} 
                        transition={{ delay: i * 0.05 }}
                        className="bg-brand-surface/40 backdrop-blur-xl border border-brand-border/30 rounded-md p-6 hover:border-brand-primary/40 transition-all group relative overflow-hidden"
                      >
                        <div className="absolute top-0 right-0 w-24 h-24 bg-brand-primary/5 blur-[40px] rounded-md -mr-8 -mt-8" />
                        
                        <div className="flex items-start justify-between relative z-10">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-md bg-brand-primary/10 flex items-center justify-center text-brand-primary text-lg font-black italic">
                              {c.sectionLabel}
                            </div>
                            <div>
                              <p className="text-sm font-black text-white uppercase tracking-wider">Section {c.sectionLabel}</p>
                              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-0.5">Grade {std.level}</p>
                            </div>
                          </div>
                          <div className="flex gap-1 opacity-100 lg:opacity-0 group-hover:opacity-100 transition-opacity">
                            <button onClick={() => openEdit(c)} className="p-2 text-slate-500 hover:text-brand-primary"><Pencil size={12} /></button>
                            <button onClick={() => dispatch(deleteClass(c._id))} className="p-2 text-slate-500 hover:text-red-400"><Trash2 size={12} /></button>
                          </div>
                        </div>

                        <div className="mt-6 pt-5 border-t border-slate-800/40 relative z-10">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-md bg-slate-800 flex items-center justify-center text-[10px] font-black text-brand-primary border border-slate-700/50">
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

                        {c.subjectAssignments?.length > 0 && (
                          <div className="mt-5 flex flex-wrap gap-1.5 relative z-10">
                            {c.subjectAssignments.slice(0, 3).map((a, idx) => {
                              const sId = a.subject?._id || a.subject;
                              const subDetail = subjects.find(s => s._id === sId) || a.subject;
                              if (!subDetail || (!subDetail.name && typeof subDetail !== 'string')) return null;
                              return (
                                <span key={sId || idx} className="px-2 py-0.5 bg-slate-900 border border-slate-800 rounded-md text-[8px] font-bold text-slate-400 uppercase">
                                  {subDetail.name || 'Subject'}
                                </span>
                              );
                            })}
                            {c.subjectAssignments.length > 3 && <span className="text-[8px] text-slate-600 font-black">+{c.subjectAssignments.length - 3} MORE</span>}
                          </div>
                        )}
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  <div className="px-4">
                    <button 
                      onClick={() => openAdd(std._id)}
                      className="w-full py-8 border-2 border-dashed border-slate-800/40 rounded-md flex flex-col items-center justify-center gap-2 group hover:border-brand-primary/30 transition-all text-slate-600 hover:text-brand-primary"
                    >
                      <Plus size={24} className="opacity-40 group-hover:opacity-100" />
                      <p className="text-[10px] font-black uppercase tracking-[0.2em]">Add first section for Grade {std.level}</p>
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      <Modal open={modal} onClose={() => setModal(false)} title={editing ? 'Edit Classroom' : 'Add New Classroom'}>
        <form onSubmit={formik.handleSubmit} className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 font-outfit">Select Standard</label>
              <select
                name="standardId"
                value={formik.values.standardId}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                className={`mt-1.5 w-full bg-slate-800/40 border ${formik.touched.standardId && formik.errors.standardId ? 'border-red-500' : 'border-brand-border/40'} focus:border-brand-primary rounded-md py-2.5 px-4 text-white outline-none text-sm transition-all`}
              >
                <option value="" className="bg-slate-900 text-slate-500">Choose Grade</option>
                {[...standards].sort((a,b) => a.level - b.level).map(s => (
                  <option key={s._id} value={s._id} className="bg-slate-900">Grade {s.level} {s.name ? `- ${s.name}` : ''}</option>
                ))}
              </select>
              <div className="mt-1 flex justify-between items-center">
                {formik.touched.standardId && formik.errors.standardId ? (
                   <p className="text-[10px] text-red-500 font-bold italic">{formik.errors.standardId}</p>
                ) : <div/>}
                <button type="button" onClick={openStdAdd} className="text-[9px] text-brand-primary font-black uppercase tracking-widest hover:underline">+ New Standard</button>
              </div>
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
                  className={`mt-1.5 w-full bg-slate-800/40 border ${formik.touched.sectionLabel && formik.errors.sectionLabel ? 'border-red-500' : 'border-brand-border/40'} focus:border-brand-primary rounded-md py-2.5 px-4 text-white outline-none text-sm transition-all`} 
                />
                <div className="flex gap-2">
                  {['A', 'B', 'C', 'D','E'].map(label => (
                    <button 
                      key={label}
                      type="button" 
                      onClick={() => formik.setFieldValue('sectionLabel', label)}
                      className={`px-3 py-1 rounded-md text-[10px] font-black transition-all border ${formik.values.sectionLabel === label ? 'bg-brand-primary border-brand-primary text-white' : 'bg-slate-800 border-slate-700 text-slate-400 hover:border-slate-500'}`}
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
              className="mt-1.5 w-full bg-slate-800/40 border border-brand-border/40 focus:border-brand-primary rounded-md py-2.5 px-4 text-white outline-none text-sm transition-all"
            >
              <option value="" className="bg-slate-900">Select Class Teacher</option>
              {teachers.map(t => (
                <option key={t._id} value={t._id} className="bg-slate-900">
                  {t.firstName} {t.lastName} ({t.employeeId})
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-4 pt-2 border-t border-slate-800/40">
            <div className="flex items-center justify-between">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 font-outfit">Assigned Subject Teachers</label>
              <p className="text-[9px] text-slate-500 font-bold uppercase tracking-widest italic opacity-70">Subjects are inherited from Standard</p>
            </div>
            
            <div className="space-y-3 max-h-72 overflow-y-auto pr-2 scrollbar-hide">
              {formik.values.subjectAssignments.map((row, index) => {
                const subObj = subjects.find(s => s._id === (row.subject?._id || row.subject));
                if (!subObj) return null;

                return (
                  <div key={index} className="flex gap-2 items-start bg-slate-800/20 p-3 rounded-md border border-slate-700/50 relative">
                    <div className="flex-1 space-y-2">
                      <div className="px-3 py-2 bg-slate-900/50 rounded-md border border-slate-700/30">
                        <p className="text-xs font-black text-white uppercase tracking-tight">{subObj.name}</p>
                        <p className="text-[9px] text-slate-500 font-black uppercase tracking-widest">{subObj.code}</p>
                      </div>

                      <div className="space-y-2">
                        <select
                          value=""
                          onChange={(e) => {
                            if (e.target.value) toggleTeacherInRow(index, e.target.value);
                          }}
                          className="w-full bg-slate-900/30 border border-slate-700/30 rounded-md py-2 px-3 text-xs font-bold text-slate-500 outline-none focus:border-brand-primary transition-all"
                        >
                          <option value="">+ Assign Teacher</option>
                          {teachers.map(t => (
                            <option key={t._id} value={t._id} disabled={row.teachers.includes(t._id)}>
                              {t.firstName} {t.lastName}
                            </option>
                          ))}
                        </select>

                        {row.teachers.length > 0 && (
                          <div className="flex flex-wrap gap-1.5 p-1">
                            {row.teachers.map(tId => {
                              const t = teachers.find(teacher => teacher._id === tId);
                              if (!t) return null;
                              return (
                                <div key={tId} className="flex items-center gap-1.5 pl-2 pr-1 py-1 bg-brand-primary/10 border border-brand-primary/30 rounded-md text-[9px] font-black text-brand-primary uppercase">
                                  <span>{t.firstName}</span>
                                  <button type="button" onClick={() => toggleTeacherInRow(index, tId)} className="p-0.5 hover:bg-brand-primary hover:text-white rounded-md transition-all">
                                    <Trash2 size={8} />
                                  </button>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
              {!formik.values.standardId && (
                <div className="py-8 text-center border-2 border-dashed border-slate-800/40 rounded-md opacity-50">
                  <p className="text-[10px] text-slate-600 font-black uppercase tracking-widest">Select a Standard to assign teachers</p>
                </div>
              )}
              {formik.values.standardId && formik.values.subjectAssignments.length === 0 && (
                <p className="text-center text-slate-600 text-[10px] font-black uppercase tracking-widest py-4">No subjects defined for this standard. Edit the Standard first.</p>
              )}
            </div>
          </div>

          <button type="submit" disabled={loading}
            className="w-full py-3 bg-brand-primary hover:bg-schooladmin-primary rounded-md font-black text-sm uppercase tracking-wider transition-all font-outfit mt-2 text-white shadow-xl shadow-brand-primary/20">
            {loading ? 'Processing...' : editing ? 'Update Classroom' : 'Create Classroom'}
          </button>
        </form>
      </Modal>

      {/* Standard Management Modal */}
      <Modal open={stdModal} onClose={() => setStdModal(false)} title={editingStd ? 'Edit Standard' : 'Create New Standard'}>
        <form onSubmit={stdFormik.handleSubmit} className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 font-outfit">Grade Level</label>
              <input 
                name="level"
                type="number"
                min={1} max={12}
                value={stdFormik.values.level} 
                onChange={stdFormik.handleChange}
                className="mt-1.5 w-full bg-slate-800/40 border border-brand-border/40 focus:border-brand-primary rounded-md py-2.5 px-4 text-white outline-none text-sm transition-all" 
                placeholder="e.g. 10"
              />
            </div>
            <div>
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 font-outfit">Display Name (Optional)</label>
              <input 
                name="name"
                value={stdFormik.values.name} 
                onChange={stdFormik.handleChange}
                className="mt-1.5 w-full bg-slate-800/40 border border-brand-border/40 focus:border-brand-primary rounded-md py-2.5 px-4 text-white outline-none text-sm transition-all" 
                placeholder="e.g. Tenth Grade"
              />
            </div>
          </div>

          <div>
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 font-outfit mb-3 block">Subjects for this Standard</label>
            <div className="grid grid-cols-2 gap-2 max-h-60 overflow-y-auto pr-1">
              {subjects.map(s => {
                const isSelected = stdFormik.values.subjects.includes(s._id);
                return (
                  <button
                    key={s._id}
                    type="button"
                    onClick={() => {
                      const cur = [...stdFormik.values.subjects];
                      const idx = cur.indexOf(s._id);
                      if (idx > -1) cur.splice(idx, 1);
                      else cur.push(s._id);
                      stdFormik.setFieldValue('subjects', cur);
                    }}
                    className={`flex items-center gap-2 p-3 rounded-md border text-[10px] font-bold transition-all ${isSelected ? 'bg-brand-primary/10 border-brand-primary text-white' : 'bg-slate-800/20 border-slate-700/50 text-slate-500 hover:border-slate-600'}`}
                  >
                    <BookOpen size={12} className={isSelected ? 'text-brand-primary' : 'text-slate-600'} />
                    <span className="truncate">{s.name}</span>
                  </button>
                );
              })}
            </div>
            {stdFormik.errors.subjects && stdFormik.touched.subjects && (
              <p className="text-[10px] text-red-500 mt-2 font-bold italic">{stdFormik.errors.subjects}</p>
            )}
          </div>

          <div className="flex gap-3">
            {editingStd && (
               <button type="button" onClick={() => dispatch(deleteStandard(editingStd)) && setStdModal(false)} className="px-6 py-3 bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white rounded-md font-black text-sm transition-all">
                 <Trash2 size={18} />
               </button>
            )}
            <button type="submit" disabled={loading} className="flex-1 py-3 bg-brand-primary hover:bg-schooladmin-primary rounded-md font-black text-sm uppercase tracking-wider text-white shadow-xl shadow-brand-primary/20 transition-all">
              {loading ? 'Saving...' : editingStd ? 'Update Standard' : 'Create Standard'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Classes;


