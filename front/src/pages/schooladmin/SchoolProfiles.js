import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchSchoolProfile, updateSchoolProfile, changeAdminPassword } from '../../redux/slice/schoolAdmin.slice';
import { logout, updateUser } from '../../redux/slice/auth.slice';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Building2, MapPin, Phone, Mail, Calendar, Lock, Key, Upload, X,
  Save, Activity, Cpu, Shield, CheckCircle2, Sliders, Clock, ArrowRight,
  LockKeyhole, Camera, RefreshCw, Check, Eye, EyeOff
} from 'lucide-react';
import toast from 'react-hot-toast';
import PortalModal from '../../components/PortalModal';

const validationSchema = Yup.object({
  name: Yup.string().min(3, 'Min 3 characters').required('School name is required'),
  address: Yup.string().required('Address is required'),
  contact: Yup.string().matches(/^[0-9+\-\s()]{7,15}$/, 'Invalid contact number').required('Contact is required'),
  logo: Yup.mixed().nullable(),
});

const ic = (touched, error) =>
  `w-full bg-slate-950/80 border ${touched && error ? 'border-red-500/60 focus:border-red-500' : 'border-slate-800 focus:border-brand-primary/60'} rounded-xl py-3.5 px-4 text-white placeholder-slate-700 outline-none text-xs transition-all focus:bg-brand-primary/[0.02] focus:shadow-[0_0_15px_rgba(14,165,233,0.15)]`;

const Err = ({ touched, error }) =>
  touched && error ? <p className="mt-1 text-[10px] text-red-400 font-bold tracking-wide text-left">{error}</p> : null;

