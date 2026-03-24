import React, { useState, useEffect } from 'react';
import { User, Mail, Phone, Lock, Upload, Save, Eye, EyeOff } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { motion } from 'framer-motion';
import api from '../../utils/axiosInstance';

const LibrarianProfile = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    phone: '',
  });
  const [photoPreview, setPhotoPreview] = useState(null);
  const [photoFile, setPhotoFile] = useState(null);

  const [passwordData, setPasswordData] = useState({ oldPassword: '', newPassword: '', confirmPassword: '' });
  const [showPassword, setShowPassword] = useState({ old: false, new: false, confirm: false });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const { data } = await api.get('/librarian/profile');
      setProfile(data);
      setFormData({
        firstName: data.firstName || '',
        lastName: data.lastName || '',
        phone: data.phone || '',
      });
      if (data.photo) setPhotoPreview(data.photo);
    } catch (err) {
      toast.error('Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setPhotoFile(file);
      setPhotoPreview(URL.createObjectURL(file));
      setEditMode(true);
    }
  };

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    try {
      const data = new FormData();
      data.append('firstName', formData.firstName);
      data.append('lastName', formData.lastName);
      data.append('phone', formData.phone);
      if (photoFile) data.append('photo', photoFile);

      const response = await api.put('/librarian/profile', data);
      setProfile(response.data.data);
      setEditMode(false);
      toast.success('Profile updated successfully');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Update failed');
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      return toast.error('New passwords do not match');
    }
    if (passwordData.newPassword.length < 6) {
      return toast.error('Password must be at least 6 characters');
    }

    try {
      await api.post('/librarian/change-password', {
        oldPassword: passwordData.oldPassword,
        newPassword: passwordData.newPassword
      });
      toast.success('Password changed successfully');
      setPasswordData({ oldPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to change password');
    }
  };

  if (loading) return <div className="p-8 text-center text-slate-400">Loading node data...</div>;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-white uppercase tracking-widest italic flex items-center gap-3">
            <User className="text-librarian-primary" size={28} />
            Archive Guardian Profile
          </h1>
          <p className="text-sm text-slate-400 mt-1 uppercase tracking-widest text-[10px]">Manage your access nodes</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Profile Details */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="md:col-span-2 bg-brand-surface border border-brand-border rounded-xl p-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-librarian-primary/5 rounded-full blur-3xl -mr-10 -mt-10" />
          
          <h2 className="text-xs font-black text-white/50 uppercase tracking-[0.2em] mb-6 flex items-center gap-2">
            Identity Matrix
            <div className="h-px bg-white/10 flex-1 ml-2" />
          </h2>

          <form onSubmit={handleProfileUpdate} className="space-y-6">
            <div className="flex items-center gap-6">
              <div className="relative group">
                <div className="w-24 h-24 rounded-xl bg-brand-background border-2 border-dashed border-brand-border flex items-center justify-center overflow-hidden transition-colors group-hover:border-librarian-primary">
                  {photoPreview ? (
                     <img src={photoPreview} alt="Profile" className="w-full h-full object-cover" />
                  ) : (
                    <User size={32} className="text-slate-500" />
                  )}
                </div>
                <label className="absolute -bottom-3 -right-3 p-2 bg-librarian-primary text-black rounded-lg cursor-pointer shadow-lg hover:scale-110 transition-transform">
                  <Upload size={14} />
                  <input type="file" className="hidden" accept="image/*" onChange={handlePhotoChange} />
                </label>
              </div>
              <div>
                <h3 className="text-lg font-black text-white uppercase italic">{profile?.firstName} {profile?.lastName}</h3>
                <p className="text-librarian-primary text-xs uppercase tracking-widest">{profile?.role}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest italic">First Name</label>
                <input
                  type="text"
                  value={formData.firstName}
                  onChange={e => { setFormData({...formData, firstName: e.target.value}); setEditMode(true); }}
                  className="w-full bg-brand-background border border-brand-border rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-librarian-primary transition-colors text-sm"
                  placeholder="First Name"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest italic">Last Name</label>
                <input
                  type="text"
                  value={formData.lastName}
                  onChange={e => { setFormData({...formData, lastName: e.target.value}); setEditMode(true); }}
                  className="w-full bg-brand-background border border-brand-border rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-librarian-primary transition-colors text-sm"
                  placeholder="Last Name"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest italic">Email (Static)</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
                  <input
                    type="email"
                    value={profile?.email}
                    disabled
                    className="w-full bg-brand-background border border-brand-border rounded-lg pl-10 pr-4 py-2.5 text-slate-400 opacity-70 text-sm cursor-not-allowed"
                  />
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest italic">Phone Node</label>
                 <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
                  <input
                    type="text"
                    value={formData.phone}
                    onChange={e => { setFormData({...formData, phone: e.target.value}); setEditMode(true); }}
                    className="w-full bg-brand-background border border-brand-border rounded-lg pl-10 pr-4 py-2.5 text-white focus:outline-none focus:border-librarian-primary transition-colors text-sm"
                    placeholder="Contact Number"
                  />
                </div>
              </div>
            </div>

            {editMode && (
              <div className="flex justify-end pt-4">
                <button type="submit" className="flex items-center gap-2 bg-librarian-primary text-black px-6 py-2 rounded-lg font-black uppercase tracking-widest text-xs hover:bg-librarian-secondary transition-colors italic">
                  <Save size={16} /> Replace Identity Vector
                </button>
              </div>
            )}
          </form>
        </motion.div>

        {/* Password Reset */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-brand-surface border border-brand-border rounded-xl p-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 rounded-full blur-3xl -mr-10 -mt-10" />
          
          <h2 className="text-xs font-black text-white/50 uppercase tracking-[0.2em] mb-6 flex items-center gap-2">
            Security Block
            <div className="h-px bg-white/10 flex-1 ml-2" />
          </h2>

          <form onSubmit={handlePasswordChange} className="space-y-4">
             <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest italic">Current Key</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
                  <input
                    type={showPassword.old ? 'text' : 'password'}
                    value={passwordData.oldPassword}
                    onChange={e => setPasswordData({...passwordData, oldPassword: e.target.value})}
                    required
                    className="w-full bg-brand-background border border-brand-border rounded-lg pl-10 pr-10 py-2.5 text-white focus:outline-none focus:border-amber-500 transition-colors text-sm"
                  />
                  <button type="button" onClick={() => setShowPassword({...showPassword, old: !showPassword.old})} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500">
                    {showPassword.old ? <EyeOff size={16}/> : <Eye size={16}/>}
                  </button>
                </div>
              </div>

               <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest italic">New Key</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
                  <input
                    type={showPassword.new ? 'text' : 'password'}
                    value={passwordData.newPassword}
                    onChange={e => setPasswordData({...passwordData, newPassword: e.target.value})}
                    required
                    minLength={6}
                    className="w-full bg-brand-background border border-brand-border rounded-lg pl-10 pr-10 py-2.5 text-white focus:outline-none focus:border-amber-500 transition-colors text-sm"
                  />
                  <button type="button" onClick={() => setShowPassword({...showPassword, new: !showPassword.new})} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500">
                    {showPassword.new ? <EyeOff size={16}/> : <Eye size={16}/>}
                  </button>
                </div>
              </div>

               <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest italic">Confirm Key</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
                  <input
                    type={showPassword.confirm ? 'text' : 'password'}
                    value={passwordData.confirmPassword}
                    onChange={e => setPasswordData({...passwordData, confirmPassword: e.target.value})}
                    required
                    className="w-full bg-brand-background border border-brand-border rounded-lg pl-10 pr-10 py-2.5 text-white focus:outline-none focus:border-amber-500 transition-colors text-sm"
                  />
                  <button type="button" onClick={() => setShowPassword({...showPassword, confirm: !showPassword.confirm})} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500">
                    {showPassword.confirm ? <EyeOff size={16}/> : <Eye size={16}/>}
                  </button>
                </div>
              </div>

              <button type="submit" disabled={!passwordData.oldPassword || !passwordData.newPassword || !passwordData.confirmPassword} className="w-full mt-4 bg-brand-background border border-amber-500/50 text-amber-500 px-4 py-2.5 rounded-lg font-black uppercase tracking-widest text-xs hover:bg-amber-500/10 transition-colors disabled:opacity-50 disabled:cursor-not-allowed italic">
                Update Security Root
              </button>
          </form>
        </motion.div>
      </div>
    </div>
  );
};

export default LibrarianProfile;
