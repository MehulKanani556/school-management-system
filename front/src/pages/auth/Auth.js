import React, { useEffect, useState } from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { useDispatch, useSelector } from 'react-redux';
import { login, clearMessage } from '../../redux/slice/auth.slice';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, Lock, Loader2, ArrowRight, LogIn, Eye, EyeOff } from 'lucide-react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';

const Auth = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { loading, error, message, isAuthenticated } = useSelector((state) => state.auth);
    const [showPassword, setShowPassword] = useState(false);
    
    useEffect(() => {
        if (isAuthenticated) {
            navigate('/');
        }
    }, [isAuthenticated, navigate]);

    useEffect(() => {
        if (message) {
            toast.success(message, { id: 'auth-success' });
            dispatch(clearMessage());
        }
        if (error) {
            toast.error(error, { id: 'auth-error' });
            dispatch(clearMessage());
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

    return (
        <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-brand-background py-10 px-4 selection:bg-brand-primary/20 font-inter">
            {/* Dynamic Background Elements */}
            <div className="absolute top-[-10%] left-[-10%] w-[45%] h-[45%] bg-brand-primary/15 rounded-full blur-[140px] animate-pulse-slow"></div>
            <div className="absolute bottom-[-10%] right-[-10%] w-[45%] h-[45%] bg-brand-secondary/15 rounded-full blur-[140px] animate-pulse-slow delay-1000"></div>

            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-xl relative z-10"
            >
                <div className="bg-brand-surface/70 backdrop-blur-[32px] border border-brand-border/40 rounded-[3.5rem] shadow-[0_32px_80px_-20px_rgba(0,0,0,0.6)] overflow-hidden p-8 md:p-10">
                    {/* Header */}
                    <div className="text-center mb-16">
                        <motion.div 
                            initial={{ scale: 0.8, rotate: -10 }}
                            animate={{ scale: 1, rotate: 0 }}
                            className="inline-flex items-center justify-center w-24 h-24 rounded-[2rem] bg-gradient-to-br from-brand-primary to-brand-secondary mb-10 shadow-[0_20px_40px_-10px_rgba(37,99,235,0.35)]"
                        >
                            <LogIn className="text-white w-12 h-12" />
                        </motion.div>
                        <h1 className="text-5xl font-black text-white tracking-tighter uppercase font-outfit leading-none mb-4">Welcome Back</h1>
                        <p className="text-slate-400 font-medium tracking-wide text-lg opacity-80">Access your school management dashboard</p>
                    </div>

                    {/* Login Form */}
                    <form onSubmit={loginFormik.handleSubmit} className="space-y-10">
                        <div className="space-y-4">
                            <label className="text-xs text-slate-400 ml-2 tracking-[0.3em] uppercase font-black opacity-70 font-outfit">Email</label>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-6 flex items-center pointer-events-none text-slate-500 group-focus-within:text-brand-primary transition-colors">
                                    <Mail size={22} />
                                </div>
                                <input
                                    type="email"
                                    {...loginFormik.getFieldProps('email')}
                                    className={`w-full bg-slate-900/40 border-2 ${loginFormik.touched.email && loginFormik.errors.email ? 'border-luxury-rose/40' : 'border-brand-border/40'} focus:border-brand-primary outline-none rounded-3xl py-5 pl-14 pr-6 text-white text-lg placeholder-slate-700 transition-all font-inter shadow-inner`}
                                    placeholder="Enter your email"
                                />
                            </div>
                            {loginFormik.touched.email && loginFormik.errors.email && (
                                <motion.p initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className="text-[11px] text-luxury-rose font-black ml-4 uppercase tracking-[0.1em]">{loginFormik.errors.email}</motion.p>
                            )}
                        </div>

                        <div className="space-y-4">
                            <div className="flex justify-between items-center ml-2">
                                <label className="text-xs text-slate-400 tracking-[0.3em] uppercase font-black opacity-70 font-outfit">Password</label>
                                <Link to="/forgot-password" size="sm" className="text-[11px] text-brand-accent font-black hover:text-cyan-400 uppercase tracking-widest italic outline-none hover:underline decoration-2 underline-offset-4">Lost Password?</Link>
                            </div>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-6 flex items-center pointer-events-none text-slate-500 group-focus-within:text-brand-primary transition-colors">
                                    <Lock size={22} />
                                </div>
                                <input
                                    type={showPassword ? "text" : "password"}
                                    {...loginFormik.getFieldProps('password')}
                                    className={`w-full bg-slate-900/40 border-2 ${loginFormik.touched.password && loginFormik.errors.password ? 'border-luxury-rose/40' : 'border-brand-border/40'} focus:border-brand-primary outline-none rounded-3xl py-5 pl-14 pr-16 text-white text-lg placeholder-slate-700 transition-all font-inter shadow-inner`}
                                    placeholder="••••••••"
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
                                className="w-full relative group overflow-hidden rounded-[2rem] bg-brand-primary disabled:opacity-70 text-white py-6 font-black tracking-[0.4em] uppercase transition-all hover:bg-blue-500 hover:shadow-[0_20px_40px_-10px_rgba(37,99,235,0.4)] active:scale-[0.98] font-outfit"
                            >
                                <div className="relative z-10 flex items-center justify-center gap-4">
                                    {loading ? <Loader2 className="animate-spin w-6 h-6" /> : <>Elevate Access <ArrowRight className="w-6 h-6 group-hover:translate-x-2 transition-transform" /></>}
                                </div>
                                <div className="absolute inset-0 bg-gradient-to-r from-blue-400/20 to-brand-secondary/30 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                            </button>
                        </div>
                    </form>
                </div>
                
                <p className="text-center text-slate-600 mt-12 font-black uppercase tracking-[0.4em] text-[10px] opacity-40">Protected by Academic Security Systems</p>
            </motion.div>
        </div>
    );
};

export default Auth;
