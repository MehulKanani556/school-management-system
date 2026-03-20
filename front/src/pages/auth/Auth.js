import React, { useEffect, useState } from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { useDispatch, useSelector } from 'react-redux';
import { login, studentLogin, clearAuthError, clearAuthMessage } from '../../redux/slice/auth.slice';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, Lock, Loader2, ArrowRight, LogIn, Eye, EyeOff } from 'lucide-react';
import { motion } from 'framer-motion';

const Auth = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { loading, error, message, isAuthenticated } = useSelector((state) => state.auth);
    const [showPassword, setShowPassword] = useState(false);
    const [loginRole, setLoginRole] = useState('Standard'); // 'Standard' or 'Student'

    useEffect(() => {
        if (isAuthenticated) {
            navigate('/');
        }
    }, [isAuthenticated, navigate]);

    // Login Formik
    const loginFormik = useFormik({
        initialValues: {
            email: '',
            admissionNumber: '',
            password: '',
        },
        validationSchema: Yup.object({
            email: loginRole === 'Standard' ? Yup.string().email('Invalid email address').required('Email is required') : Yup.string(),
            admissionNumber: loginRole === 'Student' ? Yup.string().required('Admission Number is required') : Yup.string(),
            password: Yup.string().required('Password is required'),
        }),
        onSubmit: (values) => {
            if (loginRole === 'Student') {
                dispatch(studentLogin({ admissionNumber: values.admissionNumber, password: values.password }));
            } else {
                // Both Standard and Parent use email/password
                dispatch(login({ email: values.email, password: values.password }));
            }
        },
    });

    return (
        <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-brand-background py-10 px-4 selection:bg-brand-primary/20 font-inter">
            {/* Top Right Toggle */}
            <div className="absolute top-10 right-10 z-50">
                <div className="bg-slate-900/60 backdrop-blur-xl border border-slate-800 p-1.5 rounded-md flex items-center gap-1 shadow-2xl">
                    <button
                        onClick={() => { setLoginRole('Standard'); loginFormik.resetForm(); }}
                        className={`px-4 py-2.5 rounded-md text-[9px] font-black uppercase tracking-[0.2em] transition-all ${loginRole === 'Standard' ? 'bg-brand-primary text-white shadow-lg shadow-brand-primary/20' : 'text-slate-500 hover:text-slate-300'}`}
                    >
                        Official
                    </button>
                    <button
                        onClick={() => { setLoginRole('Student'); loginFormik.resetForm(); }}
                        className={`px-4 py-2.5 rounded-md text-[9px] font-black uppercase tracking-[0.2em] transition-all ${loginRole === 'Student' ? 'bg-luxury-emerald text-white shadow-lg shadow-luxury-emerald/20' : 'text-slate-500 hover:text-slate-300'}`}
                    >
                        Student
                    </button>
                    <button
                        onClick={() => { setLoginRole('Parent'); loginFormik.resetForm(); }}
                        className={`px-4 py-2.5 rounded-md text-[9px] font-black uppercase tracking-[0.2em] transition-all ${loginRole === 'Parent' ? 'bg-luxury-rose text-white shadow-lg shadow-luxury-rose/20' : 'text-slate-500 hover:text-slate-300'}`}
                    >
                        Parent
                    </button>
                </div>
            </div>

            {/* Dynamic Background Elements */}
            <div className={`absolute top-[-10%] left-[-10%] w-[45%] h-[45%] ${loginRole === 'Student' ? 'bg-luxury-emerald/15' : loginRole === 'Parent' ? 'bg-luxury-rose/15' : 'bg-brand-primary/15'} rounded-md blur-[140px] animate-pulse-slow transition-colors duration-1000`}></div>
            <div className="absolute bottom-[-10%] right-[-10%] w-[45%] h-[45%] bg-brand-secondary/15 rounded-md blur-[140px] animate-pulse-slow delay-1000"></div>

            <motion.div
                key={loginRole}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="w-full max-w-xl relative z-10"
            >
                <div className={`bg-brand-surface/70 backdrop-blur-[32px] border ${loginRole === 'Student' ? 'border-luxury-emerald/30' : loginRole === 'Parent' ? 'border-luxury-rose/30' : 'border-brand-border/40'} rounded-md shadow-[0_32px_80px_-20px_rgba(0,0,0,0.6)] overflow-hidden p-8 md:p-10 transition-colors duration-500`}>
                    {/* Header */}
                    <div className="text-center mb-16">
                        <motion.div
                            initial={{ scale: 0.8, rotate: -10 }}
                            animate={{ scale: 1, rotate: 0 }}
                            className={`inline-flex items-center justify-center w-24 h-24 rounded-md bg-gradient-to-br ${loginRole === 'Student' ? 'from-luxury-emerald to-emerald-400' : loginRole === 'Parent' ? 'from-luxury-rose to-rose-400' : 'from-brand-primary to-brand-secondary'} mb-10 shadow-2xl transition-all duration-500`}
                        >
                            <LogIn className="text-white w-12 h-12" />
                        </motion.div>
                        <h1 className="text-5xl font-black text-white tracking-tighter uppercase font-outfit leading-none mb-4">
                            {loginRole === 'Student' ? 'Student Entry' : loginRole === 'Parent' ? 'Parent Access' : 'Welcome Back'}
                        </h1>
                        <p className="text-slate-400 font-medium tracking-wide text-lg opacity-80">
                            {loginRole === 'Student' ? 'Access your academic terminal' : loginRole === 'Parent' ? 'Monitor student growth & records' : 'Access your school management dashboard'}
                        </p>
                    </div>

                    {/* Login Form */}
                    <form onSubmit={loginFormik.handleSubmit} className="space-y-10">
                        {(loginRole === 'Standard' || loginRole === 'Parent') ? (
                            <div className="space-y-4">
                                <label className="text-xs text-slate-400 ml-2 tracking-[0.3em] uppercase font-black opacity-70 font-outfit">Email Address</label>
                                <div className="relative group">
                                    <div className="absolute inset-y-0 left-0 pl-6 flex items-center pointer-events-none text-slate-500 group-focus-within:text-brand-primary transition-colors">
                                        <Mail size={22} />
                                    </div>
                                    <input
                                        type="email"
                                        {...loginFormik.getFieldProps('email')}
                                        className={`w-full bg-slate-900/40 border-2 ${loginFormik.touched.email && loginFormik.errors.email ? 'border-luxury-rose/40' : 'border-brand-border/40'} focus:border-brand-primary outline-none rounded-md py-5 pl-14 pr-6 text-white text-lg placeholder-slate-700 transition-all font-inter shadow-inner`}
                                        placeholder="institutional@domain.com"
                                    />
                                </div>
                                {loginFormik.touched.email && loginFormik.errors.email && (
                                    <motion.p initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className="text-[11px] text-luxury-rose font-black ml-4 uppercase tracking-[0.1em]">{loginFormik.errors.email}</motion.p>
                                )}
                            </div>
                        ) : (
                            <div className="space-y-4">
                                <label className="text-xs text-slate-400 ml-2 tracking-[0.3em] uppercase font-black opacity-70 font-outfit">Admission Number</label>
                                <div className="relative group text-white">
                                    <div className="absolute inset-y-0 left-0 pl-6 flex items-center pointer-events-none text-slate-500 group-focus-within:text-luxury-emerald transition-colors">
                                        < Mail size={22} />
                                    </div>
                                    <input
                                        type="text"
                                        {...loginFormik.getFieldProps('admissionNumber')}
                                        className={`w-full bg-slate-900/40 border-2 ${loginFormik.touched.admissionNumber && loginFormik.errors.admissionNumber ? 'border-luxury-rose/40' : 'border-brand-border/40'} focus:border-luxury-emerald outline-none rounded-md py-5 pl-14 pr-6 text-white text-lg placeholder-slate-700 transition-all font-inter shadow-inner`}
                                        placeholder="ADM-2024-001"
                                    />
                                </div>
                                {loginFormik.touched.admissionNumber && loginFormik.errors.admissionNumber && (
                                    <motion.p initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className="text-[11px] text-luxury-rose font-black ml-4 uppercase tracking-[0.1em]">{loginFormik.errors.admissionNumber}</motion.p>
                                )}
                            </div>
                        )}

                        <div className="space-y-4">
                            <div className="flex justify-between items-center ml-2">
                                <label className="text-xs text-slate-400 tracking-[0.3em] uppercase font-black opacity-70 font-outfit">Password</label>
                                <Link to="/forgot-password" size="sm" className={`text-[11px] ${loginRole === 'Student' ? 'text-luxury-emerald hover:text-emerald-400' : 'text-brand-accent hover:text-cyan-400'} font-black uppercase tracking-widest italic outline-none hover:underline decoration-2 underline-offset-4 transition-colors`}>Lost Password?</Link>
                            </div>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-6 flex items-center pointer-events-none text-slate-500 group-focus-within:text-brand-primary transition-colors">
                                    <Lock size={22} />
                                </div>
                                <input
                                    type={showPassword ? "text" : "password"}
                                    {...loginFormik.getFieldProps('password')}
                                    className={`w-full bg-slate-900/40 border-2 ${loginFormik.touched.password && loginFormik.errors.password ? 'border-luxury-rose/40' : 'border-brand-border/40'} ${loginRole === 'Student' ? 'focus:border-luxury-emerald' : 'focus:border-brand-primary'} outline-none rounded-md py-5 pl-14 pr-16 text-white text-lg placeholder-slate-700 transition-all font-inter shadow-inner`}
                                    placeholder="••••••••"
                                    autoComplete="current-password"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute inset-y-0 right-0 pr-6 flex items-center text-slate-500 hover:text-brand-primary transition-colors outline-none"
                                >
                                    {showPassword ? <EyeOff size={22} /> : <Eye size={22} />}
                                </button>
                            </div>
                            {loginFormik.touched.password && loginFormik.errors.password && (
                                <motion.p initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className="text-[11px] text-luxury-rose font-black ml-4 uppercase tracking-[0.1em]">{loginFormik.errors.password}</motion.p>
                            )}
                        </div>

                        <div className="pt-6">
                            <button
                                type="submit"
                                disabled={loading}
                                className={`w-full relative group overflow-hidden rounded-md ${loginRole === 'Student' ? 'bg-luxury-emerald hover:bg-emerald-600' : 'bg-brand-primary hover:bg-blue-600'} disabled:opacity-70 text-white py-6 font-black tracking-[0.4em] uppercase transition-all hover:shadow-2xl active:scale-[0.98] font-outfit`}
                            >
                                <div className="relative z-10 flex items-center justify-center gap-4">
                                    {loading ? <Loader2 className="animate-spin w-6 h-6" /> : <>{loginRole === 'Student' ? 'Initialize Student Session' : 'Elevate Access'} <ArrowRight className="w-6 h-6 group-hover:translate-x-2 transition-transform" /></>}
                                </div>
                                <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                            </button>
                        </div>
                    </form>
                </div>

                <p className="text-center text-slate-600 mt-12 font-black uppercase tracking-[0.4em] text-[10px] opacity-40">Protected by Institutional Security Systems</p>
            </motion.div>
        </div>
    );
};

export default Auth;
