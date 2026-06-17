import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchSchools, updateSchool, deleteSchool, clearSchoolMessage } from '../../redux/slice/school.slice';
import {
    ArrowLeft, School, Globe, Activity, DollarSign, Clock, Copy, Check,
    Edit, Trash2, Calendar, Users, BookOpen, Settings, TrendingUp, 
    Database, Shield, Zap, AlertTriangle, Upload, X, Mail, MessageSquare,
    CreditCard, Plus
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import PortalModal from '../../components/PortalModal';
import { getImageUrl } from '../../utils/imageHelper';

const defaultGradingScale = [
    { grade: 'A+', minPercent: 0 },
    { grade: 'A', minPercent: 0 },
    { grade: 'B+', minPercent: 0 },
    { grade: 'B', minPercent: 0 },
    { grade: 'C', minPercent: 0 },
    { grade: 'D', minPercent: 0 }
];

const SchoolDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { schools, loading, message } = useSelector((state) => state.school);
    const [copiedText, setCopiedText] = useState('');
    const [isFormModalOpen, setIsFormModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [logoPreview, setLogoPreview] = useState(null);
    const [activeTab, setActiveTab] = useState('general');
    const [fetchAttempted, setFetchAttempted] = useState(false);

    useEffect(() => {
        if (schools.length === 0 && !loading && !fetchAttempted) {
            dispatch(fetchSchools());
            setFetchAttempted(true);
        } else if (schools.length > 0) {
            setFetchAttempted(true);
        }
    }, [dispatch, schools.length, loading, fetchAttempted]);

    const school = schools.find(s => s._id === id);

    const formik = useFormik({
        initialValues: { 
            name: '', 
            subdomain: '', 
            adminEmail: '', 
            subscriptionTier: 'basic', 
            logo: null,
            address: '',
            contact: '',
            settings: {
                emailNotifications: false,
                smsNotifications: false,
                libraryFinePerDay: 0,
                paymentGateway: 'stripe',
                gradingScale: []
            }
        },
        validationSchema: Yup.object({
            name: Yup.string().required('School name is required'),
            adminEmail: Yup.string().email('Invalid email').required('Admin email is required'),
            address: Yup.string().nullable(),
            contact: Yup.string().nullable(),
            settings: Yup.object().shape({
                emailNotifications: Yup.boolean(),
                smsNotifications: Yup.boolean(),
                libraryFinePerDay: Yup.number().min(0, 'Fine cannot be negative'),
                paymentGateway: Yup.string(),
                gradingScale: Yup.array().of(
                    Yup.object().shape({
                        grade: Yup.string().required('Grade is required'),
                        minPercent: Yup.number().min(0).max(100).required('Percentage is required')
                    })
                )
            })
        }),
        onSubmit: async (values) => {
            if (!school?._id) return;
            const formData = new FormData();
            Object.keys(values).forEach(key => {
                if (key === 'settings') {
                    formData.append('settings', JSON.stringify(values[key]));
                } else if (values[key] !== null) {
                    formData.append(key, values[key]);
                }
            });
            dispatch(updateSchool({ id: school._id, formData }));
        }
    });

    useEffect(() => {
        if (message) {
            if (isFormModalOpen) {
                setIsFormModalOpen(false);
                setLogoPreview(null);
            }
            if (isDeleteModalOpen) {
                setIsDeleteModalOpen(false);
                navigate('/superadmin/schools');
            }
            dispatch(clearSchoolMessage());
        }
    }, [message, isFormModalOpen, isDeleteModalOpen, navigate, dispatch]);

    const openEditModal = () => {
        if (!school) return;
        formik.setValues({
            name: school.name,
            subdomain: school.subdomain,
            adminEmail: school.adminEmail,
            subscriptionTier: school.subscriptionTier || 'basic',
            logo: null,
            address: school.address || '',
            contact: school.contact || '',
            settings: {
                emailNotifications: school.settings?.emailNotifications || false,
                smsNotifications: school.settings?.smsNotifications || false,
                libraryFinePerDay: school.settings?.libraryFinePerDay || 0,
                paymentGateway: school.settings?.paymentGateway || 'stripe',
                gradingScale: school.settings?.gradingScale && school.settings.gradingScale.length > 0
                    ? school.settings.gradingScale.map(g => ({ grade: g.grade, minPercent: g.minPercent }))
                    : defaultGradingScale
            }
        });
        setLogoPreview(school.logo);
        setActiveTab('general');
        setIsFormModalOpen(true);
    };

    const closeFormModal = () => {
        setIsFormModalOpen(false);
        setLogoPreview(null);
    };

    const confirmDelete = async () => {
        if (school?._id) {
            dispatch(deleteSchool(school._id));
        }
    };

    const handleCopy = (text, label) => {
        navigator.clipboard.writeText(text);
        setCopiedText(label);
        setTimeout(() => setCopiedText(''), 2000);
    };

    const getTierDesign = (tier) => {
        switch (tier?.toLowerCase()) {
            case 'premium':
                return {
                    bg: 'bg-luxury-gold/10 border-luxury-gold/30 text-luxury-gold',
                    accentColor: 'text-luxury-gold',
                    price: '$499/mo',
                    sla: '99.99%',
                    latency: '8ms'
                };
            case 'standard':
                return {
                    bg: 'bg-brand-secondary/10 border-brand-secondary/30 text-brand-secondary',
                    accentColor: 'text-brand-secondary',
                    price: '$249/mo',
                    sla: '99.95%',
                    latency: '18ms'
                };
            case 'basic':
            default:
                return {
                    bg: 'bg-brand-primary/10 border-brand-primary/30 text-brand-primary',
                    accentColor: 'text-brand-primary',
                    price: '$99/mo',
                    sla: '99.90%',
                    latency: '42ms'
                };
        }
    };

    const isPageLoading = loading || (!fetchAttempted && schools.length === 0);

    if (isPageLoading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center">
                <div className="text-center">
                    <Activity size={48} className="text-brand-primary animate-spin mx-auto mb-4" />
                    <p className="text-slate-400">Loading school details...</p>
                </div>
            </div>
        );
    }

    if (!school) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center">
                <div className="text-center bg-slate-800/40 backdrop-blur-sm border border-slate-700/50 p-8 rounded-2xl max-w-md">
                    <AlertTriangle size={48} className="text-red-400 mx-auto mb-4" />
                    <h2 className="text-2xl font-bold text-white mb-2">School Not Found</h2>
                    <p className="text-slate-400 mb-6 font-medium">The requested institutional node could not be resolved in the system registry.</p>
                    <button
                        onClick={() => navigate('/superadmin/schools')}
                        className="px-6 py-3 rounded-lg bg-brand-primary hover:bg-brand-primary/90 text-white font-semibold transition-all"
                    >
                        Back to Schools
                    </button>
                </div>
            </div>
        );
    }

    const tierDesign = getTierDesign(school.subscriptionTier);

    return (
        <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }}
            className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-left"
        >
            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-20">
                <div className="absolute inset-0" style={{
                    backgroundImage: `radial-gradient(circle at 2px 2px, rgb(148 163 184 / 0.15) 1px, transparent 0)`,
                    backgroundSize: '48px 48px'
                }}></div>
            </div>

            {/* Gradient Orbs */}
            <div className="absolute top-0 right-1/4 w-96 h-96 bg-brand-primary/10 rounded-full blur-[120px] animate-pulse"></div>
            <div className="absolute bottom-0 left-1/3 w-[500px] h-[500px] bg-brand-secondary/8 rounded-full blur-[140px] animate-pulse" style={{ animationDuration: '8s' }}></div>

            <div className="relative z-10 max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Back Button */}
                <button
                    onClick={() => navigate('/superadmin/schools')}
                    className="flex items-center gap-2 text-slate-400 hover:text-white mb-6 transition-colors group"
                >
                    <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
                    <span className="font-medium">Back to Schools</span>
                </button>

                {/* Header Section */}
                <div className="bg-slate-800/40 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-6 md:p-8 mb-8">
                    <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
                        {/* Logo */}
                        <div className="w-24 h-24 rounded-2xl bg-slate-900/50 border-2 border-slate-700/50 flex items-center justify-center overflow-hidden flex-shrink-0">
                            {getImageUrl(school.logo) ? (
                                <img src={getImageUrl(school.logo)} alt="" className="w-full h-full object-cover" />
                            ) : (
                                <School size={48} className="text-slate-500" />
                            )}
                        </div>

                        {/* Info */}
                        <div className="flex-1">
                            <div className="flex flex-wrap items-center gap-3 mb-3">
                                <h1 className="text-3xl md:text-4xl font-black text-white">{school.name}</h1>
                                <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium ${
                                    school.isActive 
                                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
                                        : 'bg-slate-700/50 text-slate-400 border border-slate-600'
                                }`}>
                                    <span className={`w-2 h-2 rounded-full ${school.isActive ? 'bg-emerald-400 animate-pulse' : 'bg-slate-500'}`}></span>
                                    {school.isActive ? 'OPERATIONAL' : 'OFFLINE'}
                                </div>
                            </div>
                            <div className="flex items-center gap-3 text-slate-400 mb-4">
                                <div className="flex items-center gap-2">
                                    <Globe size={16} />
                                    <span className="font-mono text-sm">{school.subdomain}.campus.edu</span>
                                    <button
                                        onClick={() => handleCopy(`${school.subdomain}.campus.edu`, 'subdomain')}
                                        className="text-slate-500 hover:text-brand-primary transition-colors relative"
                                    >
                                        {copiedText === 'subdomain' ? (
                                            <Check size={14} className="text-emerald-400" />
                                        ) : (
                                            <Copy size={14} />
                                        )}
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="flex gap-3 w-full md:w-auto">
                            <button
                                onClick={openEditModal}
                                className="flex-1 md:flex-initial flex items-center justify-center gap-2 px-6 py-3 rounded-lg bg-brand-primary hover:bg-brand-primary/90 text-white font-semibold transition-all"
                            >
                                <Edit size={18} />
                                <span>Edit School</span>
                            </button>
                            {/* <button
                                onClick={() => setIsDeleteModalOpen(true)}
                                className="flex items-center justify-center px-4 py-3 rounded-lg bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 hover:border-red-500/30 text-red-400 hover:text-red-300 transition-all"
                            >
                                <Trash2 size={18} />
                            </button> */}
                        </div>
                    </div>
                </div>

                {/* Content Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Left Column - Main Info */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Statistics Overview */}
                        <div className="bg-slate-800/40 backdrop-blur-sm border border-slate-700/50 rounded-xl p-6">
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                                    <Activity size={22} className="text-brand-secondary" />
                                    Usage Statistics
                                </h2>
                                <span className="text-xs text-slate-500 bg-slate-900/50 px-2 py-1 rounded">
                                    Live Database Telemetry
                                </span>
                            </div>
                            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                                <div className="bg-slate-900/50 rounded-xl p-4 border border-slate-700/30">
                                    <Users size={20} className="text-brand-primary mb-2" />
                                    <div className="text-2xl font-black text-white mb-1">
                                        {school.usersCount !== undefined 
                                            ? school.usersCount.toLocaleString() 
                                            : 'N/A'}
                                    </div>
                                    <div className="text-xs text-slate-400 font-medium">
                                        Total Users
                                    </div>
                                </div>
                                <div className="bg-slate-900/50 rounded-xl p-4 border border-slate-700/30">
                                    <BookOpen size={20} className="text-emerald-400 mb-2" />
                                    <div className="text-2xl font-black text-white mb-1">
                                        {school.subjectsCount !== undefined 
                                            ? school.subjectsCount.toLocaleString() 
                                            : 'N/A'}
                                    </div>
                                    <div className="text-xs text-slate-400 font-medium">
                                        Active Courses
                                    </div>
                                </div>
                                <div className="bg-slate-900/50 rounded-xl p-4 border border-slate-700/30">
                                    <School size={20} className="text-amber-400 mb-2" />
                                    <div className="text-2xl font-black text-white mb-1">
                                        {school.classSectionsCount !== undefined 
                                            ? school.classSectionsCount.toLocaleString() 
                                            : 'N/A'}
                                    </div>
                                    <div className="text-xs text-slate-400 font-medium">
                                        Active Classes
                                    </div>
                                </div>
                                <div className="bg-slate-900/50 rounded-xl p-4 border border-slate-700/30">
                                    <Database size={20} className="text-brand-secondary mb-2" />
                                    <div className="text-2xl font-black text-white mb-1">
                                        {school.storageUsed !== undefined 
                                            ? `${school.storageUsed} GB` 
                                            : 'N/A'}
                                    </div>
                                    <div className="text-xs text-slate-400 font-medium">
                                        Storage Used
                                    </div>
                                </div>
                            </div>
                            <div className="mt-4 text-xs text-slate-500 flex items-start gap-2 bg-slate-900/30 px-3 py-2 rounded-lg">
                                <Activity size={14} className="flex-shrink-0 mt-0.5 text-emerald-400 animate-pulse" />
                                <span>Statistics are compiled from live database telemetry.</span>
                            </div>
                        </div>

                        {/* System Configuration & Policies */}
                        <div className="bg-slate-800/40 backdrop-blur-sm border border-slate-700/50 rounded-xl p-6">
                            <h2 className="text-xl font-bold text-white flex items-center gap-2 mb-6">
                                <Settings size={22} className="text-brand-primary" />
                                Configuration & Policies
                            </h2>
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                                <div className="bg-slate-900/50 rounded-xl p-4 border border-slate-700/30 flex flex-col justify-between">
                                    <div className="flex items-center justify-between mb-3">
                                        <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Email Alerts</span>
                                        <Mail size={18} className={school.settings?.emailNotifications ? "text-emerald-400" : "text-slate-500"} />
                                    </div>
                                    <div>
                                        <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold ${
                                            school.settings?.emailNotifications 
                                                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
                                                : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                                        }`}>
                                            <span className={`w-1.5 h-1.5 rounded-full ${school.settings?.emailNotifications ? 'bg-emerald-400 animate-pulse' : 'bg-rose-400'}`}></span>
                                            {school.settings?.emailNotifications ? 'ENABLED' : 'DISABLED'}
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-slate-900/50 rounded-xl p-4 border border-slate-700/30 flex flex-col justify-between">
                                    <div className="flex items-center justify-between mb-3">
                                        <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">SMS Alerts</span>
                                        <MessageSquare size={18} className={school.settings?.smsNotifications ? "text-emerald-400" : "text-slate-500"} />
                                    </div>
                                    <div>
                                        <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold ${
                                            school.settings?.smsNotifications 
                                                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
                                                : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                                        }`}>
                                            <span className={`w-1.5 h-1.5 rounded-full ${school.settings?.smsNotifications ? 'bg-emerald-400 animate-pulse' : 'bg-rose-400'}`}></span>
                                            {school.settings?.smsNotifications ? 'ENABLED' : 'DISABLED'}
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-slate-900/50 rounded-xl p-4 border border-slate-700/30 flex flex-col justify-between">
                                    <div className="flex items-center justify-between mb-3">
                                        <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Payment Gateway</span>
                                        <CreditCard size={18} className="text-brand-secondary" />
                                    </div>
                                    <div>
                                        <div className="text-lg font-extrabold text-white capitalize leading-none mb-1">
                                            {school.settings?.paymentGateway || 'stripe'}
                                        </div>
                                        <span className="text-[10px] text-slate-500 font-mono uppercase tracking-wider">Gateway System</span>
                                    </div>
                                </div>

                                <div className="bg-slate-900/50 rounded-xl p-4 border border-slate-700/30 flex flex-col justify-between">
                                    <div className="flex items-center justify-between mb-3">
                                        <span className="text-xs font-semibold text-slate-400 tracking-wider uppercase">Library Fine</span>
                                        <Clock size={18} className="text-amber-400" />
                                    </div>
                                    <div>
                                        <div className="text-xl font-black text-white leading-none mb-1">
                                            ₹{school.settings?.libraryFinePerDay ?? 0}
                                        </div>
                                        <span className="text-[10px] text-slate-500 font-mono uppercase tracking-wider">Per Overdue Day</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                    </div>

                    {/* Right Column - Additional Info */}
                    <div className="space-y-6">
                        {/* Administrator Info */}
                        <div className="bg-slate-800/40 backdrop-blur-sm border border-slate-700/50 rounded-xl p-6">
                            <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                                <Shield size={20} className="text-brand-primary" />
                                Administrator
                            </h2>
                            <div className="space-y-4">
                                <div>
                                    <div className="text-xs text-slate-500 mb-2 font-medium uppercase tracking-wider">Email</div>
                                    <div className="flex items-center justify-between gap-2 bg-slate-900/50 px-3 py-2 rounded-lg">
                                        <span className="text-sm text-white truncate">{school.adminEmail || 'N/A'}</span>
                                        {school.adminEmail && (
                                            <button
                                                onClick={() => handleCopy(school.adminEmail, 'email')}
                                                className="text-slate-500 hover:text-brand-primary transition-colors flex-shrink-0"
                                            >
                                                {copiedText === 'email' ? (
                                                    <Check size={14} className="text-emerald-400" />
                                                ) : (
                                                    <Copy size={14} />
                                                )}
                                            </button>
                                        )}
                                    </div>
                                </div>
                                <div>
                                    <div className="text-xs text-slate-500 mb-2 font-medium uppercase tracking-wider">Access Level</div>
                                    <div className="text-sm font-semibold text-white">Super Administrator</div>
                                </div>
                                <div>
                                    <div className="text-xs text-slate-500 mb-2 font-medium uppercase tracking-wider">Contact</div>
                                    <div className="text-sm font-semibold text-white">{school.contact || 'Not provided'}</div>
                                </div>
                                <div>
                                    <div className="text-xs text-slate-500 mb-2 font-medium uppercase tracking-wider">Address</div>
                                    <div className="text-sm text-slate-300">{school.address || 'Not provided'}</div>
                                </div>
                            </div>
                        </div>

                        {/* Technical Details */}
                        <div className="bg-slate-800/40 backdrop-blur-sm border border-slate-700/50 rounded-xl p-6">
                            <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                                <Settings size={20} className="text-brand-secondary" />
                                Technical Details
                            </h2>
                            <div className="space-y-4">
                                <div>
                                    <div className="text-xs text-slate-500 mb-2 font-medium uppercase tracking-wider">School ID</div>
                                    <div className="flex items-center justify-between gap-2 bg-slate-900/50 px-3 py-2 rounded-lg">
                                        <span className="text-xs font-mono text-white truncate">{school._id || 'N/A'}</span>
                                        {school._id && (
                                            <button
                                                onClick={() => handleCopy(school._id, 'id')}
                                                className="text-slate-500 hover:text-brand-primary transition-colors flex-shrink-0"
                                            >
                                                {copiedText === 'id' ? (
                                                    <Check size={14} className="text-emerald-400" />
                                                ) : (
                                                    <Copy size={14} />
                                                )}
                                            </button>
                                        )}
                                    </div>
                                </div>
                                <div>
                                    <div className="text-xs text-slate-500 mb-2 font-medium uppercase tracking-wider">Subdomain</div>
                                    <div className="text-sm font-mono text-white bg-slate-900/50 px-3 py-2 rounded-lg">
                                        {school.subdomain || 'N/A'}
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <div className="text-xs text-slate-500 mb-2 font-medium uppercase tracking-wider">Server Region</div>
                                        <div className="text-xs font-semibold text-white bg-slate-900/45 p-2 rounded border border-slate-700/30 font-mono">US-East-1</div>
                                    </div>
                                    <div>
                                        <div className="text-xs text-slate-500 mb-2 font-medium uppercase tracking-wider">Database</div>
                                        <div className="text-xs font-semibold text-white bg-slate-900/45 p-2 rounded border border-slate-700/30 font-mono">MongoDB v6.0</div>
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <div className="text-xs text-slate-500 mb-2 font-medium uppercase tracking-wider">SSL Certificate</div>
                                        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                                            SECURE SSL
                                        </div>
                                    </div>
                                    <div>
                                        <div className="text-xs text-slate-500 mb-2 font-medium uppercase tracking-wider">Daily Backups</div>
                                        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                                            SCHEDULED
                                        </div>
                                    </div>
                                </div>
                                <div>
                                    <div className="text-xs text-slate-500 mb-2 font-medium uppercase tracking-wider">Infrastructure Status</div>
                                    <div className="text-xs font-semibold text-white bg-slate-900/45 p-2.5 rounded border border-slate-700/30 flex justify-between items-center">
                                        <span className="text-slate-400">Node Cluster:</span>
                                        <span className="font-mono text-emerald-400 font-bold">HEALTHY (100% SLA)</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Timestamps */}
                        <div className="bg-slate-800/40 backdrop-blur-sm border border-slate-700/50 rounded-xl p-6">
                            <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                                <Calendar size={20} className="text-emerald-400" />
                                Timeline
                            </h2>
                            <div className="space-y-4">
                                <div>
                                    <div className="text-xs text-slate-500 mb-2 font-medium uppercase tracking-wider">Created</div>
                                    <div className="text-sm font-semibold text-white">
                                        {school.createdAt ? new Date(school.createdAt).toLocaleDateString('en-US', { 
                                            year: 'numeric', 
                                            month: 'long', 
                                            day: 'numeric',
                                            hour: '2-digit',
                                            minute: '2-digit'
                                        }) : 'N/A'}
                                    </div>
                                </div>
                                <div>
                                    <div className="text-xs text-slate-500 mb-2 font-medium uppercase tracking-wider">Last Updated</div>
                                    <div className="text-sm font-semibold text-white">
                                        {school.updatedAt ? new Date(school.updatedAt).toLocaleDateString('en-US', { 
                                            year: 'numeric', 
                                            month: 'long', 
                                            day: 'numeric',
                                            hour: '2-digit',
                                            minute: '2-digit'
                                        }) : 'N/A'}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Status Alert */}
                        {!school.isActive && (
                            <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4">
                                <div className="flex items-start gap-3">
                                    <AlertTriangle size={20} className="text-red-400 flex-shrink-0 mt-0.5" />
                                    <div>
                                        <div className="text-sm font-bold text-red-400 mb-1">School Offline</div>
                                        <div className="text-xs text-red-300/80">
                                            This school is currently inactive. Contact support for assistance.
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* School Form Modal (Edit Only) */}
            <PortalModal isOpen={isFormModalOpen} onClose={closeFormModal} maxWidth="max-w-xl">
                <div className="p-8 xs:p-10 overflow-y-auto">
                    <div className="flex justify-between items-start mb-6 xs:mb-8">
                        <div>
                            <h3 className="text-2xl xs:text-3xl font-bold tracking-tighter text-slate-100 font-inter uppercase mb-1">
                                Edit School
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

                    {/* Modern Tabs */}
                    <div className="flex border-b border-slate-700/50 mb-6 gap-2">
                        <button
                            type="button"
                            onClick={() => setActiveTab('general')}
                            className={`pb-3 px-4 font-bold text-xs uppercase tracking-wider border-b-2 transition-all ${
                                activeTab === 'general'
                                    ? 'border-brand-primary text-brand-primary'
                                    : 'border-transparent text-slate-400 hover:text-slate-200'
                            }`}
                        >
                            General Info
                        </button>
                        <button
                            type="button"
                            onClick={() => setActiveTab('settings')}
                            className={`pb-3 px-4 font-bold text-xs uppercase tracking-wider border-b-2 transition-all ${
                                activeTab === 'settings'
                                    ? 'border-brand-primary text-brand-primary'
                                    : 'border-transparent text-slate-400 hover:text-slate-200'
                            }`}
                        >
                            Rules & Notifications
                        </button>
                    </div>

                    <form onSubmit={formik.handleSubmit} className="space-y-5 xs:space-y-6">
                        {activeTab === 'general' && (
                            <div className="space-y-5">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                                    <div className="space-y-1.5">
                                        <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest ml-1">Institution Identity</p>
                                        <input type="text" {...formik.getFieldProps('name')} placeholder="School Alias..." className="bg-brand-background/60 border border-brand-border py-2.5 xs:py-3 px-4 rounded-md text-sm font-medium w-full outline-none focus:border-brand-primary text-slate-100" />
                                        {formik.touched.name && formik.errors.name && (
                                            <p className="text-[10px] text-red-400 mt-1">{formik.errors.name}</p>
                                        )}
                                    </div>
                                    <div className="space-y-1.5">
                                        <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest ml-1">Subdomain</p>
                                        <input type="text" {...formik.getFieldProps('subdomain')} disabled placeholder="subdomain.campus..." className="bg-brand-background/60 border border-brand-border py-2.5 xs:py-3 px-4 rounded-md text-sm font-medium w-full outline-none focus:border-brand-primary disabled:opacity-40 text-slate-100 font-mono lowercase" />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                                    <div className="space-y-1.5">
                                        <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest ml-1">Administrator Registry Access</p>
                                        <input type="email" {...formik.getFieldProps('adminEmail')} placeholder="Email Registration..." className="bg-brand-background/60 border border-brand-border py-2.5 xs:py-3 px-4 rounded-md text-sm font-medium w-full outline-none focus:border-brand-primary text-slate-100" />
                                        {formik.touched.adminEmail && formik.errors.adminEmail && (
                                            <p className="text-[10px] text-red-400 mt-1">{formik.errors.adminEmail}</p>
                                        )}
                                    </div>
                                    <div className="space-y-1.5">
                                        <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest ml-1">Contact Phone</p>
                                        <input type="text" {...formik.getFieldProps('contact')} placeholder="Phone Number..." className="bg-brand-background/60 border border-brand-border py-2.5 xs:py-3 px-4 rounded-md text-sm font-medium w-full outline-none focus:border-brand-primary text-slate-100" />
                                    </div>
                                </div>

                                <div className="space-y-1.5">
                                    <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest ml-1">Physical Address</p>
                                    <textarea rows={3} {...formik.getFieldProps('address')} placeholder="Institution Address..." className="bg-brand-background/60 border border-brand-border py-2.5 xs:py-3 px-4 rounded-md text-sm font-medium w-full outline-none focus:border-brand-primary text-slate-100" />
                                </div>

                                {/* Logo Upload */}
                                <div className="relative group border border-dashed border-brand-border rounded-md p-6 xs:p-8 flex flex-col items-center justify-center cursor-pointer hover:bg-brand-primary/5 hover:border-brand-primary transition-all">
                                    <input type="file" onChange={(e) => { const f = e.currentTarget.files[0]; if (f) { formik.setFieldValue('logo', f); setLogoPreview(URL.createObjectURL(f)); } }} className="absolute inset-0 opacity-0 cursor-pointer" />
                                    {getImageUrl(logoPreview) ? <img src={getImageUrl(logoPreview)} alt="" className="w-14 h-14 xs:w-16 xs:h-16 rounded-md object-cover mb-3 shadow-md border border-brand-border" /> : <div className="p-3 xs:p-4 rounded-md bg-slate-800 mb-3 group-hover:bg-brand-primary/10 transition-colors"><Upload className="text-slate-400 group-hover:text-brand-primary transition-all" size={24} /></div>}
                                    <p className="text-[9px] xs:text-[10px] font-bold text-slate-500 uppercase tracking-widest italic">School Logo</p>
                                </div>
                            </div>
                        )}

                        {activeTab === 'settings' && (
                            <div className="space-y-6">
                                <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest ml-1">Alerts & System Preferences</p>
                                
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                                    {/* Email Notification Switch */}
                                    <label className="flex items-center justify-between p-4 bg-slate-900/40 border border-brand-border rounded-lg cursor-pointer hover:border-slate-600 transition-all select-none">
                                        <div className="flex flex-col gap-0.5">
                                            <span className="text-xs font-bold text-slate-200">Email Alerts</span>
                                            <span className="text-[10px] text-slate-500">Send email updates to users</span>
                                        </div>
                                        <input
                                            type="checkbox"
                                            checked={formik.values.settings?.emailNotifications}
                                            onChange={(e) => formik.setFieldValue('settings.emailNotifications', e.target.checked)}
                                            className="w-4 h-4 rounded text-brand-primary focus:ring-brand-primary bg-slate-900 border-slate-700 focus:ring-offset-slate-900 focus:ring-2 focus:ring-offset-2"
                                        />
                                    </label>

                                    {/* SMS Notification Switch */}
                                    <label className="flex items-center justify-between p-4 bg-slate-900/40 border border-brand-border rounded-lg cursor-pointer hover:border-slate-600 transition-all select-none">
                                        <div className="flex flex-col gap-0.5">
                                            <span className="text-xs font-bold text-slate-200">SMS Alerts</span>
                                            <span className="text-[10px] text-slate-500">Send SMS alerts to users</span>
                                        </div>
                                        <input
                                            type="checkbox"
                                            checked={formik.values.settings?.smsNotifications}
                                            onChange={(e) => formik.setFieldValue('settings.smsNotifications', e.target.checked)}
                                            className="w-4 h-4 rounded text-brand-primary focus:ring-brand-primary bg-slate-900 border-slate-700 focus:ring-offset-slate-900 focus:ring-2 focus:ring-offset-2"
                                        />
                                    </label>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                                    {/* Payment Gateway Dropdown */}
                                    <div className="space-y-1.5">
                                        <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest ml-1">Payment Gateway</p>
                                        <select
                                            {...formik.getFieldProps('settings.paymentGateway')}
                                            className="bg-slate-900/60 border border-brand-border py-2.5 px-4 rounded-md text-sm font-medium w-full outline-none focus:border-brand-primary text-slate-100"
                                        >
                                            <option value="stripe" className="bg-slate-900 text-white">Stripe</option>
                                            <option value="razorpay" className="bg-slate-900 text-white">Razorpay</option>
                                            <option value="paypal" className="bg-slate-900 text-white">PayPal</option>
                                            <option value="offline" className="bg-slate-900 text-white">Offline (No Gateway)</option>
                                        </select>
                                    </div>

                                    {/* Library Fine Rate */}
                                    <div className="space-y-1.5">
                                        <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest ml-1">Library Fine (₹ per day)</p>
                                        <input
                                            type="number"
                                            {...formik.getFieldProps('settings.libraryFinePerDay')}
                                            placeholder="5..."
                                            className="bg-slate-900/60 border border-brand-border py-2.5 px-4 rounded-md text-sm font-medium w-full outline-none focus:border-brand-primary text-slate-100"
                                        />
                                        {formik.touched.settings?.libraryFinePerDay && formik.errors.settings?.libraryFinePerDay && (
                                            <p className="text-[10px] text-red-400 mt-1">{formik.errors.settings.libraryFinePerDay}</p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}



                        {/* Submit Button */}
                        <button type="submit" disabled={loading} className="w-full py-4 rounded-md bg-brand-primary hover:bg-brand-primary/90 text-white font-bold uppercase tracking-[0.2em] xs:tracking-[0.3em] shadow-lg text-xs active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-3 transition-all">
                            {loading ? <Activity className="animate-spin" size={18} /> : (
                                <span className="flex items-center gap-2">
                                    UPDATE SCHOOL
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
                    <div className="w-16 h-16 xs:w-20 xs:h-20 rounded-md bg-red-500/10 flex items-center justify-center mx-auto mb-6 xs:mb-8 text-red-400">
                        <AlertTriangle size={36} />
                    </div>
                    <h3 className="text-xl xs:text-2xl font-bold italic font-inter tracking-tighter mb-2 text-slate-100 uppercase leading-none">Delete School?</h3>
                    <p className="text-slate-400 text-[10px] xs:text-[11px] leading-relaxed mb-8 xs:mb-10 font-medium uppercase tracking-[0.1em]">
                        Are you sure you want to delete this school? This action cannot be undone.
                    </p>
                    <div className="grid grid-cols-2 gap-4">
                        <button onClick={() => setIsDeleteModalOpen(false)} className="py-3.5 xs:py-4 rounded-md bg-brand-background border border-brand-border font-bold uppercase text-[9px] text-slate-400 hover:bg-slate-800 transition-all tracking-widest">Cancel</button>
                        <button onClick={confirmDelete} className="py-3.5 xs:py-4 rounded-md bg-red-500 hover:bg-red-700 text-white font-bold uppercase text-[9px] shadow-lg active:scale-95 tracking-widest">Delete</button>
                    </div>
                </div>
            </PortalModal>
        </motion.div>
    );
};

export default SchoolDetails;
