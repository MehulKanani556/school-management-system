import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchPayroll, fetchTeachers, createPayroll, updatePayroll, deletePayroll } from '../../redux/slice/schoolAdmin.slice';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { motion } from 'framer-motion';
import { Plus, Pencil, Trash2, Search, Banknote, CheckCircle2, XCircle, ChevronLeft, ChevronRight } from 'lucide-react';
import Modal from '../../components/Modal';
import { format } from 'date-fns';

const validationSchema = Yup.object({
  teacherId: Yup.string().required('Teacher is required'),
  month: Yup.number().min(1).max(12).required('Month is required'),
  year: Yup.number().required('Year is required'),
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
  bonus: 0, 
  deductions: 0, 
  status: 'unpaid', 
  paymentDate: '', 
  remarks: '' 
};

const Payroll = () => {
  const dispatch = useDispatch();
  const { payroll, teachers, loading } = useSelector((s) => s.schoolAdmin);
  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [search, setSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => { 
    dispatch(fetchPayroll());
    dispatch(fetchTeachers());
  }, [dispatch]);

  const formik = useFormik({
    initialValues: emptyValues,
    validationSchema,
    enableReinitialize: true,
    onSubmit: async (values, { resetForm }) => {
      const action = editing
        ? dispatch(updatePayroll({ id: editing, data: values }))
        : dispatch(createPayroll(values));
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
          <h1 className="text-2xl font-black uppercase tracking-tighter font-outfit text-white">Payroll Tracking</h1>
          <p className="text-slate-400 text-sm mt-1">{payroll.length} salary records managed</p>
        </div>
        <button onClick={openAdd} className="flex items-center gap-2 px-5 py-3 bg-brand-primary hover:bg-blue-500 rounded-md font-black text-sm uppercase tracking-wider transition-all font-outfit shadow-lg shadow-blue-600/20">
          <Plus size={18} /> Add Record
        </button>
      </div>

      <div className="relative">
        <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search records by teacher name..."
          className="w-full bg-brand-surface/40 border border-brand-border/40 rounded-md py-3 pl-11 pr-5 text-white placeholder-slate-600 outline-none focus:border-brand-primary transition-all" />
      </div>

      <div className="bg-brand-surface/40 backdrop-blur-xl border border-brand-border/40 rounded-md overflow-hidden shadow-2xl shadow-black/40">
        <table className="w-full">
          <thead>
            <tr className="border-b border-brand-border/30 bg-white/5">
              {['Teacher', 'Month/Year', 'Base Salary', 'Bonus/Ded', 'Total', 'Status', 'Actions'].map(h => (
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
                <td className="px-6 py-5 text-sm font-mono text-slate-400">₹{p.baseSalary?.toLocaleString()}</td>
                <td className="px-6 py-5">
                  <div className="flex items-center gap-1.5 text-[10px] font-bold">
                    <span className="text-emerald-500">+{p.bonus || 0}</span>
                    <span className="text-slate-700">/</span>
                    <span className="text-rose-500">-{p.deductions || 0}</span>
                  </div>
                </td>
                <td className="px-6 py-5 font-black text-brand-primary">₹{p.totalAmount?.toLocaleString()}</td>
                <td className="px-6 py-5">
                  <span className={`px-3 py-1 rounded-md text-[10px] font-black uppercase tracking-wider ${p.status === 'paid' ? 'text-emerald-400 bg-emerald-400/10' : 'text-amber-500 bg-amber-500/10'}`}>
                    {p.status}
                  </span>
                </td>
                <td className="px-6 py-5">
                  <div className="flex gap-2">
                    <button onClick={() => openEdit(p)} className="p-2 rounded-md hover:bg-brand-primary/20 text-slate-500 hover:text-brand-primary transition-all" title="Edit"><Pencil size={15} /></button>
                    <button onClick={() => dispatch(deletePayroll(p._id))} className="p-2 rounded-md hover:bg-red-500/10 text-slate-500 hover:text-red-400 transition-all" title="Delete"><Trash2 size={15} /></button>
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
          <div>
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 font-outfit">Select Teacher</label>
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
    </div>
  );
};

export default Payroll;
