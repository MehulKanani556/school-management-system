import React, { useEffect, useState } from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { useDispatch, useSelector } from 'react-redux';
import { resetPassword, clearAuthMessage, clearAuthError } from '../../redux/slice/auth.slice';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { Lock, Loader2, ArrowRight, Eye, EyeOff, KeyRound } from 'lucide-react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';

const ResetPassword = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const email = searchParams.get('email');
    const { loading, error, message } = useSelector((state) => state.auth);
    const [showPassword, setShowPassword] = useState(false);

    useEffect(() => {
        if (!email) navigate('/forgot-password');
    }, [email, navigate]);

    useEffect(() => {
        if (message === 'Password Changed SuccessFully...') {
            toast.success('Security identity reconfigured. You may now proceed to authenticate.');
            navigate('/login');
            dispatch(clearAuthMessage());
        }
        if (error) {
            toast.error(error);
            dispatch(clearAuthError());
        }
    }, [message, error, navigate, dispatch]);

    const formik = useFormik({
        initialValues: { password: '', confirmPassword: '' },
        validationSchema: Yup.object({
            password: Yup.string()
                .min(6, 'Minimum 6 characters')
                .required('Required'),
            confirmPassword: Yup.string()
                .oneOf([Yup.ref('password'), null], 'Passwords must match')
                .required('Required'),
        }),
        onSubmit: (values) => {
            dispatch(resetPassword({ email, newPassword: values.password }));
        },
    });

    return (
        <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-slate-950 py-10 px-4 font-inter">
            {/* High-Spec Background */}
            <div className="absolute top-0 right-1/4 w-[700px] h-[700px] bg-red-600/5 blur-[120px] rounded-full animate-pulse-slow"></div>
            <div className="absolute bottom-0 left-1/4 w-[700px] h-[700px] bg-indigo-600/5 blur-[120px] rounded-full animate-pulse-slow"></div>

            <motion.div
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                className="w-full max-w-md relative z-10"
            >
                <div className="bg-slate-900/60 backdrop-blur-2xl border border-white/5 rounded-3xl p-8 shadow-2xl">
                    <div className="text-center mb-10">
                        <div className="group relative inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-indigo-400 text-white mb-6 shadow-lg shadow-indigo-500/30 overflow-hidden">
                            <KeyRound size={40} />
                            <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>
                        </div>
                        <h2 className="text-3xl font-black text-white mb-2 uppercase tracking-tight">Set New Hash</h2>
                        <p className="text-slate-400 text-sm italic font-medium">Define your new access credentials for terminal authorization.</p>
                    </div>

                    <form onSubmit={formik.handleSubmit} className="space-y-6">
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-[10px] uppercase tracking-[0.3em] font-black text-slate-500 ml-1">New Hash Pin</label>
                                <div className="relative group">
                                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-indigo-500 transition-colors" size={20} />
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        {...formik.getFieldProps('password')}
                                        className="w-full bg-slate-800/50 border border-white/5 focus:border-indigo-500 outline-none rounded-xl py-4 pl-12 pr-12 text-white font-mono placeholder-slate-800 transition-all shadow-inner"
                                        placeholder="••••••••"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white transition-colors"
                                    >
                                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                    </button>
                                </div>
                                {formik.touched.password && formik.errors.password && (
                                    <p className="text-[10px] text-red-500 font-bold uppercase tracking-wider ml-1">{formik.errors.password}</p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] uppercase tracking-[0.3em] font-black text-slate-500 ml-1">Confirm Identity Hash</label>
                                <div className="relative group">
                                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-indigo-500 transition-colors" size={20} />
                                    <input
                                        type="password"
                                        {...formik.getFieldProps('confirmPassword')}
                                        className="w-full bg-slate-800/50 border border-white/5 focus:border-indigo-500 outline-none rounded-xl py-4 pl-12 pr-4 text-white font-mono placeholder-slate-800 transition-all shadow-inner"
                                        placeholder="••••••••"
                                    />
                                </div>
                                {formik.touched.confirmPassword && formik.errors.confirmPassword && (
                                    <p className="text-[10px] text-red-500 font-bold uppercase tracking-wider ml-1">{formik.errors.confirmPassword}</p>
                                )}
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-indigo-600 text-white py-5 rounded-xl font-black uppercase tracking-[0.3em] text-xs flex items-center justify-center gap-3 hover:bg-indigo-500 transition-all active:scale-[0.98] shadow-lg shadow-indigo-600/30 disabled:opacity-50"
                        >
                            {loading ? <Loader2 className="animate-spin" size={20} /> : <>Commence Encryption <ArrowRight size={20} /></>}
                        </button>

                        <div className="text-center pt-4">
                            <Link to="/login" className="text-[10px] text-slate-600 hover:text-indigo-400 transition-colors uppercase tracking-[0.4em] font-black italic">Return to Access Point</Link>
                        </div>
                    </form>
                </div>
            </motion.div>
        </div>
    );
};

export default ResetPassword;
