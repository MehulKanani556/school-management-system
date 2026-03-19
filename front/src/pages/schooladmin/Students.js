import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchStudents, createStudent, updateStudent, deleteStudent } from '../../redux/slice/schoolAdmin.slice';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { motion } from 'framer-motion';
import { Plus, Pencil, Trash2, Search } from 'lucide-react';
import Modal from '../../components/Modal';

const emptyValues = {
  firstName: '', lastName: '', admissionNumber: '',
  gender: 'male', dateOfBirth: '',
  guardianName: '', guardianContact: '', address: '',
};

const validationSchema = Yup.object({
  firstName:       Yup.string().min(2, 'Min 2 characters').required('First name is required'),
  lastName:        Yup.string().min(2, 'Min 2 characters').required('Last name is required'),
  admissionNumber: Yup.string().required('Admission number is required'),
  gender:          Yup.string().oneOf(['male', 'female', 'other']).required(),
  dateOfBirth:     Yup.date().nullable().max(new Date(), 'Date of birth cannot be in the future'),
  guardianName:    Yup.string(),
  guardianContact: Yup.string().matches(/^[0-9+\-\s()]{7,15}$/, 'Invalid contact number').nullable(),
  address:         Yup.string(),
});

const ic = (touched, error) =>
  `mt-1.5 w-full bg-slate-800 border ${touched && error ? 'border-red-500/60' : 'border-slate-700'} focus:border-brand-primary rounded-xl py-3 px-4 text-white placeholder-slate-500 outline-none text-sm transition-all`;

const Err = ({ touched, error }) =>
  touched && error ? <p className="mt-1 text-[10px] text-red-400 font-bold tracking-wide">{error}</p> : null;

