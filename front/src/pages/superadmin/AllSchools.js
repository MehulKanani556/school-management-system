import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { fetchSchools, fetchStats, createSchool, deleteSchool, updateSchool } from '../../redux/slice/school.slice';
import {
    Plus, Trash2, School, Search, X, Upload, Check, Activity, AlertTriangle,
    Edit, LayoutGrid, List, Globe, DollarSign, Copy, Clock
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import Pagination from '../../components/Pagination';
import PortalModal from '../../components/PortalModal';
import { getImageUrl } from '../../utils/imageHelper';

const AllSchools = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { schools, loading, message } = useSelector((state) => state.school);

    const [searchTerm, setSearchTerm] = useState('');
    const [viewMode, setViewMode] = useState('grid');
    const [modalMode, setModalMode] = useState('create');
    const [isFormModalOpen, setIsFormModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [selectedSchool, setSelectedSchool] = useState(null);
    const [logoPreview, setLogoPreview] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [copiedSubdomain, setCopiedSubdomain] = useState(null);
    const itemsPerPage = 10;

    useEffect(() => {
        dispatch(fetchSchools());
        dispatch(fetchStats());
    }, [dispatch]);

    const handleCopySubdomain = (subdomain) => {
        navigator.clipboard.writeText(`https://${subdomain}.campus.edu`);
        setCopiedSubdomain(subdomain);
        setTimeout(() => setCopiedSubdomain(null), 2000);
    };

    const getTierDesign = (tier) => {
        switch (tier?.toLowerCase()) {
            case 'premium':
                return {
                    bg: 'bg-luxury-gold/10 border-luxury-gold/30 text-luxury-gold',
                    border: 'border-luxury-gold/40 hover:border-luxury-gold/70 group-hover:shadow-[0_0_15px_rgba(251,191,36,0.15)]',
                    ring: 'ring-2 ring-luxury-gold/30 border-luxury-gold/50',
                    label: 'PREMIUM LICENCE',
                    accentColor: 'text-luxury-gold',
                    price: '$499/mo',
                    sla: '99.99%',
                    latency: '8ms'
                };
            case 'standard':
                return {
                    bg: 'bg-brand-secondary/10 border-brand-secondary/30 text-brand-secondary',
                    border: 'border-brand-secondary/40 hover:border-brand-secondary/70 group-hover:shadow-[0_0_15px_rgba(124,58,237,0.15)]',
                    ring: 'ring-2 ring-brand-secondary/30 border-brand-secondary/50',
                    label: 'STANDARD LICENCE',
                    accentColor: 'text-brand-secondary',
                    price: '$249/mo',
                    sla: '99.95%',
                    latency: '18ms'
                };
            case 'basic':
            default:
                return {
                    bg: 'bg-brand-primary/10 border-brand-primary/30 text-brand-primary',
                    border: 'border-brand-border/60 hover:border-brand-primary/50 group-hover:shadow-[0_0_15px_rgba(88,166,255,0.15)]',
                    ring: 'ring-2 ring-brand-primary/30 border-brand-primary/50',
                    label: 'BASIC LICENCE',
                    accentColor: 'text-brand-primary',
                    price: '$99/mo',
                    sla: '99.90%',
                    latency: '42ms'
                };
        }
    };

    const TIER_PRICES = {
        basic: 99,
        standard: 249,
        premium: 499
    };
    const totalSchoolsCount = schools.length;
    const activeSchoolsCount = schools.filter(s => s.isActive).length;
    const cumulativeRevenue = schools.reduce((acc, s) => acc + (s.isActive ? (TIER_PRICES[s.subscriptionTier] || 0) : 0), 0);

    const premiumCount = schools.filter(s => s.subscriptionTier?.toLowerCase() === 'premium').length;
    const standardCount = schools.filter(s => s.subscriptionTier?.toLowerCase() === 'standard').length;
    const basicCount = schools.filter(s => s.subscriptionTier?.toLowerCase() === 'basic').length;

    const premiumPct = totalSchoolsCount ? Math.round((premiumCount / totalSchoolsCount) * 100) : 0;
    const standardPct = totalSchoolsCount ? Math.round((standardCount / totalSchoolsCount) * 100) : 0;
    const basicPct = totalSchoolsCount ? Math.round((basicCount / totalSchoolsCount) * 100) : 0;

    // Side effects for successful operations
    useEffect(() => {
        if (message) {
            if (isFormModalOpen) closeFormModal();
            if (isDeleteModalOpen) setIsDeleteModalOpen(false);
            dispatch(fetchStats());
        }
    }, [message]);

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
                dispatch(createSchool(formData));
            } else {
                dispatch(updateSchool({ id: selectedSchool._id, formData }));
            }
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
        dispatch(deleteSchool(selectedSchool._id));
    };

    const filteredSchools = schools.filter(s => s.name.toLowerCase().includes(searchTerm.toLowerCase()));

    const totalPages = Math.ceil(filteredSchools.length / itemsPerPage);
    const currentItems = filteredSchools.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

    // Reset page when search changes
    useEffect(() => { setCurrentPage(1); }, [searchTerm]);

    return (
        <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            className="relative min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950"
        >
            {/* Sophisticated Background Pattern */}
            <div className="absolute inset-0 opacity-20">
                <div className="absolute inset-0" style={{
                    backgroundImage: `radial-gradient(circle at 2px 2px, rgb(148 163 184 / 0.15) 1px, transparent 0)`,
                    backgroundSize: '48px 48px'
                }}></div>
            </div>

            {/* Floating Gradient Orbs - More Subtle */}
            <div className="absolute top-0 right-1/4 w-96 h-96 bg-brand-primary/10 rounded-full blur-[120px] animate-pulse"></div>
            <div className="absolute bottom-0 left-1/3 w-[500px] h-[500px] bg-brand-secondary/8 rounded-full blur-[140px] animate-pulse" style={{ animationDuration: '8s' }}></div>

            <div className="relative z-10 max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Compact Modern Header */}
                <div className="mb-8">
                    <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
                        {/* Title - Minimalist */}
                        <div>
                            <div className="flex items-center gap-3 mb-2">
                                <div className="w-1 h-12 bg-gradient-to-b from-brand-primary via-brand-secondary to-luxury-gold rounded-full"></div>
                                <div>
                                    <h1 className="text-4xl font-black text-white tracking-tight">
                                        School Registry
                                    </h1>
                                    <p className="text-sm text-slate-400 font-medium mt-1">
                                        {totalSchoolsCount} institutions • {activeSchoolsCount} active
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Compact Controls */}
                        <div className="flex items-center gap-3 flex-wrap">
                            {/* Search */}
                            <div className="relative">
                                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                                <input 
                                    type="text" 
                                    placeholder="Search..." 
                                    value={searchTerm} 
                                    onChange={(e) => setSearchTerm(e.target.value)} 
                                    className="bg-slate-800/50 border border-slate-700/50 focus:border-brand-primary/50 outline-none h-10 pl-9 pr-10 rounded-lg text-sm text-slate-200 w-64 transition-all placeholder:text-slate-500" 
                                />
                                {searchTerm && (
                                    <button
                                        onClick={() => setSearchTerm('')}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
                                    >
                                        <X size={14} />
                                    </button>
                                )}
                            </div>

                            {/* View Toggle - Minimal */}
                            <div className="flex bg-slate-800/50 border border-slate-700/50 rounded-lg p-1">
                                <button
                                    onClick={() => setViewMode('grid')}
                                    className={`p-2 rounded transition-all ${viewMode === 'grid' ? 'bg-brand-primary text-white' : 'text-slate-400 hover:text-slate-200'}`}
                                >
                                    <LayoutGrid size={16} />
                                </button>
                                <button
                                    onClick={() => setViewMode('list')}
                                    className={`p-2 rounded transition-all ${viewMode === 'list' ? 'bg-brand-primary text-white' : 'text-slate-400 hover:text-slate-200'}`}
                                >
                                    <List size={16} />
                                </button>
                            </div>

                            {/* Add Button - Bold */}
                            <button 
                                onClick={openCreateModal} 
                                className="flex items-center gap-2 bg-brand-primary hover:bg-brand-primary/90 text-white px-5 h-10 rounded-lg font-semibold text-sm transition-all active:scale-95"
                            >
                                <Plus size={18} />
                                <span>Add School</span>
                            </button>
                        </div>
                    </div>
                </div>



                {/* Schools Grid/List */}
                {viewMode === 'grid' ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {currentItems.map((school) => {
                            const tierDesign = getTierDesign(school.subscriptionTier);
                            return (
                                <motion.div 
                                    key={school._id} 
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ duration: 0.2 }}
                                    className="group relative bg-slate-800/40 backdrop-blur-sm border border-slate-700/50 hover:border-slate-600 rounded-xl p-5 transition-all duration-300 hover:shadow-xl hover:-translate-y-1"
                                >
                                    {/* Top Badge Row */}
                                    <div className="flex items-center justify-end mb-4">
                                        <div className={`flex items-center gap-1.5 px-2 py-1 rounded-full text-[10px] font-medium ${
                                            school.isActive 
                                                ? 'bg-emerald-500/10 text-emerald-400' 
                                                : 'bg-slate-700/50 text-slate-400'
                                        }`}>
                                            <span className={`w-1.5 h-1.5 rounded-full ${school.isActive ? 'bg-emerald-400 animate-pulse' : 'bg-slate-500'}`}></span>
                                            {school.isActive ? 'LIVE' : 'OFF'}
                                        </div>
                                    </div>

                                    {/* Logo */}
                                    <div className="flex justify-center mb-4">
                                        <div className="w-16 h-16 rounded-xl bg-slate-900/50 border border-slate-700/50 flex items-center justify-center overflow-hidden group-hover:scale-105 transition-transform">
                                            {getImageUrl(school.logo) ? (
                                                <img src={getImageUrl(school.logo)} alt="" className="w-full h-full object-cover" />
                                            ) : (
                                                <School size={28} className="text-slate-500" />
                                            )}
                                        </div>
                                    </div>

                                    {/* School Info */}
                                    <div className="text-center mb-4">
                                        <h4 className="font-bold text-base text-white mb-2 line-clamp-1" title={school.name}>
                                            {school.name}
                                        </h4>
                                        <div className="flex items-center justify-center gap-1.5 text-xs text-slate-400">
                                            <Globe size={12} className="text-slate-500" />
                                            <span className="font-mono truncate">{school.subdomain}.campus.edu</span>
                                            <button
                                                onClick={(e) => { e.stopPropagation(); handleCopySubdomain(school.subdomain); }}
                                                className="text-slate-500 hover:text-brand-primary transition-colors"
                                            >
                                                {copiedSubdomain === school.subdomain ? (
                                                    <Check size={12} className="text-emerald-400" />
                                                ) : (
                                                    <Copy size={12} />
                                                )}
                                            </button>
                                        </div>
                                    </div>

                                    {/* Admin */}
                                    <div className="border-t border-slate-700/50 pt-3 mb-4">
                                        <div className="text-[10px] text-slate-500 mb-1">Administrator</div>
                                        <div className="text-xs text-slate-300 truncate" title={school.adminEmail}>{school.adminEmail}</div>
                                    </div>

                                    {/* Actions */}
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => navigate(`/superadmin/schools/${school._id}`)}
                                            className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg bg-brand-primary/20 hover:bg-brand-primary/30 border border-brand-primary/30 hover:border-brand-primary/50 text-brand-primary hover:text-brand-primary text-xs font-medium transition-all"
                                        >
                                            <School size={14} />
                                            <span>View</span>
                                        </button>
                                        {/* <button
                                            onClick={() => openEditModal(school)}
                                            className="flex items-center justify-center p-2 rounded-lg bg-slate-700/30 hover:bg-slate-700/50 border border-slate-600/50 hover:border-slate-500 text-slate-300 hover:text-white transition-all"
                                            title="Edit"
                                        >
                                            <Edit size={14} />
                                        </button>
                                        <button
                                            onClick={() => openDeleteModal(school)}
                                            className="flex items-center justify-center p-2 rounded-lg bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 hover:border-red-500/30 text-red-400 hover:text-red-300 transition-all"
                                            title="Delete"
                                        >
                                            <Trash2 size={14} />
                                        </button> */}
                                    </div>
                                </motion.div>
                            );
                        })}
                    </div>
                ) : (
                    <div className="space-y-3">
                        {currentItems.map((school) => {
                            const tierDesign = getTierDesign(school.subscriptionTier);
                            return (
                                <motion.div 
                                    key={school._id}
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ duration: 0.2 }}
                                    className="bg-slate-800/40 backdrop-blur-sm border border-slate-700/50 hover:border-slate-600 rounded-xl p-4 flex items-center gap-4 transition-all duration-300 hover:shadow-lg"
                                >
                                    {/* Logo */}
                                    <div className="w-12 h-12 rounded-lg bg-slate-900/50 border border-slate-700/50 flex items-center justify-center overflow-hidden flex-shrink-0">
                                        {getImageUrl(school.logo) ? (
                                            <img src={getImageUrl(school.logo)} alt="" className="w-full h-full object-cover" />
                                        ) : (
                                            <School size={20} className="text-slate-500" />
                                        )}
                                    </div>

                                    {/* Info */}
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 mb-1">
                                            <h4 className="font-bold text-white truncate" title={school.name}>{school.name}</h4>
                                        </div>
                                        <div className="flex items-center gap-3 text-xs text-slate-400">
                                            <div className="flex items-center gap-1">
                                                <Globe size={11} />
                                                <span className="font-mono">{school.subdomain}.campus.edu</span>
                                                <button
                                                    onClick={(e) => { e.stopPropagation(); handleCopySubdomain(school.subdomain); }}
                                                    className="text-slate-500 hover:text-brand-primary transition-colors"
                                                >
                                                    {copiedSubdomain === school.subdomain ? (
                                                        <Check size={10} className="text-emerald-400" />
                                                    ) : (
                                                        <Copy size={10} />
                                                    )}
                                                </button>
                                            </div>
                                            <span>•</span>
                                            <span>{school.adminEmail}</span>
                                        </div>
                                    </div>

                                    {/* Status */}
                                    <div className="flex items-center gap-3">
                                        <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-medium ${
                                            school.isActive 
                                                ? 'bg-emerald-500/10 text-emerald-400' 
                                                : 'bg-slate-700/50 text-slate-400'
                                        }`}>
                                            <span className={`w-1.5 h-1.5 rounded-full ${school.isActive ? 'bg-emerald-400 animate-pulse' : 'bg-slate-500'}`}></span>
                                            {school.isActive ? 'LIVE' : 'OFF'}
                                        </div>
                                    </div>

                                    {/* Actions */}
                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={() => navigate(`/superadmin/schools/${school._id}`)}
                                            className="px-3 py-2 rounded-lg bg-brand-primary/20 hover:bg-brand-primary/30 border border-brand-primary/30 hover:border-brand-primary/50 text-brand-primary hover:text-brand-primary text-xs font-medium transition-all"
                                            title="View Details"
                                        >
                                            <School size={16} />
                                        </button>
                                        <button
                                            onClick={() => openEditModal(school)}
                                            className="p-2 rounded-lg bg-slate-700/30 hover:bg-slate-700/50 border border-slate-600/50 hover:border-slate-500 text-slate-400 hover:text-white transition-all"
                                            title="Edit"
                                        >
                                            <Edit size={16} />
                                        </button>
                                        <button
                                            onClick={() => openDeleteModal(school)}
                                            className="p-2 rounded-lg bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 hover:border-red-500/30 text-red-400 hover:text-red-300 transition-all"
                                            title="Delete"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </motion.div>
                            );
                        })}
                    </div>
                )}

                {/* Pagination */}
                <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={setCurrentPage}
                    itemsPerPage={itemsPerPage}
                    totalItems={filteredSchools.length}
                />
            </div>

            {/* School Form Modal (Create/Edit) */}
            <PortalModal isOpen={isFormModalOpen} onClose={closeFormModal} maxWidth="max-w-xl">
                <div className="p-8 xs:p-10 overflow-y-auto">
                    <div className="flex justify-between items-start mb-6 xs:mb-8">
                        <div>
                            <h3 className="text-2xl xs:text-3xl font-bold tracking-tighter text-slate-100 font-inter uppercase mb-1">
                                {modalMode === 'create' ? 'Add School' : 'Edit School'}
                            </h3>
                            <p className="text-slate-500 text-[9px] xs:text-[10px] font-bold uppercase tracking-widest">
                                Configuration Node Parameters
                            </p>
                        </div>
                        <button onClick={closeFormModal} className="p-2 xs:p-3 text-slate-400 hover:bg-brand-background rounded-md transition-colors">
                            <X size={20} />
                        </button>
                    </div>

                    {/* Live Preview Card */}
                    <div className="border border-brand-border/80 rounded-xl p-4 bg-brand-background/40 mb-6 backdrop-blur-sm">
                        <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest block mb-2 font-mono">Institutional Node Preview Gateway</span>
                        <div className="flex items-center justify-between gap-3">
                            <div className="flex items-center gap-3 min-w-0">
                                <div className="w-10 h-10 rounded-lg bg-brand-surface border border-brand-border flex items-center justify-center overflow-hidden flex-shrink-0">
                                    {logoPreview ? <img src={getImageUrl(logoPreview)} alt="" className="w-full h-full object-cover" /> : <School size={16} className="text-slate-500" />}
                                </div>
                                <div className="min-w-0">
                                    <h4 className="font-extrabold text-xs text-slate-200 truncate leading-none mb-1">
                                        {formik.values.name || 'Your School Name'}
                                    </h4>
                                    <div className="flex items-center gap-1 text-[9px] font-mono text-slate-500 lowercase">
                                        <Globe size={9} />
                                        <span>{formik.values.subdomain || 'subdomain'}.campus.edu</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <form onSubmit={formik.handleSubmit} className="space-y-5 xs:space-y-6">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 xs:gap-6">
                            <div className="space-y-1.5">
                                <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest ml-1">Institution Identity</p>
                                <input type="text" {...formik.getFieldProps('name')} placeholder="School Alias..." className="bg-brand-background/60 border border-brand-border py-2.5 xs:py-3 px-4 rounded-md text-sm font-medium w-full outline-none focus:border-brand-primary text-slate-100" />
                                {formik.touched.name && formik.errors.name && (
                                    <p className="text-[10px] text-luxury-rose mt-1">{formik.errors.name}</p>
                                )}
                            </div>
                            <div className="space-y-1.5">
                                <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest ml-1">Subdomain</p>
                                <input type="text" {...formik.getFieldProps('subdomain')} disabled={modalMode === 'edit'} placeholder="subdomain.campus..." className="bg-brand-background/60 border border-brand-border py-2.5 xs:py-3 px-4 rounded-md text-sm font-medium w-full outline-none focus:border-brand-primary disabled:opacity-40 text-slate-100 font-mono lowercase" />
                                {formik.touched.subdomain && formik.errors.subdomain && (
                                    <p className="text-[10px] text-luxury-rose mt-1">{formik.errors.subdomain}</p>
                                )}
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest ml-1">Administrator Registry Access</p>
                            <input type="email" {...formik.getFieldProps('adminEmail')} placeholder="Email Registration..." className="bg-brand-background/60 border border-brand-border py-2.5 xs:py-3 px-4 rounded-md text-sm font-medium w-full outline-none focus:border-brand-primary text-slate-100" />
                            {formik.touched.adminEmail && formik.errors.adminEmail && (
                                <p className="text-[10px] text-luxury-rose mt-1">{formik.errors.adminEmail}</p>
                            )}
                        </div>

                        {/* Logo Upload */}
                        <div className="relative group border border-dashed border-brand-border rounded-md p-6 xs:p-8 flex flex-col items-center justify-center cursor-pointer hover:bg-brand-primary/5 hover:border-brand-primary transition-all">
                            <input type="file" onChange={(e) => { const f = e.currentTarget.files[0]; if (f) { formik.setFieldValue('logo', f); setLogoPreview(URL.createObjectURL(f)); } }} className="absolute inset-0 opacity-0 cursor-pointer" />
                            {getImageUrl(logoPreview) ? <img src={getImageUrl(logoPreview)} alt="" className="w-14 h-14 xs:w-16 xs:h-16 rounded-md object-cover mb-3 shadow-md border border-brand-border" /> : <div className="p-3 xs:p-4 rounded-md bg-slate-800 mb-3 group-hover:bg-brand-primary/10 transition-colors"><Upload className="text-slate-400 group-hover:text-brand-primary transition-all" size={24} /></div>}
                            <p className="text-[9px] xs:text-[10px] font-bold text-slate-500 uppercase tracking-widest italic">School Logo</p>
                        </div>

                        {/* Submit Button */}
                        <button type="submit" disabled={loading} className="w-full py-4 rounded-md bg-brand-primary hover:bg-superadmin-primary text-white font-bold uppercase tracking-[0.2em] xs:tracking-[0.3em] shadow-lg text-xs active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-3 transition-all">
                            {loading ? <Activity className="animate-spin" size={18} /> : (
                                <span className="flex items-center gap-2">
                                    {modalMode === 'create' ? 'ADD SCHOOL' : 'UPDATE SCHOOL'}
                                    <Check size={18} />
                                </span>
                            )}
                        </button>
                    </form>
                </div>
            </PortalModal>

            {/* Confirm Delete Modal */}
            <PortalModal isOpen={isDeleteModalOpen} onClose={() => setIsDeleteModalOpen(false)} maxWidth="max-w-sm">
                <div className="p-8 xs:p-10 text-center">
                    <div className="w-16 h-16 xs:w-20 xs:h-20 rounded-md bg-red-500/10 flex items-center justify-center mx-auto mb-6 xs:mb-8 text-luxury-rose">
                        <AlertTriangle size={36} />
                    </div>
                    <h3 className="text-xl xs:text-2xl font-bold italic font-inter tracking-tighter mb-2 text-slate-100 uppercase leading-none">Delete School?</h3>
                    <p className="text-slate-400 text-[10px] xs:text-[11px] leading-relaxed mb-8 xs:mb-10 font-medium uppercase tracking-[0.1em]">
                        Are you sure you want to delete this school? This action cannot be undone.
                    </p>
                    <div className="grid grid-cols-2 gap-4">
                        <button onClick={() => setIsDeleteModalOpen(false)} className="py-3.5 xs:py-4 rounded-md bg-brand-background border border-brand-border font-bold uppercase text-[9px] text-slate-400 hover:bg-slate-800 transition-all tracking-widest">Cancel</button>
                        <button onClick={confirmDelete} className="py-3.5 xs:py-4 rounded-md bg-luxury-rose hover:bg-red-700 text-white font-bold uppercase text-[9px] shadow-lg active:scale-95 tracking-widest">Delete</button>
                    </div>
                </div>
            </PortalModal>
        </motion.div>
    );
};

export default AllSchools;