const SchoolSettings = () => {
  const dispatch = useDispatch();
  const { schoolProfile, loading } = useSelector((s) => s.schoolAdmin);
  const { user } = useSelector((state) => state.auth);
  
  const [logoPreview, setLogoPreview] = useState(null);
  const [isPwdModalOpen, setIsPwdModalOpen] = useState(false);
  const [showPasswords, setShowPasswords] = useState({ old: false, new: false, confirm: false });

  const mockLogs = [
    { time: '18:15:32', event: 'Academic schedule backup synched', status: 'SUCCESS' },
    { time: '17:40:11', event: 'Staff payroll batch processed', status: 'AUDITED' },
    { time: '16:12:05', event: 'Admissions portal query synced', status: 'SECURE' },
    { time: '14:05:00', event: 'System firewall heartbeat ok', status: 'ACTIVE' }
  ];

  const privilegeList = [
    { name: 'Admissions orchestration', allowed: true },
    { name: 'Personnel & staff logs', allowed: true },
    { name: 'Class scheduling rules', allowed: true },
    { name: 'Fee structures override', allowed: true },
    { name: 'Certificate issuance', allowed: true }
  ];

  const getPasswordMetrics = (pass) => {
    const hasLength = pass.length >= 6;
    const hasNumber = /\d/.test(pass);
    const hasUpperOrSpecial = /[A-Z]/.test(pass) || /[^A-Za-z0-9]/.test(pass);
    
    let score = 0;
    if (pass.length > 0) {
        if (hasLength) score += 1;
        if (pass.length >= 8) score += 1;
        if (hasNumber) score += 1;
        if (hasUpperOrSpecial) score += 1;
    }

    let label = 'WEAK';
    let color = 'bg-rose-500';
    let textColor = 'text-rose-400';
    
    if (score === 3) {
        label = 'MEDIUM';
        color = 'bg-amber-500';
        textColor = 'text-amber-400';
    } else if (score === 4) {
        label = 'STRONG';
        color = 'bg-emerald-500';
        textColor = 'text-emerald-400';
    }

    return { score, label, color, textColor, hasLength, hasNumber, hasUpperOrSpecial };
  };

  useEffect(() => {
    dispatch(fetchSchoolProfile());
  }, [dispatch]);

  const formik = useFormik({
    initialValues: {
      name: schoolProfile?.name || '',
      address: schoolProfile?.address || '',
      contact: schoolProfile?.contact || '',
      logo: null,
    },
    validationSchema,
    enableReinitialize: true,
    onSubmit: async (values) => {
      const formData = new FormData();
      formData.append('name', values.name);
      formData.append('address', values.address);
      formData.append('contact', values.contact);
      if (values.logo instanceof File) {
        formData.append('logo', values.logo);
      }

      const result = await dispatch(updateSchoolProfile(formData));
      if (!result.error) {
        toast.success('School profile updated successfully!');
        if (result.payload?.logo) {
          dispatch(updateUser({ photo: result.payload.logo }));
        }
      } else {
        toast.error(result.payload?.message || 'Failed to update profile');
      }
    },
  });

  const pwdForm = useFormik({
    initialValues: { oldPassword: '', newPassword: '', confirmPassword: '' },
    validationSchema: Yup.object({
      oldPassword: Yup.string().required('Current password is required'),
      newPassword: Yup.string().min(6, 'Password must be at least 6 characters').required('New password is required'),
      confirmPassword: Yup.string().oneOf([Yup.ref('newPassword')], 'Passwords must match').required('Please confirm your new password'),
    }),
    onSubmit: async (values, { resetForm }) => {
      const result = await dispatch(changeAdminPassword(values));
      if (!result.error) {
        toast.success('Password updated successfully!');
        resetForm();
        setIsPwdModalOpen(false);
      } else {
        toast.error(result.payload?.message || 'Update failed');
      }
    }
  });

  const handleLogoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      formik.setFieldValue('logo', file);
      setLogoPreview(URL.createObjectURL(file));
    }
  };

  const metrics = getPasswordMetrics(pwdForm.values.newPassword || '');

  return (
    <motion.div 
      initial={{ opacity: 0, y: 15 }} 
      animate={{ opacity: 1, y: 0 }}
      className="max-w-[1400px] mx-auto space-y-8 pb-20 relative font-outfit"
    >
      {/* Cyberpunk Radial Backdrop Glows */}
      <div className="absolute top-[-100px] left-[-100px] w-[600px] h-[600px] bg-gradient-to-tr from-brand-primary/10 via-indigo-500/5 to-transparent rounded-full blur-[140px] pointer-events-none -z-10"></div>
      <div className="absolute bottom-[100px] right-[-100px] w-[500px] h-[500px] bg-gradient-to-br from-indigo-500/5 via-purple-500/5 to-transparent rounded-full blur-[120px] pointer-events-none -z-10"></div>

      {/* Futuristic Header with neon status dot */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-white/5 pb-6">
        <div>
          <h1 className="text-3xl font-black text-white uppercase tracking-tighter leading-none mb-2 font-inter flex items-center gap-3 text-left">
            <Building2 size={28} className="text-brand-primary" />
            School Profile Settings
          </h1>
          <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] opacity-80 flex items-center gap-2 text-left">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
            Institution Identity, Settings & Diagnostics
          </p>
        </div>
        <div className="mt-4 md:mt-0 flex gap-4">
          <div className="bg-slate-900/60 border border-slate-800 px-4 py-2 rounded-xl flex items-center gap-3 backdrop-blur-xl">
            <Activity size={14} className="text-brand-primary animate-pulse" />
            <div className="text-left">
              <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest leading-none">SCHOOL STATUS</p>
              <p className="text-[10px] font-bold text-emerald-400">99.98% OPERATIONAL</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        
        {/* Column 1: Identity & Stats Matrix */}
        <div className="space-y-8">
          
          {/* Identity card with scanner frame */}
          <div className="bg-slate-900/30 border border-slate-800/60 p-8 rounded-2xl backdrop-blur-3xl flex flex-col items-center text-center shadow-[0_0_50px_rgba(0,0,0,0.3)] relative overflow-hidden group">
            <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-brand-primary/30"></div>
            <div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-brand-primary/30"></div>
            <div className="absolute bottom-0 left-0 w-8 h-8 border-b-2 border-l-2 border-brand-primary/30"></div>
            <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-brand-primary/30"></div>

            {/* Scanner Avatar circle/square (square is better for school logo) */}
            <div className="relative group cursor-pointer mb-6">
              <div className="w-36 h-36 rounded-2xl border-2 border-dashed border-brand-primary/40 p-1 bg-slate-900/40 backdrop-blur-3xl shadow-2xl relative overflow-hidden flex items-center justify-center transition-all duration-500 group-hover:border-brand-primary group-hover:rotate-6">
                <div className="w-full h-full rounded-xl bg-slate-950 overflow-hidden flex items-center justify-center">
                  {logoPreview || user?.photo ? (
                    <img 
                      src={logoPreview || user?.photo} 
                      alt="School Logo" 
                      className="w-full h-full object-cover transition-transform group-hover:scale-110 duration-500" 
                    />
                  ) : (
                    <Building2 size={42} className="text-slate-600 group-hover:text-brand-primary transition-colors duration-500" />
                  )}
                </div>
                {/* Scanning line effect */}
                <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-brand-primary to-transparent animate-bounce opacity-40"></div>
                
                <label className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center cursor-pointer backdrop-blur-[2px] transition-all duration-300">
                  <Upload size={20} className="text-white mb-1 animate-pulse" />
                  <span className="text-[8px] font-black uppercase tracking-widest text-white">Update Logo</span>
                  <input type="file" className="hidden" accept="image/*" onChange={handleLogoChange} />
                </label>
              </div>

              {/* Online Indicator */}
              <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-emerald-500 border-4 border-slate-900 ring-4 ring-emerald-500/10 z-10 animate-pulse" />

              {(logoPreview || user?.photo) && (
                <button
                  type="button"
                  onClick={() => { setLogoPreview(null); formik.setFieldValue('logo', null); }}
                  className="absolute -top-2 -right-2 p-1.5 bg-rose-500 rounded-lg shadow-lg hover:bg-rose-600 transition-all active:scale-95 z-20"
                >
                  <X size={12} className="text-white" />
                </button>
              )}
            </div>
            
            <h3 className="text-xl font-black text-white uppercase tracking-tight italic flex items-center gap-2">
              {schoolProfile?.name || 'SCHOOL NAME'}
            </h3>
            <span className="text-[9px] font-black text-brand-primary bg-brand-primary/10 border border-brand-primary/30 px-4 py-1.5 rounded-lg tracking-widest mt-3.5 uppercase font-mono shadow-[0_0_15px_rgba(14,165,233,0.1)]">
              {schoolProfile?.subdomain || 'SUBDOMAIN'}
            </span>

            <div className="w-full mt-8 pt-8 border-t border-slate-800/60 space-y-5 text-left">
              {[
                { label: 'Admin Email', val: schoolProfile?.adminEmail || 'not-set@mail.com', icon: Mail, hoverColor: 'group-hover:text-brand-primary group-hover:bg-brand-primary/10' },
                { label: 'Postal Address', val: schoolProfile?.address || 'Street, City, Country — Not set', icon: MapPin, hoverColor: 'group-hover:text-amber-500 group-hover:bg-amber-500/10' },
                { label: 'Quick Contact', val: schoolProfile?.contact || '+1 (000) 000-0000', icon: Phone, hoverColor: 'group-hover:text-emerald-500 group-hover:bg-emerald-500/10' },
                { label: 'Academic Session', val: schoolProfile?.academicYear || '2024-25', icon: Calendar, hoverColor: 'group-hover:text-purple-500 group-hover:bg-purple-500/10' }
              ].map((item, idx) => (
                <div key={idx} className="flex items-start gap-4 text-slate-400 group">
                  <div className={`w-10 h-10 rounded-xl bg-slate-950/60 flex items-center justify-center transition-all shrink-0 border border-slate-800/60 shadow-inner ${item.hoverColor}`}>
                    <item.icon size={16} />
                  </div>
                  <div className="text-left overflow-hidden pt-0.5 min-w-0">
                    <p className="text-[9px] font-black uppercase tracking-widest text-slate-500 mb-0.5 leading-none">{item.label}</p>
                    <span className="text-sm font-bold text-slate-200 block truncate">{item.val}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Diagnostics Widget */}
          <div className="bg-slate-900/30 border border-slate-800/60 p-6 rounded-2xl backdrop-blur-3xl shadow-xl relative">
            <div className="flex items-center gap-3 mb-6">
              <Cpu size={16} className="text-brand-primary" />
              <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest italic text-left">ACADEMIC DIAGNOSTICS</h4>
            </div>
            <div className="space-y-4">
              {[
                { label: 'ACADEMIC CALENDAR SYNC', val: '100%', pct: 100, color: 'bg-emerald-500' },
                { label: 'DATABASE INDEXING', val: 'STABLE', pct: 85, color: 'bg-indigo-500' },
                { label: 'FEES DISBURSEMENT', val: '72%', pct: 72, color: 'bg-sky-500' },
                { label: 'STAFF ROSTER ALLOCATION', val: '100%', pct: 100, color: 'bg-emerald-500' }
              ].map((diag, index) => (
                <div key={index} className="space-y-1.5 text-left">
                  <div className="flex justify-between items-center text-[8px] font-black tracking-wider text-slate-500">
                    <span>{diag.label}</span>
                    <span className="text-slate-300 font-mono">{diag.val}</span>
                  </div>
                  <div className="w-full bg-slate-950 rounded-full h-1.5 border border-slate-800/60 overflow-hidden">
                    <div 
                      className={`${diag.color} h-full rounded-full transition-all duration-1000`} 
                      style={{ width: `${diag.pct || 1}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Privilege matrix */}
          <div className="bg-slate-900/30 border border-slate-800/60 p-6 rounded-2xl backdrop-blur-3xl shadow-xl">
            <div className="flex items-center gap-3 mb-6">
              <Shield size={16} className="text-brand-primary" />
              <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest italic text-left">ROLE SCOPE MATRIX</h4>
            </div>
            <div className="space-y-3">
              {privilegeList.map((priv, idx) => (
                <div key={idx} className="flex justify-between items-center bg-slate-950/40 border border-slate-800/60 px-4 py-3 rounded-xl hover:bg-white/5 transition-all text-left">
                  <span className="text-[9px] font-black text-slate-300 uppercase tracking-widest">{priv.name}</span>
                  <span className="flex items-center gap-1.5 text-[8px] font-mono text-emerald-400 bg-emerald-400/10 border border-emerald-400/20 px-2 py-0.5 rounded-md uppercase font-black">
                    <CheckCircle2 size={10} /> DELEGATED
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Column 2 & 3: Settings Panel & Form */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Information configuration form */}
          <form onSubmit={formik.handleSubmit} className="bg-slate-900/30 border border-slate-800/60 p-8 rounded-2xl backdrop-blur-3xl shadow-2xl relative overflow-hidden group text-left">
            <div className="absolute top-0 right-0 p-6 opacity-[0.03] pointer-events-none group-hover:opacity-[0.08] transition-opacity">
              <Sliders size={180} className="text-brand-primary" />
            </div>
            
            <div className="flex items-center gap-3 border-b border-slate-800/60 pb-4 mb-6">
              <Building2 size={18} className="text-brand-primary" />
              <h3 className="text-sm font-black text-white uppercase tracking-widest">SCHOOL SETTINGS CALIBRATION</h3>
            </div>

            <div className="grid grid-cols-1 gap-6 mb-8">
              <div className="space-y-2">
                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest italic ml-1">SCHOOL NAME</label>
                <div className="relative group">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-brand-primary transition-colors">
                    <Building2 size={14} />
                  </div>
                  <input 
                    {...formik.getFieldProps('name')}
                    type="text"
                    className="w-full bg-slate-950/80 border border-slate-800 rounded-xl px-12 py-3.5 text-xs font-bold text-white placeholder:text-slate-700 focus:outline-none focus:border-brand-primary/60 focus:bg-brand-primary/[0.02] focus:shadow-[0_0_15px_rgba(14,165,233,0.15)] transition-all"
                    placeholder="School Name"
                  />
                </div>
                <Err touched={formik.touched.name} error={formik.errors.name} />
              </div>
              
              <div className="space-y-2">
                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest italic ml-1">OFFICIAL ADDRESS</label>
                <div className="relative group">
                  <div className="absolute left-4 top-5 text-slate-500 group-focus-within:text-brand-primary transition-colors">
                    <MapPin size={14} />
                  </div>
                  <textarea 
                    {...formik.getFieldProps('address')}
                    rows="3"
                    className="w-full bg-slate-950/80 border border-slate-800 rounded-xl px-12 py-3.5 text-xs font-bold text-white placeholder:text-slate-700 focus:outline-none focus:border-brand-primary/60 focus:bg-brand-primary/[0.02] focus:shadow-[0_0_15px_rgba(14,165,233,0.15)] transition-all resize-none"
                    placeholder="Official Address"
                  />
                </div>
                <Err touched={formik.touched.address} error={formik.errors.address} />
              </div>

              <div className="space-y-2">
                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest italic ml-1">CONTACT NUMBER</label>
                <div className="relative group">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-brand-primary transition-colors">
                    <Phone size={14} />
                  </div>
                  <input 
                    {...formik.getFieldProps('contact')}
                    type="text"
                    className="w-full bg-slate-950/80 border border-slate-800 rounded-xl px-12 py-3.5 text-xs font-bold text-white placeholder:text-slate-700 focus:outline-none focus:border-brand-primary/60 focus:bg-brand-primary/[0.02] focus:shadow-[0_0_15px_rgba(14,165,233,0.15)] transition-all"
                    placeholder="Contact Number"
                  />
                </div>
                <Err touched={formik.touched.contact} error={formik.errors.contact} />
              </div>
            </div>

            <button 
              type="submit"
              disabled={loading || !formik.dirty}
              className="w-full h-12 bg-gradient-to-r from-brand-primary via-indigo-500 to-brand-primary text-white text-[10px] font-black uppercase tracking-widest italic rounded-xl shadow-[0_0_30px_rgba(14,165,233,0.2)] hover:shadow-[0_0_40px_rgba(14,165,233,0.45)] hover:scale-[1.01] active:scale-95 transition-all flex items-center justify-center gap-3 border border-white/10 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? <RefreshCw className="animate-spin text-white" size={16} /> : <><Check size={16} className="text-white" /> UPDATE SCHOOL SETTINGS</>}
            </button>
          </form>

          {/* Security Credentials Override */}
          <div 
            onClick={() => setIsPwdModalOpen(true)}
            className="bg-slate-900/30 p-6 rounded-2xl border border-slate-800/60 border-dashed flex items-center justify-between group hover:bg-brand-primary/[0.04] hover:border-brand-primary/30 transition-all cursor-pointer shadow-xl relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-brand-primary/5 to-transparent rounded-bl-full pointer-events-none"></div>
            <div className="flex items-center gap-6">
              <div className="w-14 h-14 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-center text-slate-400 group-hover:text-brand-primary group-hover:border-brand-primary/30 transition-all">
                <Lock size={20} className="group-hover:rotate-12 transition-transform" />
              </div>
              <div className="text-left">
                <h4 className="text-[10px] font-black text-slate-200 uppercase tracking-[0.2em] mb-1">SECURITY CREDENTIALS OVERRIDE</h4>
                <p className="text-[9px] font-medium text-slate-500 italic">Initiate admin credential pivot and security keys.</p>
              </div>
            </div>
            <div className="w-10 h-10 rounded-xl bg-slate-950/80 border border-slate-800 flex items-center justify-center text-slate-500 group-hover:text-brand-primary group-hover:border-brand-primary/30 transition-all">
              <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

          {/* Activity logs */}
          <div className="bg-slate-900/30 border border-slate-800/60 p-8 rounded-2xl backdrop-blur-3xl shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-800/60 pb-4 mb-6">
              <div className="flex items-center gap-3">
                <Clock size={18} className="text-brand-primary" />
                <h3 className="text-sm font-black text-white uppercase tracking-widest">RECENT SESSION AUDIT TRAIL</h3>
              </div>
              <span className="text-[8px] font-mono text-slate-500 tracking-widest uppercase">REAL-TIME FEED</span>
            </div>
            <div className="space-y-4">
              {mockLogs.map((log, idx) => (
                <div key={idx} className="flex flex-col sm:flex-row justify-between sm:items-center bg-slate-950/40 border border-slate-800/60 p-4 rounded-xl gap-2 hover:bg-slate-950/80 transition-all text-left">
                  <div className="flex items-start gap-4">
                    <div className="text-[9px] font-mono text-slate-600 bg-slate-900/80 border border-slate-800 px-2.5 py-1.5 rounded-lg mt-0.5">
                      {log.time}
                    </div>
                    <div>
                      <p className="text-[10px] font-black text-slate-200 uppercase tracking-wider">{log.event}</p>
                      <p className="text-[8px] font-mono text-slate-600 tracking-wider">TELEMETRY SYNCED</p>
                    </div>
                  </div>
                  <span className="self-start sm:self-center text-[7px] font-mono font-black text-emerald-400 bg-emerald-400/10 border border-emerald-400/20 px-2 py-0.5 rounded uppercase tracking-wider">
                    {log.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Change Password Configuration Modal */}
      <PortalModal isOpen={isPwdModalOpen} onClose={() => setIsPwdModalOpen(false)} maxWidth="max-w-md">
        <div className="p-8 border-b border-slate-800/60 bg-slate-950/20 flex items-center justify-between text-left">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-brand-primary/10 border border-brand-primary/25 text-brand-primary text-[8px] font-black uppercase tracking-widest mb-3">
              <LockKeyhole size={10} /> ACCESS OVERRIDES
            </div>
            <h2 className="text-xl font-black italic uppercase tracking-tight text-white leading-none">RECALIBRATE PASSWORD</h2>
          </div>
          <button 
            onClick={() => setIsPwdModalOpen(false)} 
            className="p-2 rounded-xl hover:bg-white/5 text-slate-400 hover:text-white transition-all border border-transparent hover:border-slate-800"
          >
            <X size={18}/>
          </button>
        </div>
        
        <form onSubmit={pwdForm.handleSubmit} className="p-8 space-y-6 text-left">
          <div className="space-y-2">
            <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest italic ml-1">CURRENT PASSWORD <span className="text-brand-primary">*</span></label>
            <div className="relative">
              <input 
                required
                type={showPasswords.old ? "text" : "password"}
                {...pwdForm.getFieldProps('oldPassword')}
                className="w-full bg-slate-950 border border-slate-800 h-12 rounded-xl px-6 pr-12 text-xs font-bold text-white outline-none focus:border-brand-primary focus:bg-brand-primary/[0.01] transition-all"
                placeholder="Enter current password..."
              />
              <button 
                type="button"
                onClick={() => setShowPasswords({...showPasswords, old: !showPasswords.old})}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white transition-colors"
              >
                {showPasswords.old ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            <Err touched={pwdForm.touched.oldPassword} error={pwdForm.errors.oldPassword} />
          </div>

          <div className="space-y-2">
            <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest italic ml-1">NEW PASSWORD <span className="text-brand-primary">*</span></label>
            <div className="relative">
              <input 
                required
                type={showPasswords.new ? "text" : "password"}
                {...pwdForm.getFieldProps('newPassword')}
                className="w-full bg-slate-950 border border-slate-800 h-12 rounded-xl px-6 pr-12 text-xs font-bold text-white outline-none focus:border-brand-primary focus:bg-brand-primary/[0.01] transition-all"
                placeholder="Enter new password..."
              />
              <button 
                type="button"
                onClick={() => setShowPasswords({...showPasswords, new: !showPasswords.new})}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white transition-colors"
              >
                {showPasswords.new ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            <Err touched={pwdForm.touched.newPassword} error={pwdForm.errors.newPassword} />
            
            {pwdForm.values.newPassword && pwdForm.values.newPassword.length > 0 && (
              <div className="mt-3 space-y-3 p-4 bg-slate-950/60 border border-slate-800/60 rounded-xl transition-all duration-300">
                <div className="flex justify-between items-center text-[8px] font-black tracking-widest">
                  <span className="text-slate-500 uppercase">STRENGTH PARADIGM</span>
                  <span className={`${metrics.textColor} uppercase font-mono`}>{metrics.label}</span>
                </div>
                <div className="grid grid-cols-4 gap-1.5 h-1">
                  {[1, 2, 3, 4].map((step) => (
                    <div 
                      key={step} 
                      className={`h-full rounded-full transition-all duration-300 ${
                        step <= metrics.score ? metrics.color : 'bg-slate-800'
                      }`}
                    />
                  ))}
                </div>
                <div className="space-y-1.5 pt-1">
                  {[
                    { label: 'Minimum 6 characters required', satisfied: metrics.hasLength },
                    { label: 'Contains alphanumeric integer', satisfied: metrics.hasNumber },
                    { label: 'Includes uppercase or special token', satisfied: metrics.hasUpperOrSpecial }
                  ].map((rule, idx) => (
                    <div key={idx} className="flex items-center gap-2 text-[8px] font-black uppercase tracking-wider transition-colors duration-300">
                      <span className={`w-1.5 h-1.5 rounded-full ${rule.satisfied ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]' : 'bg-slate-700'}`}></span>
                      <span className={rule.satisfied ? 'text-emerald-400 font-bold' : 'text-slate-500 font-bold'}>{rule.label}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="space-y-2">
            <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest italic ml-1">CONFIRM NEW PASSWORD <span className="text-brand-primary">*</span></label>
            <div className="relative">
              <input 
                required
                type={showPasswords.confirm ? "text" : "password"}
                {...pwdForm.getFieldProps('confirmPassword')}
                className="w-full bg-slate-950 border border-slate-800 h-12 rounded-xl px-6 pr-12 text-xs font-bold text-white outline-none focus:border-brand-primary focus:bg-brand-primary/[0.01] transition-all"
                placeholder="Confirm new password..."
              />
              <button 
                type="button"
                onClick={() => setShowPasswords({...showPasswords, confirm: !showPasswords.confirm})}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white transition-colors"
              >
                {showPasswords.confirm ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            <Err touched={pwdForm.touched.confirmPassword} error={pwdForm.errors.confirmPassword} />
          </div>

          <button 
            disabled={loading}
            type="submit" 
            className="w-full h-12 bg-gradient-to-r from-brand-primary to-indigo-600 text-white rounded-xl flex items-center justify-center gap-3 shadow-lg shadow-brand-primary/10 hover:scale-[1.01] active:scale-95 transition-all font-outfit uppercase tracking-widest text-[10px] font-black italic border border-white/5"
          >
            {loading ? <RefreshCw className="animate-spin text-white" size={16} /> : <><Check size={16} className="text-white" /> INITIALIZE CREDENTIAL OVERRIDE</>}
          </button>
        </form>
      </PortalModal>
    </motion.div>
  );
};

export default SchoolSettings;
