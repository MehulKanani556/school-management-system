import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
    fetchAdmissions, createEnquiry, enrollCandidate,
    fetchStandards, fetchClasses,
    clearError, clearMessage
} from '../../redux/slice/schoolAdmin.slice';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, Plus, Search, UserPlus, Filter, Clock, MoreVertical, X, FileText, CheckCircle2, AlertCircle, ChevronRight, Phone, Mail, MapPin, Calendar } from 'lucide-react';
import toast from 'react-hot-toast';

const Admissions = () => {
    const dispatch = useDispatch();
    const { admissions, standards, classes, loading, error, message } = useSelector((state) => state.schoolAdmin);
    const [activeTab, setActiveTab] = useState('enquiries');
    const [isEnquiryModalOpen, setIsEnquiryModalOpen] = useState(false);
    const [isEnrollModalOpen, setIsEnrollModalOpen] = useState(false);

    useEffect(() => {
        dispatch(fetchAdmissions());
        dispatch(fetchStandards());
        dispatch(fetchClasses());
    }, [dispatch]);

    useEffect(() => {
        if (message) {
            toast.success(message);
            dispatch(clearMessage());
        }
        if (error) {
            toast.error(error);
            dispatch(clearError());
        }
    }, [message, error, dispatch]);

    const enquiryFormik = useFormik({
        initialValues: {
            studentName: '',
            parentName: '',
            contactNumber: '',
            email: '',
            standardApplied: '',
            previousSchool: '',
            source: 'Online',
            notes: ''
        },
        validationSchema: Yup.object({
            studentName: Yup.string().required('Candidate name required'),
            parentName: Yup.string().required('Guardian identity required'),
            contactNumber: Yup.string().required('Contact vector required').matches(/^\d{10}$/, 'Invalid phone index'),
            email: Yup.string().email('Invalid mail format'),
            standardApplied: Yup.string().required('Target sector required')
        }),
        onSubmit: (values) => {
            dispatch(createEnquiry(values));
            setIsEnquiryModalOpen(false);
            enquiryFormik.resetForm();
        }
    });

    const enrollFormik = useFormik({
        initialValues: {
            enquiryId: '',
            admissionNumber: '',
            firstName: '',
            lastName: '',
            gender: 'Male',
            dateOfBirth: '',
            guardianName: '',
            guardianPhone: '',
            guardianEmail: '',
            address: '',
            classId: '',
            sectionId: '',
            academicYearId: '',
            password: 'password'
        },
        validationSchema: Yup.object({
            admissionNumber: Yup.string().required('Security index required'),
            firstName: Yup.string().required('First moniker required'),
            lastName: Yup.string().required('Last moniker required'),
            gender: Yup.string().required(),
            dateOfBirth: Yup.date().required('Temporal birth required'),
            guardianName: Yup.string().required(),
            guardianPhone: Yup.string().required().matches(/^\d{10}$/, 'Invalid phone index'),
            sectionId: Yup.string().required('Assigned sector required'),
            academicYearId: Yup.string().required('Cycle required')
        }),
        onSubmit: (values) => {
            dispatch(enrollCandidate(values));
            setIsEnrollModalOpen(false);
            enrollFormik.resetForm();
        }
    });

    const initiateEnrollment = (enquiry) => {
        enrollFormik.setValues({
            ...enrollFormik.initialValues,
            enquiryId: enquiry._id,
            firstName: enquiry.studentName.split(' ')[0],
            lastName: enquiry.studentName.split(' ').slice(1).join(' ') || '',
            guardianName: enquiry.parentName,
            guardianPhone: enquiry.contactNumber,
            guardianEmail: enquiry.email || '',
            classId: enquiry.standardApplied?._id || ''
        });
        setIsEnrollModalOpen(true);
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-700 font-inter">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-slate-900/40 p-8 rounded-md border border-slate-800/60 backdrop-blur-xl group">
                <div>
                    <div className="flex items-center gap-3 mb-2">
                        <div className="w-12 h-12 rounded-md bg-brand-primary/10 flex items-center justify-center border border-brand-primary/20 group-hover:scale-110 transition-transform">
                            <UserPlus className="text-brand-primary" size={24} />
                        </div>
                        <h1 className="text-3xl font-black uppercase tracking-tight font-outfit">Admission <span className="text-brand-primary">Terminal</span></h1>
                    </div>
                    <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em] ml-1">Coordinate Enquiries & Institutional Enrollment</p>
                </div>
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => { enquiryFormik.resetForm(); setIsEnquiryModalOpen(true); }}
                        className="flex items-center justify-center gap-3 bg-slate-800 hover:bg-slate-700 text-white px-8 py-4 rounded-md font-black uppercase text-[11px] tracking-widest transition-all border border-slate-700"
                    >
                        <Plus size={18} />
                        ARCHIVE ENQUIRY
                    </button>
                    <button
                        onClick={() => { enrollFormik.resetForm(); setIsEnrollModalOpen(true); }}
                        className="flex items-center justify-center gap-3 bg-brand-primary hover:bg-brand-primary/90 text-white px-8 py-4 rounded-md font-black uppercase text-[11px] tracking-widest transition-all shadow-lg hover:-translate-y-1"
                    >
                        <UserPlus size={18} />
                        PROVISION CANDIDATE
                    </button>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex items-center p-1 bg-slate-900/60 rounded-md border border-slate-800/60 w-fit">
                <button
                    onClick={() => setActiveTab('enquiries')}
                    className={`px-8 py-3 text-[10px] font-black uppercase tracking-widest rounded transition-all ${activeTab === 'enquiries' ? 'bg-brand-primary text-white shadow-lg shadow-brand-primary/20' : 'text-slate-500 hover:text-slate-300'}`}
                >
                    Enquiry Manifest
                </button>
                <button
                    onClick={() => setActiveTab('pipeline')}
                    className={`px-8 py-3 text-[10px] font-black uppercase tracking-widest rounded transition-all ${activeTab === 'pipeline' ? 'bg-brand-primary text-white shadow-lg shadow-brand-primary/20' : 'text-slate-500 hover:text-slate-300'}`}
                >
                    Enrollment Pipeline
                </button>
            </div>

            {/* Content Manifest */}
            <div className="bg-slate-900/40 border border-slate-800/60 rounded-md overflow-hidden">
                <table className="w-full">
                    <thead>
                        <tr className="bg-slate-800/40">
                            <th className="px-8 py-5 text-left text-[9px] font-black text-slate-500 uppercase tracking-widest border-b border-white/5">Candidate Meta</th>
                            <th className="px-8 py-5 text-left text-[9px] font-black text-slate-500 uppercase tracking-widest border-b border-white/5">Target Sector</th>
                            <th className="px-8 py-5 text-left text-[9px] font-black text-slate-500 uppercase tracking-widest border-b border-white/5">Contact Logic</th>
                            <th className="px-8 py-5 text-left text-[9px] font-black text-slate-500 uppercase tracking-widest border-b border-white/5">Vector Status</th>
                            <th className="px-8 py-5 text-right text-[9px] font-black text-slate-500 uppercase tracking-widest border-b border-white/5">Protocol</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                        {loading && admissions.length === 0 ? (
                            <tr>
                                <td colSpan="5" className="px-8 py-20 text-center">
                                    <Clock className="animate-spin text-brand-primary mx-auto mb-4" size={32} />
                                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Synchronizing Admission Matrix...</p>
                                </td>
                            </tr>
                        ) : admissions.length === 0 ? (
                            <tr>
                                <td colSpan="5" className="px-8 py-20 text-center text-slate-600 italic uppercase font-black text-[10px] tracking-widest">Null pipeline state</td>
                            </tr>
                        ) : admissions.map((enq, i) => (
                            <motion.tr
                                key={enq._id}
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: i * 0.05 }}
                                className="group hover:bg-white/[0.02] transition-colors"
                            >
                                <td className="px-8 py-6">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-md bg-slate-800 border border-slate-700/50 flex items-center justify-center font-black text-brand-primary uppercase">
                                            {enq.studentName?.[0]}
                                        </div>
                                        <div>
                                            <p className="text-[11px] font-black uppercase tracking-wider group-hover:text-brand-primary transition-colors">{enq.studentName}</p>
                                            <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mt-0.5">Parent: {enq.parentName}</p>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-8 py-6">
                                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Standard: {enq.standardApplied?.level || 'N/A'}</p>
                                    <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mt-0.5">Prev: {enq.previousSchool || 'Private Study'}</p>
                                </td>
                                <td className="px-8 py-6">
                                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-2"><Phone size={10} className="text-brand-primary" /> {enq.contactNumber}</p>
                                    <p className="text-[9px] font-bold text-slate-500 tracking-widest mt-0.5 lowercase italic">{enq.email || 'no-email-archive'}</p>
                                </td>
                                <td className="px-8 py-6">
                                    <div className={`inline-flex px-3 py-1 rounded-md border text-[9px] font-black uppercase tracking-widest ${enq.status === 'Admitted' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' :
                                            enq.status === 'Rejected' ? 'bg-red-500/10 border-red-500/20 text-red-400' :
                                                'bg-brand-primary/10 border-brand-primary/20 text-brand-primary'
                                        }`}>
                                        {enq.status}
                                    </div>
                                </td>
                                <td className="px-8 py-6 text-right">
                                    {enq.status !== 'Admitted' ? (
                                        <button
                                            onClick={() => initiateEnrollment(enq)}
                                            className="px-4 py-2 bg-slate-800 hover:bg-brand-primary text-[9px] font-black uppercase tracking-widest rounded-md border border-slate-700 hover:border-brand-primary transition-all text-slate-400 hover:text-white"
                                        >
                                            Initialize Enrollment
                                        </button>
                                    ) : (
                                        <span className="text-[9px] font-black uppercase tracking-widest text-emerald-400 opacity-50 italic">Enrollment Finalized</span>
                                    )}
                                </td>
                            </motion.tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Enquiry Modal */}
            <AnimatePresence>
                {isEnquiryModalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-slate-950/80 backdrop-blur-md" onClick={() => setIsEnquiryModalOpen(false)} />
                        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="bg-slate-900 border border-slate-800 w-full max-w-xl rounded-md overflow-hidden relative shadow-2xl z-10">
                            <div className="p-8 border-b border-slate-800 flex justify-between items-center bg-slate-900/50 backdrop-blur-xl">
                                <h2 className="text-xl font-black uppercase font-outfit tracking-wider">Archive Admission Enquiry</h2>
                                <button onClick={() => setIsEnquiryModalOpen(false)} className="p-2 hover:bg-slate-800 rounded-md transition-colors"><X size={18} /></button>
                            </div>
                            <form onSubmit={enquiryFormik.handleSubmit} className="p-8 space-y-6 font-inter">
                                <div className="grid grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Candidate Name</label>
                                        <input
                                            name="studentName"
                                            className={`w-full bg-slate-800 border rounded-md p-4 text-[11px] font-black uppercase tracking-widest outline-none transition-all ${enquiryFormik.touched.studentName && enquiryFormik.errors.studentName ? 'border-red-500/50 bg-red-500/5' : 'border-slate-700 focus:border-brand-primary'}`}
                                            {...enquiryFormik.getFieldProps('studentName')}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Standard Applied</label>
                                        <select
                                            name="standardApplied"
                                            className={`w-full bg-slate-800 border rounded-md p-4 text-[11px] font-black uppercase tracking-widest outline-none transition-all ${enquiryFormik.touched.standardApplied && enquiryFormik.errors.standardApplied ? 'border-red-500/50 bg-red-500/5' : 'border-slate-700 focus:border-brand-primary'}`}
                                            {...enquiryFormik.getFieldProps('standardApplied')}
                                        >
                                            <option value="">SELECT TARGET</option>
                                            {standards.map(s => <option key={s._id} value={s._id}>Grade {s.level} - {s.name}</option>)}
                                        </select>
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Guardian Identity</label>
                                        <input
                                            name="parentName"
                                            className={`w-full bg-slate-800 border rounded-md p-4 text-[11px] font-black uppercase tracking-widest outline-none transition-all ${enquiryFormik.touched.parentName && enquiryFormik.errors.parentName ? 'border-red-500/50 bg-red-500/5' : 'border-slate-700 focus:border-brand-primary'}`}
                                            {...enquiryFormik.getFieldProps('parentName')}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Contact Vector</label>
                                        <input
                                            name="contactNumber"
                                            className={`w-full bg-slate-800 border rounded-md p-4 text-[11px] font-black uppercase tracking-widest outline-none transition-all ${enquiryFormik.touched.contactNumber && enquiryFormik.errors.contactNumber ? 'border-red-500/50 bg-red-500/5' : 'border-slate-700 focus:border-brand-primary'}`}
                                            {...enquiryFormik.getFieldProps('contactNumber')}
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Institutional Narrative (Notes)</label>
                                    <textarea
                                        name="notes"
                                        rows={3}
                                        className="w-full bg-slate-800 border border-slate-700 rounded-md p-4 text-[11px] font-medium outline-none focus:border-brand-primary text-white"
                                        placeholder="Outline candidate background and enquiry context..."
                                        {...enquiryFormik.getFieldProps('notes')}
                                    />
                                </div>
                                <button disabled={loading} type="submit" className="w-full bg-brand-primary hover:bg-brand-primary/90 disabled:opacity-50 text-white py-5 rounded-md font-black uppercase text-[11px] tracking-[0.2em] transition-all flex items-center justify-center gap-2">
                                    {loading && <Clock className="animate-spin" size={14} />}
                                    SYNCHRONIZE ENQUIRY
                                </button>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Enroll Modal */}
            <AnimatePresence>
                {isEnrollModalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-slate-950/90 backdrop-blur-xl" onClick={() => setIsEnrollModalOpen(false)} />
                        <motion.div initial={{ scale: 0.9, y: 30 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 30 }} className="bg-slate-900 border border-slate-800 w-full max-w-2xl rounded-md overflow-hidden relative shadow-2xl z-10">
                            <div className="p-8 border-b border-slate-800 flex justify-between items-center bg-slate-800/50">
                                <h1 className="text-xl font-black uppercase font-outfit">Synchronize Institutional Enrollment</h1>
                                <button onClick={() => setIsEnrollModalOpen(false)} className="p-2 hover:bg-slate-800 rounded-md transition-colors"><X size={18} /></button>
                            </div>
                            <form onSubmit={enrollFormik.handleSubmit} className="p-8 space-y-6 max-h-[70vh] overflow-y-auto custom-scrollbar font-inter">
                                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-brand-primary border-l-2 border-brand-primary pl-4">Candidate Protocol Parameters</p>
                                <div className="grid grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Security Index (Admission #)</label>
                                        <input
                                            name="admissionNumber"
                                            className={`w-full bg-slate-800 border rounded-md p-4 text-[11px] font-black uppercase tracking-widest outline-none transition-all ${enrollFormik.touched.admissionNumber && enrollFormik.errors.admissionNumber ? 'border-red-500/50 bg-red-500/5' : 'border-slate-700 focus:border-brand-primary'}`}
                                            {...enrollFormik.getFieldProps('admissionNumber')}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">First Moniker</label>
                                        <input
                                            name="firstName"
                                            className={`w-full bg-slate-800 border rounded-md p-4 text-[11px] font-black uppercase tracking-widest outline-none transition-all ${enrollFormik.touched.firstName && enrollFormik.errors.firstName ? 'border-red-500/50 bg-red-500/5' : 'border-slate-700 focus:border-brand-primary'}`}
                                            {...enrollFormik.getFieldProps('firstName')}
                                        />
                                    </div>
                                </div>
                                <div className="grid grid-cols-3 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Assigned Sector (Class)</label>
                                        <select
                                            name="sectionId"
                                            className={`w-full bg-slate-800 border rounded-md p-4 text-[11px] font-black uppercase tracking-widest outline-none transition-all ${enrollFormik.touched.sectionId && enrollFormik.errors.sectionId ? 'border-red-500/50 bg-red-500/5' : 'border-slate-700 focus:border-brand-primary'}`}
                                            onChange={(e) => {
                                                const sec = classes.find(c => c._id === e.target.value);
                                                enrollFormik.setFieldValue('sectionId', e.target.value);
                                                enrollFormik.setFieldValue('classId', sec?.standardId?._id || '');
                                            }}
                                            value={enrollFormik.values.sectionId}
                                        >
                                            <option value="">SELECT SECTOR</option>
                                            {classes.map(c => <option key={c._id} value={c._id}>{c.sectionLabel} ({c.standardId?.level})</option>)}
                                        </select>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Temporal Cycle</label>
                                        <select
                                            name="academicYearId"
                                            className={`w-full bg-slate-800 border rounded-md p-4 text-[11px] font-black uppercase tracking-widest outline-none transition-all ${enrollFormik.touched.academicYearId && enrollFormik.errors.academicYearId ? 'border-red-500/50 bg-red-500/5' : 'border-slate-700 focus:border-brand-primary'}`}
                                            {...enrollFormik.getFieldProps('academicYearId')}
                                        >
                                            <option value="">SELECT CYCLE</option>
                                            {/* Ideally fetch academic years here, for now assuming they are being managed elsewhere or just active */}
                                            <option value="current">2024-25 (ACTIVE)</option>
                                        </select>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Protocol DOB</label>
                                        <input
                                            name="dateOfBirth"
                                            type="date"
                                            className={`w-full bg-slate-800 border rounded-md p-4 text-[11px] font-black uppercase tracking-widest outline-none transition-all ${enrollFormik.touched.dateOfBirth && enrollFormik.errors.dateOfBirth ? 'border-red-500/50 bg-red-500/5' : 'border-slate-700 focus:border-brand-primary text-white'}`}
                                            {...enrollFormik.getFieldProps('dateOfBirth')}
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Geographic Index (Address)</label>
                                    <textarea
                                        name="address"
                                        rows={2}
                                        className="w-full bg-slate-800 border border-slate-700 rounded-md p-4 text-[11px] font-medium outline-none focus:border-brand-primary text-white"
                                        {...enrollFormik.getFieldProps('address')}
                                    />
                                </div>
                                <button disabled={loading} type="submit" className="w-full bg-brand-primary hover:bg-brand-primary/90 disabled:opacity-50 text-white py-5 rounded-md font-black uppercase text-[11px] tracking-[0.2em] transition-all shadow-xl flex items-center justify-center gap-2">
                                    {loading && <Clock className="animate-spin" size={14} />}
                                    FINALIZE ENROLLMENT OVERRIDE
                                </button>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default Admissions;