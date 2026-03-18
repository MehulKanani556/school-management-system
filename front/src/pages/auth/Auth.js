import React, { useState, useEffect } from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { useDispatch, useSelector } from 'react-redux';
import { login, register, clearMessage } from '../../redux/slice/auth.slice';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, Lock, User, UserPlus, Image as ImageIcon, Briefcase, Loader2, ArrowRight, LogIn } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Auth = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { loading, error, message, isAuthenticated } = useSelector((state) => state.auth);
    const [activeTab, setActiveTab] = useState('login'); // 'login' or 'signup'
    const [preview, setPreview] = useState(null);

    useEffect(() => {
        if (isAuthenticated) {
            navigate('/');
        }
    }, [isAuthenticated, navigate]);

    useEffect(() => {
        if (message || error) {
            const timer = setTimeout(() => {
                dispatch(clearMessage());
            }, 5000);
            return () => clearTimeout(timer);
        }
    }, [message, error, dispatch]);

    // Login Formik
    const loginFormik = useFormik({
        initialValues: {
            email: '',
            password: '',
        },
        validationSchema: Yup.object({
            email: Yup.string().email('Invalid email address').required('Email is required'),
            password: Yup.string().required('Password is required'),
        }),
        onSubmit: (values) => {
            dispatch(login(values));
        },
    });

    // Signup Formik
    const signupFormik = useFormik({
        initialValues: {
            firstName: '',
            lastName: '',
            email: '',
            password: '',
            role: 'Student',
            photo: null,
        },
        validationSchema: Yup.object({
            firstName: Yup.string().required('First name is required'),
            lastName: Yup.string().required('Last name is required'),
            email: Yup.string().email('Invalid email address').required('Email is required'),
            password: Yup.string().min(6, 'Password must be at least 6 characters').required('Password is required'),
            role: Yup.string().required('Role is required'),
            photo: Yup.mixed().required('Profile photo is required'),
        }),
        onSubmit: (values) => {
            const formData = new FormData();
            formData.append('firstName', values.firstName);
            formData.append('lastName', values.lastName);
            formData.append('email', values.email);
            formData.append('password', values.password);
            formData.append('role', values.role);
            formData.append('photo', values.photo);
            dispatch(register(formData));
        },
    });

    const handleFileChange = (e) => {
        const file = e.currentTarget.files[0];
        if (file) {
            signupFormik.setFieldValue('photo', file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setPreview(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-brand-background py-16 px-4 selection:bg-brand-primary/20 font-inter">
            {/* Dynamic Background Elements */}
            <div className="absolute top-[-10%] left-[-10%] w-[45%] h-[45%] bg-brand-primary/15 rounded-full blur-[140px] animate-pulse-slow"></div>
            <div className="absolute bottom-[-10%] right-[-10%] w-[45%] h-[45%] bg-brand-secondary/15 rounded-full blur-[140px] animate-pulse-slow delay-1000"></div>

            <motion.div
                layout
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                className="w-full max-w-2xl relative z-10"
            >
                <div className="bg-brand-surface/70 backdrop-blur-[32px] border border-brand-border/40 rounded-[3rem] shadow-[0_25px_60px_-15px_rgba(0,0,0,0.5)] overflow-hidden p-8 md:p-14">
                    {/* Header */}
                    <div className="text-center mb-14">
                        <motion.div
                            initial={{ scale: 0.8 }}
                            animate={{ scale: 1 }}
                            className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-gradient-to-br from-brand-primary to-brand-secondary mb-8 shadow-[0_8px_30px_rgb(37,99,235,0.2)]"
                        >
                            {activeTab === 'login' ? <LogIn className="text-white w-10 h-10" /> : <UserPlus className="text-white w-10 h-10" />}
                        </motion.div>
                        <h1 className="text-5xl font-black text-white tracking-tighter uppercase font-outfit">School Portal</h1>
                        <p className="text-slate-400 mt-3 font-medium tracking-wide text-lg">Manage your academic journey with ease</p>
                    </div>

                    {/* Custom Tabs */}
                    <div className="flex p-1.5 bg-slate-800/20 rounded-2xl border border-brand-border/30 mb-8 max-w-[340px] mx-auto overflow-hidden relative">
                        <motion.div
                            layoutId="activeTab"
                            className="absolute inset-y-1.5 left-1.5 bg-brand-primary rounded-xl shadow-[0_4px_12px_rgba(37,99,235,0.4)]"
                            style={{ width: 'calc(50% - 1.5px)', left: activeTab === 'login' ? '6px' : 'calc(50% + 1.5px)' }}
                            transition={{ type: "spring", stiffness: 350, damping: 30 }}
                        />
                        <button
                            onClick={() => { setActiveTab('login'); dispatch(clearMessage()); }}
                            className={`flex-1 py-3 text-sm font-black uppercase tracking-[0.2em] relative z-10 transition-colors ${activeTab === 'login' ? 'text-white' : 'text-slate-500 hover:text-slate-300 font-outfit'}`}
                        >
                            Login
                        </button>
                        <button
                            onClick={() => { setActiveTab('signup'); dispatch(clearMessage()); }}
                            className={`flex-1 py-3 text-sm font-black uppercase tracking-[0.2em] relative z-10 transition-colors ${activeTab === 'signup' ? 'text-white' : 'text-slate-500 hover:text-slate-300 font-outfit'}`}
                        >
                            Signup
                        </button>
                    </div>

                    <AnimatePresence mode="wait">
                        {(error || message) && (
                            <motion.div
                                initial={{ opacity: 0, y: -12 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: 12 }}
                                className={`px-5 py-4 rounded-2xl mb-10 text-sm flex items-center gap-4 border ${error ? 'bg-luxury-rose/10 border-luxury-rose/20 text-luxury-rose' : 'bg-luxury-emerald/10 border-luxury-emerald/20 text-luxury-emerald'}`}
                            >
                                <div className={`w-2 h-2 rounded-full ${error ? 'bg-luxury-rose' : 'bg-luxury-emerald'}`}></div>
                                {error || message}
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Forms Container */}
                    <motion.div
                        key={activeTab}
                        initial={{ opacity: 0, x: activeTab === 'login' ? -30 : 30 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: activeTab === 'login' ? 30 : -30 }}
                        transition={{ duration: 0.4, ease: "circOut" }}
                    >
                        {activeTab === 'login' ? (
                            <form onSubmit={loginFormik.handleSubmit} className="space-y-8">
                                <div className="space-y-3">
                                    <label className="text-xs text-slate-400 ml-1 tracking-[0.25em] uppercase font-black opacity-80 font-outfit">Email Address</label>
                                    <div className="relative group">
                                        <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none text-slate-500 group-focus-within:text-brand-primary transition-colors">
                                            <Mail size={18} />
                                        </div>
                                        <input
                                            type="email"
                                            {...loginFormik.getFieldProps('email')}
                                            className={`w-full bg-slate-800/10 border ${loginFormik.touched.email && loginFormik.errors.email ? 'border-luxury-rose/40' : 'border-brand-border/40'} focus:border-brand-primary outline-none rounded-2xl py-4 pl-12 pr-5 text-white placeholder-slate-600 transition-all font-inter`}
                                            placeholder="john.doe@school.edu"
                                        />
                                    </div>
                                    {loginFormik.touched.email && loginFormik.errors.email && (
                                        <p className="text-[10px] text-luxury-rose font-black ml-1 uppercase tracking-tighter">{loginFormik.errors.email}</p>
                                    )}
                                </div>

                                <div className="space-y-3">
                                    <div className="flex justify-between items-center ml-1">
                                        <label className="text-xs text-slate-400 tracking-[0.25em] uppercase font-black opacity-80 font-outfit">Password</label>
                                        <Link to="/forgot-password" size="sm" className="text-[10px] text-brand-accent font-black hover:text-cyan-400 uppercase tracking-widest italic outline-none">Forgot Password?</Link>
                                    </div>
                                    <div className="relative group">
                                        <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none text-slate-500 group-focus-within:text-brand-primary transition-colors">
                                            <Lock size={18} />
                                        </div>
                                        <input
                                            type="password"
                                            {...loginFormik.getFieldProps('password')}
                                            className={`w-full bg-slate-800/10 border ${loginFormik.touched.password && loginFormik.errors.password ? 'border-luxury-rose/40' : 'border-brand-border/40'} focus:border-brand-primary outline-none rounded-2xl py-4 pl-12 pr-5 text-white placeholder-slate-600 transition-all font-inter`}
                                            placeholder="••••••••"
                                        />
                                    </div>
                                    {loginFormik.touched.password && loginFormik.errors.password && (
                                        <p className="text-[10px] text-luxury-rose font-black ml-1 uppercase tracking-tighter">{loginFormik.errors.password}</p>
                                    )}
                                </div>

                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full relative group mt-6 overflow-hidden rounded-[1.25rem] bg-brand-primary disabled:opacity-70 text-white py-5 font-black tracking-[0.3em] uppercase transition-all hover:bg-blue-500 active:scale-[0.98] shadow-2xl shadow-brand-primary/20 font-outfit"
                                >
                                    <div className="relative z-10 flex items-center justify-center gap-3">
                                        {loading ? <Loader2 className="animate-spin w-5 h-5" /> : <>Sign In <ArrowRight className="w-5 h-5 group-hover:translate-x-1.5 transition-transform" /></>}
                                    </div>
                                    <div className="absolute inset-0 bg-gradient-to-r from-blue-400/20 to-brand-secondary/20 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                                </button>
                            </form>
                        ) : (
                            <form onSubmit={signupFormik.handleSubmit} className="space-y-7">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-[10px] text-slate-400 ml-1 tracking-[0.25em] uppercase font-black opacity-80 font-outfit">First Name</label>
                                        <div className="relative group">
                                            <User size={16} className="absolute inset-y-0 left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-brand-primary transition-colors" />
                                            <input
                                                type="text"
                                                {...signupFormik.getFieldProps('firstName')}
                                                className={`w-full bg-slate-800/10 border ${signupFormik.touched.firstName && signupFormik.errors.firstName ? 'border-luxury-rose/40' : 'border-brand-border/40'} focus:border-brand-primary outline-none rounded-2xl py-3.5 pl-11 pr-5 text-white placeholder-slate-600 transition-all text-sm font-inter`}
                                                placeholder="John"
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] text-slate-400 ml-1 tracking-[0.25em] uppercase font-black opacity-80 font-outfit">Last Name</label>
                                        <div className="relative group">
                                            <User size={16} className="absolute inset-y-0 left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-brand-primary transition-colors" />
                                            <input
                                                type="text"
                                                {...signupFormik.getFieldProps('lastName')}
                                                className={`w-full bg-slate-800/10 border ${signupFormik.touched.lastName && signupFormik.errors.lastName ? 'border-luxury-rose/40' : 'border-brand-border/40'} focus:border-brand-primary outline-none rounded-2xl py-3.5 pl-11 pr-5 text-white placeholder-slate-600 transition-all text-sm font-inter`}
                                                placeholder="Doe"
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] text-slate-400 ml-1 tracking-[0.25em] uppercase font-black opacity-80 font-outfit">Email Address</label>
                                    <div className="relative group">
                                        <Mail size={16} className="absolute inset-y-0 left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-brand-primary transition-colors" />
                                        <input
                                            type="email"
                                            {...signupFormik.getFieldProps('email')}
                                            className={`w-full bg-slate-800/10 border ${signupFormik.touched.email && signupFormik.errors.email ? 'border-luxury-rose/40' : 'border-brand-border/40'} focus:border-brand-primary outline-none rounded-2xl py-3.5 pl-11 pr-5 text-white placeholder-slate-600 transition-all text-sm font-inter`}
                                            placeholder="john.doe@school.edu"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-[10px] text-slate-400 ml-1 tracking-[0.25em] uppercase font-black opacity-80 font-outfit">Password</label>
                                        <div className="relative group">
                                            <Lock size={16} className="absolute inset-y-0 left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-brand-primary transition-colors" />
                                            <input
                                                type="password"
                                                {...signupFormik.getFieldProps('password')}
                                                className={`w-full bg-slate-800/10 border ${signupFormik.touched.password && signupFormik.errors.password ? 'border-luxury-rose/40' : 'border-brand-border/40'} focus:border-brand-primary outline-none rounded-2xl py-3.5 pl-11 pr-5 text-white placeholder-slate-600 transition-all text-sm font-inter`}
                                                placeholder="••••••••"
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] text-slate-400 ml-1 tracking-[0.25em] uppercase font-black opacity-80 font-outfit">Role</label>
                                        <div className="relative group">
                                            <Briefcase size={16} className="absolute inset-y-0 left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-brand-primary transition-colors" />
                                            <select
                                                {...signupFormik.getFieldProps('role')}
                                                className="w-full bg-slate-800/20 border border-brand-border/40 focus:border-brand-primary outline-none rounded-2xl py-3.5 pl-11 pr-5 text-white appearance-none transition-all text-sm font-outfit"
                                            >
                                                <option value="Student" className="bg-slate-900">Student</option>
                                                <option value="Teacher" className="bg-slate-900">Teacher</option>
                                                <option value="School_Admin" className="bg-slate-900">Admin</option>
                                            </select>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <label className="text-[10px] text-slate-400 ml-1 tracking-[0.25em] uppercase font-black opacity-80 font-outfit">Profile Picture</label>
                                    <div className="flex items-center gap-6 px-5 py-4 bg-slate-800/10 border border-dashed border-brand-border/40 rounded-2xl group hover:border-brand-primary/40 transition-all duration-300">
                                        <div className="w-12 h-12 rounded-xl bg-slate-800 border border-brand-border/40 flex items-center justify-center overflow-hidden flex-shrink-0 shadow-inner">
                                            {preview ? <img src={preview} alt="Preview" className="w-full h-full object-cover" /> : <ImageIcon size={20} className="text-slate-600" />}
                                        </div>
                                        <div className="flex-1">
                                            <label htmlFor="auth-photo" className="text-xs font-black text-brand-primary hover:text-blue-400 cursor-pointer block tracking-wider uppercase underline underline-offset-4 decoration-current/30">Upload Badge</label>
                                            <p className="text-[10px] text-slate-600 font-bold tracking-tight uppercase mt-1">PNG, JPG or WEBP (Max 5MB)</p>
                                        </div>
                                        <input type="file" id="auth-photo" accept="image/*" onChange={handleFileChange} className="hidden" />
                                    </div>
                                    {signupFormik.touched.photo && signupFormik.errors.photo && (
                                        <p className="text-[10px] text-luxury-rose font-black ml-1 uppercase tracking-tighter">{signupFormik.errors.photo}</p>
                                    )}
                                </div>

                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full relative group mt-4 overflow-hidden rounded-[1.25rem] bg-gradient-to-br from-brand-primary to-brand-secondary disabled:opacity-70 text-white py-5 font-black tracking-[0.3em] uppercase transition-all hover:shadow-[0_0_35px_-5px_rgba(37,99,235,0.35)] active:scale-[0.98] font-outfit"
                                >
                                    <div className="relative z-10 flex items-center justify-center gap-3">
                                        {loading ? <Loader2 className="animate-spin w-5 h-5" /> : <>Create Account <ArrowRight className="w-5 h-5 group-hover:translate-x-1.5 transition-transform" /></>}
                                    </div>
                                </button>
                            </form>
                        )}
                    </motion.div>
                </div>
            </motion.div>
        </div>
    );
};

export default Auth;
