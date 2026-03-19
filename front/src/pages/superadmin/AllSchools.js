import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchSchools, fetchStats, createSchool, deleteSchool, updateSchool, clearSchoolError } from '../../redux/slice/school.slice';
import {
    Plus, Trash2, School, Search, X, Upload, Check, Activity, AlertTriangle,
    Edit
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import toast from 'react-hot-toast';

const AllSchools = () => {
    const dispatch = useDispatch();
    const { schools, loading, error } = useSelector((state) => state.school);

    const [searchTerm, setSearchTerm] = useState('');
    const [modalMode, setModalMode] = useState('create');
    const [isFormModalOpen, setIsFormModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [selectedSchool, setSelectedSchool] = useState(null);
    const [logoPreview, setLogoPreview] = useState(null);

    useEffect(() => {
        dispatch(fetchSchools());
    }, [dispatch]);

    useEffect(() => {
        if (error) {
            toast.error(error);
            dispatch(clearSchoolError());
        }
    }, [error, dispatch]);

    const formik = useFormik({
        initialValues: { name: '', subdomain: '', adminEmail: '', subscriptionTier: 'basic', logo: null },
        validationSchema: Yup.object({
            name: Yup.string().required('School name is required'),
            subdomain: Yup.string().when('modalMode', {
                is: 'create',
                then: () => Yup.string().required('Subdomain is required').matches(/^[a-z0-9]+$/, 'Lowercase & numbers only')
            }),
            adminEmail: Yup.string().email('Invalid email').required('Admin email is required'),
            subscriptionTier: Yup.string().oneOf(['basic', 'standard', 'premium']).required()
        }),
        onSubmit: async (values) => {
            const formData = new FormData();
            Object.keys(values).forEach(key => {
                if (values[key] !== null) formData.append(key, values[key]);
            });

            if (modalMode === 'create') {
                const result = await dispatch(createSchool(formData));
                if (createSchool.fulfilled.match(result)) {
                    toast.success('School deployed');
                    closeFormModal();
                }
            } else {
                const result = await dispatch(updateSchool({ id: selectedSchool._id, formData }));
                if (updateSchool.fulfilled.match(result)) {
                    toast.success('School updated');
                    closeFormModal();
                }
            }
            dispatch(fetchStats());
        }
    });

    const openCreateModal = () => {
        setModalMode('create');
        formik.resetForm();
        setLogoPreview(null);
        setIsFormModalOpen(true);
    };

    const openEditModal = (school) => {
        setModalMode('edit');
        setSelectedSchool(school);
        formik.setValues({
            name: school.name,
            subdomain: school.subdomain,
            adminEmail: school.adminEmail,
            subscriptionTier: school.subscriptionTier,
            logo: null
        });
        setLogoPreview(school.logo);
        setIsFormModalOpen(true);
    };

    const closeFormModal = () => {
        setIsFormModalOpen(false);
        setSelectedSchool(null);
        setLogoPreview(null);
    };

    const openDeleteModal = (school) => {
        setSelectedSchool(school);
        setIsDeleteModalOpen(true);
    };

    const confirmDelete = async () => {
        const result = await dispatch(deleteSchool(selectedSchool._id));
        if (deleteSchool.fulfilled.match(result)) {
            toast.success('Instance decommissioned');
            setIsDeleteModalOpen(false);
            setSelectedSchool(null);
            dispatch(fetchStats());
        }
    };

    const filteredSchools = schools.filter(s => s.name.toLowerCase().includes(searchTerm.toLowerCase()));

    return (
        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} >
            <div className="space-y-8 xs:space-y-10">
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-2">
                    <div className="flex flex-col">
                        <h1 className="text-2xl xs:text-3xl font-bold tracking-tight text-slate-100 font-inter italic uppercase">School Registry</h1>
                        <p className="text-[11px] xs:text-sm font-medium text-slate-400 mt-1 tracking-wide">Manage global educational nodes and infrastructure instances.</p>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
                        <div className="relative group w-full sm:w-64">
                            <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-brand-primary transition-colors" />
                            <input type="text" placeholder="Locate Node..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="bg-brand-surface border border-brand-border focus:border-brand-primary/60 outline-none h-11 pl-11 pr-4 rounded-lg text-xs font-semibold text-slate-100 w-full shadow-2xl transition-all" />
                        </div>
                        <button onClick={openCreateModal} className="flex items-center justify-center gap-3 bg-brand-primary hover:bg-blue-700 text-white px-8 h-11 rounded-lg font-bold tracking-widest uppercase text-[11px] transition-all shadow-lg active:scale-95 group"><Plus size={18} className="group-hover:rotate-90 transition-transform" /> Provision</button>
                    </div>
                </div>

                <div className="bg-brand-surface border border-brand-border rounded-lg shadow-2xl overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left min-w-[600px]">
                            <thead>
                                <tr className="bg-brand-background/50 border-b border-brand-border">
                                    <th className="px-5 xs:px-6 py-4 text-[9px] xs:text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                                        School Identity
                                    </th>
                                    <th className="px-5 xs:px-6 py-4 text-[9px] xs:text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                                        Node Status
                                    </th>
                                    <th className="px-5 xs:px-6 py-4 text-[9px] xs:text-[10px] font-bold text-slate-500 uppercase tracking-widest text-right">
                                        Settings
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-brand-border">
                                {filteredSchools.map((school) => (
                                    <tr key={school._id} className="group hover:bg-brand-background/40 transition-colors">
                                        <td className="px-5 xs:px-6 py-5 xs:py-6">
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 xs:w-11 xs:h-11 rounded-lg bg-brand-background border border-brand-border flex items-center justify-center overflow-hidden flex-shrink-0 group-hover:border-brand-primary/40 transition-colors shadow-sm">
                                                    {school.logo ? <img src={school.logo} alt="" className="w-full h-full object-cover" /> : <School size={18} className="text-slate-500" />}
                                                </div>
                                                <div>
                                                    <p className="font-bold text-sm text-slate-100 font-inter leading-none mb-1.5 group-hover:text-brand-primary transition-colors">
                                                        {school.name}
                                                    </p>
                                                    <p className="text-[10px] xs:text-[11px] font-medium text-slate-500 opacity-80">
                                                        {school.subdomain}
                                                    </p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-5 xs:px-6 py-5 xs:py-6">
                                            <div className="flex items-center gap-3">
                                                <div className={`w-1.5 h-1.5 rounded-full ${school.isActive ? 'bg-luxury-emerald animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.5)]' : 'bg-slate-600'}`}></div>
                                                <span className="text-[9px] xs:text-[10px] font-bold uppercase text-slate-400 tracking-widest italic">
                                                    {school.isActive ? 'OPERATIONAL' : 'OFFLINE'}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-5 xs:px-6 py-5 xs:py-6 text-right">
                                            <div className="flex justify-end gap-2 opacity-100 lg:opacity-0 group-hover:opacity-100 transition-all transform lg:group-hover:translate-x-[-4px]">
                                                <button onClick={() => openEditModal(school)} className="p-2 xs:p-2.5 rounded-lg border border-brand-border bg-brand-surface hover:border-brand-primary hover:text-brand-primary transition-all shadow-sm text-slate-400"><Edit size={16} /></button>
                                                <button onClick={() => openDeleteModal(school)} className="p-2 xs:p-2.5 rounded-lg border border-brand-border bg-brand-surface hover:text-luxury-rose hover:border-luxury-rose transition-all shadow-sm text-slate-400"><Trash2 size={16} /></button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* School Form Modal (Create/Edit) */}
            <AnimatePresence>
                {isFormModalOpen && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 xs:p-6">
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={closeFormModal} className="absolute inset-0 bg-black/60 backdrop-blur-md" />
                        <motion.div initial={{ scale: 0.98, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.98, opacity: 0 }} className="relative w-full max-w-xl bg-brand-surface border border-brand-border rounded-lg shadow-2xl p-8 xs:p-10 overflow-hidden max-h-[90vh] overflow-y-auto">
                            <div className="flex justify-between items-start mb-6 xs:mb-8"><div><h3 className="text-2xl xs:text-3xl font-bold tracking-tighter text-slate-100 font-inter lowercase italic mb-1">{modalMode === 'create' ? 'Provision instance' : 'Sync node mapping'}</h3><p className="text-slate-500 text-[9px] xs:text-[10px] font-bold uppercase tracking-widest">Global Registry Entry</p></div><button onClick={closeFormModal} className="p-2 xs:p-3 text-slate-400 hover:bg-brand-background rounded-lg transition-colors"><X size={20} /></button></div>
                            <form onSubmit={formik.handleSubmit} className="space-y-5 xs:space-y-6">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 xs:gap-6">
                                    <div className="space-y-1.5"><p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest ml-1">Institution Identity</p><input type="text" {...formik.getFieldProps('name')} placeholder="School Alias..." className="bg-brand-background/60 border border-brand-border py-2.5 xs:py-3 px-4 rounded-lg text-sm font-medium w-full outline-none focus:border-brand-primary text-slate-100" /></div>
                                    <div className="space-y-1.5"><p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest ml-1">Node Domain Path</p><input type="text" {...formik.getFieldProps('subdomain')} disabled={modalMode === 'edit'} placeholder="subdomain.campus..." className="bg-brand-background/60 border border-brand-border py-2.5 xs:py-3 px-4 rounded-lg text-sm font-medium w-full outline-none focus:border-brand-primary disabled:opacity-40 text-slate-100" /></div>
                                </div>
                                <div className="space-y-1.5"><p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest ml-1">Administrator Registry Access</p><input type="email" {...formik.getFieldProps('adminEmail')} placeholder="Email Registration..." className="bg-brand-background/60 border border-brand-border py-2.5 xs:py-3 px-4 rounded-lg text-sm font-medium w-full outline-none focus:border-brand-primary text-slate-100" /></div>
                                <div className="relative group border border-dashed border-brand-border rounded-lg p-6 xs:p-8 flex flex-col items-center justify-center cursor-pointer hover:bg-brand-primary/5 hover:border-brand-primary transition-all">
                                    <input type="file" onChange={(e) => { const f = e.currentTarget.files[0]; if (f) { formik.setFieldValue('logo', f); setLogoPreview(URL.createObjectURL(f)); } }} className="absolute inset-0 opacity-0 cursor-pointer" />
                                    {logoPreview ? <img src={logoPreview} alt="" className="w-14 h-14 xs:w-16 xs:h-16 rounded-lg object-cover mb-3 shadow-md border border-brand-border" /> : <div className="p-3 xs:p-4 rounded-full bg-slate-800 mb-3 group-hover:bg-brand-primary/10 transition-colors"><Upload className="text-slate-400 group-hover:text-brand-primary transition-all" size={24} /></div>}
                                    <p className="text-[9px] xs:text-[10px] font-bold text-slate-500 uppercase tracking-widest italic">Institutional Branding Identifier</p>
                                </div>
                                <button type="submit" disabled={loading} className="w-full py-4 rounded-lg bg-brand-primary hover:bg-blue-700 text-white font-bold uppercase tracking-[0.2em] xs:tracking-[0.3em] shadow-lg text-xs active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-3 transition-all">{loading ? <Activity className="animate-spin" size={18} /> : <>{modalMode === 'create' ? 'ACTIVATE PROVISIONING' : 'PUSH NODE UPDATES'} <Check size={18} /></>}</button>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Confirm Delete Modal */}
            <AnimatePresence>
                {isDeleteModalOpen && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsDeleteModalOpen(false)} className="absolute inset-0 bg-black/60 backdrop-blur-md" />
                        <motion.div initial={{ scale: 0.98, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.98, opacity: 0 }} className="relative w-full max-w-sm bg-brand-surface border border-brand-border rounded-lg shadow-2xl p-8 xs:p-10 text-center overflow-hidden">
                            <div className="w-16 h-16 xs:w-20 xs:h-20 rounded-full bg-red-500/10 flex items-center justify-center mx-auto mb-6 xs:mb-8 text-luxury-rose"><AlertTriangle size={36} /></div>
                            <h3 className="text-xl xs:text-2xl font-bold italic font-inter tracking-tighter mb-2 text-slate-100 uppercase leading-none">Terminate School?</h3>
                            <p className="text-slate-400 text-[10px] xs:text-[11px] leading-relaxed mb-8 xs:mb-10 font-medium uppercase tracking-[0.1em]">Instance mapping for <span className="text-brand-primary font-bold">{selectedSchool?.name}</span> will be permanently archived. Action is Definitive.</p>
                            <div className="grid grid-cols-2 gap-4">
                                <button onClick={() => setIsDeleteModalOpen(false)} className="py-3.5 xs:py-4 rounded-lg bg-brand-background border border-brand-border font-bold uppercase text-[9px] text-slate-400 hover:bg-slate-800 transition-all tracking-widest">Cancel Access</button>
                                <button onClick={confirmDelete} className="py-3.5 xs:py-4 rounded-lg bg-luxury-rose hover:bg-red-700 text-white font-bold uppercase text-[9px] shadow-lg active:scale-95 tracking-widest">Terminate</button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </motion.div>
    );
};

export default AllSchools;
