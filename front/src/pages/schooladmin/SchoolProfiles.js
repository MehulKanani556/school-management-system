import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchSchoolProfile, updateSchoolProfile, changeAdminPassword } from '../../redux/slice/schoolAdmin.slice';

import { logout, updateUser } from '../../redux/slice/auth.slice';

import { useFormik } from 'formik';

import * as Yup from 'yup';
import { motion, AnimatePresence } from 'framer-motion';
import { Save, Upload, X, Building2, MapPin, Phone, Mail, Globe, Calendar, Lock, Key } from 'lucide-react';


import toast from 'react-hot-toast';

const validationSchema = Yup.object({
  name: Yup.string().min(3, 'Min 3 characters').required('School name is required'),
  address: Yup.string().required('Address is required'),
  contact: Yup.string().matches(/^[0-9+\-\s()]{7,15}$/, 'Invalid contact number').required('Contact is required'),
  logo: Yup.mixed().nullable(),
});

const ic = (touched, error) =>
  `mt-1.5 w-full bg-slate-800 border ${touched && error ? 'border-red-500/60' : 'border-slate-700'} focus:border-brand-primary rounded-xl py-3 px-4 text-white placeholder-slate-500 outline-none text-sm transition-all`;

const Err = ({ touched, error }) =>
  touched && error ? <p className="mt-1 text-[10px] text-red-400 font-bold tracking-wide">{error}</p> : null;

