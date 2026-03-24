import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchPayroll, fetchTeachers, createPayroll, updatePayroll, deletePayroll, generateBulkPayroll } from '../../redux/slice/schoolAdmin.slice';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { motion } from 'framer-motion';
import { Plus, Pencil, Trash2, Search, Banknote, CheckCircle2, XCircle, ChevronLeft, ChevronRight, Zap, AlertCircle, TrendingUp } from 'lucide-react';
import Modal from '../../components/Modal';
import { format } from 'date-fns';
import moment from 'moment';

const validationSchema = Yup.object({
  teacherId: Yup.string().required('Teacher is required'),
  month: Yup.number().min(1).max(12).required('Month is required'),
  year: Yup.number().required('Year is required'),
  basicSalary: Yup.number().min(0).required('Basic Salary is required'),
  bonus: Yup.number().min(0),
  deductions: Yup.number().min(0),
  status: Yup.string().oneOf(['paid', 'unpaid']).required(),
  paymentDate: Yup.date().nullable(),
  remarks: Yup.string(),
});

const inputClass = (touched, error) =>
  `mt-1.5 w-full bg-slate-800 border ${touched && error ? 'border-red-500/60' : 'border-slate-700'} focus:border-brand-primary rounded-md py-3 px-4 text-white placeholder-slate-500 outline-none text-sm transition-all`;

const FieldError = ({ touched, error }) =>
  touched && error ? <p className="mt-1 text-[10px] text-red-400 font-bold tracking-wide">{error}</p> : null;

const emptyValues = { 
  teacherId: '', 
  month: new Date().getMonth() + 1, 
  year: new Date().getFullYear(), 
  basicSalary: '',
  bonus: 0, 
  deductions: 0, 
  status: 'unpaid', 
  paymentDate: '', 
  remarks: '' 
};

