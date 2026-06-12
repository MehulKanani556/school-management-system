import React, { useEffect, useState } from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { useDispatch, useSelector } from 'react-redux';
import { login, studentLogin, verifyLogin2FA, clearAuthError, clearAuthMessage, clearPending2FA } from '../../redux/slice/auth.slice';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, Lock, Loader2, ArrowRight, LogIn, Eye, EyeOff } from 'lucide-react';
import { motion } from 'framer-motion';

const Auth = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { loading, error, message, isAuthenticated, pending2FAEmail } = useSelector((state) => state.auth);
    const [showPassword, setShowPassword] = useState(false);
    const [otpCode, setOtpCode] = useState('');

    // Auto-detected role based on input: 'Student' or 'Other'
    const [detectedRole, setDetectedRole] = useState('Other');

    useEffect(() => {
        if (isAuthenticated) {
            navigate('/');
        }
    }, [isAuthenticated, navigate]);

    const [rememberMe, setRememberMe] = useState(() => {
        return localStorage.getItem('remember_me') === 'true';
    });

    // Login Formik
    const loginFormik = useFormik({
        initialValues: {
            identifier: localStorage.getItem('remembered_identifier') || '',
            password: localStorage.getItem('remembered_password') || '',
        },
        validationSchema: Yup.object({
            identifier: Yup.string().required('Email or Admission Number is required'),
            password: Yup.string().required('Password is required'),
        }),
        onSubmit: (values) => {
            if (rememberMe) {
                localStorage.setItem('remembered_identifier', values.identifier);
                localStorage.setItem('remembered_password', values.password);
                localStorage.setItem('remember_me', 'true');
            } else {
                localStorage.removeItem('remembered_identifier');
                localStorage.removeItem('remembered_password');
                localStorage.setItem('remember_me', 'false');
            }

            const val = values.identifier.toUpperCase();
            // Refined detection: Starts with ADM but is NOT an email
            const isStudent = val.startsWith('ADM') && !val.includes('@');

            if (isStudent) {
                dispatch(studentLogin({ admissionNumber: values.identifier, password: values.password }));
            } else {
                dispatch(login({ email: values.identifier, password: values.password }));
            }
        },
    });

    // Handle role detection for UI themes
    useEffect(() => {
        const val = loginFormik.values.identifier.toUpperCase();
        // Refined detection: Starts with ADM but is NOT an email
        if (val.startsWith('ADM') && !val.includes('@')) {
            setDetectedRole('Student');
        } else {
            setDetectedRole('Other');
        }
    }, [loginFormik.values.identifier]);

    const getThemeColor = () => {
        return detectedRole === 'Student' ? 'luxury-emerald' : 'brand-primary';
    };

    const getTitle = () => {
        return detectedRole === 'Student' ? 'Student Entry' : 'Institutional Login';
    };

    return (
        <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-brand-background py-10 px-4 selection:bg-brand-primary/20 font-inter">
            {/* Dynamic Background Elements */}
            <div className={`absolute top-[-10%] left-[-10%] w-[45%] h-[45%] bg-${getThemeColor()}/15 rounded-md blur-[140px] animate-pulse-slow transition-colors duration-1000`}></div>
            <div className={`absolute bottom-[-10%] right-[-10%] w-[45%] h-[45%] bg-brand-secondary/15 rounded-md blur-[140px] animate-pulse-slow delay-1000`}></div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className="w-full max-w-xl relative z-10"
            >
                <div className={`bg-brand-surface/70 backdrop-blur-[32px] border border-${getThemeColor()}/30 rounded-md shadow-[0_32px_80px_-20px_rgba(0,0,0,0.6)] overflow-hidden p-8 md:p-10 transition-all duration-700`}>
                    {/* Header */}
                    <div className="text-center mb-16">
                        <div
                            className={`inline-flex items-center justify-center w-20 h-20 rounded-md bg-gradient-to-br from-${getThemeColor()} to-brand-secondary mb-8 shadow-2xl transition-all duration-700`}
                        >
                            <LogIn className="text-white w-10 h-10" />
                        </div>
                        <h1 className="text-5xl font-black text-white tracking-tighter uppercase font-outfit leading-none mb-3">
                            Welcome Back
                        </h1>
                        <p className="text-slate-400 font-medium tracking-wide text-lg opacity-80 italic">
                            Institutional Terminal Access
                        </p>
                    </div>

                    {pending2FAEmail ? (
                        <form
                            onSubmit={(e) => {
                                e.preventDefault();
                                dispatch(verifyLogin2FA({ email: pending2FAEmail, otp: otpCode }));
                            }}
                            className="space-y-8"
                        >
                            <p className="text-center text-slate-400 text-sm">
                                Enter the 6-digit code sent to <span className="text-white font-bold">{pending2FAEmail}</span>
                            </p>
                            <input
                                type="text"
                                maxLength={6}
                                value={otpCode}
                                onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
                                className="w-full bg-slate-900/40 border-2 border-brand-border/40 rounded-md py-5 px-6 text-white text-center text-2xl tracking-[0.5em] outline-none"
                                placeholder="000000"
                            />
                            {error && <p className="text-[11px] text-luxury-rose text-center font-black uppercase">{error}</p>}
                            <button type="submit" disabled={loading || otpCode.length < 4} className="w-full bg-brand-primary text-white py-5 rounded-md font-black uppercase tracking-widest disabled:opacity-50">
                                {loading ? <Loader2 className="animate-spin mx-auto" /> : 'Verify & Sign In'}
                            </button>
                            <button
                                type="button"
                                onClick={() => { dispatch(clearPending2FA()); setOtpCode(''); }}
                                className="w-full text-slate-500 hover:text-slate-300 text-[11px] font-black uppercase tracking-widest transition-colors pt-2"
                            >
                                ← Back To Login
                            </button>
                        </form>
                    ) : (
                    <form onSubmit={loginFormik.handleSubmit} className="space-y-10">
                        <div className="space-y-4 text-left">
                            <label className="text-xs text-slate-400 ml-2 tracking-[0.3em] uppercase font-black opacity-70 font-outfit">Identity Pointer</label>
                            <div className="relative group">
                                <div className={`absolute inset-y-0 left-0 pl-6 flex items-center pointer-events-none text-slate-500 group-focus-within:text-${getThemeColor()} transition-colors`}>
                                    <Mail size={22} />
                                </div>
                                <input
                                    type="text"
                                    {...loginFormik.getFieldProps('identifier')}
                                    className={`w-full bg-slate-900/40 border-2 ${loginFormik.touched.identifier && loginFormik.errors.identifier ? 'border-luxury-rose/40' : `border-brand-border/40 focus:border-${getThemeColor()}`} outline-none rounded-md py-5 pl-14 pr-6 text-white text-lg placeholder-slate-700 transition-all font-inter shadow-inner`}
                                    placeholder="Institutional ID or Email"
                                />
                            </div>
                            {loginFormik.touched.identifier && loginFormik.errors.identifier && (
                                <motion.p initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className="text-[11px] text-luxury-rose font-black ml-4 uppercase tracking-[0.1em]">{loginFormik.errors.identifier}</motion.p>
                            )}
                        </div>

                        <div className="space-y-4 text-left">
                            <div className="flex justify-between items-center ml-2">
                                <label className="text-xs text-slate-400 tracking-[0.3em] uppercase font-black opacity-70 font-outfit">Security Hash</label>
                                <Link to="/forgot-password" size="sm" className={`text-[11px] text-${getThemeColor() === 'luxury-emerald' ? 'emerald-500' : 'blue-500'} hover:opacity-80 font-black uppercase tracking-widest italic outline-none hover:underline decoration-2 underline-offset-4 transition-all`}>Lost Key?</Link>
                            </div>
                            <div className="relative group">
                                <div className={`absolute inset-y-0 left-0 pl-6 flex items-center pointer-events-none text-slate-500 group-focus-within:text-${getThemeColor()} transition-colors`}>
                                    <Lock size={22} />
                                </div>
                                <input
                                    type={showPassword ? "text" : "password"}
                                    {...loginFormik.getFieldProps('password')}
                                    className={`w-full bg-slate-900/40 border-2 ${loginFormik.touched.password && loginFormik.errors.password ? 'border-luxury-rose/40' : `border-brand-border/40 focus:border-${getThemeColor()}`} outline-none rounded-md py-5 pl-14 pr-16 text-white text-lg placeholder-slate-700 transition-all font-inter shadow-inner`}
                                    placeholder="••••••••"
                                    autoComplete="current-password"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className={`absolute inset-y-0 right-0 pr-6 flex items-center text-slate-500 hover:text-${getThemeColor()} transition-colors outline-none`}
                                >
                                    {showPassword ? <EyeOff size={22} /> : <Eye size={22} />}
                                </button>
                            </div>
                            {loginFormik.touched.password && loginFormik.errors.password && (
                                <motion.p initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className="text-[11px] text-luxury-rose font-black ml-4 uppercase tracking-[0.1em]">{loginFormik.errors.password}</motion.p>
                            )}
                            <div className="flex items-center justify-between px-2 mt-4">
                                <label className="flex items-center gap-3 cursor-pointer group">
                                    <input
                                        type="checkbox"
                                        checked={rememberMe}
                                        onChange={(e) => setRememberMe(e.target.checked)}
                                        className={`w-4 h-4 rounded bg-slate-900/40 border-2 border-brand-border/40 text-${getThemeColor()} focus:ring-0 cursor-pointer`}
                                    />
                                    <span className="text-xs text-slate-400 font-bold uppercase tracking-wider group-hover:text-slate-200 transition-colors">Remember Me</span>
                                </label>
                            </div>
                        </div>

                        {error && (
                            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="bg-luxury-rose/10 border border-luxury-rose/20 p-4 rounded-md text-center">
                                <p className="text-[11px] text-luxury-rose font-black uppercase tracking-widest">{error}</p>
                            </motion.div>
                        )}

                        <div className="pt-6">
                            <button
                                type="submit"
                                disabled={loading}
                                className={`w-full relative group overflow-hidden rounded-md bg-${getThemeColor()} disabled:opacity-70 text-white py-6 font-black tracking-[0.4em] uppercase transition-all duration-700 hover:shadow-2xl active:scale-[0.98] font-outfit`}
                            >
                                <div className="relative z-10 flex items-center justify-center gap-4">
                                    {loading ? <Loader2 className="animate-spin w-6 h-6" /> : <>Initialize Session <ArrowRight className="w-6 h-6 group-hover:translate-x-2 transition-transform" /></>}
                                </div>
                                <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                            </button>
                        </div>
                    </form>
                    )}
                </div>

                <p className="text-center text-slate-600 mt-12 font-black uppercase tracking-[0.4em] text-[10px] opacity-40">Protected by Institutional Security Systems</p>
            </motion.div>
        </div>
    );
};

export default Auth;