const SchoolSettings = () => {
  const dispatch = useDispatch();
  const { schoolProfile, loading } = useSelector((s) => s.schoolAdmin);
  console.log(schoolProfile, "--------------");

  const { user } = useSelector((state) => state.auth);
  const [logoPreview, setLogoPreview] = useState(null);
  const [isPwdModalOpen, setIsPwdModalOpen] = useState(false);



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


  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black uppercase tracking-tighter font-outfit text-white">School Profile</h1>
          <p className="text-slate-400 text-sm mt-1">Manage your school's public profile and identity</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Logo Preview */}
        <div className="space-y-6">
          <div className="bg-brand-surface/40 backdrop-blur-xl border border-brand-border/40 rounded-[2.5rem] p-8 flex flex-col items-center text-center">
            <div className="relative group">
              <div className="w-40 h-40 rounded-[2.5rem] bg-slate-800 border-2 border-brand-primary/20 overflow-hidden flex items-center justify-center transition-all group-hover:border-brand-primary shadow-2xl relative">
                {logoPreview || user?.photo ? (
                  <img
                    src={logoPreview || user?.photo}
                    className="w-full h-full object-cover"
                    alt="Profile Avatar"
                  />

                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-brand-primary to-brand-secondary flex items-center justify-center">
                    <Building2 size={54} className="text-white" />
                  </div>
                )}

                <label className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center cursor-pointer backdrop-blur-[2px]">
                  <Upload size={28} className="text-white mb-2" />
                  <span className="text-[10px] font-black uppercase tracking-widest text-white">Update Logo</span>
                  <input type="file" className="hidden" accept="image/*" onChange={handleLogoChange} />
                </label>
              </div>

              {/* Online Indicator matching Header */}
              <div className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full bg-emerald-500 border-4 border-brand-background ring-4 ring-emerald-500/10 z-10" />


              {(logoPreview || user?.photo) && (
                <button
                  type="button"
                  onClick={() => { setLogoPreview(null); formik.setFieldValue('logo', null); }}
                  className="absolute -top-2 -right-2 p-2 bg-rose-500 rounded-xl shadow-lg hover:bg-rose-600 transition-all active:scale-95"
                >
                  <X size={14} className="text-white" />
                </button>
              )}

            </div>

            <div className="mt-8 space-y-2">
              <h3 className="text-2xl font-black text-white leading-tight font-outfit uppercase tracking-tighter">{schoolProfile?.name || 'School Name'}</h3>
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-brand-primary bg-brand-primary/10 px-4 py-1.5 rounded-full inline-block">
                {schoolProfile?.subdomain}
              </p>
            </div>

            <div className="w-full mt-10 pt-10 border-t border-white/10 space-y-6">
              <div className="flex items-start gap-4 text-slate-400 group">
                <div className="w-10 h-10 rounded-xl bg-slate-800/40 flex items-center justify-center group-hover:bg-brand-primary/10 group-hover:text-brand-primary transition-all shrink-0 border border-white/5 shadow-inner">
                  <Mail size={16} />
                </div>
                <div className="text-left overflow-hidden pt-0.5">
                  <p className="text-[9px] font-black uppercase tracking-widest text-slate-500 mb-0.5">Admin Email</p>
                  <span className="text-sm font-bold text-slate-200 truncate block">{schoolProfile?.adminEmail || 'not-set@mail.com'}</span>
                </div>
              </div>

              <div className="flex items-start gap-4 text-slate-400 group">
                <div className="w-10 h-10 rounded-xl bg-slate-800/40 flex items-center justify-center group-hover:bg-amber-500/10 group-hover:text-amber-500 transition-all shrink-0 border border-white/5 shadow-inner">
                  <MapPin size={16} />
                </div>
                <div className="text-left overflow-hidden pt-0.5">
                  <p className="text-[9px] font-black uppercase tracking-widest text-slate-500 mb-0.5">Postal Address</p>
                  <span className="text-sm font-bold text-slate-200 block line-clamp-2">{schoolProfile?.address || 'Street, City, Country — Not set'}</span>
                </div>
              </div>

              <div className="flex items-start gap-4 text-slate-400 group">
                <div className="w-10 h-10 rounded-xl bg-slate-800/40 flex items-center justify-center group-hover:bg-emerald-500/10 group-hover:text-emerald-500 transition-all shrink-0 border border-white/5 shadow-inner">
                  <Phone size={16} />
                </div>
                <div className="text-left pt-0.5">
                  <p className="text-[9px] font-black uppercase tracking-widest text-slate-500 mb-0.5">Quick Contact</p>
                  <span className="text-sm font-bold text-slate-200 uppercase tracking-wider">{schoolProfile?.contact || '+1 (000) 000-0000'}</span>
                </div>
              </div>

              <div className="flex items-start gap-4 text-slate-400 group">
                <div className="w-10 h-10 rounded-xl bg-slate-800/40 flex items-center justify-center group-hover:bg-purple-500/10 group-hover:text-purple-500 transition-all shrink-0 border border-white/5 shadow-inner">
                  <Calendar size={16} />
                </div>
                <div className="text-left pt-0.5">
                  <p className="text-[9px] font-black uppercase tracking-widest text-slate-500 mb-0.5">Academic Session</p>
                  <span className="text-sm font-bold text-slate-200 uppercase tracking-[0.2em]">{schoolProfile?.academicYear || '2024-25'}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Form */}
        <div className="lg:col-span-2 space-y-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-brand-surface/40 backdrop-blur-xl border border-brand-border/40 rounded-[2.5rem] p-8 lg:p-10"
          >
            <form onSubmit={formik.handleSubmit} className="space-y-8">
              <div className="space-y-6">
                <div className="flex items-center justify-between gap-3 mb-2">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-brand-primary/10 flex items-center justify-center">
                      <Building2 size={20} className="text-brand-primary" />
                    </div>
                    <div>
                      <h2 className="text-lg font-bold text-white uppercase tracking-tight">Institution Details</h2>
                      <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Base Identity Settings</p>
                    </div>
                  </div>
                  
                  {/* Moved Change Password Button */}
                  <button
                    type="button"
                    onClick={() => setIsPwdModalOpen(true)}
                    className="flex items-center gap-2 px-6 py-3 bg-slate-800/40 hover:bg-orange-500/10 text-slate-400 hover:text-orange-500 border border-white/5 hover:border-orange-500/20 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all group scale-90"
                  >
                    <Key size={14} className="group-hover:rotate-12 transition-transform" />
                    Update Security
                  </button>
                </div>


                <div className="grid grid-cols-1 gap-6">
                  <div>
                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 ml-1">School Name</label>
                    <div className="relative">
                      <input
                        {...formik.getFieldProps('name')}
                        placeholder="Enter school name"
                        className={ic(formik.touched.name, formik.errors.name)}
                      />
                    </div>
                    <Err touched={formik.touched.name} error={formik.errors.name} />
                  </div>

                  <div>
                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 ml-1">Official Address</label>
                    <div className="relative">
                      <MapPin size={16} className="absolute left-4 top-[1.2rem] text-slate-500" />
                      <textarea
                        {...formik.getFieldProps('address')}
                        placeholder="Street, City, State, ZIP"
                        rows="3"
                        className={`${ic(formik.touched.address, formik.errors.address)} pl-12 resize-none`}
                      ></textarea>
                    </div>
                    <Err touched={formik.touched.address} error={formik.errors.address} />
                  </div>

                  <div>
                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 ml-1">Contact Number</label>
                    <div className="relative">
                      <Phone size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
                      <input
                        {...formik.getFieldProps('contact')}
                        placeholder="+1 (234) 567-8900"
                        className={`${ic(formik.touched.contact, formik.errors.contact)} pl-12`}
                      />
                    </div>
                    <Err touched={formik.touched.contact} error={formik.errors.contact} />
                  </div>
                </div>
              </div>

              <div className="pt-4">
                <button
                  type="submit"
                  disabled={loading || !formik.dirty}
                  className="w-full lg:w-auto px-10 py-4 bg-brand-primary hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed rounded-2xl font-black text-xs uppercase tracking-[0.2em] text-white shadow-xl shadow-brand-primary/20 transition-all flex items-center justify-center gap-3 active:scale-[0.98]"
                >
                  {loading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Saving Changes...
                    </>
                  ) : (
                    <>
                      <Save size={18} />
                      Save Profile Updates
                    </>
                  )}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      </div>

      {/* Change Password Modal */}
      <AnimatePresence>
        {isPwdModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsPwdModalOpen(false)}
              className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm"
            />

            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative w-full max-w-md bg-[#12121e] border border-white/10 rounded-[2.5rem] p-8 md:p-10 shadow-3xl overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-40 h-40 bg-orange-500/10 rounded-full blur-[80px] -mr-20 -mt-20" />

              <div className="flex items-center justify-between mb-8 relative">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-orange-500/10 flex items-center justify-center text-orange-500 border border-orange-500/10">
                    <Lock size={20} />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white uppercase tracking-tighter">Secure Account</h3>
                    <p className="text-[10px] text-slate-500 uppercase tracking-widest font-black leading-none mt-1">Update Security Credentials</p>
                  </div>
                </div>
                <button
                  onClick={() => setIsPwdModalOpen(false)}
                  className="p-2 hover:bg-white/5 rounded-xl transition-all"
                >
                  <X size={18} className="text-slate-500" />
                </button>
              </div>

              <form onSubmit={pwdForm.handleSubmit} className="space-y-5 relative">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Current Secret</label>
                  <input
                    type="password"
                    placeholder="Enter old password"
                    {...pwdForm.getFieldProps('oldPassword')}
                    className={ic(pwdForm.touched.oldPassword, pwdForm.errors.oldPassword)}
                  />
                  <Err touched={pwdForm.touched.oldPassword} error={pwdForm.errors.oldPassword} />

                </div>

                <div className="space-y-2 border-t border-white/5 pt-5">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">New Secret Key</label>
                  <input
                    type="password"
                    placeholder="Create new password"
                    {...pwdForm.getFieldProps('newPassword')}
                    className={ic(pwdForm.touched.newPassword, pwdForm.errors.newPassword)}
                  />
                  <Err touched={pwdForm.touched.newPassword} error={pwdForm.errors.newPassword} />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Confirm New Key</label>
                  <input
                    type="password"
                    placeholder="Verify new password"
                    {...pwdForm.getFieldProps('confirmPassword')}
                    className={ic(pwdForm.touched.confirmPassword, pwdForm.errors.confirmPassword)}
                  />
                  <Err touched={pwdForm.touched.confirmPassword} error={pwdForm.errors.confirmPassword} />
                </div>

                <div className="pt-6">
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full h-12 py-4.5 bg-brand-primary hover:bg-orange-600 active:scale-[0.98] text-white rounded-2xl text-[11px] font-black uppercase tracking-[0.2em] transition-all shadow-xl shadow-brand-primary/20 disabled:opacity-50"
                  >
                    {loading ? 'Processing...' : 'Secure Account Now'}
                  </button>
                  <p className="text-[10px] text-slate-600 text-center mt-4">
                    Security updates require re-verification based on your session.
                  </p>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default SchoolSettings;
