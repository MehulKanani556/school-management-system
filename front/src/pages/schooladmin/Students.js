import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { fetchStudents, createStudent, updateStudent, deleteStudent, fetchClasses, fetchStandards, exportStudents, importStudents, promoteStudents, downloadReportCard } from '../../redux/slice/schoolAdmin.slice';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Pencil, Trash2, Search, Upload, X, Download, ArrowUpCircle, FileText, ChevronRight, LayoutGrid, List, Users, GraduationCap, School, ArrowLeft, Eye } from 'lucide-react';
import Modal from '../../components/Modal';
import Pagination from '../../components/Pagination';

const emptyValues = {
  firstName: '', lastName: '', admissionNumber: '',
  gender: 'male', dateOfBirth: '',
  guardianName: '', guardianEmail: '', guardianContact: '', address: '',
  photo: null, standard: '', classSection: '',
};

const validationSchema = Yup.object({
  firstName: Yup.string().min(2, 'Min 2 characters').required('First name is required'),
  lastName: Yup.string().min(2, 'Min 2 characters').required('Last name is required'),
  admissionNumber: Yup.string(),
  gender: Yup.string().oneOf(['male', 'female', 'other']).required(),
  dateOfBirth: Yup.date().nullable().max(new Date(), 'Date of birth cannot be in the future'),
  guardianName: Yup.string(),
  guardianEmail: Yup.string().email('Invalid email format').required('Guardian email is required'),
  guardianContact: Yup.string().matches(/^[0-9+\-\s()]{7,15}$/, 'Invalid contact number').nullable(),
  address: Yup.string(),
  photo: Yup.mixed().nullable(),
  standard: Yup.string().required('Standard is required'),
  classSection: Yup.string().required('Section is required'),
});

const ic = (touched, error) =>
  `mt-1.5 w-full bg-slate-800 border ${touched && error ? 'border-red-500/60' : 'border-slate-700'} focus:border-brand-primary rounded-md py-3 px-4 text-white placeholder-slate-500 outline-none text-sm transition-all`;

const Err = ({ touched, error }) =>
  touched && error ? <p className="mt-1 text-[10px] text-red-400 font-bold tracking-wide">{error}</p> : null;