const Payroll = () => {
  const dispatch = useDispatch();
  const { payroll, teachers, loading, error } = useSelector((s) => s.schoolAdmin);
  const [modal, setModal] = useState(false);
  const [bulkModal, setBulkModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [bulkValues, setBulkValues] = useState({ month: moment().month() + 1, year: moment().year(), bonusPercent: 0 });
  const [search, setSearch] = useState('');
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => { 
    dispatch(fetchPayroll());
    dispatch(fetchTeachers());
  }, [dispatch]);

  const handleBulkGenerate = async () => {
    const res = await dispatch(generateBulkPayroll(bulkValues));
    if (generateBulkPayroll.fulfilled.match(res)) {
      setBulkModal(false);
      dispatch(fetchPayroll());
    }
  };

  const formik = useFormik({
    initialValues: emptyValues,
    validationSchema,
    enableReinitialize: true,
    onSubmit: async (values, { resetForm }) => {
      const netSalary = (Number(values.basicSalary) || 0) + (Number(values.bonus) || 0) - (Number(values.deductions) || 0);
      const submissionData = { ...values, netSalary };
      
      const action = editing
        ? dispatch(updatePayroll({ id: editing, data: submissionData }))
        : dispatch(createPayroll(submissionData));
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

  const openEdit = (p) => {
    setEditing(p._id);
    formik.setValues({
    teacherId: p.teacherId?._id || '',
    month: p.month,
    year: p.year,
    basicSalary: p.basicSalary || '',
    bonus: p.bonus,
    deductions: p.deductions,
      status: p.status,
      paymentDate: p.paymentDate ? p.paymentDate.split('T')[0] : '',
      remarks: p.remarks || '',
    });
    setModal(true);
  };

  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const filtered = payroll.filter(p =>
    `${p.teacherId?.firstName} ${p.teacherId?.lastName}`.toLowerCase().includes(search.toLowerCase())
  );

  const totalPages = Math.ceil(filtered.length / itemsPerPage);
  const currentItems = filtered.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  useEffect(() => {
    setCurrentPage(1);
  }, [search]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black uppercase tracking-tighter font-outfit text-white">Payroll Node</h1>
          <p className="text-slate-400 text-sm mt-1">Institutional workforce financial registry</p>
        </div>
        <div className="flex gap-4">
            <button onClick={() => setBulkModal(true)} className="flex items-center gap-2 px-6 py-3.5 bg-indigo-500/10 hover:bg-indigo-500 rounded-md font-black text-xs uppercase tracking-widest transition-all border border-indigo-500/20 text-indigo-400 hover:text-white shadow-[0_0_20px_rgba(99,102,241,0.2)]">
                <Zap size={18} /> Bulk Generation
            </button>
            <button onClick={openAdd} className="flex items-center gap-2 px-6 py-3.5 bg-brand-primary hover:bg-blue-600 rounded-md font-black text-xs uppercase tracking-widest transition-all shadow-[0_0_20px_rgba(37,99,235,0.2)] text-white">
                <Plus size={18} /> Push Entry
            </button>
        </div>
      </div>

      {/* Bulk Generation Modal */}
      <Modal open={bulkModal} onClose={() => setBulkModal(false)} title="Bulk Payroll Generation Pulse">
          <div className="space-y-6 p-2">
              <div className="bg-indigo-500/10 border border-indigo-500/20 rounded-md p-6 flex items-start gap-4">
                  <AlertCircle className="text-indigo-400 shrink-0 mt-1" size={20} />
                  <div className="space-y-2">
                      <p className="text-xs font-black text-white uppercase tracking-widest">Protocol Intelligence</p>
                      <p className="text-[11px] text-slate-400 leading-relaxed font-bold">This operation will calculate net yields for all active personnel based on attendance deltas and base salary parameters. Existing records for this month will be bypassed.</p>
                  </div>
              </div>
              
              <div className="grid grid-cols-2 gap-5">
                  <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Target Month</label>
                      <select value={bulkValues.month} onChange={(e) => setBulkValues({...bulkValues, month: parseInt(e.target.value)})}
                          className="w-full bg-slate-900 border border-brand-border/40 py-4 px-6 rounded-md text-white font-bold outline-none focus:border-brand-primary appearance-none cursor-pointer">
                          {moment.months().map((m, i) => <option key={i} value={i+1} className="bg-slate-900">{m}</option>)}
                      </select>
                  </div>
                  <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Target Year</label>
                      <select value={bulkValues.year} onChange={(e) => setBulkValues({...bulkValues, year: parseInt(e.target.value)})}
                          className="w-full bg-slate-900 border border-brand-border/40 py-4 px-6 rounded-md text-white font-bold outline-none focus:border-brand-primary appearance-none cursor-pointer">
                          {[2023, 2024, 2025, 2026].map(y => <option key={y} value={y} className="bg-slate-900">{y}</option>)}
                      </select>
                  </div>
              </div>

              <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Global Bonus Increment (%)</label>
                  <div className="relative">
                      <TrendingUp className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                      <input type="number" value={bulkValues.bonusPercent} onChange={(e) => setBulkValues({...bulkValues, bonusPercent: parseFloat(e.target.value)})}
                          className="w-full bg-slate-900 border border-brand-border/40 py-4 pl-14 pr-6 rounded-md text-white font-bold outline-none focus:border-brand-primary" />
                  </div>
              </div>

              <button onClick={handleBulkGenerate} disabled={loading}
                  className="w-full py-5 bg-indigo-500 hover:bg-indigo-600 rounded-md font-black text-[13px] uppercase tracking-[0.3em] transition-all font-outfit mt-4 shadow-[0_0_30px_rgba(99,102,241,0.3)] text-white">
                  {loading ? 'CALCULATING DELTA...' : 'INITIALIZE GENERATION'}
              </button>
          </div>
      </Modal>

      <div className="relative">
        <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search records by teacher name..."
          className="w-full bg-brand-surface/40 border border-brand-border/40 rounded-md py-3 pl-11 pr-5 text-white placeholder-slate-600 outline-none focus:border-brand-primary transition-all" />
      </div>

      <div className="bg-brand-surface/40 backdrop-blur-xl border border-brand-border/40 rounded-md overflow-hidden shadow-2xl shadow-black/40">
        <table className="w-full">
          <thead>
            <tr className="border-b border-brand-border/30 bg-white/5">
              {['Teacher', 'Month/Year', 'Basic Salary', 'Bonus/Ded', 'Net Salary', 'Status', 'Actions'].map(h => (
                <th key={h} className="px-6 py-4 text-left text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 font-outfit">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-brand-border/10">
            {loading && filtered.length === 0 ? (
              <tr><td colSpan={7} className="px-6 py-12 text-center text-slate-500">Loading...</td></tr>
            ) : filtered.length === 0 ? (
              <tr><td colSpan={7} className="px-6 py-12 text-center text-slate-500 italic">No payroll records found</td></tr>
            ) : currentItems.map((p, i) => (
              <motion.tr key={p._id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.03 }}
                className="hover:bg-slate-800/20 transition-colors group">
                <td className="px-6 py-5">
                  <div className="flex flex-col">
                    <span className="font-bold text-white group-hover:text-brand-primary transition-colors">{p.teacherId?.firstName} {p.teacherId?.lastName}</span>
                    <span className="text-[10px] text-slate-500 font-mono tracking-tighter">{p.teacherId?.employeeId}</span>
                  </div>
                </td>
                <td className="px-6 py-5">
                  <span className="text-sm font-medium text-slate-300">{months[p.month - 1]} {p.year}</span>
                </td>
                <td className="px-6 py-5 text-sm font-mono text-slate-400">₹{p.basicSalary?.toLocaleString()}</td>
                <td className="px-6 py-5">
                  <div className="flex items-center gap-1.5 text-[10px] font-bold">
                    <span className="text-emerald-500">+{p.bonus || 0}</span>
                    <span className="text-slate-700">/</span>
                    <span className="text-rose-500">-{p.deductions || 0}</span>
                  </div>
                </td>
                <td className="px-6 py-5 font-black text-brand-primary">₹{p.netSalary?.toLocaleString()}</td>
                <td className="px-6 py-5">
                  <span className={`px-3 py-1 rounded-md text-[10px] font-black uppercase tracking-wider ${p.status === 'paid' ? 'text-emerald-400 bg-emerald-400/10' : 'text-amber-500 bg-amber-500/10'}`}>
                    {p.status}
                  </span>
                </td>
                <td className="px-6 py-5">
                  <div className="flex gap-2">
                    <button onClick={() => openEdit(p)} className="p-2 rounded-md hover:bg-brand-primary/20 text-slate-500 hover:text-brand-primary transition-all" title="Edit"><Pencil size={15} /></button>
                    <button onClick={() => setDeleteTarget(p)} className="p-2 rounded-md hover:bg-red-500/10 text-slate-500 hover:text-red-400 transition-all" title="Delete"><Trash2 size={15} /></button>
                  </div>
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
        {totalPages > 1 && (
          <div className="p-6 border-t border-brand-border/30 flex items-center justify-between bg-black/20">
            <div className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 font-outfit italic">
              Telemetry Page {currentPage} of {totalPages}
            </div>
            <div className="flex gap-2">
              <button 
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className={`p-2 rounded-md border transition-all ${currentPage === 1 ? 'border-slate-800 text-slate-700 cursor-not-allowed' : 'border-slate-700 text-slate-400 hover:border-brand-primary hover:text-white'}`}
              >
                <ChevronLeft size={16} />
              </button>
              <div className="flex gap-1">
                {[...Array(totalPages)].map((_, i) => (
                  <button 
                    key={i + 1}
                    onClick={() => setCurrentPage(i + 1)}
                    className={`w-8 h-8 rounded-md text-[10px] font-black transition-all font-outfit ${currentPage === i + 1 ? 'bg-brand-primary/20 border border-brand-primary text-brand-primary' : 'border border-slate-800 text-slate-500 hover:border-slate-600 hover:text-slate-300'}`}
                  >
                    {i + 1}
                  </button>
                ))}
              </div>
              <button 
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className={`p-2 rounded-md border transition-all ${currentPage === totalPages ? 'border-slate-800 text-slate-700 cursor-not-allowed' : 'border-slate-700 text-slate-400 hover:border-brand-primary hover:text-white'}`}
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>



      <Modal open={modal} onClose={() => setModal(false)} title={editing ? 'Update Payroll' : 'Add Payroll Record'}>
        <form onSubmit={formik.handleSubmit} className="space-y-4">
          {error && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-md p-4 mb-4 flex items-start gap-3">
              <XCircle className="text-red-500 shrink-0 mt-0.5" size={16} />
              <div className="flex flex-col"><span className="text-[10px] font-black text-red-500 uppercase italic">Validation Protocol Failure</span><p className="text-[11px] font-bold text-red-200 mt-1 italic">{error}</p></div>
            </div>
          )}
          <div>
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 font-outfit">Select Teacher</label>
            <select 
              name="teacherId"
              value={formik.values.teacherId}
              onChange={(e) => {
                const tId = e.target.value;
                formik.setFieldValue('teacherId', tId);
                const teacher = teachers.find(t => t._id === tId);
                if (teacher) {
                  formik.setFieldValue('basicSalary', teacher.baseSalary || 0);
                }
              }}
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

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 font-outfit">Month</label>
              <select {...formik.getFieldProps('month')} className={inputClass(formik.touched.month, formik.errors.month)}>
                {months.map((m, i) => <option key={m} value={i + 1}>{m}</option>)}
              </select>
            </div>
            <div>
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 font-outfit">Year</label>
              <input type="number" {...formik.getFieldProps('year')} className={inputClass(formik.touched.year, formik.errors.year)} />
            </div>
          </div>

          <div>
             <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 font-outfit">Basic Salary</label>
             <input type="number" {...formik.getFieldProps('basicSalary')} className={inputClass(formik.touched.basicSalary, formik.errors.basicSalary)} placeholder="Enter base amount..." />
             <FieldError touched={formik.touched.basicSalary} error={formik.errors.basicSalary} />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 font-outfit">Bonus</label>
              <input type="number" {...formik.getFieldProps('bonus')} className={inputClass(formik.touched.bonus, formik.errors.bonus)} />
            </div>
            <div>
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 font-outfit">Deductions</label>
              <input type="number" {...formik.getFieldProps('deductions')} className={inputClass(formik.touched.deductions, formik.errors.deductions)} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 font-outfit">Status</label>
              <select {...formik.getFieldProps('status')} className={inputClass(formik.touched.status, formik.errors.status)}>
                <option value="unpaid">Unpaid</option>
                <option value="paid">Paid</option>
              </select>
            </div>
            <div>
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 font-outfit">Payment Date</label>
              <input type="date" {...formik.getFieldProps('paymentDate')} className={inputClass(formik.touched.paymentDate, formik.errors.paymentDate)} />
            </div>
          </div>

          <div>
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 font-outfit">Remarks</label>
            <textarea {...formik.getFieldProps('remarks')} rows={2} className={`${inputClass(formik.touched.remarks, formik.errors.remarks)} resize-none`} placeholder="Optional notes..."></textarea>
          </div>

          <button type="submit" disabled={loading}
            className="w-full py-4 bg-brand-primary hover:bg-blue-500 disabled:opacity-60 rounded-md font-black text-sm uppercase tracking-wider transition-all font-outfit mt-4 flex items-center justify-center gap-2">
            <Banknote size={16} /> {loading ? 'Processing...' : editing ? 'Update Record' : 'Generate Payroll'}
          </button>
        </form>
      </Modal>
      {/* Delete Confirmation Modal */}
      <Modal open={!!deleteTarget} onClose={() => setDeleteTarget(null)} title="Decommission Payroll Record" maxWidth="max-w-sm">
        <div className="space-y-6 text-center">
          <div className="w-20 h-20 rounded-md bg-rose-500/10 border border-rose-500/20 flex items-center justify-center mx-auto mb-4">
            <Trash2 size={32} className="text-rose-500" />
          </div>
          <div className="space-y-2">
            <h4 className="text-lg font-black text-white italic uppercase tracking-tighter">Confirm Deletion</h4>
            <p className="text-slate-500 text-xs font-bold leading-relaxed uppercase tracking-widest">Are you sure you want to purge the payroll record for <span className="text-white">{deleteTarget?.teacherId?.firstName} {deleteTarget?.teacherId?.lastName}</span> ({months[(deleteTarget?.month || 1) - 1]} {deleteTarget?.year})?</p>
          </div>
          <div className="flex gap-4 pt-4">
            <button onClick={() => setDeleteTarget(null)} className="flex-1 py-4 bg-slate-900 border border-slate-800 rounded-md text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-white transition-all">Abort</button>
            <button onClick={() => { dispatch(deletePayroll(deleteTarget._id)); setDeleteTarget(null); }} className="flex-1 py-4 bg-rose-500 hover:bg-rose-600 rounded-md text-[10px] font-black uppercase tracking-widest text-white transition-all shadow-lg shadow-rose-500/20">Purge Node</button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default Payroll;
