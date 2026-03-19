import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchTeachers, createTeacher, updateTeacher, deleteTeacher, toggleTeacherStatus } from '../../redux/slice/schoolAdmin.slice';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { motion } from 'framer-motion';
import { Plus, Pencil, Trash2, Search, ToggleLeft, ToggleRight } from 'lucide-react';
import Modal from '../../components/Modal';

const validationSchema = Yup.object({
  firstName:      Yup.string().required('First name is required'),
  lastName:       Yup.string().required('Last name is required'),
  email:          Yup.string().email('Invalid email').required('Email is required'),
  phone:          Yup.string()
                    .matches(/^[0-9+\-\s()]{7,15}$/, 'Invalid phone number')
                    .required('Phone is required'),
  qualifications: Yup.string(),
  joiningDate:    Yup.date().nullable(),
});

const inputClass = (touched, error) =>
  `mt-1.5 w-full bg-slate-800 border ${touched && error ? 'border-red-500/60' : 'border-slate-700'} focus:border-brand-primary rounded-xl py-3 px-4 text-white placeholder-slate-500 outline-none text-sm transition-all`;

const FieldError = ({ touched, error }) =>
  touched && error ? <p className="mt-1 text-[10px] text-red-400 font-bold tracking-wide">{error}</p> : null;

const emptyValues = { firstName: '', lastName: '', email: '', phone: '', qualifications: '', joiningDate: '' };

