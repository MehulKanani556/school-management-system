import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchFeeStructures, createFeeStructure, updateFeeStructure, deleteFeeStructure, applyFeeStructure } from '../../redux/slice/accountant.slice';
import axiosInstance from '../../utils/axiosInstance';
import { BookOpen, Layers, DollarSign, ChevronRight, Loader2, Info, X, Plus, Trash2, Edit3, Send, ShieldCheck, ListFilter, AlertCircle, Save, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const FeeStructures = () => {
    const dispatch = useDispatch();
    const { feeStructures, loading } = useSelector((state) => state.accountant);
    const [selectedStructure, setSelectedStructure] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false);
    const [standards, setStandards] = useState([]);
    
    const [formData, setFormData] = useState({
        standardId: '',
        academicYear: new Date().getFullYear().toString(),
        feeItems: [{ name: '', amount: '' }],
        totalAmount: 0
    });

    const [confirmModal, setConfirmModal] = useState({
        show: false,
        title: '',
        message: '',
        onConfirm: null,
        confirmText: 'Execute Protocol'
    });

    useEffect(() => {
        dispatch(fetchFeeStructures());
        fetchStandards();
    }, [dispatch]);

    const fetchStandards = async () => {
        try {
            const res = await axiosInstance.get('/accountant/standards');
            setStandards(res.data);
        } catch (err) { console.error(err); }
    };

    const handleAddItem = () => {
        setFormData({ ...formData, feeItems: [...formData.feeItems, { name: '', amount: '' }] });
    };

    const handleRemoveItem = (index) => {
        const newItems = formData.feeItems.filter((_, i) => i !== index);
        setFormData({ ...formData, feeItems: newItems });
    };

    const handleItemChange = (index, field, value) => {
        const newItems = [...formData.feeItems];
        newItems[index][field] = value;
        
        // Calculate total
        const total = newItems.reduce((acc, item) => acc + (Number(item.amount) || 0), 0);
        setFormData({ ...formData, feeItems: newItems, totalAmount: total });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (isEditMode) {
            dispatch(updateFeeStructure({ id: formData._id, data: formData }));
        } else {
            dispatch(createFeeStructure(formData));
        }
        setIsModalOpen(false);
        resetForm();
    };

    const resetForm = () => {
        setFormData({
            standardId: '',
            academicYear: new Date().getFullYear().toString(),
            feeItems: [{ name: '', amount: '' }],
            totalAmount: 0
        });
        setIsEditMode(false);
    };

    const handleEdit = (structure) => {
        setFormData({
            ...structure,
            standardId: structure.standardId?._id || structure.standardId
        });
        setIsEditMode(true);
        setIsModalOpen(true);
    };

    const handleDelete = (id) => {
        setConfirmModal({
            show: true,
            title: 'Permanent Erasure Protocol',
            message: 'You are about to permanently erase this fiscal structure node. This action will invalidate future fee generations for this grade. Proceed with irreversible deletion?',
            confirmText: 'Erase Node',
            onConfirm: () => {
                dispatch(deleteFeeStructure(id));
                setConfirmModal({ ...confirmModal, show: false });
            }
        });
    };

    const [applyModalData, setApplyModalData] = useState(null);
    const [applyDueDate, setApplyDueDate] = useState(new Date().toISOString().split('T')[0]);

    const handleApply = (structure) => {
        setApplyModalData(structure);
    };

    const confirmApply = () => {
        if (!applyModalData) return;
        dispatch(applyFeeStructure({
            standardId: applyModalData.standardId?._id || applyModalData.standardId,
            dueDate: applyDueDate,
            academicYear: applyModalData.academicYear
        })).then((res) => {
            if (!res.error) {
                setApplyModalData(null);
            }
        });
    };

    return (
        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="space-y-8 pb-10">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                    <h1 className="text-2xl xs:text-3xl font-black text-slate-100 italic uppercase tracking-tighter leading-none mb-1">Fiscal Architecture</h1>
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest italic opacity-70 leading-none">Defining and provisioning administrative capital tiers.</p>
                </div>
                <div className="flex items-center gap-4">
                    <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-brand-background border border-brand-border rounded text-[9px] font-black text-luxury-emerald uppercase italic tracking-[0.2em]">
                        <ShieldCheck size={12} />
                        Verified Command Node
                    </div>
                    <button 
                        onClick={() => { resetForm(); setIsModalOpen(true); }}
                        className="flex items-center gap-2 px-6 py-3 bg-brand-primary text-slate-100 rounded-md text-[10px] font-black uppercase italic tracking-widest hover:bg-brand-primary-hover shadow-[0_0_20px_rgba(37,99,235,0.3)] transition-all"
                    >
                        <Plus size={14} />
                        <span>Provision New Alpha Node</span>
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {feeStructures && feeStructures.length > 0 ? feeStructures.map((structure, i) => (
                    <motion.div 
                        key={i}
                        whileHover={{ y: -5 }}
                        className="bg-brand-surface border border-brand-border rounded-md p-6 shadow-2xl relative overflow-hidden group"
                    >
                        <div className="absolute top-0 left-0 w-full h-1 bg-brand-primary opacity-30 group-hover:opacity-100 transition-opacity"></div>
                        
                        <div className="flex items-start justify-between mb-6">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded bg-slate-800 flex items-center justify-center text-brand-primary border border-brand-border group-hover:border-brand-primary/50 transition-all">
                                    <Layers size={20} />
                                </div>
                                <div className="text-left">
                                    <h3 className="font-black text-slate-100 italic uppercase tracking-tight leading-none mb-1">{structure.standardId?.name || `Grade Node ${structure.standardId?.level}`}</h3>
                                    <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest italic">{structure.academicYear} Academic Cycle</span>
                                </div>
                            </div>
                            <div className="text-right">
                                <span className="block text-xl font-black text-slate-100 italic tracking-tighter">${(structure.totalAmount || 0).toLocaleString()}</span>
                                <span className="text-[8px] font-black text-brand-primary uppercase tracking-widest italic">Aggregate Quantum</span>
                            </div>
                        </div>

                        <div className="space-y-3 mb-6">
                            <div className="flex items-center justify-between text-[10px] font-bold uppercase italic text-slate-400">
                                <span className="flex items-center gap-1.5"><ListFilter size={10} className="text-brand-primary/50" /> Components</span>
                                <span className="text-slate-200">{structure.feeItems?.length || 0} Assets</span>
                            </div>
                            <div className="flex items-center justify-between text-[10px] font-bold uppercase italic text-slate-400">
                                <span>Verification Status</span>
                                <span className="text-luxury-emerald">Live Protocol</span>
                            </div>
                        </div>

                        <div className="flex items-center gap-2 mb-6">
                            <button 
                                onClick={() => handleEdit(structure)}
                                className="flex-1 py-2.5 bg-brand-background border border-brand-border rounded text-[9px] font-black text-slate-500 uppercase tracking-widest italic hover:text-brand-primary hover:border-brand-primary/30 transition-all flex items-center justify-center gap-2"
                            >
                                <Edit3 size={11} />
                                <span>Modify</span>
                            </button>
                            <button 
                                onClick={() => handleDelete(structure._id)}
                                className="px-3 py-2.5 bg-brand-background border border-luxury-rose/20 rounded text-luxury-rose hover:bg-luxury-rose hover:text-white transition-all"
                            >
                                <Trash2 size={13} />
                            </button>
                        </div>

                        <div className="grid grid-cols-2 gap-2">
                            <button 
                                onClick={() => setSelectedStructure(structure)}
                                className="py-3 bg-brand-background border border-brand-border rounded text-[9px] font-black text-slate-500 uppercase tracking-widest italic hover:text-white hover:bg-slate-800 transition-all flex items-center justify-center gap-2"
                            >
                                <Info size={11} />
                                <span>Audit</span>
                            </button>
                            <button 
                                onClick={() => handleApply(structure)}
                                className="py-3 bg-brand-primary/10 border border-brand-primary/20 rounded text-[9px] font-black text-brand-primary uppercase tracking-widest italic hover:bg-brand-primary hover:text-white transition-all flex items-center justify-center gap-2"
                            >
                                <Send size={11} />
                                <span>Apply</span>
                            </button>
                        </div>
                    </motion.div>
                )) : (
                    <div className="col-span-full py-24 bg-brand-surface border border-brand-border border-dashed rounded-md flex flex-col items-center justify-center gap-4 text-slate-600 italic">
                        <Info size={32} strokeWidth={1} />
                        <p className="text-[11px] font-black uppercase tracking-widest">No structural definitions detected in fiscal database.</p>
                    </div>
                )}
            </div>

            {/* Billing Apply Modal */}
            <AnimatePresence>
                {applyModalData && (
                    <motion.div 
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md"
                    >
                        <motion.div 
                            initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
                            className="bg-[#0b0e14] border border-[#1e293b] rounded-xl p-0 w-full max-w-[450px] shadow-[0_25px_80px_rgba(0,0,0,0.8)] relative overflow-hidden"
                        >
                            <div className="flex items-center justify-between px-8 py-6 border-b border-[#1e293b]/50">
                                <h3 className="text-[16px] font-[900] text-white tracking-[0.05em] uppercase">Execute Fee Billing</h3>
                                <button onClick={() => setApplyModalData(null)} className="text-slate-500 hover:text-white transition-all"><X size={20} /></button>
                            </div>

                            <div className="p-8 space-y-7">
                                <div className="bg-[#111827] border border-[#3b82f6]/30 rounded-lg p-5">
                                    <p className="text-[11px] text-slate-300 leading-relaxed text-center font-medium">
                                        You are about to generate individual fee records for <span className="text-[#3b82f6] font-black">ALL STUDENTS</span> in <span className="text-[#3b82f6] font-black underline underline-offset-4 decoration-[#3b82f6]/40 italic">{applyModalData.standardId?.name || "Target Grade"}</span>. This action will populate their financial profiles based on the defined structure.
                                    </p>
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-[9px] font-[800] text-slate-400 uppercase tracking-widest">Academic Year Context</label>
                                    <div className="w-full bg-[#111827] border border-[#1f2937] rounded-lg px-4 py-3.5 text-xs font-bold text-slate-100 italic">
                                        {applyModalData.academicYear}
                                    </div>
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-[9px] font-[800] text-slate-400 uppercase tracking-widest">Billing Due Date</label>
                                    <input 
                                        type="date"
                                        value={applyDueDate}
                                        onChange={(e) => setApplyDueDate(e.target.value)}
                                        className="w-full bg-[#111827] border border-[#1f2937] rounded-lg px-4 py-3.5 text-xs font-bold text-slate-100 outline-none focus:border-[#3b82f6]/50 transition-all uppercase"
                                    />
                                </div>

                                <button 
                                    onClick={confirmApply}
                                    className="w-full bg-[#2563eb] hover:bg-[#1d4ed8] text-white rounded-lg py-4 text-sm font-[900] uppercase tracking-[0.05em] shadow-[0_4px_20px_rgba(37,99,235,0.3)] active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                                >
                                    Confirm & Apply Billing
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            <AnimatePresence>
                {isModalOpen && (
                    <motion.div 
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md"
                    >
                        <motion.div 
                            initial={{ scale: 0.95, opacity: 0, y: 30 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.95, opacity: 0, y: 30 }}
                            className="bg-[#0b0e14] border border-[#1e293b] rounded-xl p-0 w-full max-w-[500px] shadow-[0_25px_80px_rgba(0,0,0,0.8)] relative overflow-hidden flex flex-col"
                        >
                            {/* Form Header */}
                            <div className="flex items-center justify-between px-8 py-6 border-b border-[#1e293b]/50">
                                <h3 className="text-[17px] font-[900] text-white tracking-[0.05em] uppercase">
                                    Architect Fee Structure
                                </h3>
                                <button onClick={() => setIsModalOpen(false)} className="text-slate-500 hover:text-white transition-all transform hover:rotate-90">
                                    <X size={20} />
                                </button>
                            </div>

                            <form onSubmit={handleSubmit} className="p-8 space-y-7 overflow-y-auto custom-scrollbar max-h-[80vh]">
                                {/* Grade & Year Section */}
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-[9px] font-[800] text-slate-400 uppercase tracking-widest leading-none">Standard (Grade)</label>
                                        <div className="relative">
                                            <select 
                                                required
                                                value={formData.standardId}
                                                onChange={(e) => setFormData({ ...formData, standardId: e.target.value })}
                                                className="w-full bg-[#111827] border border-[#1f2937] rounded-lg px-4 py-3.5 text-xs font-semibold text-slate-100 outline-none focus:border-brand-primary transition-all appearance-none"
                                            >
                                                <option value="">Select Standard...</option>
                                                {standards.map(s => (
                                                    <option key={s._id} value={s._id}>{s.name || `Level ${s.level}`}</option>
                                                ))}
                                            </select>
                                            <ChevronDown size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[9px] font-[800] text-slate-400 uppercase tracking-widest leading-none">Academic Year</label>
                                        <input 
                                            type="text"
                                            required
                                            value={formData.academicYear}
                                            onChange={(e) => setFormData({ ...formData, academicYear: e.target.value })}
                                            className="w-full bg-[#111827] border border-[#1f2937] rounded-lg px-4 py-3.5 text-xs font-semibold text-slate-100 outline-none focus:border-brand-primary placeholder:text-slate-600 transition-all"
                                            placeholder="2024-2025"
                                        />
                                    </div>
                                </div>

                                {/* Due Date Section */}
                                <div className="space-y-2">
                                    <label className="text-[9px] font-[800] text-slate-400 uppercase tracking-widest leading-none">Structure Due Date</label>
                                    <div className="relative">
                                        <input 
                                            type="date"
                                            required
                                            value={formData.dueDate ? new Date(formData.dueDate).toISOString().split('T')[0] : ''}
                                            onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                                            className="w-full bg-[#111827] border border-[#1f2937] rounded-lg px-4 py-3.5 text-xs font-semibold text-slate-100 outline-none focus:border-brand-primary uppercase italic"
                                        />
                                    </div>
                                </div>

                                {/* Fee Items Section */}
                                <div className="space-y-4 pt-2">
                                    <div className="flex items-center justify-between">
                                        <label className="text-[9px] font-[800] text-slate-400 uppercase tracking-widest">Fee Items & Breakdowns</label>
                                        <button 
                                            type="button" 
                                            onClick={handleAddItem}
                                            className="text-[9px] font-[800] text-[#3b82f6] hover:text-[#2563eb] uppercase tracking-widest flex items-center gap-1.5 transition-colors"
                                        >
                                            + Add Component
                                        </button>
                                    </div>

                                    <div className="space-y-3">
                                        {formData.feeItems.map((item, idx) => (
                                            <div key={idx} className="flex items-center gap-2 group">
                                                <input 
                                                    type="text"
                                                    required
                                                    placeholder="Name"
                                                    value={item.name}
                                                    onChange={(e) => handleItemChange(idx, 'name', e.target.value)}
                                                    className="flex-grow bg-[#111827] border border-[#1f2937] rounded-lg px-4 py-3.5 text-xs font-semibold text-slate-100 outline-none focus:border-brand-primary transition-all"
                                                />
                                                <div className="w-24 relative">
                                                    <input 
                                                        type="number"
                                                        required
                                                        value={item.amount}
                                                        onChange={(e) => handleItemChange(idx, 'amount', e.target.value)}
                                                        className="w-full bg-[#111827] border border-[#1f2937] rounded-lg px-4 py-3.5 text-xs font-black text-slate-100 text-center outline-none focus:border-brand-primary"
                                                        placeholder="0"
                                                    />
                                                </div>
                                                <button 
                                                    type="button" 
                                                    onClick={() => handleRemoveItem(idx)}
                                                    className="p-2 text-slate-600 hover:text-rose-500 transition-colors opacity-0 group-hover:opacity-100"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Calculation Summary */}
                                <div className="bg-[#111827]/80 border border-[#1e293b] rounded-xl p-6 flex items-center justify-between shadow-inner">
                                    <span className="text-[10px] font-[900] text-[#3b82f6] uppercase tracking-[0.1em]">Total Annual Calculation</span>
                                    <span className="text-3xl font-[900] text-white italic tracking-tighter">
                                        ${formData.totalAmount.toLocaleString()}
                                    </span>
                                </div>

                                {/* Submit Button */}
                                <button 
                                    type="submit"
                                    className="w-full bg-white hover:bg-slate-200 text-black rounded-lg py-4 text-sm font-[900] uppercase tracking-[0.1em] shadow-[0_4px_20px_rgba(255,255,255,0.1)] active:scale-[0.98] transition-all"
                                >
                                    Establish Structure
                                </button>
                            </form>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Audit Detail Modal (Existing) */}
            <AnimatePresence>
                {selectedStructure && (
                    <motion.div 
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
                    >
                        <motion.div 
                            initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }}
                            className="bg-brand-surface border border-brand-border rounded-md p-8 w-full max-w-lg shadow-[0_0_50px_rgba(0,0,0,0.5)] relative overflow-hidden"
                        >
                            <div className="absolute top-0 left-0 w-1 h-full bg-brand-primary"></div>
                            
                            <div className="flex items-start justify-between mb-8">
                                <div>
                                    <h3 className="text-xl font-black text-slate-100 italic uppercase tracking-tighter leading-none mb-1">Fiscal Audit Node</h3>
                                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest italic underline decoration-brand-primary/30 underline-offset-4">Structural breakdown for {selectedStructure.standardId?.name || `Grade Node ${selectedStructure.standardId?.level}`}.</p>
                                </div>
                                <button onClick={() => setSelectedStructure(null)} className="p-1 hover:text-brand-primary transition-all text-slate-600"><X size={20} /></button>
                            </div>

                            <div className="bg-brand-background/50 rounded-md border border-brand-border overflow-hidden mb-8">
                                <div className="px-5 py-3 border-b border-brand-border bg-brand-background flex items-center justify-between text-[10px] font-black text-slate-500 uppercase tracking-widest italic">
                                    <span>Asset Identity</span>
                                    <span>Quantum ($)</span>
                                </div>
                                <div className="divide-y divide-brand-border/40 max-h-[300px] overflow-y-auto custom-scrollbar">
                                    {selectedStructure.feeItems?.map((item, idx) => (
                                        <div key={idx} className="px-5 py-4 flex items-center justify-between group hover:bg-brand-primary/5 transition-all">
                                            <span className="text-[11px] font-bold text-slate-300 uppercase italic tracking-tight">{item.name}</span>
                                            <span className="text-sm font-black text-slate-100 italic tracking-tighter">${item.amount?.toLocaleString()}</span>
                                        </div>
                                    ))}
                                </div>
                                <div className="px-5 py-4 bg-brand-primary/5 border-t border-brand-primary/10 flex items-center justify-between">
                                    <span className="text-[11px] font-black text-brand-primary uppercase italic tracking-wider">Total Aggregated Capital</span>
                                    <span className="text-lg font-black text-slate-100 italic tracking-tighter">${selectedStructure.totalAmount?.toLocaleString()}</span>
                                </div>
                            </div>

                            <div className="flex items-center gap-4 p-4 bg-slate-900/50 rounded border border-brand-border border-dashed">
                                <div className="p-2 bg-brand-primary/10 rounded-full text-brand-primary">
                                    <ShieldCheck size={16} strokeWidth={3} />
                                </div>
                                <div className="text-left">
                                    <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest italic mb-1">Verified Structural Record</p>
                                    <p className="text-[9px] font-medium text-slate-500 leading-normal uppercase">This fee structure is verified as an active fiscal protocol. Modifications to this node will affect future inflow generations.</p>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Confirmation Modal */}
            <AnimatePresence>
                {confirmModal.show && (
                    <motion.div 
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md"
                    >
                        <motion.div 
                            initial={{ scale: 0.95, y: 10 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 10 }}
                            className="bg-brand-surface border border-brand-border rounded-md p-8 w-full max-w-md shadow-[0_0_100px_rgba(0,0,0,0.8)] relative"
                        >
                            <div className="flex items-center gap-4 mb-6 text-left">
                                <div className="w-12 h-12 rounded bg-luxury-rose/10 flex items-center justify-center text-luxury-rose border border-luxury-rose/20">
                                    <AlertCircle size={24} />
                                </div>
                                <div>
                                    <h3 className="text-lg font-black text-slate-100 italic uppercase tracking-tighter leading-none mb-1">{confirmModal.title}</h3>
                                    <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest opacity-60">High-Level Administrative Authorization</span>
                                </div>
                            </div>
                            
                            <p className="text-xs font-bold text-slate-400 italic leading-relaxed mb-8 text-left uppercase tracking-tight opacity-70">
                                {confirmModal.message}
                            </p>

                            <div className="flex gap-3">
                                <button 
                                    onClick={() => setConfirmModal({ ...confirmModal, show: false })}
                                    className="flex-1 py-3 bg-brand-background border border-brand-border rounded text-[10px] font-black text-slate-500 uppercase tracking-widest italic hover:text-slate-100 transition-all font-outfit"
                                >
                                    Abort
                                </button>
                                <button 
                                    onClick={confirmModal.onConfirm}
                                    className="flex-1 py-3 bg-luxury-rose text-white rounded text-[10px] font-black uppercase tracking-[0.2em] italic shadow-xl shadow-luxury-rose/20 hover:bg-rose-500 transition-all font-outfit"
                                >
                                    {confirmModal.confirmText}
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
};

export default FeeStructures;
