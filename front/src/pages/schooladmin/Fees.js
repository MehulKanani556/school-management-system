import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { 
  fetchFees, fetchStudents, fetchFeeStructures, fetchStandards,
  createFee, updateFee, deleteFee, createFeeStructure, 
  updateFeeStructure, deleteFeeStructure, applyFeeStructure 
} from '../../redux/slice/schoolAdmin.slice';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Pencil, Trash2, LayoutGrid, List, Settings2, Sparkles, CheckCircle2, Wallet2 } from 'lucide-react';
import Modal from '../../components/Modal';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import toast from 'react-hot-toast';

const STATUS_COLORS = { 
  paid: 'text-emerald-400 bg-emerald-400/10 border-emerald-500/20', 
  pending: 'text-amber-400 bg-amber-400/10 border-amber-500/20', 
  overdue: 'text-red-400 bg-red-400/10 border-red-500/20',
  partially_paid: 'text-blue-400 bg-blue-400/10 border-blue-500/20'
};

const Fees = () => {
  const dispatch = useDispatch();
  const { fees, students, feeStructures, standards, loading } = useSelector((s) => s.schoolAdmin);
  
  const [activeTab, setActiveTab] = useState('records');
  const [modalType, setModalType] = useState(null); // 'fee', 'structure', 'apply'
  const [editing, setEditing] = useState(null);
  const [filter, setFilter] = useState('all');
  const [payingMap, setPayingMap] = useState({}); // { fee_id: internal_paying_now_amount }
  const [formLoading, setFormLoading] = useState(false);
  const [isAddingNew, setIsAddingNew] = useState(false);

  useEffect(() => { 
    dispatch(fetchFees()); 
    dispatch(fetchStudents()); 
    dispatch(fetchFeeStructures());
    dispatch(fetchStandards());
  }, [dispatch]);

  // ─── Form Handlers ───────────────────────────────────────────────────────────
  
  // 1. Individual Fee Form
  const feeFormik = useFormik({
    initialValues: { studentId: '', amount: '', paidAmount: 0, payingNow: 0, category: '', status: 'pending', dueDate: '' },
    validationSchema: Yup.object({
      studentId: Yup.string().required('Required'),
      amount: Yup.number(),
      category: Yup.string(),
      status: Yup.string(),
      dueDate: Yup.date(),
    }),
    onSubmit: async (values) => {
      setFormLoading(true);
      try {
        const activeIds = Object.keys(payingMap).filter(id => Number(payingMap[id]) > 0);
        let successCount = 0;

        // 1. Process Bulk Updates for EXISTING records (payingMap)
        for (const id of activeIds) {
          const rawForBulk = fees.find(f => f._id === id);
          if (rawForBulk) {
            const finalPaidBulk = (rawForBulk.paidAmount || 0) + Number(payingMap[id]);
            await dispatch(updateFee({ id, data: { ...rawForBulk, paidAmount: finalPaidBulk } })).unwrap();
            successCount++;
          }
        }

        // 2. Process Current Formik Record (Single New record OR Separate Single Edit)
        const isTryingToAddNewChargeButMissingData = isAddingNew && (!values.amount || !values.category);
        if (isTryingToAddNewChargeButMissingData) {
            toast.error('Please specify Reason and Amount for the new charge');
        }

        const isActuallyCreatingOrSpecificEditing = !isTryingToAddNewChargeButMissingData && values.amount && values.category && !activeIds.includes(editing);
        if (isActuallyCreatingOrSpecificEditing) {
            const finalPaidSingle = (Number(values.paidAmount) || 0) + (Number(values.payingNow) || 0);
            const submissionData = { ...values, paidAmount: finalPaidSingle };
            delete submissionData.payingNow;

            const action = editing ? updateFee({ id: editing, data: submissionData }) : createFee(submissionData);
            await dispatch(action).unwrap();
            successCount++;
        }

        if (successCount > 0) {
            toast.success(`${successCount} financial updates committed`);
            closeModals();
            dispatch(fetchFees());
        } else {
            toast.info('No payment or record data detected');
        }
      } catch (err) {
        toast.error(err?.message || 'Transaction failed');
      } finally {
        setFormLoading(false);
      }
    }
  });

  // 2. Fee Structure Form
  const structureFormik = useFormik({
    initialValues: { standardId: '', academicYear: '2024-2025', dueDate: '', feeItems: [{ name: '', amount: 0 }] },
    validationSchema: Yup.object({
      standardId: Yup.string().required('Required'),
      academicYear: Yup.string().required('Required'),
      dueDate: Yup.date().required('Due date is required'),
      feeItems: Yup.array().of(
        Yup.object({
          name: Yup.string().required('Item name required'),
          amount: Yup.number().required('Amount required').min(0)
        })
      )
    }),
    onSubmit: (values) => {
      const action = editing ? updateFeeStructure({ id: editing, data: values }) : createFeeStructure(values);
      dispatch(action).unwrap()
        .then(() => {
          toast.success(editing ? 'Structure refined' : 'Structure established');
          closeModals();
          dispatch(fetchFeeStructures());
        })
        .catch(err => toast.error(err?.message || 'Operation failed'));
    }
  });

  // 3. Apply Structure Form
  const applyFormik = useFormik({
    initialValues: { standardId: '', academicYear: '2024-2025', dueDate: '' },
    validationSchema: Yup.object({
      standardId: Yup.string().required('Required'),
      academicYear: Yup.string().required('Required'),
      dueDate: Yup.date().required('Billing due date required'),
    }),
    onSubmit: (values) => {
      dispatch(applyFeeStructure(values)).unwrap()
        .then(() => {
          toast.success('Fees applied successfully');
          dispatch(fetchFees());
        })
        .catch(err => toast.error(err?.message || 'Failed to apply fees'));
      closeModals();
    }
  });

  const closeModals = () => {
    setModalType(null);
    setEditing(null);
    setPayingMap({});
    setIsAddingNew(false);
    feeFormik.resetForm();
    structureFormik.resetForm();
    applyFormik.resetForm();
  };

  const openEditFee = (f) => {
    setEditing(f._id);
    setPayingMap({ [f._id]: 0 });
    feeFormik.setValues({
      studentId: f.studentId?._id || f.studentId,
      amount: f.amount,
      paidAmount: f.paidAmount || 0,
      payingNow: 0,
      category: f.category,
      status: f.status,
      dueDate: f.dueDate ? f.dueDate.split('T')[0] : ''
    });
    setModalType('fee');
  };

  const openEditStructure = (s) => {
    setEditing(s._id);
    structureFormik.setValues({
      standardId: s.standardId?._id || s.standardId,
      academicYear: s.academicYear,
      dueDate: s.dueDate ? s.dueDate.split('T')[0] : '',
      feeItems: s.feeItems.map(i => ({ name: i.name, amount: i.amount }))
    });
    setModalType('structure');
  };

  // ─── Renderers ───────────────────────────────────────────────────────────────

  const filteredFees = filter === 'all' ? fees : fees.filter(f => f.status === filter);
  
  const combinedFees = React.useMemo(() => {
    const grouped = filteredFees.reduce((acc, f) => {
      const sid = f.studentId?._id || f.studentId;
      if (!acc[sid]) {
        acc[sid] = {
          _id: sid,
          studentId: f.studentId,
          amount: 0,
          paidAmount: 0,
          category: [],
          status: 'paid',
          dueDate: f.dueDate,
          _raw: []
        };
      }
      acc[sid].amount += (f.amount || 0);
      acc[sid].paidAmount += (f.paidAmount || 0);
      if (f.category && !acc[sid].category.includes(f.category)) acc[sid].category.push(f.category);
      acc[sid]._raw.push(f);
      
      // Status Priority: pending/overdue > partially_paid > paid
      const s = f.status;
      if (s === 'overdue' || (s === 'pending' && acc[sid].status !== 'overdue')) {
        acc[sid].status = s;
      } else if (s === 'partially_paid' && !['pending', 'overdue'].includes(acc[sid].status)) {
        acc[sid].status = s;
      }
      
      // Due Date: Use earliest date
      if (f.dueDate && (!acc[sid].dueDate || new Date(f.dueDate) < new Date(acc[sid].dueDate))) {
        acc[sid].dueDate = f.dueDate;
      }
      
      return acc;
    }, {});
    
    return Object.values(grouped).map(cf => ({
      ...cf,
      category: cf.category.join(', ')
    }));
  }, [filteredFees]);

  const totalBilled = fees.reduce((sum, f) => sum + (f.amount || 0), 0);
  const totalPaid = fees.reduce((sum, f) => sum + (f.paidAmount || 0), 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black uppercase tracking-tighter font-outfit text-white">Financial Hub</h1>
          <p className="text-slate-500 text-sm font-medium mt-1 uppercase tracking-widest flex items-center gap-2">
            <Sparkles size={14} className="text-brand-primary" /> Management of Fees & Structures
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="bg-brand-surface/60 p-1.5 rounded-2xl flex gap-1 border border-brand-border/30">
            {[
              { id: 'records', label: 'Fee Records', icon: List },
              { id: 'structure', label: 'Fee Structure', icon: Settings2 }
            ].map(t => (
              <button
                key={t.id}
                onClick={() => setActiveTab(t.id)}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all font-outfit ${activeTab === t.id ? 'bg-brand-primary text-white shadow-lg' : 'text-slate-500 hover:text-white'}`}
              >
                <t.icon size={14} /> {t.label}
              </button>
            ))}
          </div>
          <button 
            onClick={() => setModalType(activeTab === 'records' ? 'fee' : 'structure')}
            className="flex items-center gap-2 px-6 py-3.5 bg-brand-primary hover:bg-blue-600 rounded-2xl font-black text-sm uppercase tracking-wider transition-all font-outfit shadow-lg shadow-brand-primary/20 text-white"
          >
            <Plus size={18} /> {activeTab === 'records' ? 'Add Record' : 'New Structure'}
          </button>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {activeTab === 'records' ? (
          <motion.div key="records" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-6">
            {/* Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
              {[
                { label: 'Total Billed', val: totalBilled, ic: LayoutGrid, col: 'brand-primary' },
                { label: 'Collected', val: totalPaid, ic: CheckCircle2, col: 'emerald-500' },
                { label: 'Outstanding', val: totalBilled - totalPaid, ic: Settings2, col: 'amber-500' }
              ].map(s => (
                <div key={s.label} className="bg-brand-surface/40 backdrop-blur-xl border border-brand-border/40 rounded-[2rem] p-7 transition-all hover:border-brand-primary/20 group">
                  <div className={`w-10 h-10 rounded-xl bg-${s.col}/10 flex items-center justify-center text-${s.col} mb-4 group-hover:scale-110 transition-transform`}>
                    <s.ic size={20} />
                  </div>
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 font-outfit">{s.label}</p>
                  <p className="text-3xl font-black font-outfit mt-2 text-white italic">${s.val.toLocaleString()}</p>
                </div>
              ))}
            </div>

            {/* Filters & Table */}
            <div className="flex flex-wrap gap-2">
              {['all', 'paid', 'pending', 'overdue'].map(s => (
                <button key={s} onClick={() => setFilter(s)}
                  className={`px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all font-outfit border ${filter === s ? 'bg-brand-primary text-white border-transparent shadow-lg' : 'bg-slate-800/40 text-slate-500 border-white/5 hover:text-white'}`}>
                  {s}
                </button>
              ))}
            </div>

            <div className="bg-brand-surface/40 backdrop-blur-xl border border-brand-border/40 rounded-[2.5rem] overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-brand-border/30 bg-slate-800/20">
                      {['Student', 'Category', 'Total', 'Paid', 'Status', 'Due Date', 'Actions'].map(h => (
                        <th key={h} className="px-8 py-5 text-left text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 font-outfit">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {combinedFees.map((f, i) => (
                      <tr key={f._id} className="border-b border-brand-border/10 hover:bg-white/5 transition-colors group">
                        <td className="px-8 py-5">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-xl bg-slate-800 flex items-center justify-center font-black text-xs text-brand-primary">
                              {f.studentId?.firstName?.[0] || 'U'}
                            </div>
                            <div>
                              <p className="text-sm font-black text-white italic uppercase">{f.studentId?.firstName || 'Unknown'} {f.studentId?.lastName || ''}</p>
                              <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">{f.studentId?.admissionNumber || 'N/A'}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-8 py-5">
                          <p className="text-xs font-bold text-slate-300 uppercase truncate max-w-[150px]" title={f.category}>{f.category}</p>
                          {f._raw.length > 1 && <p className="text-[8px] font-black text-brand-primary uppercase mt-0.5">{f._raw.length} Records Combined</p>}
                        </td>
                        <td className="px-8 py-5">
                          <span className="font-black text-white italic tracking-tight text-lg">${(f.amount || 0).toLocaleString()}</span>
                        </td>
                        <td className="px-8 py-5">
                          <span className="font-black text-emerald-400 italic tracking-tight text-lg">${(f.paidAmount || 0).toLocaleString()}</span>
                        </td>
                        <td className="px-8 py-5">
                          <span className={`px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest border ${STATUS_COLORS[f.status] || 'border-slate-800 text-slate-500'}`}>
                            {f.status.replace('_', ' ')}
                          </span>
                        </td>
                        <td className="px-8 py-5 text-slate-400 text-xs font-bold">{f.dueDate ? new Date(f.dueDate).toLocaleDateString() : '—'}</td>
                        <td className="px-8 py-5">
                          <div className="flex items-center gap-2">
                            {/* For combined rows, we show the Add Payment modal with the student selected */}
                            <button 
                              onClick={() => {
                                setModalType('fee');
                                setEditing(null);
                                feeFormik.setValues({ ...feeFormik.initialValues, studentId: f.studentId?._id || f.studentId });
                              }} 
                              className="p-2.5 rounded-xl bg-slate-800/40 text-slate-500 hover:text-emerald-500 hover:bg-emerald-500/10 transition-all opacity-0 group-hover:opacity-100"
                              title="Refine Payments"
                            >
                              <Wallet2 size={14} />
                            </button>
                            <button 
                              onClick={() => {
                                // Find the first record to edit if there's only one, otherwise keep as is or select first
                                if (f._raw.length === 1) {
                                  openEditFee(f._raw[0]);
                                } else {
                                  // For multiple, maybe just open the fee modal for this student
                                  setModalType('fee');
                                  setEditing(null);
                                  feeFormik.setValues({ ...feeFormik.initialValues, studentId: f.studentId?._id || f.studentId });
                                }
                              }} 
                              className="p-2.5 rounded-xl bg-slate-800/40 text-slate-500 hover:text-brand-primary hover:bg-brand-primary/10 transition-all opacity-0 group-hover:opacity-100"
                              title="Config Records"
                            >
                              <Settings2 size={14} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {filteredFees.length === 0 && (
                      <tr><td colSpan={6} className="px-8 py-16 text-center text-slate-500 italic font-medium uppercase tracking-widest">No financial records detected</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.div key="structure" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {feeStructures.map((s, i) => (
                <motion.div key={s._id} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.05 }}
                  className="bg-brand-surface/40 backdrop-blur-xl border border-brand-border/40 rounded-[2.5rem] p-8 hover:border-brand-primary/30 transition-all group relative overflow-hidden">
                  
                  <div className="absolute top-0 right-0 p-8 flex gap-2">
                    <button onClick={() => openEditStructure(s)} className="p-3 rounded-2xl bg-slate-800/60 text-slate-400 hover:text-brand-primary transition-all shadow-xl border border-white/5">
                      <Pencil size={16} />
                    </button>
                    <button onClick={() => dispatch(deleteFeeStructure(s._id))} className="p-3 rounded-2xl bg-slate-800/60 text-slate-400 hover:text-red-400 transition-all shadow-xl border border-white/5">
                      <Trash2 size={16} />
                    </button>
                  </div>

                  <div className="flex items-center gap-4 mb-8">
                    <div className="w-14 h-14 rounded-3xl bg-brand-primary/20 flex items-center justify-center text-brand-primary font-black text-xl italic shadow-inner">
                      G{s.standardId?.level || '—'}
                    </div>
                    <div>
                      <h3 className="text-2xl font-black font-outfit text-white uppercase tracking-tight">Grade Level {s.standardId?.level || '—'}</h3>
                      <div className="flex items-center gap-4 mt-1">
                        <p className="text-xs text-slate-500 font-black uppercase tracking-[0.2em]">{s.academicYear}</p>
                        {s.dueDate && (
                          <p className="text-[10px] font-black uppercase tracking-widest px-2 py-0.5 bg-amber-500/10 text-amber-500 rounded-lg border border-amber-500/20">
                            Due: {new Date(s.dueDate).toLocaleDateString()}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3 mb-8">
                    {s.feeItems.map((item, idx) => (
                      <div key={idx} className="flex items-center justify-between p-4 bg-slate-800/30 rounded-2xl border border-white/5">
                        <span className="text-sm font-bold text-slate-300 uppercase tracking-wider">{item.name}</span>
                        <span className="text-sm font-black text-white italic">${item.amount.toLocaleString()}</span>
                      </div>
                    ))}
                  </div>

                  <div className="flex items-center justify-between pt-6 border-t border-brand-border/30">
                    <div>
                      <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Total Annual Fee</p>
                      <p className="text-3xl font-black font-outfit text-brand-primary">${s.totalAmount?.toLocaleString()}</p>
                    </div>
                    <button 
                      onClick={() => { 
                        applyFormik.setValues({
                          standardId: s.standardId?._id || s.standardId,
                          academicYear: s.academicYear,
                          dueDate: s.dueDate ? s.dueDate.split('T')[0] : ''
                        }); 
                        setModalType('apply'); 
                      }}
                      className="px-6 py-3 bg-white text-black rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-brand-primary hover:text-white transition-all shadow-xl"
                    >
                      Apply to Class
                    </button>
                  </div>
                </motion.div>
              ))}
              {feeStructures.length === 0 && (
                <div className="lg:col-span-2 py-20 text-center bg-brand-surface/20 rounded-[3rem] border-2 border-dashed border-brand-border/30">
                  <Settings2 size={40} className="mx-auto text-slate-600 mb-4 opacity-50" />
                  <p className="font-bold text-slate-500 uppercase tracking-widest">No fee structures defined yet</p>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ─── MODALS ─────────────────────────────────────────────────────────── */}

      {/* 1. Fee Payment Modal */}
      <Modal open={modalType === 'fee'} onClose={closeModals} title={editing ? 'Refine Fee Record' : 'Log New Fee Payment'}>
        <form onSubmit={feeFormik.handleSubmit} className="space-y-4">
          <div>
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 font-outfit px-1">Select Student</label>
            <select name="studentId" value={feeFormik.values.studentId} onChange={feeFormik.handleChange}
              className="mt-1.5 w-full bg-slate-800/60 border border-brand-border/40 focus:border-brand-primary rounded-2xl py-3 px-5 text-white outline-none text-sm transition-all focus:ring-4 focus:ring-brand-primary/10 appearance-none">
              <option value="">Choose a student...</option>
              {students.map(s => <option key={s._id} value={s._id} className="bg-slate-900">{s.firstName} {s.lastName} ({s.admissionNumber})</option>)}
            </select>
            {feeFormik.touched.studentId && feeFormik.errors.studentId && (
              <p className="text-[10px] text-red-400 mt-1 font-bold italic">{feeFormik.errors.studentId}</p>
            )}
            
            {/* Outstanding Records Section */}
            {feeFormik.values.studentId && (() => {
              const unpaidFees = fees.filter(f => (f.studentId?._id || f.studentId) === feeFormik.values.studentId && f.status !== 'paid');
              const totalUnpaid = unpaidFees.reduce((sum, f) => sum + (f.amount || 0) - (f.paidAmount || 0), 0);
              const bulkPayingTotal = Object.values(payingMap).reduce((s, v) => s + (Number(v) || 0), 0);

              return (
                <div className="space-y-4">
                  {/* Balance Summary Header */}
                  {totalUnpaid > 0 && (
                    <div className="p-6 bg-slate-900/60 border border-brand-primary/20 rounded-[2rem] relative overflow-hidden group">
                      <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                        <Wallet2 size={60} className="rotate-12" />
                      </div>
                      <div className="relative z-10 flex items-center justify-between">
                        <div>
                          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 mb-1">Total Outstanding</p>
                          <p className="text-4xl font-black font-outfit text-amber-500 italic tracking-tighter">${totalUnpaid.toLocaleString()}</p>
                        </div>
                        {bulkPayingTotal > 0 && (
                          <div className="text-right">
                             <p className="text-[10px] font-black uppercase tracking-widest text-emerald-500 mb-1">Paying This Session</p>
                             <p className="text-2xl font-black font-outfit text-white italic">-${bulkPayingTotal.toLocaleString()}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* List of Debt Items */}
                  {unpaidFees.length > 0 && (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between px-2">
                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Active Debt Records</p>
                        {unpaidFees.length > 2 && <p className="text-[10px] text-brand-primary font-bold uppercase tracking-widest">{unpaidFees.length} Items</p>}
                      </div>
                      
                      <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1 custom-scrollbar">
                        {unpaidFees.map(uf => (
                          <div key={uf._id} className={`p-4 bg-slate-800/40 rounded-3xl border transition-all ${editing === uf._id ? 'border-brand-primary bg-slate-800/80 shadow-xl' : 'border-white/5 hover:border-brand-primary/20'}`}>
                            <div className="flex items-center justify-between mb-3">
                              <div>
                                <h5 className="text-sm font-black text-white italic uppercase tracking-tight">{uf.category}</h5>
                                <p className="text-[9px] font-bold text-slate-500 uppercase flex items-center gap-1 mt-0.5">
                                   Due: {uf.dueDate ? new Date(uf.dueDate).toLocaleDateString() : 'N/A'}
                                </p>
                              </div>
                              <div className="text-right">
                                <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">Remaining</p>
                                <p className="text-sm font-black text-white italic tracking-tight">${((uf.amount || 0) - (uf.paidAmount || 0)).toLocaleString()}</p>
                              </div>
                            </div>
                            
                            <div className="flex items-center gap-3">
                              <div className="relative flex-1 group">
                                <span className={`absolute left-4 top-1/2 -translate-y-1/2 font-black transition-colors ${payingMap[uf._id] > 0 ? 'text-emerald-500' : 'text-slate-600'}`}>$</span>
                                <input 
                                  type="number" 
                                  placeholder="How much for this specific record?"
                                  max={(uf.amount || 0) - (uf.paidAmount || 0)}
                                  value={payingMap[uf._id] || ''}
                                  onChange={(e) => {
                                    const maxAllowed = (uf.amount || 0) - (uf.paidAmount || 0);
                                    let val = Number(e.target.value);
                                    if (val > maxAllowed) {
                                      val = maxAllowed;
                                      toast.error(`Cannot exceed remaining balance of $${maxAllowed.toLocaleString()}`, { id: 'cap-toast' });
                                    }
                                    setPayingMap(prev => ({ ...prev, [uf._id]: val }));
                                    if (editing === uf._id) feeFormik.setFieldValue('payingNow', val);
                                  }}
                                  className="w-full bg-slate-900/60 border border-white/5 focus:border-brand-primary rounded-2xl py-3 pl-8 pr-4 text-white outline-none text-xs font-black transition-all"
                                />
                              </div>
                              <button 
                                type="button"
                                onClick={() => {
                                  setEditing(uf._id === editing ? null : uf._id);
                                  if (uf._id !== editing) {
                                    feeFormik.setValues({
                                      studentId: uf.studentId?._id || uf.studentId,
                                      amount: uf.amount,
                                      paidAmount: uf.paidAmount || 0,
                                      payingNow: payingMap[uf._id] || 0,
                                      category: uf.category,
                                      status: uf.status,
                                      dueDate: uf.dueDate?.split('T')[0] || ''
                                    });
                                  }
                                }}
                                className={`p-3 rounded-2xl border transition-all ${editing === uf._id ? 'bg-brand-primary text-white border-transparent shadow-lg' : 'bg-slate-800/40 text-slate-500 border-white/5 hover:text-brand-primary'}`}
                                title="Edit full details"
                              >
                                {editing === uf._id ? <CheckCircle2 size={16} /> : <Settings2 size={16} />}
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Manual Creation Toggle / Form */}
                  {!editing && (
                    <div className="pt-2 border-t border-white/5 mt-4">
                      {!isAddingNew ? (
                        <button 
                          type="button" 
                          onClick={() => setIsAddingNew(true)}
                          className="w-full py-4 border-2 border-dashed border-slate-700 hover:border-brand-primary/50 rounded-3xl text-xs font-black uppercase tracking-[0.2em] text-slate-500 hover:text-brand-primary transition-all flex items-center justify-center gap-2"
                        >
                          <Plus size={14} /> Log Extra One-Time Charge
                        </button>
                      ) : (
                        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-slate-900/40 p-6 rounded-[2.5rem] border border-white/5 space-y-4">
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-brand-primary">Manual Record Creator</h4>
                            <button type="button" onClick={() => setIsAddingNew(false)} className="text-[10px] font-black uppercase text-slate-500 hover:text-red-400">Cancel</button>
                          </div>
                          
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                               <label className="text-[9px] font-black uppercase tracking-widest text-slate-500 px-1">Reason / Category</label>
                               <input name="category" value={feeFormik.values.category} onChange={feeFormik.handleChange} placeholder="Exam Fee" className="mt-1 w-full bg-slate-800/60 border border-white/5 rounded-2xl py-3 px-4 text-white text-xs outline-none" />
                            </div>
                            <div>
                               <label className="text-[9px] font-black uppercase tracking-widest text-slate-500 px-1">Total Charge</label>
                               <input name="amount" type="number" value={feeFormik.values.amount} onChange={feeFormik.handleChange} placeholder="0.00" className="mt-1 w-full bg-slate-800/60 border border-white/5 rounded-2xl py-3 px-4 text-white text-xs outline-none" />
                            </div>
                          </div>
                          
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                               <label className="text-[9px] font-black uppercase tracking-widest text-slate-500 px-1">Initial Pay</label>
                               <input name="paidAmount" type="number" value={feeFormik.values.paidAmount} onChange={feeFormik.handleChange} placeholder="0" className="mt-1 w-full bg-slate-800/60 border border-white/5 rounded-2xl py-3 px-4 text-white text-xs outline-none" />
                            </div>
                            <div>
                               <label className="text-[9px] font-black uppercase tracking-widest text-slate-500 px-1">Due Cycle</label>
                               <input name="dueDate" type="date" value={feeFormik.values.dueDate} onChange={feeFormik.handleChange} className="mt-1 w-full bg-slate-800/60 border border-white/5 rounded-2xl py-3 px-4 text-white text-xs outline-none" />
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </div>
                  )}
                </div>
              );
            })()}

            {/* Total Footer Summary */}
            {feeFormik.values.studentId && (
              <div className="pt-4 border-t border-white/5 mt-4 space-y-4">
                <div className="flex items-center justify-between p-7 bg-brand-primary text-white rounded-[2.5rem] shadow-2xl shadow-brand-primary/20 relative overflow-hidden group">
                   <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                   <div>
                      <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-70">Total Settlement Sum</p>
                      <p className="text-xs font-bold opacity-80 mt-1 uppercase tracking-widest italic">{Object.keys(payingMap).filter(k=>payingMap[k]>0).length + (isAddingNew ? 1 : 0)} Financial Transactions</p>
                   </div>
                   <p className="text-4xl font-black font-outfit italic tracking-tighter">
                     ${(Object.values(payingMap).reduce((s, v) => s + (Number(v) || 0), 0) + (isAddingNew ? Number(feeFormik.values.paidAmount || 0) : 0)).toLocaleString()}
                   </p>
                </div>

                <button type="submit" disabled={loading || formLoading} 
                  className="w-full py-5 bg-white text-black hover:bg-brand-primary hover:text-white rounded-[1.5rem] font-black text-sm uppercase tracking-[0.2em] transition-all shadow-2xl flex items-center justify-center gap-3 active:scale-95"
                >
                  {loading || formLoading ? <div className="w-5 h-5 border-2 border-brand-primary border-t-transparent animate-spin rounded-full" /> : 'Confirm Financial Records'}
                </button>
              </div>
            )}
          </div>
        </form>
      </Modal>
      {/* 2. Fee Structure Modal */}
      <Modal open={modalType === 'structure'} onClose={closeModals} title={editing ? 'Refine Structure' : 'Architect Fee Structure'}>
        <form onSubmit={structureFormik.handleSubmit} className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-1">Standard (Grade)</label>
              <select name="standardId" value={structureFormik.values.standardId} onChange={structureFormik.handleChange}
                className="mt-1.5 w-full bg-slate-800/60 border border-brand-border/40 focus:border-brand-primary rounded-2xl py-3 px-5 text-white outline-none text-sm transition-all focus:ring-4 focus:ring-brand-primary/10 appearance-none">
                <option value="">Select Standard...</option>
                {standards.map(std => <option key={std._id} value={std._id} className="bg-slate-900">Grade {std.level}</option>)}
              </select>
            </div>
            <div>
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-1">Academic Year</label>
              <input name="academicYear" placeholder="2024-2025" value={structureFormik.values.academicYear} onChange={structureFormik.handleChange}
                className="mt-1.5 w-full bg-slate-800/60 border border-brand-border/40 rounded-2xl py-3 px-5 text-white outline-none text-sm focus:border-brand-primary" />
            </div>
          </div>

          <div>
             <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-1">Structure Due Date</label>
             <input name="dueDate" type="date" value={structureFormik.values.dueDate} onChange={structureFormik.handleChange}
                className="mt-1.5 w-full bg-slate-800/60 border border-brand-border/40 rounded-2xl py-3 px-5 text-white outline-none text-sm focus:border-brand-primary" />
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between px-1">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Fee Items & Breakdowns</label>
              <button 
                type="button" 
                onClick={() => structureFormik.setFieldValue('feeItems', [...structureFormik.values.feeItems, { name: '', amount: 0 }])}
                className="text-brand-primary font-black text-[10px] uppercase tracking-widest hover:text-white transition-colors"
                >
                + Add Component
              </button>
            </div>
            
            <div className="space-y-2 max-h-48 overflow-y-auto px-1">
              {structureFormik.values.feeItems.map((item, idx) => (
                <div key={idx} className="flex gap-2">
                  <input placeholder="Name" value={item.name} onChange={e => structureFormik.setFieldValue(`feeItems[${idx}].name`, e.target.value)}
                    className="flex-1 bg-slate-800/40 border border-brand-border/20 rounded-xl py-2 px-4 text-xs text-white" />
                  <input type="number" placeholder="Amount" value={item.amount} onChange={e => structureFormik.setFieldValue(`feeItems[${idx}].amount`, Number(e.target.value))}
                    className="w-24 bg-slate-800/40 border border-brand-border/20 rounded-xl py-2 px-4 text-xs text-white" />
                  <button type="button" onClick={() => structureFormik.setFieldValue('feeItems', structureFormik.values.feeItems.filter((_, i) => i !== idx))}
                    className="p-2 text-slate-600 hover:text-red-400"><Trash2 size={14}/></button>
                </div>
              ))}
            </div>
          </div>

          <div className="p-5 bg-brand-primary/10 border border-brand-primary/20 rounded-2xl flex items-center justify-between">
            <span className="text-[10px] font-black uppercase tracking-widest text-brand-primary">Total Annual Calculation</span>
            <span className="text-xl font-black text-white italic">
              ${structureFormik.values.feeItems.reduce((acc, item) => acc + (Number(item.amount) || 0), 0).toLocaleString()}
            </span>
          </div>

          <button type="submit" disabled={loading} className="w-full py-4 bg-white text-black hover:bg-brand-primary hover:text-white rounded-[1.2rem] font-black text-sm uppercase tracking-widest transition-all font-outfit shadow-xl mt-4">
            {loading ? 'Synthesizing...' : editing ? 'Save Blueprint' : 'Establish Structure'}
          </button>
        </form>
      </Modal>

      {/* 3. Apply Structure Modal */}
      <Modal open={modalType === 'apply'} onClose={closeModals} title="Execute Fee Billing">
        <form onSubmit={applyFormik.handleSubmit} className="space-y-6 pt-4">
          <div className="bg-brand-primary/10 border border-brand-primary/20 p-6 rounded-[1.5rem] mb-6">
            <p className="text-xs font-bold text-slate-300 leading-relaxed text-center">
              You are about to generate individual fee records for <span className="text-brand-primary font-black">ALL STUDENTS</span> in 
              <span className="text-brand-primary font-black italic ml-1 underline decoration-2 underline-offset-4">
                Grade {standards.find(s => s._id === applyFormik.values.standardId)?.level || '—'}
              </span>. 
              This action will populate their financial profiles based on the defined structure.
            </p>
          </div>

          <div className="space-y-4">
             <div>
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-1">Academic Year Context</label>
                <input name="academicYear" value={applyFormik.values.academicYear} onChange={applyFormik.handleChange}
                  className="mt-1.5 w-full bg-slate-800/60 border border-brand-border/40 rounded-2xl py-3.5 px-5 text-white text-sm font-bold" />
             </div>
             <div>
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-1">Billing Due Date</label>
                <input name="dueDate" type="date" value={applyFormik.values.dueDate} onChange={applyFormik.handleChange}
                  className="mt-1.5 w-full bg-slate-800/60 border border-brand-border/40 rounded-2xl py-3.5 px-5 text-white text-sm font-bold" />
             </div>
          </div>

          <button type="submit" disabled={loading} className="w-full py-5 bg-gradient-to-r from-brand-primary to-blue-600 hover:scale-[1.02] active:scale-[0.98] rounded-[1.5rem] font-black text-sm uppercase tracking-[0.2em] transition-all font-outfit text-white shadow-2xl shadow-brand-primary/30 mt-6">
            {loading ? 'Executing Protocol...' : 'Confirm & Apply Billing'}
          </button>
        </form>
      </Modal>
    </div>
  );
};

export default Fees;