const Teachers = () => {
  const dispatch = useDispatch();
  const { teachers, loading } = useSelector((s) => s.schoolAdmin);
  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [search, setSearch] = useState('');
  const [serverError, setServerError] = useState('');
  const [formValues, setFormValues] = useState(emptyValues);
  const [deleteTarget, setDeleteTarget] = useState(null); // { _id, firstName, lastName }

  useEffect(() => { dispatch(fetchTeachers()); }, [dispatch]);

  const formik = useFormik({
    initialValues: formValues,
    validationSchema,
    enableReinitialize: true,
    onSubmit: async (values, { resetForm }) => {
      const data = {
        ...values,
        qualifications: values.qualifications.split(',').map(q => q.trim()).filter(Boolean),
        joiningDate: values.joiningDate || undefined,
      };
      setServerError('');
      const action = editing
        ? dispatch(updateTeacher({ id: editing, data }))
        : dispatch(createTeacher(data));
      const result = await action;
      if (result.error) {
        const payload = result.payload;
        if (payload?.errors) {
          formik.setErrors(payload.errors);
        } else {
          setServerError(payload?.message || 'Something went wrong');
        }
        return;
      }
      setModal(false);
      resetForm();
    },
  });

  const openAdd = () => {
    setEditing(null);
    setServerError('');
    setFormValues(emptyValues);
    setModal(true);
  };

  const openEdit = (t) => {
    setEditing(t._id);
    setServerError('');
    setFormValues({
      firstName:      t.firstName || '',
      lastName:       t.lastName || '',
      email:          t.email || '',
      phone:          t.phone || '',
      qualifications: t.qualifications?.join(', ') || '',
      joiningDate:    t.joiningDate ? t.joiningDate.split('T')[0] : '',
    });
    setModal(true);
  };

  const handleClose = () => { setModal(false); setServerError(''); setFormValues(emptyValues); };

  const filtered = teachers.filter(t =>
    `${t.firstName} ${t.lastName} ${t.employeeId}`.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black uppercase tracking-tighter font-outfit">Teachers</h1>
          <p className="text-slate-400 text-sm mt-1">{teachers.length} total teachers</p>
        </div>
        <button onClick={openAdd} className="flex items-center gap-2 px-5 py-3 bg-brand-primary hover:bg-blue-500 rounded-2xl font-black text-sm uppercase tracking-wider transition-all font-outfit">
          <Plus size={18} /> Add Teacher
        </button>
      </div>

      <div className="relative">
        <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search teachers..."
          className="w-full bg-brand-surface/40 border border-brand-border/40 rounded-2xl py-3 pl-11 pr-5 text-white placeholder-slate-600 outline-none focus:border-brand-primary transition-all" />
      </div>

      <div className="bg-brand-surface/40 backdrop-blur-xl border border-brand-border/40 rounded-[2rem] overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-brand-border/30">
              {['Name', 'Employee ID', 'Email', 'Phone', 'Qualifications', 'Status', 'Actions'].map(h => (
                <th key={h} className="px-6 py-4 text-left text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 font-outfit">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading && filtered.length === 0 ? (
              <tr><td colSpan={7} className="px-6 py-12 text-center text-slate-500">Loading...</td></tr>
            ) : filtered.length === 0 ? (
              <tr><td colSpan={7} className="px-6 py-12 text-center text-slate-500 italic">No teachers found</td></tr>
            ) : filtered.map((t, i) => (
              <motion.tr key={t._id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.03 }}
                className="border-b border-brand-border/20 hover:bg-slate-800/20 transition-colors">
                <td className="px-6 py-4 font-semibold">{t.firstName} {t.lastName}</td>
                <td className="px-6 py-4 text-slate-400 text-sm font-mono">{t.employeeId}</td>
                <td className="px-6 py-4 text-slate-400 text-sm">{t.email || '—'}</td>
                <td className="px-6 py-4 text-slate-400 text-sm">{t.phone || '—'}</td>
                <td className="px-6 py-4 text-slate-400 text-sm">{t.qualifications?.join(', ') || '—'}</td>
                <td className="px-6 py-4">
                  <span className={`px-3 py-1 rounded-xl text-[10px] font-black uppercase tracking-wider ${t.isActive ? 'text-emerald-400 bg-emerald-400/10' : 'text-slate-500 bg-slate-700/40'}`}>
                    {t.isActive ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <div className="flex gap-2">
                    <button onClick={() => openEdit(t)} className="p-2 rounded-xl hover:bg-brand-primary/20 text-slate-500 hover:text-brand-primary transition-all" title="Edit"><Pencil size={15} /></button>
                    <button onClick={() => dispatch(toggleTeacherStatus(t._id))}
                      className={`p-2 rounded-xl transition-all ${t.isActive ? 'hover:bg-amber-500/10 text-slate-500 hover:text-amber-400' : 'hover:bg-emerald-500/10 text-slate-500 hover:text-emerald-400'}`}
                      title={t.isActive ? 'Deactivate' : 'Activate'}>
                      {t.isActive ? <ToggleRight size={17} /> : <ToggleLeft size={17} />}
                    </button>
                    <button onClick={() => setDeleteTarget(t)} className="p-2 rounded-xl hover:bg-red-500/10 text-slate-500 hover:text-red-400 transition-all" title="Delete"><Trash2 size={15} /></button>
                  </div>
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>

      <Modal open={modal} onClose={handleClose} title={editing ? 'Edit Teacher' : 'Add Teacher'}>
        <form onSubmit={formik.handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            {[['firstName', 'First Name', 'e.g. John'], ['lastName', 'Last Name', 'e.g. Doe']].map(([k, l, ph]) => (
              <div key={k}>
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 font-outfit">{l}</label>
                <input {...formik.getFieldProps(k)} placeholder={ph} className={inputClass(formik.touched[k], formik.errors[k])} />
                <FieldError touched={formik.touched[k]} error={formik.errors[k]} />
              </div>
            ))}
          </div>

          <div>
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 font-outfit">Email</label>
            <input type="email" {...formik.getFieldProps('email')} placeholder="e.g. john.doe@school.com" className={inputClass(formik.touched.email, formik.errors.email)} />
            <FieldError touched={formik.touched.email} error={formik.errors.email} />
          </div>

          <div>
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 font-outfit">Phone</label>
            <input type="tel" {...formik.getFieldProps('phone')} placeholder="e.g. +91 9876543210" className={inputClass(formik.touched.phone, formik.errors.phone)} />
            <FieldError touched={formik.touched.phone} error={formik.errors.phone} />
          </div>

          <div>
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 font-outfit">Qualifications <span className="normal-case text-slate-600">(comma separated)</span></label>
            <input {...formik.getFieldProps('qualifications')} placeholder="B.Ed, M.Sc, PhD..." className={inputClass(formik.touched.qualifications, formik.errors.qualifications)} />
            <FieldError touched={formik.touched.qualifications} error={formik.errors.qualifications} />
          </div>

          <div>
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 font-outfit">Joining Date</label>
            <input type="date" {...formik.getFieldProps('joiningDate')} className={inputClass(formik.touched.joiningDate, formik.errors.joiningDate)} />
            <FieldError touched={formik.touched.joiningDate} error={formik.errors.joiningDate} />
          </div>

          {serverError && (
            <div className="px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm font-semibold">
              {serverError}
            </div>
          )}

          <button type="submit" disabled={loading || formik.isSubmitting}
            className="w-full py-3 bg-brand-primary hover:bg-blue-500 disabled:opacity-60 rounded-2xl font-black text-sm uppercase tracking-wider transition-all font-outfit mt-2">
            {loading ? 'Saving...' : editing ? 'Update Teacher' : 'Add Teacher'}
          </button>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal open={!!deleteTarget} onClose={() => setDeleteTarget(null)} title="Confirm Delete" maxWidth="max-w-sm">
        <div className="space-y-6">
          <div className="flex flex-col items-center text-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center">
              <Trash2 size={24} className="text-red-400" />
            </div>
            <div>
              <p className="text-white font-bold text-base">Delete <span className="text-red-400">{deleteTarget?.firstName} {deleteTarget?.lastName}</span>?</p>
              <p className="text-slate-500 text-sm mt-1">This will permanently remove the teacher and their account. This cannot be undone.</p>
            </div>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => setDeleteTarget(null)}
              className="flex-1 py-3 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-black text-sm uppercase tracking-wider transition-all font-outfit"
            >
              Cancel
            </button>
            <button
              onClick={() => { dispatch(deleteTeacher(deleteTarget._id)); setDeleteTarget(null); }}
              disabled={loading}
              className="flex-1 py-3 rounded-2xl bg-red-500 hover:bg-red-600 disabled:opacity-60 text-white font-black text-sm uppercase tracking-wider transition-all font-outfit"
            >
              {loading ? 'Deleting...' : 'Yes, Delete'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default Teachers;