const Students = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const handleImport = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const formData = new FormData();
    formData.append('file', file);
    await dispatch(importStudents(formData));
    dispatch(fetchStudents());
  };

  const handleExport = () => {
    dispatch(exportStudents());
  };
  const { students, classes, standards, loading } = useSelector((s) => s.schoolAdmin);
  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [search, setSearch] = useState('');
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [formValues, setFormValues] = useState(emptyValues);
  const [viewMode, setViewMode] = useState('standards'); // 'standards', 'sections', 'students'
  const [selectedStandard, setSelectedStandard] = useState(null);
  const [selectedSection, setSelectedSection] = useState(null);

  const [promoteModal, setPromoteModal] = useState(false);
  const promoteFormik = useFormik({
    initialValues: {
      fromStandardId: '', fromClassSectionId: '',
      toStandardId: '', toClassSectionId: ''
    },
    validationSchema: Yup.object({
      fromStandardId: Yup.string().required('Source standard is required'),
      toStandardId: Yup.string()
        .required('Target standard is required')
        .notOneOf([Yup.ref('fromStandardId')], 'Cannot promote to the same grade'),
    }),
    onSubmit: async (values) => {
      await dispatch(promoteStudents(values));
      dispatch(fetchStudents());
      setPromoteModal(false);
      promoteFormik.resetForm();
    }
  });
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    dispatch(fetchStudents());
    dispatch(fetchClasses());
    dispatch(fetchStandards());
  }, [dispatch]);

  const formik = useFormik({
    initialValues: formValues,
    validationSchema,
    enableReinitialize: true,
    onSubmit: async (values, { resetForm }) => {
      const formData = new FormData();
      Object.keys(values).forEach(key => {
        if (key === 'photo') {
          if (values[key] instanceof File) formData.append('photo', values[key]);
        } else if (values[key] !== undefined && values[key] !== null) {
          formData.append(key, values[key]);
        }
      });
      if (values.dateOfBirth) formData.set('dateOfBirth', values.dateOfBirth);
      if (!values.admissionNumber) formData.delete('admissionNumber');

      const action = editing
        ? dispatch(updateStudent({ id: editing, data: formData }))
        : dispatch(createStudent(formData));
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
      firstName: s.firstName || '',
      lastName: s.lastName || '',
      admissionNumber: s.admissionNumber || '',
      gender: s.gender || 'male',
      dateOfBirth: s.dateOfBirth ? s.dateOfBirth.split('T')[0] : '',
      guardianName: s.guardianName || '',
      guardianEmail: s.guardianEmail || '',
      guardianContact: s.guardianContact || '',
      address: s.address || '',
      photo: s.photo || '',
      standard: s.standard?._id || s.standard || '',
      classSection: s.classSection?._id || s.classSection || '',
    });
    setModal(true);
  };

  const handleClose = () => { setModal(false); setFormValues(emptyValues); };

  const filtered = students.filter(s => {
    // Apply search filter
    const searchString = `${s.firstName} ${s.lastName} ${s.admissionNumber} Grade ${s.standard?.level} ${s.classSection?.sectionLabel}`.toLowerCase();
    const matchesSearch = searchString.includes(search.toLowerCase());

    // Apply drill-down filters
    if (viewMode === 'students' && selectedSection) {
      return matchesSearch && (s.classSection?._id || s.classSection) === selectedSection._id;
    }
    return matchesSearch;
  });

  const totalPages = Math.ceil(filtered.length / itemsPerPage);
  const currentItems = filtered.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  // Helper to count students
  const getStudentCount = (type, id) => {
    if (type === 'standard') {
      return students.filter(s => (s.standard?._id || s.standard) === id).length;
    }
    if (type === 'section') {
      return students.filter(s => (s.classSection?._id || s.classSection) === id).length;
    }
    return 0;
  };

  const resetSelection = () => {
    setViewMode('standards');
    setSelectedStandard(null);
    setSelectedSection(null);
  };

  const handleStandardClick = (std) => {
    setSelectedStandard(std);
    setViewMode('sections');
  };

  const handleSectionClick = (sec) => {
    setSelectedSection(sec);
    setViewMode('students');
  };

  // Reset page when search changes
  useEffect(() => { setCurrentPage(1); }, [search]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          {(viewMode !== 'standards' || selectedStandard) && (
            <button
              onClick={() => {
                if (viewMode === 'students') setViewMode('sections');
                else if (viewMode === 'sections') resetSelection();
              }}
              className="p-2.5 bg-slate-800/50 hover:bg-slate-700/50 border border-slate-700/50 rounded-md text-slate-400 hover:text-white transition-all"
            >
              <ArrowLeft size={18} />
            </button>
          )}
          <div>
            <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1">
              <span className={viewMode === 'standards' ? 'text-brand-primary' : 'cursor-pointer hover:text-slate-300'} onClick={resetSelection}>Standards</span>
              {selectedStandard && (
                <>
                  <ChevronRight size={10} />
                  <span className={viewMode === 'sections' ? 'text-brand-primary' : 'cursor-pointer hover:text-slate-300'} onClick={() => setViewMode('sections')}>Grade {selectedStandard.level}</span>
                </>
              )}
              {selectedSection && viewMode === 'students' && (
                <>
                  <ChevronRight size={10} />
                  <span className="text-brand-primary">Section {selectedSection.sectionLabel}</span>
                </>
              )}
            </div>
            <h1 className="text-2xl font-black uppercase tracking-tighter font-outfit">
              {viewMode === 'standards' && 'School Standards'}
              {viewMode === 'sections' && `Grade ${selectedStandard?.level} Classrooms`}
              {viewMode === 'students' && `Students - ${selectedSection?.sectionLabel}`}
            </h1>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={() => setPromoteModal(true)} className="flex items-center gap-2 px-4 py-3 bg-indigo-500/10 hover:bg-indigo-500/20 border border-indigo-500/20 rounded-md font-black text-[10px] uppercase tracking-wider transition-all font-outfit text-indigo-400 hover:text-indigo-300 group">
            <ArrowUpCircle size={14} className="group-hover:-translate-y-0.5 transition-transform" /> Promote Students
          </button>
          <button onClick={handleExport} className="flex items-center gap-2 px-4 py-3 bg-slate-800/50 hover:bg-slate-700/50 border border-slate-700/50 rounded-md font-black text-[10px] uppercase tracking-wider transition-all font-outfit text-slate-400 hover:text-white group">
            <Download size={14} className="group-hover:-translate-y-0.5 transition-transform" /> Export Data
          </button>
          <label className="flex items-center gap-2 px-4 py-3 bg-slate-800/50 hover:bg-slate-700/50 border border-slate-700/50 rounded-md font-black text-[10px] uppercase tracking-wider cursor-pointer transition-all font-outfit text-slate-400 hover:text-white group">
            <Upload size={14} className="group-hover:-translate-y-0.5 transition-transform" /> Import CSV
            <input type="file" accept=".csv" className="hidden" onChange={handleImport} />
          </label>
          <button onClick={openAdd} className="flex items-center gap-2 px-5 py-3 bg-brand-primary hover:bg-blue-500 rounded-md font-black text-sm uppercase tracking-wider transition-all font-outfit shadow-lg shadow-brand-primary/20">
            <Plus size={18} /> Add Student
          </button>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {viewMode === 'standards' && (
          <motion.div
            key="standards"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
          >
            {standards.map((std) => (
              <button
                key={std._id}
                onClick={() => handleStandardClick(std)}
                className="group relative p-6 bg-brand-surface/40 hover:bg-brand-surface/60 border border-brand-border/40 hover:border-brand-primary/40 rounded-md text-left transition-all duration-300 overflow-hidden"
              >
                <div className="absolute -right-4 -bottom-4 opacity-[0.03] group-hover:opacity-[0.08] transition-opacity">
                  <GraduationCap size={120} />
                </div>
                <div className="flex justify-between items-start mb-4">
                  <div className="w-12 h-12 rounded-md bg-brand-primary/10 border border-brand-primary/20 flex items-center justify-center text-brand-primary group-hover:scale-110 transition-transform">
                    <GraduationCap size={24} />
                  </div>
                  <div className="text-[10px] font-black uppercase tracking-widest text-slate-500 bg-slate-800/50 px-2 py-1 rounded">
                    {getStudentCount('standard', std._id)} Students
                  </div>
                </div>
                <h3 className="text-xl font-black font-outfit uppercase tracking-tight text-white group-hover:text-brand-primary transition-colors">
                  Grade {std.level}
                </h3>
                <p className="text-slate-500 text-xs mt-1 font-medium italic">Click to view classrooms</p>
              </button>
            ))}
          </motion.div>
        )}

        {viewMode === 'sections' && (
          <motion.div
            key="sections"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
          >
            {classes
              .filter(c => (c.standardId?._id || c.standardId) === selectedStandard?._id)
              .map((sec) => (
                <button
                  key={sec._id}
                  onClick={() => handleSectionClick(sec)}
                  className="group relative p-6 bg-brand-surface/40 hover:bg-brand-surface/60 border border-brand-border/40 hover:border-brand-primary/40 rounded-md text-left transition-all duration-300 overflow-hidden"
                >
                  <div className="absolute -right-4 -bottom-4 opacity-[0.03] group-hover:opacity-[0.08] transition-opacity">
                    <School size={120} />
                  </div>
                  <div className="flex justify-between items-start mb-4">
                    <div className="w-12 h-12 rounded-md bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 group-hover:scale-110 transition-transform">
                      <School size={24} />
                    </div>
                    <div className="text-[10px] font-black uppercase tracking-widest text-slate-500 bg-slate-800/50 px-2 py-1 rounded">
                      {getStudentCount('section', sec._id)} Students
                    </div>
                  </div>
                  <h3 className="text-xl font-black font-outfit uppercase tracking-tight text-white group-hover:text-indigo-400 transition-colors">
                    Section {sec.sectionLabel}
                  </h3>
                  <p className="text-slate-500 text-xs mt-1 font-medium italic">Explore student list</p>
                </button>
              ))}
          </motion.div>
        )}

        {viewMode === 'students' && (
          <motion.div
            key="students"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-6"
          >
            <div className="relative">
              <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder={`Search in Section ${selectedSection?.sectionLabel}...`}
                className="w-full bg-brand-surface/40 border border-brand-border/40 rounded-md py-3 pl-11 pr-5 text-white placeholder-slate-600 outline-none focus:border-brand-primary transition-all" />
            </div>

            <div className="bg-brand-surface/40 backdrop-blur-xl border border-brand-border/40 rounded-md overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-brand-border/30">
                    {['Student', 'Admission No.', 'Gender', 'Guardian', 'Class', 'DOB', 'Actions'].map(h => (
                      <th key={h} className="px-6 py-4 text-left text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 font-outfit">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {loading && filtered.length === 0 ? (
                    <tr><td colSpan={7} className="px-6 py-12 text-center text-slate-500">Loading...</td></tr>
                  ) : filtered.length === 0 ? (
                    <tr><td colSpan={7} className="px-6 py-12 text-center text-slate-500 italic">No students found</td></tr>
                  ) : currentItems.map((s, i) => (
                    <motion.tr key={s._id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.03 }}
                      className="border-b border-brand-border/20 hover:bg-slate-800/20 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <img src={s.photo || `https://ui-avatars.com/api/?name=${s.firstName}+${s.lastName}&background=random`}
                            className="w-10 h-10 rounded-md object-cover bg-slate-800 border border-slate-700" alt="" />
                          <div className="font-semibold">{s.firstName} {s.lastName}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-slate-400 text-sm">{s.admissionNumber}</td>
                      <td className="px-6 py-4 text-slate-400 text-sm capitalize">{s.gender}</td>
                      <td className="px-6 py-4 text-slate-400 text-sm">{s.guardianName || '—'}</td>
                      <td className="px-6 py-4 text-slate-400 text-sm">
                        {s.standard ? `Grade ${s.standard.level || '—'}-${s.classSection?.sectionLabel || '—'}` : '—'}
                      </td>
                      <td className="px-6 py-4 text-slate-400 text-sm">
                        {s.dateOfBirth ? new Date(s.dateOfBirth).toLocaleDateString('en-GB') : '—'}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex gap-2">
                          <button onClick={() => navigate(`/school-admin/students/${s._id}`)}
                            className="p-2 rounded-md hover:bg-brand-primary/20 text-slate-500 hover:text-brand-primary transition-all" title="View Profile"><Eye size={15} /></button>
                          <button onClick={() => dispatch(downloadReportCard({ id: s._id, name: `${s.firstName}_${s.lastName}` }))}
                            className="p-2 rounded-md hover:bg-slate-700/50 text-indigo-400 hover:text-indigo-300 transition-all" title="Report Card"><FileText size={15} /></button>
                          <button onClick={() => openEdit(s)} className="p-2 rounded-md hover:bg-brand-primary/20 text-slate-500 hover:text-brand-primary transition-all" title="Edit"><Pencil size={15} /></button>
                          <button onClick={() => setDeleteTarget(s)} className="p-2 rounded-md hover:bg-red-500/10 text-slate-500 hover:text-red-400 transition-all" title="Delete"><Trash2 size={15} /></button>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>

            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
              itemsPerPage={itemsPerPage}
              totalItems={filtered.length}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Add / Edit Modal */}
      <Modal open={modal} onClose={handleClose} title={editing ? 'Edit Student' : 'Add Student'}>
        <form onSubmit={formik.handleSubmit} className="space-y-4">
          <div className="py-2">
            <input type="file" id="photo-upload" className="hidden" accept="image/*"
              onChange={(e) => formik.setFieldValue('photo', e.target.files[0])} />

            <label htmlFor="photo-upload" className="relative group cursor-pointer block">
              <div className={`w-full h-42 py-4 rounded-md border-2 border-dashed transition-all flex flex-col items-center justify-center gap-4 overflow-hidden
                ${formik.values.photo ? 'border-brand-primary' : 'border-slate-700 hover:border-brand-primary bg-slate-800/40'}`}>

                {formik.values.photo ? (
                  <div className="relative w-full h-full">
                    <img src={typeof formik.values.photo === 'string' ? formik.values.photo : URL.createObjectURL(formik.values.photo)}
                      className="w-full h-full object-cover" alt="Preview" />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <div className="w-12 h-12 rounded-md bg-brand-primary flex items-center justify-center shadow-xl">
                        <Upload size={24} className="text-white" />
                      </div>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="w-10 h-10 rounded-md bg-slate-800 border border-slate-700 flex items-center justify-center group-hover:scale-110 transition-transform shadow-lg">
                      <Upload className="text-slate-400 group-hover:text-brand-primary transition-colors" size={24} />
                    </div>
                    <div className="text-center">
                      <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 group-hover:text-slate-300 transition-colors">Select Student Photograph</p>
                    </div>
                  </>
                )}
              </div>

              {formik.values.photo && (
                <button type="button" onClick={(e) => { e.preventDefault(); formik.setFieldValue('photo', null); }}
                  className="absolute top-4 right-4 p-2 bg-red-500 hover:bg-red-600 rounded-md shadow-lg transition-all z-10">
                  <X size={16} className="text-white" />
                </button>
              )}
            </label>
            <Err touched={formik.touched.photo} error={formik.errors.photo} />
          </div>
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

          {/* <div>
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 font-outfit">Admission Number</label>
            <input {...formik.getFieldProps('admissionNumber')} placeholder="Auto-generated (e.g. ADM-2024-001)" className={ic(formik.touched.admissionNumber, formik.errors.admissionNumber)} />
            <Err touched={formik.touched.admissionNumber} error={formik.errors.admissionNumber} />
          </div> */}

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
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 font-outfit">Guardian Email (Portal Login)</label>
              <input {...formik.getFieldProps('guardianEmail')} placeholder="e.g. parent@example.com" className={ic(formik.touched.guardianEmail, formik.errors.guardianEmail)} />
              <Err touched={formik.touched.guardianEmail} error={formik.errors.guardianEmail} />
            </div>
          </div>

          <div>
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 font-outfit">Guardian Contact</label>
            <input {...formik.getFieldProps('guardianContact')} placeholder="e.g. +91 9876543210" className={ic(formik.touched.guardianContact, formik.errors.guardianContact)} />
            <Err touched={formik.touched.guardianContact} error={formik.errors.guardianContact} />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 font-outfit">Standard</label>
              <select {...formik.getFieldProps('standard')}
                className={ic(formik.touched.standard, formik.errors.standard)}
                onChange={(e) => {
                  formik.setFieldValue('standard', e.target.value);
                  formik.setFieldValue('classSection', '');
                }}
              >
                <option value="">Select Standard</option>
                {standards.map(std => (
                  <option key={std._id} value={std._id}>Grade {std.level}</option>
                ))}
              </select>
              <Err touched={formik.touched.standard} error={formik.errors.standard} />
            </div>
            <div>
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 font-outfit">Class Section</label>
              <select {...formik.getFieldProps('classSection')} className={ic(formik.touched.classSection, formik.errors.classSection)}>
                <option value="">Select Section</option>
                {classes
                  .filter(c => (c.standardId?._id || c.standardId) === formik.values.standard)
                  .map(c => (
                    <option key={c._id} value={c._id}>{c.sectionLabel}</option>
                  ))
                }
              </select>
              <Err touched={formik.touched.classSection} error={formik.errors.classSection} />
            </div>
          </div>

          <div>
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 font-outfit">Address</label>
            <input {...formik.getFieldProps('address')} placeholder="e.g. 123 Main St, City" className={ic(formik.touched.address, formik.errors.address)} />
            <Err touched={formik.touched.address} error={formik.errors.address} />
          </div>

          <button type="submit" disabled={loading || formik.isSubmitting}
            className="w-full py-3 bg-brand-primary hover:bg-blue-500 disabled:opacity-60 rounded-md font-black text-sm uppercase tracking-wider transition-all font-outfit mt-2">
            {loading ? 'Saving...' : editing ? 'Update Student' : 'Add Student'}
          </button>
        </form>
      </Modal>

      {/* Delete Confirmation */}
      <Modal open={!!deleteTarget} onClose={() => setDeleteTarget(null)} title="Confirm Delete" maxWidth="max-w-sm">
        <div className="space-y-6">
          <div className="flex flex-col items-center text-center gap-4">
            <div className="w-14 h-14 rounded-md bg-red-500/10 border border-red-500/20 flex items-center justify-center">
              <Trash2 size={24} className="text-red-400" />
            </div>
            <div>
              <p className="text-white font-bold text-base">Delete <span className="text-red-400">{deleteTarget?.firstName} {deleteTarget?.lastName}</span>?</p>
              <p className="text-slate-500 text-sm mt-1">This will permanently remove the student. This cannot be undone.</p>
            </div>
          </div>
          <div className="flex gap-3">
            <button onClick={() => setDeleteTarget(null)}
              className="flex-1 py-3 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-300 font-black text-sm uppercase tracking-wider transition-all font-outfit">
              Cancel
            </button>
            <button onClick={() => { dispatch(deleteStudent(deleteTarget._id)); setDeleteTarget(null); }} disabled={loading}
              className="flex-1 py-3 rounded-md bg-red-500 hover:bg-red-600 disabled:opacity-60 text-white font-black text-sm uppercase tracking-wider transition-all font-outfit">
              {loading ? 'Deleting...' : 'Yes, Delete'}
            </button>
          </div>
        </div>
      </Modal>

      {/* Promotion Modal */}
      <Modal open={promoteModal} onClose={() => setPromoteModal(false)} title="Promote Students">
        <form onSubmit={promoteFormik.handleSubmit} className="space-y-6">
          <div className="p-4 bg-indigo-500/5 border border-indigo-500/10 rounded-md">
            <p className="text-xs text-indigo-300 leading-relaxed font-medium">
              This cycle will migrate students from one grade level to another. Use this at the end of the academic year.
            </p>
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4 p-4 bg-slate-900/40 rounded-md border border-slate-800">
              <div className="col-span-2 text-[10px] font-black uppercase tracking-widest text-slate-500 border-b border-slate-800 pb-2 mb-2">Source Class (From)</div>
              <div>
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 font-outfit">Standard</label>
                <select
                  className={ic(promoteFormik.touched.fromStandardId, promoteFormik.errors.fromStandardId)}
                  {...promoteFormik.getFieldProps('fromStandardId')}
                  onChange={(e) => {
                    promoteFormik.setFieldValue('fromStandardId', e.target.value);
                    promoteFormik.setFieldValue('fromClassSectionId', '');
                  }}
                >
                  <option value="">Select Source</option>
                  {standards.map(s => <option key={s._id} value={s._id}>Grade {s.level}</option>)}
                </select>
                <Err touched={promoteFormik.touched.fromStandardId} error={promoteFormik.errors.fromStandardId} />
              </div>
              <div>
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 font-outfit">Section (Optional)</label>
                <select
                  className={ic()}
                  {...promoteFormik.getFieldProps('fromClassSectionId')}
                >
                  <option value="">Full Grade</option>
                  {classes.filter(c => (c.standardId?._id || c.standardId) === promoteFormik.values.fromStandardId).map(c => <option key={c._id} value={c._id}>{c.sectionLabel}</option>)}
                </select>
              </div>
            </div>

            <div className="flex justify-center">
              <div className="w-8 h-8 rounded-md bg-slate-800 border border-slate-700 flex items-center justify-center">
                <ArrowUpCircle size={16} className="text-brand-primary" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 p-4 bg-brand-primary/5 rounded-md border border-brand-primary/10">
              <div className="col-span-2 text-[10px] font-black uppercase tracking-widest text-brand-primary border-b border-brand-primary/10 pb-2 mb-2">Target Grade (To)</div>
              <div>
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 font-outfit">Standard</label>
                <select
                  className={ic(promoteFormik.touched.toStandardId, promoteFormik.errors.toStandardId)}
                  {...promoteFormik.getFieldProps('toStandardId')}
                  onChange={(e) => {
                    promoteFormik.setFieldValue('toStandardId', e.target.value);
                    promoteFormik.setFieldValue('toClassSectionId', '');
                  }}
                >
                  <option value="">Select Target</option>
                  {standards.map(s => <option key={s._id} value={s._id}>Grade {s.level}</option>)}
                </select>
                <Err touched={promoteFormik.touched.toStandardId} error={promoteFormik.errors.toStandardId} />
              </div>
              <div>
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 font-outfit">Section (Recommended)</label>
                <select
                  className={ic()}
                  {...promoteFormik.getFieldProps('toClassSectionId')}
                >
                  <option value="">Assign Later</option>
                  {classes.filter(c => (c.standardId?._id || c.standardId) === promoteFormik.values.toStandardId).map(c => <option key={c._id} value={c._id}>{c.sectionLabel}</option>)}
                </select>
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={!promoteFormik.isValid || loading}
            className="w-full py-4 bg-indigo-500 hover:bg-indigo-600 disabled:opacity-50 text-white rounded-md font-black text-sm uppercase tracking-widest transition-all shadow-lg shadow-indigo-500/20"
          >
            {loading ? 'Processing cycle...' : 'Execute Promotion Cycle'}
          </button>
        </form>
      </Modal>
    </div>
  );
};

export default Students;