const Students = () => {
  const dispatch = useDispatch();
  const { students, loading } = useSelector((s) => s.schoolAdmin);
  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [search, setSearch] = useState('');
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [formValues, setFormValues] = useState(emptyValues);

  useEffect(() => { dispatch(fetchStudents()); }, [dispatch]);

  const formik = useFormik({
    initialValues: formValues,
    validationSchema,
    enableReinitialize: true,
    onSubmit: async (values, { resetForm }) => {
      const data = { ...values, dateOfBirth: values.dateOfBirth || undefined };
      const action = editing
        ? dispatch(updateStudent({ id: editing, data }))
        : dispatch(createStudent(data));
      const result = await action;
      if (!result.error) { setModal(false); resetForm(); }
    },
  });

  const openAdd = () => {
    setEditing(null);
    setFormValues(emptyValues);
    setModal(true);
  };

  const openEdit = (s) => {
    setEditing(s._id);
    setFormValues({
      firstName:       s.firstName || '',
      lastName:        s.lastName || '',
      admissionNumber: s.admissionNumber || '',
      gender:          s.gender || 'male',
      dateOfBirth:     s.dateOfBirth ? s.dateOfBirth.split('T')[0] : '',
      guardianName:    s.guardianName || '',
      guardianContact: s.guardianContact || '',
      address:         s.address || '',
    });
    setModal(true);
  };

  const handleClose = () => { setModal(false); setFormValues(emptyValues); };

  const filtered = students.filter(s =>
    `${s.firstName} ${s.lastName} ${s.admissionNumber}`.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black uppercase tracking-tighter font-outfit">Students</h1>
          <p className="text-slate-400 text-sm mt-1">{students.length} total students</p>
        </div>
        <button onClick={openAdd} className="flex items-center gap-2 px-5 py-3 bg-brand-primary hover:bg-blue-500 rounded-2xl font-black text-sm uppercase tracking-wider transition-all font-outfit">
          <Plus size={18} /> Add Student
        </button>
      </div>

      <div className="relative">
        <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search students..."
          className="w-full bg-brand-surface/40 border border-brand-border/40 rounded-2xl py-3 pl-11 pr-5 text-white placeholder-slate-600 outline-none focus:border-brand-primary transition-all" />
      </div>

      <div className="bg-brand-surface/40 backdrop-blur-xl border border-brand-border/40 rounded-[2rem] overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-brand-border/30">
              {['Name', 'Admission No.', 'Gender', 'Guardian', 'Class', 'Actions'].map(h => (
                <th key={h} className="px-6 py-4 text-left text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 font-outfit">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading && filtered.length === 0 ? (
              <tr><td colSpan={6} className="px-6 py-12 text-center text-slate-500">Loading...</td></tr>
            ) : filtered.length === 0 ? (
              <tr><td colSpan={6} className="px-6 py-12 text-center text-slate-500 italic">No students found</td></tr>
            ) : filtered.map((s, i) => (
              <motion.tr key={s._id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.03 }}
                className="border-b border-brand-border/20 hover:bg-slate-800/20 transition-colors">
                <td className="px-6 py-4 font-semibold">{s.firstName} {s.lastName}</td>
                <td className="px-6 py-4 text-slate-400 text-sm">{s.admissionNumber}</td>
                <td className="px-6 py-4 text-slate-400 text-sm capitalize">{s.gender}</td>
                <td className="px-6 py-4 text-slate-400 text-sm">{s.guardianName || '—'}</td>
                <td className="px-6 py-4 text-slate-400 text-sm">
                  {s.classSection ? `Grade ${s.classSection.gradeLevel}-${s.classSection.sectionLabel}` : '—'}
                </td>
                <td className="px-6 py-4">
                  <div className="flex gap-2">
                    <button onClick={() => openEdit(s)} className="p-2 rounded-xl hover:bg-brand-primary/20 text-slate-500 hover:text-brand-primary transition-all" title="Edit"><Pencil size={15} /></button>
                    <button onClick={() => setDeleteTarget(s)} className="p-2 rounded-xl hover:bg-red-500/10 text-slate-500 hover:text-red-400 transition-all" title="Delete"><Trash2 size={15} /></button>
                  </div>
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Add / Edit Modal */}
      <Modal open={modal} onClose={handleClose} title={editing ? 'Edit Student' : 'Add Student'}>
        <form onSubmit={formik.handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 font-outfit">First Name</label>
              <input {...formik.getFieldProps('firstName')} placeholder="e.g. John" className={ic(formik.touched.firstName, formik.errors.firstName)} />
              <Err touched={formik.touched.firstName} error={formik.errors.firstName} />
            </div>
            <div>
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 font-outfit">Last Name</label>
              <input {...formik.getFieldProps('lastName')} placeholder="e.g. Doe" className={ic(formik.touched.lastName, formik.errors.lastName)} />
              <Err touched={formik.touched.lastName} error={formik.errors.lastName} />
            </div>
          </div>

          <div>
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 font-outfit">Admission Number</label>
            <input {...formik.getFieldProps('admissionNumber')} placeholder="e.g. ADM-2024-001" className={ic(formik.touched.admissionNumber, formik.errors.admissionNumber)} />
            <Err touched={formik.touched.admissionNumber} error={formik.errors.admissionNumber} />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 font-outfit">Gender</label>
              <select {...formik.getFieldProps('gender')} className={ic(formik.touched.gender, formik.errors.gender)}>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div>
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 font-outfit">Date of Birth</label>
              <input type="date" {...formik.getFieldProps('dateOfBirth')} className={ic(formik.touched.dateOfBirth, formik.errors.dateOfBirth)} />
              <Err touched={formik.touched.dateOfBirth} error={formik.errors.dateOfBirth} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 font-outfit">Guardian Name</label>
              <input {...formik.getFieldProps('guardianName')} placeholder="e.g. Robert Doe" className={ic(formik.touched.guardianName, formik.errors.guardianName)} />
              <Err touched={formik.touched.guardianName} error={formik.errors.guardianName} />
            </div>
            <div>
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 font-outfit">Guardian Contact</label>
              <input {...formik.getFieldProps('guardianContact')} placeholder="e.g. +91 9876543210" className={ic(formik.touched.guardianContact, formik.errors.guardianContact)} />
              <Err touched={formik.touched.guardianContact} error={formik.errors.guardianContact} />
            </div>
          </div>

          <div>
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 font-outfit">Address</label>
            <input {...formik.getFieldProps('address')} placeholder="e.g. 123 Main St, City" className={ic(formik.touched.address, formik.errors.address)} />
            <Err touched={formik.touched.address} error={formik.errors.address} />
          </div>

          <button type="submit" disabled={loading || formik.isSubmitting}
            className="w-full py-3 bg-brand-primary hover:bg-blue-500 disabled:opacity-60 rounded-2xl font-black text-sm uppercase tracking-wider transition-all font-outfit mt-2">
            {loading ? 'Saving...' : editing ? 'Update Student' : 'Add Student'}
          </button>
        </form>
      </Modal>

      {/* Delete Confirmation */}
      <Modal open={!!deleteTarget} onClose={() => setDeleteTarget(null)} title="Confirm Delete" maxWidth="max-w-sm">
        <div className="space-y-6">
          <div className="flex flex-col items-center text-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center">
              <Trash2 size={24} className="text-red-400" />
            </div>
            <div>
              <p className="text-white font-bold text-base">Delete <span className="text-red-400">{deleteTarget?.firstName} {deleteTarget?.lastName}</span>?</p>
              <p className="text-slate-500 text-sm mt-1">This will permanently remove the student. This cannot be undone.</p>
            </div>
          </div>
          <div className="flex gap-3">
            <button onClick={() => setDeleteTarget(null)}
              className="flex-1 py-3 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-black text-sm uppercase tracking-wider transition-all font-outfit">
              Cancel
            </button>
            <button onClick={() => { dispatch(deleteStudent(deleteTarget._id)); setDeleteTarget(null); }} disabled={loading}
              className="flex-1 py-3 rounded-2xl bg-red-500 hover:bg-red-600 disabled:opacity-60 text-white font-black text-sm uppercase tracking-wider transition-all font-outfit">
              {loading ? 'Deleting...' : 'Yes, Delete'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default Students;
